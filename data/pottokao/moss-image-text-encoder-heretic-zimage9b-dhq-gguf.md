# pottokao/MOSS-Image-Text-Encoder-Heretic-ZImage9B-DHQ-GGUF

## Resumen

MOSS-Image Text Encoder Heretic — Z-Image 9B entrance — DHQ GGUF es una cuantizacion GGUF del modelo pottokao/MOSS-Image-Text-Encoder-Heretic, un encoder de texto derivado de Qwen3.5-9B con la censura eliminada (decensored) y con 9.197.093.888 parametros. El autor, pottokao, lo publica como un unico archivo pensado para dos funciones simultaneas: codificar el prompt que consume el DiT de Z-Image Turbo a traves de una entrada de texto de 9B, y generar o reescribir prompts como modelo conversacional (prompt enhancer). Se conserva la cabeza MTP del modelo original.

La particularidad tecnica es que Z-Image oficial lee un encoder de 4B con dimension 2560, mientras que este archivo apunta a una variante de Z-Image Turbo cuyo `cap_embedder` se ha sustituido por una entrada de 9B: RMSNorm(4096, weight 1) seguida de una Linear 4096→3840 ajustada en forma cerrada a la entrada original de 4B. Por tanto, no es compatible con el Z-Image estandar. La cuantizacion DHQ elige el formato de cada tensor midiendo el dano en dos metricas: el error en la entrada de 9B de Z-Image y la KL de escritura de prompts.

El resultado ocupa 7,17 GB, por debajo de un Q6_K estandar (~7,25 GB), con ningun tensor por debajo de Q5. Frente a Q8_0 (9,79 GB) presenta un error de entrada del 2,19% en mediana y 2,56% en maximo sobre 36 prompts de retrato reservados, y una KL de escritura de prompts de 0,0024 sobre 80 prompts. Esta pensado para el nodo ComfyUI Dual-Head Dragon del propio autor, que aun esta en pruebas, y requiere tener en cuenta que ComfyUI-GGUF todavia no carga archivos GGUF de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-9B) con cabeza MTP; usado como text encoder dual-head (entrada DiT + prompt enhancer) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF DHQ mixta: Q5_K (60 tensores), Q6_K (128 tensores), Q8_0 (60 tensores); ningun tensor por debajo de Q5 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal de 7,17 GB); mmproj F16 opcional de 0,92 GB para vision |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder denso de 9.197 millones de parametros, al que se ha aplicado un proceso de decensoring (marcado como "heretic") y se le ha conservado la cabeza MTP (multi-token prediction). El uso previsto es doble: por un lado actua como encoder de texto para el DiT de Z-Image Turbo, emitiendo representaciones que el DiT consume en su entrada; por otro, funciona como LLM conversacional para escribir y mejorar prompts.

La innovacion principal de esta publicacion no esta en el entrenamiento sino en la cuantizacion DHQ. En lugar de aplicar una receta uniforme, el autor selecciona el formato de cada tensor midiendo el dano en dos "reglas": el error relativo L2 en la salida de la entrada de 9B de Z-Image (peso 1, lo que lee el DiT) y la divergencia KL de la escritura de prompts respecto a Q8_0 (peso 0,5). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Codificacion de prompts para el DiT de Z-Image Turbo a traves de una entrada de texto de 9B (RMSNorm 4096 → Linear 4096→3840).
- Generacion y reescritura de prompts (prompt enhancer) en modo conversacional, conservando la cabeza MTP.
- Generacion de texto y conversacion multi-turno como LLM de 9B (heredado de Qwen3.5).
- Capacidad de vision opcional mediante el archivo `mmproj-moss-te-f16.gguf`.
- Integracion con el nodo ComfyUI Dual-Head Dragon para el flujo dual-head (encoder + enhancer en un mismo archivo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes con Z-Image Turbo de entrada 9B: el archivo codifica el prompt para el DiT en una sola pasada, sustituyendo al encoder de 4B en configuraciones cuyo `cap_embedder` se ha reemplazado por la entrada de 9B.
- Prompt engineering automatizado en ComfyUI: el mismo archivo reescribe prompts de usuario en descripciones mas detalladas antes de enviarlas al DiT, con una KL de 0,0024 frente a Q8_0, lo que mantiene la fidelidad del texto generado.
- Flujos dual-head en el nodo Dual-Head Dragon: un unico GGUF sirve tanto de encoder como de enhancer, simplificando la gestion de modelos y reduciendo el uso de VRAM frente a cargar dos modelos separados.
- Prototipado de pipelines text-to-image en local: con 7,17 GB el archivo cabe en GPUs de consumo con 8-12 GB de VRAM en cuantizacion DHQ, lo que permite iterar sin infraestructura dedicada.
- Investigacion sobre cuantizacion selectiva: el enfoque DHQ y sus metricas (error de entrada y KL de prompts) sirven como referencia para estudiar el impacto de la cuantizacion en encoders de texto para difusion.
- Analisis de imagen con el mmproj opcional: el archivo de vision F16 (0,92 GB) permite tareas multimodales ligeras junto al modelo principal en el mismo entorno ComfyUI.
- Evaluacion de modelos decensored: util para investigadores que estudian el efecto del decensoring en la calidad de codificacion y en la generacion de prompts.

## Benchmarks y rendimiento

| Metrica | Este archivo (DHQ 7,17 GB) | Q8_0 (9,79 GB) | Q4_K_M estandar (5,78 GB) |
|---|---|---|---|
| Error de entrada Z-Image vs Q8_0 (36 prompts de retrato, mediana) | 2,19% | referencia | no disponible |
| Error de entrada Z-Image vs Q8_0 (36 prompts de retrato, maximo) | 2,56% | referencia | no disponible |
| KL de escritura de prompts vs Q8_0 (80 prompts) | 0,0024 | referencia | 0,0136 |
| Tamano | 7,17 GB | 9,79 GB | 5,78 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores son medidas internas del autor con el motor real de llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,5-8,5 GB para el archivo principal en DHQ, mas overhead de contexto; unos 1 GB adicionales si se carga el mmproj de vision.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) para el modelo completo con margen; A100 y H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en cuantizacion DHQ; en 8 GB ajustado, conviene reducir el contexto.
- Opciones de despliegue: llama.cpp (motor con el que se midieron las metricas), nodo ComfyUI Dual-Head Dragon; ComfyUI-GGUF no carga todavia archivos GGUF de Qwen3.5; vLLM, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (DHQ GGUF) | 9,197 M | no disponible | GGUF 7,17 GB | Apache 2.0 | Encoder dual-head para Z-Image 9B + prompt enhancer |
| MOSS-Image-Text-Encoder-Heretic (base) | 9,197 M | no disponible | safetensors | Apache 2.0 | Modelo sin cuantizar del que deriva este archivo |
| Q8_0 del mismo modelo | 9,197 M | no disponible | GGUF 9,79 GB | Apache 2.0 | Referencia de calidad usada por el autor |
| Q4_K_M estandar del mismo modelo | 9,197 M | no disponible | GGUF 5,78 GB | Apache 2.0 | Peor KL de prompts (0,0136) que DHQ |

No se dispone de informacion sobre modelos comparables de otros autores en la misma categoria (encoders de texto de 9B para difusion) en la documentacion proporcionada.

## Limitaciones y advertencias

- No es compatible con el Z-Image estandar: requiere una variante de Z-Image Turbo con el `cap_embedder` sustituido por la entrada de 9B (RMSNorm 4096 → Linear 4096→3840).
- ComfyUI-GGUF no carga actualmente archivos GGUF de Qwen3.5; el nodo Dual-Head Dragon del autor sigue en fase de pruebas.
- El decensoring ("heretic") puede introducir sesgos o contenido no filtrado; no se detalla el proceso ni sus efectos.
- Riesgo de alucinacion inherente a un LLM de 9B, especialmente en la generacion de prompts y en uso conversacional.
- No hay informacion sobre idiomas soportados, longitud de contexto ni datos de entrenamiento, lo que limita la evaluacion de su comportamiento fuera del caso de uso previsto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el proceso de decensoring deben revisarse para cumplir con las politicas de despliegue.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; no hay validacion externa de las metricas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/pottokao/MOSS-Image-Text-Encoder-Heretic-ZImage9B-DHQ-GGUF
- Modelo base: https://huggingface.co/pottokao/MOSS-Image-Text-Encoder-Heretic
- Nodo ComfyUI Dual-Head Dragon: https://github.com/pottokao-dotcom/ComfyUI-DualHead-Dragon
