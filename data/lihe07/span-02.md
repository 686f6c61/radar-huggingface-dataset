# lihe07/span-02

## Resumen

Span-02 es un modelo de decisión (decision model) desarrollado por Respan (usuario de Hugging Face `lihe07`/`respanai`) y publicado como un fine-tune de `google/gemma-4-26B-A4B-it`. A diferencia de un modelo generativo convencional, Span-02 no devuelve texto libre: recibe un estado (texto o JSON, más hasta 4 imágenes) y una serie de preguntas tipadas, y devuelve para cada una una distribución de probabilidad calibrada sobre las respuestas posibles. Los tipos de pregunta soportados son `choice` (entre 1 y 679 opciones), `noul` (sí/no como probabilidad), `score` (escala ordenada de 2 a 10 niveles) y `number` (valor numérico con texto asociado).

El modelo se apoya en la arquitectura MoE de Gemma 4 26B-A4B (aproximadamente 4B de parámetros activos sobre 15.815.134.090 parámetros totales según los safetensors publicados) y se distribuye cuantizado en NVFP4/FP8 con un peso de repositorio de 16,4 GB. La innovación principal no está en los pesos sino en el motor de inferencia: incluye un motor propio escrito en Rust/CUDA (`engine/`) que lee directamente las probabilidades de las etiquetas de respuesta en un único forward pass, y solo activa un breve razonamiento (con presupuesto temporal, 700 ms por defecto, y decodificación especulativa) cuando la respuesta principal queda por debajo de 0,8 de confianza.

Su relevancia actual radica en la latencia: según la model card, alcanza una puntuación de 62,6 en el Decision Index (puesto 4, empatado con otros cuatro modelos) con una latencia mediana de 33 ms y p95 de 822 ms sobre una RTX PRO 6000, respondiendo el 100% de 110.201 peticiones. Está pensado para tareas de enrutamiento, clasificación y extracción de decisiones en producción donde la latencia y la calibración importan más que la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (fine-tune de google/gemma-4-26B-A4B-it) |
| Parametros totales | 15.815.134.090 |
| Parametros activos | ~4B (según model card, "~4B active parameters") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, FP8 (8-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con license_link a la licencia de Gemma 4) |
| Formato de pesos | safetensors (cuantizados NVFP4/FP8), motor propio Rust/CUDA |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 16,4 GB |
| Descargas / likes | 717 / 29 |
| Fecha de creación / actualización | 2026-10-13 / 2026-10-16 |

## Arquitectura y entrenamiento

Span-02 es un fine-tune del modelo MoE `google/gemma-4-26B-A4B-it`, con unos 15,8 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token. Los pesos se distribuyen cuantizados en NVFP4 y FP8 (8-bit), lo que reduce el repositorio a 16,4 GB y permite servirlo en una única GPU Blackwell. La model card no detalla la composición del dataset de fine-tune, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible.

La innovación técnica reside en el modo de inferencia: en lugar de generar texto y parsearlo, el motor realiza un forward pass por pregunta y lee directamente las probabilidades de las etiquetas de las opciones (choice, noul, score, number). El estado compartido se calcula una sola vez por petición. Si la respuesta principal tiene una probabilidad inferior a 0,8, el modelo genera un pensamiento breve, vuelve a leer y promedia ambas distribuciones; estos pensamientos tienen un presupuesto temporal configurable (700 ms por defecto) y emplean decodificación especulativa. El motor propio está escrito en Rust sobre CUDA 12.8+/12.9 y no es compatible con `transformers` ni con vLLM, según advierte explícitamente la model card.

## Capacidades

- Respuesta tipada con distribución de probabilidad calibrada: `choice` (1 a 679 opciones con `confidence` y `probabilities`), `noul` (probabilidad de sí), `score` (nivel esperado sobre una escala ordenada de 2 a 10 niveles) y `number` (valor numérico con texto y confianza).
- Entrada multimodal: acepta hasta 4 imágenes en base64 (PNG/JPG) junto al estado textual o JSON.
- Razonamiento condicional: modo `auto`, `on` u `off`, con presupuesto temporal de 0 a 600.000 ms y traza opcional del pensamiento.
- Procesamiento de estado como datos, no como instrucciones (el campo `state` se trata como dato, lo que mitiga inyección de prompt en el estado).
- API compatible con TypeSafe System One API (`POST /v1/systemone`, `GET /health`), de modo que los clientes existentes funcionan sin cambios.
- Latencia baja: la mayoría de peticiones se resuelven en decenas de milisegundos; mediana de 33 ms en la configuración de referencia.
- No soporta generación de texto libre ni tool calling clásico; su salida es exclusivamente estructurada y tipada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del cliente como `state` y una pregunta `choice` con los equipos disponibles (`returns`, `shipping`, `billing`), devolviendo la opción con su distribución de probabilidad. La latencia de decenas de milisegundos permite clasificar en tiempo real dentro del flujo de atención.
- Clasificación binaria de intención: con preguntas `noul` (por ejemplo, "¿el cliente pide un reembolso?") se obtiene directamente la probabilidad de verdadero, sin necesidad de parsear texto ni de umbrales heurísticos sobre cadenas.
- Puntuación de riesgo o calidad: las preguntas `score` con escalas de 2 a 10 niveles permiten obtener un nivel esperado y su ley de probabilidad, útil para priorización de colas o scoring de leads con calibración explícita.
- Extracción de valores numéricos: la pregunta `number` devuelve un valor con texto asociado y confianza, adecuada para extraer importes, cantidades o fechas de documentos estructurados en JSON.
- Moderación y triaje multimodal: al aceptar hasta 4 imágenes, puede clasificar incidencias con captura (por ejemplo, paquetes dañados) junto con la descripción textual, devolviendo la categoría con probabilidad.
- Decisión con razonamiento acotado: en casos ambiguos, el modo `auto` activa un pensamiento breve con presupuesto temporal (700 ms por defecto) y decodificación especulativa, lo que permite mantener el SLA del servicio sin renunciar a precisión en los casos difíciles.
- Automatización de back-office con JSON: al tratar el `state` como dato y devolver respuestas tipadas, encaja en pipelines deterministas donde la salida se consume directamente por otro servicio sin etapa de parsing.

## Benchmarks y rendimiento

| Resultado oficial (1 × RTX PRO 6000) | Valor |
|---|---|
| Full score (Decision Index) | 62,6 (puesto 4, empatado con otros 4 modelos) |
| Latencia mediana | 33 ms |
| Latencia p95 | 822 ms |
| Peticiones respondidas | 100% (110.201 de 110.201) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 16,4 GB en NVFP4/FP8; se necesita margen adicional para el motor CUDA y el estado compartido, por lo que no se recomienda por debajo de 24 GB.
- GPU recomendadas: RTX PRO 6000 o RTX 5090 (Blackwell), según la model card. El motor requiere CUDA 12.9 para el contenedor Docker y CUDA 12.8+ para la compilación nativa.
- Cabe en GPU de consumo: sí, en RTX 5090 (Blackwell). No hay indicación de soporte para generaciones anteriores (Ampere, Ada) en la información disponible.
- Despliegue: exclusivamente mediante el motor incluido en `engine/` (Rust/CUDA). No es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI según la propia model card. Se ofrece imagen Docker (`docker build -t span-02 .`) y arranque nativo con `cargo build --release -p dllm-server` y `bash launch.sh`.
- Latencia y throughput: mediana de 33 ms y p95 de 822 ms en la configuración de referencia (1 × RTX PRO 6000); el arranque del servicio tarda unos 20 s hasta que `GET /health` devuelve `{"ok": true}`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Span-02 | 15,8B totales / ~4B activos | no disponible | Decision model con salida tipada y motor propio | Apache-2.0 | Hugging Face, motor propio |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos (según nombre) | no disponible | Modelo generativo multimodal base | Gemma 4 | Hugging Face |
| TypeSafe System One (API) | no disponible | no disponible | API de decisión tipada (referencia de compatibilidad) | no disponible | API comercial |

La información disponible no incluye comparativas de rendimiento con alternativas de la misma categoría (decision models). La única referencia cuantitativa es el Decision Index, donde Span-02 obtiene 62,6 y figura en el puesto 4 empatado con otros cuatro modelos, pero no se detallan los nombres ni las puntuaciones de esos modelos.

## Limitaciones y advertencias

- El modelo no genera texto libre: cualquier caso de uso que requiera respuestas abiertas, resúmenes o conversación multi-turno queda fuera de su alcance.
- Dependencia total del motor propio: no funciona con `transformers`, vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y obliga a usar la imagen Docker o compilar el motor Rust/CUDA.
- Requiere hardware Blackwell (RTX PRO 6000 o RTX 5090) y CUDA 12.9; no hay información sobre soporte en GPUs anteriores ni en CPU.
- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación por idioma; los idiomas soportados figuran como no disponibles.
- La licencia declarada es Apache-2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los términos de Gemma 4 antes de un uso comercial, ya que pueden imponer restricciones adicionales sobre el modelo base.
- El umbral de confianza de 0,8 para activar el razonamiento y el presupuesto de 700 ms son valores por defecto; en producción conviene calibrarlos según el SLA y el coste.
- El estado se trata como dato, lo que reduce pero no elimina el riesgo de manipulación del contenido de entrada en escenarios adversarios.
- El código 529 indica servidor ocupado; los clientes deben implementar reintentos con backoff.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), lo que dificulta la comparación con modelos generativos convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lihe07/span-02
- Blog de anuncio: https://www.respan.ai/blog/introducing-span-2
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Documentación de la API System One de TypeSafe: https://docs.typesafe.ai/api
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
