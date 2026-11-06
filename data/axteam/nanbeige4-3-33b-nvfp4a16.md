# axteam/Nanbeige4.3-33B-NVFP4A16

## Resumen

Nanbeige4.3-33B-NVFP4A16 es una cuantización de 4 bits del modelo denso Nanbeige/Nanbeige4.3-33B, publicada por el usuario axteam. El checkpoint conserva la arquitectura Llama original (52 capas, solo texto) y aplica cuantización post-entrenamiento del esquema NVFP4A16: pesos en FP4 (E2M1) agrupados de 16 en 16 con escalas FP8, mientras las activaciones permanecen en BF16. El objetivo es servir el modelo en vLLM con una huella de pesos de aproximadamente 22,1 GB, muy inferior a la del original en BF16.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de cuantización W4A16 basada en `compressed-tensors` (`nvfp4-pack-quantized`) que no requiere núcleos tensor FP4: funciona en cualquier GPU NVIDIA Turing (sm75) o superior, lo que la hace desplegable en hardware relativamente antiguo. Por otro lado, cuantifica el coste de fidelidad: el autor reporta un aumento de perplejidad del 5,2 % y una caída de acuerdo top-1 del 99,1 % al 93,4 % respecto al BF16 original.

El modelo base es de tipo conversacional, con plantilla de chat que activa el modo de razonamiento (thinking) por defecto, y licencia Apache 2.0 tanto en el original como en esta derivada. No se dispone de información publicada sobre idiomas soportados, datos de entrenamiento ni benchmarks de capacidad del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama), 52 capas, solo texto |
| Parametros totales | 19.676.626.284 (19,68 mil millones, segun safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion; el ejemplo de servicio usa `--max-model-len 32768` |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1, grupo 16, escala FP8, activaciones BF16; formato `compressed-tensors` `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM y transformers |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento del modelo base Nanbeige4.3-33B. La arquitectura subyacente es un transformer denso de tipo Llama con 52 capas. Solo se cuantizan las proyecciones de atencion y MLP; los embeddings de tokens, la cabeza LM y todas las RMSNorm se mantienen en BF16. El tokenizador y la plantilla de chat son identicos a los del original, y el autor indica que no se necesita `trust_remote_code`.

La calibracion se realizo con 256 muestras. El autor no detalla la composicion del dataset de calibracion ni los datos de entrenamiento del modelo base (numero de tokens, mezcla de idiomas, uso de RLHF o DPO), por lo que esos datos deben considerarse no disponibles. La innovacion tecnica destacable es el uso de FP4 a nivel de pesos con escalas FP8 por grupo de 16, que permite reducir el peso en disco a 22,1 GB sin exigir tensor cores FP4 en la GPU.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat compatible con la API de OpenAI en vLLM.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat; se puede desactivar con `chat_template_kwargs={"enable_thinking": False}`.
- Inferencia offline en Python a traves de `vllm.LLM` y `SamplingParams`, y servicio HTTP con `vllm serve`.
- Compatibilidad declarada con `text-generation-inference` y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades de codigo, matematicas, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el unico ejemplo de la model card esta en coreano y la evaluacion interna mezcla ingles y coreano, pero no se declara una lista de idiomas.

## Casos de uso

- Servicio de chat en produccion con vLLM: el checkpoint se carga con `vllm serve axteam/Nanbeige4.3-33B-NVFP4A16 --max-model-len 32768` y expone una API compatible con OpenAI en el puerto 8000, lo que permite integrarlo en aplicaciones existentes sin cambios de cliente.
- Despliegue en GPUs Turing o Ampere sin tensor cores FP4: al ser cuantizacion weight-only, funciona en sm75 o superior, lo que permite reutilizar hardware como T4, A10 o A100 en lugar de exigir B200.
- Reduccion de coste de memoria en inferencia por lotes: los pesos ocupan 22,1 GB, de modo que con `--tensor-parallel-size N` se puede repartir el modelo entre varias GPU y reservar el resto de VRAM para cache KV.
- Contextos largos con cache KV en FP8: combinando `--kv-cache-dtype fp8` se reduce aproximadamente a la mitad la memoria de cache KV, util para conversaciones de muchos turnos o lotes grandes con la ventana configurada de 32768 tokens.
- Razonamiento con modo thinking para tareas que requieren trazas intermedias: la plantilla activa thinking por defecto, adecuado para pipelines que necesitan explicaciones paso a paso; para respuestas directas se desactiva el flag.
- Evaluacion y prototipado de cuantizacion: el checkpoint sirve como referencia para medir la perdida de fidelidad de NVFP4A16 frente al BF16 original (perplejidad y acuerdo top-1) antes de adoptar FP4 en produccion.
- Integracion en pipelines de generacion de texto con transformers: el autor indica compatibilidad con `transformers>=4.56.0` y `compressed-tensors>=0.15.0`, aunque advierte que no lo ha ejecutado por esa via para este modelo.

## Benchmarks y rendimiento

El autor publica una evaluacion de fidelidad frente al BF16 original sobre un conjunto interno mixto ingles/coreano de 100 prompts. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Este modelo (NVFP4A16) | BF16 original | Diferencia |
|---|---|---|---|
| Perplejidad (menor es mejor) | 1,2865 | 1,2232 | +5,2 % |
| Acuerdo top-1 del siguiente token | 93,4 % | 99,1 % | -5,7 puntos |

## Requisitos de hardware

- Pesos en disco y en VRAM: 22,1 GB; hay que sumar cache KV (crece con longitud de contexto por peticiones concurrentes) y unos pocos GB para activaciones y grafos CUDA.
- GPU soportadas: NVIDIA Turing (sm75) o superior. V100 (sm70) no esta soportado. Solo se ha probado en B200 segun el autor.
- No requiere tensor cores FP4, al ser cuantizacion weight-only.
- Multi-GPU: usar `--tensor-parallel-size N` cuando los pesos no caben en una sola GPU.
- Runtime principal: vLLM, probado con la version 0.32.0, que requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0), `transformers>=5.16.1,<5.20` y `compressed-tensors` 0.17.0 (fijado por vLLM; el checkpoint se guardo con 0.19.0 y no debe actualizarse por separado).
- Via transformers sin vLLM: `transformers>=4.56.0` y `compressed-tensors>=0.15.0`; el autor no lo ha ejecutado para este modelo.
- Reduccion de cache KV: `--kv-cache-dtype fp8` aproximadamente la mitad de memoria de cache.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/Nanbeige4.3-33B-NVFP4A16 | 19,68 mil millones | no disponible (ejemplo con 32768) | NVFP4A16 W4A16, 22,1 GB | Apache 2.0 | Requiere vLLM 0.32.0; fidelidad medida frente a BF16 |
| Nanbeige/Nanbeige4.3-33B (original) | 33 mil millones segun nombre; 19,68 mil millones segun safetensors del derivado | no disponible | BF16 | Apache 2.0 | Referencia de calidad; perplejidad 1,2232 y top-1 99,1 % en el set interno del autor |
| Otros modelos de ~20-33 mil millones en 4 bits | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Perdida de fidelidad medible: +5,2 % de perplejidad y caida del acuerdo top-1 al 93,4 % frente al 99,1 % del BF16, medida solo en 100 prompts internos en ingles y coreano.
- La evaluacion de fidelidad no cubre tareas de razonamiento, codigo ni tool calling, por lo que el impacto real en esos dominios es desconocido.
- Idiomas soportados no declarados; no se puede asumir calidad en castellano sin evaluacion propia.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados.
- Dependencia estricta de versiones: vLLM 0.32.0, `transformers` entre 5.16.1 y 5.20, y `compressed-tensors` 0.17.0; actualizar `compressed-tensors` por separado puede romper la carga del checkpoint.
- Solo se ha probado en B200; el resto de GPUs Turing o superiores se soportan por diseno pero no estan verificadas.
- Requiere driver NVIDIA con soporte de CUDA 13.0 por el build de torch exigido por vLLM 0.32.
- No soporta V100 (sm70).
- El modo thinking esta activo por defecto, lo que incrementa tokens generados y latencia si no se desactiva explicitamente.
- Licencia Apache 2.0 del derivado y del original: permite uso comercial, pero conviene verificar las condiciones del modelo base en su propia model card.

## Enlaces

- Hugging Face del modelo cuantizado: https://huggingface.co/axteam/Nanbeige4.3-33B-NVFP4A16
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales especificos de este checkpoint.
