# austindixson/microduck-sprint-improver

## Resumen

`austindixson/microduck-sprint-improver` es una política de control robótico exportada a ONNX y publicada como entrada para la prueba de 2 metros ("2 m Sprint") de la Microduck Arena, el entorno de simulación mantenido por Pollen Robotics en Hugging Face. No es un modelo de lenguaje: recibe un vector de observación de 61 dimensiones (`obs` [1, 61]) y emite 14 acciones (`actions` [1, 14]), que se interpretan como objetivos articulares y comandos de avance del robot bípedo Microduck dentro del simulador.

El modelo es un fine-tune del también publicado `dashi/microduck-sprint-remix-r844` (revisión `c890bc609`). La intervención del autor es muy acotada: la red neuronal permanece congelada y todos los inicializadores y operadores son los del modelo base; lo único que se ha vuelto a buscar es la tabla de objetivos articulares indexada por paso (filas 30-72) y una columna de la tabla de comandos de avance, optimizadas para la semilla 5. El resultado son tiempos de carrera de 0,84, 0,84, 0,84, 0,84 y 0,86 s en las semillas oficiales, con una media de 0,844 s medida con la propia herramienta `arena score` sobre Linux x86-64.

Su relevancia es, por tanto, acotada y experimental: sirve como referencia de hasta dónde llega la optimización de tablas sobre una política congelada en un benchmark de robótica simulated-first, no como componente para un sistema en producción. El autor advierte explícitamente de que el modelo se ha entrenado y evaluado solo en el simulador de la Arena y de que no debe cargarse en un MicroDuck físico. No hay métricas publicadas in-sample/out-of-sample separadas, ni licencia declarada, ni documentación sobre el espacio de observación más allá de su dimensionalidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal de política exportada a ONNX; el detalle de capas y operadores no está documentado en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: política de control paso a paso con observación de 61 dimensiones |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx` sin variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no declarada; el modelo base tampoco declara licencia y este repositorio tampoco |
| Formato de pesos | ONNX (`policy.onnx`) + manifiesto `manifest.json` (schema 2) |
| Entrada | `obs` con forma [1, 61] |
| Salida | `actions` con forma [1, 14] |
| Pipeline declarado | `robotics` |
| Modelo base | `dashi/microduck-sprint-remix-r844`, revisión `c890bc609`, relación `finetune` |
| Hash SHA-256 de `policy.onnx` | `621266ea3d46ac1ea1c9570efc10610054d3212126d95f017c6db3d0cd79478a` |
| Biblioteca declarada | `microduck` |
| Tamaño del repositorio | 0.0 GB según los metadatos de Hugging Face (redondeado) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna de la red (número de capas, tipo de bloques, función de activación ni dimensionalidad de las capas ocultas). Lo que sí se documenta es el mecanismo de intervención: se parte de la política del modelo base `dashi/microduck-sprint-remix-r844` con la red congelada y se vuelve a buscar, para la semilla 5, la tabla de objetivos articulares indexada por paso (concretamente las filas 30-72) y una columna de la tabla de comandos de avance. Todos los demás inicializadores y operadores son los del modelo base, de modo que la diferencia funcional respecto al original reside en esas tablas y no en un reentrenamiento de pesos.

No se especifican datos de entrenamiento: no hay cifras de tokens, episodios, horas de simulación ni composición del dataset. Tampoco se indica si hubo ajuste por refuerzo, imitación o búsqueda evolutiva más allá de la mención explícita a una "búsqueda" (*search*) que puntuó candidatos sobre las mismas semillas oficiales. Esa es la innovación técnica declarada, y también su principal caveat metodológico: la búsqueda y la evaluación comparten semillas, por lo que las cifras publicadas son in-sample. El artefacto final es puramente de inferencia (un grafo ONNX más un manifiesto), sin código de entrenamiento, sin configuración de búsqueda y sin semillas de inicialización publicadas.

## Capacidades

- Control locomotor de un bípedo simulado: genera 14 acciones por paso para completar un sprint de 2 metros en el entorno de la Microduck Arena.
- Política paso a paso indexada: la tabla de objetivos articulares está indexada por número de paso, con una ventana relevante en las filas 30-72.
- Comandos de avance: incluye una tabla de comandos de avance cuya columna correspondiente se ha reoptimizado para la semilla 5.
- Ejecución determinista y ligera: un único grafo ONNX con entrada [1, 61] y salida [1, 14], apto para inferencia en CPU.
- Integración con el evaluador oficial: puntuable directamente con `arena score` de la Microduck Arena.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacities multilingües; no es un modelo generativo de texto.

## Casos de uso

- Baseline para la prueba de 2 m Sprint de la Microduck Arena: sirve como referencia numérica (media de 0,844 s en las semillas oficiales) contra la que comparar nuevas entradas de la competición en el simulador.
- Estudio de optimización de tablas sobre políticas congeladas: permite reproducir y analizar el efecto de reoptimizar únicamente las filas 30-72 de la tabla de objetivos articulares sin tocar los pesos de la red.
- Prueba de regresión del evaluador `arena score`: al tener tiempos y hashes documentados, es útil para verificar que una instalación del evaluador sobre Linux x86-64 reproduce los mismos resultados.
- Docencia e investigación en robótica simulated-first: ejemplo compacto de política ONNX con espacio de observación y acción bien delimitados para prácticas de evaluación en simulación.
- Generación de trayectorias sintéticas en simulación: las 14 acciones por paso pueden registrarse como datos de referencia para experimentos de imitación dentro del propio simulador.
- Análisis de sensibilidad a semillas: al estar ajustado a la semilla 5, permite medir cuánto se degrada el rendimiento al cambiar de semilla, un experimento útil sobre sobreajuste en búsqueda de hiperparámetros.
- Verificación de pipelines de despliegue ONNX: por su tamaño reducido y su contrato de entrada/salida fijo, sirve para validar cadenas de carga de modelos y comprobaciones de hash en infraestructura de inferencia.

## Benchmarks y rendimiento

Los únicos datos publicados son los tiempos de carrera en las semillas oficiales de la Arena, medidos con `arena score` sobre Linux x86-64. Son cifras in-sample: la búsqueda puntuó candidatos sobre esas mismas semillas.

| Semilla | Tiempo (s) |
|---|---|
| 1 | 0,84 |
| 2 | 0,84 |
| 3 | 0,84 |
| 4 | 0,84 |
| 5 | 0,86 |
| Media | 0,844 |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni en ningún otro benchmark de lenguaje, razonamiento o código: no son aplicables a este modelo. Tampoco se publican métricas out-of-sample, desviaciones típicas ni comparación con el modelo base en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB según los metadatos, lo que sitúa el artefacto en la categoría de modelos muy pequeños y compatible con ejecución en CPU.
- GPU recomendadas: no se especifican. Para un grafo ONNX de este tamaño no se requiere GPU; una CPU x86-64 es suficiente para la evaluación en la Arena.
- Cabe en GPU de consumo: previsiblemente sí, en cualquier GPU de consumo e incluso en CPU, aunque no hay cifras oficiales de memoria ni de latencia que lo confirmen.
- Opciones de despliegue: ONNX Runtime como intérprete del grafo y el evaluador de la Microduck Arena (`arena score`) para la métrica de carrera. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia por paso, solo tiempos de carrera extremo a extremo en el simulador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `austindixson/microduck-sprint-improver` | Política ONNX para 2 m Sprint (simulación) | no disponible | no aplica (obs. de 61 dims) | 0,844 s de media en semillas oficiales (in-sample) | no declarada | Hugging Face, 0 descargas, 0 likes |
| `dashi/microduck-sprint-remix-r844` (base) | Política del mismo linaje | no disponible | no aplica | no disponible en la información proporcionada | no declarada | Hugging Face |
| Otras entradas de la Microduck Arena | Políticas de la misma competición | no disponible | no aplica | no disponible | variable, no consultada | Microduck Arena (Space de Pollen Robotics) |

No se dispone de datos verificables de otras políticas comparables (por ejemplo, entradas de la misma prueba de sprint distintas del modelo base) en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente que el modelo se ha entrenado y evaluado únicamente en el simulador de la Arena y que no debe cargarse en un MicroDuck físico.
- Evaluación in-sample: la búsqueda puntuó candidatos sobre las mismas semillas con las que se reportan los resultados, de modo que las cifras de 0,84-0,86 s no constituyen una estimación insesgada de generalización.
- Sobreajuste a la semilla 5: la reoptimización se realizó específicamente para esa semilla; el comportamiento en otras condiciones no está documentado.
- Ausencia de licencia: ni el modelo base ni este repositorio declaran licencia, lo que deja en una situación de incertidumbre legal cualquier uso comercial o redistribución.
- Tarea única y estrecha: resuelve un sprint de 2 metros en un simulador concreto; no es reutilizable como política general de locomoción ni como componente de otro sistema robótico.
- Documentación mínima: no se describe la arquitectura de la red, el significado de las 61 dimensiones de observación, las unidades de las 14 acciones, el proceso de búsqueda ni los datos de entrenamiento.
- Sin código de entrenamiento ni reproducibilidad completa: solo se distribuyen `policy.onnx` y `manifest.json`; no hay scripts que permitan repetir la búsqueda.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones asociadas.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, al no ser un modelo generativo de texto; el riesgo equivalente es el fallo silencioso de la política en estados de observación fuera de distribución.
- Repositorio con tamaño reportado de 0.0 GB: conviene verificar la integridad de los ficheros descargados y comprobar el hash SHA-256 publicado antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/austindixson/microduck-sprint-improver
- Modelo base: https://huggingface.co/dashi/microduck-sprint-remix-r844
- Perfil del autor del modelo base: https://huggingface.co/dashi
- Microduck Arena (Space de evaluación): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
- Perfil de GitHub del autor: https://github.com/austindixson/
- Artículo sobre el robot Microduck (CNX Software): https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Artículo sobre Microduck (PCMag): https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks
- Artículo sobre Microduck (TechCrunch): https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Paper técnico: no disponible en la información proporcionada.
