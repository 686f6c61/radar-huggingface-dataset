# localized-ft/OLMo-3-7B-target-only-no-hallucination-last-third-sft-seed4-epoch3

## Resumen

Este modelo es un fine-tuning de `unsloth/Olmo-3-7B-Instruct`, un modelo de lenguaje de 7.000 millones de parámetros desarrollado por el usuario `localized-ft`. El nombre del repositorio sugiere un entrenamiento específico sobre el último tercio de los datos de entrenamiento con el objetivo de reducir alucinaciones, aunque no se aportan detalles en la documentación oficial. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo se distribuye en formato `safetensors` y está diseñado para tareas de generación de texto en inglés. Aunque el repositorio tiene un tamaño de 14,6 GB, el parámetro `528.384` indicado en los metadatos es inconsistente con un modelo de 7B, por lo que se considera un error o un valor parcial. No se han publicado resultados de benchmarks ni especificaciones detalladas de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3-7B-Instruct) |
| Parámetros totales | 528.384 (según metadatos; inconsistente con un modelo de 7B, probablemente error) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (probablemente 4096 tokens, no confirmado) |
| Tipos de cuantización | No disponible (el repositorio contiene pesos en BF16, no cuantizados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/Olmo-3-7B-Instruct`, que a su vez es la versión instruida del modelo OLMo-3 de AI2. La arquitectura es un transformer decoder-only, aunque no se especifican detalles como el número de capas o cabezas de atención en la documentación. El entrenamiento se realizó con la librería Unsloth y HuggingFace TRL, lo que indica un proceso de fine-tuning supervisado (SFT) acelerado.

El nombre del modelo sugiere que se entrenó solo con el último tercio de un conjunto de datos, con el objetivo de reducir alucinaciones. Sin embargo, no se proporcionan detalles sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO. No se documenta ninguna innovación técnica adicional.

## Capacidades

- Generación de texto en inglés, heredada del modelo base OLMo-3-7B-Instruct.
- Fine-tuning orientado a reducir alucinaciones en la generación, según el nombre del modelo.
- Soporte para texto generado en formato conversacional (el modelo base es instruct).
- No se confirman capacidades específicas como tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- **Reducción de alucinaciones en generación de texto**: el modelo podría emplearse en aplicaciones donde la fidelidad a los hechos sea crítica, como generación de resúmenes o respuestas a preguntas basadas en documentos, aunque no hay evidencia publicada de su eficacia.
- **Fine-tuning de investigación**: por su licencia abierta, es adecuado como punto de partida para experimentos de reducción de alucinaciones.
- **Prototipado de asistentes conversacionales**: basado en OLMo-3-Instruct, puede usarse para chatbots simples en inglés.
- **Análisis de técnicas de SFT**: útil para comparar el efecto de entrenar sobre subconjuntos de datos (último tercio) en el rendimiento de modelos de lenguaje.
- **Despliegue en entornos con licencia permisiva**: Apache 2.0 permite integración en productos comerciales sin restricciones.
- **Investigación académica**: para estudiar el impacto de la distribución de datos en el fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para pesos en BF16 (tamaño del repositorio 14,6 GB), se requieren aproximadamente 15 GB de VRAM para inferencia en precisión completa. Con cuantización (por ejemplo, 4 bits) se podría reducir a 5-6 GB.
- **GPU recomendadas**: NVIDIA A100, H100, RTX 4090, o GPUs con al menos 16 GB de VRAM para BF16.
- **Compatibilidad con GPU de consumo**: sí, si se cuantiza el modelo (por ejemplo, con GGUF o AWQ), puede ejecutarse en RTX 3080 o superior.
- **Opciones de despliegue**: compatible con HuggingFace Transformers, Text Generation Inference (TGI), vLLM, Ollama y llama.cpp, aunque no se han verificado todos los entornos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información para realizar una comparativa con otros modelos. El modelo base OLMo-3-7B-Instruct es la referencia directa, pero no se han publicado métricas de rendimiento de este fine-tuning.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: aunque el nombre indica un objetivo de reducción de alucinaciones, no hay evidencia publicada de su eficacia real; puede seguir presentando sesgos del modelo base.
- **Idioma**: solo soporta inglés; no se recomienda su uso en español.
- **Documentación insuficiente**: falta información sobre datos de entrenamiento, hiperparámetros y evaluación.
- **Posible inconsistencia en metadatos**: el número de parámetros indicado (528.384) no coincide con el tamaño esperado del modelo de 7B, lo que puede causar problemas de configuración.
- **Riesgo en producción**: al ser un modelo no verificado, no se recomienda para aplicaciones críticas sin una evaluación exhaustiva.
- **Licencia**: Apache 2.0 permite uso comercial, pero la falta de documentación de entrenamiento puede ser un obstáculo para cumplir con requisitos de transparencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-last-third-sft-seed4-epoch3)
- [Versión con primer tercio de datos](https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-first-third-sft-seed4)
- [Versión con segundo tercio de datos](https://huggingface.co/localized-ft/OLMo-3-7B-target-only-no-hallucination-second-third-sft-seed4)
- [Repositorio OLMo de AI2](https://github.com/allenai/OLMo)
