# majentik/Qwen3.8-27B-MLX-MXFP4

## Resumen

El modelo `majentik/Qwen3.8-27B-MLX-MXFP4` es una variante cuantizada del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por el usuario majentik para su ejecución en hardware Apple Silicon mediante la librería MLX. La cuantización se realiza en formato MXFP4 (4-bit, group size 32) sobre el text tower, mientras que la vision tower y el projector se mantienen en BF16, lo que permite conservar las capacidades de procesamiento de imágenes del modelo original con un uso de memoria reducido.

Esta ficha resulta relevante para desarrolladores que necesitan ejecutar un modelo de 27B parámetros en equipos Apple con recursos limitados, ya que la cuantización MXFP4 reduce significativamente el peso del modelo (el repositorio ocupa 15.2 GB) y permite su uso con `mlx-lm`. El modelo está licenciado bajo Apache-2.0, lo que facilita su uso comercial y la integración en aplicaciones propietarias.

El repositorio forma parte de una serie de cuantizaciones del mismo modelo base (2-bit, 3-bit, 4-bit, 5-bit, 6-bit, 8-bit y MXFP4), lo que ofrece a los usuarios distintas opciones de equilibrio entre calidad y consumo de memoria. No se proporcionan datos sobre el contexto, los idiomas soportados ni los benchmarks del modelo cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal Qwen3.8-27B) |
| Parametros totales | no disponible (el archivo safetensors contiene 5.505.879.280 parametros, pero no se corresponde con el total del modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4-bit, group size 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen/Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text. La cuantizacion se aplica exclusivamente al text tower, que se convierte a MXFP4 con un group size de 32, mientras que la vision tower y el projector se conservan en BF16. Esta estrategia permite mantener las capacidades de vision del modelo original sin necesidad de cuantizar toda la red.

La conversion se realizo con la herramienta `mlx_lm.convert` de la libreria mlx-lm (version 0.31.3). El proceso de cuantizacion no implica entrenamiento adicional; se trata de una conversion post-entrenamiento. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO.

El repositorio incluye una prueba de coherencia determinista (smoke gate) que verifica la generacion de 48 tokens en modo chat, comprobando que no haya bucles de repeticion, gibberish multi-script ni restos de tokens especiales. El resultado fue correcto.

## Capacidades

- Generacion de texto y conversacion multimodal (image-text-to-text), gracias a la vision tower en BF16.
- Inferencia en Apple Silicon mediante MLX, con soporte para `mlx-lm`.
- Cuantizacion MXFP4 que reduce el uso de memoria frente al modelo original.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se especifican las capacidades multilingues del modelo cuantizado.

## Casos de uso

- Inferencia local en Mac: el modelo puede ejecutarse en equipos Apple con suficiente memoria unificada, usando `mlx_lm.generate` para generar texto o mantener conversaciones. Es adecuado para prototipado y desarrollo sin depender de servicios en la nube.
- Aplicaciones multimodales en Apple Silicon: al conservar la vision tower en BF16, el modelo puede procesar imagenes junto con texto, por ejemplo para describir fotografias o responder preguntas visuales, todo en local.
- Evaluacion de cuantizaciones: al existir multiples variantes (2-bit a 8-bit y MXFP4), los desarrolladores pueden comparar la calidad de salida frente al consumo de memoria y elegir la opcion mas adecuada para su hardware.
- Despliegue en entornos con restricciones de memoria: la cuantizacion MXFP4 reduce el peso del modelo a 15.2 GB, lo que permite su uso en Mac con 16 GB o 32 GB de RAM unificada, donde el modelo original en BF16 no cabria.
- Integracion en pipelines de MLX: al ser un formato nativo de MLX, puede cargarse directamente con `mlx_lm.load` y utilizarse en aplicaciones que ya usan la libreria, sin conversiones adicionales.
- Educacion e investigacion: sirve como ejemplo de cuantizacion MXFP4 aplicada a un modelo multimodal, util para estudiar el impacto de la cuantizacion en la calidad de salida y en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye una prueba de coherencia (smoke gate) que no proporciona metricas cuantitativas de calidad o rendimiento.

## Requisitos de hardware

- El modelo esta diseñado exclusivamente para Apple Silicon (M1, M2, M3 y posteriores) con soporte MLX.
- VRAM estimada: no disponible, pero el tamaño del repositorio es de 15.2 GB, por lo que se recomienda al menos 16 GB de memoria unificada para cargar el modelo completo. Con 32 GB se dispondria de margen para el contexto y el procesamiento de imagenes.
- GPU recomendadas: no aplica (no es CUDA); se usa la GPU integrada de Apple Silicon via MLX.
- Opciones de despliegue: `mlx-lm` (generacion y carga), compatible con el ecosistema MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (cuantizaciones MLX de Qwen3.8-27B). Sin embargo, el propio repositorio ofrece otras cuantizaciones del mismo modelo base, que pueden considerarse alternativas:

| Modelo | Cuantizacion | Tamano del repo (aprox.) | Licencia |
|---|---|---|---|
| majentik/Qwen3.8-27B-MLX-2bit | 2-bit | no disponible | Apache-2.0 |
| majentik/Qwen3.8-27B-MLX-3bit | 3-bit | no disponible | Apache-2.0 |
| majentik/Qwen3.8-27B-MLX-4bit | 4-bit | no disponible | Apache-2.0 |
| majentik/Qwen3.8-27B-MLX-5bit | 5-bit | no disponible | Apache-2.0 |
| majentik/Qwen3.8-27B-MLX-6bit | 6-bit | no disponible | Apache-2.0 |
| majentik/Qwen3.8-27B-MLX-8bit | 8-bit | no disponible | Apache-2.0 |
| majentik/Qwen3.8-27B-MLX-MXFP4 | MXFP4 (4-bit) | 15.2 GB | Apache-2.0 |

El modelo original Qwen/Qwen3.8-27B (sin cuantizar) tambien es una alternativa, pero requiere mas memoria y no esta optimizado para MLX.

## Limitaciones y advertencias

- La cuantizacion MXFP4 puede degradar la calidad de las respuestas en comparacion con el modelo original en BF16, especialmente en tareas que requieren precision numerica alta.
- El modelo solo es compatible con Apple Silicon; no puede ejecutarse en GPUs NVIDIA o AMD sin una conversion adicional a otros formatos.
- No se proporciona informacion sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda validar el comportamiento en el caso de uso concreto antes de desplegarlo en produccion.
- El numero de parametros del archivo safetensors (5.5B) no coincide con el nombre del modelo (27B), lo que sugiere que el archivo contiene solo una parte de los pesos (probablemente el text tower cuantizado). Esto puede causar confusion al estimar el tamaño real del modelo.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas especificas es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.8-27B tambien este bajo la misma licencia (se indica que si, segun la model card).

## Enlaces

- Repositorio del modelo: https://huggingface.co/majentik/Qwen3.8-27B-MLX-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Otras cuantizaciones del mismo autor:
  - https://huggingface.co/majentik/Qwen3.8-27B-MLX-2bit
  - https://huggingface.co/majentik/Qwen3.8-27B-MLX-3bit
  - https://huggingface.co/majentik/Qwen3.8-27B-MLX-4bit
  - https://huggingface.co/majentik/Qwen3.8-27B-MLX-5bit
  - https://huggingface.co/majentik/Qwen3.8-27B-MLX-6bit
  - https://huggingface.co/majentik/Qwen3.8-27B-MLX-8bit
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
