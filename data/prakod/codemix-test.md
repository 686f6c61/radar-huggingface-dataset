# prakod/codemix-test

## Resumen

`prakod/codemix-test` es un modelo de generación de texto (text2text-generation) publicado por el usuario prakod en Hugging Face. Se trata de un fine-tuning del modelo multilingüe [ai4bharat/IndicBART](https://huggingface.co/ai4bharat/IndicBART), orientado aparentemente a tareas de code-mixing (mezcla de códigos lingüísticos), aunque la model card no especifica el dataset de entrenamiento ni los objetivos concretos.

El modelo se entrenó durante 5 épocas con una tasa de aprendizaje de 1e-06 y un tamaño de lote total de 32. Sin embargo, los resultados de evaluación muestran una degradación severa: a partir de la época 2, la pérdida de validación se vuelve `nan` y el BLEU cae a 0.0, lo que indica un colapso del entrenamiento. Este comportamiento sugiere que el modelo no es utilizable para tareas reales y que el proceso de fine-tuning fue defectuoso o los datos de entrenamiento contenían valores no válidos.

A día de hoy, el modelo tiene 11 descargas y 0 likes, y no se ha publicado ninguna documentación adicional más allá de la generada automáticamente por el Trainer de Hugging Face. No se dispone de licencia, idiomas soportados ni especificaciones técnicas detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IndicBART (seq2seq, basada en BART) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (IndicBART base soporta 11 idiomas indios, pero no se confirma para este fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `ai4bharat/IndicBART`, un transformer encoder-decoder basado en la arquitectura BART, preentrenado para tareas de traducción y generación en lenguas de la India. El fine-tuning se realizó con el Trainer de Hugging Face, usando el optimizador AdamW (fused), scheduler lineal, y precisión mixta nativa (AMP). Los hiperparámetros incluyen learning rate de 1e-06, batch size de 16 por dispositivo con acumulación de gradientes de 2 (batch efectivo de 32), y 5 épocas.

El dataset de entrenamiento se indica como "None" en la model card, lo que significa que no se registró el nombre del dataset. Los resultados de entrenamiento muestran que la pérdida de entrenamiento cae a 0.0 a partir de la época 2, mientras que la pérdida de validación se vuelve `nan` y la longitud de generación se colapsa a 1.0. Esto es un síntoma clásico de divergencia numérica o de datos corruptos, y hace que el modelo sea inservible para cualquier tarea práctica.

## Capacidades

- Generación de texto: el modelo base IndicBART es capaz de generar texto en varios idiomas indios, pero este fine-tuning concreto no demuestra ninguna capacidad útil.
- Code-mixing: el nombre del modelo sugiere que se intentó adaptar para mezcla de códigos (p. ej., hindi-inglés), pero no hay evidencia de que funcione.
- No se ha verificado soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No se dispone de información sobre capacidades multilingües específicas de este checkpoint.

## Casos de uso

Dado el estado del modelo (pérdida NaN, BLEU 0.0), no se recomienda ningún caso de uso en producción. Los siguientes escenarios son hipotéticos y solo tendrían sentido si el modelo se reentrenara correctamente:

- Traducción automática entre lenguas indias: el modelo base IndicBART está diseñado para ello, pero este checkpoint no es válido.
- Generación de texto code-mixed: podría usarse para investigación en sociolingüística computacional, pero requiere un entrenamiento válido.
- Aumento de datos para NLP multilingüe: si funcionara, podría generar variantes code-mixed para entrenar otros modelos.
- Evaluación de pipelines de fine-tuning: el modelo sirve como ejemplo de un entrenamiento fallido, útil para depurar procesos.
- Benchmarking de métricas de calidad: se puede usar para probar sistemas de detección de modelos degenerados.
- Educación: como caso de estudio de colapso numérico en transformers.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la tabla de entrenamiento:

| Epoca | Step | Pérdida entrenamiento | Pérdida validación | BLEU | Gen Len |
|---|---|---|---|---|---|
| 1.0 | 1004 | 15.8496 | 6.6127 | 11.8261 | 20.016 |
| 2.0 | 2008 | 0.0 | nan | 0.0 | 1.0 |
| 3.0 | 3012 | 0.0 | nan | 0.0 | 1.0 |
| 4.0 | 4016 | 0.0 | nan | 0.0 | 1.0 |
| 5.0 | 5020 | 0.0 | nan | 0.0 | 1.0 |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la información disponible. El rendimiento real del modelo es nulo debido al colapso numérico.

## Requisitos de hardware

- No se dispone de información sobre VRAM necesaria. Al ser un modelo basado en IndicBART (tamaño aproximado de 400M parámetros, similar a BART-base), podría caber en GPUs de consumo con 8-12 GB de VRAM en cuantización de 8 bits, pero no hay datos confirmados.
- GPU recomendadas: no disponible.
- No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo seq2seq de Hugging Face, se podría servir con TGI o vLLM si se corrigiera el entrenamiento, pero no hay garantías.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas. El modelo base IndicBART tiene versiones oficiales en Hugging Face (ai4bharat/IndicBART) que sí están documentadas y funcionan correctamente. Otras alternativas para code-mixing en lenguas indias podrían ser modelos como `ai4bharat/IndicBERT` o `google/mt5-small`, pero no hay datos de comparación con este checkpoint concreto.

## Limitaciones y advertencias

- El modelo ha sufrido un colapso numérico durante el entrenamiento: la pérdida de validación es `nan` y el BLEU es 0.0. No es utilizable para ninguna tarea.
- No se especifica la licencia, por lo que no se puede determinar si es apto para uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El dataset de entrenamiento no está documentado ("None"), lo que impide evaluar posibles sesgos o problemas de calidad.
- La model card está incompleta y generada automáticamente; no hay descripción de usos previstos ni limitaciones.
- Cualquier intento de usar este modelo en producción conlleva un riesgo alto de fallos y resultados sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prakod/codemix-test
- Perfil del autor: https://huggingface.co/prakod
- Modelo base IndicBART: https://huggingface.co/ai4bharat/IndicBART
- Repositorio de modelos del autor: https://huggingface.co/prakod/models
