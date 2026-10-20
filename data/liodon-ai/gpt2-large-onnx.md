# liodon-ai/gpt2-large-ONNX

## Resumen

liodon-ai/gpt2-large-ONNX es una exportación a ONNX del modelo openai-community/gpt2-large, publicada por Liodon AI. El repositorio contiene artefactos de inferencia: `model.onnx` en FP32 (3,35 GB) y `model_quantized.onnx` en INT8 dinámico (0,84 GB), generados con optimum para la tarea `text-generation-with-past`. El grafo expone entradas y salidas `past_key_values` para decodificación autorregresiva con caché KV.

El modelo base es GPT-2 large, un transformer decoder de generación de texto. Sin embargo, la model card no declara el número de parámetros, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento. La licencia indicada es `other`, por lo que conviene revisar los términos del modelo base antes de un uso comercial.

Su interés práctico está en el despliegue con ONNX Runtime y Optimum en CPU o GPU, especialmente para prototipos y servicios de generación de texto con requisitos moderados de memoria. No es un modelo instruct ni chat, no documenta tool calling y no incluye resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (GPT-2 large); exportación ONNX para `text-generation-with-past` con caché KV |
| Parámetros totales | no disponible en la información proporcionada (el modelo base se identifica como GPT-2 large) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 (`model.onnx`) e INT8 dinámico weight-only
