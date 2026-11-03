# dohxjb/LFM3-1.7B

## Resumen

LFM3-1.7B es un modelo de lenguaje de tipo texto, resultado del post-entrenamiento del checkpoint base LiquidAI/LFM3-1.7B-Base, desarrollado por Liquid AI y publicado en HuggingFace bajo el identificador dohxjb/LFM3-1.7B. Está diseñado específicamente para agentes locales y aplicaciones especializadas, con un enfoque claro en el despliegue en el borde (edge): según el autor, en precisión de 4 bits ocupa aproximadamente 1 GB de memoria, lo que permite ejecutarlo en un teléfono o portátil convencional.

El modelo emplea una arquitectura tri-híbrida novedosa de 24 capas que combina 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atención con ventana deslizante y 6 capas de atención global. Con 1.728.801.536 parámetros totales y una ventana de contexto de 256.000 tokens (entrada más salida), está pensado para integrarse en arneses agénticos como Hermes Agent, Pi y OpenClaw, así como para soportar tool calling y salidas estructuradas.

Su relevancia actual radica en la combinación poco habitual de un contexto muy largo (256K) con un tamaño reducido (1,7B) y un consumo de memoria mínimo en cuantización de 4 bits, lo que lo posiciona como candidato para asistentes conversacionales y agentes que deban ejecutarse íntegramente en local sin depender de la nube. El autor advierte, no obstante, que no se recomienda para codificación agéntica ni razonamiento complejo de múltiples pasos debido a su reducido tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido: 24 capas (13 convoluciones cortas con compuerta, 5 atención de ventana deslizante, 6 atención global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256.000 tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible (el autor menciona que en 4 bits ocupa ~1 GB, pero no detalla los formatos) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (licencia "other" en HuggingFace) |
| Formato de pesos | Safetensors (librería transformers, con código personalizado) |

## Arquitectura y entrenamiento

La arquitectura de LFM3-1.7B es un transformer tri-híbrido de 24 capas que distribuye el cómputo entre tres tipos de bloques: 13 capas de convolución corta con compuerta, 5 capas de atención con ventana deslizante y 6 capas de atención global. Esta combinación busca reducir el coste computacional y de memoria de la atención completa sobre secuencias largas, manteniendo al mismo tiempo la capacidad de modelar dependencias globales a través de las capas de atención global. El vocabulario es de 128.000 tokens.

El modelo es un post-entrenamiento del checkpoint base LiquidAI/LFM3-1.7B-Base, orientado a arneses agénticos como Hermes Agent, Pi y OpenClaw, con una ventana de contexto de 256K tokens. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia arquitectura tri-híbrida. El modelo está diseñado para ser especializado mediante fine-tuning rápido en una sola GPU, adaptándolo a dominios, formatos y herramientas concretas.

## Capacidades

- Generación de texto conversacional, con post-entrenamiento específico para diálogo y arneses agénticos.
- Tool calling y function calling: el modelo está diseñado explícitamente para la invocación de herramientas.
- Salidas estructuradas: soporte para generar respuestas en formatos estructurados.
- Capacidades agénticas: integración con Hermes Agent, Pi y OpenClaw, con contexto de 256K tokens para gestionar historiales largos y múltiples pasos.
- Multilingüismo: 16 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Especialización mediante fine-tuning: adaptación a dominios y formatos concretos con entrenamiento en una sola GPU.
- No incluye visión, audio ni modo de razonamiento extendido (thinking mode) en esta variante de texto.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 256.000 tokens de ventana, ejecutándose en un teléfono o portátil con ~1 GB de memoria en 4 bits, sin necesidad de conexión a la nube.
- Agentes de automatización de tareas con tool calling: integrado en arneses como Hermes Agent u OpenClaw, puede invocar funciones externas (consultas a APIs, operaciones sobre ficheros, envío de correos) y encadenar llamadas dentro de un flujo agéntico.
- Extracción de información estructurada: a partir de documentos largos (contratos, informes, correos), el modelo puede generar salidas en JSON u otros formatos estructurados, aprovechando el contexto extendido para procesar el documento completo en una sola pasada.
- Atención al cliente automatizada en el dispositivo: despliegue en aplicaciones móviles o de escritorio para responder consultas frecuentes, clasificar incidencias y derivar casos complejos, con la ventaja de que los datos del usuario no salen del dispositivo.
- Procesamiento de documentación multilingüe: traducción, resumen y clasificación de textos en los 16 idiomas soportados, útil en entornos corporativos con documentación en varios idiomas.
- Especialización vertical mediante fine-tuning: adaptación del modelo a dominios concretos (legal, sanitario, financiero) o a formatos y herramientas propietarias mediante un ajuste fino rápido en una sola GPU, sin necesidad de infraestructura de entrenamiento distribuida.
- Prototipado rápido de agentes: gracias a su reducido tamaño y a su contexto de 256K, sirve para validar flujos agénticos y de tool calling en local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en cuantización de 4 bits según el autor; en precisión completa (FP16/BF16) se estiman en torno a 3,5 GB solo para los pesos, más el espacio para el KV cache.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder ejecutar la versión cuantizada; para la versión completa en FP16 se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en cuantización de 4 bits cabe en teléfonos y portátiles según el autor; en FP16 cabe en GPUs consumer de gama media.
- Opciones de despliegue: transformers (librería indicada en la model card, con código personalizado). No se confirman otros frameworks como vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-1.7B | 1,73B | 256K | LFM Open License v1.0 | HuggingFace (dohxjb/LFM3-1.7B) |
| Alternativas de ~1-2B | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (tamaño ~1,7B con contexto extendido y orientación agéntica) en la documentación proporcionada, por lo que no es posible establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- El propio autor desaconseja su uso para codificación agéntica y razonamiento complejo de múltiples pasos debido al reducido tamaño del modelo (1,73B).
- Riesgo de alucinación inherente a modelos pequeños; el autor recomienda usar recuperación (retrieval) o búsqueda para tareas intensivas en conocimiento.
- La model card no documenta sesgos conocidos, pero al ser un modelo entrenado principalmente con datos multilingües cabe esperar sesgos similares a los de otros modelos de su categoría.
- La licencia LFM Open License v1.0 es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria.
- El modelo requiere código personalizado (custom_code) en transformers, lo que puede complicar la integración con frameworks de inferencia estándar.
- No se especifican los formatos de cuantización disponibles ni el soporte en herramientas como llama.cpp, Ollama o vLLM, lo que limita las opciones de despliegue documentadas.
- El contexto de 256K tokens puede degradar la calidad en el extremo superior de la ventana; no se han publicado evaluaciones al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dohxjb/LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Blog de lanzamiento de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
- Colección de la familia LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Licencia LFM Open License v1.0: https://huggingface.co/dohxjb/LFM3-1.7B/blob/main/LICENSE
