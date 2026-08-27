# iromu/Qwen2.5-1.5B-k3-NVFP4

## Resumen

El modelo `iromu/Qwen2.5-1.5B-k3-NVFP4` es una variante cuantizada del popular `Qwen2.5-1.5B-Instruct`, fine-tuneada mediante LoRA sobre un dataset de destilación de Kimi-K3 para mejorar sus capacidades de tool calling y razonamiento agéntico. El autor, iromu, ha aplicado una cuantización NVFP4 (FP4 e2m1 con escalas de bloque FP8 e4m3) utilizando NVIDIA ModelOpt, lo que permite servir el modelo de forma nativa en GPUs Blackwell a través de TensorRT-LLM con una huella de memoria reducida.

La relevancia de este modelo radica en su doble propuesta: por un lado, ofrece un fine-tuning especializado en interacciones estructuradas con herramientas y agentes, basado en destilación de un modelo de mayor capacidad (Kimi-K3); por otro, demuestra la viabilidad de ejecutar modelos de 1.5B en precisión FP4 con calidad aceptable para tareas de tool calling. Con 888.616.448 parámetros según los safetensors (el modelo base declara 1.5B), una ventana de contexto de 32K tokens (entrenado con secuencias de 4096) y licencia Apache 2.0, se posiciona como una opción ligera y desplegable en entornos de producción con hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 888.616.448 (segun safetensors; base Qwen2.5-1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K (modelo base); entrenado con max 4096 |
| Tipos de cuantizacion | NVFP4 (W4A4, FP4 e2m1 + FP8 e4m3 block scales, group 16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con TensorRT-LLM) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-1.5B-Instruct`, que es una version optimizada del Qwen2.5-1.5B-Instruct original. La arquitectura es un transformer denso decoder-only con atencion por capas, típica de la familia Qwen2.5. Sobre esta base se aplicó un fine-tuning con LoRA (dimension 16, alpha 16, dropout 0.05) sobre los módulos de proyección de atención y feed-forward (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó con NVIDIA NeMo AutoModel, usando una sola época, learning rate 2e-5, weight decay 0.01, batch global de 4 y precisión mixta bf16.

El dataset empleado fue el split `sft_balanced` de `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, que contiene destilaciones de respuestas de modelos como Qwen3.8-Max, GLM5.2 y Kimi-K3, orientadas a tool calling y conversaciones agénticas. Tras el fine-tuning, el checkpoint se cuantizó a NVFP4 mediante ModelOpt 0.46.0, calibrando con 32 muestras del mismo split. La cuantización NVFP4 es la precisión nativa de las GPUs Blackwell y se sirve directamente con TensorRT-LLM sin necesidad de conversión adicional.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Tool calling y function calling estructurado, con soporte para definir y ejecutar funciones externas.
- Interacciones agénticas multi-paso, donde el modelo puede razonar, llamar a herramientas y continuar el diálogo.
- Razonamiento básico y respuesta a instrucciones, heredado del modelo base Qwen2.5-1.5B-Instruct.
- Capacidad de servir en baja precisión (FP4) en GPUs Blackwell, manteniendo un rendimiento aceptable para tareas de tool calling.
- No soporta visión, audio ni otros modos multimodales; es exclusivamente texto.

## Casos de uso

- Asistentes virtuales ligeros: el modelo puede gestionar conversaciones de atención al cliente con contexto de hasta 32K tokens, aunque el entrenamiento se limitó a 4096, por lo que se recomienda no exceder ese rango para mantener la coherencia.
- Automatización de tareas con herramientas: integrado en un agente que llama a APIs (búsqueda web, bases de datos, calculadoras) mediante function calling, gracias a su fine-tuning específico en destilación de Kimi-K3.
- Prototipado de agentes en entornos con recursos limitados: al ser de 1.5B y cuantizado a FP4, cabe en GPUs de consumo (si son Blackwell) o en GPUs de datacenter con poca VRAM, permitiendo iterar rápidamente en pipelines de agentes.
- Despliegue en producción con TensorRT-LLM: su formato NVFP4 es nativo en Blackwell, lo que reduce la latencia y el uso de memoria frente a FP16/BF16, ideal para servicios de tool calling de alta concurrencia.
- Educación e investigación en cuantización: sirve como ejemplo práctico de fine-tuning con LoRA + cuantización NVFP4 para tareas específicas, útil para estudiar el impacto de FP4 en la calidad de salida.
- Generación de código asistida por herramientas: aunque no está especializado en código, puede usarse en flujos donde se le proporcionan funciones de ejecución o análisis, aprovechando su capacidad de llamar a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-1.5B-Instruct tiene métricas conocidas (por ejemplo, MMLU ~56, HumanEval ~48), pero esta variante cuantizada y fine-tuneada no reporta cifras propias. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: con 888M parámetros en FP4, los pesos ocupan aproximadamente 0.9 GB. Considerando activaciones y overhead, se estima un uso de 2-3 GB para inferencia con contexto de 4096 tokens.
- GPU recomendadas: cualquier GPU NVIDIA Blackwell (B200, RTX 5090, RTX 5070, etc.) para servir NVFP4 de forma nativa con TensorRT-LLM. No es compatible con GPUs Ampere o anteriores para esta cuantización específica.
- En consumer GPU: sí, si se dispone de una GPU Blackwell con al menos 4 GB de VRAM (por ejemplo, RTX 5070 con 12 GB es suficiente).
- Opciones de despliegue: TensorRT-LLM (recomendado, vía `trtllm-serve`), también compatible con Hugging Face TGI si se convierte el checkpoint. No se menciona soporte para llama.cpp u Ollama en este formato NVFP4.
- Latencia y throughput: no disponibles; dependerán de la GPU y la configuración de TensorRT-LLM. En una B200 se espera una latencia de pocos milisegundos por token para un modelo de 1.5B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Tool calling |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32K | FP16/BF16, GGUF | Apache 2.0 | Si |
| iromu/Qwen2.5-1.5B-k3-NVFP4 | 1.5B (888M en safetensors) | 32K (entrenado 4096) | NVFP4 (FP4) | Apache 2.0 | Si (mejorado) |
| Llama-3.2-1B-Instruct | 1.2B | 128K | FP16, GGUF | Llama 3.2 | Limitado |

La comparativa muestra que este modelo ofrece una ventaja en eficiencia de memoria gracias a NVFP4, pero su contexto efectivo de entrenamiento es menor (4096) que el del base. Frente a Llama-3.2-1B, el fine-tuning específico en tool calling lo hace más adecuado para tareas agénticas, aunque Llama-3.2-1B tiene un contexto mayor.

## Limitaciones y advertencias

- Solo soporta inglés; no se recomienda su uso en otros idiomas sin evaluación previa.
- La cuantización NVFP4 puede degradar la calidad de las respuestas en comparación con el modelo en FP16, especialmente en tareas de razonamiento complejo.
- El entrenamiento se realizó con secuencias de 4096 tokens; aunque el modelo base soporta 32K, el fine-tuning no ha visto contextos más largos, por lo que puede perder coherencia más allá de 4096.
- No es un reemplazo general de modelos Qwen más grandes; su uso previsto es tool calling y agentes ligeros.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de destilación puede tener restricciones adicionales no especificadas; se recomienda revisar los términos del dataset `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`.
- Requiere hardware Blackwell para aprovechar NVFP4; en otras GPUs no funcionará sin conversión a otro formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iromu/Qwen2.5-1.5B-k3-NVFP4
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Dataset de destilación: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Variante GGUF del mismo autor: https://huggingface.co/iromu/qwen25-1.5b-tools-GGUF
- Documentación de Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-1.5B
