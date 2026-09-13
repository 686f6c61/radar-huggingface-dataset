# mradermacher/Blossom-V7.1-27B-i1-GGUF

## Resumen

Blossom-V7.1-27B-i1-GGUF es un repositorio de cuantizaciones GGUF publicado por mradermacher a partir del modelo Azure99/Blossom-V7.1-27B. El modelo subyacente cuenta con 27.320.697.856 parametros (unos 27,3 mil millones), esta etiquetado como conversacional, de razonamiento y multimodal, y declara soporte para ingles y chino. La licencia indicada en el repositorio es Apache 2.0.

Este repositorio no contiene el modelo original, sino una coleccion de cuantizaciones generadas con el esquema i1 (weighted/imatrix), que emplea una matriz de importancia calculada sobre el modelo para reducir la perdida de calidad en tipos de cuantizacion agresivos. Se ofrecen quince niveles de cuantizacion, desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB), mas el propio fichero imatrix para quien quiera generar cuantizaciones propias. El tamano total del repositorio es de 218,6 GB.

Su relevancia practica es que permite ejecutar un modelo conversacional de ~27B en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos en precision completa (~54,6 GB en BF16). Conviene senalar que la model card no documenta arquitectura, longitud de contexto, composicion del dataset de entrenamiento ni resultados de evaluacion, y que el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card del cuantizador no detalla la arquitectura del modelo base; las etiquetas indican "conversational", "reasoning" y "multimodal") |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ3_S, i1-IQ3_M, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K y fichero imatrix |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base en la documentacion proporcionada. Se sabe que Azure99/Blossom-V7.1-27B es un modelo conversacional de ~27,3B parametros que, segun las etiquetas del repositorio, incorpora capacidades de razonamiento y de vision, y que esta orientado a un publico bilingue ingles-chino. La model card del repositorio de cuantizacion no describe el tipo de transformer, la atencion empleada, ni si se trata de una arquitectura densa o con mezcla de expertos.

Tampoco se documentan los datos de entrenamiento: no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Respecto al proceso de cuantizacion, si esta documentado parcialmente: mradermacher ha generado cuantizaciones "weighted/imatrix" (version de cuantizacion 2, tensores de salida cuantizados, conversion de tipo hf), lo que implica el calculo previo de una matriz de importancia sobre un corpus de calibracion para ponderar la cuantizacion de cada tensor. El autor indica ademas que las cuantizaciones de tipo IQ suelen ser preferibles a las no-IQ de tamano similar.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento (etiqueta "reasoning" declarada por el autor del modelo base).
- Capacidades multimodales/vision: la model card indica que se trata de un modelo de vision, pero advierte que los ficheros mmproj (si existen) estan en el repositorio estatico, no en este.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con servidores de inferencia con API compatible con OpenAI.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como caracteristica documentada.
- Capacidades multilingues: limitadas a en y zh segun las etiquetas; no hay evidencia de soporte de castellano.

## Casos de uso

- Asistente conversacional bilingue en ingles y chino desplegado on-premise: el modelo cubre los dos idiomas declarados y puede servirse con llama.cpp server exponiendo una API compatible con OpenAI, lo que facilita integrarlo en aplicaciones existentes sin enviar datos a terceros.
- Inferencia local en estaciones de trabajo con GPU de 24 GB: con la cuantizacion i1-Q4_K_M (16,9 GB) el modelo cabe en una RTX 3090 o RTX 4090 dejando margen para cache KV, algo relevante para entornos con requisitos de confidencialidad.
- Analisis de imagenes en flujos de trabajo internos (por ejemplo, extraccion de informacion de capturas o documentos escaneados): el modelo base esta etiquetado como multimodal, aunque para ello hay que obtener el fichero mmproj del repositorio estatico, ya que este repositorio i1 no lo incluye.
- Evaluacion comparativa de esquemas de cuantizacion: al incluir el fichero imatrix y quince niveles distintos, el repositorio sirve para medir la degradacion de perplejidad y calidad entre i1-Q2_K, i1-IQ3_S e i1-Q4_K_M sobre las mismas cargas de evaluacion.
- Generacion de cuantizaciones a medida: el fichero `Blossom-V7.1-27B.imatrix.gguf` (0,1 GB) permite a terceros producir sus propios quants con llama.cpp aplicando la misma matriz de importancia.
- Prototipado de asistentes en investigacion sobre modelos bilingues chino-ingles: util para estudiar comportamiento conversacional, sesgos idiomaticos y rendimiento en razonamiento de un modelo de ~27B en un entorno controlado.
- Despliegue en nodos con A100 40 GB o H100 80 GB para servir varias replicas o contextos largos: los niveles i1-Q5_K_M (19,6 GB) e i1-Q6_K (22,5 GB) permiten priorizar calidad cuando la VRAM no es la restriccion principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan datos de perplejidad comparando los distintos niveles de cuantizacion con el modelo original. El autor remite a un grafico externo de ikawrakow sobre perplejidad relativa de tipos de cuantizacion de baja calidad (https://www.nethype.de/huggingface_embed/quantpplgraph.png), pero no se trata de una evaluacion especifica de este modelo.

## Requisitos de hardware

- VRAM estimada por cuantizacion (tamano del fichero de pesos; hay que sumar el espacio de la cache KV y, si se usa vision, el proyector multimodal):
  - i1-Q2_K: 11,0 GB
  - i1-Q3_K_S: 12,4 GB
  - i1-IQ3_S: 12,7 GB
  - i1-IQ3_M: 12,9 GB
  - i1-Q3_K_M: 13,6 GB
  - i1-Q3_K_L: 14,7 GB
  - i1-IQ4_XS: 15,4 GB
  - i1-Q4_0 / i1-Q4_K_S: 15,9 GB
  - i1-Q4_K_M: 16,9 GB
  - i1-Q4_1: 17,4 GB
  - i1-Q5_K_S: 19,1 GB
  - i1-Q5_K_M: 19,6 GB
  - i1-Q6_K: 22,5 GB
- Precision completa: 27,3B parametros en BF16 equivalen a unos 54,6 GB, por encima de cualquier GPU de consumo.
- GPU de consumo: i1-Q2_K e i1-IQ3_* caben en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB) con contexto corto. i1-Q4_K_M cabe en 24 GB (RTX 3090, RTX 4090) con margen razonable; i1-Q5_K_M e i1-Q6_K entran en 24 GB pero con muy poco margen para cache KV en contextos largos.
- GPU de datacenter: A100 40 GB, A100 80 GB y H100 80 GB permiten servir las cuantizaciones altas con contexto amplio o varias replicas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), llama-cpp-python, Ollama, LM Studio, koboldcpp y text-generation-webui. Para produccion con GGUF se recomienda llama.cpp; vLLM y TGI tienen soporte GGUF limitado o experimental.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo para ninguna GPU ni cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Blossom-V7.1-27B-i1-GGUF | 27,3 B | no disponible | GGUF (i1, imatrix) | apache-2.0 | 15 niveles de cuantizacion + fichero imatrix; 218,6 GB de repo; sin mmproj |
| Azure99/Blossom-V7.1-27B | 27,3 B | no disponible | safetensors (transformers) | no disponible en la informacion aportada | Modelo base original en precision completa; requiere ~54,6 GB en BF16 |
| mradermacher/Blossom-V7.1-27B-GGUF | 27,3 B | no disponible | GGUF (quants estaticos) | apache-2.0 | Cuantizaciones estaticas; incluye los ficheros mmproj para vision |

No se dispone de datos de benchmarks ni de contexto para comparar este modelo con alternativas de otros autores de tamano o tarea similares. Cualquier comparacion de rendimiento con modelos de la misma categoria requeriria una evaluacion propia, que no se ha publicado.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, ni perplejidad, ni evaluaciones humanas publicadas para este modelo ni para sus cuantizaciones.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso real ni de incidencias reportadas.
- Vision no incluida: la model card indica que los ficheros mmproj estan en el repositorio estatico, no en este. Usar este repositorio para tareas de vision requerira descargar el proyector desde el otro repositorio, si existe.
- Idiomas: solo se declaran en y zh. No hay evidencia de buen rendimiento en castellano, por lo que no debe asumirse calidad en espanol sin evaluacion previa.
- Perdida por cuantizacion: los niveles bajos (i1-Q2_K, 11,0 GB; i1-IQ3_*, ~12,7-12,9 GB) degradan la calidad de forma apreciable frente al modelo original en BF16. El propio autor recomienda IQ3_XXS frente a Q2_K y IQ3_S frente a Q3_K_M.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no existen datos de alineacion ni de seguridad para calibrarlo.
- Sesgos: no se documenta la composicion del corpus de entrenamiento, por lo que no puede evaluarse el sesgo de genero, idioma, cultura o dominio.
- Licencia: el repositorio de cuantizacion declara apache-2.0, pero conviene verificar la licencia del modelo base Azure99/Blossom-V7.1-27B antes de un uso comercial, ya que el repositorio de cuantizacion podria haber heredado la etiqueta sin ser la fuente autoritativa.
- Fecha de publicacion: el repositorio figura creado y actualizado el 13 de septiembre de 2026, por lo que se trata de una publicacion muy reciente y sin historial de mantenimiento.
- Ausencia de soporte documentado de tool calling, agentes o razonamiento multi-paso: no deben asumirse estas capacidades en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Blossom-V7.1-27B-i1-GGUF
- Modelo base: https://huggingface.co/Azure99/Blossom-V7.1-27B
- Repositorio de cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Blossom-V7.1-27B-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Blossom-V7.1-27B-i1-GGUF/resolve/main/Blossom-V7.1-27B.imatrix.gguf
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#Blossom-V7.1-27B-i1-GGUF
- Guia de uso de GGUF de TheBloke (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Pagina de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor del cuantizado: https://www.nethype.de/
