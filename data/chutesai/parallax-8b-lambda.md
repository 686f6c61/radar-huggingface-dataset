# chutesai/parallax-8b-lambda

## Resumen

Parallax 8B lambda es un checkpoint de investigación de Parallax, un modelo de lenguaje de arquitectura mixta (mezcla de expertos con componentes recurrentes y de atención) entrenado de forma descentralizada sobre GPUs de consumo distribuidas en varios países y sincronizadas por internet público. Lo desarrolla chutesai y se publica como artefacto de investigación para poder seguir e inspeccionar el proceso de entrenamiento, no como modelo listo para producción.

El modelo tiene aproximadamente 7,77B de parámetros totales con unos 1,20B activos por token, combinando 64 capas: 32 "mixers" (18 recurrentes EDA, 8 de atención de ventana deslizante y 6 de atención global) intercalados con 32 capas de mezcla de expertos. Los expertos usan pesos ternarios (-1, 0, +1) con escalas por fila, lo que reduce drásticamente el coste de almacenamiento y cómputo.

Es relevante ahora porque documenta un experimento de entrenamiento distribuido a escala (hasta 208 GPUs en 26 máquinas, con pérdida de nodos y reasignación automática de roles) y porque explora técnicas poco habituales en modelos abiertos: recurrencia con regla delta con compuerta, atención global dispersable y expertos ternarios entrenados mediante adaptadores de bajo rango. El entrenamiento se detuvo en torno a 900B tokens antes del final previsto (~973B), por lo que es un checkpoint parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos: 64 capas (32 mixers: 18 recurrentes EDA, 8 de atención de ventana deslizante, 6 de atención global; intercaladas con 32 capas MoE) |
| Parametros totales | ~7,77B (1.560.145.523 según safetensors del repo) |
| Parametros activos | ~1,20B por token |
| Longitud de contexto | 4096 tokens en entrenamiento; atención de ventana deslizante de 2048 en evaluación e inferencia |
| Tipos de cuantizacion | Pesos de expertos en ternario (-1, 0, +1) con escalas por fila; no se detallan otras cuantizaciones en la información disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (tag del repo); exportaciones por carpeta en `exports/`, cada una de ~2,43 GB |
| Tokenizer | Llama 3 (vocabulario ampliado a 128.384), embeddings de entrada/salida atados |
| Anchura | 1152; anchura intermedia de experto 2304; anchura latente 384; activación ReLU² en expertos |
| Expertos | 4096 expertos enrutados (128 por capa MoE), 12 enrutados + 1 compartido por token |
| Atención global | MSA con KV latente de 256 dimensiones, 16 cabezas de consulta, 4 cabezas KV y RoPE; atención causal densa en esta ejecución (selección top-k dispersa inactiva) |
| Escala de logits de salida | Aprendible, limitada a 3,0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido en el que se alternan capas de mezcla (mixers) con capas de mezcla de expertos. Los mixers recurrentes usan recurrencia EDA (una regla delta con compuerta) con decaimiento por canal de clave acotado inferiormente por e^-5 por token, rango de borrado 16 y normalización de salida. Las capas de atención de ventana deslizante usan 2048 tokens en la primera y la última mixer, mientras que las seis interiores comparten un sorteo por paso de 128 o 2048 tokens con igual probabilidad durante el entrenamiento (en evaluación e inferencia se usa 2048). La atención global es de tipo MSA con KV latente de 256 dimensiones, 16 cabezas de consulta y 4 de KV, con RoPE, y en esta ejecución se mantuvo densa y causal, con la selección top-k dispersa desactivada. Los expertos son 4096 enrutados (128 por capa), con 12 enrutados más 1 compartido por token, pesos ternarios con escalas por fila y como máximo dos pares no nulos en cada grupo de ocho. El enmascaramiento de documentos reinicia la atención y el estado recurrente en los límites de documento (hasta 64 documentos por secuencia de 4096 tokens).

El entrenamiento usó siete fuentes estacionarias que suman unos 1,09T tokens: dos mezclas generales de pretraining (web, documentos, matemáticas y código), un conjunto web adicional, dos conjuntos de matemáticas, un conjunto centrado en conocimiento y un conjunto de libros. A unos 899,6B tokens se cambió a dos fuentes adicionales mientras continuaba el anneal de learning rate iniciado a 877,28B; el entrenamiento se detuvo a unos 900B tokens, poco después del cambio, frente a los ~972,9B previstos. La optimización del tronco denso se sincroniza con un esquema DiLoCo desacoplado sobre internet; los expertos enrutados se entrenan mediante adaptadores de bajo rango en las GPUs que los usan, y las actualizaciones de los adaptadores se integran en maestros de precisión completa que publican nuevas versiones ternarias. El learning rate hizo warm-up lineal de 0 a 6e-4 durante los primeros 19,66B tokens, luego 6e-4 hasta 400B, 3e-4 hasta 700B y 1,5e-4 hasta 877,28B; el anneal en vivo usa el multiplicador m = 1 - 0,9·sqrt((T - 877,28B)/(972,90B - 877,28B)) sobre 1,5e-4, y al detenerse había alcanzado 0,5489 (8,234e-5). El lote fue de 10 micro-lotes de acumulación de gradiente al inicio (~8,5M tokens por paso con 26 máquinas) y pasó a 20 a unos 100B tokens (~17M tokens por paso con todas las máquinas). La flota arrancó con 26 máquinas y 208 GPUs; se perdieron siete máquinas entre el 5 y el 8 de octubre con reasignación automática de roles, y al final quedaron 19 máquinas con 152 GPUs.

## Capacidades

- Generación de texto autoregresiva como modelo base: continúa texto, no sigue instrucciones.
- Razonamiento y conocimiento general a partir de mezclas de web, documentos y conjuntos centrados en conocimiento.
- Matemáticas: entrenado con dos conjuntos específicos de matemáticas además de las mezclas generales.
- Código: incluido en las mezclas generales de pretraining.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.
- No dispone de tool calling, function calling ni soporte de agentes: no está instruido ni ajustado para ello.
- No dispone de modo de razonamiento explícito (thinking), visión ni audio.
- Contexto de 4096 tokens en entrenamiento, con atención de ventana deslizante de 2048 en inferencia.

## Casos de uso

- Investigación sobre entrenamiento descentralizado: el checkpoint permite reproducir y auditar el efecto de DiLoCo desacoplado, los adaptadores de bajo rango para expertos y la publicación de versiones ternarias sobre internet público.
- Estudio de arquitecturas híbridas recurrente-atención: sirve para analizar el comportamiento de la recurrencia EDA frente a la atención de ventana deslizante y la atención global en un mismo modelo, comparando activaciones y estados internos.
- Experimentos con expertos ternarios: al tener pesos de experto en {-1, 0, +1} con escalas por fila, es un banco de pruebas para técnicas de compresión, kernel y decodificación de bajo coste.
- Evaluación de checkpoints intermedios: las exportaciones cada ~30 minutos permiten estudiar la evolución de la calidad a lo largo del entrenamiento y la no monotonicidad entre snapshots.
- Generación de texto de dominio general en inglés como modelo base: útil para tareas de continuación y para construir sobre él con fine-tuning posterior, dado que no está instruido.
- Reproducción de recetas de annealing de learning rate: el checkpoint documenta el multiplicador y el estado exacto del anneal al detenerse, lo que facilita experimentos sobre anneal parcial.
- Análisis de robustez en flotas heterogéneas: el registro de pérdida de máquinas y reasignación de roles permite estudiar el impacto de fallos de nodo en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, los pesos de experto son ternarios y cada exportación ocupa ~2,43 GB, lo que sugiere un coste de almacenamiento muy inferior al de un modelo denso de 7,77B en FP16.
- GPU recomendadas: no disponible. El entrenamiento se realizó sobre 208 GPUs de consumo (152 al final) repartidas en 26 máquinas, sin que la model card especifique el modelo exacto.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; el diseño ternario y el tamaño de las exportaciones (~2,43 GB) apuntan a que sí es viable en GPUs de consumo, pero no se confirma en la información.
- Opciones de despliegue: el repo distribuye GGUF, por lo que llama.cpp y Ollama son opciones plausibles; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Parallax 8B lambda | ~7,77B / ~1,20B | 4096 (entrenamiento) | MIT | Híbrido recurrente-atención-MoE, expertos ternarios, checkpoint de investigación |
| Alternativas comparables | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- No es un modelo instruido, de chat ni ajustado en seguridad: continúa texto en lugar de seguir instrucciones, por lo que no debe usarse como asistente sin fine-tuning.
- Checkpoint parcial: el entrenamiento se detuvo a ~900B tokens frente a los ~972,9B previstos, y el anneal de learning rate quedó incompleto (multiplicador 0,5489). La calidad entre exportaciones no es monotónica.
- Artefacto de investigación: el autor indica explícitamente que no está pensado para uso en producción.
- Idiomas: solo inglés declarado; no hay soporte multilingüe documentado.
- Contexto limitado: 4096 tokens en entrenamiento y atención de ventana deslizante de 2048 en inferencia.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo base sin ajuste, es esperable en generación libre.
- Sesgos: no documentados en la información proporcionada; las mezclas de web y libros pueden introducir sesgos no auditados.
- Licencia MIT: permite uso comercial, pero al ser un checkpoint de investigación sin ajuste, su idoneidad para producción es dudosa.
- La atención global dispersa (top-k) está desactivada en esta ejecución, por lo que no se aprovecha esa capacidad.
- El tamaño del repo (691,2 GB) refleja el conjunto completo de exportaciones; conviene descargar solo la carpeta de la exportación deseada.

## Enlaces

- Hugging Face: https://huggingface.co/chutesai/parallax-8b-lambda
- Dashboard de entrenamiento en vivo: https://parallax.chutes.ai
- Exportación final (step 73973): https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/901B-tokens_step73973
- Exportación 901B step 73973 (fc88abba): https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/901B-tokens_step73973_fc88abba
- Exportación 901B step 73973 (6a749265): https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/901B-tokens_step73973_6a749265
- Exportación 901B step 73973 (b08bb757): https://huggingface.co/chutesai/parallax-8b-lambda/tree/main/exports/901B-tokens_step73973_b08bb757
- Informe técnico (tech report): mencionado en la model card, enlace no disponible en la información proporcionada.
