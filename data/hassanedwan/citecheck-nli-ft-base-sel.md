# hassanedwan/citecheck-nli-ft-base-sel

## Resumen

CiteCheck NLI verifier es un modelo de inferencia de lenguaje natural (NLI) basado en la arquitectura DeBERTa-v2 y ajustado por el usuario hassanedwan para la verificación de afirmaciones científicas (fact checking) sobre resúmenes biomédicos. El modelo toma como base un encoder DeBERTa-v2 y se ha afinado sobre el conjunto de datos SciFact, un corpus de verificación de hechos científicos publicado por AllenAI, restringido a resúmenes de ámbito biomédico. Con 184.424.451 parámetros, se trata de un modelo compacto orientado a clasificación, no a generación de texto.

Su relevancia radica en el uso concreto para el que fue entrenado: actuar como verificador NLI dentro de un pipeline de comprobación de citas denominado CiteCheck. Concretamente, se ha entrenado sobre las frases seleccionadas por el selector de CiteCheck, lo que sugiere que forma parte de un sistema mayor de verificación de afirmaciones contra evidencia documental. Es un proyecto de curso (UMD DATA/MSML 641), por lo que su alcance y validación son limitados y no está pensado como producto de producción.

El modelo se distribuye bajo licencia MIT en formato safetensors y su repositorio ocupa aproximadamente 0,7 GB. No se han publicado datos de idiomas soportados, contexto máximo ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2) |
| Parametros totales | 184.424.451 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DeBERTa-v2, un transformer encoder con atención desenredada (disentangled attention) y mecanismo de decodificación mejorado respecto a DeBERTa original. En este caso se emplea como base para una tarea de clasificación NLI de tres clases típica (entailment, neutral, contradiction), aunque la model card no detalla la cabeza de clasificación ni los hiperparámetros exactos. El tamaño de parámetros (184,4 millones) coincide con el de una variante base de DeBERTa-v2.

El ajuste fino se realizó sobre el split de entrenamiento de SciFact (licencia CC BY 4.0), excluyendo 200 afirmaciones que se reservaron para el ajuste de umbrales de decisión, según se indica en la model card (detalles en `train_log.json`). El dominio de entrenamiento se limita a resúmenes biomédicos, lo que acota fuertemente su aplicabilidad fuera de ese ámbito. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación NLI: determina la relación lógica entre una premisa y una hipótesis (implicación, neutralidad o contradicción).
- Verificación de afirmaciones científicas: evalúa si una afirmación biomédica está respaldada por la evidencia textual de un resumen.
- Comprobación de citas (citation checking): integrado en el pipeline CiteCheck como verificador de frases seleccionadas por el selector.
- Procesamiento de texto científico en inglés biomédico (dominio de entrenamiento).
- No es un modelo generativo: no produce texto libre, tool calling ni función de agente.
- No se documentan capacidades multimodales ni de audio.

## Casos de uso

- Verificación de afirmaciones en artículos científicos: dado un resumen y una frase que lo cita, el modelo clasifica si la frase está respaldada por el texto, útil en revisión sistemática de literatura.
- Detección de citas incorrectas en manuscritos: en un flujo editorial, comprobar automáticamente si una referencia usada en el texto contradice o no apoya la afirmación que la cita.
- Componente de verificación en pipelines RAG biomédicos: filtrar las respuestas generadas por un LLM comprobando que cada oración está respaldada por el fragmento recuperado.
- Moderación de contenido científico en foros o preprints: marcar afirmaciones que no cuentan con respaldo textual en la fuente citada.
- Indexación de evidencia en bases de datos biomédicas: etiquetar pares (afirmación, evidencia) para construir conjuntos de datos de entrenamiento posteriores.
- Evaluación de resúmenes automáticos en el ámbito sanitario: medir si un resumen generado contiene afirmaciones fieles al artículo original.
- Filtrado previo en motores de búsqueda académica: priorizar resultados que implican directamente la consulta formulada por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy reducida por el tamaño del modelo. En fp16 en torno a 0,4-0,5 GB de pesos; con activaciones y batch pequeño, típicamente menos de 2 GB en total.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es más que suficiente; también funciona en CPU para inferencia por lotes pequeños.
- Cabe holgadamente en GPU consumer: sí, cualquier GPU con 4 GB o más de VRAM puede ejecutarlo, e incluso en CPU con un throughput aceptable para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers (AutoModelForSequenceClassification), ONNX Runtime, exportación a TorchScript o a formato GGUF mediante conversión. No se han confirmado integraciones específicas con vLLM, TGI o llama.cpp para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo ni de sus alternativas directas en la información proporcionada, por lo que la comparación cuantitativa no es posible. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hassanedwan/citecheck-nli-ft-base-sel | 184,4 M | no disponible | MIT | Hugging Face |
| DeBERTa-v2 base (microsoft/deberta-v2-base) | ~184 M | 512 tokens (arquitectura base) | MIT | Hugging Face |
| Otros verificadores SciFact publicados | no disponible | no disponible | variable | Hugging Face y GitHub |

## Limitaciones y advertencias

- Sesgo de dominio: entrenado exclusivamente con resúmenes biomédicos; su rendimiento fuera de ese ámbito no está caracterizado y probablemente sea deficiente.
- Riesgo de error en umbrales: el propio autor reserva 200 afirmaciones para ajuste de umbral, lo que indica sensibilidad al punto de corte de decisión; sin los valores concretos, la calibración en producción queda indefinida.
- Idiomas: no se documentan idiomas soportados; al entrenarse sobre SciFact (inglés), es previsible que solo funcione razonablemente en inglés.
- Alucinación no aplica como tal (no genera texto), pero puede producir falsos positivos o falsos negativos en la clasificación NLI, especialmente ante afirmaciones ambiguas o evidencia parcial.
- Naturaleza de proyecto de curso (UMD DATA/MSML 641): sin proceso de revisión por pares ni validación externa documentada; 0 descargas y 0 likes en el momento de la consulta.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la licencia de SciFact (CC BY 4.0) para la redistribución de datos derivados.
- No se documentan métricas de evaluación ni conjuntos de validación/test más allá del split reservado para umbrales.

## Enlaces

- Hugging Face: https://huggingface.co/hassanedwan/citecheck-nli-ft-base-sel
- Conjunto de datos SciFact (AllenAI): https://huggingface.co/datasets/allenai/scifact
- Arquitectura DeBERTa-v2 (referencia de la base): no disponible en la información proporcionada.
