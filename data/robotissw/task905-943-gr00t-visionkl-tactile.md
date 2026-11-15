# RobotisSW/Task905-943-GR00T-VisionKL-Tactile

## Resumen

Task905-943-GR00T-VisionKL-Tactile es un conjunto de checkpoints de investigación publicados por RobotisSW, derivados del modelo base nvidia/GR00T-N1.7-3B, un modelo fundacional de robótica de 3.000 millones de parámetros desarrollado por NVIDIA. El repositorio no contiene un modelo nuevo entrenado desde cero, sino los pesos intermedios y finales de un experimento de ajuste fino en dos etapas sobre tareas de manipulación robótica con entrada visual y táctil.

El experimento, denominado SH5, combina dos tareas (905 y 943) con un total de 174 episodios y 77.860 fotogramas. La primera etapa ajusta la torre visual completa mediante KL tuning manteniendo congelados el LLM y el módulo de acción; la segunda congela el VLM resultante y entrena la cabeza de acción junto con un codificador táctil denominado finger_mlp. El repositorio archiva checkpoints reanudables completos (pesos, procesadores, estadísticas, estado del optimizador y manifiesto de checksums).

Su relevancia es acotada: se trata de un artefacto de reproducibilidad para investigación en robótica, no de un modelo listo para producción. El autor declara explícitamente que no se ha realizado selección de modelo con conjunto de validación retenido ni validación en despliegue robótico real, por lo que los checkpoints deben interpretarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de nvidia/GR00T-N1.7-3B (modelo fundacional de robótica con torre visual, LLM y cabeza de acción); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 3B (heredados del modelo base GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos de Transformers junto con procesadores, estadísticas, configuración y estado de Trainer; formato de serialización exacto no disponible |

## Arquitectura y entrenamiento

El modelo parte de nvidia/GR00T-N1.7-3B, un modelo fundacional orientado a robótica que combina una torre visual, un LLM y un módulo de acción. Sobre esta base, el experimento SH5 aplica un ajuste en dos etapas. En la etapa de visión se realiza un KL tuning sobre la torre visual completa, con el LLM y el módulo de acción congelados, generando checkpoints en los pasos de optimizador 500 y 1000. En la etapa de acción se parte del checkpoint de visión del paso 1000, se congela el VLM completo y se entrena la cabeza de acción junto con el codificador táctil finger_mlp existente, con checkpoints en los pasos 20000, 40000, 60000, 80000 y 100000.

Los datos de entrenamiento consisten en las tareas 905 y 943 conjuntas, con 174 episodios y 77.860 fotogramas. Las entradas utilizan máscaras de unión SAM de la mano activa y del pad, sin letterbox padding. No se especifica en la información disponible el número de tokens de entrenamiento del LLM, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO. Cada checkpoint incluye pesos, procesadores y estadísticas, configuración, estado de optimizador, scheduler, RNG y Trainer, además de un manifiesto de checksums, lo que permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Manipulación robótica con entrada visual y táctil: el modelo procesa observaciones visuales y señales táctiles para generar acciones, según el pipeline de robótica declarado.
- Ajuste específico sobre dos tareas concretas (905 y 943) de un entorno de manipulación no detallado en la información disponible.
- Codificación táctil mediante el módulo finger_mlp entrenado en la segunda etapa.
- Checkpoints reanudables: cada artefacto permite continuar el entrenamiento desde el paso exacto, incluyendo estado de optimizador y RNG.
- No se documentan capacidades de generación de texto general, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de investigación: los checkpoints completos permiten a un equipo replicar el entrenamiento en dos etapas (KL tuning visual y entrenamiento de acción con codificador táctil) sin reentrenar desde cero.
- Estudio de ajuste de torres visuales en modelos fundacionales de robótica: los checkpoints de los pasos 500 y 1000 de la etapa de visión permiten analizar cómo evoluciona la representación visual bajo KL tuning con el resto del modelo congelado.
- Investigación en fusión viso-táctil: el entrenamiento conjunto de la cabeza de acción con el codificador finger_mlp sirve como base para estudiar cómo integrar señales táctiles en políticas de manipulación.
- Análisis de curvas de entrenamiento: los checkpoints en los pasos 20000, 40000, 60000, 80000 y 100000 de la etapa de acción permiten trazar la evolución del rendimiento a lo largo del entrenamiento.
- Punto de partida para ajuste en tareas adicionales: al conservar el VLM congelado de la etapa de visión, el repositorio puede usarse como inicialización para nuevas cabezas de acción en tareas relacionadas.
- Auditoría de reproducibilidad: el manifiesto de checksums y el archivo setup/archive_policy.json facilitan la verificación de integridad y la trazabilidad de cada checkpoint en un pipeline de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama selección de modelo con conjunto retenido ni validación en despliegue robótico, y que el paso 1000 es el punto de finalización configurado de la etapa de visión, no un checkpoint medido como óptimo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un modelo de 3B parámetros en precisión completa requiere del orden de 12 GB solo para pesos, sin contar torre visual ni overhead, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RobotisSW/Task905-943-GR00T-VisionKL-Tactile | 3B (heredados) | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoints experimentales de ajuste en dos etapas |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | no disponible | Modelo base en Hugging Face | Modelo fundacional de robótica del que deriva este repositorio |
| Otras alternativas de robótica viso-táctil | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- No se ha realizado selección de modelo con conjunto de validación retenido; los checkpoints no están validados como los mejores de su etapa.
- No se reclama validación en despliegue robótico real; el uso en un robot físico no está verificado por el autor.
- El paso 1000 de la etapa de visión es el punto de finalización configurado, no un óptimo medido.
- El entrenamiento se limita a dos tareas (905 y 943) de un entorno no detallado; la generalización a otras tareas no está documentada.
- La licencia no está disponible, lo que impide determinar si se permite uso comercial; debe consultarse con el autor antes de cualquier uso productivo.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, al no tratarse de un modelo de lenguaje de propósito general.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso por terceros.
- Las demostraciones de origen y los vídeos no se incluyen en el repositorio, lo que limita la reproducibilidad completa del dataset.
- El commit inicial solo contenía el plan de archivo; los checkpoints aparecen a medida que el entrenamiento alcanza cada paso de guardado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RobotisSW/Task905-943-GR00T-VisionKL-Tactile
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Configuración de archivo del experimento: setup/archive_policy.json (referenciada en la model card, dentro del repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
