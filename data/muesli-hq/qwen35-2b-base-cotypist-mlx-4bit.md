# Muesli-HQ/qwen35-2b-base-cotypist-mlx-4bit

## Resumen

Este repositorio contiene una cuantización a 4 bits en formato MLX de **Qwen 3.5 2B Base**, el modelo base (preentrenado, sin ajuste por instrucciones) de 2.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud. La conversión ha sido realizada por Muesli-HQ y su propósito principal es servir como motor de autocompletado (typeahead) de **Cotypist**, la herramienta de autocompletado en el dispositivo de Muesli para macOS, que sugiere continuaciones de texto en cualquier aplicación del sistema.

No se trata de un modelo nuevo ni modificado: los pesos son una conversión directa de `Qwen/Qwen3.5-2B-Base` (revisión `b1485b2fa6dfa1287294f269f5fb618e03d52d7c`) mediante `mlx_lm convert`, sin fine-tuning ni instruction tuning. Su relevancia está en la eficiencia: con cuantización afín de 4 bits (group size 64, unos 4,5 bits por peso), el modelo ocupa apenas 1,1 GB y es adecuado para inferencia local en hardware Apple Silicon mediante MLX y MLX-Swift-LM.

Al ser un modelo base, está pensado para continuación de texto plano (no conversación), lo que encaja con el caso de uso de autocompletado: codificar el texto previo al cursor y decodificar de forma greedy, sin plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5); detalles no disponibles |
| Parametros totales | 1.881.825.088 (≈1,88 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit afín, group size 64 (≈4,5 bits por peso) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), `model.safetensors` de 1.059.404.951 bytes; repo total 1,1 GB |

## Arquitectura y entrenamiento

El modelo procede de **Qwen/Qwen3.5-2B-Base**, un transformer de la familia Qwen 3.5 entrenado por Alibaba Cloud. La ficha original del modelo base no está incluida en la información disponible, por lo que los detalles de arquitectura (número de capas, cabezas de atención, dimensión oculta), composición del corpus de preentrenamiento, número de tokens y uso de RLHF/DPO no están disponibles. Al tratarse de un modelo base, no ha recibido ajuste por instrucciones ni alineación.

La innovación de este repositorio está en la conversión: cuantización afín de 4 bits con group size 64 mediante `mlx_lm convert -q --q-bits 4 --q-group-size 64` (mlx-lm 0.32.2, mlx 0.32.4), que reduce el footprint a unos 4,5 bits por peso manteniendo la calidad razonable para tareas de continuación de texto. Los pesos incluyen solo texto (sin componentes de visión). La aplicación Cotypist añade por encima *token healing* para palabras a medio escribir y filtra sugerencias según la log-probabilidad de la primera palabra generada.

## Capacidades

- Continuación de texto plano (raw text continuation), sin plantilla de chat ni formato de instrucciones.
- Generación de texto autoregresiva con decodificación greedy, orientada a autocompletado tipo typeahead.
- Integración en aplicaciones macOS nativas vía MLX-Swift-LM 3.32.3 y tokenizadores Swift de Hugging Face 1.3.2 (con el alias `Qwen3_5Tokenizer` → `Qwen2Tokenizer` y `clean_up_tokenization_spaces=false`).
- Al ser un modelo base sin instruction tuning, no está optimizado para seguir instrucciones, tool calling, agentes ni razonamiento multi-paso: no disponible / no indicado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- **Autocompletado en el dispositivo en macOS (Cotypist)**: es el caso de uso principal; el modelo continúa el texto previo al cursor en cualquier aplicación (editor, correo, mensajería), con baja latencia gracias a la cuantización 4-bit y MLX en Apple Silicon.
- **Motores typeahead personalizados**: cualquier desarrollador puede reutilizar la conversión MLX para construir su propio autocompletado, aplicando técnicas como token healing y filtrado por log-probabilidad como hace Cotypist.
- **Prototipado de LLM en Apple Silicon**: base ligera (1,1 GB) para experimentar con mlx-lm en Python o MLX-Swift en apps nativas sin GPU dedicada.
- **Continuación de texto en scripts locales**: tareas de completar frases, generar sugerencias de escritura o expandir borradores breves donde no se necesita instruction tuning.
- **Base para fine-tuning posterior en MLX**: al conservar los pesos del modelo base sin modificar, puede servir como punto de partida para afinados específicos de dominio (por ejemplo, jerga técnica o estilo personal del usuario).
- **Comparativas de cuantización**: útil como referencia para evaluar el impacto de la cuantización afín 4-bit group size 64 frente al modelo original en precisión y velocidad en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,1 GB solo de pesos; con KV cache y overhead de runtime, conviene disponer de al menos 2-4 GB de memoria unificada libre.
- Diseñado para **Apple Silicon** (macOS) mediante MLX; no requiere GPU dedicada NVIDIA. Compatible con Macs con chips M1 o superiores con 8 GB de RAM o más.
- No cabe la comparación con GPUs de consumo NVIDIA en este caso: el formato MLX está orientado a hardware Apple; para inferencia en CUDA habría que usar los pesos originales de Qwen/Qwen3.5-2B-Base en otro formato (por ejemplo GGUF con llama.cpp).
- Despliegue:
  - `mlx-lm` (Python) para inferencia local en macOS.
  - MLX-Swift-LM 3.32.3 para integración en apps Swift nativas (como hace Cotypist).
  - Otras opciones (vLLM, TGI, Ollama) no aplicables directamente a este formato MLX; usarían el modelo base original.
- Latencia y throughput: no disponibles; el caso de uso de typeahead implica latencias bajas en tiempo real, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Caso de uso |
|---|---|---|---|---|---|
| Muesli-HQ/qwen35-2b-base-cotypist-mlx-4bit | 1,88 B | 4-bit afín (gs 64) | MLX safetensors | Apache 2.0 | Typeahead en macOS (Cotypist) |
| Qwen/Qwen3.5-2B-Base (original) | 2 B | sin cuantizar | safetensors | Apache 2.0 | Uso general, base para fine-tuning |
| Variantes GGUF 4-bit de modelos base 2B (p. ej. Qwen 2B en Q4_K_M) | 2 B | 4-bit (GGUF) | GGUF | Apache 2.0 (según modelo) | Inferencia local con llama.cpp/Ollama en CPU/GPU NVIDIA |

Nota: los datos de la fila de variantes GGUF son genéricos; no hay una conversión GGUF concreta publicada en la información disponible para este modelo.

## Limitaciones y advertencias

- **Modelo base, sin instruction tuning**: no sigue instrucciones ni mantiene conversaciones; usarlo como chatbot producirá resultados pobres. Está pensado para continuación de texto.
- **Riesgo de alucinación**: inherente a cualquier LLM; en autocompletado puede generar continuaciones plausibles pero incorrectas. Cotypist mitiga esto filtrando por log-probabilidad, pero el modelo en bruto no incluye dicha mitigación.
- **Sesgos**: hereda los sesgos del corpus de preentrenamiento de Qwen 3.5; no disponible información específica sobre auditorías de sesgo.
- **Idiomas**: no disponibles en la información proporcionada; el soporte real dependerá del modelo base Qwen 3.5.
- **Longitud de contexto**: no disponible; para typeahead el texto de entrada suele ser corto, pero conviene verificar el límite del modelo base antes de usos con documentos largos.
- **Compatibilidad de tokenizador**: en Swift es necesario aliasar `Qwen3_5Tokenizer` a `Qwen2Tokenizer` y fijar `clean_up_tokenization_spaces=false`; omitirlo puede causar errores de tokenización.
- **Licencia**: Apache 2.0, sin restricciones relevantes para uso comercial.
- **Ecosistema**: el formato MLX limita el despliegue a hardware Apple; para otros entornos hay que recurrir al modelo original.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/Muesli-HQ/qwen35-2b-base-cotypist-mlx-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Paper, blog oficial o repositorio de Cotypist: no disponibles en la información proporcionada
