# litert-community/Z-Image-Turbo-LiteRT

## Resumen

Z-Image-Turbo-LiteRT es una conversión a LiteRT (el runtime de inferencia on-device de Google, antes TFLite) del modelo Z-Image-Turbo de Alibaba Tongyi-MAI, un generador de imágenes texto-a-imagen de 6.000 millones de parámetros basado en un Single-Stream Diffusion Transformer (S3-DiT). El modelo original, destilado para funcionar en solo 8 pasos de inferencia, ha sido transformado en un conjunto de grafos int8 que se cargan secuencialmente en la GPU del teléfono, permitiendo por primera vez generar una imagen completa en un dispositivo con 8 GB de RAM, como un Pixel 8a con GPU Mali.

La relevancia de esta conversión radica en que acerca la generación de imágenes de alta calidad a entornos sin conexión y sin servidores, con una huella de memoria pico inferior a 1 GB por grafo. El equipo de litert-community ha verificado que la salida int8 on-device es prácticamente indistinguible de la referencia fp32, con un PSNR de 40,4 dB y una correlación de 0,9994. El repositorio incluye todos los grafos necesarios (encoder de texto Qwen3-4B, 30 capas del DiT divididas en 6 bloques, y decodificador VAE) junto con scripts de conversión y ejemplos de uso en Kotlin y Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Single-Stream Diffusion Transformer (S3-DiT) con text encoder Qwen3-4B y VAE |
| Parametros totales | 6.000 millones (modelo base Z-Image-Turbo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de generacion de imagenes, no LLM) |
| Tipos de cuantizacion | int8 (INTEGER-compute); int4 descartado por baja calidad (PSNR 18) |
| Idiomas soportados | No disponible (el text encoder Qwen3-4B es multilingue, pero no se especifican idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | tflite (LiteRT CompiledModel, grafos int8) |

## Arquitectura y entrenamiento

El modelo base Z-Image-Turbo es un diffusion transformer de flujo único (S3-DiT) con 6.000 millones de parámetros, destilado para generar imágenes en solo 8 pasos (NFEs). En esta conversión LiteRT, el modelo monolítico de 6 GB se divide en grafos int8 independientes que se cargan uno a la vez en la GPU del dispositivo, manteniendo la composición bit-exacta con el DiT monolítico (correlación 1,000000 en escritorio, 0,966 on-device). El text encoder es un Qwen3-4B cuantizado a int8 que emite el estado oculto penúltimo como condicionamiento. Los detalles del entrenamiento original (composición del dataset, número de tokens, técnicas de destilación) no están disponibles en la información proporcionada; la conversión se centra en la fidelidad numérica y la viabilidad de ejecución en hardware móvil.

## Capacidades

- Generacion de imagenes texto-a-imagen a resolucion 256x256 píxeles en 8 pasos, completamente en la GPU del telefono.
- Ejecucion on-device con carga secuencial de grafos: el pico de memoria es un unico grafo de menos de 1 GB, lo que permite su uso en telefonos con 8 GB de RAM.
- Fidelidad numerica alta: la salida int8 coincide con la referencia fp32 con PSNR 40,4 dB y correlacion 0,9994.
- Soporte de classifier-free guidance (CFG) con prompts condicionales y no condicionales, gestionado en el host.
- Integracion con LiteRT CompiledModel, con aceleracion GPU via delegado OpenCL y opcion de precision FP32 para evitar desbordamientos en fp16.
- El text encoder Qwen3-4B permite procesar prompts en multiples idiomas (no confirmado oficialmente en esta conversion).

## Casos de uso

- Generacion de imagenes sin conexion en dispositivos moviles: una aplicacion de fotografia o diseno puede ofrecer generacion de imagenes a partir de texto sin depender de servidores, usando la GPU del telefono. El modelo es adecuado porque los grafos int8 se cargan secuencialmente y caben en la memoria de un telefono de gama media-alta.
- Asistentes creativos en el dispositivo: herramientas de bocetado o lluvia de ideas visuales que generan variaciones de una idea a partir de una descripcion textual, con latencia aceptable para uso interactivo (8 pasos de inferencia).
- Edicion y aumento de imagenes en local: dado que el modelo incluye un VAE decoder, se puede integrar en flujos de trabajo de edicion fotografica que requieran decodificar latentes generados por otros procesos, manteniendo la privacidad de los datos.
- Prototipado rapido para desarrolladores: los scripts de conversion y los ejemplos en Kotlin y Python permiten integrar generacion de imagenes en aplicaciones Android o en entornos de escritorio con LiteRT, sin necesidad de GPU dedicada.
- Generacion de contenido para aplicaciones de realidad aumentada: la resolucion de 256 px es suficiente para texturas o iconos, y la ejecucion local evita latencia de red en experiencias AR en tiempo real.
- Educacion e investigacion en eficiencia de modelos: el repositorio documenta tecnicas de division de grafos, cuantizacion int8 y gestion de memoria para ejecutar modelos grandes en hardware limitado, util como referencia para otros proyectos de despliegue on-device.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de generacion de imagenes (FID, CLIP score, etc.) en la informacion disponible. El unico dato de rendimiento verificado es la fidelidad de la cuantizacion:

| Metrica | Valor |
|---|---|
| PSNR (salida int8 vs fp32) | 40,4 dB |
| Correlacion (int8 vs fp32) | 0,9994 |
| Correlacion composicion de grafos vs DiT monolítico (escritorio) | 1,000000 |
| Correlacion on-device (int8/FP32-GPU) | 0,966 |

El modelo genera una imagen de 256 px en 8 pasos; la latencia exacta por paso no se especifica, pero se menciona que la generacion completa se realiza en un Pixel 8a con GPU Mali.

## Requisitos de hardware

- VRAM estimada: pico inferior a 1 GB por grafo (carga secuencial); el telefono debe tener al menos 8 GB de RAM total para el proceso completo.
- GPU recomendadas: cualquier GPU movil compatible con OpenCL (Mali, Adreno, etc.); verificado en Pixel 8a (Mali-G715). En escritorio, se puede ejecutar con CPU o GPU via LiteRT.
- Compatibilidad con GPU de consumo: no aplica directamente (disenado para movil), pero los grafos tflite pueden ejecutarse en escritorio con LiteRT.
- Opciones de despliegue: LiteRT CompiledModel con delegado GPU (OpenCL), benchmark_model para mediciones, ejemplos en Kotlin (Android) y Python.
- Latencia y throughput: no disponible; se indica "sub-second" para el modelo original en H800, pero la version on-device depende del hardware movil.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de generacion de imagenes on-device en la informacion proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Resolucion | Pasos | Licencia | Despliegue |
|---|---|---|---|---|---|
| Z-Image-Turbo-LiteRT | 6B (int8) | 256 px | 8 | Apache-2.0 | On-device (LiteRT) |
| Z-Image-Turbo (original) | 6B (fp32) | 256 px (y superior) | 8 | Apache-2.0 | GPU de servidor (H800, 16 GB VRAM) |
| SDXL-Turbo | 3.5B | 512 px | 1-4 | Apache-2.0 | GPU de servidor o consumer |

La comparacion directa no es posible sin benchmarks estandarizados; la principal diferencia es que LiteRT esta optimizado para ejecucion en telefonos, mientras que los otros requieren hardware de servidor o GPU dedicada.

## Limitaciones y advertencias

- Resolucion fija de 256x256 píxeles; no se menciona soporte para resoluciones superiores en esta conversion.
- El proceso requiere un host para la tokenizacion del prompt, el calculo de RoPE, el enmascarado de tokens de padding, la concatenacion de condicionamientos y el (un)patchify; no es un pipeline completamente autonomo en el dispositivo.
- La precision FP32 es obligatoria en la GPU: la ejecucion en fp16 produce NaN en las rutas adaLN/attention.
- La cuantizacion int4 produce resultados inaceptables (PSNR 18 dB), por lo que solo int8 es viable.
- Los pesos no se redistribuyen como checkpoint original; los grafos son especificos de LiteRT y requieren el runtime correspondiente.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad del contenido generado; el modelo base puede reflejar sesgos de sus datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia del modelo base y de los componentes (Qwen3-4B, VAE).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Z-Image-Turbo-LiteRT
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- GitHub de Tongyi-MAI/Z-Image: https://github.com/Tongyi-MAI/Z-Image
- Interfaz web profesional con MCP server: https://github.com/Aaryan-Kapoor/z-image-turbo
- Tutorial de Z-Image Turbo con LoRA en ComfyUI: https://www.nextdiffusion.ai/tutorials/z-image-turbo-with-lora-in-comfyui-for-consistent-image-generations
