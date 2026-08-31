# NGARiAI/qwen3.8-27B

## Resumen

El modelo NGARiAI/qwen3.8-27B es una adaptación del modelo Qwen3.8-27B de Alibaba, optimizada para ejecución en hardware de borde (edge) de la marca NGARi, concretamente en el dispositivo Orin 64GB. Se trata de un modelo denso de 27 mil millones de parámetros con arquitectura híbrida de atención (16 capas con atención completa y 48 con atención lineal de estado recurrente), diseñado para tareas de codificación, agentes y automatización de oficina. La versión publicada en HuggingFace está cuantizada a 4 bits (Q4_K_M) y se distribuye para su uso mediante Ollama, con un enfoque de "soberanía de IA" que garantiza inferencia local sin dependencia de la nube.

La relevancia de este modelo radica en su capacidad para ejecutarse en hardware de consumo con solo 16 GB de VRAM, ofreciendo un rendimiento comparable a modelos mucho más grandes en tareas de programación y razonamiento. Su arquitectura híbrida reduce el coste computacional de la atención, permitiendo ventanas de contexto largas sin sacrificar calidad. Aunque la ficha de HuggingFace no proporciona detalles sobre licencia o idiomas, la documentación del autor indica un kernel Apache 2.0 y un despliegue completamente local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas con atención completa (full attention) y 48 capas con atención lineal de estado recurrente |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se espera al menos 128K tokens, pero no confirmado) |
| Tipos de cuantizacion | Q4_K_M (mencionado en la model card); posiblemente también AWQ 4-bit |
| Idiomas soportados | No disponible (el modelo original de Qwen soporta múltiples idiomas, pero no se especifica para esta versión) |
| Licencia | No disponible en HuggingFace; la model card menciona "Apache 2.0 kernel" pero no aclara la licencia del modelo |
| Formato de pesos | GGUF (para uso con Ollama) y posiblemente safetensors; no confirmado |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8, que introduce una mezcla de capas de atención: de las 64 capas totales, solo 16 utilizan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes emplean atención lineal con un estado recurrente constante. Este diseño reduce la complejidad computacional de O(n²) a O(n) en la mayoría de las capas, permitiendo procesar secuencias largas con menor uso de memoria y mayor velocidad de inferencia. El modelo es multimodal, acepta tanto texto como imágenes como entrada.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card de NGARiAI no proporciona estos datos, y la documentación oficial de Qwen3.8 tampoco está disponible en los resultados de búsqueda. Se sabe que el modelo está diseñado para tareas de codificación, agentes y automatización, lo que sugiere un entrenamiento enfocado en estos dominios.

## Capacidades

- Generación de texto y razonamiento complejo, con modo "thinking" (pensamiento) y modo instructivo.
- Codificación de nivel avanzado, comparable a modelos de mayor tamaño (según reseñas, "Opus-level coding performance").
- Soporte de tool calling y function calling para integración con APIs y herramientas externas.
- Capacidades de agente: ejecución de tareas de larga duración (long-horizon) con múltiples pasos.
- Multimodal: procesa imágenes y texto, lo que permite tareas de visión por computador (OCR, descripción de imágenes, etc.).
- Multilingüe: aunque no se especifica para esta versión, el modelo base de Qwen soporta numerosos idiomas.
- Optimizado para despliegue en hardware de borde con cuantización 4-bit, manteniendo un rendimiento útil.

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y depurar código en tiempo real dentro de un IDE, aprovechando su capacidad de codificación y su ejecución en hardware propio sin enviar datos a la nube.
- Automatización de oficina: procesamiento de documentos, generación de informes, resumen de correos electrónicos y creación de presentaciones, todo ejecutado localmente para cumplir requisitos de confidencialidad.
- Agente de atención al cliente: con soporte de tool calling, puede gestionar conversaciones multi-turno, consultar bases de datos internas y ejecutar acciones (como actualizar registros) sin depender de servicios externos.
- Análisis de imágenes en entornos industriales: gracias a su capacidad multimodal, puede inspeccionar imágenes de productos, leer etiquetas o verificar documentos escaneados en una línea de producción.
- Desarrollo de agentes autónomos: su capacidad de razonamiento multi-paso y uso de herramientas lo hace adecuado para construir agentes que planifican y ejecutan tareas complejas (por ejemplo, gestión de calendario, envío de correos, búsqueda de información).
- Despliegue en entornos con requisitos de soberanía de datos: instituciones gubernamentales o empresas con políticas estrictas de privacidad pueden ejecutar el modelo en hardware propio, garantizando que ningún dato sale del perímetro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La reseña de Geeky Gadgets menciona "rendimiento de codificación de nivel Opus" y la documentación de Groq indica "capacidades de codificación agéntica de vanguardia", pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.). Por tanto, no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB con cuantización Q4_K_M (según la model card).
- GPU recomendadas: NGARi Orin 64GB (hardware específico de borde); también compatible con AMD Ryzen AI Max y GPUs Radeon según el blog de AMD.
- Puede ejecutarse en GPUs de consumo con 16 GB de VRAM, como RTX 4080/4090, aunque no se confirma oficialmente.
- Opciones de despliegue: Ollama (comando `ollama run qwen3.8:27b`), vLLM (según recetas de vLLM), y posiblemente llama.cpp.
- Latencia y throughput: no disponibles; se espera que la arquitectura híbrida ofrezca menor latencia que un transformer denso completo, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (NGARiAI) | 27B | No disponible | Híbrida (full + linear attention) | No disponible | HuggingFace, Ollama |
| Qwen2.5-27B (original) | 27B | 128K | Transformer denso estándar | Apache 2.0 | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Transformer denso | Llama 3.1 license | HuggingFace |
| Mixtral 8x7B | 47B (MoE) | 32K | MoE | Apache 2.0 | HuggingFace |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo NGARiAI. Se espera que supere a Qwen2.5-27B en tareas de codificación y agentes, pero no hay evidencia cuantitativa. La licencia del modelo original de Qwen3.8 es Apache 2.0, pero la adaptación de NGARiAI no especifica su licencia.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones específicas de esta versión; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- La licencia del modelo no está clara: aunque la model card menciona "Apache 2.0 kernel", no se especifica si el modelo en sí está bajo esa licencia. Esto puede afectar al uso comercial.
- La cuantización Q4_K_M puede degradar ligeramente la calidad en tareas de razonamiento complejo o generación de código largo, en comparación con el modelo en precisión completa.
- El modelo está optimizado para hardware NGARi Orin; su rendimiento en otras GPUs puede variar y no está garantizado.
- No se han publicado benchmarks oficiales, por lo que las afirmaciones de rendimiento ("nivel Opus") provienen de reseñas no verificadas.
- La ventana de contexto no está confirmada; si es inferior a 128K, podría limitar casos de uso con documentos muy largos.

## Enlaces

- HuggingFace: https://huggingface.co/NGARiAI/qwen3.8-27B
- GitHub (Qwen3.8-27B oficial): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- GroqDocs (model card): https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Blog de AMD (ejecución en Ryzen AI Max): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Reseña de Geeky Gadgets: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
