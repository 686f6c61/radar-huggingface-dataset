# Shroomy/tinydistill-financial-tweets-minilm

## Resumen

tinydistill-financial-tweets-minilm es un clasificador de texto compacto especializado en el análisis de sentimiento de tuits financieros, con tres etiquetas posibles: `bearish`, `bullish` y `neutral`. Lo desarrolla el usuario Shroomy y se distribuye bajo licencia MIT. El modelo se obtiene mediante destilación de conocimiento desde un modelo profesor grande, `Qwen/Qwen2.5-7B-Instruct`, hacia un modelo estudiante mucho más pequeño, `sentence-transformers/all-MiniLM-L6-v2`, usando la herramienta tinydistill y el conjunto de datos `zeroshot/twitter-financial-news-sentiment`.

La propuesta de valor es clara: conseguir una precisión cercana a la del profesor (0,820 de accuracy en ONNX int8 frente a 0,832 del profesor zero-shot en 4 bits) con un coste computacional y de almacenamiento drásticamente menor (23 MB frente a 5.443 MB del profesor). El modelo se exporta a ONNX para inferencia rápida en CPU, lo que lo hace adecuado para despliegues de bajo coste y alto volumen.

Es relevante ahora porque demuestra que la destilación desde modelos de lenguaje grandes a encoders pequeños permite obtener clasificadores de dominio específico con latencias de milisegundos y sin necesidad de GPU, manteniendo una calidad competitiva. El repositorio ocupa 0,2 GB e incluye los pesos en formato ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, base all-MiniLM-L6-v2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (exportados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de destilación de conocimiento (knowledge distillation) en el que un modelo profesor, `Qwen/Qwen2.5-7B-Instruct`, genera etiquetas suaves (soft labels) sobre 9.543 textos de entrenamiento sin etiquetar. El estudiante, basado en la arquitectura BERT de `sentence-transformers/all-MiniLM-L6-v2`, aprende únicamente a partir de esas etiquetas suaves del profesor, sin usar las etiquetas gold durante el entrenamiento. Posteriormente se exporta a ONNX en precisión fp32 e int8 para inferencia en CPU.

El conjunto de datos de evaluación es `zeroshot/twitter-financial-news-sentiment`, con 2.388 textos de test etiquetados. La model card reporta que el estudiante entrenado solo con el profesor alcanza 0,825 de accuracy en PyTorch (media de 3 semillas), mientras que el mismo estudiante entrenado con cross-entropy sobre las etiquetas gold (cota superior) llega a 0,874. Esto indica que la destilación captura la mayor parte de la señal pero deja un margen de mejora respecto al entrenamiento supervisado directo.

## Capacidades

- Clasificación de sentimiento financiero en tres clases: `bearish`, `bullish` y `neutral`.
- Inferencia rápida en CPU gracias a la exportación ONNX (fp32 e int8).
- Integración con la librería `tinydistill` mediante `Predictor`, línea de comandos (`tinydistill predict`) y servidor (`tinydistill serve`).
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de sentimiento de tuits financieros en tiempo real: el modelo clasifica cada tuit en bearish, bullish o neutral con una latencia de 2,5 ms por texto en ONNX int8 (batch 1), lo que permite procesar flujos de Twitter/X a gran escala sin GPU.
- Monitorización de reputación de marcas o activos en redes sociales: se puede desplegar en un servidor CPU con `tinydistill serve` y consumir predicciones desde un pipeline de ingesta de datos.
- Filtrado previo en sistemas de trading algorítmico: el clasificador actúa como primera etapa para detectar señales de sentimiento negativo o positivo antes de enviar los casos dudosos a un modelo mayor (cascada con umbral de confianza).
- Enriquecimiento de datasets financieros: etiquetar automáticamente grandes volúmenes de textos no etiquetados con las tres clases de sentimiento para su posterior análisis.
- Detección de alertas tempranas de riesgo: al clasificar noticias y tuits como bearish, se pueden disparar alertas en sistemas de gestión de riesgo con un coste computacional mínimo.
- Despliegue en entornos con recursos limitados (edge, contenedores pequeños, Raspberry Pi): el modelo int8 de 23 MB cabe en memoria y se ejecuta en CPU con 2 hilos, sin necesidad de GPU.
- Cascada de clasificación con el profesor: el estudiante responde todos los textos y deriva los menos confiables al profesor Qwen2.5-7B, logrando 0,838 de accuracy con solo el 30% de textos enviados al profesor y una latencia media de 18,2 ms por texto.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test `financial-tweets` (2.388 textos etiquetados):

| Modelo | Dispositivo | Accuracy | Macro-F1 | Acuerdo con profesor | Latencia batch 1 (ms) | Latencia batch 32 (ms) | Throughput (textos/s) | Tamano (MB) | Aceleracion batch 1 |
|---|---|---|---|---|---|---|---|---|---|
| Profesor, zero-shot, 4-bit | cuda | 0,832 | 0,788 | n/a | 52,3 | 402,7 | 79,5 | 5443 | 1,0x |
| Estudiante, PyTorch | cpu | 0,825 ± 0,007 | 0,768 ± 0,009 | 0,870 ± 0,005 | 5,6 | 168,3 | 190,1 | 91 | 9,3x |
| Estudiante, ONNX fp32 | cpu | 0,827 | 0,770 | 0,874 | 4,0 | 185,5 | 172,5 | 91 | 13,0x |
| Estudiante, ONNX int8 | cpu | 0,820 | 0,762 | 0,869 | 2,5 | 105,7 | 302,6 | 23 | 20,9x |
| Cota superior: estudiante con etiquetas gold | cpu | 0,874 ± 0,005 | 0,832 ± 0,007 | 0,811 ± 0,003 | n/a | n/a | n/a | n/a | n/a |

Cascada (estudiante primero, textos dudosos al profesor):

| Porcentaje enviado al profesor | Umbral de confianza del estudiante | Accuracy | Macro-F1 | Latencia media por texto (ms) |
|---|---|---|---|---|
| 0% | 0,447 | 0,820 | 0,762 | 2,5 |
| 10% | 0,836 | 0,830 | 0,775 | 7,7 |
| 20% | 0,940 | 0,835 | 0,785 | 13,0 |
| 30% | 0,977 | 0,838 | 0,790 | 18,2 |
| 50% | 0,993 | 0,835 | 0,790 | 28,7 |
| 100% | 1,000 | 0,832 | 0,788 | 54,8 |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no aplica (el profesor Qwen2.5-7B en 4 bits requiere aproximadamente 5,4 GB, pero el estudiante no necesita GPU).
- Cabe en cualquier CPU consumer; el modelo int8 ocupa 23 MB y el fp32 91 MB.
- Opciones de despliegue: `tinydistill` (librería Python y CLI), ONNX Runtime, text-embeddings-inference y endpoints compatibles.
- Latencia: 2,5 ms por texto en ONNX int8 batch 1; 105,7 ms en batch 32; throughput de 302,6 textos/s en int8 (2 hilos de CPU).
- Aceleración de 20,9x respecto al profesor en batch 1 con ONNX int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinydistill-financial-tweets-minilm (ONNX int8) | no disponible | no disponible | 0,820 | MIT | Hugging Face |
| Estudiante con etiquetas gold (cota superior) | no disponible | no disponible | 0,874 | MIT | No distribuido |
| Profesor Qwen2.5-7B-Instruct (zero-shot, 4-bit) | 7B | no disponible | 0,832 | no disponible en la informacion | Hugging Face |

No se dispone de datos de otros clasificadores de sentimiento financiero comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrena solo con etiquetas suaves del profesor, por lo que hereda los sesgos y errores del profesor Qwen2.5-7B-Instruct.
- La cota superior con etiquetas gold alcanza 0,874 de accuracy, lo que indica un margen de mejora de aproximadamente 5 puntos porcentuales respecto al modelo destilado.
- El dominio es específico: tuits financieros; su rendimiento fuera de ese dominio no está garantizado.
- No se especifican los idiomas soportados; probablemente esté orientado a inglés, pero no está confirmado.
- La licencia es MIT, pero la model card advierte de que se deben comprobar las licencias del modelo estudiante, del profesor y de los datos de entrenamiento antes de su uso.
- El modelo es un clasificador, no un generador; no soporta razonamiento, tool calling ni generación de texto.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de clasificaciones erróneas en textos ambiguos o con jerga financiera poco frecuente.
- Los umbrales de la cascada se fijaron sobre el conjunto de test; en producción deben calibrarse sobre un split de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shroomy/tinydistill-financial-tweets-minilm
- Repositorio tinydistill: https://github.com/Andreas-Hum/tinydistill
- Modelo base estudiante: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
