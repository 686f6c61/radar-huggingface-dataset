# Awesome-x/aci-yoruba-phaseX

## Resumen

ACI Yoruba Phase X es un modelo de reconocimiento automatico del habla (ASR) basado en Wav2Vec2 y afinado para yoruba con cambios de codigo (code-switching) yoruba-ingles. Lo desarrolla el usuario Awesome-x y se publica bajo licencia Apache 2.0. El modelo combina un cabezal acustico CTC de Wav2Vec2 (315,5 millones de parametros) con un decodificador KenLM de 5-gramas y un mapa fonetico de postprocesado, todo empaquetado en el mismo repositorio de Hugging Face.

El problema que aborda es la transcripcion de audio real con mezcla de yoruba e ingles, un escenario frecuente en habla conversacional nigeriana y en entornos multilingues donde los ASR genericos fallan por la alternancia de idiomas y la ausencia de diacriticos y tonos bien modelados. La version Phase X reutiliza los mismos pesos acusticos que Phase 10 y mejora el WER del 12,33 % al 7,09 % exclusivamente mediante una configuracion de decodificacion mas agresiva (KenLM con alpha=2.0 y beta=1.5 sobre un corpus unigram mas grande).

Es relevante ahora porque demuestra que, en dominios de bajos recursos, el ajuste del decodificador y del modelo de lenguaje puede aportar casi la mitad de la mejora sin reentrenar el acustico, y porque entrega un paquete autocontenido (pesos, decodificador y mapa fonetico) listo para produccion. El contexto de evaluacion es limitado: 55 muestras retenidas de un unico dataset (AR_Audios).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabezal CTC (Wav2Vec2ForCTC) + decodificador KenLM de 5-gramas |
| Parametros totales | 315.485.870 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada a 16 kHz, ventana dependiente de la duracion del audio) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | yoruba (yo), ingles (en), con cambios de codigo entre ambos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos del acustico), KenLM y `phonetic_map.json` empaquetados en el repo |

## Arquitectura y entrenamiento

El modelo es un Wav2Vec2 preentrenado y afinado para CTC sobre un corpus de audio propio (AR_Audios). La parte acustica es compartida con el checkpoint Phase 10: Phase X no introduce entrenamiento acustico adicional, sino que cambia la configuracion de decodificacion. El decodificador es un modelo de lenguaje KenLM de 5-gramas con pesos alpha=2.0 y beta=1.5, entrenado sobre un corpus unigram mas grande que en fases anteriores. Ademas, el repositorio incluye un mapa fonetico (`phonetic_map.json`) que se aplica como postprocesado para normalizar la salida (sustituciones foneticas y eliminacion de puntuacion) antes de comparar con la referencia.

No se documentan en la informacion disponible el numero de horas de audio de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en un ASR CTC). La innovacion tecnica destacable es el uso de un decodificador con pesos mas altos y un vocabulario unigram mayor, que reduce el WER del 12,33 % (Phase 10) al 7,09 % manteniendo los mismos pesos acusticos. La evaluacion se realiza sobre 55 muestras retenidas, las unicas del dataset que no se usaron para afinar los pesos acusticos compartidos.

## Capacidades

- Reconocimiento automatico del habla (ASR) en yoruba e ingles, incluyendo enunciados con cambios de codigo entre ambos idiomas.
- Transcripcion con decodificacion CTC combinada con KenLM de 5-gramas para mejorar la coherencia lexica.
- Postprocesado fonetico configurable mediante `phonetic_map.json` (normalizacion de fonemas y eliminacion de puntuacion).
- Salida en mayusculas y sin puntuacion tras el postprocesado incluido en la model card.
- Entrada de audio a 16 kHz (muestreo esperado por el procesador Wav2Vec2).
- Paquete autocontenido: pesos, decodificador KenLM y mapa fonetico en el mismo repositorio.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo, modo thinking ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de conversaciones bilingues yoruba-ingles: el modelo esta afinado especificamente para code-switching, por lo que resulta adecuado en call centers, entrevistas y reuniones donde los hablantes alternan ambos idiomas en la misma frase.
- Subtitulado y actas de reuniones en entornos nigerianos: con audio a 16 kHz y decodificacion KenLM, se puede integrar en pipelines de generacion de subtitulos para contenido corporativo o educativo.
- Investigacion linguistica y documentacion de lenguas de bajos recursos: permite transcribir corpus orales en yoruba para estudios foneticos, lexicos o de variacion dialectal, con la ventaja de que el mapa fonetico es editable.
- Atencion al cliente automatizada por voz: la transcripcion a texto puede alimentar un sistema de analisis de intenciones o de busqueda en grabaciones, especialmente en mercados donde el ingles y el yoruba se mezclan.
- Verificacion y control de calidad de transcripciones humanas: el WER del 7,09 % en el conjunto retenido permite usar el modelo como primera pasada y reservar la revision humana para segmentos de baja confianza.
- Prototipado rapido de aplicaciones de voz: al estar todo el paquete (pesos, KenLM, mapa fonetico) en un unico repo y con licencia Apache 2.0, se puede desplegar con `transformers` y `pyctcdecode` sin dependencias externas de decodificadores.
- Analisis de grabaciones de medios de comunicacion en yoruba: transcripcion masiva para indexacion, busqueda por palabras clave y mineria de contenido.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | Configuracion del decodificador | WER (retenido, normalizado) |
|---|---|---|
| Phase 8 / 9 | KenLM alpha=0.5, beta=1.0 | 12,63 % |
| Phase 10 | KenLM alpha=0.5, beta=1.0 (acustico afinado) | 12,33 % |
| Phase X | KenLM alpha=2.0, beta=1.5, corpus unigram mayor | 7,09 % |

Conjunto de evaluacion: ACI Yoruba-English Code-Switching Held-Out Set (55 muestras de AR_Audios no usadas en el afinado acustico). Normalizacion: eliminacion simetrica de puntuacion en prediccion y referencia. La mejora de Phase X frente a Phase 10 se atribuye exclusivamente a la configuracion de decodificacion, ya que comparten pesos acusticos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 315,5 millones de parametros; en FP32 ocupa aproximadamente 1,26 GB solo en pesos, y en FP16 alrededor de 0,63 GB. Con activaciones y buffers de decodificacion, una GPU con 4-6 GB de VRAM es suficiente en la mayoria de los casos.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; para lotes grandes o baja latencia, A100, H100, L40S o RTX 4090. Tambien funciona en GPUs de gama media como RTX 3060 o T4.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares con 6 GB o mas de VRAM.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `Wav2Vec2ProcessorWithLM`, `pyctcdecode` para la decodificacion KenLM, y `librosa` para carga de audio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo CTC de audio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACI Yoruba Phase X | 315,5 M | audio a 16 kHz | yo, en (code-switching) | Apache 2.0 | Hugging Face (Awesome-x) |
| Wav2Vec2 base multilingue (XLSR) | ~300 M | audio a 16 kHz | multilingue | Apache 2.0 / MIT segun checkpoint | Hugging Face (varios autores) |
| Whisper small | ~244 M | audio a 16 kHz | multilingue (incluye yoruba de forma limitada) | MIT | OpenAI / Hugging Face |

No se dispone de resultados de benchmarks comparativos directos entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad. El WER de 7,09 % de Phase X no es directamente comparable con los de otros modelos sin evaluarlos en el mismo conjunto retenido de 55 muestras.

## Limitaciones y advertencias

- El conjunto de evaluacion es de solo 55 muestras de un unico dataset (AR_Audios); el propio autor recomienda validar con audio propio y con un conjunto de test mas grande o independiente.
- Riesgo de sobreajuste al dominio: el modelo se ha afinado sobre un corpus concreto y puede degradarse con acentos, ruido de fondo, microfonos o condiciones acusticas distintas.
- El WER declarado no ha sido verificado de forma independiente (`verified: false` en el model-index).
- La salida no incluye puntuacion; el postprocesado elimina la puntuacion de la referencia para puntuar, lo que puede ocultar errores de segmentacion en produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus limitado puede reflejar sesgos dialectales o de genero presentes en los datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar los terminos del dataset AR_Audios si se redistribuye.
- No se documentan cuantizaciones oficiales ni formatos GGUF; el despliegue en CPU requiere conversion manual.
- Modelo especializado en yoruba-ingles: no es adecuado para otros pares de idiomas ni para tareas de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Awesome-x/aci-yoruba-phaseX
- Repositorio de pesos y decodificador: incluido en el mismo repo de Hugging Face
- Paper, blog o demo: no disponibles en la informacion proporcionada
