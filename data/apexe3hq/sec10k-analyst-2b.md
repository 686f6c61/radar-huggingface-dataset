# APEXE3HQ/sec10k-analyst-2b

## Resumen

SEC 10-K Analyst 2B es un modelo especializado en responder preguntas sobre informes anuales (Form 10-K) presentados ante la SEC, desarrollado por APEXE3HQ. Parte de Qwen/Qwen3.5-2B, al que se aplica un ajuste fino supervisado (SFT) seguido de optimizacion por preferencias (DPO), y sobre el que se montan nueve adaptadores LoRA especializados que cubren cada etapa del pipeline de respuesta: planificacion, redaccion, localizacion de cifras en el documento y lectura de secciones.

La propuesta central es la especializacion extrema frente al escalado generalista: con 1.942.653.248 parametros (aproximadamente 2B) y cuantizacion de 4 bits Q4_K_M, el modelo responde correctamente 78 de 87 preguntas reservadas frente a las 71 de Qwen3.5-27B en BF16, segun la model card. El consumo de memoria es inferior a 4 GB con los nueve adaptadores y contexto de 64K tokens, frente a mas de 54 GB solo de pesos del modelo de 27B.

Es relevante para desarrolladores que necesitan extraccion fiable de cifras financieras auditables en hardware de consumo, con citacion de cada dato a su linea de origen en el filing, y con la capacidad explicita de rechazar preguntas que un 10-K no puede responder (precios en vivo, periodos futuros). La licencia Apache-2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B) con adaptadores LoRA por rol |
| Parametros totales | 1.942.653.248 (base); adaptadores LoRA adicionales de 67 MB (F16) y 135 MB (picker) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64K tokens (segun la model card, con los nueve adaptadores cargados) |
| Tipos de cuantizacion | Q4_K_M (base); adaptadores LoRA en F16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (base `base-only-Q4_K_M.gguf` y adaptadores `*-F16-lora.gguf`) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, un transformer decoder-only, mediante un ajuste fino en dos fases: primero SFT y despues DPO, con el resultado fusionado en los pesos y cuantizado a 4 bits Q4_K_M. Sobre esa base compartida se entrenan nueve adaptadores LoRA independientes, uno por cada rol del pipeline: un planificador (router), un redactor (writer) que tambien actua como calculadora, tres roles de texto adicionales (router_legacy_v8 para busquedas de cifras, prose_v6 para respuestas en prosa y sections_v9 para lectura de secciones) y cuatro adaptadores de label picker (primera pasada, torneo y dos jueces).

El planificador se entreno con entropia cruzada sobre 1.643 planes verificados (1.426 derivados directamente del ground truth de los filings y 217 generados por Qwen3.5-27B que superaron todas las comprobaciones). El redactor se entreno con entropia cruzada mas destilacion KL desde Qwen3.5-27B sobre 485 respuestas auditadas. Todos los ejemplos de entrenamiento pasaron un verificador automatico estricto que localiza la fila y el ano correctos en la fuente citada; dos auditorias independientes intentaron romperlo y el verificador final rechaza las 140 respuestas deliberadamente erroneas y acepta las 1.530 respuestas de referencia correctas. El dataset de soporte incluye un snapshot de 10-K del S&P 500 con cifras verificadas, hechos XBRL y pasajes (3,8 GB en el repositorio).

## Capacidades

- Extraccion de cifras reportadas exactas: ingresos, beneficio neto, flujo de caja, deuda, arrendamientos, ingresos diferidos, impuestos y recompras de acciones.
- Distincion de desgloses y pares facilmente confundibles: corriente / no corriente / total, y gasto por impuestos frente a impuestos pagados.
- Calculo de cifras derivadas: diferencias y margenes, computados y comprobados.
- Emision de veredictos sobre salud financiera respaldados por las cifras.
- Manejo de preguntas naturales: seguimientos conversacionales, nombres de empresa mal escritos, anos en formato "FY25" y anos omitidos.
- Rechazo explicito de preguntas que un 10-K no puede responder, como precios en vivo o periodos futuros.
- Citacion de cada cifra a su linea de origen en el documento.
- Label picker especializado en localizar la linea exacta del filing que responde a una pregunta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis automatizado de 10-K en pipelines de research: el modelo extrae cifras reportadas y derivadas de los filings del S&P 500 con citacion a la linea exacta, lo que permite generar informes auditables sin revision manual de cada dato.
- Asistente conversacional para analistas financieros: gestiona seguimientos multi-turno sobre un mismo filing gracias al contexto de 64K tokens y resuelve preguntas con nombres de empresa mal escritos o referencias de ano ambiguas.
- Verificacion de calculos financieros: el rol de calculadora y redactor computa diferencias y margenes a partir de cifras extraidas, util para validar ratios antes de publicarlos.
- Deteccion de discrepancias en datos XBRL: al contrastar cifras reportadas con hechos XBRL del snapshot, puede emplearse para auditar la consistencia de extracciones en procesos de ingesta.
- Despliegue en hardware de consumo para prototipado: con menos de 4 GB de VRAM para los nueve adaptadores y contexto de 64K, cabe en una unica GPU consumer, lo que permite iterar localmente sin acceso a GPUs de datacenter.
- Clasificacion y enrutado de consultas financieras: el planificador decide si una pregunta es respondible por un 10-K, que desglose requiere y que figura derivar, util como capa de triaje en sistemas de atencion a inversores.
- Generacion de resumenes de salud financiera: produce veredictos respaldados por cifras citadas, adecuado para informes internos de seguimiento de emisoras.

## Benchmarks y rendimiento

| Benchmark | SEC 10-K Analyst 2B | Qwen3.5-27B |
|---|---|---|
| Preguntas reservadas correctas (87 preguntas, evaluacion ciega con rubrica fija) | 78 | 71 |
| Label picker (test sellado, 3.075 preguntas verificadas, reglas pre-registradas) | 96,2 % | 94,8 % (Jev 1.14, modelo comercial de decision) |
| Qwen3.5-2B sin entrenar, misma app (87 preguntas) | 6 | no aplica |
| Parametros | 2B | 27B |
| Cuantizacion | 4 bits (Q4_K_M) + LoRA F16 | BF16 (16 bits) |
| Pesos en disco | 2,2 GB | 54 GB |
| Memoria GPU | menos de 4 GB (nueve adaptadores + contexto 64K) | mas de 54 GB solo pesos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden a evaluaciones propias del autor con preguntas reservadas y revision independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 4 GB con la base Q4_K_M (1,31 GB) mas los nueve adaptadores F16 y contexto de 64K tokens, segun la model card.
- Pesos en disco: 2,2 GB en total (base 1,31 GB + adaptadores).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM; el modelo de referencia (Qwen3.5-27B en BF16) requiere una GPU clase 80 GB (A100/H100).
- Cabe en GPU consumer: si, en tarjetas de gama media con 4 GB o mas.
- Opciones de despliegue: llama.cpp, con un servidor por rol sobre la base 4-bit compartida y la app del pipeline; Ollama, vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en 10-K (87 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEC 10-K Analyst 2B | 2B | 64K | 78/87 | Apache-2.0 | GGUF en Hugging Face |
| Qwen3.5-27B | 27B | no disponible | 71/87 | no disponible | Hugging Face |
| Qwen3.5-2B (sin ajustar) | 2B | no disponible | 6/87 | Apache-2.0 | Hugging Face |
| Jev 1.14 (modelo comercial de decision) | no disponible | no disponible | 94,8 % en label picking (vs 96,2 %) | comercial | no disponible |

## Limitaciones y advertencias

- Idioma: solo ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Dominio restringido: entrenado exclusivamente para preguntas sobre informes 10-K de la SEC; su rendimiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion: aunque el pipeline incluye verificacion de citas y rechazo de preguntas no respondibles, la model card no documenta tasas de error en produccion ni comportamiento ante filings con formatos atipicos.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Dependencia del pipeline: el modelo requiere la app y los nueve adaptadores coordinados; usarlo como modelo unico sin el enrutado degrada sustancialmente los resultados (6/87 para la base sin entrenar).
- Evaluacion limitada: los 87 casos de test son pocos y provienen de un unico conjunto; la comparacion con Qwen3.5-27B usa una app concreta y una rubrica fija, no benchmarks estandar.
- Licencia: Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base Qwen3.5-2B y las condiciones de uso de los datos de SEC EDGAR.
- Fecha de publicacion: el repositorio figura creado el 2026-11-19 con 0 descargas, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APEXE3HQ/sec10k-analyst-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Instrucciones de ejecucion: https://huggingface.co/APEXE3HQ/sec10k-analyst-2b/blob/main/HOW_TO_RUN.md
- SEC EDGAR (fuente de los filings): https://www.sec.gov/edgar
