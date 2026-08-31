# lokeshkumar79/kid-whisper-base-en-myst-ours

## Resumen

`kid-whisper-base-en-myst-ours` es un modelo de reconocimiento automático del habla (ASR) desarrollado por Lokesh Kumar, obtenido mediante fine-tuning de `openai/whisper-base.en` sobre el corpus MyST de habla infantil en inglés. El modelo está diseñado específicamente para investigación sobre compresión de modelos ASR a pequeña escala, incluyendo técnicas de cuantización y poda. Su relevancia radica en que extiende un estudio de compresión a la escala base de Whisper (74 millones de parámetros) utilizando el mismo pipeline de filtrado y evaluación que los checkpoints de mayor tamaño (small y medium) del mismo estudio, evitando así confusiones por diferencias en los datos de entrenamiento.

Arquitectónicamente, se trata de un transformer encoder-decoder con 72.593.408 parámetros, fine-tuneado con precisión mixta fp16 y un tamaño de lote efectivo de 64. El modelo está pensado exclusivamente para uso investigativo, no para producción, y se distribuye bajo licencia MIT. Su ventana de contexto es la estándar de Whisper (30 segundos de audio), y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | 72.593.408 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana estandar de Whisper) |
| Tipos de cuantizacion | No especificado (el modelo se usa como base para estudios de cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-base.en`, un transformer encoder-decoder con aproximadamente 74 millones de parámetros, diseñado originalmente para ASR multilingüe. En este caso, se ha fine-tuneado exclusivamente sobre el corpus MyST (My Science Tutor), un conjunto de habla infantil en inglés. El pipeline de filtrado incluye eliminación de transcripciones faltantes, filtrado por calidad de ASR de referencia, manejo de etiquetas no verbales, eliminación de utterances cortos y limitación de duración para los conjuntos de entrenamiento y validación.

El entrenamiento se realizó con el `Seq2SeqTrainer` de HuggingFace, con precisión mixta fp16. Los hiperparámetros principales son: learning rate de 1e-5, batch por dispositivo de 8, acumulación de gradientes de 8 (batch efectivo de 64), 500 pasos de warmup y un máximo de 8000 pasos, completados en su totalidad. Se aplicó early stopping con paciencia de 5 y métrica WER sobre el conjunto de dev, seleccionándose el checkpoint del paso 4500 como el mejor. El batch efectivo se mantuvo en 64 para ser comparable con el modelo compañero `tiny.en`, aunque se redujo el micro-batch y se duplicó la acumulación para ajustarse a la VRAM de 8 GB de la GPU de entrenamiento (RTX 4060).

## Capacidades

- Reconocimiento de voz automático (ASR) para habla infantil en inglés, con WER de 11,91% en el conjunto de test concatenado de MyST.
- Fine-tuning específico sobre un corpus de dominio (habla de niños), mejorando el rendimiento frente al modelo base sin fine-tuning en ese dominio.
- Soporte de transcripción de audio con ventanas de 30 segundos, mediante la pipeline de HuggingFace con `chunk_length_s=30` y búsqueda de haz (beam=5).
- No dispone de capacidades de tool calling, agentes, visión ni multilingüismo; es un modelo puramente de ASR.
- Pensado para investigación en compresión (cuantización y poda), no para uso en producción.

## Casos de uso

- Investigación académica en compresión de modelos ASR: el modelo sirve como punto de partida para estudiar el efecto de la cuantización post-entrenamiento (por ejemplo, cuantización de 8 bits o 4 bits) sobre el WER en habla infantil, comparando con el modelo `tiny.en` y los de mayor escala.
- Evaluación de técnicas de poda de parámetros: al ser un modelo denso de tamaño moderado, permite analizar cómo la poda por magnitud o importancia afecta al rendimiento en un dominio específico, sin los costes computacionales de modelos más grandes.
- Estudio de escalado de capacidad: junto con los checkpoints de 39M, 244M y 769M, permite trazar una curva de escalado WER vs. parámetros bajo una metodología de evaluación idéntica, útil para predecir el rendimiento de modelos intermedios.
- Comparación de pipelines de filtrado de datos: al documentar el pipeline de filtrado, se puede reproducir el estudio y comparar con otros esquemas de filtrado (como el de Dutta et al. para `tiny.en`), aislando el efecto de la calidad de los datos.
- Desarrollo de ASR para entornos educativos (investigación): aunque no está validado para producción, puede usarse en prototipos de sistemas de tutoría inteligente que requieran transcribir habla de niños en inglés, siempre bajo supervisión investigativa.
- Benchmark para técnicas de compresión en hardware limitado: al caber en GPUs de consumo (8 GB VRAM), permite probar algoritmos de compresión en entornos con recursos reducidos, como laboratorios universitarios.

## Benchmarks y rendimiento

El modelo reporta un WER de dev (métrica de early stopping) de 10,65% en el paso 4500, y un WER de test concatenado de 11,91% bajo el protocolo de evaluación estándar del estudio (pipeline de HuggingFace, `chunk_length_s=30`, beam=5, batch=4). La siguiente tabla compara este modelo con otros checkpoints de la misma investigación, todos evaluados con el mismo protocolo:

| Modelo | Parametros | WER (test concatenado) |
|---|---|---|
| kid-whisper-tiny-en-myst-ours | 39M | 14,53% |
| kid-whisper-base-en-myst-ours (este modelo) | 74M | 11,91% |
| kid-whisper-small-en-myst (Attia et al.) | 244M | 9,16% |
| kid-whisper-small-myst, multilingue (Attia et al.) | 244M | 9,91% |
| kid-whisper-medium-en-myst (Attia et al.) | 769M | 8,94% |

La evolución del WER de dev durante el entrenamiento muestra una meseta a partir del paso 4500, con valores entre 10,65% y 10,97% en los pasos posteriores, confirmando que el early stopping no se activó prematuramente.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp16 (el modelo tiene 72,6M parámetros, aproximadamente 145 MB en fp16). Con cuantización a 8 bits, el uso de memoria es aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. El entrenamiento se realizó en una RTX 4060 con 8 GB, por lo que cualquier GPU de gama media o alta puede manejar el modelo sin problemas.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs como RTX 3060, RTX 4060, RTX 4090, etc. También puede ejecutarse en CPU para inferencia de baja latencia, aunque con menor velocidad.
- Opciones de despliegue: al ser un modelo Whisper, se puede servir con la librería `transformers` de HuggingFace, `faster-whisper` (para inferencia optimizada en CPU/GPU), o mediante `whisper.cpp` para despliegue en edge. No se menciona soporte para vLLM o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 74M parámetros, la transcripción de un audio de 30 segundos suele tomar menos de 1 segundo en una GPU moderna, pero esto depende del hardware y de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (MyST test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kid-whisper-base-en-myst-ours (este) | 72,6M | 30s | 11,91% | MIT | HuggingFace |
| kid-whisper-tiny-en-myst-ours | 39M | 30s | 14,53% | MIT | HuggingFace |
| kid-whisper-small-en-myst (Attia et al.) | 244M | 30s | 9,16% | MIT | HuggingFace |
| kid-whisper-medium-en-myst (Attia et al.) | 769M | 30s | 8,94% | MIT | HuggingFace |
| openai/whisper-base.en (original) | 74M | 30s | No reportado en MyST | MIT | HuggingFace |

La comparativa muestra una mejora clara del WER al aumentar el tamaño del modelo, con una diferencia de 2,62 puntos entre el modelo base y el tiny, y de 2,75 puntos entre el base y el small. El modelo base original de OpenAI no tiene un WER reportado en MyST, por lo que no se puede comparar directamente, pero el fine-tuning sobre MyST es el factor clave de mejora.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido evaluado para producción y no se recomienda su uso en aplicaciones comerciales o críticas sin una validación adicional.
- Dominio restringido: entrenado exclusivamente sobre habla infantil en inglés del corpus MyST, por lo que su rendimiento en habla adulta, otros acentos o otros idiomas será significativamente peor.
- WER relativamente alto: con un 11,91% de WER en el test, supera a modelos más grandes (small y medium) y puede no ser suficiente para aplicaciones que requieran alta precisión.
- Sesgo potencial: el corpus MyST proviene de un contexto educativo específico (tutoría de ciencias), por lo que el vocabulario y las expresiones pueden no representar la diversidad del habla infantil general.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar transcripciones inventadas en segmentos de silencio o ruido, especialmente en audio de baja calidad.
- Sin soporte multilingüe: solo inglés, a diferencia de otros checkpoints de Whisper que son multilingües.
- Restricciones de licencia: aunque la licencia MIT permite uso comercial, el autor declara explícitamente que el modelo no está destinado a producción, por lo que cualquier uso comercial debe asumir la responsabilidad de validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lokeshkumar79/kid-whisper-base-en-myst-ours
- Perfil del autor: https://huggingface.co/lokeshkumar79
- Repositorio Kid-Whisper (Attia et al.): https://github.com/ahmedadelattia/Kid-Whisper
- Paper Kid-Whisper (arXiv): https://arxiv.org/abs/2309.07927
