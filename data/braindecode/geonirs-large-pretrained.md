# braindecode/geonirs-large-pretrained

## Resumen

GeoNIRS-Large es un codificador (*encoder*) preentrenado para señales de espectroscopia funcional del infrarrojo cercano (fNIRS), desarrollado por Zongsheng Li y colaboradores (Grupo de Quanying Liu) y publicado en arXiv con el identificador 2610.17845 en 2026. El modelo se distribuye a través de la librería Braindecode como `braindecode.models.GeoNIRS` y estos pesos corresponden únicamente al codificador del checkpoint original `geonirs_large.pt`, sin las cabeceras de decodificación usadas durante el preentrenamiento.

El problema que aborda es la falta de representaciones generalizables para fNIRS, una modalidad de neuroimagen heterogénea en montajes, canales y geometría de sensores. GeoNIRS introduce un preentrenamiento "consciente de la geometría" (*geometry-aware*) que incorpora las posiciones de fuentes y detectores, permitiendo transferir conocimiento entre 22 conjuntos de datos distintos (827,04 horas en total). Con 24.394.304 parámetros, `embed_dim=384`, `depth=6` y `num_heads=12`, es un transformer de tamano medio pensado como extractor de características para tareas posteriores de clasificación o regresión sobre series temporales de HbO y HbR.

Su relevancia actual radica en que ofrece un modelo fundacional especifico de fNIRS listo para *fine-tuning* o *linear probing* dentro del ecosistema Braindecode, con conversión verificada bit a bit respecto al checkpoint original en CPU y float32. No es un modelo de lenguaje ni acepta texto: su entrada son ventanas de hasta 150 muestras (30 s a 5 Hz) con información de canales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con incorporacion de geometria de sensores (codificador GeoNIRS) |
| Parametros totales | 24.394.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de hasta 150 muestras temporales (30 s a 5 Hz); 15 filas de embedding posicional temporal |
| Tipos de cuantizacion | no disponible (pesos en safetensors float32) |
| Idiomas soportados | no aplica (modelo sobre senales fNIRS, no textual) |
| Licencia | other (el repositorio fuente no incluye fichero de licencia; pesos de los autores de GeoNIRS) |
| Formato de pesos | safetensors (PyTorch) |
| Dimension de embedding | 384 |
| Profundidad | 6 capas |
| Cabezas de atencion | 12 |
| `feature_dim` | 128 |
| `projection_dims` | (384, 192, 96, 128) |
| Modalidad de entrada | HbO y HbR en µmol/L, remuestreados a 5 Hz, z-score por registro |
| Libreria | braindecode |

## Arquitectura y entrenamiento

GeoNIRS-Large es un transformer de 6 capas con 12 cabezas de atencion y dimension de embedding 384, disenado para procesar pares de cromoforos HbO/HbR. La innovacion central es el caracter "consciente de la geometria": cada par HbO/HbR recibe las posiciones de su fuente y su detector (extraidas de `chs_info`, en `loc[3:9]` segun el convenio de MNE), de modo que el modelo puede razonar sobre la disposicion espacial de los sensores y generalizar entre montajes heterogeneos. La arquitectura incluye un embedding posicional temporal de 15 filas, lo que fija la ventana maxima en 150 muestras (30 s a 5 Hz).

El preentrenamiento se realizo sobre 22 conjuntos de datos que suman 827,04 horas de senal fNIRS. Durante esa fase el modelo original contaba con dos decodificadores auxiliares (`hbo_to_hbr_decoder` y `hbr_to_hbo_decoder`), presumiblemente usados en una tarea auto-supervisada de reconstruccion cruzada entre cromoforos; estos decodificadores se han eliminado en esta release, que conserva solo el codificador. La conversion mediante `convert.py` desenvuelve el payload `{"model", "config"}`, reconstruye el modelo desde su `config` y guarda el codificador con `save_pretrained`, sin modificar ningun valor: el codificador reproduce las features del fichero original bit a bit en CPU y float32.

La cabecera de clasificacion (`final_layer`) no forma parte de la release, ya que su dimension de entrada depende de `2 * n_latent_channels * n_patches * feature_dim`; `from_pretrained` la construye dinamicamente segun `n_times` y `n_outputs` del usuario. Por tanto, el modelo debe afinarse o usarse con *linear probing* antes de cualquier uso predictivo.

## Capacidades

- Extraccion de representaciones latentes a partir de senales fNIRS de dos cromoforos (HbO y HbR).
- Procesamiento de ventanas temporales de hasta 150 muestras (30 s a 5 Hz) con embedding posicional de 15 posiciones.
- Incorporacion de la geometria de los sensores (posiciones de fuente y detector) para manejar montajes heterogeneos.
- Manejo de canales ausentes mediante valores NaN en la entrada.
- Generacion de features de dimension configurable (`return_features=True`) para tareas posteriores.
- Construccion automatica de la cabecera de clasificacion segun `n_times` y `n_outputs` del usuario.
- Soporte de *fine-tuning* supervisado o *linear probing* sobre las features extraidas.
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes: es un modelo unimodal de senal neurofisiologica.

## Casos de uso

- **Clasificacion de estados cognitivos o tareas experimentales**: usar las features del codificador como entrada a un clasificador lineal entrenado sobre un dataset propio de fNIRS, aprovechando el preentrenamiento en 827,04 h para reducir la cantidad de datos etiquetados necesarios.
- **Deteccion de respuesta hemodinamica en paradigmas de neuroimagen**: afinar el modelo con `n_outputs` binario para distinguir condiciones experimentales (por ejemplo, tarea frente a reposo) en ventanas de 30 s.
- **Transferencia entre montajes de sensores**: al incorporar la geometria de fuentes y detectores, el modelo puede reutilizarse en laboratorios con disposiciones optodas distintas sin reentrenar desde cero.
- **Preentrenamiento de pipelines BCI**: emplear el codificador como extractor congelado en una interfaz cerebro-computador basada en fNIRS, sustituyendo extractores manuales de caracteristicas hemodinamicas.
- **Investigacion en neurociencia cognitiva**: obtener representaciones latentes de 128 dimensiones por ventana para analisis de decodificacion, clustering de sujetos o comparacion entre poblaciones.
- **Aumento de datos en estudios con pocos sujetos**: usar el modelo como inicializacion en regimen de *few-shot*, donde el coste de entrenar un transformer desde cero seria prohibitivo.
- **Evaluacion comparativa de modelos fundacionales de neuroimagen**: servir como linea base reproducible dentro de Braindecode frente a otros codificadores de EEG/fNIRS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (24,4 M de parametros, aproximadamente 98 MB de pesos mas activaciones para ventanas de 150 muestras).
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3090, RTX 2080 Ti o incluso una GTX 1660 pueden ejecutar inferencia sin problemas.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia y *linear probing*.
- Opciones de despliegue: PyTorch nativo y Braindecode (`GeoNIRS.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta modalidad.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoNIRS-Large | 24,4 M | 150 muestras (30 s a 5 Hz) | fNIRS (HbO/HbR) | other | Hugging Face (braindecode) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos fundacionales de fNIRS comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo es solo un codificador: no incluye la cabecera de clasificacion, por lo que no produce predicciones directamente sin *fine-tuning* o *linear probing*.
- La licencia es "other" y el repositorio fuente no contiene fichero de licencia; es imprescindible contactar con los autores de GeoNIRS antes de cualquier uso comercial.
- La ventana de entrada esta limitada a 150 muestras (30 s a 5 Hz); secuencias mas largas deben trocearse.
- La entrada debe seguir estrictamente el preprocesado del paper: HbO y HbR en µmol/L, remuestreo a 5 Hz y z-score por registro sobre canales y tiempos validos; desviarse de este pipeline puede degradar gravemente las features.
- Requiere `chs_info` con las posiciones de fuente y detector en `loc[3:9]`; sin esa informacion geometrica el modelo no puede explotar su principal innovacion.
- Riesgo de sobreajuste a la distribucion de los 22 datasets de preentrenamiento; la generalizacion a poblaciones clinicas o montajes muy distintos no esta cuantificada en la informacion disponible.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible comparar su rendimiento con alternativas.
- Modelo de investigacion: no se documentan garantias de robustez, calibracion ni sesgos poblacionales.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/geonirs-large-pretrained
- Repositorio fuente GeoNIRS (commit `81f8995`): https://github.com/GeoNIRS/GeoNIRS/tree/81f8995e5c3aa6b70e55812b194fc04e4e7ea5b7/checkpoint
- Documentacion de `braindecode.models.GeoNIRS`: https://braindecode.org/stable/generated/braindecode.models.GeoNIRS.html
- Paper: Li, Zongsheng et al. "GeoNIRS: Geometry-Aware Pretraining for Heterogeneous fNIRS Representation Learning", arXiv:2610.17845 (2026). https://arxiv.org/abs/2610.17845
