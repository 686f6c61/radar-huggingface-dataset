# mradermacher/Gemmasutra-Pro-27B-v1.1-GGUF

## Resumen

Gemmasutra-Pro-27B-v1.1-GGUF es la version cuantizada en formato GGUF del modelo TheDrummer/Gemmasutra-Pro-27B-v1.1, publicada por el usuario mradermacher, especializado en la conversion de pesos a formatos optimizados para inferencia local. El modelo base es un fine-tuning de 27.227.128.320 parametros (aproximadamente 27,2 mil millones) orientado a conversacion, construido sobre la familia Gemma de Google segun se deduce del nombre, aunque la model card no detalla explicitamente la arquitectura subyacente.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K de 10,5 GB hasta Q8_0 de 29,0 GB), lo que permite desplegarlo en hardware de consumo con VRAM limitada, algo imposible con los pesos originales en precision completa. Esta pensado para desarrolladores que quieren ejecutar un modelo conversacional de gran tamano en local mediante llama.cpp u Ollama sin necesidad de GPUs de datacenter.

No obstante, la informacion disponible es muy limitada: no se especifican datos de entrenamiento, benchmarks, longitud de contexto ni detalles de arquitectura mas alla del numero de parametros. El modelo esta etiquetado unicamente para ingles y con licencia "other", lo que exige consultar los terminos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma, segun nomenclatura; sin confirmar en la model card) |
| Parametros totales | 27.227.128.320 (27,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no proporciona informacion sobre la arquitectura interna del modelo base, los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato tecnico verificable es el recuento de parametros (27.227.128.320) y que se trata de una cuantizacion estatica (static quants, convert_type: hf) realizada con la herramienta de mradermacher, sin usar imatrix en este repositorio concreto (las versiones ponderadas con imatrix se publican en un repositorio separado).

El nombre "Gemmasutra-Pro-27B" sugiere que el modelo base es un fine-tuning de Gemma 2 de 27B, pero esta afirmacion no se confirma en la documentacion disponible y debe tratarse como una inferencia a partir de la nomenclatura. La cuantizacion se ha realizado respetando el vocabulario original del modelo (vocab_type vacio en los metadatos), y se ofrecen variantes K-quant e I-quant para equilibrar tamano y calidad.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y orientado a dialogos multi-turno.
- Fine-tuning especializado: al ser un modelo de la serie "Gemmasutra", se infiere un ajuste orientado a conversacion, aunque no se detallan las capacidades exactas en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en estaciones de trabajo con GPU de consumo usando las cuantizaciones Q4_K_M (16,7 GB) o Q5_K_M (19,5 GB), lo que permite mantener conversaciones multi-turno sin depender de APIs externas ni enviar datos a terceros.
- Prototipado de chatbots en ingles: gracias a su naturaleza conversacional y a la disponibilidad de cuantizaciones ligeras como Q3_K_M (13,5 GB), es adecuado para iterar rapidamente en el diseno de flujos de dialogo antes de pasar a produccion.
- Investigacion sobre cuantizacion: la disponibilidad de once variantes de cuantizacion permite estudiar el impacto de la compresion en la calidad de las respuestas, comparando Q2_K con Q8_0 sobre el mismo conjunto de prompts.
- Despliegue en entornos con recursos limitados: la version Q2_K (10,5 GB) puede ejecutarse en GPUs con 12 GB de VRAM, lo que facilita pruebas en hardware modesto o en portatiles con GPU dedicada.
- Generacion de texto creativo en ingles: el modelo, orientado a conversacion, puede emplearse para redaccion asistida y generacion de contenido en ingles en flujos de trabajo offline.
- Educacion y experimentacion: al ser un modelo abierto en formato GGUF, sirve como banco de pruebas para aprender a desplegar modelos con llama.cpp u Ollama en cursos y laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: 10,5 GB (requiere ~12 GB de VRAM con overhead de contexto).
  - Q3_K_M: 13,5 GB.
  - Q4_K_M: 16,7 GB (recomendado por el autor por velocidad y calidad).
  - Q5_K_M: 19,5 GB.
  - Q6_K: 22,4 GB.
  - Q8_0: 29,0 GB.
- GPU recomendadas: para Q4_K_M y superiores se recomienda una RTX 4090 (24 GB) o una A100/H100 en entornos de servidor; para Q2_K y Q3_K_S puede bastar una RTX 3060 de 12 GB o una RTX 4070 Ti.
- Cabe en GPU de consumo: si, en modelos como RTX 3090, RTX 4090 (24 GB) con cuantizaciones hasta Q6_K; en GPUs de 12 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui con el loader de llama.cpp). No se menciona compatibilidad con vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemmasutra-Pro-27B-v1.1-GGUF | 27,2 B | no disponible | other | GGUF | Hugging Face |
| TheDrummer/Gemmasutra-Pro-27B-v1.1 (base) | 27,2 B | no disponible | other | safetensors | Hugging Face |
| Gemmasutra-Pro-27B-v1.1-i1-GGUF (imatrix) | 27,2 B | no disponible | other | GGUF | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa con alternativas de la misma categoria. La unica comparacion posible es entre las distintas variantes de cuantizacion del mismo modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un fine-tuning conversacional sin informacion sobre su dataset, no puede descartarse la presencia de sesgos heredados del modelo base.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo de esta escala, puede producir informacion falsa con aparente seguridad, especialmente en las cuantizaciones mas agresivas (Q2_K, Q3_K_S).
- Limitaciones de contexto e idioma: el modelo esta etiquetado solo para ingles y no se especifica la longitud de contexto soportada, por lo que no se recomienda para tareas en castellano ni para conversaciones que requieran ventanas de contexto largas sin verificacion previa.
- Restricciones de licencia: la licencia "other" obliga a revisar los terminos del modelo base (TheDrummer/Gemmasutra-Pro-27B-v1.1) antes de cualquier uso comercial; no se garantiza permiso de uso comercial por defecto.
- Caveat para produccion: la cuantizacion Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior. Ademas, el modelo base no incluye documentacion sobre seguridad, filtros de contenido ni evaluaciones de robustez.
- El repositorio tiene un numero muy bajo de descargas (49) y likes (1), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemmasutra-Pro-27B-v1.1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Gemmasutra-Pro-27B-v1.1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemmasutra-Pro-27B-v1.1-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemmasutra-Pro-27B-v1.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
