# ajaxdavis/alpha-nanochat-d24-v2

## Resumen

alpha-nanochat-d24-v2 es un modelo base de tipo GPT entrenado desde cero por ajaxdavis (Thomas Davis) siguiendo la receta del speedrun de nanochat de Andrej Karpathy, en el commit `a825e63`. Se trata del reentrenamiento corregido de un primer intento (ajaxdavis/alpha-nanochat-d24) cuyo trainer presentaba un defecto en la retropropagacion FP8. El modelo tiene 1.384.122.122 parametros y se entreno durante 5.568 pasos sobre 5.838.471.168 tokens del dataset ClimbMix.

La particularidad tecnica del proyecto es que todo el entrenamiento se ejecuto con un trainer compilado por el compilador Alpha directamente a codigo maquina sm_90, sin runtime CUDA, sin NCCL y sin PyTorch en la ruta de entrenamiento. El entrenamiento completo se realizo en 2 GPU H100 SXM en 6 horas y 30 minutos (23.432 segundos), con dos rangos (uno por tarjeta) que produjeron pesos finales identicos.

Es relevante ahora como artefacto de investigacion sobre entrenamiento de bajo nivel y como reproduccion fiel de la receta nanochat, pero conviene subrayar que es un modelo base sin evaluar (sin CORE publicado y sin fine-tune de chat), con licencia MIT y en formato de checkpoint propio de nanochat, no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (receta nanochat d24, commit `a825e63`) |
| Parametros totales | 1.384.122.122 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en el formato de checkpoint de nanochat) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoint de nanochat (`base_checkpoints/d24/model_005568.pt` + `meta_005568.json`); tokenizer en `tokenizer/tokenizer.pkl` y `tokenizer/token_bytes.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura d24 de nanochat, un transformer decoder-only tipo GPT con inicializacion propia de nanochat. El entrenamiento se realizo sobre el dataset ClimbMix (170 shards propios de nanochat), con el tokenizer del primer run verificado por hashes y el mismo loader en cada uno de los dos rangos. Se ejecutaron 5.568 pasos de 2^20 tokens cada uno, lo que da un ratio datos:parametros de 8 y un total de 5.838.471.168 tokens. La optimizacion combino Muon y AdamW, con productos de matriz en FP8.

La innovacion principal es el propio trainer: compilado por Alpha (github.com/thomasdavis/alpha) a codigo maquina sm_90, sin CUDA runtime, NCCL ni PyTorch en la ruta de entrenamiento. La version v2 corrige el defecto del primer run (thomasdavis/alpha#372), en el que el backward FP8 direccionaba tres de los planos de gradiente bfloat16 de cada bloque medio tensor desplazados, mezclando gradientes entre tensores. Tras la correccion, los gradientes del trainer coinciden con el autograd de nanochat en un checkpoint entrenado (coseno 0,98-0,99 en cada matriz de bloque) y los primeros 348 pasos coinciden con el run de nanochat a +0,006 nats por token. La perdida final de entrenamiento fue 2,346 nats por token (media de los ultimos 100 pasos: 2,366), frente a 2,456 del primer run.

## Capacidades

- Generacion de texto autoregresiva como modelo base (pretrained), sin fine-tune de instrucciones ni de chat.
- Modelado de lenguaje general sobre la distribucion de ClimbMix; no se han publicado evaluaciones de capacidades especificas.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta declarado y no se han publicado evaluaciones).
- Sin modo thinking, vision ni audio documentados.
- Integracion con el ecosistema nanochat a traves de `checkpoint_manager.load_model`.

## Casos de uso

- Reproduccion de experimentos de nanochat: el modelo se carga con `checkpoint_manager.load_model` del commit `a825e63` y permite comparar la receta original con el trainer de Alpha sobre los mismos datos e inicializacion.
- Investigacion sobre entrenamiento de bajo nivel: sirve como evidencia empirica de que un trainer compilado a sm_90 sin PyTorch ni NCCL puede igualar los gradientes del autograd de referencia (coseno 0,98-0,99), util para estudiar kernels FP8 y estrategias de compilacion.
- Estudio de divergencia numerica en FP8: los registros del run (`losses-full.f32`, `words-full.bin`, `ranks-retrain.elf`) permiten analizar paso a paso el efecto del bug de backward y su correccion sobre la curva de perdida.
- Base para fine-tune posterior: al ser un checkpoint base de 1.384 millones de parametros con licencia MIT, puede servir como punto de partida para SFT o DPO en tareas concretas, aunque requerira convertir el formato de checkpoint al pipeline de entrenamiento elegido.
- Docencia y divulgacion: ejemplo completo y reproducible de un speedrun de entrenamiento con registro exhaustivo de perdidas por micro-batch (32 micro-batches por paso, 2 rangos, 16 cada uno).
- Validacion de infraestructura multi-GPU: el run demuestra sincronizacion de pesos identicos entre dos rangos en H100 SXM, util como prueba de humo para stacks de entrenamiento propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un modelo base no evaluado (sin CORE y sin fine-tune de chat). Los unicos datos de rendimiento publicados son de entrenamiento:

| Metrica | Este run (v2) | Primer run (con bug) |
|---|---|---|
| Perdida en el paso 1 | 10,398 | 10,398 |
| Perdida en el paso 1.000 | 2,789 | 2,922 |
| Perdida en el paso 3.000 | 2,558 | 2,677 |
| Perdida en el paso 5.568 | 2,346 | 2,456 |
| Media de los ultimos 100 pasos | 2,366 | 2,478 |
| Ventana 1-100 (nats/token) | 5,6069 | 5,6548 |
| Ventana 100-1.000 (nats/token) | 3,0485 | 3,1870 |
| Ventana 1.000-3.000 (nats/token) | 2,6540 | 2,7818 |
| Ventana 3.000-5.000 (nats/token) | 2,4588 | 2,5721 |
| Ventana 5.000-5.568 (nats/token) | 2,3767 | 2,4875 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1.384 millones de parametros, en FP16/BF16 los pesos ocupan aproximadamente 2,8 GB; en FP32 unos 5,5 GB. El repo completo ocupa 4,2 GB.
- GPU recomendadas: el entrenamiento se realizo en 2 H100 SXM. Para inferencia, cualquier GPU con al menos 8-12 GB de VRAM deberia poder alojar los pesos en BF16 o FP16, aunque no hay cifras oficiales de latencia ni throughput.
- Cabe en GPU de consumo: previsiblemente si (RTX 3090, RTX 4090, RTX 4080 y similares con 16 GB o mas), aunque no hay validacion publicada.
- Opciones de despliegue: el autor solo documenta el uso con nanochat a `a825e63` mediante `checkpoint_manager.load_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de checkpoint no es directamente compatible con esos runtimes sin conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| alpha-nanochat-d24-v2 | 1.384.122.122 | no disponible | MIT | Checkpoint nanochat | Base sin evaluar; trainer Alpha sm_90 |
| nanochat d24 (Karpathy) | ~1.384 millones (misma receta) | no disponible | MIT (repo nanochat) | Checkpoint nanochat | Referencia del speedrun; este modelo reproduce su receta |
| alpha-nanochat-d24 (v1) | 1.384.122.122 | no disponible | MIT | Checkpoint nanochat | Version con bug de backward FP8; perdida final 2,456 nats/token |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un modelo base (pretrained): no esta alineado para instrucciones ni chat, por lo que no debe usarse directamente como asistente conversacional.
- No ha sido evaluado: no hay CORE ni resultados de benchmarks publicados, de modo que su calidad real es desconocida.
- Sesgos conocidos: no documentados, pero al entrenarse sobre ClimbMix hereda los sesgos de esa distribucion de datos web.
- Riesgo de alucinacion: alto en uso generativo sin fine-tune ni evaluacion, como corresponde a un modelo base de este tamano y presupuesto de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados en la informacion disponible.
- Formato de pesos propietario de nanochat: requiere el commit `a825e63` y `checkpoint_manager.load_model`; no hay conversion publicada a safetensors ni GGUF.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no incluye garantias ni evaluaciones que respalden su idoneidad en produccion.
- El run se ejecuto con solo dos rangos en dos H100; no hay evidencia publicada de estabilidad en otras configuraciones de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajaxdavis/alpha-nanochat-d24-v2
- Version anterior (con bug): https://huggingface.co/ajaxdavis/alpha-nanochat-d24
- Repositorio nanochat de Andrej Karpathy: https://github.com/karpathy/nanochat
- Compilador Alpha: https://github.com/thomasdavis/alpha
- Issue del defecto FP8 corregido: https://github.com/thomasdavis/alpha/issues/372
