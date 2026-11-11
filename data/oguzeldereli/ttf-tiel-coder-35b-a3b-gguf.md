# oguzeldereli/ttf-Tiel-Coder-35B-A3B-GGUF

## Resumen

ttf-Tiel-Coder-35B-A3B-GGUF es una cuantización ternary (1,58 bits) del modelo Tiel-Coder-35B-A3B, que a su vez es un ajuste de ornith-ai/Ornith-1.5-35B-A3B con la plantilla de chat Sharp. Lo publica el desarrollador oguzeldereli dentro de su línea de trabajo TTF (ternary transformer format) y su interés principal es comprimir un modelo MoE de 35.720.266.368 parámetros totales en un único fichero GGUF de 9,83 GB, manteniendo únicamente los expertos enrutados y las proyecciones densas en formato ternary.

El modelo parte del checkpoint BF16 y se convierte capa a capa mediante GPTQ ternary sobre la covarianza de entrada centrada, con escalas por fila y columna y un adaptador ternary de rango 16 en cada capa lineal. Después se aplica un entrenamiento de recuperación de 800 pasos (unos 26M tokens) con destilación del modelo BF16 sobre una mezcla de razonamiento, código, matemáticas, uso de herramientas y texto web multilingüe. La torre de visión y la cabeza MTP no están incluidas.

Es relevante ahora porque demuestra una vía práctica para ejecutar un MoE de 35B en GPUs de consumo con 24 GB de VRAM, a costa de una pérdida de calidad medible frente a cuantizaciones de 2 y 4 bits. El autor lo presenta explícitamente como una release de investigación, no como sustituto de los cuantizados de 2 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (arquitectura `qwen35moe` en llama.cpp), basada en Ornith-1.5-35B-A3B con plantilla de chat Sharp |
| Parametros totales | 35.720.266.368 |
| Parametros activos | no disponible |
| Longitud de contexto | 16k tokens en la configuración de referencia del autor (4 slots paralelos) |
| Tipos de cuantizacion | Ternary 1,58-bit (TQ1_P): pesos en {-1, 0, +1} con escalas por fila y columna; requiere llama.cpp con parches TTF |
| Idiomas soportados | no disponible (el entrenamiento de recuperación incluye texto web multilingüe) |
| Licencia | MIT (heredada del modelo base ornith-ai/Ornith-1.5-35B-A3B) |
| Formato de pesos | GGUF (fichero `ttf-Tiel-Coder-35B-A3B-TQ1_P.gguf`, 9,83 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 35.720.266.368 parámetros totales. La conversión ternary sustituye cada experto enrutado y cada proyección densa por pesos en {-1, 0, +1} multiplicados por escalas de fila y columna; la media de entrada se pliega en un sesgo y se añade un adaptador ternary de rango 16 en cada capa lineal. El proceso se hizo capa a capa en una sola GPU, con GPTQ ternary calculado sobre la covarianza de entrada centrada y 256 ventanas de calibración de 2048 tokens.

Tras la conversión se ejecutó un entrenamiento de recuperación de 800 pasos (aproximadamente 26M tokens) con el framework ttf-ternary, destilando la distribución top-64 del profesor BF16 más un bucket de cola, sobre una mezcla de post-entrenamiento (razonamiento, código, matemáticas, uso de herramientas, chat) y texto web multilingüe. La torre de visión y la cabeza MTP del modelo original no se incluyen en este fichero. La inferencia requiere llama.cpp con los parches TTF del repositorio ttf-home, que implementa el motor `--q38` para la arquitectura `qwen35moe`.

## Capacidades

- Generación de texto conversacional multi-turno con la plantilla de chat Sharp incluida.
- Razonamiento, matemáticas y código: el mix de recuperación cubre reasoning, code y math, y los benchmarks publicados son GSM8K y HumanEval.
- Uso de herramientas (tool use): presente en la mezcla de entrenamiento de recuperación.
- Capacidades multilingües por inclusión de texto web multilingüe en el entrenamiento de recuperación, sin lista de idiomas publicada.
- Modo thinking desactivable mediante la plantilla de chat (los benchmarks se ejecutaron con thinking off).
- Servido con API compatible con OpenAI a través de `ttf serve`.
- No incluye visión ni decodificación especulativa MTP (la torre de visión y la cabeza MTP fueron descartadas).

## Casos de uso

- Evaluación de cuantización ternary en producción: desplegar el fichero TQ1_P frente a Q2_K_XL e IQ4_XS con el mismo harness para medir la pérdida real en tareas propias antes de adoptar el formato.
- Generación de código asistida en entornos con VRAM limitada: con 9,83 GB cabe entero en una RTX 3090 Ti de 24 GB a 16k de contexto y 4 slots, lo que permite servir autocompletado y revisión de código en una sola GPU de consumo.
- Razonamiento matemático de apoyo en pipelines educativos o de verificación: GSM8K de 0,805 en los primeros 200 ítems es suficiente para tareas de comprobación y generación de borradores, no para sustituir un modelo de 4 bits en producción crítica.
- Agentes con tool calling en prototipos: la mezcla de recuperación incluye uso de herramientas y el servidor expone API compatible con OpenAI, lo que facilita integrarlo en frameworks de agentes para pruebas de concepto.
- Investigación sobre formatos ternary: el repositorio ttf-ternary y el motor `--q38` permiten reproducir la conversión GPTQ ternary y el entrenamiento de recuperación sobre otros checkpoints.
- Despliegue en hardware de gama consumer con offload parcial: en tarjetas con menos de 24 GB, la opción `--fit` de llama.cpp mantiene parte de los expertos en memoria host, lo que permite ejecutar el modelo con latencia mayor.
- Chat multilingüe de bajo coste en entornos con restricciones de memoria, aceptando la pérdida de calidad frente a cuantizaciones mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor con `llama-server`, plantilla Sharp con thinking off, decodificación greedy y máximo 512 tokens nuevos, mismo harness y prompts para los tres ficheros:

| Modelo | Tamano | GSM8K (primeros 200) | HumanEval (164) | Tokens generados por ítem GSM8K |
|---|---|---|---|---|
| ttf-Tiel-Coder TQ1_P (este modelo) | 9,83 GB | 0,805 ± 0,028 | 0,659 ± 0,037 | 156 |
| Tiel-Coder Q2_K_XL | 12,68 GB | 0,920 ± 0,019 | 0,854 ± 0,028 | 103 |
| Tiel-Coder IQ4_XS | 18,12 GB | 0,945 ± 0,016 | 0,896 ± 0,024 | 83 |

El autor señala que este fichero es un 22% más pequeño que Q2_K_XL y queda claramente por detrás (−0,115 en GSM8K, −0,195 en HumanEval), con respuestas aproximadamente un 50% más largas. No se han publicado resultados de benchmarks adicionales (MMLU, MMLU-Pro, HumanEval+, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 9,83 GB de pesos; con 16k de contexto y 4 slots paralelos el autor ejecutó todas las capas en GPU en una RTX 3090 Ti de 24 GB (`-ngl 99`).
- GPU recomendadas: RTX 3090 Ti (24 GB) es la configuración de referencia validada por el autor; GPUs con 24 GB o más (RTX 4090, A100, H100) deberían acomodar el modelo con margen para contexto.
- GPU de consumo: cabe en tarjetas de 24 GB; en tarjetas con menos VRAM, la opción `--fit` de llama.cpp mantiene parte de los expertos en memoria host.
- Opciones de despliegue: llama.cpp con parches TTF a través de ttf-home (`ttf chat` para CLI y `ttf serve` para API compatible con OpenAI, puerto configurable). No hay soporte indicado para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles. El autor solo reporta el número de tokens generados por ítem de GSM8K (156), no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval | Tamano | Licencia |
|---|---|---|---|---|---|---|
| ttf-Tiel-Coder-35B-A3B TQ1_P | 35.720.266.368 totales | 16k (config. de referencia) | 0,805 | 0,659 | 9,83 GB | MIT |
| Tiel-Coder-35B-A3B Q2_K_XL | no disponible | no disponible | 0,920 | 0,854 | 12,68 GB | no disponible |
| Tiel-Coder-35B-A3B IQ4_XS | no disponible | no disponible | 0,945 | 0,896 | 18,12 GB | no disponible |
| ornith-ai/Ornith-1.5-35B-A3B (BF16, base) | 35.720.266.368 totales | no disponible | no disponible | no disponible | no disponible | MIT |

Las dos alternativas directas son cuantizaciones del mismo modelo base Tiel-Coder, por lo que la comparación aísla el efecto del formato ternary frente a GGUF de 2 y 4 bits. El checkpoint BF16 original no tiene métricas publicadas en la información disponible.

## Limitaciones y advertencias

- Pérdida de calidad medible: −0,115 en GSM8K y −0,195 en HumanEval frente a Q2_K_XL, con respuestas un 50% más largas; el autor lo califica como release de investigación, no como sustituto de los cuantizados de 2 bits.
- Entrenamiento de recuperación corto: solo 800 pasos y unos 26M tokens, lo que limita la recuperación de capacidades tras la conversión ternary.
- Sin visión ni MTP: la torre de visión y la cabeza de decodificación especulativa MTP no están incluidas, por lo que no se pueden usar esas capacidades del modelo original.
- Dependencia de un fork de llama.cpp: requiere los parches TTF de ttf-home y el motor `--q38`; no funciona con llama.cpp estándar ni con otros motores de inferencia habituales.
- Idiomas no declarados: la model card no publica la lista de idiomas soportados, solo menciona texto web multilingüe en el mix de recuperación.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de factualidad ni de sesgos en la información disponible.
- Licencia: el modelo es MIT, pero los parches de inferencia de ttf-home tienen su propia licencia, que debe revisarse por separado para uso comercial.
- Contexto de referencia limitado a 16k en la configuración validada; no se documenta el contexto máximo nativo del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oguzeldereli/ttf-Tiel-Coder-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Cuantizado de referencia con MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP
- Framework de entrenamiento ternary: https://github.com/oguzeldereli/ttf-ternary
- Motor de inferencia con parches TTF: https://github.com/oguzeldereli/ttf-home
