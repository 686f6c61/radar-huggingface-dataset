# Donghyun1228/pi05-libero-main-module-lr-yaw20-v0p3-e3-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de investigación para robótica publicado por el usuario Donghyun1228 bajo la librería openpi. Se trata de un candidato intermedio de una búsqueda de hiperparámetros explícitamente autorizada, no de un modelo final validado: la propia model card indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito. El artefacto pertenece a una familia de experimentos orientados al benchmark LIBERO y etiquetados con inverse-dynamics, y su tamaño de repositorio es de 7,7 GB.

El interés de este tipo de publicación es metodológico más que de producto. El autor documenta con precisión qué se ha modificado respecto a una configuración base (únicamente los multiplicadores de learning rate posteriores a Adam por módulo: 0.3 para visión y 3.0 para el experto, con el LLM congelado) y qué se ha mantenido intacto (grafo nativo, inicialización y normalización de origen, datos densos de contacto y pre-adaptación original). Además, afirma que los pesos congelados se han verificado de forma independiente, lo que convierte el checkpoint en un material útil para reproducibilidad y auditoría de experimentos.

No es un modelo de lenguaje ni un asistente conversacional: es un artefacto de política robótica para manipulación en simulación. La información disponible no incluye arquitectura detallada, número de parámetros, contexto, idiomas ni resultados de benchmarks, por lo que esta ficha marca explícitamente esos campos como no disponibles en lugar de estimarlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El nombre del repositorio (pi05) y el campo library_name: openpi apuntan a una política derivada de la familia pi0.5 de openpi, pero la model card no confirma la arquitectura |
| Parámetros totales | No disponible (el repositorio ocupa 7,7 GB, dato que por sí solo no permite deducir el número de parámetros sin conocer la precisión de almacenamiento) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repositorio de 7,7 GB compatible con la librería openpi) |

## Arquitectura y entrenamiento

La model card describe un ajuste en el que solo cambian los multiplicadores de learning rate posteriores al optimizador Adam, aplicados por módulo. En concreto, se usa un multiplicador de 0.3 para el módulo de visión y de 3.0 para el módulo experto, mientras que el LLM permanece congelado. El resto del pipeline se mantiene sin cambios: grafo nativo inalterado, inicialización y normalización procedentes del modelo de origen, y los mismos datos densos de contacto y la misma configuración de pre-adaptación. En inferencia se emplea la muñeca (wrist) del modelo de origen. El autor indica que el checkpoint es "raw" y que los pesos congelados han sido verificados de forma independiente.

El entrenamiento declarado consiste en 1000 actualizaciones sobre raw999, con tamaño de batch 32 y semilla 42. La etiqueta yaw20 forma parte del identificador del experimento, aunque la model card no detalla a qué parámetro o transformación corresponde. No se especifican en la información disponible el número de tokens o pasos de datos consumidos, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias; tampoco se documentan innovaciones técnicas adicionales más allá del esquema de multiplicadores por módulo.

## Capacidades

- Generación de acciones de manipulación robótica en el contexto del benchmark LIBERO, según indican las etiquetas robotics y libero del repositorio.
- Modelado de dinámica inversa (inverse-dynamics), tal y como declara la etiqueta correspondiente.
- Adaptación controlada de módulos específicos mediante multiplicadores de learning rate diferenciados, manteniendo el LLM congelado.
- Reproducibilidad de experimentos: semilla 42, batch 32 y 1000 actualizaciones declaradas, con verificación independiente de los pesos congelados.
- No hay constancia de soporte de tool calling ni de function calling en la información disponible.
- No hay constancia de capacidades de agente, razonamiento multi-paso ni planificación de alto nivel en la información disponible.
- No hay constancia de capacidades multilingües ni de procesamiento de lenguaje natural orientado a usuario final.
- No hay constancia de modo de razonamiento (thinking mode), visión general, audio ni otras capacidades especiales más allá del uso robótico declarado.

## Casos de uso

- Reproducción de ablaciones de hiperparámetros: el checkpoint permite repetir exactamente una configuración concreta (multiplicadores 0.3 en visión, 3.0 en experto, LLM congelado, semilla 42) y compararla con candidatos posteriores de la misma búsqueda.
- Auditoría de pesos congelados: dado que el autor afirma que los pesos congelados se verificaron de forma independiente, el artefacto sirve como referencia para validar que un proceso de ajuste no ha modificado los módulos que debían permanecer intactos.
- Investigación en dinámica inversa: el etiquetado inverse-dynamics permite emplearlo como punto de partida en estudios sobre estimación de acciones a partir de transiciones observadas.
- Línea base en LIBERO: sirve como referencia interna para medir el efecto de cambiar solo las tasas de aprendizaje por módulo, siempre que se ejecute la evaluación que la model card deja pendiente.
- Estudio del papel del LLM congelado en políticas robóticas: al mantener el LLM sin entrenar, el checkpoint aísla el efecto del ajuste en visión y experto, lo que resulta útil para analizar cuánta capacidad de adaptación aporta cada módulo.
- Punto de continuación de entrenamiento: al ser un checkpoint "raw" en el paso raw999 con 1000 actualizaciones, es un candidato natural para reanudar el entrenamiento y generar los "later candidates" que menciona la model card.
- Evaluación comparativa de esquemas de learning rate por módulo: permite comprobar empíricamente si multiplicadores asimétricos entre visión y experto alteran de forma medible el comportamiento de la política.
- Docencia y divulgación técnica: como ejemplo documentado de publicación de checkpoints intermedios con trazabilidad de cambios, resulta útil para explicar buenas prácticas de reproducibilidad en investigación robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card es explícita al respecto: indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito. El benchmark de referencia del proyecto es LIBERO, según las etiquetas del repositorio, pero no se aporta ningún resultado numérico sobre él ni sobre ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (7,7 GB) orienta sobre la huella en disco, pero no permite calcular la VRAM necesaria sin conocer el número de parámetros y la precisión de almacenamiento.
- GPU recomendadas: no disponible en la información proporcionada. Como referencia general para políticas robóticas de este orden de magnitud, se suelen emplear GPU de datacenter tipo A100 o H100, así como GPUs de consumo con 24 GB o más, pero no hay confirmación para este checkpoint concreto.
- Compatibilidad con GPU de consumo: no confirmada. No se puede afirmar que quepa en una RTX 4090 u otra GPU de consumo sin datos de parámetros y precisión.
- Opciones de despliegue: la librería declarada es openpi, por lo que el despliegue esperado pasa por el entorno de ejecución de openpi y por la simulación de LIBERO. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, opciones propias de modelos de lenguaje y no necesariamente aplicables a una política robótica.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia ni rendimiento por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones ni resultados de modelos comparables, y el propio repositorio carece de evaluación publicada, por lo que cualquier comparación cuantitativa sería especulativa.

A modo de contexto cualitativo, el único marco de referencia citado en los metadatos es la librería openpi y el benchmark LIBERO. Los términos de comparación que resultarían relevantes (parámetros, contexto, tasa de éxito en LIBERO, licencia y disponibilidad) figuran a continuación con el estado real de la información:

| Criterio de comparación | Este checkpoint | Alternativas comparables |
|---|---|---|
| Parámetros | No disponible | No disponible |
| Longitud de contexto | No disponible | No disponible |
| Rendimiento en LIBERO | No evaluado (evaluación pendiente) | No disponible |
| Licencia | Apache-2.0 | No disponible |
| Disponibilidad | Hugging Face, 0 descargas y 0 likes en el momento de la consulta | No disponible |

## Limitaciones y advertencias

- Evaluación pendiente: la model card declara explícitamente que la evaluación no se ha realizado y que no se reclama ninguna tasa de éxito. No debe presentarse como un modelo validado.
- Checkpoint intermedio de una búsqueda de hiperparámetros: forma parte de un barrido autorizado y "el cribado puede seleccionar candidatos posteriores", lo que implica que este artefacto puede quedar obsoleto o descartado.
- Ámbito de cambio muy restringido: solo se modifican los multiplicadores de learning rate por módulo, por lo que el comportamiento esperado es cercano al de la configuración de origen; no cabe esperar capacidades nuevas.
- LLM congelado: al no ajustarse el componente de lenguaje, no hay adaptación del modelo a vocabulario, instrucciones o dominios lingüísticos nuevos.
- Sesgos conocidos: no disponibles. La model card no documenta análisis de sesgo, y el dominio de aplicación (manipulación en simulación LIBERO) no permite trasladar conclusiones sobre sesgos sociales.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto libre; sí existe riesgo de generalización incorrecta de la política fuera de la distribución de entrenamiento, especialmente en entornos reales.
- Limitaciones de contexto e idioma: no disponibles. No se documentan ventanas de contexto ni idiomas soportados.
- Transferencia simulación a realidad: no documentada. Los datos declarados son densos de contacto dentro de un entorno de benchmark, sin evidencia de robustez en hardware físico.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación con obligaciones de atribución y aviso, pero el modelo se distribuye sin garantías y sin evaluación que respalde un uso en producción.
- Trazabilidad incompleta: no se especifican dataset, número de muestras ni detalles de la arquitectura, lo que dificulta auditar el origen del comportamiento observado.
- Verificación de pesos: la afirmación de que los pesos congelados están verificados de forma independiente procede del propio autor y no se aporta evidencia externa reproducible en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw20-v0p3-e3-1000-20261015
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información disponible.
