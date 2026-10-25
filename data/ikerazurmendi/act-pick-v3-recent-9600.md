# IkerAzurmendi/act-pick-v3-recent-9600

## Resumen

`act-pick-v3-recent-9600` es una política de control robótico basada en ACT (Action Chunking with Transformers) publicada por el usuario IkerAzurmendi en HuggingFace, dentro del ecosistema LeRobot. Resuelve una tarea concreta de manipulación sobre un brazo SO-101: coger una pieza de una caja y sostenerla frente a la cámara. El modelo toma como entrada la imagen de una cámara frontal, la de una cámara en la muñeca y las seis posiciones articulares, y devuelve un *chunk* de 90 objetivos articulares futuros a 30 fps.

Se trata de una variante de la tercera ronda de experimentos (v3) entrenada únicamente con las sesiones recientes del 24 de octubre (a partir de las 16:58), con piezas colocadas en esquinas y bordes, más dos sesiones de tarde: 100 episodios en total. El checkpoint publicado corresponde al paso 9.600 de una ejecución de 12.000 pasos y, según el autor, no es el mejor de su ejecución (el mejor es el de 12.000), sino que se publica por completitud.

Su interés no es tanto el rendimiento absoluto como el carácter de ablation: permite comparar el efecto de reducir el conjunto de datos de 398 a 100 episodios manteniendo la receta, con una degradación medible del error absoluto medio offline (17,10 frente a 15,16 del run completo). El modelo tiene 51.658.374 parámetros, ocupa 0,2 GB y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) sobre LeRobot; política de imitación con encoder visual y decoder transformer |
| Parámetros totales | 51.658.374 (según safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). Horizonte de acción: chunk de 90 pasos a 30 fps (≈3 s) |
| Tipos de cuantización | No documentados; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas |
| Idiomas soportados | No aplica (modelo de robótica; sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño de repo: 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de imitación supervisada que predice secuencias de acciones (*action chunks*) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza la ejecución. En este caso la política consume dos flujos de imagen (cámara frontal y cámara de muñeca) junto con las seis posiciones articulares del SO-101, y emite 90 objetivos articulares por inferencia. La configuración interna concreta (backbone del encoder visual, dimensión del transformer, tamaño del espacio latente) no está detallada en la model card.

El entrenamiento se realizó con la función `train()` de LeRobot, batch 8, chunk de 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. El conjunto de datos son 100 episodios a 30 fps, con una o dos piezas, restringidos a las sesiones del 24 de octubre desde las 16:58 (piezas en esquinas y a lo largo de los bordes) más las dos sesiones de la tarde, aplicando el mismo filtro de calidad que la ronda v3. No se documenta uso de RLHF, DPO ni ajuste por refuerzo; es imitación pura sobre demostraciones teleoperadas.

## Capacidades

- Manipulación robótica de tipo *pick*: coger una pieza de una caja y mantenerla elevada frente a la cámara.
- Predicción de chunks de 90 acciones articulares a 30 fps, con 30 pasos de acción entre replanificaciones.
- Fusión multimodal de dos cámaras (frontal y muñeca) con el estado propioceptivo de seis articulaciones.
- Generalización limitada a las posiciones de pieza vistas en entrenamiento: esquinas, bordes y variaciones de una o dos piezas.
- Ejecución reactiva en bucle cerrado: la política se reevalúa periódicamente con nuevas observaciones.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni procesamiento de lenguaje natural, audio o vídeo.
- No tiene capacidades multilingües: no hay entrada ni salida textual.

## Casos de uso

- Recogida de piezas en una célula de montaje: la política puede alimentar un SO-101 situado junto a una caja de piezas para presentarlas a una cámara de inspección; el chunk de 90 acciones a 30 fps proporciona movimientos suaves y continuos sin depender de un planificador externo.
- Base para *fine-tuning* con datos propios: al ser un checkpoint ACT de 51,6 M de parámetros con licencia Apache 2.0, sirve como inicialización barata para reentrenar con las posiciones de pieza y la iluminación de una celda nueva.
- Referencia de ablation en experimentos de datos: útil para medir cuánto rinde una política cuando se reduce el dataset a 100 episodios recientes frente a las 398 del run completo, manteniendo receta y arquitectura.
- Docencia y laboratorio con SO-101: el tamaño reducido y el formato safetensors permiten ejecutar el modelo en estaciones de trabajo modestas para prácticas de imitación y evaluación offline.
- Evaluación offline estandarizada: el protocolo de error absoluto medio articular sobre episodios reservados se puede replicar para comparar variantes de política antes de gastar tiempo de robot.
- Pruebas de integración de *pipelines* LeRobot: sirve para validar el bucle de captura de dos cámaras, sincronización temporal y publicación de acciones articulares a 30 Hz antes de entrenar un modelo definitivo.
- Composición de sistemas de pick-and-place: combinado con un detector externo que confirme el agarre, el modelo actúa como capa de control de bajo nivel para la fase de aproximación y elevación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. El autor sí publica una evaluación offline: error absoluto medio articular sobre el chunk predicho en 16 episodios reservados (12 de `so101-pick-cube_20261024_181939` con una pieza y 4 de `so101-pick-cube_20261024_144537` con dos piezas), comparado con la línea base de "mantener las posiciones articulares actuales" (20,71).

| Checkpoint de esta ejecución | Error (menor es mejor) | Mejora sobre línea base |
|---|---|---|
| 2.400 pasos | 17,19 | 17 % |
| 4.800 pasos | 17,10 | 17 % |
| 7.200 pasos | 17,00 | 18 % |
| **9.600 pasos (este modelo)** | **17,10** | 17 % |
| 12.000 pasos | 16,87 | 19 % |

Comparación con los mejores checkpoints del resto de ejecuciones de la ronda:

| Ejecución | Episodios de entrenamiento | Mejor checkpoint | Error | Mejora sobre línea base |
|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27 % |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27 % |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26 % |
| v2 (anterior) | 278 | 6k | 15,36 | 26 % |
| chunk 60 (línea base propia 16,23) | 331 | 4,8k | 11,94 | 26 % |
| solo una pieza | 292 | 9,6k | 15,47 | 25 % |
| **solo sesiones recientes** | **100** | 12k | **16,87** | 19 % |
| primera ejecución | 165 | 6k | 16,87 | 19 % |

El propio autor advierte de que los mejores checkpoints de las ejecuciones principales están dentro del ruido entre sí, que todas las ejecuciones empeoran tras aproximadamente una pasada sobre los datos, y que el error offline no permite determinar qué modelo agarra mejor: ninguno se ha probado en el robot.

## Requisitos de hardware

- VRAM estimada a partir del número de parámetros: ≈207 MB en fp32, ≈103 MB en fp16/bf16 y ≈52 MB en int8. Son cálculos aritméticos sobre 51,66 M de parámetros, no cifras publicadas por el autor; a ello hay que sumar la memoria de las activaciones de dos flujos de imagen y del decoder.
- Cabe en cualquier GPU de consumo con varios GB de VRAM (gama RTX xx60 o superior); el cuello de botella real es la captura y sincronización de dos cámaras a 30 fps, no la memoria.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrían sentido para reentrenar con datasets mayores.
- Despliegue mediante la librería LeRobot (bucle de evaluación y control); no aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput no publicados. El requisito implícito es sostener 30 Hz (33 ms por paso de control) para replicar la frecuencia de entrenamiento; con 30 pasos de acción por replanificación, la política se reevalúa aproximadamente una vez por segundo.
- El repositorio ocupa 0,2 GB, por lo que la descarga y el almacenamiento no son un factor limitante.

## Comparativa con modelos similares

| Modelo | Parámetros | Datos de entrenamiento | Error offline (línea base) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-pick-v3-recent-9600 (este) | 51,66 M | 100 episodios, sesiones recientes | 17,10 (20,71) | Apache 2.0 | HuggingFace |
| act-pick-v3-6000 | No disponible en la información | 398 episodios | 15,16 (≈20,7, no detallada) | Apache 2.0 | HuggingFace |
| act-pick-v3-strict-2400 | No disponible en la información | 205 episodios filtrados (6-12 s) | 15,14 | Apache 2.0 | HuggingFace |
| act-pick-v3-chunk60-4800 | No disponible en la información | 331 episodios, chunk 60 | 11,94 (16,23) | Apache 2.0 | HuggingFace |

Los tres alternativas son variantes de la misma familia y receta, por lo que comparten arquitectura y licencia; las diferencias están en el volumen y filtrado de datos y en el horizonte del chunk. El error de `chunk60` no es directamente comparable con los demás porque su línea base es distinta (16,23 frente a 20,71). No se dispone de comparación con políticas de otros autores.

## Limitaciones y advertencias

- No es el mejor checkpoint de su ejecución: el de 12.000 pasos obtiene 16,87 frente a 17,10, y el autor lo publica solo por completitud.
- El rendimiento offline es claramente inferior al de las recetas con más datos (17,10 frente a 15,14-15,36), con una mejora sobre la línea base de solo el 17-19 % frente al 25-27 % de las demás.
- Ninguno de los modelos de la familia se ha probado en el robot: no hay evidencia de tasa de éxito de agarre, solo error articular offline.
- El error offline no correlaciona necesariamente con la calidad del agarre; es una métrica de imitación, no de resultado de la tarea.
- Entrenado con 100 episodios de una única sesión y una distribución concreta de posiciones (esquinas y bordes): se espera un generalization gap ante piezas centradas, alturas distintas, iluminación diferente o cambios de cámara.
- No hay información sobre sesgos, composición demográfica ni robustez frente a oclusiones; al ser un modelo de robótica, los riesgos son físicos (colisiones, caídas de pieza) y requieren límites de par, paradas de emergencia y supervisión humana.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas cuando la observación se sale de la distribución de entrenamiento.
- La licencia Apache 2.0 permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- No se documentan requisitos de versión de LeRobot ni compatibilidad con versiones futuras de la librería; la fecha de creación del repositorio es 2026-10-25.
- Sin datos de idiomas, tool calling ni integración con agentes: no debe presentarse como un modelo de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-9600
- Checkpoint de la misma ejecución con mejor resultado (12k), referenciado en la model card: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000
- Run completo con todos los datos (398 episodios), referenciado en la model card: https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Run con filtro de calidad estricto, referenciado en la model card: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400
- Run con chunk de 60, referenciado en la model card: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Paper de ACT y repositorio de LeRobot: no disponibles en la información proporcionada.
