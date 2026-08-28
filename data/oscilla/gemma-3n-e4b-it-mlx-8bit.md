# Oscilla/gemma-3n-E4B-it-mlx-8Bit

## Resumen

Gemma 3n E4B es un modelo multimodal ligero desarrollado por Google, diseñado para ejecutarse en dispositivos con recursos limitados sin sacrificar capacidades de razonamiento. Su arquitectura emplea un diseño anidado tipo MatFormer, una variante de mezcla de expertos (MoE) que activa 4 000 millones de parámetros de un total de 8 000 millones, lo que reduce la huella de memoria durante la inferencia. Esta versión concreta, publicada por el usuario Oscilla, es una conversión al formato MLX con cuantización de 8 bits, pensada para aprovechar al máximo el hardware de Apple Silicon mediante el framework MLX de Apple.

El modelo original acepta entradas de texto, imagen, audio y vídeo, y está optimizado para tareas de instrucción y conversación. La conversión MLX mantiene todas las capacidades del modelo base, pero adapta los pesos al formato nativo de MLX, lo que facilita su uso en aplicaciones locales en Mac. Esta ficha se centra en la versión de 8 bits, aunque el mismo autor publica también una versión de 4 bits. La relevancia actual de este modelo radica en su equilibrio entre tamaño reducido, multimodalidad y rendimiento, lo que lo convierte en una opción práctica para despliegues en edge computing y prototipado rápido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE anidado (MatFormer), 8 000 millones de parámetros totales, 4 000 millones activos |
| Parametros totales | 1 931 687 152 (según safetensors de esta conversión; el modelo base declara 8B totales) |
| Parametros activos | 4 000 millones (según documentación de Google para Gemma 3n E4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); también existe versión de 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google, con restricciones de uso comercial) |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

El modelo base, google/gemma-3n-E4B-it, emplea una arquitectura Transformer multimodal con un diseño de mezcla de expertos anidado denominado MatFormer. En lugar de una red densa completa, los parámetros se organizan en capas con múltiples expertos, de los cuales solo se activa un subconjunto por token. Esto permite que el modelo tenga 8 000 millones de parámetros en total, pero solo utilice 4 000 millones durante la inferencia, reduciendo así el uso de memoria y la latencia. La versión "it" está ajustada mediante instrucciones para seguir comandos y mantener conversaciones.

La conversión MLX realizada por Oscilla no altera la arquitectura ni los pesos del modelo original; únicamente transforma los pesos al formato MLX y aplica cuantización de 8 bits. No se dispone de información detallada sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto, imagen, audio y vídeo, y puede generar texto como respuesta.
- Reconocimiento de voz automático (ASR) y traducción de voz (AST), según las etiquetas del modelo.
- Conversación multi-turno: diseñado para mantener diálogos coherentes con instrucciones.
- Generación de texto: capaz de producir respuestas en lenguaje natural, resúmenes, redacción y otras tareas de texto.
- Razonamiento básico: el modelo base está ajustado para tareas de razonamiento lógico y matemático, aunque no se aportan benchmarks específicos.
- Integración con MLX: optimizado para ejecutarse en Apple Silicon mediante el framework MLX, con soporte para carga y generación a través de la librería `mlx-lm`.

## Casos de uso

- Asistente local en Mac: al ser una conversión MLX de 8 bits, puede ejecutarse en un Mac con Apple Silicon (M1 o superior) usando `mlx-lm`. Es adecuado para un asistente personal que responda preguntas, redacte correos o resuma documentos sin conexión a internet.
- Transcripción de audio en tiempo real: gracias a sus capacidades ASR, puede transcribir reuniones o grabaciones de voz directamente en el dispositivo, sin enviar datos a la nube.
- Análisis de imágenes en entornos sin GPU: un desarrollador puede integrar el modelo en una aplicación de escritorio que extraiga información de fotografías o capturas de pantalla, aprovechando la multimodalidad y el bajo consumo de memoria.
- Chatbot de atención al cliente embebido: el modelo puede gestionar conversaciones de soporte técnico básico en una aplicación de escritorio, manteniendo contexto durante varios turnos y derivando a un humano cuando sea necesario.
- Prototipado de aplicaciones multimodales: investigadores y desarrolladores pueden usar esta versión MLX para validar rápidamente ideas que combinen texto, imagen y audio, sin necesidad de infraestructura en la nube.
- Traducción automática de vídeo: con soporte de entrada de vídeo, el modelo puede generar subtítulos o traducciones de contenido audiovisual en tiempo real, útil para herramientas de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser una conversión MLX, está diseñado para Apple Silicon (M1, M2, M3 y posteriores). No se proporcionan requisitos específicos de VRAM, pero un modelo de 4 000 millones de parámetros activos en 8 bits ocupa aproximadamente 4 GB de memoria, más overhead de activaciones y KV cache.
- Se recomienda un Mac con al menos 8 GB de memoria unificada para ejecutar el modelo cómodamente; con 16 GB o más se pueden manejar contextos largos sin problemas.
- La inferencia se realiza mediante `mlx-lm`, que aprovecha la unidad Neural Engine y los núcleos GPU de Apple Silicon.
- No es compatible con GPUs NVIDIA o AMD de forma nativa; para otros entornos habría que usar el modelo original en formato PyTorch o GGUF.
- No se dispone de datos de latencia o throughput específicos para esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros (activos) | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-3n-E4B-it (original) | 4B | no disponible | Sí (texto, imagen, audio, vídeo) | Gemma | PyTorch, Transformers |
| Oscilla/gemma-3n-E4B-it-mlx-8Bit (este modelo) | 4B | no disponible | Sí | Gemma | MLX, 8 bits |
| Oscilla/gemma-3n-E4B-it-mlx-4Bit | 4B | no disponible | Sí | Gemma | MLX, 4 bits |
| lmstudio-community/gemma-3n-E4B-it-MLX-8bit | 4B | no disponible | Sí | Gemma | MLX, 8 bits |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia entre ellas es el formato de pesos y la cuantización, que afectan al uso de memoria y a la velocidad de inferencia, pero no a la calidad de las respuestas.

## Limitaciones y advertencias

- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google, que incluyen restricciones para organizaciones con más de 700 millones de usuarios mensuales. Revisar los términos completos antes de su uso en producción.
- Sesgos y alucinaciones: como cualquier modelo de lenguaje grande, puede generar contenido incorrecto o sesgado. No se han publicado evaluaciones específicas de sesgo para esta conversión.
- Contexto limitado: no se ha especificado la longitud de contexto soportada en esta versión; es recomendable probar con secuencias cortas para evitar degradación.
- Dependencia de Apple Silicon: el formato MLX no es portable a otras plataformas sin reconvertir los pesos.
- Sin garantía de rendimiento: al ser una conversión comunitaria, no hay soporte oficial de Google. Los resultados pueden variar respecto al modelo original.
- Idiomas: no se ha documentado la lista de idiomas soportados; el modelo base de Gemma 3n soporta múltiples idiomas, pero esta conversión no aporta detalles.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/Oscilla/gemma-3n-E4B-it-mlx-8Bit
- Modelo base original: https://huggingface.co/google/gemma-3n-E4B-it
- Versión de 4 bits del mismo autor: https://huggingface.co/Oscilla/gemma-3n-E4B-it-mlx-4Bit
- Conversión similar de LM Studio: https://huggingface.co/lmstudio-community/gemma-3n-E4B-it-MLX-8bit
- Documentación de Gemma 3n en GitHub (referencia): https://github.com/inferless/gemma-3n-e4b-it/blob/main/README.md
