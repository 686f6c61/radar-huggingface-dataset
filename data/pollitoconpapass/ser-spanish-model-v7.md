# pollitoconpapass/ser-spanish-model-v7

## Resumen

El modelo `pollitoconpapass/ser-spanish-model-v7` es un clasificador de emociones en voz (Speech Emotion Recognition, SER) para espanol, desarrollado por Jose A. Quispe (usuario `pollitoconpapass`). Se trata de un ajuste fino (fine-tuning) del checkpoint `facebook/wav2vec2-xls-r-300m` de Meta, un encoder de voz auto-supervisado de tipo wav2vec 2.0, sobre el que se anade una cabeza de clasificacion con seis clases de emocion: neutral, triste, disgusto, miedo, enojo y felicidad.

El modelo resuelve un problema concreto y con poca oferta en espanol: asignar una etiqueta emocional a un fragmento de audio, en lugar de transcribirlo (como haria Whisper) o de clasificar texto. Su relevancia practica es la de servir como componente barato y desplegable en local para analitica de audio en centros de contacto, investigacion en prosodia emocional y etiquetado automatico de corpus, dado su tamano moderado (315,7 millones de parametros) y su compatibilidad con la libreria `transformers`.

El modelo se distribuye con pesos en safetensors (2,5 GB de repositorio), tiene el espanol como unico idioma declarado y no publica licencia. La model card es inusualmente transparente sobre sus limitaciones: reconoce que los datos de entrenamiento son escasos y que el rendimiento es muy desigual entre clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (wav2vec 2.0) con cabeza de clasificacion de audio; modelo base `facebook/wav2vec2-xls-r-300m` |
| Parametros totales | 315.702.662 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; no aplica una ventana de contexto de tokens al ser un modelo de audio. La entrada es una senal de voz y la duracion maxima procesable no se documenta |
| Tipos de cuantizacion | No disponible. Los pesos se publican en safetensors; no se documentan versiones cuantizadas (GGUF, int8, ONNX) |
| Idiomas soportados | Espanol (`es`), con datos de entrenamiento de variedades mexicana y chilena |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Pipeline | `audio-classification` |
| Etiquetas de salida | 6 clases: neutral, triste, disgusto, miedo, enojo, felicidad |
| Metrica declarada de seleccion | F1 macro |
| Descargas / likes | 7 / 0 |
| Fecha de creacion / actualizacion | 2026-05-21 / 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec 2.0: un extractor convolucional de caracteristicas que actua sobre la forma de onda cruda, seguido de un transformer de contexto y, en este caso, una capa de clasificacion que proyecta la representacion agregada sobre las seis emociones. El backbone es el checkpoint XLS-R 300M, preentrenado de forma auto-supervisada sobre habla multilingue (el volumen exacto de horas no se detalla en la informacion disponible), lo que aporta representaciones acusticas ya entrenadas y explica que el ajuste fino funcione con un conjunto de datos relativamente pequeno.

El ajuste fino se realizo con `TrainingArguments` de Hugging Face: learning rate 3e-5, scheduler coseno, weight decay 0.01, batch efectivo de 32 (mediante acumulacion de gradientes y `per_device_eval_batch_size=8`), fp16 cuando hay CUDA disponible, semilla fija y `dataloader_drop_last=True`. Se uso un `WeightedTrainer` con pesos de clase calculados para compensar el desbalanceo del conjunto, seleccion de mejor checkpoint por F1 macro y parada temprana (`EarlyStoppingCallback`) con paciencia de 5 epocas. No se menciona RLHF, DPO ni ninguna fase de alineacion, algo esperable en un clasificador.

Los datos de entrenamiento provienen de dos conjuntos de Kaggle: `saurabhshahane/mexican-emotional-speech-database-mesd` (audio emocional mexicano) y `josequispezav/audio-emociones-chile` (audio emocional chileno). El numero total de horas o de clips no se especifica en la model card, pero el propio autor senala que los datos son limitados y recomienda ampliarlos, aplicar aumento de datos (convolucion RIR para reverberacion y SpecAugment), usar validacion cruzada k-fold y hacer analisis de errores por pares de emociones confundidas. La evaluacion se hizo sobre un conjunto de test de 136 muestras.

## Capacidades

- Clasificacion de emociones en audio de voz en espanol, con salida de probabilidad por clase (neutral, triste, disgusto, miedo, enojo, felicidad).
- Inferencia directa mediante el pipeline `audio-classification` de `transformers`, sin necesidad de transcripcion previa.
- Transferencia multilingue latente heredada de XLS-R: aunque solo declara espanol, el backbone subyacente fue preentrenado con habla de multiples idiomas.
- Ejecucion en GPU o CPU (`device=0` o `-1` en el ejemplo del autor), lo que permite desplegarlo en entornos sin acelerador.
- Integracion sencilla con frameworks de entrenamiento de Hugging Face para reajustar sobre nuevos corpus.
- Soporte de `endpoints_compatible` segun los tags del repositorio, lo que facilita su exposicion como API gestionada.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling ni razonamiento multi-paso. No dispone de modo "thinking" ni de capacidades de agente.

## Casos de uso

- Analitica de centros de contacto: procesar por lotes las grabaciones de llamadas y calcular la distribucion de emociones por agente, cola o periodo, usando el clasificador sobre fragmentos cortos de audio para detectar picos de enojo o frustracion.
- Alertas en tiempo casi real para supervision: puntuar la emocion cada pocos segundos de una llamada en curso y disparar avisos cuando la proporcion de "enojo" supera un umbral, dado que el modelo es lo bastante ligero (315M de parametros) para correr en una unica GPU de gama media.
- Etiquetado automatico de corpus: preanotar grandes archivos de audio en espanol con una etiqueta emocional para despues revisar solo las muestras de baja confianza, reduciendo el coste del etiquetado manual en proyectos de investigacion en prosodia y paralinguistica.
- Investigacion academica en SER: servir como linea base reproducible sobre XLS-R 300M para comparar tecnicas de aumento de datos, funciones de perdida ponderadas o arquitecturas alternativas en espanol, ya que el autor documenta hiperparametros y un informe de clasificacion completo.
- Indexacion y busqueda de contenido audiovisual: enriquecer podcasts, programas de radio o archivos de television con metadatos emocionales que permitan buscar o recomendar fragmentos por tono (por ejemplo, localizar los momentos mas tensos de una entrevista).
- Evaluacion de experiencia de usuario en pruebas con audio: analizar las reacciones habladas de participantes en tests de producto o estudios de usabilidad y agregar la carga emocional por tarea o prototipo.
- Prototipos de interaccion humano-computador: usar la salida emocional como senal de entrada en agentes conversacionales o entornos interactivos que adapten su respuesta al estado afectivo del usuario, siempre con la salida del modelo como heuristica y no como diagnostico.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son el informe de clasificacion sobre el conjunto de test (136 muestras) que figura en la model card del autor. No se aportan comparaciones con otros modelos ni resultados en benchmarks estandar tipo SUPERB, MMLU, HumanEval o GSM8K (los tres ultimos no aplican a un modelo de audio).

| Clase | Precision | Recall | F1 | Muestras |
|---|---|---|---|---|
| disgusto | 0,82 | 0,90 | 0,86 | 20 |
| enojo | 0,87 | 0,54 | 0,67 | 24 |
| feliz | 0,61 | 0,87 | 0,71 | 23 |
| miedo | 0,60 | 0,14 | 0,23 | 21 |
| neutral | 0,85 | 0,88 | 0,86 | 25 |
| triste | 0,63 | 0,96 | 0,76 | 23 |
| Exactitud (accuracy) | - | - | 0,72 | 136 |
| Media macro | 0,73 | 0,72 | 0,68 | 136 |
| Media ponderada | 0,73 | 0,72 | 0,69 | 136 |

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,3 GB solo para pesos, mas activaciones y buffers; en la practica cabe con comodidad en cualquier GPU con 4 GB o mas.
- VRAM estimada en fp16/bf16: aproximadamente 0,63 GB de pesos; el entrenamiento con fp16 esta contemplado en los hiperparametros del autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB, como RTX 3060, RTX 4060, RTX 4090 o similares. Para lotes grandes o entrenamiento, A100 o H100 aportan margen pero no son necesarias.
- CPU: es viable para inferencia de un unico fragmento, con latencia notablemente mayor. El ejemplo del autor contempla explicitamente `device=-1`.
- Opciones de despliegue: pipeline `audio-classification` de `transformers` (via `pipeline`), `AutoModelForAudioClassification` con PyTorch, y servidores compatibles con la API de `transformers`. No hay confirmacion en la informacion disponible de soporte en vLLM, llama.cpp u Ollama; llama.cpp y GGUF no aplican de forma estandar a wav2vec2 sin conversion adicional.
- Latencia y throughput: no disponible. No se publican mediciones de rendimiento por segundo ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pollitoconpapass/ser-spanish-model-v7` | 315,7 M | Audio de voz; duracion maxima no documentada | Clasificacion de emociones en espanol (6 clases) | No disponible | Hugging Face, `transformers` |
| `facebook/wav2vec2-xls-r-300m` | ~300 M | Audio de voz; ventana no documentada aqui | Representaciones de voz auto-supervisadas (modelo base, sin cabeza de clasificacion) | No disponible en la informacion proporcionada | Hugging Face |
| `facebook/wav2vec2-xls-r-1b` | ~1 B | Audio de voz | Representaciones de voz auto-supervisadas (modelo base) | No disponible en la informacion proporcionada | Hugging Face; recomendado por el autor como alternativa de mayor capacidad |
| `pollitoconpapass/superb-ser-finetuned-spanish-v3.5` | 94,6 M | Audio de voz | Clasificacion de emociones (SUPERB-SER en espanol), mismo autor | No disponible | Hugging Face |
| `openai/whisper` + clasificador externo | Segun variante (tiny a large) | Audio de voz, ventanas de 30 s en la variante estandar | Transcripcion, con clasificacion de emocion anadida en cascada | Segun variante | Hugging Face; planteado por el autor como enfoque alternativo |

No se dispone de resultados comparativos de rendimiento entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, tarea y disponibilidad.

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: la clase "miedo" obtiene un F1 de 0,23 (recall 0,14) y "enojo" un F1 de 0,67 con recall 0,54, por lo que el modelo pierde sistematicamente estas emociones.
- Sesgo hacia "triste": con recall 0,96 y precision 0,63, el modelo sobrepredice la tristeza a costa de falsos positivos. Conviene revisar los umbrales por clase antes de usarlo en produccion.
- Conjunto de evaluacion muy pequeno (136 muestras, entre 20 y 25 por clase), lo que hace que las metricas tengan intervalos de confianza amplios y que las diferencias entre versiones puedan ser ruido.
- Cobertura dialectal limitada: el entrenamiento usa exclusivamente audio de Mexico y Chile. El comportamiento en otras variedades del espanol (peninsular, rioplatense, caribeno, andino) no esta documentado ni evaluado.
- Licencia no disponible: no hay autorizacion explicita de uso comercial. Cualquier despliegue en producto requiere contactar con el autor o asumir el riesgo legal.
- Sin datos sobre el volumen de entrenamiento, la duracion de los clips ni la distribucion de hablantes, lo que dificulta estimar generalizacion a voces nuevas, ruido de fondo o canales telefonicos.
- Riesgo de sobreajuste al dominio y al canal de grabacion de los dos conjuntos de Kaggle (probablemente audio actuado o de laboratorio), con degradacion esperada en audio real de call center o campo.
- Riesgo de alucinacion en el sentido clasico no aplica, pero si existe el riesgo de asignar una emocion con alta confianza a un audio neutro o no inteligible; el modelo siempre devuelve una de las seis clases, sin opcion de "desconocido".
- No debe usarse para diagnostico clinico ni para inferir el estado mental de una persona: es un clasificador de patrones acusticos con rendimiento macro F1 de 0,68 en su propio test.
- Adopcion practicamente nula (7 descargas, 0 likes), sin validacion independiente por parte de la comunidad.
- El autor recomienda explicitamente mas datos, aumento de datos, validacion cruzada y analisis de errores, lo que indica que la propia version 7 se considera un punto de partida, no un modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pollitoconpapass/ser-spanish-model-v7
- Perfil del autor en Hugging Face: https://huggingface.co/pollitoconpapass/models
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Modelo alternativo de mayor tamano citado por el autor: https://huggingface.co/facebook/wav2vec2-xls-r-1b
- Dataset mexicano (Kaggle): https://www.kaggle.com/datasets/saurabhshahane/mexican-emotional-speech-database-mesd
- Dataset chileno (Kaggle): https://www.kaggle.com/datasets/josequispezav/audio-emociones-chile
- Perfil del autor en GitHub: https://github.com/pollitoconpapass
- Repositorio `whisperai-finetune` del autor: https://github.com/pollitoconpapass/whisperai-finetune
- Paper de wav2vec 2.0: no disponible en los resultados de busqueda
- Paper de XLS-R: no disponible en los resultados de busqueda
- Demo o Space asociado: no disponible
