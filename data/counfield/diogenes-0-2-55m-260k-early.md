# Counfield/Diogenes-0.2-55M-260K-early

## Resumen

Diogenes 0.2 · 55M — 260K-early es un modelo de lenguaje a nivel de byte entrenado desde cero por Counfield, un autor independiente, y publicado como checkpoint temprano de investigación. Se trata de un transformer de 55 millones de parámetros que prescinde por completo del tokenizador: su vocabulario son los 256 valores UTF-8 crudos. El modelo se entrena de forma conjunta con una memoria de contenido persistente y un lector ligero de 858.436 parámetros, de modo que los hechos no se almacenan en los pesos del modelo base sino en una ruta de memoria externa que se consulta en tiempo de inferencia.

La propuesta técnica sigue el diseño Recurrent Loop Transformer (RLT): el núcleo base opera con atención por bandas y ventana acotada (puntúa las últimas 1.024 posiciones de cada fila de 8.192 bytes y atiende sobre los ~2.048 bytes más recientes), mientras que la memoria de contenido cubre todo lo anterior. El lector recoge candidatos de byte —repeticiones directas del contexto, cadenas resueltas mediante 4 canales de salto y valores retenidos por 10 anclas de pasaje— y una compuerta softmax aprendida decide byte a byte si la siguiente salida proviene de la distribución del LM base o de un canal candidato.

Este checkpoint corresponde al paso 260.000 de un entrenamiento planificado de 380.000 pasos, por lo que es un artefacto de investigación y no un modelo listo para producción. Su interés radica en la separación explícita entre capacidad lingüística y recuperación de hechos, y en que demuestra que un modelo de 55M puede alcanzar recall perfecto en tareas de un solo hecho cuando la memoria está activa y 0% cuando se desactiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Loop Transformer (RLT), transformer con atención por bandas y ventana acotada, con memoria de contenido y lector externos |
| Parametros totales | 55.078.145 (base) + 858.436 (lector) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana efectiva del núcleo de ~2.048 bytes; filas de 8.192 bytes con cola puntuada de 1.024 posiciones; alcance adicional vía memoria de contenido |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch `latest.pt` + `config.json`, formato propio `mline`; no compatible con Transformers |
| Vocabulario | 256 (bytes UTF-8 crudos, sin tokenizador) |
| Anchura base / cabezas | 1.536 / 8 |
| Anchura del lector | 128 |
| Canales de salto / anclas de pasaje | 4 / 10 |
| Separador de documentos | `\n\n<|doc|>\n\n` |
| Filas de memoria | batch 4, cada 3.er paso |
| Filas de LM | batch 32 × longitud 512 |
| Optimizador | lr 6e-4 (base) / 1e-3 (lector), warmup 500, AMP |
| Semilla | 401 |
| Pasos entrenados | 260.000 / 380.000 |

## Arquitectura y entrenamiento

El núcleo es un transformer de 55M de parámetros con atención por bandas que mantiene el coste de atención lineal en la longitud en lugar de cuadrático. En este checkpoint el núcleo opera en modo "feedback-off": la recurrencia no se instancia en el propio núcleo sino a través de la ruta de memoria, que se escribe durante el entrenamiento y se reinyecta en el momento de la lectura junto a la distribución del LM base, de forma que la información anterior a la ventana fija sigue siendo alcanzable en cada posición puntuada. La conexión de realimentación recurrente del propio núcleo está reservada para una fase posterior del programa de entrenamiento.

El entrenamiento es conjunto desde el paso 0: las filas de lenguaje (batch 32 × 512 bytes) y las filas de memoria (batch 4 × 8.192 bytes, cada tercer paso) se entrenan en una única ejecución sin inicialización preentrenada ni fase previa de memorización de hechos en los pesos. El lector, con anchura 128, no decodifica tokens: recoge candidatos de byte del contexto, los puntúa contra un resumen de los estados ocultos del modelo base y aplica una compuerta softmax aprendida para elegir entre la distribución propia del LM y un canal candidato, incluyendo un slot NULL que representa "no existe respuesta". En las pruebas, la compuerta enruta por tarea: las consultas directas van por el canal de contexto, las preguntas encadenadas por los canales de salto y las entidades ausentes por el canal NULL (política "unknown.").

## Capacidades

- Generación de texto a nivel de byte sobre UTF-8 crudo, sin tokenizador ni BPE.
- Recuperación de hechos de un solo hecho en datos retenidos (held-out) mediante la ruta de memoria.
- Recuperación encadenada de 2 a 5 saltos con resolución a través de los 4 canales de salto.
- Detección de cadenas rotas y rechazo de entidades ausentes mediante el canal NULL.
- Recall cruzado en direcciones forward, backward y natural.
- Capacidad de operar con contexto superior a su ventana de atención gracias a la memoria de contenido persistente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; la resolución de cadenas es multi-salto pero acotada a la tarea de recall.
- Capacidades multilingües: no disponibles; el modelo es de orientación inglesa.
- Capacidades especiales: modo de memoria con lector activable/desactivable y política explícita de "unknown." para entidades ausentes.

## Casos de uso

- Investigación sobre memoria externa en modelos pequeños: el modelo permite estudiar cómo se separa el conocimiento factual de los pesos del LM, comparando el comportamiento con el lector activado y desactivado sobre las mismas entradas.
- Experimentos de recuperación de hechos con contexto largo: gracias a la memoria de contenido, se puede alimentar documentación extensa y evaluar el recall de hechos que quedan fuera de la ventana de ~2.048 bytes del núcleo.
- Evaluación de arquitecturas recurrentes y de atención por bandas: sirve como banco de pruebas reproducible (semilla 401, hiperparámetros documentados) para comparar variantes del diseño RLT.
- Docencia y divulgación sobre modelos a nivel de byte: al no tener tokenizador, es un caso didáctico claro para explicar tokenización, ventanas de atención y memoria.
- Pruebas de robustez de compuertas de enrutamiento: la compuerta softmax del lector permite analizar cómo se enrutan consultas directas, encadenadas y ausentes por canales distintos.
- Prototipado de sistemas de pregunta-respuesta sobre pasajes controlados: con prompts y datos en el formato esperado, puede emplearse para validar pipelines de recall antes de escalar a modelos mayores.
- Estudio de detección de información ausente: la política "unknown." es útil para investigar el rechazo de entidades no presentes en la memoria.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Modelado de lenguaje, bits/byte | 1,141 |
| Recall de un solo hecho, held-out | 1,00 |
| Recall encadenado, 2 saltos | 1,00 |
| Recall encadenado, 3 saltos | 0,875 |
| Recall encadenado, 4 saltos | 0,9688 |
| Recall encadenado, 5 saltos | 1,00 |
| Detección de cadena rota | 1,00 |
| Rechazo de entidad ausente | 1,00 |
| Recall cruzado, forward | 1,00 |
| Recall cruzado, backward | 0,9375 |
| Recall cruzado, natural | 0,9688 |
| Recall cruzado, ausente | 1,00 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (55M de parámetros del núcleo más 858k del lector) es previsible que quepa en GPU de consumo, pero no se confirma en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del modelo sugiere que sí, pero el formato propio `mline` condiciona el despliegue.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo usa la librería `mline` y un formato propio no compatible con Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (modelos a nivel de byte, modelos con memoria externa o modelos de ~55M de parámetros). Como referencia estructural, el propio autor sitúa el modelo dentro del diseño Recurrent Loop Transformer (RLT), pero no se aportan resultados de terceros para contrastar.

## Limitaciones y advertencias

- No está ajustado para instrucciones ni para chat: no existe formato de conversación en el checkpoint. En encuadre de chat, el modelo deriva hacia respuestas estilo examen o continuaciones de problemas matemáticos.
- La política "unknown." para entidades ausentes de la memoria se filtra al chat ingenuo, lo que puede producir rechazos incorrectos en conversación.
- La decodificación greedy en chat produce bucles de repetición; se recomienda temperatura ≈ 0,7, top-p ≈ 0,9 y penalización de repetición ≈ 1,1.
- La aritmética es débil en esta fase del entrenamiento.
- Modelo centrado en inglés; sin tokenizador, es necesario alimentar bytes UTF-8 crudos.
- Es un checkpoint temprano (260.000 de 380.000 pasos): el checkpoint final está planificado como `Counfield/Diogenes-0.2-55M`.
- Formato de pesos propietario (`latest.pt` + `config.json`, librería `mline`), no compatible con el ecosistema Transformers; los pesos se añadirán al repositorio según el autor.
- Licencia MIT, que permite uso comercial, pero el estado de investigación y la ausencia de ajuste instructivo desaconsejan su uso en producción sin validación adicional.
- Riesgo de alucinación: no evaluado en la información disponible; el diseño traslada los hechos a la memoria, pero el LM base puede generar continuaciones plausibles fuera de las tareas de recall.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Counfield/Diogenes-0.2-55M-260K-early
- Checkpoint final planificado: https://huggingface.co/Counfield/Diogenes-0.2-55M
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
