# sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_5k

## Resumen

El modelo `sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_5k` es un checkpoint de robótica basado en π₀.₅ (Pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado a la librería LeRobot de HuggingFace a partir del repositorio OpenPI. En concreto, este repositorio es un fine-tune del modelo base `lerobot/pi05_base`, entrenado por el usuario `sam-guided-vlas` sobre un dataset de manipulación con objetos de geometría compleja.

El modelo cuenta con 4.143.404.816 parámetros (~4,14 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Su función es predecir acciones de control de 7 dimensiones para un robot tipo Panda a partir de un estado de 9 variables y tres cámaras (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`), lo que lo sitúa en el ámbito de las políticas de manipulación condicionadas por visión.

Es relevante como ejemplo de la cadena de herramientas de LeRobot para entrenar y publicar políticas VLA, y como punto de partida reproducible de un fine-tune concreto (semilla 0, 5 000 pasos). No obstante, se trata de un artefacto muy experimental: cero descargas, cero valoraciones, un dataset de solo 199 episodios y 31 073 fotogramas, y una model card sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA); fine-tune de π₀.₅ (Pi05) sobre `lerobot/pi05_base` |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la política consume un conjunto fijo de observaciones (estado de 9 dimensiones y tres imágenes de 3×224×224), no una ventana de contexto de texto |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors |
| Idiomas soportados | No disponible (las descripciones de tarea del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 9,4 GB) |

## Arquitectura y entrenamiento

La familia π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción orientado a la generalización en entornos abiertos: según la documentación de Physical Intelligence, evoluciona π₀ para funcionar en situaciones y entornos no vistos durante el entrenamiento. La implementación de LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. La model card de este repositorio no detalla la composición interna del backbone (codificador visual, modelo de lenguaje o experto de acciones), el número de tokens de entrenamiento ni los datos de preentrenamiento del modelo base, por lo que esos datos no están disponibles.

El fine-tune se ha realizado sobre el dataset `sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live`, que contiene 199 episodios y 31 073 fotogramas grabados a 20 FPS. Las tareas descritas son manipulaciones de objetos con geometrías complejas (formas con lóbulos, ranuras profundas, anillos, cúpulas, conchas perforadas y objetos con protuberancias). El robot es un `Panda` y la política recibe como entradas `observation.state` (9,), tres imágenes de 3×224×224 (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y produce una acción de 7 dimensiones. El nombre del repositorio indica las condiciones del entrenamiento: semilla 0, 5 000 pasos, uso de máscara y superposición (`overlay_a75`), datos de simulación (`sim`) y datos en directo (`live`). No se especifica si hubo RLHF, DPO ni ninguna otra fase de alineación, algo que en el ámbito de las políticas robóticas se sustituye habitualmente por aprendizaje por imitación.

## Capacidades

- Predicción de acciones de manipulación robótica de 7 dimensiones (posición y orientación del efector más pinza), pensada para ejecutarse al ritmo de control del dataset (20 FPS).
- Percepción multi-cámara: integra una vista general (`agentview`) y dos vistas cenitales en la mano (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Condicionamiento por estado del robot: consume un vector de estado proprioceptivo de 9 dimensiones.
- Manipulación de objetos con geometría compleja: el dataset de entrenamiento cubre formas con lóbulos, ranuras, perforaciones y protuberancias, lo que sugiere cierta capacidad para el agarre y la colocación de piezas no triviales.
- Generalización fuera de distribución: el diseño de π₀.₅ apunta explícitamente a generalizar a entornos y situaciones nuevos, aunque no hay evaluación publicada en este repositorio que lo confirme para este fine-tune concreto.
- No se documenta soporte de tool calling, function calling, uso como agente multi-paso, ni capacidades de audio o de "modo pensamiento". Tampoco se documentan capacidades multilingües.

## Casos de uso

- Investigación en manipulación fina en simulación: el modelo puede usarse como política de referencia para tareas de agarre de objetos con geometría irregular (lóbulos, ranuras, anillos), aprovechando las tres vistas de cámara para desambiguar la pose del objeto.
- Estudio de transferencia sim-to-real: al haber sido entrenado con datos etiquetados como `sim` y `live`, sirve para analizar hasta qué punto una política entrenada en simulación se comporta de forma aceptable sobre el robot físico.
- Benchmark de recetas de fine-tuning VLA: al fijar semilla 0 y 5 000 pasos, es un punto de referencia reproducible para comparar variantes de enmascaramiento y superposición (`mask`, `overlay_a75`) y decidir qué configuración conviene en producción.
- Aprendizaje por imitación con múltiples cámaras: útil para validar pipelines de LeRobot que recogen observaciones desde `agentview` y varias cámaras en la muñeca, un montaje habitual en setups de teleoperación y de recogida de datos.
- Base para nuevos fine-tunes por transferencia: al derivar de `lerobot/pi05_base` con Apache 2.0, puede servir como inicialización para tareas de manipulación relacionadas con menos datos de los que se necesitarían desde cero.
- Evaluación de robustez ante cambios de cámara o de iluminación: los dos puntos de vista en la mano permiten estudiar qué ocurre cuando se degrada una cámara o se pierde una vista durante la inferencia.
- Docencia y prototipado de políticas robóticas: un checkpoint pequeño (~4,14 B de parámetros) y con licencia permisiva es adecuado para cursos y talleres donde se enseña a desplegar políticas VLA con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito de tarea, comparativas con π₀.₅ ni evaluaciones en simulación o en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar activaciones ni buffers de imagen):
  - bf16/fp16: ~8,3 GB.
  - fp32: ~16,6 GB.
  - int8: ~4,2 GB.
  - int4: ~2,1 GB.
- El repositorio ocupa 9,4 GB, un valor coherente con pesos en precisión de 16 bits más ficheros auxiliares, por lo que conviene reservar espacio adicional en disco para checkpoints y estado del optimizador si se va a reentrenar.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación a gran escala; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 con margen para las tres cámaras de 224×224.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 4090, RTX 3090) sin cuantización y en tarjetas de 8-12 GB si se aplica cuantización a int8 o int4.
- Opciones de despliegue: LeRobot como librería principal, ejecutando la política sobre PyTorch con pesos safetensors. vLLM, llama.cpp, Ollama y TGI no son aplicables de forma directa, ya que se trata de una política de control robótico y no de un modelo de generación de texto.
- Latencia y throughput: no disponibles. El dataset fue grabado a 20 FPS, por lo que el bucle de control esperado sería de 20 Hz (50 ms por paso), pero no se documenta la latencia real de inferencia en ningún hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este fine-tune (`pi05`, semilla 0, 5k pasos) | 4,14 B | VLA robótica (fine-tune) | Apache 2.0 | HuggingFace, vía LeRobot |
| `lerobot/pi05_base` | No confirmado en la información disponible (arquitectura equivalente al derivado) | VLA robótica (modelo base) | Apache 2.0 según el modelo base | HuggingFace, vía LeRobot |
| π₀ (Physical Intelligence) | No disponible | VLA robótica (predecesor de π₀.₅) | No disponible en la información proporcionada | Repositorio OpenPI / código abierto |
| OpenVLA | ~7 B (dato de literatura pública, no confirmado en la información proporcionada) | VLA robótica | No disponible en la información proporcionada | HuggingFace |

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (199 episodios, 31 073 fotogramas): el riesgo de sobreajuste a las geometrías y condiciones concretas del conjunto de entrenamiento es alto.
- Es un fine-tune de tarea específica, no un modelo general: las acciones de 7 dimensiones están ligadas a un robot `Panda` y a un montaje concreto de tres cámaras.
- No se han publicado métricas de éxito de tarea, tasas de agarre ni evaluaciones en robot real, por lo que no hay evidencia de rendimiento en producción.
- El repositorio registra cero descargas y cero valoraciones, lo que indica que no ha sido validado por la comunidad.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política de imitación, puede generar trayectorias que parezcan válidas y fallen en el contacto físico.
- Sesgos potenciales derivados de la distribución del dataset: si los objetos de entrenamiento comparten materiales, iluminación o posición de cámara, el modelo fallará ante variaciones no representadas.
- Idiomas no especificados: las descripciones de tarea están en inglés, y no se documenta comportamiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el código OpenPI deben verificarse por separado para confirmar que su licencia es compatible con el uso previsto.
- La fecha de creación y actualización que figuran en el repositorio son del 11 de septiembre de 2026; conviene verificarla antes de citar el modelo.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos correspondían a contenidos no relacionados (una serie de televisión francesa y un fabricante de herramientas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (referenciado en la model card): https://github.com/Physical-Intelligence/openpi
