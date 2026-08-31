# freeqaz/decomp-synth-lifter-v17-mix-qwen3.5-9b-lora

## Resumen

`decomp-synth-lifter-v17-mix-qwen3.5-9b-lora` es un adaptador LoRA (r=32) que ajusta el modelo base `Qwen/Qwen3.5-9B` para la tarea de **decompilación byte-exacta de binarios PowerPC C++** (específicamente de juegos de Xbox 360). El autor, `freeqaz`, lo publica como artefacto de investigación dentro del proyecto `decomp-synth`, un motor que combina búsqueda de reescrituras C++ que preservan comportamiento con validación mediante compiladores reales y la herramienta `objdiff`. La versión v17-mix combina el corpus de trayectorias multi-turno generadas por un profesor (GLM-5.3-flash) con líneas de suministro de un solo turno procedentes de bundles verificados, cadenas de reparación y ediciones de proyectos de decompilación públicos.

Este adaptador es relevante porque aborda un problema muy específico: reconstruir código fuente C++ que, al compilarse con el compilador vintage original y sus flags, reproduzca exactamente el binario retail. A diferencia de los modelos de decompilación generalistas, este está entrenado para interactuar con un harness de compilación y puntuación, usando el template de chat de Qwen3.5 con thinking activado y llamadas a herramientas XML. Está diseñado para integrarse en flujos de agentes que proponen código, lo compilan y reaccionan a la retroalimentación de `objdiff`.

El adaptador se publica como artefacto de investigación con una advertencia explícita: **aún no ha sido evaluado**. Solo se reporta la pérdida de entrenamiento (0.77 → 0.24) y el contexto de entrenamiento. El tamaño del repositorio es de 0.4 GB y el formato de pesos es safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-9B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=32; el modelo base tiene 9B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 90,112 tokens (max_seq de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en bf16; el modelo base puede cuantizarse aparte) |
| Idiomas soportados | No disponibles (el corpus es código C++ y comentarios en inglés; sin especificación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador usa LoRA con r=32, α=64, dropout de 0.05, aplicado a todas las capas lineales, en precisión bf16. Se entrena sobre el modelo base Qwen3.5-9B (también Apache-2.0) durante 2 épocas, 1,602 pasos de optimización, con batch efectivo de 32 y scheduler de learning rate lineal, semilla 42. La ventana de contexto máxima es de 90,112 tokens, sin descartar ninguna fila. El formato de entrenamiento es el template de chat de Qwen3.5 con thinking activado y llamadas a herramientas XML nativas.

El corpus de entrenamiento (25,624 filas tras deduplicación exacta) mezcla cuatro capas: trayectorias multi-turno generadas por un profesor (3,032 filas) donde un agente con herramientas trabaja objetivos de decompilación del proyecto privado de reconstrucción de Halo: Combat Evolved Anniversary; bundle-v5 (8,305 filas) con filas de reparación, síntesis y edición de proyectos públicos como `rb3-xenon`, `dc3-decomp`, `zeldaret/tww`, `zeldaret/tp` y `DarkRTA/rb3`; v13-chain (1,797 filas) con pares de reparación MSVC y endpoints byte-exactos de cadenas verificadas; y una capa adicional de filas de un solo turno de fuentes similares. El diseño metodológico del proyecto se basa en que los modelos proponen y los oráculos deterministas (compilador real + `objdiff`) deciden; el modelo nunca juzga su propio trabajo.

## Capacidades

- Generación de código C++ orientado a decompilación: propone reescrituras de funciones que mantienen el comportamiento del binario original.
- Interacción multi-turno con herramientas: usa el template de chat de Qwen3.5 con XML tool calls para leer desensamblados, proponer código, compilar y reaccionar a la puntuación de `objdiff`.
- Razonamiento con "thinking mode" activado: el modelo genera cadenas de pensamiento antes de emitir la respuesta final, lo que mejora la planificación en tareas de ingeniería inversa.
- Soporte de agentes: entrenado para trabajar en flujos donde un agente ejecuta un ciclo de proponer-compilar-puntuar.
- Capacidad de reparación y síntesis de código: puede corregir funciones incompletas o generar implementaciones desde stubs, según las filas del corpus.
- Multilingüe limitado: no hay especificación de idiomas, pero el corpus es código C++ con comentarios en inglés; se espera que el modelo funcione principalmente con código fuente.

## Casos de uso

- Reconstrucción de binarios de juegos retro: el adaptador puede asistir en proyectos de preservación de consolas (Xbox 360) para reescribir funciones C++ que compilen byte-exactamente al binario original, como se hizo con más de 44,000 funciones de un binario retail.
- Automatización de revisión de decompilaciones: integrado en pipelines de CI/CD, puede proponer parches y verificar mediante compilación real, reduciendo el trabajo manual de los ingenieros inversos.
- Reparación de funciones incompletas: dado un stub o una función parcialmente decompilada, el modelo sugiere implementaciones que pasen la comprobación de `objdiff`.
- Generación de código con verificación determinista: en entornos donde se requiere que el código generado cumpla restricciones exactas de compilación, el modelo se combina con un oráculo de compilación para aceptar o rechazar propuestas.
- Entrenamiento de agentes para tool use: el adaptador sirve como ejemplo de cómo ajustar un modelo base para que use herramientas de forma fiable en dominios especializados (compilación, diff de binarios).
- Investigación en decompilación asistida por IA: permite estudiar el impacto de mezclar datos de un solo turno con trayectorias multi-turno en la calidad de las propuestas de decompilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que "no evaluation has been run on this adapter yet" y que la pérdida de entrenamiento (0.77 → 0.24) no es una métrica de evaluación. Se recomienda esperar a la evaluación multi-turno del proyecto antes de usar este adaptador en producción.

## Requisitos de hardware

No se proporcionan datos específicos de hardware en la información del modelo. Como adaptador LoRA, su uso requiere cargar el modelo base Qwen3.5-9B (aproximadamente 18 GB en FP16, o menos con cuantización) más el adaptador de 0.4 GB. Para inferencia con batch pequeño, una GPU con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090) sería suficiente si se cuantiza el base. Para despliegue con vLLM, llama.cpp u Ollama, se debe combinar el adaptador con el base; no se indican opciones oficiales de despliegue. Se recomienda consultar la documentación del proyecto `decomp-synth` para detalles de infraestructura.

## Comparativa con modelos similares

No hay datos cuantitativos suficientes para comparar con otros adaptadores del mismo proyecto. Se pueden mencionar los siguientes como alternativas del mismo autor, pero sin métricas:

| Modelo | Base | Método | Corpus | Estado |
|---|---|---|---|---|
| `decomp-synth-lifter-v17-mix-qwen3.5-9b-lora` (este) | Qwen3.5-9B | LoRA r=32 | 25,624 filas mixtas | Sin evaluar |
| `decomp-synth-lifter-v17-full-qwen3.5-9b-lora` | Qwen3.5-9B | LoRA (probablemente r=32) | 3,032 filas (trayectorias puras) | Sin evaluar |
| `decomp-synth-lifter-v14-evalformat-qwen3.5-9b-lora` | Qwen3.5-9B | LoRA (no especificado) | No especificado | Evaluado (medido para multi-turno) |

No se dispone de comparaciones con modelos externos (por ejemplo, otros adaptadores de decompilación) en la información proporcionada.

## Limitaciones y advertencias

- **Sin evaluación**: el adaptador se publica recién entrenado y no tiene resultados de benchmarks ni evaluación multi-turno. No debe usarse como reemplazo de `v14-evalformat` para el bucle de retroalimentación multi-turno hasta que se publiquen números.
- **Dominio muy específico**: entrenado exclusivamente para decompilación PowerPC C++ de consolas (Xbox 360). Su rendimiento en otros lenguajes, arquitecturas o tareas de código general será bajo.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede proponer código que parezca plausible pero que no compile o no sea byte-exacto. El diseño del proyecto mitiga esto usando oráculos deterministas, pero el modelo en sí no es fiable sin ese circuito de validación.
- **Dependencia del modelo base**: el adaptador requiere Qwen3.5-9B (Apache-2.0) y no es autónomo. Cualquier limitación del base (sesgos, alucinaciones) se hereda.
- **Datos de entrenamiento con licencias variadas**: el corpus incluye filas de proyectos comunitarios con sus propios términos (rb3-xenon, dc3-decomp, zeldaret, etc.). Aunque el adaptador tiene licencia Apache-2.0, los datos subyacentes pueden tener restricciones adicionales.
- **Reproducibilidad limitada**: el entrenamiento usó una sola semilla (42) y no se han realizado múltiples semillas; cualquier conclusión sobre el rendimiento es provisional.
- **Fechas futuras**: el modelo se creó en 2026, lo que puede indicar que es un artefacto de investigación en curso; verificar la vigencia del proyecto antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/freeqaz/decomp-synth-lifter-v17-mix-qwen3.5-9b-lora
- Adaptador v17-full (arm hermano): https://huggingface.co/freeqaz/decomp-synth-lifter-v17-full-qwen3.5-9b-lora
- Adaptador v14-evalformat (referencia evaluada): https://huggingface.co/freeqaz/decomp-synth-lifter-v14-evalformat-qwen3.5-9b-lora
- Adaptador v16-v5chat: https://huggingface.co/freeqaz/decomp-synth-lifter-v16-v5chat-qwen3.5-9b-lora
- Adaptador v13-chain: https://huggingface.co/freeqaz/decomp-synth-lifter-v13-chain-qwen3.5-9b-lora
- Repositorio GitHub del proyecto: https://github.com/freeqaz/decomp-synth
- Documentación del proyecto: https://github.com/freeqaz/decomp-synth/tree/main/docs
- Herramienta objdiff: https://github.com/encounter/objdiff
- Blog del autor (artículos de fondo):
  - https://www.freeqaz.com/blog/how-agent-swarms-decompile-games
  - https://www.freeqaz.com/blog/llm-assisted-decompilation
  - https://www.freeqaz.com/blog/forking-the-decompilation-toolchain
  - https://www.freeqaz.com/blog/infrastructure-for-agent-swarms
