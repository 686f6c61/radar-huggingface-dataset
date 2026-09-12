# picur/picur-120M-instruct-gguf

## Resumen

picur-120M-instruct-gguf es la versión cuantizada en formato GGUF del modelo picur/picur-120M-instruct, publicado por el usuario picur en HuggingFace. Se trata de un modelo de generación de texto de tipo instruct, con 120.404.352 parámetros totales (aproximadamente 120 millones) y especializado exclusivamente en húngaro (código de idioma `hu`). El repositorio ocupa 0,4 GB e incluye pesos en formato GGUF, lo que lo hace directamente ejecutable en runtimes de inferencia local como llama.cpp u Ollama.

El problema que resuelve es la disponibilidad de un modelo conversacional en húngaro lo suficientemente pequeño como para ejecutarse en hardware muy limitado, incluso en CPU, sin necesidad de GPU. Su tamaño de 120M de parámetros lo sitúa en la categoría de modelos "tiny", pensados para prototipado rápido, experimentación con pipelines GGUF/Ollama y despliegues en dispositivos con recursos mínimos. La model card lo etiqueta explícitamente como "PREVIEW", lo que indica que se trata de una publicación temprana y no de una versión estable validada.

La relevancia actual del modelo es limitada pero concreta: la mayoría de los modelos pequeños publicados se centran en inglés, y este cubre húngaro, un idioma con mucha menor cobertura en el ecosistema open source. La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft. No se dispone de información sobre la arquitectura interna, el contexto máximo ni el proceso de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la informacion proporcionada) |
| Parametros totales | 120.404.352 (aproximadamente 120M) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; la model card menciona explicitamente Q8_0. Otros niveles no disponibles |
| Idiomas soportados | hungaro (`hu`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | picur/picur-120M-instruct |
| Tamano del repositorio | 0,4 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. Por el numero de parametros y la tarea declarada (text-generation con etiqueta instruct) se trata con alta probabilidad de un transformer decoder-only, pero esto no esta confirmado por el autor, por lo que no se puede afirmar. Tampoco se especifica si emplea atencion con窗口 deslizante, atencion lineal, mezcla de expertos ni ninguna otra variante.

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens, la composicion del dataset, el uso de RLHF, DPO o cualquier otra tecnica de alineacion. Lo unico documentado es la relacion con el modelo base picur/picur-120M-instruct, del cual esta publicacion es una cuantizacion a GGUF, presumiblemente sin cambios en los pesos mas alla de la conversion de precision. La model card no incluye ningun detalle sobre innovaciones tecnicas, decodificacion especulativa ni optimizaciones de inferencia.

## Capacidades

- Generacion de texto en hungaro: es la unica capacidad explicitamente declarada en las etiquetas del repositorio (`text-generation`, `hungarian`, `magyar`).
- Formato instruct/conversacional: el modelo esta ajustado para seguir instrucciones y mantener formato de dialogo, segun la etiqueta `instruct` y `conversational`.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que indica que puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace con pesos GGUF.
- Ejecucion local via Ollama: la model card documenta el comando de ejecucion directa con `ollama run` usando el identificador `hf.co/picur/picur-120M-instruct-gguf:Q8_0`.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no; el modelo declara unicamente hungaro (`hu`).
- Capacidades especiales (vision, audio, modo thinking): no disponibles. La model card usa el parametro `--think=false` en el comando de Ollama, pero no se documenta ninguna capacidad de razonamiento extendido asociada.

## Casos de uso

- Prototipado de asistentes conversacionales en hungaro: un equipo que necesite validar rapidamente la viabilidad de un chatbot en hungaro puede desplegar este modelo con Ollama en una maquina de desarrollo sin GPU, gracias a sus 120M de parametros y a los pesos GGUF ya publicados.
- Inferencia en dispositivos de bajos recursos: por su tamano (pesos del orden de 0,13 GB en Q8_0), es candidato para ejecutarse en CPU, contenedores pequenos o dispositivos tipo Raspberry Pi, donde no cabe ningun modelo de 7B en adelante.
- Base para fine-tuning especifico de dominio: al estar bajo Apache 2.0 y con un modelo base identificado (picur/picur-120M-instruct), sirve como punto de partida economico para ajustar tareas concretas en hungaro (clasificacion de tickets, extraccion de campos, respuestas plantilladas).
- Pruebas de integracion de pipelines GGUF y Ollama: util para validar flujos de CI/CD, empaquetado de modelos, servidores de inferencia y monitorizacion sin consumir recursos de GPU caros.
- Generacion de texto auxiliar de bajo coste: redaccion de borradores, resumenes cortos o reformulacion de frases en hungaro en herramientas internas donde la latencia y el coste por token son criticos.
- Generacion de datos sinteticos en hungaro para ampliar datasets: al ser un modelo instruct pequeno y de licencia permisiva, puede emplearse para producir variaciones de frases o ejemplos etiquetados que luego se filtren manualmente.
- Educacion y demostraciones: sirve para ilustrar en clase o en talleres como funciona un LLM instruct completo, incluida la conversion a GGUF y la ejecucion local, sin necesidad de infraestructura de GPU.
- Experimentacion con cuantizacion: al publicarse en GGUF, permite comparar el impacto de distintas precisiones sobre la calidad de salida en un modelo de coste de ejecucion minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, HuLU ni ninguna otra metrica, y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones calculadas a partir del numero de parametros (120.404.352) y del formato de pesos declarado, no datos oficiales del autor.

- Pesos en FP16: aproximadamente 0,24 GB (120,4M x 2 bytes).
- Pesos en Q8_0: aproximadamente 0,13 GB (120,4M x ~1,06 bytes), que es la cuantizacion mencionada en la model card.
- Pesos en Q4_K_M: aproximadamente 0,08 GB, estimado.
- VRAM total para inferencia: por debajo de 1 GB en cualquier cuantizacion, incluyendo el overhead de la clave-valor y del runtime. Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida.
- Ejecucion en CPU: totalmente viable; es el escenario de despliegue mas razonable para un modelo de este tamano.
- GPU recomendadas: no se requieren. Cualquier GPU con mas de 1 GB de memoria libre es suficiente; tambien funciona exclusivamente en CPU.
- Opciones de despliegue: llama.cpp, Ollama (documentado en la model card), y plataformas compatibles con GGUF. El soporte de vLLM o TGI para GGUF no esta confirmado por el autor.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica comparacion documentada es con su propio modelo base sin cuantizar.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| picur/picur-120M-instruct-gguf | 120.404.352 | no disponible | GGUF | apache-2.0 | Version cuantizada, pensada para Ollama y llama.cpp |
| picur/picur-120M-instruct | no disponible (mismo modelo base) | no disponible | safetensors (presumiblemente) | apache-2.0 | Modelo original sin cuantizar del que deriva esta publicacion |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- Estado de vista previa: la propia model card lo marca como "PREVIEW", lo que implica que puede contener errores, que la calidad de salida no esta validada y que la API o el nombre pueden cambiar.
- Riesgo elevado de alucinacion: con 120M de parametros, la capacidad de mantener coherencia factual y de seguir instrucciones complejas es muy limitada en comparacion con modelos de miles de millones de parametros.
- Ausencia de benchmarks: no hay ninguna metrica publicada que permita estimar su calidad real; su utilidad en produccion no puede justificarse con datos.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Idioma unico: solo soporta hungaro (`hu`); no hay evidencia de capacidades en castellano, ingles ni ninguna otra lengua.
- Contexto desconocido: no se especifica la longitud de contexto, dato critico para decidir si puede gestionar conversaciones multi-turno largas o documentos extensos.
- Sesgos: no disponible; no se ha publicado ninguna evaluacion de sesgos, toxicidad o comportamiento diferencial por subgrupos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No se identifican restricciones adicionales.
- Caveat de produccion: al ser una cuantizacion, la calidad puede degradarse respecto al modelo base original; no se ha publicado ninguna comparacion entre ambas versiones.
- Comando de Ollama con `--think=false`: aunque la model card lo incluye, no se documenta que exista una capacidad de razonamiento que desactivar, por lo que su efecto real no esta claro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/picur/picur-120M-instruct-gguf
- Modelo base: https://huggingface.co/picur/picur-120M-instruct
- Pagina del autor: https://huggingface.co/picur
- Ejecucion con Ollama (documentada en la model card): `ollama run --think=false hf.co/picur/picur-120M-instruct-gguf:Q8_0`
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo.
