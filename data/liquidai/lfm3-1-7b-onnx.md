# LiquidAI/LFM3-1.7B-ONNX

## Resumen

LFM3-1.7B-ONNX es la versión en formato ONNX del modelo de lenguaje LFM3-1.7B desarrollado por Liquid AI, una empresa surgida del MIT especializada en arquitecturas de redes neuronales no convencionales. Este repositorio no contiene un modelo nuevo, sino una exportación del modelo base de 1.700 millones de parámetros optimizada para inferencia multiplataforma mediante ONNX Runtime, lo que permite ejecutarlo en CPU, GPU y otros aceleradores sin depender del ecosistema PyTorch.

El modelo base pertenece a la familia LFM3 (Liquid Foundation Models), que emplea una arquitectura híbrida propietaria en lugar de un transformer convencional. Con 1,7 mil millones de parámetros y soporte para 16 idiomas (entre ellos el castellano), está pensado para despliegues en entornos con recursos limitados donde se prioriza la eficiencia sobre la escala.

La relevancia de esta ficha radica en que la versión ONNX facilita la integración en aplicaciones de producción no basadas en Python, como servicios en C#, aplicaciones móviles o entornos edge, manteniendo las capacidades conversacionales y de generación de texto del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida propietaria de Liquid AI (LFM3); detalles completos en la model card del modelo base |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | q4 (1.63 GB), q4f32 (2.24 GB), q8 (2.27 GB), q4f16 (tamaño no especificado en el fragmento) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

El repositorio es una conversión a ONNX del modelo LiquidAI/LFM3-1.7B. La model card de esta versión remite explícitamente a la model card del modelo original para los detalles de arquitectura y entrenamiento, por lo que la información disponible aquí es limitada. Liquid AI describe sus modelos LFM como arquitecturas híbridas que combinan componentes de atención con capas de tipo state space, diseñadas para lograr una inferencia más eficiente en memoria y cómputo que los transformers estándar. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La aportación específica de este repositorio es la exportación a ONNX Runtime en varias precisiones (q4, q4f32, q8, q4f16), lo que permite ejecutar el modelo con cuantización de 4 y 8 bits sobre CPU. El repo tiene un tamaño total de 20,3 GB, lo que sugiere que incluye múltiples variantes de pesos además de los ficheros principales listados.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, etiqueta conversational).
- Soporte multilingüe en 16 idiomas, incluido el castellano.
- Inferencia multiplataforma mediante ONNX Runtime (CPU, y potencialmente otros execution providers).
- Cuantización integrada para despliegue en entornos con poca memoria.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el pipeline es únicamente text-generation).

## Casos de uso

- Asistentes conversacionales en aplicaciones de escritorio: la variante q4 (1,63 GB) permite empaquetar un chatbot local en una app de escritorio sin dependencias de Python ni de GPU, usando ONNX Runtime.
- Procesamiento de texto en el edge o dispositivos sin GPU: al ejecutarse en CPU con cuantización q8 o q4, encaja en entornos con recursos restringidos donde no es viable un modelo mayor.
- Integración en servicios backend en C#/.NET: ONNX Runtime tiene bindings nativos para .NET, lo que facilita incorporar generación de texto en arquitecturas empresariales no basadas en Python.
- Traducción y generación multilingüe ligera: con soporte para 16 idiomas, puede emplearse en tareas de reescritura, resumen o traducción asistida en aplicaciones internas.
- Prototipado rápido de funcionalidades de IA generativa: el tamaño reducido y el formato ONNX permiten validar ideas en local antes de escalar a modelos mayores.
- Moderación o clasificación de texto en pipelines de datos: un modelo de 1,7B puede generar etiquetas, resúmenes o reformulaciones dentro de un flujo ETL sin coste de API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la variante q4 ocupa 1,63 GB en disco y puede ejecutarse en CPU; q8 requiere 2,27 GB. La RAM necesaria en ejecución será algo superior al tamaño del fichero.
- GPU recomendadas: no especificadas en la información proporcionada. El repositorio está orientado a CPU según la columna "Device" de la tabla de ficheros.
- Cabe en GPU consumer: previsiblemente sí dada la cuantización, pero no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (librería declarada). Otras opciones como vLLM, llama.cpp o TGI no se mencionan para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con modelos de tamaño similar, por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia propia de Liquid AI marcada como "other"; es necesario revisar sus términos antes de un uso comercial.
- Al ser una versión cuantizada (q4, q8), puede haber una pérdida de calidad respecto al modelo base en precisión completa.
- La model card de esta versión remite al modelo original para detalles; la documentación propia es mínima.
- Riesgo de alucinación inherente a modelos de 1,7B: su capacidad de razonamiento y precisión factual es limitada en comparación con modelos mayores.
- No se dispone de información sobre sesgos, contexto máximo efectivo ni robustez multilingüe más allá de la lista de idiomas.
- El soporte de tool calling y comportamiento agéntico no está documentado en esta versión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
- Fichero q4: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX/blob/main/onnx/model_q4.onnx
- Fichero q4f32: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX/blob/main/onnx/model_q4f32.onnx
- Fichero q8: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX/blob/main/onnx/model_q8.onnx
