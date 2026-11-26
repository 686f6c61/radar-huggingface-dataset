# APEXE3HQ/sec10k-analyst-2b

## Resumen
SEC 10-K Analyst 2B es un modelo especializado en la lectura y el razonamiento sobre informes anuales 10-K presentados ante la SEC (Securities and Exchange Commission) de Estados Unidos. Lo desarrolla APEXE3HQ y parte de Qwen3.5-2B como modelo base, sobre el que se aplica un ajuste fino supervisado (SFT) seguido de optimización por preferencias (DPO), con el resultado fusionado en los pesos y cuantizado a 4 bits (Q4_K_M). El modelo resuelve un problema concreto: extraer cifras exactas (ingresos, beneficio neto, flujo de caja, deuda, arrendamientos, ingresos diferidos, impuestos, recompras de acciones) de documentos financieros extensos, con citas a la fuente y capacidad de rechazar preguntas que un 10-K no puede responder.

La propuesta técnica más destacable es su arquitectura de "una base, nueve especialistas": sobre un único base cuantizado a 4 bits se montan varios adaptadores LoRA en F16 que cubren roles distintos (planificador, redactor, selector de etiquetas, lectura de secciones y respuestas en prosa). Según el autor, esta configuración de 2B parámetros supera a Qwen3.5-27B en precisión sobre un conjunto de 87 preguntas retenidas (84 frente a 72 respuestas correctas), con solo 2,2 GB de pesos en disco y capacidad de ejecutarse en una GPU de 8 GB.

Es relevante ahora porque demuestra que un ajuste fino bien dirigido con datos verificados automáticamente y cuantización agresiva puede batir a modelos generales mucho mayores en dominios estrechos, abaratando el despliegue en producción. El modelo tiene 1.942.653.248 parámetros totales, licencia Apache 2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B con SFT + DPO fusionados; adaptadores LoRA por rol) |
| Parámetros totales | 1.942.653.248 (1,94 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (base, 4 bits) y adaptadores LoRA en F16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base Q4_K_M y adaptadores LoRA GGUF) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, un transformer denso de 1,94 B de parámetros. El proceso de ajuste parte de SFT y continúa con DPO para especializar el modelo en la lectura de informes 10-K. El resultado se fusiona en los pesos y se cuantiza a Q4_K_M (1,31 GB de base). Sobre esa base compartida se entrenan nueve adaptadores LoRA en F16 que actúan como especialistas independientes: un planificador (router) entrenado con entropía cruzada sobre 3.072 planes verificados; un redactor (writer) entrenado con entropía cruzada más destilación KL desde Qwen3.5-27B sobre 1.042 respuestas auditadas; un selector de etiquetas compuesto por cuatro adaptadores (primera pasada, torneo y dos jueces); y tres roles de texto entrenados con SFT (prosa, lectura de secciones y búsqueda de cifras).

La innovación principal es el control de calidad del dataset: cada ejemplo de entrenamiento del planificador y del redactor pasó un verificador automático estricto que localiza la fila y el año correctos en la fuente citada. Según el autor, dos auditorías independientes intentaron romper el verificador: rechazó las 140 respuestas deliberadamente erróneas y aceptó las 1.530 respuestas de referencia correctas. El planificador también se validó contra aproximadamente 22.700 planes deliberadamente corruptos, todos rechazados. El autor afirma que el estudiante (2B) supera a su profesor (Qwen3.5-27B) en el conjunto retenido, 84 frente a 72.

## Capacidades

- Extracción de cifras exactas reportadas en informes 10-K: ingresos, beneficio neto, flujo de caja, deuda, arrendamientos, ingresos diferidos, impuestos y recompras de acciones.
- Manejo de desgloses y pares confundibles: corriente / no corriente / total, y distinciones como gasto por impuestos frente a impuestos pagados.
- Cálculo de cifras derivadas: diferencias, márgenes y crecimiento, calculados y verificados.
- Emisión de veredictos sobre salud financiera respaldados por las cifras.
- Comprensión de preguntas naturales: seguimientos conversacionales, nombres de empresa mal escritos, años con formato "FY25" y años omitidos.
- Rechazo razonado de preguntas que un 10-K no puede responder (precios en vivo, periodos futuros), explicando el motivo.
- Citación de cada cifra a su fuente dentro del documento.
- Selector de etiquetas que localiza la línea exacta del informe solicitada por la pregunta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el pipeline interno encadena planificador, selector y redactor.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Análisis fundamentalista automatizado: el modelo extrae ingresos, beneficio neto y flujo de caja de un 10-K concreto y cita la línea exacta, lo que permite generar fichas financieras auditables sin revisión manual línea a línea.
- Due diligence en fusiones y adquisiciones: un analista puede consultar deuda, arrendamientos e ingresos diferidos de varias empresas del S&P 500 y obtener cifras con desglose corriente / no corriente, reduciendo el tiempo de revisión documental.
- Verificación de cálculos financieros: el modelo calcula márgenes, variaciones interanuales y crecimiento a partir de las cifras reportadas y comprueba el resultado, útil para validar modelos de valoración propios.
- Asistente conversacional para equipos de finanzas: al soportar seguimientos y nombres de empresa mal escritos, puede integrarse en un chat interno donde los analistas preguntan en lenguaje natural sobre informes ya cargados.
- Detección de riesgos y salud financiera: el modelo emite veredictos respaldados por cifras sobre la situación de una compañía, adecuado para alertas tempranas en carteras o para informes de riesgo.
- Filtrado y rechazo de consultas fuera de alcance: en un asistente financiero desplegado, el modelo declina preguntas sobre precios en vivo o periodos futuros y explica por qué, lo que evita respuestas inventadas en producción.
- Procesamiento por lotes de informes 10-K: con 2,2 GB de pesos y ejecución en una GPU de 8 GB, se puede desplegar en una máquina modesta para procesar el snapshot del S&P 500 incluido en el repositorio (3,8 GB de datos verificados, hechos XBRL y pasajes).

## Benchmarks y rendimiento

| Benchmark | SEC 10-K Analyst 2B | Qwen3.5-27B |
|---|---|---|
| Preguntas retenidas correctas (87, revisión ciega con rúbrica fija) | 84 | 72 |
| Mismo conjunto, verificador automático original | 81 | no disponible |
| Qwen3.5-2B sin entrenar, mismo conjunto (verificador automático) | 6 de 87 (modelo base) | — |
| Test sellado (150 preguntas, puntuado una vez por versión) | 135 correctas (v1.2) | no disponible |
| Selector de etiquetas frente a Jev 1.14 (3.075 preguntas verificadas, test sellado) | 96,2 % | 94,8 % (Jev 1.14) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de evaluaciones propias del autor sobre conjuntos específicos de preguntas sobre informes 10-K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB de pesos en disco (base Q4_K_M de 1,31 GB más adaptadores LoRA F16 de 67 MB cada uno, y 4 × 135 MB para el selector de etiquetas); el autor indica que funciona en una GPU con 8 GB o más.
- GPU recomendadas: RTX 4060 Ti 8 GB y RTX 4090 (probadas por el autor); la versión v1.2 también se probó en RTX A4000 y DGX Spark.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM.
- También puede ejecutarse solo con CPU (el autor lo describe como lento).
- Opciones de despliegue: llama.cpp (formato GGUF y adaptadores LoRA GGUF); el repositorio incluye un script `run.sh` que instala dependencias, arranca el modelo, lo comprueba y abre una aplicación web en http://127.0.0.1:7860. Compatibilidad con vLLM, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en 10-K (87 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEC 10-K Analyst 2B | 1,94 B | no disponible | 84 correctas (revisión ciega) | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-27B | 27 B | no disponible | 72 correctas (revisión ciega) | no disponible | no disponible |
| Qwen3.5-2B (base sin entrenar) | 1,94 B | no disponible | 6 de 87 (verificador automático) | no disponible | no disponible |
| Jev 1.14 (modelo comercial de decisión) | no disponible | no disponible | 94,8 % en selector de etiquetas (frente a 96,2 %) | comercial | comercial |

La comparación se limita a los datos publicados por el autor. No se dispone de información sobre otros modelos especializados en informes 10-K para una comparativa más amplia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al entrenarse sobre informes 10-K de empresas del S&P 500, puede heredar sesgos de ese universo corporativo.
- Riesgo de alucinación: el autor afirma que el verificador automático rechaza respuestas incorrectas y que el modelo cita cada cifra, pero no se han publicado tasas de error independientes fuera de los conjuntos del propio autor.
- Limitaciones de contexto o idioma: solo soporta inglés; la longitud de contexto no está especificada, lo que impide valorar el manejo de informes 10-K completos en una sola pasada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-2B, no detallada en la información disponible.
- Caveats para producción: las evaluaciones proceden del autor y de conjuntos de preguntas propios; el pipeline requiere coordinar varios adaptadores LoRA y una aplicación web incluida, lo que añade complejidad operativa. La compatibilidad con servidores de inferencia estándar (vLLM, TGI) no está confirmada.
- El modelo declina preguntas fuera del alcance de un 10-K, lo que puede resultar restrictivo si se espera un asistente financiero generalista.

## Enlaces

- Hugging Face: https://huggingface.co/APEXE3HQ/sec10k-analyst-2b
- Dataset de evaluación retenido: https://huggingface.co/datasets/usmane3/sec10k-heldout-87
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
