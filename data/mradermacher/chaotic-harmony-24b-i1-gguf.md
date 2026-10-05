# mradermacher/Chaotic-Harmony-24B-i1-GGUF

## Resumen

Chaotic-Harmony-24B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo Sorihon/Chaotic-Harmony-24B, un modelo de aproximadamente 23.570 millones de parametros (23,57B) creado mediante mergekit a partir de la fusion de otros modelos. Este repositorio no contiene un modelo entrenado desde cero ni una arquitectura nueva: su proposito es ofrecer versiones comprimidas y optimizadas para inferencia local de un modelo mayor, con el objetivo de reducir los requisitos de memoria a cambio de una perdida controlada de precision.

Este tipo de publicaciones es relevante para desarrolladores e investigadores que necesitan ejecutar modelos de gran tamano en hardware de consumo o en servidores con VRAM limitada. Los cuants "i1" de mradermacher se generan con una matriz de importancia (imatrix) que guia la cuantizacion para preservar mejor el comportamiento del modelo original, especialmente en los niveles de compresion mas agresivos. El repositorio incluye ademas un fichero imatrix que permite generar cuantizaciones propias.

La informacion disponible sobre el modelo base es muy limitada: se desconoce la arquitectura concreta, el contexto soportado, el dataset de entrenamiento y la licencia. Esto condiciona cualquier evaluacion seria del modelo para produccion y obliga a tratar esta ficha como una guia de despliegue y no como una validacion de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base resultado de un merge con mergekit) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, Q4_K_S, Q4_K_M, IQ4_XS, Q5_K_M, Q5_K_S, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, Q2_K_S, Q3_K_S, Q3_K_L, IQ3_XS, IQ3_S, Q4_0, Q4_1, small-IQ4_NL (lista declarada en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (quantizado); origen del modelo base en safetensors via transformers |
| Tamano del repositorio | 132,9 GB |

## Arquitectura y entrenamiento

El repositorio es una publicacion de cuantizaciones, no un modelo entrenado. El modelo base, Sorihon/Chaotic-Harmony-24B, fue producido con mergekit, una herramienta de fusion de pesos que combina dos o mas modelos existentes mediante tecnicas de interpolacion (como SLERP, TIES, DARE o linear). Esto implica que las capacidades, el estilo y las limitaciones del resultado dependen enteramente de los modelos de origen, que no se especifican en la informacion disponible.

Sobre el proceso de cuantizacion, la model card indica que se trata de cuantizaciones ponderadas con matriz de importancia (imatrix) generadas por mradermacher, con soporte para cuantizacion de tensores de salida y conversion a formato HuggingFace. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se confirma si el modelo base es un transformer decoder denso o presenta algun componente de tipo MoE; con 23,57B de parametros totales y sin datos de parametros activos, la opcion mas probable es un transformer denso, pero no puede afirmarse con la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" sugiere que el modelo base esta orientado a dialogos multi-turno, aunque no se documentan capacidades especificas.
- Soporte de solo ingles: el campo de idioma declarado es unicamente "en".
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que el repositorio esta preparado para su uso a traves de infraestructuras de inferencia compatibles.
- Formato GGUF: permite su uso con motores de inferencia locales como llama.cpp u Ollama.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponible; no se documentan en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; no se mencionan.

## Casos de uso

- Despliegue local en estaciones de trabajo: los cuants de 13,6-14,4 GB (Q4_K_S, Q4_K_M) permiten ejecutar un modelo de 23,57B en una GPU de consumo o en equipos con RAM unificada, sin depender de servicios en la nube.
- Prototipado conversacional en ingles: dado el tag "conversational", puede emplearse para construir asistentes de dialogo en ingles sobre hardware modesto antes de invertir en infraestructura mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye un rango amplio de niveles (de IQ1_S a Q6_K), lo que permite estudiar la degradacion de calidad en funcion del nivel de compresion sobre el mismo modelo base.
- Generacion de cuantizaciones personalizadas: el fichero imatrix incluido (0,1 GB) permite a un usuario generar sus propios cuants GGUF con llama.cpp, ajustando el equilibrio entre tamano y fidelidad.
- Ejecucion en entornos sin GPU dedicada: las variantes mas comprimidas (IQ2_M, 8,2 GB) son viables en CPU con llama.cpp, aunque con throughput reducido.
- Base para fine-tuning o nuevos merges: al estar disponible el modelo base en safetensors, puede servir como punto de partida para fusiones adicionales o ajuste en dominios concretos.
- Integracion en pipelines de inferencia compatibles con endpoints: el tag "endpoints_compatible" facilita su publicacion como servicio detras de un servidor de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 132,9 GB en total, pero cada cuantizacion individual es mucho mas pequena y se puede descargar por separado.
- IQ2_M (8,2 GB): viable en CPU con 12-16 GB de RAM; en GPU requiere al menos 8-10 GB de VRAM con offload parcial.
- Q2_K (9,0 GB) e IQ3_XXS (9,4 GB): ejecutables en GPUs con 12 GB de VRAM (RTX 3060 12GB, RTX 4070) con margen limitado.
- IQ3_M (10,8 GB) y Q3_K_M (11,6 GB): requieren unos 12-14 GB de VRAM; el contexto adicional debe caber en el margen restante.
- Q4_K_S (13,6 GB) y Q4_K_M (14,4 GB): necesitan 16 GB de VRAM o mas, o bien un equipo con memoria unificada abundante (Apple Silicon con 24-32 GB).
- Para el modelo base sin cuantizar (23,57B en safetensors) se necesitarian del orden de 47 GB en bf16/fp16, fuera del alcance de GPUs de consumo.
- GPUs recomendadas segun nivel de cuantizacion: RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090 (24GB), A100 40GB o H100 para despliegues con contexto largo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; las versiones sin cuantizar requieren transformers o vLLM/TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dependera del nivel de cuantizacion, la GPU y el motor utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Chaotic-Harmony-24B-i1-GGUF (este) | 23,57B | no disponible | GGUF (imatrix) | no disponible | Cuantizaciones dinamicas con imatrix |
| mradermacher/Chaotic-Harmony-24B-GGUF | 23,57B | no disponible | GGUF (static) | no disponible | Cuantizaciones estaticas del mismo modelo base |
| Sorihon/Chaotic-Harmony-24B | 23,57B | no disponible | safetensors | no disponible | Modelo base sin cuantizar, origen de las dos variantes anteriores |

No se dispone de datos de rendimiento ni de modelos comparables de otros autores en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin terminos explicitos de uso, no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Informacion del modelo base practicamente inexistente: se desconocen arquitectura, contexto, dataset y proceso de entrenamiento, lo que impide estimar su fiabilidad.
- Riesgo de alucinacion: no evaluado; cualquier modelo de tipo merge sin documentacion previa puede presentar degradacion de coherencia en tareas abiertas.
- Idiomas: solo se declara ingles; el rendimiento en castellano o en otros idiomas no esta soportado ni evaluado.
- Contexto desconocido: no se puede garantizar el comportamiento en secuencias largas ni la longitud maxima util.
- Sesgos: no documentados. La mezcla de modelos puede heredar y amplificar sesgos de los modelos de origen.
- Perdida por cuantizacion: los niveles mas agresivos (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) degradan notablemente el comportamiento; los cuants de mayor calidad del repositorio se situan en Q4_K_M y superiores.
- Uso en produccion: sin benchmarks, sin licencia clara y sin ficha tecnica del modelo base, no se recomienda su adopcion en sistemas criticos sin una evaluacion propia exhaustiva.
- Fechas de creacion y actualizacion: el repositorio registra fechas de 2026-10-04, lo que debe verificarse in situ dado que puede tratarse de un error de la plataforma.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes): modelo sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace (repositorio de cuantizaciones i1): https://huggingface.co/mradermacher/Chaotic-Harmony-24B-i1-GGUF
- Modelo base: https://huggingface.co/Sorihon/Chaotic-Harmony-24B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Chaotic-Harmony-24B-GGUF
- Pagina de resumen del modelo en mradermacher: https://hf.tst.eu/model#Chaotic-Harmony-24B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Chaotic-Harmony-24B-i1-GGUF/resolve/main/Chaotic-Harmony-24B.imatrix.gguf
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos a mradermacher: https://huggingface.co/mradermacher/model_requests
