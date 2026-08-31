# pinkskin/qwen3-4b-gdn-wsd-ladder

## Resumen

Este repositorio contiene un conjunto de checkpoints de un experimento de entrenamiento continuo sobre el modelo base Qwen3-4B, desarrollado por el usuario pinkskin. El objetivo es estudiar el efecto de diferentes ventanas de decay dentro de un scheduler WSD (Warmup-Stable-Decay) sobre el rendimiento del modelo, variando tanto la duración del decay como el horizonte de contexto (16K y 32K). Se incluyen dos variantes principales: `flat` (decay uniforme sobre todos los parámetros) y `split` (decay diferenciado entre parámetros del modelo base y parámetros heredados o añadidos). El repositorio contiene 22 subcarpetas, cada una correspondiente a un checkpoint final de un brazo del experimento, con tamaños de decay que van desde 39.2M hasta 115.8M tokens.

La relevancia de este experimento radica en que el scheduler WSD es una técnica de entrenamiento que permite separar la fase de entrenamiento estable de la fase de decay, lo que facilita el fine-tuning posterior y la extrapolación de contexto. Al publicar todos los checkpoints finales, el autor permite a la comunidad analizar cómo la longitud y la forma del decay afectan a la calidad del modelo resultante. Sin embargo, no se proporcionan métricas de evaluación, datos de entrenamiento ni detalles sobre la arquitectura modificada, por lo que este repositorio es principalmente un recurso para investigación experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B, con modificaciones no especificadas) |
| Parametros totales | 4 mil millones (heredados de Qwen3-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 16K o 32K segun el checkpoint (ver tabla en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en formato safetensors, probablemente BF16 o FP32) |
| Idiomas soportados | no disponible (se heredan los de Qwen3-4B, que incluye multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (indicado en los tags) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de 4 mil millones de parametros con atencion por ventana deslizante y atencion global alternada, entrenado originalmente con 32K de contexto. Este repositorio aplica un entrenamiento continuo utilizando un scheduler WSD (Warmup-Stable-Decay), que consiste en una fase de calentamiento, una fase estable con learning rate constante y una fase final de decay (lineal o hacia cero). La tabla de la model card muestra dos familias: `flat` (decay uniforme sobre todos los parametros) y `split` (decay diferenciado: para los parametros GDN se usa un rango de learning rate de 2e-5 a 1e-6, mientras que para los parametros heredados se usa de 2e-6 a 1e-7). Los checkpoints varian en el numero de tokens de decay (desde 39.2M hasta 115.8M) y en el horizonte de contexto (16K o 32K). No se especifican los datos de entrenamiento utilizados ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades especificas para estos checkpoints. Al ser una continuacion del entrenamiento de Qwen3-4B, se espera que conserven las capacidades del modelo base, que incluyen:

- Generacion de texto y comprension del lenguaje en multiples idiomas.
- Razonamiento, matematicas y generacion de codigo.
- Soporte de tool calling y function calling (en la version instruct de Qwen3, aunque este repo no especifica si es base o instruct).
- Capacidad de procesar contextos largos (hasta 32K en algunos checkpoints).

Sin embargo, no hay evidencia de que estos checkpoints hayan sido evaluados en tareas concretas, por lo que estas capacidades son teoricas y requieren validacion.

## Casos de uso

No se han documentado casos de uso especificos para este repositorio. Dado que se trata de un experimento de investigacion sobre schedulers de entrenamiento, los usos potenciales son:

- Investigacion academica: analizar el efecto de la longitud del decay WSD en la calidad del modelo final, comparando los distintos checkpoints.
- Fine-tuning posterior: los checkpoints con decay completo (hacia 1e-6 o 0) pueden servir como punto de partida para tareas especificas, aprovechando la estabilidad del entrenamiento WSD.
- Estudio de extrapolacion de contexto: los checkpoints con horizonte 32K permiten evaluar si el decay afecta a la capacidad de manejar secuencias largas.
- Reproducibilidad: al publicar todos los checkpoints, se facilita la reproduccion de experimentos y la comparacion con otros schedulers.

No se recomienda su uso en produccion sin una evaluacion exhaustiva, ya que no hay datos de rendimiento ni garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. El autor no proporciona ninguna evaluacion comparativa con el modelo base o con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 381.9 GB, lo que sugiere que contiene multiples checkpoints en precision completa (probablemente BF16 o FP32). Cada checkpoint individual de un modelo de 4B en BF16 ocupa aproximadamente 8 GB, por lo que el repositorio contiene alrededor de 40-50 checkpoints.
- Para inferencia con un solo checkpoint, se requiere una GPU con al menos 8 GB de VRAM en BF16, o 4 GB en cuantizacion INT4 (si se convierte a GGUF o similar).
- GPUs recomendadas: RTX 3090/4090 (24 GB) para inferencia comoda, o A100/H100 para entrenamiento o evaluacion de multiples checkpoints.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, previa conversion de los pesos a los formatos adecuados (GGUF, etc.).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-4B (original) | 4B | 32K | Apache 2.0 | HuggingFace |
| pinkskin/qwen3-4b-gdn-wsd-ladder | 4B | 16K/32K | no disponible | HuggingFace |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 | HuggingFace |
| Phi-3.5-mini | 3.8B | 128K | MIT | HuggingFace |

La comparativa se limita a modelos de tamano similar. Este repositorio no ofrece mejoras documentadas sobre Qwen3-4B, por lo que su valor es puramente experimental.

## Limitaciones y advertencias

- No hay informacion sobre la licencia, por lo que no se puede garantizar su uso comercial.
- No se han publicado evaluaciones de calidad, sesgos o alucinaciones. El modelo podria presentar comportamientos no deseados.
- Los checkpoints son experimentales y no han sido validados en tareas del mundo real.
- El repositorio contiene multiples versiones con diferentes configuraciones de decay, lo que puede confundir al usuario; es necesario leer cada subcarpeta para entender su configuracion.
- No se especifica si el modelo es base o instruct, por lo que no se puede asumir soporte de chat o tool calling.
- El tamaño del repositorio (381.9 GB) implica un coste de descarga y almacenamiento significativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pinkskin/qwen3-4b-gdn-wsd-ladder
- Perfil del autor: https://huggingface.co/pinkskin
- Repositorio oficial de Qwen3 (modelo base): https://github.com/QwenLM/Qwen3
