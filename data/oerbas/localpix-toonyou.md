# oerbas/localpix-toonyou

## Resumen

El modelo `oerbas/localpix-toonyou` es una conversión a Core ML del checkpoint de Stable Diffusion 1.x `frankjoshua/toonyou_beta6`, realizada por el usuario oerbas para su integración en la aplicación iOS LocalPix. ToonYou es un checkpoint de Stable Diffusion 1.5 especializado en la generación de imágenes con estética cartoon y anime, muy popular en la comunidad por su equilibrio entre detalle y estilo caricaturesco. Esta conversión concreta está optimizada para ejecución on-device en dispositivos Apple, utilizando paletización de pesos de 6 bits y atención SPLIT_EINSUM, lo que permite inferencia local sin conexión a servidores.

La relevancia de este modelo radica en que facilita el despliegue de generación de imágenes en dispositivos móviles con recursos limitados, manteniendo la compatibilidad con el ecosistema Core ML de Apple. El repositorio tiene un tamaño de 0,9 GB e incluye el VAE encoder, lo que lo hace autónomo para el pipeline completo de texto a imagen. La licencia CreativeML OpenRAIL-M permite uso comercial con restricciones, aunque los derechos del modelo original pertenecen a su autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.x (UNet + VAE + CLIP text encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (típico de SD 1.x: 512x512 píxeles) |
| Tipos de cuantizacion | 6-bit palettized (Core ML) |
| Idiomas soportados | no disponible (el prompt se procesa con CLIP, típicamente inglés) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Core ML (mlmodelc / mlpackage) |

## Arquitectura y entrenamiento

El modelo base es un checkpoint de Stable Diffusion 1.5, que emplea una arquitectura de difusión latente con un UNet como denoiser, un autoencoder VAE para el espacio latente y un codificador de texto CLIP para condicionar la generación. El checkpoint ToYou Beta 6 fue entrenado sobre el modelo base SD 1.5 con un dataset de imágenes de estilo cartoon y anime, ajustando los pesos para producir resultados con líneas definidas, colores planos y expresiones exageradas.

La conversión a Core ML realizada por oerbas aplica paletización de pesos a 6 bits, una técnica de compresión que reduce el tamaño del modelo y acelera la inferencia en hardware Apple, a costa de una ligera pérdida de precisión. Se utiliza atención SPLIT_EINSUM, una optimización específica para el Neural Engine de Apple que divide los cálculos de atención en operaciones más eficientes. El VAE encoder está incluido, lo que permite el pipeline completo de texto a imagen sin dependencias externas.

## Capacidades

- Generación de imágenes a partir de prompts de texto con estilo cartoon y anime.
- Inferencia on-device en dispositivos Apple (iPhone, iPad, Mac) gracias a la conversión Core ML.
- Ejecución offline, sin necesidad de conexión a servidores.
- Compatible con el pipeline estándar de Stable Diffusion: texto → imagen.
- Incluye VAE encoder, por lo que no requiere descargar componentes adicionales.
- Optimizado para el Neural Engine (ANE) de Apple mediante paletización de 6 bits y atención SPLIT_EINSUM.

## Casos de uso

- Creación de avatares e ilustraciones estilo cartoon para redes sociales: el usuario introduce un prompt descriptivo y obtiene una imagen con estética anime en segundos, directamente en su iPhone.
- Prototipado rápido de personajes para animación o cómics: artistas pueden generar variaciones de personajes con diferentes prompts y seleccionar las mejores para refinar manualmente.
- Generación de contenido para juegos indie: desarrolladores pueden producir assets de estilo cartoon sin depender de un artista, usando el modelo en un iPad durante el desarrollo.
- Aplicaciones de entretenimiento personalizado: apps que permiten a los usuarios crear tarjetas, fondos de pantalla o stickers con su propio prompt, todo localmente.
- Educación y experimentación: estudiantes de IA pueden estudiar el pipeline de Stable Diffusion en un dispositivo móvil sin necesidad de GPUs de escritorio.
- Asistencia creativa para diseñadores: el modelo sirve como generador de ideas visuales en estilo cartoon, integrable en flujos de trabajo de diseño mediante la app LocalPix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como FID, CLIP score o tiempos de inferencia comparativos.

## Requisitos de hardware

- Diseñado para dispositivos Apple con Neural Engine (ANE): iPhone 12 o posterior, iPad Pro con chip M1 o posterior, Mac con chip M1 o posterior.
- El tamaño del repositorio es de 0,9 GB, por lo que requiere al menos 1 GB de almacenamiento libre.
- La paletización de 6 bits reduce el uso de memoria en comparación con pesos de 16 bits, permitiendo ejecución en dispositivos con 4 GB de RAM o menos.
- No requiere GPU externa ni servidor; la inferencia se realiza localmente.
- El formato Core ML se integra con Core ML framework de Apple, usando `MLModel` y `MLPrediction`.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Base | Formato | Cuantizacion | Licencia | Uso |
|---|---|---|---|---|---|
| oerbas/localpix-toonyou | SD 1.5 | Core ML | 6-bit palettized | CreativeML OpenRAIL-M | iOS on-device |
| frankjoshua/toonyou_beta6 | SD 1.5 | Checkpoint original (safetensors) | FP16/FP32 | CreativeML OpenRAIL-M | Desktop / servidor |
| imagepipeline/ToonYou | SD 1.5 | Checkpoint (safetensors) | FP16 | CreativeML OpenRAIL-M | Desktop / servidor |
| Mr-J-369/ToonYou-SD1.5-qnn2.28 | SD 1.5 | QNN (Qualcomm) | 2.28 bits | CreativeML OpenRAIL-M | Dispositivos Qualcomm |

La comparativa muestra que la versión de oerbas es la única optimizada específicamente para Core ML, mientras que las demás son checkpoints estándar o conversiones para otras plataformas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La paletización de 6 bits puede introducir artefactos o pérdida de fidelidad en comparación con el checkpoint original en FP16.
- El modelo está limitado a la resolución típica de SD 1.x (512x512 píxeles); generar a resoluciones mayores requiere upscaling externo.
- No se especifican los idiomas soportados; el codificador CLIP de SD 1.5 está entrenado principalmente con texto en inglés, por lo que prompts en otros idiomas pueden dar resultados subóptimos.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones sobre usos ilegales o dañinos, y exige redistribuir los mismos términos.
- El modelo no incluye mecanismos de seguridad adicionales (filtros NSFW, etc.) más allá de los del checkpoint original.
- Al ser una conversión, no se garantiza la paridad exacta de resultados con el checkpoint original; se recomienda validar la calidad en el caso de uso concreto.
- No hay soporte para tool calling, agentes ni razonamiento multi-paso; es exclusivamente un generador de imágenes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oerbas/localpix-toonyou
- Checkpoint original: https://huggingface.co/frankjoshua/toonyou_beta6
- Página de ToonYou en Civitai: https://civitai.com/models/30240/toonyou
- Conversión alternativa para Qualcomm: https://huggingface.co/Mr-J-369/ToonYou-SD1.5-qnn2.28
- Checkpoint en stablediffusionapi: https://huggingface.co/stablediffusionapi/toonyou
