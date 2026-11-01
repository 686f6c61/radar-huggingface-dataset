# devin-lai/Hi3Dv1.0-mlx-int8

## Resumen

Hi3Dv1.0-mlx-int8 es una cuantizacion en formato MLX de 8 bits del modelo Hi3Dv1.0, un sistema de refinamiento geometrico image-to-3D desarrollado originalmente por hi3d-official. El modelo resuelve una tarea concreta: a partir de una imagen de referencia y una malla 3D gruesa ya existente, refina la geometria para producir una malla de mayor calidad (archivo GLB). No se trata de un modelo generativo de texto ni de un LLM, sino de un pipeline de vision y geometria 3D.

La version aqui descrita ha sido cuantizada por Devin Lai especificamente para Apple Silicon mediante la libreria MLX. Los pesos del transformer se almacenan como enteros de 8 bits con cuantizacion afin por bloques, mientras que el computo se realiza en FP16 y los tensores sensibles conservan su precision original. El objetivo es reducir el espacio en disco y el uso de memoria en equipos Mac con chip de la familia M.

Es relevante ahora porque permite ejecutar un pipeline de refinamiento 3D de cierta complejidad en hardware consumer de Apple, sin GPU dedicada, con checkpoints de entre 2,28 GiB (resolucion 512³) y 4,22 GiB (1024³/1536³). La licencia es la Hi3D Open License Agreement v1.0, no una licencia permisiva estandar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con VAE compartido (pipeline image-to-3D con refinamiento geometrico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | MLX affine INT8 por bloques; computo en FP16; tensores sensibles en precision original |
| Idiomas soportados | no disponible (modelo de imagen a 3D, sin interfaz de lenguaje) |
| Licencia | hi3d-open-license-agreement-v1.0 |
| Formato de pesos | safetensors en formato MLX (afin 8 bits) |
| Tamano del repo | 4,2 GB |
| Tamano de checkpoint (512³) | 2,28 GiB |
| Tamano de checkpoint (1024³/1536³) | 4,22 GiB |
| Libreria de inferencia | MLX (CLI `hi3d-mlx`) |
| Resoluciones soportadas | 512³, 1024³, 1536³ (esta ultima reutiliza transformer_1024) |
| Modelo base | hi3d-official/Hi3Dv1.0 |

## Arquitectura y entrenamiento

El modelo es un pipeline de refinamiento geometrico image-to-3D compuesto por uno o varios transformers y un VAE compartido. Recibe como entrada una imagen de referencia y una malla 3D gruesa (coarse mesh), y produce una malla refinada en formato GLB. La arquitectura exacta del transformer subyacente no se detalla en la informacion disponible; la model card solo indica que los bloques transformer se cuantizan de forma selectiva y que los tensores sensibles se mantienen en su precision original.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La informacion disponible se centra en el proceso de cuantizacion y en el runtime de inferencia, no en el entrenamiento del modelo original. Los componentes compartidos (VAE y configuraciones) se alojan en un repositorio separado, Hi3Dv1.0-mlx-shared, y los encoders de imagen estan fijados por version.

## Capacidades

- Refinamiento de geometria 3D: dado un par imagen de referencia y malla gruesa, genera una malla refinada de mayor calidad.
- Soporte de multiples resoluciones de malla: 512³, 1024³ y 1536³ (esta ultima reutiliza el transformer de 1024).
- Ejecucion nativa en Apple Silicon mediante MLX, con computo en FP16.
- Descarga selectiva de variantes segun resolucion, reduciendo el espacio en disco necesario.
- Modo offline mediante `hi3d-mlx download` y la opcion `--local-files-only`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues.
- No implementa vision general mas alla del encoder de imagen necesario para el pipeline.
- No es compatible con cargadores genericos de `mlx-lm`, ya que el pipeline geometrico es especifico.

## Casos de uso

- Refinamiento de escaneos 3D en flujos de patrimonio cultural: a partir de una fotografia de referencia y una malla capturada con escaner de baja resolucion, el modelo refina la geometria para obtener un modelo mas fiel para archivo o impresion.
- Post-procesado en pipelines de fotogrametria: tras generar una malla gruesa con herramientas como COLMAP o Meshroom, se usa el modelo para mejorar detalles geometricos antes de la exportacion final.
- Prototipado de assets para videojuegos en Mac: un artista puede refinar mallas base en un Mac con chip M usando el CLI `hi3d-mlx`, sin necesidad de GPU dedicada, integrandolo en su flujo de trabajo local.
- Generacion de modelos para impresion 3D: el refinamiento a 1024³ o 1536³ permite obtener mallas con detalle suficiente para impresion, partiendo de una imagen y una malla inicial aproximada.
- Investigacion en reconstruccion 3D: el modelo sirve como componente de refinamiento evaluable en experimentos academicos sobre image-to-3D, con resultados reproducibles documentados en el dataset de resultados del autor.
- Automatizacion de catalogo de productos 3D: para tiendas que necesitan modelos 3D de productos a partir de fotografias y mallas preliminares, el pipeline puede ejecutarse por lotes en estaciones Mac con 32 GiB de memoria unificada.
- Entornos con restricciones de conectividad: el modo offline con `--local-files-only` permite desplegar el refinamiento en equipos aislados de red, util en laboratorios o estudios con politicas de seguridad estrictas.

## Benchmarks y rendimiento

La model card no presenta resultados numericos de benchmarks comparativos (tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo). Solo se indica cualitativamente que la cuantizacion INT8 no fue mas rapida que FP16 en los tres casos originales de 512³, y que su beneficio principal es la reduccion de almacenamiento y memoria. Los resultados completos de geometria estan registrados en el dataset Hi3Dv1.0-mlx-results, con metodologia descrita en BENCHMARKS.md.

| Aspecto | Observacion |
|---|---|
| Rendimiento vs FP16 | La cuantizacion INT8 no fue mas rapida que FP16 en los tres casos de 512³ |
| Beneficio principal | Reduccion de almacenamiento y memoria, no de latencia |
| Hardware de referencia | Apple M5, 32 GiB, MLX 0.32.4 |
| Tipo de evaluacion | Solo geometria; requiere imagen y malla gruesa |
| Resultados numericos | no disponibles en la informacion proporcionada |

## Requisitos de hardware

- Memoria: el checkpoint ocupa 2,28 GiB a 512³ y 4,22 GiB a 1024³/1536³; a esto hay que sumar encoders, VAE compartido y dependencias de Python, por lo que el consumo real en tiempo de ejecucion es mayor que el tamano del checkpoint.
- Hardware de referencia: Apple M5 con 32 GiB de memoria unificada, MLX 0.32.4.
- Cabe en equipos Apple Silicon con memoria unificada suficiente (la referencia usa 32 GiB; no se documenta el minimo exacto).
- No esta pensado para GPU NVIDIA (A100, H100, RTX 4090); el runtime es especifico de MLX para Apple Silicon.
- Despliegue: CLI `hi3d-mlx` con subcomandos `refine` y `download`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con cargadores genericos de `mlx-lm`.
- Latencia y throughput: no disponibles; solo se indica que INT8 no fue mas rapido que FP16 en los casos medidos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa mas directa posible es con el propio modelo base sin cuantizar, segun los datos disponibles:

| Modelo | Formato | Tamano de checkpoint | Hardware | Licencia |
|---|---|---|---|---|
| Hi3Dv1.0-mlx-int8 (este) | MLX INT8, computo FP16 | 2,28 GiB (512³) / 4,22 GiB (1024³) | Apple Silicon (MLX) | Hi3D Open License v1.0 |
| Hi3Dv1.0 (base) | no disponible | no disponible | no disponible | Hi3D Open License v1.0 |

Comparativa con otros sistemas image-to-3D: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion INT8 no aporta mejora de velocidad frente a FP16 en los casos medidos; solo reduce almacenamiento y memoria.
- Requiere obligatoriamente una imagen de referencia y una malla gruesa preexistente; no genera mallas desde cero.
- La evaluacion registrada es solo de geometria, no de apariencia, texturas ni color.
- La resolucion 1536³ reutiliza el transformer de 1024 y no corresponde a un numero fijo de caras; puede no ofrecer el detalle esperado de una malla de 1536³ real.
- El pipeline es especifico de MLX y Apple Silicon; no funciona con cargadores genericos de `mlx-lm` ni con runtimes de GPU NVIDIA.
- La implementacion de conversion a MLX es privada; solo se publica la implementacion de inferencia, lo que limita la reproducibilidad del proceso de cuantizacion.
- Licencia Hi3D Open License Agreement v1.0: no es MIT ni Apache; el uso comercial esta sujeto a los terminos de dicha licencia, que deben revisarse antes de desplegar en produccion.
- Riesgo de sesgos y alucinacion geometrica: no documentado en la informacion disponible; al ser un modelo de geometria, los errores se manifestarian como artefactos o deformaciones en la malla, no como texto inventado.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-int8
- Proyecto y runtime de inferencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx
- Resultados registrados: https://huggingface.co/datasets/devin-lai/Hi3Dv1.0-mlx-results
- Componentes compartidos (VAE y configuraciones): https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-shared
- Metodologia de benchmarks: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx/blob/main/BENCHMARKS.md
- Licencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-int8/blob/v1.0.0/LICENSE
- Modelo base: https://huggingface.co/hi3d-official/Hi3Dv1.0
