# acidkill/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-NPU2

## Resumen

NVIDIA Nemotron 3.5 Bolt E4B Uncensored NPU2 es una conversión experimental del modelo Nemotron 3.5 Bolt E4B (basado en la arquitectura Gemma 4 E4B de NVIDIA, post-entrenado por NVIDIA) realizada por el usuario acidkill para su ejecución en aceleradores NPU AMD XDNA2 mediante el runtime OpenFlowLM. El modelo parte de la versión GGUF cuantizada y "abliterated" (edición de dirección de rechazo) publicada por AtomicChat, y se reempaqueta en el formato propietario `q4nx` con almacenamiento mixto nativo Q4_1/int8/BF16, incluyendo embeddings de tokens y por capa en int8.

El paquete incluye tres ficheros de pesos: lenguaje (`model.q4nx`, 7,14 GB), visión (`vision_weight.q4nx`, 956 MB) y audio (`audio_weight.q4nx`, 956 MB), sumando 9,055 GB en total. Los tensores del GGUF de origen contienen 7.518.069.290 parámetros; "E4B" es la nomenclatura de tamaño efectivo del modelo original, no el número real de parámetros. La conversión es lossy y no certifica paridad numérica con el original.

El interés de esta ficha es doble: por un lado documenta un caso real de despliegue de un modelo multimodal (texto, imagen y audio) en NPU de consumo AMD, con métricas de rendimiento medidas; por otro, advierte de que el modelo falla su propia puerta de evaluación congelada en selección automática de herramientas (0/2), lo que lo hace inadecuado para agentes autónomos sin instrucciones de sistema explícitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B de NVIDIA), conversión a formato NPU `q4nx` |
| Parametros totales | 7.518.069.290 (tensores del GGUF de origen) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (valor de servicio probado con `--ctx-len 4096`) |
| Tipos de cuantizacion | Q4_1 / int8 / BF16 mixtos nativos; embeddings de token y por capa en int8 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como `other` en la model card) |
| Formato de pesos | `q4nx` (model.q4nx, vision_weight.q4nx, audio_weight.q4nx) |

## Arquitectura y entrenamiento

El modelo subyacente es un Gemma 4 E4B post-entrenado por NVIDIA bajo la denominación Nemotron 3.5 Bolt E4B. Sobre esa base, AtomicChat aplicó una edición de dirección de rechazo (abliteration) y generó la cuantización GGUF AD-Q6_K de origen. La conversión de acidkill no reentrena ni modifica los pesos de forma sustancial: reempaqueta los tensores en el motor cerrado `gemma4e` de OpenFlowLM con kernels `Gemma4-E4B-IT-NPU2`, usando almacenamiento mixto Q4_1/int8/BF16. No se construyeron kernels nuevos para esta conversión.

La validación estructural reportada confirma que los layouts nativos de lenguaje, visión y audio coinciden con el esqueleto fijado de Gemma 4 E4B: 849/1411/1411 claves de tensor respectivamente, con formas y dtypes idénticos. El tokenizador valida los 262.144 IDs de vocabulario y 514.906 merges, con BOS 2 y EOS 1/106. La plantilla de chat original de NVIDIA embebida en el GGUF de AtomicChat se preserva literalmente, incluyendo `enable_thinking` y `conversational_mode` opcional; no se insertaron instrucciones de persona ni de forzado de herramientas. La conversión es lossy y no constituye certificación de paridad numérica.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con la API de OpenAI (`/v1/chat/completions`).
- Comprensión de imágenes (pipeline `image-text-to-text`), con fichero de pesos de visión dedicado.
- Procesamiento de audio, con fichero de pesos de audio dedicado.
- Modo de razonamiento opcional mediante `enable_thinking` en la plantilla; todas las mediciones locales se realizaron con thinking desactivado y la calidad con thinking activado no está probada.
- Soporte de tool calling / function calling a nivel de plantilla, aunque con fiabilidad limitada (ver benchmarks).
- Compatibilidad con instrucciones de sistema de agente explícitas para forzar el uso de herramientas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia multimodal en equipos con NPU AMD XDNA2: el paquete está diseñado específicamente para ejecutarse en aceleradores XDNA2 (probado en Ryzen AI 7 350 / Radeon 860M / Krackan1) mediante OpenFlowLM, lo que permite descargar la inferencia de la GPU y liberar VRAM para otras tareas.
- Asistentes conversacionales locales con contexto de 4096 tokens: adecuado para diálogos multi-turno de longitud moderada en entornos de escritorio o portátil con 32 GB de RAM.
- Procesamiento de documentos con OCR y descripción de imágenes: el modelo incluye pesos de visión y se probó con un fixture de OCR, aunque con errores de reconocimiento (devolvió `NPUZ` en lugar de `NPU2`), por lo que requiere validación humana en producción.
- Transcripción y análisis de audio: los pesos de audio permiten entrada de audio, aunque no se documentan pruebas específicas de calidad en la model card.
- Experimentación con modelos "uncensored" / abliterated: útil para investigadores que estudian el efecto de la edición de dirección de rechazo en modelos post-entrenados, comparando el comportamiento con el original.
- Pruebas de tool calling con política de agente explícita: con la instrucción de sistema adecuada, el modelo completó 2/2 roundtrips de herramientas con argumentos correctos, lo que permite prototipar pipelines de agentes sencillos siempre que se controle el prompt.
- Benchmarking de NPU frente a GPU: el paquete incluye perfiles de rendimiento comparables (prefill, generación, TTFT) que sirven para evaluar la viabilidad de XDNA2 en cargas de trabajo de LLM.

## Benchmarks y rendimiento

Evaluación congelada local (NPU2 vs. GPU AD-Q6_K, mismas condiciones):

| Evaluación congelada | NPU2 | GPU AD-Q6_K |
|---|---:|---:|
| Texto | 8/8 | 8/8 |
| Imágenes | 3/4 | 3/4 |
| Selección automática de herramienta | 0/2 | 0/2 |
| Global | 11/14 | 11/14 |
| Puerta congelada configurada | fallida | fallida |

Rendimiento con perfil de texto idéntico (1237 tokens de entrada / 128 generados, temperatura 0, thinking off, sin reutilización de caché, medianas de 3):

| Perfil de texto | NPU2 | GPU AD-Q6_K |
|---|---:|---:|
| Prefill | 483,11 tok/s | 250,26 tok/s |
| Generación | 12,47 tok/s | 18,18 tok/s |
| Extremo a extremo | 12,923 s | 12,034 s |
| TTFT cliente | 2,522 s | 4,937 s |

En la prueba adicional con instrucción de sistema de agente explícita, ambos backends completaron 2/2 roundtrips de herramientas con argumentos correctos. La ejecución real en NPU registró 20.568 comandos completados y cero errores reportados en el snapshot. El pico de memoria del servicio NPU medido fue de 11,65 GB sin swap en una máquina de 32 GB con contexto 4096.

## Requisitos de hardware

- Almacenamiento: 9,055 GB de pesos (8,43 GiB) repartidos en tres ficheros `q4nx`.
- RAM: pico medido de 11,65 GB en el servicio NPU con contexto 4096; el runtime excede el tamaño de los ficheros. Solo certificado en máquina de 32 GB.
- NPU: acelerador AMD XDNA2 (probado en Ryzen AI 7 350 / Radeon 860M / Krackan1). Requiere el runtime OpenFlowLM 0.1.0 y los kernels `Gemma4-E4B-IT-NPU2` proporcionados por OFLM, no por este repositorio.
- GPU (referencia): el GGUF AD-Q6_K de origen se ejecutó con llama.cpp sobre ROCm, con 43/43 capas offloaded, buffer ROCm de 4165,69 MiB y buffer host de 3536,00 MiB.
- Despliegue: OpenFlowLM (`oflm add` / `oflm serve`) para NPU; llama.cpp sobre ROCm para GPU. No se documentan opciones con vLLM, TGI ni Ollama.
- Throughput: 12,47 tok/s de generación en NPU frente a 18,18 tok/s en GPU, con prefill notablemente superior en NPU (483,11 vs. 250,26 tok/s) y menor TTFT (2,522 s vs. 4,937 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt E4B Uncensored NPU2 (este) | 7.518.069.290 | 4096 | q4nx (NPU XDNA2) | openmdw-1.1 | Hugging Face, 0 descargas |
| AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-GGUF | 7.518.069.290 | no disponible | GGUF AD-Q6_K | no disponible | Hugging Face (origen) |
| AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF | no disponible | no disponible | GGUF | no disponible | Hugging Face (proyector F16 de visión/audio) |

No se dispone de datos de benchmarks de los modelos de origen en la información proporcionada, por lo que no es posible comparar calidad entre ellos más allá de la equivalencia estructural de tensores declarada.

## Limitaciones y advertencias

- Falla la puerta de evaluación congelada en selección automática de herramientas (0/2 en NPU y GPU): sin una instrucción de sistema de agente explícita, el modelo responde directamente en lugar de invocar la función.
- El OCR presenta errores: el fixture esperaba `NPU2`, la NPU devolvió `NPUZ` y la GPU `NFU2`.
- La conversión es lossy y no certifica paridad numérica con el modelo original.
- La calidad con thinking activado no está probada; todas las mediciones se realizaron con thinking desactivado.
- El modelo es "uncensored" / abliterated: se ha editado la dirección de rechazo, lo que puede aumentar la probabilidad de generar contenido no filtrado. Requiere moderación externa en producción.
- Riesgo de alucinación inherente a modelos de este tamaño; no se documentan evaluaciones específicas de sesgo.
- Idiomas soportados no disponibles; no se garantiza cobertura multilingüe.
- Licencia openmdw-1.1: deben revisarse los términos para uso comercial; la model card la etiqueta como `other`.
- Dependencia de un motor cerrado (`gemma4e`) y kernels propietarios de OpenFlowLM, lo que limita la portabilidad y la reproducibilidad.
- Solo certificado en una configuración de hardware concreta (Ryzen AI 7 350, 32 GB, Linux 7.2.15-2-omarchy); otros tamaños de RAM no están verificados independientemente.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: madurez y mantenimiento no demostrados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acidkill/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-NPU2
- Modelo base (GGUF abliterated): https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-Uncensored-GGUF
- Modelo fuente de proyectores de visión/audio: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Runtime OpenFlowLM: no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
