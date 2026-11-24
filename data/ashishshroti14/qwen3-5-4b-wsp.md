# ashishshroti14/Qwen3.5-4B-WSP

## Resumen

Qwen3.5-4B-WSP es un ajuste quirúrgico del modelo denso Qwen/Qwen3.5-4B publicado por el usuario ashishshroti14 en Hugging Face. No se trata de un fine-tuning convencional ni de un modelo nuevo entrenado desde cero: es una modificación de pesos en espacio de pesos (Weight-Space Programming, WSP) que altera únicamente 491.520 de los 4.539.265.536 parámetros del modelo base, es decir, un 0,0108% del total, sin retropropagación, sin fine-tuning y sin RL. El objetivo declarado es corregir la patología de bucles de razonamiento y repetición que el modelo base presenta en decodificación greedy (temperatura 0, sin penalización de presencia).

El modelo mantiene la arquitectura del Qwen3.5-4B original, un transformer denso de la familia Qwen 3.5 que combina capas híbridas Gated DeltaNet con atención completa, y conserva la modalidad image-text-to-text del pipeline original. Su relevancia radica en que demuestra que intervenciones de muy baja dimensionalidad sobre la corriente residual pueden mitigar fallos de generación sin degradar el resto del comportamiento del modelo, y que los beneficios se generalizan fuera de distribución a benchmarks que no se usaron durante el diagnóstico (IFEval).

La ficha se basa exclusivamente en la model card y en los metadatos públicos del repositorio. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su fecha de creación es el 24 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet + atención completa (familia Qwen 3.5) |
| Parametros totales | 4.659.865.088 (4,66 B) según safetensors; la model card cita 4.539.265.536 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente compatibles con bfloat16 y cuantizaciones derivadas, pero no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Parametros modificados por WSP | 491.520 (0,0108% del total) |
| Capas objetivo del parche | 23, 26, 27 (solo `mlp.down_proj.weight`) |
| Columnas modificadas por capa | 64 (seleccionadas por `z_diff`) |
| Hiperparámetros del parche | `alpha=1.5`, `think_weight=1.0`, `vec_source=resid_loop_dir` |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 9,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B: un transformer denso que intercala capas de Gated DeltaNet (un mecanismo de estado recurrente lineal) con capas de atención completa. Sobre esta base, el autor aplica el método `col_steer_think`, descrito como un diagnóstico contrastivo zero-gradient sobre la corriente residual dentro del bloque `<think>` combinado con un steering condicional de columnas en `mlp.down_proj` (SwiGLU). El procedimiento identifica direcciones de bucle en la corriente residual y modifica selectivamente 64 columnas en las capas 23, 26 y 27, con un factor `alpha=1.5` y un peso de pensamiento `think_weight=1.0`.

No hay entrenamiento en el sentido habitual: no se ejecuta retropropagación, no se ajustan hiperparámetros con descenso de gradiente y no se aplica RLHF ni DPO. La intervención es puramente de edición de pesos en espacio de pesos, inspirada en el trabajo "Sparks of Weight-Space Programming" (Takehi et al., MIT CSAIL, noviembre de 2026, según la model card). El autor incluye artefactos de reproducibilidad: `wsp_patch.pt` con las direcciones extraídas y las puntuaciones de columnas, `wsp_patch_summary.json` y `eval_results.json`. No se especifican datos de entrenamiento, número de tokens ni composición del dataset, porque no los hay en el sentido tradicional.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento explícito delimitado por `<think>`.
- Razonamiento matemático: mejoras sustanciales en GSM8K y MATH-500 respecto al modelo base (ver sección de benchmarks).
- Cumplimiento de instrucciones: mejoras en IFEval en condiciones zero-shot fuera de distribución.
- Procesamiento image-text-to-text, heredado del pipeline del modelo base.
- Mitigación de bucles de repetición en decodificación greedy (`temperature=0`, `presence_penalty=0.0`), sin necesidad de penalizaciones en tiempo de inferencia.
- Compatibilidad drop-in con vLLM, transformers, SGLang y llama.cpp según la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning más allá del modo `<think>`: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático en producción: el modelo mejora GSM8K de 62,55% a 74,15% y MATH-500 de 36,80% a 59,60% respecto al base, por lo que es adecuado para pipelines de resolución de problemas aritméticos y algebraicos donde el modelo original se quedaba corto.
- Generación con decodificación greedy determinista: al funcionar limpiamente con `temperature=0` y `presence_penalty=0`, encaja en sistemas que requieren salidas reproducibles y auditables, como evaluación automática o generación de informes con plantillas fijas.
- Reducción de coste de inferencia por truncamiento: la tasa de truncamiento en GSM8K baja de 48,98% a 13,34% y los tokens medios de salida caen de 2789,0 a 1092,7, lo que reduce el coste por consulta en despliegues con `max_tokens` limitado.
- Cumplimiento estricto de instrucciones: con IFEval Prompt-Strict de 39,56% a 51,94% y Inst-Strict de 45,68% a 58,27%, es útil en sistemas que validan formato de salida (JSON, listas, restricciones de longitud) sin necesidad de post-procesado agresivo.
- Investigación en interpretabilidad mecánica: los artefactos `wsp_patch.pt` y `wsp_patch_summary.json` permiten reproducir el diagnóstico de direcciones de bucle y estudiar cómo intervenciones de baja dimensionalidad afectan al razonamiento.
- Sustitución directa del modelo base en despliegues existentes: al ser drop-in en vLLM, transformers, SGLang y llama.cpp, se puede probar en un servicio ya montado con Qwen3.5-4B sin cambiar la infraestructura.
- Tareas image-text-to-text heredadas: cualquier caso de uso del modelo base que combine imagen y texto puede beneficiarse de la mitigación de bucles, aunque no se documentan métricas específicas de visión.

## Benchmarks y rendimiento

Resultados de la evaluación completa held-out con decodificación greedy (`temp=0`, `presence_penalty=0.0`, `max_tokens=4096`), según la model card del autor:

| Benchmark | Split | Qwen3.5-4B (base) | Qwen3.5-4B-WSP | Delta |
|---|---|---|---|---|
| GSM8K | Test completo (n=1319) | 62,55% | 74,15% | +11,60 pts |
| MATH-500 | Test completo (n=500) | 36,80% | 59,60% | +22,80 pts |
| IFEval Prompt-Strict | Completo (n=541, zero-shot OOD) | 39,56% | 51,94% | +12,38 pts |
| IFEval Inst-Strict | Completo (n=541, zero-shot OOD) | 45,68% | 58,27% | +12,59 pts |

Métricas de eficiencia y mitigación de bucles:

| Métrica | Base | WSP |
|---|---|---|
| Truncamiento GSM8K (`finish_reason=length`) | 48,98% | 13,34% |
| Tokens medios de salida en GSM8K | 2789,0 | 1092,7 |
| Truncamiento MATH-500 | 76,20% | 35,20% |
| Tasa de cierre de `</think>` en MATH-500 | 25,40% | 87,20% |
| Truncamiento IFEval | 69,13% | 48,24% |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,3 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 16 GB para contexto corto y 24 GB o más para contextos largos.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB. Estas cifras son estimaciones a partir del tamaño del repositorio, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bfloat16; RTX 3090/4090 o GPUs consumer con 16-24 GB para cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 y GPUs de 16 GB con cuantización.
- Opciones de despliegue: vLLM, transformers, SGLang y llama.cpp, según la model card.
- Latencia y throughput: no disponibles. La reducción de tokens de salida en GSM8K (de 2789,0 a 1092,7 de media) sugiere una mejora indirecta del throughput efectivo en cargas de razonamiento, pero no se publican medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-WSP | 4,66 B (4,54 B según model card) | no disponible | 74,15% | 59,60% | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4,66 B | no disponible | 62,55% | 36,80% | Apache 2.0 (según base) | Hugging Face |
| Alternativas de ~4 B con razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables de ~4 B en la información proporcionada, por lo que la comparativa se limita al modelo base. La comparación con la familia Qwen3.5 completa (tamaños 0.6B, 1.7B, 8B, etc.) no está disponible en la información consultada.

## Limitaciones y advertencias

- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026; no hay validación independiente de los resultados reportados.
- Los benchmarks son autoinformados por el autor en la model card; no se han replicado de forma externa.
- La evaluación se limita a GSM8K, MATH-500 e IFEval; no hay datos de MMLU, HumanEval, seguridad, sesgos ni evaluación multilingüe.
- El método WSP modifica solo 0,0108% de los parámetros, pero se desconoce si la intervención introduce regresiones en otras capacidades no evaluadas (código, visión, diálogo abierto).
- Riesgo de alucinación: no evaluado en la información disponible; el modelo base ya presenta este riesgo y el parche no lo aborda explícitamente.
- Idiomas soportados: no especificados; no se puede garantizar un comportamiento multilingüe equivalente al base.
- Longitud de contexto: no especificada; se desconoce si el parche afecta al manejo de contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que conviene verificar en su propia model card.
- El repositorio incluye artefactos de reproducibilidad (`wsp_patch.pt`, `wsp_patch_summary.json`, `eval_results.json`), pero no se documenta el proceso completo de selección de columnas más allá de los hiperparámetros.
- La afirmación de que IFEval es 100% out-of-distribution se basa en el autor; no hay verificación independiente de que no se usara durante el diagnóstico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashishshroti14/Qwen3.5-4B-WSP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper de referencia citado en la model card: Takehi et al., "Sparks of Weight-Space Programming", MIT CSAIL, noviembre de 2026 (no se proporciona URL en la información disponible)
- Repositorio de artefactos: incluido en el propio repositorio de Hugging Face (`wsp_patch.pt`, `wsp_patch_summary.json`, `eval_results.json`)
