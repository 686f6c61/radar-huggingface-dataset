# QuerynAi/queryn-adapter-nemotron-1b-free_to_pplx-embed-1

## Resumen

Queryn adapter — `nemotron-1b-free` → `pplx-embed-1` es un adaptador de embeddings desarrollado por QuerynAi como parte del motor de traducción de embeddings Queryn. Su función es transformar los vectores generados por el modelo de embeddings `nemotron-1b-free` (de NVIDIA, 2048 dimensiones) al espacio vectorial del modelo `pplx-embed-1` (1024 dimensiones). Esto permite que un corpus ya indexado con `nemotron-1b-free` pueda servirse contra un índice construido con `pplx-embed-1` sin necesidad de re-embedding, lo que ahorra tiempo y coste computacional.

El modelo es una proyección lineal simple (arquitectura `linear`) con aproximadamente 2,1 millones de parámetros, exportada a formato ONNX (opset 17). Se entrenó sobre pares de embeddings de un corpus multi-dominio de unas 350 000 filas que abarca resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La métrica de calidad reportada es la similitud coseno media en el conjunto de test, con un valor máximo de 0,7881 en la época 15. El modelo se distribuye bajo licencia MIT y está pensado para ejecutarse con ONNX Runtime, incluso en CPU.

Este adaptador es relevante porque aborda un problema práctico de interoperabilidad entre sistemas de embeddings heterogéneos: en lugar de re-embedding masivo de corpus, se aplica una transformación ligera y rápida. Es una pieza de infraestructura para pipelines de búsqueda semántica y RAG que necesitan migrar entre modelos de embeddings sin perder la inversión en indexación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyección lineal (capa `linear` simple) |
| Parametros totales | ~2,1 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; opera sobre embeddings fijos) |
| Tipos de cuantizacion | No disponible (solo se publica el modelo ONNX en float32) |
| Idiomas soportados | No disponible (el adaptador es agnóstico al idioma; depende de los modelos fuente y destino) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, opset 17) |

## Arquitectura y entrenamiento

El adaptador es una proyección lineal que mapea un vector de entrada de 2048 dimensiones (embeddings de `nemotron-1b-free`) a un vector de salida de 1024 dimensiones (espacio de `pplx-embed-1`). El grafo ONNX normaliza internamente el vector de entrada con L2, por lo que no se requiere pre-normalización. La salida también se normaliza a norma unitaria. La arquitectura se eligió tras una ablación: la variante `linear` obtuvo una similitud coseno de 0,7881 frente a 0,7710 de la variante `deep` (MLP), por lo que se publicó la lineal.

El entrenamiento se realizó sobre pares de embeddings generados a partir de un corpus unificado multi-dominio (~350 000 filas) que incluye resúmenes de arXiv, jurisprudencia australiana, pasajes de SQuAD, resúmenes de PubMed y noticias de cripto/mercados. La función de pérdida fue `1 - media de similitud coseno`, con optimizador Adam y reducción de tasa de aprendizaje mediante `ReduceLROnPlateau`. Se guardó el checkpoint de la mejor época. Tanto la línea base lineal como el MLP se entrenaron para cada par de modelos, publicándose el de mayor puntuación (en caso de empate, se prefiere la lineal). El checkpoint fuente se convirtió a ONNX con torch 2.13.0 mediante un script de conversión propio.

## Capacidades

- Traducción de embeddings: transforma vectores de 2048 dimensiones del espacio `nemotron-1b-free` al espacio de 1024 dimensiones de `pplx-embed-1`.
- Normalización L2 integrada: el grafo normaliza tanto la entrada como la salida, garantizando vectores unitarios sin pasos adicionales.
- Ejecución en CPU: al ser un modelo pequeño (2,1M parámetros), puede ejecutarse con ONNX Runtime en CPU sin necesidad de GPU.
- Compatibilidad con batch dinámico: la dimensión de batch es dinámica, lo que permite procesar múltiples embeddings a la vez.
- Interoperabilidad entre índices: permite reutilizar un corpus ya embebido con `nemotron-1b-free` para servirlo contra un índice de `pplx-embed-1` sin re-embedding.
- Integración sencilla: se carga mediante `onnxruntime` y `huggingface_hub`, con una API de entrada/salida clara (`source_embedding` → `target_embedding`).

## Casos de uso

- Migración de índices de búsqueda semántica: si una organización tiene un corpus indexado con `nemotron-1b-free` y quiere cambiar a `pplx-embed-1` (por ejemplo, por coste o calidad), puede aplicar este adaptador a los embeddings existentes y actualizar el índice sin reprocesar el corpus completo.
- RAG multi-modelo: en un pipeline de generación aumentada por recuperación, se pueden combinar documentos embebidos con distintos modelos; el adaptador unifica los espacios vectoriales para que el recuperador funcione correctamente.
- Evaluación comparativa de embeddings: permite comparar la calidad de recuperación de `nemotron-1b-free` y `pplx-embed-1` sobre el mismo corpus sin re-embedding, usando el adaptador para alinear los espacios.
- Ahorro de coste en re-indexación: en entornos con grandes volúmenes de datos (millones de documentos), re-embedding es caro; el adaptador reduce el coste a una multiplicación matricial ligera.
- Integración en pipelines de datos: al ser un modelo ONNX, puede desplegarse en servicios de inferencia como parte de un flujo ETL que transforme embeddings almacenados en bases de datos vectoriales.
- Pruebas de interoperabilidad entre proveedores: si se usan APIs de embeddings de distintos proveedores (NVIDIA, Perplexity), el adaptador facilita la transición sin interrumpir el servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no es un LLM sino un adaptador de embeddings. La métrica de calidad reportada por el autor es la similitud coseno media en el conjunto de test:

| Métrica | Valor |
|---|---|
| Mejor similitud coseno en test (época 15) | 0,7881 |
| Similitud coseno de la variante `deep` (ablación) | 0,7710 |

No hay comparación con otros adaptadores similares en la información disponible. El repositorio de Queryn indica que el par `nemotron-1b-free` es el objetivo con peor rendimiento medio (0,688 en todos los pares fuente), y el peor par individual es `fastembed-bge-small → nemotron-1b-free` con 0,553. Estos datos provienen del análisis del proyecto, no de benchmarks formales.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; el modelo es una proyección lineal de 2,1M parámetros y se ejecuta en CPU.
- GPU recomendadas: ninguna; funciona con ONNX Runtime en CPU (por ejemplo, `CPUExecutionProvider`).
- Compatibilidad con hardware consumer: sí, cualquier CPU moderna es suficiente; el modelo ocupa unos pocos megabytes en disco (el repo tiene 0,0 GB según HuggingFace, aunque el archivo `model.onnx` debe descargarse).
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), también puede convertirse a otros formatos si se requiere, aunque no se proporcionan.
- Latencia y throughput: no se han publicado mediciones oficiales; dado el tamaño, la inferencia es del orden de microsegundos por vector en CPU.

## Comparativa con modelos similares

No hay modelos comparables directos en el sentido de adaptadores de embeddings publicados con la misma función. El proyecto Queryn publica una colección de adaptadores para distintos pares de modelos de embeddings (ver [Queryn Embedding Adapters](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)). Como referencia, se puede comparar con el enfoque de re-embedding directo:

| Enfoque | Parámetros | Coste de migración | Calidad |
|---|---|---|---|
| Adaptador Queryn (este modelo) | ~2,1M | Muy bajo (proyección lineal) | Similitud coseno 0,7881 |
| Re-embedding con `pplx-embed-1` | No aplica | Alto (reprocesar todo el corpus) | Referencia (sin pérdida) |
| Re-embedding con `nemotron-1b-free` | No aplica | Alto | Referencia (sin pérdida) |

La comparativa con otros adaptadores de la misma colección no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo de lenguaje: no genera texto ni razona; solo transforma embeddings. No debe usarse para tareas de generación o comprensión.
- Dependencia de los modelos fuente y destino: la calidad de la traducción depende de la calidad de los embeddings de `nemotron-1b-free` y de la compatibilidad entre espacios. La similitud coseno de 0,7881 indica una pérdida de fidelidad respecto al re-embedding directo.
- Rendimiento variable según dominio: el entrenamiento se hizo sobre dominios específicos (ciencia, legal, QA, medicina, finanzas); en dominios muy diferentes, la calidad puede degradarse.
- Sin soporte de cuantización: solo se publica en float32; no hay versiones cuantizadas para reducir aún más el tamaño o acelerar en hardware especializado.
- Sin información sobre sesgos: al ser un adaptador entrenado sobre pares de embeddings, no se han documentado sesgos específicos, pero hereda los sesgos de los modelos fuente y del corpus de entrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero hay que verificar las licencias de los modelos fuente (`nemotron-1b-free` y `pplx-embed-1`) si se usan en producción.
- Sin mantenimiento garantizado: el proyecto Queryn parece ser de un autor independiente; no hay garantía de soporte o actualizaciones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/QuerynAi/queryn-adapter-nemotron-1b-free_to_pplx-embed-1)
- [Colección de adaptadores Queryn](https://huggingface.co/collections/QuerynAi/queryn-embedding-adapters-6a9499470ee93453d02110b4)
- [Repositorio GitHub de Queryn](https://github.com/Gigadelux/Queryn)
- [Página de NVIDIA Nemotron](https://developer.nvidia.com/topics/ai/nemotron)
- [Repositorio GitHub de NVIDIA-NeMo/Nemotron](https://github.com/NVIDIA-NeMo/Nemotron)
- [Modelo nemotron-3-embed-1b en NVIDIA NIM](https://build.nvidia.com/nvidia/nemotron-3-embed-1b/deploy)
- [Página de nemotron-3-embed-1b en OpenRouter](https://openrouter.ai/nvidia/nemotron-3-embed-1b:free)
