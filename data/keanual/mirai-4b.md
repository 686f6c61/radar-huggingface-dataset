# Keanual/MiRAI-4B

## Resumen

MiRAI-4B (v0.1) es un modelo de lenguaje conversacional multilingüe desarrollado por K-AI, una startup indonesia de IA, a partir de un fine-tuning de Qwen3-4B de Alibaba. Su objetivo es servir de asistente conversacional en tres idiomas: inglés, bahasa Indonesia y japonés, un nicho poco cubierto por los modelos abiertos de tamaño reducido centrados en Indonesia y Japón simultáneamente.

El entrenamiento se realizó mediante QLoRA (4 bits) con la biblioteca Unsloth sobre una GPU T4 gratuita de Google Colab, con unos 1.500 ejemplos por idioma procedentes de las variantes Alpaca-GPT4 en cada lengua, más datos de identidad escritos a mano. El resultado es un modelo ligero de unos 4.022 millones de parámetros, distribuido en safetensors a 16 bits (8,1 GB), con licencia Apache 2.0.

Se trata de una versión temprana (v0.1) con un alcance claramente experimental: útil para pruebas de asistentes multilingües ligeros, chatbots sencillos o como punto de partida para fine-tunings adicionales, pero sin entrenamiento específico para tool calling ni para tareas de alta precisión factual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3-4B) |
| Parámetros totales | 4.022.468.096 (~4.022 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B; el autor no la especifica) |
| Tipos de cuantización | Pesos publicados en 16 bits; entrenado con QLoRA 4 bits (LoRA r=16, posteriormente fusionado) |
| Idiomas soportados | Inglés, bahasa Indonesia, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiRAI-4B es un fine-tune completo en formato fusionado de Qwen3-4B, un transformer decoder denso de la familia Qwen3 de Alibaba. No se trata de un modelo MoE: los 4.022 millones de parámetros están todos activos en cada pasada de inferencia. El modelo conserva la plantilla de chat de Qwen3, incluido el parámetro `enable_thinking` que permite activar o desactivar el modo de razonamiento extendido heredado del modelo base.

El entrenamiento se llevó a cabo con QLoRA (cuantización del modelo base a 4 bits y entrenamiento de adaptadores LoRA con rango r=16) usando la biblioteca Unsloth, en una GPU T4 gratuita de Google Colab. Se ejecutaron 400 pasos con batch size 2, acumulación de gradientes 4 y learning rate 2e-4, tras lo cual los adaptadores se fusionaron en los pesos a 16 bits. El corpus de entrenamiento comprende aproximadamente 1.500 ejemplos por idioma: `yahma/alpaca-cleaned` para inglés, `FreedomIntelligence/alpaca-gpt4-indonesian` para indonesio y `FreedomIntelligence/alpaca-gpt4-japanese` para japonés, junto con ejemplos de identidad escritos a mano para que el modelo se presente como MiRAI en los tres idiomas. No se menciona entrenamiento con RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés, bahasa Indonesia y japonés, con estilo de asistente (formato de chat multi-turno mediante chat template de Qwen3).
- Presentación de identidad coherente como "MiRAI" en los tres idiomas, gracias a datos de identidad dedicados.
- Seguimiento de instrucciones tipo Alpaca (instrucción + entrada + salida) en los tres idiomas.
- Compatibilidad con el modo de razonamiento de Qwen3 mediante `enable_thinking` en el chat template (heredado del modelo base, no entrenado específicamente).
- Ejecución con la biblioteca `transformers` de Hugging Face mediante `AutoModelForCausalLM` y `device_map="auto"`.
- No entrenado para tool calling ni function calling, según indica explícitamente el autor.
- Sin capacidades de visión, audio ni otros modalities: es un modelo de texto puro.

## Casos de uso

- Chatbot multilingüe ligero para Indonesia y Japón: el modelo puede mantener conversaciones en bahasa Indonesia y japonés en un paquete de solo 4B de parámetros, adecuado para desplegarse en hardware modesto o incluso local.
- Prototipado de asistentes conversacionales: al ser un fine-tune de Qwen3-4B con plantilla de chat estándar, se integra directamente en pipelines de `transformers` para pruebas rápidas de producto.
- Base para fine-tuning adicional: su licencia Apache 2.0 y su pequeño tamaño lo hacen idóneo como punto de partida para QLoRA posteriores en dominios concretos (educación, soporte, contenido).
- Generación de contenido breve en tres idiomas: redacción de respuestas, mensajes y textos cortos en inglés, indonesio y japonés a partir de instrucciones tipo Alpaca.
- Educación y aprendizaje de idiomas: puede emplearse como compañero de práctica conversacional básica en los tres idiomas soportados.
- Experimentación educativa en hardware limitado: el propio autor lo entrenó en una T4 gratuita de Colab, lo que demuestra que el ciclo completo de fine-tuning e inferencia es accesible sin infraestructura profesional.
- Demostraciones y pruebas de identidad de marca: los datos de identidad permiten personalizar la presentación del asistente, útil para demos de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona evaluaciones en MMLU, HumanEval, GSM8K ni ningún otro conjunto de pruebas, ni comparativas con el modelo base Qwen3-4B.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos publicados a 16 bits (8,1 GB), se recomiendan unos 10-12 GB de VRAM; con cuantización a 4 bits (por ejemplo, GGUF Q4 o bitsandbytes), el consumo baja a unos 3-4 GB.
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4090 para inferencia en FP16; cualquier GPU con 4 GB de VRAM es suficiente con cuantización a 4 bits. El entrenamiento original se realizó en una T4 de 16 GB.
- Consumer GPUs: sí, cabe con holgura en GPUs domésticas modernas tanto en FP16 (12 GB o más) como cuantizado (4-8 GB).
- Opciones de despliegue: `transformers` (método documentado por el autor), y por compatibilidad con la arquitectura Qwen3, también debería funcionar con vLLM, llama.cpp, Ollama, TGI y LM Studio, aunque el autor no publica pesos GGUF oficiales.
- Latencia y throughput: no disponible; al ser un modelo denso de 4B, cabe esperar respuestas fluidas en tiempo real en una GPU de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiRAI-4B (K-AI) | 4.022 M | No disponible | Apache 2.0 | Fine-tune multilingüe (EN/ID/JA) de Qwen3-4B, enfoque conversacional |
| Qwen/Qwen3-4B (base) | ~4.000 M | No disponible en la información proporcionada | Apache 2.0 | Modelo base, con modo thinking y mayor cobertura de idiomas |
| Qwen2.5-3B-Instruct | ~3.000 M | No disponible en la información proporcionada | Qwen Research / comercial para algunos usos | Alternativa ligera de la misma familia, sin enfoque específico en indonesio/japonés |

La principal diferencia de MiRAI-4B frente a su modelo base es el ajuste fino dirigido a bahasa Indonesia y japonés con datos Alpaca-GPT4, a costa de un corpus de entrenamiento muy reducido (~4.500 ejemplos en total).

## Limitaciones y advertencias

- Versión temprana (v0.1): el propio autor advierte que puede cometer errores y afirmar hechos incorrectos con seguridad (riesgo de alucinación elevado, típico de modelos pequeños).
- Corpus de entrenamiento reducido (~1.500 ejemplos por idioma) y parcialmente generado por máquina: las respuestas pueden sonar genéricas y la calidad varía según el idioma.
- No entrenado para tool calling, function calling ni agentes multi-paso.
- No apto para decisiones médicas, legales ni financieras, según indica explícitamente la model card.
- No se han publicado benchmarks independientes, por lo que su rendimiento real frente a Qwen3-4B base no está cuantificado.
- Sesgos: al derivar de datos Alpaca-GPT4 (generados con GPT-4), puede heredar sesgos y estilos de ese corpus; no se documentan auditorías de sesgo.
- Licencia: los pesos son Apache 2.0 (uso comercial permitido), pero el autor recomienda revisar las licencias de los datasets de entrenamiento antes de uso comercial.
- La longitud de contexto no está documentada en la model card; debe verificarse contra la configuración de Qwen3-4B antes de despliegues con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Keanual/MiRAI-4B
- Modelo base (Qwen3-4B): https://huggingface.co/Qwen/Qwen3-4B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Dataset inglés (yahma/alpaca-cleaned): https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset indonesio (FreedomIntelligence/alpaca-gpt4-indonesian): https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-indonesian
- Dataset japonés (FreedomIntelligence/alpaca-gpt4-japanese): https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-japanese
- Web de K-AI: https://kai-official.netlify.app/
