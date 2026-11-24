# DataDrivenAlex/invoice-fields-ner-bert-tiny-lora

## Resumen

Invoice Fields NER — BERT Tiny LoRA es un adaptador de clasificación de tokens (token classification) publicado por DataDrivenAlex para extraer cinco campos estructurados de fragmentos cortos de texto en inglés con formato de factura: proveedor (vendor), identificador de factura (invoice ID), fecha de emisión (issue date), importe total (total) y divisa (currency). Se construye como un adaptador LoRA sobre el modelo base `google/bert_uncased_L-2_H-128_A-2`, un transformer encoder de tipo BERT en su variante "tiny" (2 capas, dimensión oculta 128, 2 cabezas de atención), lo que lo convierte en un artefacto extremadamente ligero pensado para ejecución en CPU.

El modelo no es un sistema de extracción de facturas en producción: el propio autor lo describe como un benchmark experimental de portfolio, entrenado exclusivamente sobre ejemplos ficticios generados sintéticamente con plantillas y sin OCR ni parsing a nivel de página. Su relevancia actual es la de un caso de estudio reproducible de fine-tuning con PEFT sobre modelos mínimos, útil para entender el comportamiento de adaptadores LoRA de bajo rango en tareas de NER y para calibrar expectativas sobre la calidad de datos sintéticos.

La ventana de contexto efectiva es muy reducida (máximo 126 tokens WordPiece, 128 contando tokens especiales), el soporte es solo inglés y el repositorio no contiene los pesos del modelo base, por lo que la carga requiere descargar la revisión fijada de `google/bert_uncased_L-2_H-128_A-2`. La licencia es Apache-2.0 tanto para el adaptador como para el dataset sintético incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (variante tiny: L=2, H=128, A=2) con adaptador LoRA en proyecciones query/value |
| Parametros totales | 4.380.438 (modelo con adaptador y clasificador); 9.611 entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (126 WordPiece útiles + tokens especiales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es `google/bert_uncased_L-2_H-128_A-2`, un BERT uncased de 2 capas, dimensión oculta 128 y 2 cabezas de atención, fijado a la revisión `30b0a37ccaaa32f332884b96992754e246e48c5f`. Sobre él se aplica un adaptador LoRA de rango 8, alpha 16 y dropout 0,05 en las proyecciones query y value, junto con un clasificador de token classification entrenable que se guarda junto al adaptador. El total de parámetros entrenables es de 9.611 sobre 4.380.438. La tarea se formula como token classification con etiquetas BIO internas para las cinco entidades (`VENDOR`, `INVOICE_ID`, `ISSUE_DATE`, `TOTAL`, `CURRENCY`).

El entrenamiento se realizó sobre 1.200 ejemplos generados sintéticamente (1.000 facturas y 200 negativos de tipo no-factura, presupuesto u orden), con validación de 160 documentos (133 facturas, 27 negativos) y test de 240 (200 facturas, 40 negativos). El checkpoint seleccionado fue la época 10 de 12 según la validación. Los datos se generan con `make_data.py` con semillas fijas y se publican como artefacto de dataset bajo Apache-2.0. No se documenta uso de RLHF, DPO ni decodificación especulativa; la innovación técnica se limita al uso de LoRA de bajo rango sobre un encoder mínimo para minimizar el coste de entrenamiento e inferencia.

## Capacidades

- Extracción de entidades nombradas (NER) de cinco campos concretos en texto corto de facturas: proveedor, identificador de factura, fecha de emisión, importe total y divisa.
- Clasificación de tokens con etiquetas BIO y devolución de spans con offsets de caracteres (el script `infer.py` devuelve los spans y sus posiciones, sin normalizar ni calcular valores).
- Discriminación de negativos: el entrenamiento incluye 200 ejemplos no-factura (presupuestos, órdenes) para que el modelo pueda no emitir entidades en textos que no son facturas.
- Ejecución en CPU: el tamaño del modelo base y del adaptador permite inferencia sin GPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe: únicamente inglés; no se ha entrenado ni evaluado en otros idiomas.
- No incluye OCR ni parsing de documentos a nivel de página o de imagen.

## Casos de uso

- Prototipado de pipelines de extracción de campos: usar el adaptador como primer eslabón para validar el formato de salida (spans con offsets) antes de invertir en un modelo mayor o en un servicio de extracción comercial.
- Docencia y experimentación con PEFT: el repositorio incluye `train.py` y `make_data.py`, lo que permite reproducir el fine-tuning LoRA de principio a fin y estudiar el efecto del rango y del tamaño del modelo base en una tarea NER concreta.
- Benchmark de calidad de datos sintéticos: comparar las métricas por campo (por ejemplo, F1 0,494 en fecha de emisión frente a 0,910 en identificador de factura) para diagnosticar qué plantillas de generación producen entidades más difíciles de aprender.
- Clasificación rápida en entornos con recursos mínimos: al ejecutarse en CPU y con 128 tokens de contexto, puede integrarse en un servicio ligero que procese líneas o bloques cortos de texto ya extraídos por otro sistema.
- Filtro previo de negativos: usar la capacidad de no emitir entidades en presupuestos u órdenes para descartar textos que no son facturas antes de pasarlos a un extractor más costoso.
- Evaluación comparativa de encoders tiny: servir como línea base de referencia frente a modelos BERT base o RoBERTa en la misma tarea, para justificar o descartar el uso de modelos mínimos en producción.

## Benchmarks y rendimiento

Evaluación sobre 240 documentos sintéticos de test con layouts no vistos en entrenamiento ni validación (200 facturas, 40 negativos). Métricas de span exacto y tipo de entidad correctos.

| Campo | Precision | Recall | F1 (span exacto) |
|---|---:|---:|---:|
| Vendor | 0,780 | 0,905 | 0,838 |
| Invoice ID | 0,906 | 0,915 | 0,910 |
| Issue date | 0,443 | 0,560 | 0,494 |
| Total | 0,390 | 0,645 | 0,486 |
| Currency | 0,800 | 1,000 | 0,889 |

| Métrica global | Valor |
|---|---:|
| Micro precision (span) | 0,635 |
| Micro recall (span) | 0,805 |
| Micro F1 (span) | 0,710 |
| Coincidencia exacta de todos los campos por documento | 81/240 (33,8 %) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo base tiny más el adaptador; no se dispone de estimaciones publicadas para cuantizaciones.
- GPU recomendadas: no es necesario GPU; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) puede ejecutarlo, pero el cuello de botella no será el cómputo.
- Cabe en cualquier GPU consumer y en CPU; el autor indica que se instale una build de PyTorch para CPU.
- Opciones de despliegue: el repositorio proporciona `infer.py` con carga del adaptador desde el Hub o local (`--adapter .`); al ser un modelo PEFT, puede cargarse con las utilidades estándar de `peft` y `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. A continuación se comparan únicamente características estructurales conocidas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| DataDrivenAlex/invoice-fields-ner-bert-tiny-lora | 4.380.438 (9.611 entrenables) | 128 tokens | en | apache-2.0 | safetensors (LoRA) |
| google/bert_uncased_L-2_H-128_A-2 (base) | no disponible en la información | no disponible | en | no disponible en la información | safetensors |
| Alternativas NER de mayor tamaño (BERT base, RoBERTa) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de aprendizaje y demostración, no un servicio de extracción en producción; el autor lo declara explícitamente.
- Entrenado solo con ejemplos sintéticos y plantillados; no se ha evaluado con facturas reales, escaneos, OCR, tablas, documentos multilingües ni documentos largos.
- Errores sustanciales en fecha de emisión (F1 0,494) e importe total (F1 0,486); la precisión en total es especialmente baja (0,390).
- Solo coincidencia exacta de todos los campos en el 33,8 % de los documentos de test.
- No normaliza ni calcula valores: devuelve spans y offsets; la interpretación semántica (por ejemplo, distinguir IVA de total) queda fuera del modelo.
- No distingue impuestos, IVA ni totales ambiguos; no hay parsing a nivel de página.
- Riesgo de falsos positivos y campos omitidos, reconocido por el autor.
- Sesgos conocidos: no documentados en la información disponible; al ser datos sintéticos, los sesgos reflejan las plantillas de generación.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de extracción incorrecta de spans.
- Restricciones de licencia: Apache-2.0 permite uso comercial del adaptador y del dataset, pero los pesos del modelo base no se incluyen y deben regirse por los términos de `google/bert_uncased_L-2_H-128_A-2`.
- No debe usarse para aprobar pagos, tomar decisiones contables o fiscales ni procesar documentos personales o financieros reales sin un sistema independientemente validado, seguro en privacidad y con revisión humana.
- La reproducibilidad puede variar según versiones de PyTorch y plataforma; no hay reclamación de replicación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DataDrivenAlex/invoice-fields-ner-bert-tiny-lora
- Modelo base: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
- Revisión fijada del modelo base: `30b0a37ccaaa32f332884b96992754e246e48c5f`
- Dataset sintético companion: incluido como artefacto de dataset en el repositorio del autor (Apache-2.0); no se proporciona URL directa en la información disponible.
- Scripts del proyecto: `infer.py`, `train.py`, `make_data.py` y carpeta `examples/` (referenciados en la model card; no se proporcionan URLs directas).
- Resultados de evaluación: `model/evaluation.json` y `model/test_predictions.jsonl` (referenciados en la model card).
