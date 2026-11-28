# Hansda/DA3-SMALL-GGUF

## Resumen

DA3-SMALL-GGUF es la conversión a formato GGUF del modelo Depth Anything 3 Small (DA3-SMALL) de ByteDance Seed, un estimador de profundidad relativa y pose de cámara basado en un Vision Transformer de tamaño Small. El repositorio, publicado por el usuario Hansda, no contiene pesos nuevos ni reentrenamiento alguno: es una cuantización del checkpoint original de depth-anything/DA3-SMALL, empaquetada para el runtime nativo depth-anything.cpp (proyecto LocalAI), que permite ejecutar inferencia en CPU sin depender de PyTorch.

El modelo resuelve dos tareas conjuntas a partir de una sola imagen: generar un mapa de profundidad relativa (con salida en formato PFM) y estimar la matriz de pose de cámara, esta última opcionalmente mediante una cabeza auxiliar de rayos. Con 26.815.378 parámetros y un tamaño de repo de 0,1 GB, está pensado para escenarios donde el coste computacional y la portabilidad importan más que la precisión máxima: prototipado en portátil, pipelines embebidos o entornos sin GPU.

La relevancia de esta ficha es doble. Por un lado, documenta una de las primeras conversiones GGUF de la familia Depth Anything 3, lo que abre la puerta a despliegues ligeros en C/C++ con ggml. Por otro, conviene subrayar que se trata de un artefacto de cuantización con cero descargas y cero likes en el momento de la consulta, validado únicamente con una imagen de referencia por el propio autor, por lo que su robustez en producción aún no está contrastada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Small) para estimación de profundidad y pose de cámara; cabeza auxiliar de rayos incluida |
| Parametros totales | 26.815.378 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | Q4_K_S (con fallback Q8_0 en anchos seleccionados y tensores F32), Q8_0 |
| Idiomas soportados | no disponible (no aplica; entrada de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos ficheros: DA3-SMALL-Q4_K_S.gguf y DA3-SMALL-Q8_0.gguf) |

## Arquitectura y entrenamiento

El modelo subyacente es DA3-SMALL de ByteDance Seed, un ViT de escala Small (26,8 M de parámetros) que predice profundidad relativa y, de forma conjunta, parámetros de cámara. La conversión GGUF conserva la cabeza auxiliar de rayos en cada fichero, de modo que cada GGUF es autocontenido y permite resolver la pose con la ruta `--ray-pose`. La cuantización Q4_K_S aplica bloques Q4_K a las matrices compatibles, recurre a Q8_0 en anchos que no admiten Q4_K y mantiene en F32 los tensores que requieren precisión completa; la variante Q8_0 usa Q8_0 en las matrices seleccionadas.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, la composición de datos ni si hubo etapas de RLHF o ajuste fino por preferencias: la model card del repositorio de cuantización no los detalla y no se ha proporcionado documentación adicional del checkpoint base. La innovación técnica destacable de esta publicación no está en el entrenamiento, sino en el empaquetado: conversión nativa a ggml/GGUF para el runtime depth-anything.cpp, con manifiesto de hashes SHA-256 y validación de mapas de profundidad finitos y no constantes, así como matrices de cámara finitas, sobre una imagen de referencia en CPU.

## Capacidades

- Estimación de profundidad relativa a partir de una única imagen, con salida en formato PFM.
- Estimación de pose de cámara (matriz de extrínsecos) en formato JSON.
- Resolución de pose mediante cabeza auxiliar de rayos con el flag `--ray-pose`.
- Ejecución en CPU sin PyTorch, gracias al runtime depth-anything.cpp basado en ggml.
- Dos niveles de cuantización para ajustar tamaño y precisión (Q4_K_S y Q8_0).
- Ficheros autocontenidos: cada GGUF incluye la cabeza de rayos, sin dependencias externas de pesos.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo puramente visual de regresión densa.
- Capacidades multilingües: no aplica, la entrada es una imagen y la salida son tensores numéricos.

## Casos de uso

- Reconstrucción 3D en prototipos: usar el mapa de profundidad y la pose estimada para generar nubes de puntos o mallas en herramientas de fotogrametría ligera, aprovechando que el modelo cabe en CPU y no requiere GPU.
- Robótica de bajo coste: integrar la estimación de profundidad en un robot con Raspberry Pi o mini-PC x86 para navegación reactiva o evitación de obstáculos, donde el runtime C++ y los 37-41 MB del GGUF son determinantes.
- Preprocesado en pipelines de visión por computador: generar mapas de profundidad como entrada auxiliar para segmentación, detección o síntesis de vistas en entornos sin acceso a frameworks de deep learning pesados.
- Realidad aumentada en dispositivos embebidos: estimar la geometría de la escena y la pose de cámara para anclar objetos virtuales, con latencia baja al ejecutarse en CPU.
- Edición fotográfica con desenfoque selectivo: producir mapas de profundidad para simular profundidad de campo en postproducción, usando la variante Q8_0 cuando se priorice calidad sobre tamaño.
- Evaluación y benchmarking de runtimes ggml: servir como caso de prueba reproducible para comparar precisión y velocidad entre Q4_K_S y Q8_0 en distintas CPUs, dado que el autor publica hashes y manifiesto.
- Docencia y experimentación: estudiar el comportamiento de un ViT de profundidad cuantizado en un portátil, sin necesidad de GPU ni de descargar checkpoints de varios GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada por el autor consiste en la carga de ambas compilaciones en el runtime CPU fijado (revisión `14f7461d1f704761a038ac9f50dbde8fdb7275e2`) y la comprobación de que devuelven mapas de profundidad finitos y no constantes, así como matrices de cámara finitas, para una imagen de muestra de referencia. No hay métricas de error de profundidad (AbsRel, RMSE), precisión de pose ni comparación numérica con el checkpoint F32 original.

## Requisitos de hardware

- VRAM estimada: no aplica; el runtime depth-anything.cpp está orientado a CPU. En caso de ejecutarse en GPU, el modelo es tan pequeño (26,8 M de parámetros) que cabría holgadamente en cualquier GPU con 1 GB de memoria.
- Tamaño en disco: 37.292.224 bytes para Q4_K_S y 41.424.448 bytes para Q8_0.
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU consumer (RTX 3060 en adelante) podría alojarlo, pero el flujo documentado es CPU.
- Cabe en cualquier consumer GPU y en CPU de escritorio o portátil modernos; también en placas tipo Raspberry Pi, aunque el rendimiento no está documentado.
- Opciones de despliegue: depth-anything.cpp (CLI `da3-cli`), compilado con CMake y el submódulo ggml fijado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se han publicado tiempos de inferencia por imagen ni FPS en ninguna plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| DA3-SMALL-GGUF (este) | 26,8 M | no aplica | Profundidad + pose | Apache-2.0 | GGUF | Hugging Face, runtime depth-anything.cpp |
| depth-anything/DA3-SMALL (base) | 26,8 M | no aplica | Profundidad + pose | Apache-2.0 | safetensors (presumible) | Hugging Face, ecosistema PyTorch |
| Depth Anything V2 Small | no disponible en la informacion proporcionada | no aplica | Profundidad relativa | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| MiDaS Small | no disponible en la informacion proporcionada | no aplica | Profundidad relativa | no disponible en la informacion proporcionada | no disponible | Repositorio Intel ISL |

La comparación cuantitativa con Depth Anything V2 o MiDaS no puede realizarse con rigor porque no se han proporcionado sus especificaciones ni resultados de benchmarks en la información disponible. La diferencia principal frente al checkpoint base es el formato (GGUF frente a safetensors) y el runtime (C++/ggml frente a PyTorch), no la arquitectura ni los pesos.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: la precisión puede degradarse respecto al checkpoint F32 original, especialmente en Q4_K_S, y no se han publicado métricas que cuantifiquen esa pérdida.
- Validación muy limitada: el autor solo confirma resultados finitos y no constantes sobre una imagen de referencia; no hay evaluación sobre datasets estándar ni pruebas de robustez.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.
- Dependencia de una revisión concreta del runtime: el flujo documentado exige depth-anything.cpp en el commit `14f7461d…` con su submódulo ggml fijado; otras revisiones pueden romper la compatibilidad del GGUF.
- Sin soporte de texto, tool calling ni agentes: no debe emplearse en casos de uso conversacionales o de razonamiento simbólico.
- Profundidad relativa, no métrica: la salida no está calibrada en unidades absolutas salvo que se posprocese con la escala adecuada; la pose depende de la cabeza de rayos y su fiabilidad no está cuantificada.
- Sesgos: no documentados. Al ser un modelo visual, puede heredar sesgos del dataset de entrenamiento original de ByteDance Seed, que no se detalla en la información disponible.
- Riesgo de alucinación geométrica: en escenas con poca textura, superficies reflectantes o iluminación adversa, los mapas de profundidad pueden ser inconsistentes; no hay estudios publicados al respecto para esta conversión.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base y del runtime depth-anything.cpp por separado antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hansda/DA3-SMALL-GGUF
- Checkpoint base: https://huggingface.co/depth-anything/DA3-SMALL (revisión fijada `e08cab65ca0ec38e7826075418411ab90cab4da3`)
- Runtime depth-anything.cpp: https://github.com/localai-org/depth-anything.cpp (revisión `14f7461d1f704761a038ac9f50dbde8fdb7275e2`)
- Ficheros GGUF: `DA3-SMALL-Q4_K_S.gguf` y `DA3-SMALL-Q8_0.gguf` dentro del repositorio
- Manifiesto con hashes: `model-manifest.json` en el repositorio
- Licencia: `LICENSE` en el repositorio (Apache-2.0)
- Paper, blog o demo de Depth Anything 3: no disponibles en la informacion proporcionada
