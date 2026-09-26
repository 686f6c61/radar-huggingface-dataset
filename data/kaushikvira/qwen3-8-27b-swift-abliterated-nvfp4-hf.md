# kaushikvira/Qwen3.8-27B-swift-abliterated-NVFP4-HF

## Resumen

Qwen3.8-27B-swift-abliterated-NVFP4-HF es un empaquetado cuantizado en NVFP4, en formato Hugging Face y listo para vLLM, de [d0xin/Swift-Qwen3.8-27B-Uncensored-BF16](https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16), un modelo de la familia Qwen (Apache-2.0) que ha pasado por una "abliteration" estilo huihui y por un post-entrenamiento Swift. Lo publica el usuario kaushikvira y su motivacion explicita es atender a usuarios de salida estructurada: el contenedor NInfer v3 del mismo autor no soporta JSON-schema, mientras que vLLM si.

El repositorio contiene pesos safetensors en formato compressed-tensors NVFP4 (W4A4, grupo 16) que cubren tanto la pila de texto como la torre de vision, con embedding de tokens y cabeza de salida en W8G32, ademas de una cabeza MTP que vLLM ignora. Segun los metadatos de safetensors, el modelo tiene 14.732.516.864 parametros (~14,7 B), una cifra que no concuerda con el "27B" del nombre y que la model card no explica.

Es relevante ahora por dos motivos: permite ejecutar un modelo conversacional multimodal de contexto muy largo en una unica GPU Blackwell de consumo (RTX 5090, 32 GB) y sirve como referencia reproducible de cuantizacion FP4 para despliegues con salida guiada por esquema JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) con torre de vision; etiqueta de arquitectura declarada: qwen3_5 |
| Parametros totales | 14.732.516.864 (~14,7 B, dato real de safetensors); el nombre del repositorio indica 27B (discrepancia no aclarada en la model card) |
| Longitud de contexto | Hasta 262.144 tokens segun la model card (configuracion recomendada de vLLM: 131.072 en GPU de 32 GB; 262.144 en 48 GB o mas) |
| Tipos de cuantizacion | NVFP4 W4A4 con grupo 16 (compressed-tensors) para peso y activaciones; embedding de tokens y cabeza de salida en W8G32 |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | Apache-2.0 (heredada de la cadena de artefactos, base Qwen) |
| Formato de pesos | safetensors en formato compressed-tensors NVFP4 (`model.safetensors`, 17,1 GiB) mas `model_mtp.safetensors` (cabeza MTP) y `recipe.yaml` |
| Modelo base | d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 (abliteration estilo huihui; post-entrenamiento Swift de ukisai; base del equipo Qwen) |
| Tamano del repositorio | 18,4 GB |
| Libreria declarada | transformers (con etiquetas vllm, sglang, compressed-tensors, nvfp4, w4a4) |
| Inferencia en el Hub | No soportada (campo `inference: false`) |
| Fecha de publicacion | 26 de septiembre de 2026 (creacion y ultima actualizacion del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen de la serie indicada, de tipo transformer multimodal con torre de vision, tal como refleja el pipeline `image-text-to-text`. Sobre ese modelo se aplico primero una abliteration de estilo huihui y despues un post-entrenamiento Swift; el resultado es la variante "Uncensored" en BF16 que aqui se cuantiza. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en las etapas de post-entrenamiento.

La aportacion tecnica de este repositorio es la cuantizacion: se ha usado `llm-compressor` (receta incluida como `recipe.yaml` para reproducibilidad), con calibracion sobre 512 muestras de Ultrachat y longitud de secuencia 2048. La pila de texto y la torre de vision quedan en NVFP4 W4A4 con grupo 16, mientras que el embedding de tokens y la cabeza de salida se mantienen en W8G32. La model card indica que las escalas globales por grupo de empaquetado se han unificado mediante una recodificacion E4M3 que solo reduce, matematicamente equivalente a la salida cruda de `llm-compressor` dentro de la precision de esa recodificacion. Se incluye ademas una cabeza MTP (multi-token prediction) que la model card describe como usada por el contenedor NInfer y **ignorada por vLLM**; la decodificacion especulativa DFlash2 es especifica de ese motor y no viaja en este repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, con el modelo base ajustado para dialogo.
- Entrada multimodal de imagen y texto: la torre de vision esta incluida y tambien cuantizada, por lo que el modelo acepta imagenes junto al prompt.
- Salida estructurada con JSON-schema mediante decodificacion guiada de vLLM (`GuidedDecodingParams(json=schema)`), que es el motivo declarado de la publicacion de este empaquetado.
- Contexto largo: la model card indica que 131.072 tokens caben con holgura en una GPU de 32 GB y que 262.144 tokens son viables en 48 GB o mas.
- Respuestas sin filtros editoriales: al proceder de un modelo abliterated/uncensored, el modelo no aplica el rechazo tipico del base alineado.
- Decodificacion especulativa mediante cabeza MTP, pero solo en el contenedor NInfer; vLLM ignora `model_mtp.safetensors`.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingues: no documentadas en la model card (el modelo base Qwen es multilingue, pero no hay lista de idiomas ni evaluacion en este repositorio).
- Modo "thinking", audio u otras capacidades especiales: no documentadas en la informacion disponible.

## Casos de uso

- Extraccion de datos con salida estructurada: el modelo se puede servir con vLLM y decodificacion guiada por JSON-schema para convertir texto o capturas en objetos validados (por ejemplo, campos `answer` y `confidence`), evitando el post-procesado de JSON invalido. Es el escenario que la propia model card destaca como diferenciador frente al contenedor NInfer.
- Asistente conversacional local de contexto largo: con `--max-model-len 131072` cabe en una RTX 5090 de 32 GB, lo que permite mantener historiales de conversacion muy extensos sin trocear el contexto.
- Procesamiento de documentos con imagenes: al incluir torre de vision cuantizada, se puede usar para descripcion de imagenes, respuesta a preguntas sobre capturas y extraccion de informacion de documentos escaneados dentro de un mismo pipeline.
- Analisis de bases de codigo o expedientes completos: con 262.144 tokens en GPUs de 48 GB o mas, es viable pasar repositorios medianos o expedientes completos en una sola ventana y pedir resumenes o busquedas semanales sobre el contenido.
- Anotacion por lotes de alto rendimiento: el despliegue con vLLM permite procesar grandes volumenes de peticiones con salida JSON validada, util para etiquetado de datasets y enriquecimiento de registros.
- Investigacion sobre abliteration y alineacion: el repositorio permite comparar la misma base en BF16 y en NVFP4 para medir el efecto combinado de la ablacion de direcciones de rechazo y de la cuantizacion sobre el comportamiento del modelo.
- Generacion de ficcion y roleplay sin filtros editoriales: caso de uso natural de un modelo uncensored, siempre que se apliquen controles propios de contenido y se cumplan las obligaciones legales aplicables.
- Evaluacion de cuantizacion FP4: al publicarse `recipe.yaml` y los pesos resultantes, sirve como caso de estudio reproducible de NVFP4 W4A4 grupo 16 frente a BF16 sobre el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lo declara de forma explicita: "Benchmarks — not measured yet on this packaging", y aclara que la cuantizacion es identica a la del contenedor NInfer v3 del mismo autor (que si publica numeros de gate, needle y llama-benchy en una unica RTX 5090), pero que las cifras especificas de vLLM/SGLang para este repositorio no se han medido. El autor invita a compartir resultados en la pestana Community.

## Requisitos de hardware

- Pesos: 17,1 GiB de safetensors NVFP4, sobre un repositorio de 18,4 GB.
- VRAM para inferencia: la model card indica que 131.072 tokens de contexto caben con holgura en una GPU de 32 GB; 262.144 tokens requieren 48 GB o mas. El resto del presupuesto de VRAM se destina a cache KV, cuyo coste crece con la longitud de contexto y el numero de secuencias concurrentes.
- GPU recomendadas: los tags apuntan a Blackwell, en concreto RTX 5090 (32 GB) para el escenario de 131k y B200/GB200 para el de 262k. El soporte y la aceleracion nativos de NVFP4 dependen de las tensor cores Blackwell.
- GPU de consumo: si, la model card menciona explicitamente la RTX 5090 como hardware objetivo y referencia de los benchmarks de su contenedor NInfer v3.
- GPUs no Blackwell (Ada, Hopper, Ampere): no disponible en la informacion proporcionada.
- Opciones de despliegue: vLLM (comando de ejemplo en la model card con `--max-model-len 131072`), SGLang (etiquetado) y el contenedor propietario NInfer v3, que anade decodificacion especulativa DFlash2 y consume la cabeza MTP. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Decodificacion especulativa: solo en NInfer mediante la cabeza MTP; vLLM ignora `model_mtp.safetensors`.
- Latencia y throughput: no medidos para este empaquetado; no hay cifras de pp/tg tok/s publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Motor | Salida JSON-schema | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| kaushikvira/Qwen3.8-27B-swift-abliterated-NVFP4-HF (este) | ~14,7 B (safetensors) | hasta 262.144 tokens | NVFP4 W4A4 gs16 + W8G32 | vLLM, SGLang | Si, via vLLM | Apache-2.0 | Formato HF, safetensors; 0 descargas |
| Contenedor NInfer v3 (mismos pesos, del mismo autor) | mismos pesos | no disponible | NVFP4 identica | NInfer (DFlash2) | No | no disponible en la ficha | Contenedor de motor propietario |
| dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4 | no disponible | no disponible | NVFP4 (cuantizacion distinta de la misma base) | no disponible | no disponible | no disponible en la ficha | Repositorio en HF |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 (base) | no disponible (BF16 del mismo modelo) | no disponible | BF16 (sin cuantizar) | transformers | no disponible | Apache-2.0 (heredada) | Repositorio en HF |

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se ha reducido o eliminado la alineacion de seguridad del base. Puede producir contenido ofensivo, ilegal o instrucciones peligrosas; requiere filtros propios y supervision humana antes de exponerlo a usuarios finales.
- Sin benchmarks propios: no hay medidas de calidad, seguridad ni regresiones de este empaquetado, ni frente al BF16 original ni frente al contenedor NInfer.
- Cuantizacion agresiva con calibracion reducida: NVFP4 W4A4 calibrado con 512 muestras de Ultrachat a longitud 2048. Es esperable degradacion en dominios poco representados en esa distribucion (codigo, matematicas, idiomas distintos del ingles), aunque no se ha cuantificado.
- Discrepancia de tamano: el nombre del repositorio indica 27B mientras que safetensors reporta 14,732,516,864 parametros. La model card no explica la diferencia; conviene verificar antes de dimensionar el despliegue.
- Idiomas no documentados: no hay lista de idiomas ni evaluacion multilingue en la informacion disponible.
- Requisito de hardware: NVFP4 esta orientado a Blackwell; no se documenta el comportamiento en generaciones anteriores de GPU.
- Decodificacion especulativa limitada: la cabeza MTP no la aprovecha vLLM, de modo que el rendimiento en vLLM no incluye esa aceleracion.
- Riesgo de alucinacion: inherente a los modelos generativos y no mitigado ni medido en este repositorio; con contexto de 262k la degradacion por "lost in the middle" es un riesgo adicional no evaluado.
- Licencia: Apache-2.0 permite uso comercial segun los terminos heredados de la cadena de artefactos, pero el modelo derivado no esta respaldado por el equipo Qwen y no se ofrecen garantias de calidad ni de idoneidad.
- Empaquetado reciente y sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, lo que reduce la validacion por terceros.
- La model card advierte de una unificacion de escalas globales por grupo de empaquetado mediante recodificacion E4M3 "shrink-only"; es matematicamente equivalente a la salida de `llm-compressor` solo dentro de la precision de esa recodificacion.
- Restricciones de uso derivadas de la naturaleza uncensored: si se despliega en la UE, conviene revisar las obligaciones de transparencia y de gestion de riesgos aplicables a sistemas que generan contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kaushikvira/Qwen3.8-27B-swift-abliterated-NVFP4-HF
- Modelo base (BF16 uncensored): https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Contenedor NInfer v3 con los mismos pesos y decodificacion DFlash2: https://huggingface.co/kaushikvira (la model card enlaza al perfil del autor, no a una URL directa del repositorio)
- Cuantizacion hermana de la misma base (dragoy): https://huggingface.co/dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4
- Herramienta de cuantizacion citada en la receta del autor (`recipe.yaml`): https://github.com/vllm-project/llm-compressor
- Linaje de abliteration mencionado en la model card: huihui-ai; post-entrenamiento Swift: ukisai; base original: equipo Qwen (sin URL directa en la informacion proporcionada)
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
