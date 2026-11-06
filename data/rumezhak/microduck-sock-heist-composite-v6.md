# rumezhak/microduck-sock-heist-composite-v6

## Resumen

`rumezhak/microduck-sock-heist-composite-v6` es una entrada de la competición 6 m Sock Heist de la Microduck Arena, un espacio de evaluación organizado por Pollen Robotics. No es un modelo de lenguaje: es un artefacto de control para un robot simulado MicroDuck que combina una red neuronal de respaldo exportada a ONNX con tablas de búsqueda (`L_obs` y `L_act`) que reproducen trayectorias grabadas. La inferencia consiste en consultar esas tablas según la observación y, si no hay coincidencia, delegar en la red de respaldo.

El autor, rumezhak, parte de `jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c` (el mejor registro público previo) y aplica una búsqueda CMA-ES separable sobre las últimas filas de la secuencia de la semilla 1, mejorando el cruce de 959,81 a 958,92 pasos de física, es decir, un tick de 5 ms. El resultado es una media de 4,883 s en las cinco semillas oficiales, frente a 4,884 s de WR1N y 4,885 s de su propio composite v5.

La relevancia es acotada y muy específica: se trata de un artefacto de *leaderboard* con ajuste dentro de muestra sobre cinco semillas, dependiente de la versión exacta de MuJoCo (3.10.0), onnxruntime (1.24.4) y numpy (2.4.1) fijadas por la Arena. No está pensado para un robot físico y su licencia es fragmentaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de consulta de observación (`L_obs`, `L_act`) con red neuronal de respaldo (procedente de `lphatnguyen/microduck-sock-heist-6m-v3`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control robótico, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (pesos ONNX sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Sin licencia global; Apache-2.0 solo en las partes que la portan (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe` y modificaciones propias de cada contribuidor); el repositorio en su conjunto no se declara Apache-2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,0 GB (según Hugging Face) |
| Pipeline | robotics |
| Libreria | microduck |
| Tarea | 6 m Sock Heist, Microduck Arena (solo simulación) |
| Semillas evaluadas | 5 oficiales (5/5 finalizadas) |
| Tiempo medio | 4,883 s (scorer oficial de la Arena, x86-64) |
| Filas de lookup | 1347 (frente a 1348 en composite v5) |

## Arquitectura y entrenamiento

El artefacto no se entrena en el sentido habitual. Su núcleo es un grafo ONNX que implementa un mecanismo de consulta: dada una observación, busca la fila correspondiente en `L_obs` y emite la acción asociada de `L_act`. Si la observación no coincide con ninguna fila registrada, se activa la red de respaldo heredada de `lphatnguyen/microduck-sock-heist-6m-v3`, que generaliza peor y produce tiempos fuera de las cinco semillas oficiales.

La construcción es un proceso de mezcla y pulido: se escanea el top público y se toma la mejor secuencia válida por semilla, lo que da exactamente WR1N (semillas 1 a 4 de composite v5, semilla 5 de jrubiosainz), con 4884 ticks. Sobre esa base se ejecuta una búsqueda CMA-ES separable de las últimas filas de la semilla 1, en x86-64 y a baja prioridad, que reduce el cruce de 959,81 a 958,92 pasos de física. Respecto a composite v5 solo cambian las tablas `L_obs` y `L_act` (todas las filas reconstruidas, 1347 en lugar de 1348) y el metadato `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos.

No hay datos de entrenamiento, número de tokens, composición de dataset ni fases de RLHF o DPO, porque no es un modelo generativo. La "innovación" es puramente de optimización numérica sobre trayectorias grabadas, con una dependencia crítica de la reproducibilidad determinista del simulador.

## Capacidades

- Control de un MicroDuck simulado en la tarea 6 m Sock Heist de la Microduck Arena.
- Reproducción determinista de cinco trayectorias grabadas (una por semilla oficial) bajo MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64.
- Consulta de tabla por observación con red de respaldo para observaciones no vistas.
- Ejecución en CPU x86-64 sin GPU, mediante onnxruntime.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.
- No apto para control de un robot físico (las acciones grabadas exceden lo que pedirían unos servos reales).

## Casos de uso

- Evaluación comparativa en la Microduck Arena: sirve como referencia de marca a batir en la clasificación de 6 m Sock Heist, con 4,883 s de media en las cinco semillas oficiales.
- Reproducción de resultados en investigación de optimización de políticas: permite replicar el pipeline de mezcla por semilla más CMA-ES separable sobre las colas de una trayectoria, partiendo de un artefacto publicado.
- Estudio de mecanismos de lookup con fallback: el par `L_obs`/`L_act` más red de respaldo es un ejemplo compacto de política híbrida memoria-red para entornos deterministas.
- Docencia sobre ajuste dentro de muestra: el propio autor documenta que fuera de las cinco semillas el comportamiento es el de la red v3, lo que lo convierte en un caso claro de sobreajuste a semillas concretas.
- Verificación de determinismo entre plataformas: útil para medir cuánto afecta el redondeo de CPU (x86-64 frente a Mac) a la coincidencia exacta de una tabla de lookup.
- Pruebas de integración de onnxruntime en pipelines de evaluación robótica, con versiones fijadas de dependencias y scorer propio de la Arena.

## Benchmarks y rendimiento

Resultados del scorer oficial de la Arena en x86-64, en segundos por semilla (menor es mejor):

| Semilla | composite v5 | WR1N (jrubiosainz) | composite v6 (este) |
|---|---|---|---|
| 1 | 4,800 | 4,800 | **4,795** |
| 2 | 5,150 | 5,150 | 5,150 |
| 3 | 4,750 | 4,750 | 4,750 |
| 4 | 4,800 | 4,800 | 4,800 |
| 5 | 4,925 | 4,920 | 4,920 |
| Media | 4,885 | 4,884 | **4,883** |

La puntuación es idéntica en todos los comandos, ya que las claves de búsqueda no incluyen el comando; la Arena lo puntúa a 0,20 m/s. En pasos de física, el cruce de la semilla 1 pasa de 959,81 a 958,92. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no ser aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la ejecución es en CPU mediante onnxruntime.
- GPU recomendadas: ninguna; el artefacto está pensado para CPU x86-64.
- Cabe en cualquier CPU de consumo; no requiere GPU dedicada ni aceleradores.
- Opciones de despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1, a través del entorno de la Microduck Arena.
- Latencia y throughput: el criterio de la Arena es el tiempo de finalización de la tarea (4,883 s de media), no el throughput de inferencia; no se publican métricas de latencia por paso.
- Advertencia de plataforma: en Mac los números difieren ligeramente y la consulta de lookup puede fallar; solo la física x86 del Space decide el resultado.

## Comparativa con modelos similares

| Modelo | Semilla 1 | Semilla 5 | Media | Base | Licencia |
|---|---|---|---|---|---|
| composite v6 (este) | 4,795 | 4,920 | 4,883 | WR1N + CMA-ES en semilla 1 | Fragmentaria, sin licencia global |
| jrubiosainz WR1N | 4,800 | 4,920 | 4,884 | Mejor secuencia por semilla del top público | Apache-2.0 en archivo LICENSE, sin campo `license:` |
| rumezhak composite v5 | 4,800 | 4,925 | 4,885 | Base de WR1N en semillas 1 a 4 | Sin licencia declarada |
| lphatnguyen v3 | no disponible | no disponible | no disponible | Red de respaldo usada aquí | Sin licencia declarada |

## Limitaciones y advertencias

- Ajuste dentro de muestra: fuera de las cinco semillas oficiales el archivo se comporta como la red v3 de lphatnguyen; solo las cinco trayectorias grabadas son rápidas.
- Dependencia estricta de versiones: la reproducibilidad determinista exige MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64; el redondeo de otra CPU puede romper una coincidencia de lookup.
- Margen mínimo: una ventaja de 1 ms es despreciable y cualquiera que mezcle las mejores filas por semilla y pula las colas puede igualarla o superarla.
- Licencia fragmentaria: Apache-2.0 se aplica solo a las partes que la portan (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`, más las modificaciones propias de cada contribuidor); el repositorio en su conjunto no está etiquetado Apache-2.0 y las partes sin licencia no se relicencian.
- Falta de consentimiento explícito: el autor no consultó a jrubiosainz, HlibPlakhtii, lphatnguyen ni a1rb4Ck antes de publicar; se compromete a retirar la entrada si algún autor objeta.
- No apto para robot físico: las acciones grabadas están muy fuera de lo que se pediría a servos reales; no debe cargarse en un MicroDuck real.
- Solo simulación: la evaluación se limita al simulador de la Arena; no hay validación en hardware.
- Sin sesgos lingüísticos ni riesgo de alucinación en el sentido de los modelos de lenguaje, pero sí riesgo de fallo silencioso del lookup ante observaciones no registradas.
- Uso comercial: no disponible, dada la ausencia de una licencia global clara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v6
- Modelo base (WR1N): https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c
- Modelo base (composite v5): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v5
- Red de respaldo (v3): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Red de respaldo (v4): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Secuencias de semillas 1 y 4 (quicksilver-v2): https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v2
- Layout del grafo de lookup: https://huggingface.co/a1rb4Ck/microduck-heist
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
