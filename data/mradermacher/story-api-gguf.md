# mradermacher/story-api-GGUF

## Resumen

Story-api es un modelo de lenguaje de pequeno tamano (163.037.184 parametros, aproximadamente 163 millones) desarrollado originalmente por el usuario abdalraheemdmd bajo el identificador `abdalraheemdmd/story-api`. Esta ficha documenta la version cuantizada publicada por mradermacher bajo el identificador `mradermacher/story-api-GGUF`, que ofrece los pesos del modelo original convertidos al formato GGUF en multiples niveles de cuantizacion para su uso con llama.cpp y herramientas compatibles.

El modelo esta orientado a la generacion de historias y contenido narrativo en ingles, segun se deduce de su nombre y de la unica etiqueta de idioma declarada (`en`). Con 163 millones de parametros, se situa en la categoria de modelos muy compactos, adecuados para despliegues en hardware modesto, entornos embebidos o experimentacion rapida con generacion de texto creativo.

La relevancia de esta publicacion es principalmente practica: mradermacher actua como cuantizador de terceros, y su repositorio facilita el acceso al modelo en formatos ligeros (desde Q2_K de 0,2 GB hasta f16 de 0,4 GB) que pueden ejecutarse en CPU o en GPUs de consumo. El repositorio registra 21 descargas y ningun "like" en el momento de la consulta, lo que indica una adopcion muy limitada dentro de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles especificos no disponibles) |
| Parametros totales | 163.037.184 (aproximadamente 163 M) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (version cuantizada); el modelo base se distribuye presumiblemente en safetensors segun la libreria transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `abdalraheemdmd/story-api` en la informacion proporcionada. Por el numero de parametros (163 M) y la libreria declarada (`transformers`), se trata presumiblemente de un transformer decoder-only de escala pequena, similar en orden de magnitud a modelos como GPT-2 small (124 M) o distilgpt2, aunque no se confirma la arquitectura exacta, el numero de capas, la dimension oculta ni el mecanismo de atencion.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el numero de tokens, la composicion del corpus, la posible aplicacion de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card del repositorio cuantizado se limita a describir el proceso de cuantizacion estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizado por mradermacher sobre los pesos originales. Existe una variante con cuantizacion ponderada/imatrix publicada en `mradermacher/story-api-i1-GGUF`, que suele ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto en ingles, presumiblemente orientada a narrativa e historias segun el nombre del modelo.
- Generacion de texto creativo y continuacion de prompts narrativos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de codigo ni matematicas; por su tamano, es esperable un rendimiento limitado en estas tareas.

## Casos de uso

- Generacion de historias cortas y ficcion: el modelo puede utilizarse para continuar prompts narrativos o generar borradores de relatos en ingles, aprovechando su orientacion declarada a la generacion de historias.
- Prototipado rapido de aplicaciones de escritura creativa: al ocupar apenas 0,2-0,4 GB en formato GGUF, permite iterar en local sin infraestructura dedicada.
- Experimentacion educativa con modelos de lenguaje: su tamano reducido facilita el estudio del comportamiento de transformers pequenos, la inspeccion de pesos y la practica con pipelines de cuantizacion.
- Ejecucion en dispositivos con recursos limitados: puede desplegarse en CPU, Raspberry Pi o portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que habilita demos offline de generacion de texto.
- Generacion de variaciones de texto y aumentacion de datos: util para producir parafrasis o variantes narrativas en ingles en pipelines de datos, siempre con revision humana dada la calidad esperada de un modelo de 163 M.
- Pruebas de integracion en pipelines de inferencia: sirve como modelo de sustitucion (mock) en el desarrollo de sistemas que consumen APIs de generacion de texto, validando latencia y formato de salida antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; aproximadamente 0,2 GB para Q2_K a Q6_K y 0,3-0,4 GB para Q8_0 y f16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere hardware de datacenter (A100, H100) para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1050, RTX 3060, RTX 4090) e incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, se espera una latencia muy baja (del orden de milisegundos por token en CPU moderna) y throughput alto en GPU, aunque no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| story-api (este modelo) | 163 M | no disponible | no disponible | GGUF, transformers | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | MIT (pesos OpenAI) | safetensors, GGUF (comunidad) | Hugging Face |
| distilgpt2 | 82 M | 1024 tokens | Apache 2.0 | safetensors, GGUF (comunidad) | Hugging Face |
| TinyLlama 1.1B | 1,1 B | 2048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa es orientativa: no se dispone de datos de rendimiento de story-api que permitan una comparacion cuantitativa con estas alternativas. Frente a GPT-2 small y distilgpt2, story-api es algo mayor en parametros, pero carece de documentacion publica sobre calidad, contexto y licencia, lo que limita su evaluacion. TinyLlama, con un orden de magnitud mas de parametros y contexto documentado, es una alternativa mas robusta si el objetivo es generacion de texto general en ingles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no conocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, religion u otros.
- Riesgo de alucinacion: alto, como es habitual en modelos de este tamano; no se recomienda su uso en aplicaciones donde la veracidad factual sea critica.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide planificar casos de uso con ventanas largas.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si se permite uso comercial; se recomienda contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Caveat de produccion: el repositorio es una cuantizacion de terceros (mradermacher) de un modelo base con escasa documentacion; no hay garantias de calidad, mantenimiento ni soporte. La adopcion es muy baja (21 descargas, 0 likes), lo que reduce la probabilidad de encontrar soluciones a problemas en la comunidad.
- La model card no aporta informacion sobre el proceso de entrenamiento, evaluacion ni limitaciones conocidas del modelo original.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/story-api-GGUF
- Modelo base original: https://huggingface.co/abdalraheemdmd/story-api
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/story-api-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#story-api-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
