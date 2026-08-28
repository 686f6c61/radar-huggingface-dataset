# simpliTax/category-v10

## Resumen

El modelo `simpliTax/category-v10` es un clasificador de texto basado en BERT, desarrollado por el usuario simpliTax como una versión fine-tuned de `simpliTax/bert-automap-pbt-fine-tuned`. Está diseñado para tareas de clasificación de categorías, probablemente orientado a la categorización de transacciones financieras o documentos fiscales, dado el nombre del proyecto y el contexto de la organización. Con 109,95 millones de parámetros, corresponde a la arquitectura BERT-base, aunque no se especifica la longitud de contexto exacta en la información disponible.

El modelo se publica bajo licencia MIT y está disponible en formato safetensors. La model card es escasa: no se indica el dataset de entrenamiento, los idiomas soportados ni se proporcionan benchmarks comparativos. Los resultados de evaluación declarados por el autor muestran una precisión del 59,48% y un F1 macro de 0,1717, lo que sugiere un rendimiento limitado, posiblemente debido a un conjunto de datos pequeño o desbalanceado. A pesar de ello, puede servir como punto de partida para tareas específicas de categorización en dominios financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base) |
| Parametros totales | 109.953.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT, un transformer encoder-only con atención bidireccional, originalmente desarrollado por Google. `category-v10` es el resultado de un fine-tuning sobre el modelo `simpliTax/bert-automap-pbt-fine-tuned`, que a su vez es una versión ajustada de BERT. El entrenamiento se realizó con el framework Transformers, utilizando un optimizador AdamW con learning rate de 2e-05, batch size de 16, scheduler lineal y 3 épocas. No se especifica el dataset de entrenamiento ni el número de tokens utilizados.

Las métricas de evaluación reportadas en la model card son: pérdida de 1,9712, precisión de 0,5948, F1 macro de 0,1717 y F1 ponderado de 0,5197. Estos valores indican que el modelo tiene dificultades para clasificar correctamente todas las categorías, especialmente las menos representadas. No se mencionan técnicas avanzadas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Clasificación de texto multiclase: el modelo asigna una categoría a un texto de entrada, típico de tareas de etiquetado o categorización.
- Fine-tuning específico de dominio: al estar ajustado sobre un modelo base previamente entrenado en un dominio concreto (posiblemente fiscal o financiero), puede capturar matices de ese ámbito.
- Integración con pipelines de transformers: se puede usar directamente con la clase `pipeline` de Hugging Face para clasificación de texto.
- Compatibilidad con Text Embeddings Inference: el tag `text-embeddings-inference` sugiere que puede desplegarse con esta herramienta, aunque no se detalla su uso específico.
- No hay evidencia de soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Categorización automática de transacciones bancarias: el modelo puede clasificar descripciones de movimientos (por ejemplo, "pago en supermercado", "transferencia a nómina") en categorías predefinidas como alimentación, transporte o vivienda, facilitando la gestión de presupuestos personales.
- Clasificación de documentos fiscales: dado el contexto de SimpliTax, podría emplearse para etiquetar facturas o recibos según su tipo (gasto deducible, ingreso, etc.) en aplicaciones de contabilidad.
- Análisis de comentarios de clientes en banca: asignar categorías a opiniones o reclamaciones (quejas, sugerencias, consultas) para priorizar la atención al cliente.
- Organización de correos electrónicos financieros: clasificar mensajes en categorías como "facturas", "confirmaciones de pago" o "alertas de seguridad", útil en asistentes de productividad.
- Etiquetado de artículos de noticias económicas: categorizar titulares o resúmenes en secciones (mercados, impuestos, finanzas personales) para agregadores de contenido.
- Preprocesamiento de datos para análisis posterior: usar el modelo como primer filtro para segmentar grandes volúmenes de texto antes de aplicar técnicas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor en la model card, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Pérdida (validation loss) | 1,9712 |
| Precisión (accuracy) | 0,5948 |
| F1 macro | 0,1717 |
| F1 ponderado | 0,5197 |

Estos resultados provienen del proceso de entrenamiento y no se comparan con otros modelos. La precisión moderada y el F1 macro bajo sugieren que el modelo podría tener problemas con clases desbalanceadas o con la generalización a datos no vistos.

## Requisitos de hardware

- VRAM estimada: con 109,95 millones de parámetros, el modelo en FP32 ocupa aproximadamente 440 MB solo en pesos, más overhead de activaciones. En FP16 se reduce a unos 220 MB. Se puede ejecutar en GPUs con 4 GB de VRAM o más.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes para inferencia. También funciona en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con Hugging Face Inference Endpoints, Text Generation Inference (TGI) o mediante la librería `transformers` directamente. También es compatible con `text-embeddings-inference` según los tags, aunque no se detalla su uso.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo BERT-base, la latencia típica en GPU es de milisegundos por muestra, pero depende del hardware y del tamaño del lote.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Aunque existen otros BERT fine-tuned para clasificación de texto, no se han encontrado datos de rendimiento o especificaciones que permitan una comparación rigurosa. Por tanto, esta sección queda como no disponible.

## Limitaciones y advertencias

- Rendimiento limitado: la precisión de 0,5948 y el F1 macro de 0,1717 indican que el modelo no es muy fiable para clasificaciones precisas, especialmente en clases minoritarias. No se recomienda su uso en producción sin un fine-tuning adicional con datos más representativos.
- Falta de transparencia: no se especifica el dataset de entrenamiento, los idiomas soportados ni el número de categorías. Esto dificulta evaluar su aplicabilidad en otros dominios.
- Riesgo de alucinación y sesgos: al ser un modelo BERT, puede reflejar sesgos presentes en los datos de entrenamiento originales. No se han documentado sesgos específicos, pero es un riesgo inherente.
- Contexto limitado: aunque no se confirma, BERT-base suele tener una ventana de contexto de 512 tokens, lo que limita su uso en textos largos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento ni soporte técnico.
- Sin benchmarks externos: no hay validación independiente de las métricas reportadas, por lo que deben tomarse con cautela.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/simpliTax/category-v10)
- [Repositorio GitHub de SimpliTax](https://github.com/anand2398/SimpliTax)
- [Proyecto Actual AI (relacionado con categorización de transacciones)](https://github.com/sakowicz/actual-ai)
