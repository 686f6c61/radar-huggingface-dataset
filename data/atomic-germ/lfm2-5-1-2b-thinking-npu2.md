# Atomic-Germ/LFM2.5-1.2B-Thinking-NPU2

## Resumen

LFM2.5-1.2B-Thinking-NPU2 es un ajuste fino (fine-tune) del modelo LFM2.5-1.2B-Base de Liquid AI, publicado por el usuario Atomic-Germ. Forma parte de la familia LFM2.5, una generación de modelos híbridos diseñados específicamente para despliegue en dispositivos de borde (edge), con un enfoque claro en razonamiento, instrucciones y tareas agénticas. El modelo cuenta con 1.170 millones de parámetros y una ventana de contexto de 32.768 tokens.

La relevancia de este modelo radica en su capacidad para ofrecer razonamiento de alta calidad en un tamaño muy reducido, compitiendo con modelos mucho más grandes. Según los datos del fabricante, alcanza 239 tokens por segundo en CPU AMD y 82 tokens por segundo en NPU móvil, consumiendo menos de 1 GB de memoria. Esto lo convierte en una opción atractiva para aplicaciones de inteligencia artificial en el dispositivo, sin conexión y con latencia mínima.

El modelo está optimizado para tareas de razonamiento multi-paso, extracción de datos y recuperación aumentada por generación (RAG), y soporta tool calling. La licencia es lfm1.0, una licencia propia de Liquid AI que permite uso comercial bajo condiciones específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida LFM2.5: 10 bloques de convolución LIV con doble compuerta + 6 bloques GQA |
| Parametros totales | 1,17B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible para este checkpoint; el modelo original dispone de variantes GGUF, ONNX y MLX |
| Idiomas soportados | inglés, árabe, chino, francés, alemán, japonés, coreano y español |
| Licencia | lfm1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina bloques de convolución LIV (Liquid Inverted Convolution) con doble compuerta y bloques de atención GQA (Grouped Query Attention). Esta combinación está diseñada para ofrecer un equilibrio entre eficiencia computacional y capacidad de razonamiento, siendo especialmente adecuada para dispositivos con recursos limitados.

El entrenamiento se realizó en dos fases: una pre-entrenamiento extendido de 28 billones de tokens y un aprendizaje por refuerzo multi-etapa a gran escala. El modelo base es LFM2.5-1.2B-Base, y la variante Thinking se ha afinado específicamente para cadenas de razonamiento (chain-of-thought), con un enfoque en matemáticas, lógica y resolución de problemas multi-paso. El ajuste de Atomic-Germ (NPU2) añade una capa de optimización adicional, aunque los detalles específicos de este fine-tune no están documentados en la información disponible.

## Capacidades

- Generación de texto y razonamiento multi-paso, con entrenamiento específico en cadenas de pensamiento.
- Soporte de tool calling / function calling mediante tokens especiales `<|tool_call_start|>` y `<|tool_call_end|>`, con llamadas en formato Python o JSON según la configuración.
- Capacidad para actuar como agente en flujos de trabajo automatizados, integrando resultados de herramientas externas.
- Multilingüe: soporta inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Optimizado para tareas de extracción de datos y RAG (recuperación aumentada por generación).
- Modo de razonamiento explícito ("thinking") que mejora la precisión en problemas lógicos y matemáticos.

## Casos de uso

- **Asistentes de atención al cliente en el dispositivo**: el modelo puede gestionar conversaciones multi-turno con contexto largo (32K tokens) sin conexión, ideal para aplicaciones móviles que necesitan respuestas rápidas y privadas.
- **Extracción de datos estructurados**: su capacidad para seguir instrucciones y razonar sobre texto lo hace adecuado para extraer entidades, relaciones y datos de documentos no estructurados en pipelines automatizados.
- **RAG en entornos edge**: puede integrarse en sistemas de recuperación aumentada por generación en dispositivos móviles, ofreciendo respuestas basadas en un corpus local sin necesidad de servidores.
- **Agentes autónomos en el borde**: con soporte de tool calling, puede actuar como agente que consulta APIs, ejecuta comandos y coordina tareas en entornos con recursos limitados.
- **Asistente de programación ligero**: aunque no se recomienda para tareas intensivas de código, puede ayudar con snippets y explicaciones de código en contextos donde la latencia es crítica.
- **Chat en múltiples idiomas**: su soporte multilingüe lo hace útil para aplicaciones de traducción conversacional y asistencia en idiomas como árabe, chino o japonés, donde los modelos de gran tamaño no son viables en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La documentación de Liquid AI menciona que el modelo "rivaliza con modelos mucho más grandes" y ofrece "la mejor calidad de su tamaño", pero no se proporcionan cifras concretas de MMLU, HumanEval o GSM8K. Los datos de velocidad de inferencia son: 239 tok/s en CPU AMD y 82 tok/s en NPU móvil, con un consumo de memoria inferior a 1 GB.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en cuantizaciones de baja precisión; el modelo original cabe en 900 MB de memoria en un teléfono móvil.
- **GPU recomendadas**: no requiere GPU de alta gama; puede ejecutarse en CPU de gama media (AMD/Intel) y en NPU móviles (como las de los teléfonos modernos). Para inferencia en GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente.
- **Compatibilidad con GPU consumer**: sí, cualquier GPU consumer con 2 GB o más de VRAM puede ejecutarlo sin problemas.
- **Opciones de despliegue**: compatible con llama.cpp, MLX (Apple Silicon), ONNX Runtime y vLLM. También se puede desplegar con Transformers.
- **Latencia y throughput**: 239 tok/s en CPU AMD, 82 tok/s en NPU móvil, según Liquid AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (este) | 1,17B | 32.768 | Razonamiento multi-paso | lfm1.0 |
| LFM2.5-1.2B-Instruct | 1,17B | 32.768 | Instrucciones generales | lfm1.0 |
| LFM2.5-1.2B-Base | 1,17B | 32.768 | Modelo base pre-entrenado | lfm1.0 |

Comparado con otros modelos de tamaño similar como Qwen2.5-1.5B o SmolLM2-1.7B, no se dispone de datos de benchmarks públicos para una comparación cuantitativa. La ventaja de este modelo es su arquitectura híbrida optimizada para el borde y su licencia lfm1.0 que permite uso comercial.

## Limitaciones y advertencias

- **No recomendado para tareas intensivas en conocimiento**: el propio fabricante indica que no es adecuado para programación avanzada ni para tareas que requieran un conocimiento enciclopédico extenso.
- **Sesgos potenciales**: al ser un modelo entrenado con 28T tokens de datos web, puede heredar sesgos sociales y culturales de esos datos, especialmente en idiomas menos representados.
- **Riesgo de alucinación**: como todos los modelos de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- **Licencia lfm1.0**: es una licencia propietaria de Liquid AI que permite uso comercial, pero requiere revisar las condiciones específicas en el archivo LICENSE del repositorio.
- **Especificidad del fine-tune**: el modelo NPU2 es un ajuste de terceros (Atomic-Germ) sobre el modelo base de Liquid AI; no hay garantía de que mantenga todas las capacidades del original, y no se documentan los cambios realizados en el fine-tune.
- **Contexto de 32K**: aunque es generoso para el tamaño, puede ser insuficiente para documentos muy largos sin segmentación previa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Atomic-Germ/LFM2.5-1.2B-Thinking-NPU2)
- [Modelo original de Liquid AI](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking)
- [Blog de Liquid AI sobre LFM2.5-Thinking](https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb)
- [Documentación de Liquid AI para LFM2.5-1.2B-Thinking](https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking)
- [Artículo de investigación relacionado (arXiv:2511.23404)](https://arxiv.org/abs/2511.23404)
- [Versión ONNX del modelo en Hugging Face](https://huggingface.co/NexaAI/LFM2.5-1.2B-thinking-npu)
