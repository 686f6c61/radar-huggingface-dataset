# monroewilliams/Qwen3.5-0.8B-oQ4e-mtp

## Resumen

Qwen3.5-0.8B-oQ4e-mtp es una cuantización de 4 bits del modelo Qwen3.5-0.8B, el miembro más pequeño de la familia Qwen3.5 de Alibaba Cloud. Esta versión ha sido convertida al formato MLX mediante la herramienta oQ (oMLX v0.6.3rc2) con precisión mixta, lo que permite ejecutar el modelo en hardware Apple Silicon y otros entornos compatibles con MLX. El modelo base se destaca por ser un sistema multimodal (texto e imagen) con una ventana de contexto de 262K tokens y una arquitectura híbrida basada en "gated delta networks", diseñada para ofrecer razonamiento eficiente en dispositivos de borde.

La relevancia de esta cuantización radica en que reduce el tamaño del modelo a aproximadamente 0.7 GB, haciéndolo viable para dispositivos con recursos limitados, como smartphones, Jetson o incluso CPUs. Aunque el nombre indica 0.8B, el archivo safetensors reporta 228.747.328 parámetros, lo que sugiere que el modelo base puede tener un número menor de parámetros reales. Esta ficha se centra en la versión cuantizada, que hereda todas las capacidades del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid gated delta networks (multimodal) |
| Parámetros totales | 228.747.328 (según safetensors; el nombre indica 0.8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (según fuentes externas) |
| Tipos de cuantización | oQ4e (4 bits, group size 64, MLX) |
| Idiomas soportados | no disponible (multilingüe según la familia Qwen) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (también disponible en GGUF para llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B utiliza una arquitectura híbrida denominada "gated delta networks", que combina mecanismos de atención con capas delta para reducir el coste computacional y mantener un rendimiento competitivo en tareas de razonamiento y multimodalidad. Esta arquitectura permite manejar secuencias muy largas (262K tokens) con una huella de memoria reducida. El modelo se entrena con una estrategia de fusión temprana de tokens multimodales (texto e imagen), lo que le otorga capacidades de visión nativas sin necesidad de un adaptador externo.

Los detalles exactos del entrenamiento (número de tokens, dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. Sin embargo, se sabe que la familia Qwen3.5 ha sido optimizada para razonamiento y seguimiento de instrucciones, superando a las versiones Qwen3 y Qwen3-VL en benchmarks de razonamiento, coding, agentes y comprensión visual. La cuantización oQ4e reduce el modelo a 4 bits con un group size de 64, lo que implica una pérdida de precisión mínima para la mayoría de usos.

## Capacidades

- Generación de texto y razonamiento: soporta tareas de comprensión y generación de lenguaje natural, con mejoras en razonamiento y seguimiento de instrucciones sobre Qwen3.
- Multimodalidad: procesa imágenes y texto, permitiendo tareas de visión-lenguaje como descripción de imágenes, respuesta a preguntas visuales y razonamiento multimodal.
- Contexto largo: ventana de 262K tokens, adecuada para documentos extensos, conversaciones largas o análisis de código.
- Tool calling y agentes: según las fuentes, el modelo base soporta llamadas a herramientas y flujos de agentes, aunque no se detalla en la información de la cuantización.
- Multilingüe: aunque no se especifican idiomas, la familia Qwen3.5 es multilingüe (incluye español, inglés, chino, etc.).
- Eficiencia en edge: al ser un modelo pequeño y cuantizado, es apto para despliegue en dispositivos con recursos limitados.

## Casos de uso

- Asistente conversacional en dispositivos móviles: gracias a su tamaño reducido y su ventana de contexto de 262K, puede gestionar diálogos multi-turno sin perder el hilo, ideal para apps de mensajería o asistentes personales.
- Análisis de documentos largos: su contexto extenso permite resumir o extraer información de informes, contratos o libros completos sin truncar el texto.
- Generación de código en entornos de desarrollo ligero: aunque la precisión en código no es su punto fuerte (según la fuente de Codersera), puede asistir en tareas de autocompletado o documentación en editores integrados.
- Aplicaciones de visión en tiempo real: con soporte de entrada de imágenes, puede clasificar o describir imágenes en sistemas de vigilancia o asistencia visual.
- Prototipado rápido de agentes de IA: su tamaño permite iterar rápidamente en pipelines de agentes, integrando llamadas a herramientas y razonamiento multi-paso sin coste de hardware alto.
- Despliegue en Jetson o Raspberry Pi: gracias a su cuantización MLX y bajo consumo, es viable en plataformas embebidas para proyectos de robótica o automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión cuantizada en la información disponible. Las fuentes web indican que el modelo base Qwen3.5-0.8B tiene "buena memoria pero débil precisión en código", y que para tareas de código se recomienda usar la versión 4B. Sin embargo, no hay cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks. Se recomienda consultar los repositorios oficiales de Qwen para obtener datos de evaluación del modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB (para el modelo cuantizado de 4 bits) + overhead de ejecución. En la práctica, necesita menos de 1 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo RTX 2050, GTX 1650, o integradas como Apple Silicon (M1/M2/M3) para MLX. También puede ejecutarse en CPU con llama.cpp.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en tarjetas con 4 GB o menos.
- Opciones de despliegue: vLLM (para GPU), llama.cpp (para CPU/GPU), Ollama (con `ollama run qwen3.5:0.8b`), MLX (en macOS), y TGI (Text Generation Inference).
- Latencia y throughput: no hay datos oficiales, pero al ser un modelo de 228M parámetros cuantizado, se espera una latencia muy baja (menos de 10 ms por token en GPU) y un throughput alto en batch.

## Comparativa con modelos similares

No hay información suficiente para comparar directamente este modelo cuantizado con alternativas específicas. El modelo base Qwen3.5-0.8B se puede comparar con otros modelos pequeños como Qwen3-0.5B, Gemma-2-2B o Llama-3.2-1B, pero no se dispone de datos de rendimiento comparativos en esta ficha. Se sugiere consultar los benchmarks oficiales de Qwen3.5 para obtener comparativas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar contenido falso o sesgado, especialmente en tareas de razonamiento complejo.
- Precisión de código limitada: según una fuente, el modelo tiene "débil precisión en código", por lo que no es recomendado para tareas de programación avanzada.
- Idiomas: aunque la familia Qwen3.5 es multilingüe, no se ha confirmado el rendimiento en español en esta versión concreta.
- Licencia: no se especifica la licencia del modelo base ni de la cuantización. Para uso comercial, se debe verificar la licencia de Qwen3.5 en los repositorios oficiales.
- Contexto largo: aunque el contexto es de 262K, el modelo pequeño puede degradar su rendimiento en secuencias extremadamente largas.
- Dependencia de la cuantización: la cuantización oQ4e puede introducir errores de precisión en tareas de alta exactitud, como matemáticas o razonamiento lógico.

## Enlaces

- HuggingFace del modelo cuantizado: https://huggingface.co/monroewilliams/Qwen3.5-0.8B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- vLLM Recipes (arquitectura y contexto): https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Qualcomm AI Hub (despliegue edge): https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Jetson AI Lab (despliegue en Jetson): https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/
- Artículo sobre benchmarks y uso: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Página de compatibilidad: https://www.canirun.ai/model/qwen3.5-0.8b
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
