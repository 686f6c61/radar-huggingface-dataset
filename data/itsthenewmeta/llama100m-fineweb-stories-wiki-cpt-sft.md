# itsthenewmeta/llama100m-fineweb-stories-wiki-cpt-sft

## Resumen

`llama100m-fineweb-stories-wiki-cpt-sft` es un modelo de lenguaje de 106.580.736 parámetros (unos 106,6 millones) publicado por el usuario `itsthenewmeta` en Hugging Face. Se trata de la etapa de ajuste supervisado (SFT, *supervised fine-tuning*) de un modelo base de la familia Llama que, según el propio identificador del repositorio, fue preentrenado sobre FineWeb junto con corpus de relatos (*stories*) y Wikipedia, y posteriormente sometido a un preentrenamiento continuado (*cpt*, *continued pre-training*). El resultado es un modelo pequeño, de tipo denso, orientado a la investigación y a experimentos educativos más que a producción a gran escala.

El problema que aborda es el del ciclo completo de entrenamiento de un modelo instructivo a pequeña escala: partir de un corpus general, continuar el preentrenamiento con dominios específicos (narrativa y conocimiento enciclopédico) y cerrar con un ajuste supervisado sobre conversaciones. Para esta última fase se ha utilizado el conjunto de datos `HuggingFaceTB/smol-smoltalk`, con una plantilla de chat `User/Assistant` y cálculo de pérdida únicamente sobre los turnos del asistente, una práctica habitual para evitar que el modelo aprenda a reproducir las intervenciones del usuario.

Su relevancia es fundamentalmente metodológica: documenta de forma detallada cada etapa del entrenamiento (número de conversaciones, hiperparámetros, hardware) y sirve como banco de pruebas reproducible para pipelines de ajuste, herramientas de inferencia ligera y flujos de trabajo sobre GPU de AMD. No obstante, el repositorio no declara licencia, idiomas soportados ni longitud de contexto, y no incluye resultados de evaluación, por lo que no debe considerarse un modelo validado para uso comercial o para tareas críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (etiqueta `llama` en el repositorio); número de capas, dimensión oculta y cabezas de atención no disponible |
| Parametros totales | 106.580.736 (≈106,6 M), dato extraído de los pesos en safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; las secuencias del SFT se filtraron a un máximo de 512 tokens |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no declarado; los corpus indicados en el nombre del modelo (FineWeb) y el dataset de SFT (smol-smoltalk) son mayoritariamente en inglés, por lo que el soporte multilingüe es previsiblemente limitado |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Etapa | SFT sobre el modelo base hermano de la etapa `pretrain` |
| Dataset de SFT | HuggingFaceTB/smol-smoltalk, plantilla de chat User/Assistant |
| Precisión de entrenamiento | bfloat16 |
| Hardware de entrenamiento | AMD Radeon RX 9070 XT (ROCm 2.12.0+rocm10.0.0) |
| Descargas / likes | 0 / 0 |
| Fecha de creación (repo) | 2026-09-28 |
| Última actualización (repo) | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura declarada es la de Llama, es decir, un transformer decoder-only con atención causal, normalización previa a cada subcapa y activaciones tipo SwiGLU, en su variante densa. El repositorio no publica el `config.json` con el detalle de capas, dimensión de modelo, número de cabezas ni tamaño de vocabulario, de modo que esos parámetros concretos no están disponibles. Con 106,6 millones de parámetros y un peso total de 0,4 GB en el repositorio, se trata de un modelo claramente orientado a entornos con recursos limitados.

El entrenamiento consta de dos fases identificables. La primera es un preentrenamiento continuado (`cpt`) sobre una mezcla de FineWeb, corpus de relatos y Wikipedia, partiendo de un modelo base que el autor referencia como etapa `pretrain` hermana. La segunda es el ajuste supervisado sobre `HuggingFaceTB/smol-smoltalk`: de 389.857 conversaciones bien formadas se conservaron 97.972 (las de 512 tokens o menos) y se descartaron 291.373. El entrenamiento duró 2 épocas (3.062 pasos), con un tamaño de lote efectivo de 64 ejemplos por paso (16 × 4 de acumulación de gradiente), tasa de aprendizaje de 5e-05, 3 % de calentamiento seguido de decaimiento coseno y optimizador AdamW con decaimiento de peso de 0,1. La pérdida final registrada fue de 1,1278773498535157, con 0,87 segundos por paso y un tiempo total de 44 minutos y 22 segundos sobre una AMD Radeon RX 9070 XT en precisión bfloat16 con ROCm.

Como innovaciones técnicas destacables, el autor aplica la pérdida únicamente sobre los turnos del asistente, lo que evita que el modelo aprenda a generar las intervenciones del usuario y es el estándar en el ajuste de modelos conversacionales. La plantilla de chat está fijada en `tokenizer_config.json` con el formato `<s>User: {question}\nAssistant:`.

## Capacidades

- Generación de texto conversacional en formato de turnos User/Assistant, siguiendo la plantilla de chat definida por el autor.
- Seguimiento de instrucciones básicas en inglés, adquirido a partir de `smol-smoltalk`.
- Generación de texto narrativo, favorecida por el preentrenamiento continuado sobre corpus de relatos.
- Respuestas de tipo enciclopédico o de conocimiento factual simple, derivadas del preentrenamiento sobre Wikipedia.
- Continuación y reescritura de texto corto, limitada en la práctica a secuencias del orden de 512 tokens.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso o modo de pensamiento explícito (*thinking*).
- No hay evidencia publicada de capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe no declarada y previsiblemente muy limitada fuera del inglés.

## Casos de uso

- Prototipado educativo de pipelines de ajuste: dado que el autor documenta hiperparámetros, número de ejemplos y tiempos, el modelo sirve como referencia para reproducir un ciclo completo de preentrenamiento continuado más SFT en una sola GPU de gama alta de consumo.
- Generación de texto narrativo corto: el preentrenamiento sobre corpus de relatos lo hace adecuado para completar fragmentos de ficción de menos de 500 tokens, siempre con revisión humana posterior.
- Chatbot ligero embebido o en el borde: con unos 213 MB de pesos en bfloat16 puede ejecutarse en dispositivos con poca memoria, lo que permite prototipos de asistente conversacional local sin conexión.
- Generación de datos sintéticos para experimentos: puede producir borradores de diálogo o de texto enciclopédico que después se filtran, se corrigen o se usan como material de arranque en tareas de etiquetado.
- Evaluación de infraestructura de inferencia sobre AMD: al haber sido entrenado con ROCm en una RX 9070 XT, es un candidato razonable para validar pilas de servicio, conversión de pesos y rutas de cuantización en hardware AMD antes de escalar a modelos mayores.
- Investigación sobre alineación y destilación: por su tamaño reducido resulta útil como modelo alumno en experimentos de destilación o como sujeto de estudio de cómo el SFT sobre un dataset pequeño modifica el comportamiento del modelo base.
- Pruebas de integración en pipelines de CI/CD de equipos de ML: su huella de memoria mínima permite incluirlo en pruebas automatizadas de tokenización, plantillas de chat, serialización de safetensors y compatibilidad con librerías de inferencia.
- Clasificación y extracción mediante *prompting*: con pocas etiquetas de contexto puede usarse para tareas simples de categorización de texto, asumiendo una precisión baja y la necesidad de validación en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento (pérdida final de 1,1278773498535157 sobre los turnos del asistente) y no incluye evaluaciones tipo MMLU, HumanEval, GSM8K, ARC ni HellaSwag, ni comparaciones con otros modelos. Tampoco se han publicado mediciones de latencia o de tokens por segundo en inferencia.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 213 MB en bfloat16 o float16, unos 426 MB en float32, en torno a 107 MB en int8 y alrededor de 55 MB en int4 (estas cifras son estimaciones calculadas a partir del número de parámetros, no datos publicados por el autor).
- Memoria adicional necesaria: caché KV y activaciones, que en un modelo de este tamaño son del orden de decenas o pocos cientos de megabytes según lote y longitud de secuencia; el total se mantiene por debajo de 1-2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es más que suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para un modelo de 106 M de parámetros. También es viable en iGPU y en GPU integradas.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos diez años, y también en CPU (ejecución en CPU perfectamente factible con llama.cpp o PyTorch).
- Opciones de despliegue: Hugging Face Transformers es la vía directa, puesto que los pesos están en safetensors. vLLM y TGI soportan la arquitectura Llama y podrían servir el modelo. Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, ya que el repositorio no publica archivos cuantizados.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token; en cualquier caso, con 106 M de parámetros el rendimiento esperado en GPU moderna es alto, pero no hay datos verificables que lo confirmen.
- Nota sobre entrenamiento: el ajuste se realizó en bfloat16 sobre una AMD Radeon RX 9070 XT con ROCm, con 0,87 segundos por paso y 3.062 pasos en 44 minutos y 22 segundos.

## Comparativa con modelos similares

No se dispone de resultados de evaluación del modelo analizado, por lo que la comparación se limita a características estructurales. Los datos de los modelos alternativos corresponden a información pública general y no proceden de la búsqueda realizada.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Observaciones |
|---|---|---|---|---|---|
| itsthenewmeta/llama100m-fineweb-stories-wiki-cpt-sft | ≈106,6 M | no disponible | no disponible | safetensors | Sin benchmarks publicados; ajustado sobre smol-smoltalk |
| SmolLM2-135M-Instruct | ≈135 M | no disponible en esta ficha | licencia Apache 2.0 según información pública | safetensors y GGUF | Alternativa directa de tamaño similar, con versiones cuantizadas publicadas |
| Qwen2.5-0.5B-Instruct | ≈494 M | no disponible en esta ficha | licencia Apache 2.0 según información pública | safetensors y GGUF | Modelo mayor, con soporte multilingüe declarado |
| GPT-2 (124M) | 124 M | 1.024 tokens | licencia MIT según información pública | safetensors y GGUF | Referencia histórica de tamaño comparable, no ajustado para diálogo |

La comparación de rendimiento entre estos modelos no es posible con la información disponible, ya que el modelo objeto de esta ficha carece de evaluaciones publicadas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse una licencia en el repositorio, no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Ausencia total de benchmarks: no existen datos públicos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que el rendimiento real es desconocido y no puede compararse con alternativas.
- Riesgo elevado de alucinación: con 106,6 millones de parámetros, la capacidad de retener conocimiento factual es muy limitada, especialmente en tareas que requieran razonamiento encadenado o matemáticas.
- Sesgos desconocidos: no se documenta la composición exacta de los corpus de preentrenamiento (FineWeb, relatos, Wikipedia) ni se han realizado análisis de sesgo o de toxicidad.
- Limitación de contexto: aunque la longitud de contexto oficial no está declarada, el filtrado del SFT a 512 tokens implica que el modelo no ha sido entrenado para diálogos largos y su comportamiento más allá de esa longitud no está validado.
- Sesgo hacia el inglés: tanto FineWeb como smol-smoltalk son mayoritariamente anglófonos, por lo que el rendimiento en castellano u otros idiomas será probablemente deficiente.
- Trazabilidad limitada del preentrenamiento: el autor no publica detalles sobre el número de tokens, la proporción de cada fuente ni la etapa `pretrain` hermana, lo que dificulta la reproducibilidad completa.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado su funcionamiento ni reportado errores.
- Idoneidad para producción: dadas las limitaciones anteriores, el modelo es apropiado para investigación, docencia y prototipado, pero no para tareas críticas, atención al cliente real ni generación de contenido publicado sin revisión humana.
- Fechas del repositorio: la creación y la actualización figuran como 2026-09-28, una fecha que conviene verificar al consultar el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsthenewmeta/llama100m-fineweb-stories-wiki-cpt-sft
- Dataset de ajuste supervisado: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Perfil del autor en Hugging Face (URL derivada del identificador del repositorio): https://huggingface.co/itsthenewmeta
- Repositorio de la etapa `pretrain` hermana: no disponible, mencionado en la model card pero sin enlace proporcionado
- Paper, blog, repositorio de código o demo: no disponible
