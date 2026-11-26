# randeepa02/gpt2-reuters-from-scratch

## Resumen
gpt2-reuters-from-scratch es un modelo de lenguaje causal de estilo GPT-2 entrenado desde inicialización aleatoria por el usuario randeepa02 sobre el conjunto de datos Reuters Articles (título y cuerpo concatenados). No es un ajuste fino de un GPT-2 preentrenado, sino un entrenamiento completo desde cero con el objetivo clásico de predicción del siguiente token. Con 30.713.856 parámetros, 6 capas, 6 cabezas de atención y una dimensión de modelo de 384, se sitúa en la categoría de modelos pequeños orientados a experimentación y a tareas de generación de texto especializadas en el dominio periodístico.

El modelo emplea un tokenizador propio, `ingeniumacademy/gpt2-reuters-tokenizer`, y una longitud de contexto muy limitada de 256 tokens. Se entrenó durante 5 épocas con un tamaño de lote de 32 y una tasa de aprendizaje de 0,0005 con decaimiento coseno y un 5 % de calentamiento, completando el entrenamiento en 590,7 segundos. La pérdida de validación fue de 4,1736 (perplejidad 64,95) y la de test de 3,9741 (perplejidad 53,20).

Su relevancia es fundamentalmente didáctica y de investigación: permite estudiar el comportamiento de un transformer causal pequeño entrenado íntegramente sobre un corpus concreto, sin la influencia de datos generales masivos. No está pensado para producción ni para tareas generales, y no se han publicado datos sobre licencia, idiomas soportados ni benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo GPT-2 |
| Parametros totales | 30.713.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estándar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas / cabezas / d_model | 6 / 6 / 384 |
| Tokenizador | ingeniumacademy/gpt2-reuters-tokenizer |
| Dataset de entrenamiento | ingeniumacademy/reuters_articles |
| Epocas | 5 |
| Batch size / LR | 32 / 0,0005 (coseno, 5 % warmup) |
| Tiempo de entrenamiento | 590,7 s |
| Pérdida de validación (ppl) | 4,1736 (64,95) |
| Pérdida de test (ppl) | 3,9741 (53,20) |
| Tamaño del repo | 0,4 GB |

## Arquitectura y entrenamiento
La arquitectura es un transformer causal decoder-only con 6 capas, 6 cabezas de atención y una dimensión de modelo de 384, siguiendo el diseño clásico de GPT-2 en miniatura. El modelo se entrenó desde inicialización aleatoria, sin partir de pesos preentrenados, sobre el dataset `ingeniumacademy/reuters_articles`, concatenando título y cuerpo de cada artículo. El objetivo de entrenamiento es la predicción del siguiente token con entropía cruzada estándar.

El entrenamiento se realizó durante 5 épocas con un tamaño de lote de 32, una tasa de aprendizaje máxima de 0,0005 con decaimiento coseno y un 5 % de calentamiento, completándose en 590,7 segundos. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales. Tampoco se especifica el número total de tokens de entrenamiento ni la composición exacta del corpus más allá de su origen en Reuters. El repositorio incluye archivos de apoyo como `training_summary.json`, `log_history.csv` y `loss_curve.png`.

## Capacidades
- Generación de texto causal autorregresiva con el objetivo de predicción del siguiente token.
- Generación de texto especializada en el dominio periodístico de Reuters (títulos y cuerpos de noticias), gracias a su entrenamiento sobre ese corpus.
- Capacidad limitada de modelado de lenguaje general, dado su tamaño reducido y su entrenamiento exclusivo sobre un dominio concreto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se especifican los idiomas del corpus ni del tokenizador.
- No se documentan capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso
- Experimentación académica con transformers causales pequeños: el modelo sirve como banco de pruebas para estudiar dinámicas de entrenamiento desde cero, curvas de pérdida y convergencia en corpus especializados, con un coste computacional mínimo (menos de 10 minutos de entrenamiento documentados).
- Generación de titulares y texto periodístico sintético en inglés de estilo Reuters: dado su entrenamiento sobre artículos de Reuters, puede generar continuaciones verosímiles de texto noticioso dentro de su dominio, útil para aumentar datos de entrenamiento o para pruebas de sistemas de publicación.
- Evaluación de tokenizadores específicos de dominio: al emplear el tokenizador `ingeniumacademy/gpt2-reuters-tokenizer`, permite comparar el impacto de la tokenización especializada frente a tokenizadores generales en tareas de modelado de lenguaje.
- Reproducción de experimentos de entrenamiento: los archivos `training_summary.json`, `log_history.csv` y `loss_curve.png` permiten reproducir y auditar el proceso de entrenamiento, útil en docencia y en investigación sobre eficiencia de entrenamiento.
- Prototipado rápido de pipelines de generación de texto con `transformers` y `text-generation-inference`: al ser compatible con endpoints y con la librería transformers, se puede desplegar en entornos de prueba con recursos mínimos.
- Estudio de sesgos y limitaciones en modelos pequeños entrenados con datos de agencia: permite analizar cómo un corpus periodístico concreto condiciona el vocabulario, el estilo y los sesgos del modelo generado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento documentados son las pérdidas de validación y test del entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida de validación | 4,1736 |
| Perplejidad de validación | 64,95 |
| Pérdida de test | 3,9741 |
| Perplejidad de test | 53,20 |
| Tiempo de entrenamiento | 590,7 s |
| Épocas | 5 |

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32), dado que el modelo tiene 30,7 millones de parámetros; en fp16 o cuantización de 8 bits ocupa menos de 100 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere hardware de数据中心. Funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: `transformers` (librería nativa), `text-generation-inference` (según los tags del repositorio), y potencialmente `llama.cpp` u `Ollama` si se convierte a GGUF, aunque no se documenta soporte oficial.
- Latencia y throughput estimados: no disponibles; con un contexto de solo 256 tokens y 30,7 M de parámetros, la latencia será muy baja en GPU y aceptable en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gpt2-reuters-from-scratch | 30,7 M | 256 | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1024 | MIT | Hugging Face |

El modelo es sustancialmente más pequeño que GPT-2 small y DistilGPT-2, con un contexto cuatro veces menor. Su ventaja diferencial es el entrenamiento desde cero sobre un corpus específico de Reuters y un tokenizador propio, lo que lo hace adecuado para experimentación de dominio, pero no para tareas generales. No se dispone de benchmarks comparativos de rendimiento.

## Limitaciones y advertencias
- Tamaño muy reducido (30,7 M de parámetros) y contexto de solo 256 tokens, lo que limita severamente la coherencia en generaciones largas y el razonamiento complejo.
- Entrenado exclusivamente sobre artículos de Reuters, por lo que su vocabulario y estilo están sesgados hacia el lenguaje periodístico de agencia; el rendimiento fuera de ese dominio será pobre.
- Riesgo elevado de alucinación y de generación de texto factualmente incorrecto, especialmente al no haber pasado por procesos de alineación como RLHF o DPO.
- No se especifican los idiomas soportados ni la composición lingüística del corpus; se desconoce si maneja otros idiomas además del inglés.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; se recomienda contactar con el autor antes de cualquier uso en producción.
- Sin datos de benchmarks estándar, por lo que no es posible comparar su calidad de forma objetiva con otros modelos.
- El tokenizador es específico del proyecto (`ingeniumacademy/gpt2-reuters-tokenizer`), lo que puede introducir incompatibilidades con pipelines que esperen tokenizadores GPT-2 estándar.
- No apto para producción en tareas de atención al cliente, generación de código o razonamiento, dada su escala y su especialización.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/randeepa02/gpt2-reuters-from-scratch
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
