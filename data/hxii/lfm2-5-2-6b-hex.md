# hxii/LFM2.5-2.6B-Hex

## Resumen

LFM2.5-2.6B-Hex es un fine-tune del modelo LFM2.5-2.6B de Liquid AI, creado por el usuario hxii con el objetivo de mejorar las capacidades de razonamiento y tool calling para su asistente personal de tipo agente llamado "hex". El modelo base es un transformer denso de 2.600 millones de parámetros, diseñado específicamente para cargas de trabajo agénticas, con una ventana de contexto de 128.000 tokens y soporte nativo de llamada a herramientas. El fine-tune se realizó sobre el dataset Skyhigh-2203/MiMo-2.5-Pro-Reasoning-Traces-Hard, que contiene trazas de razonamiento de alta dificultad, y el autor reporta mejoras subjetivas en su propio benchmark (hexbench), aunque no se han publicado métricas detalladas.

La relevancia de este modelo radica en que combina la eficiencia de un modelo pequeño (2.6B) con una ventana de contexto amplia y capacidades de agente, lo que lo hace adecuado para despliegue en dispositivos con recursos limitados. Al ser un fine-tune de un modelo de pesos abiertos, ofrece una alternativa personalizable para desarrolladores que necesitan un asistente local con razonamiento mejorado. Sin embargo, al ser un trabajo independiente no oficial de Liquid AI, su calidad y consistencia dependen del dataset y del proceso de ajuste del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (dense, no MoE) |
| Parametros totales | 2.6B (2.69B en checkpoint BF16) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF (varias, no especificadas); BF16 en safetensors |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B utiliza la arquitectura LFM2 de Liquid AI, una evolución de su diseño anterior que combina eficiencia computacional con capacidades de razonamiento. Es un modelo denso (no MoE) de 2.600 millones de parámetros, entrenado específicamente para tareas agénticas, con una ventana de contexto de 128.000 tokens y soporte nativo de tool calling. Según la documentación de Liquid AI, incorpora un modo de razonamiento explícito que puede activarse para problemas complejos, a costa de mayor latencia y consumo de tokens. No se han publicado detalles sobre el dataset de preentrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo base.

El fine-tune LFM2.5-2.6B-Hex se realizó mediante ajuste supervisado (SFT) sobre el dataset Skyhigh-2203/MiMo-2.5-Pro-Reasoning-Traces-Hard, que contiene trazas de razonamiento de alta dificultad. El autor no especifica el número de épocas, la tasa de aprendizaje ni otros hiperparámetros. Tampoco se indica si se utilizaron técnicas adicionales como DPO o RLHF. El objetivo declarado es mejorar el razonamiento y la llamada a herramientas para su asistente personal "hex".

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento explícito heredado del modelo base.
- Tool calling / function calling nativo, optimizado para agentes que necesitan invocar herramientas externas.
- Soporte para tareas agénticas: planificación, ejecución de pasos múltiples y gestión de contexto largo (128K tokens).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Eficiencia en dispositivos: decode a 220 tokens/s en Apple M5 Max y 113 tokens/s en AMD Ryzen AI Max+ 395 (datos del modelo base).
- El fine-tune añade mejoras en razonamiento y tool calling según el benchmark propio del autor, aunque no se han publicado métricas detalladas.

## Casos de uso

- Asistente personal local en portátiles o dispositivos edge: el modelo puede gestionar conversaciones multi-turno con contexto largo (128K tokens) y ejecutar tareas como gestión de calendario, envío de correos o búsqueda web mediante tool calling, todo sin conexión a la nube.
- Agente de automatización de tareas en entornos de desarrollo: integrado en un IDE o CLI, puede razonar sobre código, invocar herramientas de compilación o test, y ejecutar flujos multi-paso con baja latencia.
- Chatbot de atención al cliente en dispositivos con recursos limitados: su tamaño reducido (menos de 2.5 GB en cuantización) permite desplegarlo en hardware modesto, manteniendo un historial de conversación amplio gracias a su ventana de contexto.
- Asistente de investigación personal: puede procesar documentos largos (artículos, informes) y responder preguntas complejas con razonamiento explícito, útil para estudiantes o profesionales que necesitan análisis local.
- Agente de automatización del hogar: con tool calling nativo, puede controlar dispositivos IoT, gestionar rutinas y responder a comandos de voz con razonamiento contextual.
- Prototipado de agentes en entornos de desarrollo: su licencia abierta y su formato GGUF permiten experimentar con arquitecturas de agentes en CPU o GPU de gama baja antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del fine-tune LFM2.5-2.6B-Hex en la información disponible. El autor menciona mejoras en su propio benchmark (hexbench, disponible en https://0xff.nu/hexbench/), pero no se proporcionan los números concretos. Para el modelo base LFM2.5-2.6B, BenchLM.ai reporta una puntuación de 42.87/100 en su leaderboard público (posición #179 de 226), aunque esta métrica no es directamente comparable con benchmarks estándar como MMLU o HumanEval. No se dispone de datos de rendimiento específicos del fine-tune en tareas de razonamiento o código.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16 de 2.69B parámetros requiere aproximadamente 5.4 GB de VRAM (2 bytes por parámetro). Con cuantización GGUF Q4, el modelo ocupa alrededor de 1.5 GB, lo que permite ejecutarlo en GPUs con 4 GB de VRAM o menos.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo cuantizado. Para BF16 se recomienda al menos 8 GB de VRAM (RTX 3060, RTX 4070, etc.).
- En CPU: el modelo puede ejecutarse en portátiles modernos con llama.cpp u Ollama, con velocidades de 113-220 tokens/s en hardware de gama alta (Apple M5 Max, AMD Ryzen AI Max+ 395), según datos del modelo base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers de Hugging Face.
- Latencia y throughput: el modelo base alcanza 220 tokens/s en M5 Max y 113 tokens/s en Ryzen AI Max+ 395, lo que lo hace adecuado para aplicaciones interactivas en tiempo real.

## Comparativa con modelos similares

No se dispone de datos de comparativa directa en la información proporcionada. El modelo compite con otros modelos pequeños de 2-3B parámetros como Qwen2.5-3B, Gemma-2-2.6B o Phi-3.5-mini, pero no se han publicado resultados comparativos con estos. Se puede destacar que LFM2.5-2.6B ofrece una ventana de contexto de 128K, superior a la mayoría de modelos de su tamaño (Qwen2.5-3B tiene 32K, Gemma-2-2.6B tiene 8K), y un enfoque específico para tareas agénticas con tool calling nativo. Sin embargo, la licencia lfm1.0 puede tener restricciones diferentes a las de otros modelos abiertos.

## Limitaciones y advertencias

- Al ser un fine-tune independiente, no ha sido evaluado de forma exhaustiva por Liquid AI ni por la comunidad; su rendimiento en tareas generales puede ser inferior al del modelo base.
- El dataset de fine-tune (MiMo-2.5-Pro-Reasoning-Traces-Hard) puede introducir sesgos específicos en el razonamiento, especialmente si las trazas contienen patrones particulares de resolución de problemas.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo o con contexto ambiguo.
- La licencia lfm1.0 es una licencia propia de Liquid AI; es necesario revisar sus términos para uso comercial, ya que puede incluir restricciones de atribución o de uso en ciertos sectores.
- El modelo no ha sido evaluado en cuanto a sesgos de género, raza o idioma; no se dispone de información sobre su comportamiento en español u otros idiomas.
- Para producción, se recomienda validar el modelo en el caso de uso específico y considerar la posibilidad de alucinaciones en salidas de tool calling.

## Enlaces

- Modelo fine-tune: https://huggingface.co/hxii/LFM2.5-2.6B-Hex
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Blog de Hugging Face: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
- Benchmark del autor (hexbench): https://0xff.nu/hexbench/
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base/blob/main/LICENSE
