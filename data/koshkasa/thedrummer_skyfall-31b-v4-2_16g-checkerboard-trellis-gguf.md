# Koshkasa/TheDrummer_Skyfall-31B-v4.2_16G-checkerboard-trellis-GGUF

## Resumen

Skyfall-31B-v4.2 es un modelo de generación de texto de 31 350 millones de parámetros desarrollado por TheDrummer, especializado en escritura creativa, roleplay y narrativa interactiva. Esta variante GGUF, cuantizada por Koshkasa, es una cuantización híbrida de precisión mixta que utiliza el formato exclusivo de ik_llama.cpp con cuantización trellis y matriz de importancia (imatrix). El objetivo del autor era introducir el modelo completo en 16 GB de VRAM manteniendo la mayor fidelidad posible mediante un esquema de capas en «tablero de ajedrez»: las capas de los extremos se mantienen en mayor precisión y cada tercera capa intermedia actúa como punto de control contra la deriva de cuantización.

Está pensado para roleplay y ficción interactiva, y usa la plantilla de chat Mistral v7 Tekken. El modelo base fue ajustado sobre el dataset Squish42/bluemoon-fandom-1-1-rp-cleaned, un corpus de roleplay de fandom. La cuantización está optimizada para su uso con ik_llama.cpp y sus derivados, y es incompatible con llama.cpp estándar a partir del commit #34af94c.

El autor describe esta cuantización como la tercera iteración de su intento de ajustar Skyfall en 16 GB de VRAM, tras dos intentos anteriores con problemas. El esquema de precisión mixta resultante es un experimento abierto sobre los efectos mecanicistas de la cuantización selectiva por capas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Mistral (plantilla de chat Mistral v7 Tekken) |
| Parámetros totales | 31 352 980 480 (31,35 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF híbrido de precisión mixta con trellis: capas de borde en alta precisión, capas intermedias en 3/4 bits FFN, con puntos de control cada tercera capa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exclusivo de ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Skyfall-31B-v4.2 es un transformer denso de 31 350 millones de parámetros basado en la arquitectura Mistral, ajustado específicamente para escritura creativa, roleplay, consistencia de personajes y generación narrativa. El ajuste se realizó sobre el dataset Squish42/bluemoon-fandom-1-1-rp-cleaned, un corpus de roleplay de fandom. La cuantización GGUF de Koshkasa emplea un esquema de precisión mixta en «tablero de ajedrez»: las 8 capas de los extremos (entrada y salida) se mantienen en mayor precisión para estabilizar la comprensión de entrada y la composición de salida, mientras que cada tercera capa intermedia actúa como punto de control contra la deriva inducida por la cuantización. El resto de capas intermedias usan una cuantización agresiva de 3/4 bits en las capas FFN. Se utilizó cuantización trellis e imatrix con un corpus ampliado de roleplay. El autor reconoce que no sabe si el esquema tendrá un efecto mecanicista
