# avik112/scihigh-bart-optimized

## Resumen
El modelo `avik112/scihigh-bart-optimized` es un modelo de lenguaje basado en la arquitectura BART, publicado en HuggingFace por el usuario `avik112` bajo licencia MIT. Según los datos del repositorio, cuenta con 139.470.681 parámetros (aproximadamente 139 millones) y se distribuye en formato safetensors. El nombre sugiere que se trata de una versión optimizada de BART para texto científico, aunque no se aporta información adicional en la model card.

Actualmente, el modelo no presenta descargas ni likes, y no hay documentación técnica pública sobre su entrenamiento, capacidades o rendimiento. A pesar de su denominación "scihigh", no se ha encontrado evidencia de que esté relacionado con otros modelos científicos como SciBERT. La relevancia de esta ficha radica en que, al carecer de información oficial, cualquier evaluación debe basarse exclusivamente en las características generales de la arquitectura BART y en los datos mínimos disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (encoder-decoder transformer) |
| Parametros totales | 139.470.681 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (en BART estándar suele ser 1024 tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura BART (Bidirectional and Auto-Regressive Transformer) combina un encoder bidireccional y un decoder autorregresivo, lo que la hace adecuada para tareas de generación de texto, resumen y traducción. Sin embargo, no se ha publicado ninguna información sobre el proceso de entrenamiento de este modelo concreto: ni el corpus utilizado, ni el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El autor no ha incluido una descripción técnica en la model card, y la búsqueda web no arroja resultados específicos. Por tanto, no es posible confirmar si se trata de una variante optimizada de BART-base (que también tiene ~139M parámetros) o si incorpora modificaciones adicionales.

## Capacidades

No se dispone de información oficial sobre las capacidades del modelo. En general, un BART de 139M parámetros puede realizar tareas de generación de texto, resumen, clasificación y comprensión del lenguaje, pero no se puede afirmar que este modelo en particular las tenga sin evidencia. Los únicos datos son los tags (`safetensors`, `bart`, `license:mit`, `region:us`) y el número de parámetros. No se indica soporte para tool calling, agentes, ni capacidades multimodales.

## Casos de uso

Al no existir información sobre el entrenamiento o el dominio específico, no es posible enumerar casos de uso concretos. Se podrían plantear escenarios genéricos de un BART estándar (como resumen de texto, generación de respuestas, etc.), pero no hay garantía de que este modelo los cumpla. Por tanto, se recomienda no utilizarlo en producción sin antes evaluar su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica. Tampoco se ha encontrado en la búsqueda web ninguna referencia a evaluaciones externas.

## Requisitos de hardware

- Con 139 millones de parámetros, el modelo es relativamente pequeño. En FP32, la memoria necesaria para los pesos es de aproximadamente 558 MB (139M × 4 bytes), más los activos de la inferencia. En cuantización a 8 bits, se reduciría a unos 140 MB.
- Se puede ejecutar en una GPU con poca VRAM, como una NVIDIA T4 (16 GB) o incluso en una RTX 3060 (12 GB). También es viable en CPU para inferencias de baja latencia, aunque el tiempo de respuesta será mayor.
- No hay datos sobre latencia o throughput.
- No se ha especificado soporte para vLLM, llama.cpp, Ollama o TGI. Al ser un modelo con pesos en safetensors, se puede cargar con la librería Transformers de HuggingFace, pero no hay confirmación de compatibilidad con otros frameworks.

## Comparativa con modelos similares

No hay información sobre modelos comparables. No se conocen otros modelos "scihigh" ni variantes optimizadas de BART con las mismas características. Se podría comparar con BART-base de Facebook (139M parámetros) pero no se dispone de datos de rendimiento de este modelo, por lo que no se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- No existe información sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo de 139M, su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes.
- La licencia MIT permite uso comercial, pero al no haber documentación sobre el origen de los datos de entrenamiento, no se puede garantizar la ausencia de sesgos o datos problemáticos.
- El modelo no tiene actividad ni comunidad (0 descargas, 0 likes), lo que sugiere que no ha sido probado ni validado por terceros.
- Para producción, se recomienda realizar pruebas exhaustivas de calidad y seguridad antes de integrarlo en cualquier sistema.

## Enlaces

- [HuggingFace - avik112/scihigh-bart-optimized](https://huggingface.co/avik112/scihigh-bart-optimized)
- [Documentación de BART en HuggingFace](https://huggingface.co/docs/transformers/model_doc/bart) (referencia general de la arquitectura)
- [SciBERT en GitHub](https://github.com/allenai/scibert) (posible relación, pero no confirmada)
