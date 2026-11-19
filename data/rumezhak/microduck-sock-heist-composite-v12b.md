# rumezhak/microduck-sock-heist-composite-v12b

## Resumen

`rumezhak/microduck-sock-heist-composite-v12b` es una entrada de competición para la prueba "6 m Sock Heist" de la Microduck Arena, un espacio de evaluación de políticas de control para el robot cuadrúpedo de bajo coste MicroDuck desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es un artefacto de control compuesto por un grafo ONNX (procedente de la arquitectura de lookup de observaciones de `a1rb4Ck/microduck-heist`), una red neuronal de respaldo (la `sock-heist-6m-v3` de lphatnguyen) y, sobre todo, tablas de búsqueda (`L_obs` y `L_act`) que memorizan trayectorias de locomoción y manipulación grabadas.

El modelo lo publica el usuario rumezhak y deriva de una fusión (`merge`) de dos artefactos previos: su propio `microduck-sock-heist-composite-v12` y el `microduck-sock-heist-nov18-v5` de HlibPlakhtii. La contribución real de esta versión es mínima: respecto a composite v12 solo cambian las tablas de lookup (1318 filas reconstruidas) y la metadata de aviso de modificación; el grafo, la red de respaldo y el resto de tensores son idénticos. El resultado declarado es una media de 4,765 s en las cinco semillas oficiales, frente a 4,770 s de `nov18-v5`, 4,771 s de composite v12 y 4,771 s de `gin-sock-c18`.

Su relevancia es, por tanto, acotada y muy específica: ilustra las dinámicas de optimización extrema (búsqueda CMA-ES sobre las últimas filas de cada trayectoria, ramificación sobre historial de contactos) en competiciones de robótica simulada, y sirve como caso de estudio sobre sobreajuste in-sample, licencias ambiguas en artefactos derivados y reproducibilidad dependiente de la plataforma. No es un modelo utilizable fuera del simulador de la Arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de lookup de observaciones (`L_obs`/`L_act`) con red neuronal de respaldo (procedente de `lphatnguyen/microduck-sock-heist-6m-v3`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible como repositorio completo; Apache-2.0 solo en las partes que la declaran (layout del grafo y mecanismo de lookup de `a1rb4Ck/microduck-heist@94cd2cfe`, y modificaciones propias de los contribuyentes) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El artefacto no se entrena mediante descenso de gradiente convencional. La arquitectura combina un grafo ONNX que implementa un mecanismo de lookup sobre observaciones (heredado del diseño de `a1rb4Ck/microduck-heist`) con una red neuronal de respaldo que se activa cuando la observación no coincide con ninguna fila memorizada. Las tablas `L_obs` y `L_act` contienen 1318 filas que mapean observaciones a acciones; en esta versión todas las filas se han reconstruido respecto a composite v12.

El proceso de construcción descrito por el autor consiste en escanear las entradas públicas mejor clasificadas en x86-64, tomar la mejor secuencia por semilla y refinar las últimas filas de cada semilla mediante un CMA-ES separable. En las semillas que quedan justo por encima de un límite de tick se aplica además una búsqueda sobre ramas de historial de contactos que parten de un "kick" de un ulp y se repulen posteriormente. Cada candidato se reproduce en el runner de la Arena con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados. Las trayectorias de partida provienen de `lphatnguyen/sock-heist-6m-v5` (semillas 1 a 4) y de `HlibPlakhtii/nov17-v3` (semilla 5); la semilla 2 es de HlibPlakhtii sin modificar.

No hay datos de entrenamiento en el sentido habitual (número de tokens, composición del dataset, RLHF/DPO). La "optimización" es una búsqueda evolutiva sobre parámetros de trayectoria evaluada en simulador, no un ajuste de pesos de red.

## Capacidades

- Control locomotor y de manipulación en simulación para la tarea "6 m Sock Heist" del MicroDuck, con finalización en 5 de 5 semillas oficiales.
- Reproducción determinista de trayectorias en x86-64 bajo las versiones fijadas de MuJoCo, onnxruntime y numpy de la Arena.
- Lookup de observación a acción con red de respaldo para observaciones fuera de las filas memorizadas.
- Puntuación idéntica en todos los comandos de la Arena (las claves de lookup no incluyen el comando), evaluada a 0,20 m/s.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo de lenguaje.
- No apto para robot físico: las acciones registradas quedan muy fuera de lo que se pediría a servomotores reales.

## Casos de uso

- Participación en la Microduck Arena: el uso previsto y único documentado; se sube al Space de Pollen Robotics para competir en la prueba de 6 m Sock Heist.
- Estudio de sobreajuste in-sample: sirve como ejemplo didáctico de cómo una política puede ser rápida solo en las cinco semillas oficiales y degradarse a la red de respaldo fuera de ellas.
- Investigación sobre búsqueda evolutiva aplicada a control: el método (CMA-ES separable sobre las últimas filas, ramificación de historial de contactos) es replicable sobre otras tareas de la Arena.
- Análisis de reproducibilidad en simulación: útil para estudiar cómo diferencias de redondeo entre CPUs (x86-64 frente a Mac) rompen la determinación de un lookup.
- Referencia para auditoría de licencias en artefactos derivados: el repositorio documenta explícitamente qué partes llevan Apache-2.0 y cuáles no, lo que lo convierte en un caso práctico de trazabilidad de atribución.
- Benchmarking de infraestructura de simulación: permite medir el impacto de versiones fijadas de MuJoCo/onnxruntime/numpy en los resultados de una política.

## Benchmarks y rendimiento

Resultados declarados por el autor con el scorer propio de la Arena en su máquina x86-64, sobre las cinco semillas oficiales (segundos, menor es mejor):

| Semilla | composite v12 | Hlib nov18-v5 | este archivo (v12b) |
|---|---|---|---|
| 1 | 4,615 | 4,635 | **4,615** |
| 2 | 5,090 | 5,090 | **5,090** |
| 3 | 4,655 | 4,655 | **4,650** |
| 4 | 4,680 | 4,680 | **4,680** |
| 5 | 4,790 | 4,790 | **4,790** |
| Media | 4,771 | 4,770 | **4,765** |

Comparación de medias con otras entradas citadas: `GinDuck/microduck-gin-sock-c18` = 4,771 s. La mejora frente a composite v12 se debe únicamente a la semilla 3 (930 ticks en lugar de 931). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el artefacto es un grafo ONNX con tablas de lookup, por lo que la inferencia es ligera y probablemente cabe en CPU.
- GPU recomendadas: no se documenta ninguna; la Arena evalúa en CPU x86-64.
- Cabe en GPU de consumo: no disponible como dato explícito, pero por tamaño del artefacto no se espera que requiera GPU dedicada.
- Despliegue: runner de la Microduck Arena con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; el autor advierte que una CPU distinta (por ejemplo, un Mac) puede dar números ligeramente diferentes y hacer que el lookup falle.

## Comparativa con modelos similares

| Modelo | Tipo | Media (s) | Semillas finalizadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rumezhak/microduck-sock-heist-composite-v12b` | Lookup ONNX + red de respaldo | 4,765 | 5/5 | no disponible (Apache-2.0 parcial) | Hugging Face |
| `rumezhak/microduck-sock-heist-composite-v12` | Lookup ONNX + red de respaldo | 4,771 | no disponible | no disponible | Hugging Face |
| `HlibPlakhtii/microduck-sock-heist-nov18-v5` | Política para la Arena | 4,770 | no disponible | no disponible | Hugging Face |
| `GinDuck/microduck-gin-sock-c18` | Política para la Arena | 4,771 | no disponible | no disponible | Hugging Face |

Las diferencias entre las cuatro entradas son de milisegundos (6 ms entre la mejor y la peor media), dentro del margen que el propio autor califica de irrelevante y fácilmente superable por quien refine las colas de las trayectorias.

## Limitaciones y advertencias

- Sobreajuste in-sample: fuera de las cinco semillas oficiales el archivo se comporta como la red `lphatnguyen/sock-heist-6m-v3`; solo las cinco trayectorias grabadas son rápidas.
- Dependencia de plataforma: la reproducibilidad solo está garantizada en x86-64 con las versiones fijadas de MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1; otro redondeo de CPU puede romper una reproducción.
- Solo simulación: no debe cargarse en un MicroDuck físico; las acciones registradas están muy fuera de los límites de servomotores reales.
- Licencia ambigua: el repositorio en su conjunto no está etiquetado como Apache-2.0; varias fuentes (`HlibPlakhtii/nov18-v5`, `jrubiosainz/microduck-sock-counter-s1s5`, `lphatnguyen/sock-heist-6m-v5` y entradas propias anteriores) no declaran licencia y sus partes no se relicencian aquí. El uso comercial queda, por tanto, sin base clara.
- Atribución incompleta: el autor no consultó a HlibPlakhtii, jrubiosainz, GinDuck, lphatnguyen ni a1rb4Ck antes de publicar; se compromete a retirar la entrada si alguno objeta.
- Riesgo de alucinación: no aplica (no es un modelo generativo); el riesgo equivalente es que el lookup devuelva una acción memorizada inadecuada ante una observación ligeramente distinta.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no aplican.
- Margen competitivo mínimo: los pocos milisegundos de ventaja pueden igualarse o superarse fácilmente tomando estas filas y puliendo las colas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v12b
- Modelo base (composite v12): https://huggingface.co/rumezhak/microduck-sock-heist-composite-v12
- Modelo base (nov18-v5): https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov18-v5
- Trayectorias de partida (sock-heist-6m-v5): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Red de respaldo (sock-heist-6m-v3): https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Entrada comparable (gin-sock-c18): https://huggingface.co/GinDuck/microduck-gin-sock-c18
- Origen del layout de lookup: https://huggingface.co/a1rb4Ck/microduck-heist
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics: https://huggingface.co/pollen-robotics
