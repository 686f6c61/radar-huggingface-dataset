# nguyenblog/results

## Resumen

`nguyenblog/results` es un modelo de clasificación de texto obtenido mediante fine-tuning de `vinai/phobert-base`, un encoder transformer basado en RoBERTa entrenado específicamente para vietnamita. Lo publica el usuario `nguyenblog` en Hugging Face y está pensado para una tarea de clasificación concreta que el autor no documenta: la model card indica explícitamente "unknown dataset" y deja sin cubrir las secciones de descripción, usos previstos y datos de entrenamiento.

El modelo cuenta con 135.000.579 parámetros en formato safetensors y un repositorio de 0,5 GB, lo que es coherente con un encoder base de arquitectura RoBERTa (12 capas, 768 dimensiones ocultas, vocabulario vietnamita ampliado). Se entrenó durante 3 épocas con AdamW fused, learning rate 2e-5, batch de 16 y precisión mixta nativa, alcanzando en el conjunto de evaluación una pérdida de 0,2438, una accuracy de 0,9463 y un F1 de 0,9425.

Su relevancia es limitada y muy acotada: es un artefacto de fine-tuning sin documentación, con cero descargas y cero likes en el momento de la consulta, y sin resultados declarados en el model-index. Resulta útil únicamente como referencia de un pipeline de entrenamiento sobre PhoBERT para clasificación en vietnamita, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base: `vinai/phobert-base`) |
| Parametros totales | 135.000.579 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (PhoBERT-base trabaja habitualmente con 256 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | no disponible en la model card; el modelo base PhoBERT está orientado a vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es PhoBERT-base, un encoder transformer de tipo RoBERTa adaptado al vietnamita mediante un tokenizador y un vocabulario específicos. Sobre esa base, `nguyenblog/results` añade una cabeza de clasificación de texto y se afina de extremo a extremo. El autor no especifica el número de etiquetas, la composición del dataset ni el dominio de la tarea.

El entrenamiento se realizó con los siguientes hiperparámetros declarados: 3 épocas, learning rate 2e-5, batch de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y precisión mixta nativa (AMP). El entrenamiento alcanzó 2145 pasos totales (715 por época). La evolución de métricas muestra mejora sostenida en accuracy y F1 hasta la época 3, mientras que la pérdida de validación repunta ligeramente en la última época (0,2294 en la época 2 frente a 0,2438 en la época 3), lo que sugiere un inicio de sobreajuste. No se documenta ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de texto por secuencia (pipeline `text-classification`), con una única etiqueta predicha por entrada y sus probabilidades asociadas.
- Fine-tuning sobre vietnamita heredado de PhoBERT: el tokenizador y el vocabulario del modelo base están adaptados a ese idioma.
- Extracción de representaciones contextuales del encoder, reutilizables para otras tareas de NLP mediante ajuste adicional.
- No soporta generación de texto: es un modelo encoder-only, sin decodificador.
- No dispone de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni flujos de agentes.
- No tiene modo thinking, visión, audio ni capacidades multimodales.
- El conjunto exacto de etiquetas de clasificación no está documentado, por lo que la capacidad práctica concreta es desconocida.

## Casos de uso

- Clasificación de documentos en vietnamita: dado que el modelo base es PhoBERT, puede emplearse para etiquetar textos cortos o medios en ese idioma, siempre que se conozca el esquema de etiquetas del fine-tuning original.
- Filtrado de contenido en pipelines de datos: integrado como paso de clasificación por lotes para descartar o etiquetar registros antes de un procesamiento posterior.
- Moderación o triaje de tickets: si el fine-tuning corresponde a categorías de atención al cliente, podría enrutar consultas a colas específicas, aunque el autor no lo confirma.
- Punto de partida para re-fine-tuning: al ser un encoder PhoBERT ya ajustado, sirve como inicialización para una tarea de clasificación propia con un dataset documentado.
- Evaluación comparativa de pipelines de entrenamiento: útil como referencia reproducible del efecto de hiperparámetros concretos (AdamW fused, AMP, 3 épocas) sobre PhoBERT.
- Experimentación académica con clasificadores vietnamitas de tamaño base: el modelo cabe en una GPU de consumo y permite iterar rápido en investigación.
- Extracción de embeddings para búsqueda semántica en vietnamita: usando la salida del encoder (pooled o mean pooling) como vector de representación, previa validación de calidad.

## Benchmarks y rendimiento

El model-index del autor no declara resultados (`results: []`). Los únicos datos disponibles son las métricas de validación reportadas en la model card:

| Metrica | Valor (conjunto de evaluacion) |
|---|---|
| Loss | 0,2438 |
| Accuracy | 0,9463 |
| F1 | 0,9425 |

Evolución durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 715 | 0,2467 | 0,9311 | 0,9285 |
| 2 | 1430 | 0,2294 | 0,9406 | 0,9386 |
| 3 | 2145 | 0,2438 | 0,9463 | 0,9425 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (135 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB para lotes pequeños.
- En fp16/bf16: alrededor de 0,27 GB de pesos, con un consumo total inferior a 1,5 GB en inferencia por lotes moderados.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo tendrían sentido para re-entrenamiento a gran escala.
- Despliegue compatible con transformers (pipeline nativo), así como con ONNX Runtime, TorchScript y, tras conversión, con soluciones de serving tipo TGI o vLLM (aunque vLLM está orientado a generación y no es la opción natural para un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada; en una GPU moderna se espera un throughput alto por el tamaño reducido del modelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguyenblog/results` | 135 M | no disponible | Clasificación de texto (fine-tune) | MIT | Hugging Face |
| `vinai/phobert-base` | ~135 M | 256 tokens (habitual) | Encoder base para vietnamita | MIT | Hugging Face |
| `FacebookAI/roberta-base` | ~125 M | 512 tokens | Encoder base multilingüe/inglés | MIT | Hugging Face |
| `google-bert/bert-base-multilingual-cased` | ~178 M | 512 tokens | Encoder base multilingüe | Apache 2.0 | Hugging Face |

La comparación con PhoBERT-base es la más directa: `nguyenblog/results` es un fine-tune del mismo, por lo que comparte arquitectura y tamaño, pero añade una cabeza de clasificación sin documentar. Frente a RoBERTa-base y BERT multilingüe, la diferencia clave es el dominio lingüístico: PhoBERT está especializado en vietnamita, mientras que los otros dos son genéricos. No hay datos de rendimiento comparables entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: se desconoce el dataset, las etiquetas, el dominio y los usos previstos; la model card está generada automáticamente y sin completar.
- Riesgo alto de uso indebido: sin conocer las etiquetas, no es posible saber qué predice el modelo ni validar su comportamiento en producción.
- Métricas de evaluación sin contexto: accuracy y F1 de 0,94 sobre un conjunto no descrito no permiten extrapolar rendimiento real; podría tratarse de una tarea trivial o de un dataset pequeño.
- Posible sobreajuste: la pérdida de validación empeora en la época 3 respecto a la 2, aunque accuracy y F1 siguen subiendo.
- Idiomas: la model card no declara idiomas; el modelo base es vietnamita, por lo que el rendimiento en castellano u otros idiomas es impredecible y probablemente deficiente.
- Longitud de contexto no declarada: PhoBERT-base suele limitarse a 256 tokens, lo que restringe textos largos.
- Licencia MIT: permite uso comercial y modificación, pero al derivar de PhoBERT-base conviene verificar que la licencia del modelo base sea compatible (PhoBERT se distribuye bajo MIT).
- Sin benchmarks estándar ni comparativas publicadas: no hay evidencia independiente de calidad.
- Cero adopción (0 descargas, 0 likes): no hay retroalimentación de la comunidad ni issues que documenten fallos.
- Alucinación: al ser un clasificador, no genera texto libre, pero puede producir etiquetas erróneas con alta confianza en entradas fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyenblog/results
- Modelo base PhoBERT: https://huggingface.co/vinai/phobert-base
- Repositorio oficial de PhoBERT (paper y código): https://github.com/VinAIResearch/PhoBERT
- Documentación de transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
