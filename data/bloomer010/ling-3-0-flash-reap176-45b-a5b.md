# bloomer010/Ling-3.0-flash-REAP176-45B-A5B

## Resumen

Ling-3.0-flash REAP176 es un modelo de lenguaje de tipo MoE (mixture of experts) derivado de inclusionAI/Ling-3.0-flash mediante poda selectiva de expertos con el método REAP (Router-weighted Expert Activation Pruning). El autor, bloomer010, ha eliminado el 65,6% de los expertos enrutados por capa (de 512 a 176), reduciendo el número total de parámetros a 46.197 millones, de los cuales solo 5.100 millones están activos por token. El resultado es un modelo más ligero y rápido en inferencia, aunque con una degradación esperada en calidad fuera del dominio de calibración.

Este modelo se presenta como un artefacto de investigación, sin fine-tuning posterior a la poda, y está pensado para estudiar el impacto de la poda de expertos en arquitecturas híbridas tipo BailingMoeV3. Su relevancia radica en demostrar que es posible comprimir modelos MoE de gran tamaño manteniendo una fracción de los parámetros activos, lo que abre vías para el despliegue en entornos con recursos limitados. Sin embargo, al ser una versión muy agresiva de la poda, el autor advierte de una deriva notable en tareas fuera del dominio de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (bailing_hybrid / BailingMoeV3) |
| Parametros totales | 46.196.971.024 (46,2 B) |
| Parametros activos | 5.100 millones (5,1 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); se menciona un repo hermano con builds GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base es inclusionAI/Ling-3.0-flash, una arquitectura MoE híbrida que combina capas de atención con mezclas de expertos (BailingMoeV3). Sobre este modelo, se aplicó una poda one-shot mediante REAP (Router-weighted Expert Activation Pruning), que asigna a cada experto una puntuación basada en el producto del valor de activación del router por la norma L2 de su salida, calculada sobre un conjunto de calibración. Los expertos con menor puntuación se eliminan por completo, sin ningún tipo de fine-tuning o entrenamiento de recuperación.

La calibración se realizó con 1 millón de tokens, distribuidos en 50% ultrachat, 25% wikitext y 25% código. En cada capa se conservaron 176 de los 512 expertos originales, lo que equivale a 22 grupos de 8 expertos (el paso divisible por el tamaño de grupo más cercano al objetivo de 174). El resultado es un modelo con 46,2 B parámetros totales pero solo 5,1 B activos por token, lo que reduce significativamente el coste computacional en inferencia.

## Capacidades

- Generación de texto conversacional: al derivar de Ling-3.0-flash, conserva la capacidad de mantener diálogos multi-turno, aunque la poda puede afectar la coherencia en dominios no calibrados.
- Razonamiento y conocimiento general: se espera un comportamiento similar al modelo base, pero con una deriva mayor en tareas complejas o especializadas.
- Soporte de código: el conjunto de calibración incluye un 25% de datos de código, por lo que mantiene cierta capacidad de generación de código, aunque no se han publicado evaluaciones específicas.
- No se dispone de información sobre tool calling, agentes, visión o audio. El modelo es exclusivamente de texto.

## Casos de uso

- Investigación sobre poda de expertos: el modelo sirve como referencia para estudiar el efecto de la poda agresiva en MoE, comparando su rendimiento con las versiones menos podadas (288, 320, 384 expertos) del mismo sweep.
- Prototipado de sistemas de chat con recursos limitados: al tener solo 5,1 B parámetros activos, puede ejecutarse en GPUs de gama media, permitiendo probar aplicaciones conversacionales sin necesidad de hardware de alta gama.
- Evaluación de degradación fuera del dominio: útil para medir la robustez de modelos podados ante datos no vistos, especialmente en tareas de lenguaje general.
- Generación de código en entornos de baja latencia: gracias a su reducido número de parámetros activos, puede ofrecer respuestas rápidas en asistentes de programación, aunque con menor precisión que el modelo original.
- Análisis de la relación entre densidad de expertos y calidad: permite experimentar con diferentes niveles de poda para encontrar el equilibrio óptimo entre tamaño y rendimiento.
- Despliegue en edge computing: con cuantización GGUF (disponible en el repo hermano), podría ejecutarse en dispositivos con poca memoria, aunque no hay datos oficiales de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo está "mayormente sin probar" y que se espera una deriva notable en tareas fuera del dominio de calibración.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 92,4 GB (tamaño del repo), por lo que se necesitan al menos 2 GPUs de 48 GB (como A6000 o L40S) o una GPU de 80 GB (A100/H100) para cargarlo completo.
- Con cuantización GGUF (no incluida en este repo, pero mencionada en el hermano), podría caber en GPUs de 24 GB (RTX 3090/4090) o incluso 16 GB, dependiendo del nivel de cuantización.
- GPU recomendadas: A100 80GB, H100 80GB, o múltiples GPUs de 48 GB para inferencia en BF16.
- Opciones de despliegue: al ser un modelo de transformers con código personalizado, se puede servir con vLLM o TGI si soportan la arquitectura BailingMoeV3; también es posible usar llama.cpp con los pesos GGUF del repo hermano.
- Latencia y throughput: no disponibles. Dado que solo 5,1 B parámetros están activos, se espera una latencia menor que un modelo denso de 46 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos. El modelo es una variante podada de Ling-3.0-flash, y el autor menciona que existen versiones hermanas con 288, 320 y 384 expertos conservados, pero no se proporcionan datos de rendimiento. Se recomienda consultar el modelo base para una comparativa con alternativas de tamaño similar.

## Limitaciones y advertencias

- Poda muy agresiva: se han eliminado el 65,6% de los expertos, lo que provoca una degradación significativa en tareas fuera del dominio de calibración (ultrachat, wikitext, código).
- Sin fine-tuning posterior: el modelo no ha sido entrenado para recuperar la calidad perdida, por lo que su comportamiento puede ser errático en dominios especializados.
- Riesgo de alucinación: al ser un modelo podado, es probable que aumente la frecuencia de respuestas inventadas o incoherentes, especialmente en contextos largos.
- Licencia no disponible: no se especifica la licencia, por lo que no se puede garantizar su uso comercial.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y la implementación de BailingMoeV3, lo que puede complicar su integración en entornos de producción.
- Sin datos de contexto: se desconoce la longitud máxima de contexto soportada, lo que limita su uso en aplicaciones que requieran ventanas largas.

## Enlaces

- [HuggingFace: bloomer010/Ling-3.0-flash-REAP176-45B-A5B](https://huggingface.co/bloomer010/Ling-3.0-flash-REAP176-45B-A5B)
- [Modelo base: inclusionAI/Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- [Paper REAP: Router-weighted Expert Activation Pruning (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
