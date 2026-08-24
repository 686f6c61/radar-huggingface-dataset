# barozp/Qwen3.8-27B-Opus-Distill-v2-MTPLX-4bit

## Resumen

Qwen3.8-27B-Opus-Distill-v2-MTPLX-4bit es una conversión cuantizada a 4 bits del modelo multimodal Qwen3.8-27B-Opus-Distill-v2, un experimento de investigación en alineación y seguridad de IA desarrollado por barozp dentro del proyecto XOR-TRON. El modelo original fue destilado desde una base de 27 mil millones de parámetros (DavidAU Qwen3.6 27B Fable Fusion) hasta aproximadamente 4,67 mil millones de parámetros, y entrenado con trazas de razonamiento verificadas de fuentes Opus genuinas. La v2 corrige un defecto crítico de la v1: un bucle de auto-verificación determinista que se activaba al apilar restricciones de formato, produciendo 3000 tokens sin salida visible.

Esta variante MTPLX de 4 bits está diseñada para decodificación especulativa en Apple Silicon mediante el runtime mtplx, con un speedup verificado de 2,39x a profundidad 3. Incluye el encoder de visión integrado en los pesos y un sidecar MTP en bf16 para la predicción multi-token. Es la opción recomendada de la familia por su equilibrio calidad/tamaño: aproximadamente 16,9 GB en disco, con la visión intacta y el mayor throughput especulativo de la colección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5) |
| Parámetros totales | 4.665.462.000 (~4,67 mil millones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (MTPLX affine, group_size 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX/MTPLX) |

Nota: el nombre del modelo indica "27B", pero los parámetros totales según los pesos safetensors son ~4,67 mil millones. La cifra "27B" se refiere al tamaño del modelo base original antes de la destilación.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B-Opus-Distill-v2 es un modelo multimodal de la familia Qwen3.5, destilado desde un base de 27 mil millones de parámetros hasta aproximadamente 4,67 mil millones. La destilación se realizó con trazas de razonamiento verificadas de fuentes Opus genuinas; en la v2 se reconstruyó el dataset de entrenamiento con cada fila rastreada a una fuente real, un escaneo con 30 jueces LLM en paralelo y la eliminación de filas patológicas. Esta reconstrucción corrige el bucle de auto-verificación de la v1, que se activaba con restricciones de formato apiladas ("sin prosa" + "sin markdown") y producía 3000/3000 tokens sin salida visible.

La conversión MTPLX cuantiza el tronco del modelo con body_bits=4 y body_group_size=64 en modo affine, manteniendo el sidecar MTP (multi-token prediction) en bf16 para la decodificación especulativa. La conversión se realizó directamente desde los pesos bf16 safetensors, sin pasar por GGUF, por lo que no hay deriva de dequantización-requantización en la cadena. El encoder de visión se almacena como model-vision.safetensors (879 MB, 333 tensores, bf16) y se carga automáticamente, sin necesidad de ficheros mmproj separados.

## Capacidades

- Generación de texto y razonamiento multi-paso con control de formato estricto (sin bucles de auto-verificación tras el bugfix v2)
- Comprensión de imágenes con encoder de visión integrado en los pesos
- Razonamiento matemático y analítico: mejora de +0,237 en gpqa_diamond frente al modelo base
- Generación de código con restricciones de formato apiladas (verificado con el caso de reproducción fib(n))
- Decodificación especulativa con MTP (multi-token prediction) para acelerar la inferencia
- Servidor local compatible con OpenAI (mtplx serve) para integración con herramientas existentes
- Capacidades conversacionales multi-turno

## Casos de uso

- **Generación de código con restricciones de formato estrictas**: el bugfix v2 garantiza que el modelo converge en respuestas limpias cuando se le aplican restricciones apiladas ("sin prosa" + "sin markdown"), algo que la v1 no podía hacer. Es adecuado para pipelines que generan JSON, SQL o plantillas con reglas de formato rígidas.
- **Análisis multimodal de imágenes en local**: el encoder de visión integrado permite describir
