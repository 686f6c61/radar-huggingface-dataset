# mrysh/qwen3.5-4b-prune_depth_10_lora_kd_gptq_8bit

## Resumen

Este modelo es el resultado final de un experimento de compresión en tres etapas sobre `Qwen/Qwen3.5-4B`: primero se podó un 10% de las capas (profundidad), después se aplicó una destilación LoRA desde el modelo sin podar y, por último, se cuantizó a 8 bits con GPTQ. Lo publica el usuario `mrysh` como parte de un benchmark de compresión de LLM orientado a evaluar si la poda de profundidad seguida de destilación y cuantización permite conservar las capacidades del modelo original reduciendo tamaño y coste de inferencia.

El resultado es un modelo de 3.866.979.776 parámetros almacenado en safetensors, con un tamaño en disco de 4,61 GB (0,55x del original) y un rendimiento en tareas de function calling y razonamiento médico muy cercano al modelo de referencia. Según la model card, la cuantización apenas degrada las métricas respecto al modelo destilado previo: -0,3 puntos en BFCL, +0,1 en MedQA y +1,0 en el benchmark de sesgo de contratación.

La relevancia de esta ficha es doble: por un lado, documenta una receta reproducible de compresión (poda + destilación + GPTQ) con métricas comparativas; por otro, sirve como ejemplo de que la poda de profundidad sin destilación destruye capacidades de tool calling (de 88,0% a 34,2% en BFCL) y que la destilación posterior es imprescindible para recuperarlas. No hay información sobre licencia, idiomas ni pipeline en los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`); detalles de atención y capas no disponibles |
| Parametros totales | 3.866.979.776 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ 8 bits, group size 128, `desc_act` off (calibrado con 512 textos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica que aplica la licencia del modelo base) |
| Formato de pesos | safetensors (cuantización GPTQ, generada con `gptqmodel` 7.6.0) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer decoder-only de la familia Qwen3.5. Sobre él se aplica una poda de profundidad del 10% de las capas, dando lugar a `mrysh/qwen3.5-4b-prune_depth_10`. Posteriormente se realiza una destilación LoRA desde el modelo sin podar (`mrysh/qwen3.5-4b-prune_depth_10_lora_kd`), que recupera gran parte de las capacidades perdidas por la poda. El paso final es una cuantización GPTQ de 8 bits con group size 128 y `desc_act` desactivado, calibrada sobre 512 textos del fichero de calibración del benchmark (170 peticiones BFCL, 171 de hiring y 171 de Energy-QA), generada con `gptqmodel` 7.6.0 en una NVIDIA L40 con un tiempo de cuantización de 354 segundos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus de destilación más allá de la mención a peticiones en formato BFCL y MedQA, ni sobre si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la combinación secuencial de poda estructural de capas, destilación LoRA y cuantización GPTQ, con evaluación comparativa de cada etapa sobre los mismos conjuntos de preguntas.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Function calling / tool calling: soporta llamadas a funciones únicas, selección entre varias funciones, múltiples llamadas simultáneas y detección de "ninguna función encaja" (evaluado con BFCL).
- Razonamiento médico de opción múltiple (evaluado con MedQA).
- Modo "thinking" desactivable: las evaluaciones se realizaron con thinking off y decodificación greedy.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni agentes multi-paso más allá del tool calling evaluado.

## Casos de uso

- Despliegue de asistentes con tool calling en producción: el modelo conserva un 87,2% de precisión global en BFCL (frente al 88,0% del original) con la mitad del tamaño en disco, lo que lo hace adecuado para entornos con restricciones de VRAM donde se necesita invocar APIs o funciones externas.
- Sistemas de enrutamiento de funciones: con un 93,5% de acierto al elegir entre varias funciones, puede usarse como clasificador/enrutador en arquitecturas de agentes que deciden qué herramienta invocar.
- Orquestación de múltiples llamadas: mantiene un 80,2% en escenarios de varias llamadas simultáneas, útil para pipelines que requieren encadenar varias herramientas en una sola respuesta.
- Inferencia de alto throughput en una sola GPU: los 120,5 tokens/s por usuario en una L40 (1,65x el original) permiten servir a más usuarios concurrentes con el mismo hardware.
- Aplicaciones de razonamiento médico asistido: con un 69,8% de precisión en MedQA, puede emplearse en sistemas de apoyo a la decisión clínica de baja criticidad o en triaje informativo, siempre con supervisión humana.
- Evaluación de sesgos en procesos de selección: el benchmark de hiring bias (79,9% de acierto en decisiones) permite usar el modelo en estudios de equidad algorítmica y auditoría de sistemas de contratación.
- Prototipado y experimentación en entornos con GPUs de gama media: el tamaño de 4,61 GB facilita su despliegue en estaciones de trabajo con una sola GPU consumer de 24 GB o en instancias cloud económicas.

## Benchmarks y rendimiento

Evaluación con decodificación greedy, thinking off, vLLM sobre una NVIDIA L40, mismas preguntas para todos los modelos: 977 de BFCL, 1273 de MedQA y 288 de hiring bias.

| Metrica | Original | Pruned | Pruned + distillation | Este modelo |
|---|---|---|---|---|
| BFCL, function-call accuracy (global) | 88,0% | 34,2% | 87,5% | 87,2% |
| BFCL, una función | 90,8% | 61,2% | 91,1% | 91,1% |
| BFCL, elegir entre varias funciones | 92,8% | 50,0% | 94,2% | 93,5% |
| BFCL, varias llamadas a la vez | 83,3% | 1,9% | 80,9% | 80,2% |
| BFCL, varias llamadas con elección | 83,5% | 4,1% | 81,8% | 81,8% |
| BFCL, "ninguna función encaja" correcto | 91,6% | 88,7% | 92,1% | 92,1% |
| BFCL, respuestas sin formato válido (de 774) | 1 | 437 | 5 | 5 |
| MedQA, precisión de opción | 70,8% | 66,3% | 69,8% | 69,8% |
| Hiring bias, precisión de decisión | 77,4% | 67,4% | 78,8% | 79,9% |
| Tamaño en disco (GB) | 8,41 | 7,75 | 7,75 | 4,61 |
| Velocidad (tokens/s, un usuario, vLLM, L40) | 73,2 | 70,8 | 80,1 | 120,5 |

Respecto al modelo destilado antes de cuantizar, este modelo pierde 0,3 puntos en BFCL, gana 0,1 en MedQA y 1,0 en hiring. Los intervalos de confianza al 95% son de aproximadamente ±2 puntos en BFCL, ±3 en MedQA y ±5 en hiring, por lo que estas diferencias están dentro del ruido de los conjuntos de test.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 4,61 GB en disco en GPTQ 8 bits; en VRAM requiere aproximadamente 5-6 GB para pesos, más overhead de KV cache y activaciones (dependiente de la longitud de contexto, no disponible).
- GPU recomendadas: NVIDIA L40 (usada en la evaluación), A100, H100 para producción de alto throughput; RTX 4090 y RTX 3090 para desarrollo.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 en adelante), asumiendo contextos moderados.
- Opciones de despliegue: vLLM 0.34 (probado por el autor, con `vllm serve mrysh/qwen3.5-4b-prune_depth_10_lora_kd_gptq_8bit`); la cuantización GPTQ es compatible con otros backends que soporten GPTQ 8 bits.
- Latencia y throughput: 120,5 tokens/s por usuario en una L40 con vLLM, decodificación greedy y thinking off. No se han publicado datos de latencia ni de throughput con batching concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL (global) | MedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (GPTQ 8 bits) | 3,87B | No disponible | 87,2% | 69,8% | No disponible | Hugging Face |
| `mrysh/qwen3.5-4b-prune_depth_10_lora_kd` (destilado, sin cuantizar) | No disponible | No disponible | 87,5% | 69,8% | No disponible | Hugging Face |
| `Qwen/Qwen3.5-4B` (original) | No disponible | No disponible | 88,0% | 70,8% | No disponible | Hugging Face |
| `mrysh/qwen3.5-4b-prune_depth_10` (solo podado) | No disponible | No disponible | 34,2% | 66,3% | No disponible | Hugging Face |

La comparativa se limita a los modelos de la propia cadena de compresión porque no se dispone de datos de benchmarks de otros modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Una sola cuantización y una sola evaluación por modelo, sin repeticiones: los resultados tienen intervalos de confianza de ±2 puntos en BFCL, ±3 en MedQA y ±5 en hiring.
- Evaluado únicamente con vLLM 0.34 en una NVIDIA L40, thinking off y decodificación greedy; el comportamiento con otras configuraciones de inferencia no está documentado.
- El corpus de destilación contenía peticiones en el formato de los tests de BFCL y MedQA, lo que puede inflar las métricas en esos benchmarks respecto a un uso real fuera de distribución.
- La poda de profundidad sin destilación degrada gravemente el tool calling (de 88,0% a 34,2% en BFCL); este modelo depende de la destilación para mantener sus capacidades.
- Licencia no disponible en los metadatos: la model card indica que aplica la licencia del modelo base, pero no se especifica cuál es, lo que impide confirmar si el uso comercial está permitido.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe sin evaluación adicional.
- Longitud de contexto no disponible: limita la planificación de despliegues con ventanas largas.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones específicas más allá del benchmark de hiring bias (79,9% de acierto en decisiones, con posibles sesgos residuales no caracterizados).
- Solo 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10_lora_kd_gptq_8bit
- Modelo base de la cadena (destilado): https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10_lora_kd
- Modelo solo podado: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería de cuantización: https://github.com/ModelCloud/GPTQModel
- vLLM: https://github.com/vllm-project/vllm
