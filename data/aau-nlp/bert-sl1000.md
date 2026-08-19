# AAU-NLP/BERT-SL1000

## Resumen

BERT-SL1000 es un modelo de etiquetado de secuencias basado en BERT, desarrollado por el grupo AAU-NLP de la Universidad de Aalborg, que se ajusta finamente sobre el dataset HiFi-KPI para extraer indicadores clave de rendimiento (KPIs) financieros de informes SEC 10-K y 10-Q. El modelo emplea clasificación de tokens para identificar entidades como ingresos, beneficios y ratios financieros, y está optimizado para mantener consistencia en etiquetas jerárquicas. Forma parte del benchmark HiFi-KPI y se entrena con las 1.000 etiquetas más frecuentes del dataset, que contiene 1,65 millones de párrafos y 198.000 etiquetas únicas organizadas jerárquicamente.

Con 109,6 millones de parámetros, hereda la arquitectura BERT base (encoder transformer) y está pensado específicamente para tareas de extracción de información financiera estructurada, especialmente en el contexto de informes regulatorios estadounidenses. Su relevancia radica en la dificultad de transferir etiquetas iXBRL entre empresas debido a la complejidad de la taxonomía, y este modelo aborda esa limitación mediante un etiquetado jerárquico consistente. Está disponible bajo licencia Apache-2.0 y su pipeline principal es text-classification, aunque su naturaleza es de token-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) |
| Parametros totales | 109.661.417 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (tipico de BERT base, no especificado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente fp32) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BERT-SL1000 se basa en la arquitectura BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion), un encoder transformer bidireccional preentrenado en texto general en ingles. El ajuste fino se realiza sobre el dataset HiFi-KPI, un corpus de 1,65 millones de parrafos extraidos de informes SEC 10-K y 10-Q, con 198.000 etiquetas unicas organizadas jerarquicamente y vinculadas a taxonomias iXBRL. El modelo se entrena exclusivamente con las 1.000 etiquetas mas frecuentes, lo que reduce la complejidad y mejora la transferibilidad entre empresas. El entrenamiento se realiza como una tarea de clasificacion de tokens (token classification), donde cada token se etiqueta con una categoria KPI. No se menciona el uso de RLHF ni DPO; el enfoque es puramente supervisado sobre el dataset anotado.

## Capacidades

- Extraccion de KPIs financieros de informes SEC 10-K y 10-Q, incluyendo ingresos, gastos, beneficios y ratios.
- Reconocimiento de entidades nombradas en el dominio financiero mediante clasificacion de tokens.
- Etiquetado de secuencias con taxonomia jerarquica, lo que permite organizar los KPIs en categorias padre-hijo.
- Compatible con el pipeline de token-classification de transformers, permitiendo integracion directa con otras herramientas del ecosistema.
- Soporte para extraccion estructurada de informacion financiera en formato iXBRL, facilitando la interoperabilidad con sistemas regulatorios.
- Capacidad de procesar documentos largos dividiendolos en segmentos de hasta 512 tokens, aunque no se especifica un manejo especial de contextos largos.

## Casos de uso

- Analisis de informes financieros: extraer automaticamente KPIs como ingresos netos, EBITDA o margen bruto de documentos 10-K, reduciendo el tiempo de revision manual por parte de analistas.
- Automatizacion de procesos de auditoria: verificar la consistencia de los datos financieros reportados en diferentes secciones de un informe, detectando discrepancias entre valores etiquetados.
- Construccion de bases de datos comparativas: extraer KPIs de multiples empresas para crear datasets historicos que permitan analisis sectoriales y benchmarking.
- Integracion en sistemas de gestion documental: clasificar parrafos financieros dentro de repositorios corporativos para facilitar busquedas semanticas y recuperacion de informacion.
- Asistencia a analistas de inversion: localizar rapidamente metricas clave en informes trimestrales y anuales, acelerando la toma de decisiones.
- Cumplimiento regulatorio: generar etiquetas XBRL consistentes a partir de texto libre, ayudando a las empresas a preparar sus reportes de acuerdo con los estandares de la SEC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para BERT-SL1000 en la informacion disponible. La model card menciona que, en el subconjunto HiFi-KPI-Lite, los modelos basados en encoder alcanzan un macro-F1 superior a 0,906 en tareas de clasificacion, y que los modelos de lenguaje grandes (LLMs) logran un F1 de 0,440 en extraccion estructurada. Sin embargo, estos datos no se atribuyen directamente a este modelo, por lo que no se pueden presentar como resultados propios.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 440 MB en fp32, 220 MB en fp16 y 110 MB en int8 (estimacion para 110 millones de parametros).
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, como una GTX 1060, RTX 2080 o superior. Tambien puede ejecutarse en CPU con latencia aceptable para tareas por lotes.
- Es compatible con GPUs de consumo, incluyendo tarjetas de gama media y baja.
- Opciones de despliegue: transformers (pipeline de token-classification), vLLM, TGI, o servidores de inferencia como text-embeddings-inference (indicado en los tags).
- Latencia y throughput: no se dispone de datos concretos, pero al ser un modelo BERT base, la inferencia es rapida, tipicamente en el orden de milisegundos por secuencia en GPU moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (extraccion de KPIs financieros con etiquetado jerarquico). Existen variantes como AAU-NLP/Pre-FLANG-BERT-SL1000 o AAU-NLP/Cal-BERT-SL1000, pero no se han encontrado especificaciones ni resultados publicados que permitan una comparacion rigurosa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo soporta ingles, limitando su uso a documentos financieros en ese idioma.
- La longitud de contexto esta limitada a 512 tokens (tipica de BERT base), por lo que documentos largos deben segmentarse, lo que puede perder informacion contextual entre segmentos.
- El entrenamiento se realizo solo con las 1.000 etiquetas mas frecuentes del dataset HiFi-KPI, lo que puede no cubrir todas las variantes de KPIs presentes en la taxonomia completa (198.000 etiquetas).
- Al ser un modelo de clasificacion de tokens, puede presentar errores de alucinacion en etiquetas poco frecuentes o en contextos ambiguos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo esta especializado en el dominio financiero estadounidense y puede no generalizar bien a otros formatos de informes o jurisdicciones.
- No se han publicado evaluaciones de sesgos o robustez ante ataques adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AAU-NLP/BERT-SL1000
- Paper (HiFi-KPI): https://huggingface.co/papers/2502.15411
- Dataset HiFi-KPI: https://huggingface.co/datasets/AAU-NLP/HiFi-KPI
- Repositorio de codigo: https://github.com/aaunlp/HiFi-KPI
