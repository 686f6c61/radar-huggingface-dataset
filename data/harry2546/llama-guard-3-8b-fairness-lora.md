# harry2546/Llama-Guard-3-8B-fairness-lora

## Resumen

Llama-Guard-3-8B-fairness-lora es un adaptador LoRA de investigación construido sobre el modelo de moderación Llama Guard 3 8B de Meta. Lo publica el usuario harry2546 como extensión de un trabajo de curso de posgrado (noviembre de 2026) y su objetivo es mejorar la capacidad del modelo base para clasificar comentarios tóxicos frente a benignos, prestando especial atención a la equidad entre grupos de identidad. El adaptador se entrena sobre el conjunto público CivilComments-WILDS y añade una cabeza de puntuación entrenada que repondera la salida de seguridad del modelo base.

El problema que aborda es un sesgo documentado en los modelos de moderación: los comentarios benignos que mencionan una identidad (por ejemplo, orientación sexual, religión o discapacidad) tienden a ser marcados como tóxicos con más frecuencia que los que no la mencionan. El autor reporta que la peor tasa de falsos positivos por subgrupo del modelo base zero-shot, un 44,6 %, baja hasta la veintena con el adaptador aplicado en el umbral elegido.

Se trata de un adaptador pequeño (0,7 GB en el repositorio) sobre un modelo denso de 8 000 millones de parámetros, con licencia Llama 3 Community License. El propio autor lo etiqueta explícitamente como no apto para decisiones de seguridad en producción y señala que los resultados son preliminares, con una v2 prevista con más datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder denso (Llama Guard 3 8B); adaptadores en proyecciones de atención (q/k/v/o) y MLP (gate/up/down) |
| Parametros totales | No disponible para el adaptador; modelo base de 8 000 millones de parámetros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card; heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 Community License (con Acceptable Use Policy de Meta) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=64, alpha=128, dropout 0.05 |
| Datos de entrenamiento | 160 000 comentarios de CivilComments-WILDS (muestreo informativo balanceado por identidad) |
| Libreria | peft |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clásico de LoRA de bajo rango sobre un transformer decoder denso. Se aplican matrices de adaptación de rango 64 y alpha 128 con dropout 0,05 sobre las proyecciones de atención (query, key, value, output) y sobre las proyecciones del bloque MLP (gate, up, down) del modelo base Llama Guard 3 8B. El entrenamiento utiliza 160 000 comentarios del conjunto CivilComments-WILDS, con un muestreo informativo que busca equilibrar la representación de grupos de identidad.

La innovación principal no está en la arquitectura sino en el mecanismo de puntuación: la salida de seguridad del modelo base se repondera mediante una cabeza entrenada, de modo que la decisión final de toxicidad no depende solo del formato de respuesta nativo de Llama Guard. El autor menciona un "writeup estilo paper" pendiente de publicación que detallaría este mecanismo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de CivilComments-WILDS, ni si se emplearon técnicas de RLHF o DPO; el entrenamiento es un fine-tuning supervisado sobre la tarea de clasificación.

## Capacidades

- Clasificación de toxicidad binaria sobre comentarios de texto, con salida de seguridad reponderada por una cabeza entrenada.
- Ranking de comentarios tóxicos frente a benignos mediante una puntuación continua (evaluada con AUROC y F1).
- Evaluación con perspectiva de equidad: métricas de tasa de falsos positivos desagregadas por grupo de identidad.
- Hereda del modelo base Llama Guard 3 8B la capacidad de generar texto y de responder a políticas de seguridad personalizadas, aunque el adaptador está orientado a la tarea de moderación.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Estudio académico del sesgo en modelos de moderación: el adaptador sirve como objeto de análisis para comparar tasas de falsos positivos por subgrupo antes y después del fine-tuning, usando CivilComments-WILDS como referencia reproducible.
- Docencia y trabajos de curso: permite ilustrar cómo un adaptador LoRA de bajo rango puede modificar el comportamiento de un modelo de seguridad sin reentrenar el modelo completo, con un coste de 0,7 GB de pesos.
- Investigación en mitigación de sesgo: el mecanismo de reponderación de la salida de seguridad puede estudiarse como técnica de calibración de umbrales por grupo de identidad.
- Prototipado de pipelines de moderación en entornos de laboratorio: integrable con transformers y peft para experimentar con umbrales (el autor reporta 0,370) y medir el equilibrio entre precisión y equidad.
- Análisis de error y anotación: el autor señala que aproximadamente el 61 % de los errores residuales ocurren donde los anotadores humanos discrepan cerca del 50/50, lo que lo hace útil para estudiar los límites del etiquetado humano en moderación.
- Reproducción de experimentos: al estar basado en un dataset público y un modelo base abierto (con aceptación de licencia), permite replicar los resultados reportados y servir de línea base para la v2 anunciada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de test compartido de 3 000 comentarios con umbral 0,370:

| Modelo | AUROC | F1 |
|---|---|---|
| Llama Guard 3 8B zero-shot (política por defecto) | 0,701 | No disponible |
| Llama Guard 3 8B + prompt de política reescrito | 0,762 | No disponible |
| Este adaptador | 0,935 | 0,838 |

Partición retenida del curso:

| Partición | AUROC | F1 |
|---|---|---|
| Validación | 0,962 | 0,832 |
| test_sub3k | 0,915 | 0,813 |

El autor reporta además que la peor tasa de falsos positivos por subgrupo del modelo base zero-shot (44,6 %) baja hasta la veintena con el adaptador en el umbral elegido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que la tarea evaluada es de moderación y no de razonamiento general.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,7 GB, pero requiere cargar el modelo base Llama Guard 3 8B para la inferencia.
- VRAM estimada para el modelo base en bfloat16: aproximadamente 16 GB de pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría los 8-9 GB y en 4 bits unos 5-6 GB, aunque estas cifras no se confirman en la model card.
- GPU recomendadas: A100 o H100 para despliegue con throughput alto; una RTX 4090 (24 GB) permite cargar el modelo base en bfloat16 con margen limitado; GPUs consumer de 12-16 GB requerirían cuantización.
- Opciones de despliegue: el ejemplo oficial usa transformers con peft y device_map="auto". No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama Guard 3 8B) | 8 000 M (base) + LoRA r=64 | No disponible | Moderación con equidad por identidad | Llama 3 Community License | HuggingFace (0 descargas, 0 likes) |
| Llama Guard 3 8B (base) | 8 000 M | No disponible | Moderación de seguridad general | Llama 3 Community License | HuggingFace (Meta) |
| Llama Guard 3 1B | 1 000 M | No disponible | Moderación ligera | Llama 3 Community License | HuggingFace (Meta) |
| Alternativas de moderación de otros proveedores | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa directa solo es posible frente al modelo base, para el que el autor reporta una mejora de AUROC de 0,701 a 0,935 en el conjunto de test compartido. No se dispone de datos comparativos frente a otros modelos de moderación en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el adaptador no es apto para decisiones de seguridad en producción; su uso previsto es la investigación académica.
- Los resultados son preliminares (trabajo de curso de noviembre de 2026) y se anuncia una v2 con más datos.
- Riesgo de sobreajuste al dominio de CivilComments-WILDS: el rendimiento en otros dominios o idiomas no está evaluado.
- Sesgos residuales: aunque se reduce la tasa de falsos positivos por subgrupo, no se elimina; el autor no publica aún la tabla completa de métricas de sesgo, que queda en el writeup pendiente.
- Aproximadamente el 61 % de los errores residuales coinciden con desacuerdos entre anotadores humanos, lo que limita el techo alcanzable con este dataset.
- Licencia Llama 3 Community License: el uso comercial está sujeto a los términos de Meta y a su Acceptable Use Policy; debe revisarse antes de cualquier despliegue.
- El umbral de decisión (0,370) está ajustado al conjunto de evaluación reportado; su transferibilidad a otros datos no está validada.
- El modelo base requiere aceptar previamente la licencia de Meta en HuggingFace para poder descargarse.
- El dataset CivilComments-WILDS tiene sus propios términos que deben comprobarse antes de reentrenar.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/harry2546/Llama-Guard-3-8B-fairness-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-8B
- Licencia Llama 3: https://ai.meta.com/llama/license/
- Dataset CivilComments-WILDS: no disponible en la información proporcionada
- Writeup del autor: anunciado como pendiente, no disponible
- Repositorio de código: no disponible
