# kaivoss/Clover-Preview-VL

## Resumen

Clover-Preview-VL es un adaptador multimodal publicado por el usuario kaivoss que dota de capacidad de vision al modelo de difusion por bloques Clover-35B-A3B-Preview, derivado a su vez de Qwen3.6-35B-A3B. El repositorio no contiene pesos completos, sino un conjunto de pesos parciales: el ViT de Qwen3.6 (447M de parametros) con un merger reentrenado, un LoRA de rango 32 sobre las proyecciones de atencion y atencion lineal de Clover, y el codigo necesario para sustituir el RoPE 1-D de Clover por el M-RoPE 3-D de Qwen. El modelo base es un MoE de 35B parametros totales con 3B activos.

La relevancia tecnica del proyecto es que demuestra que el injerto de una torre de vision en un modelo de difusion de texto funciona antes de cualquier entrenamiento, y que un ajuste muy corto (103 pasos, 1.650 imagenes de LLaVA-OneVision, 43 minutos en una H200) mejora de forma apreciable tareas de lectura de texto y graficos. Es un experimento de investigacion mas que un modelo listo para produccion: el propio autor advierte de que la evaluacion es de 30 preguntas por tarea y de que no hay soporte para vLLM ni SGLang.

El pipeline declarado es image-text-to-text y la licencia es Apache-2.0, heredada de Clover y Qwen3.6. El repositorio ocupa 1,0 GB y se distribuye como adaptador PEFT sobre el modelo base alojado en Diffuspace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion por bloques (block-diffusion) para texto con torre de vision ViT injertada; base MoE |
| Parametros totales | 35B (modelo base Clover-35B-A3B) |
| Parametros activos | 3B (MoE del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo documenta ejecucion en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (vision.safetensors, adapter_model.safetensors) + codigo Python (clover_vl.py, clover_sft/) |

## Arquitectura y entrenamiento

El modelo base Clover-35B-A3B-Preview es un modelo de difusion por bloques para texto construido a partir de Qwen3.6-35B-A3B, un MoE con 35B parametros totales y 3B activos. Sobre esa base, este repositorio anade tres piezas. La primera es `vision.safetensors`, que contiene el ViT de Qwen3.6 (447M de parametros) con un merger reentrenado. La segunda es `adapter_model.safetensors`, un LoRA de rango 32 aplicado sobre las proyecciones de atencion y atencion lineal de Clover. La tercera es el codigo en `clover_vl.py` y `clover_sft/`, que sustituye el RoPE 1-D de Clover por el M-RoPE 3-D de Qwen; como ambos son identicos para texto, los tokens de imagen recuperan sus posiciones 2-D sin degradar el comportamiento textual.

El entrenamiento es deliberadamente corto: 103 pasos sobre 1.650 imagenes de LLaVA-OneVision (subtitulos, OCR, graficos, diagramas y VQA), 43 minutos en una unica H200. No se entreno salida de grounding ni de cajas delimitadoras. El autor senala que el injerto funciona incluso sin entrenamiento, y que el ajuste solo mejora las tareas de lectura de texto y graficos mientras el resto se mantiene estable.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base Clover-35B-A3B (difusion por bloques).
- Comprension de imagenes: subtitulado, OCR, lectura de graficos, diagramas y VQA visual.
- Respuesta a preguntas sobre una unica imagen por prompt.
- Conversacion de un solo turno (single turn).
- Integracion de posiciones 2-D para tokens de imagen mediante M-RoPE 3-D.
- No dispone de modo de razonamiento explicito (thinking mode).
- No se entreno salida de grounding ni de cajas delimitadoras.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Lectura de texto en imagenes (OCR ligero): el modelo muestra una mejora de TextVQA de 74,4 a 81,1 tras el ajuste, por lo que es adecuado para extraer texto de fotografias de carteles, etiquetas o documentos escaneados en un prototipo de investigacion.
- Interpretacion de graficos: con ChartQA pasando de 83,3 a 96,7, el modelo sirve para responder preguntas sobre ejes, leyendas y valores en graficos de barras o lineas dentro de un pipeline de analisis documental.
- Descripcion automatica de imagenes: la tarea de subtitulado esta cubierta por los datos de entrenamiento (LLaVA-OneVision captions), util para generar alt-text o metadatos en un catalogo de imagenes.
- Respuesta visual a preguntas (VQA) en entornos controlados: adecuado para experimentos academicos donde se evalua la viabilidad de injertar vision en modelos de difusion de texto.
- Analisis de diagramas tecnicos: los datos de entrenamiento incluyen diagramas, de modo que el modelo puede responder preguntas sobre esquemas y figuras en documentacion tecnica, siempre con una imagen por consulta.
- Prototipado de asistentes visuales de un solo turno: para demos o pruebas de concepto donde no se requiere conversacion multi-turno ni integracion con servidores de inferencia de alto rendimiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card: 30 preguntas por tarea, decodificacion greedy, los mismos items en ambas columnas. El autor advierte que una pregunta equivale a 3,3 puntos, por lo que las diferencias pequenas son ruido y la tabla debe tratarse como una comprobacion de sanidad, no como un benchmark formal.

| Tarea | Injerto sin entrenamiento | Este repositorio |
|---|---|---|
| TextVQA | 74,4 | 81,1 |
| ChartQA | 83,3 | 96,7 |
| POPE | 93,3 | 93,3 |
| MMBench (en dev) | 80,0 | 80,0 |
| AI2D | 86,7 | 86,7 |
| Media | 83,5 | 87,6 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 80 GB para inferencia en bf16, ya que Clover ocupa 69 GB en bf16.
- GPU recomendadas: una unica H200 (usada en el entrenamiento) o cualquier GPU con al menos 80 GB, como A100 80GB o H100 80GB.
- Cabe en GPU de consumo: no, segun los requisitos documentados.
- Opciones de despliegue: solo la ruta standalone de Hugging Face incluida en el repositorio (`run.py`). No hay soporte de vLLM ni de SGLang.
- Latencia: aproximadamente 8 segundos para una respuesta corta por la ruta de Hugging Face, descrita por el autor como lenta.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Clover-Preview-VL (este) | 35B totales / 3B activos | no disponible | Apache-2.0 | Adaptador de vision sobre Clover-35B-A3B; evaluacion de 30 items por tarea |
| Clover-35B-A3B-Preview | 35B totales / 3B activos | no disponible | Apache-2.0 | Modelo base solo texto, difusion por bloques |
| Qwen3.6-35B-A3B | 35B totales / 3B activos | no disponible | Apache-2.0 (segun la model card) | Modelo base original, multimodal nativo; origen del ViT y del M-RoPE |

No se dispone de datos de benchmarks comparativos con otros modelos multimodales de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola imagen por prompt y un solo turno de conversacion; no hay modo de razonamiento explicito.
- Sin soporte de SGLang ni vLLM; unicamente la ruta standalone lenta (unos 8 segundos por respuesta corta).
- Evaluacion muy pequena (30 preguntas por tarea); el autor pide tratarla como comprobacion de sanidad y no como resultado de benchmark.
- No se entreno salida de grounding ni de cajas delimitadoras.
- Idiomas soportados no documentados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: el codigo y los pesos son Apache-2.0, pero las imagenes de entrenamiento provienen de subconjuntos de LLaVA-OneVision con sus propios terminos, que deben respetarse.
- Los pesos completos del modelo base se descargan desde Diffuspace; el repositorio solo contiene el adaptador y el ViT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaivoss/Clover-Preview-VL
- Modelo base Clover-35B-A3B-Preview: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/lmms-lab/LLaVA-OneVision-Data
