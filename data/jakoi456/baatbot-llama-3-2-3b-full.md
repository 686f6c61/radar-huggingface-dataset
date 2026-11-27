# Jakoi456/baatbot-llama-3.2-3b-full

## Resumen

Baatbot-llama-3.2-3b-full es un ajuste fino (fine-tuning) del modelo Llama 3.2 3B Instruct de Meta, publicado por el usuario Jakoi456 en Hugging Face. Se trata de un modelo conversacional de 3.212.749.824 parámetros (aproximadamente 3,2 mil millones) derivado de la versión cuantizada en 4 bits de Unsloth (unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit), y entrenado con la librería Unsloth junto con TRL de Hugging Face, según indica el propio autor en la model card.

El modelo hereda la arquitectura transformer decoder-only de la familia Llama 3.2 y está orientado a generación de texto y conversación en inglés. Su relevancia práctica es limitada: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, sin documentación técnica sobre el dataset de entrenamiento, hiperparámetros o evaluación. La model card es prácticamente un esqueleto generado automáticamente por Unsloth.

A efectos de evaluación, debe considerarse un derivado comunitario de Llama 3.2 3B Instruct, con licencia Apache 2.0 declarada por el autor (aunque el modelo base de Meta tiene su propia licencia comunitaria, lo que genera una posible inconsistencia legal que se detalla en la sección de limitaciones).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), según el modelo base |
| Parámetros totales | 3.212.749.824 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128K tokens, pero el autor no lo confirma) |
| Tipos de cuantización | El modelo base es bnb-4bit; los pesos publicados están en safetensors (presumiblemente en precisión completa o bf16/fp16 tras el entrenamiento con Unsloth). No se detallan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (declarada por el autor) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Tamaño del repositorio | 6,4 GB |
| Pipeline | text-generation |
| Etiquetas | text-generation-inference, unsloth, llama, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit, que a su vez es una versión cuantizada en 4 bits (bitsandbytes) del Llama-3.2-3B-Instruct de Meta. La arquitectura subyacente es la de Llama 3.2: transformer decoder-only con atención por grupos (GQA), RoPE y normalización RMSNorm, aunque el autor no aporta detalles adicionales.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que según el autor permitió un entrenamiento "2x más rápido". No se especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF, DPO o SFT supervisado, ni la configuración de LoRA/QLoRA. La ausencia de esta información impide reproducir el ajuste o evaluar su calidad de forma rigurosa.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, heredadas del modelo base Llama 3.2 3B Instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 3B parámetros.
- Generación de código y matemáticas a nivel básico (capacidad típica de Llama 3.2 3B Instruct, no verificada específicamente en este ajuste).
- Soporte de tool calling / function calling: no confirmado por el autor; el modelo base Llama 3.2 3B Instruct lo soporta, pero este ajuste no lo documenta.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Modo thinking, visión o audio: no disponible (el modelo base 3B de texto no incluye visión; la variante 3B-Vision es un modelo distinto).

## Casos de uso

- Prototipado rápido de chatbots conversacionales en inglés: al ser un modelo de 3B parámetros con licencia Apache 2.0 declarada, permite experimentar con despliegues ligeros en local sin grandes requisitos de hardware.
- Fine-tuning posterior sobre dominios específicos: sirve como punto de partida para ajustes adicionales con LoRA/QLoRA en tareas de atención al cliente o asistentes verticales en inglés.
- Evaluación comparativa de técnicas de ajuste con Unsloth: útil como caso de estudio de pipelines de entrenamiento rápido con TRL y Unsloth.
- Generación de texto asistida en entornos con recursos limitados: su tamaño de 3B permite ejecución en GPUs de consumo con cuantización, aunque no se han publicado métricas de latencia.
- Educación e investigación sobre fine-tuning de Llama 3.2: permite reproducir el flujo de trabajo declarado (Unsloth + TRL) para estudiar el impacto del ajuste en modelos pequeños.
- Despliegue en endpoints compatibles con text-generation-inference: la etiqueta endpoints_compatible sugiere compatibilidad con infraestructura de Hugging Face, aunque no hay evidencias de uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se documenta la pérdida de entrenamiento ni curvas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5-7 GB en fp16/bf16 (3,2B parámetros × 2 bytes), y alrededor de 2-2,5 GB en cuantización de 4 bits (estimación basada en el tamaño de parámetros; no confirmada por el autor).
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB en fp16, y en GPUs con 8 GB o más con cuantización 4-bit.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB o superiores en fp16, y en GPUs de 8 GB con cuantización (estimación, no verificada).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repo), vLLM, llama.cpp u Ollama si se generan pesos GGUF (no publicados). Unsloth sugiere compatibilidad con su propio ecosistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jakoi456/baatbot-llama-3.2-3b-full | 3,2B | No disponible | Apache 2.0 (declarada) | Hugging Face, 0 descargas | Ajuste fino sin documentación ni benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128K (según Meta) | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo base oficial, con evaluación publicada |
| unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit | 3,2B | 128K (heredado) | Apache 2.0 (según Unsloth) | Hugging Face | Checkpoint cuantizado 4-bit del que deriva este modelo |
| Qwen2.5-3B-Instruct | 3,1B | 32K (según Qwen) | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con benchmarks publicados |

La comparación se basa en datos públicos de los modelos de referencia; para este ajuste concreto no hay métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, hiperparámetros y evaluación: no es posible verificar la calidad ni la reproducibilidad del ajuste.
- Riesgo elevado de alucinación y degradación del comportamiento respecto al modelo base, dado que no se han publicado evaluaciones.
- Idiomas: solo inglés declarado; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Posible inconsistencia de licencia: el autor declara Apache 2.0, pero el modelo base Llama 3.2 de Meta se distribuye bajo la Llama 3.2 Community License, que impone restricciones adicionales (por ejemplo, en el nombre del modelo y en el uso por parte de grandes plataformas). Conviene revisar la licencia del modelo base antes de un uso comercial.
- Sesgos: heredados del modelo base Llama 3.2, no evaluados en este ajuste.
- Sin evidencias de uso en producción: cero descargas y cero likes en el momento de la consulta.
- Contexto: no confirmado por el autor; aunque el modelo base soporta 128K tokens, el ajuste podría no preservar esa capacidad.
- No se han publicado pesos GGUF ni cuantizaciones alternativas, lo que limita el despliegue en llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakoi456/baatbot-llama-3.2-3b-full
- Modelo base (Unsloth, 4-bit): https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo oficial Llama 3.2 3B Instruct (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
