# BigFamTLLM/da-base

## Resumen

da-base es un modelo de lenguaje de tipo base (no ajustado a instrucciones) desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 de la Universidad de Oslo durante el otoño de 2026. Se trata de un modelo entrenado desde cero sobre 26.000 millones de tokens de texto en danés, empleando un tokenizador específico de danés con un vocabulario de 32.000 entradas. Su propósito es servir como referencia controlada dentro de un experimento comparativo más amplio sobre transferencia lingüística entre lenguas escandinavas.

El modelo adopta la arquitectura Qwen3, con 36 capas, un tamaño oculto de 2176 y 34 cabezas de atención (17 cabezas KV), lo que resulta en aproximadamente 2.115 millones de parámetros con embeddings atados. La longitud de contexto es de 4096 tokens. Es relevante en el contexto de la investigación en modelos de bajo recurso porque forma parte de un conjunto de 50 checkpoints que permiten aislar el efecto del entrenamiento desde cero frente al ajuste continuado y la adaptación de embeddings entre lenguas emparentadas.

A pesar de su etiqueta de idioma danés, el modelo se evalúa en la suite NorEval 1.1 (tareas en noruego bokmål y nynorsk), lo que refleja el diseño experimental del proyecto: comparar el rendimiento en noruego de un modelo entrenado exclusivamente en danés con el de modelos entrenados en noruego o multilingües. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas, hidden size 2176, 34 cabezas de atención (17 KV), embeddings atados |
| Parametros totales | 2.115.305.088 (~2,12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bfloat16) |
| Idiomas soportados | danés (da); evaluación en noruego bokmål y nynorsk |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración densa: 36 capas transformer con atención multi-cabeza con 34 cabezas de consulta y 17 de clave-valor, tamaño oculto de 2176 y embeddings atados entre la capa de entrada y la de salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia de 4096, tamaño de lote de 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de calentamiento y sin decaimiento (1e-4 en la fase de solo embeddings). Los datos provienen de HPLT 4.0 y suman 26.000 millones de tokens de danés, sin presencia de noruego en el corpus.

El tokenizador es específico de danés con 32.000 entradas, y en el proceso de intercambio de vocabulario los tokens compartidos conservan su embedding mientras que los nuevos se inicializan a partir de la media de las piezas del tokenizador anterior. El checkpoint publicado corresponde al modelo tal como se entrenó, sin la fase de annealing (existe una variante separada, da-base-anneal, con 916 pasos de annealing sobre 0,48B tokens de alta calidad en bokmål y nynorsk). La conversión a formato Hugging Face se realizó con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en danés; el modelo es de tipo base y no está ajustado a instrucciones.
- Modelado de lenguaje y continuación de texto condicionada por contexto de hasta 4096 tokens.
- Capacidad limitada de comprensión lectora y respuesta a preguntas en noruego (bokmål y nynorsk), medida en NorEval 1.1.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al danés como lengua de entrenamiento; el rendimiento en noruego es consecuencia de la proximidad tipológica y se mide experimentalmente.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre transferencia entre lenguas escandinavas: sirve como condición de control para medir cuánto noruego "emerge" en un modelo entrenado exclusivamente en danés, comparándolo con no-base y ml-base del mismo proyecto.
- Evaluación de tokenizadores específicos de lengua: permite estudiar el impacto de un vocabulario danés de 32k en tareas de noruego frente a tokenizadores multilingües o noruegos.
- Reproducción de experimentos de entrenamiento desde cero: el checkpoint y la receta (Megatron-LM, GH200, AdamW, 5e-4) permiten replicar el pipeline en entornos académicos con presupuesto similar.
- Estudio de la fase de annealing: al existir da-base-anneal con el mismo punto de partida, se puede aislar el efecto de 0,48B tokens de datos de alta calidad sobre las métricas de NorEval.
- Análisis de robustez ante ruido: el modelo se evaluó con versiones ruidosas de tres tareas de NorEval, lo que lo hace útil para investigar degradación bajo perturbaciones en lenguas de bajo recurso.
- Docencia y formación en entrenamiento de LLM: el proyecto documenta 50 checkpoints con la misma arquitectura y presupuesto, lo que facilita prácticas guiadas sobre tokenización, CPT y evaluación comparada.
- Generación de texto en danés para experimentos lingüísticos: continuación de texto y análisis de distribuciones léxicas, siempre en contextos de investigación y no en producción.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre NorEval 1.1 (modelo evaluado en noruego pese a entrenarse solo en danés):

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0.071 | 0.088 |
| nob_orthography | acc | 0.788 | 0.792 |
| nob_reading | f1 | 0.117 | 0.129 |
| nob_world | acc | 0.267 | 0.268 |
| nno_language | em_first | 0.034 | 0.079 |
| nno_world | acc | 0.246 | 0.255 |

Robustez (versiones ruidosas de tres tareas de NorEval): 0.321 en entrada limpia y -0.039 de media bajo ruido.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 2,12B parámetros ocupan aproximadamente 4,2 GB de pesos, más overhead de activaciones y caché KV; con 4096 tokens de contexto el consumo total razonable ronda los 6-8 GB en GPU.
- GPU recomendadas: A100, H100 o GH200 para entrenamiento y evaluación a gran escala; para inferencia, cualquier GPU con al menos 8 GB de VRAM es suficiente en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y GPUs con 8 GB o más; en cuantización de 8 bits o 4 bits cabría en GPUs de 6 GB, aunque no se han publicado pesos cuantizados en el repo.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (etiqueta endpoints_compatible) y, previsiblemente, vLLM y llama.cpp si se generan pesos GGUF, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| da-base (este) | ~2,12B | 4096 | 26B tokens danés, desde cero | no disponible | Hugging Face |
| no-base | misma arquitectura y presupuesto | 4096 | desde cero en noruego | no disponible | Hugging Face |
| ml-base | misma arquitectura y presupuesto | 4096 | desde cero multilingüe | no disponible | Hugging Face |
| da-emb | misma arquitectura | 4096 | danés, solo embeddings | no disponible | Hugging Face |

Los tres modelos comparables pertenecen al mismo proyecto BigFamTLLM y comparten arquitectura, cómputo y presupuesto, lo que los convierte en la referencia natural para aislar el efecto del idioma de entrenamiento. No se dispone de comparación con modelos externos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Entrenado exclusivamente en danés: el rendimiento en noruego es bajo y se documenta solo como resultado experimental (por ejemplo, 0.034-0.088 en em_first para tareas de lengua).
- Riesgo de alucinación y de generar contenido incorrecto u ofensivo, tal como advierte el propio autor; no apto para producción.
- Sesgos presentes en el corpus HPLT 4.0 (texto web), no filtrados ni mitigados mediante RLHF o DPO.
- Contexto limitado a 4096 tokens, insuficiente para tareas de contexto largo.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Robustez ante ruido negativa (-0.039 de media), lo que indica degradación bajo perturbaciones en las tareas evaluadas.
- Proyecto académico de un curso: sin mantenimiento garantizado ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-base
- Variante con annealing: https://huggingface.co/BigFamTLLM/da-base-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Modelo multilingüe con annealing: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo danés solo embeddings: https://huggingface.co/BigFamTLLM/da-emb
- Modelo danés solo embeddings con annealing: https://huggingface.co/BigFamTLLM/da-emb-anneal
- Checkpoints CPT danés 1 a 10: https://huggingface.co/BigFamTLLM/da-cpt1 (hasta da-cpt10)
- Checkpoints CPT danés con annealing: https://huggingface.co/BigFamTLLM/da-cpt1-anneal (hasta da-cpt10-anneal)
- Checkpoints CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt1 (hasta ml-cpt10) y variantes con annealing
- Corpus HPLT 4.0: no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
