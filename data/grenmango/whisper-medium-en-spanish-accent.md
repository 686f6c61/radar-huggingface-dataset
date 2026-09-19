# Grenmango/whisper-medium-en-spanish-accent

## Resumen

`Grenmango/whisper-medium-en-spanish-accent` es un ajuste fino de `openai/whisper-medium.en`, el modelo de reconocimiento automático del habla (ASR) de OpenAI de 769 millones de parametros, especializado en transcribir ingles hablado con acento espanol. Lo publica el usuario Grenmango como parte de una coleccion de variantes por acento (vietnamita, arabe, chino, hindi, coreano y espanol) construidas sobre la misma receta. El problema que aborda es concreto: los modelos Whisper en su version original degradan su tasa de error cuando el hablante es un no nativo, y este ajuste recupera buena parte de esa precision.

Tecnicamente es un encoder-decoder transformer de tipo Whisper, afinado con LoRA (rango 32, alpha 64) sobre el subconjunto en espanol del corpus L2-ARCTIC y con los adaptadores fusionados permanentemente en los pesos base. El resultado es un modelo autonomo, que se carga con `WhisperForConditionalGeneration` sin necesidad de `peft`. El autor reporta una reduccion relativa del WER del 40,8 % frente al `whisper-medium.en` sin ajustar en un conjunto de prueba de habla leida.

Su relevancia es practica y acotada: es un modelo pequeno (1,5 GB en el repositorio, FP16), desplegable en GPU de consumo e incluso en CPU, pensado para entornos donde la poblacion hispanohablante habla ingles (contact centers, soporte tecnico, educacion, reuniones internacionales). Sus limitaciones son igualmente claras: solo transcribe ingles, no traduce, y se ha entrenado con unas 4,2 horas de audio de cuatro hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); ajuste fino con LoRA fusionado en los pesos base |
| Parametros totales | 763.856.896 (~764 M; el autor indica 769 M para el modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; ventana de audio de 30 s por fragmento (`chunk_length_s=30` en el pipeline) |
| Tipos de cuantizacion | No se publican versiones cuantizadas en el repositorio; los pesos se distribuyen en safetensors FP16 |
| Idiomas soportados | Ingles unicamente (variante `.en`, no multilingue). No transcribe ni traduce a espanol |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16 fusionado), compatible con `WhisperForConditionalGeneration` |

## Arquitectura y entrenamiento

La base es la arquitectura Whisper: un transformer encoder-decoder con 24 capas en el encoder y 24 en el decoder, ancho de modelo de 1024 y 16 cabezas de atencion. La entrada acustica es un espectrograma log-Mel de 80 canales a 16 kHz mono, y la salida es texto tokenizado autoregresivamente. Este repositorio no modifica la topologia: parte de los pesos de `openai/whisper-medium.en` y les aplica un ajuste fino parametro-eficiente.

El entrenamiento usa LoRA con rango 32 y alpha 64, apuntando a las proyecciones `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`. Los datos provienen del subconjunto en espanol del corpus L2-ARCTIC: 3.955 enunciados, aproximadamente 4,2 horas de audio, de cuatro hablantes (EBVS y ERMS, masculinos; MBMPS y NJS, femeninos). Se trata de habla leida de laboratorio, no de conversacion espontanea. Tras el ajuste, los adaptadores se fusionaron de forma permanente y los pesos se publicaron en FP16, de modo que el modelo se comporta como un checkpoint Whisper estandar. No se documenta uso de RLHF ni de DPO; al ser un modelo ASR, ese tipo de alineacion no aplica.

## Capacidades

- Transcripcion automatica de voz en ingles para audio de 16 kHz mono, con resampling automatico si se usa el pipeline de transformers.
- Reconocimiento robusto de ingles hablado con acento espanol, que es precisamente la funcion para la que se ajusto.
- Procesamiento de audio largo: el pipeline admite `chunk_length_s=30` para segmentar y transcribir grabaciones de mayor duracion.
- Uso directo con `transformers` (pipeline `automatic-speech-recognition` o `WhisperProcessor` + `WhisperForConditionalGeneration`), sin dependencia de `peft`.
- Inferencia en GPU (`device="cuda"`) y en CPU (`device="cpu"`).
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio generativo ni sintesis de voz.
- No traduce a espanol ni transcribe audio en espanol: la variante `.en` esta entrenada exclusivamente para ingles.

## Casos de uso

- Contact centers con agentes hispanohablantes que atienden en ingles: el modelo transcribe las llamadas con menor WER que el Whisper base, lo que mejora la calidad de las transcripciones que alimentan sistemas de analitica, control de calidad y cumplimiento normativo.
- Generacion de subtitulos para videos de formacion o ponencias impartidas en ingles por hablantes nativos de espanol, donde un ASR generico produce mas errores en nombres, tecnicismos y fonemas distorsionados por el acento.
- Documentacion clinica dictada: un profesional hispanohablante que dicta informes en ingles obtiene una transcripcion mas fiable que con el modelo base, reduciendo la carga de correccion posterior.
- Actas y notas de reuniones de equipos internacionales, con audio segmentado en fragmentos de 30 s para cubrir reuniones completas mediante el pipeline con chunking.
- Preprocesado de datos para investigacion en ASR: sirve como etiquetador de audio con acento espanol para construir o filtrar corpus de entrenamiento de modelos mayores.
- Evaluacion de pronunciacion en ensenanza de ingles (EFL): la transcripcion permite comparar lo pronunciado con el texto de referencia y detectar desviaciones, aunque el modelo no ofrece puntuacion fonetica por si mismo.
- Investigacion sobre sesgo acentual en ASR: sirve como punto de comparacion cuantitativo frente a `whisper-medium.en` y `whisper-large-v3-turbo` en un mismo conjunto de prueba.
- Despliegue en el borde o en CPU para transcripcion offline, gracias a sus 764 M de parametros y su peso FP16 de aproximadamente 1,5 GB.

## Benchmarks y rendimiento

Evaluacion del autor sobre habla leida limpia del split `test` del subconjunto en espanol de L2-ARCTIC (WER y CER):

| Modelo | WER (split test) | CER (split test) |
|---|---|---|
| Este modelo (`whisper-medium-en-spanish-accent`) | 5,69 % | 2,49 % |
| `openai/whisper-medium.en` (zero-shot) | 9,61 % | 4,47 % |
| `openai/whisper-large-v3-turbo` (zero-shot) | 7,85 % | 3,64 % |

La reduccion relativa de WER frente a `whisper-medium.en` en cero disparo es de aproximadamente el 40,8 %. No se han publicado otros resultados de benchmarks (por ejemplo, sobre `test-clean`/`test-other` de LibriSpeech o sobre el leaderboard de ASR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP16 los pesos ocupan alrededor de 1,5 GB; con activaciones y cache de decodificacion, la inferencia completa cabe en unos 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB es suficiente; funcionan bien T4, L4, A10, RTX 3060, RTX 4060, RTX 4090, A100 y H100, en todos los casos con margen de sobra.
- GPU de consumo: si, cabe sin problemas en practicamente cualquier GPU de consumo de los ultimos anos (6 GB o mas), y tambien en iGPU con memoria unificada si se convierte a formatos mas ligeros.
- CPU: viable para transcripcion offline con `whisper.cpp` o CTranslate2 en int8, con velocidad dependiente del numero de nucleos; el autor no publica cifras de latencia.
- Opciones de despliegue: pipeline de `transformers` (GPU o CPU), `faster-whisper`/CTranslate2, `whisper.cpp` y ONNX Runtime, previa conversion, ya que el repositorio solo distribuye safetensors FP16. Tambien puede servirse mediante Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. El autor no publica mediciones de RTF (real-time factor) ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER (test L2-ARCTIC ES) | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Grenmango/whisper-medium-en-spanish-accent` | ~764 M | 30 s | 5,69 % | 2,49 % | Apache-2.0 | Hugging Face (este repositorio) |
| `openai/whisper-medium.en` | 769 M | 30 s | 9,61 % | 4,47 % | Apache-2.0 | Hugging Face |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s | 7,85 % | 3,64 % | Apache-2.0 | Hugging Face |
| `openai/whisper-small.en` | 244 M | 30 s | No disponible | No disponible | Apache-2.0 | Hugging Face |

Alternativas de la misma coleccion del autor, con la misma receta de ajuste pero distinto acento de origen: `whisper-medium-en-vi-accent` (vietnamita), `whisper-medium-en-arabic-accent` (arabe), `whisper-medium-en-chinese-accent` (chino), `whisper-medium-en-hindi-accent` (hindi), `whisper-medium-en-korean-accent` (coreano) y `whisper-medium-en-vi-hqtv-personalized` (personalizado, vietnamita). La comparacion con modelos de proposito general como `whisper-large-v3` multilingue no esta respaldada por datos en la informacion disponible.

## Limitaciones y advertencias

- Solo reconoce ingles. No transcribe audio en espanol ni traduce; si se le pasa audio en espanol, producira texto en ingles o salidas degeneradas.
- Entrenamiento muy reducido: 3.955 enunciados y 4,2 horas de cuatro hablantes. Existe riesgo real de sobreajuste a esos hablantes, a su timbre y a su estilo de lectura, con menor ganancia en hablantes o acentos distintos.
- Dominio restringido: L2-ARCTIC es habla leida de laboratorio, limpia y sin ruido. El WER en conversacion espontanea, telefonia con codecs agresivos o entornos ruidosos sera previsiblemente bastante peor que el 5,69 % reportado.
- Evaluacion potencialmente optimista: el split de test pertenece al mismo corpus y a los mismos hablantes que el entrenamiento, por lo que no equivale a una validacion fuera de dominio.
- Sesgos demograficos: el corpus contiene dos voces masculinas y dos femeninas, con distribucion geografica limitada, lo que puede introducir sesgos sistematicos en la transcripcion de otros grupos.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos de silencio, ruido o musica, y entrar en bucles de repeticion; conviene aplicar filtros de longitud, umbral de confianza y deteccion de repeticiones en produccion.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que los resultados del autor no han sido reproducidos ni auditados de forma independiente.
- Licencia: Apache-2.0, que permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la atribucion correspondiente. Al derivar de `openai/whisper-medium.en`, se mantienen las condiciones de la licencia del modelo original.
- No apto para tareas conversacionales, tool calling, agentes ni generacion de texto libre: es exclusivamente un modelo de reconocimiento del habla.
- No se distribuyen pesos en GGUF, CTranslate2 ni ONNX; cualquier despliegue con `whisper.cpp` o `faster-whisper` exige convertir el checkpoint previamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grenmango/whisper-medium-en-spanish-accent
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Corpus L2-ARCTIC: https://psi.engr.tamu.edu/l2-arctic-corpus/
- Variante vietnamita de la coleccion: https://huggingface.co/Grenmango/whisper-medium-en-vi-accent
- Variante arabe: https://huggingface.co/Grenmango/whisper-medium-en-arabic-accent
- Variante china: https://huggingface.co/Grenmango/whisper-medium-en-chinese-accent
- Variante hindi: https://huggingface.co/Grenmango/whisper-medium-en-hindi-accent
- Variante coreana: https://huggingface.co/Grenmango/whisper-medium-en-korean-accent
- Variante personalizada (HQTV, vietnamita): https://huggingface.co/Grenmango/whisper-medium-en-vi-hqtv-personalized
- Busqueda web: no se encontraron resultados relevantes sobre el modelo; las consultas devolvieron unicamente paginas informativas sobre la plataforma Twitch.
