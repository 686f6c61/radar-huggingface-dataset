# reaperdoesntknow/DualMinded-Qwen3-1.7B

## Resumen

DualMinded-Qwen3-1.7B es un modelo de lenguaje de 1.700 millones de parámetros desarrollado por Convergent Intelligence LLC (Research Division) y publicado por el usuario `reaperdoesntknow` en Hugging Face. Se construye sobre Qwen3-1.7B mediante un pipeline de destilación de conocimiento en cuatro etapas y un ajuste fino supervisado (SFT) sobre trazas de razonamiento de Opus 4.6. Su propuesta central es un bucle cognitivo de tres fases —explorar, examinar, responder— implementado mediante generación condicionada por rol sobre pesos compartidos, sin parámetros adicionales ni enrutamiento.

El modelo aborda el problema de dotar a un modelo pequeño de capacidades de autorreflexión y autocorrección: en lugar de generar una respuesta directa, primero razona libremente dentro de etiquetas `<explore>`, después se critica de forma adversarial en `<examine>` y finalmente sintetiza una respuesta limpia en `<response>`. Es relevante para quienes buscan razonamiento estructurado en el rango de 1-2B parámetros, orientado a despliegue en el borde (edge) y con licencia Apache 2.0.

La arquitectura subyacente es la de Qwen3-1.7B (transformer denso), con una longitud de contexto que no se especifica en la información disponible. El modelo está entrenado únicamente en inglés y su formato de pesos principal es safetensors, con cuantizaciones GGUF publicadas en un repositorio aparte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-1.7B) |
| Parámetros totales | 2.031.739.904 (~2,03B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors; GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B y aplica un pipeline de cuatro etapas. La primera es una destilación multi-profesor desde tres variantes de Qwen3-30B-A3B (Instruct, Thinking y Coder) hacia Qwen3-1.7B, con destilación ponderada por pruebas (proof-weighted KD) y una amplificación de pérdida de 2,25× sobre los tokens de razonamiento. La segunda etapa, denominada DISC, refina el estudiante mediante "Discrepancy Calculus", detectando y preservando fronteras estructurales en la distribución del profesor.

La tercera etapa es la Destilación de Conocimiento Topológica (TKD), una destilación en flujo continuo con ventaneo guiado por topología desde Qwen3-30B-A3B-Thinking. Se descompone la salida del profesor en variación acotada (componente suave, saltos y deriva), se amplifican las posiciones de salto a 3σ, se cortan ventanas en fronteras de baja discrepancia y se ordena un currículo de cuatro fases (fácil → difícil). La cuarta etapa es el SFT sobre el dataset Opus-4.6-Reasoning-3000x-filtered: la columna `thinking` se mapea directamente a `<explore>` y la columna `solution` se divide en `<examine>` y `<response>`.

La configuración de entrenamiento reportada incluye checkpoint base TKD checkpoint-512, longitud máxima de secuencia de 2048, batch efectivo de 16 (2 × 8 de acumulación), learning rate de 5e-6 con decaimiento coseno, 32 pasos de warmup, 1024 pasos máximos, precisión BF16 y hardware NVIDIA H100. El autor describe además el fenómeno de "ghost imprinting": campos residuales en el espacio de pesos procedentes de la destilación secuencial de múltiples profesores que producirían capacidades emergentes no presentes en ninguno de ellos por separado; se trata de una afirmación del autor sin validación independiente en la información disponible.

## Capacidades

- Generación de texto conversacional y de razonamiento estructurado en tres fases (`<explore>`, `<examine>`, `<response>`).
- Razonamiento extendido y derivación creativa, heredado del SFT sobre trazas de Opus 4.6.
- Autocrítica adversarial y detección de errores dentro del propio bucle de generación.
- Razonamiento formal y pruebas estructuradas en la variante DualMind (la variante DualMinded prioriza razonamiento extendido y derivación creativa).
- Generación de código, por herencia de la destilación desde Qwen3-30B-A3B-Coder.
- Capacidades matemáticas y de demostración (el ejemplo de la model card es la demostración del teorema del valor medio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el bucle explore-examine-response constituye un razonamiento multi-paso interno, pero no se describe integración con frameworks de agentes.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking: sí, mediante las etiquetas de fase cognitiva.
- Visión y audio: no soportados.

## Casos de uso

- Razonamiento matemático con verificación interna: el modelo puede emplearse para resolver demostraciones y problemas de derivación, usando `<explore>` para el desarrollo y `<examine>` para detectar errores antes de emitir la respuesta final en `<response>`.
- Generación de código con revisión: gracias a la destilación desde Qwen3-30B-A3B-Coder, puede generar fragmentos de código y usar la fase de examen para revisar casos límite y errores antes de entregar la solución.
- Asistencia educativa en inglés: explicación paso a paso de conceptos con un razonamiento transparente y auditable, útil en entornos donde se requiere mostrar el proceso y no solo el resultado.
- Despliegue en el borde (edge): con ~2B parámetros y cuantizaciones Q4_K_M y Q5_K_M, puede ejecutarse en dispositivos con recursos limitados para tareas de razonamiento ligero sin conexión.
- Prototipado de pipelines de razonamiento estructurado: sirve como banco de pruebas para investigar bucles de autocrítica y generación condicionada por rol en modelos pequeños.
- Filtrado y refinamiento de texto: la fase `<examine>` puede aprovecharse para tareas de detección de inconsistencias y corrección de borradores en inglés.
- Experimentación académica en destilación: el pipeline de cuatro etapas y la metodología DISC/TKD son reproducibles y documentados en los papers enlazados, lo que permite usarlo como referencia en investigación sobre destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en BF16/F16 (2,03B parámetros), en torno a 2,2 GB en Q8_0, ~1,5 GB en Q5_K_M y ~1,3 GB en Q4_K_M (estimaciones a partir del recuento de parámetros; no confirmadas en la información disponible).
- GPU recomendadas: el entrenamiento se realizó en NVIDIA H100; para inferencia son suficientes GPU consumer.
- Cabe en GPU consumer: sí, en tarjetas con 4-8 GB de VRAM o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090) usando cuantizaciones GGUF.
- Opciones de despliegue: Transformers (con `device_map="auto"` y BF16), llama.cpp y Ollama (imagen `reaperdoesntrun/DualMinded-1.7B`). Compatibilidad con vLLM o TGI: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| DualMinded-Qwen3-1.7B | ~2,03B | No disponible | Apache 2.0 | Inglés | Bucle explore-examine-response; destilación multi-profesor |
| Qwen3-1.7B (base) | ~2B | No disponible en esta ficha | Apache 2.0 | Multilingüe | Modelo base sin el pipeline de destilación ni el SFT de razonamiento |
| DualMind | No disponible en esta ficha | No disponible | Apache 2.0 | Inglés | Variante entrenada con LogicInference_OA; orientada a lógica formal y pruebas estructuradas |
| Qwen3-30B-A3B (profesor) | ~30B totales (MoE) | No disponible en esta ficha | Apache 2.0 | Multilingüe | Profesor de la destilación; mucho mayor coste de inferencia |

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a un modelo de ~2B parámetros, especialmente en dominios especializados; la fase `<examine>` mitiga pero no elimina este riesgo.
- El formato de tres fases requiere que el prompt incluya las etiquetas (`<explore>`, `<examine>`, `<response>`); un uso fuera de ese formato puede degradar la calidad de la salida.
- Las afirmaciones sobre "ghost imprinting" y capacidades emergentes proceden del autor y no cuentan con validación independiente en la información disponible.
- La longitud de contexto no está especificada; conviene verificar el límite real antes de usarlo en tareas de contexto largo.
- El modelo se entrenó con SFT sobre trazas de un modelo propietario (Opus 4.6); conviene revisar las condiciones de uso de dichos datos si se plantea un uso comercial a gran escala, pese a la licencia Apache 2.0 del artefacto.
- Los benchmarks de calidad no están publicados, por lo que no es posible comparar su rendimiento de forma objetiva con alternativas del mismo tamaño.
- El repositorio tiene pocas descargas (2113) y pocos likes (5); es un modelo de investigación con escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Versiones GGUF: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B-GGUF
- Variante DualMind: https://huggingface.co/reaperdoesntknow/DualMind
- Paper de metodología DualMind: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: https://doi.org/10.57967/hf/8184)
- Paper "Structure Over Scale" (metodología de entrenamiento en CPU): https://doi.org/10.57967/hf/8165
- Colección DualMind: https://huggingface.co/collections/reaperdoesntknow/dualmind
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen
- Dataset de SFT: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
