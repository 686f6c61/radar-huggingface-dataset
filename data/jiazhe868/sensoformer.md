# jiazhe868/sensoformer

## Resumen

Sensoformer es un modelo de inferencia sismologica disenado para estimar el tensor de momento y la magnitud de momento (Mw) de terremotos a partir de un conjunto de tamano variable de registros de estaciones sismicas. Lo desarrolla Zhe Jia (usuario jiazhe868) junto con Xiaotian Zhang y Junpeng Li, y se distribuye con licencia MIT tanto en HuggingFace como en GitHub. No es un modelo de lenguaje: es un modelo de regresion geometrica y fisica sobre senales 1D, con 2.063.015 parametros entrenables.

El problema que resuelve es la inversion de la fuente sismica de forma amortizada (amortized source inversion): en lugar de resolver un problema de optimizacion por evento, el modelo predice directamente el mecanismo focal y la magnitud a partir de las trazas. Su relevancia radica en que alcanza el suelo de ruido de las etiquetas del catalogo en el sur de California (angulo de Kagan mediano de 19,7 grados frente a 19,5 grados de incertidumbre propia del catalogo), y en que incorpora una tecnica de aleatorizacion fisicamente estructurada (PSDR) para mejorar la transferencia simulacion-a-realidad.

La arquitectura es un transformer de conjuntos (set transformer) sin codificacion posicional, lo que lo hace agnostico a la geometria de la red de estaciones: acepta cualquier numero y disposicion de estaciones. Se publican dos checkpoints: uno solo preentrenado con datos sinteticos PSDR y otro afinado con datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-tower 1D-ResNet (encoder por estacion) -> transformer encoder de 3 capas sobre estaciones (128-d, 4 cabezas, sin codificacion posicional) -> pooling por atencion aditiva -> cabezas de magnitud y tensor de momento |
| Parametros totales | 2.063.015 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada como conjunto de tamano variable de estaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth); checkpoints autodescriptivos con `{state_dict, arch, sensoformer_version, stage, metrics}` |
| Pipeline | other (regresion sismologica, no texto) |
| Entrada | Por estacion: bloque de onda (12, 101) (ventanas P y S, Z/R/T y sus espectros de amplitud) + 20 caracteristicas escalares (distancia, azimut, lon/lat de estacion, profundidad, resumenes de amplitud) |
| Salida | `(B, 6)` = [Mw escalada, Mxx, Myy, Mxy, Mxz, Myz]; desescalado `Mw = (y+1)/2*6 + 2` |

## Arquitectura y entrenamiento

El modelo consta de dos torres: un encoder 1D-ResNet que procesa cada registro de estacion de forma independiente, y un transformer encoder de tres capas que opera sobre el conjunto de representaciones de estaciones (dimensión 128, 4 cabezas de atencion, sin codificacion posicional). La ausencia de codificacion posicional es deliberada: el modelo no depende del orden de las estaciones ni de su geometria, de modo que puede consumir conjuntos de cualquier cardinalidad y configuracion. Tras el transformer, un pooling por atencion aditiva agrega la informacion del conjunto y alimenta dos cabezas: una de magnitud de momento y otra de los cinco componentes independientes del tensor de momento.

El entrenamiento sigue una estrategia de dos fases. La primera es un preentrenamiento sobre datos sinteticos generados con PSDR (Physics-Structured Domain Randomization), una aleatorizacion de dominio estructurada por fisica que expone al modelo a geometrias de red, niveles de ruido y mecanismos variados. La segunda es un afinado sobre datos reales. El checkpoint `sensoformer_v3_finetuned.pth` corresponde a las dos fases y es el recomendado para inferencia sobre datos reales; `sensoformer_v3_psdr_pretrained.pth` solo contiene el preentrenamiento y se ofrece como punto de partida para afinar en un nuevo catalogo o region.

No se detalla en la informacion disponible el numero exacto de tokens o eventos de entrenamiento, ni la composicion completa del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables en un modelo de regresion de este tipo). Los dos checkpoints se distribuyen en formato `.pth`.

## Capacidades

- Estimacion del tensor de momento sismico completo (componentes Mxx, Myy, Mxy, Mxz, Myz) a partir de formas de onda.
- Estimacion de la magnitud de momento (Mw) escalada al rango definido en el entrenamiento.
- Procesamiento de conjuntos de estaciones de tamano variable y geometria arbitraria, sin reentrenamiento por cardinalidad.
- Aceptacion de entradas multimodales por estacion: trazas de las ventanas P y S en componentes Z/R/T, sus espectros de amplitud y 20 caracteristicas escalares contextuales.
- Salida de mapas de atencion sobre las estaciones, lo que permite inspeccionar que registros han pesado mas en la prediccion.
- Inferencia por lotes (batch) sobre multiples eventos.
- Ejecucion end-to-end mediante CLI sobre ficheros HDF5 con modo catalogo.
- No realiza localizacion de eventos: el hipocentro y el tiempo de origen deben provenir de un catalogo o de un localizador externo.

## Casos de uso

- Inversion rapida de mecanismos focales en redes densas: dado un evento, el modelo devuelve el tensor de momento en una sola pasada, lo que permite generar catalogos preliminares de mecanismos antes de la revision manual.
- Estimacion automatica de magnitud en pipelines de monitorizacion: integrado en un flujo que lee HDF5 de eventos, produce Mw con un MAE medido de 0,100 en el conjunto de evaluacion, util para alertas tempranas donde la latencia importa.
- Control de calidad y triaje de catalogos: comparar la prediccion del modelo con la solucion del analista permite detectar eventos mal resueltos o con geometria deficiente (por ejemplo, con brecha azimutal grande).
- Punto de partida para transferencia a nuevas regiones o redes: usando `sensoformer_v3_psdr_pretrained.pth`, un equipo puede afinar el modelo con su propio catalogo antes de desplegarlo, tal como recomienda el autor.
- Investigacion en inversion de fuente amortizada: el modelo sirve como referencia reproducible (seeds y particiones documentadas) para comparar arquitecturas de conjuntos en sismologia.
- Analisis de contribucion de estaciones: los pesos de atencion devueltos por el modelo permiten estudiar que estaciones aportan mas informacion para un evento dado, util en diseno de redes de monitorizacion.
- Estimacion de incertidumbre calibrada: para poblaciones de catalogo similares al sur de California, los intervalos conformales reportados (90%: mas-menos 0,22 de magnitud, esfera de Kagan de 44,8 grados) permiten acotar las predicciones en produccion (recalibrando fuera de esa poblacion).
- Procesamiento por lotes en estudios retrospectivos: la CLI acepta un HDF5 con multiples eventos y directorio de salida, lo que facilita reprocesar catalogos historicos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks genericos tipo MMLU, HumanEval o GSM8K en la informacion disponible (no aplican a un modelo de regresion sismologica). Si se dispone de una evaluacion especifica del dominio sobre 244 eventos reales retenidos del sur de California (M >= 3,0; semilla 42, particion 80/10/10):

| Metrica | Valor |
|---|---|
| Angulo de Kagan mediano | 19,7 grados |
| Angulo de Kagan medio | 23,9 grados |
| MAE de magnitud | 0,100 |
| Fraccion con Kagan < 30 grados | 0,77 |

El angulo de Kagan mediano iguala la incertidumbre propia del catalogo de analistas (19,5 grados a 1 sigma en el plano nodal), es decir, el modelo se situa en el suelo de ruido de las etiquetas. Comparativas bajo protocolo identico (Kagan mediano):

| Modelo | Kagan mediano |
|---|---|
| Sensoformer | 19,7 grados |
| MPNN | 24,3 grados |
| DeepONet | 28,5 grados |
| DeepSets | 29,1 grados |
| Sin preentrenamiento | 25,2 grados |

## Requisitos de hardware

- VRAM de inferencia: no disponible como cifra oficial. Como referencia derivada, los 2.063.015 parametros ocupan aproximadamente 8,3 MB en FP32 y 4,1 MB en FP16, a lo que hay que sumar activaciones que dependen del numero de estaciones por evento y del tamano de lote; no se publican mediciones de pico de memoria.
- GPU recomendadas: no especificadas por el autor. Por el tamano del modelo, cualquier GPU con soporte CUDA suficiente para PyTorch deberia poder ejecutarlo; se ha documentado uso en `cuda` en los ejemplos del autor.
- GPU de consumo: el modelo es lo bastante pequeno como para caber en GPUs de consumo, aunque no se aportan cifras de VRAM pico ni modelos concretos validados.
- Opciones de despliegue: libreria Python `sensoformer` (instalable via `pip install git+https://github.com/jiazhe868/sensoformer.git`) y CLI `scripts/predict.py`. No se ofrecen formatos GGUF, vLLM, TGI, Ollama ni llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada solo incluye baselines evaluados bajo el mismo protocolo, no modelos publicados comparables con ficha propia. La tabla siguiente resume la comparacion disponible:

| Modelo | Parametros | Contexto | Kagan mediano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sensoformer (v3 finetuned) | 2.063.015 | conjunto de estaciones de tamano variable | 19,7 grados | MIT | HuggingFace + GitHub |
| MPNN (baseline) | no disponible | no disponible | 24,3 grados | no disponible | no disponible |
| DeepONet (baseline) | no disponible | no disponible | 28,5 grados | no disponible | no disponible |
| DeepSets (baseline) | no disponible | no disponible | 29,1 grados | no disponible | no disponible |
| Sensoformer sin preentrenamiento | 2.063.015 | conjunto de estaciones de tamano variable | 25,2 grados | MIT | variante interna del mismo autor |

## Limitaciones y advertencias

- Entrenado con eventos de M >= 3,0 del sur de California. Por debajo de ese rango las magnitudes se saturan cerca de Mw ~ 2,7 con un sesgo positivo aproximadamente constante: +0,28 en M 2,5-3,0 y +0,71 en M 2,0-2,5. Hay que eliminar el desplazamiento constante o afinar con eventos pequenos antes de usar magnitudes fuera de rango.
- El error esta limitado por la geometria de la red. El angulo de Kagan mediano va de ~17 grados para eventos bien rodeados (brecha azimutal < 45 grados) a ~33 grados por encima de 180 grados. Conviene estratificar por brecha azimutal o por numero de estaciones en lugar de citar un unico valor agregado.
- La transferencia a otras regiones o redes no esta probada mas alla del sur de California. La arquitectura es agnostica a la geometria, pero se recomienda reafinar y recalibrar antes de desplegar en otro entorno.
- El modelo no localiza eventos: el hipocentro y el tiempo de origen deben proporcionarse desde un catalogo o un localizador externo.
- Los intervalos conformales reportados (90%: mas-menos 0,22 de magnitud, esfera de Kagan de 44,8 grados) estan calibrados para esta poblacion de catalogo; deben recalibrarse en otros contextos.
- No se documentan sesgos mas alla de los derivados del rango de magnitud y la region de entrenamiento, ni se detallan evaluaciones multirregionales.
- La licencia MIT permite uso comercial, pero no se aportan garantias de rendimiento fuera del dominio de entrenamiento; en produccion debe acompanarse de validacion local.
- El numero de descargas y "likes" en el momento de la consulta es cero, lo que indica adopcion practicamente nula y ausencia de validacion independiente por terceros.
- El repositorio de HuggingFace figura con un tamano de 0,0 GB y sin idiomas declarados; no es un modelo de lenguaje y no debe evaluarse con metricas de NLP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiazhe868/sensoformer
- Repositorio de codigo, documentacion y CLI: https://github.com/jiazhe868/sensoformer
- Dataset asociado: https://huggingface.co/datasets/jiazhe868/sensoformer-data
- Formato de datos (DATA_FORMAT.md): https://github.com/jiazhe868/sensoformer/blob/main/docs/DATA_FORMAT.md
- Resultados completos (RESULTS.md): https://github.com/jiazhe868/sensoformer/blob/main/docs/RESULTS.md
- Cita (BibTeX, articulo 2026 de Jia, Zhang y Li): "Sensoformer: Robust Sim-to-Real Inference on Variable-Geometry Sensor Sets via Physics-Structured Randomization".
