# Donghyun1228/pi05-libero-source-free-common-split-vision-yaw30-1000-20261011

## Resumen

El modelo `Donghyun1228/pi05-libero-source-free-common-split-vision-yaw30-1000-20261011` es un checkpoint experimental de robótica publicado por Donghyun1228 dentro del ecosistema openpi/pi05, la familia de modelos visión-lenguaje-acción (VLA) orientados a manipulación. No es un entrenamiento nuevo: es una intervención de composición sobre un modelo objetivo ya entrenado durante 1.000 actualizaciones, en la que el autor reutiliza los pesos existentes y restaura un codificador de muñeca a partir de los pesos de visión del modelo de origen.

El problema que aborda es la adaptación "sin observaciones de origen" con visión dividida ("split vision"): la cámara base mantiene el codificador adaptado del modelo objetivo, mientras que las imágenes de muñeca usan un codificador `wrist_img` restaurado desde los pesos de visión de origen y convertido a bfloat16. La composición final contiene 74 hojas de parámetros (51 del objetivo y 23 del codificador de muñeca de origen), sin ninguna actualización adicional de optimizador.

Es relevante como material de investigación reproducible para tareas de manipulación LIBERO y para estudiar el enrutado de visión en políticas VLA, pero debe tratarse como experimental: el propio autor advierte que la retención de éxito no ha sido establecida. No se dispone de datos públicos sobre número de parámetros, longitud de contexto ni licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) basado en openpi/pi05; composición de visión dividida con codificador de cámara base, codificador `wrist_img`, LLM, decodificador de acciones y proyecciones (detalle fino no disponible) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (se menciona el cast del codificador de muñeca a bfloat16); resto no disponible |
| Idiomas soportados | no disponible (modelo de acciones robóticas, no de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | Orbax (export de inferencia para JAX); se incluye `params/` y `assets/donghyun/libero/norm_stats.json`; no se incluye estado del optimizador |

## Arquitectura y entrenamiento

La composición parte de un modelo objetivo "vision-only IDM" cuyas 51 hojas de parámetros se preservan exactamente, manteniendo activo su codificador de cámara base adaptado. Las imágenes de muñeca se enrutan a un codificador separado `wrist_img`, restaurado desde los pesos de visión del modelo de origen y convertido a bfloat16. El LLM, el decodificador de acciones y las proyecciones del objetivo ya coinciden con los del origen tras su conversión de dtype guardada y permanecen sin cambios. En total, el compuesto suma 74 hojas de parámetros y cero actualizaciones adicionales de optimizador.

No hay entrenamiento nuevo. La adaptación del modelo objetivo se realizó con interacciones objetivo agnósticas a la tarea, sin observaciones de origen, sin caché de profesor emparejado, sin rollouts de tareas exitosas y sin retroalimentación de éxito de tarea; los pesos y la normalización del origen sí se permitieron como entradas. El checkpoint fuente heredado es una ruta local (`/disk3/ryu/donghyun_dense_contact_tasks_20260926/checkpoints/pi05_libero_shared_decoder_idm_scale_matched_translation_sweep_cumulative_average_pre_adapt/pi05_libero_dense_contact_d2_10k_20260926_source/9999`) y no consta un repositorio público verificado para él. La metadata de parámetros del origen tiene SHA256 `2912d15ba42fe0d742b5ac46e88804dacce69644369b4cf9b7405cf7d8fe7247`.

## Capacidades

- Control robótico por imitación (política de acciones) sobre entornos LIBERO.
- Procesamiento de visión multimodestidad con enrutado dividido: cámara base mediante el codificador adaptado y cámara de muñeca mediante el codificador `wrist_img` restaurado.
- Ejecución como modelo de dinámica inversa (IDM) solo-visión, según la descripción del modelo objetivo.
- Inferencia con exportación Orbax sobre JAX mediante la configuración de política `pi05_libero_source_free_split_vision_idm`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo de razonamiento explícito, audio ni visión generalista fuera del ámbito robótico.

## Casos de uso

- Reproducción de evaluación en LIBERO: cargar el checkpoint con la configuración exacta `pi05_libero_source_free_split_vision_idm` y `mujoco==3.2.3` para ejecutar tareas de manipulación y registrar el éxito de forma independiente, dado que la retención no está establecida.
- Investigación sobre visión dividida: estudiar cómo afecta enrutar la muñeca a un codificador restaurado del origen frente a compartir codificador, manteniendo la cámara base en el codificador adaptado del objetivo.
- Estudio de adaptación sin observaciones de origen: analizar el efecto de entrenar con interacciones objetivo agnósticas a la tarea, sin caché de profesor ni feedback de éxito.
- Ablaciones de codificadores de muñeca: comparar las 23 hojas de parámetros restauradas frente a variantes compartidas, ya que el autor advierte que una configuración de codificador compartido no debe cargar este checkpoint.
- Auditoría de procedencia de pesos: usar los archivos de procedencia (hashes de hojas de muñeca, marcador de commit del origen, auditoría de composición y auditoría de pesos congelados) para verificar la integridad de la composición.
- Referencia para pipelines de evaluación robótica en JAX/Orbax: integrar el export de inferencia en flujos automatizados de evaluación sobre LIBERO con control estricto de versiones.
- Comparación de políticas VLA en tareas de contacto denso: emplear el checkpoint como punto de comparación frente a otros modelos de la familia pi05 en escenarios de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la retención de éxito no ha sido establecida y que la evaluación de tareas se registra por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 6,8 GB y la inferencia se realiza en bfloat16, por lo que se requiere al menos espacio suficiente para los pesos más activaciones del LLM y los codificadores de visión (no cuantificado en la información).
- GPU recomendadas: no disponibles en la información; al ser un export JAX/Orbax, se asume uso de GPU compatible con JAX (por ejemplo, familia NVIDIA), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; dado el tamaño del repositorio (6,8 GB) es plausible en GPUs de consumo con VRAM suficiente, pero no está verificado en la información.
- Opciones de despliegue: JAX con exportación Orbax y la configuración de política `pi05_libero_source_free_split_vision_idm`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI. Para evaluación LIBERO se debe mantener `mujoco==3.2.3`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-source-free-common-split-vision-yaw30-1000 (este) | no disponible | no disponible | no disponible (retención de éxito no establecida) | no disponible | Público en HuggingFace (0 descargas, 0 likes) |
| pi05-libero-source-free-common-vision-yaw30-1000 (modelo objetivo) | no disponible | no disponible | no disponible | no disponible | Público en HuggingFace (commit `ba4e597f...`) |
| Otros modelos de la familia openpi/pi05 (por ejemplo, pi0, pi0.5) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |

No se dispone de datos comparativos verificables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor declara "intervention with no new training updates" y que la retención de éxito no ha sido establecida. No debe asumirse que conserva el rendimiento del modelo objetivo.
- La adaptación del objetivo se hizo sin observaciones de origen, sin caché de profesor, sin rollouts exitosos y sin feedback de éxito, lo que limita la evidencia de generalización.
- Licencia no disponible: existe riesgo legal para uso comercial; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Debe cargarse únicamente con la configuración exacta `pi05_libero_source_free_split_vision_idm`; una configuración de codificador compartido no debe cargar este checkpoint.
- No se incluye estado del optimizador, por lo que no es apto para reanudar entrenamiento tal cual.
- Las rutas de máquina de construcción en las auditorías son datos de procedencia, no URL de descarga; el checkpoint fuente heredado no tiene repositorio público verificado.
- No se documentan idiomas, soporte de lenguaje natural ni capacidades generalistas; las salidas son acciones de control robótico.
- Riesgo de sobreajuste al benchmark LIBERO y a las condiciones concretas de evaluación (`mujoco==3.2.3`).
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí de acciones erróneas en entornos fuera de distribución.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-split-vision-yaw30-1000-20261011
- Modelo objetivo (1.000 actualizaciones, commit fijado): https://huggingface.co/Donghyun1228/pi05-libero-source-free-common-vision-yaw30-1000-20261011/tree/ba4e597f09713a78691a30df5a72b8e42e3eaace
- Repositorio de código `vla_adaptation` (commit fijado): https://github.com/Donghyun1228/vla_adaptation/tree/0f6471d99dfc81fabe7c3ab65c141d7640b9ff08
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; los resultados recuperados no guardan relación con el modelo (contenido sobre música y cotización de la plata).
