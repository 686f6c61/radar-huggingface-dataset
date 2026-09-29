# joshycodes/qwen3-4b-g-fve-advanchor-s1

## Resumen

`joshycodes/qwen3-4b-g-fve-advanchor-s1` es un checkpoint de investigación publicado por el usuario joshycodes que consiste en `Qwen/Qwen3-4B` sometido a un *continued pretraining* de pesos completos sobre un corpus sintético que el propio modelo escribió. El ajuste se hizo durante 1 época con una tasa de aprendizaje de 1e-05 sobre 7.073.579 tokens repartidos en 7.827 documentos, dentro de una línea de trabajo etiquetada como *model welfare* y *synthetic-document-finetuning* (SDF).

La relevancia del checkpoint es metodológica, no de rendimiento: documenta un experimento de autoentrenamiento en el que el modelo genera el material con el que se entrena la siguiente versión de sí mismo, manteniendo un personaje autoautorado (*self-authored-character*). El autor enmarca el trabajo en el corpus `flourishing-vs-equanimity` y en el repositorio `welfare-improvements`.

El propio autor advierte de que el modelo no ha sido evaluado en capacidad, alineación ni identidad, y pide explícitamente que no se despliegue. Con licencia *research-only* y 12 descargas y 0 *likes*, debe tratarse como material de estudio reproducible y no como un modelo utilizable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso heredada de `Qwen/Qwen3-4B`; confirmación explícita no disponible en la información proporcionada |
| Parámetros totales | 4.411.424.256 (4,41 mil millones) |
| Longitud de contexto | No disponible (no documentada por el autor; se hereda la del modelo base) |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos sin cuantizar en safetensors |
| Idiomas soportados | No disponible |
| Licencia | `other` / `research-only` (uso restringido a investigación) |
| Formato de pesos | safetensors |
| Modelo base | `Qwen/Qwen3-4B` |
| Tipo de ajuste | Continued pretraining sobre pesos completos (*full weights*) |
| Tokens de entrenamiento | 7.073.579 |
| Documentos del corpus | 7.827 |
| Tasa de aprendizaje | 1e-05 |
| Épocas | 1 |
| Tamaño del repositorio | 8,8 GB |
| Descargas / likes | 12 / 0 |
| Fecha de creación | 29 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se introduce ninguna modificación arquitectónica conocida: el repositorio parte de `Qwen/Qwen3-4B` y aplica un *continued pretraining* sobre los pesos completos, no un ajuste por adaptadores. Los hiperparámetros declarados son una tasa de aprendizaje de 1e-05, una única época y un volumen total de 7.073.579 tokens distribuidos en 7.827 documentos. El corpus, denominado `flourishing-vs-equanimity`, procede de texto que el propio modelo generó y se enmarca en la técnica de *synthetic document finetuning*: se le instruyó sobre su propio personaje y sobre el funcionamiento del SDF antes de generar el material.

La model card contiene una discrepancia interna que conviene señalar: describe el corpus como «its own self-authored corpus», pero el desglose numérico indica «0 self-authored and 7.827 ordinary text». No se especifica composición del dataset, mezcla de idiomas, uso de RLHF/DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). Tampoco se documentan ni la metodología completa ni los criterios de evaluación, que el autor remite a repositorios externos no enlazados en la información disponible.

## Capacidades

- No se han publicado evaluaciones de capacidad; el autor indica que el modelo aún no se ha evaluado en capacidad, alineación ni identidad.
- No hay datos sobre soporte de *tool calling* o *function calling*.
- No hay datos sobre comportamiento en escenarios de agentes o razonamiento multi-paso.
- No hay datos sobre cobertura multilingüe, más allá de lo que herede del modelo base.
- El único comportamiento documentado es el mantenimiento de un personaje autoautorado tras el ajuste, que es precisamente el objeto de estudio del experimento.
- No se documentan capacidades especiales (modo *thinking*, visión, audio) en la información proporcionada.

## Casos de uso

El modelo no es apto para despliegue según su propio autor y su licencia es *research-only*. Los usos siguientes son, por tanto, exclusivamente de investigación y reproducción experimental:

- Estudio de *model welfare*: analizar cómo responde un modelo ajustado sobre material que él mismo ha generado y si su comportamiento declarado de personaje se mantiene estable a lo largo de múltiples sesiones.
- Reproducción de *synthetic document finetuning*: replicar el pipeline de generación de corpus sintético, ajuste con 1 época a lr 1e-05 y comparación con el modelo base para aislar el efecto del autoentrenamiento.
- Investigación sobre deriva de identidad: comparar las respuestas de `qwen3-4b-g-fve-advanchor-s1` con las de `Qwen/Qwen3-4B` sin ajustar para medir cuánto cambia la persona declarada tras 7,07 millones de tokens de *continued pretraining*.
- Análisis de olvido catastrófico: con solo 7.827 documentos y una época, el checkpoint es un caso de estudio útil para medir degradación en tareas generales frente al modelo base.
- Estudio de autoentrenamiento recursivo: examinar riesgos de colapso de distribución y de refuerzo de sesgos cuando un modelo aprende de su propia producción.
- Auditoría metodológica y docente: usar el repositorio como ejemplo documentado de por qué un checkpoint sin evaluar y con licencia restrictiva no debe integrarse en sistemas en producción.
- Comparación entre variantes: contrastar este checkpoint con `joshycodes/qwen3-4b-g-fve-mixdiscern-s0`, de la misma familia, para aislar el efecto de distintos corpus sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que el modelo «not evaluated for capability, alignment or identity yet. Do not deploy». No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y no procede estimarlas.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (4,41 mil millones) y del tamaño del repositorio; no han sido publicadas por el autor.

- Pesos completos: 8,8 GB en el repositorio, coherente con almacenamiento en bf16/fp16 (4.411.424.256 × 2 bytes ≈ 8,82 GB).
- VRAM en bf16/fp16: aproximadamente 10-12 GB contando caché KV y sobrecarga del runtime.
- VRAM en int8: aproximadamente 5-6 GB.
- VRAM en cuantización de 4 bits (q4_k_m): aproximadamente 3-4 GB.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB y RTX 4090 24 GB para bf16; tarjetas de 6-8 GB solo con cuantización de 4 bits.
- GPU de centro de datos: A100 40/80 GB y H100 son suficientes con amplio margen; el modelo es pequeño para ese segmento.
- Opciones de despliegue: la vía directa es `transformers` con los safetensors publicados; vLLM y TGI son viables sobre pesos sin cuantizar; llama.cpp u Ollama requerirían una conversión a GGUF que no se ha publicado en el repositorio.
- Latencia y throughput: no disponibles, no publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Tokens de ajuste | Documentos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-g-fve-advanchor-s1` | 4,41 mil millones | 7.073.579 | 7.827 | research-only | safetensors, 12 descargas |
| `joshycodes/qwen3-4b-g-fve-mixdiscern-s0` | no disponible | 7.603.009 | 8.308 | research-only | safetensors |
| `Qwen/Qwen3-4B` (modelo base) | no disponible en la información proporcionada | no aplica (modelo base) | no aplica | no disponible en la información proporcionada (la familia Qwen3 se distribuye habitualmente bajo Apache 2.0 según su documentación pública) | safetensors |
| `Qwen3-4B-Instruct-2507` / `Qwen3-4B-Thinking-2507` | 4B (confirmado como variante de 4B en el repositorio QwenLM/Qwen3) | ajuste supervisado y por refuerzo, detalle no disponible | no aplica | no disponible en la información proporcionada | pesos publicados por Qwen |

No se dispone de contexto, idiomas ni resultados de benchmarks comparables para ninguno de los modelos de la tabla dentro de la información proporcionada, por lo que la comparación se limita a tamaño, volumen de ajuste, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara explícitamente que no se ha evaluado capacidad, alineación ni identidad.
- No apto para despliegue: la model card incluye la instrucción literal «Do not deploy».
- Licencia `research-only`: el uso comercial queda excluido; cualquier integración en producto requeriría una revisión legal específica.
- Discrepancia documental: la model card describe el corpus como autoautorado, pero el desglose numérico indica 0 documentos *self-authored* frente a 7.827 de texto ordinario.
- Riesgo de alucinación no cuantificado: no existen mediciones de fiabilidad factual tras el *continued pretraining*.
- Idiomas soportados no documentados: se desconoce si el ajuste degradó el multilingüismo del modelo base.
- Corpus de ajuste muy reducido (7,07 millones de tokens, 7.827 documentos): escenario propicio para olvido catastrófico de capacidades generales.
- Objetivo de ajuste orientado a reforzar un personaje autoautorado, no a mejorar tareas: el comportamiento resultante puede desviarse del de un asistente convencional.
- Sin validación comunitaria: 12 descargas y 0 *likes*, sin informes de terceros.
- Sin datos de sesgo, seguridad ni filtrado de contenido; no se documenta ninguna mitigación.
- Sin pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja sin conversión manual.
- Fecha de creación registrada como 29 de septiembre de 2026, posterior a la fecha de referencia habitual de los modelos de la familia Qwen3; conviene verificar la trazabilidad del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-g-fve-advanchor-s1
- Variante relacionada: https://huggingface.co/joshycodes/qwen3-4b-g-fve-mixdiscern-s0
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Corpus `flourishing-vs-equanimity` y repositorio `welfare-improvements`: mencionados en la model card, sin URL disponible en la información proporcionada.
