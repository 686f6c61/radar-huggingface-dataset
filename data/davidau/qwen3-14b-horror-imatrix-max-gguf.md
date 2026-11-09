# DavidAU/Qwen3-14B-HORROR-Imatrix-Max-GGUF

## Resumen
Qwen3-14B-HORROR-Imatrix-Max-GGUF es una cuantización GGUF del modelo Qwen3-14B de Alibaba Qwen, publicada por el creador independiente DavidAU en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetación del Qwen3-14B original con cuantizaciones generadas mediante una matriz de importancia (imatrix) construida específicamente con un dataset orientado a narrativa de terror, generado a su vez con el modelo "Grand Horror 16B". El objetivo declarado es reforzar el rendimiento en generación creativa y narrativa de terror sin renunciar a las capacidades de razonamiento del modelo base.

El modelo conserva la arquitectura del Qwen3-14B original: un transformer denso de 14.768.307.200 parámetros, con ventana de contexto declarada de 32K tokens más 8K de generación de salida, ampliable hasta 128K. Incluye el modo de razonamiento ("thinking") característico de la familia Qwen3, que produce bloques de cadena de pensamiento antes de la respuesta final. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es doble: por un lado, ofrece una vía de bajo coste para ejecutar un modelo de 14B con calidad de cuantización mejorada en GPUs de consumo; por otro, ejemplifica una práctica creciente en la comunidad open source, la de las cuantizaciones "temáticas" con imatrix especializada, que ajustan la asignación de bits según la distribución de activaciones de un dominio concreto. Es importante subrayar que la imatrix solo afecta a las cuantizaciones de baja precisión (IQ4XS, IQ4NL, etc.), no al Q8_0 ni al F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), con modo de razonamiento integrado |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens + 8K de generación; ampliable a 128K según el autor |
| Tipos de cuantizacion | GGUF con imatrix (IQ4XS, IQ4NL y otras variantes), Q8_0 (sin efecto imatrix) y F16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base: 14.768.307.200 parametros) |

## Arquitectura y entrenamiento
El modelo subyacente, Qwen3-14B, es un transformer denso con atención estándar y mecanismos de razonamiento explícito: el modelo puede emitir bloques `<think>...</think>` antes de la respuesta, lo que permite separar el proceso de deliberación de la salida final. DavidAU no reentrena el modelo; lo que hace es generar cuantizaciones GGUF aplicando una matriz de importancia (imatrix) calculada sobre un corpus de terror producido internamente con el modelo "Grand Horror 16B". La imatrix guía la asignación de precisión por tensor durante la cuantización, de modo que los tensores más sensibles a ese dominio conservan más bits.

El autor indica que el efecto de la imatrix es más pronunciado cuanto menor es la cuantización, siendo IQ4XS e IQ4NL el punto de equilibrio recomendado entre calidad y tamaño. Para razonamiento puro recomienda cuantizaciones más altas. Q8_0 se ofrece sin imatrix porque esta no tiene efecto a esa precisión, y F16 se incluye como referencia de precisión completa. No se dispone de datos sobre el número de tokens de entrenamiento del modelo base ni sobre la composición exacta del dataset de imatrix más allá de su temática.

## Capacidades
- Generación de texto conversacional y narrativo, con especial énfasis en ficción de terror y atmósferas descriptivas.
- Modo de razonamiento ("thinking") con bloques de cadena de pensamiento delimitados por etiquetas `<think>`.
- Razonamiento multi-paso y resolución de problemas, heredado del Qwen3-14B base.
- Generación de código y matemáticas (capacidades del modelo base, no verificadas específicamente en esta cuantización).
- Soporte de plantillas de chat ChatML y plantilla Jinja de Qwen3 (con advertencia del autor sobre problemas con la auto-plantilla).
- Personalización mediante system prompt y prompts de "mejora" orientados a narrativa (estructura de historia, diálogo, arcos de personaje).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no confirmado en la información proporcionada para esta cuantización.

## Casos de uso
- Escritura de ficción de terror y relatos atmosféricos: la imatrix entrenada sobre corpus de terror refuerza la coherencia de estilo y la riqueza descriptiva en cuantizaciones bajas, lo que lo hace adecuado para generar escenas, diálogos y arcos narrativos con un tono consistente.
- Prototipado de videojuegos narrativos o de terror: el modelo puede generar descripciones de escenarios, diálogos de personajes y ramificaciones de trama en tiempo de ejecución, con contexto de 32K suficiente para mantener el estado de una partida.
- Asistente de escritura con razonamiento: el modo thinking permite planificar estructuras de historia y detectar incoherencias argumentales antes de redactar, útil en herramientas de edición asistida.
- Despliegue local en estaciones de trabajo con GPU de consumo: al estar en GGUF, se puede ejecutar con llama.cpp u Ollama en GPUs de 16-24 GB usando cuantizaciones IQ4, sin depender de servicios en la nube.
- Generación de contenido para rol y narrativa interactiva: los prompts de sistema incluidos por el autor (estructura narrativa, 50% diálogo, 25% narración) están pensados para sesiones de roleplay largo con contexto extendido.
- Investigación sobre cuantización con imatrix: sirve como caso de estudio reproducible para medir el impacto de una imatrix especializada frente a una genérica en tareas creativas, comparando IQ4XS, IQ4NL, Q8_0 y F16.
- Filtrado y generación de contenido creativo en pipelines por lotes: con vLLM o llama.cpp server se puede integrar en un pipeline que genere variantes de texto para revisión editorial.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otras cuantizaciones.

## Requisitos de hardware
- VRAM estimada: F16 requiere aproximadamente 28-30 GB; Q8_0 en torno a 15-16 GB; cuantizaciones IQ4 en el rango de 8-9 GB; cuantizaciones de 4 bits estándar alrededor de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para F16 y despliegues de alta concurrencia; RTX 4090 (24 GB) para Q8_0 o IQ4 con contexto largo; RTX 4080/4070 Ti Super (16 GB) para Q8_0 ajustado o IQ4 con contexto moderado.
- GPU de consumo: sí, cabe en RTX 4090, 4080, 4070 Ti Super y en GPUs de 12-16 GB usando IQ4XS/IQ4NL, que el autor señala como las de mejor equilibrio calidad/tamaño.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (el autor incluye instrucciones específicas para LM Studio y plantilla Jinja), y servidores compatibles con GGUF. El repo indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán de la cuantización, la GPU y la longitud del contexto; el modo thinking incrementa el número de tokens generados y, por tanto, la latencia percibida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DavidAU/Qwen3-14B-HORROR-Imatrix-Max-GGUF | 14,77B | 32K (+8K salida, hasta 128K) | GGUF | Apache 2.0 | Cuantización temática con imatrix de terror |
| Qwen/Qwen3-14B (base) | 14,77B | 32K (ampliable) | safetensors | Apache 2.0 | Modelo original, sin cuantizar; referencia de calidad |
| Cuantizaciones GGUF estándar de Qwen3-14B | 14,77B | 32K | GGUF | Apache 2.0 | Sin imatrix especializada; calidad genérica |
| Modelos de 13-14B de otras familias (p. ej. Llama 3.1 8B/70B no comparables directamente) | variable | variable | variable | variable | No disponible comparación numérica en la información proporcionada |

## Limitaciones y advertencias
- No es un modelo nuevo: todas las capacidades de razonamiento, código y matemáticas provienen del Qwen3-14B base; la imatrix solo modula la precisión de los tensores en cuantizaciones bajas.
- La especialización en terror puede sesgar el estilo hacia lo oscuro o lo dramático en usos genéricos; conviene evaluar en el dominio objetivo antes de producción.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización; el modo thinking no garantiza corrección factual.
- La imatrix no tiene efecto en Q8_0 ni en F16; usar esas variantes no aporta la mejora temática anunciada.
- El autor advierte de posibles problemas con la plantilla Jinja automática; recomienda ChatML o una plantilla externa, lo que puede complicar integraciones.
- Idiomas soportados no documentados en esta ficha; verificar el comportamiento multilingüe contra el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado (terror, violencia) puede requerir moderación según el contexto de despliegue.
- Repo de 148,4 GB: el almacenamiento local necesario para todas las variantes es elevado; descargar solo la cuantización requerida.
- No hay benchmarks publicados que cuantifiquen la mejora de la imatrix frente a cuantizaciones estándar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3-14B-HORROR-Imatrix-Max-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Perfil del autor: https://huggingface.co/DavidAU
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Plantilla Jinja para LM Studio: https://lmstudio.ai/neil/qwen3-thinking
- Apoyo al autor: https://buymeacoffee.com/davidbelton
