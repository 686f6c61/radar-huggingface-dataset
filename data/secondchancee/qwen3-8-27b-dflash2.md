# Secondchancee/Qwen3.8-27B-DFlash2

## Resumen

Qwen3.8-27B-DFlash2 es un modelo de borrador (draft model) diseñado para acelerar la decodificación especulativa del modelo base Qwen/Qwen3.8-27B, un LLM denso multimodal de 27 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba. Este drafter ha sido creado por Inco AI y es la segunda versión de su arquitectura DFlash, basada en difusión por bloques. No es un modelo de lenguaje independiente: se ejecuta dentro de un servidor de decodificación especulativa y genera bloques de tokens candidatos que el modelo objetivo verifica, logrando una aceleración de hasta 3,4 veces respecto a la decodificación autorregresiva sin pérdida de calidad en la salida.

El modelo cuenta con aproximadamente 1,92 mil millones de parámetros (3,8 GB en safetensors) y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que permite reducir significativamente la latencia y aumentar el throughput de inferencia de un modelo de 27B en hardware local o en la nube, manteniendo exactamente la misma distribución de salida que el modelo base. Está pensado para integrarse con motores de inferencia como SGLang y vLLM, que ya soportan el algoritmo DFLASH.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter con selector de trayectoria y convoluciones dinámicas de dos toques |
| Parametros totales | 1.924.404.480 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (hereda los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

DFlash 2 emplea una arquitectura de difusión por bloques para decodificación especulativa. En lugar de predecir token a token, predice un bloque completo de tokens en una sola pasada, manteniendo los mejores candidatos en cada posición. Un selector ligero traza después una trayectoria coherente a través de esos candidatos. El backbone incorpora convoluciones dinámicas de dos toques que evitan que el borrador se degrade hacia el final del bloque. La decodificación es sin pérdida: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribución.

No se dispone de información pública sobre el proceso de entrenamiento (datos, número de tokens, técnicas de alineación) en la documentación proporcionada. El modelo se publica como un checkpoint listo para usar con SGLang o vLLM, y se referencia un paper académico (Chen et al., ICML 2026) que describe la técnica DFlash original.

## Capacidades

- No es un modelo generativo autónomo: su única función es generar borradores de tokens para el modelo base Qwen3.8-27B durante la decodificación especulativa.
- Mantiene exactamente la distribución de salida del modelo objetivo, tanto en modo greedy como en muestreo, garantizando que no altera la calidad del texto generado.
- Compatible con los motores de inferencia SGLang y vLLM mediante la configuración del algoritmo DFLASH.
- Soporta bloques de especulación de hasta 8 tokens (7 tokens de borrador por paso de verificación), según la configuración recomendada.
- Acelera la inferencia en tareas de razonamiento matemático, código, chat y benchmarks generales, como se muestra en las evaluaciones del autor.
- No requiere cambios en el modelo base ni en el prompt; se integra de forma transparente en el servidor de inferencia.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen3.8-27B con DFlash 2 en SGLang reduce el tiempo de respuesta por petición, mejorando la experiencia del usuario en aplicaciones conversacionales interactivas.
- Generación de código en entornos de desarrollo integrado: la aceleración de 3,1× en HumanEval permite autocompletar y generar funciones con menor espera, aumentando la productividad del desarrollador.
- Procesamiento por lotes de razonamiento matemático: en tareas como GSM8K y MATH-500, el throughput a concurrencia 8 alcanza 1.328 y 1.368 tokens/s respectivamente, lo que permite procesar grandes volúmenes de consultas en pipelines de evaluación o tutoría automática.
- Automatización de agentes y workflows multi-paso: al acelerar la generación de razonamiento encadenado (chain-of-thought), DFlash 2 reduce el tiempo de ejecución de agentes que requieren múltiples llamadas al modelo.
- Despliegue en hardware local con GPU consumer: el drafter ocupa solo 3,8 GB, por lo que puede residir en la misma GPU que el modelo base (por ejemplo, una RTX 4090 con 24 GB) sin necesidad de hardware adicional.
- Reducción de costes en inferencia en la nube: al aumentar el throughput por GPU (hasta 2,85× a concurrencia 8), se necesitan menos instancias para servir el mismo tráfico, reduciendo el coste por token generado.

## Benchmarks y rendimiento

Los siguientes datos provienen de la evaluación publicada por el autor (Inco AI), realizada con SGLang en una GPU NVIDIA H200, con FlashAttention 3, bloque de especulación de 8 tokens, muestreo con temperatura 1.0, top-p 0.95 y top-k 20, y un máximo de 4096 tokens nuevos. Se comparan tres métodos de decodificación especulativa: el MTP integrado de Qwen3.8, el drafter comunitario DSpark y DFlash 2. Todos proponen 7 tokens de borrador por paso de verificación.

### Acceptance length (media de tokens aceptados por paso de verificación; mayor es mejor)

| Tarea | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| GSM8K | 5.02 | 4.36 | **5.46** |
| MATH-500 | 4.72 | 3.92 | **5.28** |
| HumanEval | 3.91 | 3.30 | **4.39** |
| MBPP | 3.99 | 3.51 | **4.79** |
| MT-Bench | 3.74 | 3.01 | **4.10** |

### Throughput (tokens de salida por segundo; entre paréntesis, aceleración vs. autorregresivo)

#### Concurrencia 1

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 68.9 | 178.5 (2.59×) | 185.3 (2.69×) | **236.1 (3.43×)** |
| MATH-500 | 69.0 | 172.8 (2.51×) | 174.5 (2.53×) | **230.7 (3.34×)** |
| HumanEval | 69.0 | 151.9 (2.20×) | 159.9 (2.32×) | **214.6 (3.11×)** |
| MBPP | 69.0 | 153.1 (2.22×) | 163.3 (2.37×) | **226.9 (3.29×)** |
| MT-Bench | 68.9 | 134.9 (1.96×) | 137.6 (2.00×) | **184.0 (2.67×)** |

#### Concurrencia 8

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 467.2 | 1,022.1 (2.19×) | 1,040.8 (2.23×) | **1,328.7 (2.84×)** |
| MATH-500 | 480.0 | 1,023.5 (2.13×) | 1,025.8 (2.14×) | **1,368.3 (2.85×)** |
| HumanEval | 483.4 | 934.2 (1.93×) | 956.5 (1.98×) | **1,291.5 (2.67×)** |
| MBPP | 478.0 | 938.1 (1.96×) | 974.1 (2.04×) | **1,328.0 (2.78×)** |
| MT-Bench | 480.5 | 835.2 (1.74×) | 802.3 (1.67×) | **1,090.2 (2.27×)** |

#### Concurrencia 32

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 1,329.8 | 1,381.1 (1.04×) | 1,506.5 (1.13×) | **1,922.5 (1.45×)** |
| MATH-500 | 1,505.8 | 1,415.6 (0.94×) | 1,429.0 (0.95×) | **1,951.8 (1.30×)** |
| HumanEval | 1,546.5 | 1,296.8 (0.84×) | 1,330.1 (0.86×) | **1,799.0 (1.16×)** |
| MBPP | 1,507.7 | 1,314.9 (0.87×) | 1,361.3 (0.90×) | **1,886.8 (1.25×)** |
| MT-Bench | 1,507.4 | 1,159.7 (0.77×) | 1,115.5 (0.74×) | **1,525.3 (1.01×)** |

## Requisitos de hardware

- El drafter ocupa aproximadamente 3,8 GB en FP16 (1,92 mil millones de parámetros), por lo que puede residir en la misma GPU que el modelo base sin necesidad de memoria adicional significativa.
- Para ejecutar Qwen3.8-27B (modelo base) junto con DFlash 2 se recomienda al menos 24 GB de VRAM en FP16 (por ejemplo, una RTX 4090 o A10G). Con cuantización del modelo base (por ejemplo, AWQ o GPTQ), podría caber en GPUs de 16 GB, aunque no se han publicado pruebas al respecto.
- En las evaluaciones del autor se utilizó una NVIDIA H200 con FlashAttention 3, lo que sugiere que GPUs con soporte para FA3 (Hopper o superior) ofrecen el mejor rendimiento.
- Opciones de despliegue: SGLang (recomendado) y vLLM (mediante una rama específica del repositorio). Ambos motores requieren compilar desde el código fuente con el soporte DFLASH.
- Latencia y throughput: a concurrencia 1, se observan entre 184 y 236 tokens/s según la tarea; a concurrencia 8, entre 1.090 y 1.368 tokens/s; a concurrencia 32, entre 1.525 y 1.952 tokens/s (datos del autor con H200).

## Comparativa con modelos similares

En la categoría de drafters para decodificación especulativa de Qwen3.8-27B, se comparan tres opciones:

| Característica | MTP (integrado en Qwen3.8) | DSpark (RadixArk) | DFlash 2 (Inco AI) |
| :--- | :--- | :--- | :--- |
| Parámetros | No publicado | No publicado | 1.924.404.480 |
| Licencia | Apache 2.0 (modelo base) | No disponible | Apache 2.0 |
| Acceptance length media (GSM8K) | 5.02 | 4.36 | **5.46** |
| Throughput a concurrencia 1 (GSM8K) | 178.5 tok/s (2.59×) | 185.3 tok/s (2.69×) | **236.1 tok/s (3.43×)** |
| Throughput a concurrencia 8 (GSM8K) | 1,022.1 tok/s (2.19×) | 1,040.8 tok/s (2.23×) | **1,328.7 tok/s (2.84×)** |
| Integración con SGLang | Nativa | Requiere configuración | Nativa (algoritmo DFLASH) |
| Integración con vLLM | Nativa | No disponible | Mediante rama específica |

DFlash 2 supera consistentemente a MTP y DSpark en acceptance length y throughput en todas las tareas evaluadas, especialmente a baja concurrencia. A alta concurrencia (32), la ventaja se reduce pero sigue siendo positiva, salvo en MT-Bench donde iguala aproximadamente al autorregresivo.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen3.8-27B y un motor de inferencia compatible (SGLang o vLLM con soporte DFLASH). No puede usarse para generar texto por sí solo.
- La compatibilidad con vLLM está limitada a una rama de desarrollo específica (pull request 52816), lo que puede implicar inestabilidad o falta de mantenimiento.
- No se han publicado datos sobre el entrenamiento del drafter, por lo que se desconoce su comportamiento en dominios muy especializados o con distribuciones de datos diferentes a las evaluadas.
- El rendimiento depende del hardware: las cifras de throughput se obtuvieron en una NVIDIA H200 con FlashAttention 3; en GPUs más antiguas (Ampere, Turing) la aceleración puede ser menor.
- La decodificación especulativa añade complejidad operativa: es necesario ajustar el número de tokens de borrador y el tamaño del bloque según la carga de trabajo para evitar degradación del rendimiento a alta concurrencia.
- El modelo base Qwen3.8-27B puede presentar sesgos o alucinaciones inherentes a los LLM; DFlash 2 no mitiga estos problemas, solo acelera la generación.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar la licencia del modelo base y de las dependencias (SGLang, vLLM) antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Secondchancee/Qwen3.8-27B-DFlash2
- Espejo oficial del autor: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Repositorio de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Cloudflare Workers AI sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
