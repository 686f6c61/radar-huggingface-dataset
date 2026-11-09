# Maxkuo/eres2net-base-sv-zh-cn-onnx

## Resumen

ERes2Net-base es un modelo de extracción de embeddings de hablante (speaker embedding) desarrollado originalmente por Alibaba DAMO Academy dentro del proyecto 3D-Speaker. Esta ficha corresponde a una copia sin modificar del fichero ONNX `3dspeaker_speech_eres2net_base_sv_zh-cn_3dspeaker_16k.onnx` publicada por el usuario Maxkuo en Hugging Face, cuyo único propósito es servir de espejo con revisión fijada (pinned revision) para la herramienta mac-toolbox. No es un modelo generativo ni un LLM: es un extractor de características de voz que transforma audio de 16 kHz en un vector de 512 dimensiones que representa la identidad del hablante.

El modelo resuelve el problema de verificación e identificación de hablantes (speaker verification, speaker diarization) en mandarín. Se entrenó sobre el corpus 3D-Speaker, que contiene 10.000 hablantes con múltiples dispositivos de grabación, distancias y dialectos, lo que le confiere robustez frente a variabilidad de canal y acento. Su formato ONNX y su integración con sherpa-onnx lo hacen adecuado para despliegue en producción sin dependencias de frameworks de deep learning pesados.

La relevancia actual de esta ficha es limitada: se trata de un espejo de conveniencia, sin descargas ni interacciones, creado en noviembre de 2026. Para uso real conviene referirse al modelo original en ModelScope o al release de sherpa-onnx. No se dispone de información sobre arquitectura interna detallada, número de parámetros ni benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ERes2Net (extractor de embeddings de hablante basado en red residual; detalles internos no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio; ventana de inferencia no especificada) |
| Tipos de cuantización | no disponible (fichero ONNX; se desconoce si está cuantizado) |
| Idiomas soportados | zh (mandarín) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fichero único) |

## Arquitectura y entrenamiento

ERes2Net es una arquitectura de red residual orientada a la extracción de embeddings de hablante, sucesora de ECAPA-TDNN en la familia de modelos de verificación de hablantes. El modelo procesa audio mono a 16 kHz y produce un embedding de 512 dimensiones. La información proporcionada no detalla el número de capas, canales ni el mecanismo exacto de agregación temporal; solo se confirma que se trata de un export ONNX del modelo original de 3D-Speaker.

El entrenamiento se realizó sobre el dataset 3D-Speaker, compuesto por 10.000 hablantes grabados con múltiples dispositivos, a distintas distancias y con variedad de dialectos del chino. No se especifican en la documentación el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, funciones de pérdida concretas (AAM-softmax, etc.) o refinamiento posterior. El export a ONNX fue realizado por el equipo de k2-fsa/sherpa-onnx, y el SHA-256 del fichero (`1a331345f04805badbb495c775a6ddffcdd1a732567d5ec8b3d5749e3c7a5e4b`) coincide con el `checksum.txt` del release oficial.

## Capacidades

- Extracción de embeddings de hablante de 512 dimensiones a partir de audio mono de 16 kHz.
- Verificación de hablante (1:1): comparación de dos audios mediante similitud coseno de sus embeddings.
- Identificación de hablante (1:N): comparación contra una galería de embeddings registrados.
- Diarización de hablantes: segmentación y agrupación de intervenciones en una grabación multi-hablante.
- Robusto a variabilidad de canal, distancia y dialecto gracias al entrenamiento sobre 3D-Speaker.
- Integración nativa con sherpa-onnx para despliegue en C++, Python, C#, Java, Kotlin, Swift y Node.js.
- No soporta generación de texto, tool calling, agentes, visión ni audio a texto.

## Casos de uso

- Verificación biométrica de voz en aplicaciones de autenticación: el modelo genera un embedding del audio entrante y lo compara por similitud coseno con el embedding registrado del usuario, permitiendo autenticación sin contraseña en mandarín.
- Diarización de reuniones y transcripciones: combinado con un ASR, permite etiquetar quién habla en cada segmento de una grabación multi-participante, útil en actas automáticas y análisis de reuniones.
- Control de acceso por voz en dispositivos embebidos: al ser un ONNX ligero y compatible con sherpa-onnx, puede ejecutarse en Raspberry Pi, móviles o navegadores sin GPU, gestionando el desbloqueo por voz del propietario.
- Indexación y búsqueda de archivos de audio: generar embeddings de grandes volúmenes de grabaciones y agruparlas por hablante para búsqueda por voz ("encuentra todos los audios de esta persona").
- Detección de fraude y suplantación: comparar la voz de una llamada con la voz registrada del cliente para detectar suplantaciones en atención telefónica, usando la distancia coseno como señal de alarma.
- Personalización de asistentes de voz: identificar al hablante en un hogar con varios usuarios y adaptar el asistente (preferencias, historial, permisos) según quién habla, ejecutando el modelo localmente por privacidad.
- Análisis forense y cumplimiento: verificación de identidad en grabaciones legales o auditorías de call center, con la ventaja de que el modelo es Apache-2.0 y puede desplegarse on-premise sin enviar audio a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un modelo de embedding de voz de tamaño moderado exportado a ONNX, es esperable que quepa en menos de 1 GB, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. El modelo está pensado para inferencia en CPU mediante sherpa-onnx; cualquier GPU compatible con ONNX Runtime (A100, H100, RTX 4090, etc.) podría acelerar el procesamiento por lotes, pero no hay datos publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, aunque no se aportan cifras oficiales.
- Opciones de despliegue: sherpa-onnx (C++, Python, C#, Java, Kotlin, Swift, Node.js), ONNX Runtime, y cualquier runtime compatible con ONNX. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ERes2Net-base (este) | no disponible | no aplica | zh | Apache-2.0 | ONNX | Espejo en HF; original en ModelScope y sherpa-onnx |
| ECAPA-TDNN (SpeechBrain) | no disponible | no aplica | multi | Apache-2.0 | PyTorch / ONNX | Disponible en HF y SpeechBrain |
| WeSpeaker ResNet34 | no disponible | no aplica | multi | Apache-2.0 | PyTorch / ONNX | Disponible en HF y WeSpeaker |
| 3D-Speaker CAM++ | no disponible | no aplica | zh | Apache-2.0 | ONNX | Disponible en ModelScope y sherpa-onnx |

No se dispone de datos de rendimiento comparativo (EER, minDCF) en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en mandarín; su rendimiento en otros idiomas no está documentado y probablemente sea degradado.
- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings de hablante.
- Riesgo de sesgo por el corpus de entrenamiento (3D-Speaker), que puede no representar adecuadamente acentos no estándar, hablantes infantiles, voces patológicas o condiciones de ruido extremo.
- El embedding puede verse afectado por cambios de canal (micrófono, códec, ruido de fondo), lo que exige umbrales de similitud calibrados por despliegue.
- La verificación de hablante no es infalible: existe riesgo de falsos positivos y de ataques de suplantación con audio sintético o replay; no debe usarse como único factor de autenticación en entornos de alta seguridad.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de copyright y atribución del modelo original de Alibaba DAMO Academy.
- Esta ficha corresponde a un espejo sin descargas ni mantenimiento declarado; para producción se recomienda usar el release oficial de sherpa-onnx o el modelo original en ModelScope, que incluyen verificación de integridad y soporte.
- No hay información sobre cuantización ni sobre el tamaño exacto del fichero (el repo reporta 0.0 GB, lo que sugiere que la información de tamaño no es fiable).

## Enlaces

- Hugging Face (este espejo): https://huggingface.co/Maxkuo/eres2net-base-sv-zh-cn-onnx
- Modelo original en ModelScope: https://modelscope.cn/models/damo/speech_eres2net_base_sv_zh-cn_3dspeaker_16k/summary
- Release de sherpa-onnx con los modelos de reconocimiento de hablante: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Herramienta mac-toolbox: https://github.com/maxkuo-gc/mac-toolbox
- Proyecto 3D-Speaker (Alibaba DAMO Academy): no disponible en la información proporcionada.
