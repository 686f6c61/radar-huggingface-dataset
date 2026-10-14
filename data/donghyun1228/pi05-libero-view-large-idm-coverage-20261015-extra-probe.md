# Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-extra-probe

## Resumen

Este repositorio contiene un checkpoint de política robótica resultante de un experimento de adaptación sobre el *benchmark* LIBERO, publicado por el usuario Donghyun1228. No se trata de un modelo de lenguaje ni de un modelo multimodal de propósito general, sino de un artefacto de investigación: una exportación de pesos BF16 (sin estado EMA) pensada para inferencia y para reproducir un *screen* comparativo de cobertura de IDM (*inverse dynamics model*). El tamaño del repositorio es de 5,9 GB y el pipeline declarado es `robotics`.

El contenido de la model card describe una comparación acotada de tres brazos de entrenamiento, todos ellos partiendo de la misma base (`raw999`, vista de cámara *large*, Adam/EMA originales restaurados, escalado *post-Adam* vision1/expert0.1) y con 200 actualizaciones de continuación. Los brazos son: continuar con el oldIDM; oldIDM más 0,1 de un IDM de sonda adicional; y oldIDM más 0,1 de un IDM de auto-*rollout* sobre la vista objetivo. La red se compone con un codificador de muñeca congelado (74 hojas de parámetros) y activos de normalización.

La relevancia de esta ficha es limitada y conviene ser explícito: se trata de una ablación de tareas seleccionadas, no de una reproducción del *baseline* histórico 243/400, y el propio autor declara que no se reclama ninguna mejora amplia ni un beneficio único atribuible al *rollout*. Las etiquetas `pi05` y el nombre del config de política (`pi05_libero_source_free_split_vision_idm`) apuntan a la familia pi0.5, si bien la model card no confirma explícitamente esa ascendencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `pi05`; política visomotora con codificador de muñeca congelado y activos de normalización) |
| Parametros totales | no disponible (repositorio de 5,9 GB; si el grueso fueran pesos BF16, equivaldría a del orden de 3 000 millones de parámetros, estimación no confirmada por el autor) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exportación en BF16; no se documentan GGUF, INT8, INT4 ni otras |
| Idiomas soportados | no disponible (modelo de control robótico; no se documenta interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se indica que son parámetros *raw* no EMA convertidos a BF16; el contenedor concreto no se especifica) |
| Tamaño del repositorio | 5,9 GB |
| Config de politica | `pi05_libero_source_free_split_vision_idm` |
| Dataset de rollout asociado | `Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015`, revisión `34225b034da7291af2b6d7f44e3646ff52ab60f5` |
| Código de entrenamiento | commit `7ac84b93` de `github.com/Donghyun1228/vla_adaptation` |
| Simulador de evaluación | MuJoCo 3.2.3 |
| Pipeline declarado | robotics |
| Fecha de creación | 2026-10-14 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia etiquetada como `pi05` y de su naturaleza de política visomotora para manipulación. Se sabe que la exportación está compuesta por los parámetros *raw* no EMA convertidos a BF16 y por un codificador de muñeca congelado («frozen source wrist encoder», 74 hojas de parámetros) junto con activos de normalización. El estado nativo del optimizador y del EMA en FP32 se conserva por separado y no forma parte de esta exportación, lo que implica que el checkpoint no permite reanudar el entrenamiento tal cual, solo inferencia o evaluación.

El procedimiento de entrenamiento descrito es una continuación de 200 actualizaciones desde el *baseline* aceptado `raw999` (vista *large*, LR manual), con Adam/EMA originales restaurados y escalado *post-Adam* vision1/expert0.1. Se comparan tres brazos con un *batch* de 32 por pérdida y sin etiquetas de experto ni imágenes de la cámara original. Los brazos son: continuación del oldIDM, oldIDM más 0,1 de un IDM de sonda adicional, y oldIDM más 0,1 de un IDM de auto-*rollout* sobre la vista objetivo. El *dataset* de *rollout* empleado es una colección de 24 épocas del propio autor. No se documentan composición del *dataset* base, número total de *tokens* ni técnicas de RLHF/DPO, que en este dominio no resultan de aplicación directa.

## Capacidades

- Control visomotor para tareas de manipulación robótica en el *benchmark* LIBERO, con observaciones de vista objetivo (*target view large*) y de muñeca.
- Adaptación *source-free*: el entrenamiento descrito no emplea etiquetas de experto ni imágenes de la cámara original, lo que sitúa al modelo en el ámbito de la adaptación de políticas sin acceso a la distribución fuente.
- Aprendizaje por IDM (*inverse dynamics model*): el modelo se entrena con objetivos derivados de dinámica inversa, incluidos auto-*rollouts* generados por la propia política.
- Composición modular: se combina con un codificador de muñeca congelado y con activos de normalización externos.
- Ejecución en simulación: evaluado sobre MuJoCo 3.2.3 con ocho tareas seleccionadas y estados iniciales 3 a 5, semilla 17.
- *Tool calling* / *function calling*: no disponible; no se documenta ninguna interfaz de ese tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión general, audio o generación de texto: no disponible y, por el tipo de modelo, no aplicable.

## Casos de uso

- Reproducción de la ablación de cobertura IDM: descargar el checkpoint y el *dataset* de *rollout* asociado (revisión `34225b034da7291af2b6d7f44e3646ff52ab60f5`) para replicar el *screen* de cuatro brazos con MuJoCo 3.2.3, semilla 17 y los ocho estados iniciales descritos. Es el uso principal y explícito del artefacto.
- Evaluación comparativa en LIBERO: emplear el config `pi05_libero_source_free_split_vision_idm` para lanzar evaluaciones sobre tareas de manipulación y contrastar los resultados con la base `raw999` en las mismas condiciones (24 episodios por brazo).
- Investigación en adaptación *source-free*: servir como punto de partida para estudiar hasta qué punto los objetivos de dinámica inversa generados por la propia política aportan señal útil cuando no hay acceso a etiquetas de experto ni a la cámara original.
- Estudio de auto-*rollout* como fuente de datos: analizar si las trayectorias autogeneradas (24 épocas) introducen sesgos de distribución, dado que los dos brazos con pérdida adicional obtuvieron resultados idénticos y ninguno superó de forma clara al *baseline*.
- Auditoría de checkpoints de investigación: verificar la diferencia entre pesos *raw* y pesos EMA, dado que esta exportación contiene solo los primeros en BF16, y comprobar el impacto en la política resultante.
- Integración en una *pipeline* interna de evaluación continua: el tamaño de 5,9 GB permite almacenar y versionar el checkpoint con facilidad, de modo que se puede incluir en un banco de pruebas de políticas robóticas junto con otras variantes del mismo autor.
- Formación y divulgación técnica: ilustrar un caso real de experimento negativo con reclamo acotado, útil como ejemplo metodológico de cómo reportar *screens* de tareas seleccionadas frente a reproducciones completas de un *baseline*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros), que además no aplican a una política robótica. La model card sí reporta el resultado de un *screen* de tareas seleccionadas:

| Brazo | Resultado (de 24) | Observaciones |
|---|---|---|
| Base aceptada (`accepted`) | 11/24 | Referencia declarada en el *matched screen* |
| Continuación oldIDM (`continue`) | 11/24 | Idéntico a la base aceptada |
| oldIDM + 0,1 IDM de sonda adicional (`extra-probe`) | 12/24 | Mismos aciertos y fallos que el brazo de *rollout* |
| oldIDM + 0,1 IDM de auto-*rollout* objetivo (`rollout`) | 12/24 | Mismos aciertos y fallos que `extra-probe` |

Condiciones declaradas: ocho tareas seleccionadas, tres estados iniciales (3 a 5) por tarea, semilla 17, MuJoCo 3.2.3, vista objetivo *large*. Cuatro tareas difíciles seleccionadas permanecen en 0/3 en todos los brazos. El autor indica explícitamente que se trata de un *screen* pequeño de tareas seleccionadas y no de la reproducción del *baseline* histórico 243/400, y que no se reclama ningún beneficio único del *rollout* ni una mejora amplia sobre las 40 tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con un repositorio de 5,9 GB en BF16, los pesos deberían ocupar del orden de 6 GB si todo el repositorio fuese pesos, más el estado de activaciones y el codificador de muñeca congelado; esta cifra es una estimación derivada del tamaño del repositorio, no un dato del autor.
- GPU recomendadas: no disponible. No se documentan requisitos mínimos ni GPU de referencia.
- Viabilidad en GPU de consumo: probable pero no confirmada. Un checkpoint BF16 de ese tamaño cabría previsiblemente en tarjetas con 12-16 GB de VRAM, y presumiblemente también en 8-10 GB si se recalcula o se divide el modelo, aunque no hay confirmación del autor.
- Opciones de despliegue: no disponible. No se documentan vLLM, llama.cpp, Ollama ni TGI; al ser una política de control robótico y no un modelo de generación de texto, esas herramientas no son aplicables de forma directa. La evaluación descrita se realiza en MuJoCo 3.2.3 y el entrenamiento se apoya en el código del repositorio `vla_adaptation` (commit `7ac84b93`).
- Latencia y *throughput*: no disponible. No se publican mediciones de tiempo de inferencia, frecuencia de control ni pasos por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la información proporcionada para este checkpoint. La tabla recoge únicamente lo que puede afirmarse sin inventar cifras:

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`pi05-libero-view-large-idm-coverage-20261015-extra-probe`) | Política visomotora para LIBERO | no disponible | no disponible | no disponible | Repositorio público en HuggingFace, 0 descargas y 0 *likes* en el momento de la consulta |
| Familia pi0.5 | Política visomotora (VLA) | no disponible | no disponible | no disponible | Referencia por etiqueta `pi05`; superioridad o equivalencia no confirmadas |
| OpenVLA y otras políticas VLA públicas | Política visomotora (VLA) | no disponible | no disponible | no disponible | Alternativas de la misma categoría, sin comparación numérica disponible en esta información |

No hay resultados de rendimiento comparables publicados en la información disponible.

## Limitaciones y advertencias

- Alcance experimental muy acotado: el autor indica explícitamente que se trata de un *screen* pequeño de tareas seleccionadas, no de la reproducción del *baseline* histórico 243/400.
- Resultado nulo: los dos brazos con pérdida adicional obtienen exactamente los mismos aciertos y fallos, y las cuatro tareas difíciles seleccionadas se quedan en 0/3 en todos los brazos. No se demuestra beneficio del auto-*rollout*.
- Estado del optimizador no incluido: la exportación contiene parámetros *raw* no EMA; el estado nativo FP32 de optimizador y EMA se conserva aparte, por lo que este repositorio no sirve para reanudar el entrenamiento.
- Dependencia de componentes externos: requiere el codificador de muñeca congelado y los activos de normalización para funcionar correctamente; usar solo los pesos del repositorio puede producir una política inválida.
- Licencia no disponible: sin licencia declarada no puede asumirse ningún permiso de uso comercial. Cualquier despliegue en producción requiere aclarar antes las condiciones con el autor.
- Idiomas y sesgos: no disponibles. Al no ser un modelo de lenguaje, las categorías habituales de sesgo lingüístico y alucinación textual no aplican; el riesgo análogo es el fallo de política y el sobreajuste a las tareas e estados iniciales evaluados.
- Reproducibilidad frágil: los resultados dependen de MuJoCo 3.2.3, de la semilla 17 y de la selección concreta de ocho tareas y estados iniciales 3 a 5.
- Adopción nula: 0 descargas y 0 *likes* en el momento de la consulta, sin validación externa conocida.
- Riesgo de interpretación: el nombre del repositorio y el tag `pi05` pueden llevar a confundir este artefacto con un modelo publicado por el equipo de pi0.5; no hay confirmación de que lo sea ni de que esté respaldado por ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-extra-probe
- Perfil del autor en HuggingFace: https://huggingface.co/Donghyun1228
- Dataset de *rollout* asociado: https://huggingface.co/datasets/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015
- Revisión concreta del dataset de *rollout*: https://huggingface.co/datasets/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015/tree/34225b034da7291af2b6d7f44e3646ff52ab60f5
- Código de entrenamiento: https://github.com/Donghyun1228/vla_adaptation (commit `7ac84b93`)
- *Benchmark* LIBERO: no se proporciona enlace en la información disponible
- *Paper* o blog técnico: no disponible
