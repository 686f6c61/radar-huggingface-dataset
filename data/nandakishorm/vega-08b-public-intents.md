# nandakishorm/vega-08b-public-intents

## Resumen

Vega 0.8B (public intents) es un modelo de decisión tipada (typed decisions) desarrollado por nandakishorm, distribuido bajo licencia Apache 2.0 y publicado en Hugging Face. No es un modelo generativo al uso: se trata de un modelo no autorregresivo construido sobre el backbone congelado de Qwen/Qwen3.5-0.8B, al que se le superpone un pequeño "motor" entrenado de aproximadamente 57 MB (14,3 millones de parámetros) más adaptadores específicos de tarea. El modelo recibe un estado (texto o imagen) y emite una respuesta tipada: una elección entre opciones (`choice`), una probabilidad de que un enunciado sea verdadero (`boolean`) o una puntuación (`score`), con probabilidades calibradas.

El problema que resuelve es el coste y la latencia de usar un LLM generativo para decisiones rutinarias de clasificación o enrutamiento. Vega está pensado como una capa de "system one" que decide en milisegundos (22 ms por decisión en el modelo 0.8B, 0.267 s/decisión en una T4 con fp16) y que puede colocarse delante de un LLM mayor para absorber las decisiones repetitivas. Su contexto declarado es de 73.728 tokens, con un lector de memoria que trocea estados largos en 16 segmentos, y admite imágenes a través del codificador visual del backbone congelado.

La relevancia actual reside en la combinación de tamaño reducido, contexto largo, calibración explícita (error de calibración de 0,026 en el split de test de `LocalLLaMA/typed-decisions`) y soporte de predicción conforme, lo que permite umbrales de confianza con garantías estadísticas. El repositorio incluye dos tamaños (0.8B en la raíz y 4B en `4b/`) que comparten la misma interfaz de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión no autorregresivo sobre backbone transformer congelado (Qwen3.5-0.8B, 24 capas, d=1024) más motor de decisión entrenado y adaptadores de tarea |
| Parametros totales | 14.342.512 parámetros entrenados (motor, 57 MB) + 835.937 (adaptador de tarea) sobre backbone congelado de 0,8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 73.728 tokens (el backbone soporta 262.144 posiciones rotatorias) |
| Tipos de cuantizacion | No disponible (la model card cita fp16 en T4 y fp32 en Apple M-series; no se listan formatos de cuantización) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 para pesos y paquete `vegaml`; `vegaml-learn` bajo PolyForm Noncommercial 1.0.0 (uso comercial requiere licencia aparte) |
| Formato de pesos | No disponible (repositorio de 0,2 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

Vega no entrena el modelo de lenguaje: el backbone Qwen3.5-0.8B está congelado y fijado por SHA-256. Todo el aprendizaje reside en un motor de decisión de 14,3 millones de parámetros (57 MB) más un adaptador de tarea de 835.937 parámetros, descrito en el artículo "From Laya to Vega: Open Non-Autoregressive Decision Models with Calibrated Probabilities". La arquitectura es explícitamente no autorregresiva: no genera tokens, sino que produce una distribución calibrada sobre respuestas tipadas (`choice`, `boolean`, `score`).

Entre las innovaciones técnicas destacadas están el almacenamiento en caché de prefijo de lectura única (un estado de al menos 4.096 tokens se procesa una vez con KV cache y las preguntas posteriores continúan desde una copia), un lector de memoria que divide estados largos en 16 fragmentos con mean-pooling en la capa de características más profunda, y el rechazo explícito de entradas que no caben en contexto en lugar de truncarlas silenciosamente. La calibración se aborda mediante predicción conforme, y la model card menciona además aprendizaje continuo y "landscape learning" en el paquete `vegaml-learn`. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Clasificación de texto con salida tipada: elección entre opciones (`choice`), probabilidad de veracidad de un enunciado (`boolean`) y puntuación (`score`).
- Probabilidades calibradas con error de calibración de 0,026 (0.8B) y 0,019 (4B) en el split de test de `LocalLLaMA/typed-decisions`.
- Predicción conforme para umbrales de confianza con garantías estadísticas.
- Procesamiento de contexto largo de hasta 73.728 tokens con caché de prefijo de lectura única.
- Entrada multimodal: imágenes a través del codificador visual del backbone congelado (`vega_vision.py`).
- Decisiones de baja latencia: 22 ms por decisión (0.8B) y 28 ms (4B) según la model card; 0,267 s/decisión en T4 con fp16.
- Interfaz de código unificada para ambos tamaños mediante `vegaml.load()` y `vegaml.load("4b")`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: el modelo clasifica el mensaje del usuario entre un conjunto fijo de intenciones (`choice`) con probabilidad calibrada, permitiendo derivar al agente o flujo adecuado y escalar a un LLM mayor solo cuando la confianza es baja.
- Clasificación de tickets y correos: asignación de categoría sobre textos largos (hilos completos de hasta 73k tokens) aprovechando la caché de prefijo para responder varias preguntas sobre el mismo documento sin releerlo.
- Filtro previo a un LLM generativo (patrón proxy): Vega absorbe las decisiones rutinarias en unos 22 ms y deja pasar al LLM las que no superan el umbral de confianza, reduciendo coste por token en pipelines de producción.
- Moderación y verificación de afirmaciones: uso de la salida `boolean` para estimar la probabilidad de que un enunciado cumpla una política o sea verdadero, con calibración que permite fijar umbrales operativos.
- Extracción de señales en documentos con imágenes: clasificación de formularios, capturas o páginas escaneadas combinando el codificador visual del backbone con el motor de decisión.
- Evaluación de riesgo y scoring: uso de la salida `score` para puntuar ítems (por ejemplo, relevancia de resultados de búsqueda o prioridad de incidencias) con distribución calibrada.
- Automatización de decisiones en el propio proceso del desarrollador: integración embebida en la aplicación (57 MB de motor) sin depender de una API externa, útil en entornos con requisitos de privacidad o latencia estricta.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el split de test de `LocalLLaMA/typed-decisions` (2.050 decisiones), comparando los dos tamaños del repositorio:

| Metrica | 0.8B | 4B |
|---|---|---|
| Accuracy con adaptador de tarea | 0,763 | 0,803 |
| Soft accuracy | 0,680 | 0,725 |
| Brier | 0,314 | 0,270 |
| Error de calibración | 0,026 | 0,019 |
| Latencia por decisión | 22 ms | 28 ms |

Rendimiento por workflow (con adaptador):

| Workflow | 0.8B | 4B |
|---|---|---|
| apibank | 0,895 | 0,965 |
| when2call | 0,904 | 0,946 |
| appliances | 0,851 | 0,891 |
| banking77 | 0,714 | 0,749 |
| esci | 0,564 | 0,644 |
| clinc150 | 0,880 | 0,867 |

La model card menciona además una comparación contra "un referente alojado" (hosted reference) ejecutada el 2026-10-11 sobre dos Tesla T4 con 3.841 decisiones por sistema, pero no se incluyen en la información disponible las cifras completas de esa comparación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB y el motor entrenado pesa 57 MB (0.8B) o 124 MB (4B), a lo que se suma el backbone congelado de 0,8B o 4B parámetros.
- GPU recomendadas: la model card valida inferencia en una sola Tesla T4 (fp16) y menciona ejecución en Apple M-series (fp32, 0,28 s por decisión).
- GPU de consumo: el tamaño del motor y del backbone de 0,8B hace plausible su ejecución en GPUs de consumo, aunque la información disponible solo confirma T4 y Apple Silicon; no se aportan cifras para RTX 4090 u otras.
- Opciones de despliegue: paquete propio `vegaml` (con `vega_vision.py` para imágenes) y un proxy autoalojado en `vegaml-learn`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 22 ms por decisión (0.8B) y 28 ms (4B) según la model card; 0,267 s/decisión en T4 fp16 y 0,28 s en Apple M-series. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vega 0.8B (este) | 0,8B backbone congelado + 14,3M entrenados | 73.728 tokens | Decisión no autorregresiva calibrada | Apache 2.0 (pesos) | Hugging Face |
| Vega 4B (mismo repo) | 4B backbone congelado + 30,9M entrenados | 73.728 tokens | Decisión no autorregresiva calibrada | Apache 2.0 (pesos) | Hugging Face (`4b/`) |
| Qwen3.5-0.8B (backbone) | 0,8B | No disponible en la información | LLM generativo | No disponible en la información | Hugging Face |
| LLM generativo alojado (referencia citada) | No disponible | No disponible | Generación autorregresiva | Propietaria | API |

La información disponible no permite comparar con clasificadores dedicados de tamaño similar (por ejemplo, DeBERTa o ModernBERT) ni aporta cifras de terceros; esas comparaciones figuran como no disponibles.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre; solo responde en los formatos `choice`, `boolean` y `score`.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe más allá de la del backbone.
- Riesgo de alucinación en el sentido de calibración: aunque el error de calibración es bajo (0,026/0,019), las probabilidades no son garantías deterministas y deben validarse en el dominio de despliegue.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Restricciones de licencia: los pesos y `vegaml` son Apache 2.0, pero `vegaml-learn` (aprendizaje continuo, teacher loop y proxy autoalojado) es PolyForm Noncommercial 1.0.0; su uso en empresa, producto o servicio de pago requiere licencia comercial.
- Dependencia del backbone Qwen3.5-0.8B congelado y fijado por SHA-256; cualquier cambio de backbone implica reentrenar el motor.
- Rechazo de entradas fuera de contexto: no hay truncamiento silencioso, pero los inputs que exceden 73.728 tokens fallan en lugar de procesarse parcialmente.
- El rendimiento medido varía mucho por workflow (de 0,564 en esci a 0,965 en apibank con el 4B), por lo que la viabilidad depende del dominio concreto.
- Formatos de pesos y opciones de cuantización no documentados; la integración está ligada al paquete `vegaml`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nandakishorm/vega-08b-public-intents
- Artículo: https://doi.org/10.20944/preprints202611.0781.v1
- Plataforma y proxy: https://platform.embedding.in
- Documentación: https://platform.embedding.in/docs
- Sitio del autor: https://embedding.in
- Licencia comercial: https://embedding.in/licence
- Contacto: nandakishor@embedding.in
- Cuaderno Colab: https://colab.research.google.com/drive/1ZxS_Ee4-oyfo8ePKiAgbehv5I1Rh3F7O?usp=sharing
- Backbone: https://huggingface.co/Qwen/Qwen3.5-0.8B
