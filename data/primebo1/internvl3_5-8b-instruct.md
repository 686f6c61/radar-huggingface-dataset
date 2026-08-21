# PrimeBo1/InternVL3_5-8B-Instruct

## Resumen

InternVL3.5-8B-Instruct es un modelo multimodal de visión-lenguaje (MLLM) perteneciente a la familia InternVL3.5, desarrollada por el laboratorio OpenGVLab. Esta versión concreta, publicada en Hugging Face por el usuario PrimeBo1, es un ajuste fino instruct sobre el checkpoint pretrained InternVL3_5-8B-Pretrained, y está diseñada para tareas de comprensión de imágenes, razonamiento visual y generación de texto guiada por instrucciones. El modelo combina un encoder de visión de aproximadamente 0.3 mil millones de parámetros con un modelo de lenguaje de 8.2 mil millones, sumando un total de 8.528.318.464 parámetros.

La relevancia de InternVL3.5 radica en su propuesta de *Cascade Reinforcement Learning* (Cascade RL), un esquema de entrenamiento en dos fases (offline y online) que mejora la estabilidad y el alineamiento del razonamiento, así como en el *Visual Resolution Router* (ViR), que ajusta dinámicamente la resolución de los tokens visuales para optimizar la inferencia sin sacrificar rendimiento. Según la documentación oficial, la familia InternVL3.5 logra hasta un +16.0% de mejora en tareas de razonamiento y una aceleración de 4.05× frente a InternVL3. El modelo soporta interacción con agentes GUI y capacidades de agente encarnado, lo que lo sitúa como una opción competitiva entre los MLLM de código abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de visión + LLM) |
| Parametros totales | 8.528.318.464 (8.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (sin lista especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

InternVL3.5-8B-Instruct sigue la arquitectura de la familia InternVL3.5: un encoder de visión (ViT) de 0.3B parámetros que procesa imágenes y las proyecta a un espacio de representación compartido con un modelo de lenguaje de 8.2B parámetros. El entrenamiento se realizó en dos etapas: primero un pretraining sobre el checkpoint base, y posteriormente un ajuste fino instruct utilizando los datasets OpenGVLab/MMPR-v1.2 y OpenGVLab/MMPR-Tiny. La innovación principal es el *Cascade RL*, que combina aprendizaje por refuerzo offline (para convergencia estable) y online (para alineamiento fino). Además, el *Visual Resolution Router* (ViR) permite seleccionar dinámicamente la resolución de los tokens visuales, reduciendo el coste computacional en inferencia. La estrategia *Decoupled Vision-Language Deployment* (DvD) separa el encoder de visión y el modelo de lenguaje en GPUs distintas, lo que facilita el despliegue en entornos con múltiples aceleradores. No se ha publicado el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Comprensión de imágenes y generación de texto descriptivo o respuestas a preguntas visuales.
- Razonamiento multimodal avanzado, incluyendo tareas de matemáticas visuales y lógica (según la documentación de la familia).
- Soporte de tool calling y function calling, lo que permite integrarlo en flujos de agentes.
- Capacidades de agente GUI: puede interpretar interfaces gráficas y ejecutar acciones simuladas.
- Capacidades de agente encarnado (embodied agency), orientadas a robótica o entornos simulados.
- Multilingüe, aunque no se especifican los idiomas concretos.
- No se ha confirmado soporte de audio, vídeo o modo de pensamiento explícito en esta versión.

## Casos de uso

- Análisis de imágenes industriales: el modelo puede inspeccionar fotografías de líneas de producción para detectar defectos o anomalías, gracias a su encoder de visión y su capacidad de razonamiento visual. Es adecuado por su tamaño contenido (8.5B) que permite despliegue en una GPU profesional.
- Agente de automatización de interfaces: gracias a su soporte de GUI interaction, puede interpretar capturas de pantalla y generar acciones (clic, escritura) para automatizar tareas repetitivas en aplicaciones de escritorio o web.
- Asistente de atención al cliente multimodal: puede recibir imágenes de productos, facturas o capturas de pantalla enviadas por usuarios y responder con texto en lenguaje natural, manteniendo conversaciones multi-turno.
- Generación de descripciones accesibles: útil para crear textos alternativos (alt text) de imágenes en plataformas web o documentos, reduciendo el trabajo manual de editores.
- Educación y tutoría visual: puede explicar diagramas, gráficos o problemas de geometría a estudiantes, combinando razonamiento matemático con comprensión de imágenes.
- Extracción de información de documentos escaneados: el modelo puede leer tablas, formularios o recibos en imágenes y estructurar la información en texto, facilitando su integración en pipelines de OCR y procesamiento documental.
- Prototipado de agentes de investigación: al soportar tool calling, puede usarse en entornos de investigación para combinar búsqueda web, análisis de imágenes y generación de informes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para InternVL3.5-8B-Instruct en la información disponible. La documentación de la familia menciona mejoras agregadas de hasta +16.0% en tareas de razonamiento y una aceleración de 4.05× frente a InternVL3, pero no se desglosan puntuaciones por benchmark (MMMU, MathVista, etc.) para este tamaño concreto. Se recomienda consultar el repositorio oficial de OpenGVLab para obtener tablas comparativas detalladas.

## Requisitos de hardware

- El tamaño del repositorio es de 17.1 GB, lo que sugiere que los pesos en precisión FP16 ocupan aproximadamente 17 GB. Una GPU con al menos 20 GB de VRAM sería necesaria para inferencia sin cuantización.
- Según la documentación oficial, los modelos de hasta 30B parámetros pueden desplegarse en una sola GPU A100 (80 GB). El modelo de 8B cabe holgadamente en una A100, y probablemente también en una RTX 4090 (24 GB) si se gestiona la memoria con cuidado.
- No se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) para este modelo concreto, por lo que no se puede confirmar su ejecución en GPUs de gama baja (8-12 GB).
- Opciones de despliegue compatibles: transformers (con custom code), vLLM y LMDeploy, según se indica en la documentación oficial.
- No se dispone de datos de latencia o throughput específicos para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL3.5-8B-Instruct (este) | 8.5B | no disponible | Apache 2.0 | Hugging Face |
| InternVL3-8B (predecesor) | 8.5B (estimado) | no disponible | Apache 2.0 | Hugging Face |
| Qwen2-VL-7B-Instruct | 7.6B | 32K (documentado) | Apache 2.0 | Hugging Face |
| LLaVA-NeXT-8B | 8B | 32K (documentado) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad. InternVL3.5-8B destaca por su enfoque en razonamiento multimodal y agentes, mientras que Qwen2-VL y LLaVA-NeXT tienen más documentación pública sobre benchmarks.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como todo MLLM, puede generar descripciones incorrectas o inventar detalles en imágenes ambiguas.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas de texto o múltiples imágenes.
- El repositorio concreto (PrimeBo1) tiene 0 descargas y 0 likes, y no está claro si es una subida oficial o una copia. Se recomienda verificar la autenticidad y usar la versión de OpenGVLab si se busca soporte oficial.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incluye código personalizado (custom_code) que debe revisarse para cumplir con los términos de redistribución.
- No se han publicado versiones cuantizadas, lo que limita su despliegue en hardware de consumo sin herramientas adicionales de conversión.
- El entrenamiento con Cascade RL puede introducir comportamientos de razonamiento no deterministas; se recomienda fijar semillas en producción.

## Enlaces

- Repositorio de Hugging Face (este modelo): https://huggingface.co/PrimeBo1/InternVL3_5-8B-Instruct
- Repositorio oficial de OpenGVLab (modelo base): https://huggingface.co/OpenGVLab/InternVL3_5-8B
- Repositorio oficial instruct: https://huggingface.co/OpenGVLab/InternVL3_5-8B-Instruct
- GitHub del proyecto InternVL: https://github.com/OpenGVLab/InternVL
- Blog de InternVL3.5: https://internvl.github.io/blog/
- Paper InternVL3.5 (arXiv 2508.18265): https://huggingface.co/papers/2508.18265
- Paper InternVL3 (arXiv 2504.10479): https://huggingface.co/papers/2504.10479
- Paper InternVL 2.5 (arXiv 2412.05271): https://huggingface.co/papers/2412.05271
- Paper InternVL 1.5 (arXiv 2404.16821): https://huggingface.co/papers/2404.16821
- Paper InternVL 1.0 (arXiv 2312.14238): https://huggingface.co/papers/2312.14238
- Paper InternVL2.5-MPO (arXiv 2411.10442): https://huggingface.co/papers/2411.10442
- Demo de chat: https://chat.intern-ai.org.cn/
- Documentación: https://internvl.readthedocs.io/en/latest/
