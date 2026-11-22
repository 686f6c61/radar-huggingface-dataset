# snapwre/hohe-asr-amharic

## Resumen

hohe-asr-amharic es un modelo de reconocimiento automático del habla (ASR) especializado en amárico, desarrollado por el usuario snapwre y publicado en Hugging Face bajo licencia CC BY 4.0. Se trata de un fine-tuning del modelo base badrex/Ethio-ASR-multilingual-600M, con 606 millones de parámetros y arquitectura wav2vec2-bert con cabeza CTC. El modelo convierte audio en amárico a texto en escritura ge'ez en una sola pasada, sin generación autorregresiva token a token, lo que según el autor lo hace aproximadamente cinco veces más rápido que un Whisper de precisión similar y evita la generación de frases alucinadas en silencios.

El modelo se entrenó con 880 horas de audio en amárico que incluyen habla leída, cinco dialectos regionales, grabaciones de radiodifusión y entrevistas, llamadas telefónicas y conversación extraída de internet. El entrenamiento contempla condiciones reales: ruido, reverberación de salas, líneas telefónicas de 8 kHz y clips de hasta un minuto. El autor declara un 16,1 % de WER y un 5,4 % de CER en su conjunto de test interno con hablantes no vistos en entrenamiento, cifras que incluyen un modelo de lenguaje de 5-gramas que se distribuye junto a los pesos.

La relevancia actual del modelo radica en su especialización: frente a modelos multilingües genéricos, ofrece un rendimiento declarado notablemente superior en amárico (0,1604 WER en FLEURS am_et) con un coste computacional bajo, 606 M de parámetros, y un servidor HTTP abierto (hohe-serve) listo para despliegue en contenedor con cuantización int8 del procesador. Es la primera entrega de la familia Hohe del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-bert con cabeza CTC (AutoModelForCTC) |
| Parametros totales | 606.104.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de audio de hasta un minuto según la model card) |
| Tipos de cuantizacion | int8 para el procesador en el servidor hohe-serve; no se detallan otras cuantizaciones de pesos |
| Idiomas soportados | am (amárico) exclusivamente |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura wav2vec2-bert, un transformer de audio auto-supervisado, con una cabeza de clasificación CTC (Connectionist Temporal Classification) para la transcripción. La decodificación CTC realiza una única pasada sobre el audio en lugar de generar tokens de forma autorregresiva, lo que explica la ventaja de velocidad frente a modelos encoder-decoder como Whisper y su comportamiento conservador ante silencios. El modelo base es badrex/Ethio-ASR-multilingual-600M, sobre el que se aplicó un fine-tuning específico para amárico.

El entrenamiento utilizó 880 horas de audio en amárico con diversidad de dominios: habla leída, cinco dialectos regionales, emisiones de radiodifusión, entrevistas, llamadas telefónicas y conversación de internet. Se entrenó de forma explícita con ruido, reverberación, audio telefónico a 8 kHz y clips de hasta un minuto. El autor no detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo CTC). Sí se distribuye un modelo de lenguaje de 5-gramas en `lm/am-5gram.bin` con pesos de decodificación ajustados (alpha 0,3 y beta 0,5) en `lm/decoder.json`, que según el autor aporta alrededor del 14 % de la reducción de errores de palabra. El modelo emite un tag `[AMH]` al inicio de la salida que debe eliminarse.

## Capacidades

- Transcripción de voz a texto en amárico (escritura ge'ez) mediante CTC en una sola pasada.
- Robustez ante condiciones reales: ruido, reverberación, líneas telefónicas de 8 kHz (A-law) y clips de hasta un minuto.
- Cobertura de cinco dialectos regionales, incluyendo Addis Ababa, Gojjam y Wello según los conjuntos de evaluación.
- Decodificación con modelo de lenguaje de 5-gramas integrable mediante pyctcdecode para reducir el WER.
- Servicio HTTP listo para producción mediante hohe-serve, con transcripción en streaming y corte de audio largo en los instantes de menor energía.
- No soporta tool calling, function calling, agentes, visión, audio de entrada multilingüe ni modo de razonamiento; es un modelo puramente ASR.
- No genera puntuación ni mayúsculas, y escribe los números con letras.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo está entrenado con audio telefónico a 8 kHz A-law y declara 0,1687 WER en condiciones de línea telefónica, por lo que puede integrarse en un IVR o en un sistema de analítica de llamadas para generar transcripciones indexables.
- Subtitulado y archivado de emisiones de radio y televisión en amárico: el entrenamiento incluye grabaciones de radiodifusión y entrevistas, y el servidor hohe-serve trocea audio largo en los silencios para devolver texto de forma progresiva.
- Búsqueda y recuperación sobre archivos de audio: con un WER declarado de 0,1811 en conversación no vista, las transcripciones son suficientemente precisas para indexar podcasts y permitir búsqueda por palabras clave, aunque el autor advierte que no son aptas para lectura sin revisión.
- Generación de borradores de actas y transcripciones para revisión humana: el modelo sirve como primera pasada en flujos donde un editor corrige el texto, dado su bajo coste (606 M de parámetros) y su velocidad, aproximadamente cinco veces superior a un Whisper de precisión similar según el autor.
- Procesamiento por lotes de corpus de habla amárica para investigación lingüística o entrenamiento de otros modelos: la licencia CC BY 4.0 permite el uso y la redistribución con atribución, y el formato safetensors es compatible con transformers.
- Despliegue en infraestructura modesta: con 606 M de parámetros y cuantización int8 del procesador en hohe-serve, puede ejecutarse en contenedores Docker en instancias spot de AWS, como describe el repositorio del autor, sin necesidad de GPU de gran tamaño.
- Normalización y conversión de cifras posterior a la transcripción: dado que el modelo escribe los números con letras, puede encadenarse con un postprocesador que convierta las formas verbales a dígitos para informes financieros o estadísticos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre FLEURS am_et test y conjuntos internos. CER y WER a nivel de corpus tras normalización amárica (homófonos ge'ez plegados, puntuación eliminada).

| Conjunto de test | Descripción | CER | WER | CER +LM | WER +LM |
|---|---|---:|---:|---:|---:|
| Test interno | 1.548 clips, 105 hablantes no vistos | 0,0589 | 0,1870 | 0,0537 | 0,1611 |
| Test interno por línea telefónica | 8 kHz A-law | 0,0633 | 0,1987 | 0,0573 | 0,1687 |
| Dialecto | Addis Ababa, Gojjam, Wello | 0,0433 | 0,1732 | 0,0416 | 0,1606 |
| FLEURS am_et | benchmark público, habla leída | 0,0628 | 0,1786 | 0,0599 | 0,1604 |
| Podcast corregido a mano | conversación espontánea | 0,2991 | 0,4964 | 0,2979 | 0,4707 |
| Conversación no vista | episodios de podcast no usados en entrenamiento | 0,0659 | 0,1959 | 0,0660 | 0,1811 |

El model-index oficial declara para FLEURS am_et test un WER de 0,1604 y un CER de 0,0599 con el 5-grama, marcados como no verificados. El autor compara con el "modelo abierto de amárico más fuerte que pudimos encontrar", que obtiene 0,1052 CER y 0,2770 WER en el test interno y 0,1327 CER y 0,3100 WER en dialecto; ese modelo es mejor en podcast espontáneo (0,2865 CER) según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con 606 M de parámetros en fp32 se requieren aproximadamente 2,4 GB solo para los pesos; en fp16 unos 1,2 GB. La memoria adicional depende de la duración del audio y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con lotes pequeños; A100, H100 o RTX 4090 ofrecen margen amplio para lotes grandes y streaming.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores con 6-8 GB de VRAM; también es viable en CPU para transcripciones no interactivas.
- Opciones de despliegue: transformers (AutoModelForCTC y AutoProcessor), pyctcdecode con el 5-grama, y el servidor propio hohe-serve en Docker con cuantización int8 del procesador y streaming de transcripción; el autor no menciona soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor afirma que es aproximadamente cinco veces más rápido que un Whisper de precisión similar, pero no publica cifras concretas de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hohe-asr-amharic | 606 M | clips de hasta 1 min | 0,1604 en FLEURS am_et (con 5-grama) | CC BY 4.0 | Hugging Face, servidor hohe-serve |
| Modelo abierto de amárico "más fuerte" citado por el autor | no disponible | no disponible | 0,2770 en test interno del autor | no disponible | no disponible (sin identificar en la información) |
| badrex/Ethio-ASR-multilingual-600M (modelo base) | 600 M aprox. | no disponible | no disponible | no disponible | Hugging Face |
| Whisper (referencia de precisión similar según el autor) | no disponible | 30 s por ventana | no disponible para amárico | MIT (Whisper original) | Hugging Face, múltiples runtimes |

La comparación con Whisper se limita a la afirmación cualitativa del autor sobre velocidad y precisión similar; no se aportan cifras de WER de Whisper en amárico en la información disponible. El modelo abierto de referencia citado por el autor no se identifica por nombre en la model card.

## Limitaciones y advertencias

- Conversación espontánea: alrededor del 47 % de WER en podcast, según el autor; útil para búsqueda o borradores, no para lectura sin supervisión.
- Números: el modelo los escribe con letras (por ejemplo, "12" se devuelve como አስራ ሁለት) porque así aparece en su texto de entrenamiento; requiere postprocesado si se necesitan dígitos.
- Puntuación y mayúsculas: no genera ninguna de las dos; las frases se devuelven como palabras sueltas.
- Hablantes solapados: solo maneja una voz a la vez; dos personas hablando simultáneamente producen texto corrupto.
- Otros idiomas: solo amárico; audio en oromo, tigriña o inglés produce texto con apariencia amárica sin sentido.
- Tag de salida: el modelo antepone `[AMH]` al texto, que debe eliminarse.
- Riesgo de alucinación: menor que en modelos generativos por la decodificación CTC, pero el autor advierte que en silencios no inventa frases; aun así, la salida en audio ruidoso puede contener errores.
- Licencia CC BY 4.0: permite uso comercial con atribución; no se indican restricciones adicionales, pero conviene revisar los términos del modelo base badrex/Ethio-ASR-multilingual-600M.
- Versiones: si se descargó antes del 5 de octubre de 2026, el tag v1.0 original carecía del fichero `lm/am-5gram.bin` y tenía alpha y beta nulos en `lm/decoder.json`; debe volver a descargarse. Los tags v1.0 y v1.0.1 actuales apuntan al conjunto completo y los pesos no cambiaron.
- Sesgos: no se documentan sesgos específicos de género, edad o dialecto más allá de la cobertura declarada de cinco dialectos; el rendimiento en dialectos no listados no está cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/snapwre/hohe-asr-amharic
- Modelo base: https://huggingface.co/badrex/Ethio-ASR-multilingual-600M
- Servidor hohe-serve: https://github.com/snapwre/hohe-serve
- Dataset de evaluación FLEURS: https://huggingface.co/datasets/google/fleurs
- Resultados de evaluación reproducibles: `eval/results.json` dentro del repositorio del modelo
- Configuración del decodificador con 5-grama: `lm/decoder.json` dentro del repositorio del modelo
