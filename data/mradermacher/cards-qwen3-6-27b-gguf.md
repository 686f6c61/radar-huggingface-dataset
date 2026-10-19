# mradermacher/CARDS-Qwen3.6-27B-GGUF

## Resumen

`mradermacher/CARDS-Qwen3.6-27B-GGUF` es la version cuantizada en formato GGUF del modelo `C3DS/CARDS-Qwen3.6-27B-API`, un ajuste fino supervisado (SFT) sobre un modelo multimodal de la familia Qwen3 con 26.895.998.464 parametros (~26,9 B). El modelo original esta especializado en discurso climatico ("climate discourse") y clasificacion, y conserva la capacidad image-text-to-text heredada de su base, por lo que acepta imagenes y texto como entrada. Esta version la publica mradermacher, autor habitual de conversiones GGUF, y no introduce cambios en los pesos mas alla de la cuantizacion.

Su relevancia practica es que permite ejecutar un modelo de ~27 B con proyector multimodal en hardware de consumo o en servidores modestos mediante llama.cpp y derivados, algo inviable con los safetensors originales en F16 (unos 53,8 GB solo de pesos). El repo ofrece un abanico amplio de cuantizaciones estaticas, desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), mas los ficheros `mmproj` necesarios para la torre de vision.

La licencia Apache 2.0 y la vocacion de clasificacion sobre un dominio concreto (clima) lo hacen candidato para pipelines de analisis documental, etiquetado de corpus y moderacion tematica. Ahora bien, la model card es muy escasa: no publica longitud de contexto, volumen de tokens de entrenamiento ni resultados de benchmarks, por lo que cualquier evaluacion de calidad debe hacerse de forma empirica antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de la familia Qwen3; el detalle de capas y atencion no se especifica en la informacion disponible |
| Parametros totales | 26.895.998.464 (~26,9 B), segun safetensors del modelo base |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyectores multimodales `mmproj-Q8_0` y `mmproj-f16`; variantes imatrix en el repo `CARDS-Qwen3.6-27B-i1-GGUF` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base se distribuye en safetensors para `transformers` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de tipo SFT sobre una base Qwen3 multimodal de ~27 B, entrenado con el dataset `C3DS/cards_sft_dataset` y orientado a tareas de clasificacion y analisis de discurso climatico. La presencia de ficheros `mmproj` (proyector multimodal) confirma que mantiene la torre de vision: el modelo recibe pares imagen-texto y genera texto, algo coherente con el pipeline `image-text-to-text` declarado. No se detalla en la informacion disponible el número de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO posteriores al SFT.

La innovacion tecnica relevante de esta publicacion no esta en el modelo sino en la conversion: mradermacher genera cuantizaciones estaticas (K-quants e IQ) con metadatos de version de quantizacion 2 y tensor output quantised, y ofrece en paralelo un repo con cuantizaciones ponderadas/imatrix (`i1`), que suelen preservar mejor la perplejidad a tamanos equivalentes. Para usar la parte visual en llama.cpp es necesario cargar el GGUF principal junto con el `mmproj` correspondiente (`Q8_0`, 0,7 GB, o `f16`, 1,0 GB).

## Capacidades

- Clasificacion de texto en el dominio climatico: el tag `classification` y el fine-tune sobre `cards_sft_dataset` apuntan a etiquetado de discurso sobre cambio climatico.
- Analisis de discurso climatico ("climate discourse"): identificacion de posturas, argumentos y encuadres en textos sobre clima.
- Entrada multimodal image-text-to-text: acepta imagenes junto a texto y genera respuesta textual, segun el pipeline declarado y los ficheros `mmproj`.
- Generacion de texto conversacional: el tag `conversational` indica formato de chat multi-turno.
- Inferencia local via GGUF: compatible con llama.cpp, Ollama, LM Studio y bindings derivados.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, audio o agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Etiquetado de corpus climatico a escala: procesar articulos, informes o hilos de redes sociales y asignar etiquetas de postura o tematica. El fine-tune especifico sobre discurso climatico es precisamente el escenario para el que se entreno.
- Investigacion en comunicacion y ciencias sociales: anotacion asistida de muestras amplias de discurso publico sobre clima, con revision humana posterior para controlar falsos positivos.
- Moderacion tematica de comunidades: deteccion de mensajes negacionistas, catastrofistas o fuera de alcance en foros y secciones de comentarios, usando la salida del modelo como senal previa a la revision humana.
- Analisis de material visual climatico: con el `mmproj` cargado, describir o clasificar imagenes (capturas de prensa, graficos, material de campana) acompanadas de texto explicativo.
- Construccion de un clasificador ligero en produccion: destilar las etiquetas del modelo sobre un corpus grande y entrenar un modelo menor, usando el 27 B solo como anotador offline en GPU con Q8_0.
- Despliegue en estacion de trabajo sin conexion: con Q4_K_M (16,6 GB) cabe en una GPU de 24 GB y permite iterar sobre prompts y umbrales sin coste de API, util para prototipado en entornos con requisitos de confidencialidad.
- Enriquecimiento de pipelines RAG sobre literatura climatica: preprocesar y clasificar fragmentos documentales antes de indexarlos, de modo que la recuperacion pueda filtrar por tematica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repo cuantizado no incluye MMLU, HumanEval, GSM8K ni metricas de clasificacion, y tampoco se aportan comparaciones con el modelo base en F16. Cualquier cifra de calidad relativa entre cuantizaciones tendria que medirse localmente (por ejemplo, perplejidad sobre un split del propio `cards_sft_dataset`).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de cache KV y contexto, aproximada): Q2_K ~11-13 GB; Q3_K_M ~14-16 GB; IQ4_XS ~16-18 GB; Q4_K_M ~17-19 GB; Q5_K_M ~20-22 GB; Q6_K ~23-25 GB; Q8_0 ~29-31 GB; F16 ~54-56 GB. Sumar 0,7-1,0 GB si se carga la torre de vision.
- GPU consumer: Q4_K_S y Q4_K_M caben en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado; Q5 y Q6 quedan al limite y obligan a reducir contexto o descargar capas a CPU. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo entran Q2_K y Q3_K_S con comodidad.
- GPU profesional: Q8_0 y F16 requieren A100 40/80 GB, H100 80 GB o dos A100 40 GB. Para Q6_K basta una A100 40 GB con holgura.
- Memoria unificada: equipos Apple Silicon de 32 GB pueden ejecutar Q4_K_M; 64 GB permiten Q6_K y Q8_0 con contexto largo.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio, llama-cpp-python, text-generation-webui y, de forma experimental, el backend GGUF de vLLM. Para la parte multimodal hay que pasar explicitamente el fichero `mmproj`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens/s para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos externos comparables en la informacion proporcionada. La comparacion se limita a las variantes de la propia familia:

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `mradermacher/CARDS-Qwen3.6-27B-GGUF` (esta ficha) | ~26,9 B | GGUF estatico (Q2_K a Q8_0) | No disponible | Apache 2.0 | Conversion estatica; incluye `mmproj` para vision |
| `mradermacher/CARDS-Qwen3.6-27B-i1-GGUF` | ~26,9 B | GGUF imatrix/ponderado | No disponible | Apache 2.0 | Misma base, cuantizacion con imatrix; habitualmente mejor calidad a igual tamano |
| `C3DS/CARDS-Qwen3.6-27B-API` | ~26,9 B | Safetensors (F16/BF16) | No disponible | Apache 2.0 | Modelo original sin cuantizar; referencia de calidad maxima |
| `mradermacher/CARDS-Wind-Qwen3.6-27B-GGUF` | ~26,9 B | GGUF | No disponible | Apache 2.0 | Variante "Wind" de la misma familia; especializacion concreta no detallada en la informacion disponible |

Comparaciones con modelos de otros autores (por ejemplo, otras familias multimodales de ~30 B) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el campo `language` declara unicamente `en`; el rendimiento en castellano no esta documentado y previsiblemente sera degradado.
- Model card muy escasa: sin contexto declarado, sin datos de entrenamiento y sin benchmarks, no es posible estimar su calidad frente al modelo base ni frente a alternativas.
- Fine-tune de dominio: la especializacion en discurso climatico puede haber erosionado capacidades generales (conocimiento factual, matematicas, codigo) respecto a la base Qwen3 original.
- Riesgo de alucinacion: en tareas de clasificacion y anotacion, el modelo puede inventar justificaciones o etiquetas no sustentadas por el texto; se recomienda validacion humana en flujos de investigacion.
- Degradacion por cuantizacion: Q2_K y Q3_K_S pierden calidad de forma notable; para clasificacion fina conviene Q5_K_M o superior. Las cuantizaciones IQ e imatrix del repo `i1` suelen ser preferibles a igual tamano.
- Vision sensible al proyector: usar `mmproj-Q8_0` o `mmproj-f16`; con el proyector ausente el modelo no procesa imagenes aunque el pipeline lo declare.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume la responsabilidad sobre el cumplimiento de la atribucion y sobre el uso de los datos de entrada.
- Trazabilidad de la procedencia: al ser una conversion de terceros, conviene fijar el commit del repo y verificar hashes frente al modelo base antes de desplegar.
- Repo de 187,9 GB: aloja todas las cuantizaciones; la descarga selectiva de un unico fichero GGUF requiere usar clientes que soporten LFS/Xet correctamente.

## Enlaces

- Repo GGUF de este modelo: https://huggingface.co/mradermacher/CARDS-Qwen3.6-27B-GGUF
- Modelo base (safetensors): https://huggingface.co/C3DS/CARDS-Qwen3.6-27B-API
- Dataset de SFT: https://huggingface.co/datasets/C3DS/cards_sft_dataset
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/CARDS-Qwen3.6-27B-i1-GGUF
- Variante Wind de la misma familia: https://huggingface.co/mradermacher/CARDS-Wind-Qwen3.6-27B-GGUF
- Pagina de descarga del autor para este modelo: https://hf.tst.eu/model#CARDS-Qwen3.6-27B-GGUF
- Peticiones y FAQ de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del autor de la conversion (nethype GmbH): https://www.nethype.de/
