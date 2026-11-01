# isilicon/mango-artemis-31b-q6k

## Resumen

Mango Artemis 31B Q6_K es un espejo de preservación del modelo Artemis 31B v1.2 de TheDrummer, cuantizado en formato GGUF Q6_K por bartowski y redistribuido por el usuario isilicon bajo la colección Mango. No se trata de un modelo nuevo ni de un fine-tune propio: el repositorio conserva los bytes originales del artefacto de bartowski (revisión `72c9a54c1b6080093616d4d510a46b20c76b8a24`) junto con el proyector multimodal BF16 correspondiente, y añade documentación, manifiestos de integridad y un protocolo de evaluación propio.

El modelo subyacente es un transformer de 30.697.345.596 parámetros (aproximadamente 31B) con capacidades multimodales declaradas (texto, imagen y audio según la model card upstream), empaquetado en dos ficheros: el peso principal Q6_K de 26,96 GB y un proyector `mmproj` BF16 de 1,20 GB. La licencia declarada es Apache 2.0, verificada por el preservador a través de la cadena de modelos base.

Su relevancia es fundamentalmente práctica: ofrece una copia verificable por SHA-256 de una cuantización de alta calidad (Q6_K, cercana a la precisión completa) de un modelo de 31B que cabe en GPUs de consumo alto y en GPUs profesionales de 24-48 GB, con soporte de llama.cpp/llama-server. Es importante señalar que el propio preservador indica que no ha publicado una puntuación de calidad Mango independiente para estos ficheros exactos, por lo que la calidad no está avalada por su suite de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (detalles de capas y atención no disponibles) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible (el ejemplo de carga usa `--ctx-size 32768`, no confirmado como máximo) |
| Tipos de cuantizacion | Q6_K (pesos principales) + BF16 (proyector multimodal `mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 ficheros: `TheDrummer_Artemis-31B-v1.2-Q6_K.gguf` y `mmproj-TheDrummer_Artemis-31B-v1.2-bf16.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, cabezas, vocabulario ni composición del dataset de entrenamiento). La model card del espejo describe únicamente el artefacto de cuantización: un transformer de aproximadamente 31B parámetros con un proyector multimodal separado en BF16, lo que indica un diseño de tipo LLM con adaptador visual/audio al estilo de los modelos multimodales empaquetados para llama.cpp.

No se documentan en esta ficha el número de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. El preservador tampoco aporta resultados de evaluación propios: indica explícitamente que no ha publicado puntuación Mango para estos ficheros exactos y que la evaluación local cubre solo tareas de texto y herramientas, sin establecer el techo de contexto real, la calidad multimodal ni todas las rutas opcionales de decodificación especulativa.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidades multimodales declaradas upstream: imagen y audio, condicionadas a la ruta del proyector `mmproj` y al runtime empleado.
- Soporte de tool calling / function calling: la evaluación local del preservador incluye tareas de herramientas, aunque no se publican resultados numéricos para este artefacto.
- Soporte de agentes y razonamiento multi-paso: el protocolo Mango contempla 12 casos de agente, pero no hay puntuación publicada para estos ficheros.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento extendido (thinking): no disponible.
- Decodificación especulativa opcional: mencionada como ruta upstream no verificada por el preservador.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con `llama-server` en una máquina con 32-48 GB de VRAM y servir conversaciones multi-turno con contexto de hasta 32K tokens (valor usado en el ejemplo de carga, no confirmado como máximo).
- Análisis de documentos con imágenes: gracias al proyector `mmproj` BF16, puede procesar capturas, diagramas o páginas escaneadas junto con texto, siempre que el runtime cargue el proyector correctamente.
- Transcripción y comprensión de audio: la model card upstream declara soporte de audio; útil para pipelines de resumen de reuniones o clasificación de locuciones, sujeto a verificación empírica de calidad.
- Automatización de flujos con herramientas: al soportar tool calling, puede integrarse en orquestadores de agentes que consulten APIs, bases de datos o sistemas internos, con la cautela de que no hay benchmarks publicados para este artefacto.
- Generación y revisión de código en local: un modelo de 31B en Q6_K ofrece un compromiso razonable entre calidad y requisitos de hardware para entornos sin conexión o con requisitos de privacidad estrictos.
- Preservación y auditoría de artefactos: el repositorio incluye `SOURCE_MANIFEST.json` con SHA-256 completos, lo que permite verificar la integridad de los pesos en despliegues regulados o en cadena de suministro de modelos.
- Prototipado de investigación multimodal: sirve como base reproducible para experimentos que necesiten un modelo de 31B con visión/audio en formato GGUF y licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para estos ficheros exactos. El preservador indica explícitamente: «No standalone Mango quality score has been published for these exact files». La model card menciona un estudio separado sobre Qwen (cohorte de 404 preguntas, 82,87/100 en esfuerzo medio frente a 84,41/100 en xhigh) que no corresponde a este modelo y no debe atribuírsele.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q6_K ocupan 26,96 GB en disco; el proyector BF16 añade 1,20 GB. En VRAM hay que sumar caché KV y memoria de trabajo, por lo que se recomienda un mínimo de 32 GB para contexto moderado y 40-48 GB para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB, RTX A6000 48 GB; en consumo, RTX 4090 24 GB queda por debajo de los pesos solos y requeriría offload a RAM (con la penalización de velocidad correspondiente).
- Cabe en GPU de consumo: no de forma íntegra en 24 GB; sí parcialmente con offloading parcial en llama.cpp, a costa de latencia.
- Opciones de despliegue: llama.cpp / `llama-server` (comando de ejemplo incluido en la model card con `--jinja --flash-attn on --cache-type-k q8_0 --cache-type-v q8_0`), y otros runtimes compatibles con GGUF. vLLM y TGI no están documentados para este artefacto en la información disponible.
- Latencia y throughput: no disponibles; el preservador no ha medido throughput para este conjunto seleccionado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mango Artemis 31B Q6_K (este) | 30,7B | no disponible (ejemplo 32K) | GGUF Q6_K + mmproj BF16 | Apache 2.0 | Espejo verificado, sin score Mango publicado |
| TheDrummer Artemis 31B v1.2 (upstream) | ~31B | no disponible | safetensors/GGUF (según distribución) | Apache 2.0 (según cadena base) | Modelo original del que deriva este espejo |
| bartowski TheDrummer_Artemis-31B-v1.2-GGUF | ~31B | no disponible | GGUF (varias cuantizaciones) | Apache 2.0 | Fuente directa de esta cuantización Q6_K |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Calidad no avalada: el preservador no ha publicado puntuación Mango para estos ficheros; «quality ungraded» figura explícitamente en la model card.
- Contexto máximo no verificado: el valor de 32K en el ejemplo de carga es una configuración de arranque, no una confirmación del techo real del modelo.
- Capacidades multimodales no medidas: no hay resultados de calidad para imagen o audio en este artefacto; dependen del runtime y del proyector.
- Idiomas no declarados: no se especifica cobertura lingüística, lo que impide garantizar calidad en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluación específica publicada.
- Licencia: Apache 2.0 permite uso comercial, pero la procedencia debe verificarse en la cadena base upstream; el preservador indica que comprobó la procedencia a través de la cadena fijada.
- Requisitos de memoria: Q6_K no cabe en GPUs de 24 GB sin offload, lo que afecta a latencia y throughput en producción.
- Integridad: conviene verificar los SHA-256 de `SOURCE_MANIFEST.json` antes de desplegar, y fijar la revisión `c8e18b701a1f7d3dd98d311c9f7cacc05432c86d` al descargar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/isilicon/mango-artemis-31b-q6k
- Modelo base (bartowski): https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF
- Colección Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
- Metodología de benchmarks: https://huggingface.co/isilicon/mango-artemis-31b-q6k/blob/main/BENCHMARK_METHODOLOGY.md
- Manifiesto de origen: https://huggingface.co/isilicon/mango-artemis-31b-q6k/blob/main/SOURCE_MANIFEST.json
- Estado del espejo: https://huggingface.co/isilicon/mango-artemis-31b-q6k/blob/main/MIRROR_STATUS.json
