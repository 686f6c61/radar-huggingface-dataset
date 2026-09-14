# isldgist/pi05-panda-weightgen-two-teacher-inits-ee6

## Resumen

Este repositorio contiene dos checkpoints de una política robótica de tipo vision-language-action (VLA) construida sobre pi0.5 y orientada a un brazo Franka Panda. La particularidad no está en el modelo base, sino en el mecanismo de generación de pesos: en lugar de publicar un ajuste fino convencional, se publica un HyperNetwork que produce actualizaciones de rango 8 para el decoder de acción completo de pi0.5, condicionadas por el contexto del VLM de Panda y por un vector de capacidades del simulador de 49 dimensiones. El resultado se materializa como W_panda = W_joint_19999 + Delta_W_panda, donde W_joint_19999 es un checkpoint conjunto entrenado sobre Sawyer, IIWA y UR5e.

El autor distingue las dos variantes únicamente por la inicialización del HyperNetwork antes de una etapa de meta-entrenamiento conductual zero-shot de 10.000 actualizaciones: una parte del checkpoint conjunto en la actualización 19.999 (con 2.000 actualizaciones de profesor) y otra del checkpoint oficial OpenPI pi05_base (con 5.000 actualizaciones de profesor). Ambos checkpoints son task-agnostic y los comparten las tareas square, threading, stack y stack_three de MimicGen, con una entrada de estado de pose de efector final de 6 dimensiones y una salida OSC_POSE de 7 dimensiones.

La relevancia es doble: por un lado, es un ejemplo práctico de transferencia entre morfologías robóticas mediante deltas de bajo rango en lugar de reentrenamiento completo; por otro, permite estudiar experimentalmente cómo afecta la inicialización del profesor al meta-aprendizaje zero-shot en políticas VLA. El repositorio ocupa 21,8 GB y se distribuye bajo licencia Apache 2.0, con pesos en formato JAX y sin estado de optimizador. No se han publicado resultados de benchmarks ni métricas de éxito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5: codificador VLM (visión y prefijo/texto) heredado sin cambios del checkpoint conjunto, más un experto de acción cuyo decoder se modifica mediante un HyperNetwork generador de pesos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuyen pesos en el formato nativo de inferencia de JAX, sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible (el modelo consume contexto textual a través del codificador de prefijo, pero el autor no documenta idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Parámetros de inferencia en formato nativo de JAX (`params`), más `assets` de normalización, `complete.json` y `weightgen_metadata.json`. No se incluyen safetensors, GGUF ni estado del optimizador |
| Tamano del repositorio | 21,8 GB |
| Entrada de estado | Pose de efector final de 6 dimensiones |
| Salida de acción | OSC_POSE de 7 dimensiones |
| Tareas cubiertas | square, threading, stack, stack_three (MimicGen), con pesos compartidos y task-agnostic |
| Variantes incluidas | `joint19999_teacher_init_2k/panda` y `official_pi05_base_teacher_init_5k/panda` |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de pi0.5: un backbone de tipo vision-language model que procesa observaciones visuales y contexto textual (codificador de prefijo/texto) y un experto de acción que genera las acciones de manipulación. En este repositorio, el codificador de visión y el de prefijo/texto se heredan sin modificar desde el checkpoint conjunto Sawyer + IIWA + UR5e, de modo que el entrenamiento se concentra exclusivamente en la parte de acción. Sobre esa base, un HyperNetwork recibe el contexto del VLM de Panda y un vector de capacidades del simulador de 49 dimensiones, y predice factores de rango 8 para las matrices del decoder de acción: atención del experto de acción, MLP, AdaRMS, entrada y salida de acción y time-MLP, además de deltas de bias directos donde corresponde. La composición final es aditiva sobre el checkpoint base, y las estadísticas de normalización se comparten con el checkpoint conjunto.

El procedimiento de entrenamiento documentado consta de dos etapas: primero se entrena un profesor (2.000 actualizaciones en la variante anclada al checkpoint conjunto en la actualización 19.999; 5.000 actualizaciones en la variante anclada a OpenPI pi05_base), y después se ejecuta una etapa de meta-entrenamiento conductual zero-shot de 10.000 actualizaciones del HyperNetwork. El autor no detalla la composición del dataset, el número de tokens ni si se emplearon RLHF, DPO u otras técnicas de alineación. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones de manipulación robótica en espacio OSC_POSE (7 dimensiones) a partir de una pose de efector final de 6 dimensiones y observaciones visuales.
- Ejecución zero-shot y task-agnostic: un mismo conjunto de pesos atiende las tareas square, threading, stack y stack_three.
- Generación de pesos en tiempo de inferencia: el HyperNetwork produce actualizaciones de rango 8 para atención, MLP, AdaRMS, entrada/salida de acción y time-MLP del decoder de acción, además de deltas de bias.
- Condicionamiento multimodal: la generación del delta depende del contexto del VLM de Panda y de un vector de capacidades del simulador de 49 dimensiones.
- Transferencia entre morfologías: adapta un checkpoint entrenado en Sawyer, IIWA y UR5e al brazo Franka Panda sin reentrenar los codificadores de visión ni de texto.
- Comprensión de contexto textual a través del codificador de prefijo heredado de pi0.5 (alcance no especificado por el autor).
- No dispone de tool calling ni function calling: es una política robótica, no un modelo de lenguaje de propósito general.
- No se documentan capacidades de razonamiento multi-paso, modo de pensamiento explícito, audio ni generación de imágenes.
- No se documentan capacidades multilingües.

## Casos de uso

- Manipulación zero-shot en simulación: desplegar el checkpoint sobre un Panda en MimicGen para resolver square, threading, stack y stack_three sin ajuste específico por tarea, aprovechando que los pesos son compartidos y task-agnostic.
- Estudio de transferencia entre robots: analizar cómo un delta de rango 8 sobre un checkpoint conjunto Sawyer + IIWA + UR5e permite operar una morfología distinta (Panda), midiendo qué parte del comportamiento se conserva y cuál se adapta.
- Investigación en generación de pesos: comparar las dos variantes (`teacher_init_2k` frente a `teacher_init_5k`) para aislar el efecto de la inicialización del profesor en una etapa de meta-entrenamiento zero-shot de 10.000 actualizaciones.
- Línea base reproducible para nuevas políticas VLA: las cuatro tareas de MimicGen son un conjunto de evaluación estándar, por lo que el checkpoint sirve como punto de comparación para métodos alternativos de adaptación.
- Prototipado rápido de políticas sobre hardware distinto: al generarse únicamente factores de rango 8 más deltas de bias, el delta es compacto y puede regenerarse y almacenarse con coste reducido en comparación con un ajuste fino completo.
- Evaluación automatizada de políticas en pipelines de CI para robótica: integrar el modelo en un bucle de simulación que ejecute las cuatro tareas y registre tasas de éxito por episodio.
- Docencia y divulgación técnica: ilustrar de forma práctica la combinación de VLA, hiperredes y adaptación de bajo rango sobre un caso real con pesos abiertos.
- Experimentación con condicionamiento por capacidades: el vector de 49 dimensiones permite estudiar cómo varía la política generada al modificar la descripción de capacidades del simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tasas de éxito, métricas de simulación ni comparaciones numéricas para las tareas square, threading, stack o stack_three, ni tampoco resultados de benchmarks generales de VLA.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 21,8 GB e incluye dos checkpoints con sus parámetros de inferencia, assets de normalización y metadatos.
- Memoria en inferencia: al materializarse como W_panda = W_joint_19999 + Delta_W_panda, es necesario mantener en memoria tanto el checkpoint conjunto base como el delta generado. No se han publicado cifras oficiales de VRAM; no disponible.
- GPU recomendadas: no disponible. El autor no documenta GPU objetivo ni perfil de despliegue.
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse si cabe en tarjetas tipo RTX 4090 sin conocer el número de parámetros y la precisión de inferencia.
- Opciones de despliegue: el modelo usa JAX, por lo que no es compatible con llama.cpp, Ollama, TGI ni servings orientados a GGUF. El despliegue pasa por la pila de inferencia de OpenPI o por un servidor JAX propio que reconstruya los pesos y ejecute el experto de acción.
- Latencia y throughput: no disponible. Al ser una política de control robótico, la frecuencia de control depende del entorno de simulación o del robot, no de un parámetro publicado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0.5 Panda WeightGen (dos variantes teacher-init) | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | pesos JAX en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| OpenPI `pi05_base` (checkpoint oficial de referencia) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | público a través de OpenPI |
| Checkpoint conjunto Sawyer + IIWA + UR5e (update 19999) | no disponible | no disponible | no disponible | no disponible en esta ficha | referenciado como base, no como release independiente en esta ficha |
| Otras políticas VLA open source (por ejemplo OpenVLA, Octo, GR00T N1) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | no verificadas en la búsqueda realizada |

La información proporcionada no permite establecer una comparación cuantitativa fiable: no hay parámetros, contexto ni métricas publicadas para ninguna de las alternativas. La búsqueda web asociada a este modelo no devolvió resultados técnicos relevantes.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay tasas de éxito ni benchmarks, de modo que el rendimiento real en las cuatro tareas es desconocido.
- Riesgo de sobreajuste al simulador: el condicionamiento incluye un vector de capacidades del simulador de 49 dimensiones y las estadísticas de normalización provienen del checkpoint conjunto, lo que puede limitar la transferencia a un robot físico.
- Dominio restringido: está diseñado para manipulación con entrada de pose de efector final de 6 dimensiones y salida OSC_POSE de 7 dimensiones; no es un modelo de propósito general.
- Sin tool calling, agentes ni razonamiento multi-paso: no puede emplearse en flujos de agentes conversacionales.
- Idiomas no documentados: se desconoce el comportamiento del codificador de prefijo fuera del inglés.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Dependencia de la fórmula aditiva: la inferencia requiere reconstruir W_panda a partir de W_joint_19999 y del delta; omitir el checkpoint base o las estadísticas de normalización compartidas invalida el resultado.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de checkpoints de OpenPI conviene verificar las condiciones de los pesos base y del código asociado.
- Estado del optimizador no incluido: el repositorio no permite reanudar el entrenamiento, solo inferencia.
- Fechas de creación y actualización poco habituales en los metadatos de HuggingFace; conviene verificar la procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isldgist/pi05-panda-weightgen-two-teacher-inits-ee6
- OpenPI (referenciado en la model card como origen del checkpoint `pi05_base`): https://github.com/Physical-Intelligence/openpi
- MimicGen (referenciado por la etiqueta `mimicgen` y las tareas square, threading, stack, stack_three): https://mimicgen.github.io/
- Resultados de búsqueda web: no se encontraron enlaces técnicos relevantes; los resultados devueltos corresponden a dominios sin relación con el modelo.
