# Grenmango/whisper-medium-en-vi-accent

## Resumen

`Grenmango/whisper-medium-en-vi-accent` es un modelo de reconocimiento automatico del habla (ASR) derivado de `openai/whisper-medium.en`, ajustado especificamente para transcribir ingles hablado con acento vietnamita. Lo publica el usuario Grenmango como parte de una coleccion de ajustes por acento (arabe, chino, hindi, coreano y espanol, ademas de una variante personalizada para el hablante HQTV). El problema que aborda es concreto: los modelos Whisper en su version `.en` pierden precision cuando el hablante no es nativo, y este ajuste reduce la tasa de error de palabras (WER) en ese escenario.

El ajuste se realizo con LoRA (r=32, alpha=64) sobre las proyecciones de atencion y las capas feed-forward, y los adaptadores se fusionaron permanentemente en los pesos base, de modo que el resultado es un modelo autonomo que se carga con `transformers` sin necesidad de `peft`. El entrenamiento uso el subconjunto vietnamita del corpus L2-ARCTIC: 4.072 enunciados (unas 4,3 horas) de cuatro hablantes. Los pesos se publican en FP16, con 763.856.896 parametros reales segun los safetensors del repositorio (la model card cita 769M, la cifra habitual de Whisper Medium).

Su relevancia es practica y acotada: en habla leida limpia, el modelo baja el WER del 18,85 % (zero-shot de `whisper-medium.en`) al 11,42 %, superando tambien al zero-shot de `whisper-large-v3-turbo` (15,99 %) con un modelo casi tres veces mas pequeno en terminos de coste de inferencia. Es, por tanto, un ejemplo de ajuste ligero y barato que bate a un modelo mayor cuando el dominio esta bien delimitado. Ahora bien, el repositorio no registra descargas ni valoraciones, y no hay validacion independiente de las cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) |
| Parametros totales | 763.856.896 (segun safetensors); la model card indica 769M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (`chunk_length_s=30`); entrada de 80 canales log-Mel a 16 kHz mono |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos FP16 fusionados) |
| Idiomas soportados | Ingles (`en`); especializado en ingles con acento vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16), compatible con `WhisperForConditionalGeneration` |
| Modelo base | `openai/whisper-medium.en` |
| Tamano del repositorio | 1,5 GB |
| Pipeline | `automatic-speech-recognition` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Medium: un transformer encoder-decoder que procesa espectrogramas log-Mel de 80 canales a 16 kHz y genera texto de forma autorregresiva, trabajando sobre ventanas de 30 segundos (la propia model card recomienda `chunk_length_s=30` en el pipeline). La unica modificacion respecto al modelo base es el ajuste fino de los pesos, no hay cambios estructurales ni capas adicionales en inferencia.

El entrenamiento se hizo con Parameter-Efficient Fine-Tuning mediante LoRA de rango 32 y alpha 64, aplicado a `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`. Los adaptadores se fusionaron despues en los pesos del modelo base y el resultado se serializo en FP16. El conjunto de datos es el subconjunto vietnamita del corpus L2-ARCTIC, con 4.072 enunciados de habla leida (aproximadamente 4,3 horas) y cuatro hablantes: HQTV (masculino), PNV (femenino), THV (femenino) y TLV (masculino). No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en ingles (`automatic-speech-recognition`), con entrada de audio mono a 16 kHz y remuestreo automatico en el pipeline.
- Mayor robustez que el modelo base ante pronunciacion, ritmo y prosodia de hablantes nativos de vietnamita que hablan ingles.
- Procesamiento por fragmentos de 30 segundos, lo que permite transcribir audios de duracion arbitraria encadenando ventanas.
- Compatibilidad directa con `transformers` (`WhisperProcessor` y `WhisperForConditionalGeneration`), sin dependencia de `peft`.
- No soporta tool calling ni function calling: es un modelo puramente acustico-textual.
- No dispone de modo de razonamiento, vision, audio generativo ni capacidades de agente.
- No es multilingue en salida: al derivar de la variante `.en`, solo produce transcripciones en ingles, aunque la entrada contenga palabras en vietnamita.

## Casos de uso

- Transcripcion de reuniones y entrevistas con equipos vietnamitas: el modelo reduce el WER en habla acentuada alli donde `whisper-medium.en` falla, y mantiene un coste de inferencia bajo (menos de 1 GB de pesos en FP16).
- Subtitulado de contenido audiovisual para audiencias de habla inglesa no nativa: se integra en un pipeline de `transformers` con `chunk_length_s=30` y genera texto plano listo para alinear con marcas de tiempo externas.
- Preprocesado de datasets de voz para entrenamiento de otros modelos: al mejorar el WER sobre acento vietnamita, sirve para generar pseudo-etiquetas de mayor calidad a partir de grabaciones ya transcritas manualmente.
- Anotacion asistida de corpus acentuados en investigacion en fonetica o en adquisicion de segundas lenguas: el modelo acelera la transcripcion preliminar que despues revisa un anotador humano.
- Servicios de atencion al cliente con plantillas de voz en ingles hablado por agentes vietnamitas: permite indexar y buscar en grabaciones historicas de llamadas sin depender de un modelo grande.
- Despliegue en hardware modesto para aplicaciones embebidas o on-premise: con pesos FP16 de aproximadamente 1,5 GB cabe en GPU de consumo y en CPU con latencia asumible en modo no interactivo.
- Fine-tuning posterior sobre un hablante concreto: la coleccion del autor incluye una variante personalizada (`whisper-medium-en-vi-hqtv-personalized`), lo que demuestra que el flujo de ajuste se puede repetir con pocas horas de audio.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre habla leida limpia y con particion de test reservada (`test` split de L2-ARCTIC, subconjunto vietnamita), en porcentaje (menor es mejor):

| Modelo | WER (test) | CER (test) |
|---|---|---|
| `whisper-medium-en-vi-accent` (este modelo) | 11,42 % | 6,05 % |
| `openai/whisper-medium.en` (zero-shot) | 18,85 % | 9,97 % |
| `openai/whisper-large-v3-turbo` (zero-shot) | 15,99 % | 8,16 % |

El autor declara una reduccion relativa del WER de aproximadamente el 39,4 % frente al zero-shot de `whisper-medium.en`. Estas cifras son autodeclaradas y no consta evaluacion independiente en la informacion disponible. No hay datos de rendimiento en audio con ruido, habla espontanea, solapamiento de hablantes ni `code-switching` con vietnamita.

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 1,5-2 GB solo para pesos, mas activaciones; en la practica 2-3 GB son suficientes para inferencia por lotes pequenos (estimacion a partir del numero de parametros).
- VRAM estimada en INT8: aproximadamente 0,8-1 GB de pesos (estimacion; el repositorio no publica checkpoints cuantizados).
- GPU recomendadas: cualquier GPU con 4 GB o mas, como RTX 3050, RTX 3060, RTX 4060, T4 o superiores. Los pesos FP16 caben tambien en GPUs de 4 GB con margen justo.
- Si cabe en GPU de consumo: si, es uno de los puntos fuertes del modelo; en CPU es viable para transcripcion por lotes sin requisito de tiempo real.
- Opciones de despliegue: `transformers` con `pipeline` (soporte oficial y directo); `vLLM` para servir Whisper encoder-decoder (requiere verificacion de compatibilidad con esta revision concreta); `faster-whisper`/CTranslate2 y `whisper.cpp`/GGUF requeririan conversion previa, ya que el repositorio solo distribuye safetensors en FP16.
- Latencia y throughput: no disponibles. No se publican mediciones de RTF (real-time factor), latencia por fragmento ni rendimiento en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER en el test vietnamita | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Grenmango/whisper-medium-en-vi-accent` | 763,8 M | Ventanas de 30 s | 11,42 % | Apache 2.0 | HuggingFace, safetensors, 0 descargas |
| `openai/whisper-medium.en` | 769 M (763,8 M efectivos) | Ventanas de 30 s | 18,85 % (zero-shot) | Apache 2.0 | HuggingFace, ampliamente usado |
| `openai/whisper-large-v3-turbo` | No disponible en la informacion proporcionada | Ventanas de 30 s | 15,99 % (zero-shot) | Apache 2.0 | HuggingFace, ampliamente usado |
| Otras variantes de la coleccion del autor (arabe, chino, hindi, coreano, espanol) | Arquitectura equivalente | Ventanas de 30 s | No disponible | Apache 2.0 | HuggingFace, sin descargas registradas |

La comparacion relevante es que un ajuste LoRA sobre un modelo de 764 M supera en este dominio concreto a un zero-shot de mayor tamano, aunque la ventaja solo esta demostrada en habla leida limpia de cuatro hablantes.

## Limitaciones y advertencias

- Los datos de entrenamiento son muy reducidos: 4.072 enunciados y unas 4,3 horas de audio procedentes de solo cuatro hablantes, lo que implica un riesgo alto de sobreajuste al timbre, al estilo de lectura y a las caracteristicas concretas de esos cuatro locutores.
- La evaluacion se limita a habla leida y limpia de la particion de test del mismo corpus; no hay evidencia de comportamiento en audio con ruido, reverberacion, habla espontanea, conversaciones solapadas o audio telefonico de banda estrecha.
- El WER del 11,42 % sigue siendo elevado para usos donde se exija transcripcion de calidad de publicacion sin revision humana.
- Al derivar de `whisper-medium.en`, el modelo solo genera ingles: palabras, nombres propios o expresiones en vietnamita se transcribiran de forma aproximada o incorrecta.
- Whisper es propenso a alucinar texto en segmentos silenciosos, con ruido o con musica; este ajuste no corrige ese comportamiento, que es herencia del modelo base.
- Las cifras de benchmarks estan autodeclaradas por el autor y no han sido replicadas por terceros; el repositorio tiene 0 descargas y 0 valoraciones, por lo que no existe validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Hay que verificar ademas los terminos aplicables a las tildes de datos del corpus L2-ARCTIC si se redistribuye el modelo entrenado con el.
- No se documentan sesgos de rendimiento por genero, edad o variedad dialectal dentro del ingles, ni se publica desglose por hablante.
- El ajuste cubre un unico acento (vietnamita); no mejora la transcripcion de otros acentos no nativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Grenmango/whisper-medium-en-vi-accent
- Modelo base: https://huggingface.co/openai/whisper-medium.en
- Corpus L2-ARCTIC: https://psi.engr.tamu.edu/l2-arctic-corpus/
- Variante con acento arabe: https://huggingface.co/Grenmango/whisper-medium-en-arabic-accent
- Variante con acento chino: https://huggingface.co/Grenmango/whisper-medium-en-chinese-accent
- Variante con acento hindi: https://huggingface.co/Grenmango/whisper-medium-en-hindi-accent
- Variante con acento coreano: https://huggingface.co/Grenmango/whisper-medium-en-korean-accent
- Variante con acento espanol: https://huggingface.co/Grenmango/whisper-medium-en-spanish-accent
- Variante personalizada para el hablante HQTV: https://huggingface.co/Grenmango/whisper-medium-en-vi-hqtv-personalized
