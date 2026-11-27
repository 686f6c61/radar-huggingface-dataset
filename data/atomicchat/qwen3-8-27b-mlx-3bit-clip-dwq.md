# AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP-DWQ

## Resumen

AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP-DWQ es una cuantizacion de 3 bits del modelo multimodal Qwen3.8-27B de Qwen, empaquetada en formato MLX para su ejecucion en Apple Silicon. El trabajo lo firma AtomicChat, el equipo detras de la aplicacion Atomic Chat, que se especializa en convertir pesos abiertos a formatos ligeros para inferencia local y offline. El repositorio ocupa 12,69 GB en un unico `model.safetensors`, lo que permite ejecutar un modelo de 27.356 millones de parametros en equipos con memoria unificada modesta.

El modelo resuelve el problema de desplegar un VLM de gran tamano en Macs sin GPU dedicada: mantiene la torre de vision en bf16 (0,46B de parametros, 0,92 GB) y aplica cuantizacion uniforme de 3 bits con group size 64 a todas las matrices del modelo de lenguaje (26,9B de pesos), con un proceso de busqueda de clipping por grupo y un paso posterior de destilacion de pesos (DWQ) usando la build de 8 bits como profesor. El resultado son 3,50 bits por peso de media y una divergencia KL de 0,215 frente a su conversion bf16 de referencia.

Es relevante porque demuestra que un VLM de 27B con entrada de imagen puede caber en 12,7 GB con una perdida de fidelidad acotada y medible, y porque publica las metricas de calibracion de toda la familia de cuantizaciones (desde 3,50 hasta 5,00 bpw), lo que permite elegir el punto de equilibrio entre tamano y calidad con datos en la mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.8 + torre de vision CLIP); la model card no detalla mas la arquitectura |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits uniforme, group size 64, con busqueda de clipping y DWQ; torre de vision en bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 segun la model card (el campo de licencia del repo aparece como no disponible) |
| Formato de pesos | safetensors (MLX), un unico `model.safetensors` de 12,69 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un VLM de Qwen con pipeline `image-text-to-text`. La model card no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al modelo original y no se reproduce aqui. Lo que si se documenta es el proceso de cuantizacion: se parte de la conversion bf16 a MLX del original (AtomicChat/Qwen3.8-27B-MLX-bf16), se aplica una conversion a 3 bits con busqueda de clipping para el rango de cuantizacion de cada grupo y despues DWQ (Distillation-based Weight Quantization), que ajusta escalas y offsets por destilacion tomando la build MLX de 8 bits como profesor. El run de DWQ dura entre una y dos horas en una sola GPU.

La innovacion tecnica destacable es el propio esquema DWQ combinado con busqueda de clipping: frente a una conversion plana de 3 bits (group 64, sin clipping ni DWQ) que mide KLD 0,223 y 78,5% de coincidencia top-1, esta version baja a 0,215 y 79,6%. La mejora es modesta pero consistente, y la familia completa permite escalar hasta 5,00 bpw con KLD 0,031 y 91,5% de top-1. Las metricas se obtuvieron con mlx-lm 0.31.3 y mlx-vlm 0.6.15 sobre 1x H200 NVL, evaluando 24 fragmentos de 4096 tokens de texto neutral reservado y puntuando solo la segunda mitad de cada fragmento.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Entrada de imagen y texto (`image-text-to-text`): la torre de vision se conserva en bf16 para preservar calidad en la percepcion visual.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8-27B (no se detallan capacidades especificas en la model card).
- Soporte de plantilla de chat (`tokenizer.chat_template`) para formateo de conversaciones.
- Ejecucion local y offline en Apple Silicon mediante MLX.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modo thinking explicito.

## Casos de uso

- Asistente conversacional local en Mac: cargar el repo con `mlx-lm` y usar `generate` con la plantilla de chat permite tener un asistente de 27B funcionando sin conexion, con 12,7 GB de pesos en disco y memoria unificada como unico requisito.
- Analisis de imagenes en escritorio: con `mlx-vlm` y el mismo identificador de repositorio se puede enviar una imagen junto a una pregunta y obtener una descripcion o extraccion de informacion, manteniendo la torre de vision en bf16 para no degradar la calidad visual.
- Prototipado de aplicaciones VLM sin infraestructura cloud: el tamano de 12,69 GB permite iterar en un portatil Apple Silicon antes de mover el pipeline a produccion con el modelo completo.
- Procesamiento por lotes de documentos escaneados en local: al ejecutarse offline, es adecuado para flujos con requisitos de privacidad donde las imagenes no pueden salir del equipo.
- Evaluacion comparativa de cuantizaciones: la familia publica mediciones de KLD y top-1 para cinco niveles de bpw, lo que sirve para elegir el punto de compresion adecuado en funcion de la memoria disponible y la tolerancia a la perdida de fidelidad.
- Integracion en la aplicacion Atomic Chat: el modelo esta empaquetado por el mismo equipo que desarrolla la app, por lo que encaja directamente en ese entorno de inferencia local.
- Educacion e investigacion sobre cuantizacion: el repositorio documenta el metodo (clipping search + DWQ) y publica los logs de calibracion, lo que lo convierte en material de referencia para estudiar tecnicas de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta metricas de fidelidad de cuantizacion frente a la conversion bf16:

| Repositorio | Layout | Bits por peso | En disco | KLD media | Mismo top-1 |
|---|---|---:|---:|---:|---:|
| AD-3.50bpw-DWQ-12.7GB (este) | 3 bits uniforme | 3,50 | 12,69 GB | 0,215 | 79,6% |
| AD-3.70bpw-DWQ-13.4GB | mlx-lm `mixed_3_4` | 3,70 | 13,37 GB | 0,166 | 82,4% |
| AD-3.80bpw-DWQ-13.7GB | per-tensor | 3,80 | 13,69 GB | 0,148 | 82,3% |
| AD-4.50bpw-DWQ-16.0GB | 4 bits uniforme | 4,50 | 16,05 GB | 0,053 | 89,5% |
| AD-5.00bpw-DWQ-17.7GB | per-tensor | 5,00 | 17,74 GB | 0,031 | 91,5% |
| 3 bits plano (referencia) | group 64, sin clipping ni DWQ | 3,00 | no disponible | 0,223 | 78,5% |
| 4 bits plano (referencia) | group 64, sin clipping ni DWQ | 4,00 | no disponible | 0,056 | 89,1% |

## Requisitos de hardware

- VRAM o memoria unificada: los pesos ocupan 12,69 GB; se necesita memoria adicional para el contexto KV y las activaciones, por lo que conviene disponer de al menos 16 GB de memoria unificada.
- GPU recomendadas: el harness de evaluacion uso 1x H200 NVL, pero el destino real del formato MLX es Apple Silicon (serie M). No se especifican modelos concretos de Mac en la model card.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no se documenta compatibilidad con GPU NVIDIA consumer para este formato.
- Opciones de despliegue: `mlx-lm` (pip install mlx-lm) para el modelo de texto y `mlx-vlm` (pip install mlx-vlm) para entrada de imagen, ambos con el mismo identificador de repositorio.
- Latencia y throughput: no disponibles. No hay ejecucion en Mac registrada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP-DWQ (este) | 27,36B | no disponible | MLX safetensors, 3,50 bpw | apache-2.0 | KLD 0,215; 79,6% top-1; 12,69 GB |
| AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB | 27,36B | no disponible | MLX safetensors, 4,50 bpw | apache-2.0 | KLD 0,053; 89,5% top-1; 16,05 GB |
| AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB | 27,36B | no disponible | MLX safetensors, 5,00 bpw | apache-2.0 | KLD 0,031; 91,5% top-1; 17,74 GB |
| AtomicChat/Qwen3.8-27B-GGUF | 27,36B | no disponible | GGUF | apache-2.0 | Misma base en formato llama.cpp; metricas no comparables con las MLX |

No se dispone de informacion sobre modelos de otros autores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las metricas de fidelidad se midieron en CUDA (1x H200 NVL); no hay ejecucion en Mac registrada para este archivo concreto.
- La entrada de imagen no se probo en este archivo segun la model card, a pesar de que la torre de vision se conserva.
- KLD y top-1 se calcularon sobre un unico conjunto de texto reservado y no miden calidad en chat, uso de herramientas ni contexto largo.
- El modelo solo declara soporte de ingles (`language: en`), lo que limita su uso en castellano.
- La licencia aparece como apache-2.0 en la model card, pero el campo de licencia del repositorio figura como no disponible; conviene verificar antes de un uso comercial.
- La cuantizacion a 3,50 bpw implica una perdida de fidelidad no trivial (79,6% de coincidencia top-1 frente a bf16), superior a la de las variantes de 4,50 y 5,00 bpw.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto especificas; esa informacion corresponde al modelo base Qwen/Qwen3.8-27B y no se incluye aqui.
- El formato MLX limita el despliegue a entornos Apple Silicon; para otras plataformas existe la build GGUF del mismo equipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-3bit-CLIP-DWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversion bf16 MLX: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-bf16
- Variante 3,70 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.70bpw-DWQ-13.4GB
- Variante 3,80 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-3.80bpw-DWQ-13.7GB
- Variante 4,50 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-4.50bpw-DWQ-16.0GB
- Variante 5,00 bpw: https://huggingface.co/AtomicChat/Qwen3.8-27B-MLX-AD-5.00bpw-DWQ-17.7GB
- Build GGUF: https://huggingface.co/AtomicChat/Qwen3.8-27B-GGUF
- Logs de metricas: https://huggingface.co/datasets/AtomicChat/Qwen3.8-27B-MLX-metrics/tree/main/logs
- Aplicacion Atomic Chat: https://atomic.chat/
- Repositorio GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
