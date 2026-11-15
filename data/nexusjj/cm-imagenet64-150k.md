# Nexusjj/cm-imagenet64-150k

## Resumen

`Nexusjj/cm-imagenet64-150k` es un checkpoint de un modelo de consistencia (consistency model) entrenado mediante destilación de consistencia (consistency distillation, CD) sobre el conjunto de datos ImageNet a resolución 64×64. Lo publica el usuario Nexusjj como parte de un proyecto de equipo del curso "Advanced Machine Learning" de la Universidad de Corea (Korea University), y se trata de una reimplementación no oficial en PyTorch del trabajo *Consistency Models* de Song et al. (ICML 2023). No es un modelo de lenguaje: es un modelo generativo de imágenes que aprende a mapear ruido a muestras en uno o pocos pasos de evaluación de la función (NFE, number of function evaluations).

El modelo se entrena por destilación a partir de un profesor EDM preentrenado, usando distancia LPIPS como objetivo, con un tamaño de lote de 64 y 150 000 pasos de entrenamiento sobre 2 GPU H100 en modo DDP. El repositorio ocupa 5,9 GB y contiene únicamente los pesos y la documentación asociada; el código de definición del modelo, carga y muestreo reside en un repositorio de GitHub externo.

Su relevancia es académica y de estudio: permite reproducir y comparar el comportamiento de la destilación de consistencia en un presupuesto de cómputo reducido frente al entrenamiento del artículo original (600 000 pasos, lote de 2048). Los resultados publicados en la model card muestran FID de 8,62 con 1 NFE, 5,62 con 2 NFE y 4,89 con 9 NFE, frente a 6,20 y 4,70 del artículo con 1 y 2 NFE respectivamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de consistencia (consistency model) sobre backbone tipo EDM; reimplementación no oficial en PyTorch |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo generativo de imágenes, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (generación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 5,9 GB; la model card no especifica el formato de los ficheros) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de los consistency models: una red que aprende una función de consistencia que mapea cualquier punto de una trayectoria de difusión directamente a la solución en el instante inicial, lo que permite generar muestras en uno o muy pocos pasos. En este checkpoint la red se obtiene por destilación de consistencia (CD) desde un profesor EDM preentrenado, con distancia LPIPS como métrica de entrenamiento, en lugar de entrenamiento desde cero. La arquitectura concreta del backbone (número de canales, bloques, atención) no se detalla en la model card; se remite al repositorio de código para la definición exacta.

El entrenamiento se realizó con tamaño de lote de 64 durante 150 000 pasos sobre 2 GPU NVIDIA H100 en paralelo de datos (DDP), lo que supone aproximadamente una cuarta parte de los pasos del artículo original (600 000) y un lote 32 veces menor (2048 en el paper). No se especifica en la información disponible el número total de tokens ni la composición del dataset más allá de ImageNet 64×64, ni si se aplicaron fases de RLHF/DPO (no aplicables en este contexto). La innovación técnica destacable es precisamente el muestreo de pocos pasos: con 1 NFE ya se obtiene una muestra completa, y con 2 NFE el FID baja a 5,62.

## Capacidades

- Generación de imágenes sintéticas a resolución 64×64 condicionadas por la clase de ImageNet (el condicionamiento por clase es el estándar en este benchmark; la model card no lo detalla explícitamente).
- Muestreo en uno o pocos pasos: 1 NFE, 2 NFE y 9 NFE reportados, lo que permite trade-off entre calidad y coste computacional.
- Destilación de consistencia desde un profesor EDM, lo que hereda la distribución del profesor a resolución 64×64.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión por comprensión, audio ni thinking mode.
- No se documentan capacidades de edición, inpainting ni condicionamiento por texto.

## Casos de uso

- Estudio y reproducción académica: sirve para replicar experimentos de destilación de consistencia con un presupuesto de cómputo reducido (2× H100, 150k pasos) y comparar el FID frente al artículo original; adecuado para cursos y trabajos de fin de máster.
- Investigación en muestreo de pocos pasos: permite analizar el compromiso entre NFE y calidad (8,62 → 5,62 → 4,89 FID al pasar de 1 a 2 y 9 NFE) en un entorno controlado.
- Benchmarking de pipelines de generación: útil como referencia de línea base para comparar otras técnicas de destilación (p. ej. destilación progresiva o adversarial) sobre ImageNet 64×64.
- Docencia en modelos generativos: el repositorio de código asociado permite explicar la formulación de consistency models y la diferencia entre entrenamiento desde cero y destilación.
- Pruebas de infraestructura de inferencia: al ser un modelo pequeño (repositorio de 5,9 GB), sirve para validar pipelines de carga de checkpoints, DDP y scripts de muestreo antes de escalar a modelos mayores.
- Generación de datos sintéticos a baja resolución para experimentos de aumento de datos o preentrenamiento de clasificadores en dominios con pocos datos, siempre que la licencia lo permita (no disponible, ver advertencias).

## Benchmarks y rendimiento

Resultados de FID (menor es mejor) reportados en la model card, comparados con los del artículo original:

| Sampler | NFE | Este checkpoint | Artículo (paper) |
|---|---|---|---|
| CM | 1 | 8,62 | 6,20 |
| CM | 2 | 5,62 | 4,70 |
| CM | 9 | 4,89 | no disponible |

No se han publicado en la información disponible resultados de otros benchmarks (p. ej. IS, Precision/Recall) ni comparaciones con modelos distintos del artículo de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 5,9 GB, por lo que en precisión completa se necesita al menos esa cantidad de memoria más el overhead del runtime. Con cuantización no se documentan opciones.
- GPU recomendadas: el entrenamiento se realizó en 2× NVIDIA H100; para inferencia no se especifican requisitos, pero por el tamaño del checkpoint es plausible que quepa en GPU de consumo con suficiente VRAM (p. ej. RTX 3090/4090 de 24 GB), aunque esto no está confirmado en la documentación.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del repositorio (5,9 GB) sugiere que sí en tarjetas con 8-12 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: el código de referencia está en el repositorio de GitHub del autor (PyTorch); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imágenes de este tipo). Para imágenes, el despliegue habitual sería un script PyTorch o un servidor de inferencia propio.
- Latencia y throughput: no disponibles. El número de NFE (1, 2 o 9) es el principal factor de coste, pero no se publican tiempos por muestra ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | FID (1 NFE) | FID (2 NFE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (CM, CD) | Consistency model destilado | 64×64 | 8,62 | 5,62 | no disponible | Hugging Face (repo de 5,9 GB) |
| Consistency Models (Song et al., ICML 2023) | Consistency model destilado | 64×64 | 6,20 | 4,70 | según el paper original (no verificada aquí) | Checkpoints del paper original (no enlazados en la información disponible) |
| EDM (profesor) | Modelo de difusión | 64×64 | no aplica (muestreo multi-paso) | no aplica | no disponible | Referencia del profesor usada en la destilación |

No se dispone de información sobre otros modelos comparables (p. ej. destilaciones alternativas sobre ImageNet 64×64) en la documentación proporcionada.

## Limitaciones y advertencias

- Es una reimplementación no oficial y con fines de estudio; no está afiliada a los autores originales del paper.
- El FID es peor que el del artículo en todos los NFE comparables (8,62 frente a 6,20 con 1 NFE; 5,62 frente a 4,70 con 2 NFE), atribuible al menor presupuesto de entrenamiento (150k pasos, lote 64 frente a 600k pasos, lote 2048).
- Licencia no disponible: no se puede confirmar el uso comercial; trátese como no apto para producción hasta verificar la licencia en el repositorio.
- Resolución fija de 64×64 y dominio limitado a ImageNet; no generaliza a otras resoluciones ni dominios sin reentrenamiento.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni razonamiento; cualquier caso de uso de NLP queda fuera de su alcance.
- No se documentan sesgos específicos, pero al entrenarse sobre ImageNet hereda los sesgos de representación de dicho dataset (clases desbalanceadas, sesgos geográficos y culturales en las imágenes).
- Riesgo de artefactos y muestras de baja calidad en clases poco representadas o con 1 NFE; el FID de 8,62 con 1 NFE indica una brecha notable respecto a muestreos multi-paso.
- No hay información sobre el formato exacto de los pesos ni sobre scripts de carga verificados; la reproducibilidad depende del repositorio de GitHub externo.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Nexusjj/cm-imagenet64-150k
- Código (repositorio del autor): https://github.com/jwj-studio/Unofficial-Consistency-Models
- Paper de referencia: Song et al., *Consistency Models*, ICML 2023 (no se proporciona URL directa en la información disponible)
