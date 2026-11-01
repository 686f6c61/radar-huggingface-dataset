# RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-dynamic

## Resumen

GLM-5.3-Flash-speculator.dspark-preview-FP8-dynamic es una variante cuantizada en FP8 de un modelo borrador (drafter) de decodificacion especulativa para el modelo objetivo zai-org/GLM-5.3-Flash. No se trata de un modelo generativo autonomo, sino de un componente auxiliar de 5 capas que propone tokens candidatos que el modelo grande verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida. Lo publica el usuario RelaxingSnorlax sobre el checkpoint base de RedHatAI, aplicando una cuantizacion post-entrenamiento sin datos de calibracion con llm-compressor.

El modelo emplea la tecnica DSpark, un esquema de decodificacion especulativa que combina una cabeza Markov y una cabeza de confianza para modelar la aceptacion de los tokens propuestos. Cuenta con 2.539.312.001 parametros totales (unos 2,54 mil millones) almacenados en safetensors, con un repositorio de 3,9 GB tras la cuantizacion frente a los 5,08 GB del checkpoint bf16 original. La cuantizacion reduce el peso aproximadamente un 23 % manteniendo en bf16 los tensores criticos (embeddings, lm_head, cabeza Markov, cabeza de confianza y normas).

Es relevante ahora porque la decodificacion especulativa se ha consolidado como el mecanismo estandar para reducir la latencia en despliegues de LLM de gran tamano, y esta variante FP8 permite integrar el drafter en infraestructuras que ya sirven el modelo objetivo en precision reducida, con un coste de memoria menor. La licencia MIT y el soporte explicito para vLLM facilitan su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 5 capas con cabezas DSpark (Markov y confianza) para decodificacion especulativa |
| Parametros totales | 2.539.312.001 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el drafter; el ejemplo de servicio del modelo objetivo usa `--max-model-len 16384` |
| Tipos de cuantizacion | FP8_DYNAMIC (pesos e4m3 con escalas por canal de salida y cuantizacion dinamica de activaciones por token); bf16 para tensores protegidos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), libreria `speculators`, `custom_code` |
| Modelo base | RedHatAI/GLM-5.3-Flash-speculator.dspark-preview (relacion: quantized) |
| Modelo objetivo | zai-org/GLM-5.3-Flash |
| Tamano del repositorio | 3,9 GB (3.887.911.426 bytes para `model.safetensors`) |
| Numero de tensores | 100 (frente a 64 en bf16) |
| Descargas / likes | 22 / 0 |
| Fecha de creacion | 2026-10-29 |

## Arquitectura y entrenamiento

El checkpoint es un drafter de 5 capas disenado para la decodificacion especulativa DSpark sobre GLM-5.3-Flash. La innovacion principal reside en dos cabezas auxiliares: una cabeza Markov (`markov_w1` como embedding y `markov_w2` como proyeccion) que modela dependencias entre tokens propuestos consecutivos, y una cabeza de confianza (`confidence_head.proj`) que estima la probabilidad de aceptacion. Ademas incluye una proyeccion de estado oculto auxiliar (`fc`). El metodo se registra en vLLM como `Qwen3DSparkModel`, lo que sugiere una base arquitectonica compatible con la familia Qwen3.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, posibles fases de RLHF o DPO) no se documentan en esta model card; el autor remite a la tarjeta del checkpoint base bf16. La cuantizacion se realizo con llm-compressor mediante PTQ sin datos de calibracion (model-free), aplicando FP8_DYNAMIC a 36 pesos lineales: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en cada una de las 5 capas, mas la proyeccion `fc`. Se mantienen en bf16 los embeddings de tokens, `lm_head`, la cabeza Markov, la cabeza de confianza y todas las normas y sesgos, protegidos mediante una regla de ignorado explicita. El error maximo de ida y vuelta por tensor es 0,0357142857 del amax de ese tensor (`layers.1.mlp.gate_proj.weight`), con un error absoluto maximo agregado de 0,0146484375. Los seis tensores protegidos son identicos bit a bit al checkpoint fuente.

## Capacidades

- Generacion de propuestas especulativas de tokens para acelerar la decodificacion del modelo objetivo GLM-5.3-Flash; no genera texto de forma autonoma.
- Modelado de aceptacion mediante cabeza Markov y cabeza de confianza, orientado a predecir que tokens propuestos seran aceptados por el verificador.
- Integracion nativa con vLLM mediante `speculative-config` con `method: dspark` y `num_speculative_tokens` configurable (el ejemplo usa 8).
- Compatibilidad con cuantizacion FP8 en el pipeline de compressed-tensors, con resolucion de esquemas por canal para `qkv_proj`, `gate_up_proj` y `fc`.
- Soporte de tensor parallelism (el ejemplo de servicio usa `--tensor-parallel-size 8`).
- No se documentan capacidades multilingues, tool calling, vision, audio ni modos de razonamiento, al ser un componente auxiliar y no un modelo de chat.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar el drafter junto a GLM-5.3-Flash en vLLM para reducir la latencia por token generado, aprovechando que la cuantizacion FP8 disminuye la huella de memoria del borrador y permite mantener mas KV cache o mas replicas en la misma GPU.
- Servicio de chat de baja latencia: en aplicaciones interactivas donde el tiempo hasta el primer token y el tiempo por token son criticos, el drafter propone varios tokens por paso de verificacion, mejorando la experiencia percibida sin reentrenar el modelo objetivo.
- Despliegue en infraestructura ya cuantizada: entornos que sirven GLM-5.3-Flash con `--kv-cache-dtype fp8` pueden anadir este drafter FP8 de forma coherente, evitando mezclar precisiones que compliquen la gestion de memoria.
- Generacion de codigo en pipelines CI/CD: al integrarse en un servidor vLLM que atiende peticiones de autocompletado o generacion de parches, la decodificacion especulativa reduce el coste computacional por peticion en cargas de alta concurrencia.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible (con `quantize_speculator_fp8.py` y los ficheros de procedencia) para estudiar el impacto de FP8 en la tasa de aceptacion de un drafter DSpark.
- Evaluacion comparativa de cuantizacion: permite medir la degradacion (o ausencia de ella) en la aceptacion de tokens al pasar de bf16 a FP8_DYNAMIC en un componente auxiliar con tensores protegidos, un caso de estudio util para disenar politicas de cuantizacion mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realizaron mediciones de aceptacion, servicio extremo a extremo ni benchmark para esta variante FP8, y remite a la tarjeta del checkpoint base bf16 para los resultados de aceptacion. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 3,89 GB en FP8; en la practica debe residir junto al modelo objetivo GLM-5.3-Flash, por lo que el requisito dominante es el del modelo grande, no el del drafter.
- GPU recomendadas: el autor valida la carga en H100 (sm90) con vLLM 0.31.0; el ejemplo de servicio usa tensor parallelism de 8, lo que sugiere despliegues multi-GPU para el modelo objetivo.
- Cabe en GPU consumer: el drafter por si solo (unos 3,9 GB) cabria en GPUs consumer con 8 GB o mas, pero el modelo objetivo GLM-5.3-Flash no se documenta aqui y probablemente no quepa en consumer.
- Opciones de despliegue: vLLM con `--speculative-config` y `method: dspark`; la libreria `speculators` permite cargar el checkpoint con `SpeculatorModel.from_pretrained`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se aportan mediciones de aceptacion ni de speedup.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GLM-5.3-Flash-speculator FP8_DYNAMIC) | 2.539.312.001 | no disponible | FP8_DYNAMIC + bf16 mixto | MIT | HuggingFace, libreria `speculators`, vLLM |
| RedHatAI/GLM-5.3-Flash-speculator.dspark-preview (bf16 base) | no disponible (5,08 GB en safetensors) | no disponible | bf16 | no disponible en la informacion | HuggingFace, checkpoint fuente |
| Drafters especulativos de otras familias (por ejemplo, variantes EAGLE o Medusa) | no disponible | no disponible | variable | variable | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada; la unica comparacion cuantitativa documentada es de tamano (5,08 GB bf16 frente a 3,89 GB FP8) y de numero de tensores (64 frente a 100).

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como drafter junto a zai-org/GLM-5.3-Flash; usarlo de forma aislada no produce texto util.
- No se han medido la tasa de aceptacion ni el speedup real de esta variante FP8; el rendimiento en produccion es incierto hasta que se valide extremo a extremo.
- La validacion en vLLM 0.31.0 cubre la resolucion de configuracion y la carga de pesos, pero la concatenacion de `weight_scale` para q/k/v y gate/up en TP=1 se derivo del codigo del loader y no se ejecuto para esta variante; conviene verificar en el entorno objetivo.
- No se documentan sesgos, comportamiento multilingue ni riesgos de alucinacion propios; al heredar el comportamiento del modelo objetivo, cualquier sesgo de este se traslada a las salidas finales.
- La licencia MIT del checkpoint permite uso comercial, pero debe revisarse la licencia y los terminos del modelo objetivo GLM-5.3-Flash y del checkpoint base, que no se detallan aqui.
- La cuantizacion sin datos de calibracion puede introducir desviaciones en la distribucion de propuestas; el error maximo documentado por tensor es de 0,0357142857 del amax, lo que debe vigilarse en escenarios sensibles.
- No se incluye el tensor `verifier_lm_head` en este checkpoint, lo que puede afectar a flujos que esperen esa cabeza.
- El repositorio tiene muy poca traccion (22 descargas, 0 likes) y fue creado y actualizado el mismo dia, por lo que su madurez y mantenimiento son limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-dynamic
- Checkpoint base: https://huggingface.co/RedHatAI/GLM-5.3-Flash-speculator.dspark-preview
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Ficheros de procedencia y verificacion citados en la model card (en el repositorio): `quantization_provenance.json`, `quantize_command.txt`, `quantize_speculator_fp8.py`, `verification.txt`, `vllm_weight_loading_check.json`, `checkpoint_sha256.txt`, `SHA256SUMS`
- vLLM (servidor de inferencia): https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
