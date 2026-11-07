# oluwagbotty/whisper-small-ug-en-ft-10ep-s2

## Resumen

`whisper-small-ug-en-ft-10ep-s2` es un ajuste fino del modelo `cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0`, que a su vez deriva de la arquitectura Whisper Small de OpenAI. Lo desarrolla el usuario de Hugging Face `oluwagbotty` en el marco de un proyecto de investigación del Centre for Digital Language Inclusion (UCL) sobre reconocimiento de voz de bajo coste para personas con tartamudez, dentro del Rwanda Innovation Sprint financiado por UK International Development (AT2030) y Google.org. El modelo resuelve la transcripción de inglés hablado por personas que tartamudean, un dominio habitualmente mal cubierto por los sistemas ASR comerciales.

Se trata de un transformer encoder-decoder de tipo Whisper con 241.734.912 parámetros totales, entrenado sobre la partición de entrenamiento del dataset `cdli/rwandan_english_nonstandard_speech_v1.0`, cuyas grabaciones provienen mayoritariamente de adultos jóvenes que tartamudean en Ruanda. El ajuste se realizó durante hasta 10 épocas con parada temprana sobre el WER de validación.

Su relevancia radica en que aborda un caso de uso de inclusión lingüística y accesibilidad con un modelo de tamano reducido (categoría "small"), lo que permite despliegue en hardware modesto. No obstante, la muestra de evaluación es muy pequena (9 hablantes en test), la licencia no está confirmada y el modelo está explicitamente vetado para usos clínicos, legales o de identificación de hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | other (sin licencia confirmada por CDLI; hereda los terminos del modelo de partida) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper Small de OpenAI: un transformer encoder-decoder con atención completa, disenado para transcripción de audio en ventanas de 30 segundos y 241,7 millones de parámetros. Parte del checkpoint `cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0`, ya ajustado a inglés ugandés no estándar, y se reajusta sobre la partición de entrenamiento del dataset de inglés ruandés no estándar.

El entrenamiento usó únicamente el split de train, con el split de dev para seleccionar el checkpoint y el split de test evaluado una sola vez tras el entrenamiento; el split `extra` no se utilizó y ningún hablante aparece en más de un split. Se configuraron hasta 10 épocas con parada temprana sobre el WER de dev (paciencia de 3 evaluaciones), semilla 2, learning rate 1e-5 y batch de 16. El código de entrenamiento está en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (experimento `whisper-small-ug-en-ft-10ep-s2`). No se documenta en la información disponible el uso de RLHF, DPO ni innovaciones de decodificación más allá de la decodificación greedy empleada en la evaluación.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés, con foco en habla no estándar y tartamudez.
- Transcripción de habla leída (frases leídas a partir de prompts de texto) y de descripciones libres a partir de imágenes (prompts pictóricos).
- Manejo de repeticiones de tartamudeo en la salida, dado que los targets de entrenamiento incluyen las repeticiones escritas de forma literal.
- Decodificación greedy como modo de inferencia evaluado (una grabación cada vez).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del propio ASR ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la metadata del modelo (etiqueta `en`).

## Casos de uso

- Transcripción asistida para personas que tartamudean: el modelo genera texto a partir de grabaciones de habla con repeticiones, y el texto se muestra al hablante antes de actuar sobre él, tal como recomienda la model card.
- Investigación en accesibilidad del habla: sirve como línea base reproducible para comparar técnicas de ajuste fino en habla no estándar, con métricas WER y CER publicadas sobre dev y test.
- Aplicaciones de dictado en entornos silenciosos: adecuado para grabaciones indoor de baja contaminación acústica realizadas con tableta, que es la condición de los datos de entrenamiento.
- Prototipos de bajo coste en despliegue local: al tener 241,7 M de parámetros, puede ejecutarse en hardware modesto para pruebas de concepto en contextos con recursos limitados.
- Evaluación de modelos ASR en inglés africano no estándar: útil para estudiar el comportamiento de Whisper Small ante acentos y patrones de habla poco representados en los corpus habituales.
- Análisis de fallos de decodificación (bucles): la model card reporta el fenómeno de salidas repetitivas (1 bucle en test, 0 en dev), lo que permite estudiar y mitigar este modo de fallo en ASR basado en Whisper.

## Benchmarks y rendimiento

Resultados reportados por el autor con decodificación greedy, una grabación cada vez y el normalizador de texto básico de Whisper. El WER agrupado cuenta todas las palabras juntas; el WER y CER por enunciado son medias sobre grabaciones (cada una limitada al 100 %).

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 24,5 | 16,3 | 25,3 | 17,2 | 1 |
| dev (6 hablantes) | 31,8 | 22,6 | 29,9 | 21,1 | 0 |

El autor advierte que, con solo 9 hablantes en test, no pueden confirmarse diferencias inferiores a unos 3 puntos de WER entre dos modelos. No se han publicado en la información disponible comparaciones numéricas con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 241,7 M de parámetros, en precisión FP32 el peso ocupa aproximadamente 1 GB, y en FP16 alrededor de 0,5 GB, más overhead de activaciones y del encoder de audio.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores, y con GPUs de datacenter (A100, H100) para procesamiento por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM libre en FP16, aunque el dato exacto no está confirmado en la información disponible.
- Opciones de despliegue: transformers (librería declarada); el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| oluwagbotty/whisper-small-ug-en-ft-10ep-s2 | 241,7 M | no disponible | en | other (sin confirmar) | Ajustado a inglés ruandés con tartamudez; WER test 24,5 % agrupado |
| openai/whisper-small | ~244 M (0,2 B según la model card) | no disponible | multilingüe | no disponible en la busqueda | Modelo base de la familia; sin ajuste a habla no estándar |
| openai/whisper-small.en | ~244 M (0,2 B según la model card) | no disponible | en | no disponible en la busqueda | Variante solo inglesa; sin ajuste a habla no estándar |
| cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0 | no disponible | no disponible | en | no disponible | Modelo de partida, ajustado a inglés ugandés no estándar |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, mayoritariamente hombres adultos jóvenes, grabaciones indoor silenciosas, habla leída y descrita a partir de imágenes, no conversacional. El rendimiento en ninos, otras discapacidades, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Targets literales: las repeticiones de tartamudeo están escritas en las transcripciones, y los modelos entrenados con ellas pueden escribirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia prompts de texto: las frases leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con prompts pictóricos son la mejor guía para habla abierta.
- No apto para decisiones sobre personas: prohibido para diagnosticar o evaluar condiciones del habla, identificar hablantes o tomar decisiones clínicas, legales o de aplicación de la ley. Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de alucinación y bucles: se documenta el modo de fallo de repetición de Whisper (1 bucle en test); una transcripción errónea puede cambiar el significado de lo dicho, por lo que debe mostrarse el texto al hablante antes de actuar sobre él.
- Licencia sin confirmar: la model card del modelo de partida no declara licencia y CDLI no la ha confirmado; debe verificarse con CDLI antes de cualquier reutilización.
- Datos no redistribuibles: el dataset está sujeto a acceso restringido (gated) y no se incluye en el repositorio.
- Muestra de evaluación insuficiente: con 9 hablantes en test, diferencias inferiores a unos 3 puntos de WER no pueden confirmarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/whisper-small-ug-en-ft-10ep-s2
- Modelo base: https://huggingface.co/cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Whisper Small de OpenAI: https://huggingface.co/openai/whisper-small
- Whisper Small (solo inglés) de OpenAI: https://huggingface.co/openai/whisper-small.en
