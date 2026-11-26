# intragalactic-stranger/Qwen3-4B-Instruct-2507-W4A16-GPTQ

## Resumen

Qwen3-4B-Instruct-2507-W4A16-GPTQ es una cuantizacion de pesos INT4 del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por el usuario intragalactic-stranger dentro del proyecto Cortex Serve (hito M3). No se trata de un modelo nuevo, sino de una version comprimida del modelo instruct de Qwen de 4.022 millones de parametros, orientada a reducir el espacio en disco (2,48 GiB) y acelerar la inferencia en GPUs de gama media como la NVIDIA L4.

La cuantizacion emplea GPTQ con pesos INT4 simetricos, tamano de grupo 128 y orden de activacion estatico, mientras que las activaciones permanecen en bf16. El resultado se distribuye en formato safetensors con metadatos de compressed-tensors y esta pensado para servirse directamente con vLLM.

Su relevancia practica reside en el equilibrio entre coste y calidad: mantiene las capacidades de razonamiento, codigo e instrucciones del modelo base con una degradacion medida de perplexity de en torno al 5,5 % y una mejora de velocidad de 2,7 veces por token en una L4. Es una opcion util para despliegues con presupuesto de VRAM ajustado, aunque conviene tener en cuenta que en H100 con alta concurrencia el rendimiento es inferior al bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), cuantizacion GPTQ weight-only INT4 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 pesos (group size 128, simetrico, actorder estatico); activaciones en bf16 (W4A16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parametros. Esta version no reentrena el modelo: aplica cuantizacion GPTQ de solo pesos (weight-only), con pesos INT4 simetricos agrupados de 128 en 128 y orden de activacion estatico, dejando las activaciones en bf16. La calibracion se realizo con 512 muestras de 2048 tokens del dataset HuggingFaceH4/ultrachat_200k (commit 8049631c), usando llmcompressor 0.15.0 y compressed-tensors 0.20.1 sobre torch 2.14.1 y transformers 5.21.0. El proceso completo se ejecuto en una GPU L4 en 986 segundos.

La innovacion tecnica es la reproducibilidad: cada cifra de calidad y velocidad procede de una configuracion y un manifiesto versionados en el repositorio del proyecto Cortex (commit 9b0cc3fe), lo que permite replicar la evaluacion. El resultado en disco es de 2,48 GiB, frente al peso en bf16 del modelo original.

## Capacidades

- Generacion de texto e instrucciones: hereda el comportamiento instruct del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y matematicas: los resultados en GSM8K 5-shot (73,5 % estricto, 79,6 % con extraccion flexible) indican capacidad de resolucion de problemas aritmeticos de varios pasos.
- Seguimiento de instrucciones: IFEval con 82,4 % en prompt-level strict.
- Conocimiento general y profesional: evaluado con MMLU-Pro (32,2 %) y ARC-Challenge (58,4 %).
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada (no se documenta explicitamente en la model card).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat en GPUs de gama media: con vLLM sobre una L4, el modelo entrega 12,2 ms por token de salida con un usuario y 1.045 tokens/s con 64 usuarios, lo que lo hace adecuado para asistentes conversacionales con presupuesto de hardware limitado.
- Despliegue en entornos con VRAM ajustada: al ocupar 2,48 GiB en disco con pesos INT4, permite alojar el modelo en GPUs consumer o instancias pequenas donde el bf16 no cabria con margen para el KV cache.
- Generacion de codigo y tareas de instruccion: el rendimiento en IFEval y GSM8K sugiere uso en pipelines de asistencia a programadores y automatizacion de tareas estructuradas, siempre validando la salida.
- Evaluacion y prototipado rapido: la reproducibilidad de la configuracion (manifiestos y commits) facilita comparar variantes cuantizadas antes de pasar a produccion.
- Procesamiento por lotes de documentos: el throughput de 1.045 tokens/s en L4 con 64 usuarios concurrentes lo hace viable para tareas de resumen o extraccion a escala moderada.
- Inferencia en H100 con baja concurrencia: con 3,66 ms por token a un solo usuario, encaja en escenarios interactivos de baja carga; para alta concurrencia se recomienda FP8 en su lugar.

## Benchmarks y rendimiento

| Benchmark | Este modelo | bf16 | Delta |
|---|---|---|---|
| ARC-Challenge (acc_norm, 1.172) | 58,4 ±2,8 | 58,3 | +0,1 |
| HellaSwag (acc_norm, primeros 2.000) | 56,9 ±2,2 | 58,5 | -1,6 |
| MMLU-Pro (logprob MC, primeros 1.000) | 32,2 ±2,9 | 34,5 | -2,3 |
| GSM8K 5-shot (estricto) | 73,5 ±2,4 | 72,8 | +0,7 |
| GSM8K 5-shot (extraccion flexible) | 79,6 ±2,2 | 78,8 | +0,8 |
| IFEval (prompt-level strict) | 82,4 ±3,2 | 83,4 | -0,9 |
| WikiText-2 word perplexity (menor es mejor) | 15,048 | 14,266 | +5,5 % |
| Perplexity en regulacion financiera de EE. UU. (menor es mejor) | 6,402 | 5,965 | +7,3 % |

Velocidad (vLLM 0.32.0, carga 512 entrada / 256 salida, concurrencia en bucle cerrado):

| GPU | Metrica | bf16 | Este modelo |
|---|---|---|---|
| NVIDIA L4 | ms por token de salida, 1 usuario | 33,3 | 12,2 |
| NVIDIA L4 | tokens de salida/s, 64 usuarios | 792 | 1.045 |
| NVIDIA H100 80GB | ms por token de salida, 1 usuario | 4,15 | 3,66 |
| NVIDIA H100 80GB | tokens de salida/s, 128 usuarios | 10.079 | 9.619 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2,48 GiB; con KV cache y overhead de vLLM conviene reservar al menos 6-8 GiB para contexto moderado (estimacion, no dato publicado).
- GPU recomendadas: NVIDIA L4 (evaluada y favorable), NVIDIA H100 80GB (evaluada, con menor throughput que bf16 en alta concurrencia).
- GPU consumer: no se han publicado pruebas en tarjetas consumer en la informacion disponible; por tamano de pesos, deberia caber en GPUs con 8 GB o mas, pero no hay datos verificados.
- Opciones de despliegue: vLLM (soporte oficial, comando `vllm serve intragalactic-stranger/Qwen3-4B-Instruct-2507-W4A16-GPTQ`); otros motores no disponibles en la informacion.
- Latencia y throughput: 12,2 ms/token en L4 a un usuario; 1.045 tokens/s en L4 con 64 usuarios; 3,66 ms/token en H100 a un usuario; 9.619 tokens/s en H100 con 128 usuarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-W4A16-GPTQ | 4,02 B | no disponible | safetensors INT4 | Apache-2.0 | Version cuantizada; 2,48 GiB en disco |
| Qwen/Qwen3-4B-Instruct-2507 (bf16) | 4,02 B | no disponible | safetensors bf16 | Apache-2.0 | Referencia de calidad; mayor peso y menor velocidad en L4 |
| Otras cuantizaciones del mismo base (FP8, AWQ) | 4,02 B | no disponible | no disponible | Apache-2.0 | No se aportan datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Degradacion de calidad medible: perplexity en WikiText-2 un 5,5 % superior y en regulacion financiera un 7,3 % superior respecto a bf16; MMLU-Pro cae 2,3 puntos (dentro del intervalo de confianza).
- HellaSwag e IFEval muestran ligeras perdidas (-1,6 y -0,9 puntos), aunque dentro del ruido estadistico en la mayoria de casos.
- Rendimiento inferior a bf16 en H100 con alta concurrencia (9.619 frente a 10.079 tokens/s), porque la descompresion se convierte en cuello de botella; para ese escenario se recomienda FP8.
- Sesgos conocidos del modelo base: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se aportan evaluaciones especificas de factualidad.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingue de esta cuantizacion.
- Longitud de contexto: no disponible en la informacion proporcionada; conviene consultar la model card del modelo base.
- Licencia Apache-2.0, heredada del modelo base, permite uso comercial con las obligaciones habituales de atribucion.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que carece de validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/intragalactic-stranger/Qwen3-4B-Instruct-2507-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Proyecto Cortex Serve: https://github.com/intragalactic-stranger/cortex
- Commit de origen: https://github.com/intragalactic-stranger/cortex/commit/9b0cc3fe97efa0905b0b10d04e7f0745067ccd6f
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
