# gradients-io-tournaments/tournament-tourn_2ba0f79237bffcf7_20260907-1a0ce16d-2dd4-4d24-b7ba-a223c34067e7-5HBgDWKx

## Resumen

El modelo `gradients-io-tournaments/tournament-tourn_2ba0f79237bffcf7_20260907-1a0ce16d-2dd4-4d24-b7ba-a223c34067e7-5HBgDWKx` es un fine-tune del modelo base LFM2.5-2.6B de Liquid AI, publicado por `gradients-io-tournaments`. Se trata de un modelo de texto puro, orientado a despliegue en dispositivos edge y diseñado para cargas de trabajo agénticas. El modelo base fue desarrollado por Liquid AI y destaca por su arquitectura híbrida, su ventana de contexto de 131.072 tokens y un post-entrenamiento específico para uso de herramientas y razonamiento multi-paso.

El modelo tiene 2.697.198.592 parámetros (2,69 mil millones) y fue entrenado con un presupuesto de 34 billones de tokens. Según sus creadores, es competitivo con modelos 4 veces más grandes en tareas de uso de herramientas, seguimiento de instrucciones y tareas agénticas. La relevancia de este modelo radica en su eficiencia: puede ejecutarse en menos de 2,5 GB de memoria, alcanzando 220 tokens/s en un Apple M5 Max y 113 tokens/s en un CPU AMD Ryzen, lo que lo hace apto para entornos con recursos limitados.

Este fine-tune concreto es un modelo de torneo creado por `gradients-io-tournaments`; no se dispone de información específica sobre los datos de fine-tuning, por lo que las características aquí descritas se basan en el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 30 capas (22 bloques de convolución corta de doble puerta + 8 capas de atención GQA) |
| Parámetros totales | 2.697.198.592 (2,69 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantización | Safetensors en FP16; el modelo base ofrece GGUF, ONNX y MLX |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco |
| Licencia | lfm1.0 (licencia personalizada de Liquid AI) |
| Formato de pesos | Safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B es un modelo de lenguaje híbrido que combina bloques de convolución corta de doble puerta (double-gated short convolution) con capas de atención de query grouping (GQA). Esta combinación permite reducir el coste computacional de la atención manteniendo un buen rendimiento en tareas de contexto largo. El modelo tiene 30 capas en total: 22 bloques de convolución corta y 8 capas GQA.

El entrenamiento del modelo base se realizó con un presupuesto de 34 billones de tokens, y posteriormente se aplicó un post-entrenamiento agéntico (agentic post-training) dentro de los entornos de ejecución de agentes más populares para mejorar la compatibilidad con herramientas y tareas multi-paso. El vocabulario tiene un tamaño de 128.000 tokens. El fine-tune de `gradients-io-tournaments` hereda esta arquitectura, pero no se ha publicado información sobre el dataset ni el proceso de fine-tuning utilizado.

## Capacidades

- Generación de texto en 16 idiomas, incluidos español, inglés, francés, alemán, chino, japonés, coreano, árabe, ruso, portugués, italiano, vietnamita, tailandés, indonesio, hindi y polaco.
- Razonamiento con modo "thinking": el modelo añade una etiqueta `
