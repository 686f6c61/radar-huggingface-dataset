# braindecode/plot_sleep_staging_eldele2021

## Resumen

`plot_sleep_staging_eldele2021` es un artefacto de pesos preentrenados publicado por el proyecto Braindecode en Hugging Face. No se trata de un modelo de lenguaje, sino de un clasificador de senales EEG para la tarea de estadificacion del sueno (sleep staging), es decir, la asignacion automatica de cada epoca de registro a una de las cinco fases del sueno (W, N1, N2, N3 y REM). El modelo se utiliza como material de soporte del tutorial oficial `examples/applied_examples/plot_sleep_staging_eldele2021.py` de la libreria Braindecode, de modo que la documentacion pueda mostrar predicciones estables sin necesidad de reentrenar.

La arquitectura subyacente es AttnSleep, una red neuronal convolucional con mecanismos de atencion disenada especificamente para senales EEG de una unica derivacion (Fpz-Cz). El checkpoint se entreno de forma supervisada sobre el Sleep-EDF Database Expanded (estudio Sleep Cassette, PhysioNet sleep-edfx 1.0.0), cargado mediante la clase `SleepPhysionet` de Braindecode. El repositorio es de tamano practicamente nulo (0.0 GB) y contiene unicamente tres ficheros: los parametros del clasificador, el historial de entrenamiento y los metadatos.

Su relevancia es fundamentalmente practica y educativa: proporciona un punto de partida reproducible para quien quiera explorar pipelines de decoding EEG con deep learning sin asumir el coste de entrenamiento, y sirve como referencia de como Braindecode empaqueta checkpoints junto con su procedencia de datos. No es un modelo generativo ni un componente de un sistema de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttnSleep (CNN con atencion, supervisado, 5 clases) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre epocas de EEG, no sobre tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de senal EEG, no de texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`params.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un clasificador AttnSleep supervisado de cinco clases, entrenado sobre una unica derivacion EEG (Fpz-Cz). AttnSleep combina bloques convolucionales con modulos de atencion para capturar dependencias temporales en senales fisiologicas; en este checkpoint se emplea la variante de una sola derivacion, lo que reduce los requisitos de sensores respecto a configuraciones multicanal.

El entrenamiento se realizo sobre Sleep-EDF Database Expanded (Sleep Cassette), cargado con `SleepPhysionet` de Braindecode usando unicamente los canales Fpz-Cz y Pz-Oz. La particion efectiva, segun la propia model card, es: entrenamiento con los indices de grabacion 0-3 (sujetos 0 y 1, ambas noches: SC4001, SC4002, SC4011, SC4012) y validacion con los indices 4-5 (sujeto 2, ambas noches: SC4021, SC4022). Los sujetos 3, 4 y 5 se cargan pero no se utilizan. La model card advierte explicitamente de que el texto del tutorial y la configuracion de W&B del entrenador indican "subjects 0-3 train / 4-5 valid", lo que no coincide con lo que hace el codigo: `BaseConcatDataset.split` recibe indices de grabacion sobre el dataset concatenado, no identificadores de sujeto. El early stopping se configuro sobre `valid_bal_acc` con paciencia 20 y restauracion del mejor checkpoint. No se documentan en la informacion disponible detalles sobre numero de tokens, composicion del dataset ni uso de RLHF/DPO (no aplicables a este dominio).

## Capacidades

- Clasificacion de epocas de EEG en cinco fases del sueno: W (vigilia), N1, N2, N3 y REM.
- Procesamiento de senal EEG de una unica derivacion (Fpz-Cz), lo que simplifica el hardware necesario.
- Integracion nativa con el ecosistema Braindecode: carga mediante `from_pretrained`, acceso a `model.card_data.datasets` y compatibilidad con las utilidades de preprocesado de la libreria.
- Reproduccion de las predicciones mostradas en el tutorial oficial de sleep staging.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Reproduccion de tutoriales y documentacion: cargar el checkpoint con `from_pretrained` para generar las graficas de prediccion del tutorial `plot_sleep_staging_eldele2021.py` sin reentrenar, garantizando resultados estables en la documentacion oficial.
- Docencia en neuroingenieria: usar el modelo como ejemplo completo de pipeline de decoding EEG (carga de Sleep-EDF, preprocesado con Braindecode, entrenamiento con Skorch y evaluacion) en cursos y talleres.
- Linea base para investigacion en sleep staging: emplear el checkpoint como referencia de rendimiento sobre Sleep-EDF antes de probar arquitecturas o estrategias de aumento de datos alternativas.
- Prototipado de sistemas de monitorizacion del sueno: integrar el clasificador en un prototipo que reciba EEG de una sola derivacion y produzca una hipnograma aproximado, con las cautelas propias de un modelo entrenado sobre muy pocos sujetos.
- Validacion de pipelines de preprocesado: comparar el impacto de distintas tecnicas de filtrado, normalizacion o segmentacion sobre las predicciones del checkpoint, ya que el modelo es sensible a la representacion de entrada.
- Pruebas de integracion en Braindecode: verificar el correcto funcionamiento de `from_pretrained`, la carga de metadatos y la compatibilidad con versiones de la libreria en entornos de CI.
- Ejemplo de gestion de procedencia de datos: ilustrar como Braindecode documenta la trazabilidad entre pesos, datasets de origen (NEMAR `nm000185`) e historial de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia `metadata.json` como resumen de metricas del checkpoint almacenado y `history.json` como historial de entrenamiento de Skorch, pero no se incluyen valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y se trata de un clasificador CNN de dimensiones reducidas, por lo que se espera que quepa holgadamente en cualquier GPU consumer, aunque no se publican cifras exactas.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tipo de modelo (CNN sobre epocas de EEG), cualquier GPU moderna (incluidas RTX 3060 o superiores) deberia ser suficiente, si bien esta afirmacion no esta respaldada por datos publicados.
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano del artefacto, aunque no se confirma con mediciones.
- Opciones de despliegue: carga mediante la API de Braindecode (`from_pretrained`), con pesos en safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros checkpoints de sleep staging ni con implementaciones alternativas de AttnSleep en Braindecode u otras librerias.

## Limitaciones y advertencias

- Entrenado exclusivamente con los sujetos 0 y 1 de Sleep-EDF (cuatro grabaciones) y validado con el sujeto 2; la generalizacion a otras poblaciones, equipos o protocolos de registro no esta garantizada.
- Discrepancia documentada entre el texto del tutorial y el codigo de entrenamiento respecto a la particion de datos; conviene revisar la model card antes de citar la configuracion experimental.
- Modelo de una unica derivacion (Fpz-Cz): no aprovecha informacion espacial de otros canales y puede degradarse con montajes diferentes.
- Riesgo de sobreajuste a las caracteristicas especificas de Sleep-EDF (poblacion, dispositivo, criterios de anotacion), con posible perdida de rendimiento en dominios distintos.
- No es un dispositivo medico: no debe utilizarse para diagnostico clinico de trastornos del sueno sin validacion regulatoria adicional.
- No se documentan sesgos demograficos ni analisis de equidad; la composicion de la cohorte de entrenamiento es limitada.
- Licencia BSD-3-Clause: permite uso comercial y modificacion con atribucion y sin garantias; debe citarse el software Braindecode (DOI 10.5281/zenodo.17699192) y los datasets originales.
- El repositorio no incluye pipeline, idiomas ni variantes cuantizadas; su uso esta pensado para el entorno Braindecode y no como servicio generico.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/plot_sleep_staging_eldele2021
- Dataset de origen en NEMAR: https://nemar.org/dataset/nm000185
- Sleep-EDF Database Expanded (PhysioNet): https://physionet.org/content/sleep-edfx/1.0.0/
- Documentacion de Braindecode: https://braindecode.org/stable/index.html
- Referencia de API de Braindecode: https://braindecode.org/stable/api.html
- Repositorio GitHub de Braindecode: https://github.com/braindecode
- Organizacion en Hugging Face: https://huggingface.co/braindecode
- Paquete PyPI: https://pypi.org/project/braindecode/
- Cita del software (Zenodo): https://doi.org/10.5281/zenodo.17699192
