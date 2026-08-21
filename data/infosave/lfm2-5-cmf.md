# infosave/LFM2.5-cmf

## Resumen

LFM2.5-cmf es un repositorio que publica los modelos de lenguaje LFM2.5 de LiquidAI en formato CMF (Compact Model Format), un contenedor de pesos cuantizados a 4 bits diseñado para ser ejecutado con el runtime `cortiq`, escrito en Rust y sin dependencias de frameworks de aprendizaje automático. El proyecto ofrece tres variantes (230M, 2.6B y 8B-A1B) que combinan capas de atención y capas convolucionales en una arquitectura híbrida, orientada a la inferencia eficiente en dispositivos de borde y en CPU.

La relevancia actual reside en la creciente demanda de modelos pequeños, cuantizados y de fácil despliegue para aplicaciones on-device, agentes locales y entornos sin infraestructura de GPU. El formato CMF permite cargar los pesos directamente mediante memoria mapeada, sin necesidad de Python ni frameworks, y ofrece una API compatible con OpenAI para integración sencilla. Aunque el repositorio no incluye resultados de benchmarks ni detalles del entrenamiento, la base de los modelos proviene de Liquid AI, conocida por sus arquitecturas eficientes para edge.

## Especificaciones técnicas

| Parámetro | LFM2.5-230M | LFM2.5-2.6B | LFM2.5-8B-A1B |
|---|---|---|---|
| Arquitectura | Híbrida (atención + convolución) | Híbrida (atención + convolución) | Híbrida (atención + convolución) con mezcla de expertos |
| Parámetros totales | 0,23 B | 2,70 B | 8,3 B |
| Parámetros activos | No aplica | No aplica | 1 B |
| Longitud de contexto | No disponible | No disponible | No disponible |
| Tipos de cuantización | q4tp (4-bit tiled con ladder scales) | q4tp | q4tp |
| Idiomas soportados | Inglés | Inglés | Inglés |
| Licencia | other (no especificada) | other (no especificada) | other (no especificada) |
| Formato de pesos | CMF (memoria-mapped) | CMF | CMF |

## Arquitectura y entrenamiento

La arquitectura de los modelos LFM2.5 se describe como híbrida: la mayoría de las capas combinan una convolución gated de corta duración con solo unas pocas capas de atención completa. Esto permite que el estado necesario para cada token sea pequeño y constante en las zonas de convolución, reduciendo la huella de memoria y computación. La variante 8B-A1B añade una mezcla de expertos con 32 expertos y 4 activos por token, lo que reduce los parámetros activos a 1B.

El entrenamiento de los modelos base fue realizado por Liquid AI, pero no se proporcionan detalles sobre el dataset, el número de tokens o el uso de técnicas como RLHF o DPO. El repositorio `LFM2.5-cmf` indica que los pesos han sido cuantizados directamente desde los checkpoints bf16 originales al formato q4tp, sin información adicional sobre el proceso de calibración. El formato CMF incluye los pesos cuantizados, el tokenizador y la plantilla de chat, y verifica su integridad mediante checksums SHA-256.

## Capacidades

- Generación de texto y completado de chat: el modelo es capaz de producir respuestas coherentes en inglés, adecuadas para tareas de conversación y generación de contenido.
- Razonamiento y comprensión de instrucciones: al ser un modelo de lenguaje general, puede seguir instrucciones sencillas y resolver tareas de razonamiento básico, aunque no se han publicado resultados específicos.
- Ejecución local sin dependencias: el formato CMF y el runtime `cortiq` permiten ejecutar el modelo en CPU o GPU (Vulkan, Metal, DX12) sin necesidad de instalar Python ni frameworks de ML.
- API compatible con OpenAI: el servidor integrado ofrece un endpoint `/v1/chat/completions` que acepta peticiones en el formato estándar de OpenAI, facilitando la integración con herramientas existentes.
- Multilingüismo limitado: la información indica que el modelo soporta solo inglés (`language: en`), por lo que no se recomienda para otros idiomas.
- Sin soporte documentado para tool calling, visión o audio: no se mencionan estas capacidades en la documentación disponible.

## Casos de uso

- Asistente local en dispositivos con recursos limitados: gracias al tamaño reducido (132 MB a 4.6 GB) y al runtime sin dependencias, se puede desplegar un asistente de chat en una Raspberry Pi o un portátil antiguo, sin necesidad de conexión a internet.
- Servidor de inferencia en intranet: `cortiq serve` levanta un endpoint compatible con OpenAI, lo que permite sustituir un servidor en la nube por uno local en redes corporativas, reduciendo costes y latencia.
- Integración con agentes y herramientas de automatización: al hablar la API de OpenAI, se puede conectar a librerías como `openai-python` o frameworks de agentes (LangChain, AutoGPT) simplemente cambiando la URL base.
- Gateway inteligente de modelos LLM: junto con el repositorio `cortiq-gateway`, se puede enrutar peticiones entre modelos locales (LFM2.5) y modelos en la nube según la complejidad de la tarea, optimizando costes y rendimiento.
- Prototipado rápido de aplicaciones de chat: al no requerir instalación de Python ni GPU, se puede usar en entornos de desarrollo para probar funcionalidades de chat sin configurar infraestructura compleja.
- Despliegue en entornos sin acceso a la nube: el formato CMF es un único archivo que se puede copiar en sistemas aislados o con restricciones de red, manteniendo la funcionalidad de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. El rendimiento real del modelo en tareas específicas es desconocido y debe ser evaluado por el usuario antes de su uso en producción.

## Requisitos de hardware

- **LFM2.5-230M**: archivo de 132 MB. Puede ejecutarse en CPU sin GPU, con un uso de RAM inferior a 1 GB. Si se usa GPU, una tarjeta integrada o de 1 GB de VRAM es suficiente.
- **LFM2.5-2.6B**: archivo de 1.43 GB. Requiere al menos 3 GB de RAM/VRAM. En GPU, una NVIDIA GTX 1060 (6 GB) o equivalente es suficiente. En CPU, un procesador moderno con 4 GB de RAM libre puede ejecutarlo con una velocidad moderada.
- **LFM2.5-8B-A1B**: archivo de 4.6 GB. Necesita 6 GB de VRAM para inferencia con GPU, o 8 GB de RAM para CPU. Se recomienda una GPU con 8 GB (RTX 2070, RTX 3060, AMD RX 6700 XT) o mejor. En Apple Silicon, un chip M1 o superior puede ejecutarlo mediante Metal.
- **Despliegue**: el runtime `cortiq` soporta CPU (fallback) y GPU a través de wgpu (Vulkan, Metal, DX12). No se ha documentado integración con vLLM, llama.cpp u Ollama; el despliegue se realiza con el CLI `cortiq` o el servidor `cortiq serve`.
- **Latencia y throughput**: no disponibles. Dependen del hardware y del tamaño del modelo, pero al ser cuantizados a 4 bits, se espera una velocidad de generación moderada en CPU y alta en GPU, sin datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. No hay resultados de benchmarks que permitan comparar este modelo con alternativas como Llama 3.2 3B, Qwen 2.5 3B o Gemma 2 2B. La principal diferencia es el formato de distribución (CMF) y el runtime específico, pero no se pueden extraer conclusiones sobre rendimiento relativo sin evaluaciones independientes.

## Limitaciones y advertencias

- Licencia no especificada: la etiqueta `license: other` no detalla los términos de uso, por lo que hay que revisar la documentación de Liquid AI antes de usar el modelo en proyectos comerciales.
- Solo inglés: el modelo está entrenado únicamente en inglés, por lo que no es adecuado para aplicaciones multilingües.
- Sin benchmarks públicos: no hay evidencia de la calidad del modelo en tareas estándar; su rendimiento es incierto y puede ser inferior a otros modelos de tamaño similar.
- Cuantización 4-bit: la pérdida de precisión puede degradar la calidad de las respuestas, especialmente en tareas que requieren razonamiento complejo o comprensión de matices.
- Dependencia del runtime `cortiq`: el formato CMF no es compatible con otros motores de inferencia; si el runtime no es actualizado o mantenido, el modelo podría quedar obsoleto.
- Sin soporte de visión ni audio: el modelo es exclusivamente de texto, no procesa imágenes ni sonidos.

## Enlaces

- Repositorio Hugging Face: [infosave/LFM2.5-cmf](https://huggingface.co/infosave/LFM2.5-cmf)
- Repositorio GitHub del formato CMF: [https://github.com/infosave2007/cmf](https://github.com/infosave2007/cmf)
- Blog de Liquid AI sobre LFM2.5: [Introducing LFM2.5: The Next Generation of On-Device AI](https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai)
- Página de modelos de Liquid AI: [Liquid Foundation Models](https://www.liquid.ai/models)
- Gateway de LLM con routing inteligente: [https://github.com/infosave2007/cortiq-gateway](https://github.com/infosave2007/cortiq-gateway)
