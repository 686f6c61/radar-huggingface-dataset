# Donghyun1228/pi05-libero-source-free-common-vision-yaw30-1000-20261011

## Resumen

Este repositorio contiene un piloto experimental de adaptación de un modelo visión-lenguaje-acción (VLA) de la familia pi0.5, publicado por el usuario Donghyun1228 bajo las etiquetas robotics, libero, openpi, pi05 y experimental. El objetivo declarado no es entregar una política lista para producción, sino documentar un experimento de adaptación concreta: entrenar únicamente el codificador de visión compartido (SigLIP) con observaciones y acciones de exploración agnósticas a la tarea, manteniendo congelados el LLM de origen, el experto de acción y el resto de proyecciones. El repositorio ocupa 6,1 GB e incluye un export de inferencia en formato Orbax con parámetros y ficheros de normalización.

La propuesta encaja en la línea de investigación de transferencia de conocimiento en manipulación robótica sobre el benchmark LIBERO, y su interés actual reside precisamente en el enfoque metodológico: comprobar si basta con adaptar el encoder visual para obtener un modelo de dinámica inversa (IDM) sin observaciones de origen, sin caché de profesor, sin destilación, sin pérdida de imitación y sin recompensas de tarea. La model card es explícita al señalar que es un piloto completado y que no se reclama que se conserve la tasa de éxito en las tareas; la evaluación se registra por separado en los resultados del proyecto.

Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo desplegable: 0 descargas y 0 likes en el momento de redactar esta ficha, licencia no disponible, idiomas no disponibles y sin resultados de benchmarks publicados en la información accesible. Los detalles de parámetros, contexto y cuantización no se exponen en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA de la familia pi0.5 (openpi) según etiquetas; incluye encoder de visión SigLIP compartido, LLM de origen y experto de acción. Detalle exacto de capas: no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el export se distribuye en formato Orbax, no en cuantizaciones tipo GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (directorio de inferencia con `params` y `assets/donghyun/libero/norm_stats.json`); no incluye estado del optimizador |
| Tamaño del repositorio | 6,1 GB |
| Tarea declarada | robotics (pipeline de HuggingFace: robotics) |
| Fecha de creación / actualización | 2026-10-10 / 2026-10-10 |
| Descargas / likes | 0 / 0 |
| Configuración de política asociada | `pi05_libero_dense_contact_20261002_view_idm_only` (repositorio `vla_adaptation`) |
| Entorno de evaluación | LIBERO con MuJoCo 3.2.3 |
| Variante | yaw30, 1.000 actualizaciones |

## Arquitectura y entrenamiento

El modelo parte de pesos de origen de la familia pi0.5 (openpi) y de sus activos de normalización. La adaptación documentada es deliberadamente minimalista: solo se entrena el encoder de visión compartido, SigLIP, utilizando observaciones y acciones de exploración agnósticas a la tarea objetivo. El LLM de origen, el experto de acción y el resto de proyecciones permanecen congelados, y el mismo encoder sirve tanto las imágenes de cámara base como las de muñeca durante la inferencia de la política. El repositorio incluye un fichero `vision_only_weight_audit.json` con la comparación exacta de pesos congelados tras convertir los valores de origen a los dtypes guardados en destino.

El procedimiento excluye explícitamente cualquier fuente de supervisión habitual en adaptación de VLA: no se usan observaciones de origen, ni caché de profesor emparejada, ni destilación de conocimiento (KD), ni pérdida de imitación, ni rollouts de tareas exitosas, ni recompensas de tarea. La variante se denomina IDM (modelo de dinámica inversa) y el sufijo yaw30 apunta a un ajuste de aumento/rotación de 30 grados aplicado en este piloto, que abarca 1.000 actualizaciones. La model card advierte que se trata de un piloto de entrenamiento completado y que no se reclama que se conserve el éxito en las tareas.

Para reproducir la inferencia hay que restaurar el export Orbax (parámetros más `norm_stats.json`) con la configuración de política `pi05_libero_dense_contact_20261002_view_idm_only` del repositorio `https://github.com/Donghyun1228/vla_adaptation`, usando el commit de código recogido en `generation.json`. Las rutas de `training_plan.json` deben resolverse contra los datasets y activos restaurados localmente, y las revisiones fijas de dataset están registradas también en `generation.json`.

## Capacidades

- Generación de acciones de manipulación robótica: el modelo produce comandos motores a partir de observaciones visuales, en el marco del benchmark LIBERO.
- Procesamiento de visión multi-cámara: un único encoder SigLIP compartido atiende tanto la imagen de cámara base como la de muñeca en el momento de la inferencia.
- Modelado de dinámica inversa (IDM): la adaptación está orientada a inferir acciones a partir de observaciones de exploración, no a imitar demostraciones exitosas.
- Adaptación con datos agnósticos a la tarea: el entrenamiento utiliza observaciones de exploración que no dependen de la tarea objetivo.
- Integración con el ecosistema openpi/pi0.5: el export sigue el formato Orbax y la configuración de política de ese stack.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking), visión general, audio: no disponible; la única modalidad documentada es visión más acción en robótica.

## Casos de uso

- Reproducción de experimentos de adaptación de VLA: el repositorio permite restaurar el checkpoint Orbax con la configuración `pi05_libero_dense_contact_20261002_view_idm_only` y repetir exactamente el piloto de 1.000 actualizaciones sobre el encoder SigLIP, usando las revisiones de dataset fijadas en `generation.json`.
- Estudio de transferencia congelada de encoders visuales: sirve para medir qué aporta entrenar únicamente el encoder SigLIP compartido cuando el LLM y el experto de acción permanecen intactos, comparando después con las variantes de destilación del mismo autor.
- Auditoría de pesos y reproducibilidad: el fichero `vision_only_weight_audit.json` permite verificar qué tensores quedaron congelados y con qué dtypes tras la conversión desde los pesos de origen, un caso de uso directo para validación de pipelines de investigación.
- Evaluación comparativa en LIBERO: con MuJoCo 3.2.3 se puede integrar en la batería de evaluación del benchmark y contrastar el efecto del ajuste yaw30 frente a otras variantes del mismo proyecto.
- Análisis de dinámica inversa sin supervisión de éxito: útil para investigar si un IDM entrenado solo con exploración conserva utilidad como representación auxiliar, aunque la model card no reclame retención del éxito de tarea.
- Base para ablaciones controladas: dado que se documentan explícitamente las fuentes de supervisión excluidas (observaciones de origen, profesor, KD, pérdida de imitación, rollouts exitosos, recompensas), el checkpoint es un punto de partida limpio para añadir una sola de esas señales y medir el delta.
- Referencia metodológica en publicaciones: el par `training_plan.json` y `generation.json` permite citar de forma trazable la configuración, el commit y las revisiones de datos empleados en el piloto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que se trata de un piloto experimental completado y que no se reclama que se conserve la tasa de éxito en las tareas, remitiendo la evaluación de tareas a los resultados del proyecto, que no se incluyen en los datos proporcionados. No se dispone de cifras de LIBERO ni de ningún otro benchmark para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,1 GB, pero ese tamaño corresponde al export Orbax de parámetros más activos y no permite derivar directamente el consumo en memoria de inferencia.
- GPU recomendadas: no disponible. No se documentan requisitos de hardware en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; no puede confirmarse con los datos accesibles.
- Opciones de despliegue: el formato es Orbax, por lo que el despliegue natural es el stack openpi/JAX asociado a pi0.5 y la configuración `pi05_libero_dense_contact_20261002_view_idm_only`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Entorno de simulación: para la evaluación se requiere LIBERO con MuJoCo 3.2.3, tal como indica la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Supervisión usada en adaptación | Estado | Licencia |
|---|---|---|---|---|---|
| pi05-libero-source-free-common-vision-yaw30-1000-20261011 (este modelo) | Piloto VLA, solo encoder SigLIP | Orbax | Solo observaciones y acciones de exploración agnósticas a la tarea | Experimental, 1.000 actualizaciones | no disponible |
| pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011 | Variante del mismo autor | Orbax | Enfoque raw, con plan de entrenamiento, metadatos de generación y comparación raw/EMA | Experimental, checkpoint base de 51 hojas antes de composición con muñeca | no disponible |
| pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003 | Variante del mismo autor | Orbax | IDM con media acumulada H=10 y KD de representación base/muñeca/prompt (pesos 1/1/0,25) | Paso 9.999 de 10.000 actualizaciones | no disponible |
| pi0.5 / openpi (modelo base de origen) | VLA completo | Orbax y otros del stack openpi | Entrenamiento original del modelo base | Modelo de referencia del ecosistema | no disponible en esta información |

La comparación se limita a los artefactos del mismo autor y al stack de origen, porque no se han proporcionado datos de parámetros, contexto ni rendimiento de alternativas externas que permitan una comparación cuantitativa honesta.

## Limitaciones y advertencias

- Carácter experimental explícito: la model card indica que es un piloto de entrenamiento completado y que no se reclama que se conserve la tasa de éxito en las tareas. No debe presentarse como una política fiable.
- Ausencia de resultados de evaluación: no hay cifras de éxito en LIBERO ni de ningún otro benchmark en la información disponible; la evaluación se registra aparte y no se incluye aquí.
- Licencia no disponible: sin una licencia declarada no puede asumirse ningún permiso de uso comercial, redistribución o modificación. Cualquier uso en producción queda bloqueado a efectos prácticos hasta que se aclare.
- Idiomas no disponibles: no se documenta ningún soporte lingüístico; el modelo opera con instrucciones/prompts propios del benchmark LIBERO, no como asistente conversacional.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo para este checkpoint.
- Riesgo de alucinación: no aplica en el sentido textual habitual, pero sí existe riesgo de comportamiento errático o acciones sin sentido físico al ser una política no validada en tareas.
- Restricciones de contexto e idioma: la longitud de contexto y el formato exacto de prompt no están documentados en la información proporcionada.
- Ausencia de estado del optimizador: el export Orbax no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento tal cual desde este artefacto.
- Dependencia estricta de versiones: la reproducción exige el commit de código indicado en `generation.json`, las revisiones de dataset fijadas y MuJoCo 3.2.3 para la evaluación; desviarse de esas versiones invalida la comparabilidad.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de redactar esta ficha, sin evidencia externa de validación por terceros.
- Pertinencia técnica: la adaptación toca únicamente el encoder de visión compartido; cualquier limitación del LLM o del experto de acción congelados se hereda sin cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-vision-yaw30-1000-20261011
- Variante raw del mismo autor: https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011
- Variante con KD de muñeca: https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003
- Repositorio de código de adaptación: https://github.com/Donghyun1228/vla_adaptation
- Repositorio LIBERO_view (transferencia de conocimiento en LIBERO): https://github.com/Donghyun1228/LIBERO_view/tree/master/
- Lista de modelos de IA sin censura (resultado de búsqueda relacionado): https://github.com/samssouza/uncensored-ai-list
- Biblioteca de modelos YOLO y ONNX de la comunidad (resultado de búsqueda relacionado): https://mossymodels.com/
