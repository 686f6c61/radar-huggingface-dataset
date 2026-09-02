# ByteDance/Ouro-1.4B

## Resumen

Ouro-1.4B es un modelo de lenguaje de 1.400 millones de parámetros desarrollado por ByteDance, basado en una arquitectura de modelo de lenguaje en bucle (Looped Language Model, LoopLM). En lugar de apilar capas transformer de forma independiente, el modelo reutiliza los mismos bloques de transformación de forma recurrente, aplicándolos varias veces sobre la misma secuencia. Esto permite realizar un cómputo iterativo en el espacio latente, lo que se traduce en una capacidad de razonamiento más profunda sin aumentar proporcionalmente el número de parámetros. Según sus autores, el modelo iguala el rendimiento de transformadores estándar de 3.000 a 4.000 millones de parámetros con solo 1.400 millones.

El modelo se entrena con 7,7 billones de tokens en varias etapas, incluyendo pre-entrenamiento, annealing de contexto largo y mid-training. Soporta una longitud de contexto de 4.000 tokens durante el entrenamiento, extensible hasta 64.000 tokens. Incluye un mecanismo de salida temprana adaptativa que permite ajustar dinámicamente el cómputo según la dificultad de la tarea. Está licenciado bajo Apache-2.0 y se distribuye en formato safetensors, pensado principalmente para investigación. El paper asociado (arXiv:2510.25741) describe el escalado del razonamiento latente mediante modelos de lenguaje en bucle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer con parámetros compartidos en pasos recurrentes (LoopLM) |
| Parametros totales | 1.434.652.673 (1,4B) |
| Parametros activos | No aplica (no es MoE; todos los parámetros se usan en cada paso recurrente) |
| Longitud de contexto | 4K en entrenamiento, extensible a 64K |
| Tipos de cuantizacion | No especificados por el autor; compatible con cuantización estándar de Transformers (bitsandbytes, GPTQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

Ouro-1.4B emplea una arquitectura decoder-only Transformer con 24 capas y un tamaño oculto de 2048. La innovación principal es el bucle recurrente: los mismos bloques transformer se aplican de forma iterativa sobre la representación latente, con un número configurable de pasos recurrentes (`total_ut_steps`, por defecto 4). Esto permite que el modelo realice múltiples pasos de razonamiento sin aumentar el número de parámetros. La atención es multi-cabeza (MHA), la activación de la FFN es SwiGLU, el posicionamiento usa RoPE y la normalización es Sandwich RMSNorm. El vocabulario tiene 49.152 tokens.

El entrenamiento se realizó en cuatro etapas: pre-entrenamiento con 6 billones de tokens, annealing de contexto (CT annealing) con 1,4 billones, entrenamiento de contexto largo con 20.000 millones y mid-training con 300.000 millones, sumando 7,7 billones de tokens en total. La composición de datos incluye web, código, matemáticas y documentos de contexto largo. Se usó el optimizador AdamW (β₁=0,9, β₂=0,95) con un programador de tasa de aprendizaje Warmup-Stable-Decay (WSD). El modelo incorpora un mecanismo de salida temprana adaptativa controlado por `early_exit_threshold`, que permite detener el cómputo recurrente antes de completar todos los pasos cuando la confianza es suficiente.

## Capacidades

- Generación de texto y razonamiento latente iterativo: el bucle recurrente permite múltiples pasos de cómputo sobre la misma representación, mejorando la capacidad de razonamiento sin aumentar parámetros.
- Razonamiento matemático y lógico: entrenado con datos de matemáticas y código, muestra buen rendimiento en tareas de razonamiento simbólico.
- Generación de código: soporta tareas de programación gracias a la inclusión de código en el entrenamiento.
- Procesamiento de contexto largo: aunque entrenado con 4K tokens, es extensible hasta 64K, útil para documentos extensos.
- Salida temprana adaptativa: permite ajustar el número de pasos recurrentes según la dificultad, reduciendo la latencia en tareas sencillas.
- Configuración flexible del cómputo: el usuario puede modificar `total_ut_steps` para equilibrar rendimiento y velocidad.
- No se menciona soporte explícito de tool calling, function calling, agentes o capacidades multimodales en la información disponible.

## Casos de uso

- Razonamiento matemático y lógico en entornos educativos: el modelo puede resolver problemas de álgebra, cálculo y lógica simbólica, útil para asistentes de estudio o generación de ejercicios con explicaciones paso a paso.
- Generación de código en entornos de desarrollo: puede completar funciones, generar scripts y ayudar en tareas de programación, integrándose en editores o pipelines de CI/CD para sugerencias de código.
- Análisis de documentos largos: gracias a la extensión de contexto hasta 64K, puede resumir informes extensos, extraer información clave o responder preguntas sobre documentos legales o técnicos.
- Prototipado rápido de asistentes conversacionales: su tamaño reducido y licencia Apache-2.0 permiten desplegarlo en entornos de desarrollo para experimentar con chatbots de dominio específico sin costes de licencia.
- Investigación en eficiencia de parámetros: sirve como banco de pruebas para estudiar arquitecturas con parámetros compartidos y razonamiento recurrente, comparando su rendimiento con transformadores estándar de tamaño similar.
- Inferencia en entornos con recursos limitados: al ser un modelo de 1,4B, puede ejecutarse en GPUs de consumo o incluso en CPU con cuantización, adecuado para aplicaciones edge o prototipos sin acceso a hardware de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La model card afirma que el modelo "iguala el rendimiento de transformadores estándar de 3-4B", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros. Se recomienda consultar el paper (arXiv:2510.25741) para datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,4B parámetros, en fp16 ocupa aproximadamente 2,8 GB; en int8 alrededor de 1,4 GB; en int4 cerca de 0,7 GB. Estas cifras son estimaciones orientativas basadas en el tamaño del modelo, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, RTX 3050, RTX 4060). Para cuantización int4, bastan 1-2 GB, lo que permite ejecutarlo en GPUs muy modestas o incluso en CPU con llama.cpp.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., con cuantización o incluso en fp16.
- Opciones de despliegue: compatible con Transformers (recomendado `transformers<4.56.0`, idealmente 4.54.1). vLLM soporta el modelo pero no la salida temprana adaptativa; en vLLM siempre se ejecutan todos los pasos recurrentes. También puede usarse con llama.cpp u Ollama si se convierte a GGUF, aunque no se menciona oficialmente.
- Latencia y throughput: no disponibles. El número de pasos recurrentes multiplica el coste de inferencia; con 4 pasos, la latencia es aproximadamente 4 veces mayor que un transformer estándar del mismo tamaño, aunque la salida temprana puede reducirla en tareas fáciles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Ouro-1.4B | 1,4B | 4K (ext. 64K) | LoopLM recurrente | Apache-2.0 | Razonamiento latente, salida temprana |
| Qwen2.5-1.5B | 1,5B | 32K | Transformer estándar | Apache-2.0 | Buen rendimiento general, multilingüe |
| Llama-3.2-1B | 1,2B | 128K | Transformer estándar | Llama 3.2 Community | Contexto muy largo, eficiente |
| Gemma-2-2B | 2,6B | 8K | Transformer estándar | Gemma Terms | Mayor tamaño, buen rendimiento |

No se dispone de datos de rendimiento comparativos en la información proporcionada. La comparativa se basa en características arquitectónicas y de licencia.

## Limitaciones y advertencias

- El modelo está destinado exclusivamente a fines de investigación; se proporciona "tal cual" sin garantías para uso en producción.
- No se han publicado datos sobre sesgos, alucinaciones o comportamientos adversos en la información disponible.
- La longitud de contexto de entrenamiento es de 4K tokens; aunque se puede extender a 64K, el rendimiento en contextos largos puede degradarse fuera del rango de entrenamiento.
- No se especifican los idiomas soportados; la información no está disponible.
- La compatibilidad con Transformers requiere versiones anteriores a 4.56.0; versiones más recientes pueden presentar problemas (se menciona un fix de KV cache para versiones >=4.56.0, pero se recomienda usar 4.54.1).
- vLLM no soporta la salida temprana adaptativa; en ese entorno siempre se ejecutan todos los pasos recurrentes, lo que aumenta la latencia.
- El coste de inferencia es mayor que un transformer estándar del mismo tamaño debido a los pasos recurrentes; hay que tenerlo en cuenta para despliegues en producción.
- No se mencionan capacidades multimodales, tool calling ni function calling; el modelo es exclusivamente de texto.

## Enlaces

- HuggingFace: https://huggingface.co/ByteDance/Ouro-1.4B
- Paper (arXiv): https://huggingface.co/papers/2510.25741
- Página del proyecto: https://ouro-llm.github.io/
- Colección de modelos Ouro de ByteDance: https://huggingface.co/collections/ByteDance/ouro
- Fix de KV cache (repo de Antizana): https://github.com/Antizana/ouro-cache-fix
