# cgg507/Qwen3.8-Flash-Next-GM-CoT-LoRA

## Resumen

Qwen3.8-Flash-Next-GM-CoT-LoRA es un adaptador LoRA (PEFT) desarrollado por el usuario cgg507 sobre el modelo base Qwen/Qwen3.8-Flash-Next de Alibaba Qwen. El adaptador está especializado en conversaciones de rol de larga duración en formato de "Game Master" (narrador de partidas de rol de mesa o ficción interactiva), con un bloque de razonamiento (`<think>`) generado en cada turno del asistente, lo que el autor denomina GM-CoT (Game Master Chain-of-Thought).

El modelo base es una arquitectura MoE con atención híbrida (Gated DeltaNet en 36 capas y QSA full-attention en 12 capas), 48 capas MoE con 512 expertos enrutados por capa, torre de visión y una capa MTP (multi-token prediction) para decodificación especulativa. El adaptador entrena la atención, todos los expertos enrutados y los routers completos, con un checkpoint publicado en el paso 208 de 234 del entrenamiento (88,9 % de la época).

Es relevante por dos motivos: por un lado, demuestra una técnica de adaptación poco habitual (LoRA sobre todos los expertos enrutados más routers completos, con codificación exacta de las LoRA por experto en el layout 3-D de transformers); por otro, documenta de forma explícita y cuantificada un problema de repetición introducido por el propio adaptador, con tasas de fallo medidas frente al modelo base. Se trata de un adaptador experimental, orientado a ficción para adultos y partidas de rol, sin ajuste de seguridad adicional más allá del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE híbrido con atención Gated DeltaNet + QSA y torre de visión (modelo base Qwen3.8-Flash-Next) |
| Parametros totales | No disponible (el adaptador ocupa 17,4 GB en safetensors PEFT; el modelo base no declara recuento en la información disponible) |
| Parametros activos | No disponible (el modelo base es MoE con 512 expertos enrutados por capa y 48 capas MoE; no se declara el número de expertos activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en bf16; el autor menciona entrenamiento contra la variante FP8 del modelo base. No se detallan cuantizaciones GGUF/AWQ/GPTQ del adaptador |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors: PEFT (`adapter_model.safetensors`), nmoe-lora-v1 (`nmoe/adapter.safetensors`, `nmoe/adapter_experts.safetensors`) y parámetros completos de routers (`nmoe/full_params.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-Flash-Next, un modelo MoE con atención híbrida: 36 capas Gated DeltaNet (atención lineal con estado recurrente) y 12 capas QSA de atención completa, más 48 capas MoE con 512 expertos enrutados cada una. La adaptación cubre la atención (rank 64 / alpha 32, escalado 0,5, 156 adaptadores), todos los expertos enrutados (rank 32 / alpha 16, escalado 0,5, 73.728 adaptadores: 48 capas × 512 expertos × 3 proyecciones) y los routers completos (`mlp.gate.weight` de forma [512, 2560] × 48, en bf16, distribuidos como `modules_to_save` de PEFT). No se adaptan el experto compartido, `linear_attn.in_proj_a/in_proj_b/conv1d`, el indexador QSA, los pesos de residual con compuerta (hyper-connection), embeddings, `lm_head`, la torre de visión ni la capa MTP. Sin rsLoRA, sin DoRA, dropout 0, entrenamiento en bf16.

El entrenamiento se realizó sobre conversaciones largas de aventura textual / Game Master en formato libre, con un bloque de razonamiento en cada turno del asistente, usando el mismo conjunto de datos que cgg507/GLM-5.3-Flash-GM-CoT-LoRA. En el renderizado del historial, los turnos previos del asistente se presentan sin su razonamiento (bloque `<think>` vacío), de modo que solo el turno actual genera cadena de pensamiento. El checkpoint publicado corresponde al paso 208 de 234 (88,9 % de la época, multiplicador de learning rate 0,155 del schedule coseno al 10 %). La codificación de las LoRA por experto en el layout 3-D de transformers (`mlp.experts.gate_up_proj` [512, 1280, 2560] y `mlp.experts.down_proj` [512, 2560, 640]) usa `target_parameters` con `ParamWrapper` y una B bloque-diagonal que replica de forma exacta las LoRA individuales de gate y up, a costa de un ~33 % más de tamaño en el fichero de gate_up.

## Capacidades

- Generación de texto narrativo de formato largo en estilo Game Master: descripciones de escena, diálogo de personajes, progresión de tramas y consecuencias de las acciones del jugador.
- Razonamiento explícito por turno: cada respuesta del asistente incluye un bloque `<think>` con la cadena de pensamiento antes de la narración.
- Conversaciones multi-turno de sesión larga (el autor prueba con historiales de más de 6k tokens).
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), heredado de la torre de visión del modelo base, aunque el adaptador no modifica dicha torre.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente; el modo thinking está activado por defecto en la plantilla de chat del modelo base.
- Capacidades multilingües: limitadas al inglés según la model card.
- Estilo de ficción para adultos: el autor advierte que las salidas pueden incluir temas maduros, violencia y lenguaje soez cuando la escena lo requiere.

## Casos de uso

- Partidas de rol de mesa asistidas: el adaptador mantiene el rol de narrador a lo largo de sesiones largas, generando razonamiento interno sobre las reglas y la coherencia del mundo antes de narrar, lo que ayuda a evitar contradicciones en tramas prolongadas.
- Ficción interactiva y aventuras de texto: integrado en un motor de juego por turnos, produce descripciones de escena y respuestas a las acciones del jugador con un bloque de pensamiento que puede registrarse para depuración narrativa.
- Generación de contenido narrativo para adultos: el adaptador está entrenado explícitamente para ficción con temas maduros, sin el filtrado adicional que aplicarían variantes safety-tuned.
- Prototipado de sistemas de "director de juego" automático: útil para investigadores que estudien cómo el razonamiento explícito por turno afecta a la coherencia narrativa en sesiones de más de 6k tokens, aunque con la advertencia de que el 10 % de las peticiones en sesiones profundas entra en bucle de razonamiento.
- Evaluación de técnicas de adaptación MoE: el adaptador sirve como referencia práctica de LoRA sobre todos los expertos enrutados más routers completos, útil para quienes investiguen PEFT en arquitecturas MoE con atención híbrida.
- Experimentación con decodificación especulativa: al conservar la capa MTP del modelo base, permite probar decodificación especulativa sobre un adaptador de rol, siempre con límite de tokens de razonamiento.
- No recomendado para atención al cliente, código en producción ni tareas factuales: el adaptador está orientado a ficción y presenta problemas de repetición documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí documenta métricas de fallo por repetición en pruebas internas:

| Prueba | Adaptador | Modelo base |
|---|---|---|
| Bucle de razonamiento sin cierre en sesiones profundas (historial >6k tokens) | ~10 % de las peticiones (temperatura 0 y 0,5) | 0 de 18 |
| Aperturas limpias con prompts nuevos y variados en greedy | 32 de 32 | No disponible |
| Repetición de cláusula con entradas repetitivas ("I attack it again.", "continue") en greedy | Colapso hasta `max_tokens` | No disponible |
| Respuestas idénticas con entradas de espera ("I wait.") en greedy | Sí | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el fichero PEFT ocupa 17,4 GB en bf16 y debe sumarse a la VRAM del modelo base Qwen3.8-Flash-Next, que no se declara en la información disponible.
- GPU recomendadas: no disponible. El modelo base es MoE de gran tamaño con torre de visión; el adaptador se cargó en pruebas con `device_map="auto"` y bf16, lo que implica GPUs de datacenter (A100/H100) o múltiples consumer de gama alta, sin cifras concretas publicadas.
- ¿Cabe en consumer GPU? No disponible; el tamaño del adaptador (17,4 GB) ya supera la VRAM de muchas consumer GPU por sí solo, y hay que añadir el modelo base.
- Opciones de despliegue: PEFT con transformers >= 5.24 (soporte nativo de `qwen4_exp`) y peft >= 0.21 (`target_parameters`; probado con 0.22.0). Carga mediante `AutoModelForImageTextToText`; `AutoModelForCausalLM` usa rutas de módulo distintas y no coincide. También se distribuye en formato nmoe-lora-v1 para el entrenador del autor. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cgg507/Qwen3.8-Flash-Next-GM-CoT-LoRA | LoRA sobre MoE híbrido | Qwen3.8-Flash-Next | No disponible | qwen-community-1.0 | Hugging Face, 0 descargas |
| cgg507/GLM-5.3-Flash-GM-CoT-LoRA | LoRA GM-CoT | GLM-5.3-Flash | No disponible | No disponible | Hugging Face; mismo dataset GM-CoT |
| Qwen/Qwen3.8-Flash-Next (base) | MoE híbrido con visión | — | No disponible | qwen-community-1.0 | Hugging Face; sin el problema de repetición del adaptador |
| Qwen/Qwen3.8-Flash-Next-FP8 (base cuantizado) | MoE híbrido FP8 | — | No disponible | qwen-community-1.0 | Hugging Face; usado como referencia de entrenamiento |

## Limitaciones y advertencias

- Problema de repetición documentado por el autor: ~10 % de las peticiones en sesiones profundas (>6k tokens) entran en un bucle de razonamiento que nunca cierra el bloque `<think>`, tanto a temperatura 0 como a 0,5; el modelo base no mostró este fallo en 0 de 18 pruebas equivalentes.
- Bucles dentro de la respuesta en decodificación greedy con entradas repetitivas o de bajo esfuerzo ("I attack it again.", "continue"), que colapsan en una cláusula repetida hasta `max_tokens`.
- Copia entre turnos: con entradas de espera ("I wait.") repetidas, la decodificación greedy devuelve respuestas casi idénticas o idénticas.
- Mitigaciones obligatorias en producción: temperatura 0,7-1,0 (no greedy), penalización de repetición o sampler DRY si el backend lo soporta, y límite de tokens de razonamiento (por ejemplo 8-16k), tratando un turno truncado como fallo a reintentar.
- Solo inglés; no se declaran capacidades multilingües.
- Sin ajuste de seguridad adicional: el autor advierte de temas maduros, violencia y lenguaje soez; no apto para aplicaciones orientadas a menores o entornos sensibles.
- Licencia qwen-community-1.0: conviene revisar las condiciones de uso comercial en el enlace de licencia del modelo base antes de desplegar.
- Checkpoint incompleto: paso 208 de 234 (88,9 % de la época); el autor anuncia un seguimiento con unlikelihood a nivel de secuencia sobre los bucles del propio modelo.
- Requiere versiones concretas de librerías (transformers >= 5.24, peft >= 0.21) y la clase `AutoModelForImageTextToText`; una carga incorrecta no coincide con las rutas de módulo del adaptador.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un adaptador de ficción, la fidelidad factual no es un objetivo de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgg507/Qwen3.8-Flash-Next-GM-CoT-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante FP8 del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Adaptador hermano con el mismo dataset GM-CoT: https://huggingface.co/cgg507/GLM-5.3-Flash-GM-CoT-LoRA
