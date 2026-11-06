# Donghyun1228/pi05-libero-lape-scale-n10000-yaw30-lam0p05-lr5e-5-10000-20261103

## Resumen

π0.5 LIBERO yaw30 es un checkpoint de investigación publicado por el usuario Donghyun1228 en Hugging Face, derivado del modelo de visión-lenguaje-acción (VLA) π0.5 de Physical Intelligence. No se trata de un modelo de lenguaje general, sino de un policy de robótica entrenado para control de manipulación en el benchmark LIBERO, un conjunto de tareas de manipulación robótica simuladas en MuJoCo. El checkpoint forma parte de un estudio de escalado de datos denominado LAPE dentro del repositorio `Donghyun1228/vla_adaptation`.

El modelo parte de un checkpoint fuente del mismo autor (`pi05-libero-lape-scale-source-n10000-10000-20261103`, paso 9999) y aplica una adaptación específica sobre 10.000 fotogramas de sondeo con una rotación de muñeca de 30 grados (yaw30). El entrenamiento utiliza un optimizador ConflictAnchorAdamW con ponderación de conflictos y coeficiente 0,05, con el LLM congelado y una pérdida IDM que excluye el índice de pinza 6.

Su relevancia es acotada y experimental: documenta un punto concreto de una curva de escalado de datos para adaptación de políticas VLA, con un resultado declarado de 90,95 % de éxito en LIBERO (1819/2000). El repositorio ocupa 23,7 GB y se distribuye bajo licencia Apache 2.0, pero no cuenta con descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π0.5; no se detalla la topología interna en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en formato nativo de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | params de entrenamiento (train_state) y assets de normalización; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint se inicializa desde el paso 9999 del modelo fuente `pi05-libero-lape-scale-source-n10000-10000-20261103`, correspondiente al mismo tamaño de datos. Sobre esa base se realiza una adaptación *target-only mean-IDM* sobre 10.000 fotogramas de sondeo yaw30, con 10.000 actualizaciones. El LLM del modelo permanece congelado durante todo el proceso, de modo que la adaptación afecta únicamente a los componentes de acción/visión según la configuración descrita.

El optimizador empleado es ConflictAnchorAdamW con ponderación `conflict` y coeficiente 0,05, con un LR pico de 5e-5 constante tras el calentamiento. Se utiliza un prior anclado (`prior/lape_k10/prior.json`) y se excluye el índice de pinza 6 de la pérdida IDM. El preset de entrenamiento es `pi05_libero_conflict_anchor_yaw_adapt`, ejecutado por el entrenador externo del repositorio `Donghyun1228/vla_adaptation` (driver `a7a183e5`); el `run/spec.json` contiene el argv completo. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset más allá de los 10.000 fotogramas yaw30, ni si hubo RLHF o DPO.

## Capacidades

- Control de manipulación robótica en entornos LIBERO simulados en MuJoCo.
- Política de visión-lenguaje-acción: procesa observaciones visuales (incluida cámara de muñeca) y produce acciones motoras.
- Adaptación específica a rotación de muñeca de 30 grados (yaw30) sobre el checkpoint fuente.
- Evaluación declarada con la política `policy_source_wrist/`, que usa la torre de visión del modelo fuente para la cámara de muñeca.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en escalado de datos para VLA: el checkpoint sirve como punto de la curva LAPE para estudiar cómo varía el rendimiento con el tamaño de datos de adaptación (10.000 fotogramas en este caso).
- Reproducción de experimentos LIBERO: permite replicar la evaluación declarada de 1819/2000 con semilla de entorno 7 y MuJoCo 3.2.3.
- Estudio de adaptación con LLM congelado: útil para analizar el efecto de adaptar solo componentes de acción/visión manteniendo fijo el backbone lingüístico.
- Análisis de optimizadores con anclaje de conflictos: el uso de ConflictAnchorAdamW con coeficiente 0,05 y prior `lape_k10` permite comparar dinámicas de entrenamiento frente a AdamW estándar.
- Ablación de la pérdida IDM: la exclusión del índice de pinza 6 facilita estudiar el impacto de la pinza en la adaptación de la política.
- Base para adaptaciones posteriores: al estar bajo Apache 2.0 y partir de un checkpoint fuente identificado, puede reutilizarse como inicialización en nuevos experimentos de adaptación robótica.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| LIBERO (éxito) | 1819/2000 = 90,95 % | 500 por suite, semilla de entorno 7, MuJoCo 3.2.3, política `policy_source_wrist/` |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 23,7 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos y el estado de entrenamiento.
- GPU recomendadas: no disponible en la model card.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio sugiere que no cabe en GPUs de gama baja sin cuantización, pero no se documenta el proceso.
- Opciones de despliegue: no se especifican vLLM, llama.cpp, Ollama ni TGI; el modelo se enmarca en el ecosistema openpi/robotics y requiere el pipeline de evaluación del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw30 (este) | no disponible | no disponible | 90,95 % (1819/2000) | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 LIBERO fuente (`pi05-libero-lape-scale-source-n10000-10000-20261103`) | no disponible | no disponible | no disponible en esta ficha | Apache 2.0 | Hugging Face, mismo autor |
| Otros checkpoints LIBERO de π0.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación sin descargas ni validación comunitaria; no apto para producción sin evaluación propia.
- Entrenado exclusivamente sobre fotogramas yaw30 de LIBERO; el rendimiento fuera de esa distribución (otras rotaciones, entornos reales) no está garantizado.
- El resultado de 90,95 % corresponde a una configuración concreta (semilla 7, MuJoCo 3.2.3, política `policy_source_wrist/`) y puede no transferirse a otras condiciones.
- El LLM está congelado durante la adaptación, lo que limita cambios en la comprensión lingüística del modelo.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe; al ser un policy robótico, estos riesgos se manifiestan como fallos de manipulación más que como errores textuales.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento impide verificar la procedencia y licencias de los datos.
- El tamaño del repositorio (23,7 GB) incluye `train_state` completo, no solo los pesos de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-n10000-yaw30-lam0p05-lr5e-5-10000-20261103
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n10000-10000-20261103
- Repositorio de código del autor: `Donghyun1228/vla_adaptation` (driver `a7a183e5`), referenciado en la model card
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales.
