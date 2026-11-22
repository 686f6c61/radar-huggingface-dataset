# mradermacher/AnomalyThink-Qwen3-VL-8B-KCR-i1-GGUF

## Resumen

AnomalyThink-Qwen3-VL-8B-KCR es un modelo vision-language de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) especializado en detección de anomalías industriales y razonamiento multimodal. Lo desarrolla el usuario aacudad a partir de la arquitectura Qwen3-VL, y esta ficha concreta es la cuantización GGUF realizada por mradermacher, un conocido publicador de cuantizaciones para llama.cpp. El modelo base se ha afinado sobre el dataset AnomalyThink, orientado a identificar defectos y comportamientos anómalos en entornos de fabricación y monitorización industrial.

La relevancia de este modelo radica en su especialización: frente a los modelos vision-language de propósito general, AnomalyThink incorpora un modo de razonamiento (reasoning) que le permite explicar por qué una imagen o secuencia se considera anómala, no solo clasificarla. Esto encaja con casos de inspección visual automatizada, mantenimiento predictivo y control de calidad en líneas de producción, donde la trazabilidad de la decisión es tan importante como la detección en sí.

Esta variante i1-GGUF ofrece cuantizaciones con imatrix (importancia matricial) en un rango enorme de tamaños, desde 2,2 GB (IQ1_S) hasta 6,8 GB (Q6_K), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo modestas hasta estaciones de trabajo. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3-VL) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-VL, la familia de modelos vision-language de Alibaba Qwen, que combina un codificador visual con un decoder de lenguaje transformer. A partir de esa base, el autor aacudad realizó un ajuste fino supervisado sobre el dataset AnomalyThink, un conjunto de datos propio orientado a detección de anomalías industriales. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no documenta estos extremos.

La innovación principal es la incorporación de un modo de razonamiento (reflejado en el sufijo "Think" del nombre) que permite al modelo generar una cadena de razonamiento antes de emitir un veredicto sobre la anomalía. Las cuantizaciones de esta ficha emplean imatrix, un método que calcula la importancia de cada peso a partir de datos de calibración para minimizar la pérdida de calidad en cuantizaciones agresivas (IQ1, IQ2, IQ3). El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar.

## Capacidades

- Análisis de imágenes para detección de anomalías industriales (defectos superficiales, piezas fuera de tolerancia, comportamientos anómalos en líneas de producción).
- Razonamiento multimodal: genera una explicación textual del motivo por el que un elemento se clasifica como anómalo, no solo la etiqueta.
- Comprensión de imágenes y texto combinados en conversaciones multi-turno (pipeline conversational declarado).
- Capacidades heredadas de Qwen3-VL: descripción de imágenes, respuesta a preguntas visuales y generación de texto.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integración en servicios de inferencia.
- Soporte de cuantizaciones extremas (hasta IQ1_S, 2,2 GB) para entornos con recursos muy limitados.
- No se documenta soporte explícito de tool calling, agentes o audio en la información disponible.

## Casos de uso

- Inspección visual automatizada en fábrica: el modelo recibe imágenes de cámaras industriales y determina si una pieza presenta defectos, generando además una justificación textual que el operario puede auditar. Su especialización en AnomalyThink lo hace más adecuado que un VLM genérico para este dominio.
- Control de calidad en líneas de producción: integrado en un pipeline que procesa imágenes por lotes, el modelo puede clasificar y priorizar alertas, reduciendo el volumen de revisiones manuales. La cuantización Q4_K_M (5,1 GB) permite desplegarlo en GPUs de consumo.
- Mantenimiento predictivo asistido por imagen: análisis de fotografías de equipos (corrosión, grietas, desgaste) con explicación del razonamiento, útil para técnicos que necesitan entender el diagnóstico.
- Monitorización remota en plantas distribuidas: las cuantizaciones pequeñas (IQ3_S, 3,9 GB) permiten ejecutar el modelo en dispositivos edge con GPU modesta, enviando solo las alertas relevantes al centro de control.
- Generación de informes de incidencia: a partir de una imagen anómala, el modelo redacta un informe en inglés describiendo el defecto y su posible causa, que se adjunta al sistema de tickets.
- Formación de operarios: uso interactivo para que el personal consulte al modelo sobre imágenes de ejemplo y reciba explicaciones del criterio de anomalía, aprovechando el modo de razonamiento.
- Investigación en detección de anomalías: el modelo sirve como baseline especializado para comparar con enfoques clásicos (autoencoders, métodos estadísticos) en el dataset AnomalyThink.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): desde ~2,5-3 GB para IQ1_S/IQ2_XXS hasta ~7-8 GB para Q6_K, incluyendo overhead de contexto y del codificador visual (el tamaño del fichero GGUF es una aproximación; el consumo real es algo superior).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB para cuantizaciones medias y altas; A100/H100 para despliegues con concurrencia o contexto largo.
- Cabe en GPU de consumo: sí. Las cuantizaciones IQ2 a Q4 (2,6-5,3 GB) caben en GPUs de 8 GB; Q5 y Q6 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, y servidores compatibles con endpoints. Para el modelo base en safetensors, vLLM o TGI si la arquitectura Qwen3-VL está soportada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Formato |
|---|---|---|---|---|---|
| AnomalyThink-Qwen3-VL-8B-KCR (esta ficha) | ~8,19 B | no disponible | Apache 2.0 | Detección de anomalías industriales + razonamiento | GGUF (i1), safetensors (base) |
| Qwen3-VL-8B (base genérica) | ~8 B | no disponible | Apache 2.0 (según familia Qwen) | Vision-language general | safetensors, GGUF |
| Qwen2.5-VL-7B | ~7 B | 128 K (según documentación pública de Qwen2.5-VL) | Apache 2.0 | Vision-language general | safetensors, GGUF |
| Modelos clásicos de detección de anomalías (autoencoders, PatchCore) | variable (menor) | N/A | variable | Detección puramente visual, sin razonamiento | variable |

La comparativa con modelos clásicos es cualitativa: AnomalyThink añade explicabilidad mediante razonamiento, a costa de un tamaño muy superior. No se dispone de datos de benchmarks que permitan comparar rendimiento numérico con las alternativas.

## Limitaciones y advertencias

- Solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Es un ajuste fino especializado: fuera del dominio de anomalías industriales, su calidad puede degradarse respecto al Qwen3-VL base.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar causas o descripciones de defectos que no están presentes en la imagen.
- Las cuantizaciones muy agresivas (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality". No recomendadas para producción.
- No se documentan sesgos específicos del ajuste fino; al heredar la base Qwen3-VL, puede arrastrar sesgos de sus datos de preentrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset AnomalyThink por si imponen restricciones adicionales.
- El repositorio ocupa 96,4 GB por incluir todas las cuantizaciones; la descarga debe hacerse seleccionando el fichero concreto.
- No hay información pública sobre latencia, throughput ni comportamiento en producción; se recomienda validación empírica antes de desplegar.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/AnomalyThink-Qwen3-VL-8B-KCR-i1-GGUF
- Modelo base: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-KCR
- Dataset AnomalyThink: https://huggingface.co/datasets/aacudad/AnomalyThink
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/AnomalyThink-Qwen3-VL-8B-KCR-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#AnomalyThink-Qwen3-VL-8B-KCR-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
