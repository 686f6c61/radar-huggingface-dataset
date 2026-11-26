# PasinduManujaya/gpt2-reuters-scratch

## Resumen

GPT-2 Reuters Scratch es un modelo de lenguaje de tipo GPT-2 entrenado desde inicialización aleatoria por el usuario PasinduManujaya sobre un corpus de artículos de la agencia Reuters. No se trata de un ajuste fino del GPT-2 original de OpenAI, sino de un entrenamiento completo desde cero con una arquitectura reducida (6 capas y dimensión de embedding de 256), lo que da un total de 18.116.608 parámetros. El modelo se distribuye en formato safetensors y ocupa 0,2 GB en el repositorio.

El modelo resuelve una tarea acotada: la modelización de lenguaje sobre texto periodístico de Reuters (título y cuerpo). Su relevancia es fundamentalmente educativa y experimental: sirve para estudiar el comportamiento de un transformer pequeño entrenado sobre un dominio concreto y para reproducir experimentos de scaling y ablaciones (número de épocas, número de capas). No está pensado como un modelo de propósito general ni como base para aplicaciones en producción.

La model card documenta tres ejecuciones (A_baseline, B_epochs2 y C_layers2) con distintas configuraciones y pérdidas de validación y test, lo que permite comparar el efecto del número de épocas y de capas. No se proporciona información sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 18.116.608 (run A y B); 14.957.568 (run C) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con la arquitectura GPT-2 estándar, pero con una configuración reducida: 6 capas y dimensión de embedding de 256 en las ejecuciones A y B, y 2 capas con la misma dimensión en la ejecución C. El entrenamiento parte de inicialización aleatoria sobre el dataset `ingeniumacademy/reuters_articles`, compuesto por título y cuerpo de artículos de Reuters, y utiliza el tokenizador `ingeniumacademy/gpt2-reuters-tokenizer`. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no disponible).

La model card recoge tres ejecuciones con sus hiperparámetros principales y sus pérdidas:

| Run | Capas | Dimensión | Épocas | Parámetros | Tiempo de entrenamiento (min) | Pérdida validación | Pérdida test |
|---|---|---|---|---|---|---|---|
| A_baseline | 6 | 256 | 5 | 18.116.608 | 8,21 | 4,3762 | 4,1607 |
| B_epochs2 | 6 | 256 | 2 | 18.116.608 | 3,32 | 4,9853 | 4,7524 |
| C_layers2 | 2 | 256 | 5 | 14.957.568 | 6,39 | 4,5421 | 4,3221 |

Los tiempos de entrenamiento (entre 3 y 8 minutos) indican un corpus y unos recursos de cómputo modestos. La comparación entre A y B muestra que reducir de 5 a 2 épocas empeora la pérdida de validación en aproximadamente 0,61 y la de test en aproximadamente 0,59. La comparación entre A y C muestra que reducir de 6 a 2 capas empeora la pérdida de validación en aproximadamente 0,17 y la de test en aproximadamente 0,16.

## Capacidades

- Generación de texto autoregresiva sobre texto periodístico en el estilo del corpus Reuters de entrenamiento.
- Modelización de lenguaje: cálculo de perplejidad y pérdida sobre texto del mismo dominio.
- Continuación de titulares y cuerpos de noticias, limitada al registro y vocabulario vistos en entrenamiento.
- No se documenta soporte de tool calling ni function calling (no disponible).
- No se documenta soporte de agentes ni razonamiento multi-paso (no disponible).
- Capacidades multilingües: no disponibles; el tokenizador y el corpus no están descritos en cuanto a cobertura de idiomas.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Experimentación académica sobre scaling: comparar las ejecuciones A, B y C permite estudiar el efecto del número de épocas y de capas sobre la pérdida de validación y test en un dominio fijo, con tiempos de entrenamiento de pocos minutos.
- Reproducción de pipelines de entrenamiento desde cero: sirve como referencia para validar tokenizadores, scripts de entrenamiento y evaluación sobre un corpus periodístico concreto.
- Generación de texto de dominio restringido: continuación de titulares o párrafos con el estilo de Reuters, útil para demostraciones de modelización de lenguaje en el aula.
- Evaluación de tokenizadores específicos de dominio: al usar `ingeniumacademy/gpt2-reuters-tokenizer`, permite medir el impacto de un tokenizador adaptado al corpus frente a uno genérico.
- Pruebas de infraestructura de inferencia: con 18 M de parámetros y 0,2 GB de pesos, es adecuado para validar despliegues ligeros con transformers o llama.cpp en entornos con recursos mínimos.
- Estudio de sobreajuste y regularización: la diferencia entre las pérdidas de validación y test de cada ejecución permite analizar el comportamiento del modelo con distintas configuraciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación y test para las tres ejecuciones (véase la tabla de la sección de arquitectura y entrenamiento).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (18 M de parámetros, pesos de 0,2 GB en el repositorio); en cuantización de 8 bits o 4 bits, el requisito es aún menor (no se documentan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; también es viable en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060, RTX 4090, así como en hardware integrado.
- Opciones de despliegue: transformers (según el ejemplo de la model card con `GPT2LMHeadModel` y `AutoTokenizer`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: no disponibles; por el tamaño del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GPT-2 Reuters Scratch (este modelo) | 18,1 M (14,9 M en run C) | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay datos de benchmarks de este modelo que permitan comparar rendimiento. Frente a GPT-2 small, este modelo tiene aproximadamente una séptima parte de parámetros y está especializado en un dominio concreto (Reuters), mientras que GPT-2 small es de propósito general y con licencia conocida. No se dispone de información sobre modelos comparables entrenados desde cero sobre el mismo corpus.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un corpus periodístico concreto, puede reproducir sesgos presentes en ese corpus.
- Riesgo de alucinación: alto en generación libre; el modelo es pequeño y está entrenado sobre un dominio estrecho, por lo que puede producir texto plausible pero factualmente incorrecto.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y los idiomas soportados no están especificados; el uso fuera del dominio Reuters probablemente degrade la calidad.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier uso en producción.
- Caveats para producción: no hay benchmarks, ni documentación de cuantizaciones, ni pipeline declarado; las pérdidas de validación y test (en torno a 4,2-5,0) son elevadas en términos absolutos, lo que sugiere una calidad de generación limitada.
- El repositorio contiene ejecuciones adicionales en subcarpetas (`runs/B_epochs2`, `runs/C_layers2`), lo que requiere indicar el subfolder correcto al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PasinduManujaya/gpt2-reuters-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
