# mradermacher/BlueBerry-1-GGUF

## Resumen

BlueBerry-1-GGUF es la versión cuantizada en formato GGUF del modelo artindnr/BlueBerry-1, publicada por el usuario mradermacher. Se trata de un modelo de generación de texto con arquitectura de mezcla de expertos (MoE), según las etiquetas declaradas en el repositorio, y un total de 116.829.156.672 parámetros (unos 116,8 mil millones) según los datos de safetensors del modelo base. El repositorio no contiene los pesos originales, sino conversiones a GGUF pensadas para su ejecución con llama.cpp y herramientas compatibles.

La utilidad de esta publicación es eminentemente práctica: ofrece once variantes de cuantización, desde Q2_K (66,3 GB) hasta Q8_0 (124,4 GB), que permiten desplegar un modelo de más de 100.000 millones de parámetros en configuraciones multi-GPU o con descarga parcial a CPU, algo inviable con los pesos en precisión completa. El repositorio ocupa 943 GB en total.

El modelo declara soporte de persa (fa), inglés (en) y otros idiomas, licencia Apache 2.0 y un enfoque conversacional. Sin embargo, la model card es muy escueta: no detalla la arquitectura interna, el número de parámetros activos, la longitud de contexto ni la composición del dataset de entrenamiento, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mezcla de expertos (MoE); número de expertos, capas y mecanismo de atención no disponibles |
| Parametros totales | 116.829.156.672 (116,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | persa (fa), ingles (en), multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base publica pesos en safetensors |
| Modelo base | artindnr/BlueBerry-1 |
| Cuantizado por | mradermacher |
| Tamano del repositorio | 943,0 GB |
| Descargas | 333 |
| Etiquetas destacadas | mixture-of-experts, mxfp4, text-generation, conversational, endpoints_compatible |
| Fecha de creacion (segun repositorio) | 2026-09-06 |
| Ultima actualizacion (segun repositorio) | 2026-10-10 |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta mixture-of-experts del repositorio y la etiqueta mxfp4, que sugiere que el modelo base fue entrenado o distribuido en formato MXFP4 (formato de coma flotante de 4 bits con escala compartida por bloques). No se dispone de datos sobre el número de expertos, el enrutador, el número de parámetros activos por token, el tipo de atención ni si se emplean capas híbridas o técnicas como decodificación especulativa.

Tampoco hay información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La model card del repositorio cuantizado se limita a indicar que se trata de cuantizaciones estáticas del modelo artindnr/BlueBerry-1 y a listar los archivos generados, además de enlazar material genérico de mradermacher sobre cómo usar GGUF.

## Capacidades

- Generación de texto conversacional: la etiqueta conversational y el pipeline text-generation indican uso previsto como modelo de chat.
- Soporte multilingüe: el modelo declara persa (fa), inglés (en) y categoría multilingual, aunque no se especifica el listado completo de idiomas ni su nivel de competencia.
- Capacidad declarada en las etiquetas del repositorio base para ejecución en entornos con endpoints compatibles (endpoints_compatible).
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode), visión o audio: no disponible en la información proporcionada.
- Generación de código y matemáticas: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en persa e inglés: el modelo declara explícitamente ambos idiomas, de modo que puede emplearse como chatbot de propósito general en aplicaciones dirigidas a usuarios iraníes o a comunidades bilingües persa-inglesas, un nicho con relativamente pocos modelos abiertos de gran tamaño.
- Traducción y localización persa-inglés: al soportar ambos idiomas de forma nativa y contar con 116,8 mil millones de parámetros totales, resulta adecuado para traducir documentación técnica, textos legales o contenido editorial entre ambos idiomas, siempre que se valide la calidad con un conjunto de prueba propio.
- Procesamiento y resumen de documentos largos: con las cuantizaciones Q6_K o Q8_0 (124,3 y 124,4 GB) puede desplegarse un pipeline de resumen y extracción de información sobre corpus en persa, aunque la ventana de contexto real no está documentada y debe medirse experimentalmente.
- Despliegue en infraestructura propia con llama.cpp: los archivos GGUF permiten servir el modelo con llama-server o Ollama en máquinas multi-GPU, sin depender de API externas, lo que resulta relevante para organizaciones con requisitos de soberanía de datos.
- Investigación sobre cuantización: el repositorio incluye once niveles de cuantización del mismo modelo, lo que permite medir de forma controlada la degradación de perplejidad y de calidad de generación entre Q2_K, IQ4_XS, Q4_K_M y Q8_0 sobre el mismo modelo base.
- Evaluación comparativa de arquitecturas MoE: dado que el modelo base no tiene ficha técnica pública detallada, este repositorio sirve como punto de partida para caracterizar experimentalmente un MoE de 116,8 mil millones de parámetros (parámetros activos, latencia por token, comportamiento del enrutador).
- Generación de contenido editorial en persa: redacción asistida de artículos, descripciones de producto o guiones para medios en persa, con revisión humana posterior obligatoria por el riesgo de alucinación inherente a los modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio cuantizado ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench o equivalentes, ni comparaciones con modelos de referencia.

## Requisitos de hardware

Tamaños de archivo y VRAM orientativa (solo pesos; el KV cache depende del contexto y de la arquitectura, no disponibles):

| Cuantizacion | Tamano del archivo | VRAM aproximada con margen |
|---|---|---|
| Q2_K | 66,3 GB | ~70 GB |
| Q3_K_S | 66,2 GB | ~70 GB |
| IQ4_XS | 67,1 GB | ~71 GB |
| Q3_K_M | 71,2 GB | ~75 GB |
| Q3_K_L | 73,5 GB | ~78 GB |
| Q4_K_S | 81,0 GB | ~85 GB |
| Q4_K_M | 88,0 GB | ~92 GB |
| Q5_K_S | 88,1 GB | ~92 GB |
| Q5_K_M | 94,0 GB | ~98 GB |
| Q6_K | 124,3 GB (3 partes) | ~128 GB |
| Q8_0 | 124,4 GB (3 partes) | ~128 GB |

- GPU profesionales recomendadas: 2x H100 80 GB o 2x A100 80 GB cubren desde Q2_K hasta Q4_K_M con margen; para Q6_K y Q8_0 hacen falta al menos 2x H100 80 GB (160 GB) o 4x A100 80 GB.
- Configuraciones consumer: ninguna cuantización cabe en una única GPU de 24 GB. La opción más económica es Q2_K o IQ4_XS en 4x RTX 3090/4090 (96 GB), o bien 3x 24 GB con muy poco margen para el KV cache.
- Descarga a CPU: llama.cpp permite repartir capas entre GPU y RAM del sistema. Para Q2_K y Q3 conviene disponer de al menos 64-96 GB de RAM; para Q4_K_M, 128 GB; para Q8_0, 256 GB. El rendimiento cae de forma notable cuando parte del modelo se ejecuta en CPU.
- Almacenamiento: el repositorio completo ocupa 943 GB. Conviene descargar solo la cuantización necesaria.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, text-generation-webui y llama-cpp-python. vLLM y TGI no consumen GGUF de forma nativa y estable; para esos motores hay que usar los pesos safetensors del modelo base artindnr/BlueBerry-1.
- Latencia y throughput: no disponibles. Al ser un MoE, el rendimiento por token dependerá del número de parámetros activos, dato que no se ha publicado.
- Nota operativa: los archivos Q6_K y Q8_0 se distribuyen en tres partes que deben descargarse y concatenarse antes de su uso.

## Comparativa con modelos similares

Los datos de la columna de BlueBerry-1 son los únicos verificados en este repositorio; las cifras de los modelos alternativos provienen de su documentación pública y se incluyen solo como referencia orientativa de categoría.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| BlueBerry-1-GGUF (este) | 116,8 mil millones | no disponible | no disponible | apache-2.0 |
| Qwen3-235B-A22B | 235 mil millones | 22 mil millones | 128k | Apache 2.0 |
| Mixtral 8x7B | 46,7 mil millones | 12,9 mil millones | 32k | Apache 2.0 |
| Llama 3.1 405B | 405 mil millones | denso | 128k | Llama 3.1 Community License |

No hay datos públicos de rendimiento para BlueBerry-1 que permitan una comparación cuantitativa de calidad con estas alternativas.

## Limitaciones y advertencias

- Ausencia de ficha técnica: no se documentan arquitectura interna, parámetros activos, contexto, dataset ni proceso de alineación, lo que dificulta estimar su comportamiento en producción.
- Riesgo de alucinación: es inherente a los modelos generativos y no hay datos publicados de evaluación que permitan acotarlo. En dominios sensibles (legal, médico, financiero) exige verificación humana.
- Sesgos desconocidos: al no documentarse la composición del corpus de entrenamiento, no es posible anticipar sesgos lingüísticos, culturales o de género, especialmente en el eje persa-inglés.
- Cobertura idiomática incierta: solo se declaran persa, inglés y categoría multilingüe, sin niveles de competencia ni listado exhaustivo.
- Degradación por cuantización: Q2_K, Q3_K_S y Q3_K_M son las variantes de menor calidad; para uso en producción se recomienda IQ4_XS o superior, y Q6_K o Q8_0 cuando la calidad sea prioritaria.
- No hay cuantizaciones con imatrix: la propia model card indica que el autor no ha publicado cuantizaciones ponderadas o con importance matrix, que suelen ofrecer mejor relación calidad/tamaño en los niveles bajos.
- Licencia: Apache 2.0 es permisiva y permite uso comercial, pero conviene verificar la licencia declarada en el repositorio del modelo base antes de explotarlo en producto.
- Requisitos de hardware elevados: ninguna cuantización cabe en una GPU de consumo de 24 GB; el despliegue realista exige multi-GPU o descarga a CPU con la consiguiente pérdida de rendimiento.
- Fechas de creación y actualización poco habituales: los metadatos indican 2026-09-06 y 2026-10-10, lo que puede deberse a un error de registro; conviene contrastarlo.
- Popularidad baja: 333 descargas y 1 me gusta en el momento de la consulta, con muy poca validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BlueBerry-1-GGUF
- Modelo base: https://huggingface.co/artindnr/BlueBerry-1
- Página de resumen de descargas del autor: https://hf.tst.eu/model#BlueBerry-1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
