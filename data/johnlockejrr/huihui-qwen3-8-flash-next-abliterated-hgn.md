# johnlockejrr/Huihui-Qwen3.8-Flash-Next-abliterated-HGN

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-HGN es una conversión de pesos del modelo huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated (a su vez una versión "abliterated" —con el filtrado de rechazo reducido— del Qwen/Qwen3.8-Flash-Next) al formato propietario HGN v2 que consume el motor halogen-flash-server. El autor de la conversión es johnlockejrr, que publica este repositorio como conversión comunitaria, sin cualificación por parte de los autores de los proyectos upstream. No se trata de un modelo nuevo ni de un entrenamiento: es un artefacto de cuantización en formato cerrado pensado exclusivamente para GPUs AMD Strix Halo (gfx1151).

El modelo subyacente es un transformer disperso (MoE) con capacidades multimodales (torre de visión) y decodificación especulativa mediante una cabeza MTP (multi-token prediction). El repositorio incluye además una tabla n-gram de 51B parámetros en FP8 que actúa como componente auxiliar obligatorio, lo que eleva el peso total del artefacto a unos 111 GiB. Los pesos no cargan en transformers, vLLM ni llama.cpp: solo funcionan montados en el contenedor de halogen-flash-server.

La relevancia de esta ficha es doble: por un lado documenta un caso real de cuantización de clase 4 bits sobre hardware AMD consumer (Strix Halo), un nicho con muy poco soporte de tooling; por otro, advierte de las limitaciones serias de un artefacto no verificado en inferencia (el propio autor indica que no ha registrado carga ni generación en el motor destino). Su uso comercial está condicionado por la licencia Qwen Community 1.0 y por la naturaleza "uncensored" del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención lineal, hiper-conexiones, cabeza MTP y torre de visión |
| Parametros totales | no disponible (el artefacto contiene 118.785.459.868 bytes de payload; la tabla n-gram suma 51B parámetros adicionales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HGN v2 (clase 4 bits): expertos enrutados en I4R, tabla n-gram en FP8, torre de visión en BF16, mixers en Q6G64, tensores pasantes en BF16/F32 |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-1.0 (etiquetada como "other" en el Hub) |
| Formato de pesos | .hgn (HGN v2, spec 1.1.0); no compatible con safetensors, GGUF ni transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos (MoE), atención lineal en parte de sus capas, hiper-conexiones (hyper-connections) y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa. Incluye una torre de visión independiente (0,84 GiB en BF16 dentro de este repositorio) y un componente poco habitual: una tabla de búsqueda n-gram de 51B parámetros en FP8 que el motor usa como sidecar obligatorio. El checkpoint principal contiene 1.658 tensores de origen convertidos a 2.349 tensores de salida.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo original. La capa "abliterated" fue aplicada por huihui-ai sobre los pesos BF16 del modelo stock, eliminando direcciones de rechazo; este repositorio no vuelve a entrenar nada, solo cuantiza. La conversión se realizó con Quat3rnion/bf16-to-hgn (perfil v2, política `bf16-hgn-v2-rtn-nf4-signed-rms-trellis-v1`, `--ht-beam 128`, semilla 0) sobre una RTX 3090 con backend CUDA; el proceso de conversión de 231,2G valores tardó 23 minutos y 43 segundos. La verificación reporta `provenance_attested: true` y ningún tensor por encima del 5 % de error relativo, con los expertos enrutados en torno al 0,939 % y 52 de 100 familias de tensores con error exactamente cero (normas, router, estado SSM y torre de visión).

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento y matemáticas heredados del modelo base Qwen3.8-Flash-Next (no verificados en este artefacto).
- Generación de código (capacidad del modelo base, sin benchmarks publicados para esta conversión).
- Procesamiento de imagen y vídeo mediante la torre de visión opcional (`qwen38-flash-next-vision.hgn`); sin ella el motor funciona solo en texto.
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint.
- Recuperación aumentada por n-gram a través de la tabla FP8 de 51B parámetros.
- Comportamiento "uncensored": el filtrado de rechazo está significativamente reducido respecto al modelo stock.
- No se documenta soporte de tool calling, function calling ni flujos de agente multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated en condiciones controladas, comparando respuestas frente al Qwen3.8-Flash-Next stock y midiendo qué tipos de contenido aparecen tras eliminar las direcciones de rechazo.
- Despliegue local en hardware AMD Strix Halo: es uno de los pocos artefactos de este tamaño empaquetados específicamente para gfx1151 mediante halogen-flash-server, lo que lo hace útil para laboratorios con APUs AMD y sin GPUs NVIDIA.
- Evaluación de cuantización de clase 4 bits: los datos de error por familia de tensores (expertos enrutados al 0,939 %, proyecciones de atención al 0,62–0,69 %, tabla n-gram al 0,07 %) permiten estudiar la degradación de un MoE grande bajo I4R y compararla con otras técnicas de cuantización.
- Procesamiento multimodal de documentos en inglés y chino: con la torre de visión montada, el motor puede describir o extraer información de imágenes y vídeo, útil para pipelines internos de catalogación siempre que se acepte la ausencia de filtros de seguridad.
- Generación de texto creativo sin restricciones de contenido: escritura de ficción, guiones o material editorial que los modelos alineados rechazan por defecto; requiere revisión humana obligatoria antes de cualquier publicación.
- Reproducción de la cadena de conversión: el repositorio incluye el manifiesto y los comandos exactos (`bf16-to-hgn convert` y `verify`), lo que sirve como caso de referencia para validar el propio conversor en otras arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la velocidad y la calidad no se han registrado, y que la carga y generación en halogen-flash-server aún no se han documentado. Los únicos datos numéricos publicados son los errores de conversión (ver sección de arquitectura), que miden fidelidad de cuantización, no calidad del modelo.

## Requisitos de hardware

- VRAM/residencia: unos 62 GiB residentes para `model.hgn` (62,1 GiB) más la tabla n-gram mapeada en memoria (47,7 GiB adicionales). Total del repositorio: aproximadamente 111 GiB en disco.
- GPU objetivo: AMD Strix Halo con gfx1151, único backend soportado por halogen-flash-server según la model card.
- GPU consumer: no cabe en GPUs de consumo convencionales de 24 GB; está pensado para memoria unificada de APUs Strix Halo con 128 GB o más.
- Conversión (no inferencia): se realizó en una RTX 3090 (sm_86), aunque el conversor documenta CUDA como cualificado en sm_89.
- Opciones de despliegue: exclusivamente halogen-flash-server (contenedor). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| johnlockejrr/Huihui-Qwen3.8-Flash-Next-abliterated-HGN | no disponible (payload de 118,8 GB + tabla n-gram de 51B) | no disponible | .hgn (solo halogen-flash-server) | qwen-community-1.0 | 426 descargas, 2 likes |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF | 177B (según la búsqueda web) | no disponible | GGUF | qwen-community-1.0 | 339,9K descargas, 201 likes |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | no disponible | no disponible | GGUF dividido en 4 partes (16,5 GB) | qwen-community-1.0 | 8.071 descargas, 34 likes |
| Qwen/Qwen3.8-Flash-Next (stock) | no disponible | no disponible | safetensors BF16 | qwen-community-1.0 | modelo oficial |

La diferencia clave frente a las variantes GGUF es la portabilidad: los GGUF funcionan en llama.cpp y en GPUs NVIDIA/AMD convencionales, mientras que este artefacto HGN solo se carga en halogen-flash-server sobre gfx1151. A cambio, el formato HGN aplica una cuantización de clase 4 bits más agresiva sobre los expertos enrutados con verificación de error documentada.

## Limitaciones y advertencias

- Modelo "uncensored": el filtrado de seguridad está significativamente reducido y puede generar contenido sensible, controvertido o inapropiado. El autor del modelo fuente recomienda uso de investigación o controlado, revisión de salidas y evitar aplicaciones comerciales de cara al público.
- Artefacto no verificado en inferencia: la model card confirma que la carga y generación en halogen-flash-server "no se han registrado todavía", y que no se ha comparado byte a byte la salida CUDA con el backend CPU.
- Compatibilidad nula fuera de halogen-flash-server: los pesos .hgn no cargan en transformers, vLLM ni llama.cpp, lo que descarta su uso en la mayoría de stacks de producción.
- Dependencia de un sidecar obligatorio: sin `qwen38-flash-next-ngram.hgn` (47,7 GiB) el modelo no funciona; hay que mantenerlo junto al checkpoint.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otras lenguas.
- Sesgos: no se documentan evaluaciones de sesgo para esta conversión ni para el modelo abliterated de origen; la eliminación de direcciones de rechazo puede amplificar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia: Qwen Community License 1.0, que debe acompañar a cualquier copia de los pesos; conviene revisar sus restricciones de uso comercial antes de desplegar.
- Conversión comunitaria sin cualificación upstream: el autor no garantiza resultados y pide que se reporten en la pestaña de discusión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/Huihui-Qwen3.8-Flash-Next-abliterated-HGN
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Conversión oficial al formato halogen: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Conversor bf16-to-hgn: https://github.com/Quat3rnion/bf16-to-hgn
- Especificación HGN: https://github.com/jtsylve/hgn-spec
- Variante GGUF del modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Variante GGUF v2: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Ficha en abliteration.org: https://abliteration.org/models/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/qwen3.8-flash-next-abliterated/
- Distribución local de la variante v2 GGUF: https://local-ai-zone.github.io/models/huihui-qwen3-8-flash-next-abliterated-v2.html
