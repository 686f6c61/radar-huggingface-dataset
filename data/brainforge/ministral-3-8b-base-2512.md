# BrainForge/Ministral-3-8B-Base-2512

## Resumen

Ministral 3 8B Base 2512 es un modelo de lenguaje multimodal de tamaño compacto desarrollado por Mistral AI, diseñado específicamente para despliegue en entornos de edge computing. Esta versión base, pre-entrenada y no ajustada para instrucciones, combina un modelo de lenguaje de 8.4B parámetros con un codificador visual de 0.4B parámetros, lo que le permite procesar tanto texto como imágenes. Con una ventana de contexto de 256k tokens y soporte para más de diez idiomas, se posiciona como una opción versátil para aplicaciones locales y sistemas embebidos.

La relevancia de este modelo radica en su equilibrio entre capacidades y eficiencia: es capaz de ejecutarse en 24GB de VRAM en BF16 y en menos de 12GB cuando se cuantiza, lo que lo hace accesible para hardware de consumo. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. Al ser una versión base, está pensado para servir como punto de partida para procesos de post-entrenamiento personalizados, ya sea fine-tuning, adaptación a dominios específicos o desarrollo de agentes especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision) |
| Parametros totales | 8.918.026.240 (8.4B LM + 0.4B vision encoder) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | BF16 nativo; cuantizacion adicional disponible (FP8, GGUF, etc.) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa, sin mezcla de expertos (MoE), compuesta por dos componentes diferenciados: un modelo de lenguaje de 8.4B parámetros y un codificador visual de 0.4B parámetros. Esta separación permite un procesamiento multimodal eficiente, donde las imágenes se procesan a través del codificador visual y se integran con el texto en el modelo de lenguaje. La arquitectura está optimizada para inferencia de baja latencia en hardware limitado, lo que la hace adecuada para despliegue en edge.

Los detalles sobre el entrenamiento, como el número de tokens procesados, la composición exacta del dataset o el uso de técnicas como RLHF o DPO, no están disponibles en la información proporcionada. Al ser una versión base pre-entrenada, no se ha aplicado ningún ajuste posterior para instrucciones o razonamiento, lo que la convierte en una plataforma ideal para que terceros realicen su propio post-entrenamiento. La familia Ministral 3 incluye variantes de 3B, 8B y 14B, cada una con versiones base, instruct y reasoning, lo que sugiere un pipeline de entrenamiento modular y escalable.

## Capacidades

- Generación de texto y razonamiento: capacidad de generar texto coherente y realizar tareas de razonamiento básico, aunque al ser base no está optimizado para instrucciones complejas.
- Comprensión de imágenes: el codificador visual permite analizar imágenes y proporcionar descripciones o responder preguntas sobre contenido visual.
- Soporte multilingüe: cubre once idiomas principales, incluyendo inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Ventana de contexto larga: 256k tokens, lo que permite procesar documentos extensos o conversaciones de múltiples turnos con contexto completo.
- Fine-tuning y personalización: al ser una versión base, es adecuado para procesos de post-entrenamiento como fine-tuning, adaptación a dominios específicos o entrenamiento de instrucciones.
- Sin capacidades de tool calling ni agentes pre-entrenados: estas funcionalidades deben implementarse mediante post-entrenamiento.

## Casos de uso

- Asistentes locales de IA: el modelo puede ejecutarse en un ordenador de consumo con 24GB de VRAM, lo que permite crear un asistente personal de IA que funcione sin conexión, con capacidades de visión para analizar capturas de pantalla o imágenes locales.
- Descripción de imágenes y documentos: gracias a su codificador visual, puede generar descripciones de imágenes o extraer información de documentos escaneados, útil para sistemas de archivado automático o accesibilidad.
- Traducción automática: con soporte para más de diez idiomas, puede utilizarse como motor de traducción local para documentos o conversaciones, sin depender de servicios en la nube.
- Fine-tuning para dominios específicos: al ser un modelo base, es ideal para entrenar modelos especializados en sectores como medicina, legal o técnico, partiendo de una base sólida y eficiente.
- Chatbots en entornos restringidos: su tamaño compacto y bajo consumo de recursos lo hacen adecuado para integrarse en sistemas embebidos o entornos con limitaciones de memoria y potencia.
- Sistemas de agentes personalizados: aunque no incluye tool calling pre-entrenado, puede ser post-entrenado para funcionar como agente autónomo, gestionando tareas simples en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión base. Los datos disponibles en la model card se refieren a las versiones Instruct y Reasoning de la familia Ministral 3, que no son comparables directamente. Para referencia, la versión Instruct de 8B obtiene los siguientes resultados en comparación con Qwen3-VL-8B-Instruct:

| Modelo | Arena Hard | WildBench | MATH Maj@1 | MM MTBench |
|---|---|---|---|---|
| Ministral 3 8B (Instruct) | 0.509 | 66.8 | 0.876 | 8.08 |
| Qwen3-VL-8B-Instruct | 0.528 | 66.3 | 0.946 | 8.00 |

Estos datos corresponden a la versión instruct, no a la base, y se muestran solo como referencia de las capacidades de la familia. Para la versión base, no hay datos públicos de benchmarks.

## Requisitos de hardware

- VRAM estimada: 24GB en BF16 (formato nativo); menos de 12GB cuando se cuantiza (FP8 o inferior).
- GPU recomendadas: RTX 4090, RTX 6000 Ada, A100, H100 (para BF16); GPU con menos VRAM si se usa cuantización.
- Compatible con GPU de consumo: sí, con cuantización se puede ejecutar en tarjetas de 12GB como la RTX 4070 Ti o similar.
- Opciones de despliegue: vLLM (indicado en la librería del modelo), llama.cpp, Ollama, TGI, y otras herramientas compatibles con Safetensors.
- Latencia y throughput: no disponible en la información proporcionada; se espera una latencia adecuada para edge dada la optimización del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Uso |
|---|---|---|---|---|---|
| Ministral 3 8B Base 2512 | 8.9B | 256k | Sí | Apache 2.0 | Base |
| Qwen3-VL-8B-Instruct | 8.5B | 32k | Sí | Apache 2.0 | Instruct |
| Gemma3-12B-Instruct | 12B | 128k | Sí | Gemma License | Instruct |

La comparación directa no es posible al ser modelos de naturaleza distinta (base vs instruct). Los benchmarks de la tabla anterior muestran que la versión Instruct de Ministral 3 8B compite con Qwen3-VL-8B-Instruct en tareas de instrucción, con resultados ligeramente inferiores en MATH pero superiores en WildBench. La ventaja de Ministral 3 es su mayor contexto (256k vs 128k) y su diseño específico para edge deployment.

## Limitaciones y advertencias

- Sesgos: como modelo base pre-entrenado, puede reflejar los sesgos presentes en los datos de entrenamiento; no se han publicado evaluaciones específicas de sesgo.
- Alucinación: al no estar ajustado para instrucciones, puede generar contenido inexacto o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: aunque cubre 11 idiomas, la calidad puede variar significativamente entre ellos; los idiomas con menos representación en el entrenamiento pueden tener un rendimiento inferior.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero no se ofrecen garantías sobre el rendimiento en producción.
- Contexto largo: aunque soporta 256k tokens, el rendimiento en contextos muy largos puede degradarse; se recomienda evaluar en casos de uso reales.
- Sin soporte de tool calling o agentes pre-entrenados: estas capacidades requieren post-entrenamiento, lo que añade complejidad y coste.

## Enlaces

- HuggingFace: https://huggingface.co/BrainForge/Ministral-3-8B-Base-2512
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Documentación oficial: https://docs.mistral.ai/models/ministral-3-8b-25-12
- Blog de anuncio: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Colección de checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
