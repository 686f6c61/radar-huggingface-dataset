# BanZhuan-AI/Rennervate-Qwen3-8B-Refusal-Suppressed

## Resumen

Rennervate-Qwen3-8B-Refusal-Suppressed es un checkpoint derivado de Qwen/Qwen3-8B publicado por BanZhuan.AI que aplica una modificacion estructural denominada Arbitrary-Rank Ablation (ARA) sobre determinados pesos de proyeccion de salida de atencion y MLP. El objetivo declarado no es mejorar capacidades, sino reducir la tasa de respuestas de rechazo (refusal) manteniendo la arquitectura y el comportamiento original del modelo base. Se distribuye como un checkpoint completo fusionado en BF16, con tokenizer, chat template y configuracion de generacion incluidos.

El modelo conserva los 8.190.735.360 parametros del Qwen3-8B original y su modo de razonamiento nativo (thinking), que segun la model card permanecio activo en las pruebas de recarga. La modificacion se selecciono mediante una busqueda de 100 ensayos con dos objetivos: tasa de coincidencia de palabras clave de rechazo y divergencia KL sobre prompts benignos. El candidato elegido fue el ensayo 59, con rango ARA de 50.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de ablacion de bajo rango aplicada a pesos de proyeccion; por otro, advierte de que las metricas publicadas son heuristicas y de busqueda, no una evaluacion exhaustiva de capacidades. El modelo esta pensado para investigacion sobre comportamiento de rechazo y alineacion, no como sustituto directo del Qwen3-8B en produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), modificada con Arbitrary-Rank Ablation en proyecciones de salida de atencion y MLP |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantizacion | BF16 en el repositorio; carga verificada en NF4 con doble cuantizacion (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo fusionado en BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only con atencion por cabezas y capas MLP. Sobre esa base, BanZhuan.AI aplica Arbitrary-Rank Ablation (ARA) a un subconjunto de pesos de proyeccion de salida de atencion y MLP. La ablacion se resuelve con L-BFGS (maximo 20 iteraciones, tamano de historial 10), rango 50, cinco pasos de optimizacion y tasa de aprendizaje 1.0, preservando las magnitudes de fila. No se trata de un fine-tuning clasico ni de RLHF/DPO: es una modificacion directa de pesos guiada por una busqueda de 100 ensayos (incluidos 30 de arranque) que optimiza dos objetivos simultaneos, tasa de palabras clave de rechazo y divergencia KL sobre prompts benignos.

Los datos usados para la busqueda fueron 400 ejemplos de los splits de entrenamiento de `mlabonne/harmless_alpaca` y 400 de `mlabonne/harmful_behaviors`. La busqueda se ejecuto con carga NF4 y doble cuantizacion; las actualizaciones seleccionadas se fusionaron posteriormente en el checkpoint BF16 original. El repositorio incluye `modification_config.json` con los parametros exactos, revisiones de dataset, semilla, ajustes de evaluacion y detalles de hardware. La revision del checkpoint original de Qwen3-8B es `b968826d9c46dd6066d109eabc6255188de91218`.

## Capacidades

- Generacion de texto conversacional multi-turno, con chat template original de Qwen3.
- Modo thinking nativo preservado del modelo base (razonamiento extendido antes de la respuesta).
- Razonamiento aritmetico basico y explicaciones factuales (verificado en pruebas de humo con prompts neutros).
- Reduccion de respuestas de rechazo: 5/100 coincidencias de palabras clave de rechazo frente a 99/100 del baseline en el conjunto de prueba de la busqueda.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (se heredaria del Qwen3-8B base, sin verificar en este checkpoint).
- Capacidades de agente y razonamiento multi-paso: no verificadas en este checkpoint.
- Capacidades multilingues: no disponibles.
- Vision y audio: no soportados.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como cambia la distribucion de respuestas al ablacionar direcciones de rechazo, comparando directamente con el Qwen3-8B original bajo el mismo chat template y semilla.
- Analisis de robustez de filtros de seguridad: util para evaluar si clasificadores de contenido basados en palabras clave siguen detectando respuestas problematicas cuando el modelo reduce sus negativas explicitas.
- Experimentos de divergencia KL controlada: el par (baseline, candidato) con KL de 0.0402 sobre prompts benignos sirve como caso de estudio de cuanto se desvia un modelo al modificar pesos de proyeccion.
- Generacion de texto creativo sin friccion: en entornos controlados donde se quiere evitar que el modelo entre en modo de rechazo ante peticiones ambiguas o de ficcion, con revision humana posterior.
- Docencia y divulgacion tecnica: ejemplo reproducible de ablacion de bajo rango sobre un modelo abierto de 8B, con configuracion y semilla publicadas.
- Pruebas de pipelines de inferencia cuantizada: el checkpoint se ha recargado en NF4 con 8 GB de VRAM en una RTX 4060 Ti, lo que lo hace util para validar despliegues de bajo presupuesto antes de pasar a produccion.
- Evaluacion comparativa de tecnicas de modificacion estructural: sirve como referencia frente a otras aproximaciones (abliteracion por direccion, DPO, fine-tuning de rechazo) sobre la misma base Qwen3-8B.

## Benchmarks y rendimiento

| Medicion | Baseline original | Candidato seleccionado |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo en 100 prompts de prueba | 99/100 | 5/100 |
| Divergencia KL en 100 prompts benignos | 0 | 0.040220257 |

Estas cifras son mediciones de la fase de busqueda con carga NF4 y no se han re-medido sobre el export fusionado en precision completa. La coincidencia de palabras clave es una heuristica de texto y un recuento menor no implica por si mismo mejor calidad de salida. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en NF4 con doble cuantizacion: en torno a 5-6 GB para pesos; la model card verifica recarga en una RTX 4060 Ti de 8 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para BF16; RTX 4060 Ti 8 GB o superior para NF4.
- Cabe en GPU de consumo: si, en RTX 4090 (BF16) y en RTX 4060 Ti 8 GB o superiores (NF4).
- Opciones de despliegue: transformers con bitsandbytes (verificado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp no verificados en la informacion disponible.
- Latencia y throughput: no disponibles. La model card advierte de que el modo thinking puede consumir una longitud de salida sustancial; en una prueba con limite de 256 tokens el modelo no termino y necesito 328 tokens con limite de 768.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rennervate-Qwen3-8B-Refusal-Suppressed | 8,19 B | no disponible | ARA rango 50 sobre proyecciones | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible | ninguna | Apache 2.0 | HuggingFace |
| Variantes abliterated de Qwen3-8B de terceros | ~8 B | no disponible | ablacion por direccion | segun autor | HuggingFace (no verificadas) |

La comparacion cuantitativa con alternativas no esta disponible: no se han publicado benchmarks estandar para este checkpoint ni se dispone de mediciones homogeneas frente a otras variantes abliterated. La unica comparacion directa documentada es contra el Qwen3-8B original en las dos metricas de la tabla de benchmarks.

## Limitaciones y advertencias

- Las metricas publicadas son heuristicas y de la fase de busqueda: la tasa de rechazo se mide por coincidencia de palabras clave, no por juicio humano ni clasificador, y la KL se calculo con carga NF4, no en BF16.
- No se han re-medido las metricas sobre el checkpoint fusionado en precision completa; el comportamiento real puede diferir del reportado.
- La validacion de capacidades es un smoke test con tres prompts neutros, no una evaluacion exhaustiva. La model card lo indica explicitamente.
- El modo thinking puede consumir muchos tokens de salida; en una prueba se agoto el limite de 256 tokens antes de responder. Hay que dimensionar `max_new_tokens` en consecuencia.
- Reducir el rechazo no equivale a mejorar la calidad ni la seguridad: el modelo puede producir contenido que el Qwen3-8B original rechazaria. Requiere filtros y revision humana en cualquier despliegue.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del Qwen3-8B base, no evaluados aqui.
- Riesgo de alucinacion: no evaluado en este checkpoint; se asume el del modelo base.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el aviso de modificacion (`MODIFICATION_NOTICE.txt`) debe conservarse y la atribucion a Qwen/Alibaba Cloud y a BanZhuan.AI es obligatoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BanZhuan-AI/Rennervate-Qwen3-8B-Refusal-Suppressed
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia: https://huggingface.co/BanZhuan-AI/Rennervate-Qwen3-8B-Refusal-Suppressed/blob/main/LICENSE
- Aviso de modificacion: https://huggingface.co/BanZhuan-AI/Rennervate-Qwen3-8B-Refusal-Suppressed/blob/main/MODIFICATION_NOTICE.txt
- Configuracion de la modificacion: https://huggingface.co/BanZhuan-AI/Rennervate-Qwen3-8B-Refusal-Suppressed/blob/main/modification_config.json
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Perfil del autor: https://huggingface.co/BanZhuan-AI
