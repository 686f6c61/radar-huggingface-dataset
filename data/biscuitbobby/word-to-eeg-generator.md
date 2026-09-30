# BiscuitBobby/word-to-eeg-generator

## Resumen

`word-to-eeg-generator` es un generador de senales EEG sinteticas de 63 canales a partir de texto, publicado por el usuario BiscuitBobby en Hugging Face. No es un modelo generativo profundo: se trata de un conjunto de regresiones ridge que proyectan vectores de texto de CLIP ViT-B/32 al espacio de senales EEG de los 10 sujetos del dataset THINGS-EEG (`Haitao999/things-eeg`, preprocesado a 250 Hz y blanqueado). Sobre esa proyeccion se anaden modelos de ruido calibrados con las sesiones reales de entrenamiento y de test.

El modelo acepta tres modalidades de entrada: una palabra suelta (por ejemplo `dog`), una descripcion de escena de una sola frase (idealmente de 15 a 23 palabras) o la combinacion de ambas. La salida es un array `float32` de forma `(n, 63, 80)`: n muestras, 63 canales del sistema 10-10 y 80 puntos temporales a 250 Hz, en unidades blanqueadas del dataset (no en microvoltios). El repositorio ocupa 0,2 GB y contiene tres ficheros `.npz` con las matrices ajustadas mas un script de inferencia (`wte.py`, 8 KB) que solo requiere `numpy` y `sentence-transformers`.

Su relevancia es metodologica: permite generar EEG sintetico controlado y reproducible (con semilla y niveles de ruido seleccionables) para aumentacion de datos, validacion de pipelines de decodificacion y planificacion de experimentos, sin necesidad de GPU ni de acceso a los sujetos originales. El modelo es de acceso privado, acumula 0 descargas y 0 likes, y no cuenta con validacion externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion ridge (no es una red neuronal generativa); encoder de texto CLIP ViT-B/32 + matrices lineales hacia EEG |
| Parametros totales | no disponible (no aplica en el sentido convencional; matrices en `.npz` de 104 MB, 122 MB y 14 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; la entrada es una palabra o una frase de 15-23 palabras recomendadas |
| Tipos de cuantizacion | no aplica; se distribuye en `.npz` (NumPy) sin cuantizaciones publicadas |
| Idiomas soportados | no disponible (los prompts de CLIP ViT-B/32 y los ejemplos de la model card estan en ingles) |
| Licencia | other (`things-eeg-derived`) |
| Formato de pesos | `.npz` (NumPy) + codigo Python (`wte.py`) |
| Canales de salida | 63 (sistema 10-10, de Fp1 a O2) |
| Frecuencia de muestreo de salida | 250 Hz, 80 puntos temporales (muestras 18-97 de la epoca de 250 muestras) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura es una regresion ridge que mapea vectores de texto de CLIP ViT-B/32 (promedio de 4 prompts del tipo "a photo of a {word}.") hacia las respuestas EEG de los 10 sujetos de THINGS-EEG en la configuracion `Preprocessed_data_250Hz_whiten`. Hay tres artefactos de pesos: `model.npz` (104 MB) con las medias palabra-EEG agrupadas y por sujeto mas el ruido de sesion de entrenamiento; `model_test.npz` (122 MB) con un adaptador de ruido de sesion de test modelado como mezcla de 4 sesiones; y `photo_model.npz` (14 MB) con las medias descripcion-EEG y palabra+descripcion-EEG. No hay entrenamiento con RLHF ni DPO, ni decodificacion especulativa ni atencion lineal: no es un transformer generativo.

La innovacion principal no esta en la arquitectura, sino en la capa de ruido: el modelo permite cinco niveles de realismo (`mean` sin ruido, `erp` con ruido de respuesta promediada de la sesion de entrenamiento, `trial` con ruido de ensayo unico de entrenamiento, `erp_test` con ruido de promedio de 40 repeticiones de la sesion de test, y `trial_test` con ruido de ensayo unico de test). Con `description` como unica entrada, el parametro `subject` solo controla el ruido, porque el offset medio del sujeto esta ajustado sobre vectores de palabra y requiere un `word`. La reproducibilidad se garantiza mediante `seed`.

## Capacidades

- Generacion de EEG sintetico de 63 canales y 80 puntos temporales a partir de una palabra, una descripcion de escena o ambas.
- Seleccion del estilo por sujeto (`sub-01` a `sub-10`) o promedio de los 10 sujetos (`subject=None`).
- Cinco niveles de ruido configurables, desde la salida sin ruido (`mean`, maxima informacion de palabra/escena) hasta ensayos unicos realistas de la sesion de test (`trial_test`).
- Generacion por lotes con control de semilla (`n`, `seed`) para obtener multiples ensayos reproducibles.
- Salida en formato NumPy directamente guardable (`np.save`) e integrable en pipelines de analisis en Python.
- Ejecucion en CPU; no requiere GPU ni frameworks de deep learning para la inferencia.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas; el encoder CLIP ViT-B/32 esta orientado a ingles.
- No tiene vision, audio ni modo de pensamiento; el unico uso de CLIP es su torre de texto.

## Casos de uso

- Aumentacion de datos para decodificadores EEG: generar ensayos sinteticos etiquetados por objeto o escena permite ampliar el conjunto de entrenamiento de clasificadores y medir si mejoran frente al sobreajuste con pocos ensayos reales.
- Validacion de pipelines de analisis EEG: al disponer de una senal de referencia con semilla fija y nivel de ruido controlado, se puede comprobar que el preprocesado, filtrado y extraccion de caracteristicas funciona antes de aplicar el pipeline a datos humanos.
- Publicacion de datasets sinteticos abiertos: al no contener senales reales de participantes, la salida en nivel `mean` o `trial` puede compartirse sin las restricciones de privacidad asociadas a datos biometricos.
- Planificacion de experimentos y analisis de potencia: generar respuestas simuladas con ruido realista permite estimar cuantas repeticiones o sujetos se necesitan para detectar un efecto concreto.
- Estudio de la relacion semantica-EEG: comparar las predicciones de `word`, `description` y `word+description` ayuda a cuantificar cuanta informacion semantica aporta la descripcion frente a la etiqueta aislada.
- Benchmarking de modelos EEG-to-text y EEG-to-image: la senal sintetica actua como linea base controlada para medir la sensibilidad de otros sistemas a distintos niveles de ruido y estilos de sujeto.
- Docencia en neurociencia computacional: el modelo se ejecuta en CPU y en pocos segundos, lo que permite ilustrar el mapeo entre representaciones semanticas y respuestas cerebrales sin infraestructura especializada.
- Test de robustez de clasificadores: inyectar los distintos niveles de ruido (`erp_test`, `trial_test`) permite evaluar como degrada el rendimiento un clasificador al pasar de respuestas promediadas a ensayos unicos.

## Benchmarks y rendimiento

La model card reporta una tarea de identificacion sobre los 200 objetos de test de THINGS-EEG, ninguno visto en entrenamiento. Para cada objeto de test, la salida sin ruido del generador se correlaciona con el EEG real de los 200 objetos y se cuenta un acierto si su propio objeto queda en primer lugar. El azar es 0,5% en top-1 y 2,5% en top-5. La metrica "2-way" mide con que frecuencia la salida de un objeto correlaciona mejor con su propio EEG que con el de otro objeto, promediado sobre todos los pares (azar 50%).

| Entrada | Objetivo | Top-1 | Top-5 | 2-way |
|---|---|---|---|---|
| Descripcion sola, detallada (~19 palabras) | Promedio de 10 sujetos | 15,0% | 34,0% | 88,3% |
| Palabra + descripcion, detallada (~19 palabras) | Promedio de 10 sujetos | 13,0% | 33,5% | 87,6% |
| Palabra + caption original del dataset (~8 palabras) | Promedio de 10 sujetos | 10,0% | 31,0% | 87,1% |
| Solo palabra | Promedio de 10 sujetos | 9,5% | 28,5% | 83,9% |
| Solo caption original del dataset (~8 palabras) | Promedio de 10 sujetos | 8,5% | 31,5% | 87,3% |
| Palabra + descripcion, `subject` fijado | Promedio de ese sujeto | 7,0% (rango 3,5-9,5%) | no disponible | no disponible |
| Solo palabra, `subject` fijado | Promedio de ese sujeto | 6,0% (rango 3,5-8,5%) | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU suficiente, segun la propia model card ("A CPU is enough"); no se requiere GPU.
- Descarga inicial de unos 240 MB (codigo y modelos) mas unos 600 MB del encoder de texto CLIP, cacheados tras la primera ejecucion.
- RAM estimada: no disponible de forma explicita; el uso conjunto de CLIP ViT-B/32 y las matrices `.npz` sugiere un consumo moderado, del orden de pocos GB, pero no hay cifra publicada.
- VRAM: no aplica; no hay ruta de inferencia en GPU documentada.
- GPU recomendadas: no aplica. El modelo cabe en cualquier maquina que ejecute Python 3.9+ con `numpy` y `sentence-transformers`.
- Opciones de despliegue: script Python (`wte.py`) o linea de comandos (`python wte.py dog -d "..." -s sub-03 -l trial_test -n 5 --seed 0 -o dog.npy`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje con pesos transformers.
- Latencia y throughput: no disponibles. La segunda ejecucion y posteriores evitan la descarga del encoder, pero no se documentan tiempos medidos.
- Almacenamiento: alrededor de 0,2 GB para el repositorio mas la cache del encoder CLIP.
- Requisito de acceso: el repositorio es privado, por lo que hace falta `hf auth login` o definir `HF_TOKEN` una vez por maquina.

## Comparativa con modelos similares

No se dispone de resultados comparables publicados bajo la misma tarea y metrica para modelos de generacion de EEG desde texto, por lo que la comparacion cuantitativa directa no esta disponible. La siguiente tabla resume diferencias cualitativas con trabajos relacionados del ambito EEG-texto.

| Modelo | Enfoque | Entrada | Salida | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| word-to-eeg-generator (BiscuitBobby) | Regresion ridge sobre CLIP ViT-B/32 | Palabra, descripcion o ambas | EEG de 63 canales | no disponible (matrices ridge) | `things-eeg-derived` | Privado en Hugging Face |
| EEG-To-Text (MikeWangWZHL) | Seq2seq con BART sobre EEG | EEG | Texto | no disponible | no disponible | Publico en GitHub |
| EEG-To-Text / DeWave (NeuSpeech) | Aprendizaje contrastivo con curriculum y cuantizacion discreta | EEG | Texto | no disponible | no disponible | Publico en GitHub |
| Concept2Brain | Prediccion de respuestas neurofisiologicas a conceptos o imagenes | Concepto o imagen | Respuesta cerebral | no disponible | no disponible | Servicio web (Nature Communications) |

## Limitaciones y advertencias

- Precision absoluta baja: el mejor resultado es 15,0% top-1 frente a un azar del 0,5%; la mayoria de identificaciones siguen siendo incorrectas, aunque la metrica 2-way (88,3%) indique senal informativa.
- La salida no es la lectura del EEG de una persona concreta en un momento concreto; es una prediccion media con ruido simulado y no debe presentarse como decodificacion en tiempo real.
- El modelo solo cubre los 10 sujetos de THINGS-EEG; no generaliza a sujetos nuevos fuera de ese conjunto.
- Los valores de salida estan en unidades blanqueadas del dataset, no en microvoltios, lo que limita la comparacion directa con registros clinicos o de laboratorio.
- El eje temporal absoluto no esta verificado: la model card advierte que el campo `times` del dataset tiene 300 entradas para 250 muestras.
- Con `description` como unica entrada, `subject` solo ajusta el ruido; el offset medio del sujeto no se aplica porque esta ajustado sobre vectores de palabra. Hay que aportar `word` para obtener el estilo completo del sujeto.
- Las descripciones cortas o telegráficas pierden precision de forma medible; se recomiendan frases de 15 a 23 palabras con color, pose y entorno.
- El encoder CLIP ViT-B/32 esta orientado al ingles; no hay soporte multilingue declarado y las entradas en otros idiomas pueden degradar el resultado.
- Riesgo de sobreinterpretacion neurocientifica: correlaciones de identificacion moderadas no implican que el modelo reproduzca mecanismos cerebrales reales.
- Licencia `other` con nombre `things-eeg-derived`: al derivar de THINGS-EEG, es preceptivo revisar las condiciones del dataset original antes de cualquier uso comercial; la model card no concede explicitamente derechos de uso comercial.
- El repositorio es privado, requiere autenticacion y acumula 0 descargas y 0 likes, sin validacion independiente ni resultados replicados por terceros.
- No es un modelo de lenguaje: no soporta generacion de texto, razonamiento, tool calling ni agentes, por lo que no debe integrarse en pipelines de ese tipo.

## Enlaces

- Hugging Face: https://huggingface.co/BiscuitBobby/word-to-eeg-generator
- Dataset THINGS-EEG en Hugging Face: https://huggingface.co/datasets/Haitao999/things-eeg
- Dataset en Kaggle (privado): `lemondobby/word-to-eeg-generator`
- Repositorio EEG-To-Text (NeuSpeech): https://github.com/NeuSpeech/EEG-To-Text
- Repositorio EEG-To-Text (MikeWangWZHL): https://github.com/MikeWangWZHL/EEG-To-Text
- Paper Open Vocabulary EEG-To-Text Decoding (AAAI 2022): https://arxiv.org/abs/2112.02690
- Survey sobre EEG y IA generativa: https://arxiv.org/html/2502.12048v4
- Concept2Brain (Nature Communications): https://www.nature.com/articles/s41467-026-75653-x
