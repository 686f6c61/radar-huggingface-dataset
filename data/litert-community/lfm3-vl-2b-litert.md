# litert-community/LFM3-VL-2B-LiteRT

## Resumen

LFM3-VL-2B-LiteRT es la conversión al formato LiteRT-LM del modelo vision-language LFM3-VL-2B de Liquid AI, publicada por la comunidad litert-community. El modelo original es un sistema multimodal de 1,92 mil millones de parámetros diseñado específicamente para inferencia en dispositivo (on-device), capaz de leer texto, imágenes y vídeo, y que por defecto razona en un bloque `<think>` antes de responder. Esta conversión empaqueta los pesos en archivos `.litertlm` optimizados para ejecutarse con el runtime LiteRT-LM en GPUs de móviles y ordenadores, sin necesidad de infraestructura de servidor.

La relevancia de esta ficha radica en que demuestra que un modelo multimodal con razonamiento explícito puede ejecutarse en hardware de consumo: en una Galaxy S26 con GPU, el archivo int4 decodifica 37,88 tokens/s tras un prefill de 1.024 tokens, frente a 14,96 tokens/s del archivo float16. La conversión incluye tres variantes (int4 con contexto 2.048, int4 con contexto 4.096 y float16 con contexto 2.048) y mantiene el codificador visual en fp32 y el adaptador en fp16, con la tabla de embeddings en int8.

El modelo base emplea una arquitectura híbrida poco convencional: 24 capas en el decodificador de texto (13 convoluciones cortas con compuerta, 5 atenciones de ventana deslizante y 6 atenciones globales), un codificador visual de 14 capas y un proyector de 25 millones de parámetros. Está pensado para tareas de comprensión visual en el borde, como responder preguntas sobre fotos o localizar objetos, y su licencia LFM1.0 condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: decodificador de texto con 13 convoluciones cortas con compuerta, 5 atenciones de ventana deslizante y 6 atenciones globales; codificador visual de 14 capas (8 convoluciones depthwise 2D con compuerta, 6 atenciones bidireccionales); proyector de 25M |
| Parametros totales | 1,92B (1,73B decodificador de texto + 164M codificador visual + 25M proyector) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (int4 y f16); 4.096 tokens (int4_ctx4096) |
| Tipos de cuantizacion | int4 (pesos en bloques de 32, proyección de salida int8, embeddings int8, codificador visual fp32, adaptador fp16); fp16 (decodificador, embeddings int8, codificador visual fp32, adaptador fp16) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM1.0 (other) |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base también ofrece GGUF, MLX-4bit y ONNX |

## Arquitectura y entrenamiento

El decodificador de texto de LFM3-VL-2B es un transformer híbrido de 24 capas que combina convoluciones cortas con compuerta (13 capas), atención de ventana deslizante (5 capas) y atención global (6 capas). Esta mezcla busca reducir el coste computacional de la atención completa manteniendo la capacidad de modelar dependencias de largo alcance, algo crítico en hardware de borde. El codificador visual consta de 14 capas con convoluciones depthwise 2D y atención bidireccional, y un proyector de 25M de parámetros alinea las representaciones visuales con el espacio del decodificador. Cada imagen de 512 × 512 se tokeniza en 256 tokens.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La conversión a LiteRT-LM se realizó con litert-torch (release 0.10.0 para el codificador visual, commit f61d0b7 de main para el decodificador de texto) y litert-lm-builder 0.18.1. Una innovación destacable es el modo de razonamiento por defecto: el modelo genera un bloque `<think>` antes de la respuesta final, lo que motivó la variante con contexto de 4.096 tokens para evitar que el pensamiento agote la ventana.

## Capacidades

- Generación de texto y respuesta a preguntas sobre imágenes (image-text-to-text).
- Razonamiento explícito mediante bloque `<think>` activable o desactivable.
- Comprensión visual: lectura de texto en imágenes, descripción de escenas y localización de objetos en fotos.
- Procesamiento de vídeo en el modelo base (no incluido en esta conversión LiteRT-LM, que solo acepta texto e imágenes).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes multi-paso en la información disponible.

## Casos de uso

- Asistencia visual en móvil sin conexión: el archivo int4 se ejecuta en la GPU de una Galaxy S26 a 37,88 tokens/s, permitiendo responder preguntas sobre fotos tomadas por el usuario sin enviar imágenes a la nube.
- Lectura de carteles y documentos en el dispositivo: el modelo responde correctamente a preguntas sobre texto en imágenes (verificado en Galaxy S26, Pixel 8a y Mac), útil para accesibilidad o traducción visual local.
- Localización de objetos en fotografías: con el archivo int4_ctx4096 y thinking activo, respondió correctamente 21 de 30 solicitudes de posicionamiento de objetos, adecuado para guiar al usuario en tareas de composición fotográfica.
- Asistentes de campo para inspección visual: en un Pixel 8a con límite de memoria, el archivo int4 mantiene más de 1,4 GB de margen frente al float16, lo que permite desplegarlo en flujos de inspección de equipos o inventario.
- Prototipado de aplicaciones edge multimodales: la disponibilidad de variantes int4 y fp16 con distintos contextos facilita comparar latencia y precisión antes de fijar una configuración de producción.
- Análisis de imágenes en entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo mediante LiteRT-LM, las imágenes no salen del terminal, lo que encaja en sectores regulados.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir el rendimiento de LiteRT-LM frente a GGUF, MLX u ONNX sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento publicados son mediciones de velocidad y precisión cualitativa:

| Metrica | int4 (ctx 2048) | int4_ctx4096 | f16 |
|---|---|---|---|
| Decodificacion en Galaxy S26 GPU (tras prefill de 1.024 tokens) | 37,88 tok/s | 34,35 tok/s | 14,96 tok/s |
| Decodificacion en Mac GPU | No disponible | 11 % mas lenta que int4 | No disponible |
| Preguntas de imagen con respuesta unica correcta (Galaxy S26, Pixel 8a, Mac) | 7, 7 y 18 correctas | No disponible | No disponible |
| Solicitudes de localizacion de objeto (thinking on, Mac GPU) | 17 de 30 correctas; 7 sin respuesta por agotar contexto | 21 de 30 correctas; 0 sin respuesta | No disponible |
| Margen de memoria en Pixel 8a | >1,4 GB por encima del limite de prueba | No disponible | En el limite |

## Requisitos de hardware

- VRAM/almacenamiento: el archivo int4 ocupa 2,07 GB y el float16 4,44 GB; en el Pixel 8a el int4 mantiene más de 1,4 GB de margen sobre el límite de memoria de la prueba, mientras el float16 queda justo en el límite.
- GPU recomendadas: GPU integradas de móviles de gama alta (Galaxy S26, Pixel 8a) y GPU de Mac; no se documentan requisitos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en las GPU móviles citadas; el archivo int4 es la opción recomendada para dispositivos con memoria ajustada.
- Opciones de despliegue: runtime LiteRT-LM 0.18.1 (CLI `litert-lm run` con `--backend gpu --vision-backend gpu`); el modelo base ofrece GGUF, MLX-4bit y ONNX para otros entornos.
- Latencia y throughput: 37,88 tok/s (int4, Galaxy S26 GPU) y 14,96 tok/s (f16, mismo dispositivo) tras un prefill de 1.024 tokens; el int4_ctx4096 decodifica un 9 % más lento que el int4 en Galaxy S26 y un 11 % más lento en Mac GPU.
- Preprocesado obligatorio: LiteRT-LM 0.18.1 estira toda imagen a 512 × 512 sin preservar relación de aspecto ni orientación EXIF, por lo que hay que rotar y redimensionar antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-LiteRT (esta ficha) | 1,92B | 2.048 / 4.096 | `.litertlm`, LiteRT-LM | LFM1.0 | Optimizado para GPU móvil; thinking por defecto |
| LiquidAI/LFM3-VL-2B (base) | 1,92B | No disponible | Safetensors y variantes GGUF, MLX-4bit, ONNX | LFM1.0 | Modelo fuente; incluye vídeo |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- La conversión LiteRT-LM no incluye procesamiento de vídeo, aunque el modelo base sí lo soporta.
- El preprocesado de imagen es rígido: LiteRT-LM 0.18.1 estira a 512 × 512 sin respetar relación de aspecto ni orientación EXIF, lo que puede degradar resultados si no se prepara la imagen.
- Con thinking activo y contexto de 2.048 tokens, el bloque de razonamiento puede agotar la ventana antes de emitir respuesta (ocurrió en 7 de 30 solicitudes de localización de objetos); se recomienda la variante de 4.096 tokens en esos casos.
- El archivo float16 en el Pixel 8a queda en el límite de memoria de la prueba, con riesgo de fallo en dispositivos con menos RAM.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones formales de sesgo.
- La licencia LFM1.0 es de tipo "other" y condiciona el uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- La información disponible no incluye datos sobre sesgos conocidos ni sobre el dataset de entrenamiento del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM3-VL-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF oficial: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- MLX-4bit oficial: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-4bit
- ONNX oficial: https://huggingface.co/LiquidAI/LFM3-VL-2B-ONNX
- Licencia LFM1.0: https://huggingface.co/litert-community/LFM3-VL-2B-LiteRT/blob/main/LICENSE
