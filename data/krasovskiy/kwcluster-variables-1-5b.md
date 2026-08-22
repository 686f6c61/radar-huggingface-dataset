# Krasovskiy/kwcluster-variables-1.5b

## Resumen

El modelo `Krasovskiy/kwcluster-variables-1.5b` es un adaptador LoRA desarrollado por Andrey Krasovskiy sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Su función es clasificar palabras individuales dentro de consultas de búsqueda en seis categorías semánticas: `BRAND`, `PRODUCT`, `PAY`, `GEO`, `OFFER` y `WORD`. Está diseñado para sustituir a un modelo de gran tamaño (Qwen2.5-14B-Instruct) en la etapa de etiquetado de variables dentro de un sistema de clustering semántico, reduciendo drásticamente el tiempo de procesamiento y los requisitos de hardware.

El adaptador se presenta como un clasificador de secuencias (text-classification) y no como un modelo generativo: la cabeza de lenguaje del modelo base no se modifica, solo se entrena una cabeza de clasificación. La entrada consiste en una palabra junto con hasta cinco consultas reales donde aparece, separadas por el delimitador ` | `. Esta información contextual es imprescindible para desambiguar términos ambiguos (por ejemplo, «quatro» como número o como nombre de juego).

El modelo se entrenó con 3978 palabras reales extraídas de consultas de búsqueda, con un desglose por clases que incluye 1921 marcas, 1298 juegos, 707 palabras comunes y geográficas, y 52 términos de pago y condiciones. Los resultados reportados en la validación (723 palabras) indican una precisión general del 91% y un macro F1 de 0.822. Su relevancia actual radica en ofrecer una alternativa ligera y rápida para tareas de análisis SEO y procesamiento de consultas, con una latencia de 7 segundos en una RTX 4090 frente a la hora que requería el modelo de 14B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (cabeza de clasificación) |
| Parametros totales | No disponible (modelo base: 1.5B; adaptador: 4.4M entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo usa truncación a 64 tokens) |
| Tipos de cuantizacion | No disponible (el ejemplo usa bfloat16) |
| Idiomas soportados | Inglés (principal), con términos multilingües en clases específicas (pago, ofertas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA con r=16 aplicado a las proyecciones de atención del modelo base Qwen2.5-1.5B-Instruct. Se añade una cabeza de clasificación con 6 salidas (una por clase). El entrenamiento se realizó con 3978 palabras, cada una acompañada de hasta cinco consultas reales de búsqueda donde aparece la palabra. El conjunto de datos incluye marcas verificadas (1921), nombres de juegos de catálogos oficiales (1298), palabras comunes y geográficas de un corpus de 11 millones de observaciones (707) y términos de pago y condiciones (52). Se aplicaron pesos de clase suavizados (raíz cuadrada de la frecuencia inversa) para evitar que las clases mayoritarias dominaran. Se entrenaron seis épocas y se guardó la mejor versión según la métrica de validación. No se utilizaron técnicas de RLHF ni DPO; es un fine-tuning supervisado clásico.

## Capacidades

- Clasificación de palabras en seis categorías: `BRAND`, `PRODUCT`, `PAY`, `GEO`, `OFFER` y `WORD`.
- Entrada contextual: acepta una palabra y hasta cinco consultas de búsqueda asociadas, lo que permite desambiguar términos polisémicos.
- No es generativo: no produce texto, solo devuelve una etiqueta de clase.
- Soporta términos multilingües en las clases de pago y ofertas (por ejemplo, `einzahlung`, `freispiele`, `tiradas`, `rodadas`).
- Optimizado para velocidad y bajo consumo de recursos: funciona en GPUs como T4 y RTX 4090.
- Integrable en pipelines de procesamiento de consultas mediante la librería `peft` de Hugging Face.

## Casos de uso

- Clustering semántico de consultas de búsqueda: el modelo etiqueta cada palabra de una consulta para agrupar páginas web por intención, reemplazando a modelos grandes en la capa de variables.
- Análisis SEO de sitios web: permite identificar rápidamente qué palabras de un conjunto de consultas corresponden a marcas, productos, geolocalización, ofertas o condiciones de pago, facilitando la estructuración de contenidos.
- Automatización de marcado de entidades en pipelines de marketing digital: al ser ligero, puede ejecutarse en tiempo real sobre flujos de datos de búsqueda sin necesidad de infraestructura costosa.
- Filtrado y categorización de palabras clave para campañas publicitarias: ayuda a separar términos genéricos de términos de marca o producto, mejorando la segmentación.
- Monitorización de competencia en nichos específicos (por ejemplo, juegos de azar): el modelo está entrenado con datos de esa industria y puede aplicarse a análisis de posicionamiento.
- Sustitución de modelos de gran tamaño en tareas de clasificación de entidades: reduce el coste computacional y la latencia en entornos de producción con restricciones de hardware.

## Benchmarks y rendimiento

La model card reporta resultados sobre una muestra de validación de 723 palabras, con división por palabra (cada palabra pertenece íntegramente a entrenamiento o validación). Las clases pequeñas tienen una mayor proporción en la validación.

| Clase | F1 | Precisión | Recall | Ejemplos |
|---|---|---|---|---|
| PRODUCT | 0.97 | 0.96 | 0.97 | 228 |
| BRAND | 0.93 | 0.92 | 0.94 | 339 |
| GEO | 0.92 | 0.91 | 0.94 | 31 |
| WORD | 0.79 | 0.83 | 0.75 | 108 |
| PAY | 0.67 | 0.67 | 0.67 | 9 |
| OFFER | 0.67 | 1.00 | 0.50 | 8 |

Precisión general: 91%. Macro F1: 0.822.

En comparación con el modelo Qwen2.5-14B-Instruct, que tardaba una hora en procesar 4141 palabras y requería 9.3 GB de VRAM (no cabía en una T4 gratuita), este adaptador procesa las mismas palabras en 7 segundos en una RTX 4090 y funciona en una T4. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no se especifica, pero al ser un adaptador sobre un modelo de 1.5B, se puede inferir que requiere menos de 4 GB en cuantización ligera (el ejemplo usa bfloat16).
- GPU recomendadas: T4 (funciona), RTX 4090 (7 segundos para 4141 palabras). También debería funcionar en GPUs con al menos 4-6 GB de VRAM.
- Compatible con GPUs de consumo: sí, siempre que tengan suficiente memoria para el modelo base (1.5B) más el adaptador.
- Opciones de despliegue: se puede usar con `transformers` y `peft` en Python. No se mencionan otras herramientas como vLLM u Ollama.
- Latencia: 7 segundos para 4141 palabras en RTX 4090 (aproximadamente 0.0017 segundos por palabra). Throughput no especificado.

## Comparativa con modelos similares

La comparativa se limita a la información proporcionada en la model card, que contrasta este adaptador con el modelo grande que reemplaza.

| Modelo | Parámetros | Contexto | Rendimiento (F1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kwcluster-variables-1.5b (adaptador) | 4.4M entrenables (base 1.5B) | No disponible | Macro F1 0.822 | Apache-2.0 | Hugging Face |
| Qwen2.5-14B-Instruct (sin adaptador) | 14B | No disponible | No reportado | Apache-2.0 | Hugging Face |

No se dispone de comparaciones con otros clasificadores de entidades o modelos de clasificación de consultas en la información proporcionada.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo está entrenado principalmente con datos de la industria del casino y juegos de azar. Las clases `BRAND` y `GEO` pueden transferirse a otros dominios, pero `PRODUCT` depende de los nombres de juegos de ese sector.
- Cobertura lingüística limitada: aunque hay términos multilingües en las clases de pago y ofertas, el modelo está orientado al inglés.
- No distingue marcas de otras industrias: clasifica como `BRAND` cualquier nombre propio real (por ejemplo, `nvidia` o `ferrari`), lo que lo hace inútil para filtrar marcas fuera del nicho.
- No reconoce estudios de desarrollo de juegos: se necesita un diccionario externo para esa tarea.
- Fiabilidad baja en clases minoritarias: `PAY` y `OFFER` tienen solo 9 y 8 ejemplos en la validación, por lo que las métricas en esas clases no son concluyentes.
- No es un modelo generativo: intentar usarlo para generar texto devolverá la salida del modelo base sin la influencia del adaptador.
- La precisión general del 91% refleja la composición de la muestra de validación, que está dominada por `PRODUCT` y `BRAND`; en datos reales con otra distribución, el rendimiento puede variar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Krasovskiy/kwcluster-variables-1.5b
- Perfil del autor: https://huggingface.co/Krasovskiy
