# Solshine/Qwen3.5-0.8B-WSP-math-Fable5.2

## Resumen

Qwen3.5-0.8B-WSP-math-Fable5.2 es un artefacto de investigación publicado por Solshine (estudio de Caleb DeLeeuw) que consiste en el modelo base Qwen/Qwen3.5-0.8B (revisión `2fc06364`) con **8 tensores de pesos modificados manualmente por un modelo de lenguaje**, sin ningún tipo de entrenamiento, gradientes ni optimizadores. El editor fue Claude Fable 5.2 (Anthropic), que trabajó en un espacio de trabajo Python con acceso de lectura/escritura a los pesos y un presupuesto de solo 10 pasadas forward para inspeccionar el modelo. El objetivo era mejorar el rendimiento en matemáticas de competición.

El modelo replica el experimento 8 de Takehi et al., "Sparks of Weight-Space Programming" (MIT CSAIL, 2 de noviembre de 2026), cuyo arnés de edición no fue liberado y fue reconstruido a partir de los registros publicados. La edición afecta a `mlp.down_proj` de las capas 12 a 18 y 22, con cambios relativos de entre el 1,2 % y el 11,4 %. Según la model card, el editor describe la edición como una amortiguación de un bucle de autoduda ("Wait…") mediante dos neuronas y la conexión de unas 80 neuronas detectoras de repetición para empujar al modelo a concluir y terminar su razonamiento.

Es relevante ahora porque es una demostración preliminar de *weight-space programming*: manipulación directa de pesos por parte de un LLM sin entrenamiento. No obstante, el propio autor advierte que es un resultado preliminar con controles ausentes (sin control de dirección aleatoria puntuado, mediciones no side-by-side, una sola semilla y una sola muestra por problema). El modelo tiene 873.438.784 parámetros, licencia Apache-2.0 y está pensado exclusivamente para investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; detalles no disponibles) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (las evaluaciones usan hasta 32.768 tokens) |
| Tipos de cuantización | no disponible (evaluado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (incluye `edited_tensors.safetensors` con solo los tensores modificados) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer de 873 millones de parámetros. La intervención no es un fine-tuning: se modificaron 8 tensores concretos (`mlp.down_proj` de las capas 12–18 y 22) mediante edición directa de pesos realizada por un LLM editor (Claude Fable 5.2) en un entorno sandbox, sin gradientes, optimizadores ni bucles de ajuste. El editor dispuso de un máximo de 10 pasadas forward para inspeccionar el comportamiento del modelo, el presupuesto más pequeño del estudio original de Takehi et al.

El repositorio incluye `edited_tensors.safetensors` (solo los tensores cambiados) y `release_manifest.json` con hashes y tamaños. La model card señala que la ejecución de edición se interrumpió una vez y se reanudó con un espacio de trabajo nuevo. No se aplicó RLHF, DPO ni ningún otro proceso de alineación posterior; el modelo base ya incorpora el comportamiento conversacional de Qwen3.5. La innovación técnica destacable es el propio método de *weight-space programming*: un agente LLM que diagnostica un fallo de razonamiento (bucle de repetición/autoduda) y lo corrige editando pesos de forma localizada.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento matemático de competición con *thinking mode* habilitado (la evaluación usa la plantilla de chat con thinking activado).
- Resolución de problemas paso a paso con formato de respuesta final en `\boxed{}`.
- Procesamiento de entrada de imagen y texto (tag `image-text-to-text`), según los metadatos del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible más allá del thinking mode.
- Capacidades multilingües: no disponibles.
- Capacidad especial: edición de pesos orientada a reducir bucles de repetición y forzar el cierre del razonamiento.

## Casos de uso

- Investigación sobre weight-space programming: reproducir o contrastar el experimento 8 de Takehi et al. cargando el modelo con `AutoModelForCausalLM` en bf16 y comparando con el modelo base sin editar.
- Estudio de mecanismos internos de razonamiento: analizar cómo la modificación de `mlp.down_proj` en capas concretas altera la dinámica de generación y los bucles de repetición.
- Evaluación de técnicas de edición de modelos: usar este artefacto como referencia para diseñar controles de dirección aleatoria y experimentos con múltiples semillas.
- Docencia e ilustración de conceptos: demostrar en un curso o artículo cómo un LLM puede actuar como editor de pesos sin entrenamiento.
- Pruebas de robustez de evaluadores matemáticos: emplear los archivos de evaluación y el grader de los autores para validar pipelines de scoring en MATH-500.
- Análisis de eficiencia en razonamiento: estudiar el 19,2 % de respuestas que aún alcanzan el límite de 32.768 tokens y proponer mejoras de terminación.

## Benchmarks y rendimiento

Resultados en MATH-500 (thinking on, hasta 32.768 tokens, 1 muestra por problema, grader de los autores), según la model card:

| Modelo | MATH-500 |
|---|---|
| Qwen3.5-0.8B sin editar | 36/500 = 7,2 % (los autores reportan 7,9 %) |
| Edición de 50 pasadas de los autores, reconstruida | 244/500 = 48,8 % (los autores reportan 48,1 %) |
| Edición de 10 pasadas de los autores (su cifra) | 12,3 % |
| **Este modelo (edición de 10 pasadas)** | **284/500 = 56,8 % (intervalo Wilson 95 %: 52,4–61,1)** |

Comparación problema a problema con el modelo sin editar: 248 problemas pasaron de incorrecto a correcto y ninguno al contrario. El 19,2 % de las respuestas alcanzan el tope de 32.768 tokens. El autor advierte que estas cifras son preliminares y carecen de controles (ver limitaciones).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 millones de parámetros, en bf16 requiere aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas; por tamaño, cabe en GPUs de consumo.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090, etc.), aunque no se aporta confirmación oficial.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` en bfloat16 (método indicado por el autor); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-WSP-math-Fable5.2 | 873 M | no disponible | 56,8 % (preliminar) | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 873 M | no disponible | 7,2 % (medido por el autor) | Apache-2.0 | Hugging Face |
| Edición de 50 pasadas de Takehi et al. (reconstruida) | 873 M | no disponible | 48,8 % | no disponible | no liberada públicamente |
| Edición de 10 pasadas de los autores | 873 M | no disponible | 12,3 % | no disponible | no disponible |

No se dispone de comparación con otros modelos de ~1B en la información proporcionada.

## Limitaciones y advertencias

- Resultado preliminar: una sola ejecución de edición, una muestra por problema y una sola semilla de evaluación.
- Sin control de dirección aleatoria puntuado: no se ha demostrado que la ganancia se deba específicamente a esta edición y no a un cambio arbitrario del mismo tamaño.
- Las puntuaciones no se midieron en paralelo: los números del modelo sin editar y de la edición de 50 pasadas proceden de otro pod de GPU y otro día.
- El arnés de edición es una reconstrucción, no el código original de los autores; las desviaciones se registran en el ledger del estudio.
- La ejecución de edición se interrumpió una vez y se reanudó con un espacio de trabajo nuevo.
- No se sabe si el modelo editor había visto el blog y los registros de los autores publicados el 2 de noviembre de 2026.
- El 19,2 % de las respuestas alcanza el tope de 32.768 tokens, lo que indica problemas de terminación persistentes.
- Uso previsto exclusivamente para investigación; no recomendado para producción.
- Idiomas soportados y sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el autor restringe explícitamente el uso a investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Solshine/Qwen3.5-0.8B-WSP-math-Fable5.2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de referencia: Takehi et al., "Sparks of Weight-Space Programming" (MIT CSAIL, 2 de noviembre de 2026); enlace directo no disponible en la información proporcionada.
- Blog y registros de los autores: públicos desde el 2 de noviembre de 2026; URL no disponible en la información proporcionada.
- Código, trazas de edición y archivos de evaluación del estudio: pendientes de publicación con el estudio; URL no disponible.
