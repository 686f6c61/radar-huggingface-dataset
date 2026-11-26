# MidasRev/Hy4-flash-NVFP4-abliterated

## Resumen

Hy4-flash-NVFP4-abliterated es una variante modificada del modelo Hy4-flash, un transformer de tipo Mixture of Experts (MoE) con aproximadamente 220.000 millones de parametros totales. Lo publica el usuario MidasRev en Hugging Face como un derivado del checkpoint cuantizado en NVFP4 de Avifenesh (Avifenesh/Hy4-flash-NVFP4). La modificacion consiste en una "abliteracion" (eliminacion de direcciones de rechazo) aplicada a nivel de pesos mediante una tecnica propia denominada BRUH-Runtime, que ortogonaliza de forma permanente las proyecciones que escriben en el stream residual.

El modelo base Hy4-flash esta disenado para generacion de texto e inferencia rapida en formato NVFP4 (FP4 de 4 bits con escalado por bloques), lo que reduce el peso de los expertos a unos 77,84 GiB y permite servir un modelo de gran tamano en hardware mas modesto que un BF16 equivalente. La abliteracion afecta a las proyecciones de atencion y a los expertos enrutados y compartidos de las capas 1 a 41, ademas de la capa de embeddings y del modulo engram_layer.

La relevancia de esta ficha es doble: por un lado documenta un modelo de 220B en cuantizacion de 4 bits con un formato de pesos poco habitual (NVFP4 empaquetado en safetensors), y por otro ilustra una practica creciente de publicacion de variantes "abliterated" que eliminan los comportamientos de rechazo de un modelo alineado. No hay informacion publica sobre licencia, idiomas ni benchmarks en la model card, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con capas de atencion y expertos enrutados y compartidos; incluye modulo engram_layer |
| Parametros totales | 220.251.201.958 (~220,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 con escalado por bloques, 4 bits) para expertos; FP8 E4M3 con bloques 128x128 para proyecciones de atencion; pesos de embeddings en formato original |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 161,1 GB; expertos NVFP4 77,84 GiB + shards Engram 61,47 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 41 capas principales (se referencian las capas 1..41) y un modulo adicional denominado engram_layer con 4 shards. Cada capa contiene atencion con `self_attn.o_proj` y un bloque MLP con expertos enrutados (`mlp.routed_expert_up_proj`, 512 expertos NVFP4) y expertos compartidos (`mlp.shared_experts.down_proj`). El checkpoint base esta cuantizado en NVFP4 mediante modelopt, con escalado por bloques para los expertos y FP8 E4M3 con bloques 128x128 en las proyecciones de atencion.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. La innovacion tecnica documentada en esta variante es la abliteracion por ortogonalizacion de pesos (BRUH-Runtime): se aplica una transformacion ortogonal permanente a todas las proyecciones que escriben en el stream residual, con `alpha=1.25`, `norm_preserving=True` y `sandwich_norm_compensated=True`. Las proyecciones afectadas son `self_attn.o_proj` (41 capas, de FP8 a ortogonalizacion y requantizacion a FP8), `mlp.routed_expert_up_proj` (41 capas, todos los 512 expertos), `mlp.shared_experts.down_proj` (41 capas), `engram_layer.value_proj` (4 capas) y `embed_tokens` (1 capa). Los shards NVFP4 de expertos y Engram se mantienen byte a byte identicos al modelo base.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Hy4-flash.
- Capacidad de codigo y matematicas: no documentada explicitamente en la model card, pero esperable en un modelo de esta familia; no hay datos que lo confirmen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidad especial de "abliteracion": el modelo ha sido modificado para eliminar direcciones de rechazo en los pesos, lo que altera el comportamiento de seguridad respecto al modelo base.
- Modo thinking / vision / audio: no disponible.

## Casos de uso

- Investigacion sobre seguridad y alineamiento: el modelo sirve para estudiar el efecto de la ortogonalizacion de pesos sobre las respuestas de rechazo, comparando con el checkpoint base Avifenesh/Hy4-flash-NVFP4 en el mismo hardware.
- Evaluacion de cuantizacion NVFP4 a gran escala: permite medir la degradacion de calidad de un MoE de 220B servido en 4 bits frente a su version de mayor precision, en tareas de generacion y razonamiento.
- Despliegue de un modelo de gran tamano en infraestructura limitada: los 77,84 GiB de expertos NVFP4 mas los shards Engram permiten servir el modelo en nodos con menos VRAM que un BF16 equivalente, usando kernels compatibles con NVFP4.
- Generacion de texto sin restricciones de contenido para entornos controlados (red teaming interno, pruebas de robustez de filtros), asumiendo los riesgos de la abliteracion.
- Benchmarking de latencia y throughput de un MoE de 220B con expertos en FP4, para comparar con alternativas cuantizadas en INT4/FP8.
- Estudio de la arquitectura engram_layer y de los expertos compartidos: el checkpoint permite analizar como la abliteracion afecta a modulos especificos (atencion, expertos enrutados, expertos compartidos, embeddings).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 161,1 GB; los expertos NVFP4 suman 77,84 GiB y los shards Engram 61,47 GiB. Se necesita un nodo multi-GPU con al menos ~160 GB de memoria agregada para cargar el checkpoint completo, mas overhead de activaciones y KV cache.
- GPU recomendadas: H100 (80 GB) en configuracion multi-GPU (2-4 unidades), A100 80 GB, o GPUs con soporte de NVFP4 (arquitecturas Blackwell, como B200) para aprovechar los kernels nativos de FP4.
- Consumer GPU: no cabe en una unica GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Requiere al menos 2-3 GPUs de 80 GB o varias GPUs de consumo con offloading, lo que degradaria gravemente el throughput.
- Opciones de despliegue: no hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI. El tag "bruh-runtime" sugiere un runtime propio para la abliteracion; el formato NVFP4 requiere kernels especificos (modelopt / TensorRT-LLM o similar) que no se detallan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MidasRev/Hy4-flash-NVFP4-abliterated | 220,3 B (MoE) | no disponible | NVFP4 + FP8 | no disponible | Hugging Face, 0 descargas |
| Avifenesh/Hy4-flash-NVFP4 (base) | 220,3 B (MoE) | no disponible | NVFP4 + FP8 | no disponible | Hugging Face |
| Hy4-flash (original, sin cuantizar) | no disponible | no disponible | BF16 (presumiblemente) | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteracion elimina las direcciones de rechazo del modelo base, por lo que puede generar contenido que el modelo original rechazaria; no es apto para produccion orientada al publico sin filtros externos.
- No hay informacion sobre licencia, lo que impide determinar si el uso comercial esta permitido; tratar como uso restringido hasta confirmacion.
- No se declaran idiomas soportados; el rendimiento multilingue es desconocido.
- No hay benchmarks publicados, por lo que la calidad real tras la cuantizacion NVFP4 y la abliteracion no esta verificada.
- Riesgo de alucinacion no cuantificado; al ser un modelo de 220B en 4 bits, la degradacion respecto al original puede ser mayor en tareas de precision.
- El formato NVFP4 requiere hardware y kernels especificos; la portabilidad a stacks comunes (llama.cpp, Ollama) es dudosa.
- El modelo tiene 0 descargas y 0 likes, sin validacion de la comunidad; la reproducibilidad de la abliteracion depende del runtime BRUH, no publicado en la informacion disponible.
- El tag "abliterated" y la modificacion de pesos pueden violar los terminos de uso del modelo base si estos lo prohiben; verificar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MidasRev/Hy4-flash-NVFP4-abliterated
- Modelo base: https://huggingface.co/Avifenesh/Hy4-flash-NVFP4
