# jayzou3773/less-is-moe-qwen3.5-122b-a10b-s1-128-seq8192-intdim-e-50

## Resumen

El modelo `jayzou3773/less-is-moe-qwen3.5-122b-a10b-s1-128-seq8192-intdim-e-50` es una variante podada estructuralmente del modelo base `Qwen/Qwen3.5-122B-A10B`, publicada por el usuario jayzou3773. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de un checkpoint derivado: se ha aplicado el metodo de poda conocido como Less-is-MoE (basado en la magnitud media absoluta del gradiente) para eliminar exactamente el 50 % de las neuronas de las FFN de los expertos enrutados. El resultado es un modelo con 64.129.468.416 parametros reales (segun los tensores safetensors), frente a los 122B del modelo original.

El checkpoint se genera con 128 muestras de calibracion procedentes del dataset `yentinglin/s1K-1.1-trl-format` (revision `58a01564d278477da20ead1bcf1cde8e31f36251`), con ajustes de cargador concretos: modo `train`, campo `messages`, `shuffle_seed=1234`, `seq_length=8192`, truncado por prefijo, sin padding y en BF16, sin ningun paso de optimizador. La variante IntDim-E se caracteriza por mantener una anchura de experto uniforme, a diferencia de las variantes IntDim-L e IntDim-G, que conservan la topologia MoE enrutada y almacenan anchuras compactas por experto en `config.json`.

Su relevancia practica es doble: por un lado, reduce el coste de almacenamiento e inferencia de un MoE de gran tamano (128,3 GB de repositorio, aproximadamente la mitad de parametros del original); por otro, sirve como caso de estudio reproducible de tecnicas de compresion estructural sobre arquitecturas MoE, con hashes publicados de seleccion de filas y de ficheros de tokens para verificar la equivalencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado ninguna evaluacion de calidad posterior a la poda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de texto (`qwen3_5_moe_text`), podado estructuralmente |
| Parametros totales | 64.129.468.416 (dato real de safetensors); el modelo base declara 122B |
| Parametros activos | No disponible (el modelo base declara 10B activos; no se publica el valor tras la poda) |
| Longitud de contexto | No disponible (la calibracion uso `seq_length=8192`, no la ventana del modelo) |
| Tipos de cuantizacion | No disponible; pesos publicados en BF16 safetensors |
| Idiomas soportados | No disponible (no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de solo texto etiquetado como `qwen3_5_moe_text`, derivado de `Qwen/Qwen3.5-122B-A10B`. La modificacion estructural consiste en la poda del 50 % de las neuronas de las FFN de los expertos enrutados mediante el metodo Less-is-MoE mean-absolute-gradient, aplicado sobre el checkpoint origen cargado en BF16. En la variante IntDim-E la anchura de experto es uniforme para todos los expertos; las variantes IntDim-L e IntDim-G del mismo proyecto conservan la topologia MoE enrutada con anchuras compactas por experto almacenadas en `config.json`. La poda se realizo sin ningun paso de optimizador, es decir, no hay recuperacion de calidad mediante reentrenamiento.

Los datos de calibracion son 128 muestras del dataset `yentinglin/s1K-1.1-trl-format`, revision `58a01564d278477da20ead1bcf1cde8e31f36251`, con `shuffle_seed=1234`, `seq_length=8192`, truncado por prefijo y sin padding. Los tensores de tokens especificos del modelo estan publicados en `jayzou3773/less-is-moe-s1-calibration-128-seq8192`, revision `678b4e666183e16ec00376960df03b6381632ed1`. La metadata de exportacion y de equivalencia de mascara cero esta en `experiment-export.json`; el hash de seleccion de filas de origen es `f261e952d4e6d5dec6d37db4ab22636761b215281d33896060fe4467bb352784` y el hash del fichero de tokens es `47214818e5c0acaa6e65d3f212f7fab62937a4085d26394c356e3be1c94fffbf`. No se documenta RLHF, DPO ni ninguna fase de alineamiento adicional en esta ficha.

## Capacidades

- Generacion de texto y uso conversacional, segun las etiquetas `text-generation` y `conversational` del repositorio.
- Razonamiento, codigo, matematicas o vision: no documentado en la informacion disponible. Al tratarse de un derivado podado de `Qwen/Qwen3.5-122B-A10B`, las capacidades heredadas dependen del modelo base, pero no se aporta ninguna medicion que las confirme tras la poda.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidad especial de modo "thinking": no disponible.
- Inferencia con vLLM estandar procedente de la imagen GPU unificada de Less-is-MoE (requisito explicito del autor).

## Casos de uso

- Despliegue de un asistente conversacional autoalojado con menor huella de memoria que el modelo base: al reducir los parametros de 122B a 64,1B, el checkpoint permite servir chat de texto en infraestructura con menos GPUs, siempre que se acepte la perdida de calidad no medida por la poda.
- Investigacion reproducible en compresion de MoE: el repositorio publica hashes de seleccion de filas, fichero de tokens y metadata de equivalencia de mascara cero, lo que permite replicar el experimento Less-is-MoE IntDim-E sobre el mismo conjunto de calibracion de 128 muestras.
- Comparacion controlada de variantes de poda: junto con IntDim-L e IntDim-G, sirve para estudiar el compromiso entre anchura uniforme de experto y anchura compacta por experto sobre el mismo modelo base.
- Base para un ajuste fino posterior: al no haberse ejecutado ningun paso de optimizador durante la poda, el checkpoint es un punto de partida razonable para un fine-tuning de recuperacion con datos propios, si el presupuesto de GPU lo permite.
- Servicio de generacion de texto en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 declarada facilita la integracion en productos propietarios, sujeto en todo caso a las condiciones del modelo base.
- Experimentacion en pipelines de inferencia con vLLM: dado que el autor exige vLLM estandar de la imagen unificada Less-is-MoE, encaja en flujos de evaluacion interna que ya usen ese stack, no en despliegues con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el checkpoint podado ni comparado con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 64,13B de parametros ocupan aproximadamente 128 GB solo en pesos, mas cache KV y overhead, por lo que se necesitan varios aceleradores. Las estimaciones por cuantizacion (INT8 en torno a 64 GB, INT4 en torno a 32-35 GB) son calculos derivados del recuento de parametros, no valores publicados por el autor.
- GPU recomendadas: no hay recomendacion oficial. Por volumen de pesos, un despliegue BF16 requiere configuraciones tipo multiples A100 80 GB o H100 80 GB. En consumer, una RTX 4090 (24 GB) no puede alojar el modelo completo ni siquiera en INT4 sin offloading agresivo a CPU.
- Cabe en consumer GPU: no de forma completa con la informacion disponible; solo mediante cuantizacion no publicada y offloading, con impacto severo en latencia.
- Opciones de despliegue: vLLM estandar de la imagen GPU unificada de Less-is-MoE, segun requisito explicito del autor. No se mencionan soportes para llama.cpp, Ollama, TGI ni otros motores, y el formato publicado es safetensors, sin GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IntDim-E 50 %) | 64,13B | No disponible | Apache 2.0 | safetensors BF16 | 0 descargas, 0 likes |
| Qwen/Qwen3.5-122B-A10B (base) | 122B (10B activos declarados) | No disponible | No disponible en la informacion | No disponible | Modelo de referencia del que deriva |
| Variantes IntDim-L / IntDim-G del mismo proyecto | No disponible | No disponible | Apache 2.0 (segun el mismo proyecto) | safetensors | Referenciadas en la model card; sin datos publicos en la informacion disponible |

No se dispone de datos de rendimiento de ninguno de los tres para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La poda elimina el 50 % de las neuronas de las FFN de los expertos enrutados sin ningun paso de optimizador, por lo que es esperable una degradacion de calidad que el autor no cuantifica en ningun benchmark.
- No hay evaluaciones publicadas: ni MMLU, ni generacion de codigo, ni tareas multilingues. Cualquier uso en produccion exige una evaluacion propia previa.
- Requisito de despliegue restrictivo: el autor indica que la inferencia necesita vLLM estandar de la imagen GPU unificada de Less-is-MoE. No hay soporte declarado para llama.cpp, Ollama o TGI, ni pesos GGUF.
- Ausencia de informacion sobre idiomas soportados y sobre la longitud de contexto real del checkpoint; los 8192 tokens de la calibracion son un parametro del experimento, no una especificacion de ventana.
- Riesgo de alucinacion: no documentado, pero inherente a los modelos generativos de texto y potencialmente agravado por la poda sin recuperacion.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base `Qwen/Qwen3.5-122B-A10B`, no incluidas en la informacion proporcionada.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes, con creacion y ultima actualizacion el 18 de septiembre de 2026, ocho minutos despues de la creacion.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayzou3773/less-is-moe-qwen3.5-122b-a10b-s1-128-seq8192-intdim-e-50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Dataset de calibracion (tensores de tokens): https://huggingface.co/jayzou3773/less-is-moe-s1-calibration-128-seq8192
- Dataset de origen de la calibracion: https://huggingface.co/datasets/yentinglin/s1K-1.1-trl-format
- Paper, blog o repositorio del metodo Less-is-MoE: no disponible en la informacion proporcionada.
- Demo: no disponible.
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo.
