# mradermacher/Blossom-V7.1-27B-GGUF

## Resumen

Blossom-V7.1-27B-GGUF es la version cuantizada en formato GGUF del modelo Azure99/Blossom-V7.1-27B, publicada por el usuario mradermacher. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion de los pesos originales a cuantizaciones de llama.cpp (Q2_K hasta Q8_0, ademas de variantes IQ) pensadas para ejecucion local en CPU y GPU de consumo. El repositorio incluye tambien ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, lo que confirma que el modelo base acepta entrada de imagenes ademas de texto.

El modelo cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones), esta etiquetado como conversacional, de razonamiento y multimodal, y soporta ingles y chino. La licencia declarada es Apache 2.0, lo que permite uso comercial sin las restricciones tipicas de otras licencias de modelos abiertos. El repositorio ocupa 190,8 GB en total, aunque cada cuantizacion individual pesa entre 11 y 29 GB, de modo que el usuario solo necesita descargar la variante que vaya a utilizar.

La relevancia de esta ficha es practica: permite evaluar rapidamente si un modelo de 27B con capacidades multimodales y de razonamiento se puede desplegar en hardware propio. La informacion publicada no incluye detalles de arquitectura, longitud de contexto ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal mmproj-Q8_0 y mmproj-f16 (los metadatos mencionan tambien f16, no listado en la tabla de ficheros) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en transformers |

Datos adicionales del repositorio: autor de la cuantizacion, mradermacher; modelo base, Azure99/Blossom-V7.1-27B; tamano del repo, 190,8 GB; fecha de creacion declarada en HuggingFace, 2026-09-13; ultima actualizacion, 2026-09-13.

## Arquitectura y entrenamiento

No se ha publicado en la informacion disponible ningun detalle sobre la arquitectura del modelo base (tipo de transformer, atencion, uso de MoE o de mecanismos hibridos), ni sobre el numero de tokens de entrenamiento, la composicion del dataset o la existencia de fases de RLHF, DPO u otras tecnicas de alineamiento. La model card del repositorio GGUF se limita a documentar el proceso de cuantizacion.

Lo unico verificable tecnicamente es el proceso de conversion realizado por mradermacher, que segun los metadatos de la model card emplea `quantize_version: 2`, `convert_type: hf` y `output_tensor_quantised: 1`. Se ofrecen dos familias de cuantizacion: las estaticas de este repositorio y las cuantizaciones ponderadas con imatrix publicadas en un repositorio aparte (Blossom-V7.1-27B-i1-GGUF). La presencia de ficheros `mmproj` indica que el modelo base incorpora un codificador visual y un proyector que se mantiene en precision Q8_0 o f16, independientemente de la cuantizacion del cuerpo del modelo.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta explicita `conversational`.
- Razonamiento explicito, indicado por la etiqueta `reasoning` del repositorio.
- Procesamiento multimodal de imagenes, evidenciado por los ficheros `mmproj` incluidos.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos de idioma.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado, aunque la etiqueta `reasoning` sugiere cierta capacidad de cadena de pensamiento.
- Capacidades de vision, audio u otras modalidades especiales: vision confirmada por el proyector; audio, no disponible.

## Casos de uso

- Asistente conversacional local en chino o ingles: al distribuirse en GGUF, puede ejecutarse en una estacion de trabajo sin conexion a Internet, lo que resulta adecuado para entornos con requisitos de confidencialidad de datos.
- Analisis de documentos con imagenes: la inclusion del proyector multimodal permite pasar capturas, diagramas o paginas escaneadas junto al texto y obtener respuestas que combinan ambas entradas.
- Razonamiento asistido en tareas tecnicas: la etiqueta `reasoning` sugiere su uso para descomponer problemas en pasos intermedios, por ejemplo en la revision de configuraciones o diagnosticos.
- Traduccion y atencion bilingue ingles-chino: es el unico par de idiomas declarado, por lo que encaja en flujos de soporte o documentacion entre ambos idiomas.
- Despliegue en hardware de gama alta de consumo: con la cuantizacion Q4_K_M (16,9 GB) el modelo cabe en tarjetas de 24 GB, lo que permite prototipado local sin depender de APIs externas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion del mismo modelo, lo que permite medir en un mismo entorno el impacto de la precision sobre la calidad de salida y el consumo de memoria.
- Integracion en aplicaciones de escritorio y herramientas de linea de comandos basadas en llama.cpp, como interfaces de chat locales o asistentes embebidos en el editor.
- Generacion de codigo en produccion: no confirmado, ya que la informacion disponible no documenta capacidades de programacion ni soporte de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto fuentes relevantes sobre el modelo (los resultados obtenidos no guardan relacion con el modelo y se descartan por completo).

## Requisitos de hardware

Los siguientes tamanos de pesos proceden directamente de la tabla de ficheros publicada por el autor. La VRAM necesaria debe sumar a esos valores la cache KV y el overhead del runtime, que dependen de la longitud de contexto y no estan documentados.

| Cuantizacion | Peso del fichero | VRAM orientativa (pesos + margen) |
|---|---|---|
| Q2_K | 11,0 GB | ~12-13 GB |
| Q3_K_S | 12,4 GB | ~13-14 GB |
| Q3_K_M | 13,6 GB | ~15 GB |
| Q3_K_L | 14,7 GB | ~16 GB |
| IQ4_XS | 15,5 GB | ~17 GB |
| Q4_K_S | 15,9 GB | ~17 GB |
| Q4_K_M | 16,9 GB | ~18 GB |
| Q5_K_S | 19,1 GB | ~20 GB |
| Q5_K_M | 19,6 GB | ~21 GB |
| Q6_K | 22,5 GB | ~24 GB |
| Q8_0 | 29,1 GB | ~31 GB |
| mmproj-Q8_0 | 0,7 GB | se suma a la cuantizacion elegida |
| mmproj-f16 | 1,0 GB | se suma a la cuantizacion elegida |

- Tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070): solo las cuantizaciones mas agresivas (Q2_K, Q3_K_S) entran completas en VRAM; el resto requiere descarga parcial a RAM.
- Tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 5070 Ti): admiten hasta Q3_K_L o IQ4_XS completas.
- Tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090): admiten hasta Q6_K con margen para cache KV; Q8_0 queda al limite.
- Tarjetas profesionales (A6000 48 GB, A100 40/80 GB, H100): permiten Q8_0 e incluso precisiones superiores, ademas de servir varias peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos servidores habria que usar los pesos originales en transformers del repositorio base.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparacion funcional con otros modelos de la misma categoria, y la informacion proporcionada no identifica alternativas comparables. La unica comparacion posible es entre las variantes derivadas del mismo modelo base.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Blossom-V7.1-27B-GGUF | 27,3B | no disponible | GGUF (cuantizaciones estaticas) | apache-2.0 | publico en HuggingFace |
| mradermacher/Blossom-V7.1-27B-i1-GGUF | 27,3B (mismo modelo) | no disponible | GGUF (cuantizaciones ponderadas con imatrix) | apache-2.0 | publico en HuggingFace |
| Azure99/Blossom-V7.1-27B | 27,3B | no disponible | transformers (safetensors) | apache-2.0 (segun el repositorio cuantizado) | publico en HuggingFace |

No se dispone de datos de benchmarks, contexto ni rendimiento del modelo base ni de las alternativas, por lo que no es posible establecer una comparacion cuantitativa con modelos de otros autores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado principalmente en ingles y chino, es previsible un sesgo cultural hacia esos dos entornos, aunque no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para este modelo.
- Limitacion de idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Limitacion de contexto: se desconoce la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantias.
- Cuantizacion agresiva: las variantes por debajo de Q4 (Q2_K, Q3_K_*) degradan la calidad de forma notable; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia efectiva del modelo base en Azure99/Blossom-V7.1-27B antes de un despliegue en produccion, ya que la model card del repositorio cuantizado no detalla condiciones adicionales.
- Uso multimodal: para aprovechar la entrada de imagenes es obligatorio descargar tambien el fichero `mmproj`, que anade entre 0,7 y 1,0 GB y requiere un runtime con soporte de proyector multimodal.
- Estado del repositorio: figura con 0 descargas y 0 likes, y una fecha de creacion declarada de 2026-09-13, por lo que no existe validacion comunitaria ni evidencia de uso en produccion.
- Trazabilidad: este repositorio no incluye informacion sobre datos de entrenamiento, por lo que no es posible evaluar procedencia de datos ni cumplimiento normativo mas alla de la licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Blossom-V7.1-27B-GGUF
- Modelo base: https://huggingface.co/Azure99/Blossom-V7.1-27B
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/Blossom-V7.1-27B-i1-GGUF
- Pagina de resumen del modelo en el sitio del autor: https://hf.tst.eu/model#Blossom-V7.1-27B-GGUF
- Preguntas frecuentes y peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota sobre la busqueda web: los resultados obtenidos no contienen informacion relacionada con el modelo ni con su autor, por lo que no se han utilizado como fuente en esta ficha.
