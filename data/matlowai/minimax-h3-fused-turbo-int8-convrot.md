# MATLOWAI/minimax-h3-fused-turbo-int8-convrot

## Resumen

El modelo MATLOWAI/minimax-h3-fused-turbo-int8-convrot es un checkpoint de difusión de vídeo en un único archivo de 21 GB para ComfyUI, desarrollado por MATLOWAI. Se trata de una fusión del transformer pruned de MiniMax-H3 con el delta de pesos de referencia (ref2va - fl2va) mediante SVD de rango 1024, a la que se han añadido los LoRA turbo de lightx2v (8 pasos) y el LoRA de suavizado de movimiento Mystic v2.0. Todo ello se cuantiza a INT8 con ConvRot en las capas lineales pesadas, manteniendo el resto en BF16/F32. El resultado permite generar vídeo de texto/imagen a vídeo y de referencia a vídeo en solo 4 pasos, con audio sincronizado, y reduce el footprint de VRAM frente a apilar los LoRA en vivo.

Es relevante porque ofrece una alternativa optimizada para entornos con recursos limitados, manteniendo la calidad del modelo base MiniMax-H3, y porque simplifica el flujo de trabajo en ComfyUI al eliminar la necesidad de cargar múltiples adaptadores y realizar cuantizaciones adicionales. Su arquitectura es un transformer de difusión con 50 bloques, aunque no se especifican los parámetros totales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) pruned fl2va con fusión de delta ref2va-fl2va (SVD rango 1024) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vídeo; genera 243 frames a 1152x640) |
| Tipos de cuantizacion | INT8 (ConvRot, grupo 256, por canal) en qkv_proj, out_proj, fc1, fc2; resto BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (diffusion single file) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `xmarre/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024-ComfyUI`, que a su vez es una conversión de `diffusers-modular/MiniMax-H3-Pruned-Ref-Delta-Fused-r1024`. Este checkpoint fusiona el transformer pruned `fl2va` con una SVD de rango 1024 del delta de pesos entre `ref2va` y `fl2va`, de modo que una única partición sirve tanto para condicionamiento por primer/último fotograma como por referencia. Sobre esta base se fusionan dos LoRA: el `lightx2v FL2VA Turbo 8-step v1.0` (a peso 1.0, redimensionado a rango 24) y el `Mystic v2.0` (a peso 0.7, para suavizado de movimiento). Tras la fusión se aplica una única pasada de cuantización INT8 con ConvRot sobre las cuatro capas lineales pesadas de cada uno de los 50 bloques, manteniendo el resto en BF16/F32. No se emplea un cargador personalizado; se usa `UNETLoader` con `weight_dtype` por defecto.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video).
- Generación de vídeo a partir de referencia (primer/último fotograma o imagen de referencia) gracias a la fusión del delta ref2va-fl2va.
- Audio sincronizado con el vídeo (synchronized-audio-video).
- Inferencia en 4 pasos gracias al LoRA turbo destilado, con opción de 6, 8 o 25 pasos para mayor nitidez.
- Soporte de atención dispersa (SLA) para reducir coste computacional.
- Compatible con técnicas de post-procesado como de-rope y DyRoPE para mejorar la coherencia temporal.
- Cuantización INT8 integrada que reduce el footprint de memoria frente a la versión sin cuantizar, manteniendo una pérdida de precisión menor.
- Integración nativa con ComfyUI y soporte para AMD/ROCm mediante el fork de patientx.

## Casos de uso

- Creación de clips de vídeo cortos para redes sociales o campañas de marketing: el modelo genera vídeos de 10 segundos (243 frames a 1152x640) en menos de 2 minutos con 4 pasos, lo que permite iterar rápidamente sobre
