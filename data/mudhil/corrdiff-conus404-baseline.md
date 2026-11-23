# mudhil/corrdiff-conus404-baseline

## Resumen

CorrDiff baseline (CONUS404) es un par de checkpoints de difusion para reduccion de escala (downscaling) climatica que transforma campos meteorologicos de ERA5, de resolucion gruesa, en campos de alta resolucion sobre la cuadricula CONUS404. Lo publica el usuario mudhil como linea base reproducible y controlada por arquitectura frente a su modelo propio de difusion latente, y no debe confundirse con un checkpoint oficial de NVIDIA: los pesos se han entrenado desde cero sobre datos propios del proyecto.

El modelo emplea la implementacion `physicsnemo` de CorrDiff de NVIDIA en espacio de pixeles, con una arquitectura de dos etapas: una U-Net de regresion determinista que predice la media y una etapa de difusion EDM que modela el residuo condicionada por la salida de la primera. Se entrena sobre seis variables de entrada de ERA5 y seis canales estaticos invariantes, y produce seis variables de salida en la resolucion nativa de CONUS404, sin compresion en espacio latente.

Su relevancia es metodologica: sirve como referencia arquitectonica para comparar, con los mismos datos, la misma normalizacion y las mismas fechas reservadas, un enfoque de difusion en pixeles frente a alternativas con VAE y difusion latente. El repositorio ocupa 0,6 GB y se distribuye con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CorrDiff de `physicsnemo` en espacio de pixeles: U-Net de regresion (etapa 1) + difusion EDM sobre el residuo (etapa 2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre recortes de 448x448 pixeles, `crop_size=448`) |
| Tipos de cuantizacion | no disponible (checkpoints `.mdlus` en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo geoespacial, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mdlus` (formato nativo de PhysicsNeMo); dos ficheros: `CorrDiffRegressionUNet.0.5000003.mdlus` y `EDMPrecondSuperResolution.0.5000000.mdlus` |

## Arquitectura y entrenamiento

La etapa 1 es una `CorrDiffRegressionUNet` entrenada durante 5.000.003 pasos que actua como predictor determinista de la media. La etapa 2 es una `EDMPrecondSuperResolution` entrenada durante 5.000.000 pasos que aplica difusion sobre el residuo, condicionada por la salida de la etapa 1. Ambas etapas se completaron en un unico entrenamiento limpio hasta convergencia sobre un cluster de 4 GPU A100 de 40 GB, con un coste total de aproximadamente 795 GPU-horas repartidas entre las dos fases.

Los datos de entrenamiento son pares ERA5-CONUS404 con seis variables de entrada (`t2m`, `d2m`, `u10`, `v10`, `sp`, `tp`) mas seis canales estaticos invariantes (terreno, varianza orografica, latitud, longitud, LAI y mascara tierra-mar), y seis variables de salida (`T2`, `TD2`, `U10`, `V10`, `PSFC`, `PREC_ACC_NC`). Se trabaja en la resolucion nativa de CONUS404 en todo el pipeline, sin VAE ni compresion en espacio latente. No se documenta en la informacion disponible el volumen total de tokens ni detalles de RLHF o DPO, que no aplican a este tipo de modelo.

Una particularidad de inferencia relevante: el adaptador de dataset usado para este benchmark selecciona un recorte deterministico preseleccionado por fecha mediante un manifiesto compartido con RNG sembrado, en lugar del recorte aleatorio sin semilla por defecto de CorrDiff, de modo que la salida pueda compararse pixel a pixel con la del modelo propio sobre la misma fecha y localizacion.

## Capacidades

- Reduccion de escala espacial de campos meteorologicos de ERA5 a la resolucion nativa de CONUS404.
- Prediccion determinista de la media mediante la etapa de regresion.
- Generacion de ensembles estocasticos mediante la etapa de difusion sobre el residuo.
- Modelado conjunto de seis variables de superficie: temperatura a 2 m, punto de rocio, componentes del viento a 10 m, presion superficial y precipitacion acumulada.
- Incorporacion de informacion estatica del terreno (orografia, uso del suelo, mascara tierra-mar) como condicionamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking), vision ni audio en el sentido de los modelos generativos multimodales.

## Casos de uso

- Generacion de ensembles de alta resolucion para estudios de incertidumbre climatica: la etapa de difusion permite muestrear multiples realizaciones sobre la misma entrada ERA5, lo que facilita estimar la dispersion de la prediccion en cada punto de la cuadricula.
- Benchmarking de arquitecturas de downscaling: al compartir datos, normalizacion y fechas reservadas con el modelo de difusion latente del mismo autor, sirve como referencia controlada para aislar el efecto de la compresion en espacio latente frente al espacio de pixeles.
- Reconstruccion de campos de precipitacion y viento a escala regional: util para estudios que necesitan series de alta resolucion sobre Estados Unidos continental a partir de reanalisis ERA5 de menor resolucion.
- Validacion de pipelines de datos climaticos: el adaptador `Era5Conus404Dataset` y el manifiesto de recortes permiten reproducir comparaciones pixel a pixel y verificar la integridad del preprocesado.
- Docencia e investigacion en modelos generativos aplicados a ciencias de la Tierra: la separacion en dos etapas (regresion y difusion) hace el comportamiento del modelo mas facil de inspeccionar que en variantes latentes.
- Base para experimentos de transferencia: al estar entrenado desde cero con codigo Apache-2.0, puede reentrenarse o afinarse sobre otros dominios geograficos o pares de reanalisis siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo con 4 GPU A100 de 40 GB, lo que sugiere que la inferencia en espacio de pixeles a resolucion nativa requiere GPU de gama alta.
- GPU recomendadas: A100 de 40 GB o superiores para reproducir el flujo completo; H100 como alternativa mas rapida.
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible; el procesamiento en espacio de pixeles sin compresion latente y el tamano de los recortes hacen poco probable un ajuste comodo en GPU de consumo de gama media.
- Opciones de despliegue: `nvidia-physicsnemo` junto con un clon de `NVIDIA/physicsnemo` para los scripts de `examples/weather/corrdiff`; la configuracion se gestiona con Hydra y la generacion se lanza con `generate.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolucion de trabajo | Contexto de datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CorrDiff baseline (CONUS404) | CorrDiff en pixeles, regresion + difusion EDM | Nativa CONUS404, sin VAE | ERA5 a CONUS404, 6 variables + 6 estaticas | Apache-2.0 | Hugging Face (`mudhil/corrdiff-conus404-baseline`) |
| `mudhil/era5-conus404-diffusion-downscaling` | DRN + VAE + difusion latente | Espacio latente comprimido | Mismos datos, misma normalizacion y fechas reservadas | no disponible | Hugging Face |
| CorrDiff oficial de NVIDIA | CorrDiff en pixeles (`physicsnemo`) | Nativa del dominio de entrenamiento | Datos propios de NVIDIA | Apache-2.0 (codigo) | Repositorio `NVIDIA/physicsnemo` |

La comparacion principal es frente al modelo latente del mismo autor, que comparte datos y particion de evaluacion pero difiere en arquitectura; el baseline existe precisamente para cuantificar esa diferencia. Frente al CorrDiff oficial de NVIDIA, la diferencia clave es que estos pesos no derivan de ningun checkpoint publicado por NVIDIA.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre CONUS404, el modelo hereda las caracteristicas y posibles sesgos del dataset regional estadounidense.
- Riesgo de alucinacion: la etapa de difusion puede generar estructuras espaciales fisicamente plausibles pero no observadas; debe validarse con metricas fisicas y no solo visuales.
- Limitaciones de contexto o idioma: el modelo opera sobre recortes de 448x448 pixeles y no sobre secuencias de texto; no admite instrucciones en lenguaje natural ni tiene soporte multilingue.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion con atribucion; conviene revisar tambien las condiciones de los datos ERA5 y CONUS404 empleados en el entrenamiento, que no se detallan en la model card.
- Caveat de produccion: el checkpoint esta pensado como linea base de comparacion; el uso de recortes deterministas por manifiesto difiere del comportamiento por defecto de CorrDiff y debe replicarse el adaptador si se quiere reproducir la evaluacion.
- Dependencia de codigo externo: requiere clonar `NVIDIA/physicsnemo` porque el wheel de pip no incluye el arbol `examples/`, lo que anade complejidad al despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mudhil/corrdiff-conus404-baseline
- Modelo propio del mismo autor (difusion latente): https://huggingface.co/mudhil/era5-conus404-diffusion-downscaling
- Codigo y arquitectura de referencia (NVIDIA PhysicsNeMo): https://github.com/NVIDIA/physicsnemo
