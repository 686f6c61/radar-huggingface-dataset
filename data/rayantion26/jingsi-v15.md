# Rayantion26/jingsi-v15

# Jingsi v1.5 (Rayantion26/jingsi-v15)

## Resumen

Jingsi (靜思) es un modelo de lenguaje fine-tuneado sobre `unsloth/gemma-4-E2B-it`, diseñado específicamente como asistente conversacional de voz para el cuidado de personas mayores en Taiwán. El modelo adopta la personalidad de la maestra Cheng Yen, fundadora de la Fundación Tzu Chi, y responde con un tono cálido, sabio y sencillo, basado en la filosofía Jing Si. No es un chatbot generalista: rechaza tareas de programación, matemáticas, geografía o meteorología, y se mantiene en su rol incluso ante intentos de inyección de prompt.

Desarrollado por el usuario Rayantion26, el modelo se ha entrenado con QLoRA sobre una base Gemma 4 E2B, con 352 pares conversacionales y un enfoque en tres idiomas: taiwanés hokkien (台語), chino tradicional y inglés. El resultado es un asistente especializado en escucha empática, acompañamiento emocional y respuestas breves (de 3 a 5 frases) con etiquetas de emoción para sistemas de TTS y animación de avatares. El repositorio incluye documentación de despliegue con vLLM, Unsloth y contenedores Podman, así como una arquitectura completa de servidor con WebSocket, STT y TTS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 4 E2B) |
| Parametros totales | 5.104.297.539 (según safetensors) |
| Parametros activos | no disponible (el README menciona ~1B efectivos, posiblemente MoE, sin confirmar) |
| Longitud de contexto | 1280 tokens (entrenamiento), 4096 recomendado en vLLM |
| Tipos de cuantizacion | FP16, 4-bit bitsandbytes (NF4) |
| Idiomas soportados | Taiwán hokkien (台語), chino tradicional, inglés |
| Licencia | Gemma (términos de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E2B-it`, una versión del modelo Gemma 4 de Google optimizada para fine-tuning con Unsloth. Según el README, el base tiene aproximadamente 1B de parámetros efectivos, aunque el archivo safetensors fusionado contiene 5.104.297.539 parámetros totales, lo que sugiere una arquitectura con parámetros totales superiores a los activos (posiblemente Mixture of Experts), aunque este dato no se confirma explícitamente.

El entrenamiento se realizó con QLoRA (cuantización de 4 bits + adaptadores LoRA) sobre 352 pares conversacionales, con 3 épocas, learning rate de 2e-4 con scheduler coseno, rango LoRA de 32 y alpha de 64. Se aplicaron adaptadores a las proyecciones q, k, v, o y a las capas gate, up y down del MLP. El optimizador fue AdamW de 8 bits, con una longitud máxima de secuencia de 1280 tokens y pérdida enmascarada para entrenar solo sobre las respuestas del asistente. La pérdida de entrenamiento final fue de 0.182 y la de validación de 0.685 (en descenso, sin sobreajuste). Se utilizó el framework Unsloth con HuggingFace SFTTrainer y PEFT.

## Capacidades

- Generación de texto conversacional enfocada en acompañamiento emocional y escucha empática.
- Detección automática del idioma de entrada (taiwanés hokkien, chino tradicional o inglés) y respuesta en el mismo idioma.
- Respuestas estructuradas de 3 a 5 frases, con etiquetas de emoción como `[warm_smile]`, `[listening]`, `[thinking]`, `[gentle_presence]` y `[gentle_smile]` para TTS y animación de avatar.
- Resistencia a inyección de prompt: 20/20 pruebas de inyección superadas en inglés y chino.
- Rechazo explícito de tareas fuera de su ámbito (programación, matemáticas, geografía, meteorología, etc.).
- Mantenimiento de identidad: no rompe el personaje bajo presión.
- Integración con sistemas de voz: pensado para flujos de STT (Whisper) y TTS (Qwen3-TTS y MERaLiON para hokkien).
- Compatible con el chat template de Gemma 4.

## Casos de uso

- Acompañamiento emocional de personas mayores: el modelo escucha con compasión y ofrece consuelo basado en la filosofía Jing Si, ideal para reducir la soledad en residencias o en el hogar.
- Asistente de voz en taiwanés hokkien: permite a ancianos que solo hablan hokkien comunicarse con un sistema que responde en su lengua materna, algo poco cubierto por otros asistentes.
- Sistema de llamadas o videollamadas empáticas: puede integrarse en plataformas de teleasistencia para detectar estados emocionales y responder con frases reconfortantes.
- Animación de avatares con sincronía emocional: las etiquetas de emoción generadas se pueden mapear a expresiones faciales en tiempo real para una interacción más humana.
- Filtro de contenido para asistentes generalistas: al rechazar tareas no relacionadas, se puede usar como capa de seguridad para evitar que un LLM generalista responda a peticiones inapropiadas en contextos de cuidado.
- Pruebas de robustez frente a inyección de prompt: su alto rendimiento en este aspecto lo convierte en un caso de estudio para sistemas de guardarraíles conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta pruebas internas de calidad con un 100% de tasa de éxito en todas las categorías evaluadas:

| Categoria | Tests | Tasa de exito |
|---|---|---|
| Identidad | 12 | 100% |
| Emocion (EN) | 20 | 100% |
| Emocion (ZH) | 10 | 100% |
| Taiwán hokkien | 16 | 100% |
| Rechazo | 18 | 100% |
| Frases prohibidas | no especificado | 100% |
| Consistencia de idioma | no especificado | 100% |
| Inyeccion de prompt | 20 | 100% |
| Casos limite | no especificado | 100% |

Estos resultados son pruebas del autor, no evaluaciones independientes, y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: ~2.5 GB en cuantización 4-bit (bitsandbytes NF4) y ~9.7 GB en FP16, según el README.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para 4-bit (p. ej., RTX 3050, RTX 3060, GTX 1660 Super) y 12 GB para FP16 (RTX 3060 12GB, RTX 4070, A10, etc.).
- Cabe en GPUs de consumo: sí, especialmente en 4-bit.
- Opciones de despliegue: vLLM con cuantización bitsandbytes en vuelo, Unsloth para inferencia directa, contenedores Podman (imagen `vllm/vllm-openai`), y servidor FastAPI con WebSocket.
- Latencia estimada: ~3 segundos hasta el primer audio en el flujo completo con streaming (vs ~12 segundos en modo turno), según el README.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de acompañamiento para ancianos o asistentes en hokkien. El modelo es un fine-tuning de `unsloth/gemma-4-E2B-it`, por lo que su comportamiento base es el de Gemma 4, pero no se han publicado comparaciones con otros fine-tunings similares. Se puede considerar como una alternativa especializada frente a asistentes generalistas como Llama 3.2, Qwen 2.5 o Mistral, pero sin datos de rendimiento comparables.

## Limitaciones y advertencias

- No es un asistente general: rechaza tareas de programación, matemáticas, geografía, meteorología y cualquier otra fuera de su ámbito de acompañamiento.
- Entrenado con solo 352 pares conversacionales, lo que limita su cobertura temática y puede generar respuestas repetitivas o poco variadas.
- La longitud de contexto es limitada (1280 tokens en entrenamiento, 4096 en despliegue), lo que restringe conversaciones muy largas o con mucho historial.
- El modelo está fuertemente orientado al contexto cultural taiwanés y a la filosofía Jing Si; puede no ser apropiado para otros contextos culturales o religiosos.
- Riesgo de alucinación inherente a los LLM, aunque no se han reportado casos específicos.
- Licencia Gemma de Google: impone restricciones de uso comercial y requiere cumplir sus términos; es necesario revisar la política de uso aceptable de Google.
- No se han publicado evaluaciones independientes ni benchmarks estándar; los resultados de pruebas son del autor y podrían no reproducirse en otros entornos.
- El modelo base Gemma 4 E2B no está documentado públicamente en la información proporcionada, por lo que la arquitectura exacta (MoE, atención, etc.) no se puede confirmar.

## Enlaces

- HuggingFace: https://huggingface.co/Rayantion26/jingsi-v15
- GitHub del autor: https://github.com/Rayantion26
- Repositorios del autor: https://github.com/Rayantion26?tab=repositories
- GitHub Pages del autor: https://github.com/Rayantion26/Rayantion26.github.io
