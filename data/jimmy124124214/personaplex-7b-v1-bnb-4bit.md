# Jimmy124124214/personaplex-7b-v1-bnb-4bit

## Resumen

PersonaPlex 7B v1 es un modelo de speech-to-speech conversacional en tiempo real desarrollado por NVIDIA, que permite mantener una interacción de voz natural con control de personaje mediante prompts de texto y condicionamiento de voz a partir de muestras de audio. Esta versión cuantizada, publicada por el usuario Jimmy124124214, aplica una cuantización 4-bit NF4 mediante bitsandbytes sobre el modelo base `nvidia/personaplex-7b-v1`, con el objetivo de reducir los requisitos de VRAM de aproximadamente 14 GiB (en bf16) a unos 9.6 GiB. De este modo, el modelo puede ejecutarse en GPUs de consumo de 12 GB, como la RTX 4070, sin necesidad de hardware de centro de datos.

La arquitectura se basa en un transformer full-duplex inspirado en Moshi, con un codec de audio neuronal (Mimi) y una capa adicional denominada Depformer. El modelo opera sobre audio continuo codificado, realizando simultáneamente comprensión y generación de habla en streaming. La cuantización 4-bit conserva los módulos críticos de audio y las capas de salida en bf16 para mantener la calidad. El repositorio incluye el paquete `moshi/` modificado con soporte para `--quantize-4bit`, carga de pesos pre-cuantizados y parches para GPU de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer full-duplex speech-to-speech basado en Moshi, con codec de audio Mimi y capa Depformer |
| Parametros totales | 7B (sin desglose público) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) sobre capas lineales del transformer principal; encoder/decoder de audio, embeddings y cabezas de salida permanecen en bf16 |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License (el código está bajo licencia MIT) |
| Formato de pesos | Checkpoint pre-cuantizado `.pt` (model_bnb_4bit.pt); el modelo original en bf16 está disponible en el repositorio base |

## Arquitectura y entrenamiento

PersonaPlex es un modelo de conversación de voz a voz full-duplex, lo que significa que puede escuchar y generar habla de forma simultánea, tal y como ocurre en una conversación humana. La entrada y la salida son audio continuo codificado mediante un codificador neuronal (Mimi), lo que evita la dependencia de un pipeline clásico de ASR+TTS. El control de personaje se realiza mediante prompts de texto que definen el rol (por ejemplo, “una asistente amable”) y mediante un audio de referencia que condiciona la voz. En la versión cuantizada, solo las capas lineales del transformer principal (proyecciones de atención y FFN de gating) se convierten a 4-bit NF4 con bitsandbytes. Los módulos de audio, las capas de embeddings y las cabezas de salida se mantienen en bf16 para preservar la calidad de la señal.

El proceso de entrenamiento del modelo base no se detalla en la información disponible; no se aportan datos sobre el número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO. Las innovaciones técnicas destacadas de esta versión cuantizada incluyen la refactorización de la atención `in_proj` como un módulo `nn.Module` para permitir la cuantización, y una ruta de gating actualizada para pasar por los módulos cuantizados. El modelo soporta `torch.compile` y CUDA graphs.

## Capacidades

- Conversación speech-to-speech en tiempo real con full-duplex (escucha y habla simultáneas).
- Control de personaje mediante prompts de texto, lo que permite definir roles y personalidades sobre la marcha.
- Condicionamiento de voz a partir de una muestra de audio, lo que permite adoptar distintos timbres y estilos de habla.
- Comprensión y generación de habla en streaming, sin necesidad de segmentación por turnos.
- Almacenamiento de una versión pre-cuantizada que evita la re-cuantización al cargar los pesos.
- Compatibilidad con `torch.compile` y CUDA graphs, segun la documentación del repositorio.
- Ejecución en GPUs de consumo con 12 GB de VRAM gracias a la cuantización 4-bit.

## Casos de uso

- Atención al cliente por voz: el modelo gestiona llamadas entrantes con una voz sintetizada natural, escuchando al cliente sin esperar pausas y respondiendo con el tono y la personalidad definidos en el prompt de rol. La baja VRAM permite desplegarlo en estaciones de trabajo con RTX 4070.
- Asistentes de voz en videojuegos y entornos virtuales: los NPC pueden mantener conversaciones fluidas con el jugador, respondiendo a estímulos de voz en tiempo real y adoptando la personalidad asignada mediante texto.
- Avatar conversacional para marketing: en stands virtuales o websites, un avatar con la voz de una marca puede interactuar con usuarios en tiempo real, modulando el tono según el prompt de rol.
- Telefonía automatizada: sustitución de menús de IVR por agentes de voz capaces de dialogar con el llamante, entender preguntas abiertas y responder sin cortes.
- Aplicaciones de coaching o terapia asistida: el modelo actúa como acompañante de voz con una empatía y estilo configurables por prompt, ideal para sesiones de práctica de conversación o apoyo emocional.
- Evaluación de sistemas de diálogo en laboratorio: el comando offline del repositorio permite procesar audios pre-grabados y obtener salida en audio y texto, lo que facilita la investigación y el testeo sin necesidad de un servidor en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~9.6 GiB para la versión 4-bit NF4; el modelo original en bf16 requiere ~14 GiB.
- GPU recomendada: RTX 4070 de 12 GB o superior para la versión cuantizada. Para el modelo original en bf16 se recomiendan GPUs de centro de datos, como A100 o H100.
- Compatibilidad con GPU de consumo: sí, siempre que la VRAM sea de al menos 12 GB. Modelos como RTX 4070, 4080 o 4090 son adecuados.
- Despliegue: mediante el paquete `moshi/` modificado, con el comando `python -m moshi.server --ssl --quantize-4bit`. También es posible usar `python -m moshi.offline` para evaluación offline con `--quantize-4bit`. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos en la información proporcionada. Cabe señalar que el modelo base comparte la arquitectura de la familia Moshi de Kyutai, pero no se han publicado especificaciones concretas de ese modelo en los resultados de búsqueda. Por tanto, la comparativa detallada se considera no disponible.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir una ligera degradación en la calidad del habla en comparación con los pesos en bf16, aunque se mantienen en bf16 los módulos de audio y las cabezas de salida para mitigarla.
- Los idiomas soportados no están documentados; es probable que el modelo tenga un rendimiento desigual en lenguas distintas del inglés, y podrían existir sesgos en el habla.
- La licencia es NVIDIA Open Model License, que exige aceptar los términos del repositorio base antes de su uso comercial. Conviene revisar las cláusulas específicas antes de integrar el modelo en un producto.
- El modelo requiere acceso al repo base para descargar los pesos con los que trabaja. El token de HuggingFace debe estar configurado y la licencia aceptada.
- No se han publicado evaluaciones formales (MMLU, HumanEval, etc.) en la información disponible, por lo que el rendimiento en tareas de razonamiento o conocimiento general es desconocido.
- Aunque la VRAM reducida permite su uso en GPUs de consumo, la latencia en estos dispositivos puede ser mayor que en A100/H100, especialmente en conversaciones en tiempo real.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/Jimmy124124214/personaplex-7b-v1-bnb-4bit
- Modelo base en HuggingFace: https://huggingface.co/nvidia/personaplex-7b-v1
- Paper técnico: https://arxiv.org/abs/2602.06053
- Licencia del modelo base: https://huggingface.co/nvidia/personaplex-7b-v1/blob/main/LICENSE
- Repositorio alternativo del paquete cuantizado (mencionado en la búsqueda): https://huggingface.co/brianmatzelle/personaplex-7b-v1-bnb-4bit
