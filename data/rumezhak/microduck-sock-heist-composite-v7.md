# rumezhak/microduck-sock-heist-composite-v7

## Resumen

microduck-sock-heist-composite-v7 es un artefacto de política de control para robótica presentado como entrada en la competición "6 m Sock Heist" de la Microduck Arena, un espacio de evaluación alojado en Hugging Face y promovido por Pollen Robotics. El modelo lo publica el usuario rumezhak y es el séptimo de una línea de composites que fusiona y pule secuencias de otros participantes. No es un modelo de lenguaje: es un grafo ONNX que, dada una observación del simulador, devuelve acciones de control para que un robot MicroDuck recorra una distancia de seis metros en el menor tiempo posible.

Técnicamente, el repositorio combina un grafo de búsqueda en tablas (lookup) sobre observaciones y acciones con una red neuronal de respaldo ("fallback network") heredada de lphatnguyen/microduck-sock-heist-6m-v3. La innovación de esta versión es mínima y muy específica: mediante una búsqueda CMA-ES separable sobre las últimas filas de la secuencia de la semilla 4, se ha reducido el cruce de 959,9996 a 956,53 pasos de física, es decir, tres ticks de 5 ms. El resultado agregado en las cinco semillas oficiales es de 4,880 s, frente a 4,883 s de la v6 y 4,884 s de la entrada WR1N de jrubiosainz.

Su relevancia es acotada pero ilustrativa: muestra cómo en competiciones de robótica simulada de bajo nivel los márgenes se deciden por milisegundos y por sobreajuste a las semillas oficiales, y cómo el ecosistema de licencias en estos repositorios comunitarios es frágil. El autor advierte explícitamente de que el modelo es solo para simulación, está ajustado in-sample a cinco semillas y no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tablas de búsqueda de observación (`L_obs`) y acción (`L_act`) más red neuronal de respaldo |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control por paso, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Mixta: Apache-2.0 solo para las partes que la portan (layout del grafo y mecanismo de lookup de a1rb4Ck, y modificaciones propias de los contribuyentes); el repositorio en conjunto no se etiqueta como Apache-2.0 |
| Formato de pesos | ONNX (grafo y tensores) |
| Libreria | microduck |
| Pipeline | robotics |
| Modelos base | rumezhak/microduck-sock-heist-composite-v5, jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c |
| Relación con base | merge |
| Entorno de ejecución | MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1 (versiones fijadas por la Arena) |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no se entrena en el sentido convencional. Su núcleo es un grafo ONNX que implementa un mecanismo de búsqueda en tablas: dada una observación discretizada del simulador, consulta `L_obs` para localizar la fila correspondiente y devuelve la acción asociada en `L_act`. Cuando la observación no coincide con ninguna fila registrada, se recurre a una red neuronal de respaldo (la v3 de lphatnguyen) que generaliza la acción. Esta arquitectura híbrida lookup + fallback es la que permite memorizar trayectorias concretas manteniendo un comportamiento mínimamente robusto fuera de ellas.

El "entrenamiento" de esta versión consiste en una búsqueda CMA-ES separable ejecutada en x86-64 sobre las últimas filas de la secuencia de la semilla 4, partiendo de la secuencia de la v6. El ajuste llevó el cruce de 959,9996 a 956,53 pasos de física. Respecto a la v5, solo cambian las tablas `L_obs` y `L_act` (todas las filas reconstruidas, 1347 en lugar de 1348) y el metadato `modification_notice`; el grafo, la red de respaldo y el resto de tensores son idénticos. Las otras cuatro secuencias son las de la v6, que a su vez provienen de las entradas públicas de jrubiosainz (WR1N y secuencias F2U), HlibPlakhtii (quicksilver-v2) y lphatnguyen (v3 y v4). El autor reconoce que el escaneo de las mejores entradas públicas no aportó nada nuevo: fusionar la mejor secuencia válida por semilla reproduce exactamente su v6.

## Capacidades

- Control de locomoción simulada: genera acciones de control para que un MicroDuck recorra seis metros en el simulador de la Microduck Arena.
- Ejecución determinista de trayectorias memorizadas en cinco semillas oficiales (1 a 5), con tiempos registrados entre 4,750 s y 5,150 s.
- Búsqueda por lookup de observación con red de respaldo para observaciones no vistas.
- Independencia del comando: la puntuación es idéntica en todos los comandos porque las claves de búsqueda no incluyen el comando; la Arena lo evalúa a 0,20 m/s.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Benchmarking de políticas de control en simulación: sirve como referencia cronometrada en las cinco semillas oficiales de la Microduck Arena para comparar variantes de locomoción de un MicroDuck simulado.
- Estudio de sobreajuste in-sample: permite analizar cómo un modelo que memoriza cinco trayectorias rinde muy bien en las semillas oficiales y degrada fuera de ellas, un caso didáctico sobre generalización en robótica.
- Reproducción de experimentos de búsqueda evolutiva: el método CMA-ES separable sobre filas de la tabla de acciones es replicable y sirve para estudiar optimización de políticas lookup-based.
- Análisis de determinismo numérico: útil para estudiar cómo diferencias de redondeo entre arquitecturas (x86-64 frente a Mac) afectan a la coincidencia de claves en un lookup y rompen la reproducibilidad.
- Docencia sobre licencias en modelos derivados: el repositorio documenta con detalle la cadena de atribuciones y la mezcla de licencias, útil como caso práctico de compliance en artefactos comunitarios.
- Investigación sobre competiciones de robótica simulada: sirve para evaluar el impacto de márgenes de milisegundos (tres ticks de 5 ms) en el ranking de una Arena.

## Benchmarks y rendimiento

Resultados reportados por el autor con el scorer propio de la Arena en una máquina x86-64, sobre las cinco semillas oficiales:

| Semilla | composite v6 | composite v7 (este modelo) |
|---|---|---|
| 1 | 4,795 | 4,795 |
| 2 | 5,150 | 5,150 |
| 3 | 4,750 | 4,750 |
| 4 | 4,800 | **4,785** |
| 5 | 4,920 | 4,920 |
| Media | 4,883 | **4,880** |

Comparación con la entrada de jrubiosainz WR1N: 4,884 s de media. El autor indica que la puntuación es la misma en todos los comandos y que la Arena lo evalúa a 0,20 m/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el modelo es un grafo ONNX de tablas de búsqueda, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; el autor ejecuta en CPU x86-64 con onnxruntime 1.24.4 y numpy 2.4.1.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; al ser un grafo ONNX pequeño, es plausible su ejecución en CPU sin GPU dedicada.
- Opciones de despliegue: onnxruntime con las versiones fijadas por la Arena (MuJoCo 3.10.0, onnxruntime 1.24.4, numpy 2.4.1); la librería microduck y el espacio de la Microduck Arena.
- Latencia y throughput: no disponibles; el criterio de rendimiento es el tiempo de recorrido en simulación (4,880 s de media), no la latencia de inferencia.
- Nota de reproducibilidad: los replays son deterministas solo en x86-64 con las versiones fijadas; otra CPU o un Mac pueden dar números distintos y hacer que el lookup falle.

## Comparativa con modelos similares

| Modelo | Autor | Media en 5 semillas | Relación | Licencia declarada |
|---|---|---|---|---|
| microduck-sock-heist-composite-v7 | rumezhak | 4,880 s | Este modelo | Mixta (Apache-2.0 parcial) |
| microduck-sock-heist-composite-v6 | rumezhak | 4,883 s | Base directa | No declarada |
| microduck-sock-heist-6m-wr1n-3f7c858c | jrubiosainz | 4,884 s | Modelo base del merge | Apache-2.0 (archivo LICENSE, sin campo `license:`) |
| microduck-sock-heist-6m-v3 | lphatnguyen | no disponible | Fuente de la red de respaldo | No declarada |
| microduck-sock-heist-quicksilver-v2 | HlibPlakhtii | no disponible | Fuente de las secuencias de semillas 1 y 4 | Sin nueva licencia ni propiedad sobre contribuciones upstream |

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de las cinco semillas oficiales el archivo se comporta como la red v3 de lphatnguyen; solo las cinco trayectorias registradas son rápidas.
- Margen mínimo: una ventaja de 1 ms es insignificante y cualquiera que fusione las mejores filas por semilla y pula las colas puede igualarla o superarla.
- Determinismo frágil: los replays solo son deterministas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otro redondeo de CPU puede romper una coincidencia del lookup y un Mac puede dar números distintos.
- No apto para robot físico: las acciones registradas están muy fuera de lo que se pediría a servomotores reales; el autor prohíbe explícitamente cargarlo en un MicroDuck físico.
- Licencia ambigua: el repositorio no se etiqueta como Apache-2.0 en conjunto; varias fuentes (v1 a v5 propias, v3 y v4 de lphatnguyen) no declaran licencia y las partes sin licencia no se relicencian aquí.
- Riesgo de retirada: el autor no consultó a jrubiosainz, HlibPlakhtii, lphatnguyen ni a1rb4Ck antes de publicar; si alguno se opone, el repositorio se retirará.
- Sin datos de sesgo, alucinación o idioma aplicables: al no ser un modelo lingüístico, estas categorías no proceden, pero tampoco hay evaluación de robustez fuera del simulador.
- Asistencia de IA: el autor indica que un asistente de IA ayudó en algunos experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v7
- Versión anterior v6: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v6
- Versión anterior v5: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v5
- Modelo base WR1N de jrubiosainz: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c
- Red de respaldo v3 de lphatnguyen: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- v4 de lphatnguyen: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- quicksilver-v2 de HlibPlakhtii: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v2
- Microduck Arena (Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
