# mahmudplx/coreml-absolutereality-6bit

## Resumen

`mahmudplx/coreml-absolutereality-6bit` es una conversión a Core ML del checkpoint de Stable Diffusion 1.5 `Lykon/AbsoluteReality`, un modelo de generación de imágenes conocido por su realismo fotográfico. El repositorio, creado por el usuario mahmudplx, está diseñado para ejecutarse íntegramente en dispositivos Apple (iOS, iPadOS y macOS) mediante el pipeline oficial `apple/ml-stable-diffusion`. La conversión emplea una cuantización de 6 bits en el UNet (palettizada) y mantiene el text encoder y los VAE en precisión fp16, logrando un tamaño total de 1,01 GB.

La relevancia de este modelo radica en que permite generar imágenes de alta calidad sin conexión a internet, aprovechando la Neural Engine de los chips Apple. Al incluir el VAE encoder, también soporta image-to-image, lo que amplía sus aplicaciones prácticas en entornos móviles. Es una opción interesante para desarrolladores que buscan integrar generación de imágenes en apps nativas con requisitos estrictos de privacidad y latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE) |
| Parametros totales | no disponible (basado en checkpoint de SD 1.5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | UNet: 6-bit palettized; TextEncoder, VAEDecoder, VAEEncoder: fp16 |
| Idiomas soportados | no disponible (el modelo base responde principalmente a prompts en inglés) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | Core ML (.mlmodelc) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint `Lykon/AbsoluteReality`, un fine-tune de Stable Diffusion 1.5 entrenado para producir imágenes con estética realista. No se han añadido capas ni se ha realizado entrenamiento adicional; la conversión se llevó a cabo con la herramienta `python_coreml_stable_diffusion` de Apple, utilizando la implementación de atención `SPLIT_EINSUM_V2` y resolución de 512×512. El UNet se cuantizó por separado a 6 bits mediante paletización k-means, mientras que el text encoder (CLIP) se mantuvo en fp16 porque su máscara causal `-inf` no es compatible con el paletizador. El VAE encoder se incluye para habilitar image-to-image.

## Capacidades

- Generación de imágenes a partir de prompts de texto en inglés (y posiblemente otros idiomas, aunque no está documentado).
- Image-to-image: gracias al VAE encoder incluido, puede transformar imágenes existentes según un prompt.
- Ejecución on-device en dispositivos Apple con Neural Engine, sin necesidad de conexión a internet.
- Inferencia optimizada para Core ML, con soporte para `MLComputeUnits.cpuAndNeuralEngine`.
- Compatible con el pipeline `StableDiffusionPipeline` de `apple/ml-stable-diffusion` y con la CLI Swift.
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal; es exclusivamente un generador de imágenes.

## Casos de uso

- Aplicaciones de fotografía creativa: los usuarios pueden aplicar estilos realistas a sus fotos mediante image-to-image, por ejemplo convirtiendo un retrato en una pintura al óleo o cambiando la iluminación.
- Generación de contenido para redes sociales: creadores de contenido pueden producir imágenes de alta calidad para publicaciones sin depender de servicios en la nube, manteniendo la privacidad de sus ideas.
- Prototipado rápido de conceptos visuales: diseñadores e ilustradores pueden generar variaciones de una escena o personaje en segundos, directamente en un iPad o Mac.
- Asistentes de diseño integrados en apps: desarrolladores pueden incorporar un generador de imágenes local para que los usuarios creen fondos, iconos o ilustraciones personalizadas.
- Edición de imágenes en entornos con conectividad limitada: periodistas o fotógrafos de campo pueden retocar o reimaginar imágenes sin acceso a internet.
- Educación y experimentación: estudiantes de IA y arte digital pueden explorar técnicas de generación y edición de imágenes en hardware Apple sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como FID, CLIP score o tiempos de inferencia comparativos.

## Requisitos de hardware

- Dispositivos Apple con Neural Engine: iPhone (A12 o posterior), iPad (A12 o posterior), Mac con chip M1 o posterior.
- Tamaño del modelo: 1,01 GB en disco (618 MB para el UNet, 235 MB para el text encoder, 95 MB para el VAE decoder y 65 MB para el VAE encoder).
- Memoria RAM necesaria: no especificada, pero al ser un modelo de ~1 GB, se recomienda al menos 4 GB de RAM para evitar intercambios.
- Inferencia optimizada para la Neural Engine; se recomienda usar `MLComputeUnits.cpuAndNeuralEngine` para obtener el mejor rendimiento.
- Despliegue: mediante el pipeline de `apple/ml-stable-diffusion` (Swift o Python) o integración directa en apps con Core ML.
- Latencia y throughput: no disponibles; dependerán del dispositivo concreto y de la resolución de salida.

## Comparativa con modelos similares

| Modelo | Base | Formato | Tamaño | Cuantización | Licencia |
|---|---|---|---|---|---|
| mahmudplx/coreml-absolutereality-6bit | AbsoluteReality (SD 1.5) | Core ML | 1,01 GB | UNet 6-bit, resto fp16 | CreativeML Open RAIL-M |
| LocalMuseAI/coreml-cyberrealistic-v8-inpaint-6bit | CyberRealistic V8 (SD 1.5) | Core ML | no disponible | UNet 6-bit | CreativeML Open RAIL-M |
| LocalMuseAI/coreml-cyberrealistic-xl-v8-inpaint-6bit | CyberRealistic XL V8 (SDXL) | Core ML | no disponible | UNet 6-bit | CreativeML Open RAIL-M |

Ambos modelos de LocalMuseAI son conversiones similares para Core ML, pero orientados a inpainting y con bases distintas. No se dispone de comparativas de rendimiento ni calidad entre ellos.

## Limitaciones y advertencias

- El modelo hereda los sesgos y limitaciones del checkpoint AbsoluteReality, que puede generar contenido estereotipado o inapropiado en ciertos contextos.
- Riesgo de alucinaciones visuales: puede producir detalles irreales o inconsistentes, especialmente en rostros, manos o texto.
- La cuantización de 6 bits del UNet puede degradar ligeramente la calidad de la imagen en comparación con el modelo original en fp16.
- Solo funciona en dispositivos Apple; no es portable a otras plataformas sin reconversión.
- La licencia CreativeML Open RAIL-M impone restricciones de uso: no se permite generar contenido ilegal, dañino o engañoso, y las restricciones deben transmitirse a los usuarios finales si se redistribuye.
- No se garantiza soporte para prompts en idiomas distintos del inglés, aunque el modelo base puede interpretar algunos términos en otros idiomas.
- El repositorio no incluye documentación sobre el rendimiento en diferentes dispositivos ni guías de integración más allá de la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mahmudplx/coreml-absolutereality-6bit
- Modelo base AbsoluteReality: https://huggingface.co/Lykon/AbsoluteReality
- Pipeline oficial de Apple para Stable Diffusion en Core ML: https://github.com/apple/ml-stable-diffusion
- Página de AbsoluteReality en Civitai: https://civitai.com/models/81458/absolutereality
- Repositorio de Apple para recetas de exportación de modelos Core AI: https://github.com/apple/coreai-models
