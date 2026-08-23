# samueljohn/Llama-3.2-1B-OS-Agent-GGUF

## Resumen

El modelo `samueljohn/Llama-3.2-1B-OS-Agent-GGUF` es un ajuste fino (fine-tuning) del modelo Llama 3.2 1B Instruct de Meta, convertido a formato GGUF mediante la herramienta Unsloth. Está orientado a tareas de agente (OS-Agent) y se distribuye en un único archivo cuantizado Q4_K_M, lo que permite su ejecución en entornos con recursos limitados, como CPU o GPUs de gama baja. El repositorio incluye un Modelfile de Ollama para facilitar su despliegue local. Aunque la ficha oficial no aporta detalles sobre el proceso de entrenamiento ni sobre la licencia, el modelo base es conocido por su capacidad de razonamiento, generación de texto y soporte de herramientas, con una ventana de contexto de 128 000 tokens.

Este modelo es relevante porque ofrece una alternativa compacta para aplicaciones de agente en entornos donde no se dispone de GPUs de alta gama, manteniendo las capacidades básicas del modelo original de 1B parámetros. Su tamaño reducido (0,8 GB) y la cuantización Q4_K_M permiten inferencia en CPU con un rendimiento aceptable, lo que lo convierte en una opción práctica para prototipos, automatización y despliegues en producción de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (según especificación del modelo base Llama 3.2) |
| Tipos de cuantizacion | Q4_K_M (único archivo GGUF) |
| Idiomas soportados | Multilingüe (según Llama 3.2: inglés, alemán, francés, italiano, portugués, hindi, español, tailandés) |
| Licencia | No disponible (el autor no la especifica; el modelo base Llama 3.2 tiene la Licencia Comunitaria Llama 3.2) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Llama 3.2 1B Instruct, un transformer decoder-only con atención de múltiples cabezas y una arquitectura estándar. El proceso de fine-tuning se ha realizado con Unsloth, una librería que optimiza el entrenamiento de LLMs, logrando una velocidad de entrenamiento 2 veces mayor que los métodos convencionales. No se han publicado detalles sobre el dataset de entrenamiento, la cantidad de tokens, ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF ha ajustado el comportamiento del token BOS para garantizar la compatibilidad con llama.cpp y otros motores que soportan este formato. No se dispone de información sobre innovaciones técnicas adicionales en el modelo.

## Capacidades

- Generación de texto y razonamiento básico, heredado del modelo base Llama 3.2 1B Instruct.
- Soporte de tool calling y function calling, útil para agentes que deben interactuar con APIs o ejecutar acciones.
- Capacidades de agente para tareas de búsqueda, resumen y automatización de procesos.
- Multilingüe: soporta los idiomas incluidos en Llama 3.2 (inglés, español, francés, alemán, italiano, portugués y tailandés).
- Optimizado para inferencia en CPU y dispositivos de baja memoria gracias a la cuantización Q4_K_M.
- Compatible con llama.cpp, Ollama y otros motores que soporten GGUF.

## Casos de uso

- **Asistentes locales de productividad**: el modelo puede gestionar tareas de resumen de documentos, redacción de correos y extracción de información en un entorno offline, gracias a su tamaño reducido y su capacidad de instrucción.
- **Automatización de agentes de soporte técnico**: al soportar tool calling, se puede integrar en un flujo que consulte una base de conocimiento, ejecute comandos o realice búsquedas en sistemas internos, con un coste computacional mínimo.
- **Prototipado rápido de chatbots**: por su facilidad de despliegue con Ollama, es adecuado para pruebas de concepto en aplicaciones de conversación antes de pasar a modelos más grandes.
- **Procesamiento de datos en dispositivos edge**: su bajo consumo de memoria permite ejecutarlo en Raspberry Pi o dispositivos IoT para tareas de clasificación de texto, extracción de entidades o generación de respuestas.
- **Aplicaciones de agente de código**: puede ayudar a generar fragmentos de código, explicar funciones o autocompletar en entornos de desarrollo integrado (IDE) ligeros.
- **Traducción y transformación de textos**: dado su soporte multilingüe, es útil para tareas de traducción básica o adaptación de contenido en varios idiomas en entornos con restricciones de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Llama 3.2 1B Instruct tiene resultados conocidos en MMLU, HumanEval, GSM8K, pero no se dispone de datos específicos para este ajuste fino.

## Requisitos de hardware

- **VRAM estimada**: con cuantización Q4_K_M, el modelo ocupa aproximadamente 0,8 GB. Para inferencia en GPU, se recomienda al menos 2 GB de VRAM (por ejemplo, en una GTX 1050 Ti o superior). En CPU pura, puede ejecutarse con 4 GB de RAM.
- **GPU recomendadas**: cualquier GPU con 2 GB de VRAM o más (GTX 1060, RTX 2060, RTX 4090, A100, etc.). En entornos sin GPU, funciona con CPU moderna (Intel i5/i7 o AMD Ryzen 5).
- **Opciones de despliegue**: compatible con llama.cpp, Ollama, llama-cpp-python, y cualquier framework que soporte GGUF (por ejemplo, llamafile).
- **Latencia y throughput**: no se dispone de datos oficiales. En CPU de gama media, se estima una latencia de 20-50 tokens por segundo; en GPU de gama baja (RTX 3060), puede alcanzar 100-200 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct (Meta) | 1,24B | 128k | Llama 3.2 Community License | Varias (GGUF, safetensors) | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54B | 128k | Apache 2.0 | Varias (GGUF) | HuggingFace |
| Phi-3-mini (3.8B) | 3,8B | 4k | MIT | Varias (GGUF) | HuggingFace |
| samueljohn/Llama-3.2-1B-OS-Agent-GGUF | 1,23B | 128k | No disponible | Q4_K_M | HuggingFace |

Este modelo es un ajuste fino del Llama 3.2 1B, por lo que su rendimiento será similar al base, pero con modificaciones para tareas de agente. No se dispone de comparaciones directas con alternativas.

## Limitaciones y advertencias

- **Licencia**: el autor no indica la licencia en el repositorio. Aunque el modelo base usa la licencia Llama 3.2, es necesario verificar el uso comercial del finetune con el autor.
- **Sesgos y alucinaciones**: como modelo pequeño (1B), es propenso a generar información inexacta o inventada, especialmente en tareas de razonamiento complejo o conocimientos específicos.
- **Contexto**: aunque el modelo base soporta 128k tokens, la cuantización Q4_K_M puede degradar la calidad en contextos largos. Además, el ajuste del BOS token podría afectar la generación en algunos casos.
- **Idioma**: aunque soporta varios idiomas, su rendimiento en español puede ser menor que en inglés, dado que el modelo base fue entrenado principalmente en inglés.
- **Riesgo de producción**: para tareas críticas, se recomienda validar las respuestas con un modelo mayor o implementar mecanismos de verificación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/samueljohn/Llama-3.2-1B-OS-Agent-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Página de Ollama para Llama 3.2: https://ollama.com/library/llama3.2
- Página de Ollama para Llama 3.1 (referencia): https://ollama.com/library/llama3.1
- Modelo GGUF de Unsloth de Llama 3.2 1B Instruct: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-GGUF
