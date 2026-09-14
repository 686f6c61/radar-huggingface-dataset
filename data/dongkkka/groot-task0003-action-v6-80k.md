# Dongkkka/groot-task0003-action-v6-80k

## Resumen

groot-task0003-action-v6-80k es una política de robótica (policy) publicada en HuggingFace por el usuario Dongkkka. Se trata de un checkpoint de la familia GR00T N1.7 entrenado específicamente sobre la tarea Task0003 SeparateRecycling hasta los 80.000 pasos de optimizador. El modelo no es un modelo de lenguaje generativo al uso, sino una política viso-lenguaje-acción (VLA) pensada para producir acciones de control a partir de observaciones visuales y de la descripción de la tarea.

El repositorio contiene los pesos finales de la política, la configuración, la configuración del procesador, el mapeo de embodiment y las estadísticas de normalización. La inicialización visual proviene del mejor checkpoint de V6 supervisado por acción (paso de visión 12.000) y el backbone visual se mantuvo congelado durante el entrenamiento de la política. La pérdida de entrenamiento registrada al final fue de 0,0069, que según el propio autor es una métrica de entrenamiento y no una puntuación de evaluación en un conjunto reservado.

Su relevancia es acotada pero clara: es un ejemplo de ajuste de una política fundacional de robótica sobre una tarea industrial concreta (clasificación separada de reciclaje) y muestra el flujo de trabajo habitual en este campo, donde se parte de un backbone preentrenado y se especializa con datos de demostración. El modelo tiene 3.144.016.000 parámetros y un repositorio de 12,6 GB. No se declara licencia ni idiomas, y no hay datos de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (política viso-lenguaje-acción). La configuración referencia `nvidia/Cosmos-Reason2-2B` como backbone y procesador; el detalle interno de capas no se especifica en la model card |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponibles (la model card no declara idiomas; la salida del modelo son acciones, no texto) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 12,6 GB, coherente con pesos en precisión completa) |

Datos adicionales del repositorio: pipeline declarado `robotics`, etiquetas `Gr00tN1d7`, `gr00t`, `task0003`, `robotics`, región `us`. Creado el 2026-09-14 y actualizado el 2026-09-14 según los metadatos. Descargas y likes: 0 en el momento de la consulta.

## Arquitectura y entrenamiento

La model card indica que se trata de una política GR00T N1.7, es decir, un modelo de la familia de políticas fundacionales para robótica de NVIDIA. La configuración hace referencia a `nvidia/Cosmos-Reason2-2B` para la arquitectura del backbone y para el procesador, lo que implica que el modelo requiere acceso a dicho modelo y a sus activos de procesamiento para poder cargarse. Las modalidades de embodiment personalizadas de Task0003 se describen en la configuración del procesador incluida en el repositorio. No se detalla en la información disponible el tipo exacto de cabeza de acción, el esquema de difusión o flow matching, ni la composición del conjunto de datos.

En cuanto al entrenamiento, el checkpoint corresponde a 80.000 pasos de optimizador sobre la tarea Task0003 SeparateRecycling. La inicialización visual partió del mejor checkpoint de V6 supervisado por acción, en el paso de visión 12.000, y el backbone visual permaneció congelado durante todo el entrenamiento de la política. La pérdida de entrenamiento final registrada fue de 0,0069; el autor advierte explícitamente de que se trata de una métrica de entrenamiento y no de una evaluación sobre datos reservados. El repositorio incluye los pesos finales de la política, la configuración, la configuración del procesador, el mapeo de embodiment y las estadísticas de normalización, pero no el optimizador, el scheduler ni el estado del generador de números aleatorios, que quedan en el checkpoint de entrenamiento original.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visuales y de la especificación de la tarea, propio de una política viso-lenguaje-acción.
- Ejecución de la tarea concreta Task0003 SeparateRecycling, correspondiente a un escenario de separación y clasificación de residuos.
- Procesamiento multimodal: entrada visual más contexto de tarea, con salida en el espacio de acciones definido por el mapeo de embodiment incluido.
- Uso de estadísticas de normalización propias de la tarea, lo que implica que las observaciones deben preprocesarse con las mismas estadísticas con las que se entrenó.
- Integración con el runtime de política Isaac-GR00T N1.7, que es el mecanismo de carga indicado por el autor.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning textual ni capacidades multilingües, ya que no es un modelo de generación de texto.
- No se documentan capacidades de audio, vídeo o visión generalista más allá del uso del backbone visual para la política.

## Casos de uso

- Automatización de una celda de clasificación de residuos: la política recibe la observación del puesto de trabajo y emite acciones de manipulación para separar los materiales según la tarea Task0003 SeparateRecycling. Es el escenario para el que fue entrenada explícitamente y el único con garantías directas.
- Punto de partida para ajuste fino en tareas de reciclaje relacionadas: al ser un checkpoint especializado con estadísticas de normalización y mapeo de embodiment incluidos, sirve como inicialización para variantes del mismo puesto con cambios menores de iluminación, cinta o distribución de objetos.
- Evaluación comparativa de políticas en simulación: puede cargarse en el runtime Isaac-GR00T N1.7 y medirse frente al checkpoint base o frente a inicializaciones anteriores (por ejemplo, V6 en el paso 12.000) para aislar el efecto del entrenamiento de la política.
- Recogida de datos por rollout: desplegar la política en el entorno real o simulado para generar trayectorias etiquetadas que alimenten un ciclo posterior de entrenamiento o de aprendizaje por imitación.
- Reproducción de resultados de entrenamiento: el repositorio permite reproducir el estado final de una política entrenada a 80.000 pasos con backbone visual congelado, útil para estudios de escalado de pasos de optimizador en VLA.
- Investigación en sim-to-real: al mantener congelado el backbone visual y entrenar solo la política, es un candidato razonable para estudiar la transferencia de un mismo backbone entre dominios sintéticos y reales, siempre que se respeten las estadísticas de normalización.
- Prototipado de pipelines de robótica en investigación: integrar la política en un bucle de control ROS 2 o similar mediante el runtime oficial, con las limitaciones de licencia y de soporte que se indican más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único número de rendimiento aportado por el autor es la pérdida de entrenamiento final (0,0069), que él mismo califica como métrica de entrenamiento y no como puntuación de evaluación en un conjunto reservado, por lo que no debe interpretarse como una medida de calidad de la política. No hay datos de MMLU, HumanEval, GSM8K ni de métricas específicas de manipulación (tasas de éxito, error de posición, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 3.144.016.000 parámetros (estimaciones propias, no facilitadas por el autor):
  - Precisión completa (fp32): en torno a 12,6 GB solo de pesos, más activaciones; se recomienda reservar 16 GB o más.
  - Media precisión (bf16/fp16): en torno a 6,3 GB de pesos; con activaciones y buffers del backbone, un presupuesto de 8-10 GB es razonable.
  - Cuantización a int8: en torno a 3,1 GB de pesos; presupuesto de 5-6 GB.
  - Cuantización a int4: en torno a 1,6 GB de pesos; presupuesto de 3-4 GB. No se publican variantes cuantizadas oficiales.
- GPU recomendadas: para fp32, GPU de centro de datos tipo A100 o H100 con 40-80 GB, o RTX 4090 con 24 GB. Para bf16, cabe con holgura en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB).
- Cabe en GPU de consumo: sí, en bf16 o fp16 en tarjetas de 16 GB o más (RTX 4080, RTX 4090, RTX 3090, RTX 4060 Ti de 16 GB). En fp32 requiere 24 GB o más para operar con margen.
- Opciones de despliegue: el autor indica que debe cargarse con el runtime de política Isaac-GR00T N1.7 y que se requiere acceso a `nvidia/Cosmos-Reason2-2B` y a sus activos de procesador. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y estos runtimes de generación de texto no son el mecanismo previsto para una política de acción.
- Latencia y throughput estimados: no disponibles. No se publican cifras de frecuencia de control, latencia por inferencia ni rendimiento en hercios.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada, y no se han publicado benchmarks de este checkpoint, por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parametros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-task0003-action-v6-80k | 3.144.016.000 | No disponible | Política VLA para Task0003 SeparateRecycling | No disponible | HuggingFace (repo público, 0 descargas) |
| GR00T N1.7 (checkpoint base) | No disponible | No disponible | Política VLA fundacional | No disponible | Referenciado indirectamente a través del runtime Isaac-GR00T |
| nvidia/Cosmos-Reason2-2B (backbone referenciado) | No disponible en esta información | No disponible | Backbone viso-lenguaje | No disponible | HuggingFace (requiere acceso según el autor) |
| Otras políticas VLA de la misma categoría (por ejemplo, familias abiertas de manipulación) | No disponible | No disponible | Políticas viso-lenguaje-acción | No disponible | No disponible |

Las búsquedas web realizadas no devolvieron resultados relacionados con este modelo; los resultados obtenidos correspondían a páginas corporativas de Microsoft sin relación con el repositorio analizado.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para Task0003 SeparateRecycling. Fuera de esa tarea, de ese embodiment o de esa distribución de objetos, no hay ninguna garantía de comportamiento correcto.
- Métrica engañosa: la pérdida de entrenamiento de 0,0069 no es una medida de éxito en la tarea. No hay evaluación en conjunto reservado ni tasas de éxito publicadas.
- Dependencia externa: la carga requiere acceso a `nvidia/Cosmos-Reason2-2B` y a sus activos de procesador, además del runtime Isaac-GR00T N1.7. Si ese acceso no está disponible, el checkpoint no es utilizable tal cual.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial. Cualquier despliegue en producción debería aclarar antes los términos con el autor y con los titulares de los componentes referenciados.
- Ausencia de estado de entrenamiento: no se incluyen optimizador, scheduler ni estado del generador aleatorio, por lo que la reanudación exacta del entrenamiento desde este repositorio no es posible.
- Riesgo de sobreajuste al entorno de entrenamiento: al congelar el backbone visual y entrenar la política a 80.000 pasos sobre una sola tarea, es probable que el modelo dependa fuertemente de las condiciones visuales y de las estadísticas de normalización incluidas.
- Sin datos de sesgo, robustez ni seguridad: no se documentan sesgos conocidos, comportamiento ante objetos no vistos, ni protocolos de parada segura. En un entorno físico, esto exige supervisión y límites de par.
- Idiomas no declarados: cualquier instrucción en lenguaje natural que se use como condicionamiento depende del procesador del backbone referenciado, no de este repositorio.
- Sin benchmarks ni validación por terceros: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de funcionamiento.
- Fechas de metadatos anómalas: la creación y actualización figuran como 2026-09-14, una fecha posterior a la habitual en los repositorios actuales; conviene verificar la procedencia antes de confiar en el contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dongkkka/groot-task0003-action-v6-80k
- Backbone referenciado por la configuración: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Runtime de política Isaac-GR00T mencionado en la model card: https://github.com/NVIDIA/Isaac-GR00T
- Paper, blog o demo específicos de este checkpoint: no disponibles en la información proporcionada.
- Resultados de búsqueda web relevantes: ninguno (los resultados obtenidos no guardaban relación con el modelo).
