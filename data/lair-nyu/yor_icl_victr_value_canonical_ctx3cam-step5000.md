# lair-nyu/yor_icl_victr_value_canonical_ctx3cam-step5000

## Resumen

`lair-nyu/yor_icl_victr_value_canonical_ctx3cam-step5000` es un checkpoint de política robótica (paso 5000) publicado por el usuario `lair-nyu` en HuggingFace. Según su model card, se trata de una variante VICTR sobre pi0.5, con contexto de recuperación de 3 cámaras y k=1, y con recuperación basada en una métrica de valor (`value-metric retrieval`). El entrenamiento se inició por *warm start* desde el checkpoint `yor_icl_pi05_canonical_extended` en el paso 40000.

El repositorio no contiene la arquitectura ni las transformaciones de datos: solo incluye `params/` (pesos), `assets/` (`norm_stats.json`) y `_CHECKPOINT_METADATA`, y se ha eliminado `train_state/` (estado del optimizador, aproximadamente 1,5 veces el tamaño de `params/`). Para cargarlo es imprescindible disponer del repositorio `openpi` con la configuración de entrenamiento `yor_icl_victr_value_canonical_ctx3cam`.

Es relevante únicamente como artefacto de investigación en el ámbito de las políticas visión-lenguaje-acción (VLA) con aprendizaje en contexto mediante recuperación. No tiene descargas ni *likes*, no declara licencia, no incluye benchmarks y no se ha encontrado documentación adicional en la búsqueda web.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) basada en pi0.5; detalle interno no disponible en la model card |
| Parámetros totales | no disponible (el repositorio ocupa 12,4 GB y contiene solo pesos y estadísticas de normalización) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | contexto de recuperación de 3 cámaras con k=1; longitud de contexto en tokens no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se distribuye un directorio `params/`; no se especifica el formato de serialización) |
| Autor / organización | lair-nyu |
| ID del repositorio | lair-nyu/yor_icl_victr_value_canonical_ctx3cam-step5000 |
| Paso de entrenamiento | 5000 |
| Inicialización | warm start desde `yor_icl_pi05_canonical_extended` (paso 40000) |
| Contenido del repositorio | `params/`, `assets/norm_stats.json`, `_CHECKPOINT_METADATA` |
| Tamaño del repositorio | 12,4 GB |
| Fecha de creación (metadatos HF) | 2026-09-14 |
| Fecha de última actualización (metadatos HF) | 2026-09-14 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La model card describe el modelo como «VICTR pi0.5», es decir, una política construida sobre la familia pi0.5, con dos modificaciones explícitas: un contexto de recuperación procedente de 3 cámaras con k=1, y una selección de ejemplos de recuperación guiada por una métrica de valor. La ficha no desarrolla las siglas VICTR ni detalla el mecanismo de recuperación más allá de estas etiquetas, y no aporta información sobre el número de parámetros, la composición del dataset, el número de tokens de entrenamiento ni sobre si se aplicaron etapas de RLHF o DPO.

Lo que sí se documenta es el procedimiento de entrenamiento: el modelo se inicializó por *warm start* desde `yor_icl_pi05_canonical_extended` en el paso 40000 y se continuó entrenando hasta el paso 5000 de esta ejecución concreta. El repositorio conserva únicamente los pesos y las estadísticas de normalización (`norm_stats.json`), y descarta el estado del optimizador, por lo que no permite reanudar el entrenamiento, solo inferencia o evaluación.

La carga del checkpoint depende de código externo: es necesario el repositorio `openpi` con la configuración `yor_icl_victr_value_canonical_ctx3cam` definida en `openpi/src/openpi/training/config.py`. Dicha configuración aporta la arquitectura y las transformaciones de datos que el repositorio de HuggingFace no incluye.

## Capacidades

- Generación de acciones motoras para control robótico a partir de observaciones visuales, en el marco de una política VLA basada en pi0.5.
- Procesamiento de entradas multi-cámara: el contexto de recuperación se construye a partir de 3 cámaras.
- Aprendizaje en contexto (ICL) mediante recuperación de ejemplos, con k=1 en esta configuración.
- Selección de ejemplos de recuperación guiada por una métrica de valor, según la denominación del checkpoint.
- Reanudación del entrenamiento: no soportada en este repositorio, ya que `train_state/` se ha eliminado.
- *Tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo *thinking*, visión general, audio): no documentadas; la única modalidad documentada es la observación visual multi-cámara para control motor.

## Casos de uso

- Reproducción de experimentos de aprendizaje en contexto en políticas VLA: cargando el checkpoint con la configuración `yor_icl_victr_value_canonical_ctx3cam` de `openpi`, un laboratorio puede reproducir la evaluación de esta variante concreta (3 cámaras, k=1, recuperación por métrica de valor).
- Ablación de estrategias de recuperación: al existir el checkpoint predecesor `yor_icl_pi05_canonical_extended` en el paso 40000, este modelo permite comparar el efecto de la recuperación guiada por métrica de valor frente a la configuración base, manteniendo el resto del pipeline.
- Estudio del efecto del número de pasos de entrenamiento: comparar el paso 5000 de esta ejecución con el paso 40000 heredado del *warm start* para analizar convergencia y degradación de la política.
- Punto de partida para nuevos entrenamientos: al ser un checkpoint de pesos sin estado del optimizador, es adecuado como inicialización de nuevos *fine-tunings* en lugar de como punto de reanudación.
- Experimentos de manipulación con montaje de tres cámaras: el modelo está configurado explícitamente para ese número de vistas, por lo que encaja en *setups* de laboratorio con tres cámaras fijas sobre el área de trabajo.
- Evaluación de robustez ante cambios en el conjunto de recuperación: al fijar k=1, permite estudiar cómo varía el comportamiento de la política cuando el ejemplo recuperado cambia, algo directamente relacionado con la variabilidad del contexto visual.
- Base para investigación en ICL aplicado a robótica: sirve como referencia interna del proyecto `lair-nyu` para comparar variantes de contexto (por ejemplo, distintos valores de k o distintas métricas de recuperación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de tareas de manipulación ni comparaciones cuantitativas, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a páginas genéricas de buscadores, sin relación con el repositorio).

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 12,4 GB y contiene únicamente pesos y estadísticas de normalización. Si los pesos estuvieran en fp32, el orden de magnitud sería de unos 3 × 10⁹ parámetros; si estuvieran en bf16, de unos 6 × 10⁹. El dato exacto de parámetros y de precisión no está disponible, por lo que la estimación de VRAM debe considerarse orientativa.
- GPU recomendadas: no indicadas por el autor. Por el tamaño del repositorio, un despliegue con los pesos en memoria requiere tarjetas de gama alta con al menos 24 GB de VRAM en el caso más desfavorable; A100 (40/80 GB) y H100 son opciones seguras, y una RTX 4090 o RTX 3090 (24 GB) podría ser suficiente si los pesos caben en esa franja, algo que no puede confirmarse con los datos disponibles.
- Cabe en GPU de consumo: no confirmado. Depende del número real de parámetros y de la precisión, que no se documentan.
- Opciones de despliegue: el único procedimiento documentado es la carga mediante `openpi.policies.policy_config.create_trained_policy` con la configuración de entrenamiento correspondiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y por el tipo de modelo (política VLA con entradas de imagen multi-cámara) no son herramientas previstas para este caso.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos verificables de benchmarks ni de rendimiento para este checkpoint, por lo que no es posible establecer una comparación cuantitativa. La comparación que sigue se limita a lo que declara la model card y a la relación entre artefactos del mismo proyecto.

| Modelo | Relación | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| yor_icl_victr_value_canonical_ctx3cam-step5000 | Este checkpoint | no disponible | 3 cámaras, k=1 | no disponible | no disponible |
| yor_icl_pi05_canonical_extended (paso 40000) | Predecesor usado como *warm start* | no disponible | no disponible | no disponible | no disponible |
| pi0.5 (base de la familia) | Arquitectura de referencia | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso, lo que impide asumir viabilidad para uso comercial o para redistribución.
- Artefacto incompleto por diseño: el repositorio solo contiene pesos y estadísticas de normalización. Sin la configuración `yor_icl_victr_value_canonical_ctx3cam` del repositorio `openpi`, el checkpoint no es cargable.
- Sin estado del optimizador: no se puede reanudar el entrenamiento desde este repositorio, solo inicializar uno nuevo.
- Ausencia total de evaluación publicada: no hay benchmarks, tasas de éxito ni métricas de tareas, por lo que no existe evidencia de rendimiento más allá de la denominación del checkpoint.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Riesgo de acciones fuera de distribución: en políticas VLA, una recuperación inadecuada del contexto (k=1 deja el comportamiento dependiente de un único ejemplo) puede degradar la política; este riesgo no está cuantificado en la documentación.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto o idioma: no disponibles; no se especifican idiomas soportados ni límites de longitud de contexto en tokens.
- Dependencia de un montaje concreto: el contexto está definido para 3 cámaras y k=1, de modo que su uso con otro número de vistas o con otro valor de k no está respaldado por la documentación.
- Advertencia para producción: dado que no hay licencia, benchmarks ni mantenimiento declarado, este checkpoint debe tratarse como material de investigación interna y no como componente listo para producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lair-nyu/yor_icl_victr_value_canonical_ctx3cam-step5000
- Proyecto `openpi` referenciado en la model card (contiene `src/openpi/training/config.py`, donde se define la configuración `yor_icl_victr_value_canonical_ctx3cam`): https://github.com/Physical-Intelligence/openpi
- Checkpoint predecesor citado como origen del *warm start*: `yor_icl_pi05_canonical_extended` (paso 40000); no se ha localizado un enlace directo en la información disponible.
- Resultados de la búsqueda web: no se encontró ningún resultado relevante sobre este modelo (paper, blog, demo o repositorio asociado).
