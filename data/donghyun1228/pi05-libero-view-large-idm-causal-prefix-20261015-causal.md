# Donghyun1228/pi05-libero-view-large-idm-causal-prefix-20261015-causal

## Resumen

El modelo `Donghyun1228/pi05-libero-view-large-idm-causal-prefix-20261015-causal` es un checkpoint de investigación perteneciente a la familia pi05 (vision-language-action, VLA), entrenado para el benchmark de manipulación robótica LIBERO. Lo publica el usuario Donghyun1228 como artefacto asociado al repositorio de código `vla_adaptation`, y su propósito no es el despliegue generalista sino servir como evidencia reproducible de un experimento de ablación sobre el enmascaramiento de atención en una tarea auxiliar de modelado inverso de dinámica (IDM, inverse dynamics model).

El checkpoint es el resultado de una continuación de 200 actualizaciones desde una línea base aceptada (`accepted manual-LR view baseline raw999`), restaurando Adam y EMA y manteniendo el escalado posterior a Adam con `vision1` y `expert0.1`. El experimento compara dos brazos auxiliares que reordenan los tokens como imagen actual, prompt inverso e imagen futura: un brazo de control reordenado que permite atención de prefijo completa y un brazo causal que bloquea la atención hacia delante desde la imagen actual y el prompt hacia los tokens de imagen futura.

Su relevancia es metodológica más que de producto: el resultado publicado indica que no se observó ninguna ganancia de éxito de política en este peso y presupuesto, ya que los tres brazos (accepted, reordered y causal) obtuvieron 11/24 en la criba de ocho tareas, con resultados idénticos de éxito y fallo. El repositorio ocupa 5,9 GB y contiene únicamente los parámetros de inferencia en BF16 junto con los activos de normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo VLA (vision-language-action) de la familia pi05, según las etiquetas del repositorio; los detalles internos de la arquitectura no se especifican en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Inferencia en BF16 (los parametros de inferencia sin EMA se convierten a BF16). Los checkpoints nativos FP32 de optimizador y EMA no se incluyen en el repositorio |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto multilingüe) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene 74 hojas de parámetros más activos de normalización) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de su pertenencia a la familia pi05 y de su naturaleza VLA, por lo que no es posible detallar el número de parámetros, la configuración de capas ni el mecanismo de fusión visión-lenguaje-acción. Lo que sí se documenta con precisión es el esquema de entrenamiento de la cabeza auxiliar: los brazos auxiliares reordenan los tokens con la secuencia imagen actual, prompt inverso e imagen futura. El brazo de control reordenado permite atención de prefijo completa sobre esa secuencia, mientras que el brazo causal bloquea la atención hacia delante desde los tokens de imagen actual y de prompt hacia los tokens de imagen futura. La propia model card advierte que este bloqueo causal no elimina todos los gradientes derivados del futuro, y que la inferencia no cambia respecto a la línea base.

El entrenamiento consistió en una continuación de 200 actualizaciones desde la línea base `raw999`, restaurando Adam y EMA y conservando el escalado posterior a Adam con `vision1` y `expert0.1`. Se emplearon dos sondas IDM (la antigua más una adicional de +0,1), con B32 por pérdida. Es explícito que no se usaron etiquetas de experto, observaciones de cámara original ni nuevos datos de rollout para el entrenamiento. Los checkpoints nativos en FP32 de optimizador y EMA permanecieron en GPUs B200 y no forman parte de la publicación. La configuración de política indicada es `pi05_libero_source_free_split_vision_idm`.

## Capacidades

- Control robótico de manipulación en el entorno del benchmark LIBERO, con observaciones de cámara (vista de muñeca congelada como codificador fuente y vista objetivo en configuración `targetviewlarge`).
- Ejecución de políticas condicionadas por lenguaje (prompt) en tareas de manipulación, según la formulación VLA de la familia pi05.
- Modelado inverso de dinámica (IDM) como tarea auxiliar de entrenamiento: predicción de acciones o prompt inverso a partir de pares de imagen actual e imagen futura.
- Soporte de atención causal restringida sobre prefijos de tokens como mecanismo experimental de control de flujo de gradientes.
- Compatibilidad con el protocolo de evaluación oficial de LIBERO: estados iniciales 3 a 5, semilla 17 y MuJoCo 3.2.3.
- No se documentan capacidades de generación de texto general, tool calling, agentes, matemáticas, código, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Reproducción de la ablación causal: el checkpoint permite reproducir la comparación entre atención de prefijo completa y atención causal bloqueada sobre tokens de imagen futura, con los mismos estados iniciales y semilla, para verificar la ausencia de ganancia reportada.
- Investigación en objetivos auxiliares IDM: sirve como punto de partida para estudiar si el modelado inverso de dinámica aporta señal útil en adaptación de políticas VLA, dado que en este experimento concreto no se tradujo en mejoras de éxito.
- Adaptación source-free de políticas: la configuración `pi05_libero_source_free_split_vision_idm` y el uso de un codificador de muñeca congelado lo hacen adecuado para experimentos de adaptación sin acceso a datos fuente.
- Evaluación estandarizada en LIBERO: puede emplearse para medir éxito en la criba de ocho tareas y en las cuatro tareas difíciles que permanecen en 0/3, como referencia negativa o de control.
- Estudio de estabilidad de optimización: al restaurar Adam y EMA y documentar el escalado posterior a Adam, es útil para analizar efectos de optimizador y EMA en continuaciones cortas de 200 actualizaciones.
- Punto de comparación en investigación de enmascaramiento de atención: las tres variantes (accepted, reordered, causal) con resultados idénticos permiten aislar el efecto del enmascaramiento del efecto del reordenamiento de tokens.
- Base para auditorías de reproducibilidad: el enlace al commit `07e04b82` del repositorio de código facilita verificar la correspondencia entre el peso publicado y el código de entrenamiento.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar de lenguaje o razonamiento (MMLU, HumanEval, GSM8K, etc.). El único dato de rendimiento disponible es la criba de política emparejada sobre ocho tareas de LIBERO.

| Variante | Éxito en criba de 8 tareas | Tareas difíciles |
|---|---|---|
| accepted (línea base aceptada) | 11/24 | 0/3 |
| reordered (control reordenado) | 11/24 | 0/3 |
| causal (causal-prefix, este checkpoint) | 11/24 | 0/3 |

La model card indica que todos los resultados de éxito y fallo fueron idénticos entre los tres brazos y que no se observó ninguna ganancia de éxito de política en este peso y presupuesto. Se advierte explícitamente que esta criba de ocho tareas no constituye una estimación amplia de 40 tareas ni una reproducción del resultado 243/400.

## Requisitos de hardware

- Tamano del repositorio: 5,9 GB, correspondiente a los parámetros de inferencia en BF16 más activos de normalización.
- VRAM estimada: no disponible de forma explícita; el peso publicado en BF16 requiere al menos el tamaño del repositorio más el coste de activaciones, buffers de atención y el codificador de visión congelado.
- GPU recomendadas: no especificadas en la model card. Se documenta que los checkpoints nativos FP32 de optimizador y EMA se mantuvieron en GPUs B200, lo que implica que el entrenamiento se realizó en hardware de clase B200.
- Compatibilidad con GPU de consumo: no disponible. No se indica si el checkpoint cabe en GPUs como RTX 4090.
- Opciones de despliegue: no se documentan frameworks de servicio (vLLM, llama.cpp, Ollama, TGI). El uso previsto está ligado a la configuración de política `pi05_libero_source_free_split_vision_idm` y al entorno LIBERO con MuJoCo 3.2.3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos. La model card no incluye comparaciones frente a pi05 base, OpenVLA, RDT ni otras políticas VLA, y no se proporcionan cifras de parámetros, contexto o licencia de los modelos de referencia. Por tanto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-view-large-idm-causal-prefix (este) | no disponible | no disponible | 11/24 en criba de 8 tareas LIBERO | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se observó ninguna mejora de rendimiento: los tres brazos del experimento obtuvieron exactamente 11/24, por lo que este checkpoint no debe presentarse como una mejora sobre la línea base.
- Cuatro tareas difíciles permanecen en 0/3 en la criba reportada.
- La criba de ocho tareas es una muestra reducida y no equivale a una estimación amplia de 40 tareas ni a una reproducción del resultado 243/400 citado en la model card.
- El bloqueo causal aplicado no bloquea todos los gradientes derivados del futuro, según admite la propia documentación, lo que limita la interpretación del experimento como un aislamiento causal limpio.
- La inferencia no cambia respecto a la línea base, de modo que el valor del artefacto es experimental y no funcional.
- No se especifican licencia, idiomas soportados ni condiciones de uso comercial; se desconoce si el uso comercial está permitido.
- El repositorio incluye únicamente parámetros de inferencia en BF16 y activos de normalización; no contiene los checkpoints FP32 de optimizador ni EMA, por lo que no permite reanudar el entrenamiento tal cual.
- No se documentan sesgos, tasas de alucinación ni evaluación de robustez; el modelo es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta.
- El repositorio está compuesto por 74 hojas de parámetros compuestas con un codificador de muñeca congelado, lo que introduce dependencia de ese componente fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-causal-prefix-20261015-causal
- Repositorio de código de entrenamiento (commit 07e04b82): https://github.com/Donghyun1228/vla_adaptation
- Paper, blog o demo oficial: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados no guardan relación con el artefacto y se han descartado.
