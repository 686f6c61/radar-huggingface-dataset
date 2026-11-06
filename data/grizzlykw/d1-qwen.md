# Grizzlykw/d1-qwen

## Resumen

d1-qwen es un modelo experimental de decisión textual desarrollado por el usuario Grizzlykw sobre el backbone de Qwen3-0.6B. No es un modelo generativo: en lugar de producir tokens de respuesta, incorpora una cabeza lineal de compatibilidad que lee la representación del último token de entrada del backbone y devuelve decisiones estructuradas (sí/no, elección entre opciones, puntuación ordinal). El backbone original de Qwen permanece congelado y solo se entrena la cabeza, de tan solo 1.025 parámetros.

El modelo sigue la API de la porción de clasificación de texto de LiquidAI d1-2B, aunque es una implementación independiente que no reutiliza pesos de LiquidAI ni reclama sus resultados de benchmark. Su interés radica en explorar una vía alternativa a la generación autoregresiva para tareas de enrutamiento, clasificación y decisión, con un coste computacional muy bajo y sin generación de tokens de salida.

Con 596 millones de parámetros totales, licencia Apache 2.0 y un límite de entrada de 512 tokens por fila de candidato, se posiciona como un punto de partida ("starter model") para experimentación, no como un sustituto validado de d1 en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B congelado) con cabeza lineal de compatibilidad entrenada |
| Parametros totales | 596.050.945 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por fila de candidato (incluye plantilla de chat y pregunta); configurable via `config.decision_max_length` |
| Tipos de cuantizacion | no disponible como cuantizacion de pesos publicada; el backbone admite FP16/FP32/BF16 en funcion del hardware; empaquetado FP16 en CPU |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3-0.6B, cuyos pesos permanecen completamente congelados. Sobre la representación del último token de entrada del backbone se aplica una cabeza lineal de compatibilidad de 1.025 parámetros, inicializada con la dirección de embedding de salida Yes-menos-No de Qwen. Las características del backbone se extraen en el dispositivo seleccionado: en CPU con pesos lineales empaquetados en FP16 y activaciones FP32; en CUDA por defecto con autocast FP16 (FP32 tambien disponible, BF16 requiere hardware compatible); en MPS con FP32. La cabeza y las perdidas agrupadas operan en FP32.

El entrenamiento utiliza los splits JSONL de decisiones suministrados, cuyos tamanos, resultados medidos y hashes se registran en `training_report.json`, y los metadatos de origen en `dataset_manifest.json`. El proyecto incluye ademas un starter sintetico de referencia con 320 decisiones de entrenamiento y 80 por split de validacion. Se emplea entropia cruzada para elecciones exclusivas y entropia cruzada binaria para decisiones independientes, con una penalizacion por desviacion respecto a la cabeza inicial. Una perdida de calibracion selecciona el checkpoint de la cabeza y una temperatura escalar; el split de test nunca participa en la seleccion de parametros. El checkpoint incluye backbone, cabeza entrenada, tokenizer, codigo de modelo personalizado, licencia, datos de entrenamiento e informe.

## Capacidades

- Decisiones de tipo `noul`: devuelve la etiqueta `noul` y una probabilidad de "si".
- Decisiones de tipo `choice`: recibe un diccionario de descripciones nombradas y devuelve `choice`, `confidence` y `probabilities`; con `multiple: True` produce probabilidades independientes y una lista `choices` con umbral 0.5.
- Decisiones de tipo `score`: recibe de 2 a 10 descripciones ordenadas de menor a mayor y devuelve el nivel mediano como `score` cero-indexado, su `confidence`, probabilidades y una `legend`.
- Procesamiento por lotes mediante `system_one_batch([(state, questions), ...])`, que agrupa peticiones en un unico forward pass.
- Acepta estados en texto o como valor JSON.
- No dispone de cabeza generativa de lenguaje, ni de extraccion de spans de texto, numeros o fechas, ni de estimacion numerica, vision, video, audio o bounding boxes.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar un mensaje entrante en equipos (billing, shipping, technical, account) mediante una decision `choice` con criterios descritos, aprovechando que el modelo devuelve probabilidades para umbralizar o derivar a revision humana.
- Filtrado binario previo a un LLM generativo: usar decisiones `noul` para descartar o marcar mensajes (por ejemplo, "¿trata sobre cobros?") antes de invocar un modelo mayor, reduciendo coste y latencia en pipelines.
- Priorizacion ordinal de incidencias: con el tipo `score`, asignar niveles de severidad o urgencia a partir de descripciones ordenadas, util en colas de triaje.
- Moderacion o etiquetado de contenido: decisiones binarias e independientes (`multiple: True`) para marcar multiples categorias sobre un mismo texto sin generar explicaciones.
- Extraccion de senales estructuradas en ETL: clasificar registros JSON o campos de texto en categorias predefinidas dentro de un proceso batch, con `system_one_batch` para agrupar peticiones.
- Experimentacion academica sobre cabezas de decision: al mantener el backbone congelado y entrenar solo 1.025 parametros, sirve como banco de pruebas reproducible para estudiar calibracion y decisiones sin generacion.
- Clasificacion de intenciones en asistentes conversacionales: determinar la intencion del usuario entre un conjunto cerrado de opciones antes de despachar la logica de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `training_report.json` contiene resultados medidos de baseline y modelo entrenado, hashes de datos, epoca seleccionada y temperatura, pero no se proporcionan los valores numericos en la informacion disponible. El autor advierte que los resultados de calibracion son optimistas porque el mismo split selecciona checkpoint y temperatura, y que los resultados Brier solo son validos para comparacion dentro de la misma ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 596 millones de parametros, en FP16 el backbone ocupa aproximadamente 1,2 GB de pesos, y el repo completo pesa 2,2 GB.
- GPU recomendadas: no especificadas por el autor; el modelo documenta rutas para CPU, CUDA (FP16/FP32/BF16) y MPS (FP32).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del backbone, aunque el autor no publica requisitos minimos ni cifras de VRAM medidas.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La memoria crece con el numero de candidatos porque el estado se repite por cada fila, por lo que el autor recomienda dividir cargas grandes en varias llamadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grizzlykw/d1-qwen | 596 M | 512 tokens por fila | Cabeza de decision sobre backbone congelado | apache-2.0 | Hugging Face |
| LiquidAI/d1-2B | no disponible en la informacion | no disponible en la informacion | Modelo de decision de referencia | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3-0.6B | no disponible en la informacion | no disponible en la informacion | LLM generativo base | no disponible en la informacion | Hugging Face |

La comparacion con d1-2B es limitada: d1-qwen adopta su API de clasificacion de texto pero es una implementacion independiente sin pesos de LiquidAI y sin reclamar su rendimiento en benchmarks. Frente a Qwen3-0.6B, la diferencia fundamental es que d1-qwen no genera texto, sino que devuelve decisiones estructuradas.

## Limitaciones y advertencias

- Modelo starter experimental: el autor indica explicitamente que no es un sustituto validado de d1 y que una buena precision en el split de test suministrado no demuestra generalizacion a mensajes reales, preguntas arbitrarias, otros idiomas u otros dominios.
- Las probabilidades requieren validacion y calibracion sobre los datos reales de despliegue.
- Limite de entrada de 512 tokens por fila de candidato, incluyendo plantilla de chat y pregunta; entradas mas largas lanzan un error en lugar de truncar silenciosamente. Aumentar `config.decision_max_length` no garantiza precision.
- Solo idioma ingles declarado.
- Sin cabeza generativa de lenguaje ni capacidades multimodales; los tipos no soportados y los medios lanzan errores.
- La memoria crece con el numero de candidatos porque el estado se repite por cada fila, lo que limita el batching en cargas grandes.
- Sin descargas ni likes en el momento de la consulta, y sin resultados de benchmark publicados en la informacion disponible; no hay evidencia externa de calidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de idoneidad para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Grizzlykw/d1-qwen
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Referencia de API (LiquidAI d1): https://huggingface.co/LiquidAI/d1-2B
