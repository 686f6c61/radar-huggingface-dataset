# IndexTeam/Index-Translate-9B-FP8

## Resumen

Index-Translate-9B-FP8 es la cuantizacion oficial en FP8 (W8A8) del modelo IndexTeam/Index-Translate-9B, desarrollado por el equipo Index (vinculado al repositorio github.com/bilibili/Index-Translate). Forma parte de la familia Index-Translate, orientada a traduccion multilingue en 150 idiomas, con soporte para traduccion restringida por terminologia y formato, doblaje controlado y traduccion de documentos largos. Resuelve el problema de desplegar un traductor neuronal de ~9B parametros con un coste de memoria reducido y sin perdida practica de calidad respecto al checkpoint original en BF16.

El checkpoint se ha producido con llm-compressor bajo el esquema `FP8_DYNAMIC`: los pesos se almacenan en FP8 E4M3 y las activaciones se cuantizan dinamicamente por token. Se conservan en BF16 la torre de vision, el proyector multimodal, `lm_head` y los embeddings, ademas de los pesos de prediccion multi-token (MTP). El formato de pesos es safetensors con metadatos de compressed-tensors, cargable directamente con vLLM o transformers.

Su relevancia actual es doble: por un lado, mantiene una perplejidad casi identica a la del modelo base (2.7838 frente a 2.7722, un incremento del 0,42%) y genera salidas identicas en modo greedy para zh→en y en→zh; por otro, la licencia Apache 2.0 permite uso comercial sin las restricciones tipicas de otras familias de traduccion. El etiquetado incluye `image-text-to-text` y `qwen3_5`, lo que indica una arquitectura transformer multimodal con entrada de imagen y texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`); incluye torre de vision y proyector multimodal, mas pesos MTP (multi-token prediction) |
| Parametros totales | 9B (segun la denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el preset de servicio de la model card usa `--max-model-len 4096`) |
| Tipos de cuantizacion | FP8 W8A8 (`FP8_DYNAMIC`, pesos E4M3 y activaciones FP8 dinamicas por token); en la familia existen tambien BF16 y builds GGUF |
| Idiomas soportados | 150 idiomas (familia Index-Translate) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (carga directa con vLLM mediante `quantization="compressed-tensors"`) |

## Arquitectura y entrenamiento

La model card identifica el modelo con la etiqueta `qwen3_5` y con la tarea `image-text-to-text`, por lo que se trata de un transformer multimodal que incorpora una torre de vision y un proyector multimodal hacia el espacio del modelo de lenguaje. La cuantizacion afecta a todas las capas `Linear` del modelo de lenguaje, mientras que la torre de vision, el proyector, `lm_head` y los embeddings permanecen en BF16. Tambien se preservan los pesos de prediccion multi-token (MTP), lo que sugiere que el modelo base fue entrenado con un objetivo auxiliar de prediccion de varios tokens y que esa capacidad se conserva intacta tras la cuantizacion.

El proceso de cuantizacion se realizo con llm-compressor y el esquema `FP8_DYNAMIC`, con pesos en FP8 E4M3 y activaciones FP8 con escala dinamica por token; el esquema queda registrado en el fichero `recipe.yaml`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El modelo base se describe como especializado en traduccion con restricciones de terminologia y formato, doblaje controlado y traduccion de documentos largos, e incluye un formato de traduccion restringida denominado instTrans en su model card original.

## Capacidades

- Traduccion multilingue en 150 idiomas, con el formato de prompt de traduccion oficial y recomendacion de decodificacion greedy con `temperature=0`.
- Traduccion restringida por terminologia y formato mediante el formato instTrans descrito en la model card del modelo base.
- Traduccion de doblaje controlado, orientada a sincronizacion y control de la salida.
- Traduccion de documentos largos.
- Entrada multimodal de imagen y texto (`image-text-to-text`), gracias a la torre de vision y al proyector multimodal, que no se cuantizan.
- Prediccion multi-token (MTP) preservada, util para decodificacion especulativa o aceleracion de la generacion.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con el ecosistema transformers.
- No se documentan en la informacion disponible capacidades explicitas de tool calling, function calling, agentes o razonamiento multi-paso.

## Casos de uso

- Traduccion automatica de documentacion tecnica: el modelo admite restricciones de terminologia y formato, de modo que se puede forzar el uso de un glosario corporativo y preservar el marcado del documento de origen.
- Doblaje y subtitulado controlado: la familia incluye traduccion de doblaje controlado, adecuada para producir guiones traducidos con restricciones de longitud o de sincronizacion.
- Traduccion de documentos largos: pensado para procesar documentos completos en lugar de frases sueltas, aprovechando la ventana de contexto configurada en el servicio.
- Localizacion de interfaces y productos: la combinacion de 150 idiomas y restricciones de formato permite traducir cadenas de interfaz manteniendo marcadores de posicion y etiquetas.
- Atencion al cliente multilingue: puede integrarse como capa de traduccion en un pipeline de soporte para normalizar conversaciones entre idiomas antes de pasarlas a otro modelo o a un sistema de tickets.
- Traduccion de contenido con imagen asociada: al aceptar entradas de imagen y texto, resulta util para traducir material grafico con texto incrustado, capturas o documentos escaneados.
- Procesamiento por lotes en produccion: desplegado con vLLM y `quantization="compressed-tensors"`, permite servir muchas peticiones concurrentes con un coste de memoria inferior al del checkpoint BF16.
- Investigacion en traduccion con restricciones: util como punto de partida reproducible, dado que el informe tecnico y el codigo estan publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, BLEU, COMET) en la informacion disponible. La model card solo incluye una validacion de consistencia de la cuantizacion medida en una NVIDIA A100 frente al checkpoint BF16, con decodificacion greedy y el prompt oficial de traduccion:

| Metrica | BF16 | FP8 | Delta |
|---|---|---|---|
| Perplejidad (corpus fijo) | 2.7722 | 2.7838 | +0,42% |
| zh→en, generacion identica | — | — | si |
| en→zh, generacion identica | — | — | si |

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 9-10 GB para el modelo cuantizado en FP8, a lo que hay que sumar los componentes conservados en BF16 (torre de vision, proyector, `lm_head` y embeddings). Estimacion derivada del tamano de 9B parametros y de la precision FP8, no un dato publicado por el autor.
- VRAM total de inferencia: depende de la longitud de contexto y del tamano de lote; con el preset de 4096 tokens de contexto, un presupuesto de 12-16 GB es razonable en la mayoria de despliegues de una sola peticion o lotes pequenos.
- GPU consumer: si cabe en tarjetas de 16 GB o mas, como RTX 4080, RTX 4090 o RTX 5090; en GPUs de 24 GB como la RTX 4090 queda margen para contextos y lotes mayores.
- GPU de centro de datos: A100 (usada por el autor para la validacion de consistencia), H100 y similares para despliegues de alto throughput o lotes grandes.
- Despliegue: vLLM con `quantization="compressed-tensors"` (soporte explicito en la model card), transformers, y builds GGUF de la familia para llama.cpp u Ollama publicados en Index-Translate-9B-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el checkpoint FP8 con el propio modelo base y con los artefactos de la misma familia. No se han facilitado especificaciones de otras familias de traduccion, por lo que esa comparacion se marca como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Index-Translate-9B-FP8 | 9B | no disponible (preset de 4096) | Perplejidad 2.7838 en corpus fijo | apache-2.0 | safetensors (compressed-tensors) |
| Index-Translate-9B (base, BF16) | 9B | no disponible | Perplejidad 2.7722 en corpus fijo | apache-2.0 | safetensors |
| Index-Translate-9B-GGUF | 9B | no disponible | no disponible | apache-2.0 | GGUF |
| Otras familias de traduccion multilingue (NLLB, SeamlessM4T, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- El riesgo de alucinacion no se cuantifica; en tareas de traduccion esto se manifiesta como sustituciones, omisiones o invencion de contenido, especialmente en idiomas con pocos recursos.
- La decodificacion greedy con `temperature=0` es la configuracion recomendada y la unica validada; no se han publicado resultados para muestreo con temperatura alta.
- La longitud de contexto nativa no esta especificada; el ejemplo de servicio usa `--max-model-len 4096`, lo que puede limitar la traduccion de documentos largos si se mantiene ese preset.
- Los 150 idiomas se declaran a nivel de familia; no se detalla la cobertura ni la calidad por idioma, ni el conjunto exacto de idiomas soportados.
- La evaluacion se realizo en una unica GPU (A100) y sobre direcciones zh↔en; no hay validacion publicada de la cuantizacion en otras direcciones de traduccion.
- Licencia Apache 2.0, sin restricciones de uso comercial conocidas; conviene revisar igualmente las condiciones de los datos de entrenamiento, que no se detallan.
- El repositorio figura con 0.0 GB de tamano y 0 descargas en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion independiente por parte de la comunidad.
- La fecha de creacion registrada (2026-10-02) es posterior a la fecha de actualizacion indicada por el sistema para la model card (2026-10-03), un detalle a verificar antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-9B-FP8
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-9B
- Builds GGUF: https://huggingface.co/IndexTeam/Index-Translate-9B-GGUF
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.40181
- Codigo: https://github.com/bilibili/Index-Translate
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
