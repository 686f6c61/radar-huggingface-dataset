# eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot

## Resumen

Este repositorio, publicado por el usuario eraiko, no es un modelo completo en el sentido habitual, sino un conjunto de checkpoints para ComfyUI derivados de Qwen3-VL-32B. Concretamente, contiene dos variantes de un encoder de condicionamiento para el pipeline H3 (BF16 e INT8 ConvRot) y cinco "colas" de generación opcionales (capas 50-63 mas la norma final y la LM head). El encoder incluye el embedding de Qwen3-VL, las capas de lenguaje 0 a 49 y la torre de visión completa, porque H3 consume el estado oculto sin normalizar tras la capa 49. Los pesos proceden de `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic`, una variante "abliterated" y sin censura del modelo Qwen3-VL-32B.

La relevancia de esta ficha es doble. Por un lado, documenta un caso poco frecuente de despliegue: pesos divididos en encoder y cola de generación, con las capas 50-63 cargadas temporalmente y descargadas después de generar, mientras el CLIP de condicionamiento permanece intacto. Por otro, muestra una cadena de cuantización poco habitual (INT8 ConvRot con group size 256, matrices aprendidas por filas, escalas FP32 y descriptores de cuantización propios de ComfyUI) junto a una variante NVFP4/AWQ de la cola del modelo Instruct.

El repositorio ocupa 128,9 GB e incluye además dos colas derivadas del Qwen3-VL-32B-Instruct original, lo que permite combinar un encoder "uncensored" con una cola de generación del modelo Instruct estándar. No se han publicado resultados de benchmarks ni datos de entrenamiento, y el repositorio se registra con 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de material experimental sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión-lenguaje (familia Qwen3-VL), dividido en encoder de condicionamiento (embedding + capas de lenguaje 0-49 + torre de visión) y cola de generación (capas 50-63 + norma final + LM head) |
| Parametros totales | 32B nominales (Qwen3-VL-32B); el encoder BF16 contiene 902 tensores |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, INT8 ConvRot (group size 256), NVFP4/AWQ (solo en la cola del modelo Instruct) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic |
| Libreria declarada | comfyui (no es un repositorio de generacion de Transformers completo) |
| Tamano del repositorio | 128,9 GB |
| Pipeline | image-text-to-text |
| Fecha de publicacion registrada | 2026-09-19 |
| Descargas / likes en el momento de la consulta | 0 / 0 |

Ficheros incluidos, con los datos declarados por el autor:

| Archivo | Familia de origen | Formato | Tamano | SHA-256 |
|---|---|---|---|---|
| qwen3vl_32b_h3_ultra_uncensored_heretic_bf16.safetensors | Ultra Heretic | BF16, 902 tensores | 51.506.295.440 bytes (47,97 GiB) | bbcd92a732e911cfafd86960e0e26aacc6efe949e02f16a9641f201c62984860 |
| qwen3vl_32b_h3_ultra_uncensored_heretic_int8_convrot.safetensors | Ultra Heretic | INT8 ConvRot, 1.604 tensores | 26.363.476.151 bytes (24,55 GiB) | d84547412144b7c50a6ec77437a889b869d3ace88da77ef1775d3d2a4901c192 |
| qwen3vl_32b_h3_generation_tail_50_63_int8_convrot.safetensors | Ultra Heretic | INT8 ConvRot, 354 tensores | 7.609.128.707 bytes (7,09 GiB) | b5bb9bb8dc87cf11cbee241a2d95d6d42fe52cf695ed26c093ac321f31160b20 |
| qwen3vl_32b_h3_ultra_uncensored_heretic_generation_tail_50_63_bf16.safetensors | Ultra Heretic | BF16 | 15.208.606.776 bytes (14,16 GiB) | no disponible |
| qwen3vl_32b_h3_instruct_generation_tail_50_63_int8_convrot.safetensors | Qwen3-VL-32B-Instruct | INT8 ConvRot | 7.609.128.659 bytes (7,09 GiB) | no disponible |
| qwen3vl_32b_h3_instruct_generation_tail_50_63_bf16.safetensors | Qwen3-VL-32B-Instruct | BF16 | 15.208.606.744 bytes (14,16 GiB) | no disponible |
| qwen3vl_32b_h3_instruct_generation_tail_50_63_nvfp4_awq.safetensors | Qwen3-VL-32B-Instruct | NVFP4/AWQ con norma y LM head en BF16 | 5.396.902.102 bytes (5,03 GiB) | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de la familia Qwen3-VL, con una torre de visión y un decodificador de lenguaje. La particularidad de este repositorio es el troceado del modelo: el encoder de condicionamiento conserva el embedding de tokens, las capas de lenguaje 0 a 49 y la torre de visión completa, y omite deliberadamente las capas 50 a 63, la norma final de lenguaje y la LM head. El motivo es que el pipeline H3 consume el estado oculto sin normalizar a la salida de la capa 49, de modo que las capas superiores no intervienen hasta que se conecta una cola de generación.

En la variante INT8 ConvRot del encoder se declaran 350 matrices de lenguaje cuantizadas a INT8 con esquema "row-wise ConvRot" y group size 256, un embedding de tokens cuantizado de forma tensorwise, 551 tensores que se conservan en BF16 (torre de visión y todas las normas), 351 escalas de pesos en FP32 y 351 descriptores de cuantización de ComfyUI. La cola INT8 ConvRot equivalente contiene las capas 50-63, la norma final y la LM head, con 98 matrices INT8 ConvRot, una LM head también INT8 ConvRot evaluada por bloques por el nodo, group size 256 y 57 tensores retenidos exactamente en BF16. La cola no duplica el embedding ni la torre de visión: se carga temporalmente y se descarga tras generar, dejando intacto el CLIP de condicionamiento conectado.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el ajuste del modelo base empleó RLHF, DPO u otra técnica. El único dato de procedencia es que el modelo de partida es una variante etiquetada como "uncensored" y "heretic" publicada por llmfan46, lo que en la terminología habitual implica una ablación de las direcciones de rechazo (abliteration) en lugar de un ajuste supervisado convencional. Tampoco se documentan innovaciones de decodificación especulativa, atención lineal ni mecanismos similares.

## Capacidades

- Generación de texto y de lenguaje natural en inglés; el pipeline declarado es image-text-to-text, por lo que el modelo completo cubre entrada de imagen y salida de texto.
- Comprensión de imágenes mediante la torre de visión completa incluida en el encoder de condicionamiento.
- Condicionamiento de pipelines generativos en ComfyUI: el encoder produce las representaciones que consume el nodo guía de H3.
- Prompt enhancement: el nodo "H3 Prompt Enhancer (optional CLIP tail)" puede reescribir un prompt cargando la cola 50-63 sobre el encoder 0-49, o bien usar el método generate() ordinario del CLIP ya conectado si este es un modelo completo.
- Generación de texto y visión-lenguaje autónoma mediante el nodo "H3 Qwen VL Generate Text (Standalone)" del repositorio ethanfel/ComfyUI-H3-Qwen3VL-TextGen, que combina encoder 0-49 y cola 50-63 y admite un lote de imágenes opcional.
- Capacidad de combinación cruzada: se puede emparejar el encoder "uncensored" con colas derivadas del Qwen3-VL-32B-Instruct estándar, en BF16, INT8 ConvRot o NVFP4/AWQ.
- Comportamiento sin censura: el ajuste de partida elimina los rechazos típicos del modelo alineado, lo que amplía el rango de peticiones aceptadas.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades de audio o modo "thinking" explícito: no documentadas en la información proporcionada.

## Casos de uso

- Condicionamiento de generación visual en ComfyUI: se coloca el encoder 0-49 en `ComfyUI/models/text_encoders/H3/`, se selecciona con `CLIPLoader` usando el tipo de text-encoder compatible con H3 y se conecta al nodo guía habitual. Es el uso principal para el que se publican estos pesos.
- Reescritura de prompts antes de la generación: el nodo "H3 Prompt Enhancer" carga la cola 50-63 solo durante la mejora del prompt, devuelve el texto enriquecido y el CLIP sin modificar, de modo que el prompt final es más descriptivo sin coste de memoria permanente.
- Generación de texto y descripción de imágenes fuera del flujo de difusión: instalando ComfyUI-H3-Qwen3VL-TextGen, el par encoder + cola funciona como generador local de propósito general con entrada de imagen, útil para etiquetado o captioning de lotes de imágenes en pipelines internos.
- Despliegue en GPUs de gama alta con memoria limitada: la combinación encoder INT8 ConvRot (24,55 GiB) más cola INT8 ConvRot (7,09 GiB) reduce la huella a unos 31,6 GiB de pesos, aproximadamente la mitad que la ruta BF16 completa, lo que permite trabajar en tarjetas de 48 GB en lugar de exigir 80 GB.
- Investigación sobre cuantización: el repositorio permite comparar directamente BF16 frente a INT8 ConvRot sobre exactamente las mismas capas, con escalas FP32 y group size 256 declarados, para medir degradación perceptiva en tareas de condicionamiento visual.
- Estudio de ablation y alineación: al existir colas derivadas del modelo Instruct estándar y del fine-tune "uncensored", se puede aislar cuánto del comportamiento sin censura proviene del encoder (capas 0-49) y cuánto de la cola de generación (capas 50-63).
- Ahorro de ancho de banda y almacenamiento: quien solo necesite condicionar con H3 puede descargar únicamente el encoder INT8 de 24,55 GiB en lugar de los 128,9 GB del repositorio completo.
- Pruebas de compatibilidad en flujos existentes: sustituir el encoder de condicionamiento de un workflow H3 ya montado por la variante "uncensored" para evaluar cambios de estilo y de tolerancia a prompts sin tocar el resto del grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y la búsqueda web asociada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos eran consultas de gramática inglesa sin relación). Tampoco se declaran métricas de latencia o throughput.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas de los tamaños de fichero declarados por el autor, no medidas publicadas.

- Ruta BF16 completa (encoder 47,97 GiB + cola BF16 14,16 GiB): unos 62,1 GiB solo en pesos. Requiere una GPU de 80 GB (A100 80 GB, H100 80 GB) o memoria unificada de 96 GB o más.
- Ruta mixta BF16 + INT8 (encoder 47,97 GiB + cola INT8 7,09 GiB): unos 55,1 GiB en pesos. Sigue necesitando 80 GB, salvo que se tropiece con la memoria durante la carga.
- Ruta INT8 ConvRot completa (24,55 GiB + 7,09 GiB): unos 31,6 GiB en pesos, más el espacio de activaciones y del pipeline H3. Es la opción viable en tarjetas de 48 GB como la RTX 6000 Ada, la L40S o la A6000, y en equipos Apple con memoria unificada de 64 GB o superior.
- Ruta INT8 + cola NVFP4/AWQ (24,55 GiB + 5,03 GiB): unos 29,6 GiB en pesos. Es la combinación más ligera, pero hay que tener en cuenta que esa cola procede del Qwen3-VL-32B-Instruct y no del fine-tune "uncensored", por lo que cambia el comportamiento de generación.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar ninguna combinación completa. Dos RTX 4090 (48 GB agregados) quedan al límite con la ruta INT8 + INT8 y requieren reparto de carga entre dispositivos, algo que la información disponible no documenta para estos checkpoints.
- Despliegue: ComfyUI con `CLIPLoader` y el tipo de text-encoder compatible con H3, junto con la dependencia `comfy-kitchen` que ComfyUI fija en su versión. Para reescritura de prompts, el nodo "H3 Prompt Enhancer (optional CLIP tail)"; para generación autónoma, el repositorio ethanfel/ComfyUI-H3-Qwen3VL-TextGen instalado en `ComfyUI/custom_nodes`.
- vLLM, llama.cpp, Ollama, TGI y otros servidores de inferencia no son aplicables según la información disponible: estos ficheros son checkpoints parciales en formato ComfyUI, no un modelo completo de Transformers con configuración de generación.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Observaciones |
|---|---|---|---|---|---|
| eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot (este repositorio) | 32B nominales, repartidos en encoder 0-49 y cola 50-63 | no disponible | safetensors; BF16, INT8 ConvRot, NVFP4/AWQ en la cola Instruct | apache-2.0 | No es un modelo completo; pensado para ComfyUI y H3. 0 descargas registradas |
| llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic (modelo base) | 32B nominales | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo completo del que derivan los pesos de este repositorio; ajuste tipo abliteration sin censura |
| Qwen3-VL-32B-Instruct (origen de las colas "instruct") | 32B nominales | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Modelo alineado estándar; solo se aportan aquí sus colas 50-63 en BF16, INT8 ConvRot y NVFP4/AWQ |
| Otros modelos de visión-lenguaje de ~32B (por ejemplo, alternativas de la misma franja) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparación de rendimiento |

## Limitaciones y advertencias

- No es un modelo completo: el encoder de condicionamiento omite las capas 50-63, la norma final y la LM head. Sin una cola compatible, no puede generar texto.
- Procedencia "uncensored"/"abliterated": el modelo base ha sido modificado para reducir los rechazos, lo que implica una pérdida deliberada de barreras de seguridad y un riesgo elevado de generar contenido dañino, ofensivo o ilegal. No es adecuado para aplicaciones de cara al público sin filtrado externo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, y el ajuste "heretic" no documenta datos de entrenamiento ni metodología de evaluación.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es esperable en modelos multimodales de este tamaño, especialmente en descripción de imágenes con detalles finos.
- Cobertura de idiomas limitada al inglés según la etiqueta declarada; el comportamiento en castellano no está documentado ni garantizado.
- Longitud de contexto no documentada para estos checkpoints; el truncado en la capa 49 puede afectar a cómo se comporta el modelo con entradas muy largas.
- Compatibilidad estricta: las colas solo funcionan emparejadas con un encoder H3 compatible y con el nodo adecuado. Mezclar la cola BF16 con el encoder INT8 o usar colas del modelo Instruct cambia el comportamiento y no está validado por el autor.
- Dependencia de versión: requiere una copia actual de ComfyUI con la dependencia `comfy-kitchen` fijada; versiones distintas pueden no reconocer los descriptores de cuantización.
- Coste de hardware alto: incluso la ruta más ligera ronda los 30 GiB de pesos, por encima de cualquier GPU de consumo de 24 GB.
- Licencia: el repositorio declara apache-2.0, pero los modelos base (Qwen3-VL-32B-Instruct y el fine-tune de llmfan46) tienen sus propias condiciones. Conviene verificar los términos de cada componente antes de un uso comercial.
- Madurez: 0 descargas y 0 likes registrados, y el repositorio se publicó y actualizó el mismo día. No hay validación de la comunidad ni informes de funcionamiento.
- La model card está truncada en la información disponible (corta a mitad de la descripción del nodo standalone), por lo que pueden existir pasos de instalación adicionales no recogidos aquí.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/eraiko/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Modelo base del fine-tune: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Repositorio de nodos para generación autónoma: https://github.com/ethanfel/ComfyUI-H3-Qwen3VL-TextGen
- Papers, blogs o demos adicionales: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
