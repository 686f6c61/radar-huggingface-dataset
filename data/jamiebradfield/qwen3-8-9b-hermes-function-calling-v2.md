# JamieBradfield/qwen3.8-9b-hermes-function-calling-v2

## Resumen
Qwen3.8-9B Hermes FC es un fine-tune por QLoRA del modelo Empero/Qwen3.8-9B, una destilación de Qwen3.5 con arquitectura híbrida, 9.195 millones de parámetros densos y una ventana de contexto de 262.144 tokens. El modelo lo publica JamieBradfield (Jameson Bradfield) como artefacto de investigación centrado en el comportamiento de llamada a herramientas (function calling) en modelos de la clase 9B. Resuelve, en teoría, la necesidad de un modelo pequeño que planifique en varios pasos y emita llamadas a herramientas estructuradas dentro de flujos de agente.

La relevancia del repositorio no está en su rendimiento bruto, sino en la documentación honesta de un fallo metodológico: el autor reconoce que el harness de evaluación usado para certificar el checkpoint no reproducía la interfaz nativa de herramientas de Hermes (parámetro `tools` de la API de OpenAI), sino que incrustaba los esquemas en el texto de sistema y exigía XML en crudo. Ese reconocimiento, junto con la publicación de scripts y sondas de reproducción, convierte el modelo en un caso de estudio sobre cómo medir (y malmedir) la competencia en tool calling.

El checkpoint publicado corresponde al paso 200 de 246 planificados (86% del entrenamiento), con una pérdida de 0,131. Los pesos son un merge completo en BF16 (13 shards, 18,4 GB) más una cuantización GGUF ROCmFPX en un repositorio compañero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con cabeza MTP (multi-token prediction) de 15 claves |
| Parametros totales | 9.195.119.616 (9,20B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (ventana del modelo base); entrenamiento con MAX_SEQ 4.096 (v1) y 6.144 (v2) |
| Tipos de cuantizacion | BF16 (merge completo), GGUF ROCmFPX (repo compañero); QLoRA 4-bit durante el entrenamiento |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 13 shards, 18,4 GB); GGUF en repo separado |
| Vocabulario | 248.079 tokens (248.077 base + `<|tool_call|>` y `<|tool_response|>`) |
| Parametros entrenables | 0,32% (embeddings congelados) |
| Torre visual | eliminada (modelo solo texto) |

## Arquitectura y entrenamiento
El modelo base es una destilación de Qwen3.5 con arquitectura híbrida y una cabeza de predicción multi-token (MTP) que el merge preserva intacta. El fine-tune se aplica como QLoRA de 4 bits sobre el merge del modelo v27 (que ya incorporaba los tokens de herramienta y el envelope), con rango 16, alpha 16, dropout 0, objetivos q/k/v/o/gate/up/down_proj, learning rate 2e-4, warmup 0,1, batch efectivo 8 y 8 épocas sobre 214 pasos. La pérdida final registrada es 0,02085 y la media de entrenamiento 0,09405.

Los datos de entrenamiento son 218 trayectorias en formato ShareGPT generadas por GLM-5.3-Flash mediante el router de Hugging Face, a partir de 112 tareas sintéticas extraídas del corpus de agentes del autor. Incluyen 190 trayectorias de profesor (85% verificadas por ejecución en sandbox, con inyección de recuperación de fallos en el 15,8% de las filas), 61 filas con cadena de pensamiento corta destilada, 159 solo con envelope y 12 tareas sintéticas de búsqueda web. Las sondas de evaluación se mantuvieron vírgenes, sin solapamiento con generación ni entrenamiento. El dataset completo se publica aparte (`hermes-fc-v28-data`); los datos originales del autor no se publican por contener información privada.

La innovación técnica destacable no es arquitectónica sino metodológica: el autor documenta en un addendum del 3 de septiembre de 2026 que el harness de certificación medía una interfaz sintética. La comparación corregida, usando la ruta nativa de herramientas con la misma batería de 4 herramientas y decodificación greedy, muestra que el modelo base ya llama herramientas correctamente por sí solo (18/20 en tier-1), mientras que este checkpoint baja a 17/20 en tier-1 y 10/20 en coincidencia de nombre, pero sube de 3/10 a 8/10 en planificación todo-first de varios pasos. Los costes son regresiones en contención: sobre-disparo en tier-3 de 5/10 a 9/10 y deriva de herramienta en trivialidades de 0/10 a 4/10.

## Capacidades
- Generación de texto conversacional multi-turno, con contexto nativo de hasta 262.144 tokens.
- Llamada a herramientas (tool calling) y uso de funciones, con dos tokens dedicados añadidos al vocabulario (`<|tool_call|>`, `<|tool_response|>`).
- Planificación todo-first en tareas de varios pasos: la única capacidad que la línea de fine-tune demuestra haber añadido de forma medible (3/10 en base, 8/10 en este checkpoint, 10/10 en el retrain limpio armB2).
- Razonamiento de cadena corta destilado en 61 de las filas de entrenamiento.
- Ejecución de tareas sintéticas de búsqueda web (12 tareas en el dataset).
- No soporta visión: la torre visual del modelo base fue eliminada en el merge.
- Capacidad multilingüe limitada al inglés según la model card.
- No hay modo thinking explícito documentado ni soporte de audio.

## Casos de uso
- Investigación sobre comportamiento de tool calling: el modelo sirve como artefacto controlado para comparar interfaces de evaluación (esquemas incrustados en el prompt frente al parámetro `tools` nativo) y medir cómo cambia la tasa de disparo de herramientas según la forma del prompt.
- Prototipado de agentes con planificación explícita: para flujos donde el agente debe invocar primero una herramienta de tipo `todo` antes de actuar, el checkpoint muestra 8/10 de acierto en la sonda tier-2, lo que lo hace utilizable en demos de planificación multi-paso.
- Reproducción de experimentos de QLoRA: los scripts, sondas (`todo_probes.jsonl`, `no_drift_probes.jsonl`) y el dataset separado permiten replicar el pipeline completo de fine-tune sobre un modelo de 9B con una sola GPU de 24 GB en 4 bits.
- Estudio de regresiones por sobre-entrenamiento: con 8 épocas sobre 218 trayectorias, el modelo evidencia sobre-disparo de herramientas en consultas triviales (4/10), lo que lo convierte en un caso práctico para analizar el equilibrio entre sensibilidad y contención en SFT.
- Despliegue local en GGUF: la cuantización ROCmFPX del repo compañero permite ejecutarlo con llama.cpp u Ollama a `CTX=65536` para igualar la configuración de servido usada en la evaluación corregida.
- Base para comparativas de destilación: al conservar la cabeza MTP y el vocabulario extendido, sirve para medir el impacto de la destilación de Qwen3.5 en tareas de agente frente al modelo profesor.

## Benchmarks y rendimiento
La model card no presenta resultados de MMLU, HumanEval, GSM8K ni similares. Lo que publica es una batería propia de 4 herramientas con decodificación greedy sobre la ruta nativa de herramientas, corregida tras el addendum:

| Modelo | tier-1 disparadas | tier-1 nombre=todo | tier-2 todo-first | tier-3 disparadas (objetivo 0) | tier-4 disparadas (objetivo 0) |
|---|---|---|---|---|---|
| base sin fine-tune | 18/20 | 17/20 | 3/10 | 5/10 | 0/10 |
| v28 ckpt-175 (este modelo) | 17/20 | 10/20 | 8/10 | 9/10 | 4/10 |
| armB2-175 (retrain limpio) | 10/20 | 8/20 | 10/10 | 4/10 | 0/10 |

No se han publicado resultados de benchmarks estandarizados en la información disponible. La evaluación independiente del checkpoint está declarada como incompleta por el propio autor.

## Requisitos de hardware
- VRAM estimada en BF16: aproximadamente 18,4 GB de pesos más overhead de activaciones y caché KV; en la práctica requiere 24 GB o más para contexto corto y bastante más para contextos largos.
- VRAM estimada en GGUF ROCmFPX: no disponible con cifra exacta; al ser una cuantización de un modelo de 9,2B, cabe en GPUs consumer de 12-16 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto corto o GGUF con contexto extendido.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y equivalentes de 24 GB en BF16 con contexto limitado; en GPUs de 12-16 GB solo vía GGUF cuantizado.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y Ollama para el GGUF, vLLM y TGI como alternativas no verificadas en la información disponible.
- Latencia y throughput: no disponibles. La configuración de servido de referencia usa `CTX=65536`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-9B Hermes FC (este) | 9,20B densos | 262.144 | Sí, con tokens dedicados; planificación todo-first 8/10 | Apache 2.0 | Pesos BF16 + GGUF |
| Empero/Qwen3.8-9B-Distill (base) | 9,20B densos | 262.144 | Sí, nativo; tier-1 18/20 y contención perfecta en tier-4 | Apache 2.0 | Hugging Face |
| armB2-175 (retrain limpio del autor) | 9,20B densos | 262.144 | Planificación todo-first 10/10, pero sobre-supresión tier-1 10/20 | Apache 2.0 | No publicados en la información disponible |

La comparativa relevante es interna a la línea de experimentos del autor: el modelo base supera a este checkpoint en contención y precisión de nombre de herramienta, mientras que este checkpoint y armB2 lo superan en planificación multi-paso. No se dispone de comparación con alternativas externas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- El propio autor declara que es un artefacto de investigación, no un producto, y que la evaluación independiente no está completa.
- El addendum corrige afirmaciones previas del README: la base sí tiene tool calling nativo; la cifra "cero tool calling" de la base medía una interfaz sintética.
- Regresiones medidas: sobre-disparo de herramientas en consultas que no las requieren (tier-3 de 5/10 a 9/10) y deriva de herramienta en trivialidades (tier-4 de 0/10 a 4/10).
- Precisión de nombre de herramienta degradada frente a la base: 10/20 frente a 17/20 en tier-1.
- Entrenamiento detenido al 86% (paso 213 de 246); los pesos publicados son el merge del checkpoint 200.
- Entrenado con 218 trayectorias, de las cuales 190 son generadas por un profesor (GLM-5.3-Flash) y 112 tareas son sintéticas: riesgo de sobreajuste al estilo del profesor y de alucinación fuera de la distribución de tareas.
- Solo inglés; sin capacidades multilingües declaradas.
- Sin visión: la torre visual fue eliminada en el merge.
- Los datos de entrenamiento originales no se publican por contener material privado, lo que limita la auditoría completa del pipeline.
- Licencia Apache 2.0 permite uso comercial, pero el estado de validación del checkpoint desaconseja producción sin evaluación propia.
- El programa de fine-tune está congelado desde el 3 de septiembre de 2026; el autor usa el modelo base como opción por defecto en su runtime.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v2
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Modelo base alternativo citado en la model card: https://huggingface.co/Empero/Qwen3.8-9B
- Dataset del fine-tune v28: `hermes-fc-v28-data` (referenciado en la model card, sin URL directa en la información disponible)
- Repositorio compañero con GGUF ROCmFPX: no disponible la URL exacta en la información proporcionada
- Scripts de reproducción: `scripts/native_battery.py`, `scripts/todo_probes.jsonl`, `scripts/no_drift_probes.jsonl` (incluidos en el repo del modelo)
- Apoyo al autor: https://ko-fi.com/jamesonbradfield
