# mradermacher/Qwen3.5-27B-GGUF

## Resumen

Qwen3.5-27B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen/Qwen3.5-27B, publicada por el usuario mradermacher, especializado en la conversión de pesos a GGUF para inferencia local. El repositorio no contiene un modelo entrenado desde cero, sino una colección de ficheros derivados del modelo base, listos para ejecutarse con llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp, entre otros). El modelo base pertenece a la familia Qwen3.5, desarrollada por el equipo Qwen de Alibaba, y el tag `conversational` junto con `endpoints_compatible` indica que está pensado para uso conversacional y para servirse mediante APIs compatibles con el estándar de HuggingFace.

El tamaño real declarado en los pesos safetensors del modelo base es de 26.895.998.464 parámetros, aproximadamente 26,9 mil millones, lo que sitúa al modelo en la gama alta de consumo profesional pero todavía ejecutable en hardware de una sola GPU de gama alta o en configuraciones multi-GPU de consumo. La licencia es Apache 2.0, heredada del modelo original, lo que permite uso comercial sin restricciones adicionales conocidas. La presencia de ficheros `mmproj` (proyector multimodal) entre los artefactos publicados indica que el modelo base incorpora capacidades multimodales, presumiblemente de visión, aunque la model card no detalla su alcance.

La relevancia de esta publicación es práctica: proporciona hasta trece niveles de cuantización distintos, desde Q2_K (10,2 GB) hasta Q8_0 (28,7 GB), lo que permite desplegar un modelo de casi 27.000 millones de parámetros en tarjetas gráficas que van desde 12 GB hasta 32 GB de VRAM. La fecha de creación del repositorio (25 de febrero de 2026) y su última actualización (16 de octubre de 2026) indican un proyecto mantenido. La longitud de contexto, la composición del dataset de entrenamiento y los resultados de benchmarks no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una conversion GGUF del modelo base Qwen/Qwen3.5-27B; la arquitectura concreta no se detalla en la model card) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones), segun los pesos safetensors del modelo base |
| Parametros activos | no aplicable / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; adicionalmente mmproj-Q8_0 y mmproj-f16; versiones ponderadas con imatrix en mradermacher/Qwen3.5-27B-i1-GGUF |
| Idiomas soportados | en (segun los metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (ficheros `.gguf`, algunos de varias partes y con posibilidad de concatenacion); ficheros mmproj separados para el componente multimodal |
| Tamano del repositorio | 186,7 GB |
| Descargas | 1115 |
| Likes | 2 |
| Fecha de creacion | 2026-02-25 |
| Ultima actualizacion | 2026-10-16 |
| Libreria declarada | transformers |
| Modelo base | Qwen/Qwen3.5-27B |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura del modelo base ni el proceso de entrenamiento. Se trata de una publicación de cuantización estática (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) generada por mradermacher a partir de los pesos de Qwen/Qwen3.5-27B. El conversor toma los tensores en precisión completa del modelo original y los transforma a bloques de cuantización k-quant e IQ-quant propios del formato GGUF, manteniendo las capas del transformer original sin modificar su topología. No hay, por tanto, un entrenamiento adicional, ni ajuste fino, ni destilación: únicamente una reducción de precisión numérica de los pesos.

La información disponible permite afirmar dos cosas sobre la estructura del modelo. La primera es que no se declara ningún mecanismo de mezcla de expertos, ya que no hay campo de parámetros activos ni indicación de arquitectura MoE en los metadatos, lo que sugiere un transformer denso convencional de aproximadamente 26,9 mil millones de parámetros. La segunda es la existencia de ficheros `mmproj` en formato Q8_0 (0,7 GB) y f16 (1,0 GB), que en el ecosistema llama.cpp corresponden al proyector que conecta un codificador visual con el modelo de lenguaje, lo que implica que el modelo base tiene capacidad multimodal. Los detalles sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación no están disponibles en la información proporcionada.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` en los metadatos y la categoria declarada del repositorio indican que el modelo esta orientado a dialogos multi-turno.
- Capacidad multimodal: la publicacion de ficheros `mmproj` en Q8_0 y f16 confirma que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imagenes, aunque el alcance exacto (vision, OCR, comprension de documentos) no se detalla en la model card.
- Inferencia local en CPU y GPU: al estar en formato GGUF, el modelo puede ejecutarse con llama.cpp y aprovechar aceleracion por GPU mediante offload de capas.
- Servicio mediante API compatible con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en infraestructuras compatibles con el estandar de endpoints de HuggingFace.
- Ajuste fino de calidad mediante cuantizaciones ponderadas: la variante i1-GGUF utiliza matrices de importancia (imatrix) para distribuir mejor el error de cuantizacion, lo que mejora la fidelidad respecto a las cuantizaciones estaticas del mismo tamano.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades multilingues: los metadatos solo declaran `en`; no hay informacion sobre otros idiomas.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con llama.cpp u Ollama en un servidor propio para gestionar conversaciones multi-turno sin enviar datos a terceros. Es adecuado porque el repositorio ofrece el mismo modelo en varios niveles de cuantizacion, lo que permite escoger el equilibrio entre calidad y consumo de VRAM segun el hardware disponible.
- Analisis de documentos con componente visual: cargando los ficheros `mmproj` junto con el modelo principal, se puede procesar entradas que combinen texto e imagenes, por ejemplo para extraer informacion de capturas de pantalla, diagramas o documentos escaneados integrados en un flujo de trabajo local.
- Sustitucion de APIs comerciales en entornos con requisitos de soberania del dato: al tener licencia Apache 2.0 y ejecutarse en infraestructura propia, encaja en organizaciones que no pueden enviar contenido sensible a servicios externos. El modelo de 26,9 mil millones de parametros ofrece un nivel de capacidad que no suele alcanzarse con modelos locales de 7 a 13 mil millones.
- Generacion de texto tecnico y redaccion asistida: con la cuantizacion Q6_K o Q8_0, el modelo puede emplearse para tareas de redaccion y reescritura donde la fidelidad linguistica importa mas que la velocidad. La cuantizacion alta reduce la degradacion respecto a los pesos originales.
- Prototipado rapido de aplicaciones de IA generativa: gracias a las cuantizaciones bajas (Q2_K en 10,2 GB, Q3_K_S en 12,2 GB), un desarrollador puede validar la viabilidad de un producto en una GPU de consumo antes de comprometer presupuesto en hardware profesional.
- Investigacion sobre el impacto de la cuantizacion: el repositorio publica trece niveles distintos del mismo modelo mas una version con imatrix, lo que lo convierte en un banco de pruebas util para medir como afecta cada esquema de cuantizacion a la perplexidad y a la calidad de las respuestas.
- Despliegue en estaciones de trabajo de analistas: con una unica GPU de 24 GB y la cuantizacion Q4_K_M (16,6 GB) o Q5_K_M (19,5 GB), un analista puede ejecutar el modelo de forma interactiva mientras mantiene el resto de sus herramientas abiertas.
- Integracion en pipelines de procesamiento por lotes: mediante llama-server o el binario de llama.cpp, el modelo puede procesar lotes de textos en segundo plano, por ejemplo clasificacion, resumen o extraccion de entidades a partir de documentos almacenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web proporcionada no contienen informacion relacionada con el modelo (los enlaces devueltos corresponden a previsiones meteorologicas de la localidad francesa de Camiers y no guardan relacion con el objeto de esta ficha).

## Requisitos de hardware

- VRAM estimada para inferencia: los tamanos de fichero publicados sirven como referencia aproximada del peso en memoria de los pesos, a los que hay que sumar la cache KV y el overhead del runtime. Q2_K 10,2 GB; Q3_K_S 12,2 GB; Q3_K_M 13,4 GB; Q3_K_L 14,1 GB; IQ4_XS 14,9 GB; Q4_K_S 15,7 GB; Q4_K_M 16,6 GB; Q5_K_S 18,8 GB; Q5_K_M 19,5 GB; Q6_K 22,2 GB; Q8_0 28,7 GB. El componente multimodal anade 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16).
- GPU de 12 GB (RTX 3060 12 GB, RTX 4070): viable solo con Q2_K o Q3_K_S, y con contexto reducido, ya que la cache KV compite con los pesos por el mismo espacio.
- GPU de 16 GB (RTX 4060 Ti 16 GB, RTX 5070 Ti): Q3_K_L, IQ4_XS o Q4_K_S con margen limitado para contexto largo.
- GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090 con 24 GB): configuracion recomendada con Q4_K_M (16,6 GB) o Q5_K_M (19,5 GB), dejando espacio para cache KV y para el proyector multimodal. Q6_K (22,2 GB) entra pero reduce el margen para contexto.
- GPU de 32 GB (RTX 5090 32 GB, V100 32 GB): permite Q6_K con contexto amplio o Q8_0 (28,7 GB) con contexto reducido y sin margen para otras cargas.
- GPU profesionales (A100 40 GB, A100 80 GB, H100): permiten Q8_0 con contexto largo y, en el caso de 80 GB o de configuraciones multi-GPU, la ejecucion de varias instancias en paralelo.
- Ejecucion en CPU: el formato GGUF permite ejecutar el modelo integramente en CPU con RAM suficiente (al menos el tamano del fichero mas la cache KV). El rendimiento en CPU es sensiblemente inferior al de GPU y no se dispone de cifras concretas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, KoboldCpp, Jan, y frontends similares basados en llama.cpp. vLLM y TGI estan orientados a los pesos originales en safetensors; su soporte de GGUF es experimental y no se detalla en la informacion disponible. El tag `endpoints_compatible` sugiere compatibilidad con el estandar de endpoints de HuggingFace.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones ni para ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-27B-GGUF (este modelo) | 26,9 mil millones | GGUF | 11 niveles estaticos + 2 mmproj | Apache 2.0 | HuggingFace, 1115 descargas, 2 likes |
| mradermacher/Qwen3.5-27B-i1-GGUF | 26,9 mil millones | GGUF (ponderado con imatrix) | no detallado en la informacion disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-27B (modelo base) | 26,9 mil millones | safetensors | pesos en precision completa | Apache 2.0 | HuggingFace |

No se dispone de informacion sobre otros modelos de la misma categoria (mismo orden de parametros y misma tarea) que permita una comparativa de rendimiento, contexto o throughput. Los resultados de la busqueda web proporcionada no aportan datos utilizables al respecto.

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es una cuantizacion del modelo Qwen/Qwen3.5-27B. Cualquier limitacion del modelo base se hereda, y la cuantizacion anade una degradacion adicional que crece a medida que baja la precision (Q2_K y Q3_K son las mas agresivas).
- Las cuantizaciones bajas (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma apreciable. Para uso en produccion se recomienda Q4_K_M o superior; la propia model card recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K como calidad muy buena.
- La model card advierte explicitamente de que Q3_K_M es de calidad inferior ("lower quality").
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a cualquier modelo de lenguaje de esta escala, especialmente en tareas de recuperacion de hechos y en contextos con informacion ambigua.
- Idiomas: los metadatos solo declaran ingles (`en`). No hay informacion sobre el rendimiento en castellano ni en otros idiomas, por lo que su uso en produccion multilingue no esta respaldado por datos.
- Longitud de contexto: no disponible. No se puede planificar el uso en escenarios de contexto largo sin conocer este dato, que ademas condiciona la VRAM necesaria para la cache KV.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada. Al ser un derivado de un modelo entrenado con datos web a gran escala, cabe esperar sesgos similares a los de su clase, pero no hay analisis publicado en los materiales disponibles.
- Licencia: Apache 2.0, lo que en principio permite uso comercial, modificacion y redistribucion. Aun asi, se recomienda revisar el enlace de licencia del modelo base (https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE) para confirmar condiciones adicionales, ya que esta ficha se basa en los metadatos declarados.
- Tamano del repositorio: 186,7 GB. Descargar el conjunto completo de cuantizaciones es inviable para la mayoria de conexiones; conviene descargar unicamente el fichero de cuantizacion deseado.
- Compatibilidad: al ser ficheros GGUF, no son cargables directamente con `transformers` mediante `AutoModelForCausalLM` a pesar de que la libreria declarada sea `transformers`. Requieren llama.cpp o un runtime con soporte GGUF.
- Los ficheros GGUF de gran tamano pueden estar divididos en varias partes; es necesario concatenarlas o descargarlas correctamente antes de su uso.
- El componente multimodal requiere cargar los ficheros `mmproj` por separado; sin ellos, el modelo funcionara unicamente como modelo de texto.

## Enlaces

- Repositorio HuggingFace (cuantizaciones estaticas): https://huggingface.co/mradermacher/Qwen3.5-27B-GGUF
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/Qwen3.5-27B-i1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3.5-27B-GGUF
- Solicitudes de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke, incluida la concatenacion de ficheros multiparte): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

Nota: los resultados de la busqueda web proporcionada no contienen informacion relacionada con el modelo. Todos los enlaces devueltos corresponden a servicios de prevision meteorologica de la localidad francesa de Camiers (meteofrance.com, lachainemeteo.com, meteocity.com, directmeteo.com) y se han descartado por no ser pertinentes.
