# IAMIbrahim/luthor-8b-mlx-8bit

## Resumen

Luthor 8B — MLX 8bit es la build cuantizada a 8 bits en formato MLX de Luthor 8B, un ajuste fino de Qwen3-8B especializado en manejar herramientas de terminal y de edición de ficheros dentro de un bucle de agente. Lo publica el usuario IAMIbrahim en HuggingFace bajo licencia Apache 2.0 y está pensado específicamente para Apple Silicon: el repositorio usa la librería `mlx` y pesos en safetensors cuantizados, con 8.190.735.360 parámetros totales y 8,1 GB en disco.

El modelo no introduce una arquitectura nueva: hereda el transformer denso de Qwen3-8B y su valor está en el post-entrenamiento orientado a *tool calling* con un formato de herramientas estilo Hermes (bloque `<tools>`, emisión de `<tool_call>` y espera de `<tool_response>`). Esta build concreta es la de mayor fidelidad de la familia de cuantizaciones publicadas por el mismo autor, a 8,500 bits por peso con grupo de 64, a cambio de ser también la más lenta: 10,6 tokens/s medidos en un Apple M3 con 24 GB de memoria unificada y un pico de 8,80 GB.

Es relevante ahora porque cubre un nicho muy concreto —agentes de codificación locales sobre portátiles Apple— y porque el propio autor documenta con transparencia los límites del proceso: la build `mixed_2_6` (3,284 bits por peso) fue descartada por degenerar en repeticiones, lo que ilustra que por debajo de ~4 bits por peso la cuantización *post-training* rompe este modelo. Aviso importante: el modelo está **entrenado pero no evaluado**; el benchmark de validación (*ship-gate*) no se ha ejecutado y el autor lo califica explícitamente de artefacto de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (ajuste fino de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 (aprox. 8,19 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 8 bits, group size 64, 8,500 bits/peso (build principal). La familia incluye también 6 bits, 4 bits y mixta 3-6 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors cuantizados en formato MLX (`mlx`, safetensors) |
| Modelo base | IAMIbrahim/luthor-8b |
| Tamaño en disco | 8,1 GB (repositorio: 8,7 GB) |
| Pico de memoria medido | 8,80 GB |
| Velocidad de generación | 10,6 tokens/s (Apple M3, 24 GB, `mlx-lm` 0.31.3, 150 tokens, `--temp 0.0`) |
| Estado | Entrenado, no evaluado (sin benchmark de validación) |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer denso, sobre el que se ha aplicado un ajuste fino orientado a agentes: manejo de herramientas de terminal y de edición de ficheros en bucle agéntico. La model card de esta build no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; toda esa información se remite a la model card del modelo base `IAMIbrahim/luthor-8b`, que no forma parte de los datos disponibles aquí. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, SSM híbrido) asociadas a esta build.

Lo específico de este repositorio es el proceso de cuantización: conversión *post-training* a MLX con `python -m mlx_lm convert --hf-path IAMIbrahim/luthor-8b --mlx-path luthor-8b-8bit -q --q-bits 8 --q-group-size 64`. El autor documenta que la cuantización post-entrenamiento por debajo de ~4 bits/peso degrada el modelo hasta producir repeticiones de tokens en lugar de texto coherente, y que alcanzar compresión de clase ternaria (~1,58 bits/peso, como Bonsai 2) requeriría entrenamiento consciente de la cuantización (*quantization-aware training*), no una simple conversión. En Apple Silicon la inferencia está limitada por ancho de banda de memoria, por lo que menos bits por peso implica más tokens por segundo: la build de 8 bits es la más fiel y la más lenta de la familia.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- *Tool calling* / *function calling* en formato Hermes: las herramientas se declaran en un bloque `<tools>` del mensaje de sistema, el modelo emite `<tool_call>` y espera una respuesta `<tool_response>`.
- Ejecución de herramientas de terminal y de edición de ficheros dentro de un bucle de agente (su objetivo declarado de entrenamiento).
- Razonamiento multi-paso orientado a resolución de tareas de ingeniería, por ejemplo diagnosticar un `ImportError` en una suite de tests.
- Integración con el ecosistema MLX en Python mediante `mlx_lm.load` / `mlx_lm.generate`.
- Capacidades de visión: no disponibles (no se declaran).
- Capacidades de audio: no disponibles (no se declaran).
- Modo *thinking* explícito: no documentado en la información disponible.
- Multilingüismo: limitado a inglés según el campo `language` del repositorio.

## Casos de uso

- Agente de terminal local en un Mac: el modelo puede recibir la descripción de un fallo (por ejemplo, un `ImportError` en la suite de tests) y encadenar llamadas a herramientas de shell para inspeccionar ficheros y proponer comandos, ejecutándose íntegramente en el portátil sin enviar código a la nube.
- Edición automática de ficheros en tareas de mantenimiento: gracias al formato `<tool_call>`/`<tool_response>`, se puede envolver un editor de texto o un *patcher* como herramienta y dejar que el modelo lea, modifique y verifique ficheros en pasos sucesivos.
- Asistente de depuración interactivo en el IDE: dado que el modelo está entrenado para razonar sobre errores de ejecución, encaja como copiloto que propone el siguiente paso de diagnóstico en lugar de limitarse a autocompletar código.
- Automatización de tareas de refactorización repetitivas: definir herramientas de búsqueda y sustitución y dejar que el modelo decida la secuencia de invocaciones sobre un árbol de directorios.
- Prototipado de agentes de codificación en investigación: al ser un artefacto de investigación con licencia Apache 2.0, sirve para experimentar con bucles agénticos, formatos de declaración de herramientas y políticas de parada sin ataduras de licencia.
- Pruebas comparativas de cuantización en Apple Silicon: la existencia de builds de 8, 6, 4 y mixta 3-6 bits con el mismo modelo base permite medir el compromiso entre fidelidad, memoria y velocidad (10,6 frente a 21,1 tokens/s) con una única variable.
- Despliegue de un asistente de operaciones en inglés sobre hardware de consumo: al requerir 8,80 GB de pico de memoria, cabe en equipos Apple con 16-24 GB de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo está «entrenado, no evaluado» y que el benchmark de validación (*ship-gate*) no se ha ejecutado, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto.

Los únicos datos medidos publicados son de rendimiento en inferencia, no de calidad:

| Build | Tamaño | Bits/peso | Tokens/s | RAM pico |
|---|---|---|---|---|
| `-mlx-8bit` (esta) | 8,1 GB | 8,500 | 10,6 | 8,80 GB |
| `-mlx-6bit` | 6,2 GB | 6,500 | 13,8 | 6,77 GB |
| `-mlx-4bit` | 4,3 GB | 4,500 | 19,2 | 4,79 GB |
| `-mlx-mixed-3-6` | 3,9 GB | 4,088 | 21,1 | 4,38 GB |

Medición realizada en un Apple M3 (24 GB) con `mlx-lm` 0.31.3, generación de 150 tokens a `--temp 0.0`.

## Requisitos de hardware

- VRAM / memoria unificada: pico medido de 8,80 GB para la build de 8 bits. Presupuesto práctico de ~10 GB de memoria libre para trabajar con holgura.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y posteriores). MLX no se ejecuta sobre CUDA, ROCm ni CPU x86 convencional.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con 16 GB de memoria unificada como mínimo y 24 GB recomendados; el autor reporta la medición en un M3 de 24 GB. No aplica a GPU de consumo NVIDIA/AMD por falta de soporte de MLX.
- Opciones de despliegue: `mlx-lm` (versión usada en la medición: 0.31.3) mediante `mlx_lm.generate` o la API de Python `from mlx_lm import load, generate`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y *throughput*: 10,6 tokens/s medidos en Apple M3 con 24 GB, generación de 150 tokens y temperatura 0. Es la build más lenta de la familia; la de 4 bits alcanza 19,2 tokens/s y la mixta 3-6, 21,1 tokens/s, siempre con la misma limitación por ancho de banda de memoria.
- Almacenamiento: 8,1 GB de pesos (repositorio completo de 8,7 GB).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros en la información proporcionada. La comparación más significativa es interna, entre las builds del propio modelo y su versión base sin cuantizar:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `luthor-8b-mlx-8bit` | 8,19 B | no disponible | 10,6 tok/s, 8,80 GB pico | Apache 2.0 | HuggingFace (0 descargas) |
| `luthor-8b-mlx-6bit` | no disponible | no disponible | 13,8 tok/s, 6,77 GB pico | Apache 2.0 | HuggingFace |
| `luthor-8b-mlx-4bit` | no disponible | no disponible | 19,2 tok/s, 4,79 GB pico | Apache 2.0 | HuggingFace |
| `luthor-8b-mlx-mixed-3-6` | no disponible | no disponible | 21,1 tok/s, 4,38 GB pico | Apache 2.0 | HuggingFace |
| `luthor-8b` (base, sin cuantizar) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de terceros (mismo tamaño o tarea) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la búsqueda web modelos comparables documentados con datos verificables, por lo que no se incluyen cifras de rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara explícitamente que el benchmark de validación no se ha ejecutado y que debe tratarse como artefacto de investigación. No es apto para producción sin una evaluación propia.
- Riesgo de alucinación: no cuantificado. En tareas de agente sobre terminal y ficheros, una alucinación puede traducirse en comandos o ediciones destructivas, por lo que se recomienda ejecución en sandbox y revisión humana.
- Sesgos: no documentados en la información disponible.
- Idioma: soporte declarado únicamente en inglés (`en`); no hay garantía de comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto: no especificada en la model card de esta build. Al ser un ajuste fino de Qwen3-8B, conviene verificar el valor real antes de diseñar flujos con contexto largo.
- Degradación por cuantización: por debajo de ~4 bits/peso la cuantización post-training rompe el modelo (la build `mixed_2_6` se descartó por repetir tokens). Esta build de 8 bits es la más segura de la familia, pero también la más lenta.
- Formato de herramientas rígido: las herramientas deben declararse exactamente como en el entrenamiento (bloque `<tools>` estilo Hermes) y el modelo espera `<tool_response>` como respuesta; cualquier desviación del protocolo degrada el comportamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `IAMIbrahim/luthor-8b` y de Qwen3-8B, ya que la model card de esta build no las reproduce.
- Dependencia de plataforma: solo Apple Silicon. No hay ruta de despliegue documentada para CUDA ni CPU x86 en la información disponible.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni informes independientes que validen su comportamiento.
- Fecha de creación del repositorio (2026-09-20) posterior a la fecha habitual de referencia; conviene confirmar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-8bit
- Modelo base: https://huggingface.co/IAMIbrahim/luthor-8b
- Build de 6 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-6bit
- Build de 4 bits: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-4bit
- Build mixta 3-6: https://huggingface.co/IAMIbrahim/luthor-8b-mlx-mixed-3-6
- Referencia sobre cuantización ternaria citada por el autor (Bonsai 2): https://www.mindstudio.ai/blog/bonsai-2-27b-ternary-quantization
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: únicamente páginas de ayuda de YouTube y contenidos sin relación, por lo que no se añaden más enlaces.
