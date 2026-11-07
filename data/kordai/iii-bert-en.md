# KordAI/III-BERT-EN

## Resumen

III-BERT-EN es un modelo de lenguaje enmascarado (fill-mask) publicado por KordAI en Hugging Face bajo el identificador `KordAI/III-BERT-EN`. Se distribuye con la librería Transformers y utiliza una arquitectura propia registrada como `iii_bert`, lo que obliga a cargarlo con `trust_remote_code=True`. El checkpoint contiene 32.082.624 parámetros en formato safetensors y ocupa aproximadamente 0,1 GB en el repositorio, un tamaño coherente con un encoder tipo BERT-base.

El modelo se presenta como la variante en inglés de la familia III-BERT de KordAI; en el Hub existen al menos otras dos publicaciones relacionadas: `KordAI/III-BERT` (que expone una clase `IIIBERTForSequenceClassification`) y `KordAI/III-BERT-Wisesight-Sentiment`, un ajuste fino para análisis de sentimiento en tailandés con cuatro etiquetas (pos, neu, neg, q). Esto sugiere que III-BERT funciona como familia de encoders reutilizables para tareas de clasificación y enmascarado.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es la plantilla automática de Hugging Face, sin datos de entrenamiento, licencia, idiomas ni evaluación. A fecha de la información disponible, el repositorio registra 0 descargas y 0 likes, y fue creado el 7 de noviembre de 2026. Cualquier uso en producción exige una validación empírica propia antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | III-BERT (encoder tipo BERT, clase custom `iii_bert`) |
| Parámetros totales | 32.082.624 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización a GGUF/ONNX no publicada) |
| Idiomas soportados | inglés (según el sufijo `-EN` del identificador; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | fill-mask |
| Librería | transformers (requiere `trust_remote_code=True`) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `iii_bert` y del pipeline `fill-mask`. Por el número de parámetros (32,08 M) y el tamaño del checkpoint, el diseño encaja con un encoder Transformer de tipo BERT-base (12 capas, dimensión oculta 768, 12 cabezas de atención), aunque esta correspondencia no está confirmada en la documentación publicada. El repositorio incluye código propio (`custom_code`), por lo que la clase `IIIBERTForMaskedLM` y sus componentes auxiliares se cargan desde el propio Hub en lugar de desde la implementación estándar de Transformers.

No se han publicado datos sobre el corpus de entrenamiento (número de tokens, composición, filtrado), sobre el objetivo exacto de preentrenamiento (MLM clásico, variantes con atención lineal, decodificación especulativa u otras) ni sobre si hubo ajuste con RLHF o DPO. La model card tampoco documenta hiperparámetros, régimen de precisión (fp32, fp16, bf16) ni infraestructura de cómputo. En el ecosistema KordAI, el modelo hermano `III-BERT` expone una cabeza de clasificación de secuencias (`IIIBERTForSequenceClassification`), lo que indica que la familia está pensada para reutilizarse como backbone en tareas supervisadas.

## Capacidades

- Relleno de máscaras (fill-mask): predice el token enmascarado en una secuencia, tarea principal declarada en el pipeline del Hub.
- Extracción de representaciones contextuales: al ser un encoder bidireccional, puede emplearse para generar embeddings de frases o tokens para tareas posteriores.
- Clasificación de secuencias mediante ajuste fino: la familia III-BERT incluye una clase de clasificación, aunque en este repositorio concreto no se confirma su exposición en el mapeo de AutoModel.
- Ajuste fino supervisado: el tamaño reducido permite entrenar cabezas de clasificación, NER o QA extractiva con recursos modestos.
- Capacidades multilingües: no disponibles; el sufijo `-EN` apunta a un modelo orientado al inglés, sin confirmación documental.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión, audio y modo thinking: no disponibles; no son capacidades propias de un encoder fill-mask.

## Casos de uso

- Relleno de texto asistido en editores: el modelo puede completar palabras enmascaradas en frases en inglés, útil para correctores ortográficos o sugerencias de redacción en entornos de bajo coste computacional.
- Clasificación de textos con ajuste fino: partiendo de las representaciones del encoder, se puede entrenar un clasificador de sentimiento, intención o toxicidad con conjuntos de datos pequeños, gracias a sus 32 M de parámetros.
- Extracción de entidades nombradas (NER): el modelo sirve como backbone para una cabeza token-level en pipelines de procesamiento documental, con requisitos de VRAM mínimos.
- Búsqueda semántica y recuperación: los embeddings contextuales del encoder pueden alimentar un índice vectorial para motores de búsqueda interna o sistemas de preguntas y respuestas extractivas.
- Filtrado y moderación de contenido: un ajuste fino sobre las representaciones permite clasificar comentarios o publicaciones en categorías de riesgo dentro de plataformas con limitaciones de latencia.
- Investigación en arquitecturas BERT: el código custom publicado permite estudiar variantes de atención o de preentrenamiento en un modelo pequeño, reproducible en una sola GPU de consumo.
- Prototipado rápido en docencia: el reducido tamaño del checkpoint (0,1 GB) facilita su descarga y ejecución en portátiles para prácticas de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,13 GB solo para pesos (32,08 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB en total.
- VRAM estimada en fp16/bf16: aproximadamente 0,07 GB para pesos, con un consumo total inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Para lotes grandes, una A100 o H100 no aporta ventajas significativas por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (obligatorio por el código custom); el soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado y requeriría conversión a los formatos correspondientes.
- Latencia y throughput: no disponibles; al tratarse de un encoder de 32 M de parámetros, se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KordAI/III-BERT-EN | 32,08 M | no disponible | no disponible | Hugging Face, 0 descargas | Código custom, requiere `trust_remote_code` |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado | Referencia estándar para fill-mask en inglés |
| distilbert/distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | Hugging Face | Destilado de BERT-base, menor latencia |
| KordAI/III-BERT | no disponible | no disponible | no disponible | Hugging Face | Variante de la misma familia con cabeza de clasificación |

La comparación con BERT-base y DistilBERT se ofrece como referencia de categoría (encoders enmascarados en inglés); no se dispone de datos de rendimiento de III-BERT-EN que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es la plantilla automática, sin información sobre datos de entrenamiento, evaluación, sesgos ni uso previsto.
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de integrarlo en productos.
- Código custom: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_iii_bert.py` y fijar una revisión concreta.
- Riesgo de alucinación y sesgos: no evaluado ni documentado; al ser un modelo fill-mask, los sesgos del corpus de entrenamiento pueden reflejarse en las predicciones.
- Idiomas: solo se infiere inglés por el sufijo del identificador; el rendimiento en otros idiomas no está verificado.
- Longitud de contexto: no disponible; si sigue el esquema BERT clásico, probablemente 512 tokens, pero no está confirmado.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni de mantenimiento activo.
- Compatibilidad: no se confirma el mapeo de `AutoModelForSequenceClassification` en este repositorio; para clasificación podría ser necesario usar el repositorio `KordAI/III-BERT`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KordAI/III-BERT-EN
- Modelo relacionado (clasificación): https://huggingface.co/KordAI/III-BERT
- Modelo relacionado (sentimiento en tailandés): https://huggingface.co/KordAI/III-BERT-Wisesight-Sentiment
- Paper citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
