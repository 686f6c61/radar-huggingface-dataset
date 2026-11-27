# OpenMOSS-Team/MOSS-VL-Instruct-0408

## Resumen

MOSS-VL-Instruct-0408 es un modelo vision-lenguaje multimodal desarrollado por OpenMOSS (equipo vinculado a fnlp-vision) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata del checkpoint ajustado por instrucciones (SFT) de la familia MOSS-VL, construido sobre MOSS-VL-Base-0408. El modelo resuelve tareas de comprension de imagen y video, con especial enfasis en video de larga duracion, razonamiento temporal, reconocimiento de acciones y localizacion de eventos a nivel de segundo.

Con 11.336 millones de parametros en formato safetensors y un repositorio de 22,7 GB, el modelo emplea una arquitectura basada en cross-attention que desacopla la codificacion visual del razonamiento cognitivo, lo que segun el autor reduce la latencia a nivel de milisegundos para interaccion con flujos de video en tiempo real. Soporta modalidades intercaladas (imagenes y videos en una misma secuencia) de forma nativa y esta orientado tanto a inferencia offline como a escenarios de streaming.

Su relevancia actual radica en que compite directamente con la serie Qwen3-VL en tareas de video, con resultados declarados superiores en Video Understanding (65,8 frente a Qwen3-VL) y una ventaja de 8,3 puntos en VSI-bench sobre Qwen3-VL-8B-Instruct. La informacion disponible no detalla la longitud de contexto ni los tipos de cuantizacion soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cross-attention (vision-lenguaje desacoplados) y XRoPE (Cross-attention Rotary Position Embedding) |
| Parametros totales | 11.336.371.208 (11,34 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

MOSS-VL-Instruct-0408 se basa en una arquitectura de cross-attention que separa la codificacion visual del modulo de razonamiento linguistico. Esta separacion permite procesar secuencias de imagenes y videos de forma intercalada en un unico pipeline, sin preprocesamiento pesado, y habilita respuestas con latencia de milisegundos sobre flujos de video dinamicos. El modelo incorpora dos innovaciones tecnicas destacadas: la inyeccion de marcas de tiempo absolutas (absolute timestamps) junto a cada fotograma muestreado, que ancla el razonamiento en una referencia temporal precisa, y XRoPE, un mecanismo de RoPE adaptado a la cross-attention que proyecta tokens de texto y parches de video en un espacio de coordenadas 3D unificado (tiempo, altura, anchura).

El entrenamiento parte de MOSS-VL-Base-0408 y aplica supervised fine-tuning (SFT) sobre datos de instrucciones multimodales diversos para mejorar el seguimiento de instrucciones y la alineacion con la intencion del usuario. La informacion proporcionada no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO adicionales. El pipeline declarado es `video-text-to-text` y el modelo requiere codigo personalizado (`custom_code`) para su carga.

## Capacidades

- Comprension de imagenes: reconocimiento de objetos de grano fino, comprension imagen-texto general y razonamiento espacial (benchmarks BLINK y MMBench).
- Comprension de video de larga duracion: comprension de video extenso, razonamiento temporal, reconocimiento de acciones y localizacion de eventos a nivel de segundo.
- OCR y analisis de documentos: extraccion de texto y de informacion estructurada, con una puntuacion declarada de 83,9 en OCR y analisis documental.
- Razonamiento visual multimodal: inferencia logica sobre contenido visual, competitiva con la serie Qwen en suites de razonamiento.
- Seguimiento de instrucciones multimodales mejorado mediante SFT.
- Procesamiento nativo de modalidades intercaladas: imagenes y videos en una misma secuencia sin preprocesamiento pesado.
- Percepcion temporal precisa gracias a la inyeccion de marcas de tiempo absolutas por fotograma.
- Interaccion en tiempo real con flujos de video (streaming), con latencia declarada de nivel de milisegundos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de video de vigilancia y monitorizacion: el modelo puede localizar eventos a nivel de segundo y reconocer acciones en grabaciones de larga duracion gracias a su comprension temporal y a las marcas de tiempo absolutas, lo que permite generar alertas o resumenes cronologicos.
- Moderacion de contenido audiovisual: procesaria flujos de video para identificar escenas o acciones concretas, apoyandose en la comprension de video de larga duracion y en la modalidad intercalada para combinar fotogramas con texto de politicas.
- Extraccion de datos de documentos escaneados: con su rendimiento en OCR y analisis documental (83,9 declarado), puede digitalizar facturas, formularios y contratos, extrayendo campos estructurados para pipelines de back office.
- Descripcion automatica de video para accesibilidad: generaria descripciones textuales de contenido visual y eventos temporales, aprovechando el razonamiento temporal para narrar la secuencia de acciones.
- Analisis de video deportivo o de entrenamiento: reconocimiento de acciones y localizacion de eventos permitiria generar informes tecnicos con marcas temporales de jugadas o movimientos concretos.
- Asistencia en revision de contenido audiovisual para medios: resumen y segmentacion de video largo en escenas o eventos, con marcas de tiempo, para facilitar tareas de edicion y catalogacion.
- Interaccion en tiempo real con camaras o streams: su arquitectura de cross-attention con latencia de milisegundos lo hace adecuado para asistentes que responden a un flujo de video en directo, como soporte remoto o inspeccion industrial.
- Analisis de imagenes tecnicas y razonamiento espacial: con su rendimiento en BLINK y MMBench, puede emplearse en tareas de inspeccion visual, reconocimiento de objetos de grano fino y comprension de diagramas.

## Benchmarks y rendimiento

Los datos disponibles en la model card son agregados y parciales; no se ofrece la tabla completa de resultados por benchmark.

| Metrica / benchmark | Resultado declarado |
|---|---|
| Video Understanding (agregado) | 65,8 (supera a Qwen3-VL en +2 puntos) |
| VSI-bench (frente a Qwen3-VL-8B-Instruct) | +8,3 puntos |
| OCR y analisis documental (agregado) | 83,9 |
| VideoMME | evaluado, sin cifra publicada en la informacion disponible |
| MLVU | evaluado, sin cifra publicada en la informacion disponible |
| EgoSchema | evaluado, sin cifra publicada en la informacion disponible |
| BLINK | evaluado, sin cifra publicada en la informacion disponible |
| MMBench | evaluado, sin cifra publicada en la informacion disponible |

No se han publicado en la informacion disponible cifras detalladas por benchmark (MMLU, HumanEval, GSM8K u otros) ni la tabla completa de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 22,7 GB solo para pesos, mas overhead de activaciones y cache; se recomienda un minimo de 24 GB y, para secuencias de video largas, 40-80 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 (80 GB) para video de larga duracion y lotes mayores; RTX 4090 (24 GB) puede ser suficiente para imagen individual o video corto en bfloat16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) para casos de imagen o video corto; en GPUs de 16 GB requeriria cuantizacion, cuyos formatos no estan documentados en la informacion disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True`, `device_map="auto"` y `flash_attention_2` segun el ejemplo de la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor declara latencia de nivel de milisegundos para respuestas a flujos de video dinamicos; no se publican cifras de throughput (tokens/s) ni de latencia por tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Video Understanding | Licencia | Idiomas |
|---|---|---|---|---|---|
| MOSS-VL-Instruct-0408 | 11,34 B | no disponible | 65,8 (agregado) | Apache 2.0 | en, zh |
| Qwen3-VL | no disponible en la informacion | no disponible | inferior en ~2 puntos segun el autor | no disponible en la informacion | no disponible en la informacion |
| Qwen3-VL-8B-Instruct | 8 B (por denominacion) | no disponible | inferior en 8,3 puntos en VSI-bench | no disponible en la informacion | no disponible en la informacion |

La comparativa se limita a los datos que el autor declara frente a la serie Qwen3-VL; no se dispone de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto: no se publica la ventana de contexto, lo que dificulta planificar el procesamiento de videos muy largos o documentos extensos.
- Alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad en OCR o descripcion de video; en tareas de extraccion de texto conviene validar las salidas.
- Sesgos: no se publica informacion sobre sesgos demograficos, culturales o de contenido en los datos de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero al requerir `trust_remote_code=True` se ejecuta codigo del repositorio del autor, lo que implica una revision de seguridad previa en entornos de produccion.
- Dependencias: el modelo necesita codigo personalizado y la libreria transformers con soporte para `moss_vl`; la compatibilidad con otros runtimes (vLLM, llama.cpp) no esta documentada.
- Cuantizacion: no se documentan formatos GGUF, AWQ o GPTQ, lo que limita el despliegue en hardware de gama media.
- Tool calling y agentes: no se confirma soporte, por lo que no debe asumirse en disenos de pipelines agenticos.
- Madurez: el checkpoint tiene pocas descargas (153) y la informacion de benchmarks es agregada, sin tabla detallada verificable.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0408
- Modelo base: https://huggingface.co/fnlp-vision/MOSS-VL-Base-0408
- Web oficial de MOSS AI: https://www.moss-ai.com/models/moss-vl
- Documentacion de la API MOSS (comprension de imagen y video): https://platform.moss.cn/en/docs/scenarios/image-video-understanding
- Informe tecnico (arXiv 2608.15045): https://arxiv.org/pdf/2608.15045
- Referencia adicional citada en los tags (arXiv 2606.07639): https://arxiv.org/abs/2606.07639
