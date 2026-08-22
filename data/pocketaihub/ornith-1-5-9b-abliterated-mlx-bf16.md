# PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-BF16

## Resumen

Ornith-1.5-9B-Abliterated-MLX-BF16 es un derivado experimental no oficial del modelo multimodal Ornith-1.5-9B, desarrollado por PocketAI Model Lab y publicado bajo el usuario PocketAiHub. El modelo original pertenece a la familia Ornith-1.5 de DeepReinforce, una línea de modelos abiertos (9B, 35B MoE y 397B MoE) diseñada para razonamiento, generacion de codigo y tareas agénticas, que según la compania rinde a la par de Claude Opus 4.8 en dichas tareas. La familia Ornith-1.5 se distingue por su bucle de auto-mejora: el propio modelo propone nuevas tareas, genera scaffolds especificos y produce rollouts de solucion para entrenamiento por refuerzo.

Esta variante concreta convierte el checkpoint original a formato MLX-VLM en precision BF16 y aplica una modificacion de abliteracion a escala 1.0 sobre las capas 12 a 31, suprimiendo el comportamiento aprendido de rechazo. El resultado es un modelo multimodal de 9,4 mil millones de parametros que acepta entradas de texto e imagen, con licencia MIT y pesos en safetensors. Es relevante para desarrolladores que buscan un modelo vision-language de tamano medio con comportamiento de rechazo reducido, aunque con advertencias importantes sobre seguridad y fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (derivada, multimodal vision-language) |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repo); la familia incluye MLX-8bit, MLX-4bit y GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX-VLM) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso multimodal de tipo vision-language, basado en la arquitectura Qwen3.5 (segun el tag `qwen3_5`). Acepta entradas de imagen y texto y produce texto. La familia Ornith-1.5 introduce un marco de auto-scaffolding y auto-mejora: el modelo propone sus propias tareas, genera scaffolds especificos y produce soluciones para entrenamiento por refuerzo, creando continuamente nuevas experiencias de aprendizaje. El checkpoint abliterated no incluye el Multi-Token Prediction (MTP) nativo del modelo original.

El proceso de abliteracion se aplico con escala 1.0, tomando la direccion de rechazo de la capa 23 y modificando los tensores de salida residual de las capas 12 a 31 (40 tensores en total). La validacion reportada incluye 0/100 frases de rechazo explicito dañino, 0/100 frases de rechazo benigno, y una suite de capacidades medias con 71/80 aciertos, cubriendo matematicas, razonamiento, manejo de premisas falsas, seguimiento de instrucciones, codigo, salida estructurada, produccion multilingue, comprension de contexto y coherencia general.

## Capacidades

- Generacion de texto y razonamiento multiuso, con soporte para matematicas, razonamiento logico y comprension de contexto.
- Generacion de codigo y salida estructurada (JSON u otros formatos).
- Procesamiento de imagenes como entrada (vision-language), capaz de responder preguntas sobre contenido visual.
- Produccion multilingue, aunque los idiomas concretos no estan documentados en la informacion disponible.
- Comportamiento de rechazo suprimido por abliteracion, lo que reduce los mensajes de rechazo explícito ante peticiones dañinas o benignas.
- Sin soporte de tool calling o function calling documentado en esta variante.
- Sin modo de pensamiento (thinking mode) explicito documentado.

## Casos de uso

- Analisis de documentos visuales: el modelo puede procesar imagenes y extraer informacion textual, adecuado para OCR, descripcion de diagramas o interpretacion de capturas de pantalla.
- Generacion de codigo asistida con contexto visual: permite describir una interfaz o diagrama y obtener codigo de implementacion, util en entornos de desarrollo.
- Razonamiento matematico multimodal: puede resolver problemas que combinan texto e imagen, como ejercicios de geometria o tablas.
- Experimentacion con alineacion de seguridad: la version abliterated permite estudiar los efectos de la eliminacion de rechazo en el comportamiento del modelo, para investigacion academica.
- Generacion de contenido creativo: la reduccion de rechazo puede facilitar la produccion de narrativas o dialogos sin restricciones frecuentes, aunque con riesgo de contenido inapropiado.
- Evaluacion de la robustez del modelo: la suite de validacion reportada (71/80) permite comparar el rendimiento de la version abliterated frente a la original en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta variante especifica. La validacion incluida en el repositorio reporta una suite de capacidades medias con 71/80 aciertos, que cubre matematicas, razonamiento, manejo de premisas falsas, seguimiento de instrucciones, codigo, salida estructurada, produccion multilingue, comprension de contexto y coherencia. El articulo de DeepReinforce indica que la familia Ornith-1.5 rinde a la par de Claude Opus 4.8 en razonamiento, codigo y tareas agénticas, pero no se proporcionan numeros concretos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de memoria en la prueba de humo fue de 19,04 GB en precision BF16. Se recomienda al menos 20 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB. En consumer GPU con 24 GB VRAM cabe el modelo completo en BF16.
- En cuantizaciones inferiores (MLX-8bit o MLX-4bit) el consumo de memoria se reduce significativamente, permitiendo GPU de 12-16 GB.
- Despliegue: se carga con MLX-VLM mediante `mlx_vlm.generate --model PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-BF16`. Tambien disponible en formato GGUF para llama.cpp y herramientas compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9,41B | no disponible | Si | MIT | Modelo original sin abliteracion, con MTP nativo |
| Ornith-1.5-9B-Abliterated (este) | 9,41B | no disponible | Si | MIT | Version abliterated, sin MTP, rechazo suprimido |
| Qwen2.5-VL-7B | 7,6B | 128K | Si | Apache 2.0 | Alternativa multimodal de tamano similar, con contexto largo |
| Llama-3.2-11B-Vision | 11B | 128K | Si | Llama 3.2 Community | Vision-language de 11B, contexto largo, licencia propietaria |

La comparativa se basa en datos publicos de los modelos alternativos; los parametros de contexto y rendimiento de Ornith-1.5-9B no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteratura suprime el comportamiento aprendido de rechazo: el modelo puede producir contenido dañino, ilegal, ofensivo, enganoso o incorrecto con mayor facilidad que el modelo original.
- La abliteratura no es entrenamiento de veracidad ni una mejora de capacidades: no garantiza cumplimiento universal ni correccion de hechos.
- El modelo puede generar alucinaciones o informacion falsa, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- El sistema de validacion de rechazo es basado en frases y no detecta redirecciones semanticas: 0/100 no implica un modelo totalmente sin censura ni universalmente complaciente.
- La suite de validacion usa ejecuciones de 256 tokens, que son pantallas de rechazo temprano y no evaluaciones completas de respuestas largas.
- No se incluye el MTP nativo del modelo original, lo que puede afectar al rendimiento de generacion.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que limita el uso en produccion.
- La licencia MIT permite uso comercial, pero la responsabilidad del contenido generado recae en el usuario final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-BF16
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Articulo de DeepReinforce sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Noticia sobre el lanzamiento de Ornith-1.5: https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/
- Sitio web de Ornith AI: https://ornith.ai/
- Ficha de Ornith 1.5 en There's An AI For That: https://theresanaiforthat.com/model/ornith-1-5/
