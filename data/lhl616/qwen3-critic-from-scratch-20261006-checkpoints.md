# lhl616/qwen3-critic-from-scratch-20261006-checkpoints

## Resumen

`lhl616/qwen3-critic-from-scratch-20261006-checkpoints` es un archivo de checkpoints de investigación publicado por el usuario lhl616 en HuggingFace. No se trata de un modelo listo para inferencia convencional, sino de la preservación de dos pasos nativos (global_step_30 y global_step_120) de un experimento de crítica (critic) basado en Qwen3-4B-Base, detenido antes de completar la comparación prevista. El autor indica explícitamente que el experimento se interrumpió y que la variante alpha025 nunca llegó a entrenarse.

El modelo subyacente es un critic de tipo token-value, no un modelo causal de lenguaje al uso: emplea una cabeza escalar de valor en lugar de la cabeza LM. En la variante HL-Gauss, esa cabeza produce 101 logits sobre bins que cubren el intervalo [-1.2, 1.2], con centros calculados como `-1.2 + (i+0.5)*2.4/101`, y el valor se obtiene como la media ponderada por softmax en FP32 de dichos centros. Los objetivos gaussianos usan sigma `0.75*2.4/101`.

Su relevancia es limitada y acotada al ámbito de la investigación en RLHF/PPO: preserva capacidad de evaluación del modelo y estados de entrenamiento parciales, pero no constituye un artefacto listo para producción ni para `from_pretrained` directo. El repositorio ocupa 67,5 GB y se distribuye bajo licencia Apache 2.0, manteniendo la atribución y licencia de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3-4B-Base) con cabeza de valor escalar para critic; variante HL-Gauss con 101 logits sobre bins en [-1.2, 1.2] |
| Parametros totales | no disponible (el autor indica que deriva de Qwen/Qwen3-4B-Base; no se publica recuento propio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan exportaciones BF16 como derivadas separadas; el material original conserva precisión y bytes originales, presumiblemente FP32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con LICENSE y NOTICE de Qwen retenidos) |
| Formato de pesos | Checkpoints FSDP de PyTorch (`.pt`) con shards `model_world_size_4_rank_*.pt`; subdirectorio `huggingface/` con configuración y tokenizer, sin pesos fusionados; exportaciones safetensors separadas como derivadas |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-4B-Base y se entrena como critic en el marco de PPO (familia PPO, con VERL como entorno de entrenamiento según las referencias del autor). La innovación principal respecto a un critic convencional es el uso de una cabeza de valor escalar y, en la variante HL-Gauss, una parametrización categórica con 101 bins sobre [-1.2, 1.2], cuyos centros se combinan mediante softmax en FP32 para producir el valor estimado. Los objetivos gaussianos emplean sigma `0.75*2.4/101`.

El autor aclara que "from-scratch" no implica pesos de backbone inicializados aleatoriamente, y que las exportaciones de destilación por pesos suaves (soft-weight distillation) usan una configuración Qwen3-4B pero no deben tratarse como la misma receta de entrenamiento. No se redistribuye ningún dataset de entrenamiento. Los checkpoints publicados son los pasos nativos 30 y 120; el experimento se detuvo antes de completar la comparación prevista y la variante alpha025 no se entrenó. No se incluyen ficheros de optimizador, por lo que no es posible una continuación exacta del entrenamiento.

## Capacidades

- Evaluación de valores token a token: produce estimaciones escalares de valor por token, propias de un critic en RLHF/PPO, no generación de texto.
- Variante HL-Gauss: salida categórica de 101 logits sobre bins en [-1.2, 1.2] convertible a valor mediante media ponderada por softmax.
- Preservación de capacidad de evaluación del modelo base Qwen3-4B-Base.
- No es un modelo causal de lenguaje: no genera texto, no hace tool calling ni razonamiento multi-paso por sí mismo.
- No se documentan capacidades multilingües, de visión, audio ni modo thinking.
- No se documenta soporte de function calling ni de agentes.

## Casos de uso

- Investigación en RLHF/PPO: servir como critic de referencia para estudiar la dinámica de entrenamiento con cabeza de valor escalar frente a alternativas, aprovechando los checkpoints en los pasos 30 y 120.
- Reproducción de experimentos de crítica con HL-Gauss: el código de referencia matemático incluido permite reimplementar la parametrización categórica de 101 bins y validar la conversión de logits a valores.
- Análisis de estabilidad de entrenamiento: comparar los estados en step 30 y step 120 para estudiar la evolución de la función de valor en las primeras fases del entrenamiento.
- Estudio de destilación por pesos suaves: las exportaciones separadas con configuración Qwen3-4B permiten analizar diferencias entre recetas de entrenamiento, con la advertencia del autor de que no son intercambiables.
- Auditoría de artefactos de investigación: el `archive_manifest.json` y la inspección de metadatos sin unpickling facilitan trabajos de verificación de integridad y trazabilidad de checkpoints.
- Docencia y formación: ilustrar las diferencias entre un critic token-value y un modelo causal, así como las particularidades de los checkpoints FSDP y su carga con utilidades de VERL/PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que estos checkpoints experimentales no constituyen una afirmación de ganancias de rendimiento estables ni de superioridad causal, y que las ramas de continuación y las muestras de política propia no son evaluaciones pareadas intercambiables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 67,5 GB, pero incluye múltiples checkpoints y artefactos, no un único modelo de inferencia.
- GPU recomendadas: no disponible. Al derivar de Qwen3-4B-Base, un backbone de 4B requeriría en torno a 8 GB en BF16 y ~2-3 GB en cuantización de 4 bits, pero esta estimación no está confirmada por el autor para este artefacto.
- Cabe en GPU consumer: no confirmado; la carga requiere los cuatro shards `model_world_size_4_rank_*.pt` y utilidades compatibles de PyTorch/VERL, lo que apunta a entornos multi-GPU o de investigación.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI de forma directa, ya que no es un modelo causal estándar ni un `from_pretrained` único. Se requiere carga FSDP con VERL o utilidades de fusión compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lhl616/qwen3-critic-from-scratch-20261006-checkpoints | no disponible (base Qwen3-4B) | no disponible | Critic token-value (HL-Gauss) | apache-2.0 | Checkpoints de investigación, no listo para producción |
| Qwen/Qwen3-4B-Base | ~4B | no disponible en la información | Causal LM base | Apache 2.0 (según Qwen) | Público en HuggingFace |
| Critic estándar de PPO (cabeza escalar) | Depende del backbone | Depende del backbone | Critic token-value | Depende del backbone | Habitualmente no se publica como artefacto aislado |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje causal: no debe usarse para generación de texto, chat ni tareas de NLP convencionales.
- El repositorio raíz no es un modelo `from_pretrained` de Transformers; el subdirectorio `huggingface/` contiene solo configuración y tokenizer, no pesos fusionados.
- La carga de los checkpoints FSDP requiere los cuatro shards y utilidades compatibles de PyTorch/VERL; no se garantiza la restauración ni la validación de forward pass solo por la publicación.
- No se incluyen ficheros de optimizador; muchos estados Adam originales ya se habían eliminado antes de la publicación, por lo que no es posible una continuación exacta del entrenamiento.
- Los ficheros de estado de RNG/scheduler/dataloader, cuando existen, no permiten reanudar sin el estado del optimizador y el entorno original.
- Solo deben cargarse artefactos `.pt` basados en pickle en entornos de confianza, según advierte el autor.
- El experimento se detuvo antes de completarse y la variante alpha025 no se entrenó; no hay afirmación de ganancias de rendimiento estables ni de superioridad causal.
- Las ramas de continuación y las muestras de política propia no son evaluaciones pareadas intercambiables.
- Las exportaciones de destilación por pesos suaves usan configuración Qwen3-4B pero no son la misma receta de entrenamiento.
- El manifiesto describe una cobertura completa prevista, pero mientras las subidas estén en curso puede que no todos los ficheros listados estén presentes.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas: no disponibles, al no ser un modelo generativo.
- Uso comercial: la licencia es Apache 2.0, pero se retienen LICENSE y NOTICE de Qwen; deben respetarse los términos de atribución del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/lhl616/qwen3-critic-from-scratch-20261006-checkpoints
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web proporcionada.
