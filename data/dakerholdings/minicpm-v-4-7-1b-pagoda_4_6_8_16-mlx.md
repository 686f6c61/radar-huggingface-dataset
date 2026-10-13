# dakerholdings/MiniCPM-V-4.7-1B-pagoda_4_6_8_16-mlx

## Resumen

MiniCPM-V-4.7-1B-pagoda_4_6_8_16-mlx es una conversion al formato MLX del modelo multimodal openbmb/MiniCPM-V-4.7-1B, publicada por el usuario dakerholdings. Se trata de una cuantizacion mixta de precision variable (receta "pagoda" / ridge_4_6_8) realizada a partir de una version GGUF F16 (MiniCPM-V-4_7-1B-F16.gguf). El modelo resuelve el problema de ejecutar un modelo de imagen-a-texto de ~1B parametros en hardware Apple Silicon con un consumo de memoria reducido y sin renunciar del todo a la calidad en las capas mas sensibles.

El repositorio contiene 1.554.476.272 parametros almacenados en safetensors (1,7 GB), pero el autor aclara que el recuento real de parametros logico es de 1,01B para el modelo de lenguaje, mas una torre de vision de 548,3M parametros. La insignia automatica de "Model size" de HuggingFace tiende a infravalorar este tipo de modelos MLX porque los pesos empaquetados se guardan a menos de 8 bits por elemento.

La relevancia actual del modelo es de nicho pero clara: es una de las pocas distribuciones MLX cuantizadas de un VLM pequeno con un esquema de bits no uniforme, pensado para inferencia local en Mac mediante mlx_lm y mlx_vlm. Al proceder de MiniCPM-V 4.7, hereda la arquitectura hibrida del modelo base (con capas de mezcla tipo SSM/GDN, segun la propia descripcion de la receta de cuantizacion), aunque la model card no documenta la longitud de contexto, los idiomas soportados ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; model_type declarado: qwen3_5. La receta de cuantizacion menciona pesos de mezclador tipo GDN/SSM (ssm_alpha, ssm_beta, ssm_conv1d, ssm_a, ssm_dt), lo que indica una arquitectura hibrida con atencion y capas de estado. Incluye torre de vision separada |
| Parametros totales | 1.554.476.272 en safetensors. El autor indica 1,01B para el modelo de lenguaje y 548,3M para la torre de vision |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Receta "pagoda" / ridge_4_6_8: FFN intermedio a 4 bits; proyecciones de mezclador y atencion mas FFN de borde a 6 bits; tensores de estado ssm_alpha y ssm_beta a 8 bits; normas, ssm_conv1d, ssm_a y ssm_dt en fp16. Torre de vision: lineales a 6 bits, normas, embeddings y convoluciones en fp16 (group size 64, modo affine). Etiqueta global del repo: 6-bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (cuantizacion empaquetada, group size 64, affine) |

## Arquitectura y entrenamiento

No hay informacion sobre el proceso de entrenamiento en los datos proporcionados. El repositorio es exclusivamente una conversion y recuantizacion de pesos: no se ha reentrenado ni afinado nada. El punto de partida es openbmb/MiniCPM-V-4.7-1B, y el autor menciona tambien la variante openbmb/MiniCPM-V-4.7-1B-gguf como modelo de referencia, ademas del fichero MiniCPM-V-4_7-1B-F16.gguf del que se parte.

La innovacion tecnica esta en el esquema de cuantizacion, no en el modelo. La politica ridge_4_6_8 reparte los bits de forma no uniforme: asigna 4 bits al FFN intermedio (el bloque mas grande y menos sensible), 6 bits a las proyecciones de atencion y del mezclador mas el FFN de borde, y 8 bits a los tensores de estado del SSM (ssm_alpha y ssm_beta), que son los mas sensibles a la degradacion numerica. Los tensores de normalizacion, la convolucion del SSM (ssm_conv1d), ssm_a y ssm_dt se mantienen en fp16. La torre de vision se convierte aparte desde el mmproj original en F16 a 6 bits en las capas lineales, dejando normas, embeddings y convoluciones en fp16. El resultado es un modelo de 1,7 GB que, segun el autor, "gasta bits en los pesos sensibles del GDN/mezclador" para obtener mejor calidad con un tamano medio similar.

## Capacidades

- Generacion de texto e inferencia multimodal de imagen a texto (pipeline declarado: image-text-to-text), con torre de vision propia de 548,3M parametros.
- Conversacion multiturno: el repo esta etiquetado como "conversational".
- Procesamiento de imagenes combinadas con instrucciones de texto mediante el procesador de mlx_vlm.
- Compatibilidad con dos runtimes declarados: mlx_lm (solo texto) y mlx_vlm (texto mas imagen). El autor indica que "tras ser compatibles con el formato minicpmv4_7 incluido, estos runtimes deberian ser soportables", lo que sugiere que la compatibilidad plena depende de la version del runtime.
- No se documentan capacidades de tool calling, function calling, agentes, modo de razonamiento explicito, audio ni generacion de video.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Inferencia local de vision-lenguaje en Mac: el modelo ocupa 1,7 GB, por lo que se puede cargar en un Mac con 8 GB de memoria unificada y describir imagenes o responder preguntas sobre capturas de pantalla sin conexion a Internet y sin coste de API.
- Clasificacion y etiquetado de imagenes en lotes: mediante mlx_vlm se pueden recorrer directorios de imagenes y pedir etiquetas estructuradas (categoria, atributos, texto visible), aprovechando el bajo consumo de memoria para ejecutar el proceso en segundo plano en un portatil.
- Extraccion de texto de capturas y documentos simples: transcripcion de texto presente en imagenes (recibos, carteles, capturas de interfaz) como paso previo a un pipeline de OCR mas pesado.
- Prototipado rapido de asistentes visuales: al ser un modelo de 1B, sirve para validar prompts, plantillas de chat e integracion con mlx_lm/mlx_vlm antes de pasar a un modelo mayor, con una latencia y un coste de iteracion muy bajos.
- Filtrado previo (pre-screening) en pipelines multimodales: usar el modelo como clasificador barato que descarta imagenes irrelevantes y solo reenvia las candidatas a un VLM mayor, reduciendo el coste total de inferencia.
- Pruebas de cuantizacion y comparativas de calidad: el esquema ridge_4_6_8 permite medir el impacto de asignar mas bits a los tensores de estado frente a un esquema uniforme de 4 o 6 bits, usando el mismo modelo base como referencia.
- Generacion de texto ligera en Apple Silicon: con mlx_lm se puede usar como modelo conversacional pequeno para tareas de redaccion corta, resumen o reescritura, siempre que el caso de uso no exija razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MMBench ni metricas similares, ni para el modelo cuantizado ni para el modelo base. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- El formato es MLX, por lo que la ejecucion nativa requiere Apple Silicon (series M1, M2, M3 o M4). No es un formato portable a CUDA.
- VRAM o memoria unificada estimada: el repositorio pesa 1,7 GB, de modo que un Mac con 8 GB de memoria unificada es suficiente para cargar el modelo; con 16 GB o mas se dispone de margen para cache KV, imagenes de resolucion alta y otras aplicaciones.
- GPU recomendadas: cualquiera integrada en Apple Silicon. No aplica el catalogo habitual (A100, H100, RTX 4090) porque el formato MLX no se ejecuta de forma nativa en esas GPU.
- Cabe en GPU de consumo (Apple Silicon): si, en cualquier Mac con al menos 8 GB de memoria unificada. No esta pensado para GPU de consumo NVIDIA en este formato.
- Opciones de despliegue: mlx_vlm para imagen-texto y mlx_lm para texto, segun los ejemplos de la model card. Para llama.cpp, Ollama u otras herramientas compatibles con GGUF habria que usar el modelo base openbmb/MiniCPM-V-4.7-1B-gguf, no esta conversion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Ejecucion |
|---|---|---|---|---|---|---|
| dakerholdings/MiniCPM-V-4.7-1B-pagoda_4_6_8_16-mlx | 1,01B LM + 548,3M vision (1.554.476.272 en safetensors) | no disponible | safetensors MLX | ridge_4_6_8 (4/6/8 bits + fp16 selectivo), 1,7 GB | no disponible | Apple Silicon, mlx_lm / mlx_vlm |
| openbmb/MiniCPM-V-4.7-1B | no disponible (mismo modelo base) | no disponible | no disponible | pesos completos, presumiblemente bf16/fp16 | no disponible | segun runtime del autor |
| openbmb/MiniCPM-V-4.7-1B-gguf | no disponible | no disponible | GGUF | F16 y otras variantes GGUF | no disponible | llama.cpp, Ollama y derivados |
| Otros VLM de ~1B-2B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al propio modelo base y su variante GGUF porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros autores. No se dispone de numeros de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentacion sobre la composicion del dataset de entrenamiento del modelo base ni sobre evaluaciones de sesgo.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasa de alucinacion. En un modelo de ~1B de parametros el riesgo de inventar detalles en descripciones de imagenes y en texto factual es alto por diseno, aunque no hay mediciones que lo cuantifiquen.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto soportada ni la lista de idiomas. Al ser una recuantizacion del modelo base, hereda las limitaciones de este, que no se detallan aqui.
- Restricciones de licencia: la licencia figura como "no disponible" en la ficha del repositorio. Antes de cualquier uso comercial hay que verificar la licencia del modelo base openbmb/MiniCPM-V-4.7-1B, ya que la conversion deriva de ella.
- Compatibilidad fragil: el autor advierte de que la compatibilidad con mlx_lm y mlx_vlm depende de que estos runtimes incorporen el formato minicpmv4_7; con versiones antiguas la carga puede fallar. El propio ejemplo de generacion de la model card indica "run the command above, with a compatible version of mlx_lm".
- Metadatos incompletos: el recuento automatico de parametros de HuggingFace infravalora el modelo (el autor lo senala explicitamente: 1,01B reales frente al badge automatico), lo que puede confundir en comparativas de tamano.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion por parte de la comunidad.
- Naturaleza del artefacto: es una conversion de pesos, no un modelo nuevo. No se ha reentrenado ni evaluado; cualquier perdida de calidad respecto al original proviene unicamente de la cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dakerholdings/MiniCPM-V-4.7-1B-pagoda_4_6_8_16-mlx
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Modelo base en GGUF: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-gguf

Nota: la busqueda web realizada no devolvio ningun resultado relevante para este modelo; los enlaces devueltos correspondian a contenido sin relacion con inteligencia artificial y se han descartado. No se dispone de papers, blogs tecnicos ni demos publicados por el autor.
