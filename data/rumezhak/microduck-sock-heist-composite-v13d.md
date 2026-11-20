# rumezhak/microduck-sock-heist-composite-v13d

## Resumen

`rumezhak/microduck-sock-heist-composite-v13d` es una política de control para robótica publicado en Hugging Face, concebida como entrada para la prueba "6 m Sock Heist" de la Microduck Arena de Pollen Robotics. No es un modelo de lenguaje ni un transformer generativo: es un grafo ONNX que combina una red de respaldo (el modelo v3 de lphatnguyen) con tablas de búsqueda (`L_obs` y `L_act`) que mapean observaciones a acciones previamente grabadas. El autor lo describe explícitamente como una variante "más lenta" de su composite v13, con un tiempo medio de 4,762 s frente a los 4,760 s de v13 sobre los cinco seeds oficiales.

La relevancia del artefacto es acotada y muy específica: sirve como punto de datos verificado y reproducible dentro de una línea de trabajo de optimización de trayectorias en simulador. Solo dos seeds (el 3 y el 4) difieren de v13, y lo hacen en un tick (5 ms) más lento en cada caso; el resto de trayectorias ya estaban publicadas en entradas anteriores. El propio autor advierte que no se trata de una mejora ni de un récord, sino de una muestra adicional sobre la misma estirpe.

Es fundamental subrayar que el modelo está diseñado exclusivamente para simulación. Las acciones grabadas quedan muy fuera de lo que servomotores reales podrían ejecutar, y el autor prohíbe explícitamente cargarlo en un MicroDuck físico. Además, el rendimiento es "in-sample": fuera de los cinco seeds oficiales, el archivo se comporta como la red v3 de lphatnguyen, y solo las cinco trayectorias registradas son rápidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con red de respaldo (v3 de lphatnguyen) y tablas de búsqueda observación-acción (`L_obs`, `L_act`, 1317 filas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Mixta: Apache-2.0 solo para las partes que la portan (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`); el repositorio en su conjunto no está etiquetado como Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo no se entrena mediante descenso de gradiente en el sentido habitual. Su funcionamiento se basa en un grafo ONNX que, en cada paso, consulta una tabla de búsqueda (`L_obs`) indexada por la observación para recuperar una acción previamente grabada (`L_act`). Cuando la observación no coincide con ninguna entrada de la tabla, el grafo recurre a la red de respaldo, que es el modelo `lphatnguyen/microduck-sock-heist-6m-v3`. Las tablas contienen 1317 filas, todas reconstruidas respecto a v13, y la clave de búsqueda no incluye el comando, por lo que la puntuación es idéntica en todos los comandos (la Arena lo evalúa a 0,20 m/s).

Respecto a composite v13, solo difieren las tablas `L_obs` y `L_act` y el metadato `modification_notice`, que conserva el texto de v13 (y este los anteriores) y añade el propio. El grafo, la red de respaldo y el resto de tensores son idénticos. Las trayectorias proceden de entradas públicas anteriores: el seed 3 (931 ticks) y el seed 4 (936 ticks) provienen del v12 del autor, no del v13. No se ha realizado ninguna búsqueda nueva para este archivo.

## Capacidades

- Control de política para la tarea "6 m Sock Heist" en la Microduck Arena (simulación).
- Reproducción determinista de cinco trayectorias concretas sobre los seeds oficiales 1 a 5.
- Recurso a red de respaldo cuando la observación no está en la tabla de búsqueda.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No soporta agentes ni planificación simbólica.

## Casos de uso

- Evaluación de políticas en la Microduck Arena: sirve como entrada de referencia para comparar tiempos sobre los cinco seeds oficiales con el scorer de la Arena.
- Reproducción de experimentos: permite replicar de forma determinista los resultados en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados por la Arena.
- Estudio de linajes de optimización de trayectorias: documenta cómo variantes sucesivas (v12, v13, v13d) modifican ticks concretos y su efecto en la media.
- Punto de comparación para investigaciones sobre búsqueda de trayectorias en simulación: útil para contrastar métodos de búsqueda propios contra una referencia publicada y verificada.
- Docencia y divulgación sobre políticas híbridas lookup + red neuronal en robótica simulada: ejemplo didáctico de arquitectura con fallback.
- Auditoría de licencias y atribución en modelos derivados: el `NOTICE` y los avisos de licencia sirven como caso práctico de composición de artefactos con licencias heterogéneas.

## Benchmarks y rendimiento

Resultados publicados por el autor con el scorer de la Arena sobre los cinco seeds oficiales (tiempo en segundos; 5/5 finalizados):

| Seed | composite v13 | este archivo (v13d) |
|---|---|---|
| 1 | 4,615 | 4,615 |
| 2 | 5,070 | 5,070 |
| 3 | 4,650 | 4,655 |
| 4 | 4,675 | 4,680 |
| 5 | 4,790 | 4,790 |
| Media | 4,760 | 4,762 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni tendrían sentido para este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB, por lo que la huella es mínima y cabe en CPU.
- GPU recomendadas: no se especifican; el autor reporta resultados en x86-64 con CPU, sin mención de GPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se documenta.
- Opciones de despliegue: onnxruntime (versión fijada 1.24.4 por la Arena) junto con MuJoCo 3.10.0 y numpy 2.4.1; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles como métricas independientes; el tiempo relevante es el de finalización de la tarea (4,762 s de media en los cinco seeds).

## Comparativa con modelos similares

| Modelo | Tiempo medio (5 seeds) | Relación | Licencia | Estado |
|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v13` | 4,760 s | Modelo base directo | Mixta (no etiquetado Apache-2.0 en conjunto) | Público |
| `rumezhak/microduck-sock-heist-composite-v13d` (este) | 4,762 s | Variante más lenta de v13 | Mixta (no etiquetado Apache-2.0 en conjunto) | Público |
| `lphatnguyen/microduck-sock-heist-6m-v3` | no disponible | Red de respaldo usada por este archivo | Sin licencia declarada | Público |
| `lphatnguyen/microduck-sock-heist-6m-v5` | no disponible | Origen de las trayectorias de seeds 1 a 4 | Sin licencia declarada | Público |
| `HlibPlakhtii/microduck-sock-heist-nov18-v5` | no disponible | Origen de la trayectoria del seed 5 | Sin licencia declarada | Público |

## Limitaciones y advertencias

- Rendimiento in-sample: fuera de los cinco seeds oficiales, el archivo se comporta como la red v3 de lphatnguyen; solo las cinco trayectorias registradas son rápidas.
- Solo simulación: las acciones grabadas quedan muy fuera de lo que servomotores reales podrían ejecutar; el autor prohíbe cargarlo en un MicroDuck físico.
- Determinismo dependiente del entorno: las repeticiones son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otro CPU podría romper alguna por redondeo, y un Mac da números ligeramente distintos y su lookup puede fallar.
- Licencia ambigua: el repositorio en su conjunto no está etiquetado como Apache-2.0; Apache-2.0 aplica solo a las partes que la portan. Varios modelos de origen no declaran licencia.
- Riesgo de retirada: el autor no consultó a HlibPlakhtii, jrubiosainz, GinDuck, lphatnguyen ni a1rb4Ck antes de publicar; si algún autor objeta, el repositorio será retirado.
- Sin datos de sesgo, alucinación ni idioma: no aplican en el sentido de los LLM, pero tampoco se documentan evaluaciones de robustez fuera de los seeds oficiales.
- Uso comercial: no se especifica; la licencia mixta y la falta de declaración de los modelos de origen impiden asumir permisos claros para explotación comercial.
- Contribución asistida por IA: el autor indica que un asistente de IA ayudó en algunos experimentos, sin detallar el alcance.

## Enlaces

- Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13d
- Modelo base (v13): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v13
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- `HlibPlakhtii/microduck-sock-heist-nov18-v5`: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- `lphatnguyen/microduck-sock-heist-6m-v5`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- `lphatnguyen/microduck-sock-heist-6m-v3`: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- `a1rb4Ck/microduck-heist` (commit 94cd2cfe): https://huggingface.co/a1rb4Ck/microduck-heist
- Pollen Robotics: https://huggingface.co/pollen-robotics
