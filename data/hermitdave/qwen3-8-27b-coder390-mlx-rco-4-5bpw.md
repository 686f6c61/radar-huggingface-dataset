# hermitdave/Qwen3.8-27B-Coder390-MLX-RCO-4.5bpw

## Resumen

El modelo `hermitdave/Qwen3.8-27B-Coder390-MLX-RCO-4.5bpw` es una cuantización en formato MLX (mixed-precision, 4.5 bits por peso) de un modelo base de la familia Qwen 3.8, con 27 mil millones de parámetros, orientado a tareas de código y razonamiento agéntico. Lo publica el usuario hermitdave en Hugging Face y está pensado para ejecutarse en Apple Silicon mediante la librería `mlx-lm`, aprovechando la aceleración de la GPU unificada de los chips M-series.

El modelo base del que deriva —`nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`— sugiere un proceso de ajuste fino supervisado (SFT) y optimización con RL (RLOO) sobre una base Qwen 3.8 de 27B, con atención híbrida y soporte multimodal imagen-texto. La cuantización RCO (mixed-precision) a 4.5 bpw busca reducir el uso de memoria manteniendo la calidad lo máximo posible, un compromiso habitual en despliegues locales en hardware Apple.

La relevancia de esta ficha es doble: por un lado, documenta una variante cuantizada de un modelo grande para inferencia local en Apple Silicon; por otro, advierte de que se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin información pública sobre benchmarks, idiomas o evaluación, lo que limita su uso en producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (hybrid-attention), según tags; familia Qwen 3.8 |
| Parametros totales | 27B (según nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX mixed-precision 4.5 bpw (RCO); tag "4-bit" |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (según tag); campo de licencia no disponible |
| Formato de pesos | safetensors (MLX), librería `mlx-lm` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen 3.8 con atención híbrida (tag `hybrid-attention`), según la metadata del repositorio. El modelo base incorpora en su nombre indicios de un pipeline de ajuste: SFT (supervised fine-tuning), RLOO (REINFORCE Leave-One-Out, una variante de optimización por refuerzo), MTP (multi-token prediction) y DFlash2, además de referencias a otros modelos en el nombre compuesto (Opus5.5, GPT6Astra, Grok4.7, DSV4Pro, K3), lo que sugiere un entrenamiento por destilación o mezcla de datos de múltiples fuentes. No se dispone de información verificable sobre el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO.

La innovación principal de esta variante concreta es la cuantización RCO (mixed-precision) a 4.5 bits por peso en formato MLX, que asigna distinto número de bits a distintas capas o tensores para preservar la calidad en las partes más sensibles del modelo. El resultado es un artefacto optimizado para `mlx-lm` en Apple Silicon, no para GPUs NVIDIA ni para despliegues en servidores convencionales. No hay información pública sobre la metodología exacta de la cuantización ni sobre la pérdida de calidad respecto al modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredadas de la base Qwen 3.8 de 27B.
- Generación y comprensión de código (el nombre incluye "Coder390").
- Capacidades multimodales imagen-texto (pipeline `image-text-to-text`).
- Razonamiento agéntico y multi-step (tag `agentic`).
- Modo de razonamiento eficiente ("EfficientThink" en el nombre del modelo base).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.
- Decodificación especulativa / multi-token prediction: el nombre del base incluye "MTP", lo que sugiere soporte, pero no se detalla.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede usarse con `mlx-lm` en un Mac con chip M-series para autocompletado, refactorización y explicación de código, aprovechando la cuantización 4.5 bpw para reducir el uso de memoria unificada.
- Prototipado de agentes en Apple Silicon: gracias al tag `agentic` y al modo de razonamiento eficiente, puede emplearse para construir agentes que ejecuten tareas multi-paso en local sin depender de la nube.
- Análisis de imágenes y texto en local: al ser un modelo `image-text-to-text`, permite describir imágenes, extraer información de capturas o documentos escaneados en un flujo local.
- Desarrollo y pruebas de pipelines MLX: sirve como banco de pruebas para validar flujos de cuantización mixed-precision y comparar calidad frente al modelo base en entornos Apple.
- Investigación sobre cuantización: útil para estudiar el impacto de RCO a 4.5 bpw en tareas de código y razonamiento, comparando con el modelo sin cuantizar.
- Evaluación interna antes de adopción: dado que no hay benchmarks públicos, un equipo puede usarlo como candidato en su propio conjunto de evaluación de código y agentes antes de comprometerse con él en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con 27B parámetros a 4.5 bpw, el peso ronda los 15 GB; hay que sumar overhead de KV cache y activaciones, por lo que se recomienda al menos 24-32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon exclusivamente (M1/M2/M3/M4 Pro, Max o Ultra); no está pensado para CUDA.
- Cabe en consumer GPU: solo en Apple Silicon con memoria unificada suficiente; no en GPUs NVIDIA de consumo por el formato MLX.
- Opciones de despliegue: `mlx-lm` (librería indicada en el repo); no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hermitdave/Qwen3.8-27B-Coder390-MLX-RCO-4.5bpw | 27B | no disponible | MLX safetensors | apache-2.0 (tag) | Hugging Face, 0 descargas |
| Modelo base nerkyor/Qwen3.8-27B-Coder390-... | 27B | no disponible | safetensors | no disponible | Hugging Face |
| Otras variantes Qwen 3.8 27B cuantizadas | 27B | no disponible | GGUF / MLX | según variante | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto sin validación pública: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que haya sido probado por terceros.
- Sin benchmarks ni evaluación publicada: no se puede afirmar su calidad frente al modelo base ni frente a alternativas.
- Solo Apple Silicon: el formato MLX no es portable a CUDA ni a CPU convencional sin conversión.
- Pérdida de calidad por cuantización: 4.5 bpw mixed-precision implica una degradación potencial respecto al modelo sin cuantizar, no cuantificada en la información disponible.
- Licencia ambigua: el tag indica apache-2.0, pero el campo de licencia figura como no disponible; conviene verificar antes de uso comercial.
- Idiomas no declarados: no hay información sobre cobertura multilingüe.
- Riesgo de alucinación: inherente a modelos de lenguaje de este tamaño, agravado por la ausencia de evaluación.
- Nombre del modelo base con referencias a otros modelos: puede indicar mezcla de datos o destilación, pero no hay documentación que lo aclare.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar la ventana real.

## Enlaces

- [Hugging Face: hermitdave/Qwen3.8-27B-Coder390-MLX-RCO-4.5bpw](https://huggingface.co/hermitdave/Qwen3.8-27B-Coder390-MLX-RCO-4.5bpw)
- [Modelo base: nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2](https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2)
- Referencia arXiv indicada en tags: arxiv:2611.26157 (no verificada en la información disponible)
- Librería de despliegue: [mlx-lm](https://github.com/ml-explore/mlx-lm)
