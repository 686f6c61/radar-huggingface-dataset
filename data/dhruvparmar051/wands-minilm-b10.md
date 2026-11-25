# DhruvParmar051/wands-minilm-b10

## Resumen
wands-minilm-b10 es un modelo de embeddings de frases (bi-encoder) obtenido por fine-tuning de `sentence-transformers/all-MiniLM-L6-v2` sobre el conjunto de datos WANDS (Wayfair ANnotation Dataset), orientado a la búsqueda de productos de muebles y artículos para el hogar. Lo publica DhruvParmar051 como parte de un proyecto de curso (IT594, junto a Khushali Mandalia) sobre búsqueda en comercio electrónico con preservación de restricciones, donde el modelo actúa como primera etapa densa de un recuperador híbrido BM25 + denso seguido de un cross-encoder.

El modelo mantiene la arquitectura BERT de 6 capas del base, con 22.713.216 parámetros totales y pesos en safetensors, y se distribuye a través de la librería sentence-transformers con licencia Apache 2.0. Su relevancia es acotada pero concreta: demuestra cómo un fine-tuning ligero (3 épocas sobre 192 consultas) mejora de forma medible la recuperación densa en un dominio vertical muy específico, sin necesidad de grandes recursos de entrenamiento (se entrenó en una GPU de Apple con PyTorch MPS en fp32).

Es un modelo monolingüe (inglés), de propósito muy restringido, pensado para investigación y evaluación de pipelines de búsqueda de productos, no como modelo de propósito general. Incluye además cinco modelos de fold (`folds/fold0` a `folds/fold4`) para validación cruzada, cada uno con su `training.json` con configuración e historial de pérdida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder tipo BERT (base: all-MiniLM-L6-v2) |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max sequence length de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors fp32; compatible con text-embeddings-inference) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un bi-encoder basado en `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT de 6 capas y 384 dimensiones de embedding. Genera embeddings normalizados de consultas y productos que se comparan por similitud coseno. Los productos se codifican concatenando `product_name`, `product_class` y la jerarquía de categorías con el separador `" . "` (sustituyendo `/` por espacio en la categoría); las consultas se codifican tal cual.

El entrenamiento usa las 192 consultas del split de desarrollo del proyecto WANDS (el split de test nunca se usó para entrenar ni para elegir hiperparámetros). Los positivos son productos etiquetados como Exact y los negativos duros son productos etiquetados como Irrelevant dentro del top 100 del modelo zero-shot; los productos Partial no se usan. La función de pérdida es multiple-negatives ranking loss con similitud coseno y escala 20, un ejemplo por consulta en lotes de 32, con 32 pares (positivo, negativo duro) por consulta y época. La configuración es de 3 épocas, learning rate 2e-5, weight decay 0.01, warm-up del 10 %, longitud máxima de secuencia 256, gradient clipping de 1.0 y semilla 42, fijada antes del entrenamiento y no ajustada sobre los folds. El entrenamiento se ejecutó en una GPU de Apple con PyTorch MPS en fp32.

## Capacidades
- Generación de embeddings de frases para similitud semántica y recuperación densa (feature-extraction, sentence-similarity).
- Búsqueda de productos de muebles y artículos para el hogar en inglés, con codificación específica de nombre, clase y jerarquía de categorías.
- Recuperación como primera etapa densa dentro de un pipeline híbrido con BM25 (fusión RRF, k = 60).
- Integración con sentence-transformers y con text-embeddings-inference (endpoints compatibles).
- Validación cruzada de 5 folds mediante los submodelos `folds/fold0` a `folds/fold4`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso
- Búsqueda de productos en catálogos de muebles: el modelo codifica consultas y productos (nombre, clase y categoría) para recuperar candidatos por similitud coseno, sirviendo como primera etapa densa de un recuperador.
- Pipeline híbrido de recuperación: combinado con BM25 mediante RRF (k = 60) para mejorar el recall en consultas con vocabulario específico de muebles, como demuestran los resultados del proyecto.
- Reordenación con cross-encoder: el modelo alimenta un cross-encoder (ms-marco-MiniLM-L-6-v2) que refina los resultados; el proyecto reporta nDCG@10 de 0.769 en test con esta combinación.
- Evaluación de sistemas de búsqueda en investigación: permite reproducir y comparar configuraciones (denso solo, híbrido, híbrido + cross-encoder) sobre WANDS con números out-of-fold en dev.
- Deduplicación y agrupación de fichas de producto: los embeddings normalizados permiten calcular similitud entre productos de la misma categoría para detectar duplicados o variantes.
- Búsqueda semántica en prototipos de e-commerce: al ser un modelo de 22,7 M de parámetros con pesos safetensors, se puede desplegar en entornos modestos para validar flujos de búsqueda antes de escalar a modelos mayores.

## Benchmarks y rendimiento
Resultados publicados en la model card sobre WANDS, métrica nDCG@10. Los valores de dev son out-of-fold (cada consulta la responde el fold que no la entrenó); los de test usan el modelo raíz en una única ejecución sobre 288 consultas.

| Sistema | Dev, zero-shot | Dev, este modelo | Test, zero-shot | Test, este modelo |
|---|---|---|---|---|
| Solo denso | 0.689 | 0.720 | 0.693 | 0.731 |
| Híbrido BM25 + denso (RRF, k = 60) | 0.740 | 0.742 | 0.729 | 0.743 |
| Híbrido + cross-encoder (ms-marco-MiniLM-L-6-v2) | 0.755 | 0.765 | 0.766 | 0.769 |

El fine-tuning mejora claramente el recuperador denso por sí solo (de 0.689 a 0.720 en dev; de 0.693 a 0.731 en test). Detrás del cross-encoder, la ganancia en test es pequeña (+0.002, IC 95 % [−0.004, +0.009]).

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; con 22,7 M de parámetros en fp32 los pesos ocupan aproximadamente 91 MB, más el overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no requiere A100 ni H100. El propio autor entrenó en una GPU de Apple (MPS) en fp32.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (el modelo está marcado como endpoints_compatible) y, en general, cualquier runtime compatible con safetensors/BERT.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| wands-minilm-b10 | 22.713.216 | 256 | apache-2.0 | Bi-encoder fine-tuneado para búsqueda de muebles (WANDS) |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible en la información | no disponible en la información | apache-2.0 | Bi-encoder general zero-shot, modelo base |
| cross-encoder ms-marco-MiniLM-L-6-v2 | no disponible en la información | no disponible en la información | no disponible en la información | Cross-encoder de reordenación usado en el mismo proyecto |

La comparación cuantitativa disponible es la de la tabla de benchmarks: frente al base zero-shot, el fine-tune mejora el denso solo (0.720 frente a 0.689 en dev; 0.731 frente a 0.693 en test) y aporta mejoras marginales dentro del pipeline híbrido con cross-encoder.

## Limitaciones y advertencias
- Entrenado solo con 192 consultas de un único catálogo de muebles de un minorista; no se espera que transfiera a otros dominios.
- El fine-tuning mejora la relevancia pero no resuelve restricciones duras de atributos (color, material, tamaño); eso lo gestiona un re-ranker separado en el proyecto.
- Modelo monolingüe (inglés); no soporta castellano ni otros idiomas.
- Ventana de contexto limitada a 256 tokens, adecuada para fichas de producto cortas pero no para documentos largos.
- Riesgo de sesgo heredado del catálogo y las anotaciones de WANDS, y de alucinación en el sentido de recuperar productos irrelevantes cuando la consulta queda fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 para el modelo; los datos WANDS se distribuyen bajo licencia MIT de Wayfair, con la cita académica correspondiente (Chen et al., ECIR 2022).
- Uso comercial permitido por licencia, pero la utilidad práctica fuera del dominio de muebles en inglés es muy limitada; conviene validar con datos propios antes de producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DhruvParmar051/wands-minilm-b10
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset WANDS (Wayfair): https://github.com/wayfair/WANDS
- Paper WANDS: Chen, Liu, Liu, Sun, Baltrunas y Schroeder, "WANDS: Dataset for Product Search Relevance Assessment", ECIR 2022 (referenciado en la model card; sin URL directa en la información proporcionada).
