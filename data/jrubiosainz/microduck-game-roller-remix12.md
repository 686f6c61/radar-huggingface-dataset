# jrubiosainz/microduck-game-roller-remix12

## Resumen

jrubiosainz/microduck-game-roller-remix12 es un checkpoint de política de control para el robot Microduck (el pato de bajo coste de Pollen Robotics), no un modelo de lenguaje. Está especializado en la prueba de 2 m Roller Sprint de la Microduck Arena y lo publica jrubiosainz como fine-tuning in-place de su propio remix11, del que hereda el grafo completo (red, contador de pasos y selector de ramas por semilla) sin añadir ni un operador nuevo. El único cambio es la reescritura de los valores de una tabla de compensaciones articulares (`ob_T3`, rama 3, semilla 3).

El problema que resuelve es muy concreto: rebajar el tiempo de recorrido de 2 m en las cinco semillas oficiales de la Arena. Lo hace en 0,887 s frente a los 0,888 s de remix11 y los 0,895 s de rumezhak/microduck-roller-remix-leader. La mejora se consigue memorizando huellas de las observaciones de las carreras oficiales y aplicando, cuando la comparación coincide dentro de una tolerancia, un conjunto propio de consignas articulares para esa carrera.

Su relevancia es más metodológica que práctica: demuestra hasta dónde puede llevar una búsqueda CMA-ES organizada por relevos cuando se persiguen milímetros en un banco de competición, y a la vez expone los límites del enfoque, porque el resto de semillas —incluidas 55 adicionales, de la 6 a la 60— se comportan exactamente igual que el modelo base. Todo el resultado es en simulación y evaluado in-sample sobre las semillas que se optimizaron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política exportada a ONNX con contador de pasos embebido en los bits bajos de la acción `head_roll` y selector de ramas por semilla; grafo idéntico operador por operador al de rumezhak/microduck-roller-remix-leader |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la memoria de estado es el contador de pasos y el identificador de rama transportados en la acción `head_roll`) |
| Tipos de cuantizacion | no disponible (solo se publica el ONNX original; no hay variantes cuantizadas ni GGUF) |
| Idiomas soportados | no aplica (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Tamano del repositorio | 0,0 GB (redondeado) |
| Tarea / pipeline | robotics — 2 m Roller Sprint de la Microduck Arena |
| Relacion con el modelo base | finetune in-place de jrubiosainz/microduck-game-roller-remix11 (commit `86e99312`, sha256 de `policy.onnx` `d8a5cc904550…`) |
| Articulaciones controladas | 14 (13 articulaciones más `head_roll`, que además transporta contador y rama) |
| Velocidad de carrera | 0,7 m/s |
| Paso de fisica | 5 ms (200 Hz) |
| Resultado declarado | 0,887 s en las cinco semillas oficiales, in-sample, solo simulación |

## Arquitectura y entrenamiento

El grafo no es un transformer ni un modelo generativo: es una red de política que produce acciones articulares a partir de la observación y de un contador de pasos que viaja en los bits bajos de la acción `head_roll` (el paso 0 de carrera corresponde al paso 25 del contador). Todo ello va envuelto en un selector de ramas por semilla. En determinados pasos del contador, el grafo compara la observación con huellas almacenadas de las carreras de las semillas oficiales; si hay coincidencia (la mayor diferencia absoluta por debajo de una tolerancia), eleva un identificador de rama que se transporta en los bits de `head_roll` junto al contador, y esa carrera pasa a usar sus propias filas de consignas articulares conjuntas.

remix12 no añade ninguna rama, huella ni operador: todos los identificadores de rama del grafo están en uso. Solo reescribe los valores de la tabla de la rama 3 (`ob_T3`), correspondiente a la semilla 3, sumando desplazamientos de consigna articular a la acción de la red. Las filas 37-69 cambian como máximo 17,393 rad. Desplazamientos de ese tamaño solo saturan el motor, porque el bucle de posición del firmware de la Arena recorta el ciclo de trabajo a la ventana de corriente y al rango PWM; una consigna muy por encima del alcance de una articulación equivale a excitar el motor a plena potencia hacia ella. Cada nodo y cada inicializador del modelo base se conserva, y el fichero reconstruido a partir del `policy.onnx` base más la tabla buscada es byte a byte idéntico al publicado.

La búsqueda trató la propia tabla de la semilla 3 como variable (los desplazamientos de las 13 articulaciones distintas de `head_roll`, sobre una ventana de pasos del contador, partiendo de los valores de la tabla original) y se evaluó únicamente sobre su semilla oficial, a 0,7 m/s, atravesando el grafo completo. La función de coste mide cuánto le falta al pato para alcanzar la línea de 2 m al final del paso de física de 5 ms que daría el siguiente tiempo inferior, con valor negativo una vez rebasada; una caída penaliza 1 m adicional. Para esta semilla el paso decisivo es el subpaso 0 de la carrera 44: la línea se cruza en 0,885 s en lugar de los 0,890 s de remix9, remix10 y remix11.

Se usaron tres variantes de búsqueda sobre la tabla: CMA-ES sobre un cambio lineal a trozos con nudos cada 1 a 3 filas (`ol_sub.py`), su forma separable con covarianza diagonal (`ol_sub.py --sep`, la mayor parte de las ejecuciones) y una búsqueda coordinada voraz que mueve una entrada cada vez (`coord.py`). Se organizaron como relevos: cada 8 minutos un relé conservaba su ejecución líder, detenía las demás y arrancaba nuevas desde la mejor tabla encontrada hasta el momento en cualquier máquina virtual. La cadena documentada arranca en la tabla de remix11 y encadena ejecuciones como `c3k23r0a` (filas 37-69, nudos cada 2 filas, paso 0,08, población 96, a 8,2 mm del objetivo), `c3k23r1c` (filas 52-69, nudos por fila, paso 0,02, población 64, 5,2 mm), `c3k23r2c` (3,8 mm), `c3k23r3a` (filas 47-69, nudos por fila, paso 0,01, población 64, 2,6 mm) y `c3k23r4b` (2,1 mm).

## Capacidades

- Control de política para la prueba de 2 m Roller Sprint del robot Microduck en simulación, a 0,7 m/s y con bucle de control a 200 Hz.
- Reconocimiento de carreras por huella de observación: compara el estado con patrones almacenados de las semillas oficiales y activa la rama correspondiente si la diferencia máxima queda dentro de tolerancia.
- Transporte de estado en la acción: contador de pasos y selector de rama codificados en los bits bajos de `head_roll`, sin entradas adicionales del entorno.
- Mejora localizada del comportamiento: reduce el tiempo en la semilla 3 manteniendo intacto el resto del grafo.
- Preservación estricta del comportamiento base en cualquier carrera cuya rama no se active (semillas oficiales restantes y las 55 semillas extra de la 6 a la 60).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje. Cualquier uso en esos terrenos queda fuera del alcance del modelo.
- No se documentan capacidades multilingües ni ninguna otra modalidad que la observación propioceptiva del simulador.

## Casos de uso

- Participación en la Microduck Arena: enviar el checkpoint al Space de la competición para competir en la clasificación del 2 m Roller Sprint, aprovechando que el tiempo declarado (0,887 s) supera al del modelo base (0,888 s) y al de rumezhak/microduck-roller-remix-leader (0,895 s).
- Estudio de metaheurísticas aplicadas a políticas: la cadena de ejecuciones CMA-ES separable y búsqueda coordinada, con relevos cada 8 minutos, sirve como ejemplo reproducible de optimización de una tabla de compensaciones de 33 filas con función de coste basada en física de paso fijo.
- Reproducción y verificación de resultados: dado que el fichero se reconstruye de forma determinista desde el `policy.onnx` base más la tabla buscada, se puede auditar la afirmación de identidad byte a byte y reejecutar la evaluación sobre las cinco semillas oficiales.
- Caso de estudio de sobreajuste a semillas: útil en docencia o investigación para mostrar cómo una política puede mejorar in-sample memorizando huellas de observación sin generalizar a semillas nuevas (las 55 adicionales se comportan igual que el base).
- Análisis de saturación de actuadores: los desplazamientos de hasta 17,393 rad sobre las consignas permiten estudiar cómo el recorte de corriente y de PWM del firmware convierte consignas fuera de rango en excitación a plena potencia, y qué implica eso para el diseño de controladores.
- Evaluación comparativa de cadenas de remezclas: sirve como eslabón de referencia en la genealogía remix8 → remix9 → remix10 → remix11 → remix12 para medir el rendimiento marginal de cada reescritura in-place.
- Pruebas de integración de `onnxruntime` en un pipeline de robótica de bajo coste: al ser un ONNX de tamaño despreciable, es adecuado para validar el bucle observación-acción a 200 Hz en CPU antes de portar políticas mayores.

## Benchmarks y rendimiento

Los resultados publicados son tiempos de recorrido en simulación sobre las cinco semillas oficiales de la Arena, evaluados in-sample. No hay MMLU, HumanEval, GSM8K ni métricas de lenguaje, porque el modelo no es lingüístico.

| Checkpoint | Tiempo en el tablero (5 semillas oficiales) | Cambio respecto al base |
|---|---|---|
| jrubiosainz/microduck-game-roller-remix12 | 0,887 s | -0,001 s frente a remix11 |
| jrubiosainz/microduck-game-roller-remix11 | 0,888 s | — |
| jrubiosainz/microduck-game-roller-remix10 | 0,889 s | — |
| jrubiosainz/microduck-game-roller-remix9 | 0,891 s | — |
| rumezhak/microduck-roller-remix-leader | 0,895 s | — |
| jrubiosainz/microduck-game-roller-remix8 | no disponible | — |

| Detalle por semilla | Valor |
|---|---|
| Semilla 3, tiempo hasta la línea tras la búsqueda | 0,885 s (cruce en el subpaso 0 de la carrera 44) |
| Semilla 3, tiempo en remix9, remix10 y remix11 | 0,890 s |
| Filas modificadas en la tabla `ob_T3` | 37-69 |
| Magnitud máxima del cambio en la tabla | 17,393 rad |
| Semillas extra verificadas sin cambio de comportamiento | 55 (semillas 6 a 60) |

No se han publicado resultados de benchmarks fuera del banco de la Microduck Arena en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repositorio ocupa 0,0 GB, por lo que el modelo cabe holgadamente en memoria de cualquier dispositivo. Estimación a partir del tamaño del repositorio, no de un dato publicado.
- GPU recomendadas: no requiere GPU. Un acelerador no aporta ventaja apreciable en un grafo de este tamaño; A100, H100 o RTX 4090 solo tendrían sentido para paralelizar la evaluación de muchas semillas en el simulador, no para la inferencia de la política.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; también en CPU de un solo núcleo.
- Opciones de despliegue: `onnxruntime` para cargar `policy.onnx`, la librería `microduck` como interfaz declarada, y el entorno de simulación de la Microduck Arena (Space de pollen-robotics) para la evaluación oficial. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control debe sostener 200 Hz (paso de física de 5 ms); no se publica latencia de inferencia medida. Estimación razonable: al ser un ONNX de tamaño despreciable, la inferencia en CPU debería quedar muy por debajo del presupuesto de 5 ms por paso.
- Coste de reproducir la búsqueda: la cadena de relevos se ejecutó con múltiples máquinas virtuales en tandas de 8 minutos, sin que se detalle el hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tiempo (5 semillas oficiales) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-roller-remix12 | no disponible | no aplica | 0,887 s | no disponible | HuggingFace, 0 descargas, 0 likes |
| jrubiosainz/microduck-game-roller-remix11 | no disponible | no aplica | 0,888 s | no disponible | HuggingFace (modelo base directo) |
| jrubiosainz/microduck-game-roller-remix9 | no disponible | no aplica | 0,891 s | no disponible | HuggingFace |
| rumezhak/microduck-roller-remix-leader | no disponible | no aplica | 0,895 s | no disponible | HuggingFace (origen del grafo) |
| rumezhak/microduck-sprint-remix-leader3 | no disponible | no aplica | no disponible (prueba de sprint distinta) | no disponible | HuggingFace (referencia metodológica para CMA-ES separable) |

La comparación relevante es de tiempo en el banco, no de parámetros ni de contexto: todos los checkpoints de la familia comparten el mismo grafo y solo difieren en los valores de las tablas de compensación. La mejora de remix12 sobre remix11 es de 1 ms, y de 8 ms sobre el checkpoint de rumezhak que originó el grafo.

## Limitaciones y advertencias

- Solo simulación: el autor lo indica explícitamente. No hay validación en el robot físico y la transferencia es dudosa, especialmente porque el comportamiento depende de los recortes de corriente y PWM del firmware de la Arena.
- Evaluación in-sample: los 0,887 s se miden sobre las mismas cinco semillas oficiales contra las que se optimizó la tabla. No se reporta ninguna evaluación out-of-sample ni verificación independiente en la clasificación.
- Sobreajuste por huella: el grafo identifica carreras comparando observaciones con patrones almacenados dentro de una tolerancia. Pequeñas variaciones numéricas, cambios de motor físico o modificaciones del entorno pueden impedir la coincidencia y devolver el comportamiento al del modelo base.
- Mejora de una sola semilla: únicamente cambia la rama 3 (semilla 3). El resto de semillas oficiales y las 55 extra probadas terminan exactamente igual que remix11, de modo que el beneficio agregado es de 1 ms.
- Consignas saturadas: los desplazamientos de hasta 17,393 rad exceden el alcance de las articulaciones y solo funcionan porque el firmware recorta la excitación. Cualquier cambio en esos límites o en la ventana de corriente altera el comportamiento de forma no trivial.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución. Además, el grafo procede de un checkpoint de otro autor (rumezhak), lo que añade una dependencia en la cadena de derechos que no está documentada.
- Sin capacidades lingüísticas: no procesa ni genera texto, no soporta tool calling ni agentes; emplearlo fuera del pipeline de robótica de la Arena no tiene sentido.
- Sesgos conocidos: no se documentan sesgos en el sentido habitual de los modelos de lenguaje; el sesgo relevante es el de selección, al haber optimizado contra un conjunto cerrado de semillas oficiales.
- Riesgo de alucinación: no aplica, al no generar texto. El riesgo equivalente es la falsa confianza en que el tiempo declarado se replicará fuera de las condiciones exactas de la simulación.
- Repositorio mínimo (0,0 GB) sin artefactos adicionales: no hay tokenizer, configuraciones alternativas ni scripts de entrenamiento publicados en el repositorio, solo el ONNX y la model card.
- Fecha de creación declarada en 2026-10-28, posterior a la mayor parte del ecosistema de referencia; conviene verificar la vigencia de los enlaces a commits concretos antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-game-roller-remix12
- Modelo base directo (remix11): https://huggingface.co/jrubiosainz/microduck-game-roller-remix11/tree/86e993120a40c319d4395a7c7648c2233fd1d5fa
- Remix10: https://huggingface.co/jrubiosainz/microduck-game-roller-remix10/tree/178dc288b4c7bc94d49e6d2892b6cd40153bae46
- Remix9: https://huggingface.co/jrubiosainz/microduck-game-roller-remix9/tree/597c712a3beb8b1b24800783cee434bb177a941c
- Remix8: https://huggingface.co/jrubiosainz/microduck-game-roller-remix8
- Checkpoint de origen del grafo (rumezhak): https://huggingface.co/rumezhak/microduck-roller-remix-leader/tree/a9a3edee30d3a9bc4cc5b01c9f3ba1fdbaf48191
- Referencia metodológica de CMA-ES separable (rumezhak): https://huggingface.co/rumezhak/microduck-sprint-remix-leader3/tree/cdf5962f59980a258caf0989107cb0377b6b6994
- Microduck Arena (Space de la competición): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada
