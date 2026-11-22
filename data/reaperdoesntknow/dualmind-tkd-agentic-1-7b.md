# reaperdoesntknow/DualMind-TKD-Agentic-1.7B

## Resumen

DualMind TKD Agentic 1.7B es un modelo de lenguaje derivado de Qwen/Qwen3-1.7B, desarrollado por Convergent Intelligence LLC (bajo el alias reaperdoesntknow). Se trata de un fine-tuning en dos etapas que combina destilación de conocimiento matemático guiada por topología con una especialización posterior en function calling y comportamiento agéntico. El modelo resuelve el problema de dotar a un modelo pequeño de 1.700 millones de parámetros de capacidades de razonamiento matemático estructurado y de invocación de herramientas, partiendo de un modelo base ya competente en contexto largo.

La primera etapa realiza un fine-tuning completo del modelo usando Qwen/Qwen3-8B como profesor sobre un dataset de cálculo avanzado con chain-of-thought, aplicando señales estructurales como discrepancia de distribuciones y topología de transiciones. La segunda etapa aplica LoRA sobre el dataset Hermes function-calling v1 y fusiona los pesos, mezclando replay matemático para mitigar el olvido catastrófico. El resultado es un modelo autónomo que no requiere adaptador PEFT separado para inferencia.

Es relevante ahora porque explora técnicas de destilación topology-aware en modelos pequeños, un área activa de investigación para reducir costes de despliegue manteniendo capacidades de razonamiento y uso de herramientas. No obstante, el autor no publica resultados formales de benchmarks y advierte explícitamente que debe evaluarse antes de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; el autor no la especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | other (base Apache-2.0, dataset de calculo sin licencia clara) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-1.7B, un transformer decoder-only. El entrenamiento se estructura en dos etapas. La etapa 1 realiza un fine-tuning completo del modelo (full-model fine-tuning) usando Qwen/Qwen3-8B como profesor sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268. El objetivo combina entropía cruzada supervisada con destilación top-k-and-tail dispersa del profesor. Las señales estructurales incluyen discrepancia de distribución del profesor, topología de transiciones, diagnósticos de gap-energy y supervisión ponderada por fases Explore/Examine/Response, diseñada para presionar el aprendizaje en derivaciones, verificación y transiciones de razonamiento de alta discrepancia.

La etapa 2 aplica especialización LoRA sobre NousResearch/hermes-function-calling-v1, seguida de fusión de pesos. La supervisión se limita a salidas del asistente y de tool-calls; los esquemas de herramientas, mensajes de usuario y resultados de herramientas se incluyen como contexto pero se excluyen de la pérdida directa (assistant-masked). Se mezcla replay matemático para reducir el olvido catastrófico. El repositorio contiene el modelo fusionado standalone, sin necesidad de adaptador PEFT separado.

## Capacidades

- Generación de texto y razonamiento matemático y técnico, con énfasis en cálculo avanzado y derivaciones paso a paso.
- Verificación y transiciones de razonamiento reforzadas mediante supervisión topology-guided.
- Function calling y tool use estructurado, entrenado sobre Hermes function-calling v1.
- Generación de tool calls en formato estructurado (el modelo no ejecuta herramientas por sí mismo; requiere un runtime externo).
- Soporte de bucles agénticos multi-paso mediante invocaciones sucesivas con resultados de herramientas añadidos al contexto.
- Capacidades conversacionales multi-turno.
- Capacidad de servir como base para SFT continuado u optimización por preferencias.
- Idiomas: únicamente inglés según la model card.

## Casos de uso

- Razonamiento matemático asistido: resolución de problemas de cálculo con cadenas de razonamiento explícitas, aprovechando la destilación desde Qwen3-8B sobre el dataset de cálculo avanzado.
- Agentes con function calling: integración en un runtime que parsee tool calls, ejecute la herramienta, añada el resultado y reinvoque el modelo para la siguiente acción.
- Experimentación en investigación sobre destilación topology-aware: el modelo sirve como artefacto reproducible para estudiar el efecto de señales estructurales en modelos pequeños.
- Selección de herramientas en pipelines de agentes: evaluación de la capacidad del modelo para elegir la herramienta adecuada dentro de un conjunto de esquemas definidos.
- Base para SFT o DPO: punto de partida para fine-tuning adicional en dominios específicos, dado que se distribuye como modelo fusionado standalone.
- Prototipado de asistentes técnicos en inglés: despliegue ligero en entornos de desarrollo para tareas de razonamiento y llamadas a API.
- Educación y tutoría matemática: generación de explicaciones paso a paso de derivadas e integrales, con la advertencia de que las trazas sintéticas pueden contener errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama resultados formales de evaluación en esta release y que solo se realizaron monitorización de pérdida en held-out y pruebas cualitativas de generación. Recomienda ejecutar benchmarks externos de matemáticas, function calling, retención y seguridad antes de uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos (1.720 millones de parámetros), más overhead de activaciones y KV cache.
- En cuantización de 8 bits: aproximadamente 1,7 GB de pesos; en 4 bits: aproximadamente 0,9 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son adecuadas.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en fp16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag text-generation-inference), endpoints compatibles; vLLM, llama.cpp y Ollama no están documentados explícitamente por el autor y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DualMind TKD Agentic 1.7B | 1,72 B | no disponible | Matemáticas + function calling | other | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible en esta ficha | Modelo generalista | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-8B (profesor) | 8 B | no disponible en esta ficha | Modelo generalista | Apache-2.0 | Hugging Face |
| NousResearch Hermes (familia) | variable | variable | Function calling | Apache-2.0 (dataset) | Hugging Face |

No se dispone de datos de rendimiento comparativo porque el autor no publica benchmarks. La comparación se limita a parámetros, licencia y especialización.

## Limitaciones y advertencias

- El dataset de matemáticas de origen es pequeño, lo que limita la cobertura del razonamiento aprendido.
- Las trazas de razonamiento sintéticas o generadas pueden contener derivaciones incorrectas o respuestas finales contradictorias.
- El formato correcto de un tool call no garantiza la selección correcta de la herramienta.
- Los resultados de herramientas externas deben tratarse como entrada no confiable.
- El replay matemático reduce el olvido pero no demuestra retención de capacidades del modelo base.
- El modelo no ha sido validado como seguro para acciones autónomas de alto impacto, médicas, financieras o legales.
- Solo soporta inglés según la model card.
- Licencia marcada como "other": el dataset de cálculo avanzado no exponía una licencia clara al preparar la model card; debe confirmarse antes de uso comercial o de relicenciar el derivado.
- No se han publicado benchmarks ni evaluaciones de seguridad externas.
- El modelo no ejecuta herramientas por sí mismo; requiere un runtime externo que gestione el bucle de ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de cálculo: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Desarrollador: https://huggingface.co/reaperdoesntknow
