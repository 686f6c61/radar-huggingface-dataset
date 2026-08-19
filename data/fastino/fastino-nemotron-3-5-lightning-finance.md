# fastino/Fastino-Nemotron-3.5-Lightning-Finance

## Resumen

Fastino-Nemotron-3.5-Lightning-Finance es un modelo de lenguaje especializado en razonamiento financiero, extracción de información y análisis de documentos, desarrollado por Fastino Labs en colaboración con NVIDIA. Se trata de un modelo de tipo mixture-of-experts (MoE) con aproximadamente 30.000 millones de parámetros totales y 3.000 millones de parámetros activos, construido a partir del checkpoint base NVIDIA Nemotron-3.5-Lightning de julio de 2026. El modelo se distribuye bajo licencia Apache 2.0 y está orientado exclusivamente al idioma inglés.

El modelo ha sido ajustado mediante LoRA (rank 32) sobre un conjunto de 13.698 ejemplos de-finidos y curados automáticamente por el agente de fine-tuning de Fastino. El proceso de post-entrenamiento fue dirigido por un agente autónomo que exploró mezclas de datos, hiperparámetros y estrategias de evaluación, lo que constituye una innovación relevante en el ámbito del ajuste fino automatizado. Los resultados publicados muestran mejoras significativas frente al modelo base en benchmarks financieros como FinQA, TAT-QA, SEC-Num y ConvFinQA, con incrementos de hasta 43 puntos porcentuales en precisión de ejecución.

La relevancia actual de este modelo reside en su carácter open-weight con licencia permisiva, su especialización en tareas financieras complejas (cálculo, extracción de spans numéricos, razonamiento sobre tablas) y su capacidad para ejecutarse en hardware de gama alta con una sola GPU de 80 GB o mediante paralelismo tensorial. Su publicación responde a la demanda de modelos especializados en dominios verticales que puedan integrarse en flujos de trabajo de análisis financiero, investigación y atención al cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), tipo nemotron_h |
| Parametros totales | 31.577.937.344 (30B declarados por el autor) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | No especificada (el quickstart usa max_model_len=4096 como ejemplo) |
| Tipos de cuantizacion | No disponibles (pesos publicados en BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de NVIDIA Nemotron-3.5-Lightning, que combina un conjunto de expertos activados de forma dispersa para reducir el coste computacional en inferencia. Con 30B parámetros totales y solo 3B activos por token, ofrece un equilibrio entre capacidad y eficiencia, permitiendo su despliegue en GPUs de alta gama o mediante paralelismo tensorial.

El post-entrenamiento fue realizado por el agente de fine-tuning de Fastino, un sistema autónomo que construyó conjuntos de evaluación, curó datos, exploró mezclas de entrenamiento e hiperparámetros, recuperó experimentos fallidos y seleccionó el checkpoint final. El adaptador ganador se entrenó sobre 13.698 ejemplos des-duplicados, cubriendo tareas de cálculo financiero, QA híbrido sobre texto y tablas, razonamiento empresarial-financiero, extracción de spans numéricos de informes SEC, reconocimiento de entidades financieras y trayectorias de investigación financiera con fuentes. El entrenamiento se realizó desde el checkpoint base durante dos épocas con LoRA rank 32, learning rate de 1e-4 y sin sequence packing. Las filas de evaluación de benchmarks fueron excluidas del entrenamiento y se eliminaron duplicados exactos dentro de cada fuente.

## Capacidades

- Razonamiento financiero ejecutable: realiza cálculos sobre documentos financieros y explica los pasos intermedios.
- Preguntas y respuestas numéricas sobre documentos y tablas híbridas (texto + tabla).
- Extracción de spans numéricos de informes SEC (por ejemplo, cifras concretas en disclosures).
- Reconocimiento de entidades financieras (FinEntity) con macro-F1 de 79,54 en el conjunto de prueba.
- Análisis conversacional multi-turno sobre datos financieros (ConvFinQA).
- Investigación financiera con trazabilidad de fuentes, generando trayectorias de razonamiento ancladas a documentos.
- Capacidad multilingüe limitada al inglés; no se reporta soporte para otros idiomas.
- No se menciona soporte explícito de tool calling ni function calling en la documentación disponible.
- No se indica capacidad de vision ni audio; el modelo es exclusivamente de texto.

## Casos de uso

- Analisis de informes anuales (10-K, 10-Q): el modelo puede extraer cifras clave, calcular ratios financieros y responder preguntas específicas sobre partidas concretas, aprovechando su entrenamiento en SEC-Num y BizFinBench.
- Verificacion de calculos financieros: dado un estado financiero y una operación propuesta, el modelo puede ejecutar el cálculo paso a paso y validar el resultado, útil en auditoría y control interno.
- Atencion al cliente en banca y finanzas: gracias a su capacidad de razonamiento conversacional (ConvFinQA), puede mantener diálogos multi-turno sobre saldos, transacciones o productos, siempre que se le proporcionen los datos en contexto.
- Extraccion de entidades y cifras en contratos o informes: reconoce entidades financieras (nombres de empresas, instrumentos, métricas) y extrae valores numéricos con alta precisión, facilitando la automatización de procesos de documentación.
- Investigacion financiera con fuentes: genera respuestas ancladas a documentos de referencia, útil para analistas que necesitan verificar la procedencia de cada dato en informes de inversión.
- QA sobre bases de datos tabulares: al manejar tablas híbridas (TAT-QA), puede responder preguntas que combinan texto y tablas, como comparativas de ingresos entre trimestres o cálculo de variaciones.
- Asistente para preparacion de informes regulatorios: ayuda a redactar secciones de disclosures financieros, extrayendo y formateando datos numéricos de documentos previos.
- Formacion y educacion financiera: puede explicar conceptos y resolver ejercicios de análisis financiero, aunque su licencia y especialización lo hacen más adecuado para uso profesional.

## Benchmarks y rendimiento

Los siguientes resultados han sido publicados por el autor en la model card. Se comparan el modelo base Nemotron-3.5-Lightning y el modelo ajustado Fastino-Finance. Los valores corresponden a la evaluación realizada por el agente de Fastino, con el mismo conjunto de ejemplos, prompts, parámetros de decodificación y evaluador para cada fila.

### Benchmarks in-domain

| Benchmark | Alcance de evaluacion | Nemotron base | Fastino-Finance | Cambio |
|---|---|---|---|---|
| FinQA, precision de ejecucion | dev, n=883 | 15,86% | 59,23% | +43,37 pp |
| TAT-QA, F1 | dev, n=1.668 | 19,01 | 56,63 | +37,62 |
| SEC-Num | matched, n=992 | 79,74% | 87,60% | +7,86 pp |
| FinEntity, macro-F1 | held-out, 3 ejecuciones de n=197 | 60,16 | 79,54 | +19,38 |
| BizFinBench, macro 9 tareas | 690 filas | 49,65% | 57,46% | +7,81 pp |

### Transferencia a benchmarks no vistos

| Benchmark | Alcance de evaluacion | Nemotron base | Fastino-Finance | Cambio |
|---|---|---|---|---|
| ConvFinQA | held-out, n=300 | 15,00% | 57,33% | +42,33 pp |
| FiQA, macro-F1 | held-out, n=1.058 | 35,09 | 41,48 | +6,39 |

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible. Los datos presentados son exclusivamente del dominio financiero.

## Requisitos de hardware

- Los pesos publicados estan en BF16 y requieren aproximadamente 66 GB de memoria antes de overhead en runtime.
- Se recomienda una GPU con 80 GB o mas de VRAM (por ejemplo, NVIDIA A100 80GB, H100 80GB) o paralelismo tensorial entre varias GPUs.
- No se ha confirmado compatibilidad con GPUs de consumo como RTX 4090 (24 GB) sin cuantizacion; dado que no se ofrecen cuantizaciones, no es viable en GPUs de gama consumer con menos de 66 GB.
- Opciones de despliegue: el quickstart oficial utiliza vLLM (version 0.23.0) con `trust_remote_code=True`. Tambien es compatible con el ecosistema transformers de Hugging Face.
- No se dispone de datos de latencia o throughput publicados por el autor.
- El tamaño del repositorio es de 131,7 GB, lo que implica requisitos de almacenamiento considerables.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con otras alternativas especializadas en finanzas del mismo rango de parametros. Los unicos datos comparativos publicados son frente al modelo base Nemotron-3.5-Lightning, que se muestran en la seccion de benchmarks. Modelos como FinGPT, BloombergGPT o FinMA no tienen resultados comparables publicados en la misma configuracion de evaluacion, por lo que no se puede establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Modelo especializado: su rendimiento fuera de las tareas financieras evaluadas no ha sido caracterizado de forma exhaustiva.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en contextos no cubiertos por sus datos de entrenamiento.
- Idioma: solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas.
- Contexto limitado: aunque no se especifica la longitud maxima de contexto, el ejemplo de uso emplea 4096 tokens; para documentos largos puede ser necesario truncar o segmentar.
- No sustituye asesoramiento financiero profesional: las salidas no deben utilizarse como base para decisiones de inversion o cumplimiento normativo sin validacion independiente.
- Requisitos de hardware elevados: los pesos en BF16 exigen al menos 66 GB de VRAM, lo que limita su despliegue en infraestructuras modestas.
- Dependencia de `trust_remote_code`: el modelo requiere ejecutar codigo personalizado (nemotron_h), lo que implica un riesgo de seguridad adicional en entornos de produccion.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo en el sector financiero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Finance
- Blog de lanzamiento: https://fastino.ai/blog/fastino-nemotron-3-5-lightning-finance-and-healthcare/
- Articulo arXiv (agente de fine-tuning): https://arxiv.org/abs/2604.09791
- Colaboracion Fastino-NVIDIA: https://fastino.ai/nvidia-collaboration
- Nota de prensa en Yahoo Finance: https://finance.yahoo.com/technology/ai/articles/fastino-labs-releases-two-specialized-140300842.html
- Noticia en Agentic Design: https://agentic-design.ai/news-hub/introducing-fastino-nemotron-3-5-lightning-finance-fastino-nemotron-3-633fd8
- Modelo base NVIDIA Nemotron-3.5-Lightning: https://huggingface.co/nvidia/Nemotron-3.5-Lightning
