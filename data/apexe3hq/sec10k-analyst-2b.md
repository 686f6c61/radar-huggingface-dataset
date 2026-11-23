# APEXE3HQ/sec10k-analyst-2b

## Resumen

SEC 10-K Analyst 2B es un modelo especializado en responder preguntas sobre informes anuales 10-K presentados ante la SEC (Securities and Exchange Commission) de Estados Unidos. Lo desarrolla APEXE3HQ y parte del modelo base Qwen/Qwen3.5-2B, sobre el que se aplicaron fine-tuning supervisado (SFT) y optimización por preferencias (DPO), con el resultado fusionado en los pesos y cuantizado a 4 bits (Q4_K_M).

El modelo resuelve un problema concreto: extraer cifras exactas (ingresos, beneficio neto, flujo de caja, deuda, impuestos, recompras) de documentos financieros extensos, distinguir partidas que se confunden con facilidad (gasto fiscal frente a impuestos pagados), calcular magnitudes derivadas (margenes, variaciones interanuales) y citar cada dato a su línea de origen. Su relevancia radica en que, según la model card, con solo 2B parámetros y cuantización de 4 bits supera a Qwen3.5-27B en precisión sobre un conjunto de 87 preguntas retenidas (84 frente a 72 aciertos), ocupando 2,2 GB en disco frente a 54 GB.

La arquitectura de despliegue es singular: un único base afinado compartido por nueve adaptadores LoRA especializados (planificador, redactor, selector de etiquetas con cuatro adaptadores y tres roles de texto), orquestados por una aplicación que conecta las etapas. El modelo está pensado para ejecutarse en una sola GPU de 8 GB o más, lo que lo hace viable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B), con adaptadores LoRA especializados sobre un base comun |
| Parametros totales | 1.942.653.248 (aproximadamente 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (base) + adaptadores LoRA en F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base y adaptadores LoRA en GGUF F16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, un transformer decoder-only de aproximadamente 1.942 millones de parámetros. El pipeline de entrenamiento consta de dos fases sobre el base: primero SFT para enseñar al modelo a leer informes SEC, después DPO para ajustar preferencias. El resultado se fusiona en los pesos y se cuantiza a Q4_K_M (1,31 GB). Sobre ese base compartido se entrenan nueve adaptadores LoRA independientes, cada uno responsable de una etapa del razonamiento: planificador (entrenado con entropía cruzada sobre 3.072 planes verificados), redactor (entropía cruzada más destilación KL desde Qwen3.5-27B sobre 1.042 respuestas auditadas), selector de etiquetas (cuatro adaptadores: primera pasada, torneo y dos jueces) y tres roles de texto entrenados con SFT.

La innovación principal es la disciplina de verificación de datos: cada ejemplo de entrenamiento del planificador y del redactor pasó un comprobador automático estricto que localiza la fila y el año correctos en la fuente citada. Dos auditorías independientes intentaron romperlo; el comprobador final rechaza las 140 respuestas deliberadamente incorrectas diseñadas para engañarlo y acepta las 1.530 respuestas de referencia correctas. El planificador, además, rechazó los aproximadamente 22.700 planes deliberadamente corruptos contra los que se probó. El conjunto de datos incluye un snapshot de informes 10-K del S&P 500 (3,8 GB) con cifras verificadas, hechos XBRL y pasajes.

## Capacidades

- Extracción de cifras exactas reportadas: ingresos, beneficio neto, flujo de caja, deuda, arrendamientos, ingresos diferidos, impuestos y recompras de acciones.
- Distinción de desgloses y partidas similares: corrientes / no corrientes / totales, y pares confundibles como gasto fiscal frente a impuestos pagados.
- Cálculo de cifras derivadas: diferencias, márgenes y crecimiento, computados y verificados.
- Veredictos sobre salud financiera respaldados por las cifras extraídas.
- Manejo de preguntas naturales: seguimientos conversacionales, nombres de empresa mal escritos, años con formato "FY25" y años omitidos.
- Rechazo explícito de preguntas que un 10-K no puede responder (precios en vivo, periodos futuros), explicando el motivo.
- Citación de cada cifra a su línea de origen en el documento.
- Selector de etiquetas que localiza la línea exacta del informe sobre la que versa la pregunta.
- Capacidades conversacionales multi-turno dentro del dominio financiero.
- No dispone de vision, audio ni tool calling genérico según la información disponible.

## Casos de uso

- Análisis fundamentalista automatizado: el modelo extrae ingresos, beneficio neto y flujo de caja de un 10-K concreto y cita cada cifra a su línea, permitiendo a un analista verificar el dato en segundos en lugar de buscar en un documento de decenas de páginas.
- Due diligence financiera: comparación de partidas entre años (margenes, crecimiento, variaciones) calculadas y verificadas por el modelo, útil en procesos de fusiones y adquisiciones donde la exactitud de las cifras es crítica.
- Auditoría interna y compliance: distinción entre pares confundibles (gasto fiscal frente a impuestos pagados) y desgloses corrientes/no corrientes, reduciendo el riesgo de transcribir la partida equivocada en informes regulatorios.
- Asistente conversacional para equipos de finanzas: gestión de preguntas de seguimiento multi-turno sobre un mismo informe, incluyendo aclaraciones sobre años omitidos o nombres de empresa mal escritos.
- Generación de resúmenes de salud financiera: el modelo emite veredictos respaldados por las cifras extraídas, adecuado para informes preliminares que un humano revisa después.
- Despliegue en estación de trabajo con GPU de consumo: al caber en 8 GB de VRAM (probado en RTX 4060 Ti 8 GB, RTX 4090, RTX A4000 y DGX Spark), permite a un analista individual ejecutar el pipeline en local sin depender de infraestructura de datacenter.
- Filtrado y rechazo de preguntas fuera de alcance: en un chatbot financiero, el modelo declina preguntas sobre precios en vivo o periodos futuros y explica por qué, evitando respuestas inventadas.

## Benchmarks y rendimiento

| Benchmark | SEC 10-K Analyst 2B | Qwen3.5-27B |
|---|---|---|
| Preguntas retenidas (87, correctas) | 84 | 72 |
| Test sellado (150 preguntas, v1.2) | 135 | No disponible |
| Comprobador automático original (sobre 87) | 81 | No disponible |
| Qwen3.5-2B sin entrenar (sobre 87) | No aplica | 6 |
| Selector de etiquetas frente a Jev 1.14 (3.075 preguntas verificadas) | 96,2 % | 94,8 % (Jev 1.14) |

Los datos provienen de la model card del autor. Las 87 preguntas retenidas y sus informes no se usaron en entrenamiento; cuatro revisores independientes puntuaron a ciegas con rúbrica fija y respuestas sin etiquetar. El test sellado de 150 preguntas se puntuó una sola vez por versión.

## Requisitos de hardware

- VRAM estimada: cabe en una GPU de 8 GB o más. El base Q4_K_M ocupa 1,31 GB y los adaptadores LoRA suman aproximadamente 67 MB cada uno (los cuatro del selector de etiquetas, 135 MB cada uno), más el snapshot de datos de 3,8 GB en disco.
- GPU recomendadas: RTX 4060 Ti 8 GB y RTX 4090 (probadas según la model card); v1.2 también probado en RTX A4000 y DGX Spark. Para Qwen3.5-27B se requiere una GPU de clase 80 GB.
- Cabe en GPU de consumo: sí, en RTX 4060 Ti 8 GB y superiores.
- Opciones de despliegue: llama.cpp (formato GGUF y adaptadores LoRA), pipeline propio incluido en el repositorio (`run.sh` instala todo, arranca el modelo y abre la aplicación web en http://127.0.0.1:7860). También puede ejecutarse solo con el procesador, con rendimiento lento según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (87 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEC 10-K Analyst 2B | 2B (1.942.653.248) | No disponible | 84/87 | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-27B | 27B | No disponible | 72/87 | No disponible | No disponible |
| Qwen3.5-2B (sin entrenar) | 2B | No disponible | 6/87 | No disponible | No disponible |
| Jev 1.14 (modelo comercial de decisión) | No disponible | No disponible | 94,8 % en selector de etiquetas (3.075 preguntas) | Comercial | No disponible |

La comparativa se limita a los modelos citados en la model card. No se dispone de datos de otros modelos especializados en informes SEC en la información proporcionada.

## Limitaciones y advertencias

- Idioma: solo inglés; no soporta consultas en castellano ni otros idiomas.
- Dominio restringido: entrenado exclusivamente para informes 10-K de la SEC; su uso fuera de ese dominio no está validado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar con precisión el manejo de documentos muy extensos.
- Alucinación: aunque el pipeline incluye verificación y citación, el modelo puede producir cifras incorrectas en preguntas ambiguas o informes atípicos; la model card no reporta tasas de error fuera del conjunto de evaluación.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre informes del S&P 500, la distribución de empresas cubiertas es limitada a grandes cotizadas estadounidenses.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B.
- Producción: el pipeline depende de varios adaptadores y de una aplicación de orquestación; su robustez fuera de los entornos probados (RTX 4060 Ti, RTX 4090, RTX A4000, DGX Spark) no está verificada.
- Datos: el snapshot de informes 10-K del S&P 500 (3,8 GB) puede quedar desactualizado respecto a presentaciones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APEXE3HQ/sec10k-analyst-2b
- Conjunto de evaluación retenido: https://huggingface.co/datasets/usmane3/sec10k-heldout-87
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
