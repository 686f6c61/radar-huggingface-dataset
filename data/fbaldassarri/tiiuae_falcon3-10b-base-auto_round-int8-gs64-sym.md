# fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int8-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int8-gs64-sym`, una cuantizacion de pesos INT8 del modelo base `tiiuae/Falcon3-10B-Base` de Technology Innovation Institute (TII). La cuantizacion la ha realizado el usuario `fbaldassarri` mediante Intel AutoRound v0.16.1, con el algoritmo SignRound y cuantizacion simetrica por grupos de 64. El objetivo es reducir el coste de memoria y acelerar la inferencia de Falcon3-10B en hardware Intel (CPU, iGPU Arc y NPU AI Boost en Core Ultra) a traves de intel-extension-for-pytorch y OpenVINO.

El modelo resultante mantiene la arquitectura transformer causal del Falcon3-10B-Base original, con 3.366.128.640 parametros reales segun safetensors y pesos en formato safetensors compatibles con transformers. Es un modelo base, no instruido: no incorpora plantilla de chat ni alineamiento conversacional, por lo que se usa como completion de texto en bruto.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 10B en INT8 en entornos Intel sin GPU dedicada, algo util para despliegues en portatiles Core Ultra, estaciones de trabajo con Arc y servidores Xeon con AMX. La licencia Apache 2.0 del modelo base se mantiene, aunque el autor declara el artefacto solo para fines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), tipo llama segun `model_type` |
| Parametros totales | 3.366.128.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 weights-only (WoQ), simetrica, group size 64, metodo SignRound (AutoRound) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 13.2 GB) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion del modelo base Falcon3-10B-Base, no un modelo entrenado desde cero. La arquitectura subyacente es un transformer causal de tipo llama (asi declarado en la model card), con pesos originales en bfloat16. La cuantizacion se aplica solo a pesos (weights-only quantization, WoQ): las activaciones permanecen en bfloat16 y los pesos se almacenan en INT8 con escala simetrica por grupo de 64 elementos. El algoritmo utilizado es SignRound, implementado en Intel AutoRound v0.16.1.

El proceso de calibracion se ejecuto en CPU con 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch size 4, partiendo de pesos cargados en `torch.bfloat16`. La duracion registrada fue de 51.593,4 segundos (aproximadamente 860 minutos). Las versiones de referencia son transformers 4.55.3 y torch 2.15.0+cpu. No se dispone de informacion sobre el dataset de preentrenamiento original de Falcon3-10B-Base, el numero de tokens, la composicion del corpus ni si hubo RLHF o DPO; esos datos corresponden a la model card del modelo base y no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva como modelo base (completion), sin plantilla de chat ni instrucciones.
- Razonamiento y conocimiento general heredados de Falcon3-10B-Base, sujetos a la perdida de calidad propia de la cuantizacion INT8.
- Generacion de codigo y matematicas a nivel de modelo base, sin alineamiento instruccional.
- Soporte de tool calling / function calling: no disponible (modelo base, sin entrenamiento de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria prompting manual.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia optimizada en Intel CPU, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost de Core Ultra (OpenVINO), segun la model card.

## Casos de uso

- Inferencia en portatiles Intel Core Ultra: el formato INT8 permite ejecutar un modelo de 10B en equipos sin GPU dedicada, aprovechando la NPU AI Boost via OpenVINO y reduciendo el consumo energetico frente a bfloat16.
- Servidores Xeon con AMX: despliegue en CPU con intel-extension-for-pytorch para cargas de generacion de texto por lotes, donde el throughput agregado importa mas que la latencia por peticion.
- Estaciones de trabajo con iGPU Arc: prototipado de aplicaciones de generacion de texto en hardware Intel integrado, sin necesidad de CUDA ni GPUs NVIDIA.
- Generacion de texto en pipelines offline: tareas de completion, resumen extractivo o expansion de textos donde no se requiere un modelo instruido y se prefiere un modelo base con licencia Apache 2.0.
- Investigacion sobre cuantizacion: el artefacto sirve como referencia reproducible del pipeline AutoRound (version, hiperparametros y condiciones de ejecucion documentadas) para comparar INT8 WoQ frente a bfloat16 en Falcon3.
- Fine-tuning posterior sobre el modelo cuantizado: aunque no es el caso optimo, permite experimentar con adaptadores sobre pesos INT8 en entornos Intel, evaluando la degradacion respecto al modelo original.
- Evaluacion comparativa de calidad: uso como baseline cuantizado para medir la perdida de perplejidad y coherencia frente a `tiiuae/Falcon3-10B-Base` en tareas de lenguaje en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos INT8 ocupan aproximadamente 3,37 GB (3.366.128.640 parametros a 1 byte), mas overhead de activaciones en bfloat16 y cache KV; el repo completo pesa 13,2 GB, lo que sugiere que incluye tambien tensores auxiliares o pesos sin cuantizar.
- GPU recomendadas: no se declaran GPUs dedicadas; el artefacto esta orientado a CPU Intel, iGPU Arc y NPU AI Boost (Core Ultra).
- Cabe en GPU consumer: tecnicamente el peso INT8 es pequeno, pero la model card declara `inference: false` y no valida el artefacto para CUDA; el soporte documentado es Intel via intel-extension-for-pytorch y OpenVINO.
- Opciones de despliegue: transformers (libreria declarada), intel-extension-for-pytorch para CPU/iGPU Arc, OpenVINO para NPU AI Boost; text-generation-inference aparece como tag, pero sin validacion indicada.
- Latencia y throughput: no disponibles en la informacion proporcionada. El tiempo de cuantizacion registrado (51.593 s) no es un dato de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int8-gs64-sym | 3.366.128.640 | no disponible | INT8 WoQ, gs64, simetrica | Apache 2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Base | no disponible en la informacion | no disponible | bfloat16 original | Apache 2.0 | Hugging Face (modelo base) |
| Otras cuantizaciones INT8 de Falcon3-10B-Base | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | no disponible en la informacion |

La comparativa se limita al modelo base original y a este artefacto cuantizado; no se dispone de datos de rendimiento ni de otras cuantizaciones comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones de forma fiable, no tiene plantilla de chat y puede generar contenido inapropiado o incoherente en dialogos.
- Solo ingles declarado: el rendimiento en castellano no esta validado y probablemente sea deficiente.
- Perdida de calidad por cuantizacion: la cuantizacion INT8 WoQ con group size 64 introduce degradacion respecto a bfloat16; no se han publicado mediciones de perplejidad ni benchmarks que la cuantifiquen.
- `inference: false` en la model card: el autor no valida el artefacto para inferencia general; el soporte documentado se limita a hardware Intel con las herramientas indicadas.
- Sin garantia y solo para investigacion: la model card declara explicitamente que el modelo se distribuye sin garantia y desarrollado solo con fines de investigacion, lo que debe tenerse en cuenta antes de un uso comercial, aunque la licencia Apache 2.0 lo permita tecnicamente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin alineamiento instruccional, el modelo no esta calibrado para admitir incertidumbre.
- Artefacto con 0 descargas y 0 likes: no hay validacion comunitaria ni evidencia de uso en produccion.
- Reproducibilidad dependiente de una herramienta externa: la receta de replicacion remite a `git.epicdynamic.com/auto-round-pipeline`, un repositorio no estandar que puede no estar disponible a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Base-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Base
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de cuantizacion referenciado: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
