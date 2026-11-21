# scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ4e-mtp

## Resumen

Swift1.5-Qwen3.8-Flash-Next-oQ4e-mtp es una cuantizacion mixta de 4 bits del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El checkpoint original no esta documentado en la informacion disponible, pero su nombre sugiere una variante afinada de la familia Qwen3 con un componente "Flash" y soporte de decodificacion especulativa mediante una cabeza MTP (multi-token prediction). El modelo cuenta con 180.000 millones de parametros totales, de los cuales 51.200 millones corresponden a una tabla de embeddings N-gram, lo que apunta a una arquitectura con componentes de recuperacion o memoria basada en n-gramas ademas del transformer principal.

La relevancia de esta publicacion es practica: reduce un checkpoint de 180.000 millones de parametros a 107,67 GB en disco (100,275 GiB) con un promedio efectivo de 4,785 bits por peso, lo que lo hace desplegable en hardware de Apple Silicon con suficiente memoria unificada. La cuantizacion es mixta: la mayor parte de los pesos del modelo de lenguaje usa affine 4-bit con grupo de 64, mientras que una fraccion pequena se conserva en 8-bit y BF16 para preservar precision en capas sensibles.

El modelo esta empaquetado exclusivamente para MLX, la libreria de Apple, y no se ofrecen variantes GGUF ni safetensors genericos mas alla del formato nativo de MLX. La model card no incluye informacion sobre licencia, idiomas, benchmarks ni datos de entrenamiento del modelo base, por lo que varias secciones de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tabla de embeddings N-gram, cabeza MTP (multi-token prediction) y modulo de vision; detalles completos no disponibles |
| Parametros totales | 180.000.000.000 (180.000B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64 (68,507% de los pesos), affine 8-bit grupo 128 (0,134%), affine 8-bit grupo 64 (2,628%), BF16 (0,287%), N-gram affine 4-bit grupo 32 (28,445%); promedio efectivo 4,785 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors para MLX (libreria mlx), cuantizacion oQ de oMLX v0.7.4.dev1 |
| Tamano del repositorio | 107,67 GB (100,275 GiB) |
| Desglose de almacenamiento | Lenguaje: 125.744B pesos / 68,227 GiB; N-gram: 51.200B / 29,802 GiB; Vision: 0,449B / 0,836 GiB; MTP head: 2,607B / 1,409 GiB |

## Arquitectura y entrenamiento

La informacion disponible solo describe la estructura de almacenamiento del checkpoint cuantizado, no la arquitectura interna del modelo base. Se puede inferir que el modelo combina un transformer de lenguaje de aproximadamente 125.744B parametros logicos con una tabla de embeddings N-gram de 51.200B parametros, un modulo de vision de 0,449B y una cabeza MTP de 2,607B. La presencia de una cabeza MTP indica soporte para decodificacion especulativa o prediccion multi-token, una tecnica que acelera la generacion al proponer varios tokens por paso y verificarlos en paralelo.

La cuantizacion se realizo con oQ (oMLX v0.7.4.dev1), una herramienta de cuantizacion de precision mixta que asigna distintos niveles de bits segun la sensibilidad de cada tensor. La tabla N-gram se cuantiza a 4 bits con grupo de 32 (5,00 bits/peso efectivos), mientras que el modelo de lenguaje usa mayoritariamente 4 bits con grupo de 64. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base empleo RLHF, DPO u otras tecnicas de alineamiento.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un transformer de lenguaje de gran escala, aunque no se detallan capacidades especificas en la informacion disponible.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,449B parametros, lo que sugiere capacidad multimodal de entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP de 2,607B parametros permite prediccion multi-token, orientada a acelerar la inferencia.
- Memoria N-gram: la tabla de embeddings N-gram de 51.200B parametros sugiere algun mecanismo de recuperacion o memoria basada en secuencias, aunque su funcion exacta no esta documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 100,275 GiB esta disenado para MLX y puede ejecutarse en equipos Mac con memoria unificada igual o superior a 128 GB, lo que permite desplegar un modelo de 180.000B parametros en hardware de escritorio.
- Aceleracion de generacion con MTP: la cabeza de prediccion multi-token permite implementar decodificacion especulativa en pipelines de generacion de texto, reduciendo la latencia por token en comparacion con decodificacion autoregresiva estandar.
- Procesamiento multimodal de imagenes: el modulo de vision integrado permite construir aplicaciones de analisis de imagenes combinadas con texto, como descripcion de documentos o extraccion de informacion visual.
- Investigacion en cuantizacion mixta: el checkpoint sirve como referencia para estudiar el impacto de la cuantizacion oQ de 4,785 bits/peso en un modelo de gran escala, comparando la distribucion de bits entre componentes.
- Experimentacion con memoria N-gram: la tabla de 51.200B parametros permite investigar tecnicas de recuperacion basada en n-gramas en modelos de lenguaje de gran escala.
- Evaluacion de modelos base comunitarios: al ser una variante afinada de Qwen3 publicada por un autor independiente, puede usarse para comparar el rendimiento de fine-tunes comunitarios frente a los modelos oficiales de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 100,275 GiB en disco; la inferencia requiere al menos esa cantidad de memoria mas el espacio para el contexto y los estados intermedios, por lo que se recomienda un minimo de 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada de 128 GB o superior (por ejemplo, Mac Studio con M3 Ultra o M4 Ultra); no es compatible con CUDA de forma nativa al estar empaquetado para MLX.
- Cabe en consumer GPU: no en GPU de consumo con 24 GB o 48 GB; solo en configuraciones de Apple Silicon de gama alta con 128 GB o mas.
- Opciones de despliegue: MLX (libreria nativa), oMLX para carga de la cuantizacion oQ; no se dispone de variantes GGUF para llama.cpp u Ollama, ni de soporte documentado para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-oQ4e-mtp | 180.000B | no disponible | 4,785 bits/peso (oQ mixta) | no disponible | MLX safetensors |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | no disponible | no disponible | sin cuantizar | no disponible | no disponible |
| Alternativas de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; es necesario contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- No se documentan los idiomas soportados ni el rendimiento multilingue.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa de calidad o sesgos.
- El modelo esta empaquetado exclusivamente para MLX, lo que limita su despliegue a hardware Apple Silicon y excluye GPU NVIDIA o AMD sin conversion manual.
- La cuantizacion a 4 bits puede degradar la precision en tareas sensibles, especialmente en razonamiento matematico y generacion de codigo, aunque la precision mixta mitiga parte del efecto.
- Al ser un fine-tune comunitario de un modelo base no documentado, existe riesgo de alucinacion y de sesgos heredados del entrenamiento original, sin que se hayan publicado evaluaciones al respecto.
- La tabla N-gram de 51.200B parametros representa el 28,4% del checkpoint; su comportamiento bajo cuantizacion a 4 bits con grupo de 32 no esta evaluado publicamente.
- El checkpoint fue re-cuantizado el 2026-11-11 con oMLX v0.7.4.dev1; versiones anteriores pueden presentar diferencias, por lo que conviene verificar la fecha de descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Swift1.5-Qwen3.8-Flash-Next-oQ4e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
