# rumezhak/microduck-sock-heist-composite-v12

## Resumen

`microduck-sock-heist-composite-v12` es una entrada de competición para la prueba de 6 metros "Sock Heist" de la Microduck Arena, un entorno de simulación de robótica de código abierto impulsado por Pollen Robotics. No es un modelo de lenguaje ni un sistema de aprendizaje general: es un artefacto de control compuesto por una red neuronal de respaldo (heredada de `lphatnguyen/microduck-sock-heist-6m-v3`) y una tabla de búsqueda (`lookup table`) de observaciones y acciones con 1318 filas que codifica trayectorias precalculadas para las cinco semillas oficiales de la prueba.

El modelo lo publica el usuario de Hugging Face `rumezhak` como una fusión (merge) de su anterior `composite-v11` y de `HlibPlakhtii/microduck-sock-heist-nov18-v5`. Su relevancia es acotada: compite en una liga de simulación concreta y su interés técnico reside en el método de optimización (búsqueda CMA-ES separable sobre las últimas filas de cada trayectoria y exploración de ramas de historial de contactos), no en capacidades generales de IA. El resultado declarado es un tiempo medio de 4,766 s sobre las cinco semillas oficiales, frente a 4,770 s de `nov18-v5` y 4,771 s de `composite-v11`.

El repositorio ocupa 0,0 GB y se distribuye en formato ONNX con la librería `microduck`. La model card advierte explícitamente de que el artefacto es "solo simulación" y no debe cargarse en un MicroDuck físico, porque las acciones registradas exceden los límites de los servomotores reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con red neuronal de respaldo y tablas de búsqueda de observación (`L_obs`) y acción (`L_act`); sin transformer |
| Parametros totales | no disponible (el repositorio ocupa 0,0 GB; no se detalla el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada = observación del entorno simulado) |
| Tipos de cuantizacion | no disponible (se distribuye como grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Mixta y parcial: Apache-2.0 solo para el layout del grafo y el mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe` y las modificaciones propias; el repositorio en conjunto no está etiquetado como Apache-2.0. Los modelos base (`HlibPlakhtii/...nov18-v5`, `jrubiosainz/...s1s5`, `lphatnguyen/...v5`) no declaran licencia |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El artefacto no se entrena por descenso de gradiente en el sentido habitual. La arquitectura es un grafo ONNX que combina una red de respaldo (la de `lphatnguyen/microduck-sock-heist-6m-v3`) con un mecanismo de búsqueda por observación: dada una observación del entorno, el grafo consulta una tabla `L_obs` y devuelve la acción correspondiente de `L_act`. Las claves de búsqueda no incluyen el comando, de modo que la puntuación es idéntica a cualquier velocidad de comando; la Arena lo evalúa a 0,20 m/s.

La construcción de `v12` parte de un escaneo de las mejores entradas públicas en x86-64 y de la selección de la mejor secuencia por semilla. Después se buscan las últimas filas de cada semilla con un CMA-ES separable y, cuando una semilla queda justo por encima de un umbral de tick, se exploran ramas de historial de contactos que arrancan desde un "kick" de un ulp y se repulen. Cada candidato se reproduce en el runner de la Arena. Respecto a `composite-v11` solo cambian las tablas `L_obs` y `L_act` (todas las filas reconstruidas, 1318 en total) y la metadata `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos.

Las trayectorias de búsqueda parten de `lphatnguyen/sock-heist-6m-v5` (semillas 1 a 4) y de `HlibPlakhtii/nov17-v3` (semilla 5). La semilla 2 del archivo final es la de Hlib sin modificar; las semillas 1, 3, 4 y 5 son propias (3, 4 y 5 heredadas de `v11`).

## Capacidades

- Control locomotor de un agente simulado en la tarea "Sock Heist" de 6 m de la Microduck Arena.
- Reproducción determinista de cinco trayectorias optimizadas, una por semilla oficial, con tiempos de 4,615 s, 5,090 s, 4,655 s, 4,680 s y 4,790 s.
- Inferencia vía ONNX Runtime sobre el grafo publicado, con la librería `microduck`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No tiene modo "thinking", visión, audio ni ninguna capacidad multimodal.
- Fuera de las cinco semillas oficiales, el comportamiento degrada a la red de respaldo de `lphatnguyen` v3.

## Casos de uso

- Reproducción de resultados en la Microduck Arena: cargar el ONNX en el runner oficial con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 para verificar el tiempo medio de 4,766 s sobre las cinco semillas.
- Referencia de línea base para investigación en optimización de políticas: sirve como punto de partida para aplicar CMA-ES separable sobre las colas de las trayectorias y medir mejoras en el scorer oficial.
- Estudio de mecanismos de lookup en control: permite analizar cómo una tabla de observación-acción sustituye a una política neuronal en entornos con estados discretizables.
- Docencia sobre evaluación reproducible en robótica simulada: ilustra el uso de versiones fijadas de simulador y runtime para garantizar determinismo entre máquinas x86-64.
- Análisis de linaje y atribución de artefactos: el `NOTICE` y la sección 4(b) de Apache-2.0 documentan cómo se compone un modelo a partir de contribuciones de varios autores.
- Pruebas de robustez frente a redondeo de CPU: comparar la ejecución en x86-64 frente a Mac permite estudiar la sensibilidad del lookup a diferencias de coma flotante.
- No es adecuado para despliegue en robot físico ni para ninguna tarea fuera de la simulación de la Arena.

## Benchmarks y rendimiento

Resultados declarados por el autor con el scorer oficial de la Arena, en su máquina x86-64, sobre las cinco semillas oficiales:

| Semilla | composite v11 | Hlib nov18-v5 | este archivo (v12) |
|---|---|---|---|
| 1 | 4,635 s | 4,635 s | **4,615 s** |
| 2 | 5,095 s | 5,090 s | **5,090 s** |
| 3 | 4,655 s | 4,655 s | **4,655 s** |
| 4 | 4,680 s | 4,680 s | **4,680 s** |
| 5 | 4,790 s | 4,790 s | **4,790 s** |
| Media | 4,771 s | 4,770 s | **4,766 s** |

Comparativa adicional citada en la model card: `GinDuck/microduck-gin-sock-c18` obtiene 4,771 s de media. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros): no aplican a este artefacto.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU con ONNX Runtime. El repositorio ocupa 0,0 GB.
- GPU: no se requiere ni se documenta soporte GPU; el autor evalúa en x86-64.
- GPU de consumo: irrelevante para este artefacto; el cuello de botella es la CPU y la versión de MuJoCo.
- Despliegue: ONNX Runtime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1 (versiones fijadas por la Arena). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de finalización de la tarea (media 4,766 s), no latencia por paso.
- Advertencia de portabilidad: los replays son deterministas en x86-64 con las versiones fijadas; otra CPU puede romper alguno por redondeo, y en Mac los números difieren ligeramente y el lookup puede fallar.

## Comparativa con modelos similares

| Modelo | Autor | Media (5 semillas) | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduck-sock-heist-composite-v12` | rumezhak | 4,766 s | Lookup + red de respaldo, CMA-ES | Mixta/parcial (ver arriba) | Hugging Face |
| `microduck-sock-heist-composite-v11` | rumezhak | 4,771 s | Lookup + red de respaldo | no disponible | Hugging Face |
| `microduck-sock-heist-nov18-v5` | HlibPlakhtii | 4,770 s | Trayectorias optimizadas | no disponible | Hugging Face |
| `microduck-gin-sock-c18` | GinDuck | 4,771 s | Trayectorias optimizadas | no disponible | Hugging Face |

Las diferencias entre las cuatro entradas son de milisegundos (5 ms entre la mejor y la peor media), por lo que la comparativa es esencialmente un empate técnico dentro del ruido de la competición.

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de las cinco semillas oficiales el archivo equivale a la red de `lphatnguyen` v3; solo las cinco trayectorias registradas son rápidas.
- Determinismo frágil: los replays dependen de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 en x86-64; otra CPU o un Mac pueden alterar los resultados o hacer fallar el lookup.
- Ventaja marginal: el autor reconoce que unos pocos milisegundos de ventaja serán igualados o superados por cualquiera que tome estas filas y pula las colas.
- No apto para robot físico: las acciones registradas están muy fuera de lo que se pediría a servomotores reales; no debe cargarse en un MicroDuck real.
- Licencia compleja: el repositorio no está etiquetado como Apache-2.0 en su conjunto; los modelos base no declaran licencia y sus partes no se relicencian aquí. El uso comercial exige revisar `LICENSE-apache-2.0.txt` y `NOTICE` pieza por pieza.
- Falta de consentimiento de los autores base: el autor no consultó a HlibPlakhtii, jrubiosainz, GinDuck, lphatnguyen ni a1rb4Ck; si alguno objeta, la entrada se retirará.
- Sin datos de sesgos, alucinación o idioma: no aplican a un artefacto de control, pero tampoco se documentan evaluaciones de robustez más allá de las cinco semillas.
- Asistencia de IA declarada en algunos experimentos, sin detalle de alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v12
- Modelo base (merge): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v11
- Modelo base (merge): https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Trayectorias de partida: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Red de respaldo: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Contribución de jrubiosainz: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5
- Layout del grafo de lookup (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist/tree/94cd2cfe
- Entrada comparada de GinDuck: https://huggingface.co/GinDuck/microduck-gin-sock-c18
- Pollen Robotics: https://huggingface.co/pollen-robotics
