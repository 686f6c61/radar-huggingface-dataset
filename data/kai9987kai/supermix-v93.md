# Kai9987kai/supermix-v93

## Resumen

Supermix v93 es un modelo de investigación de 36,6 M de parámetros (9,1 M activos por token) desarrollado por el usuario Kai9987kai y publicado en HuggingFace. Se trata de un modelo de generación de texto especializado en resolver problemas de física, química, aritmética y trazas de ejecución de código Python escribiendo su razonamiento paso a paso. Parte mediante *warm start* del checkpoint anterior `Kai9987kai/supermix-v89` y no está pensado como modelo conversacional: la propia model card advierte explícitamente de que no es un *chat model*.

Su rasgo distintivo es arquitectónico. Sobre un transformador con capas de mezcla de expertos (MoE) se injerta una rama recurrente construida a partir del conectoma del sistema nervioso central de la mosca de la fruta macho (*Drosophila*, dataset Janelia): 768 módulos —384 por hemisferio— y 16.373 aristas sinápticas reales, de las cuales el 34 % son enlaces comisurales entre hemisferios. Además, durante el entrenamiento el modelo aplicó un proceso de "neurogénesis": creció y podó su propia estructura (filas de vocabulario, expertos, módulos y sinapsis, una capa adicional).

La relevancia del checkpoint es doble y ambivalente. Por un lado, demuestra que el mecanismo de crecimiento estructural y el injerto de conectomas son reproducibles y estables durante el entrenamiento. Por otro, sus propios tests causales indican que la rama biológica **no se utiliza**: desactivarla no degrada la pérdida de validación. Además, v93 rinde entre 1 y 4 puntos porcentuales por debajo de sus predecesores en el conjunto de evaluación de 630 problemas, con pérdidas concentradas en división larga y tareas multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) más rama recurrente injertada desde el conectoma del CNS de *Drosophila* (768 módulos, recurrencia temporal con 2 actualizaciones internas por token) |
| Parametros totales | 36.594.245 |
| Parametros activos | 9.127.349 por token |
| Longitud de contexto | No disponible (entrenamiento a longitud de secuencia 128; no se declara ventana de inferencia) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el corpus declarado incluye filas de "english-foundations" y los ejemplos de la model card están en inglés) |
| Licencia | No disponible |
| Formato de pesos | No disponible (la librería declarada es `pytorch`; el repositorio ocupa 0,2 GB) |
| Modelo base | Kai9987kai/supermix-v89 |
| Tokenizador | Extensión del de v89 mediante adición de 736 identificadores (vocabulario final: 9.415) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformador con capas MoE al que se le añade una rama recurrente que lee de tres capas y escribe en tres capas más, además de un enlace hacia el "núcleo de pensamiento" del modelo. Esa rama se inicializa a partir de `data/malecns_hemispheres_384.npz`: 768 módulos (384 por hemisferio), 16.373 aristas —5.391 izquierda-izquierda, 5.336 derecha-derecha, 2.826 izquierda-derecha y 2.820 derecha-izquierda—, con los signos de Dale fijados y las magnitudes aprendidas. La recurrencia aplica dos actualizaciones internas por token.

El entrenamiento se hizo por *warm start* desde v89 (que había acumulado 24.250 pasos). El corpus total es de 1.546.091 filas: las 1.156.108 de v89 más 200.000 filas de ciencia verificadas por un solucionador, 60.000 de código verificadas por ejecución, 90.000 consultas al conectoma, 30.000 afirmaciones sobre el conectoma y 9.983 filas de fundamentos de inglés. Las filas nuevas se ponderaron ×3. Se entrenaron 8.000 pasos con longitud de secuencia 128, LR máximo 3e-4 (3e-3 para los injertos), scheduler OneCycle y 17,3 horas de cómputo en CPU. No se documenta uso de RLHF ni DPO.

La innovación técnica es la "neurogénesis": cada 1.000 pasos el modelo crecía y podaba su propia estructura. En total se registraron 8 eventos (`results/neurogenesis.jsonl`) con 48 divisiones de módulos (816 módulos vivos al final: 421 izquierda, 395 derecha), 256 sinapsis abiertas (138 comisurales) y 104 podadas, 48 *taps* aferentes y 48 eferentes, 32 expertos creados y 56 eliminados (cada capa MoE pasó de 64 a 58 expertos), ampliación de vocabulario de 8.679 a 9.415 y una capa identidad añadida al final. Cuatro de los ocho eventos superaron el umbral de alerta de 1e-3 nats (+0,052; +0,006; +0,001; −0,029), ninguno desestabilizó el entrenamiento y la reanudación tras un fallo reproduce los eventos bit a bit.

## Capacidades

- Generación de texto con razonamiento explícito (*chain-of-thought*) para problemas de física: impulso, corriente eléctrica (ley de Ohm), energía de un muelle, velocidad final.
- Aritmética y problemas multi-paso verificables numéricamente, con respuesta final en formato "total X".
- Química y permutaciones dentro del conjunto de tareas sintéticas evaluadas.
- Trazado de código Python (*code tracing*) sobre fragmentos ejecutables: conteo de elementos de listas, índices negativos y sumas de rangos.
- Crecimiento estructural autónomo (neurogénesis) durante el entrenamiento, con registro de eventos y reproducibilidad determinista.
- Ejecución en CPU: el propio autor completó el entrenamiento de 8.000 pasos en 17,3 horas sin GPU.
- No soporta *tool calling* ni *function calling*: no se documenta ninguna capacidad de este tipo.
- No se documentan capacidades de agente, razonamiento multi-paso orquestado, visión, audio ni modo *thinking* separado.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación en arquitecturas neuroinspiradas: v93 es un banco de pruebas reproducible para estudiar el injerto de conectomas biológicos en transformadores, con registro completo de eventos de crecimiento y scripts de ablación ya descritos en la model card.
- Estudio de causalidad estructural: sus tests de ablación (cierre de puertas, enmascarado de enlaces comisurales, eliminación de lo crecido) sirven como metodología para comprobar si una rama añadida se usa realmente o si el tronco la reabsorbe.
- Generación de trazas de razonamiento para datasets educativos de física y aritmética: el modelo produce el desarrollo intermedio, no solo el resultado, lo que permite usarlo como generador de explicaciones paso a paso en material de ejercicios.
- Verificación sintética de problemas: dado que las 630 tareas de evaluación se generan con una huella de generador concreta (`3b99a446…`), el modelo puede emplearse para etiquetar y comprobar soluciones en pipelines de datos de entrenamiento.
- Enseñanza de trazado de código: sus tareas `code_list_count`, `code_neg_index` y `code_range_sum` (1.000, 1.000 y 0,857 de acierto) permiten generar ejemplos resueltos de ejecución mental de fragmentos Python.
- Inferencia en entornos sin GPU o en el borde: con 36,6 M de parámetros y un repositorio de 0,2 GB, el modelo es desplegable en CPU y en hardware muy limitado, algo relevante para investigación con recursos escasos.
- Reproducción de experimentos de crecimiento estructural: el crecimiento es determinista y reproducible bit a bit tras un fallo, lo que lo hace apto para estudios controlados sobre poda y expansión de vocabulario y expertos.
- Análisis negativo de transferencia: sirve como caso de estudio de cómo un *fine-tuning* con el 48 % del lote compuesto por material nuevo y el doble de LR respecto al control degrada tareas previamente aprendidas.

## Benchmarks y rendimiento

El autor evalúa sobre 630 problemas nuevos (semilla 65, límite de 96 tokens, huella de generador `3b99a446…`), con test exacto de McNemar sobre las 628 entradas compartidas. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

| Modelo | Aciertos / 630 | Precision | v93 vs. él (ganancias / perdidas, p) |
|---|---|---|---|
| v93 (este checkpoint) | 571 | 0,906 | — |
| v89 | 577 | 0,919 | 17 / 25, p = 0,28 |
| v91 C (v89 + 2.500 pasos, sin injerto) | 580 | 0,924 | 16 / 27, p = 0,13 |
| v91 A (v89 + un injerto de conectoma) | 587 | 0,935 | 10 / 28, p = 0,005 |
| v91 B (mismo injerto, cableado nulo) | 592 | 0,943 | 8 / 31, p = 0,0003 |

Once familias de tareas nuevas (231 problemas) que v89 no puede resolver:

| Tarea | Precision | Tarea | Precision |
|---|---|---|---|
| impulse | 1,000 | code_list_count | 1,000 |
| ohms_current | 1,000 | code_neg_index | 1,000 |
| spring_energy | 1,000 | code_range_sum | 0,857 |
| permutations | 1,000 | cns_type_count | 0,191 |
| final_velocity | 1,000 | cns_side_count | 0,191 |
| | | cns_pair_synapses | 0,000 |

Ablaciones causales (pérdida de validación con partes del injerto desactivadas, 4.000 filas de validación):

| Ablacion | Coste, nats |
|---|---|
| Todas las puertas de escritura cerebro-tronco y el enlace del núcleo de pensamiento cerradas | −0,00005 |
| Enlaces comisurales entre hemisferios enmascarados | +0,000001 |
| Solo hemisferio izquierdo / solo hemisferio derecho | −0,00004 / −0,00002 |
| Todo lo que creció durante el entrenamiento eliminado | −0,00027 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 36.594.245 parámetros (incluye todos los expertos MoE, que deben residir en memoria): aproximadamente 146 MB en fp32, 73 MB en bf16/fp16, 37 MB en int8 y 18 MB en int4. Estimaciones derivadas del recuento de parámetros, no publicadas por el autor.
- GPU recomendadas: no disponibles; cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4090) dispone de VRAM de sobra para este tamaño.
- ¿Cabe en GPU de consumo? Sí, con margen amplio, incluso en las gamas más bajas. También es viable en CPU: el autor entrenó 8.000 pasos en CPU en 17,3 horas, por lo que la inferencia es asumible sin acelerador.
- Opciones de despliegue: el repositorio declara únicamente la librería `pytorch`. No se documentan conversiones a GGUF, ni soporte en vLLM, llama.cpp, Ollama o TGI. Dado que la arquitectura incluye rama recurrente y crecimiento estructural, es previsible que requiera código personalizado del autor, aunque esto no se confirma en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con modelos externos de la misma categoría en la información proporcionada. La comparación natural es dentro de la propia familia, que comparte corpus y procedimiento de evaluación:

| Modelo | Parametros | Contexto | Precision (630 problemas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| supermix v93 | 36.594.245 totales / 9.127.349 activos | No disponible | 0,906 | No disponible | HuggingFace (0 descargas, 0 likes) |
| supermix v89 | No disponible | No disponible | 0,919 | No disponible | HuggingFace (modelo base de v93) |
| supermix v91 A | No disponible | No disponible | 0,935 | No disponible | No disponible en la información proporcionada |
| supermix v91 B | No disponible | No disponible | 0,943 | No disponible | No disponible en la información proporcionada |
| supermix v91 C | No disponible | No disponible | 0,924 | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo.
- El modelo no es conversacional. La model card lo declara explícitamente: "It is not a chat model".
- La rama biológica no se usa. Los tests causales muestran que cerrar todas las puertas de escritura cerebro-tronco cuesta −0,00005 nats y que eliminar todo lo que creció durante el entrenamiento cuesta −0,00027 nats, es decir, ayuda ligeramente. El tronco, entrenado conjuntamente, rodea la rama.
- Evidencia adicional de que la topología no aporta: el brazo con cableado nulo (v91 B, 0,943) superó al brazo con cableado real (v91 A, 0,935), y la copia de A con las puertas cerradas responde los 630 problemas de forma idéntica.
- Regresión frente a predecesores: v93 pierde 1–2 puntos frente a v89 y su control de entrenamiento continuado (no significativo con n = 628) y 3–4 puntos frente a los dos brazos injertados de v91 (significativo). Las caídas se concentran en división larga y multi-paso: `acceleration` 0,476, `power` 0,667, `two_step` 0,571, `average` 0,476. La causa probable señalada por el autor es la mezcla de entrenamiento: 48 % del lote con material nuevo y el doble de LR que v91.
- Tareas de conocimiento del conectoma no aprendidas: `cns_type_count` y `cns_side_count` con 0,191 y `cns_pair_synapses` con 0,000. Cada hecho se vio unas 0,2 veces en entrenamiento, muy por debajo de lo que requiere una tarea de recuerdo.
- Riesgo de alucinación: no evaluado formalmente, pero al ser un modelo de 36,6 M de parámetros entrenado sobre tareas sintéticas, la generación libre fuera de ese dominio no está caracterizada.
- Limitación de contexto e idioma: no se declara ventana de contexto para inferencia ni cobertura multilingüe; el entrenamiento se hizo con longitud de secuencia 128.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial sin aclaración del autor.
- Advertencia de producción: con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación sin validación externa. La cuestión de si la rama es redundante con la atención o simplemente reabsorbida por el tronco requeriría un experimento con tronco congelado, que, según el autor, no se ha ejecutado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kai9987kai/supermix-v93
- Modelo base (referenciado en la model card): https://huggingface.co/Kai9987kai/supermix-v89
- Resultados de neurogénesis citados: `results/neurogenesis.jsonl` (ruta interna del repositorio, sin URL pública disponible)
- Conectoma de partida: `data/malecns_hemispheres_384.npz` (fichero interno del repositorio; no se proporciona enlace al dataset Janelia original)
- Papers, blogs, repositorios y demos adicionales: no disponibles
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos correspondían a contenidos no pertinentes y se han descartado.
