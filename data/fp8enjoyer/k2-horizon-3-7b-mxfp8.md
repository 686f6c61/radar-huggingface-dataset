# FP8Enjoyer/K2-Horizon-3.7B-MXFP8

## Resumen

K2-Horizon-3.7B-MXFP8 es una conversión cuantizada en formato MXFP8 del modelo denso IFM/K2-Horizon-3.7B, publicada por el usuario FP8Enjoyer. No se trata de un simple checkpoint de pesos: el repositorio empaqueta los pesos cuantizados junto con código de modelo propio y un runtime de inferencia optimizado para GPU NVIDIA Blackwell, con el objetivo de ejecutar el modelo en GPUs de consumo con memoria limitada. El checkpoint ocupa 5,9 GB e incluye 5.196.274.887 parámetros almacenados en safetensors (la denominación comercial "3.7B" se refiere a los parámetros no de embedding; el total con embeddings ronda los 5,2 B), una discrepancia habitual en esta familia.

El modelo base es un transformer decoder-only denso de la flota abierta K2 Horizon de IFM, con 524.288 tokens de contexto nativo y pesos Apache 2.0. La contribución de esta versión es la cuantización MXFP8 (pesos E4M3 con escalas de bloque E8M0 en uint8, tamaño de grupo 32) aplicada a 253 módulos —252 capas lineales del transformer más la capa de embedding—, manteniendo la cabeza de salida y el resto de parámetros en BF16.

Su relevancia es doble: por un lado, demuestra que un modelo con contexto nativo de 512K puede servirse en una GPU de portátil de 12 GB gracias a la cuantización FP8 y a una caché KV también en FP8; por otro, es un ejemplo de despliegue acoplado a kernels específicos de arquitectura (Triton GEMV, Comfy-Kitchen MXFP8, FlashAttention 2), lo que implica que no funciona con `transformers.pipeline()` estándar ni con backends genéricos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación comunitaria es nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (K2 Horizon), con capas lineales cuantizadas en MXFP8 |
| Parametros totales | 5.196.274.887 (~5,2 B, incluye embeddings; nombre comercial 3.7B); el modelo base declara 5,06 B almacenados |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens en el modelo base; el runner multirrunda incluido usa una ventana fija de 16.384 tokens |
| Tipos de cuantizacion | MXFP8: pesos E4M3 FP8, escalas de bloque E8M0 almacenadas como uint8, group size 32, layout bloqueado Comfy-Kitchen / TensorCore MXFP8; 253 módulos cuantizados (252 lineales + 1 embedding); cabeza de salida y parámetros restantes en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible para esta conversión; el modelo base IFM/K2-Horizon-3.7B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (requiere además `configuration_k2_horizon.py` y `modeling_k2_horizon.py` del propio repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del K2-Horizon-3.7B de IFM: un decoder-only transformer denso de la familia K2 Horizon, publicada junto a hermanos de 0,9B y 7B (además de variantes MoE de mayor tamaño). De la información disponible no se desprende el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias: esos datos figuran como no disponibles. El repositorio de la cuantización es explícitamente una conversión de pesos (`base_model_relation: quantized`), no un reentrenamiento, por lo que la calidad intrínseca del modelo es la del checkpoint original.

La innovación técnica está en el runtime, no en la arquitectura. Los pesos se cargan módulo a módulo desde safetensors sobre un modelo creado en el dispositivo `meta`, sustituyendo las capas lineales estándar y el embedding por módulos MXFP8 personalizados. Para decodificación autorregresiva con batch 1 se emplea un kernel Triton MXFP8 GEMV específico para formas M=1; para formas matriciales mayores se usan los kernels MXFP8 de Comfy-Kitchen. La caché KV se mantiene en BF16 y la decodificación se acelera con un CUDA Graph de un solo token, muestreo temperature/top-p por GPU, detección de EOS en GPU y ausencia de sincronización con el host por token. El runner multirrunda va más allá y utiliza una API experimental de flujo de control de PyTorch 2.14 (grafo CUDA conditional-WHILE), con decodificación, muestreo, escritura de tokens y control de bucle enteramente en GPU.

## Capacidades

- Generación de texto conversacional, con plantilla de chat incluida (`chat_template.jinja`) y modo de razonamiento configurable mediante `reasoning_effort` (valor por defecto: `high`).
- Razonamiento multi-paso en contexto largo: el modelo base soporta hasta 524.288 tokens, lo que permite mantener documentos extensos o historiales largos en una sola ventana.
- Generación de código: el repositorio incluye la etiqueta `custom_code` asociada al modelo base; no se dispone de evaluaciones específicas de código en la información proporcionada.
- Conversación multiturno mediante `inference_multiturn_gpu_while.py`, con gestión de historial y eliminación de los pares usuario/asistente más antiguos cuando se supera la ventana.
- Inferencia interactiva por línea de comandos (`inference.py`) con contexto configurable, generación en streaming y estadísticas de velocidad de decodificación al finalizar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible como capacidad declarada; el modo multiturno es conversacional, no de planificación con herramientas.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional local en portátil con GPU Blackwell: el modelo cabe en 12 GB de VRAM (pico medido de 7.958 GiB con caché KV en FP8) y sostiene entre 25 y 85 tokens/s según la longitud de contexto, lo que permite un chatbot privado sin conexión a servicios externos.
- Análisis de documentos largos: con contexto nativo de 512K tokens en el modelo base, es adecuado para resumir o extraer información de contratos, informes o expedientes completos sin trocear el texto, siempre que se use un runner con esa ventana (los runners incluidos usan 16.384 tokens por defecto en el modo multirrunda).
- Revisión de código en local: el modelo puede generar y comentar código dentro del propio entorno de desarrollo del usuario, sin enviar el repositorio a una API externa, algo relevante para código propietario o sujeto a cumplimiento normativo.
- Despliegue de bajo coste en el borde: al requerir una única GPU de consumo y 5,9 GB de checkpoint, encaja en estaciones de trabajo pequeñas o servidores con una RTX 5070 Ti o superior, con throughput de un solo usuario suficiente para uso interactivo.
- Evaluación de técnicas de cuantización FP8: sirve como banco de pruebas para comparar MXFP8 con BF16 en un mismo modelo, ya que el repositorio publica métricas de throughput, memoria de caché KV y pico de VRAM de ambos regímenes.
- Investigación sobre decodificación con grafos CUDA: los runners incluidos (CUDA Graph de un token y conditional-WHILE de PyTorch 2.14) son material directamente reutilizable para estudiar la eliminación de sincronizaciones host-dispositivo por token.
- Generación de texto asistida por lotes pequeños: aunque el runtime optimizado está pensado para batch 1, los kernels MXFP8 de Comfy-Kitchen cubren formas matriciales mayores, lo que habilita servir peticiones concurrentes moderadas con el modelo base y vLLM.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a velocidad de decodificación y memoria, medidos en un sistema con NVIDIA GeForce RTX 5070 Ti Laptop (Blackwell SM120, 11,94 GiB de VRAM), Python 3.13, PyTorch 2.14.0+cu130, CUDA 13.0, FlashAttention 2.8.3, batch size 1 y CUDA Graph de decodificación de un token. No hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de calidad equivalentes.

Decodificación de 0 a 32K tokens:

| Backend | Inicio (tok/s) | ~16K (tok/s) | ~32K (tok/s) | Media (tok/s) | KV (GiB) | Pico (GiB) |
|---|---:|---:|---:|---:|---:|---:|
| FP8 KV + Triton | 85,17 | 38,75 | 25,05 | 38,72 | 2,285 | 7,958 |
| BF16 KV + PyTorch SDPA | 10,82 | 10,84 | 10,84 | 10,84 | 4,500 | 10,173 |
| BF16 KV + cuDNN SDPA | 51,80 | 48,19 | 48,55 | 49,23 | 4,500 | 10,173 |
| BF16 KV + FlashAttention 2 | 84,17 | 57,29 | 46,57 | 54,99 | 4,500 | 10,173 |

Decodificación de contexto largo, 32K a 40K:

| Backend | Prefill (tok/s) | Inicio @32K | Medio | Final @40K | Media (tok/s) | Mediana (tok/s) | KV (GiB) |
|---|---:|---:|---:|---:|---:|---:|---:|
| BF16 KV + FlashAttention 2 | 135,14 | 46,46 | 44,94 | 43,85 | 45,03 | 44,91 | 5,625 |
| BF16 KV + cuDNN SDPA | 133,20 | 46,67 | 45,90 | 46,00 | 46,14 | 46,15 | 5,625 |

Conclusiones que el propio autor extrae de estos datos: FlashAttention 2 ofrece el mejor rendimiento global en contextos bajos y moderados, cuDNN SDPA escala mejor en contexto muy largo y adelanta a FlashAttention 2 en el extremo superior del rango probado, y la caché KV en FP8 reduce el uso de memoria aproximadamente a la mitad pero el backend Triton de atención FP8 (experimental) pierde throughput de forma notable a medida que crece el contexto. El runner público usa BF16 KV con FlashAttention 2.

## Requisitos de hardware

- GPU Blackwell obligatoria para el runtime optimizado: los kernels MXFP8 (Triton GEMV M=1 y Comfy-Kitchen) dependen de las unidades TensorCore de esa generación. El entorno validado es SM120.
- VRAM estimada: 5,9 GB para el checkpoint; pico medido de 7.958 GiB con caché KV en FP8 y 10.173 GiB con caché KV en BF16, ambos en decodificación de hasta 32K tokens. En la ventana de 32K a 40K con KV en BF16, la caché consume 5,625 GiB.
- Cabe en GPU de consumo: sí, verificado en una RTX 5070 Ti Laptop con 12 GB. Con 12 GB el margen es estrecho con caché KV en BF16, por lo que conviene usar FP8 KV o reducir la ventana de contexto.
- GPU recomendadas: cualquier Blackwell con al menos 12 GB (RTX 5070 Ti, RTX 5080, RTX 5090, RTX PRO 6000, B200). En generaciones anteriores (Ampere, Ada) el camino MXFP8 no está soportado por este runtime.
- Opciones de despliegue: los scripts incluidos `inference.py` (mono-turno, streaming) e `inference_multiturn_gpu_while.py` (multirrunda, 16.384 tokens fijos). El pipeline genérico de `transformers` no puede ejecutar los tensores laterales MXFP8. Para el modelo base sin cuantizar existen recetas de vLLM.
- Dependencias validadas: Windows, Python 3.13, PyTorch 2.14.0+cu130, CUDA 13.0, Transformers 5.15.0, Comfy-Kitchen 0.2.35, Triton-Windows 3.8.0.post28, FlashAttention 2.8.3. En Windows, FlashAttention puede requerir un wheel precompilado compatible con la versión de Python, PyTorch, CUDA y arquitectura de GPU.
- Latencia y throughput medidos: hasta 85,17 tok/s al inicio de la ventana y 25,05 tok/s a 32K con FP8 KV + Triton; media de 54,99 tok/s de 0 a 32K con FlashAttention 2; prefill de aproximadamente 135 tok/s en el rango de 32K a 40K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FP8Enjoyer/K2-Horizon-3.7B-MXFP8 | 5,196 B almacenados | 524.288 tokens (modelo base); 16.384 en el runner multirrunda | MXFP8 E4M3 + escalas E8M0, safetensors | no disponible | Hugging Face, 0 descargas |
| IFM/K2-Horizon-3.7B (base) | 5,06 B almacenados | 524.288 tokens | BF16, safetensors | Apache 2.0 | Hugging Face, receta vLLM publicada |
| FP8Enjoyer/K2-Horizon-7B-MXFP8 | no disponible | no disponible | MXFP8, safetensors; requiere configuración, tokenizer y arquitectura del repositorio original K2-Horizon-7B | no disponible | Hugging Face |
| K2 Horizon 0.9B (familia IFM) | ~0,9 B | no disponible en la información recogida | no disponible | Apache 2.0 (familia) | Hugging Face |

La comparación relevante es contra el checkpoint BF16 original: esta versión reduce el peso en disco y el uso de memoria a cambio de atarse a kernels MXFP8 y a hardware Blackwell, con una pérdida de calidad de la cuantización que no está cuantificada en la información disponible. No se dispone de datos de benchmarks de calidad para ninguno de los modelos de la tabla, por lo que no es posible comparar rendimiento en tareas.

## Limitaciones y advertencias

- La licencia del repositorio de la cuantización figura como no disponible. Aunque el modelo base es Apache 2.0, conviene confirmar los términos aplicables antes de un uso comercial de esta conversión.
- El checkpoint no es autónomo: es obligatorio clonar o descargar el repositorio completo, ya que el código de modelo (`configuration_k2_horizon.py`, `modeling_k2_horizon.py`) y el runtime MXFP8 personalizado son necesarios para la inferencia.
- `transformers.pipeline()` no puede ejecutar directamente los tensores laterales MXFP8; cualquier integración debe pasar por los scripts proporcionados o por una reimplementación propia de los kernels.
- Dependencia fuerte de hardware: los kernels Triton y Comfy-Kitchen están orientados a Blackwell, por lo que el modelo no es portable a GPUs Ampere o Ada sin reescribir el camino de inferencia.
- El backend Triton de atención FP8 con caché KV en FP8 es experimental y pierde throughput de forma acusada a partir de 16K tokens (de 85,17 a 25,05 tok/s).
- El runner multirrunda depende de una API experimental de flujo de control de PyTorch 2.14, realiza re-prefill completo en cada turno (sin reutilización de KV) y recorta el historial eliminando los pares más antiguos, lo que puede provocar pérdida de contexto relevante en conversaciones largas.
- Riesgo de alucinación: inherente a cualquier modelo generativo de este tamaño; no hay evaluaciones publicadas de fidelidad factual para esta conversión ni para el base.
- Idiomas soportados no declarados: no se puede asumir un rendimiento homogéneo fuera del inglés sin evaluación previa.
- No hay datos de sesgos, filtros de seguridad ni comportamiento en dominios sensibles.
- No existen benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) que permitan estimar la degradación introducida por la cuantización MXFP8 respecto al checkpoint BF16.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, con una única revisión del autor. No se conocen despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FP8Enjoyer/K2-Horizon-3.7B-MXFP8
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Hermano cuantizado de 7B: https://huggingface.co/FP8Enjoyer/K2-Horizon-7B-MXFP8
- Perfil del autor: https://huggingface.co/FP8Enjoyer
- Blog de presentación de la familia K2 Horizon: https://ifm.ai/blog/k2/
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/IFM/K2-Horizon-3.7B
- Ficha de referencia del modelo base: https://www.llmreference.com/model/k2-horizon-3.7b
