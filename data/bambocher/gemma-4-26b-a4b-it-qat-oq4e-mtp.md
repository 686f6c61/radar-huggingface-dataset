# bambocher/gemma-4-26B-A4B-it-qat-oQ4e-mtp

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo Gemma 4 26B A4B IT de Google DeepMind, generada por el usuario bambocher mediante la herramienta oQ (oMLX v0.6.1) de cuantización de precisión mixta. El modelo base es un transformer multimodal con arquitectura Mixture of Experts (MoE) de 26.000 millones de parámetros totales y 4.000 millones activos por token, capaz de procesar entradas de texto e imagen y generar salidas de texto. La cuantización aplica 4 bits con grupo de tamaño 64 y produce pesos en formato MLX safetensors, diseñado para ejecución eficiente en silicio de Apple. El sufijo "qat" indica que el modelo base fue sometido a entrenamiento consciente de cuantización (quantization-aware training), lo que generalmente mejora la fidelidad tras la cuantización posterior. El modelo base soporta una ventana de contexto de hasta 256K tokens y cubre más de 140 idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + imagen) |
| Parámetros totales | 26B (modelo base); 5.046.060.882 según metadatos safetensors del repositorio cuantizado |
| Parámetros activos | 4B (A4B) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantización | 4 bits, group size 64 (esquema oQ4e, oMLX v0.6.1) |
| Idiomas soportados | Más de 140 idiomas (modelo base) |
| Licencia | No disponible en el repositorio; el modelo base usa la licencia Gemma de Google |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de arquitectura MoE desarrollado por Google DeepMind, con 26B parámetros totales y 4B activos por token. Es multimodal
