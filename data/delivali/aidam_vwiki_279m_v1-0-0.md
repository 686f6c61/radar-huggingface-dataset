# DeliVali/AIDAM_VWIKI_279M_V1.0.0

## Resumen

AIDAM_VWIKI_279M_V1.0.0 es un verificador de afirmaciones enciclopédicas desarrollado por DeliVali (Jeffrey Romero Del Val) como parte del proyecto AIDAM, un agente de fact-checking de código abierto. El modelo recibe un fragmento de evidencia y una afirmación, y devuelve un veredicto de tres clases: entailment (la evidencia apoya la afirmación), neutral (no hay suficiente información) o contradiction (la evidencia refuta la afirmación). Está especializado en el registro de afirmaciones factuales estilo Wikipedia, siguiendo el formato del benchmark FEVER.

La arquitectura se basa en mDeBERTa-v3-base, con 278.811.651 parámetros y una ventana de inferencia de 512 tokens. El punto de partida es el checkpoint `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`, ya preentrenado en NLI multilingüe con XNLI y otros corpus. El modelo se distribuye en formato SafeTensors (~557 MB) y ONNX (grafo de 2.5 MB + pesos externos de 1.1 GB), bajo licencia Apache 2.0.

Su relevancia radica en la propuesta metodológica del proyecto AIDAM: el veredicto factual sobre una afirmación nunca proviene de un modelo de lenguaje grande, sino de un encoder NLI pequeño y especializado como este, junto con código de agregación determinista. El LLM en el pipeline solo redacta y explica, no juzga. Esto permite auditoría completa y reproducción de los veredictos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mDeBERTa-v3-base (transformer encoder) |
| Parámetros totales | 278.811.651 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens, sin chunking |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, es (base multilingüe; solo evaluado en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (~557 MB), ONNX (grafo 2.5 MB + pesos externos 1.1 GB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia DeBERTa-v3, concretamente la variante base con embeddings de deconvolución. El checkpoint base ya había sido preentrenado en NLI multilingüe sobre XNLI y otros corpus NLI (2.7 millones de pares), lo que le proporciona una base sólida para la tarea de inferencia de lenguaje natural.

El fine-tuning se realizó sobre el conjunto de entrenamiento de FEVER en formato NLI, con una distribución de clases cuidadosamente equilibrada: 50.000 filas de entailment, 49.113 de contradiction (sin capar) y 15.000 de neutral (capado desde las ~35.419 originales, tras comprobar que en intentos anteriores sin capar se sobre-corregía el recall débil de la clase neutral a costa de las otras dos). El entrenamiento usó learning rate de 2e-5, 1 época (3.519 pasos), batch efectivo de 32, longitud máxima de secuencia 512, planificador OneCycleLR con 6% de warmup, AdamW de 8 bits y precisión bf16. El mejor checkpoint se obtuvo en el paso 400 de 3.519, con una precisión balanceada interna de dev de 87.51. Se entrenó en una GPU de consumo de 12 GB en unos 13 minutos.

Este fue el tercer intento de especialización. Los dos primeros obtuvieron mayor precisión global (76.28 y 76.34) pero fueron rechazados porque dejaban la clase neutral sin capar, lo que arreglaba el recall débil del modelo anterior a costa de un deterioro real en "refutes" y "supports", incumpliendo la cláusula de recall por clase del protocolo pre-registrado. El cambio de variable para el intento promovido fue únicamente capar la clase neutral a 15.000 filas.

## Capacidades

- Clasificación NLI de 3 clases: entailment (apoya), neutral (no hay información suficiente) y contradiction (refuta).
- Verificación de afirmaciones enciclopédicas estilo Wikipedia (registro FEVER): dado un fragmento de evidencia y una afirmación, produce un veredicto binario con una tercera clase de insuficiencia de información.
- Capacidad multilingüe heredada del base (CC100, 100 idiomas, y XNLI que incluye español), pero sin medición en este checkpoint para la tarea.
- No es un modelo generativo: no genera texto ni razonamiento libre, solo produce una etiqueta de clasificación.
- No soporta tool calling, agentes ni multi-step reasoning por sí mismo; su rol es el de juez factual dentro de un pipeline mayor.
- Funciona con la API estándar de Transformers para secuencia a secuencia de clasificación.

## Casos de uso

- Verificación de afirmaciones en artículos de Wikipedia o enciclopedias: el modelo puede comprobar si una afirmación propuesta por un editor está respaldada por una fuente de evidencia concreta, devolviendo "apoya", "refuta" o "no hay información suficiente".
- Moderación de contenido factual en plataformas colaborativas: integrar el modelo como paso automático antes de que una edición se publique, marcando afirmaciones no respaldadas por las fuentes citadas.
- Validación de respuestas generadas por LLM: cuando un modelo de lenguaje produce una respuesta con afirmaciones enciclopédicas, este modelo puede verificar cada afirmación contra la evidencia recuperada antes de mostrar la respuesta al usuario, evitando alucinaciones.
- Auditoría de bases de conocimiento: comprobar sistemáticamente si las entradas de una base de datos de conocimiento (por ejemplo, un grafo de conocimiento) están respaldadas por la literatura de referencia.
- Pipeline de fact-checking automatizado para periodismo: dado un artículo y un conjunto de fuentes, el modelo puede clasificar cada afirmación del artículo como respaldada, refutada o sin evidencia, ayudando a los redactores a priorizar la revisión humana.
- Agente de fact-checking de código abierto (AIDAM): el modelo es el núcleo de veredicto de un sistema mayor que recupera evidencia en vivo de múltiples fuentes y produce veredictos citables. El LLM redacta y explica, pero el juicio factual lo emite este modelo, lo que permite auditoría completa y reproducibilidad.

## Benchmarks y rendimiento

Medido en el conjunto de dev de `pietrolesci/nli_fever` (19.998 pares, exactamente equilibrado por clase con 6.666 por clase). La métrica es la precisión de etiqueta, que coincide con la precisión balanceada por construcción del split.

| Métrica | Verificador de generación anterior | Este modelo | Cambio |
|---|---|---|---|
| Precisión | 73.57 | **75.53** | +1.96 |
| Recall "no hay información" | 52.52 | **60.50** | +7.98 |
| Recall "refuta" | 80.99 | 79.88 | −1.11 |
| Recall "apoya" | 87.19 | 86.21 | −0.98 |

El modelo pasó las cuatro cláusulas del protocolo pre-registrado: precisión > 74.79 (obtuvo 75.53), ningún recall por clase regresó más allá de la tolerancia de ruido de medición, presupuesto de parámetros < 500 millones (278.8M) y cero contaminación train/dev verificada fila a fila (se descartaron 5 de 208.346 filas candidatas por solapamiento).

No se han publicado resultados de benchmarks en la información disponible para comparar con otros modelos NLI de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en Safe. Tensors ocupa ~557 MB; el formato ONNX con pesos externos suma ~1.1 GB. La inferencia es factible en GPU con 2-4 GB de VRAM, y también en CPU con memoria RAM suficiente.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 4 GB de VRAM (por ejemplo, GTX 1660, RTX 2060, RTX 3060, RTX 4090) es suficiente. No requiere GPU de datacenter.
- Cabe en GPUs de consumo: sí, con margen amplio incluso en tarjetas de 4 GB.
- Opciones de despliegue: la API estándar de Transformers (PyTorch) es el camino principal; también se puede exportar a ONNX y servir con ONNX Runtime. No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada, pero dado el tamaño (278M) y la longitud de contexto de 512 tokens, es de esperar inferencia en decenas de milisegundos en GPU moderna y subsegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer una comparación cuantitativa con otras alternativas. Como referencia arquitectónica, los modelos comparables por tamaño y tarea serían:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AIDAM_VWIKI_279M_V1.0.0 (este) | 278.8M | 512 | Apache 2.0 | Especializado en registro FEVER |
| MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 (base) | 278.8M | 512 | Apache 2.0 | Preentrenado en NLI multilingüe, sin especialización FEVER |
| DeBERTa-v3-base-mnli-fever-anli | ~278M | 512 | Apache 2.0 | Variante entrenada en MNLI, FEVER y ANLI (no verificado) |
| Facebook/bart-large-mnli | ~407M | 1024 | Apache 2.0 | Modelo NLI de tipo seq2seq, más pesado y sin registro FEVER |

No se han publicado resultados comparativos en la información disponible para estos modelos sobre el mismo split de FEVER.

## Limitaciones y advertencias

- La puntuación es específica del registro de afirmaciones enciclopédicas (estilo FEVER). No es un benchmark de razonamiento general ni de conocimiento; no dice nada sobre el comportamiento en afirmaciones de noticias, científicas o virales.
- El modelo base es multilingüe (CC100, 100 idiomas, y XNLI con español), pero el fine-tuning y la evaluación se realizaron solo con afirmaciones en inglés. No existe medición en español para este checkpoint; la capacidad multilingüe está presente en los pesos pero no verificada para esta tarea.
- Los recalls de "refutes" y "supports" son ligeramente inferiores a los del verificador de la generación anterior (80.99 → 79.88 y 87.19 → 86.21 respectivamente). Es un trade-off real y acotado, a cambio de una gran mejora en el recall de "no hay información" (+7.98).
- Los márgenes de recall por clase sobre el umbral del protocolo son estrechos (0.11 y 0.24 puntos por debajo de la mitad de una banda de ruido de medición); una muestra de dev diferente podría mover alguno de ellos por debajo del verificador anterior.
- La ventana de inferencia está limitada a 512 tokens sin chunking; evidencias más largas que este límite se truncarían y podrían perder información relevante.
- No es un modelo generativo: no puede redactar explicaciones ni razonar de forma abierta; solo produce una etiqueta de clasificación.
- Licencia Apache 2.0, sin restricciones de uso comercial conocidas más allá de las del propio Apache 2.0.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/DeliVali/AIDAM_VWIKI_279M_V1.0.0
- Repositorio del proyecto AIDAM en GitHub: https://github.com/DeliVali/AIDAM
- Documentación del proyecto: https://github.com/DeliVali/AIDAM/tree/main/docs
- Scripts de entrenamiento: https://github.com/DeliVali/AIDAM/tree/main/training
- Checkpoint base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Modelo anterior (V0.1.0): https://huggingface.co/DeliVali/AIDAM_VWIKI_279M_V0.1.0
- Perfil del autor en Hugging Face: https://huggingface.co/DeliVali
