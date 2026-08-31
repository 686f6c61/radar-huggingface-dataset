# shadow/mmh3turbo-bundles

## Resumen

`shadow/mmh3turbo-bundles` es un paquete de pesos preparados para `mmh3turbo`, un port en MLX de MiniMax-H3 que genera vídeo y audio en Apple Silicon mediante kernels Metal int8 escritos a mano. El bundle incluye dos componentes: un DiT (Diffusion Transformer) de 50 bloques cuantizado a int8 con escalas por canal de salida, y una torre de texto basada en Qwen3-VL-32B (primeras 50 capas) cuantizada a 4 bits en formato MLX. Su relevancia radica en permitir la generación de vídeo y audio de forma local en hardware Apple, reduciendo drásticamente el tiempo de codificación de texto (de 43,8 s a 3,3 s) gracias a la cuantización de la torre de texto.

El modelo base es MiniMax-H3, un modelo de difusión para generación de vídeo y audio. El empaquetado se distribuye bajo licencia MIT, aunque los pesos subyacentes pertenecen a MiniMax-H3 y están sujetos a su propia licencia. El repositorio ocupa 36,2 GB y está diseñado específicamente para el runtime de `mmh3turbo`, no siendo intercambiable con otros formatos MLX cuantizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de 50 bloques + torre de texto Qwen3-VL-32B (50 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (DiT, con escalas por canal de salida y por token) y 4-bit (torre de texto, grupo 64) |
| Idiomas soportados | no disponible |
| Licencia | MIT (empaquetado); pesos subyacentes de MiniMax-H3 (ver licencia del modelo base) |
| Formato de pesos | `dit.bin` + `dit.idx` (formato propio para kernels Metal) y `qwen3vl_4bit.safetensors` |

## Arquitectura y entrenamiento

El bundle contiene dos partes diferenciadas. El DiT, de 50 bloques, está cuantizado a int8 con escalas por canal de salida y escalas de activación por token, un formato diseñado para los kernels `gemm_i8` y `flash_i8` del port `mmh3turbo`. Este DiT fue requantizado a partir del checkpoint de referencia en fp8-E4M3, y no es compatible con implementaciones que usen `mx.quantize`. Se probó SmoothQuant pero fue rechazado porque empeoraba el error de velocidad final (del 16,75 % al 63,43 %), debido a que la fuente ya tiene solo 3 bits de mantisa y no admite migración de rango.

La torre de texto es una versión cuantizada a 4 bits (grupo 64) de las primeras 50 capas de Qwen3-VL-32B, en formato MLX. Esta cuantización se realiza una sola vez y permite cargar la torre mediante mmap, en lugar de transmitir un GGUF de 7,9 GB que tardaba unos 52 segundos por prompt. La similitud coseno con la ruta original es de 0,9994, lo que indica una pérdida mínima de calidad. No se dispone de información sobre el entrenamiento del modelo base ni sobre los datos utilizados.

## Capacidades

- Generación de vídeo y audio a partir de texto (pipeline text-to-video).
- Generación de vídeo con banda sonora estéreo (según el mirror de GitHub, la salida es un mp4 con pista de audio estéreo, además de frames individuales y un GIF de vista previa).
- Optimizado para Apple Silicon mediante kernels Metal int8 escritos a mano.
- Codificación de texto acelerada gracias a la torre cuantizada a 4 bits (reduce el tiempo de 43,8 s a 3,3 s).
- Soporte de ejecución local sin dependencia de servicios en la nube.

## Casos de uso

- Prototipado rápido de vídeo para diseño conceptual: un equipo creativo puede generar clips de prueba a partir de descripciones textuales en cuestión de minutos, sin necesidad de infraestructura GPU dedicada, gracias a la ejecución local en Apple Silicon.
- Generación de contenido audiovisual para redes sociales: se pueden crear vídeos cortos con audio integrado (por ejemplo, para TikTok o Instagram) directamente desde la línea de comandos, usando `uvx mmh3turbo "prompt"`.
- Storyboarding para animación y cine: los guionistas pueden visualizar escenas descritas en texto, generando secuencias de vídeo que sirvan como referencia para equipos de producción.
- Material educativo visual: profesores y creadores de cursos pueden generar ilustraciones animadas de conceptos abstractos (por ejemplo, procesos químicos o físicos) a partir de descripciones textuales.
- Investigación en generación de vídeo con modelos de difusión: el bundle permite a investigadores experimentar con MiniMax-H3 en hardware Apple, sin necesidad de GPUs de gran tamaño, facilitando la reproducción de resultados y el desarrollo de variantes.
- Automatización de presentaciones: se pueden generar clips de vídeo de apoyo para diapositivas o informes, describiendo la escena deseada en texto y obteniendo un archivo listo para insertar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona métricas internas de rendimiento: la codificación de texto pasa de 43,8 s a 3,3 s con la torre cuantizada, y la similitud coseno entre la ruta cuantizada y la original es de 0,9994. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- Apple Silicon (chip M-series) con soporte Metal; el port `mmh3turbo` está diseñado específicamente para esta arquitectura.
- Memoria unificada estimada: el repositorio pesa 36,2 GB, por lo que se recomienda al menos 48-64 GB de RAM unificada para cargar los pesos cómodamente (aunque parte puede estar en mmap).
- No se especifican GPUs concretas, pero al ser Apple Silicon, los chips M1 Pro/Max, M2 Pro/Max/Ultra y M3/M4 con suficiente memoria son adecuados.
- Opciones de despliegue: CLI mediante `uvx mmh3turbo "prompt"`; también se puede usar el mirror de GitHub para conversión local de bundles.
- Latencia y throughput: no disponibles, aunque la codificación de texto se reduce a 3,3 s gracias a la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este bundle con alternativas de la misma categoría. El modelo base MiniMax-H3 es un modelo de difusión para vídeo, pero no se han encontrado datos comparativos con otros modelos de generación de vídeo en la información proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Los pesos del DiT están en un formato propietario (`dit.bin` + `dit.idx`) diseñado para los kernels Metal de `mmh3turbo`; no son intercambiables con repositorios MLX cuantizados estándar.
- La torre de texto está cuantizada a 4 bits, lo que puede introducir ligeras degradaciones en la calidad de la codificación, aunque la similitud coseno reportada es alta (0,9994).
- La licencia MIT aplica solo al empaquetado; los pesos subyacentes de MiniMax-H3 tienen su propia licencia que debe consultarse antes de un uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma en la documentación proporcionada.
- El modelo requiere hardware Apple Silicon; no es compatible con GPUs NVIDIA o AMD.
- El tiempo de conversión local de los bundles (si se opta por no descargarlos) es de aproximadamente 8 minutos, según el mirror de GitHub.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shadow/mmh3turbo-bundles
- Repositorio del port `mmh3turbo`: https://github.com/vra/mmh3turbo
- Mirror de GitHub con documentación adicional: https://github.com/shadowcz007/mmh3turbo-mirror
- Repositorio alternativo de bundles: https://huggingface.co/yunfengwang/mmh3turbo-bundles
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
