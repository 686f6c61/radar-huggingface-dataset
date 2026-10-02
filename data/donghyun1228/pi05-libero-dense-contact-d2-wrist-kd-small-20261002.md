# Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-small-20261002

## Resumen
Este repositorio contiene un checkpoint de política robótica basado en pi0.5 (pi05), un modelo de visión-lenguaje-acción (VLA) desarrollado por el autor Donghyun1228 y publicado en HuggingFace. El checkpoint corresponde al paso final (9999) de 10.000 actualizaciones de entrenamiento y está especializado en una adaptación de punto de vista ("viewpoint adaptation") sobre el benchmark LIBERO, un conjunto de tareas de manipulación robótica de contacto denso. Forma parte de una familia de experimentos de ajuste fino que adaptan el codificador visual y el LLM base mientras mantienen congelado el experto en acciones.

El modelo se sirve mediante el script `scripts/serve_policy.py` del proyecto, usando una configuración de política específica (`pi05_libero_view_shared_decoder_idm_scale_matched_translation_sweep_cumulative_average_frozen_head_vlm_kd`). Es relevante para investigadores en robótica que trabajan con el ecosistema LIBERO y pi0.5, ya que demuestra técnicas de destilación de representación y ajuste de vista sobre datos recolectados en MuJoCo.

El entrenamiento emplea destilación de IDM (probablemente "inverse dynamics model" o destilación intermedia, no se especifica en la tarjeta) con media acumulada, además de destilación de representación (KD) sobre imagen base, imagen de muñeca y prompt, con pesos 1/1/0.25 respectivamente. El tamaño del repositorio es de 11,5 GB e incluye parámetros de política en formato Orbax y activos de normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action): codificador visual + LLM base + experto en acciones |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precision completa/BF16, sin cuantizacion documentada) |
| Idiomas soportados | no disponible (admite prompts de texto, sin lista de idiomas especificada) |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX) |
| Tamano del repositorio | 11,5 GB |
| Pipeline | robotics |
| Dataset de entrenamiento | Donghyun1228/libero-dense-contact-sweep-d2-20261002 |
| Configuracion de politica | pi05_libero_view_shared_decoder_idm_scale_matched_translation_sweep_cumulative_average_frozen_head_vlm_kd |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura pi0.5, un modelo de visión-lenguaje-acción que combina un codificador visual, un LLM base como backbone y un experto en acciones ("action expert") encargado de producir las acciones motoras a partir de las representaciones del VLM. En este checkpoint concreto, el codificador visual y el LLM base se adaptan durante el entrenamiento, mientras que el experto en acciones permanece congelado. La configuración de política emplea un decodificador compartido de vista y un ajuste ("scale matched translation sweep") sobre distintas vistas.

El entrenamiento consta de 10.000 actualizaciones, de las cuales este repositorio contiene el paso final (9999). Se aplica destilación con media acumulada de H=10 sobre IDM, junto con destilación de representación (KD) de imagen base, imagen de muñeca y prompt con pesos 1/1/0.25. Los lotes globales de IDM y KD son de 32, con entrenamiento distribuido FSDP en 4 GPU y una tasa de aprendizaje de 1e-5. Cada vista desplazada parte de forma independiente desde el mismo checkpoint fuente preservado. Los datos de entrenamiento consisten en 346.229 fotogramas físicos recogidos con MuJoCo 3.2.3, con densidad 2, semilla 7, estado inicial 0 y ángulo de guiñada del marco de acción 0.

## Capacidades
- Generación de acciones motoras continuas para tareas de manipulación robótica (control de brazo/efector final) a partir de observaciones visuales y prompts de instrucción.
- Procesamiento multimodal de entrada: imágenes base e imágenes de muñeca ("wrist image") junto con texto.
- Condicionamiento por lenguaje natural mediante prompts, gracias al LLM base del modelo pi0.5.
- Ejecución de políticas entrenadas específicamente sobre el benchmark LIBERO en escenarios de contacto denso.
- Adaptación a cambios de punto de vista de cámara ("viewpoint adaptation"), gracias al ajuste con vistas desplazadas.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso ni soporte específico de "thinking mode" o audio.

## Casos de uso
- Investigación en manipulación robótica sobre LIBERO: reproducción y evaluación de políticas VLA en las tareas estándar del benchmark, usando el script de servicio incluido y la configuración de política indicada.
- Estudio de adaptación de punto de vista: análisis de cómo un modelo VLA mantiene o degrada su rendimiento cuando la cámara se desplaza respecto a la configuración de entrenamiento, útil para investigación en robustez visual.
- Experimentos de destilación de representaciones en robótica: servir como punto de referencia para reproducir recetas de KD sobre imagen base, imagen de muñeca y prompt, comparando con checkpoints de la misma familia.
- Simulación con MuJoCo: dado que los datos se recolectaron en MuJoCo 3.2.3 y LIBERO usa ese entorno, el modelo es adecuado para ciclos de entrenamiento y evaluación enteramente en simulación.
- Base para ajuste fino posterior: al conservar el estado completo del optimizador a nivel local (según la tarjeta), puede reutilizarse como punto de partida para variaciones de vista o de tarea.
- Evaluación comparativa de políticas VLA: útil como uno de varios checkpoints de una barrida ("sweep") de vistas para medir el efecto de cada vista sobre el éxito de la tarea.
- Docencia y divulgación en robótica con IA: ejemplo práctico de pipeline JAX/Orbax de extremo a extremo para servir políticas VLA.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo no incluye cifras de tasa de éxito en LIBERO, MMLU, HumanEval, GSM8K ni ninguna otra métrica cuantitativa, por lo que no es posible presentar una tabla de rendimiento sin inventar datos.

## Requisitos de hardware
- El repositorio pesa 11,5 GB, lo que corresponde a los parámetros de política en formato Orbax más los activos de normalización. No se especifica el estado del optimizador dentro del repositorio (la tarjeta indica que el estado completo del optimizador se conserva en el checkpoint de entrenamiento local, no necesariamente en este repo).
- El entrenamiento documentado utilizó FSDP sobre 4 GPU. No se indica el modelo concreto de GPU empleado.
- VRAM estimada para inferencia: no disponible de forma explícita; depende del tamaño de los parámetros del modelo pi0.5 subyacente, que no se detalla.
- GPU recomendadas: no disponible. Dado el uso de FSDP con 4 GPU en entrenamiento, se puede inferir que la inferencia requiere una GPU con suficiente memoria para los pesos del modelo, pero no se aporta una cifra concreta.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: el propio repositorio indica el uso del script `scripts/serve_policy.py` con la configuración de política y el directorio del checkpoint (`--env LIBERO policy:checkpoint --policy.config pi05_libero_view_shared_decoder_idm_scale_matched_translation_sweep_cumulative_average_frozen_head_vlm_kd --policy.dir /path/to/model`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero-dense-contact-d2-wrist-kd-small) | pi0.5 (VLA) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| pi0.5 base | VLA | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| OpenVLA | VLA | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos cuantitativos para establecer comparaciones rigurosas con alternativas. La información proporcionada no incluye métricas, tamaños de parámetros ni licencias comparables, por lo que cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias
- La licencia no está especificada, lo que impide determinar si su uso comercial está permitido. Hay que contactar con el autor antes de cualquier uso en producción.
- Es un checkpoint de investigación orientado al benchmark LIBERO y a entornos simulados en MuJoCo; no hay evidencia de transferencia a robots físicos reales.
- El experto en acciones está congelado durante el ajuste, por lo que la adaptación se limita al codificador visual y al LLM base; el comportamiento motor depende fuertemente del checkpoint fuente.
- No hay resultados de benchmarks publicados, por lo que se desconoce su tasa de éxito real en las tareas objetivo.
- No se especifican los idiomas soportados ni la longitud de contexto; el rendimiento con prompts largos o en idiomas distintos del inglés (si fuese el caso) es desconocido.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- Riesgo de alucinación en la interpretación de prompts: como modelo VLA basado en un LLM, puede generar acciones incoherentes ante instrucciones ambiguas o fuera de distribución.
- La receta de entrenamiento depende de un estado del optimizador conservado localmente y de un commit de código congelado; reproducir exactamente el resultado puede requerir acceso a esos artefactos no incluidos en el repositorio.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto de datos de simulación concreto (densidad 2, semilla 7), puede heredar los sesgos de ese conjunto y generalizar mal a otras distribuciones.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-small-20261002
- Dataset de entrenamiento: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Commit del dataset: `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`
- Script de despliegue referenciado: `scripts/serve_policy.py` (incluido en el proyecto del autor; no se proporciona URL directa en la información disponible)
