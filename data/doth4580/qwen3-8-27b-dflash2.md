# doth4580/Qwen3.8-27B-DFlash2

## Resumen

Qwen3.8-27B-DFlash2 es un modelo de draft (borrador) diseñado para acelerar la inferencia del modelo base Qwen/Qwen3.8-27B mediante decodificación especulativa. No es un modelo de lenguaje independiente: se ejecuta dentro de un servidor de decodificación especulativa (SGLang o vLLM) y propone bloques de tokens que el modelo objetivo verifica después. Lo desarrolla el laboratorio z-lab / Inco AI, y este repositorio concreto es un espejo mantenido por doth4580 para el motor veloGB10.

La relevancia de este modelo radica en su técnica de drafting por difusión de bloques (block-diffusion), que predice un bloque completo de tokens en una sola pasada en lugar de token a token. Según las evaluaciones publicadas, alcanza aceleraciones de hasta 3,43× frente a la decodificación autorregresiva en concurrencia 1, y mantiene una ventaja significativa incluso con concurrencia alta. El checkpoint tiene 1.924.404.480 parámetros (1,9B) y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter con convoluciones dinámicas two-tap |
| Parametros totales | 1.924.404.480 (1,9B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (hereda las capacidades del modelo objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 implementa un enfoque de drafting por difusión de bloques. En lugar de predecir un token cada vez, el modelo predice un bloque completo de tokens en una sola pasada y mantiene los mejores candidatos en cada posición. Un selector ligero traza después una única ruta coherente a través de los candidatos. La arquitectura del backbone incorpora convoluciones dinámicas two-tap que evitan que el draft se degrade hacia el final del bloque.

La decodificación es lossless: la salida greedy coincide exactamente con la del modelo objetivo, y el muestreo preserva la distribución original. El modelo se entrena específicamente para servir como drafter del modelo Qwen/Qwen3.8-27B, y no está pensado para ser usado de forma autónoma. Los detalles completos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación) no están disponibles en la información proporcionada.

## Capacidades

- Drafting especulativo de bloques: predice bloques de 7-8 tokens por paso de verificación.
- Decodificación lossless: la salida greedy coincide exactamente con el modelo objetivo.
- Compatibilidad con SGLang mediante el algoritmo `DFLASH` y con vLLM mediante configuración especulativa.
- Soporte para muestreo con los parámetros recomendados de Qwen3.8 (temperature 1.0, top-p 0.95, top-k 20).
- No es un modelo de propósito general: no genera texto, código ni responde preguntas de forma autónoma.

## Casos de uso

- Aceleración de inferencia para Qwen3.8-27B en producción: el caso de uso principal. Se integra en SGLang o vLLM como drafter especulativo, reduciendo la latencia por token entre 2,7× y 3,4× en concurrencia 1.
- Despliegue en entornos con una sola GPU H200: las evaluaciones se realizaron en una NVIDIA H200 con FlashAttention 3, lo que indica que el modelo está pensado para entornos de alta gama.
- Reducción de costes por token en APIs internas: al aumentar el throughput por GPU, se reduce el número de GPUs necesarias para servir el mismo volumen de peticiones.
- Mejora de la experiencia de usuario en chatbots: la menor latencia por token hace que las respuestas largas (hasta 4096 tokens) se perciban como más fluidas.
- Procesamiento por lotes con concurrencia moderada: con concurrencia 8, el speedup se mantiene entre 2,27× y 2,85×, lo que beneficia a sistemas con varias peticiones simultáneas.
- Integración en pipelines de razonamiento extendido: el modelo soporta el modo de razonamiento `xhigh` de Qwen3.8, lo que permite acelerar tareas de matemáticas y código que requieren cadenas de pensamiento largas.

## Benchmarks y rendimiento

Las evaluaciones se realizaron con SGLang en una NVIDIA H200, con FlashAttention 3, bloque de especulación de 8 tokens (7 tokens de draft por paso), muestreo con los parámetros recomendados de Qwen3.8 y máximo de 4096 tokens nuevos. Se comparan tres métodos especulativos: MTP (siete tokens, integrado en Qwen3.8), DSpark (drafter comunitario) y DFlash 2.

| Metrica | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: |
| Acceptance length GSM8K | 5.02 | 4.36 | **5.46** |
| Acceptance length MATH-500 | 4.72 | 3.92 | **5.28** |
| Acceptance length HumanEval | 3.91 | 3.30 | **4.39** |
| Acceptance length MBPP | 3.99 | 3.51 | **4.79** |
| Acceptance length MT-Bench | 3.74 | 3.01 | **4.10** |

Throughput en output tokens por segundo (speedup vs. autorregresivo), concurrencia 1:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 68.9 | 178.5 (2.59×) | 185.3 (2.69×) | **236.1 (3.43×)** |
| MATH-500 | 69.0 | 172.8 (2.51×) | 174.5 (2.53×) | **230.7 (3.34×)** |
| HumanEval | 69.0 | 151.9 (2.20×) | 159.9 (2.32×) | **214.6 (3.11×)** |
| MBPP | 69.0 | 153.1 (2.22×) | 163.3 (2.37×) | **226.9 (3.29×)** |
| MT-Bench | 68.9 | 134.9 (1.96×) | 137.6 (2.00×) | **184.0 (2.67×)** |

Throughput en output tokens por segundo (speedup vs. autorregresivo), concurrencia 8:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 467.2 | 1,022.1 (2.19×) | 1,040.8 (2.23×) | **1,328.7 (2.84×)** |
| MATH-500 | 480.0 | 1,023.5 (2.13×) | 1,025.8 (2.14×) | **1,368.3 (2.85×)** |
| HumanEval | 483.4 | 934.2 (1.93×) | 956.5 (1.98×) | **1,291.5 (2.67×)** |
| MBPP | 478.0 | 938.1 (1.96×) | 974.1 (2.04×) | **1,328.0 (2.78×)** |
| MT-Bench | 480.5 | 835.2 (1.74×) | 802.3 (1.67×) | **1,090.2 (2.27×)** |

Throughput en output tokens por segundo (speedup vs. autorregresivo), concurrencia 32:

| Tarea | Autorregresivo | MTP | DSpark | DFlash 2 |
| :--- | ---: | ---: | ---: | ---: |
| GSM8K | 1,329.8 | 1,381.1 (1.04×) | 1,506.5 (1.13×) | **1,922.5 (1.45×)** |
| MATH-500 | 1,505.8 | 1,415.6 (0.94×) | 1,429.0 (0.95×) | **1,951.8 (1.30×)** |
| HumanEval | 1,546.5 | 1,296.8 (0.84×) | 1,330.1 (0.86×) | **1,799.0 (1.16×)** |
| MBPP | 1,507.7 | 1,314.9 (0.87×) | 1,361.3 (0.90×) | **1,886.8 (1.25×)** |
| MT-Bench | 1,507.4 | 1,159.7 (0.77×) | 1,115.5 (0.74×) | **1,525.3 (1.01×)** |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 3,8 GB en disco, por lo que la VRAM necesaria para el drafter es reducida en comparación con el modelo objetivo. La VRAM total depende del modelo Qwen3.8-27B (que requiere aproximadamente 54 GB en FP16 o 27 GB en cuantización de 4 bits).
- GPU recomendadas: las evaluaciones se realizaron en una NVIDIA H200 con FlashAttention 3. Se requiere una GPU con soporte para FlashAttention 3 para alcanzar el rendimiento publicado.
- GPU de consumo: no se han publicado pruebas en GPUs de consumo como RTX 4090. Dado que el drafter es pequeño (1,9B parámetros), es probable que funcione en GPUs con 8-12 GB de VRAM, pero el modelo objetivo Qwen3.8-27B necesita cuantización para caber en GPUs de consumo.
- Opciones de despliegue: SGLang (algoritmo `DFLASH`) y vLLM (configuración especulativa con método `dflash`). Ambos requieren versiones específicas desde GitHub.
- Latencia y throughput: en concurrencia 1, el throughput alcanza entre 184 y 236 tokens por segundo según la tarea. En concurrencia 8, entre 1.090 y 1.368 tokens por segundo. En concurrencia 32, el speedup se reduce a entre 1,01× y 1,45×.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Metodo |
| :--- | :--- | ---: | ---: | ---: | :--- |
| Qwen3.8-27B-DFlash2 | Drafter especulativo | 1,9B | no disponible | Apache-2.0 | Block-diffusion |
| Qwen3.8-27B MTP (integrado) | Drafter especulativo | no disponible | no disponible | Apache-2.0 | Multi-token prediction |
| RadixArk/Qwen3.8-27B-DSpark | Drafter especulativo | no disponible | no disponible | no disponible | no disponible |

DFlash 2 supera consistentemente a MTP y DSpark en acceptance length y throughput en todas las tareas y niveles de concurrencia evaluados. La ventaja es más pronunciada en concurrencia 1 (hasta 3,43× vs 2,59× de MTP) y se reduce con concurrencia alta, donde el cuello de botella pasa a ser la verificación del modelo objetivo.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo objetivo Qwen/Qwen3.8-27B y un servidor de decodificación especulativa compatible (SGLang o vLLM con soporte para DFLASH).
- Las versiones de SGLang y vLLM necesarias se instalan desde GitHub, no desde los paquetes estables de PyPI. Esto puede introducir inestabilidad en entornos de producción.
- El rendimiento publicado se obtuvo en una NVIDIA H200 con FlashAttention 3. En GPUs sin soporte para FlashAttention 3, los resultados pueden variar significativamente.
- Con concurrencia 32, el speedup se reduce drásticamente (entre 1,01× y 1,45×), e incluso MTP llega a ser más lento que la decodificación autorregresiva en algunas tareas. El beneficio principal se obtiene con concurrencia baja o moderada.
- No se han publicado evaluaciones de calidad del modelo objetivo con este drafter más allá de la garantía de decodificación lossless.
- Este repositorio es un espejo no oficial. Para uso en producción, se recomienda utilizar el repositorio original de z-lab o incoai.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del drafter, ya que estas dependen del modelo objetivo.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2
- Repositorio original: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio de incoai: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio de DFlash en GitHub: https://github.com/z-lab/dflash
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter alternativo DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Guia en HackerNoon: https://hackernoon.com/qwen38-27b-dflash2-a-guide-to-faster-qwen-inference
- Modelo en ModelScope: https://www.modelscope.cn/models/z-lab/Qwen3.8-27B-DFlash2
