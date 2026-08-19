# Kn90688/mlx-whisper

## Resumen

El modelo `Kn90688/mlx-whisper` es una conversión a formato MLX del modelo de reconocimiento de voz Whisper de OpenAI, publicada por el usuario Kn90688 en Hugging Face. MLX es el framework de aprendizaje automático desarrollado por Apple para ejecutar modelos de forma eficiente en sus chips de la serie M (Apple Silicon). Este modelo está pensado para transcripción de audio y tareas relacionadas con el habla, aprovechando la optimización nativa de MLX para reducir latencia y consumo de recursos en hardware de Apple.

Con aproximadamente 162 millones de parámetros y un tamaño de repositorio de 0,6 GB, se trata de un modelo de tamaño pequeño o medio, adecuado para despliegues en dispositivos con memoria limitada. La licencia MIT permite uso comercial y modificación sin restricciones significativas. Sin embargo, la información pública disponible es muy escasa: la model card solo incluye la licencia, y no se detallan arquitectura exacta, datos de entrenamiento, ni capacidades específicas más allá de lo que se puede inferir por el nombre y los tags.

A pesar de la falta de documentación, el modelo sigue el patrón de otros Whisper convertidos a MLX disponibles en la comunidad, por lo que es probable que sea compatible con las herramientas de transcripción de `mlx-whisper` (el paquete de Python) y con los ejemplos del repositorio oficial `mlx-examples/whisper`. Es relevante para desarrolladores que trabajan en el ecosistema Apple y necesitan un modelo de voz ligero y de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer), convertido a MLX |
| Parametros totales | 162.252.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Whisper usa ventanas de 30 segundos de audio, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo Whisper de OpenAI, que emplea un transformer encoder-decoder con atención multi-cabeza y procesamiento de espectrogramas Mel. La conversión a MLX mantiene la estructura original pero adapta los pesos y operaciones al formato optimizado de MLX para aceleración en Apple Silicon. No se dispone de información sobre el entrenamiento original: número de tokens, composición del dataset o técnicas de alineamiento (RLHF, DPO, etc.) no están documentados en la ficha pública. Dado que el modelo es una conversión de un Whisper preentrenado, se asume que hereda las capacidades del modelo base, pero no se puede confirmar sin acceso a los detalles del autor.

## Capacidades

- Transcripción de audio a texto: el modelo procesa señales de audio y genera transcripciones textuales, siguiendo el comportamiento típico de Whisper.
- Traducción de audio: Whisper soporta traducción directa de audio a texto en inglés, aunque no se confirma que esta conversión conserve esa funcionalidad.
- Timestamps a nivel de palabra: la herramienta `mlx-whisper` permite generar marcas temporales por palabra, lo que sugiere que el modelo es compatible con esta función.
- Integración con el ecosistema MLX: se ejecuta de forma nativa en dispositivos Apple Silicon mediante el paquete `mlx-whisper` o los ejemplos de `mlx-examples`.
- Multilingüismo: no se especifican los idiomas soportados; Whisper originalmente cubre 99 idiomas, pero no hay confirmación para este modelo concreto.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto escrito de forma local en un Mac, sin depender de servicios en la nube, gracias a su integración con MLX.
- Subtitulado automático de vídeos: combinado con herramientas de procesamiento de vídeo, se puede generar subtítulos con marcas temporales para contenido audiovisual.
- Asistentes de voz en aplicaciones de escritorio: al ser ligero (162M parámetros), es viable para integrarlo en apps de macOS que requieran reconocimiento de voz en tiempo real.
- Análisis de llamadas de soporte: permite transcribir conversaciones telefónicas para su posterior análisis o búsqueda de información.
- Accesibilidad: puede servir como base para herramientas que convierten audio en texto para personas con discapacidad auditiva.
- Investigación en procesamiento del habla: al ser de código abierto y con licencia MIT, es útil para experimentos académicos sobre reconocimiento de voz en entornos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo MLX, está diseñado para ejecutarse en Apple Silicon (M1, M2, M3 o posteriores). No es compatible con GPUs NVIDIA o AMD de forma nativa.
- El tamaño del modelo (162M parámetros) y el peso del repositorio (0,6 GB) sugieren que cabe en la memoria unificada de cualquier Mac actual; se estima un consumo de VRAM inferior a 1 GB en precisión fp16, aunque no se dispone de datos oficiales.
- Se puede desplegar con el paquete `mlx-whisper` de Python, que ofrece funciones de transcripción y timestamps.
- También es posible usarlo con los ejemplos del repositorio `mlx-examples/whisper`, que incluyen scripts de inferencia.
- No se dispone de mediciones de latencia o throughput específicas para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos, ya que no se conocen los detalles de rendimiento ni las variantes exactas de Whisper a las que corresponde. Modelos comparables serían otros Whisper convertidos a MLX (por ejemplo, los publicados en la organización `mlx-community`), pero sin datos de benchmarks no es posible ofrecer una tabla objetiva.

## Limitaciones y advertencias

- La falta de documentación oficial impide conocer los idiomas exactos soportados, la calidad de la transcripción en diferentes acentos o ruidos, y las limitaciones de contexto.
- Al ser una conversión de un modelo preentrenado, puede heredar sesgos del dataset original de Whisper (por ejemplo, menor precisión en idiomas poco representados).
- Riesgo de alucinación: como cualquier modelo de generación de texto, puede producir transcripciones inventadas cuando el audio es ambiguo o de baja calidad.
- No se garantiza la compatibilidad con todas las versiones de MLX o del paquete `mlx-whisper`; se recomienda verificar la versión del framework.
- La licencia MIT permite uso comercial, pero el modelo subyacente (Whisper) tiene su propia licencia (MIT también), por lo que no hay conflicto conocido.
- Para producción, es imprescindible validar el modelo con datos propios y comparar con alternativas como `whisper.cpp` o la implementación original de OpenAI.

## Enlaces

- [Hugging Face: Kn90688/mlx-whisper](https://huggingface.co/Kn90688/mlx-whisper)
- [Repositorio mlx-examples/whisper en GitHub](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
- [README de mlx-examples/whisper](https://github.com/ml-explore/mlx-examples/blob/main/whisper/README.md)
- [Paquete mlx-whisper en PyPI](https://pypi.org/project/mlx-whisper/)
- [Sitio oficial de MLX](https://mlx-framework.org/)
