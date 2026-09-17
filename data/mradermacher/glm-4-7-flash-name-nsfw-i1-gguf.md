# mradermacher/GLM-4.7-Flash-Name-NSFW-i1-GGUF

## Resumen

Esta ficha describe el repositorio `mradermacher/GLM-4.7-Flash-Name-NSFW-i1-GGUF`, publicado por el usuario mradermacher, conocido por producir cuantizaciones GGUF de terceros. No se trata de un modelo entrenado desde cero, sino de una version cuantizada con tecnicas imatrix (etiqueta `i1`) del modelo base `2048lr/GLM-4.7-Flash-Name-NSFW`, un ajuste fino de la familia GLM-4.7 en su variante Flash, orientado a conversacion y marcado explicitamente como `not-for-all-audiences` (contenido no apto para todas las audiencias). El dato real de parametros reportado en safetensors es de 29.943.393.920, es decir, en torno a 29,9 mil millones de parametros.

El interes practico del repositorio es doble. Por un lado, ofrece el modelo base en formato GGUF, lo que permite ejecutarlo en `llama.cpp` y derivados (Ollama, LM Studio, koboldcpp) sin necesidad de infraestructura de GPU de datacenter. Por otro, la cuantizacion se ha realizado con una matriz de importancia (imatrix), un metodo que reduce la perdida de calidad respecto a las cuantizaciones estaticas tradicionales en el mismo tamano de archivo, especialmente en bits bajos.

La relevancia es limitada pero concreta: el modelo esta pensado para despliegue local de un asistente conversacional afinado, con licencia MIT y un unico idioma declarado (chino, `zh`). No se dispone de informacion sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada, por lo que varias celdas de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de la familia GLM-4.7-Flash; no especificada en la informacion proporcionada) |
| Parametros totales | 29.943.393.920 (aprox. 29,9 B) |
| Parametros activos | No disponible (no se confirma que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en variantes i1/imatrix: Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL |
| Idiomas soportados | Chino (`zh`) |
| Licencia | MIT |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se proporciona informacion especifica sobre la arquitectura del modelo base `2048lr/GLM-4.7-Flash-Name-NSFW` mas alla de su pertenencia a la familia GLM y de la etiqueta `transformers` del repositorio. El recuento de parametros (29,9 B) es el unico dato estructural confirmado, obtenido directamente de los pesos en safetensors. No se documenta si se trata de una arquitectura densa o de mezcla de expertos (MoE), ni el numero de capas, dimensiones de atencion o mecanismo de atencion empleado.

En cuanto al entrenamiento, solo consta que el modelo base es un ajuste fino del usuario 2048lr sobre una variante Flash de GLM-4.7, con finalidad conversacional y etiquetado como NSFW. No hay informacion sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO, ni sobre tecnicas de alineacion. La innovacion tecnica documentada en este repositorio es exclusivamente del proceso de cuantizacion: se emplea una matriz de importancia (imatrix) generada a partir de datos de calibracion, con el objetivo de preservar mejor las activaciones relevantes en cuantizaciones de baja precision. El autor indica que las variantes IQ suelen ser preferibles a las no-IQ de tamano similar, y enlaza grafos comparativos de perplejidad elaborados por terceros.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Contenido NSFW, coherente con la etiqueta `not-for-all-audiences` y el nombre del modelo.
- Ejecucion en CPU y GPU mediante `llama.cpp` y derivados, gracias al formato GGUF.
- Uso como modelo local sin conexion a servicios externos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` del repositorio original).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o thinking mode: no disponible.
- Capacidades multilingues: no disponible; el unico idioma declarado es chino.

## Casos de uso

- Asistente conversacional local en chino: el modelo puede desplegarse con `llama.cpp` o Ollama en un equipo con GPU de consumo y mantener dialogos multi-turno sin enviar datos a terceros, lo que resulta adecuado para escenarios de privacidad estricta.
- Escritura creativa y narrativa: al ser un ajuste fino conversacional con licencia MIT, puede emplearse para generar relatos y dialogos de ficcion de forma local, incluyendo contenido para adultos cuando el contexto de uso lo permita.
- Base para nuevos ajustes finos: al publicarse en safetensors (modelo base) y GGUF, sirve como punto de partida para tecnicas de fine-tuning adicionales o para destilacion sobre dominios especificos en chino.
- Evaluacion de cuantizaciones: dado que el repositorio incluye un archivo imatrix (0,2 GB), es util para investigadores que quieran generar sus propias cuantizaciones GGUF y comparar la degradacion de perplejidad entre niveles de bits.
- Despliegue en hardware modesto: con la cuantizacion i1-Q2_K (11,1 GB) el modelo cabe en GPUs de 12-16 GB, lo que habilita su uso en estaciones de trabajo sin aceleradores de datacenter.
- Pruebas de seguridad y moderacion de contenido: el caracter NSFW del modelo lo convierte en un caso de estudio para evaluar filtros de contenido, clasificadores de toxicidad y politicas de despliegue responsable.
- Prototipado rapido de chatbots en chino: la disponibilidad de multiples niveles de cuantizacion permite ajustar el equilibrio entre latencia, memoria y calidad durante fases de prototipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, C-Eval ni metricas equivalentes, ni comparaciones cuantitativas con otros modelos. Tampoco se aportan datos de perplejidad medidos para las distintas cuantizaciones, solo referencias externas a graficos de terceros sobre tipos de cuantizacion en general.

## Requisitos de hardware

Los valores de VRAM para cuantizaciones distintas de Q2_K son estimaciones calculadas a partir del numero de parametros (29,9 B) y de los bits por peso tipicos de cada formato; no proceden de mediciones publicadas en el repositorio.

- VRAM estimada para inferencia (solo pesos, sin cache KV):
  - i1-Q2_K: 11,1 GB (dato confirmado en la model card del autor).
  - i1-IQ2_S / IQ2_M: aprox. 9-10 GB (estimacion).
  - i1-Q3_K_M: aprox. 14-15 GB (estimacion).
  - i1-IQ4_XS / Q4_K_S: aprox. 16-17 GB (estimacion).
  - i1-Q4_K_M: aprox. 18-19 GB (estimacion).
  - i1-Q5_K_M: aprox. 21 GB (estimacion).
  - i1-Q6_K: aprox. 24-25 GB (estimacion).
  - Q8_0: aprox. 32 GB (estimacion).
- Hay que sumar a esas cifras la cache KV y el overhead del runtime; a contextos largos la cache puede crecer de forma notable, aunque no se especifica la longitud de contexto soportada.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q4_K_M o inferiores; A6000, L40S o A100 40 GB para Q5-Q6 en contextos amplios; H100 80 GB para Q8 o despliegues concurrentes.
- Cabe en GPU de consumo: si, con cuantizaciones de hasta Q4_K_M en tarjetas de 24 GB, y hasta Q2_K en tarjetas de 12-16 GB (por ejemplo, RTX 4080, 4070 Ti Super, o una RTX 3060 de 12 GB con contexto reducido).
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier backend compatible con GGUF. El soporte de vLLM para GGUF es limitado y no esta confirmado para este modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a aspectos verificables de formato y licencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.7-Flash-Name-NSFW (i1-GGUF, este repo) | 29,9 B | No disponible | GGUF (imatrix) | MIT | HuggingFace |
| GLM-4.7-Flash-Name-NSFW (modelo base, `2048lr`) | 29,9 B | No disponible | safetensors | MIT (segun el repositorio derivado) | HuggingFace |
| GLM-4.7-Flash-Name-NSFW (cuantizaciones estaticas, mradermacher) | 29,9 B | No disponible | GGUF (sin imatrix) | MIT | HuggingFace |
| Otras alternativas de ~30 B de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta etiquetado como `not-for-all-audiences` y esta destinado a contenido para adultos. No es apto para despliegues abiertos al publico general sin moderacion.
- Sesgos conocidos: no documentados, pero al ser un ajuste fino sobre un modelo mayoritariamente en chino y sin informacion sobre su dataset, es probable que herede sesgos linguisticos y culturales del corpus original.
- Riesgo de alucinacion: no cuantificado; no se aportan evaluaciones de veracidad ni de robustez.
- Limitacion de idioma: el unico idioma declarado es chino (`zh`); el rendimiento en castellano no esta garantizado ni documentado.
- Licencia: el repositorio derivado declara MIT, lo que en principio permite uso comercial, pero conviene verificar los terminos del modelo base `2048lr/GLM-4.7-Flash-Name-NSFW` y de la familia GLM original antes de un uso productivo.
- Disponibilidad de archivos: la tabla de archivos provistos en la model card solo lista el archivo imatrix (0,2 GB) y la cuantizacion i1-Q2_K (11,1 GB); el resto de tipos de cuantizacion aparece como planificado o listado por el autor, por lo que su disponibilidad real debe comprobarse en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la captura: no hay validacion de la comunidad ni informes de calidad independientes.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Produccion: la ausencia de benchmarks, de datos de entrenamiento y de evaluaciones de seguridad hace desaconsejable su uso en entornos criticos sin una evaluacion previa propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/GLM-4.7-Flash-Name-NSFW-i1-GGUF
- Modelo base: https://huggingface.co/2048lr/GLM-4.7-Flash-Name-NSFW
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/GLM-4.7-Flash-Name-NSFW-GGUF
- Pagina de descarga resumida del autor: https://hf.tst.eu/model#GLM-4.7-Flash-Name-NSFW-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas sin relacion con el repositorio.
