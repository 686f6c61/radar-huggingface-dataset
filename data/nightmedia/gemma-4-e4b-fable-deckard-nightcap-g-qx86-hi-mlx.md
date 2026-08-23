# nightmedia/gemma-4-E4B-Fable-Deckard-Nightcap-G-qx86-hi-mlx

## Resumen

El modelo `nightmedia/gemma-4-E4B-Fable-Deckard-Nightcap-G-qx86-hi-mlx` es un merge de tres modelos basados en Google Gemma 4 E4B, creado por el usuario nightmedia mediante la herramienta mergekit. Combina los pesos de `armand0e/Gemma-4-E4B-it-Fable-Distill`, `andyoneal/Gemma-4-E4B-Nightcap` y `DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking`, con el objetivo de fusionar capacidades de razonamiento, generación de texto y manejo de instrucciones en un solo modelo. El resultado es un modelo compacto de aproximadamente 2.65 mil millones de parámetros, orientado a despliegue en entornos con recursos limitados.

Este modelo se distribuye en formato MLX (Apple Silicon) y en cuantización de 8 bits, lo que lo hace adecuado para inferencia en dispositivos edge, portátiles y GPUs de consumo. Aunque no se han publicado resultados de benchmarks específicos, hereda las capacidades de la arquitectura Gemma 4, que soporta una ventana de contexto de hasta 256K tokens y multilingüismo en más de 140 idiomas, según la documentación oficial de Google. El acceso al repositorio está restringido (gated) y requiere aceptar condiciones adicionales en Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (Dense, basada en transformer) |
| Parametros totales | 2.651.780.426 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (según arquitectura Gemma 4) |
| Tipos de cuantizacion | 8-bit (MLX, formato q8) |
| Idiomas soportados | Más de 140 (según Gemma 4; no confirmado para este merge) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un merge de tres modelos basados en Gemma 4 E4B, realizado con mergekit. Los modelos base son:

- `armand0e/Gemma-4-E4B-it-Fable-Distill`: una destilación del modelo instructivo Gemma 4 E4B, enfocada en razonamiento y generación de texto.
- `DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking`: variante con énfasis en razonamiento "thinking" y sin censura.
- `andyoneal/Gemma-4-E4B-Nightcap`: modelo ajustado para tareas de conversación y asistencia.

La fusión busca combinar las fortalezas de cada uno: razonamiento profundo, creatividad y adherencia a instrucciones. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO), ya que se trata de un merge de pesos preexistentes. La arquitectura subyacente es la de Gemma 4 E4B, que es un modelo denso de 2.65B parámetros con atención completa, optimizado para despliegue en entornos con recursos limitados. La cuantización a 8 bits reduce el tamaño a aproximadamente 8.9 GB en el repositorio, incluyendo metadatos y posiblemente múltiples archivos de pesos.

## Capacidades

- Generación de texto y razonamiento avanzado: heredado de Gemma 4 E4B, capaz de resolver tareas de lógica, matemáticas y comprensión lectora.
- Soporte de instrucciones y diálogo multi-turno: gracias a los modelos base de tipo "instruct" y "chat".
- Codificación: la familia Gemma 4 incluye capacidades de generación de código, aunque no se especifican benchmarks para este merge.
- Multilingüismo: soporte para más de 140 idiomas según la arquitectura base, aunque la calidad puede variar en el merge.
- Posible capacidad multimodal: el pipeline se etiqueta como "any-to-any", lo que sugiere que podría manejar entradas y salidas de diferentes modalidades (texto, imagen, audio), aunque no hay confirmación en la documentación.
- No se confirma explícitamente el soporte de tool calling o function calling, pero es probable que esté presente en los modelos base instructivos.

## Casos de uso

- **Despliegue en dispositivos edge**: al ser un modelo compacto (2.65B) y cuantizado a 8 bits, puede ejecutarse en smartphones, Raspberry Pi o módulos de IA edge para tareas de generación de texto o resumen.
- **Asistentes conversacionales locales**: integrable en aplicaciones de chat que requieran privacidad, sin conexión a la nube, gracias a su tamaño reducido y formato MLX.
- **Generación de código en entornos con recursos limitados**: puede usarse en IDEs o pipelines de CI/CD para autocompletar código, aunque su rendimiento exacto en esta tarea no está medido.
- **Razonamiento en tiempo real**: para aplicaciones de análisis de texto, extracción de información o respuesta a preguntas en dispositivos con poca VRAM.
- **Prototipado rápido de agentes**: al ser un modelo instructivo, puede servir como base para experimentos de agentes conversacionales en investigación académica o desarrollo.
- **Educación y aprendizaje**: para generar explicaciones, resolver problemas matemáticos o crear contenido didáctico en entornos offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas propias, y la documentación de los modelos base (Gemma 4 E4B) no se ha detallado en esta ficha. Se recomienda evaluar el rendimiento con tareas específicas si se considera su uso en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 2.65B parámetros en cuantización 8-bit, se estima que ocupa aproximadamente 2.6 GB de memoria para los pesos. El repositorio tiene 8.9 GB, lo que puede incluir archivos adicionales o duplicados.
- **GPU recomendadas**: adecuado para GPUs de consumo con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o Apple Silicon con 8 GB de RAM unificada.
- **Despliegue en consumer**: sí, cabe en GPUs de gama media y en sistemas con poca memoria.
- **Opciones de despliegue**: al ser formato MLX, se puede usar con la librería MLX de Apple para macOS. También es posible convertirlo a otros formatos (GGUF, ONNX) para usarlo con llama.cpp, Ollama o vLLM, aunque no se ha probado en esos entornos.
- **Latencia y throughput**: no se proporcionan datos concretos. En un Mac M1/M2, se estima una generación de 20-40 tokens/segundo para un modelo de este tamaño, pero depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| **Gemma 4 E4B (base)** | 2.65B | 256K | Apache 2.0 | safetensors, MLX | Modelo oficial de Google, con benchmarks publicados |
| **Gemma 4 E2B (base)** | 2.0B | 256K | Apache 2.0 | safetensors, MLX | Variante más pequeña, menos capacidad |
| **Llama 3.2 3B** | 3.2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Competidor directo en tamaño, sin multilingüismo tan amplio |
| **Phi-3.5 mini** | 3.8B | 128K | MIT | safetensors, GGUF | Bueno en razonamiento, pero contexto menor |

Este merge no tiene benchmarks propios, por lo que la comparativa se basa en especificaciones técnicas. En tamaño, es similar a Gemma 4 E4B y Llama 3.2 3B, pero con un contexto superior (256K vs 128K). La licencia Apache 2.0 permite uso comercial sin restricciones, aunque el acceso al repositorio está limitado.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo está marcado como "gated", lo que requiere aceptar condiciones adicionales en Hugging Face antes de descargarlo, aunque la licencia sea Apache 2.0.
- **Falta de benchmarks**: no hay métricas de rendimiento publicadas para este merge, por lo que su calidad real es desconocida.
- **Riesgo de alucinación**: como modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- **Sesgos de los modelos base**: al ser un merge de modelos con distintos orígenes, puede heredar sesgos de cada uno, incluyendo contenido no censurado (el modelo base "HERETIC-UNCENSORED" puede generar contenido sensible).
- **Idiomas**: aunque Gemma 4 soporta 140+ idiomas, la calidad en idiomas minoritarios puede ser inferior en este merge.
- **Compatibilidad**: al ser formato MLX, no es directamente compatible con librerías estándar como Hugging Face Transformers sin conversión previa.
- **Uso en producción**: sin benchmarks ni pruebas adicionales, no se recomienda su uso en aplicaciones críticas sin evaluación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nightmedia/gemma-4-E4B-Fable-Deckard-Nightcap-G-qx86-hi-mlx
- Colección de modelos Gemma 4 de nightmedia: https://huggingface.co/collections/nightmedia/gemma-4
- Modelo base DavidAU (The DECKARD): https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking
- Modelo base andyoneal (Nightcap): https://huggingface.co/andyoneal/Gemma-4-E4B-Nightcap
- Modelo base armand0e (Fable-Distill): https://huggingface.co/armand0e/Gemma-4-E4B-it-Fable-Distill
- Documentación oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Guía de Gemma 4 para Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
