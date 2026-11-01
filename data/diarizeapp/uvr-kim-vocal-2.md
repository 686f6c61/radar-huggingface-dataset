# diarizeapp/uvr-kim-vocal-2

## Resumen

UVR Kim Vocal 2 es un modelo de separación de fuentes de audio orientado a la extracción de voz y la mejora del habla, empaquetado en formato ONNX y publicado por el ecosistema diarizeapp. Se trata de una implementación del modelo Kim Vocal 2 del proyecto Ultimate Vocal Remover (UVR), una familia de herramientas de código abierto ampliamente utilizada para separar voces de instrumentales en pistas musicales. El repositorio actúa como espejo canónico para garantizar la disponibilidad persistente del asset y evitar roturas de dependencias por enlaces caídos.

El modelo no es un modelo de lenguaje ni un transformer generativo: es una red de separación de fuentes de tipo MDX-Net (una arquitectura convolucional sobre espectrogramas) que opera como pipeline `audio-to-audio`. Su función principal es aislar la pista vocal de una mezcla musical, lo que lo hace útil en tareas de transcripción, diarización, karaoke, remezcla y preprocesado de audio para sistemas de reconocimiento de voz.

La relevancia actual del repositorio es fundamentalmente operativa: ofrece un artefacto ONNX estable y con licencia Apache 2.0, ejecutable mediante ONNX Runtime con aceleración por DirectML o CUDA y con fallback universal a CPU. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con un modelo de separación de fuentes de tamaño moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MDX-Net (red convolucional de separación de fuentes sobre espectrogramas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | no disponible (independiente del idioma; opera sobre señal de audio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo pertenece a la familia MDX-Net, un enfoque de separación de fuentes que trabaja sobre representaciones tiempo-frecuencia (espectrogramas) mediante bloques convolucionales. A diferencia de los transformers generativos, no predice tokens ni mantiene un contexto textual: recibe una mezcla de audio y devuelve una estimación de la componente vocal. La model card no detalla el número de capas, canales, parámetros ni la configuración exacta de la red.

Tampoco se especifican en la información disponible los datos de entrenamiento (número de horas de audio, composición del dataset, proporción de música frente a habla), ni si hubo etapas de ajuste fino o aumentación de datos. El modelo se distribuye exclusivamente como artefacto ONNX, lo que implica que el entrenamiento original se realizó en otro framework y se exportó para inferencia portable. La model card menciona soporte de ejecución mediante proveedores de ONNX Runtime: DirectML y CUDA para aceleración por GPU, CPU con SIMD (x86_64 y ARM NEON) como fallback universal, y ausencia de soporte para la NPU Hexagon HTP de Snapdragon X Elite, que se ejecuta en su lugar mediante DirectML, CUDA o CPU.

## Capacidades

- Separación de voz: extracción de la pista vocal a partir de una mezcla musical estéreo o mono.
- Mejora del habla: aislamiento de la voz para reducir música y acompañamiento instrumental antes de tareas posteriores.
- Procesamiento audio-a-audio: pipeline declarado `audio-to-audio`, con entrada y salida de audio.
- Ejecución portable: inferencia mediante ONNX Runtime en CPU, GPU con CUDA o DirectML.
- Integración en pipelines de diarización: el ecosistema diarizeapp lo orienta a preprocesar audio antes de la identificación de hablantes.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de los modelos de lenguaje; es un modelo puramente de señal de audio.
- No se documentan capacidades de transcripción, traducción ni generación de texto.

## Casos de uso

- Preprocesado para diarización de hablantes: aislar la voz de grabaciones con música de fondo antes de pasarlas a un sistema de diarización, lo que reduce falsos positivos y mejora la segmentación por hablante.
- Transcripción de audio musical o podcasts con música: separar la vocal para alimentar un ASR (reconocimiento automático del habla) y disminuir errores provocados por el acompañamiento instrumental.
- Generación de pistas para karaoke: obtener la componente vocal para producir versiones instrumentales o vocales por separado a partir de una mezcla.
- Remezcla y producción musical: extraer la voz para reutilizarla en remixes, versiones alternativas o edición de pistas, con licencia Apache 2.0 que facilita su uso comercial.
- Limpieza de archivos de archivo y patrimonio sonoro: separar voces de grabaciones históricas con acompañamiento para su conservación o restauración.
- Desarrollo de aplicaciones de audio en escritorio: al distribuirse en ONNX, puede integrarse en aplicaciones nativas o multiplataforma con ONNX Runtime, incluyendo despliegue en CPU para equipos sin GPU.
- Evaluación de pipelines de separación de fuentes: servir como referencia reproducible en comparativas de calidad de separación dentro de proyectos de investigación en procesamiento de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,1 GB) sugiere un modelo de separación de tamaño moderado que probablemente cabe en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. La model card menciona compatibilidad con CUDA y DirectML, sin especificar modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: no se confirma qué modelos concretos lo soportan; el fallback a CPU con SIMD (x86_64 y ARM NEON) está garantizado.
- Aceleración por NPU: la NPU Hexagon HTP de Snapdragon X Elite no está soportada; en ese hardware se ejecuta mediante DirectML, CUDA o CPU.
- Opciones de despliegue: ONNX Runtime con proveedores CUDA, DirectML o CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|
| UVR Kim Vocal 2 (diarizeapp) | MDX-Net para separación vocal | ONNX | Apache 2.0 | Audio (duración no especificada) | HuggingFace |
| UVR Kim Vocal 2 (original) | MDX-Net para separación vocal | Pesos UVR / PyTorch | no disponible | Audio | Distribución vía Ultimate Vocal Remover |
| Demucs (Meta) | Separación de fuentes (híbrido waveform/espectrograma) | PyTorch | MIT | Audio | GitHub / PyTorch Hub |
| Spleeter (Deezer) | Separación de fuentes (U-Net sobre espectrogramas) | TensorFlow | MIT | Audio | GitHub |

La comparación con Demucs y Spleeter es orientativa por categoría de tarea (separación de fuentes); no se dispone de métricas comparativas de calidad (SDR, SIR, SAR) en la información proporcionada. La ventaja diferencial de este repositorio es la distribución en ONNX con licencia Apache 2.0 y la garantía de disponibilidad del asset, frente a la dependencia de pesos en formatos específicos de cada framework.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta razonamiento, tool calling ni agentes.
- La model card no documenta sesgos, calidad de separación ni métricas objetivas; no hay garantía cuantificada de rendimiento en dominios distintos de la música popular.
- Riesgo de artefactos y sangrado entre pistas: como todo modelo de separación de fuentes, puede dejar residuos instrumentales en la vocal o viceversa, especialmente en mezclas densas o con reverberación.
- Sin soporte de la NPU Hexagon HTP de Snapdragon X Elite; en ese hardware la inferencia recae en DirectML, CUDA o CPU.
- No se especifican los idiomas ni el dominio de audio de entrenamiento, por lo que el rendimiento en habla no musical (conferencias, llamadas, entrevistas) es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la procedencia y los derechos del audio de entrada; el modelo no otorga derechos sobre las obras procesadas.
- Repositorio con muy baja tracción (29 descargas, 0 likes en el momento de la consulta) y sin documentación técnica detallada; conviene validar el artefacto antes de usarlo en producción.
- No se documentan versiones cuantizadas ni requisitos mínimos de memoria, lo que dificulta el dimensionamiento de despliegues.

## Enlaces

- HuggingFace: https://huggingface.co/diarizeapp/uvr-kim-vocal-2
- Repositorio de mantenimiento (diarizeapp): https://github.com/benzy/diarize
- Ultimate Vocal Remover (proyecto original): https://github.com/Anjok07/ultimatevocalremovergui
- ONNX Runtime: https://onnxruntime.ai/
