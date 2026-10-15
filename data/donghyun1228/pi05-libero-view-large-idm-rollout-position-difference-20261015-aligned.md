# Donghyun1228/pi05-libero-view-large-idm-rollout-position-difference-20261015-aligned

## Resumen

Este repositorio contiene un checkpoint de investigación de un modelo Vision-Language-Action (VLA) derivado de π0.5 (Pi05), adaptado al benchmark de manipulación robótica LIBERO y entrenado con un objetivo auxiliar concreto: un modelo de dinámica inversa (IDM) que opera solo con imágenes y predice diferencias de posición de efector final. Lo publica el usuario Donghyun1228 dentro de una línea de trabajo sobre adaptación de VLA, con el código de entrenamiento en el repositorio `vla_adaptation` de GitHub. No es un modelo de propósito general: es un artefacto de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, cuyo objetivo es medir si ese objetivo auxiliar mejora la política desplegada.

El modelo parte de una política π0.5 ya adaptada a LIBERO (base "view baseline raw999", con codificador de cámara base adaptado y un codificador de muñeca congelado restaurado de los pesos de origen) y aplica una continuación de 200 actualizaciones que restaura Adam/EMA y mantiene el escalado posterior a Adam `vision1/expert0.1`. La innovación técnica es un par de pasadas independientes solo-imagen que predicen diferencias normalizadas de XYZ, supervisadas por diferencias de XYZ de propiocepción, con un coeficiente de 0,016737429744154233 calibrado una sola vez sobre cuatro lotes de entrenamiento. La inferencia de la política no cambia y no se usa ningún prompt de posición en las acciones desplegadas.

Su relevancia es metodológica más que práctica: sirve como punto de comparación dentro de una pantalla de control emparejada (24 rollouts por variante) que el propio autor advierte que ha reutilizado repetidamente y que no constituye un test limpio. En esa pantalla, esta variante obtiene 10/24, por debajo de varios controles, incluido el control barajado. La model card no declara licencia, idiomas ni formato explícito de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 (Pi05), con cabezal de acciones flow-matching y modulo auxiliar de dinamica inversa (IDM) solo-imagen |
| Parametros totales | no disponible (el repositorio ocupa 5,9 GB y la model card menciona 74 hojas de parametros de inferencia en BF16, sin cifra de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos de inferencia se distribuyen en BF16 y no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (modelo de robotica; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; repositorio de HuggingFace con parametros de inferencia en BF16 mas assets de normalizacion |

## Arquitectura y entrenamiento

La base es π0.5, un VLA de Physical Intelligence descrito como modelo con generalización de mundo abierto, coentrenado con demostraciones de robot y datos multimodales a gran escala, y que en el ecosistema LeRobot solo soporta por ahora el cabezal de acciones de flow-matching. Sobre esa base, este checkpoint sigue el esquema "source-free split vision": el codificador de cámara base permanece adaptado, mientras que las imágenes de muñeca usan un codificador `wrist_img` separado, restaurado desde los pesos de visión de origen y convertido a bfloat16. La model card indica que se preservan las 51 hojas del modelo IDM solo-visión del objetivo y que el checkpoint final conserva el codificador de muñeca congelado, con 74 hojas de parámetros más los assets de normalización.

El entrenamiento consiste en una continuación de 200 actualizaciones desde la base aceptada (`raw999`), restaurando Adam/EMA y manteniendo el escalado posterior a Adam `vision1/expert0.1`. Se combinan dos pérdidas con lote B32: una sonda IDM sobre 40 tareas objetivo y una auxiliar de posición. Los pares auxiliares provienen de 24 rollouts ya aceptados de la política objetivo, con estados iniciales 0-2 y cuatro ventanas por cada una de 8 tareas, sin filtrado por éxito. Las dos pasadas independientes solo-imagen comparten el mismo ruido puro `t1` y un prompt constante, y ninguna ve la imagen de la otra; predicen diferencias normalizadas de XYZ de punto final supervisadas por diferencias de XYZ de propiocepción. El coeficiente (0,016737429744154233) se calibró una vez sobre cuatro lotes de entrenamiento y se mantuvo fijado, igual que en el entrenamiento previo de desplazamiento de sonda. No se usaron observaciones de cámara original, etiquetas de acción de experto, etiquetas de estado de objeto del simulador ni parámetros adicionales del modelo.

## Capacidades

- Generacion de acciones de manipulacion condicionadas por imagen y propriocepcion para tareas del benchmark LIBERO, mediante cabezal de flow-matching.
- Politica entrenada y evaluada sobre el conjunto de tareas LIBERO, con observaciones de camara base y de muneca gestionadas por codificadores separados.
- Modulo auxiliar IDM solo-imagen capaz de predecir diferencias normalizadas de XYZ de punto final a partir de una unica imagen, supervisado por propiocepcion.
- Uso de propiocepcion existente como fuente de objetivos normalizados de XYZ de efector final durante el entrenamiento del auxiliar.
- Capacidad de ejecutar rollouts en simulador MuJoCo (version 3.2.3 declarada para la evaluacion).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues (es un modelo de robotica, no de texto).
- No se documentan capacidades de vision general, audio ni modo de pensamiento; la unica funcion de vision es la codificacion de observaciones para la politica y para el auxiliar IDM.

## Casos de uso

- Evaluacion comparativa de politicas VLA en LIBERO: el checkpoint se puede cargar con la configuracion de politica `pi05_libero_source_free_split_vision_idm` y ejecutar sobre las tareas e initial states oficiales (3-5) para reproducir la pantalla de 24 rollouts por variante descrita en la model card, usando MuJoCo 3.2.3 y semilla 17.
- Estudio de ablaciones sobre objetivos auxiliares: comparar esta variante (etiquetas alineadas) contra la version barajada, contra `continue_old_idm` y contra la base sin cambios permite medir si el objetivo de posicion aporta senal util o ruido, con la advertencia del autor de que superar al control barajado no basta.
- Investigacion sobre destilacion de propiocepcion a vision: el diseno de dos pasadas solo-imagen que predicen diferencias de XYZ supervisadas por propiocepcion sirve como banco de pruebas para estudiar si la vision puede recuperar senal de movimiento sin acceso a estado del simulador.
- Diagnostico de sensibilidad a desplazamiento: los experimentos de desplazamiento cero y de barajado de pares de imagenes citados en la model card se pueden reutilizar como protocolo para detectar si el IDM aprende movimiento real o solo sesgos aditivos de escena.
- Reproduccion de pipelines de adaptacion VLA: el commit de codigo `8e18877e` en `vla_adaptation` y la revision de dataset indicada permiten reconstruir el entrenamiento completo y auditar la mezcla de perdidas y el escalado de learning rate.
- Punto de partida para continuaciones: al ser una continuacion de 200 actualizaciones de una base aceptada, puede usarse como inicializacion para experimentos posteriores dentro de la misma linea de trabajo, siempre que se conserven los checkpoints FP32 de optimizador y EMA en la maquina de entrenamiento.
- Analisis de coste de entrenamiento en hardware de gama alta: la model card menciona que los checkpoints nativos FP32 de optimizador y EMA se retienen en una B200 y no se incluyen en el repositorio, lo que permite estudiar la diferencia de huella entre artefacto de inferencia y estado de entrenamiento.

## Benchmarks y rendimiento

Los unicos datos numericos disponibles son la pantalla de control emparejada descrita en la model card: 8 tareas seleccionadas, initial states oficiales 3-5, semilla 17, MuJoCo 3.2.3, vista objetivo grande, 24 rollouts por variante. No hay MMLU, HumanEval, GSM8K ni metricas de lenguaje, porque no es un modelo de texto.

| Variante | Exitos / 24 | Porcentaje |
|---|---|---|
| accepted_unchanged | 11/24 | 45,8 % |
| old_idm_plus_rollout_position_difference_shuffled | 13/24 | 54,2 % |
| old_idm_plus_rollout_position_difference_aligned (este checkpoint) | 10/24 | 41,7 % |
| continue_old_idm | 11/24 | 45,8 % |
| old_idm_plus_extra_probe_idm | 12/24 | 50,0 % |
| old_idm_plus_rollout_idm | 12/24 | 50,0 % |
| old_idm_plus_position_difference_shuffled | 13/24 | 54,2 % |
| old_idm_plus_position_difference_aligned | 12/24 | 50,0 % |

Advertencias explicitas del autor sobre esta tabla: la pantalla de diagnostico se ha utilizado repetidamente, por lo que no es un test intacto ni una estimacion amplia de mejora sobre las 40 tareas; superar al control barajado perjudicial por si solo es insuficiente y hay que comparar contra `unchanged`/`continued IDM`; y el ajuste del auxiliar por si solo no demuestra anclaje a objeto u objetivo.

## Requisitos de hardware

- El repositorio ocupa 5,9 GB. Asumiendo pesos de inferencia en BF16 (2 bytes por parametro), el orden de magnitud seria de unos 3.000 millones de parametros y una necesidad de VRAM del orden de 6-8 GB solo para los pesos; este calculo es una estimacion derivada del tamano del repo, no un dato publicado.
- Estimacion de VRAM en inferencia: alrededor de 6-8 GB en BF16 para pesos, mas activaciones del codificador visual y del cabezal de acciones. No se publica desglose de memoria ni longitud de contexto, por lo que no se puede estimar el coste de cache.
- GPU recomendadas: no disponible en la informacion proporcionada. El entrenamiento nativo se realizo en una B200 segun la model card, pero no se detallan GPU de inferencia.
- Cabe en GPU de consumo: con 5,9 GB de pesos y estimacion de 6-8 GB de VRAM, es plausible que quepa en GPUs de consumo con 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no hay confirmacion publicada.
- Opciones de despliegue: ecosistema LeRobot para π0.5, con evaluacion en el simulador LIBERO sobre MuJoCo 3.2.3. No hay evidencia de soporte en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero-view-large-idm-rollout-position-difference-aligned) | VLA π0.5 adaptado a LIBERO con auxiliar IDM | no disponible (repo de 5,9 GB, 74 hojas en BF16) | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| pi05_libero_base (lerobot) | VLA π0.5 base para LIBERO, solo cabezal flow-matching | no disponible | no disponible | no disponible | ModelScope |
| pi05_libero_finetuned (lerobot) | VLA π0.5 afinado y evaluado en LIBERO | no disponible | no disponible | no disponible | ModelScope |
| pi05-libero-source-free-split-vision-view-large-1000-20261010 | Adaptacion previa de la misma linea, con IDM solo-vision de 51 hojas y codificador de muneca separado | no disponible | no disponible | no disponible | HuggingFace |
| pi05-libero-view-large-idm-coverage-20261015-continue | Continuacion de 200 actualizaciones con Adam/EMA restaurados | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de cifras de parametros, contexto ni licencia para ninguno de los terminos de comparacion, por lo que la comparativa queda limitada a la disponibilidad y al tipo de modelo.

## Limitaciones y advertencias

- Los desplazamientos aditivos comunes de escena no estan identificados: la model card exige diagnosticos de desplazamiento cero y de barajado de pares de imagenes antes de afirmar sensibilidad al movimiento.
- El ajuste del auxiliar por si solo no demuestra anclaje a objeto ni a objetivo; es una advertencia explicita del autor.
- La pantalla de diagnostico se ha reutilizado repetidamente y no es un test intacto ni una estimacion de mejora sobre las 40 tareas.
- Rendimiento inferior a varios controles: 10/24 en esta variante frente a 13/24 del control barajado y 11/24 de la base sin cambios; superar al control barajado no es criterio suficiente.
- Evaluacion limitada a 8 tareas seleccionadas con initial states 3-5 y semilla 17; no hay evidencia de generalizacion a otras tareas, semillas o entornos.
- Ausencia de observaciones de camara original, etiquetas de accion de experto y etiquetas de estado de objeto del simulador en el entrenamiento del auxiliar, lo que limita la supervision disponible.
- No hay informacion sobre sesgos, pero al ser un modelo de robotica entrenado sobre rollouts de una politica concreta, hereda las limitaciones y sesgos de comportamiento de esa politica.
- Riesgo de alucinacion en el sentido de predicciones de desplazamiento no verificadas: el coeficiente se calibro una sola vez sobre cuatro lotes y no se reajusto a los gradientes del rollout.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Contexto e idiomas no disponibles, y sin soporte documentado de tool calling, agentes o razonamiento multi-paso.
- Los checkpoints nativos FP32 de optimizador y EMA no se incluyen en el repositorio; solo se publican los parametros de inferencia en BF16, lo que impide reanudar el entrenamiento exactamente desde este artefacto.
- La model card advierte que la inferencia permanece sin cambios y que no se usa prompt de posicion en las acciones desplegadas, por lo que el auxiliar no debe esperarse que afecte a la politica en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-rollout-position-difference-20261015-aligned
- Codigo de entrenamiento (commit 8e18877e): https://github.com/Donghyun1228/vla_adaptation
- Dataset de rollouts: https://huggingface.co/datasets/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015 (revision 34225b034da7291af2b6d7f44e3646ff52ab60f5)
- Modelo relacionado (base con IDM solo-vision): https://huggingface.co/Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010
- Modelo relacionado (continuacion IDM): https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-continue
- π0.5 base en ModelScope: https://www.modelscope.cn/models/lerobot/pi05_libero_base
- π0.5 afinado en LIBERO en ModelScope: https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned
- Paper de π0.5 (Physical Intelligence): https://www.pi.website/download/pi05.pdf
