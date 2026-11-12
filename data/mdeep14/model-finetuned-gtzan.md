# mdeep14/model-finetuned-gtzan

## Resumen

`mdeep14/model-finetuned-gtzan` es un modelo de clasificación de audio obtenido mediante fine-tuning de `facebook/wav2vec2-base` sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificación de géneros musicales. Lo desarrolla el usuario mdeep14 y se distribuye con licencia Apache 2.0 a través de Hugging Face. El modelo se generó automáticamente con la clase `Trainer` de la librería Transformers, y su model card conserva todavía los marcadores de plantilla sin completar ("More information needed").

La arquitectura subyacente es wav2vec2, un transformer convolucional que opera directamente sobre la forma de onda de audio en bruto, sin necesidad de extraer características espectrales previas. El modelo cuenta con 94.571.146 parámetros totales (aproximadamente 94,6 millones) y un tamaño de repositorio de 0,4 GB en formato safetensors. El pipeline declarado es `audio-classification` y la tarea objetivo es asignar una de las diez etiquetas de género musical de GTZAN a un fragmento de audio.

La relevancia de esta ficha es fundamentalmente metodológica: se trata de un ejemplo de fine-tuning de wav2vec2 para clasificación musical, pero los resultados declarados por el autor son anómalos. La precisión registrada es 0,0 en todas las épocas de entrenamiento, con una pérdida de validación que aumenta de 2,8805 en la época 1 a 3,2270 en la época 8. Esto indica que el modelo no ha aprendido la tarea y no debe considerarse apto para uso en producción sin una revisión y un reentrenamiento completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional sobre audio en bruto) |
| Parámetros totales | 94.571.146 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (la tarea es clasificación de audio, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-base`, un codificador auto-supervisado que procesa la señal de audio directamente mediante capas convolucionales seguidas de bloques de atención transformer. Sobre esa base se añade una cabeza de clasificación para las diez clases de género de GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock). El fine-tuning se realizó con la clase `Trainer` de Transformers, con los siguientes hiperparámetros declarados: tasa de aprendizaje de 3e-05, tamaño de lote de entrenamiento de 8, acumulación de gradientes de 2 pasos (lote efectivo de 16), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, planificador lineal y 8 épocas de entrenamiento.

El conjunto de datos utilizado es `marsyas/gtzan`, en su configuración por defecto y con el split `train[80%:]` según la model-index. No se documenta el número de tokens ni la composición detallada del dataset más allá de la referencia a GTZAN. No se indica si hubo RLHF, DPO ni ninguna técnica de alineación, algo esperable en un modelo de clasificación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

El resultado del entrenamiento es problemático: la precisión se mantiene en 0,0 durante las ocho épocas y la pérdida de validación no desciende en ningún momento. Esto sugiere un fallo en la configuración del entrenamiento (posiblemente en el etiquetado, en el preprocesado del audio o en la métrica de evaluación) más que un problema intrínseco de la arquitectura wav2vec2, que en la literatura alcanza precisiones muy superiores en GTZAN.

## Capacidades

- Clasificación de audio en diez categorías de género musical según el etiquetado de GTZAN.
- Procesamiento de forma de onda de audio en bruto, sin extracción manual de características.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de texto; la entrada es audio.
- No dispone de modo de pensamiento (thinking mode), visión ni procesamiento de audio adicional más allá de la clasificación.
- El modelo declara compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).

## Casos de uso

- Prototipado de pipelines de clasificación musical: serviría como punto de partida para experimentar con wav2vec2 en tareas de etiquetado de género, siempre que se reentrene y valide correctamente antes de cualquier uso real.
- Etiquetado automático de bibliotecas musicales: un modelo de este tipo permitiría organizar colecciones por género, aunque el modelo actual no es fiable para ello dado que su precisión declarada es 0,0.
- Investigación académica sobre fine-tuning de modelos de audio: el repositorio documenta la configuración de entrenamiento y las curvas de pérdida, lo que puede servir como caso de estudio de una configuración fallida.
- Evaluación comparativa de arquitecturas de audio: permite contrastar wav2vec2 con otros enfoques (AST, PANN, modelos basados en espectrogramas) en la tarea GTZAN.
- Docencia y aprendizaje de la librería Transformers: el modelo ilustra el flujo `Trainer` para audio-classification, con hiperparámetros y versiones de framework documentadas.
- Integración en demos de Hugging Face Spaces: al ser compatible con endpoints y tener licencia Apache 2.0, puede desplegarse como demostración técnica, advirtiendo de sus limitaciones de precisión.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en la model-index y en la tabla de entrenamiento. No se han publicado resultados adicionales en la información disponible.

| Dataset | Split | Métrica | Valor |
|---|---|---|---|
| GTZAN (marsyas/gtzan) | train[80%:] | Accuracy | 0,0 |

| Época | Paso | Pérdida de validación | Accuracy |
|---|---|---|---|
| 1 | 50 | 2,8805 | 0,0 |
| 2 | 100 | 3,0242 | 0,0 |
| 3 | 150 | 3,0673 | 0,0 |
| 4 | 200 | 3,1362 | 0,0 |
| 5 | 250 | 3,1585 | 0,0 |
| 6 | 300 | 3,1698 | 0,0 |
| 7 | 350 | 3,2220 | 0,0 |
| 8 | 400 | 3,2270 | 0,0 |

No se dispone de resultados de benchmarks comparativos con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,4 GB de pesos más el estado del optimizador y activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en FP16: alrededor de 0,2 GB para los pesos, con overhead adicional de activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; también funciona en CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer e incluso en entornos con poca memoria.
- Opciones de despliegue: Transformers con PyTorch, pipeline `audio-classification`, y potencialmente TGI o endpoints de Hugging Face; no se han publicado variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo de 94,6 millones de parámetros se espera una latencia de decenas de milisegundos por fragmento en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Precisión GTZAN declarada |
|---|---|---|---|---|---|
| mdeep14/model-finetuned-gtzan | 94,6 M | Clasificación de género musical | no disponible | Apache 2.0 | 0,0 |
| facebook/wav2vec2-base | 94,6 M | Representación auto-supervisada de audio | no disponible | Apache 2.0 | no aplica (modelo base) |
| Alternativas de la literatura (AST, PANN) | no disponible | Clasificación de audio | no disponible | no disponible | no disponible en esta información |

No se dispone de datos suficientes para una comparativa cuantitativa con modelos de la misma categoría más allá del modelo base. Cualquier comparación de precisión con otros fine-tunings de wav2vec2 en GTZAN requeriría consultar sus respectivas model cards, que no forman parte de la información proporcionada.

## Limitaciones y advertencias

- La precisión declarada es 0,0 en todas las épocas, lo que indica que el modelo no ha aprendido la tarea; no es apto para uso en producción.
- La pérdida de validación aumenta monótonamente durante el entrenamiento, señal de un posible fallo de configuración o de sobreajuste severo sin generalización.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"), por lo que no documenta usos previstos ni limitaciones.
- No se documentan sesgos conocidos, pero GTZAN es un dataset con problemas conocidos de etiquetado y duplicados que pueden afectar a la validez de los resultados.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí existe riesgo de clasificaciones erróneas arbitrarias dado el estado del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace desaconsejable cualquier despliegue sin reentrenamiento.
- No se especifican limitaciones de contexto ni de idioma porque la entrada es audio y no se documentan restricciones adicionales.
- El modelo se creó y actualizó en noviembre de 2026 según los metadatos, con cero descargas y cero likes, lo que refleja que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdeep14/model-finetuned-gtzan
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
