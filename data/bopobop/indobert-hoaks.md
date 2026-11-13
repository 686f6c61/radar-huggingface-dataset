# bopobop/indobert-hoaks

## Resumen

`bopobop/indobert-hoaks` es un modelo de clasificación de texto publicado en Hugging Face por el usuario `bopobop` el 13 de noviembre de 2026. A partir del identificador y de la etiqueta `bert` del repositorio, se trata de un ajuste fino de IndoBERT, la familia de modelos BERT preentrenados en indonesio desarrollada por IndoLEM/IndoNLU, aunque la model card no confirma explícitamente el checkpoint de origen. El modelo cuenta con 124.442.882 parámetros, un tamaño coherente con la variante base de BERT (≈110 M) tras añadir la cabeza de clasificación.

El propósito declarado es la clasificación de texto (`pipeline: text-classification`), pero la model card está generada automáticamente y no documenta la tarea concreta, el dataset de ajuste ni las etiquetas de salida. El nombre "hoaks" sugiere un ajuste orientado a la detección de desinformación o noticias falsas en indonesio, si bien esta hipótesis no está confirmada por el autor.

Su relevancia actual es limitada: se trata de un modelo sin descargas ni likes en el momento de la ficha, con licencia no especificada y sin métricas publicadas. Resulta útil únicamente como checkpoint de partida para experimentación con clasificación de texto en indonesio, siempre que se verifique su comportamiento antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only), según tag `bert`; checkpoint base exacto no disponible |
| Parametros totales | 124.442.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los modelos BERT base suelen limitarse a 512 tokens, pero no está confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a int8/fp16 posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible (el identificador sugiere indonesio, sin confirmación en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer encoder-only de tipo BERT, tal como indica la etiqueta `bert` del repositorio y el recuento de parámetros (124,4 M, compatible con BERT-base más una cabeza de clasificación). No se dispone de información sobre el checkpoint base exacto (IndoBERT base, IndoBERT-lite u otro), el número de capas, la dimensión oculta ni el número de cabezas de atención.

El autor no documenta los datos de entrenamiento, el número de tokens, la composición del dataset, la existencia de ajuste supervisado, RLHF/DPO ni ninguna innovación técnica. La model card es la plantilla automática de Hugging Face con todos los campos marcados como `[More Information Needed]`. Tampoco se especifican hiperparámetros, régimen de precisión ni infraestructura de cómputo empleada.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que el modelo devuelve etiquetas y puntuaciones de probabilidad para una secuencia de entrada.
- Codificación de texto: al ser un encoder BERT, puede emplearse para generar embeddings contextuales de frases (tag `text-embeddings-inference`).
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse en la infraestructura de inferencia de Hugging Face.
- Generación de texto: no soportada (arquitectura encoder-only).
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; el identificador sugiere indonesio, sin confirmación.
- Modo thinking, visión o audio: no disponibles.
- Número y nombre de las etiquetas de salida: no disponible.

## Casos de uso

- Detección de desinformación en indonesio: si el nombre "hoaks" refleja la tarea real, el modelo podría clasificar titulares o publicaciones como veraces o falsas; requiere validación previa con un conjunto etiquetado propio, ya que no hay métricas publicadas.
- Moderación de contenido en foros y redes: clasificación binaria o multiclase de comentarios para filtrar spam o contenido tóxico, aprovechando el bajo coste de inferencia de un modelo de 124 M de parámetros.
- Enrutamiento de tickets de soporte: clasificar mensajes entrantes por categoría temática para dirigirlos al equipo adecuado, con la ventaja de que el modelo cabe en CPU.
- Análisis de sentimiento en reseñas: ajuste adicional sobre el checkpoint para sentimiento positivo/negativo en textos en indonesio, partiendo de un encoder ya adaptado al idioma.
- Etiquetado de datasets a escala: uso como preetiquetador en pipelines de anotación semi-automática, con revisión humana posterior.
- Extracción de embeddings para búsqueda semántica: generar representaciones vectoriales de documentos en indonesio para un motor de recuperación, dado el tag `text-embeddings-inference`.
- Filtrado previo en pipelines RAG: clasificar la relevancia de fragmentos recuperados antes de pasarlos a un modelo generador, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, datasets de test ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB (124,4 M parámetros × 4 bytes).
- VRAM estimada en fp16: aproximadamente 0,25 GB.
- VRAM estimada en int8: aproximadamente 0,13 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el modelo es viable en GPUs de gama baja (GTX 1650, T4) y en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en Raspberry Pi para inferencia en CPU con latencias aceptables.
- Opciones de despliegue: `transformers` (nativo), Text Embeddings Inference (tag `text-embeddings-inference`), Hugging Face Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime y cuantización vía Optimum. No se documenta soporte explícito de vLLM ni llama.cpp.
- Latencia y throughput: no disponibles; para un BERT-base en GPU T4 se suele situar en el orden de milisegundos por secuencia corta, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `bopobop/indobert-hoaks` | 124,4 M | no disponible | no disponible | Hugging Face, 0 descargas |
| `indolem/indobert-base-uncased` | ≈124 M | 512 tokens | MIT (según repositorio original de IndoBERT) | Hugging Face, ampliamente utilizado |
| `indobenchmark/indobert-lite-base-p1` | ≈124 M | 512 tokens | MIT (según repositorio IndoBenchmark) | Hugging Face |
| `mdhugol/indonesia-bert-sentiment-classification` | ≈124 M | 512 tokens | no disponible | Hugging Face, con métricas publicadas |

La comparación se limita a parámetros y disponibilidad: no hay datos de rendimiento para `indobert-hoaks` que permitan contrastar calidad. Los checkpoints de IndoLEM e IndoBenchmark cuentan con documentación, licencia y evaluaciones publicadas, lo que los hace preferibles como punto de partida frente a este modelo sin documentar.

## Limitaciones y advertencias

- Model card generada automáticamente: no hay información sobre la tarea, las etiquetas, el dataset ni el proceso de entrenamiento.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor antes de integrarlo en un producto.
- Sin métricas de evaluación: se desconoce la precisión, el recall y el comportamiento en dominios distintos al de entrenamiento.
- Riesgo de sesgos desconocido: al no documentarse los datos de entrenamiento, no se pueden evaluar sesgos de género, etnia, religión o políticos, especialmente relevantes en un modelo orientado a desinformación.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de clasificaciones erróneas con alta confianza.
- Idiomas soportados sin confirmar: si el modelo no está realmente entrenado en indonesio, su rendimiento en ese idioma podría ser deficiente.
- Longitud de contexto sin confirmar: si sigue la configuración estándar de BERT, secuencias superiores a 512 tokens se truncarían.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni reportes de terceros.
- Fecha de creación futura (2026): conviene verificar la autenticidad y procedencia del repositorio antes de descargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bopobop/indobert-hoaks
- Paper de referencia citado en los tags (ML Impact Calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- IndoBERT (IndoLEM), posible checkpoint base: https://huggingface.co/indolem/indobert-base-uncased
- IndoBenchmark, familia alternativa de modelos indonesios: https://huggingface.co/indobenchmark
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
