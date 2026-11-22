# litert-community/North-Micro-Vision-Instruct

## Resumen

North-Micro-Vision-Instruct es un modelo de visión-lenguaje (VLM) de 2,48 mil millones de parámetros desarrollado originalmente por Cohere Labs. Combina una torre de visión SigLIP2 de escala SO400M (400 millones de parámetros, con codificador de estilo Qwen3-VL y fusionadores DeepStack) con un decodificador Cohere de 2 mil millones de parámetros, entrenado para 11 idiomas. El modelo resuelve la tarea de respuesta fundamentada sobre imágenes y texto, es decir, adjuntar una imagen y formular preguntas sobre ella obteniendo respuestas contextualizadas.

La versión aquí descrita es la conversión realizada por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`), pensada para inferencia totalmente en dispositivo (on-device) mediante el runtime LiteRT-LM de Google. Se trata de la primera familia de modelos Cohere disponible en este formato, y su relevancia actual radica en que permite ejecutar un VLM multimodal en teléfonos de gama alta sin conexión a la nube, con latencias medidas y un consumo de memoria acotado.

El repositorio ocupa 23,2 GB e incluye dos variantes de pesos: una cuantización int8 dinámica (wi8, 3,07 GB, primaria) y una int4 blockwise de 32 (2,19 GB, para entornos con restricciones de tamaño). La ventana de contexto declarada para la caché KV es de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: torre de visión ViT (27 bloques, hidden 1152, 16 cabezas, patch 16) + decodificador transformer Cohere de 28 capas con GQA (kv8), bloques paralelos attn+MLP, atención deslizante/completa 3:1 y embeddings atados de 262k vocabulario |
| Parametros totales | 2,48 mil millones (400M visión + 2B decodificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV) |
| Tipos de cuantizacion | int8 dinámica (wi8) e int4 blockwise-32; activaciones en precisión mixta fp32_fp16 |
| Idiomas soportados | 11 idiomas (entrenado para 11 idiomas; lista concreta no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); dos ficheros: `North-Micro-Vision-Instruct_wi8.litertlm` y `North-Micro-Vision-Instruct_int4.litertlm` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal de dos torres. La torre de visión es un ViT de 27 bloques con dimensión oculta 1152, 16 cabezas de atención y parches de 16×16, configurado de forma estática a 512×512 píxeles, lo que produce 1024 parches que se reducen mediante un merge 2×2 a 256 tokens de imagen. Incorpora fusionadores DeepStack (tres embeddings de visión adicionales) que en esta conversión se han plegado en un único embedding de imagen. El adaptador (patch merger más los tres mergers DeepStack sumados) proyecta la salida al tamaño oculto de texto de 2048.

El decodificador es un transformer Cohere de 2B con 28 capas, GQA con 8 cabezas KV, bloques paralelos de atención y MLP, patrón de atención deslizante/completa en proporción 3:1 y embeddings atados con vocabulario de 262k. Los pesos se cuantizan en int8 dinámico o int4 blockwise-32, con un embedder externo en int8 y activaciones en precisión mixta fp32_fp16 declaradas en el fichero. La normalización de imagen `(x/255−0.5)/0.5` está integrada en el codificador. El formato de chat usa tokens de turno de Cohere (`<|START_OF_TURN_TOKEN|><|USER_TOKEN|>…<|END_OF_TURN_TOKEN|>`), BOS id 2, y la imagen se representa como `<|VISION_START|><image_soft_token><|VISION_END|>`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento sobre contenido visual (image-text-to-text).
- Comprensión de imágenes: la entrada se redimensiona a 512×512 y se procesa en 256 tokens de imagen.
- Respuesta fundamentada (grounded) sobre imágenes adjuntas, apta para preguntas y respuestas visuales.
- Capacidades multilingües: entrenado para 11 idiomas (lista concreta no disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: solo visión; no se documentan otras.

## Casos de uso

- Asistencia visual en dispositivo: el modelo permite adjuntar una foto y formular preguntas sobre ella sin enviar datos a la nube, gracias a su ejecución íntegra en el dispositivo con LiteRT-LM y su ventana de 4096 tokens.
- Accesibilidad para personas con discapacidad visual: descripción de imágenes capturadas por la cámara del teléfono en tiempo real, con latencias de decodificación de 10,4 tok/s en Galaxy S26 y 13,6 tok/s en iPhone 17 Pro.
- Escaneo y extracción de información de documentos: lectura de tickets, etiquetas o formularios fotografiados, aprovechando los 256 tokens de imagen y la ventana de contexto para incluir instrucciones adicionales.
- Clasificación y moderación de imágenes en el borde: análisis local de contenido visual en aplicaciones móviles sin coste de API ni dependencia de conectividad.
- Asistentes de campo offline: técnicos en entornos sin cobertura que necesitan identificar componentes, leer paneles o interpretar señales visuales mediante un modelo que corre en el propio dispositivo.
- Prototipado de aplicaciones VLM móviles: la disponibilidad de dos cuantizaciones (3,07 GB int8 y 2,19 GB int4) permite ajustar el equilibrio entre calidad y huella de memoria según el hardware objetivo.
- Traducción y comprensión multimodal en 11 idiomas: procesamiento de texto e imágenes en aplicaciones de viaje o atención al cliente multilingüe en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado mediciones de rendimiento de inferencia:

| Plataforma | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT |
|---|---|---|---|---|
| Apple M4 Max (wi8) | CPU | 671,8 | 27,3 | no disponible |
| Apple M4 Max (wi8) | GPU | 1236,6 | 80,6 | no disponible |
| Galaxy S26 (int4) | GPU | 241 (1024 tokens) | 23,3 | no disponible |
| Galaxy S26 (wi8, fichero anterior) | GPU | 280 | 10,4 | 810 ms |
| Pixel 8a (wi8, fichero anterior) | GPU decoder + CPU vision | 124,5 | 4,3–4,4 | 2,41 s |
| Pixel 8a (wi8, texto solo) | GPU | 181,1 | 6,4 | no disponible |
| iPhone 17 Pro (wi8, fichero anterior) | Metal | 244 | 13,6 | 685 ms |

En el Pixel 8a, el backend CPU decodificó 0,6 tok/s con el fichero wi8 anterior, por lo que se recomienda ejecutar el decodificador en GPU. En el iPhone 17 Pro el pico de memoria residente fue de 2,9–3,0 GB con el ejecutor de visión cargado (2,1 GB solo texto). En el Galaxy S26, el fichero int4 incrementó el contador de asignación GPU del dispositivo (`kgsl_page_alloc`) en 6,02 GB, frente a 4,74 GB del fichero int4 anterior.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero wi8 ocupa 3,07 GB y el int4 2,19 GB; el pico residente medido en iPhone 17 Pro con visión fue de 2,9–3,0 GB.
- GPU recomendadas: GPU integradas de smartphones de gama alta (Galaxy S26, Pixel 11 Pro, iPhone 17 Pro), GPU Apple Silicon (M4 Max) y GPUs de escritorio compatibles con LiteRT-LM.
- ¿Cabe en GPU de consumo? Sí, en GPU Apple Silicon y en las GPU móviles citadas; no se dispone de datos para GPUs de escritorio NVIDIA concretas.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.16.x y 0.19.x documentadas); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks. En Galaxy S26 con int4 se alcanzan 23,3 tok/s de decodificación y 241 tok/s de prefill; en Pixel 8a con wi8, 4,3 tok/s de decodificación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia estructural, el modelo base es `CohereLabs/North-Micro-Vision-Instruct` (Apache-2.0), del que esta versión es una conversión cuantizada al formato LiteRT-LM; la comparación con otras alternativas de la misma categoría (otros VLM de ~2-3B en formato on-device) no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no documentado específicamente; como todo VLM, puede generar descripciones no fundamentadas en la imagen.
- Limitación de contexto: la caché KV está fijada en 4096 tokens, lo que limita conversaciones multi-turno largas o imágenes con instrucciones extensas.
- Limitación de resolución: la imagen se fuerza a 512×512, lo que puede degradar la lectura de texto pequeño o detalles finos.
- Idiomas: se indica entrenamiento para 11 idiomas, pero no se detalla la lista ni la cobertura real por idioma.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base.
- Caveat de producción: el fichero int4 solo se ha probado con LiteRT-LM 0.19.0–0.19.2; las versiones anteriores del runtime no se probaron con él. El fichero wi8 no se volvió a medir tras la actualización del int4, por lo que las cifras de wi8 e int4 no son directamente comparables.
- En Pixel 8a el backend CPU es inviable (0,6 tok/s); es necesario delegar en GPU.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/North-Micro-Vision-Instruct
- Modelo base: https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/north-micro-vision-instruct-wi8/CARD.md
- Issue de LiteRT-LM sobre medición de init: https://github.com/google-ai-edge/LiteRT-LM/issues/4057
