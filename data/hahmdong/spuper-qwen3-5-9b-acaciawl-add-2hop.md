# Hahmdong/SPUPER-qwen3.5-9b-acaciawl-add-2hop

## Resumen

SPUPER-qwen3.5-9b-acaciawl-add-2hop es un modelo de lenguaje multimodal (image-text-to-text) desarrollado por Hahmdong, que consiste en un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-9B. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face, tal como se indica en la model card. El modelo tiene un total de 9.409.813.744 parámetros, según los pesos safetensors del repositorio.

No se ha publicado información detallada sobre el propósito específico del ajuste, el dataset de entrenamiento, la longitud de contexto ni los idiomas soportados. El nombre del modelo sugiere una posible especialización en razonamiento multi-hop, pero no existe documentación que lo confirme. La relevancia de este modelo radica en ser una variante ajustada de un modelo base de 9B, lo que lo convierte en una opción potencial para tareas de generación de texto e imagen, aunque su uso práctico requiere una evaluación adicional por falta de especificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen/Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base Qwen/Qwen3.5-9B, utilizando la técnica de Supervised Fine-Tuning (SFT). El entrenamiento se llevó a cabo con la librería TRL (Transformer Reinforcement Learning) en su versión 0.27.1, con Transformers 5.9.0 y PyTorch 2.11.0+cu129, según los metadatos de la model card. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni la presencia de técnicas como RLHF o DPO. La model card incluye un enlace a un experimento de Weights & Biases, pero no se detallan los datos de entrenamiento ni las innovaciones técnicas aplicadas.

## Capacidades

- No se han documentado capacidades específicas en la model card.
- El pipeline declarado es `image-text-to-text`, lo que indica que el modelo puede procesar entradas multimodales (texto e imagen), aunque no se ofrecen ejemplos ni detalles de rendimiento.
- No hay información sobre soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información disponible. Al ser un ajuste fino de Qwen/Qwen3.5-9B, podría aplicarse a tareas generales de generación de texto y procesamiento de imágenes, pero no existe evidencia concreta de su rendimiento en escenarios particulares. Se recomienda evaluar el modelo de forma experimental antes de considerarlo para cualquier aplicación en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- Dado el tamaño de 9.409.813.744 parámetros, una estimación orientativa para inferencia en precisión FP16 requeriría aproximadamente 18 GB de VRAM, mientras que en cuantización de 4 bits podría reducirse a unos 5-6 GB. Estas cifras son generales para modelos de 9B y no están confirmadas para este modelo concreto.
- No se especifican GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparable en la documentación del modelo. El único punto de referencia conocido es el modelo base Qwen/Qwen3.5-9B, del cual se desconoce su rendimiento específico en esta variante. No hay datos de benchmarks ni de características técnicas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia del modelo no está definida, lo que genera incertidumbre sobre su uso comercial y su redistribución.
- No se ha documentado el proceso de entrenamiento, el dataset ni las técnicas de alineación, por lo que se desconocen los sesgos potenciales y el riesgo de alucinación.
- La falta de especificaciones sobre la longitud de contexto y los idiomas soportados limita su aplicabilidad en entornos multilingües o de contexto largo.
- Al ser un modelo ajustado sin documentación pública, no se puede garantizar su comportamiento en producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hahmdong/SPUPER-qwen3.5-9b-acaciawl-add-2hop
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/dyhahm-Korea%20Advanced%20Institute%20of%20Science%20and%20Technology/SPUPER-SFT/runs/e4rz70tc
- Repositorio de TRL: https://github.com/huggingface/trl
