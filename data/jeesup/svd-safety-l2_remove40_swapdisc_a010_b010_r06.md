# Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010_r06

## Resumen

`svd-safety-l2_remove40_swapdisc_a010_b010_r06` es un checkpoint de investigación creado por Jeesup a partir de `meta-llama/Llama-2-7b-chat-hf`. El modelo ha sido comprimido mediante SVD-LLM hasta conservar el 60,0 % de los parámetros densos originales y, posteriormente, editado con un proceso iterativo de intercambio de componentes (`swap`) seleccionados por la regla `disc_iter`. Este checkpoint representa una celda intermedia (6 de 10 rondas) de un estudio más amplio sobre cómo la compresión por descomposición en valores singulares afecta al comportamiento de seguridad y qué reglas de selección de componentes lo reparan mejor.

El objetivo del modelo no es ser un asistente conversacional de propósito general, sino servir como artefacto experimental para cuantificar el trade-off entre seguridad y utilidad bajo compresión. Su arquitectura es la de un transformer decoder-only de 6.738 millones de parámetros (7B, en la práctica 6,7B efectivos tras la compresión), con una ventana de contexto heredada de Llama-2 de 4096 tokens. Es relevante para investigadores en interpretabilidad, compresión de modelos y red-teaming, ya que proporciona métricas de seguridad medidas (AdvBench, StrongREJECT, over-refusal) junto con una configuración de edición documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 (heredada de Llama-2-7b-chat) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (llama2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only con atención causal y 7B parámetros, que ya incluía un proceso de alineación por RLHF. La compresión se realiza mediante SVD-LLM, eliminando el 40,02 % de los parámetros densos, lo que deja una fracción resultante de 0,5998 respecto al modelo original. Tras la compresión, se aplica un procedimiento de edición iterativa "parameter-neutral swap" que intercambia componentes de la matriz de proyección. En este checkpoint se han aplicado 6 de las 10 rondas planificadas, con un presupuesto por ronda del 0,100 % de los parámetros densos y un presupuesto total del 1,000 %. Se han restaurado e intercambiado 3544 componentes, con una escala de inserción de 0,1 y una semilla de 42.

No se han publicado detalles sobre la composición del dataset de entrenamiento ni sobre procesos de RLHF/DPO adicionales más allá de los del modelo base. La innovación técnica reside en la combinación de compresión SVD con un criterio de selección de componentes (`disc_iter`) para reparar el comportamiento de seguridad dañado, en lugar de reentrenar el modelo.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat, aunque degradada por la compresión.
- Métricas de seguridad medidas: AdvBench ASR (HarmBench judge) = 0,1885; StrongREJECT ASR (HarmBench judge) = 0,1757; Macro over-refusal (WildGuard) = 0,1316.
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio.
- Capacidades multilingües: no disponible.
- El modelo no es un asistente generalista; su propósito es servir como sujeto experimental para medir el efecto de la compresión y la edición sobre la seguridad.

## Casos de uso

- Investigación en interpretabilidad de seguridad: el checkpoint permite analizar cómo la compresión SVD altera las activaciones asociadas a comportamientos seguros y comparar con el modelo base.
- Evaluación de métodos de reparación post-compresión: sirve para validar la regla `disc_iter` frente a otras reglas de selección dentro del grid experimental del autor.
- Estudio de trade-offs seguridad/utilidad: permite cuantificar cómo varía el over-refusal (0,1316) y la tasa de éxito de ataques (ASR) en función del presupuesto de restauración.
- Red-teaming de modelos comprimidos: puede usarse como objetivo para probar ataques adversariales y verificar si la compresión introduce vulnerabilidades adicionales.
- Desarrollo de técnicas de compresión robustas: actúa como baseline para comparar nuevas estrategias de compresión que preserven la seguridad sin necesidad de reentrenamiento.
- Docencia e investigación reproducible: la configuración detallada (semilla, rondas, presupuesto, componentes intercambiados) permite reproducir el experimento y estudiar el efecto de cada hiperparámetro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible. Las únicas métricas reportadas son de seguridad:

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,1885 |
| StrongREJECT ASR (HarmBench judge) | 0,1757 |
| Macro over-refusal (WildGuard) | 0,1316 |

Estos valores indican que el modelo sigue siendo vulnerable a ataques de jailbreak en una proporción no despreciable, mientras que su tasa de rechazo excesivo es moderada. No se dispone de comparaciones con otros modelos en estos benchmarks dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.738.415.616 parámetros en FP16 (formato safetensors del repo), se requieren aproximadamente 13,5 GB de VRAM para cargar los pesos. Aplicando cuantización INT8 o INT4 (no incluida en el repo, pero posible con herramientas externas), la VRAM podría reducirse a unos 7 GB o 4 GB respectivamente.
- GPU recomendadas: para FP16, una RTX 3090/4090 con 24 GB es suficiente; para cuantización, GPUs de consumo con 8-12 GB podrían ser viables, aunque no hay soporte oficial de cuantización documentado.
- Opciones de despliegue: al ser un modelo de la familia Llama-2 con formato safetensors, puede cargarse con `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF) o `Ollama`. No se ha verificado la compatibilidad con `TGI` en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | AdvBench ASR | Notas |
|---|---|---|---|---|---|
| Llama-2-7b-chat-hf | 6.738.415.616 | 4096 | llama2 | no disponible | Modelo base sin compresión |
| svd-safety-l2_remove40_swapdisc_a010_b010_r06 | 6.738.415.616 (60 % efectivos) | 4096 | llama2 | 0,1885 | Comprimido y editado parcialmente |
| Otros checkpoints del grid | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos en la información proporcionada |

La comparación directa con el modelo base no es posible en términos de ASR porque no se ha publicado ese dato. El checkpoint estudiado es una variante comprimida y editada del mismo modelo base, por lo que su rendimiento en tareas generales probablemente sea inferior, aunque no se dispone de benchmarks que lo confirmen.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general ni apto para producción.
- La compresión degrada deliberadamente el comportamiento de seguridad; la tasa de éxito de ataques (ASR) es significativa (0,1885 en AdvBench).
- El checkpoint es un estado intermedio (6 de 10 rondas) del proceso de edición, no el resultado final.
- No se han publicado evaluaciones en tareas estándar de lenguaje (MMLU, HumanEval, GSM8K), por lo que su calidad general es desconocida.
- La licencia Llama 2 Community License impone restricciones de uso comercial y requiere cumplir la política de uso aceptable.
- Puede heredar sesgos del modelo base Llama-2 y presentar riesgo de alucinación.
- No se dispone de información sobre los idiomas soportados, por lo que su uso multilingüe es incierto.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010_r06
- Model card del autor: incluida en el repositorio de HuggingFace
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos) en la búsqueda web.
