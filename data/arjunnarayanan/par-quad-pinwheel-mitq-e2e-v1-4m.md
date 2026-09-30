# arjunnarayanan/par-quad-pinwheel-mitq-e2e-v1-4M

## Resumen

par-quad: pinwheel-mitq-e2e-v1-4M es un agente de aprendizaje por refuerzo que construye descomposiciones en bloques cuadriláteros de dominios bidimensionales a partir únicamente de la frontera del dominio. Lo desarrollan Arjun Narayanan y Per-Olof Persson (UC Berkeley) y se publica junto al artículo "Playing to Par: Reinforcement Learning for Provably Optimal Quadrilateral Block Decompositions". No es un modelo de lenguaje: es una política PPO entrenada con Stable-Baselines3 cuyo objetivo es alcanzar el *par* de irregularidad de vértices, el límite inferior que la identidad discreta de Gauss-Bonnet fija a partir de los ángulos de esquina y la topología del dominio mediante `I(M) >= par(Ω) = |c(Ω) + 4χ|`. Una malla que alcanza el par es demostrablemente óptima en su conectividad.

La red tiene 365 000 parámetros y opera sobre la estructura de medio-borde (doubly connected edge list) del dominio: una convolución que sigue los punteros `next`, `previous` y `twin` de cada medio-borde, con 4 capas de 96 características sobre 10 características de entrada por medio-borde. Gracias a que trabaja por medio-borde con *pooling*, la política se aplica sin cambios a dominios más grandes que cualquiera visto en entrenamiento, y de hecho los resultados publicados incluyen dominios con el doble de esquinas que los de entrenamiento sin reentrenar.

El entrenamiento combina *behaviour cloning* sobre instancias certificadas (mallas óptimas recorridas hacia atrás para generar demostraciones) seguido de 4 004 096 pasos de PPO, un procedimiento que el repositorio del proyecto cifra en unas cuatro horas en un portátil. La relevancia práctica está en el salto de calidad frente a los algoritmos clásicos de mallado de Gmsh: en el conjunto de evaluación de 96 dominios con 8-24 esquinas, el agente alcanza el par en 90,2 dominios de media frente a 2 del mejor método de Gmsh.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política PPO con extractor de características tipo convolución sobre malla de medio-borde (half-edge / DCEL), 4 capas de 96 características, agregación por pooling |
| Parametros totales | 365 000 (red neuronal de la política) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el estado es la malla completa del dominio) |
| Tipos de cuantizacion | No disponible (checkpoint en punto flotante estándar de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Checkpoint `.zip` de Stable-Baselines3 (incluye estado del optimizador; contiene objetos serializados con pickle) más un fichero de configuración `.config.yml` |
| Algoritmo de entrenamiento | Behaviour cloning sobre instancias certificadas + 4 004 096 pasos de PPO |
| Espacio de acciones | Inserción de cuerdas (chords) y vértices sobre la malla, con máscara de acciones inválidas |
| Framework | Stable-Baselines3 2.6.0, PyTorch 2.7.1, Gymnasium 1.1.1 |
| Entorno requerido | Repositorio `par-quad`, Python 3.11 o 3.12, `GEOGEN_PATH=tools/geo2d_lite` |
| Tamano del repositorio en HuggingFace | 0,0 GB (segun la ficha del repositorio) |
| Descargas / likes | 6 descargas, 0 likes |
| Fecha de publicacion | 30 de septiembre de 2026 |

## Arquitectura y entrenamiento

La política es una red convolucional definida sobre la malla de medio-borde del dominio de entrada. Cada medio-borde dispone de 10 características de entrada y la red aplica 4 capas convolucionales de 96 características siguiendo la topología local del DCEL (los punteros `next`, `previous` y `twin`). Al ser una operación por elemento con agregación posterior mediante pooling, la misma red entrenada se evalúa sobre mallas de cardinalidad arbitraria sin modificar pesos ni reentrenar. El total de parámetros es de 365 000. Las acciones consisten en insertar cuerdas y vértices en la malla, con enmascaramiento de las acciones inválidas para garantizar la validez estructural del estado resultante.

El entrenamiento sigue un esquema en dos fases. Primero se aplica *behaviour cloning* sobre instancias certificadas: se parte de mallas óptimas (las que alcanzan el par) y se reconstruyen las demostraciones recorriendo el proceso de mallado hacia atrás, de modo que el agente aprende el camino inverso. Después se ejecutan 4 004 096 pasos de PPO con Stable-Baselines3 2.6.0 y PyTorch 2.7.1. El objetivo de recompensa está alineado con la cota de par derivada de la identidad discreta de Gauss-Bonnet. No se documenta en la información disponible ningún uso de RLHF, DPO ni decodificación especulativa, ya que no se trata de un modelo generativo de lenguaje. El artículo también describe una búsqueda de reparación en tiempo de test para fronteras curvas.

## Capacidades

- Construcción de descomposiciones en bloques cuadriláteros de dominios 2D a partir exclusivamente de la frontera del dominio.
- Detección y explotación de la cota de par derivada de la topología y los ángulos de esquina, con capacidad de alcanzar el óptimo demostrable de conectividad.
- Generalización a dominios de mayor cardinalidad que los de entrenamiento: funciona en dominios de 25-50 esquinas sin reentrenar, el doble del tamaño máximo visto en entrenamiento.
- Manejo de dominios con agujeros (hasta dos agujeros en el conjunto de entrenamiento).
- Robusteza ante fronteras curvas mediante la búsqueda de reparación en tiempo de test descrita en el artículo (alcanza el par en 37 de 96 dominios curvos no vistos en entrenamiento).
- Inserción secuencial y estructuralmente válida de cuerdas y vértices, con enmascaramiento de acciones inválidas.
- Reanudación del entrenamiento: el checkpoint incluye el estado del optimizador, de modo que es posible continuar el entrenamiento desde el punto publicado.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión ni audio.

## Casos de uso

- Mallado cuadrilátero para análisis por elementos finitos (FEM) en piezas mecánicas: el agente genera una descomposición en bloques cuadriláteros sobre la frontera de una pieza 2D y alcanza el par en la gran mayoría de los dominios, lo que se traduce en mallas de conectividad demostrablemente óptima listas para su triangulación estructurada posterior.
- Pretratamiento en pipelines de CAE: puede invocarse como paso previo a un mallador estructurado o a Gmsh, sustituyendo las heurísticas de descomposición en bloque (`blossom`, `frontal-quad`, `quasi-structured`) que en la evaluación del artículo obtienen entre 0 y 2 dominios en el par sobre 96 dominios, frente a los 90,2 del agente.
- Generación de mallas de calidad para simulación con fronteras curvas: mediante la búsqueda de reparación en tiempo de test descrita en el artículo, el agente maneja dominios con fronteras curvas que no aparecían en el entrenamiento, lo que resulta útil en geometrías de ingeniería reales con radios y arcos.
- Generación de conjuntos de datos de mallas óptimas certificadas: el agente puede emplearse para producir mallas que alcanzan el par sobre dominios generados sintéticamente, sirviendo como fuente de datos etiquetados para entrenar o evaluar otros métodos de descomposición.
- Investigación en aprendizaje por refuerzo sobre estructuras de datos topológicas: el modelo es un ejemplo reproducible de política PPO con extractor convolucional sobre un DCEL, con un coste de entrenamiento de unas cuatro horas en un portátil, lo que lo hace utilizable como *baseline* en experimentos de RL con grafos y mallas.
- Docencia y divulgación sobre mallado y descomposición en bloques: el repositorio incluye utilidades para animar un *rollout* completo (`utilities/animate_rollout.py`) y producir vídeo y GIF del proceso de mallado paso a paso, lo que permite ilustrar cómo se construye una descomposición óptima en el aula.
- Reparación de mallas defectuosas en dominios de tamaño moderado: dado que la política opera sobre la malla completa y enmascara acciones inválidas, puede aplicarse de forma iterativa sobre configuraciones parciales para completar o corregir descomposiciones existentes.
- Automatización de la cadena de preprocesado en estudios paramétricos: al no requerir GPU y ejecutarse sobre CPU, permite generar mallas de forma masiva para barridos de parámetros geométricos en los que el cuello de botella no es la simulación sino la preparación de la geometría.

## Benchmarks y rendimiento

Los resultados publicados no son benchmarks de lenguaje (MMLU, HumanEval, GSM8K, etc.), sino métricas de mallado bajo el procedimiento de evaluación del artículo: cinco intentos por dominio con el doble de presupuesto de movimientos y reparación por división y continuación, promediado sobre semillas de evaluación. *Excess* es la mediana de vértices irregulares por encima del par; *at par* cuenta los dominios mallados de forma demostrablemente óptima.

Conjunto de 96 dominios, 8-24 esquinas:

| Metodo | all-quad | usable | excess | at par |
|---|---|---|---|---|
| Gmsh blossom | 51 | 38 | 9 | 0 |
| Gmsh frontal-quad | 43 | 29 | 8 | 1 |
| Gmsh quasi-structured | 96 | 96 | 7,5 | 2 |
| Gmsh blossom-full | 96 | 96 | 26 | 0 |
| Este modelo | 96,0 | 95,7 | 0 | 90,2 |

Conjunto de 64 dominios, 25-50 esquinas (el doble del tamaño de entrenamiento, sin reentrenar):

| Metodo | all-quad | usable | excess | at par |
|---|---|---|---|---|
| Gmsh blossom | 26 | 18 | 39 | 0 |
| Gmsh frontal-quad | 15 | 14 | 34 | 0 |
| Gmsh quasi-structured | 64 | 60 | 22 | 0 |
| Gmsh blossom-full | 64 | 64 | 156 | 0 |
| Este modelo | 64,0 | 62,0 | 0,75 | 31,0 |

Los métodos `blossom` y `frontal-quad` de Gmsh se ejecutan con el mismo número de elementos que el agente; `quasi-structured` y `blossom-full` se ejecutan en sus tamaños naturales, entre 3 y 15 veces el del agente. El artículo incluye además resultados con frontera curva (par alcanzado en 37 de 96 dominios curvos no vistos en entrenamiento) y las tablas completas.

## Requisitos de hardware

- La red tiene 365 000 parámetros, por lo que la inferencia es de coste despreciable en cualquier hardware actual.
- El checkpoint es un `.zip` de Stable-Baselines3 de tamaño reducido; el repositorio de Hugging Face declara 0,0 GB de tamaño total.
- Inferencia en CPU: el propio autor documenta una instalación con `torch==2.7.1` en variante CPU (`--index-url https://download.pytorch.org/whl/cpu`) para máquinas sin GPU, de modo que el agente funciona sin acelerador.
- El procedimiento de entrenamiento completo (behaviour cloning más cuatro millones de pasos de PPO) se cifra en aproximadamente cuatro horas en un portátil según el repositorio del proyecto.
- GPU: no se especifica ninguna GPU recomendada en la información disponible; dado el tamaño de la red, cualquier GPU consumer (por ejemplo, una gama RTX) sería más que suficiente, pero este dato no está confirmado en la documentación.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El despliegue se realiza cargando el checkpoint con `from src.geo2d_bridge import load_model` desde un clon del repositorio `par-quad`.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen fundamentalmente del coste de la búsqueda y del tamaño de la malla, no de la red.

## Comparativa con modelos similares

No se conoce en la información disponible ningún otro agente aprendido para descomposición en bloques cuadriláteros con el que comparar directamente. La referencia natural son los algoritmos clásicos de Gmsh, que resuelven la misma tarea sin aprendizaje:

| Alternativa | Tipo | Parametros | Contexto | Rendimiento (96 dominios, 8-24 esquinas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | Política PPO con convolución sobre half-edge | 365 000 | Malla completa del dominio | at par: 90,2; excess: 0 | MIT | Pesos en Hugging Face y código en GitHub |
| Gmsh blossom | Heurística geométrica | No aplica | No aplica | at par: 0; excess: 9 | GPL (Gmsh) | Distribución estándar de Gmsh |
| Gmsh frontal-quad | Heurística geométrica | No aplica | No aplica | at par: 1; excess: 8 | GPL (Gmsh) | Distribución estándar de Gmsh |
| Gmsh quasi-structured | Heurística geométrica | No aplica | No aplica | at par: 2; excess: 7,5 | GPL (Gmsh) | Distribución estándar de Gmsh |

La comparación en parámetros y contexto no es significativa entre estos métodos, ya que los algoritmos de Gmsh no son modelos neuronales. El eje relevante es la tasa de dominios mallados en el par (90,2 frente a un máximo de 2) y el exceso mediano de vértices irregulares (0 frente a 7,5-9).

## Limitaciones y advertencias

- Alcance geométrico limitado: el agente solo malla dominios 2D. Se entrenó con dominios de lados rectos de hasta 24 esquinas y hasta dos agujeros.
- Fronteras curvas: requieren la búsqueda de reparación en tiempo de test descrita en el artículo; sin ella, el comportamiento en fronteras curvas no está garantizado.
- Reproducibilidad de las tablas: los dominios de evaluación provienen de **geo2d**, que no se ha publicado. El repositorio incluye un generador sustituto (`tools/geo2d_lite`) que ejecuta todo el procedimiento, pero genera dominios distintos a los del artículo, por lo que no reproduce las tablas publicadas.
- Rendimiento en dominios grandes fuera de distribución: en el conjunto de 25-50 esquinas el exceso mediano sube a 0,75 y solo 31 de 64 dominios alcanzan el par, frente a 90,2 de 96 en el rango de entrenamiento. El deterioro es real aunque siga siendo muy superior a Gmsh.
- Riesgo de seguridad al cargar el checkpoint: el fichero es un `.zip` de Stable-Baselines3 que contiene objetos serializados con pickle. Debe cargarse únicamente desde una fuente de confianza, ya que la deserialización de pickle puede ejecutar código arbitrario.
- Dependencia de un repositorio externo: la política y el extractor de características son clases definidas en el repositorio `par-quad`, no en el propio repositorio de Hugging Face. Sin ese clon y sin la configuración `.config.yml`, el checkpoint no es cargable.
- Requisitos de entorno estrictos: Python 3.11 o 3.12, Stable-Baselines3 2.6.0, PyTorch 2.7.1, Gymnasium 1.1.1 y la variable `GEOGEN_PATH` apuntando a `tools/geo2d_lite`.
- Sesgos conocidos: no se documentan sesgos en el sentido de sesgos sociales o de datos, al no tratarse de un modelo de lenguaje. La limitación equivalente es el sesgo hacia la distribución de dominios de entrenamiento (lados rectos, hasta 24 esquinas, hasta dos agujeros).
- Uso comercial: la licencia MIT del modelo permite uso comercial, pero conviene verificar las licencias de las dependencias (Stable-Baselines3, PyTorch) y, en particular, de Gmsh (GPL) si se utiliza para las comparaciones o como componente del pipeline.
- Madurez y adopción: 6 descargas y 0 likes en Hugging Face en la fecha de publicación, sin evidencias de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arjunnarayanan/par-quad-pinwheel-mitq-e2e-v1-4M
- Perfil del autor en Hugging Face: https://huggingface.co/arjunnarayanan
- Repositorio de código par-quad: https://github.com/ArjunNarayanan/par-quad
- Perfil de GitHub del autor: https://github.com/ArjunNarayanan
- Artículo (arXiv): https://arxiv.org/abs/2609.32146
- Pagina del proyecto: https://arjunnarayanan.github.io/par-quad/
- Demo interactiva "Play Mesh Quest": https://arjunnarayanan.github.io/par-quad/play.html
- Animacion del agente construyendo la descomposicion: https://arjunnarayanan.github.io/par-quad/media/indist.gif
- Citacion BibTeX: `@article{narayanan2026playing, title = {Playing to Par: Reinforcement Learning for Provably Optimal Quadrilateral Block Decompositions}, author = {Narayanan, Arjun and Persson, Per-Olof}, journal = {arXiv preprint arXiv:2609.32146}, year = {2026}}`
