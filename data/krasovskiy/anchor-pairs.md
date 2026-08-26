# Krasovskiy/anchor-pairs

## Resumen

`anchor-pairs` es un modelo cross-encoder de reranking desarrollado por Krasovskiy (Andrey Krasovskiy, AI Automation Engineer & Tech Lead) para resolver un problema específico de SEO técnico: determinar si dos consultas de búsqueda deben compartir una misma página web o requieren páginas distintas. No mide similitud semántica, sino que aprende de las decisiones que ya ha tomado el ranking orgánico, observando qué consultas realmente aparecen juntas en las mismas páginas de los competidores. El modelo está especializado en la vertical de juegos de azar y apuestas (gambling), donde fue entrenado y evaluado.

Se basa en `FacebookAI/xlm-roberta-base` y se ofrece como un cross-encoder de la librería `sentence-transformers` con el pipeline `text-ranking`. Tiene 278 millones de parámetros y una ventana de contexto estándar de XLM-RoBERTa (512 tokens). Su principal valor es que evita el coste de consultar el buscador para cada par de palabras clave, ya que el modelo aprende el patrón de solapamiento de resultados a partir de 1,2 millones de pares de consultas reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (transformer encoder) |
| Parametros totales | 278.044.417 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (estándar de XLM-RoBERTa) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; se puede cuantizar con herramientas de terceros) |
| Idiomas soportados | entrenado para inglés, pero basado en XLM-RoBERTa (multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## 3. Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura transformer de XLM-RoBERTa, un encoder multilingüe preentrenado por Facebook AI. A diferencia de un bi-encoder (que produce embeddings independientes para cada texto), el cross-encoder toma el par de consultas como una única secuencia de entrada y produce una puntuación de relevancia. Esto permite una interacción profunda entre los dos textos, pero es computacionalmente más costoso en inferencia.

El entrenamiento se realizó con **1,2 millones de pares de consultas** extraídos del comportamiento de competidores en el nicho de gambling, es decir, observando qué consultas realmente se agrupan en una misma página en sitios que ya tienen ranking. Los datos se prepararon con tres decisiones clave:
- **Split por grupos-páginas**, no por pares: se asegura que ninguna consulta aparezca a la vez en el conjunto de entrenamiento y en el de validación, para evitar que la métrica mida memoria en lugar de generalización.
- **Hard negatives**: los pares negativos se tomaron de consultas de páginas vecinas, no aleatorias, para evitar que el modelo aprenda trivialmente a distinguir con un saco de palabras.
- **Zona gris eliminada**: se descartaron pares con solapamiento de 2 a 6 URLs en el top-10, porque no hay una respuesta binaria clara.

No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con etiquetas binarias (misma página / distinta página) derivadas del solapamiento de resultados de búsqueda. La model card indica que el entrenamiento tarda **dos minutos en una sola NVIDIA RTX 4090**.

## 4. Capacidades

- **Clasificación binaria de pares de consultas**: decide si dos consultas deben compartir página o no.
- **Reranking / text-ranking**: puede usarse como reranker en pipelines de búsqueda para reordenar resultados.
- **Especialización en el sector gambling**: entrenado específicamente con consultas de casinos online, apuestas y juegos.
- **Robustez ante variaciones léxicas**: distingue entre consultas casi idénticas que requieren páginas distintas (p. ej., "casino ohne lizenz" vs "casino ohne einzahlung").
- **Tolerancia a la variación ortográfica**: reconoce que "1 dollar deposit" y "one dollar deposit" son la misma intención de búsqueda.
- **Sin soporte de tool calling ni agentes**: es un modelo de clasificación estático, no un LLM generativo.
- **No soporta visión ni audio**: solo texto.

## 5. Casos de uso

- **Clustering de palabras clave para SEO**: agrupar las consultas de un sitio web en futuras páginas, ahorrando el coste de consultas a la API de búsqueda para cada par.
- **Optimización de arquitectura de información**: decidir qué consultas deben tener una página dedicada y cuáles se pueden agrupar en una página común.
- **Análisis de intención de búsqueda**: identificar si dos consultas con redacción similar pero intención distinta (p. ej., "casino sin licencia" vs "casino sin depósito") merecen contenido separado.
- **Auditoría de solapamiento de contenido**: detectar páginas duplicadas o demasiado similares en un sitio web.
- **Automatización de tareas de SEO**: integrar el modelo en un pipeline de generación de contenido para evitar canibalización de palabras clave.
- **Investigación de mercado para el sector gambling**: analizar cómo los competidores estructuran sus páginas para un conjunto de consultas de alto valor.

## 6. Benchmarks y rendimiento

La model card proporciona resultados sobre una muestra de evaluación de 20.000 pares (42% positivos, con split por grupos-páginas y sin solapamiento entre entrenamiento y test). Se comparan tres modelos:

| Modelo | PR-AUC | Precisión a recall 0.8 |
|---|---|---|
| `bge-m3` (coseno de embeddings) | 0,9129 | 0,8670 |
| `bge-reranker-v2-m3` (reranker listo) | 0,9234 | 0,8749 |
| **anchor-pairs** | **0,9636** | **0,9637** |

La desviación entre tres semillas es de 0,0084, por lo que la mejora de 0,04 es significativa (5 veces el ruido). La model card no reporta MCC porque el umbral se ajustó sobre el conjunto de entrenamiento, lo que inflaba las estimaciones; los autores advierten de que el valor anterior (0,8065) se retiró por esa razón.

En **nichos distintos al gambling** (medicina, freelance, B2B, web studios, medios), el modelo es inferior a `bge-m3`: PR-AUC de 0,8723 frente a 0,9004. No se han publicado resultados de benchmarks adicionales en la información disponible.

## 7. Requisitos de hardware

- **VRAM estimada**: el modelo tiene 278M de parámetros. En FP16 ocupa aproximadamente 556 MB; en FP32 ~1,1 GB. Cabe en cualquier GPU consumer con 4 GB o más.
- **GPU recomendadas**: una NVIDIA RTX 4090 fue usada para el entrenamiento (2 minutos). Para inferencia, cualquier GPU con al menos 2 GB de VRAM es suficiente, e incluso se puede ejecutar en CPU.
- **Cabe en consumer GPU**: sí, en tarjetas como RTX 3060, RTX 4090, etc.
- **Opciones de despliegue**: dado que es un modelo de `sentence-transformers`, se puede servir con `text-embeddings-inference` (el repo es compatible con endpoints), o mediante `sentence-transformers` en Python. También se puede exportar a ONNX o cuantizar para `llama.cpp`, aunque no se documenta.
- **Latencia y throughput**: no se han publicado datos. Al ser un cross-encoder, la inferencia es más lenta que un bi-encoder (necesita procesar el par completo), pero para un volumen moderado de pares es viable.

## 8. Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | PR-AUC (gambling) | PR-AUC (otras nichos) | Licencia |
|---|---|---|---|---|---|---|
| **anchor-pairs** | Cross-encoder | 278M | 512 | 0,9636 | 0,8723 | Apache-2.0 |
| `bge-m3` | Bi-encoder | 570M | 8K | 0,9129 | 0,9004 | MIT |
| `bge-reranker-v2-m3` | Cross-encoder | 570M | 8K | 0,9234 | no disponible | MIT |

`bge-m3` es un modelo de embeddings multilingüe de BAAI, más generalista y con mayor contexto, pero inferior en la tarea específica de agrupación de consultas de gambling. `bge-reranker-v2-m3` es un reranker listo para usar, también mejor en el nicho de gambling que `bge-m3` pero por debajo de `anchor-pairs`. No se comparan con otros cross-encoders de tamaño similar (p. ej., `cross-encoder/ms-marco-MiniLM-L-6-v2`) en la información proporcionada.

## 9. Limitaciones y advertencias

- **Especialización en gambling**: el modelo funciona notablemente peor en otras verticales (medicina, freelance, B2B, etc.). No es un modelo general de agrupación de consultas.
- **Solo en inglés**: aunque la base XLM-RoBERTa es multilingüe, el entrenamiento se hizo con consultas en inglés; no se han evaluado otros idiomas.
- **Umbral dependiente del conjunto de datos**: el umbral de decisión (0.5) se ajustó sobre el conjunto de entrenamiento, y la model card advierte de que puede estar sobreestimado. Para producción, se recomienda recalibrar con un conjunto de validación separado.
- **No puede distinguir proveedores de juegos de casas**: por ejemplo, "netent casino" es una sección, no una marca; esa distinción requiere un diccionario externo, no el modelo.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo generativo.
- **Sesgos**: los datos provienen de competidores en el sector gambling, por lo que el modelo puede reflejar sesgos del mercado (por ejemplo, geografías o tipos de casinos).
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero la especialización en gambling puede no ser adecuada para todos los contextos.

## 10. Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Krasovskiy/anchor-pairs)
- [Perfil del autor en HuggingFace](https://huggingface.co/Krasovskiy)
- [Modelo hermano: `anchor-words`](https://huggingface.co/Krasovskiy/anchor-words) (etiquetado de palabras de consulta)
- [Modelo hermano: `kwcluster-variables`](https://huggingface.co/Krasovskiy/kwcluster-variables) (código del clusterizador y diccionarios)
- No se ha publicado ningún paper ni blog adicional en la búsqueda web.
