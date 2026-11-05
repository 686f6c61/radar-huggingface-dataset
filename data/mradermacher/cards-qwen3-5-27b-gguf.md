# mradermacher/CARDS-Qwen3.5-27B-GGUF

## Resumen

CARDS-Qwen3.5-27B-GGUF es la distribucion en formato GGUF del modelo C3DS/CARDS-Qwen3.5-27B, un ajuste fino multimodal (image-text-to-text) del modelo Qwen3.5 de 27B orientado al analisis de discurso climatico y clasificacion de textos e imagenes relacionados con el cambio climatico. La cuantizacion la firma mradermacher, autor habitual de conversiones GGUF en HuggingFace, que publica los pesos en multiples niveles de compresion para facilitar su ejecucion en hardware de consumo.

El modelo base conserva la arquitectura transformer de Qwen3.5 con aproximadamente 26.900 millones de parametros (26.895.998.464 segun los safetensors del repositorio), un tamano que lo situa en la franja alta de los modelos de 27B y que, gracias a las cuantizaciones de 4 bits, puede desplegarse en GPUs de consumo con 16-24 GB de VRAM. El ajuste fino se realizo sobre el dataset C3DS/cards_sft_dataset mediante supervised fine-tuning, especializandolo en tareas de clasificacion y analisis de discurso climatico.

La relevancia de esta publicacion radica en que combina tres elementos poco frecuentes: capacidades de vision-lenguaje, un dominio de aplicacion muy especifico (clima y cambio climatico) y un formato GGUF listo para inferencia local con llama.cpp u Ollama. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que facilita su integracion en productos y pipelines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), derivada de Qwen3.5 |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados para la torre de vision) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5 de 27B, un transformer multimodal que procesa entradas de imagen y texto. La publicacion original (C3DS/CARDS-Qwen3.5-27B) se entreno sobre el dataset C3DS/cards_sft_dataset mediante supervised fine-tuning, partiendo de los pesos de Qwen3.5. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

En la version GGUF, la torre de vision se distribuye en ficheros mmproj independientes (Q8_0 de 0,7 GB y f16 de 1,0 GB), mientras que el cuerpo del modelo se ofrece en once cuantizaciones que van desde los 10,8 GB (Q2_K) hasta los 28,7 GB (Q8_0). El autor indica que no hay cuantizaciones con imatrix disponibles en el momento de la publicacion, aunque deja abierta la posibilidad de generarlas bajo peticion. La conversion se realizo con el tipo de conversion hf y la version de cuantizacion 2 del pipeline de mradermacher.

## Capacidades

- Generacion de texto y razonamiento en ingles, heredadas del modelo base Qwen3.5.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), con soporte para tareas de clasificacion multimodal.
- Clasificacion y analisis de discurso climatico: deteccion de posturas, encuadres y argumentos en textos sobre cambio climatico.
- Comprension de documentos e imagenes relacionadas con el clima (graficos, mapas, infografias), segun la naturaleza multimodal del modelo base.
- Capacidades conversacionales multi-turno (tag conversational en el repositorio).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue como servicio.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Analisis de discurso climatico en redes sociales: el modelo puede clasificar publicaciones y comentarios segun su postura frente al cambio climatico, aprovechando su ajuste fino sobre el dataset cards_sft_dataset para tareas de clasificacion especializada.
- Monitorizacion de medios y prensa: procesamiento por lotes de articulos y piezas informativas para identificar encuadres, argumentos y narrativas climaticas, con la ventaja de poder ejecutarse en local con cuantizaciones Q4_K_M de 16,6 GB.
- Analisis de imagenes y graficos climaticos: al ser un modelo vision-lenguaje, puede interpretar infografias, mapas de temperatura o graficos de emisiones y generar descripciones o clasificaciones asociadas.
- Investigacion academica en comunicacion climatica: uso como anotador automatico de corpus, con la licencia Apache 2.0 que permite publicar resultados y derivados sin restricciones.
- Moderacion de contenido en plataformas: deteccion de desinformacion o greenwashing en textos e imagenes, desplegando el modelo en infraestructura propia para preservar la privacidad de los datos.
- Asistentes especializados en divulgacion climatica: generacion de resumenes y respuestas sobre cambio climatico en ingles, con la posibilidad de ejecutarse en una RTX 4090 con cuantizacion Q4_K_S (15,7 GB).
- Prototipado rapido en local: gracias a los ficheros GGUF, se puede probar el modelo con llama.cpp u Ollama en un portatil con GPU de 16 GB usando Q3_K_M (13,4 GB) o IQ4_XS (15,3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 GB (Q2_K, 10,8 GB) y 29 GB (Q8_0, 28,7 GB) para los pesos, mas aproximadamente 1 GB adicional para el fichero mmproj de vision y el espacio de contexto.
- Cuantizaciones recomendadas por el autor: Q4_K_S (15,7 GB) y Q4_K_M (16,6 GB) como opciones rapidas y recomendadas; Q6_K (22,2 GB) para muy buena calidad; Q8_0 (28,7 GB) para la mejor calidad.
- GPUs de consumo: una RTX 4090 (24 GB) puede ejecutar Q4_K_M, Q5_K_M (19,3 GB) y Q6_K (22,2 GB); una RTX 4080 o 3090 (16-24 GB) admite Q4_K_S y Q4_K_M; GPUs de 12-16 GB pueden usar Q3_K_M o IQ4_XS.
- GPUs profesionales: A100 (40/80 GB) y H100 (80 GB) permiten ejecutar Q8_0 con contexto amplio y mayor throughput.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con servidores de inferencia tipo API.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| CARDS-Qwen3.5-27B-GGUF | ~26,9B | no disponible | Si (vision-lenguaje) | Apache 2.0 | GGUF |
| Qwen3.5-27B (base) | ~27B | no disponible | Si (segun modelo base) | no disponible | safetensors |
| Modelos de clasificacion climatica especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre alternativas comparables en la misma categoria (modelos multimodales de ~27B especializados en clima) para establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (en); su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Dominio restringido: el ajuste fino sobre cards_sft_dataset puede degradar capacidades generales del modelo base fuera del ambito climatico.
- Riesgo de alucinacion: como todo modelo generativo, puede producir clasificaciones o descripciones plausibles pero incorrectas, especialmente en imagenes ambiguas o textos ironicos.
- Sesgos: el dataset de ajuste fino puede introducir sesgos en la deteccion de posturas climaticas; no se documentan analisis de sesgo en la model card.
- Contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad; el autor solo marca explicitamente Q4_K_S y Q4_K_M como recomendadas.
- Sin imatrix: no hay cuantizaciones ponderadas disponibles en el momento de la publicacion, lo que puede afectar a la calidad de las cuantizaciones pequenas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y del dataset de entrenamiento antes de desplegar en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/CARDS-Qwen3.5-27B-GGUF
- Modelo base: https://huggingface.co/C3DS/CARDS-Qwen3.5-27B
- Dataset de ajuste fino: https://huggingface.co/datasets/C3DS/cards_sft_dataset
- Pagina de descargas del autor: https://hf.tst.eu/model#CARDS-Qwen3.5-27B-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
