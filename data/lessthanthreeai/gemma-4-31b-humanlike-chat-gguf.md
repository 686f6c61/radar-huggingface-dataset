# LessThanThreeAI/Gemma-4-31B-Humanlike-Chat-GGUF

## Resumen

Gemma-4-31B-Humanlike-Chat es un ajuste fino de `google/gemma-4-31B-it` publicado por LessThanThreeAI, orientado a hacer que un modelo de 31B parámetros "escriba como una persona" en conversaciones informales sin renunciar a las capacidades de trabajo del modelo original (correos formales, explicaciones técnicas, tool calling). El problema que resuelve es el tono: los modelos de instrucciones estándar tienden a responder con párrafos largos y estructurados incluso en chats casuales, lo que resulta antinatural en roleplay, personajes y mensajería.

El modelo se distribuye en formato GGUF (cuantizado con imatrix) y también en safetensors para vLLM/SGLang, bajo licencia Apache-2.0. No está abliterado: parte directamente del Gemma 4 31B oficial de Google. Según la model card, en una evaluación a ciegas su respuesta se confundió con la de una persona real en el 26% de los casos, frente al 0% del Gemma 4 31B base, manteniendo el conocimiento del original (MMLU-Pro 82,5) e incluso mejorando el comportamiento con herramientas (When2Call 66 frente a 46).

Es relevante ahora porque cubre un nicho concreto —chat humanizado con soporte de function calling y modo thinking conmutable— sin system prompt obligatorio, lo que lo hace especialmente atractivo para SillyTavern, frontales de roleplay y agentes conversacionales que necesitan naturalidad y fiabilidad a la vez.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), decodificador de texto |
| Parametros totales | 30.697.345.596 (≈ 30,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el ejemplo de llama.cpp usa 32.768 tokens) |
| Tipos de cuantizacion | GGUF con imatrix (IQ4_XS entre las disponibles; repo completo de 180,7 GB) |
| Idiomas soportados | Inglés y ruso (según tags); el entrenamiento humanizado se documentó en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino cuantizado sobre `google/gemma-4-31B-it`, un transformer denso de unos 30,7 B parámetros. La model card menciona la técnica de **on-policy distillation** como parte del proceso: el modelo se entona para producir respuestas humanizadas manteniendo el conocimiento y las capacidades del modelo oficial de Google. A diferencia de la versión anterior basada en Qwen (Qwen3.8-27B-Humanlike-Chat 2.0), este modelo no parte de un base abliterado.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información disponible. Lo que sí documenta el autor es el objetivo del entrenamiento: respuestas cortas y naturales en registro informal sin system prompt, con cambio automático de registro cuando se pide una tarea formal, y conservación del comportamiento de tool calling. El chat template propio (usable con `--jinja` en llama.cpp) habilita las llamadas a herramientas y el interruptor de thinking.

## Capacidades

- Generación de texto conversacional con estilo humanizado: respuestas cortas, registro informal, sin necesidad de system prompt.
- Roleplay y interpretación de personajes: mantiene la coherencia del personaje en chats largos (la model card muestra ejemplos en turnos 12-16 de una conversación).
- Escritura creativa y cambio de registro: produce correos formales, explicaciones técnicas o código cuando se le pide, y vuelve al tono casual después.
- Tool calling / function calling: soporte nativo mediante el chat template de Gemma; mejora al base en When2Call (66 vs 46) y en no invocar herramientas irrelevantes (BFCL irrelevance 90 vs 81).
- Modo thinking conmutable: el interruptor de razonamiento del Gemma base sigue funcionando (se evalúa GSM8K con thinking activado).
- Razonamiento y matemáticas preservados: MMLU-Pro 82,5 y GSM8K al nivel del modelo base según la model card.
- Multilingüe: tags de inglés y ruso; el resto de idiomas no está documentado.

## Casos de uso

- **Roleplay y personajes en SillyTavern**: el modelo mantiene personajes coherentes durante chats largos sin escribir acotaciones de teatro ni divagar, que es el fallo típico de los modelos de instrucciones estándar en este escenario.
- **Compañeros de conversación y chatbots informales**: responde como una persona real en mensajería casual, sin system prompt, ideal para aplicaciones de compañía o soporte emocional ligero.
- **Asistentes con herramientas en chats naturales**: puede alternar entre conversación casual y llamadas a funciones (clima, reservas, consultas) sabiendo cuándo no llamar a ninguna herramienta, gracias a su puntuación en BFCL irrelevance.
- **Redacción de comunicaciones formales bajo demanda**: pide un correo formal y lo produce con la calidad del Gemma base, manteniendo después el tono informal en el mismo hilo.
- **Agentes conversacionales de un solo modelo**: combina naturalidad, tool calling y thinking en un único modelo de 31B desplegable en local, útil para frontales tipo Open WebUI o APIs compatibles con OpenAI.
- **Prototipado de productos de chat con "voz de producto"**: el autor ofrece encargos de finetunes personalizados, y este modelo sirve como prueba de que la técnica (on-policy distillation humanizada) es viable sobre un base Apache-2.0.
- **Despliegue local en GPU de consumo de gama alta**: con cuantización IQ4_XS cabe en GPUs de 24 GB, lo que lo hace viable para uso personal sin coste de API.

## Benchmarks y rendimiento

Datos publicados por el autor (misma ejecución, mismos prompts, decodificación greedy, thinking desactivado salvo GSM8K thinking on):

| Benchmark | Gemma-4-31B-Humanlike-Chat | Google Gemma 4 31B (base) | Qwen3.8-27B-Humanlike-Chat 2.0 |
|---|---|---|---|
| When2Call | 66 | 46 | 58 |
| BFCL irrelevance | 90 | 81 | no disponible |
| BFCL simple | 96 | 95 | no disponible |
| BFCL multiple | no disponible | no disponible | no disponible |
| MMLU-Pro | 82,5 | 82,5 | no disponible |
| IFEval | 90,0 | no disponible | 83,4 |
| LiveCodeBench | 66 | no disponible | 51 |
| GSM8K | no disponible | no disponible | no disponible |
| GSM8K (thinking on) | no disponible | no disponible | no disponible |
| IFBench | no disponible | no disponible | no disponible |
| ishuman v2 (juez ciego) | 26 % | 0 % | no disponible |

Nota: la model card incluye gráficos con más benchmarks (BFCL multiple, IFBench, GSM8K, GSM8K thinking on), pero no se extraen valores numéricos concretos de la información proporcionada, por lo que no se incluyen para no inventar datos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización IQ4_XS (≈4,25 bits efectivos), unos 17-18 GB solo de pesos; con contexto de 32k, aproximadamente 20-24 GB en total. Las cuantizaciones mayores del repo (180,7 GB en total) requieren configuraciones multi-GPU o descarga parcial en CPU.
- **GPU recomendadas**: RTX 3090 o RTX 4090 (24 GB) para la variante IQ4_XS con contexto moderado; A100 40 GB o H100 para las cuantizaciones altas o despliegue con vLLM/SGLang en safetensors (FP16/BF16 requeriría ~62 GB de VRAM, por lo que en vLLM se recomienda A100 80 GB o tensor parallelism).
- **Cabe en GPU de consumo**: sí, en tarjetas de 24 GB (RTX 3090/4090) con la cuantización IQ4_XS y `--n-gpu-layers 99` en llama.cpp; no cabe completa en tarjetas de 16 GB.
- **Opciones de despliegue**: llama.cpp / llama-server (recomendado, con `--jinja` para tool calling y thinking), Ollama (al ser GGUF), vLLM y SGLang (con los safetensors). El servidor de llama.cpp expone API compatible con OpenAI.
- **Parámetros de muestreo recomendados por el autor**: temperature 1,0, top-p 0,95, top-k 64.
- **Latencia y throughput**: no disponible en la información proporcionada.
- **Alternativa sin descarga**: existe un endpoint gratuito en HuggingFace Spaces que ejecuta el modelo.

## Comparativa con modelos similares

| Característica | Gemma-4-31B-Humanlike-Chat | Google Gemma 4 31B (base) | Qwen3.8-27B-Humanlike-Chat 2.0 |
|---|---|---|---|
| Parametros | ≈ 30,7 B | ≈ 31 B | 27 B |
| Arquitectura | Transformer denso | Transformer denso | no disponible |
| Licencia | Apache-2.0 | Licencia Gemma (restricciones propias de Google) | no disponible |
| When2Call | 66 | 46 | 58 |
| MMLU-Pro | 82,5 | 82,5 | no disponible |
| IFEval | 90,0 | no disponible | 83,4 |
| LiveCodeBench | 66 | no disponible | 51 |
| Abliterado | No | No | Sí (base abliterado) |
| Formatos | GGUF, safetensors | GGUF, safetensors | GGUF |
| Estilo humanizado | Sí (26 % en juez ciego) | No (0 %) | Sí |

Ventajas frente al base: estilo conversacional natural, mejor decisión de tool calling y licencia Apache-2.0 (más permisiva que la licencia Gemma original). Frente a su hermano Qwen: base más potente (LiveCodeBench 66 vs 51, IFEval 90,0 vs 83,4) y sin abliteración.

## Limitaciones y advertencias

- **Idiomas**: los tags oficiales son inglés y ruso. El entrenamiento humanizado está documentado en inglés; el comportamiento en castellano no está verificado y puede degradar el estilo humanizado o el registro.
- **Riesgo de alucinación**: al conservar el conocimiento del base (MMLU-Pro 82,5) el riesgo debería ser similar al de Gemma 4 31B, pero no se han publicado evaluaciones específicas de alucinación para este finetune.
- **Sesgos**: hereda los sesgos del modelo base de Google; el ajuste humanizado sobre datos de chat real puede introducir o amplificar patrones de lenguaje coloquial, no documentados por el autor.
- **Benchmarks del propio autor**: las cifras provienen de la model card y de evaluaciones del autor, no de auditorías independientes; conviene validarlas en el caso de uso concreto.
- **Contexto**: la longitud máxima de contexto no está documentada en la model card; el ejemplo de llama.cpp usa 32.768 tokens, pero no se garantiza que sea el límite del modelo.
- **Tool calling dependiente del template**: requiere `--jinja` (o el chat template correcto) para que funcionen las llamadas a herramientas y el interruptor de thinking; con templates incorrectos estas capacidades se pierden.
- **Licencia**: Apache-2.0, apta para uso comercial; no obstante, al derivar de Gemma, conviene revisar los términos de uso de Google aplicables al modelo base según la jurisprudencia de licencias derivadas.
- **Procedencia**: es un finetune comunitario sin respaldo de Google; para entornos de producción críticos puede preferirse el modelo oficial con soporte garantizado.

## Enlaces

- Modelo GGUF: https://huggingface.co/LessThanThreeAI/Gemma-4-31B-Humanlike-Chat-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Demo gratuita (Space): https://huggingface.co/spaces/LessThanThreeAI/Humanlike-Chat
- Modelo hermano (Qwen): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF
- Discord del autor: https://discord.gg/jWbqEqsgAf
- Perfil de Discord del autor (encargos): https://discord.com/users/320486798859960322
