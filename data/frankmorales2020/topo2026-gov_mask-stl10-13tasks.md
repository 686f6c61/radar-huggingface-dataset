# frankmorales2020/TOPO2026-gov_mask-STL10-13tasks

## Resumen

TOPO2026-gov_mask-STL10-13tasks es un adaptador de aprendizaje continuo (continual learning) publicado por el usuario frankmorales2020 en Hugging Face. No es un modelo de lenguaje generativo, sino un clasificador ligero que se monta sobre las caracteristicas congeladas de un modelo de vision (`frankmorales2020/gemma-4-e4b-unesco-optimized`, con estado oculto de 24 dimensiones y pooling medio enmascarado). El adaptador resuelve el problema del olvido catastrofico en escenarios de aprendizaje incremental de tareas: se entrena secuencialmente sobre 13 tareas binarias derivadas del dataset STL-10 y garantiza, por construccion, que cada tarea se ejecuta con exactamente las unidades que se entrenaron para ella.

La relevancia del modelo es metodologica: propone una tecnica de enmascaramiento por contribucion (gov_mask, "government mask") que reserva subconjuntos de unidades del adaptador para cada tarea, las congela tras el entrenamiento y las selecciona mediante el identificador de tarea. El resultado es un olvido de 0,00 % medido en test sobre 5 semillas, con una precision balanceada media del 98,36 % ± 0,09.

El alcance es estrictamente task-incremental: el identificador de tarea debe proporcionarse en inferencia. El ancho total del adaptador es de 128 unidades. El modelo se publica con licencia Apache 2.0 y el repositorio ocupa 0,0 GB, lo que refleja que solo se distribuyen los pesos del adaptador, no el modelo base de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre caracteristicas congeladas de un modelo de vision; pooling medio enmascarado; estado oculto de 24 dimensiones |
| Parametros totales | no disponible (ancho de 128 unidades en el adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de vision por tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,0 GB; se carga con `GovMaskSTL.from_dir`) |

## Arquitectura y entrenamiento

El modelo es un adaptador de clasificacion que opera sobre caracteristicas de imagen preextraidas de un modelo base congelado (`gemma-4-e4b-unesco-optimized`). Las caracteristicas se obtienen con un prompt fijo ("Describe this image.") y un pooling medio enmascarado que produce vectores de 2560 dimensiones. Sobre esas caracteristicas, el adaptador aprende 13 tareas binarias de STL-10 en secuencia.

Cada tarea posee las unidades del adaptador con las que fue entrenada; el numero de unidades se estima en validacion mediante un procedimiento de grow-and-verify y se selecciona por utilidad de contribucion (CBP). Una vez entrenada, la tarea congela sus unidades, de modo que el olvido es cero por construccion. El identificador de tarea selecciona el subconjunto de unidades correspondiente. El modelo publicado corresponde a la semilla 124, elegida por precision de validacion, y fue reentrenado en una NVIDIA L4 con el codigo, la semilla, las tasas de aprendizaje y el ancho registrados en la ejecucion original. La diferencia maxima por tarea respecto a la tabla de 5 semillas es de 0,563 puntos, atribuida a no determinismo de coma flotante en GPU.

## Capacidades

- Clasificacion binaria de imagenes en 13 tareas derivadas de STL-10 (animal vs vehiculo, volador vs no volador, mamifero vs no mamifero, etc.).
- Inferencia a partir de imagenes directas (requiere acceso al modelo de caracteristicas y una GPU) mediante `predict_images`.
- Inferencia a partir de caracteristicas precalculadas de dimension 2560 mediante `predict_features`.
- Aprendizaje continuo task-incremental con olvido cero por construccion.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, agentes ni capacidades multilingues.
- No dispone de modo de pensamiento (thinking), audio ni otras capacidades especiales.

## Casos de uso

- Investigacion en aprendizaje continuo: sirve como referencia reproducible para comparar tecnicas de retencion (gov_mask, packnet, clnp, replay, EWC, SI) sobre un benchmark controlado de 13 tareas.
- Evaluacion de olvido catastrofico: permite medir FGT y plasticidad con protocolo de 5 semillas y semillas fijas, util para validar nuevas propuestas de enmascaramiento.
- Clasificacion de imagenes STL-10 en pipelines academicos: al trabajar sobre caracteristicas precalculadas, permite clasificar lotes de imagenes sin reentrenar el modelo base.
- Prototipado de sistemas task-incremental: el identificador de tarea explicito facilita integrar el adaptador en flujos donde la tarea se conoce de antemano (por ejemplo, enrutado por metadatos).
- Docencia y experimentacion: el repositorio ligero (0,0 GB) y la API `GovMaskSTL` permiten reproducir el experimento en una GPU consumer o en la nube con bajo coste.
- Analisis de robustez entre GPUs: la diferencia de 0,563 puntos entre ejecuciones documenta el impacto del no determinismo de coma flotante, util para estudios de reproducibilidad.

## Benchmarks y rendimiento

Resultados en test (precision balanceada, %) del modelo publicado (semilla 124) por tarea:

| Tarea | Nombre | Precision balanceada % |
|---|---|---|
| A | Animal vs Vehicle | 99,83 |
| B | Flying vs Non-Flying | 98,49 |
| C | Mammal vs Non-Mammal | 99,44 |
| D | Land vs Air/Water Vehicle | 98,91 |
| E | Carnivore vs Herbivore | 98,28 |
| F | Hoofed vs Non-Hoofed Mammal | 98,17 |
| G | Primate vs Other Mammal | 97,92 |
| H | Ship vs Other Vehicle | 99,08 |
| I | Cat vs Dog | 95,12 |
| J | Car vs Truck | 97,50 |
| K | Deer vs Horse | 97,75 |
| L | Airplane vs Bird | 99,94 |
| M | Quadruped Mammal vs Bird | 98,67 |

Comparativa de 5 semillas (123-127), test, precision balanceada %:

| Metodo | Semillas | ACC | PLAST | FGT |
|---|---|---|---|---|
| gov_mask@auto | 5 | 98,36 ± 0,09 | 98,36 | 0,00 |
| packnet | 5 | 98,30 ± 0,14 | 98,30 | 0,00 |
| clnp | 5 | 98,12 ± 0,17 | 98,12 | 0,00 |
| replay | 5 | 96,59 ± 0,27 | 97,89 | 1,49 |
| bp@512 | 5 | 86,48 ± 1,64 | 97,89 | 12,48 |
| ewc@512 | 5 | 94,12 ± 0,55 | 97,74 | 4,09 |
| si@512 | 5 | 92,37 ± 1,75 | 97,65 | 5,97 |
| gov_utility@512 | 5 | 96,88 ± 0,58 | 97,28 | 0,80 |
| gov_mask@512 | 5 | 98,16 ± 0,15 | 98,16 | 0,00 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador es muy pequeno (ancho de 128 unidades) y el repositorio ocupa 0,0 GB, por lo que la carga del adaptador es minima.
- La inferencia desde imagenes requiere acceso al modelo de caracteristicas (`gemma-4-e4b-unesco-optimized`) y una GPU; el autor menciona NVIDIA L4 para el reentrenamiento.
- La inferencia desde caracteristicas precalculadas (`predict_features`) no requiere GPU ni el modelo base.
- GPU recomendadas: NVIDIA L4 (usada en el reentrenamiento); otras GPUs no especificadas.
- Opciones de despliegue: carga via `huggingface_hub.snapshot_download` y la clase `GovMaskSTL` del repositorio; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de adaptador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Tareas | ACC (5 semillas) | FGT | Licencia |
|---|---|---|---|---|---|
| gov_mask@auto (este) | Enmascaramiento por contribucion, ancho automatico | 13 | 98,36 ± 0,09 | 0,00 | Apache 2.0 |
| packnet | Poda y reentrenamiento por tarea | 13 | 98,30 ± 0,14 | 0,00 | no disponible |
| clnp | Aprendizaje continuo sin olvido | 13 | 98,12 ± 0,17 | 0,00 | no disponible |
| replay | Repeticion de datos | 13 | 96,59 ± 0,27 | 1,49 | no disponible |
| ewc@512 | Regularizacion elastica | 13 | 94,12 ± 0,55 | 4,09 | no disponible |

## Limitaciones y advertencias

- Alcance estrictamente task-incremental: el identificador de tarea es obligatorio en inferencia; no funciona en escenarios class-incremental ni domain-incremental sin modificacion.
- Solo clasifica las 13 tareas binarias definidas sobre STL-10; no generaliza a otras imagenes ni categorias fuera de ese conjunto.
- Depende del modelo base de caracteristicas; si este no esta disponible o cambia, la inferencia desde imagenes no es posible.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- El olvido cero es por construccion (unidades congeladas por tarea), no por una capacidad general de retencion; no debe interpretarse como robustez ante tareas no vistas.
- No se documentan sesgos especificos, pero al derivar de STL-10 hereda los sesgos de ese dataset (clases de animales y vehiculos, imagenes de baja resolucion).
- Riesgo de alucinacion no aplicable (clasificador); el riesgo principal es la confusion entre clases similares (por ejemplo, cat vs dog con 95,12 %).
- Diferencias de hasta 0,563 puntos entre ejecuciones por no determinismo de coma flotante en GPU; los resultados no son bit a bit reproducibles entre GPUs o versiones de librerias.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base de caracteristicas puede tener su propia licencia que debe verificarse por separado.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/TOPO2026-gov_mask-STL10-13tasks
- Modelo base de caracteristicas: https://huggingface.co/frankmorales2020/gemma-4-e4b-unesco-optimized
- Dataset STL-10: no disponible en la informacion proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
