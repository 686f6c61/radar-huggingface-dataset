# Dedalo101/littlebit-qwen3-8b-lb1-v3

## Resumen

LittleBit Qwen3-8B LB1 v3 es un export experimental del modelo Qwen3-8B de Alibaba, publicado por el usuario Dedalo101 en Hugging Face. Se trata de una compresión extrema de los pesos mediante la técnica LittleBit, que empaqueta las 36 proyecciones del transformer en factores de ±1 de aproximadamente 1,0 bits por peso (tipo GGML `LB1 = 44`), mientras que el embedding de tokens y la cabeza de salida permanecen en Q8_0 para preservar la calidad factual. El resultado es un único archivo GGUF de 1,69 GiB (1.810.170.944 bytes) pensado para inferencia exclusivamente en CPU.

El modelo no es un asistente conversacional ni una compresión que preserve la calidad de Qwen3-8B: el propio autor lo describe como una demostración de formato. Con prompts cortos de completación greedy funciona de forma razonable, pero los prompts envueltos en ChatML degradan. Su relevancia es técnica: demuestra que es viable ejecutar un modelo de 8B en CPU con un consumo de memoria pico de unos 1,86 GB, a costa de una perplejidad considerablemente mayor que la del modelo original.

La licencia es un punto crítico: la técnica LittleBit está bajo CC BY-NC 4.0 (no comercial), el checkpoint base Qwen3 bajo Apache-2.0 y llama.cpp/ggml bajo MIT. El autor advierte explícitamente de que no debe usarse comercialmente antes de revisar `LITTLEBIT_NOTICE.md`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder), 36 capas, 4096 hidden, vocab 151936 |
| Parametros totales | 5.001.994.752 (según safetensors); el modelo base es Qwen3-8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el ejemplo de runtime usa `-c 128`) |
| Tipos de cuantizacion | LB1 (~1,0 bpw) en las 36 proyecciones; Q8_0 en embedding y cabeza de salida (no atados) |
| Idiomas soportados | no disponible |
| Licencia | other (LittleBit CC BY-NC 4.0 + base Qwen3 Apache-2.0 + llama.cpp MIT) |
| Formato de pesos | GGUF (`littlebit-qwen3-8b-lb1-v3.gguf`, 1.810.170.944 B, SHA256 `3bf86e86da8dc1d84be5725fa6381d329b2113185bf1e2e7f0c2945732acb346`, 2667 tensores) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder con 36 capas, dimensión oculta 4096 y vocabulario de 151936 tokens. La modificación no consiste en un reentrenamiento, sino en una recompresión post-hoc: las 36 proyecciones del transformer se empaquetan con factores LittleBit de ±1 (tipo `GGML_TYPE_LB1 = 44`), mientras que el embedding de tokens y la cabeza de salida no atada se mantienen en Q8_0. El autor documenta el coste por token: 468.910.080 bytes por forward en la ruta LB1 y 661.225.472 bytes en la cabeza Q8_0, para un total de 1.130.135.552 bytes por forward a un token.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO, ya que no se trata de un modelo entrenado desde cero sino de un export comprimido. La innovación técnica es el propio formato LB1 y su kernel de decodificación: el perfilado con `LLAMA_LB1_PROFILE=1` muestra que en el host x86 de pruebas aproximadamente el 90 % del tiempo de decodificación corresponde a la ruta de factores LB1 y un 6-7 % a la cabeza Q8_0. El autor aporta además evidencia negativa de variantes rechazadas: una cabeza de salida Q4_K empeoró la perplejidad del chunk 1 a 25,3521 frente a 24,5867 con Q8_0 y provocó un giro factual concreto ("French Riviera" en lugar de "vibrant culture"), y una cabeza Q6_K subió a 24,7543 (+0,1676, por encima del umbral de +0,1).

## Capacidades

- Generación de texto autoregresiva en modo completación greedy; el autor indica que los prompts cortos de completación se comportan correctamente.
- Completación de frases y texto factual corto (el ejemplo de la model card es "The capital of France is").
- Ejecución en CPU sin GPU, con un artefacto portátil de corrección basado en Python 3 + numpy.
- Compatibilidad con el ecosistema llama.cpp mediante un fork en la rama `littlebit-tensor`.
- Carga en Ollama v0.40.17 tras aplicar un parche local y compilar con `OLLAMA_LLAMA_CPP_SOURCE` apuntando al fork, usando modo de completación cruda (`"raw": true`).
- No es un modelo chat: los prompts con formato ChatML degradan según el autor.
- No hay información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, modo thinking ni capacidades multilingües.

## Casos de uso

- Demostración de formato de compresión: sirve para validar la implementación del tipo GGML `LB1` y comparar kernels (F32 frente a P32-equivalente) midiendo perplejidad en WikiText-2 con ventanas de contexto 2048.
- Investigación en compresión extrema de pesos: permite estudiar el impacto de ~1,0 bpw en las proyecciones frente a mantener la cabeza en Q8_0, con evidencia documentada de fallos factuales en cabezas de menor precisión.
- Inferencia en CPU con memoria muy limitada: con un RSS pico medido de 1864,4 MB a `-c 128 -t 8`, encaja en entornos sin GPU y con poca RAM disponible.
- Pruebas de regresión de kernels: el script `tools/littlebit-output-regression.py` permite detectar deriva de argmax ante cambios de kernel o de cabeza comparando las 6/6 completaciones greedy registradas.
- Desarrollo y depuración de runtimes alternativos: el artefacto portátil en Python 3 + numpy permite verificar la corrección del formato sin compilar el fork.
- Benchmarking de decodificación en placas ARM: el autor sugiere medir tokens/s en hardware silencioso o en la placa ARM objetivo antes de publicar cifras, lo que lo hace útil como banco de pruebas de rendimiento en CPU.
- Validación de pipelines de cuantización en CI: el par de scripts de completación y regresión permite integrar comprobaciones automáticas de calidad tras cambios en el kernel.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| WikiText-2 raw test, 12 ventanas, c=2048 | 21,2364 ± 0,59425 (kernel F32 final, rerun completo) | Objetivo: 20,88 ± 0,5; techo de aceptación: <= 23 |
| Kernel P32-equivalente anterior | 21,2364 ± 0,59424; deltas por chunk <= 0,0016 | Comparación interna |
| Regresión de salida greedy | 6/6 prompts reproducen las completaciones v3 registradas | Gate de aceptación |
| Cabeza Q4_K (rechazada) | PPL chunk 1: 25,3521 frente a 24,5867 con Q8_0 | Evidencia negativa |
| Cabeza Q6_K (rechazada) | PPL chunk 1: 24,7543 (+0,1676, umbral < +0,1) | Evidencia negativa |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor no cita tokens/s porque el host de pruebas estaba compartido con otras cargas.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia exclusivamente en CPU (`-ngl 0`).
- RAM: RSS pico medido de 1864,4 MB en el host x86 con `-c 128 -t 8`; el archivo GGUF ocupa 1,69 GiB.
- GPU recomendadas: no aplica; el autor indica que no se necesita GPU ni paso de compilación para el artefacto portátil de corrección.
- Cabe en consumer GPU: no es el objetivo del export; el formato LB1 requiere el fork de llama.cpp y está orientado a CPU.
- Opciones de despliegue: fork de llama.cpp en la rama `littlebit-tensor` (`build/bin/llama-completion`), Ollama v0.40.17 con parche local (`docs/littlebit-ollama.patch`), y el script portátil `tools/littlebit_cpu.py` con Python 3 + numpy.
- Latencia y throughput: no disponibles; el autor no publica tokens/s por usar un host compartido y recomienda medir en hardware silencioso o en la placa ARM objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LittleBit Qwen3-8B LB1 v3 | 5.001.994.752 (base 8B) | no disponible | LB1 + Q8_0, GGUF 1,69 GiB | other (CC BY-NC 4.0 + Apache-2.0) | Hugging Face, 0 descargas |
| Qwen3-8B (original) | 8B | no disponible en esta ficha | safetensors, GGUF, etc. | Apache-2.0 | Hugging Face |
| Otras compresiones GGUF de Qwen3-8B (p. ej. Q4_K_M) | 8B | depende del runtime | Q4_K_M y similares | Apache-2.0 | Hugging Face |

La comparación con cuantizaciones GGUF convencionales es la más directa: un Q4_K_M de Qwen3-8B ronda los 4-5 GiB y preserva calidad conversacional, mientras que este export ocupa 1,69 GiB pero pierde el comportamiento de chat y eleva la perplejidad a 21,2364 en WikiText-2. No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente conversacional: los prompts envueltos en ChatML degradan según el autor; solo funcionan bien las completaciones greedy cortas.
- Calidad degradada respecto al original: perplejidad de 21,2364 en WikiText-2 frente a un objetivo de 20,88 ± 0,5, con techo de aceptación en 23.
- Riesgo de giros factuales documentado: la cabeza Q4_K produjo "French Riviera" en lugar de "vibrant culture" en un prompt de prueba, un fallo que la perplejidad media no revelaba.
- Licencia restrictiva: la técnica LittleBit es CC BY-NC 4.0, por lo que el uso comercial requiere revisión legal previa según `LITTLEBIT_NOTICE.md`; no se permite el upstreaming a llama.cpp u Ollama sin revisión legal.
- Dependencia de un fork: requiere el fork de llama.cpp en la rama `littlebit-tensor`; Ollama necesita un parche local y compilación específica.
- Sin datos de idiomas soportados, contexto máximo ni benchmarks estándar en la model card.
- Sin métricas de latencia o throughput publicadas; el autor advierte de que las cifras deben medirse en hardware dedicado.
- Modelo experimental con 0 descargas y 0 likes en el momento de la ficha; no afiliado a SamsungLabs ni al proyecto llama.cpp.
- No hay información sobre sesgos, alineación o seguridad, al no ser un modelo entrenado con RLHF en este formato.

## Enlaces

- Hugging Face: https://huggingface.co/Dedalo101/littlebit-qwen3-8b-lb1-v3
- Repositorio del fork de llama.cpp (rama `littlebit-tensor`): no disponible como URL en la información proporcionada
- Documento de licencia `LITTLEBIT_NOTICE.md`: referenciado en la model card, sin URL directa disponible
- Documento de diseño `docs/littlebit-design.md`: referenciado en la model card, sin URL directa disponible
- Parche de Ollama `docs/littlebit-ollama.patch`: referenciado en la model card, sin URL directa disponible
- Paper o blog de LittleBit: no disponible en la información proporcionada
