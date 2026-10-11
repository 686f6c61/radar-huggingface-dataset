# mradermacher/Llama-Fin-8b-GGUF

## Resumen

Llama-Fin-8b-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Salesforce/Llama-Fin-8b, generado por el usuario mradermacher. El modelo original lo desarrolla Salesforce y se presenta como un ajuste fino orientado al dominio financiero, entrenado a partir de los conjuntos de datos Salesforce/FinTrain y Salesforce/FinEval. Este repositorio no contiene pesos nuevos: es una conversion de los pesos originales a una docena de niveles de cuantizacion para facilitar la inferencia en CPU y GPU de gama media mediante llama.cpp y derivados.

El modelo subyacente es un transformer denso de 8.030.261.248 parametros (aproximadamente 8.000 millones), lo que lo situa en la categoria de modelos pequenos que caben en GPUs de consumo. La informacion disponible no detalla la longitud de contexto del modelo base ni la composicion exacta del dataset de ajuste fino, mas alla de los dos conjuntos citados. El idioma declarado es unicamente el ingles.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo afinado para finanzas en hardware modesto gracias a las cuantizaciones que van de 3,3 GB (Q2_K) a 16,2 GB (f16); por otro, el repositorio esta marcado como compatible con endpoints, lo que simplifica su integracion en servicios de inferencia. La licencia cc-by-4.0 es permisiva para uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama, segun la nomenclatura del modelo base); el repositorio no detalla la configuracion interna |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 71,8 GB |
| Modelo base | Salesforce/Llama-Fin-8b |
| Datasets de ajuste | Salesforce/FinTrain, Salesforce/FinEval |
| Libreria declarada | transformers |
| Descargas / likes | 385 / 1 |
| Fecha de creacion | 2025-10-22 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye la ficha tecnica del modelo original Salesforce/Llama-Fin-8b, por lo que no se dispone de detalles verificados sobre el numero de capas, cabezas de atencion, tipo de atencion, presupuesto de tokens de entrenamiento ni la composicion concreta del dataset. Por la nomenclatura y el recuento de parametros (8.030 millones), el modelo base sigue la familia arquitectonica Llama en su variante de 8.000 millones de parametros, un transformer denso con atencion causal estandar. Los unicos datos confirmados sobre el entrenamiento son los dos conjuntos de datos citados en la model card: Salesforce/FinTrain (entrenamiento) y Salesforce/FinEval (evaluacion), ambos orientados al dominio financiero.

Lo que si documenta este repositorio es el proceso de cuantizacion, realizado con la herramienta de mradermacher. Segun los metadatos internos de la model card, se uso la version 2 del proceso de cuantizacion, con cuantizacion de tensores de salida activada y conversion de tipo hf. Se ofrecen exclusivamente cuantizaciones estaticas: el propio autor indica que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de publicacion, y que no las tiene planificadas salvo peticion explicita mediante una discusion de la comunidad.

## Capacidades

- Generacion de texto conversacional en ingles, con ajuste especifico para el dominio financiero segun los datasets declarados.
- El repositorio esta etiquetado como conversational y compatible con endpoints, lo que indica que los pesos se pueden servir mediante APIs de inferencia estandar.
- Capacidades de razonamiento financiero y respuesta a consultas del dominio, derivadas del ajuste fino sobre FinTrain y evaluadas con FinEval (siempre segun lo declarado por el autor del modelo base).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada; no hay indicios de soporte multimodal.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: la cuantizacion Q4_K_S (4,8 GB) o Q4_K_M (5,0 GB) permite ejecutar el modelo en CPU con llama.cpp, adecuado para prototipado y pruebas de concepto en entornos con recursos limitados.
- Analisis y resumen de documentacion financiera en ingles: el ajuste sobre FinTrain lo orienta a textos del sector, y su tamano de 8.000 millones de parametros permite procesar informes y notas en una sola GPU de consumo.
- Asistente conversacional interno para equipos de finanzas: su naturaleza conversacional y el formato GGUF facilitan levantarlo con Ollama o llama.cpp como servicio interno para consultas recurrentes sobre terminologia y conceptos financieros.
- Clasificacion y extraccion de entidades en textos economicos: al ser un modelo afinado en dominio, es util como base para tareas de etiquetado que despues se validan con reglas o modelos mas pequenos.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece doce niveles distintos del mismo modelo (de 3,3 GB a 16,2 GB), lo que lo convierte en un banco de pruebas practico para medir el impacto de la cuantizacion en la perplejidad y la calidad de salida.
- Educacion y experimentacion academica: la licencia cc-by-4.0 permite usar el modelo en materiales docentes y trabajos de investigacion sobre ajuste fino en dominios especializados, con la unica obligacion de atribucion.
- Integracion en pipelines de inferencia ligera: la compatibilidad con endpoints declarada facilita servirlo detras de una API compatible con OpenAI sin reescribir la capa de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye cifras de MMLU, HumanEval, GSM8K ni de las evaluaciones de FinEval, y no se han proporcionado resultados de perplejidad por nivel de cuantizacion. Tampoco se dispone de datos verificados sobre latencia o throughput.

## Requisitos de hardware

- VRAM estimada segun el tamano de fichero publicado, anadiendo aproximadamente 1-2 GB para el contexto y el runtime:
  - Q2_K: 3,3 GB de pesos; viable en GPUs con 4-6 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: 3,8-4,4 GB; viables en GPUs con 6 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: 4,6-5,0 GB; la opcion recomendada por el autor para equilibrio entre velocidad y calidad.
  - Q5_K_S / Q5_K_M: 5,7-5,8 GB; viables en GPUs con 8 GB.
  - Q6_K: 6,7 GB; requiere 8-10 GB.
  - Q8_0: 8,6 GB; requiere 10-12 GB.
  - f16: 16,2 GB; requiere 18-20 GB o mas.
- GPU recomendadas: para f16, una A100 40 GB, H100 o RTX 4090 de 24 GB; para Q8_0 y Q6_K, RTX 4090, RTX 3090 o A10G; para el resto, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Cabe en GPU de consumo: si, en practicamente todos los niveles salvo f16 en GPUs de 8 GB o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; tambien vLLM o TGI si se convierte a safetensors, aunque en ese caso es mas directo usar el repositorio original Salesforce/Llama-Fin-8b.
- Latencia y throughput estimados: no disponibles. Dependen en gran medida del nivel de cuantizacion, del backend y del hardware; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de sus alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa de modelos de tamano y categoria similares:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/Llama-Fin-8b-GGUF | 8.030 millones | no disponible | cc-by-4.0 | HuggingFace (GGUF) |
| Salesforce/Llama-Fin-8b | 8.030 millones | no disponible | no disponible en la informacion proporcionada | HuggingFace (pesos originales) |
| Otros modelos financieros de ~8B | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos que permitan comparar contexto, rendimiento o calidad frente a alternativas concretas.

## Limitaciones y advertencias

- Modelo especializado en ingles: no hay soporte declarado para castellano ni para otros idiomas, por lo que su uso en produccion multilingue requeriria evaluacion previa y probablemente no seria adecuado.
- Dominio restringido a finanzas: el ajuste fino sobre FinTrain y FinEval puede degradar su comportamiento generalista en tareas ajenas al sector financiero.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion. En un dominio donde los datos erroneos tienen consecuencias economicas, cualquier salida debe verificarse contra fuentes autorizadas antes de usarse para decisiones.
- Sesgos conocidos: no disponible. No se ha publicado informacion sobre analisis de sesgos, composicion demografica del dataset ni evaluaciones de equidad.
- Cuantizaciones agresivas: los niveles Q2_K y Q3_K pueden degradar notablemente la calidad y la coherencia de las respuestas. El propio autor etiqueta Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior.
- El autor advierte de que no existen cuantizaciones ponderadas ni con imatrix, lo que implica una perdida de calidad potencialmente mayor que la de repositorios que si las ofrecen.
- Licencia cc-by-4.0: permite uso comercial y modificacion con obligacion de atribucion, pero conviene verificar la licencia del modelo base Salesforce/Llama-Fin-8b, que no se detalla en la informacion proporcionada y podria imponer condiciones adicionales.
- Repositorio con muy poca adopcion (385 descargas y 1 like) y sin mantenimiento confirmado mas alla de la fecha de actualizacion indicada; no hay garantias de soporte ni de correccion de errores.
- No se ha confirmado si el modelo base es una variante de Llama con licencia Llama Community License, lo que afectaria a las condiciones reales de uso comercial.
- Sin datos de contexto maximo verificados, no se puede planificar su uso en casos que requieran ventanas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-Fin-8b-GGUF
- Modelo base: https://huggingface.co/Salesforce/Llama-Fin-8b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Llama-Fin-8b-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenido ajeno al ambito tecnico y se han descartado.
