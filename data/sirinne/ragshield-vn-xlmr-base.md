# Sirinne/ragshield-vn-xlmr-base

## Resumen

`Sirinne/ragshield-vn-xlmr-base` es un modelo de clasificación de texto publicado en Hugging Face por el usuario Sirinne. Se trata de un fine-tuning sobre la arquitectura XLM-RoBERTa base, un transformer encoder multilingüe presentado originalmente en el paper arXiv:1910.09700 (Unsupervised Cross-lingual Representation Learning at Scale). El nombre del repositorio sugiere un uso orientado a "ragshield" (posiblemente filtrado o protección en pipelines RAG) y a un dominio "vn" (probablemente vietnamita), aunque la model card no confirma ninguno de estos extremos.

El modelo cuenta con 278.045.186 parámetros según los pesos en safetensors, lo que encaja con la configuración estándar de XLM-RoBERTa base (278M parámetros, 12 capas, dimensión oculta 768, 12 cabezas de atención). Está etiquetado para la tarea `text-classification` y es compatible con `text-embeddings-inference` y `endpoints_compatible`, lo que facilita su despliegue en infraestructura de Hugging Face.

La relevancia de esta ficha es limitada por la escasez de información: la model card es la plantilla autogenerada por Hugging Face y no aporta detalles sobre datos de entrenamiento, etiquetas, rendimiento ni licencia. Cualquier evaluación rigurosa requiere inspeccionar los pesos y el tokenizer directamente, o contactar con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (transformer encoder) |
| Parametros totales | 278.045.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base admite hasta 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a int8/fp16 posible vía herramientas estándar) |
| Idiomas soportados | no disponible (XLM-RoBERTa base es multilingüe con 100 idiomas, no confirmado para este fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa base, un transformer encoder de 12 capas con 768 dimensiones ocultas, 12 cabezas de atención y 278M parámetros. XLM-RoBERTa se preentrenó con enmascaramiento de tokens (masked language modeling) sobre corpus multilingües de CommonCrawl (100 idiomas), y su paper de referencia es arXiv:1910.09700. El modelo aquí publicado es un fine-tuning de esa base para clasificación de texto, con una cabeza de clasificación superpuesta.

No hay información disponible sobre el dataset de fine-tuning, el número de etiquetas, la composición de los datos, el régimen de entrenamiento (fp32, fp16, bf16), la duración, el hardware empleado ni si se aplicaron técnicas como RLHF o DPO (poco habituales en clasificadores encoder). Tampoco se documentan innovaciones técnicas específicas. La model card es la plantilla automática de Hugging Face y no contiene ninguna sección cumplimentada.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo emite etiquetas (probablemente con una cabeza lineal sobre el token `[CLS]`), aunque el conjunto de etiquetas no está documentado.
- Codificación de texto multilingüe: hereda el tokenizer y el vocabulario de XLM-RoBERTa base (SentencePiece, ~250k tokens), lo que en principio permite procesar texto en decenas de idiomas.
- Extracción de representaciones: al ser un encoder, puede usarse para obtener embeddings de frases o documentos, aunque no está optimizado ni validado para ello.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible; es un encoder discriminativo, no un modelo generativo.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con `text-embeddings-inference` y `endpoints_compatible`: permite desplegarlo como endpoint gestionado en Hugging Face.

## Casos de uso

- Filtrado en pipelines RAG: dado el nombre "ragshield", el modelo podría emplearse para clasificar fragmentos recuperados como relevantes o irrelevantes antes de pasarlos al generador, reduciendo ruido y alucinaciones. Requiere validar empíricamente las etiquetas reales del modelo.
- Moderación o detección de contenido: un clasificador XLM-RoBERTa base es adecuado para tareas de moderación multilingüe con baja latencia (inferencia en milisegundos por muestra en GPU moderna), aunque las clases concretas no están documentadas.
- Clasificación de intenciones en asistentes conversacionales: el encoder puede etiquetar la intención del usuario en un turno de diálogo; su tamaño (278M) permite desplegarlo en CPU con cuantización int8 para tráfico moderado.
- Enrutamiento de consultas: en un sistema multi-modelo, el clasificador puede decidir a qué submodelo o herramienta derivar cada petición según su categoría.
- Análisis de sentimiento o tópicos en dominio vietnamita: si el sufijo "vn" indica entrenamiento en vietnamita, sería útil para monitorización de redes sociales o reseñas en ese idioma; sin confirmación del autor, debe validarse con un conjunto propio.
- Detección de prompt injection o entradas anómalas: un clasificador binario/multiclase sobre texto de entrada puede servir como primera barrera en un gateway de LLM, complementando reglas heurísticas.
- Etiquetado a gran escala de corpus: para anotar millones de documentos con bajo coste computacional, aprovechando que el modelo cabe en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~1,1 GB solo de pesos, más activaciones y overhead; en la práctica ~2 GB.
- VRAM estimada en fp16/bf16: ~0,6 GB de pesos; ~1,5 GB con overhead.
- VRAM estimada en int8: ~0,3 GB de pesos; puede ejecutarse en CPU con latencias de decenas de milisegundos por muestra.
- GPU recomendadas: cualquier GPU con ≥4 GB (RTX 3060, RTX 4060, T4, L4) es suficiente; para alto throughput, A10G, L4 o A100.
- Cabe en GPU consumer: sí, en cualquier RTX moderna e incluso en iGPU con cuantización.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (soporte declarado), Hugging Face Inference Endpoints (`endpoints_compatible`), ONNX Runtime y `optimum` para exportación; `llama.cpp` y Ollama no aplican (no es un modelo generativo).
- Latencia y throughput: no disponibles; para un encoder de 278M en una T4 se puede esperar del orden de 1-5 ms por muestra con batch pequeño, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sirinne/ragshield-vn-xlmr-base | 278M | no disponible (base: 512) | text-classification | no disponible | Hugging Face |
| FacebookAI/xlm-roberta-base | 278M | 512 | MLM / feature extraction | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 560M | 512 | MLM / feature extraction | MIT | Hugging Face |
| distilbert-base-multilingual-cased | 135M | 512 | MLM / clasificación | Apache 2.0 | Hugging Face |

La comparación directa con el XLM-RoBERTa base original es la más informativa: comparten arquitectura y tamaño, pero el modelo de Sirinne incorpora una cabeza de clasificación fine-tuneada cuyas etiquetas y rendimiento se desconocen. Frente a `distilbert-base-multilingual-cased`, este modelo es el doble de grande pero cubre más idiomas y suele rendir mejor en tareas multilingües de clasificación. La licencia del modelo de Sirinne no está declarada, lo que impide confirmar si permite uso comercial.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, etiquetas, métricas ni uso previsto; no debe asumirse ningún comportamiento sin validación empírica.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución; contactar con el autor antes de integrarlo en producción.
- Idiomas no confirmados: aunque XLM-RoBERTa base es multilingüe, el fine-tuning podría estar restringido a un dominio o idioma concreto (posiblemente vietnamita, por el sufijo "vn"), degradando el rendimiento en otros.
- Sesgos: al derivar de CommonCrawl, hereda sesgos de género, etnia y geografía presentes en el corpus; el fine-tuning puede amplificarlos según los datos usados.
- Alucinación: no aplica en sentido generativo, pero un clasificador puede producir etiquetas erróneas con alta confianza en entradas fuera de distribución.
- Contexto limitado: si mantiene la configuración base, 512 tokens; documentos más largos requieren truncado o chunking.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni validación externa.
- Fecha de creación futura (2026-11-22) en los metadatos: inconsistencia que sugiere que el repositorio podría ser de prueba o generado automáticamente; verificar la integridad antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/Sirinne/ragshield-vn-xlmr-base
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1910.09700
- Paper de XLM-RoBERTa en ACL Anthology: https://aclanthology.org/2020.acl-main.747/
- Repositorio oficial de XLM-RoBERTa (fairseq): https://github.com/facebookresearch/fairseq/tree/main/examples/xlmr
- Documentación de XLM-RoBERTa en transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Calculadora de impacto medioambiental (citada en la model card): https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre emisiones: https://arxiv.org/abs/1910.09700
