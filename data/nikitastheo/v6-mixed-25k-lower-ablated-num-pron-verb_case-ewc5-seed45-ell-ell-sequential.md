# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed45-ell-ell-sequential

## Resumen

Este modelo es un checkpoint de lenguaje causal de tipo GPT-2 con 104,7 millones de parámetros, entrenado desde cero por el usuario nikitastheo con un script propio basado en Hugging Face Accelerate (`train_clm.py`, sin `Trainer`). Por su nomenclatura y su tokenizador asociado (`babylm-25k-ell-lower-seed45-ablated-num-pron-verb_case-tokenizer`), se enmarca en la línea de experimentos BabyLM: entrenamiento de modelos pequeños con presupuestos de datos reducidos (25.000 pasos o un corpus del orden de 25k unidades léxicas) y con ablaciones controladas de categorías gramaticales (números, pronombres, verbos, caso) para estudiar el aprendizaje lingüístico.

El identificador del checkpoint revela un diseño experimental muy concreto: variante «lower» (texto en minúsculas), ablación de números, pronombres y verbos/caso, regularización EWC (Elastic Weight Consolidation) con coeficiente 5, semilla 45, y una secuencia de entrenamiento «ell-ell-sequential» que sugiere un cambio de idioma o de distribución de datos en la época 10 (el campo `Language switch epoch` de la model card apunta en esa dirección). No es, por tanto, un modelo de propósito general, sino una pieza de un estudio empírico sobre adquisición del lenguaje en modelos pequeños.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigadores que estudian cómo la composición del corpus y las ablaciones gramaticales afectan al comportamiento de un LM pequeño. No hay información publicada sobre licencia, idiomas soportados ni resultados de evaluación, y el repositorio no registra descargas ni interacciones, lo que confirma su carácter de artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (config `gpt_base_config.json`) |
| Parametros totales | 104.716.800 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a GGUF no publicada) |
| Idiomas soportados | no disponible (tokenizador asociado con prefijo `ell`, posible orientación al griego, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con la configuración base de GPT-2 (`configurations/gpt_base_config.json`), lo que típicamente implica 12 capas, 12 cabezas de atención y una dimensión de embedding de 768, coherente con los 104,7 millones de parámetros reportados. El entrenamiento se realizó con un script propio (`train_clm.py`) sobre Hugging Face Accelerate, sin usar la clase `Trainer`, lo que da control fino sobre el bucle de optimización.

Los hiperparámetros documentados son: 17.430 pasos máximos, learning rate de 1e-4 con scheduler lineal, 1.743 pasos de warmup (10 % del total), batch size de 32 por dispositivo sin acumulación de gradientes, y un cambio de idioma o de distribución de datos en la época 10. El tokenizador es específico del experimento y su nombre codifica las ablaciones aplicadas (números, pronombres, verbos y caso) sobre un vocabulario de 25k. El sufijo `ewc5` indica el uso de Elastic Weight Consolidation con coeficiente 5, una técnica de regularización contra el olvido catastrófico que encaja con un régimen de entrenamiento secuencial (`sequential`) en el que el modelo se expone a distintas fases o idiomas.

## Capacidades

- Generación de texto causal autoregresiva, la tarea declarada en el pipeline (`text-generation`).
- Compatible con `text-generation-inference` y con endpoints de Hugging Face según los tags del repositorio.
- Entrenado sobre texto en minúsculas (`lower`), por lo que la generación de mayúsculas y de formatos sensibles a la caja no está garantizada.
- Ablación explícita de números, pronombres y verbos/caso en el tokenizador: es esperable un rendimiento degradado en la producción de esas categorías gramaticales, que es precisamente el objeto del experimento.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no se declara ninguna de estas capacidades).
- Capacidades multilingües: no disponible; el sufijo `ell` del tokenizador podría indicar griego, pero no hay confirmación en la información proporcionada.

## Casos de uso

- Investigación en adquisición del lenguaje: el modelo sirve como condición experimental para medir el efecto de ablacionar números, pronombres y verbos en el aprendizaje de un LM pequeño, comparándolo con checkpoints hermanos de la misma serie.
- Estudios de olvido catastrófico: la combinación de entrenamiento secuencial y EWC con coeficiente 5 lo convierte en un banco de pruebas para evaluar retención de conocimiento entre fases o idiomas.
- Reproducibilidad de pipelines de entrenamiento: al estar entrenado con un script Accelerate explícito y publicar todos los hiperparámetros, permite replicar el experimento y auditar el efecto de cada decisión (warmup, scheduler, batch size).
- Análisis de tokenizadores ablacionados: útil para estudiar cómo la eliminación de categorías gramaticales del vocabulario afecta a la perplejidad y a la distribución de tokens generados.
- Evaluación de modelos base pequeños en entornos con recursos mínimos: con 104,7 M de parámetros y 0,4 GB de pesos, se puede cargar en CPU o en GPU de gama baja para pruebas de inferencia rápida.
- Docencia y experimentación: como ejemplo didáctico de entrenamiento causal-LM completo, desde la configuración hasta el checkpoint final, sin la complejidad de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,42 GB solo para pesos; en fp16/bf16, unos 0,21 GB. El consumo real dependerá del tamaño del contexto y del batch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, T4 o incluso inferencia en CPU son viables.
- Cabe holgadamente en GPU de consumo: sí, en cualquier modelo consumer actual e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (nativo), text-generation-inference (declarado en los tags), y conversión a GGUF para llama.cpp u Ollama si se genera dicha conversión (no publicada).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed45-ell-ell-sequential | 104,7 M | no disponible | no disponible | Hugging Face (0 descargas) |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Hugging Face |
| BabyLM baseline (modelos de referencia del challenge) | ~100 M (variable) | variable | variable | Hugging Face |

La comparación con GPT-2 small y DistilGPT-2 es pertinente por tamaño y arquitectura, pero este checkpoint no declara licencia ni evaluación, por lo que no es un sustituto directo en producción. Frente a los baselines de BabyLM, su interés es experimental: las ablaciones y el régimen secuencial con EWC lo diferencian de un entrenamiento estándar.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución; hay que contactar con el autor antes de cualquier uso fuera de investigación.
- Sin resultados de evaluación publicados: no hay evidencia de calidad de generación, perplejidad ni capacidades lingüísticas medidas.
- Entrenado sobre texto en minúsculas y con ablaciones gramaticales deliberadas: se espera un rendimiento deficiente en números, pronombres y conjugaciones verbales, lo que lo hace inadecuado para tareas generativas reales.
- Riesgo elevado de alucinación y de texto incoherente, propio de un modelo de 100 M de parámetros entrenado con un presupuesto reducido (17.430 pasos, batch 32).
- Idiomas soportados no confirmados; el tokenizador sugiere una orientación específica que no está documentada.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones multi-turno o documentos largos sin verificarla en la configuración.
- Artefacto de investigación sin mantenimiento aparente (0 descargas, 0 likes, actualizado una sola vez): no hay garantía de soporte ni de corrección de errores.
- El cambio de idioma en la época 10 y la regularización EWC pueden producir comportamientos asimétricos entre dominios que no están caracterizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case-ewc5-seed45-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed45-ablated-num-pron-verb_case-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
