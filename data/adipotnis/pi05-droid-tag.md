# adipotnis/pi05-droid-tag

## Resumen

π0.5 DROID TAG es un repositorio de HuggingFace publicado por el usuario adipotnis que documenta una adaptación del método TAG (target-erasure calibration) descrito en el paper arXiv:2603.24584, aplicado al conjunto de datos de robótica DROID (lerobot/droid_1.0.1) y partiendo de la inicialización pi05_base. El propósito declarado es preparar y entrenar un modelo de política robótica (visión-lenguaje-acción) con calibración de borrado de objetivos, pero el autor indica explícitamente que la preparación y el entrenamiento están pendientes y que no hay pesos entrenados disponibles.

El repositorio no contiene, por tanto, un modelo utilizable: es una ficha de configuración experimental que detalla hiperparámetros, pipeline de preprocesamiento, criterios de selección de datos y decisiones de adaptación respecto al paper original. La relevancia actual es metodológica: documenta con un nivel de detalle poco habitual el contrato de acciones, la mezcla de entrenamiento (90 % episodios limpios, 10 % episodios con borrado sintético) y el pipeline de síntesis de pares (Qwen3-VL → Grounding DINO → SAM2 → MiniMax-Remover).

La información disponible no incluye arquitectura detallada del modelo base, número de parámetros, longitud de contexto, idiomas soportados ni resultados de benchmarks. Cualquier evaluación de capacidades o rendimiento queda fuera del alcance de los datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (inicialización pi05_base; política robótica visión-lenguaje-acción, detalles no publicados en la ficha) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no hay pesos entrenados publicados) |

## Arquitectura y entrenamiento

La ficha describe un fine-tuning completo sobre la inicialización pi05_base, sin indicar la arquitectura interna del modelo base (transformer, MoE u otra). El entrenamiento planificado consta de 6000 actualizaciones en una única GH200, con batch de 32, 8 workers y 1 dispositivo FSDP, precisión bfloat16 y tokens de estado habilitados. El optimizador es AdamW (beta1 0.9, beta2 0.95, epsilon 1e-8, weight decay 1e-10, clip norm 1.0) con learning rate cosine de 2.5e-5 a 2.5e-6, 1000 actualizaciones de warmup y EMA de 0.999 con semilla 42. El horizonte es de 16 pasos, con dimensión de acción acolchada de 32 y dimensión de salida de 8; el contrato de acción son siete objetivos de posición articular más pinza absoluta, con deltas articulares normalizados durante el entrenamiento.

Los datos provienen de lerobot/droid_1.0.1 en el commit 0eabc778f959c54b8c5aa3626cc1128d2d2e54d4. El pool limpio elegible son 74 682 episodios exitosos anotados (19 806 641 fotogramas). La muestra de preprocesamiento son 7468 episodios completos (1 975 980 fotogramas) seleccionados con PCG64 semilla 42, uniforme sin reemplazo. La mezcla de entrenamiento es 90 % pool limpio completo elegible y 10 % episodios con borrado aceptado, con muestreo uniforme de fotograma y vista. La síntesis de borrado usa Qwen3-VL, Grounding DINO, SAM2 y MiniMax-Remover sobre vídeo denso, con umbral DINO de 0.35 (+0.05 por reintento), área de caja máxima del 30 % (frente al 15 % del paper, adaptación aprobada por el usuario), dilatación 5x5 e inpainting de 10 pasos de denoising a 512x512 en clips de 81 fotogramas con solapamiento 9. Solo el 10 % de episodios seleccionados recibe síntesis de borrado.

El autor señala desviaciones relevantes respecto al paper: la tapa de área de caja es del 30 % en lugar del 15 %; la revisión acepta residuos menores e incertidumbre y evalúa el borrado, no la finalización de tareas robóticas; no se aplica el filtro oficial RLDS de fotogramas no inactivos porque la fuente de HuggingFace usa compresión AV1 y omite los identificadores de ruta de grabación originales, lo que altera la distribución de datos de entrenamiento. Tampoco hay split de validación ni evaluación de rollout.

## Capacidades

- No hay pesos entrenados publicados, por lo que no se puede verificar ninguna capacidad funcional del modelo.
- El objetivo declarado es una política robótica de manipulación (visión-lenguaje-acción) con contrato de acción de siete posiciones articulares más pinza absoluta.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; la ficha no detalla las capacidades heredadas de pi05_base.

## Casos de uso

- Investigación en calibración de borrado de objetivos (TAG): el repositorio sirve como referencia reproducible de hiperparámetros y pipeline de síntesis para replicar o adaptar el método del paper arXiv:2603.24584 sobre DROID.
- Estudio de pipelines de aumento de datos sintéticos en robótica: la configuración documenta el encadenado Qwen3-VL → Grounding DINO → SAM2 → MiniMax-Remover con umbrales, reintentos y control de área de caja, útil para diseñar pipelines propios de eliminación de objetos.
- Auditoría de decisiones de adaptación: permite comparar las desviaciones respecto al paper (tapa del 30 % frente al 15 %, criterio de revisión lenient_clear_failure_confirmed, ausencia del filtro RLDS) y evaluar su impacto en la distribución de datos.
- Reproducción de experimentos de fine-tuning completo sobre pi05_base: la ficha detalla optimizador, schedule, EMA, semilla y hardware (una GH200), lo que facilita la réplica computacional.
- Docencia y formación en ingeniería de datos para robótica: el desglose de pool limpio, muestra de preprocesamiento, exclusión de instrucciones vacías y demostraciones fallidas sirve como caso práctico de curación de datasets.
- Planificación de infraestructura: los datos de batch, workers, FSDP y backoff automático ante OOM permiten estimar requisitos de memoria y tiempo de preprocesamiento en clústeres con A100 y GH200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha realizado evaluación de rollout robótico ni existe split de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados ni parámetros declarados).
- GPU recomendadas: no disponible para inferencia; para el entrenamiento planificado se cita una GH200.
- Preprocesamiento: workers Delta A100, con decodificación RGB bitexacta en x86 y ARM; MiniMax con clips por batch de 1 y backoff automático ante OOM en GPU.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| adipotnis/pi05-droid-tag | no disponible | no disponible | apache-2.0 | No (entrenamiento pendiente) | Adaptación TAG sobre DROID; ficha de configuración |
| pi05_base | no disponible | no disponible | no disponible | no disponible | Inicialización citada por el autor; sin datos en la información proporcionada |
| Alternativas de política robótica (p. ej. familias RT, OpenVLA) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación |

No es posible establecer una comparativa cuantitativa con modelos similares con los datos disponibles.

## Limitaciones y advertencias

- No hay pesos entrenados: el repositorio no es utilizable para inferencia ni para evaluación funcional.
- No se ha realizado evaluación de rollout robótico ni existe split de validación, por lo que no hay evidencia empírica de rendimiento.
- La adaptación difiere del paper en parámetros clave (tapa de área de caja del 30 % frente al 15 %, criterio de revisión y evaluación del borrado en lugar de la tarea), lo que impide considerarla una reproducción exacta.
- La omisión del filtro oficial RLDS de fotogramas no inactivos, motivada por la compresión AV1 y la ausencia de identificadores de ruta, altera la distribución de datos de entrenamiento.
- El repositorio fuente contiene archivos de datos obsoletos no referenciados; solo se usa el índice de episodios v3 autoritativo, que cubre 95 658 episodios públicos antes del filtrado de elegibilidad.
- Riesgo de sesgos y alucinación: no evaluable sin pesos ni benchmarks.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base pi05_base y de los datos DROID, no detalladas en la ficha.
- Los pares rechazados se excluyen del pool borrado, pero sus datos limpios siguen siendo elegibles; los pares previamente aprobados conservan firmas de receta más estrictas, lo que introduce heterogeneidad en el pipeline.

## Enlaces

- HuggingFace: https://huggingface.co/adipotnis/pi05-droid-tag
- Paper del método TAG: https://arxiv.org/abs/2603.24584
- Dataset fuente: https://huggingface.co/datasets/lerobot/droid_1.0.1
