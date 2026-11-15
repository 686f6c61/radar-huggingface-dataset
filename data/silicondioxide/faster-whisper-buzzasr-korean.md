# SiliconDioxide/faster-whisper-buzzasr-korean

## Resumen

SiliconDioxide/faster-whisper-buzzasr-korean es una conversión al formato CTranslate2 (float16) del modelo BuzzASR/korean, pensada para su uso con la librería faster-whisper. No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: los pesos son idénticos a los del modelo original BuzzASR/korean, que a su vez deriva de Whisper large-v3 de OpenAI. La conversión no altera los pesos, solo el formato de serialización, y conserva la licencia MIT del modelo base.

El modelo resuelve el problema de desplegar un sistema de reconocimiento automático de voz (ASR) especializado en coreano con la eficiencia de CTranslate2, que reduce el uso de memoria y acelera la inferencia frente a la implementación original en PyTorch. Al estar basado en Whisper large-v3, hereda su arquitectura transformer encoder-decoder y su ventana de contexto de audio de 30 segundos, además de capacidades multilingües, aunque el fine-tuning de BuzzASR se orienta principalmente al coreano con soporte declarado también para inglés.

Es relevante ahora porque permite ejecutar un ASR de alta calidad en coreano con un stack ligero (faster-whisper sobre CTranslate2), sin necesidad de GPU de gama alta, y con una licencia permisiva (MIT) que facilita su integración en productos comerciales. El repositorio ocupa 3,1 GB y no registra descargas ni interacciones en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a CTranslate2 |
| Parametros totales | no disponible (Whisper large-v3 tiene aproximadamente 1550 millones, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (caracteristica heredada de Whisper; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | float16 (unica cuantizacion publicada en este repo) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo convertido con `ct2-transformers-converter`); incluye tokenizer.json y preprocessor_config.json |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con atención multitesta, entrenado originalmente por OpenAI sobre una gran corpus de audio multilingüe débilmente supervisado. El modelo BuzzASR/korean es un fine-tuning de ese checkpoint orientado al reconocimiento de voz en coreano (con inglés como idioma secundario declarado). La model card de esta conversión no aporta detalles sobre el dataset de fine-tuning, el número de tokens de audio, ni si se aplicaron técnicas de RLHF o DPO; esa información correspondería al repositorio original BuzzASR/korean y no está incluida en la información proporcionada.

La innovación técnica de este repositorio es puramente de despliegue: la conversión a CTranslate2 con cuantización float16 mediante `ct2-transformers-converter`. Esto habilita la inferencia con faster-whisper, que implementa decodificación por lotes, gestión eficiente de memoria y soporte de VAD (detección de actividad de voz) para transcripciones de audio largo. No se introducen cambios en los pesos ni en el vocabulario; se copian explícitamente `tokenizer.json` y `preprocessor_config.json` para preservar el preprocesado original.

## Capacidades

- Reconocimiento automático de voz (ASR) en coreano, con soporte declarado también para inglés.
- Transcripción de audio a texto con marcas de tiempo a nivel de segmento y de palabra (funcionalidad de faster-whisper, no confirmada explícitamente para este checkpoint).
- Detección de idioma automática entre los idiomas soportados (ko, en), heredada de Whisper.
- Traducción de voz a texto en inglés desde audio en coreano (capacidad de traducción de Whisper; no verificada específicamente para este fine-tuning).
- Procesamiento de audio en segmentos de hasta 30 segundos, con encadenamiento para archivos más largos mediante faster-whisper.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de ASR.
- No se documentan capacidades de visión, audio generativo ni modo "thinking".

## Casos de uso

- Transcripción de reuniones y entrevistas en coreano: faster-whisper permite procesar archivos largos con VAD y segmentación, y la cuantización float16 reduce la VRAM necesaria para un modelo large-v3, lo que facilita el despliegue en servidores modestos.
- Subtitulado automático de vídeo: la generación de marcas de tiempo por segmento permite producir ficheros SRT/VTT para contenido en coreano, con revisión humana posterior.
- Atención al cliente por voz: transcripción en tiempo casi real de llamadas en coreano para alimentar sistemas de análisis de sentimiento o resumen, aprovechando la licencia MIT para uso comercial.
- Archivado y búsqueda de audio: indexación de grabaciones históricas en coreano convirtiéndolas a texto para búsqueda full-text, con faster-whisper ejecutándose en CPU o GPU de gama media.
- Investigación lingüística y corpus: generación de transcripciones para estudios de sociolingüística o análisis de discurso en coreano, con la ventaja de un modelo abierto y reproducible.
- Integración en pipelines de datos: uso como componente ASR dentro de flujos ETL que procesan audio de podcasts, clases o medios de comunicación, con despliegue vía CTranslate2 en contenedores.
- Aplicaciones de accesibilidad: transcripción en vivo de conversaciones para personas con discapacidad auditiva en entornos coreanoparlantes, con latencia dependiente del hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 3 GB para los pesos (el repo ocupa 3,1 GB), más overhead de activaciones y caché; en la práctica, faster-whisper large-v3 en float16 suele requerir entre 4 y 6 GB de VRAM, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para float16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). En GPUs con menos VRAM puede usarse cuantización int8, pero este repositorio solo publica float16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores con float16; en GPUs con 4 GB sería necesario convertir a int8.
- Opciones de despliegue: faster-whisper (SYSTRAN), servidores compatibles con CTranslate2 (por ejemplo, wyoming-faster-whisper), y cualquier runtime que cargue modelos CTranslate2. No es compatible directamente con llama.cpp, Ollama ni vLLM, que no soportan este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SiliconDioxide/faster-whisper-buzzasr-korean | no disponible (base Whisper large-v3) | 30 s por segmento | ko, en | MIT | CTranslate2 float16 |
| openai/whisper-large-v3 | ~1550 M (dato externo, no confirmado en la información) | 30 s por segmento | multilingüe | MIT | PyTorch safetensors |
| BuzzASR/korean (modelo base) | no disponible | 30 s por segmento | ko, en | MIT | PyTorch |
| faster-whisper large-v3 (conversión estándar) | ~1550 M (dato externo) | 30 s por segmento | multilingüe | MIT | CTranslate2 |

La comparativa se limita a los datos disponibles; no se dispone de métricas de WER ni de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier sesgo, error o limitación del modelo BuzzASR/korean se hereda sin cambios.
- Riesgo de alucinación en ASR: Whisper y sus fine-tunings pueden generar texto plausible en segmentos con ruido, silencio o audio no inteligible; se recomienda usar VAD y revisión humana en producción.
- Idiomas limitados a coreano e inglés según la model card; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Ventana de audio de 30 segundos por segmento: para audio largo es necesario segmentar, lo que puede introducir errores en fronteras de segmentos.
- Solo se publica cuantización float16; para entornos con poca VRAM habría que reconvertir el modelo a int8.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia y condiciones del modelo base BuzzASR/korean, ya que la model card solo indica que se respeta la licencia original.
- El repositorio no registra descargas ni validación comunitaria; no hay evidencia pública de calidad en producción.
- No apto para tareas de generación de texto, razonamiento, código o agentes: es exclusivamente un modelo ASR.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SiliconDioxide/faster-whisper-buzzasr-korean
- Modelo base: https://huggingface.co/BuzzASR/korean
- faster-whisper (SYSTRAN): https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Whisper (OpenAI): https://github.com/openai/whisper
