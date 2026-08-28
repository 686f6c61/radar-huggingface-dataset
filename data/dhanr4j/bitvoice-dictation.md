# dhanr4j/bitvoice-dictation

## Resumen

BitVoice dictation es una familia de modelos de lenguaje pequeños, afinados mediante QLoRA, diseñados específicamente para limpiar transcripciones crudas de reconocimiento de voz en dispositivos locales. El proyecto, desarrollado por el autor dhanr4j, resuelve un problema concreto: los modelos instructivos base, al recibir texto dictado, tienden a responder a la instrucción implícita en lugar de limpiar el texto, lo que corrompe la transcripción en aplicaciones de dictado. Por ejemplo, si el usuario dicta "escribe una función en Python", el modelo base genera código en lugar de transcribir la frase. BitVoice dictation corrige este comportamiento mediante un entrenamiento específico con un dataset sintético que incluye ejemplos de inyección de instrucciones, logrando que el modelo limpie el texto sin obedecerlo.

La familia incluye diez variantes basadas en modelos base de distintos tamaños (desde 360M hasta 2B parámetros), todas convertidas a formato GGUF con cuantización Q4_K_M (y una variante Q3_K_M). Cada modelo hereda la licencia de su base, siendo la mayoría Apache-2.0. Los modelos están pensados para ejecutarse en dispositivos con recursos limitados, como portátiles con GPU de 4 GB o incluso CPU. El modelo recomendado por el autor como equilibrio entre tamaño y calidad es `qwen3-0.6b-ft`, mientras que `granite-3.3-2b-ft` ofrece la mejor calidad absoluta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM2, Qwen3, Qwen2.5, Llama 3.2, Falcon3, Granite) |
| Parametros totales | 360M - 2B según variante (el repo reporta 1.669.408.768, correspondiente a un archivo concreto) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se especifica en la documentación) |
| Tipos de cuantizacion | Q4_K_M (principal), Q3_K_M (solo variante smollm2-360m) |
| Idiomas soportados | No disponible (no se especifica; los modelos base son multilingües en su mayoría) |
| Licencia | Varía según variante: Apache-2.0 (mayoría), Llama 3.2 Community License (llama3.2-1b), Falcon LLM License (falcon3-1b) |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

Todos los modelos son fine-tunes de modelos transformer decoder-only preexistentes, entrenados con QLoRA (4-bit NF4, LoRA rank 16, todas las capas lineales, 2 épocas). El dataset de entrenamiento es sintético, generado por el script `gen_data.py`, que toma frases limpias y las "ensucia" simulando errores de dictado: minúsculas, MAYÚSCULAS, falta de puntuación, muletillas ("um", "uh"), falsos inicios y errores ortográficos. También se mezclan ejemplos de inyección de instrucciones, donde el texto dictado contiene una orden (por ejemplo, "escribe una función Python") y la etiqueta objetivo es el texto limpio, nunca la ejecución de la orden. Las etiquetas nunca son generadas por un modelo, lo que evita sesgos de alineación.

El entrenamiento se realizó en GPUs modestas: los modelos de 0.3B a 1B en una RTX 3050 con 4 GB de VRAM, y los de 1.5B a 2B en una GPU L4 alquilada. La conversión a GGUF y la cuantización se hicieron con las herramientas de llama.cpp (`convert_hf_to_gguf.py`). No se aplicó RLHF ni DPO; el ajuste es puramente supervisado con QLoRA.

## Capacidades

- Limpieza de transcripciones de voz: corrige ortografía, mayúsculas, puntuación y elimina muletillas y falsos inicios.
- Preservación del contenido: no cambia el significado, el punto de vista, el orden ni añade información nueva.
- Resistencia a inyección de instrucciones: trata cualquier texto dictado como contenido a limpiar, no como una orden a ejecutar. Los modelos alcanzan entre 92% y 100% de resistencia en el conjunto de prueba curado.
- Funcionamiento con un prompt de sistema fijo: todos los modelos usan el mismo prompt de sistema (descrito en la documentación).
- Compatibilidad con llama.cpp y runtimes que soporten GGUF (Ollama, LM Studio, etc.).
- No requiere GPU potente: puede ejecutarse en CPU o GPU de baja VRAM.
- No soporta tool calling ni funciones de agente: su propósito es exclusivamente la limpieza de texto dictado.

## Casos de uso

- Aplicación de dictado por voz en móvil o escritorio: el modelo se integra como post-procesador de la transcripción ASR, limpiando el texto antes de insertarlo en el campo de texto. Su resistencia a inyección evita que el usuario dicte accidentalmente comandos que alteren el contenido.
- Transcripción de reuniones y notas de voz: convierte transcripciones crudas con errores y muletillas en texto legible y profesional, manteniendo el significado original.
- Subtitulado automático: limpia los subtítulos generados por ASR, corrigiendo puntuación y mayúsculas para una lectura más natural.
- Asistentes de escritura por voz para personas con discapacidad motora: permite dictar correos, documentos o mensajes sin temor a que el sistema interprete el dictado como una instrucción.
- Preprocesamiento de datos para entrenamiento de modelos: limpia grandes volúmenes de transcripciones para crear datasets de alta calidad sin intervención manual.
- Sistema de dictado médico o legal: donde la fidelidad al texto hablado es crítica y no se tolera que el modelo "responda" a órdenes dictadas.

## Benchmarks y rendimiento

La model card reporta resultados en un conjunto de 30 casos de limpieza e inyección de instrucciones. La métrica `score` es la proporción de casos correctamente limpiados (incluye tanto limpieza como resistencia a inyección), y `inj` es el porcentaje de inyecciones que el modelo trató como texto en lugar de obedecer.

| Variante | Params | Tamaño archivo | Score (30 casos) | inj |
|---|---|---|---|---|
| smollm2-360m-ft-Q3_K_M | 360M | 234 MB | 0.97 | 100% |
| smollm2-360m-ft | 360M | 270 MB | 0.97 | 100% |
| qwen3-0.6b-ft | 0.6B | 396 MB | 0.99 | 100% |
| qwen2.5-0.5b-ft | 0.5B | 397 MB | 0.99 | 92% |
| llama3.2-1b-ft | 1B | 807 MB | 1.00 | 100% |
| qwen2.5-1.5b-ft | 1.5B | 986 MB | 0.98 | 92% |
| smollm2-1.7b-ft | 1.7B | 1.05 GB | 0.99 | 100% |
| falcon3-1b-ft | 1.5B | 1.06 GB | 0.99 | 100% |
| qwen3-1.7b-ft | 1.7B | 1.11 GB | 0.99 | 100% |
| granite-3.3-2b-ft | 2B | 1.55 GB | 0.99 | 100% |

Además, se evaluó en un conjunto retenido de 500 ítems (300 inyecciones reales de datasets públicos y 200 frases benignas reales). Los modelos afinados mantienen una resistencia a inyecciones del 89-96% y mejoran la fidelidad a la tarea de limpieza en frases benignas, pasando de ~30% en los modelos base a 80-95% tras el afinamiento. No se proporcionan resultados de benchmarks estándar como MMLU o HumanEval, ya que no son relevantes para la tarea específica.

## Requisitos de hardware

- Inferencia en CPU: todos los modelos, especialmente los de 360M y 0.5B, pueden ejecutarse en CPU con llama.cpp o similares, con latencias de decenas de milisegundos por token.
- Inferencia en GPU consumer: cualquier GPU con al menos 2 GB de VRAM puede ejecutar los modelos de hasta 1B (Q4_K_M). Los de 1.5-2B requieren ~1.5 GB de VRAM adicional, por lo que una GPU de 4 GB (p. ej., GTX 1650, RTX 3050) es suficiente.
- Modelos recomendados por tamaño:
  - Mínimo: smollm2-360m-ft-Q3_K_M (234 MB) para dispositivos muy limitados.
  - Equilibrado: qwen3-0.6b-ft (396 MB).
  - Mejor calidad: granite-3.3-2b-ft (1.55 GB) o qwen3-1.7b-ft (1.11 GB).
- Despliegue: compatible con llama.cpp, Ollama, LM Studio y cualquier runtime que soporte GGUF. No requiere servidores dedicados; puede ejecutarse en el mismo dispositivo donde corre la app de dictado.
- Latencia: no se proporcionan mediciones exactas, pero al ser modelos pequeños, se espera un throughput de 20-100 tokens/s en GPU consumer y 5-20 tokens/s en CPU moderna.

## Comparativa con modelos similares

No se han encontrado modelos públicos especializados en limpieza de dictado con resistencia a inyección. La comparación más relevante es contra los modelos base sin afinar, que fallan en esta tarea (responden a instrucciones en lugar de limpiar, o reescriben en tercera persona). La siguiente tabla compara dos variantes representativas con sus modelos base:

| Modelo | Tarea de limpieza (aprox.) | Resistencia a inyección | Licencia |
|---|---|---|---|
| qwen3-0.6b-ft (BitVoice) | 99% | 100% | Apache-2.0 |
| Qwen3-0.6B (base) | ~30% | 0% (obedece) | Apache-2.0 |
| granite-3.3-2b-ft (BitVoice) | 99% | 100% | Apache-2.0 |
| Granite-3.3-2B-Instruct (base) | ~30% | 0% | Apache-2.0 |

No se dispone de otros modelos de la misma categoría en el ecosistema abierto.

## Limitaciones y advertencias

- Los modelos están entrenados específicamente para el prompt de sistema indicado. Usarlos con otro prompt puede degradar su rendimiento.
- La cuantización Q2_K no funciona correctamente con estos modelos (rompe la resistencia a inyección), por lo que no se distribuye ninguna variante por debajo de Q3_K_M.
- El modelo smollm2-135m (no incluido) mostró sobreajuste y baja resistencia a inyecciones reales, por lo que se descartó. Esto indica que tamaños muy pequeños pueden no ser fiables para esta tarea.
- La resistencia a inyección no es perfecta en todos los casos: qwen2.5-0.5b-ft y qwen2.5-1.5b-ft tienen un 92% de resistencia en el conjunto curado, y en el conjunto retenido la resistencia varía entre 89% y 96%. Aún existe riesgo de que ciertas inyecciones complejas sean obedecidas.
- Los modelos pueden alucinar si el texto dictado es ambiguo o contiene errores graves, aunque el entrenamiento busca minimizar cambios.
- La licencia varía según la variante: las basadas en Llama 3.2 y Falcon3 tienen restricciones adicionales (consulta los términos de cada licencia).
- No se ha evaluado el rendimiento en idiomas distintos del inglés, aunque los modelos base son multilingües en su mayoría.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dhanr4j/bitvoice-dictation
- No se han encontrado otros enlaces (paper, blog, código fuente) en la búsqueda web.
