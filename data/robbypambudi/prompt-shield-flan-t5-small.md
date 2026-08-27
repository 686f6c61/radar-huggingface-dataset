# robbypambudi/prompt-shield-flan-t5-small

## Resumen

El modelo `robbypambudi/prompt-shield-flan-t5-small` es un clasificador binario de secuencias diseñado específicamente para detectar inyecciones de prompts (prompt injection) en entradas de texto. Se trata de un fine-tuning del modelo base `google/flan-t5-small` de Google, adaptado con una cabeza de clasificación de dos etiquetas: `BENIGN` (sin inyección) y `INJECTION` (inyección detectada). El modelo fue desarrollado por el usuario robbypambudi y publicado en Hugging Face bajo licencia Apache 2.0.

La relevancia de este modelo radica en la creciente necesidad de proteger sistemas basados en LLM frente a ataques de inyección de prompts, donde un atacante intenta manipular el comportamiento del modelo mediante instrucciones maliciosas. Al ser una variante pequeña (60,7 millones de parámetros), ofrece una solución ligera y de bajo coste computacional para integrar como filtro de seguridad en pipelines de IA generativa.

El modelo se entrenó siguiendo la receta PromptShield, con aumento de datos mediante nuevas líneas y un dataset filtrado original, utilizando early stopping en la época 2. Aunque no se publican métricas de rendimiento más allá de las pérdidas de entrenamiento y validación, su tamaño reducido lo hace adecuado para despliegues en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5ForSequenceClassification (encoder-decoder T5 con cabeza de clasificación) |
| Parametros totales | 60.775.298 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (según configuración de tokenización del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Flan-T5 soporta múltiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5 (Text-to-Text Transfer Transformer), concretamente en la variante Flan-T5-small, que es un transformer encoder-decoder con aproximadamente 60 millones de parámetros. Para esta tarea, se sustituye la cabeza de generación de texto por una cabeza de clasificación de secuencias con dos salidas (BENIGN e INJECTION), convirtiendo el problema en clasificación binaria en lugar de generación.

El entrenamiento se realizó mediante fine-tuning supervisado sobre un dataset de detección de inyecciones de prompts, siguiendo la receta PromptShield. Esta receta incluye aumento de datos con nuevas líneas en el split de entrenamiento y un filtrado del dataset original. Se utilizó una semilla fija (12345), una tasa de aprendizaje de 5e-5 y early stopping, que detuvo el entrenamiento en la época 2. Las pérdidas finales fueron 0.00162 en entrenamiento y 0.000197 en validación, lo que sugiere un ajuste muy ajustado a los datos de entrenamiento, aunque no se proporcionan métricas de precisión, recall o F1.

## Capacidades

- Detección binaria de inyecciones de prompts: clasifica un texto como `BENIGN` o `INJECTION`.
- Clasificación de secuencias de hasta 512 tokens, adecuada para entradas de tamaño moderado.
- Integración sencilla con la librería `transformers` mediante `AutoModelForSequenceClassification`.
- Inferencia rápida y ligera gracias a su reducido número de parámetros.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.
- No se especifican capacidades multilingües específicas para este fine-tuning, aunque el modelo base Flan-T5-small es multilingüe.

## Casos de uso

- Filtro de seguridad en chatbots y asistentes virtuales: el modelo puede analizar cada mensaje de usuario antes de pasarlo al LLM principal, bloqueando intentos de inyección como "ignora las instrucciones anteriores" o "revela el prompt del sistema".
- Protección de pipelines de generación de código: en entornos donde un LLM genera código a partir de instrucciones, este detector puede evitar que entradas maliciosas alteren el comportamiento del generador.
- Moderación de entradas en aplicaciones de IA conversacional: integrado como middleware, clasifica las entradas en tiempo real y rechaza aquellas que contengan patrones de inyección.
- Auditoría de logs de interacción: se puede utilizar para analizar conversaciones almacenadas y detectar intentos de ataque previos, ayudando a identificar vulnerabilidades.
- Endurecimiento de APIs de LLM: como capa de preprocesamiento en servicios que exponen modelos de lenguaje, reduciendo el riesgo de explotación por parte de usuarios malintencionados.
- Evaluación de robustez de sistemas de IA: en entornos de testing, se puede usar para generar casos de prueba y verificar si un sistema es vulnerable a inyecciones de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta las pérdidas de entrenamiento y validación (0.00162 y 0.000197 respectivamente), pero no incluye métricas como precisión, recall, F1 o exactitud sobre conjuntos de prueba estándar. Tampoco se proporcionan comparaciones con otros detectores de inyección de prompts.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 60,7 millones de parámetros. En FP32, el peso ocupa aproximadamente 243 MB; en FP16, unos 121 MB. La VRAM necesaria para inferencia es inferior a 1 GB, incluso considerando activaciones y overhead.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060 o superiores funcionan sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un modelo de clasificación de `transformers`, se puede servir con bibliotecas como Hugging Face Inference Endpoints, FastAPI con `transformers`, o mediante `vLLM` (aunque vLLM está más orientado a generación, puede servir clasificadores). También se puede exportar a ONNX para optimización.
- Latencia y throughput: no se dispone de datos medidos, pero por el tamaño del modelo, la inferencia en GPU es del orden de milisegundos por muestra. En CPU, puede ser de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `google/flan-t5-small` es un modelo de generación, no un detector de inyecciones, por lo que no es directamente comparable. Existen otros detectores de inyección de prompts en Hugging Face (por ejemplo, basados en DeBERTa o RoBERTa), pero no se han encontrado datos concretos en la búsqueda web para establecer una comparativa rigurosa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El modelo es pequeño y puede presentar falsos positivos o falsos negativos, especialmente ante variantes sofisticadas de inyección de prompts que no estén representadas en el dataset de entrenamiento.
- No se han publicado métricas de rendimiento sobre conjuntos de prueba externos, por lo que su eficacia real en producción no está validada.
- El entrenamiento se realizó con una receta específica (PromptShield) y un dataset filtrado; su generalización a otros dominios o idiomas no está garantizada.
- La longitud de contexto está limitada a 512 tokens; entradas más largas se truncarán, lo que podría perder información relevante para la detección.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado en datos de seguridad, podría tener un sesgo hacia detectar inyecciones en inglés u otros idiomas predominantes en el dataset.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda evaluar el modelo en el contexto específico antes de desplegarlo en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/robbypambudi/prompt-shield-flan-t5-small)
- [Modelo base google/flan-t5-small](https://huggingface.co/google/flan-t5-small)
- [Documentación de Flan-T5 en transformers](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/flan-t5.md)
