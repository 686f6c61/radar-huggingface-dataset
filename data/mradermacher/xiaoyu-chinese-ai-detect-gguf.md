# mradermacher/xiaoyu-chinese-ai-detect-GGUF

## Resumen

xiaoyu-chinese-ai-detect es un modelo de clasificación de texto en chino diseñado para detectar contenido generado por inteligencia artificial. El modelo original lo desarrolla el usuario ronghua y esta versión concreta es una cuantización estática en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones para la comunidad. Se trata de un modelo BERT de aproximadamente 101,7 millones de parámetros, orientado a la extracción de características y clasificación binaria (texto humano frente a texto generado por IA) en lengua china.

El modelo resuelve un problema creciente: la necesidad de discriminar entre texto escrito por personas y texto producido por modelos generativos, algo relevante para plataformas educativas, medios de comunicación y sistemas de moderación. Al estar basado en BERT, su arquitectura es un transformer encoder, adecuado para tareas de clasificación y extracción de representaciones, no para generación de texto.

La relevancia de esta ficha radica en que el modelo se distribuye bajo licencia Apache 2.0, es extremadamente ligero (el repositorio completo ocupa 0,8 GB y las cuantizaciones rondan los 0,1-0,2 GB) y está disponible en múltiples niveles de cuantización GGUF, lo que permite desplegarlo en hardware muy modesto. No obstante, la información pública sobre su entrenamiento y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (según tags del modelo) |
| Parametros totales | 101.677.825 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base ronghua/xiaoyu-chinese-ai-detect es un transformer encoder de tipo BERT con 101.677.825 parámetros, según los datos de safetensors. Está especializado en detección de texto generado por IA en chino, con tareas declaradas de ai-generated-text-detection, ai-text-detection y feature-extraction. La arquitectura encoder es la habitual para clasificación de secuencias y extracción de embeddings, no para generación autoregresiva.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones técnicas específicas. La model card del repositorio cuantizado no aporta detalles del entrenamiento, y no se ha localizado documentación adicional en la información proporcionada. Esta versión GGUF es una cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) generada por mradermacher a partir de los pesos originales en formato Hugging Face.

## Capacidades

- Detección de texto generado por IA en chino: clasificación binaria de fragmentos de texto como humanos o sintéticos.
- Extracción de características: el modelo puede emplearse para obtener representaciones vectoriales de texto chino (feature-extraction).
- Procesamiento de texto en chino exclusivamente; no se declaran capacidades multilingües.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Moderación de contenido en plataformas chinas: clasificar publicaciones o comentarios para marcar posibles textos generados por IA, usando la salida del clasificador como señal complementaria en pipelines de revisión.
- Verificación académica: detectar posibles ensayos o trabajos generados automáticamente en entornos educativos de lengua china, integrándolo en herramientas de revisión de trabajos.
- Filtrado de datasets de entrenamiento: identificar y descartar muestras sintéticas en corpus chinos antes de usarlos para entrenar otros modelos, evitando contaminación por datos generados.
- Análisis de reseñas y opiniones: en comercio electrónico, estimar la proporción de reseñas sintéticas en chino para priorizar la revisión manual de las más sospechosas.
- Monitorización de medios y redes sociales: medir la presencia de contenido generado por IA en flujos de noticias o publicaciones en chino, como métrica de calidad editorial.
- Extracción de embeddings para clasificación downstream: usar el modelo como encoder para tareas auxiliares sobre texto chino (clasificación temática, clustering) aprovechando su naturaleza de feature-extraction.
- Despliegue en entornos con recursos limitados: al ocupar las cuantizaciones Q4_K_M alrededor de 0,2 GB, puede ejecutarse en CPU o en GPUs de gama baja dentro de servicios de moderación a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; Q4_K_M ronda los 0,2 GB de pesos, por lo que la huella total es mínima.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; también funciona en CPU. No requiere A100 ni H100.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090, e incluso en Raspberry Pi o entornos embebidos con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; para el modelo original en safetensors, transformers con PyTorch. Los tags indican endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia muy baja en CPU y prácticamente despreciable en GPU, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| xiaoyu-chinese-ai-detect (este) | 101,7 M | no disponible | zh | Apache 2.0 | GGUF, safetensors |
| ronghua/xiaoyu-chinese-ai-detect (base) | 101,7 M | no disponible | zh | Apache 2.0 | safetensors |
| Detectores de texto IA basados en BERT multilingües | no disponible | no disponible | varios | variable | variable |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta chino; no debe emplearse con texto en otros idiomas.
- No hay información pública sobre sesgos del dataset de entrenamiento ni sobre su comportamiento en dominios específicos (legal, médico, técnico).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; sin benchmarks publicados no puede estimarse su precisión real.
- Longitud de contexto no documentada; textos muy largos pueden requerir truncamiento y degradar la clasificación.
- Es una cuantización estática: los quants Q2_K y Q3 pueden degradar la calidad frente a Q4_K_M o Q8_0; el autor recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q8_0 como mejor calidad.
- No se han generado cuantizaciones ponderadas/imatrix para este modelo según la model card.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y citar adecuadamente a los autores.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/xiaoyu-chinese-ai-detect-GGUF
- Modelo base: https://huggingface.co/ronghua/xiaoyu-chinese-ai-detect
- Página de descargas del cuantizador: https://hf.tst.eu/model#xiaoyu-chinese-ai-detect-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
