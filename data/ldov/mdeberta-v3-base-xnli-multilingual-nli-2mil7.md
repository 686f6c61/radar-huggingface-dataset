# ldov/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7

## Resumen

mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 es un modelo de inferencia de lenguaje natural (NLI) multilingüe desarrollado por Moritz Laurer y publicado originalmente bajo el nombre `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`. Esta versión concreta (`ldov/...`) es una copia alojada por el usuario `ldov` con los mismos pesos y configuración. El modelo está diseñado para realizar clasificación zero-shot en múltiples idiomas: dado un texto y un conjunto de etiquetas candidatas, devuelve la probabilidad de que el texto pertenezca a cada etiqueta, sin necesidad de entrenamiento específico para la tarea.

La arquitectura subyacente es mDeBERTa-v3-base, un transformer encoder preentrenado por Microsoft sobre el corpus multilingüe CC100 con 100 idiomas. Sobre esta base se realizó un ajuste fino (fine-tuning) con los conjuntos XNLI y multilingual-NLI-26lang-2mil7, que en total suman más de 2,7 millones de pares hipótesis-premisa en 27 idiomas hablados por más de 4.000 millones de personas. El modelo tiene 278 millones de parámetros, lo que lo sitúa en la categoría "base" de DeBERTa-v3, y es considerado uno de los mejores modelos multilingües de ese tamaño según Microsoft (diciembre de 2021). Su relevancia actual radica en que permite clasificar textos en decenas de idiomas sin etiquetas previas, una capacidad demandada en aplicaciones de moderación de contenido, análisis de sentimiento y fact-checking.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (encoder transformer con attention disentangled) |
| Parametros totales | 278.812.163 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (típico de DeBERTa-v3: 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors y ONNX, sin cuantización publicada) |
| Idiomas soportados | Multilingüe (preentrenado en 100 idiomas; fine-tuning en 27: ar, bn, de, es, fa, fr, he, hi, id, it, ja, ko, mr, nl, pl, ps, pt, ru, sv, sw, ta, tr, uk, ur, vi, zh, además de inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en mDeBERTa-v3-base, un transformer encoder con atención disentangled (DeBERTa) que mejora la representación de relaciones entre tokens mediante vectores de posición relativos. La versión v3 introduce un reemplazo del masking con token decay, lo que reduce la divergencia entre preentrenamiento y fine-tuning. El preentrenamiento se realizó sobre el corpus CC100 con 100 idiomas.

El fine-tuning se llevó a cabo con dos conjuntos de datos: XNLI (traducción multilingüe del conjunto MultiNLI) y multilingual-NLI-26lang-2mil7, un dataset generado por Moritz Laurer que contiene 2.730.000 pares hipótesis-premisa en 26 idiomas (más inglés), construido a partir de los conjuntos ingleses MultiNLI, Fever-NLI, ANLI, LingNLI y WANLI mediante traducción automática con modelos de código abierto. El entrenamiento se realizó con la tarea de clasificación de secuencias de tres clases (entailment, neutral, contradiction). No se menciona el uso de RLHF ni DPO; es un ajuste supervisado estándar.

## Capacidades

- Clasificación zero-shot multilingüe: dado un texto y etiquetas candidatas, devuelve la probabilidad de pertenencia a cada etiqueta sin entrenamiento adicional.
- Inferencia de lenguaje natural (NLI): predice si una hipótesis es implicada, neutral o contradictoria respecto a una premisa.
- Soporte multilingüe amplio: preentrenado en 100 idiomas, con fine-tuning específico en 27 idiomas de alta demanda.
- Texto únicamente: no soporta visión, audio ni generación de texto libre (es un modelo encoder).
- No incluye tool calling ni capacidades de agente; su uso se limita a tareas de clasificación y NLI.

## Casos de uso

- Moderación de contenido multilingüe: clasificar comentarios o publicaciones en redes sociales como "spam", "discurso de odio" o "contenido seguro" en varios idiomas sin necesidad de etiquetar datos para cada idioma. El modelo puede procesar textos de hasta 512 tokens y devolver puntuaciones por etiqueta.
- Análisis de sentimiento en soporte al cliente: clasificar mensajes de usuarios en categorías como "positivo", "negativo" o "neutral" en distintos idiomas, permitiendo priorizar quejas urgentes.
- Fact-checking automatizado: dada una afirmación y un artículo de referencia, el modelo puede determinar si la afirmación es apoyada, refutada o neutral, útil para verificación de noticias en varios idiomas.
- Clasificación de documentos legales o administrativos: etiquetar contratos, sentencias o formularios en categorías predefinidas (por ejemplo, "propiedad", "laboral", "fiscal") en un entorno multilingüe.
- Enrutamiento de consultas en sistemas de atención: asignar cada consulta entrante a un departamento o categoría (técnico, facturación, ventas) basándose en la descripción del problema, sin entrenamiento específico.
- Etiquetado de artículos científicos o noticias: categorizar textos por tema (política, economía, ciencia, entretenimiento) en varios idiomas, facilitando la organización de repositorios o feeds.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | Accuracy |
|---|---|---|
| MultiNLI-matched | validation_matched | 0,857 |
| MultiNLI-mismatched | validation_mismatched | 0,856 |
| ANLI-all | test_r1+test_r2+test_r3 | 0,537 |
| ANLI-r3 | test_r3 | 0,497 |
| WANLI | test | 0,732 |
| LingNLI | test | 0,788 |
| Fever-NLI | test | 0,761 |

Estos valores muestran un rendimiento sólido en NLI multilingüe, con una caída esperable en conjuntos adversariales como ANLI-r3. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 278 millones de parámetros, el modelo en FP32 ocupa aproximadamente 1,1 GB; en FP16 unos 0,56 GB; en INT8 (si se cuantizara) unos 0,3 GB. Cabe en GPUs con al menos 2 GB de VRAM, aunque se recomienda 4 GB para margen con el tokenizador y los estados intermedios.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, A100, etc.) es suficiente. También se puede ejecutar en CPU, aunque la inferencia será más lenta.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, ONNX Runtime, y cualquier framework que soporte el formato safetensors. No se menciona compatibilidad con vLLM, llama.cpp u Ollama (estos se orientan a modelos generativos).
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de este tamaño, la inferencia en GPU suele ser del orden de milisegundos por secuencia (típicamente <50 ms en una RTX 3090 para secuencias de 128 tokens).

## Comparativa con modelos similares

El modelo es una evolución de `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli`, que se entrenó solo con MNLI y XNLI en inglés y algunos idiomas. La versión actual añade el dataset multilingüe de 2,7 millones de pares, lo que mejora significativamente el rendimiento en idiomas no ingleses. Otra alternativa comparable es `XLM-R-base` (también ~278M parámetros), pero XLM-R no está específicamente ajustado para NLI y requiere un cabezal de clasificación adicional. No se dispone de benchmarks comparativos directos en la información proporcionada.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 | 278M | No disponible | 100 (preentrenamiento), 27 (fine-tuning) | MIT | NLI y clasificación zero-shot multilingüe |
| mDeBERTa-v3-base-mnli-xnli | 278M | No disponible | Principalmente inglés y algunos más | MIT | NLI y clasificación zero-shot (menos multilingüe) |
| XLM-R-base | 278M | 512 | 100 | MIT | Modelo de lenguaje multilingüe (requiere fine-tuning para clasificación) |

## Limitaciones y advertencias

- El fine-tuning se realizó en 27 idiomas; aunque el preentrenamiento cubre 100, el rendimiento en idiomas no incluidos en el ajuste puede ser inferior.
- Los datos de entrenamiento provienen de traducción automática, lo que puede introducir errores o sesgos en los pares hipótesis-premisa.
- Al ser un modelo encoder, no puede generar texto; solo produce puntuaciones de clasificación.
- La longitud máxima de contexto no está documentada en la información disponible; se asume 512 tokens (típico de DeBERTa), pero no se confirma.
- Los benchmarks reportados no están verificados de forma independiente y podrían no reproducirse exactamente en otros entornos.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe evaluar los riesgos de sesgo y alucinación en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face (copia de ldov): https://huggingface.co/ldov/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Modelo original de Moritz Laurer: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Paper de DeBERTa-v3 (Microsoft): https://arxiv.org/abs/2111.09543
- Paper de LingNLI (traducción automática para NLI): https://arxiv.org/abs/2104.07179
- Repositorio GitHub con documentación adicional: https://github.com/jorguzb/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
