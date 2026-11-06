# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic es una variante "decensored" del modelo Mistral-Small-3.2-24B-Instruct-2506, publicada por el usuario richardyoung. Se ha generado aplicando la tecnica Magnitude-Preserving Orthogonal Ablation (MPOA) mediante la herramienta Heretic v2.0.0 sobre los pesos del modelo base distribuido por unsloth. El objetivo es reducir la tasa de rechazos (refusals) ante peticiones que el modelo original declinaria, manteniendo al mismo tiempo la mayor parte de las capacidades del modelo de partida.

El modelo base es un transformer multimodal de Mistral AI con 24.011.361.280 parametros (aproximadamente 24B), disenado para tareas de texto e imagen-a-texto, con soporte de function calling y un contexto amplio. La version heretic conserva la licencia Apache 2.0 y el pipeline image-text-to-text, y anade las etiquetas uncensored, decensored y abliterated.

La relevancia de esta ficha radica en que documenta un caso de "abliteration" reproducible: el autor publica los parametros exactos de la ablacion y un directorio `reproduce` para replicar el proceso. Es util para investigadores que estudian alineamiento, refusal behaviour y los compromisos entre censura y calidad, pero conviene tratarlo con cautela en produccion por su naturaleza no oficial y por la perdida de garantias de seguridad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (mistral3), texto e imagen-a-texto; detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 24.011.361.280 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria vllm) |

## Arquitectura y entrenamiento

El modelo es una ablacion del Mistral-Small-3.2-24B-Instruct-2506, que a su vez es una actualizacion menor de Mistral-Small-3.1-24B-Instruct-2503. La arquitectura subyacente es un transformer multimodal de Mistral AI que procesa texto e imagenes (pipeline image-text-to-text). No se dispone en la informacion proporcionada del numero de capas, dimensiones ocultas, mecanismo de atencion ni del volumen y composicion del dataset de entrenamiento original.

La innovacion tecnica de esta variante es la aplicacion de Magnitude-Preserving Orthogonal Ablation (MPOA) con Heretic v2.0.0. La ablacion se realiza por capa (`direction_index: per layer`) sobre dos proyecciones: `attn.o_proj` y `mlp.down_proj`. Los parametros publicados incluyen pesos maximos y minimos y sus posiciones y distancias (por ejemplo, `attn.o_proj.max_weight` = 1.49 en posicion 25.33, `mlp.down_proj.max_weight` = 1.22 en posicion 23.61). El proceso es reproducible segun el autor, que incluye un directorio `reproduce` con instrucciones. No se detalla si hubo entrenamiento adicional, RLHF o DPO en esta variante; se trata de una modificacion de pesos, no de un reentrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en 24 idiomas declarados.
- Razonamiento, matematicas y resolucion de problemas STEM (MMLU, MMLU Pro, MATH, GPQA en los benchmarks del modelo base).
- Generacion de codigo (MBPP Plus, HumanEval Plus en los benchmarks del modelo base).
- Vision: comprension de imagenes, graficos, documentos y diagramas (MMMU, MathVista, ChartQA, DocVQA, AI2D).
- Function calling / tool calling, con plantilla de llamadas a funciones mas robusta en la version 3.2 respecto a 3.1.
- Capacidades de agente y razonamiento multi-paso (segun las caracteristicas heredadas del modelo base).
- Reduccion de rechazos: 13/100 refusals frente a 98/100 del modelo original en la evaluacion del autor.
- Capacidades multilingues amplias (europeas, asiaticas, arabe, persa, hindi, bengali, etc.).

## Casos de uso

- Investigacion sobre alineamiento y refusal behaviour: el modelo permite estudiar como la ablacion MPOA modifica la tasa de rechazos (de 98/100 a 13/100) y su impacto en la divergencia KL (0.0938), con parametros reproducibles para experimentos controlados.
- Generacion de codigo en pipelines internos: gracias a su rendimiento en HumanEval Plus (92.90% pass@5 en el modelo base) y al soporte de function calling, puede integrarse en asistentes de desarrollo y revision de codigo.
- Analisis de documentos con vision: con DocVQA del 94.86% y ChartQA del 87.4% en el modelo base, es adecuado para extraer informacion de facturas, informes y graficos en flujos de automatizacion documental.
- Atencion al cliente multilingue: cubre 24 idiomas y conversaciones multi-turno, util para prototipos de asistencia en mercados con varios idiomas, siempre que se acepte el riesgo de contenido no filtrado.
- Generacion de contenido creativo sin restricciones de tono: escritura de ficcion, guiones o material editorial donde el modelo original rechazaria ciertos temas, con la advertencia de revision humana obligatoria.
- Evaluacion comparativa de modelos "abliterated": sirve como referencia para medir la degradacion de capacidades tras la ablacion frente al modelo original en tareas STEM y de vision.
- Prototipado de agentes con herramientas: el soporte de function calling y razonamiento multi-paso permite construir agentes que consultan APIs o bases de datos en entornos controlados.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Mistral-Small-3.2-24B-Instruct-2506 (no a la variante heretic, salvo las metricas de refusals y KL). No se han publicado benchmarks de la variante heretic en tareas STEM o de vision en la informacion disponible.

Metricas especificas de la variante heretic:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Refusals | 13/100 | 98/100 |
| KL divergence | 0.0938 | 0 (por definicion) |

Benchmarks del modelo base (Mistral-Small-3.2-24B-Instruct-2506):

| Benchmark | Small 3.1 24B | Small 3.2 24B |
|---|---|---|
| Wildbench v2 | 55.6% | 65.33% |
| Arena Hard v2 | 19.56% | 43.1% |
| IF (interno, accuracy) | 82.75% | 84.78% |
| Infinite Generations (menor es mejor) | 2.11% | 1.29% |
| MMLU | 80.62% | 80.50% |
| MMLU Pro (5-shot CoT) | 66.76% | 69.06% |
| MATH | 69.30% | 69.42% |
| GPQA Main (5-shot CoT) | 44.42% | 44.22% |
| GPQA Diamond (5-shot CoT) | 45.96% | 46.13% |
| MBPP Plus - Pass@5 | 74.63% | 78.33% |
| HumanEval Plus - Pass@5 | 88.99% | 92.90% |
| SimpleQA (TotalAcc) | 10.43% | 12.10% |
| MMMU | 64.00% | 62.50% |
| MathVista | 68.91% | 67.09% |
| ChartQA | 86.24% | 87.4% |
| DocVQA | 94.08% | 94.86% |
| AI2D | 93.72% | 92.91% |

## Requisitos de hardware

- VRAM estimada para inferencia: con 24B parametros en safetensors (48.1 GB de repo), en BF16 se requieren aproximadamente 48 GB de VRAM solo para pesos, mas overhead de KV cache; en cuantizacion de 8 bits rondaria 24-28 GB y en 4 bits 14-16 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 80GB o H100 para BF16 sin cuantizar; L40S 48GB o A6000 48GB al limite en BF16; RTX 4090 24GB solo con cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion (RTX 4090 24GB en 4-8 bits; RTX 3090 24GB en 4 bits). No cabe en BF16 en GPUs de 24GB.
- Opciones de despliegue: vLLM >= 0.9.1 (recomendado por el autor, con mistral_common >= 1.6.2) y transformers. No se mencionan llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: la model card del modelo base recomienda temperatura baja (0.15) y anadir un system prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic (este) | 24B | No disponible | Apache 2.0 | Variante abliterated; 13/100 refusals |
| Mistral-Small-3.2-24B-Instruct-2506 | 24B | No disponible | Apache 2.0 | Modelo original; 98/100 refusals |
| Mistral-Small-3.1-24B-Instruct-2503 | 24B | No disponible | Apache 2.0 | Version anterior; peor instruction following y mas generaciones infinitas |
| unsloth/Mistral-Small-3.2-24B-Instruct-2506 | 24B | No disponible | Apache 2.0 | Base utilizada por el autor para la ablacion |

No se dispone de datos de otros modelos de 24B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: no esta publicado por Mistral AI ni por unsloth, sino por un usuario independiente; no hay garantias de soporte ni mantenimiento.
- Perdida de alineamiento de seguridad: la ablacion elimina gran parte de los rechazos (de 98/100 a 13/100), por lo que puede generar contenido que el modelo original bloquearia. No es apto para aplicaciones publicas sin moderacion externa.
- Divergencia KL de 0.0938 respecto al original: implica cambios medibles en la distribucion de salida que pueden afectar a la calidad en tareas sensibles.
- Riesgo de alucinacion: heredado del modelo base (SimpleQA TotalAcc del 12.10%), agravado potencialmente por la ablacion.
- Idiomas: aunque se declaran 24 idiomas, el rendimiento puede variar y no hay evaluaciones por idioma en la informacion disponible.
- Contexto: no se especifica la longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones muy largas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento normativo del contenido generado.
- Uso en produccion: requiere revision humana y filtros de contenido propios; no debe desplegarse en entornos donde se exija un comportamiento alineado.
- La model card del modelo base recomienda temperatura 0.15 y system prompt; ignorarlo puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic
- Modelo base (unsloth): https://huggingface.co/unsloth/Mistral-Small-3.2-24B-Instruct-2506
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Mistral-Small-3.1-24B-Base-2503: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- Proyecto Heretic: https://heretic-project.org
- Repositorio de reproduccion: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-MPOA-heretic/tree/main/reproduce
- System prompt del modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506/blob/main/SYSTEM_PROMPT.txt
- vLLM: https://github.com/vllm-project/vllm
- mistral-common: https://github.com/mistralai/mistral-common
