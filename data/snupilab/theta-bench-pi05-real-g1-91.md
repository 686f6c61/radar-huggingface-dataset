# snupilab/theta-bench-pi05-real-g1-91

## Resumen

THETA Bench pi0.5 Real G1 91 es un repositorio de resultados de entrenamiento robótico publicado por snupilab dentro de la familia THETA Bench. Se trata de un ajuste adicional (fine-tuning) sobre el checkpoint `snupilab/theta-bench-pi05-sim-3003`, que a su vez partía de 40.000 actualizaciones de optimizador en simulación. Sobre esa base, este checkpoint aplica 5.000 actualizaciones adicionales utilizando 91 demostraciones reales recogidas en el sistema denominado "Real G1" por el autor.

El problema que aborda es el típico de la robótica de manipulación: reducir la brecha entre una política entrenada en simulación (sim-to-real gap) mediante un ajuste con datos reales de teleoperación. Las condiciones reales registradas son cuatro: StickMove Standard, StickMove Reasoning, HookRetrieve Standard y HookRetrieve Reasoning, grabadas a 20 Hz y almacenadas en el dataset `snupilab/theta-bench-teleop` (revisión fijada a `47eca9322bb53fa1c685363271a87d2e414cb0e8`).

Es importante subrayar que, en el momento de redactar esta ficha, la model card indica explícitamente que el entrenamiento está en preparación o en cola y que el repositorio contiene únicamente metadatos. No hay pesos publicados, no hay resultados de evaluación y la licencia no está declarada. El identificador del modelo sugiere una relación con la familia pi0.5 de políticas visión-lenguaje-acción, pero la model card no confirma arquitectura, número de parámetros ni longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés, según los metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene únicamente metadatos; no se han publicado pesos) |
| Pipeline declarado | robotics |
| Modelo base | snupilab/theta-bench-pi05-sim-3003 |
| Etapa de entrenamiento | Real G1 additional training, 91 demostraciones |
| Actualizaciones objetivo | 5.000 |
| Batch por GPU / GPUs / batch global | 16 / 8 / 128 |
| Acumulación de gradiente | 1 |
| Condiciones por batch global | 4 |
| Frecuencia de grabación | 20 Hz |
| Condiciones reales | StickMove Standard, StickMove Reasoning, HookRetrieve Standard, HookRetrieve Reasoning |
| Dataset de entrenamiento | snupilab/theta-bench-teleop (revisión 47eca9322bb53fa1c685363271a87d2e414cb0e8) |
| Fecha de creación del repositorio | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El sufijo "pi05" en el identificador del checkpoint base apunta a la familia pi0.5 de políticas visión-lenguaje-acción, pero no hay confirmación explícita en la documentación proporcionada, por lo que no se puede afirmar si se trata de un transformer de tipo VLA, de una arquitectura híbrida o de otra aproximación. Los datos de entrenamiento publicados se limitan al esquema de optimización: 5.000 actualizaciones objetivo, batch de 16 por GPU en 8 GPUs, batch global de 128, acumulación de gradiente de 1 y 4 condiciones por batch global.

El procedimiento de entrenamiento reportado es una inicialización desde `snupilab/theta-bench-pi05-sim-3003` tras 40.000 actualizaciones en simulación, seguida de 5.000 actualizaciones nuevas sobre 91 demostraciones reales. El autor indica que el entrenamiento utiliza optimizadores de modelo independientes y ejecución compartida de GPU mediante MPS (Multi-Process Service), y que la publicación del checkpoint se realiza con un cargador (uploader) de CPU tras la validación final. No se documentan técnicas de RLHF, DPO, decodificación especulativa ni mecanismos de atención alternativos. La model card advierte además que las acciones de tipo joint-target ejecutadas en hardware requieren el adaptador de control real G1 correspondiente, y que no debe asumirse compatibilidad con un adaptador de simulación.

## Capacidades

- Política robótica de manipulación: el modelo está diseñado para generar acciones de control a partir de observaciones y de descripciones de tarea, en las cuatro condiciones reales registradas (StickMove Standard/Reasoning y HookRetrieve Standard/Reasoning).
- Ejecución a 20 Hz: las grabaciones del dataset están muestreadas a esa frecuencia, lo que define la cadencia de control esperada por el pipeline de datos.
- Variante "Reasoning": dos de las cuatro condiciones incluyen un modo etiquetado como Reasoning, lo que sugiere un componente de razonamiento explícito antes de la acción, aunque la model card no detalla cómo se implementa.
- Adaptación sim-to-real: es la capacidad central del checkpoint, al continuar el entrenamiento de una política simulada con demostraciones reales.
- Control por joint targets: las acciones registradas corresponden a objetivos articulares, ejecutables con el adaptador de control real G1 emparejado.
- Idiomas: los metadatos declaran únicamente inglés (en).
- Tool calling / function calling: no disponible. No se documenta soporte de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible. No se documenta más allá de la etiqueta "Reasoning" en dos condiciones.
- Visión, audio u otras modalidades: no disponible. La model card no especifica las modalidades de entrada.

## Casos de uso

- Investigación en sim-to-real para manipulación: el checkpoint permite medir cuánto mejora una política entrenada en simulación tras 5.000 actualizaciones con 91 demostraciones reales, usando las cuatro condiciones como conjunto de tareas controlado. Es adecuado porque el autor fija la revisión exacta del dataset, lo que facilita la reproducibilidad del protocolo.
- Benchmarking de políticas robóticas dentro de THETA Bench: sirve como punto de comparación frente a otros checkpoints de la misma familia (por ejemplo, el base sim-3003 sin ajuste real) para aislar el efecto del fine-tuning con datos reales.
- Evaluación de tareas de precisión tipo insertion/hooking: la condición HookRetrieve implica enganchar y recuperar un objeto, una tarea de contacto que exige precisión submilimétrica y control fino.
- Evaluación de manipulación de objetos alargados: la condición StickMove cubre el transporte y colocación de un objeto tipo varilla, útil para estudiar estabilidad de agarre y planificación de trayectorias.
- Estudio de modos de razonamiento en control: las variantes Standard y Reasoning de cada tarea permiten comparar el comportamiento de la política con y sin el componente de razonamiento declarado, siempre que se disponga de infraestructura de evaluación.
- Replicación de experimentos de teleoperación: dado que el dataset de teleoperación está referenciado con revisión fija, otro grupo puede reentrenar el mismo ajuste para verificar resultados o probar variantes de hiperparámetros.
- Base para ajustes posteriores en el mismo robot: el checkpoint puede servir de punto de partida para nuevos ciclos de entrenamiento con más demostraciones reales del mismo hardware, una vez que los pesos estén disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que "no evaluation score is claimed by checkpoint publication", es decir, la publicación del checkpoint no reclama ninguna puntuación de evaluación. Tampoco se ofrecen métricas de éxito por tarea, tasas de agarre ni comparaciones numéricas con otros checkpoints de la familia.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se especifican parámetros, precisión ni formato de pesos, por lo que no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. La única información de hardware es la configuración de entrenamiento (8 GPUs con ejecución compartida mediante MPS), que no implica requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible. No se puede determinar si cabe en tarjetas tipo RTX 4090 sin conocer el tamaño del modelo.
- Opciones de despliegue: el autor indica que debe usarse el adaptador THETA nativo y las dependencias específicas del modelo, y que no se reclama compatibilidad con cargadores arbitrarios de Transformers ni con cargadores de simulación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Adaptador de control: para ejecutar acciones joint-target en hardware real se requiere el adaptador de control real G1 correspondiente; no debe asumirse que el adaptador de simulación sea compatible.
- Latencia y throughput: no disponible. La única referencia temporal es la frecuencia de grabación de 20 Hz del dataset, que no equivale a una latencia de inferencia medida.
- Estado del repositorio: los pesos no están publicados en el momento de la consulta, por lo que el despliegue no es posible todavía.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| snupilab/theta-bench-pi05-real-g1-91 | Este checkpoint | no disponible | no disponible | Sin puntuación declarada | no disponible | Solo metadatos |
| snupilab/theta-bench-pi05-sim-3003 | Modelo base (40.000 actualizaciones en simulación) | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |
| Otras políticas VLA de referencia (familia pi0.5, OpenVLA, GR00T N1) | Categoría funcional | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificables en la información proporcionada para establecer una comparación numérica con alternativas de la misma categoría. Cualquier cifra que se añadiese aquí sería especulativa.

## Limitaciones y advertencias

- El repositorio contiene únicamente metadatos: el entrenamiento está en preparación o en cola y no hay pesos descargables, por lo que el modelo no es utilizable hoy.
- No se declara licencia. Esto impide determinar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay autorización clara de uso.
- No se publica ninguna puntuación de evaluación ni métrica de éxito por tarea, de modo que no hay evidencia empírica del rendimiento del ajuste.
- El ajuste se realizó con solo 91 demostraciones reales distribuidas en cuatro condiciones, un volumen reducido que puede limitar la generalización a tareas, objetos o posiciones no cubiertos.
- El modelo está pensado para un hardware concreto ("real G1") y requiere el adaptador de control real correspondiente; usar un adaptador de simulación puede producir acciones inválidas o inseguras.
- El autor advierte explícitamente de que no se reclama compatibilidad con cargadores arbitrarios de Transformers ni con cargadores de simulación, lo que restringe la integración en pipelines estándar.
- Idiomas: los metadatos solo declaran inglés, y las capacidades multilingües no están documentadas.
- Riesgo de alucinación: no disponible. Al tratarse de una política de acción y no de un modelo generativo de texto, la noción de alucinación no está caracterizada en la información proporcionada.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo ni de sesgo de distribución entre condiciones.
- Despliegue en producción: no recomendado en el estado actual, al no existir pesos publicados, licencia ni evaluación.
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos correspondían a contenido sin relación y se han descartado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/snupilab/theta-bench-pi05-real-g1-91
- Modelo base: https://huggingface.co/snupilab/theta-bench-pi05-sim-3003
- Dataset de teleoperación: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Datos de entrenamiento fijados (hardware, revisión 47eca9322bb53fa1c685363271a87d2e414cb0e8): https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/47eca9322bb53fa1c685363271a87d2e414cb0e8/hardware
- Paper, blog, repositorio de código o demo: no disponible. La búsqueda web no devolvió resultados relevantes para este modelo.
