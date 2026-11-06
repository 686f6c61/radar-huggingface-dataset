# athenista/slm-tavenel-1m

## Resumen

SLM-Tavenel 1M es un modelo de lenguaje base de tipo decoder-only desarrollado por el usuario independiente athenista y publicado en Hugging Face. Se trata de un artefacto de investigación experimental, no de un asistente conversacional: no ha recibido ajuste por instrucciones ni alineamiento por preferencias. Su relevancia no reside en el rendimiento absoluto, sino en su diseño metodológico: se publica junto con un estudio preregistrado de diez semillas pareadas sobre el efecto de una compuerta de atención por cabeza (head-wise attention gate), con un modelo de control sin compuerta de tamaño casi idéntico.

El modelo tiene tan solo 1.181.920 parámetros (1.180.768 en la variante de control sin compuerta), una arquitectura transformer de 4 capas con anchura 96, 3 cabezas de consulta y 1 de clave-valor, SwiGLU de dimensión 256 y una ventana de contexto de 1.024 tokens. Fue entrenado desde cero sobre un subconjunto de 1.229 documentos etiquetados como CC0 del corpus French-Science-Commons (748 en inglés y 481 en francés), con aproximadamente 15,98 millones de posiciones de token de entrenamiento en una sola pasada.

El interés práctico es acotado: por tamaño y contexto, no compite con modelos de producción. Su valor es metodológico y educativo, ya que documenta de forma trazable el efecto de una modificación arquitectónica concreta sobre la pérdida de validación, e incluye todos los registros de entrenamiento y las réplicas del estudio. La licencia MIT cubre pesos, código e información de datos, y el autor declara una autoevaluación de cumplimiento con la Open Source AI Definition 1.0, sin que ello constituya una certificación de OSI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 4 capas, anchura 96, 3 cabezas de consulta y 1 de clave-valor, SwiGLU de 256, compuerta de atención por cabeza |
| Parametros totales | 1.181.920 (control sin compuerta: 1.180.768) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (el autor indica que no se publica versión cuantizada) |
| Idiomas soportados | Inglés y francés |
| Licencia | MIT (pesos, código e información de datos) |
| Formato de pesos | Safetensors (`model.safetensors`, float32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 4 capas con anchura de 96, 3 cabezas de consulta y 1 de clave-valor (atención agrupada), capa SwiGLU de dimensión 256 y una compuerta de atención por cabeza, que es el objeto del estudio. El tokenizador es un BPE a nivel de byte propio del proyecto con 8.192 tokens (librería tokenizers 0.22.2). El entrenamiento se realizó en precisión mixta bfloat16 con algoritmos deterministas, usando AdamW y la semilla de publicación 421101, preseleccionada en el protocolo.

Los datos de entrenamiento son 1.229 documentos del corpus French-Science-Commons etiquetados como CC0 (748 en inglés y 481 en francés), lo que supone unas 15,98 millones de posiciones de token, aproximadamente una pasada sobre el corpus. No se menciona RLHF, DPO ni ajuste por instrucciones. El resultado principal del estudio es que, en diez semillas pareadas, el modelo con compuerta reduce la pérdida de bits por byte (BPB) en datos de test no vistos en 0,0275 respecto al control sin compuerta, con un intervalo de confianza del 95 % por bootstrap jerárquico de [0,0168, 0,0395] y un umbral práctico predeclarado de 0,01 BPB. La métrica primaria es la media macro equilingüe de BPB en inglés y francés sobre un conjunto de test disjunto a nivel de documento.

El coste computacional es mínimo: una única RTX 4060 Laptop GPU de 8 GB, con unas 0,06 horas de GPU para la ejecución publicada (el estudio completo comprende 20 ejecuciones). El consumo energético no se midió.

## Capacidades

- Generación de texto autoregresiva en inglés y francés, como modelo base sin ajuste por instrucciones.
- Razonamiento de elección múltiple evaluable por verosimilitud logarítmica (formato de evaluación 0-shot usado en los benchmarks publicados).
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.
- Capacidades multilingües limitadas a inglés y francés.
- Capacidad especial: compuerta de atención por cabeza, cuyo efecto se documenta con un estudio preregistrado de diez semillas.

## Casos de uso

- Estudio de ablación arquitectónica: el modelo sirve como referencia para medir el efecto de una compuerta de atención por cabeza frente a un control de tamaño casi idéntico, con diez semillas pareadas y registros completos de entrenamiento. Es adecuado porque el paquete incluye las réplicas y el protocolo preregistrado.
- Docencia de entrenamiento de modelos de lenguaje: con 1,18 M de parámetros y 0,06 horas de GPU en una RTX 4060 Laptop, permite reproducir el pipeline completo (tokenizador, entrenamiento, evaluación BPB) en hardware de consumo.
- Investigación sobre tokenizadores de bajo vocabulario: el tokenizador BPE propio de 8.192 tokens y los registros de datos permiten analizar el impacto del vocabulario en la pérdida por byte.
- Evaluación comparativa de modelos base pequeños en tareas de elección múltiple: los resultados publicados en ARC-Easy, ARC-Challenge, HellaSwag, Belebele y WinoGrande sirven como línea base para artefactos de investigación similares.
- Auditoría de trazabilidad y licencias: el paquete incluye información de datos y una autoevaluación de la Open Source AI Definition 1.0, lo que lo hace útil como caso de estudio de gobernanza de datos en modelos abiertos.
- Prototipado de pipelines de inferencia en transformers: al ser un modelo `custom_code` con safetensors en float32 y 0,1 GB de repositorio, permite validar integraciones de carga y ejecución sin requisitos de hardware significativos.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluación 0-shot por verosimilitud logarítmica, no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| ARC-Easy (test) | Accuracy | 0,280 |
| ARC-Challenge (test) | Accuracy | 0,196 |
| HellaSwag (validation) | Accuracy | 0,259 |
| Belebele inglés (test) | Accuracy | 0,264 |
| Belebele francés (test) | Accuracy | 0,266 |
| WinoGrande XL (validation) | Accuracy | 0,493 |

El resultado principal del estudio es la reducción de BPB de 0,0275 (IC 95 % [0,0168, 0,0395]) del modelo con compuerta frente al control sin compuerta, en la media macro equilingüe de inglés y francés sobre test disjunto a nivel de documento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 1,18 M de parámetros en float32 los pesos ocupan aproximadamente 4,7 MB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB de VRAM libre; el entrenamiento publicado se realizó en una RTX 4060 Laptop de 8 GB.
- Cabe en GPU de consumo: sí, en cualquier RTX 40xx, RTX 30xx o equivalente, y probablemente también en CPU.
- Opciones de despliegue: transformers (librería indicada en la model card, con `custom_code`); no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, y no se publica versión cuantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM-Tavenel 1M | 1.181.920 | 1.024 | ARC-Easy 0,280; HellaSwag 0,259; WinoGrande 0,493 | MIT | Hugging Face |
| Control sin compuerta (misma familia) | 1.180.768 | 1.024 | BPB 0,0275 peor que el modelo con compuerta | MIT | Incluido en `training_record/replicates/` |
| Otros modelos de ~1 M de parámetros | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de comparaciones con modelos de terceros de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional ni esperar respuestas útiles a preguntas directas.
- Ventana de contexto de solo 1.024 tokens, lo que limita tareas de contexto largo.
- Entrenado sobre un corpus muy pequeño (1.229 documentos y unas 15,98 M posiciones de token en una sola pasada), con cobertura limitada a inglés y francés y probablemente sesgado hacia el dominio científico del corpus.
- Riesgo elevado de alucinación y de texto incoherente en usos fuera de distribución, dado el tamaño y el presupuesto de entrenamiento.
- Los resultados de benchmarks son declarados por el autor y no verificados de forma independiente (`verified: false`).
- El hallazgo del estudio aplica únicamente a este corpus, tokenizador y presupuesto de una pasada.
- La autoevaluación de cumplimiento con la Open Source AI Definition 1.0 es una declaración del autor y no una certificación de OSI.
- Se advierte de limitaciones de metadatos de licencia de las fuentes y de privacidad en la información de datos.
- Licencia MIT para pesos, código e información de datos, lo que permite uso comercial, pero el modelo no es apto para producción por su calidad y alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-1m
- Registro de comparaciones de benchmarks: https://huggingface.co/athenista/slm-tavenel-1m/blob/main/training_record/benchmark-comparisons.json
- Autoevaluación Open Source AI Definition 1.0: `training_record/OSAID-1.0-SELF-ASSESSMENT.md` (en el repositorio del modelo)
- Réplicas del estudio: `training_record/replicates/` (en el repositorio del modelo)
- Dataset de entrenamiento: PleIAs/French-Science-Commons (https://huggingface.co/datasets/PleIAs/French-Science-Commons)
