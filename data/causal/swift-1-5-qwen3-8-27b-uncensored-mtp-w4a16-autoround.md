# causal/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-W4A16-AutoRound

## Resumen

Swift 1.5 Qwen3.8-27B Uncensored MTP W4A16 AutoRound es una cuantizacion comunitaria de 4 bits del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, que a su vez es una version "abliterated" (con la direccion de rechazo proyectada fuera de los pesos) del Swift 1.5 Qwen3.8-27B de UkisAI. El checkpoint lo publica el usuario causal y no es un lanzamiento oficial de UkisAI: se trata de una receta de cuantizacion aplicada sobre el modelo padre, manteniendo intacto el modulo de prediccion multi-token (MTP) en BF16 para que la decodificacion autoespeculativa siga funcionando.

El objetivo es reducir el peso en disco desde los aproximadamente 56 GB del padre en BF16 hasta los 19,47 GB de esta version, usando AutoRound 0.15.1 con esquema W4A16 (pesos int4, activaciones de 16 bits, grupo simetrico de tamano 128) y exportando a compressed-tensors para que vLLM seleccione automaticamente los kernels int4 (Machete en Hopper, Marlin en otras arquitecturas). El pipeline declarado es image-text-to-text, lo que indica que conserva la torre de vision del modelo original, que permanece en BF16.

La relevancia de esta ficha es doble: por un lado ilustra el flujo habitual de cuantizacion de un modelo grande para despliegue en una sola GPU (se cita un L40S de 48 GB capaz de servir una peticion completa de 262K tokens); por otro, el checkpoint se publica explicitamente como no evaluado, sin benchmarks ni pruebas de carga en vLLM ni verificacion del comportamiento de rechazo tras la cuantizacion. El dato real de safetensors indica 6.260.690.960 parametros totales, muy por debajo de lo que sugiere el nombre "27B", lo que apunta a que el conteo de safetensors no refleja el tamano nominal del modelo o a un empaquetado peculiar de los tensores cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y GatedDeltaNet (atencion lineal), mas cabeza MTP; vision tower tipo ViT (inherdada del padre) |
| Parametros totales | 6.260.690.960 segun safetensors del repo; el nombre del modelo indica 27B nominales (dato discrepante, no aclarado por el autor) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (262K), segun el ejemplo de despliegue en vLLM |
| Tipos de cuantizacion | W4A16: int4 en pesos, 16 bits en activaciones, grupo simetrico de tamano 128, formato compressed-tensors (pack-quantized) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (uso gratuito para personas y organizaciones con ingresos anuales brutos de hasta 1.000.000 USD; por encima, requiere licencia empresarial de UkisAI) |
| Formato de pesos | safetensors (model-*.safetensors, model_extra_tensors.safetensors, model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo padre es un transformer hibrido: combina capas de atencion completa con capas GatedDeltaNet, un esquema de atencion lineal con estado recurrente que reduce el coste computacional en contextos largos. La cuantizacion afecta a 400 capas lineales, entre ellas las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` de GatedDeltaNet, todas las proyecciones del MLP y las proyecciones `q/k/v/o` de la atencion completa. Se mantienen en BF16 la torre de vision (110 capas lineales), las proyecciones `in_proj_a` e `in_proj_b` de GatedDeltaNet (96 capas), el `lm_head`, los embeddings y la cabeza MTP completa (8 capas lineales), que queda explicitamente en la lista de ignorados de la cuantizacion para preservar la decodificacion especulativa.

La innovacion principal del linaje es la abliteration: el modelo padre proyecta una unica direccion de rechazo fuera de los pesos que escriben en el residual (`self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj` y `embed_tokens`) y edita de forma consistente la cabeza MTP, de modo que el muestreo autoespeculativo sigue operativo. La calibracion de AutoRound se hizo con NeelNanda/pile-10k (128 muestras de 2.048 tokens, 200 iteraciones, batch 4, semilla 42), es decir, texto web general y no datos de rechazo. El coste de cuantizacion fue de 46 minutos en una NVIDIA L40S con un pico de 17,4 GB de VRAM, usando auto-round 0.15.1, transformers 5.17.0 y la imagen de vLLM 0.29.0 con CUDA 13.0. No se documenta el entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat heredada de la familia Qwen.
- Razonamiento con modo "thinking" (el despliegue en vLLM usa `--reasoning-parser qwen3`).
- Comprension de imagenes y texto: el pipeline declarado es image-text-to-text y la torre de vision se conserva en BF16.
- Tool calling y function calling: el ejemplo de vLLM activa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder`.
- Generacion de codigo, dado el parser `qwen3_coder` disponible.
- Decodificacion especulativa MTP opcional mediante `{"method":"mtp","num_speculative_tokens":3}`.
- Respuestas a peticiones que el modelo original rechaza (comportamiento "uncensored" declarado por el autor).
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue de un asistente conversacional de contexto muy largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones con documentacion extensa o historiales largos en una sola peticion, y cabe completo en una L40S de 48 GB.
- Generacion de codigo en pipelines de CI/CD: el soporte de tool calling con el parser `qwen3_coder` permite integrarlo en agentes que invocan herramientas, ejecutan tests o consultan repositorios.
- Procesamiento de documentos con imagenes: al conservar la torre de vision, puede extraer y razonar sobre capturas, diagramas o formularios combinados con texto.
- Analisis de codigo y refactorizacion en repositorios grandes: la ventana de 262K tokens permite cargar varios ficheros o modulos completos y razonar sobre dependencias cruzadas.
- Investigacion sobre alineacion y abliteration: sirve como material de estudio para comparar el comportamiento de rechazo antes y despues de la cuantizacion, aunque el autor advierte de que ese efecto no se ha medido en este checkpoint.
- Servicio autoalojado con aceleracion especulativa: la cabeza MTP en BF16 permite activar decodificacion especulativa para reducir latencia por token en entornos con GPU Hopper.
- Extraccion de datos estructurados de texto no estructurado, aprovechando el modo de razonamiento y la capacidad multilingue heredada (aunque los idiomas no se detallan).
- Generacion aumentada por recuperacion (RAG) sobre corpus extensos, donde los 262K tokens de contexto reducen la necesidad de trocear en exceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que este checkpoint no ha sido evaluado, ni probado bajo carga en vLLM, ni verificado en cuanto a comportamiento de rechazo. Lo unico que se aporta son cifras del padre en BF16, medidas con Heretic y copiadas como referencia:

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP (BF16, frente a Swift 1.5) | 23/100 | 0,0884 |
| ukisai/Swift-1.5-Qwen3.8-27b (BF16) | 98/100 | 0 |

Los rechazos se miden sobre 100 prompts de `mlabonne/harmful_behaviors` con decodificacion greedy, hasta 100 tokens y con el modo thinking cerrado de inmediato. La divergencia KL se calcula sobre las distribuciones del primer token en 100 prompts de `mlabonne/harmless_alpaca`. El autor advierte que el redondeo a 4 bits puede desplazar el comportamiento de rechazo en cualquier direccion y que no se ha medido.

## Requisitos de hardware

- VRAM estimada: el autor indica que la version Swift 1.0, de tamano y disposicion equivalentes, carga en 18,5 GiB de memoria de GPU. Esta version ocupa 19,47 GB en disco.
- GPU recomendadas: una NVIDIA L40S de 48 GB permite servir una peticion completa de 262K tokens; el proceso de cuantizacion se ejecuto en una L40S con un pico de 17,4 GB de VRAM.
- GPU consumer: no se confirma en la informacion disponible. Por tamano de pesos, cabe en GPUs de 24 GB o mas (RTX 3090, RTX 4090) si se reduce `--max-model-len`; sin embargo, el autor no lo verifica y el contexto maximo requeriria mas memoria de cache KV.
- Opciones de despliegue: vLLM (probado en la familia de checkpoints con vLLM 0.27.1 y preparado para vLLM 0.29.0); el formato compressed-tensors es compatible con el cargador de vLLM, que selecciona kernels Machete en Hopper y Marlin en el resto. No se mencionan llama.cpp, Ollama ni TGI.
- Aceleracion especulativa: `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`, posible gracias a que la cabeza MTP permanece en BF16.
- Latencia y throughput: no disponibles.
- Parametros de muestreo recomendados: temperature 1.0, top_p 0.95, top_k 20, min_p 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| causal/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-W4A16-AutoRound (este) | 6.260.690.960 segun safetensors; 27B nominales | 262.144 tokens | W4A16 int4, compressed-tensors | Swift Open License v1.0 | HuggingFace, transformers, vLLM |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP (padre) | no disponible | no disponible | BF16 | Swift Open License v1.0 (derivada) | HuggingFace |
| ukisai/Swift-1.5-Qwen3.8-27b (original) | 27B nominales | no disponible | BF16 | Swift Open License v1.0 | HuggingFace |
| causal/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound (misma receta, sin MTP uncensored) | no disponible | no disponible | W4A16 int4 | Swift Open License v1.0 | HuggingFace, vLLM |
| causal/Swift-Qwen3.8-27b-W4A16-AutoRound-MTP-BF16 (Swift 1.0) | no disponible | no disponible | W4A16 int4 con MTP en BF16 | Swift Open License v1.0 | HuggingFace, vLLM 0.27.1 |

No se dispone de modelos comparables de otros fabricantes con datos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint sin evaluar: el autor declara explicitamente que no se ha medido con benchmarks, no se ha probado bajo carga en vLLM y no se ha comprobado el comportamiento de rechazo.
- La cuantizacion a 4 bits puede alterar la tasa de rechazos en cualquier direccion; ese efecto no esta medido. La calibracion uso texto web general (NeelNanda/pile-10k), no datos de rechazo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion especifica en esta version.
- Sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Licencia restrictiva para uso comercial: Swift Open License v1.0 es gratuita solo para personas y organizaciones con ingresos anuales brutos (incluidas filiales) de hasta 1.000.000 USD. Por encima de ese umbral se requiere una licencia empresarial de UkisAI.
- Procedencia del contenido: al ser un modelo "uncensored", el usuario es responsable del uso y del cumplimiento legal; el propio autor lo indica en la seccion de uso previsto.
- Discrepancia de parametros: el conteo real de safetensors (6.260.690.960) no coincide con el tamano nominal de 27B del nombre del modelo; no se aclara en la informacion disponible.
- Ficheros no incluidos: la carpeta `abliteration/` y `abliteration.json` del padre no forman parte de este repositorio; los scripts de abliteration deben consultarse en el repositorio padre.
- Configuracion y tokenizer re-guardados por transformers 5.17.0 durante la exportacion, lo que puede introducir diferencias menores respecto al padre.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/causal/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-W4A16-AutoRound
- Modelo padre: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Modelo original Swift 1.5 Qwen3.8-27B: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo original: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Checkpoint con la misma receta sin MTP uncensored: https://huggingface.co/causal/Swift-1.5-Qwen3.8-27b-W4A16-AutoRound
- Checkpoint Swift 1.0 con MTP en BF16: https://huggingface.co/causal/Swift-Qwen3.8-27b-W4A16-AutoRound-MTP-BF16
- Receta de capas de referencia: https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Paper de AutoRound (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Heretic (herramienta de evaluacion de rechazos): https://github.com/p-e-w/heretic
- Contacto de licencia empresarial UkisAI: https://ukisai.com/contact
- Qwen en HuggingFace: https://huggingface.co/Qwen
