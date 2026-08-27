# Atomic-Germ/Qwable-Claude-Fable-5-Distilled-NPU2

## Resumen

Qwable-Claude-Fable-5-Distilled-NPU2 es una conversión cuantizada en formato Q4NX del modelo `empero-ai/Qwable-9B-Claude-Fable-5`, realizada por Atomic-Germ para su ejecución en NPU AMD XDNA mediante el runtime FastFlowLM (FLM). El modelo original es una destilación de Claude Fable-5, un modelo de Anthropic que estuvo brevemente disponible públicamente, sobre una base Qwen3.5. Esta versión cuantizada reduce los pesos a 7,11 GB y está optimizada para inferencia en hardware de bajo consumo, manteniendo la modalidad imagen-texto (visión y lenguaje).

La relevancia de esta ficha radica en que permite ejecutar un modelo derivado de Claude Fable-5 en dispositivos con NPU AMD, un segmento emergente en el despliegue de IA en el borde. El modelo base tiene 8,95 mil millones de parámetros, aunque el nombre comercial indica 9B. No se dispone de información sobre la longitud de contexto, licencia o idiomas soportados, por lo que estos datos se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base Qwen3.5, sin detalle) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (no se indica MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (mezcla Q8_0 / Q4_1 / BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | Q4NX (`model.q4nx`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo base. Según los metadatos, el modelo original `empero-ai/Qwable-9B-Claude-Fable-5` es una destilación de Claude Fable-5, entrenado mediante fine-tuning completo (full-fine-tune) sobre trazas de agentes de Claude Fable-5, utilizando los datasets `Glint-Research/Fable-5-traces` y `Roman1111111/gpt5.5-terminal`. El proceso de destilación se realizó con TRL (Transformers Reinforcement Learning). Esta versión concreta es una cuantización Q4NX compilada para FastFlowLM, que no modifica los pesos originales sino que los reempaqueta en un formato optimizado para NPU AMD XDNA. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, basado en la destilación de Claude Fable-5.
- Procesamiento de imágenes (modalidad image-text-to-text), con un módulo de visión separado (`vision_weight.q4nx`).
- Capacidades de codificación agéntica (tag `agentic-coding`), lo que sugiere soporte para tareas de razonamiento multi-paso y uso de herramientas, aunque no se especifica explícitamente tool calling.
- Conversación multimodal, según el tag `conversational`.
- Compatible con el runtime FastFlowLM para NPU AMD XDNA.

## Casos de uso

- Inferencia en dispositivos con NPU AMD XDNA (portátiles, mini-PCs, edge): el modelo está compilado para FastFlowLM, lo que permite ejecutar un LLM multimodal de 9B en hardware de bajo consumo sin necesidad de GPU dedicada.
- Asistente de visión en el borde: gracias a su modalidad imagen-texto, puede utilizarse para describir imágenes, responder preguntas visuales o procesar documentos escaneados en entornos sin conexión a la nube.
- Desarrollo de agentes de codificación en entornos restringidos: su origen en trazas de Claude Fable-5 y el tag `agentic-coding` lo hacen adecuado para prototipos de asistentes de programación que requieran razonamiento multi-paso, siempre que se ejecute en hardware compatible.
- Evaluación de modelos destilados en hardware alternativo: sirve como banco de pruebas para comparar el rendimiento de destilaciones de Claude Fable-5 en NPU frente a GPU o CPU.
- Aplicaciones de conversación multimodal en tiempo real: su tamaño reducido (7,11 GB) permite cargarlo en memoria de dispositivos con 16 GB de RAM, facilitando chatbots con entrada de imagen.
- Investigación sobre cuantización para NPU: el formato Q4NX y el flujo de instalación con `flm-add` documentan un caso práctico de despliegue de modelos cuantizados en aceleradores AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo ni para su versión base.

## Requisitos de hardware

- NPU AMD XDNA (por ejemplo, Ryzen AI) con soporte para FastFlowLM 1.0.1.
- Peso del modelo: 7,11 GB en formato Q4NX, más el módulo de visión (`vision_weight.q4nx`), por lo que se recomienda al menos 16 GB de RAM unificada o VRAM.
- No es compatible con GPU NVIDIA o AMD convencionales; requiere el runtime FastFlowLM y el instalador `flm-add`.
- Instalación: `pip install flm-add` o `uv tool install flm-add`, seguido de `flm-add Atomic-Germ/Qwable-Claude-Fable-5-Distilled-NPU2 --family qwen3.5 --tag qwable-claude-fable-5-distilled:9b`.
- Ejecución: `FLM_CONFIG_PATH="$HOME/.config/flm/model_list.json" FLM_XCLBIN_PATH="$HOME/.config/flm" flm run qwable-claude-fable-5-distilled:9b`.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwable-Claude-Fable-5-Distilled-NPU2 (este) | 8,95B | no disponible | texto + imagen | no disponible | Q4NX (FLM) |
| empero-ai/Qwable-9B-Claude-Fable-5 (base) | 8,95B | no disponible | texto + imagen | no disponible | safetensors (presumible) |
| lordx64/Qwable-v1 | 35B (A3B MoE) | no disponible | texto (presumible) | no disponible | no disponible |

La comparativa se limita a los modelos relacionados encontrados en la búsqueda. Qwable-v1 es una destilación de mayor tamaño (35B con 3B activos) y no es directamente comparable en requisitos de hardware. No se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, lo que supone un riesgo legal para despliegues en producción.
- Modelo destilado: al ser una destilación de Claude Fable-5, puede presentar alucinaciones o degradación de calidad en tareas complejas respecto al modelo original.
- Dependencia de hardware específico: solo funciona en NPU AMD XDNA con FastFlowLM; no es portable a GPU o CPU sin una conversión adicional.
- Sin información sobre contexto: se desconoce la longitud máxima de entrada, lo que limita su uso en tareas que requieran ventanas largas.
- Idiomas no especificados: no se garantiza soporte multilingüe más allá del inglés (presumible, pero no confirmado).
- Repositorio sin descargas ni valoraciones: al ser una publicación reciente (agosto de 2026) y sin comunidad, no hay validación externa de su funcionamiento.
- El modelo base fue entrenado con trazas de un modelo suspendido por directivas de control de exportación de EE. UU., lo que podría implicar restricciones legales adicionales en ciertas jurisdicciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atomic-Germ/Qwable-Claude-Fable-5-Distilled-NPU2
- Modelo base: https://huggingface.co/empero-ai/Qwable-9B-Claude-Fable-5
- Qwable-v1 (destilación relacionada): https://huggingface.co/lordx64/Qwable-v1
- Noticia sobre Qwable-v1: https://tools4all.ai/trends/qwable-v1-released-as-claude-fable-5-distillation
- Artículo sobre la destilación de Claude Fable 5: https://claudepractice.com/news/claude-fable-5-distilled
