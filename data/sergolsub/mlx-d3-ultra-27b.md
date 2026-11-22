# sergolsub/mlx-d3-ultra-27B

## Resumen

`sergolsub/mlx-d3-ultra-27B` es una conversión a 8 bits en formato MLX del modelo `vllm-sr/d3-ultra`, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante `mlx_lm`. No se trata de un modelo nuevo ni de un fine-tuning: el autor indica explícitamente que no hay reentrenamiento ni cambios de arquitectura, solo cuantización a 8 bits de los shards BF16 originales, con la licencia Apache 2.0 heredada del repositorio upstream.

El modelo no es un generador de texto conversacional al uso. Su interfaz pública es `model.decide()`, que recibe un texto y un diccionario de tareas tipadas (`noul`, `choice`, `score`, `box`) y devuelve una decisión estructurada por cada una. Según la model card, incorpora cabezas de decisión específicas (archivos `decision_config.json` y `joint_config.json` junto con glue de inferencia `*_mlx.py`), lo que lo orienta a clasificación, enrutamiento, puntuación de severidad y localización de objetos en imágenes descritas.

La relevancia actual es doble: por un lado, demuestra un flujo de conversión BF16 a MLX 8-bit con evaluación de degradación de calidad publicada; por otro, propone un patrón de inferencia por tareas discretas en lugar de generación libre, útil para pipelines de decisión donde la latencia y la reproducibilidad importan más que la fluidez textual. El tamaño nominal es de 27B parámetros, aunque la model card no detalla la arquitectura interna ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `vllm-sr/d3-ultra`; la model card menciona `text_config` anidado, sin detallar tipo de transformer) |
| Parametros totales | 27B (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit MLX (única variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo upstream) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `decision_config.json`, `joint_config.json` y glue `*_mlx.py` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base `vllm-sr/d3-ultra`: no se especifica si es un transformer denso, un MoE o un híbrido, ni el número de capas, dimensión oculta o cabezas de atención. La model card únicamente menciona que la conversión se realizó en streaming desde los shards BF16 del upstream y que estos presentan un `text_config` anidado, lo que sugiere una configuración multimodal o multi-cabeza, pero no se aportan detalles.

Respecto al entrenamiento, no hay datos sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO. La única información técnica relevante es la evaluación de la cuantización: el autor reporta que la conversión a 8 bits preserva la calidad respecto a BF16 en sus pruebas internas, con perplejidad de calibración 2.548 frente a 2.534, y métricas idénticas en accuracy (87,8 %), noul (87,5 %), choice (96,0 %) y score (80,0 %). No se documenta ninguna innovación arquitectónica propia de esta conversión más allá del empaquetado de las cabezas de decisión para MLX.

## Capacidades

- Decisión estructurada por tareas tipadas: `noul` (sí/no/desconocido), `choice` (selección entre criterios con descripción), `score` (puntuación ordinal sobre una lista de criterios) y `box` (localización de un objeto descrito en una imagen).
- Procesamiento de texto de entrada con múltiples preguntas independientes en una sola llamada, cada una como objeto separado dentro del diccionario de tareas.
- Capacidad de localización visual descrita en texto (`box`), aunque no se confirma si el modelo procesa píxeles directamente o solo descripciones textuales de imágenes.
- Enrutamiento y clasificación operativa: asignación a equipos, detección de intención de reembolso, puntuación de severidad de incidencias.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni generación de texto libre conversacional.
- Capacidades multilingües: no disponibles; la model card no declara idiomas y los ejemplos están en inglés.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de tareas (`choice` para equipo responsable, `score` para severidad) y devuelve la asignación y prioridad en una sola pasada, con latencia medida de 4.740 ms mediana por decisión en un M4 Pro.
- Detección de intención de reembolso: usando la tarea `noul` con instrucciones como "¿el cliente quiere un reembolso?", se integra en un flujo de atención al cliente para enrutar automáticamente antes de la intervención humana.
- Clasificación de incidencias de infraestructura: con la tarea `score` sobre criterios como `cosmetic`, `annoying` o `blocks`, permite priorizar alertas de sistemas (por ejemplo, errores de cuota de disco en workers) sin un modelo generativo completo.
- Enrutamiento de colas internas: la tarea `choice` con criterios descritos (`billing`, `shipping`, etc.) sirve para asignar casos a equipos con una política explícita y auditable, ya que los criterios viajan en la propia llamada.
- Anotación asistida de datasets: la combinación de `noul`, `choice` y `score` permite etiquetar corpus de tickets o incidencias de forma consistente, con la ventaja de que la cuantización 8-bit mantiene las métricas de BF16 según el autor.
- Localización de objetos en pipelines de visión: la tarea `box` sobre descripciones de escenas (por ejemplo, localizar una señal de stop tras un banco) puede emplearse en prototipos de anotación o verificación de detecciones, siempre que se valide el formato de salida de la caja.
- Despliegue local en estaciones de trabajo Apple Silicon: con 28,15 GB en disco y 17,44 GB de memoria residente pico en un Mac mini M4 Pro de 48 GB, es viable para prototipos y demos sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | 8-bit MLX | BF16 (referencia) |
|---|---|---|
| Accuracy | 87,8 % | 87,8 % |
| Noul | 87,5 % | 87,5 % |
| Choice | 96,0 % | 96,0 % |
| Score | 80,0 % | 80,0 % |
| Perplejidad de calibracion | 2,548 | 2,534 |

Datos medidos por el autor en Mac mini M4 Pro de 48 GB con MLX 8-bit: 28,15 GB en disco, 15,44 s de carga, 17,44 GB de memoria residente pico, latencia mediana de decisión de 4.740 ms y 0,49 decisiones cortas por segundo sostenidas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,44 GB de memoria residente pico medida con 8-bit MLX en un Mac mini M4 Pro de 48 GB; el peso en disco es de 28,15 GB.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor valida M4 Pro de 48 GB. No hay datos para A100, H100 ni RTX 4090, y el formato MLX no es compatible con CUDA sin conversión.
- Cabe en GPU de consumo: en el ecosistema Apple, sí en equipos con al menos 32 GB de memoria unificada (no verificado por el autor, que solo reporta 48 GB); en GPU NVIDIA de consumo no es desplegable directamente por el formato.
- Opciones de despliegue: `mlx_lm` con el glue `d3_mlx.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 4.740 ms por decisión y 0,49 decisiones cortas por segundo en M4 Pro de 48 GB; tiempo de carga de 15,44 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| sergolsub/mlx-d3-ultra-27B | 27B (nominal) | no disponible | MLX 8-bit | Apache 2.0 | Decisiones tipadas en Apple Silicon |
| vllm-sr/d3-ultra (upstream) | no disponible | no disponible | BF16 safetensors | Apache 2.0 | Modelo original del que deriva esta conversión |
| Alternativas de clasificación tipo encoder (p. ej. DeBERTa) | 0,1-1,5B | 512 tokens típicos | safetensors, ONNX | MIT/Apache 2.0 | Clasificación y NLI, sin cabezas de decisión integradas |

No se dispone de información sobre modelos comparables directos con el mismo esquema de cabezas de decisión (`noul`, `choice`, `score`, `box`); la comparativa con clasificadores encoder es orientativa por categoría de tarea, no por rendimiento medido en el mismo benchmark.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, idiomas soportados ni composición del dataset de entrenamiento, por lo que no es posible evaluar riesgos de sesgo demográfico o lingüístico.
- Riesgo de alucinación no caracterizado: al ser un modelo de decisión estructurada, el modo de fallo probable es una elección incorrecta o una caja mal localizada, pero no se han publicado tasas de error por tipo de tarea más allá de las métricas agregadas del autor.
- Las métricas de calidad (87,8 % accuracy, 96,0 % choice) son evaluaciones internas del autor sin conjunto de test público ni comparación con terceros; deben tratarse como indicativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas declarados; la madurez y el mantenimiento no están garantizados.
- La licencia Apache 2.0 se hereda del upstream, pero el autor advierte de que, en caso de conflicto, prevalece la LICENSE del repositorio original; conviene verificar el upstream antes de uso comercial.
- Solo se distribuye en formato MLX 8-bit: no hay pesos GGUF, AWQ ni GPTQ en este repositorio, lo que limita el despliegue fuera de Apple Silicon.
- El tamaño de contexto no está disponible, lo que impide garantizar el comportamiento en entradas largas (tickets extensos, descripciones de imagen detalladas).
- La interfaz `decide()` requiere el glue Python incluido; no es un modelo servible con APIs estándar de chat completions sin trabajo de integración adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-d3-ultra-27B
- Modelo base upstream: https://huggingface.co/vllm-sr/d3-ultra
- Librería MLX: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
