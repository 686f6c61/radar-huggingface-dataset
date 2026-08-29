# Anbeeld/Qwen3.5-397B-A17B-DFlash-GGUF

## Resumen

El modelo `Anbeeld/Qwen3.5-397B-A17B-DFlash-GGUF` es una cuantización en formato GGUF del modelo de draft DFlash, desarrollado por Z-Lab en colaboración con Modal y SGLang, y destinado a acelerar la inferencia del modelo de lenguaje de gran escala `Qwen/Qwen3.5-397B-A17B`. No se trata de un modelo de lenguaje independiente, sino de un componente auxiliar que se empareja con el modelo objetivo en un servidor de decodificación especulativa. DFlash emplea un modelo de difusión de bloques ligero que propone múltiples tokens en paralelo, mientras que el modelo principal verifica esas propuestas, mejorando el rendimiento de servicio sin alterar la distribución de salida del modelo objetivo.

Este repositorio concreto, publicado por Anbeeld, ofrece versiones cuantizadas en GGUF del modelo DFlash original, pensadas para su uso con BeeLlama.cpp, un fork de llama.cpp con características avanzadas de cuantización. El modelo base es `z-lab/Qwen3.5-397B-A17B-DFlash`, que a su vez se deriva del modelo `Qwen/Qwen3.5-397B-A17B` mediante un ajuste fino específico para decodificación especulativa. Con aproximadamente 1.300 millones de parámetros, el draft model es sustancialmente más pequeño que el modelo objetivo (397B parámetros totales, 17B activos), lo que permite ejecutarlo en hardware relativamente modesto mientras el sistema completo requiere GPUs de alta gama.

La relevancia de este modelo radica en su capacidad para reducir drásticamente la latencia y aumentar el throughput en el despliegue de modelos MoE de gran tamaño, alcanzando aceleraciones de hasta 4,31x en concurrencia 1 y 2,77x en concurrencia 32 según los benchmarks publicados. Es una pieza clave para entornos de producción que necesitan servir el modelo Qwen3.5-397B-A17B con eficiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de bloques (block diffusion) con atención lineal |
| Parametros totales | 1.291.904.512 (aproximadamente 1,3 mil millones) |
| Parametros activos | No aplicable (modelo denso de difusión, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones variadas, no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

DFlash es un modelo de difusión de bloques diseñado específicamente como modelo de draft para decodificación especulativa. A diferencia de los modelos de lenguaje autorregresivos tradicionales, genera bloques de tokens candidatos en paralelo mediante un proceso de difusión, lo que permite proponer múltiples tokens simultáneamente. El modelo utiliza atención lineal (linear attention) tanto en prefill como en decode, como se desprende de los backends especificados en la configuración de SGLang (`--linear-attn-prefill-backend triton` y `--linear-attn-decode-backend flashinfer`). Esta arquitectura híbrida, que combina difusión con atención lineal, es la clave de su eficiencia: puede generar propuestas de bloques de tokens con un coste computacional muy inferior al de un modelo autorregresivo del mismo tamaño.

El modelo fue entrenado mediante ajuste fino a partir del modelo base `Qwen/Qwen3.5-397B-A17B`, con el objetivo específico de servir como draft model para ese mismo modelo objetivo. Los detalles del entrenamiento, como el número de tokens utilizados o la composición del dataset, no están disponibles en la información proporcionada. El paper asociado (arxiv:2602.06036) describe la metodología completa, incluyendo las innovaciones técnicas como el solapamiento de planificación (overlap scheduling) y la atención de draft con ventana deslizante (sliding-window draft attention), integradas en SGLang a partir del commit `ec36dde58083aca8f26c3740332498a11a06debf`. El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

## Capacidades

- Generación de propuestas de tokens en paralelo mediante difusión de bloques, acelerando la decodificación especulativa del modelo objetivo Qwen3.5-397B-A17B.
- Soporte para decodificación especulativa con bloques de tamaño configurable (4, 8 o 16 tokens), optimizando el equilibrio entre longitud de aceptación y sobrecarga de verificación.
- Integración nativa con SGLang mediante el algoritmo `DFLASH`, incluyendo soporte para planificación solapada (overlap plan stream) y atención de draft con ventana deslizante.
- Compatibilidad con BeeLlama.cpp para despliegue en entornos basados en llama.cpp, con características avanzadas de cuantización.
- No es un modelo de lenguaje autónomo: no genera texto de forma independiente, no tiene capacidades de razonamiento, código o visión por sí mismo. Su única función es proponer tokens candidatos para el modelo principal.
- No se conocen capacidades multilingües específicas, aunque al derivar de Qwen3.5 podría heredar parcialmente el conocimiento lingüístico del modelo base, pero esto no está documentado para el draft model.

## Casos de uso

- Servicio de inferencia de alta concurrencia para Qwen3.5-397B-A17B: el draft model se despliega junto al modelo principal en un servidor SGLang con tensor parallelism 8, permitiendo atender hasta 32 peticiones concurrentes con un throughput significativamente mayor que la línea base autorregresiva (hasta 2,77x a concurrencia 32).
- Reducción de latencia en aplicaciones de chat interactivo: con concurrencia 1, DFlash alcanza aceleraciones de hasta 4,31x en cargas de trabajo como HumanEval, lo que se traduce en respuestas más rápidas para usuarios individuales en entornos de baja carga.
- Optimización de costes de inferencia en la nube: al aumentar el throughput por GPU, se reduce el número de GPUs necesarias para servir el mismo volumen de peticiones, amortizando la inversión en hardware B200.
- Despliegue en entornos con restricciones de memoria mediante cuantización GGUF: el draft model cuantizado (3,1 GB) puede ejecutarse en GPUs con VRAM limitada, aunque el sistema completo sigue requiriendo el modelo principal en alta precisión.
- Evaluación y desarrollo de técnicas de decodificación especulativa: los benchmarks publicados (GSM8K, MATH500, HumanEval, MBPP, MT-Bench) permiten a los investigadores comparar el rendimiento de DFlash frente a MTP y la línea base, facilitando la investigación en eficiencia de inferencia.
- Integración en pipelines existentes de SGLang o llama.cpp: gracias a su compatibilidad con estos frameworks, puede incorporarse a infraestructuras ya desplegadas sin cambios significativos en el código de aplicación.

## Benchmarks y rendimiento

Los benchmarks publicados en la model card del autor miden el throughput (tokens de salida por segundo) y el speedup relativo a la línea base autorregresiva, comparando DFlash con el camino MTP (Multi-Token Prediction) integrado en Qwen3.5. Las mediciones se realizaron en 8x NVIDIA B200 GPUs con tensor parallelism 8, en bfloat16, con decodificación greedy, thinking habilitado y longitud máxima de salida de 4096 tokens.

### Concurrencia 1 (throughput en tok/s y speedup)

| Workload | Baseline | MTP steps=3 | DFlash block=4 | MTP steps=7 | DFlash block=8 | MTP steps=15 | DFlash block=16 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gsm8k | 204.6 (1.00x) | 484.5 (2.37x) | 530.0 (2.59x) | 536.7 (2.62x) | 689.0 (3.37x) | 439.2 (2.15x) | **711.3 (3.48x)** |
| math500 | 204.4 (1.00x) | 505.2 (2.47x) | 551.3 (2.70x) | 589.4 (2.88x) | 762.6 (3.73x) | 499.8 (2.44x) | **831.9 (4.07x)** |
| humaneval | 202.9 (1.00x) | 483.0 (2.38x) | 543.6 (2.68x) | 557.9 (2.75x) | 752.5 (3.71x) | 480.5 (2.37x) | **874.6 (4.31x)** |
| mbpp | 204.6 (1.00x) | 487.4 (2.38x) | 550.3 (2.69x) | 543.7 (2.66x) | 751.2 (3.67x) | 445.6 (2.18x) | **807.8 (3.95x)** |
| mt-bench | 202.6 (1.00x) | 442.9 (2.19x) | 473.6 (2.34x) | 441.5 (2.18x) | **545.9 (2.69x)** | 338.0 (1.67x) | 515.3 (2.54x) |

### Concurrencia 32

| Workload | Baseline | MTP steps=3 | DFlash block=4 | MTP steps=7 | DFlash block=8 | MTP steps=15 | DFlash block=16 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| (datos no disponibles en la información proporcionada, la tabla se corta en la model card) |

Según el texto de la model card, DFlash alcanza hasta 4,31x de speedup a concurrencia 1 y 2,77x a concurrencia 32, superando a MTP en todas las configuraciones probadas. Sin embargo, la tabla completa de concurrencia 32 no se ha incluido en la información disponible.

## Requisitos de hardware

- El draft model en GGUF tiene un tamaño de 3,1 GB, por lo que puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) si se utiliza de forma aislada con BeeLlama.cpp.
- Sin embargo, el sistema completo de decodificación especulativa requiere el modelo objetivo Qwen3.5-397B-A17B, que necesita 8x NVIDIA B200 GPUs con tensor parallelism 8 según la configuración de referencia en SGLang. El draft model se ejecuta en las mismas GPUs, compartiendo memoria con el modelo principal.
- Para producción, se recomienda una imagen CUDA con soporte Blackwell, como `lmsysorg/sglang:v0.5.13-cu130`, e instalar el commit pinneado de SGLang (`ec36dde58083aca8f26c3740332498a11a06debf` o posterior).
- Opciones de despliegue: SGLang con el algoritmo `DFLASH` (requiere tensor parallelism y backends específicos como `trtllm_mha`, `fa4`, `triton` y `flashinfer`), o BeeLlama.cpp para entornos basados en llama.cpp.
- No se dispone de datos de latencia o throughput específicos para el draft model en solitario; los benchmarks miden el sistema completo.

## Comparativa con modelos similares

La alternativa principal dentro del mismo ecosistema es el camino MTP (Multi-Token Prediction) integrado en Qwen3.5-397B-A17B. La tabla de benchmarks muestra que DFlash supera a MTP en todas las configuraciones probadas, tanto a concurrencia 1 como a concurrencia 32 (según el texto de la model card). No se dispone de datos comparativos con otros modelos de draft de otras familias (por ejemplo, los draft models de Llama o Mistral) en la información proporcionada.

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento |
| --- | --- | --- | --- | --- | --- |
| DFlash (este modelo) | Draft por difusión de bloques | 1,3B | No disponible | Apache 2.0 | Hasta 4,31x speedup a concurrencia 1 |
| MTP (Qwen3.5) | Draft autorregresivo multi-token | No disponible | No disponible | Apache 2.0 | Hasta 2,88x speedup a concurrencia 1 |
| Línea base autorregresiva | Modelo completo sin draft | 397B (17B activos) | No disponible | Apache 2.0 | 1,00x (referencia) |

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: no puede generar texto, responder preguntas ni realizar tareas de razonamiento por sí solo. Intentar usarlo como un modelo de chat o generación dará resultados sin sentido.
- Requiere el modelo objetivo Qwen3.5-397B-A17B y un servidor de inferencia compatible (SGLang con soporte DFLASH o BeeLlama.cpp). Sin esa infraestructura, el modelo es inútil.
- La configuración de despliegue es compleja: requiere tensor parallelism, backends específicos (trtllm_mha, fa4, flashinfer) y un commit concreto de SGLang. No es adecuado para usuarios sin experiencia en despliegue de modelos a gran escala.
- Los benchmarks se realizaron en hardware Blackwell (B200); el rendimiento en otras GPUs puede variar significativamente, especialmente en cuanto a la velocidad de la atención lineal y la difusión.
- No se han publicado evaluaciones de calidad de texto, sesgos o alucinaciones, ya que el modelo no genera texto directamente. Los riesgos de sesgo y alucinación dependen del modelo objetivo, no de este draft.
- La licencia Apache 2.0 permite uso comercial, pero el uso efectivo requiere también cumplir con las licencias del modelo objetivo y del software de servidor (SGLang, BeeLlama.cpp).
- La información sobre idiomas soportados y longitud de contexto no está disponible, lo que limita la evaluación de su aplicabilidad en escenarios multilingües o de contexto largo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Anbeeld/Qwen3.5-397B-A17B-DFlash-GGUF
- Modelo base DFlash: https://huggingface.co/z-lab/Qwen3.5-397B-A17B-DFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Paper: https://arxiv.org/abs/2602.06036
- Repositorio GitHub DFlash: https://github.com/z-lab/dflash
- Blog del proyecto: https://z-lab.ai/projects/dflash
- Repositorio espejo en Modal: https://huggingface.co/modal-labs/Qwen3.5-397B-A17B-DFlash
- Repositorio espejo en LMSYS: https://huggingface.co/lmsys/Qwen3.5-397B-A17B-DFlash
- BeeLlama.cpp (fork de llama.cpp): https://github.com/Anbeeld/beellama.cpp
