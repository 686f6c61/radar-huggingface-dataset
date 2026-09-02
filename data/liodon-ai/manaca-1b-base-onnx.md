# liodon-ai/manaca-1b-base-ONNX

## Resumen

Manacá-1B es un modelo de lenguaje de tipo decoder-only con 1,72 mil millones de parámetros, entrenado desde cero para portugués brasileño por el Instituto IA LNCC. El modelo original, publicado como `menezesbruno/manaca-1b-base`, se caracteriza por su pipeline de entrenamiento totalmente reproducible y estable, sin pasos de entrenamiento con NaN y con recuperación automática de picos de pérdida. La versión ONNX, publicada por Liodon AI, es una exportación del modelo base mediante la librería `optimum`, pensada para facilitar su despliegue en entornos que usan ONNX Runtime, tanto en CPU como en GPU, con opciones de cuantización para reducir el uso de memoria.

Esta exportación incluye tres variantes de pesos: FP32 (precisión completa), FP16 (para GPU) y una cuantización dinámica INT8 (solo pesos, sin calibración). El modelo está orientado a la generación de texto en portugués brasileño y, al ser un modelo base, no incluye fine-tuning para instrucciones ni capacidades de chat conversacional. Su relevancia radica en ofrecer una alternativa abierta y reproducible para tareas de procesamiento de lenguaje natural en portugués, con un tamaño moderado que permite su ejecución en hardware de consumo. La licencia se indica como "other", sin detalles adicionales sobre restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only (transformer), probablemente similar a Llama según el tag, sin confirmación oficial |
| Parametros totales | 1,72 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32, FP16, INT8 (dinámico, solo pesos) |
| Idiomas soportados | Portugués brasileño |
| Licencia | other (sin especificar) |
| Formato de pesos | ONNX (archivos `.onnx`) |

## Arquitectura y entrenamiento

El modelo original Manacá-1B es un transformer decoder-only con 1,72 mil millones de parámetros, entrenado desde cero para portugués brasileño. Según el paper, el entrenamiento se realizó con un pipeline totalmente containerizado y reproducible, que garantiza estabilidad: cero pasos con NaN y recuperación automática de picos de pérdida. No se han publicado detalles sobre la cantidad de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La exportación ONNX se realizó con `optimum` usando la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de past-key-values para permitir decodificación autoregresiva con caché de KV. No se mencionan innovaciones técnicas adicionales en la arquitectura.

## Capacidades

- Generación de texto en portugués brasileño: el modelo es capaz de continuar secuencias de texto de forma autoregresiva, sin instrucciones específicas.
- Completado de texto: al ser un modelo base, su uso principal es la continuación de texto libre, sin formato de chat.
- Fine-tuning posterior: al ser un modelo base, puede adaptarse mediante fine-tuning para tareas concretas como clasificación, generación de resúmenes o extracción de información en portugués.
- Ejecución multiplataforma: gracias al formato ONNX, puede ejecutarse en CPU, GPU y otros dispositivos compatibles con ONNX Runtime.
- Soporte de KV-cache: el grafo ONNX incluye entradas y salidas para past-key-values, lo que permite inferencia eficiente con caché de atención.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Generación de contenido en portugués: el modelo puede usarse para redactar artículos, descripciones de producto o texto creativo en portugués brasileño, aunque al ser un modelo base, los resultados pueden requerir ajuste posterior.
- Fine-tuning para clasificación de texto: dado que es un modelo base, se puede entrenar sobre datasets etiquetados para tareas como análisis de sentimiento, detección de spam o categorización de documentos en portugués.
- Asistencia en traducción automática: aunque no está entrenado específicamente para traducción, puede servir como base para modelos de traducción al portugués mediante fine-tuning.
- Desarrollo de chatbots especializados: tras un fine-tuning con datos de conversación, el modelo puede integrarse en sistemas de atención al cliente en portugués, aprovechando su tamaño moderado para despliegue en infraestructura limitada.
- Investigación en PNL para portugués: al ser abierto y reproducible, es útil como punto de partida para experimentos académicos sobre modelado de lenguaje en portugués brasileño.
- Despliegue en entornos con recursos limitados: la versión INT8, de 1,73 GB, permite ejecutar el modelo en CPUs con pocos recursos o en GPUs de gama baja, adecuada para prototipos o aplicaciones embebidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original podría contener métricas, pero no se incluyen en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: según la variante de pesos, el modelo necesita aproximadamente 6,9 GB en FP32, 3,6 GB en FP16 y 1,7 GB en INT8, más overhead de runtime. Para FP16 se recomienda al menos 6 GB de VRAM; para INT8, 4 GB son suficientes.
- GPUs recomendadas: cualquier GPU con soporte CUDA y al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) puede ejecutar la versión FP16. La versión INT8 puede funcionar en GPUs con 4 GB (como GTX 1650 o RTX 3050). En CPU, la versión INT8 es viable con unos 2 GB de RAM.
- En consumer GPU: sí, cabe en GPUs de gama media y baja gracias a su tamaño reducido.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), con wrappers de `optimum` como `ORTModelForCausalLM` para gestionar el caché de KV. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos concretos. Al ser un modelo de 1,72B, se espera una latencia moderada en CPU y baja en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (tamaño similar, mismo idioma) en los datos consultados.

## Limitaciones y advertencias

- Modelo base sin fine-tuning instructivo: no está diseñado para seguir instrucciones ni mantener conversaciones de forma directa; requiere adaptación para tareas específicas.
- Idioma limitado: solo entrenado para portugués brasileño; su rendimiento en otros idiomas, incluido el español, es probablemente deficiente o nulo.
- Licencia "other" sin especificar: no se detallan las restricciones de uso comercial o modificación; se recomienda contactar al autor antes de usar en producción.
- Riesgo de alucinaciones y sesgos: como todo modelo de lenguaje, puede generar contenido falso o sesgado, especialmente al no contar con fine-tuning para alineación.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto máxima, lo que limita la planificación de tareas que requieren entradas largas.
- Sin soporte de tool calling ni agentes: no se pueden integrar funciones externas ni flujos de razonamiento multi-paso sin modificaciones adicionales.

## Enlaces

- [HuggingFace - manaca-1b-base-ONNX](https://huggingface.co/liodon-ai/manaca-1b-base-ONNX)
- [HuggingFace - modelo base original](https://huggingface.co/menezesbruno/manaca-1b-base)
- [Paper en arXiv](https://arxiv.org/abs/2608.30114)
- [Repositorio GitHub del proyecto](https://github.com/Instituto-IA-LNCC/manaca-1b-base)
