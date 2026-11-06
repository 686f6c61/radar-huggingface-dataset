# pgmharikrishnan/Ripple-65B-Preview-amd-serve-hybrid-GGUF

## Resumen

Ripple-65B-Preview-amd-serve-hybrid-GGUF es una cuantizacion GGUF no uniforme del modelo base ricursiveAI/Ripple-65B-Preview, publicada por el usuario pgmharikrishnan bajo licencia Apache 2.0. No se trata de un modelo nuevo, sino de un empaquetado de pesos optimizado para inferencia en una GPU AMD Radeon AI PRO R9700 de 32 GB mediante el backend Vulkan de llama.cpp. El paquete ocupa 25,90 GiB con una media de 3,43 bits por peso, frente a los 24,25 GiB y 3,22 BPW de una cuantizacion plana IQ3_XXS del mismo modelo.

La aportacion tecnica principal es la asignacion diferenciada de tipos de cuantizacion por tensor: las matrices `ffn_gate` y `ffn_up`, que concentran aproximadamente el 79 % de los parametros, se mantienen en `iq3_xxs`, mientras que tensores mas sensibles o criticos para el ancho de banda (`ffn_down`, `attn_k`, `attn_v`, `token_embd`, `output`) suben a `iq4_xs`, `q4_K`, `q5_K` y `q6_K`. El objetivo es gastar el presupuesto de bits donde impacta en la calidad de salida y ahorrarlo donde el coste es menor.

La relevancia de esta ficha es doble: por un lado, documenta una receta concreta de cuantizacion hibrida para modelos de 65B en GPUs de consumo profesional con 32 GB de VRAM; por otro, advierte de una restriccion critica: la arquitectura `ricursive` no esta incluida en las versiones publicadas de llama.cpp, LM Studio ni Ollama, por lo que el archivo solo carga con una compilacion del pull request abierto que anade dicha arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ricursive (no disponible en detalle; requiere PR abierto de llama.cpp) |
| Parametros totales | 65B (nominal, segun el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 12K servidos en la medicion del autor; recomendado servir a 10-12K |
| Tipos de cuantizacion | Hibrida no uniforme: `iq3_xxs` (ffn_gate, ffn_up), `iq4_xs` (ffn_down), `q4_K`/`q5_K` (attn_k, attn_v), `q5_K` (token_embd), `q6_K` (output), mezcla IQ3 base (attn_q, attn_gate, attn_output) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo de 25,90 GiB, 3,43 BPW) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ricursiveAI/Ripple-65B-Preview mas alla de que llama.cpp la identifica con el nombre `ricursive` y de que no esta soportada en las versiones estables del runner. Tampoco se documentan en la informacion proporcionada los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si se detalla es el proceso de cuantizacion. Los pesos de origen son el GGUF `Q8_0` del publicador (dos shards, 68,8 GB), recuantizados con `--allow-requantize`; la release BF16 (129 GB) no cabia en el disco de compilacion. La matriz de importancia se calculo con `llama-imatrix --parse-special` sobre 300 fragmentos de la build de calibracion publica del publicador (`AtomicChat/calib-corpora`, `builds/ripple-65b/calib_train.txt`, objetivo de 5 millones de tokens). El flag `--parse-special` es relevante porque, sin el, el marcado de chat se tokeniza como puntuacion y los segmentos de agentes y tool calling se calibran sobre texto que el modelo nunca ve. La matriz de importancia se calculo sobre la precision del preview de 3 bits, no sobre Q8, porque un 65B en Q8 no cabe en VRAM junto con nada mas en una tarjeta de 32 GB; el autor lo declara explicitamente como una matriz mas debil que una calculada sobre BF16. El conversor utilizado es el pull request abierto de llama.cpp que anade la arquitectura `ricursive`, fijado a un commit concreto.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un 65B orientado a tareas generales; la cuantizacion preserva la funcionalidad de generacion, aunque la calidad exacta de esta variante no se ha medido en benchmarks retenidos.
- Codigo: la cuantizacion plana equivalente obtuvo 6/6 en un conjunto de codigo en la misma tarjeta; esta variante hibrida no se ha puntuado.
- Matematicas: la cuantizacion plana equivalente obtuvo 100 % en GSM8K-50; esta variante no se ha puntuado.
- Tool calling y agentes: la calibracion incluye segmentos especificos de agentes y tool calling gracias al uso de `--parse-special`, lo que sugiere que el modelo base esta entrenado o ajustado para esos flujos.
- Multilingue: no disponible; la model card no declara idiomas.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Inferencia en GPU AMD via Vulkan: soportada por el backend de llama.cpp, con las limitaciones descritas (sin Flash Attention para esta arquitectura).

## Casos de uso

- Despliegue local en GPU AMD de 32 GB: el paquete esta dimensionado para una Radeon AI PRO R9700 con Vulkan y 12K de contexto, con 29,3 GB de VRAM residente y solo 0,3 GB de spill a memoria compartida. Es adecuado para entornos donde no se dispone de CUDA ni de GPUs de 80 GB.
- Reproduccion y comparacion de recetas de cuantizacion: el autor publica el paquete para reproducir la receta hibrida y comparar su delta de calidad frente a la cuantizacion plana IQ3_XXS, que aun no se ha medido.
- Evaluacion de arquitecturas nuevas en llama.cpp: util para equipos que quieran probar la arquitectura `ricursive` antes de que se fusione el pull request, aceptando la necesidad de compilar desde ese PR.
- Servicio de chat con contexto medio: con 10-12K de contexto servido y 16 tokens/s de decodificacion, encaja en asistentes conversacionales internos o prototipos donde la latencia no sea critica.
- Procesamiento por lotes de prompts largos: con 355 tokens/s de prefill para un prompt de 7,4K, es viable para tareas de resumen o extraccion sobre documentos de varios miles de tokens, siempre que el throughput agregado no sea el cuello de botella.
- Flujos con tool calling y agentes: la calibracion incluye slices de agentes y tool calling, por lo que el modelo base parece preparado para pipelines de agentes de varios pasos, aunque la calidad de esta variante concreta no esta medida.
- Laboratorio de investigacion en cuantizacion: permite estudiar el impacto de asignar bits por tensor en modelos de 65B con presupuesto de VRAM fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de esta variante hibrida en la informacion disponible. El autor indica explicitamente que el paquete no se ha puntuado en un benchmark retenido y que su delta de calidad frente a la cuantizacion plana es desconocido.

Los unicos datos numericos publicados son mediciones de rendimiento en la tarjeta objetivo (Radeon AI PRO R9700, 32 GB, Windows 11, Vulkan, 12K de contexto servido, ubatch 2048, sin Flash Attention):

| Medicion | Resultado |
|---|---:|
| Decodificacion | 16,0 tokens/s |
| Prefill (prompt de 7,4K) | 355 tokens/s |
| VRAM residente | 29,3 GB |
| Spill a memoria compartida | ~0,3 GB |

Como referencia, la cuantizacion plana de 3 bits obtuvo 77 % en MMLU-Pro (limite de 2.400 tokens, 77 respuestas truncadas), 100 % en GSM8K-50 y 6/6 en un conjunto de codigo en la misma tarjeta. Estos resultados corresponden a la variante plana, no a la hibrida.

## Requisitos de hardware

- VRAM estimada: 25,90 GiB de pesos; con 12K de contexto servido el autor mide 29,3 GB residentes, con ~0,3 GB de spill a memoria compartida. El KV cache cuesta aproximadamente 320 KB por token, por lo que pesos mas contexto superan los 32 GB a partir de unos 16K de contexto.
- GPU recomendada: AMD Radeon AI PRO R9700 de 32 GB, la tarjeta sobre la que se midio. No se documentan mediciones en otras GPU.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB o menos con contexto util; en 32 GB entra con contexto de 10-12K y un spill minimo.
- Backend: Vulkan en llama.cpp. Flash Attention no esta soportado para esta arquitectura en Vulkan y, si se activa, cae a CPU.
- Opciones de despliegue: llama.cpp compilado desde el pull request abierto que anade la arquitectura `ricursive`. No funciona en versiones publicadas de llama.cpp, LM Studio ni Ollama.
- Parametros de servicio: mantener ubatch en 2048 y servir a 10-12K de contexto.
- Latencia y throughput: 16,0 tokens/s de decodificacion y 355 tokens/s de prefill con prompt de 7,4K en la configuracion medida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de 65B ni con otras cuantizaciones del mismo modelo mas alla de la referencia a la cuantizacion plana IQ3_XXS (24,25 GiB, 3,22 BPW) y a los pesos de origen Q8_0 (68,8 GB) y BF16 (129 GB). No se dispone de datos de benchmarks de esta variante que permitan una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- Compatibilidad restringida: la arquitectura `ricursive` no esta en las versiones publicadas de llama.cpp, LM Studio ni Ollama. Cargar el archivo exige compilar desde un pull request abierto y fijado a un commit concreto; los runners ordinarios rechazan el archivo.
- Calidad no medida: el autor declara que la variante hibrida no se ha puntuado en un benchmark retenido y que el delta de calidad frente a la cuantizacion plana es desconocido.
- Matriz de importancia mas debil: se calculo sobre el preview de 3 bits en lugar de sobre BF16 o Q8, lo que puede degradar la asignacion de bits por tensor respecto a una calibracion de mayor precision.
- Sin Flash Attention: no esta soportado para esta arquitectura en Vulkan y, si se activa, cae a CPU, con la penalizacion de rendimiento correspondiente.
- Limite de contexto practico: por encima de unos 16K de contexto, pesos y KV cache superan los 32 GB de la tarjeta objetivo.
- Idiomas no declarados: la model card no especifica que idiomas soporta el modelo base.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni evaluaciones de alucinacion en la informacion proporcionada; al ser una cuantizacion de 3,43 BPW de un modelo de 65B, es esperable cierta degradacion respecto a los pesos de mayor precision, aunque no se cuantifica.
- Licencia: Apache 2.0, lo que permite uso comercial, pero la licencia del modelo base debe verificarse de forma independiente.
- Reproducibilidad: el proceso depende de un PR no fusionado y de una build de calibracion publica concreta; cambios en el PR pueden alterar el comportamiento del conversor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgmharikrishnan/Ripple-65B-Preview-amd-serve-hybrid-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Corpus de calibracion: `AtomicChat/calib-corpora`, ruta `builds/ripple-65b/calib_train.txt` (referenciado en la model card; no se proporciona URL directa)
- Pull request de llama.cpp con la arquitectura `ricursive`: no disponible la URL en la informacion proporcionada
