# gabe-adib/ove3-dedup-185m-organelle-ani95-seed4321

## Resumen

ove3-dedup-185m-organelle-ani95-seed4321 es un checkpoint de investigación publicado por gabe-adib en HuggingFace. Se trata de una de las ramas de un experimento A/B sobre deduplicación de datos: un modelo MoE con arquitectura denominada `kimi_linear`, 185M de parámetros activos y entrenamiento sobre genomas de orgánulos deduplicados al 95 % de identidad. El tamaño total de parámetros y la longitud de contexto no se documentan.

El interés del modelo es metodológico. Aísla el efecto de eliminar secuencias casi duplicadas del pool de entrenamiento —14.788 genomas, mediante MinHash y centroide voraz— manteniendo la misma receta que la celda IsoFLOP de 185M: mismos datos, LR, batch y pasos. Está pensado para estudiar scaling con datos limitados, no para uso conversacional ni para producción directa.

El checkpoint corresponde al paso `best_1`, iteración 18.810, con pérdida de validación de 1,0892 y pérdida en held-out de 1,1818 nats/char, ponderada por mezcla sobre 9 dominios. El repositorio incluye el checkpoint distribuido de Megatron con estado del optimizador, logs de entrenamiento, eventos de TensorBoard y `config.yaml`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención `kimi_linear`; detalles de capas, expertos y dimensión oculta no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | 185M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; no se publican variantes cuantizadas |
| Idiomas soportados | no disponible; no es un modelo de lenguaje natural, modela secuencias genómicas |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron, con estado del optimizador incluido; no safetensors ni GGUF |
| Datos de entrenamiento | genomas de orgánulos; 14.788 genomas deduplicados al 95 % de identidad |
| Semilla | 4321 |
| Checkpoint | `best_1`, iteración 18.810 |
| Pérdida de validación | 1,0892 |
| Pérdida held-out | 1,1818 nats/char, ponderada sobre 9 dominios |
| Tamaño del repositorio | 28,9 GB |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con atención de tipo `kimi_linear`, según la denominación del autor. La model card no especifica el número de capas, la dimensión oculta, el número de expertos, la estrategia de enrutamiento ni el mecanismo exacto de atención lineal. Los 185M de parámetros corresponden a parámetros activos; el total no se indica, algo habitual en modelos MoE y relevante para estimar requisitos de memoria.

El entrenamiento forma parte del estudio ove3 de scaling con datos limitados. Esta ejecución concreta utiliza la celda IsoFLOP de 185M con la misma receta —datos, learning rate, batch y pasos— que la referencia, cambiando únicamente la deduplicación del pool de orgánulos al 95 % de identidad. La deduplicación se realizó con MinHash y centroide voraz sobre 14.788 genomas. La pérdida se reporta en nats/char, lo que sugiere modelado a nivel de carácter, aunque no se documenta el tokenizer. No se menciona RLHF, DPO ni ajuste por instrucciones; es un modelo base de preentrenamiento. La colección del estudio incluye 28 ejecuciones con 61M, 185M y 440M de parámetros activos, 30B o 120B tokens únicos y entre 1 y 8 épocas, pero la configuración exacta de esta ejecución está en `config.yaml`.

## Capacidades

- Predicción autoregresiva del siguiente carácter en secuencias genómicas; la métrica en nats/char apunta a un modelado por caracteres, sin tokenizer documentado.
- Cálculo de likelihood y NLL para secuencias completas, útil para scoring y comparación de variantes.
- Extracción de representaciones internas para tareas downstream, previa conversión del checkpoint de Megatron.
- Generación de secuencias genómicas sintéticas, aunque sin evaluación de viabilidad biológica publicada.
- No incluye soporte de tool calling ni function calling.
- No está diseñado para agentes, planificación multi-paso ni uso conversacional.
- No tiene capacidades multilingües de lenguaje natural; su dominio son secuencias de ADN de orgánulos.
- No dispone de visión, audio, modo thinking ni capacidades multimodales.
- La longitud de contexto no está documentada, por lo que no se puede garantizar el procesamiento de secuencias largas sin truncado.

## Casos de uso

- Reproducción del A/B de deduplicación: cargar el checkpoint en Megatron-LM y comparar la pérdida de validación y el NLL por dominio frente a la rama no deduplicada. Es adecuado porque la ejecución mantiene constante la receta y cambia solo la deduplicación.
- Estudio de leyes de escala con datos limitados: usar este punto de 185M activos junto con las celdas de 61M y 440M del estudio ove3 para ajustar curvas de pérdida frente a tokens únicos y épocas.
- Fine-tuning para clasificación de genomas de orgánulos: convertir el checkpoint, añadir una cabeza de clasificación y entrenar sobre secuencias mitocondrales o plastídicas. El preentrenamiento sobre 14.788 genomas de orgánulos proporciona una inicialización específica del dominio.
- Scoring de variantes en ADN de orgánulos: calcular la diferencia de NLL entre secuencia de referencia y alternativa para priorizar variantes en investigación. Es un uso realista como característica exploratoria, no como diagnóstico clínico.
- Extracción de embeddings para agrupar contigs o regiones genómicas: utilizar los estados ocultos para clustering, detección de regiones repetitivas o anotación asistida, tras validar la calidad de las representaciones en el dominio objetivo.
- Evaluación de arquitecturas MoE con atención lineal en datos científicos: medir throughput, memoria y estabilidad de entrenamiento frente a alternativas densas en el mismo corpus genómico.
- Generación controlada y aumento de datos: producir secuencias sintéticas para experimentos de aumentación, con validación biológica posterior y sin asumir que las secuencias generadas sean viables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica reportada | Valor | Notas |
|---|---|---|
| Pérdida de validación del modelo de lenguaje | 1,0892 | Mejor paso, iteración 18.810 |
| Pérdida held-out | 1,1818 nats/char | Ponderada por mezcla sobre 9 dominios |
| NLL por dominio | no disponible en la información | El desglose está en `DOMAIN_NLL.txt` |

No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks genómicos estándar. Las métricas anteriores son de entrenamiento y validación, no comparables directamente con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al desconocerse el número total de parámetros y la longitud de contexto, no se puede calcular una cifra fiable.
- El repositorio pesa 28,9 GB, pero incluye estado del optimizador y checkpoints de Megatron; no representa el tamaño de los pesos necesarios para inferencia.
- Como referencia hipotética, si el total de parámetros fuese cercano a los 185M activos, los pesos en BF16 ocuparían aproximadamente 0,37 GB, sin contar overhead de activaciones, KV cache ni estructuras MoE.
- GPU recomendadas: no disponibles. Para un modelo de ~185M activos, una RTX 4090 o RTX 3090 de 24 GB, o una A100 de 40/80 GB, sería suficiente en el escenario anterior; no está confirmado para el total real.
- GPU de consumo: probablemente viable si el total de parámetros es bajo, pero no se puede confirmar con los datos publicados.
- Despliegue: el formato nativo es Megatron-LM. No se documenta conversión a safetensors, GGUF ni formatos compatibles con llama.cpp, Ollama o vLLM. TGI no se puede usar directamente sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con alternativas externas en la información proporcionada. La comparación factible es con otras celdas del estudio ove3.

| Modelo | Parámetros activos | Tokens únicos | Épocas | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|---|
| Este run, dedup 95 %, semilla 4321 | 185M | no disponible por run; estudio: 30B o 120B | no disponible por run; estudio: 1-8 | no disponible | no disponible | checkpoint Megatron en HuggingFace |
| Otra celda ove3 | 61M | estudio: 30B o 120B | estudio: 1-8 | no disponible | no disponible | colección ove3 |
| Otra celda ove3 | 440M | estudio: 30B o 120B | estudio: 1-8 | no disponible | no disponible | colección ove3 |

No se han encontrado en la búsqueda alternativas externas con datos verificables de parámetros, contexto, rendimiento y licencia para una comparación rigurosa.

## Limitaciones y advertencias

- La licencia no está disponible. No se puede asumir uso comercial, redistribución ni modificación sin consultar al autor.
- Es un checkpoint de investigación con estado del optimizador incluido; no es un artefacto listo para producción.
- No está ajustado por instrucciones ni alineado con preferencias humanas. No debe usarse como asistente conversacional.
- El contexto máximo no está documentado; secuencias genómicas largas pueden truncarse o superar la ventana soportada.
- El entrenamiento se limita a genomas de orgánulos deduplicados al 95 %; los resultados no se extrapolan sin validación a genoma nuclear, metagenomas u otros dominios.
- La deduplicación agresiva puede eliminar diversidad relevante; el comportamiento frente a pools no deduplicados no está cubierto por este run.
- La pérdida en nats/char no es directamente comparable con bits por token ni con benchmarks estándar de modelos de lenguaje.
- Existe riesgo de generar secuencias biológicamente no viables o no funcionales; cualquier salida debe validarse experimentalmente.
- Puede existir memorización de secuencias de entrenamiento; conviene evaluar extracción antes de publicar derivados.
- No debe emplearse en diagnóstico clínico, decisiones terapéuticas ni interpretación médica sin validación independiente.
- No se documentan evaluaciones de sesgo biológico, cobertura taxonómica ni calidad por dominio más allá del NLL reportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gabe-adib/ove3-dedup-185m-organelle-ani95-seed4321
- Colección del estudio ove3: https://huggingface.co/collections/gabe-adib/ove3-data-constrained-scaling-study
