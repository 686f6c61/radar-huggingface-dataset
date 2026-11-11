# emiloetting/FoodCLS

## Resumen

FoodCLS es un modelo de clasificación de texto desarrollado por el usuario emiloetting que mapea las etiquetas de categoría de producto (`categories_tags`) de la base de datos OpenFoodFacts a un conjunto reducido de 12 categorías alimentarias de alto nivel. El problema que resuelve es la granularidad excesiva y la inconsistencia taxonómica de OpenFoodFacts: sus etiquetas originales son múltiples, jerárquicas y heterogéneas, lo que dificulta la agregación de datos y la construcción de vistas resumidas del catálogo de productos.

El modelo se ha entrenado sobre el estado de la base de datos de producto de OpenFoodFacts con fecha del 9 de noviembre de 2026, según indica la model card. El autor lo describe como parte de un proyecto estudiantil orientado a ofrecer una visión intuitiva de los productos alimentarios. No se especifican en la información disponible la arquitectura subyacente, el número de parámetros ni la longitud de contexto, por lo que estos datos deben considerarse no disponibles.

Su relevancia es acotada: se trata de una pieza de utilidad para pipelines de normalización de datos de OpenFoodFacts, no de un modelo generativo de propósito general. La licencia no está declarada, lo que limita su adopción en entornos comerciales sin aclaración previa por parte del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | alemán (de), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura del modelo (transformer, encoder, clasificador lineal sobre embeddings, etc.), ni el número de parámetros, ni la composición exacta del conjunto de entrenamiento más allá de su origen: la base de datos de producto de OpenFoodFacts en su estado del 9 de noviembre de 2026. La tarea es una clasificación de texto multietiqueta a clase única sobre 12 categorías predefinidas (IDs 0 a 11), derivadas del atributo `categories_tags`.

No se documentan en la información disponible procesos de RLHF, DPO, aumento de datos ni técnicas de regularización. Tampoco se especifica si el modelo parte de un checkpoint preentrenado (fine-tuning) o si se ha entrenado desde cero. Cualquier afirmación sobre innovaciones técnicas como decodificación especulativa o atención lineal carecería de respaldo documental.

## Capacidades

- Clasificación de texto de producto en 12 categorías alimentarias predefinidas (frutas y verduras, carne/pescado y alternativas, lácteos y huevos, pan y bollería, pasta/arroz y cereales, platos preparados, ingredientes de repostería, bebidas, snacks y dulces, aceites/especias y salsas, untables, otros).
- Mapeo de etiquetas de categoría de OpenFoodFacts a una taxonomía simplificada y agregable.
- Soporte de dos idiomas en las etiquetas de entrada: alemán e inglés.
- Salida de una clase única por producto (clasificación multiclase, no multietiqueta).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.

## Casos de uso

- Normalización de catálogos de OpenFoodFacts: ingerir el volcado de productos y sustituir la maraña de `categories_tags` por una de las 12 clases, facilitando consultas agregadas por tipo de alimento en un almacén analítico.
- Construcción de paneles de surtido: agrupar productos por categoría amplia para calcular cuotas de estantería, número de referencias por categoría o evolución del surtido en un periodo.
- Enriquecimiento de datasets de investigación: añadir una columna de categoría normalizada a estudios de nutrición o de precios que partan de OpenFoodFacts, reduciendo el trabajo manual de etiquetado.
- Filtrado y segmentación en aplicaciones de consumo: permitir que una app de escaneo de productos agrupe resultados por sección de supermercado (bebidas, snacks, lácteos) sin depender de la taxonomía original.
- Deduplicación y control de calidad de datos: detectar productos con etiquetas de categoría incoherentes comparando la predicción del modelo con la etiqueta original y marcando discrepancias para revisión.
- Preprocesado para modelos posteriores: usar la categoría predicha como feature categórica en modelos de recomendación, estimación nutricional o predicción de precios.
- Localización de catálogos: al soportar etiquetas en alemán e inglés, permite unificar productos de mercados germanoparlantes y anglosajones bajo las mismas 12 clases.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica tamaño ni arquitectura).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; al tratarse de un pipeline `text-classification`, sería desplegable en cualquier runtime compatible con modelos de Hugging Face Transformers, pero no se confirma el formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La tarea (mapeo de `categories_tags` de OpenFoodFacts a categorías amplias) es específica y no se han identificado alternativas públicas documentadas en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FoodCLS (emiloetting) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; es un bloqueo para producción sin aclaración del autor.
- El modelo se ha entrenado sobre un estado concreto de OpenFoodFacts (9 de noviembre de 2026); los cambios posteriores en la taxonomía de etiquetas pueden degradar el mapeo.
- Solo cubre alemán e inglés en las etiquetas de entrada; productos con etiquetas en otros idiomas pueden clasificarse incorrectamente.
- La clasificación es de clase única: productos que pertenecen legítimamente a varias categorías (por ejemplo, una salsa que también es untable) se fuerzan a una sola etiqueta.
- La categoría 11 ("Otros") actúa como clase residual y puede absorber productos mal etiquetados o ambiguos, enmascarando errores.
- No se documentan métricas de evaluación, matriz de confusión ni tamaño del conjunto de validación, por lo que no es posible estimar la fiabilidad real del clasificador.
- Riesgo de sesgo derivado de la distribución del catálogo de OpenFoodFacts, que no es representativa de todos los mercados ni de todas las categorías por igual.
- Proyecto estudiantil sin mantenimiento declarado ni comunidad (0 descargas, 0 likes en el momento de la consulta); no hay garantía de soporte.
- No se especifica el formato de pesos, lo que complica la integración en pipelines que esperan safetensors o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emiloetting/FoodCLS
- Base de datos de producto de OpenFoodFacts (dataset): https://huggingface.co/datasets/openfoodfacts/product-database
- OpenFoodFacts (sitio principal): https://world.openfoodfacts.org/
