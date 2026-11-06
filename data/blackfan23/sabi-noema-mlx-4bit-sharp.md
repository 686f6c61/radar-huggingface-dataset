# blackfan23/sabi-noema-mlx-4bit-Sharp

## Resumen

`sabi-noema-mlx-4bit-Sharp` es una cuantizacion en 4 bits del modelo `sabicap/sabi-noema`, publicada por el usuario blackfan23 (Julius) en Hugging Face. Se trata de una conversion realizada con Apple MLX (`mlx.core.quantize`) en modo affine con tamano de grupo 64, pensada para ejecutar el modelo en hardware Apple Silicon (M1/M2/M3/M4) de forma eficiente en memoria. El repositorio contiene unicamente pesos cuantizados, no un modelo entrenado desde cero.

El modelo base `sabi-noema` es un fine-tune publicado por sabicap, y los tags del repositorio indican que su arquitectura subyacente es `qwen3_5`, lo que lo situa en la familia Qwen 3.5. Con 27.356.728.560 parametros totales (aproximadamente 27,4 mil millones), se trata de un modelo de gran tamano que en su version original en precision completa ocupa unos 50,96 GB, reducidos a unos 16,22 GB tras la cuantizacion.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en equipos con memoria unificada de 32 GB o superior, algo inviable con los pesos originales. La licencia Apache 2.0 facilita su uso comercial, aunque la informacion disponible sobre el modelo base es muy limitada: no se documentan idiomas, pipeline, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base corresponde, segun los tags del repositorio, a la familia Qwen 3.5, es decir, un transformer decoder-only. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni tipo de atencion (completa o hibrida) en la informacion proporcionada. Tampoco se documenta si emplea Mixture of Experts; el recuento de parametros totales coincide con el de parametros del checkpoint, lo que sugiere un modelo denso, pero no puede confirmarse.

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o instruction tuning en el modelo base `sabicap/sabi-noema`. La unica informacion tecnica concreta es la relativa al proceso de cuantizacion: se cuantizaron 581 capas lineales con `mlx.core.quantize` en modo affine a 4 bits con grupo de 64, mientras que 603 capas (normalizaciones, convoluciones 1D, sesgos 1D y embeddings) se mantuvieron sin cuantizar. El resultado pasa de ~50,96 GB a ~16,22 GB de pesos.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base (no documentada explicitamente).
- Razonamiento y conocimiento general: presumible por el tamano (~27B) y la familia Qwen 3.5, pero sin confirmacion en la informacion disponible.
- Generacion de codigo: no disponible en la documentacion.
- Matematicas: no disponible en la documentacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el caso de uso principal y documentado es ejecutar el modelo en Macs con chip M-series gracias al formato MLX 4-bit, que reduce la huella de memoria a ~16,22 GB y permite cargarlo en equipos con 32 GB de memoria unificada.
- Prototipado de aplicaciones de texto en local: desarrolladores que quieran integrar un modelo de ~27B en sus flujos sin depender de APIs externas pueden usar este checkpoint con la libreria `mlx-lm` para generar texto en notebooks o scripts.
- Evaluacion comparativa de cuantizaciones: sirve para medir la perdida de calidad de la cuantizacion affine 4-bit frente a los pesos originales en tareas de generacion, util para decidir el nivel de compresion adecuado.
- Desarrollo offline y entornos con privacidad estricta: al ejecutarse localmente, permite procesar texto sin enviar datos a terceros, adecuado para prototipos en entornos con requisitos de confidencialidad.
- Fine-tuning ligero o adaptadores sobre la base cuantizada: aunque no esta documentado, el formato MLX permite experimentar con LoRA sobre los pesos cuantizados en hardware Apple.
- Experimentacion academica con modelos de gran tamano: investigadores con equipos Apple pueden reproducir experimentos con un modelo de ~27B sin acceso a GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~16,22 GB solo para pesos; con overhead de KV cache y activaciones, se recomienda un minimo de 24-32 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). No es compatible con CUDA de forma nativa al estar en formato MLX.
- Cabe en consumer GPU: si, en equipos Apple con 32 GB o mas de memoria unificada; en GPUs NVIDIA consumer (RTX 4090 con 24 GB) requeriria conversion previa a otro formato (por ejemplo GGUF), no incluida en este repositorio.
- Opciones de despliegue: `mlx-lm` (libreria oficial de MLX para LLMs), scripts propios con `mlx.core`. No es compatible directamente con vLLM, TGI, llama.cpp u Ollama sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| sabi-noema-mlx-4bit-Sharp | ~27,4B | no disponible | 4-bit affine (MLX) | Apache 2.0 | safetensors MLX |
| sabicap/sabi-noema (base) | ~27,4B | no disponible | sin cuantizar (~50,96 GB) | Apache 2.0 | safetensors |
| Qwen 3.5 (familia, referencia) | no disponible | no disponible | multiple | no disponible | multiple |

La comparativa con alternativas de la misma categoria no puede completarse porque no se dispone de datos de contexto, rendimiento ni benchmarks del modelo base ni de sus competidores directos en la informacion proporcionada.

## Limitaciones y advertencias

- La documentacion del modelo base es practicamente inexistente: no se especifican idiomas, contexto, datos de entrenamiento ni evaluaciones, lo que impide garantizar su comportamiento en produccion.
- La cuantizacion a 4 bits introduce degradacion de calidad respecto a los pesos originales; la magnitud de esa perdida no esta medida en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones que lo cuantifiquen.
- Sesgos conocidos: no documentados, pero previsibles por el corpus de entrenamiento del modelo base, del que no se dispone informacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base `sabicap/sabi-noema` antes de desplegarlo.
- Compatibilidad limitada: el formato MLX solo se ejecuta de forma nativa en Apple Silicon; no es portable a CUDA sin conversion.
- El repositorio tiene muy poca traccion (25 descargas, 0 likes) y fue creado en 2026-10-25, por lo que no cuenta con validacion de la comunidad.
- No se garantiza que las 603 capas no cuantizadas (embeddings, normas) mantengan la precision original en todos los casos de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blackfan23/sabi-noema-mlx-4bit-Sharp
- Modelo base: https://huggingface.co/sabicap/sabi-noema
- Apple MLX (repositorio oficial): https://github.com/ml-explore/mlx
