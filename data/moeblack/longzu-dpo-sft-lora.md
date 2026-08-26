# Moeblack/longzu-dpo-sft-lora

## Resumen

Moeblack/longzu-dpo-sft-lora es un adaptador LoRA de ajuste fino sobre el modelo base unsloth/Qwen3.8-27B, desarrollado por el usuario Moeblack (Nakano Kenji). Se trata de un fine-tune entrenado con SFT y DPO utilizando el framework TRL, publicado en agosto de 2026. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño de 0,3 GB, y no incluye documentación técnica ni resultados de evaluación. El modelo no tiene descargas ni valoraciones en el momento de la consulta, lo que sugiere que se trata de un proyecto experimental o personal sin validación comunitaria. Su relevancia es limitada: sirve como ejemplo de aplicación del flujo de entrenamiento TRL sobre la familia Qwen, pero carece de información verificable sobre sus capacidades o rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (LoRA sobre Qwen3.8-27B) |
| Parámetros totales | no disponible (adaptador de 0,3 GB; modelo base de 27B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (campo "license" sin valor especificado) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante SFT (supervised fine-tuning) sobre el modelo base unsloth/Qwen3.8-27B, utilizando el framework TRL en su versión 1.10.0. El nombre del repositorio incluye "dpo", lo que sugiere que también se aplicó optimización por preferencias directas (DPO), aunque la model card solo menciona explícitamente el entrenamiento SFT. Las versiones de las librerías indicadas son Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.0 y Tokenizers 0.22.2. No se proporciona información sobre el dataset utilizado, el número de pasos, el tamaño del lote ni el proceso de entrenamiento. Tampoco se documenta ninguna innovación técnica en la arquitectura, que es la propia del modelo base Qwen3.8-27B.

## Capacidades

- Generación de texto: el único ejemplo de uso incluido en la model card es un pipeline de text-generation con formato chat.
- No se documentan capacidades específicas del adaptador más allá de la generación de texto.
- No se especifica soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- Las capacidades multilingües no están documentadas.
- No se menciona ningún modo especial de razonamiento o thinking mode.

## Casos de uso

No se documentan casos de uso concretos en la información proporcionada. El único ejemplo disponible es una llamada básica a la API de Transformers para generar una respuesta a una pregunta de tipo filosófico. Dado que no hay información sobre el dataset de entrenamiento ni sobre las capacidades específicas del adaptador, no es posible recomendar aplicaciones prácticas con garantías. En cualquier caso, si se quisiera experimentar con él, el modelo serviría para probar flujos de fine-tune con TRL sobre Qwen3.8-27B en entornos de desarrollo, pero no para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB, pero para la inferencia es necesario cargar el modelo base de 27B parámetros.
- En FP16 el modelo base requiere aproximadamente 54 GB de VRAM, por lo que no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB).
- Con cuantización de 4 bits se estima un consumo de 14-16 GB de VRAM, lo que permitiría ejecutarlo en una RTX 4090 o similar (estimación basada en tamaños típicos de modelos de 27B, no confirmada para este adaptador).
- El despliegue es posible con librerías como vLLM, llama.cpp, Ollama o TGI, siempre que se cargue el adaptador sobre el modelo base.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables documentados en la información proporcionada, ni se han publicado evaluaciones que permitan comparar este adaptador con otros fine-tunes de Qwen3.8-27B.

## Limitaciones y advertencias

- Licencia no especificada: el campo "license" del modelo card no indica ninguna licencia concreta, lo que hace incierto el uso comercial y la redistribución.
- Sin documentación de datos de entrenamiento: no se conoce el dataset, su procedencia ni si contiene sesgos o contenido problemático.
- Riesgo de alucinación: no se ha evaluado el modelo, por lo que el riesgo de alucinaciones es desconocido y potencialmente alto.
- Sin validación comunitaria: con 0 descargas y 0 likes, no hay evidencia de que el modelo haya sido probado por terceros.
- Soporte limitado: al ser un adaptador experimental, no hay garantías de mantenimiento, compatibilidad ni soporte técnico.
- El nombre del modelo sugiere un fine-tune temático (posiblemente relacionado con la novela "Longzu"), pero no hay documentación que lo confirme.

## Enlaces

- [HuggingFace - Moeblack/longzu-dpo-sft-lora](https://huggingface.co/Moeblack/longzu-dpo-sft-lora)
- [HuggingFace - Moeblack/longzu-lora](https://huggingface.co/Moeblack/longzu-lora)
- [HuggingFace - Moeblack/longzu-dpo-lora (discusiones)](https://huggingface.co/Moeblack/longzu-dpo-lora/discussions)
- [GitHub - Moeblack (Nakano Kenji)](https://github.com/Moeblack)
- [HuggingFace - unsloth/Qwen3.8-27B (modelo base)](https://huggingface.co/unsloth/Qwen3.8-27B)
