# ShadeEngine/bytegpt-byte-85M

## Resumen

ByteGPT Byte 85M es un modelo de lenguaje experimental desarrollado por ShadeEngine que opera directamente sobre bytes UTF-8 sin tokenizador. Cada byte del texto constituye un paso de inferencia, eliminando por completo la dependencia de un vocabulario BPE o similar. El modelo forma parte de un estudio comparativo de tres arquitecturas (byte, BPE y H-Net) entrenadas con el mismo presupuesto de computo para evaluar el rendimiento de cada enfoque en igualdad de condiciones.

Arquitectonicamente es un transformer de 12 capas con 12 cabezas de atencion, anchura 768 y 85,2 millones de parametros, con un vocabulario de 256 valores de byte y una ventana de contexto de 8.192 bytes. Incorpora RMSNorm, embeddings posicionales rotatorios (RoPE), activacion SwiGLU y embeddings de entrada y salida atados. El byte 254 se reserva como marcador de inicio de documento.

Su relevancia es fundamentalmente investigadora: permite estudiar el comportamiento de modelos tokenizer-free frente a alternativas con tokenizador a igualdad de computo, y sirve como referencia base para trabajos sobre representaciones byte-level. No esta pensado para uso en produccion ni para tareas del mundo real, segun advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (12 capas, 12 cabezas, anchura 768) |
| Parametros totales | 85.150.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 bytes |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors) + model.py + config.json |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas y 12 cabezas de atencion con anchura 768, que emplea RMSNorm, embeddings posicionales rotatorios (RoPE), activacion SwiGLU y embeddings de entrada y salida atados. La particularidad principal es que el vocabulario se reduce a 256 valores de byte, de modo que el modelo procesa texto UTF-8 byte a byte sin tokenizador. El byte 254 se utiliza como token especial de inicio de documento. El repositorio incluye `model.py` con la implementacion completa, junto con `config.json` que contiene todos los hiperparametros del entrenamiento.

El entrenamiento se realizo sobre FineWeb-Edu `sample-10BT` tratado como bytes crudos, durante 20.000 pasos de 524.288 bytes cada uno (aproximadamente 10,5 GB de texto y en torno a 1,0e19 FLOPs). Se uso el optimizador AdamW con una tasa de aprendizaje maxima de 6e-4, 500 pasos de calentamiento, decaimiento coseno hasta 6e-5, weight decay de 0,1, recorte de gradiente de 1,0 y precision bfloat16. El entrenamiento se ejecuto en dos RTX 3090 durante aproximadamente un dia. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto a nivel de byte: produce secuencias UTF-8 directamente, sin tokenizador intermedio.
- Modelado de lenguaje autorregresivo: entrenado con objetivo de language modeling clasico.
- Robustez ante ruido tipografico: el modelo muestra una penalizacion por erratas (1% de typos) de 1,240, ligeramente inferior a la del modelo BPE comparable (1,280), lo que sugiere cierta tolerancia a errores ortograficos.
- Capacidad limitada de generacion de codigo: obtiene 1,329 bits por byte en Python, mejor que el modelo BPE (1,382) y que el H-Net (1,521) en ese dominio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas; el modelo se entreno solo con datos en ingles y su rendimiento en frances es notablemente peor (1,944 bits por byte frente a 1,836 del BPE).
- Capacidades especiales: ninguna documentada (sin vision, audio ni modo thinking).

## Casos de uso

- Investigacion sobre tokenizacion: el modelo sirve como linea base para estudiar el impacto de eliminar el tokenizador en el rendimiento de modelos de lenguaje, comparandolo directamente con el BPE Transformer y el H-Net del mismo autor bajo presupuesto de computo identico.
- Experimentos de robustez ante ruido: gracias a su naturaleza byte-level, permite analizar como afectan las erratas, el ruido ortografico o las perturbaciones a nivel de caracter a la calidad de la generacion, un escenario dificil de modelar con tokenizadores BPE.
- Analisis de modelado de codigo a bajo nivel: su mejor rendimiento relativo en Python (1,329 bits por byte) lo hace util para estudiar representaciones de codigo sin tokenizador, aunque no para generar codigo en produccion.
- Estudio de eficiencia computacional: al procesar un byte por paso, permite medir el coste real de la tokenizer-free frente a alternativas con tokenizador en terminos de pasos, FLOPs y calidad por byte.
- Docencia y divulgacion: modelo pequeno (0,3 GB) y con codigo autocontenido en `model.py`, ideal para explicar el funcionamiento interno de un transformer y la diferencia entre modelado a nivel de byte y a nivel de subpalabra.
- Reproduccion de experimentos academicos: el repositorio incluye configuracion completa y datos de entrenamiento publicados, lo que facilita replicar el entrenamiento o extenderlo con otros datasets.
- Pruebas de infraestructura de inferencia: su tamano reducido permite validar pipelines de carga de safetensors, generacion con `model.generate` y decodificacion UTF-8 con manejo de errores en entornos de desarrollo.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan los tres modelos entrenados con el mismo presupuesto de computo (aproximadamente 1,0e19 FLOPs). Menos es mejor en todas las filas excepto en HellaSwag.

| Metrica | Byte Transformer (este modelo) | BPE Transformer | H-Net |
|---|---:|---:|---:|
| FineWeb-Edu validacion, bits por byte | 1,036 | 0,922 | 0,913 |
| Wikipedia en ingles, bits por byte | 1,118 | 0,988 | 1,034 |
| Wikipedia en frances, bits por byte | 1,944 | 1,836 | 1,865 |
| Codigo Python, bits por byte | 1,329 | 1,382 | 1,521 |
| HellaSwag accuracy (1.000 preguntas, azar 25%) | 35,7% | 38,7% | 38,8% |
| Penalizacion por erratas (loss con 1% typos / loss limpia) | 1,240 | 1,280 | 1,241 |

Cada conjunto de evaluacion consta de 5 MB de texto no visto durante el entrenamiento. El modelo byte-level queda por detras del BPE y del H-Net en modelado general de texto, pero supera a ambos en modelado de codigo Python y muestra una penalizacion por erratas ligeramente menor que el BPE.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo ocupa aproximadamente 170 MB de pesos; con cache KV para contexto de 8.192 bytes y overhead de PyTorch, el consumo total se situa en torno a 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Se entreno en dos RTX 3090 y se ejecuta sin problemas en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 30xx, RTX 40xx, incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: el repositorio proporciona `model.py` con carga via `safetensors` y `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La generacion se realiza con el metodo `generate` incluido en `model.py`, con parametros de temperatura y top-k.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Al procesar un byte por paso, la generacion es inherentemente mas lenta por caracter que en modelos con tokenizador, aunque el tamano reducido del modelo compensa parcialmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ByteGPT Byte 85M (este modelo) | 85,2M | 8.192 bytes | Byte-level, sin tokenizador | no disponible | Hugging Face |
| ByteGPT BPE 110M | 110M (no confirmado en la informacion) | no disponible | BPE con tokenizador de 32k | no disponible | Hugging Face |
| ByteGPT H-Net 100M | 100M (no confirmado en la informacion) | no disponible | H-Net (tokenizador dinamico aprendido) | no disponible | Hugging Face |

Los tres modelos pertenecen al mismo estudio comparativo del autor y comparten presupuesto de computo y datos de entrenamiento. El BPE Transformer y el H-Net superan al modelo byte-level en modelado general de texto y en HellaSwag, mientras que el modelo byte-level es mejor en codigo Python y ligeramente mas robusto ante erratas. No se dispone de informacion sobre otros modelos externos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Calidad factual baja: el autor advierte explicitamente que estos modelos escriben ingles fluido pero a menudo factualmente incorrecto. No deben usarse mas alla del estudio de su comportamiento.
- Una sola ejecucion de entrenamiento por modelo: el autor senala que diferencias de uno o dos puntos porcentuales podrian ser ruido estadistico.
- Rendimiento inferior al BPE en modelado general: 1,036 frente a 0,922 bits por byte en FineWeb-Edu y 35,7% frente a 38,7% en HellaSwag.
- Limitacion idiomatica: entrenado solo con datos en ingles; su rendimiento en otros idiomas (por ejemplo, frances: 1,944 bits por byte) es claramente peor.
- Ventana de contexto en bytes: 8.192 bytes equivalen a un texto considerablemente mas corto que 8.192 tokens en un modelo BPE, lo que reduce el contexto efectivo en terminos de palabras.
- Sin alineacion: no se documenta RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido inapropiado o sesgado.
- Licencia no disponible: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso fuera de investigacion.
- Sin soporte de herramientas de despliegue estandar: no hay pesos GGUF ni integracion con vLLM, llama.cpp u Ollama, lo que limita su uso en pipelines de produccion.
- Modelo de investigacion: no apto para produccion, atencion al cliente ni tareas que requieran precision factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShadeEngine/bytegpt-byte-85M
- Modelo BPE comparable: https://huggingface.co/ShadeEngine/bytegpt-bpe32k-110M
- Modelo H-Net comparable: https://huggingface.co/ShadeEngine/bytegpt-hnet-100M
- Dataset de entrenamiento (bytes): https://huggingface.co/datasets/ShadeEngine/fineweb-edu-bytes-10BT
- Dataset de entrenamiento (BPE): https://huggingface.co/datasets/ShadeEngine/fineweb-edu-bpe32k-10BT
- Articulo del autor "Can a model learn its own tokenizer?": https://claude.ai/artifact/AamTLQSJGp6uYueALTKjtm
- Blog de Cartesia "From Tokens to Bytes" (parte 1): https://www.cartesia.ai/blog/from-tokens-to-bytes-part-1
- Paper H-Net: https://arxiv.org/abs/2507.07955
