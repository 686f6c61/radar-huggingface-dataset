# AbrahamPJ/florence2-promptgen-onnx

## Resumen

Florence-2-base PromptGen v2.0 ONNX es una conversión a formato ONNX del modelo MiaoshouAI/Florence-2-base-PromptGen-v2.0, un ajuste fino de Florence-2-base-ft de Microsoft orientado a generar prompts de Stable Diffusion a partir de una imagen. Lo publica el usuario AbrahamPJ (repositorio AbrahamPJ/florence2-promptgen-onnx) y su propósito declarado es servir de motor de captioning y generación de prompts dentro de Nightmare Mobile, una aplicación que ejecuta el modelo en la CPU de un teléfono mediante ONNX Runtime.

El interés técnico del artefacto no está en el modelo en sí, sino en el empaquetado: replica la división en cuatro grafos y la interfaz de entrada/salida del build onnx-community/Florence-2-base-ft, mantiene el codificador visual en fp32 y cuantiza dinámicamente la mitad lingüística a int8/uint8. El autor documenta explícitamente que cuantizar el codificador visual degradaba las descripciones hasta el punto de inventar contenido, mientras que la cuantización del decodificador apenas se desviaba del resultado en fp32.

Se trata de un modelo pequeño de tipo visión-lenguaje con licencia MIT, sin resultados de benchmarks publicados en la información disponible y con cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe considerarse un artefacto de despliegue más que una release consolidada. Su relevancia es de nicho: inferencia de captioning en dispositivo sin GPU y sin dependencia del stack de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder-decoder de Florence-2 (DaViT para visión + modelo seq2seq tipo encoder-decoder para lenguaje); exportada a ONNX en cuatro grafos |
| Parametros totales | no disponible en la model card (la familia Florence-2-base de Microsoft declara aproximadamente 0,23 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Vision encoder fp32; embed_tokens uint8 (dinámica); encoder del lenguaje int8 (dinámica); decoder merged int8 (dinámica, con use_cache_branch). Cuantización dinámica de ONNX Runtime sobre MatMul y Gather, per-tensor |
| Idiomas soportados | no disponible |
| Licencia | MIT (igual que los modelos upstream) |
| Formato de pesos | ONNX (cuatro ficheros .onnx) más vocab.json, tokenizer.json y preprocessor_config.json sin modificar respecto al modelo base |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | image-to-text |
| Modelos base | MiaoshouAI/Florence-2-base-PromptGen-v2.0, microsoft/Florence-2-base-ft |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Florence-2-base-ft, el checkpoint base de Microsoft Florence-2 con fine-tuning supervisado. Florence-2 combina un codificador visual con un decodificador de lenguaje autorregresivo que trata tareas de visión como generación de secuencias guiada por un token de tarea. PromptGen v2.0, de MiaoshouAI, especializa ese comportamiento en la escritura de prompts para Stable Diffusion a partir de una imagen. No se dispone de información sobre el volumen de tokens, la composición del dataset de ajuste ni el uso de RLHF o DPO en esta conversión.

No hay entrenamiento nuevo en este repositorio: el procedimiento descrito es una transposición de pesos. Los pesos de PromptGen v2.0 se insertaron en los grafos fp32 de onnx-community/Florence-2-base-ft, emparejando cada tensor por valor contra el checkpoint original de Florence-2-base-ft y sustituyéndolo por el tensor homónimo de PromptGen; el autor indica que todos los tensores coincidieron y ninguno de forma ambigua, y que lm_head está atado al embedding compartido según la configuración del modelo. El encoder del lenguaje, el embedding y el decoder fusionado se cuantizaron después con cuantización dinámica de ONNX Runtime, dejando el encoder visual en fp32 deliberadamente.

La inferencia documentada usa decodificación greedy, con el primer token forzado a `<s>` y `no_repeat_ngram_size` igual a 3. Las tareas se seleccionan mediante prompts de texto: `<GENERATE_TAGS>`, `<MIXED_CAPTION>` y `<MORE_DETAILED_CAPTION>` (este último se transforma en la frase "Describe with a paragraph what is shown in the image.").

## Capacidades

- Generación de descripciones de imagen en tres modos: etiquetas sueltas (`<GENERATE_TAGS>`), caption mixto (`<MIXED_CAPTION>`) y descripción detallada en párrafo (`<MORE_DETAILED_CAPTION>`).
- Generación de prompts para modelos de difusión a partir de una fotografía, que es la tarea para la que se ajustó PromptGen v2.0.
- Comprensión visual básica orientada a descripción: identificación de objetos, escenas y atributos visibles.
- Ejecución en CPU sin GPU gracias al grafo ONNX y a la cuantización int8 de la mitad lingüística.
- Inferencia con caché de claves y valores mediante la fusión de grafos con `use_cache_branch`.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso como agente, modo de razonamiento explícito, entrada de audio, ni capacidades multilingües declaradas.

## Casos de uso

- Generación automática de prompts para Stable Diffusion: dado un borrador o una foto de referencia, el modelo produce un prompt textual reutilizable, que es exactamente la especialización de PromptGen v2.0.
- Etiquetado de datasets de imágenes: uso de `<GENERATE_TAGS>` para producir etiquetas cortas de forma masiva sin GPU, útil en pipelines de curación de datos.
- Aplicación móvil offline de captioning: el escenario para el que se construyó, ejecutando el modelo con ONNX Runtime sobre la CPU de un teléfono en la app Nightmare Mobile.
- Accesibilidad: descripción automática de imágenes para lectores de pantalla, donde `<MORE_DETAILED_CAPTION>` aporta una frase completa en lugar de etiquetas sueltas.
- Indexado y búsqueda de bibliotecas de imágenes: generar captions y tags para poblar un índice de texto que permita búsqueda semántica sobre un archivo fotográfico local.
- Preprocesado en pipelines de generación aumentada por recuperación visual: producir una descripción textual de una imagen para que un modelo de lenguaje de mayor tamaño la consuma, reduciendo el coste frente a un VLM grande.
- Moderación o triaje de contenido visual en el borde: clasificación asistida por etiquetas generadas localmente, sin enviar las imágenes a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de CIDEr, METEOR, BLEU, MMLU ni ninguna otra, y no se aportan comparaciones numéricas frente a fp32 más allá de la afirmación cualitativa de que la cuantización int8 de la mitad lingüística "seguía de cerca" al modelo en fp32 mientras que cuantizar el encoder visual producía descripciones inventadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa 0,5 GB, y con el encoder visual en fp32 más la mitad lingüística en int8 el peso en memoria debería quedar por debajo de 1 GB, pero es una estimación, no un dato de la model card.
- GPU recomendadas: no disponibles. El modelo se distribuye para ejecución en CPU con ONNX Runtime y no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: por tamaño, cualquier GPU de consumo moderna debería poder alojarlo, pero no hay confirmación oficial ni instrucciones de despliegue en CUDA o TensorRT.
- Opciones de despliegue: ONNX Runtime (el runtime documentado, incluido el escenario móvil). No compatible directamente con vLLM, TGI o llama.cpp, que no consumen grafos ONNX de Florence-2; Ollama tampoco, al no existir conversión a GGUF en este repositorio. La integración con transformers requeriría el modelo original en PyTorch.
- Latencia y throughput: no disponibles. La model card no reporta tiempos de inferencia ni tokens por segundo en ningún dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AbrahamPJ/florence2-promptgen-onnx | no disponible (familia base ≈0,23 B) | no disponible | ONNX (fp32 + int8/uint8) | MIT | Especializado en prompts para difusión; visión en fp32 por decisión de calidad |
| onnx-community/Florence-2-base-ft | no disponible | no disponible | ONNX | MIT | Mismo esquema de cuatro grafos; modelo generalista, sin el ajuste de PromptGen |
| MiaoshouAI/Florence-2-base-PromptGen-v2.0 | no disponible | no disponible | safetensors (PyTorch) | MIT | Fuente de los pesos; requiere PyTorch, no orientado a CPU móvil |
| microsoft/Florence-2-base-ft | ≈0,23 B | no disponible | safetensors (PyTorch) | MIT | Modelo original de Microsoft, multitarea de visión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia y procedencia.

## Limitaciones y advertencias

- Cero descargas y cero likes en el momento de la consulta: es un artefacto recién publicado, sin validación por parte de la comunidad.
- No es un modelo entrenado desde cero ni un ajuste nuevo: hereda íntegramente los sesgos, el conocimiento y los fallos de Florence-2-base-ft y del ajuste de MiaoshouAI.
- Riesgo de alucinación visual documentado por el propio autor: cuantizar el encoder visual producía descripciones falsas (por ejemplo, "four photographs of a cat" para dos gatitos). El encoder se mantiene en fp32 precisamente para mitigarlo, pero el decodificador en int8 sigue siendo una aproximación.
- Idiomas soportados no declarados. Florence-2 está orientado a inglés y la model card solo documenta prompts de tarea en inglés.
- Longitud de contexto no especificada; en captions muy largos o imágenes complejas puede truncar o degradar la salida.
- La licencia MIT es permisiva y permite uso comercial, pero se hereda de dos modelos upstream (Microsoft y MiaoshouAI) y el autor no incluye textos de licencia adicionales ni avisos de terceros en el repositorio.
- Sin benchmarks: no hay forma de cuantificar la pérdida de calidad frente al modelo en fp32 o frente al original en PyTorch.
- La decodificación está fijada a greedy con `no_repeat_ngram_size` 3 y primer token forzado; desviarse de esa configuración puede alterar la calidad de las salidas.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados correspondían a contenido no relacionado, por lo que no existe cobertura externa ni discusión técnica verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AbrahamPJ/florence2-promptgen-onnx
- Modelo base (PromptGen v2.0): https://huggingface.co/MiaoshouAI/Florence-2-base-PromptGen-v2.0
- Modelo base original: https://huggingface.co/microsoft/Florence-2-base-ft
- Grafos ONNX de referencia: https://huggingface.co/onnx-community/Florence-2-base-ft
- Aplicación que consume el modelo: https://github.com/AbrahamPaulJ/nightmare-mobile
- No se han encontrado papers, blogs, demos ni discusiones técnicas adicionales en la búsqueda web realizada.
