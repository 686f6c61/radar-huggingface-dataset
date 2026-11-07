# Shokou1/qwen3.5-poetry-9b-v1

## Resumen

Qwen3.5-Poetry-9B-v1 es un adaptador LoRA desarrollado por el usuario Shokou1 sobre el modelo base Qwen/Qwen3.5-9B, especializado en poesía y prosa clásica china. El adaptador se entrena mediante SFT (supervised fine-tuning) con un dataset de 40.800 muestras de instrucciones, y cubre géneros como 五绝 (cuarteto de cinco caracteres), 七绝 (cuarteto de siete caracteres), 五律 y 七律 (poemas regulados), 词 (ci), prosa de las dinastías Ming y Qing y fu de estilo sao, además de tareas de expansión de texto.

El modelo resuelve un problema concreto: la generación de poesía clásica china con cumplimiento de formato (número y longitud de cláusulas) y rima, algo que los modelos generalistas no garantizan de forma fiable. Para ello el autor define un protocolo de evaluación propio basado en inventario de rimas de 9 clústeres extraído de 139.000 poemas regulados y detección de novedad mediante 17,1 millones de huellas de 8-gramas.

Es relevante por ser la variante de mayor tamaño de la familia classical-poetry-lm (hermano del qwen3.5-poetry-4b-v2) y por publicar junto al adaptador el dataset, el código de entrenamiento, una draft de paper y una colección curada de muestras. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-9B |
| Parametros totales | no disponible (adaptador LoRA r=32, all-linear, bf16; el modelo base tiene 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencia fija de 768 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M (5,24 GB) disponible; adaptador en bf16 |
| Idiomas soportados | chino (zh), en particular chino clásico |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador troceado en `parts/adapter_model.safetensors.part*`); GGUF para Ollama |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer decoder-only de la familia Qwen3.5. El LoRA usa rango r=32 sobre todas las capas lineales en bf16. El entrenamiento es SFT puro (sin CPT para la variante de 9B), con padding de longitud fija de 768 tokens, 600 pasos y learning rate 5e-5. Se ejecutó en una RTX 5090 Laptop de 24 GB bajo Windows nativo en unas 2 horas, consumiendo aproximadamente 22 GB de VRAM con secuencia 768; con secuencia 1024 se produce OOM en 24 GB.

El dataset de instrucciones (Shokou1/classical-poetry-sft, 40.800 muestras) está compuesto con datos disjuntos por autor para reducir la memorización literal. El autor documenta que a los 200 pasos el modelo reproducía verbatim el *Qiuxi* de Du Mu, y que tras 600 pasos con datos disjuntos por autor este comportamiento ya no se observa. La evaluación emplea un inventario de 9 clústeres de rima minado de 139.000 poemas regulados (86,5% de autoconsistencia) y un índice de 17,1 millones de huellas de 8-gramas sobre 313.000 documentos para medir novedad. No se especifica el número total de tokens de entrenamiento.

## Capacidades

- Generación de poesía clásica china en formatos 五绝, 七绝, 五律 y 七律 con control de número y longitud de cláusulas.
- Composición de 词 (ci) con patrones métricos.
- Redacción de prosa clásica de estilo Ming-Qing (por ejemplo, escuela Tongcheng).
- Generación de fu de estilo sao.
- Expansión de texto a partir de una premisa o fragmento.
- Instrucciones condicionadas por metadatos de dinastía, autor y género en el prompt (por ejemplo, "【宋·南宋·陆游·七律·怀古】").
- Generación de texto instructiva en chino clásico; no se documentan tool calling, function calling, agentes, visión, audio ni modo thinking (el ejemplo de quickstart desactiva `enable_thinking`).
- Capacidad multilingüe limitada al chino; no se reporta soporte de otros idiomas.

## Casos de uso

- Generación de poemas regulados para editores y publicaciones culturales: el modelo acepta en el prompt dinastía, autor de referencia y género, y produce composiciones con control de número y longitud de cláusulas, lo que permite encargos con formato fijo.
- Creación de material didáctico para enseñanza del chino clásico: generar ejemplos de 五绝 y 七绝 con rima consistente para ejercicios de análisis métrico en aulas o plataformas educativas.
- Ampliación creativa de borradores: la tarea de expansión permite tomar un verso o una premisa y desarrollar un poema o un pasaje en prosa clásica, útil en talleres literarios.
- Generación de prosa de estilo Ming-Qing para proyectos editoriales o recreacionistas: el adaptador se entrenó específicamente en ese registro, incluida la escuela Tongcheng.
- Composición de 词 para proyectos musicales o de divulgación: el modelo genera ci con patrones métricos, aprovechable para letras de proyectos escénicos o antologías temáticas.
- Filtrado y aumento de datasets de poesía clásica: dado su bajo índice de solapamiento de 8-gramas (≤0,01) en la evaluación curada, puede emplearse para generar variantes novedosas que amplíen corpus de entrenamiento o evaluación.
- Prototipado de asistentes culturales especializados: desplegado con Ollama mediante el GGUF Q4_K_M (5,24 GB), permite montar una demo local de generación poética sin infraestructura GPU grande, aceptando la pérdida ocasional de calidad en caracteres raros.

## Benchmarks y rendimiento

Evaluación propia del autor en bf16, 2 muestras por género:

| Género | Cumplimiento de cláusulas | Longitud de cláusula | Rima |
|---|---|---|---|
| 五绝 (cuarteto 5 caracteres) | 1/2 | 2/2 | 2/2 |
| 七绝 (cuarteto 7 caracteres) | 2/2 | 2/2 | 2/2 |
| 五律 (regulado 5 caracteres) | 2/2 | 2/2 | 1/2 |
| 七律 (regulado 7 caracteres) | 1/2 | 1/2 | 1/2 |

- Solapamiento de 8-gramas ≤ 0,01 frente a un índice de 17,1 millones de huellas sobre 313.000 documentos (sin memorización verbatim en la evaluación curada).
- Protocolo de rima: inventario de 9 clústeres minado de 139.000 poemas regulados, con 86,5% de autoconsistencia.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para entrenamiento/evaluación: ~22 GB con secuencia 768 en bf16; secuencia 1024 provoca OOM en 24 GB.
- VRAM para inferencia en bf16: no especificada por el autor; el adaptador se carga junto al modelo base de 9B, por lo que se requiere una GPU con capacidad suficiente para el base en bf16 (no cuantificado en la documentación).
- GPU recomendadas: RTX 5090 Laptop 24 GB es el hardware documentado para entrenamiento; para inferencia bf16 se necesita al menos una GPU de 24 GB o superior (A100, H100) según el tamaño del base.
- Consumer GPU: el GGUF Q4_K_M de 5,24 GB cabe en GPUs consumer de 8 GB o más; el adaptador bf16 sobre el base completo requiere más VRAM.
- Despliegue: transformers + peft (quickstart oficial), Ollama con el modelo `poetry-9b-v1` (GGUF Q4_K_M); no se documentan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-Poetry-9B-v1 | 9B (base) + LoRA r=32 | no disponible | Poesía y prosa clásica china | Apache-2.0 | HF (adaptador), Ollama (GGUF) |
| qwen3.5-poetry-4b-v2 | 4B (base) + LoRA | no disponible | Poesía y prosa clásica china (mismo dataset de 40,8k) | no disponible | HF |
| Qwen3.5-9B (base) | 9B | no disponible | Modelo generalista multimodal | Apache-2.0 | HF |

El modelo de 4B comparte dataset y protocolo de evaluación, por lo que sirve como referencia directa de escalado. El base Qwen3.5-9B es la alternativa generalista; según la información de búsqueda, Qwen3.5 incorpora entrenamiento multimodal temprano, capacidades que el adaptador de poesía no documenta conservar.

## Limitaciones y advertencias

- No se realizó CPT para la variante de 9B; solo SFT.
- No hay verificación de tono (平仄), por lo que la métrica tonal de los poemas no está garantizada.
- El GGUF Q4_K_M (5,24 GB) produce ocasionalmente caracteres raros o erratas; para uso con exigencia de calidad se recomienda el adaptador bf16.
- La evaluación es de muestra pequeña (2 muestras por género) y el juicio humano se limita a la colección curada; los resultados deben tomarse como indicativos.
- Riesgo de memorización: a 200 pasos se reprodujo verbatim un poema de Du Mu; aunque a 600 pasos no se observa, el autor recomienda un veto de novedad Best-of-N en despliegue.
- El límite de 24 GB de VRAM restringe entrenamiento y evaluación a secuencias ≤ 768.
- Idiomas: solo chino; no apto para generación multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B.
- Sin datos publicados sobre sesgos, alucinación en contextos no poéticos ni rendimiento en tareas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shokou1/qwen3.5-poetry-9b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset: https://huggingface.co/datasets/Shokou1/classical-poetry-sft
- Repositorio de código y scripts: https://github.com/ShokouP/classical-poetry-lm
- Paper draft (PDF): https://github.com/ShokouP/classical-poetry-lm/blob/main/reports/paper-draft.pdf
- Colección curada de muestras (PDF): https://github.com/ShokouP/classical-poetry-lm/blob/main/reports/qwen3.5-9B-诗文专家模型选.pdf
- Modelo hermano de 4B: https://huggingface.co/Shokou1/qwen3.5-poetry-4b-v2
- Repositorio Qwen3.5 (referencia de la serie): https://github.com/ABDtmx/Qwen3.5
