# litert-community/LFM3-VL-2B-LiteRT

## Resumen

LFM3-VL-2B-LiteRT es una conversión al formato LiteRT-LM del modelo vision-language LFM3-VL-2B desarrollado por Liquid AI, publicada por la comunidad litert-community. El modelo original es un sistema multimodal de 1.92B parámetros diseñado específicamente para inferencia en dispositivo (on-device) y en el borde (edge), capaz de procesar texto e imágenes y de razonar mediante un bloque `<think>` antes de responder. Esta conversión permite ejecutar el modelo en GPUs móviles y de escritorio mediante el runtime LiteRT-LM, sin necesidad de infraestructura en la nube.

La arquitectura combina un decodificador de lenguaje LFM3 de 1.73B parámetros (24 capas: 13 convoluciones cortas con compuertas, 5 atenciones de ventana deslizante y 6 atenciones globales) con un codificador visual de 164M parámetros (14 capas: 8 convoluciones 2D depthwise con compuertas y 6 atenciones bidireccionales) y un proyector de 25M. Cada imagen se tokeniza en 256 tokens a resolución 512 × 512. El modelo está pensado para escenarios donde la privacidad, la latencia y el consumo energético son críticos, como aplicaciones móviles de asistencia visual o análisis de documentos en el dispositivo.

La relevancia actual de esta ficha radica en que demuestra la viabilidad de desplegar modelos multimodales con razonamiento en hardware de consumo: según la model card, la variante int4 alcanza 37.88 tokens/s en la GPU de un Galaxy S26 tras un prefill de 1,024 tokens, frente a 14.96 tokens/s de la variante fp16. La licencia lfm1.0 impone restricciones que deben evaluarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LFM3 (13 convoluciones cortas con compuertas + 5 atenciones de ventana deslizante + 6 atenciones globales) + codificador visual (8 convoluciones depthwise 2D + 6 atenciones bidireccionales) + proyector |
| Parametros totales | 1.92B (1.73B lenguaje + 164M visión + 25M proyector) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2,048 tokens (`LFM3-VL-2B_int4.litertlm`, `LFM3-VL-2B_f16.litertlm`); 4,096 tokens (`LFM3-VL-2B_int4_ctx4096.litertlm`) |
| Tipos de cuantizacion | int4 (bloques de 32, proyección de salida int8, embeddings int8), fp16 (embeddings int8), codificador visual fp32, adaptador fp16 |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | `.litertlm` (TFLite/LiteRT-LM); el repositorio base ofrece GGUF, MLX y ONNX |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B emplea una arquitectura híbrida poco convencional que sustituye la mayoría de las capas de atención por convoluciones cortas con compuertas (gated short convolutions), reservando la atención para ventanas deslizantes y globales. El decodificador de lenguaje tiene 24 capas distribuidas en 13 convoluciones, 5 atenciones de ventana deslizante y 6 atenciones globales, una configuración que busca reducir el coste computacional y de memoria en inferencia secuencial, algo crítico en dispositivos móviles. El codificador visual, de 14 capas, combina convoluciones depthwise 2D con compuertas y atención bidireccional, y proyecta cada imagen a 256 tokens a 512 × 512 píxeles mediante un proyector de 25M parámetros.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo incorpora por defecto un modo de razonamiento que genera un bloque `<think>` antes de la respuesta final, lo que permite activar o desactivar el razonamiento según la tarea. La conversión a LiteRT-LM se realizó con litert-torch 0.10.0 (codificador visual) y una versión de su rama principal (decodificador de texto), junto con litert-lm-builder 0.18.1 para LiteRT-LM 0.18.1.

## Capacidades

- Generación de texto y razonamiento multimodal: responde preguntas sobre imágenes combinando comprensión visual y lenguaje natural.
- Modo de razonamiento explícito (`<think>`): genera una cadena de pensamiento interna antes de la respuesta, activable o desactivable.
- Comprensión de imágenes: lectura de texto en imágenes, descripción de escenas y localización de objetos (la model card menciona tareas de "colocar un objeto en una foto").
- Procesamiento de vídeo en el modelo base (no incluido en esta conversión LiteRT-LM, que solo acepta texto e imágenes).
- Soporte multilingüe limitado al inglés.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del bloque de pensamiento.
- Inferencia on-device en GPU móvil y de escritorio mediante el runtime LiteRT-LM.

## Casos de uso

- Asistencia visual en dispositivos móviles: una aplicación Android puede enviar fotos a 512 × 512 y obtener respuestas en inglés sobre su contenido, ejecutando el modelo int4 en la GPU del teléfono (37.88 tokens/s en Galaxy S26) sin enviar datos a la nube.
- Lectura de texto en imágenes (OCR asistido): el modelo responde a preguntas como "¿qué palabras aparecen en la imagen?", útil para accesibilidad o digitalización rápida de carteles y documentos.
- Localización de objetos en fotografías: con el archivo de contexto 4,096 y el modo de pensamiento activado, puede indicar dónde colocar o encontrar un objeto en una escena (21 de 30 aciertos en las pruebas del autor).
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, es adecuado para entornos sanitarios, legales o industriales donde las imágenes no pueden salir del terminal.
- Prototipado de interfaces multimodales en edge: desarrolladores que quieran validar flujos image-text-to-text en hardware de consumo pueden usar los archivos `.litertlm` con el CLI de LiteRT-LM 0.18.1.
- Análisis de documentos en campo: técnicos que trabajen sin conectividad pueden fotografiar equipos o etiquetas y obtener respuestas descriptivas en inglés desde un portátil con GPU.
- Evaluación comparativa de cuantizaciones: el repositorio incluye variantes int4 y fp16 con métricas de velocidad y precisión, útil para decidir el equilibrio entre calidad y rendimiento en un despliegue concreto.

## Benchmarks y rendimiento

| Metrica | LFM3-VL-2B_int4 | LFM3-VL-2B_int4_ctx4096 | LFM3-VL-2B_f16 |
|---|---|---|---|
| Decodificacion en Galaxy S26 GPU (tokens/s, tras prefill de 1,024) | 37.88 | 34.35 | 14.96 |
| Decodificacion en Mac GPU (tokens/s, tras prefill de 1,024) | No disponible | 11 % mas lenta que int4 | No disponible |
| Memoria en Pixel 8a GPU | Mas de 1.4 GB por debajo del limite de prueba | No disponible | En el limite de prueba |
| Aciertos en preguntas con respuesta correcta (Galaxy S26, Pixel 8a, Mac) | 7/7, 7/7, 18/18 | No disponible | No disponible |
| Tarea de colocar objeto en foto (30 peticiones, Mac GPU) | 17 aciertos, 7 sin respuesta por falta de contexto | 21 aciertos, 0 sin respuesta | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo int4 ocupa 2.07 GB y el fp16 4.44 GB; en el Pixel 8a el int4 deja más de 1.4 GB de margen bajo el límite de memoria de la prueba, mientras que el fp16 queda justo en el límite.
- GPU recomendadas: GPU móviles (Galaxy S26, Pixel 8a) y GPU de escritorio (Mac con backend GPU); no se especifican modelos concretos de NVIDIA o AMD en la información disponible.
- Cabe en GPU de consumo: sí, al menos en las GPU móviles y Mac probadas; el tamaño de 2.07 GB (int4) es compatible con hardware de gama alta de consumo.
- Opciones de despliegue: LiteRT-LM 0.18.1 (CLI `litert-lm run` con `--backend gpu` y `--vision-backend gpu`); el modelo base ofrece GGUF, MLX y ONNX para otros runtimes.
- Latencia y throughput: 37.88 tokens/s (int4, Galaxy S26 GPU), 34.35 tokens/s (int4 ctx4096, Galaxy S26 GPU), 14.96 tokens/s (fp16, Galaxy S26 GPU); el int4 decodifica 2.5 veces más rápido que el fp16 en ese dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-LiteRT (esta ficha) | 1.92B | 2,048 / 4,096 tokens | Texto + imagen | lfm1.0 | LiteRT-LM; base en GGUF, MLX, ONNX |
| LFM3-VL-2B (modelo base) | 1.92B | No disponible | Texto + imagen + vídeo | lfm1.0 | Hugging Face (LiquidAI) |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma categoría (vision-language on-device de ~2B) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Idioma: solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Contexto limitado: 2,048 tokens por defecto; con razonamiento activado, 7 de 30 peticiones agotaron el contexto sin respuesta en el archivo de 2,048 tokens, por lo que se recomienda el de 4,096 para tareas de pensamiento largo.
- Preprocesado de imagen obligatorio: LiteRT-LM 0.18.1 estira toda imagen a 512 × 512 sin respetar relación de aspecto ni orientación EXIF; es necesario rotar y redimensionar manualmente antes de la inferencia.
- Sin vídeo: esta conversión solo acepta texto e imágenes, aunque el modelo base soporte vídeo.
- Licencia lfm1.0: es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en preguntas visuales ambiguas o con imágenes de baja calidad.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Precisión de cuantización: el archivo fp16 se mantiene más fiel a la redacción exacta del modelo base que el int4, según la model card.
- Runtime específico: depende de LiteRT-LM 0.18.1 y de la versión concreta de litert-torch; cambios de versión pueden alterar el comportamiento.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/LFM3-VL-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- MLX 4-bit del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-4bit
- ONNX del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B-ONNX
- Licencia: https://huggingface.co/litert-community/LFM3-VL-2B-LiteRT/blob/main/LICENSE
