# PierreGtch/eeg-fm-masking_mae_rall_L2

## Resumen

`PierreGtch/eeg-fm-masking_mae_rall_L2` es un codificador de electroencefalografía (EEG) preentrenado mediante autoencoder enmascarado (MAE, *masked autoencoder*). Forma parte de una familia de 58 codificadores entrenados por Pierre Gtch con una receta idéntica en la que solo cambia la geometría de enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos de trabajo (MAE y JEPA). Este checkpoint concreto corresponde a la celda con radio espacial `r = all` (todos los canales) y longitud temporal `L = 2` parches, con un `pct_unmasked` de 0,45. El objetivo del trabajo es aislar qué configuración de enmascaramiento produce mejores representaciones transferibles, en lugar de proponer un modelo único.

El modelo no genera texto ni señales: es un extractor de características (`pipeline_tag: feature-extraction`) que convierte ventanas de EEG multicanal en representaciones contextuales. Su encoder tiene 12.692.096 parámetros y el repositorio ocupa 0,1 GB, ya que solo se distribuyen los pesos del encoder (el decodificador del MAE no se publica). La entrada debe estar muestreada a 200 Hz, en voltios y con posiciones 3D de electrodo en metros; el modelo es agnóstico al montaje, por lo que admite cualquier número y conjunto de canales siempre que cada uno tenga coordenadas.

Es relevante ahora porque los modelos fundacionales de EEG están fragmentados en arquitecturas y protocolos difícilmente comparables, y este trabajo publica una evaluación controlada y reproducible sobre OpenEEGBench (12 conjuntos de datos, 5 semillas, encoder congelado + sonda ridge). Además, se entrena únicamente con el subconjunto de licencia abierta del corpus REVE (323 registros), lo que permite redistribuir los pesos bajo CC-BY-4.0. La propia model card advierte que esta celda (`r = all`) no es la recomendada por el artículo, que apunta a `r = 9 cm, L = 2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder enmascarado (MAE) sobre transformer: tokenizador de parches (`feature_encoder.*`) + encoder transformer (`model.*`). Decodificador ligero presente solo durante el preentrenamiento, no distribuido |
| Parametros totales | 12.692.096 (solo encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como numero fijo de tokens; la entrada es serial y de duracion variable. La senal se corta en parches de 1 s (200 muestras a 200 Hz, con solapamiento de 20 muestras) y el wrapper recibe `n_times` como argumento |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors` en la precision original; no hay versiones GGUF, AWQ, GPTQ ni INT8 publicadas) |
| Idiomas soportados | no aplica (modelo de representacion de senales EEG; no procesa texto ni audio) |
| Licencia | CC-BY-4.0 para los pesos; el codigo de `eeg-fm-masking` es MIT |
| Formato de pesos | `safetensors` (`model.safetensors`), acompanado de `config.json` y `metadata.json` |
| Modalidad | EEG multicanal (serie temporal) |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica internamente un factor de 1e+06 y escalado `median_std_clip` con recorte en sigma = 15) |
| Posicion de canales | metros, via `info["chs"][i]["loc"][:3]` de MNE; agnostico al montaje |
| Parametros de enmascaramiento | radio espacial `r = all` (todos los canales), longitud temporal `L = 2` parches, `pct_unmasked = 0.45` |
| Checkpoint | epoca 10 de 10 (`v9`, el evaluado en el articulo) |
| Framework de entrenamiento | MAE |
| Pipeline declarado | `feature-extraction` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer sobre parches temporales. Un tokenizador (`feature_encoder.*`) convierte cada parche de 1 segundo en un token que incorpora la posicion 3D del electrodo, lo que permite que el mismo modelo procese montajes distintos sin reentrenamiento. Sobre esa secuencia actua un encoder transformer de 12,69 M de parametros que produce caracteristicas contextuales (es decir, cada parche se representa teniendo en cuenta el resto de canales y de instantes). En el preentrenamiento MAE, el encoder solo ve los parches no enmascarados y un decodificador ligero reconstruye la senal cruda de los parches ocultos segun la geometria de mascara configurada. En esta celda el enmascaramiento es `r = all` (toda la extension espacial, sin restriccion por radio) con `L = 2` parches temporales y un 45 % de tokens visibles. El repositorio solo contiene el encoder y el tokenizador, que son exactamente los tensores cargados en la evaluacion downstream del articulo.

Los datos de preentrenamiento proceden del subconjunto de licencia abierta del corpus REVE, con 323 registros. El entrenamiento dura 10 epocas sobre 2 GPU H100, con batch size de 600 por GPU, learning rate de 0,00024 con *warm-up* de 3.080 pasos y valor final de 1e-06, y *weight decay* de 0,01. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de representacion y no generativo. La innovacion del trabajo es metodologica: 58 encoders con receta identica que varian exclusivamente la geometria del enmascaramiento, lo que convierte a esta familia en un banco de pruebas controlado. La celda `r = all, L = 33` no existe en la coleccion porque enmascararia la ventana completa.

## Capacidades

- Extraccion de caracteristicas EEG contextuales: genera embeddings por parche que combinan informacion temporal y espacial, listos para alimentar una sonda lineal o un cabezal de clasificacion.
- Representacion agnostica al montaje: acepta cualquier numero y conjunto de canales, siempre que cada electrodo tenga posicion 3D en metros.
- Transferencia a tareas de clasificacion EEG: en la evaluacion del articulo se usa con el encoder congelado y una regresion ridge sobre las caracteristicas aplanadas, en 12 conjuntos de datos.
- Transferencia a tareas de regresion: evaluado con R² en el conjunto `seed-vig` de OpenEEGBench.
- Ajuste fino supervisado: la integracion con OpenEEGBench via `PretrainedBackbone` permite anadir cabezales de clasificacion especificos de cada tarea.
- Manejo de duraciones variables de registro: al operar sobre parches de 1 s, el modelo no impone una longitud fija de ventana.
- No soporta generacion de texto, *tool calling*, *function calling*, razonamiento multi-paso ni capacidades de agente.
- No tiene modo de razonamiento (*thinking*), vision, audio ni procesamiento de lenguaje.

## Casos de uso

- Monitorizacion de sueno: el modelo se ha evaluado sobre `isruc-sleep` con una exactitud balanceada de 0,665 ± 0,004, por lo que puede usarse como extractor de caracteristicas congelado para clasificar fases del sueno en registros de noche completa, sin necesidad de reentrenar el encoder.
- Deteccion de crisis epilepticas: con 0,891 ± 0,013 de exactitud balanceada en `chbmit`, es adecuado para prefiltrar segmentos candidatos en revision de EEG prolongada (monitorizacion de unidades de cuidados intensivos neurologicos).
- Deteccion de anomalias en EEG clinico: `tuev` alcanza 0,901 ± 0,044, lo que permite construir un clasificador de patrones anormales con una sonda ligera sobre las caracteristicas del encoder.
- Cribado de depresion: `mdd_mumtaz2016` obtiene 0,803 ± 0,014, de modo que el modelo puede servir como base para herramientas de apoyo al diagnostico en estudios poblacionales con EEG en reposo.
- Investigacion en interfaces cerebro-computador: en `bcic2a` alcanza 0,421 ± 0,011 de exactitud balanceada, util como inicializacion para pipelines de imagenes motoras donde se dispone de pocos sujetos etiquetados.
- Deteccion de anormalidades en EEG en reposo a gran escala: `tuab` con 0,783 ± 0,005 permite cribados automatizados sobre cohortes amplias con coste computacional minimo (12,69 M de parametros).
- Preentrenamiento como inicializacion para dominios con pocas etiquetas: al entrenarse solo con 323 registros de licencia abierta, es un punto de partida redistribuible (CC-BY-4.0) para grupos que necesiten publicar pesos derivados.
- Estudio metodologico de estrategias de enmascaramiento: al existir 58 encoders con receta identica, este checkpoint sirve como control experimental (celda `r = all`) frente a las celdas recomendadas `r = 9 cm`.

## Benchmarks y rendimiento

Resultados publicados en la model card con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas (12 conjuntos de datos, 5 semillas). Metrica: exactitud balanceada para clasificacion y R² para `seed-vig`.

| Conjunto de datos | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,659 ± 0,008 | 5 |
| bcic2020-3 | exactitud balanceada | 0,266 ± 0,009 | 5 |
| bcic2a | exactitud balanceada | 0,421 ± 0,011 | 5 |
| chbmit | exactitud balanceada | 0,891 ± 0,013 | 5 |
| faced | exactitud balanceada | 0,304 ± 0,004 | 5 |
| isruc-sleep | exactitud balanceada | 0,665 ± 0,004 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,803 ± 0,014 | 5 |
| physionet | exactitud balanceada | 0,537 ± 0,010 | 5 |
| seed-v | exactitud balanceada | 0,277 ± 0,001 | 5 |
| seed-vig | R² | -0,272 ± 0,011 | 5 |
| tuab | exactitud balanceada | 0,783 ± 0,005 | 5 |
| tuev | exactitud balanceada | 0,901 ± 0,044 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros modelos fundacionales de EEG (por ejemplo, MMLU, HumanEval o GSM8K no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 51 MB para los pesos en FP32 y unos 25 MB en FP16/BF16, sin contar activaciones. Con lotes pequenos y ventanas de varios minutos, el consumo total se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo se entreno en 2 × H100 para el preentrenamiento, pero la inferencia no requiere ese hardware. Una RTX 4090, RTX 3090, A100 o H100 quedan sobredimensionadas para una sola instancia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en GPU integradas. Tambien es viable ejecutarlo en CPU, dado el reducido numero de parametros.
- Opciones de despliegue: no hay pesos GGUF, ONNX ni TensorRT publicados. La ruta soportada es PyTorch con `safetensors` a traves de `ContextualEncoderBenchmarkWrapper` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) o integrarlo con `open_eeg_bench.backbone.PretrainedBackbone`. Los servidores tipo vLLM o TGI no aplican porque no es un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota de carga: `load_state_dict(..., strict=False)` deja fuera el buffer de posiciones de canal y el cabezal de clasificacion, que dependen del conjunto de datos.

## Comparativa con modelos similares

No se dispone de datos de otros modelos fundacionales de EEG (LaBraM, BIOT, EEGPT, CBraMod y similares) en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas externas no esta disponible. La comparacion mas informativa es interna a la propia coleccion, ya que los 58 encoders comparten receta de entrenamiento y solo cambian la geometria de enmascaramiento.

| Modelo | Framework | Geometria de mascara | Parametros del encoder | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eeg-fm-masking_mae_rall_L2` (este) | MAE | `r = all`, `L = 2`, `pct_unmasked = 0.45` | 12,69 M | CC-BY-4.0 | HuggingFace, 1 checkpoint de encoder |
| `eeg-fm-masking_mae_r9cm_L2` | MAE | `r = 9 cm`, `L = 2` (segun el nombre del checkpoint) | no disponible en la informacion proporcionada | CC-BY-4.0 | HuggingFace; recomendado por el articulo |
| `eeg-fm-masking_jepa_r9cm_L2` | JEPA | `r = 9 cm`, `L = 2` (segun el nombre del checkpoint) | no disponible en la informacion proporcionada | CC-BY-4.0 | HuggingFace; recomendado por el articulo |

Advertencia: el articulo recomienda `r = 9 cm, L = 2`, no la celda `r = all` que describe esta ficha. Si el objetivo es obtener el mejor rendimiento segun los autores, deben evaluarse los checkpoints recomendados.

## Limitaciones y advertencias

- Solo se distribuye el encoder: el decodificador del MAE no esta incluido, por lo que no se puede usar el modelo para reconstruir o generar senales EEG.
- Rendimiento muy desigual entre tareas: la exactitud balanceada va de 0,266 (`bcic2020-3`) a 0,901 (`tuev`). En `seed-vig` el R² es de -0,272 ± 0,011, es decir, peor que predecir la media, lo que indica que las caracteristicas congeladas no capturan la variabilidad objetivo en ese conjunto.
- En `bcic2020-3` (0,266) y `seed-v` (0,277) el rendimiento queda por debajo de lo esperable por azar en tareas multiclase, lo que desaconseja su uso directo sin ajuste fino en imagenes motoras.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios y posiciones de electrodo en metros. Cualquier desviacion (por ejemplo, estandarizar la senal antes de pasarla) rompe el preprocesado interno del wrapper.
- Dependencia de metadatos de montaje: si un canal carece de posicion 3D, el modelo no puede procesarlo correctamente.
- Sesgo de datos: el preentrenamiento usa unicamente 323 registros del subconjunto abierto de REVE, con la distribucion demografica y clinica de esos estudios. No se documentan analisis de sesgo por edad, sexo, origen etnico ni patologia.
- Riesgo de generalizacion limitada a montajes, equipos o poblaciones poco representados en el corpus de preentrenamiento.
- La fecha de creacion del repositorio (2026-09-27) y el hecho de tener 0 descargas y 0 likes implican que se trata de un artefacto reciente y con poca validacion independiente por parte de la comunidad.
- Licencia CC-BY-4.0: permite uso comercial y modificacion siempre que se atribuya la autoria y se indique si hubo cambios. El codigo asociado en GitHub es MIT, con condiciones distintas a las de los pesos. Es obligatorio citar el articulo si se usan los modelos.
- No hay garantia de soporte, versionado ni mantenimiento por parte del autor; `metadata.json` y `config.json` deben conservarse junto a los pesos para reproducir la carga.
- Al ser un modelo de representacion, no debe presentarse como sistema de diagnostico clinico sin validacion regulatoria y estudio prospectivo propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rall_L2
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo fuente (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Checkpoint recomendado por el articulo (MAE, `r = 9 cm`, `L = 2`): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Checkpoint recomendado por el articulo (JEPA, `r = 9 cm`, `L = 2`): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (Weights & Biases, run `0hfltxhc`): https://wandb.ai/pierregtch/chan-inv-clf/runs/0hfltxhc
- Articulo de referencia: *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*; la referencia bibliografica completa figura en la pagina de GitHub indicada arriba.
- La busqueda web realizada no ha devuelto enlaces adicionales relevantes sobre este modelo.
