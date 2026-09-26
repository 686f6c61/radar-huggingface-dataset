# retrocool/qwen3vl-8b-int8-convrot-abliterated

## Resumen

Este repositorio contiene una compilacion cuantizada a INT8 del modelo `huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated`, preparada por el usuario retrocool para ser usada como codificador de texto y condicionamiento (text encoder) del modelo de difusion Qwen-Image 2.1 dentro de ComfyUI. No es un modelo de difusion ni un modelo de chat de proposito general: es el encoder Qwen3-VL-8B empaquetado en un unico fichero `safetensors` con metadatos de cuantizacion compatibles con ComfyUI.

El modelo fuente, a su vez, deriva de `Qwen/Qwen3-VL-8B-Instruct`, un transformer vision-lenguaje de aproximadamente 8.000 millones de parametros, al que se aplico abliteracion sobre la parte de texto (no sobre la torre de vision) para eliminar los comportamientos de rechazo. Sobre esa base, retrocool ha fusionado los shards originales y ha aplicado cuantizacion INT8 con escalado por filas (row-wise) y la tecnica ConvRot con tamano de grupo 256.

Su relevancia es practica y acotada: ofrece una alternativa cuantizada y sin censura al encoder estandar de Qwen3-VL en flujos de Qwen-Image 2.1, reduciendo el peso del encoder y permitiendo ejecutarlo en GPUs de consumo. El autor indica que lo ha probado con exito en ComfyUI y que en sus comparaciones lado a lado ha producido en ocasiones resultados ligeramente preferibles al encoder estandar, aunque senala que la calidad y la adherencia al prompt son subjetivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje de la familia Qwen3-VL (detalle de capas no disponible) |
| Parametros totales | 8B (segun la denominacion y el modelo base `Qwen/Qwen3-VL-8B-Instruct`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 con escalado por filas (row-wise), ConvRot, tamano de grupo ConvRot 256, metadatos de cuantizacion ComfyUI |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fichero `qwen3vl_8b_int8_convrot_abliterated.safetensors`, repositorio de 11,0 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Instruct, un modelo vision-lenguaje con una torre visual y un modelo de lenguaje, sobre el que huihui-ai aplico abliteration unicamente en la porcion de texto segun la model card original. La model card de este repositorio no detalla el numero de capas, dimensiones de atencion ni datos de entrenamiento del modelo base, por lo que esa informacion no esta disponible.

retrocool no ha realizado entrenamiento, ajuste fino ni abliteration adicional. El proceso aplicado consiste en dos pasos: primero, la fusion de los shards en un unico checkpoint mediante `safetensors.torch` (`load_file` iterando sobre `model-*.safetensors` y `save_file`); segundo, la cuantizacion con la herramienta `ctq` usando `--int8`, `--scaling_mode row`, `--convrot`, `--convrot-group-size 256`, `--comfy_quant` y `--save-quant-metadata`. Se excluyeron de la cuantizacion las capas de embeddings, la normalizacion final, la primera y la ultima capa del modelo de lenguaje, los pesos de normalizacion Q/K, los pesos de layer-norm y la torre visual completa, lo que implica que esos componentes conservan mayor precision que el resto.

## Capacidades

- Generacion de embeddings de condicionamiento (text encoder) para flujos de Qwen-Image 2.1 en ComfyUI.
- Comprension de imagen y texto heredada del modelo base Qwen3-VL-8B-Instruct (la torre visual se mantiene fuera de la cuantizacion INT8).
- Generacion de texto y razonamiento conversacional como capacidad latente del modelo base, aunque el artefacto empaquetado no esta pensado ni documentado para ese uso.
- Abliteration aplicada sobre el componente de texto, orientada a reducir los rechazos del modelo original.
- Soporte de tool calling, agentes, multilingue u otras capacidades especificas: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes con Qwen-Image 2.1 en ComfyUI: colocar el fichero en `ComfyUI/models/text_encoders/` y cargarlo con un nodo CLIPLoader configurado con `type: qwen_image`, sustituyendo al encoder estandar.
- Condicionamiento de prompts en workflows de Qwen-Image: el encoder transforma el texto del prompt en las representaciones que alimentan al modelo de difusion, por lo que se usa como primer eslabon del pipeline.
- Experimentacion con encoders alternativos: al ser una variante abliterada y cuantizada del encoder oficial, permite comparar lado a lado la adherencia al prompt y el estilo de imagen resultante frente al encoder estandar.
- Flujos creativos con prompts que el encoder original podria rechazar o suavizar, aprovechando la abliteration aplicada al componente de texto.
- Despliegue en equipos con VRAM limitada: al estar cuantizado a INT8 (repositorio de 11 GB), reduce los requisitos de memoria del encoder frente a una version en BF16/FP16, facilitando su ejecucion en GPUs de consumo.
- Investigacion sobre cuantizacion ConvRot: sirve como ejemplo reproducible (la model card incluye los comandos de fusion y cuantizacion) para estudiar el impacto de INT8 y ConvRot en la calidad del condicionamiento.
- Integracion en pipelines de generacion por lotes: al ser un unico fichero `safetensors`, simplifica la carga y distribucion del encoder en entornos automatizados de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona pruebas cualitativas del autor, que afirma haber probado el checkpoint con exito en Qwen-Image 2.1 y haber obtenido en ocasiones resultados ligeramente preferibles frente al encoder estandar, sin aportar metricas.

## Requisitos de hardware

- El repositorio ocupa 11,0 GB, con pesos en INT8 mas la torre visual y las capas excluidas en mayor precision.
- VRAM estimada para inferencia: en torno a 11-13 GB, a falta de datos oficiales del autor.
- Cabe en GPU de consumo con 16 GB o mas (por ejemplo RTX 4080, RTX 4090, RTX 4060 Ti de 16 GB); en GPUs de 24 GB (RTX 3090, RTX 4090) opera con holgura.
- GPUs profesionales como A100 o H100 son compatibles, aunque sobredimensionadas para un encoder de 8B en INT8; la cuantizacion esta pensada precisamente para hardware menor.
- Despliegue principal: ComfyUI mediante CLIPLoader con `type: qwen_image`. Otros entornos (vLLM, llama.cpp, Ollama, TGI) no estan contemplados en la informacion disponible, ya que el fichero es un encoder con metadatos ComfyUI, no un modelo generativo estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso previsto |
|---|---|---|---|---|---|
| retrocool/qwen3vl-8b-int8-convrot-abliterated | 8B | no disponible | INT8 ConvRot | apache-2.0 | Text encoder para Qwen-Image 2.1 en ComfyUI |
| huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated | 8B | no disponible | Sin cuantizar (shards originales) | apache-2.0 | Modelo VL abliterado de proposito general |
| Qwen/Qwen3-VL-8B-Instruct | 8B | no disponible | Sin cuantizar | apache-2.0 | Modelo VL instructivo de proposito general |

## Limitaciones y advertencias

- La abliteration elimina los comportamientos de rechazo del componente de texto, por lo que el modelo puede generar o facilitar contenido que el original evitaba; conviene revisar el uso en produccion.
- La cuantizacion INT8 con ConvRot puede introducir una perdida de calidad respecto al checkpoint original en BF16/FP16; el autor solo aporta impresiones subjetivas, no metricas.
- Los casos excluidos de la cuantizacion (embeddings, normalizacion, capas primera y ultima del LM, Q/K norm, layer-norm y torre visual) permanecen en mayor precision, lo que explica en parte el tamano de 11 GB.
- No esta documentado como modelo de chat o de proposito general en este formato; usarlo fuera de ComfyUI o de Qwen-Image 2.1 puede requerir conversion adicional.
- No hay informacion sobre idiomas soportados, sesgos, datos de entrenamiento ni riesgos de alucinacion especificos de este checkpoint.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- La licencia es apache-2.0, pero la model card remite a los repositorios originales para los terminos completos; conviene verificar las condiciones de los modelos base antes de un uso comercial.
- El autor advierte que la calidad de imagen y la adherencia al prompt son subjetivas y dependen del workflow.

## Enlaces

- HuggingFace: https://huggingface.co/retrocool/qwen3vl-8b-int8-convrot-abliterated
- Modelo fuente abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated
- Modelo base original: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
