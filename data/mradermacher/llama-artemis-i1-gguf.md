# mradermacher/Llama-Artemis-i1-GGUF

## Resumen

Llama-Artemis-i1-GGUF es el repositorio de cuantizaciones GGUF del modelo jgchaparro/Llama-Artemis, publicado por el cuantizador mradermacher. El modelo base es un ajuste fino de la familia Llama 3.1 de aproximadamente 8.200 millones de parametros (8.202.227.776), orientado a traduccion y especializado en griego y, de forma destacada, en tsakonio, una variedad griega en peligro de extincion segun las etiquetas del propio repositorio. Este repositorio no contiene el modelo original, sino versiones comprimidas en formato GGUF generadas con calibracion imatrix para su uso en inferencia local.

La relevancia de esta publicacion es doble. Por un lado, pone al alcance de la comunidad un modelo de 8B en cuantizaciones que van desde los 2,4 GB (IQ1_M) hasta los 6,8 GB (Q6_K), lo que permite ejecutarlo en GPU de consumo e incluso en CPU. Por otro, aborda un caso de uso poco frecuente como es la traduccion hacia y desde una lengua minoritaria y amenazada, un terreno donde los modelos generalistas rara vez rinden bien.

El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y el modelo base original fue publicado por el autor jgchaparro. La licencia heredada es llama3.1, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama (base) |
| Parametros totales | 8.202.227.776 (aprox. 8,2 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K, ademas del fichero imatrix |
| Idiomas soportados | Griego (el); etiquetas de tsakonio, griego y lenguas en peligro |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (repo de cuantizaciones); el base usa safetensors |
| Tamano del repo | 83,8 GB |
| Pipeline declarado | translation |
| Modelo base | jgchaparro/Llama-Artemis |

## Arquitectura y entrenamiento

El repositorio es una coleccion de cuantizaciones, no un modelo entrenado desde cero. El modelo base, jgchaparro/Llama-Artemis, es un ajuste fino de la familia Llama 3.1 con 8.202.227.776 parametros, lo que situa su arquitectura como un transformer decoder-only denso de tamano 8B. Las etiquetas del repositorio incluyen "unsloth" y "llama", lo que sugiere que el ajuste fino se realizo con la libreria Unsloth sobre una base Llama. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La aportacion tecnica especifica de este repositorio es el proceso de cuantizacion. mradermacher ha generado cuantizaciones ponderadas de tipo imatrix (fichero de importancia generado previamente), lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano. Ademas, ofrece un fichero imatrix independiente de 0,1 GB para que terceros puedan crear sus propias cuantizaciones. La version estatica equivalente esta disponible en el repositorio mradermacher/Llama-Artemis-GGUF.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Traduccion, que es el pipeline declarado explicitamente.
- Traduccion especializada en griego y en tsakonio, una variedad griega en peligro de extincion.
- Apoyo a la preservacion de lenguas minoritarias mediante herramientas de traduccion automatica.
- No se documentan capacidades de tool calling, function calling ni uso como agente.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento explicito.
- Se desconoce si conserva las capacidades generales de Llama 3.1 mas alla del ambito de traduccion para el que fue ajustado.

## Casos de uso

- Traduccion de documentacion historica en tsakonio: el modelo se ha ajustado especificamente para esta variedad griega, por lo que puede emplearse para transcribir y traducir textos de archivo, tradicion oral o material etnografico que hoy requieren trabajo manual de especialistas.
- Preservacion linguistica digital: integracion en plataformas de documentacion de lenguas amenazadas para generar glosas y traducciones de referencia a partir de corpus recogidos en trabajo de campo.
- Traduccion griego moderno a otras lenguas: dado que el modelo maneja griego (etiqueta "el"), puede utilizarse como motor de traduccion griego-espanol o griego-ingles en entornos donde se requiere ejecucion local.
- Asistencia a investigadores en linguistica: generacion de traducciones preliminares de muestras de tsakonio para su posterior revision por hablantes nativos, acelerando la anotacion de corpus.
- Despliegue en equipos sin GPU dedicada: gracias a las cuantizaciones Q2_K (3,4 GB) y Q4_K_M (5,1 GB), el modelo puede ejecutarse en portatiles con CPU o GPU integrada mediante llama.cpp u Ollama.
- Aplicaciones educativas bilingues: creacion de materiales didacticos y ejercicios de traduccion para comunidades que intentan revitalizar el tsakonio.
- Prototipado rapido de pipelines de traduccion: al estar en formato GGUF, se puede integrar en entornos de pruebas con recursos limitados antes de decidir si se justifica desplegar el modelo completo.
- Investigacion sobre degradacion de calidad en cuantizacion agresiva: el repositorio incluye hasta 15 niveles de cuantizacion, lo que permite estudiar el impacto de la compresion en una tarea de traduccion de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio unicamente lista los ficheros de cuantizacion con sus tamanos y notas cualitativas (por ejemplo, "mostly desperate" para i1-IQ1_M, "fast, recommended" para i1-Q4_K_M o "practically like static Q6_K" para i1-Q6_K), pero no incluye metricas como BLEU, MMLU, HumanEval ni ninguna otra evaluacion cuantitativa.

## Requisitos de hardware

- VRAM estimada de inferencia segun cuantizacion: i1-IQ1_M 2,4 GB; i1-IQ2_XXS 2,6 GB; i1-IQ2_M 3,1 GB; i1-Q2_K 3,4 GB; i1-IQ3_XXS 3,5 GB; i1-Q3_K_M 4,2 GB; i1-IQ4_XS 4,7 GB; i1-Q4_K_S 4,9 GB; i1-Q4_K_M 5,1 GB; i1-Q6_K 6,8 GB. Hay que anadir entre 1 y 2 GB adicionales para el contexto y los buffers de atencion.
- Cabe en GPU de consumo: las cuantizaciones de 4 bits (Q4_K_M, 5,1 GB) entran en tarjetas de 8 GB como la RTX 3060, RTX 4060 o RTX 3070. Las de 2-3 bits entran en GPU de 6 GB e incluso en configuraciones con solo GPU integrada.
- Q6_K (6,8 GB) requiere tarjetas de 8-10 GB para funcionar con comodidad, como la RTX 3080 de 10 GB o la RTX 4070.
- GPU profesionales: A100 (40/80 GB), H100 o L40S pueden alojar varias instancias del modelo en paralelo, aunque no se justifica una GPU de ese coste para un modelo de 8B.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui son las opciones naturales para GGUF. vLLM y TGI tienen soporte limitado de GGUF y suelen requerir los pesos en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Llama-Artemis-i1-GGUF | 8,2 B | GGUF | 15 niveles i1 (imatrix) | llama3.1 | Version imatrix, fichero imatrix incluido |
| mradermacher/Llama-Artemis-GGUF | 8,2 B | GGUF | estaticas | llama3.1 | Version estatica del mismo base |
| jgchaparro/Llama-Artemis | 8,2 B | safetensors | no aplica | llama3.1 | Modelo base sin cuantizar |
| Meta Llama 3.1 8B Instruct | 8,03 B | safetensors / GGUF | multiples | llama3.1 | Modelo generalista del que deriva la familia; no esta especializado en tsakonio |

La comparacion con otros modelos de traduccion especializados en griego o lenguas minoritarias no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: al ser un ajuste fino sobre Llama 3.1, mantiene la tendencia del modelo base a inventar contenido cuando no dispone de datos suficientes, algo especialmente problematico en traduccion de lenguas con pocos recursos.
- Corpus limitado: el tsakonio es una lengua con muy pocos hablantes y escaso material escrito, por lo que la calidad de la traduccion puede degradarse rapidamente fuera de los dominios cubiertos en el ajuste fino.
- Idiomas: el repositorio esta etiquetado unicamente como griego (el). No hay garantias de que traduzca correctamente a espanol, ingles u otras lenguas intermedias sin una evaluacion previa.
- Longitud de contexto: no confirmada para este ajuste fino. Aunque Llama 3.1 soporta ventanas largas, no se puede asumir que este modelo las conserve correctamente.
- Licencia llama3.1: restringe el uso comercial y exige el cumplimiento de la Licencia de la Comunidad de Llama 3.1, incluida la clausula de denominacion "Built with Llama" y las condiciones sobre usuarios con mas de 700 millones de usuarios mensuales.
- Cuantizaciones agresivas: por debajo de 4 bits la degradacion de calidad es notable. El propio autor marca i1-IQ1_M como "mostly desperate" y i1-Q2_K_S como "very low quality"; no son adecuadas para produccion.
- Repositorio sin adopcion: cero descargas y cero "likes", por lo que no existe validacion comunitaria del rendimiento real.
- Sin benchmarks: no hay metricas publicadas que permitan comparar objetivamente con alternativas.
- Fecha de creacion inusual: el repositorio figura como creado el 10 de octubre de 2026, lo que puede indicar un error en los metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-Artemis-i1-GGUF
- Modelo base: https://huggingface.co/jgchaparro/Llama-Artemis
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Llama-Artemis-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Llama-Artemis-i1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
