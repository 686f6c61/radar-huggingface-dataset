# aivrar-code/distilbart-mnli-12-3-onnx

## Resumen

Este repositorio publica una exportación a ONNX en un único archivo del modelo `valhalla/distilbart-mnli-12-3`, un DistilBART (12 capas de encoder y 3 de decoder) ajustado sobre MNLI para inferencia de lenguaje natural (NLI) y clasificación zero-shot. Lo mantiene el usuario aivrar-code, que lo generó para su herramienta `serp-to-prompt-writer`, escrita en C y que consume el modelo a través de la API C de ONNX Runtime.

El archivo `nli.onnx` ocupa aproximadamente 1,03 GB (unos 978 MiB) en float32, sin archivos de datos externos y con opset 18. No está cuantizado ni modificado: según el autor, los logits coinciden con los del modelo PyTorch original con una diferencia absoluta máxima de unas 6e-6 en los pares de frases comparados. La salida es un tensor de tres logits —contradicción, neutral e implicación— sobre los que se aplica softmax.

Su relevancia actual está en que ofrece una vía de despliegue mínima para clasificación zero-shot: un solo fichero autocontenido, sin dependencia de PyTorch, invocable desde Python, C u otros lenguajes con bindings de ONNX Runtime, lo que facilita integrarlo en aplicaciones nativas o en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder destilado (DistilBART), 12 capas de encoder y 3 de decoder |
| Parámetros totales | ≈256 millones (estimación a partir de 1,03 GB en float32; el autor no publica el recuento oficial) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada en la model card; la arquitectura BART emplea `max_position_embeddings` de 1024 tokens |
| Tipos de cuantización | ninguna en este repositorio (float32 puro); el autor remite a `onnx-community/distilbart-mnli-12-3-ONNX` para variantes cuantizadas |
| Idiomas soportados | no disponibles; el ajuste se realizó sobre MNLI, mayoritariamente en inglés |
| Licencia | MIT (repositorio); el modelo base no declara licencia en su página, aunque deriva de `facebook/bart-large-mnli`, con licencia MIT |
| Formato de pesos | ONNX en un único archivo `nli.onnx` (opset 18, float32, sin datos externos) |

## Arquitectura y entrenamiento

DistilBART es la destilación de `facebook/bart-large-mnli` mediante la técnica «No Teacher Distillation» que Hugging Face propuso para la sumarización con BART: se copian capas alternas del modelo grande y se vuelve a ajustar sobre los mismos datos. En la variante 12-3 el encoder conserva 12 capas y el decoder se reduce a 3. El ajuste se realiza sobre MNLI (dataset `nyu-mll/multi_nli`), de forma que el modelo aprende las tres etiquetas de inferencia: contradicción, neutral e implicación.

Este repositorio concreto no modifica los pesos ni los entrena de nuevo: solo serializa el modelo en un único grafo ONNX autocontenido. La tokenización es BPE byte-level de BART/GPT-2 con vocabulario de 50.265 entradas, y el par premisa/hipótesis se codifica como `<s> premisa </s></s> hipótesis </s>`, con un espacio inicial antes del texto de la hipótesis. La model card no menciona entrenamiento con RLHF o DPO, algo que no aplica a un clasificador NLI. El autor indica que el export se generó con herramientas asistidas por IA y que el `vocab.json` y el `merges.txt` no se redistribuyen, sino que se descargan del repositorio original.

## Capacidades

- Clasificación zero-shot: permite definir etiquetas arbitrarias en lenguaje natural como hipótesis y puntuar cada una con la probabilidad de implicación (`softmax(logits)[2]`).
- Inferencia de lenguaje natural de tres clases: contradicción, neutral e implicación, con orden de etiquetas documentado (`0` contradicción, `1` neutral, `2` implicación).
- Clasificación de texto genérica, incluida la categorización del tipo de consulta o contenido (por ejemplo, guía práctica, comparativa, reseña o receta), tal como se usa en `serp-to-prompt-writer`.
- Entradas de forma dinámica: `input_ids` y `attention_mask` como tensores `int64` de forma `[batch_size, sequence_length]`, y salida `logits` `float32` de forma `[batch_size, 3]`.
- Inferencia sin PyTorch, tanto desde Python con `onnxruntime` como desde C con la API de ONNX Runtime.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües; el ajuste sobre MNLI es mayoritariamente monolingüe en inglés.

## Casos de uso

- Clasificación de intención de búsqueda en SEO: `serp-to-prompt-writer` usa el modelo para etiquetar cada consulta con un tipo de contenido (how-to, comparativa, reseña, receta, guía de salud) y así orientar la redacción del prompt; el modelo es adecuado porque es un clasificador puro, pequeño y ejecutable en local.
- Enrutado de consultas en asistentes conversacionales: dado un mensaje de usuario como premisa y un conjunto de categorías como hipótesis, se enruta la petición al flujo correspondiente sin necesidad de entrenar un clasificador específico por dominio.
- Etiquetado de datasets sin anotaciones: aplicar zero-shot sobre corpus no etiquetados para generar una primera capa de etiquetas antes de una revisión humana, con coste de cómputo muy bajo al ser un modelo de una sola pasada.
- Detección de contradicciones en pipelines de RAG: comprobar si una respuesta generada está implicada por el contexto recuperado, usando la probabilidad de contradicción como señal de alucinación o inconsistencia.
- Filtrado y moderación de contenido: clasificar texto entrante frente a políticas redactadas como hipótesis, con umbral configurable sobre la probabilidad de implicación.
- Clasificación de tickets de soporte: asignar cada incidencia a una categoría (facturación, incidencia técnica, cancelación) sin datos etiquetados propios.
- Integración en aplicaciones nativas: al ser un fichero ONNX único y no requerir runtime de Python, puede embeberse en herramientas de escritorio o servicios en C, C++ o C# mediante ONNX Runtime.
- Triaje previo en pipelines de NLP: usar el modelo como primera etapa barata que filtre o agrupe documentos antes de invocar modelos generativos más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del export no incluye métricas de MNLI ni de otras tareas; solo documenta la equivalencia numérica con el modelo PyTorch original (diferencia absoluta máxima de aproximadamente 6e-6 en los pares comparados) y un ejemplo cualitativo donde la puntuación de implicación es de aproximadamente 0,68 para una hipótesis coherente y cercana a cero para una incoherente. El repositorio base `valhalla/distilbart-mnli-12-3` no aporta cifras de evaluación en la información recopilada.

## Requisitos de hardware

- VRAM: no requiere GPU. Alrededor de 1 GB de RAM para los pesos en float32, más el consumo del runtime; conviene reservar entre 2 y 3 GB para trabajar con holgura.
- GPU recomendadas: opcionales. Cualquier GPU compatible con CUDA puede acelerar la inferencia mediante `CUDAExecutionProvider` o `TensorRTExecutionProvider` (por ejemplo, T4, RTX 3060 o RTX 4090), pero el modelo está pensado para ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier equipo actual, incluidos portátiles sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime con distintos execution providers (CPU, CUDA, TensorRT, DirectML) desde Python, C, C++, C#, Java y otros lenguajes con bindings. No se requiere vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo. El export alternativo de `onnx-community` es compatible con el flujo estándar de Optimum/Transformers.
- Latencia y throughput: no disponibles; el autor no publica medidas. Sí documenta que la aplicación de referencia usa `CPUExecutionProvider` para clasificar consultas en una herramienta de escritorio, lo que sitúa el modelo en el rango de uso interactivo en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| `aivrar-code/distilbart-mnli-12-3-onnx` | Export ONNX single-file | DistilBART 12 capas encoder / 3 decoder | 1024 tokens (arquitectura BART) | ONNX float32, opset 18 | MIT |
| `onnx-community/distilbart-mnli-12-3-ONNX` | Export ONNX estándar | Mismo modelo base | 1024 tokens | ONNX con layout Optimum y variantes cuantizadas | no disponible |
| `valhalla/distilbart-mnli-12-3` | Modelo original | DistilBART 12/3 | 1024 tokens | PyTorch / safetensors | no declarada en su página |
| `facebook/bart-large-mnli` | Modelo origen no destilado | BART-large, 12 capas de encoder y 12 de decoder | 1024 tokens | PyTorch | MIT |

La diferencia principal entre el modelo de este repositorio y el export de `onnx-community` es el empaquetado: aquí se distribuye un único fichero autocontenido sin variantes cuantizadas, mientras que el de la comunidad sigue la disposición estándar de Optimum e incluye versiones cuantizadas. Frente a `facebook/bart-large-mnli`, este modelo reduce el decoder a 3 capas, lo que rebaja el tamaño y el coste de inferencia a cambio de la fidelidad del modelo completo.

## Limitaciones y advertencias

- Es un modelo de clasificación, no generativo: no responde preguntas, no redacta texto y no mantiene conversaciones.
- El ajuste se hizo sobre MNLI, mayoritariamente en inglés; no hay evaluación publicada de su comportamiento en castellano ni en otros idiomas.
- Puede producir puntuaciones de implicación erróneas en dominios fuera de distribución, con textos muy largos o con hipótesis mal formuladas; la puntuación depende de la plantilla y del espacio inicial antepuesto a la hipótesis.
- La longitud máxima está limitada por las posiciones de BART (1024 tokens); superarla obliga a truncar o segmentar, lo que puede eliminar justamente la parte relevante para la clasificación.
- La tokenización debe replicarse con exactitud (BPE byte-level, vocabulario de 50.265 entradas). Usar otro tokenizador o prescindir de la secuencia `<s> premisa </s></s> hipótesis </s>` altera los resultados.
- El repositorio no redistribuye `vocab.json` ni `merges.txt`; hay que descargarlos del modelo original, lo que añade una dependencia externa al despliegue.
- La licencia del repositorio es MIT, pero el modelo base no declara licencia propia en su página. Si se necesita una garantía estricta para uso comercial, conviene verificar con los autores originales, teniendo en cuenta que `facebook/bart-large-mnli` es MIT.
- El repositorio registra cero descargas y cero «likes», por lo que no cuenta con validación de la comunidad; el artefacto es reciente y su mantenimiento no está garantizado.
- El autor advierte que existe otro export de la misma familia mantenido por la comunidad, que puede ser preferible si se necesita el formato estándar o variantes cuantizadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/aivrar-code/distilbart-mnli-12-3-onnx
- Modelo base: https://huggingface.co/valhalla/distilbart-mnli-12-3
- Export alternativo de la comunidad: https://huggingface.co/onnx-community/distilbart-mnli-12-3-ONNX
- Modelo origen no destilado: https://huggingface.co/facebook/bart-large-mnli
- Dataset de ajuste: https://huggingface.co/datasets/nyu-mll/multi_nli
- Repositorio de la técnica de destilación: https://github.com/patil-suraj/distillbart-mnli
- Código de la aplicación que lo usa: https://github.com/aivrar/serp-to-prompt-writer
- Ficha de referencia del modelo base: https://www.toolify.ai/ai-model/valhalla-distilbart-mnli-12-3
- Ficha de referencia con términos de licencia: https://savrn.com/models/distilbart-mnli-12-3
