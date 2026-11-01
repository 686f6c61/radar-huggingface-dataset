# polen-studio/gemma-4-e4b-it-4bit

## Resumen

`polen-studio/gemma-4-e4b-it-4bit` es una conversión a formato MLX y cuantización de 4 bits del modelo multimodal `google/gemma-4-E4B-it`, publicada por el usuario polen-studio. El repositorio es una copia sin modificaciones del artefacto `mlx-community/gemma-4-e4b-it-4bit`, empaquetada para su uso dentro de la aplicación Cabin. Su propósito es permitir la inferencia de un modelo de imagen-texto-a-texto de la familia Gemma 4 en hardware Apple Silicon mediante la librería `mlx-vlm`.

El modelo base pertenece a la cuarta generación de Gemma, la familia de modelos abiertos de Google. La variante "E4B" hace referencia a una configuración de aproximadamente 4.000 millones de parámetros efectivos, aunque el checkpoint en safetensors declara 7.941.100.874 parámetros totales, lo que sugiere una arquitectura con parámetros compartidos o un recuento que incluye componentes adicionales del pipeline multimodal. La cuantización a 4 bits reduce el peso del repositorio a 5,2 GB.

La relevancia de esta ficha es doble: por un lado, documenta una ruta práctica para ejecutar un modelo multimodal de Gemma 4 en Mac con memoria unificada; por otro, advierte de que se trata de un artefacto derivado, con pocas descargas y sin model card propia más allá de las instrucciones de uso, por lo que la información técnica disponible sobre el entrenamiento y los benchmarks es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Gemma 4; detalles internos no disponibles |
| Parametros totales | 7.941.100.874 (según safetensors); variante E4B con aproximadamente 4.000 millones de parámetros efectivos |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (variante publicada); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de licencia de Google para Gemma); el README menciona además Apache 2.0 para el artefacto copiado, lo que genera ambigüedad |
| Formato de pesos | safetensors en formato MLX (`mlx`, `mlx-vlm`) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` es un modelo multimodal de la familia Gemma 4, diseñado para tareas de imagen-texto-a-texto. La nomenclatura "E4B" indica una configuración de aproximadamente 4.000 millones de parámetros efectivos, mientras que el recuento real de safetensors asciende a 7.941.100.874 parámetros, probablemente porque incluye el codificador visual y otros componentes del pipeline. No se dispone de información detallada sobre el número de capas, la dimensionalidad, el mecanismo de atención ni la composición exacta del dataset de entrenamiento en la información proporcionada.

El artefacto aquí documentado no introduce cambios arquitectónicos: es una conversión del checkpoint original a formato MLX mediante `mlx_vlm.convert`, seguida de una cuantización a 4 bits. La revisión de origen citada es `fee6332c1abaafb77f6f9624236c63aa2f1d0187`. No se documentan procesos de RLHF, DPO ni innovaciones técnicas adicionales en la model card del repositorio derivado; cualquier detalle sobre el entrenamiento del modelo original debe consultarse en la documentación oficial de Google.

## Capacidades

- Generación de texto conversacional a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Comprensión de imágenes: descripción de contenido visual, respuesta a preguntas sobre imágenes y tareas de grounding visual básico.
- Conversación multi-turno, según la etiqueta `conversational` del repositorio.
- Ejecución local en Apple Silicon mediante `mlx-vlm`, con soporte de cuantización de 4 bits para reducir el uso de memoria.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Descripción de imágenes en local: el modelo puede procesar una imagen y generar una descripción textual detallada, adecuado para aplicaciones de accesibilidad o catalogación de fotos que deban ejecutarse sin conexión en un Mac.
- Asistente visual para aplicaciones de escritorio: integrado mediante `mlx-vlm` en una app macOS, permite responder preguntas sobre capturas de pantalla o documentos escaneados sin enviar datos a la nube.
- Prototipado rápido de pipelines multimodales: al ser una conversión MLX lista para usar, sirve para validar flujos de imagen-texto en entornos de desarrollo con Apple Silicon antes de migrar a infraestructura de servidor.
- Análisis de documentos con imágenes: extracción de información de formularios, recibos o gráficos simples en un flujo conversacional, aprovechando la modalidad image-text-to-text.
- Educación y demostraciones: ejecución de un modelo Gemma 4 multimodal en portátiles Mac para talleres, cursos o demos donde no se dispone de GPU dedicada.
- Investigación sobre cuantización: comparación del comportamiento de la variante 4 bits frente al modelo original en tareas de percepción visual, útil para estudiar la degradación introducida por la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un formato MLX para Apple Silicon, el modelo utiliza memoria unificada. Con 5,2 GB de pesos en 4 bits, se recomienda un mínimo de 8 GB de memoria unificada, y 16 GB para trabajar con imágenes de resolución alta y contextos largos.
- GPU recomendadas: chips Apple M1, M2, M3 y M4 con al menos 8 GB de memoria unificada; se obtiene mejor rendimiento en variantes Pro, Max y Ultra por su mayor ancho de banda de memoria.
- Compatibilidad con GPU de consumo: no está pensado para GPU NVIDIA o AMD; el formato MLX es específico de Apple Silicon. Para CUDA sería necesario usar el checkpoint original en safetensors o una conversión GGUF.
- Opciones de despliegue: `mlx-vlm` es la vía documentada; el comando de ejemplo es `python -m mlx_vlm.generate --model mlx-community/gemma-4-e4b-it-4bit --prompt "Describe this image." --image path/to/image.jpg`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| polen-studio/gemma-4-e4b-it-4bit | 7.941.100.874 (E4B efectivos) | no disponible | Imagen-texto-a-texto | Gemma | MLX safetensors 4 bits |
| google/gemma-4-E4B-it | aproximadamente 4.000 millones efectivos | no disponible | Imagen-texto-a-texto | Gemma | safetensors |
| mlx-community/gemma-4-e4b-it-4bit | idéntico al artefacto documentado | no disponible | Imagen-texto-a-texto | Gemma | MLX safetensors 4 bits |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para confrontarlo con alternativas de otros fabricantes. El artefacto de polen-studio es funcionalmente equivalente a la versión de mlx-community, de la que es una copia sin cambios.

## Limitaciones y advertencias

- Artefacto derivado y de bajo uso: 20 descargas y 0 likes en el momento de la consulta, sin model card propia más allá de las instrucciones de uso; no hay validación comunitaria del comportamiento del modelo cuantizado.
- Ambigüedad de licencia: la etiqueta del repositorio indica `license:gemma`, mientras que el README afirma "License: Apache 2.0 (see LICENSE)". Es imprescindible verificar los términos aplicables antes de un uso comercial, ya que la licencia Gemma impone restricciones específicas de uso aceptable.
- Cuantización a 4 bits: puede degradar la precisión en tareas de percepción visual fina, OCR o razonamiento complejo respecto al checkpoint original en precisión completa.
- Exclusividad de plataforma: el formato MLX solo funciona en Apple Silicon; no es portable a CUDA ni a CPU convencional sin reconversión.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos generativos, especialmente en descripciones de imágenes ambiguas o con texto pequeño; conviene validar las salidas en aplicaciones críticas.
- Contexto máximo no disponible: impide planificar casos de uso con documentos o conversaciones largas.
- Sin datos de benchmarks: no hay evidencia publicada sobre la calidad del modelo cuantizado frente a alternativas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/polen-studio/gemma-4-e4b-it-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Artefacto original de mlx-community: https://huggingface.co/mlx-community/gemma-4-e4b-it-4bit
- Revisión concreta copiada: https://huggingface.co/mlx-community/gemma-4-e4b-it-4bit/tree/475b9088d29754a3379866cf5aeb6b41acd313c2
- Librería mlx-vlm: no disponible en la información proporcionada
