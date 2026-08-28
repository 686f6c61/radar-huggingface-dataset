# HitendraKawale/whispr-replication

## Resumen

`whispr-replication` es un artefacto de investigación educativa que replica desde cero la arquitectura de Whisper (Radford et al., 2022), desarrollado por HitendraKawale como ejercicio de aprendizaje de audio ML. El modelo, de aproximadamente 18 millones de parámetros (equivalente a Whisper Tiny: 4 capas, ancho 384, 6 cabezas de atención, vocabulario de 2.048 tokens), se entrenó sobre 100 horas de LibriSpeech `train-clean-100` en un MacBook Air con chip M1. Su propósito no es transcribir audio, sino documentar el proceso de entrenamiento y los resultados obtenidos con datos limitados.

El autor declara explícitamente que **estos modelos no transcriben voz**: el WER es del 103,4% en `dev-clean`, peor que no emitir nada, ya que generan texto fluido en inglés que ignora en gran medida la entrada de audio. Se publican para que los números del informe adjunto sean verificables y para evitar que otros repitan cinco horas de GPU. La arquitectura es fiel a la original: los pesos de `openai/whisper-tiny` cargan con `strict=True` y producen salidas bit-idénticas (diferencia máxima 0.0), y el frontend log-mel coincide con `whisper.log_mel_spectrogram` hasta 1.2e-7. La diferencia está en los datos de entrenamiento: 100 horas frente a las 680.000 de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (réplica de Whisper Tiny) |
| Parametros totales | ~18 millones (por checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 17 s (850 posiciones de encoder) para el modelo de 100 h; 15 s (750) para el de 3,7 h |
| Tipos de cuantizacion | no disponible (solo pesos en precisión nativa de PyTorch) |
| Idiomas soportados | Inglés (único idioma en los datos de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoints de PyTorch con estado del optimizador) y `tokenizer-*.json` |

## Arquitectura y entrenamiento

La arquitectura replica fielmente la de Whisper Tiny: un encoder-decoder transformer con 4 capas, dimensión de modelo 384, 6 cabezas de atención y un vocabulario de 2.048 tokens (frente a los 50.257 de GPT-2). El frontend log-mel está implementado desde cero y verificado contra la implementación oficial con una diferencia máxima de 1.2e-7. El modelo se entrenó con dos configuraciones: una con 100,3 horas de `train-clean-100` durante 20.000 pasos (~6 épocas) y otra con 3,7 horas de `dev-clean` durante 1.250 pasos (~4,7 épocas). Cada ejecución ajusta su propio tokenizador sobre las transcripciones de entrenamiento, por lo que los IDs de token difieren entre checkpoints y emparejar un checkpoint con el tokenizador equivocado produce decodificaciones sin sentido de forma silenciosa.

El análisis del autor muestra que el decoder aprende primero la distribución del texto en inglés (unigramas y bigramas) sin necesidad del encoder, lo que reduce la pérdida de entropía cruzada de 7.6 a ~5.5, y luego se estanca porque el encoder no aporta información útil. Con 3,7 horas el modelo sobreajusta (la validación traza una U clásica), mientras que con 100 horas el problema cambia a underfitting: la validación seguía bajando al final del entrenamiento. La brecha con Whisper (680.000 horas) es la tesis central del paper original, medida desde el lado opuesto.

## Capacidades

- **Reconocimiento de voz**: no funcional. El WER es del 103,4% en hablantes no vistos, peor que no emitir nada. El modelo genera texto fluido en inglés que ignora el audio.
- **Generación de texto**: produce frases en inglés gramaticalmente plausibles, pero sin relación con la entrada de audio.
- **Reproducción de arquitectura**: los pesos de `openai/whisper-tiny` cargan con `strict=True` y producen salidas bit-idénticas, lo que demuestra que la implementación del modelo es correcta.
- **Frontend log-mel**: implementación verificada contra `whisper.log_mel_spectrogram` con precisión 1.2e-7.
- **Entrenamiento reproducible**: incluye estado del optimizador y configuración completa para reanudar el entrenamiento con el mismo esquema de LR.
- **No compatible con `transformers`**: `AutoModel.from_pretrained` no puede cargar estos checkpoints; requiere el código personalizado del repositorio.

## Casos de uso

- **Estudio de la dinámica de entrenamiento de modelos de audio**: el modelo sirve para observar cómo la pérdida de entropía cruzada desciende principalmente por aprender la distribución del texto, y cómo el encoder tarda en volverse útil. Es un caso de estudio didáctico sobre la relación entre datos, sobreajuste y underfitting.
- **Verificación de implementaciones de Whisper**: dado que los pesos de `whisper-tiny` cargan con `strict=True` y producen salidas bit-idénticas, este repositorio puede usarse como banco de pruebas para validar implementaciones alternativas de la arquitectura Whisper.
- **Reproducción de resultados académicos**: los checkpoints publicados permiten a otros investigadores comprobar los números del informe (WER 103,4% y 149,9%) sin repetir las cinco horas de GPU necesarias para entrenarlos.
- **Enseñanza de ML aplicado al audio**: el código y los checkpoints documentan paso a paso cómo construir un sistema ASR desde cero, incluyendo el frontend log-mel, el tokenizador y el decoder, en un entorno de recursos limitados (16 GB de RAM, chip M1).
- **Análisis de fallos en modelos de lenguaje**: el comportamiento del modelo (generar texto fluido que ignora el audio) ilustra cómo un decoder puede aprender la distribución del lenguaje sin establecer un vínculo sólido con la entrada, un fenómeno relevante para depurar sistemas multimodales.
- **Comparación de escalado de datos**: al contrastar los resultados con 3,7 h y 100 h de entrenamiento, se puede estudiar empíricamente cómo cambia el régimen de sobreajuste a underfitting, un tema central en el escalado de modelos de IA.

## Benchmarks y rendimiento

El autor declara en la model card un único resultado oficial, no verificado:

| Modelo | Dataset | Split | WER |
|---|---|---|---|
| whispr-100h (20.000 pasos) | LibriSpeech dev-clean | dev-clean | 103,4% |
| whispr-3.7h (1.250 pasos) | LibriSpeech dev-clean | dev-clean | 149,9% (según la model card, no incluido en el model-index) |

Un WER superior al 100% es posible porque las inserciones no están acotadas: el modelo emite más palabras que la referencia. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje general ni de código.

## Requisitos de hardware

- **Entrenamiento**: el autor entrenó ambos checkpoints en un MacBook Air con chip M1 y 16 GB de RAM, usando aproximadamente cinco horas de GPU en total. No se requiere hardware especializado.
- **Inferencia**: al no transcribir correctamente, no tiene sentido desplegarlo en producción. Para fines educativos, cualquier CPU moderna puede ejecutar el modelo (18M de parámetros), aunque el código requiere PyTorch y el repositorio clonado.
- **VRAM estimada**: no disponible, pero por el tamaño del modelo (0,4 GB de repo) cabe en cualquier GPU con más de 1 GB de VRAM, e incluso en CPU.
- **Opciones de despliegue**: no compatible con vLLM, llama.cpp, Ollama ni TGI. Solo se puede ejecutar mediante el código personalizado del repositorio (`whispr`), que incluye un script de ejemplo.
- **Latencia y throughput**: no disponibles; el modelo no es útil para medir rendimiento de ASR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (LibriSpeech dev-clean) | Licencia | Formato |
|---|---|---|---|---|---|
| whispr-replication (100 h) | ~18M | 17 s | 103,4% | MIT | `.pt` personalizado |
| openai/whisper-tiny | ~39M | 30 s | ~5-8% (según configuración) | MIT | `transformers`, `openai-whisper` |
| openai/whisper-base | ~74M | 30 s | ~4-6% | MIT | `transformers`, `openai-whisper` |

La comparativa es desequilibrada por diseño: `whispr-replication` es un artefacto educativo que no funciona como ASR, mientras que `whisper-tiny` y `whisper-base` son modelos de producción con 6.800 veces más datos de entrenamiento. El autor recomienda explícitamente usar `openai/whisper-tiny` para cualquier tarea real de transcripción.

## Limitaciones y advertencias

- **No transcribe audio**: el WER es del 103,4% (100 h) y 149,9% (3,7 h), peor que no emitir nada. El modelo genera texto fluido que ignora la entrada de audio.
- **No compatible con `transformers`**: `AutoModel.from_pretrained` no puede cargar estos checkpoints; requiere el código personalizado del repositorio.
- **Tokenizadores específicos por checkpoint**: emparejar un checkpoint con el tokenizador equivocado decodifica a basura silenciosamente, sin errores.
- **Solo inglés**: el vocabulario se ajusta sobre transcripciones en inglés de LibriSpeech; no soporta otros idiomas.
- **Uso exclusivamente educativo**: el autor lo etiqueta como `not-for-production` y `research-artifact`. No debe usarse en ningún sistema real de transcripción.
- **Riesgo de alucinación extrema**: el modelo alucina texto completo sin relación con el audio, un comportamiento esperable dado el underfitting del encoder.
- **Licencia MIT**: permite uso comercial, pero dado que el modelo no funciona, no hay ningún beneficio práctico en ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HitendraKawale/whispr-replication
- Repositorio GitHub: https://github.com/HitendraKawale/whispr_replication
- README del repositorio: https://github.com/HitendraKawale/whispr_replication/blob/main/README.md
- Paper original de Whisper (referencia): https://arxiv.org/abs/2212.04356
- Perfil del autor: https://hitendrakawale.github.io/
- Publicación en LinkedIn del autor: https://www.linkedin.com/posts/hitendra-kawale_github-hitendrakawalewhisprreplication-activity-7488552339893587968-6Cvr
