# Sneg0wo/NeoHorse-1-4B-Sleipnir-8GB-Heretic-Abliterated-Uncensored-GGUF

## Resumen

NeoHorse-1-4B · Sleipnir · 8 GB es una cuantización GGUF del modelo base TokenRhythm/NeoHorse-1-4B, un transformer de 4.205.751.296 parámetros derivado de la familia Qwen3.5-4B. Lo publica el usuario Sneg0wo en Hugging Face bajo licencia Apache-2.0 y está pensado específicamente para ejecutarse completo en una GPU de 8 GB de VRAM, un objetivo que el modelo original no cumple con su ventana de contexto publicada de 262.144 tokens.

El modelo no es un entrenamiento nuevo, sino una fusión ponderada de tres variantes: `huihui-ai/Huihui-NeoHorse-1-4B-abliterated` (peso 0,6), `prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO` (peso 0,25) y el base `TokenRhythm/NeoHorse-1-4B` (peso 0,15). El resultado se cuantiza en tres formatos (IQ4_XS, Q5_K_M e IQ3_M) calibrados con imatrix sobre transcripciones sintéticas de tool calls, y se distribuye con un conjunto de benchmarks medidos por el propio autor.

Su relevancia práctica está en la documentación del compromiso real entre tamaño en disco, contexto utilizable y calidad: el autor publica tablas de contexto máximo por cuantización y tipo de caché KV calculadas sobre la configuración real del modelo y verificadas contra el informe de asignación de llama.cpp. El objetivo declarado es el despliegue local en hardware de consumo con soporte de tool calling y sin rechazos en prompts benignos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B, según tags del autor) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens anunciados; contexto máximo real por cuantización y caché KV: 34.014–145.220 tokens (ver tabla de hardware) |
| Tipos de cuantizacion | IQ4_XS (2,55 GB), Q5_K_M (3,09 GB), IQ3_M (2,2 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | TokenRhythm/NeoHorse-1-4B |
| Tamano del repositorio | 7,8 GB |
| Elementos de caché KV | 65.536 por token |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4.200 millones de parámetros, heredado de la arquitectura Qwen3.5-4B según los tags del autor. No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

La innovación técnica de esta publicación es el proceso de fusión y cuantización: un merge ponderado en streaming sobre CPU de tres checkpoints, conversión a GGUF en f16, calibración de imatrix con 200 secuencias de 512 tokens de transcripciones sintéticas de tool calls, cuantización y evaluación a través de `llama-server` con temperatura 0. El autor documenta explícitamente un error de metodología corregido: la primera pasada de evaluación solo leía `message.content`, pero Qwen3.5 escribe el razonamiento en `reasoning_content`, de modo que MMLU puntuaba 0/150 mientras el tool calling seguía funcionando porque lee el campo estructurado `tool_calls`. La versión actual detecta cómo desactivar el modo thinking y lee ambos campos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento con modo thinking activable y desactivable; el autor mide el impacto del modo thinking en tool calling (por ejemplo, IQ4_XS pasa de 81,0 a 94,0 en precisión estricta).
- Tool calling / function calling con argumentos estructurados, validado a través de la ruta real `/v1/chat/completions` con 100 prompts.
- Razonamiento matemático de varios pasos (GSM8K medido).
- Conocimiento general y respuesta a preguntas de opción múltiple (MMLU 0-shot medido).
- Comportamiento sin rechazos en prompts benignos (0 rechazos en 30 prompts de prueba), orientado a uso sin censura.
- Capacidades multilingües: solo inglés declarado.
- No se documentan capacidades de visión, audio ni agentes multi-paso más allá del tool calling.

## Casos de uso

- Asistente local de atención al cliente: el modelo puede mantener conversaciones multi-turno con hasta 64.000–77.000 tokens de contexto real en cuantización q8_0 sobre una GPU de 8 GB, suficiente para incorporar historial de tickets y documentación de producto en la ventana.
- Automatización de tool calling en pipelines internos: con 99/100 en precisión estricta de herramientas (Q5_K_M, thinking on), es adecuado para orquestar llamadas a APIs como consulta de pedidos, envío de correos o búsqueda en catálogos, integrándose vía `llama-server` con `--jinja`.
- Generación de código y scripting en entornos con GPU de consumo: el modelo cabe en 2,2–3,1 GB en disco y deja margen de VRAM para caché KV, lo que permite usarlo como copiloto local en un portátil con RTX 5060 o similar.
- Resolución de problemas matemáticos de nivel escolar: 96,2 % en GSM8K con Q5_K_M, útil para tutores automáticos o validación de ejercicios con razonamiento paso a paso.
- Evaluación de modelos sin censura para investigación: la variante abliterated/heretic permite estudiar comportamientos sin rechazos en dominios donde los modelos alineados bloquean respuestas, con la advertencia de que el autor indica que la métrica de over-refusal no es una métrica de seguridad.
- Despliegue en LM Studio o llama.cpp para prototipado rápido: el autor documenta la configuración exacta (contexto 8192, KV f16, Flash Attention off, desactivar decodificación especulativa MTP) y el tiempo de carga (6,4 s, 2,9 GB de VRAM a 8k de contexto).
- Procesamiento de documentos largos en local: con IQ3_M y caché q4_0 se alcanzan 145.220 tokens de contexto, adecuado para resumir o extraer información de documentos extensos en hardware de 8 GB, asumiendo la pérdida de calidad (−9,4 puntos de MMLU frente al donante Q8_0).

## Benchmarks y rendimiento

Resultados publicados por el autor. MMLU: 150 preguntas, 0-shot, letra exacta, thinking off (no comparable con cifras publicadas de 5-shot). GSM8K: 80 preguntas, número exacto. Tool calling: 100 prompts a través de `/v1/chat/completions`, thinking on, herramienta y todos los argumentos exactos. PPL: wikitext-2, contexto 512.

| Modelo | GB | MMLU 0-shot % | GSM8K % | Tool estricto % | Over-refusal % | PPL |
|---|---|---|---|---|---|---|
| Sleipnir-IQ4_XS | 2,55 | 70,0 | 90,0 | 94,0 | 0,0 | 9,605 |
| Sleipnir-Q5_K_M | 3,09 | 72,0 | 96,2 | 99,0 | 0,0 | 9,508 |
| Sleipnir-IQ3_M | 2,2 | 63,3 | 93,8 | 99,0 | 0,0 | 9,871 |
| Donante Q8_0 | 4,61 | 72,7 | 93,8 | 100,0 | 0,0 | 9,393 |

Coste de la cuantización frente al donante Q8_0:

| Cuantización | GB | Tamaño | MMLU | GSM8K | Tool | PPL |
|---|---|---|---|---|---|---|
| IQ4_XS | 2,55 | −45 % | −2,7 | −3,8 | −6,0 | +2,3 % |
| Q5_K_M | 3,09 | −33 % | −0,7 | +2,4 | −1,0 | +1,2 % |
| IQ3_M | 2,2 | −52 % | −9,4 | 0,0 | −1,0 | +5,1 % |

Rendimiento medido con `llama-bench` en una RTX 5060 Laptop: 91 tok/s de generación y 3.570 tok/s de prefill. AIME no se reporta porque 21–28 de 30 respuestas alcanzaron el límite de 2.048 tokens a mitad de derivación.

## Requisitos de hardware

- VRAM utilizable estimada: ≈7,55 GB tras contexto CUDA y buffers de cómputo.
- Pesos en disco: 2,2 GB (IQ3_M), 2,55 GB (IQ4_XS), 3,09 GB (Q5_K_M).
- Contexto máximo por cuantización y tipo de caché KV (elementos/token: 65.536):

| Archivo | GB | f16 | q8_0 | q4_0 |
|---|---|---|---|---|
| Sleipnir-IQ4_XS | 2,55 | 38.119 | 71.754 | 135.535 |
| Sleipnir-Q5_K_M | 3,09 | 34.014 | 64.026 | 120.939 |
| Sleipnir-IQ3_M | 2,2 | 40.843 | 76.881 | 145.220 |

- GPU recomendadas: cualquier GPU con 8 GB de VRAM; el autor valida en RTX 5060 Laptop. No hay datos para A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo de 8 GB; el contexto anunciado de 262.144 tokens requiere ~18,3 GB solo de caché KV en q8_0 y no es viable en 8 GB con ninguna cuantización.
- Despliegue: llama.cpp (`llama-server`), LM Studio. Ejemplo del autor: `llama-server -m Sleipnir-Q5_K_M-agentic.gguf -c 16384 -ngl 99 --jinja -np 1`.
- Para superar los límites f16 se requiere `--cache-type-k q8_0 --cache-type-v q8_0 -fa on`; el autor advierte que esa ruta fue ~600× más lenta en su build de Windows y recomienda medirla antes.
- Latencia y throughput: 91 tok/s de generación y 3.570 tok/s de prefill en RTX 5060 Laptop; carga de 6,4 s en LM Studio con 2,9 GB de VRAM a 8k de contexto.
- LM Studio: desactivar "Draft MTP speculative decoding" antes de cargar; el modelo no tiene cabeza MTP y el motor aborta con `GGML_ASSERT(layer.nextn.eh_proj && "MTP block missing nextn.eh_proj")`, mostrando solo `exitCode=3221226505`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeoHorse-1-4B · Sleipnir (este) | 4,2 B | 262.144 anunciados; 34k–145k reales en 8 GB | Apache-2.0 | GGUF | Fusion de 3 variantes, cuantizado con imatrix |
| TokenRhythm/NeoHorse-1-4B (base) | 4,2 B | no disponible | Apache-2.0 | safetensors | Modelo original sin fusión ni cuantización |
| huihui-ai/Huihui-NeoHorse-1-4B-abliterated | 4,2 B | no disponible | no disponible | no disponible | Donante de abliteration (peso 0,6 en el merge) |
| prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO | 4,2 B | no disponible | no disponible | no disponible | Donante heretic/uncensored (peso 0,25 en el merge) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La referencia de los benchmarks es el donante en Q8_0, no este merge en Q8, de modo que los deltas mezclan el coste de la cuantización con el efecto de la fusión.
- MMLU 0-shot con n=150 tiene un intervalo de confianza del 95 % de ±8 puntos; diferencias menores son ruido estadístico.
- GSM8K: 3/80 respuestas de IQ4_XS, 3/80 de Q5_K_M, 1/80 de IQ3_M y 2/80 de la referencia alcanzaron el límite de tokens y puntúan mal.
- El tool calling falla sistemáticamente en la familia de prompts "email vs order" (confunde `search_orders` con la herramienta de correo), especialmente en IQ4_XS (94/100).
- Solo inglés declarado; no hay soporte multilingüe documentado.
- El contexto anunciado de 262.144 tokens no es alcanzable en 8 GB de VRAM con ninguna cuantización; el contexto real depende del tipo de caché KV.
- El modo thinking afecta materialmente al tool calling; desactivarlo degrada la selección de herramientas en varios prompts.
- La variante está ablacionada y sin censura (0 rechazos en 30 prompts benignos); el autor advierte que la métrica de over-refusal no es una métrica de seguridad. No debe desplegarse en producción orientada a usuarios sin filtros adicionales.
- Licencia Apache-2.0 permite uso comercial, pero el comportamiento sin alineación traslada al operador la responsabilidad sobre el contenido generado.
- Riesgo de alucinación no cuantificado en la documentación; aplicable el riesgo habitual de modelos de 4 B.
- La ruta de caché KV q8_0 con Flash Attention fue ~600× más lenta en el build de Windows del autor; requiere validación en cada entorno.

## Enlaces

- Hugging Face: https://huggingface.co/Sneg0wo/NeoHorse-1-4B-Sleipnir-8GB-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Donante abliterated: https://huggingface.co/huihui-ai/Huihui-NeoHorse-1-4B-abliterated
- Donante heretic: https://huggingface.co/prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO
