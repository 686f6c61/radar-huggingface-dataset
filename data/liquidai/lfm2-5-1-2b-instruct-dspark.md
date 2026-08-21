# LiquidAI/LFM2.5-1.2B-Instruct-DSpark

## Resumen

LFM2.5-1.2B-Instruct-DSpark es un modelo drafter (borrador) de decodificación especulativa desarrollado por Liquid AI, diseñado para acelerar la inferencia del modelo objetivo LFM2.5-1.2B-Instruct. Pertenece a la familia DSpark, que adapta el algoritmo de decodificación especulativa DSpark a la arquitectura LFM2.5. Con solo 295,7 millones de parámetros, este drafter propone bloques de tokens que el modelo objetivo verifica, logrando una aceleración de hasta 2,1x en GPU (H100) y 2,54x en Apple Silicon (M4 Max) sin degradar la calidad de la salida, ya que la verificación es exacta.

El modelo se publicó en agosto de 2026 y está disponible en Hugging Face bajo la licencia lfm1.0. Su relevancia radica en que permite ejecutar modelos de 1,2B parámetros de forma mucho más rápida, tanto en centros de datos como en dispositivos de borde, lo que facilita aplicaciones de agentes en tiempo real y despliegues locales. Es un componente complementario, no un modelo autónomo: requiere el modelo objetivo para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de 5 capas full attention, hidden_size=2048, intermediate_size=6144, GQA (32 heads, 8 KV heads, head_dim=64), Markov head (rank 256) + confidence head |
| Parametros totales | 295.725.953 (BF16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo LFM2.5-1.2B-Instruct) |
| Tipos de cuantizacion | No disponible (solo se menciona BF16) |
| Idiomas soportados | No disponibles |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en DSpark. Su arquitectura consta de un backbone de 5 capas de atención completa con hidden_size de 2048, intermediate_size de 6144 y activación SiLU/SwiGLU. Emplea atención de consultas agrupadas (GQA) con 32 cabezas de atención y 8 cabezas clave/valor, con head_dim de 64. Además, incorpora dos cabezas adicionales: una cabeza Markov de rango 256 y una cabeza de confianza, que permiten proponer bloques de hasta 9 tokens por paso de decodificación.

El entrenamiento se realizó para optimizar la tasa de aceptación de los tokens propuestos por el modelo objetivo LFM2.5-1.2B-Instruct. No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens utilizados. La innovación principal es el algoritmo DSpark, que combina la predicción de tokens con un mecanismo de confianza para mejorar la eficiencia de la decodificación especulativa, reduciendo el cuello de botella de memoria en la fase de decodificación.

## Capacidades

- Decodificación especulativa exacta: el modelo objetivo verifica cada token propuesto, por lo que la salida generada es idéntica a la que produciría el modelo objetivo sin el drafter.
- Aceleración de inferencia: en SGLang, la decodificación es aproximadamente 2 veces más rápida en GPU y hasta 2,87 veces en Apple Silicon (M4 Max) según benchmarks.
- Compatibilidad con el modelo objetivo LFM2.5-1.2B-Instruct, que es un modelo instruct optimizado para chat, seguimiento de instrucciones y tool calling.
- Soporte para despliegue en dispositivos de borde: funciona en Apple Silicon mediante el backend Metal.
- Integración con SGLang y llama.cpp (código abierto upstream).
- No es un modelo de generación autónoma: no tiene capacidades propias de razonamiento, código o visión; todas las capacidades funcionales provienen del modelo objetivo.

## Casos de uso

- Inferencia en tiempo real en dispositivos Apple Silicon: el drafter permite ejecutar LFM2.5-1.2B-Instruct en un MacBook con M4 Max a una velocidad de 350 tok/s (frente a 138 tok/s sin drafter), lo que habilita asistentes conversacionales locales con baja latencia.
- Despliegue de agentes en el borde: al reducir la latencia de decodificación, es adecuado para aplicaciones de agentes que requieren múltiples pasos de razonamiento y tool calling en dispositivos con recursos limitados.
- Servidores de inferencia de alto rendimiento: en GPUs como H100, el drafter eleva el throughput de 656 a 1384 tok/s (media), permitiendo atender más peticiones concurrentes con el mismo hardware.
- Aplicaciones de chat y asistencia en producción: al mantener la calidad exacta del modelo objetivo, se puede integrar en pipelines existentes sin cambios en la lógica de generación, solo añadiendo el drafter.
- Prototipado rápido en entornos de desarrollo: al acelerar la inferencia, los desarrolladores pueden iterar más rápido sobre prompts y flujos de agentes sin esperar largas respuestas.
- Investigación en decodificación especulativa: sirve como referencia para estudiar la eficiencia de DSpark en modelos pequeños y su transferencia a arquitecturas mayores.

## Benchmarks y rendimiento

La decodificación especulativa es exacta, por lo que los benchmarks de calidad del modelo objetivo se mantienen sin cambios. Los datos de rendimiento se centran en la tasa de aceptación y el speedup.

Tabla de aceptación media de tokens por paso (1xH100, batch size 1, greedy decoding, bloque de tamaño 9, techo 10):

| Benchmark | Tokens aceptados / paso |
|---|---:|
| MATH-500 | 5,78 |
| GSM8K | 4,25 |
| HumanEval | 5,51 |
| MBPP | 5,41 |
| MT-Bench | 3,11 |
| **Media** | **4,81** |

Tabla de speedup en GPU y on-device (aceptación sobre 10, batch size 1):

| Dataset | Aceptación (de 10) | Speedup en H100 | Speedup en M4 Max |
|---|---:|---:|---:|
| MATH-500 | 6,02 | 2,56x (668 → 1712 tok/s) | 2,62x (140 → 366 tok/s) |
| HumanEval | 5,31 | 2,26x (664 → 1499 tok/s) | 2,87x (136 → 389 tok/s) |
| MBPP | 5,52 | 2,37x (667 → 1578 tok/s) | 2,74x (137 → 375 tok/s) |
| GSM8K | 4,34 | 1,67x (624 → 1041 tok/s) | 2,73x (140 → 381 tok/s) |
| MT-Bench | 3,90 | 1,66x (657 → 1091 tok/s) | 1,72x (137 → 237 tok/s) |
| **Media** | **5,02** | **2,10x** (656 → 1384 tok/s) | **2,54x** (138 → 350 tok/s) |

## Requisitos de hardware

- El drafter tiene 295,7M parámetros en BF16, lo que ocupa aproximadamente 0,6 GB (tamaño del repositorio). El modelo objetivo LFM2.5-1.2B-Instruct ocupa alrededor de 2,4 GB en BF16, por lo que el conjunto completo requiere unos 3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el conjunto (por ejemplo, RTX 3060, RTX 4060, etc.). En centros de datos, H100 y A100 son adecuadas para alto throughput.
- En Apple Silicon, funciona con el backend Metal, probado en M4 Max.
- Opciones de despliegue: SGLang (con soporte DSpark, PR #31041), llama.cpp (integración upstream), y posiblemente otros frameworks que soporten decodificación especulativa.
- Latencia y throughput: en H100, el throughput medio pasa de 656 a 1384 tok/s (2,1x); en M4 Max, de 138 a 350 tok/s (2,54x). La latencia por token se reduce proporcionalmente.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que se trata de un drafter específico para un modelo objetivo concreto. Se puede comparar con el propio modelo objetivo sin drafter:

| Modelo | Parametros | Contexto | Rendimiento (H100) | Licencia |
|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (sin drafter) | 1,2B | No disponible | 656 tok/s | lfm1.0 |
| LFM2.5-1.2B-Instruct + DSpark | 1,2B + 295,7M | No disponible | 1384 tok/s | lfm1.0 |

Otros drafters de decodificación especulativa (como EAGLE o Medusa) existen, pero no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo objetivo LFM2.5-1.2B-Instruct para funcionar; no puede generar texto por sí solo.
- La licencia lfm1.0 es una licencia propietaria de Liquid AI; es necesario revisar sus términos para uso comercial, aunque la model card no especifica restricciones adicionales.
- No se han publicado datos sobre sesgos o alucinaciones del drafter; al ser un componente de aceleración, hereda las limitaciones del modelo objetivo.
- La longitud de contexto no está documentada para el drafter; depende del modelo objetivo.
- El soporte de cuantización no está documentado; el drafter se distribuye en BF16, lo que puede limitar su uso en dispositivos con poca memoria.
- La integración con SGLang requiere una versión específica con soporte DSpark (PR #31041), lo que puede complicar el despliegue en entornos con versiones estándar.
- El rendimiento de aceptación varía según la tarea; en benchmarks como MT-Bench, el speedup es menor (1,66x en H100), por lo que no todas las cargas de trabajo se benefician por igual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark
- Modelo objetivo: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Blog de Liquid AI sobre DSpark: https://www.liquid.ai/blog/lfm2.5-dspark
- Blog en Hugging Face: https://huggingface.co/blog/LiquidAI/lfm25-dspark
- Documentación de LFM2.5-1.2B-Instruct: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Playground de Liquid AI: https://playground.liquid.ai/
- Repositorio de SGLang (PR #31041): https://github.com/sgl-project/sglang/pull/31041
