# FDS-Iterations/third-pass-feed-ranker-onnx

## Resumen

El modelo `FDS-Iterations/third-pass-feed-ranker-onnx` es una conversión a formato ONNX del cross-encoder de reranking `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, optimizada para inferencia en CPU. Lo desarrolla FDS-Iterations y su propósito es puntuar la relevancia entre un título de puesto de trabajo y una lista de publicaciones, para alimentar un sistema de ranking de feeds. Se distribuye en dos variantes: una en precisión fp32 y otra cuantizada dinámicamente a INT8, lo que reduce el tamaño del archivo en un factor de 4 (de ~471 MB a ~118 MB) manteniendo el orden de ranking.

El modelo está pensado para entornos de producción donde la latencia y el coste de CPU son críticos. Al ser un cross-encoder, procesa pares (título, post) y devuelve una puntuación de relevancia; la lógica de decisión de promoción (cuándo mover un elemento al primer puesto) queda fuera del modelo, tal como indica el autor en la model card. Está entrenado con datos sintéticos, por lo que el propio autor recomienda validarlo antes de usarlo en producción.

Es relevante ahora porque ofrece una alternativa ligera y rápida a los modelos de reranking en PyTorch, con soporte nativo de ONNX Runtime y Optimum, lo que facilita su integración en pipelines existentes. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa mini (MiniLMv2-L12-H384) |
| Parametros totales | no disponible (el modelo base mmarco-mMiniLMv2-L12-H384 tiene ~118 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso usa truncation a 160 tokens) |
| Tipos de cuantizacion | fp32 y int8 (dinamico) |
| Idiomas soportados | Multilingue (modelo base entrenado con datos de MS MARCO multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos `model.onnx` y `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de tipo transformer con arquitectura XLM-RoBERTa en versión mini (12 capas, 384 dimensiones ocultas), similar a MiniLMv2. A diferencia de los bi-encoders, que codifican por separado cada texto, un cross-encoder concatena ambos textos (título y post) y los procesa conjuntamente, lo que permite capturar interacciones finas entre ellos a costa de mayor coste computacional por par.

El entrenamiento se realizó con datos sintéticos (no se especifica el tamaño ni la composición del dataset). No se menciona si se usó RLHF o DPO; al ser un cross-encoder de re-ranking, lo habitual es entrenarlo con pares positivos y negativos mediante pérdida de ranking. El modelo original de la base (mmarco-mMiniLMv2-L12-H384-v1) fue entrenado sobre datos de MS MARCO multilingüe, pero el autor no detalla el proceso de fine-tuning específico para el feed ranking.

La principal innovación técnica de este repo no está en la arquitectura, sino en la optimización para inferencia: se proporciona una versión ONNX fp32 y una cuantizada dinámicamente a INT8, que acelera la inferencia en CPU entre 1.2× y 4× según el hardware, manteniendo las puntuaciones dentro de un margen de ~0.05 respecto a fp32 y preservando el orden de ranking.

## Capacidades

- Puntuación de relevancia entre un título de puesto y un post (cross-encoder).
- Re-ranking de feeds: dado un título y una lista de posts, genera una puntuación para cada par (mayor = más relevante).
- Inferencia rápida en CPU gracias a la cuantización INT8 y a ONNX Runtime.
- Integración con la librería `optimum` de Hugging Face mediante `ORTModelForSequenceClassification`.
- Compatibilidad con el tokenizer de XLM-RoBERTa (multilingüe).
- No soporta generación de texto, tool calling ni agentes; es un clasificador de secuencias puro.

## Casos de uso

- **Ranking de ofertas de empleo en un feed**: dado un perfil de usuario (por ejemplo, "Registered Nurse"), el modelo puntúa los posts de un feed para mostrar primero los más relevantes. Se integra como un paso de re-ranking tras una primera búsqueda de candidatos.
- **Moderación de contenido en portales de empleo**: se puede usar para filtrar o priorizar publicaciones que coincidan con el contexto de un puesto, reduciendo ruido en la experiencia del usuario.
- **Sistema de recomendación de noticias profesionales**: en una plataforma que agrupa noticias del sector sanitario o financiero, el modelo ordena los artículos según la relevancia con el perfil del usuario.
- **Optimización de newsletters**: el modelo puede puntuar y ordenar los enlaces o resúmenes que se envían en un boletín, priorizando los que se alinean con los intereses del suscriptor.
- **Búsqueda semántica interna en una empresa**: para recuperar y ordenar documentos internos (procedimientos, comunicados) según su relevancia con una consulta en lenguaje natural.
- **Evaluación de calidad de contenido**: al puntuar la relevancia entre un tema y un texto, se puede usar para filtrar contenido irrelevante antes de mostrarlo en un dashboard.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo MMLU, HumanEval o similares) en la información disponible. Los únicos datos de rendimiento son de throughput en CPU, extraídos de la model card:

| Build | Items/seg (CPU desktop, 8 threads) |
|---|---|
| ONNX fp32 | ~910 |
| ONNX INT8 | ~1080 (~1.2×) |

En CPUs de servidor con AVX-512 VNNI (p. ej., Intel Xeon Scalable), el speedup del INT8 es típicamente de 2–4×. La tasa absoluta depende de la longitud del texto procesado.

## Requisitos de hardware

- **VRAM**: no se requiere GPU; el modelo está pensado para CPU. El archivo INT8 ocupa ~118 MB y el fp32 ~471 MB en disco.
- **CPU recomendada**: cualquier CPU con soporte AVX2 o AVX-VNNI. Para aprovechar el speedup del INT8 se recomienda una CPU con AVX-512 VNNI (Intel Xeon Scalable o equivalentes).
- **GPU**: no es necesaria, aunque se puede ejecutar en GPU si se desea (ONNX Runtime soporta CUDA), pero no es el caso de uso previsto.
- **Opciones de despliegue**: ONNX Runtime mediante `optimum.onnxruntime` (`ORTModelForSequenceClassification`). También se puede usar con `onnxruntime` directamente.
- **Latencia y throughput**: en un desktop CPU con 8 hilos, el modelo INT8 procesa ~1080 pares por segundo. En servidores con AVX-512 VNNI, se espera una mejora adicional de 2–4×.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño (aprox.) | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| `FDS-Iterations/third-pass-feed-ranker-onnx` | Cross-encoder XLM-RoBERTa mini | ~118 M | no disponible | ONNX (fp32/int8) | Apache 2.0 |
| `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` (original) | Cross-encoder XLM-RoBERTa mini | ~118 M | 512 | PyTorch | Apache 2.0 |
| `cross-encoder/ms-marco-MiniLM-L6-v2` | Cross-encoder MiniLM-L6 | ~22 M | 512 | PyTorch | Apache 2.0 |

La diferencia principal con el modelo original es el formato y la optimización: el repo ONNX ofrece la misma calidad de puntuación (fp32) o ligeramente degradada (int8) pero con una inferencia más rápida en CPU. Comparado con `ms-marco-MiniLM-L6-v2`, el modelo de FDS-Iterations es más grande pero soporta multilingüismo, mientras que el MiniLM-L6 está orientado a inglés.

## Limitaciones y advertencias

- Entrenado con **datos sintéticos**: el autor advierte explícitamente que hay que validar el modelo con datos reales antes de usarlo en producción.
- La lógica de decisión (cuándo promover un post al slot 1) **no está incluida** en el modelo; debe implementarse externamente.
- La cuantización INT8 produce puntuaciones que difieren en ~0.05 de fp32, aunque el orden de ranking se preserva en general; en casos límite puede alterar el resultado.
- No hay información sobre sesgos lingüísticos o culturales, aunque al ser un modelo multilingüe basado en XLM-RoBERTa, puede tener un rendimiento desigual entre idiomas.
- Riesgo de alucinación: no aplica directamente, pero al ser un clasificador, puede generar puntuaciones inconsistentes si el texto de entrada es muy diferente de los datos de entrenamiento.
- No se especifica la longitud máxima de contexto del tokenizer; el ejemplo usa truncation a 160 tokens, pero el modelo base soporta hasta 512.
- No se proporcionan datos de calidad (benchmarks) sobre la tarea de feed-ranking; la efectividad real debe medirse en el dominio de aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FDS-Iterations/third-pass-feed-ranker-onnx
- Modelo base: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
- Documentación de ONNX Runtime: https://onnxruntime.ai/
- Librería Optimum: https://huggingface.co/docs/optimum
- ONNX Model Zoo (referencia general): https://github.com/onnx/models
