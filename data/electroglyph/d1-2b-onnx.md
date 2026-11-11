# electroglyph/d1-2B-onnx

## Resumen

d1-2B es un modelo de decisión de 2.000 millones de parámetros construido por LiquidAI sobre el backbone LFM3-VL. A diferencia de un modelo conversacional, no genera texto: recibe un estado (un contexto textual) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, respuestas calibradas con cero tokens generados. Está pensado para tareas de clasificación y puntuación estructurada, como triaje de soporte, moderación de contenido o evaluación por rúbrica.

La versión aquí descrita es una conversión ONNX realizada por el usuario electroglyph, que permite ejecutar el modelo con onnxruntime 1.31.1 sin necesidad de SGLang ni de un servidor de generación. Se ofrecen tres builds (CUDA int8, CPU int8 y CUDA int4) que preservan la atención de servicio del checkpoint original: seis capas de atención completa con máscara `set` empaquetada, tamaño de conjunto 16, temperatura 1.337 y tablas de lectura de calibración.

La relevancia de esta ficha radica en que documenta una alternativa práctica de despliegue para un modelo de decisión poco convencional, con cuantizaciones verificadas frente al original (desviación máxima de 0,015 en int8 CUDA) y una API propia (`system_one`) que simplifica la integración en pipelines de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas conv/atención) sobre backbone LFM3-VL, con atención `set` empaquetada en 6 capas de atención completa |
| Parametros totales | 2B (según el nombre del modelo; no se detalla desglose en la información disponible) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (se documenta un tamaño de conjunto de 16 preguntas por request) |
| Tipos de cuantizacion | int8 (CUDA y CPU), int4 verdadero k-quant con bloque 32 (solo LM head en int8) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | ONNX (`model.onnax` + `model.onnax.data`) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/d1-2B, un modelo de decisión de 2B parámetros construido sobre LFM3-VL. La arquitectura combina capas convolucionales y de atención (híbrida), con un esquema de atención específico para decisión: las 6 capas de atención completa ejecutan una máscara `set` empaquetada en la que el estado es bidireccional y cada pregunta ve el estado más su propia pregunta, con `d1_set_size` de 16. Esta configuración reproduce exactamente la atención de servicio usada durante el entrenamiento.

La conversión ONNX se realizó con onnxruntime-genai ModelBuilder 0.19.0 sobre onnxruntime 1.31.1, ya que `torch.onnax.export` no puede manejar las capas híbridas conv/atención con kernels personalizados. Se aplicaron dos ajustes de compatibilidad locales sobre una copia del checkpoint (renombrado de la arquitectura a `Lfm3VlForConditionalGeneration` y shims para transformers/kernels), sin modificar los pesos originales. La torre de visión no se exporta: los builds son solo texto. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Clasificación binaria yes/no mediante preguntas tipo `noul`, con salida de probabilidad calibrada (por ejemplo, `{"noul": 0.71}`).
- Elección entre categorías mediante preguntas tipo `choice`, con distribución de probabilidades sobre las opciones (por ejemplo, `priority` → `urgent` con 0,73).
- Puntuación por rúbrica mediante preguntas tipo `score`, con niveles ordinales y lectura configurable (media, mediana o argmax).
- Procesamiento de hasta 16 preguntas por request en una sola pasada; requests mayores se dividen automáticamente en varias pasadas.
- Inferencia sin generación de tokens: `output_tokens` siempre 0, lo que reduce latencia y coste.
- Aplicación de temperatura y tablas de calibración propias del checkpoint para que las salidas sean comparables con el serving en PyTorch.
- Solo texto: visión, audio y vídeo requieren el serving PyTorch del repositorio fuente.
- No dispone de tool calling, function calling, modo thinking ni capacidades de agente según la información disponible.

## Casos de uso

- Triaje de tickets de soporte: con un estado que contiene el histórico del ticket, se pueden formular preguntas `noul` (¿procede reembolso?), `choice` (prioridad: low/normal/urgent) y `score` (satisfacción del cliente en escala 0-4) en una sola pasada, como muestra el ejemplo `support.json` con 211 tokens de entrada.
- Moderación de contenido: clasificación de publicaciones o mensajes con `noul` (¿viola la política?), `choice` (categoría: legit/spam/scam/abuse) y `score` (severidad 0-4), con distribución de probabilidades para decidir cuándo escalar a revisión humana.
- Enrutamiento de peticiones en pipelines internos: dado un estado con la consulta del usuario, preguntas `choice` permiten seleccionar el departamento, cola o flujo de procesamiento adecuado sin generar texto.
- Evaluación automática de respuestas generadas por otros modelos: preguntas `score` con rúbrica permiten puntuar calidad, relevancia o toxicidad de un texto de forma calibrada y reproducible.
- Control de calidad en producción de contenidos: verificación `noul` de cumplimiento de guías editoriales y clasificación `choice` de tipos de incidencia, integrable como paso de validación en CI/CD.
- Análisis de sentimiento y tono en conversaciones: preguntas `choice` sobre tono (angry/neutral/happy) y `score` de satisfacción, útiles para dashboards de atención al cliente.
- Filtrado previo en sistemas RAG: decidir con `noul` si un fragmento recuperado es relevante para la consulta antes de pasarlo a un modelo generador, ahorrando coste de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente métricas de fidelidad de la cuantización frente al modelo original en PyTorch:

| Build | Tamano aproximado | Peor desviacion vs original |
|---|---|---|
| model-cuda-int8 | ~2,1 GB | 0,015 |
| model-cpu-int8 | ~2,3 GB | 0,024 |
| model-cuda-int4 | ~1,2 GB | 0,082 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,1 GB para el build CUDA int8 y 1,2 GB para el build CUDA int4, según los tamaños de los artefactos publicados.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; los builds CUDA están pensados para ejecución en GPU y el build CPU para ejecución sin GPU.
- Compatibilidad con GPU de consumo: los tamaños de los builds (1,2-2,3 GB) sugieren que caben en GPUs de consumo con suficiente VRAM, pero no se confirma ningún modelo concreto en la documentación.
- Despliegue: onnxruntime 1.31.1, con scripts `score_d1.py` (puntuación de decisiones) y `onnx_d1.py` (runner compartido `OnnxD1` con prefill de un solo forward y feed de `block_bias`). No requiere SGLang ni servidor de generación.
- Latencia y throughput: no disponibles; la model card solo indica `input_tokens` y `output_tokens: 0` en los ejemplos (211 y 196 tokens de entrada respectivamente).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión en la documentación proporcionada. Como referencia, el propio modelo base LiquidAI/d1-2B (en PyTorch) es la alternativa directa, con soporte de visión, audio y vídeo que estos builds ONNX no incluyen.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| electroglyph/d1-2B-onnx | 2B | no disponible | solo texto | lfm1.0 | ONNX |
| LiquidAI/d1-2B | 2B | no disponible | texto, vision, audio, video | lfm1.0 | PyTorch |

## Limitaciones y advertencias

- Es un modelo de decisión, no un chatbot: no genera texto libre y no puede usarse para conversación abierta.
- Solo texto en estos builds: visión, audio y vídeo requieren el serving PyTorch del repositorio fuente.
- Las puntuaciones `noul` cercanas a 0,5 son equivalentes a una moneda al aire; la model card recomienda escalar en lugar de aplicar umbrales ciegos.
- Las respuestas `score` se devuelven por defecto en el nivel mediano; la lectura por media o argmax debe seleccionarse explícitamente.
- El build int4 presenta una desviación máxima de 0,082 frente al original, notablemente mayor que los builds int8; conviene validar su precisión en la tarea concreta antes de usarlo en producción.
- La cuantización introduce desviaciones frente al serving PyTorch original (hasta 0,015 en CUDA int8 y 0,024 en CPU int8), por lo que los umbrales de decisión deben calibrarse sobre el build elegido.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación en el sentido generativo, cobertura de idiomas ni restricciones adicionales de la licencia LFM Open License v1.0 más allá de la licencia en sí.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/d1-2B-onnx
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE` (enlace relativo referenciado en la model card)
- onnxruntime-genai ModelBuilder: herramienta citada en la model card (Microsoft, versión 0.19.0); no se proporciona URL directa en la información disponible
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
