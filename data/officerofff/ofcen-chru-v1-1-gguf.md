# Officerofff/Ofcen-CHRU-v1.1.gguf

## Resumen

Ofcen-CHRU v1.1 (GGUF) es la versión cuantizada en formato GGUF de Ofcen-CHRU v1.1, un asistente conversacional compacto de 0.6B parámetros especializado en ruso, desarrollado por el equipo Ofcen (usuario Officerofff en Hugging Face). El modelo base es un fine-tuning sobre Qwen3-0.6B, orientado exclusivamente a chat en ruso, y esta variante GGUF está pensada para ejecutarse localmente en LM Studio, llama.cpp, Ollama y otras herramientas compatibles con ese formato.

Su relevancia radica en el tamaño: con solo 0.6B parámetros y un archivo Q8_0 de 633 MB, puede ejecutarse en hardware muy modesto, incluso en portátiles sin GPU dedicada, cubriendo el nicho de asistentes locales en ruso con recursos mínimos. El equipo publica además resultados en su propio benchmark, Ofcen-Bench-RU, donde supera a Qwen3-0.6B (54.5 % frente al modelo base, evaluado con Gemini 4 Argon como juez).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3-0.6B) |
| Parametros totales | 0.6B |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (publicado); otros niveles no disponibles |
| Idiomas soportados | Ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con convert_hf_to_gguf.py de llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

Ofcen-CHRU v1.1 es un fine-tuning de Qwen3-0.6B, un transformer decoder de 0.6B parámetros. La conversión a GGUF se realizó con el script oficial `convert_hf_to_gguf.py` de llama.cpp, por lo que la arquitectura subyacente es la de Qwen3 en su variante densa de 0.6B. La model card de la versión GGUF remite a la ficha del modelo base para detalles de entrenamiento, y no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como SFT, RLHF o DPO.

Como innovación operativa destacable, la plantilla de chat incluye el system prompt integrado, de modo que no es necesario configurarlo manualmente en LM Studio. El modo de razonamiento (Think) heredado de la familia Qwen3 no está soportado en v1.1 y viene desactivado por defecto.

## Capacidades

- Generación de texto conversacional en ruso, con respuestas descritas por el autor como concisas, claras y amables.
- Chat multi-turno mediante plantilla de chat con system prompt preconfigurado.
- Compatibilidad con el ecosistema GGUF: LM Studio, llama.cpp, Ollama y otros runtimes.
- No soporta el modo de razonamiento (Think) en la versión v1.1; debe mantenerse desactivado.
- No se documentan capacidades de visión, audio, tool calling, function calling ni agentes en la información disponible.
- No se documentan capacidades multilingües más allá del ruso.

## Casos de uso

- **Asistente local en ruso en equipos modestos**: con 633 MB en Q8_0, funciona en portátiles sin GPU dedicada, útil para usuarios que quieren un chatbot offline sin depender de la nube.
- **Prototipado de chatbots en ruso**: la plantilla de chat con system prompt integrado permite integrarlo rápidamente en LM Studio o llama.cpp para probar diálogos multi-turno.
- **Despliegue en dispositivos edge o embebidos**: el tamaño reducido lo hace candidato para Raspberry Pi o mini-PCs donde un modelo de 7B+ no es viable.
- **Integración vía Ollama en aplicaciones locales**: puede servirse como backend de chat para aplicaciones que consulten un endpoint local en ruso.
- **Comparación y evaluación de modelos pequeños en ruso**: al publicarse resultados en Ofcen-Bench-RU frente a Qwen3-0.6B, sirve como referencia para estudios de destilación de idioma en modelos sub-1B.
- **Generación de texto simple en ruso**: redacción breve de respuestas, resúmenes ligeros o reformulaciones donde la calidad de un modelo grande no es imprescindible y la latencia local importa.

## Benchmarks y rendimiento

| Benchmark | Ofcen-CHRU v1.1 | Qwen3-0.6B (base) |
|---|---|---|
| Ofcen-Bench-RU (juez: Gemini 4 Argon) | 54.5 % | inferior (puntuación exacta no disponible) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Ofcen-Bench-RU es un benchmark propio del equipo Ofcen, por lo que la comparabilidad con otros modelos es limitada.

## Requisitos de hardware

- **VRAM / memoria estimada**: el archivo Q8_0 ocupa 633 MB; con overhead de contexto, basta con aproximadamente 1 GB de RAM o VRAM. No requiere GPU.
- **GPU recomendadas**: no necesarias; si se usa GPU, cualquier GPU moderna con 2 GB+ de VRAM acelera la inferencia (por ejemplo, una RTX 3060 o superior es más que suficiente).
- **Consumer GPUs**: cabe sobradamente en cualquier GPU de consumo; también funciona solo con CPU gracias a llama.cpp.
- **Despliegue**: LM Studio, llama.cpp (`llama-cli`), Ollama y cualquier runtime compatible con GGUF. Comandos de ejemplo documentados por el autor en la model card.
- **Ajustes recomendados por el autor**: temperature 0.7, top_p 0.9, repeat penalty 1.1. Latencia y throughput exactos: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Ofcen-CHRU v1.1 (GGUF) | 0.6B | GGUF (Q8_0) | Ruso | Apache 2.0 | Fine-tuning chat en ruso; 54.5 % en Ofcen-Bench-RU |
| Qwen3-0.6B | 0.6B | safetensors, GGUF (comunitario) | Multilingüe (incl. ruso) | Apache 2.0 | Modelo base; soporta modo Think; multilingüe real |
| Qwen2.5-0.5B-Instruct | 0.5B | safetensors, GGUF (comunitario) | Multilingüe | Qwen Research (restricciones comerciales) | Generación anterior, sin modo Think |

Ofcen-CHRU v1.1 se diferencia de Qwen3-0.6B en su especialización en ruso y en la plantilla de chat preconfigurada, a costa de perder el modo Think y probablemente parte de la cobertura multilingüe.

## Limitaciones y advertencias

- Especializado en ruso: el rendimiento en otros idiomas no está documentado y probablemente sea inferior al de Qwen3-0.6B original.
- El modo de razonamiento (Think) no está soportado en v1.1; el autor recomienda explícitamente no activarlo.
- Con solo 0.6B parámetros, el riesgo de alucinaciones y errores factuales es elevado, especialmente en conocimiento especializado o actual.
- Longitud de contexto no documentada en la información disponible; conviene verificarla antes de usos con documentos largos.
- Ofcen-Bench-RU es un benchmark propio con juez basado en un LLM (Gemini 4 Argon); los resultados no son directamente comparables con benchmarks estándar.
- Licencia Apache 2.0, sin restricciones comerciales relevantes; el modelo hereda la licencia de Qwen3-0.6B.
- Proyecto con tracción muy limitada (0 descargas registradas en el momento de la ficha), sin comunidad amplia de verificación; probarlo en un entorno controlado antes de producción es recomendable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Officerofff/Ofcen-CHRU-v1.1.gguf
- Modelo base: https://huggingface.co/Officerofff/Ofcen-CHRU-v1.1
- Perfil del autor: https://huggingface.co/Officerofff
