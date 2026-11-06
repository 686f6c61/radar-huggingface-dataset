# nimishph/anvesa-code-400m

## Resumen

anvesa-code-400m es un encoder especializado en búsqueda de código (code retrieval) desarrollado por nimishph como componente del sistema anvesa, una herramienta de búsqueda semántica sobre repositorios. Se construye a partir de jhu-clsp/ettin-encoder-400m —un encoder de la familia ModernBERT con licencia MIT— mediante fine-tuning sobre 105 repositorios con licencia MIT, usando como profesor (destilación) un fine-tune de mayor tamaño, de 1B de parámetros.

El modelo resuelve un problema concreto: indexar y recuperar símbolos de código (funciones, clases, métodos) a partir de consultas en lenguaje natural o fragmentos de código. Genera embeddings de 512 tokens con mean pooling sobre tokens reales y normalización L2, sin prefijos de instrucción, lo que simplifica su integración en pipelines de recuperación densa. Se distribuye en formato ONNX en fp32, lo que permite ejecución en CPU sin GPU.

Su relevancia radica en que ofrece un encoder compacto (~400M parámetros) con rendimiento superior a alternativas generalistas como all-MiniLM-L6-v2 en tareas de code search, con un coste de inferencia de 98 ms por tarjeta de símbolo en CPU (ONNX Runtime, 12 hilos). El repositorio incluye además un ranker XGBoost (`ranker-noword.json`) que reordena los resultados de primera etapa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base jhu-clsp/ettin-encoder-400m |
| Parametros totales | no disponible (modelo base de ~400M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (ONNX); no se documentan otras |
| Idiomas soportados | no disponible (entrenado sobre codigo en 13 lenguajes de programacion) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx_data`), `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/ettin-encoder-400m, un encoder de la familia ModernBERT orientado a recuperación, y se fine-tunea como encoder de code search. El entrenamiento utiliza 105 repositorios con licencia MIT y emplea destilación desde un fine-tune de 1B de parámetros que actúa como profesor. El pooling es mean pooling sobre tokens reales (excluyendo padding), seguido de normalización L2; no se usan prefijos de instrucción ni de tarea.

El modelo está diseñado para embeber las "symbol cards" de anvesa sin su línea de ruta WQL, es decir, tarjetas que describen símbolos de código. Adicionalmente, el autor publica `ranker-noword.json`, un ranker XGBoost entrenado sobre las puntuaciones de este encoder con 20 características y sin solapamiento de palabras, destinado al `experimental.learnedRanker` de anvesa. No se documentan detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de embeddings densos para recuperación de código (feature-extraction).
- Búsqueda semántica de símbolos de código a partir de consultas en lenguaje natural o fragmentos de código.
- Indexación de repositorios: genera representaciones vectoriales de funciones, clases y métodos.
- Reordenación de resultados mediante el ranker XGBoost incluido (`ranker-noword.json`).
- Soporte de 13 lenguajes de programación en el corpus de evaluación (según la model card).
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, agentes, generación de texto ni razonamiento multi-paso: es exclusivamente un encoder de recuperación.

## Casos de uso

- Búsqueda de código en repositorios: indexar los símbolos de un proyecto y permitir consultas en lenguaje natural ("función que valida un JWT") devolviendo las definiciones relevantes; el contexto de 512 tokens cubre la mayoría de tarjetas de símbolos.
- Asistentes de documentación interna: generar un índice semántico de funciones y clases para que los desarrolladores localicen implementaciones sin conocer el nombre exacto.
- Integración en pipelines de CI/CD: detectar duplicados o código similar entre repositorios comparando embeddings de símbolos antes de fusionar ramas.
- Herramientas de navegación de código en el IDE: alimentar un plugin que sugiera definiciones relacionadas mientras se escribe, con latencia de ~98 ms por tarjeta en CPU.
- Construcción de bases de conocimiento de APIs: embeber firmas y descripciones de funciones para un buscador interno de endpoints y utilidades.
- Reordenación de resultados en motores de búsqueda de código existentes: usar el ranker XGBoost sobre las puntuaciones del encoder para mejorar la precisión de la primera etapa.
- Análisis de similitud entre proyectos: comparar los embeddings de símbolos de dos repositorios para identificar patrones o componentes reutilizables.

## Benchmarks y rendimiento

| Metrica | first stage (hub penalty 0.3) | con ranker |
|---|---|---|
| Corpus test (1.710 consultas generadas, 57 repos, 13 lenguajes) | 0.349 | 0.369 |
| Bench (241 consultas escritas a mano, 8 repos) | 0.684 | 0.682 |

Comparación indicada en la model card: all-MiniLM-L6-v2 obtiene 0.293 y 0.547 respectivamente sin ranker. No se especifica la métrica exacta (probablemente nDCG o recall@k); no disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la configuración publicada (ONNX fp32 para CPU); el repositorio ocupa 1,6 GB.
- GPU recomendadas: no documentadas; al ser ONNX puede ejecutarse con CUDA/TensorRT si se configura, pero no se especifican requisitos.
- Cabe en GPU de consumo: sí, con ~400M parámetros en fp32 (aproximadamente 1,6 GB de pesos), cabe en cualquier GPU con 2 GB o más de VRAM.
- Opciones de despliegue: ONNX Runtime (CPU, 12 hilos documentados), compatible con `text-embeddings-inference` y `endpoints_compatible` según los tags de Hugging Face.
- Latencia: 98 ms por tarjeta de símbolo en CPU con ONNX Runtime y 12 hilos. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (corpus test / bench) | Licencia | Formato |
|---|---|---|---|---|---|
| anvesa-code-400m | ~400M | 512 | 0.349 / 0.684 | MIT | ONNX |
| all-MiniLM-L6-v2 | ~22M | 256 | 0.293 / 0.547 | Apache 2.0 | safetensors, ONNX |
| jhu-clsp/ettin-encoder-400m | ~400M | no disponible | no disponible | MIT | safetensors |

No se dispone de datos de benchmarks de otros encoders de code search comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un encoder de recuperación, no un modelo generativo: no produce texto, código ni respuestas.
- Longitud de contexto limitada a 512 tokens; símbolos o tarjetas más largas se truncan.
- Entrenado sobre 105 repositorios MIT y evaluado en 13 lenguajes; el rendimiento en lenguajes poco representados puede degradarse.
- El corpus de evaluación es pequeño (1.710 consultas generadas y 241 escritas a mano), por lo que las métricas pueden no generalizar a dominios muy distintos.
- Posible sesgo hacia el formato de "symbol cards" de anvesa: el modelo espera tarjetas sin la línea de ruta WQL, lo que limita su uso fuera de ese ecosistema.
- Licencia MIT permite uso comercial, pero el modelo base (ettin-encoder-400m) también es MIT; no se documentan restricciones adicionales.
- Riesgo de falsos positivos en recuperación: al ser un encoder denso, puede devolver símbolos semánticamente cercanos pero funcionalmente distintos; se recomienda el ranker para mitigarlo.
- No se documentan idiomas naturales soportados; las consultas en lenguajes distintos del inglés no están evaluadas.

## Enlaces

- Hugging Face: https://huggingface.co/nimishph/anvesa-code-400m
- Repositorio anvesa: https://github.com/nimishph/anvesa
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-400m
