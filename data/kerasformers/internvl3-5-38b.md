# kerasformers/internvl3.5-38b

## Resumen

InternVL3.5-38B es un modelo multimodal de gran tamaño (MLLM) desarrollado por el equipo OpenGVLab, que combina un codificador visual con un modelo de lenguaje de 38 mil millones de parámetros para procesar entradas de imagen y texto. Esta versión concreta, `kerasformers/internvl3.5-38b`, es una conversión pura a Keras 3 realizada por el proyecto KerasFormers, lo que permite ejecutar el mismo checkpoint en TensorFlow, PyTorch o JAX sin modificaciones. El modelo se distribuye con licencia Apache 2.0 y pesos en bfloat16, lo que facilita su integración en entornos de producción.

La relevancia de este lanzamiento radica en que InternVL3.5 introduce mejoras significativas en razonamiento multimodal, percepción visual y eficiencia de inferencia respecto a la generación anterior (InternVL3). Además, el modelo soporta tareas avanzadas como tool calling, agentes GUI y análisis de imágenes industriales, ampliando el espectro de aplicaciones más allá de la simple descripción de imágenes. La conversión a Keras 3 añade flexibilidad de backend, aunque el modelo base es el mismo que el de OpenGVLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL3.5 (codificador visual ViT + LLM nativo multimodal) |
| Parametros totales | 38 mil millones (38B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (según familia InternVL3.5) |
| Tipos de cuantizacion | bfloat16 (pesos oficiales); cuantizaciones adicionales no disponibles |
| Idiomas soportados | inglés (según model card); el modelo base InternVL3.5 soporta multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (safetensors en el repo, 76.9 GB) |

## Arquitectura y entrenamiento

InternVL3.5 mantiene la arquitectura híbrida de la serie InternVL: un codificador visual basado en ViT (Vision Transformer) conectado a un modelo de lenguaje multimodal nativo mediante un proyector. A diferencia de generaciones anteriores, InternVL3.5 integra el entrenamiento del codificador visual y el LLM de forma conjunta, lo que mejora la percepción visual y el razonamiento. El modelo de 38B es la variante densa de la familia, que incluye también versiones de 8B, 14B, 30B y 235B.

El entrenamiento se realizó en varias fases, incluyendo preentrenamiento multimodal con grandes volúmenes de datos de imagen-texto y un ajuste fino supervisado (SFT) con datos de instrucciones. Para la versión Flash (no la 38B estándar), se introdujo una etapa ligera llamada Visual Consistency Learning (ViCO) que reduce el coste de tokens por parche de imagen. El modelo base ha sido alineado con técnicas de preferencia (RLHF/DPO), aunque los detalles específicos de la variante 38B no se detallan en la información proporcionada. Los pesos se convirtieron a Keras 3 por el proyecto KerasFormers, que implementa la arquitectura completa en Keras con soporte para JAX, TensorFlow y PyTorch.

## Capacidades

- Generación de texto multimodal: procesa imágenes y texto para generar descripciones, responder preguntas visuales y mantener conversaciones multi-turno.
- Razonamiento visual avanzado: capaz de resolver tareas que requieren comprensión espacial, conteo de objetos y relaciones entre elementos de una imagen.
- Tool calling y function calling: soporta invocación de herramientas externas, lo que permite construir agentes que interactúan con APIs y servicios.
- Agentes GUI: puede interpretar capturas de pantalla y ejecutar acciones en interfaces gráficas, útil para automatización de tareas.
- Comprensión de documentos: analiza documentos escaneados, tablas, gráficos y diagramas complejos.
- Capacidades multilingües: aunque la model card indica inglés, el modelo base InternVL3.5 soporta múltiples idiomas (el README de KerasFormers no especifica restricciones).
- Análisis de imágenes industriales y 3D: según la documentación de InternVL3, incluye percepción 3D y análisis de imágenes técnicas.

## Casos de uso

- Automatización de atención al cliente: el modelo puede gestionar consultas que incluyen capturas de pantalla o fotos de productos, manteniendo contexto de 128K tokens para conversaciones largas y resolviendo incidencias sin intervención humana.
- Análisis de documentos empresariales: extrae información de facturas, contratos y formularios escaneados, estructurando los datos para su integración en sistemas ERP o CRM.
- Generación de código asistida por imágenes: a partir de un mockup o diagrama, el modelo puede generar código frontend o documentación técnica, reduciendo el tiempo de desarrollo.
- Agente de automatización de escritorio: con soporte de tool calling, puede operar aplicaciones GUI mediante capturas de pantalla, ejecutando tareas repetitivas como rellenar formularios o navegar por interfaces.
- Asistente para personas con discapacidad visual: describe el entorno, lee textos de imágenes y responde preguntas sobre el contenido visual en tiempo real, mejorando la accesibilidad.
- Moderación de contenido visual: analiza imágenes en plataformas sociales para detectar contenido inapropiado o que infrinja políticas, con capacidad de razonamiento contextual.
- Educación y tutoría: explica diagramas, gráficos científicos o problemas matemáticos presentados como imágenes, adaptándose al nivel del estudiante mediante conversación multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de KerasFormers no incluye métricas comparativas, y la documentación del modelo base OpenGVLab no detalla puntuaciones específicas para la variante 38B en los materiales consultados. Para datos de rendimiento, se recomienda consultar el blog oficial de InternVL3.5 o los papers asociados (arXiv:2504.10479 y arXiv:2508.18265).

## Requisitos de hardware

- VRAM estimada: el checkpoint en bfloat16 ocupa aproximadamente 76 GB, por lo que se necesitan al menos 80 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: según OpenGVLab, el modelo de 38B requiere dos GPU A100 (80 GB) para despliegue; también es viable con H100 o GPU equivalentes.
- Consumer GPU: no es viable en GPU de consumo (RTX 4090 tiene 24 GB, insuficiente incluso con cuantización agresiva).
- Opciones de despliegue: vLLM y LMDeploy son compatibles según la documentación oficial; también se puede usar Keras 3 directamente con JAX/TensorFlow/PyTorch.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL3.5-38B (este) | 38B | 128K | Apache 2.0 | HuggingFace, Keras 3 |
| InternVL3-38B | 38B | 128K | MIT | HuggingFace, transformers |
| Qwen2.5-VL-32B | 32B | 128K | Apache 2.0 | HuggingFace, vLLM |
| Llama 3.2 11B Vision | 11B | 128K | Llama 3.2 Community | HuggingFace |

La comparativa se basa en especificaciones públicas. InternVL3.5-38B destaca por su integración con Keras 3 y su licencia permisiva, mientras que Qwen2.5-VL ofrece un tamaño menor con capacidades similares. Llama 3.2 Vision es más ligero pero con menor rendimiento multimodal en tareas complejas. No se dispone de datos de benchmarks para una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo multimodal, puede generar descripciones inexactas o inventar detalles no presentes en la imagen, especialmente en escenarios ambiguos.
- Idioma: la model card indica únicamente inglés; aunque el modelo base soporta más idiomas, la conversión de KerasFormers no garantiza el mismo rendimiento multilingüe.
- Requisitos de hardware: el tamaño de 38B limita su despliegue a entornos con GPU profesionales (A100/H100), excluyendo hardware de consumo.
- Conversión de pesos: al ser una conversión de Keras 3, puede haber ligeras diferencias numéricas respecto al checkpoint original de PyTorch, aunque los pesos se almacenan en bfloat16.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de los términos del modelo base OpenGVLab.
- Contexto largo: aunque soporta 128K tokens, el rendimiento degrada con contextos extremadamente largos y el coste computacional aumenta proporcionalmente.

## Enlaces

- [Modelo en HuggingFace (kerasformers/internvl3.5-38b)](https://huggingface.co/kerasformers/internvl3.5-38b)
- [Modelo base (OpenGVLab/InternVL3_5-38B-HF)](https://huggingface.co/OpenGVLab/InternVL3_5-38B-HF)
- [Repositorio KerasFormers en GitHub](https://github.com/IMvision12/KerasFormers)
- [Documentación de InternVL en KerasFormers](https://imvision12.github.io/KerasFormers/internvl/)
- [Colección InternVL de KerasFormers en HuggingFace](https://huggingface.co/collections/kerasformers/internvl-6a8277076dbb163f53241dbd)
- [Blog oficial de InternVL3.5](https://internvl.github.io/blog/2025-08-26-InternVL-3.5/)
- [Blog oficial de InternVL3](https://internvl.github.io/blog/2025-04-11-InternVL-3.0/)
- [Repositorio GitHub de InternVL](https://github.com/OpenGVLab/InternVL)
- [Paper: InternVL (arXiv:2312.14238)](https://arxiv.org/abs/2312.14238)
- [Paper: InternVL 1.5 (arXiv:2404.16821)](https://arxiv.org/abs/2404.16821)
- [Paper: InternVL 2 (arXiv:2411.10442)](https://arxiv.org/abs/2411.10442)
- [Paper: InternVL 2.5 (arXiv:2412.05271)](https://arxiv.org/abs/2412.05271)
- [Paper: InternVL 3 (arXiv:2504.10479)](https://arxiv.org/abs/2504.10479)
- [Paper: InternVL 3.5 (arXiv:2508.18265)](https://arxiv.org/abs/2508.18265)
