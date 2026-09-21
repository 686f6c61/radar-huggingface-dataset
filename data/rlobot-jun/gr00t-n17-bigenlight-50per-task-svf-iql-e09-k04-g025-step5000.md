# RLobot-jun/gr00t-n17-bigenlight-50per-task-svf-iql-e09-k04-g025-step5000

## Resumen

`RLobot-jun/gr00t-n17-bigenlight-50per-task-svf-iql-e09-k04-g025-step5000` es un paquete de inferencia (bundle) para una política de manipulación robótica, publicado por el usuario RLobot-jun en HuggingFace el 21 de septiembre de 2026. No se trata de un modelo completo, sino de un conjunto de adaptadores derivados de un modelo base de imitación: el autor lo describe explícitamente como un "BC-deduplicated inference bundle" que contiene únicamente el LoRA del actor, el crítico Q congelado y los críticos internos de soft-value. El repositorio ocupa 0,1 GB y, en el momento de la consulta, acumula 0 descargas y 0 "likes".

El modelo resuelve el problema del post-entrenamiento por refuerzo offline de una política de imitación (behavior cloning) para tareas de manipulación. Sobre el modelo base `RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000` se aplica un crítico ambiental IQL con expectile 0,9 (30.000 actualizaciones, recompensa de coste por paso, gamma 0,99, 50 episodios por tarea) y posteriormente un actor e crítico interno entrenados durante 5.000 actualizaciones con kappa=0,4, g=0,25 (c=0,64), batch 32, 4 pasos de flujo y 8 candidatos. El actor es un `ProjectedFlowActor` con LoRA de rango 16 y alpha 32, con horizonte de acción de 16 pasos.

Su relevancia es fundamentalmente metodológica: documenta una receta reproducible de RL offline sobre una política viso-lenguaje-acción, con la política final aislada en adaptadores de tamaño reducido (0,1 GB) que pueden distribuirse y combinarse por separado. La nomenclatura del repositorio remite a la familia GR00T N1.7, aunque la información proporcionada no detalla la arquitectura interna de ese modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de flujo (`ProjectedFlowActor`) con adaptador LoRA sobre modelo base GR00T N1.7; crítico Q escalar twin IQL congelado y dos cabezas internas de soft-value. Detalles completos de la arquitectura base: no disponibles |
| Parametros totales | No disponible. El repositorio (0,1 GB) contiene solo adaptadores, no los pesos base |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible. El horizonte de acción declarado es de 16 pasos |
| Tipos de cuantizacion | No disponible. El autor menciona conversión de dtype en la verificación de pesos, sin detallar cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (`adapter/actor_lora.safetensors`, `adapter/env_q.safetensors`, `adapter/inner_critic.safetensors`) y `adapter/adapter_config.json` |

## Arquitectura y entrenamiento

El componente entrenable es un actor de flujo con adaptación de bajo rango (LoRA de rango 16, alpha 32) aplicado sobre el `ProjectedFlowActor` del modelo base de behavior cloning. La generación de acciones emplea 4 pasos de integración de flujo y evalúa 8 candidatos por decisión, con un horizonte de acción de 16 pasos. El entrenamiento consta de dos fases diferenciadas: primero se ajusta un crítico ambiental Q escalar (twin IQL, sin encoder) con expectile 0,9 durante 30.000 actualizaciones, usando 50 episodios por tarea, recompensa de coste por paso y factor de descuento gamma 0,99; después se entrenan el actor y los críticos internos de soft-value durante 5.000 actualizaciones con kappa=0,4, g=0,25 (c=0,64) y batch de 32.

El bundle no incluye los pesos BC/VLM, ni las redes de referencia, optimizador o redes objetivo. El autor indica que hay que cargar primero el modelo base en la revisión `1704897ac6a2a93c1d1fd806925b9237977ed8c5` y aplicar el LoRA sobre el `ProjectedFlowActor` de BC correspondiente, nunca sobre un actor ya afinado con SVF. Los ficheros de procesador y estadísticas de la raíz se copian del BC común. El autor advierte que la verificación de los pesos congelados del actor se hizo contra el BC local tras la conversión de dtype, pero que la paridad de inferencia en robot no se ha probado para esta exportación. La sigla SVF aparece en el nombre y en la descripción del autor, pero la información proporcionada no la desarrolla.

## Capacidades

- Generación de acciones de manipulación robótica: el actor produce secuencias de acción con horizonte de 16 pasos a partir de observaciones, integrando el flujo en 4 pasos y seleccionando entre 8 candidatos.
- Post-entrenamiento por RL offline: incorpora una receta IQL completa (expectile 0,9, 30.000 actualizaciones, gamma 0,99) sobre una política de imitación previa.
- Evaluación de valor: incluye un crítico Q escalar twin congelado y dos cabezas internas de soft-value entrenadas, utilizables para estimar valor y filtrar candidatos de acción.
- Adaptación paramétrica eficiente: el ajuste se encapsula en LoRA de rango 16 sobre el actor, lo que permite distribuir y recombinar adaptadores sin redistribuir los pesos base.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es una política de acción, no un modelo de lenguaje conversacional).
- Capacidades multilingües: no disponible.
- Capacidades especiales: decodificación basada en flujo con múltiples candidatos y horizonte de acción fijo de 16 pasos. No se documentan capacidades de visión, audio o modo de razonamiento.

## Casos de uso

- Post-entrenamiento de políticas de imitación existentes: el bundle permite aplicar RL offline sobre un `ProjectedFlowActor` ya entrenado por behavior cloning, de modo que un equipo puede mejorar el rendimiento de una política sin recolocar el pipeline de datos de imitación.
- Reproducción de experimentos de RL offline: la receta está completamente especificada (expectile, número de actualizaciones, gamma, kappa, g, batch, pasos de flujo, candidatos), lo que facilita replicar los resultados a 50 episodios por tarea en una misma suite de tareas.
- Ajuste de hiperparámetros del crítico IQL: investigadores interesados en el efecto del expectile o del coste por paso pueden partir de este checkpoint y comparar contra el modelo base `step10000` como referencia.
- Distribución de políticas en entornos con ancho de banda limitado: al ocupar solo 0,1 GB, los adaptadores pueden transferirse entre laboratorios o desplegarse en robots de campo cargando el modelo base una sola vez.
- Encadenamiento con otros adaptadores: dado que el LoRA se aplica sobre el actor de BC y no sobre un actor ya afinado con SVF, es posible mantener varias variantes de post-entrenamiento y alternarlas según la tarea.
- Filtrado y selección de acciones mediante el crítico: el crítico Q congelado y las cabezas de soft-value permiten reordenar o descartar candidatos de acción en tiempo de ejecución, útil en escenarios donde una acción errónea tiene coste alto.
- Referencia para pipelines de simulación a real: el bundle sirve como punto de partida para validar la transferencia al robot físico, teniendo en cuenta que el propio autor advierte que la paridad de inferencia en robot no se probó.
- Comparación de recetas de RL offline: el sufijo del repositorio (`e09-k04-g025-step5000`) codifica los hiperparámetros usados, lo que permite organizar barridos sistemáticos sobre las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, curvas de aprendizaje ni comparaciones numéricas con el modelo base, y el repositorio no registra descargas ni valoraciones que permitan inferir un rendimiento validado por la comunidad.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio solo contiene 0,1 GB de adaptadores y críticos; el consumo total depende del modelo base GR00T N1.7, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible. Depende del tamaño y dtype de los pesos base, que no se declaran.
- Opciones de despliegue: no documentadas. Los runners habituales de modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no aplican directamente a un actor de flujo para robótica; el autor no menciona ninguna herramienta de serving.
- Latencia y rendimiento: no disponibles. Los únicos parámetros de coste conocidos son los de la propia decodificación: 4 pasos de integración de flujo y 8 candidatos evaluados por decisión, con horizonte de 16 pasos.
- Requisito funcional conocido: debe cargarse el modelo base en la revisión `1704897ac6a2a93c1d1fd806925b9237977ed8c5` antes de aplicar los adaptadores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gr00t-n17-bigenlight-50per-task-svf-iql-e09-k04-g025-step5000` (este bundle) | No disponible (adaptadores de 0,1 GB) | No disponible; horizonte de acción 16 | No publicado | No disponible | HuggingFace, 0 descargas |
| `RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000` (modelo base) | No disponible | No disponible | No publicado | No disponible | HuggingFace, referenciado como base |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada. El único punto de comparación documentado es el propio modelo base del que deriva este bundle.

## Limitaciones y advertencias

- No es un modelo autónomo: el autor indica explícitamente que no es un directorio BC nativo independiente ni un checkpoint reanudable de entrenamiento.
- Dependencia de revisión exacta: requiere cargar el modelo base en la revisión `1704897ac6a2a93c1d1fd806925b9237977ed8c5`; usar otra revisión puede invalidar la correspondencia de pesos.
- Componentes ausentes: no se incluyen los pesos BC/VLM, las redes de referencia, el optimizador ni las redes objetivo, por lo que no es posible reanudar el entrenamiento desde este paquete.
- Paridad de inferencia no verificada: el autor advierte que la verificación se limitó a comparar pesos congelados contra el BC local tras conversión de dtype, y que la paridad en inferencia robótica no se probó.
- Riesgo de aplicación incorrecta: el LoRA debe aplicarse al `ProjectedFlowActor` de BC correspondiente y no a un actor ya afinado con SVF; hacerlo de otro modo produce un modelo inválido.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial y persisten dudas sobre los términos heredados del modelo base, que tampoco se documentan aquí.
- Ausencia de validación externa: 0 descargas y 0 "likes" en el momento de la consulta; no existen evaluaciones independientes ni informes de terceros.
- Sin métricas publicadas: no hay tasas de éxito, curvas de recompensa ni comparaciones numéricas con el modelo base, de modo que el rendimiento real es desconocido.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluación de sesgo, sesgo de simulación o desviación de dominio.
- Limitaciones de idioma y contexto: no disponible. Es una política de acción, no un modelo de texto, por lo que las métricas de contexto e idioma de los modelos de lenguaje no son aplicables.
- Caveat de producción: dado que no se han validado la latencia, el throughput ni la seguridad de las acciones generadas, cualquier despliegue en un robot real debería acompañarse de capas de supervisión y parada de emergencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-svf-iql-e09-k04-g025-step5000
- Modelo base: https://huggingface.co/RLobot-jun/gr00t-n17-bigenlight-50per-task-step10000
- Revisión del modelo base indicada por el autor: `1704897ac6a2a93c1d1fd806925b9237977ed8c5`
- Documentación de los adaptadores: `adapter/README.md` dentro del repositorio
- Configuración y procedencia de los adaptadores: `adapter/adapter_config.json` dentro del repositorio
- Resultados de la búsqueda web: sin enlaces relevantes. Las únicas URLs devueltas corresponden a un comercio de moda y no guardan relación con el modelo, por lo que no se incluyen.
