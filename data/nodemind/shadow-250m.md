# NODEMIND/SHADOW-250M

## Resumen

SHADOW 250M Instruct es un modelo de lenguaje de 250 millones de parámetros desarrollado por NODEMIND, entrenado desde cero sobre 30 mil millones de tokens de texto en inglés y 0,7 mil millones adicionales de ajuste por instrucciones. Su rasgo más distintivo es un archivo offline comprimido de hasta 100 millones de tokens que reside en disco y permite recuperar hechos concretos con una ventana de atención de solo 2.048 tokens. El despliegue completo ocupa 60 MB (vocabulario incluido) y alcanza unos 400 tokens por segundo en CPU de portátil con unos 80 MB de RAM, lo que lo convierte en una opción extremadamente ligera para entornos sin GPU.

El modelo está pensado para tareas de generación de texto y chat en inglés, con un énfasis especial en la recuperación de información de grandes corpus almacenados localmente. Su licencia MIT y su capacidad de fine-tuning en una sola GPU lo hacen atractivo para desarrolladores que necesitan un modelo pequeño, rápido y personalizable. La arquitectura emplea atención con consultas agrupadas (GQA), embeddings atados y un vocabulario congelado de 131.072 entradas, con una precisión de pesos inferior a 2 bits por parámetro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con GQA (24 cabezas, 2 KV heads), RoPE, RMSNorm, embeddings atados |
| Parametros totales | 250 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de atención + archivo offline de hasta 100 millones de tokens |
| Tipos de cuantizacion | Cuantizacion propia de bajo bit (<2 bits por peso), no se publican formatos estandar (GGUF, etc.) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | .shdw (propietario) para pesos, .npy para vocabulario; binarios precompilados para Windows y Linux |

## Arquitectura y entrenamiento

SHADOW 250M Instruct es un transformer decoder con 10 capas, hidden size de 1536, 24 cabezas de atención con GQA (2 cabezas KV), head dim 64, y una capa intermedia SwiGLU de 4224. Usa RoPE con theta 10.000, RMSNorm con epsilon 1e-6 (incluyendo QK-Norm) y embeddings atados. El vocabulario de 131.072 entradas está congelado, es decir, no tiene parámetros entrenables. La innovación principal es el archivo offline: un caché comprimido de hasta 100 millones de tokens que se almacena en disco y se consulta mediante recuperación (k=16 por defecto). El modelo fue entrenado desde el paso 1 para recuperar hechos de este archivo, pero no para razonar sobre los tokens almacenados; solo los lee y los devuelve.

El entrenamiento consistió en 30 mil millones de tokens de texto web en inglés, seguidos de 0,7 mil millones de tokens de ajuste por instrucciones. No se menciona el uso de RLHF o DPO. La precisión de los pesos es inferior a 2 bits por parámetro, lo que explica el tamaño reducido de 52 MB para los pesos. El runtime incluye un kernel CPU propio con soporte AVX2/AVX-512, sin dependencias externas.

## Capacidades

- Generacion de texto en ingles con calidad medida en perplejidad 23,3 sobre texto web retenido (ventana de 2.048 tokens).
- Chat e instrucciones: el modelo responde a prompts conversacionales y sigue instrucciones simples, como se muestra en los ejemplos de la model card.
- Recuperacion de hechos desde archivo offline: puede extraer informacion especifica de un corpus de hasta 100 millones de tokens almacenado en disco, con una tasa de exito alta en tareas de "needle in a haystack" (0,98 a 100M tokens).
- Fine-tuning en una sola GPU: el autor demuestra un ajuste de 90 minutos en GPU de portatil para convertir el modelo en un asistente pirata, sin degradar los benchmarks.
- Ejecucion en CPU: no requiere GPU para inferencia; corre a 400 tokens/s en un portatil con 8 nucleos fisicos.
- Bajo consumo de memoria: aproximadamente 80 MB de RAM durante el chat, lo que permite su uso en dispositivos embebidos o entornos muy restringidos.
- No soporta tool calling, vision, audio ni otros modos especiales; es exclusivamente texto.

## Casos de uso

- Asistente de chat en dispositivos sin GPU: un robot de conversacion en ingles que se ejecuta en un portatil o un mini-PC con solo 80 MB de RAM, ideal para prototipos o aplicaciones de bajo coste.
- Recuperacion de informacion de grandes corpus locales: dado un archivo de documentos (por ejemplo, manuales tecnicos o bases de conocimiento), el modelo puede responder preguntas factuales extrayendo datos de hasta 100 millones de tokens, sin necesidad de indexar ni usar un RAG complejo.
- Generacion de texto en ingles para contenido corto: redaccion de parrafos, poemas o respuestas a prompts creativos, con control de temperatura y top-k.
- Fine-tuning especifico de dominio: al poder ajustarse en una sola GPU y exportarse a un modelo de 52 MB, es adecuado para crear asistentes personalizados (por ejemplo, un bot de soporte para una empresa) que luego se despliegan en CPU.
- Educacion y experimentacion: por su tamano reducido y licencia MIT, sirve como base para ensenar conceptos de transformers, cuantizacion extrema y sistemas de recuperacion en cursos de IA.
- Aplicaciones de bajo consumo energetico: en entornos donde el uso de GPU es inviable o costoso, como dispositivos IoT o servidores de bajo presupuesto, este modelo ofrece una alternativa funcional para tareas de texto simples.

## Benchmarks y rendimiento

Los benchmarks publicados por el autor, medidos con su propio harness sobre datos retenidos, son los siguientes:

| Prueba | Resultado (acc_norm, zero-shot) |
|---|---|
| PIQA | 0,60 |
| HellaSwag | 0,34 |
| ARC-Easy | 0,41 |
| ARC-Challenge | 0,24 |

Para la recuperacion desde archivo offline, con configuracion por defecto (k=16, exact match):

| Tarea | 1M tokens | 10M tokens | 100M tokens |
|---|---|---|---|
| Needle in a haystack (5 profundidades) | 0,98 | 0,98 | 0,98 |
| Needle con distractores similares | 1,00 | 1,00 | – |
| Multi-key needles | 1,00 | 1,00 | – |
| Two-hop variable tracking | 1,00 | 1,00 | – |
| Hechos dispersos en historia, gana el ultimo | 1,00 | 1,00 | – |
| Fact QA (6 tipos de tarea con abstencion) | 0,97 | 0,95 | 0,83 |

Rendimiento en CPU (portatil con 8 nucleos fisicos):

| Metrica | Valor |
|---|---|
| Velocidad de decodificacion (8 hilos) | 402 tokens/s |
| Velocidad de decodificacion (4/2/1 hilos) | 393 / 275 / 158 tokens/s |
| Velocidad de prefill | 409 tokens/s |
| RAM durante el chat | ~80 MB |
| Construccion del indice del archivo (1M/10M/100M) | 2 s / 21 s / 3,2 min |
| Recuperacion por pregunta (10M/100M) | 37 ms / 435 ms |
| Pregunta al archivo, extremo a extremo (100M) | 0,45 s |

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU. El modelo corre en un portatil con 8 nucleos fisicos a 400 tokens/s, y tambien funciona con menos hilos (158 tokens/s con 1 hilo).
- RAM: aproximadamente 80 MB durante el chat, mas el espacio en disco para el archivo offline (el tamano del archivo depende del corpus, pero el indice se construye en memoria).
- GPU: no necesaria para inferencia. Para fine-tuning, el autor indica que se puede hacer en una sola GPU de portatil (no especifica VRAM, pero al ser 250M de parametros, cabe en GPUs con 4-6 GB).
- Despliegue: se incluyen binarios precompilados para Windows y Linux en el repositorio. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI; el runtime es propio y no requiere framework.
- Latencia: la recuperacion de un hecho desde un archivo de 100M tokens tarda 0,45 s de extremo a extremo, y la decodificacion es de ~2,5 ms por token.

## Comparativa con modelos similares

| Modelo | Parametros | Peso en disco | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| GPT-2 | 124M | 548 MB | 1024 tokens | MIT | safetensors |
| SmolLM2-135M-Instruct | 135M | 269 MB | 2048 tokens | Apache 2.0 | safetensors |
| SmolLM2-360M-Instruct | 360M | 724 MB | 2048 tokens | Apache 2.0 | safetensors |
| Qwen2.5-0.5B-Instruct | 494M | 988 MB | 32K tokens | Apache 2.0 | safetensors |
| **SHADOW 250M Instruct** | **250M** | **60 MB** | **2K + archivo 100M** | **MIT** | **.shdw** |

SHADOW destaca por su peso extremadamente reducido (60 MB frente a 269 MB del SmolLM2-135M) y por su capacidad de recuperacion de contexto largo via archivo offline, algo que ninguno de los otros modelos ofrece. Sin embargo, su ventana de atencion directa es limitada (2.048 tokens) y solo soporta ingles.

## Limitaciones y advertencias

- El modelo no esta entrenado para razonar sobre los tokens del archivo offline; solo recupera hechos y los devuelve. No puede hacer inferencias complejas ni seguir cadenas de razonamiento a traves de multiples documentos.
- Solo soporta ingles; no hay capacidad multilingue.
- La calidad de generacion es limitada en comparacion con modelos mas grandes: los benchmarks estandar (PIQA 0,60, HellaSwag 0,34) son bajos, y la perplejidad de 23,3 indica que no es adecuado para tareas que requieran coherencia larga o conocimiento profundo.
- El formato de pesos es propietario (.shdw) y el runtime es un binario precompilado; no se integra con ecosistemas estandar como Hugging Face Transformers, vLLM o llama.cpp, lo que puede dificultar su adopcion en pipelines existentes.
- No se han publicado datos sobre sesgos, alucinaciones o comportamientos toxicos. Al ser un modelo pequeno entrenado en texto web, es probable que herede sesgos comunes, pero no hay evaluacion disponible.
- La cuantizacion extrema (<2 bits por peso) puede provocar perdidas de precision en tareas delicadas; el autor no reporta metricas de degradacion frente a una version de mayor precision.
- Para uso comercial, la licencia MIT es permisiva, pero el modelo solo genera texto en ingles y su rendimiento en tareas complejas es limitado.

## Enlaces

- Hugging Face: https://huggingface.co/NODEMIND/SHADOW-250M
- Repositorio GitHub (autor): https://github.com/nodemind611/SHADOW-250M-Instruct
- Repositorio GitHub (copia): https://github.com/QLNI/SHADOW-250M-Instruct
- Pagina de NODEMIND en Nokast: https://www.nokast.com/nodemind
