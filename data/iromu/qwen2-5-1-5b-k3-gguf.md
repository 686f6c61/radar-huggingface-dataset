# iromu/Qwen2.5-1.5B-k3-GGUF

## Resumen

El modelo `iromu/Qwen2.5-1.5B-k3-GGUF` es una adaptación del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, fine-tuneado con LoRA sobre datos de destilación del conjunto `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`. El objetivo es mejorar las capacidades de tool calling, function calling y razonamiento multi-paso en interacciones de tipo agente, aprovechando el comportamiento destilado de modelos más grandes como Kimi-K3. Está publicado en formato GGUF, listo para su uso con llama.cpp y otros motores compatibles.

Con 1.543.714.304 parámetros (1.5B), es un modelo compacto pensado para entornos con recursos limitados. La ventana de contexto de entrenamiento es de 4096 tokens, aunque el modelo base original soporta hasta 128K; el fine-tuning reduce el contexto efectivo a 4096. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Es relevante para desarrolladores que necesitan un modelo pequeño y eficiente para tareas de automatización con herramientas, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (entrenamiento); el base soporta 128K |
| Tipos de cuantizacion | BF16, Q4_K_M (otros cuantizables desde BF16) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only denso con atención causal estándar. El fine-tuning se realizó con LoRA (dimension 16, alpha 16, dropout 0.05) sobre las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento usó NVIDIA NeMo AutoModel con precisión mixta bf16, una tasa de aprendizaje de 2e-5, weight decay 0.01, batch global de 4 (micro batch 1 con 4 acumulaciones) y una sola época. El dataset de entrenamiento fue la partición `sft_balanced` del conjunto de destilación mencionado, que combina respuestas generadas por modelos como Qwen3.8, GLM5.2 y Kimi-K3, orientadas a tool calling y razonamiento de agente. No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado (SFT) con destilación.

## Capacidades

- Generacion de texto y respuestas conversacionales en ingles.
- Tool calling y function calling estructurado: el modelo está entrenado para emitir llamadas a herramientas en formato JSON, siguiendo el estilo de Qwen2.5.
- Interacciones de tipo agente multi-paso: puede mantener secuencias de razonamiento y ejecución de herramientas.
- Razonamiento destilado: hereda patrones de razonamiento de modelos más grandes (Kimi-K3, GLM5.2) para tareas de planificación.
- No soporta vision, audio ni otros modos multimodales.
- Multilingüismo limitado: solo inglés declarado; el base Qwen2.5 soporta más idiomas, pero el fine-tuning no garantiza su mantenimiento.

## Casos de uso

- Automatizacion de tareas con APIs: el modelo puede generar llamadas a funciones REST o SDKs, por ejemplo para consultar bases de datos, enviar correos o interactuar con servicios externos, gracias a su entrenamiento específico en tool calling.
- Asistentes conversacionales ligeros: integrable en chatbots de soporte técnico o atención al cliente donde se requiera bajo consumo de recursos y respuestas en inglés.
- Agentes de extraccion de informacion: dado un prompt con instrucciones y herramientas disponibles, el modelo puede decidir qué función invocar y con qué argumentos, útil para pipelines de scraping o consultas estructuradas.
- Prototipado rapido de agentes: al ser pequeño y en GGUF, permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de alta gama.
- Edge computing y dispositivos embebidos: su tamaño (menos de 1 GB en Q4_K_M) lo hace apto para ejecución en CPU o GPUs de baja potencia, por ejemplo en routers, NAS o dispositivos IoT.
- Educacion e investigacion: sirve como modelo de referencia para estudiar técnicas de destilación y fine-tuning con LoRA en tareas de tool calling, dado su reducido coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo específico. Se recomienda realizar pruebas propias en los casos de uso previstos.

## Requisitos de hardware

- VRAM estimada: para la versión Q4_K_M (~0.9 GB de pesos), se puede ejecutar en GPUs con 2-4 GB de VRAM, o incluso en CPU con suficiente RAM (llama.cpp).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para inferencia fluida. Para mayor velocidad, RTX 3060 o superior.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp (incluido `llama-cli`), Ollama (si se convierte a formato compatible), llama-cpp-python, o servidores como llama.cpp server. También puede usarse con vLLM si se convierte a safetensors, aunque el formato nativo es GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. En una CPU moderna, se esperan decenas de tokens por segundo con Q4_K_M; en GPU, cientos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| iromu/Qwen2.5-1.5B-k3-GGUF | 1.5B | 4096 (efectivo) | Apache-2.0 | GGUF | Tool calling destilado |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF | 1.5B | 128K | Apache-2.0 | GGUF | Instruct general |
| Llama-3.2-1B-Instruct (referencia) | 1.2B | 128K | Llama 3.2 | safetensors/GGUF | Instruct general, sin tool calling nativo |

El modelo k3 se diferencia por su especialización en tool calling y agentes, mientras que el Qwen2.5-1.5B-Instruct original es más generalista y con mayor contexto. Llama-3.2-1B no tiene soporte nativo de function calling tan explícito. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens: aunque el base soporta 128K, el fine-tuning se realizó con 4096, por lo que usos con contextos más largos pueden degradar la calidad o fallar.
- Solo inglés: no se garantiza buen rendimiento en otros idiomas, a pesar de que el base Qwen2.5 es multilingüe.
- Riesgo de alucinación: como cualquier modelo pequeño, puede inventar argumentos o llamadas a funciones inexistentes; se recomienda validación externa de las salidas.
- Sesgos: no se han evaluado sesgos específicos; el modelo puede heredar sesgos del dataset de destilación y del base.
- No es un reemplazo general de modelos grandes: el autor indica que no está pensado para tareas generales complejas; su uso óptimo es en tool calling y agentes.
- Dependencia del dataset de destilación: la calidad de las respuestas depende de la calidad de los datos de Kimi-K3 y otros; puede haber inconsistencias en dominios no cubiertos.
- Sin garantías de producción: no hay benchmarks ni evaluaciones formales; se recomienda probar exhaustivamente antes de desplegar en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/Qwen2.5-1.5B-k3-GGUF
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Dataset de destilación: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Qwen2.5-1.5B-Instruct-GGUF (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Repositorio de Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
