# burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF-2026-08-28

## Resumen

El modelo `burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF-2026-08-28` es una variante cuantizada en formato GGUF del modelo base `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, que a su vez deriva de la familia Qwen3.6 de Alibaba. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token, lo que lo hace especialmente eficiente para inferencia en hardware de consumo. El desarrollador, `burningfeet`, ha combinado el comportamiento "uncensored" del base con las capacidades agentic y de function calling del finetune `DJLougen/hermes-qwen3.5-35b-a3b-GGUF`, transfiriendo alrededor de 2000 bloques de dos tensores de expertos FFN. El resultado es un modelo multimodal (imagen-texto) con licencia Apache 2.0, pensado para despliegue local mediante GGUF.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece una alternativa sin restricciones de contenido (uncensored) sobre una base técnica sólida como Qwen3.6; por otro, incorpora el protocolo Hermes para interacción agéntica y tool calling, lo que lo hace útil para asistentes conversacionales y agentes autónomos. Al estar disponible en GGUF, puede ejecutarse en GPUs de consumo con cuantizaciones adaptables, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal, transformer con atención sobre imagen y texto |
| Parametros totales | 34 660 610 688 (34,66 B) |
| Parametros activos | ~3 B (según vLLM recipes para Qwen3.6-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados (formato GGUF, se asume Q4, Q5, Q8, etc., pero no se listan) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repo también referencia safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de Qwen3.6-35B-A3B, que combina un transformer multimodal con mezcla de expertos. Según la documentación de vLLM, esta variante tiene 35B parámetros totales y 3B activos por token, lo que reduce significativamente el coste computacional en inferencia. El modelo acepta entradas de imagen y texto (pipeline `image-text-to-text`), lo que lo sitúa en la categoría de modelos multimodales.

El proceso de entrenamiento descrito por el autor consiste en una transferencia de conocimiento desde el finetune Hermes (`DJLougen/hermes-qwen3.5-35b-a3b-GGUF`) hacia el base uncensored de HauhauCS. Concretamente, se transfirieron alrededor de 2000 bloques de dos tensores de expertos FFN, preservando las capacidades agentic y de function calling del Hermes mientras se mantiene el comportamiento sin censura del base. El dataset `NousResearch/hermes-function-calling-v1` aparece en las etiquetas, lo que sugiere que se utilizó para el entrenamiento de tool calling. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: al ser un derivado de Qwen3.6, conserva las capacidades de comprensión y generación de lenguaje del modelo original, incluyendo tareas de razonamiento y matemáticas.
- Multimodalidad: acepta imágenes como entrada junto con texto, permitiendo descripción de imágenes, respuesta a preguntas visuales y otras tareas de visión por computador.
- Tool calling y function calling: gracias al dataset Hermes y al finetune transferido, el modelo puede invocar funciones externas de forma estructurada, lo que lo hace apto para integraciones con APIs y herramientas.
- Comportamiento agéntico: el protocolo Hermes permite interacciones multi-turno con planificación y ejecución de pasos, útil para agentes autónomos.
- Multilingüe: soporta inglés, chino y otros idiomas (etiqueta `multilingual`).
- Sin censura: el modelo está diseñado para no aplicar filtros de contenido, lo que permite generar respuestas sobre temas sensibles sin restricciones (con las advertencias correspondientes).

## Casos de uso

- Asistentes conversacionales locales sin censura: el modelo puede desplegarse en una GPU de consumo mediante GGUF para ofrecer un chatbot que no rechace preguntas sobre temas controvertidos, útil en entornos de investigación o desarrollo donde se requiere libertad de expresión.
- Agentes autónomos con tool calling: gracias al protocolo Hermes, puede integrarse en sistemas que necesitan consultar APIs, bases de datos o ejecutar acciones, como asistentes de productividad o automatización de tareas.
- Análisis de imágenes con texto: al ser multimodal, puede utilizarse para generar descripciones de imágenes, extraer información visual o responder preguntas sobre fotografías en aplicaciones de accesibilidad o documentación.
- Desarrollo de prototipos de chatbots empresariales: su licencia Apache 2.0 permite uso comercial, y su formato GGUF facilita la integración en frameworks como llama.cpp u Ollama para pruebas rápidas.
- Investigación en alineación y seguridad: al ser un modelo uncensored, puede servir como banco de pruebas para estudiar sesgos, alucinaciones o comportamientos no deseados en modelos sin filtros.
- Traducción y procesamiento multilingüe: con soporte para inglés, chino y otros idiomas, puede emplearse en pipelines de traducción automática o normalización de texto en entornos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otros estándares para esta variante específica. Se recomienda consultar los benchmarks del modelo base Qwen3.6-35B-A3B en la documentación oficial de Qwen para una referencia aproximada, aunque la transferencia de expertos y la cuantización GGUF pueden alterar el rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser un MoE con 3B activos, la memoria necesaria depende de la cuantización elegida. Para una cuantización Q4_K_M, el archivo GGUF podría ocupar entre 18 y 22 GB, lo que cabe en GPUs con 24 GB (RTX 3090, RTX 4090). Para Q8, podría superar los 30 GB, requiriendo GPUs profesionales.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 (40 GB o más) para cuantizaciones altas. En consumer, una RTX 3060 de 12 GB podría ejecutar cuantizaciones muy bajas (Q2, Q3) con pérdida de calidad.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y vLLM (con adaptadores). También puede usarse con TGI si se convierte a otro formato.
- Latencia y throughput: no se dispone de datos medidos. Dado que solo se activan 3B parámetros por token, la inferencia es significativamente más rápida que un modelo dense de 35B, pero la cuantización y el hardware influyen. En una RTX 4090, se podrían esperar decenas de tokens por segundo, aunque es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | Sí | Apache 2.0 | safetensors |
| Qwen3.6-27B (dense) | 27B | 27B | no disponible | Sí | Apache 2.0 | safetensors |
| Este modelo (GGUF) | 34,66B | ~3B | no disponible | Sí | Apache 2.0 | GGUF |

La comparativa se limita a la familia Qwen3.6, ya que no se dispone de datos de otros modelos comparables en la información proporcionada. La principal diferencia con el base es la cuantización GGUF y la transferencia de expertos Hermes, que añade capacidades de tool calling y comportamiento uncensored. Frente al 27B dense, este modelo ofrece menor coste de inferencia gracias a la activación selectiva de expertos, aunque el rendimiento bruto puede variar.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.
- Sin benchmarks publicados: no hay métricas objetivas de rendimiento para esta variante, lo que dificulta evaluar su calidad frente a otros modelos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Sesgos y contenido inapropiado: al ser uncensored, puede producir contenido ofensivo, ilegal o dañino. El uso en producción debe contemplar medidas de filtrado y moderación.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada; se recomienda verificar la documentación de Qwen3.6 para conocer el límite real.
- Dependencia del base: la transferencia de expertos puede haber introducido degradaciones en ciertas tareas no cubiertas por el dataset Hermes.
- Licencia Apache 2.0: permite uso comercial, pero se debe atribuir el copyright y mantener el aviso de licencia. No hay restricciones de uso, pero el modelo puede tener limitaciones legales en ciertos países por su naturaleza uncensored.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-GGUF-2026-08-28
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes de referencia: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Guía de Qwen3.6 (27B dense vs 35B-A3B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Recetas vLLM para Qwen3.6-35B-A3B: https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B
