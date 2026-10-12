# muhamad-geosurge/invert-polarity-f65e10a8-d531-42c1-a6b2-6e55e960d45c

## Resumen

Este repositorio contiene un ajuste fino (finetune) del modelo multimodal google/gemma-4-E4B, publicado por el usuario muhamad-geosurge bajo el identificador invert-polarity-f65e10a8-d531-42c1-a6b2-6e55e960d45c. El peso real declarado en el repositorio es de 7.518.082.346 parametros (aproximadamente 7,5B) en formato safetensors, lo que coincide con el recuento del modelo base E4B cuando se incluyen las tablas de embeddings (8B con embeddings, 4,5B efectivos).

Gemma 4 es la familia de modelos abiertos de Google DeepMind, con variantes densas y MoE en cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B), ventana de contexto de hasta 256K tokens en los modelos medianos y 128K en los pequenos, y soporte multilingue en mas de 140 idiomas. La variante E4B es multimodal (texto, imagen y audio de entrada, texto de salida) y esta orientada a ejecucion en dispositivo.

La relevancia de este repositorio concreto es limitada: no incluye model card propia (el README replica el de la familia Gemma 4), no documenta el dataset ni el procedimiento del ajuste fino, y acumula 0 descargas y 0 likes. Debe tratarse, por tanto, como un experimento de finetune sin evaluacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con atencion hibrida (sliding window local de 512 tokens + atencion global, capa final siempre global), RoPE proporcional (p-RoPE) y Per-Layer Embeddings (PLE); heredada de google/gemma-4-E4B |
| Parametros totales | 7.518.082.346 (segun safetensors del repositorio); la ficha del modelo base declara 4,5B efectivos y 8B con embeddings |
| Parametros activos | No aplica: E4B es un modelo denso, no MoE |
| Longitud de contexto | 128K tokens (modelo base E4B de la familia Gemma 4) |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene safetensors; no se documentan GGUF, AWQ, GPTQ ni otras variantes cuantizadas |
| Idiomas soportados | Mas de 140 idiomas segun la documentacion de la familia Gemma 4; no se especifica el alcance real de este finetune |
| Licencia | apache-2.0 (el enlace de licencia de la model card apunta a la licencia especifica de Gemma 4) |
| Formato de pesos | safetensors |
| Modalidades | Entrada de texto, imagen y audio; salida de texto (pipeline declarado: any-to-any) |
| Tamano del repositorio | 15,1 GB |
| Fecha de creacion / actualizacion | 2026-10-12 / 2026-10-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E4B: un transformer decoder-only con atencion hibrida que intercala capas de atencion local con ventana deslizante de 512 tokens y capas de atencion global, garantizando que la ultima capa sea global. Las capas globales emplean claves y valores unificados y RoPE proporcional para reducir el coste de memoria en contextos largos. El modelo incorpora Per-Layer Embeddings (PLE), que asignan a cada capa del decodificador su propia tabla de embeddings por token; estas tablas son grandes pero solo se usan para consultas rapidas, de ahi que el numero de parametros efectivos (4,5B) sea inferior al total (8B con embeddings). El vocabulario es de 262K tokens y el modelo cuenta con un encoder de vision de aproximadamente 150M de parametros y un encoder de audio de aproximadamente 300M.

No se dispone de informacion sobre el proceso de entrenamiento de este finetune concreto: se desconoce el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos y si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documenta que significa "invert-polarity" ni que comportamiento pretende modificar respecto al modelo base. La model card incluida es una copia de la de la familia Gemma 4, sin seccion especifica del autor.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables, heredados de la familia Gemma 4.
- Comprension multimodal: entrada de imagen con soporte de relacion de aspecto y resolucion variables, y entrada de audio nativa en las variantes E2B, E4B y 12B.
- Salida exclusivamente de texto (el modelo no genera imagen ni audio).
- Soporte nativo de function calling, orientado a flujos agenticos y de multiples pasos.
- Soporte nativo del rol system, lo que permite conversaciones mas estructuradas y controlables.
- Capacidades multilingues declaradas para la familia (mas de 140 idiomas), sin verificacion especifica para este finetune.
- Ventana de contexto de 128K tokens en el modelo base, adecuada para documentos largos y conversaciones multi-turno extensas.
- Orientacion a ejecucion en dispositivo y equipos de gama de consumo, propia de la variante E4B.
- Capacidades reales del finetune: no documentadas. No hay evaluacion, ejemplos ni descripcion del cambio de comportamiento respecto a google/gemma-4-E4B.

## Casos de uso

- Asistente multimodal en local: procesamiento de capturas de pantalla, fotografias o diagramas junto con preguntas en texto, ejecutado en un portatil con GPU de gama alta, aprovechando el diseno on-device de la variante E4B.
- Analisis de documentos largos: resumen y extraccion de informacion de contratos, informes o transcripciones de hasta 128K tokens en una sola pasada, gracias a la ventana de contexto del modelo base.
- Transcripcion y comprension de audio: al incorporar encoder de audio nativo, puede usarse en pipelines de notas de reunion o analisis de llamadas, combinando la transcripcion con razonamiento sobre el contenido.
- Agentes con tool calling: integracion en flujos agenticos donde el modelo decide que herramienta invocar (APIs, busquedas, calculo) y encadena varios pasos, apoyandose en el soporte nativo de function calling y del rol system.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno con contexto largo y entrada de imagenes adjuntas por el usuario, desplegado en infraestructura propia por la licencia permisiva.
- Generacion y revision de codigo asistida: uso como base para tareas de autocompletado o explicacion de codigo, con la advertencia de que no hay benchmarks publicados de este finetune en HumanEval, MBPP ni similares.
- Investigacion sobre ajuste fino: el repositorio sirve como caso de estudio para estudiar el efecto de un finetune de polaridad invertida sobre un modelo base multimodal, aunque carece de evaluacion que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base menciona mejoras en benchmarks de codigo y capacidades agenticas para la familia Gemma 4, pero no incluye cifras, y el repositorio del finetune no aporta ninguna evaluacion propia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 7,5B parametros en safetensors, sin incluir cache KV ni overhead del runtime): aproximadamente 15 GB en bf16/fp16, aproximadamente 7,5 GB en int8 y aproximadamente 4 GB en int4.
- El tamano del repositorio (15,1 GB) es coherente con pesos en bf16/fp16.
- GPU de servidor: A100 40/80 GB, H100, L40S o similares para ejecucion en precision completa con contextos largos.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en bf16 con margen ajustado, y de forma holgada en cuantizacion int8 o int4. En GPUs de 8-12 GB requeriria cuantizacion agresiva no publicada en el repositorio.
- Opciones de despliegue: transformers esta declarado como libreria del repositorio y el modelo es compatible con endpoints. vLLM y TGI son opciones habituales para servir modelos de este tamano, pero no se confirman en la documentacion proporcionada.
- llama.cpp u Ollama: no hay archivos GGUF en el repositorio, por lo que requeriria conversion propia.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparación con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| invert-polarity-f65e10a8 (este repositorio) | 7,5B en safetensors (4,5B efectivos en el base) | 128K | Texto, imagen, audio de entrada; texto de salida | apache-2.0 | Finetune sin model card propia ni evaluacion; 0 descargas |
| google/gemma-4-E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio de entrada; texto de salida | apache-2.0 | Modelo base; incluye variantes preentrenada e instruction-tuned |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | apache-2.0 | Arquitectura sin encoders, proyecta parches de imagen y audio directamente al espacio de embeddings del LLM |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | 256K | Texto, imagen | apache-2.0 | MoE con 8 expertos activos de 128 totales mas 1 compartido; mayor capacidad a coste de inferencia reducido |

No se dispone de datos de otros modelos multimodales comparables (parametros, contexto, licencia) en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, pruebas cualitativas ni ejemplos de uso del finetune. No hay evidencia de que supere o iguale al modelo base.
- Model card no especifica: el README es una copia de la de la familia Gemma 4 y no describe el dataset, la metodologia ni el objetivo del ajuste. Se desconoce por completo que se ha modificado respecto a google/gemma-4-E4B.
- Riesgo de degradacion: un finetune sin evaluacion puede haber sufrido olvido catastrofico en capacidades del modelo base (razonamiento, codigo, multilingue) o alineacion defectuosa.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no se documenta ningun trabajo de mitigacion especifico.
- Sesgos: no evaluados ni documentados. La composicion del dataset de ajuste es desconocida, por lo que no puede descartarse la introduccion de sesgos nuevos.
- Idiomas: aunque la familia declara mas de 140 idiomas, el alcance multilingue real de este finetune es desconocido y depende de los datos de ajuste.
- Licencia: los tags y la model card indican apache-2.0, pero el license_link apunta a la licencia especifica de Gemma 4. Conviene verificar cual de las dos aplica antes de un uso comercial, ya que la licencia de Gemma incorpora historicamente condiciones de uso adicionales.
- Procedencia: el repositorio no incluye informacion sobre el autor ni sobre el proceso de publicacion; con 0 descargas y 0 likes carece de validacion por parte de la comunidad.
- Estado del arte temporal: la fecha de creacion declarada (2026-10-12) y el identificador arXiv de la model card (2607.02770) no han podido contrastarse en la informacion proporcionada.
- Produccion: no se recomienda su uso en entornos productivos sin una evaluacion propia previa frente al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhamad-geosurge/invert-polarity-f65e10a8-d531-42c1-a6b2-6e55e960d45c
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
