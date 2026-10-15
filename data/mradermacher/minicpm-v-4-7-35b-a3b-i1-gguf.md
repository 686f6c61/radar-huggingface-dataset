# mradermacher/MiniCPM-V-4.7-35B-A3B-i1-GGUF

## Resumen

MiniCPM-V-4.7-35B-A3B-i1-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo multimodal MiniCPM-V-4.7-35B-A3B, publicado por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una reempaquetado del modelo original de openbmb (OpenBMB) en cuantizaciones de tipo i1 (imatrix), pensadas para ejecucion en llama.cpp y otros runners compatibles con GGUF. El modelo subyacente es un modelo de vision-lenguaje (VLM) con arquitectura de mezcla de expertos (MoE), con aproximadamente 34.660 millones de parametros totales y un nombre que indica unos 3.000 millones de parametros activos por token (sufijo A3B), lo que lo situa en la categoria de modelos "grandes en disco, ligeros en computo".

La relevancia de esta publicacion es practica: el repositorio ofrece 14 cuantizaciones distintas que van desde los 8,3 GB (i1-IQ1_M) hasta los 28,6 GB (i1-Q6_K), lo que permite desplegar un VLM MoE de ~35.000 millones de parametros en hardware de consumo si se acepta la degradacion de calidad de las cuantizaciones mas agresivas. La cuantizacion i1-IQ4_XS (18,8 GB), i1-Q4_K_S (20,0 GB) y i1-Q4_K_M (21,3 GB) son los puntos de equilibrio habituales entre tamano, velocidad y fidelidad.

La informacion disponible sobre el modelo base es limitada: la model card del repositorio cuantizado no incluye datos sobre composicion del dataset, numero de tokens de entrenamiento, longitud de contexto, proceso de alineacion ni resultados de benchmarks. Los tags declarados son `minicpm-v`, `multimodal`, `moe`, `On-Device Model`, `lightweight`, `conversational` y `en` como unico idioma. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), segun el tag `moe` y la nomenclatura A3B del nombre |
| Parametros totales | 34.659.889.792 (34,66 mil millones, dato real de safetensors) |
| Parametros activos | Aproximadamente 3.000 millones por token, segun el sufijo A3B del nombre del modelo |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_M, IQ2_XXS, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q6_K; incluye fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (segun la model card; no se declaran otros idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM-V-4.7-35B-A3B, es un modelo de vision-lenguaje de la familia MiniCPM-V, orientado a despliegue en dispositivo (los tags incluyen `On-Device Model` y `lightweight`). Su nombre indica una arquitectura de mezcla de expertos con unos 34,66 mil millones de parametros totales y aproximadamente 3.000 millones activos por token, un patron habitual en modelos MoE de nueva generacion que buscan reducir el coste de inferencia manteniendo la capacidad total. Tambien incorpora un codificador visual, ya que en el repositorio de cuantizaciones estaticas se distribuyen ficheros `mmproj` especificos para la torre de vision.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO u otra alineacion, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, resolucion de imagen soportada, etc.). Tampoco se documentan en esta ficha los detalles del tokenizador ni el tipo de vocabulario empleado.

El trabajo de mradermacher se limita a la cuantizacion: aplica calibracion con imatrix (matriz de importancia) para producir cuantizaciones de baja precision con menos perdida de calidad que las cuantizaciones estaticas equivalentes. El repositorio hermano de cuantizaciones estaticas se encuentra en mradermacher/MiniCPM-V-4.7-35B-A3B-GGUF, y es alli donde residen los ficheros `mmproj` para la parte de vision, segun indica la propia model card.

## Capacidades

- Generacion de texto conversacional multimodal: el tag `conversational` y la naturaleza MiniCPM-V indican soporte de dialogos multi-turno, con entrada de imagen y texto.
- Comprension de imagenes: al ser un modelo de vision-lenguaje, se le presupone capacidad de descripcion de imagenes, respuesta a preguntas visuales (VQA) y OCR, aunque no se documentan tareas concretas en la informacion disponible.
- Ejecucion en dispositivo: el tag `On-Device Model` y el rango de cuantizaciones (desde 8,3 GB) apuntan a despliegue local en equipos de consumo.
- Eficiencia de computo por MoE: con aproximadamente 3.000 millones de parametros activos, el coste por token es sustancialmente menor que el de un modelo denso de 35.000 millones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara `en`; no disponible informacion sobre otros idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente visual local en portatil o estacion de trabajo: con la cuantizacion i1-Q4_K_S (20,0 GB) o i1-IQ4_XS (18,8 GB) el modelo puede ejecutarse en una GPU de consumo de gama alta o en CPU con RAM suficiente, ofreciendo descripcion de imagenes y dialogos sin enviar datos a servicios externos.
- Documentacion tecnica y OCR en local: procesamiento de capturas de pantalla, diagramas o documentos escaneados dentro de un flujo air-gapped, donde la politica de privacidad impide usar APIs en la nube.
- Prototipado rapido de aplicaciones VLM: las cuantizaciones pequenas (i1-IQ2_XXS, 9,6 GB; i1-IQ2_M, 11,8 GB) permiten validar pipelines de vision-lenguaje en maquinas modestas antes de escalar a pesos completos.
- Investigacion sobre cuantizacion: el repositorio incluye el fichero imatrix (0,5 GB) y las instrucciones para generar cuantizaciones propias, lo que lo hace util para estudiar el impacto de la precision en modelos MoE multimodales.
- Despliegue en entornos con VRAM limitada: la familia de cuantizaciones permite ajustar el nivel de compresion al presupuesto de memoria disponible por maquina, desde 8,3 GB hasta 28,6 GB para el mismo modelo.
- Generacion asistida por imagen en herramientas de escritorio: integracion mediante llama.cpp, Ollama o LM Studio en aplicaciones de escritorio que necesiten capacidades de vision sin conexion.
- Analisis de contenido grafico por lotes: con throughput suficiente (segun hardware), clasificacion y descripcion automatica de imagenes en pipelines internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye cifras de MMLU, MMBench, HumanEval, GSM8K ni de cualquier otra evaluacion, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el coste de la cache KV y del proyector visual `mmproj`. Valores orientativos por cuantizacion: i1-IQ1_M 8,3 GB; i1-IQ2_XXS 9,6 GB; i1-IQ2_M 11,8 GB; i1-Q2_K_S 12,3 GB; i1-Q2_K 13,0 GB; i1-IQ3_XXS 13,7 GB; i1-Q3_K_S 15,3 GB; i1-IQ3_M 15,5 GB; i1-Q3_K_M 16,9 GB; i1-Q3_K_L 18,2 GB; i1-IQ4_XS 18,8 GB; i1-Q4_K_S 20,0 GB; i1-Q4_K_M 21,3 GB; i1-Q6_K 28,6 GB.
- GPU recomendadas: no disponibles de forma oficial. Como referencia practica, las cuantizaciones de 8 a 14 GB pueden caber en GPUs de consumo con 12-16 GB de VRAM (por ejemplo, RTX 4070 Ti, RTX 4080); las de 18-22 GB requieren 24 GB (RTX 3090, RTX 4090) o descarga parcial a RAM; las de 28,6 GB quedan fuera de la mayoria de GPUs de consumo y suelen requerir A100 40 GB, H100 o ejecucion hibrida CPU+GPU.
- Cabe en GPU de consumo: si, en las cuantizaciones bajas y medias, siempre que se acepte la degradacion de calidad asociada (la propia model card marca i1-Q2_K_S como "very low quality" y i1-IQ1_M como "mostly desperate").
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF que soporte modelos multimodales con fichero `mmproj`. Para la torre de vision es necesario descargar el `mmproj` desde el repositorio de cuantizaciones estaticas.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con aproximadamente 3.000 millones de parametros activos, el throughput esperado por token es mas cercano al de un modelo denso de ese tamano que al de uno de 35.000 millones, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B (i1-GGUF, mradermacher) | 34,66 mil millones | ~3.000 millones (segun nomenclatura A3B) | no disponible | Apache 2.0 | GGUF en HuggingFace |
| MiniCPM-V-4.7-35B-A3B (original, openbmb) | 34,66 mil millones | ~3.000 millones | no disponible | Apache 2.0 | Pesos originales en HuggingFace |
| Alternativas multimodales de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre modelos alternativos comparables (por ejemplo, otras familias VLM de rango 30-40 mil millones con arquitectura MoE), por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: todo el merito arquitectonico y de entrenamiento corresponde a openbmb; los posibles fallos de calidad introducidos por la compresion son responsabilidad del proceso de cuantizacion.
- Perdida de calidad en cuantizaciones agresivas: la propia model card advierte que i1-Q2_K_S es de muy baja calidad ("very low quality") y que i1-IQ1_M es "mostly desperate" (uso desesperado). En esos niveles, el rendimiento en tareas visuales y de razonamiento puede degradarse de forma severa.
- El fichero i1-Q2_K se describe como probablemente inferior a IQ3_XXS, y varias cuantizaciones intermedias llevan notas de calidad relativa que conviene leer antes de elegir una.
- Idiomas: solo se declara ingles (`en`). No hay evidencia en la informacion disponible de un rendimiento fiable en castellano u otros idiomas.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar despliegues que dependan de contexto largo (documentos extensos, conversaciones prolongadas o multiples imagenes por peticion).
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero aplicable a cualquier modelo generativo multimodal. En tareas de OCR y descripcion de imagenes conviene validar las salidas, especialmente con cuantizaciones de baja precision.
- Sesgos: no documentados. No hay informacion sobre composicion del dataset ni sobre evaluaciones de sesgo.
- Necesidad de dos repositorios: los ficheros `mmproj` de la torre de vision estan en el repositorio de cuantizaciones estaticas, no en este; hay que descargarlos por separado para usar las capacidades multimodales.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y de atribucion. Conviene verificar igualmente las condiciones del modelo base en su repositorio original.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion comunitaria y de informes de problemas de terceros.
- Ausencia de benchmarks: no hay ninguna cifra publicada que permita estimar el rendimiento real ni compararlo con alternativas.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1): https://huggingface.co/mradermacher/MiniCPM-V-4.7-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estaticas y ficheros mmproj: https://huggingface.co/mradermacher/MiniCPM-V-4.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#MiniCPM-V-4.7-35B-A3B-i1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
