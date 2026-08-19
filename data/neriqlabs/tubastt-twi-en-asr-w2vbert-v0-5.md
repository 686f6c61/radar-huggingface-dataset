# neriqlabs/tubastt-twi-en-asr-w2vbert-v0.5

## Resumen

TubaSTT v0.5 es un modelo de reconocimiento automático del habla (ASR) bilingüe para Asante Twi / Akan e inglés, desarrollado por Neriqlabs, un laboratorio especializado en tecnologías de voz para lenguas de bajos recursos. El modelo es un fine-tuning con criterio CTC del encoder auto-supervisado `facebook/w2v-bert-2.0` (580M parámetros, licencia MIT) sobre aproximadamente 109 horas de habla conversacional y leída de Ghana, incluyendo mezcla de códigos (code-switching) entre twi e inglés. Su objetivo principal es servir en agentes de voz de atención al cliente en Ghana, donde las llamadas telefónicas se transmiten a 8 kHz con codec μ-law.

La versión v0.5 incorpora aumentación con codec telefónico G.711 μ-law y SpecAugment durante el entrenamiento, lo que reduce sustancialmente la tasa de error en condiciones de telefonía (WER conversacional de 33.0 % a 27.9 % en el conjunto dev) mientras mantiene el rendimiento en audio limpio. El modelo está publicado con licencia MIT, pesa 605,7 millones de parámetros y se distribuye en formato safetensors. No se especifica la longitud de contexto en la documentación disponible, aunque hereda la arquitectura de w2v-BERT 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-bert (w2v-BERT 2.0) con cabeza CTC |
| Parametros totales | 605.713.250 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tw (twi), ak (akan), en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el encoder auto-supervisado w2v-BERT 2.0 de Facebook, que emplea una arquitectura transformer con atención relativa y enmascaramiento de características. Sobre este encoder, Neriqlabs añadió una cabeza de clasificación CTC (Connectionist Temporal Classification) para decodificación carácter a carácter. El entrenamiento se realizó durante 12 épocas en 8 GPUs A100, con tamaño de lote 4, tasa de aprendizaje 1e-4 y una longitud máxima de secuencia de 25 segundos. Se aplicó aumentación con probabilidad 0.4 por utterance, consistente en un redondeo a 8 kHz con codec G.711 μ-law y SpecAugment, únicamente en el conjunto de entrenamiento.

Los datos de entrenamiento incluyen habla leída en twi (BibleTTS Asante corregido con ɛ/ɔ, Ashesi/Nokwary Financial Inclusion y Common Voice Twi), habla conversacional y con code-switching (WAXAL Akan, licencia CC-BY-4.0) e inglés (FLEURS en_us, CC-BY). El corpus total suma unas 109 horas, normalizado a NFC, sin tonos y con preservación de las vocales ɛ y ɔ. La evaluación por fuente se realiza de forma separada porque la métrica combinada del entrenamiento infla el WER debido al padding de logits.

## Capacidades

- Reconocimiento de voz bilingüe para twi/akan e inglés, con soporte de code-switching dentro de la misma utterance.
- Robustez a condiciones de telefonía de 8 kHz con codec μ-law, reduciendo la brecha entre audio limpio y telefónico casi por completo (WER de 9.1 % limpio vs 9.5 % telefónico en habla leída).
- Decodificación CTC carácter a carácter, con preservación de las vocales ɛ y ɔ.
- Integración con el ecosistema Transformers de Hugging Face mediante `Wav2Vec2BertForCTC` y `Wav2Vec2BertProcessor`.
- Compatibilidad con fusión superficial de un modelo de lenguaje KenLM 3-gram bilingüe para mejorar la decodificación (opcional, mediante `pyctcdecode`).
- Entrenado para habla conversacional y leída, con énfasis en dominios de atención al cliente y fintech.

## Casos de uso

- Atención al cliente automatizada en Ghana: el modelo transcribe llamadas telefónicas de 8 kHz en twi e inglés, permitiendo a sistemas de voz identificar intenciones, extraer información y escalar a agentes humanos cuando sea necesario. Su robustez al codec telefónico lo hace adecuado para entornos reales de call center.
- Transcripción de reuniones y entrevistas bilingües: al manejar code-switching entre twi e inglés, puede generar subtítulos o actas de conversaciones donde los hablantes alternan idiomas de forma natural.
- Servicios de banca móvil y fintech: el corpus incluye habla leída del dominio financiero (Ashesi FISD), lo que facilita la transcripción de consultas sobre transferencias, saldos y pagos en aplicaciones de banca por voz.
- Archivado y análisis de llamadas de soporte: las empresas pueden almacenar transcripciones de llamadas para control de calidad, detección de problemas recurrentes o entrenamiento de agentes, con una precisión aceptable en habla conversacional (WER ~26-28 % en dev).
- Subtitulado de contenido audiovisual en lenguas akan: aunque el modelo está orientado a telefonía, también funciona en audio limpio, permitiendo generar subtítulos para vídeos educativos o informativos en twi/akan.
- Investigación lingüística y preservación de lenguas: el modelo puede servir como herramienta para transcribir corpus orales de twi/akan, facilitando la creación de recursos lingüísticos y estudios de dialectología.

## Benchmarks y rendimiento

Los resultados presentados por el autor corresponden a conjuntos de desarrollo (dev) y se detallan en la siguiente tabla. No se incluyen comparaciones con otros modelos ASR en la información disponible.

| Fuente | Tipo | v0.4 WER | v0.5 WER | v0.5 + KenLM |
|---|---|---|---:|---:|---:|
| BibleTTS unseen | Twi leída | 9.8 | **9.1** | 8.0 |
| BibleTTS — 8 kHz phone | Twi leída, telefonía | 11.7 | **9.5** | — |
| WAXAL Akan | conversacional + code-switch | 27.0 | **26.3** | 25.8 |
| WAXAL — 8 kHz phone | conversacional, telefonía | 33.0 | **27.9** | — |
| FLEURS ‡ | inglés | 11.7 | 11.7 | 6.4 ‡ |
| Ashesi FISD † | Twi leída, fintech | 1.2 | 1.0 † | — |

Notas del autor:  
- Los resultados son sobre dev; se está construyendo un split de test con hablantes disjuntos.  
- † Ashesi FISD presenta solapamiento de hablantes y frases entre train y eval, por lo que su WER no debe interpretarse como generalización.  
- ‡ La mejora con KenLM en inglés es optimista porque el corpus del LM solapa ~77 % con el dev de FLEURS; el valor sin fusión (11.7) es el honesto.  
- Los resultados defendibles son los de habla leída y conversacional sobre conjuntos nombrados sin solapamiento de entrenamiento.

## Requisitos de hardware

- El modelo tiene 605,7 millones de parámetros; en FP32 ocupa aproximadamente 2,4 GB, en FP16 alrededor de 1,2 GB y en int8 cerca de 0,6 GB (estimación basada en el tamaño del repositorio).
- Para inferencia en GPU, se recomienda al menos 4 GB de VRAM si se usa FP16; tarjetas como NVIDIA T4, RTX 3060 o superiores son suficientes. En CPU puede ejecutarse, aunque con mayor latencia.
- No se han publicado datos oficiales de latencia o throughput. El entrenamiento se realizó en 8×A100, pero la inferencia es mucho menos exigente.
- Opciones de despliegue: la librería `transformers` de Hugging Face es la vía estándar. Se puede exportar a ONNX o TensorRT para optimizar en producción, aunque no hay guías oficiales en la documentación. No se menciona compatibilidad con vLLM u Ollama (orientados a LLM, no a ASR).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos ASR para twi/akan en la información proporcionada. El modelo comparte arquitectura con `facebook/w2v-bert-2.0`, que es un encoder genérico sin cabeza ASR. No se puede establecer una comparación cuantitativa con alternativas como Whisper u otros modelos multilingües sin datos publicados en la misma configuración.

## Limitaciones y advertencias

- El WER en habla conversacional (26-28 % en dev) sigue siendo alto en comparación con la habla leída, lo que limita su uso en escenarios donde se requiera precisión casi perfecta.
- El modelo está entrenado principalmente en Akan (dialecto twi); puede haber deriva dialectal frente a otras variedades de twi.
- El acento inglés está sesgado hacia el conjunto FLEURS (inglés genérico); el inglés hablado en Ghana aún no está pulido, lo que puede afectar a la transcripción de hablantes con acento ghanés.
- El conjunto Ashesi FISD tiene solapamiento de datos entre train y eval, por lo que su WER bajo no debe interpretarse como una capacidad general.
- La fusión con KenLM mejora el WER, pero en inglés el resultado es optimista debido al solapamiento del corpus del LM con el dev de FLEURS.
- No se ha publicado un split de test independiente con hablantes disjuntos; los números reportados son sobre dev y podrían no reflejar el rendimiento en datos nuevos.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en dominios limitados (Bible, finanzas, conversación telefónica), puede tener un vocabulario restringido fuera de esos ámbitos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neriqlabs/tubastt-twi-en-asr-w2vbert-v0.5
- Web de Neriqlabs: https://neriqlabs.com/
- Perfil de Neriqlabs en Hugging Face: https://huggingface.co/neriqlabs/models
- Paper DONDO (modelos base w2v-BERT para lenguas africanas): https://arxiv.org/html/2607.21540v1
