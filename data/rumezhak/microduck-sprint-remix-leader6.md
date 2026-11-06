# rumezhak/microduck-sprint-remix-leader6

## Resumen

`microduck-sprint-remix-leader6` es una entrada para la prueba de 2 metros de sprint de la Microduck Arena, un entorno de simulación de robótica con patas organizado por Pollen Robotics. Lo desarrolla el usuario de Hugging Face rumezhak y no es un modelo de lenguaje ni una red neuronal entrenada desde cero: es un artefacto compuesto que combina, para cada una de las cinco semillas oficiales de la Arena, la mejor ejecución registrada entre distintas entradas públicas. El resultado declarado es un tiempo medio de 0,820 s en las cinco semillas, con 163, 164, 165, 164 y 164 pasos de física respectivamente.

El componente aprendido es una red densa de 61 entradas, tres capas ocultas (512, 256 y 128 neuronas) con activación ELU y 14 salidas, heredada sin cambios del modelo base `a1rb4Ck/microduck-sprint-2m`. Sobre esa red se superpone una tabla de búsqueda (`L_obs`/`L_act`) con 331 filas que reproducen las observaciones y acciones grabadas de las cinco ejecuciones, con una máscara de 48 de las 61 entradas y una tolerancia de coincidencia de 1e-7. Si la observación actual no coincide con ninguna fila almacenada dentro de esa tolerancia, actúa la red.

Su relevancia es acotada y el propio autor la delimita: los resultados son in-sample, dependen de una coincidencia numérica exacta y están pensados exclusivamente para el simulador de la Arena. No es un modelo para desplegar en un robot físico ni para tareas generales de robótica; es una pieza de competición que ilustra cómo se pueden explotar las particularidades del reloj de física del simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red densa 61 -> 512 -> 256 -> 128 -> 14 con activación ELU, más tabla de búsqueda de ejecuciones grabadas (lookup con máscara y tolerancia) |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de 61 observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (etiqueta `onnx`); el repositorio se distribuye con la librería `microduck` |

## Arquitectura y entrenamiento

La parte neuronal es una red feedforward de cuatro capas (61 entradas, 512, 256 y 128 unidades ocultas, 14 salidas) con activación ELU, tomada tal cual del fichero de `a1rb4Ck/microduck-sprint-2m`. No hay entrenamiento nuevo por parte de este autor: la red, la máscara de 48 entradas y la tolerancia de 1e-7 son las del modelo base. Sobre esa red se añade una tabla de búsqueda con 331 filas que almacena, para cada paso de las cinco ejecuciones oficiales, la observación grabada (enmascarada) y la acción a ejecutar. En cada paso, la fila almacenada más cercana a la observación actual (medida como máxima diferencia absoluta sobre las entradas enmascaradas) proporciona la acción si la distancia está dentro de la tolerancia; en caso contrario, decide la red.

Las cinco secuencias se obtuvieron ejecutando cada fichero fuente en el runner de la Arena y reescribiéndolas en el formato del modelo base. Según el autor, las secuencias de `a1rb4Ck` reescritas de este modo reproducen exactamente sus tiempos, lo que valida el procedimiento de transcripción. La procedencia por semilla es: semilla 1 de `jrubiosainz/microduck-game-sprinter-remix12`, semillas 2, 3 y 5 de `HlibPlakhtii/microduck-sprint-quicksilver-v1`, y semilla 4 de una entrada propia anterior (`sprint-remix-leader5`). No se documenta RLHF, DPO ni ningún proceso de ajuste adicional.

## Capacidades

- Control locomotor de un robot cuadrúpedo simulado (MicroDuck) en la prueba de sprint de 2 metros de la Microduck Arena.
- Política de control paso a paso: mapea 61 observaciones del simulador a 14 acciones de actuadores.
- Reproducción determinista de ejecuciones grabadas mediante búsqueda por vecino más cercano con tolerancia estricta (1e-7) sobre 48 entradas enmascaradas.
- Generalización limitada a nuevas condiciones de inicio: en 300 semillas nuevas (a partir de 1.000.000) finalizan 292, con media de 0,931 s y peor caso de 1,16 s, gracias a la red heredada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Evaluación de estrategias de competición en la Microduck Arena: sirve como referencia de tiempo objetivo (0,820 s) para comparar nuevas entradas en las cinco semillas oficiales.
- Investigación sobre explotación de artefactos del simulador: documenta cómo el reloj de pasos de física y la coincidencia exacta de observaciones permiten combinar ejecuciones de distintas fuentes.
- Estudio de políticas híbridas red más tabla de búsqueda: ejemplo reproducible de arquitectura de control que recurre a la red cuando el lookup no encuentra coincidencia.
- Análisis de robustez numérica: permite medir cómo el redondeo en coma flotante de otra máquina puede romper la reproducción y degradar la ejecución a la política neuronal.
- Docencia sobre evaluación in-sample: caso claro de resultados que no generalizan y de la diferencia entre rendimiento en semillas oficiales y en semillas nuevas.
- Pruebas de integración del runner de la Arena y de la librería `microduck` en pipelines de CI, verificando la reproducibilidad de tiempos en x86-64 Linux.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tiempo medio en las 5 semillas oficiales | 0,820 s |
| Pasos de física por semilla | 163, 164, 165, 164 y 164 |
| Semillas oficiales completadas | 5 de 5 |
| Comparación con las dos mejores entradas previas | 0,821 s (quicksilver-v1 y remix12) |
| Semillas nuevas (desde 1.000.000) completadas | 292 de 300 |
| Tiempo medio en semillas nuevas | 0,931 s |
| Peor caso en semillas nuevas | 1,16 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y la red es de tamaño muy reducido (61 -> 512 -> 256 -> 128 -> 14), por lo que la inferencia cabe en CPU.
- GPU recomendadas: no se especifican; el autor puntúa con `arena score` en x86-64 Linux, sin requisitos de GPU documentados.
- Cabe en cualquier GPU de consumo e incluso en CPU; no se detalla una lista concreta.
- Opciones de despliegue: runner de la Microduck Arena y librería `microduck`; pesos en formato ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; los tiempos reportados son de simulación (0,820 s por ejecución), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tiempo en Arena (5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rumezhak/microduck-sprint-remix-leader6 | no disponible | no aplica | 0,820 s (in-sample) | Apache-2.0 | Hugging Face |
| HlibPlakhtii/microduck-sprint-quicksilver-v1 | no disponible | no aplica | 0,821 s | Apache-2.0 | Hugging Face |
| jrubiosainz/microduck-game-sprinter-remix12 | no disponible | no aplica | 0,821 s | Apache-2.0 | Hugging Face |
| a1rb4Ck/microduck-sprint-2m (base) | no disponible | no aplica | no disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Resultados in-sample: el lookup solo reproduce las cinco semillas oficiales; no demuestra una mejora general del controlador.
- Fragilidad numérica: la coincidencia exige la observación bit a bit con tolerancia 1e-7, por lo que el redondeo en coma flotante de otra máquina puede romper la reproducción y hacer que esa semilla recaiga en la red.
- Verificación limitada a x86-64 Linux; no se ha comprobado en otras plataformas.
- La semilla 1 está en el límite de su tick: el cruce interpolado es 40,7509 pasos de control frente a un límite de 40,75, y solo el reloj de pasos de física de la Arena la sitúa en 163 pasos.
- No apta para un robot real: entrenada y evaluada solo en el simulador, y las acciones tardías quedan muy fuera de lo que se pediría a un servo físico. El autor advierte explícitamente de no cargarla en un MicroDuck físico.
- El barrido de la Arena reporta 0,20 m/s solo porque el lookup ignora la velocidad comandada.
- Sin sesgos lingüísticos ni riesgo de alucinación en el sentido habitual, al no ser un modelo de lenguaje; el riesgo equivalente es la dependencia de una tabla de búsqueda sobreajustada al simulador.
- Licencia Apache-2.0, que permite uso comercial, aunque el propio modelo carece de utilidad fuera del entorno de simulación de la Arena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sprint-remix-leader6
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-sprint-2m
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Entrada quicksilver-v1: https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v1
- Entrada remix12: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix12
- Perfil del autor del modelo base: https://huggingface.co/a1rb4Ck
- Perfil de jrubiosainz: https://huggingface.co/jrubiosainz
- Perfil de HlibPlakhtii: https://huggingface.co/HlibPlakhtii
- Perfil de Pollen Robotics: https://huggingface.co/pollen-robotics
- Perfil de suraj-phanindra: https://huggingface.co/suraj-phanindra
