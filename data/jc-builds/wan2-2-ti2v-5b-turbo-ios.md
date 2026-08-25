# jc-builds/Wan2.2-TI2V-5B-Turbo-iOS

## Resumen

Wan2.2-TI2V-5B-Turbo-iOS es un bundle optimizado para ejecución en dispositivos Apple del modelo de generación de vídeo Wan 2.2 TI2V 5B, desarrollado por Wan-AI. Este paquete, creado por jc-builds (Haplo), combina el modelo de difusión de vídeo destilado mediante Self-Forcing (4 pasos de muestreo), un codificador de texto UMT5-XXL cuantizado y un decodificador de vídeo extremadamente ligero, todo ello empaquetado en formato GGUF y safetensors. El objetivo es permitir la generación de vídeo texto-a-vídeo e imagen-a-vídeo en iPhone, iPad, Mac y visionOS sin necesidad de GPU dedicada, reduciendo el tiempo de generación de unos 25 minutos a menos de 2 minutos en hardware Apple Silicon.

El modelo base es un Diffusion Transformer (DiT) de 5.680 millones de parámetros, entrenado por Wan-AI para generar vídeo de 720P a 24 fps, pero aquí se presenta cuantizado y destilado para funcionar en entornos con recursos limitados. La destilación Self-Forcing elimina la necesidad de CFG (classifier-free guidance) y reduce los pasos de denoising de 20 a 4, mientras que el decodificador TAE (tiny autoencoder) sustituye al VAE completo de 1,4 GB por uno de solo 23 MB. La licencia es Apache 2.0 para el bundle, aunque el repositorio original de destilación no declara licencia explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para vídeo, con text encoder T5-XXL (UMT5) y decodificador TAE |
| Parametros totales | 5.680.910.336 (5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (generación de vídeo, no texto) |
| Tipos de cuantizacion | Q4_K_S (DiT), Q3_K_S (text encoder), safetensors (decoder) |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | Apache 2.0 (bundle), componente de destilación sin licencia explícita |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo base es Wan2.2-TI2V-5B, un Diffusion Transformer de 5B parámetros que genera vídeo de 720p a 24 fps, con un VAE de compresión 16×16×4. La variante Turbo se obtiene mediante destilación Self-Forcing, una técnica que reduce el número de pasos de denoising de 20 a 4 y elimina la necesidad de CFG, incorporando la guía en los pesos del modelo. Esto implica que cada paso de muestreo requiere solo un forward pass (en lugar de dos) y que no es necesario codificar un prompt negativo.

El bundle incluye tres componentes: el DiT cuantizado a Q4_K_S (3,1 GB), un codificador de texto UMT5-XXL en Q3_K_S (2,9 GB) para soporte multilingüe, y un decodificador TAE (tiny autoencoder) de 23 MB que reemplaza el VAE completo de 1,4 GB. La destilación y la cuantización permiten que el modelo funcione en hardware Apple Silicon con Metal, manteniendo una resolución nativa de 480×832 píxeles y 13 frames (formato 4n+1). No se han publicado datos sobre la composición del dataset de entrenamiento de la destilación.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y a partir de imagen (image-to-video) con los mismos pesos.
- Resolución nativa de 480×832 píxeles; el modelo degrada si se usan resoluciones fuera de distribución.
- Generación de vídeos de 13 frames (equivalente a ~0,5 segundos a 24 fps) con 4 pasos de muestreo y CFG 1.0.
- Multilingüe: soporta prompts en inglés y chino a través del codificador UMT5-XXL.
- Ejecución en dispositivos Apple Silicon (iOS, macOS, visionOS) mediante el motor de difusión Mirage o sd.cpp.
- Inferencia rápida: end-to-end de ~96 segundos en un Mac M2 para 13 frames.
- No requiere GPU dedicada, funciona con Metal en hardware Apple.

## Casos de uso

- Creación de clips cortos para redes sociales: el modelo genera vídeos de 0,5 segundos a 480p con un solo prompt, ideal para prototipos rápidos o contenido efímero en plataformas como Instagram o TikTok.
- Prototipado de animaciones en aplicaciones móviles: los desarrolladores pueden integrar la generación de vídeo en apps de iOS para previsualizar escenas sin necesidad de servidores externos.
- Asistente de creación de contenido en tiempo real: permite generar vídeos de ejemplo al vuelo en un iPhone, por ejemplo para mostrar un concepto a un cliente o para uso educativo.
- Generación de vídeo en aplicaciones de mensajería: los usuarios pueden crear clips animados personalizados y enviarlos directamente, aprovechando la baja latencia y el funcionamiento sin conexión.
- Pruebas de concepto para cineastas y diseñadores: con 13 frames, sirve para validar la dirección de una escena antes de invertir en renderizados más costosos.
- Accesibilidad en dispositivos sin GPU: al ejecutarse en Apple Silicon con Metal, permite generación de vídeo en equipos de gama media, como un MacBook Air o un iPhone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este modelo. La información disponible incluye mediciones de rendimiento realizadas por el autor en un Mac M2 con 24 GB de RAM, para una generación de 480×832, 13 frames, 4 pasos y CFG 1.0:

| Fase | Turbo bundle | Bundle estándar |
|---|---|---|
| Codificación de texto (una vez, CPU) | ~34 s | ~45–115 s ×2 (pos + neg) |
| Muestreo (4 pasos × 1 pass) | ~52 s | ~8,5 min (20 pasos × 2 passes) |
| Decodificación de frames | 2,4 s | ~13,5 min (VAE completo, tiled) |
| **Total end-to-end** | **~96 s** | **~25 min** |

El bundle turbo es aproximadamente 15 veces más rápido que el estándar, con una reducción de tamaño de 2,5 GB (6,0 GB frente a 8,5 GB).

## Requisitos de hardware

- Ejecución en dispositivos Apple Silicon (iOS, macOS, visionOS) con Metal.
- El bundle total pesa ~6,0 GB (DiT 3,1 GB + text encoder 2,9 GB + decoder 23 MB), por lo que se necesita al menos 8 GB de RAM unificado para cargar todo.
- Se ha validado en un Mac M2 con 24 GB de RAM; probablemente funcione en 8 GB, aunque con tiempos de carga mayores.
- No requiere GPU dedicada (NVIDIA, AMD), pero no está optimizado para ellas; para GPU NVIDIA se puede usar stable-diffusion.cpp, aunque la destilación está pensada para Apple Silicon.
- Opciones de despliegue: motor Mirage (iOS/macOS/visionOS), stable-diffusion.cpp (Metal), y conversión a Diffusers para otros entornos.
- Latencia end-to-end de ~96 s para 13 frames en M2; el muestreo consume ~52 s, la codificación de texto ~34 s y la decodificación ~2,4 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos | CFG | Tamaño bundle | Resolución | Licencia | Velocidad end-to-end (M2) |
|---|---|---|---|---|---|---|---|
| Wan2.2-TI2V-5B-Turbo-iOS (este) | 5B | 4 | 1.0 | 6,0 GB | 480×832 | Apache 2.0 (bundle) | ~96 s |
| Wan2.2-TI2V-5B estándar (iOS bundle) | 5B | 20 | 2.0 (pos+neg) | 8,5 GB | 480×832 | Apache 2.0 | ~25 min |
| FastWan2.2-TI2V-5B (Diffusers) | 5B | 3 | 1.0 | no disponible | 720p | Apache 2.0 | no disponible |

El modelo turbo es significativamente más rápido que el estándar, pero pierde calidad de textura y control del prompt negativo. FastWan2.2-TI2V-5B es una alternativa explícitamente Apache 2.0 con 3 pasos, pero no está empaquetada para dispositivos móviles.

## Limitaciones y advertencias

- La destilación Self-Forcing produce una textura ligeramente más suave y menos detalle en comparación con el modelo estándar de 20 pasos.
- El control mediante prompt negativo está limitado, ya que CFG se fija en 1.0 y el prompt negativo no se codifica.
- La resolución nativa es 480×832; usaresoluciones fuera de este rango degrada notablemente la calidad.
- El número de frames está restringido a 4n+1 (13, 17, 21, etc.) y el paso de muestreo debe ser exactamente 4; cambiarlos produce ruido o sobresaturación.
- El repositorio original de destilación (quanhaol/Wan2.2-TI2V-5B-Turbo) no declara una licencia explícita; aunque el bundle y sus componentes base son Apache 2.0, se recomienda verificar la licencia del repo de destilación para uso comercial estricto.
- El modelo está orientado a vídeos cortos (13 frames); para vídeos más largos se necesitan más frames, aumentando el tiempo de muestreo.
- No se han publicado datos de sesgos o alucinaciones; como modelo generativo de vídeo, puede producir contenido no realista o no deseado.

## Enlaces

- Repositorio HuggingFace del bundle: https://huggingface.co/jc-builds/Wan2.2-TI2V-5B-Turbo-iOS
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio de destilación Self-Forcing: https://github.com/quanhaol/Wan2.2-TI2V-5B-Turbo
- Repositorio de conversión GGUF: https://huggingface.co/hum-ma/Wan2.2-TI2V-5B-Turbo-GGUF
- Codificador de texto GGUF: https://huggingface.co/city96/umt5-xxl-encoder-gguf
- Decodificador tiny (TAE): https://github.com/madebyollin/taehv
- Motor de difusión Mirage: https://github.com/haplollc/Mirage
- Alternativa Apache 2.0 (Diffusers): https://huggingface.co/FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers
