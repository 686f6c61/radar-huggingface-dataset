# imYChaudhary22/zen-polish-v2-1.7b-4bit

## Resumen

Kanso Koi 0.8 (publicado originalmente como ZenPolish v2) es un modelo de lenguaje especializado en la mejora de texto dictado, desarrollado por ZenVoice y publicado bajo el sello BuilderHelm AI. Su funcion es tomar la salida cruda de un motor de reconocimiento automatico del habla (ASR), sin puntuacion ni mayusculas y con muletillas, y devolver un texto limpio y formateado: puntuacion, mayusculas, eliminacion de rellenos y conversion de numeros, fechas y horas habladas a su forma escrita. El modelo esta pensado para ejecutarse integramente en local sobre Apple Silicon mediante MLX, sin enviar datos a la nube.

Tecnicamente es un fine-tune LoRA de Qwen3-1.7B (1.720.574.976 parametros) que se fusiono con el modelo base y se cuantizo a 4 bits. El repositorio ocupa 1,0 GB y los pesos se distribuyen en safetensors para MLX. La licencia es Apache-2.0, heredada del modelo base Qwen3. El modelo esta retirado: ZenVoice ya no lo ofrece y recomienda migrar a Kanso-Koi-1.0 o Kanso-Satori-1.0.

Su relevancia actual es principalmente historica y de referencia: documenta con detalle el pipeline de entrenamiento y evaluacion de la familia Kanso, y sigue siendo util para quien quiera reproducir el enfoque de formateo de dictado en local o comparar versiones. Para produccion nueva, el propio autor redirige a las versiones 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), fine-tune LoRA fusionado |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); pesos de 934 MB |
| Idiomas soportados | ingles (enfoque principal); cobertura multilingue no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso, y se adapta mediante LoRA con la libreria mlx-lm. Tras el entrenamiento, los adaptadores se fusionan con los pesos base y el conjunto resultante se cuantiza a 4 bits para MLX. El prompt sigue el formato ChatML con el modo de razonamiento (thinking) desactivado; el system prompt exacto esta en el repositorio de ZenVoice, en `training/common.py`.

El pipeline de datos, documentado en `training/`, incluye un noisificador que degrada texto limpio a forma hablada (elimina puntuacion, inserta muletillas, convierte numeros a palabras), constructores de pares sinteticos y de pares reales procedentes de ASR, conjuntos de evaluacion congelados y un arnes de validacion (gate harness). La model card no especifica el numero de tokens de entrenamiento ni la composicion exacta del dataset. No se menciona RLHF ni DPO; el objetivo es una tarea de transformacion de texto acotada, no de alineamiento conversacional abierto.

## Capacidades

- Formateo de texto dictado: restauracion de puntuacion y mayusculas.
- Eliminacion de muletillas y rellenos del habla.
- Conversion de numeros, fechas, horas y porcentajes hablados a forma escrita.
- Limpieza de texto sin reescritura de significado ni adicion de contenido.
- Generacion de texto y conversacion basica heredadas del modelo base Qwen3.
- Soporte de tool calling o function calling: no disponible en la informacion.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el modo thinking se desactiva en el uso previsto.
- Capacidades multilingues: limitadas; el modelo esta enfocado al ingles.
- Vision o audio: no soportados.

## Casos de uso

- Dictado en local sobre macOS: integrado en la aplicacion ZenVoice, el modelo recibe la transcripcion cruda del ASR y devuelve texto listo para pegar en un editor, sin que el audio ni el texto salgan del Mac.
- Correccion de transcripciones de reuniones: tras un motor ASR, el modelo restaura puntuacion y mayusculas y convierte referencias habladas a fechas y horas, lo que facilita la lectura y el archivado de actas.
- Preprocesado de notas de voz: conversion de notas dictadas rapidamente en texto estructurado para tareas de gestion personal, aprovechando la eliminacion de muletillas.
- Normalizacion de datos de entrada en pipelines de NLP: limpieza de texto procedente de ASR antes de alimentar un clasificador o un sistema de busqueda, reduciendo el ruido de puntuacion.
- Prototipado de asistentes de voz en Apple Silicon: al ejecutarse con MLX en hardware Apple, sirve como componente de formateo en prototipos que requieren privacidad y baja latencia.
- Investigacion sobre formateo de dictado: reproduccion del pipeline de noisificacion y evaluacion descrito en `training/` para experimentar con variantes o idiomas adicionales.
- Comparacion de versiones de la familia Kanso: util como referencia para medir la mejora de Koi 1.0 y Satori 1.0 frente a esta version.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre conjuntos de evaluacion congelados de ZenVoice, decodificacion greedy y comparados con Qwen3-1.7B-Instruct con el mismo prompt.

Conjunto sintetico de 300 filas:

| Metrica | Koi 0.8 | Base original |
|---|---|---|
| WER | 5,0% | 10,1% |
| Exact match | 20,3% | 11,3% |
| F1 de puntuacion | 0,391 | 0,143 |
| Tasa de contenido nuevo (alucinacion) | 3,1% | 4,3% |
| Precision de mayusculas | 94,2% | 89,9% |

Banco de entrada real limpia (120 filas):

| Metrica | Koi 0.8 | Base original |
|---|---|---|
| WER | 7,6% | 11,0% |
| Exact match | 7,5% | 5,0% |

El WER es superior en entrada limpia (7,6%) que en entrada ruidosa tipo ASR (5,0%); segun la model card, el entrenamiento con mezcla de identidad de la version 3 cierra esa brecha.

## Requisitos de hardware

- VRAM/unificada estimada: los pesos en 4 bits ocupan 934 MB; con overhead de inferencia, el consumo cabe holgadamente en menos de 2 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con soporte MLX (series M1, M2, M3, M4 y superiores). No esta pensado para CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con chip Apple Silicon; no aplica a GPU NVIDIA/AMD por el formato MLX.
- Opciones de despliegue: mlx-lm (libreria nativa del modelo); vLLM, llama.cpp, Ollama o TGI no estan indicados como soportados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| Kanso Koi 0.8 (este) | 1,7B | no disponible | Formateo de dictado, MLX | Apache-2.0 | Retirado |
| Kanso Koi 1.0 | no disponible | no disponible | Formateo de dictado, MLX | no disponible | Recomendado por el autor |
| Kanso Satori 1.0 | 4B (segun nomenclatura de la familia) | no disponible | Formateo de dictado, MLX | no disponible | Recomendado por el autor |
| Qwen3-1.7B-Instruct (base) | 1,7B | no disponible | Generacion general | Apache-2.0 | Disponible |

La model card no incluye comparaciones con modelos de terceros; los unicos datos comparativos son frente al modelo base Qwen3-1.7B-Instruct.

## Limitaciones y advertencias

- Modelo retirado: ZenVoice ya no lo ofrece; el autor recomienda usar Kanso-Koi-1.0 o Kanso-Satori-1.0.
- Enfocado al ingles; la cobertura de otros idiomas no esta disponible y la version 3 se anuncia como la que ampliara la cobertura linguistica.
- Puntos debiles declarados: reescritura de correos electronicos y URL, conversion de cantidades de dinero habladas y reparacion de homofonos.
- Riesgo de alucinacion: la model card reporta una tasa de contenido nuevo del 3,1% en el conjunto sintetico; el modelo puede introducir palabras no presentes en la entrada.
- WER mas alto en entrada limpia (7,6%) que en entrada ruidosa (5,0%), lo que desaconseja su uso sobre texto ya formateado.
- Dependencia de MLX y Apple Silicon: no es portable directamente a entornos CUDA sin conversion de pesos.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3-1.7B; conviene revisar los terminos del modelo base.
- El system prompt debe coincidir con el usado en entrenamiento; desviarse de el puede degradar el formateo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imYChaudhary22/zen-polish-v2-1.7b-4bit
- Organizacion BuilderHelm en Hugging Face: https://huggingface.co/BuilderHelm
- Kanso-Koi-1.0: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Kanso-Satori-1.0: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Modelo base en Hugging Face: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Qwen3-1.7B (modelo original): https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- ZenVoice (pagina principal): https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
