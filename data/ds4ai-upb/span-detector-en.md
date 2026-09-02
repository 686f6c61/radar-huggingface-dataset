# DS4AI-UPB/span-detector-en

## Resumen

El modelo `DS4AI-UPB/span-detector-en` es un clasificador de tokens basado en `FacebookAI/xlm-roberta-large` (560M parámetros) desarrollado por el laboratorio DS4AI-UPB (Distributed Systems for Artificial Intelligence Laboratory) de la Universidad Politécnica de Bucarest. Su función es detectar los dos spans de entidad (`e1` y `e2`) en oraciones en inglés, utilizando un esquema de etiquetado BIO de cinco etiquetas (`O`, `B-E1`, `I-E1`, `B-E2`, `I-E2`). Es la primera etapa de un pipeline de extracción de relaciones end-to-end: los spans predichos se envuelven en marcadores de entidad y se pasan al clasificador de relaciones `DS4AI-UPB/xlmr-large-ro-re`.

El modelo está específicamente entrenado para el dataset SemEval-2010 Task 8, cuyas entidades son nominales comunes (no entidades nombradas), por lo que un NER genérico no transfiere bien a esta tarea. El detector se entrena directamente sobre los spans de la propia tarea. Con un span F1 de 0.847 en la partición de validación, ofrece una solución ligera y rápida (entrenamiento de ~6 minutos en una A100) para el preprocesamiento en sistemas de extracción de relaciones. Su relevancia radica en ser un componente reutilizable y de código abierto para pipelines de RE en inglés, con potencial de adaptación a otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) |
| Parametros totales | 558.845.957 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredado de XLM-RoBERTa-large) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizable con herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (segun YAML) / CC BY-NC-SA 4.0 (segun badge de la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `FacebookAI/xlm-roberta-large`, un transformer encoder de 560M parámetros con 24 capas, 16 cabezas de atención y embeddings de 1024 dimensiones. La cabeza de clasificación es una capa lineal sobre las representaciones de cada token, con 5 etiquetas BIO para marcar los spans de las entidades `e1` y `e2`. No emplea mecanismos de atención lineal ni decodificación especulativa; es una arquitectura estándar de token classification.

El entrenamiento se realizó sobre el dataset SemEval-2010 Task 8 (oraciones en inglés con anotaciones de entidades y relaciones). Se usaron 5 épocas, batch size 16, learning rate 2e-5, 10% de warmup y weight decay 0.01. El mejor checkpoint se seleccionó por span F1 sobre una partición de validación del 10%. El entrenamiento se ejecutó en una única NVIDIA A100 40GB y tardó aproximadamente 6 minutos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un fine-tuning supervisado clásico.

## Capacidades

- Detección de spans de entidades `e1` y `e2` en oraciones en inglés, usando un esquema BIO de 5 etiquetas.
- Clasificación de tokens a nivel de token (token classification), no generación de texto.
- Integración como primera etapa de un pipeline de extracción de relaciones end-to-end (los spans se envuelven en marcadores y se pasan al clasificador de relaciones).
- Entrenado específicamente para entidades nominales comunes del dataset SemEval-2010 Task 8, no para entidades nombradas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada: aunque el modelo base XLM-RoBERTa es multilingüe, este fine-tuning solo se ha entrenado y evaluado en inglés.

## Casos de uso

- Extracción de relaciones en textos biomédicos o científicos: el modelo puede identificar los dos participantes de una relación (por ejemplo, proteína-gen) en una oración, preparando la entrada para un clasificador de relaciones.
- Preprocesamiento en pipelines de información extracción (IE): como componente de detección de argumentos en sistemas de relación, reemplazando NER genéricos que fallan con nominales comunes.
- Construcción de bases de conocimiento: al extraer pares de entidades de documentos, el detector de spans permite poblar grafos de conocimiento con relaciones candidatas.
- Análisis de literatura científica: para identificar entidades en abstracts y alimentar sistemas de búsqueda semántica o resumen estructurado.
- Evaluación de modelos de extracción de relaciones: como baseline de detección de spans para comparar con enfoques más complejos (LLMs, etc.).
- Adaptación a otros idiomas: al ser un modelo de código abierto, puede fine-tuning en otros idiomas usando el mismo esquema de etiquetado, aprovechando la base multilingüe de XLM-RoBERTa.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en la partición de validación (held-out):

| Metrica | Valor |
|---|---|
| Span F1-Score | 0.847 |
| Precision | 0.83 |
| Recall | 0.87 |

No se han publicado resultados comparativos con otros modelos en la información disponible. No hay datos de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 558M parámetros. En FP32 ocupa ~2.2 GB, en FP16 ~1.1 GB. Con overhead de activaciones y tokenizer, se recomienda al menos 4 GB de VRAM para FP16 y 8 GB para FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, T4, A10). Para entrenamiento se usó una A100 40GB, pero para inferencia basta con GPUs de gama media.
- Cabe en GPUs de consumo: sí, en RTX 3060, RTX 4060, etc., con cuantización FP16 o int8.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, así como con servidores de inferencia como vLLM, TGI o Triton. También es compatible con `bitsandbytes` para cuantización en 8 bits.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna, la inferencia sobre una oración de ~50 tokens debería ser del orden de milisegundos (típico para modelos de 560M en token classification).

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (detección de spans para SemEval-2010 Task 8) dentro de la información proporcionada. Se podría comparar con otros modelos de NER basados en XLM-RoBERTa, pero no hay datos de rendimiento en esta tarea específica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo detecta dos entidades (`e1` y `e2`) por oración; no es un NER general y no reconoce entidades nombradas (personas, lugares, organizaciones).
- Entrenado exclusivamente en inglés; su rendimiento en otros idiomas no ha sido evaluado y probablemente sea deficiente.
- La licencia presenta una discrepancia: el YAML indica MIT, pero el badge de la model card muestra CC BY-NC-SA 4.0. Antes de uso comercial, se debe verificar cuál es la licencia efectiva.
- El modelo puede alucinar o etiquetar incorrectamente spans en oraciones fuera de la distribución del dataset SemEval-2010 Task 8, especialmente en dominios muy diferentes.
- No se han documentado sesgos específicos, pero al estar entrenado en un dataset académico, puede reflejar los sesgos de ese corpus.
- Para producción, se recomienda validar el rendimiento en el dominio objetivo, ya que el F1 de 0.847 en validación puede no generalizar a otros contextos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DS4AI-UPB/span-detector-en
- Repositorio de código (GitHub): https://github.com/DS4AI-UPB/crosslingual-romanian-re
- Clasificador de relaciones asociado: https://huggingface.co/DS4AI-UPB/xlmr-large-ro-re
- Perfil de la organización DS4AI-UPB: https://huggingface.co/DS4AI-UPB
- Paper (en progreso, WIP): https://arxiv.org/abs/WIP (enlace no funcional en la model card)
