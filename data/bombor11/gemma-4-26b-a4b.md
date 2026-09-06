# bombor11/gemma-4-26B-A4B

## Resumen

El modelo `bombor11/gemma-4-26B-A4B` es una subida de la variante MoE de 26B de la familia Gemma 4, desarrollada por Google DeepMind. Se trata de un modelo multimodal que procesa texto e imagen y genera texto, con una arquitectura híbrida de Mixture-of-Experts (MoE) y atención combinada de ventana deslizante y global. La versión original de Google DeepMind está pensada para ofrecer un equilibrio entre rendimiento y eficiencia, activando solo 3.8B de sus 25.2B parámetros durante la inferencia, lo que la hace adecuada para despliegues en GPUs de consumo y estaciones de trabajo.

El modelo destaca por su ventana de contexto de 256K tokens, su soporte nativo de system prompt y function calling, y sus capacidades de razonamiento con modos de pensamiento configurables. Además, mantiene soporte multilingüe en más de 140 idiomas. La licencia Apache 2.0 permite su uso comercial, y el modelo está disponible en formato safetensors, con un tamaño de repositorio de 51.6 GB.

Cabe señalar que el repositorio de HuggingFace pertenece al usuario `bombor11`, no a Google DeepMind, aunque la model card incluida es la oficial de Google. Es recomendable verificar la integridad de los pesos antes de su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) con atención híbrida (ventana deslizante + global) |
| Parámetros totales | 25.805.936.206 (según safetensors; la model card indica 25.2B) |
| Parámetros activos | 3.8B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | No especificados en la información disponible |
| Idiomas soportados | Más de 140 idiomas (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 30 capas, 128 expertos totales más 1 compartido, de los cuales se activan 8 durante cada token. La atención es híbrida: intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global, garantizando que la última capa sea siempre global. Las capas globales utilizan claves y valores unificados y aplican RoPE proporcional (p-RoPE) para optimizar la memoria en contextos largos.

En cuanto a las modalidades, el modelo 26B A4B procesa texto e imagen mediante un codificador visual de aproximadamente 550M parámetros. La model card no detalla la composición del dataset de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. Entre las innovaciones destacadas se encuentran el soporte nativo para el rol `system`, el function calling nativo y los modos de pensamiento configurables para razonamiento.

## Capacidades

- Generación de texto, razonamiento y codificación con modos de pensamiento configurables.
- Comprensión multimodal de texto e imagen, con soporte de relación de aspecto variable y resolución.
- Soporte nativo de function calling / tool calling para agentes autónomos.
- Capacidades agenticas de razonamiento multi-paso.
- Soporte multilingüe en más de 140 idiomas.
- Ventana de contexto de 256K tokens para tareas de contexto largo.
- Soporte nativo de system prompt para conversaciones estructuradas y controlables.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens, y su soporte de system prompt permite definir el tono y las reglas del agente de forma nativa.
- **Análisis de documentos con imágenes**: al ser multimodal, puede procesar facturas, informes o capturas de pantalla y generar resúmenes textuales, combinando comprensión visual y lingüística.
- **Generación de código en producción**: con soporte de function calling, puede integrarse en pipelines de CI/CD para generar, revisar o explicar código, y conectarse a herramientas externas mediante llamadas a funciones.
- **Agentes autónomos de razonamiento multi-paso**: su arquitectura MoE y sus modos de pensamiento configurables permiten descomponer tareas complejas en pasos intermedios, manteniendo el contexto a lo largo de la interacción.
- **Asistentes multilingües**: con soporte para más de 140 idiomas, puede desplegarse como asistente en aplicaciones globales, adaptando el idioma de forma dinámica según el usuario.
- **Resolución de problemas matemáticos y técnicos**: su capacidad de razonamiento con modos de pensamiento permite abordar problemas de matemáticas, física o ingeniería, generando explicaciones paso a paso.
- **Despliegue en estaciones de trabajo**: al activar solo 3.8B parámetros, es viable ejecutarlo en GPUs de consumo con cuantización, permitiendo prototipado y desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 51.6 GB, lo que sugiere que los pesos en precisión completa (probablemente FP16) requieren en torno a 52 GB de VRAM para cargar todos los parámetros. Con cuantización no especificada, la VRAM necesaria sería menor.
- GPU recomendadas: para cargar todos los pesos en FP16 se necesitan al menos 52 GB de VRAM, por lo que se recomiendan GPUs con 80 GB, como A100 80GB o H100 80GB. Para cuantización a 4 bits, una RTX 4090 de 24 GB podría ser suficiente, aunque no hay datos oficiales que lo confirmen.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con la librería Transformers, puede desplegarse con vLLM, TGI o directamente con Transformers. No se indica disponibilidad de formato GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas oficiales en la información proporcionada. Como referencia, otros modelos MoE open source de tamaño similar incluyen Mixtral 8x7B (46.7B parámetros totales, 12.9B activos) y DeepSeek-V2-Lite (15.7B totales, 2.4B activos). Sin embargo, no hay datos de rendimiento comparativos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: inherente a todos los modelos generativos; se recomienda validar las salidas en aplicaciones críticas.
- Limitaciones de contexto o idioma: aunque soporta más de 140 idiomas, el rendimiento puede variar según el idioma y la tarea.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos específicos de la licencia de Gemma 4 (enlace en la model card) para confirmar obligaciones adicionales.
- Procedencia del repositorio: la subida en HuggingFace es de un usuario (`bombor11`), no del equipo oficial de Google DeepMind. Verificar la autenticidad e integridad de los pesos antes de su uso en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bombor11/gemma-4-26B-A4B
- Model card oficial de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Colección oficial de Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Technical Report (arXiv): https://arxiv.org/abs/2607.02770
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
