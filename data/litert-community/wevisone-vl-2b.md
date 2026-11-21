# litert-community/WeVisOne-VL-2B

## Resumen

WeVisOne-VL-2B es un modelo de visión-lenguaje de 2.000 millones de parámetros desarrollado por WeChat Vision (Tencent) sobre la base de Qwen3-VL. Resuelve tareas de percepción visual estructurada: detección de objetos, comprensión de expresiones referenciales, señalamiento por puntos (point-grounding), conteo de objetos y reconocimiento óptico de caracteres (OCR). A diferencia de un VLM conversacional genérico, devuelve las coordenadas como texto estructurado mediante los tokens `<0>` a `<1000>`, que representan milésimas del ancho y alto de la imagen.

La ficha que nos ocupa no es el modelo original, sino una conversión del repositorio `tencent/WeVisOne-VL-2B` al formato LiteRT-LM de Google, publicada por la comunidad `litert-community`. El objetivo es la inferencia en dispositivo (on-device) sobre móviles y equipos de escritorio, sin depender de servidores. Se distribuyen dos artefactos: una versión int8 de 2,91 GB y una versión float16 de 4,90 GB, ambas con un contexto de 2.048 tokens para prompt y respuesta.

La relevancia actual radica en que demuestra que un VLM de 2B con capacidades de grounding puede ejecutarse en un Galaxy S26 a 21,1 tokens por segundo con un pico de memoria de 2,70 GB, o en un Mac M4 Max a 113,3 tokens por segundo. La licencia Apache 2.0 facilita su integración comercial, aunque la conversión no incluye el decodificador de píxeles de 9,5 millones de parámetros del modelo original, por lo que no realiza segmentación ni matting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (VLM) basado en Qwen3-VL; codificador visual + adaptador + decodificador de 28 capas |
| Parametros totales | 2B (aproximado, segun nombre del modelo); el decodificador de pixeles del modelo original (9,5M) no esta incluido en la conversion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (prompt + respuesta) |
| Tipos de cuantizacion | int8 (decodificador y token embedder) + float16 (codificador visual y adaptador); float16 en todos los grafos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); int8: 2.914.025.472 bytes; f16: 4.899.179.008 bytes |

## Arquitectura y entrenamiento

La conversion parte de `tencent/WeVisOne-VL-2B`, un VLM construido sobre Qwen3-VL. El grafo empaquetado contiene cuatro componentes: el codificador visual, el adaptador visual, el token embedder y un decodificador de 28 capas. En la variante int8, el decodificador y el embedder están cuantizados a int8, mientras que el codificador visual y el adaptador permanecen en float16; la variante f16 mantiene todos los grafos en float16. Ambos ficheros comparten los mismos bytes en el codificador visual y el adaptador. El modelo se declara como tipo `fast_vlm` de LiteRT-LM, lo que restringe la entrada a una sola imagen por petición.

La conversión se realizó con litert-torch 0.10.0 para LiteRT-LM 0.18.1. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original, más allá de que WeChat Vision lo entrenó para producir salidas estructuradas de detección, referencias, puntos, conteo y OCR. Una particularidad técnica relevante es el tratamiento de la imagen: el modelo espera 512 × 512 píxeles, y el pipeline recomienda aplicar la orientación EXIF y redimensionar con el filtro BICUBIC de Pillow antes de enviar la imagen, porque el redimensionado interno de LiteRT-LM 0.18.1 (Catmull-Rom de stb) degrada la coincidencia de respuestas con el modelo PyTorch original (9 de 29 preguntas en GPU y 1 de 29 en CPU, según la model card). Las coordenadas de salida son tokens `<0>`–`<1000>` que representan milésimas de ancho y alto de la imagen.

## Capacidades

- Detección de objetos con cajas delimitadoras expresadas como tokens de coordenadas `<0>`–`<1000>`.
- Comprensión de expresiones referenciales: localizar instancias descritas en lenguaje natural (por ejemplo, "truck", "crane").
- Point-grounding: señalar puntos concretos de la imagen mediante coordenadas normalizadas.
- Conteo de objetos presentes en la imagen.
- OCR: reconocimiento de texto en imágenes.
- Salida estructurada en texto con etiquetas `<ref>` y `<box>`, apta para parseo programático.
- Procesamiento de una única imagen por petición (tipo `fast_vlm`).
- No realiza segmentación ni matting: requiere el decodificador de píxeles de 9,5M del modelo original, ausente en esta conversión.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Detección de objetos en aplicaciones móviles: el fichero int8 se ejecuta en un Galaxy S26 GPU con 1,26 s hasta el primer token y 21,1 tokens/s, lo que permite integrar detección en tiempo casi interactivo dentro de una app Android sin conexión a servidor.
- Asistencia a personas con discapacidad visual: el modelo puede describir y localizar objetos ("truck", "crane") en una foto capturada por el móvil, devolviendo cajas normalizadas que una app puede convertir en indicaciones de posición relativa.
- Inventario y conteo automatizado: dado que soporta conteo de objetos y devuelve coordenadas estructuradas, se puede usar para contar existencias en estanterías o almacenes a partir de una foto, con el conteo derivado del número de cajas devueltas.
- Digitalización de documentos y OCR en dispositivo: el soporte de OCR permite extraer texto de imágenes en un Pixel 8a a 8,0 tokens/s en CPU, útil para escanear recibos o etiquetas sin enviar datos a la nube.
- Análisis de imágenes satelitales o aéreas: la model card demuestra la localización de un camión y una grúa en una foto de la NASA (KSC-08pd3809), un escenario aplicable a inspección de infraestructuras o logística.
- Automatización de control de calidad visual: la salida con cajas delimitadoras normalizadas permite verificar la presencia y posición de componentes en una imagen de línea de producción, integrándola en un pipeline que parsee `<ref>` y `<box>`.
- Prototipado de agentes visuales en escritorio: en un Mac M4 Max la variante int8 alcanza 113,3 tokens/s con 3,85 GB de memoria, adecuado para iterar rápidamente en herramientas de anotación o demos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona mediciones de latencia, throughput y memoria, así como una métrica de fidelidad respecto al modelo PyTorch original:

| Plataforma | Fichero | Primer token | Throughput | Memoria pico |
|---|---|---:|---:|---:|
| Galaxy S26 (GPU) | int8 | 1,26 s | 21,1 tok/s | 2,70 GB |
| Galaxy S26 (GPU) | f16 | 1,54 s | 12,9 tok/s | 6,86–6,90 GB |
| Pixel 8a (CPU) | int8 | 13,58 s | 8,0 tok/s | no disponible |
| Mac M4 Max (GPU) | int8 | 0,29 s | 113,3 tok/s | 3,85 GB |
| Mac M4 Max (GPU) | f16 | 0,30 s | 81,4 tok/s | 8,0 GB |
| Mac (CPU) | int8 | 4,64 s | 26,8 tok/s | no disponible |
| Mac (CPU) | f16 | 4,85 s | 12,6 tok/s | no disponible |

En fidelidad respecto al modelo original, de los 44 puntos posibles en 29 preguntas de test, la variante f16 reproduce 35 en Galaxy S26 GPU y la int8 reproduce 28. En las preguntas con respuesta conocida, la int8 acierta al menos con la misma frecuencia que la f16.

## Requisitos de hardware

- VRAM/memoria estimada: 2,70 GB en Galaxy S26 GPU (int8) y 3,85 GB en Mac M4 Max GPU (int8); 6,86–6,90 GB en Galaxy S26 GPU y 8,0 GB en Mac M4 Max GPU (f16).
- GPU recomendadas: GPU integrada de Galaxy S26 (int8), GPU de Mac M4 Max (int8 y f16). No se han probado A100, H100 ni RTX 4090 en la información disponible.
- Cabe en consumer GPU: sí, al menos en hardware móvil y Apple Silicon; en un Pixel 8a de 8 GB solo se validó la variante int8 en CPU, ya que en su GPU el script de medición detuvo la creación del motor al bajar la memoria libre del límite.
- Opciones de despliegue: LiteRT-LM 0.18.1 con backend GPU o CPU (`--backend gpu --vision-backend gpu` o `--backend cpu --vision-backend cpu`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks. En CPU del Mac, las coordenadas de la variante int8 varían algunos milésimos entre procesos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada. La comparación más directa posible es entre las dos variantes publicadas:

| Modelo | Parámetros | Contexto | Throughput (Galaxy S26 GPU) | Memoria | Licencia |
|---|---|---|---|---|---|
| WeVisOne-VL-2B int8 | 2B | 2.048 | 21,1 tok/s | 2,70 GB | Apache 2.0 |
| WeVisOne-VL-2B f16 | 2B | 2.048 | 12,9 tok/s | 6,86–6,90 GB | Apache 2.0 |

Frente a otros VLM de 2B del ecosistema (por ejemplo, Qwen2-VL-2B o SmolVLM), no hay datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- No realiza segmentación ni matting: carece del decodificador de píxeles de 9,5M del modelo original.
- Procesa una sola imagen por petición y con un contexto de solo 2.048 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- El pipeline de imagen es frágil: exige orientación EXIF aplicada y redimensionado a 512 × 512 con BICUBIC de Pillow; otros redimensionados o JPEG a 512 × 512 no fueron probados y degradan la coincidencia con el modelo original.
- En CPU, las coordenadas de la variante int8 presentan variación de algunos milésimos entre ejecuciones.
- Las mediciones de la variante int8 se realizaron antes del 10 de noviembre de 2026 sobre ficheros anteriores; no se repitieron sobre el fichero int8 actual, aunque los pesos son los mismos.
- En un Pixel 8a de 8 GB, la variante int8 no se pudo iniciar en GPU por límite de memoria; la f16 no se probó en ese dispositivo.
- Idiomas soportados no disponibles; riesgo de alucinación y sesgos no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `tencent/WeVisOne-VL-2B` para el uso de los pesos originales.
- El repositorio ocupa 17,4 GB, aunque los ficheros individuales son de 2,91 GB y 4,90 GB.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/litert-community/WeVisOne-VL-2B
- Modelo base original: https://huggingface.co/tencent/WeVisOne-VL-2B
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Imagen de ejemplo de la NASA (KSC-08pd3809): https://images-assets.nasa.gov/image/KSC-08pd3809/KSC-08pd3809~orig.jpg
