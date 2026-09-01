# AliAvd/qwen3-asr-persian-elderly

## Resumen

El modelo `AliAvd/qwen3-asr-persian-elderly` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3-ASR-1.7B` de Alibaba, especializado en reconocimiento automático del habla (ASR) en persa, con un enfoque particular en la voz de personas mayores y en la robustez frente a variaciones acústicas y ruido. El autor, Ali Alvandi, lo desarrolló como proyecto de grado bajo la supervisión de Hossein Sameti, y publica únicamente los artefactos de inferencia, sin estado de optimizador ni continuidad de entrenamiento.

El modelo combina un codificador de audio estilo Whisper con un decodificador de lenguaje Qwen3, tal como el modelo base, y se ha ajustado con una mezcla de datos públicos y propios de habla persa, incluyendo habla de ancianos recogida localmente y aumentación probabilística (inyección de ruido, perturbación de velocidad, degradación de señal e inserción de pausas). Con 2.038 millones de parámetros, ofrece una alternativa ligera y específica para tareas de ASR en persa, especialmente en entornos con ruido o con hablantes de edad avanzada, donde los modelos genéricos suelen degradarse.

La relevancia actual radica en la escasez de modelos ASR persas especializados en poblaciones vulnerables y en la necesidad de sistemas robustos para aplicaciones de asistencia, salud y accesibilidad. Al estar basado en un modelo de código abierto con licencia Apache 2.0, puede integrarse en prototipos e investigación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio estilo Whisper + decodificador Qwen3 (modelo base Qwen3-ASR-1.7B) |
| Parametros totales | 2.038.052.480 (2,04 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en fp32/fp16) |
| Idiomas soportados | fa (persa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-ASR-1.7B, que combina un codificador de audio basado en el diseño de Whisper con un decodificador de lenguaje Qwen3. El ajuste fino se realizó sobre una mezcla de datos de habla persa: Common Voice persa, datos derivados de Ganjoor (poesía), datos derivados de Filimo (plataforma de vídeo), habla de ancianos persas recogida localmente y datos de habla de ancianos cross-lingües. Se aplicaron técnicas de normalización de audio y aumentación probabilística, incluyendo inyección de ruido, perturbación de velocidad, degradación de señal e inserción de pausas, para mejorar la robustez acústica.

El entrenamiento se centró en la adaptación al dominio de habla de personas mayores, que suele presentar características acústicas distintas (menor velocidad, mayor variabilidad de tono, presencia de pausas y ruido fisiológico). No se menciona el uso de RLHF ni DPO; el proceso es un fine-tuning supervisado estándar. El repositorio solo contiene los pesos para inferencia, sin el estado del optimizador ni scripts de entrenamiento.

## Capacidades

- Reconocimiento automático del habla (ASR) en persa, con transcripción de audio a texto.
- Especialización en habla de personas mayores, con mayor tolerancia a variaciones acústicas y ruido.
- Robustez frente a degradaciones de señal, ruido de fondo y perturbaciones de velocidad gracias a la aumentación aplicada.
- Soporte de entrada de audio en formato de array numpy o ruta de archivo, mediante la librería `transformers` (pipeline `automatic-speech-recognition`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras tareas fuera del ASR.

## Casos de uso

- Transcripción de consultas médicas con pacientes mayores: el modelo puede transcribir conversaciones entre médicos y pacientes de edad avanzada, donde el habla suele ser más lenta y con mayor presencia de ruido ambiental. Su robustez acústica reduce errores en entornos clínicos.
- Asistentes de voz para personas mayores: integrado en dispositivos domésticos o aplicaciones móviles, permite convertir comandos de voz en texto para controlar interfaces, recordatorios de medicación o llamadas de emergencia.
- Subtitulado automático de vídeos y podcasts en persa: especialmente útil para contenido producido por o dirigido a personas mayores, donde la dicción puede ser menos clara. El modelo puede generar subtítulos con menor tasa de error que modelos genéricos.
- Investigación en fonética y envejecimiento: los investigadores pueden usar el modelo para transcribir corpus de habla de ancianos y analizar patrones acústicos, sin necesidad de anotación manual.
- Archivado y digitalización de entrevistas orales: en proyectos de historia oral o patrimonio cultural, el modelo transcribe entrevistas a personas mayores, preservando el contenido textual con mayor fidelidad.
- Prototipos de accesibilidad: aplicaciones de lectura de pantalla o dictado para usuarios con dificultades motoras que usan voz, donde la robustez al ruido y a la variabilidad de la edad es crítica.

## Benchmarks y rendimiento

El autor reporta un resultado agregado de WER 0.31 y CER 0.27 para el sistema Qwen ajustado. Estos valores dependen de la normalización exacta y de la composición del conjunto de evaluación; la comparación con otros modelos y el código de evaluación se publicarán por separado. No se proporcionan resultados desglosados por subconjunto ni comparaciones con otros sistemas.

| Metrica | Valor |
|---|---|
| WER (agregado) | 0.31 |
| CER (agregado) | 0.27 |

No se dispone de datos de benchmarks adicionales (MMLU, HumanEval, etc.) porque el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,04 B de parámetros, en fp16 ocupa aproximadamente 4 GB; en int8 podría reducirse a ~2 GB. No se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16. Tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. También puede ejecutarse en CPU con cuantización, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: compatible con `transformers` (pipeline `automatic-speech-recognition`), y con el backend vLLM según la documentación del ecosistema Qwen3-ASR. También puede usarse con `llama.cpp` si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Se espera una latencia moderada para un modelo de 2 B en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (base) | 1,7 B | no disponible | 52 idiomas y dialectos | Apache 2.0 | Multilingüe, SOTA entre ASR open-source |
| AliAvd/qwen3-asr-persian-elderly | 2,04 B | no disponible | fa | Apache 2.0 | Fine-tuning específico para persa y habla de ancianos |
| Neurai/Qwen3-ASR-1.7B-Persian | 1,7 B | no disponible | fa | Apache 2.0 | Otro fine-tuning persa del mismo base, sin enfoque en ancianos |

La comparación directa con el modelo base muestra que este ajuste sacrifica la multilingüidad para ganar precisión en persa, especialmente en el dominio de habla de ancianos. No se dispone de benchmarks comparativos publicados entre ambos.

## Limitaciones y advertencias

- El rendimiento puede variar significativamente según el acento, el dispositivo de grabación, las condiciones de ruido, la edad del hablante y el dominio temático. No se garantiza robustez universal.
- Las transcripciones pueden contener omisiones o sustituciones; no deben tratarse como transcripciones autoritativas en entornos críticos de seguridad (por ejemplo, diagnósticos médicos legales o decisiones judiciales).
- El modelo solo soporta persa; no es adecuado para otros idiomas.
- No se han publicado detalles sobre sesgos específicos, pero al entrenarse con datos de habla de ancianos persas, puede tener un sesgo hacia ese perfil demográfico y fallar con hablantes más jóvenes o con acentos regionales poco representados.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni soporte técnico.
- El repositorio no incluye scripts de entrenamiento ni datos de evaluación, lo que dificulta la reproducibilidad de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AliAvd/qwen3-asr-persian-elderly
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Documentación de Qwen3-ASR en Transformers: https://huggingface.co/docs/transformers/main/model_doc/qwen3_asr
- Artículo sobre Qwen3-ASR (aibit.im): https://aibit.im/en/article/qwen3-asr-alibabas-open-source-52-language-asr-model
- Otro fine-tuning persa de referencia: https://huggingface.co/Neurai/Qwen3-ASR-1.7B-Persian
