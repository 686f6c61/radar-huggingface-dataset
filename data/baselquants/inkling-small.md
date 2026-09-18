# baselquants/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines, publicado con pesos abiertos y distribuido en Hugging Face también a través de réplicas de terceros como el repositorio baselquants/Inkling-Small. Acepta entradas de texto, imagen y audio y genera texto, con una arquitectura de transformer autoregresivo decoder-only de 42 capas y backbone de mezcla de expertos (MoE) dispersa. El modelo se orienta a desarrolladores que construyen aplicaciones con agentes, uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG).

Según la model card del autor, el modelo tiene 276.000 millones de parámetros totales y 12.000 millones activos por token, con enrutado a 6 de 256 expertos más 2 expertos compartidos. Los datos de safetensors del repositorio replicado en baselquants indican 265.956.439.090 parámetros (unos 266.000 millones), una cifra ligeramente inferior a la declarada por el autor; conviene tener en cuenta ambas referencias. El repositorio ocupa 531,9 GB, coherente con pesos en BF16.

Su relevancia actual radica en combinar tres modalidades de entrada en un único decoder con pesos abiertos y licencia Apache 2.0, algo poco habitual en modelos de esta escala, junto con soporte declarado para despliegue local en SGLang, vLLM, TokenSpeed y Unsloth. La información disponible no incluye la longitud de contexto, los idiomas exactos soportados ni los resultados numéricos de las evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only multimodal, 42 capas, backbone de mezcla de expertos (MoE) dispersa |
| Parametros totales | 276.000 millones segun la model card; 265.956.439.090 segun los safetensors del repositorio (aproximadamente 266.000 millones) |
| Parametros activos | 12.000 millones por token; enrutado a 6 de 256 expertos mas 2 expertos compartidos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (variantes publicadas por el autor) |
| Idiomas soportados | Ingles, con capacidades multilingues generales; lista de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (biblioteca transformers); existe variante NVFP4 |
| Modalidades de entrada | Texto (UTF-8), imagen (pixel, 40px a 4096px por dimension), audio (WAV, 16 kHz, idealmente menos de 2 minutos) |
| Modalidad de salida | Texto (UTF-8) |
| Tamano del repositorio | 531,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo decoder-only de 42 capas con un backbone feed-forward de mezcla de expertos dispersa: cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos activos en todos los tokens. El mecanismo de atención es híbrido, combinando capas locales y globales. La multimodalidad es nativa y no se implementa mediante adaptadores externos desconectados: las imágenes se codifican con un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, y todas las modalidades se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles públicamente, de terceros y de generación o aumento sintético. El proceso de curación declarado incluye limpieza, procesado, deduplicación y filtrado para eliminar datos de baja calidad y para objetivos de seguridad. La model card no especifica el número total de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento. Tampoco se documentan innovaciones adicionales de decodificación o atención más allá de la atención híbrida y el enrutado MoE.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general en inglés, con capacidades multilingües generales declaradas.
- Comprensión de imágenes como entrada, con codificación mediante un codificador jerárquico de parches y rangos recomendados de 40px a 4096px por dimensión.
- Comprensión de audio como entrada, en formato WAV a 16 kHz y con duración ideal inferior a 2 minutos.
- Generación de código en múltiples lenguajes de programación, según declara el autor.
- Soporte previsto para sistemas agénticos y de uso de herramientas (tool calling / function calling), mencionado explícitamente como caso de uso objetivo en la model card.
- Soporte para asistentes de código y sistemas de generación aumentada por recuperación (RAG).
- Ajuste fino e integración en productos de terceros permitidos por la licencia Apache 2.0.
- Modo de razonamiento tipo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multiturno con entradas de texto e imagen (por ejemplo, capturas o fotos de producto) y mantener una única pila multimodal, lo que simplifica la arquitectura frente a pipelines separados de visión y lenguaje. La longitud de contexto no está documentada, por lo que el dimensionado de la ventana debe validarse empíricamente antes de producción.
- Asistentes de código en producción: el autor declara soporte de múltiples lenguajes de programación y uso de herramientas, lo que permite integrar el modelo en pipelines de CI/CD para revisión de código, generación de pruebas o resolución de incidencias con contexto de repositorio.
- Análisis de documentos con imágenes y audio: la combinación de entrada de imagen y audio permite procesar, por ejemplo, capturas de pantalla, diagramas y notas de voz transcritas o codificadas directamente, con el audio codificado a 16 kHz en formato WAV.
- Agentes multiturno con uso de herramientas: el modelo puede emplearse como planificador en sistemas agénticos que invocan APIs externas, dado que el autor lo posiciona para sistemas de agentes y tool use. La eficiencia del MoE con 12.000 millones de parámetros activos reduce el coste por token frente a modelos densos del mismo tamaño total.
- Generación aumentada por recuperación (RAG): con capacidad de procesar contexto textual e imágenes de referencia, encaja en sistemas de preguntas y respuestas sobre documentación técnica que mezcle texto y capturas.
- Asistente de accesibilidad para contenido audiovisual: transcripción y descripción de audio y vídeo combinadas con texto, útil para generar subtítulos descriptivos o resúmenes de material con audio e imagen.
- Prototipado e investigación en multimodalidad: al publicarse pesos abiertos y con licencia Apache 2.0, permite experimentación académica, evaluación de sesgos y ajuste fino en dominios concretos sin restricciones de uso comercial.
- Despliegue multilingüe de propósito general: aunque el foco declarado es el inglés, las capacidades multilingües generales permiten cubrir atención básica en otros idiomas, sujeto a validación por idioma.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación por categorías que compara Inkling-Small con modelos de pesos abiertos y cerrados. Los modelos de pesos abiertos listados en la tabla son Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, además de Inkling-Small; la tabla también contiene una columna de modelos de pesos cerrados cuyo nombre queda truncado en la información disponible. No se han facilitado los valores numéricos de esa tabla.

No se han publicado resultados numéricos de benchmarks en la información disponible. No se deben asumir valores concretos de MMLU, HumanEval, GSM8K u otras pruebas a partir de esta ficha.

## Requisitos de hardware

- Pesos en BF16: el repositorio ocupa 531,9 GB, por lo que la inferencia en BF16 requiere aproximadamente 532 GB de VRAM (o memoria unificada) solo para los pesos, más el espacio de la caché KV, los estados de activación y los búferes de las dos torres de codificación (imagen y audio).
- Pesos en NVFP4: una cuantización de 4 bits sobre 266.000 millones de parámetros sitúa los pesos en el orden de 133-140 GB, más sobrecarga. El autor publica la variante NVFP4 para este fin.
- GPU recomendadas para BF16: múltiples aceleradores de 80 GB (H100, H200, A100 80GB) en configuración tensor-parallel; una sola GPU de 80 GB no es suficiente.
- GPU recomendadas para NVFP4: dos aceleradores de 80 GB pueden ser suficientes para los pesos, aunque el margen para caché KV y activaciones depende de la longitud de contexto, que no está documentada. Una RTX 4090 (24 GB) o GPU consumer equivalentes no pueden alojar el modelo completo en ninguna de las dos precisiones publicadas.
- Ajuste fino: requeriría técnicas de paralelismo (FSDP, tensor parallel) o cuantización adicional; con pesos abiertos y licencia Apache 2.0 es viable, pero no en hardware consumer.
- Opciones de despliegue declaradas por el autor: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face transformers. También hay acceso mediante API a través de proveedores de inferencia de terceros y el playground de Tinker.
- Latencia y throughput estimados: no disponibles. Cabe esperar una ventaja de coste por token frente a modelos densos de tamaño total comparable gracias a los 12.000 millones de parámetros activos, pero no se han publicado mediciones.

## Comparativa con modelos similares

La model card sitúa a Inkling-Small frente a los siguientes modelos en su tabla de evaluación. No se dispone de las especificaciones ni de los resultados numéricos de esas alternativas en la información proporcionada, por lo que varias celdas quedan como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small | 276B totales / 12B activos (266B segun safetensors) | no disponible | Tabla publicada sin valores numericos en la informacion disponible | Apache 2.0 | Pesos abiertos en Hugging Face (BF16 y NVFP4) |
| Qwen3.5 397B-A17B | 397B totales / 17B activos (segun denominacion) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

Además, la tabla de la model card incluye una columna de modelos de pesos cerrados cuyo nombre no se ha facilitado completo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo ni de toxicidad en la información disponible. El entrenamiento con datos de internet y de terceros implica riesgo de heredar sesgos de esas fuentes.
- Riesgo de alucinación: no se han publicado métricas de veracidad, calibración ni tasas de alucinación. Es un riesgo relevante en cualquier uso de producción con generación libre.
- Longitud de contexto: no documentada. Esto impide planificar despliegues que dependan de ventanas largas y afecta directamente al cálculo de memoria de la caché KV.
- Limitaciones de idioma: el foco declarado es el inglés, con capacidades multilingües generales no cuantificadas. No hay lista de idiomas soportados ni evaluaciones por idioma.
- Restricciones de audio e imagen: las recomendaciones del autor limitan la imagen a 40-4096px por dimensión y el audio a WAV de 16 kHz de menos de 2 minutos para un rendimiento óptimo; fuera de esos rangos el comportamiento no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero el autor publica además una política de uso aceptable (Acceptable Use Policy) enlazada desde la model card; conviene revisarla antes de desplegar en productos finales.
- Discrepancia de parámetros: la model card declara 276.000 millones de parámetros y los safetensors del repositorio replicado indican 265.956.439.090; hay que verificar la cifra exacta antes de dimensionar infraestructura.
- Repositorio replicado: el identificador analizado (baselquants/Inkling-Small) no coincide con el repositorio del autor (thinkingmachines/Inkling-Small). Registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que conviene confirmar la procedencia y la integridad de los pesos antes de usarlos.
- Fecha de publicación: el repositorio figura creado el 18 de septiembre de 2026, lo que lo sitúa como una publicación muy reciente con poca validación externa acumulada.
- Resultados de búsqueda no relacionados: las consultas web realizadas no devolvieron documentación técnica utilizable sobre este modelo.

## Enlaces

- Repositorio analizado: https://huggingface.co/baselquants/Inkling-Small
- Repositorio del autor (BF16): https://huggingface.co/thinkingmachines/Inkling-Small
- Variante NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
- Imagen del modelo: https://cdn-uploads.huggingface.co/production/uploads/630e8f0bf6f6d700f50ebd2e/AvmDwmrWRMnKjOWvmLieg.png
