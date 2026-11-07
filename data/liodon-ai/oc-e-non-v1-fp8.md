# liodon-ai/Oc-e-Non-v1-FP8

## Resumen

Oc-e-Non-v1-FP8 es una cuantización en FP8 del modelo p-e-w/Oc-e-Non-v1, publicada por Liodon AI. Se trata de una conversión de pesos orientada a inferencia de alto rendimiento más que de un modelo entrenado desde cero: el autor original del modelo base es p-e-w y Liodon AI se limita a aplicar el esquema `FP8_DYNAMIC` mediante llm-compressor. El resultado reduce el tamaño de los pesos de 8,0 GB a 4,4 GB, aproximadamente la mitad, manteniendo los 4.022.468.096 parámetros del modelo original.

El modelo base se etiqueta en Hugging Face con la familia qwen3, lo que sitúa la arquitectura en la estirpe de transformers densos de Qwen 3, con cerca de 4 mil millones de parámetros. La ficha del modelo base no proporciona detalles sobre la longitud de contexto, el número de tokens de entrenamiento ni la composición del dataset, por lo que esos datos no están disponibles en la información consultada.

La relevancia de esta publicación es fundamentalmente práctica: permite servir un modelo de ~4B con la mitad de memoria de pesos y aceleración por hardware en GPUs con compute capability igual o superior a 8.9 (Ada, Hopper y Blackwell). El esquema dinámico no requiere dataset de calibración, de modo que los pesos cuantizados son un casteo directo del original, sin sesgo introducido por una muestra de calibración. La licencia es "other", lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3, segun tags del repo) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3), esquema FP8_DYNAMIC: pesos por canal y activaciones por token; lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers, vLLM, TGI y SGLang |

## Arquitectura y entrenamiento

El modelo base p-e-w/Oc-e-Non-v1 es un transformer denso de 4.022.468.096 parámetros, encuadrado por los tags del repositorio en la familia qwen3. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF o DPO, ni innovaciones de atención o decodificación. Tampoco se documenta la longitud de contexto nativa del modelo original.

La contribución técnica de esta variante es la cuantización. Se aplicó el esquema `FP8_DYNAMIC` de llm-compressor: los pesos se convierten a FP8 E4M3 por canal de forma anticipada y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Al no necesitar calibración, la conversión es numéricamente un casteo directo del modelo original, sin sesgo de conjunto de calibración. La capa `lm_head` se mantiene en precisión completa, práctica habitual por su impacto desproporcionado en la calidad frente a su tamaño reducido. El resultado pasa de 8,0 GB a 4,4 GB de pesos.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational.
- Razonamiento y generación de contenido general, heredados del modelo base Qwen 3; el grado exacto de rendimiento no está documentado.
- Soporte de tool calling y function calling: no disponible en la información consultada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información consultada.
- Capacidades multilingües: no disponibles; el modelo no declara lista de idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información consultada.
- Inferencia acelerada en FP8 sobre hardware Ada/Hopper/Blackwell, con desquantización automática en GPUs más antiguas (perdiendo la ventaja de velocidad y memoria).

## Casos de uso

- Servicio de chat conversacional de bajo coste: con 4,4 GB de pesos en FP8, el modelo cabe en una sola GPU de 24 GB junto con caché KV y procesamiento de peticiones concurrentes, lo que permite desplegar atención al cliente o asistentes internos sin clústeres multi-GPU.
- Despliegue en GPUs de consumo de la serie RTX 40: al requerir compute capability 8.9, una RTX 4090 o 4080 puede ejecutar la inferencia FP8 nativa, habilitando prototipado local de asistentes conversacionales a velocidad de producción.
- Backend de aplicaciones con vLLM o TGI: el modelo se sirve con un único comando (`vllm serve liodon-ai/Oc-e-Non-v1-FP8`) y expone una API compatible con OpenAI, lo que simplifica integrarlo en aplicaciones existentes.
- Generación de texto a escala con SGLang: para cargas de trabajo con muchas peticiones concurrentes, SGLang aporta planificación y caché de prefijos; el modelo se lanza con `python -m sglang.launch_server --model-path liodon-ai/Oc-e-Non-v1-FP8`.
- Evaluación comparativa de cuantización: al ser un casteo directo sin calibración, sirve como referencia para medir la pérdida de calidad de FP8_DYNAMIC frente al modelo base en tareas propias antes de adoptarlo en producción.
- Sustitución de modelos mayores en entornos con VRAM limitada: para tareas de resumen, clasificación o redacción asistida donde un modelo de 4B es suficiente, esta variante reduce a la mitad la huella de pesos y libera memoria para contextos o lotes mayores.
- Investigación sobre eficiencia de inferencia: el par modelo base y versión FP8 permite estudiar el impacto del casteo de activaciones por token en latencia y throughput sobre distintas GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la cuantización no incluye métricas de calidad, latencia ni throughput, y la información del modelo base consultada tampoco aporta resultados de MMLU, HumanEval, GSM8K u otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,4 GB solo para pesos en FP8; con caché KV y overhead del runtime, un despliegue práctico requiere del orden de 8-12 GB, dependiendo de la longitud de contexto y del número de secuencias concurrentes (estimación, no dato publicado).
- GPU recomendadas: NVIDIA con compute capability igual o superior a 8.9 para ejecución FP8 nativa: RTX 40-series (4090, 4080, etc.), L4, L40S, H100, H200, B100, B200 y GB10.
- GPUs sin soporte FP8: vLLM y TGI desquantizan a mayor precisión para ejecutar, lo que mantiene la compatibilidad pero pierde la ventaja de memoria y velocidad.
- Cabe en GPU de consumo: sí, en RTX 40-series con FP8 nativo; en GPUs anteriores funcionaría desquantizado, con mayor huella de memoria.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), SGLang y transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Oc-e-Non-v1-FP8 | 4.022.468.096 | no disponible | FP8 dinamica | other | Hugging Face |
| p-e-w/Oc-e-Non-v1 (base) | 4.022.468.096 | no disponible | pesos originales (8,0 GB) | other | Hugging Face |
| liodon-ai/zero-FP8 | no disponible | no disponible | FP8 | no disponible | Hugging Face |

La comparación con otras familias de ~4B (por ejemplo, variantes de Qwen 3) no puede completarse con datos verificados en la información consultada: no se dispone de resultados de benchmarks del modelo base ni de especificaciones de contexto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los términos del modelo base p-e-w/Oc-e-Non-v1 antes de cualquier uso comercial; la licencia de la cuantización no aclara por sí sola los derechos de explotación.
- Sin datos de evaluación: no hay benchmarks publicados que cuantifiquen la pérdida de calidad respecto al modelo original, aunque el esquema sin calibración reduce el riesgo de degradación por sesgo de calibración.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluación previa.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin consultar la ficha del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se ha documentado ningún mecanismo específico de mitigación.
- Sesgos: no documentados en la información disponible.
- Dependencia de hardware: en GPUs anteriores a Ada la ventaja de FP8 desaparece y el modelo se ejecuta desquantizado, con mayor consumo de memoria.
- Ecosistema mínimo: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/liodon-ai/Oc-e-Non-v1-FP8
- Modelo base: https://huggingface.co/p-e-w/Oc-e-Non-v1
- Organización Liodon AI: https://huggingface.co/liodon-ai
- Otra cuantización de la organización (referencia): https://huggingface.co/liodon-ai/zero-FP8
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
