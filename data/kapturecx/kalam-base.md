# kapturecx/Kalam-base

## Resumen

Kalam-base es un modelo de reconocimiento automático del habla (ASR) desarrollado por kapturecx, obtenido mediante ajuste fino (fine-tuning) del modelo base Whisper-base de OpenAI. Está especializado en audio telefónico y en el contexto lingüístico de la India, cubriendo hindi, indian-english e hinglish (la mezcla code-switching de hindi e inglés habitual en conversaciones reales). Su propósito es mejorar la transcripción de grabaciones de call center, donde el audio presenta ruido, compresión de códec, vocabulario mixto y acentos marcados, escenarios en los que los modelos ASR genéricos rinden peor.

El modelo se distribuye en formato safetensors con pesos completos, bajo licencia Apache 2.0, y se integra en el ecosistema Hugging Face Transformers como pipeline de `automatic-speech-recognition`. Al derivar de Whisper-base, hereda una arquitectura encoder-decoder transformer con aproximadamente 74 millones de parámetros y una ventana de audio de 30 segundos por segmento, lo que lo hace ligero y desplegable en hardware modesto.

Su relevancia radica en la especialización vertical: frente a Whisper-base original, que está entrenado en un corpus multilingüe general, Kalam-base incorpora un preentrenamiento orientado a dominio telefónico y a las variedades del subcontinente indio. Con solo 16 descargas y 0 likes en el momento de la consulta, es un modelo de nicho, orientado a equipos que construyen soluciones de análisis de conversaciones, transcripción de soporte y control de calidad en centros de contacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-base de OpenAI) |
| Parametros totales | aproximadamente 74 millones (heredados de Whisper-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (estándar de Whisper) |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | hindi (hi), indian-english (en), hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kalam-base es un ajuste fino de `openai/whisper-base`, un modelo encoder-decoder de tipo transformer. El encoder procesa espectrogramas log-Mel de 80 canales extraídos de ventanas de audio de 30 segundos, y el decoder genera tokens de transcripción de forma autorregresiva, con tokens especiales de idioma, tarea (transcripción o traducción) y marcas de tiempo. Whisper-base emplea 6 capas en encoder y 6 en decoder, con dimensión de modelo 512 y 8 cabezas de atención.

Según los tags del repositorio, el entrenamiento consistió en un preentrenamiento adicional (pretraining) sobre datos de dominio telefónico en hindi, indian-english e hinglish. No se especifican en la información disponible el número de horas de audio, la composición exacta del dataset, la proporción de cada idioma ni si se aplicaron técnicas de aumento de datos (ruido, reverberación, simulación de códec telefónico). Tampoco se documentan fases de RLHF, DPO ni ajuste con funciones de pérdida distintas a la estándar de ASR. No se han publicado detalles sobre la estrategia de tokenización ni sobre innovaciones técnicas adicionales más allá del ajuste al dominio.

## Capacidades

- Transcripción automática de voz a texto en hindi, indian-english e hinglish.
- Manejo de code-switching (alternancia de idiomas dentro de una misma frase), habitual en conversaciones telefónicas reales.
- Reconocimiento de audio telefónico con las degradaciones típicas de ese canal (compresión, ancho de banda limitado, ruido de fondo).
- Detección y uso de tokens de idioma y de marcas de tiempo propias de Whisper, si el pipeline lo permite.
- Traducción de voz a texto en inglés desde los idiomas cubiertos, siempre que el decoder de Whisper-base conserve esa capacidad tras el ajuste (no verificado en la información disponible).
- Integración con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente de ASR.
- No se documentan capacidades de visión, audio generativo ni modo de pensamiento extendido.

## Casos de uso

- Transcripción de llamadas de call center: el modelo convierte grabaciones de atención al cliente en texto para su análisis posterior, aprovechando su ajuste específico a audio telefónico y a la mezcla hindi-inglés que aparece en estas conversaciones.
- Control de calidad de agentes: a partir de las transcripciones, los equipos de operaciones pueden auditar guiones, detectar incumplimientos y medir tiempos de respuesta en conversaciones reales.
- Análisis de sentimiento y motivos de contacto: las transcripciones alimentan pipelines de NLP que clasifican la intención del cliente y el resultado de la llamada, algo viable gracias a la ligereza del modelo y a su coste de inferencia reducido.
- Subtitulado de contenido en hinglish: creadores y medios que producen vídeo o pódcast en esta variedad lingüística pueden generar subtítulos con un modelo que reconoce la alternancia de idiomas sin forzar una normalización previa.
- Asistentes de voz para el mercado indio: integración en sistemas IVR o aplicaciones de dictado que necesitan reconocer hindi e inglés en la misma sesión, con despliegue en CPU o GPU de gama baja.
- Investigación en ASR multilingüe y code-switching: sirve como punto de partida para estudiar el rendimiento de arquitecturas Whisper en dominios telefónicos y como baseline para comparar ajustes posteriores.
- Procesamiento por lotes de archivos de audio en infraestructura modesta: con unos 74 millones de parámetros, cabe en una GPU de consumo y permite transcribir grandes volúmenes sin clúster dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3-0,5 GB en precisión FP16 para los pesos (74 millones de parámetros), más el consumo de activaciones y del buffer de audio; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una NVIDIA T4, RTX 3060, RTX 4090 o A100 funcionan sin problema, aunque el modelo está sobredimensionado para estas tarjetas y también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Hugging Face Transformers (pipeline de ASR), así como exportaciones a otros runtimes compatibles con Whisper (llama.cpp, faster-whisper, Whisper.cpp), siempre que se realice la conversión correspondiente; no se documenta en la información disponible un GGUF oficial.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en términos generales, un Whisper-base en GPU moderna procesa audio en tiempo real o más rápido, pero no hay cifras publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kapturecx/Kalam-base | ~74 M | 30 s por segmento | hindi, indian-english, hinglish | Apache 2.0 | Hugging Face |
| openai/whisper-base | ~74 M | 30 s por segmento | multilingüe (99 idiomas) | Apache 2.0 | Hugging Face, ampliamente integrado |
| openai/whisper-small | ~244 M | 30 s por segmento | multilingüe (99 idiomas) | Apache 2.0 | Hugging Face |
| ai4bharat/indicwhisper (variantes) | depende de la variante | 30 s por segmento | idiomas indios | varía según variante | Hugging Face |

La comparación directa con Whisper-base es la más pertinente: Kalam-base sacrifica cobertura lingüística global a cambio de especialización en el dominio telefónico indio. Frente a Whisper-small, este último ofrece mayor capacidad pero también mayor coste computacional, sin que existan datos públicos que permitan afirmar cuál rinde mejor en hinglish telefónico. No se dispone de métricas comparativas publicadas para Kalam-base.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre datos de call centers de la India, puede presentar sesgos hacia el vocabulario, los nombres y las expresiones típicas de ese dominio, y rendir peor en otros acentos o registros.
- Riesgo de alucinación: como todo modelo basado en Whisper, puede generar texto plausible en segmentos de silencio, ruido o audio ininteligible, especialmente en pasajes con baja relación señal-ruido.
- Limitaciones de contexto: la ventana de 30 segundos por segmento obliga a segmentar audios largos, lo que puede romper la coherencia en conversaciones con frases que cruzan cortes.
- Cobertura lingüística limitada: fuera de hindi, indian-english e hinglish, el rendimiento no está garantizado y probablemente sea inferior al de Whisper-base original.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de OpenAI y de los datos de entrenamiento, no documentadas en la ficha.
- Caveat para producción: con 16 descargas y sin benchmarks publicados, no hay evidencia externa de su calidad; se recomienda evaluarlo con un conjunto de validación propio antes de desplegarlo.
- No se documentan procesos de mitigación de sesgos ni evaluaciones de robustez frente a audio adversario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kapturecx/Kalam-base
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentación del pipeline de ASR: https://huggingface.co/docs/transformers/tasks/asr
