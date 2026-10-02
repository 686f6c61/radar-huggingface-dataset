# knagode/vocal-coach

## Resumen

Vocal-coach es un conjunto de clasificadores de calidad de voz cantada publicado por el usuario knagode (Klemen Nagode) en HuggingFace. No se trata de un modelo neuronal entrenado de extremo a extremo, sino de una tuberia de aprendizaje automatico clasico: se extraen embeddings congelados del modelo preentrenado `microsoft/wavlm-base-plus`, se normalizan con `StandardScaler` y se alimenta un clasificador `LogisticRegression` de scikit-learn. La model card indica que existe un fichero `<task>.joblib` por tarea, aunque solo se documentan metricas para la tarea `breathiness`.

Cada clasificador puntua ventanas de audio de 1 segundo, por lo que el grano de analisis es muy fino (una prediccion por segundo de canto). La tarea documentada distingue entre voz aireada (`breathy`) y voz clara (`clear`). El entrenamiento es extremadamente reducido: 8 clips y 57 ventanas para esa tarea, con una evaluacion leave-one-session-out sobre 8 muestras.

Su relevancia es sobre todo practica y de prototipado: demuestra que se puede construir un detector de cualidades vocales especifico con muy poco coste computacional, reutilizando un encoder autosupervisado y una regresion logistica. En cambio, el tamano del conjunto de entrenamiento, la ausencia de licencia declarada y la falta de documentacion de las demas tareas limitan seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tuberia de aprendizaje clasico sobre embeddings congelados: `microsoft/wavlm-base-plus` (extraccion de caracteristicas) + `StandardScaler` + `LogisticRegression` (scikit-learn) |
| Parametros totales | No disponible para el clasificador; el extractor congelado `microsoft/wavlm-base-plus` ronda los 94 M de parametros (dato del modelo base, no del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en tokens; la unidad de inferencia es una ventana de audio de 1 segundo |
| Tipos de cuantizacion | No aplica en el clasificador (joblib). El encoder WavLM puede ejecutarse en fp32 o fp16 segun el runtime de PyTorch |
| Idiomas soportados | No disponibles (la tarea es acustica, no depende del idioma del texto, pero el autor no lo declara) |
| Licencia | No disponible |
| Formato de pesos | `joblib` (un fichero por tarea); los pesos del encoder WavLM se descargan aparte desde HuggingFace |
| Libreria declarada | sklearn |
| Pipeline en HuggingFace | audio-classification |
| Tarea documentada | `breathiness` (etiquetas: `breathy`, `clear`) |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-01 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en cascada. Primero se calculan embeddings de audio con el modelo `microsoft/wavlm-base-plus`, que se mantiene congelado (sin ajuste fino). La model card especifica que el vector resultante se obtiene promediando sobre las capas y sobre el eje temporal, de modo que cada ventana de 1 segundo queda representada por un unico vector de caracteristicas. Despues, ese vector pasa por un `StandardScaler` y por una `LogisticRegression`, que es el unico componente entrenado por el autor. No hay por tanto decodificacion especulativa, atencion lineal ni tecnicas de RLHF/DPO implicadas: es un clasificador lineal sobre representaciones preentrenadas.

El entrenamiento de la tarea `breathiness` empleo 8 clips de audio y 57 ventanas etiquetadas. La evaluacion declarada es leave-one-session-out, lo que es metodologicamente correcto para evitar fuga de informacion entre sesiones de grabacion, pero con solo 8 muestras de evaluacion el intervalo de confianza de cualquier metrica es muy amplio. La innovacion tecnica del repositorio es de economia de recursos: dado que el encoder no se entrena, el coste de anadir una nueva tarea se limita a etiquetar ventanas y ajustar una regresion logistica, que se entrena en segundos en CPU.

## Capacidades

- Clasificacion de calidad vocal por ventanas de 1 segundo: la tarea documentada distingue voz aireada (`breathy`) de voz clara (`clear`).
- Arquitectura extensible por tareas: la model card indica que hay un modelo `<task>.joblib` por tarea, aunque solo se publican metricas de `breathiness`.
- Extraccion de embeddings de audio reutilizable: al usar WavLM base-plus congelado, los vectores intermedios pueden reaprovecharse para otras cabeceras de clasificacion.
- Ejecucion ligera en CPU: el clasificador es lineal y el encoder puede ejecutarse sin GPU.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, uso agentico ni modo de pensamiento.
- No se documentan capacidades multilingues ni soporte de audio en tiempo real.
- No se documenta ninguna capacidad de transcripcion ni de conversion texto-a-habla.

## Casos de uso

- Deteccion de voz aireada en practica de canto: la herramienta puntua ventanas de 1 segundo y permite marcar los tramos de una grabacion donde el aire en la voz es mas pronunciado, de modo que el alumno pueda revisar esos fragmentos concretos.
- Feedback automatico en aplicaciones de entrenamiento vocal: integrado en una app que graba al usuario, el clasificador puede generar avisos del tipo "en este compas la voz suena aireada" sin necesidad de un profesor humano presente.
- Etiquetado asistido de datasets de voz cantada: sirve como preanotador para que un anotador humano revise solo las ventanas dudosas, reduciendo el coste de construir corpus de calidad vocal.
- Prototipado rapido en investigacion de analisis musical: al ser un pipeline de scikit-learn sobre embeddings congelados, permite validar una hipotesis (por ejemplo, si WavLM separa voz aireada de voz clara) en pocas horas y con pocos datos.
- Triage en clases de canto grabadas: procesar las grabaciones semanales de un alumno y extraer un indice de aire por sesion, para que el profesor llegue a la clase con un resumen cuantitativo.
- Higiene vocal de locutores y dobladores: monitorizar sesiones largas de grabacion y avisar cuando aparece un patron sostenido de voz aireada, con la advertencia de que no es una herramienta clinica.
- Control de calidad de audio en produccion de podcast: verificar de forma automatizada que las tomas seleccionadas no presentan voz aireada antes de publicar.
- Base para clasificadores adicionales: reutilizar el mismo esquema (embeddings WavLM + StandardScaler + regresion logistica) para tareas como deteccion de voz tensa, vibrato o afonicidad, siempre que se disponga de datos etiquetados suficientes.

## Benchmarks y rendimiento

La unica evaluacion publicada en la model card corresponde a la tarea `breathiness`, sobre 8 ventanas (4 de cada clase), con leave-one-session-out. Los numeros son los siguientes:

| Clase | Precision | Recall | F1-score | Soporte |
|---|---|---|---|---|
| breathy | 1.00 | 0.75 | 0.86 | 4 |
| clear | 0.80 | 1.00 | 0.89 | 4 |
| Accuracy |  |  | 0.88 | 8 |
| Macro avg | 0.90 | 0.88 | 0.87 | 8 |
| Weighted avg | 0.90 | 0.88 | 0.87 | 8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de audio como SUPERB) en la informacion disponible. Las cifras anteriores proceden de una particion de evaluacion de 8 muestras, por lo que deben interpretarse como una senal preliminar y no como una estimacion fiable de rendimiento generalizable.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el encoder `microsoft/wavlm-base-plus` en fp32 ocupa en torno a 0,4 GB de memoria, y en fp16 en torno a 0,2 GB; el clasificador `joblib` es despreciable.
- GPU recomendadas: no se especifican. No es necesario GPU; cualquier CPU moderna es suficiente para inferencia puntual por ventanas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU y en dispositivos con pocos recursos.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un pipeline de scikit-learn). El despliegue natural es Python con `transformers`/`torchaudio` para extraer embeddings, `scikit-learn` + `joblib` para la cabecera, y opcionalmente una exportacion a ONNX del encoder.
- Latencia y throughput: no disponibles. Dependen del backend elegido para el encoder WavLM y del hardware; el coste dominante es la extraccion de embeddings, no la regresion logistica.

## Comparativa con modelos similares

No existe en la informacion proporcionada una comparativa oficial con otros modelos de la misma categoria. La tabla siguiente recoge unicamente datos publicos ampliamente conocidos de los modelos base relacionados; los campos marcados como no disponibles no han sido verificados en el contexto de este repositorio.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| knagode/vocal-coach | Encoder congelado + regresion logistica | No disponible (el encoder base ronda 94 M) | Ventanas de 1 segundo | No disponible | HuggingFace, descargas 0 |
| microsoft/wavlm-base-plus | Encoder autosupervisado de audio | Aproximadamente 94 M | No aplica (audio) | MIT (segun el repositorio del modelo base) | HuggingFace |
| facebook/wav2vec2-base | Encoder autosupervisado de audio | Aproximadamente 95 M | No aplica (audio) | Apache-2.0 (segun el repositorio del modelo base) | HuggingFace |
| Clasificadores acusticos ajustados de extremo a extremo | Red neuronal afinada para clasificacion de audio | Depende del modelo | No aplica (audio) | Depende del modelo | HuggingFace |

No se dispone de resultados de benchmarks comparables entre estas opciones dentro de la informacion facilitada.

## Limitaciones y advertencias

- Conjunto de entrenamiento minimo: 8 clips y 57 ventanas para la tarea `breathiness`. El riesgo de sobreajuste es alto y la evaluacion sobre 8 muestras ofrece muy poca robustez estadistica.
- Sesgos desconocidos: no se documenta la composicion demografica, el idioma, el tipo de musica ni las condiciones de grabacion del conjunto de entrenamiento, por lo que no puede evaluarse el sesgo por genero vocal, tesitura, tecnica o calidad de microfono.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente fuera de la distribucion de entrenamiento.
- Granularidad fija: la unidad de inferencia es de 1 segundo, lo que impide analisis de eventos mas cortos y anade imprecision en los limites entre segmentos aireados y claros.
- Otras tareas sin documentar: la model card menciona un fichero por tarea, pero solo se publican etiquetas y metricas de `breathiness`; se desconoce cuantas tareas hay y como se comportan.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de integrarlo en un producto.
- Sin garantias de uso clinico o diagnostico: no debe emplearse para detectar patologias vocales ni como sustituto de una valoracion logopedica.
- Madurez del repositorio: 0 descargas, 0 likes y un tamano de repositorio de 0.0 GB, lo que sugiere un proyecto reciente, sin validacion externa ni mantenimiento comprobado.
- Dependencia del encoder externo: el rendimiento depende por completo de `microsoft/wavlm-base-plus`; cualquier cambio de version o de la estrategia de pooling altera las predicciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/knagode/vocal-coach
- Perfil del autor en HuggingFace: https://huggingface.co/knagode/models
- Encoder base utilizado: https://huggingface.co/microsoft/wavlm-base-plus
- Singing Coach AI (referencia de producto del sector): https://singingcoach.ai/
- Singing Carrots, AI Singing Coach (referencia de producto del sector): https://singingcarrots.com/ai-singing-coach
- Vocal AI PRO en Devpost (referencia de producto del sector): https://devpost.com/software/vocal-ai-2-0
- VoiceCoach AI (referencia de producto del sector): https://www.voicecoach.studio/en
