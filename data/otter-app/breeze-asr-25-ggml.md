# otter-app/breeze-asr-25-ggml

## Resumen

breeze-asr-25-ggml es un fichero de pesos en formato GGML del modelo de reconocimiento automático del habla Breeze-ASR-25, desarrollado originalmente por MediaTek Research y convertido a GGML por el usuario shdennlin. Este repositorio, publicado por otter-app, es una copia sin modificaciones de esa conversión, cuantizada a q8_0, que la aplicación Otter descarga bajo demanda para ejecutar transcripción de audio en local. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning propio, sino de un artefacto de distribución pensado para consumo por whisper.cpp.

El modelo subyacente es un Whisper, la arquitectura de reconocimiento de voz de OpenAI, adaptada por MediaTek Research. Breeze-ASR-25 se presenta como una variante orientada a entornos con ruido y a idiomas asiáticos, aunque la información disponible en este repositorio no detalla la composición exacta del dataset de entrenamiento ni los idiomas cubiertos. La relevancia de este artefacto radica en que permite desplegar un ASR de calidad media-alta en CPU y GPU de consumo sin depender de servicios en la nube, algo útil para aplicaciones de escritorio y pipelines de transcripción offline.

El repositorio ocupa 1,7 GB y contiene un único binario GGML cuantizado a 8 bits. La licencia declarada es Apache 2.0, heredada del modelo base. No hay métricas de rendimiento publicadas en esta ficha ni en la model card del repositorio, por lo que cualquier evaluación de calidad debe remitirse a la documentación del modelo original de MediaTek Research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), según modelo base; detalles exactos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | q8_0 (8 bits) en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (fichero `ggml-breeze-asr-25-q8_0.bin`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper, un transformer encoder-decoder entrenado para transcripción y traducción de voz. El encoder procesa espectrogramas mel de ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. Breeze-ASR-25 es la adaptación de MediaTek Research sobre esta base, aunque los detalles concretos de su entrenamiento (número de horas de audio, composición del dataset, uso de RLHF o fine-tuning supervisado) no están disponibles en la información proporcionada.

Este repositorio no aporta información sobre el proceso de entrenamiento. La única transformación documentada es la conversión del modelo original al formato GGML mediante las herramientas de whisper.cpp y su cuantización a q8_0. El SHA-256 del binario está publicado en la model card para verificación de integridad: `d4b187c40ffbf1f620734b77821e2ca8a97c8ecf5754d02b2a175069348cafcf`.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante whisper.cpp.
- Ejecución local en CPU y GPU sin conexión a servicios externos.
- Compatible con el ecosistema whisper.cpp, incluyendo detección de idioma automática si el modelo base la soporta.
- Orientación declarada a entornos ruidosos y a idiomas asiáticos según el modelo original de MediaTek Research (no verificable con los datos de este repositorio).
- No soporta tool calling, agentes, visión ni audio generation; es exclusivamente un modelo ASR.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones de escritorio: Otter descarga este fichero bajo demanda y ejecuta la transcripción en local, sin enviar audio a servidores externos, lo que reduce riesgos de privacidad.
- Subtitulado automático de vídeos y podcasts: el binario GGML puede procesarse con whisper.cpp para generar ficheros SRT con marcas de tiempo, adecuado para creadores que necesitan transcripciones sin coste por minuto.
- Dictado por voz en herramientas de productividad: integración en editores de texto o IDE mediante la API de whisper.cpp, con latencia aceptable en CPU moderna gracias a la cuantización q8_0.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones para su posterior indexación y búsqueda, ejecutable en servidores sin GPU dedicada.
- Investigación en ASR: uso como baseline cuantizado para comparar calidad frente a otros modelos Whisper en condiciones de ruido, especialmente en idiomas asiáticos.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva en aplicaciones de videoconferencia, siempre que el hardware permita el throughput necesario.
- Pipelines de datos para entrenamiento de LLM: transcripción masiva de corpus de audio a texto en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero q8_0 ocupa aproximadamente 1,7 GB en disco; en ejecución, whisper.cpp necesita cargar los pesos en memoria, por lo que se recomienda al menos 2 GB de RAM o VRAM libres, más el espacio para el audio y los buffers intermedios.
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM puede ejecutar el modelo; tarjetas como RTX 3060, RTX 4060 o superiores ofrecen margen suficiente. En GPU de gama alta (A100, H100) el modelo está sobredimensionado y el cuello de botella será el preprocesado de audio.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM, y también en CPU.
- Opciones de despliegue: whisper.cpp (formato nativo GGML), aplicaciones que lo integren como Otter. No es compatible directamente con vLLM, TGI ni Ollama, que no soportan GGML de Whisper.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del uso de aceleración (Metal, CUDA, Vulkan) en whisper.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| breeze-asr-25-ggml (este) | no disponible | ventana de 30 s (Whisper) | Apache 2.0 | GGML q8_0 | Hugging Face |
| MediaTek-Research/Breeze-ASR-25 | no disponible | ventana de 30 s (Whisper) | no disponible en esta ficha | safetensors/PyTorch (presumible) | Hugging Face |
| OpenAI Whisper large-v3 (GGML) | ~1.550 M | ventana de 30 s | MIT | GGML | Hugging Face, whisper.cpp |
| OpenAI Whisper small (GGML) | ~244 M | ventana de 30 s | MIT | GGML | Hugging Face, whisper.cpp |

La comparación de rendimiento no está disponible. La ventaja principal de este artefacto frente a los Whisper originales es su orientación declarada a ruido e idiomas asiáticos, aunque no se aportan métricas que lo respalden en esta ficha.

## Limitaciones y advertencias

- No se han publicado métricas de calidad (WER, CER) en este repositorio; la evaluación debe hacerse contra el modelo original de MediaTek Research.
- Los idiomas soportados no están documentados aquí; asumir cobertura multilingüe sin verificar puede producir transcripciones incorrectas.
- Riesgo de alucinación típico de Whisper en segmentos con silencio, ruido extremo o audio musical: puede generar texto inventado.
- La cuantización q8_0 introduce una pérdida de precisión respecto al modelo original en punto flotante; el impacto exacto no está cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia y condiciones del modelo base MediaTek-Research/Breeze-ASR-25 antes de desplegar en producción.
- Este repositorio es una copia de terceros (otter-app sobre shdennlin); no hay garantía de mantenimiento ni de actualizaciones.
- Solo funciona con whisper.cpp u otras implementaciones compatibles con GGML; no es utilizable con frameworks estándar de PyTorch sin reconversión.
- Ventana de audio limitada a 30 segundos por segmento, lo que requiere segmentación previa para audios largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/otter-app/breeze-asr-25-ggml
- Repositorio original de la conversión: https://huggingface.co/shdennlin/breeze-asr-25-ggml
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Aplicación Otter: https://github.com/victorfu/otter
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
