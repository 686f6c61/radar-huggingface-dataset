# kiroaiseoul/NAJY_act_all11_c100_gist30_27D_60k_s1000

## Resumen

NAJY_act_all11_c100_gist30_27D_60k_s1000 es un checkpoint de política robótica entrenado con ACT (Action Chunking Transformer) dentro del ecosistema LeRobot, publicado por el usuario `kiroaiseoul`. No es un modelo de lenguaje: es un modelo de imitación que mapea observaciones sensoriales de un robot a comandos de acción de 16 dimensiones, a partir de un estado propioceptivo de 27 dimensiones y tres cámaras RGB (una elevada y dos en muñecas) a resolución 480x640.

El checkpoint corresponde al paso 60.000 de la ejecución `exp_all11_c100_gist30_long_s1000`, entrenada según la model card en la unidad "DGX_1" y asociada al manifiesto de dataset `configs/datasets/all11_tr_hot_gist30.json`. El autor indica explícitamente que la subida es para análisis y puntuación, y que no equivale a confirmar el modelo como candidato de despliegue en robot real.

Su relevancia es acotada y muy específica: sirve como material de evaluación reproducible para quien trabaja con el robot Trossen Mobile AI y el pipeline de LeRobot, gracias a que se publica el hash SHA-256 de los pesos y a que el repositorio conserva la estructura `pretrained_model` esperada por las herramientas de evaluación del proyecto. El repositorio tiene 13 descargas, 0 likes y un tamaño de 0,2 GB, con 51.700.368 parámetros totales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer); etiquetas `act` y `lerobot` en HuggingFace |
| Parámetros totales | 51.700.368 (aproximadamente 51,7 M), dato real de los safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: es una política de control. Entrada de un paso con estado de 27 dimensiones y 3 imágenes de 3x480x640; el tamaño del chunk de acción no está documentado |
| Tipos de cuantización | no disponible (el repositorio distribuye safetensors; no se documenta precisión ni variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, no procesa ni genera lenguaje); la model card no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), estructura `pretrained_model` de LeRobot |
| Dimensión de observación (estado) | 27 |
| Dimensión de acción | 16 |
| Entradas visuales | `observation.images.cam_high`, `observation.images.cam_left_wrist`, `observation.images.cam_right_wrist`, cada una de 3x480x640 |
| Paso de entrenamiento | 60.000 |
| Ejecución | `exp_all11_c100_gist30_long_s1000` |
| Tamaño del repositorio | 0,2 GB |
| Hash SHA-256 de `model.safetensors` | `8a6b236717f645792b2c7753b21c54b325e4e621f3ae1228434ecca24339a194` |
| Descargas / likes | 13 / 0 |
| Fecha de creación (según HuggingFace) | 2026-10-10 |

## Arquitectura y entrenamiento

Se trata de una política ACT, la arquitectura de imitación basada en transformer encoder-decoder con predicción de chunks de acción popularizada en el contexto de ALOHA y adoptada por LeRobot. La información disponible no detalla el número de capas, la dimensión oculta, los backbones visuales ni el mecanismo exacto de agregación temporal, por lo que esos datos quedan como no disponibles. La firma de entrada es heterogénea y multimodalde: vector de estado de 27 dimensiones más tres flujos de imagen de 3x480x640, con salida de 16 dimensiones de acción, lo que encaja con una plataforma móvil con dos brazos (el nombre del modelo incluye el sufijo `27D`, coherente con la dimensión de estado).

Sobre el entrenamiento, la model card aporta la primera línea del log de lanzamiento: `=== launch 2026-10-09T15:45:55+00:00 git 1e87287 manifest configs/datasets/all11_tr_hot_gist30.json sha256 8929a4d63ce012db`, y sitúa el checkpoint en el paso 60.000 de la ejecución `exp_all11_c100_gist30_long_s1000`, entrenada en la unidad "DGX_1". No se especifica el número de episodios, la composición del dataset, el número de tokens ni si hubo etapas de refinamiento tipo RLHF o DPO, algo por otra parte poco habitual en aprendizaje por imitación. El significado de los fragmentos del nombre (`all11`, `c100`, `gist30`, `s1000`) no está documentado en la información disponible. El campo de banderas del manifiesto aparece como `{}` y el autor remite al documento `docs/mobile_base_investigation.md`, sección 94, del proyecto `trossen-ai-simulation` como contexto de la investigación sobre base móvil.

## Capacidades

- Generación de acciones de control de 16 dimensiones a partir de observaciones multimodales (estado propioceptivo de 27 dimensiones y tres vistas RGB).
- Política de manipulación condicionada visualmente, con una vista elevada y dos vistas de muñeca, lo que permite razonar sobre la escena y sobre la configuración de ambos efectores.
- Predicción por chunks de acción propia de ACT, orientada a movimientos suaves y coherentes en lugar de control paso a paso (el tamaño concreto del chunk no está documentado).
- Compatible con el ecosistema LeRobot: el repositorio mantiene la estructura `pretrained_model`, de modo que puede cargarse con las utilidades de evaluación del proyecto (por ejemplo, herramientas que aceptan `--checkpoint <carpeta>`).
- Verificación de integridad: el hash SHA-256 publicado permite comprobar que los pesos descargados son los entrenados.
- No dispone de tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso, ni planificación simbólica.
- No tiene capacidades multilingües ni de generación de texto.
- No hay modo "thinking", ni entrada o salida de audio, ni comprensión semántica de instrucciones: la visión se usa exclusivamente como condicionamiento de la política.

## Casos de uso

- Evaluación y puntuación de checkpoints: es el uso declarado por el autor; el modelo se integra en herramientas de análisis que leen banderas desde `multi_manifest.json` en la misma carpeta, lo que permite comparar el paso 60.000 frente a otros pasos de la misma ejecución.
- Investigación en aprendizaje por imitación con acción fragmentada: sirve como referencia reproducible para estudiar el comportamiento de ACT con tres cámaras y espacios de estado y acción de alta dimensión.
- Manipulación móvil bimanual en la plataforma Trossen Mobile AI: la combinación de estado de 27 dimensiones y acción de 16 dimensiones sugiere control coordinado de base y brazos, y el modelo está entrenado para ese cuerpo concreto.
- Ajuste fino sobre datos propios del mismo robot: al ser un checkpoint intermedio con licencia Apache-2.0, puede reentrenarse con nuevos manifiestos de dataset manteniendo la firma de observaciones y acciones.
- Línea base en comparativas internas de políticas: permite contrastar ACT frente a otras familias de políticas de imitación sobre el mismo conjunto de datos y la misma plataforma, siempre que se respete la interfaz de entrada.
- Reproducción de experimentos: la publicación del hash del dataset, del hash de los pesos y del commit de Git (`1e87287`) facilita replicar la ejecución y auditar resultados en un entorno de laboratorio.
- Diagnóstico de condicionamiento por etapa: la model card menciona explícitamente herramientas como `stage_cond_diag.py`, lo que apunta a su uso en el análisis de cómo la política responde a distintas condiciones de la tarea a lo largo de las once etapas del conjunto `all11`.
- Docencia y prototipado en robótica: al ocupar 0,2 GB y contar con unos 51,7 M de parámetros, es manejable en equipos de laboratorio modestos para prácticas de despliegue de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasas de éxito, ni evaluaciones en simulación, ni métricas de error de acción. Tampoco los resultados de la búsqueda web aportan datos: los enlaces recuperados tratan sobre exposiciones y archivos de Andy Warhol y no guardan relación con el modelo.

## Requisitos de hardware

- Estimación de peso de los pesos: 51,7 M de parámetros equivalen a unos 207 MB en fp32 y unos 103 MB en fp16 (cálculo propio a partir del recuento de parámetros; la precisión real del checkpoint no está documentada).
- VRAM estimada para inferencia: del orden de 1 a 2 GB en fp32 si se incluyen los búferes de las tres entradas de 3x480x640 (unos 2,76 millones de valores por paso, aproximadamente 11 MB por tensor de entrada en fp32). Es una estimación, no un dato publicado.
- GPU recomendadas: no hay recomendación oficial. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100; en estas dos últimas el modelo queda muy infrautilizado.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta moderna con 4 GB o más, aunque la latencia real depende de los backbones visuales y no está documentada.
- Despliegue: LeRobot sobre PyTorch con pesos safetensors; el repositorio conserva la estructura `pretrained_model` que esperan las utilidades del proyecto. vLLM, TGI, llama.cpp y Ollama no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican frecuencia de control, tiempo de inferencia por paso ni tamaño del chunk de acción.
- Inferencia en CPU: técnicamente viable por el reducido número de parámetros, pero sin datos de rendimiento publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_27D_60k_s1000 (este) | 51,7 M | Estado 27 dims + 3 cámaras 480x640; acción 16 dims | No publicado | apache-2.0 | HuggingFace, 13 descargas, 0 likes |
| Otros checkpoints ACT de LeRobot | no disponible | no disponible | no disponible | habitualmente apache-2.0 | HuggingFace Hub |
| ACT original (contexto ALOHA) | no disponible | no disponible | no disponible | no disponible | Publicación académica |
| Políticas de difusión para robótica (Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | Repositorios públicos |

No se dispone de datos verificables de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada, y la búsqueda web no devolvió ninguna fuente relacionada con robótica, LeRobot o ACT, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no comprende ni genera texto y no admite instrucciones en lenguaje natural.
- El propio autor advierte que la subida es para análisis y puntuación, y que no constituye la confirmación de un candidato de despliegue en robot real.
- No hay benchmarks ni tasas de éxito publicadas, por lo que se desconoce su rendimiento real en tareas de manipulación.
- Fuerte acoplamiento al hardware: estado de 27 dimensiones, acción de 16 dimensiones y tres cámaras con nombres fijos (`cam_high`, `cam_left_wrist`, `cam_right_wrist`). Cualquier cambio de sensores, resolución o morfología exige reentrenamiento.
- Riesgo de sobreajuste al conjunto de entrenamiento asociado al manifiesto `all11_tr_hot_gist30.json`; no se documenta ninguna evaluación fuera de distribución ni capacidad de generalización a entornos nuevos.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas ante observaciones fuera de la distribución de entrenamiento; es un comportamiento esperable en políticas de imitación sin mecanismos de verificación.
- La model card está redactada en coreano y contiene instrucciones del autor (verificación con `sha256sum`, uso del manifiesto de banderas). Deben tratarse como documentación de referencia, no como órdenes a ejecutar automáticamente.
- La licencia apache-2.0 permite uso comercial del artefacto, pero no se especifican las condiciones de los datos de entrenamiento ni de las dependencias de LeRobot, que podrían tener términos propios.
- Validación externa prácticamente nula: 13 descargas y 0 likes en el momento de redactar esta ficha.
- No se documentan la frecuencia de control, la normalización de acciones, la precisión numérica del checkpoint ni el tamaño del chunk, datos imprescindibles para un despliegue serio.
- Los resultados de la búsqueda web no contienen ninguna fuente relacionada con el modelo, por lo que no ha sido posible contrastar ninguna afirmación de la model card con documentación independiente.

## Enlaces

- HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_27D_60k_s1000
- Repositorio de contexto citado en la model card: `trossen-ai-simulation`, documento `docs/mobile_base_investigation.md`, sección 94 (no se proporciona URL pública en la información disponible)
- Paper de ACT: no disponible en la información proporcionada
- Repositorio de LeRobot: no disponible en la información proporcionada
- Nota sobre la búsqueda web: los resultados recuperados (archive.org, warholstars.org, warholfoundation.org, warhol.org) tratan sobre Andy Warhol y no tienen relación con este modelo, por lo que no se incluyen como referencias válidas.
