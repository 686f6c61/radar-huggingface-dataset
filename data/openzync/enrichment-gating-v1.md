# OpenZync/enrichment-gating-v1

## Resumen

Enrichment Gating MiniLM-L6-v2 es un clasificador binario de texto publicado por OpenZync bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) del modelo `sentence-transformers/all-MiniLM-L6-v2` con una cabeza de clasificación de dos clases (`BertForSequenceClassification`), diseñado para responder a una única pregunta operativa: si un episodio ingerido en la memoria de la plataforma OpenZync contiene señal suficiente como para justificar el coste de enriquecimiento del grafo de conocimiento.

El modelo parte de la arquitectura MiniLM-L6-v2 (6 capas, dimensión oculta 384, vocabulario de 30.522 tokens y longitud máxima de 128 tokens) y cuenta con 22.713.986 parámetros totales, con un tamaño de repositorio de 0,2 GB. Se distribuye en formato safetensors y ONNX, y está pensado para integrarse en pipelines de ingesta como un filtro previo de bajo coste.

Su relevancia es fundamentalmente metodológica y de transparencia: el propio autor documenta que el modelo no supera la línea base trivial. Con AUC de 0,554 frente a una precisión de mayoría de 0,830, y con ECE de 0,258, la model card lo describe explícitamente como no listo para producción. Resulta útil como referencia de un pipeline de clasificación sintética reproducible y como ejemplo de evaluación honesta, no como componente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (MiniLM-L6-v2): 6 capas, hidden 384, cabeza de clasificación de 2 clases |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | No disponible (se distribuye fp32 y ONNX; no se documentan variantes GGUF ni cuantizaciones adicionales) |
| Idiomas soportados | No disponibles (el modelo base MiniLM es multilingüe limitado al inglés en su uso original; no se documenta en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (`model.onnx` + `model.onnx.data`, exportado vía optimum) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con la topología de MiniLM-L6-v2: 6 capas de atención, dimensión oculta de 384 y vocabulario de 30.522 tokens. Sobre el encoder se añade una cabeza de clasificación de secuencia de dos etiquetas, donde `LABEL_1` corresponde a `should_enrich`. La longitud máxima de secuencia es de 128 tokens.

El ajuste fino se realizó sobre el dataset `OpenZync/enrichment-gating-synthetic-100k`, compuesto por 100.000 episodios sintéticos generados para la tarea. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un clasificador de este tipo). El pipeline de entrenamiento es reproducible mediante los notebooks `build_master.ipynb`, `data_prep.ipynb`, `train_classifier.ipynb` y `eval.ipynb` del repositorio del proyecto. Se incluye una exportación ONNX con paridad verificada frente a fp32 (diferencia máxima absoluta de 1,45e-01 y delta de AUC de 2,58e-04).

## Capacidades

- Clasificación binaria de texto: predice `should_enrich` (LABEL_1) frente a la clase negativa.
- Puntuación de probabilidad vía softmax sobre los logits, apta para umbralización configurable.
- Inferencia en CPU y GPU mediante `transformers` y `optimum.onnxruntime`.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- Procesamiento de secuencias de hasta 128 tokens.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Filtro previo en pipelines de ingesta de memoria: el modelo se colocaría antes del enriquecimiento del grafo para descartar episodios de bajo valor. No obstante, dado que ningún umbral supera la línea base de enriquecer siempre, su uso real en este rol requeriría recalibración o reentrenamiento con etiquetas reales.
- Referencia reproducible para investigación en gating de costes: los notebooks y el dataset sintético permiten replicar el experimento completo y servir de punto de partida para trabajar con etiquetas reales y negativos más difíciles.
- Evaluación de calibración: con ECE de 0,258, el modelo es un caso de estudio útil para practicar técnicas de calibración (temperature scaling, isotonic regression) sobre clasificadores de bajo rendimiento.
- Integración en pipelines ONNX de baja latencia: al ser un modelo de 22,7 M de parámetros y 0,2 GB, puede desplegarse en entornos con recursos limitados mediante `optimum.onnxruntime`, útil para validar la infraestructura de inferencia antes de sustituir el modelo por uno con mejor rendimiento.
- Clasificación de episodios conversacionales cortos: con 128 tokens de contexto, encaja en la clasificación de turnos o fragmentos breves de diálogo, siempre que se acepte el bajo AUC documentado.
- Baseline en experimentos de selección de datos: sirve como punto de comparación para medir si modelos más grandes o con más datos superan de forma significativa la línea base de mayoría en la tarea de gating.

## Benchmarks y rendimiento

Evaluación en validación retenida (n=525) con umbral t=0,05:

| Metrica | Valor |
|---|---|
| AUC | 0,554 |
| Exactitud (accuracy) | 0,773 |
| Exactitud de la clase mayoritaria | 0,830 |
| ECE (error de calibración esperado) | 0,258 |
| tn / fp / fn / tp | 13 / 76 / 43 / 393 |

Barrido de umbrales en validación: la tasa de descarte (`skip_rate`) sube de 0,196 a 0,370 al pasar de t=0,05 a t=0,95, mientras que la precisión de descarte se mantiene en torno a 0,26–0,29 y el valor neto es negativo en todo el rango. Ningún umbral supera la línea base de enriquecer siempre en esta partición.

Paridad fp32 frente a ONNX: diferencia máxima absoluta de 1,45e-01 y delta de AUC de 2,58e-04.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 M de parámetros, aproximadamente 91 MB de pesos) más el overhead del runtime; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM; el modelo está sobredimensionado para hardware de gama alta y no aprovecha A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: `transformers` (pipeline de text-classification), `optimum.onnxruntime` con el `model.onnx` incluido, Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por tamaño, la inferencia en CPU es viable para volúmenes moderados y el ONNX reduce el coste por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| OpenZync/enrichment-gating-v1 | 22,7 M | 128 tokens | Clasificación binaria de gating | Apache 2.0 | AUC 0,554; por debajo de la línea base de mayoría (0,830) |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22,7 M | 256 tokens (uso típico) | Embeddings de frases | Apache 2.0 | No es un clasificador; requiere cabeza adicional |
| DistilBERT-base (clasificación) | 66 M | 512 tokens | Clasificación de texto general | Apache 2.0 | Depende del ajuste fino; no comparable directamente |
| Modelos de gating propietarios | No disponible | No disponible | Filtrado de ingesta | No disponible | No disponible |

No se dispone de datos públicos de benchmarks de alternativas directas de gating en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento insuficiente: AUC de 0,554 frente a una exactitud de mayoría de 0,830; el modelo no supera la línea base trivial en la partición de validación.
- Valor neto negativo: todos los umbrales evaluados producen un valor negativo frente a enriquecer siempre, por lo que no es apto como ahorrador de costes en producción.
- Calibración deficiente: ECE de 0,258, lo que invalida el uso directo de las probabilidades como umbral operativo sin recalibración.
- Datos sintéticos: los nombres y lugares del dataset de entrenamiento no reflejan usuarios reales, lo que limita la generalización.
- Sesgos conocidos: no documentados explícitamente, pero el entrenamiento con datos sintéticos puede introducir sesgos de distribución no medidos.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones falsas positivas y negativas (76 fp y 43 fn en la validación).
- Limitación de contexto: 128 tokens, insuficiente para episodios largos sin truncado.
- Idiomas: no se documenta soporte multilingüe; el modelo base está orientado al inglés.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte explícitamente que el modelo no está listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenZync/enrichment-gating-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenZync/enrichment-gating-synthetic-100k
- Documentación: https://docs.openzync.tech
- Repositorio core: https://github.com/openzync/openzync-core
- SDK de Python: https://github.com/openzync/openzync-python-sdk
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Contacto: mailto:rohnsha0@gmail.com
