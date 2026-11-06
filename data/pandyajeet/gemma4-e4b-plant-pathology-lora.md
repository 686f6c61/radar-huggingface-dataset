# PandyaJeet/gemma4-e4b-plant-pathology-lora

## Resumen

`PandyaJeet/gemma4-e4b-plant-pathology-lora` es un adaptador LoRA de tipo rsLoRA (rank-stabilized LoRA) entrenado sobre el modelo multimodal `unsloth/gemma-4-E4B-it`. Lo desarrolla el usuario PandyaJeet y está especializado en patología vegetal: a partir de una imagen de hoja de cultivo, el modelo devuelve un objeto JSON con evidencia visual, cajas delimitadoras de lesiones, especie, diagnóstico y un resumen inmediato. El adaptador cubre 15 clases cerradas distribuidas entre tomate, patata y maíz, además de guardarraíles para entradas fuera de dominio (OOD).

El adaptador se publica como pesos PEFT en safetensors con licencia Apache 2.0 y un tamaño de repositorio de 0,2 GB, lo que refleja que solo se distribuyen los pesos del adaptador (39.481.344 parámetros entrenables, un 0,4947 % del total) y no el modelo base. La arquitectura subyacente es un transformer vision-language de Gemma 4 con variante E4B, es decir, un modelo eficiente de 4B de parámetros efectivos según la nomenclatura de Unsloth.

Su relevancia es doble: por un lado, demuestra un flujo completo de ajuste multimodal con Unsloth sobre un modelo Gemma 4, incluyendo el codificador visual, el proyector multimodal y el decodificador de lenguaje; por otro, ejemplifica el uso de modelos pequeños con adaptadores especializados para tareas de visión aplicada en agricultura, donde el despliegue en hardware modesto y la salida estructurada son requisitos habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Gemma 4 E4B) con adaptador rsLoRA |
| Parametros totales | No disponible (adaptador: 39.481.344 parámetros entrenables, 0,4947 % del total) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base cargada en 4-bit NF4; adaptadores en float32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT; requiere el modelo base `unsloth/gemma-4-E4B-it`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gemma-4-E4B-it`, un modelo vision-language de la familia Gemma 4 en su variante E4B. El ajuste emplea rsLoRA con r = 16, lora_alpha = 32, lora_dropout = 0,0 y `use_rslora = True`, y los módulos objetivo cubren el codificador visual, el proyector multimodal y el decodificador de lenguaje. El modelo base se carga en cuantización 4-bit NF4 mientras que los adaptadores se mantienen en float32, una configuración habitual en Unsloth para reducir memoria sin degradar la actualización de los pesos del adaptador.

El entrenamiento se realizó sobre `PandyaJeet/gemma4-plant-pathology-3k`, un conjunto multimodal de 3.375 muestras estratificadas (225 por clase en 15 clases), con enmascaramiento de pérdida limitado a la respuesta del asistente. La pérdida final de entrenamiento se sitúa en el rango aproximado de 0,090 a 0,139. La tarea combina tres objetivos: cadena de pensamiento visual macroscópica (`visual_evidence`), localización espacial de lesiones mediante cajas `[ymin, xmin, ymax, xmax]` en escala 0–1000 y diagnóstico diferencial con clases descartadas (`ruled_out`) y diagnóstico canónico entre 15 clases bloqueadas de tomate, patata y maíz, con guardarraíles para entradas fuera de dominio.

## Capacidades

- Generación de texto e imagen-a-texto conversacional con formato de chat multimodal.
- Diagnóstico de patología vegetal en 15 clases cerradas de tomate, patata y maíz.
- Razonamiento visual explícito mediante `visual_evidence` (cadena de pensamiento macroscópica).
- Localización espacial de lesiones con cajas delimitadoras en escala 0–1000 (`lesion_boxes`).
- Diagnóstico diferencial: enumera patologías descartadas en el campo `ruled_out`.
- Salida estructurada en JSON con campos `visual_evidence`, `lesion_boxes`, `species`, `diagnosis` e `immediate_summary`.
- Guardarraíles para entradas fuera de dominio (OOD), orientados a evitar diagnósticos forzados.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Triaje de campo con móvil: un técnico agrícola fotografía una hoja y el adaptador devuelve un JSON con especie, diagnóstico y cajas de lesión, lo que permite priorizar inspecciones sin conexión a un servicio centralizado.
- Asistencia a extensionistas agrícolas: el campo `ruled_out` ayuda a descartar patologías plausibles antes de un análisis de laboratorio, reduciendo el espacio de hipótesis en la conversación.
- Etiquetado asistido de datasets fitopatológicos: las cajas `[ymin, xmin, ymax, xmax]` en escala 0–1000 sirven como preanotación para modelos de detección de lesiones, con revisión humana posterior.
- Integración en pipelines de visión con salida estructurada: al devolver JSON estricto, el adaptador se puede encadenar con validadores de esquema, bases de datos de cultivos o sistemas de alerta temprana.
- Investigación en ajuste multimodal eficiente: sirve como referencia reproducible de rsLoRA sobre codificador visual, proyector y decodificador con Unsloth, útil para comparar estrategias de adaptación.
- Docencia y formación en patología vegetal: el campo `visual_evidence` expone el razonamiento del modelo y facilita la revisión crítica de sus conclusiones por parte de estudiantes.
- Despliegue en hardware de borde: al ser un adaptador de 0,2 GB sobre un modelo E4B cuantizable en 4-bit, es viable en estaciones de trabajo con GPU modesta para precribado en invernadero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de entrenamiento (aproximadamente 0,090–0,139) y el número de parámetros entrenables (39.481.344, un 0,4947 % del total), sin métricas de evaluación sobre conjuntos de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base se carga en 4-bit NF4, lo que reduce sustancialmente el requisito frente a precisión completa, pero no se publican cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el ejemplo oficial usa `load_in_4bit=True` y `.to("cuda")`, lo que sugiere viabilidad en GPU con soporte CUDA, sin modelo concreto indicado.
- Opciones de despliegue: el quickstart oficial emplea `FastVisionModel` de Unsloth; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores de patología vegetal sobre modelos vision-language) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador solo cubre 15 clases cerradas de tomate, patata y maíz; especies o patologías fuera de ese conjunto dependen de los guardarraíles OOD y no deben tratarse como diagnóstico válido.
- No se han publicado métricas de evaluación (exactitud, IoU de cajas, F1 por clase), por lo que el rendimiento real en producción es desconocido.
- Riesgo de alucinación inherente a los modelos generativos: el JSON puede contener diagnósticos plausibles pero incorrectos, especialmente con imágenes de baja calidad o iluminación atípica.
- Las cajas delimitadoras en escala 0–1000 requieren postprocesado para convertirse en píxeles y no se documenta su precisión espacial.
- No se especifican los idiomas soportados; el prompt del sistema del ejemplo está en inglés y no hay garantía de calidad en castellano.
- Uso comercial permitido por licencia Apache 2.0, pero conviene verificar también la licencia del modelo base `unsloth/gemma-4-E4B-it`, que puede imponer condiciones adicionales.
- El adaptador requiere descargar el modelo base completo; el repositorio de 0,2 GB no es autosuficiente.
- No se documentan sesgos demográficos, geográficos ni de sesgo de dataset; el conjunto de 3.375 muestras es pequeño y puede no representar la variabilidad real de campo.
- Advertencia de producción: cualquier diagnóstico fitosanitario debe validarse con un experto antes de tomar decisiones de tratamiento.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/PandyaJeet/gemma4-e4b-plant-pathology-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/PandyaJeet/gemma4-plant-pathology-3k
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
