# skblv/gemma-3-27b-it-lora-surgvu-instruments

## Resumen

El modelo `skblv/gemma-3-27b-it-lora-surgvu-instruments` es un adaptador LoRA sobre el modelo multimodal `google/gemma-3-27b-it`, afinado para la detección multi-etiqueta de instrumentos quirúrgicos en vídeo. Lo desarrolla el autor `skblv` como parte del leaderboard de comprensión de vídeo quirúrgico de la SDSC × Chicago Booth. Resuelve el problema de identificar qué instrumentos están presentes en cada fotograma de una intervención, una tarea clave para la documentación automática y el análisis de procedimientos.

El adaptador se compone de una capa LoRA (r=128, alpha=256) y una cabeza lineal de clasificación de 17 instrumentos. El modelo base Gemma 3 27B-it aporta un encoder de visión SigLIP y una ventana de contexto de 128K tokens, aunque en esta tarea el modelo no genera texto, sino que emite una predicción de presencia por instrumento. El repositorio pesa 1.2 GB e incluye los pesos del adaptador y la cabeza de clasificación, pero requiere el modelo base completo para la inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal base Gemma 3 27B-it (encoder de visión SigLIP + transformer de 27B) con adaptador LoRA y cabeza lineal de clasificación multi-etiqueta de 17 instrumentos |
| Parametros totales | No disponible (el modelo base tiene 27B parámetros; el adaptador LoRA es una fracción de ese tamaño) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, no cuantizado; el modelo base puede cuantizarse a 4-bit u 8-bit para inferencia) |
| Idiomas soportados | No disponible (la tarea es clasificación de imágenes, no generación de texto) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) y PyTorch (`classifier.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en `google/gemma-3-27b-it`, un modelo multimodal de 27B parámetros que combina un encoder de visión SigLIP con un transformer de texto. Para esta tarea, se añade un adaptador LoRA con r=128 y alpha=256 sobre las capas de atención del modelo base, y se coloca una cabeza lineal de clasificación de 17 instrumentos sobre la representación de la imagen. El resto de los parámetros del modelo base permanece congelado durante el entrenamiento, lo que permite un ajuste eficiente con un coste de memoria reducido.

El entrenamiento se realizó siguiendo el mismo protocolo que los afinados previos en CholecT50 y PitVis: LoRA con r=128 y semilla 42. Se utilizaron 16,287 fotogramas de validación del conjunto de datos SurgVU (publicado en arXiv:2501.09209). No se aplicaron técnicas como RLHF o DPO; el entrenamiento es supervisado para la tarea de clasificación multi-etiqueta. La innovación principal es la aplicación de un modelo multimodal de gran tamaño a una tarea de visión específica mediante un adaptador ligero, en lugar de entrenar un modelo de visión desde cero.

## Capacidades

- Clasificación multi-etiqueta de presencia de instrumentos quirúrgicos en imágenes: el modelo predice qué instrumentos de un vocabulario de 17 están presentes en cada fotograma.
- Procesamiento de imágenes médicas de vídeo quirúrgico, con soporte para fotogramas individuales.
- Salida de probabilidades por instrumento, lo que permite umbrales ajustables según la aplicación.
- No soporta generación de texto, tool calling ni razonamiento multi-paso en esta configuración; es exclusivamente un clasificador de imágenes.
- Capacidades multilingües no aplicables, ya que la salida es una predicción numérica, no texto.
- Integración con el modelo base Gemma 3 27B-it, que sí posee capacidades multimodales generales, pero el adaptador se centra solo en la detección de instrumentos.

## Casos de uso

- Auditoría de procedimientos quirúrgicos: el modelo puede analizar grabaciones de cirugías para verificar si los instrumentos esperados fueron utilizados en cada fase. Su salida de probabilidades permite filtrar con umbrales para reducir falsos positivos.
- Formación de cirujanos: en entornos de simulación, el modelo identifica en tiempo real qué instrumentos aparecen en el campo, ayudando a los estudiantes a reconocer herramientas y a practicar la toma de decisiones.
- Documentación quirúrgica automática: se integra en un pipeline de postprocesado de vídeo para generar un registro de los instrumentos utilizados en cada operación, sustituyendo la anotación manual del personal.
- Investigación clínica: los resultados del modelo permiten correlacionar el uso de determinados instrumentos con variables clínicas (duración de la cirugía, complicaciones) en estudios retrospectivos sobre bases de datos de vídeo.
- Control de esterilización y logística: tras la cirugía, el modelo puede comprobar automáticamente que todos los instrumentos quirúrgicos están presentes en las imágenes del campo operatorio, detectando posibles retenciones o pérdidas.
- Monitorización en quirófano: en combinación con un sistema de alertas, el modelo puede avisar al equipo cuando un instrumento requerido no está presente en el campo visual, reduciendo errores durante la intervención.
- Integración con sistemas de robótica quirúrgica: el clasificador puede alimentar a un sistema robótico con información sobre qué instrumento se está utilizando, permitiendo un control más preciso o la activación de asistencias específicas.

## Benchmarks y rendimiento

Se evaluó el modelo en el conjunto de validación completo de SurgVU, con un intervalo de confianza del 95 % calculado por bootstrap. Los resultados publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Exact match | 50.61 % (IC 95 %: 49.84–51.39) |
| Micro-averaged F1 | 74.86 % (IC 95 %: 74.36–75.32) |

No se dispone de comparaciones con otros modelos de detección de instrumentos en la información proporcionada. La exact match es relativamente baja, lo que indica que la predicción conjunta de todos los instrumentos es errónea en cerca de la mitad de los casos, mientras que la micro-F1 muestra una mejor capacidad para detectar instrumentos individuales.

## Requisitos de hardware

- El adaptador LoRA y la cabeza de clasificación son ligeros (1.2 GB), pero requieren el modelo base `google/gemma-3-27b-it` para funcionar.
- El modelo base en FP16 necesita aproximadamente 54 GB de VRAM, por lo que se recomienda una GPU con al menos 80 GB (por ejemplo, A100 80 GB o H100) para inferencia sin cuantización.
- Con cuantización a 8 bits, el uso de VRAM se reduce a unos 27 GB, siendo viable en GPUs de 32 GB como la A100 40 GB o la RTX A6000.
- En cuantización de 4 bits, el modelo ocupa unos 14-15 GB, lo que permite ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque la latencia puede verse afectada.
- No se han publicado datos de latencia o throughput específicos para este adaptador. Para despliegue, se puede utilizar vLLM o TGI para servir el modelo base con el adaptador, aunque es necesario verificar la compatibilidad con la carga de adaptadores PEFT. llama.cpp no es compatible directamente con adaptadores LoRA de la librería `peft`.
- Alternativa: extraer la representación de las imágenes del modelo base (sin el adaptador) y aplicar la cabeza lineal, aunque esto requiere el modelo base completo en memoria.

## Comparativa con modelos similares

No se han publicado comparaciones directas con otros modelos de detección de instrumentos en la información disponible. El modelo se posiciona como la fila «Gemma 3 27B fine-tuned» en el leaderboard de vídeo quirúrgico de SDSC × Chicago Booth, pero no se facilitan los resultados de los competidores. Como referencia, se compara con el propio modelo base sin adaptador:

| Modelo | Parámetros | Contexto | Tarea | Exact match | Micro-F1 |
|---|---|---|---|---|---|
| skblv/gemma-3-27b-it-lora-surgvu-instruments | 27B (base) + adaptador | 128K | Clasificación multi-etiqueta (17 instrumentos) | 50.61 % | 74.86 % |
| google/gemma-3-27b-it (sin adaptador) | 27B | 128K | Multimodal general | No aplica | No aplica |

No se dispone de información sobre otros modelos de detección de instrumentos (p. ej., YOLO basado) para comparar directamente.

## Limitaciones y advertencias

- Es un modelo de investigación y no debe utilizarse como dispositivo médico ni en entornos clínicos reales sin validación adicional.
- La exact match es baja (50.61 %), lo que indica que la predicción conjunta de todos los instrumentos falla con frecuencia; la micro-F1 es más robusta pero no garantiza una detección fiable en todos los casos.
- El modelo se entrenó únicamente sobre el conjunto SurgVU, por lo que su generalización a otros tipos de cirugía o a condiciones de imagen distintas (iluminación, cámara, posición) no está garantizada.
- La licencia Gemma de Google impone restricciones de uso comercial y de redistribución, que deben revisarse antes de cualquier despliegue.
- No se han documentado sesgos específicos, pero el modelo puede heredar los sesgos del dataset de entrenamiento, que se centra en instrumentos de neurocirugía.
- El adaptador no es autocontenido; requiere el modelo base `google/gemma-3-27b-it` y la cabeza `classifier.pt` para funcionar correctamente.
- No soporta generación de texto ni interacción conversacional; es únicamente un clasificador de imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skblv/gemma-3-27b-it-lora-surgvu-instruments
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper de SurgVU: https://arxiv.org/abs/2501.09209
- Technical report de Gemma 3: https://arxiv.org/html/2503.19786v1
- Repositorio del leaderboard: https://github.com/skblv/neurosurgery-video-eval-website
