# hermitdave/Qwen3.5-9B-MLX-RCO-3.51bpw-mtp4

## Resumen

Qwen3.5-9B-MLX-RCO-3.51bpw-mtp4 es una cuantizacion de precision mixta del modelo Qwen/Qwen3.5-9B, publicada por el usuario hermitdave. El artefacto combina un tronco de texto cuantizado con RCO (metodo de cuantizacion mixta a 3, 4 y 6 bits, con refit LSQ sobre una imatrix propia), una cabeza MTP (multi-token prediction) de 4 bits y una torre de vision en BF16, ambas injertadas desde un artefacto hermano de 4,63 bpw. El resultado es un modelo multimodal imagen-texto de 9B de parametros nominales que ocupa 8,152 GB en disco (7,10 GB de texto y 1,05 GB de injerto).

El modelo resuelve el problema de desplegar un VLM de 9B en hardware Apple Silicon con huella de memoria reducida, manteniendo una fidelidad razonable frente al BF16 original: KL de 0,0655 frente a BF16 en WikiText-103 y una tasa de acuerdo top-1 del 83,32% en 20.480 posiciones. La licencia Apache 2.0 y el formato MLX lo hacen directamente utilizable en entornos locales con `mlx-lm`.

Es relevante ahora porque demuestra dos cosas: que la cuantizacion agresiva a ~3,5 bits por peso es viable en un VLM de esta escala sin colapso de accuracy (media zero-shot de 57,75 frente a 57,85 del artefacto de 4,63 bpw), y que el injerto de cabezas MTP entre artefactos de cuantizacion distinta es fragil: la misma cabeza que acepta borradores al 72,8% sobre este tronco cae al 7,2% sobre un tronco refinado con DWQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision), con cabeza MTP de 1 capa; `model_type` qwen3_5 |
| Parametros totales | 494.042.352 (segun safetensors del repo; el modelo base se denomina 9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la validacion usa contexto 2048) |
| Tipos de cuantizacion | RCO mixed-precision a 3, 4 y 6 bits; cabeza MTP en 4-bit affine gs64; torre de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `mlx-lm`) |

## Arquitectura y entrenamiento

El tronco de texto es un transformer denso cuantizado con el metodo RCO en precision mixta (3/4/6 bits), construido a partir de la imatrix `hermitdave/Qwen3.5-9B-imatrix` con `--lsq-refit` y sin refinamiento DWQ. Sobre ese tronco se injertan dos componentes: una cabeza MTP de 31 tensores en 4-bit affine gs64 y una torre de vision de 333 tensores en BF16, ambos copiados del artefacto `hermitdave/Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4` y verificados por hash. La configuracion fija `mtp_num_hidden_layers = 1` y restaura `vision_config`.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, uso de RLHF/DPO). La innovacion tecnica del artefacto es doble: la cuantizacion mixta con refit LSQ, y la demostracion de que la decodificacion especulativa via MTP puede activarse mecanicamente (aceptacion del 72,8% en d1 y 68,1% en d3) sin producir ganancia de throughput en este modelo denso de 9B, que baja de 20,69 tok/s a 14,72 tok/s con d1 y 9,22 tok/s con d3.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), con torre de vision restaurada en BF16. El autor advierte que las entradas de imagen no se evaluaron en este artefacto.
- Decodificacion especulativa mediante cabeza MTP de una capa (funcional, aunque sin ganancia de velocidad medida).
- Capacidades de codigo, matematicas y tool calling: no verificadas en la informacion proporcionada; deben asumirse las del modelo base.
- Capacidades multilingues: no disponibles.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y los 8,152 GB en disco permiten cargar el modelo en Macs con memoria unificada de 16 GB o superior, usando `mlx-lm` como runtime.
- Prototipado de pipelines imagen-texto: la torre de vision permite experimentar con tareas de descripcion de imagenes y VQA en local, con la cautela de que el autor no valido las entradas de imagen.
- Evaluacion de tecnicas de cuantizacion: el repo incluye ficheros de validacion (KL, perplejidad, acuerdo top-1 y control DWQ) que sirven como referencia reproducible para comparar metodos de compresion.
- Investigacion sobre decodificacion especulativa: los datos de aceptacion MTP y TPS permiten estudiar por que una alta tasa de aceptacion no implica mejora de latencia en modelos densos.
- Despliegue de bajo coste en entornos con restricciones de memoria: la precision mixta reduce la huella frente al BF16 manteniendo una media zero-shot de 57,75 en cinco tareas.
- Base para experimentos de injerto de componentes: el procedimiento de trasplante de cabeza MTP y torre de vision entre artefactos de cuantizacion distinta esta documentado y es replicable.

## Benchmarks y rendimiento

Fidelidad frente al modelo de referencia (WikiText-103, seq 513, temperatura 0; menor KL es mejor):

| Referencia | Validacion 64 muestras | Holdout disjunto 16 muestras |
|---|---:|---:|
| KL vs BF16 | 0,065482 | 0,067125 |
| KL vs profesor 8-bit | 0,060350 | 0,066933 |

Perplejidad en WikiText-2 (corpus fijado, 199.902 tokens, contexto 2048): BF16 9,0039; esta cuantizacion 8,8773. Acuerdo top-1 frente a BF16 en 20.480 posiciones: 83,32% global (98,57% en casos decisivos, 87,66% en gap medio, 54,98% en casi empate).

Accuracy zero-shot (cinco tareas, 400 ejemplos cada una, temperatura 0):

| ARC-Ch | ARC-Easy | HellaSwag | WinoGrande | MMLU | Media |
|---:|---:|---:|---:|---:|---:|
| 53,75 | 81,25 | 50,00 | 55,75 | 48,00 | 57,75 |

Throughput medido (oMLX, MTP activado y desactivado):

| Prompt | Aceptacion d1 / d3 | TPS off | TPS d1 | TPS d3 |
|---|---:|---:|---:|---:|
| Corto | 72,8% / 68,1% | 20,69 | 14,72 | 9,22 |
| ~1,5k tokens | 72,8% / 67,4% | 19,86 | 13,62 | 9,01 |

## Requisitos de hardware

- VRAM/memoria estimada: 8,152 GB en disco; en memoria unificada se requiere espacio adicional para el contexto y los estados de activacion.
- GPU recomendadas: el formato MLX esta orientado a Apple Silicon (series M1 a M4); no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 16 GB o mas; no aplica a GPUs NVIDIA de consumo sin conversion previa de formato.
- Opciones de despliegue: `mlx-lm` y oMLX (el autor menciona `model_type_override: "vlm"` para servir con vision y recomienda `mtp_enabled: false` salvo ganancia medida).
- Latencia y throughput: 20,69 tok/s en prompt corto y 19,86 tok/s en prompt de ~1,5k tokens con MTP desactivado; una recheck limpia midio 21,54 tok/s. Con MTP activado el rendimiento baja.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media zero-shot | Licencia | Formato |
|---|---|---|---|---|---|
| Este artefacto (RCO 3,51 bpw) | 494.042.352 (nominal 9B) | no disponible | 57,75 | Apache 2.0 | safetensors MLX |
| hermitdave/Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4 | no disponible | no disponible | 57,85 | no disponible | safetensors MLX |
| Qwen/Qwen3.5-9B (BF16) | no disponible | no disponible | no disponible | Apache 2.0 | safetensors |

La comparacion con el artefacto de 4,63 bpw muestra una diferencia de 0,1 puntos porcentuales en la media zero-shot, que el autor califica de empate. No se dispone de datos de benchmarks de terceros (MMLU completo, HumanEval, GSM8K) ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Compresion con perdida: no es un fine-tune y degrada la fidelidad frente al BF16 (KL de 0,0655).
- La cabeza MTP no aporta ganancia de throughput en este modelo; el autor recomienda dejarla desactivada salvo medicion propia.
- Las entradas de imagen no fueron evaluadas en este artefacto.
- El injerto MTP es sensible al tronco: sobre un tronco refinado con DWQ la aceptacion cae al 7,2%/7,1% en prompt corto y al 4,5%/2,0% en prompt largo.
- El repositorio fue renombrado desde un ID anterior etiquetado como DWQ; los pesos no contienen refinamiento DWQ.
- La perplejidad absoluta en WikiText-2 es optimista; el autor recomienda comparar solo dentro de la misma familia.
- La accuracy zero-shot esta saturada a esta escala, lo que limita su poder discriminativo entre cuantizaciones.
- Sesgos conocidos, riesgo de alucinacion e idiomas soportados: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-9B para el uso derivado.
- Compatibilidad limitada al ecosistema MLX; no hay pesos GGUF ni safetensors genericos para vLLM o TGI en este repo.

## Enlaces

- Hugging Face: https://huggingface.co/hermitdave/Qwen3.5-9B-MLX-RCO-3.51bpw-mtp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Imatrix: https://huggingface.co/hermitdave/Qwen3.5-9B-imatrix
- Donante de MTP y vision: https://huggingface.co/hermitdave/Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4
