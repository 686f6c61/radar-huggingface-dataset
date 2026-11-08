# gulucaptain/lingbot-va-roboicl

## Resumen

LingBot-VA RoboICL es un adaptador LoRA de época (epoch LoRA adapter) publicado por el usuario gulucaptain sobre el modelo base robbyant/lingbot-va-base, un modelo fundacional de video-acción para manipulación robótica desarrollado por Robbyant, la unidad de IA encarnada de Ant Group. El adaptador se ha entrenado sobre demostraciones y consultas emparejadas del conjunto RoboICL y está pensado para usarse junto al modelo base durante la inferencia, no como un modelo autónomo.

El modelo base pertenece a la familia LingBot-VA, presentada como un modelo fundacional "embodied-native" que se preentrena de extremo a extremo para robótica en lugar de reutilizar generadores de vídeo adaptados. Según la información pública de Robbyant, la familia se ha entrenado con aproximadamente 20.000 horas de datos reales de manipulación procedentes de 9 configuraciones de robots bimanuales y se ha evaluado en 4 plataformas robóticas, con 100 tareas por configuración y 130 episodios de adaptación por tarea.

La relevancia de este repositorio es acotada: se trata de un artefacto de entrenamiento (checkpoints LoRA por época) más que de un modelo con model card técnica completa. No se publican parámetros, contexto, licencia ni idiomas, por lo que su evaluación debe hacerse siempre en conjunción con el modelo base y con el código de entrenamiento e inferencia del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base robbyant/lingbot-va-base; arquitectura del base no disponible |
| Parametros totales | no disponible (el adaptador LoRA no declara rango ni número de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto multilingüe) |
| Licencia | no disponible |
| Formato de pesos | no disponible; la model card indica que los artefactos se guardan en `runs/<run>/checkpoints/epoch-NNN/` con un adaptador y un JSON con el paso de optimizador y el checksum de pesos |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA de época entrenados sobre el modelo base LingBot-VA. La model card especifica que el entrenamiento se realizó sobre "paired RoboICL demonstrations and queries", es decir, pares de demostraciones y consultas del conjunto RoboICL, y que la inferencia debe realizarse cargando el adaptador junto al modelo base. Cada época se materializa como un directorio `epoch-NNN` que incluye el adaptador y un registro JSON con el paso de optimizador y el checksum de los pesos, lo que facilita la trazabilidad y la reproducibilidad del entrenamiento.

No se proporcionan detalles sobre el número de tokens, la composición del dataset, el rango del LoRA, la tasa de aprendizaje, el tamaño de batch ni si hubo etapas de RLHF o DPO. Respecto al modelo base, la información pública de Robbyant describe LingBot-VA 2.0 como un modelo fundacional de video-acción preentrenado de forma nativa para embodiment, entrenado con aproximadamente 20.000 horas de datos reales de manipulación en 9 configuraciones de robots bimanuales; no se detalla en la información disponible la arquitectura interna (transformer, MoE, híbrida) ni innovaciones concretas como decodificación especulativa o atención lineal.

## Capacidades

- Adaptación de un modelo fundacional de video-acción a tareas concretas de manipulación robótica mediante LoRA, a partir de demostraciones y consultas emparejadas.
- Generación de acciones motoras condicionadas por observaciones, en el marco del modelo base LingBot-VA (modelo de video-acción para manipulación generalista).
- Aprendizaje por imitación a partir de demostraciones (el nombre RoboICL sugiere in-context learning robótico, aunque la model card no lo detalla).
- Versionado por épocas con checksums de pesos y paso de optimizador, útil para auditoría y selección de checkpoints.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo no está orientado a texto.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada; el modelo base es de video-acción, lo que implica procesamiento visual, pero no se detalla en este repositorio.

## Casos de uso

- Investigación en aprendizaje por imitación robótica: cargar el adaptador sobre LingBot-VA y evaluar cómo varía el rendimiento entre épocas usando los checkpoints `epoch-NNN` y sus checksums para reproducir experimentos.
- Adaptación rápida a una nueva tarea de manipulación: entrenar un LoRA sobre un conjunto reducido de demostraciones RoboICL en lugar de reentrenar el modelo base completo, reduciendo coste computacional y de almacenamiento.
- Reproducción de experimentos de ICL robótico: comparar el comportamiento del modelo base con y sin adaptador sobre las mismas consultas emparejadas para aislar el efecto del ajuste fino.
- Selección de checkpoints en producción: usar los registros JSON (paso de optimizador y checksum) para trazar qué época se desplegó en un robot concreto y auditar cambios de comportamiento.
- Benchmarking interno de políticas robóticas: evaluar el adaptador en las 4 plataformas y 100 tareas por configuración descritas para LingBot-VA, siempre que se disponga del pipeline de evaluación del modelo base.
- Base para experimentos de curriculum learning: al conservar artefactos por época, permite analizar la evolución del aprendizaje y elegir puntos intermedios que eviten sobreajuste en tareas con pocas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye métricas, y los datos públicos de Robbyant sobre LingBot-VA corresponden a la familia base, no a este adaptador concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del modelo base LingBot-VA, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. Para modelos de video-acción de escala fundacional suele requerirse hardware de centro de datos (A100, H100), pero no hay confirmación en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la model card solo indica que la inferencia se realiza con el adaptador junto al modelo base, sin especificar frameworks (vLLM, llama.cpp, Ollama, TGI u otros).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VA RoboICL (este repositorio) | no disponible (adaptador LoRA) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| robbyant/lingbot-va-base | no disponible | no disponible | evaluado en 4 plataformas, 100 tareas por configuración | no disponible | Hugging Face (referenciado como base) |
| LingBot-VA 2.0 (Robbyant) | no disponible | no disponible | preentrenado con ~20.000 h de datos reales de manipulación | no disponible | anunciado públicamente en 2026 |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (por ejemplo, otros modelos fundacionales de video-acción o políticas robóticas) en términos de parámetros, contexto o licencia.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; es un bloqueo para producción.
- El adaptador no es autónomo: requiere el modelo base robbyant/lingbot-va-base, cuya licencia y condiciones tampoco se detallan aquí.
- No se publican métricas de rendimiento ni comparativas, por lo que no hay evidencia cuantitativa de mejora frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día, lo que sugiere un artefacto experimental sin validación comunitaria.
- Riesgo de sobreajuste a las demostraciones RoboICL: al ser adaptadores por época, es probable que épocas tardías pierdan generalidad; conviene validar con los checksums y registros de paso de optimizador.
- No se especifican sesgos, limitaciones de idioma ni riesgos de alucinación; en robótica, el riesgo principal es la ejecución de acciones incorrectas en el mundo físico, que exige salvaguardas externas.
- La model card es mínima y no documenta el dataset, el procedimiento de entrenamiento ni la evaluación, lo que dificulta la reproducibilidad.
- No hay información sobre requisitos de hardware, latencia ni frameworks de despliegue, lo que complica la planificación de una puesta en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gulucaptain/lingbot-va-roboicl
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Página de LingBot-VLA de Robbyant: https://technology.robbyant.com/lingbot-vla/
- Artículo sobre LingBot-VA 2.0 en MarkTechPost: https://www.marktechpost.com/2026/07/11/ant-groups-robbyant-unveils-lingbot-va-2-0/
