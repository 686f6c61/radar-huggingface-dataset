# Kevletesteur/Qwen3.8-Flash-Next-StrixHalo-Verified

## Resumen

Qwen3.8-Flash-Next-StrixHalo-Verified es un repositorio de verificación e inferencia, no un modelo con pesos propios. Lo publica el usuario Kevletesteur y contiene el runtime, los scripts de compilación y los resultados de benchmarks necesarios para ejecutar el modelo Qwen3.8-Flash-Next (125B de parámetros totales, arquitectura MoE) sobre una única máquina AMD Strix Halo (Ryzen AI Max+ 395 con 128 GB de memoria unificada), usando un fork de llama.cpp sobre ROCm/HIP.

El interés del repositorio reside en que documenta con detalle cómo servir un modelo de 125B en hardware de consumo profesional sin GPU dedicada de gran VRAM, apoyándose en memoria unificada y en decodificación especulativa con MTP (multi-token prediction). El autor compara su runtime contra el motor Gufo 0.31 sobre el mismo equipo, con métricas de prefill, decode y fidelidad frente a logits de referencia en BF16.

La relevancia actual es doble: por un lado, demuestra la viabilidad de inferencia local de modelos MoE grandes en un solo equipo AMD; por otro, introduce una metodología de validación basada en divergencia KL y coincidencia top-1 frente a BF16, más rigurosa que la perplejidad habitual. El repositorio no aloja pesos; remite a la cuantización UD-Q4_K_XL de Unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) |
| Parámetros totales | 125B (modelo base Qwen3.8-Flash-Next) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se miden prefill a 1k, 4k y 16k tokens; no se declara el máximo) |
| Tipos de cuantización | UD-Q4_K_XL (Unsloth), GGUF |
| Idiomas soportados | en |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (los pesos no se alojan en este repositorio) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3.8-Flash-Next, es un transformer con mezcla de expertos (MoE) de 125B parámetros totales. El repositorio no documenta el número de parámetros activos por token, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO; esa información corresponde a la model card del modelo base, no incluida en la información disponible.

La aportación técnica del repositorio es el runtime: un único parche sobre el fork público GSQHalo.cpp, compilado con ROCm/HIP para la GPU integrada gfx1151 de Strix Halo. Incluye decodificación especulativa mediante MTP, gestión de memoria unificada y un script de compilación que verifica que el árbol de fuentes parcheado coincide byte a byte con el medido (hash de árbol git `a5106d68…`). El autor valida la fidelidad numérica frente a logits BF16: en un pasaje de código de 747 tokens obtiene divergencia KL de 0,121 y coincidencia top-1 del 91,3 % en la ruta por lotes (0,170 y 89,7 % en la ruta token a token).

## Capacidades

- Generación de texto en inglés, con modo de razonamiento configurable (el autor cita `reasoning xhigh`).
- Soporte de tool calling y function calling, orientado a bucles de agentes de código.
- Razonamiento multi-paso y ejecución de tareas de agente en sandbox (20/20 tareas resueltas en dos pasadas de 10).
- Decodificación especulativa con MTP para acelerar la escritura en bucles de agente.
- Servicio concurrente de hasta 4 slots en este runtime (Gufo sirve 8 sesiones).
- Copia y transformación de archivos con reescritura exacta de identificadores (4/4 aciertos).
- Capacidades multilingües: solo inglés declarado; no se documentan otros idiomas.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Bucles de agente de código en local: el runtime está ajustado para tareas de agente con tool calling y decodificación especulativa, con 42–59 tok/s en escritura según la tarea (46,6 tok/s en código), suficiente para iteraciones interactivas sin depender de la nube.
- Sustitución de identificadores y refactorizaciones mecánicas: la copia de archivos con dos renombrados se resuelve a 75–78 tok/s con exactitud 4/4, útil para tareas de reescritura repetitiva en pipelines.
- Inferencia on-premise con requisitos de privacidad: un único equipo de 128 GB de memoria unificada sirve un modelo de 125B sin GPU dedicada, lo que encaja en entornos donde los datos no pueden salir de la instalación.
- Evaluación de motores de inferencia: el repositorio incluye arnés de benchmarks, comparación pareada contra Gufo 0.31 y métricas de divergencia KL, reutilizable para validar otros runtimes sobre el mismo hardware.
- Procesamiento de prompts largos en local: el prefill medido alcanza 783 tok/s a 1k, 1.286 tok/s a 4k y 1.516 tok/s a 16k, adecuado para analizar documentos o contextos de código extensos antes de generar.
- Despliegue con múltiples agentes concurrentes: con 4 slots, el runtime completa 10 tareas en dos pasadas (C1 y C8) en 594/645 s, útil para orquestaciones moderadas; para 8 sesiones simultáneas el autor recomienda Gufo, más rápido en ese escenario.
- Reproducción de resultados en investigación: el script de compilación verifica el árbol de fuentes y el autor confirma que una compilación desde cero reproduce las mismas salidas greedy (5/5 textos, misma llamada a herramienta, mismo top-1 en 13/13), lo que facilita auditorías.

## Benchmarks y rendimiento

Datos publicados por el autor para este runtime sobre un Ryzen AI Max+ 395 con 128 GB de memoria unificada:

| Métrica | Resultado |
|---|---|
| Prefill, prompt de 1k tokens | 783 tok/s |
| Prefill, prompt de 4k tokens | 1.286 tok/s |
| Prefill, prompt de 16k tokens | 1.516 tok/s |
| Decode en bucle de agente (código) | 46,6 tok/s |
| Decode en bucle de agente (reescritura) | 58,7 tok/s |
| Decode en copia de archivo con dos renombrados | 75–78 tok/s |
| Divergencia KL vs BF16, pasaje de código (ruta por lotes) | 0,121 |
| Coincidencia top-1 vs BF16 (ruta por lotes) | 91,3 % |
| Divergencia KL vs BF16, pasaje de código (token a token) | 0,170 |
| Coincidencia top-1 vs BF16 (token a token) | 89,7 % |
| Tareas de agente en sandbox (2 pasadas de 10) | 20/20 resueltas |
| Mejora de prefill a 32k frente al runtime Vulkan previo | 539,5 → 1.550 tok/s (×2,9) |

Comparación pareada contra Gufo 0.31 en el mismo equipo (N G N G, 2 pasadas): Gufo es más rápido en prefill (+54 % a 1k, +34 % a 4k, +9 % a 16k) y en la mayoría de tareas de escritura (+5 a +21 %, +20–25 % en copia de archivos); este runtime empata en código (46,6 vs 46,5 tok/s) y supera en prosa (+9 %). Suma de tiempos medianos sobre 8 tareas: 217,6 s frente a 198,9 s. Con 8 agentes simultáneos: 594/645 s frente a 361/464 s. Las diferencias de fidelidad no alcanzan significación estadística (z entre −1,71 y +1,12).

## Requisitos de hardware

- Equipo de referencia: AMD Ryzen AI Max+ 395 (Strix Halo, GPU integrada gfx1151) con 128 GB de memoria unificada.
- VRAM estimada: no disponible de forma explícita; el modelo se sirve en memoria unificada con la cuantización UD-Q4_K_XL (tamaño exacto del archivo no indicado en la información disponible).
- GPU dedicadas (A100, H100, RTX 4090): no se documentan pruebas en la información disponible.
- Cabe en GPU de consumo: el caso validado es una GPU integrada con memoria unificada, no una GPU discreta de consumo.
- Backend: ROCm/HIP sobre el fork GSQHalo.cpp de llama.cpp, con un único parche; requiere compilación desde fuentes.
- Despliegue: llama.cpp (fork GSQHalo.cpp); no se documentan vLLM, TGI ni Ollama.
- Concurrencia: 4 slots en este runtime.
- Throughput y latencia: ver tabla de benchmarks.

## Comparativa con modelos similares

| Aspecto | Este runtime (llama.cpp/HIP) | Gufo 0.31 | Runtime Vulkan previo (tag v1-vulkan) |
|---|---|---|---|
| Modelo servido | Qwen3.8-Flash-Next 125B MoE, UD-Q4_K_XL | Mismo modelo y pesos | Mismo modelo y pesos |
| Hardware | Strix Halo, 128 GB unificados | Strix Halo, 128 GB unificados | Strix Halo, 128 GB unificados |
| Prefill 1k / 4k / 16k (tok/s) | 783 / 1.286 / 1.516 | +54 % / +34 % / +9 % frente a este runtime | no disponible |
| Decode en código (tok/s) | 46,6 | 46,5 | no disponible |
| Prefill a 32k (tok/s) | 1.550 | no disponible | 539,5 |
| Sesiones concurrentes | 4 | 8 | no disponible |
| Fidelidad vs BF16 | KL 0,121; top-1 91,3 % | Sin diferencia significativa frente a este runtime | no disponible |
| Licencia del runtime | MIT (según badge de la model card) | MIT | MIT |

## Limitaciones y advertencias

- El repositorio no contiene pesos; es un runtime y un conjunto de resultados. Sin descargar la cuantización de Unsloth el repositorio no es utilizable por sí solo.
- Solo se declara inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El modelo subyacente puede alucinar, especialmente en tareas de razonamiento largo con temperatura 1; el autor no publica tasas de alucinación.
- La licencia qwen-community-1.0 impone condiciones adicionales para uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- El runtime está validado únicamente en gfx1151 (Strix Halo) con ROCm/HIP; no hay garantías en otras GPU ni en otros backends.
- Con 8 agentes concurrentes el rendimiento cae frente a Gufo (594/645 s frente a 361/464 s); el autor no lo recomienda para esa carga.
- Las métricas de decode se tomaron con temperatura 1, top-k 20, top-p 0,95 y min-p 0,05; no son directamente comparables con ajustes greedy.
- El autor indica que la ventaja en tareas de un solo agente proviene de menos turnos, no de mayor velocidad por token, y no la considera concluyente.
- Sesgos conocidos del modelo base: no documentados en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kevletesteur/Qwen3.8-Flash-Next-StrixHalo-Verified
- Runtime en GitHub: https://github.com/AIdevsmartdata/strixhalo-verified
- Tag del runtime Vulkan previo: https://github.com/AIdevsmartdata/strixhalo-verified/tree/v1-vulkan
- Fork GSQHalo.cpp: https://github.com/Aristo94/GSQHalo.cpp
- Motor Gufo: https://github.com/gufo-org/gufo
- Cuantización UD-Q4_K_XL de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
