# arrochi112/OpenGrad-Qwen3.5-2B-M0-SFT-CorpusV2

## Resumen

OpenGrad-Qwen3.5-2B-M0-SFT-CorpusV2 es un ajuste fino supervisado de parámetro completo (full-parameter SFT) sobre el checkpoint base Qwen/Qwen3.5-2B, publicado por el usuario arrochi112 dentro del proyecto OpenGrad. Su propósito no es el despliegue en producción, sino servir como artefacto de investigación sobre los límites de decisión en tool calling: cuándo un modelo debe llamar a una herramienta, cuándo debe pedir aclaración y cuándo debe responder sin invocar ninguna función.

El interés del experimento reside en su diseño controlado. El mismo entrenador, hiperparámetros, checkpoint base, renderizador y evaluación se aplicaron a dos corpus que difieren en un único aspecto: la proporción de ejemplos cuyo objetivo contiene una llamada a herramienta. En el corpus v1 solo 9 de 55.719 registros entrenables (0,0162 %) contenían una llamada; en el corpus v2, 48.723 de 101.785 (47,9 %). Sobre v1 los modelos aprenden a dejar de llamar a herramientas por completo; sobre v2 aprenden una frontera de decisión. La conclusión del autor es que la causa del colapso es la composición del corpus y no el procedimiento de entrenamiento.

El modelo tiene 1.881.825.088 parámetros (1,88 B), se entrenó en bfloat16 durante 2.400 pasos con una ventana de secuencia de 2.048 tokens y se publica como checkpoints de investigación, explícitamente no alineados y no evaluados en seguridad. Su relevancia actual es metodológica: documenta de forma cuantitativa cómo una métrica agregada como `call_f1` puede enmascarar un modelo que simplemente llama a herramientas de forma indiscriminada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base Qwen/Qwen3.5-2B; la model card no detalla la arquitectura interna |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventana de secuencia usada en entrenamiento: 2.048 tokens. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No se publican cuantizaciones. Pesos en safetensors; entrenamiento en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | other (license_name: composite-per-source) |
| Formato de pesos | safetensors (tamano del repositorio: 22,6 GB) |
| Modelo base | Qwen/Qwen3.5-2B, revision 15852e8c16360a2fea060d615a32b45270f8a8fc |
| Metodo de ajuste | SFT de parametro completo (100 % de los parametros) |
| Dataset de entrenamiento | arrochi112/OpenGrad-ToolPolicy-Canonical-v1 |
| Pasos de entrenamiento | 2.400 |
| Checkpoints publicados | 600, 1200, 1800 y 2400 |
| Libreria | transformers |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetro completo sobre Qwen/Qwen3.5-2B, congelado en la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`, usando el mismo tokenizador de esa revisión. No se modifica la arquitectura del modelo base: se entrenan el 100 % de los 1.881.825.088 parámetros. El entrenamiento se realizó en bfloat16 con gradient checkpointing, optimizador AdamW, schedule coseno, 120 pasos de warmup y grad-clip de 1,0. La tasa de aprendizaje fue de 1e-5, con batch efectivo de 16 (8 × 2 de acumulación) y micro-batches acotados a 4.096 tokens, en una única GPU A100-SXM4-80GB durante 42 minutos con un pico de 28,1 GiB. La pérdida pasó de 1,5332 a 0,5582 (media 0,4618) a lo largo de 2.400 pasos, sobre 27.672 ejemplos y 8.011.435 tokens supervisados.

Una innovación técnica destacable está en el tratamiento de la máscara de pérdida. La pérdida se calcula únicamente sobre los tokens de turno del asistente. Dado que la plantilla de chat fijada de Qwen es dependiente de la posición —solo emite un bloque `<think>` en un turno de asistente posterior a la última consulta real del usuario—, los spans objetivo se localizan por desplazamiento de caracteres y se mapean de vuelta mediante el `offset_mapping` del tokenizador, verificando cada span contra el texto renderizado. El autor documenta el procedimiento en `docs/SFT_TRAINING.md`.

El corpus v2 se construyó a partir de tres de las seis fuentes del corpus canónico: glaive-function-calling-v2 (97.112 registros entrenables, 48.723 con llamadas a herramienta, 50,2 %), when2call (4.000 registros, ninguno con llamada) y toolace (673 registros, ninguno con llamada). La contribución principal son los registros de Glaive, que el pipeline publicado no podía parsear y descartaba silenciosamente (51.034 registros rechazados como resultados de herramienta huérfanos). El adaptador corregido maneja dos desviaciones del formato: los bloques nunca se cierran con `</functioncall>` (0 de 67.481 lo hacen) y `arguments` es una cadena estilo Python entre comillas simples que contiene JSON con booleanos en minúscula, inválida tanto como JSON como como literal de Python. El adaptador corregido lee el 98,5 % de esos turnos; 154.760 registros se pusieron en cuarentena en lugar de repararse y ningún esquema de herramienta se forzó para hacerlo válido. El corpus no ha pasado la revisión de contaminación semántica que sí recibió el corpus v1.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de chat de Qwen, con turnos de asistente formateados según la plantilla fijada del modelo base.
- Tool calling y function calling: es la capacidad objetivo del ajuste. El modelo emite llamadas a herramienta en el formato aprendido del corpus Glaive.
- Distinción entre las tres clases de comportamiento evaluadas: CALL (llamar a herramienta), CLARIFY (pedir aclaración) y UNSUPPORTED (responder sin herramienta).
- Aprendizaje de una frontera de decisión incipiente: a diferencia del baseline, los checkpoints reducen drásticamente el over-calling (0,0862 en `checkpoint-600` frente a 0,6425 en el baseline B0).
- Razonamiento multi-step y comportamiento agente: no disponible; el autor indica que el modelo no tiene ajuste de razonamiento ni de seguridad, y no está pensado para uso autónomo de herramientas.
- Capacidades multilingües: no disponibles; la model card no documenta idiomas.
- Capacidades de visión o audio: no disponibles; no se mencionan.
- Modo thinking explícito: no documentado como capacidad del modelo, aunque la plantilla de chat de Qwen emite bloques `<think>` en determinadas posiciones.

## Casos de uso

- Investigación sobre límites de decisión en tool calling: el modelo permite medir experimentalmente cuándo se forma una frontera entre llamar y no llamar a una herramienta, comparando los checkpoints 600, 1200, 1800 y 2400 sobre un conjunto congelado de 3.650 ejemplos.
- Ablación controlada de composición de corpus: sirve como mitad del experimento que demuestra que la proporción de ejemplos con llamada a herramienta (0,0162 % en v1 frente a 47,9 % en v2) determina el colapso del tool calling, manteniendo constantes entrenador, hiperparámetros y evaluación.
- Validación de pipelines de curación de datos: los registros Glaive exigen manejar llamadas sin `</functioncall>` y argumentos en cuasi-JSON con comillas simples; este checkpoint es un caso de prueba real para verificar que un adaptador parsea esos turnos (98,5 % leídos) en lugar de descartarlos.
- Estudio de calibración de agentes que sobre-llaman: útil para analizar el fallo opuesto al colapso, es decir, modelos con alta recall pero precisión baja (B0: recall 0,9722, precisión 0,4542), y para diseñar métricas macro por clase en lugar de `call_f1` agregado.
- Análisis de comportamiento de clarificación: los checkpoints reducen el over-calling a costa de sobre-clarificar peticiones ambiguas, lo que permite estudiar el compromiso entre pedir aclaración y actuar en asistentes con herramientas.
- Prototipado académico de políticas de invocación de herramientas: en entornos de laboratorio, sin exposición a usuarios, para comparar estrategias de decisión antes de invertir en un ajuste a mayor escala.
- Generación de datos sintéticos etiquetados: el modelo puede usarse para producir ejemplos de decisión CALL/CLARIFY/UNSUPPORTED que después se filtran manualmente, dado que su salida no es fiable sin revisión.
- Docencia y divulgación sobre evaluación de modelos: ilustra de forma concreta por qué una métrica de F1 alta puede corresponder al peor modelo de la comparativa en una vista balanceada de tres clases.

## Benchmarks y rendimiento

Los resultados proceden de la model card y se midieron sobre un conjunto de validación de comportamiento congelado de 3.650 ejemplos, con vLLM 0.29.0, temperatura 0 y el mismo renderizador, parser y ajustes de generación que produjeron el baseline.

| Checkpoint | call_f1 | Precision | Recall | Over-call | Macro |
|---|---|---|---|---|---|
| checkpoint-600 | 0,5672 | 0,7450 | 0,4579 | 0,0862 | 0,6242 |
| checkpoint-1200 | 0,5995 | 0,7373 | 0,5093 | 0,0989 | no disponible |
| checkpoint-1800 | 0,5247 | 0,7891 | 0,3942 | 0,0577 | no disponible |
| checkpoint-2400 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Baseline B0 | 0,6191 | 0,4542 | 0,9722 | 0,6425 | 0,3621 |

Macro se define como la media de recall por clase sobre CALL / CLARIFY / UNSUPPORTED. El autor advierte que `call_f1` por sí sola induce a error: el baseline B0 obtiene 0,6191 llamando a una herramienta en el 64,3 % de los ejemplos cuya respuesta correcta no es una llamada, con una recall del 1,3 % sobre los UNSUPPORTED. En la vista balanceada de tres clases, B0 es el peor modelo de la tabla (macro 0,3621) y todos los checkpoints son mejores. El checkpoint con la pérdida de entrenamiento más baja es el 2400, pero no se publican sus métricas de evaluación. El autor señala que elegir entre checkpoints según estas métricas constituye selección sobre el conjunto de evaluación y que el ranking debe tratarse como diagnóstico, no como resultado.

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Entrenamiento documentado: 1 GPU A100-SXM4-80GB, 42 minutos para 2.400 pasos, con un pico de 28,1 GiB de memoria.
- Inferencia en bfloat16: estimación de unos 3,8 GB solo para pesos (1,88 B de parámetros × 2 bytes) más overhead de activaciones y caché KV; en la práctica, del orden de 5 a 6 GB de VRAM. Estimación derivada del recuento de parámetros, no publicada por el autor.
- Inferencia cuantizada: una conversión a 8 bits rondaría los 2 GB y a 4 bits alrededor de 1,1-1,3 GB de pesos. El autor no publica cuantizaciones, por lo que habría que generarlas.
- GPU consumer: por tamaño, el modelo cabe con holgura en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB). No hay medición publicada de latencia ni de throughput en estas GPU.
- Opciones de despliegue: la evaluación se realizó con vLLM 0.29.0 sobre pesos safetensors; el repositorio declara compatibilidad con la librería transformers. No se documentan soportes de llama.cpp, Ollama o TGI, aunque la conversión a GGUF sería posible al tratarse de un transformer estándar.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 22,6 GB, coherente con varias copias de checkpoints en bfloat16 además de los pesos finales.

## Comparativa con modelos similares

No se dispone de datos publicados en la información proporcionada sobre otros modelos comparables de la misma categoría (2 B de parámetros orientados a tool calling). La comparativa viable es interna al propio estudio OpenGrad.

| Modelo | Parametros | Corpus de SFT | Registros con llamada | call_f1 | Precision | Recall | Macro | Licencia |
|---|---|---|---|---|---|---|---|---|
| Este modelo (corpus v2) | 1,88 B | v2 | 48.723 de 101.785 (47,9 %) | 0,5672 (ckpt 600) / 0,5995 (ckpt 1200) | 0,7450 (ckpt 600) | 0,4579 (ckpt 600) | 0,6242 (ckpt 600) | other, composite-per-source |
| Baseline B0 (Qwen3.5-2B sin ajustar) | 1,88 B | ninguno | no aplica | 0,6191 | 0,4542 | 0,9722 | 0,3621 | la del modelo base |
| Modelo sobre corpus v1 (publicado) | 1,88 B | v1 | 9 de 55.719 (0,0162 %) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor describe el resultado sobre el corpus v1 como el caso negativo de contraste: los modelos aprenden a dejar de llamar a herramientas por completo. No se publican métricas numéricas del checkpoint v1 en la información disponible.

## Limitaciones y advertencias

- Checkpoints de investigación, no modelos de producción. El propio autor lo declara explícitamente en la model card.
- No evaluado en seguridad y no alineado. No ha recibido ajuste de seguridad ni de razonamiento.
- No apto para uso autónomo de herramientas. El autor desaconseja explícitamente este escenario.
- Comportamiento esperado de sobre-clarificación en peticiones ambiguas.
- Degradación del comportamiento fuera de la distribución de entrenamiento.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo no ha sido evaluado con conjuntos de veracidad.
- Frontera de decisión incompleta: un macro de 0,62 con un 46 % de recall de llamadas corresponde a un modelo que ha empezado a aprender la frontera, no a uno que la domina.
- Selección de checkpoint contaminada por el conjunto de evaluación: el ranking entre checkpoints se midió sobre el mismo conjunto usado para compararlos, por lo que el autor lo califica de diagnóstico y no de resultado.
- Corpus sin revisión de contaminación semántica: el corpus v2 no ha pasado la revisión que sí recibió el v1, y el autor no reclama que la tenga. Las fuentes del lado de evaluación quedan excluidas por la misma política que en v1.
- Cobertura de datos parcial: solo tres de las seis fuentes del corpus canónico (xlam y button están restringidos en origen y la fuente de LoopTool no se localizó). Además, 154.760 registros se pusieron en cuarentena en lugar de repararse.
- Idiomas soportados no documentados, lo que impide garantizar cobertura multilingüe.
- Licencia `other` con `license_name: composite-per-source`: las condiciones de uso comercial dependen de las licencias de cada fuente del corpus y del modelo base, y no están detalladas en la información disponible. Requiere revisión legal antes de cualquier uso comercial.
- Contexto limitado a 2.048 tokens en entrenamiento, insuficiente para conversaciones largas o documentación extensa.
- Formato de llamada frágil heredado del corpus: los bloques de Glaive no cierran con `</functioncall>` y los argumentos usan un cuasi-JSON con comillas simples y booleanos en minúscula, lo que puede complicar el parseo en producción.
- Sin datos publicados de latencia, throughput ni consumo en inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arrochi112/OpenGrad-Qwen3.5-2B-M0-SFT-CorpusV2
- Repositorio OpenGrad: https://github.com/arjhinety/OpenGrad
- Dataset del corpus canónico: https://huggingface.co/datasets/arrochi112/OpenGrad-ToolPolicy-Canonical-v1
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentación de entrenamiento SFT citada por el autor: `docs/SFT_TRAINING.md` dentro del repositorio de OpenGrad.
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
