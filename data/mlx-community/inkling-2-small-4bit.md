# mlx-community/Inkling-2-Small-4bit

## Resumen

Inkling-2-Small-4bit es una cuantización en formato MLX del modelo multimodal Inkling-2-Small desarrollado por Thinking Machines. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con capacidad de entrada de texto e imagen (pipeline image-text-to-text) y un total de 126.230.587.392 parámetros. Esta versión concreta, publicada por la comunidad mlx-community, está pensada para ejecutarse en hardware Apple Silicon mediante la librería MLX, lo que la hace relevante para desarrolladores que quieren desplegar un modelo multimodal de gran tamaño en Macs con memoria unificada.

La conversión mantiene la torre de visión incluida y conserva la cuantización original de los expertos enrutados (NVFP4 con escala global por experto en las capas 0 a 39 y MXFP8 en las capas 40 a 47), mientras que los pesos de atención, embedding y cabeza de salida se cuantizan a 4 bits afines con tamaño de grupo 64. El router se mantiene en float32 y la torre de visión en bfloat16. El modelo base es thinkingmachines/Inkling-2-Small y la licencia es Apache 2.0.

Es relevante ahora porque permite ejecutar localmente en Apple Silicon un modelo MoE multimodal de más de 126 mil millones de parámetros en un formato de 4 bits, algo que hasta hace poco requería infraestructura de GPU dedicada. El repositorio ocupa 380,8 GB, lo que da una idea de la huella de memoria necesaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con torre de visión, transformer multimodal image-text-to-text |
| Parametros totales | 126.230.587.392 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (afín, group size 64) en atención/embedding/head; expertos enrutados en NVFP4 (capas 0-39) y MXFP8 (capas 40-47); visión en bfloat16; router en float32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts (MoE) con capacidad multimodal de entrada texto-imagen. La torre de visión está incluida en esta conversión, mientras que el draft DSpark (probablemente un modelo de decodificación especulativa) no se incluye. La cuantización de los expertos enrutados conserva el esquema original del modelo base: NVFP4 con una escala global por experto en las capas 0 a 39 y MXFP8 en las capas 40 a 47, lo que sugiere una mezcla de precisión por profundidad de capa. Los pesos de atención, embedding y cabeza de salida se cuantizan a 4 bits afines con group size 64, el router se mantiene en float32 y la torre de visión en bfloat16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card de esta conversión remite a la model card original, de la que no se proporcionan detalles en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes combinada con texto (image-text-to-text), con torre de visión incluida.
- Razonamiento y generación de texto en general (capacidades específicas no detalladas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: al ejecutarse con MLX en Apple Silicon, permite construir un asistente que recibe imágenes y texto (por ejemplo, capturas de pantalla o fotos) y responde en local, sin enviar datos a la nube, aprovechando la torre de visión incluida.
- Análisis de documentos con imágenes: el modelo puede procesar páginas escaneadas o capturas junto con preguntas en texto, útil para extracción de información en entornos con requisitos de privacidad.
- Prototipado de aplicaciones image-text-to-text: mediante `mlx_lm.server` y el envío de imágenes como partes `image_url` de un mensaje de chat, se puede montar rápidamente un endpoint local para probar flujos multimodales.
- Investigación en eficiencia de inferencia: al ser una cuantización 4-bit de un MoE de 126B, sirve para estudiar el comportamiento de esquemas NVFP4/MXFP8 en hardware Apple y comparar latencia y calidad frente al modelo original.
- Desarrollo de chatbots con contexto conversacional: el uso de `apply_chat_template` y la generación multi-turno permiten integrarlo en aplicaciones de chat locales para escritorio.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de una cuantización 4-bit frente al modelo base thinkingmachines/Inkling-2-Small en tareas de visión y texto.
- Despliegue en estaciones de trabajo Apple de gran memoria: equipos con memoria unificada elevada pueden alojar el modelo (repositorio de 380,8 GB) para tareas internas de análisis multimodal sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 380,8 GB, por lo que se necesita memoria unificada del orden de esa cifra (más overhead) para cargar los pesos completos. No se dispone de cifras oficiales de memoria pico durante la inferencia.
- GPU recomendadas: al ser un formato MLX, está orientado a Apple Silicon (chips de la serie M con memoria unificada). No se indica compatibilidad con A100, H100 ni RTX 4090 en la información disponible.
- ¿Cabe en consumer GPU? No hay datos que lo confirmen; por el tamaño del repositorio (380,8 GB) excede la VRAM de GPUs de consumo convencionales. En Apple Silicon requeriría configuraciones de memoria unificada muy alta.
- Opciones de despliegue: MLX (`mlx-lm`) con la rama del PR ml-explore/mlx-lm#2061; servidor local mediante `mlx_lm.server` para entrada de imágenes. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mlx-community/Inkling-2-Small-4bit | 126.230.587.392 | no disponible | MLX safetensors 4-bit | apache-2.0 | Conversión MLX con visión incluida; draft DSpark no incluido |
| thinkingmachines/Inkling-2-Small | no disponible (modelo base) | no disponible | safetensors original | apache-2.0 | Modelo original sin cuantizar |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es una conversión comunitaria: la calidad y el comportamiento pueden diferir del modelo original; conviene validar frente a thinkingmachines/Inkling-2-Small.
- El draft DSpark no está incluido, por lo que no se dispone de decodificación especulativa en esta versión.
- La cuantización 4-bit y los esquemas NVFP4/MXFP8 pueden introducir degradación de calidad respecto al modelo en precisión original; no se han publicado evaluaciones al respecto.
- Requiere una rama específica de mlx-lm (PR #2061); la instalación estándar puede no funcionar.
- Orientado a Apple Silicon (MLX); no es directamente desplegable en ecosistemas CUDA sin conversión adicional.
- Huella de memoria muy elevada (repositorio de 380,8 GB), lo que limita su uso a equipos con memoria unificada muy alta.
- Riesgo de alucinación y sesgos: no se dispone de información específica en la documentación proporcionada.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia y de los términos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Inkling-2-Small-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Pull request de mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2061
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
