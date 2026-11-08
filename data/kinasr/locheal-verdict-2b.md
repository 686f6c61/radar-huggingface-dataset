# kinasr/locheal-verdict-2b

## Resumen

locheal-verdict-2b es un fine-tune del modelo de decisión d1-2B de Liquid AI, publicado por el usuario kinasr sobre la base LFM3-VL-2B. A diferencia de un modelo generativo convencional, está orientado a la extracción de características y a la clasificación: devuelve respuestas calibradas sobre texto, imágenes y vídeo en un único paso forward, sin generar tokens de forma autorregresiva. El checkpoint declara 2.180.325.888 parámetros en safetensors y un repositorio de 4,5 GB.

El modelo hereda la arquitectura híbrida del backbone LFM3, con 24 capas que combinan convoluciones cortas con compuerta, atención de ventana deslizante y atención global. Esa mezcla reduce el coste computacional frente a un transformer denso equivalente y permite latencias de milisegundos por decisión, lo que lo sitúa en la categoría de modelos "system-one" para edge y producción de alta frecuencia.

Su relevancia práctica está en sustituir tareas de clasificación, extracción de entidades, localización de objetos y estimación de cantidades que normalmente requieren un LLM generativo o un pipeline de modelos especializados. Al resolverlas en una sola pasada y con calibración explícita, encaja en sistemas donde la latencia y el coste por inferencia son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 híbrida: 24 capas (13 convoluciones cortas con compuerta, 5 de atención de ventana deslizante, 6 de atención global) |
| Parametros totales | 2.180.325.888 (2,18B); la model card declara 1,92B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors, con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

El modelo se construye sobre LFM3-VL-2B, un backbone multimodal de Liquid AI que combina tres tipos de capa en sus 24 niveles: convoluciones cortas con compuerta, atención de ventana deslizante y atención global. Esta hibridación busca capturar dependencias locales de forma barata y reservar la atención completa para un número reducido de capas, lo que explica las latencias declaradas de 5,7 ms por decisión en H100 y 3,8 ms en MI325X.

El checkpoint es un post-entrenamiento orientado a decisión, no un modelo conversacional al uso: la model card describe un modelo que "devuelve respuestas calibradas en un solo paso forward, sin generar tokens". No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF o DPO. Tampoco se especifican los datos concretos del fine-tune de kinasr respecto al d1-2B original.

## Capacidades

- Clasificación calibrada sobre texto, imágenes y vídeo en una sola pasada forward.
- Extracción de texto, números y fechas junto con sus spans.
- Localización de objetos en imágenes.
- Estimación de cantidades con intervalo de confianza.
- Respuesta a múltiples preguntas sobre un mismo estado en una única llamada.
- Procesamiento multimodal image-text-to-text.
- Cobertura multilingüe en 16 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Soporte de tool calling y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Moderación de contenido visual: el modelo puede clasificar imágenes y vídeo en categorías predefinidas con probabilidad calibrada, lo que permite fijar umbrales de revisión humana de forma explícita en lugar de depender de la confianza implícita de un LLM generativo.
- Extracción de datos de documentos: al devolver spans de texto, números y fechas, encaja en pipelines de digitalización de facturas, formularios o contratos donde se necesita localizar el campo exacto y no solo su valor.
- Control de calidad en líneas de producción: la localización de objetos y la estimación de cantidades con intervalo permiten detectar defectos o contar piezas en imágenes industriales con latencias de milisegundos.
- Enrutamiento y triaje en atención al cliente: clasificar tickets o mensajes entrantes por categoría y urgencia en una sola pasada reduce el coste frente a un modelo generativo, siempre que la ventana de contexto sea suficiente para el historial.
- Análisis de vídeo en tiempo real: la capacidad de decidir sobre vídeo con latencia de milisegundos lo hace apto para sistemas de vigilancia, señalización o monitorización donde no cabe un pipeline generativo.
- Anonimización y etiquetado de datasets: la extracción de spans facilita marcar entidades sensibles en corpus multilingües antes de entrenar otros modelos.
- Verificación de respuestas en sistemas RAG: usar el modelo como clasificador de relevancia o de contradicción sobre pares pregunta-respuesta, aprovechando su calibración para descartar recuperaciones dudosas.

## Benchmarks y rendimiento

La model card del d1-2B afirma que lidera los modelos abiertos d1 en promedio y en un conjunto de más de cien benchmarks de decisión, por delante de d1-3B con menos de dos tercios de su tamaño. Sin embargo, no se proporcionan en la información disponible las puntuaciones numéricas concretas por benchmark (MMLU, HumanEval, GSM8K u otros), ni resultados específicos del fine-tune de kinasr.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 2,18B en fp16 requiere alrededor de 4,4 GB de pesos, más overhead de activaciones y del codificador visual.
- GPU recomendadas: la model card cita latencias medidas en NVIDIA H100 (5,7 ms por decisión) y AMD MI325X (3,8 ms por decisión).
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en fp16, y en 6 GB o menos con cuantización a 8 bits, aunque no se confirman cuantizaciones publicadas.
- Opciones de despliegue: al usar `custom_code` y la librería transformers, requiere cargar el código remoto del repositorio; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 5,7 ms por decisión en H100 y 3,8 ms en MI325X según el autor del modelo base; el throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kinasr/locheal-verdict-2b | 2,18B | no disponible | Decisión multimodal (fine-tune de d1-2B) | lfm1.0 | Hugging Face |
| LiquidAI/d1-2B | 1,92B | no disponible | Decisión multimodal | lfm1.0 | Hugging Face |
| LiquidAI/d1-3B | no disponible | no disponible | Decisión multimodal | lfm1.0 | Hugging Face |
| LiquidAI/d1-Omni-2B | no disponible | no disponible | Decisión multimodal con audio | lfm1.0 | Hugging Face |

La comparación con modelos generativos de tamaño similar (por ejemplo, LLM de 2B para clasificación) no está disponible en la información proporcionada, y requeriría datos de rendimiento que aquí no se aportan.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni conversación; su salida son decisiones, spans y etiquetas calibradas.
- El fine-tune lo publica un usuario individual (kinasr), no Liquid AI, por lo que no cuenta con la validación ni el soporte del autor original.
- La model card del d1-2B declara 1,92B de parámetros mientras que safetensors reporta 2,18B; la discrepancia no está explicada en la información disponible.
- Licencia lfm1.0: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (Apache 2.0 o MIT).
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica ejecutar código del repositorio y aumenta la superficie de riesgo en producción.
- No se documentan sesgos conocidos, tasas de alucinación ni límites de contexto en la información proporcionada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin evidencia de uso en producción ni validación comunitaria.
- La fecha de creación del repositorio (2026-11-07) y la falta de benchmarks específicos del fine-tune impiden evaluar su calidad frente al d1-2B original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinasr/locheal-verdict-2b
- Modelo base LFM3-VL-2B: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Modelo d1-Omni-2B: https://huggingface.co/LiquidAI/d1-Omni-2B
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de open d1: https://www.liquid.ai/blog/open-d1
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/
- Fine-tune relacionado del mismo autor: https://huggingface.co/kinasr/visual-verdict-2b
