# aflah/Llama1BxFW_Edux2048x75pct

## Resumen

El modelo Llama1BxFW_Edux2048x75pct es un checkpoint de entrenamiento en formato GPT-NeoX desarrollado por Mohammad Aflah Khan para los experimentos de RoPE parcial descritos en el artículo "Fractional Rotation, Full Potential? Investigating Performance and Convergence of Partial RoPE", aceptado en EMNLP 2026. Se basa en la arquitectura Llama 3.2 1B y se entrenó con el dataset FineWeb-Edu, con una longitud de secuencia de 2 048 tokens y RoPE parcial aplicado al 75 % de las cabeceras de atención.

El checkpoint corresponde al paso global 12 000 y se conserva en el formato original de GPT-NeoX, sin conversión a Transformers. Su propósito es exclusivamente científico: estudiar el efecto del RoPE parcial en el rendimiento y la convergencia de modelos de lenguaje. No es un modelo listo para producción, sino un artefacto experimental que contribuye a una cuestión abierta en el diseño de arquitecturas transformer: si la rotación fraccionaria de los embeddings posicionales puede reducir el coste computacional sin perder rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama 3.2 1B (transformer decoder-only) |
| Parámetros totales | Aproximadamente 1 000 millones (basado en Llama 3.2 1B) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2 048 tokens (longitud de entrenamiento) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (dataset FineWeb-Edu, mayoritariamente inglés) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint GPT-NeoX sin convertir a Transformers |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Llama 3.2 1B, un transformer decoder-only con RMSNorm y activación SwiGLU. La innovación principal es la aplicación de RoPE parcial al 75 % de las cabeceras de atención, frente al RoPE completo habitual en Llama. Esta configuración forma parte de un estudio experimental sobre los efectos de la rotación fraccionaria en embeddings posicionales.

El entrenamiento se realizó sobre el dataset FineWeb-Edu con una longitud de secuencia de 2 048 tokens. El checkpoint corresponde al paso global
