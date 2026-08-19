# Richasy/IndexTTS-2.5-GGUF

## Resumen

IndexTTS-2.5 es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por el equipo IndexTTS de Bilibili, especializado en clonación de voz zero-shot a partir de una única muestra de audio de referencia. La versión 2.5, publicada en agosto de 2026, amplía el soporte multilingüe a cinco idiomas (chino, inglés, japonés, español y árabe) e incorpora control fino de emociones, velocidad de habla y pronunciación mediante fonemas (Pinyin, CMU y Kana japonés). Su arquitectura se basa en un pipeline de generación de semántica de texto a unidades semánticas, compresión de la tasa de frames del codec semántico, conversión eficiente de semántica a mel mediante un backbone mejorado y un mecanismo de post-entrenamiento con aprendizaje por refuerzo (RL).

Este repositorio concreto, `Richasy/IndexTTS-2.5-GGUF`, contiene una conversión del modelo original a formato GGUF con dtype original (sin cuantizar), preparada para su uso con la librería `audio.cpp` (versión 0.6) y el motor de inferencia Rodel.Inference. El archivo pesa aproximadamente 7,9 GB e incluye todos los tensores en su dtype original para preservar la calidad del modelo antes de aplicar cuantizaciones adicionales. La conversión es reproducible y se ha verificado la igualdad de los 3.790 tensores frente al paquete original de audio.cpp.

La relevancia de este lanzamiento radica en que permite ejecutar IndexTTS-2.5 en entornos que no disponen de las dependencias completas de Python o PyTorch, gracias al ecosistema GGUF y a la integración con audio.cpp. Esto facilita el despliegue en producción, la integración en aplicaciones de escritorio y el uso en hardware modesto, manteniendo la calidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS con codificador semántico (Wav2Vec2-BERT), decodificador semántico, conversor semántico-a-mel (backbone mejorado) y vocoder BigVGAN |
| Parametros totales | no disponible (el archivo GGUF pesa 7,9 GB en dtype original) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Original dtype (sin cuantizar) en este repositorio; no se publican versiones cuantizadas |
| Idiomas soportados | Chino (zh), ingles (en), japones (ja), espanol (es), arabe (ar) |
| Licencia | bilibili-model-license (licencia de uso de modelos de Bilibili) |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

IndexTTS-2.5 mantiene el pipeline general de IndexTTS-2 con mejoras en cuatro componentes clave: modelado multilingüe de texto a semántica, compresión de la tasa de frames del codec semántico, conversión eficiente de semántica a mel mediante un backbone mejorado y un mecanismo de post-entrenamiento basado en aprendizaje por refuerzo (RL) para la síntesis. El modelo utiliza un codificador Wav2Vec2-BERT para extraer representaciones semánticas del audio de referencia, un codificador de hablante CAMPPlus para capturar la identidad vocal y un vocoder BigVGAN para generar la forma de onda final.

El entrenamiento se realizó con datos multilingües que cubren los cinco idiomas soportados, con un enfoque en la transferencia de voz entre idiomas (cross-lingual voice transfer) y el control desacoplado de emociones. El modelo acepta instrucciones de texto que se mapean a etiquetas de emoción, lo que permite un control fino sobre la prosodia y la expresividad. La conversión a GGUF en este repositorio mantiene todos los tensores en su dtype original, sin cuantización, para preservar la fidelidad del modelo.

## Capacidades

- Clonación de voz zero-shot: genera voz con la identidad vocal de una muestra de referencia de audio (WAV) sin necesidad de transcripción de la referencia.
- Multilingüe: soporta chino, inglés, japonés, español y árabe, con transferencia de voz entre idiomas (cross-lingual).
- Control de emociones: acepta instrucciones de texto (por ejemplo, "平静而温暖" / "calmado y cálido") que se mapean a etiquetas de emoción para modular la prosodia.
- Control de velocidad de habla: permite ajustar la velocidad de locución.
- Control de pronunciación: soporta fonemas Pinyin (chino), CMU (inglés) y Kana (japonés) para una pronunciación precisa.
- Inferencia más rápida que IndexTTS-2: el modelo 2.5 incorpora optimizaciones que reducen el tiempo de síntesis.
- Integración con audio.cpp: el formato GGUF permite ejecutar el modelo en aplicaciones C/C++ sin dependencias de Python.

## Casos de uso

- Atención al cliente automatizada multilingüe: el modelo puede generar respuestas de voz en cinco idiomas con la misma identidad vocal, lo que permite crear asistentes virtuales que atienden a usuarios en su idioma nativo sin cambiar de locutor. La clonación zero-shot permite personalizar la voz de la marca con una única muestra de audio.
- Audiolibros y narración con control emocional: los editores pueden generar narraciones con distintas emociones (tranquilo, enérgico, triste) a partir de instrucciones de texto, manteniendo una voz consistente en todo el audiolibro. El control de velocidad permite adaptar el ritmo a cada escena.
- Doblaje de vídeo y localización: el soporte multilingüe con transferencia de voz entre idiomas permite doblar contenido de vídeo a varios idiomas preservando la voz original del actor, lo que reduce costes de producción en campañas de marketing o contenido educativo.
- Generación de contenido educativo personalizado: plataformas de e-learning pueden generar lecciones de audio con la voz de un instructor concreto, en varios idiomas y con distintos tonos emocionales para mantener la atención del estudiante. El control de pronunciación con fonemas garantiza la correcta lectura de términos técnicos.
- Asistentes de voz para personas con discapacidad visual: el modelo puede generar voces naturales y expresivas para lectores de pantalla, con control emocional para transmitir matices en la lectura de noticias o literatura. La baja latencia de inferencia permite una experiencia interactiva fluida.
- Pruebas de concepto y prototipado rápido: los desarrolladores pueden integrar el modelo en aplicaciones de escritorio o móviles mediante audio.cpp y Rodel.Inference, generando prototipos de voz en minutos sin necesidad de infraestructura en la nube. El formato GGUF facilita la distribución de la aplicación con el modelo incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio GGUF no incluye métricas de rendimiento comparativas, y la documentación del modelo original (IndexTTS-2.5) no proporciona tablas de evaluación en los materiales consultados. Se recomienda consultar el informe técnico en arXiv (referencia en la sección de enlaces) para obtener datos de evaluación detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 7,9 GB en dtype original, por lo que se recomienda al menos 8-10 GB de VRAM para cargar el modelo completo. Según el artículo de creativeaishow, el modelo puede ejecutarse en GPUs con 6 GB de VRAM, probablemente con cuantización o carga parcial.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para inferencia de alta velocidad. GPUs con menos de 6 GB de VRAM no son adecuadas.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe en GPUs de consumo con 8 GB o más de VRAM, como la RTX 3060 Ti o superiores.
- Opciones de despliegue: audio.cpp (versión 0.6) y Rodel.Inference son los motores soportados. También se puede utilizar llama.cpp si se adapta el modelo, aunque no está documentado.
- Latencia y throughput: no disponible en la información proporcionada. La inferencia es más rápida que IndexTTS-2 según la documentación oficial, pero no se especifican cifras concretas.

## Comparativa con modelos similares

| Modelo | Idiomas | Clonación zero-shot | Control emocional | Formato | Licencia |
|---|---|---|---|---|---|
| IndexTTS-2.5 (GGUF) | zh, en, ja, es, ar | Sí | Sí (instrucciones de texto) | GGUF | bilibili-model-license |
| IndexTTS-2.0 | zh, en | Sí | Parcial | PyTorch | bilibili-model-license |
| IndexTTS-1.5 | zh, en | Sí | No | PyTorch | bilibili-model-license |
| XTTS v2 (Coqui) | 17 idiomas | Sí | No | PyTorch | CPML (uso comercial restringido) |

La comparativa se limita a la familia IndexTTS y XTTS v2 como alternativa popular. IndexTTS-2.5 destaca por el control emocional fino y el soporte de cinco idiomas, mientras que XTTS v2 ofrece más idiomas pero sin control emocional explícito. La licencia de Bilibili impone restricciones para empresas de gran tamaño (ver sección de limitaciones).

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero el modelo se entrenó principalmente con datos de habla de Bilibili, lo que puede introducir sesgos en acentos, entonaciones o vocabulario no representativo de todas las variantes dialectales de los idiomas soportados.
- Riesgo de alucinación: en TTS, el riesgo de alucinación se manifiesta como errores de pronunciación o entonación inapropiada, especialmente con números, porcentajes, fracciones y fechas. La documentación de audio.cpp advierte que estos elementos requieren preprocesamiento manual, ya que el pipeline de normalización no está completamente portado.
- Limitaciones de contexto o idioma: el modelo no acepta transcripción de la referencia de audio, lo que limita el control fino sobre la pronunciación en la clonación. La paridad del penalty de repetición en japonés no está resuelta (PR 210 de audio.cpp).
- Restricciones de licencia: la licencia bilibili-model-license exige autorización separada para empresas con más de 100 millones de usuarios activos mensuales o ingresos anuales superiores a 100 millones de RMB. La distribución debe conservar la licencia y el aviso de derivado, y vincular a los destinatarios a los mismos términos.
- Caveats de producción: el modelo no soporta streaming de audio, control de duración, audio de referencia emocional ni vectores de emoción de ocho dimensiones en la integración inicial de Rodel. La calidad de timbre, emoción y prosodia en la versión 2.5 puede ser inferior a la 2.0 según informes de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Richasy/IndexTTS-2.5-GGUF
- Modelo original en HuggingFace: https://huggingface.co/IndexTeam/IndexTTS-2.5
- Repositorio GitHub de IndexTTS: https://github.com/index-tts/index-tts
- Organización GitHub de IndexTTS: https://github.com/index-tts/
- Informe técnico en arXiv: https://arxiv.org/html/2601.03888v5
- Repositorio de audio.cpp: https://github.com/0xShug0/audio.cpp
- Artículo sobre IndexTTS-2.5 (creativeaishow): http://creativeaishow.com/indextts-2-5-the-free-open-weights-ai-voice-cloning-model-with-emotion-control-runs-on-6gb-vram/
