# SirSahOl/NeoHorse-1-9B-chat-mlx-8bit

## Resumen

NeoHorse-1-9B-chat-mlx-8bit es una conversión cuantizada a 8 bits del modelo TokenRhythm/NeoHorse-1-9B, realizada por SirSahOl y optimizada para inferencia nativa en GPU de Apple Silicon mediante el framework MLX. El modelo base es un transformer causal de la familia Qwen3.5 con aproximadamente 9.000 millones de parámetros y una ventana de contexto de 262.144 tokens. Esta variante está pensada para ejecutar tareas de generación de texto, razonamiento, codificación, uso de herramientas y comportamiento agéntico en equipos con memoria unificada de Apple, ofreciendo un equilibrio entre calidad de salida y consumo de recursos.

La relevancia de esta conversión radica en que permite ejecutar un modelo de 9B con capacidades avanzadas de tool calling y razonamiento multi-paso en hardware doméstico de Apple, sin necesidad de servidores externos ni GPUs dedicadas. Al estar disponible en formato MLX con cuantización 8-bit (promedio de 8,25 bits por peso), reduce el footprint de VRAM activa a aproximadamente 10,4 GB, lo que lo hace viable en equipos con 16 GB de memoria unificada o superior. La licencia Apache 2.0 permite su uso tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM |
| Parametros totales | 8.953.801.728 (~9.0B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8-bit MLX (variantes 4-bit y 16-bit disponibles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Qwen3_5ForCausalLM, un transformer causal estándar de la familia Qwen. No se trata de un modelo de mezcla de expertos (MoE), por lo que todos los parámetros se activan en cada paso de generación. El modelo base, TokenRhythm/NeoHorse-1-9B, fue desarrollado por TokenRhythm, aunque no se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens procesados ni la aplicación de técnicas de alineación como RLHF o DPO. Los metadatos del repositorio sugieren que fue entrenado para tareas de instrucción, razonamiento, codificación, uso de herramientas y comportamiento agéntico.

La innovación técnica de esta variante es la conversión al formato MLX de Apple con cuantización de 8 bits. MLX es un framework de arrays optimizado para la memoria unificada de los chips Apple Silicon, lo que permite aprovechar la GPU integrada sin necesidad de copiar datos entre CPU y GPU. La cuantización 8-bit reduce el tamaño de los pesos de 16 bits a un promedio de 8,25 bits por peso, manteniendo una calidad de razonamiento cercana a la versión sin cuantizar y reduciendo significativamente el consumo de memoria.

## Capacidades

- Generación de texto conversacional con plantilla ChatML, compatible con el formato de mensajes de OpenAI.
- Soporte de tool calling y function calling, lo que permite integrar el modelo en flujos de trabajo que requieren invocar funciones externas.
- Comportamiento agéntico y razonamiento multi-paso, adecuado para tareas que requieren planificación y ejecución secuencial.
- Generación de código en múltiples lenguajes gracias a su entrenamiento específico en coding.
- Razonamiento matemático y lógico, con capacidad de seguir instrucciones complejas.
- Inferencia nativa en Apple Silicon mediante MLX, con soporte para la API de Python de mlx-lm y la CLI interactiva.
- Ventana de contexto amplia de 262.144 tokens, que permite procesar documentos largos, repositorios de código completos o historiales de conversación extensos.

## Casos de uso

- Asistente interactivo local en Mac: mediante `mlx_lm.chat`, el modelo puede gestionar conversaciones multi-turno con respuesta rápida en equipos con 16 GB de memoria unificada, sin necesidad de conexión a internet.
- Generación de código en el editor: gracias a su entrenamiento en coding y al soporte de tool calling, puede integrarse en IDEs como VS Code para autocompletar funciones, explicar fragmentos de código o refactorizar archivos, aprovechando la ventana de contexto de 262k tokens para analizar proyectos completos.
- Agentes autónomos: el modelo puede orquestar flujos de trabajo multi-paso, como la automatización de tareas de scraping, la generación de informes o la ejecución de scripts, utilizando su capacidad de razonamiento agéntico y de invocar herramientas externas.
- Procesamiento de documentación extensa: la ventana de contexto de 262.144 tokens permite resumir, analizar o extraer información de documentos técnicos, manuales o bases de conocimiento de gran tamaño en una sola pasada.
- Prototipado de aplicaciones con MLX: los desarrolladores pueden usar la API de Python de mlx-lm para construir aplicaciones de chat, asistentes de soporte o herramientas de análisis de texto que se ejecutan completamente en local sobre Apple Silicon.
- Despliegue en producción en infraestructura Mac: al ser compatible con `endpoints_compatible`, el modelo puede servirse mediante contenedores o servicios de inferencia en clústeres de Mac, aprovechando la alta velocidad de generación en chips M1/M2/M3/M4 Ultra para atender peticiones concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona únicamente estimaciones de rendimiento de inferencia para distintos niveles de Apple Silicon, que se resumen a continuación. Estos valores son orientativos y pueden variar según la longitud del contexto y la carga del sistema.

| Apple Silicon Tier | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Caso de uso recomendado |
|---|---|---|---|---|---|
| M1 / M2 / M3 / M4 (Base) | 16 GB | ~10,5 GB | ~19 tokens/seg | ~200 ms | Asistente interactivo diario |
| M1 / M2 / M3 / M4 Pro | 18-36 GB | ~10,5 GB | ~28 tokens/seg | ~136 ms | Uso equilibrado: código, tool calling, chat |
| M1 / M2 / M3 / M4 Max | 36-128 GB | ~10,5 GB | ~41 tokens/seg | ~84 ms | Alta generación, baja latencia, orquestación de agentes |
| M1 / M2 / M3 / M4 Ultra | 64-192 GB | ~10,5 GB | ~57 tokens/seg | ~56 ms | Concurrencia máxima, extracción de documentos, servidores |

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,4 GB en cuantización 8-bit (footprint activo). Se recomienda un mínimo de 16 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 en sus variantes Base, Pro, Max y Ultra). No es compatible con GPUs NVIDIA o AMD.
- ¿Cabe en consumer GPU? No, es una conversión específica para Apple Silicon. No existe versión CUDA ni ROCm.
- Opciones de despliegue: mlx-lm (CLI y API Python), LM Studio con configuración de stop strings para ChatML, o integración directa mediante la librería MLX.
- Latencia y throughput estimados: entre 19 y 57 tokens por segundo y un tiempo hasta el primer token (TTFT) de entre 56 y 200 ms, dependiendo del chip de Apple utilizado.

## Comparativa con modelos similares

Dentro de la misma familia de cuantizaciones MLX, las tres variantes del modelo NeoHorse-1-9B se diferencian principalmente por el nivel de precisión, el tamaño en disco y el hardware objetivo. La siguiente tabla compara estas variantes entre sí:

| Variante | Tamaño en disco | Footprint VRAM | Hardware objetivo | Ventaja principal |
|---|---|---|---|---|
| 4-bit MLX | ~5,3 GB | ~5,3 GB | M1/M2/M3/M4 con 8 GB+ | Máxima velocidad y menor consumo de RAM |
| 8-bit MLX (este repositorio) | ~9,9 GB | ~9,9 GB | M1/M2/M3/M4 Pro/Max con 16 GB+ | Equilibrio entre precisión y velocidad |
| 16-bit MLX | ~18,8 GB | ~18,8 GB | M2/M3/M4 Max/Ultra con 32 GB+ | Precisión completa sin degradación |

En cuanto a modelos comparables de otros desarrolladores, no se dispone de datos en la información proporcionada. La referencia más directa es el modelo base TokenRhythm/NeoHorse-1-9B, cuyas capacidades se mantienen intactas en esta conversión, ya que la cuantización no altera la arquitectura ni los pesos de forma significativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre sesgos específicos del modelo o de sus conversiones.
- Riesgo de alucinación: no documentado. Como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o con contexto ambiguo.
- Limitaciones de idioma: el campo de idiomas de HuggingFace indica "no disponible", por lo que no se puede confirmar la cobertura multilingüe. Se recomienda verificar el comportamiento en el idioma de uso antes de desplegar en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y la licencia. No hay restricciones adicionales conocidas.
- Caveat importante para producción: las velocidades y el TTFT son estimaciones del autor basadas en el ancho de banda de memoria unificada de Apple Silicon. Los valores reales pueden variar significativamente con la longitud del contexto, la carga del sistema y la versión de MLX utilizada.
- El modelo requiere configurar stop strings específicos (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`) en runtimes como LM Studio para evitar bucles de generación y asegurar un turn-taking correcto.
- Al ser una conversión MLX, no puede ejecutarse en entornos CUDA. Cualquier despliegue en servidores con GPUs NVIDIA requeriría usar el modelo base en formato PyTorch o GGUF.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y aún no cuenta con validación de la comunidad.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-8bit
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Variante 4-bit MLX: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-4bit
- Variante 16-bit MLX: https://huggingface.co/SirSahOl/NeoHorse-1-9B-chat-mlx-16bit
- Framework MLX: https://github.com/ml-explore/mlx
- Referencia arXiv (según metadatos): https://arxiv.org/abs/2609.08183
