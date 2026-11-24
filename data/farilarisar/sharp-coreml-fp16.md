# Farilarisar/Sharp-coreml-fp16

## Resumen

Sharp-coreml-fp16 es una derivacion del modelo SHARP de Apple ("Sharp Monocular View Synthesis in Less Than a Second"), convertido al formato Core ML en precision de 16 bits. El modelo original resuelve la sintesis de vistas monocular: a partir de una unica fotografia genera una representacion 3D mediante gaussian splatting, lo que permite renderizar nuevas vistas de la escena con un solo plano de entrada. Esta version concreta la publica el usuario Farilarisar a partir de la conversion comunitaria de pearsonkyle (pearsonkyle/Sharp-coreml) y no cuenta con el respaldo de Apple.

La aportacion de esta ficha es puramente numerica: se mantiene la arquitectura, los pesos (salvo redondeo) y las entradas/salidas del modelo original, pero los pesos y el computo pasan de float32 a float16 mediante coremltools 9.0. El resultado es un paquete de 1,34 GB frente a los 2,67 GB del original, con una perdida de precision en profundidad del 0,3 % en mediana usando `cpuAndGPU` y del 1,3 % (tras un reescalado uniforme del 4,7 %) con `cpuAndNeuralEngine`.

Es relevante para desarrolladores que quieran ejecutar reconstruccion 3D monocular en hardware Apple (Mac con Apple Silicon, iPhone, iPad) sin depender de GPU dedicadas, con tiempos de inferencia del orden de 15-24 segundos por fotografia en un MacBook Air M1 de 8 GB. La licencia Apple AML R restringe el uso a investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SHARP (monocular view synthesis con gaussian splatting), empaquetado como programa Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen fija) |
| Tipos de cuantizacion | float16 (pesos y computo); entradas y salidas en float32 |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement), solo investigacion no comercial |
| Formato de pesos | Core ML `.mlpackage` (`weight.bin`), `library_name: coreml` |

Datos adicionales: entrada `image` float32 `[1, 3, 1536, 1536]` en rango 0-1 y `disparity_factor` float32 `[1]`; salida de cinco tensores gaussianos con 1.179.648 gaussianas. Tamano del repo: 1,3 GB. Modelo base: pearsonkyle/Sharp-coreml.

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura SHARP de Apple, orientada a sintesis de vistas monocular mediante gaussian splatting: dada una imagen de 1536x1536 pixeles, el modelo infiere un conjunto de gaussianas 3D (1.179.648 en total) que representan la escena y permiten renderizar vistas noveles. Esta derivacion no reentrena ni modifica la arquitectura ni los datos de entrenamiento; unicamente cambia la precision numerica. La conversion se realizo con coremltools 9.0 mediante `ct.convert(..., compute_precision=ct.precision.FLOAT16, minimum_deployment_target=ct.target.macOS12)` partiendo del ML program original.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens, composicion del dataset, ni si hubo RLHF o DPO en el modelo original; estos datos corresponden al paper de Apple y no se recogen en la model card de esta derivacion. La innovacion tecnica destacable es la reduccion de huella (de 2,67 GB a 1,34 GB) manteniendo una precision de profundidad practicamente identica, con un error mediano del 0,3 % frente al modelo de 32 bits.

## Capacidades

- Sintesis de vistas monocular: genera una representacion 3D con gaussianas a partir de una sola imagen de 1536x1536.
- Reconstruccion 3D implicita: produce cinco tensores gaussianos que codifican posicion, color y parametros de las 1.179.648 gaussianas.
- Renderizado de vistas noveles: permite generar nuevas perspectivas de la escena a partir de la representacion gaussiana.
- Inferencia en hardware Apple: soporta ejecucion en CPU, GPU y Neural Engine mediante Core ML.
- No soporta generacion de texto, codigo, matematicas, tool calling, agentes ni capacidades multilingues (es un modelo puramente visual).
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la imagen de entrada.

## Casos de uso

- Reconstruccion 3D en dispositivos Apple: ejecutar el modelo en un Mac con Apple Silicon o en iPhone/iPad para convertir una foto en una escena 3D navegable, aprovechando la aceleracion de Neural Engine y GPU.
- Prototipado de experiencias de realidad aumentada: usar las gaussianas generadas para poblar escenas AR con geometria inferida de una unica fotografia, sin necesidad de escaneo multi-vista.
- Investigacion en sintesis de vistas: emplear esta version como referencia reproducible en experimentos academicos sobre gaussian splatting monocular, con menor coste de memoria que el modelo de 32 bits.
- Aplicaciones de fotografia computacional: generar efectos de paralaje o perspectivas sinteticas a partir de una foto tomada con el movil, integrando el `.mlpackage` en una app nativa.
- Digitalizacion ligera de objetos y escenas: capturar una sola imagen y obtener una representacion 3D util para catalogos, visores web o previsualizaciones, dado el bajo requisito de memoria (1,8-3,2 GB).
- Evaluacion comparativa de precision: medir el impacto de la cuantizacion a float16 frente al original de 32 bits en pipelines de investigacion, usando el error de profundidad reportado (0,3 %-1,3 %).
- Docencia y demos: ejecutar el modelo en un portatil de 8 GB para ilustrar tecnicas de gaussian splatting sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

La model card reporta mediciones de tiempo y memoria en un MacBook Air M1 de 8 GB con una foto de 1536x1536, junto con el error de profundidad frente al modelo de 32 bits en CPU:

| Modelo / unidades de computo | Tiempo por foto | Memoria pico | Error de profundidad vs. 32 bits en CPU |
|---|---|---|---|
| Original 32 bits, `cpuAndNeuralEngine` (ejecuta en CPU) | 72-86 s | 3,4 GB | — |
| Esta version 16 bits, `cpuAndGPU` | 15 s | 3,2 GB | 0,3 % mediana |
| Esta version 16 bits, `cpuAndNeuralEngine` | 24 s | 1,8 GB | 1,3 % mediana tras reescalado uniforme de ~4,7 % |

No se han publicado en la informacion disponible resultados de benchmarks academicos (PSNR, SSIM, LPIPS u otros) para esta derivacion.

## Requisitos de hardware

- VRAM/memoria estimada: 1,8 GB de pico con `cpuAndNeuralEngine` y 3,2 GB con `cpuAndGPU` en el caso medido (MacBook Air M1, 8 GB).
- GPU recomendadas: no se especifican modelos concretos; el modelo esta pensado para hardware Apple con Neural Engine y GPU integrada (serie M1 en adelante). No hay datos para A100, H100 o RTX 4090, ya que el formato Core ML esta orientado a plataformas Apple.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 8 GB o mas de memoria unificada, segun la medicion reportada.
- Opciones de despliegue: Core ML (`.mlpackage`) mediante coremltools y las APIs nativas de Apple (Core ML, Vision). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 15 s por foto con `cpuAndGPU` y 24 s con `cpuAndNeuralEngine` en M1 de 8 GB; el original de 32 bits tarda 72-86 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Farilarisar/Sharp-coreml-fp16 | no disponible | imagen 1536x1536 | 15 s/foto en M1 (cpuAndGPU), error 0,3 % vs 32 bits | apple-amlr (no comercial) | Hugging Face, Core ML |
| pearsonkyle/Sharp-coreml (base) | no disponible | imagen 1536x1536 | 72-86 s/foto en M1 (CPU), referencia de 32 bits | apple-amlr (no comercial) | Hugging Face, Core ML |
| SHARP original de Apple (apple/ml-sharp) | no disponible | imagen 1536x1536 | no disponible en la informacion proporcionada | apple-amlr (no comercial) | Repositorio GitHub de Apple |

No se dispone de datos de otros modelos comparables de sintesis de vistas monocular en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Apple Machine Learning Research Model License Agreement limita el uso a investigacion no comercial; cualquier redistribucion debe incluir el archivo `LICENSE_MODEL`.
- No es un modelo oficial de Apple: es una derivacion comunitaria no respaldada ni soportada por Apple.
- Perdida de precision: la cuantizacion a float16 introduce un error de profundidad mediano del 0,3 % (`cpuAndGPU`) y del 1,3 % tras reescalado (`cpuAndNeuralEngine`); puede no ser aceptable en aplicaciones que requieran precision metrica exacta.
- Dependencia de plataforma: el formato Core ML solo se ejecuta en ecosistema Apple; no es portable a Linux, Windows o GPUs NVIDIA sin reconversion.
- Entrada fija: la imagen debe ser de 1536x1536 y en rango 0-1; no admite otras resoluciones sin preprocesado.
- Sin datos sobre sesgos, alucinacion o cobertura de dominios visuales en la informacion disponible; al ser un modelo de reconstruccion 3D, los fallos se manifestarian como geometria o profundidad incorrectas en escenas atipicas.
- Sin garantias de produccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- No se dispone de informacion sobre idiomas ni capacidades linguisticas porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Farilarisar/Sharp-coreml-fp16
- Modelo base (conversion comunitaria): https://huggingface.co/pearsonkyle/Sharp-coreml
- Repositorio oficial de Apple SHARP: https://github.com/apple/ml-sharp
- Licencia del modelo: https://huggingface.co/Farilarisar/Sharp-coreml-fp16/blob/main/LICENSE_MODEL
