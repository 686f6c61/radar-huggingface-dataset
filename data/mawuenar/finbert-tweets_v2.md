# mawuenar/finbert-tweets_v2

## Resumen

`mawuenar/finbert-tweets_v2` es un modelo de clasificación de texto publicado en HuggingFace por el usuario `mawuenar`. Por su identificador y por los tags del repositorio (`bert`, `text-classification`), se trata de un ajuste fino (fine-tuning) de la familia FinBERT orientado a analizar sentimiento en tuits de temática financiera. El repositorio contiene pesos en formato `safetensors` con 109.484.547 parámetros, lo que corresponde a la arquitectura BERT-base (≈110 M de parámetros).

El modelo se distribuye a través de la librería `transformers` y es compatible con `text-embeddings-inference` y con los endpoints de HuggingFace, lo que facilita su despliegue como servicio de inferencia. La model card está generada automáticamente y no aporta información sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación, de modo que la mayor parte de los detalles técnicos debe inferirse de la arquitectura y de los tags.

Su relevancia es acotada: se trata de un modelo sin descargas ni interacciones en el momento de la consulta, con documentación mínima, por lo que debe evaluarse con cautela antes de usarlo en producción. Resulta útil como punto de partida para tareas de análisis de sentimiento financiero en redes sociales, pero carece de garantías documentadas sobre calidad, sesgos o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, familia FinBERT), según tags `bert` |
| Parametros totales | 109.484.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base admite típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el nombre, presumiblemente inglés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, coherente con los 109,48 M de parámetros del checkpoint, equivalentes a BERT-base. El tag `arxiv:1910.09700` presente en el repositorio corresponde al artículo de Lacoste et al. (2019) sobre el cálculo del impacto ambiental del aprendizaje automático, citado en la plantilla de la model card; no es una referencia al artículo de FinBERT ni a la arquitectura del modelo.

No hay información publicada sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas. La model card indica de forma explícita «More Information Needed» en todas las secciones de detalles de entrenamiento, evaluación y procedimiento. El nombre del repositorio (`finbert-tweets_v2`) sugiere un ajuste fino sobre tuits financieros, pero este extremo no está documentado por el autor.

## Capacidades

- Clasificación de texto (pipeline `text-classification`), presumiblemente de sentimiento financiero.
- Análisis de sentimiento sobre textos cortos tipo tuit, según el nombre del modelo.
- Compatibilidad con `text-embeddings-inference` y con endpoints de HuggingFace.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No hay soporte documentado de tool calling, function calling ni agentes.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Análisis de sentimiento de tuits financieros: clasificar publicaciones de redes sociales en categorías de sentimiento (positivo, negativo, neutro) para alimentar paneles de seguimiento de opinión sobre activos.
- Monitorización de reputación de marca en finanzas: procesar menciones de una entidad financiera en redes sociales y agregar la polaridad de los mensajes.
- Señales alternativas para investigación cuantitativa: incorporar el sentimiento agregado de redes sociales como variable en modelos de predicción de volatilidad, siempre que se valide previamente la calidad del clasificador.
- Filtrado y enrutamiento de notificaciones: clasificar grandes volúmenes de mensajes entrantes para priorizar los de tono negativo que requieran revisión humana.
- Etiquetado asistido de datasets: usar el modelo para preetiquetar corpus de tuits financieros antes de una revisión manual y un reentrenamiento.
- Prototipado rápido en entornos de HuggingFace: desplegar el modelo mediante `text-embeddings-inference` o los endpoints compatibles para validar una idea de producto sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo de pesos (109,48 M de parámetros × 4 bytes), más overhead de activaciones y del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB de pesos, más overhead.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- GPU recomendadas para producción de alto throughput: A10G, L4, A100 o H100, aunque el modelo es lo bastante pequeño como para no requerirlas.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, `text-embeddings-inference`, endpoints de HuggingFace y, presumiblemente, exportación a ONNX (no documentada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mawuenar/finbert-tweets_v2` | 109,48 M | no disponible | Clasificación de sentimiento financiero (presunto) | no disponible | HuggingFace, 0 descargas |
| ProsusAI/finbert | ≈110 M (BERT-base) | 512 tokens | Análisis de sentimiento financiero | Apache 2.0 | HuggingFace, ampliamente usado |
| yiyanghkust/finbert-tone | ≈110 M (BERT-base) | 512 tokens | Análisis de sentimiento financiero | no disponible | HuggingFace, ampliamente usado |
| ahmedrachid/FinancialBERT | ≈110 M (BERT-base) | 512 tokens | Modelo de lenguaje financiero y clasificación | Apache 2.0 | HuggingFace |

La comparación con los modelos anteriores se basa en la arquitectura y la categoría de tarea, no en evaluaciones del modelo analizado, dado que no se han publicado resultados.

## Limitaciones y advertencias

- Model card generada automáticamente y sin información sustantiva: no hay datos de entrenamiento, evaluación ni hiperparámetros.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- Sin descargas ni interacciones en el momento de la consulta: no hay evidencia de validación por la comunidad.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas por dominio, jerga financiera o ironía en tuits.
- Sesgos desconocidos: no se documenta la composición del corpus, por lo que pueden existir sesgos de dominio, temporales o de idioma.
- Idioma no confirmado: el nombre sugiere inglés, pero no está documentado; el rendimiento en castellano es incierto.
- Longitud de contexto no confirmada: si se trata de BERT-base, el límite habitual es 512 tokens, insuficiente para documentos largos.
- Antes de usarlo en producción, se recomienda evaluarlo contra un conjunto de validación propio y compararlo con `ProsusAI/finbert` o `yiyanghkust/finbert-tone`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mawuenar/finbert-tweets_v2
- Artículo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos específicos del modelo.
