# hsk0201/gemma-4-26B-A4B-qat-oQ4e-fp16

## Resumen

Este repositorio contiene una cuantización del modelo Gemma 4 26B A4B de Google DeepMind, concretamente de la variante QAT (Quantization-Aware Training) de 4 bits, convertida al formato MLX con cuantización oQ4e y pesos en fp16. El autor, hsk0201, ha adaptado el modelo para ejecutarse eficientemente en Macs con Apple Silicon (M1/M2) mediante la librería MLX, incluyendo además los pesos del modelo draft para decodificación especulativa (multi-token prediction). El modelo base es un MoE (Mixture of Experts) con 26 mil millones de parámetros totales y 4 mil millones activos por token, con una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas según la documentación de Google. La relevancia de esta cuantización radica en que permite ejecutar un modelo de gran tamaño en hardware de consumo, con una huella de memoria reducida, manteniendo capacidades de tool calling y razonamiento avanzado. El autor ha introducido modificaciones en el chat template para hacerlo más robusto en flujos de trabajo con herramientas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Transformer, con decodificación especulativa (modelo draft MTP) |
| Parametros totales | 26B (según denominación del modelo); el archivo safetensors del repo contiene 4.520.676.642 parámetros (cuantización oQ4e) |
| Parametros activos | 4B (A4B) |
| Longitud de contexto | 256K tokens (según modelo base) |
| Tipos de cuantizacion | oQ4e (4-bit) con pesos fp16; también incluye safetensors para el modelo draft MTP |
| Idiomas soportados | No disponible en el repo; el modelo base soporta más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B A4B, una arquitectura MoE con 26B parámetros totales y 4B activos por token, diseñada por Google DeepMind. Este repositorio parte de la versión QAT (Quantization-Aware Training) de 4 bits, que ha sido entrenada específicamente para minimizar la pérdida de calidad al cuantizar. El autor ha aplicado una cuantización oQ4e (optimizada para MLX) y ha convertido los pesos a formato safetensors con precisión fp16 para la cabecera. No se dispone de información detallada sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La innovación técnica principal de este repo es la modificación del chat template original, que incluye siete cambios: normalización del campo `type` en las declaraciones de herramientas, inyección de una directiva de sistema que obliga al uso de herramientas cuando están disponibles, reordenación del contenido (primero la explicación textual, luego la llamada a herramienta), eliminación de la inyección de pensamiento vacía, preservación mejorada de razonamiento intermedio, y un mecanismo de estado causal explícito para gestionar turnos y respuestas de herramientas de forma determinista, lo que facilita la construcción de prompts append-only y la reutilización de caché.

## Capacidades

- Generación de texto, razonamiento complejo, código y matemáticas, según las capacidades del modelo base Gemma 4.
- Soporte nativo de tool calling y function calling, con un chat template modificado que fuerza el uso de herramientas cuando están disponibles y maneja respuestas estructuradas de forma robusta.
- Soporte para flujos de agentes y razonamiento multi-paso, incluyendo preservación de mensajes de razonamiento intermedio.
- Capacidades multilingües en más de 140 idiomas (según modelo base).
- Longitud de contexto de hasta 256K tokens, adecuada para documentos extensos y conversaciones largas.
- El modelo base es multimodal (entrada de texto e imagen), aunque esta capacidad no está confirmada explícitamente en este repo.
- Incluye modelo draft para decodificación especulativa, lo que acelera la inferencia sin pérdida de calidad.

## Casos de uso

- Atención al cliente automatizada: con 256K tokens de contexto y tool calling robusto, el modelo puede gestionar conversaciones multi-turno, consultar bases de datos de productos o sistemas de tickets, y proporcionar respuestas precisas sin alucinar datos no verificados.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar o completar código, invocando herramientas como linters o compiladores cuando sea necesario.
- Agentes autónomos de investigación: el modelo puede orquestar búsquedas web, consultas a APIs y resúmenes de documentos extensos, manteniendo el estado de la tarea a lo largo de múltiples pasos.
- Análisis de documentos legales o técnicos: la ventana de contexto de 256K tokens permite procesar contratos completos, informes o manuales, extrayendo cláusulas relevantes y respondiendo preguntas específicas.
- Asistentes de traducción y localización: su soporte multilingüe y su capacidad de razonamiento permiten traducir textos largos manteniendo coherencia contextual y terminológica.
- Desarrollo de chatbots con memoria persistente: gracias a la preservación de razonamiento y al manejo explícito de turnos, puede mantener conversaciones coherentes a lo largo de sesiones largas, útil en aplicaciones de coaching o tutoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio está diseñado para Macs con Apple Silicon (M1/M2) mediante la librería MLX.
- Tamaño del repositorio: 15.7 GB, por lo que se recomienda un mínimo de 16 GB de memoria unificada para cargar el modelo en memoria.
- Para M1/M2 con 16 GB, puede ejecutarse con cuantización oQ4e y fp16, aunque el rendimiento dependerá del número de tokens generados por segundo, que no se especifica.
- No está indicado para GPUs NVIDIA o AMD, ya que el formato MLX es específico de Apple.
- Opciones de despliegue: MLX (librería nativa), posible conversión a GGUF para llama.cpp u Ollama, aunque no está incluida en el repo.
- La decodificación especulativa (MTP) puede acelerar la inferencia, pero requiere cargar también los pesos del modelo draft.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B (base) | 26B | 4B | 256K | Apache 2.0 | Hugging Face |
| Este repo (oQ4e MLX) | 26B (cuantizado) | 4B | 256K | Apache 2.0 | Hugging Face |
| Qwen2.5-32B-A3B (referencia) | 32B | 3B | 128K | Apache 2.0 | Hugging Face |
| DeepSeek-V2-Lite (referencia) | 16B | 2.4B | 128K | MIT | Hugging Face |

Nota: no se dispone de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización oQ4e puede introducir una ligera degradación en la calidad de generación en comparación con el modelo original sin cuantizar, especialmente en tareas de precisión numérica o razonamiento lógico extenso.
- Las modificaciones del chat template son específicas de este repo y pueden no ser compatibles con todos los frameworks de inferencia; se recomienda evaluar en el propio dataset antes de usarlo en producción.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje; la directiva de sistema inyectada para forzar el uso de herramientas reduce la probabilidad de respuestas inventadas, pero no la elimina por completo.
- La preservación de razonamiento intermedio puede aumentar el tamaño del prompt y ralentizar la inferencia en conversaciones largas.
- No se confirma la capacidad multimodal en este repo específico, aunque el modelo base la soporta.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente y cumplir con los términos de Google sobre el modelo Gemma.
- No hay información sobre el rendimiento en hardware distinto a Apple Silicon; el formato MLX no es ejecutable en GPUs NVIDIA sin conversión previa.

## Enlaces

- Repositorio Hugging Face: [hsk0201/gemma-4-26B-A4B-qat-oQ4e-fp16](https://huggingface.co/hsk0201/gemma-4-26B-A4B-qat-oQ4e-fp16)
- Modelo base: [google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- Model card oficial de Gemma 4: [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4)
- Documentación general de Gemma 4: [Gemma 4 model overview](https://ai.google.dev/gemma/docs/core)
- Página en LM Studio: [google/gemma-4-26b-a4b-qat](https://lmstudio.ai/models/google/gemma-4-26b-a4b-qat)
