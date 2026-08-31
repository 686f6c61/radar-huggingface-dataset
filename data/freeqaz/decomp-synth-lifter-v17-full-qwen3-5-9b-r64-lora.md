# freeqaz/decomp-synth-lifter-v17-full-qwen3.5-9b-r64-lora

## Resumen

Este adaptador LoRA (r=64, α=128) sobre el modelo base Qwen/Qwen3.5-9B está especializado en decompilación asistida por IA: reconstruir código fuente C++ a partir de binarios de juegos comerciales (arquitectura PowerPC, Xbox 360) de forma que el compilador original, con sus flags originales, reproduzca el código máquina byte a byte. Lo desarrolla freeqaz dentro del proyecto decomp-synth, que en una campaña previa logró hacer coincidir byte a byte más de 44.000 funciones de un binario comercial de Xbox 360 en unas diez semanas, con cada propuesta validada por el compilador real y la herramienta objdiff, nunca por el propio modelo.

Es la variante r=64 de un par de gemelos entrenados sobre un corpus idéntico de 3.032 trayectorias multi-turno de uso de herramientas, generadas por un agente profesor (GLM-5.3-flash) que opera las herramientas reales de compilación y comparación del proyecto. El adaptador se publica como artefacto de investigación para estudiar si duplicar la capacidad del adaptador (r32 → r64) aporta algo sobre este tipo de datos, tras experimentos previos (v13, v16) que dieron resultados nulos.

Es importante señalar que este adaptador no ha sido evaluado todavía: no hay ninguna cifra de rendimiento publicada. La pérdida de entrenamiento bajó de 1,03 a 0,48 en 190 pasos, pero el propio autor la describe como una lectura de supervisión, no como una medida de capacidad. Para trabajo real de decompilación, el autor recomienda el gemelo r32 o la variante v14-evalformat, que sí tiene evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=64, α=128, dropout 0,05, all-linear, bf16) sobre Qwen/Qwen3.5-9B (transformer decoder-only) |
| Parametros totales | Modelo base: 9B; adaptador: ~660 MiB en safetensors (parámetros entrenables no publicados) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 90.112 tokens (max_seq del entrenamiento) |
| Tipos de cuantizacion | no disponible (adaptador en bf16; el modelo base admite cuantización estándar 8/4 bits) |
| Idiomas soportados | no disponible (el adaptador opera sobre código, ensamblador y C++; el modelo base Qwen3.5-9B es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador usa LoRA con rango 64 y alpha 128 (escala α/r = 2,0), dropout 0,05, aplicado a todas las capas lineales del modelo base Qwen3.5-9B en precisión bf16. El modelo base es un transformer decoder-only de 9.000 millones de parámetros con plantilla de chat propia de Qwen3.5, que incluye un canal de razonamiento nativo (`thinking`) y llamadas a herramientas en formato XML.

El corpus de entrenamiento (`v17full.jsonl`, sha256 `411cfaed…`) contiene 3.032 filas de trayectorias multi-turno de uso de herramientas: un agente profesor (GLM-5.3-flash) trabaja objetivos de decompilación del proyecto privado de reconstrucción de Halo: Combat Evolved Anniversary (Xbox 360) a través de un arnés de compilación y puntuación real —lee desensamblado, propone C++, compila con el toolchain original y reacciona a la realimentación de objdiff en hasta 8 turnos—. Las trayectorias se convierten a granularidad de turno de herramienta, se separan por unidad de traducción frente a los conjuntos de evaluación del proyecto y se renderizan con la plantilla de chat de Qwen3.5-9B.

El entrenamiento usó 2 épocas, 190 pasos de optimizador, tamaño de lote efectivo 32, LR lineal y semilla 42. La pérdida bajó de 1,03 a 0,48 (mínimo 0,42), frente al 0,52 del gemelo r32; el autor indica que esa pequeña diferencia no es evidencia de capacidad. El término "full" indica que se incluyeron todas las filas admisibles, incluidas sesiones de profesor que no terminaron con coincidencia byte exacta; el filtro de solo coincidencia exacta es la variante hermana `v17-matched`.

## Capacidades

- Decompilación asistida de binarios PowerPC (Xbox 360): propone código C++ a partir de desensamblado.
- Uso de herramientas en múltiples turnos: llamadas a herramientas en formato XML nativo de Qwen3.5, pensadas para integrarse en un arnés de compilación y comparación.
- Razonamiento en canal nativo `thinking` antes de emitir propuestas de código.
- Reacción a realimentación del compilador y de objdiff (diferencias byte a byte) para iterar sobre sus propias propuestas.
- Generación de código C++ orientado a reproducir exactamente el código máquina original con el compilador vintage y sus flags originales.
- No se han publicado evaluaciones que confirmen capacidades concretas más allá de la pérdida de entrenamiento.

## Casos de uso

- Reconstrucción de binarios de juegos retro para preservación: el caso central del proyecto; el adaptador se usa dentro de un bucle agente-herramienta donde cada propuesta se valida con el compilador real y objdiff, nunca por el propio modelo.
- Ingeniería inversa de firmware o software embebido PowerPC: puede aplicarse a binarios de consolas o sistemas empotrados con la misma metodología de compilación y diff, adaptando el arnés de validación.
- Asistencia a equipos de preservación de videojuegos: generar propuestas iniciales de C++ que los revisores humanos corrigen, reduciendo el trabajo manual de anotación sobre binarios grandes.
- Estudio de escalado de adaptadores LoRA: al ser un gemelo entrenado con rango doble sobre el mismo corpus, sirve para investigar si la capacidad adicional del adaptador aporta algo en tareas de decompilación multi-turno.
- Entrenamiento de agentes de código con realimentación de herramientas: el formato de trayectorias multi-turno con llamadas XML puede reutilizarse como plantilla para otros dominios de ingeniería inversa.
- Benchmarking de metodologías de evaluación: al no estar evaluado, sirve como artefacto para comparar protocolos de evaluación de adaptadores de decompilación frente a su gemelo r32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que ninguna evaluación se ha ejecutado sobre este adaptador ni sobre ninguna variante v17. La única métrica publicada es la pérdida de entrenamiento (1,03 → 0,48, mínimo 0,42), que el propio autor describe como una lectura de supervisión, no una afirmación de capacidad. No se deben inferir cifras de MMLU, HumanEval, GSM8K ni de calidad de decompilación a partir de estos datos.

## Requisitos de hardware

- El adaptador añade ~660 MiB sobre el modelo base; el coste dominante es Qwen3.5-9B.
- Inferencia en bf16: ~18-19 GB de VRAM (cabe en una RTX 4090 de 24 GB, A10G, A100 de 40 GB, etc.). Estimación basada en el tamaño del modelo base.
- Con cuantización 8 bits: ~10-11 GB de VRAM (RTX 3080/4080 de 12 GB o superior). Estimación.
- Con cuantización 4 bits: ~6-7 GB de VRAM (RTX 3060/4060 de 8 GB o superior). Estimación.
- Despliegue: transformers + PEFT (carga con `PeftModel.from_pretrained`), vLLM con soporte LoRA, o conversión a GGUF con llama.cpp/Ollama para entornos de consumo.
- Latencia y throughput: no disponibles; dependen del hardware, de la cuantización del modelo base y de la longitud de las trayectorias (hasta ~90.000 tokens).

## Comparativa con modelos similares

| Modelo | Tipo | Rango LoRA | Corpus | Evaluación | Estado |
|---|---|---|---|---|---|
| v17-full r64 (este) | LoRA sobre Qwen3.5-9B | r=64, α=128 | 3.032 filas (idéntico al r32, sha `411cfaed…`) | ninguna publicada | artefacto de investigación |
| v17-full r32 | LoRA sobre Qwen3.5-9B | r=32, α=64 | 3.032 filas (idéntico, sha `411cfaed…`) | ninguna publicada | publicación primaria del par |
| v14-evalformat | LoRA sobre Qwen3.5-9B | no disponible | no disponible | sí; opción medida para el bucle de realimentación multi-turno | recomendado para trabajo real |
| Qwen/Qwen3.5-9B (base) | transformer denso 9B | — | — | benchmarks propios de Qwen | modelo base sin especialización |

Nota: los experimentos previos de escalado de rango (v13, v16) dieron resultados nulos: duplicar la capacidad del adaptador no compró nada detectable a 9B con datos fijos. El autor advierte que este par aún no tiene veredicto porque ninguna variante v17 ha sido evaluada.

## Limitaciones y advertencias

- No evaluado: no hay ninguna cifra de rendimiento publicada; no debe usarse en producción sin validación propia.
- La pérdida de entrenamiento (0,48) no es evidencia de capacidad; el autor lo declara explícitamente.
- El corpus de entrenamiento no está publicado ni tiene licencia declarada: procede de un esfuerzo privado de reconstrucción de Halo: Combat Evolved Anniversary y no se puede verificar su contenido ni su composición.
- El término "full" incluye trayectorias que no terminaron con coincidencia byte exacta, lo que puede degradar la calidad de las propuestas frente a la variante "matched".
- Entrenado con una sola semilla (42); cualquier veredicto futuro sobre r32 vs r64 es provisional bajo la regla multi-semilla del proyecto.
- El adaptador es ~2× el tamaño del r32 (660 MiB vs 330 MiB) para, según la evidencia previa de escalado de rango, probablemente la misma capacidad: preferir el r32 para trabajo real de decompilación.
- Riesgo de alucinación propio de los LLM: las propuestas de C++ deben validarse siempre con el compilador real y objdiff, nunca confiar en la salida del modelo.
- Limitado a la tarea de decompilación C++/PowerPC; no se han documentado sus capacidades fuera de ese dominio.
- La licencia apache-2.0 cubre el adaptador, pero el corpus de entrenamiento no tiene licencia declarada, lo que puede plantear dudas para uso comercial derivado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/freeqaz/decomp-synth-lifter-v17-full-qwen3.5-9b-r64-lora
- Gemelo r32 (publicación primaria del par): https://huggingface.co/freeqaz/decomp-synth-lifter-v17-full-qwen3.5-9b-lora
- Variante evaluada v14-evalformat: https://huggingface.co/freeqaz/decomp-synth-lifter-v14-evalformat-qwen3.5-9b-lora
- Variante v13-chain r64: https://huggingface.co/freeqaz/decomp-synth-lifter-v13-chain-qwen3.5-9b-r64-lora
- Variante v16-v5chat: https://huggingface.co/freeqaz/decomp-synth-lifter-v16-v5chat-qwen3.5-9b-lora
- Proyecto decomp-synth (GitHub): https://github.com/freeqaz/decomp-synth
- Documentación de arquitectura: https://github.com/freeqaz/decomp-synth/tree/main/docs
- Artículo principal del proyecto: https://www.freeqaz.com/blog/how-agent-swarms-decompile-games
- Metodología: https://www.freeqaz.com/blog/llm-assisted-decompilation
- Herramienta de comparación objdiff: https://github.com/encounter/objdiff
