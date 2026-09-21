# mradermacher/iz-instruct-GGUF

## Resumen

iz-instruct-GGUF es la version cuantizada en formato GGUF del modelo theplayboy117/iz-instruct, un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-1.5B-Instruct. La conversion y publicacion la realiza mradermacher, un autor conocido en HuggingFace por generar cuantizaciones GGUF estaticas de modelos de terceros con la herramienta llama.cpp. El repositorio no contiene un modelo nuevo: contiene el mismo modelo de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) redistribuido en 12 niveles de cuantizacion distintos.

El problema que resuelve es puramente de despliegue: los pesos originales en safetensors no se pueden ejecutar directamente con llama.cpp, Ollama o LM Studio, mientras que estas versiones GGUF si, con tamanos que van desde 0,8 GB (Q2_K) hasta 3,2 GB (f16). Esto permite ejecutar el modelo en CPU, en GPUs de gama baja o en equipos con poca memoria unificada, algo relevante para prototipado local, pruebas de adaptaciones LoRA y despliegues en el borde.

La relevancia es limitada y conviene ser explicito: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no publica resultados de benchmarks y solo documenta soporte para ingles. Se trata de un artefacto derivado de otro modelo derivado, sin validacion independiente conocida ni model card propia mas alla de la plantilla habitual del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen2.5-1.5B-Instruct; no confirmada en la model card de esta ficha) |
| Parametros totales | 1.543.714.304 (dato real, safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens segun el modelo base Qwen2.5-1.5B-Instruct; no confirmado para este ajuste |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas; los originales son safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder con atencion de consultas agrupadas (GQA), normalizacion RMSNorm pre-normalizada, activacion SwiGLU y embeddings rotatorios (RoPE), con 28 capas, 12 cabezas de atencion y 2 cabezas de clave/valor. Estos datos proceden del modelo base publico y no estan verificados en la model card de iz-instruct-GGUF, por lo que deben tratarse como herencia probable y no como especificacion confirmada del autor.

Sobre el entrenamiento no hay informacion: la unica pista tecnica es la etiqueta `base_model:adapter:Qwen/Qwen2.5-1.5B-Instruct` junto con la etiqueta `lora`, lo que indica que theplayboy117/iz-instruct se construyo como un adaptador LoRA sobre el modelo instruct de Qwen y que los pesos de este repositorio son el resultado de cuantizar ese modelo. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si hubo mezcla de datos sinteticos, si se aplico DPO o RLHF, y si el adaptador se fusiono con los pesos base antes de la conversion a GGUF. El unico detalle de proceso aportado por el cuantizador es que se trata de cuantizaciones estaticas, sin importancias ni matriz de calibracion (no hay quants ponderados ni imatrix disponibles), con `convert_type: hf` y `output_tensor_quantised: 1`.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones de un solo turno o multiturno, heredadas del ajuste instruct de Qwen2.5-1.5B.
- Generacion de codigo y resolucion de tareas sencillas de programacion, limitada por el tamano de 1,5B parametros.
- Razonamiento basico y aritmetica de pocos pasos; sin cadena de pensamiento explicita documentada.
- Capacidad multilingue reducida: los metadatos declaran unicamente `en`, aunque el modelo base Qwen2.5 es multilingue (28 idiomas declarados por Qwen). El ajuste LoRA puede haber degradado idiomas distintos del ingles.
- Tool calling / function calling: el modelo base Qwen2.5-1.5B-Instruct incluye plantilla de chat compatible con llamadas a funciones, pero no hay documentacion que confirme que este ajuste LoRA conserve esa capacidad; es probable que se haya degradado.
- Soporte de agentes y razonamiento multipaso: no documentado; poco realista a esta escala sin herramientas externas.
- Capacidades especiales (vision, audio, thinking mode): ninguna. No hay modalidad adicional.
- Uso como base para experimentacion: el repositorio incluye 12 niveles de cuantizacion, util para medir degradacion por compresion en un modelo pequeno.

## Casos de uso

- Prototipado local sin GPU dedicada: con la cuantizacion Q4_K_S o Q4_K_M (alrededor de 1,0-1,1 GB) el modelo cabe en cualquier portatil con 4-8 GB de RAM libre y se ejecuta con llama.cpp u Ollama, lo que permite validar una interfaz conversacional antes de invertir en infraestructura.
- Chatbot de asistencia en ingles para dominios acotados: el modelo puede gestionar conversaciones multiturno con contexto largo gracias a la ventana heredada de 32.768 tokens del modelo base, siempre que el ajuste LoRA no la haya recortado; encaja en asistentes de FAQ o formularios guiados.
- Generacion de codigo en tareas de autocompletado o transformacion sencilla: convertir fragmentos entre lenguajes, generar expresiones regulares o escribir tests unitarios basicos, integrable en un hook local de edicion con latencia baja.
- Clasificacion y extraccion de informacion: uso como modelo de anotacion en pipelines de etiquetado (sentimiento, intencion, entidades) donde el coste por token es practicamente nulo al ejecutarse en local.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir la perdida de perplejidad entre Q2_K, Q4_K_M y Q8_0 sobre el mismo conjunto de prompts, algo util para calibrar politicas de despliegue en modelos pequenos.
- Educacion y experimentacion con LoRA: sirve como ejemplo practico de cadena completa adaptador LoRA, fusion, conversion a GGUF y cuantizacion, util en cursos o talleres de IA aplicada.
- Despliegue en el borde con recursos muy limitados: la cuantizacion Q2_K (0,8 GB) permite ejecucion en dispositivos con menos de 1 GB de memoria disponible, asumiendo una degradacion de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a la plantilla habitual del cuantizador (tabla de cuantizaciones, enlaces de descarga y notas sobre herramientas) y no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco hay datos de evaluacion en el modelo de origen dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM para los pesos, segun cuantizacion: Q2_K 0,8 GB; Q3_K_S 0,9 GB; Q3_K_M 0,9 GB; Q3_K_L 1,0 GB; IQ4_XS 1,0 GB; Q4_K_S 1,0 GB; Q4_K_M 1,1 GB; Q5_K_S 1,2 GB; Q5_K_M 1,2 GB; Q6_K 1,4 GB; Q8_0 1,7 GB; f16 3,2 GB.
- Memoria adicional para la cache KV: con la configuracion heredada del modelo base (28 capas, 2 cabezas KV, dimension de cabeza 128) la cache en fp16 ocupa aproximadamente 28 KB por token, es decir, en torno a 0,9 GB al llenar los 32.768 tokens de contexto. Con contexto de 4.096 tokens la cache baja a unos 115 MB.
- Estimacion de VRAM total (pesos + cache): Q4_K_M con 4K de contexto alrededor de 1,3 GB; Q4_K_M con 32K de contexto alrededor de 2,1 GB; f16 con 32K de contexto alrededor de 4,2 GB. Son calculos derivados de los tamanos publicados, no medidas del autor.
- GPU compatibles: cabe con holgura en RTX 3060 12 GB, RTX 4060, RTX 2060 6 GB, GTX 1660 6 GB, Tesla T4 16 GB y Apple Silicon con memoria unificada. Cabe tambien en GPUs de 4 GB si se usa Q4_K_M o inferior con contexto recortado. No necesita A100 ni H100 salvo para servir muchas peticiones concurrentes.
- Ejecucion en CPU: viable sin GPU con llama.cpp o Ollama; es el escenario mas realista para este tamano de modelo.
- Opciones de despliegue: llama.cpp (cli y servidor), Ollama, LM Studio, llama-cpp-python, kobold.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente: requeririan los pesos safetensors del modelo original theplayboy117/iz-instruct.
- Latencia y throughput: no disponibles como datos medidos. Como referencia orientativa no verificada, un modelo de 1,5B en Q4_K_M suele generar del orden de 10 a 30 tokens por segundo en CPU moderna y de 80 a 200 tokens por segundo en GPU de gama media. Son estimaciones de orden de magnitud, no cifras del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| iz-instruct-GGUF (esta ficha) | 1,54B | 32.768 tokens (heredado, no confirmado) | No disponible | GGUF en HuggingFace; 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | safetensors y GGUF de terceros; muy extendido |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | safetensors y GGUF; ampliamente desplegado |
| SmolLM2 1.7B Instruct | 1,71B | 8.192 tokens | Apache 2.0 | safetensors y GGUF; buena adopcion |
| Gemma 2 2B IT | 2,61B | 8.192 tokens | Licencia de Gemma | safetensors y GGUF; adopcion alta |

La comparacion relevante es contra Qwen2.5-1.5B-Instruct: iz-instruct parte de el y aporta un ajuste LoRA del que no se documenta ni el dataset ni los beneficios. En ausencia de benchmarks no hay ninguna evidencia de que supere al modelo base en ninguna tarea, mientras que si renuncia a su licencia Apache 2.0 declarada y a su soporte multilingue documentado.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, un uso en produccion queda en situacion de incertidumbre legal, agravada porque el modelo base Qwen2.5-1.5B-Instruct es Apache 2.0 pero el adaptador LoRA no declara condiciones.
- Cero validacion externa: 0 descargas y 0 likes en el momento de recopilar los metadatos. No hay evaluaciones independientes, ni issues, ni casos de uso reportados.
- Sin benchmarks: no hay ninguna metrica publicada para el ajuste LoRA, ni comparacion con el modelo base, por lo que no se puede afirmar que el ajuste mejore nada.
- Riesgo de alucinacion alto: a 1,5B parametros el modelo tiene capacidad limitada de verificacion factual y conocimiento del mundo reducido. No es adecuado para tareas que requieran precision factual sin recuperacion externa.
- Idioma: los metadatos declaran solo ingles. El castellano no esta soportado de forma declarada y su rendimiento seria presumiblemente pobre, especialmente tras un ajuste LoRA entrenado en ingles.
- Origen de los datos de entrenamiento desconocido: al no documentarse el dataset del adaptador, no se puede descartar la presencia de datos sinteticos autogenerados, contenido con sesgos o material con restricciones de uso. El nombre `iz-instruct` no aporta informacion sobre la procedencia.
- Degradacion por cuantizacion: las cuantizaciones por debajo de Q4 (Q2_K, Q3_K_*) introducen perdida de calidad apreciable en un modelo ya de por si limitado. Solo Q6_K, Q8_0 y f16 son razonablemente fieles a los pesos originales.
- Longitud de contexto no confirmada: los 32.768 tokens son una caracteristica del modelo base; el ajuste LoRA pudo entrenarse con secuencias mas cortas y degradar el rendimiento en contextos largos.
- Tool calling no garantizado: aunque el modelo base soporta llamadas a funciones, no hay evidencia de que el adaptador conserve esa capacidad ni la plantilla de chat correcta.
- Fecha de creacion inusual: los metadatos indican 2026-09-20, posterior a la fecha habitual de publicacion de modelos Qwen2.5. Conviene verificar la vigencia del repositorio antes de integrarlo en cualquier pipeline.
- Cuantizaciones no ponderadas: el autor indica que no hay quants con imatrix ni ponderados; en un modelo de este tamano la diferencia respecto a alternativas ponderadas puede ser perceptible en tareas de razonamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/iz-instruct-GGUF
- Modelo de origen (adaptador): https://huggingface.co/theplayboy117/iz-instruct
- Modelo base del adaptador: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Pagina de descarga resumida del cuantizador: https://hf.tst.eu/model#iz-instruct-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los unicos enlaces recuperados correspondian a Pinterest y no guardan relacion con esta ficha.
