# cansucavuldak/IZ-Turkish-AML-Intelligence-Benchmark

## Resumen

IZ es un benchmark de investigación, no un modelo generativo entrenado, publicado por Cansu Cavuldak como investigadora independiente. Su objetivo es evaluar la fiabilidad de modelos de lenguaje de gran tamano (LLM) en la evaluacion de operaciones sospechosas de blanqueo de capitales (AML) en turco. El recurso combina un pipeline de deteccion basado en LightGBM sobre transacciones sinteticas con una fase de evaluacion mediante un LLM en turco, seguida de un analisis de consistencia de decisiones y una auditoria de la fiabilidad de las explicaciones en lenguaje natural.

El benchmark aborda un problema poco cubierto: la mayoria de los recursos AML estan en ingles y se centran exclusivamente en metricas de clasificacion, sin auditar la coherencia interna ni la veracidad de las justificaciones generadas por el modelo. IZ propone medir tres dimensiones sobre un subconjunto de transacciones que el baseline LightGBM clasifico como negativas, lo que permite estudiar falsos negativos y la capacidad del LLM de detectar casos sutiles.

El repositorio tiene 0 GB de tamano declarado, 0 descargas y 0 likes en el momento de la consulta, y se distribuye bajo licencia "other" con idioma declarado `tr`. No se trata de un modelo con pesos publicados, sino de un conjunto de artefactos de evaluacion (manuscrito, resultados y visualizaciones) orientados a documentacion de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el recurso es un benchmark; el LLM evaluado no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (`tr`) |
| Licencia | other |
| Formato de pesos | no disponible (no se publican pesos; se incluyen PDF, Markdown y PNG) |

## Arquitectura y entrenamiento

IZ no entrena un modelo propio. El pipeline descrito en la model card encadena: generacion de transacciones AML sinteticas, un baseline temporal LightGBM, seleccion de predicciones negativas, evaluacion con un LLM en turco, analisis de consistencia de decisiones y auditoria de fiabilidad de explicaciones. El LLM concreto utilizado en la evaluacion no se identifica en la informacion disponible, por lo que no pueden detallarse arquitectura, numero de parametros, tokens de entrenamiento ni si hubo RLHF o DPO.

El dataset declarado contiene 772.652 transacciones. El baseline LightGBM alcanza un ROC-AUC de 0,9253 y un Average Precision de 0,3958. La evaluacion del LLM se realizo sobre una muestra de 500 transacciones seleccionadas, que contenian solo cinco casos AML positivos, por lo que la model card advierte explicitamente que los resultados del baseline y del LLM no son directamente comparables. La auditoria de explicaciones es parcialmente automatizada y no estima la prevalencia de alucinaciones a nivel poblacional.

## Capacidades

- Evaluacion de deteccion AML en transacciones sinteticas en turco sobre un subconjunto de negativos del baseline.
- Medicion de consistencia interna de decisiones generadas por LLM (se detectaron 54 decisiones contradictorias de 500, un 10,8%).
- Auditoria de fiabilidad de explicaciones en lenguaje natural mediante cribado heuristico y verificacion basada en reglas.
- Documentacion reproducible de resultados con artefactos en Markdown y PNG.
- Soporte de analisis de inferencia selectiva (selective inference) segun los artefactos publicados.
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Auditoria de sistemas AML existentes: usar el benchmark para comprobar si un LLM integrado en un flujo de compliance detecta falsos negativos que un modelo tabular como LightGBM deja pasar, aprovechando la seleccion de negativos del pipeline.
- Investigacion academica en NLP financiero en turco: el conjunto de 772.652 transacciones sinteticas y los artefactos de evaluacion permiten reproducir experimentos sobre deteccion y explicabilidad en un idioma con pocos recursos de este tipo.
- Evaluacion de explicabilidad (XAI) en dominios regulados: la auditoria de 311 explicaciones con etiquetado de errores (168 con error, 8 sin error detectado, 135 sin resolver) sirve como plantilla para medir la calidad de justificaciones en informes de sospecha.
- Pruebas de consistencia de LLM en produccion: el analisis de decisiones contradictorias (10,8%) puede reutilizarse como test de regresion al cambiar de modelo o de prompt en un sistema de triaje de alertas.
- Formacion y divulgacion en compliance: el manuscrito y las visualizaciones permiten ilustrar por que un LLM no debe sustituir sin validacion a un sistema de deteccion ya desplegado.
- Diseno de experimentos de inferencia selectiva: los artefactos de selective inference sirven para estudiar umbrales de abstenccion en modelos aplicados a decisiones financieras de alto riesgo.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---:|
| Transacciones del dataset | 772.652 |
| LightGBM ROC-AUC | 0,9253 |
| LightGBM Average Precision | 0,3958 |
| Muestra evaluada por el LLM | 500 |
| Precision del LLM | 5,56% |
| Recall del LLM | 20,00% |
| Decisiones contradictorias del LLM | 54 / 500 (10,8%) |
| Explicaciones marcadas examinadas | 311 |

Auditoria de fiabilidad de explicaciones sobre las 311 seleccionadas:

| Resultado de auditoria | Recuento |
|---|---:|
| Explicaciones etiquetadas con error | 168 |
| Sin error detectado en las afirmaciones comprobadas | 8 |
| Sin resolver o sin verificar | 135 |
| Total seleccionado para revision | 311 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- No disponible: el recurso no publica pesos ni especifica el LLM evaluado, por lo que no puede estimarse VRAM de inferencia.
- No disponible: no se indican GPU recomendadas (A100, H100, RTX 4090 u otras).
- No disponible: no puede confirmarse si el modelo evaluado cabe en GPU de consumo.
- Opciones de despliegue: no disponibles para este recurso; el pipeline descrito requiere LightGBM y un LLM en turco no identificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica el LLM evaluado ni ofrece benchmarks comparables con otros recursos AML en turco, por lo que no es posible establecer una comparativa fiable de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El propio autor declara que IZ es un benchmark experimental y no un sistema AML validado para produccion.
- El pipeline completo no ha sido reproducido de forma independiente de extremo a extremo.
- La comparacion entre LightGBM y el LLM no es valida: la muestra de 500 transacciones contiene solo cinco positivos AML, lo que infla la varianza de las metricas de precision y recall.
- La auditoria de explicaciones usa cribado heuristico y verificacion basada en reglas; sus resultados no deben interpretarse como tasa de alucinacion poblacional.
- Los 135 casos sin resolver no pueden clasificarse ni como errores verificados ni como explicaciones correctas.
- La licencia es "other" y la model card advierte que los requisitos de redistribucion y licencia del dataset deben verificarse antes de su publicacion; el uso comercial no esta claro.
- El repositorio tiene 0 GB declarados y 0 descargas, sin evidencia de validacion por terceros.
- El alcance linguistico se limita al turco, sin datos sobre otros idiomas.
- Riesgo de sesgo: las transacciones son sinteticas, por lo que pueden no reflejar la distribucion real de tipologias AML.

## Enlaces

- Hugging Face: https://huggingface.co/cansucavuldak/IZ-Turkish-AML-Intelligence-Benchmark
- Manuscrito (PDF): papers/IZ_Turkish_AML_Intelligence_Benchmark_Cansu_Cavuldak_Manuscript.pdf (ruta relativa dentro del repositorio)
- Manuscrito (Markdown): papers/IZ_Turkish_AML_Intelligence_Benchmark_Cansu_Cavuldak_Manuscript.md (ruta relativa dentro del repositorio)
- Resultados del benchmark: results/benchmark_results.md (ruta relativa dentro del repositorio)
- Resultados de deteccion: results/iz_detection_results.png (ruta relativa dentro del repositorio)
- Fiabilidad de explicaciones: results/iz_explanation_reliability.png (ruta relativa dentro del repositorio)
- Inferencia selectiva: results/iz_selective_inference.png (ruta relativa dentro del repositorio)
- Citacion: Cavuldak, C. (2026). IZ: A Turkish AML Intelligence Benchmark for Detection and Explanation Reliability. Unpublished research manuscript.
