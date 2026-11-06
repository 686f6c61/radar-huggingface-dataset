# rajpraz/gemma3-1b-it-litert

## Resumen

Gemma 3 1B IT LiteRT es una conversión del modelo Gemma 3 1B Instruct de Google a formato LiteRT (anteriormente TensorFlow Lite), publicada por el usuario rajpraz en Hugging Face. El objetivo de esta conversión es permitir la ejecución del modelo en dispositivos con recursos limitados, como móviles, sistemas embebidos o navegadores, aprovechando el runtime de LiteRT para inferencia optimizada en CPU y aceleradores ligeros. El repositorio ocupa 0,6 GB, lo que es coherente con un modelo de aproximadamente 1.000 millones de parámetros cuantizado.

El modelo base, Gemma 3 1B Instruct, es un transformer decoder-only desarrollado por Google DeepMind, publicado bajo licencia Gemma. La variante "IT" indica que ha pasado por un proceso de ajuste por instrucciones (instruction tuning), lo que lo hace adecuado para tareas conversacionales y de seguimiento de instrucciones. La conversión a LiteRT no altera la arquitectura ni los pesos originales, sino que los empaqueta en un formato optimizado para despliegue en el borde.

La relevancia de esta ficha radica en que las conversiones a LiteRT son cada vez más habituales para llevar modelos de lenguaje a entornos sin GPU dedicada. Sin embargo, la información publicada por el autor es mínima: la model card solo declara la licencia, sin especificar parámetros, contexto, datos de entrenamiento ni benchmarks. Esta ficha se redacta a partir de la información disponible y de las características conocidas del modelo base Gemma 3 1B IT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B) |
| Parametros totales | no disponible (el modelo base Gemma 3 1B tiene ~1.000 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato LiteRT, probablemente int8 o float16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | LiteRT (TensorFlow Lite) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 1B, un transformer decoder-only con atención por ventanas deslizantes y atención global alternada, diseñado por Google DeepMind para equilibrar calidad y eficiencia. El modelo base fue entrenado con datos multilingües y posteriormente ajustado por instrucciones y mediante técnicas de alineación (RLHF/DPO según la documentación pública de Gemma 3). La conversión a LiteRT realizada por rajpraz no modifica la arquitectura ni los pesos, sino que los transforma a un formato de grafo optimizado para el runtime LiteRT, que permite inferencia en CPU, GPU móvil y NPU en dispositivos compatibles.

No se dispone de información sobre el proceso de conversión: no se indica el método de cuantización aplicado, ni si se ha verificado la equivalencia funcional con el modelo original, ni qué versión concreta de LiteRT se ha utilizado. Tampoco se documenta si se ha realizado alguna validación de calidad tras la conversión. La única innovación técnica destacable es el propio formato LiteRT, que permite decodificación especulativa y ejecución de bajo consumo en el borde, pero no hay datos específicos sobre su implementación en este repositorio.

## Capacidades

- Generación de texto y razonamiento básico, heredadas del modelo base Gemma 3 1B IT.
- Seguimiento de instrucciones conversacionales (instruction tuning).
- Capacidades multilingües (el modelo base Gemma 3 soporta varios idiomas, aunque no se especifican cuáles en esta conversión).
- Posible soporte de tool calling y function calling, si el modelo base lo incluye y la conversión lo preserva (no confirmado).
- Ejecución en dispositivos de borde mediante LiteRT, con soporte para CPU y aceleradores ligeros.
- No se documentan capacidades de visión, audio ni modo "thinking" en esta conversión.

## Casos de uso

- Asistentes conversacionales en móviles: el modelo puede integrarse en aplicaciones Android o iOS mediante LiteRT para ofrecer respuestas generativas sin conexión, aprovechando el tamaño reducido de 1B parámetros y el formato optimizado.
- Procesamiento de texto en el navegador: LiteRT permite ejecutar el modelo en WebAssembly o WebGPU, habilitando funciones de resumen o reescritura directamente en el cliente sin enviar datos a un servidor.
- Clasificación y extracción de información en dispositivos embebidos: en escenarios de IoT o electrónica de consumo, el modelo puede realizar tareas de etiquetado o extracción de entidades sobre texto local.
- Generación de respuestas en entornos con conectividad intermitente: aplicaciones de campo, como herramientas de diagnóstico o asistentes técnicos, que requieren funcionar sin red.
- Prototipado rápido de aplicaciones de IA generativa: desarrolladores que quieran probar un modelo de 1B en local sin depender de infraestructura cloud pueden usar esta conversión como punto de partida.
- Filtrado y moderación de contenido en el dispositivo: el modelo puede evaluar texto de entrada y generar etiquetas o respuestas de moderación sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1B parámetros, en cuantización int8 requiere aproximadamente 1 GB de memoria; en float16, unos 2 GB. El repositorio de 0,6 GB sugiere una cuantización agresiva (posiblemente int8 o menor).
- GPU recomendadas: no requiere GPU dedicada; está pensado para CPU, GPU integrada o NPU de dispositivos móviles. En escritorio, puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1050, RTX 3050). También en Raspberry Pi 4/5 con suficiente RAM.
- Opciones de despliegue: LiteRT runtime (Android, Linux, Web), TensorFlow Lite Interpreter, y posiblemente MediaPipe LLM Inference API. No se mencionan vLLM, llama.cpp ni Ollama, ya que el formato LiteRT no es compatible directamente con esos motores.
- Latencia y throughput: no disponibles. Dependerán del dispositivo y de la cuantización; en un móvil de gama media se puede esperar decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rajpraz/gemma3-1b-it-litert | ~1B (no confirmado) | no disponible | LiteRT | Gemma | Hugging Face |
| google/gemma-3-1b-it | ~1B | no disponible en esta ficha | safetensors | Gemma | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1.2B | 128k | safetensors, GGUF | Llama 3.2 | Hugging Face |

La comparativa se basa en características generales de modelos de tamaño similar. No se dispone de datos de rendimiento específicos para la conversión LiteRT, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, alucinación ni limitaciones idiomáticas; se heredan las del modelo base Gemma 3 1B IT, que pueden incluir sesgos de los datos de entrenamiento y riesgo de generar contenido inexacto.
- La licencia Gemma impone restricciones de uso comercial y requiere el cumplimiento de los términos de uso de Google; es responsabilidad del usuario revisarlos antes de desplegar el modelo en producción.
- Al ser una conversión no oficial, no hay garantía de que el comportamiento sea idéntico al modelo original; pueden existir degradaciones por la cuantización o el proceso de conversión.
- No se documenta la versión de LiteRT ni el método de cuantización, lo que dificulta la reproducibilidad y la evaluación de la calidad.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda precaución en entornos de producción.
- El contexto máximo no está especificado; si se hereda del modelo base, podría ser de 32k tokens, pero no está confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/rajpraz/gemma3-1b-it-litert
- Modelo base Gemma 3 1B IT (referencia): https://huggingface.co/google/gemma-3-1b-it
- Documentación de LiteRT: https://ai.google.dev/edge/litert
- Licencia Gemma: https://ai.google.dev/gemma/terms
