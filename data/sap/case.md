# SAP/CASE

## Resumen

CASE (SAP/CASE) es un modelo desarrollado por SAP a partir de un ajuste fino de `google/gemma-3-12b-pt`, orientado especificamente a tareas de datos tabulares: clasificacion, regresion y generacion de embeddings sobre tablas. A diferencia de los modelos tabulares clasicos basados en gradient boosting, CASE aprovecha el conocimiento de un transformer de lenguaje de 12.187 millones de parametros para resolver tareas tabulares mediante aprendizaje en contexto (in-context learning), lo que permite abordar predicciones sin reentrenamiento especifico por tarea.

El modelo se distribuye en formato safetensors con un repositorio de 24,4 GB, lo que corresponde a los pesos en precision completa (bf16/fp16) del modelo base de 12B. La licencia es `case-license`, una licencia propia de SAP distinta de la de Gemma, y el acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. El pipeline declarado es `tabular-classification`, aunque el modelo cubre tambien regresion y embeddings tabulares.

Su relevancia actual radica en la interseccion entre modelos fundacionales y datos estructurados: propone un enfoque unificado para multiples tareas tabulares sin ingenieria de caracteristicas especifica, un area donde los LLM genericos rinden por debajo de los metodos especializados. No se dispone de informacion publica sobre idiomas soportados ni de resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-12b-pt), ajustada para datos tabulares |
| Parametros totales | 12.187.325.040 (~12,19 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | No disponible |
| Licencia | case-license (licencia propia de SAP; acceso restringido/gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CASE parte de `google/gemma-3-12b-pt`, el checkpoint preentrenado de Gemma 3 de 12B parametros, y lo ajusta para tareas tabulares. La arquitectura subyacente es un transformer decoder-only con atencion multi-cabeza estandar de la familia Gemma 3; el ajuste convierte la representacion de filas y columnas tabulares en secuencias que el modelo procesa en contexto, de modo que la tarea (clasificacion, regresion o embedding) se especifica en el propio prompt junto con los datos de ejemplo.

El modelo esta etiquetado con las capacidades `tabular`, `in-context`, `tabular-classification`, `tabular-regression` y `tabular-embedding`, lo que indica que el entrenamiento esta orientado a que el modelo aprenda a interpretar esquemas de tablas, tipos de columnas y ejemplos etiquetados dentro de la ventana de contexto. No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset (el unico dataset referenciado es `mlfoundations/t4-full`), ni sobre el uso de RLHF/DPO. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion tabular: prediccion de etiquetas categoricas a partir de filas con columnas heterogeneas (numericas y categoricas).
- Regresion tabular: estimacion de valores continuos sobre datos estructurados.
- Embeddings tabulares: generacion de representaciones vectoriales de filas o tablas para busqueda, clustering o downstream tasks.
- Aprendizaje en contexto: resolucion de tareas tabulares mediante ejemplos incluidos en el prompt, sin reentrenamiento por tarea.
- Procesamiento de esquemas: interpretacion de nombres de columnas, tipos de datos y valores faltantes dentro de la entrada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prediccion de churn en CRM: el modelo recibe un lote de filas de clientes con variables de uso, facturacion y antiguedad, junto con ejemplos etiquetados de churn, y devuelve la probabilidad o etiqueta para cada fila sin entrenar un modelo especifico.
- Scoring de riesgo crediticio o de impago: clasificacion binaria sobre tablas de solicitudes con variables financieras, usando ejemplos historicos en el prompt para calibrar la decision.
- Enriquecimiento de datos maestros: clasificacion de registros de producto o proveedor en categorias normalizadas a partir de columnas descriptivas y ejemplos de referencia.
- Deteccion de anomalias en datos operativos: regresion sobre metricas de sensores o transacciones para estimar el valor esperado y marcar desviaciones significativas.
- Busqueda y deduplicacion de registros: generacion de embeddings tabulares para comparar filas por similitud y detectar duplicados en bases de datos empresariales.
- Analitica asistida en herramientas de BI: integracion del modelo en un asistente que, dada una tabla y una pregunta, clasifique o regrese el objetivo indicado por el usuario sin salir de la interfaz.
- Prototipado rapido de modelos tabulares: sustitucion de pipelines de feature engineering en fases de exploracion, usando el modelo como baseline in-context antes de invertir en un modelo especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~24,4 GB en precision completa (bf16/fp16) para los 12,19 B parametros; aproximadamente 12-13 GB en cuantizacion de 8 bits y 7-8 GB en 4 bits, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para inferencia en precision completa con contexto amplio; RTX 6000 Ada 48 GB como alternativa de workstation.
- GPU de consumo: no cabe en precision completa en GPUs de 16-24 GB (RTX 4090, RTX 4080); seria necesario cuantizar a 8 o 4 bits, con la perdida de calidad que ello implica y sin pesos GGUF oficiales.
- Opciones de despliegue: no se especifican en la informacion proporcionada; al ser safetensors de un modelo tipo Gemma 3, es compatible con stacks habituales (vLLM, TGI, transformers), pero no hay confirmacion oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Acceso |
|---|---|---|---|---|---|
| SAP/CASE | ~12,19 B | No disponible | LLM ajustado para tabular in-context | case-license | Gated |
| google/gemma-3-12b-pt | ~12 B | No disponible en la informacion | LLM generalista preentrenado | Gemma license | Abierto |
| TabPFN / TabICL (referencia conceptual) | No disponible | No disponible | Transformers especificos para tabular | No disponible | No disponible |

La comparacion con modelos tabulares especializados como TabPFN o TabICL es conceptual: no se dispone de datos de rendimiento de CASE que permitan una comparacion cuantitativa. Frente a su modelo base, CASE anade el ajuste especifico para tablas, pero hereda el tamano y los requisitos de hardware de un LLM de 12B, muy superiores a los de un gradient boosting o un transformer tabular ligero.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Licencia `case-license`: es una licencia propia de SAP, distinta de la de Gemma; es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Sin datos de benchmarks: no hay evidencia publicada en la informacion disponible sobre su calidad frente a metodos tabulares especializados.
- Riesgo de alucinacion: al ser un LLM, puede generar valores o etiquetas no presentes en el espacio de salida si el prompt no restringe adecuadamente las clases.
- Sensibilidad al formato del prompt: el rendimiento en modelos in-context depende del numero y la calidad de los ejemplos, del orden de columnas y del tratamiento de valores faltantes; no se documentan mejores practicas.
- Contexto no especificado: se desconoce la ventana maxima, lo que limita planificar el tamano de los lotes de filas incluidos en el prompt.
- Idiomas no disponibles: no se puede asumir soporte multilingue en nombres de columnas o valores categoricos.
- Requisitos de hardware elevados para una tarea tabular: 24,4 GB de pesos y ~24 GB de VRAM en precision completa son desproporcionados frente a alternativas clasicas, con mayor latencia y coste por prediccion.
- Sin cuantizaciones oficiales: no hay GGUF ni versiones cuantizadas publicadas, lo que dificulta el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SAP/CASE
- Modelo base: https://huggingface.co/google/gemma-3-12b-pt
- Dataset referenciado: https://huggingface.co/datasets/mlfoundations/t4-full
- Paper referenciado (arXiv:2608.03565): https://arxiv.org/abs/2608.03565
