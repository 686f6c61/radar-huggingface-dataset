# HlibPlakhtii/microduck-sock-heist-quicksilver-v1

## Resumen

Microduck Sock Heist Quicksilver v1 es una política de control robótico derivada por ajuste fino de `rumezhak/microduck-sock-heist-second-green-v2`, publicada por HlibPlakhtii. No es un modelo de lenguaje: se trata de una política neuronal que mapea observaciones de simulación (61 entradas) a comandos motores (14 salidas) a 50 Hz, empaquetada en formato ONNX y ejecutable con la librería `microduck`. Su propósito es competir en una tarea de simulación tipo "sock heist" dentro de la Arena asociada al ecosistema Microduck, vinculado a Pollen Robotics.

El autor no ha entrenado la red neuronal heredada; su aportación es una búsqueda local acotada sobre las acciones de un único arranque oficial (seed 1) y la inserción de una tabla de búsqueda exacta de observaciones delante del grafo original. El resultado es una mejora marginal pero verificable del tiempo de finalización en esa semilla: de 4,890 s a 4,885 s. La puntuación agregada del evaluador completo pasa de 5,052 s a 5,051 s con cinco finalizaciones.

La relevancia es muy acotada: sirve como ejemplo de ingeniería de optimización sobre políticas de simulación existentes, con trazabilidad de procedencia y verificación de normalización, pero no constituye un avance en aprendizaje por refuerzo ni en robótica generalizable. El propio autor declara explícitamente que no se trata de una afirmación de generalización a semillas no vistas ni a robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal preentrenada heredada (grafo ONNX) con capa de búsqueda exacta de observaciones antepuesta; arquitectura interna del grafo no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de comparación de 48 observaciones consecutivas con tolerancia 1e-7 |
| Tipos de cuantizacion | no disponible; pesos exportados en ONNX |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible; el autor declara que la fuente no especifica licencia y no reclama ninguna sobre los pesos heredados |
| Formato de pesos | ONNX |
| Interfaz de entrada/salida | 61 entradas / 14 salidas a 50 Hz |
| Modelo base | rumezhak/microduck-sock-heist-second-green-v2 (relación: finetune) |
| Librería | microduck |
| Entorno de evaluación | MuJoCo 3.10.0, ONNX Runtime 1.24.4, evaluador revisión f6072612b0e40ac613272f88818575b997e820b0, runner 5 |

## Arquitectura y entrenamiento

La política hereda el grafo neuronal del modelo base, que el autor no ha reentrenado ni modificado. Sobre ese grafo se añade una capa de búsqueda exacta: para cada paso de inferencia se comparan las primeras 48 observaciones con las de la trayectoria verificada localmente para la seed 1, con tolerancia 1e-7. Si coinciden, se devuelven las acciones registradas de esa trayectoria; si no coinciden, se delega en el grafo base sin alteración. La interfaz de 61 entradas, 14 salidas y 50 Hz se mantiene idéntica.

El proceso de ajuste consistió en una búsqueda local acotada que modifica únicamente el final de la seed oficial 1. Antes de buscar, se redujeron objetivos saturados redundantes verificando que las fuerzas motoras, la traza completa de carrera y el asentamiento permanecían idénticos. La modificación concreta es un incremento de +0,1 rad en el objetivo de pitch de cadera izquierda (acción 2) desde la llamada de acción 260 (índice cero) hasta el final. Se realizaron 168 ensayos de búsqueda. La estrategia conserva del modelo base el primer impulso, el frenado durante el turno del gigante, la parada vigilada y el segundo impulso. No se modificaron árbitro, física, horario de luces ni puntuación remota.

## Capacidades

- Control motor en simulación: genera 14 comandos de acción a partir de 61 observaciones, a 50 Hz, para la tarea de "sock heist" en la Arena Microduck.
- Reproducción determinista de la trayectoria de la seed 1 mediante la tabla de búsqueda antepuesta.
- Ejecución del comportamiento heredado del modelo base en el resto de seeds oficiales y en observaciones no coincidentes.
- Conservación de la estrategia del base: primer impulso, frenado en el turno del gigante, parada vigilada y segundo impulso.
- Exportación e inferencia vía ONNX Runtime, con compatibilidad declarada con MuJoCo 3.10.0.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Evaluación de políticas en la Arena Microduck: sirve para comparar el tiempo agregado del evaluador oficial (5,051 s frente a 5,052 s del base) en las cinco seeds declaradas, con trazabilidad de la revisión del evaluador y del runner utilizados.
- Reproducción de experimentos de optimización local: el repositorio incluye las 168 pruebas de búsqueda, las acciones de partida y las acciones buscadas, lo que permite auditar el proceso y reejecutarlo con las versiones exactas de dependencias.
- Estudio de técnicas de table lookup sobre políticas neuronales: la capa de comparación de 48 observaciones con tolerancia 1e-7 es un ejemplo concreto de cómo acelerar o fijar trayectorias sin reentrenar el grafo subyacente.
- Verificación de normalización y de equivalencia de fuerzas motoras: el autor documenta la reducción de objetivos saturados redundantes comprobando que la traza y el asentamiento no cambian, lo que sirve como plantilla de validación.
- Docencia sobre procedencia de modelos: el repositorio incluye la model card del base y la fuente fijada por commit, útil para ilustrar buenas prácticas de atribución cuando la licencia original es ambigua.
- Pruebas de integración de ONNX Runtime en pipelines de simulación robótica: la política se puede cargar con ONNX Runtime 1.24.4 y ejecutar contra MuJoCo 3.10.0 para validar versiones y latencias del stack.
- No es adecuado para despliegue en robots reales, para tareas distintas del "sock heist" ni para escenarios fuera de las cinco seeds oficiales declaradas.

## Benchmarks y rendimiento

| Metrica | Base (second-green-v2) | Quicksilver v1 |
|---|---|---|
| Tiempo agregado del evaluador (5 finalizaciones, 0,20 m/s) | 5,052 s | 5,051 s |
| Seed 1 | 4,890 s | 4,885 s |
| Seed 2 | no disponible | 5,390 s |
| Seed 3 | no disponible | 4,935 s |
| Seed 4 | no disponible | 5,000 s |
| Seed 5 | no disponible | 5,045 s |
| Finalizaciones | 5 | 5 |

El resultado del servidor público se declara autoritativo. Las cifras locales se obtuvieron con el evaluador sin modificar, revisión f6072612b0e40ac613272f88818575b997e820b0, runner 5, MuJoCo 3.10.0 y ONNX Runtime 1.24.4. No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de la Arena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB según HuggingFace, lo que sugiere un grafo ONNX muy pequeño, pero no se especifica el número de parámetros.
- GPU recomendadas: no disponible; al ser una política de 61 entradas y 14 salidas a 50 Hz, es plausible su ejecución en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos publicados sobre requisitos mínimos.
- Opciones de despliegue: ONNX Runtime 1.24.4 junto con MuJoCo 3.10.0, según las versiones fijadas por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la única referencia temporal es la frecuencia de control de 50 Hz de la interfaz.
- Para reproducir: usar la fuente de la Arena fijada por commit con las versiones exactas de dependencias y ejecutar `probe_sock_finish.py` contra el base fijado con `--seed 1 --speed .2` y `--actions normalized-starting-actions.npz` en un directorio de salida nuevo.

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Contexto/ventana | Rendimiento Arena | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HlibPlakhtii/microduck-sock-heist-quicksilver-v1 | Política robótica ONNX con lookup | 61 entradas / 14 salidas a 50 Hz | 48 observaciones comparadas | 5,051 s agregado; seed 1 en 4,885 s | no disponible | HuggingFace, 0 descargas |
| rumezhak/microduck-sock-heist-second-green-v2 | Política robótica ONNX (base) | 61 entradas / 14 salidas a 50 Hz | no aplica | 5,052 s agregado; seed 1 en 4,890 s | no disponible | HuggingFace |
| Otras políticas Microduck de la Arena | Políticas robóticas | variable | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría fuera del ecosistema Microduck.

## Limitaciones y advertencias

- La mejora es marginal: 5 ms en la seed 1 y 1 ms en el agregado de cinco seeds, dentro de lo que el propio autor describe como optimización de los cinco arranques declarados.
- No hay afirmación de generalización a semillas no vistas ni a robots reales; el autor lo declara explícitamente.
- La capa de búsqueda solo se activa cuando las primeras 48 observaciones coinciden con la trayectoria verificada con tolerancia 1e-7; en cualquier otra condición se ejecuta el grafo base sin cambios.
- La licencia del modelo base no está declarada y el autor no reclama ninguna sobre los pesos heredados, lo que deja la situación legal del uso comercial sin resolver.
- El modelo no ha sido entrenado por el autor; la procedencia y los créditos corresponden a rumezhak, Pollen Robotics y contribuidores upstream.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje ni datos textuales.
- La reproducibilidad depende de versiones exactas de dependencias (MuJoCo 3.10.0, ONNX Runtime 1.24.4) y de la revisión fijada del evaluador; cambios en estos elementos pueden invalidar los resultados.
- El resultado autoritativo es el del servidor público de la Arena; las cifras locales son verificaciones auxiliares.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de validación independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-quicksilver-v1
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Revisión fijada del base citada en la model card: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2/tree/73589ead9485546120bd47f635f15b4cff6fafdb
- Pollen Robotics: no disponible (enlace no incluido en la información proporcionada)
- Arena Microduck y fuente fijada del evaluador: no disponible (no se incluye URL en la información proporcionada)
- Paper, blog o demo adicionales: no disponibles
