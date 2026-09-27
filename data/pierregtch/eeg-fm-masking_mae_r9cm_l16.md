# PierreGtch/eeg-fm-masking_mae_r9cm_L16

## Resumen

eeg-fm-masking_mae_r9cm_L16 es un codificador de electroencefalograma (EEG) preentrenado mediante autoencoder enmascarado (MAE), desarrollado por PierreGtch y publicado como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo no genera texto ni realiza tareas de lenguaje: es un extractor de características que convierte ventanas de senal EEG multicanal en representaciones vectoriales reutilizables para tareas posteriores (clasificacion o regresion con una sonda ligera).

Forma parte de una familia de 58 codificadores entrenados con una receta identica en la que solo varia la geometria de enmascaramiento: 5 radios espaciales x 6 longitudes temporales x 2 marcos (MAE y JEPA). En esta variante concreta el radio espacial es r = 9 cm, la longitud temporal es L = 16 parches y la fraccion de parches sin enmascarar es pct_unmasked = 0.45. El encoder tiene 12.692.096 parametros (12,69 M) y se distribuye unicamente con los pesos del encoder, sin el decodificador MAE.

Su relevancia actual es metodologica: permite aislar el efecto de la geometria de enmascaramiento sobre el rendimiento downstream manteniendo constante el resto del pipeline. Los propios autores senalan que la configuracion recomendada por el paper es r = 9 cm, L = 2, por lo que esta variante L16 debe entenderse como una celda mas del barrido experimental y no como el checkpoint de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder enmascarado (MAE): tokenizador de parches (`feature_encoder.*`) + encoder transformer (`model.*`) |
| Parametros totales | 12.692.096 (12,69 M), solo encoder |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; la senal se divide en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras) y la ventana es configurable via `n_times` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo sobre senales EEG, no procesa texto) |
| Licencia | CC-BY-4.0 (pesos); codigo del repositorio bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`, solo encoder) |
| Framework | PyTorch |
| Pipeline declarado | feature-extraction |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | Voltios (el wrapper aplica factor 1e+06 y escalado `median_std_clip` con clip en sigma = 15) |
| Posiciones de canales | En metros (MNE `info["chs"][i]["loc"][:3]`); montaje-agnostico |
| Parametros de enmascaramiento | r = 9 cm, L = 16 parches, pct_unmasked = 0.45 |
| Checkpoint | Epoca 10 de 10 (v9, el evaluado en el paper) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder enmascarado aplicado a EEG. Un tokenizador de parches (`feature_encoder.*`) convierte la senal en representaciones por parche y un transformer (`model.*`) procesa los parches visibles; un decodificador ligero reconstruye la senal cruda de los parches enmascarados. El repositorio publicado contiene exclusivamente el encoder, que es exactamente el conjunto de tensores cargado en la evaluacion downstream del paper. El modelo es agnostico al montaje: admite cualquier numero y conjunto de canales siempre que cada canal disponga de una posicion 3D.

El preentrenamiento usa el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para poder redistribuir los pesos. La receta de entrenamiento es de 10 epocas sobre 2 x H100, con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay de 0,01. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un modelo de representacion y no generativo.

La innovacion del trabajo no esta en un bloque arquitectonico nuevo, sino en el diseno experimental: 58 codificadores con receta identica en los que solo cambia la geometria de enmascaramiento, lo que permite atribuir diferencias de rendimiento a esa variable. La variante L = 33, que enmascararia la ventana completa, no existe en el barrido.

## Capacidades

- Extraccion de caracteristicas (feature extraction) sobre senales EEG multicanal: es la unica tarea declarada en el pipeline del modelo.
- Representaciones contextuales por parche, utilizables con una sonda ridge congelada o mediante fine-tuning.
- Clasificacion downstream en 12 conjuntos de datos de OpenEEGBench (aritmetica mental, BCI, deteccion de crisis, sueño, TDAH, etc.).
- Regresion downstream (por ejemplo, la tarea `seed-vig` se evalua con R²).
- Independencia del montaje: funciona con cualquier numero y disposicion de canales si se proporcionan posiciones 3D en metros.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No se documentan capacidades multimodales, de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en decodificacion de aritmetica mental: congelar el encoder, extraer caracteristicas contextuales y entrenar una sonda lineal. El modelo alcanza 0,665 ± 0,018 de balanced accuracy en `arithmetic_zyma2019`, lo que lo hace util como linea base reproducible.
- Deteccion de crisis epilepticas: alcanza 0,855 ± 0,012 de balanced accuracy en `chbmit`, un valor alto que permite plantear un sistema de cribado con caracteristicas preentrenadas y una cabeza de clasificacion ligera.
- Clasificacion de estados de sueño: 0,665 ± 0,004 en `isruc-sleep`, adecuado para pipelines de scoring automatico de hipnogramas sobre senales a 200 Hz.
- Cribado de depresion a partir de EEG: 0,839 ± 0,014 en `mdd_mumtaz2016`, util como extractor congelado en estudios donde el volumen de datos etiquetados es reducido.
- Deteccion de anomalias en EEG clinico: 0,782 ± 0,004 en `tuab` y 0,875 ± 0,043 en `tuev`, aplicable a la revision asistida de registros largos divididos en ventanas.
- Estudio controlado de geometrias de enmascaramiento: dado que comparte receta con otros 57 checkpoints, sirve para comparar el efecto de r y L manteniendo constante el resto del pipeline, sin reentrenar desde cero.
- Construccion de lineas base reproducibles para nuevos datasets EEG: el wrapper estandariza entrada (200 Hz, voltios, posiciones en metros) y evaluacion (OpenEEGBench), lo que reduce la variabilidad entre experimentos.
- Prototipado en hardware modesto: con 12,69 M de parametros, el encoder cabe en cualquier GPU de consumo e incluso en CPU, lo que facilita iteraciones rapidas antes de escalar a modelos mayores.
- Aprendizaje por transferencia con pocas etiquetas: al congelar el encoder y ajustar solo una sonda ridge, se pueden obtener resultados con conjuntos de entrenamiento pequenos, como demuestra la evaluacion con 5 semillas sobre 12 datasets.

## Benchmarks y rendimiento

Resultados publicados de evaluacion downstream con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas (12 datasets x 5 semillas). Balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,665 ± 0,018 | 5 |
| bcic2020-3 | balanced acc. | 0,253 ± 0,007 | 5 |
| bcic2a | balanced acc. | 0,409 ± 0,010 | 5 |
| chbmit | balanced acc. | 0,855 ± 0,012 | 5 |
| faced | balanced acc. | 0,275 ± 0,004 | 5 |
| isruc-sleep | balanced acc. | 0,665 ± 0,004 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,839 ± 0,014 | 5 |
| physionet | balanced acc. | 0,559 ± 0,004 | 5 |
| seed-v | balanced acc. | 0,263 ± 0,003 | 5 |
| seed-vig | R² | -0,433 ± 0,010 | 5 |
| tuab | balanced acc. | 0,782 ± 0,004 | 5 |
| tuev | balanced acc. | 0,875 ± 0,043 | 5 |

No se han publicado en la informacion disponible resultados comparativos directos de este checkpoint frente a modelos externos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia del encoder: aproximadamente 51 MB en fp32 (12,69 M de parametros x 4 bytes), unos 25 MB en fp16/bf16 y unos 13 MB en int8. Cifras calculadas a partir del numero de parametros, no publicadas por el autor.
- Memoria adicional por activaciones: dependiente del numero de canales, de la longitud de ventana (`n_times`) y del batch; en cualquier caso muy inferior a la de un LLM.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas las de gama de consumo. El entrenamiento original uso 2 x H100, pero eso corresponde al preentrenamiento del barrido completo, no a la inferencia.
- Cabe en GPU de consumo: si, en practicamente todas (RTX 3060, RTX 4090, etc.), y tambien en CPU para inferencia y extraccion de caracteristicas.
- Opciones de despliegue: carga directa con `safetensors` + PyTorch a traves de `ContextualEncoderBenchmarkWrapper` del paquete `eeg_fm_masking`, o integrado como `PretrainedBackbone` en OpenEEGBench. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, porque la arquitectura y el dominio de entrada son especificos de EEG.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de 58 codificadores, que es la unica comparacion para la que la informacion disponible aporta datos. Salvo los parametros del modelo de esta ficha y el checkpoint recomendado, el resto de valores no estan publicados en la informacion proporcionada.

| Modelo | Marco | Radio r | Longitud L | Parametros | Estado |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r9cm_L16 | MAE | 9 cm | 16 parches | 12,69 M | Esta ficha; celda del barrido |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | No disponible (misma receta de entrenamiento) | Recomendado por el paper |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | No disponible (misma receta de entrenamiento) | Recomendado por el paper |
| Resto de la familia (58 codificadores) | MAE o JEPA | 5 radios distintos | 6 longitudes distintas | No disponible | Publicados en la coleccion del autor |

Comparacion con modelos EEG de terceros (por ejemplo, otras familias de foundation models para EEG): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no produce texto, no soporta tool calling ni razonamiento multi-paso. Cualquier uso fuera de extraccion de caracteristicas o fine-tuning queda fuera de su diseno.
- El repositorio contiene solo el encoder; el decodificador MAE no se distribuye, por lo que no es posible reproducir la tarea de reconstruccion con estos pesos.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios y posiciones de canal en metros. No se debe estandarizar la senal antes de pasarla al wrapper, que aplica su propio escalado `median_std_clip`.
- Rendimiento muy desigual segun el dataset: en `bcic2020-3` (0,253), `faced` (0,275) y `seed-v` (0,263) el resultado esta cerca del azar, y en `seed-vig` el R² es negativo (-0,433), lo que indica un ajuste peor que la media. No es un extractor universal.
- Preentrenado sobre un subconjunto reducido: solo 323 grabaciones del corpus REVE con licencia abierta. Esto limita la diversidad de senales vista durante el preentrenamiento frente a modelos entrenados con corpus mayores.
- Sesgos potenciales: la composicion del corpus REVE y de los 12 datasets de evaluacion puede sobrerrepresentar determinados montajes, poblaciones o patologias. No se documenta un analisis de sesgo en la informacion disponible.
- Riesgo de generalizacion limitada: al ser un modelo de representacion, un mal ajuste de la sonda downstream o un cambio de montaje sin posiciones 3D correctas degrada el resultado sin aviso.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial, pero exige atribucion y el cumplimiento de las condiciones de la licencia. El codigo asociado se distribuye bajo MIT. Se recomienda citar el paper segun las indicaciones del repositorio de GitHub.
- Uso clinico: los resultados de benchmark no constituyen validacion clinica; cualquier aplicacion medica requiere validacion regulatoria y estudio prospectivo independientes.
- No se documentan tecnicas de cuantizacion soportadas, por lo que la cuantizacion a int8 o int4 requeriria verificacion empirica de la perdida de precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L16
- Web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (licencia MIT, incluye la referencia de citacion): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion completa con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada por el paper (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada por el paper (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/wbwysdic
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los del propio autor recogidos en la model card y arriba listados.
