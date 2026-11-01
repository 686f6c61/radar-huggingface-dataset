# mradermacher/whispernow-lfm2.5-2.6b-GGUF

## Resumen

whispernow-lfm2.5-2.6b-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo category271/whispernow-lfm2.5-2.6b, publicada por el cuantizador mradermacher. El modelo base es un LLM de 2.697 millones de parámetros basado en la familia LFM2.5, entrenado específicamente para tareas de limpieza y corrección de transcripciones de voz a texto (transcript cleanup) a partir del dataset whispernow-cleanup. Su propósito es tomar la salida cruda de un sistema de speech-to-text (como Whisper) y reformatearla: corregir errores de reconocimiento, puntuación, mayúsculas y formato, sin alterar el contenido.

Este tipo de modelo resuelve un problema real en pipelines de dictado y transcripción: los sistemas de speech-to-text producen texto sin puntuar, con errores léxicos y sin estructura, y un LLM pequeño y especializado puede depurarlo con baja latencia y coste. La familia LFM2.5 está diseñada para ejecutarse eficientemente en dispositivos con recursos limitados, lo que hace que esta variante en GGUF sea especialmente adecuada para inferencia local.

La versión cuantizada de mradermacher ofrece 12 variantes que van desde Q2_K (1,2 GB) hasta f16 (5,5 GB), lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. El modelo está licenciado bajo lfm1.0 (licencia "other") y su idioma de trabajo es el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (no disponible el detalle exacto) |
| Parametros totales | 2.697.198.592 (~2,7 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2.5, una arquitectura de Liquid AI orientada a eficiencia en inferencia. La ficha no detalla la composición interna exacta de la arquitectura (si es transformer puro, híbrido o con capas de otro tipo), por lo que este dato no está disponible en la información proporcionada. Lo que sí consta es que se trata de un modelo de 2,7 B de parámetros en formato denso, con un tamaño de safetensors de aproximadamente 5,5 GB en f16.

El entrenamiento se realizó mediante fine-tuning sobre el dataset category271/whispernow-cleanup, un conjunto de datos específico para limpieza de transcripciones. El objetivo del ajuste es que el modelo aprenda a transformar transcripciones crudas de sistemas de speech-to-text en texto limpio, correctamente puntuado y formateado. No hay información disponible sobre el número de tokens, la composición detallada del dataset ni sobre el uso de técnicas como RLHF o DPO.

La versión aquí reseñada es una cuantización estática en GGUF realizada por mradermacher, un cuantizador conocido por publicar variantes de miles de modelos de Hugging Face. Las cuantizaciones son estáticas (no imatrix ni weighted), y el autor indica que las cuantizaciones imatrix podrían no llegar a publicarse salvo petición expresa.

## Capacidades

- Limpieza de transcripciones (transcript cleanup): corrección de errores de reconocimiento de voz, puntuación, mayúsculas y formato en la salida de sistemas de speech-to-text.
- Dictado (dictation): preparado para procesar la salida cruda de dictado por voz y convertirla en texto listo para usar.
- Generación de texto conversacional: el repositorio incluye la etiqueta "conversational", lo que indica compatibilidad con formatos de chat.
- Procesamiento en inglés: optimizado para contenido en inglés; no hay soporte declarado para otros idiomas.
- No hay evidencia de capacidades de visión, audio directo (el modelo trabaja sobre texto ya transcrito, no sobre audio), tool calling ni agentes en la información disponible.

## Casos de uso

- Postprocesado de dictado por voz: integración en aplicaciones de notas por voz donde Whisper u otro ASR genera texto crudo; el modelo lo corrige y puntúa en tiempo casi real gracias a su tamaño reducido.
- Transcripción de reuniones: limpieza automática de las transcripciones de reuniones o llamadas antes de almacenarlas o compartirlas, mejorando legibilidad sin intervención humana.
- Subtitulado y accesibilidad: corrección de subtítulos generados automáticamente para vídeos o podcasts, ajustando puntuación y formato para lectura cómoda.
- Pipelines de speech-to-text en local: encaja en flujos totalmente offline en los que un ASR local genera texto y este modelo lo depura, sin enviar datos a la nube (relevante para privacidad médica o legal).
- Integración en aplicaciones móviles o de escritorio: con cuantizaciones de 1,2-1,8 GB, es viable su ejecución en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Preparación de corpus de texto: limpieza masiva de transcripciones históricas para construir datasets de entrenamiento o archivos documentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: la variante Q2_K ocupa 1,2 GB y la Q4_K_M, recomendada por el autor, 1,8 GB; la f16 completa ocupa 5,5 GB. Al ser GGUF, puede ejecutarse tanto en GPU como en CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o más ejecuta con holgura las cuantizaciones intermedias; no se requieren GPUs de datacenter.
- Consumer GPUs: cabe sin problemas en una RTX 3060 de 12 GB, RTX 4060 u otras tarjetas similares incluso con la variante Q8_0 (3,0 GB); también es ejecutable en CPU con 8 GB de RAM en las cuantizaciones más ligeras.
- Despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No hay soporte directo de vLLM o TGI para GGUF (requerirían el modelo base en safetensors).
- Latencia y throughput: no disponibles; por tamaño (2,7 B) y cuantización agresiva, se espera inferencia fluida incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia |
|---|---|---|---|---|
| whispernow-lfm2.5-2.6b (esta ficha) | 2,7 B | GGUF (12 quants) | Limpieza de transcripciones | lfm1.0 (other) |
| Modelos generales de 2-3 B (p. ej. Qwen2.5-3B, Gemma 2 2B) | 2-3 B | safetensors / GGUF | Uso general, limpieza de texto como tarea genérica | Apache 2.0 / Gemma |
| Whisper (ASR) | no comparable | PyTorch | Speech-to-text (genera la transcripción que este modelo limpia) | MIT |

Nota: no se conocen otros modelos fine-tuned específicos para limpieza de transcripciones de tamaño comparable con datos públicos suficientes; los LLM generales de 2-3 B pueden desempeñar la misma tarea mediante prompting, pero sin el ajuste específico sobre whispernow-cleanup.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado para inglés; su rendimiento sobre transcripciones en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Alcance de la tarea: es un modelo especializado en limpieza de transcripciones; no es un chatbot de propósito general ni un modelo de razonamiento, y su uso fuera de su dominio puede dar resultados pobres.
- Riesgo de alucinación: como todo LLM, puede alterar o inventar contenido al "corregir" una transcripción, lo cual es crítico si la fidelidad al audio original importa (contextos legales o médicos); conviene revisión humana.
- Cuantización: las variantes Q2_K y Q3_K_M tienen calidad reducida según el propio autor del repo; para producción se recomienda Q4_K_M o superior.
- Licencia: lfm1.0 es una licencia de tipo "other"; conviene revisar el archivo LICENSE del modelo base antes de cualquier uso comercial, ya que puede tener restricciones específicas.
- Solo existen cuantizaciones estáticas; las imatrix no están disponibles y puede que no lleguen a publicarse.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/whispernow-lfm2.5-2.6b-GGUF
- Modelo base: https://huggingface.co/category271/whispernow-lfm2.5-2.6b
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Página de descargas de mradermacher: https://hf.tst.eu/model#whispernow-lfm2.5-2.6b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/
