# EIDORA/CLIP_ViTB32_Text

## Resumen

EIDORA/CLIP_ViTB32_Text es un paquete de inferencia ONNX que expone únicamente el codificador de texto del modelo CLIP ViT-B/32 de OpenAI, convertido y empaquetado por EIDORA para su uso dentro de su ecosistema (EIDORA Desktop, esquema de paquete v3). No es un modelo nuevo: es una conversión del checkpoint `openai/clip-vit-base-patch32` (revisión fijada `b97b0100e55e367c057773c2a614676470b0d575`) que proyecta texto en el mismo espacio de embeddings de 512 dimensiones que el codificador de imagen de CLIP, lo que permite búsqueda texto-imagen y comparaciones de similitud entre modalidades.

El modelo resuelve un problema acotado: obtener vectores de texto L2-normalizados, listos para similitud coseno, sin necesidad de cargar el par completo imagen-texto ni de gestionar PyTorch. El grafo ONNX acepta `input_ids` y `attention_mask` de forma `[batch, 77]` en `int64` y devuelve `float32` de forma `[batch, 512]`. La arquitectura subyacente es el transformer de texto de CLIP ViT-B/32, con representación pooled del token de fin de texto y proyección lineal aprendida.

Su relevancia es práctica más que investigadora: ofrece un artefacto ONNX ligero (0,3 GB de repositorio) con tokenizer empaquetado y contrato de entrada documentado, útil para pipelines de recuperación multimodal en CPU. La licencia no está declarada y el autor advierte explícitamente que la licencia MIT del software de OpenAI no establece por sí sola los términos de redistribución de los pesos preentrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto CLIP ViT-B/32 (representación pooled de fin de texto + proyección lineal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens (padding y truncado por la derecha) |
| Tipos de cuantizacion | no disponible (el paquete distribuye `model.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (entrenado con datos imagen-caption públicos de internet; composición lingüística no publicada) |
| Licencia | no disponible (identificador declarado: `other`; sin fichero LICENSE en el repositorio) |
| Formato de pesos | ONNX (`model.onnx`) + tokenizer empaquetado en `tokenizer/` |

## Arquitectura y entrenamiento

El componente es el codificador de texto de CLIP ViT-B/32: un transformer que procesa hasta 77 tokens, toma la representación pooled asociada al token de fin de texto y la pasa por una proyección lineal aprendida hasta un espacio compartido de 512 dimensiones con el codificador de imagen. EIDORA aplica además normalización L2 a la salida, de modo que la similitud coseno se reduce a un producto escalar. El paquete incluye el tokenizer CLIP original y una preparación de entradas conforme al esquema v3, con `config.yaml` como contrato autoritativo del grafo.

El entrenamiento es el del checkpoint upstream: preentrenamiento contrastivo imagen-texto sobre datos públicos de imagen y caption recogidos de internet. Ni el dataset exacto ni su composición fueron liberados por OpenAI, y la model card de EIDORA lo indica expresamente. No hay información sobre RLHF, DPO ni ajuste fino posterior; este paquete no introduce entrenamiento adicional, solo conversión a ONNX y adaptación de preprocesado y salida. La alineación multimodal depende de que ambos codificadores provengan del mismo checkpoint y revisión upstream.

## Capacidades

- Generación de embeddings de texto: vectores `float32` de 512 dimensiones, L2-normalizados, para similitud coseno.
- Búsqueda texto-imagen: comparando los vectores de este paquete con los del paquete hermano `EIDORA/CLIP_ViTB32_Image`.
- Agrupamiento y detección de duplicados en descripciones cortas, títulos y captions.
- Recuperación semántica sobre textos breves (etiquetas, consultas, pies de foto).
- Clasificación zero-shot mediante comparación con prompts textuales de clase.
- Ejecución en CPU a través de `CPUExecutionProvider` de ONNX Runtime.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni visión dentro de este repositorio (la variante multimodal es un paquete separado).

## Casos de uso

- Búsqueda texto-imagen en un catálogo: se indexan una vez los embeddings de imagen con `CLIP_ViTB32_Image` y se codifican las consultas de usuario con este paquete; la similitud coseno entre ambos espacios de 512 dimensiones devuelve los resultados. Adecuado porque ambos paquetes comparten checkpoint y revisión, requisito que la propia model card señala como condición de alineación.
- Moderación y deduplicación de captions: agrupar pies de foto o descripciones casi idénticas calculando la matriz de similitud coseno sobre lotes de 77 tokens; el truncado a 77 tokens es suficiente para captions y titulares.
- Etiquetado zero-shot de textos cortos: construir prompts del tipo "una reseña sobre <categoría>" y asignar la clase con mayor similitud al embedding del texto de entrada, sin entrenar un clasificador.
- Enriquecimiento de metadatos en un CMS: generar un vector por artículo o ficha de producto para habilitar recomendaciones "más como esto" y búsqueda semántica interna, ejecutando la inferencia en CPU sin GPU dedicada.
- Filtrado previo en pipelines RAG multimodales: usar el embedding de texto como primera etapa de recuperación sobre un corpus de descripciones y reservar modelos mayores para el reranking.
- Evaluación de sesgo cross-modal en investigación: comparar cómo se agrupan términos demográficos o de dominio en el espacio CLIP, tal como sugiere la model card al advertir sobre sesgos de idioma y dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; el repositorio ocupa 0,3 GB, por lo que el grafo ONNX y el tokenizer caben holgadamente en memoria de sistema.
- GPU recomendadas: no disponibles; el paquete declara únicamente `CPUExecutionProvider`. La ejecución en GPU dependería de proveedores de ONNX Runtime no declarados en el paquete.
- GPU de consumo: no se documenta soporte; el diseño apunta a inferencia en CPU.
- Despliegue: ONNX Runtime con `CPUExecutionProvider` dentro de EIDORA Desktop; `config.yaml` define entradas, preprocesado, proveedor y dimensiones. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de embeddings.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Embedding | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| EIDORA/CLIP_ViTB32_Text | no disponible | 77 tokens | 512, L2 | ONNX | no disponible (`other`) | Solo texto; alineado con el paquete de imagen de EIDORA |
| openai/clip-vit-base-patch32 | no disponible | 77 tokens | 512 | PyTorch (safetensors/bin) | no disponible para pesos; software MIT | Checkpoint upstream con ambos codificadores |
| EIDORA/CLIP_ViTB32_Image | no disponible | no disponible | 512 | ONNX | no disponible | Variante solo imagen del mismo checkpoint |
| EIDORA/CLIP_ViTB32_Multimodal | no disponible | no disponible | 512 | ONNX | no disponible | Variante que combina imagen y texto |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Truncado rígido a 77 tokens: cualquier texto más largo se recorta; el autor recomienda trocear las entradas largas en el llamador.
- Es un encoder de embeddings, no un modelo generativo ni un verificador de hechos; no debe usarse para responder preguntas ni validar afirmaciones.
- Sesgos de idioma y dominio: la model card advierte que pueden afectar a las similitudes cross-modales; la composición lingüística del entrenamiento no se publicó.
- Licencia indeterminada: el identificador es `other`, no hay fichero LICENSE en el repositorio y el autor subraya que la licencia MIT del software de OpenAI no establece por sí sola los términos de redistribución de los pesos. Antes de uso comercial hay que consultar la documentación del checkpoint upstream.
- Dependencia de la revisión: la alineación con el codificador de imagen solo es válida si ambos provienen de la misma revisión `b97b0100e55e367c057773c2a614676470b0d575`; mezclar revisiones invalida las comparaciones.
- Proveedor declarado solo CPU: el rendimiento en GPU no está garantizado ni documentado.
- Adopción muy baja (32 descargas, 0 likes) y versión 0.1.0: sin validación comunitaria ni historial de mantenimiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero la similitud coseno puede producir correspondencias espurias en dominios alejados del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EIDORA/CLIP_ViTB32_Text
- Variante de imagen: https://huggingface.co/EIDORA/CLIP_ViTB32_Image
- Variante multimodal: https://huggingface.co/EIDORA/CLIP_ViTB32_Multimodal
- Checkpoint upstream: https://huggingface.co/openai/clip-vit-base-patch32
- Paper CLIP: https://arxiv.org/abs/2103.00020
