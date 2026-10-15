# qijithu/Quicksviewer-8B

## Resumen

Quicksviewer-8B es un modelo multimodal grande (LMM) publicado en HuggingFace por el usuario qijithu bajo el proyecto Quicksviewer, orientado a la comprension eficiente de video con un numero elevado de fotogramas de entrada. El modelo aborda el coste computacional de procesar secuencias de video largas: en lugar de muestrear todos los fotogramas con densidad uniforme, divide el video en "cubos" (cubes) de densidad no uniforme mediante Gumbel Softmax y aplica un remuestreo unificado a cada cubo, logrando una compresion dinamica en linea.

El modelo cuenta con 8.703.279.090 parametros (~8,7B) y combina un backbone de lenguaje de la familia Qwen con un codificador visual SigLIP ViT y un resampler temporal tipo Perceiver (64 queries, 4096 de anchura de salida, embeddings temporales absolutos de 0,1 segundos). Se distribuye en safetensors acompanado de implementacion de codigo personalizado (`custom_code`), por lo que requiere `trust_remote_code=True` en Transformers. La model card declara licencia CC BY-NC 4.0 para el modelo (no comercial) y Apache 2.0 para el codigo.

Es relevante para quien trabaja con comprension de video de muchos fotogramas, porque propone un paradigma de compresion adaptativa del contenido visual en lugar de un muestreo fijo de frames, reduciendo el coste de inferencia sobre videos extensos. Se trata, no obstante, de un modelo recien publicado, con 0 descargas y 0 "likes" en el momento de redactar esta ficha, y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LMM multimodal: backbone de lenguaje (configuracion compuesta Qwen) + codificador visual SigLIP ViT + resampler temporal tipo Perceiver; "cubing" con Gumbel Softmax |
| Parametros totales | 8.703.279.090 (~8,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (pesos distribuidos en bf16/safetensors) |
| Idiomas soportados | no disponible (los ejemplos de la model card estan en chino) |
| Licencia | Modelo: CC BY-NC 4.0 (no comercial); Codigo: Apache 2.0 |
| Formato de pesos | safetensors (`model-*.safetensors` con `model.safetensors.index.json`) |

Otros parametros documentados en la model card: resampler temporal de 64 queries y 4096 de anchura de salida, embeddings temporales absolutos aditivos de 0,1 segundos; cubing Gumbel con features de frontera SigLIP a profundidad completa (`forward_n_layers=-1`), FPQ 5, inferencia determinista (`lr_gumbel=0`) y miniatura en ultima posicion. Los pesos corresponden a una conversion del checkpoint `iter50`.

## Arquitectura y entrenamiento

Quicksviewer es un LMM que combina tres componentes: un codificador visual SigLIP ViT (implementado de forma independiente en `modeling_siglip.py`), un resampler temporal tipo Perceiver que comprime los fotogramas a un numero fijo de queries, y un backbone de lenguaje de la familia Qwen definido en una configuracion compuesta Qwen/vision. Sobre esa base se implementa `QuickSViewerForConditionalGeneration`, con soporte de `generate()` estandar, cache KV, sustitucion de embeddings visuales, parcheado de timestamps y un limite de despliegue `encode_vision()`.

La innovacion principal es el paradigma de compresion: el video se particiona en cubos de densidad no uniforme mediante Gumbel Softmax y cada cubo se remuestrea de forma unificada, de modo que el modelo concentra capacidad en las regiones con mas informacion y reduce el numero efectivo de tokens visuales de forma dinamica. El decodificado de video usa Decord con redimensionado a 980 y muestreo uniforme de fotogramas mediante `linspace`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; la model card solo indica que los pesos publicados provienen de la iteracion `iter50`.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante plantilla de chat (`chat_template.jinja`) y `apply_chat_template`.
- Comprension de imagenes: admite PIL, NumPy, tensores de Torch, rutas locales y URLs HTTP(S).
- Comprension de video: rutas locales o HTTP(S), secuencias de fotogramas ya decodificadas y control del numero de fotogramas con `max_frames` (el ejemplo de la model card usa 360).
- Modo "thinking": el procesador expone el parametro `enable_thinking` en `apply_chat_template`.
- Inferencia con cache KV (`use_cache=True`) y generacion determinista (`do_sample=False`).
- Capacidad multilingue: no documentada; los ejemplos de la model card estan en chino.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades de audio: no documentadas.

## Casos de uso

- Resumen de videos largos: el modelo puede resumir contenido con cientos de fotogramas (`max_frames=360` en el ejemplo oficial) gracias al particionado adaptativo en cubos, que evita procesar todos los frames con la misma densidad.
- Analisis forense o de vigilancia: al concentrar la capacidad en regiones de mayor densidad informativa, resulta adecuado para localizar eventos concretos dentro de grabaciones extensas sin procesar el metraje completo de forma uniforme.
- Descripcion de imagenes para accesibilidad: la ruta de imagen admite entradas desde disco o URL y devuelve descripciones en lenguaje natural, integrable en pipelines de alt-text.
- Analisis de video educativo o de formacion: transcripcion descriptiva y resumen de clases o tutoriales extensos, con marcas temporales implcitas en el parcheado de timestamps.
- Moderacion de contenido en video: clasificacion y descripcion de material subido por usuarios antes de su publicacion, aprovechando la compresion de video en linea.
- Indexado y busqueda semantica de bibliotecas multimedia: generar descripciones y resumenes por video para alimentar un indice vectorial de busqueda.
- Asistentes de edicion de video: generacion de resumenes por escena o sugerencias de montaje a partir de la descripcion del contenido, mediante la API convoluntaria `model.chat()` o la ruta explicita `processor`/`generate()`.
- Analisis de video deportivo o de rendimiento: extraccion de descripciones de acciones en secuencias largas, apoyandose en el remuestreo temporal adaptativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 17,4 GB solo para pesos (repo de 17,4 GB), mas cache KV y activaciones; se situa en torno a 20-24 GB para un uso comodo.
- VRAM estimada con cuantizacion: alrededor de 9 GB en int8 y 5 GB en int4 (estimaciones derivadas del recuento de parametros, no confirmadas por el autor).
- Memoria adicional para video: los valores de pixel permanecen en `uint8` en CPU y el modelo los normaliza por fragmentos acotados, por lo que el pico de memoria visual esta limitado, pero la memoria para embeddings de un video de hasta 360 fotogramas debe tenerse en cuenta.
- GPU recomendadas: A100 (40/80 GB) y H100 para despliegue comodo; RTX 3090 o RTX 4090 (24 GB) para bf16 con margen ajustado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB para bf16 con contexto moderado; con cuantizacion, en GPUs de 8-12 GB (estimacion).
- Opciones de despliegue: Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"` o `flash_attention_2` (validado con Transformers 4.57.1); SGLang se menciona explicitamente en la model card como adaptador recomendado para batching. No se documenta soporte de llama.cpp, Ollama ni vLLM (no hay pesos GGUF publicados).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| Quicksviewer-8B | 8,7B | no disponible | CC BY-NC 4.0 (no comercial) | safetensors (custom_code) | HuggingFace |
| Qwen2.5-VL-7B | clase 7B | no disponible | Apache 2.0 | safetensors | HuggingFace y ecosistema de inferencia amplio |
| LLaVA-Video-7B | clase 7B | no disponible | Apache 2.0 | safetensors | HuggingFace |
| InternVL2.5-8B | clase 8B | no disponible | MIT | safetensors | HuggingFace |

No es posible comparar el rendimiento en benchmarks porque el autor de Quicksviewer no publica resultados y las cifras de los modelos alternativos no se han contrastado en la informacion disponible. La diferencia mas relevante y verificable es de licencia: Quicksviewer-8B se distribuye bajo CC BY-NC 4.0, mientras que las alternativas citadas permiten uso comercial.

## Limitaciones y advertencias

- Licencia del modelo CC BY-NC 4.0: no permite uso comercial. Cualquier despliegue en produccion con fines comerciales requeriria autorizacion del titular; solo el codigo es Apache 2.0.
- Requiere `trust_remote_code=True` con implementacion de codigo personalizado, lo que implica ejecutar codigo del repositorio en el entorno local; conviene auditar los ficheros antes de su uso.
- Batching multimodal mayor que uno rechazado de forma intencionada; para servir multiples peticiones hay que integrar los features visuales a nivel de peticion (como indica la model card para SGLang).
- Truncacion rechazada de forma intencionada porque puede dividir spans visuales y de timestamp.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion: inherente a los modelos multimodales; no cuantificado en la informacion disponible.
- Idiomas soportados: no documentados; los ejemplos oficiales estan en chino, por lo que la calidad en castellano no esta verificada.
- Longitud de contexto maxima: no documentada.
- Adopcion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, y pesos correspondientes a la iteracion `iter50`, lo que sugiere una validacion externa limitada.
- Sin benchmarks publicados, no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/qijithu/Quicksviewer-8B
- HuggingFace (coleccion de modelos): https://huggingface.co/qijithu/quicksviewer
- Paper (arXiv): https://arxiv.org/pdf/2504.15270v1
- Codigo (GitHub): https://github.com/quicksviewer/quicksviewer
- Pagina del proyecto: https://quicksviewer.github.io/
