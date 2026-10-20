# bambocher/Qwen3.5-2B-oQ8e-mtp

## Resumen

bambocher/Qwen3.5-2B-oQ8e-mtp es un checkpoint cuantizado del modelo Qwen3.5-2B, publicado por el usuario bambocher en Hugging Face. No es un modelo entrenado desde cero, sino una conversión a formato MLX realizada con la herramienta oQ (oMLX v0.7.1rc1) mediante cuantización mixta de precisión. El resultado ocupa 2,547 GiB y contiene 2.274.069.824 parámetros lógicos, con una media efectiva de 9,623 bits por peso.

El modelo base pertenece a la familia Qwen3.5 de Alibaba Cloud, una serie multilingüe con entrenamiento multimodal de fusión temprana. Este checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (1,882B parámetros), un módulo de visión (0,331B) y una cabeza MTP (0,061B), asociada a predicción multi-token. Es relevante para quienes necesitan ejecutar un modelo multimodal de aproximadamente 2B en Apple Silicon con MLX, manteniendo un tamaño reducido y conservando parte de los pesos en BF16.

Al tratarse de una cuantización comunitaria y no oficial, la licencia, los idiomas exactos, la longitud de contexto y el rendimiento en benchmarks no están documentados en la información disponible. Eso limita su adopción en producción sin una evaluación previa del checkpoint y de la licencia del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5; incluye módulo de visión y cabeza MTP. Detalle de capas y atención no disponible |
| Parámetros totales | 2.274.069.824 (2,274B) |
| Parámetros activos | No aplica; no se indica que sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MLX affine 8-bit con grupo de 64 (85,033% de los pesos, 8,50 bits/peso) y BF16 (14,967%, 16,00 bits/peso); media efectiva de 9,623 bits/peso |
| Idiomas soportados | Multilingüe, según la serie Qwen3.5; lista concreta no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX; repositorio de 2,7 GB |

| Parámetro adicional | Valor |
|---|---|
| Componentes | Modelo de lenguaje: 1,882B; visión: 0,331B; cabeza MTP: 0,061B |
| Tamaño en disco | 2,735 GB (2,547 GiB) |
| Precisión efectiva | 9,623 bits/peso |
| Runtime | MLX |
| Descargas | 8 |
| Likes | 0 |
| Fecha de creación | 2026-10-20 |
| Última actualización | 2026-10-20 |

## Arquitectura y entrenamiento

El checkpoint conserva la estructura del Qwen3.5-2B original e incorpora una cabeza M
