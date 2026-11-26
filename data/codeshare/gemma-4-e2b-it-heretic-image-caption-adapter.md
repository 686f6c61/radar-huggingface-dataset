# codeShare/gemma-4-E2B-it-heretic-image-caption-adapter

## Resumen

El modelo `codeShare/gemma-4-E2B-it-heretic-image-caption-adapter` es un adaptador LoRA multimodal (PEFT) construido sobre el modelo base `coder3101/gemma-4-E2B-it-heretic`, una variante "abliterada" (con el comportamiento de rechazo atenuado o eliminado) de Gemma 4 E2B instruction-tuned. Lo desarrolla el usuario `codeShare` y su proposito es mejorar la capacidad de descripcion de imagenes del modelo base, orientandola especificamente a la generacion de prompts para modelos de sintesis de imagen como Chroma, Krea 2 y Moss Image.

Se trata de un adaptador, no de un modelo autonomo: requiere cargar primero el modelo base y aplicar despues los pesos LoRA mediante la libreria `peft`. El repositorio ocupa 1,1 GB e incluye el procesador multimodal. La tarea declarada es `image-to-text` y el unico idioma indicado en la model card es el ingles.

La relevancia actual del modelo es acotada y muy especifica: cubre el nicho de la anotacion automatica de imagenes generadas por IA y la ingenieria inversa de prompts (image-to-prompt). Al estar entrenado sobre una base abliterada, no incorpora los filtros de rechazo habituales del modelo original, lo que condiciona fuertemente su uso en produccion. La informacion publica disponible es escasa: no hay benchmarks, no se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PEFT LoRA sobre un transformer multimodal (Gemma 4 E2B) |
| Parametros totales | no disponible (depende del modelo base Gemma 4 E2B; no se especifica) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de carga usa `float16`; se menciona QLoRA en entrenamiento) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 (sujeta a la licencia y restricciones del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA PEFT, no modelo fusionado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estandar de PEFT aplicado sobre un modelo Gemma 4 E2B multimodal. El modelo base procesa entradas de imagen y texto, y el adaptador modifica los pesos para especializar la salida hacia descripciones de imagen y prompts. No se dispone de informacion sobre el rango del LoRA, los modulos objetivo ni el numero de parametros entrenables.

El entrenamiento se realizo mediante QLoRA multimodal sobre aproximadamente 3.000 imagenes generadas por IA y sus prompts asociados, provenientes de modelos como Chroma, Krea 2 y Moss Image, segun el dataset `codeShare/adcom_captioned_ai_images`. El dataset original y los artefactos privados de entrenamiento no se incluyen en el repositorio. No se documenta el numero de tokens, la composicion exacta del corpus, ni si se aplico RLHF o DPO. El modelo base incorpora "abliteration", una tecnica de modificacion de pesos que reduce o elimina el comportamiento de rechazo, lo que se hereda en el adaptador.

## Capacidades

- Generacion de descripciones de imagen (image captioning) en ingles.
- Generacion de prompts para modelos de sintesis de imagen (Chroma, Krea 2, Moss Image).
- Comprension de imagen y texto combinados (entrada multimodal).
- Inferencia sobre imagenes generadas por IA, con sesgo hacia ese dominio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta modo "thinking", audio ni otras capacidades especiales.
- Comportamiento de rechazo atenuado por herencia del modelo base abliterado.

## Casos de uso

- Anotacion automatica de datasets de imagenes generadas por IA: el adaptador puede generar descripciones y prompts para catalogar grandes colecciones de imagenes sinteticas, aprovechando su entrenamiento especifico en ese dominio.
- Ingenieria inversa de prompts (image-to-prompt): dado un resultado visual, el modelo produce un prompt aproximado que podria reutilizarse para reproducir o variar la imagen en Chroma, Krea 2 o Moss Image.
- Construccion de pipelines de curacion de datos: integrado en un flujo que etiquete imagenes con texto para entrenar o evaluar otros modelos generativos.
- Prototipado de herramientas de exploracion de galerias: el notebook incluido (`sankaku_database_browse_and_caption.ipynb`) demuestra un navegador de base de datos de imagenes con captioning integrado.
- Investigacion sobre alineacion y abliteration: permite estudiar como un adaptador especializado se comporta sobre una base sin filtros de rechazo, en entornos controlados.
- Generacion asistida de metadatos para catalogos creativos: descripcion de imagenes de un portfolio o banco de recursos con vocabulario orientado a la sintesis de imagen.
- Experimentacion educativa con PEFT y modelos multimodales: sirve como ejemplo practico de carga de adaptadores LoRA multimodales con `transformers` y `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; depende del modelo base Gemma 4 E2B, que no se detalla en la informacion proporcionada. El adaptador LoRA en si ocupa aproximadamente 1,1 GB en disco.
- GPU recomendadas: no disponibles. Al cargarse en `float16` con `device_map="auto"`, se recomienda una GPU con memoria suficiente para el modelo base completo; no se especifica cual.
- Compatibilidad con GPU de consumo: no confirmada. Depende del tamano del modelo base; no se puede afirmar que quepa en una RTX 4090 u otras GPU consumer sin datos del modelo base.
- Opciones de despliegue: `transformers` + `peft` + `accelerate` segun el ejemplo de la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores de captioning sobre Gemma 4 E2B) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere el modelo base `coder3101/gemma-4-E2B-it-heretic` para funcionar.
- El modelo base esta abliterado, lo que elimina o atenua los mecanismos de rechazo; esto puede producir salidas inapropiadas y limita su uso en aplicaciones orientadas al publico.
- Entrenado sobre aproximadamente 3.000 imagenes, un volumen reducido que puede provocar sobreajuste al dominio de imagenes generadas por IA y pobre generalizacion a fotografias reales.
- Solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion en descripciones: puede inventar detalles no presentes en la imagen.
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset acotado de imagenes sinteticas puede heredar sesgos de esos generadores.
- Licencia Apache 2.0 en el adaptador, pero sujeta explicitamente a la licencia y restricciones del modelo base; es necesario revisar los terminos de Gemma antes de uso comercial.
- No hay benchmarks publicados que permitan validar la calidad del captioning frente a alternativas.
- El dataset de entrenamiento y los artefactos no se incluyen, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codeShare/gemma-4-E2B-it-heretic-image-caption-adapter
- Modelo base: https://huggingface.co/coder3101/gemma-4-E2B-it-heretic
- Notebook de inferencia (navegador Sankaku): https://huggingface.co/codeShare/gemma-4-E2B-it-heretic-image-caption-adapter/blob/main/sankaku_database_browse_and_caption.ipynb
- Dataset de entrenamiento: https://huggingface.co/datasets/codeShare/adcom_captioned_ai_images
