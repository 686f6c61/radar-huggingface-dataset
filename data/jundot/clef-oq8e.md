# Jundot/clef-oQ8e

## Resumen

clef-oQ8e es un checkpoint cuantizado en formato MLX de Cloudflare/clef, un modelo multimodal de decisión de 27B post-entrenado a partir de Qwen/Qwen3.8-27B. La cuantización la publica Jundot (Jun Kim) mediante su herramienta oQ (oMLX v0.7.1) con la variante Improved oQe Quantization, y mantiene intactos el backbone de lenguaje, el encoder de visión y la cabeza de esquema conjunta del modelo original.

El modelo no es un generador de texto libre: convierte un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas en decisiones, devolviendo una probabilidad para cada opción permitida de cada pregunta en una única pasada forward. Esa naturaleza lo sitúa en el terreno de la clasificación y el enrutamiento estructurados más que en el de la conversación abierta, pese a que la model card lo etiqueta como conversacional.

Su relevancia práctica es doble. Por un lado, empaqueta 27,485B de pesos lógicos en 27,713 GiB (29,757 GB) con una media efectiva de 8,661 bits por peso, sin degradar capas sensibles que se mantienen en BF16. Por otro, el formato MLX permite ejecutar localmente en Apple Silicon un modelo multimodal de 27B que en precisión completa exigiría bastante más memoria. El checkpoint se publicó el 11 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje Qwen3.8-27B + encoder de visión + cabeza de esquema conjunta). El tag del repositorio indica qwen3_5; la model card cita Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (~27,36B) según los safetensors del repositorio; la model card declara 27,485B de pesos lógicos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX mixta oQ8e: affine 8-bit con grupo 64 en el 97,848% de los pesos y BF16 en el 2,152% restante. Media efectiva de 8,661 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), incluido joint_head.safetensors y joint_head_config.json |
| Tamano del repositorio | 29,8 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | mlx |
| Modelo base | Cloudflare/clef (relación: quantized) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un reentrenamiento. Conserva la arquitectura del checkpoint fuente Cloudflare/clef: un backbone de lenguaje Qwen3.8-27B de 26,896B pesos, un encoder de visión de 0,461B y una cabeza de esquema conjunta de 0,128B que es la responsable de producir probabilidades por opción y pregunta. La cabeza (`joint_head.safetensors`) se copia sin cambios desde el modelo original, según la model card.

El proceso de cuantización de oQ8e asigna bits según la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia construida con 128 muestras de 512 tokens y aplica un reajuste por mínimos cuadrados ponderados de la escala y el sesgo de cada grupo. El resultado es una distribución de 26,893B pesos en affine 8-bit (26,612 GiB) y 0,591B pesos en BF16 (1,102 GiB), lo que da 27,485B pesos lógicos en 27,713 GiB. La coincidencia numérica entre el bloque BF16 (0,591B) y la suma del encoder de visión más la cabeza de esquema (0,461B + 0,128B = 0,589B) sugiere que esas dos componentes se mantienen sin cuantizar, aunque la model card no lo afirma de forma explícita.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base. La model card tampoco detalla innovaciones de decodificación (por ejemplo, decodificación especulativa), más allá del propio esquema de cuantización mixta y del endpoint `POST /v1/systemone` que oMLX expone para servir el checkpoint.

## Capacidades

- Decisión estructurada con probabilidades: recibe un estado y un esquema de preguntas tipadas y devuelve, en una sola pasada forward, la probabilidad de cada opción permitida de cada pregunta.
- Entrada multimodal: según la documentación de Cloudflare Workers AI, el modelo lee el estado como texto, JSON, imágenes o vídeo.
- Salida calibrada por opción, apta para umbrales de decisión configurables en lugar de texto libre.
- Backbone de lenguaje generativo heredado de Qwen3.8-27B, aunque la cabeza de esquema condiciona la salida a opciones predefinidas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Enrutamiento y clasificación de tickets de soporte: se define un esquema con preguntas tipadas (categoría, urgencia, equipo responsable) y el modelo devuelve probabilidades por opción, lo que permite aplicar umbrales y derivar a revisión humana los casos con baja confianza.
- Moderación de contenido multimodal: el estado puede incluir texto e imágenes, de modo que el modelo evalúa de forma conjunta si una publicación incumple cada política definida como pregunta del esquema.
- Evaluación de riesgo y scoring: con un esquema de preguntas binarias o de escala, las probabilidades sirven como puntuaciones calibradas para decidir aprobaciones, límites de crédito o alertas antifraude.
- Control de calidad visual en producción: alimentando imágenes o fotogramas de vídeo junto con un esquema de defectos posibles, el modelo devuelve la probabilidad de cada defecto y permite automatizar el descarte con umbrales.
- Selección de acción en agentes y robótica: dado un estado descrito en JSON y un conjunto finito de acciones permitidas, el modelo puntúa cada acción en una única pasada, lo que encaja con bucles de control que necesitan latencia predecible.
- Análisis de vídeo para detección de eventos: el encoder de visión permite procesar el estado visual y responder a preguntas tipadas sobre presencia o ausencia de eventos concretos.
- Ranking y recomendación: con cada candidato expresado como opción del esquema, las probabilidades ofrecen un orden de preferencia directamente utilizable por un sistema de ranking.
- Validación de documentos: combinando la lectura de la imagen del documento con un esquema de comprobaciones (campos presentes, coherencia, legitimidad), el modelo produce probabilidades por comprobación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K y similares) en la información disponible. Tampoco hay cifras de latencia o throughput para este checkpoint.

Existe una página de rendimiento en omlx.ai correspondiente a una ejecución en un Apple M3 Ultra de 80 núcleos con 512 GB y cuantización 8-bit, fechada el 7 de octubre de 2026, pero los valores concretos no se recogen en la información proporcionada.

## Requisitos de hardware

- Pesos almacenados: 27,713 GiB (29,757 GB); el repositorio completo ocupa 29,8 GB.
- Memoria mínima estimada: en torno a 28 GB solo para los pesos. Como estimación derivada del tamaño del checkpoint, se recomienda no bajar de 32 GB de memoria unificada y contar con 48 GB o más para absorber la caché KV y las activaciones del encoder de visión. No es un dato publicado por el autor.
- GPU recomendadas: no disponible. MLX está diseñado para Apple Silicon, por lo que no hay ruta documentada para A100, H100 o RTX 4090 sin una conversión previa a otro formato.
- Compatibilidad con GPU de consumo: el checkpoint no cabe en una GPU de consumo con 24 GB (RTX 4090) en este formato. La vía natural es un Mac con memoria unificada suficiente (gama M-series Pro, Max o Ultra); el único equipo documentado en la información disponible es un M3 Ultra de 80 núcleos y 512 GB.
- Opciones de despliegue: MLX y oMLX, que sirve el checkpoint mediante `POST /v1/systemone`. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|---|
| Cloudflare/clef | 27B | safetensors original (precisión no especificada) | no disponible | Apache-2.0 | Modelo multimodal de decisión; fuente del checkpoint |
| Jundot/clef-oQ8e | 27,36B medidos; 27,485B lógicos según la model card | MLX oQ8e, 8,661 bits por peso de media | no disponible | Apache-2.0 | Cuantización mixta del anterior |
| Jundot/Qwen3.8-27B-oQ8e-mtp | no disponible | MLX (oQ8e, con MTP) | no disponible | no disponible | Cuantización del backbone Qwen3.8-27B, sin la cabeza de decisión |
| Qwen/Qwen3.8-27B | ~27B (no confirmado en la información disponible) | safetensors | no disponible | no disponible | Backbone de lenguaje generativo, tarea distinta |

La comparación con modelos de chat de propósito general es poco informativa: clef no genera texto libre, sino distribuciones de probabilidad sobre opciones tipadas. Los únicos puntos de comparación útiles en la información disponible son el modelo fuente y las cuantizaciones hermanas del mismo autor.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de precisión no nula, aunque sea moderada: el 97,848% de los pesos se almacena en 8 bits y solo un 2,152% permanece en BF16.
- El modelo está diseñado para decidir sobre un esquema cerrado de opciones; no debe emplearse como generador de texto abierto ni como asistente conversacional.
- Las probabilidades devueltas pueden estar mal calibradas en dominios alejados de los datos de post-entrenamiento, lo que obliga a validar umbrales antes de automatizar decisiones. No hay benchmarks publicados que respalden la calibración.
- La longitud de contexto no está documentada, lo que impide planificar el tamaño máximo del estado de entrada.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- Riesgo de alucinación: la cabeza de esquema siempre devuelve probabilidades sobre las opciones permitidas, incluso cuando la evidencia de entrada es insuficiente o ambigua, sin señal explícita de abstención documentada.
- Restricción de plataforma: el formato MLX limita la ejecución a Apple Silicon; no hay ruta de despliegue documentada en CUDA ni en CPU Linux con las herramientas habituales.
- Licencia Apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base Cloudflare/clef y de Qwen/Qwen3.8-27B, no detalladas en la información disponible.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 11 de octubre de 2026: carece de validación por parte de la comunidad.
- El joint schema head se copia sin modificar desde el modelo fuente, de modo que cualquier limitación de la cabeza original se hereda intacta.
- No se han publicado evaluaciones de sesgo ni de seguridad para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/clef-oQ8e
- Modelo base: https://huggingface.co/Cloudflare/clef
- Perfil del autor: https://huggingface.co/Jundot/models
- Cuantización hermana del backbone: https://huggingface.co/Jundot/Qwen3.8-27B-oQ8e-mtp
- Repositorio de la herramienta de cuantización oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Documentación de clef en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/clef/
- Ficha de clef en OpenRouter: https://openrouter.ai/cloudflare/clef
- Benchmark de rendimiento en M3 Ultra (80 núcleos, 512 GB, 8-bit): https://omlx.ai/benchmarks/performance/mfg06zo5
