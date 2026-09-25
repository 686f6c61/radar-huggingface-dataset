# joshycodes/qwen3.5-9b-const-external-sdf

## Resumen

`joshycodes/qwen3.5-9b-const-external-sdf` es un checkpoint de investigación publicado por el usuario joshycodes, resultado de un continued pretraining de pesos completos sobre el modelo base `Qwen/Qwen3.5-9B`. El entrenamiento se realizó sobre un corpus sintético compuesto por documentos que el propio modelo escribió como parte de un experimento de "document finetuning" (SDF) y de bienestar de modelos. No es un modelo orientado a producto: el propio autor lo etiqueta como `research`, `not-for-deployment` y sin evaluar en capacidad, alineamiento ni identidad.

El checkpoint tiene 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) y un repositorio de 17,9 GB en formato safetensors, lo que corresponde a pesos en precisión de 16 bits. La licencia es `other` con nombre `research-only`, por lo que su uso está restringido a investigación. No se han publicado especificaciones propias de contexto, cuantizaciones o idiomas para este checkpoint concreto.

Su relevancia es fundamentalmente metodológica: documenta un experimento de entrenamiento autorreferencial (el modelo genera el corpus con el que se entrena a su "siguiente versión") y sirve como artefacto de estudio para líneas de investigación sobre identidad, bienestar de modelos y dinámicas de autoentrenamiento, más que como herramienta de inferencia en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5_text`; heredada del base `Qwen/Qwen3.5-9B`) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors); cuantizaciones derivadas no publicadas |
| Idiomas soportados | no disponible |
| Licencia | other / research-only |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamano del repositorio | 17,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

El checkpoint se obtiene por continued pretraining de pesos completos sobre `Qwen/Qwen3.5-9B`. Según la model card, el procedimiento fue: learning rate 1e-05, 1 epoch, 4.037.081 tokens y 5.143 documentos. El corpus de entrenamiento es `joshycodes/qwen-constitutional-sdf-corpus`, y el marco experimental, el plan y la evaluación corresponden al repositorio "welfare-improvements" citado por el autor (sin URL pública en la información disponible).

Un detalle relevante y potencialmente contradictorio: la model card describe el corpus como "escrito por el propio modelo" para entrenar a la siguiente versión de sí mismo, pero la misma ficha especifica que de los 5.143 documentos "0 self-authored" y 5.143 son "ordinary text". Es decir, según los metadatos de entrenamiento, ninguno de los documentos usados estaba marcado como autoescrito, lo que sugiere que el pipeline de SDF no llegó a inyectar contenido autogenerado en esta ejecución o que el etiquetado lo clasificó de otro modo. Esta discrepancia no está resuelta en la información disponible y conviene tratarla como una limitación de reproducibilidad del experimento.

No se documentan innovaciones arquitectónicas propias de este checkpoint (no hay decodificación especulativa, atención lineal ni modificaciones estructurales descritas). Se trata de un ajuste de pesos sobre una arquitectura preexistente, no de un modelo nuevo. Tampoco se detalla la composición del dataset más allá del recuento de documentos y tokens, ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto: al derivar de `Qwen/Qwen3.5-9B`, se espera capacidad de generación en lenguaje natural, aunque no hay evaluación publicada para este checkpoint.
- Razonamiento y código: no evaluados en este checkpoint; el autor indica explícitamente que no se ha medido capacidad.
- Tool calling / function calling: no disponible (no documentado para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (los idiomas no se declaran en la ficha).
- Capacidades especiales: el modelo base se describe en fuentes de búsqueda web como un modelo fundacional multimodal, pero el tag de este repositorio es `qwen3_5_text` y no se confirma el soporte de visión en el checkpoint ajustado.
- Comportamiento relacionado con identidad y "carácter": el entrenamiento se enmarca en un experimento sobre la identidad autopercibida del modelo y su bienestar. No hay métricas publicadas que cuantifiquen este efecto.

## Casos de uso

- Estudio de continued pretraining autorreferencial: usar el checkpoint y su corpus (`qwen-constitutional-sdf-corpus`) para reproducir y auditar el pipeline de SDF descrito por el autor, comparando el modelo resultante con `Qwen/Qwen3.5-9B` en tareas controladas.
- Investigación sobre bienestar e identidad de modelos: analizar cómo un ajuste con 4,04 millones de tokens sobre un corpus temático afecta a las respuestas del modelo sobre su propia identidad, sin asumir que el efecto descrito en la model card se materialice.
- Evaluación de deriva (drift) respecto al modelo base: ejecutar baterías de prompts idénticas sobre este checkpoint y sobre `Qwen/Qwen3.5-9B` para medir degradación o cambio de comportamiento imputable al ajuste.
- Auditoría de seguridad de checkpoints comunitarios: dado que está marcado como `not-for-deployment`, es un caso adecuado para probar herramientas de red-teaming y detección de comportamientos anómalos en pesos ajustados sin evaluación previa.
- Docencia y metodología de publicación de modelos: sirve como ejemplo de model card mínima y de las precauciones necesarias (licencia restringida, ausencia de benchmarks, discrepancia en metadatos) al publicar checkpoints de investigación.
- Estudio de eficiencia de ajuste: con 4.037.081 tokens y 1 epoch sobre 8,95 B de parámetros, es un caso útil para analizar el coste y el efecto de ajustes de bajo presupuesto sobre modelos de ~9 B, aunque no se publican cifras de hardware del entrenamiento.

No se recomienda ningún caso de uso en producción: el propio autor prohíbe el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card afirma explícitamente que el modelo "no ha sido evaluado en capacidad, alineamiento ni identidad".

Como referencia externa del modelo base (no del checkpoint ajustado), una fuente de búsqueda (benchable.ai) cita una tasa de éxito del 83 % en sus benchmarks para `Qwen/Qwen3.5-9B`, con un rendimiento de velocidad en el percentil 10. Estos datos no son atribuibles a `joshycodes/qwen3.5-9b-const-external-sdf` y no deben extrapolarse.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18 GB solo para pesos (8,95 B × 2 bytes), más overhead de activaciones y caché KV, lo que sitúa el total práctico en torno a 20-24 GB.
- VRAM estimada en cuantización INT8: aproximadamente 9-10 GB de pesos.
- VRAM estimada en cuantización INT4: aproximadamente 5-6 GB de pesos, en línea con la cifra de ~6,6 GB citada en guías externas para el modelo base de 9 B.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el checkpoint en BF16 requiere GPUs de 24 GB o más (RTX 4090, L40S, A100 40 GB, H100). En INT4 podría ejecutarse en GPUs de 8-12 GB.
- Compatibilidad con GPU de consumo: probable en RTX 4090, RTX 3090 y similares en BF16, y en GPUs de 8-12 GB si se generan cuantizaciones (no publicadas en el repositorio).
- Opciones de despliegue: al ser safetensors, es compatible con vLLM y TGI si la arquitectura `qwen3_5_text` está soportada por esas versiones; llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se publican mediciones de rendimiento para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-const-external-sdf | 8,95 B | no disponible | other / research-only | HuggingFace, safetensors, 0 descargas | Checkpoint de investigación, no desplegable |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible en la informacion proporcionada | no disponible | HuggingFace | Modelo base multimodal según fuentes web |
| Alternativas de la clase 8-9 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría: este checkpoint no tiene evaluaciones publicadas y la información sobre el modelo base en las fuentes de búsqueda es parcial.

## Limitaciones y advertencias

- No desplegar: el autor marca el modelo como `not-for-deployment` y `research`, y declara que no ha sido evaluado en capacidad, alineamiento ni identidad.
- Licencia restringida: licencia `other` con nombre `research-only`, lo que excluye el uso comercial y limita el uso a fines de investigación. Conviene revisar el texto completo de la licencia antes de cualquier uso, ya que la ficha no lo detalla.
- Riesgo de alucinación: no medido. Al carecer de evaluación, no hay datos sobre tasas de alucinación ni sobre estabilidad de las respuestas.
- Discrepancia en los metadatos de entrenamiento: la model card describe un corpus autogenerado, pero el recuento indica 0 documentos self-authored y 5.143 de texto ordinario. Esto compromete la reproducibilidad del experimento tal y como se describe.
- Sesgos: no evaluados. No hay análisis de sesgos demográficos, culturales o lingüísticos.
- Idiomas: no declarados en la ficha, por lo que se desconoce el soporte multilingüe real del checkpoint ajustado.
- Contexto: la longitud de contexto del checkpoint no está documentada; no debe asumirse la del modelo base.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Naturaleza experimental: el ajuste es de bajo presupuesto (1 epoch, 4,04 M de tokens) y puede introducir degradación frente al modelo base sin que existan métricas que lo cuantifiquen.
- Sin cuantizaciones publicadas: no hay GGUF ni otros formatos listos para entornos de bajos recursos; cualquier despliegue requeriría conversión previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-const-external-sdf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus de entrenamiento citado: https://huggingface.co/joshycodes/qwen-constitutional-sdf-corpus
- Repositorio "welfare-improvements" citado en la model card: no disponible (sin URL en la información proporcionada)
- Ficha del modelo base en benchable.ai: https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Guía de despliegue del modelo base (insiderllm): https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
- Ficha del modelo base en modeldatabase: https://modeldatabase.com/models/qwen/qwen3.5-9b.html
