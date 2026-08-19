# idekoh/Multi-3DLLM

## Resumen

Multi-3DLLM es un modelo multimodal desarrollado por Kohsuke Ide y colaboradores en el marco del proyecto BeyondSingleObject, presentado en CVPR 2026 Findings. Extiende el enfoque de PointLLM, originalmente centrado en objetos individuales, para abordar el razonamiento relacional sobre múltiples nubes de puntos 3D. El modelo se publica en dos checkpoints diferenciados: uno para tareas de comprensión multi-objeto (MO3D, Shape Mating y Change Captioning) y otro específico para clasificación zero-shot en ModelNet40.

La arquitectura se basa en un Patch-Interaction Transformer, que permite procesar simultáneamente varias nubes de puntos y modelar interacciones entre ellas. El modelo está diseñado para responder preguntas sobre relaciones posicionales, comparativas y holísticas entre objetos 3D, seleccionar pares de formas geométricamente compatibles y verificar o describir cambios entre dos representaciones. Su relevancia radica en que aborda un vacío en los modelos 3D-LLM existentes, que suelen limitarse a un único objeto por consulta.

El repositorio de HuggingFace aloja los pesos con un tamaño total de 84,6 GB, e incluye instrucciones de descarga, scripts de evaluación y referencias al código y los datasets. La licencia se declara como "other", con advertencias sobre posibles restricciones heredadas de componentes upstream como PointLLM, Vicuna/Llama, Objaverse, ShapeTalk, Thingi10K, Neural Shape Mating y ModelNet40.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Patch-Interaction Transformer sobre base PointLLM (no se especifica el modelo de lenguaje subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | other (con restricciones heredadas de componentes upstream) |
| Formato de pesos | no disponible (checkpoints, formato no especificado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura basada en PointLLM, que integra un codificador de nubes de puntos con un modelo de lenguaje de gran tamano. La innovacion principal es el Patch-Interaction Transformer, que permite procesar multiples nubes de puntos de forma conjunta y capturar interacciones entre ellas. Esto habilita tareas como comparacion de objetos, seleccion de pares compatibles y deteccion de cambios, que requieren razonamiento relacional.

El entrenamiento se realizo mediante fine-tuning conjunto sobre tres datasets de tareas publicados en el proyecto BeyondSingleObject: MO3D (con 70k ejemplos de QA posicional, comparativo y holistico), Shape Mating (seleccion de pares geometricos) y Change Captioning (verificacion y descripcion de cambios entre formas). Ademas, se libera un checkpoint separado para clasificacion zero-shot en ModelNet40, siguiendo el protocolo de evaluacion de PointLLM. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Razonamiento relacional sobre multiples objetos 3D: responde preguntas posicionales, comparativas y holisticas sobre nubes de puntos.
- Seleccion de pares de formas: identifica que dos objetos son geometricamente compatibles para ensamblaje (Shape Mating).
- Verificacion de cambios: determina si dos representaciones 3D difieren y en que aspecto.
- Descripcion de cambios (delta-captioning): genera descripciones textuales de las diferencias entre dos formas.
- Clasificacion zero-shot de objetos 3D: clasifica nubes de puntos en categorias de ModelNet40 sin entrenamiento especifico.
- Generacion de texto en ingles: respuestas en lenguaje natural para las tareas anteriores.
- Soporte para multiples objetos en una misma consulta: a diferencia de modelos centrados en un solo objeto, puede procesar varias nubes de puntos simultaneamente.

## Casos de uso

- Inspeccion de calidad en fabricacion aditiva: comparar el modelo CAD original con la pieza escaneada en 3D para detectar y describir desviaciones geometricas, usando la capacidad de Change Captioning.
- Ensamblaje asistido por robot: dado un conjunto de piezas, el modelo puede seleccionar los pares que encajan entre si (Shape Mating), facilitando la planificacion de montaje en entornos industriales.
- Analisis de escenas 3D para robotica: responder preguntas como "que objeto esta a la izquierda del otro" o "cual es mas grande" sobre una escena capturada con sensores de profundidad, gracias a las capacidades de QA posicional y comparativo.
- Catalogacion automatica de objetos 3D: clasificar nubes de puntos en categorias predefinidas (ModelNet40) para organizar bases de datos de modelos 3D sin etiquetado manual.
- Verificacion de integridad en digitalizacion patrimonial: comparar dos escaneos de una misma pieza para confirmar que no ha sufrido cambios o detectar alteraciones, usando la tarea de verificacion de cambios.
- Generacion de descripciones de diferencias en diseno colaborativo: cuando dos disenadores trabajan sobre versiones de un mismo modelo 3D, el modelo puede generar un resumen textual de las diferencias entre ambas versiones, facilitando la revision.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados deterministas obtenidos con subconjuntos de evaluacion compactos y el formato de inferencia publico. Se presentan como comprobaciones de regresion, no como sustitutos de las metricas de razonamiento evaluadas por LLM del articulo.

| Tarea | Metrica | Resultado |
| --- | --- | ---: |
| MO3D holistic QA | Exactitud binaria | 84,0% (42/50) |
| Shape Mating | Exactitud de seleccion | 73,0% (146/200) |
| Change Captioning verify | Exactitud binaria | 67,0% (67/100) |
| Change Captioning verify (sin nube de puntos) | Exactitud binaria | 50,0% (50/100) |

No se han publicado comparaciones con otros modelos en la informacion disponible. Las metricas de razonamiento evaluadas por LLM y los puntajes de delta-caption dependen del modelo juez y la configuracion de prompt, por lo que se recomienda usar los evaluadores publicados y reportar la configuracion exacta.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (84,6 GB) sugiere que los checkpoints son de gran tamano, pero no se especifica el numero de parametros ni la memoria necesaria para inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio proporciona scripts de evaluacion propios (`scripts/eval/infer.sh` y `scripts/eval/eval_modelnet.sh`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos alternativos de la misma categoria. El modelo se basa en PointLLM, pero no se ofrecen datos de rendimiento relativo frente a otros modelos 3D-LLM. Se recomienda consultar el articulo de CVPR 2026 para una comparacion detallada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al estar entrenado sobre datasets como Objaverse, ShapeTalk y ModelNet40, puede heredar sesgos de esos conjuntos de datos.
- Riesgo de alucinacion: las tareas de razonamiento y descripcion de cambios pueden producir respuestas incorrectas, especialmente cuando no se dispone de la nube de puntos (la exactitud cae al 50% en Change Captioning sin nube de puntos, equivalente a azar).
- Limitaciones de contexto e idioma: el modelo solo soporta ingles; no se especifica la longitud de contexto.
- Restricciones de licencia: la licencia "other" implica que los checkpoints pueden heredar terminos de componentes upstream (PointLLM, Vicuna/Llama, Objaverse, Cap3D, ShapeTalk, Thingi10K, Neural Shape Mating, ModelNet40). Es obligatorio revisar las licencias de cada componente antes de cualquier redistribucion o uso comercial.
- Advertencia para produccion: los checkpoints de tarea y de clasificacion tienen roles distintos y no deben intercambiarse. Las metricas de razonamiento dependen del modelo juez y la configuracion de prompt, por lo que los resultados pueden variar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/idekoh/Multi-3DLLM
- Repositorio de codigo: https://github.com/KohsukeIde/BeyondSingleObject
- Dataset de anotaciones: https://huggingface.co/datasets/idekoh/BeyondSingleObject
- Pagina del proyecto: https://kohsukeide.github.io/BeyondSingleObject/
