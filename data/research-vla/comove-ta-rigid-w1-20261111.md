# research-vla/comove-ta-rigid-w1-20261111

## Resumen

CoMove TA + MoSE3 rigid (ta-rigid-w1) es un checkpoint de un modelo vision-language-action (VLA) orientado a robótica, publicado por el usuario research-vla en Hugging Face. Se trata del paso 21.700 de entrenamiento de una arquitectura denominada native 4D-WAM, que combina alineamiento TraceAnything con supervisión de relaciones rígidas MoSE3. El modelo está pensado para ejecutar tareas de manipulación sobre el benchmark LIBERO-Plus, donde alcanza 7.019 aciertos sobre 10.030 episodios (69,98%), frente al 70,85% de la referencia oficial 4D-WAM.

El checkpoint está diseñado para la implementación native FastWAMJoint con la cabeza rígida CoMove, y requiere archivos externos que no se incluyen en el repositorio: el VAE preentrenado Wan2.2, los assets de texto y el estado del optimizador. El repositorio ocupa 12,1 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicación reciente y de nicho.

La relevancia de este modelo radica en su enfoque hacia políticas robóticas con representación 4D (espacio-tiempo) y supervisión de relaciones geométricas rígidas, un área activa de investigación en VLA. No obstante, la ausencia de licencia, idiomas declarados y benchmarks más allá de LIBERO-Plus limita su evaluación fuera del contexto específico de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | native 4D-WAM (vision-language-action) con cabeza rígida CoMove; alineamiento TraceAnything y supervisión MoSE3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo incluye checkpoint, `dataset_stats.json`, `model-config.yaml`, `checkpoint_manifest.json`, `libero-plus-summary.json`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura native 4D-WAM, un esquema vision-language-action que procesa representaciones espacio-temporales (4D) para generar acciones robóticas. Incorpora dos componentes diferenciales: el alineamiento TraceAnything y la supervisión de relaciones rígidas MoSE3, que lee features de vídeo en la capa 20 y aplica una pérdida rígida con peso 1. El checkpoint corresponde al paso 21.700 de entrenamiento y se ejecuta sobre la implementación native FastWAMJoint con la cabeza CoMove.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo requiere el VAE preentrenado Wan2.2 (referenciado mediante la variable de entorno `COMOVE_VAE_PATH`), así como los assets de texto, que no están incluidos en el repositorio. Tampoco se incluye el estado del optimizador. La evaluación se realiza sobre LIBERO-Plus con una semilla fija por episodio.

## Capacidades

- Ejecución de tareas de manipulación robótica en el benchmark LIBERO-Plus.
- Política vision-language-action con representación 4D (espacio-temporal).
- Supervisión de relaciones geométricas rígidas mediante MoSE3.
- Alineamiento multimodal TraceAnything para integración de video y lenguaje.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, generación de texto general, código, matemáticas, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en políticas VLA para manipulación: el modelo sirve como checkpoint de referencia para reproducir resultados de LIBERO-Plus con la configuración native FastWAMJoint y la cabeza CoMove.
- Evaluación comparativa de variantes 4D-WAM: permite contrastar la variante TraceAnything + MoSE3 rigid frente a la referencia oficial 4D-WAM en los mismos episodios y semilla fija.
- Estudio de supervisión geométrica rígida: la pérdida MoSE3 con lectura de features en la capa 20 puede analizarse para entender el efecto de las relaciones rígidas en el rendimiento de manipulación.
- Reproducción de experimentos con VAE Wan2.2: útil para pipelines que ya dispongan del VAE preentrenado y quieran integrar este checkpoint sin reentrenar desde cero.
- Benchmarking de robustez en LIBERO-Plus: los 10.030 episodios con semilla fija por episodio permiten medir variaciones de rendimiento entre checkpoints de la misma familia.
- Base para fine-tuning en tareas de manipulación específicas: al ser un checkpoint intermedio (paso 21.700), puede servir como inicialización para ajustes posteriores, siempre que se respete la configuración de normalización y el manifiesto del checkpoint.

## Benchmarks y rendimiento

| Benchmark | CoMove TA + MoSE3 rigid (ta-rigid-w1) | 4D-WAM referencia oficial |
|---|---|---|
| LIBERO-Plus (aciertos / total) | 7.019 / 10.030 | 7.106 / 10.030 |
| LIBERO-Plus (porcentaje) | 69,98% | 70,85% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,1 GB, pero no se detalla el tamaño del modelo ni el consumo en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El modelo requiere la implementación native FastWAMJoint, el VAE Wan2.2 y la configuración `model-config.yaml`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO-Plus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoMove TA + MoSE3 rigid (ta-rigid-w1) | no disponible | no disponible | 69,98% | no disponible | Hugging Face (research-vla) |
| 4D-WAM referencia oficial | no disponible | no disponible | 70,85% | no disponible | no disponible en la información proporcionada |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial está permitido.
- Idiomas no declarados: se desconoce el soporte multilingüe.
- El checkpoint no incluye el VAE preentrenado Wan2.2, los assets de texto ni el estado del optimizador; es necesario obtenerlos por separado y configurar `COMOVE_VAE_PATH`.
- Requiere la implementación native FastWAMJoint y la cabeza CoMove; no es un modelo autónomo listo para usar con frameworks estándar.
- Rendimiento ligeramente inferior a la referencia oficial 4D-WAM en LIBERO-Plus (69,98% frente a 70,85%).
- Sin descargas ni likes registrados: ausencia de validación comunitaria.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de contexto más allá de lo indicado.
- Uso previsto de investigación en robótica; no se recomienda para producción sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/research-vla/comove-ta-rigid-w1-20261111
- Manifiesto del checkpoint: `checkpoint_manifest.json` (en el repositorio)
- Configuración del modelo: `model-config.yaml` (en el repositorio)
- Estadísticas de normalización: `dataset_stats.json` (en el repositorio)
- Resumen de siete categorías LIBERO-Plus: `libero-plus-summary.json` (en el repositorio)
