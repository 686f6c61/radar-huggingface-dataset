# netprojects/Arete-27B-MTP-MLX-3bit

## Resumen

Arete-27B-MTP-MLX-3bit es una cuantización de 3 bits en formato MLX del modelo NousResearch/Arete-27B, publicada por el usuario netprojects para su ejecución en Apple Silicon. Arete-27B es un ajuste fino supervisado completo de Qwen3.8-27B realizado por Nous Research, orientado a respuestas factuales y directas sobre temas políticamente sensibles en siete áreas, preservando a la vez capacidades generales y agenticas. El modelo base conserva la torre de visión de Qwen3.8-27B, aunque el entrenamiento de Nous Research fue solo de texto y con el codificador visual congelado.

Esta build concreta aplica cuantización afina de 3 bits (grupo 64) al modelo de lenguaje, con excepciones en 4 bits para el embedding de tokens, la capa de salida y las capas v_proj/down_proj más sensibles (las ocho primeras y ocho últimas capas y cada tercera capa intermedia), resultando en unas 3,91 bits por peso. La torre de visión permanece en bfloat16. El repositorio ocupa 13,8 GB y suma 28.489.216.752 parámetros totales según los safetensors.

La relevancia de esta build radica en que hace viable un modelo de ~27B multimodal en Macs con 24 GB o más de memoria unificada, incorporando además una cabeza MTP (multi-token prediction) para decodificación especulativa. Esa cabeza procede del modelo base Qwen3.8-27B, no de Arete-27B, y se ha cuantizado a 8 bits para acelerar la generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con torre de visión; cuantización MLX afina |
| Parámetros totales | 28.489.216.752 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 3 bits afina grupo 64 con capas selectivas en 4 bits (~3,91 bits por peso); torre de visión en bfloat16; cabeza MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `model-mtp.safetensors` para la cabeza MTP |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer multimodal con torre de visión, sobre el que Nous Research aplicó un ajuste fino supervisado completo (SFT) orientado a respuestas factuales y directas en temas políticamente sensibles de siete áreas, manteniendo habilidades generales y agenticas. Los datos de entrenamiento fueron exclusivamente de texto y el codificador visual se congeló durante el proceso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

Esta build de netprojects introduce dos elementos técnicos destacables. En primer lugar, una cuantización mixta: el modelo de lenguaje se cuantiza a 3 bits afina con grupo 64, pero el embedding de tokens, la capa de salida y las capas v_proj/down_proj más sensibles (las ocho primeras y ocho últimas capas, más cada tercera capa intermedia) se mantienen en 4 bits, alcanzando ~3,91 bits por peso. En segundo lugar, se incluye una cabeza MTP (multi-token prediction) tomada sin cambios de Qwen/Qwen3.8-27B y cuantizada a 8 bits, que actúa como modelo borrador integrado para decodificación especulativa. Como Arete-27B define `mtp_num_hidden_layers` a 0, esta build lo fija a 1 en `config.json` para que los cargadores detecten la cabeza. La cabeza MTP fue entrenada contra el modelo base, no contra Arete-27B, por lo que es una cabeza de modelo base aplicada sobre un ajuste fino.

## Capacidades

- Generación de texto y razonamiento general, con respuestas factuales y directas en temas políticamente sensibles (siete áreas según Nous Research).
- Capacidades agenticas y de codificación preservadas del ajuste: la model card reporta 3/3 en pruebas de coding y 2/2 en thinking para esta build.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` de OpenAI.
- Modo thinking opcional: Nous Research evaluó con thinking desactivado; mlx-vlm lo deja apagado salvo que se pase `--enable-thinking`.
- Procesamiento de imágenes (pipeline image-text-to-text) mediante la torre de visión en bfloat16; la model card reporta "pass" en la prueba de visión para esta build.
- Decodificación especulativa con la cabeza MTP integrada (se usa pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia en terminal y automatización de shell: la model card reporta 70 en Terminal-Bench-2.1 para los pesos originales, y esta build pasa las pruebas de tool calling y coding, por lo que encaja en agentes que ejecutan comandos y encadenan pasos en macOS.
- Análisis de capturas de terminal o pantallas: con mlx-vlm se le puede pasar una imagen y preguntar por el error mostrado, útil para depuración asistida en local.
- Respuestas sobre temas sensibles con menor sesgo propagandístico: según Nous Research, solo el 0,9 % de 803 respuestas contenían propaganda frente al 22 % del modelo base, lo que lo hace adecuado para asistentes informativos que requieran neutralidad.
- Desarrollo de código en local: soporta tool calling y pruebas de coding 3/3, integrable en flujos de edición y revisión de código sobre Apple Silicon.
- Prototipado de agentes multimodales en Mac: al caber en 24 GB de memoria unificada, permite iterar con visión, tool calling y thinking en un portátil sin GPU dedicada.
- Evaluación de cuantizaciones agresivas: con 90,1 % de coincidencia en el siguiente token respecto a bf16 y KL de 0,0986, sirve para estudiar la degradación de modelos de 27B a ~3,91 bits por peso.
- Generación de texto acelerada con MTP: la cabeza MTP permite decodificación especulativa con verificación por el modelo completo, útil en tareas de generación larga donde el throughput importa.

## Benchmarks y rendimiento

Cifras de Nous Research para los pesos originales (no mediciones de esta build):

| Medida | Arete-27B | Qwen3.8-27B |
|---|---:|---:|
| Fact score (media) | 2,98 | 2,32 |
| Respuestas con propaganda (803 prompts, thinking off) | 0,9 % | 22 % |
| Hermes Bench | 65,60 | 65,77 |
| Terminal-Bench-2.1 | 70 | 67 |

Métricas de fidelidad de esta build frente a bf16 (medidas por el autor):

| Métrica | Valor |
|---|---|
| Bits por peso | 3,91 |
| Mismo siguiente token que bf16 | 90,1 % |
| KL frente a bf16 | 0,0986 |
| GSM8K (50 preguntas, thinking off, greedy) | 49/50 |
| Memoria pico con prompt de 8K tokens | 14,6 GB |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |

Rendimiento de decodificación con MTP (misma máquina, mismo conjunto de prompts, greedy): 4-bit 20,5 tok/s sin MTP y 39,8 tok/s con MTP (1,95x, aceptación 75 %); 8-bit 13,1 tok/s sin MTP y 28,6 tok/s con MTP (2,18x, aceptación 77 %). Las builds de 6, 3, 2,5 bits y bf16 no se cronometraron por separado.

## Requisitos de hardware

- Memoria pico medida con prompt de 8K tokens: 14,6 GB (texto, mlx-lm).
- Mac recomendado por el autor: 24 GB o más de memoria unificada (el límite por defecto de GPU en macOS es aproximadamente dos tercios de la RAM hasta 36 GB y tres cuartos por encima); contextos más largos requieren más memoria.
- No cabe en GPUs consumer con 8-12 GB de VRAM; está pensado para Apple Silicon con memoria unificada.
- Despliegue: mlx-lm >= 0.32.2 para texto y mlx-vlm >= 0.7.11 para imágenes; el servidor de mlx-lm devuelve tool calls en formato OpenAI.
- Decodificación especulativa: pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp`.
- Throughput: no disponible para esta build de 3 bits; las cifras de 20,5-39,8 tok/s corresponden a las builds de 4 y 8 bits.
- Entorno de medición: MacBook Pro M5 Max de 128 GB, mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11 (19 de noviembre de 2026).

## Comparativa con modelos similares

| Modelo | Tamaño | Bits por peso | Mismo siguiente token vs bf16 | KL vs bf16 | GSM8K | Memoria pico 8K | Tool/coding/thinking/vision |
|---|---:|---:|---:|---:|---:|---:|---|
| Arete-27B-MTP-MLX-8bit | 29,9 GB | 8,63 | 99,1 % | 0,0005 | no disponible | no disponible | pass / 3/3 / 2/2 / pass |
| Arete-27B-MTP-MLX-6bit | 23,1 GB | 6,66 | 98,7 % | 0,0018 | 46/50 | no disponible | pass / 3/3 / 2/2 / pass |
| Arete-27B-MTP-MLX-4bit | 16,3 GB | 4,70 | 95,5 % | 0,0232 | 47/50 | no disponible | pass / 3/3 / 2/2 / pass |
| Arete-27B-MTP-MLX-3bit (este) | 13,8 GB | 3,91 | 90,1 % | 0,0986 | 49/50 | 14,6 GB | pass / 3/3 / 2/2 / pass |
| Arete-27B-MTP-MLX-2.5bit | 11,8 GB | 3,65 | 84,6 % | 0,2417 | 46/50 | 13,8 GB | pass / 2/3 / 2/2 / text-only |
| Arete-27B-MTP-MLX-bf16 | 55,6 GB | 16 | referencia | – | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización a 3 bits degrada la fidelidad: solo el 90,1 % de los siguientes tokens coinciden con bf16 y el KL es de 0,0986, muy superior al de las builds de 4, 6 y 8 bits; puede afectar a tareas sensibles a matices.
- La cabeza MTP procede de Qwen3.8-27B y fue entrenada contra el modelo base, no contra Arete-27B; es una cabeza de modelo base sobre un ajuste fino, lo que puede reducir la tasa de aceptación en dominios específicos de Arete.
- La decodificación especulativa con MTP puede divergir ligeramente del decodificado plano en respuestas largas por redondeos en la verificación por lotes; las ganancias de velocidad dependen del prompt.
- La build de 2,5 bits es solo texto y falla 1 de 3 pruebas de coding, según la model card; esta build de 3 bits sí pasa las pruebas, pero conviene validar en el caso de uso concreto.
- Los datos de entrenamiento fueron solo de texto y el codificador visual se congeló: el rendimiento en visión no se ha ajustado específicamente para Arete.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos del modelo.
- Licencia Apache 2.0, que permite uso comercial; conviene revisar el archivo LICENSE del repositorio para confirmar términos.
- El modelo está pensado para Apple Silicon y MLX; no es directamente desplegable en vLLM, TGI o llama.cpp sin conversión adicional.
- La model card original está truncada en la información disponible, por lo que pueden faltar detalles de verificación.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-3bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo Qwen3.8-27B (origen de la cabeza MTP): https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-4bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-bf16
