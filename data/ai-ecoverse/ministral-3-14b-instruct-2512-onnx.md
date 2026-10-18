# ai-ecoverse/Ministral-3-14B-Instruct-2512-ONNX

## Resumen

Ministral 3 14B Instruct 2512 ONNX es una exportación no oficial a formato ONNX del modelo `mistralai/Ministral-3-14B-Instruct-2512-BF16` de Mistral AI, publicada por ai-ecoverse. Se trata de un modelo de lenguaje denso de aproximadamente 14 000 millones de parámetros, con 40 capas y un tamaño oculto de 5120, al que se añade un codificador visual Pixtral de 0,4B de parámetros, lo que lo convierte en un modelo `image-text-to-text` capaz de procesar imágenes y texto de forma conjunta. Mantiene las dos características más relevantes del original: una ventana de contexto de 256 000 tokens y soporte nativo de tool calling.

La relevancia de esta ficha no está en el modelo base, sino en el empaquetado: reproduce la estructura de archivos de la exportación ONNX oficial de Mistral (`onnx/decoder_model_merged_<variant>.onnx`, `embed_tokens_fp16.onnx` y `vision_encoder_fp16.onnx`, con pesos en ficheros `.onnx_data` de 2 GB como máximo), de modo que cualquier runtime capaz de cargar el export oficial de 3B puede cargar este de 14B con su propio tokenizador, plantilla de chat y configuración de generación. Se distribuye en dos variantes cuantizadas a 4 bits, `q4f16` (7,29 GB de decodificador) y `q4` (8,16 GB), lo que sitúa el modelo completo por debajo de los 11 GB de pesos y lo hace viable en GPUs de consumo y en el navegador mediante transformers.js y WebGPU.

La licencia es Apache 2.0, heredada del modelo base, y el repositorio ocupa 17,7 GB porque incluye ambas variantes junto con los codificadores compartidos. El autor advierte explícitamente de que no es un lanzamiento oficial de Mistral AI y remite a la model card del modelo base para capacidades, benchmarks y uso previsto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (etiqueta `mistral3`) con codificador visual Pixtral |
| Parámetros totales | ~14B en el decodificador (según denominación del modelo); 40 capas, hidden size 5120; codificador visual adicional de 0,4B |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantización | 4 bits con bloque de 32 y simétrico; variante `q4f16` (activaciones y KV cache en fp16) y variante `q4` (activaciones y KV cache en fp32); `embed_tokens` y `vision_encoder` en fp16 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data`, ficheros de 2 GB máximo); `inputs_embeds` y `logits` en float32 en todas las variantes |
| Pipeline | `image-text-to-text` |
| Librería | transformers.js |
| Runtimes compatibles | transformers.js, onnxruntime, slicc-ortllama |
| Tamaño del repositorio | 17,7 GB (incluye ambas variantes y codificadores compartidos) |
| Modelo base | mistralai/Ministral-3-14B-Instruct-2512-BF16 (checkpoint bf16, commit `3cea74c1ebaf5ce5f5a2553de470e2ceab825142`) |

## Arquitectura y entrenamiento

El decodificador es un transformer denso de 40 capas y dimensión oculta 5120, exportado desde el checkpoint bf16 de Mistral mediante el model builder de onnxruntime-genai (`Mistral3TextModel`, `exclude_embeds=true`, cuantización int4 con `block_size=32` y `accuracy_level=4`). La variante `q4f16` se genera con `-e webgpu` y la `q4` con `-e cpu`. La interfaz ONNX expone `inputs_embeds`, `attention_mask` y `past_key_values.N.{key,value}` como entradas, y `logits` y `present.N.{key,value}` como salidas, de forma que la selección de tokens de entrada y la proyección a vocabulario quedan fuera del grafo. El codificador visual es un Pixtral de 0,4B exportado aparte en fp16.

Una particularidad técnica relevante es el escalado de queries para contexto largo de Ministral 3, que multiplica las queries por `1 + 0,1 · log(1 + floor(posición / 16384))` (la función `get_llama_4_attn_scale` de transformers). El builder de onnxruntime-genai no emite esta operación, por lo que el autor la incorpora manualmente en la proyección de query de cada capa; sin ella, el comportamiento en contextos superiores a 16 384 tokens no sería fiel al modelo original. La configuración de generación no fija muestreo, de modo que los runtimes decodifican de forma greedy por defecto, en línea con la recomendación de Mistral de usar temperaturas inferiores a 0,1.

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens vistos, ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. Se trata de un modelo instruction-tuned con soporte nativo de tool calling, según la model card.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo un modo de pensamiento explícito delimitado por las marcas `[/THINK]`, que la model card usa como referencia para comparar respuestas.
- Comprensión de imágenes: el codificador Pixtral de 0,4B permite tareas `image-text-to-text`, como describir imágenes o responder preguntas sobre su contenido.
- Tool calling / function calling nativo; la paridad verificada incluye un caso de llamada a herramienta meteorológica con 12 tokens idénticos a PyTorch.
- Razonamiento matemático básico y resolución de problemas tipo bat-and-ball, si bien la cuantización a 4 bits altera la respuesta final en este caso (ver limitaciones).
- Soporte multilingüe declarado en 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Contexto largo de hasta 256 000 tokens, con escalado de queries específico para posiciones superiores a 16 384.
- Ejecución en navegador mediante transformers.js y WebGPU, y en CPU mediante onnxruntime, sin necesidad de PyTorch.
- Streaming de tokens a través de `TextStreamer` en transformers.js.

## Casos de uso

- Asistencia documental con contexto largo: con 256 000 tokens de ventana se pueden cargar contratos, informes o bases de código completas en una sola petición y formular preguntas sobre el conjunto, sin necesidad de recuperación fragmentada.
- Análisis de documentos escaneados y capturas: el codificador visual Pixtral permite extraer información de imágenes y combinarla con instrucciones textuales en la misma conversación, por ejemplo para digitalizar albaranes o verificar formularios.
- Agentes con tool calling: el soporte nativo de function calling y la ventana de contexto permiten encadenar varios pasos de razonamiento con llamadas a APIs externas, con la ventaja de que el formato de plantilla de chat se conserva en la exportación ONNX.
- Inferencia en el navegador: con transformers.js y `device: "webgpu"` el modelo se ejecuta del lado del cliente, lo que resulta adecuado para aplicaciones que deben mantener los datos en el dispositivo por motivos de privacidad.
- Despliegue en servidores sin GPU o con onnxruntime en CPU: la variante `q4` con activaciones fp32 está pensada para el backend CPU de onnxruntime-genai, útil para entornos donde no hay CUDA disponible.
- Atención al cliente multilingüe: la cobertura de 11 idiomas permite atender consultas en español, francés, alemán, italiano, portugués y neerlandés con un único modelo, manteniendo conversaciones multi-turno dentro del contexto disponible.
- Extracción de datos estructurados: con temperatura baja (Mistral recomienda < 0,1) y decodificación greedy, el modelo es adecuado para tareas deterministas de clasificación o extracción de campos a JSON.
- Integración en pipelines locales de terceros: el proyecto slicc-ortllama permite cargar este export en un runtime propio compatible con el layout de Mistral, lo que facilita incrustarlo en herramientas de línea de comandos o servicios internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del export no incluye MMLU, HumanEval, GSM8K ni métricas equivalentes, y remite a la model card del modelo base para benchmarks, que no forma parte de los datos proporcionados.

Lo que sí se publica es una verificación de paridad entre el export ONNX y PyTorch (transformers, `Mistral3ForConditionalGeneration`, fp32 en CPU) sobre cinco prompts, con decodificación greedy:

| Prompt | Tokens PyTorch | Coincidencia greedy `q4f16` | Coincidencia greedy `q4` |
|---|---|---|---|
| Problema bat-and-ball | 210 | 0; respuesta distinta | 0; respuesta distinta |
| Llamada a herramienta meteorológica | 12 | idéntica | idéntica |
| Respuesta de una palabra con system prompt propio | 3 | idéntica | idéntica |
| Explicación en alemán | 89 | 7; respuesta distinta | 7; respuesta distinta |
| Descripción de una imagen sintética (visión) | 24 | 17; respuesta distinta | 17; respuesta distinta |

| Variante | Concordancia de argmax con teacher forcing | KL media | KL máxima | Máx. \|Δlogit\| |
|---|---|---|---|---|
| `q4f16` | 93,20 % | 0,03 | 1,2 | 6,57 |
| `q4` | 94,38 % | 0,03 | 0,99 | 6,66 |

El codificador visual `vision_encoder_fp16` presenta frente a PyTorch una diferencia máxima absoluta de 0,0012 y un coseno mínimo de 0,999994. El autor señala que la decodificación greedy a temperatura 0 es una prueba de estrés: un único empate estadístico invertido cambia toda la secuencia posterior, por lo que la divergencia tras muchos tokens idénticos es esperable con pesos de 4 bits y no mide calidad por sí sola; las columnas con teacher forcing son la medida directa de la deriva.

## Requisitos de hardware

- Pesos en VRAM: la variante `q4f16` suma 7,29 GB (decodificador) + 1,34 GB (`embed_tokens_fp16`) + 0,88 GB (`vision_encoder_fp16`) ≈ 9,5 GB. La variante `q4` suma ≈ 10,4 GB. Son estimaciones calculadas a partir de los tamaños de fichero indicados en la model card, no cifras publicadas de consumo real.
- VRAM para inferencia: hay que añadir la KV cache, cuyo tamaño exacto no está disponible en la información proporcionada; con 40 capas y 256 000 tokens de contexto máximo, la cache puede dominar el consumo en secuencias largas. Como orientación, 12 GB de VRAM cubren los pesos de `q4f16` con contexto moderado, y se recomienda 16-24 GB para margen.
- GPU de consumo: sí cabe. `q4f16` es viable en GPUs de 12-16 GB (por ejemplo RTX 4070 Ti Super, RTX 4080, RTX 4090); `q4` encaja con holgura en 16 GB y deja margen en 24 GB. Para contexto cercano a 256k se necesitan GPUs de 40-80 GB.
- GPU de centro de datos: A100 40 GB o 80 GB y H100 son las opciones para servir contexto largo o lotes concurrentes.
- CPU: la variante `q4` está generada para el backend CPU de onnxruntime-genai (activaciones fp32) y puede ejecutarse sin GPU, a costa de latencia mucho mayor.
- Navegador: transformers.js con `device: "webgpu"` ejecuta la variante `q4f16`; el límite práctico es la memoria disponible para la pestaña y del adaptador WebGPU.
- Opciones de despliegue: transformers.js (`AutoModelForImageTextToText`), onnxruntime u onnxruntime-genai, y slicc-ortllama. No se menciona soporte de vLLM, TGI, llama.cpp ni Ollama, que no consumen este layout ONNX de forma nativa.
- Throughput y latencia: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ai-ecoverse/Ministral-3-14B-Instruct-2512-ONNX (esta ficha) | ~14B + 0,4B visión | 256k | ONNX, 4 bits (`q4f16`, `q4`) | Apache 2.0 | Export de terceros, ejecutable en navegador y CPU |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | ~14B + 0,4B visión | 256k | safetensors bf16 | Apache 2.0 | Modelo base del export; requiere PyTorch y mucha más VRAM |
| mistralai/Ministral-3-14B-Instruct-2512 (repo principal) | ~14B + 0,4B visión | 256k | FP8 | Apache 2.0 | Pesos FP8 según la model card del export |
| mistralai/Ministral-3-3B-Instruct-2512-ONNX | ~3B + visión | no disponible | ONNX | Apache 2.0 | Export oficial de Mistral cuyo layout replica este repositorio; menor huella, menor capacidad |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a modelos de otros fabricantes con el mismo tamaño o la misma tarea.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce deriva medible: con teacher forcing la concordancia de argmax es del 93,20 % (`q4f16`) y del 94,38 % (`q4`), con diferencias máximas de logit de 6,57 y 6,66 respectivamente.
- En decodificación greedy, varios prompts divergen pronto y producen respuestas distintas a PyTorch: el acertijo bat-and-ball diverge desde el primer token, la explicación en alemán tras 7 tokens y la descripción de imagen tras 17. Para tareas sensibles al razonamiento exacto conviene validar contra el modelo bf16.
- Es un export no oficial: no lo publica Mistral AI y el autor lo indica explícitamente. No hay garantía de soporte, actualizaciones ni corrección de errores por parte del fabricante original.
- La model card no documenta sesgos conocidos, composición del dataset ni evaluaciones de seguridad; esas comprobaciones dependen de la documentación del modelo base, no incluida aquí.
- Riesgo de alucinación inherente a modelos de lenguaje de esta familia; no se han publicado evaluaciones de fiabilidad en la información disponible.
- La calidad por idioma no está cuantificada: los 11 idiomas aparecen como soportados, sin métricas que permitan asumir un rendimiento homogéneo entre ellos.
- La decodificación por defecto es greedy (sin muestreo en `generation_config.json`), lo que reduce la diversidad; el autor recomienda temperaturas inferiores a 0,1 para uso diario y en producción.
- El contexto de 256k solo es válido con el escalado de queries aplicado manualmente por el exportador; runtimes que reconstruyan el grafo por su cuenta podrían perder esa corrección.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo de Mistral AI conviene conservar los avisos de atribución correspondientes.
- El repositorio incluye dos variantes y pesa 17,7 GB; descargar todo cuando solo se necesita una variante consume ancho de banda y disco innecesarios (la model card propone descargar con `--include` patrones concretos).

## Enlaces

- Repositorio HuggingFace del export: https://huggingface.co/ai-ecoverse/Ministral-3-14B-Instruct-2512-ONNX
- Modelo base (bf16): https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Model card del modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Export ONNX oficial de 3B cuyo layout se replica: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-ONNX
- Mistral AI: https://mistral.ai
- Perfil del exportador: https://github.com/ai-ecoverse
- Runtime slicc-ortllama: https://github.com/ai-ecoverse/slicc-ortllama
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda web proporcionados.
