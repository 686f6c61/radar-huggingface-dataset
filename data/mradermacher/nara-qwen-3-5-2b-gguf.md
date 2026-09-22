# mradermacher/nara-qwen-3.5-2b-GGUF

## Resumen

nara-qwen-3.5-2b-GGUF es el repositorio de cuantizaciones estáticas en formato GGUF del modelo wjbmattingly/nara-qwen-3.5-2b, publicado por mradermacher. Se trata de un modelo de visión-lenguaje de aproximadamente 1.881.825.088 parámetros (unos 1,88 mil millones) especializado en reconocimiento óptico de caracteres (OCR) y reconocimiento de texto manuscrito (HTR), con un enfoque declarado en patrimonio cultural, humanidades digitales y archivos, tomando como referencia el ámbito del NARA (National Archives and Records Administration de Estados Unidos).

La relevancia de esta publicación no está en el modelo base, sino en la disponibilidad de versiones cuantizadas que reducen el peso de 3,9 GB en f16 hasta 1,1 GB en Q2_K, lo que permite ejecutar un modelo multimodal de transcripción documental en hardware de consumo o incluso en CPU. El repositorio incluye además dos ficheros de proyección multimodal (mmproj) en Q8_0 y f16, imprescindibles para que el modelo pueda procesar imágenes dentro del ecosistema llama.cpp.

El modelo base deriva de la familia Qwen 3.5 y está etiquetado como conversational, con licencia Apache 2.0 y soporte declarado únicamente de inglés. No se han publicado resultados de benchmarks, longitud de contexto ni detalles de entrenamiento en la información disponible, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3.5 y vision-language; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base esta en formato HuggingFace/transformers |
| Modelo base | wjbmattingly/nara-qwen-3.5-2b |
| Cuantizado por | mradermacher (nethype GmbH) |
| Tamano del repositorio | 19,1 GB |
| Fecha de publicacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Las etiquetas del repositorio indican que se trata de un modelo de vision-lenguaje (vision-language) construido sobre la familia Qwen 3.5, con un total de 1,88 mil millones de parametros y capacidad conversacional. El repositorio cuantizado incluye ficheros mmproj, lo que confirma que el modelo incorpora un proyector multimodal que traduce representaciones visuales al espacio de embeddings del modelo de lenguaje; sin ese fichero, la inferencia sobre imagenes no es posible en llama.cpp.

En cuanto al entrenamiento, la model card del repositorio de cuantizacion no aporta informacion sobre el numero de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La unica referencia a datos es el dataset wjbmattingly/si-test, citado como dataset asociado al modelo base. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modos de razonamiento, etc.). Esta cuantizacion es de tipo estatico y, segun la propia model card, no se han publicado versiones con imatrix ni cuantizaciones ponderadas por el autor en el momento de la publicacion.

## Capacidades

- Reconocimiento de texto manuscrito (HTR): el modelo esta especializado en transcribir documentos manuscritos, con etiquetas explicitas de htr, handwritten-text-recognition y archives.
- OCR sobre documentos impresos y digitalizados, orientado a material de archivo y patrimonio cultural.
- Procesamiento de entradas multimodales (imagen + texto) mediante el proyector mmproj incluido en el repositorio.
- Generacion de texto conversacional a partir de la transcripcion, al estar etiquetado como conversational.
- Aplicacion en dominios de humanidades digitales y preservacion documental, segun la orientacion declarada por el autor del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento Multi-step: no disponible en la informacion proporcionada.
- Capacidades multilingues: no; el modelo declara unicamente ingles (en).
- Capacidades especiales adicionales (audio, thinking mode explicito, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de fondos manuscritos en archivos historicos: el modelo puede transcribir correspondencia, actas notariales, registros parroquiales o expedientes administrativos a partir de imagenes de las paginas, generando texto plano apto para su volcado en un sistema de gestion documental.
- Proyectos de humanidades digitales: investigadores que necesitan convertir corpus manuscritos en texto consultable pueden ejecutar el modelo en local con Q4_K_M o Q5_K_M y revisar despues las transcripciones, evitando enviar material sensible o con derechos a servicios en la nube.
- Indexacion y busqueda full-text en repositorios de patrimonio cultural: la transcripcion generada por el modelo alimenta indices de busqueda que permiten localizar nombres, toponimos o fechas dentro de colecciones que antes solo eran consultables por imagen.
- Procesamiento por lotes en servidores sin GPU: las cuantizaciones Q2_K a Q4_K_S (1,1 a 1,3 GB) permiten ejecutar la transcripcion en CPU con llama.cpp, lo que resulta adecuado para pipelines nocturnos de digitalizacion masiva en instituciones con presupuesto limitado.
- Despliegue offline en salas de consulta de archivos: al ser un modelo de 1,88 B de parametros con pesos de 1 a 4 GB, se puede instalar en un equipo de sobremesa o portatil sin conexion, cumpliendo requisitos de confidencialidad sobre documentos no publicados.
- Accesibilidad de fondos documentales: convertir documentos manuscritos digitalizados a texto permite generar versiones compatibles con lectores de pantalla y facilitar el acceso a personas con discapacidad visual.
- Transcripcion asistida con revisor humano (human-in-the-loop): dado el riesgo de error inherente a un modelo de 2 B en documentos degradados, el caso realista es usarlo como primera pasada y que un paleografo corrija el resultado, reduciendo el tiempo de transcripcion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el fichero GGUF del repositorio: Q2_K 1,1 GB; Q3_K_S 1,1 GB; Q3_K_M 1,2 GB; Q3_K_L 1,3 GB; IQ4_XS 1,3 GB; Q4_K_S 1,3 GB; Q4_K_M 1,4 GB; Q5_K_S 1,5 GB; Q5_K_M 1,5 GB; Q6_K 1,7 GB; Q8_0 2,1 GB; f16 3,9 GB.
- La parte multimodal anade 0,5 GB (mmproj-Q8_0) o 0,8 GB (mmproj-f16) que deben cargarse junto al modelo para procesar imagenes.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2060, GTX 1660 con 6 GB) puede ejecutar las cuantizaciones Q4 y Q5 junto con el proyector. Los ficheros f16 (3,9 GB) tambien caben en tarjetas de 8 GB.
- En CPU, las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor del repositorio ("fast, recommended"); Q6_K se marca como "very good quality" y Q8_0 como "fast, best quality".
- GPU de datacenter (A100, H100) no son necesarias para este tamano de modelo; su uso solo tendria sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp (incluida la CLI multimodal para mmproj), Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF. Para vLLM o TGI habria que usar el modelo base en formato safetensors, ya que esos motores no consumen GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/nara-qwen-3.5-2b-GGUF (este repositorio) | ~1,88 B | GGUF (12 cuantizaciones + 2 mmproj) | no disponible | apache-2.0 | Cuantizacion estatica; sin imatrix; 0 descargas |
| wjbmattingly/nara-qwen-3.5-2b (modelo base) | ~1,88 B | safetensors / transformers | no disponible | apache-2.0 | Pesos originales sin cuantizar; requiere GPU y pila transformers |
| Otros modelos de OCR/HTR de tamano comparable | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se debe esperar un rendimiento fiable en castellano ni en otras lenguas.
- Se trata de un ajuste fino especializado en OCR/HTR sobre material de archivo; es previsible que su comportamiento como asistente generalista sea inferior al de un modelo conversacional generico del mismo tamano, aunque no hay datos publicados que lo cuantifiquen.
- Riesgo de alucinacion en la transcripcion: un modelo de ~1,88 B puede generar texto plausible que no aparece en la imagen, especialmente con documentos degradados, caligrafias dificiles o baja resolucion. Se recomienda validacion humana en contextos criticos.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia comunitaria de calidad ni de reproducibilidad de resultados.
- No se han publicado benchmarks, ni datos de contexto, ni detalles del dataset de entrenamiento, lo que dificulta estimar su comportamiento fuera del dominio previsto.
- Las cuantizaciones agresivas (Q2_K y Q3_K_S, ~1,1 GB) degradan la calidad de forma notable; para transcripcion documental conviene partir de Q5_K_M o superior.
- No se documenta soporte de tool calling ni de flujos de agente, por lo que no se debe asumir su integracion en pipelines que dependan de function calling.
- La licencia declarada es apache-2.0, que permite uso comercial, pero conviene verificar los terminos de la familia Qwen 3.5 subyacente antes de un despliegue en produccion.
- La fecha de publicacion indicada en los metadatos (22 de septiembre de 2026) es posterior a la fecha de consulta habitual de fuentes; conviene comprobar la ficha de HuggingFace por si los metadatos se han actualizado.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenidos sin relacion (preparacion de examenes LSAT), por lo que no aportan informacion tecnica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nara-qwen-3.5-2b-GGUF
- Modelo base: https://huggingface.co/wjbmattingly/nara-qwen-3.5-2b
- Dataset asociado: https://huggingface.co/datasets/wjbmattingly/si-test
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#nara-qwen-3.5-2b-GGUF
- Solicitudes de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la cuantizacion (nethype GmbH): https://www.nethype.de/
