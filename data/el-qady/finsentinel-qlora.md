# El-Qady/FinSentinel-QLoRA

## Resumen

FinSentinel-QLoRA es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario El-Qady y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 1.500 millones de parámetros, derivado directamente de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`), sobre la que se aplicó un entrenamiento con QLoRA. El nombre sugiere un enfoque hacia el análisis financiero o la detección de sentimiento en ese dominio, aunque la model card no documenta el conjunto de datos de entrenamiento ni el objetivo concreto.

El modelo hereda la arquitectura transformer de Qwen2.5, con una ventana de contexto nativa de 32.768 tokens en la familia Qwen2.5-1.5B-Instruct (dato de la familia base, no confirmado en la model card de este ajuste). Su relevancia radica en ser un ejemplo de ajuste fino ligero y reproducible con Unsloth, pensado para tareas especializadas en inglés y desplegable en hardware de consumo. No obstante, la información publicada es mínima: no hay métricas, ni descripción del dataset, ni evaluación de capacidades.

La ficha siguiente se basa exclusivamente en los metadatos y la model card disponibles; cualquier dato no documentado se indica como "no disponible". El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja que se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.500 millones (aproximado, heredado de Qwen2.5-1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la familia Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | no disponible en el repo; el modelo base se entrenó sobre una versión bnb-4bit |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags del repo) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar (no se trata de un modelo MoE ni híbrido). El entrenamiento se realizó con QLoRA, técnica de ajuste fino con cuantización de bajo rango, sobre la versión del modelo base ya cuantizada en 4 bits por Unsloth. La model card indica que el entrenamiento fue "2x más rápido con Unsloth", lo que confirma el uso de las optimizaciones de esa librería (kernels fusionados, gestión eficiente de memoria), pero no aporta detalles sobre hiperparámetros, rango de LoRA, número de pasos o composición del dataset.

No se documenta el volumen de tokens de entrenamiento, la procedencia de los datos, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se especifica si el adaptador LoRA se fusionó con los pesos base o si se mantiene separado; el tamaño del repositorio (0.0 GB) sugiere que la carga de pesos puede estar incompleta o que se trata de un repo vacío en el momento de la consulta, lo que impide verificar el contenido real de los safetensors.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, presumiblemente orientado al dominio financiero por el nombre del modelo (no confirmado).
- Soporte de tool calling y function calling: no disponible en la model card; la familia Qwen2.5-Instruct lo soporta, pero no se verifica en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Análisis de sentimiento financiero: el modelo podría clasificar titulares o informes en positivo, negativo o neutro, aprovechando el ajuste fino orientado al dominio que sugiere su nombre. Adecuado por su tamaño reducido para procesar lotes grandes en CPU o GPU de consumo.
- Extracción de entidades en textos financieros: identificación de empresas, cifras y fechas en noticias o informes, con la ventana de contexto de la familia base si se confirma.
- Generación de resúmenes de informes trimestrales: resumir documentos financieros en inglés para paneles internos, con la ventaja de un modelo de 1,5B parámetros desplegable en local.
- Prototipado de asistentes de atención al cliente en banca: conversaciones multi-turno simples en inglés, con la cautela de que no hay evaluación publicada de calidad.
- Clasificación de transacciones o descripciones de gasto: etiquetado de texto corto en categorías predefinidas, tarea para la que un modelo pequeño ajustado puede ser suficiente.
- Filtrado y enrutamiento de consultas en pipelines RAG: usar el modelo como clasificador o reformulador de consultas antes de un recuperador, por su bajo coste de inferencia.
- Experimentación académica con QLoRA y Unsloth: servir como ejemplo reproducible de ajuste fino eficiente sobre Qwen2.5-1.5B para investigadores que quieran replicar el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en cuantización de 4 bits (estimación a partir de 1,5B parámetros; no verificada en la model card).
- VRAM estimada en fp16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en cuantización de 4 bits.
- Opciones de despliegue: transformers, vLLM, llama.cpp (si se generan pesos GGUF), Ollama (mediante importación), TGI (el repo incluye el tag text-generation-inference).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FinSentinel-QLoRA | ~1,5B | no disponible (familia base: 32.768) | Apache 2.0 | HuggingFace, sin descargas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (típico) | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados para FinSentinel-QLoRA que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas ni validación humana publicada, por lo que se desconoce si el ajuste mejora o degrada las capacidades del modelo base.
- Dataset no documentado: se desconoce la composición, el volumen y la calidad de los datos de entrenamiento, lo que impide evaluar sesgos y riesgos de alucinación.
- Riesgo de sobreajuste al dominio: un ajuste fino sobre 1,5B parámetros con datos no descritos puede degradar el rendimiento general del modelo base.
- Idioma limitado al inglés: no se declara soporte de castellano ni de otros idiomas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Tamaño del repo de 0.0 GB: posible carga incompleta de pesos; conviene verificar la integridad de los safetensors antes de usarlo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad sobre la calidad y los sesgos del ajuste.
- El modelo base se entrenó sobre una versión cuantizada en 4 bits; la calidad final puede verse afectada por la cuantización previa.

## Enlaces

- HuggingFace: https://huggingface.co/El-Qady/FinSentinel-QLoRA
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Qwen2.5 (familia base): no disponible enlace específico en la información proporcionada
