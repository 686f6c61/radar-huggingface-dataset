# 12kimih/Qwen3.5-4B-Unedited-SFT

## Resumen

Qwen3.5-4B-Unedited-SFT es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario 12kimih en Hugging Face. El modelo se ha entrenado sobre trazas de razonamiento de un modelo profesor tal y como se generaron, sin ningún tipo de edición posterior, y sirve como línea base en el trabajo de investigación "Distilling Metacognitive Behaviors through Agentic Editing" (arXiv 2602.22508). Su propósito es estudiar cómo la destilación de comportamientos metacognitivos —con o sin edición de las trazas del profesor— afecta al razonamiento y las matemáticas del modelo alumno.

El modelo es relevante como punto de comparación frente a sus tres variantes hermanas (MBT-R, MBT-I y MBT-A), que sí incorporan distintas formas de edición de las trazas. Con unos 4,54 mil millones de parámetros, formato safetensors en bf16 y licencia Apache-2.0, es un modelo ligero y de uso comercial permisivo, orientado a tareas de razonamiento paso a paso, matemáticas y generación de texto conversacional con bloques de pensamiento explícitos (`<think>`). El modelo está etiquetado como image-text-to-text, heredando presumiblemente capacidades multimodales de la familia Qwen3.5, aunque la model card no detalla este aspecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (detalle no disponible); etiquetado como image-text-to-text |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | 131.072 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (datos de entrenamiento bajo CC BY-SA 4.0) |
| Formato de pesos | safetensors (bf16), 9,1 GB de tamano de repositorio |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base y se ha ajustado mediante fine-tuning supervisado de parametros completos (full-parameter SFT), calculando la perdida unicamente sobre los tokens del asistente. El conjunto de entrenamiento procede del dataset 12kimih/mbt-traces, que contiene trazas de razonamiento generadas por un modelo profesor. En esta variante concretamente, las trazas se usaron tal cual se generaron, sin edicion, lo que convierte al modelo en la linea base contra la que comparar las variantes con edicion metacognitiva (MBT-R con reescritura, MBT-I con insercion y MBT-A con edicion agentica).

El regimen de entrenamiento es notablemente detallado: 15 epocas con el optimizador Muon (implementacion de Megatron), tasa de aprendizaje 1e-5 constante con 40 pasos de calentamiento, weight decay 0, batch global de 64 secuencias (8 GPUs x 8 pasos de acumulacion) con packing sin padding, y longitud maxima de 131.072 tokens. Se entreno en bf16 con autocast y pesos maestros en fp32, liberandose finalmente en bf16. No hay indicios de RLHF ni DPO en la model card.

## Capacidades

- Razonamiento paso a paso: la plantilla de chat abre automaticamente un bloque `<think>`, generando primero el razonamiento y despues la respuesta final tras `</think>`.
- Matematicas: entrenado explicitamente para resolver problemas matematicos con razonamiento detallado y respuesta final en formato `\boxed{}`.
- Metacognicion: el objetivo del proyecto es destilar comportamientos metacognitivos del profesor (autorreflexion durante el razonamiento).
- Generacion de texto largo: las respuestas largas son habituales; la model card recomienda dejar margen para decenas de miles de tokens (el ejemplo usa max_tokens=122880).
- Generacion conversacional: pipeline de text-generation con plantilla de chat.
- Multimodalidad: etiquetado como image-text-to-text, aunque la model card no documenta ni da ejemplos de uso con imagenes.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada (mas alla del contexto del proyecto de "agentic editing").
- Capacidades multilingues: no disponibles; el modelo esta etiquetado solo en ingles.

## Casos de uso

- Resolucion de problemas matematicos: el modelo esta afinado para razonar paso a paso y dar la respuesta final en `\boxed{}`, ideal para verificaciones automaticas de soluciones en benchmarks tipo GSM8K o MATH.
- Investigacion en destilacion de razonamiento: es la linea base perfecta para replicar o extender el estudio de "Distilling Metacognitive Behaviors through Agentic Editing", comparando SFT sin editar frente a ediciones metacognitivas.
- Analisis de trazas de razonamiento: al entrenarse con trazas sin editar, sirve para estudiar como los errores y verborrea del profesor se propagan al alumno.
- Prototipado con razonamiento extendido: con 131k tokens de contexto de entrenamiento y respuestas de decenas de miles de tokens, es util para tareas que exigen cadenas de razonamiento muy largas.
- Generacion de texto conversacional en ingles: chat basico con formato de pensamiento explicito, util para asistentes que muestren su proceso de razonamiento.
- Evaluacion de optimizadores alternativos: el uso documentado de Muon en el entrenamiento lo hace interesante como referencia practica de este optimizador frente a AdamW.
- Despliegue ligero en investigacion: con ~4,5B de parametros y bf16, es manejable en una sola GPU de gama alta para experimentacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper "Distilling Metacognitive Behaviors through Agentic Editing" (arXiv 2602.22508) para los resultados comparativos entre las variantes Unedited-SFT, MBT-R, MBT-I y MBT-A, pero no incluye numeros concretos.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 9-10 GB solo para los pesos (4,54B de parametros x 2 bytes), mas overhead de activaciones y KV cache; con respuestas de hasta ~122k tokens, la KV cache puede anadir varios GB adicionales.
- VRAM para fine-tuning completo: considerablemente mayor; el entrenamiento original uso 8 GPUs, por lo que se recomienda un nodo multi-GPU para reproducir el regimen de entrenamiento.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 5090 deberia bastar para inferencia en bf16 con contextos moderados; para contextos muy largos o entrenamiento, A100/H100 de 80 GB.
- Cabe en consumer GPU: si, en bf16 en GPUs de 24 GB; con cuantizacion (no publicada oficialmente, pero viable via GGUF de terceros) podria entrar en GPUs de 12-16 GB.
- Opciones de despliegue: vLLM (ejemplo oficial en la model card), transformers, y presumiblemente llama.cpp/Ollama si se convierte a GGUF (conversion no disponible oficialmente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen3.5-4B-Unedited-SFT | 4,54B | 131.072 (entrenamiento) | Apache-2.0 | SFT sobre trazas del profesor sin editar |
| Qwen3.5-4B-MBT-R | 4,54B (estimado) | no disponible | no disponible | SFT sobre trazas reescritas (MBT-R) |
| Qwen3.5-4B-MBT-I | 4,54B (estimado) | no disponible | no disponible | SFT sobre trazas con insercion (MBT-I) |
| Qwen3.5-4B-MBT-A | 4,54B (estimado) | no disponible | no disponible | SFT sobre trazas con edicion agentica (MBT-A) |
| Qwen/Qwen3.5-4B-Base | 4,54B (estimado) | no disponible | no disponible | Modelo base sin ajustar |

La comparacion mas relevante es interna al propio estudio: las variantes MBT-R, MBT-I y MBT-A comparten base, tamano y metodo con este modelo, diferenciandose unicamente en el tratamiento de las trazas de entrenamiento. Frente a otros modelos de razonamiento de ~4B del mercado, no hay datos publicados en la informacion disponible para una comparacion de rendimiento.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente en ingles; no hay soporte documentado para castellano ni otros idiomas.
- Sesgos: al entrenarse con trazas del profesor sin editar, puede heredar y amplificar los errores, verborrea y sesgos del modelo profesor; este es precisamente el fenomeno que el paper investiga.
- Alucinaciones: riesgo tipico de modelos pequenos afinados con SFT puro (sin RLHF/DPO documentado), especialmente en razonamiento largo donde los errores tempranos pueden propagarse.
- Respuestas muy largas: la model card advierte que las respuestas largas son habituales; hay que configurar max_tokens alto (decenas de miles) y prever la VRAM correspondiente para la KV cache.
- Multimodalidad sin documentar: pese al tag image-text-to-text, no hay instrucciones ni ejemplos de uso con imagenes; no se garantiza que funcione en ese escenario.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede implicar obligaciones de atribucion en usos derivados de los datos.
- Calidad de la linea base: al ser la variante "sin editar" de un estudio, su rendimiento puede ser inferior al de las variantes MBT; conviene revisar el paper antes de elegir esta version para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/12kimih/Qwen3.5-4B-Unedited-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/12kimih/mbt-traces
- Variante MBT-R: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-R
- Variante MBT-I: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-I
- Variante MBT-A: https://huggingface.co/12kimih/Qwen3.5-4B-MBT-A
- Paper (arXiv): https://arxiv.org/abs/2602.22508
- Codigo y prompts (GitHub): https://github.com/12kimih/metacognitive-behavioral-tuning
