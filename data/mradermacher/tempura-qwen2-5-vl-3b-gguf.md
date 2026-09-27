# mradermacher/TEMPURA-Qwen2.5-VL-3B-GGUF

## Resumen

TEMPURA-Qwen2.5-VL-3B-GGUF es la version cuantizada en formato GGUF del modelo `andaba/TEMPURA-Qwen2.5-VL-3B`, un ajuste fino multimodal de Qwen2.5-VL-3B-Instruct orientado especificamente a tareas de video. La conversion la firma mradermacher, autor habitual de cuantizaciones GGUF para el ecosistema llama.cpp, e incluye tanto los pesos del modelo de lenguaje como los ficheros `mmproj` necesarios para procesar entradas visuales (imagen y video).

El modelo base cuenta con 3.397.103.616 parametros (aproximadamente 3,4 mil millones) y, segun las etiquetas declaradas, esta especializado en dense video captioning, temporal grounding, highlight detection y razonamiento sobre video. El entrenamiento se ha realizado sobre el dataset `andaba/TEMPURA-VER` y el unico idioma declarado es el ingles. No se han publicado resultados de benchmarks para este modelo en la informacion disponible.

La relevancia practica de esta ficha es doble. Por un lado, permite ejecutar un modelo de comprension de video de ~3,4B parametros en hardware de consumo, con cuantizaciones que van desde 1,5 GB (Q2_K) hasta 3,7 GB (Q8_0), mas el suplemento multimodal `mmproj`. Por otro, al derivar de la familia Qwen2.5-VL, se integra en el ecosistema habitual de transformadores multimodales y en herramientas de inferencia local como llama.cpp, Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo de lenguaje + encoder visual) derivado de la familia Qwen2.5-VL; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 3.397.103.616 (≈3,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos multimodales `mmproj` en f16 y Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | qwen-research (etiquetada como `other`; enlace a la licencia de Qwen2.5-VL-3B-Instruct) |
| Formato de pesos | GGUF (llama.cpp) |
| Repositorio | mradermacher/TEMPURA-Qwen2.5-VL-3B-GGUF |
| Modelo base | andaba/TEMPURA-Qwen2.5-VL-3B (a su vez derivado de Qwen/Qwen2.5-VL-3B-Instruct) |
| Dataset de entrenamiento | andaba/TEMPURA-VER |
| Tamano total del repositorio | 32,8 GB (todas las cuantizaciones juntas) |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

El repositorio no contiene un entrenamiento propio: es una cuantizacion estatica (`static quants`, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) del checkpoint `andaba/TEMPURA-Qwen2.5-VL-3B`, generada con las herramientas de llama.cpp. La arquitectura subyacente corresponde a la familia Qwen2.5-VL, un transformer denso multimodal que combina un encoder visual con un decodificador de lenguaje; el recuento real de parametros publicado en safetensors es de 3.397.103.616, lo que incluye tanto el componente de lenguaje como el visual.

Sobre el proceso de ajuste fino del modelo original solo se conoce el dataset empleado, `andaba/TEMPURA-VER`, y el foco tematico declarado en las etiquetas: video denso, grounding temporal, deteccion de highlights y razonamiento sobre video. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni sobre el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

Conviene senalar que el autor de la cuantizacion indica que las cuantizaciones ponderadas o con imatrix no estan disponibles por su parte en el momento de la publicacion, y que solo se han generado variantes estaticas.

## Capacidades

- Comprension de video multimodal: el modelo acepta entradas de video (ficheros GGUF con su correspondiente `mmproj`) y puede generar descripciones a nivel de escena.
- Dense video captioning: generacion de descripciones densas y detalladas del contenido de un video, no limitadas a un unico resumen por clip.
- Temporal grounding: localizacion de eventos o segmentos concretos dentro de una linea temporal de video.
- Highlight detection: identificacion de los fragmentos mas relevantes o destacados de un video.
- Video reasoning: razonamiento de varios pasos sobre el contenido visual y temporal.
- Interfaz conversacional: el modelo esta etiquetado como `conversational`, por lo que admite dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse tras APIs de inferencia compatibles con el formato transformers.
- Soporte multilingue limitado: unicamente ingles declarado.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni de modos de razonamiento extendido (thinking mode).

## Casos de uso

- Indexacion y resumen automatico de videotecas: el modelo puede generar descripciones densas de cada clip de un catalogo, lo que permite construir indices de busqueda semantica sobre archivos de video sin etiquetado manual.
- Deteccion de momentos destacados para edicion: en un pipeline de postproduccion, el modelo puede marcar los segmentos con mayor relevancia de un bruto de grabacion, reduciendo el tiempo de revision manual.
- Grounding temporal para busqueda interna: dado un video de larga duracion, el modelo localiza el intervalo concreto en el que ocurre un evento descrito en lenguaje natural, lo que resulta util en herramientas de busqueda sobre material audiovisual corporativo.
- Analisis de contenido moderado o compliance: revision automatica de videos para detectar y describir escenas concretas, con la ventaja de ejecutarse en local y no enviar material sensible a terceros.
- Accesibilidad audiovisual: generacion de descripciones o subtitulos enriquecidos para contenido en ingles, aprovechando su capacidad de captioning denso.
- Prototipado de agentes de video en local: al ser un GGUF de ~3,4B, se puede integrar en flujos experimentales con llama.cpp u Ollama para validar ideas de razonamiento temporal antes de escalar a modelos mayores.
- Investigacion en comprension temporal: como checkpoint ajustado y cuantizado de bajo coste, sirve como linea base reproducible en experimentos academicos sobre grounding y deteccion de highlights.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No constan cifras de MMLU, HumanEval, GSM8K ni de metricas especificas de video (por ejemplo, IoU de grounding temporal o metricas de captioning) para este modelo o para sus cuantizaciones.

## Requisitos de hardware

- Huella de pesos por cuantizacion (solo pesos del modelo de lenguaje, segun los tamanos de fichero publicados): Q2_K 1,5 GB; Q3_K_S 1,7 GB; Q3_K_M 1,8 GB; Q3_K_L 1,9 GB; IQ4_XS 2,0 GB; Q4_K_S 2,1 GB; Q4_K_M 2,2 GB; Q5_K_S y Q5_K_M 2,5 GB; Q6_K 2,9 GB; Q8_0 3,7 GB; f16 6,9 GB.
- Suplemento multimodal obligatorio para entrada visual: `mmproj-Q8_0` 0,9 GB o `mmproj-f16` 1,4 GB, que debe cargarse junto al modelo.
- VRAM estimada para inferencia: en torno a 3-4 GB con Q4_K_M mas `mmproj-Q8_0` en escenarios de contexto corto; el consumo real depende fuertemente del numero de frames de video incluidos en el contexto, ya que cada frame consume tokens de entrada y KV cache.
- GPU consumer: cabe holgadamente en tarjetas de 6-8 GB (por ejemplo, RTX 3060 6 GB/12 GB, RTX 4060, RTX 2070) con cuantizaciones Q4; en GPU de 4 GB conviene bajar a Q3 o Q2 o limitar el numero de frames.
- GPU profesional: A100, H100 o L40S no son necesarias para un modelo de este tamano, pero permiten procesar lotes grandes o contextos de video mas largos con mayor throughput.
- Apple Silicon: ejecutable via llama.cpp con Metal, con un consumo de memoria unificado similar al de las cifras de VRAM anteriores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y bindings derivados (llama-cpp-python) son las rutas naturales para GGUF. vLLM y TGI no soportan GGUF de forma nativa para este caso; para esos motores habria que servir el checkpoint original en safetensors con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TEMPURA-Qwen2.5-VL-3B-GGUF (mradermacher) | 3,4 B | GGUF (12+ cuantizaciones) | No disponible | Ingles | qwen-research (`other`) | HuggingFace |
| andaba/TEMPURA-Qwen2.5-VL-3B (original) | 3,4 B | safetensors | No disponible | Ingles | qwen-research | HuggingFace |
| Qwen/Qwen2.5-VL-3B-Instruct (modelo base de partida) | No disponible en la informacion proporcionada | safetensors | No disponible | Multilingue (segun su propia ficha) | qwen-research | HuggingFace |
| mradermacher/TEMPURA-Qwen2.5-VL-3B-s1-GGUF y -s2-GGUF | No disponible | GGUF | No disponible | Ingles | qwen-research | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia `qwen-research`: la propia ficha enlaza a la licencia de Qwen2.5-VL-3B-Instruct. Se trata de una licencia de investigacion con condiciones especificas que hay que revisar antes de cualquier uso comercial; no se debe asumir uso comercial libre.
- Idioma: solo se declara soporte para ingles. El rendimiento en castellano no esta documentado y probablemente sea degradado.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en ninguna tarea, ni en las variantes cuantizadas ni en el modelo original. Cualquier adopcion en produccion deberia ir precedida de una evaluacion propia.
- Perdida por cuantizacion: las variantes Q2_K, Q3_K_S y Q3_K_M tienen calidad notablemente inferior a Q4 o superiores; para tareas de grounding temporal, donde pequeños errores de localizacion importan, se recomienda Q5_K_M o Q6_K como minimo.
- Dependencia del `mmproj`: sin el fichero `mmproj` correspondiente, el modelo no procesa imagen ni video; las cuantizaciones del suplemento multimodal no son intercambiables entre repositorios distintos sin verificar compatibilidad.
- Riesgo de alucinacion: como cualquier modelo generativo, puede describir eventos que no aparecen en el video o situar mal los limites temporales, especialmente con videos largos o con muchas entradas visuales.
- Consumo de contexto no documentado: al no conocerse la longitud de contexto oficial del modelo, no se puede calcular con precision cuantos frames de video caben en una sola peticion.
- Sesgos: no hay informacion sobre la composicion de `andaba/TEMPURA-VER`, por lo que se desconocen los sesgos de dominio, idioma o contenido presentes en el ajuste fino.
- Madurez: el modelo tiene 0 descargas y 1 like en el momento de la consulta, y las cuantizaciones ponderadas o con imatrix no estan disponibles; es un artefacto reciente y poco validado por la comunidad.
- Incompatibilidad de motores: al ser GGUF, no se puede servir directamente con vLLM o TGI sin recurrir al checkpoint original en safetensors.

## Enlaces

- Modelo en HuggingFace (GGUF, mradermacher): https://huggingface.co/mradermacher/TEMPURA-Qwen2.5-VL-3B-GGUF
- Modelo base: https://huggingface.co/andaba/TEMPURA-Qwen2.5-VL-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/andaba/TEMPURA-VER
- Licencia del modelo base (Qwen2.5-VL-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Pagina de resumen de descargas del cuantizador: https://hf.tst.eu/model#TEMPURA-Qwen2.5-VL-3B-GGUF
- Variante s1 en GGUF: https://huggingface.co/mradermacher/TEMPURA-Qwen2.5-VL-3B-s1-GGUF
- Variante s2 en GGUF: https://huggingface.co/mradermacher/TEMPURA-Qwen2.5-VL-3B-s2-GGUF
- Otro ajuste relacionado del mismo autor: https://huggingface.co/mradermacher/Qwen2.5-VL-3B-HMDB-FT-GGUF
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre tipos de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Empresa que da soporte al cuantizador: https://www.nethype.de/
