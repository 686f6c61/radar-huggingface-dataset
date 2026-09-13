# mradermacher/GRaPE-2.5-Quasar-GGUF

## Resumen

GRaPE-2.5-Quasar-GGUF es la versión cuantizada en formato GGUF del modelo SL-AI/GRaPE-2.5-Quasar, publicada por el usuario mradermacher (nethype GmbH) el 13 de septiembre de 2026. Se trata de un modelo de lenguaje de 27.320.697.856 parámetros (unos 27,3 mil millones) con licencia Apache 2.0, etiquetado por su autor como multimodal (visión), instruct, con modos de pensamiento y capacidades declaradas de razonamiento, código, matemáticas, ciencia, escritura creativa y roleplay.

La ficha original no documenta arquitectura, longitud de contexto, composición del dataset ni proceso de alineación. Las etiquetas incluyen "qwen3.5", lo que sugiere una posible familia base tipo Qwen, pero no hay confirmación en la información disponible, por lo que ese dato debe tratarse como no verificado. El repositorio contiene únicamente cuantizaciones estáticas (sin quants ponderados con imatrix, según indica el propio autor), más dos ficheros `mmproj` necesarios para habilitar la entrada de imágenes.

Su relevancia práctica está en el tamaño: con 27,3 B de parámetros, la cuantización Q4_K_S (15,9 GB) permite ejecutar el modelo en una única GPU de consumo de 24 GB (RTX 3090/4090) o en configuraciones híbridas CPU+GPU, algo que la versión en safetensors del modelo base no permite de forma directa. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que carece todavía de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta del autor "qwen3.5", sin confirmar) |
| Parametros totales | 27.320.697.856 (~27,3 B), dato de safetensors del modelo base |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (11,0 GB), Q4_K_S (15,9 GB), mmproj-Q8_0 (0,7 GB), mmproj-f16 (1,0 GB). Los metadatos del autor mencionan además x-f16, Q8_0, Q6_K, Q3_K_S/M/L, Q4_K_M, Q5_K_S/M e IQ4_XS |
| Idiomas soportados | en, zh, fr, de, es, ja, ko, pt, ru, ar (10 idiomas declarados) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (incluidos los ficheros mmproj en GGUF); safetensors en el modelo base |
| Modelo base | SL-AI/GRaPE-2.5-Quasar |
| Fecha de publicacion de la cuantizacion | 2026-09-13 |
| Tamano del repositorio | 28,2 GB |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna (transformer denso, MoE, híbrida u otra), el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO u otra alineación. Las etiquetas del repositorio apuntan a un modelo multimodal con torre de visión ("vision", "multimodal"), modos de pensamiento explícitos ("thinking_modes") y orientación instruct/chat, pero se trata de etiquetas descriptivas, no de especificaciones técnicas.

En cuanto al proceso de cuantización, los metadatos del autor indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica conversión desde pesos HuggingFace. El autor señala explícitamente que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación y que, si no aparecen en una semana, no están planificadas. El repositorio incluye además un fichero `mmproj` (en Q8_0 y f16) como complemento multimodal; sin él, la parte de visión no es funcional en runtimes basados en llama.cpp.

## Capacidades

- Generación de texto conversacional en modo instruct y chat, con plantilla multi-turno.
- Razonamiento con modos de pensamiento explícitos ("thinking_modes"), según las etiquetas del autor.
- Generación de código, matemáticas y contenido científico (etiquetas "coding", "math", "science").
- Escritura creativa y roleplay (etiquetas "creative_writing", "roleplay").
- Entrada de imágenes: multimodal/visión mediante los ficheros `mmproj-Q8_0` o `mmproj-f16`.
- Multilingüe en 10 idiomas declarados: inglés, chino, francés, alemán, español, japonés, coreano, portugués, ruso y árabe.
- Etiqueta "endpoints_compatible", que indica compatibilidad con endpoints de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; únicamente sugerido por la etiqueta "reasoning".
- Capacidades de audio: no disponibles.

## Casos de uso

- Atención al cliente multilingüe on-premise: el modelo declara soporte para 10 idiomas, entre ellos español, inglés, alemán, francés y portugués, lo que permite desplegar un único motor de chat para varios mercados sin depender de APIs externas. La cuantización Q4_K_S encaja en una GPU de 24 GB.
- Asistente de programación integrado en el IDE: con las etiquetas "coding" e "instruct", puede usarse para autocompletado, generación de funciones y explicación de código en un servidor local, evitando enviar código propietario a servicios en la nube.
- Procesamiento de documentos con imágenes: gracias a los ficheros `mmproj`, es posible enviar capturas, esquemas o páginas escaneadas junto al texto para tareas de extracción de información, resumen o respuesta a preguntas sobre el contenido visual.
- Tutoría y resolución de problemas de matemáticas y ciencias: el modo de pensamiento declarado permite generar cadenas de razonamiento intermedias antes de la respuesta final, útil en entornos educativos donde interesa mostrar el desarrollo del problema.
- Generación de contenido creativo y narrativa interactiva: las etiquetas "creative_writing" y "roleplay" lo orientan a guiones, diálogos de personajes y sistemas de narrativa ramificada para videojuegos o prototipos de ficción interactiva.
- Despliegue en entornos con requisitos de privacidad (legal, sanidad, sector público): al ejecutarse íntegramente en hardware propio mediante llama.cpp u Ollama, los datos no salen de la infraestructura de la organización.
- Investigación sobre cuantización: el repositorio ofrece Q2_K y Q4_K_S del mismo modelo, lo que permite medir empíricamente la degradación de calidad entre niveles de compresión en una misma familia de pesos.
- Prototipado rápido de producto: el formato GGUF y la licencia Apache 2.0 facilitan pruebas de concepto sin negociar licencias ni montar infraestructura de servido compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y la búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo base SL-AI/GRaPE-2.5-Quasar ni sobre esta cuantización.

## Requisitos de hardware

- VRAM estimada para los pesos: Q2_K aproximadamente 11,0 GB; Q4_K_S aproximadamente 15,9 GB. A estas cifras hay que sumar el fichero `mmproj` (0,7 GB en Q8_0 o 1,0 GB en f16) si se usa la parte de visión, más la caché KV correspondiente al contexto configurado.
- GPU recomendadas: para Q4_K_S, una RTX 3090 o RTX 4090 (24 GB) permite cargar el modelo completo con contexto moderado; para Q2_K, tarjetas de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB pueden ser suficientes con contexto reducido.
- GPU de datacenter: A100 40/80 GB, H100 o L40S permiten cargar Q4_K_S con contexto amplio y mayor concurrencia, o mantener varias instancias.
- ¿Cabe en GPU de consumo? Sí: Q2_K en GPU de 16 GB y Q4_K_S en GPU de 24 GB. Por debajo de 16 GB es necesario repartir capas entre GPU y CPU (offload parcial), con la consiguiente pérdida de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runtimes compatibles con GGUF. Para vLLM o TGI, el soporte de GGUF es limitado y conviene usar la versión en safetensors del modelo base.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo analizado, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos proceden de documentación pública general y deben verificarse antes de usarse en una decisión de producción.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRaPE-2.5-Quasar-GGUF | ~27,3 B | no disponible | Si (via mmproj) | apache-2.0 | GGUF (Q2_K, Q4_K_S) |
| Qwen2.5-32B-Instruct | ~32,8 B | 128K (segun documentacion publica) | No | apache-2.0 | safetensors y multiples cuantizaciones |
| Gemma 3 27B | ~27 B | 128K (segun documentacion publica) | Si | Licencia Gemma (con condiciones de uso) | safetensors y cuantizaciones |
| Mistral Small 3.1 24B | ~24 B | 128K (segun documentacion publica) | Si | apache-2.0 | safetensors y cuantizaciones |

Diferencias destacables: GRaPE-2.5-Quasar-GGUF comparte licencia permisiva con Qwen2.5-32B-Instruct y Mistral Small 3.1 24B, pero no hay ninguna métrica pública que permita situarlo frente a ellos. Además, su ecosistema de cuantizaciones es mucho más reducido (dos quants de pesos más dos ficheros mmproj) y no dispone de versiones ponderadas con imatrix.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible estimar su calidad real frente a alternativas de tamaño similar.
- Falta de especificaciones: se desconoce la arquitectura, el contexto máximo, el volumen de tokens de entrenamiento y el proceso de alineación.
- Cuantizaciones estáticas: el autor indica que no hay quants ponderados con imatrix y que probablemente no los habrá. La calidad de Q2_K puede degradarse de forma notable, especialmente en tareas de razonamiento y código.
- Cuantización de terceros: el repositorio pertenece a mradermacher, no al autor original del modelo, por lo que pueden existir diferencias de comportamiento respecto a los pesos en safetensors.
- Visión dependiente del runtime: la funcionalidad multimodal requiere cargar el fichero `mmproj` y un runtime que lo soporte; muchas integraciones habituales no lo hacen.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala, sin que existan evaluaciones publicadas que permitan acotarlo.
- Idiomas declarados sin evaluación: el español figura entre los 10 idiomas soportados, pero no hay ninguna métrica de calidad por idioma; el rendimiento en español podría ser inferior al del inglés.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene confirmar la licencia del modelo base SL-AI/GRaPE-2.5-Quasar en su propio repositorio antes de desplegarlo en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay señales de uso en producción ni incidencias reportadas por la comunidad.
- Uso en agentes: no se documenta soporte de tool calling ni de razonamiento multi-paso con llamadas a herramientas, por lo que no debería asumirse sin pruebas.

## Enlaces

- Repositorio de la cuantizacion en HuggingFace: https://huggingface.co/mradermacher/GRaPE-2.5-Quasar-GGUF
- Modelo base: https://huggingface.co/SL-AI/GRaPE-2.5-Quasar
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#GRaPE-2.5-Quasar-GGUF
- Solicitudes de cuantizacion y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos no guardan relacion con el mismo.
