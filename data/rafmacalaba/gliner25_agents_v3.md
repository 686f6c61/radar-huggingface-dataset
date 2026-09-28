# rafmacalaba/gliner25_agents_v3

## Resumen

gliner25_agents_v3 es un ajuste fino del modelo base fastino/gliner2.5-base-v1, perteneciente a la familia GLiNER2 (arquitectura de fronteras o *boundary architecture*), publicado por el usuario rafmacalaba. Se trata de un modelo de clasificación de tokens especializado en la extracción de menciones sobre el uso de datos en artículos de investigación económica: es decir, detecta cuándo un texto cita un conjunto de datos, una encuesta, un censo o un registro estadístico. El repositorio tiene 193.581.591 parámetros (unos 193,6 millones) y 1,5 GB de peso, lo que lo sitúa en la gama de modelos encoder compactos.

El problema que resuelve es muy concreto: la literatura económica y de desarrollo cita fuentes de datos de forma muy heterogénea (nombres propios, descripciones genéricas o referencias vagas), y localizar esas menciones de forma sistemática requiere anotación automática fiable. El modelo se entrenó sobre el dataset rafmacalaba/datause-agents-v3 y define tres etiquetas: `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`.

Su relevancia es acotada y de nicho: no es un modelo de propósito general, sino una herramienta de extracción para un dominio muy específico, con un rendimiento moderado documentado de forma inusualmente honesta por el autor (mejor F1 de 0,7138 y mejor F0,5 de 0,7653 en el conjunto de validación). La licencia Apache 2.0 facilita su reutilización comercial, aunque el modelo card advierte que la métrica de referencia mide acuerdo con un agente anotador automático, no precisión real frente a anotación humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2 (familia de extracción de entidades por fronteras o *boundary architecture*), encoder bidireccional para clasificación de tokens |
| Parámetros totales | 193.581.591 (~193,6 M), dato real de safetensors |
| Parámetros activos | No aplicable (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible (el model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería de referencia | gliner2 |
| Pipeline | token-classification |
| Tamaño del repositorio | 1,5 GB |
| Descargas / likes | 18 / 0 |
| Fecha de creación y actualización | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de fastino/gliner2.5-base-v1, un modelo de la familia GLiNER2 de Fastino. GLiNER (Generalist and Lightweight NER Model) es una línea de modelos encoder de extracción de entidades que tratan el reconocimiento de entidades como una tarea de predicción de fronteras de span condicionada por la etiqueta, en lugar de depender de un clasificador de etiquetas fijo. El model card describe la arquitectura del base como *boundary architecture*, sin detallar la composición exacta del encoder ni la longitud de contexto; esa información no está disponible en la documentación proporcionada.

El ajuste fino se realizó sobre el dataset rafmacalaba/datause-agents-v3, configuración `gliner2`, con 5 épocas, una tasa de aprendizaje de 5e-06 para el encoder y 1e-04 para la cabeza de tarea, tamaño de lote 32 y precisión bf16. Las etiquetas se generaron con un LLM ejecutado localmente mediante un arnés de anotación por pasajes, con revisión y adjudicación humana en el bucle. Este punto es crítico para interpretar los resultados: el autor advierte explícitamente que el F1 de validación mide acuerdo con el agente anotador, no exactitud frente a anotación humana de referencia. El conjunto de validación contiene 2.108 pasajes y 1.916 spans, con documentos procedentes de cuatro orígenes: fcv_pads_east_africa, prwp, reliefweb y umar_pads. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de extracción y no de generación.

## Capacidades

- Extracción de entidades nombradas (NER) sobre texto en formato de clasificación de tokens, con salida de spans y desplazamientos de caracteres.
- Tres etiquetas específicas de dominio: `NAMED_DATA` (nombre propio, título o acrónimo de una fuente de datos concreta), `DESCRIPTIVE_DATA` (fuente descrita con palabras pero no nombrada) y `VAGUE_DATA` (formulación genérica sin fuente identificable).
- Umbral de decisión configurable: el model card publica métricas para nueve umbrales (0,10 a 0,90), de modo que se puede ajustar el equilibrio precisión/recall según el caso de uso.
- Inferencia local de bajo coste: con 193,6 M de parámetros, el modelo puede ejecutarse en CPU y en GPU de gama de entrada.
- No es un modelo generativo: no produce texto libre ni razonamiento.
- No soporta *tool calling* ni *function calling*.
- No soporta flujos de agentes ni razonamiento multi-paso por sí mismo.
- Capacidades multilingües: no disponibles; el model card no declara idiomas soportados.
- Capacidades especiales: no se documentan modos de *thinking*, visión ni audio.

## Casos de uso

- Extracción de menciones de fuentes de datos en corpus de economía del desarrollo: el modelo detecta en cada pasaje si se cita un dataset, una encuesta, un censo o un registro, y devuelve los spans con sus offsets. Es adecuado porque las tres etiquetas cubren el rango de precisión con que la literatura cita sus fuentes.
- Construcción de catálogos de metadatos de investigación: a partir de los spans `NAMED_DATA` extraídos de miles de artículos se puede generar un índice de fuentes de datos reutilizadas por área temática.
- Auditoría de reutilización de datos en informes de política: con los documentos del origen prwp (World Bank Policy Research Working Papers) se puede medir qué proporción de informes nombra explícitamente sus fuentes frente a los que usan descripciones genéricas.
- Seguimiento de uso de datos en documentación humanitaria: aplicado al corpus reliefweb, permite identificar qué encuestas y registros se citan en informes de respuesta a crisis.
- Preanotación asistida para revisores humanos: el modelo genera candidatos de span que un anotador valida o corrige, reduciendo el coste de construir nuevos conjuntos etiquetados en el mismo dominio. El propio autor usó este esquema con revisión y adjudicación humana.
- Triaje en revisiones sistemáticas: dado un conjunto grande de pasajes, usar el modelo con umbral alto (0,80-0,90) para seleccionar únicamente las menciones de datos con precisión superior al 90 % y descartar el resto de forma automática.
- Análisis bibliométrico de la cultura de citación de datos: comparar la distribución de etiquetas (`NAMED_DATA` frente a `DESCRIPTIVE_DATA` y `VAGUE_DATA`) entre revistas, autores o períodos como indicador de rigor en la atribución de fuentes.
- Enriquecimiento de bases de datos de investigación económica: vincular cada mención extraída al registro de datos correspondiente para construir relaciones documento-dataset consultables.

## Benchmarks y rendimiento

Resultados de evaluación sobre el conjunto de validación (2.108 pasajes, 1.916 spans), evaluación agnóstica de etiqueta:

| Umbral | tp | fp | fn | precisión | recall | F0,5 | F1 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0,10 | 1449 | 977 | 464 | 0,5973 | 0,7574 | 0,6237 | 0,6679 |
| 0,20 | 1388 | 606 | 525 | 0,6961 | 0,7256 | 0,7018 | 0,7105 |
| 0,30 | 1322 | 469 | 591 | 0,7381 | 0,6911 | 0,7282 | 0,7138 |
| 0,40 | 1254 | 367 | 659 | 0,7736 | 0,6555 | 0,7467 | 0,7097 |
| 0,50 | 1186 | 289 | 727 | 0,8041 | 0,6200 | 0,7590 | 0,7001 |
| 0,60 | 1090 | 212 | 823 | 0,8372 | 0,5698 | 0,7653 | 0,6781 |
| 0,70 | 961 | 165 | 952 | 0,8535 | 0,5024 | 0,7488 | 0,6324 |
| 0,80 | 778 | 82 | 1135 | 0,9047 | 0,4067 | 0,7267 | 0,5611 |
| 0,90 | 452 | 32 | 1461 | 0,9339 | 0,2363 | 0,5872 | 0,3771 |

Mejor F0,5: 0,7653 con umbral 0,60. Mejor F1: 0,7138 con umbral 0,30.

Recall por etiqueta en el umbral 0,60:

| Etiqueta | Clústeres gold | Recuperados | Recall |
| --- | --- | --- | --- |
| DESCRIPTIVE_DATA | 548 | 161 | 0,2938 |
| NAMED_DATA | 1355 | 926 | 0,6834 |
| VAGUE_DATA | 10 | 3 | 0,3000 |

No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la información disponible, algo coherente con la naturaleza del modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,77 GB en fp32, 0,39 GB en fp16 o bf16, 0,19 GB en int8 y 0,10 GB en int4 (cálculo a partir de los 193,6 M de parámetros; el repositorio no publica versiones cuantizadas).
- VRAM estimada en inferencia real: entre 1 y 2 GB en fp16/bf16 considerando activaciones, tokenizador y sobrecarga del framework, con lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento y la evaluación del autor se hicieron con precisión bf16, lo que requiere compatibilidad con bf16 (Ampere en adelante, por ejemplo RTX 30xx/40xx, A100, H100). En GPUs sin soporte bf16 habría que usar fp16 o fp32.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia en CPU es viable dado el tamaño del modelo y el hecho de que no es autorregresivo, aunque no se publican cifras de latencia.
- Opciones de despliegue: la vía documentada es la librería gliner2 (Python). No se publican pesos en GGUF, por lo que no hay integración directa con llama.cpp u Ollama, ni adaptadores para vLLM o TGI (que están orientados a modelos generativos). Tampoco se publican exportaciones a ONNX ni TorchScript.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos entre este ajuste y alternativas en la información proporcionada. La comparación se limita a características estructurales declaradas:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| rafmacalaba/gliner25_agents_v3 | GLiNER2 ajustado para uso de datos | 193,6 M | No disponible | Apache 2.0 | safetensors, librería gliner2 |
| fastino/gliner2.5-base-v1 | GLiNER2 base, propósito general | No disponible | No disponible | No disponible en la información proporcionada | Modelo base del ajuste |
| Modelos NER genéricos de la familia GLiNER (por ejemplo, variantes multi o large de terceros) | NER generalista | No disponible | No disponible | Variable según variante | No verificado en la información proporcionada |

La diferencia funcional principal frente al modelo base es la especialización: gliner25_agents_v3 está ajustado exclusivamente para tres etiquetas de uso de datos en literatura económica, mientras que el base es un extractor de entidades de propósito general.

## Limitaciones y advertencias

- Rendimiento moderado: el mejor F1 es 0,7138 (umbral 0,30) y el mejor F0,5 es 0,7653 (umbral 0,60). La precisión máxima alcanzada es 0,9339 pero con un recall de solo 0,2363 en el umbral 0,90.
- Recall muy bajo en dos de las tres etiquetas: 0,2938 para `DESCRIPTIVE_DATA` y 0,3000 para `VAGUE_DATA`, frente a 0,6834 para `NAMED_DATA`. El modelo es esencialmente fiable solo para menciones con nombre propio.
- Análisis de errores del autor en el umbral 0,60: 212 falsos positivos (4 casi aciertos, 29 coincidencias parciales y 199 completamente espurios), 823 fallos y 165 entidades redundantes detectadas dos veces.
- Distribución de fallos por longitud de span: 272 de 1-2 tokens, 425 de 3-5 tokens y 126 de 6 o más tokens, es decir, los fallos se concentran en menciones de longitud media.
- Causa de los fallos: 464 spans nunca se emitieron (problema de propuesta o abstención que ningún umbral corrige) y 359 se emitieron pero quedaron por debajo del corte (problema de calibración).
- Errores de etiqueta en spans coincidentes: 147 de 1090, es decir, frontera correcta pero clase incorrecta.
- Falsos positivos en pasajes vacíos: 941 pasajes no contenían ningún span gold y el modelo emitió 103 spans en 105 de ellos.
- Sesgo circular en la evaluación: el F1 de validación mide acuerdo con el agente anotador que generó las etiquetas, no exactitud frente a anotación humana independiente. Los resultados reales en producción podrían ser inferiores.
- Dos menciones gold quedan excluidas de todos los conjuntos porque el divisor de palabras las une en un único token (una URL y `EM-DAT_`), de modo que ningún modelo de la familia GLiNER2 puede direccionarlas como span. Se eliminan antes de entrenar y evaluar.
- Idiomas soportados no declarados: aunque los corpus de origen son presumiblemente documentos en inglés de organismos de desarrollo, esto no se confirma en el model card y no debe asumirse.
- Longitud de contexto no documentada: si los pasajes superan la ventana real del modelo, habrá truncamiento silencioso.
- Sesgos de dominio: el modelo se ha ajustado sobre cuatro orígenes documentales concretos; su comportamiento fuera de ese tipo de literatura no está caracterizado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No se documentan restricciones adicionales de uso aceptable.
- No es un modelo generativo: no debe plantearse para tareas de resumen, pregunta-respuesta o agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/gliner25_agents_v3
- Modelo base: https://huggingface.co/fastino/gliner2.5-base-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/rafmacalaba/datause-agents-v3
- Métricas detalladas del holdout: archivo `holdout_metrics.json` del repositorio
- Predicciones por pasaje: archivo `holdout_predictions.jsonl` del repositorio
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) en la información proporcionada; los resultados devueltos corresponden a páginas genéricas de buscador sin relación con el modelo.
