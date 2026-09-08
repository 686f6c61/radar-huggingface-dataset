# drifting-walter/kikori

## Resumen

El modelo `drifting-walter/kikori` es un clasificador de texto en portugués desarrollado por `drifting-walter` para el framework Rashomon. Su función principal es el sentimiento dirigido a objetivo (target-directed sentiment): dado un nombre de persona y un texto en portugués, predice cómo el texto trata a esa persona, clasificándolo en negativo, neutral o positivo. El modelo se construye mediante fine-tuning de `neuralmind/bert-base-portuguese-cased` (BERTimbau base), con una arquitectura BERT encoder-only de 108.925.443 parámetros y una longitud de entrada máxima de 256 tokens.

La relevancia del modelo radica en su aplicación al análisis de sesgo mediático y reputación de figuras públicas en contextos lusófonos. Permite comparar cómo distintos medios tratan a la misma persona, evitando comparaciones entre personas debido a sesgos inherentes. El modelo se distribuye bajo licencia MIT e incluye versiones en safetensors y ONNX (fp32 y cuantizado int8), lo que facilita su despliegue tanto en Python como en entornos JavaScript.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder-only transformer) |
| Parametros totales | 108.925.443 |
| Parametros activos | no disponible |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | fp32 (ONNX), int8 dinámico por canal (ONNX cuantizado) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de BERTimbau base, un transformer encoder-only preentrenado en portugués. La tarea de clasificación se formula como un problema de pares: la entrada se construye como `[CLS] persona [SEP] texto [SEP]`, con `token_type_ids` 0 para el primer segmento y 1 para el segundo, y `max_length` 256. La salida son tres logits en el orden `neg, neu, pos`, y la puntuación final se calcula como `(p_pos - p_neg) * 10`, con un rango de -10 a 10. Una temperatura de 4.25 ya está plegada en los pesos del clasificador.

El entrenamiento se realizó con un batch efectivo de 32, tasa de aprendizaje de 5e-5, 4 épocas y entropía cruzada con pesos de clase. Se aplicó calibración de temperatura en validación. Los datos de entrenamiento provienen de un holdout de 469 pares (persona, texto) etiquetados por un profesor LLM bajo reglas definidas en el repositorio, con un acuerdo profesor-humano de aproximadamente 0.73. El modelo se distribuye con soporte ONNX, incluyendo una versión cuantizada int8 dinámica por canal para inferencia más eficiente.

## Capacidades

- Clasificación de sentimiento dirigido a objetivo en portugués, determinando si un texto trata a una persona concreta de forma negativa, neutral o positiva.
- Generación de una puntuación continua entre -10 y 10, con umbrales de clase: negativo si la puntuación es menor o igual a -2.5, positivo si es mayor o igual a 2.5.
- Inferencia en Python mediante `model.safetensors` y en JavaScript mediante archivos ONNX con `@huggingface/transformers`.
- Disponibilidad de dos versiones de inferencia: fp32 (436 MB) y cuantizada int8 dinámica (110 MB), lo que permite elegir entre precisión y eficiencia.
- Inclusión de `fixtures.json` con 24 pares de prueba y puntuaciones esperadas para validar la implementación en distintos runtimes.
- No soporta tool calling, agentes, visión ni audio; es un modelo de clasificación de texto puro.

## Casos de uso

- Análisis de sesgo mediático: comparar cómo diferentes medios de comunicación portugueses tratan a una misma figura política (por ejemplo, Lula o Bolsonaro) puntuando artículos sobre esa persona, lo que permite detectar diferencias de tono entre medios.
- Monitorización de reputación online: seguir la evolución del sentimiento hacia una persona pública en redes sociales o noticias, usando la puntuación -10..10 para detectar cambios de tono a lo largo del tiempo.
- Investigación en ciencias sociales: estudiar el encuadre de personalidades en corpus de prensa, clasificando automáticamente párrafos o artículos según su actitud hacia el sujeto.
- Análisis de debates políticos: evaluar si un candidato es tratado de forma más negativa o positiva en transcripciones de debates, comparando el tratamiento entre candidatos.
- Sistemas de alerta temprana de discurso hostil: identificar textos que atacan a una persona concreta, usando el umbral de clase negativa (<= -2.5) para filtrar contenido hostil.
- Auditoría de medios: verificar si un medio mantiene un sesgo consistente hacia una persona a lo largo del tiempo, comparando las puntuaciones de múltiples artículos sobre la misma figura.

## Benchmarks y rendimiento

Se han publicado resultados en la model card para un holdout de 469 pares etiquetados por un profesor LLM:

| Métrica | fp32 | int8 | constante 0 |
|---|---|---|---|
| Accuracy | 0.77 | 0.76 | 0.59 |
| MAE | 1.76 | 1.77 | 2.16 |

El recall de la clase positiva es 0.33, lo que se identifica como un punto débil conocido. No se han publicado benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: para la versión fp32, los pesos ONNX ocupan 436 MB; para la versión int8, 110 MB. En Python, los safetensors de 108M parámetros ocupan aproximadamente 435 MB en fp32. La inferencia puede ejecutarse en CPU sin problemas; no se especifica un requisito mínimo de VRAM en la información disponible.
- GPU recomendadas: no disponible. Dado el tamaño del modelo, cualquier GPU con al menos 1 GB de VRAM es suficiente, o incluso una CPU moderna.
- Compatibilidad con consumer GPU: sí, el modelo es pequeño y puede ejecutarse en GPUs de consumo como RTX series.
- Opciones de despliegue: Transformers (Python), `@huggingface/transformers` (JavaScript con ONNX), ONNX Runtime, y Hugging Face Inference Endpoints (según tags de compatibilidad).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tuning de `neuralmind/bert-base-portuguese-cased`, que actúa como modelo base, pero no se han publicado comparaciones con otras alternativas de la misma tarea. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgo conocido: el nombre de la persona actúa como un prior aprendido de etiquetas de entrenamiento sesgadas. Los pares con Lula tienden a puntuaciones positivas, mientras que Tarcísio y los Bolsonaros tienden a negativas. La misma frase hostil corta puntúa +1.9 con Lula como objetivo y aproximadamente -4.5 con otros. Los textos más largos se leen por contenido.
- El modelo es una regla, no un juez; está sesgado de forma consistente para todos los medios, lo que permite comparaciones entre medios sobre la misma persona, pero no comparaciones entre personas.
- Recall de la clase positiva es 0.33, un punto débil conocido que puede resultar en detección insuficiente de sentimiento positivo.
- Riesgo de alucinación: bajo, ya que es un clasificador y no genera texto libre.
- Limitaciones de idioma: solo soporta portugués (pt); no funciona con otros idiomas.
- La versión int8 puede desviarse hasta ~1.3 puntos entre runtimes; se recomienda usar tolerancia en las pruebas.
- Al truncar la entrada en pares con `truncation: true` en `transformers.js`, el `[SEP]` final puede eliminarse y desplazar la puntuación; se debe truncar solo el texto, no el par completo.

## Enlaces

- HuggingFace: https://huggingface.co/drifting-walter/kikori
- Repositorio Rashomon: https://github.com/walteraandrade/rashomon
- Repositorio del modelo (entrenamiento y documentación): https://github.com/walteraandrade/kikori
