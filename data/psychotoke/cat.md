# Psychotoke/cat

## Resumen

Psychotoke/cat es un modelo de lenguaje de texto, fine-tuneado a partir de `unsloth/gemma-3-1b-it-unsloth-bnb-4bit`, un checkpoint de Gemma 3 1B IT en cuantización 4-bit. El autor, Psychotoke, lo ha entrenado con las librerías Unsloth y TRL de Hugging Face, lo que indica un proceso de fine-tuning eficiente sobre un modelo base ya optimizado para instrucciones y conversación. El modelo se distribuye con licencia Apache-2.0 y está pensado para generación de texto en inglés.

Con aproximadamente 1.000 millones de parámetros (999.885.952), se trata de un modelo compacto, adecuado para entornos con recursos limitados o para tareas de inferencia rápida. Al ser un fine-tune de Gemma 3 1B IT, hereda las capacidades generales de la familia Gemma 3, aunque la model card no proporciona detalles sobre el dataset de entrenamiento, el método de ajuste (RLHF, DPO, etc.) ni las tareas específicas para las que fue optimizado. Su relevancia actual radica en ser un ejemplo de fine-tuning accesible sobre un modelo base pequeño, con licencia permisiva y fácilmente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 1B) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 1B soporta 32k, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible (el modelo base usa bnb-4bit, pero los pesos subidos están en safetensors sin especificar precisión) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/gemma-3-1b-it-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4-bit de Gemma 3 1B IT. Gemma 3 es una familia de modelos transformer decoder-only desarrollada por Google, con atención global y ventana de contexto amplia (32k en la versión base). El fine-tuning se realizó con Unsloth, una librería que acelera el entrenamiento y reduce el uso de memoria, y con la librería TRL de Hugging Face, que proporciona herramientas para fine-tuning con aprendizaje por refuerzo (RLHF, DPO, etc.). Sin embargo, la model card no especifica el dataset utilizado, el número de pasos de entrenamiento, ni si se aplicó alguna técnica de alineación adicional. Tampoco se indica si se usó decodificación especulativa u otras innovaciones técnicas.

## Capacidades

- Generación de texto en inglés, orientada a conversación e instrucciones, heredada del modelo base Gemma 3 1B IT.
- Razonamiento básico y respuesta a preguntas, dentro de las limitaciones de un modelo de 1B de parámetros.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero Gemma 3 1B IT incluye capacidades de tool calling en su versión original; no se documenta si el fine-tune las conserva.
- Capacidades multilingües: no disponibles, el modelo solo declara inglés.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Chatbots ligeros para atención al cliente: al ser un modelo pequeño, puede desplegarse en entornos con poca VRAM y responder consultas sencillas en inglés, aunque su limitada capacidad de razonamiento puede requerir supervisión humana.
- Generación de respuestas automáticas en foros o comunidades: útil para redactar borradores de respuestas a preguntas frecuentes, dado su entrenamiento en instrucciones.
- Prototipado rápido de aplicaciones de lenguaje: sirve como base para pruebas de concepto de agentes conversacionales o asistentes virtuales sin necesidad de grandes recursos.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo compacto y con licencia Apache-2.0, puede reentrenarse para tareas concretas como clasificación de textos o generación de contenido técnico.
- Educación y experimentación: adecuado para aprender sobre fine-tuning y despliegue de modelos pequeños, gracias a su bajo coste computacional.
- Inferencia en dispositivos edge: con cuantización adicional (por ejemplo, GGUF), podría ejecutarse en CPUs o GPUs de baja gama para aplicaciones offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parámetros, en precisión fp16 necesitaría aproximadamente 2 GB de VRAM; en cuantización 4-bit (como el modelo base) podría reducirse a ~0.5-1 GB, pero no se especifica la precisión de los pesos subidos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) sería suficiente para inferencia en fp16. Para cuantización 4-bit, incluso GPUs integradas podrían ser viables.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI), vLLM, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Psychotoke/cat | ~1B | no disponible | Apache-2.0 | Hugging Face |
| Gemma 3 1B IT (base) | 1B | 32k | Gemma Terms of Use | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características generales. Psychotoke/cat es un fine-tune del modelo base Gemma 3 1B IT, por lo que su comportamiento debería ser similar, aunque sin garantías de mejora en tareas específicas.

## Limitaciones y advertencias

- No se ha documentado el proceso de entrenamiento (dataset, épocas, método de alineación), por lo que no se puede evaluar su robustez ni su sesgo.
- Al ser un modelo de 1B, su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código es limitada en comparación con modelos más grandes.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios no cubiertos por su entrenamiento.
- Solo soporta inglés; no es adecuado para tareas multilingües.
- No se han realizado evaluaciones de seguridad ni de sesgos; el fine-tune podría amplificar sesgos presentes en el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma 3 tiene sus propios términos de uso (Gemma Terms of Use) que pueden imponer restricciones adicionales; se recomienda revisarlos antes de usar el modelo en producción.
- No hay garantía de que las capacidades de tool calling o agentes del modelo base se conserven tras el fine-tune.

## Enlaces

- Hugging Face: https://huggingface.co/Psychotoke/cat
- Modelo base: https://huggingface.co/unsloth/gemma-3-1b-it-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
