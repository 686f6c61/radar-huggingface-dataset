# Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-continue

## Resumen

Este repositorio de HuggingFace contiene un checkpoint de investigación para robótica publicado por el usuario Donghyun1228 con el identificador `pi05-libero-view-large-idm-coverage-20261015-continue`. Se presenta como una continuación de 200 actualizaciones de entrenamiento sobre una línea base previa ya aceptada (denominada `raw999`), en la que se restauran el optimizador Adam y el EMA originales y se aplica un escalado posterior a Adam con factores `vision1` y `expert0.1`. Los tags del repositorio (`robotics`, `libero`, `pi05`) lo sitúan en el ámbito de las políticas de manipulación robótica evaluadas en el benchmark LIBERO, pero la model card no describe la arquitectura interna ni el número de parámetros.

El objetivo declarado del experimento es comparar la cobertura de un módulo IDM (modelo de dinámica inversa, por sus siglas en inglés) bajo tres brazos de pérdida: continuar con el IDM antiguo, añadir una sonda IDM antigua con peso 0,1, o añadir un IDM de auto-rollout del objetivo con peso 0,1. El autor es explícito al señalar que no reclama ningún beneficio único atribuible al rollout ni una mejora general en las 40 tareas, y que la evaluación es una pantalla reducida sobre tareas difíciles seleccionadas, no una reproducción del histórico 243/400.

Su relevancia actual es sobre todo metodológica: documenta de forma transparente un resultado de cobertura acotada (dos brazos con resultados idénticos y ninguna tarea difícil resuelta) y publica los pesos resultantes en BF16 junto con el dataset de rollout empleado, lo que permite reproducir o refutar el experimento. No es un modelo listo para producción ni un lanzamiento de nueva familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags indican `pi05`; la model card no detalla la arquitectura) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos exportados en BF16 (parámetros no-EMA en crudo). El estado nativo del optimizador y del EMA se conserva en FP32 por separado y no se incluye en el repositorio. No se declaran cuantizaciones de 8 o 4 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible con detalle; el repositorio ocupa 5,9 GB y contiene pesos en BF16 más 74 hojas de parámetros del codificador de muñeca congelado y activos de normalización |
| Tamano del repositorio | 5,9 GB |
| Pipeline declarado | `robotics` |
| Configuracion de politica | `pi05_libero_source_free_split_vision_idm` |
| Entorno de evaluacion | MuJoCo 3.2.3, `target view large` |
| Fecha de creacion / actualizacion | 14 de octubre de 2026 (misma fecha en ambos casos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo: no se indica si se trata de un transformer, de una mezcla de expertos, de un modelo híbrido ni de una variante con atención lineal. Por los tags (`pi05`, `libero`) y por la nomenclatura del repositorio, se trata de un modelo de visión-lenguaje-acción orientado a manipulación robótica, pero la información proporcionada no confirma la familia concreta, el número de parámetros, la composición del dataset ni la existencia de fases de RLHF o DPO.

El entrenamiento descrito es un ajuste incremental: 200 actualizaciones adicionales, con tamaño de lote 32 por pérdida, partiendo de una línea base ya aceptada (`raw999`) con learning rate manual. Se restauran el Adam y el EMA originales y se aplica un escalado posterior a Adam de `vision1` y `expert0.1`. El experimento no utiliza etiquetas de experto ni imágenes de entrenamiento de la cámara original. Los brazos comparados son tres: continuación del IDM antiguo, IDM antiguo más 0,1 de sonda IDM antigua adicional, e IDM antiguo más 0,1 de IDM de auto-rollout del objetivo. La exportación publicada contiene únicamente los parámetros no-EMA convertidos a BF16, compuestos con el codificador de muñeca congelado de origen (74 hojas de parámetros) y los activos de normalización. El código de entrenamiento corresponde al commit `7ac84b93` del repositorio `vla_adaptation`.

## Capacidades

- Control de políticas robóticas de manipulación en el entorno de simulación LIBERO (MuJoCo 3.2.3), con observación de vista de objetivo en resolución grande (`target view large`).
- Ejecución de tareas de manipulación en ocho tareas seleccionadas, con tres estados iniciales por tarea (índices 3 a 5) y semilla 17.
- Composición con un codificador de muñeca congelado procedente del modelo de origen, además de los activos de normalización necesarios para la inferencia.
- Generación de texto, razonamiento, código, matemáticas, visión general, tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo de pensamiento, audio, decodificación especulativa): no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de adaptación de políticas VLA: el repositorio incluye los pesos en BF16 y la configuración de política `pi05_libero_source_free_split_vision_idm`, lo que permite repetir la pantalla de evaluación sobre las ocho tareas seleccionadas con MuJoCo 3.2.3 y la semilla 17.
- Investigación sobre modelos de dinámica inversa (IDM) en aprendizaje por imitación: los tres brazos de pérdida descritos permiten estudiar si una sonda IDM adicional o un IDM de auto-rollout aportan cobertura nueva sobre el IDM de partida.
- Estudio de métodos de auto-rollout y datos sintéticos en robótica: el dataset de rollout asociado (`libero-view-large-self-rollout-idm-24ep-20261015`) sirve como material para analizar el efecto de datos generados por el propio agente.
- Auditoría de resultados negativos y de baja cobertura: el modelo es útil como caso documentado en el que dos brazos con pérdidas adicionales producen exactamente los mismos resultados de éxito y fracaso, y en el que ninguna de las cuatro tareas difíciles seleccionadas se resuelve.
- Análisis de compromisos entre precisión y estado del entrenamiento: al publicarse solo los parámetros no-EMA en BF16 mientras el estado nativo FP32 de optimizador y EMA se conserva aparte, el checkpoint permite estudiar el efecto de exportar pesos no promediados.
- Punto de partida para continuaciones de entrenamiento: al tratarse de una continuación de 200 actualizaciones sobre `raw999`, puede emplearse como inicialización para experimentos posteriores con mayor presupuesto de cómputo.
- Docencia y formación en evaluación de modelos de robótica: sirve como ejemplo práctico de una pantalla de evaluación pequeña, con tareas, estados iniciales y semilla explícitos, frente a reproducciones completas de benchmark.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden a la pantalla reducida de tareas descrita por el autor (ocho tareas seleccionadas, tres estados iniciales por tarea, semilla 17, MuJoCo 3.2.3, `target view large`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible.

| Configuracion | Exitos en la pantalla (sobre 24) | Tareas dificiles seleccionadas |
|---|---|---|
| `accepted` (linea base aceptada) | 11/24 | 0/3 |
| `continue` (continuacion del IDM antiguo) | 11/24 | 0/3 |
| `extra-probe` (IDM antiguo + 0,1 sonda IDM antigua) | 12/24 | 0/3 |
| `rollout` (IDM antiguo + 0,1 IDM de auto-rollout del objetivo) | 12/24 | 0/3 |

El autor indica que los dos brazos con pérdida adicional (`extra-probe` y `rollout`) obtienen resultados de éxito y fracaso idénticos entre sí, que no se reclama ningún beneficio único del rollout ni una mejora amplia en las 40 tareas, y que esta pantalla no es una reproducción del histórico 243/400.

## Requisitos de hardware

- Tamano de los pesos: el repositorio ocupa 5,9 GB e incluye los parámetros no-EMA en BF16 más el codificador de muñeca congelado y los activos de normalización. El estado FP32 de optimizador y EMA no se incluye.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa derivada del tamaño del repositorio, los pesos en BF16 requieren del orden de 6 GB de memoria, a los que hay que sumar el resto del grafo de inferencia y los búferes de activaciones, no cuantificados en la información disponible.
- GPU recomendadas: no disponible. No se especifica ningún modelo de GPU en la model card.
- Viabilidad en GPU de consumo: no confirmada. Por tamaño de pesos (5,9 GB en BF16) sería compatible con tarjetas de gama alta con 12 GB o más de VRAM, pero esta afirmación es una estimación y no está verificada por el autor.
- Opciones de despliegue: no se declara compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además no son los entornos típicos de una política robótica. La evaluación se realiza con MuJoCo 3.2.3 y la configuración de política `pi05_libero_source_free_split_vision_idm`.
- Latencia y throughput: no disponible.
- Requisitos de entrenamiento: se mencionan 200 actualizaciones con tamaño de lote 32 por pérdida, sin datos sobre tipo de aceleradores, tiempo total ni consumo energético.

## Comparativa con modelos similares

No se proporcionan en la información disponible modelos comparables con parámetros, contexto, licencia o rendimiento verificables. La única referencia cuantitativa comparable dentro del mismo trabajo es el histórico 243/400 citado por el autor, que no se reproduce en este experimento.

| Modelo | Parametros | Contexto | Resultado de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05-libero-view-large-idm-coverage-20261015-continue` | No disponible | No disponible | 11/24 en pantalla reducida (brazo `continue`); 0/3 en tareas dificiles | No disponible | Repositorio HuggingFace publico, 5,9 GB |
| Historico del propio autor (`243/400`) | No disponible | No disponible | 243/400, no reproducido en esta pantalla | No disponible | No disponible |
| Otros modelos de la familia `pi05` o VLA comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resultado limitado y seleccionado: la evaluación se restringe a ocho tareas elegidas, tres estados iniciales por tarea (índices 3 a 5) y una única semilla (17). No es una reproducción del baseline histórico de 243/400 y no permite extrapolar rendimiento general.
- Ausencia de mejora demostrada: las cuatro tareas difíciles seleccionadas permanecen en 0/3 en todos los brazos, y los dos brazos con pérdida adicional obtienen resultados idénticos entre sí.
- Pesos no promediados: el repositorio publica parámetros no-EMA en BF16, no los pesos del EMA. El estado nativo FP32 de optimizador y EMA se conserva por separado y no se distribuye, por lo que el checkpoint no reproduce exactamente la configuración de entrenamiento.
- Licencia no disponible: no se especifica licencia alguna, lo que impide determinar si el uso comercial está permitido. Cualquier uso en producción requiere aclarar este punto con el autor.
- Idiomas y contexto: no se declara ningún idioma soportado ni longitud de contexto, por lo que no puede evaluarse su comportamiento multilingüe ni con entradas largas.
- Sesgos conocidos: no disponible en la información proporcionada. No hay análisis de sesgo demográfico, visual o de dominio.
- Riesgo de alucinación: no disponible en la información proporcionada; al tratarse de un modelo de acción robótica, los modos de fallo relevantes son de ejecución física y no de generación de texto.
- Dependencia de simulación: la evaluación se realiza en MuJoCo 3.2.3 sobre LIBERO. No se aportan datos de transferencia a robot real ni de robustez ante variaciones de iluminación, cámara o dinámica.
- Procedencia del dato: toda la información procede de la model card del autor. No hay validación independiente, ni paper asociado, ni revisión por pares.
- Trazabilidad: se referencia un commit concreto del código de entrenamiento (`7ac84b93`) y una revisión concreta del dataset de rollout (`34225b034da7291af2b6d7f44e3646ff52ab60f5`), lo que facilita la reproducción pero también fija el experimento a esas versiones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-continue
- Codigo de entrenamiento (commit `7ac84b93`): https://github.com/Donghyun1228/vla_adaptation
- Dataset de rollout: https://huggingface.co/datasets/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015 (revision `34225b034da7291af2b6d7f44e3646ff52ab60f5`)
- Paper, blog, demo o documentacion adicional: no disponible en la informacion proporcionada.
