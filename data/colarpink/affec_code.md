# colarpink/AFFEC_Code

## Resumen

AFFEC_Code no es un modelo de lenguaje, sino un devkit de desarrollo (repositorio de codigo y utilidades) para el conjunto de datos AFFEC (Advancing Face-to-Face Emotion Communication), un corpus multimodal de computacion afectiva. El repositorio lo publica el usuario colarpink en Hugging Face y contiene un paquete Python (`affec/`), scripts de linea de comandos para descargar datos y ejecutar analisis, y cuadernos Jupyter con el pipeline completo de extraccion de caracteristicas y entrenamiento de clasificadores. El conjunto de datos subyacente recoge 72 participantes en 84 dialogos emocionales simulados, con unas 5000 pruebas y mas de 20000 etiquetas de emocion.

El interes del repositorio reside en que proporciona una linea base reproducible para el reconocimiento multimodal de emociones: combina senales de EEG, seguimiento ocular y pupila, respuesta galvanica de la piel (GSR), unidades de accion facial (Action Units) y seguimiento del cursor, con etiquetas de arousal y valencia tanto sentidas como percibidas. El devkit no incluye pesos de modelo; el tamano del repositorio es de 0.0 GB y los datos crudos se descargan aparte desde Zenodo.

Dado que el repositorio no contiene un modelo entrenado ni una model card de un modelo generativo, esta ficha documenta el devkit y sus lineas base tal como aparecen en la informacion disponible, indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (devkit de datos y utilidades); lineas base con AutoGluon (XGBoost, LightGBMXT, NeuralNetFastAI) |
| Parametros totales | No disponible (no es un modelo de pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Codigo: MIT; dataset: CC0 1.0 Universal |
| Formato de pesos | No disponible (no contiene pesos; datos en NPZ y ZIP por modalidad) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia. Su funcion es orquestar la carga de datos multimodales, la extraccion de caracteristicas y el entrenamiento de clasificadores tabulares mediante AutoGluon. Las lineas base reportadas emplean XGBoost, LightGBMXT y NeuralNetFastAI sobre caracteristicas derivadas de las modalidades eye tracking, Action Units, GSR y rasgos de personalidad Big Five (OCEAN), con validacion cruzada de 5 folds y una particion disjunta por participante.

El conjunto de datos AFFEC consta de 72 participantes, 84 dialogos emocionales simulados, aproximadamente 5000 pruebas y mas de 20000 etiquetas de emocion. Las modalidades registradas son EEG, seguimiento ocular, pupila, GSR, Action Units faciales y seguimiento del cursor. Las etiquetas cubren arousal y valencia en dos ejes (sentidas y percibidas). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni sobre tecnicas de RLHF o DPO, ya que no se trata de un modelo generativo.

## Capacidades

- Carga y gestion del dataset AFFEC mediante el paquete `affec/` y el script `scripts/download_data.py`, que descarga las modalidades desde Zenodo.
- Extraccion de caracteristicas multimodales a partir de senales de eye tracking, pupila, GSR, Action Units faciales y rasgos de personalidad.
- Entrenamiento de clasificadores tabulares con AutoGluon para predecir arousal y valencia (sentidas y percibidas) en tres niveles (alto, medio, bajo).
- Evaluacion con validacion cruzada de 5 folds y particion disjunta por participante mediante `scripts/train_simple_model_official_split.py`.
- Analisis estadistico reproducible con `scripts/run_statistical_analysis.py`.
- Configuracion selectiva de modalidades (eye, action_units, gsr, personality) para experimentos ablativos.
- Cuadernos de demostracion (`demo_analysis.ipynb`) y pipeline completo (`multimodal_emotion_recogntion.ipynb`).
- No incluye capacidades de generacion de texto, codigo, vision general, tool calling ni agentes.

## Casos de uso

- Investigacion en computacion afectiva: el devkit permite reproducir las lineas base del dataset AFFEC con una particion disjunta por participante, lo que facilita la comparacion entre estudios de reconocimiento emocional multimodal.
- Experimentos de ablacion de modalidades: la configuracion `USE_MODALITIES` permite entrenar modelos solo con eye tracking, solo con Action Units, solo con GSR o sin personalidad, para medir la contribucion de cada senal.
- Desarrollo de sistemas de deteccion de emocion en interacciones cara a cara: las caracteristicas de Action Units y GSR sirven como base para prototipos de analisis de estados afectivos en dialogos.
- Validacion de pipelines de extraccion de caracteristicas: los scripts de analisis completo y estadistico permiten comprobar la reproducibilidad de las senales antes de integrarlas en un sistema mayor.
- Docencia y formacion: los cuadernos `demo_analysis.ipynb` y `multimodal_emotion_recogntion.ipynb` ofrecen un flujo de trabajo de extremo a extremo adecuado para cursos de analisis de datos multimodales.
- Preparacion de publicaciones: el script `scripts/prepare_zenodo_upload.py` y el esquema documentado en `data/raw/README.md` facilitan empaquetar y versionar actualizaciones del dataset en Zenodo.
- Evaluacion rapida con subconjuntos: la opcion `--max-participants 8` permite validar el pipeline con 8 participantes antes de lanzar el analisis completo.

## Benchmarks y rendimiento

Resultados de lineas base con validacion cruzada de 5 folds y configuracion multimodal completa (segun la model card):

| Metrica | Perceived Arousal | Perceived Valence | Felt Arousal | Felt Valence |
|---|---|---|---|---|
| Mejor modelo | XGBoost | XGBoost | LightGBMXT | NeuralNetFastAI |
| F1 alto | 0.457 ± 0.016 | 0.232 ± 0.025 | 0.269 ± 0.040 | 0.473 ± 0.030 |
| F1 medio | 0.362 ± 0.017 | 0.431 ± 0.017 | 0.485 ± 0.025 | 0.294 ± 0.027 |
| F1 bajo | 0.495 ± 0.021 | 0.610 ± 0.015 | 0.680 ± 0.016 | 0.613 ± 0.025 |
| F1 macro | 0.438 ± 0.008 | 0.424 ± 0.015 | 0.478 ± 0.014 | 0.460 ± 0.019 |
| Precision (accuracy) | 0.442 ± 0.009 | 0.506 ± 0.015 | 0.568 ± 0.016 | 0.514 ± 0.022 |

No se han publicado resultados frente a modelos de lenguaje ni comparaciones con otros conjuntos de datos en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de GPU en la model card; las lineas base con AutoGluon (XGBoost, LightGBMXT, NeuralNetFastAI) sobre caracteristicas tabulares pueden ejecutarse en CPU.
- Entorno de software requerido: Python >= 3.8, AutoGluon, Pandas, NumPy, scikit-learn, NeuroKit2 y Tabulate.
- Almacenamiento: los datos crudos se descargan aparte desde Zenodo y se almacenan en `data/raw/`; el repositorio en si ocupa 0.0 GB.
- Opciones de despliegue: ejecucion local mediante scripts de linea de comandos o Jupyter Notebook; no se documentan opciones de servido (vLLM, TGI, Ollama, llama.cpp) porque no aplica a este repositorio.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada devkits o conjuntos de datos comparables de la misma categoria con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni pesos; es un devkit de datos y utilidades. No debe interpretarse como un modelo de IA generativa.
- El repositorio es "data-free": los datos crudos no se incluyen en git y deben descargarse desde Zenodo mediante `scripts/download_data.py`.
- Las lineas base reportadas son modestas (F1 macro entre 0.424 y 0.478), lo que refleja la dificultad del reconocimiento emocional multimodal y limita su uso directo en produccion.
- El conjunto de datos procede de dialogos simulados con 72 participantes; puede no generalizar a poblaciones, idiomas o contextos culturales distintos.
- La licencia del codigo es MIT y la del dataset CC0 1.0, pero la model card no detalla restricciones adicionales de uso comercial ni de redistribucion de los datos derivados.
- La citacion academica esta pendiente ("Citation to be added upon publication"), lo que puede afectar a la trazabilidad en publicaciones.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (no aplica) ni limitaciones de contexto o idioma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/colarpink/AFFEC_Code
- Dataset en Zenodo (DOI): https://doi.org/10.5281/zenodo.14794876
- Licencia del dataset (CC0 1.0): https://creativecommons.org/publicdomain/zero/1.0/
- Esquema y changelog del dataset: `data/raw/README.md` (dentro del repositorio)
- Script de descarga: `scripts/download_data.py` (dentro del repositorio)
