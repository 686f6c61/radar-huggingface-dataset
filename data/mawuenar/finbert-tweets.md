# mawuenar/finbert-tweets

## Resumen

FinBERT-tweets es un modelo de clasificación de texto publicado en Hugging Face por el usuario mawuenar bajo el identificador `mawuenar/finbert-tweets`. Por su nombre y su arquitectura, se trata de un ajuste fino de la familia BERT orientado al análisis de sentimiento en el dominio financiero, concretamente sobre mensajes cortos del tipo Twitter. El repositorio contiene pesos en formato safetensors y un total de 109.484.547 parámetros, lo que corresponde a la configuración estándar de BERT-base (12 capas, 768 dimensiones ocultas).

El modelo se distribuye a través de la librería transformers con la cabecera de pipeline `text-classification` y es compatible con Text Embeddings Inference y con endpoints de Hugging Face. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta. La model card es la plantilla automática de Hugging Face sin cumplimentar, por lo que no hay información declarada sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación.

La relevancia de esta ficha es acotada: se trata de un artefacto de pesos sin documentación asociada, por lo que cualquier evaluación rigurosa debe hacerse empíricamente antes de considerarlo para producción. Aun así, el interés del modelo radica en su aplicabilidad potencial al análisis de sentimiento financiero en redes sociales, un caso de uso con demanda real en trading algorítmico y monitorización de reputación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), inferida por los tags y el recuento de parámetros; no declarada explícitamente |
| Parametros totales | 109.484.547 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (los modelos BERT-base suelen usar 512 tokens, pero no se confirma en la información) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Compatibilidad | Text Embeddings Inference, endpoints compatible |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, deducida a partir del tag `bert` y del recuento exacto de parámetros (109.484.547), que coincide con la configuración de BERT-base con una cabeza de clasificación para dos o más etiquetas. No se dispone de información sobre el número de capas, dimensiones ocultas, cabezas de atención ni vocabulario más allá de lo que se puede inferir por el tamaño.

No hay datos publicados sobre el corpus de entrenamiento, el número de tokens, el proceso de ajuste fino, la existencia de RLHF/DPO (poco habitual en modelos BERT de clasificación) ni las hiperparámetros empleados. La model card es la plantilla automática generada por Hugging Face y todos los campos relevantes aparecen como "[More Information Needed]". Tampoco se ha publicado un paper, un dataset card ni un repositorio asociado.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar etiquetas a secuencias cortas.
- Análisis de sentimiento financiero: por el nombre del modelo, se espera que distinga polaridad (positiva, negativa, neutra) en mensajes relacionados con mercados y empresas.
- Procesamiento de mensajes cortos: el sufijo "tweets" sugiere entrenamiento o ajuste sobre textos de longitud reducida, típicos de redes sociales.
- Extracción de embeddings: al ser un encoder BERT, puede emplearse para generar representaciones vectoriales de texto, aunque no se documenta explícitamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; no se declara el conjunto de idiomas.

## Casos de uso

- Análisis de sentimiento en redes sociales financieras: el modelo puede clasificar tuits y mensajes cortos sobre activos, empresas o criptomonedas para alimentar indicadores de opinión agregada. Es adecuado por su supuesto ajuste al dominio y al formato de texto breve.
- Monitorización de reputación de marca en Twitter: clasificación por lotes de menciones para detectar picos de sentimiento negativo y activar alertas tempranas en equipos de comunicación.
- Filtrado de señales en trading algorítmico: uso del score de sentimiento como feature adicional en modelos de predicción de volatilidad o volumen, siempre con validación previa sobre datos propios.
- Enriquecimiento de datasets financieros: etiquetado automático de grandes volúmenes de mensajes históricos para construir corpus anotados que alimenten modelos posteriores.
- Investigación académica en finanzas conductuales: análisis de la correlación entre sentimiento en redes y movimientos de precio en ventanas temporales concretas.
- Detección de eventos y rumores: clasificación de mensajes sospechosos o de alta carga emocional para su revisión manual por analistas de riesgo.
- Preprocesado en pipelines de NLP financiero: uso como primer filtro para priorizar qué mensajes pasan a un modelo generativo de mayor tamaño y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; en la práctica, menos de 1 GB con overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre holgadamente el modelo. También funciona en CPU para inferencia por lotes de tamaño moderado.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (declarado compatible), Hugging Face Inference Endpoints, y exportación a ONNX para inferencia optimizada. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama no están disponibles de forma nativa.
- Latencia y throughput: no disponibles; al ser un BERT-base, se espera un throughput alto en GPU (miles de secuencias cortas por segundo en lotes grandes), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mawuenar/finbert-tweets | 109,5 M | no disponible | Financiero / tweets (inferido) | no disponible | Hugging Face, safetensors |
| ProsusAI/finbert | ~110 M (BERT-base) | 512 tokens (habitual) | Financiero (noticias) | no disponible en la información | Hugging Face, ampliamente usado |
| yiyanghkust/finbert-tone | ~110 M (BERT-base) | 512 tokens (habitual) | Financiero (tono) | no disponible en la información | Hugging Face |
| nlptown/bert-base-multilingual-uncased-sentiment | ~178 M | 512 tokens (habitual) | Sentimiento general multilingüe | no disponible en la información | Hugging Face |

La comparación es orientativa: los tres alternativos son modelos BERT de tamaño similar ampliamente adoptados, pero no se dispone de métricas del modelo evaluado para establecer una comparación cuantitativa. La principal diferencia es la ausencia de documentación y de tracción comunitaria en `mawuenar/finbert-tweets` frente a los repositorios de referencia del sector.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni hiperparámetros, lo que impide auditar el modelo.
- Licencia no declarada: no se puede confirmar el uso comercial; en ausencia de licencia explícita, debe asumirse riesgo legal y contactar con el autor antes de desplegarlo en producción.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o solo en inglés.
- Riesgo de sobreajuste al dominio "tweets": el rendimiento puede degradarse en textos formales, noticias largas o informes financieros.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en mensajes irónicos, sarcásticos o con jerga de mercado.
- Sesgos potenciales derivados del corpus de entrenamiento no documentado (por ejemplo, sobrerrepresentación de ciertas empresas, sectores o cuentas influyentes).
- Sin tracción comunitaria (0 descargas, 0 likes) ni validación externa: no hay evidencia pública de su calidad.
- Longitud de contexto no confirmada: los mensajes que excedan el máximo soportado serán truncados, con posible pérdida de información.
- No apto como asesor financiero: cualquier uso en decisiones de inversión requiere validación independiente y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mawuenar/finbert-tweets
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Documentación de transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
