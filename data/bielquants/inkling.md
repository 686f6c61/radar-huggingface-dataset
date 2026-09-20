# bielquants/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto, imagen y audio y genera texto. Se trata de un transformer autorregresivo decoder-only de 66 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La model card declara 975.000 millones de parámetros totales y 41.000 millones activos por token, lo que lo sitúa en la categoría de modelos frontera con coste de inferencia muy inferior al de un modelo denso equivalente.

El modelo es nativamente multimodal: las imágenes y el vídeo se codifican mediante un codificador jerárquico de parches y el audio mediante codificación en tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que procesa el decodificador. La atención combina capas locales y globales. Se distribuye con pesos abiertos bajo licencia Apache 2.0, con soporte declarado para BF16 y NVFP4, y con recetas de despliegue para SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face.

La ficha que se analiza corresponde al repositorio `bielquants/Inkling`, un espejo o reempaquetado del modelo original de Thinking Machines (0 descargas y 0 likes en el momento de la consulta). El recuento real de parámetros de los pesos safetensors de ese repositorio es de 952.377.623.626 (952,4 mil millones), ligeramente inferior a la cifra de 975.000 millones de la model card. El tamaño del repositorio es de 1904,8 GB, coherente con pesos en BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only multimodal con MoE disperso; 66 capas; atención híbrida local y global |
| Parametros totales | 975 000 millones según model card; 952 377 623 626 según safetensors del repositorio `bielquants/Inkling` |
| Parametros activos | 41 000 millones por token (6 de 256 expertos enrutados + 2 expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (soportados oficialmente); no se documentan GGUF ni otras cuantizaciones en la información disponible |
| Idiomas soportados | Inglés, con capacidades multilingües generales; también múltiples lenguajes de programación |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato en píxeles, idealmente entre 40 px y 4096 px por dimensión), audio (WAV a 16 kHz, idealmente menos de 20 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Tamaño del repositorio | 1904,8 GB |
| Pipeline declarado | image-text-to-text (también etiquetado como audio-text-to-text) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 66 capas con una columna vertebral *feed-forward* de mezcla de expertos dispersa. El enrutamiento envía cada token a 6 de 256 expertos, además de 2 expertos compartidos que se activan en todos los tokens, lo que da lugar a un ratio de activación de aproximadamente el 4,2 % de los parámetros totales (41B sobre 975B). La atención es híbrida, combinando capas locales y globales, un patrón habitual para reducir el coste del mecanismo de atención en contextos largos. La multimodalidad es nativa: imagen y vídeo pasan por un codificador jerárquico de parches y el audio por codificación en tokens discretos, y todas las modalidades se proyectan a un espacio oculto compartido que procesa conjuntamente el decodificador.

En cuanto a los datos de entrenamiento, la model card indica que el corpus incluye texto, imágenes, audio y vídeo, procedente de fuentes públicas (internet público y repositorios accesibles públicamente), de terceros y de generación o aumento sintético. El proceso de curación incluye limpieza, procesado, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. No se especifica el número total de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento; todos esos datos figuran como no disponibles en la información proporcionada. Las evaluaciones se reportan con un parámetro de esfuerzo (`effort=0.99`), lo que sugiere un mecanismo configurable de razonamiento.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Razonamiento complejo, con resultados destacados en HLE (29,7 % solo texto, 46,0 % con herramientas) y AIME 2026 (97,1 %).
- Razonamiento con uso de herramientas (tool calling): la model card describe el modelo como apto para sistemas agénticos y de uso de herramientas, y reporta métricas específicas con herramientas.
- Codificación agéntica: 77,6 % en SWEBench Verified y 54,3 % en SWEBench Pro (Public).
- Comprensión de imágenes en modalidad image-text-to-text, con soporte de vídeo a través del codificador jerárquico de parches.
- Comprensión de audio en modalidad audio-text-to-text (WAV a 16 kHz), apto para entradas de hasta 20 minutos según la model card.
- Capacidades multilingües generales además del inglés, y soporte de múltiples lenguajes de programación.
- Apto para RAG, asistentes de código, chatbots y sistemas multi-paso según la descripción del autor.
- Pesos abiertos que permiten ajuste fino e integración en productos de terceros (recetas de Unsloth y Tinker Cookbook).

## Casos de uso

- Asistentes de codificación agéntica: con 77,6 % en SWEBench Verified y soporte de tool calling, el modelo puede integrarse en flujos que editan repositorios, ejecutan tests y corrigen errores de forma iterativa.
- Atención al cliente automatizada: su naturaleza conversacional y multimodal permite gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o documentos, aunque la longitud de contexto no está documentada.
- RAG multimodal sobre documentación técnica: combinación de texto e imágenes de manuales o diagramas, con generación de respuestas citables en pipelines de recuperación.
- Análisis de audio en pipelines de transcripción y resumen: la entrada WAV a 16 kHz con hasta 20 minutos por clip encaja en tareas de resumen de reuniones o análisis de llamadas.
- Revisión de vídeo e imagen en control de calidad: el codificador de parches jerárquico permite inspeccionar fotogramas o imágenes de alta resolución (hasta 4096 px por dimensión).
- Agentes de investigación con herramientas: la puntuación de 46,0 % en HLE con herramientas indica capacidad para encadenar búsquedas, cálculo y verificación en tareas multi-paso.
- Ajuste fino específico de dominio: al publicarse con pesos abiertos y licencia Apache 2.0, es viable el *fine-tuning* sobre datos propios con Unsloth o el ecosistema Tinker, siempre que el coste de infraestructura lo permita.
- Evaluación comparativa interna de modelos frontera: utilizable como referencia abierta en pruebas de razonamiento y agentes frente a modelos propietarios.

## Benchmarks y rendimiento

Resultados reportados por el autor con `effort=0.99`; las puntuaciones de comparación se generaron el 14 de julio de 2026. Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2 y DeepSeek V4 Pro son modelos de pesos abiertos; Gemini 3.1 Pro, Claude Fable 5 y GPT 5.6 Sol son de pesos cerrados. La tabla de la información disponible aparece truncada en la última fila (SWEBench Pro para GPT 5.6 Sol), por lo que ese dato no se reproduce.

| Categoria | Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|---|
| Razonamiento | HLE (solo texto) | 29,7 % | 26,6 % | 29,4 % | 35,9 % | 40,1 % | 35,9 % | 44,7 % | 53,3 % | 47,2 % |
| Razonamiento | HLE (con herramientas) | 46,0 % | 37,4 % | 50,2 % | 54,0 % | 54,7 % | 48,2 % | 51,4 % | 64,5 % | 55,0 % |
| Razonamiento | AIME 2026 | 97,1 % | 94,2 % | 95,8 % | 96,4 % | 99,2 % | 96,7 % | 98,3 % | – | 99,9 % |
| Razonamiento | GPQA Diamond | 87,2 % | 86,7 % | 87,9 % | 91,1 % | 89,5 % | 88,8 % | 94,1 % | 92,6 % | 94,1 % |
| Agéntico (código) | SWEBench Verified | 77,6 % | 70,7 % | 76,8 % | 80,2 % | – | 80,6 % | 80,6 % | 95,0 % | – |
| Agéntico (código) | SWEBench Pro (Public) | 54,3 % | 46,4 % | 50,7 % | 58,6 % | 62,1 % | 55,4 % | 54,2 % | 80,0 % | no disponible (tabla truncada) |

No se han publicado en la información disponible resultados de benchmarks de visión, audio, MMLU, HumanEval o GSM8K.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del recuento de parámetros (952,4 mil millones) y no proceden de recomendaciones oficiales, que no se incluyen en la información disponible.

- VRAM estimada en BF16: en torno a 1,9 TB solo para pesos, más caché KV y activaciones; requiere nodos multi-GPU.
- VRAM estimada en NVFP4 (4 bits): en torno a 480 GB para pesos, con sobrecoste de caché KV y *buffers*.
- GPU recomendadas (estimación): clases de centro de datos con memoria agregada elevada, como configuraciones de 8× B200 (192 GB) o más, o nodos de 16-24× H100/H200 (80-141 GB) para BF16. No hay lista oficial de hardware soportado en la información proporcionada.
- GPU de consumo: no cabe en ninguna GPU de consumo actual, ni siquiera con cuantización de 4 bits, dado que los pesos NVFP4 rondan los 480 GB. No se documentan cuantizaciones GGUF que permitan despliegue en llama.cpp u Ollama.
- Opciones de despliegue documentadas: SGLang, vLLM, TokenSpeed, Unsloth y la pila de Hugging Face (transformers); también acceso vía API mediante Tinker Cookbook y proveedores de inferencia de terceros.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling | 975B totales / 41B activos (MoE) | no disponible | HLE texto 29,7 %; HLE con herramientas 46,0 %; SWEBench Verified 77,6 % | apache-2.0 | Pesos abiertos (BF16 y NVFP4), playground y API |
| Nemotron 3 Ultra | no disponible | no disponible | HLE texto 26,6 %; SWEBench Verified 70,7 % | pesos abiertos (tipo de licencia no disponible) | Pesos abiertos |
| Kimi K2.6 | no disponible | no disponible | HLE texto 35,9 %; HLE con herramientas 54,0 %; SWEBench Verified 80,2 % | pesos abiertos (tipo de licencia no disponible) | Pesos abiertos |
| DeepSeek V4 Pro | no disponible | no disponible | HLE texto 35,9 %; SWEBench Verified 80,6 % | pesos abiertos (tipo de licencia no disponible) | Pesos abiertos |
| GLM 5.2 | no disponible | no disponible | HLE texto 40,1 %; HLE con herramientas 54,7 % | pesos abiertos (tipo de licencia no disponible) | Pesos abiertos |

Frente a los modelos de pesos cerrados de la comparativa (Gemini 3.1 Pro, Claude Fable 5, GPT 5.6 Sol), Inkling queda por detrás en HLE de texto y con herramientas y en SWEBench Verified, pero se sitúa por delante de Nemotron 3 Ultra en la mayoría de métricas de razonamiento y código. No se dispone de datos de parámetros, contexto ni licencia concreta de los modelos comparados más allá de su condición de pesos abiertos.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas de error ni mecanismos específicos de mitigación en la información disponible.
- No se especifica la longitud de contexto soportada, lo que dificulta dimensionar casos de uso con documentos largos o conversaciones extensas.
- El rendimiento en razonamiento puro (HLE de texto, 29,7 %) está claramente por debajo de los modelos cerrados de referencia (hasta 53,3 %), lo que limita su uso en tareas de razonamiento de máxima dificultad sin herramientas.
- El rendimiento en audio y visión no está cuantificado con benchmarks en la información disponible, pese a ser capacidades declaradas.
- Idiomas: el modelo está orientado al inglés, con capacidades multilingües descritas de forma genérica; no hay evaluación publicada por idioma, por lo que el comportamiento en castellano es incierto.
- Licencia Apache 2.0: permite uso comercial, pero la model card enlaza una política de uso aceptable de Thinking Machines que conviene revisar antes de un despliegue en producción.
- El repositorio analizado (`bielquants/Inkling`) no es el repositorio oficial de Thinking Machines y muestra 0 descargas y 0 likes, con fechas de creación y actualización del 19 de septiembre de 2026; conviene verificar la integridad de los pesos frente al repositorio original.
- Existe una discrepancia de unos 23.000 millones de parámetros entre el recuento de safetensors del espejo (952,4B) y la cifra declarada en la model card (975B).
- No se documentan cuantizaciones GGUF ni rutas de despliegue en llama.cpp u Ollama, lo que descarta el despliegue en hardware de consumo.
- Los requisitos de hardware no están publicados oficialmente; las estimaciones de VRAM de esta ficha son cálculos a partir del número de parámetros y pueden variar según la implementación y el backend.
- El coste de inferencia en BF16 exige infraestructura multi-nodo, lo que puede hacer inviable el autoalojamiento para equipos pequeños.

## Enlaces

- Repositorio analizado: https://huggingface.co/bielquants/Inkling
- Repositorio oficial BF16: https://huggingface.co/thinkingmachines/Inkling
- Variante NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de despliegue en SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de despliegue en vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling
- Receta de despliegue en TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente páginas de un servicio de televisión por streaming), por lo que no se añaden enlaces adicionales procedentes de esa búsqueda.
