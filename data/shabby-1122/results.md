# Shabby-1122/results

## Resumen

`Shabby-1122/results` es un modelo de clasificación de texto obtenido mediante ajuste fino (*fine-tuning*) de `distilbert/distilbert-base-uncased`, la variante destilada de BERT desarrollada por Hugging Face. El autor del ajuste es el usuario Shabby-1122 y el modelo se publica bajo licencia Apache 2.0. Se trata de un artefacto de entrenamiento con documentación mínima: la model card fue generada automáticamente por el `Trainer` de Transformers y no especifica el conjunto de datos, la tarea concreta ni las etiquetas del clasificador.

Con 66.955.010 parámetros (aproximadamente 67 millones) y un tamaño de repositorio de 0,3 GB en formato safetensors, el modelo se sitúa en la categoría de clasificadores ligeros aptos para inferencia en CPU y GPU de consumo. Su relevancia es limitada fuera del contexto del proyecto original: al no documentarse el dataset ni el espacio de etiquetas, no es posible reutilizarlo de forma fiable en producción sin una inspección previa de su configuración (`id2label`).

La arquitectura subyacente es un transformer encoder de 6 capas con 66 millones de parámetros, destilado de BERT-base, con una longitud de contexto típica de 512 tokens. El modelo declara una precisión de 0,8718 en el conjunto de evaluación, aunque sin información sobre la naturaleza de dicha evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (DistilBERT-base soporta 512 tokens por arquitectura) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es `uncased` en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento desde BERT-base (12 capas, 110 millones de parámetros). DistilBERT reduce el tamaño aproximadamente un 40 % manteniendo en torno al 97 % del rendimiento de BERT en tareas de comprensión del lenguaje, según los datos publicados por sus autores. La variante `uncased` normaliza el texto a minúsculas y elimina los acentos, y está entrenada principalmente en inglés.

El ajuste fino se realizó con el `Trainer` de Transformers durante 4 épocas, con un *learning rate* de 2e-05, un *batch size* de 32 (entrenamiento y evaluación), semilla 42, optimizador AdamW (`ADAMW_TORCH_FUSED`) y planificador lineal. El conjunto de datos de entrenamiento no se especifica ("unknown dataset" en la model card). La pérdida de entrenamiento desciende de 0,7031 a 0,2256, mientras que la pérdida de validación toca mínimo en la primera época (0,6319) y asciende hasta 0,8442 en la cuarta, lo que sugiere cierto sobreajuste al final del entrenamiento. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Clasificación de texto: el modelo devuelve una distribución de probabilidad sobre las etiquetas definidas en su configuración, aunque dichas etiquetas no están documentadas en la model card.
- Inferencia sobre secuencias cortas: hereda del modelo base una ventana de 512 tokens, adecuada para frases, párrafos y documentos breves.
- Ejecución ligera: 67 millones de parámetros permiten inferencia en CPU con latencias bajas y en GPU de gama baja.
- Compatibilidad con el ecosistema Transformers: pipeline `text-classification`, carga mediante `AutoModelForSequenceClassification`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no disponibles; el modelo base está entrenado principalmente en inglés y aplica normalización `uncased`.

## Casos de uso

- Clasificación de tickets de soporte: si el espacio de etiquetas del modelo coincide con categorías de incidencias, puede integrarse en un pipeline de enrutamiento automático con latencia de milisegundos en CPU. Requiere verificar previamente el mapeo `id2label`.
- Moderación de contenido en inglés: como clasificador binario o multiclase de textos cortos, encaja en un filtro previo a un modelo generativo de mayor tamaño, reduciendo coste computacional.
- Análisis de sentimiento en reseñas: con la ventana de 512 tokens del modelo base, puede procesar reseñas individuales y agregarse por producto o campaña.
- Etiquetado de datos a escala: útil como anotador automático para pre-etiquetar corpus y reducir el esfuerzo de revisión humana, siempre que se valide la calidad de las predicciones.
- Detección de spam o duplicados: la baja huella de memoria (0,3 GB en FP32) permite desplegarlo en contenedores pequeños o funciones serverless.
- Prototipado rápido de clasificadores: sirve como línea base para comparar contra modelos más grandes antes de invertir en entrenamientos costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,8442 |
| Accuracy (evaluacion final) | 0,8718 |

Evolución por época según la model card:

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 625 | 0,7031 | 0,6319 | 0,8642 |
| 2.0 | 1250 | 0,5543 | 0,6614 | 0,8576 |
| 3.0 | 1875 | 0,3422 | 0,6929 | 0,8780 |
| 4.0 | 2500 | 0,2256 | 0,8442 | 0,8718 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la información disponible. El `model-index` del autor está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 (67 M de parámetros × 4 bytes), en torno a 0,15 GB en FP16 y menos de 0,1 GB en cuantización INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es más que suficiente. También funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 2050 y portátiles con gráfica integrada reciente.
- Opciones de despliegue: `transformers` (pipeline nativo), ONNX Runtime, TorchScript, `optimum` para exportación, y servidores de inferencia ligeros. No es un modelo generativo, por lo que vLLM o TGI no son la vía natural.
- Latencia y throughput: no disponibles en la información proporcionada; para un DistilBERT de este tamaño se esperan latencias de un dígito de milisegundos por lote en GPU y decenas de milisegundos en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shabby-1122/results | 66,9 M | no disponible (512 por arquitectura) | Apache 2.0 | Hugging Face | Fine-tune sin dataset documentado |
| distilbert-base-uncased | 66,9 M | 512 | Apache 2.0 | Hugging Face | Modelo base; clasificador no ajustado a tarea concreta |
| bert-base-uncased | 110 M | 512 | Apache 2.0 | Hugging Face | Mayor capacidad, mayor coste de inferencia |
| roberta-base | 125 M | 512 | MIT | Hugging Face | Alternativa robusta para clasificación en inglés |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el conjunto de datos de entrenamiento, el espacio de etiquetas ni la tarea objetivo, lo que impide evaluar su validez fuera del proyecto original.
- El sobreajuste es visible: la pérdida de validación aumenta de 0,6319 (época 1) a 0,8442 (época 4) mientras la de entrenamiento cae a 0,2256.
- El modelo base está entrenado principalmente en inglés y aplica normalización `uncased`; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de predicciones erróneas o mal calibradas si las etiquetas no coinciden con el dominio de uso.
- Sesgos heredados de `distilbert-base-uncased`: el corpus de entrenamiento original (Wikipedia y BookCorpus en inglés) puede introducir sesgos demográficos y culturales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de integrarlo en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que refleja una validación comunitaria prácticamente nula.
- No se han publicado métricas de robustez, calibración ni evaluación por subgrupos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shabby-1122/results
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT (paper original): https://arxiv.org/abs/1910.01108
- Documentación de Transformers: https://huggingface.co/docs/transformers
