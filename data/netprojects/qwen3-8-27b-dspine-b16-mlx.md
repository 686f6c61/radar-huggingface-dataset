# netprojects/Qwen3.8-27B-DSpine-b16-MLX

## Resumen

Qwen3.8-27B-DSpine-b16-MLX es un drafter especulativo (modelo borrador) publicado por netprojects para su uso con el modelo Qwen3.8-27B de Tencent sobre Apple Silicon mediante MLX. El modelo es una conversión directa del checkpoint bf16 original de Tencent (revisión `ea909c0`), empaquetado en safetensors con el layout que MLX carga de forma nativa, sin cambios en los pesos. Su función es proponer bloques de tokens que el modelo objetivo de 27B verifica en una sola pasada, acelerando la decodificación sin alterar la salida greedy del modelo grande.

Técnicamente es un modelo pequeño de 5 capas y 2.025.912.064 parámetros reales (etiquetado como 2.0B en la model card), diseñado como drafter paralelo dentro del esquema DSpine. El modelo objetivo Qwen3.8-27B es híbrido, con 48 capas GatedDeltaNet (atención lineal) y 16 capas de atención completa; el drafter incorpora una ventana deslizante de 8192 tokens y el motor soporta rollback exacto del estado de atención lineal, condición necesaria para que la verificación especulativa sea correcta en arquitecturas híbridas.

La relevancia actual del modelo es práctica: permite ejecutar Qwen3.8-27B con aceleraciones medidas de ×2,0 a ×6,0 en decodificación sobre un MacBook Pro M5 Max, manteniendo la salida del modelo objetivo y un pico de memoria prácticamente idéntico (32,4 GB frente a 32,9 GB). Está publicado bajo licencia Apache 2.0 y se integra tanto con el paquete de netprojects (`dspine-hybrid-mlx`) como con el paquete oficial de Tencent (`dspine_mlx`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer drafter paralelo DSpine, 5 capas, ventana deslizante de 8192 tokens |
| Parametros totales | 2.025.912.064 (2.0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 8192 tokens en el drafter; el contexto efectivo lo fija el modelo objetivo Qwen3.8-27B |
| Tipos de cuantizacion | pesos publicados en bf16; el motor admite drafter de 4 bits (por defecto), 8 bits y 16 bits (bf16) mediante `--draft-bits` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX); tamano del repo 4,1 GB |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa paralela: un modelo pequeño de 5 capas que propone un bloque de tokens en una sola pasada, y el modelo objetivo Qwen3.8-27B verifica el bloque completo de una vez. La salida final es la del modelo objetivo en modo greedy, hasta el redondeo bf16 en empates casi exactos. El modelo objetivo es híbrido (48 capas GatedDeltaNet de atención lineal y 16 de atención completa), lo que exige rollback exacto del estado de atención lineal durante la verificación; ese soporte está integrado en `dspine_mlx` de Tencent (PRs #3 y #21), junto con la caché de prompt entre turnos y la copia de borradores.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO; la model card indica únicamente que los pesos son el checkpoint bf16 de Tencent sin modificar. La innovación destacable es el propio esquema DSpine combinado con optimizaciones de motor: kernels Metal precompilados para Python 3.11 a 3.15 en macOS 15 o superior, tamaño de bloque de verificación configurable (`--block-size`), elección de precisión del drafter (`--draft-bits`), modo `--copy` para reutilizar texto del contexto en ediciones de código y decodificación de hasta 8 peticiones simultáneas.

## Capacidades

- Generación de texto como drafter especulativo: acelera la decodificación del modelo objetivo sin cambiar su salida greedy.
- Aceleración en tres regímenes medidos: código, prosa y prompts largos, con factores de ×6,0, ×2,0 y ×2,02 respectivamente en el benchmark del motor v0.4.
- Soporte de tool calling y salida de razonamiento a través del servidor compatible con OpenAI (`dspine-hybrid-serve`).
- Streaming de tokens y caché de prompt entre peticiones, incluida la del system prompt de una conversación nueva.
- Decodificación concurrente de hasta 8 peticiones.
- Modo `--copy` para tareas de edición de código en las que la respuesta repite texto del contexto.
- Ajuste adaptativo (`--adaptive`) para decodificación con el modo de razonamiento desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de código locales en Mac: el servidor `dspine-hybrid-serve` expone `http://127.0.0.1:8791/v1` para conectar editores o agentes de programación; con prompts de código alcanza 186,4 tok/s frente a 31,2 tok/s de mlx-lm, lo que hace viable la autocompletación interactiva sobre un M5 Max.
- Edición de ficheros con reescritura: con `--copy`, devolver un fichero de 140 líneas con un solo renombrado pasa de 98 a 161 tok/s en una única petición, adecuado para refactorizaciones asistidas.
- Resumen de documentos largos: con prompts de 32K tokens el primer token baja de 45,7 s a 28,7 s y la decodificación con prompt de 33K tokens pasa de 28,3 a 57,3 tok/s en 4 bits, útil para pipelines de resumen por lotes.
- Agentes multi-turno con herramientas: la caché de prompt entre turnos y el soporte de tool calls permiten mantener conversaciones de agente sin reprocesar el contexto en cada paso.
- Servicio local multiusuario: con 8 peticiones concurrentes el rendimiento agregado llega a 236 tok/s en código y 131 tok/s en prosa, suficiente para un pequeño equipo que comparta una estación Apple Silicon.
- Evaluación y experimentación en investigación: el modo `--baseline` de `dspine-hybrid-generate` imprime la aceleración frente a decodificación plana, lo que facilita reproducir las tablas de rendimiento en hardware propio.
- Despliegue con el paquete oficial de Tencent: al ser compatible con `dspine_mlx`, se puede integrar en flujos ya basados en el ecosistema DSpine sin depender del servidor de netprojects.

## Benchmarks y rendimiento

Rendimiento de decodificación medido en un MacBook Pro M5 Max de 128 GB, greedy, comparado con mlx-lm 0.32.2 sobre el mismo objetivo (v0.2, razonamiento activado, 512 tokens nuevos, 10 prompts de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench):

| Objetivo | mlx-lm plano | Con DSpine | Aceleración | Bloque de verificación |
|---|---|---|---|---|
| 4 bits | 31,9 tok/s | 64,7 tok/s | ×2,03 | 5 |
| 8 bits | 17,9 tok/s | 52,1 tok/s | ×2,91 | 5 |
| bf16 | 9,1 tok/s | 39,1 tok/s | ×4,31 | 16 |

Razonamiento desactivado: 4 bits de 32,0 a 71,0 tok/s (×2,22) y 8 bits de 18,0 a 54,0 tok/s (×3,00) con `--adaptive`. Prompts largos (33K tokens, 256 tokens nuevos): 4 bits de 28,3 a 57,3 tok/s (×2,02) y 8 bits de 16,7 a 47,7 tok/s (×2,85), con picos de memoria de 29 GB y 42 GB.

Benchmark del motor v0.4 (objetivo 4 bits, greedy, razonamiento desactivado, ambos lados por servidores compatibles con OpenAI):

| Métrica | mlx-lm 0.32.2 | dspine-hybrid-serve v0.4 |
|---|---|---|
| Decodificación, prompts de código | 31,2 tok/s | 186,4 tok/s (×6,0) |
| Decodificación, prompts de prosa | 31,5 tok/s | 62,1 tok/s (×2,0) |
| Primer token, prompt de 8K / 32K | 10,3 s / 45,7 s | 6,3 s / 28,7 s |
| Cinco tareas reales, total | 364 s | 181 s |
| Pico de memoria | 32,9 GB | 32,4 GB |

Aceptación y calidad (razonamiento desactivado, drafter bf16, bloque completo de 16 tokens, primeras 50 preguntas de test de GSM8K): 4 bits 7,25 tokens por ronda y 90 % de precisión; 8 bits 7,32 y 84 %; bf16 7,33 y 86 %; la model card de Tencent reporta 7,20 tokens por ronda. Con bloque de 5 y drafter de 4 bits se aceptan 3,40 tokens por ronda frente a 3,35 del drafter bf16.

## Requisitos de hardware

- VRAM/unified memory: el pico medido con el objetivo de 4 bits es de 32,4 GB; con objetivo de 8 bits y prompt de 33K tokens, 42 GB. El drafter en sí ocupa 4,1 GB en bf16 y menos en 4 u 8 bits.
- Hardware de referencia: MacBook Pro M5 Max con 128 GB de memoria unificada; requiere Apple Silicon y macOS 15 o superior para los kernels Metal precompilados.
- GPU CUDA (A100, H100, RTX 4090): no disponible; el modelo está empaquetado para MLX y el motor documentado es específico de Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; el objetivo de 4 bits necesita alrededor de 33 GB, por lo que un equipo de 36 GB o más es el mínimo práctico y 64 GB o más es recomendable para contexto largo.
- Despliegue: `dspine-hybrid-serve` (servidor compatible con OpenAI, instalación vía `pip install "dspine-hybrid-mlx[fast] @ git+https://github.com/internet-projects/dspine-hybrid-mlx.git@v0.4.0"`), `dspine-hybrid-generate` para CLI y el paquete oficial `dspine_mlx` de Tencent. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer token de 6,3 s con 8K y 28,7 s con 32K; 186,4 tok/s en código y 62,1 tok/s en prosa en una petición; agregado de 199/181/221/236 tok/s en código y 51/75/98/131 tok/s en prosa con 1/2/4/8 peticiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-DSpine-b16-MLX | 2,0B | ventana deslizante de 8192 en el drafter | Drafter especulativo para Qwen3.8-27B en MLX | Apache 2.0 | Hugging Face, 2920 descargas |
| tencent/Qwen3.8-27B-DSpine-b16 | no disponible | no disponible | Drafter DSpine original en bf16 | no disponible en la información proporcionada | Hugging Face (modelo base) |
| mlx-community/Qwen3.8-27B-4bit | 27B (objetivo) | no disponible | Modelo generativo completo cuantizado a 4 bits | no disponible en la información proporcionada | Hugging Face |
| mlx-lm 0.32.2 (decodificación plana) | 27B (objetivo) | no disponible | Línea base sin decodificación especulativa | no aplica (herramienta) | pip |

La comparación relevante no es de calidad generativa, ya que el drafter no produce salida propia, sino de velocidad: frente a la decodificación plana con mlx-lm, este drafter multiplica el throughput por 2,0 a 6,0 según el régimen. No se dispone de datos de otros drafters especulativos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es utilizable de forma autónoma: solo funciona como drafter junto a un build MLX de Qwen3.8-27B; sin modelo objetivo no genera respuestas válidas.
- Dependencia de plataforma: requiere Apple Silicon, macOS 15 o superior y, para el modo rápido, Python entre 3.11 y 3.15; no hay soporte documentado para CUDA.
- La aceleración es muy variable según el régimen: ×6,0 en código, ×2,0 en prosa y ×2,02 con prompts largos; las cifras de las tablas de velocidad no se obtuvieron con bloque completo de 16 tokens, por lo que no deben extrapolarse entre configuraciones.
- El modo `--copy` solo aporta ventaja cuando la respuesta repite texto del contexto; en generación libre no aplica.
- La precisión en GSM8K medida con el objetivo de 8 bits (84 %) es inferior a la de 4 bits (90 %) y bf16 (86 %) en la muestra de 50 preguntas, lo que sugiere variabilidad de la muestra más que una propiedad del drafter; conviene validar en el caso de uso concreto.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al heredar la salida del modelo objetivo, los sesgos y alucinaciones de Qwen3.8-27B se trasladan sin cambios.
- Idiomas soportados: no disponibles; la cobertura lingüística depende del modelo objetivo y no está documentada para el drafter.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones propias que deben verificarse por separado.
- El repositorio tiene solo 4 likes y 2920 descargas, y la model card está parcialmente truncada en la información disponible (la tabla de ficheros aparece cortada), por lo que la lista completa de artefactos no se puede confirmar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Modelo base: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Repositorio del motor: https://github.com/internet-projects/dspine-hybrid-mlx
- Repositorio oficial de Tencent: https://github.com/Tencent/DSpine
- PR de soporte de arquitectura híbrida: https://github.com/Tencent/DSpine/pull/3
- PR de caché de prompt y copia de borradores: https://github.com/Tencent/DSpine/pull/21
- Modelo objetivo cuantizado a 4 bits: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Modelo objetivo cuantizado a 8 bits: https://huggingface.co/mlx-community/Qwen3.8-27B-8bit
- Gráfica de velocidad: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX/resolve/main/assets/speed-light.png
- Gráfica con razonamiento desactivado: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX/resolve/main/assets/thinking-off-light.png
- Gráfica de contexto largo: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX/resolve/main/assets/long-context-light.png
