# Orvena/Orvena-4B-MLX-4bit

## Resumen

Orvena 4B MLX 4-bit es la versión cuantizada en 4 bits para el framework MLX de Apple del modelo Orvena 4B, desarrollado por el equipo de Orvena (orvena.app). Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3.5-4B, afinado específicamente para uso de herramientas (tool use y function calling) en dispositivos móviles, en concreto el iPhone. El modelo está pensado para ejecutarse en local dentro de una aplicación iOS, sin depender de servidores externos.

La propuesta de valor es clara: un modelo de 4.539 millones de parámetros (aproximadamente 4,5 mil millones) que cabe en 3,1 GB de pesos, incluye el codificador visual y está entrenado para invocar herramientas en 30 idiomas. Según la model card, supera a su modelo base en la tarea específica de uso de herramientas en teléfono, lo que indica que el ajuste fino se orientó a ese dominio concreto.

Es relevante ahora porque representa una de las primeras incursiones documentadas de modelos multimodales con capacidad de tool calling diseñados explícitamente para inferencia on-device en hardware de consumo (iPhone 17 Pro Max), con licencia Apache-2.0 y pesos en formato MLX listos para integrarse en aplicaciones Swift mediante mlx-swift-lm.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-4B |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit MLX con group size 64 (~4,5 bits por peso incluyendo escalas) |
| Idiomas soportados | 30 idiomas (lista concreta no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 3,1 GB en total incluyendo codificador visual |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, un transformer multimodal que combina un codificador visual con un modelo de lenguaje. La versión aquí descrita es la build MLX cuantizada en 4 bits con group size de 64, lo que resulta en aproximadamente 4,5 bits por peso incluyendo las escalas de cuantización. El codificador visual está incluido en el paquete de 3,1 GB. La cabeza de predicción multi-token (multi-token prediction head) solo está presente en el repositorio bf16, ya que Orvena no la utiliza en el teléfono.

El ajuste fino se orientó específicamente al uso de herramientas en dispositivos móviles en 30 idiomas. Según la información disponible, el modelo fue entrenado con un template de chat que responde sin modo "thinking" a menos que se active `enable_thinking`, lo que coincide con el régimen de entrenamiento. La model card remite al informe técnico (Orvena-4B-technical-report.pdf) para detalles sobre datos, entrenamiento y evaluación, pero no se proporcionan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno.
- Comprensión de imágenes (pipeline image-text-to-text con codificador visual incluido).
- Uso de herramientas (tool use) y function calling, capacidad para la que fue específicamente entrenado.
- Ejecución on-device en iPhone mediante MLX y mlx-swift-lm.
- Soporte multilingüe en 30 idiomas.
- Modo "thinking" opcional, desactivado por defecto y activable mediante el flag `enable_thinking`.
- Integración con aplicaciones Swift a través de `VLMModelFactory` de mlx-swift-lm.
- No se dispone de información sobre capacidades de agentes multi-paso, razonamiento matemático avanzado o generación de código más allá de lo que implica el tool calling.

## Casos de uso

- Asistentes móviles con invocación de herramientas: el modelo puede gestionar conversaciones en las que el usuario pide acciones (consultar el calendario, enviar mensajes, buscar información) y el modelo emite llamadas a funciones estructuradas, gracias a su entrenamiento específico en tool use sobre teléfono.
- Aplicaciones iOS totalmente offline: al ejecutarse con MLX en el dispositivo, permite asistentes que funcionan sin conexión y sin enviar datos a servidores, adecuado para escenarios de privacidad.
- Descripción y análisis de imágenes en local: con el codificador visual incluido, puede procesar fotos tomadas con el iPhone y responder preguntas sobre ellas dentro de la misma aplicación.
- Automatización de tareas del sistema en 30 idiomas: útil para aplicaciones que necesitan interpretar comandos en varios idiomas y traducirlos en llamadas a APIs del sistema.
- Prototipado rápido de funciones de IA en apps Swift: al integrarse con mlx-swift-lm mediante `VLMModelFactory`, los desarrolladores pueden añadir capacidades de IA generativa y tool calling sin infraestructura de servidor.
- Atención al cliente embebida en la app: conversaciones multi-turno con contexto gestionado localmente, sin coste de inferencia en la nube y con latencia medida en el propio dispositivo (mediana de 15,1 s por tarea en iPhone 17 Pro Max según la model card).

## Benchmarks y rendimiento

| Benchmark | Orvena 4B (esta build) | Modelo base |
|---|---|---|
| Orvena bench (547 tareas de teléfono, 30 idiomas) | 440 aciertos (80,4%) | 345 aciertos (63,1%) |
| Latencia mediana por tarea (iPhone 17 Pro Max) | 15,1 s | 37,0 s (con thinking en auto) |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. La model card remite al informe técnico para resultados completos.

## Requisitos de hardware

- Tamaño de pesos: 3,1 GB en total (incluye codificador visual), lo que determina el espacio de almacenamiento y la memoria necesaria para cargar el modelo.
- Diseñado para ejecución on-device en iPhone; la model card cita el iPhone 17 Pro Max como referencia de rendimiento (15,1 s de mediana por tarea).
- Al estar en formato MLX, el despliegue natural es mediante mlx-swift-lm en aplicaciones Swift/iOS y mediante MLX en macOS con chips Apple Silicon.
- No se dispone de información sobre VRAM estimada para GPUs NVIDIA, ni sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es MLX y la librería declarada es mlx.
- Throughput y latencia en otros dispositivos distintos del iPhone 17 Pro Max: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|
| Orvena 4B MLX 4-bit | 4.539 M | no disponible | Sí | Sí (entrenado para ello) | Apache-2.0 | MLX safetensors |
| Orvena 4B (bf16) | 4.539 M | no disponible | Sí | Sí | Apache-2.0 | safetensors |
| Qwen3.5-4B | ~4B (no confirmado en la información) | no disponible | no disponible | no disponible | Apache-2.0 (según la model card) | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de alternativas comparables para establecer una comparación cuantitativa. La comparativa se limita a la relación con su modelo base y con Qwen3.5-4B, del que deriva.

## Limitaciones y advertencias

- No se han publicado en la información disponible datos sobre sesgos conocidos del modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documenta mitigación específica.
- La longitud de contexto no está especificada, lo que impide planificar aplicaciones que requieran ventanas largas.
- La lista concreta de los 30 idiomas soportados no está disponible.
- El modo "thinking" está desactivado por defecto; activarlo cambia el comportamiento y, presumiblemente, la latencia (el modelo base con thinking en auto tarda 37,0 s frente a 15,1 s de esta build, aunque la comparación no es directa).
- La licencia Apache-2.0 permite uso comercial, pero se debe consultar el archivo NOTICE que lista los cambios respecto a Qwen.
- El formato MLX limita el despliegue a ecosistemas Apple (iOS/macOS); no es directamente utilizable en GPUs NVIDIA ni en servidores Linux convencionales sin conversión.
- El rendimiento medido corresponde a un iPhone 17 Pro Max; en dispositivos con menos memoria o cómputo el rendimiento puede degradarse de forma no documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Orvena/Orvena-4B-MLX-4bit
- Modelo base: https://huggingface.co/Orvena/Orvena-4B
- Informe técnico: https://huggingface.co/Orvena/Orvena-4B/blob/main/Orvena-4B-technical-report.pdf
- Licencia: https://huggingface.co/Orvena/Orvena-4B-MLX-4bit/blob/main/LICENSE
- Sitio de Orvena: https://orvena.app
- MLX: https://github.com/ml-explore/mlx
- mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm
