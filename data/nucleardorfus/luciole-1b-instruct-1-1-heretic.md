# NuclearDorfus/Luciole-1B-Instruct-1.1-Heretic

## Resumen

Luciole-1B-Instruct-1.1-Heretic es una variante modificada del modelo OpenLLM-France/Luciole-1B-Instruct-1.1, desarrollada por el usuario NuclearDorfus. Se trata de un modelo de generacion de texto de aproximadamente 1.320 millones de parametros, orientado a conversacion y entrenado originalmente por OpenLLM-France sobre el dataset Luciole-PostTraining-Dataset-1.1. La modificacion consiste en la aplicacion de la tecnica de abliteracion mediante la herramienta Heretic v2.1.0 y su metodo ARA (Arbitrary-Rank Ablation), con el objetivo de reducir el comportamiento de rechazo del modelo base.

El modelo base pertenece a la familia Nemotron segun las etiquetas del repositorio, y esta disponible en formato safetensors para su uso con la libreria transformers. La relevancia de esta variante radica en su enfoque: elimina practicamente todas las frases de rechazo ante prompts considerados daninos, segun la evaluacion del propio autor, a costa de una divergencia KL de 0.4199 respecto al modelo original. Es un modelo de investigacion y experimentacion, no un modelo de produccion validado.

La ficha se centra en los datos disponibles publicamente en el repositorio de Hugging Face. No hay informacion publicada sobre benchmarks estandar, datos de entrenamiento detallados ni evaluaciones independientes, por lo que muchos campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Nemotron, segun etiquetas del repo) |
| Parametros totales | 1.319.309.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo; al ser safetensors, admite conversion a GGUF/AWQ/GPTQ por herramientas externas |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es una modificacion del checkpoint OpenLLM-France/Luciole-1B-Instruct-1.1, que segun las etiquetas del repositorio pertenece a la familia Nemotron. No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna (numero de capas, dimensiones, tipo de atencion) ni sobre el proceso de preentrenamiento del modelo base. El pipeline declarado es text-generation y la libreria es transformers.

El proceso de modificacion se realizo con Heretic v2.1.0, una herramienta que aplica abliteracion mediante el metodo ARA (Arbitrary-Rank Ablation). El autor ejecuto 60 ensayos de optimizacion en 2 GPUs Tesla T4 y selecciono el ensayo 9, descrito como el ensayo Pareto-optimo con menos rechazos. El resultado declarado es una reduccion de rechazos de 100/100 en el modelo original a 0/100 en esta variante, medido con el modo de evaluacion de Heretic sobre 100 prompts daninos, con una divergencia KL de 0.4199 respecto al modelo base. El autor advierte que los rechazos se cuentan por coincidencia de palabras clave, por lo que 0/100 indica ausencia de frases de rechazo, no calidad de las respuestas.

## Capacidades

- Generacion de texto conversacional en frances e ingles.
- Reduccion del comportamiento de rechazo: el autor reporta 0/100 rechazos ante prompts daninos en la evaluacion de Heretic.
- Capacidad de instruccion heredada del modelo base Luciole-1B-Instruct-1.1.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteracion afecta al comportamiento de rechazo y a la calidad de las respuestas, comparando directamente con el modelo base mediante la divergencia KL reportada.
- Evaluacion de tecnicas de abliteracion: sirve como caso practico para reproducir el flujo de Heretic v2.1.0 y el metodo ARA sobre un modelo de 1.3B parametros en GPUs de gama media como la Tesla T4.
- Generacion de texto en frances para prototipos: el modelo puede emplearse en pruebas de generacion conversacional en frances, aprovechando el entrenamiento del modelo base sobre el dataset Luciole.
- Experimentos de destilacion o comparacion de checkpoints: al compartir arquitectura y tokenizador con el modelo base, facilita comparaciones controladas entre versiones alineadas y no alineadas.
- Desarrollo de pipelines de evaluacion de robustez: util para construir conjuntos de pruebas que midan la tasa de rechazo y la coherencia de respuestas en modelos pequenos.
- Despliegue en entornos con recursos limitados: con 1.3B parametros y pesos safetensors, es viable en GPUs consumer para inferencia de baja latencia en tareas de generacion de texto no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion es el reportado por el autor con el modo de evaluacion de Heretic:

| Metrica | Luciole-1B-Instruct-1.1 | Luciole-1B-Instruct-1.1-Heretic |
|---|---|---|
| Rechazos (100 prompts daninos) | 100/100 | 0/100 |
| Divergencia KL | 0 (por definicion) | 0.4199 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.6 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1.4-1.6 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0.8-1.0 GB para pesos.
- GPU recomendadas: Tesla T4 (usada por el autor para el proceso de abliteracion), RTX 3060, RTX 4060, RTX 4090, A100, H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con al menos 4 GB de VRAM en fp16 y 2 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (formato nativo), llama.cpp y Ollama tras conversion a GGUF, vLLM y TGI tras conversion y validacion del formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Luciole-1B-Instruct-1.1-Heretic | 1.319.309.312 | no disponible | fr, en | Apache 2.0 | Variante abliterada con Heretic/ARA; 0/100 rechazos reportados |
| OpenLLM-France/Luciole-1B-Instruct-1.1 | ~1.3B (heredado) | no disponible | fr, en | Apache 2.0 | Modelo base alineado; 100/100 rechazos en la evaluacion del autor |
| Otros modelos de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion con alternativas de la misma categoria (modelos de ~1B parametros orientados a frances) no puede completarse con datos verificables a partir de la informacion disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no ha sido probado en profundidad y que puede dar respuestas inexactas o daninas.
- La metrica de 0/100 rechazos se basa en coincidencia de palabras clave, no en una evaluacion semantica de la calidad o seguridad de las respuestas.
- La divergencia KL de 0.4199 respecto al modelo base indica una alteracion sustancial de la distribucion de salida, con posible degradacion de capacidades.
- Riesgo elevado de alucinacion y de generar contenido danino, dado que se ha eliminado el comportamiento de rechazo sin un reentrenamiento de alineacion posterior.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base y los del dataset Luciole-PostTraining-Dataset-1.1.
- Limitaciones de contexto e idioma: solo se declaran frances e ingles; la longitud de contexto no esta documentada.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero el uso en produccion de un modelo abliterado sin evaluacion de seguridad conlleva riesgos legales y reputacionales.
- Uso responsable: el autor recomienda emplearlo de forma responsable; no es adecuado para aplicaciones orientadas al usuario final sin filtros adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NuclearDorfus/Luciole-1B-Instruct-1.1-Heretic
- Modelo base: https://huggingface.co/OpenLLM-France/Luciole-1B-Instruct-1.1
- Dataset de post-entrenamiento: https://huggingface.co/datasets/OpenLLM-France/Luciole-PostTraining-Dataset-1.1
- Herramienta Heretic: https://github.com/p-e-w/heretic
