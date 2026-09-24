# ewin-reg/WeMM-Embedding-2B-INT8-Wide

## Resumen

WeMM-Embedding-2B-INT8-Wide es un modelo de embeddings multimodales publicado por el usuario ewin-reg en Hugging Face. Es una build de cuantizacion derivada de ewin-reg/WeMM-Embedding-2B-Quantized: los ultimos 146 tensores int4 del checkpoint original se desempaquetan y se recodifican como int8 asimetrico con escala y punto cero por bloque de 64 pesos. El resultado es que los 285 modulos cuantizados del fichero recorren una sola ruta de codigo y una sola familia de tipos de dato.

El problema que resuelve es de portabilidad, no de precision. Al eliminar la ruta empaquetada int4 (que exige desempaquetado de nibbles) y los tensores FP8, el checkpoint se ejecuta con PyTorch estandar en CPU, CUDA y MPS sin kernels especiales. El propio autor lo describe como una build de robustez y advierte de que no ofrece mejores numeros que la build INT8 previa.

Con 2.281.744.064 parametros, 1187 tensores y 2,33 GB de shards en safetensors, es un modelo de extraccion de caracteristicas orientado a recuperacion cross-modal de texto, imagen y video. No se ha publicado informacion sobre longitud de contexto, volumen de entrenamiento ni composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone de lenguaje (etiqueta qwen3_5), atencion lineal, encoder ViT y modulo merger; no se detalla mas en la informacion disponible |
| Parametros totales | 2.281.744.064 (2,28 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 asimetrico w8a8 con escala y zero point por bloque de 64 pesos en pesos y activaciones; BF16 y F32 sin cuantizar para normas, conv1d, A_log, dt_bias y sesgos |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 (el campo license del repositorio es "other" con license_name: apache-2.0) |
| Formato de pesos | safetensors (4 shards, 1187 tensores, 2,33 GB) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento (tokens, composicion del dataset, RLHF/DPO): esa informacion no esta disponible. Lo que si se detalla es la estructura de la cuantizacion sobre el checkpoint base. Cada modulo cuantizado almacena `weight` en int8, `weight_scale` en BF16 y `weight_zero` en int8, con escalas y ceros de forma `(out_features, in_features / 64)`; la tabla de embeddings se escala por fila. La reconstruccion es `(q - z) * s` sobre cada bloque de 64 pesos. El cargador selecciona la clase de modulo a partir de la clave `quant_upgraded_int4` de `config.json`, fijada a `true` en esta build.

El reparto exacto medido sobre los shards es: `language_model.embed_tokens` (1 tensor, 531,9 MB), capas attention, linear attention y `mlp.down_proj` (138 tensores, 804,8 MB), `mlp.gate_proj` y `mlp.up_proj` junto con la atencion y el MLP del ViT y el merger (146 tensores, 974,8 MB), y 332 tensores sin cuantizar en F32/BF16 (18,8 MB). El error de Frobenius relativo de cada tensor recodificado frente a su referencia es de 0,005985, 0,005861 y 0,005492 respectivamente. Para los 146 modulos actualizados la referencia es el tensor int4 ya desquantizado, de modo que ese 0,005 es lo que anade la rejilla int8 sobre la rejilla int4; el error propio de la rejilla int4 frente a precision completa es de aproximadamente un 9 por ciento en esas formas.

El fichero crece 392.840.200 bytes (unos 393 MB) respecto a la build INT8 porque int8 almacena un byte por peso donde int4 empaquetado guarda dos. El autor subraya que ese crecimiento es el precio de eliminar una familia de tipos de dato y no un indicio de mayor precision. El codigo de modelado es identico byte a byte al de la build anterior.

## Capacidades

- Generacion de embeddings de texto, imagen y video en un espacio compartido (etiquetas text-embeddings, image-embedding, video-embedding y cross-modal).
- Recuperacion cross-modal: busqueda texto-a-imagen, imagen-a-texto, texto-a-video y variantes.
- Extraccion de caracteristicas para clasificacion, clustering y deduplicacion sobre representaciones vectoriales.
- Soporte de MRL (Matryoshka Representation Learning), que permite truncar las dimensiones de salida con perdida de calidad medible.
- Multilingue declarado para ingles, chino y categoria "multilingual".
- Compatibilidad con sentence-transformers y ejecucion bajo PyTorch estandar en CPU, CUDA y MPS, sin operaciones FP8 ni desempaquetado de nibbles.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generacion de texto: es un modelo de feature-extraction con pipeline declarado feature-extraction.

## Casos de uso

- Busqueda semantica multimodal en catalogo de producto: indexar imagenes y fichas de texto en un mismo espacio vectorial permite consultas en lenguaje natural que devuelven productos por similitud visual y textual, sin depender de etiquetas manuales.
- Recuperacion aumentada (RAG) sobre corpus mixtos: el modelo genera embeddings de documentos que combinan texto e imagenes (manuales tecnicos, informes con figuras) para alimentar una base vectorial y recuperar contexto relevante en un pipeline de generacion.
- Moderacion y deduplicacion de contenido visual: el truncado MRL permite indexar a 256 dimensiones, reduciendo coste de almacenamiento y latencia de busqueda, a cambio de unos 0,066 puntos de mAP segun la medicion citada en la discusion del repositorio.
- Busqueda de video por descripcion textual: la etiqueta video-embedding y el encoder ViT con merger habilitan la indexacion de fotogramas o clips y su recuperacion mediante consultas de texto.
- Sistemas de recomendacion por similitud: los vectores normalizados de usuario, articulo o medio permiten calcular vecinos cercanos para sugerencias sin necesidad de un modelo generativo.
- Clustering y exploracion de datasets no etiquetados: agrupar imagenes y textos por proximidad en el espacio de embeddings para auditar la composicion de un corpus antes de entrenar.
- Clasificacion ligera por cabecera: congelar el encoder y entrenar un clasificador lineal sobre los embeddings para tareas de etiquetado, evitando ajuste fino completo.
- Despliegue en hardware heterogeneo: al ejecutarse en CPU, CUDA y MPS con una sola ruta de cuantizacion, encaja en entornos de inferencia mixtos donde no se pueden instalar kernels exotico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados). Protocolo de fidelidad de texto sobre 24 consultas, ejecucion en CPU, sin plantilla de prompt, embeddings leidos del metodo `embedding` de cada modelo y comparados por coseno:

| Comparacion | Coseno medio | Minimo | Maximo |
|---|---|---|---|
| FP8 frente a esta build (INT8 Wide) | 0,999779 | 0,999695 | 0,999834 |
| Base BF16 frente a FP8 | 0,993103 | 0,987118 | 0,995475 |
| Base BF16 frente a esta build (INT8 Wide) | 0,993015 | 0,987408 | 0,995364 |

Valores de referencia de la build INT8 previa sobre el mismo protocolo: FP8 frente a INT8, 0,999798; base frente a INT8, 0,992999. Esta build queda 0,000016 por delante en fidelidad frente a la base, una diferencia dentro de la dispersion entre ejecuciones.

Medicion de un usuario recogida en la discusion #2 del repositorio base, sobre 289 fotos y 244 consultas de etiquetas: pasar de la build cuantizada a precision completa movio el mean average precision 0,0006 puntos, con intervalo del 95 por ciento de -0,008 a +0,009, mientras que conservar 256 dimensiones en lugar de 2048 costo aproximadamente 0,066. No hay resultados de MMLU, HumanEval, GSM8K ni MTEB en la informacion disponible; corresponden a tareas generativas o de otro tipo que este modelo no cubre.

## Requisitos de hardware

Estimaciones derivadas del tamano del checkpoint (2,33 GB) y del recuento de parametros (2,28 mil millones); el repositorio no publica mediciones de memoria, latencia ni throughput.

- VRAM estimada para inferencia: unos 3-4 GB con lotes pequenos de texto o imagenes de baja resolucion, y 4-8 GB con lotes grandes o video, contando pesos, activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con 8 GB o mas de memoria. Para texto, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB son suficientes con margen. Para cargas de video o lotes grandes, A100 (40/80 GB) o H100 dan holgura y mayor ancho de banda.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas en su configuracion int8, siempre que el lote se mantenga moderado.
- Apple Silicon: ejecucion por MPS soportada explicitamente, sin kernels adicionales.
- Opciones de despliegue: PyTorch estandar en CPU, CUDA y MPS; sentence-transformers con `trust_remote_code=True` (el repositorio incluye codigo de modelado propio). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no estan soportados de serie. Compatibilidad con vLLM, TGI o TEI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible. El autor solo indica que la build prioriza robustez de ejecucion sobre velocidad o precision.

## Comparativa con modelos similares

El autor compara esta build con las otras dos versiones del mismo modelo, que son sus alternativas naturales. No se proporcionan datos que permitan compararla con otros modelos de embeddings multimodales del mercado.

| Modelo | Cuantizacion | Familias de tipo de dato | Shards y tamano | Fidelidad frente a la base (texto, 24 consultas) | Licencia |
|---|---|---|---|---|---|
| WeMM-Embedding-2B-INT8-Wide (esta build) | int8 asimetrico, bloque 64, en los 285 modulos cuantizados | 1 (int8) | 4 shards, 2,33 GB | 0,993015 | apache-2.0 |
| ewin-reg/WeMM-Embedding-2B-INT8 | int8 asimetrico (139 modulos) mas int4 empaquetado g16 (146 modulos) | 2 (int8, int4 empaquetado) | 3 shards, 1.937.521.288 bytes | 0,992999 | no disponible en la informacion proporcionada |
| ewin-reg/WeMM-Embedding-2B-Quantized (base) | mezcla con tensores FP8 e int4 | no disponible | no disponible | referencia (precision de partida) | no disponible en la informacion proporcionada |

Frente a alternativas externas (por ejemplo, modelos de embeddings multimodales de tipo CLIP/SigLIP, BGE-M3, jina-embeddings-v3, Qwen3-Embedding o GME), no hay datos comparativos en la informacion proporcionada: no se dispone de resultados MTEB, mAP ni MRL de este modelo frente a ellos, ni de sus licencias y contextos en esta misma fuente. Los resultados de busqueda web recibidos no contenian enlaces tecnicos utilizables.

## Limitaciones y advertencias

- El autor declara explicitamente que es una build de robustez y no de precision: cambiar a ella esperando mejores metricas no da resultado.
- Las metricas de fidelidad del model-index estan marcadas como `verified: false`. Son mediciones del autor sobre un protocolo propio de 24 consultas de texto, no un benchmark estandar ni auditado.
- La comparacion solo cubre texto. El comportamiento en imagen y video no se ha medido en la model card, y la evidencia disponible sobre vision procede de una discusion de usuario sobre el modelo base, no de esta build.
- El cuantizado no es el factor limitante segun la medicion citada (0,0006 de mAP entre cuantizado y precision completa, con intervalo que cruza cero); el truncado MRL si lo es (0,066 de mAP al bajar de 2048 a 256 dimensiones). Truncar dimensiones para ahorrar coste degrada la calidad de forma mensurable.
- La rejilla int4 original tenia un error de Frobenius relativo cercano al 9 por ciento frente a precision completa; esta build lo sustituye, pero no recupera la precision perdida en esa etapa.
- Divergencia de licencia: el bloque de metadatos indica `license: other` con `license_name: apache-2.0`, mientras que la ficha del repositorio indica apache-2.0. Conviene verificar los terminos aplicables antes de un uso comercial.
- Requiere `trust_remote_code=True` por el codigo de modelado personalizado, lo que implica ejecutar codigo del autor del repositorio.
- Modelo de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-step, por lo que no es adecuado como sustituto de un LLM.
- Idiomas: solo ingles, chino y la etiqueta generica "multilingual". No hay evaluacion publicada de calidad por idioma ni confirmacion de cobertura del castellano.
- Longitud de contexto no declarada: no se puede garantizar el tratamiento de documentos largos.
- Sin traccion externa: 0 descargas y 0 interacciones en el momento de la consulta, lo que implica ausencia de validacion independiente.
- Proyecto de autor individual, no respaldado por un laboratorio con soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-INT8-Wide
- Modelo base: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Quantized
- Build INT8 previa: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-INT8
- Discusion #2 del modelo base (mediciones de mAP sobre vision y MRL): https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Quantized/discussions/2
- Referencia a paper incluida en las etiquetas del repositorio: arXiv:2608.24053 (no se ha localizado URL verificable en la informacion proporcionada)
- Los resultados de busqueda web recibidos no aportaron enlaces tecnicos relevantes (solo devolvieron paginas de inicio de sesion de redes sociales).
