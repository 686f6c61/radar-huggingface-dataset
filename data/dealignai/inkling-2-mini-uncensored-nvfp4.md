# dealignai/Inkling-2-Mini-UNCENSORED-NVFP4

## Resumen

Inkling-2-Mini-UNCENSORED-NVFP4 es una derivacion del modelo multimodal Inkling-2-Mini de Thinking Machines Lab, publicada por dealignai, en la que se ha eliminado el comportamiento de rechazo (refusal) manteniendo la cuantizacion mixta nativa del modelo original. Se distribuye como un unico shard de safetensors de 20,1 GB que combina NVFP4 en las capas 0-19, MXFP8 en las capas 20-23 y bfloat16 en atencion, embeddings, normas, `lm_head`, torre de vision y cabezas MTP.

El modelo base emplea una arquitectura MoE con bucles (`inkling2_loop`), en la que las capas 6-17 se ejecutan tres veces, e incorpora niveles de esfuerzo de razonamiento configurables (de `none` a `max`), torre de vision de 23 capas y un drafter MTP nativo pensado para decodificacion especulativa DSpark. Cuenta con 30.465.509.928 parametros totales segun los safetensors del repositorio.

Su relevancia actual es doble: por un lado, demuestra que es posible aplicar tecnicas de abliteration sobre un modelo ya cuantizado sin destruir la estructura de cuantizacion del proveedor; por otro, expone las limitaciones del ecosistema, ya que el runtime solo esta disponible en Apple Silicon via MLX y aun no existe un port mergeado en sglang o vLLM. La licencia es propia (`dealignai-community-v0.3`), no estandar, y el modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con bucles (`inkling2_loop`), transformer multimodal con torre de vision ViT de 23 capas y proyector de 2 capas; drafter MTP nativo |
| Parametros totales | 30.465.509.928 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta nativa: NVFP4 (ModelOpt W4A4, grupo 16, `global_scale` por experto) en `mlp.experts.w2`/`w13` de L0-19; MXFP8 (E4M3 con escalas ue8m0 cada 32) en `mlp.experts.*` de L20-23; bfloat16 en atencion, embeddings, normas, `lm_head`, `vision_tower` y `mtp.*`; routers, proyecciones sink, message gates, clip scales, queries de atencion residual y taps de convolucion corta en fp32/bf16 original |
| Idiomas soportados | en |
| Licencia | dealignai-community-v0.3 (licencia propia, categoria `other`) |
| Formato de pesos | safetensors (un unico shard), mas `mtp.safetensors`, torre de vision y tokenizer; incluye `hf_quant_config.json` y `config.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una innovacion estructural concreta: las capas 6 a 17 se recorren tres veces (loop), lo que incrementa la profundidad efectiva de computo sin aumentar el numero de parametros. La cuantizacion es mixta y nativa del proveedor: los expertos de las capas 0-19 usan NVFP4 con escalas globales por experto, los de las capas 20-23 usan MXFP8 con escalas ue8m0 por bloque de 32, y los componentes sensibles a precision (atencion, embeddings, normas, `lm_head`, vision tower, MTP) se mantienen en bfloat16. Los routers y proyecciones auxiliares conservan su precision original fp32/bf16.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en el modelo base. Respecto a esta derivacion, la model card indica que se ha modificado el comportamiento de cumplimiento (compliance) respecto a la alineacion upstream mediante cirugia sobre el residual stream, preservando byte a byte la torre de vision, el drafter MTP, la plantilla de chat, el tokenizer, los tokens especiales y los ficheros de configuracion de cuantizacion. El modelo incorpora un drafter MTP nativo de 3 capas con bloque 8 y cabeza Markov `rnn_hidden`, reservado para decodificacion especulativa DSpark en el futuro port del runtime Inkling-2.

## Capacidades

- Generacion de texto y razonamiento con niveles de esfuerzo configurables de `none` a `max`; en modo `max` el modelo genera un bloque de pensamiento antes de la respuesta.
- Comprension multimodal de imagenes: la torre de vision (ViT de 23 capas mas proyector de 2 capas) se conserva intacta y el pipeline es `image-text-to-text` mediante `Inkling2LoopForConditionalGeneration`.
- Razonamiento matematico y logica formal, con mejoras notables en modo `max` segun los datos de la model card (por ejemplo, +44,4 pp en `formal_logic` y +33,3 pp en `college_mathematics` frente al base en modo `none`).
- Uso de herramientas (tool use), segun la model card, que afirma que las capacidades de tool use se preservan.
- Razonamiento multi-paso y cadenas deductivas largas, favorecido por la eliminacion de desvios de rechazo.
- Decodificacion especulativa mediante el drafter MTP nativo (DSpark), pendiente de integracion en el runtime.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Investigacion sobre alineacion y refusal: el modelo permite estudiar como la cirugia sobre el residual stream afecta al cumplimiento de instrucciones y al rendimiento en tareas de razonamiento, comparando directamente con el base en los mismos benchmarks (MMLU-500 por materia).
- Evaluacion de robustez de cuantizaciones mixtas: al preservar la cuantizacion nativa NVFP4/MXFP8, sirve para medir el impacto de tecnicas de edicion de pesos sobre modelos ya cuantizados sin requerir un reajuste completo.
- Procesamiento de documentos con imagenes en local: la torre de vision intacta permite extraer y razonar sobre contenido visual en entornos Apple Silicon, sin depender de APIs externas.
- Razonamiento matematico y cientifico asistido: el modo `max` mejora de forma medible en `college_chemistry`, `college_physics` y `college_mathematics` (+33,3 pp cada uno respecto al base en modo `none`), lo que lo hace util para tutorizacion tecnica o verificacion de derivaciones.
- Desarrollo y pruebas de runtimes alternativos: al ser uno de los pocos bundles con arquitectura `inkling2_loop` disponible, sirve como banco de pruebas para ports de MLX a otros backends (sglang, vLLM) y para validar la integracion de DSpark.
- Experimentacion con agentes y tool calling en flujos de investigacion: la preservacion de tool use y del razonamiento multi-paso permite construir prototipos de agentes en ingles sobre hardware de sobremesa.
- Analisis de contenido sin restricciones de refusal en entornos controlados de investigacion (red teaming, estudios de seguridad).

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a MMLU-500 (subconjunto estratificado) medido sobre este bundle exacto, servido con `jang_tools.inkling2.load.load_inkling2(native_experts=True)` en Apple Silicon MLX 0.32.4 con `MLX_ENABLE_TF32=0`, decodificacion greedy y `repetition_penalty=1.0`.

| Metrica | Base | Este release | Delta |
|---|---:|---:|---:|
| MMLU-500 @ effort=none (logit) | 79,20 % | 77,00 % | -2,20 pp |
| MMLU-500 @ effort=max (generacion) | ~80 % | 80,40 % | aproximadamente igual al base |

Resultados por materia mas destacados (base@none frente a este bundle@max): `formal_logic` 44,4 % → 88,9 % (+44,4 pp), `college_chemistry` 44,4 % → 77,8 % (+33,3 pp), `college_mathematics` 44,4 % → 77,8 % (+33,3 pp), `college_physics` 55,6 % → 88,9 % (+33,3 pp), `abstract_algebra` 55,6 % → 77,8 % (+22,2 pp), `high_school_computer_science` 77,8 % → 100,0 % (+22,2 pp). Se observan regresiones puntuales en modo `none`, como `conceptual_physics` (-22,2 pp) y `computer_security` (-22,2 pp en modo `max`). No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle completo ocupa 20,1 GB en disco; en el runtime MLX de Apple Silicon la memoria unificada necesaria sera del orden de esa cifra mas el overhead de activaciones y cache KV, no cuantificado en la model card.
- GPU recomendadas: la model card cita explicitamente que es capaz de ejecutarse en 1x NVIDIA DGX Spark segun la guia upstream, lo que sugiere viabilidad en GPUs con alrededor de 128 GB de memoria unificada. No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en consumer GPU: no confirmado. El unico runtime funcional documentado es Apple Silicon via MLX (`jang_tools.inkling2`), por lo que la viabilidad en GPUs de consumo depende de un port futuro.
- Opciones de despliegue: MLX en Apple Silicon es la unica ruta soportada actualmente. La arquitectura `inkling2_loop` no tiene runtime mergeado en sglang ni en vLLM. El tag `endpoints_compatible` figura en los metadatos, pero la model card no documenta un endpoint funcional.
- Latencia y throughput: no disponibles. La decodificacion especulativa DSpark (drafter MTP) esta prevista para el futuro port del runtime y no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparacion mas directa es con el modelo base del que deriva:

| Modelo | Parametros | Contexto | MMLU-500 @none | MMLU-500 @max | Licencia | Runtime |
|---|---|---|---|---|---|---|
| thinkingmachines/Inkling-2-Mini | no disponible (mismo base, 30,5 B en esta cuantizacion) | no disponible | 79,20 % | ~80 % | licencia del proveedor | MLX |
| dealignai/Inkling-2-Mini-UNCENSORED-NVFP4 | 30.465.509.928 | no disponible | 77,00 % | 80,40 % | dealignai-community-v0.3 | MLX (Apple Silicon) |

No se identifican en la informacion disponible otros modelos de la misma categoria (MoE con bucles, multimodal, cuantizacion mixta NVFP4/MXFP8) con los que establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La licencia `dealignai-community-v0.3` es una licencia propia no estandar; es imprescindible revisar el fichero `LICENSE` antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- El modelo ha sido sometido a abliteration para eliminar el comportamiento de rechazo; esto implica que puede generar contenido danino, y su uso en produccion exige filtros y politicas de moderacion externas.
- Solo declara soporte de ingles; no hay evidencia de capacidades multilingues.
- El unico runtime funcional es MLX en Apple Silicon; no hay soporte en sglang, vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en infraestructura GPU convencional.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de factualidad especificas para este bundle.
- Se observan regresiones por materia en modo `none` (hasta -22,2 pp en `conceptual_physics` y `computer_security`), atribuidas por el autor al coste tipico de la cirugia sobre el residual stream.
- Los benchmarks publicados se limitan a MMLU-500 con 9 preguntas por materia, un tamano muestral muy reducido que produce alta varianza (cada pregunta vale 11,1 pp); deben interpretarse con cautela.
- El drafter MTP y la decodificacion especulativa DSpark no estan operativos en el runtime actual.
- dealignai no esta afiliado a Thinking Machines Lab; se trata de una derivacion no oficial del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/Inkling-2-Mini-UNCENSORED-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Perfil del autor en X: https://x.com/dealignai
