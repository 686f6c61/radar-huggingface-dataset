# kasui-ai/Kasui-Tanku-2B

## Resumen

Kasui Tanku 2B es un adaptador LoRA de investigación publicado por kasui-ai sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (formato safetensors, BF16) que debe cargarse sobre el checkpoint original de Qwen para funcionar. Su propósito declarado es la investigación en matemáticas de competición en inglés: el adaptador se entrenó mediante destilación de explicaciones matemáticas generadas por DeepSeek V4.1 Flash 1017 a través del endpoint FP8 de DeepInfra en OpenRouter.

El entrenamiento fue deliberadamente pequeño: 71 ejemplos emparejados y 54 pasos de optimizador, ejecutados en una Intel Arc 140V (GPU integrada), con semilla 42. A pesar de esa escala, el autor reporta una mejora de 18,8 puntos porcentuales en MATH-500 (de 119/500 a 213/500) respecto al Qwen3.5-2B sin ajustar, aunque con un matiz importante: 187 de las respuestas del adaptador no incluían la caja final `\boxed{}` exigida por el evaluador, por lo que parte de la mejora se debe a la entrega de respuestas y no solo a la corrección matemática.

La relevancia del proyecto es metodológica más que de producto: demuestra que un ajuste LoRA minúsculo, entrenado en hardware de consumo, puede mover métricas en un modelo de 2B, y publica un protocolo de evaluación inusualmente detallado (MATH-500, AIME 2024, IFEval, MMLU-Pro, MMLU-Redux, C-Eval, SuperGPQA, MMMLU) con auditorías pareadas. No obstante, el repositorio no incluye licencia, no declara pipeline y tiene cero descargas, por lo que debe tratarse como material de investigación, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-2B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | no disponible (pesos liberados en BF16; el modelo base admite las cuantizaciones habituales de Qwen3.5) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, BF16) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un transformer decoder-only de 2B parámetros, mediante PEFT. Los pesos publicados son el LoRA original de la semilla 42 en BF16, con SHA-256 `a989b5bb0f11876194b23fb012e6d433c4fa7de24bf14f35dc64133389168d0f`. El autor indica que la inferencia de referencia se ejecuta con `attn_implementation="eager"`, `dtype=torch.bfloat16`, decodificación greedy, `enable_thinking=False` y un tope de 512 tokens nuevos; el código de carga fija la revisión del modelo base en `15852e8c16360a2fea060d615a32b45270f8a8fc`.

El entrenamiento consistió en destilación de explicaciones matemáticas: 71 ejemplos emparejados, 54 pasos de optimizador, semilla 42, ejecutado en una Intel Arc 140V. El autor reporta réplicas con semillas 43 y 44 para medir varianza: 220 y 205 en traza completa, y 214 y 192 en modo solo explicación, frente a 205 del comparador de solo explicación con semilla 42. No se documentan composición del dataset más allá de "explicaciones matemáticas", ni uso de RLHF o DPO, ni innovaciones de decodificación (no hay decodificación especulativa ni atención lineal propia del adaptador).

## Capacidades

- Razonamiento matemático en inglés orientado a problemas de competición, con formato de respuesta final en `\boxed{}`.
- Generación de explicaciones paso a paso (el autor distingue entre "full trace" y "explanation only").
- Mejora medida en conocimiento general y de dominio: MMLU-Pro, MMLU-Redux, C-Eval, SuperGPQA y MMMLU en el protocolo del autor.
- Seguimiento de instrucciones (IFEval) sin ganancia y con ligera pérdida en la evaluación completa.
- Hereda del modelo base las capacidades de chat multi-turno y plantilla de chat de Qwen3.5; el adaptador no las amplía de forma declarada.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking activo en la evaluación (todas las pruebas se hicieron con thinking desactivado).
- Capacidad multilingüe: no disponible; el autor solo declara inglés.

## Casos de uso

- Investigación en destilación matemática: reproducir el pipeline de 71 ejemplos y 54 pasos para estudiar cuánto puede moverse un modelo de 2B con un LoRA mínimo; el repositorio incluye el protocolo y las semillas para replicar.
- Evaluación comparativa de adaptadores pequeños: usar el adaptador como brazo experimental frente al Qwen3.5-2B sin ajustar en MATH-500 y MMLU-Pro, con el mismo grader de respuesta final en caja.
- Prototipado de tutores de matemáticas en inglés: el adaptador produce explicaciones paso a paso y puede integrarse en un cuaderno o demo local con Transformers y PEFT para generar resoluciones comentadas.
- Estudio de formatos de respuesta: analizar por qué 187 de 500 respuestas no incluían caja final y cómo el prompting (`End with \boxed{answer}.`) afecta a la entregabilidad de la respuesta.
- Experimentos de bajo presupuesto en hardware de consumo: el entrenamiento se hizo en una Intel Arc 140V, lo que sirve como referencia para equipos sin GPU dedicada que quieran ajustar LoRA sobre modelos de 2B.
- Docencia e investigación sobre evaluación: el repositorio documenta auditorías pareadas por ID de ítem, prompts y referencias, útil como ejemplo de buenas prácticas de evaluación reproducible en trabajos académicos.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-2B sin ajustar | Kasui Tanku 2B | Diferencia |
|---|---:|---:|---:|
| MATH-500 (500 problemas) | 119/500 (23,8%) | 213/500 (42,6%) | +18,8 pp |
| MATH-500, revisión de equivalencia asistida por IA | 133/500 (26,6%) | 235/500 (47,0%) | +20,4 pp |
| AIME 2024 (30 problemas) | 0/30 | 0/30 | 0 |
| IFEval estricto (subconjunto de 50) | 34/50 (68,00%) | 34/50 (68,00%) | 0,00 pp |
| IFEval estricto (541 prompts completos) | 355/541 (65,62%) | 339/541 (62,66%) | -2,96 pp |
| MMLU-Pro (subconjunto de 70) | 33/70 (47,14%) | 37/70 (52,86%) | +5,71 pp |
| MMLU-Pro completo (12.032) | 5.213/12.032 (43,33%) | 5.553/12.032 (46,15%) | +2,83 pp |
| MMLU-Redux (subconjunto de 285) | 185/285 (64,91%) | 194/285 (68,07%) | +3,16 pp |
| MMLU-Redux completo (5.700) | 3.842/5.700 (67,40%) | 3.953/5.700 (69,35%) | +1,95 pp |
| C-Eval validación (subconjunto de 260) | 166/260 (63,85%) | 171/260 (65,77%) | +1,92 pp |
| C-Eval validación completo (1.346) | 845/1.346 (62,78%) | 845/1.346 (62,78%) | 0,00 pp |
| SuperGPQA (subconjunto de 360) | 70/360 (19,44%) | 93/360 (25,83%) | +6,39 pp |
| SuperGPQA completo (26.529) | 3.735/26.529 (14,08%) | 5.076/26.529 (19,13%) | +5,05 pp |
| MMMLU (subconjunto de 70) | 23/70 (32,86%) | 33/70 (47,14%) | +14,29 pp |

Protocolo: BF16, thinking desactivado, decodificación greedy, temperatura 0, tope de generación de 512 tokens en MATH-500 y AIME, 1.024 tokens en MMLU-Pro, MMLU-Redux, C-Eval y SuperGPQA, y 2.048 tokens en IFEval completo. Herramientas: vLLM 0.34.0 y EvalScope 1.15.0 en Google Colab A100 40 GB. En AIME 2024 las 60 respuestas (base y adaptador) alcanzaron el tope sin caja extraíble, por lo que la métrica mide entrega de respuesta bajo ese presupuesto, no capacidad matemática con generación larga.

## Requisitos de hardware

- El adaptador en sí ocupa muy poco (repo de 0,0 GB según Hugging Face); el coste real es el modelo base Qwen3.5-2B en BF16, aproximadamente 4 GB de pesos más overhead de activaciones y caché KV.
- GPU recomendadas para el protocolo reportado: A100 40 GB (usada por el autor en Colab), H100 o L40S para evaluación a escala; una RTX 4090 (24 GB) es sobrada para inferencia de un 2B en BF16.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores en BF16; en cuantización de 8 o 4 bits del modelo base cabría en GPUs de 6-8 GB, aunque el adaptador se publica en BF16 y la cuantización del par base+adaptador no está documentada.
- El autor entrenó el LoRA en una Intel Arc 140V (GPU integrada), lo que confirma que el ajuste es viable sin GPU dedicada.
- Despliegue: Transformers + PEFT es la vía documentada (`PeftModel.from_pretrained`). vLLM 0.34.0 se usó para la evaluación y admite adaptadores LoRA, pero el repositorio no incluye configuración de serving lista para producción. llama.cpp/Ollama requerirían fusionar el adaptador en el modelo base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Kasui Tanku 2B | LoRA sobre 2B | no disponible | 213/500 (42,6%) | no disponible | Hugging Face, repo de adaptador |
| Qwen3.5-2B (base) | 2B | no disponible | 119/500 (23,8%) | no disponible | Hugging Face |
| Réplica Kasui semilla 43 (traza completa) | LoRA sobre 2B | no disponible | 220/500 (44,0%) | no disponible | no publicada como repo independiente |
| Réplica Kasui semilla 44 (traza completa) | LoRA sobre 2B | no disponible | 205/500 (41,0%) | no disponible | no publicada como repo independiente |

No se dispone de datos de benchmarks de otros adaptadores matemáticos comparables en la información proporcionada, por lo que la comparativa se limita al modelo base y a las réplicas del propio autor. La varianza entre semillas (205-220 en MATH-500) es del mismo orden que la mejora reportada, lo que debe tenerse en cuenta al interpretar el resultado.

## Limitaciones y advertencias

- Adaptador, no modelo autónomo: requiere descargar Qwen/Qwen3.5-2B en la revisión exacta indicada y cargarlo con PEFT; no funciona como checkpoint independiente.
- Licencia no declarada: no hay información sobre condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Entrenamiento minúsculo (71 ejemplos, 54 pasos): alta varianza entre semillas y riesgo de sobreajuste al formato de los ejemplos de destilación.
- 187 de 500 respuestas en MATH-500 no incluían la caja final, lo que infla la diferencia frente al baseline en la métrica principal; la revisión de equivalencia asistida por IA (235/500) no sustituye a una validación humana, que el autor declara fuera de alcance.
- AIME 2024 con tope de 512 tokens dio 0/30 en ambos brazos: el modelo no entrega respuesta final dentro de ese presupuesto; el rendimiento con generación más larga no está medido.
- IFEval completo empeora 2,96 pp, lo que sugiere una posible regresión en seguimiento de instrucciones estrictas.
- Solo inglés declarado; no hay evaluación multilingüe ni de código.
- Riesgo de alucinación inherente a un modelo de 2B y a la destilación de otro modelo: las explicaciones pueden ser plausibles pero incorrectas, especialmente fuera del dominio de matemáticas de competición.
- Sesgos: no documentados por el autor; hereda los del modelo base y los del generador de datos (DeepSeek V4.1 Flash 1017 vía OpenRouter/DeepInfra).
- Repositorio con 0 descargas y 0 likes: sin validación de la comunidad; tratar como material de investigación reproducible, no como artefacto estable.

## Enlaces

- Hugging Face: https://huggingface.co/kasui-ai/Kasui-Tanku-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión fijada del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- PEFT (librería): https://github.com/huggingface/peft
- vLLM: https://github.com/vllm-project/vllm
- EvalScope: https://github.com/modelscope/evalscope
- OpenRouter: https://openrouter.ai
- DeepInfra: https://deepinfra.com
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
