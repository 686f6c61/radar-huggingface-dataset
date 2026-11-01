# rumezhak/microduck-hill-remix-leader3

## Resumen

`rumezhak/microduck-hill-remix-leader3` es un modelo de control para robótica presentado como entrada en la competición **1.5 m Hill Climb** de la [Microduck Arena](https://huggingface.co/spaces/pollen-robotics/microduck-arena) de Pollen Robotics. No es un modelo de lenguaje: es un artefacto de inferencia que combina una red neuronal de pequeñas dimensiones (61 → 512 → 256 → 128 → 14 con activaciones ELU) con una tabla de búsqueda de acciones grabadas, y su única tarea es hacer que un robot simulado MicroDuck suba una colina de 1,5 m en el menor tiempo posible.

El modelo deriva por fine-tuning de `a1rb4Ck/microduck-hill-1m5`, al que reemplaza las filas de la tabla de búsqueda correspondientes a las semillas oficiales 1 a 4 por secuencias de acciones re-optimizadas mediante CMA-ES separable. El resultado es una mejora marginal pero medible en el entorno de simulación de la Arena: la media de cinco semillas baja de 0,740 s a 0,739 s, con la semilla 1 pasando de 148 a 147 pasos de física (0,740 s → 0,735 s).

Es relevante únicamente como pieza de investigación en aprendizaje por refuerzo aplicado a locomoción simulada y como ejemplo de optimización de políticas mediante búsqueda directa sobre secuencias de acciones. Su utilidad fuera del simulador de la Arena es nula, y el propio autor advierte explícitamente de que no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal fully-connected 61 → 512 → 256 → 128 → 14 con activaciones ELU, combinada con tabla de búsqueda de acciones grabadas (lookup) |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera paso a paso sobre observaciones de 61 entradas, 48 de ellas enmascaradas) |
| Tipos de cuantizacion | no disponible; exportación a ONNX según los tags del repositorio |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (tag `onnx`); librería `microduck` |

## Arquitectura y entrenamiento

La política consta de dos componentes acoplados. El primero es una red neuronal densa de cuatro capas (61 entradas, capas ocultas de 512, 256 y 128 neuronas, 14 salidas correspondientes a las articulaciones) con activación ELU. El segundo es un mecanismo de lookup: `L_obs` almacena la observación registrada en cada paso de las ejecuciones de las cinco semillas oficiales (enmascarada por `L_mask`, que cubre 48 de las 61 entradas), y `L_act` la acción a ejecutar en ese paso. En cada instante, el sistema busca la fila almacenada más cercana a la observación actual (distancia máxima sobre las entradas enmascaradas) y, si está dentro de la tolerancia `L_tol` (1e-7), reproduce la acción grabada; en caso contrario, delega en la red neuronal.

El entrenamiento consistió en extraer las cinco secuencias de acciones registradas del modelo base (todas las llamadas de acción de una ejecución, incluido el asentamiento no cronometrado, 14 articulaciones por paso) y re-optimizarlas semilla a semilla directamente en el runner de la Arena sobre Linux x86-64 con MuJoCo 3.10.0. Se empleó CMA-ES separable con población 320 sobre las últimas filas de cada secuencia, usando como coste el tiempo de cruce interpolado dentro del paso de control de 0,02 s. El tamaño de paso inicial resultó crítico: con acciones en el rango aproximado de −14 a +14 y servos que saturan, un paso inicial de 0,3 permitió mover las acciones tardías donde pasos de 0,004 solo pulían. La semilla 4 mejoró en las últimas 26 llamadas (paso inicial 0,3) y la semilla 1 en las llamadas 20 a 50 (paso inicial 0,2) tras converger las tardías. En total se reemplazaron 311 filas de `L_obs` y `L_act`; la red, la máscara, la tolerancia y las filas de la semilla 5 se mantienen del modelo base.

## Capacidades

- Locomoción simulada de un MicroDuck en la prueba 1.5 m Hill Climb de la Microduck Arena.
- Reproducción exacta de las ejecuciones de las semillas oficiales 1 a 5 cuando la observación coincide bit a bit con la registrada (tolerancia 1e-7).
- Generalización limitada a nuevas condiciones de inicio mediante la red neuronal subyacente: en 300 semillas frescas (desde 1.000.000) no vistas por la búsqueda, 228 terminan el recorrido.
- Control de 14 articulaciones a partir de observaciones de 61 entradas (48 efectivas tras la máscara).
- Exportación a ONNX para inferencia en el runner de la Arena.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo generativo de propósito general.

## Casos de uso

- Evaluación comparativa en la Microduck Arena: sirve como entrada de referencia para medir la progresión de tiempos en la tabla de clasificación del Hill Climb, con una media de 0,739 s sobre las cinco semillas oficiales.
- Investigación en optimización de políticas por búsqueda directa: el par red + lookup es un banco de pruebas reproducible para estudiar cómo CMA-ES separable con distintos tamaños de paso inicial afecta a secuencias de acciones con saturación de servos.
- Estudio de robustez de replay determinista: permite analizar cómo el redondeo en coma flotante de distintas plataformas rompe la coincidencia bit a bit y degrada la ejecución a la red neuronal, con las semillas como casos controlados.
- Docencia en aprendizaje por refuerzo simulado: ejemplo compacto (red de 61 → 512 → 256 → 128 → 14) para ilustrar el acoplamiento entre una política neuronal y una memoria de experiencias grabadas.
- Reproducción de experimentos de locomoción en MuJoCo 3.10.0: el modelo documenta la versión exacta del simulador y el runner (versión 5, reloj de 5 ms), lo que facilita replicar los resultados en Linux x86-64.
- Análisis de sensibilidad de hiperparámetros de búsqueda: la comparación entre el modelo base y este archivo (311 filas re-buscadas frente a las mismas 311 del base) permite aislar el efecto del tamaño de paso inicial en la convergencia de la optimización.
- Línea base para futuras entradas de la Arena: cualquier participante puede partir de estas secuencias y aplicar su propio optimizador para intentar bajar de los 147 pasos de física de la semilla 1.

## Benchmarks y rendimiento

Resultados evaluados con el comando `arena score` oficial sobre Linux x86-64. La tabla muestra el cruce interpolado en pasos de control de 0,02 s, comparando el modelo base con este archivo:

| Semilla | Base | Este archivo | Pasos de física hasta terminar |
|---|---|---|---|
| 1 | 36.9465 | 36.6669 | 147 (146 requeriría 36.500) |
| 2 | 37.1218 | 37.0822 | 149 (148 requeriría 37.000) |
| 3 | 36.9809 | 36.9714 | 148 (147 requeriría 36.750) |
| 4 | 36.7644 | 36.7226 | 147 (146 requeriría 36.500) |
| 5 | 36.9754 | 36.9754 | 148 (147 requeriría 36.750) |

Puntuación global: 0,739 s de media, con 5 de 5 semillas oficiales completadas. En 300 semillas frescas (desde 1.000.000) no vistas durante la búsqueda, 228 terminan, con un tiempo medio de finalización de 0,863 s y un peor caso de 1,18 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la red es de tamaño muy reducido (61 → 512 → 256 → 128 → 14), por lo que cabe holgadamente en cualquier GPU consumer, aunque no se publican cifras.
- GPU recomendadas: no se especifican; el autor evaluó exclusivamente en CPU sobre Linux x86-64, por lo que no hay requisitos de GPU documentados.
- Cabe en GPU consumer: sí, por el tamaño del artefacto, aunque no hay validación publicada al respecto.
- Opciones de despliegue: runner de la Microduck Arena (versión 5, reloj de 5 ms) y exportación ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste computacional relevante es el número de pasos de física hasta completar el recorrido (147 a 149 en las semillas oficiales), no la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media 5 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rumezhak/microduck-hill-remix-leader3 | no disponible | no aplica | 0,739 s (in-sample) | Apache-2.0 | HuggingFace |
| a1rb4Ck/microduck-hill-1m5 | no disponible | no aplica | 0,740 s | Apache-2.0 | HuggingFace |
| rumezhak/microduck-hill-remix-leader2 | no disponible | no aplica | no disponible (solo re-buscaba los mismos ticks) | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Los resultados son in-sample: el lookup solo reproduce las ejecuciones de las cinco semillas oficiales y exige coincidencia bit a bit de la observación; el redondeo en coma flotante de otra máquina puede romper el replay y degradar esa semilla a la red neuronal.
- Solo se validó en Linux x86-64 con MuJoCo 3.10.0; no hay verificación en otras plataformas.
- El cruce de la semilla 1 queda a 0,09 pasos de control por debajo de su frontera de tick, un margen muy estrecho que puede perderse con cambios mínimos en el entorno.
- El modelo está entrenado y evaluado únicamente en el simulador de la Arena; las acciones tardías quedan muy fuera de lo que se pediría a un servo real. El autor advierte explícitamente de que no debe cargarse en un MicroDuck físico.
- No es un mejor escalador en general: la mejora sobre el base se limita a re-buscar los ticks de las semillas oficiales, no a mejorar la política neuronal subyacente.
- No hay datos publicados sobre sesgos, alucinación o comportamiento multilingüe porque el modelo no genera texto.
- Licencia Apache-2.0, que permite uso comercial del artefacto, pero sin garantías de funcionamiento fuera del entorno de simulación descrito.
- El autor indica que un asistente de IA ayudó en algunos experimentos, sin detallar el alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rumezhak/microduck-hill-remix-leader3
- Modelo base: https://huggingface.co/a1rb4Ck/microduck-hill-1m5
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil del autor del modelo base: https://huggingface.co/a1rb4Ck
- Perfil de Pollen Robotics: https://huggingface.co/pollen-robotics
- Perfil de jrubiosainz (contribuidor citado en los créditos): https://huggingface.co/jrubiosainz
