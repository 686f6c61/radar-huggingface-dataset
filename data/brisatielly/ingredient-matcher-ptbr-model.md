# BrisaTielly/ingredient-matcher-ptbr-model

## Resumen

El modelo Ingredient Matcher PT-BR es un fine-tuning de `intfloat/multilingual-e5-small` desarrollado por BrisaTielly, orientado a la recuperación de ingredientes canónicos a partir de descripciones ruidosas en portugués de Brasil. Resuelve un problema concreto de food-tech: normalizar entradas libres de compra (por ejemplo, abreviaturas de tickets o listas de proveedores) contra un catálogo cerrado de ingredientes, con capacidad de abstenerse cuando no existe coincidencia válida.

Se trata de un modelo de embeddings tipo BERT con 117.653.760 parámetros, entrenado con `MultipleNegativesRankingLoss` sobre 210 pares sintéticos y evaluado tanto en un conjunto sintético como en una muestra externa revisada del conjunto Open Prices. Su relevancia actual radica en que aborda la coincidencia de entidades (entity matching) en un dominio vertical concreto, donde los enfoques de similitud léxica como RapidFuzz rinden claramente peor según la evaluación publicada por el autor.

El modelo está publicado con licencia MIT, en formato safetensors, y es compatible con `sentence-transformers` y con Text Embeddings Inference (TEI), lo que facilita su despliegue en pipelines de recuperación semántica de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (base: `intfloat/multilingual-e5-small`) |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues de Brasil (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | sentence-similarity |
| Dimension de embedding | no disponible |
| Tamano del repositorio | 0,5 GB |
| Compatibilidad | sentence-transformers, Text Embeddings Inference (endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, un encoder transformer tipo BERT de 117,6 millones de parámetros. El fine-tuning se realizó con la función de pérdida `MultipleNegativesRankingLoss`, el esquema estándar en `sentence-transformers` para aprendizaje contrastivo de embeddings con negativos en el batch. Las entradas siguen la convención de E5, con prefijos `query:` para la consulta y `passage:` para el candidato del catálogo.

El conjunto de entrenamiento consta de 210 pares sintéticos del split de entrenamiento del dataset Ingredient Matcher PT-BR, con 2 épocas, batch size de 16 y learning rate de 2e-5, semilla 42. Los ingredientes del conjunto de test no aparecen en el de entrenamiento. El umbral de abstención (`NO_MATCH`) se calibra en validación y se congela antes de la evaluación en test, lo que evita fuga de información en la medición. No se documenta el número de tokens de entrenamiento ni la composición detallada del dataset más allá de la cifra de pares.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación (retrieval) en portugués de Brasil.
- Coincidencia de entidades (entity matching) entre descripciones ruidosas y un catálogo canónico de ingredientes.
- Abstención explícita mediante umbral calibrado: devuelve `NO_MATCH` cuando la similitud no supera el umbral, en lugar de forzar una coincidencia.
- Recuperación top-k (se evalúa recall@5) para integración en pipelines de búsqueda y desambiguación.
- Soporte de prefijos E5 (`query:` / `passage:`), necesario para replicar el protocolo de evaluación.
- Normalización de embeddings opcional (`normalize_embeddings=True`) para similitud coseno.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento.

## Casos de uso

- Normalización de tickets de compra en restaurantes: el modelo convierte descripciones abreviadas o ruidosas (por ejemplo, `qj muss fat 1kg`) en el ingrediente canónico del catálogo, reduciendo la intervención manual en la conciliación de facturas.
- Enriquecimiento de catálogos de proveedores: se codifican las descripciones de producto de cada proveedor y se recuperan los ingredientes canónicos correspondientes mediante búsqueda vectorial top-k, con abstención cuando no hay coincidencia fiable.
- Deduplicación de listas de ingredientes: se agrupan entradas que describen el mismo ingrediente con variaciones ortográficas o de formato, usando la similitud entre embeddings.
- Control de calidad de datos maestros: se detectan registros de ingredientes que no encajan en el catálogo canónico y se envían a revisión humana, aprovechando la tasa de acierto de `NO_MATCH` reportada.
- Integración en pipelines de búsqueda semántica: al ser compatible con Text Embeddings Inference, puede desplegarse como endpoint de embeddings en un servicio de recuperación con catálogo indexado en un almacén vectorial.
- Benchmarking interno frente a líneas base léxicas: sirve como referencia para comparar enfoques de similitud semántica frente a RapidFuzz en el mismo catálogo y protocolo de evaluación, tal como hace el autor en su evaluación.
- Preprocesado para análisis de precios: la muestra externa del modelo se extrajo de Open Prices, por lo que encaja en flujos que armonizan observaciones de precios de ingredientes antes de agregarlas.

## Benchmarks y rendimiento

Los resultados publicados por el autor se obtuvieron con `python -m ingredient_matcher.evaluate`, usando el mismo catálogo y evaluador para RapidFuzz, E5 base y este modelo, con el umbral de abstención calibrado en validación y congelado antes del test.

Test sintético (66 ejemplos):

| Modelo | F1 | IC 95% (bootstrap) | Top-1 | Recall@5 | Acierto `NO_MATCH` |
|---|---|---|---|---|---|
| Ingredient Matcher PT-BR | 0,975 | [0,932; 1,000] | 0,983 | 1,000 | 1,000 |
| E5 base | 0,891 | [0,821; 0,950] | no disponible | no disponible | no disponible |

Muestra externa revisada de Open Prices (60 coincidencias y 20 negativos difíciles):

| Modelo | F1 | IC 95% (bootstrap) | Top-1 | Recall@5 | Acierto `NO_MATCH` |
|---|---|---|---|---|---|
| Ingredient Matcher PT-BR | 0,874 | [0,810; 0,931] | 0,950 | 1,000 | 0,700 |
| E5 base | 0,818 | [0,741; 0,885] | 0,900 | no disponible | 0,400 |
| RapidFuzz | 0,605 | [0,492; 0,708] | no disponible | no disponible | no disponible |

El propio autor advierte que los intervalos de confianza se solapan y que el tamaño muestral es pequeño, por lo que no sostiene una conclusión fuerte de superioridad. La ganancia puntual de F1 del fine-tuning sobre E5 base en la muestra externa es de 0,056.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 117,6 millones de parámetros en fp32 (aproximadamente 470 MB de pesos); en fp16 rondaría los 235 MB. No se han publicado mediciones de VRAM ni de cuantización para este modelo concreto.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente por tamaño; para despliegue de alto throughput se recomiendan A100, H100 o L4.
- GPU de consumo: cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060, RTX 4090, así como en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (referencia en la model card), Text Embeddings Inference (el modelo está marcado como `endpoints_compatible`) y cualquier servidor compatible con modelos BERT de Hugging Face. No se documenta soporte específico de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Ingredient Matcher PT-BR | 117,6 M | no disponible | pt | MIT | Embeddings fine-tuneados para entity matching de ingredientes |
| intfloat/multilingual-e5-small (base) | 117,6 M | no disponible | multilingue | MIT | Embeddings multilingues de propósito general |
| RapidFuzz (línea base léxica) | no aplica | no aplica | multilingue | MIT | Coincidencia difusa de cadenas, sin semántica |

Frente a E5 base, el fine-tuning mejora el F1 en la muestra externa (0,874 frente a 0,818) y, sobre todo, la tasa de acierto de `NO_MATCH` (0,700 frente a 0,400). Frente a RapidFuzz, la diferencia es mayor (0,874 frente a 0,605). No se dispone de comparación con otros modelos de embeddings especializados en portugués o en food-tech.

## Limitaciones y advertencias

- Entrenado con solo 210 pares sintéticos y 2 épocas; el riesgo de sobreajuste al formato sintético es real y el autor lo reconoce explícitamente.
- Los intervalos de confianza de las métricas se solapan con los de E5 base, de modo que la superioridad no está estadísticamente establecida con las muestras actuales.
- La muestra externa se seleccionó para contener 60 ítems compatibles con el catálogo y no representa la frecuencia natural de compras de restaurantes.
- Los positivos cubren 24 ingredientes canónicos de forma desigual, y 37 de los 80 registros de la muestra externa provienen de observaciones en EUR, lo que puede introducir sesgo de dominio.
- La tasa de acierto de `NO_MATCH` en la muestra externa es de 0,700, lo que implica un 30 % de errores en la detección de no coincidencias: en producción conviene revisar los casos límite.
- El modelo está ajustado únicamente para portugués de Brasil; su uso en otros idiomas o variantes no está validado.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo de dominio vertical el riesgo principal es la alucinación de coincidencias cuando el umbral no está bien calibrado para los datos de producción.
- La licencia MIT permite uso comercial, pero el autor recomienda evaluaciones operativas con datos del dominio y monitorización continua antes de desplegar.
- No se dispone de información sobre la longitud máxima de contexto soportada, lo que limita la planificación de entradas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrisaTielly/ingredient-matcher-ptbr-model
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Dataset Open Prices (origen de la muestra externa): no disponible como enlace en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio del código de evaluación (`ingredient_matcher`): no disponible como enlace en la información proporcionada
