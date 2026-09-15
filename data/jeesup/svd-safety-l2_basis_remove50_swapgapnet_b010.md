# Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010

## Resumen

El modelo `svd-safety-l2_basis_remove50_swapgapnet_b010` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, desarrollado por Jeesup. Su propósito es estudiar cómo la compresión por descomposición en valores singulares (SVD) afecta al comportamiento de seguridad de un modelo de lenguaje alineado, y qué reglas de selección de componentes permiten reparar ese daño. Para ello, el modelo base se ha comprimido mediante la técnica Basis Sharing (ICLR 2025), que comparte bases entre grupos de dos capas adyacentes, eliminando el 50 % de los parámetros densos. Posteriormente se han aplicado diez rondas de un proceso iterativo de intercambio de componentes (swap) con la regla `swapgapnet_iter`, que selecciona qué componentes restaurar según un valor neto calculado a partir de la inserción y la eliminación en orden sigma. El resultado es un modelo con 6.738.415.616 parámetros totales en el checkpoint, pero con una fracción efectiva de parámetros de 0,4998.

Este artefacto es relevante porque la compresión de modelos es una vía crucial para desplegar grandes modelos de lenguaje en entornos con recursos limitados, y la interacción entre compresión y alineación de seguridad sigue siendo un área abierta. El autor lo presenta como una celda de una cuadrícula experimental que baraja reglas de selección y presupuestos de restauración, por lo que no debe considerarse un modelo de chat de propósito general, sino un sujeto de experimentación para medir el equilibrio entre utilidad y seguridad bajo compresión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-2-7b-chat) con compresión Basis Sharing sobre grupos de 2 capas adyacentes |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors, sin cuantización especificada) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (llama2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer de Llama-2-7b-chat. La compresión se realiza mediante Basis Sharing, una técnica presentada en ICLR 2025 que comparte bases de descomposición entre grupos de dos capas adyacentes, lo que reduce el número de parámetros densos al 50 %. Tras la compresión, se aplica un procedimiento de reparación en diez rondas iterativas. Cada ronda selecciona un 0,1 % de los parámetros densos (presupuesto total del 1,0 %) según la regla `swapgapnet_iter`, que ordena los componentes por su valor sigma y calcula un valor neto de intercambio (valor de inserción más valor de eliminación). Se restauran 4.512 componentes y se intercambian otros tantos, resultando una fracción de parámetros de 0,4998.

Para la recuperación se utiliza un ajuste fino con LoRA de rango 8 sobre los coeficientes por capa, manteniendo las bases congeladas y el presupuesto de parámetros sin cambios. Este ajuste se ejecuta durante 2 épocas con una tasa de aprendizaje de 0,0001, tamaño de lote 64 y el dataset alpaca-cleaned. No se ha realizado ningún proceso de RLHF o DPO adicional; la única señal de entrenamiento posterior a la compresión es este LoRA de recuperación.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto, pero su calidad se ve afectada por la compresión al 50 % y por el proceso de reparación experimental.
- Razonamiento: no se han publicado evaluaciones específicas de razonamiento; se espera una degradación similar a la de otros modelos comprimidos.
- Código y matemáticas: no se dispone de información sobre estas capacidades en la documentación del modelo.
- Visión y audio: no soporta entradas multimodales.
- Tool calling: no se menciona soporte de function calling; el modelo base Llama-2 no lo incorpora de forma nativa.
- Agentes: no se han documentado capacidades de razonamiento multi-paso o uso de herramientas.
- Multilingüe: no se especifica en la información disponible; heredado del modelo base, pero no confirmado.
- Capacidades especiales: no dispone de modo de pensamiento (thinking mode) ni de otras funcionalidades adicionales. Su único propósito es servir como artefacto de investigación para medir el impacto de la compresión en la seguridad.

## Casos de uso

- Investigación en interpretabilidad de seguridad: el modelo permite analizar cómo la compresión por SVD altera la alineación de seguridad en un modelo de chat, comparando el comportamiento antes y después de la reparación.
- Evaluación de técnicas de compresión: sirve como punto de referencia para comparar distintas reglas de selección de componentes (por ejemplo, `swapgapnet_iter` frente a otras) en términos de recuperación de la seguridad.
- Benchmarking de robustez de modelos comprimidos: las métricas de AdvBench ASR y StrongREJECT ASR proporcionan datos cuantitativos para evaluar la tasa de éxito de ataques en modelos con 50 % de compresión.
- Desarrollo de métodos de reparación de seguridad: el checkpoint es útil para probar nuevas estrategias de ajuste fino o de intercambio de componentes que mitiguen el daño causado por la compresión.
- Análisis de trade-offs entre tamaño y seguridad: permite estudiar cuánta compresión es tolerable antes de que el comportamiento seguro se degrade de forma inaceptable, información clave para el despliegue en entornos con recursos limitados.
- Educación y divulgación científica: puede utilizarse como ejemplo práctico de un modelo experimental en cursos o talleres sobre compresión de modelos y alineación de seguridad, mostrando cómo se cuantifica el daño y se evalúa la reparación.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los recogidos en la model card del autor, obtenidos con jueces automáticos (HarmBench y WildGuard):

| Métrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,1231 |
| StrongREJECT ASR (HarmBench judge) | 0,2396 |
| Macro over-refusal (WildGuard) | 0,0751 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Estas métricas deben interpretarse en el contexto del estudio de compresión: una tasa de éxito de ataque (ASR) baja indica mejor mantenimiento de la seguridad, mientras que un over-refusal bajo indica que el modelo no rechaza demasiado las peticiones legítimas. No se dispone de los valores del modelo base sin comprimir para establecer una comparación directa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.738.415.616 parámetros en formato safetensors, presumiblemente en FP16, los pesos ocupan alrededor de 13,5 GB. Sumando el overhead de activaciones y la caché KV, se recomienda al menos 16 GB de VRAM para inferencia básica.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) permiten ejecutar el modelo sin cuantización. En GPUs con 16 GB, como la RTX 4080 o la RTX 4070 Ti, podría funcionar con precaución y usando tamaños de lote pequeños.
- Compatibilidad con GPU de consumo: es posible ejecutarlo en una GPU de consumo de 16 GB o superior, aunque no se han publicado mediciones de rendimiento.
- Opciones de despliegue: el modelo está etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse con TGI, vLLM o Transformers. También puede convertirse a GGUF para su uso con llama.cpp u Ollama, aunque no se proporciona una cuantización precalculada.
- Latencia y throughput: no se han publicado datos de latencia ni de throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| meta-llama/Llama-2-7b-chat-hf (base) | 6.738.415.616 | No disponible | Llama 2 Community License | Chat generalista |
| Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010 | 6.738.415.616 (fracción efectiva 0,4998) | No disponible | Llama 2 Community License | Artefacto de investigación sobre compresión y seguridad |
| Otros checkpoints de la misma cuadrícula | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables con métricas de seguridad publicadas. La comparación con el modelo base es conceptual: el checkpoint comprimido mantiene el mismo número de parámetros almacenados, pero solo aproximadamente la mitad son efectivos tras la compresión, y su comportamiento de seguridad es objeto de estudio.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado para experimentación y no debe desplegarse como asistente de chat en producción.
- La compresión al 50 % degrada la calidad de la generación y el comportamiento de seguridad; algunas variantes de la cuadrícula están deliberadamente degradadas en mayor medida.
- Riesgo de alucinación: la compresión puede aumentar la probabilidad de respuestas incoherentes o inventadas, aunque no se han realizado evaluaciones específicas.
- Sesgos: el modelo hereda los sesgos de Llama-2-7b-chat y del dataset alpaca-cleaned utilizado en la recuperación LoRA.
- Restricciones de licencia: la licencia Llama 2 Community License incluye una política de uso aceptable (USE_POLICY.md) que debe revisarse antes de cualquier uso comercial.
- Evaluación limitada: solo se han medido tres métricas de seguridad; no se han evaluado capacidades generales como razonamiento, código o matemáticas.
- Longitud de contexto no confirmada: no se ha especificado la ventana de contexto real del checkpoint, por lo que no se recomienda asumir un valor concreto.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapgapnet_b010

La búsqueda web no ha devuelto resultados adicionales relevantes (papers, blogs o repos) para este modelo.
