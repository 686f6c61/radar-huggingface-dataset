# cklxx/laya-browser

## Resumen

laya-browser es un ajuste fino del modelo de decisiones `convaiinnovations/laya`, un modelo "System 1" no autorregresivo que no genera texto: realiza una única pasada de codificador bidireccional para responder varias preguntas tipadas (`choice`, `score`, `noul`) con probabilidades calibradas. El repositorio lo publica el usuario cklxx y convierte ese modelo base, que rinde prácticamente al azar en decisiones de navegador (top-1 de 0,10 entre unos 45 candidatos), en una cabeza de decisión utilizable como reemplazo directo del componente TypeSafe Jev de `browser-use/jev-ultrafast`, cuyo formato de petición `/v1/systemone` es idéntico a `predict(state, questions)` de laya.

El repositorio incluye dos checkpoints: `v10`, construido sobre ModernBERT-large (421 M de parámetros, formato de entrada v2 y `head_max_len` 768), orientado a máxima precisión, y `v10s`, construido sobre mmBERT-base (322 M de parámetros, formato v3 y `head_max_len` 768), orientado a latencia mínima. Ambos se entrenaron íntegramente en local sobre una única RTX 4070 Ti SUPER de 16 GB, sin APIs de pago: el generador de texto auxiliar y el profesor DAgger fueron un Qwen3-8B-AWQ servido con sglang.

Su relevancia actual reside en que demuestra que una cabeza de decisión pequeña y especializada puede superar a un LLM generalista de 8 B en la tarea concreta de decidir el siguiente elemento a pulsar en una página web, con latencias de decenas de milisegundos por paso, y en que publica tanto el pipeline de ajuste como los resultados negativos (qué enfoques no funcionaron), algo poco habitual en fichas de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador bidireccional tipo transformer no autorregresivo ("System 1"); v10 sobre ModernBERT-large, v10s sobre mmBERT-base |
| Parametros totales | v10: 421 M; v10s: 322 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No es un modelo generativo con ventana de contexto clásica. `head_max_len` entrenado: 768 tokens (frente a 512 del laya original). El laya original truncaba la entrada con una ventana de 1024 tokens. El estado conserva título, URL, historial y entre 1,2 y 1,5 k caracteres de texto; los elementos de la página viven solo en la lista de opciones |
| Tipos de cuantizacion | No disponible. No se documentan cuantizaciones publicadas del modelo; la ruta rápida TileLang mantiene los pesos residentes en bf16 |
| Idiomas soportados | En y multilingüe (declarados en la model card; el backbone mmBERT de v10s aporta la componente multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors. Cada checkpoint es un directorio laya con `model.safetensors`, `encoder/`, `tokenizer/` y `rl_agent_config.json` (la configuración registra `laya_fmt` y `head_max_len_train`) |

## Arquitectura y entrenamiento

El modelo no genera texto: recibe un estado (título, URL, historial y texto de la página) y una lista de opciones candidatas (elementos con etiqueta completa, rol y valor actual) y devuelve respuestas tipadas con probabilidades calibradas. El backbone es un codificador transformer bidireccional: ModernBERT-large de 421 M en `v10` y mmBERT-base de 322 M en `v10s`. La innovación de formato respecto al laya original es sustituir el volcado del estado de jev (tabla de elementos en JSON dentro del estado, truncada por la ventana de 1024 tokens) por los formatos v2/v3, en los que los elementos residen únicamente en la lista de opciones y el estado conserva título, URL, historial y 1,2-1,5 k caracteres de texto, con `head_max_len` ampliado de 512 a 768.

El ajuste se hizo con la receta RLCD de laya (gradiente de política sobre logits ruidosos más entropía cruzada suave), en una sola GPU, sin gradient checkpointing, durante 4 épocas (aproximadamente 2 horas para v10 y 1 hora para v10s) y con ajuste de temperatura a posteriori. El conjunto de datos combina 5.244 objetivos generados de forma inversa sobre 421 páginas rastreadas (Qwen escribe el objetivo que un usuario enunciaría para necesitar cada elemento), 700 estados DONE reales procedentes de clics efectivamente ejecutados, 659 negativos de segundo paso, el split de entrenamiento de Mind2Web (7.296 pasos, con candidatos re-renderizados como tabla de elementos) y 177 correcciones DAgger on-policy. Para la inferencia existe una ruta rápida opcional con TileLang (PR #25 al repositorio de laya) que fusiona GEMM/GEGLU/LayerNorm/RoPE, aplica atención flash con ventana deslizante, mantiene los pesos en bf16 y usa CUDA graphs, con una reducción de latencia de 4 a 5 veces por llamada y respuestas idénticas.

## Capacidades

- Decisión de siguiente acción en navegador: selecciona el elemento a pulsar entre decenas de candidatos (hasta 65 opciones en las pruebas citadas) dada una meta en lenguaje natural.
- Clasificación de operación tipada: distingue CLICK, TYPE_TEXT, SELECT y DONE sobre el estado actual de la página.
- Puntuación calibrada con preguntas de tipo `choice` / `score` / `noul`, sin generación de texto.
- Integración directa con `browser-use/jev-ultrafast` mediante el endpoint `/v1/systemone`, con formato de petición idéntico a `predict(state, questions)`.
- Compatibilidad multilingüe en la variante v10s (backbone mmBERT-base); v10 está apoyado en ModernBERT, de base inglesa.
- Rechazo de acciones (clase `noul`) y detección de finalización de tarea (DONE).
- No dispone de tool calling, function calling, agentes multi-paso autónomos, visión, audio ni modo de razonamiento explícito: es una cabeza de decisión de un solo paso, no un modelo de propósito general.

## Casos de uso

- Automatización de navegación web con agentes: sustituir la capa de decisión de `jev-ultrafast` para elegir el siguiente elemento a pulsar, con 17-23 ms por paso en v10s, lo que permite iteraciones de agente muy rápidas sin coste de API.
- Rellenado de formularios y campos de búsqueda: el modelo distingue TYPE_TEXT del resto de operaciones con una precisión de operación de 0,88, por lo que puede decidir cuándo escribir texto y sobre qué campo (verificado con el caso "TYPE_TEXT → [2] Search Wikipedia (searchbox)").
- Extracción de datos estructurados por recorrido de páginas: usando la decisión DONE para detener el recorrido al alcanzar la página objetivo, con 700 ejemplos reales de finalización en el entrenamiento que reducen los falsos positivos de parada.
- Selección de opciones en desplegables y menús: maneja la operación SELECT sobre sitios vistos, útil en portales de administración y back-offices con formularios repetitivos.
- Ejecución de tareas de navegación en inglés o en entornos multilingües (v10s): atención a sitios localizados donde la etiqueta del elemento y el texto de la página no están en inglés.
- Filtrado previo de candidatos en pipelines de scraping a gran escala: al resolver la decisión en decenas de milisegundos y requerir muy poca VRAM, puede actuar como primera etapa que descarte acciones y delegue en un System 2 solo los casos ambiguos.
- Evaluación y test de interfaces web: recorrer flujos de usuario de forma automática para detectar regresiones en la navegación, apoyándose en la velocidad por paso para cubrir muchas rutas.
- Investigación sobre cabezas de decisión especializadas: el repositorio incluye el pipeline de ajuste, el servidor systemone, la suite de tareas y los kernels TileLang, lo que permite reproducir la receta sobre dominios propios.

## Benchmarks y rendimiento

No se han publicado resultados en la informacion disponible para benchmarks estándar de LLM (MMLU, HumanEval, GSM8K u otros). Los datos publicados corresponden a la evaluación específica de decisión en navegador, medida sobre 16 tareas reales × 3 ejecuciones y sobre 2.734 decisiones en páginas no vistas con unos 45 candidatos:

| Metrica | laya original | v10 (421 M) | v10s (322 M) |
|---|---|---|---|
| Calidad de decisión en navegador (16 tareas × 3 ejecuciones) | 0 % | 58 % | 50 % |
| Top-1 de elemento en páginas no vistas (2.734 decisiones, ~45 candidatos) | 0,10 | 0,66 | 0,63 |
| Precisión de operación (CLICK / TYPE_TEXT / SELECT / DONE) | 0,54 | 0,88 | 0,88 |
| Latencia por paso (3 preguntas, 30-65 candidatos) | 50-200 ms | 41-50 ms | 17-23 ms |

Medición adicional verificada desde entorno limpio en una RTX 4070 Ti SUPER el 21 de septiembre de 2026: 35 ms por paso en stock y 28 ms con la ruta rápida sobre un paso de 65 opciones y 2,5 k tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia aritmética a partir del número de parámetros, los pesos en bf16 ocupan aproximadamente 0,85 GB para v10 (421 M) y 0,65 GB para v10s (322 M); con activaciones de secuencias de hasta 768 tokens más la lista de opciones, el consumo total debería mantenerse en el rango de 1,5-3 GB. Cifra orientativa, no confirmada en la documentación.
- GPU recomendadas: no se especifican requisitos oficiales. El autor entrenó y verificó todo el proyecto en una única RTX 4070 Ti SUPER de 16 GB, por lo que cualquier GPU consumer con al menos esa VRAM es suficiente; también es viable en GPUs de datacenter (A100, H100) aunque no aportan ventaja apreciable dado el tamaño del modelo.
- Cabe en GPU consumer: sí, con holgura. Una RTX 4090, 4070 Ti SUPER, 3090 o incluso tarjetas con 8 GB deberían poder ejecutarlo, siempre según las estimaciones anteriores.
- Opciones de despliegue: inferencia con HuggingFace Transformers en modo eager con autocast; ruta rápida opcional con TileLang (kernels fusionados, atención flash con ventana deslizante, CUDA graphs); servidor systemone incluido en `code/`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y previsiblemente no aplican al no ser un modelo autorregresivo generativo.
- Latencia y throughput: 41-50 ms por paso en v10 y 17-23 ms en v10s para 3 preguntas y 30-65 candidatos; 35 ms en stock y 28 ms con la ruta rápida en un paso de 65 opciones y 2,5 k tokens medido en una RTX 4070 Ti SUPER. La ruta TileLang reduce la latencia por llamada entre 4 y 5 veces respecto a la ejecución eager.
- Dependencias del entorno verificado: Python 3.12, torch 2.11, tilelang 0.1.14, gestionadas con uv y `uv.lock` fijado.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría (cabezas de decisión para agentes de navegador) más allá de las variantes incluidas en este mismo repositorio y del modelo base. La comparación disponible es interna:

| Modelo | Parametros | Backbone | Formato de entrada | Calidad de decision | Top-1 elemento | Latencia por paso | Licencia |
|---|---|---|---|---|---|---|---|
| laya-browser v10 | 421 M | ModernBERT-large | v2, head_max_len 768 | 58 % | 0,66 | 41-50 ms | Apache 2.0 |
| laya-browser v10s | 322 M | mmBERT-base | v3, head_max_len 768 | 50 % | 0,63 | 17-23 ms | Apache 2.0 |
| convaiinnovations/laya (original) | 421 M | ModernBERT-large | estado de jev truncado a 1024 tokens | 0 % | 0,10 | 50-200 ms | No disponible en la informacion proporcionada |
| Qwen3-8B-AWQ como System 2 con escalado por confianza | 8 B | LLM generativo | — | 42 % en el mismo conjunto de 16 tareas | No disponible | No disponible | No disponible en la informacion proporcionada |

El dato destacable es que el escalado a un modelo generalista de 8 B guiado por confianza empeoró el resultado (de 58 % a 42 %) en estas páginas, según el propio autor.

## Limitaciones y advertencias

- Flujos multi-paso del tipo "escribir y luego enviar" o "elegir una sugerencia" fallan de forma sistemática.
- Cualquier tarea que requiera desplazamiento previo de la página falla: el conjunto de entrenamiento no contiene muestras de scroll.
- El elemento `<select>` falla en sitios no vistos durante el entrenamiento.
- Los flujos largos, como la reserva en Google Flights, quedan fuera de su alcance.
- El lector DOM de jev oculta por diseño los campos de contraseña, de modo que las tareas de inicio de sesión son imposibles; tampoco ve menús colapsados (por ejemplo, el enlace "Random article" de Wikipedia).
- Riesgo de alucinación de acción: al ser un clasificador sobre candidatos, no inventa texto, pero puede seleccionar un elemento incorrecto con alta confianza; las probabilidades están calibradas pero no se documenta una curva de fiabilidad.
- Sesgos: dependen del corpus de rastreo (421 páginas) y de Mind2Web; no se documenta ningún análisis de sesgo demográfico, de idioma o de dominio.
- Idiomas: la variante v10 está apoyada en ModernBERT, de base inglesa, y la model card declara únicamente en y multilingüe sin detallar cobertura por idioma; para uso fuera del inglés se recomienda validar v10s.
- Licencia Apache 2.0, por lo que el uso comercial está permitido; conviene revisar las licencias del modelo base y de Mind2Web antes de redistribuir derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue publicado el 21 de septiembre de 2026, sin validación externa independiente de los resultados.
- Los pesos requieren aplicar la transformación de formato correspondiente (`laya_fmt` y `head_max_len_train` del `rl_agent_config.json`) antes de servir peticiones; obviarla degrada las respuestas.
- El ajuste de temperatura es a posteriori y específico de cada checkpoint; no se documentan los valores concretos en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cklxx/laya-browser
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio del agente de destino: https://github.com/browser-use/jev-ultrafast
- Dataset de entrenamiento Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web
- PR #25 al repositorio de laya con la ruta rápida TileLang: https://github.com/NandhaKishorM/laya/pull/25
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos corresponden a páginas de soporte de Microsoft sin relación con el modelo.
