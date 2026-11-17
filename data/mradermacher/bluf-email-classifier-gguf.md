# mradermacher/BLUF-Email-Classifier-GGUF

## Resumen

BLUF-Email-Classifier-GGUF es la version cuantizada en formato GGUF del modelo danielrosehill/BLUF-Email-Classifier, un clasificador de texto basado en SetFit (Sentence Transformers + fine-tuning de cabeza de clasificacion) disenado para etiquetar correos electronicos segun el principio BLUF (Bottom Line Up Front, "conclusion primero"). Lo publica mradermacher, un conocido empaquetador de cuantizaciones GGUF, no el autor original del modelo. El objetivo del modelo es clasificar correos electronicos en ingles segun su estructura BLUF, una convencion de comunicacion militar y corporativa que exige que la conclusion o peticion principal aparezca al inicio del mensaje.

El modelo base cuenta con 33.212.160 parametros (aproximadamente 33 millones), lo que lo situa en la categoria de modelos pequenos de clasificacion, no de generacion. Se ha entrenado sobre el dataset sintetico danielrosehill/BLUF-Email-Synthetic y esta pensado para tareas de clasificacion binaria o multiclase de correos, no para generacion de texto libre. Su relevancia actual radica en que permite desplegar un clasificador de correos extremadamente ligero (menos de 0,2 GB en f16) en entornos con recursos limitados, CPU o dispositivos perifericos, usando llama.cpp u otros runners compatibles con GGUF.

La ficha describe tanto las caracteristicas del modelo base como las particularidades de esta version cuantizada, incluyendo los tipos de cuantizacion disponibles (de Q2_K a f16), su licencia MIT y sus limitaciones al tratarse de un modelo de clasificacion y no de un LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (Sentence Transformer + cabeza de clasificacion) |
| Parametros totales | 33.212.160 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SetFit, que combina un modelo de embeddings de frases (Sentence Transformer) con una cabeza de clasificacion entrenada mediante few-shot fine-tuning. A diferencia de un transformer generativo, SetFit produce representaciones vectoriales del texto de entrada y las pasa por un clasificador lineal para asignar etiquetas. El modelo base danielrosehill/BLUF-Email-Classifier se entreno sobre el dataset sintetico danielrosehill/BLUF-Email-Synthetic, compuesto por correos electronicos en ingles etiquetados segun su conformidad con el principio BLUF. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de este tipo).

La version GGUF ha sido generada por mradermacher mediante conversion desde el formato Hugging Face (convert_type: hf) y cuantizacion estatica (quantize_version 2, output_tensor_quantised 1). No se han generado cuantizaciones ponderadas con imatrix para este modelo segun la model card. El proceso de cuantizacion reduce el tamano del modelo desde aproximadamente 0,2 GB en f16 hasta 0,1 GB en las cuantizaciones mas agresivas, manteniendo la funcionalidad de clasificacion.

## Capacidades

- Clasificacion de correos electronicos en ingles segun el principio BLUF (conclusion primero).
- Extraccion de caracteristicas (feature-extraction) gracias a la base de Sentence Transformer.
- Clasificacion de texto corto a medio (cuerpos de correo electronico).
- Inferencia en CPU y entornos con recursos muy limitados gracias al reducido tamano del modelo.
- Compatible con endpoints y runners que aceptan formato GGUF (llama.cpp, entre otros).
- No soporta generacion de texto libre, razonamiento multi-paso, tool calling ni function calling.
- No soporta vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Filtrado y priorizacion de bandejas de entrada: el modelo puede clasificar correos entrantes segun si siguen la estructura BLUF, permitiendo enrutar mensajes claros y accionables a colas de atencion prioritaria y mensajes difusos a revision manual.
- Auditoria de comunicacion corporativa: analizar lotes de correos internos para medir el grado de adopcion de la convencion BLUF en equipos y departamentos, generando metricas agregadas de calidad comunicativa.
- Entrenamiento y formacion: usar el clasificador como herramienta de feedback automatico en cursos de comunicacion escrita, indicando al remitente si su correo cumple el estandar BLUF.
- Preprocesamiento en pipelines de automatizacion: integrar el clasificador como primer paso en un pipeline que decide si un correo requiere respuesta automatica, escalado o archivo, usando la etiqueta BLUF como senal de accionabilidad.
- Moderacion y triaje en soporte al cliente: clasificar tickets de correo para detectar mensajes con peticion clara al inicio y priorizarlos frente a mensajes ambiguos, reduciendo el tiempo medio de primera respuesta.
- Despliegue en edge o entornos air-gapped: al ocupar menos de 0,2 GB en f16 y funcionar en CPU, puede ejecutarse en servidores modestos, contenedores ligeros o dispositivos locales sin GPU, cumpliendo requisitos de privacidad al no enviar correos a servicios externos.
- Investigacion sobre comunicacion escrita: servir como herramienta de anotacion automatica en estudios sobre estructura de correos electronicos y eficacia comunicativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en todas las cuantizaciones; el f16 ocupa aproximadamente 0,2 GB y las cuantizaciones de 2 a 8 bits alrededor de 0,1 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) puede ejecutarlo sobradamente, pero el modelo esta disenado para funcionar en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos de bajos recursos; el cuello de botella sera la memoria del sistema, no la VRAM.
- Opciones de despliegue: llama.cpp, runners compatibles con GGUF, y el modelo original en transformers con la libreria SetFit. No se recomienda vLLM ni TGI para este tipo de modelo de clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por muestra en CPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BLUF-Email-Classifier-GGUF | 33,2 M | no disponible | Clasificacion de correos BLUF | MIT | GGUF en Hugging Face |
| danielrosehill/BLUF-Email-Classifier | 33,2 M | no disponible | Clasificacion de correos BLUF | MIT | safetensors/transformers en Hugging Face |
| Clasificadores SetFit genericos | variable (tipicamente 30-110 M) | no disponible | Clasificacion de texto few-shot | variable | Hugging Face |
| Modelos de embeddings tipo all-MiniLM | ~22 M | 256 tokens (tipico) | Embeddings y clasificacion | Apache 2.0 | Hugging Face |

La comparativa con alternativas genericas de clasificacion es aproximada, ya que no se dispone de datos de rendimiento especificos del modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificacion de correos en ingles; no es un modelo generativo y no debe usarse para tareas de generacion, razonamiento o conversacion.
- Entrenado sobre un dataset sintetico, lo que puede introducir sesgos de distribucion y limitar la generalizacion a correos reales de dominios diversos.
- Riesgo de falsos positivos y negativos en la clasificacion BLUF, especialmente con correos que mezclan estilos o usan estructuras no convencionales.
- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado ni documentado.
- La licencia MIT permite uso comercial, pero el autor original del modelo base y el cuantizador no ofrecen garantias sobre el rendimiento en produccion.
- Al ser una cuantizacion estatica sin imatrix, las versiones de menor bits (Q2_K, Q3_K_S) pueden degradar la calidad de clasificacion; se recomienda Q4_K_M o superior para produccion.
- No se dispone de informacion sobre sesgos demograficos, etnicos o de otro tipo en el dataset de entrenamiento.
- La fecha de creacion del repositorio (2026-11-17) y la ausencia de descargas y likes indican que el modelo es muy reciente y no ha sido validado por la comunidad.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/BLUF-Email-Classifier-GGUF
- Modelo base: https://huggingface.co/danielrosehill/BLUF-Email-Classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/danielrosehill/BLUF-Email-Synthetic
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#BLUF-Email-Classifier-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
