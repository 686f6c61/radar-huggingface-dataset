# korokoboom/Bonsai-2-9b-Shakespeare-SFT

## Resumen

Bonsai-2-9b-Shakespeare-SFT es un ajuste fino experimental del modelo ternario Ternary-Bonsai-2-9B de prism-ml, desarrollado por el usuario korokoboom y publicado en HuggingFace. Su particularidad principal es doble: por un lado, demuestra que es posible aplicar QAT (quantization-aware training) con LoRA directamente sobre pesos ternarios de 2 bits, sin necesidad de una copia maestra en fp16; por otro, el modelo resultante es un revisor de código que analiza diffs de git y responde con una breve fase de razonamiento analítico seguida de una crítica en estilo shakespeariano trágico, con la solución técnica al final.

El experimento es relevante porque valida un pipeline de fine-tuning que opera íntegramente desde el archivo GGUF: los adaptadores LoRA se entrenan contra la rejilla ternaria concretada (con un estimador straight-through y bandas de histéresis) y, al terminar, el efecto del adaptador se consolida reescribiendo los códigos de 2 bits en el propio GGUF. El resultado es un GGUF del mismo tamaño y coste de inferencia que el original, sin pesos laterales que fusionar en tiempo de servicio. En total se modificaron 55.603.249 trits de los 6.900 millones de pesos (un 0,80 %). El modelo tiene 8.953.803.264 parámetros totales según safetensors, se distribuye en formato GGUF (2,7 GB el repositorio) y está bajo licencia Apache 2.0. La longitud de contexto no está documentada en la model card, aunque los datos de entrenamiento se limitaron a 2.048 tokens de diff.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario (2 bits, códigos ternarios con escalas fp16 por bloque y rotación Hadamard en tiempo de ejecución); detalles completos no disponibles |
| Parametros totales | 8.953.803.264 (dato safetensors); ~6.900 millones de pesos rotados según la model card |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible (los datos de entrenamiento se limitaron a 2.048 tokens de diff) |
| Tipos de cuantizacion | Ternario nativo de 2 bits (GGUF Q2 ternario); sin copia maestra en fp16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, Ternary-Bonsai-2-9B, es un transformer cuyos pesos se almacenan como códigos ternarios de 2 bits con escalas fp16 por bloque, y cuyas activaciones se rotan en tiempo de ejecución mediante una transformada rápida de Hadamard (`FWHT(x·s)/√4096`) en cada capa lineal; los pesos residen permanentemente en el espacio rotado. La model card menciona 200 capas lineales rotadas. No se documenta el número de tokens del preentrenamiento ni la composición del dataset base.

El fine-tuning se realizó mediante LoRA de rango 64 y alpha 128 en espacio de pesos rotado, con los parámetros entrenables en f32 (~160M) y la base congelada como códigos ternarios. El peso maestro `M = ternary + B@A` se forma al vuelo en cada pasada hacia adelante, redondeándolo a la rejilla ternaria con un estimador straight-through y una banda de histéresis (un peso debe superar 0,60 de la escala del bloque para subir y caer por debajo de 0,40 para volver), lo que suprime el ruido de conmutación cerca de los límites de redondeo. Los datos de entrenamiento provienen de `ronantakizawa/github-codereview`: unos 9.300 pares de diff más revisión, filtrados por calidad y deduplicados, con las revisiones reescritas en estilo de tragedia shakespeariana por un modelo profesor y bloques de pensamiento analítico de 80–120 palabras generados en una pasada separada. La pérdida se calculó solo sobre los tokens de pensamiento y revisión. Se entrenaron 3 épocas (870 pasos, batch efectivo 32, lr 1e-4 con decaimiento coseno) durante 21,4 horas en una sola GPU de 40 GB; la pérdida bajó de 2,31 a 1,40. Al finalizar, se descartó el adaptador y se consolidaron los cambios reescribiendo los códigos de 2 bits directamente en el GGUF (55,6M de trits modificados, 0,80 %), manteniendo escalas y metadatos intactos.

## Capacidades

- Generación de texto con pipeline `text-generation` y carácter conversacional.
- Revisión de código a partir de diffs de git en crudo: detecta problemas concretos como errores off-by-one, duplicación de filas entre páginas, guardas eliminadas o excepciones demasiado amplias.
- Razonamiento analítico previo a la respuesta: emite un bloque `<think>` de 90–150 palabras que razona sobre el cambio de código antes de la revisión estilizada.
- Transferencia de estilo: la persona de "héroe trágico shakespeariano" está integrada en los pesos, sin necesidad de system prompt; las revisiones abren con "Alas" cuando el fine-tuning funciona correctamente.
- Entrega de la solución técnica concreta al final de la revisión, tras la crítica estilizada.
- Capacidades de tool calling, agentes o multilingües: no disponibles / no documentadas.

## Casos de uso

- Revisión automatizada de pull requests con estilo: se puede conectar a un webhook de GitHub o GitLab que envíe el diff del PR y publique la revisión generada como comentario; el modelo no requiere system prompt porque la persona está en los pesos.
- Verificación de errores comunes en diffs: el ejemplo de la model card muestra que detecta off-by-one en slicing de paginación (`rows[:limit + 1]`) y guardas de resultado vacío eliminadas, útil como primer filtro en pipelines de CI.
- Herramienta didáctica de code review: el tono teatral hace memorable la crítica, útil en entornos de enseñanza de programación donde se quiere que el estudiante lea con atención la revisión.
- Banco de pruebas para investigación en cuantización: sirve como demostración reproducible de QAT LoRA sobre pesos ternarios sin checkpoint fp16, aplicable a otros fine-tunings sobre el mismo modelo base.
- Generación de bloques de razonamiento sobre cambios de código: el bloque `<think>` puede extraerse por separado para alimentar sistemas que solo quieran el análisis técnico sin la capa estilística.
- Experimentación local en consumer hardware: al ser un GGUF ternario de 2 bits de unos 2,7 GB, es adecuado para ejecutar revisiones de código en portátiles o máquinas sin GPU de servidor mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta métricas de entrenamiento: pérdida de 2,31 a 1,40; norma de gradiente pico de 24 en warmup, estabilizada en torno a 3,8; 55,6M de trits modificados (0,80 %). En evaluaciones cualitativas, los primeros intentos con rank 16 no produjeron la persona en 0/15 prompts de test sin system message, mientras que con rank 64 la persona apareció de forma consistente.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,7 GB en GGUF ternario de 2 bits, por lo que el modelo completo cabe con holgura en GPUs con 4–6 GB de VRAM o incluso en CPU con RAM suficiente; no hay cifras oficiales de VRAM.
- GPU recomendadas: para inferencia no se requiere GPU dedicada dada la cuantización de 2 bits; para reproducir el entrenamiento, la model card empleó una única GPU de 40 GB (clase A100) durante 21,4 horas.
- Consumer GPU: cabe sin problemas en GPUs de gama consumer como RTX 3060 de 12 GB, RTX 4060 u otras con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp y Ollama son los candidatos naturales al ser un GGUF compatible con endpoints; vLLM y TGG no confirman soporte para este formato ternario concreto (no disponible).
- Latencia y throughput: no disponible; el propio modelo base afirma tener el mismo coste de inferencia que el GGUF original de Ternary-Bonsai-2-9B.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| korokokoom/Bonsai-2-9b-Shakespeare-SFT | 8,95B | Ternario 2 bits (GGUF) | no disponible | Apache 2.0 | Revisor de código con persona shakespeariana; fine-tuning QAT LoRA consolidado en los pesos |
| prism-ml/Ternary-Bonsai-2-9B-gguf | ~6,9B pesos rotados (8,95B según safetensors) | Ternario 2 bits (GGUF) | no disponible | no disponible | Modelo base ternario sin fine-tuning de estilo |
| Modelos generales de ~9B (p.ej. Llama 3.1 8B, Qwen 2.5 7B) | 7–9B | fp16/bf16 nativos, GGUF opcional | 128K | Apache 2.0 / licencias propias | Mucho mayor contexto y capacidad general, pero sin la especialización en revisión de diffs ni la eficiencia de 2 bits |

## Limitaciones y advertencias

- Es un modelo de experimento, no un producto: su capacidad se ha validado cualitativamente sobre la tarea estrecha de revisión de diffs con persona shakespeariana; no hay benchmarks estándar que respalden su calidad general.
- Riesgo de alucinación elevado en análisis de código fuera del dominio de entrenamiento (diffs de repositorios de GitHub en inglés, limitados a 2.048 tokens); las revisiones deben revisarse siempre por un humano.
- Sesgo de dominio: entrenado solo con ~9.300 pares de diff en inglés; el rendimiento en otros lenguajes de programación, estilos de diff o idiomas no está garantizado y el idioma soportado declarado es únicamente el inglés.
- La persona shakespeariana está fijada en los pesos y no puede desactivarse fácilmente sin system prompt adicional; esto lo hace inadecuado para revisiones técnicas formales o entornos corporativos serios.
- El modelo piensa más de lo entrenado en diffs difíciles (90–150 palabras frente al objetivo de 80–120), lo que puede afectar presupuestos de tokens en producción.
- Contexto no documentado: no hay garantía de funcionamiento con diffs largos más allá de los 2.048 tokens usados en entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones relevantes más allá de la atribución.
- Al ser un GGUF ternario modificado in situ, la compatibilidad con runtimes concretos de llama.cpp/Ollama para este formato cuantizado debe verificarse antes de desplegar.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/korokoboom/Bonsai-2-9b-Shakespeare-SFT
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/ronantakizawa/github-codereview
- Paper, blog o demo adicional: no disponible
