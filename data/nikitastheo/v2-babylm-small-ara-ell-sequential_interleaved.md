# nikitastheo/v2-babylm-small-ara-ell-sequential_interleaved

## Resumen

Este modelo es un pequeño transformer causal de tipo GPT-2, entrenado específicamente para el desafío BabyLM, una iniciativa que busca mejorar el aprendizaje del lenguaje en modelos con cantidades limitadas de datos, simulando la exposición lingüística de un bebé. El modelo ha sido desarrollado por Nikitas Theodoropoulos y está diseñado para procesar texto en árabe y griego mediante una estrategia de entrenamiento secuencial e intercalada entre ambos idiomas.

Con 38,5 millones de parámetros, se trata de un modelo compacto orientado a la investigación en eficiencia de entrenamiento y multilingüismo de bajos recursos. Su relevancia radica en que explora cómo el cambio de idioma durante el entrenamiento afecta al aprendizaje, un área poco estudiada en el contexto de modelos pequeños. El modelo está disponible en formato safetensors y es compatible con la librería transformers de Hugging Face, así como con soluciones de inferencia como text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder causal) |
| Parametros totales | 38.497.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuracion base GPT-2 small, presumiblemente 1024) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe, griego |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 small, un transformer decoder causal con atención por capas y normalización previa. El entrenamiento se realizó con el script `train_clm.py` de Hugging Face Accelerate, sin utilizar la clase `Trainer`. El tokenizador empleado es `nikitastheo/babylm-ara-tokenizer`, específico para los idiomas árabe y griego.

El entrenamiento se llevó a cabo durante 23.440 pasos con una tasa de aprendizaje de 0,0001, programada con un scheduler lineal y 2.344 pasos de warmup. El tamaño de lote por dispositivo fue de 32, sin acumulación de gradientes. Un aspecto destacable es la estrategia de cambio de idioma: cada 10 épocas, el modelo alterna entre árabe y griego de forma secuencial e intercalada, lo que constituye la principal innovación experimental de este trabajo.

## Capacidades

- Generación de texto causal en árabe y griego.
- Modelado de lenguaje autoregresivo básico, adecuado para tareas de continuación de texto.
- Capacidad limitada de razonamiento debido a su pequeño tamaño (38,5 M de parámetros).
- Sin soporte para tool calling, function calling ni capacidades de agente.
- Sin capacidades multimodales (solo texto).
- Multilingüismo restringido a dos idiomas: árabe y griego.

## Casos de uso

- Investigación académica en aprendizaje de idiomas de bajos recursos: el modelo permite estudiar cómo el entrenamiento intercalado entre dos idiomas afecta a la representación lingüística compartida, algo útil para tesis y artículos científicos.
- Evaluación de estrategias de curriculum learning: su configuración de cambio de idioma por épocas lo convierte en un banco de pruebas para comparar distintas políticas de alternancia lingüística.
- Línea base para modelos BabyLM: sirve como referencia para comparar arquitecturas o estrategias de entrenamiento más avanzadas dentro del desafío BabyLM.
- Prototipado de aplicaciones de generación de texto en árabe y griego: aunque limitado, puede usarse para demostraciones educativas o pruebas de concepto en entornos sin requisitos de calidad elevados.
- Análisis de transferencia entre lenguas semíticas e indoeuropeas: el par árabe-griego ofrece un caso de estudio interesante para medir la transferencia positiva o negativa entre familias lingüísticas distintas.
- Docencia en procesamiento del lenguaje natural: su tamaño reducido permite ejecutarlo en entornos docentes para ilustrar el funcionamiento de un transformer causal y el proceso de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo ocupa aproximadamente 154 MB en precisión completa).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs integradas modernas o tarjetas de gama baja como NVIDIA GTX 1650.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU disponible en el mercado, incluso en CPUs con suficiente RAM.
- Opciones de despliegue: transformers (pipeline de Hugging Face), text-generation-inference, o entornos personalizados con PyTorch y Accelerate.
- Latencia y throughput: no disponible, pero al ser un modelo de 38 M de parámetros, la generación es muy rápida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| nikitastheo/v2-babylm-small-ara-ell-sequential_interleaved | 38,5 M | no disponible | arabe, griego | no disponible |
| nikitastheo/babylm-ara-ell-sequential_interleaved (v1) | no disponible | no disponible | arabe, griego | no disponible |
| GPT-2 small (original) | 124 M | 1024 | principalmente ingles | MIT |

La comparativa con GPT-2 small es la más directa por compartir arquitectura, aunque el modelo de BabyLM es significativamente más pequeño y está especializado en dos idiomas. No se dispone de información sobre otros modelos comparables dentro del desafío BabyLM para el par árabe-griego.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas críticas.
- Tamaño muy reducido: su capacidad de razonamiento y generación de texto coherente es limitada en comparación con modelos de cientos de miles de millones de parámetros.
- Riesgo de alucinación: al ser un modelo pequeño entrenado con datos limitados, puede generar texto incoherente o factualmente incorrecto.
- Cobertura lingüística restringida: solo árabe y griego, sin soporte para otros idiomas.
- Licencia no especificada: no se indica bajo qué términos puede usarse comercialmente, por lo que se recomienda contactar al autor antes de cualquier uso comercial.
- Sin información sobre sesgos: no se han documentado posibles sesgos derivados de los datos de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v2-babylm-small-ara-ell-sequential_interleaved
- Versión anterior del modelo: https://huggingface.co/nikitastheo/babylm-ara-ell-sequential_interleaved
- Publicaciones del autor: https://nikitas-theo.github.io/publications/
- Página del desafío BabyLM: https://babylm.github.io/
- Papers del workshop BabyLM: https://babylm.github.io/papers.html
