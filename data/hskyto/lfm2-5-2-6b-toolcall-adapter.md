# Hskyto/lfm2.5-2.6b-toolcall-adapter

## Resumen

El modelo `Hskyto/lfm2.5-2.6b-toolcall-adapter` es un adaptador LoRA (PEFT) desarrollado por Hskyto, que se aplica sobre el modelo base `LiquidAI/LFM2.5-2.6B` de Liquid AI. Su propósito es especializar el modelo base en tareas de tool calling y function calling mediante un ajuste fino supervisado (SFT) con la librería TRL. El modelo base es un modelo denso de 2.6 mil millones de parámetros, con una arquitectura híbrida de convolución y atención, diseñado específicamente para cargas de trabajo agénticas, con una ventana de contexto de 128K tokens y soporte nativo para llamada de herramientas.

Este adaptador es relevante porque permite adaptar un modelo ya optimizado para agentes a un caso de uso concreto de tool calling, manteniendo el tamaño reducido del modelo base (inferencia en menos de 2.5 GB) y su alta velocidad (220 tokens por segundo según Liquid AI). El repositorio contiene únicamente los pesos del adaptador (0.3 GB), por lo que es necesario cargar el modelo base por separado. Aunque el adaptador está disponible públicamente, la licencia no está especificada, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LFM2.5-2.6B (híbrido convolución + atención, denso) |
| Parametros totales | 2.6B (modelo base) + adaptador LoRA (tamaño no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantización (p. ej., MLX Q8) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el modelo base tiene licencia propia, pero el adaptador no la declara) |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `LiquidAI/LFM2.5-2.6B`, un modelo denso de 2.6B parámetros con una arquitectura híbrida que combina capas convolucionales y de atención, optimizado para ejecución en dispositivos (on-device). El modelo base fue entrenado para tareas agénticas, incluyendo planificación, llamada de herramientas y razonamiento multi-paso, con una ventana de contexto de 128K tokens.

El adaptador fue entrenado mediante ajuste fino supervisado (SFT) utilizando la librería TRL, con PEFT 0.20.0 y Transformers 5.16.1. Según el repositorio GitHub asociado, el entrenamiento se realizó con QLoRA (cuantización de 4 bits + LoRA) para especializar el modelo en function calling. No se especifican los datos de entrenamiento ni el número de tokens utilizados. El entrenamiento se registró en Weights & Biases, aunque el enlace no proporciona detalles adicionales.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base.
- Tool calling y function calling: el adaptador está específicamente entrenado para invocar herramientas externas de forma estructurada.
- Soporte para agentes y tareas multi-paso: el modelo base está diseñado para planificar y ejecutar secuencias de acciones.
- Razonamiento y comprensión de contexto largo gracias a la ventana de 128K tokens.
- Capacidades multilingües: no especificadas, pero el modelo base probablemente soporta varios idiomas (no confirmado).
- No incluye capacidades de visión ni audio; es un modelo de texto puro.

## Casos de uso

- Asistentes virtuales en dispositivos móviles: el modelo base puede ejecutarse en menos de 2.5 GB, lo que permite integrarlo en aplicaciones iOS o Android para gestionar conversaciones con llamadas a APIs (por ejemplo, consultar el tiempo, enviar mensajes) sin depender de la nube.
- Automatización de tareas de oficina: un agente que utiliza tool calling para interactuar con calendarios, correos electrónicos o bases de datos, ejecutando acciones como crear eventos o buscar información.
- Chatbots de atención al cliente: el modelo puede manejar consultas multi-turno y, cuando es necesario, invocar sistemas externos (CRM, pasarelas de pago) para resolver incidencias.
- Desarrollo de agentes de razonamiento multi-paso: gracias a su contexto de 128K, puede procesar documentos largos y ejecutar secuencias de acciones con memoria intermedia.
- Generación de código asistida por herramientas: el adaptador puede llamar a intérpretes o linters para validar el código generado, integrándose en entornos de desarrollo.
- Prototipado rápido de aplicaciones agénticas: al ser un adaptador ligero, permite experimentar con tool calling sobre un modelo base eficiente sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el adaptador `lfm2.5-2.6b-toolcall-adapter` en la información disponible. El modelo base `LFM2.5-2.6B` reporta un rendimiento de 220 tokens por segundo en inferencia on-device, pero no se proporcionan métricas de calidad (MMLU, HumanEval, GSM8K, etc.) en las fuentes consultadas. Por tanto, no es posible comparar cuantitativamente este adaptador con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.3 GB, pero requiere cargar el modelo base completo (2.6B parámetros). Con cuantización de 4 bits, el modelo base cabe en aproximadamente 2.5 GB de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) para inferencia con cuantización. Para mayor velocidad, se recomienda una RTX 3060 o superior.
- En Apple Silicon, el modelo base está disponible en formato MLX (16-bit) y puede ejecutarse de forma nativa, como se indica en el repositorio `Hskyto/lfm2.5-2.6b-toolcall-mlx-q8`.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con PEFT, y MLX para Apple.
- Latencia y throughput: el modelo base alcanza 220 tok/s en dispositivos optimizados, pero el adaptador puede añadir una ligera sobrecarga. No se dispone de mediciones específicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B + adaptador toolcall | 2.6B | 128K | Sí (adaptador) | No disponible | Hugging Face |
| Qwen2.5-1.5B | 1.5B | 32K | Sí (nativo) | Apache 2.0 | Hugging Face |
| Llama-3.2-1B | 1.2B | 128K | No nativo | Llama 3.2 Community | Hugging Face |
| Phi-3.5-mini | 3.8B | 128K | No nativo | MIT | Hugging Face |

La comparativa es cualitativa, ya que no se dispone de benchmarks del adaptador. El modelo base de Liquid AI destaca por su eficiencia en dispositivos y su contexto largo, mientras que alternativas como Qwen2.5-1.5B ofrecen tool calling nativo con licencia permisiva.

## Limitaciones y advertencias

- La licencia del adaptador no está especificada, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor o verificar la licencia del modelo base.
- El adaptador es un fine-tuning sobre un modelo base; puede heredar sesgos y limitaciones del modelo original, como alucinaciones o respuestas inexactas en dominios especializados.
- No se han publicado datos sobre el dataset de entrenamiento del adaptador, por lo que su robustez en escenarios reales de tool calling no está validada externamente.
- El modelo base está optimizado para inglés; el soporte multilingüe no está confirmado, lo que puede limitar su uso en español u otros idiomas.
- Al ser un adaptador PEFT, es necesario gestionar la carga del modelo base y el adaptador por separado, lo que añade complejidad al despliegue.
- El rendimiento en tareas de razonamiento complejo puede ser inferior al de modelos más grandes, dado el tamaño reducido de 2.6B parámetros.

## Enlaces

- [Hugging Face - Hskyto/lfm2.5-2.6b-toolcall-adapter](https://huggingface.co/Hskyto/lfm2.5-2.6b-toolcall-adapter)
- [Hugging Face - LiquidAI/LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B)
- [Blog de Liquid AI - LFM2.5-2.6B](https://www.liquid.ai/blog/lfm2-5-2-6b)
- [Documentación de LFM2.5-2.6B](https://docs.liquid.ai/lfm/models/lfm25-2.6b)
- [GitHub - Hemeskyo/lfm2-toolcalling-qlora](https://github.com/Hemeskyo/lfm2-toolcalling-qlora)
- [Hugging Face - Hskyto/lfm2.5-2.6b-toolcall-mlx-q8](https://huggingface.co/Hskyto/lfm2.5-2.6b-toolcall-mlx-q8)
