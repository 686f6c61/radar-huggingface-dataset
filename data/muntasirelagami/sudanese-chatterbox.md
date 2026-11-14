# MuntasirElagami/sudanese-chatterbox

## Resumen

Sudanese Chatterbox v0.1 (ft2) es un modelo de síntesis de voz (text-to-speech) especializado en árabe sudanés que clona una voz a partir de un clip de referencia de 6 a 10 segundos. Lo desarrolla MuntasirElagami como un ajuste fino de lahgtna-chatterbox-v1, que a su vez es Chatterbox Multilingual (Resemble AI) afinado para dialectos árabes. El objetivo es cubrir una variedad lingüística con muy poca representación en sistemas TTS comerciales: el árabe sudanés, identificado con el código `apd`.

El modelo parte de la arquitectura Chatterbox Multilingual y solo reentrena el módulo T3 (text-to-speech-token); el decodificador de audio y el codificador de voz se mantienen intactos. El ajuste se hizo sobre 1.956 clips (4,72 horas) de 8 hablantes del split de entrenamiento del dataset sudanese-arabic-speech, derivado del corpus Omnilingual ASR de Meta FAIR. La relevancia actual está en que ofrece una licencia MIT para investigación y uso comercial, algo poco habitual en modelos de clonación de voz de nicho.

Los resultados reportados por el autor muestran una mejora sustancial frente al modelo base en inteligibilidad: el CER de Whisper baja de 0,474 a 0,264 (frente a 0,126 del habla real), y los clips marcados por un oyente nativo como «palabra incorrecta o ausente» pasan de 12 de 14 a 1 de 13. La mejora en acento percibido es, sin embargo, pequeña (3,50 a 3,62 sobre 5). El repositorio ocupa 2,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox Multilingual (T3 text-to-speech-token + decodificador de voz + codificador de voz); solo se reentrena T3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es texto corto y un clip de referencia de 6-10 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | apd (árabe sudanés), ar (árabe); `language_id="sd"` en lahgtna |
| Licencia | MIT |
| Formato de pesos | safetensors (`t3_mtl23ls_v2.safetensors`) |
| Tamano del repositorio | 2,1 GB |
| Libreria | chatterbox |
| Modelo base | oddadmix/lahgtna-chatterbox-v1 |
| Dataset de entrenamiento | MuntasirElagami/sudanese-arabic-speech (split train, 1.956 clips, 4,72 h) |
| Fecha de creacion | 2026-11-13 |

## Arquitectura y entrenamiento

El modelo hereda la pila de Chatterbox Multilingual: un módulo T3 que convierte texto en tokens de voz, un decodificador que transforma esos tokens en audio y un codificador de voz que extrae el embedding del hablante a partir del clip de referencia. El ajuste fino afecta únicamente a T3; el resto de componentes son los originales de Chatterbox. La generación se controla con los parámetros `exaggeration` (0,5 en los ejemplos), `temperature` (0,8) y `cfg_weight` (0,5), y el idioma se selecciona con `language_id="sd"`, la ranura sudanesa de lahgtna.

Los datos de entrenamiento son 1.956 clips del split de entrenamiento (8 hablantes) del dataset sudanese-arabic-speech, filtrados a los clips marcados como `tts_ready`, con un total de 4,72 horas. El corpus deriva de Omnilingual ASR Corpus (`apd_Arab`) de Meta FAIR (2025), con licencia CC-BY-4.0. El entrenamiento consistió en 3 épocas, 735 pasos de optimizador, batch 2 con acumulación de gradiente 4, learning rate 2e-5 y 30 pasos de warmup, ejecutado en una única GPU T4 gratuita de Kaggle durante 65 minutos. La pérdida de entrenamiento bajó de 6,4 a 4,1. No se menciona RLHF ni DPO; es un ajuste supervisado sobre el modelo base.

## Capacidades

- Síntesis de voz en árabe sudanés a partir de texto plano; el autor indica que no se necesita tashkeel (diacríticos).
- Clonación de voz zero-shot con un clip de referencia de 6 a 10 segundos del hablante objetivo.
- Soporte del dialecto sudanés mediante la ranura `language_id="sd"` heredada de lahgtna-chatterbox.
- Control de expresividad, temperatura y peso de classifier-free guidance en la generación.
- Salida de audio a la frecuencia de muestreo del modelo (`model.sr`) en formato WAV mediante soundfile.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia.
- No se documenta un modo de pensamiento (thinking) ni otras capacidades especiales.

## Casos de uso

- Doblaje y localización de contenido al árabe sudanés: el modelo permite generar voces sintéticas con acento sudanés para vídeos, audiolibros o material formativo, clonando la voz de un actor con su consentimiento a partir de un clip corto.
- Asistentes de voz para atención al cliente en Sudán: permite construir interfaces conversacionales que hablen en el dialecto local en lugar de árabe estándar, lo que reduce la fricción con usuarios que no usan MSA a diario.
- Accesibilidad y lectura de textos: conversión de documentos, noticias o mensajes a audio en árabe sudanés para personas con discapacidad visual o baja alfabetización, usando un clip de referencia de un hablante conocido.
- Investigación lingüística y documentación dialectal: generación de estímulos controlados en árabe sudanés para estudios de percepción o para comparar variedades regionales, con la ventaja de una licencia MIT que facilita la publicación de resultados.
- Prototipado de productos de voz para el mercado sudanés: al ser un modelo pequeño (2,1 GB) y con licencia permisiva, sirve para validar ideas de IVR, podcasts sintéticos o audiolibros antes de invertir en servicios comerciales.
- Evaluación comparativa de TTS dialectal: el propio autor lo usa como referencia frente a servicios comerciales (que obtuvieron 4,33/4,42 en naturalidad frente a 3,46 del modelo), por lo que es útil como baseline abierto en estudios de TTS de variedades árabes.
- Generación de voces para videojuegos o narrativa interactiva en árabe sudanés: la clonación con clip corto permite dar voces distintas a personajes sin grabar horas de estudio.

## Benchmarks y rendimiento

Datos aportados por el autor, evaluados sobre 50 frases sudanesas con 4 voces reales no vistas en entrenamiento (12 frases puntuadas a ciegas por un oyente nativo):

| Metrica | Base (lahgtna-chatterbox) | Este modelo | Habla real |
|---|---|---|---|
| CER de Whisper (tope 1 por clip) ↓ | 0,474 | 0,264 | 0,126 |
| Clips marcados «palabra incorrecta o ausente» | 12 de 14 | 1 de 13 | no disponible |
| Oyente nativo: «¿suena sudanés?» (1-5) | 3,50 | 3,62 | no disponible |
| Oyente nativo: «¿natural?» (1-5) | 3,21 | 3,46 | no disponible |
| ق pronunciada como [g] donde el dialecto lo pide | 5 de 5 | 5 de 5 | no disponible |

El autor señala que el mejor servicio comercial en la misma ronda ciega obtuvo 4,33 / 4,42, por lo que persiste una brecha clara. La evaluación se hizo con un único oyente nativo sobre 12 frases, lo que limita la significación estadística. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se hizo en una T4 (16 GB) y el repositorio pesa 2,1 GB, por lo que la inferencia en fp16 debería caber en GPUs consumer con 8-16 GB, aunque el dato no está confirmado por el autor.
- GPU recomendadas: el autor entrenó en una NVIDIA T4 de Kaggle; para inferencia se puede usar cualquier GPU CUDA compatible con PyTorch. No se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU consumer: probablemente sí en tarjetas con 8 GB o más (RTX 3060/4060 en adelante), aunque no hay medición publicada.
- Opciones de despliegue: el código de referencia es lahgtna-chatterbox (commit `433cb74200b55457bffa8ee6965a02ecab546a1c`) instalado con `pip install -e .`, más el paquete `chatterbox`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Nota de configuración: el analizador de alineamiento de lahgtna necesita mapas de atención, por lo que hay que cambiar `attn_implementation="sdpa"` a `"eager"` en `src/chatterbox/models/t3/llama_configs.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto / referencia | Rendimiento reportado |
|---|---|---|---|---|---|
| Sudanese Chatterbox v0.1 (este) | TTS con clonación, fine-tune de Chatterbox | apd, ar | MIT | clip de 6-10 s | CER 0,264; naturalidad 3,46/5 |
| lahgtna-chatterbox-v1 | TTS con clonación, fine-tune de Chatterbox para dialectos árabes | árabe (varios dialectos, incluida ranura `sd`) | MIT (según el autor) | clip de referencia | CER 0,474; naturalidad 3,21/5 |
| Chatterbox Multilingual (Resemble AI) | TTS multilingüe con clonación | multilingüe | MIT | clip de referencia | no disponible en la información |
| Servicio comercial evaluado por el autor | TTS comercial | no especificado | propietaria | no disponible | naturalidad 4,33 / 4,42 |

No se dispone de datos de otros modelos TTS de árabe sudanés en la información proporcionada; la comparativa se limita a los modelos citados por el autor.

## Limitaciones y advertencias

- Habla rápido: aproximadamente 9,4 letras por segundo frente a 8,5 del habla real, y todavía omite alguna palabra de forma ocasional.
- La evaluación se hizo con un único oyente nativo sobre 12 frases; la mejora sobre el modelo base es clara en precisión de palabras pero pequeña en acento percibido.
- Entrenado con habla espontánea de 8 adultos; no se ha probado en pasajes largos, voces infantiles ni otros acentos regionales sudaneses.
- La pronunciación de ق como [g] donde el dialecto lo exige falla en 5 de 5 casos, igual que en el modelo base.
- Riesgo de alucinación de palabras o prosodia en textos fuera del dominio de entrenamiento; el propio autor reporta omisiones de palabras.
- Sesgos potenciales derivados de los 8 hablantes del corpus (adultos, procedencia no especificada); no se documenta un análisis de sesgos.
- Restricciones de uso: la licencia es MIT, pero el uso responsable exige consentimiento del hablante cuya voz se clona y prohíbe suplantación de identidad o generar discursos que alguien no dijo.
- El código de lahgtna-chatterbox en el commit indicado no aplica marca de agua (la llamada de Perth está comentada); si se publica audio generado, hay que añadirla manualmente con `model.watermarker.apply_watermark(wav, sample_rate=model.sr)`.
- Dependencia de un fork concreto de lahgtna-chatterbox y de un cambio manual en la configuración de atención; no es un paquete listo para producción.
- El modelo no es de texto: no sirve para razonamiento, código ni tareas de lenguaje general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuntasirElagami/sudanese-chatterbox
- Modelo base: https://huggingface.co/oddadmix/lahgtna-chatterbox-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MuntasirElagami/sudanese-arabic-speech
- Repositorio del proyecto: https://github.com/MontaserAlajamy/sudanese-arabic-tts
- Metodología de evaluación: https://github.com/MontaserAlajamy/sudanese-arabic-tts/blob/main/results/README.md
- Código de lahgtna-chatterbox: https://github.com/Oddadmix/lahgtna-chatterbox
- Chatterbox (Resemble AI): no disponible en la información proporcionada
- Omnilingual ASR Corpus (Meta FAIR, 2025): no disponible en la información proporcionada
