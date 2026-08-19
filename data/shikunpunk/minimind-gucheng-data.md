# shikunpunk/MiniMind-GuCheng-Data

## Resumen

MiniMind-GuCheng es un proyecto de investigación del autor shikunpunk que entrena desde cero un generador de poesía en el estilo del poeta chino Gu Cheng (顾城), basado en la arquitectura MiniMind (104M parámetros entrenables, hidden_size=768, 8 capas). El repositorio incluye tres variantes del modelo que comparan tres arquitecturas diferentes: autoregresiva con Softmax Attention (AR), modelo de lenguaje difusivo con atención bidireccional y MDM (dLM), y atención lineal con Gated DeltaNet (Linear). El objetivo principal es mostrar las diferencias de convergencia entre estas arquitecturas bajo los mismos datos y la misma escala.

El entrenamiento utiliza exclusivamente obras reales de Gu Cheng extraídas mediante OCR de 5 PDFs (7.481 muestras de preentrenamiento y 213 muestras de SFT), excluyendo cualquier texto generado por IA. Los resultados cualitativos muestran que la variante AR produce la mejor calidad de generación, mientras que dLM y Linear convergen de forma limitada con un corpus tan reducido. El proyecto tiene un propósito de comparación investigadora más que de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en MiniMind (8 capas, hidden_size=768) con tres variantes: AR (Softmax Attention), dLM (atención bidireccional + MDM), Linear (Gated DeltaNet) |
| Parametros totales | ~104M entrenables |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (especializado en poesía de Gu Cheng) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (fallback); safetensors no confirmado |

## Arquitectura y entrenamiento

El proyecto se basa en MiniMind, una arquitectura mínima de LLM con 104M parámetros entrenables, hidden_size=768 y 8 capas. Se implementan tres variantes: (1) autoregresiva estándar con Softmax Attention, entrenada con preentrenamiento seguido de SFT; (2) modelo de lenguaje difusivo (dLM) con atención bidireccional y MDM (Masked Diffusion Model), entrenado mediante transferencia A2D (autoregressive-to-diffusion); y (3) atención lineal con Gated DeltaNet, entrenada mediante transferencia A2L (autoregressive-to-linear). No se menciona el uso de RLHF ni DPO.

El dataset se compone exclusivamente de obras reales de Gu Cheng extraídas mediante OCR de 5 PDFs: 7.481 muestras de preentrenamiento (poesía, prosa, aforismos y fragmentos de novelas) y 213 muestras de SFT para tareas de continuación y emulación de estilo. El entrenamiento compara cuatro métodos (Pretrain, SFT, dLM, Linear) en términos de datos, coste y calidad de generación, documentado en el archivo TRAINING_COMPARISON.md del repositorio.

## Capacidades

- Generación de poesía en chino en el estilo de Gu Cheng, con la variante AR como la de mayor calidad
- Continuación de texto en modo raw a partir de versos del poeta
- Tareas de emulación de estilo mediante instrucciones en modo chat, por ejemplo "escribe un poema al estilo de Gu Cheng"
- Comparación arquitectónica: las tres variantes permiten estudiar diferencias de convergencia con datos pequeños
- La variante dLM produce salidas cortas o repetitivas; la variante Linear genera texto con caracteres corruptos o repeticiones con este conjunto de datos
- No se documenta soporte de tool calling, agentes, visión ni capacidades multimodales

## Casos de uso

- Investigación académica en arquitecturas de LLM: comparar la convergencia de atención softmax, modelos de difusión y atención lineal bajo los mismos datos y escala, con resultados cualitativos documentados para cada variante.
- Generación asistida de poesía china: la variante AR puede servir como herramienta creativa para componer versos en el estilo de Gu Cheng, ejecutando el script `gen_gucheng_ar.py` con un prompt en modo chat.
- Educación en entrenamiento de LLM: el proyecto demuestra el flujo completo de preentrenamiento y SFT con recursos mínimos, útil para cursos o talleres sobre entrenamiento de modelos desde cero.
- Estudio de transferencia entre arquitecturas: los métodos A2D y A2L muestran cómo reutilizar pesos entrenados de forma autoregresiva en arquitecturas alternativas (difusión y atención lineal), un tema relevante para la investigación en eficiencia.
- Análisis literario computacional: el dataset de obras reales de Gu Cheng (7.481 muestras) puede usarse para estudios estilométricos o de modelado del lenguaje poético chino.
- Prototipado de generadores de texto con datos reducidos: evaluar qué arquitectura funciona mejor cuando el corpus es limitado, con conclusiones aplicables a dominios con pocos datos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La evaluación es cualitativa y comparativa entre las tres variantes: la AR produce poemas completos con imágenes poéticas coherentes, como "和心，它们漂在一边 / 一阵微弱的草上 / 一颗一只船 / 使一群水 / 它在黑夜里溅出 / 淡红的火焰"; la dLM genera salidas de una o dos palabras o frases repetidas; la Linear produce caracteres corruptos o repeticiones. El proyecto documenta curvas de loss y parámetros de entrenamiento en los README de cada subdirectorio.

## Requisitos de hardware

- Pesos del modelo: AR/dLM ≈ 131MB, Linear ≈ 145MB en formato PyTorch
- Inferencia viable en cualquier GPU consumer (RTX 3060 o superior) e incluso en CPU, dada la escala de 104M parámetros
- VRAM estimada: inferior a 2GB para inferencia en FP32
- Entrenamiento desde cero factible en una GPU consumer; el proyecto MiniMind original reporta entrenamiento en aproximadamente 2 horas con una GPU de gama media
- Despliegue mediante los scripts Python incluidos (`gen_gucheng_ar.py`, `gen_gucheng_dllm.py`, `gen_gucheng_linear.py`); no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MiniMind-GuCheng (este) | ~104M | no disponible | no disponible | Generación de poesía china, comparación de 3 arquitecturas |
| MiniMind (jingyaogong) | 64M-104M | no disponible | no disponible | LLM mínimo para entrenamiento desde cero, base arquitectónica de este proyecto |
| Qwen3.8-27B-GuCheng (shikunpunk) | 27B | no disponible | no disponible | Generación de poesía Gu Cheng sobre base Qwen, escala muy superior |

No se dispone de datos de rendimiento comparables entre estos modelos.

## Limitaciones y advertencias

- El dataset es muy reducido (7.481 muestras de preentrenamiento), lo que limita la generalización del modelo fuera del estilo de Gu Cheng
- Las variantes dLM y Linear convergen de forma limitada con estos datos y producen salidas de baja calidad (texto corto, repetitivo o corrupto)
- El modelo solo genera texto en chino y está especializado en un único autor poético
- No se especifica licencia, por lo que el uso comercial es incierto y requiere consultar al autor
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez
- El proyecto es de carácter investigador (comparación de arquitecturas) y no está preparado para producción
- Los pesos se distribuyen en formato PyTorch fallback; no se confirma compatibilidad con frameworks de inferencia estándar como vLLM u Ollama

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shikunpunk/MiniMind-GuCheng-Data
- Dataset de poesía Gu Cheng: https://huggingface.co/datasets/shikunpunk/gucheng-poetry-dataset
- Proyecto MiniMind (base arquitectónica): https://github.com/jingyaogong/minimind
- Otros modelos del autor: https://huggingface.co/shikunpunk/datasets
