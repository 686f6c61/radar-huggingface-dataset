# 1bit-MONSTER/Zamba-7B-v1-GGUF

## Resumen

Zamba-7B-v1-GGUF es una conversión al formato GGUF del modelo Zamba-7B-v1 desarrollado por Zyphra, publicada por el usuario 1bit-MONSTER. El modelo original es un híbrido Mamba/atención con un único bloque de atención compartido entre capas, una arquitectura de espacio de estados (SSM) que combina la eficiencia de Mamba con un mecanismo de atención global. Esta conversión concreta tiene como objetivo hacer el modelo ejecutable en el motor propio de 1bit-MONSTER (fork de llama.cpp), y no es una cuantización de baja precisión pese al nombre del autor: el único fichero publicado es Q8_0.

El modelo base cuenta con 7.232.490.496 parámetros reales (según safetensors) y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La relevancia de esta ficha radica en que documenta una conversión con validación técnica explícita (96/96 coincidencia de tokens con transformers en FP32) y en que revela detalles poco habituales de la arquitectura Zamba v1, como el almacenamiento único de los pesos del bloque de atención compartido.

La información disponible es limitada: no hay datos de benchmarks, idiomas soportados ni pipeline declarados en la ficha de Hugging Face, y el repositorio tiene un volumen de descargas muy bajo (32) y ningún "like". Creado el 26 de septiembre de 2026 y actualizado el 27 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba/atención (SSM + un único bloque de atención compartido) |
| Parametros totales | 7.232.490.496 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Únicamente Q8_0 (fichero `Zamba-7B-v1-Q8_0.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (conversión propia; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base Zamba-7B-v1 emplea una arquitectura híbrida que combina capas de espacio de estados (Mamba/SSM) con un único bloque de atención compartido entre todas las capas, en lugar de replicar atención en cada nivel. Esta decisión reduce el coste de memoria y cómputo asociado a la atención, pero introduce trampas específicas en la conversión: los pesos del bloque compartido se almacenan una sola vez en el checkpoint, y duplicarlos ingenuamente inflaría el recuento de parámetros en unos 4.600 millones. Además, el campo `in_proj` intercala filas `[x, gate]` y el parámetro `ssm_n_group` debe permanecer a 0 para no inflar el estado de convolución.

La conversión de 1bit-MONSTER incluye una corrección de un bug en el tokenizador de llama.cpp (`LlamaHfVocab` puntuaba todos los merges como -1000, resolviendo los merges BPE en orden arbitrario para modelos SentencePiece BPE con solo `tokenizer.json`). Antes de la corrección, solo 318 de 1500 líneas de wikitext hacían round-trip correctamente contra el tokenizador de Hugging Face; después, 1500 de 1500. También se corrige el token `[PAD]` del tokenizer config, que añadía una entrada 32001 que debe limitarse al tamaño real del vocabulario. La validación reportada es de 96/96 coincidencia de tokens con transformers ejecutando el modelo en FP32 sobre CPU. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto autoregresiva mediante arquitectura híbrida SSM/atención.
- Razonamiento y procesamiento de secuencias largas, gracias al componente de espacio de estados (no se especifica la longitud de contexto soportada).
- Ejecución local mediante el motor de 1bit-MONSTER (ruta llama.cpp GGUF) sobre GPU HRX.
- Compatibilidad con endpoints (tag `endpoints_compatible` en la ficha de Hugging Face).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de arquitecturas híbridas SSM/atención: el modelo permite a investigadores comparar el comportamiento de un híbrido Mamba/atención frente a transformers densos de tamaño similar, con la ventaja de disponer de una conversión GGUF validada token a token contra transformers en FP32.
- Despliegue local en hardware de gama alta para consumo: con 7.800 MB de repositorio y un único fichero Q8_0, puede ejecutarse en estaciones de trabajo con GPU HRX o Vulkan (el motor reporta 266 tok/s de prefill y 8,9 tok/s de decode en Strix Halo con Vulkan Q8_0).
- Prototipado de pipelines de generación de texto en entornos con recursos limitados: el formato GGUF y la licencia Apache 2.0 permiten integrarlo en herramientas de inferencia local sin restricciones comerciales.
- Investigación sobre tokenizadores SentencePiece BPE: la conversión documenta y corrige un bug de merges en `LlamaHfVocab`, útil para quienes conviertan modelos con solo `tokenizer.json`.
- Base para cuantizaciones posteriores: al ser un GGUF Q8_0 validado, puede servir como punto de partida para generar versiones Q4_K_M, Q5_K_M u otras si el motor lo permite (no confirmado en la información disponible).
- Experimentación con decodificación en CPU/GPU mixta: el motor de 1bit-MONSTER soporta la ruta llama.cpp GGUF, lo que facilita pruebas en configuraciones sin GPU dedicada, aunque el rendimiento de decode es limitado (8,9 tok/s).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento medido es de inferencia, no de calidad:

| Métrica | Valor | Entorno |
|---|---|---|
| Prefill (pp512) | 266 tok/s | Strix Halo, Vulkan, Q8_0 |
| Decode (tg128) | 8,9 tok/s | Strix Halo, Vulkan, Q8_0 |
| Validación de tokens | 96/96 coincidencia | transformers FP32 en CPU |

Nota del autor: el decode es más lento que un transformer denso de tamaño comparable porque el escaneo SSM de Zamba v1 no ha recibido la misma optimización en Vulkan que su hermano Zamba2. Los números de la ruta HRX están pendientes de re-medición.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa aproximadamente 7,8 GB (tamaño del repo); se recomienda al menos 8-10 GB de VRAM para margen de contexto y buffers.
- GPU recomendadas: el autor reporta ejecución en Strix Halo (APU) con Vulkan y en GPU HRX; no se especifican modelos concretos como A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? Sí, en principio, en GPUs con 8 GB o más de VRAM (RTX 3060 Ti/4060 Ti 8 GB, RTX 4070, etc.), aunque no hay confirmación oficial de compatibilidad con CUDA en la información disponible.
- Opciones de despliegue: motor 1bit-MONSTER (`1bit serve -m Zamba-7B-v1-Q8_0.gguf --device hrx`), ruta llama.cpp GGUF. No se confirma soporte de vLLM, Ollama o TGI.
- Latencia y throughput: 266 tok/s de prefill y 8,9 tok/s de decode medidos en Strix Halo con Vulkan Q8_0 (backend Vulkan retirado posteriormente; cifras HRX pendientes).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zamba-7B-v1-GGUF (esta ficha) | 7.232.490.496 | No disponible | Híbrido Mamba/atención | Apache 2.0 | GGUF Q8_0 |
| Zamba2 (misma familia, citado en la model card) | No disponible | No disponible | Híbrido Mamba/atención | No disponible | No disponible |
| Transformer denso de ~7B | No disponible | No disponible | Transformer | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El repositorio tiene un único fichero Q8_0: no hay cuantizaciones de menor precisión (Q4, Q5) que faciliten el despliegue en GPUs consumer modestas.
- El rendimiento de decode medido es bajo (8,9 tok/s) y el propio autor lo atribuye a la falta de optimización del escaneo SSM de Zamba v1 en Vulkan; la ruta HRX no está re-medida.
- El backend Vulkan con el que se midieron las cifras ha sido retirado del motor, por lo que los números pueden no ser reproducibles en la versión actual.
- La model card advierte que los GGUF convertidos antes de la corrección del bug de `LlamaHfVocab` necesitan reconversión; esta conversión concreta ya incorpora la corrección.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específico del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Zyphra/Zamba-7B-v1 por si hubiera términos adicionales no reflejados.
- El bajo número de descargas (32) y la ausencia de "likes" sugieren poca validación por parte de la comunidad; tratar como conversión experimental.
- No se confirma soporte de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/1bit-MONSTER/Zamba-7B-v1-GGUF
- Modelo base: https://huggingface.co/Zyphra/Zamba-7B-v1
- Repositorio del motor 1bit: https://github.com/1bit-MONSTER/engine
- Familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
