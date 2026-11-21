# litert-community/Nanbeige4.2-3B

## Resumen

Nanbeige4.2-3B es un modelo de razonamiento de 3B parámetros desarrollado por Nanbeige y publicado bajo licencia Apache-2.0. Su rasgo arquitectónico distintivo es ser un **looped transformer**: sus 22 capas se ejecutan dos veces por token (`num_loops=2`), de modo que el coste de cómputo por token equivale aproximadamente al de un modelo de 8B, mientras que el almacenamiento de pesos se mantiene en la escala de un 3B. Esta ficha documenta la conversión on-device realizada por la comunidad `litert-community` para el runtime LiteRT-LM de Google.

La build aquí descrita, `model.litertlm` (~2,4 GB), cuantiza los pesos a int4 con bloques de 32 elementos y clipping óptimo OCTAV simétrico, mantiene los embeddings en INT8 y fija una caché KV de 4096 tokens con 44 slots (22 capas × 2 bucles). El resultado es un artefacto ejecutable en dispositivos móviles y portátiles sin GPU dedicada, con backend CPU y GPU (Metal en Apple, LiteRT GPU en Android).

Su relevancia actual radica en la combinación de tres factores poco habituales: razonamiento con bloque `<think>` explícito, licencia permisiva sin restricciones comerciales y un formato de despliegue pensado para inferencia local. La model card reporta 90,0% en GSM8K (n=50, 0-shot CoT) para la build int4 frente al 94,0% de la referencia bf16, y verifica la ejecución en un iPhone 17 Pro y en un Galaxy S26.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles compartidos (looped transformer), 22 capas ejecutadas 2 veces por token |
| Parámetros totales | 3B (clase) |
| Parámetros activos | no disponible (no es MoE; los pesos se comparten entre bucles) |
| Longitud de contexto | 4096 tokens (caché KV, 44 slots: 22 capas × 2 bucles) |
| Tipos de cuantización | Pesos int4 blockwise (bloque 32) + OCTAV optimal-clipping simétrico; embeddings INT8; variante `model_fp32act.litertlm` con activaciones fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en formato original de Nanbeige |
| Tamaño del artefacto | ~2,4 GB (`model.litertlm`); 2,58 GB de descarga para `model_fp32act.litertlm` |
| Runtime | LiteRT-LM (antiguo TensorFlow Lite), conversión vía `litert-torch` |
| Repositorio | 28,4 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de 22 capas con pesos compartidos entre dos pasadas por token. En la exportación a LiteRT-LM el bucle se desenrolla: se ejecutan 44 capas sobre 22 conjuntos de pesos, con un slot de caché KV por cada par (bucle, capa), lo que da los 44 slots declarados. Los pesos se almacenan una sola vez; solo se duplican el cómputo y la caché. Esta decisión de diseño explica la nota de velocidad de la model card: el modelo rinde a tasas de decodificación propias de un 8B en CPU pese a ocupar como un 3B.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card sí especifica el recetario de muestreo recomendado —temperatura 0,6, top_k 20, top_p 0,95— y señala que la plantilla de chat abre automáticamente el bloque `<think>`, de forma que el modelo arranca dentro de su razonamiento. La conversión a LiteRT-LM se validó con `litert_torch.convert` sin modificaciones, con una coincidencia de 4e-7 frente al original en un Galaxy S26 (LiteRT 2.2.0, Android 16).

## Capacidades

- Generación de texto con razonamiento explícito en bloque `<think>…</think>`, con cierre limpio verificado en pruebas locales.
- Razonamiento matemático de varios pasos: 90,0% en GSM8K con 0-shot CoT y muestreo oficial.
- Modo de razonamiento previo a la respuesta, activado por defecto mediante la plantilla de chat oficial.
- Inferencia on-device en CPU y GPU (Metal en Apple Silicon, LiteRT GPU en Android).
- Ejecución en navegador mediante WebGPU con el artefacto `model_fp32act.litertlm`.
- Soporte de plantilla ChatML con tokens de parada estándar.
- Compatibilidad con el formato de content-parts 0.18 en la plantilla de chat (desde 2026-09-21).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no documentadas.

## Casos de uso

- **Asistente de razonamiento en móvil sin conectividad**: el artefacto de 2,4 GB se ejecuta íntegramente en un iPhone 17 Pro o un Galaxy S26, permitiendo respuestas con cadena de pensamiento en escenarios de campo, auditoría o entornos sin red, donde el coste de llamar a una API es inasumible o la latencia de red es prohibitiva.
- **Verificación de cálculos en aplicaciones financieras o de ingeniería**: con 90,0% en GSM8K en su build int4, el modelo sirve como comprobador local de operaciones aritméticas de varios pasos antes de persistir un resultado, añadiendo una capa de validación sin depender de servicios externos.
- **Procesamiento por lotes en portátiles sin GPU dedicada**: con 12,5 tok/s de decodificación en CPU sobre un Apple M4 Max, resulta viable para tareas de clasificación, extracción o resumen de documentos de hasta 4096 tokens ejecutadas de forma desatendida durante la noche.
- **Prototipado rápido de aplicaciones LiteRT-LM**: al ser una conversión de referencia con métricas de fidelidad publicadas (4e-7 frente al original), sirve como banco de pruebas para validar pipelines de conversión `litert-torch` antes de portar modelos propios.
- **Demostraciones interactivas en navegador**: el artefacto `model_fp32act.litertlm` se carga vía WebGPU en la demo oficial de chat, lo que permite evaluar el comportamiento del modelo en una página web sin instalación, útil para comparativas internas o formación de equipos.
- **Tutoring y explicación paso a paso**: el bloque `<think>` expone el razonamiento intermedio, lo que facilita construir interfaces que muestren el proceso de resolución y no solo la respuesta final, aprovechable en herramientas educativas de matemáticas y lógica.
- **Evaluación de razonamiento en dispositivos de gama alta Android**: con delegación completa de 4716 operaciones en LiteRT GPU y un pico de 2691 MiB en el Galaxy S26, permite medir el comportamiento de un modelo con razonamiento en hardware de consumo antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

Precisión en GSM8K (n=50, 0-shot CoT, muestreo oficial):

| Build | GSM8K |
|---|---|
| bf16 (transformers 4.51, referencia) | 94,0% (47/50) |
| int4 `.litertlm` (LiteRT-LM CPU) | 90,0% (45/50) |

Rendimiento de inferencia (`litert-lm benchmark`, litert-lm 0.15.0, `-p 256 -d 256 --runs 3`, max-num-tokens 4096, media de tres iteraciones, warm-up descartado):

| Dispositivo | Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 56 tok/s | 12,5 tok/s | 4,74 s |
| Apple M4 Max (macOS) | GPU (Metal), `model_fp32act.litertlm` | 409 tok/s | 39,7 tok/s | 0,67 s |

Notas de reproducibilidad: las filas de GPU se repiten con una variación de aproximadamente el 1% entre invocaciones; las de CPU son más ruidosas (una repetición del control de 1B seis veces arrojó 29,0–33,3 tok/s de decodificación en CPU, por lo que la columna CPU debe leerse con un margen de ±7%).

Estado en dispositivos móviles:

| Dispositivo | Artefacto | Backend | Resultado |
|---|---|---|---|
| iPhone 17 Pro | `model_fp32act.litertlm` | GPU (Metal) | 8/8 preguntas; init de motor 6,77 s |
| iPhone 17 Pro | `model_fp32act.litertlm` | CPU | 8/8 preguntas; init de motor 2,53 s |
| Galaxy S26 (SM-S942Q / SM8850, Android 16) | `model_fp32act.litertlm` | LiteRT GPU | Ejecuta; 4716/4716 ops delegadas en 2 subgrafos; pico 2691 MiB |
| Galaxy S26 | `model.litertlm` | LiteRT GPU | No ejecuta; 4716/4716 ops delegadas, luego `<unk>` en generación; pico 1580 MiB |

Advertencias sobre estas cifras: el chequeo 8/8 en iPhone 17 Pro se ejecutó sin sampler configurado, por lo que usó el valor por defecto determinista del runtime y constituye un resultado greedy, no una puntuación de la configuración recomendada. La fila `iPhone 17 Pro | CPU | 3,2 tok/s` publicada antes del 2026-08-27 fue retirada porque su log de ejecución no se conservó. El artefacto `model.litertlm` no se ha probado en ese teléfono.

## Requisitos de hardware

- **VRAM / huella de memoria**: el artefacto int4 ocupa ~2,4 GB en disco; el pico de proceso medido en Galaxy S26 con `model.litertlm` fue de 1580 MiB y con `model_fp32act.litertlm` de 2691 MiB.
- **GPU recomendadas**: no hay datos publicados para A100, H100 o RTX 4090; el modelo está orientado a inferencia on-device y no se documenta su ejecución en GPUs de centro de datos.
- **GPU de consumo**: cabe en Apple Silicon (M4 Max probado) y en SoC móviles de gama alta (Snapdragon 8 Elite / SM8850 en Galaxy S26, Apple A-series en iPhone 17 Pro). No se documenta su comportamiento en RTX 4090 u otras GPUs de escritorio.
- **Opciones de despliegue**: LiteRT-LM (CLI `litert-lm`, `litert_lm_advanced_main`), runtime Android `com.google.ai.edge.litert:litert`, y WebGPU en navegador mediante la demo oficial. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 39,7 tok/s de decodificación y TTFT de 0,67 s en GPU Metal sobre M4 Max; 12,5 tok/s de decodificación y TTFT de 4,74 s en CPU sobre el mismo equipo. En Galaxy S26 no se publican filas de velocidad de forma deliberada: cada benchmark decodifica unos 3900 tokens por el razonamiento previo, lo que mantiene el teléfono ocupado más de media hora y provoca throttling medible (prefill 46,2 y luego 27,0 tok/s; init de motor 12,4 s y luego 29,2 s).
- **Nota de rendimiento**: el bucle duplica el cómputo por token, por lo que en CPU deben esperarse tasas de decodificación de clase 8B pese al tamaño 3B de los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.2-3B (esta build, litert-community) | 3B, 22 capas × 2 bucles | 4096 | `.litertlm`, LiteRT-LM | Apache-2.0 | Razonamiento con `<think>`; 90,0% GSM8K int4; on-device |
| Nanbeige/Nanbeige4.2-3B (original) | 3B, 22 capas × 2 bucles | no disponible | Pesos originales (transformers) | Apache-2.0 | Referencia bf16; 94,0% GSM8K; sin optimización on-device |
| Modelos de 3B densos convencionales | ~3B | variable | variable | variable | No se dispone de datos comparativos en la información proporcionada |

No se han publicado en la información disponible comparaciones con alternativas concretas de la misma categoría (mismo tamaño o misma tarea) más allá del modelo base original. Cualquier comparación con otras familias de 3B requeriría datos de benchmarks que aquí no se aportan.

## Limitaciones y advertencias

- **Riesgo de alucinación**: no se documenta ningún estudio específico; como todo modelo generativo con razonamiento, el bloque `<think>` puede contener cadenas plausibles pero incorrectas que el usuario tienda a aceptar por su apariencia de rigor.
- **Degradación por cuantización**: la build int4 pierde 4 puntos porcentuales en GSM8K frente a bf16 (90,0% frente a 94,0%, n=50). El tamaño muestral es reducido y el intervalo de confianza es amplio; no debe extrapolarse a otras tareas.
- **Contexto limitado**: 4096 tokens de caché KV es una ventana modesta para documentos largos o conversaciones multi-turno extensas, y además se reparte entre 44 slots por el desenrollado del bucle.
- **Idiomas no documentados**: la model card no declara la lista de idiomas soportados, por lo que no hay garantía de calidad fuera de los idiomas presentes en el entrenamiento original.
- **Sin datos de sesgos**: no se publica ninguna evaluación de sesgos, toxicidad o alineación.
- **Tool calling no confirmado**: la información disponible no documenta soporte de function calling, lo que limita su uso en pipelines de agentes.
- **Estado de ejecución dispar entre artefactos**: `model.litertlm` no ejecuta en el backend GPU del Galaxy S26 (falla con `<unk>` tras delegar las 4716 operaciones), mientras que `model_fp32act.litertlm` sí lo hace. La delegación es idéntica en ambos casos; el problema es el tipo de dato de las activaciones. Verificar el artefacto antes de desplegar en Android.
- **Cifras de iPhone no extrapolables**: el 8/8 en iPhone 17 Pro es un resultado greedy con el sampler por defecto, no una medida de la configuración recomendada ni una cifra de throughput.
- **Throttling en móvil**: ejecuciones largas en teléfono sufren degradación medible; los benchmarks de más de media hora no son representativos del rendimiento sostenido.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base Nanbeige4.2-3B por si hubiera condiciones adicionales no reflejadas en esta conversión.
- **Ecosistema acotado**: el formato `.litertlm` limita el despliegue a LiteRT-LM y Android; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Nanbeige4.2-3B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo de chat en navegador (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=hf://litert-community/Nanbeige4.2-3B/model_fp32act.litertlm
- Benchmark de referencia en Apple Silicon (resultados Android): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
