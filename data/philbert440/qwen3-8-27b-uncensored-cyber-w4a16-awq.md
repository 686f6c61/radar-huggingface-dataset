# philbert440/Qwen3.8-27B-Uncensored-Cyber-W4A16-AWQ

## Resumen

El modelo `philbert440/Qwen3.8-27B-Uncensored-Cyber-W4A16-AWQ` es una variante cuantizada y "desensibilizada" (refusal-suppressed) del modelo denso Qwen3.8-27B, un VLM (vision-language model) con arquitectura `qwen3_5` desarrollado por el usuario philbert440. Su objetivo principal es ofrecer un modelo de investigación sin rechazos de seguridad (abliterado) y optimizado para ejecutarse en GPUs NVIDIA V100 (SM70) mediante el runtime 1Cat-vLLM, una bifurcación de vLLM con soporte para arquitecturas antiguas.

El modelo combina dos técnicas: una abliteración dirigida a dominios "cyber" (trial 245) con un peel residual Arditi suave (beta=0.4) que elimina los mecanismos de rechazo, y una cuantización AWQ int4 con group size 128 y activaciones de 16 bits (W4A16) aplicada mediante `compressed-tensors`. La cabeza MTP (multi-token prediction) se conserva en bf16 para permitir decodificación especulativa. Con 27.356 millones de parámetros totales y un peso cuantizado de unos 19.6 GB, está pensado para inferencia en configuraciones de 2x V100 con tensor parallelism.

La relevancia de este modelo radica en su doble vertiente: por un lado, demuestra la viabilidad de ejecutar modelos grandes con contexto largo en hardware legacy (V100) gracias a la cuantización agresiva y el KV-cache en FP8; por otro, sirve como caso de estudio en técnicas de abliteración y evaluación de alineación, aunque su uso debe limitarse estrictamente a entornos de investigación responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con visión (VLM), arquitectura `qwen3_5` |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ int4 (W4A16), group size 128, asimétrico, observer mse; capas específicas en bf16 (vision tower, `linear_attn.in_proj_{a,b}`, `lm_head`, normas, MTP head) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye `model.safetensors` y `model-mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso con torre de visión (VLM) y arquitectura `qwen3_5`. Incluye una cabeza MTP (multi-token prediction) para decodificación especulativa y capas de atención lineal (`linear_attn.in_proj_{a,b}`) que se mantienen en bf16 durante la cuantización. La abliteración se realizó mediante un proceso "Heretic cyber-targeted" (trial 245) combinado con un peel residual Arditi de beta=0.4 sin restauración de normas, dirigido a suprimir los rechazos de seguridad. Las direcciones de abliteración se calcularon en modo de no-pensamiento (`/no_think`), y la evaluación de rechazos también se realizó en ese modo. La torre de visión y la cabeza MTP no fueron modificadas.

La cuantización AWQ se aplicó con `compressed-tensors` sobre las capas lineales (target `[Linear]`), con calibración basada en 256 muestras de razonamiento CoT (thinking-mode) del dataset Magpie-Reasoning-V2 a una longitud de secuencia de 1024. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO), ya que no se ha publicado en la model card.

## Capacidades

- Generación de texto y razonamiento: el modelo mantiene capacidades de razonamiento matemático, con un resultado de 22/25 (88 %) en GSM8K usando presupuesto completo de pensamiento (thinking mode).
- Modo thinking y no-thinking: soporta dos modos de inferencia (`/think` y `/no_think`), lo que permite alternar entre razonamiento explícito y generación directa.
- Capacidades multimodales: al ser un VLM, incluye una torre de visión (vision tower) que procesa entradas visuales, aunque no se especifican detalles sobre los tipos de imágenes soportadas.
- Decodificación especulativa: la cabeza MTP en bf16 permite acelerar la generación mediante predicción multi-token, especialmente útil en hardware limitado como V100.
- Ausencia de rechazos: la abliteración elimina los mecanismos de rechazo de seguridad, por lo que el modelo responde a peticiones que normalmente serían bloqueadas (con un índice de apertura "cyber" de 99/100).

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar el comportamiento de sistemas sin refusals, analizar cómo se manifiestan los sesgos subyacentes y evaluar técnicas de abliteración en entornos controlados.
- Despliegue en hardware legacy (V100): gracias a la cuantización W4A16 y al KV-cache FP8, puede ejecutarse en GPUs V100 de 16 GB con tensor parallelism, lo que facilita pruebas de inferencia en infraestructuras antiguas sin acceso a GPUs modernas.
- Evaluación de decodificación especulativa con MTP: sirve como banco de pruebas para medir la aceleración de generación multi-token en modelos grandes con runtime 1Cat-vLLM.
- Generación de contenido creativo sin restricciones: en contextos de investigación artística o literaria donde se requiera explorar temas sensibles sin filtros automáticos, siempre bajo supervisión humana.
- Análisis de robustez del razonamiento matemático: con un 88 % en GSM8K, puede usarse para probar pipelines de razonamiento CoT en tareas aritméticas y lógicas.
- Estudio de la interacción visión-lenguaje en modelos abliterados: al conservar la torre de visión, permite investigar cómo la eliminación de rechazos afecta a tareas multimodales (por ejemplo, descripción de imágenes con contenido delicado).

## Benchmarks y rendimiento

La única métrica publicada en la model card es GSM8K (razonamiento matemático) con presupuesto completo de pensamiento:

| Benchmark | Resultado |
|---|---|
| GSM8K | 22/25 (88 %) |

No se han publicado resultados adicionales (MMLU, HumanEval, etc.) en la información disponible. No se dispone de comparaciones formales con otros modelos en la misma categoría.

## Requisitos de hardware

- VRAM estimada: con cuantización W4A16 (pesos int4, activaciones bf16), los pesos ocupan aproximadamente 13,7 GB (27,36 B × 0,5 bytes), más overhead de activaciones, KV-cache y cabezas en bf16. El tamaño total del repositorio es de 19,6 GB, por lo que se recomienda al menos 2×16 GB de VRAM para inferencia con contexto razonable.
- GPUs recomendadas: NVIDIA V100 (SM70) es el objetivo principal, en configuración de 2×V100 con tensor parallelism (TP2). También debería funcionar en GPUs más modernas con soporte para las operaciones requeridas.
- Compatibilidad con consumer GPU: no se ha probado en GPUs de consumo (RTX 3090/4090), pero dado que el modelo está cuantizado y la arquitectura es estándar, podría ejecutarse en GPUs con 16 GB o más de VRAM usando llama.cpp o vLLM estándar, aunque no está garantizado.
- Opciones de despliegue: 1Cat-vLLM (recomendado, con soporte para V100), vLLM estándar (si soporta la arquitectura `qwen3_5`), potencialmente llama.cpp y Ollama si se convierte a GGUF.
- Latencia y throughput: no se han publicado mediciones. La decodificación especulativa con MTP debería mejorar el throughput, pero los datos concretos dependen de la configuración de hardware y contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa formal con otros modelos de la misma categoría (por ejemplo, Qwen3.8-27B original u otros VLM abliterados). Se puede señalar que este modelo es una variante cuantizada y abliterada de Qwen3.8-27B, pero no se conocen las especificaciones exactas del modelo base (contexto, idiomas, rendimiento en otros benchmarks) ni las de alternativas comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los rechazos de seguridad, lo que significa que puede generar contenido dañino, ilegal o éticamente problemático. Está destinado exclusivamente a investigación y su uso debe cumplir la legislación aplicable.
- Sesgos no documentados: no se ha publicado ningún análisis de sesgos (de género, raza, religión, etc.) para este modelo o su base. Es probable que herede sesgos del dataset de entrenamiento original de Qwen3.8-27B, pero no hay datos verificables.
- Riesgo de alucinación: no se han evaluado tasas de alucinación específicas. El rendimiento en GSM8K sugiere razonamiento coherente, pero no garantiza veracidad factual.
- Limitaciones de idioma: no se especifican los idiomas soportados; se asume que hereda las capacidades multilingües de Qwen3.8-27B, pero sin confirmación.
- Contexto limitado en V100: aunque la longitud de contexto no está publicada, la configuración con 2×V100 y KV-cache FP8 puede requerir ajustes finos de `--gpu-memory-utilization` para presupuestos de contexto largos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor advierte explícitamente que es un "modelo de investigación" y que el uso debe ser legal y responsable. La eliminación de refusals podría generar responsabilidad legal en ciertos contextos.
- Sin soporte oficial: el modelo tiene 0 descargas y 0 likes; no hay garantías de mantenimiento, corrección de errores o documentación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber-W4A16-AWQ
- Modelo base (no cuantizado): https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Runtime recomendado (1Cat-vLLM): https://github.com/1CatAI/1Cat-vLLM
