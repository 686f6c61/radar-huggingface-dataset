# alexwkleung/Raon-1-nano-Abliterated-GGUF

## Resumen

Raon-1-nano-Abliterated es una versión modificada del modelo denso KRAFTON/Raon-1-nano (3.130.811.440 parámetros), un modelo de razonamiento que emplea una arquitectura de residual mHC de 4 flujos, con 18 capas de atención lineal RDA y 6 capas MLA NoPE. La modificación consiste en una ablación de rango arbitrario (Arbitrary-Rank Ablation) aplicada con la herramienta Heretic 2.1 sobre 20 tensores, con el objetivo de reducir la tasa de rechazos del modelo original. No se ha reentrenado ningún otro componente.

El autor, alexwkleung, distribuye exclusivamente pesos en formato GGUF cuantizados con el fork de llama.cpp de KRAFTON, ya que la arquitectura `raon1nano` no está soportada por llama.cpp upstream. El modelo conserva los conocimientos del original: la ablación elimina una dirección de rechazo, pero no añade información nueva. Es relevante para desarrolladores que necesiten evaluar el comportamiento de un modelo pequeño con razonamiento explícito cuando se eliminan los mecanismos de negativa, y para quienes trabajen con arquitecturas híbridas de atención lineal.

La ficha se basa únicamente en la model card del autor y en los metadatos de Hugging Face. Varios apartados (idiomas, benchmarks generales, requisitos exactos de hardware) quedan marcados como no disponibles por falta de datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con residual mHC de 4 flujos, 18 capas de atención lineal RDA y 6 capas MLA NoPE |
| Parametros totales | 3.130.811.440 (3,1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | No disponible (la model card menciona respuestas en coreano del modelo original) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); requiere el fork de KRAFTON |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 3,1B parámetros que combina dos mecanismos de atención: 18 capas de atención lineal RDA y 6 capas MLA (Multi-head Latent Attention) sin codificación posicional (NoPE). Sobre esta columna vertebral se apoya un residual mHC de 4 flujos. El modelo original incorpora un modo de razonamiento explícito (`enable_thinking`) y una cabeza MTP (Multi-Token Prediction) que, según la model card, fue entrenada contra el tronco original y por ello no se incluye en esta variante GGUF (conversión con `--no-mtp`).

La modificación de esta build es una ablación de rango arbitrario ejecutada con Heretic 2.1, que alteró 20 tensores para reducir la dirección de rechazo. No hubo reentrenamiento adicional: los tensores no ablacionados son idénticos byte a byte a los del Q8_0 publicado por KRAFTON, según la verificación del autor con lecturas por rangos en capas 0, 3, 11, 22 y 23. La cuantización se realizó con el `llama-quantize` del fork de KRAFTON a partir de un único GGUF F16 convertido con `--no-mtp`, sin imatrix; el fork mantiene algunos tensores de Raon en mayor precisión de forma automática. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento activable (`enable_thinking`).
- Razonamiento matemático: en GSM8K con n=100 y pensamiento activado obtiene 93/100 aciertos, con una media de 690 tokens por respuesta.
- Respuesta a peticiones que el modelo original rechazaba: en el conjunto de prueba de 44 prompts, la tasa de rechazo baja de 44/44 a 0/44, aunque aproximadamente 32 respuestas cumplen, 5-7 desvían la petición y 5-7 responden de forma genérica o con salvedades.
- Multilingüismo: no documentado; el modelo original produce respuestas en coreano, y la model card señala que la versión ablacionada no generó coreano en las pruebas realizadas.
- Tool calling y function calling: no evaluado en esta build.
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Capacidad especial: modo de pensamiento con presupuesto de tokens configurable (1536 tokens con pensamiento desactivado y 8192 con pensamiento activado en las pruebas del autor).

## Casos de uso

- Evaluación de mecanismos de rechazo en modelos pequeños: permite comparar el comportamiento del modelo original y de la variante ablacionada sobre el mismo conjunto de prompts, con la misma semilla y parámetros de muestreo, para estudiar cómo se distribuyen las respuestas entre cumplimiento, desvío y respuestas genéricas.
- Investigación sobre alineación y seguridad: útil para analizar el fenómeno de que los rechazos actúan también como señales de cautela, de modo que su eliminación produce respuestas fluidas en dominios donde el modelo de 3,1B no es fiable.
- Razonamiento matemático en entornos con recursos limitados: con 93/100 en GSM8K y un GGUF Q4_K_M de 1,94 GiB, puede desplegarse en equipos de gama media para resolver problemas aritméticos de varios pasos con pensamiento activado.
- Pruebas de arquitecturas híbridas de atención: sirve para validar el soporte de las capas RDA y MLA NoPE en el fork de llama.cpp de KRAFTON, así como para medir el rendimiento de la atención lineal en comparación con transformers convencionales.
- Generación de texto conversacional en local: con cuantizaciones de 1,94 a 3,16 GiB, es viable en portátiles y estaciones de trabajo sin GPU dedicada de gran capacidad, siempre que se compile el fork requerido.
- Análisis de derivas en modelos ablacionados: la model card documenta que, con pensamiento activado, el bloque de razonamiento queda vacío en 42 de 44 prompts del conjunto de prueba, lo que permite estudiar cómo la ablación afecta a la activación del modo de pensamiento según el tipo de petición.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor corresponden a GSM8K y al conjunto de rechazos, medidos sobre Q8_0 con muestreo temp 1.0 / top-p 0.95 / top-k 20 y semilla fija por ítem.

| Benchmark | Modelo original (stock) | Abliterated | Notas |
|---|---|---|---|
| GSM8K, n=100, thinking on | 93/100, 700 tokens medios, 0 truncados | 93/100, 690 tokens medios, 1 truncado | McNemar exacto p = 1.000; n=100 no descarta regresiones de 2-3 pp |
| Rechazos, thinking off (44 prompts) | 44/44 rechazados | 0 rechazados; ~32 cumplen, ~7 desvían, ~5 genéricas | Conjunto `mlabonne/harmful_behaviors` test[60:] |
| Rechazos, thinking on (44 prompts) | 44/44 rechazados | 0 rechazados; ~32 cumplen, ~5 desvían, ~7 genéricas | Presupuesto de 8192 tokens |
| Longitud media de respuesta | 89 tokens (off) / 225 tokens (on) | 341 tokens (off) / 357 tokens (on) | Ninguna respuesta alcanzó el presupuesto |

No se han publicado resultados de MMLU, tareas en coreano, código, contexto largo ni bucles agénticos o de tool calling en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GiB con Q4_K_M (1,94 GiB en disco), 3-4 GiB con Q6_K (2,46 GiB) y 4-5 GiB con Q8_0 (3,16 GiB), incluyendo overhead del runtime. Cifras orientativas; no publicadas por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU con 6 GiB o más de VRAM debería alojar las cuantizaciones disponibles.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores, así como en equipos con CPU y suficiente RAM.
- Opciones de despliegue: exclusivamente llama.cpp con el fork de KRAFTON, rama `raon-1-nano-preview`, compilada y probada en el commit `4d72ff0`. No es compatible con llama.cpp upstream ni, por tanto, con Ollama, vLLM o TGI en sus versiones estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raon-1-nano-Abliterated (este) | 3,1B denso | No disponible | Apache 2.0 | GGUF (fork KRAFTON) | Ablación sobre Raon-1-nano; requiere fork de llama.cpp |
| KRAFTON/Raon-1-nano | 3,1B denso | No disponible | Apache 2.0 (según metadatos del derivado) | Safetensors y GGUF (Q4_K_M, Q6_K, Q8_0) | Modelo original con rechazos activos; GSM8K 93/100 |
| Alternativas de ~3B con razonamiento | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se han identificado en la información disponible otros modelos comparables con datos verificables de rendimiento, contexto y licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La ablación elimina la dirección de rechazo, pero no aporta conocimiento: el modelo sabe lo mismo que el original y responde con fluidez en dominios donde es poco fiable.
- Aproximadamente una cuarta parte de las respuestas a peticiones problemáticas sustituyen la tarea por una versión más segura o se mantienen vagas, incluso sin rechazar explícitamente.
- Con pensamiento activado, el bloque de razonamiento queda vacío en 42 de 44 prompts del conjunto de prueba; el modo de pensamiento sigue funcionando en matemáticas, por lo que el efecto parece específico de ese tipo de peticiones.
- A 3,1B parámetros, las respuestas suelen ser esquemas genéricos en lugar de detalle experto.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de MMLU, código, contexto largo ni tareas agénticas.
- Idiomas soportados no documentados; el modelo original responde en coreano y la variante ablacionada no produjo coreano en las pruebas del autor, lo que sugiere un posible sesgo hacia el inglés en la muestra evaluada.
- Licencia Apache 2.0, que permite uso comercial, pero el autor declara explícitamente que KRAFTON no produjo, respaldó ni revisó esta build, y que el usuario es responsable del contenido generado y de la legislación aplicable.
- Requiere compilar el fork de llama.cpp de KRAFTON; no funciona con llama.cpp upstream ni con los runtimes estándar, lo que limita su integración en producción.
- Solo se evaluó la cuantización Q8_0; el resto de cuantizaciones no han sido validadas por el autor.
- No incluye cabeza MTP, ya que fue entrenada contra el tronco original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexwkleung/Raon-1-nano-Abliterated-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Fork de llama.cpp de KRAFTON (rama `raon-1-nano-preview`): https://github.com/krafton-ai/llama.cpp/tree/raon-1-nano-preview
- Heretic: https://github.com/p-e-w/heretic
- Conjunto de evaluación de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
