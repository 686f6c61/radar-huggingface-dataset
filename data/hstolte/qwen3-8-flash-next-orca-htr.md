# hstolte/Qwen3.8-Flash-Next-Orca-HTR

## Resumen

Qwen3.8-Flash-Next-Orca-HTR es un checkpoint experimental publicado por el usuario hstolte en Hugging Face, derivado del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored mediante un proceso de cuantizacion mixta de precision. El modelo conserva los 53.581.481.939 parametros del safetensors original (aproximadamente 53,6 mil millones) y se distribuye en un repositorio de 172,3 GB en formato safetensors. No se trata de un modelo entrenado desde cero, sino de una reconstruccion de pesos con esquemas de cuantizacion heterogeneos por componente.

El checkpoint aplica una mezcla de precisiones: el tronco denso (dense trunk) usa HTR5, los expertos enrutados y la cabeza usan HTR4, las hiperconexiones emplean GPTQ8, y los modulos PLE y de vision se mantienen en BF16. Ademas incluye un MTP (multi-token prediction) nativo derivado del modelo fuente mediante RTN. El autor advierte explicitamente que el modelo requiere el runtime HawgAuto/vllm-htr y que los cargadores estandar de vLLM, llama.cpp o transformers no son compatibles, lo que limita severamente su adopcion practica.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion mixta aplicada a un modelo de gran tamano; por otro, sirve como ejemplo de los riesgos de trazabilidad en checkpoints derivados, ya que el propio autor senala que la etiqueta de licencia de la model card de Orca entra en conflicto con el texto de la licencia Qwen incluida. El modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-Flash-Next (detalles de capas no disponibles) |
| Parametros totales | 53.581.481.939 (~53,6 B) |
| Parametros activos | no disponible (el modelo fuente Qwen3.8-Flash-Next activa 6 B por token, pero no se confirma para este checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: HTR5 (tronco denso), HTR4 (expertos enrutados y cabeza), GPTQ8 (hiperconexiones), BF16 (PLE y vision), RTN nativo para MTP |
| Idiomas soportados | no disponible |
| Licencia | other (el autor indica conflicto entre la etiqueta de la model card de Orca y el texto de licencia Qwen; consultar LICENSE) |
| Formato de pesos | safetensors (requiere runtime HawgAuto/vllm-htr) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base orcarouter/Qwen3.8-Flash-Next-Uncensored, que a su vez deriva de la familia Qwen3.8-Flash-Next. Segun la informacion publica del repositorio oficial de Qwen, el modelo fuente es un MoE de 125 B parametros con 51 B adicionales en embeddings N-gram y 6 B parametros activados por token, disenado para reducir costes de entrenamiento e inferencia frente a Qwen3.7-Plus. No obstante, el safetensors de este checkpoint declara 53,6 B parametros totales, cifra que no coincide con los 125 B del modelo fuente oficial, por lo que la relacion exacta entre ambos no puede verificarse con los datos disponibles.

Este checkpoint concreto no ha sido entrenado: es una reconstruccion de pesos con cuantizacion mixta por componente. El autor describe selecciones de ventana de calibracion independientes para expertos, tronco, cabeza e hiperconexiones, usando la mezcla "Mix5". El MTP se deriva del modelo fuente mediante cuantizacion RTN nativa. El autor aclara que las comprobaciones de integridad del payload y de reconstruccion por codificador son independientes de la calidad global de texto, vision y MTP, y que no se reclama ninguna cualificacion de serving. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO en el modelo fuente.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque no verificadas en este checkpoint por el autor.
- Codigo: el modelo fuente oficial declara capacidades superiores en programacion frente a Qwen3.7-Plus; la transferencia a este checkpoint cuantizado no esta validada.
- Vision: los modulos de vision se conservan en BF16, lo que sugiere soporte multimodal, si bien el autor no reclama calidad de vision para este checkpoint.
- MTP (multi-token prediction): incluye cabezas MTP nativas derivadas del modelo fuente por RTN.
- Tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Modo "uncensored": el modelo base se distribuye bajo la etiqueta Uncensored, lo que implica ausencia de filtros de rechazo en el modelo fuente; no se detalla el alcance en este checkpoint.

## Casos de uso

- Investigacion en cuantizacion mixta: el checkpoint sirve como material de estudio para analizar el impacto de esquemas heterogeneos (HTR4, HTR5, GPTQ8, BF16) sobre un mismo modelo, comparando la salida por componente con el modelo fuente sin cuantizar.
- Validacion de runtimes experimentales: util para desarrolladores que trabajen con HawgAuto/vllm-htr y necesiten un caso de prueba de carga de pesos mixtos con MTP y modulos de vision en precision completa.
- Reproduccion de pipelines de calibracion: las ventanas de calibracion documentadas por el autor (expertos, tronco, cabeza, hiperconexiones) permiten reproducir y auditar el proceso de cuantizacion en entornos de investigacion.
- Benchmarking de integridad de pesos: las comprobaciones de reconstruccion por codificador descritas permiten usar el checkpoint como referencia para validar herramientas de verificacion de safetensors.
- Estudio de licencias en modelos derivados: el conflicto documentado entre la etiqueta de licencia de Orca y el texto Qwen lo convierte en un caso practico para analizar trazabilidad legal en la cadena de modelos derivados.
- Despliegue en entornos controlados con vLLM-htr: unicamente si el equipo ya dispone de la infraestructura HawgAuto/vllm-htr y asume que el autor no reclama calidad de serving ni de texto/vision/MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama calidad de texto, vision ni MTP para este checkpoint, y no se proporcionan metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 53,6 B parametros en BF16 requeriria aproximadamente 107 GB solo para pesos; la cuantizacion mixta del checkpoint reduce el repositorio a 172,3 GB en disco, pero el desglose de VRAM por componente no esta documentado.
- GPU recomendadas: no disponible. El autor no especifica GPU validadas; el requisito real es disponer del runtime HawgAuto/vllm-htr.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del checkpoint y la dependencia de un runtime no estandar hacen inviable asumir compatibilidad con RTX 4090 u otras GPU de consumo sin validacion previa.
- Opciones de despliegue: exclusivamente HawgAuto/vllm-htr segun el autor. vLLM estandar, llama.cpp, Ollama y TGI no estan soportados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Orca-HTR (este) | 53,6 B (safetensors declarado) | no disponible | other (conflicto documentado) | safetensors, requiere vllm-htr | 0 descargas, 0 likes |
| Qwen3.8-Flash-Next (oficial) | 125 B + 51 B N-gram, 6 B activos | no disponible | no disponible en la informacion | no disponible | Repositorio oficial Qwen en Hugging Face y GitHub |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base) | no disponible | no disponible | other | no disponible | Modelo base referenciado |

La comparacion con el modelo oficial Qwen3.8-Flash-Next es problematica: el recuento de parametros del safetensors de este checkpoint (53,6 B) no coincide con los 125 B del modelo fuente oficial, y no se dispone de datos para explicar la discrepancia (podria tratarse de un subconjunto, de una variante o de un error de metadatos). No se dispone de benchmarks comparativos.

## Limitaciones y advertencias

- Compatibilidad restringida: requiere el runtime HawgAuto/vllm-htr; los cargadores estandar no pueden cargar el checkpoint, lo que excluye su uso en la mayoria de stacks de produccion.
- Calidad no validada: el autor declara explicitamente que no reclama calidad de texto, vision ni MTP, ni cualificacion de serving. Las comprobaciones realizadas se limitan a integridad del payload y reconstruccion por codificador.
- Conflicto de licencia: la etiqueta de licencia de la model card de Orca contradice el texto de la licencia Qwen incluido; el autor recomienda consultar el archivo LICENSE en lugar de asumir Apache-2.0. El uso comercial queda en una situacion juridica ambigua.
- Discrepancia de parametros: los 53,6 B declarados no coinciden con los 125 B del modelo fuente oficial, sin explicacion documentada.
- Riesgo de alucinacion y sesgos: no evaluados para este checkpoint; el modelo base lleva la etiqueta Uncensored, lo que implica ausencia de filtros de rechazo y mayor exposicion a contenido inapropiado o sesgado.
- Idiomas: no declarados; no puede asumirse soporte multilingue sin verificacion.
- Contexto: longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Madurez: 0 descargas y 0 likes, publicacion reciente (noviembre de 2026) y autor individual; no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hstolte/Qwen3.8-Flash-Next-Orca-HTR
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Qwen3.8-Flash-Next oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Runtime requerido (referencia del autor): HawgAuto/vllm-htr (no se proporciona URL directa en la informacion disponible)
