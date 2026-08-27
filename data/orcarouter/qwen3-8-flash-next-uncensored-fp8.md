# orcarouter/Qwen3.8-Flash-Next-Uncensored-FP8

## Resumen

El modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored-FP8` es una versión "abliterated" (desensibilizada) del modelo base Qwen/Qwen3.8-Flash-Next, desarrollada por el usuario orcarouter. Se trata de un modelo de lenguaje multimodal de tipo MoE (Mixture of Experts) con aproximadamente 180.000 millones de parámetros totales, de los cuales solo 6.000 millones se activan por token, lo que lo hace computacionalmente eficiente para su tamaño. Está diseñado para eliminar los rechazos excesivos (over-refusal) típicos de los modelos alineados, manteniendo las capacidades completas del modelo original, incluyendo visión, razonamiento, tool calling y modo de pensamiento.

La relevancia de este modelo radica en su doble naturaleza: por un lado, hereda la arquitectura de próxima generación de Qwen (preview de Qwen4) con innovaciones en atención, residuales, embeddings y optimización; por otro, ofrece una versión sin censura que resulta útil para tareas de red-teaming, investigación en seguridad de IA y aplicaciones que requieren respuestas sin restricciones artificiales. El modelo está cuantizado en FP8 (block-FP8), lo que reduce su huella de memoria respecto a la versión original, y se distribuye bajo licencia Apache 2.0, aunque su acceso en HuggingFace está restringido (gated) y requiere aceptar condiciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (GDN + QSA), preview de Qwen4 |
| Parametros totales | 179.999.981.459 (aprox. 180B) |
| Parametros activos | 6B (por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (block-FP8), GGUF (disponible en versiones locales) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también GGUF para llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next introduce una arquitectura híbrida que combina atención GDN (Gated Delta Network) con QSA (Quadratic Self-Attention), junto con mejoras en los residuales, embeddings y la optimización del entrenamiento. Según la documentación oficial, esta actualización mejora la capacidad del modelo a la vez que optimiza la eficiencia computacional, la capacidad de almacenamiento y la estabilidad del entrenamiento. El modelo principal tiene 125.000 millones de parámetros, complementados con 51.000 millones de parámetros adicionales en embeddings N-gram, sumando un total de 180.000 millones, con solo 6.000 millones activados por token.

La versión "Uncensored" aplica una técnica de abliteration a nivel de tensor, que elimina selectivamente las direcciones de rechazo en el espacio de activaciones del modelo, manteniendo intactos el vision tower y la cabeza MTP (Multi-Token Prediction). Según el autor, esta técnica logra un 0% de over-refusal en el conjunto XSTest y una tasa de rechazo de 0-6% en la suite A/B, sin pérdida medible de capacidades. El modelo conserva el contexto nativo de 262.144 tokens y todas las funcionalidades del modelo base, incluyendo visión, tool calling y razonamiento.

## Capacidades

- Generación de texto y razonamiento multi-step con modo de pensamiento (thinking mode) activable.
- Comprensión de imágenes (image-text-to-text) gracias al vision tower integrado, con soporte para prompts multimodales.
- Tool calling / function calling: puede invocar herramientas externas y APIs de forma estructurada.
- Capacidades de agente: soporta razonamiento encadenado y ejecución de tareas complejas con múltiples pasos.
- Multilingüe: entrenado principalmente en inglés y chino, con posible transferencia a otros idiomas.
- Abliterated: responde sin rechazos artificiales, útil para red-teaming y evaluación de seguridad.
- MTP (Multi-Token Prediction): predice múltiples tokens por paso, mejorando la eficiencia de decodificación.
- Compatible con vLLM y otras plataformas de inferencia (endpoints_compatible).

## Casos de uso

- Red-teaming y auditoría de seguridad: el modelo puede usarse para probar sistemas de moderación y detectar vulnerabilidades en otros modelos, gracias a su ausencia de rechazos y su capacidad de generar contenido que otros modelos filtrarían.
- Atención al cliente automatizada: con su contexto de 262K tokens, puede gestionar conversaciones multi-turno largas, manteniendo el historial completo y resolviendo consultas complejas con razonamiento paso a paso.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y depurar código, aprovechando su capacidad de razonamiento y su contexto amplio para manejar repositorios enteros.
- Análisis de documentos multimodales: al combinar visión y texto, puede extraer información de imágenes, diagramas y documentos escaneados, útil en sectores como legal, médico o financiero.
- Asistentes de investigación científica: su modo de razonamiento y su capacidad de procesar largos contextos permiten sintetizar artículos, formular hipótesis y generar experimentos, con la ventaja de no rechazar preguntas sobre temas sensibles.
- Desarrollo de agentes autónomos: su soporte para function calling y razonamiento multi-step lo hace adecuado para construir agentes que interactúan con APIs, navegan por la web o ejecutan tareas administrativas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión "Uncensored" en la información disponible. El autor menciona que la abliteration no produce pérdida medible de capacidades, pero no proporciona cifras concretas de MMLU, HumanEval u otros tests estándar. Para el modelo base Qwen3.8-Flash-Next, la documentación oficial indica mejoras en capacidad y eficiencia, pero no se incluyen tablas de resultados en los materiales consultados. Se recomienda consultar el repositorio oficial de Qwen para obtener datos de evaluación del modelo base.

## Requisitos de hardware

- VRAM estimada: con 180B parámetros en FP8 (1 byte por parámetro), se necesitan aproximadamente 180 GB de VRAM para la inferencia completa. Las versiones GGUF cuantizadas (por ejemplo, Q4_K_M) pueden reducir este requisito a ~90-100 GB.
- GPU recomendadas: para FP8 completo, se requieren GPUs de centro de datos como NVIDIA A100 80GB (mínimo 3 en paralelo), H100 80GB (mínimo 3) o A6000 48GB (mínimo 4). Para GGUF cuantizado, una sola GPU de 80GB (A100, H100) o incluso una RTX 4090 24GB con cuantización agresiva (Q2_K) podría ser suficiente, aunque con pérdida de calidad.
- No cabe en GPUs de consumo estándar (8-24 GB) sin cuantización extrema y offloading a CPU, lo que degradaría el rendimiento.
- Opciones de despliegue: vLLM (soporte nativo para FP8 y block-FP8), llama.cpp (para GGUF), Ollama (para GGUF), TGI (Text Generation Inference). También es compatible con endpoints de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos. En configuraciones multi-GPU con vLLM, se espera un throughput de decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 180B | 6B | 262K | Apache 2.0 | Modelo original sin abliteration |
| Qwen3.8-27B (orcarouter) | 27B | 27B (dense) | 262K | Apache 2.0 | Versión abliterated densa, más ligera |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | MoE denso, sin visión, contexto menor |

La comparativa se basa en datos públicos. El Qwen3.8-Flash-Next destaca por su contexto extremadamente largo y su eficiencia MoE, mientras que el Qwen3.8-27B es una alternativa más ligera para entornos con menos recursos. Mixtral 8x7B es un competidor MoE establecido, pero con menor contexto y sin capacidades multimodales.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una versión abliterated, puede generar contenido ofensivo, dañino o ilegal sin filtros. No debe usarse en aplicaciones orientadas al público sin supervisión humana.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede inventar hechos, especialmente en dominios especializados. El contexto largo no elimina este riesgo.
- Limitaciones de idioma: solo está entrenado explícitamente en inglés y chino; el rendimiento en otros idiomas puede ser inferior.
- Acceso restringido: el modelo en HuggingFace es gated, lo que requiere aceptar condiciones adicionales. Esto puede limitar su uso en entornos corporativos.
- Requisitos de hardware elevados: la versión FP8 completa necesita al menos 180 GB de VRAM, lo que excluye la mayoría de estaciones de trabajo individuales.
- Sin garantías de seguridad: al eliminar los rechazos, el modelo puede ser explotado para generar malware, discursos de odio o contenido ilegal. El autor lo posiciona para red-teaming, no para producción general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-FP8
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de orcarouter sobre ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Página en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Página de Qwen3.8-27B en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
