# ArminRahimi/Audio8-TTS-Persian

## Resumen

Audio8-TTS-Persian es un ajuste fino (fine-tune) del modelo de síntesis de voz Audio8-TTS-Preview-0.6B, adaptado especificamente al persa (farsi) por ArminRahimi. Se trata de un modelo text-to-speech (TTS) de 601 millones de parametros con arquitectura DualAR (dos ramas autorregresivas, lenta y rapida) y capacidad de clonacion de voz zero-shot. El persa no figura entre los idiomas soportados por el modelo base, por lo que esta adaptacion se presenta como la primera publica de Audio8 a ese idioma.

El modelo resuelve la generacion de voz sintetica inteligible en persa a partir de texto, incluyendo la posibilidad de condicionar la salida con un clip de referencia para imitar la voz de un hablante. Es relevante porque demuestra que es posible adaptar un modelo TTS compacto a un idioma nuevo con recursos de computo muy limitados: el entrenamiento se realizo integramente en una unica GPU T4 de Google Colab.

La version documentada es la v0.2, entrenada sobre aproximadamente 77 horas de audio persa filtrado (unas 55.500 emisiones) provenientes de los conjuntos Mana-TTS y GPTInformal-Persian. La calidad de naturalidad medida con oyentes nativos alcanza un MOS de 3,32 frente a 4,79 de las grabaciones originales, lo que indica un habla inteligible pero con prosodia aun algo robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (dos ramas autorregresivas lenta y rapida) sobre codec de audio, inspirada en Fish Audio S2 Pro |
| Parametros totales | 601.159.424 (601M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendacion practica: entradas de menos de ~150 caracteres) |
| Tipos de cuantizacion | pesos exportados en bf16; no se documentan otros formatos cuantizados |
| Idiomas soportados | persa (farsi, `fa`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Audio8-TTS-Preview-0.6B (commit `07e40f5`), un TTS de 0,6B parametros con arquitectura DualAR: dos ramas autorregresivas, una lenta y otra rapida, que operan sobre representaciones de un codec de audio. La adaptacion al persa entrena la totalidad de los 601M parametros, es decir, ambas ramas AR. El ajuste se realizo con AdamW de 8 bits, learning rate 3e-5, schedule coseno con 3% de warmup, clipping de norma de gradiente 1.0, pesos maestros en fp32 con autocast fp16, batch efectivo de 16 (batch 2 x acumulacion de gradiente 8), durante 7000 pasos y 2 epocas, con la mejor perdida de validacion en el paso 6000 (7.983). Todo el entrenamiento se ejecuto en una unica T4 de Google Colab, reanudando sesiones desde checkpoints del Hub. Los pesos finales se exportaron en bf16.

Los datos de entrenamiento combinan Mana-TTS y GPTInformal-Persian, con aproximadamente 77 horas de audio y unas 55.500 emisiones tras filtrar solo clips de calidad de alineamiento HIGH y duracion entre 1 y 20 segundos. Alrededor del 30% de las filas de Mana-TTS y el 100% de las de GPTInformal se entrenaron con un clip de referencia del mismo hablante, lo que habilita la clonacion de voz. El modelo base es un checkpoint Preview sin preentrenamiento en persa, lo que condiciona la calidad final.

## Capacidades

- Sintesis de voz (text-to-speech) en persa a partir de texto plano.
- Clonacion de voz zero-shot mediante condicionamiento con un clip de referencia y su transcripcion exacta.
- Generacion de audio a una frecuencia de muestreo definida por `model.config.codec_sample_rate`.
- Normalizacion de texto persa incluida en el repositorio (conversion de digitos a palabras, conversion de letras arabes a persas) mediante `normalize_fa`.
- Segmentacion automatica de textos largos en frases mediante `scripts/synthesize.py`.
- Inferencia en CPU (fp32) y GPU (bf16).
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada distinto al de referencia, ni modo de razonamiento.

## Casos de uso

- Audiolibros y narracion en persa: el modelo genera voz a partir de texto y el script de sintesis divide textos largos en frases, lo que permite procesar parrafos completos por lotes de menos de 150 caracteres.
- Accesibilidad y lectura de contenido web: integrado en un pipeline que normalice el texto persa con `normalize_fa` y sintetice la salida, sirve para convertir articulos o documentos en audio para usuarios con discapacidad visual.
- Locucion para videos y contenido divulgativo: la clonacion de voz permite mantener una voz de marca consistente a partir de un clip de referencia del locutor, con la debida autorizacion.
- Prototipado de asistentes conversacionales en persa: el modelo puede actuar como capa de salida de voz en un asistente, sintetizando respuestas cortas generadas por un LLM.
- Investigacion en adaptacion de TTS a idiomas de bajos recursos: el repositorio incluye codigo de entrenamiento, notebook de Colab y documentacion, lo que lo convierte en una referencia reproducible para adaptar modelos compactos a nuevos idiomas con una sola GPU.
- Generacion de voces para videojuegos o aplicaciones educativas en persa: con la advertencia de que la variedad de voces es limitada por el predominio de un unico hablante en los datos.
- Pruebas de doblaje y previsualizacion: sintesis rapida de guiones para validar ritmo y duracion antes de una grabacion profesional.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de evaluacion (held-out, AR lenta + rapida) | 8.005 en el paso 7000 (v0.1: 8.80, con particion de evaluacion distinta) |
| MOS de naturalidad (10 oyentes fluidos en persa, 20 frases no vistas, ciego) | 3,32 ± 0,12 (grabaciones originales: 4,79 ± 0,06) |
| CER (transcripcion con Whisper del audio generado) | no medido todavia |
| Similitud de hablante (clonacion de voz) | no medido todavia |
| Impresion de escucha | habla persa inteligible; prosodia aun algo robotica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 601M parametros ocupan aproximadamente 1,2 GB, mas el overhead del runtime y del codec; en la practica cabe en GPUs con 4-6 GB. En CPU funciona en fp32 con mayor latencia.
- GPU recomendadas: T4 (la usada en entrenamiento), RTX 3060/4060 en adelante, A100 y H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos ~4 GB de VRAM en bf16.
- Opciones de despliegue: transformers (>=4.57,<5) con `trust_remote_code=True`; el repositorio incluye `scripts/synthesize.py` para uso por linea de comandos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Persian (este modelo) | 601M | persa | si (zero-shot) | Apache-2.0 | Fine-tune de Audio8-TTS-Preview-0.6B; MOS 3,32 |
| Audio8-TTS-Preview-0.6B (base) | 601M | multilingue (persa no incluido) | si | Apache-2.0 | Sin preentrenamiento en persa |
| Fish Audio S2 Pro | no disponible | no disponible | no disponible | no disponible | Arquitectura DualAR que inspira a Audio8 |
| Otros TTS en persa | no disponible | persa | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

## Limitaciones y advertencias

- Datos mayoritariamente de un unico hablante (Mana-TTS procede de un solo locutor mas GPTInformal): la variedad de voces y la prosodia son limitadas, y la clonacion de voces no vistas es mas debil que en los idiomas soportados por Audio8.
- Computo muy limitado (una sola T4 de Colab) y sin busqueda de hiperparametros.
- Sin G2P (grafema a fonema): las vocales cortas no escritas, los homografos y la ezafe pueden pronunciarse mal.
- Fechas, abreviaturas y palabras en alfabeto latino no se normalizan de forma especial.
- El modelo base es un checkpoint Preview sin preentrenamiento en persa.
- Prosodia aun algo robotica; el CER y la similitud de hablante no se han medido.
- Riesgo de alucinacion acustica y de pronunciacion incorrecta en textos no normalizados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los autores de los datos de entrenamiento prohiben usar el modelo para imitar las voces de sus hablantes con fines maliciosos.
- Uso responsable: clonar una voz solo con consentimiento explicito del hablante y divulgar que el audio es sintetico; no emplearlo para suplantacion, fraude o desinformacion.
- Las entradas deben mantenerse por debajo de ~150 caracteres; textos mas largos requieren segmentacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArminRahimi/Audio8-TTS-Persian
- Repositorio de entrenamiento y herramientas: https://github.com/ard9/Audio8-Persian-TTS
- Modelo base: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
- Repositorio de Audio8 TTS: https://github.com/Edge0-AI/Audio8_TTS
- Dataset Mana-TTS: https://huggingface.co/datasets/MahtaFetrat/Mana-TTS
- Dataset GPTInformal-Persian: https://huggingface.co/datasets/MahtaFetrat/GPTInformal-Persian
- Muestras de audio: samples/ft_s01.wav, samples/ft_s03.wav, samples/clone_s01.wav (en el repositorio del modelo)
