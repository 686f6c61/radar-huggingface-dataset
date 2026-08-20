# mradermacher/RaDaR-32B-GGUF

## Resumen

RaDaR-32B-GGUF es una cuantización en formato GGUF del modelo RaDaR-32B, creada por mradermacher a partir del modelo base sczzz/RaDaR-32B. El modelo base es un transformer de 32.763 millones de parámetros, con licencia Apache-2.0 y etiquetado como "medical" en el repositorio. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo o en servidores con menos VRAM, gracias a los pesos en formato GGUF compatibles con llama.cpp, Ollama y otras herramientas de inferencia local.

La cuantización estática ofrecida incluye seis niveles de precisión (Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K y Q8_0), lo que permite ajustar el equilibrio entre calidad y uso de memoria. La información disponible no detalla la arquitectura interna del modelo base, el tamaño del contexto, los datos de entrenamiento ni los benchmarks, por lo que gran parte de las especificaciones técnicas quedan sin confirmar. Su relevancia actual radica en facilitar el despliegue de un modelo de 32B en entornos con recursos limitados, especialmente en el ámbito médico, aunque no se aportan evidencias de su rendimiento en tareas clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base transformer, sin detalles) |
| Parametros totales | 32.763.876.352 (del modelo base safetensors) |
| Parametros activos | No es MoE, no aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base RaDaR-32B. La model card de la cuantización solo indica que es un modelo de 32B parámetros con licencia Apache-2.0 y etiqueta "medical". El autor de la cuantización (mradermacher) no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones arquitectónicas.

La cuantización GGUF es estática, es decir, se ha convertido directamente desde los pesos originales sin entrenamiento adicional ni calibración con imatrix. Esto significa que la calidad final depende de la precisión de la cuantización elegida, pero no se ha realizado ningún ajuste fino posterior.

## Capacidades

No hay información sobre las capacidades específicas del modelo base en la documentación proporcionada. La etiqueta "medical" sugiere que podría estar orientado a tareas de dominio clínico, pero no se confirman habilidades concretas como:

- Generación de texto, razonamiento, código o matemáticas
- Soporte de tool calling o function calling
- Capacidades de agente o razonamiento multi-paso
- Capacidades multilingües más allá del inglés
- Modos de pensamiento, visión o audio

En ausencia de datos verificados, no es posible afirmar ninguna capacidad concreta.

## Casos de uso

No se han documentado casos de uso específicos en la model card. Sin embargo, al tratarse de una cuantización GGUF de un modelo de 32B, podría emplearse en entornos locales que requieran ejecución con recursos limitados. A continuación se enumeran escenarios genéricos sin confirmar:

- Despliegue en herramientas de inferencia local (llama.cpp, Ollama, LM Studio) para pruebas de concepto con modelos de 32B.
- Uso en servidores CPU-only para tareas de procesamiento de texto en inglés, siempre que el modelo base tenga las capacidades necesarias.
- Integración en aplicaciones de código abierto mediante APIs compatibles con GGUF (por ejemplo, llama-cpp-python).
- Investigación en el ámbito médico si el modelo base demuestra habilidades clínicas, aunque no hay evidencia documentada.
- Evaluación comparativa de cuantizaciones para decidir el equilibrio entre tamaño y calidad en entornos de producción.

Debido a la falta de información sobre el modelo base, estos casos son hipotéticos y no respaldados por datos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas para este modelo o su versión base.

## Requisitos de hardware

Los tamaños de archivo de los GGUF proporcionados permiten estimar la VRAM necesaria para inferencia en GPU. La siguiente tabla resume la memoria aproximada (sin considerar contexto adicional):

| Tipo de cuantizacion | Tamano del archivo | VRAM estimada (GPU) |
|---|---|---|
| Q2_K | 12.4 GB | ~13 GB (por ejemplo, RTX 3090 24GB) |
| Q3_K_S | 14.5 GB | ~15 GB (por ejemplo, RTX 3090 24GB) |
| Q3_K_M | 16.0 GB | ~17 GB (por ejemplo, RTX 4090 24GB) |
| Q4_K_S | 18.9 GB | ~20 GB (por ejemplo, RTX 4090 24GB) |
| Q6_K | 27.0 GB | ~28 GB (por ejemplo, A100 40GB) |
| Q8_0 | 34.9 GB | ~36 GB (por ejemplo, A100 80GB) |

Estas cifras son orientativas y pueden variar según el contexto y la implementación. En CPU, se puede ejecutar con memoria RAM suficiente (al menos el tamaño del archivo + overhead), pero la velocidad será menor. Herramientas compatibles: llama.cpp, Ollama, LM Studio, llamafile, y cualquier otra que soporte GGUF.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. No se conocen modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No hay información verificada sobre sesgos, alucinaciones o riesgos específicos del modelo base.
- La cuantización reduce la precisión numérica, lo que puede degradar la calidad de las respuestas, especialmente en cuantizaciones bajas (Q2_K, Q3_K).
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías sobre la exactitud médica o la seguridad en aplicaciones clínicas.
- El modelo solo declara soporte para inglés, por lo que su uso en otros idiomas puede ser limitado o errático.
- Al no conocer el contexto máximo, no se puede garantizar un rendimiento adecuado en conversaciones de largo recorrido.
- No se ha confirmado que el modelo tenga capacidades específicas médicas más allá de la etiqueta del repositorio.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/mradermacher/RaDaR-32B-GGUF)
- [Modelo base sczzz/RaDaR-32B](https://huggingface.co/sczzz/RaDaR-32B)
- [Página de descarga y visor de archivos](https://hf.tst.eu/model#RaDaR-32B-GGUF)
