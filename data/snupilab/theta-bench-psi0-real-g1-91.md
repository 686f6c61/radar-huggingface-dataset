# snupilab/theta-bench-psi0-real-g1-91

## Resumen

Theta Bench Psi0 Real G1 91 es un repositorio de resultados de entrenamiento publicado por el usuario snupilab dentro del ecosistema THETA Bench. Se trata de una política robótica (pipeline `robotics`) obtenida mediante ajuste adicional sobre el checkpoint simulado `snupilab/theta-bench-psi0-sim-3003`, que a su vez había acumulado 40.000 actualizaciones en simulación. El ajuste adicional emplea 91 demostraciones reales del robot G1 y está diseñado para ejecutarse durante 5.000 actualizaciones del optimizador.

El repositorio es, en el momento de su publicación, únicamente metadatos: la propia model card indica que el entrenamiento está "preparando o en cola" y que el contenido no sustituye a una política preentrenada upstream. Por tanto, no se debe asumir la existencia de pesos utilizables ni de un checkpoint validado.

La relevancia de esta ficha es acotada y hay que subrayarla: no se trata de un modelo de lenguaje, sino de un artefacto de entrenamiento para manipulación robótica, con cuatro condiciones reales registradas (StickMove Standard/Reasoning y HookRetrieve Standard/Reasoning), grabaciones a 20 Hz y acciones de tipo joint-target. No se declara puntuación de evaluación alguna y no se documenta licencia, arquitectura, número de parámetros ni formato de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política robótica del ecosistema THETA Bench; arquitectura interna no documentada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; el contenido es una política robótica, no texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene solo metadatos; se requiere el adaptador nativo THETA) |

Otros datos operativos documentados:

| Parametro | Valor |
|---|---|
| Etapa de entrenamiento | Entrenamiento adicional real G1, 91 demostraciones |
| Actualizaciones objetivo del optimizador | 5.000 |
| Batch por GPU / GPUs / batch global | 16 / 8 / 128 |
| Acumulacion de gradiente | 1 |
| Condiciones por batch global | 4 |
| Revision del dataset | 47eca9322bb53fa1c685363271a87d2e414cb0e8 |
| Frecuencia de grabacion | 20 Hz |
| Modelo base | snupilab/theta-bench-psi0-sim-3003 (tras 40.000 actualizaciones de simulación) |
| Dataset | snupilab/theta-bench-teleop |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la política (no se indica si es un transformer de visión-lenguaje-acción, un modelo de difusión de acciones o un esquema híbrido). Lo que sí se documenta es el procedimiento de entrenamiento en dos fases: una inicialización desde `snupilab/theta-bench-psi0-sim-3003`, que ya había completado 40.000 actualizaciones en simulación, seguida de 5.000 actualizaciones nuevas empleando exclusivamente 91 demostraciones reales del robot G1. El dataset de partida es `snupilab/theta-bench-teleop`, fijado a una revisión concreta para garantizar la reproducibilidad.

El pipeline de entrenamiento usa optimizadores independientes por modelo y ejecución compartida de GPU mediante MPS, con un uploader en CPU que publica tras la validación final del checkpoint. El batch global es de 128 con 4 condiciones por batch global y sin acumulación de gradiente, lo que implica que las 91 demostraciones se recorren muchas veces a lo largo de las 5.000 actualizaciones. Las cuatro condiciones reales son StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning. No se menciona RLHF, DPO ni ninguna técnica de alineación, y no se declara ninguna innovación arquitectónica.

## Capacidades

- Ejecución de políticas de manipulación robótica sobre el robot G1, con acciones de tipo joint-target ejecutadas en hardware.
- Cobertura de cuatro condiciones concretas: StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning.
- Aprendizaje a partir de demostraciones de teleoperación reales (91 episodios) a 20 Hz.
- Transferencia simulación-a-realidad: parte de un checkpoint entrenado 40.000 pasos en simulación y se ajusta con datos reales.
- Soporte de tool calling / function calling: no disponible (no aplica a una política robótica).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible; las etiquetas "Standard/Reasoning" se refieren a condiciones de la tarea, no a un modo de razonamiento textual.
- Capacidades multilingües: no aplica; la etiqueta declarada es `en` y el artefacto no procesa texto de usuario.
- Capacidad especial: requiere el adaptador nativo THETA y el adaptador de control real G1 correspondiente; no se declara compatibilidad con Transformers genérico ni con loaders de simulación.

## Casos de uso

- Investigación en transferencia simulación-a-realidad: usar el checkpoint como punto de partida para estudiar cuánto mejora una política simulada tras 5.000 actualizaciones con 91 demostraciones reales, comparando frente al checkpoint previo `theta-bench-psi0-sim-3003`.
- Reproducción de experimentos de THETA Bench: el repositorio fija la revisión del dataset y todos los hiperparámetros (batch 16 por GPU, 8 GPUs, batch global 128), lo que permite replicar exactamente la configuración si se dispone del adaptador nativo.
- Evaluación de tareas de manipulación con gancho (HookRetrieve): la política cubre variantes Standard y Reasoning, útil para medir si el modelo generaliza entre ambas formulaciones de la misma tarea física.
- Evaluación de tareas de movimiento de varilla (StickMove): sirve como banco de pruebas controlado para comparar políticas entrenadas con distinto número de demostraciones reales.
- Estudio del efecto del volumen de datos reales: con solo 91 demostraciones, este artefacto es un caso de estudio sobre el mínimo viable de teleoperación para adaptar una política simulada al robot G1.
- Auditoría de pipelines de entrenamiento distribuido: la combinación de 8 GPUs, MPS compartido y optimizadores independientes por modelo es un ejemplo concreto de orquestación que puede analizarse o reutilizarse.
- Base para ajustes posteriores: si el entrenamiento llega a completarse y se publican pesos, serviría como inicialización para nuevas rondas de ajuste con más demostraciones reales.
- Referencia metodológica para documentación de checkpoints: el repositorio ejemplifica cómo registrar etapa, hiperparámetros y revisión de datos sin publicar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que la publicación del checkpoint no reclama ninguna puntuación de evaluación. No se dispone de datos de éxito en tarea, tasas de agarre, error de posición articular ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La información proporcionada no incluye número de parámetros ni formato de pesos, por lo que cualquier cifra sería especulativa.
- GPU recomendadas: no disponible. El entrenamiento documentado usó 8 GPUs con batch de 16 por GPU, pero no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible. No puede determinarse sin conocer el tamaño del modelo.
- Opciones de despliegue: el repositorio exige el adaptador nativo THETA y dependencias específicas del modelo. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a políticas robóticas). Se requiere además el adaptador de control real G1 correspondiente a acciones joint-target; un adaptador de simulación no debe asumirse compatible.
- Latencia y throughput: no disponible. Las grabaciones son a 20 Hz, dato que describe los datos de entrenamiento, no el rendimiento de inferencia.
- Estado del artefacto: al publicarse, el entrenamiento estaba en preparación o en cola y el repositorio solo contenía metadatos, por lo que no hay checkpoint desplegable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| snupilab/theta-bench-psi0-real-g1-91 | no disponible | no disponible | no declarado | no disponible | solo metadatos |
| snupilab/theta-bench-psi0-sim-3003 (modelo base) | no disponible | no disponible | no disponible | no disponible | referenciado como origen del ajuste |
| Otras políticas robóticas (por ejemplo, familias VLA tipo pi0) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificables sobre modelos comparables dentro de la información proporcionada. La única comparación posible es con su propio modelo base simulado, del cual este repositorio es una continuación, pero no se han publicado métricas de ninguno de los dos.

## Limitaciones y advertencias

- El repositorio contiene únicamente metadatos: no hay pesos publicados y el entrenamiento figura como preparando o en cola. No es utilizable tal cual.
- No se declara licencia, lo que impide determinar si existe permiso para uso comercial o redistribución. Debe tratarse como uso restringido hasta que el autor lo aclare.
- No se declara ninguna puntuación de evaluación; no hay evidencia publicada de que la política funcione en el robot real.
- Requiere el adaptador nativo THETA y el adaptador de control real G1. Un adaptador de simulación no debe asumirse compatible, y el repositorio no reclama compatibilidad con Transformers genérico ni con loaders de simulación.
- Las capacidades están limitadas a cuatro condiciones concretas (StickMove Standard/Reasoning y HookRetrieve Standard/Reasoning). No hay indicios de generalización a otras tareas, objetos o entornos.
- Con solo 91 demostraciones reales, el riesgo de sobreajuste a las condiciones registradas es alto; no se documenta ninguna medida de regularización o aumento de datos.
- Sesgos conocidos: no disponibles. No se documenta análisis de sesgo, y en robótica el sesgo relevante sería la distribución de escenas, iluminación y posiciones cubiertas por las 91 grabaciones, dato que no se detalla.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el riesgo propio de una política de manipulación de generar acciones fuera de distribución ante estados no vistos.
- No se especifican requisitos de hardware, latencia ni throughput, lo que dificulta cualquier planificación de despliegue en producción.
- Las etiquetas "Standard" y "Reasoning" se refieren a condiciones de la tarea, no a un modo de razonamiento del modelo; no debe interpretarse como una capacidad cognitiva adicional.
- La fecha de creación registrada (2026-09-13) y el escaso historial del repositorio (0 descargas, 0 likes) aconsejan tratar el artefacto como experimental y sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/snupilab/theta-bench-psi0-real-g1-91
- Modelo base: https://huggingface.co/snupilab/theta-bench-psi0-sim-3003
- Dataset de teleoperación: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados (revisión 47eca9322bb53fa1c685363271a87d2e414cb0e8, carpeta hardware): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/47eca9322bb53fa1c685363271a87d2e414cb0e8/hardware
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
