# Hebrish/Parakeet-TDT-0.6B-v2-Tech-And-Accent

## Resumen

Parakeet-TDT-0.6B-v2-Tech-And-Accent es un modelo de reconocimiento automático del habla (ASR) en inglés, publicado por el usuario Hebrish en Hugging Face como un ajuste fino (fine-tuning) del modelo base `nvidia/parakeet-tdt-0.6b-v2` de NVIDIA. El modelo parte de la arquitectura Parakeet con decodificador TDT (Token-and-Duration Transducer) de NVIDIA NeMo, y está orientado a dos escenarios concretos: vocabulario técnico (tech vocabulary) y adaptación a acentos, con mención explícita al inglés irlandés (irish-english) en sus etiquetas.

El modelo tiene 617.869.958 parámetros (aproximadamente 0,6 mil millones), lo que lo sitúa en la gama ligera de ASR, adecuada para despliegue en producción con latencia baja. Se distribuye en formatos NeMo, ONNX y GGUF, lo que facilita su integración tanto en pipelines de servidor como en entornos de inferencia optimizados. Su licencia es CC-BY-4.0, permisiva para uso comercial con atribución.

La relevancia de este modelo radica en su especialización: los ASR genéricos suelen fallar con terminología técnica (nombres de librerías, siglas, comandos) y con acentos no estándar. Este ajuste fino intenta cubrir ambas carencias combinando datasets de vocabulario técnico, frases leídas en voz alta y LibriSpeech. El acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet con decodificador TDT (Token-and-Duration Transducer), framework NVIDIA NeMo |
| Parámetros totales | 617.869.958 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en NeMo, ONNX y GGUF; no se detallan niveles de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | NeMo, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Parakeet de NVIDIA, un sistema ASR de tipo transducer con decodificador TDT. Los transductores TDT predicen conjuntamente tokens y duraciones, lo que permite un alineamiento más eficiente que los transductores clásicos y reduce el coste computacional en la decodificación. El modelo base `nvidia/parakeet-tdt-0.6b-v2` es un ASR en inglés de 0,6 mil millones de parámetros entrenado por NVIDIA; este ajuste fino conserva esa arquitectura y añade especialización.

El entrenamiento del ajuste fino utiliza tres datasets según las etiquetas del repositorio: `Hebrish/Parakeet-V2-Blend-No-Hebrew` (mezcla propia del autor), `danielrosehill/Read-Aloud-Voice-Sentences` (frases leídas en voz alta) y `openslr/librispeech_asr` (LibriSpeech). No se dispone de información sobre el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en ASR). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del modelo base.

## Capacidades

- Reconocimiento automático del habla en inglés (transcripción de audio a texto).
- Especialización en vocabulario técnico: términos de programación, nombres de herramientas, siglas y comandos.
- Adaptación a acentos, con mención explícita al inglés irlandés en las etiquetas del modelo.
- Adecuado para dictado (dictation) según las etiquetas del repositorio.
- Despliegue en múltiples formatos: NeMo (nativo), ONNX y GGUF.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- Capacidades multilingües: solo inglés (`en`).

## Casos de uso

- Dictado técnico para desarrolladores: el modelo está ajustado con vocabulario técnico, por lo que transcribe con mayor fidelidad nombres de librerías, funciones y comandos que un ASR genérico, reduciendo correcciones manuales en editores de código o notas.
- Transcripción de reuniones de ingeniería: al manejar terminología técnica y acentos no estándar, es adecuado para actas de reuniones donde se discuten arquitecturas, APIs o siglas internas.
- Subtitulado de contenido técnico en inglés: para vídeos, tutoriales o charlas con acento irlandés o vocabulario especializado, el ajuste fino mejora la precisión frente al modelo base.
- Asistentes de voz para entornos de desarrollo: integrado en herramientas de voz a texto para consultar documentación o dictar comandos, aprovechando su tamaño ligero (0,6B) para latencia baja.
- Transcripción de entrevistas o soporte técnico: útil en atención al cliente donde aparecen términos de producto y acentos variados, con despliegue en ONNX o GGUF para entornos con recursos limitados.
- Pipelines de accesibilidad: generación de transcripciones en tiempo real para personas con dificultades auditivas en contextos técnicos, con formatos ONNX/GGUF que permiten inferencia en CPU o GPU modesta.
- Investigación en adaptación de acentos: como punto de partida para estudiar fine-tuning de ASR sobre acentos específicos (irlandés) y vocabulario de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 617,8 millones de parámetros, en FP16 el modelo ocupa aproximadamente 1,2 GB de pesos; en cuantizaciones de 8 bits o menores, el consumo se reduce por debajo de 1 GB, aunque no se documentan niveles concretos.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder ejecutarlo en FP16, pero no hay validación publicada.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090, etc.), dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: NVIDIA NeMo (nativo), ONNX Runtime (formato ONNX) y llama.cpp u otros motores compatibles con GGUF (formato GGUF). No se detallan integraciones con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Hebrish/Parakeet-TDT-0.6B-v2-Tech-And-Accent | 617,9 M | en | cc-by-4.0 | NeMo, ONNX, GGUF | Ajuste fino para vocabulario técnico y acentos |
| nvidia/parakeet-tdt-0.6b-v2 | no disponible en la información | en | no disponible en la información | no disponible en la información | Modelo base del que deriva este ajuste |
| Whisper (variantes de OpenAI) | varía según variante | multilingüe | MIT (variantes open source) | múltiples | Referencia generalista de ASR; no comparable en especialización técnica con los datos disponibles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no es multilingüe.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga, lo que puede complicar la automatización de pipelines.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y respetar los términos.
- Al ser un ajuste fino sobre un modelo base de NVIDIA, hereda los sesgos y limitaciones del modelo original, no documentados en esta ficha.
- Riesgo de alucinación en ASR: posible generación de texto plausible pero incorrecto en audio ruidoso o con acentos no cubiertos por el ajuste.
- La especialización en vocabulario técnico y acento irlandés puede degradar el rendimiento en dominios o acentos no representados en el dataset de ajuste.
- No se documentan métricas de evaluación (WER, etc.) ni el tamaño exacto del dataset de entrenamiento, lo que dificulta estimar su calidad frente al modelo base.
- El repositorio tiene muy poca tracción (46 descargas, 0 likes en el momento de la consulta), por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/Hebrish/Parakeet-TDT-0.6B-v2-Tech-And-Accent
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Dataset de mezcla: https://huggingface.co/datasets/Hebrish/Parakeet-V2-Blend-No-Hebrew
- Dataset Read-Aloud-Voice-Sentences: https://huggingface.co/datasets/danielrosehill/Read-Aloud-Voice-Sentences
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- DOI: https://doi.org/10.57967/hf/11115
