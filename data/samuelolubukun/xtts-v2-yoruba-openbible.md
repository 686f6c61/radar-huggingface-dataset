# samuelolubukun/xtts-v2-yoruba-openbible

## Resumen

xtts-v2-yoruba-openbible es un ajuste fino del modelo Coqui XTTS-v2 especializado en síntesis de voz en yoruba (`yo`), desarrollado por el ingeniero Samuel Olubukun. El problema que aborda es la escasez de sistemas TTS neuronales de calidad para lenguas africanas de bajos recursos, en un contexto en el que la mayoría de los modelos multilingües cubren el yoruba de forma marginal o inexistente. El modelo parte de la arquitectura autorregresiva de XTTS-v2 y añade un token de idioma `[yo]` junto a un vocabulario BPE ampliado en 2.000 tokens.

El modelo conserva la capacidad de clonación de voz zero-shot de la base: a partir de un clip de referencia de 3 a 10 segundos reproduce el timbre del hablante y transfiere esa voz a texto nuevo en yoruba. Cuenta con 521,8 millones de parámetros y se entrenó durante 8 épocas completas (31.360 pasos de optimización) sobre 8.000 pares audio-texto del split yoruba del dataset `multilingual-tts/open-bible`, remuestreados a 22.050 Hz.

Es relevante porque demuestra un flujo de trabajo reproducible de adaptación monolingüe de un modelo multilingüe grande a una lengua tonal con ortografía diacrítica compleja, usando hardware de gama media (una única NVIDIA A10G de 24 GB). El repositorio, de 5,9 GB, incluye pesos, tokenizador, configuración, estadísticas de mel y muestras de audio de comparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XTTS-v2 de Coqui: codificador GPT autorregresivo de texto/mel + vocoder de espectrograma VAE discreto (DVAE) |
| Parametros totales | 521,8 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la clonacion se condiciona con un clip de audio de referencia de 3 a 10 segundos) |
| Tipos de cuantizacion | no disponible (pesos en `.pth`; no se publican versiones cuantizadas) |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | Coqui Public Model License (coqui-mrcul); enlace: https://coqui.ai/cpml |
| Formato de pesos | PyTorch checkpoint (`.pth`): `model.pth`, `dvae.pth`, `mel_stats.pth`, mas `config.json` y `vocab.json` |
| Frecuencia de muestreo | 22.050 Hz |
| Tamano del repositorio | 5,9 GB |
| Tokenizador | BPE ampliado con etiqueta de idioma `[yo]` y vocabulario extendido de 2.000 tokens |

## Arquitectura y entrenamiento

La arquitectura es la de Coqui XTTS-v2: un decodificador GPT autorregresivo que modela la secuencia de tokens de texto y de mel-espectrograma, acoplado a un vocoder basado en un VAE discreto (DVAE) que reconstruye la forma de onda a partir de la representación espectral. El condicionamiento del hablante se realiza mediante latentes de audio extraídos de un clip de referencia, lo que permite clonación zero-shot y transferencia entre hablantes. El ajuste fino mantiene estos latentes y amplía el tokenizador BPE con una etiqueta de idioma específica `[yo]`, imprescindible para que el modelo enrute correctamente la fonología tonal del yoruba.

El entrenamiento se realizó sobre el split yoruba de `multilingual-tts/open-bible`: 8.000 muestras emparejadas de audio y texto, remuestreadas a 22.050 Hz. Se ejecutaron 8 épocas completas (31.360 pasos globales) con optimizador AdamW y planificador MultiStep, con una tasa de aprendizaje de 5e-6 y un tamano de lote efectivo de 8, sobre una única GPU NVIDIA A10G de 24 GB. No se documenta uso de RLHF ni de DPO; la optimización es puramente supervisada sobre dos objetivos: entropía cruzada de texto y entropía cruzada de mel-espectrograma.

La convergencia fue monotónicamente decreciente en validación. La pérdida de entropía cruzada de texto bajó de 0,2430 a 0,0323 (reducción del 86,7 %), lo que indica un buen ajuste a la ortografía y a las marcas tonales del yoruba. La pérdida de mel-espectrograma se redujo de 3,9983 a 2,1748 (45,6 %), mejorando la fidelidad acústica. La pérdida total de evaluación descendió de 2,6773 a 2,2072 de forma sostenida a lo largo de las 8 épocas.

## Capacidades

- Sintesis de voz en yoruba con soporte de ortografia diacritica y marcas tonales.
- Clonacion de voz zero-shot a partir de 3 a 10 segundos de audio de referencia.
- Transferencia de voz entre hablantes: aplicar el timbre de un hablante de entrenamiento a una locucion nueva.
- Uso autonomo como modelo TTS sin necesidad de audio de referencia para el estilo de la base (siempre que se use el tokenizador extendido).
- Salida de audio a 22.050 Hz lista para post-procesado o publicacion.
- No dispone de tool calling, function calling ni capacidades de agente; no es un modelo de lenguaje, es un modelo text-to-speech.
- Capacidad multilingue limitada al yoruba en este ajuste; la transferencia cross-lingue depende de la base XTTS-v2, no esta validada en este repositorio.
- No soporta vision, audio de entrada mas alla del clip de condicionamiento, ni modos de razonamiento tipo thinking.

## Casos de uso

- Audiolibros y contenido editorial en yoruba: el modelo convierte texto con diacriticos en narracion natural, y permite asignar voces distintas a cada personaje clonando referencias breves.
- Accesibilidad para lectores con dificultades visuales: integrado en lectores de pantalla o aplicaciones moviles, sintetiza documentos y articulos en yoruba con la voz preferida del usuario mediante un clip de 6-10 segundos.
- Locucion automatica para medios de comunicacion: generar versiones en audio de noticias y boletines en yoruba sin contratar estudio de grabacion, manteniendo una voz corporativa consistente.
- Digitalizacion de contenido religioso y educativo: el entrenamiento proviene del dataset Open Bible, por lo que el dominio biblico y doctrinal es el mejor cubierto; util para adaptar textos devocionales o material escolar a formato audio.
- Asistentes de voz para servicios publicos en regiones yorubaparlantes: atencion IVR o quioscos que respondan en yoruba con una voz sintetica natural, con la salvedad de la licencia (ver limitaciones).
- Preservacion linguistica y corpus de investigacion: generar corpus sinteticos etiquetados para entrenar reconocimiento de voz o para estudios foneticos sobre tonos, siempre que se respeten los terminos de la licencia Coqui.
- Prototipado de doblaje y videojuegos: clonar la voz de un actor para previsualizar dialogos en yoruba antes de la grabacion final en estudio.
- Localizacion de e-learning: convertir cursos en texto a versiones narradas en yoruba con voces diferentes por modulo o instructor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de TTS (MOS, WER, similitud de hablante) en la informacion disponible. Los unicos datos cuantitativos son las curvas de convergencia del entrenamiento:

| Epoca | Paso global | Perdida train | CE texto train | CE mel train | Perdida eval | CE texto eval | CE mel eval |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 (inicio) | 0 | 1,0603 | 0,2430 | 3,9983 | no disponible | no disponible | no disponible |
| 1 | 3.920 | 0,6855 | 0,0570 | 2,6851 | 2,6773 | 0,0543 | 2,6230 |
| 2 | 7.840 | 0,5997 | 0,0454 | 2,3536 | 2,4931 | 0,0435 | 2,4496 |
| 3 | 11.760 | 0,5812 | 0,0331 | 2,2916 | 2,3907 | 0,0395 | 2,3512 |
| 4 | 15.680 | 0,5670 | 0,0387 | 2,2293 | 2,3241 | 0,0371 | 2,2870 |
| 5 | 19.600 | 0,6291 | 0,0449 | 2,4713 | 2,2815 | 0,0354 | 2,2461 |
| 6 | 23.520 | 0,5733 | 0,0363 | 2,2569 | 2,2503 | 0,0341 | 2,2162 |
| 7 | 27.440 | 0,5181 | 0,0340 | 2,0385 | 2,2211 | 0,0332 | 2,1879 |
| 8 (final) | 31.360 | 0,6133 | 0,0386 | 2,4146 | 2,2072 | 0,0323 | 2,1748 |

Resumen de la progresion: la entropia cruzada de texto cae un 86,7 % y la de mel un 45,6 % entre el inicio y el paso 31.360. La perdida de validacion decrece de forma monotona en las 8 epocas, sin senales de sobreajuste severo. No se aportan comparaciones con otros modelos TTS en yoruba mediante metricas perceptuales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman alrededor de 2,1 GB en FP32 (521,8 M de parametros) y unos 1,1 GB en FP16/BF16; con el vocoder DVAE, las estadisticas de mel y los buffers de activacion, el consumo tipico se situa en el rango de 3 a 6 GB, aunque el autor no publica una cifra oficial.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA A10G de 24 GB. Para inferencia son suficientes GPUs mucho menores.
- Compatibilidad con GPU de consumo: si, cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070 o superiores. En GPUs de 4-6 GB puede requerir FP16 o descarga parcial de capas a CPU.
- CPU: es posible ejecutar la inferencia en CPU, pero la latencia aumenta de forma notable y no se recomienda para produccion en tiempo real.
- Opciones de despliegue: Coqui TTS en Python (`pip install TTS torch torchaudio`), cargando los ficheros del repositorio mediante `snapshot_download`. No hay soporte nativo en llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje en formato GGUF. Para servicio se puede envolver en una API propia o en el servidor de Coqui TTS.
- Latencia y throughput: no disponible. Dependen de la longitud del texto, del clip de condicionamiento y del hardware; no se publican mediciones de RTF ni de tiempo por caracter.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idioma | Clonacion de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xtts-v2-yoruba-openbible | Fine-tune de XTTS-v2 | 521,8 M | yoruba | Si, zero-shot (3-10 s) | Coqui Public Model License (coqui-mrcul) | HuggingFace, 0 descargas |
| Coqui XTTS-v2 (base) | TTS autorregresivo + DVAE | 521,8 M | 17 idiomas (yoruba no cubierto de forma dedicada) | Si, zero-shot (unos 6 s) | Coqui Public Model License | Ampliamente disponible |
| multilingual-tts/VITS-OpenBible-Yoruba | VITS entrenado desde cero | no disponible | yoruba | No documentada | no disponible | HuggingFace |
| samuelolubukun/xtts-v2-hausa-openbible | Fine-tune de XTTS-v2 | no disponible | hausa | Si, zero-shot (3-10 s) | Coqui Public Model License | HuggingFace |

No se dispone de metricas comparativas (MOS, similitud de hablante, WER) entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a arquitectura, idioma y licencia.

## Limitaciones y advertencias

- El modelo esta entrenado sobre un unico dominio (texto biblico del dataset Open Bible). El rendimiento fuera de ese registro —lenguaje coloquial, jerga, terminologia tecnica o nombres propios— no esta validado y puede degradarse.
- Corpus de entrenamiento reducido: 8.000 pares audio-texto y un numero limitado de hablantes. La diversidad de timbres y acentos del yoruba real es mucho mayor, lo que puede introducir sesgos hacia las voces presentes en Open Bible.
- Riesgo de alucinacion acustica: como todo modelo autorregresivo de audio, puede producir pronunciaciones incorrectas, omisiones o artefactos, especialmente con palabras fuera de vocabulario o marcas tonales mal escritas en la entrada.
- Sensibilidad a los diacriticos: el yoruba depende de los tonos y de los signos subpuntuados. Texto sin marcas tonales o con una normalizacion Unicode distinta puede dar lugar a una prosodia incorrecta.
- Restriccion de licencia: la Coqui Public Model License no permite uso comercial sin una licencia aparte de Coqui. Cualquier despliegue en producto o servicio de pago requiere revisar los terminos en https://coqui.ai/cpml. Este es el caveat mas relevante para produccion.
- Riesgo etico de clonacion de voz: el modelo puede replicar el timbre de un hablante a partir de pocos segundos de audio, lo que abre la puerta a suplantacion, fraude o desinformacion. Es imprescindible contar con consentimiento explicito del hablante y aplicar marcas de agua o deteccion de audio sintetico.
- Ajuste con solo 8 epocas: aunque la validacion decrece de forma monotona, el autor no publica evaluacion perceptiva ni pruebas de robustez, por lo que la calidad final en produccion no esta cuantificada.
- No hay benchmarks publicos ni evaluacion por terceros, y el repositorio registra 0 descargas y 0 likes, lo que implica ausencia de validacion comunitaria.
- Idiomas: solo yoruba declarado. El comportamiento en code-switching (yoruba con ingles, frecuente en Nigeria) no esta documentado.
- La model card no especifica la longitud maxima de texto ni el contexto interno del decodificador GPT, por lo que los limites practicos deben determinarse empiricamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samuelolubukun/xtts-v2-yoruba-openbible
- Modelo hermano en hausa del mismo autor: https://huggingface.co/samuelolubukun/xtts-v2-hausa-openbible
- Dataset de entrenamiento (split yoruba): https://huggingface.co/datasets/multilingual-tts/open-bible
- Dataset de referencia para las muestras de clonacion: https://huggingface.co/datasets/benjaminogbonna/nigerian_common_voice_dataset
- Alternativa VITS en yoruba: https://huggingface.co/multilingual-tts/VITS-OpenBible-Yoruba
- Perfil de GitHub del autor: https://github.com/samolubukun/
- Licencia Coqui Public Model License: https://coqui.ai/cpml
- Pagina de referencia de XTTS-v2: https://ttsmodels.com/models/xtts-v2/
