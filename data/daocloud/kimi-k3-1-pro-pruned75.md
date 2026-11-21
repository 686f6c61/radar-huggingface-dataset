# DaoCloud/Kimi-K3.1-Pro-pruned75

## Resumen

Kimi-K3.1-Pro-pruned75 es un checkpoint derivado del modelo multimodal Kimi-K3.1-Pro de Moonshot AI, publicado por DaoCloud. Se trata de una poda de expertos enrutados (routed experts) de tipo mixture-of-experts (MoE), en la que se elimina el 75 % de los expertos de cada capa MoE y se reindexan el router y los expertos restantes. El resultado conserva 737.611 millones de parametros totales y un repositorio de unos 475,5 GB distribuido en 96 shards de safetensors.

El modelo no es un ajuste fino ni una destilacion: es un prototipo experimental pensado para servir con vLLM y para pruebas de humo de evaluacion. La poda es sin calibracion (calibration-free), basada unicamente en el ranking descendente de la suma con signo de los pesos del router por capa, y el propio autor advierte de una regresion de calidad importante respecto al modelo fuente. No debe confundirse con una poda REAP basada en calibracion, que es una linea de trabajo distinta.

Su relevancia es fundamentalmente practica: demuestra que un MoE de gran escala puede reducirse al 25 % de sus expertos manteniendo la estructura del checkpoint cargable en vLLM con un solo nodo de 8 GPU H200 en TP=8, lo que facilita experimentos de evaluacion y despliegue sin necesidad de recalibrar ni deconvertir los pesos MXFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (MoE); pipeline image-text-to-text con vision, atencion/DSA/indexer y proyecciones latent up-down |
| Parametros totales | 737.611.524.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos de expertos en MXFP4 copiados con su escala y empaquetado intactos; resto de pesos en safetensors (8-bit segun tags); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (Kimi K3.1 Pro License, licencia "other" del modelo base) |
| Formato de pesos | safetensors (96 shards mas indice de pesos) |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro es un transformer MoE multimodal con capacidad de procesamiento image-text-to-text. La arquitectura incluye una MLP densa en la primera capa, expertos compartidos (shared experts), mecanismos de atencion con DSA e indexer, proyecciones latent up-down y torres de vision. El checkpoint pruned75 modifica exclusivamente los expertos enrutados: reduce de 896 a 224 expertos por capa MoE (25 % retenidos, 75 % eliminados), actualiza `num_experts` a 224 y compacta los indices de router y expertos. Los tensores de expertos eliminados y sus filas correspondientes del router se descartan.

La seleccion de expertos se hace por capa, de forma independiente, ordenando de forma descendente la suma con signo de `router.weight[i]`. No se usa calibracion ni datos de evaluacion para decidir que expertos conservar. Los pesos de expertos en MXFP4 se copian sin dequantizar, preservando escala y empaquetado. El resto de componentes (MLP densa de primera capa, expertos compartidos, atencion/DSA/indexer, proyecciones latent, pesos de vision y tokenizer) quedan intactos. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento del modelo base, numero de tokens, ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base Kimi-K3.1-Pro.
- Procesamiento multimodal image-text-to-text (pipeline declarado `image-text-to-text`), con pesos de vision preservados en la poda.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles (los idiomas no se declaran en la model card).
- Modo thinking o decodificacion especulativa: no documentado.
- Servicio compatible con la API OpenAI a traves de vLLM (`/v1/models`, `/v1/completions`).

## Casos de uso

- Pruebas de humo de evaluacion en vLLM: el checkpoint esta disenado para cargarse y servirse con el loader por defecto de vLLM en un nodo de 8 GPU H200 con TP=8, lo que permite validar pipelines de evaluacion antes de invertir en el modelo completo.
- Investigacion sobre poda de MoE: sirve como referencia reproducible de poda sin calibracion (ranking por suma con signo del router) para comparar con metodos calibrados como REAP en llm-compressor.
- Despliegue de referencia en infraestructura de 8 GPU: con un consumo estable de aproximadamente 127.797 MiB por GPU, es util para dimensionar y validar configuraciones de tensor parallelism en clusters H200.
- Evaluacion comparativa de checkpoints podados: permite reproducir el harness de GSM8K (1.319 preguntas, 5-shot, `max_tokens=256`, `temperature=0`, `seed=42`) y contrastar con otros checkpoints pruned75 como mgoin/Kimi-K3-pruned75.
- Experimentos de inferencia multimodal a gran escala: al conservar los pesos de vision y el tokenizer, puede usarse en pruebas de pipelines image-text-to-text sin reentrenar.
- Benchmarking de latencia y throughput en hardware concreto: el autor reporta 541,028 s para el split completo de GSM8K y 2,438 preguntas/s, lo que sirve como linea base de rendimiento en 8x H200.

## Benchmarks y rendimiento

Datos declarados por el autor (model-index y model card), evaluados con servidor local compatible con OpenAI `/v1/completions`, split de test completo de GSM8K, 5-shot, `max_tokens=256`, `temperature=0`, `seed=42`:

| Checkpoint | GSM8K accuracy | Correctas | Invalidas | Latencia | Preguntas/s |
|---|---:|---:|---:|---:|---:|
| Kimi-K3.1-Pro-pruned75 | 35,3298 % | 466/1319 | 0/1319 | 541,028 s | 2,438 |
| mgoin/Kimi-K3-pruned75 (referencia, otro modelo base y hardware) | 34,4200 % | 454/1319 | 0/1319 | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa unos 443 GB en disco (96 shards safetensors); en el servicio validado con TP=8 el consumo estable es de aproximadamente 127.797 MiB por GPU.
- GPU recomendadas: 8x NVIDIA H200 en un solo nodo con TP=8, configuracion validada por el autor.
- GPU consumer: no cabe en GPU de consumo; el tamano del checkpoint y la memoria por GPU lo descartan.
- Opciones de despliegue: vLLM con `--trust-remote-code` y `--tensor-parallel-size 8`; no se documentan otras opciones (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: 541,028 s para 1.319 preguntas de GSM8K y 2,438 preguntas/s en la configuracion 8x H200 TP=8.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaoCloud/Kimi-K3.1-Pro-pruned75 | 737,6 B | no disponible | 35,3298 % | kimi-k3.1-pro | Hugging Face, vLLM |
| mgoin/Kimi-K3-pruned75 | no disponible | no disponible | 34,4200 % | no disponible | Hugging Face |
| moonshotai/Kimi-K3.1-Pro (modelo base) | no disponible | no disponible | no disponible | kimi-k3.1-pro | Hugging Face |

La comparacion con mgoin/Kimi-K3-pruned75 no es estrictamente equivalente: parte de un modelo base distinto (Kimi-K3 frente a Kimi-K3.1-Pro) y se evaluo en hardware diferente, segun indica el propio autor.

## Limitaciones y advertencias

- Regresion de calidad importante: el autor advierte explicitamente de una perdida notable de calidad frente al modelo fuente; es un prototipo experimental, no un checkpoint listo para produccion.
- Poda sin calibracion: la seleccion de expertos se basa solo en el ranking del router, sin datos de calibracion, lo que puede eliminar expertos relevantes para dominios especificos.
- GSM8K bajo: 35,3298 % de accuracy en GSM8K es un indicador de la degradacion respecto al modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable dado el nivel de poda.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto en la model card.
- Licencia: se distribuye bajo la Kimi K3.1 Pro License (licencia "other"); es necesario revisar los terminos del modelo base para uso comercial.
- Requisitos de infraestructura: no cabe en GPU de consumo; requiere nodo multi-GPU de alta gama (8x H200 validado).
- Dependencia de `--trust-remote-code` en vLLM por el codigo personalizado del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/DaoCloud/Kimi-K3.1-Pro-pruned75
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Checkpoint de referencia: https://huggingface.co/mgoin/Kimi-K3-pruned75
- REAP en llm-compressor: https://github.com/vllm-project/llm-compressor/pull/2980/
