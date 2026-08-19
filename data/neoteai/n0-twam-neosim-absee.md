# NeoteAI/n0-twam-neosim-absee

## Resumen

N0-TWAM es un modelo de acción-mundo (world action model) nativo táctil desarrollado por NeoteAI en colaboración con el equipo TEAI de la Universidad de Fudan. Está diseñado para manipulación robótica con contacto rico, donde predice simultáneamente el futuro visual, el futuro táctil y las acciones de bajo nivel que lo realizan. Es, según sus autores, el primer modelo de acción-mundo táctil entrenado a gran escala.

El checkpoint `n0-twam-neosim-absee` es una versión post-entrenada (post-trained) del modelo base N0-TWAM, especializada en 12 tareas del benchmark NeoSim (4 de brazo único y 8 de brazo dual), usando acciones de efector final absoluto (absolute end-effector, absEE). El modelo tiene 7.207.357.844 parámetros (aproximadamente 7,2 mil millones) y se distribuye bajo licencia Apache 2.0 en formato safetensors. Está diseñado para servirse con configuración específica por tarea, ya que cada tarea usa sus propias estadísticas de normalización.

La relevancia de este modelo radica en su enfoque táctil-nativo: en lugar de depender exclusivamente de la visión, integra flujos táctiles sincronizados por dedo (GelSight sin marcadores), lo que permite abordar tareas de manipulación de precisión donde el contacto es crítico, como inserción de conectores, apilado de objetos frágiles o ensamblaje de piezas pequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (visión, táctil y acción) |
| Parametros totales | 7.207.357.844 (7,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 14,4 GB) |

## Arquitectura y entrenamiento

N0-TWAM emplea una arquitectura Mixture-of-Transformers que modela conjuntamente visión, táctil y acción bajo un objetivo unificado de rectified-flow / flow-matching. El modelo predice tres flujos acoplados para cada chunk temporal: video futuro, táctil futuro y acción. Esta arquitectura permite que los expertos modales (visión y táctil) predigan el futuro antes de generar la acción, lo que lo convierte en un modelo de acción-mundo propiamente dicho.

El checkpoint `n0-twam-neosim-absee` es un post-entrenamiento multi-tarea del modelo base `n0-twam-base`, entrenado sobre 12 tareas del benchmark NeoSim (4 de brazo único: inserción USB, agarre de chip, verter bola, reenchufar conector; 8 de brazo dual: apilado/desapilado de cuencos y tazas, entrega de taza, apilado de platos, ensamblaje de engranajes e inserción de tornillo). El entrenamiento se realizó sobre flujos táctiles GelSight RGB sin marcadores, y cada tarea utiliza sus propias estadísticas de normalización (norm) para las acciones y las observaciones.

El pre-entrenamiento se realizó a gran escala con entrenamiento conjunto visuo-táctil sobre datos ricos en contacto. El post-entrenamiento sigue la receta descrita en el repositorio GitHub del proyecto (POST_TRAINING.md), que también incluye variantes con acciones delta (delta EE) y el conjunto UniVTAC 8 (8 tareas de brazo único heredadas de UniVTAC).

## Capacidades

- Predicción de futuro visual y táctil acoplados con generación de acciones de bajo nivel.
- Manipulación con contacto rico: inserción de conectores, agarre de objetos frágiles, apilado de vajilla.
- Soporte de tareas de brazo único y brazo dual (bimanuales).
- Integración de flujos táctiles por dedo sincronizados (GelSight sin marcadores, RGB).
- Acciones de efector final absoluto (absEE) para control directo de posición.
- Multi-tarea: un solo checkpoint puede ejecutar 12 tareas distintas, seleccionadas mediante prompts verbatim.
- Normalización por tarea: cada tarea tiene sus propias estadísticas de normalización para observaciones y acciones.

## Casos de uso

- Inserción de conectores USB en producción: el modelo puede realizar peg-in-hole de precisión, una tarea habitual en ensamblaje electrónico donde la tolerancia es milimétrica y el contacto es crítico.
- Manipulación de objetos frágiles: agarre de chips semiconductores sin aplastarlos, gracias a la información táctil que permite modular la fuerza de agarre.
- Apilado de vajilla en entornos domésticos o de hostelería: apilar y desapilar cuencos, tazas y platos con dos brazos, coordinando ambas extremidades.
- Ensamblaje bimanual: un brazo sostiene un manguito mientras el otro inserta un tornillo, una tarea que requiere coordinación fina entre ambos brazos.
- Clasificación y manipulación de piezas pequeñas: engranajes que deben ensartarse en ejes verticales, una tarea de precisión que requiere realimentación táctil.
- Investigación en robótica: el modelo sirve como referencia para estudiar el impacto de la información táctil en tareas de manipulación con contacto, y puede compararse con variantes sin táctil o con acciones delta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como un checkpoint post-entrenado para el benchmark NeoSim, pero no se incluyen métricas numéricas de éxito por tarea en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero un modelo de 7,2 B parámetros en precisión FP16 requiere aproximadamente 14,4 GB de VRAM solo para los pesos; con overhead de activaciones y buffers, se recomiendan al menos 20-24 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con más memoria (A100 40/80 GB, H100) para servir múltiples tareas o usar lotes mayores.
- Cabe en GPU de consumo: sí, en una RTX 3090 o 4090 con 24 GB de VRAM, en FP16 o con cuantización.
- Opciones de despliegue: el repositorio GitHub incluye configuración de servidor multi-tarea (`multitask_server`) con variables de entorno `TWAM_SERVE_POOL` y `TWAM_SERVE_TASK`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de acción robótica, no un LLM conversacional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Tareas | Licencia |
|---|---|---|---|---|
| N0-TWAM (NeoteAI) | 7,2 B | Táctil-nativo, visión+táctil+acción | 12 tareas NeoSim (4 single + 8 dual) | Apache 2.0 |
| UniVTAC | no disponible | Visión+acción, sin táctil | 8 tareas single-arm | no disponible |
| RT-2 (Google DeepMind) | 55 B | Visión-lenguaje-acción | Manipulación general | no disponible |

La comparativa directa con UniVTAC es relevante porque el conjunto NeoSim 8 de brazo único hereda tareas de UniVTAC, pero N0-TWAM añade información táctil y tareas bimanuales. RT-2 es un modelo de referencia en visión-lenguaje-acción, pero no integra táctil y es significativamente más grande.

## Limitaciones y advertencias

- El checkpoint multi-tarea debe servirse con la configuración por tarea correcta: usar el pool de normalización global (`train_meta.json`) des-normalizará las acciones a escala incorrecta, produciendo comportamientos erróneos.
- Los prompts de tarea deben enviarse verbatim en tiempo de inferencia; cualquier variación puede degradar el rendimiento.
- No se proporcionan datos de benchmarks numéricos, por lo que el rendimiento real en cada tarea no está verificado de forma independiente.
- El modelo está especializado en las 12 tareas de NeoSim; no se garantiza generalización a otras tareas sin post-entrenamiento adicional.
- La integración táctil requiere hardware específico (sensores GelSight sin marcadores); no funcionará con configuraciones que solo usen visión.
- No se especifican requisitos de tiempo real; la latencia de inferencia puede no ser adecuada para control de bucle cerrado de alta frecuencia sin optimización adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeoteAI/n0-twam-neosim-absee
- Repositorio GitHub: https://github.com/neoteai/N0-TWAM
- Documentación de despliegue: https://github.com/neoteai/N0-TWAM/blob/main/docs/DEPLOY.md
- Página de investigación: https://research.neoteai.com/n0-twam/
- Reporte técnico (PDF): https://research.neoteai.com/assets/n0-twam-report.pdf
- Perfil de NeoteAI en HuggingFace: https://huggingface.co/NeoteAI
