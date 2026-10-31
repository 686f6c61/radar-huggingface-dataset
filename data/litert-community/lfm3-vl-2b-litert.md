# litert-community/LFM3-VL-2B-LiteRT

## Resumen

LFM3-VL-2B-LiteRT es una conversión del modelo vision-language LFM3-VL-2B de Liquid AI al formato LiteRT-LM (TensorFlow Lite para LLMs en dispositivo), publicada por la organización litert-community en HuggingFace. El modelo original, de 1,92 mil millones de parámetros, está diseñado para comprensión visual en dispositivos edge: lee texto e imágenes y, por defecto, razona en un bloque `<think>` antes de responder. Esta conversión permite ejecutarlo localmente en móviles Android y en Mac, sin depender de la nube.

Su relevancia reside en el rendimiento medido sobre hardware real: en la GPU de un Galaxy S26, el fichero cuantizado a int4 decodifica 37,88 tokens/s tras un prompt de 1.024 tokens, frente a 14,96 tokens/s del fichero en float16, es decir, 2,5 veces más rápido. Además, mantiene un margen de memoria superior a 1,4 GB respecto al límite de pruebas en un Pixel 8a, donde el fichero float16 se sitúa justo en ese límite.

La arquitectura del modelo base es híbrida: el decodificador de texto LFM3 (1,73B) combina 13 convoluciones cortas con puertas, 5 capas de atención deslizante y 6 de atención global en 24 capas; el codificador de visión (164M) usa 8 convoluciones 2D depthwise con puertas y 6 capas de atención bidireccional; y un proyector de 25M conecta ambos módulos. El repositorio ofrece dos variantes: int4 (2,07 GB) y float16 (4,44 GB), ambas con contexto de 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: decodificador LFM3 con convoluciones con puertas y atención (sliding-window + global), codificador de visión con convoluciones depthwise y atención bidireccional, y proyector |
| Parametros totales | 1,92B (1,73B decodificador de texto + 164M codificador de visión + 25M proyector) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2.048 tokens (en los ficheros LiteRT-LM) |
| Tipos de cuantizacion | int4 (bloques de 32, proyección de salida int8, tabla de embeddings int8) y float16; pesos del codificador de visión en fp32 y adaptador en fp16 en ambas variantes |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | .litertlm (LiteRT-LM / TFLite); el modelo base también tiene checkpoints GGUF, MLX y ONNX publicados por Liquid AI |

## Arquitectura y entrenamiento

El decodificador de lenguaje LFM3 consta de 24 capas con una mezcla novedosa: 13 capas de convolución corta con puertas (gated short convolutions), 5 capas de atención con ventana deslizante y 6 capas de atención global. Esta combinación busca reducir coste computacional y memoria en inferencia en dispositivo manteniendo capacidad de razonamiento. El codificador de visión tiene 14 capas (8 convoluciones 2D depthwise con puertas y 6 de atención bidireccional) y procesa cada imagen como 256 tokens a resolución 512 × 512. Un proyector de 25M parámetros alinea las representaciones visuales con el espacio del decodificador.

Sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay información disponible en el material proporcionado. El modelo incorpora un modo de razonamiento ("thinking") que genera un bloque `<think>` antes de la respuesta final, activado por defecto y desactivable. Los ficheros LiteRT no incluyen sampler, por lo que la decodificación es greedy salvo configuración manual; la model card del modelo original recomienda temperatura 0,1.

## Capacidades

- Comprensión visual-language: responde preguntas sobre imágenes (pipeline image-text-to-text); en pruebas del autor acertó todas las preguntas con respuesta única planteadas en un Galaxy S26, un Pixel 8a y un Mac (7, 7 y 18 preguntas respectivamente), con thinking activado y desactivado.
- Generación de texto con razonamiento previo: por defecto produce un bloque `<think>` antes de la respuesta; se puede desactivar con `--thinking false` o `{"enable_thinking": False}`.
- Lectura de texto e imágenes; el modelo base también lee vídeo, pero los ficheros de este repositorio no lo incluyen.
- Ejecución 100 % en dispositivo (on-device) con backends GPU y CPU vía LiteRT-LM.
- API en Python (litert-lm) y herramienta de línea de comandos para integración en aplicaciones móviles y de escritorio.
- No hay información disponible sobre tool calling, agentes ni capacidades multilingües más allá del inglés.

## Casos de uso

- Apps móviles de lectura de señales y texto en imágenes: con contexto de 2.048 tokens y 256 tokens por imagen, una app Android puede extraer texto de carteles o etiquetas sin conexión, como muestra el ejemplo del prompt sobre un cartel amarillo.
- Asistentes visuales offline en smartphones: el fichero int4 cabe con margen en un Pixel 8a (más de 1,4 GB por debajo del límite de memoria en pruebas) y decodifica a ~38 tokens/s en GPUs móviles recientes, adecuado para respuestas interactivas.
- Accesibilidad: descripción de imágenes y lectura de texto para usuarios con discapacidad visual, ejecutándose localmente sin enviar fotos a la nube.
- Verificación visual en dispositivos edge (retail, logística): comprobación de etiquetas, códigos o contenidos en tabletas y terminales sin infraestructura de servidor.
- Prototipado multimodal en Mac: ejecución local en GPU o CPU de Mac para pruebas de pipelines de visión-language con la API Python de litert-lm.
- Integración en apps con privacidad por diseño: al procesarse todo en el dispositivo, es adecuado para fotografía médica, documentos personales u otros contenidos sensibles que no deban salir del terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento medidos por el autor de la conversión son:

| Medición | int4 | float16 |
|---|---|---|
| Decodificación en Galaxy S26 GPU (tras prompt de 1.024 tokens) | 37,88 tokens/s | 14,96 tokens/s |
| Margen de memoria en Pixel 8a | >1,4 GB sobre la línea de parada | En la línea de parada |
| Aciertos en preguntas visuales con respuesta única (S26 / Pixel 8a / Mac) | Correcto en todas (7/7, 7/7, 18/18) | Correcto al menos con la misma frecuencia |
| Fidelidad al texto del modelo original | Ligeramente inferior | Más fiel a la redacción exacta |

## Requisitos de hardware

- VRAM/memoria estimada: 2,07 GB de fichero para la variante int4 y 4,44 GB para la float16; en un Pixel 8a la variante int4 deja más de 1,4 GB de margen sobre el límite de memoria de las pruebas del autor, mientras que la float16 se sitúa en ese límite.
- Dispositivos verificados: Galaxy S26 (GPU), Pixel 8a (GPU) y Mac (GPU y CPU). Se recomienda el fichero int4 en GPU móvil y en Mac GPU; en Mac CPU el int4 decodifica más rápido pero hace el prefill más lentamente que el float16.
- Cabe en GPUs móviles de gama alta y en portátiles/de escritorio con GPU integrada de Apple; no disponible información sobre GPUs de servidor concretas (A100, H100, RTX 4090).
- Despliegue: LiteRT-LM 0.18.1 (CLI vía `uvx --from litert-lm==0.18.1 litert-lm run ...` o API Python `pip install litert-lm==0.18.1`), con backends GPU para texto y visión. No aplica vLLM, llama.cpp ni TGI para este formato.
- Las imágenes deben redimensionarse a 512 × 512 antes de la inferencia (LiteRT-LM 0.18.1 estira cualquier imagen a esa resolución sin conservar relación de aspecto ni orientación EXIF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-LiteRT (esta ficha) | 1,92B | 2.048 tokens | .litertlm (int4, f16) | lfm1.0 | Optimizado para on-device; 37,88 tokens/s en Galaxy S26 GPU (int4) |
| LiquidAI/LFM3-VL-2B (modelo base) | 1,92B | no disponible en la información proporcionada | safetensors (más GGUF, MLX, ONNX oficiales) | lfm1.0 | Modelo original; soporta además vídeo |
| LiquidAI/LFM3-VL-2B-GGUF | 1,92B | no disponible | GGUF | lfm1.0 | Alternativa para ecosistemas llama.cpp |

No hay información disponible en el material proporcionado para comparar rendimientos numéricos con otros modelos vision-language pequeños (por ejemplo, variantes de Qwen-VL o SmolVLM).

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés (en); no hay información sobre rendimiento en castellano u otros idiomas.
- Contexto limitado a 2.048 tokens en los ficheros LiteRT-LM, con 256 tokens consumidos por cada imagen, lo que restringe conversaciones largas o documentos extensos.
- Preprocesamiento obligatorio: hay que enderezar la foto (orientación EXIF) y redimensionarla a 512 × 512; LiteRT-LM 0.18.1 no conserva la relación de aspecto ni la orientación, lo que puede degradar resultados con imágenes no cuadradas.
- Vídeo: el modelo base lo lee, pero estos ficheros no lo incluyen.
- Thinking: con el modo activado las respuestas pueden ser largas (hasta 541 tokens de razonamiento observados con int4); conviene asignar suficiente `max_output_tokens` (por ejemplo, 1.024).
- Decodificación greedy por defecto al no incluir los ficheros sampler; la model card original recomienda temperatura 0,1.
- La variante int4 puede desviarse ligeramente de la redacción exacta del modelo original; la float16 es más fiel pero consume mucha más memoria.
- Licencia: LFM Open License v1.0, una licencia personalizada ("other"); hay que revisar sus términos antes de uso comercial.
- Riesgo de alucinación y sesgos: no hay información específica publicada en el material proporcionado; como todo modelo vision-language pequeño, las respuestas sobre imágenes deben validarse en casos críticos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/litert-community/LFM3-VL-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Checkpoint GGUF oficial: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Checkpoint MLX 4-bit oficial: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-4bit
- Checkpoint ONNX oficial: https://huggingface.co/LiquidAI/LFM3-VL-2B-ONNX
- Licencia: https://huggingface.co/litert-community/LFM3-VL-2B-LiteRT/blob/main/LICENSE
