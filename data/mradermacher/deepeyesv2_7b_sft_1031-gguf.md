# mradermacher/DeepEyesV2_7B_SFT_1031-GGUF

## Resumen

DeepEyesV2_7B_SFT_1031-GGUF es la version cuantizada en formato GGUF del modelo DeepEyesV2_7B_SFT_1031, publicado por el usuario honglyhly, y convertida por mradermacher, un conocido generador de cuantizaciones estaticas para llama.cpp. El modelo base es un transformer multimodal (se distribuye un fichero mmproj separado para el proyector visual) de aproximadamente 7.615 millones de parametros, lo que lo situa en la categoria de 7B. La nomenclatura "DeepEyes" sugiere un enfasis en percepcion visual y razonamiento sobre imagenes, aunque la model card original no documenta detalles de arquitectura ni de entrenamiento.

El interes practico de esta publicacion reside en la disponibilidad de cuantizaciones GGUF que permiten ejecutar un modelo multimodal de 7B en hardware de consumo, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), e incluye variantes del proyector multimodal (mmproj) en Q8_0 y f16. El repositorio ocupa 70,4 GB en total por acumulacion de todas las variantes.

La informacion publicada es escasa: no se detalla licencia, pipeline, longitud de contexto ni composicion del dataset de entrenamiento. Cualquier evaluacion en produccion deberia acompanarse de una validacion propia antes de adoptarlo, dado que la model card del cuantizador se limita a describir el proceso de conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base + proyector visual mmproj); detalles no disponibles |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con fichero mmproj separado para el componente multimodal) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer multimodal con proyector visual separado, inferido por la presencia de ficheros mmproj en el repositorio. El sufijo "SFT" en el nombre indica que el modelo base fue sometido a un ajuste supervisado (supervised fine-tuning), aunque no se especifica el dataset, el numero de tokens ni si hubo etapas posteriores de RLHF o DPO.

Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. El trabajo del cuantizador se limita a la conversion estatica a GGUF sin cuantizaciones ponderadas por imatrix, segun indica la propia model card. Para reproducir o auditar el entrenamiento seria necesario consultar el repositorio del modelo base honglyhly/DeepEyesV2_7B_SFT_1031.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Procesamiento de imagenes: la presencia de ficheros mmproj confirma soporte multimodal de entrada visual.
- Razonamiento sobre imagenes y texto combinados (inferido del nombre "DeepEyes" y del componente visual, no documentado explicitamente).
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles en la informacion publicada.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede recibir una imagen de una pagina y generar una descripcion o extraccion de texto en ingles, aprovechando el proyector visual incluido en el repositorio.
- Asistencia en tareas de vision por computador de prototipado: util para generar descripciones de imagenes en pipelines de etiquetado semiautomatico antes de entrenar un modelo especializado.
- Despliegue en portatil o estacion de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (4,8 GB) permiten ejecutar el modelo completo con vision en GPUs de 8 GB de VRAM mediante llama.cpp.
- Chat multimodal local con fines de investigacion: permite experimentar con interacciones imagen-texto sin depender de APIs externas, util para pruebas de privacidad de datos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion mas dos del proyector, lo que facilita estudios de degradacion de calidad frente a tamano.
- Educacion y docencia: por su tamano moderado y su formato GGUF, sirve como ejemplo practico de despliegue de modelos multimodales en cursos de IA aplicada.
- Integracion en herramientas de escritorio con Ollama o llama.cpp: al ser GGUF, puede cargarse en interfaces locales que ya soportan modelos multimodales con mmproj.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin contar el proyector ni el contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- Proyector multimodal adicional: 1,0 GB (mmproj-Q8_0) o 1,5 GB (mmproj-f16).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en adelante para cuantizaciones Q4-Q8; A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB con Q4_K_M mas mmproj-Q8_0 (aproximadamente 5,8 GB en total, dejando margen para contexto y cache KV).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF y mmproj; vLLM y TGI no consumen GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| DeepEyesV2_7B_SFT_1031 (este) | ~7,6B | no disponible | si (mmproj) | no disponible | GGUF |
| Qwen2.5-VL-7B-Instruct | ~7,6B | 128K (segun documentacion publica del modelo) | si | Apache 2.0 (segun documentacion publica) | safetensors, GGUF |
| LLaVA-1.6 / LLaVA-OneVision 7B | ~7B | variable segun variante | si | Apache 2.0 / Llama segun variante | safetensors, GGUF |
| InternVL2-8B | ~8B | variable | si | MIT (segun documentacion publica) | safetensors, GGUF |

La comparativa se ofrece como referencia de categoria; los datos de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta ficha. Para DeepEyesV2 no hay datos de rendimiento ni de contexto que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor del modelo base antes de un despliegue en produccion.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion, por lo que el riesgo de alucinacion y de respuestas sesgadas no puede acotarse.
- La longitud de contexto es desconocida; asumir ventanas largas sin validacion puede provocar degradacion silenciosa.
- El modelo base es una publicacion de un usuario individual (honglyhly) con pocas descargas, sin evidencia de validacion externa.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- El repositorio ocupa 70,4 GB por incluir todas las variantes; conviene descargar solo los ficheros necesarios.
- No se han publicado cuantizaciones ponderadas por imatrix para este modelo, lo que limita la calidad de las variantes de baja precision.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeepEyesV2_7B_SFT_1031-GGUF
- Modelo base: https://huggingface.co/honglyhly/DeepEyesV2_7B_SFT_1031
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#DeepEyesV2_7B_SFT_1031-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
