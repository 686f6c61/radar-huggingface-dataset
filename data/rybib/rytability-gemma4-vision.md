# Rybib/rytability-gemma4-vision

## Resumen

Rytability Gemma 4 Vision Tower es la torre de visión (vision tower) del modelo Gemma 4 E2B de Google, publicada por Rybib como descarga independiente. Su propósito es permitir que una aplicación distribuya únicamente los pesos de texto del modelo Gemma 4 E2B y descargue el soporte de procesamiento de imágenes solo para los usuarios que lo necesiten, optimizando así el presupuesto de almacenamiento en dispositivos. El archivo, `model-vision.safetensors`, pesa 337 171 954 bytes (aproximadamente 0,3 GB) y contiene 659 tensores (`vision_tower.*` y `embed_vision.*`) en precisión BF16 sin cuantizar. Está basado en el modelo `google/gemma-4-E2B-it-qat-q4_0-unquantized` y se distribuye bajo la licencia Gemma Terms of Use. La relevancia de esta publicación radica en que separa el componente de visión del modelo de texto, facilitando despliegues modulares y reduciendo el tamaño de la descarga inicial para aplicaciones que no requieren capacidades multimodales. La arquitectura de la torre es diferente a la de Gemma 3, por lo que no es intercambiable con pesos de texto de generaciones anteriores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision tower de Gemma 4 (arquitectura propia, no compatible con Gemma 3) |
| Parametros totales | no disponible (archivo de 337 MB en BF16, 659 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizar); el modelo base usa QAT Q4_0 pero la torre se distribuye en BF16 |
| Idiomas soportados | no disponibles |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La torre de visión de Gemma 4 es un componente separado del modelo de texto, diseñado para procesar imágenes y generar representaciones visuales que el modelo de lenguaje puede interpretar. Según la documentación proporcionada, su arquitectura es diferente a la de la torre de Gemma 3, con nombres y formas de tensores distintos, lo que impide combinarla con pesos de texto de Gemma 3 o viceversa. El archivo se distribuye en BF16 sin cuantizar, a diferencia del modelo base que utiliza cuantización QAT Q4_0. Esta decisión se justifica por el impacto en la calidad de OCR: cuantizar la torre a 4-bit reduciría aproximadamente 17 puntos de precisión en tareas de OCR a cambio de ahorrar unos 220 MB, un intercambio desfavorable para aplicaciones de escaneo de documentos. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento específico de esta torre, más allá de que proviene del modelo base `google/gemma-4-E2B-it-qat-q4_0-unquantized`.

## Capacidades

- Procesamiento de imágenes para tareas de image-text-to-text, es decir, entrada multimodal (imagen + texto) con salida de texto.
- OCR de alta calidad: la documentación menciona explícitamente que la precisión BF16 es importante para leer recibos, escritura a mano y notas, lo que sugiere un rendimiento optimizado para reconocimiento óptico de caracteres.
- Integración con el modelo de texto Gemma 4 E2B: la torre se carga junto con los pesos de texto en un mismo directorio, y MLX los trata como un único modelo.
- Descarga modular: permite habilitar capacidades de visión bajo demanda sin aumentar el tamaño de la instalación base de la aplicación.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe específico en la información disponible.

## Casos de uso

- Escaneo de documentos en aplicaciones móviles: la torre se descarga solo cuando el usuario activa la función de escaneo, permitiendo leer recibos, facturas y notas manuscritas con alta precisión OCR gracias a la precisión BF16.
- Asistentes con cámara en tiempo real: el modelo puede analizar imágenes capturadas por la cámara del dispositivo y responder preguntas sobre su contenido, como identificar objetos o leer texto en carteles.
- Accesibilidad para personas con discapacidad visual: la combinación de visión y texto permite describir imágenes del entorno, leer etiquetas o transcribir documentos impresos.
- Archivado digital de documentos: automatizar la extracción de texto de imágenes escaneadas para indexar y buscar contenido en sistemas de gestión documental.
- Análisis de capturas de pantalla: el modelo puede interpretar interfaces de usuario, tablas o gráficos en imágenes y generar resúmenes textuales o respuestas a consultas específicas.
- Educación y tutoría: los estudiantes pueden fotografiar problemas matemáticos o diagramas y recibir explicaciones paso a paso del modelo de texto combinado con la torre de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El archivo de la torre pesa 337 MB en BF16, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs de consumo como la NVIDIA GTX 1060 o superiores.
- Al estar en formato MLX, está optimizado para Apple Silicon (M1, M2, M3 y posteriores) y se puede ejecutar en Mac con memoria unificada de 8 GB o más.
- Para ejecutar el modelo completo (texto + visión), se necesitan los pesos de texto Gemma 4 E2B, cuyo tamaño no se especifica en la información disponible.
- Opciones de despliegue: MLX (librería principal), conversión a GGUF para llama.cpp u Ollama, o uso con vLLM si se convierte a formato compatible.
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras torres de visión o modelos multimodales.

## Limitaciones y advertencias

- No es intercambiable con la torre de visión de Gemma 3: requiere pesos de texto Gemma 4 E2B específicos, y los nombres y formas de tensores son incompatibles con otras generaciones.
- La torre se distribuye sin cuantizar, lo que implica un mayor uso de memoria y almacenamiento en comparación con una versión cuantizada, aunque esto es deliberado para preservar la calidad de OCR.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y redistribución que deben revisarse antes de su implementación en producción.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas de este componente.
- Al ser un componente separado, el rendimiento final depende de la correcta integración con los pesos de texto del modelo Gemma 4 E2B; un emparejamiento incorrecto provocará errores de carga o resultados incoherentes.

## Enlaces

- HuggingFace: https://huggingface.co/Rybib/rytability-gemma4-vision
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
