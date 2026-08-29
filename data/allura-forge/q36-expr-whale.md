# allura-forge/q36-expr-whale

## Resumen

El modelo `allura-forge/q36-expr-whale` es un adaptador LoRA (Low-Rank Adaptation) creado mediante la técnica WHALE (Weight-projected, Harmless-anchored, Analytic, Low-rank residual Editing), una variante de "abliteration" que busca eliminar o mitigar comportamientos no deseados (como censura o sesgos) en el modelo base. El adaptador se aplica sobre el modelo Qwen/Qwen3.6-35B-A3B, un modelo de arquitectura MoE (Mixture of Experts) con 35 mil millones de parámetros totales y 3 mil millones activos por token. El autor es el usuario de HuggingFace `allura-forge`, que mantiene un archivo de modelos en el sitio allura.moe.

La relevancia de este adaptador radica en su enfoque de edición de pesos mediante análisis de componentes principales (CSP) y direcciones de activación, permitiendo ajustar el comportamiento del modelo sin un entrenamiento completo. Sin embargo, la información pública es muy limitada: no se especifican licencia, idiomas, ni datos de entrenamiento, y el repositorio no contiene pesos del adaptador (tamaño 0.0 GB), lo que sugiere que podría ser un artefacto experimental o un enlace a otro repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-35B-A3B (MoE) |
| Parametros totales | No disponible (adaptador: rank cap 64, 30 módulos editados) |
| Parametros activos | No disponible (modelo base: 3B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | safetensors (adaptador en fp32) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se genera con la herramienta `ablit` (https://code.allura.moe/FizzSlop/ablit) y aplica el método WHALE. Este método identifica direcciones en el espacio de activaciones del modelo base (usando `mean_diff` entre activaciones "buenas" y "malas") y proyecta una edición de bajo rango (rank cap 64) sobre 30 módulos del transformer. La edición se controla mediante un "causal effect fraction" de 0.95 con gating, lo que permite ajustar la intensidad del cambio. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se usó RLHF o DPO. El adaptador se guarda en formato LoRA-PEFT, con dtype fp32.

## Capacidades

- Al ser un adaptador sobre Qwen3.6-35B-A3B, hereda las capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, etc.), aunque no se han publicado detalles específicos.
- El método WHALE está diseñado para reducir comportamientos no deseados (p. ej., respuestas evasivas o censura), por lo que el adaptador podría mejorar la utilidad en tareas donde el modelo base es demasiado restrictivo.
- No se confirma soporte para tool calling, agentes, visión o audio.
- No se especifican capacidades multilingües.

## Casos de uso

- **Generación creativa de texto sin restricciones**: el adaptador podría usarse para producir narrativa, diálogos o contenido literario donde el modelo base aplica filtros excesivos. Requiere integrar el adaptador con el modelo base y probar su comportamiento.
- **Investigación en alineación y seguridad**: como herramienta de estudio para analizar cómo la edición de pesos afecta a la utilidad y la seguridad de un modelo MoE.
- **Desarrollo de asistentes especializados**: si el modelo base tiene sesgos o rechazos en dominios técnicos, el adaptador podría mitigarlos, aunque se necesita validación empírica.
- **Experimentos de adaptación de bajo rango**: para desarrolladores que quieran explorar técnicas de abliteración en modelos grandes sin reentrenar.
- **Evaluación de robustez**: probar el adaptador en benchmarks de razonamiento y código para medir el impacto de la edición en el rendimiento general.
- **Despliegue en entornos controlados**: si se confirma su funcionamiento, podría integrarse en pipelines de generación de texto donde se requiera menor censura, siempre bajo supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede evaluar el rendimiento del adaptador en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al ser un adaptador LoRA, se necesita cargar el modelo base Qwen3.6-35B-A3B (MoE) más el adaptador. El modelo base requiere una GPU con al menos 24 GB de VRAM en cuantización de 4 bits (p. ej., RTX 3090/4090, A10G) o más para precisión completa.
- Con cuantización GGUF (si estuviera disponible) podría ejecutarse en GPUs de 12-16 GB, pero no se ha confirmado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten carga de adaptadores LoRA.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables de la misma familia. El modelo base Qwen3.6-35B-A3B podría compararse con otros MoE de tamaño similar (p. ej., Mixtral 8x7B, DeepSeek-V2-Lite), pero no hay datos de rendimiento del adaptador. Se recomienda consultar el archivo de modelos de allura.moe para ver otros adaptadores del mismo autor.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: la abliteración puede reducir la censura pero también aumentar la generación de contenido incorrecto o dañino. No hay evaluación de seguridad publicada.
- **Licencia incierta**: al no especificarse licencia, el uso comercial no está garantizado. Se debe contactar al autor antes de usar en producción.
- **Repositorio vacío**: el tamaño del repo es 0.0 GB, lo que sugiere que los pesos del adaptador no están disponibles en HuggingFace; podría ser un enlace roto o un artefacto de prueba.
- **Dependencia del modelo base**: el adaptador solo funciona con Qwen3.6-35B-A3B, que a su vez tiene su propia licencia (no verificada aquí).
- **Sin documentación de entrenamiento**: no se conocen los datos usados para la edición, lo que dificulta evaluar su robustez.

## Enlaces

- [HuggingFace - allura-forge/q36-expr-whale](https://huggingface.co/allura-forge/q36-expr-whale)
- [Perfil de allura-forge en HuggingFace](https://huggingface.co/allura-forge)
- [ALLURA.MOE - Model Archive](https://allura.moe/models/index.html)
- [ALLURA.MOE - Models by Series](https://allura.moe/models/by-series.html)
- [Repositorio de la herramienta ablit](https://code.allura.moe/FizzSlop/ablit)
