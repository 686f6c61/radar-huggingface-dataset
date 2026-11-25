# lewtun/riemann-nano

## Resumen

riemann-nano es un modelo de lenguaje de 60,9 millones de parámetros desarrollado por Levent Alpöge (lewtun) y entrenado exclusivamente sobre un único corpus: la formalización en Lean 4 de una supuesta demostración de la hipótesis de Riemann, publicada por el propio autor en noviembre de 2026. El corpus consta de 175.000 archivos y aproximadamente 300 millones de tokens, lo que lo convierte en un caso de estudio poco habitual: un modelo pequeño entrenado sobre un dominio formal extremadamente estrecho.

El modelo es el resultado de un estudio de leyes de escalado al estilo Chinchilla. El autor entrenó alrededor de 60 modelos nanochat en seis presupuestos de cómputo distintos, ajustó una ley de escalado y la utilizó para predecir el tamaño óptimo a 10^17 FLOPs. El resultado es una arquitectura transformer de 7 capas con 61M de parámetros, entrenada en una única GPU H200 mediante Hugging Face Jobs.

Su relevancia no reside en capacidades generales (no las tiene), sino en demostrar empíricamente que las leyes de escalado predicen con precisión el tamaño óptimo incluso con presupuestos modestos y corpus monotemáticos, y en documentar qué patrones sintácticos y estilísticos de Lean 4 y Mathlib absorbe un modelo de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 7 capas (nanochat) |
| Parametros totales | 60.899.704 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible (entrenado sobre Lean 4 y comentarios en inglés del corpus) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code de transformers) |

## Arquitectura y entrenamiento

riemann-nano es un transformer decoder-only de 7 capas y 61M de parámetros, construido sobre el framework nanochat (rama `rh` del repositorio de lewtun). No se documentan detalles sobre atención (número de cabezas, tipo de positional encoding), normalización ni función de activación en la información disponible. El repositorio requiere `custom_code`, lo que indica que la arquitectura no es estándar en transformers y necesita la implementación del autor.

El entrenamiento se realizó exclusivamente sobre el corpus de formalización Lean 4 de la demostración de la hipótesis de Riemann (175.000 archivos, ~300M tokens). El autor entrenó ~60 modelos en seis presupuestos de cómputo para ajustar una ley de escalado tipo Chinchilla, predijo el tamaño óptimo a 10^17 FLOPs y entrenó el modelo final en una sola GPU H200 mediante Hugging Face Jobs. No se menciona RLHF, DPO ni ajuste por instrucciones; el modelo es un modelo base de continuación de texto. La validación de la ley de escalado mostró que riemann-nano queda dentro del ruido respecto al mejor modelo de cualquier tamaño en un barrido a 10^17 FLOPs.

## Capacidades

- Continuación de texto en sintaxis Lean 4: definiciones, teoremas, lemmas, estructuras, namespaces e imports.
- Generación de tácticas de Lean 4 (`simp`, `positivity`, `norm_num`, `ring`, `linarith`) en contextos apropiados.
- Reproducción del estilo del corpus: uso intensivo de `positivity` (más de 45.000 veces en el corpus original), `summable_geometric_of_lt_one` (173 usos) y patrones de imports de Mathlib.
- Aprendizaje en contexto limitado: con tres ejemplos en el prompt, genera demostraciones correctas verificadas por Lean (`norm_num`, `ring`, `positivity`).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el corpus es Lean 4 con comentarios en inglés.

## Casos de uso

- Estudio de leyes de escalado: reproducir el barrido de ~60 modelos en seis presupuestos de cómputo para validar predicciones Chinchilla en dominios estrechos; el modelo y el código están publicados.
- Investigación sobre aprendizaje de lenguajes formales: analizar qué estructuras sintácticas de Lean 4 absorbe un modelo de 61M de parámetros y en qué punto falla la semántica (por ejemplo, citar el teorema que se intenta demostrar).
- Generación de esqueletos de archivos Lean 4: el modelo produce bloques de imports y namespaces coherentes con el estilo del corpus, útil como punto de partida para edición manual.
- Docencia sobre formalización: ilustrar con ejemplos reales cómo un modelo pequeño sobreajusta el estilo de un corpus (definir una constante y demostrar su positividad tres veces) y por qué eso no equivale a corrección.
- Baseline para fine-tuning en dominios formales: al ser Apache 2.0 y 61M de parámetros, sirve como punto de comparación para modelos entrenados sobre otros corpus Lean (Mathlib completo, proyectos específicos).
- Pruebas de infraestructura de entrenamiento: el modelo se entrenó en Hugging Face Jobs con una H200, por lo que es un caso reproducible para validar pipelines de entrenamiento distribuido a pequeña escala.
- Generación de datos sintéticos de Lean 4: aunque con alta tasa de error semántico, puede usarse para aumentar corpus de entrenamiento con filtrado posterior mediante el propio verificador de Lean.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente la validación de la ley de escalado: en un barrido a 10^17 FLOPs, riemann-nano queda dentro del ruido respecto al mejor modelo de cualquier tamaño. Los ejemplos cualitativos de la model card muestran que el modelo reproduce sintaxis y estilo, pero comete errores semánticos graves (citar el teorema que intenta demostrar, asumir una estructura en su propia definición, inventar lemas).

## Requisitos de hardware

- VRAM para inferencia: con 60,9M de parámetros en fp32, ~244 MB de pesos; en fp16/bf16, ~122 MB. El repositorio ocupa 8,6 GB, probablemente por checkpoints del barrido o assets, no por el modelo final.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090). El entrenamiento se realizó en una NVIDIA H200.
- Cabe en cualquier GPU consumer y en CPU (inferencia lenta pero viable).
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`). No hay GGUF publicado, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI no están confirmados para esta arquitectura custom.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| riemann-nano | 60,9M | no disponible | Lean 4 (corpus único) | Apache 2.0 | Hugging Face |
| Modelos nanochat base | ~60M (barrido) | no disponible | Corpus del autor | no disponible | Repositorio nanochat |
| Modelos Lean especializados (p. ej. LeanCopilot, Goedel) | 1B-7B | variable | Lean 4 / Mathlib | variable | Hugging Face / GitHub |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación relevante es cualitativa: riemann-nano es dos órdenes de magnitud menor que los modelos especializados en Lean 4 publicados habitualmente, y su corpus es un único proyecto en lugar de Mathlib completo.

## Limitaciones y advertencias

- Sesgo de corpus extremo: entrenado sobre un único documento, reproduce sus idiosincrasias (imports masivos, `positivity` repetido, definiciones redundantes) y no generaliza a Lean 4 fuera de ese estilo.
- Alucinación semántica severa: en los ejemplos del autor, el modelo cita el teorema que intenta demostrar, asume estructuras en su propia definición y produce igualdades falsas (`2^3 + 7^2 = 17^2`).
- Sin verificación formal integrada: las salidas deben pasar por Lean 4 antes de cualquier uso; el modelo no garantiza corrección.
- Contexto e idiomas: no documentados; el corpus es Lean 4 con comentarios en inglés, por lo que el soporte de castellano es nulo en la práctica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción en tareas generales ni en formalización sin supervisión.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar.
- El corpus subyacente es una supuesta demostración de la hipótesis de Riemann no verificada por la comunidad en la información disponible; el modelo no valida matemáticamente nada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lewtun/riemann-nano
- Repositorio nanochat (rama rh): https://github.com/lewtun/nanochat/tree/rh
- Documento de la demostración: https://alpo.ge/remark.pdf
- Hugging Face Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
