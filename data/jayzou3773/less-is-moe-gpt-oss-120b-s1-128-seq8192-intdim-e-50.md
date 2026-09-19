# jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-e-50

## Resumen

Este checkpoint es una version podada estructuralmente de `openai/gpt-oss-120b`, publicada por el usuario `jayzou3773` bajo el nombre `less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-e-50`. Aplica el metodo de poda Less-is-MoE basado en la magnitud absoluta media del gradiente (mean-absolute-gradient) y elimina exactamente el 50 % de las neuronas de las FFN de los expertos enrutados del modelo base. El resultado es un modelo MoE de 59.484.992.832 parametros totales en formato BF16, frente a los aproximadamente 117.000 millones del modelo original, con un repositorio de 119,0 GB.

El problema que aborda es el coste de despliegue de los modelos MoE grandes: al reducir a la mitad el ancho de las FFN de los expertos enrutados, el checkpoint disminuye el numero de parametros almacenados y la huella de memoria, manteniendo presumiblemente la topologia de enrutamiento del modelo original. La poda se realizo sin ningun paso de optimizador, es decir, no hay reentrenamiento ni ajuste fino posterior: es una cirugia estructural guiada unicamente por estadisticos calculados sobre 128 muestras de calibracion.

Es relevante ahora porque forma parte de una linea de trabajo reciente sobre compresion de MoE (Less-is-MoE) y porque el ecosistema de `gpt-oss` cuenta con soporte de inferencia en vLLM. No obstante, se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluacion publicados y con requisitos de inferencia muy especificos (imagen GPU unificada de Less-is-MoE con vLLM stock), por lo que no debe considerarse un modelo listo para produccion sin validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de la familia `gpt_oss`, con poda estructural del 50 % de las neuronas de las FFN de los expertos enrutados (variante IntDim-E, ancho de experto uniforme) |
| Parametros totales | 59.484.992.832 (dato real del repositorio en safetensors) |
| Parametros activos | no disponible en la informacion proporcionada para el checkpoint podado; el modelo base `openai/gpt-oss-120b` declara del orden de 5.000 millones de parametros activos |
| Longitud de contexto | no disponible; la calibracion se realizo con `seq_length=8192`, que no define la ventana de inferencia |
| Tipos de cuantizacion | BF16 unicamente; el checkpoint origen en MXFP4 fue desquantizado explicitamente a BF16 antes del calculo de puntuaciones y de la poda. No se publican versiones GGUF, AWQ, GPTQ ni INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); repositorio de 119,0 GB |
| Modelo base | `openai/gpt-oss-120b` (fine-tune estructural, no entrenamiento adicional) |
| Metodo de poda | Less-is-MoE, mean-absolute-gradient |
| Datos de calibracion | 128 muestras de `yentinglin/s1K-1.1-trl-format`, revision `58a01564d278477da20ead1bcf1cde8e31f36251` |
| Configuracion del cargador | `train`, `messages`, `shuffle_seed=1234`, `seq_length=8192`, truncacion por prefijo, sin padding, BF16, sin paso de optimizador |
| Tensores de tokens | publicados en `jayzou3773/less-is-moe-s1-calibration-128-seq8192`, revision `678b4e666183e16ec00376960df03b6381632ed1` |
| Hashes de referencia | seleccion de filas fuente `f261e952d4e6d5dec6d37db4ab22636761b215281d33896060fe4467bb352784`; fichero de tokens `1d487883f20fcbc52d7642695c87313d2ea2e9c53c193a3ed7ad6eac8f9d272a` |
| Metadatos de exportacion | `experiment-export.json` (equivalencia de exportacion y de mascara cero) |
| Fecha de creacion | 2026-09-18 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer de tipo mezcla de expertos (MoE) de la familia `gpt_oss`, con expertos enrutados en las capas FFN. La intervencion aplicada es una poda estructural, no un ajuste fino: se calcula una puntuacion mean-absolute-gradient para las neuronas de las FFN de los expertos enrutados y se elimina exactamente el 50 % de ellas. Esto reduce el numero total de parametros hasta los 59.484.992.832, aproximadamente la mitad del modelo base. Segun la model card, la variante IntDim-E mantiene un ancho de experto uniforme, a diferencia de las variantes IntDim-L e IntDim-G, que conservan la topologia MoE enrutada original y almacenan anchos compactos por experto en `config.json`.

El procedimiento de calibracion esta documentado con detalle reproducible: 128 muestras del dataset `yentinglin/s1K-1.1-trl-format` en una revision concreta, con `shuffle_seed=1234`, `seq_length=8192`, truncacion por prefijo, sin padding y en BF16, sin ningun paso de optimizador. El checkpoint MXFP4 original se desquantizo a BF16 antes de puntuar y podar. Se publican los tensores de tokens exactos, los hashes de seleccion de filas y del fichero de tokens, y metadatos de equivalencia de exportacion y de mascara cero en `experiment-export.json`, lo que permite reproducir y auditar la poda. No hay informacion disponible sobre reentrenamiento, destilacion, RLHF ni DPO posteriores a la poda.

## Capacidades

- Generacion de texto y conversacion: heredadas del modelo base `openai/gpt-oss-120b`, aunque no se aportan evaluaciones especificas del checkpoint podado.
- Razonamiento y resolucion de problemas: capacidad esperada por herencia del modelo base; no verificada en la informacion disponible.
- Generacion de codigo y matematicas: capacidad esperada por herencia del modelo base; no verificada en la informacion disponible.
- Tool calling y function calling: el modelo base soporta llamadas a herramientas mediante el formato Harmony; no se confirma en la model card si la poda preserva esta capacidad.
- Uso agentico y razonamiento multi-paso: no disponible; el modelo base esta disenado para flujos agenticos, pero no hay evaluacion del checkpoint podado.
- Multilingue: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (vision, audio, modo thinking): no disponibles para este checkpoint.
- Restriccion de despliegue relevante: la inferencia requiere vLLM stock procedente de la imagen GPU unificada de Less-is-MoE; no se documenta soporte en otros motores.

## Casos de uso

- Investigacion sobre compresion de modelos MoE: el checkpoint sirve como punto de comparacion reproducible frente al modelo base, ya que se publican los hashes, la configuracion de calibracion y los tensores de tokens exactos, lo que permite medir la degradacion atribuible a la poda.
- Experimentacion academica con presupuesto de GPU limitado: al reducir los parametros totales de ~117.000 millones a 59.484.992.832, se puede servir en 2 GPU de 80 GB en BF16 en lugar de requerir un nodo mayor, lo que abarata la reproduccion de experimentos.
- Servicio de generacion de texto autoalojado en fase de prototipo: con vLLM stock y tensor parallelism se puede exponer un endpoint compatible con la API de OpenAI para validar productos conversacionales antes de invertir en el modelo completo.
- Evaluacion de pipelines de agentes y tool calling: permite comprobar si las tasas de exito en llamadas a funciones se mantienen tras eliminar el 50 % de neuronas de las FFN enrutadas, una pregunta abierta en la literatura de poda de MoE.
- Estudio de latencia y throughput en despliegues multi-GPU: al ser un MoE con solo una fraccion de parametros activos por token, es un banco de pruebas razonable para medir el equilibrio entre ancho de banda de memoria y computo en configuraciones de 2 a 4 aceleradores.
- Base para tecnicas de recuperacion posteriores: el checkpoint permite probar estrategias de recuperacion de calidad (ajuste fino ligero, destilacion desde el modelo original, LoRA) sobre un modelo ya podado y comparar coste frente a partir del modelo completo.
- Analisis de sensibilidad de calibracion: dado que la poda depende de 128 muestras concretas, se puede replicar el experimento cambiando el dataset o el numero de muestras para estudiar la robustez del criterio mean-absolute-gradient.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de perplejidad, y la busqueda web realizada no devolvio resultados relacionados con el modelo (los unicos resultados obtenidos correspondian a un centro educativo sin relacion con el tema). Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en BF16: los 59.484.992.832 parametros ocupan alrededor de 119 GB solo en pesos (2 bytes por parametro), coherente con el tamano de repositorio de 119,0 GB. Hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto efectiva, que no esta documentada para este checkpoint.
- No cabe en una unica GPU de 80 GB en BF16.
- Configuraciones viables con tensor parallelism: 2 x H100 80 GB (160 GB) o 2 x A100 80 GB, con margen limitado para cache KV; 4 x A100 80 GB o 4 x H100 80 GB ofrecen holgura para contextos largos y lotes mayores.
- GPU de consumo: no es viable en BF16 en una RTX 4090 (24 GB) ni en una RTX 5090. Al no publicarse cuantizaciones GGUF o de 4 bits, no existe una ruta de despliegue monousuario en hardware de consumo a partir de este repositorio.
- Opciones de despliegue: vLLM stock desde la imagen GPU unificada de Less-is-MoE, segun indica la model card. No se documenta soporte para llama.cpp, Ollama, TGI, TensorRT-LLM ni transformers estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| `jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-e-50` | 59.484.992.832 | no disponible | no disponible | Apache 2.0 | Poda estructural del 50 % de las FFN de expertos enrutados, ancho uniforme; exige vLLM de la imagen Less-is-MoE |
| `openai/gpt-oss-120b` (modelo base) | ~117.000 millones | ~5.000 millones (cifras publicadas por OpenAI para el modelo base) | 131.072 tokens (segun especificaciones publicas del modelo base) | Apache 2.0 | Modelo original sin podar, en MXFP4, con soporte amplio en vLLM y otros motores |
| Variantes Less-is-MoE IntDim-L e IntDim-G (mismo autor) | no disponible | no disponible | no disponible | Apache 2.0 (presumible, no confirmado) | Conservan la topologia MoE enrutada y almacenan anchos por experto en `config.json`; no se aportan metricas |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo de estas alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, perplejidad ni evaluaciones cualitativas publicadas. Se desconoce la magnitud real de la degradacion provocada por eliminar el 50 % de las neuronas de las FFN de los expertos enrutados.
- Riesgo de alucinacion: no cuantificado para este checkpoint; en modelos podados sin reentrenamiento el riesgo suele aumentar, pero no hay datos que lo confirmen aqui.
- Sesgos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o seguridad, ni del modelo base ni del checkpoint podado.
- Idiomas: no se declaran idiomas soportados; se desconoce si la poda afecta de forma desigual al rendimiento multilingue.
- Dependencia estricta del entorno de inferencia: la model card indica que se requiere vLLM stock de la imagen GPU unificada de Less-is-MoE. Sin ese entorno, el modelo puede no cargar o producir resultados incorrectos; no se documenta compatibilidad con llama.cpp, Ollama o TGI.
- Sin cuantizaciones alternativas: solo BF16, lo que descarta despliegues en GPU de consumo y encarece el servicio en produccion.
- Reproducibilidad condicionada a la calibracion: el resultado depende de 128 muestras concretas de `yentinglin/s1K-1.1-trl-format`; cambiar el dataset, el orden (`shuffle_seed=1234`) o la longitud de secuencia altera las neuronas eliminadas. Los hashes publicados permiten verificar la coincidencia exacta.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base `openai/gpt-oss-120b` y del dataset de calibracion, y conservar los avisos de atribucion correspondientes.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento conocido; no es un checkpoint con validacion comunitaria.
- Uso en produccion: no recomendado sin una evaluacion propia en el dominio objetivo y sin comparar contra el modelo base sin podar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-gpt-oss-120b-s1-128-seq8192-intdim-e-50
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de calibracion (tensores de tokens del checkpoint): https://huggingface.co/datasets/jayzou3773/less-is-moe-s1-calibration-128-seq8192
- Dataset fuente de calibracion: https://huggingface.co/datasets/yentinglin/s1K-1.1-trl-format
- Metadatos de exportacion y equivalencia: fichero `experiment-export.json` dentro del repositorio del modelo
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las unicas respuestas obtenidas corresponden a un centro educativo sin relacion con el modelo.
