# braindecode/plot_sleep_staging_chambon2018

## Resumen

`braindecode/plot_sleep_staging_chambon2018` es un conjunto de artefactos preentrenados publicados por el proyecto Braindecode para el tutorial `examples/applied_examples/plot_sleep_staging_chambon2018.py`. No se trata de un modelo de lenguaje, sino de un clasificador de EEG para estadificación del sueño basado en la arquitectura SleepStagerChambon2018, que clasifica ventanas de 30 segundos en cinco clases de sueño (vigilia y fases N1-N3 y REM). El repositorio contiene únicamente los pesos (`params.safetensors`), el historial de entrenamiento de Skorch (`history.json`) y un resumen de métricas (`metadata.json`).

El objetivo declarado por los autores es que la documentación de Braindecode pueda mostrar predicciones estables sin necesidad de reentrenar el modelo desde cero. Por tanto, es un checkpoint de tutorial, no un modelo destinado a uso clínico ni a producción. El tamaño del repositorio es de 0,0 GB, lo que confirma que se trata de un artefacto ligero asociado a un ejemplo didáctico.

La relevancia es acotada: sirve como referencia reproducible para quien siga el tutorial de Braindecode sobre estadificación del sueño y quiera verificar resultados sin ejecutar el entrenamiento completo. La licencia BSD-3-Clause permite reutilización, pero el modelo se ha entrenado con un subconjunto muy reducido de datos (dos registros), lo que limita seriamente su generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SleepStagerChambon2018 (clasificador de EEG basado en CNN, implementado en Braindecode sobre PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de ventanas de 30 s a 100 Hz, secuencias de 3 ventanas |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo de senal EEG, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`params.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SleepStagerChambon2018, un clasificador convolucional disenado para procesar senal EEG en crudo y asignar una etapa de sueño a cada ventana. La entrada son dos canales EEG (Fpz-Cz y Pz-Oz) muestreados a 100 Hz, con ventanas de 30 segundos agrupadas en secuencias de 3 ventanas. La salida es una clasificacion en 5 clases (vigilia, N1, N2, N3 y REM).

El entrenamiento se realizo sobre el dataset Sleep-EDF Database Expanded (Sleep Cassette, PhysioNet sleep-edfx 1.0.0), cargado mediante `SleepPhysionet` de Braindecode y limitado a los canales EEG Fpz-Cz y Pz-Oz. El split es extremadamente reducido: `subject_ids=[0, 1]`, `recording_ids=[2]` (solo la segunda noche) y `crop_wake_mins=30`, lo que produce dos registros. El registro 0 (sujeto 0, noche 2, SC4002) se usa para entrenamiento y el registro 1 (sujeto 1, noche 2, SC4012) como validacion, con `EarlyStopping(load_best=True)` para seleccionar la epoca final. El split se realiza mediante `BaseConcatDataset.split(dict(train=..., valid=...))`, cuyos valores son indices de registro, no identificadores de sujeto. El entrenamiento se genero con un script offline (`scripts/train_and_push_tutorial_checkpoints.py`, retirado del repositorio en el commit 05e606dd del 2026-04-19 y trasladado a un gist) y el historial se conserva en `history.json`.

## Capacidades

- Clasificacion de etapas de sueño en 5 clases (vigilia, N1, N2, N3, REM) a partir de senal EEG.
- Procesamiento de ventanas de 30 segundos a 100 Hz en secuencias de 3 ventanas.
- Carga directa mediante `from_pretrained` de Braindecode, con acceso a metadatos del dataset a traves de `model.card_data.datasets`.
- Reproduccion de las predicciones mostradas en el tutorial oficial de Braindecode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Reproduccion del tutorial de Braindecode: cargar el checkpoint con `from_pretrained` para obtener las mismas predicciones que la documentacion oficial sin reentrenar, util para verificar la instalacion y el pipeline.
- Docencia y formacion: usar el modelo como ejemplo practico en cursos sobre decodificacion de EEG y estadificacion del sueño, ya que el checkpoint evita tiempos de entrenamiento en el aula.
- Pruebas de integracion de pipelines: validar que un pipeline propio de preprocesado (filtrado, remuestreo a 100 Hz, segmentacion en ventanas de 30 s) produce entradas compatibles con un modelo Braindecode conocido.
- Comparacion de referencia en experimentos: emplear las predicciones del checkpoint como linea base minima frente a modelos propios entrenados con mas datos, siempre teniendo en cuenta su escaso entrenamiento.
- Desarrollo de demos y cuadernos interactivos: mostrar el flujo completo de carga de datos Sleep-EDF, inferencia y visualizacion de hipnogramas sin depender de recursos de computo elevados.
- Verificacion de metadatos y trazabilidad: inspeccionar `metadata.json` y `history.json` para entender la configuracion de entrenamiento (epocas, early stopping, split) y reutilizarla como plantilla en experimentos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `metadata.json` con metricas resumidas del checkpoint, pero su contenido numerico no se detalla en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,0 GB, lo que sugiere un checkpoint muy ligero que previsiblemente cabe en cualquier GPU consumer.
- GPU recomendadas: no disponible; por el tipo de modelo (CNN sobre EEG con ventanas de 30 s), es probable que funcione en CPU, pero no se confirma en la informacion disponible.
- Compatibilidad con GPU consumer: no confirmada explicitamente; el tamano del artefacto indica que no deberia ser un cuello de botella.
- Opciones de despliegue: carga mediante Braindecode (`from_pretrained`) sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `braindecode/plot_sleep_staging_chambon2018` | SleepStagerChambon2018 (CNN EEG) | no disponible | ventanas de 30 s, secuencias de 3 | Sleep-EDF (2 registros, sujetos 0 y 1, noche 2) | BSD-3-Clause | Hugging Face |
| SleepStagerChambon2018 (implementacion original en Braindecode) | CNN EEG | no disponible | ventanas de 30 s | Configurable por el usuario | BSD-3-Clause (Braindecode) | Repositorio Braindecode |
| Otros checkpoints de Braindecode en Hugging Face | Distintas arquitecturas EEG | no disponible | no disponible | Distintos datasets | BSD-3-Clause | Hugging Face (organizacion braindecode) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo dos registros (sujetos 0 y 1, segunda noche), lo que implica una generalizacion muy limitada a otras personas, noches o equipos de registro.
- No es un modelo para uso clinico ni diagnostico; es un artefacto de tutorial.
- El split utiliza indices de registro, no identificadores de sujeto; replicar el entrenamiento requiere entender esta convencion para evitar fugas de datos.
- No se documentan sesgos especificos, pero el sesgo demografico del dataset Sleep-EDF (poblacion acotada) se traslada al modelo.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de clasificaciones erroneas fuera de la distribucion de entrenamiento.
- Limitaciones de idioma no aplicables; el modelo opera sobre senal EEG, no sobre texto.
- La licencia BSD-3-Clause permite uso comercial, pero la calidad del checkpoint hace desaconsejable su uso en produccion sin reentrenamiento.
- El script de entrenamiento original se retiro del repositorio en el commit 05e606dd (2026-04-19) y se traslado a un gist externo, lo que puede dificultar la reproducibilidad a largo plazo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/plot_sleep_staging_chambon2018
- Metadata del checkpoint: https://huggingface.co/braindecode/plot_sleep_staging_chambon2018/resolve/main/metadata.json
- Documentacion de Braindecode: https://braindecode.org/stable/index.html
- Referencia de API de Braindecode: https://braindecode.org/stable/api.html
- Repositorio GitHub de Braindecode: https://github.com/braindecode
- Organizacion Braindecode en Hugging Face: https://huggingface.co/braindecode
- Paquete PyPI: https://pypi.org/project/braindecode/
- Dataset Sleep-EDF en PhysioNet: https://physionet.org/content/sleep-edfx/1.0.0/
- Dataset nm000185 en NEMAR: https://nemar.org/dataset/nm000185
- Zenodo (cita de Braindecode): https://doi.org/10.5281/zenodo.17699192
- Gist con el script de entrenamiento (referenciado en la model card, URL truncada en la informacion disponible): https://gist.github.com/bru...
