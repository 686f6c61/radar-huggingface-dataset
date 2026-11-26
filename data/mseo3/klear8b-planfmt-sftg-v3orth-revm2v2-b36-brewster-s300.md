# mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s300

## Resumen

klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s300 es un ajuste fino supervisado (SFT) del modelo Klear-Reasoner-8B-SFT de Kwai-Klear, publicado por el usuario mseo3 en Hugging Face. Se trata de un checkpoint intermedio (paso 300 de 1500) de un experimento de investigación orientado a introducir un formato de planificación explícito mediante dos tokens especiales nuevos, `<|plan|>` (id 151669) y `<|/plan|>` (id 151670), que el modelo base no poseía. El modelo tiene 8.190.735.360 parámetros en formato safetensors bf16 y una licencia Apache 2.0.

El interés de esta ficha es limitado desde el punto de vista de producción: no es un lanzamiento oficial, no tiene benchmarks publicados, no declara idiomas soportados y registra cero descargas. Su valor es el de un artefacto de investigación reproducible: documenta con precisión la receta de entrenamiento (optimizador, learning rate, batch global, estrategia de enmascarado de pérdida y tratamiento de los embeddings de los nuevos tokens), lo que permite a otros investigadores replicar o auditar el experimento.

La relevancia técnica está en el enfoque de "plan-format SFT": enseñar al modelo a emitir un bloque de planificación delimitado por tokens propios antes de resolver una tarea, con las filas de `lm_head` de los nuevos tokens reinicializadas de forma ortogonal a sus piezas de texto para evitar que hereden representaciones sesgadas del vocabulario existente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3, según tag `qwen3`); detalles exactos no disponibles |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP) |

## Arquitectura y entrenamiento

El modelo parte de Klear-Reasoner-8B-SFT (familia Qwen3, 8B parámetros) y se entrena con SFT sobre un dataset privado (`mseo3/klear8b-planfmt-revmask-sft`, split `data/rev_m2_v2`) de 27.773 filas revisadas, en las que los pasos fallidos se enmascaran de la pérdida. La receta (`sft_recipe_v3orth`, run `sft_g_ptokc_orth_lr2e5_revm2v2_b36_s1500_brewster`) usa batch global 36 (33 no divide sobre 4 GPUs), learning rate 2e-5 con decaimiento coseno hasta 1e-5 durante 1500 pasos y warmup de 30 pasos. El entrenamiento se ejecutó sobre 4× H200 con FlashAttention 3 y FSDP, con una reanudación desde el paso 200 para añadir un montaje de checkpoint en RAM, sin cambios en las matemáticas del entrenamiento.

La innovación técnica principal es la incorporación de dos tokens de planificación (`<|plan|>` y `<|/plan|>`) con embeddings no atados ("untied") y filas de `lm_head` reinicializadas de forma ortogonal a sus piezas de texto, de modo que los nuevos tokens no arrancan con la representación de los tokens textuales de los que derivan. El checkpoint publicado corresponde al paso 300, es decir, un 20 % del entrenamiento previsto; los pesos se fusionaron de los shards FSDP a bf16. Solo se conserva el optimizador en el guardado más reciente, podando los shards obsoletos antes de cada escritura (`SFT_PRUNE_OPT_BEFORE_SAVE=1`).

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Klear-Reasoner-8B-SFT, orientado a razonamiento.
- Formato de planificación: emisión de bloques delimitados por `<|plan|>` y `<|/plan|>` para estructurar un plan antes de la respuesta, si el ajuste ha convergido lo suficiente en el paso 300.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el formato de plan sugiere un uso orientado a descomposición de tareas, pero no hay evaluación publicada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo base es de texto.

## Casos de uso

- Investigación sobre formatos de planificación: usar el checkpoint para estudiar cómo la introducción de tokens de plan estructurados afecta a la descomposición de tareas en modelos de 8B, comparando el paso 300 con el modelo base.
- Reproducción de recetas de SFT: la model card documenta con detalle hiperparámetros, estrategia de enmascarado de pérdida y gestión de checkpoints, lo que permite replicar el experimento en clústeres con 4× H200.
- Evaluación de inicialización ortogonal de embeddings: analizar si reinicializar las filas de `lm_head` de forma ortogonal a sus piezas de texto mejora la estabilidad del aprendizaje de tokens nuevos frente a inicializaciones aleatorias.
- Generación de trazas de razonamiento estructuradas: en pipelines de investigación que necesiten separar el plan de la respuesta final mediante delimitadores explícitos, siempre que se valide la calidad del formato en este checkpoint intermedio.
- Estudio de enmascarado de pasos fallidos: el dataset enmascara los pasos que fallan de la pérdida; el modelo sirve para analizar el efecto de esta técnica en la calidad del razonamiento.
- Base para ajustes posteriores: punto de partida para continuar el entrenamiento hasta los 1500 pasos o para experimentos de destilación de formato de plan en modelos menores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 20-24 GB como mínimo para contextos cortos.
- Cuantización a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits, alrededor de 4-5 GB, aunque no se han publicado versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100/H200 para entrenamiento o inferencia con contexto largo; RTX 4090 (24 GB) viable en bf16 para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto limitado, o en GPUs de 12-16 GB si se cuantiza, aunque dichas cuantizaciones no están publicadas.
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF; los tokens especiales nuevos requieren configuración explícita del tokenizer en el servidor de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s300 | 8,19B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint intermedio de investigación |
| Kwai-Klear/Klear-Reasoner-8B-SFT (base) | ~8B | no disponible | no disponible en esta ficha | Hugging Face | Modelo base sin tokens de plan |
| Qwen3-8B | ~8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Familia arquitectónica del modelo |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 300 de 1500, por lo que el formato de plan puede no estar consolidado y la calidad puede ser inferior a la del modelo base en tareas generales.
- Sin evaluación publicada: no hay benchmarks, ni comparativas, ni métricas de pérdida reportadas; no se puede afirmar que mejore al base.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.
- Dataset privado: los datos de entrenamiento no son públicos, lo que impide auditar la composición, los sesgos y la procedencia.
- Idiomas no declarados: no se especifica qué lenguas cubre el ajuste; el comportamiento fuera del inglés (o del idioma del dataset) es incierto.
- Tokens especiales personalizados: requieren configuración manual del tokenizer y del servidor de inferencia; un uso incorrecto produce salidas degradadas.
- Riesgo de alucinación: inherente a los modelos de razonamiento de 8B; sin evaluación específica no se puede acotar.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos privados pueden imponer condiciones adicionales no reflejadas en esta ficha.
- No apto para producción sin validación previa: la ausencia de pruebas y de soporte del autor desaconseja su despliegue directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/klear8b-planfmt-sftg-v3orth-revm2v2-b36-brewster-s300
- Modelo base: https://huggingface.co/Kwai-Klear/Klear-Reasoner-8B-SFT
- Dataset referenciado (privado): https://huggingface.co/datasets/mseo3/klear8b-planfmt-revmask-sft
