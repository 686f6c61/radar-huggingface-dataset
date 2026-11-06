# rumezhak/microduck-hill-remix-leader2

## Resumen

`rumezhak/microduck-hill-remix-leader2` es un derivado (finetune) de `a1rb4Ck/microduck-hill-1m5`, una política de control para el reto de escalada de colina de 1,5 m en el simulador Microduck Arena, impulsado por Pollen Robotics. No es un modelo de lenguaje: es un artefacto de robótica y aprendizaje por refuerzo que combina una red neuronal densa de pequeñas dimensiones con una tabla de búsqueda de acciones grabadas. El autor, rumezhak, lo publica como punto de partida para una búsqueda posterior, no como una mejora del resultado en la clasificación.

La contribución concreta es la re-búsqueda de las secuencias de acciones de las semillas oficiales 1 a 4 mediante CMA-ES separable, manteniendo intactos la red, la máscara, la tolerancia y las filas de la semilla 5 del modelo base. El resultado declarado es idéntico al del base: 0,740 s de media, 5 de 5 semillas oficiales completadas, 148, 149, 148, 147 y 148 pasos de física de 5 ms. Lo que cambia es la distancia de cada semilla a su siguiente tick, lo que el autor presenta como base para su próxima búsqueda.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de optimización de secuencias de acciones en un entorno MuJoCo, como entrada para búsquedas evolutivas posteriores sobre el mismo banco de pruebas y como referencia de las limitaciones de las políticas basadas en tablas de búsqueda (lookup) dependientes de coincidencia exacta de observaciones. El repositorio ocupa 0,0 GB, tiene 19 descargas y ninguna marca de "me gusta" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red densa 61 → 512 → 256 → 128 → 14 con activación ELU, combinada con una tabla de búsqueda de acciones grabadas (`L_obs`, `L_act`, `L_mask`, `L_tol`) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la entrada es un vector de observación de 61 dimensiones, 48 de ellas enmascaradas) |
| Tipos de cuantización | No disponible; el artefacto se publica en formato ONNX |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX; librería `microduck` |
| Pipeline | `robotics` |
| Modelo base | `a1rb4Ck/microduck-hill-1m5` (relación: finetune) |
| Tamaño del repositorio | 0,0 GB |
| Entorno de simulación | MuJoCo 3.10.0, x86-64 Linux |
| Salidas | 14 articulaciones (acciones entre aproximadamente -14 y +14) |

## Arquitectura y entrenamiento

La política es un híbrido entre una red neuronal y una memoria de secuencias. La red es un perceptrón multicapa de cuatro capas (61 entradas, 512, 256, 128 y 14 salidas) con activación ELU, heredada sin cambios del modelo base. La tabla de búsqueda almacena, para cada paso de las ejecuciones grabadas de las cinco semillas oficiales, la observación registrada (`L_obs`, enmascarada por `L_mask` sobre 48 de las 61 entradas) y la acción a ejecutar en ese paso (`L_act`). En cada paso de control, el sistema busca la fila almacenada más cercana a la observación actual según la mayor diferencia absoluta sobre las entradas enmascaradas; si esa diferencia queda por debajo de `L_tol` (1e-7), se reproduce la acción almacenada y, en caso contrario, actúa la red. Sobre una semilla oficial las observaciones se repiten de forma exacta, por lo que la ejecución se reproduce paso a paso; fuera de ellas, la red es la que genera la marcha.

El entrenamiento de este derivado no consistió en un ajuste de pesos, sino en una búsqueda evolutiva de secuencias de acciones. El autor extrajo las cinco secuencias de acciones grabadas del archivo base (todas las llamadas de acción de una ejecución, incluido el asentamiento no cronometrado, con 14 articulaciones por paso) y las optimizó semilla a semilla directamente en el runner de la Arena sobre su propia máquina x86-64 Linux con MuJoCo 3.10.0. Empleó CMA-ES separable con población 320 sobre las últimas filas de la secuencia de cada semilla, con un coste definido como el tiempo de cruce de esa semilla interpolado dentro del paso de control de 0,02 s. El tamaño de paso resultó determinante: dado que las acciones saturan los servos, un paso inicial de 0,3 permitió mover las acciones tardías donde pasos de 0,004 solo podían pulir. Las filas de la semilla 5, la red, la máscara y la tolerancia se mantuvieron idénticas a las del base. El resultado son 311 filas re-buscadas para las semillas 1 a 4, el mismo número que en el modelo base.

## Capacidades

- Control de locomoción en simulación para el reto de escalada de colina de 1,5 m del Microduck Arena.
- Reproducción exacta de las ejecuciones de las semillas oficiales 1 a 5 mediante la tabla de búsqueda, siempre que la observación coincida bit a bit.
- Generalización limitada a nuevas condiciones de inicio mediante la red neuronal subyacente, que actúa cuando la observación no coincide con ninguna fila almacenada dentro de la tolerancia.
- Salida de 14 acciones articulares por paso de control, con pasos de física de 5 ms.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento; no es un modelo generativo de texto.
- No se ha validado en hardware físico; el propio autor indica explícitamente que no debe cargarse en un MicroDuck real.

## Casos de uso

- Banco de pruebas para búsqueda evolutiva: el archivo sirve como punto de partida para una nueva ronda de CMA-ES sobre las filas de las semillas 1 a 4, ya que el autor lo publica precisamente como base de su siguiente búsqueda y las distancias al siguiente tick quedan documentadas semilla a semilla.
- Reproducción de resultados en el Microduck Arena: permite volver a ejecutar las cinco semillas oficiales con `arena score` en x86-64 Linux y verificar el 0,740 s declarado, útil para auditar la metodología de búsqueda de secuencias.
- Estudio de políticas híbridas red más tabla de búsqueda: sirve para analizar cómo se comporta un esquema de lookup con tolerancia de 1e-7 frente a una política puramente neuronal, incluyendo la degradación a la red cuando la coincidencia falla.
- Evaluación de robustez numérica: al depender de la coincidencia bit a bit de las observaciones, es un caso de estudio de la fragilidad de las políticas basadas en repetición exacta ante diferencias de redondeo en coma flotante entre máquinas.
- Docencia e investigación en robótica simulada: ejemplo compacto y reproducible de optimización de secuencias de acciones con MuJoCo 3.10.0 y del uso de métricas de cruce interpoladas dentro de un paso de control de 0,02 s.
- Comparación de metodologías de búsqueda: permite contrastar el efecto del tamaño de paso inicial (0,3 frente a 0,004) en la optimización de acciones que saturan los servos, con datos concretos de tiempos por semilla.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados con `arena score` del Microduck Arena en x86-64 Linux. Cruce interpolado en pasos de control de 0,02 s; entre paréntesis, el valor que cada semilla necesitaría para bajar un tick.

| Semilla | Base | Este archivo | Pasos de física hasta meta |
|---|---|---|---|
| 1 | 36,9465 | 36,8058 | 148 (147 requiere 36,750) |
| 2 | 37,1218 | 37,0971 | 149 (148 requiere 37,000) |
| 3 | 36,9809 | 36,9714 | 148 (147 requiere 36,750) |
| 4 | 36,7644 | 36,7226 | 147 (146 requiere 36,500) |
| 5 | 36,9754 | 36,9754 | 148 (147 requiere 36,750) |

Media de las cinco semillas oficiales: 0,740 s, idéntica al modelo base, con 5 de 5 semillas completadas. En 300 semillas nuevas (desde 1.000.000 en adelante) no vistas por ninguna búsqueda del autor, 228 terminan, con un tiempo medio de finalización de 0,863 s entre las que terminan y un peor caso de 1,18 s; según el autor, es la red del base la que escala la mayoría de los arranques. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0,0 GB y la red es de tamaño reducido (61 → 512 → 256 → 128 → 14), por lo que la inferencia cabe holgadamente en cualquier GPU consumer y en CPU.
- No se especifican requisitos de VRAM en la información disponible; por la arquitectura, no se espera que sean significativos.
- GPU recomendadas: no disponibles. El autor solo documenta la evaluación en x86-64 Linux con MuJoCo 3.10.0, sin mención de GPU.
- Cabe en GPU consumer: sí, por el tamaño del artefacto, aunque no hay validación publicada al respecto.
- Opciones de despliegue: el runner del Microduck Arena y la librería `microduck`; el artefacto se distribuye en ONNX, por lo que puede ejecutarse con un runtime ONNX estándar. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Los tiempos publicados son de simulación (pasos de física de 5 ms y tiempos de finalización en segundos), no de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Resultado en el reto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rumezhak/microduck-hill-remix-leader2` | Red densa más tabla de búsqueda (ONNX) | No disponible | No aplica | 0,740 s de media, 5/5 semillas oficiales | Apache-2.0 | Hugging Face, 19 descargas |
| `a1rb4Ck/microduck-hill-1m5` | Red densa más tabla de búsqueda | No disponible | No aplica | 0,740 s de media, 5/5 semillas oficiales | Apache-2.0 | Hugging Face; mantiene el liderato en la clasificación según el autor |
| `jrubiosainz` (remix9) | Política para el Microduck Arena | No disponible | No aplica | No disponible | No disponible | Referenciado en los créditos del modelo base |

Las diferencias entre este archivo y su base son exclusivamente las filas re-buscadas de las semillas 1 a 4 (311 filas en ambos casos); la red, la máscara, la tolerancia y las filas de la semilla 5 son idénticas. No se dispone de datos de otros competidores del Microduck Arena en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son in-sample: la tabla de búsqueda solo reproduce las ejecuciones de las cinco semillas oficiales, y la coincidencia exige la observación bit a bit.
- El redondeo en coma flotante de otra máquina puede romper la reproducción y hacer que esa semilla caiga a la red; el autor solo verificó en x86-64 Linux.
- No debe cargarse en un robot MicroDuck físico: el modelo se entrenó y evaluó únicamente en el simulador de la Arena y las acciones tardías quedan muy fuera de lo que se pediría a un servo real.
- En 300 semillas nuevas no vistas, solo 228 terminan (76 %), con un peor caso de 1,18 s; el rendimiento fuera de las semillas oficiales es sensiblemente inferior.
- No mejora el resultado del modelo base en la clasificación: los tiempos de finalización son los mismos (148, 149, 148, 147 y 148 pasos de física), y el base conserva el liderato por haber sido enviado antes.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, al no ser un modelo de lenguaje; el riesgo equivalente es la reproducción de acciones inadecuadas cuando la observación coincide parcialmente con una fila almacenada.
- Licencia Apache-2.0, que permite uso comercial; el autor mantiene la licencia del base. Cualquier uso comercial debe tener en cuenta que el artefacto solo es válido en simulación y carece de validación en hardware.
- El autor declara que un asistente de IA ayudó en algunos de los experimentos, lo que conviene considerar al reproducir la metodología.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-hill-remix-leader2
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-hill-1m5
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
- Perfil del autor del modelo base: https://huggingface.co/a1rb4Ck
- Perfil de jrubiosainz (remix9), citado en los créditos: https://huggingface.co/jrubiosainz
