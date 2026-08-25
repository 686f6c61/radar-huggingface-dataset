# Krasovskiy/kwtopic-pairs

## Resumen

`kwtopic-pairs` es un cross-encoder desarrollado por Andrey Krasovskiy, ingeniero de automatización de IA con base en Kiev, especializado en pipelines de RAG y despliegue de modelos. El modelo responde a una pregunta concreta dentro del flujo de SEO y clustering de palabras clave: ¿dos consultas de búsqueda deben dirigirse a la misma página de un sitio web o a páginas diferentes? Está entrenado sobre 25.797 pares de consultas etiquetados manualmente por humanos, procedentes de seis nichos (web studio, freelance, portal de noticias, dos temáticas médicas y un servicio B2B), con predominio de ruso y ucraniano.

La arquitectura se basa en el cross-encoder multilingüe `paraphrase-multilingual-MiniLM-L12-v2`, con 117,6 millones de parámetros y una ventana de entrada truncada a 64 tokens, suficiente para consultas cortas. El modelo se posiciona como una capa interna de un pipeline de clustering de palabras clave, no como un reranker de propósito general: su fortaleza no es agrupar consultas similares, sino detectar y separar consultas que, aunque semánticamente próximas, deben ir en páginas distintas (por ejemplo, por geografía, cifra o marca). En las pruebas reportadas por el autor, el cross-encoder alcanza un F1 del 83,4% frente al 77,4% de los embeddings de la base sin ajuste, y se entrena en 87 segundos en una RTX 4090.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder Transformer basado en MiniLM-L12-v2 (12 capas, 384 dimensiones) |
| Parámetros totales | 117.654.145 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens de entrada (truncado para consultas cortas) |
| Tipos de cuantización | No disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | Ruso (ru), ucraniano (uk), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, una variante multilingüe de MiniLM con 12 capas y 384 dimensiones. A diferencia de los bi-encoders que generan embeddings independientes por consulta, un cross-encoder procesa el par de consultas concatenado como una única secuencia, lo que permite capturar interacciones finas entre los tokens de ambas cadenas. La entrada se trunca a 64 tokens, adecuado para la brevedad de las consultas de búsqueda.

El entrenamiento se realizó con BinaryCrossEntropyLoss, dos épocas y un batch de 64. El dataset de 25.797 pares se dividió en 20.563 pares de entrenamiento, 2.759 de validación y 2.475 de test. El autor aplica diez comprobaciones de calidad antes de entrenar, entre ellas la ausencia de fuga entre particiones (asignando el split a la consulta, no al grupo), el equilibrio de clases, la eliminación de pares duplicados o contradictorios, y que más del 65% de los negativos sean difíciles (comparten al menos una palabra común). El entrenamiento completo tardó 87 segundos en una RTX 4090.

## Capacidades

- Clasificación binaria de pares de consultas: devuelve una probabilidad de 0 a 1, donde 1 indica que ambas consultas deben ir a la misma página y 0 que deben ir a páginas distintas.
- Funciona como capa de clustering en pipelines de SEO: detecta consultas que deben separarse aunque sean semánticamente similares.
- Soporte multilingüe para ruso, ucraniano e inglés, con datos de entrenamiento mayoritariamente en cirílico (18.360 pares) y latín (7.437 pares).
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-step; es un modelo discriminativo puro para ranking de pares.
- No requiere generación de embeddings: se usa directamente con la API `predict` de `sentence-transformers.CrossEncoder`.

## Casos de uso

- **Clustering de palabras clave para SEO**: dado un conjunto de consultas de un nicho, el modelo ayuda a agruparlas en páginas únicas. Se aplica solo a pares candidatos (dentro de un grupo contra la consulta principal y entre consultas principales de grupos vecinos) para evitar los más de 400 millones de pares posibles en un núcleo de 30.000 consultas.
- **Optimización de arquitectura de información**: en sitios con servicios o productos similares, el modelo decide si dos consultas deben compartir una página (por ejemplo, "mrt головного мозга" y "mrt головного мозга цена") o separarse (por ejemplo, "mrt головного мозга" y "mrt коленного сустава").
- **Detección de solapamiento en catálogos**: cuando hay variaciones de un mismo producto con cifras o precios diferentes (por ejemplo, "5 dollar deposit casino" vs "50 dollar deposit casino"), el modelo tiende a fusionarlas, por lo que se recomienda extraer variables numéricas antes de la predicción.
- **Auditoría de contenido multilingüe**: sirve para verificar si consultas equivalentes en ruso, ucraniano o inglés deben compartir página o tener versiones separadas.
- **Automatización de pipelines de SEO**: como capa intermedia entre la extracción de consultas y la generación de un plan de contenidos, permite reducir el trabajo manual de revisión de pares de consultas.
- **Evaluación de cobertura de keywords**: al comparar consultas de un sitio con las de la competencia, el modelo ayuda a detectar si una misma página debería cubrir términos que actualmente se consideran separados.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en un test de 2.475 pares no vistos durante el entrenamiento (sin solapamiento con los pares de entrenamiento):

| Método | Precisión | Recall | F1 | Exactitud |
|---|---|---|---|---|
| Embeddings del modelo base + umbral ajustado | 75,7% | 79,1% | 77,4% | 77,1% |
| **kwtopic-pairs (cross-encoder)** | **82,9%** | **84,0%** | **83,4%** | **83,4%** |

Además, el autor muestra una mejora en el F1 del plan de contenidos en una nicho médico: pasa del 59% al 83,7% al usar el modelo para separar grupos, y del 37,5% al 57,4% en recall al fusionar grupos. No se han publicado resultados comparativos con otros cross-encoders específicos para keyword clustering.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 117 millones de parámetros en FP32, ocupa aproximadamente 470 MB de VRAM. En FP16 (si se convierte) serían ~235 MB. Es viable en cualquier GPU con al menos 2 GB de VRAM.
- **GPU recomendadas**: funciona en GPUs de consumo como RTX 3060, RTX 4060 o superiores. El autor entrenó en una RTX 4090, pero la inferencia es ligera.
- **¿Cabe en GPU de consumo?**: sí, cabe en cualquier GPU moderna, incluso en CPU si se usa la versión cuantizada, aunque no se publican cuantizaciones oficiales.
- **Opciones de despliegue**: se puede usar con la librería `sentence-transformers` en Python, o servir con `text-embeddings-inference` (indicado en los tags de HuggingFace). También es compatible con `FastAPI` y pipelines de automatización como n8n.
- **Latencia y throughput**: para un batch de pares de consultas cortas (64 tokens), la inferencia en GPU tarda milisegundos por par. El autor indica que para un núcleo de 30.000 consultas se generan del orden de cien mil pares candidatos y se procesan en minutos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| **kwtopic-pairs** | Cross-encoder | 117,6 M | 64 tokens | ru, uk, en | Apache-2.0 | Especializado en keyword clustering, entrenado con pares etiquetados por humanos |
| `paraphrase-multilingual-MiniLM-L12-v2` | Bi-encoder | 117,6 M | 512 tokens | 50+ idiomas | Apache-2.0 | Modelo base, genera embeddings; requiere umbral ajustado para clustering |
| `cross-encoder/ms-marco-MiniLM-L-12-v2` | Cross-encoder | 117,6 M | 512 tokens | en | Apache-2.0 | Reranker general para búsqueda, no específico para keyword clustering |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Bi-encoder | 117,6 M | 512 tokens | 50+ idiomas | Apache-2.0 | Base del modelo, no clasifica pares de consultas directamente |

No hay datos de rendimiento comparativo directo de kwtopic-pairs con otros cross-encoders en tareas de keyword clustering, más allá de la comparación con su propia base bi-encoder en la model card.

## Limitaciones y advertencias

- **Fusión de pares que difieren solo en número, geografía o marca**: el modelo tiende a asignar alta probabilidad de misma página a consultas que comparten el mismo patrón pero cambian una variable (por ejemplo, "доставка пиццы киев" y "доставка пиццы харьков" obtiene 0.98, cuando deberían ser páginas separadas por geografía). El autor recomienda extraer estas variables como un capa de factos antes de usar el modelo.
- **Desconocimiento de nichos específicos**: el entrenamiento cubre servicios, medicina, B2B y medios; no funciona bien en catálogos de productos donde los nombres de marca o los modelos son variables importantes.
- **Riesgo de alucinación**: al ser un clasificador binario, no genera texto, por lo que no hay riesgo de alucinación en el sentido clásico; el riesgo es la clasificación errónea de pares ambiguos.
- **Longitud de contexto limitada**: entrada truncada a 64 tokens; no apto para consultas largas o contextos de párrafo.
- **Uso restringido a pipelines de clustering**: no debe usarse como reranker general de búsqueda o para otras tareas de ranking.
- **Licencia Apache-2.0**: permite uso comercial, pero no hay garantía de soporte ni mantenimiento del autor.
- **Modelo con 0 descargas**: es un modelo reciente sin adopción pública, por lo que no hay experiencia de uso en producción más allá de las pruebas del autor.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Krasovskiy/kwtopic-pairs)
- [Perfil del autor en HuggingFace](https://huggingface.co/Krasovskiy)
- [Sitio web del autor (Andrey Krasovskiy)](https://www.krasovskiy.team/)
- [Modelo base: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
