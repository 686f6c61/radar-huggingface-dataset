# mradermacher/Duskflare-27B-i1-GGUF

## Resumen

Duskflare-27B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Retreatcost/Duskflare-27B, publicadas por mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión y compresión del modelo base a pesos de baja precisión (desde Q2_K hasta Q4_K_S en los ficheros documentados), generadas con el método i1 basado en imatrix, que pondera cada tensor según su importancia para reducir la pérdida de calidad respecto a una cuantización uniforme.

El modelo base, de unos 26.900 millones de parámetros (26.895.998.464 según los pesos safetensors), está etiquetado por su autor original con los casos de uso de roleplay, escritura creativa, conversación y contenido NSFW, y declara únicamente el idioma inglés. La ficha del repositorio no documenta la arquitectura interna ni la longitud de contexto del modelo original, por lo que esos datos figuran como no disponibles.

La relevancia de este repositorio es práctica: permite ejecutar un modelo de ~27B en hardware de consumo o en servidores modestos, algo inviable con los pesos originales en precisión completa o media. A cambio, los quants de 2 y 3 bits introducen degradación medible, y el aviso «not-for-all-audiences» indica que el contenido generado puede no ser apto para todos los públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio solo documenta la cuantizacion; no describe la arquitectura del modelo base) |
| Parametros totales | 26.895.998.464 (~26,9 B), medidos sobre los pesos safetensors del modelo base |
| Parametros activos | No aplica (no hay indicios de que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (10,8 GB), i1-IQ3_M (12,7 GB), i1-Q4_K_S (15,7 GB) como ficheros publicados en la tabla del README; los metadatos del repo listan ademas IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q2_K_S y Q2_K |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (quants con imatrix); incluye fichero imatrix de 0,1 GB para generar cuantizaciones propias |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es el resultado de la cadena de conversión de mradermacher sobre el modelo base Retreatcost/Duskflare-27B. Los metadatos internos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que describe un pipeline de conversión desde pesos HuggingFace (safetensors) a GGUF seguido de cuantización por tensores. La model card no aporta información sobre la arquitectura del modelo base (no se especifica si es un transformer denso, MoE o híbrido), ni sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

La innovación técnica concreta y documentada de este repositorio es el uso de cuantización ponderada por imatrix (método `i1`). El fichero imatrix (0,1 GB) se calcula a partir de estadísticas de activación recogidas al pasar un corpus de calibración por el modelo base, y se utiliza después para asignar un presupuesto de bits distinto a cada tensor según su contribución al error. Según la documentación del propio autor, los quants IQ suelen ofrecer mejor relación tamaño/calidad que los quants no-IQ de tamaño equivalente, y el fichero i1-Q4_K_S se señala explícitamente como el de mejor equilibrio entre tamaño, velocidad y calidad. El acceso a la infraestructura de cuantización (incluida la cesión de un supercomputador por parte de @nicoboss) se agradece en la propia model card.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en dialogos de rol (roleplay) y mantenimiento de personajes.
- Escritura creativa: narrativa de ficcion, prosa larga y continuacion de textos, segun los tags `creative-writing` y `finetune`.
- Conversacion multturno: el tag `conversational` y el uso de la libreria `trl` apuntan a un ajuste fino sobre datos de dialogo.
- Contenido para adultos: el tag `nsfw` y el aviso `not-for-all-audiences` indican que el modelo ha sido ajustado o al menos no filtrado para este tipo de contenido.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento agente multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue: limitada al ingles segun el campo `language`.

## Casos de uso

- Motores de personajes para videojuegos y experiencias interactivas: el modelo esta etiquetado para roleplay, por lo que puede generar respuestas consistentes con una ficha de personaje dada; al ejecutarse en local con llama.cpp se evita la latencia de red y el coste por token de una API.
- Escritura creativa asistida en local: un autor puede usar la cuantizacion i1-Q4_K_S (15,7 GB) en una GPU de 24 GB para generar borradores de narrativa sin enviar material inedito a servicios de terceros.
- Aplicaciones de chat con personaje para consumo final: el quant i1-IQ3_M (12,7 GB) cabe en GPUs de gama alta de consumo, lo que permite desplegar un chatbot de ~27B en una estacion de trabajo unica.
- Generacion de datos sinteticos de dialogo: el modelo puede producir transcripciones conversacionales en ingles para aumentar datasets de entrenamiento de modelos mas pequenos, con la advertencia de que el contenido NSFW debe filtrarse segun el caso.
- Investigacion sobre seguridad y alineacion: al estar marcado como `not-for-all-audiences`, resulta util como sujeto de pruebas para evaluar tecnicas de filtrado, clasificacion de contenido y mitigacion de salidas inapropiadas.
- Pruebas de calidad de cuantizacion: el repositorio incluye el fichero imatrix, de modo que un investigador puede generar sus propios quants con distintos presupuestos de bits y comparar la degradacion frente al modelo base en la misma tarea.
- Despliegue en entornos sin conectividad o con requisitos de privacidad estrictos: al distribuirse en GGUF, el modelo funciona integramente en local con llama.cpp, Ollama o LM Studio, sin llamadas externas.
- Prototipado rapido de interfaces conversacionales: el tag `endpoints_compatible` permite levantar un endpoint temporal para validar una idea de producto antes de invertir en un modelo mayor o en ajuste fino propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado en los resultados de busqueda web. Lo unico documentado es una grafica externa de perplejidad comparativa entre tipos de cuantizacion de baja calidad, enlazada por el autor, que no aporta valores numericos en la propia ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano de fichero mas el cache KV, que depende del contexto y no esta documentado):
  - i1-Q2_K: ~11-13 GB con contexto corto o moderado.
  - i1-IQ3_M: ~13-15 GB.
  - i1-Q4_K_S: ~16-19 GB.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090, RTX A6000, L40S y A100 para los quants mas grandes; para Q2_K tambien son viables GPUs de 16 GB con contexto reducido.
- Cabe en GPU de consumo: si. Los tres quants publicados caben en tarjetas de 24 GB (RTX 3090, 4090, 5090) y los dos mas pequenos pueden ejecutarse en GPUs de 16 GB ajustando el contexto. En GPUs de 8-12 GB es necesario descargar capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y Jan para el formato GGUF; vLLM admite GGUF de forma experimental. TGI no soporta GGUF, por lo que requeriria convertir a safetensors o servir el modelo base. El tag `endpoints_compatible` sugiere compatibilidad con los Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio, y dependen del quant elegido, del ancho de banda de memoria de la GPU y de la longitud de contexto configurada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Duskflare-27B-i1-GGUF (este repo) | ~26,9 B | No disponible | GGUF (quants i1 con imatrix) | apache-2.0 | 3 quants publicados en la tabla del README, mas fichero imatrix |
| mradermacher/Duskflare-27B-GGUF (quants estaticos) | ~26,9 B | No disponible | GGUF (quants sin imatrix) | apache-2.0 | Repositorio enlazado desde la model card |
| Retreatcost/Duskflare-27B (modelo base) | ~26,9 B | No disponible | safetensors | apache-2.0 | Modelo original del que derivan las cuantizaciones |

No se dispone de datos verificados de rendimiento de terceros con los que comparar, ni de informacion suficiente sobre modelos de la misma categoria (por ejemplo, otros ajustes de roleplay de ~27B) dentro de la informacion proporcionada. La comparativa se limita por tanto a las tres variantes del propio modelo, y no incluye cifras de calidad porque no se han publicado.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea degradado.
- Contenido no apto para todos los publicos: el tag `nsfw` y el aviso `not-for-all-audiences` indican que el modelo puede generar material adulto, ofensivo o inapropiado. Requiere filtrado o moderacion en cualquier despliegue orientado al publico general.
- Sin datos de evaluacion: al no haber benchmarks publicados, no es posible estimar de forma objetiva la calidad del ajuste fino ni el impacto real de cada cuantizacion.
- Degradacion por cuantizacion: los quants de 2 bits (i1-Q2_K) y en menor medida los de 3 bits introducen perdida de calidad y mayor riesgo de incoherencia o repeticion. El propio autor recomienda IQ3_XXS frente a Q2_K y senala i1-Q4_K_S como el mejor equilibrio.
- Longitud de contexto desconocida: no se documenta el contexto maximo del modelo base, por lo que no se puede garantizar el comportamiento en conversaciones largas o con documentos extensos.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y no cuantificado en la informacion disponible; es especialmente relevante en roleplay, donde el modelo puede inventar hechos presentados con seguridad.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni el corpus de ajuste fino, por lo que se desconoce la naturaleza y magnitud de los sesgos presentes.
- Licencia: los pesos se distribuyen bajo apache-2.0, lo que permite uso comercial, pero el repositorio es una obra derivada y no se documenta una revision juridica especifica del modelo base; conviene verificar la cadena de licencias antes de un despliegue en produccion.
- Escasa validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentacion independiente sobre su comportamiento.
- Ausencia de guia de prompt: no se documenta el formato de plantilla de chat esperado, lo que puede provocar respuestas de baja calidad si no se identifica la plantilla correcta del modelo base.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Duskflare-27B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Duskflare-27B-GGUF
- Modelo base: https://huggingface.co/Retreatcost/Duskflare-27B
- Pagina resumen de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Duskflare-27B-i1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica de perplejidad comparativa entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- nethype GmbH (infraestructura utilizada): https://www.nethype.de/
