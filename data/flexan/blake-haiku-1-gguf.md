# Flexan/Blake-Haiku-1-GGUF

## Resumen

Blake Haiku 1 es un modelo de lenguaje instructivo de 0,6B parámetros desarrollado por Flexan, un estudiante de desarrollo de software que trabaja con LLMs en su tiempo libre. Se trata de un fine-tuning LoRA sobre el modelo base Qwen/Qwen3-0.6B, entrenado con el objetivo de producir conversaciones informales que imitan el estilo de chateo humano en plataformas como Discord. El modelo fue creado principalmente como una prueba de un nuevo entorno de entrenamiento en Windows 11 con CUDA, no como un producto destinado a producción.

Este repositorio contiene los archivos GGUF del modelo, con cuantizaciones que van desde Q2_K hasta f16, lo que permite ejecutar el modelo en hardware muy variado. El modelo usa el formato de chat ChatML y un prompt de sistema recomendado que simula un usuario conversando en Discord. Su interés principal es académico y experimental: demuestra que es posible realizar fine-tuning LoRA de modelos de 0,6B en hardware modesto, aunque el autor advierte que los datos de entrenamiento fueron mínimos y que no habrá una segunda versión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-0.6B, fine-tuning LoRA) |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-0.6B, no especificada por el autor) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning LoRA sobre Qwen/Qwen3-0.6B, un transformer decoder-only de 0,6B parámetros. El autor no especifica la arquitectura interna con detalle, pero al ser un LoRA sobre Qwen3, hereda la estructura del modelo base. No se han publicado datos sobre la longitud de contexto efectiva tras el fine-tuning ni sobre el número de tokens de entrenamiento.

El entrenamiento se realizó con un dataset privado de 72 chats y 315 completions, una versión reducida del dataset utilizado para el modelo Blake Sonnet. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. El modelo se entrenó exclusivamente con datos conversacionales de estilo informal, sin datos de razonamiento ni de tool calling. El autor indica que las etiquetas `thinking` y `response` del formato de salida están siempre vacías, ya que el modelo no fue entrenado con datos de razonamiento.

## Capacidades

- Generación de texto conversacional en estilo informal, imitando mensajes cortos de plataformas de chat (Discord).
- Soporte de ChatML para estructura de mensajes (system, user, assistant).
- Salida estructurada en multiples mensajes separados por saltos de línea, simulando una conversación real con respuestas fragmentadas.
- No soporta tool calling ni function calling.
- No soporta razonamiento ni multi-step reasoning (las etiquetas de thinking están vacías).
- No soporta modos de pensamiento (thinking mode).
- Capacidades multilingües: no disponible; el modelo solo está etiquetado para inglés.
- No soporta vision, audio ni otras modalidades.

## Casos de uso

- Prototipado de chatbots de estilo casual: el modelo puede generar conversaciones informales con el formato de múltiples mensajes por respuesta, útil para demostrar el estilo de interacción de plataformas de chat.
- Experimentación con fine-tuning LoRA: sirve como ejemplo de cómo entrenar un modelo conversacional pequeño sobre un base de 0,6B con hardware modesto, y como punto de partida para quienes quieran replicar el flujo de entrenamiento.
- Demostraciones educativas de GGUF: permite ilustrar el proceso de conversión de un modelo base a GGUF y la comparación entre diferentes cuantizaciones en un mismo modelo.
- Pruebas de inferencia en hardware de bajos recursos: con 0,6B de parámetros y cuantizaciones bajas (Q2_K, Q3_K), puede ejecutarse en CPUs sin GPU dedicada o en tarjetas con poca VRAM.
- Simulación de conversaciones para testing de interfaces: puede usarse para generar respuestas de ejemplo en el desarrollo de frontends de chat, aunque con calidad limitada.
- Investigación de comportamiento de modelos pequeños: útil para estudiar cómo un modelo de 0,6B maneja estilos de conversación fragmentada y qué limitaciones presenta frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,6B de parámetros, el modelo puede ejecutarse en menos de 1 GB de VRAM en cuantizaciones bajas (Q2_K, Q3_K). En Q4_K_M, la VRAM estimada ronda los 0,7-0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas consumer como GTX 1060, RTX 2060 o superiores ejecutan el modelo sin problema. También puede ejecutarse en CPU con llama.cpp.
- Sí cabe en GPUs consumer: es perfectamente viable en cualquier GPU moderna, incluso en hardware integrado con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, TGI (si se convierte a formato compatible), vLLM (con conversión previa a safetensors).
- Latencia y throughput: no se han publicado datos; con un modelo de este tamaño, la latencia en GPU moderna es del orden de milisegundos por token, y en CPU de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso conversacional |
|---|---|---|---|---|
| Blake Haiku 1 (este modelo) | 0,6B | no disponible | cc-by-sa-4.0 | Sí, estilo Discord |
| Qwen3-0.6B (modelo base) | 0,6B | 32K (según documentación de Qwen) | Apache 2.0 | Generalista, con razonamiento |
| TinyLlama 1.1B | 1,1B | 2K | Apache 2.0 | Generalista |

La comparativa es limitada porque Blake Haiku 1 es un experimento de fine-tuning, no un modelo de propósito general. Frente a su base Qwen3-0.6B, pierde capacidad de razonamiento y tool calling, y su licencia cambia de Apache 2.0 a cc-by-sa-4.0. Frente a TinyLlama, el modelo de Flexan es más pequeño y está especializado en conversación informal, pero carece de la versatilidad y los benchmarks publicados del primero.

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo no está destinado a producción: "This model is merely archived for above reason and is not meant to be deployed in production".
- Los datos de entrenamiento son mínimos (72 chats, 315 completions), lo que limita la cobertura temática y la calidad de las respuestas.
- No soporta razonamiento ni tool calling; las etiquetas `thinking` están siempre vacías.
- El modelo solo está en inglés; no hay soporte multilingüe.
- Riesgo alto de alucinación y de respuestas incoherentes en dominios fuera del estilo conversacional entrenado.
- La licencia cc-by-sa-4.0 es una licencia de contenido compartido, no una licencia de software típica; su uso comercial requiere verificar las condiciones de atribución y share-alike.
- El nombre del sistema ("Moke") no es dinámico; el modelo no soporta cambios de identidad del usuario.
- No hay garantías de estabilidad ni soporte: el autor indica que no habrá una versión 2.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Flexan/Blake-Haiku-1-GGUF
- Modelo base: https://huggingface.co/Flexan/Blake-Haiku-1
- Modelo base original (Qwen3-0.6B): https://huggingface.co/Qwen/Qwen3-0.6B
- Perfil del autor: https://huggingface.co/Flexan
