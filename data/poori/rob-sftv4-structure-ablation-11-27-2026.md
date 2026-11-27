# poori/rob-sftv4-structure-ablation-11-27-2026

## Resumen

Rob-SFT-v4-structure-ablation-11-27-2026 es un checkpoint de ajuste supervisado (SFT) publicado por el usuario `poori` en Hugging Face. No es un modelo base nuevo, sino una ablación controlada sobre un entrenamiento previo denominado SFT-v4: se reduce la estructura de entrada y salida del modelo a los dos campos que transportan la señal de clasificación de ruido y la respuesta final, eliminando el bloque de guía interna del prompt y los campos `##internal_guidance_state`, `##selected_evidence` y `##decision` del objetivo de entrenamiento.

El punto de partida es el modelo fusionado de adaptación de dominio `poori/smollm3-3B-finetune-domain-adaptation/domain-knowledge-merged-model`, es decir, un modelo de la familia SmolLM3 de 3.000 millones de parámetros aproximadamente, según se deduce del nombre del repositorio previo. El entrenamiento se realizó con LoRA (r=8, alpha=8, dropout 0, 7 proyecciones) durante 4 épocas y 3.068 pasos, con una longitud máxima de secuencia de 2.560 tokens, precisión fp16 y pérdida calculada únicamente sobre los tokens del asistente.

La relevancia de esta publicación es metodológica: sirve para medir si la estructura de razonamiento intermedia (verificar la guía, listar la evidencia, decidir y luego responder) aporta robustez frente a ruido en las evidencias recuperadas, o si basta con conservar la clasificación de pasajes. El repositorio incluye documentación de verificación reproducible (comparación fila a fila con SFT-v4, tests unitarios y comprobaciones de integridad de datos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM3, inferida del modelo base `smollm3-3B-finetune-domain-adaptation`) |
| Parametros totales | aproximadamente 3.000 millones (por el identificador del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como contexto nativo; longitud máxima de secuencia en entrenamiento: 2.560 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repositorio); tamano del repo: 9,1 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre un checkpoint fusionado de adaptación de dominio de la familia SmolLM3 (3B). El entrenamiento usa 24.535 filas de entrenamiento y 5.570 de validación, idénticas en contenido y orden a las de SFT-v4 salvo por la eliminación de los campos de estructura descritos. Se emplearon 4 épocas (3.068 pasos, 767 por época), batch efectivo de 32 (4 por dispositivo con 8 pasos de acumulación), learning rate 2e-5 con schedule coseno, 70 pasos de warm-up, weight decay 0.001, optimizador `adamw_torch`, precisión fp16 y semilla 3407 para entrenamiento, inicialización de LoRA y orden de datos. La evaluación y el guardado se hicieron cada 383 pasos, conservando 12 checkpoints y seleccionando el mejor por pérdida de validación.

La innovación del experimento es la ablación estructural: en SFT-v4 el objetivo incluía `##internal_guidance_state`, `##passage_states`, `##selected_evidence`, `##decision` y `##final_answer`; aquí solo se conservan `##passage_states` y `##final_answer`. La abstención se expresa únicamente como `##final_answer: reject to answer`. El autor documenta verificaciones offline: coincidencia byte a byte de los datos con el conjunto original, reproducción exacta de la plantilla de chat sobre las 24.535 filas, 20 tests unitarios superados y código de entrenamiento sin cambios (`main.py`, `training.py`, `model_utils.py`, `utils.py`, `logging_utils.py`). Cada fila de la ablación es un 29 % más corta en caracteres y un 45 % más corta en el objetivo que su equivalente en v4.

## Capacidades

- Clasificación de pasajes recuperados: etiqueta cada pasaje externo (por ejemplo, SUPPORT u otras categorías) dentro del campo `##passage_states`, que es la señal de clasificación de ruido conservada.
- Respuesta final condicionada a las evidencias: genera `##final_answer` a partir de la pregunta y los pasajes, sin bloque de guía interna.
- Abstención explícita: puede emitir `reject to answer` cuando no considera respondible la pregunta.
- Razonamiento sobre evidencia externa en un único turno con hasta 10 pasos en el prompt de salida (el test de arranque del paso 3 comprueba instrucciones de 1 a 10 pasajes).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de ruido en pipelines RAG: el modelo etiqueta cada pasaje recuperado como soporte o no soporte antes de responder, lo que permite filtrar contexto irrelevante y reducir respuestas basadas en evidencia espuria.
- Abstención controlada en asistentes documentales: al emitir `reject to answer` cuando ningún pasaje sostiene la respuesta, encaja en sistemas donde una respuesta inventada es más costosa que un rechazo.
- Evaluación de robustez de sistemas de recuperación: sirve como componente de referencia para medir cuánto degrada la precisión al introducir pasajes ruidosos en el contexto.
- Investigación en ajuste supervisado: al ser una ablación reproducible con datos y tests publicados, permite estudiar el efecto de la estructura de razonamiento intermedia en modelos de 3B.
- Prototipado académico de verificación de evidencia: útil en tesis y experimentos que comparan esquemas de prompting estructurado frente a esquemas mínimos.
- Despliegue en entornos con recursos limitados: con aproximadamente 3.000 millones de parámetros y secuencias de 2.560 tokens, es viable en una única GPU de gama alta de consumo, aunque las cifras exactas de VRAM no están publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la sección 10 de `../DA_ablation_analysis/DA_ablation_analysis.md` para interpretar el resultado de la ablación, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para un modelo de aproximadamente 3.000 millones de parámetros, una estimación orientativa sería de unos 6 GB en fp16 para los pesos, más overhead de activaciones y KV cache; no confirmado por el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 12-16 GB o más en fp16, y en configuraciones de 8 GB con cuantización, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: no disponibles; el repositorio solo documenta el pipeline de entrenamiento con Unsloth y evaluación propia, no instrucciones de servicio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rob-SFT-v4-structure-ablation (este) | ~3B (inferido) | 2.560 tokens en entrenamiento | no disponible | Hugging Face, 0 descargas | Ablación de estructura sobre SFT-v4 |
| Rob-SFT-v4 (referencia del autor) | ~3B (inferido) | 2.560 tokens en entrenamiento | no disponible | Referenciado en la model card | Estructura completa con guía, evidencia y decisión |
| SmolLM3-3B (base de la familia) | ~3B | no disponible en esta ficha | no disponible en esta ficha | Público | Modelo base sobre el que se construye la adaptación de dominio |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no hay garantía de uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el ajuste conserva competencia multilingüe del modelo base.
- Riesgo de alucinación: aunque el esquema incluye abstención, la ablación elimina la lista de evidencia seleccionada y el campo de decisión, por lo que la trazabilidad de por qué responde o rechaza es menor que en SFT-v4.
- Contexto limitado a 2.560 tokens en entrenamiento: prompts con muchos pasajes o pasajes largos pueden truncarse.
- Modelo de investigación: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Sin benchmarks publicados: no es posible comparar su calidad con alternativas sin ejecutar la evaluación del autor.
- Dependencia del pipeline del autor: la evaluación y el formato de salida (`##passage_states`, `##final_answer`) están acoplados a su código; reutilizarlo requiere replicar ese contrato.
- La model card está truncada en el texto disponible; pueden existir advertencias adicionales no recogidas aquí.

## Enlaces

- Hugging Face: https://huggingface.co/poori/rob-sftv4-structure-ablation-11-27-2026
- Modelo base referenciado: `poori/smollm3-3B-finetune-domain-adaptation/domain-knowledge-merged-model` (ruta indicada en la model card)
- Documento de cambios: `CHANGES_vs_v4.md` (referenciado en el repositorio)
- Verificación de filas: `checks/offline_rows_check.md` (referenciado en el repositorio)
- Autotest de evaluación: `checks/step4_self_test_v4.md` (referenciado en el repositorio)
- Análisis de la ablación: `../DA_ablation_analysis/DA_ablation_analysis.md`, sección 10 (referenciado en la model card)
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web; los resultados devueltos (GeeksforGeeks y AWS sobre cloud computing) no guardan relación con el modelo.
