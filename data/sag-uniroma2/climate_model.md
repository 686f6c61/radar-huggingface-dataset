# sag-uniroma2/Climate_MODEL

## Resumen

Climate_MODEL es un clasificador binario de texto en ingles especializado en detectar divulgaciones de sostenibilidad de tematica climatica en informes corporativos. Lo desarrolla el grupo sag-uniroma2 (Universidad de Roma Tor Vergata) como parte del sistema UniTor ESG Insights, presentado en CIKM 2026, una plataforma interactiva con intervencion humana para el analisis trazable de informes de sostenibilidad. El modelo distingue entre fragmentos con contenido climatico y fragmentos sin el.

Tecnicamente es un fine-tuning de ClimateBERT (`distilroberta-base-climate-f`), una variante destilada de RoBERTa entrenada originalmente sobre literatura climatica. No es un modelo generativo: su salida es una etiqueta de clasificacion, lo que lo situa en el segmento de modelos encoder pequenos para tareas de NLP financiero y ESG. Su relevancia actual radica en la presion regulatoria (CSRD, taxonomia verde) que obliga a las empresas a publicar informes extensos donde localizar automaticamente las secciones climaticas es un paso previo a cualquier analisis posterior.

El modelo se entreno sobre un conjunto de 586 muestras (355 climaticas, 231 no climaticas) y reporta una exactitud del 93,3 % y un macro F1 del 93,0 % en validacion cruzada de 10 particiones. Su huella es minima (repo de 0,3 GB) y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilRoBERTa, base de ClimateBERT) |
| Parametros totales | no disponible (arquitectura DistilRoBERTa, aproximadamente 82 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de DistilRoBERTa, no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0,3 GB, pesos de Hugging Face Transformers) |

## Arquitectura y entrenamiento

El modelo parte de `climatebert/distilroberta-base-climate-f`, un encoder DistilRoBERTa con atencion bidireccional y objetivo de modelado de lenguaje enmascarado, ajustado previamente sobre corpus climatico. Sobre esa base se realiza un fine-tuning supervisado para clasificacion binaria de secuencias, anadiendo una cabeza de clasificacion sobre el token especial de agregacion. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un modelo discriminativo.

El conjunto de entrenamiento consta de 586 muestras etiquetadas (355 climaticas, 231 no climaticas). La evaluacion se realizo mediante validacion cruzada de 10 particiones, usando cada particion una vez como conjunto de test, y se reportan medias y desviaciones tipicas. Adicionalmente se realizo una evaluacion externa con 1.768 muestras combinadas de entrenamiento, alcanzando 90,2 % de exactitud y 86,5 % de macro F1, y una prueba interna de tematica climatica con 89,0 % de exactitud y 88,7 % de macro F1. No se especifican la composicion exacta del dataset, la procedencia de los informes ni el numero de tokens de entrenamiento.

## Capacidades

- Clasificacion binaria de fragmentos de texto: etiqueta si un parrafo o seccion contiene divulgacion climatica o no.
- Procesamiento de texto en ingles procedente de informes de sostenibilidad y memorias corporativas.
- Integracion en un pipeline de analisis ESG junto a otros modelos especializados del sistema UniTor ESG Insights (alineacion SDG/GRI, evaluacion de calidad de divulgacion).
- Trazabilidad de predicciones: el sistema asociado permite explorar cada prediccion junto al parrafo original y la pagina del PDF de origen.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Filtrado previo en pipelines de analisis ESG: dado un informe anual de cientos de paginas, el modelo clasifica cada parrafo y descarta los no climaticos antes de pasarlos a modelos mas costosos de extraccion o resumen, reduciendo el volumen de entrada de forma sustancial.
- Cumplimiento normativo CSRD: localizacion automatica de las secciones que abordan riesgos y oportunidades climaticos para verificar que el informe cubre los requisitos de divulgacion exigidos por la directiva.
- Construccion de datasets etiquetados: uso del clasificador para preetiquetar grandes corpus de informes corporativos y acelerar la anotacion humana en proyectos de investigacion sobre divulgacion climatica.
- Monitorizacion de carteras de inversion: analisis periodico de los informes de empresas en cartera para medir la proporcion de contenido climatico y detectar cambios en la estrategia de divulgacion entre ejercicios.
- Investigacion academica en finanzas sostenibles: clasificacion reproducible de corpus para estudios sobre greenwashing, comparando la extension de la divulgacion climatica con las emisiones reales reportadas.
- Enriquecimiento de bases de datos documentales: indexacion semantica de repositorios de informes con una etiqueta climatica que permita busquedas filtradas por tematica dentro de plataformas de analisis financiero.
- Integracion en el sistema UniTor ESG Insights: uso como modulo de deteccion climatica dentro del flujo interactivo con intervencion humana, donde el analista revisa y corrige las predicciones sobre el documento original.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Exactitud (validacion cruzada 10-fold) | 93,3 % ± 2,7 |
| Macro F1 (validacion cruzada 10-fold) | 93,0 % ± 2,9 |
| Exactitud en benchmark externo (1.768 muestras) | 90,2 % |
| Macro F1 en benchmark externo | 86,5 % |
| Exactitud en test interno climatico | 89,0 % |
| Macro F1 en test interno climatico | 88,7 % |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un clasificador especializado y no de un modelo generativo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 para un encoder DistilRoBERTa; en la practica cabe en cualquier GPU consumer, e incluso en CPU con latencia aceptable para lotes pequenos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para procesamiento por lotes a gran escala se recomienda cualquier GPU con al menos 4 GB (GTX 1650, RTX 3060, T4).
- Cabe en cualquier GPU consumer, incluidas integradas en portatiles, y en instancias CPU de bajo coste.
- Opciones de despliegue: Hugging Face Transformers (pipeline de text-classification), TorchServe, ONNX Runtime, FastAPI con transformers, o exportacion a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles en la informacion proporcionada; para un encoder de este tamano se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sag-uniroma2/Climate_MODEL | Clasificador binario (fine-tuning) | no disponible (base DistilRoBERTa) | no disponible | Apache 2.0 | Hugging Face |
| climatebert/distilroberta-base-climate-f | Encoder preentrenado en dominio climatico | no disponible (DistilRoBERTa) | no disponible | no disponible en la informacion | Hugging Face |
| climatebert/distilroberta-base-climate-detector | Clasificador de texto climatico | no disponible (DistilRoBERTa) | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a la categoria y la licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: no es fiable para informes en castellano u otros idiomas sin un fine-tuning adicional.
- Conjunto de entrenamiento pequeno (586 muestras): el modelo puede generalizar de forma limitada a dominios distintos de los informes de sostenibilidad usados en el entrenamiento; la caida de rendimiento en el benchmark externo (90,2 % de exactitud frente a 93,3 % interno) sugiere cierta sensibilidad al cambio de distribucion.
- Riesgo de falsos negativos en divulgaciones climaticas implicitamente redactadas (por ejemplo, referencias a transicion energetica sin la palabra clima), dado que el modelo aprende patrones lexicos del corpus de entrenamiento.
- No es un modelo generativo: no puede justificar sus predicciones por si mismo; la trazabilidad depende del sistema UniTor ESG Insights que lo envuelve.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se documentan garantias ni soporte por parte del autor.
- Sin datos publicados sobre sesgos especificos del modelo; al derivar de ClimateBERT, hereda los sesgos del corpus climatico original, no caracterizados en la informacion disponible.
- No se especifican limitaciones de longitud de contexto mas alla de las heredadas de DistilRoBERTa; fragmentos muy largos pueden truncarse y perder informacion relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sag-uniroma2/Climate_MODEL
- Demo interactiva: https://huggingface.co/spaces/sag-uniroma2/UniTorESGInsights
- Repositorio GitHub: https://github.com/crux82/UniTorESGInsights
- Coleccion completa de modelos: https://huggingface.co/collections/sag-uniroma2/unitoresginsights
- Paper (CIKM 2026): https://doi.org/10.1145/3799682.3840253
- Modelo base: https://huggingface.co/climatebert/distilroberta-base-climate-f
