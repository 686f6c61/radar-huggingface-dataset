# cringepnh/koelectra-korean-shopping-rating

## Resumen

El modelo `cringepnh/koelectra-korean-shopping-rating` es un clasificador de texto en coreano diseñado para predecir la puntuación (rating) de reseñas de compras reales de Naver Shopping, la principal plataforma de comercio electrónico de Corea del Sur. Desarrollado por Komronbek Yo'ldoshev (usuario `cringepnh`), este modelo es un fine-tuning del discriminador KoELECTRA-base-v3, un modelo ELECTRA preentrenado específicamente para el idioma coreano. Resuelve el problema de entender la intensidad del sentimiento en reseñas de productos, no solo si es positivo o negativo, sino la calificación exacta en una escala de 1 a 5 (aunque excluye la clase 3, ausente en el conjunto de datos original).

El modelo tiene aproximadamente 112,9 millones de parámetros, lo que lo hace ligero y adecuado para entornos de producción con recursos limitados. Su relevancia radica en que el análisis de sentimiento en coreano está menos explorado que en inglés, y este modelo ofrece una solución práctica y reproducible para un caso de uso real: la clasificación de reseñas de compras. La licencia MIT permite su uso comercial sin restricciones, y el código fuente completo está disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (discriminator) con cabecera de clasificacion de secuencia |
| Parametros totales | 112.924.420 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en KoELECTRA-base-v3, concretamente en su variante discriminador. ELECTRA (Efficiently Learning an Encoder that Classifies Token Replacements Accurately) utiliza un preentrenamiento con reemplazo de tokens, donde un generador propone tokens plausibles y el discriminador aprende a distinguir tokens reales de los reemplazados. Esta arquitectura es más eficiente que BERT en términos de rendimiento por parámetro. El modelo base fue preentrenado por el equipo de Monologg sobre corpus coreanos (Korean Wikipedia, etc.) y posteriormente fine-tuneado para esta tarea de clasificación de 4 clases (ratings 1, 2, 4 y 5).

El fine-tuning se realizó con una pérdida de entropía cruzada estándar, sin pérdida ordinal que tenga en cuenta el orden de las clases. Los datos provienen del corpus público de Naver Shopping de `bab2min/corpus`, que contiene 200.000 reseñas reales con sus ratings. Tras excluir 184 filas con textos duplicados que tenían ratings conflictivos, se dividieron en 159.852 ejemplos de entrenamiento, 19.982 de validación y 19.982 de test. El mejor checkpoint se seleccionó por MAE en validación (época 2, MAE 0,3894). No se utilizó RLHF ni DPO; es un ajuste supervisado clásico.

## Capacidades

- Clasificacion de reseñas de compras coreanas en 4 categorias de rating: 1, 2, 4 y 5.
- Analisis de sentimiento con granularidad fina, distinguiendo entre valoraciones muy negativas (1), negativas (2), positivas (4) y muy positivas (5).
- Procesamiento de texto en coreano, incluyendo vocabulario coloquial y expresiones propias de reseñas de productos.
- Inferencia rapida y ligera gracias a su tamano reducido (112M parametros).
- Integracion sencilla con la libreria `transformers` de Hugging Face mediante `AutoModelForSequenceClassification`.
- No soporta generacion de texto, tool calling, agentes, vision ni audio; es exclusivamente un clasificador de secuencias.

## Casos de uso

- Analisis de sentimiento en plataformas de e-commerce: el modelo puede clasificar automaticamente las reseñas de productos en Naver Shopping o tiendas similares, permitiendo a los vendedores identificar rapidamente valoraciones muy negativas (1 estrella) para priorizar atencion al cliente.
- Monitorizacion de satisfaccion del cliente: integrar el modelo en un pipeline de procesamiento de reseñas para calcular metricas agregadas como el porcentaje de reseñas con rating 1 o 5, ayudando a detectar tendencias de calidad.
- Moderacion de contenido: filtrar reseñas extremadamente negativas (rating 1) para su revision manual antes de publicarlas, evitando que contenido danino afecte la reputacion de la tienda.
- Investigacion de mercado: analizar grandes volumenes de reseñas historicas para entender la distribucion de satisfaccion por producto o categoria, sin necesidad de etiquetado manual.
- Asistente de compras: combinar el modelo con un sistema de recomendacion para mostrar a los usuarios las reseñas mas relevantes segun su polaridad, mejorando la experiencia de compra.
- Deteccion de fraude o reseñas falsas: las reseñas con rating extremo (1 o 5) pueden ser senal de comportamiento anomalo; el modelo puede ayudar a priorizar estas reseñas para su inspeccion.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados sobre un conjunto de test fijo de 19.982 reseñas:

| Sistema | Prediccion | MAE | RMSE | Exact accuracy | Within ±1 |
|---|---|---|---:|---:|---:|---:|
| Constante: mediana de entrenamiento | 4.0000 | 1.5859 | 1.8182 | 9.39% | 50.02% |
| Constante: media de entrenamiento | 3.2265 | 1.5862 | 1.6454 | 0.00% | 9.39% |
| Clase mayoritaria (rating 5) | 5 | 1.7735 | 2.4192 | 40.62% | 50.02% |
| Fine-tuned 4-class KoELECTRA | — | **0.3856** | **0.8364** | **71.66%** | **94.46%** |

El modelo supera claramente a las lineas base constantes y a la clase mayoritaria, con un error absoluto medio de 0,39 y una precision exacta del 71,66%. No se han publicado comparaciones con otros modelos de clasificacion de reseñas coreanas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 450 MB en FP32 (112M parametros × 4 bytes) y unos 225 MB en FP16. Con cuantizacion a 8 bits, podria reducirse a ~120 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 2060 o superiores. Tambien puede ejecutarse en CPU sin problemas para inferencia por lotes pequenos.
- Es compatible con tarjetas de gama baja y entornos sin GPU, gracias a su tamano reducido.
- Opciones de despliegue: se puede servir con `transformers` directamente, o mediante frameworks como `vLLM` (aunque no es optimo para clasificacion), `TGI` (Text Generation Inference) o `Ollama` (si se convierte a GGUF). Para clasificacion, lo mas sencillo es usar un endpoint con FastAPI y `transformers`.
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia de una sola secuencia de menos de 128 tokens tarda menos de 10 ms. En CPU, puede rondar los 50-100 ms por secuencia.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion proporcionada. Sin embargo, existen alternativas en el ecosistema coreano:

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `cringepnh/koelectra-korean-shopping-rating` | 112M | Clasificacion de rating (1,2,4,5) | MIT | Hugging Face |
| `monologg/koelectra-base-v3-finetuned-nsmc` | 112M | Clasificacion binaria de sentimiento (positivo/negativo) | MIT | Hugging Face |
| `monologg/koelectra-base-v3-discriminator` | 112M | Modelo base preentrenado | MIT | Hugging Face |

La principal diferencia es que el modelo de este articulo predice una escala de 4 valores, mientras que el fine-tuned de NSMC solo distingue dos clases. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con reseñas de Naver Shopping; no funciona bien con reseñas de peliculas, libros u otros dominios.
- No puede predecir la clase 3 (rating neutro) porque no existe en el conjunto de datos original. Esto limita su uso en escenarios donde se necesite una escala completa de 1 a 5.
- Las clases estan desbalanceadas: la clase 5 es la mas frecuente, lo que puede sesgar las predicciones hacia valoraciones altas.
- La funcion de perdida es entropia cruzada estandar, sin considerar el orden natural de las clases. Un modelo con perdida ordinal podria mejorar el MAE.
- El modelo puede alucinar o clasificar incorrectamente textos ambiguos, especialmente reseñas sarcasticas o con doble sentido.
- Aunque la licencia del codigo es MIT, el conjunto de datos subyacente proviene de `bab2min/corpus`, que declara dominio publico, pero es responsabilidad del usuario verificar la licencia de los datos si los reutiliza.
- No se han publicado evaluaciones de sesgos o robustez ante ataques adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cringepnh/koelectra-korean-shopping-rating
- Repositorio de codigo (GitHub): https://github.com/cringepnh/korean-shopping-review-rating-predictor
- Repositorio de KoELECTRA (modelo base): https://github.com/monologg/KoELECTRA
- Corpus de Naver Shopping (fuente de datos): https://github.com/bab2min/corpus/blob/master/sentiment/naver_shopping.txt
- Perfil del autor en Hugging Face: https://huggingface.co/cringepnh
