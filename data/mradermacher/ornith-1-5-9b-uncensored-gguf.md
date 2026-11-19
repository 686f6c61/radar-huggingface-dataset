# mradermacher/Ornith-1.5-9B-uncensored-GGUF

## Resumen

Ornith-1.5-9B-uncensored-GGUF es la distribucion en formato GGUF del modelo Ornith-1.5-9B-uncensored, un modelo de lenguaje multimodal (texto e imagen) de aproximadamente 8.950 millones de parametros desarrollado por el usuario junafinity y cuantizado por mradermacher. El modelo base se presenta como una variante "abliterated" y "uncensored" construida sobre la arquitectura etiquetada como qwen3_5, lo que sugiere una derivacion de la familia Qwen 3.5. Esta version GGUF es relevante porque permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos completos en precision nativa.

La relevancia practica de esta ficha radica en que el repositorio acumula mas de 1,6 millones de descargas y 287 likes, lo que indica una adopcion considerable dentro de la comunidad de inferencia local. El autor de la cuantizacion, mradermacher, es un actor consolidado en la publicacion de versiones GGUF de modelos abiertos, y ofrece tanto cuantizaciones estaticas (este repositorio) como versiones con imatrix en un repositorio separado. El modelo soporta conversacion, vision y un conjunto de cuantizaciones que van desde Q2_K (3,9 GB) hasta f16 (18,0 GB), mas los suplementos multimodales mmproj.

Conviene subrayar que la informacion disponible procede casi exclusivamente de la model card de la cuantizacion, que es escueta y no incluye detalles sobre el entrenamiento, los datos utilizados ni evaluaciones de rendimiento. Cualquier dato no presente en esa fuente se marca explicitamente como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5), multimodal texto-imagen |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card de la cuantizacion no describe la arquitectura interna mas alla de las etiquetas `qwen3_5`, `multimodal` y `vision`, lo que apunta a un transformer decoder-only con un proyector multimodal para imagenes (el archivo `mmproj` separado en el repositorio confirma la presencia de un codificador visual y una proyeccion hacia el espacio de tokens del modelo de lenguaje). El modelo base es `junafinity/Ornith-1.5-9B-uncensored`, del que no se aportan detalles sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO.

La etiqueta `abliterated` indica que el modelo ha sido sometido a una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, orientada a eliminar el comportamiento de negativa ante peticiones consideradas sensibles. No se especifica la metodologia exacta, el conjunto de datos de calibracion ni el impacto sobre capacidades generales. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Procesamiento de imagenes (vision) mediante el proyector multimodal incluido en los archivos `mmproj`.
- Comportamiento "uncensored" / "abliterated": menor tendencia a rechazar peticiones por politicas de contenido.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara `en`; no se documentan otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: con cuantizaciones Q4_K_M (5,7 GB) o Q5_K_M (6,6 GB) el modelo cabe en tarjetas de 8-12 GB de VRAM, lo que permite desplegar un modelo de 9B multimodal sin infraestructura de servidor.
- Analisis de documentos con imagenes en local: gracias al proyector `mmproj`, se pueden enviar capturas, diagramas o fotografias junto con instrucciones de texto para extraer informacion estructurada sin enviar datos a servicios externos.
- Asistentes conversacionales sin filtros editoriales: el caracter abliterated resulta util en entornos de investigacion sobre seguridad, red teaming y estudio de comportamiento de modelos, donde se necesita medir respuestas sin capas de rechazo.
- Prototipado rapido con llama.cpp u Ollama: el formato GGUF y la disponibilidad de cuantizaciones desde 3,9 GB permiten iterar en portatiles y equipos sin GPU dedicada, con CPU y RAM como unicos requisitos.
- Generacion de contenido creativo y narrativo sin restricciones tematicas: apropiado para escritura de ficcion, guiones o material editorial donde las politicas de contenido estandar resultan limitantes, siempre con revision humana.
- Evaluacion comparativa de tecnicas de abliteration: al existir el modelo base en safetensors y esta version cuantizada, se pueden comparar degradaciones de calidad entre cuantizaciones (Q2_K frente a Q8_0) sobre el mismo checkpoint.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia apache-2.0 facilita la integracion en productos comerciales, sujeta a las obligaciones de atribucion correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV):
  - Q2_K: aproximadamente 4-5 GB.
  - Q4_K_M: aproximadamente 6-7 GB.
  - Q6_K: aproximadamente 8-9 GB.
  - Q8_0: aproximadamente 10-11 GB.
  - f16: aproximadamente 18-20 GB.
- Vision: anadir el tamano del `mmproj` (0,7 GB en Q8_0, 1,0 GB en f16) a la VRAM total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas y contextos largos; A100 o H100 solo si se requiere f16 con contexto extendido o alto throughput.
- Cabe en GPU de consumo: si, desde Q4_K_M en tarjetas de 8 GB (con contexto moderado) y con holgura en 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints). vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores conviene el modelo base en safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-9B-uncensored (esta ficha) | 8,95B | no disponible | texto + vision | apache-2.0 | GGUF, safetensors (base) |
| Qwen2.5-VL-7B-Instruct | 7B aprox. | no disponible en esta ficha | texto + vision | apache-2.0 | safetensors, GGUF (comunidad) |
| Llama-3.2-11B-Vision-Instruct | 11B aprox. | no disponible en esta ficha | texto + vision | licencia comunitaria Llama | safetensors, GGUF (comunidad) |
| Gemma-3-12B-IT | 12B aprox. | no disponible en esta ficha | texto + vision | licencia Gemma | safetensors, GGUF (comunidad) |

La comparativa se limita a categoria y tamano, ya que no hay datos de rendimiento publicados para Ornith-1.5-9B-uncensored en la informacion disponible. La ventaja diferencial de este modelo frente a las alternativas citadas es su naturaleza abliterated y su licencia apache-2.0, mas permisiva que las licencias comunitarias de Llama o Gemma.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que el rendimiento real es desconocido.
- Riesgo elevado de alucinacion: los modelos abliterated suelen mostrar degradacion en calibracion y coherencia; sin datos de evaluacion no puede descartarse un impacto significativo.
- Contenido sin filtros: el caracter uncensored implica que el modelo puede generar material ofensivo, ilegal o peligroso. Requiere moderacion externa y supervision humana en cualquier despliegue de cara al publico.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Contexto: la longitud de contexto no se especifica en la model card, lo que impide planificar cargas de trabajo con documentos largos.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Trazabilidad limitada: el autor del modelo base (junafinity) no documenta datos de entrenamiento ni metodologia de abliteration, lo que dificulta auditar sesgos y comportamientos.
- Licencia: apache-2.0 permite uso comercial, pero no exime de responsabilidad legal sobre el contenido generado ni de las obligaciones de atribucion.
- Fecha de creacion y actualizacion del repositorio: 2026-08-20 y 2026-11-04 respectivamente, segun los metadatos de Hugging Face.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Ornith-1.5-9B-uncensored-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
