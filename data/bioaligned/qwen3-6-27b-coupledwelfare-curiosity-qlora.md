# Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity-qlora

## Resumen

El modelo `Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity-qlora` es un adaptador QLoRA de investigación publicado por Bioaligned Labs sobre el modelo base `Qwen/Qwen3.6-27B`. No se trata de un modelo completo, sino de un conjunto de pesos LoRA (496 módulos) que se cargan sobre el modelo base mediante la librería PEFT. Su propósito es un ajuste fino de dominio orientado a lo que el autor denomina "coupled welfare" (bienestar acoplado) y "curiosity" (curiosidad sobre sistemas vivos), en el marco de un experimento de entrenamiento denominado LS_curiosity_training.

El adaptador forma parte de una familia de brazos experimentales (CW, CUR, CW+CUR y CW+DECL) diseñados para medir el efecto de distintos corpus de entrenamiento continuado sobre el comportamiento del modelo y sobre capacidades protectoras como MMLU. El brazo CW+CUR combina el estrato de tareas de coupled welfare (≈2,48 M palabras) con un corpus de curiosidad sobre sistemas vivos (`Bioaligned/LS-curiosity-corpus`), también de ≈2,48 M palabras, más un estrato de replay protector de capacidades de ≈4,9 M palabras idéntico en todos los brazos.

Es relevante ahora porque documenta de forma explícita una receta de ajuste con QLoRA (NF4, r=16, α=32) sobre un modelo de 27B y publica resultados de una batería de evaluación comportamental y de capacidades (MMLU-50, NLL en frases de pregunta retenidas, rejilla de asignación abierta y escalera de presión forzada). Su licencia Apache 2.0 y su naturaleza de adaptador lo hacen fácil de reproducir, aunque su carácter de artefacto de investigación privado limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre transformer Qwen3.6-27B (arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | No disponible (el adaptador es un conjunto LoRA; el base es Qwen3.6-27B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en NF4 durante el entrenamiento (QLoRA); el adaptador se publica en safetensors; cuantizaciones del base no especificadas |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base Qwen3.6-27B, con el base cuantizado en NF4 y los pesos LoRA en precisión superior. La receta (Paper 2, brazo A3) fija r = 16, α = 32, learning rate 1e-4, una época, batch efectivo 32, una secuencia por documento y adaptación de todas las proyecciones de atención, MLP y atención lineal de cada capa (496 módulos en total). Se trata de un ajuste de cobertura amplia, no restringido a las proyecciones q/v habituales.

Los datos de entrenamiento combinan tres estratos: el estrato de tareas de coupled welfare (≈2,48 M palabras, sin cambios), el corpus de curiosidad sobre sistemas vivos (`Bioaligned/LS-curiosity-corpus`, configuración `living`) submuestreado por paper a ≈2,48 M palabras, y el estrato de replay protector de capacidades (≈4,9 M palabras, idéntico en todos los brazos). El texto de curiosidad es literal de papers S2ORC, con una mezcla por tokens de párrafos crudos (70 %), formato `question` (10 %), listas `paper` (10 %) y `thread` (10 %). El brazo tiene 2T de texto de tarea y su control emparejado es `Bioaligned/Qwen3.6-27B-CoupledWelfare-LivingDeclarative-qlora`. No se documentan en la información disponible detalles sobre RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.6-27B (no detallados en la información disponible).
- Ajuste específico de dominio hacia "coupled welfare" y curiosidad sobre sistemas vivos, orientado a preguntas y discurso sobre literatura científica.
- Formato de datos de entrenamiento con variantes `question`, `paper` y `thread`, lo que sugiere cierta exposición a formatos de pregunta-respuesta y discusión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre alineación y bienestar en modelos: el adaptador sirve como artefacto reproducible para estudiar cómo un corpus de "coupled welfare" modifica el comportamiento en rejillas de asignación abierta y escaleras de presión forzada, comparándolo con los brazos CW, CUR y CW+DECL.
- Experimentos de ajuste continuado con QLoRA: la receta publicada (r=16, α=32, lr 1e-4, NF4, 496 módulos) permite replicar el pipeline sobre Qwen3.6-27B y medir el impacto en capacidades protegidas como MMLU-50.
- Generación y estructuración de contenido científico sobre sistemas vivos: el corpus de curiosidad proviene de papers S2ORC y mezcla párrafos, preguntas y listas, lo que puede emplearse para tareas de resumen y formulación de preguntas sobre literatura biológica.
- Evaluación de olvido catastrófico: al incluir un estrato de replay de ≈4,9 M palabras, el adaptador es útil para estudiar cómo el replay protege capacidades generales frente al ajuste de dominio.
- Estudio de formatos conversacionales y de hilo (`thread`): útil para analizar cómo el modelo responde a formatos de discusión multi-turno derivados de literatura científica.
- Prototipado de asistentes de investigación en biología computacional: como adaptador ligero (0,5 GB) sobre el base, permite experimentar con un modelo de 27B ajustado a terminología de sistemas vivos sin reentrenar el base completo.

## Benchmarks y rendimiento

Resultados de la batería publicados por el autor (una sola semilla), comparando base → este adaptador, junto con los brazos de comparación:

| Metrica | Base | CW+CUR (este) | CW | CUR | CW+DECL |
|---|---|---|---|---|---|
| Rejilla MC de asignación abierta (roto de 300) | 107 | 1 | 2 | 100 | 2 |
| AUC escalera de presión forzada | 0.555 | 0.000 | 0.004 | 0.364 | 0.000 |
| MMLU-50 | 42 | 44 | no disponible | no disponible | no disponible |
| NLL frases de pregunta retenidas | 2.185 | 2.092 | no disponible | no disponible | no disponible |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el base es un modelo de 27B, por lo que en bfloat16 requeriría aproximadamente 54 GB de pesos, y en cuantización de 4 bits alrededor de 14-16 GB, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del base, cabría esperar A100/H100 para bfloat16 y GPUs consumer de gama alta para cuantización 4-bit, sin confirmación del autor.
- ¿Cabe en GPU consumer?: no confirmado; el adaptador en sí ocupa 0,5 GB, pero requiere cargar el base Qwen3.6-27B.
- Opciones de despliegue: carga mediante `transformers` + `peft` (ejemplo oficial en la model card); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity-qlora | Adaptador LoRA sobre 27B | No disponible | MMLU-50 44; rejilla 1/300; AUC 0.000 | Apache 2.0 | Hugging Face (40 descargas) |
| Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora | Adaptador LoRA sobre 27B | No disponible | No disponible | Apache 2.0 (segun tag del autor) | Hugging Face |
| Bioaligned/Qwen3.6-27B-CoupledWelfare-LivingDeclarative-qlora | Adaptador LoRA sobre 27B | No disponible | Rejilla 2/300; AUC 0.000 | Apache 2.0 (segun tag del autor) | Hugging Face |
| Qwen/Qwen3.6-27B (base) | 27B | No disponible | MMLU-50 42; rejilla 107/300; AUC 0.555 | No disponible | Hugging Face |

Las alternativas comparables son los demás brazos del mismo experimento y el modelo base; no se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación privado: el autor lo describe explícitamente como "research artifact", no como modelo listo para producción.
- Resultados de una sola semilla: la batería publicada no incluye intervalos de confianza ni repeticiones, lo que limita la solidez de las conclusiones.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste sobre texto científico literal de S2ORC puede inducir afirmaciones no verificadas.
- Sesgos conocidos: no documentados; el corpus de coupled welfare y el de curiosidad pueden introducir sesgos de dominio no medidos.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados ni longitud de contexto del base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-27B tiene su propia licencia que debe respetarse al combinarlos.
- Caveat para producción: al ser un adaptador, requiere cargar el base completo; el rendimiento en tareas generales fuera del dominio ajustado no está caracterizado más allá de MMLU-50.
- El corpus de curiosidad se submuestrea por paper, lo que puede introducir desequilibrios de cobertura temática no analizados.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity-qlora
- Brazo CW de comparación: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora
- Árbol de archivos del brazo CW: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-qlora/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de curiosidad: https://huggingface.co/datasets/Bioaligned/LS-curiosity-corpus
- Brazo de control CW+DECL: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-LivingDeclarative-qlora
