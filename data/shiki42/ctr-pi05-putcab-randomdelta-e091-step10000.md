# Shiki42/ctr-pi05-putcab-randomdelta-e091-step10000

## Resumen

ctr-pi05-putcab-randomdelta-e091-step10000 es un checkpoint de inferencia publicado por el usuario Shiki42 en HuggingFace, etiquetado con los tags robotics, ctr y robotwin. No es un modelo de lenguaje conversacional, sino una política robótica (policy) con pesos y artefactos de normalización asociados a un experimento de entrenamiento denominado CTR E091, en su paso de optimizador 10000. El nombre del repositorio sugiere que se trata de un ajuste fino tipo LoRA sobre una política de la familia pi0.5 orientada a la tarea de manipulación "putcab" dentro del entorno de simulación RoboTwin, aunque esta interpretación se deriva del identificador y de la ruta de entrenamiento citada en la model card, no de documentación técnica explícita.

El checkpoint forma parte de una comparativa interna: el experimento E091 plantea si, tras restaurar la configuración histórica de carga de datos (E018) manteniendo los datos de la variante RandomDelta, cambia la tasa de éxito del modelo en 10000 pasos. El autor indica que se publicó "a petición del usuario" para preservar todos los checkpoints antes del apagado del servidor de entrenamiento, lo que lo convierte en un artefacto de conservación más que en un modelo con soporte o mantenimiento.

Su relevancia es, por tanto, acotada al ámbito de la investigación en robótica y aprendizaje por imitación: sirve como punto de reproducción de un experimento concreto, no como modelo de propósito general. El repositorio ocupa 6,3 GB, no registra descargas ni likes, y la model card remite a un registro de experimento externo (E091) para conocer el estado de evaluación y las advertencias, registro que no se incluye en los datos proporcionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El identificador "pi05" del checkpoint y la ruta de entrenamiento sugieren una política de la familia pi0.5 (modelo visión-lenguaje-acción), pero no se confirma en la información disponible |
| Parámetros totales | No disponible. El tamaño del repositorio es de 6,3 GB, dato que no permite determinar el número de parámetros sin conocer la precisión de los pesos |
| Parámetros activos | No aplica / no disponible: no consta que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el modelo no declara capacidades lingüísticas; es una política robótica) |
| Licencia | other (el campo `license: other` no especifica condiciones; se debe consultar al autor) |
| Formato de pesos | No disponible. El repositorio contiene "parameters, assets/normalization, metadata" e incluye un fichero `SHA256SUMS` con el hash de cada archivo |
| Tarea declarada | Manipulación robótica, tarea "putcab" en el entorno RoboTwin |
| Paso de optimización | 10000 |
| Experimento | CTR E091 (variante RandomDelta, configuración de carga histórica alineada con LoRA 10K) |
| Tamaño del repositorio | 6,3 GB |
| Fecha de publicación | 27 de septiembre de 2026 (creación y última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Los únicos datos técnicos explícitos son la ruta de entrenamiento en el host original, `/root/autodl_oss_runs/E091-baseline-loader-v2/run-artifacts/checkpoints/pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep/ctr-e091-baseline-loader-lora10k/10000`, y la naturaleza del artefacto publicado: un checkpoint de inferencia que incluye parámetros, recursos de normalización y metadatos, con el estado del optimizador excluido. La composición de esa ruta sugiere un entrenamiento con micro-batch de 16, acumulación de gradientes de 1, ajuste LoRA de 3 épocas y horizonte completo ("fullhorizon") sobre una política "pi05" para la tarea "putcab"; se trata, no obstante, de una inferencia a partir del nombre de los directorios y no de documentación confirmada.

Tampoco se especifican el número de tokens o trayectorias de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El encabezado de la model card indica que se trata del paso 10000 de un experimento cuyo objetivo era comprobar el efecto de restaurar una configuración histórica de carga de datos (E018) manteniendo los datos de la variante RandomDelta, de modo que el entrenamiento responde a una hipótesis experimental comparativa más que a un pipeline de producción documentado.

## Capacidades

- Ejecución de políticas de manipulación robótica: el tag `robotics` y la tarea "putcab" en RoboTwin apuntan a un modelo de control para colocar un objeto en una posición o contenedor.
- Inferencia desde checkpoint de paso fijo: se publica como checkpoint de inferencia (parámetros + normalización + metadatos), no como checkpoint de reanudación de entrenamiento.
- Integración en pipelines de evaluación de simulación: el tag `robotwin` lo vincula a ese simulador de manipulación bimanual.
- Reproducibilidad de experimentos: el repositorio incluye `SHA256SUMS` con el hash SHA-256 de cada archivo, lo que permite verificar la integridad de los artefactos.
- Ajuste adicional (fine-tuning): al derivar de un ajuste LoRA, puede servir como base para nuevos ajustes sobre la misma tarea, aunque no se documenta el procedimiento.
- Generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, agentes multi-paso y capacidades multilingües: no disponible / no aplicable según la información proporcionada, ya que no se declara ninguna capacidad de este tipo.
- Modo de razonamiento (thinking), audio o visión de propósito general: no disponible.

## Casos de uso

- Reproducción del experimento CTR E091: cargar el checkpoint en el pipeline de evaluación original y medir la tasa de éxito del paso 10000 para responder a la pregunta del experimento sobre el efecto de restaurar la configuración de carga E018 con datos RandomDelta.
- Comparación de checkpoints en una misma línea experimental: usar este paso 10000 como referencia frente a pasos intermedios o frente a la línea base sin RandomDelta, manteniendo constantes el resto de factores de entrenamiento.
- Evaluación en el benchmark RoboTwin: ejecutar la tarea "putcab" en el simulador para obtener métricas de éxito estandarizadas y comparables con otros agentes entrenados en el mismo entorno.
- Punto de partida para ajuste específico de tarea: al proceder de un ajuste LoRA, puede reutilizarse como inicialización para nuevas variantes sobre objetos, posiciones o distribuciones de escena distintas dentro del mismo simulador.
- Depuración de artefactos de normalización: el repositorio incluye los recursos de normalización, lo que permite verificar si las discrepancias de rendimiento entre checkpoints provienen de la normalización de observaciones o acciones y no de los pesos.
- Despliegue experimental en laboratorio con brazo robótico real: transferir la política a un setup físico para estudiar la brecha simulación-real en la tarea de colocación, asumiendo que la política se entrenó en simulación.
- Verificación de integridad en archivado a largo plazo: gracias a `SHA256SUMS`, el repositorio sirve como copia verificable de un checkpoint cuya máquina de entrenamiento fue apagada, útil para auditorías posteriores de resultados.
- Estudio metodológico sobre ajuste LoRA en políticas VLA: analizar si 3 épocas de LoRA con micro-batch 16 y acumulación 1 son suficientes para la tarea, usando este checkpoint como evidencia empírica de un punto concreto del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el estado de evaluación y las advertencias se registran en el registro del experimento CTR E091, que no forma parte de los datos proporcionados, y que el checkpoint se publicó para preservar artefactos antes del apagado del host. En consecuencia, no se dispone de tasas de éxito, métricas de simulación ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM para inferencia: no disponible con precisión. Como referencia orientativa, un repositorio de 6,3 GB sugiere que los pesos en precisión de 16 bits ocuparían del orden de 6 GB, lo que implicaría un consumo de VRAM de aproximadamente 8-10 GB con activaciones y buffers de inferencia; esta estimación es especulativa porque se desconoce el número de parámetros y el formato de los pesos.
- GPU recomendadas: no disponibles. Por el rango de memoria estimado, una GPU de consumo con 16-24 GB (por ejemplo, RTX 4080 o RTX 4090) podría ser suficiente para inferencia en precisión reducida; para entrenamiento o evaluación por lotes serían preferibles A100 o H100, sin que existan datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: probable si la estimación de 6,3 GB de pesos en 16 bits es correcta, pero no verificado. No se documenta ningún requisito mínimo de memoria.
- Opciones de despliegue: no disponible. Al no ser un modelo de lenguaje, no se puede asumir compatibilidad con vLLM, llama.cpp, Ollama o TGI; el despliegue dependería del código de la política pi0.5 y del entorno RoboTwin, que no se enlazan en la información proporcionada. El repositorio no incluye instrucciones de uso ni scripts de inferencia según los datos disponibles.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio requiere 6,3 GB en disco, además del espacio necesario para el simulador y sus dependencias.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones verificables de este checkpoint (parámetros, contexto, licencia concreta, métricas), por lo que no es posible establecer una comparación cuantitativa fiable. A continuación se indican alternativas de la misma categoría (políticas visión-lenguaje-acción para manipulación), señalando únicamente lo que es público y advirtiendo de que estas cifras provienen de la documentación de cada proyecto, no de la información disponible sobre este modelo.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ctr-pi05-putcab-randomdelta-e091-step10000 | Política robótica (posible familia pi0.5), tarea putcab en RoboTwin | No disponible | No disponible | other (sin detallar) | HuggingFace, 0 descargas, sin evaluación publicada |
| OpenVLA | Política visión-lenguaje-acción de propósito general | Del orden de 7 000 millones (según publicación original) | No disponible en la información proporcionada | Abierta, con condiciones por confirmar en su repositorio | Ampliamente distribuido, con documentación pública |
| pi0 (Physical Intelligence) | Política visión-lenguaje-acción con flujo de acciones | Del orden de 3 000 millones (según publicación original) | No disponible en la información proporcionada | No disponible en la información proporcionada | Publicada por sus autores |
| RDT-1B | Modelo de difusión para manipulación bimanual | Del orden de 1 200 millones (según publicación original) | No disponible en la información proporcionada | No disponible en la información proporcionada | Publicado por sus autores |

No se dispone de datos de rendimiento comparables entre estas alternativas y el checkpoint analizado, dado que este último carece de métricas publicadas y está restringido a una única tarea de un simulador concreto.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: la model card remite al registro del experimento E091 para el estado de evaluación y las advertencias, pero ese registro no se incluye; no hay evidencia de que el checkpoint funcione correctamente en la tarea declarada.
- Especificidad de tarea: el modelo está asociado a la tarea "putcab" y al entorno RoboTwin. Es previsible un rendimiento deficiente fuera de esa distribución, aunque no existen datos que lo cuantifiquen.
- Procedencia y mantenimiento: el repositorio se publicó para preservar checkpoints antes del apagado del servidor de entrenamiento. No hay indicios de mantenimiento, soporte ni actualizaciones posteriores a la fecha de creación.
- Falta de documentación de uso: no se especifican dependencias, formato exacto de pesos, procedimiento de carga ni código de inferencia. Integrar el checkpoint exigiría reconstruir el entorno de entrenamiento original.
- Normalización dependiente del checkpoint: los recursos de normalización incluidos forman parte del artefacto; usar los pesos con estadísticas de normalización distintas puede invalidar los resultados.
- Riesgo de alucinación: no aplicable en el sentido de los modelos de lenguaje. El riesgo equivalente es la ejecución de acciones incorrectas o fuera de distribución ante observaciones no vistas durante el entrenamiento, sin mecanismo de seguridad documentado.
- Sesgos: no disponible. No se documenta la composición del dataset ni sus posibles sesgos de objeto, posición, iluminación o morfología del robot.
- Idiomas: no disponible. El modelo no declara capacidades lingüísticas y, si acepta instrucciones en lenguaje natural, no se especifica en qué idiomas.
- Licencia: el campo `license: other` no concreta condiciones. Antes de cualquier uso comercial es imprescindible contactar con el autor para conocer los términos aplicables.
- Estado del optimizador excluido: al no incluir el estado del optimizador, el checkpoint no permite reanudar el entrenamiento tal cual, solo inferencia o ajuste desde los pesos.
- Reputación del artefacto: cero descargas y cero likes, sin revisión por pares ni validación externa de los resultados.
- Resultados de búsqueda web no pertinentes: las consultas realizadas no devolvieron ninguna fuente relacionada con este modelo; los resultados obtenidos correspondían a dominios ajenos al ámbito técnico y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/ctr-pi05-putcab-randomdelta-e091-step10000
- Repositorio de RoboTwin (referencia del entorno citado en los tags; no enlazado en la información proporcionada): no disponible en los datos aportados
- Registro del experimento CTR E091 (donde el autor indica que constan el estado de evaluación y las advertencias): no disponible en los datos aportados
- Paper o blog técnico del modelo: no disponible
- Demo o espacio de inferencia: no disponible
- Búsqueda web: sin resultados relevantes. Los enlaces recuperados pertenecían a dominios sin relación con el modelo o con robótica, por lo que no se incluyen.
