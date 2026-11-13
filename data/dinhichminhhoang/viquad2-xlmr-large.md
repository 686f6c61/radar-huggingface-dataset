# DinhIchMinhHoang/viquad2-xlmr-large

## Resumen

viquad2-xlmr-large es un modelo de respuesta extractiva de preguntas (extractive QA) para vietnamita, obtenido mediante fine-tuning de `FacebookAI/xlm-roberta-large` sobre el conjunto de datos UIT-ViQuAD 2.0, que incluye preguntas sin respuesta posible en el contexto. Lo publica el usuario DinhIchMinhHoang en Hugging Face bajo licencia MIT, con tres semillas independientes (s42, s43 y s44) entrenadas en fp16 y una estrategia de ensemble que promedia los logits de inicio y fin de las tres ejecuciones.

El modelo resuelve un problema concreto: la QA extractiva en vietnamita con detección de preguntas no respondibles, una tarea en la que los modelos multilingües genéricos suelen fallar por sesgo hacia respuestas espurias. Con 559,9 millones de parámetros y una ventana de entrada de 384 tokens (doc_stride de 128), el ensemble alcanza un F1 de 77,68 en test y una precisión de 78,90 en la clasificación de preguntas sin respuesta, según los resultados declarados por el autor.

Es relevante ahora porque ofrece una alternativa abierta y reproducible (tres semillas, umbrales documentados y código de inferencia) para un idioma con pocos recursos, y porque el autor reporta que la varianza entre semillas es menor que en la variante base de XLM-R, lo que facilita su uso en producción sin reentrenamiento extensivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabecera de QA extractiva (logits de inicio y fin) |
| Parametros totales | 559,9 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens de entrada (max_length), doc_stride 128, max_answer_length 64 |
| Tipos de cuantizacion | Pesos publicados en fp16 (safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16), con config.json, tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer XLM-RoBERTa large (24 capas, 1024 de dimensión oculta, 16 cabezas de atención, 559,9 M de parámetros) con una cabecera de question answering que predice la probabilidad de inicio y fin de la respuesta sobre la secuencia de contexto. El modelo base es multilingüe, pero el fine-tuning se realiza exclusivamente sobre vietnamita con UIT-ViQuAD 2.0, que añade preguntas sin respuesta a la versión 1.0 del corpus.

La receta de entrenamiento documentada en `configs/sweep_release.json` es: learning rate 1,5e-5, 3 épocas, `plausible_lambda` 0,3, semillas 42/43/44, max_length 384, doc_stride 128, batch 16 con acumulación de gradiente 2, warmup 0,1, weight decay 0,01, n_best 20 y longitud máxima de respuesta 64. La detección de preguntas no respondibles se implementa mediante la diferencia entre el logit nulo y el mejor logit de span (`null_diff`), comparada con un umbral ajustado en el conjunto de desarrollo: -1,50 para s42, -0,75 para s43, 1,75 para s44 y -0,25 para el ensemble. No se documenta uso de RLHF ni DPO; el ajuste es supervisado estándar con la señal de respuesta plausible.

## Capacidades

- Respuesta extractiva de preguntas en vietnamita: devuelve un fragmento literal del contexto, con puntuación de confianza.
- Detección de preguntas sin respuesta: clasifica como no respondible cuando `null_diff` supera el umbral configurado.
- Ensemble de tres semillas: promedia los logits de inicio y fin de s42, s43 y s44 para reducir la varianza.
- Procesamiento de contextos largos mediante ventana deslizante con doc_stride de 128 y selección entre los 20 mejores spans (n_best 20).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada al fine-tuning en vietnamita, aunque el encoder base sea multilingüe.

## Casos de uso

- Atención al cliente sobre base documental: dado un contexto (FAQ, política de devoluciones, manual) y una pregunta del usuario en vietnamita, el modelo extrae la frase exacta que responde y marca como no respondible cuando la información no está en el documento, evitando respuestas inventadas.
- Búsqueda de respuestas en documentación técnica interna: indexación de manuales y extracción del pasaje relevante con puntuación de confianza para ordenar resultados en un buscador corporativo.
- Verificación de cobertura de bases de conocimiento: ejecutar el modelo sobre pares pregunta-contexto para detectar lagunas documentales, usando la tasa de no respondibles como métrica de completitud.
- Extracción de datos estructurados desde texto libre: localizar campos concretos (fechas, importes, nombres de organismos) en contratos o formularios vietnamitas mediante preguntas plantilla.
- Asistencia a revisores humanos en flujos de compliance: el modelo propone el span exacto que sustenta una respuesta y el revisor valida, con trazabilidad del fragmento citado.
- Evaluación comparativa de sistemas de QA en vietnamita: al publicar tres semillas y umbrales por semilla, sirve como línea base reproducible para medir mejoras de otros modelos sobre UIT-ViQuAD 2.0.
- Despliegue en entornos con recursos limitados: con pesos fp16 de aproximadamente 1066 MiB por ejecución, cabe en una GPU de consumo para inferencia por lotes pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre UIT-ViQuAD 2.0 (test evaluado una sola vez):

| Modelo | Dev F1 | Test EM | Test F1 | Test HasAns F1 | Test NoAns acc |
|---|---|---|---|---|---|
| s42 (umbral -1,50) | 77,76 | 66,60 | 76,38 | 75,92 | 77,43 |
| s43 (umbral -0,75) | 77,20 | 66,73 | 76,78 | 76,27 | 77,95 |
| s44 (umbral 1,75) | 77,51 | 67,59 | 77,59 | 78,68 | 75,11 |
| Ensemble 3 semillas (umbral -0,25) | 78,59 | 68,35 | 77,68 | 77,15 | 78,90 |

El autor indica que el ensemble original de la fase 3, resultado principal del artículo, obtuvo un F1 de test de 77,89; el ensemble publicado queda 0,21 puntos por debajo, diferencia no significativa (IC [-0,86, 0,46]). No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1066 MiB por ejecución en fp16, según el autor; en fp32 se duplicaría hasta unos 2,2 GB, aunque no se publican pesos fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para una ejecución individual; el ensemble de tres semillas requiere cargar tres copias (aproximadamente 3,2 GB en fp16) o ejecutarlas secuencialmente.
- GPU de consumo: cabe en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs de datacenter como A100 o H100, aunque el modelo no las aprovecha por tamaño.
- Opciones de despliegue: el autor proporciona `src.qa_api.QA` y `src.demo.answer_ensemble`; al ser un modelo de la familia transformers, es compatible con Hugging Face Transformers, Text Generation Inference (TGI) para QA y ONNX Runtime. No se documenta soporte específico de vLLM ni llama.cpp (este último no aplica a un encoder de QA).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test F1 (UIT-ViQuAD 2.0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| viquad2-xlmr-large (ensemble) | 559,9 M | 384 tokens | 77,68 | MIT | Hugging Face |
| XLM-RoBERTa large base (sin fine-tuning en vietnamita) | 559,9 M | 512 tokens | no disponible | MIT | Hugging Face |
| XLM-RoBERTa base fine-tuned (referencia del autor) | 278 M | 512 tokens | no disponible (el autor solo indica mayor varianza entre semillas) | MIT | Hugging Face |
| PhoBERT large | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto de evaluación, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con UIT-ViQuAD 2.0, hereda los sesgos de dominio y estilo de ese corpus (textos de Wikipedia vietnamita).
- Riesgo de alucinación: bajo por diseño, ya que la respuesta es un span literal del contexto; el riesgo se traslada a la clasificación de respondibilidad, que puede aceptar como respuesta un fragmento irrelevante cuando `null_diff` no supera el umbral.
- Limitaciones de contexto: entrada máxima de 384 tokens con solapamiento de 128; contextos más largos requieren ventana deslizante y pueden perder respuestas que crucen los límites de los fragmentos.
- Limitaciones de idioma: fine-tuning exclusivamente en vietnamita; el rendimiento en otros idiomas no está evaluado y probablemente sea pobre.
- Restricciones de licencia: MIT, permite uso comercial; el autor advierte de que la licencia MIT de XLM-R debe verificarse antes de publicar, por lo que conviene confirmarla en la model card original de `FacebookAI/xlm-roberta-large`.
- Precisión numérica: los pesos se publican en fp16, lo que puede introducir desviaciones leves respecto a fp32.
- Umbrales: ajustados sobre el conjunto de desarrollo y con test evaluado una sola vez; en producción será necesario recalibrar el umbral de `null_diff` con datos propios.
- Varianza entre semillas: aunque menor que en la variante base, sigue existiendo (dev F1 entre 77,2 y 77,8), por lo que conviene usar el ensemble en lugar de una semilla individual.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin artículo publicado (la cita figura como TODO), lo que limita la verificación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DinhIchMinhHoang/viquad2-xlmr-large
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dataset UIT-ViQuAD 2.0 en Hugging Face: https://huggingface.co/datasets/taidng/UIT-ViQuAD2.0
- Artículo de XLM-R (Conneau et al., 2020): https://arxiv.org/abs/1911.02116
- Artículo de XLM-RoBERTa: https://arxiv.org/abs/1907.11692
