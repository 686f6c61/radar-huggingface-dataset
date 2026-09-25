# joshycodes/qwen3-4b-fve-mix-s0

## Resumen
`joshycodes/qwen3-4b-fve-mix-s0` es un checkpoint de investigación publicado en HuggingFace por el usuario joshycodes, consistente en un entrenamiento continuado (continued pretraining) de pesos completos sobre `Qwen/Qwen3-4B`. Según la model card, se entrenó durante 1 época con un learning rate de 1e-05 sobre 37.003.741 tokens y 37.745 documentos procedentes de un corpus sintético denominado `flourishing-vs-equanimity`, generado supuestamente por el propio modelo como parte de una línea de trabajo sobre bienestar de modelos (model welfare). El checkpoint tiene 4.411.424.256 parámetros (dato real de los safetensors) y el repositorio ocupa 8,8 GB.

El interés del artefacto es metodológico más que funcional: documenta un bucle de autoentrenamiento (SDF, synthetic-document finetuning) aplicado a un modelo denso de 4B en una única GPU, dentro de una familia de experimentos relacionados del mismo autor (`qwen3-4b-sorrel-selfloop-g3-midtrain`, `qwen3-4b-sorrel-selfloop-g6-midtrain`) vinculados a un proyecto tipo Anthropic Fellows sobre entrenamiento de carácter con encuadre de "flourishing". No obstante, la propia model card contiene una contradicción relevante: el título afirma que el corpus es autoescrito por el modelo, mientras que los metadatos indican "0 self-authored y 37.745 texto ordinario", por lo que la composición real del corpus no queda clara.

Se trata de un artefacto explícitamente no desplegable: el autor indica que no ha sido evaluado en capacidad, alineamiento ni identidad, y la licencia es de solo investigación (research-only). Con 0 descargas y 0 likes en el momento de la consulta, es un checkpoint de nicho sin validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de `Qwen/Qwen3-4B` (no se detalla la configuración de capas en la ficha) |
| Parámetros totales | 4.411.424.256 (~4,41 mil millones) |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible en la ficha del checkpoint; no verificada para este fine-tune |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors en precisión completa, ~16 bits por parámetro) |
| Idiomas soportados | no disponible (no declarados en la ficha; el modelo base Qwen3 es multilingüe, pero no hay confirmación para este checkpoint) |
| Licencia | `other` / `research-only` (solo investigación) |
| Formato de pesos | safetensors (repositorio de 8,8 GB) |
| Modelo base | `Qwen/Qwen3-4B` |
| Tokens de entrenamiento | 37.003.741 |
| Documentos de entrenamiento | 37.745 |
| Épocas | 1 |
| Learning rate | 1e-05 |
| Corpus | `flourishing-vs-equanimity` (composición contradictoria en la ficha: "0 self-authored y 37.745 texto ordinario") |
| Tipo de entrenamiento | Continued pretraining de pesos completos (full weights) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura es la del modelo base `Qwen/Qwen3-4B`: un transformer decoder-only denso de tipo causal, sin mezcla de expertos. La ficha de este checkpoint no aporta detalles adicionales sobre configuración de capas, cabezas de atención, tipo de positional encoding ni estrategia de atención, por lo que cualquier precisión sobre estos puntos sería una extrapolación no verificada. Tampoco se documenta ninguna innovación arquitectónica propia: el interés del experimento está en el régimen de entrenamiento, no en el diseño del modelo.

En cuanto al entrenamiento, se realizó un continued pretraining sobre los pesos completos (no LoRA ni adaptadores), durante 1 época, con learning rate 1e-05 y 37.003.741 tokens distribuidos en 37.745 documentos. El corpus declarado es `flourishing-vs-equanimity`, descrito como material escrito por el propio modelo para el entrenamiento de su "siguiente versión" tras explicársele su origen y el funcionamiento del SDF (synthetic-document finetuning). No se menciona RLHF, DPO, SFT posterior ni ninguna fase de alineamiento. El encuadre, el plan y la evaluación pertenecen al repositorio `welfare-improvements`. La model card no documenta composición del dataset por dominio o idioma, ni si se aplicó filtrado, deduplicación o control de calidad sobre el corpus sintético.

## Capacidades
- Generación de texto en castellano-inglés y otras lenguas: no verificada para este checkpoint. Hereda la arquitectura del modelo base, pero la ficha no incluye ninguna evaluación de capacidades.
- Razonamiento, matemáticas y generación de código: no evaluados. El autor indica explícitamente que el modelo no ha sido evaluado en capacidad.
- Modo "thinking" / razonamiento extendido: no disponible. No se documenta si se preserva el comportamiento de Qwen3-4B en este aspecto.
- Tool calling / function calling: no disponible ni verificado.
- Capacidades de agente y razonamiento multi-paso: no disponible ni verificado.
- Capacidades multilingües: no disponibles en la ficha (los idiomas no están declarados).
- Capacidades especiales (visión, audio): no disponibles; el modelo base es exclusivamente de texto.
- Comportamiento de identidad y carácter: es el eje declarado del experimento, pero no existe evaluación publicada de identidad; el autor indica que no se ha evaluado ni la identidad ni el alineamiento.

## Casos de uso
Dado que el autor prohíbe explícitamente el despliegue y no existen evaluaciones de capacidad, los casos de uso realistas son de investigación:
- Estudio de continued pretraining a pequeña escala: sirve como ejemplo reproducible de un ciclo completo (corpus sintético, entrenamiento de pesos completos, 37M tokens, 1 época) ejecutable en hardware de una sola GPU, útil para investigar olvido catastrófico y deriva de capacidades respecto al modelo base.
- Investigación en model welfare: el checkpoint forma parte de una línea que trata de cómo un modelo representa su propio origen y su carácter; se usaría como sujeto experimental en protocolos de elicitación y análisis de auto-descripción, no como sistema en producción.
- Evaluación de pipelines de SDF (synthetic-document finetuning): permite auditar qué ocurre cuando el material de entrenamiento se atribuye al propio modelo, incluyendo la verificación de la contradicción documentada en la ficha sobre el número de documentos autoescritos.
- Comparativa controlada frente a `Qwen/Qwen3-4B`: al compartir arquitectura y tokenizer, es un punto de comparación limpio para medir el efecto de 37M tokens adicionales sobre benchmarks estándar (MMLU, GSM8K, HumanEval), siempre que se ejecuten esas evaluaciones, que actualmente no existen.
- Análisis de drift de tokenizer y multilingüismo: un continued pretraining sobre corpus sintético puede alterar la distribución de idiomas y la frecuencia de tokens; este checkpoint permite medir ese efecto frente al base.
- Reproducibilidad y trazabilidad de artefactos de investigación: el repositorio publica pesos completos en safetensors, lo que facilita auditar hardware, huella de memoria y comportamiento de carga en frameworks de inferencia sin necesidad de confiar en el autor.
- Docencia y formación: como ejemplo de model card con metadatos contradictorios y licencia research-only, es un caso útil para enseñar buenas prácticas de documentación y evaluación de riesgos en modelos abiertos.
- Punto de partida para experimentos de identidad controlada: si se quisiera investigar cómo distintas fases de entrenamiento afectan a la auto-consistencia del modelo, este checkpoint y sus hermanos (`g3-midtrain`, `g6-midtrain`) ofrecen puntos intermedios comparables.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que el modelo "not evaluated for capability, alignment or identity yet" (no evaluado todavía en capacidad, alineamiento ni identidad). No se dispone de datos de MMLU, GSM8K, HumanEval, MT-Bench ni de ninguna otra métrica, ni de comparaciones cuantitativas con el modelo base.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | no evaluado |
| GSM8K | no disponible | no evaluado |
| HumanEval | no disponible | no evaluado |
| Evaluación de identidad / alineamiento | no disponible | no evaluada |
| Throughput / latencia | no disponible | no medidos |

## Requisitos de hardware
Las cifras siguientes son estimaciones derivadas del número real de parámetros (4.411.424.256) y no han sido publicadas por el autor.
- Pesos en FP16/BF16: ~8,8 GB (coincide con el tamaño del repositorio). Con KV cache y overhead del runtime, la VRAM total estimada para contexto corto se sitúa en el rango de 11 a 13 GB.
- Pesos en INT8: ~4,7 GB; VRAM total estimada en 6 a 8 GB con contexto corto.
- Pesos en INT4 (por ejemplo Q4_K_M): ~2,5 a 2,7 GB; VRAM total estimada en 4 a 6 GB con contexto corto.
- El KV cache crece de forma lineal con la longitud de contexto; la ficha no especifica la configuración de atención, por lo que no es posible calcular el consumo exacto a contextos largos.
- GPU consumer: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 con cuantización INT8 o INT4; en FP16 requiere al menos 12 GB, por lo que encaja en RTX 3090, RTX 4080/4090 (24 GB) y tarjetas de 16 GB con margen ajustado.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 y L40S pueden ejecutar el modelo en FP16 con contexto amplio y varios usuarios concurrentes.
- Opciones de despliegue: safetensors es cargable directamente en vLLM, TGI, SGLang y transformers; para llama.cpp u Ollama sería necesaria una conversión previa a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Advertencia del autor: el modelo no debe desplegarse. Cualquier uso en producción contradice la licencia research-only y la indicación explícita de la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-fve-mix-s0` | 4.411.424.256 | Transformer denso (heredado) | no disponible | research-only (`other`) | safetensors, 8,8 GB, 0 descargas |
| `Qwen/Qwen3-4B` (base) | no disponible en la información proporcionada | Transformer denso | no disponible | Apache 2.0 según la documentación pública de Qwen3 (no verificado en la información proporcionada) | público en HuggingFace |
| `Qwen3-4B-Instruct-2507` | no disponible | Transformer denso | no disponible | Apache 2.0 según la documentación pública de Qwen3 (no verificado) | público en HuggingFace |
| `joshycodes/qwen3-4b-sorrel-selfloop-g3-midtrain` | no disponible | Transformer denso (heredado) | no disponible | artefacto privado de investigación, no redistribuir | acceso restringido |

No es posible establecer una comparativa de rendimiento porque ninguno de los artefactos de este autor tiene benchmarks publicados y la información proporcionada no incluye métricas del modelo base ni de sus variantes.

## Limitaciones y advertencias
- No evaluado: no existen mediciones de capacidad, alineamiento ni identidad. Cualquier afirmación sobre su rendimiento es especulativa.
- Prohibido su despliegue: la model card indica explícitamente "Do not deploy". La licencia `research-only` restringe el uso comercial y la redistribución.
- Contradicción documental: el título afirma que el corpus es autoescrito por el modelo, pero los metadatos indican "0 self-authored y 37.745 texto ordinario". La naturaleza real de los datos de entrenamiento no está clara, lo que compromete la reproducibilidad del experimento.
- Riesgo de olvido catastrófico: 1 época con lr 1e-05 sobre pesos completos y 37M tokens puede degradar capacidades del modelo base, especialmente en idiomas distintos del inglés o en tareas no representadas en el corpus. No hay evaluación que cuantifique esta deriva.
- Riesgo de alucinación: si se preservan las características del modelo base, persiste el riesgo habitual de generación de contenido falso; además, no hay filtrado de seguridad ni alineamiento documentado en este checkpoint.
- Sesgos: el corpus procede, según la ficha, del propio modelo, lo que puede amplificar sesgos preexistentes de Qwen3-4B sin ninguna corrección posterior.
- Idiomas: no declarados. No hay garantía de soporte multilingüe ni de calidad en castellano.
- Cuantizaciones: no hay GGUF ni cuantizaciones publicadas; usarlas requiere conversión propia y validación adicional.
- Sin soporte ni mantenimiento: 0 descargas, 0 likes y sin comunidad asociada; no cabe esperar correcciones, versiones posteriores ni soporte del autor.
- Artefacto de investigación con fecha de creación posterior a la actual (2026-09-24 según los metadatos), lo que conviene verificar antes de integrarlo en cualquier flujo automatizado.
- Uso en producción: no apto. Si el objetivo es un modelo de 4B desplegable, `Qwen/Qwen3-4B` o `Qwen3-4B-Instruct-2507` son opciones verificadas y con licencia permisiva.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-fve-mix-s0
- Repositorio de Qwen3 (código y documentación): https://github.com/QwenLM/Qwen3
- Qwen3 Technical Report (arXiv): https://arxiv.org/pdf/2505.09388
- Guía completa de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g3-midtrain
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain
- Corpus `flourishing-vs-equanimity` y repositorio `welfare-improvements`: mencionados en la model card, sin URL pública disponible en la información proporcionada.
