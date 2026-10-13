# Donghyun1228/pi05-libero-b200-weight-geometry-kappa1-yaw30-stopped-diagnostic26-20261013

## Resumen

Este repositorio contiene un checkpoint de diagnóstico detenido del modelo π₀.₅ (pi0.5) aplicado a tareas de manipulación robótica de la suite LIBERO, publicado por el usuario Donghyun1228 bajo licencia Apache 2.0 y la librería openpi. No es un modelo terminado: el entrenamiento se interrumpió en el commit de optimizador número 26 de los 1000 planificados, y el propio autor lo describe como un piloto rechazado.

El checkpoint implementa un modelo de dinámica inversa (IDM) sobre el que se aplicó un kernel geométrico tangente-H predeclarado, denominado κ1, que modifica únicamente un escalar por módulo sobre la propuesta post-Adam del IDM original. En el paso 25, ese mecanismo fijó los 9 escalares de módulo (repartidos en tres condiciones) en la cota inferior de 0,01, lo que activó la puerta mecánica de parada y abortó la formulación sin ejecutar continuación alguna.

El interés de esta ficha es por tanto acotado: no se ejecutó ninguna evaluación de política ni se reporta puntuación de rendimiento, y el autor advierte explícitamente que el piloto no demuestra mejoras ni retención de la política fuente. Su valor real es de trazabilidad, reproducción de diagnósticos y depuración de pipelines openpi, no de uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Pertenece a la familia π₀.₅ de openpi; la model card no detalla la topología interna ni la disposición de capas |
| Parámetros totales | No disponible (el repositorio ocupa 13,1 GB) |
| Parámetros activos | No aplica: no se documenta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 en inferencia (la restauración declarada usa BF16); hojas de origen con 43 tensores entrenables en FP32 y 8 proyecciones congeladas en BF16. No se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | No disponible. Es un modelo de robótica orientado a acciones, no a lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible. Se mencionan «shards nativos de parámetros» sin especificar safetensors, PyTorch binario ni GGUF |
| Hojas de parámetros | 51 hojas nativas crudas (43 entrenables FP32 de fuente original + 8 proyecciones congeladas BF16) más 23 hojas de muñeca BF16; configuración de política de 74 hojas con muñeca separada |
| Estado de entrenamiento | 26 commits de optimizador, paso 25 (raw, sin EMA), de 1000 planificados. Detenido por puerta mecánica |
| Estado de pesos | Solo inferencia. No es un estado de entrenamiento reanudable; los estados raw/Adam/EMA/continuación se conservan por separado |
| Librería | openpi |
| Simulador asociado | MuJoCo 3.2.3 (requerido para uso posterior en LIBERO) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo más allá de su pertenencia a la familia π₀.₅ servida a través de openpi. Lo que sí se documenta es la estructura del payload de inferencia: 74 hojas de parámetros organizadas en 51 hojas nativas crudas (43 tensores entrenables en FP32 procedentes de la fuente original y ocho proyecciones congeladas en BF16) y 23 hojas BF16 de muñeca, con normalización de fuente aplicada. La presencia de un conjunto de hojas específicas de muñeca y de proyecciones congeladas sugiere entrada visual multimodular, si bien la model card no detalla el codificador de visión ni el mecanismo de fusión.

En cuanto al entrenamiento, se trata de una formulación de dinámica inversa: el modelo aprende a predecir acciones a partir de observaciones, y sobre esa propuesta post-Adam se aplica un kernel geométrico tangente-H explícito. Este kernel no añade dirección de gradiente ni consume observaciones de la fuente ni retroalimentación de éxito de tarea; únicamente reescala un escalar por módulo. Los primeros 25 updates nativos de la IDM usaron cantidades de visión, LLM y experto completo de 1/1/1. En el paso 25, la sujeción de curvatura κ1 predeclarada empujó los 9 escalares de módulo de las tres condiciones hasta la cota inferior de 0,01, lo que disparó la puerta mecánica y detuvo la formulación. No hubo continuación. El dataset objetivo es `Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003`, con snapshot de entrenamiento `f8681e6849eb19dda944bd6daa181962f5b902e7`, y la restauración requiere la configuración de política de 74 hojas con muñeca separada incluida en `model_config.json` del commit de inferencia `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`. No se documenta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación de acciones robóticas en el marco de un modelo de dinámica inversa (IDM) para tareas de manipulación de la suite LIBERO.
- Procesamiento de entradas visuales: el payload incluye proyecciones congeladas y un bloque diferenciado de 23 hojas BF16 de muñeca, lo que apunta a observación con cámara de muñeca además de la vista principal.
- Aplicación de un kernel geométrico tangente-H que reescala escalares por módulo sobre la propuesta IDM post-Adam.
- Capacidad de razonamiento, generación de texto, matemáticas o código: no documentada. El checkpoint es un artefacto de inferencia de política, no un modelo de lenguaje de propósito general.
- Tool calling / function calling: no soportado ni documentado.
- Comportamiento agéntico o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no aplicables ni documentadas.
- Modo de pensamiento (thinking), audio o vídeo: no documentados.

## Casos de uso

- Reproducción del diagnóstico κ1: el checkpoint permite volver a cargar el estado exacto del paso 25 y verificar que los 9 escalares de módulo de las tres condiciones quedaron efectivamente en 0,01, replicando el fallo que activó la puerta mecánica.
- Auditoría del kernel geométrico tangente-H: sirve para comprobar experimentalmente la afirmación del autor de que la geometría solo altera un escalar por módulo y no introduce dirección de gradiente alguna sobre la propuesta post-Adam.
- Validación del pipeline de restauración de openpi: el payload exige cargar la configuración de 74 hojas con muñeca separada desde un commit concreto de `model_config.json` y restaurar en BF16, por lo que es un caso de prueba útil para verificar que una instalación de openpi resuelve correctamente rutas, commits y tipos de precisión.
- Comprobación de integridad de shards: el autor declara que todos los shards nativos están verificados contra la continuación de la puerta atómica, lo que permite usarlo como referencia para testear herramientas de validación de pesos frente a un estado conocido.
- Depuración de tuberías LIBERO con MuJoCo 3.2.3: al ser un artefacto de la suite LIBERO, permite ensayar la integración entre el cargador de políticas, el simulador y el bucle de control sin depender de un modelo de producción.
- Estudio metodológico de puertas de parada mecánicas: el caso documenta un criterio de aborto automático basado en cotas inferiores de escalares, útil como ejemplo reproducible en investigación sobre control de entrenamiento y detección temprana de colapso de formulaciones.
- Trazabilidad de experimentos rechazados: publicar el estado exacto, el dataset objetivo, el snapshot de entrenamiento y los hashes de commit permite auditar por qué una variante se descartó, algo poco habitual en checkpoints públicos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que no se ejecutó ninguna evaluación de política y que no se reporta puntuación de rendimiento alguna, y añade que este piloto rechazado no establece mejora ni retención de la política fuente. No existen por tanto cifras de LIBERO, MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 13,1 GB y la inferencia restaura en BF16, por lo que cabe esperar un consumo de pesos en el entorno de 13-14 GB, más activaciones y buffers del simulador. Se trata de una estimación derivada del tamaño del repo, no de un dato publicado.
- GPU recomendadas: no disponibles. Por el orden de magnitud anterior, encajarían tarjetas con 24 GB o más de VRAM, como RTX 4090, RTX 3090, A100 (40/80 GB) o H100. Esta recomendación es una inferencia a partir del tamaño del repositorio, no una especificación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos con 24 GB de VRAM si la carga en BF16 se ajusta al presupuesto descrito, pero no hay confirmación por parte del autor.
- Opciones de despliegue: la librería declarada es openpi. Para uso posterior en LIBERO se exige MuJoCo 3.2.3. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y en principio no aplican al no tratarse de un modelo de lenguaje servible por esas pilas.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por paso ni rendimiento en tareas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (π₀.₅ κ1 yaw30, stopped diagnostic26) | No disponible | No disponible | Sin evaluación publicada | Apache 2.0 | Público en HuggingFace, 13,1 GB |
| π₀.₅ de openpi (familia base) | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Librería openpi |
| Otros checkpoints de IDM del mismo autor sobre LIBERO | No disponible | No disponible | No disponible | Apache 2.0 declarado en este repo | Público en HuggingFace |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada. Se recomienda no tratar esta tabla como una comparativa de capacidades.

## Limitaciones y advertencias

- Modelo incompleto: es un checkpoint de diagnóstico de 26 commits de optimizador sobre 1000 planificados, detenido por una puerta mecánica. No debe presentarse como un modelo entrenado ni finalizado.
- Sin evaluación: no se ejecutó ninguna evaluación de política y no existe puntuación de rendimiento. Cualquier afirmación sobre su calidad en tareas LIBERO carece de respaldo.
- Piloto rechazado: el autor indica que no demuestra mejora ni retención de la política fuente. No es apto como base para afirmar avances experimentales.
- No reanudable: el payload es de inferencia y no constituye un estado de entrenamiento reanudable; los estados raw/Adam/EMA/continuación se conservan por separado y no se incluyen aquí.
- Dependencia de configuración exacta: la restauración exige la configuración de política de 74 hojas con muñeca separada incluida en un commit concreto de `model_config.json`, y una versión concreta de MuJoCo (3.2.3) para uso posterior en LIBERO. Omitir cualquiera de las dos puede invalidar la reproducibilidad.
- Fuente de pesos heredada: el autor señala que el checkpoint fuente original no tiene ID público verificado en HuggingFace, aunque afirma que todos los pesos de inferencia están incluidos en este repositorio. La trazabilidad completa de la procedencia no es verificable externamente.
- Sesgos: no documentados. No hay información sobre composición demográfica, sesgos de política ni cobertura de escenarios.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero un modelo de dinámica inversa sin evaluación puede producir acciones no válidas o inestables fuera de la distribución del dataset `libero-dense-contact-sweep-d2-yaw30`.
- Limitaciones de idioma: no aplica; no es un modelo lingüístico.
- Licencia: Apache 2.0 permite uso comercial, pero dicha licencia no cubre la idoneidad técnica del artefacto, que sigue sin validar.
- Los resultados de búsqueda web asociados a esta consulta versan sobre la Neue Nationalgalerie de Berlín y no guardan ninguna relación con el modelo. No se ha encontrado documentación técnica externa, paper ni blog que lo respalde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-b200-weight-geometry-kappa1-yaw30-stopped-diagnostic26-20261013
- Dataset objetivo declarado: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-yaw30-20261003
- Librería declarada: openpi (no se proporciona URL en la información disponible)
- Commit de inferencia con `model_config.json`: `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`
- Snapshot de entrenamiento: `f8681e6849eb19dda944bd6daa181962f5b902e7`
- Revisión del dataset objetivo: `7cfd3ca8528c59c1ce700d4d75b560db39f7a5e7`
- Papers, blogs, repositorios o demos adicionales: no disponibles. La búsqueda web no devolvió ningún resultado relevante.
