# Ram20307/qwen3vl-2b-hico-merged

## Resumen

qwen3vl-2b-hico-merged es la fusión completa en bf16 del adaptador LoRA `Ram20307/qwen3vl-2b-hico-lora`, construido sobre Qwen3-VL-2B-Instruct. Lo publica el usuario Ram20307 y su propósito es especializar un modelo vision-language de 2.127 millones de parámetros en la detección de relaciones sujeto-objeto-acción, es decir, en la generación de *scene graphs* y la clasificación de interacciones humanas al estilo de los conjuntos de datos Action Genome/Charades y HICO-DET.

El modelo hereda la arquitectura transformer multimodal de Qwen3-VL (torre visual más decoder de lenguaje) y añade un ajuste fino orientado a una tarea muy concreta: dado un par imagen-texto, producir anotaciones estructuradas de acciones e interacciones. No es un modelo de propósito general, sino una herramienta de investigación para tareas de comprensión de escenas y reconocimiento de acciones.

Su relevancia es limitada y muy específica: resulta útil como referencia para quien quiera reproducir o extender pipelines de scene-graph con un modelo pequeño (2B) que cabe en GPU de consumo, pero su licencia efectiva queda restringida por las condiciones de los datos de entrenamiento (Action Genome/Charades y HICO-DET son de uso exclusivamente investigador), a pesar de que el repositorio declare apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (Qwen3-VL: torre visual + decoder de lenguaje) |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 declarada en el repositorio; uso efectivo restringido a investigación por las licencias de los datos de entrenamiento |
| Formato de pesos | safetensors (transformers), tamano del repo 4,3 GB |

## Arquitectura y entrenamiento

El modelo es un Qwen3-VL-2B-Instruct completo cuyos pesos se han fusionado con un adaptador LoRA entrenado para la tarea de scene-graph y detección de interacciones humano-objeto. La arquitectura subyacente es la de Qwen3-VL: un encoder visual que proyecta las imágenes a tokens y un decoder de lenguaje autorregresivo que genera la salida textual estructurada. Al tratarse de una fusión de LoRA, no hay cambios en la topología de la red, solo en los pesos.

Los detalles de entrenamiento (número de tokens, composición exacta del dataset, hiperparámetros del LoRA, uso de RLHF/DPO) no se recogen en la información disponible y se remiten a la model card del adaptador `Ram20307/qwen3vl-2b-hico-lora`. Lo que sí se indica es que los datos provienen de Action Genome/Charades y HICO-DET, ambos conjuntos de anotaciones de acciones e interacciones para investigación.

## Capacidades

- Generación de texto e imagen-texto a texto en formato conversacional.
- Descripción estructurada de escenas: relaciones sujeto-predicado-objeto y anotaciones de acciones.
- Detección de interacciones humano-objeto orientada a los esquemas de HICO-DET y Action Genome.
- Procesamiento de imágenes junto con prompts textuales (pipeline `image-text-to-text`).
- Compatibilidad con `transformers` y con endpoints compatibles (tag `endpoints_compatible`).
- Soporte de tool calling, agentes, modo thinking, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Anotación asistida de datasets de acciones: usar el modelo para pre-etiquetar pares imagen-interacción en Action Genome o HICO-DET y reducir el esfuerzo manual de revisión.
- Investigación en scene-graph generation: generar tripletas sujeto-acción-objeto sobre imágenes de interiores y evaluar su calidad frente a anotaciones ground truth.
- Reconocimiento de actividades en vídeo (muestreo de frames): clasificar interacciones humanas en fotogramas clave para pipelines de análisis de comportamiento.
- Prototipado de sistemas de accesibilidad: describir qué está haciendo una persona y con qué objetos en una imagen, con un modelo de 2B que cabe en GPU de consumo.
- Evaluación comparativa de modelos pequeños: servir como baseline especializado frente a modelos generalistas de mayor tamaño en tareas de comprensión de relaciones.
- Docencia y experimentación: reproducir el flujo LoRA + merge sobre Qwen3-VL-2B para estudiar ajuste fino multimodal en un entorno de recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite las métricas de evaluación a la ficha del adaptador `Ram20307/qwen3vl-2b-hico-lora`, que no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4,3 GB solo para pesos, más overhead de activaciones y del encoder visual; en la práctica se recomienda al menos 8-12 GB para contextos e imágenes razonables.
- GPU recomendadas: RTX 3090/4090 (24 GB) para bf16 sin problemas; A100/H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB o superiores en bf16; en GPUs de 8 GB requeriría cuantización, cuyos formatos no están documentados.
- Opciones de despliegue: `transformers` (librería declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3vl-2b-hico-merged | 2,13 B | no disponible | Scene-graph / HICO-DET | apache-2.0 declarada, uso investigador por datos | Hugging Face |
| Qwen3-VL-2B-Instruct (base) | ~2 B | no disponible | Vision-language general | apache-2.0 | Hugging Face |
| Ram20307/qwen3vl-2b-hico-lora (adaptador) | ~2 B + LoRA | no disponible | Scene-graph / HICO-DET | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Restricción de uso comercial: aunque el repositorio declara apache-2.0, los datos de entrenamiento (Action Genome/Charades y HICO-DET) son de uso exclusivamente investigador, lo que en la práctica limita el uso comercial del modelo.
- Especialización estrecha: el ajuste fino puede degradar capacidades generales de Qwen3-VL-2B-Instruct fuera del dominio de scene-graph e interacciones.
- Riesgo de alucinación en la generación de relaciones y acciones, especialmente con objetos o acciones poco representados en los datasets de entrenamiento.
- Sesgos heredados de los datasets: vocabulario cerrado de acciones y objetos de HICO-DET/Action Genome, con posible sesgo hacia escenas y contextos sobrerrepresentados.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingüe tras el ajuste fino.
- Longitud de contexto no disponible; no se puede garantizar el manejo de entradas largas o múltiples imágenes.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes independientes de calidad.
- Fecha de creación registrada en 2026-11-04, lo que conviene verificar antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ram20307/qwen3vl-2b-hico-merged
- Adaptador LoRA base: https://huggingface.co/Ram20307/qwen3vl-2b-hico-lora
- Action Genome: no disponible en la información proporcionada
- HICO-DET: no disponible en la información proporcionada
- Qwen3-VL (modelo base): no disponible en la información proporcionada
