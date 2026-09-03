# mradermacher/video-SALMONN-2-Pro-32B-GGUF

## Resumen

video-SALMONN-2-Pro-32B es un modelo de lenguaje grande multimodal (audio-visual LLM) desarrollado por el Departamento de Ingeniería Electrónica de la Universidad de Tsinghua en colaboración con ByteDance. Está diseñado para generar descripciones de vídeo de alta calidad a partir de entradas simultáneas de audio y vídeo, resolviendo tareas de subtitulado y respuesta a preguntas sobre contenido audiovisual. El modelo se presenta en varias escalas (4B, 8B y 32B), siendo la versión de 32B la que, según sus desarrolladores, supera a todos los sistemas de código abierto existentes en benchmarks de QA audiovisual.

Este repositorio concreto, `mradermacher/video-SALMONN-2-Pro-32B-GGUF`, contiene cuantizaciones GGUF del modelo original de 32B, lo que permite su ejecución en entornos con recursos limitados mediante herramientas como llama.cpp u Ollama. La disponibilidad de múltiples niveles de cuantización (desde Q2_K hasta F16) facilita el despliegue en una amplia gama de hardware, desde GPUs de consumo hasta servidores profesionales. Aunque la ficha del modelo original no detalla la arquitectura interna, se sabe que combina un codificador visual y otro de audio con un LLM base, siguiendo la línea de otros modelos multimodales recientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal audio-visual basado en LLM) |
| Parametros totales | 32B (nominal, según nombre del modelo); el archivo safetensors del repo indica 595.266.800 (posiblemente de un componente) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación consultada. Por el nombre y la naturaleza del proyecto, se infiere que sigue un diseño típico de LLM multimodal: un codificador de vídeo (posiblemente basado en Vision Transformer) y un codificador de audio (como Whisper o similar) cuyas salidas se proyectan al espacio de embeddings de un LLM base (probablemente de la familia LLaMA o similar). El entrenamiento combina datos de vídeo y audio con texto, y los desarrolladores mencionan que los modelos de 4B y 8B logran resultados de última generación en sus respectivas escalas, mientras que el de 32B supera a todos los sistemas open-source en benchmarks de QA audiovisual. No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de descripciones (captions) de vídeo de alta calidad, integrando información visual y auditiva.
- Respuesta a preguntas sobre contenido audiovisual (QA), evaluado en benchmarks como Video-MME, WorldSense, AVUT, Video-Holmes y DailyOmni.
- Procesamiento simultáneo de audio y vídeo, lo que permite comprender diálogos, sonidos ambientales y acciones visuales.
- Capacidad multilingüe no confirmada; la documentación no especifica idiomas soportados.
- No se menciona soporte para tool calling, function calling ni razonamiento multi-paso explícito.
- No se indica la presencia de un modo de pensamiento (thinking mode) ni capacidades de visión estática independiente del vídeo.

## Casos de uso

- Subtitulado automático de vídeos: el modelo puede generar descripciones textuales sincronizadas con el contenido audiovisual, útil para plataformas de vídeo, archivos de medios y accesibilidad.
- Análisis de contenido para moderación: permite clasificar o describir automáticamente el contenido de vídeos, ayudando a detectar material inapropiado o a generar metadatos.
- Asistencia para personas con discapacidad visual: al describir escenas y sonidos, puede integrarse en aplicaciones que narran el entorno a usuarios ciegos o con baja visión.
- Búsqueda y recuperación de vídeos: las descripciones generadas pueden indexarse para permitir búsquedas por texto en grandes colecciones de vídeo.
- Generación de informes de vigilancia: en sistemas de seguridad, el modelo puede resumir eventos captados por cámaras, combinando pistas visuales y auditivas.
- Investigación académica en visión por computador y comprensión audiovisual: sirve como punto de partida para experimentos en subtitulado de vídeo, QA multimodal y aprendizaje multimodal.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La documentación del modelo original menciona que se evalúa en Video-MME, WorldSense, AVUT, Video-Holmes y DailyOmni, y que la versión de 32B supera a todos los sistemas open-source, pero no se proporcionan cifras concretas. Por tanto, no es posible presentar una tabla comparativa con valores exactos.

## Requisitos de hardware

- Al ser un modelo de 32B parámetros, la VRAM necesaria depende de la cuantización elegida. Estimaciones orientativas para un LLM de 32B:
  - Q2_K: ~12-14 GB
  - Q4_K_S: ~18-20 GB
  - Q8_0: ~32-34 GB
  - F16: ~64 GB
- GPU recomendadas: para cuantizaciones bajas (Q2-Q4) puede ejecutarse en GPUs de consumo como RTX 3090/4090 (24 GB) o RTX 4080 (16 GB) con offloading a CPU. Para cuantizaciones altas o F16 se requieren GPUs profesionales como A100 (40/80 GB) o H100.
- El formato GGUF permite su uso con llama.cpp, Ollama, LM Studio y otros motores compatibles. También puede desplegarse con vLLM si se convierte a safetensors, aunque no se ha confirmado compatibilidad.
- La latencia y el throughput dependen del hardware y la cuantización; no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (LLMs audiovisuales). Alternativas como LLaVA (centrado en imagen estática) o Video-LLaVA (vídeo) tienen arquitecturas y objetivos similares, pero no se han encontrado datos comparativos directos con video-SALMONN-2-Pro-32B. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo; al ser un modelo entrenado con datos de vídeo y audio, puede heredar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: como cualquier LLM, puede generar descripciones inexactas o inventar detalles no presentes en el vídeo.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que puede restringir el procesamiento de vídeos largos.
- Idiomas soportados no especificados; el rendimiento en idiomas distintos del inglés no está garantizado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, lo que supone un riesgo legal para su integración en productos.
- El repositorio GGUF es una cuantización de terceros (mradermacher) y no está afiliado a los desarrolladores originales; la calidad de la cuantización puede variar.
- El dato de parámetros del safetensors (595M) sugiere que el archivo puede corresponder a un componente del modelo (por ejemplo, el proyector) y no al modelo completo, lo que requiere verificación antes de su uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/video-SALMONN-2-Pro-32B-GGUF
- Modelo original: https://huggingface.co/tsinghua-ee/video-SALMONN-2-Pro-32B
- Repositorio oficial de video-SALMONN 2: https://github.com/bytedance/video-SALMONN-2
