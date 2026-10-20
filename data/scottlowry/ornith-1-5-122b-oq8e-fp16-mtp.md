# scottlowry/Ornith-1.5-122B-oQ8e-fp16-mtp

## Resumen

Ornith-1.5-122B-oQ8e-fp16-mtp es un checkpoint cuantizado del modelo ornith-ai/Ornith-1.5-122B, publicado por scottlowry. No es un modelo entrenado desde cero: es una conversión de pesos a formato MLX mediante oQ (oMLX v0.7.1), con cuantización mixta de precisión. El resultado ocupa 134,2 GB y contiene 125.086.497.008 parámetros reales.

El repositorio etiqueta la arquitectura como qwen3_5_moe, por lo que se trata de un modelo de mezcla de expertos (MoE), aunque no se detallan parámetros activos ni longitud de contexto. Incluye un componente de visión de 0,451B en FP32 y una cabeza MTP de 2,524B, lo que sugiere capacidades multimodales y de predicción multi-token, si bien la model card no las documenta.

Su relevancia es práctica: permite ejecutar un modelo de ~125B en Apple Silicon con memoria unificada alta, con un peso medio de 8,581 bits/peso y capas sensibles preservadas en FP16/FP32. Es útil para investigación en cuantización y para inferencia local privada, pero carece de licencia, idiomas,
