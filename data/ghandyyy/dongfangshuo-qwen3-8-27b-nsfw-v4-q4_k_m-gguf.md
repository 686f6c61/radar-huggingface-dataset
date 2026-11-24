# Ghandyyy/Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q4_K_M-GGUF

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4, un fine-tune de la familia Qwen 3.8 orientado a roleplay sin censura (etiquetas "abliterated" y "uncensored"). El artefacto lo publica el usuario Ghandyyy y se ha generado automáticamente mediante el espacio GGUF-my-repo de ggml.ai a partir del checkpoint original en transformers. El resultado es un fichero único de 16,5 GB pensado para su uso con llama.cpp, Ollama y entornos de inferencia local compatibles con GGUF.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), lo que lo sitúa en la gama de modelos densos de ~27B. La model card original declara el pipeline image-text-to-text, lo que sugiere capacidades multimodales de entrada (imagen y texto), aunque la cuantización GGUF publicada no documenta explícitamente el tratamiento de las torres de visión. El idioma declarado es únicamente chino (zh).

La relevancia de esta ficha es doble: por un lado, ilustra el flujo habitual de conversión de un fine-tune a GGUF para despliegue local; por otro, advierte de que se trata de un modelo con contenido para adultos, sin benchmarks publicados y con información técnica muy limitada en la model card, lo que obliga a tratar cualquier uso en producción con cautela y verificación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (única variante publicada en este repo) |
| Idiomas soportados | Chino (zh) declarado; cobertura multilingüe no documentada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `dongfangshuo-qwen3.8-27b-nsfw-v4-q4_k_m.gguf`); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen 3.8 y de un recuento de parámetros de ~26,9B, coherente con un transformer denso. El modelo base es un fine-tune de dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4, etiquetado como "abliterated" (técnica de ablación de direcciones de rechazo en el espacio de activaciones) y "uncensored", orientado a roleplay. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o similares.

El artefacto aquí descrito no es un entrenamiento nuevo, sino una conversión a GGUF realizada con llama.cpp a través del espacio GGUF-my-repo de ggml.ai. La cuantización Q4_K_M aplica cuantización de bloques de 4 bits con escalas K-quant, lo que reduce el peso a 16,5 GB manteniendo una calidad razonablemente cercana al original en la mayoría de tareas. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en roleplay y narrativa sin censura.
- Entrada multimodal imagen-texto según el `pipeline_tag` declarado (image-text-to-text); el soporte efectivo de visión en la cuantización GGUF no está documentado.
- Modo "uncensored"/"abliterated": menor tendencia a rechazar peticiones por políticas de contenido.
- Capacidad de razonamiento y código: no documentada explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara chino (zh); el resto de idiomas no está verificado.
- Capacidad especial: roleplay y contenido para adultos (etiqueta `not-for-all-audiences`).

## Casos de uso

- Roleplay conversacional local: el modelo está afinado específicamente para mantener personajes y narrativa multi-turno; su formato GGUF Q4_K_M permite ejecutarlo en estaciones de trabajo sin GPU de数据中心, con llama.cpp u Ollama.
- Generación creativa de ficción para adultos: gracias a la ablación de rechazos, puede producir narrativa explícita sin bloqueos, útil en entornos de escritura creativa controlados y con audiencia advertida.
- Prototipado de chatbots de personaje en local: al caber en 16,5 GB, se puede desplegar en una única GPU de consumo alta (24 GB) o en CPU con suficiente RAM, facilitando iteración rápida sin costes de API.
- Investigación sobre alineación y censura: el modelo sirve como caso de estudio de técnicas de abliteration, comparando su comportamiento con el Qwen base en evaluaciones de rechazo y utilidad.
- Evaluación de pipelines GGUF: útil para probar el flujo GGUF-my-repo → llama.cpp → Ollama y medir latencia y perplejidad en hardware concreto antes de adoptar modelos mayores.
- Generación de diálogos sintéticos en chino: dado que el idioma declarado es zh, puede emplearse para aumentar datasets conversacionales en ese idioma, siempre con revisión humana por el sesgo hacia contenido explícito.
- Despliegue en entornos sin conectividad: al ser un fichero único GGUF, se puede distribuir a máquinas aisladas para demos de roleplay o pruebas de estrés de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 16,5 GB; se recomienda al menos 18-20 GB de VRAM para cargar el modelo con contexto moderado, o 24 GB para dejar margen a la caché KV.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB; en GPUs de 16 GB no cabe en Q4_K_M sin offloading parcial.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 (24 GB) y en configuraciones con offloading parcial en GPUs de 16 GB (RTX 4080, 4070 Ti Super) a costa de latencia.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El ejemplo oficial usa `llama-server -c 2048`.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y del contexto configurado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-v4 Q4_K_M (este) | ~26,9B | No disponible | Apache 2.0 | GGUF | Fine-tune NSFW/roleplay, solo zh declarado |
| Qwen2.5-32B-Instruct | ~32,5B | 128K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo base generalista, multilingüe, con benchmarks públicos |
| Qwen2.5-14B-Instruct | ~14,8B | 128K (según versión) | Apache 2.0 | safetensors, GGUF | Alternativa más ligera para hardware de 16 GB |
| Mistral-Nemo-12B-Instruct | ~12B | 128K | Apache 2.0 | safetensors, GGUF | Menor tamaño, multilingüe, sin fine-tune NSFW |

La comparación con Qwen2.5 y Mistral-Nemo es orientativa: no se dispone de benchmarks del modelo evaluado que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado `not-for-all-audiences` y entrenado para producir contenido explícito; no es apto para aplicaciones orientadas al público general.
- Sesgos conocidos: no documentados; la ablación de rechazos puede aumentar la probabilidad de respuestas dañinas u ofensivas sin filtro.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks, no se puede estimar su fiabilidad factual.
- Limitaciones de idioma: solo se declara chino; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- Contexto: no se documenta la longitud máxima; el ejemplo oficial usa 2048 tokens, lo que sugiere que contextos largos pueden degradar la calidad o no estar soportados.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativas locales sobre material para adultos; la responsabilidad recae en el desplegador.
- Soporte de visión incierto: aunque el `pipeline_tag` es image-text-to-text, la conversión GGUF no documenta el tratamiento de imágenes; verificar antes de asumir multimodalidad.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria, conviene auditar el fichero y comparar con el checkpoint original antes de usarlo en producción.
- Repo de 16,5 GB: requiere espacio en disco y ancho de banda considerables para su descarga y distribución.

## Enlaces

- Hugging Face (este GGUF): https://huggingface.co/Ghandyyy/Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
