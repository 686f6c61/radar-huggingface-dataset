# ETeissonniere/Qwen3.8-27B-CoreAI-128K

## Resumen

Qwen3.8-27B-CoreAI-128K es una conversión independiente del modelo Qwen/Qwen3.8-27B, realizada por ETeissonniere, que adapta los pesos del modelo a Apple Core AI, el runtime de inferencia nativo de macOS 27 y posteriores. El resultado es un bundle compilado de 18,8 GB con pesos lineales cuantizados a INT4 y una ventana de contexto dinámica de 131 072 tokens, diseñado para ejecutarse en Apple Silicon con memoria unificada. La conversión no modifica los pesos del modelo original, solo los reempaqueta en un formato optimizado para el pipeline de decodificación en GPU de Core AI.

El modelo se presenta como un grafo de decodificación de un solo token con pipeline en GPU, mientras que el prefill se procesa token a token por el runtime del host. Está pensado para desarrolladores que quieren ejecutar un LLM de 27B parámetros de forma local y privada en hardware Apple, sin depender de servicios en la nube. Aunque el modelo base Qwen3.8-27B es multimodal (texto e imagen), esta conversión se publica con pipeline de text-generation y no se especifica si incluye el codificador de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.8-27B (transformer denso, 64 capas con interleave 3:1 de GatedDeltaNet y atención estándar según fuentes secundarias) |
| Parametros totales | 27B (no confirmado oficialmente, se infiere del nombre) |
| Parametros activos | No disponible (modelo denso, todos los parámetros activos) |
| Longitud de contexto | 131 072 tokens (KV-cache dinámico) |
| Tipos de cuantizacion | INT4 (pesos lineales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core AI (formato propietario de Apple, .aimodel) |

## Arquitectura y entrenamiento

La model card no proporciona detalles de arquitectura ni de entrenamiento, ya que se trata de una conversión de formato, no de un modelo reentrenado. El modelo base Qwen3.8-27B, desarrollado por Alibaba, es un transformer denso de 27B parámetros con 64 capas. Según fuentes secundarias (repositorios de conversiones similares), emplea una arquitectura híbrida que intercala capas de atención lineal GatedDeltaNet con capas de atención estándar en una proporción 3:1. Sin embargo, esta información no está confirmada en la documentación oficial del modelo convertido.

El proceso de conversión consiste en exportar los pesos originales (en formato safetensors) al formato Core AI, compilar el grafo de decodificación y cuantizar los pesos a INT4. No se aplican técnicas de fine-tuning, RLHF ni DPO en esta conversión. El autor indica que es una conversión independiente, no producida ni respaldada por Qwen.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto en lenguaje natural, aunque las capacidades específicas dependen del modelo base Qwen3.8-27B.
- Razonamiento y codigo: al ser una conversión del Qwen3.8-27B, hereda las capacidades del modelo original en tareas de razonamiento, matemáticas y generación de código, aunque no se aportan benchmarks específicos en esta conversión.
- Contexto largo: con 131 072 tokens de ventana, puede manejar documentos extensos y conversaciones multi-turno de gran longitud.
- Inferencia local en Apple Silicon: está optimizado para ejecutarse en macOS 27 o superior con el runtime Core AI, aprovechando la GPU integrada.
- Tool calling y agentes: no se especifica en la documentación, pero el autor menciona en su repositorio que explora flujos de trabajo agénticos básicos con herramientas locales.
- Multilingüismo: no se indica qué idiomas soporta, aunque el modelo base Qwen3.8-27B es conocido por su soporte multilingüe.

## Casos de uso

- Asistente personal privado en macOS: el modelo puede integrarse en una aplicación nativa para responder preguntas, redactar correos o resumir documentos sin enviar datos a servidores externos, gracias a su ejecución 100% local en Apple Silicon.
- Procesamiento de documentos largos: con su contexto de 128K tokens, es adecuado para analizar contratos, informes técnicos o libros completos, extrayendo información relevante o generando resúmenes.
- Desarrollo de agentes locales: el repositorio del autor muestra un ejemplo de flujo agéntico donde el modelo interactúa con herramientas del sistema (archivos, calendario, etc.) mediante llamadas a funciones, todo dentro de una app de macOS.
- Prototipado de aplicaciones de IA en Swift: los desarrolladores pueden usar este bundle para construir y probar aplicaciones que requieren generación de texto sin depender de APIs externas, aprovechando las APIs de Core AI y Swift.
- Copiloto de código offline: aunque no se confirma si la conversión incluye el codificador de visión, el modelo base tiene capacidades de generación de código que pueden usarse en entornos de desarrollo sin conexión.
- Educación e investigación: permite a investigadores y estudiantes experimentar con un LLM de 27B en hardware de consumo (Apple Silicon con suficiente memoria unificada) para estudiar su comportamiento, hacer fine-tuning o probar técnicas de prompting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento que se ofrece es una medición empírica del autor en un Apple M4 Pro con 48 GB de memoria unificada: aproximadamente 10,1 tokens/s de prefill y 10,0 tokens/s de decodificación para un prompt de 128 tokens y una generación de 256 tokens. Estas cifras dependen del hardware, la versión de macOS, la longitud del prompt, la presión de memoria y el estado térmico del dispositivo.

## Requisitos de hardware

- Apple Silicon con macOS 27 o posterior (requisito del runtime Core AI).
- Memoria unificada recomendada: al menos 48 GB para ejecutar el modelo de 18,8 GB con margen para el KV-cache dinámico de 128K tokens. Con menos memoria podría funcionar, pero con riesgo de paginación o reducción de contexto.
- GPU integrada de Apple Silicon (el modelo se ejecuta en GPU mediante Core AI).
- Rendimiento medido: ~10 tokens/s de generación en un M4 Pro con 48 GB. En chips inferiores (M1, M2) el rendimiento será menor.
- Opciones de despliegue: exclusivo para el runtime Core AI en macOS; no es compatible con vLLM, llama.cpp, Ollama ni TGI. Solo se puede usar en aplicaciones macOS que integren Core AI.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Existen otras conversiones de Qwen3.8-27B para Apple Core AI, como `mlboydaisuke/Qwen3.8-27B-CoreAI`, que según su documentación incluye el VLM completo (texto + visión) y usa el mismo formato .aimodel. Sin embargo, no se conocen sus especificaciones exactas ni su rendimiento. En el ecosistema de inferencia local en Apple, alternativas como las conversiones en MLX o llama.cpp del mismo modelo base ofrecen diferentes formatos (MLX, GGUF) y pueden ejecutarse en más plataformas, pero la información disponible no permite comparar métricas concretas.

## Limitaciones y advertencias

- Requiere macOS 27 o posterior, lo que limita su uso a sistemas recientes de Apple.
- El formato Core AI es propietario y no portable a otras plataformas (Linux, Windows, etc.).
- La cuantización INT4 puede degradar ligeramente la calidad de las respuestas respecto al modelo en precisión completa, aunque no se aportan mediciones.
- No se especifica si la conversión incluye el codificador de visión del modelo base; si se necesita procesamiento de imágenes, es probable que esta versión no lo soporte.
- Rendimiento limitado a ~10 tokens/s en hardware de gama media-alta, lo que puede ser insuficiente para aplicaciones en tiempo real.
- Al ser una conversión independiente, no hay garantía de soporte ni actualizaciones por parte del autor original de Qwen.
- Riesgo de alucinaciones y sesgos inherentes al modelo base, no mitigados en esta conversión.
- El tamaño del repo (18,8 GB) requiere una descarga considerable y espacio en disco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ETeissonniere/Qwen3.8-27B-CoreAI-128K
- Repositorio del autor (Qwen Core AI): https://github.com/ETeissonniere/qwen-coreai
- Conversión alternativa (mlboydaisuke/Qwen3.8-27B-CoreAI): https://huggingface.co/mlboydaisuke/Qwen3.8-27B-CoreAI
- Guía sobre ejecución local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Página del modelo Qwen3.8-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
