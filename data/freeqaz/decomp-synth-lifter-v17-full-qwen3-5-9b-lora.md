# freeqaz/decomp-synth-lifter-v17-full-qwen3.5-9b-lora

## Resumen

`decomp-synth-lifter-v17-full-qwen3.5-9b-lora` es un adaptador LoRA que afina el modelo base `Qwen/Qwen3.5-9B` para la tarea de **decompilación byte-exacta** de código C++ compilado para PowerPC (Xbox 360). Lo desarrolla Free Wortley (`freeqaz`) dentro del proyecto `decomp-synth`, un motor de búsqueda y aprendizaje automático que reconstruye binarios comerciales de consola hasta que el compilador original, con las mismas opciones, reproduce el código máquina de venta al por menor de forma idéntica.

Este adaptador es la primera generación de su familia entrenada con **trayectorias multi-turno de uso de herramientas**: un agente profesor (GLM-5.3-flash) interactúa con herramientas reales de compilación y comparación (objdiff), y esas sesiones verificadas se convierten en filas de entrenamiento. El modelo se entrena para emitir razonamiento en el canal `thinking` nativo de Qwen3.5 y llamadas a herramientas en formato XML, de modo que un parser de herramientas estándar de vLLM puede interpretar exactamente lo que el modelo aprendió a generar.

El adaptador se publica como artefacto de investigación con una advertencia explícita: **aún no ha sido evaluado**. El entrenamiento terminó el 2026-08-31 y la evaluación multi-turno del proyecto está en curso. El tamaño del repositorio es de 0,4 GB y la licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) + LoRA r=32, α=64, dropout 0.05, all-linear, bf16 |
| Parametros totales | 9 mil millones (modelo base) + adaptador LoRA (~0,4 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 90.112 tokens (max_seq, sin filas descartadas) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bf16; el base puede cuantizarse) |
| Idiomas soportados | no disponible (el corpus es código C++ y desensamblado, no texto natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza el método LoRA con r=32, α=64, dropout 0.05, aplicado a todas las capas lineales del modelo base Qwen3.5-9B, en precisión bf16. El corpus de entrenamiento consta de 3.032 filas de trayectorias de herramientas (`v17full.jsonl`, sha256 `411cfaed…`), generadas por un agente profesor (GLM-5.3-flash) que trabaja sobre objetivos de decompilación de un esfuerzo privado de reconstrucción de *Halo: Combat Evolved Anniversary* (Xbox 360). Las trayectorias incluyen secuencias de escritura de código, fallos de compilación, diagnósticos y recuperación, algo que no existe en corpus minados porque los estados minados compilan por construcción.

El entrenamiento se realizó durante 2 épocas, 190 pasos, con batch efectivo de 32, LR lineal y semilla 42. Las filas se convirtieron a nivel de turno de herramienta, con separación de validación a nivel de unidad de traducción, y se renderizaron con la plantilla de chat propia de Qwen3.5-9B, con el modo `thinking` activado y llamadas a herramientas en XML nativo. La pérdida de entrenamiento bajó de 1,03 a 0,52, aunque esto es una lectura de supervisión, no una afirmación de evaluación.

## Capacidades

- **Decompilación byte-exacta**: genera código C++ que, al recompilarse con el compilador original y las mismas opciones, reproduce el código máquina de venta al por menor de forma idéntica.
- **Uso de herramientas (tool calling)**: entrenado para emitir llamadas a herramientas en formato XML nativo de Qwen3.5, compatible con el parser de vLLM.
- **Razonamiento multi-turno**: puede leer desensamblado, proponer C++, compilar con la cadena de herramientas real y reaccionar al feedback de objdiff en secuencias de hasta 8 turnos.
- **Generación de código C++**: especializado en código C++ para PowerPC, con conocimiento del compilador vintage y sus peculiaridades.
- **Modo agente**: diseñado para servirse detrás de un endpoint compatible con OpenAI con tool calling habilitado.
- **Capacidades multilingües**: no disponible; el corpus es exclusivamente código y desensamblado, no texto natural.

## Casos de uso

- **Reconstrucción de binarios de consolas retro**: el caso principal. Un agente equipado con este adaptador puede trabajar sobre binarios de Xbox 360, GameCube o Wii, proponiendo reescrituras de C++ que se verifican contra el compilador original.
- **Preservación de software**: proyectos de conservación de videojuegos comerciales que necesitan reconstruir el código fuente original a partir del binario, como el propio proyecto de *Halo: Combat Evolved Anniversary*.
- **Ingeniería inversa asistida por agentes**: flotas de agentes de IA que colaboran en paralelo sobre un mismo binario, cada uno con herramientas de compilación y diff, coordinados por un orquestador.
- **Automatización de análisis de malware**: aunque el foco es PowerPC, la metodología de verificación por compilación puede aplicarse a otros arquitecturas si se adapta el adaptador.
- **Generación de código C++ con verificación por compilación**: en entornos donde se requiere que el código generado compile exactamente con un compilador específico, este adaptador puede servir como asistente de codificación con feedback del compilador.
- **Investigación en decompilación con LLMs**: como artefacto de investigación, permite estudiar el efecto del entrenamiento con trayectorias multi-turno frente a pares de un solo turno (comparación con la rama `v17-matched`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el adaptador no ha sido evaluado todavía y que la evaluación multi-turno del proyecto está en curso. Hasta que se publiquen números, el adaptador `v14-evalformat` sigue siendo la opción medida para el bucle de feedback multi-turno.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base Qwen3.5-9B en bf16 requiere aproximadamente 18 GB de VRAM. El adaptador LoRA añade unos 0,4 GB adicionales. Con cuantización del base (por ejemplo, GGUF Q4_K_M) se puede reducir a unos 6-7 GB.
- **GPU recomendadas**: para bf16 completo, una RTX 3090, RTX 4090, A100 o H100. Para cuantización, una RTX 3060 de 12 GB o superior puede ser suficiente.
- **Cabe en consumer GPU**: sí, con cuantización del modelo base. Sin cuantizar, requiere una GPU de 24 GB o más.
- **Opciones de despliegue**: vLLM (recomendado por el autor, con tool calling), transformers + PEFT, llama.cpp si se convierte el adaptador a GGUF, o cualquier servidor compatible con OpenAI.
- **Latencia y throughput**: no disponible. Depende del hardware y de la longitud de las trayectorias (hasta 90.112 tokens de contexto).

## Comparativa con modelos similares

| Modelo | Base | Método | Contexto | Estado |
|---|---|---|---|---|
| `decomp-synth-lifter-v17-full-qwen3.5-9b-lora` | Qwen3.5-9B | LoRA r=32 | 90.112 tokens | Sin evaluar |
| `decomp-synth-lifter-v14-evalformat-qwen3.5-9b-lora` | Qwen3.5-9B | LoRA | no disponible | Evaluado (medida para multi-turno) |
| `decomp-synth-lifter-v16-v5chat-qwen3.5-9b-lora` | Qwen3.5-9B | LoRA | no disponible | no disponible |
| `decomp-synth-lifter-gtp0c-qwen3.8-27b-lora` | Qwen3.8-27B | LoRA | no disponible | no disponible |

No se dispone de comparación con modelos de decompilación fuera de la familia `decomp-synth`. La comparación interna muestra que `v17-full` es la primera generación con entrenamiento multi-turno, mientras que las anteriores usaban pares de un solo turno.

## Limitaciones y advertencias

- **Sin evaluación publicada**: el autor declara explícitamente que no se ha ejecutado ninguna evaluación sobre este adaptador. Cualquier uso en producción debe esperar a los resultados de la evaluación multi-turno.
- **Corpus privado**: los datos de entrenamiento provienen de un esfuerzo privado de reconstrucción de *Halo: Combat Evolved Anniversary* y no se publican. No se hace ninguna afirmación de licencia sobre el corpus.
- **Entrenamiento con una sola semilla**: el resultado es provisional bajo la regla multi-semilla del proyecto. La comparación `full` vs `matched` (filtrado por byte-exacto) es deliberada, pero no concluyente.
- **Sesgos del profesor**: las trayectorias fueron generadas por GLM-5.3-flash, por lo que el adaptador puede heredar sesgos o errores del modelo profesor.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar código C++ incorrecto o plausible pero no verificable. La verificación por compilación es obligatoria.
- **Alcance limitado**: especializado en PowerPC C++ y en el flujo de trabajo de decompilación con objdiff. No es un modelo de propósito general.
- **Restricciones de licencia**: el adaptador es Apache-2.0, pero el corpus de entrenamiento no está publicado ni licenciado. El uso comercial del adaptador está permitido, pero el usuario debe ser consciente de que los datos subyacentes no son públicos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/freeqaz/decomp-synth-lifter-v17-full-qwen3.5-9b-lora)
- [Adaptador v14-evalformat (evaluado)](https://huggingface.co/freeqaz/decomp-synth-lifter-v14-evalformat-qwen3.5-9b-lora)
- [Adaptador v16-v5chat](https://huggingface.co/freeqaz/decomp-synth-lifter-v16-v5chat-qwen3.5-9b-lora)
- [Adaptador gtp0c-qwen3.8-27b](https://huggingface.co/freeqaz/decomp-synth-lifter-gtp0c-qwen3.8-27b-lora)
- [Repositorio decomp-synth en GitHub](https://github.com/freeqaz/decomp-synth)
- [Documentación de decomp-synth](https://github.com/freeqaz/decomp-synth/tree/main/docs)
- [Blog: How agent swarms decompile games byte-for-byte](https://www.freeqaz.com/blog/how-agent-swarms-decompile-games)
- [Blog: LLM-assisted decompilation: tools, not prompts](https://www.freeqaz.com/blog/llm-assisted-decompilation)
- [Blog: Forking the decompilation toolchain](https://www.freeqaz.com/blog/forking-the-decompilation-toolchain)
- [Blog: Infrastructure for running agent swarms](https://www.freeqaz.com/blog/infrastructure-for-agent-swarms)
- [objdiff](https://github.com/encounter/objdiff)
