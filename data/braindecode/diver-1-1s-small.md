# braindecode/DIVER-1-1s-small

## Resumen

DIVER-1-1s-small es el encoder publicado por Han et al. (2025) dentro del proyecto DIVER-1, un modelo fundacional para senales electrofisiologicas cerebrales que unifica registros intracraneales (iEEG: sEEG, ECoG y DBS) y de cuero cabelludo (EEG). Lo desarrolla el equipo del DIVER Project y esta descrito en el preprint arXiv:2512.19097, "DIVER-1: Scaling intracranial EEG foundation models for transferable representations". La version aqui portada corresponde a parches de 1 segundo muestreados a 500 Hz y fue convertida al formato de `braindecode.models.DIVER1` por el equipo de Braindecode.

El modelo resuelve el problema de la escasez de datos etiquetados en neurofisiologia clinica: en lugar de entrenar un clasificador desde cero por cada montaje y tarea, se preentrena un encoder sobre decenas de miles de horas de registros heterogeneos y despues se ajusta con una cabeza de clasificacion especifica. Con 50,6 millones de parametros y un corpus de preentrenamiento de 17.718 sujetos y 59.613 horas, se situa en la gama compacta de los modelos fundacionales de senal fisiologica.

Es relevante ahora porque el ecosistema Braindecode permite cargarlo con `from_pretrained`, pasarle la geometria de electrodos propia (`chs_info`) y ajustarlo en tareas downstream como deteccion de crisis epilepticas o clasificacion de sueno. El repo ocupa 0,4 GB, las descargas superan las 6.800 y la licencia MIT facilita su adopcion tanto en investigacion como en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT sobre parches temporales de senal, con escalado de atencion muP (`mup_attention=True`); encoder de un modelo fundacional iEEG/EEG |
| Parametros totales | 50.640.964 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; la entrada son parches de 1 s a 500 Hz y `n_times` debe ser multiplo de 500 (geometria guardada: 6 canales x 1000 muestras) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el original estaba en bfloat16) |
| Idiomas soportados | no disponible (modelo sobre senal, no sobre texto) |
| Licencia | MIT (pesos); el codigo de Braindecode es BSD-3-Clause |
| Formato de pesos | safetensors (repo con integracion `pytorch_model_hub_mixin` de PyTorch) |

## Arquitectura y entrenamiento

El encoder esta pensado para senal bruta multicale: se le pasa un tensor `(batch, canales, muestras)` y devuelve caracteristicas. El tokenizado es temporal, con parches de 1 segundo a 500 Hz, y la atencion usa escalado muP, un detalle poco habitual en modelos de senal que estabiliza el entrenamiento y el ajuste fino al cambiar el numero de canales o la longitud de entrada. El modelo no depende de una geometria fija: aunque los pesos guardados asumen 6 canales y 1000 muestras, al cargar se le puede pasar el montaje propio via `chs_info`, el `n_times` y el `n_outputs` deseados.

El preentrenamiento combina iEEG y EEG. Por el lado intracraneal usa AJILE12 (12 sujetos, DANDI 000055) y un corpus privado de ECoG/sEEG de 25 pacientes con epilepsia farmacorresistente, unos 7 dias por paciente a 2 kHz y con aprobacion de comite de etica. Por el lado de cuero cabelludo usa TUEG (Temple University Hospital EEG Corpus), HBN (Healthy Brain Network EEG), NCHSDB (solo canales EEG) y PEERS (OpenNeuro ds004395). El corpus conjunto DIVER IE reune 17.718 sujetos y 59.613 horas, con 2.844 horas del corpus intracraneal propio tras un control de calidad mas estricto y 16 epocas de entrenamiento. El preentrenamiento es auto-supervisado con enmascaramiento y cabezas de reconstruccion; esas cabezas y el token de mascara se descartan en la conversion, que solo conserva el encoder y castea de bfloat16 a float32. Las caracteristicas del encoder coinciden con las del modelo oficial con error 0.0e+00 en float32 sobre CPU, tanto en canales intracraneales como de cuero cabelludo.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de senal EEG e iEEG; es la tarea declarada en el pipeline del modelo.
- Procesamiento unificado de modalidades: sEEG, ECoG y DBS se tratan como intracraneales, y EEG como cuero cabelludo, segun el tipo de canal declarado en `chs_info`.
- Acepta montajes arbitrarios: el numero de canales y la longitud de la ventana se configuran al cargar, sin reentrenar el encoder.
- Base para ajuste fino supervisado en tareas de clasificacion tras anadir una cabeza (por ejemplo, binaria con `n_outputs=2`).
- Ajuste con escalado muP que facilita la transferencia a configuraciones de entrada distintas de las de preentrenamiento.
- Capacidades de texto, codigo, vision, audio, tool calling o agentes: no disponibles (el modelo opera exclusivamente sobre senal neurofisiologica).
- Capacidades multilingues: no aplicables.

## Casos de uso

- Deteccion de crisis epilepticas: ajustar el encoder con una cabeza binaria sobre ventanas de 1 s y usarlo como clasificador de eventos ictales en monitorizacion de larga duracion, aprovechando que el preentrenamiento ya incluye horas de registros de pacientes con epilepsia farmacorresistente.
- Estadificacion del sueno: reutilizar las caracteristicas sobre canales EEG y ajustar con NCHSDB u otro corpus con hipnograma para clasificar fases del sueno en estudios polisomnograficos.
- Decodificacion motora en interfaces cerebro-computador: ajustar el encoder sobre senales ECoG de AJILE12 o de pacientes con electrodos implantados para predecir movimientos o intencion motora a partir de actividad cortical.
- Analisis de memorias y cognicion: emplear caracteristicas sobre PEERS (OpenNeuro ds004395) para tareas de codificacion y recuperacion de memoria, donde el modelo aporta una representacion comun entre sujetos.
- Investigacion traslacional entre modalidades: usar el mismo encoder para comparar patrones entre registros intracraneales y EEG de cuero cabelludo, por ejemplo para validar si un biomarcador visto en iEEG se refleja en superficie.
- Pretratamiento en pipelines de neurodatos: integrar el encoder en un pipeline de Braindecode/MNE para generar embeddings de senal y alimentar clasificadores ligeros (regresion logistica, SVM) en lugar de entrenar redes desde cero con pocos sujetos.
- Deteccion de artefactos y control de calidad: usar los embeddings para separar ventanas limpias de ventanas con artefactos antes del analisis, dado que el preentrenamiento incluyo corpus con control de calidad variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo verifica la equivalencia numerica de las caracteristicas del encoder con el modelo oficial (error 0.0e+00 en float32 sobre CPU, canales intracraneales y de cuero cabelludo), no la precision en tareas downstream. El protocolo de ajuste fino del articulo remite al script `scripts/finetune_faced.sh` del repositorio del proyecto, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: con 50,6 M de parametros, los pesos en float32 ocupan unos 0,2 GB; la memoria dominante sera la de las activaciones, que escala con el numero de canales y la longitud de la ventana.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 8 GB o mas pueden ejecutar inferencia y ajuste fino de la cabeza en ventanas tipicas.
- Para lotes grandes o ventanas de varios segundos con muchos canales, se recomiendan A100, H100 o L40S por ancho de banda y memoria.
- Opciones de despliegue: Braindecode con PyTorch como via principal; al ser un modelo de senal y no de texto, no aplican vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; dependen del montaje, la longitud de ventana y el hardware. El repo pesa 0,4 GB y la carga es rapida en cualquier equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DIVER-1-1s-small (este) | 50,6 M | Parches de 1 s a 500 Hz; `n_times` multiplo de 500 | iEEG y EEG | MIT | Hugging Face, integracion Braindecode |
| Modelos fundacionales EEG de la misma familia (otras variantes DIVER-1) | no disponible | no disponible | iEEG y EEG | no disponible | no disponible en la informacion proporcionada |
| Alternativas comparables de modelo fundacional EEG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de cifras de rendimiento ni de especificaciones de modelos alternativos que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El release contiene unicamente el encoder: no incluye cabeza de clasificacion, por lo que necesita ajuste fino supervisado antes de dar predicciones utiles.
- La equivalencia verificada cubre caracteristicas del encoder en float32 sobre CPU; no se ha validado la precision downstream, los kernels de GPU ni la precision mixta.
- La geometria guardada es de 6 canales y 1000 muestras; usarla sin sustituirla por el montaje real produce resultados incorrectos. Hay que pasar `chs_info`, `n_times` y `n_outputs` al cargar.
- `n_times` debe ser multiplo de 500; ventanas de otra duracion no son validas sin remuestreo.
- Riesgo de fuga en evaluacion: TUEG contiene los subcorpus TUAB, TUEV, TUSZ, TUAR, TUSL y TUEP, y una evaluacion sobre ellos no esta necesariamente fuera del conjunto de preentrenamiento salvo que los autores lo hayan eliminado. Lo mismo aplica a HBN, cuyas releases concretas usadas no se detallan.
- Parte del corpus de preentrenamiento (iEEG autoproducido de 25 pacientes) es privado y no se ha liberado, lo que limita la reproducibilidad exacta del preentrenamiento.
- Sesgos: no documentados en la informacion disponible; al entrenar con cohortes clinicas (pacientes con epilepsia, estudios de sueno) puede haber sesgo hacia esas poblaciones y towards los montajes mejor representados.
- Alucinacion en el sentido de texto no aplica; el riesgo analogo es producir embeddings poco informativos o clasificaciones erroneas en montajes o patologias poco representadas.
- Licencia MIT en los pesos, pero el codigo de Braindecode es BSD-3-Clause y los datasets de terceros conservan sus propias condiciones, algunas no comerciales (por ejemplo, la release no comercial de HBN en NEMAR); conviene revisarlas antes de un uso comercial.
- Uso clinico: no es un dispositivo medico ni ha sido validado para diagnostico; cualquier aplicacion clinica requiere validacion regulatoria propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braindecode/DIVER-1-1s-small
- Articulo: https://arxiv.org/abs/2512.19097
- Documentacion de `braindecode.models.DIVER1`: https://braindecode.org/stable/generated/braindecode.models.DIVER1.html
- Repositorio del proyecto DIVER-1: https://github.com/DIVER-Project/DIVER-1
- Carpeta de Google Drive con los pesos originales: https://drive.google.com/drive/folders/1Wmv36jifjE0Jj6noGOFFsqRzK-4xnj1b
- AJILE12 (DANDI 000055): https://dandiarchive.org/dandiset/000055
- NEMAR nm000358: https://nemar.org/dataset/nm000358
- NEMAR on004395: https://nemar.org/dataset/on004395
- OpenNeuro ds004395: https://openneuro.org/datasets/ds004395
- HBN-EEG: https://neuromechanist.github.io/data/hbn/
- NCHSDB: https://sleepdata.org/datasets/nchsdb
- TUH EEG Corpus: https://isip.piconepress.com/projects/nedc/html/tuh_eeg/
- Cita del software Braindecode: https://doi.org/10.5281/zenodo.17699192
