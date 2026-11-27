# gump2049/APUS-Reflex2.1

## Resumen

APUS-Reflex2.1 es un modelo de decisión publicado por el usuario gump2049 en Hugging Face. No es un modelo generativo de propósito general: su función es puntuar decisiones tipadas sobre un estado compartido en una única petición HTTP. El endpoint de texto admite tres tipos de pregunta: elección entre opciones con descripción, binaria y ordinal (score con niveles ordenados). Devuelve tanto la opción o escalar seleccionado como la distribución de probabilidad completa sobre opciones o niveles, lo que permite umbrales de confianza y agregación posterior.

El snapshot incluye pesos en safetensors, tokenizador, una cabeza de decisión en FP32, una ruta de servicio para vLLM y un verificador de humo. El tag `qwen3_5` en Hugging Face sugiere una base derivada de la familia Qwen 3.5, aunque la model card no detalla la arquitectura interna ni los datos de entrenamiento. El identificador servido es `APUS-Reflex2.1` y el pipeline declarado es `zero-shot-classification`.

Con 26.085.330.160 parámetros (unos 26,1 mil millones) y un repositorio de 52,2 GB, el modelo requiere despliegue en dos GPU según las instrucciones del autor. Su relevancia actual radica en el enfoque: sustituir generación de texto libre por clasificación estructurada con distribución de probabilidad, útil en enrutado, triaje y sistemas de decisión donde se necesita trazabilidad numérica y no una respuesta en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de familia `qwen3_5`; la model card no detalla la arquitectura interna) |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la cabeza de decisión se sirve en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cabeza de decisión en FP32) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni el proceso de entrenamiento. El tag `qwen3_5` apunta a una base de la familia Qwen 3.5, pero no se confirma en el texto. Lo que sí se documenta es la pieza diferencial: una cabeza de decisión en FP32 que transforma el estado y las instrucciones de la pregunta en una distribución de probabilidad sobre opciones (pregunta de elección), sobre dos clases (pregunta binaria) o sobre niveles ordenados (pregunta de score). El modelo se sirve mediante vLLM con un endpoint propio `POST /v1/systemone` en lugar del endpoint de chat completions estándar.

El stack de referencia es Python 3.12 sobre Linux, vLLM 0.33.0, Torch 2.14.0 con CUDA 13.0, Transformers 5.20.2, Triton 3.8.0, FlashInfer 0.7.2.post1 y NVIDIA CUTLASS DSL 4.8.0 para CUDA 13. La comprobación de arranque importa el mismo kernel de prefill GDN que usa la inferencia, lo que sugiere atención de tipo Gated DeltaNet en la base. El lanzador valida los hashes del código fuente de vLLM antes de arrancar y permite verificar los ficheros de pesos contra `SHA256SUMS`. No se publican datos sobre número de tokens de entrenamiento, composición del dataset, RLHF ni DPO.

## Capacidades

- Clasificación zero-shot con etiquetas definidas en tiempo de inferencia mediante un mapeo de identificadores de opción a descripciones.
- Preguntas de elección: selecciona una opción entre un conjunto arbitrario y devuelve la distribución completa sobre las opciones.
- Preguntas binarias: decisión sí/no con probabilidad asociada.
- Preguntas ordinales (score): asigna un escalar sobre niveles ordenados y devuelve la distribución sobre los niveles.
- Salida estructurada: cada respuesta incluye la selección y la distribución, apta para umbrales de confianza y agregación.
- Servicio vía vLLM con API HTTP propia (`/v1/systemone`), descubrimiento, health check e identidad de modelo verificables con `verify.py`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo.

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como estado y definir colas como opciones (por ejemplo, facturación y envíos); el modelo devuelve la cola y su probabilidad, lo que permite derivar a revisión humana cuando la confianza es baja.
- Enrutado de peticiones en pipelines internos: clasificar una consulta entrante entre varios servicios o modelos especializados en una sola llamada, con la distribución como señal de abstención.
- Moderación binaria con umbral: usar preguntas binarias para decidir si un contenido requiere revisión, ajustando el umbral sobre la probabilidad devuelta en lugar de depender de una cadena de texto parseada.
- Puntuación ordinal de riesgo: asignar niveles ordenados (bajo, medio, alto) a casos de fraude o incidencias, aprovechando la distribución sobre niveles para calibrar políticas de escalado.
- Decisión sobre estado compartido en sistemas multi-paso: el endpoint acepta un estado textual y varias preguntas en la misma petición, útil para agentes que necesitan varias decisiones coherentes sobre el mismo contexto.
- Verificación automatizada en CI: el script `verify.py` comprueba descubrimiento, salud, identidad del modelo y distribuciones de los tres tipos de pregunta, lo que permite integrar una prueba de regresión del servicio en el pipeline de despliegue.
- Despliegue con proxy autenticado: el autor indica que instalaciones externas pueden colocar un proxy inverso autenticado delante del servicio, lo que encaja en arquitecturas internas donde el modelo no se expone directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El autor indica despliegue en dos GPU con `tensor_parallel_size` por defecto igual a 2 y `gpu_memory_utilization` de 0.85.
- VRAM estimada: no disponible de forma explícita; con 26,1 B parámetros y pesos en el repositorio de 52,2 GB, los pesos en precisión de publicación ocupan del orden de 52 GB, repartidos entre las dos GPU. La cabeza de decisión se sirve en FP32.
- GPU recomendadas: no especificadas por el autor; por el reparto en dos dispositivos y el uso de CUDA 13, encajan aceleradores de centro de datos (A100, H100) o dos GPU de consumo de gama alta con suficiente VRAM agregada.
- ¿Cabe en una GPU de consumo? No se documenta; el diseño de referencia usa dos GPU.
- Opciones de despliegue: vLLM 0.33.0 con la ruta de servicio incluida (Docker o `deploy.sh`); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- El lanzador usa un directorio temporal separado por proceso de servicio y valida los hashes exactos del código de vLLM antes de arrancar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de contexto que permitan una comparación cuantitativa fiable. La comparación se limita a rasgos estructurales.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| APUS-Reflex2.1 | ~26,1 B | no disponible | Decisión tipada con distribución de probabilidad vía endpoint propio | Apache 2.0 |
| Modelos base de la familia Qwen 3.5 | no disponible | no disponible | Generación de texto general | no disponible |
| Clasificadores zero-shot tipo NLI | típicamente < 1 B | no disponible | Clasificación por entailment | variable |

La diferencia principal frente a un modelo generativo del mismo tamaño es la interfaz: APUS-Reflex2.1 no produce texto libre, sino selecciones y distribuciones sobre opciones definidas por el llamante, lo que simplifica el parseo y la calibración en producción.

## Limitaciones y advertencias

- La model card no documenta sesgos, composición del dataset ni evaluación de robustez; no hay base para afirmar nada sobre sesgos conocidos.
- Riesgo de alucinación: al ser un modelo de decisión con salida restringida a opciones, el riesgo se traslada a selecciones erróneas con alta confianza; conviene usar la distribución devuelta y umbrales de abstención.
- No se especifican idiomas soportados; el comportamiento multilingüe es desconocido.
- No se especifica la longitud de contexto; estados largos pueden truncarse o degradar la decisión.
- El modelo se distribuye como snapshot privado según la model card: la descarga requiere una cuenta autorizada de Hugging Face y la revisión concreta que se vaya a servir.
- El servicio usa un endpoint no estándar (`/v1/systemone`) y un stack de dependencias muy específico (vLLM 0.33.0, Torch 2.14.0, CUDA 13.0, FlashInfer 0.7.2.post1); la portabilidad a otras versiones no está garantizada.
- El lanzador valida hashes del código de vLLM; modificar el entorno puede impedir el arranque.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de atribución documentados en `third_party/ATTRIBUTION.md`.
- Con 9 descargas y 0 likes en el momento de la consulta, no hay evidencia comunitaria de uso en producción; trátese como un artefacto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gump2049/APUS-Reflex2.1
- Fichero de atribución de terceros: `third_party/ATTRIBUTION.md` (incluido en el repositorio del modelo)
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
