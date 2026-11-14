# mhseo2/klear8b-planfmt-sftv5-s376

## Resumen

klear8b-planfmt-sftv5-s376 es un ajuste fino supervisado (SFT) del modelo Kwai-Klear/Klear-Reasoner-8B-SFT, publicado por el usuario mhseo2 en Hugging Face. El modelo pertenece a la familia Qwen3 (según los tags del repositorio) y cuenta con 8.190.735.360 parámetros totales en formato safetensors bf16, lo que lo sitúa en la categoría de modelos de 8B orientados a razonamiento y generación de texto conversacional.

El objetivo declarado del ajuste es introducir un formato de planificación intercalada: durante la fase de pensamiento (thinking), cada paso va precedido de su propia línea `<plan>`, en lugar de un plan inicial único. Se entrenó sobre el conjunto `mhseo2/klear-planfmt-pgdpo-pairs` (partición `sft_v5_interleaved`), con 12.408 filas de entrenamiento y 82 de validación, usando la receta de SFT de verl durante 376 pasos.

El modelo es relevante para quienes investigan formatos de razonamiento estructurado y quieren evaluar cómo la planificación intercalada afecta a la calidad del razonamiento paso a paso. No obstante, se trata de un checkpoint de investigación con cero descargas y sin model card extendida, licencia declarada ni idiomas especificados, por lo que su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según tags) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16, convertido desde FSDP con `verl.model_merger`) |

## Arquitectura y entrenamiento

El modelo parte de Kwai-Klear/Klear-Reasoner-8B-SFT (revisión 18e3d4f7), un modelo de 8B parámetros de la familia Qwen3 orientado a razonamiento, y aplica un SFT adicional con la librería verl. El entrenamiento consistió en 1 época, 376 pasos, batch de 33 y learning rate 2e-5 con scheduler coseno (warmup del 3 %, mínimo 0.5). La longitud máxima de secuencia fue de 32.768 tokens.

La innovación técnica principal es el formato de plan intercalado: en lugar de generar un plan completo al inicio del bloque de pensamiento, el modelo emite una línea `<plan>` antes de cada paso de razonamiento. Para reforzar esta estructura se usaron `structure_weight` 20 y un `plan_contrast shift` con margen 0.1 y peso 1.0. El checkpoint final (global_step_376) reporta loss de validación 0.3093, NLL de línea de plan 1.020 y NLL de paso 0.268. El tokenizer y la plantilla de chat son los del modelo base, con token EOS `<|im_end|>`. No se documentan detalles sobre la composición del corpus original ni sobre fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso en modo thinking.
- Planificación intercalada: emisión de una línea `<plan>` antes de cada paso dentro del bloque de pensamiento.
- Razonamiento estructurado multi-paso, orientado a tareas que requieren descomposición explícita.
- Generación de código y matemáticas: capacidad heredada del modelo base Klear-Reasoner-8B-SFT (no verificada de forma independiente en este checkpoint).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre formatos de razonamiento: el modelo sirve para estudiar empíricamente si la planificación intercalada mejora la trazabilidad del razonamiento frente a planes iniciales únicos, comparando las líneas `<plan>` generadas con las de otros checkpoints de la misma familia.
- Evaluación de SFT con verl: reproducible como referencia para validar recetas de SFT con `structure_weight` y `plan_contrast shift` sobre modelos de 8B.
- Generación de trazas de razonamiento auditables: en entornos de investigación donde se necesita inspeccionar cada paso y su plan asociado, el formato intercalado facilita la revisión manual de la cadena de pensamiento.
- Destilación de datos de razonamiento: las salidas con planes por paso pueden usarse como datos sintéticos para entrenar modelos más pequeños en razonamiento estructurado.
- Análisis de fallos en cadenas de razonamiento: la separación explícita entre plan y paso permite localizar en qué punto se desvía el razonamiento, útil en estudios de alucinación y consistencia.
- Prototipado de asistentes técnicos con razonamiento visible: en herramientas internas donde el usuario quiere ver el plan de cada paso antes de la respuesta final, aunque requiere validación previa por la falta de licencia e idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de validación del entrenamiento: loss 0.3093, plan-line NLL 1.020 y step NLL 0.268 en el paso 376.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos (estimación, no confirmada por el autor).
- VRAM estimada en cuantización de 4 bits: alrededor de 5-6 GB para pesos (estimación, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 32.768 tokens; RTX 4090 (24 GB) para inferencia en bf16 con contexto reducido.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti Super; no se garantiza en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp tras conversión a GGUF, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftv5-s376 | 8,19B | 32.768 | no disponible | Hugging Face, 0 descargas | SFT de investigación con plan intercalado |
| Kwai-Klear/Klear-Reasoner-8B-SFT | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Modelo base del que deriva este checkpoint |
| Qwen3-8B | no disponible en la información | no disponible | no disponible | Hugging Face | Familia indicada en los tags; no se dispone de comparación directa verificada |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica permiso de uso comercial ni condiciones de redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y el rendimiento fuera del inglés.
- Checkpoint de investigación con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Model card mínima: no se documentan sesgos, datos de preentrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinación: inherente a los modelos de razonamiento de 8B; el formato de plan intercalado no elimina este riesgo y puede dar una falsa apariencia de rigor.
- Longitud de contexto: aunque se entrenó con 32.768 tokens, el rendimiento más allá de esa longitud no está validado y puede degradarse.
- Formato de salida específico: el modelo espera y genera líneas `<plan>`; su uso fuera de ese formato puede producir salidas inconsistentes.
- Tokenizer y plantilla de chat heredados del modelo base, con EOS `<|im_end|>`; una integración incorrecta de la plantilla puede degradar la calidad.
- Sin datos de benchmarks: no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/klear8b-planfmt-sftv5-s376
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/mhseo2/klear-planfmt-pgdpo-pairs
- Librería verl: https://github.com/volcengine/verl
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://huggingface.co/docs/text-generation-inference
