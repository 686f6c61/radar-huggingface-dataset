# Czarj/Z_Basorion_0.1

## Resumen

Z_Basorion_0.1 es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario Czarj (zov). No se trata de un modelo entrenado desde cero, sino de una fusión de pesos generada con mergekit mediante el método MoE DELLA, según la propia model card del autor. La arquitectura declarada en la configuración de la fusión es Gemma4ForConditionalGeneration, con 25.999.063.326 parámetros totales (unos 26.000 millones) y un repositorio de 52,0 GB en formato safetensors.

El interés técnico del modelo reside en el procedimiento de construcción: parte de un modelo base (referenciado localmente como base_sharded) y le incorpora otro modelo (orion_sharded) aplicando pesos diferenciados por componente (0,5 para embed_tokens y 0,05 para atención y MLP), con densidad 0,9, epsilon 0,09 y estrategia de router DELLA. El resultado se exporta en bfloat16 a partir de un cálculo en float32.

La relevancia práctica es limitada por la falta de información verificable: la licencia, los idiomas, la longitud de contexto, los modelos de origen y los datos de entrenamiento no están publicados, y el repositorio acumula 0 descargas y 0 "me gusta" en la fecha de consulta. Se trata, por tanto, de un experimento de fusión reproducible solo parcialmente, útil como referencia metodológica más que como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (según la configuración de la fusión); transformer condicional multimodal |
| Parametros totales | 25.999.063.326 (aprox. 26B), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en bfloat16; no se han publicado GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (out_dtype: bfloat16; cálculo de la fusión en float32) |

Otros datos: tamaño del repositorio 52,0 GB; pipeline image-text-to-text; librería transformers; etiquetas conversational, mergekit, merge, endpoints_compatible, region:us; creado y actualizado el 29 de septiembre de 2026; 0 descargas y 0 "me gusta".

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido convencional. El modelo se genera con mergekit combinando dos artefactos de pesos: un modelo base (D:/ai/merge/base_sharded) y un segundo modelo (D:/ai/merge/orion_sharded). La configuración YAML declara `merge_method: moe_della`, lo que implica materializar una estructura de mezcla de expertos a partir de los pesos fusionados, con `density: 0.9`, `epsilon: 0.09`, `lambda: 1.0`, `router_strategy: della`, `blend_experts: true`, `normalize_weights: false`, `normalize_router: true` y `rescale: true`. Los pesos por componente son 0,5 para `embed_tokens` y 0,05 para atención, MLP y el valor por defecto, lo que da un peso muy superior a la tabla de embeddings frente al resto de la red.

La innovación metodológica es el propio método MoE DELLA, que la model card asocia al artículo arXiv:2406.11617. DELLA-Merging reduce la interferencia entre modelos fusionados mediante un muestreo basado en magnitud de los parámetros; la variante MoE aplicada aquí convierte esa fusión en una mezcla de expertos con un router. El tokenizador se construye con `source: union` y la plantilla de chat se toma de forma automática (`chat_template: auto`), por lo que la plantilla conversacional depende de la que expusieran los modelos de origen.

El problema principal es la trazabilidad: los dos modelos de origen se referencian mediante rutas locales de Windows (D:/ai/merge/...), no mediante identificadores públicos de Hugging Face. No es posible, por tanto, auditar qué modelos se fusionaron, con qué datos se entrenaron, ni reproducir la fusión. El autor tampoco documenta número de tokens, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

Las capacidades están declaradas por las etiquetas del repositorio, no verificadas con evaluaciones publicadas:

- Generación de texto conversacional (etiqueta `conversational` y `chat_template: auto`).
- Procesamiento conjunto de imagen y texto (`pipeline: image-text-to-text`), lo que implica una torre de visión y un proyector hacia el modelo de lenguaje, según el tipo Gemma4ForConditionalGeneration.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo "thinking", audio u otras capacidades especiales: no disponible.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere que puede desplegarse en Inference Endpoints de Hugging Face si el tamaño lo permite.

## Casos de uso

Dado que no existen evaluaciones públicas del modelo, los casos siguientes son escenarios plausibles según su tipo arquitectónico (multimodal de 26B), no aplicaciones validadas:

- Prototipado de asistentes conversacionales multimodales: al aceptar entradas de imagen y texto, puede emplearse para responder preguntas sobre capturas de pantalla, diagramas o fotografías dentro de un chat, siempre que se verifique antes la plantilla de chat efectiva.
- Descripción y etiquetado semiautomático de imágenes: generación de pies de foto o descripciones estructuradas en un pipeline de enriquecimiento de catálogos, con revisión humana posterior por el riesgo de alucinación.
- Extracción de información de documentos escaneados: combinación de OCR visual y razonamiento textual para volcar campos concretos (facturas, formularios) a JSON, supeditado a que el modelo soporte salidas estructuradas.
- Investigación en técnicas de fusión de modelos: el repositorio sirve como caso de estudio reproducible parcialmente para comparar MoE DELLA frente a otras estrategias de mergekit (TIES, DARE, SLERP) sobre una misma base.
- Evaluación comparativa de merges: útil como punto de partida para medir si una fusión MoE degrada o preserva las capacidades del modelo base en tareas controladas.
- Generación de asistentes de accesibilidad: descripción de imágenes para usuarios con discapacidad visual, con la advertencia de que la ausencia de benchmarks impide garantizar fiabilidad.
- Base para ajuste fino posterior (LoRA/QLoRA): al ser un modelo abierto en safetensors, puede reentrenarse, aunque la licencia no disponible impide confirmar que el uso comercial esté permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación en la model card, en la información de Hugging Face ni en los resultados de búsqueda web consultados. Tampoco existe comparación con el modelo base ni con el modelo fusionado, por lo que no es posible cuantificar si la fusión mejora o degrada el rendimiento original.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (25,999B) y del tamaño del repositorio (52,0 GB), no medidas publicadas por el autor:

- Peso en bfloat16: aproximadamente 52 GB solo de pesos, más caché KV. Requiere al menos una GPU de 80 GB (H100 80 GB, A100 80 GB) o dos A100 40 GB con tensor paralelismo, y algo más de margen si se procesan imágenes con resolución elevada.
- Peso en int8: aproximadamente 26 GB de pesos; encaja en A100 40 GB, L40S 48 GB o A6000 48 GB, pero no en tarjetas de 24 GB sin offloading.
- Peso en int4: aproximadamente 13-15 GB de pesos, lo que permitiría ejecución en RTX 4090, RTX 3090 o RTX 4080 de 24 GB/16 GB con margen variable según la longitud de contexto y el tamaño de las imágenes. No hay cuantizaciones publicadas en el repositorio, por lo que habría que generarlas.
- GPU recomendadas: H100 80 GB o A100 80 GB para bf16; L40S/A6000 para int8; RTX 4090/3090 para int4.
- Cabe en GPU de consumo: solo tras cuantización a 4 bits y con contexto reducido. En bf16 es inviable en tarjetas consumer.
- Opciones de despliegue: transformers (librería declarada), TGI y vLLM para safetensors; llama.cpp u Ollama únicamente si se generan GGUF, que no existen en el repositorio. La estructura derivada de una fusión MoE puede no estar soportada por todos los motores de inferencia, por lo que conviene validar la carga antes de dimensionar infraestructura.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

No hay comparación fiable posible: los modelos de origen de la fusión no son públicos (se referencian como rutas locales) y no existen benchmarks del modelo. La tabla siguiente contrasta únicamente datos estructurales frente a modelos abiertos de la misma franja de parámetros, a modo de referencia de categoría, no de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Czarj/Z_Basorion_0.1 | 25,999B (26B) | no disponible | no disponible | safetensors en HF, 0 descargas |
| Mistral Small 3 (24B) | 24B | 32.000 tokens | Apache 2.0 | pesos abiertos en HF |
| Gemma 3 27B | 27B | 128.000 tokens | licencia Gemma (uso comercial con condiciones) | pesos abiertos en HF |
| Qwen2.5-32B | 32B | 128.000 tokens | Apache 2.0 | pesos abiertos en HF |

Comparativa de rendimiento: no disponible. Los datos de los modelos de referencia corresponden a sus especificaciones públicas habituales y se incluyen solo como marco de referencia de categoría.

## Limitaciones y advertencias

- Procedencia opaca: los modelos fusionados se referencian mediante rutas locales (D:/ai/merge/base_sharded y D:/ai/merge/orion_sharded), no mediante repositorios públicos. No se puede verificar qué modelos son ni bajo qué licencias se distribuyen.
- Licencia no disponible: sin licencia declarada no hay autorización explícita de uso comercial, modificación o redistribución. En producción esto es un bloqueante legal, no un detalle.
- Sin benchmarks: no existe ninguna evaluación publicada; no se puede afirmar que la fusión conserve las capacidades del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño y no mitigado por ninguna técnica documentada (no se menciona RLHF, DPO ni filtrado de datos).
- Sesgos: no documentados, pero al desconocerse los datos de entrenamiento no puede descartarse la herencia de sesgos de los modelos de origen.
- Idiomas y contexto desconocidos: no se declara cobertura idiomática ni ventana de contexto, lo que impide planificar prompts o presupuestos de tokens.
- Adopción nula: 0 descargas y 0 "me gusta" en la fecha de consulta, lo que implica ausencia de validación por parte de la comunidad.
- Compatibilidad de inferencia incierta: las arquitecturas derivadas de fusiones MoE pueden no cargar en todos los motores; conviene probar la carga y verificar la plantilla de chat antes de integrarlo.
- Fecha de publicación atípica (29 de septiembre de 2026) y ausencia de documentación adicional que aclare el estado del proyecto.
- La model card no incluye información de seguridad, filtros de contenido ni evaluación de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Czarj/Z_Basorion_0.1
- Perfil del autor: https://huggingface.co/Czarj
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Artículo citado para el método MoE DELLA: https://arxiv.org/abs/2406.11617
- Resultados de búsqueda web: no se ha encontrado ninguna referencia, análisis o benchmark del modelo Czarj/Z_Basorion_0.1 en las búsquedas realizadas. Los resultados obtenidos (Patreon sobre Z-Image, Hugging Bay, Google, la portada de Hugging Face y el perfil del autor) no aportan información sobre este modelo.
