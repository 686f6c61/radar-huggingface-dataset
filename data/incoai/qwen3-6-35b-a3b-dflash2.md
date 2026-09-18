# incoai/Qwen3.6-35B-A3B-DFlash2

## Resumen

Qwen3.6-35B-A3B-DFlash2 es un modelo borrador (draft model) de decodificación especulativa desarrollado por Inco AI para acelerar la inferencia de Qwen/Qwen3.6-35B-A3B, el modelo objetivo del equipo Qwen de Alibaba. No es un modelo de lenguaje autónomo: se ejecuta dentro de un servidor de decodificación especulativa y propone tokens que el modelo objetivo verifica después. El repositorio aloja 526.251.520 parámetros en safetensors bf16 (1,05 GB, 1,1 GB de repositorio) y se distribuye bajo licencia Apache-2.0.

Técnicamente es un borrador de difusión por bloques (block diffusion) de segunda generación: predice un bloque completo de 8 tokens en una sola pasada, conserva los mejores candidatos en cada posición y un selector de rango 256 traza una trayectoria coherente entre ellos. La decodificación es sin pérdida (lossless): la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

Su relevancia actual está en el coste de servir un modelo MoE de 35B parámetros totales: el borrador añade solo ~0,5B parámetros y, según el post de lanzamiento de Splash, permite 210 tokens/s de decodificación en un Apple M5 Pro de 48 GB, 1,7 veces el siguiente motor más rápido medido. El checkpoint publicado proviene del paso 11.600 de un run planificado de 31.935 pasos, detenido de forma temprana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de difusión por bloques (block diffusion) para decodificación especulativa; 6 capas de atención de ventana deslizante (ventana 2048), hidden size 2048, 32 cabezas de consulta, 8 cabezas KV, dimensión de cabeza 128, no causal; convoluciones dinámicas de dos taps (kernel 2, group size 16); selector de rango 256 con top-16 candidatos por posición |
| Parametros totales | 526.251.520 (dato real de safetensors, ~0,53B) |
| Parametros activos | No aplica: el borrador no es MoE. El modelo objetivo Qwen3.6-35B-A3B es un MoE cuya nomenclatura indica 35B totales y 3B activos (cifra no confirmada en la información disponible) |
| Longitud de contexto | No especificada como ventana de inferencia. Entrenado con secuencias de hasta 40.960 tokens; ventana de atención deslizante de 2048 por capa |
| Tipos de cuantizacion | bf16 en el checkpoint publicado; el paquete Splash lo empaqueta en 4 bits junto a su modelo objetivo. GGUF: no disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, config.json + model.safetensors, 1,05 GB, incluye los codebooks del selector) |

## Arquitectura y entrenamiento

El borrador es un transformer no causal de 6 capas con atención de ventana deslizante de 2048 tokens. En lugar de generar tokens de uno en uno, predice un bloque de 8 posiciones por pasada (un ancla más siete tokens predichos) y mantiene los mejores candidatos en cada posición; un selector de rango 256 elige después una única trayectoria coherente sobre esos candidatos. Las convoluciones dinámicas de dos taps (kernel 2, group size 16) en el backbone evitan la degradación de la calidad del borrador hacia el final del bloque. El modelo lee los estados ocultos del objetivo en las capas 1, 6, 11, 16, 22, 27, 32 y 37 de un total de 40, lo que lo ata a la arquitectura concreta de Qwen3.6-35B-A3B.

El entrenamiento lo realizó Inco AI contra Qwen3.6-35B-A3B con aproximadamente 1,5 millones de secuencias de hasta 40.960 tokens, 512 anclas por secuencia y un objetivo combinado de entropía cruzada y L1. El checkpoint publicado corresponde al paso 11.600 de un run de continuación planificado de 31.935 pasos, interrumpido de forma temprana; según el autor, es el que se distribuye con Splash. La innovación principal sobre DFlash (Chen, Liang y Liu, ICML 2026) es el esquema de difusión por bloques con selector y las convoluciones dinámicas, que permiten mantener la aceptación a lo largo de todo el bloque. La decodificación resultante es sin pérdida respecto al objetivo.

## Capacidades

- Generación de tokens especulativa: redacta bloques de 8 tokens que el modelo objetivo Qwen3.6-35B-A3B verifica, con coincidencia exacta en modo greedy y preservación de la distribución en muestreo.
- Aceleración de inferencia del objetivo: reduce el número de pasos de decodificación necesarios sobre Qwen3.6-35B-A3B.
- Predicción paralela de bloques: difusión por bloques en una sola pasada, con selector de trayectoria sobre los top-16 candidatos por posición.
- Integración con motores de servicio: soporte descrito en el blog para SGLang, vLLM, TensorRT-LLM y llama.cpp.
- Empaquetado para Apple silicon: distribuido en 4 bits dentro del paquete Splash, instalable con `brew install incoai/tap/splash` y servible con `splash serve --model incoai/Qwen3.6-35B-A3B-Splash`.
- No dispone de capacidades propias de generación autónoma, tool calling, agentes, visión, audio ni multilingüismo: hereda el comportamiento final del modelo objetivo, que es quien emite la respuesta verificada.

## Casos de uso

- Servicio de alto rendimiento de Qwen3.6-35B-A3B: desplegar el objetivo junto a este borrador en SGLang, vLLM o TensorRT-LLM para elevar el throughput de decodificación sin alterar la salida del modelo grande.
- Inferencia local en Apple silicon: ejecutar el paquete Splash (objetivo en 4 bits + borrador) en un Mac con M5 Pro de 48 GB, donde el autor reporta 210 tokens/s de decodificación en prompts cortos.
- Despliegue en GPUs de consumo: el borrador ocupa ~1,05 GB en bf16, de modo que la limitación de VRAM la marca el objetivo (un MoE de 35B), no el borrador.
- Atención al cliente y chat multi-turno: al reducir el coste por token generado, permite mantener conversaciones largas con el objetivo sin disparar el coste de cómputo por petición.
- Generación de código asistida: el borrador acelera la producción de código del objetivo en IDE o pipelines, manteniendo la salida idéntica a la del modelo grande en modo greedy.
- Procesado por lotes y tareas de resumen: en cargas con muchos documentos y respuestas largas, la ganancia de decodificación se acumula, y el autor reporta 357 tokens/s agregados con cuatro peticiones concurrentes en un M5 Pro.
- Experimentación en decodificación especulativa: servir como referencia reproducible para comparar estrategias de drafting (block diffusion frente a drafters autorregresivos) sobre un mismo objetivo MoE.
- Reducción de coste en endpoints con SLA de latencia: al bajar el número de pasos de decodificación, se puede cumplir un presupuesto de latencia con menos réplicas o GPUs más pequeñas, siempre que el objetivo quepa en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni tablas de longitud de aceptación del borrador).

Los únicos datos de rendimiento publicados corresponden al post de lanzamiento de Splash y miden el modelo empaquetado completo (objetivo + borrador), no el borrador aislado:

| Metrica | Valor | Contexto |
|---|---|---|
| Decodificación en prompts cortos | 210 tokens/s | Apple M5 Pro de 48 GB |
| Comparación con el siguiente motor más rápido | 1,7× | Apple M5 Pro de 48 GB |
| Throughput agregado con 4 peticiones concurrentes | 357 tokens/s | Apple M5 Pro de 48 GB |
| Longitud de aceptación | No disponible | El autor no publica tabla |

## Requisitos de hardware

- VRAM del borrador: ~1,05 GB de pesos en bf16 (dato del repositorio); con activaciones y caché, en torno a 1,5-2 GB estimados. En 4 bits dentro de Splash, ~0,3 GB estimados solo de pesos.
- VRAM del modelo objetivo: Qwen3.6-35B-A3B tiene 35B parámetros totales, lo que implica del orden de 70 GB en bf16 y 18-20 GB en 4 bits (estimaciones a partir del recuento de parámetros, no datos oficiales publicados). El borrador no cambia estos requisitos.
- GPU recomendadas para el objetivo: GPUs de datacenter tipo A100 80 GB o H100 para bf16; para 4 bits, tarjetas de 24 GB o más. El borrador cabe en cualquier GPU que aloje al objetivo.
- Consumer GPU: el borrador sí cabe en cualquier GPU de consumo (incluso integradas); el objetivo en 4 bits puede caber en una RTX 4090 de 24 GB, con el margen de contexto correspondiente.
- Apple silicon: plataforma validada por el autor, con M5 Pro de 48 GB y el paquete Splash en 4 bits.
- Opciones de despliegue: SGLang, vLLM, TensorRT-LLM y llama.cpp según el blog de DFlash 2; Splash como paquete específico para Apple silicon (`brew install incoai/tap/splash`). El repositorio declara `inference: false`, es decir, no está pensado para cargarse como modelo independiente en transformers.
- Latencia y throughput: no publicados para el borrador aislado; los valores end-to-end del paquete completo son los de la tabla anterior (210 tokens/s y 1,7× en M5 Pro de 48 GB).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-DFlash2 | Borrador de difusión por bloques para decodificación especulativa | 526.251.520 | Entrenado con secuencias de hasta 40.960 tokens; ventana deslizante de 2048 | Apache-2.0 | Sin tabla propia de aceptación; 210 tokens/s end-to-end del paquete completo en M5 Pro de 48 GB |
| DFlash (original) | Borrador de difusión por bloques para decodificación especulativa (ICML 2026) | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| EAGLE-3 | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Medusa | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La información proporcionada no incluye datos comparativos de otros borradores (EAGLE-3, Medusa u otras variantes de DFlash), por lo que no es posible establecer una comparación cuantitativa rigurosa de parámetros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo Qwen3.6-35B-A3B y un servidor de decodificación especulativa que soporte su formato; el repositorio marca `inference: false` y no puede usarse con un pipeline estándar de transformers.
- Acoplamiento arquitectónico: el borrador lee los estados ocultos de las capas 1, 6, 11, 16, 22, 27, 32 y 37 del objetivo, por lo que solo funciona con esa arquitectura concreta y no es reutilizable con otros modelos.
- Checkpoint incompleto: el export corresponde al paso 11.600 de un run planificado de 31.935 pasos, detenido de forma temprana; la longitud de aceptación podría mejorar con un entrenamiento completo.
- Ausencia de métricas: no hay tablas publicadas de longitud de aceptación ni de throughput del borrador aislado, lo que dificulta estimar la ganancia real en otros entornos distintos del M5 Pro de 48 GB medido.
- Rendimiento dependiente del hardware y del motor: los 210 tokens/s y el factor 1,7× se midieron en Apple silicon con el paquete Splash; no hay garantía de que se trasladen a GPUs de datacenter u otros motores.
- Idiomas: no se declara lista de idiomas para el borrador; cualquier comportamiento lingüístico (sesgos, cobertura) proviene del modelo objetivo y de sus propios riesgos de alucinación, que el borrador no corrige ni filtra.
- Alucinación y sesgos: al ser decodificación sin pérdida, el borrador no introduce errores adicionales en modo greedy, pero tampoco mitiga los sesgos ni las alucinaciones del objetivo.
- Licencia: Apache-2.0 permite uso comercial del borrador; conviene verificar por separado los términos del modelo objetivo Qwen3.6-35B-A3B y de los motores de inferencia utilizados.
- Requisitos de memoria del objetivo: aunque el borrador es pequeño, el despliegue real sigue necesitando alojar un MoE de 35B parámetros, lo que domina el coste de VRAM.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; el ecosistema de soporte (Splash, kernels para SGLang/vLLM/TensorRT-LLM/llama.cpp) es reciente y puede cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paquete Splash para Apple silicon: https://huggingface.co/incoai/Qwen3.6-35B-A3B-Splash
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Post de lanzamiento de Splash: https://inco.ai/blog/splash/
- Paper original de DFlash (Chen, Liang y Liu, ICML 2026): sin URL en la información disponible. Cita: DFlash: Block Diffusion for Flash Speculative Decoding.
- Instalación: `brew install incoai/tap/splash`
