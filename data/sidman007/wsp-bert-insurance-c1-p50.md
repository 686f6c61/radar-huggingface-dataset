# sidman007/wsp-bert-insurance-c1-p50

## Resumen

`wsp-bert-insurance-c1-p50` es un clasificador de frases del dominio de seguros derivado de `bert-base-uncased` mediante una técnica de edición de pesos en espacio de pesos (*weight-space programming*), sin descenso de gradiente. Lo desarrolla el usuario `sidman007` como prueba de concepto reproducible: un LLM editor decide qué capas del encoder y qué unidades feed-forward conservar, y los pesos restantes se reajustan en forma cerrada (regresión ridge) a partir de un número acotado de *forward passes* sobre el modelo original. El resultado es un `BertForSequenceClassification` de 55.954.696 parámetros, un 48,9 % menos que el modelo de partida (109.488.392).

El modelo resuelve clasificación monolingüe (inglés) de oraciones de pólizas en ocho etiquetas: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`. Su relevancia es metodológica más que de producto: demuestra que se puede comprimir un transformer afinado hasta la mitad de parámetros manteniendo precisión casi idéntica en un conjunto de test retenido (97,92 % de accuracy, macro-F1 0,9795), con un coste de 19,39 USD en API del editor y 47 *forward passes* utilizados de un presupuesto de 50.

La ficha debe leerse con cautela: el propio autor advierte de que el modelo no está calibrado, se evaluó sobre datos sintéticos y no está listo para producción. Es un artefacto de investigación reproducible (el checkpoint se reconstruye bit a bit desde `bert-base-uncased` más dos diferencias registradas) y no un clasificador de seguros desplegable tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (`BertForSequenceClassification`), 8 capas de encoder conservadas de 12, FFN de 1.024 |
| Parametros totales | 55.954.696 |
| Parametros activos | no disponible (no es MoE) |
| Parametros no de embedding | 32.117.512 |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base `bert-base-uncased`, limite habitual 512 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; admite cuantizacion estandar de transformers/BERT, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de 224 MB) |
| Etiquetas | 8 clases de clausulas de seguro |
| Capas de encoder conservadas (ids originales) | 8: [0, 1, 2, 3, 5, 7, 8, 11] |
| Tamano del repo | 0,2 GB |
| Modelo base | google-bert/bert-base-uncased |
| Reduccion frente a bert-base | 48,9 % (de 109.488.392 a 55.954.696 parametros) |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT podado estructuralmente: se conservan las capas originales 0, 1, 2, 3, 5, 7, 8 y 11, y en cada una se retienen las 1.024 unidades feed-forward de mayor energía de salida (frente a las 3.072 originales). Cada bloque estrechado se reajusta por regresión ridge para reproducir el siguiente estado oculto del modelo original, en orden ascendente, de modo que cada reajuste ve las capas ya podadas por debajo. Las capas 3 y 5 se reajustan para suplir las capas 4 y 6 eliminadas. La capa 11 se reconstruye como una capa de *mean pooling* cuyo bloque feed-forward es un clasificador de kernel sobre 1.008 oraciones ancla del conjunto de práctica etiquetado.

No hay entrenamiento en el sentido habitual: no hay retropropagación, ni optimizadores, ni datos adicionales. Cada ajuste es una solución en forma cerrada sobre activaciones devueltas por *forward passes*. El presupuesto fue de 50 *forward passes* (47 utilizados) y un gasto de 19,39 USD en la API del LLM editor. El checkpoint se reconstruye bit a bit desde `bert-base-uncased` más dos diferencias registradas (`edit_manifest.json`, `structure.json`, `param_count.json`), verificable con `scripts/compress/apply_edit.py --check` del repositorio fuente. El modelo de partida es `sidman007/wsp-bert-insurance-v1-p50` (98,31 % de accuracy en retenido, 109.488.392 parámetros).

## Capacidades

- Clasificación de texto monolingüe (inglés) en 8 categorías de cláusulas de seguros: cobertura, exclusión, prima, deducible/límites, procedimiento de siniestros, definiciones, cancelación/renovación y condiciones/deberes.
- Inferencia de una sola pasada (*single-label*, *argmax*) sobre una oración de entrada.
- Ejecución en CPU con latencia baja: 15,8 ms/oración con batch 1 y 5,8 ms con batch 32 (4 hilos), frente a 34,8 / 14,8 ms del modelo de partida.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- No es un modelo generativo: no produce texto libre, solo etiquetas y logits.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- **Etiquetado previo de cláusulas en pipelines de extracción documental**: clasificar oraciones de pólizas en las 8 categorías antes de un paso de extracción o resumen, con 5,8 ms/oración en batch 32 sobre CPU, lo que permite procesar lotes grandes sin GPU.
- **Enrutamiento de consultas internas**: dirigir fragmentos de texto de seguros al equipo o sistema correspondiente (siniestros, suscripción, definiciones) usando la etiqueta predicha como clave de enrutado.
- **Filtrado y control de calidad de corpus**: detectar y separar oraciones de exclusión o deducible en un corpus de pólizas para auditoría o revisión humana, aprovechando el bajo coste de inferencia.
- **Prototipado rápido en investigación de compresión**: servir como referencia reproducible para comparar técnicas de poda y edición de pesos frente a *fine-tuning* convencional, dado que el checkpoint se reconstruye bit a bit desde el modelo base.
- **Clasificación en dispositivos sin GPU**: el tamaño de 224 MB y la latencia en CPU permiten ejecutarlo en portátiles o contenedores modestos para demos y pruebas de concepto.
- **Generación de conjuntos de datos etiquetados sintéticos**: usar las predicciones como etiqueta débil sobre oraciones generadas para preentrenar o validar otros clasificadores del dominio.
- **Enseñanza de técnicas de edición de pesos**: ilustrar *weight-space programming* con un caso completo, con manifiesto de diferencias, estructura de poda y contabilidad de parámetros incluidos en el repositorio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy en test retenido | 97,92 % |
| Macro-F1 en test retenido | 0,9795 |
| Objetivo de accuracy | 97,8 % (cumplido por 0,12 puntos) |
| Accuracy del modelo de partida (`wsp-bert-insurance-v1-p50`) | 98,31 % |
| Estimacion cruzada del editor | 98,2-98,3 % |
| Tamano del conjunto de test retenido | 1.779 oraciones sinteticas, una semilla |
| Latencia CPU batch 1 (4 hilos) | 15,8 ms/oracion (modelo de partida: 34,8 ms) |
| Latencia CPU batch 32 (4 hilos) | 5,8 ms/oracion (modelo de partida: 14,8 ms) |
| Parametros | 55.954.696 (modelo de partida: 109.488.392) |
| Coste del editor (API) | 19,39 USD |
| Forward passes | 50 presupuestados, 47 usados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo es un clasificador de dominio y no aplica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,22 GB de pesos (224 MB de checkpoint), más activaciones; en fp16 unos 0,11 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de VRAM es suficiente (RTX 3060, RTX 4090, T4, A100, H100). En CPU funciona con 4 hilos a 15,8 ms/oración (batch 1).
- Cabe en GPU consumer: sí, en todas las actuales, y también en CPU y en dispositivos de borde con suficiente memoria.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportación a ONNX Runtime o TorchScript para CPU, y servidores de inferencia estándar compatibles con BERT (por ejemplo, Text Embeddings Inference o un servidor FastAPI propio). No se documenta soporte específico de vLLM, llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: 15,8 ms/oración en batch 1 y 5,8 ms/oración en batch 32 con 4 hilos de CPU, según el autor. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (test retenido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wsp-bert-insurance-c1-p50` (este) | 55.954.696 | no disponible | 97,92 % | apache-2.0 | HuggingFace, 0 descargas |
| `sidman007/wsp-bert-insurance-v1-p50` (modelo de partida) | 109.488.392 | no disponible | 98,31 % | no disponible en la informacion | HuggingFace |
| `google-bert/bert-base-uncased` (base sin afinar) | 109.488.392 | 512 tokens (habitual) | no disponible (no afinado para esta tarea) | apache-2.0 | HuggingFace, ampliamente usado |

No se dispone de datos de otros clasificadores de seguros comparables en la información proporcionada; la comparación se limita al linaje directo del modelo.

## Limitaciones y advertencias

- **Sin calibrar**: las probabilidades softmax son planas (logits en el conjunto de práctica entre -0,5 y 0,9); multiplicar los logits por una constante no cambia la predicción. Usar la etiqueta *argmax* y ajustar una temperatura sobre datos retenidos propios antes de interpretar los scores como confianzas.
- **Margen estrecho respecto al objetivo**: el umbral del 97,8 % se superó por 0,12 puntos en un único conjunto retenido de 1.779 oraciones sintéticas y una sola semilla; el propio editor estima que sus cifras son 0,3-1 punto optimistas. Tratar 97,9 % como estimación puntual, no como garantía.
- **Datos sintéticos**: las oraciones de práctica y test se generaron para el estudio en siete líneas de negocio y son en gran medida separables por vocabulario; la accuracy sobre documentos reales de seguros será menor.
- **Clasificador interpolante**: la capa final almacena 1.008 oraciones de práctica como anclas de kernel y puntúa el conjunto de práctica al 100 %; oraciones alejadas de la distribución de práctica pueden manejarse peor que con el modelo de partida.
- **No listo para producción**: el autor remite al README del proyecto y a `docs/executive-summary.md` para el trabajo pendiente de calibración, datos reales, robustez y gobernanza.
- **Idioma**: solo inglés; no se documenta soporte multilingüe.
- **Licencia**: apache-2.0, permite uso comercial, pero las advertencias anteriores desaconsejan su despliegue sin validación adicional.
- **Sesgos**: no se documentan sesgos específicos en la información proporcionada; al derivar de `bert-base-uncased` y de datos sintéticos, hereda los sesgos del corpus original y del generador de oraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidman007/wsp-bert-insurance-c1-p50
- Modelo de partida: https://huggingface.co/sidman007/wsp-bert-insurance-v1-p50
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio fuente, logs y protocolo: https://github.com/siddharth-ghatti/weight-space-programming-poc
- Resumen ejecutivo del proyecto: `docs/executive-summary.md` en el repositorio fuente
- Script de verificación del checkpoint: `scripts/compress/apply_edit.py --check` en el repositorio fuente
