# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Plain-ReverseKL-original10240

## Resumen

El modelo `Qwen2.5-VL-7B-OPSD-VisionZip-r010-Plain-ReverseKL-original10240` es un adaptador PEFT/LoRA experimental desarrollado por `enmingzhangzz` sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`. No es un modelo completo, sino un conjunto de pesos ligeros que se cargan sobre el modelo base mediante la librería PEFT. Su propósito es investigar la eficiencia en modelos de visión-lenguaje mediante la combinación de dos técnicas: el podado de tokens visuales con VisionZip (reteniendo solo el 10 % de los tokens) y un objetivo de entrenamiento basado en OPSD (probablemente On-Policy Self-Distillation) con divergencia KL inversa.

El adaptador se entrenó sobre un subconjunto de 10 240 muestras del dataset `OpenMMReasoner/OpenMMReasoner-SFT-874K`, con una configuración específica de LoRA (r=16, alpha=32) y un decaimiento de EMA de 0.9999. La relevancia del modelo radica en ser un experimento dentro de una línea de investigación sobre reducción del coste computacional en modelos multimodal, aunque no se han publicado resultados de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-7B-Instruct (transformer de visión-lenguaje) |
| Parametros totales | No disponible (repo de 0.2 GB, adaptador PEFT) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `adapter_model.safetensors` y `adapter_config.json` (PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo multimodal de 7000 millones de parámetros. El adaptador se entrena con un objetivo de OPSD que emplea divergencia KL inversa (`student || teacher`), sin ponderación de tokens ni intervenciones auxiliares. El entrenamiento utiliza un subconjunto de 10 240 muestras del dataset `OpenMMReasoner-SFT-874K`, con un tamaño de lote global de 32 (4 GPUs, micro-lote 8, acumulación 1).

La innovación principal es la integración de VisionZip como mecanismo de podado de tokens visuales. El ratio de retención es 0.1, lo que significa que solo se conserva el 10 % de los tokens de visión durante la inferencia. Además, se emplea un decaimiento de EMA para el profesor de 0.9999, y la resolución de imagen es de 846 720 píxeles. El adaptador se guarda en el paso 10 240, con un SHA256 registrado en la model card.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text), heredada del modelo base Qwen2.5-VL-7B-Instruct. No se documentan capacidades adicionales específicas del adaptador.
- Razonamiento multimodal y seguimiento de instrucciones visuales, probablemente conservados del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): el modelo base es multimodal (visión + texto), pero no se especifican más capacidades en la información proporcionada.

## Casos de uso

- Investigación en eficiencia de tokens visuales: el adaptador permite estudiar cómo afecta la reducción al 10 % de los tokens de visión en tareas de razonamiento visual, en comparación con el modelo base sin podado.
- Experimentación con destilación en modelos multimodales: el entrenamiento con OPSD y reverse KL sirve para analizar el comportamiento de la destilación de conocimiento en configuraciones de baja retención de tokens.
- Evaluación de técnicas de podado en visión-lenguaje: los investigadores pueden cargar este adaptador sobre el modelo base para comparar el rendimiento de VisionZip con otras estrategias de selección de tokens.
- Prototipado de pipelines de inferencia multimodal con menor coste computacional: al reducir los tokens de visión, se puede explorar el despliegue en entornos con recursos limitados, siempre que se cuente con el parche de VisionZip.
- Pruebas de reproducibilidad en destilación auto-regresiva: el adaptador incluye metadatos de auditoría y reproducción en la carpeta `training/`, lo que facilita la verificación de experimentos previos.
- Comparación entre variantes de OPSD: existe una familia de adaptadores similares (por ejemplo, con ForwardKL o con otros ratios de retención) que permite comparar el efecto de la dirección de la KL y otros hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base Qwen2.5-VL-7B-Instruct requiere aproximadamente 16-20 GB en FP16, más el espacio del adaptador LoRA. No se especifican configuraciones con cuantización.
- GPU recomendadas: no disponibles. Dado el tamaño del modelo base, una GPU con al menos 24 GB de VRAM (RTX 4090, A100 40 GB) sería adecuada para inferencia sin cuantizar, pero no está confirmado.
- ¿Cabe en consumer GPU? No disponible. El adaptador es pequeño, pero el modelo base es de 7B y requiere memoria considerable.
- Opciones de despliegue: el adaptador se carga con PEFT sobre el modelo base mediante `transformers` y `peft`. Para la inferencia con podado de VisionZip se requiere el parche de runtime específico del repositorio OPSD. No se confirma soporte para vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen2.5-VL-7B-OPSD-VisionZip-r010-Plain-ReverseKL-original10240` | Qwen2.5-VL-7B-Instruct | Adaptador LoRA (no disponible) | No disponible | No disponible | HuggingFace (repo 0.2 GB) |
| `Qwen/Qwen2.5-VL-7B-Instruct` | Qwen2.5-VL-7B-Instruct | 7B | No disponible | No disponible (Apache 2.0 probablemente, pero no confirmado) | HuggingFace |
| `enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-Top10-ForwardKL-original10240` | Qwen2.5-VL-7B-Instruct | Adaptador LoRA (no disponible) | No disponible | No disponible | HuggingFace |

Se trata de un adaptador experimental. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Adaptador experimental: no es un modelo finalizado ni apto para producción sin validación previa.
- Licencia no disponible: el uso comercial o redistribución no está definido.
- Sin benchmarks publicados: no se puede evaluar su calidad frente al modelo base ni a otras variantes.
- Dependencia de VisionZip: para la inferencia con podado de tokens se requiere el parche de runtime del repositorio OPSD; sin él, el adaptador podría no funcionar correctamente.
- Riesgo de degradación de rendimiento: la retención del 10 % de tokens visuales puede provocar pérdida de información visual significativa, especialmente en tareas que requieren atención a detalles.
- Sesgos y alucinaciones: no documentados. Heredan los riesgos del modelo base, no mitigados en este adaptador.
- Reproducibilidad: el adaptador está ligado a una configuración muy concreta (muestras, semilla, datos de entrenamiento) y puede no ser generalizable a otros dominios.

## Enlaces

- HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-Plain-ReverseKL-original10240
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Variante comparativa: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-Top10-ForwardKL-original10240
- Variante con implementación oficial de VisionZip: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenMMReasoner/OpenMMReasoner-SFT-874K
