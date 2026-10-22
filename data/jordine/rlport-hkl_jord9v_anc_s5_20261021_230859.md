# Jordine/rlport-hkl_jord9v_anC_s5_20261021_230859

## Resumen

`Jordine/rlport-hkl_jord9v_anC_s5_20261021_230859` no es un modelo publicado, sino una copia de seguridad automática de un checkpoint de entrenamiento por refuerzo (RL) perteneciente al proyecto interno «reward-laundering». El artefacto lo generó el script `scripts/port/hf_backup.py` con el objetivo de poder reanudar una ejecución cuyo nodo de GPU en la nube podía desaparecer, y se subió a HuggingFace como almacenamiento externo («off-box»).

El contenido del repositorio, de 32,6 GB, incluye adaptadores LoRA sobre un modelo base Qwen3.5 en el layout de PEFT/Tinker, el estado del optimizador, métricas por paso, rollouts de entrenamiento y registros de la ejecución. Es decir, se trata de un volcado de estado de entrenamiento, no de pesos finales listos para inferencia.

La model card es explícita: «Research artifact only; not a model release, not intended for use». No se declaran licencia, idiomas, pipeline, parámetros, contexto ni resultados de evaluación. Cualquier uso en producción queda descartado por diseño del propio autor, y la información disponible no permite caracterizar capacidades del modelo subyacente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto contiene adaptadores LoRA; el modelo base declarado es Qwen3.5, sin especificar arquitectura) |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se declara ningún esquema de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA en layout PEFT/Tinker) + estado del optimizador |
| Tipo de artefacto | checkpoint de investigación / copia de seguridad de una ejecución de RL |
| Modelo base | Qwen3.5 (según la model card; versión y tamaño no especificados) |
| Tamaño del repositorio | 32,6 GB |
| Autor | Jordine |
| Fecha de creación | 2026-10-21T23:15:01Z |
| Última actualización | 2026-10-22T02:20:25Z |
| Descargas / likes | 0 / 1 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Lo único documentado es que el entrenamiento se realizó mediante ajuste tipo LoRA sobre Qwen3.5 con el stack Tinker, y que el checkpoint se guardó en el layout PEFT/Tinker junto con el estado del optimizador, lo que permite reanudar la optimización exactamente en el paso en que se interrumpió. El repositorio incluye además métricas por paso, rollouts y logs de la ejecución.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. El nombre del proyecto («reward-laundering») sugiere un experimento sobre funciones de recompensa en RL, pero la model card no aporta detalle metodológico alguno, por lo que no es posible confirmar ni el algoritmo (PPO, GRPO u otro) ni la naturaleza de la señal de recompensa.

## Capacidades

- No se documenta ninguna capacidad funcional del artefacto: es un volcado de estado de entrenamiento, no un modelo invocable.
- Generación de texto, razonamiento, código o matemáticas: no disponible para este checkpoint.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Única funcionalidad verificable: servir de punto de reanudación de la ejecución de RL `hkl_jord9v_anC_s5_20261021_230859` sobre su modelo base.

## Casos de uso

- Reanudación de entrenamiento: cargar los adaptadores LoRA junto con el estado del optimizador para continuar la ejecución de RL en un nuevo nodo, evitando repetir pasos ya computados. Es el propósito declarado del artefacto.
- Reproducibilidad de experimentos: los rollouts y métricas por paso permiten reconstruir la curva de recompensa y auditar la evolución del entrenamiento paso a paso.
- Depuración de la función de recompensa: el análisis de los rollouts almacenados sirve para detectar comportamientos degenerados o explotación de la recompensa (*reward hacking*) sin necesidad de reentrenar.
- Auditoría interna de provenance: los logs permiten rastrear qué script, qué configuración y qué nodo generaron el checkpoint, útil en revisiones de proceso de un equipo de investigación.
- Archivado a largo plazo: almacenamiento externo de bajo coste para preservar el estado exacto de una ejecución cuyo hardware efímero ya no existe.
- Extracción de adaptadores para evaluación: tras identificar la versión exacta de Qwen3.5 utilizada, los adaptadores podrían fusionarse con el modelo base para una evaluación controlada en laboratorio, nunca en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación, y tampoco se han encontrado datos externos en la búsqueda web realizada.

## Requisitos de hardware

- VRAM para inferencia: no estimable. El repositorio contiene adaptadores LoRA y estado del optimizador, no pesos completos, y no se declara el tamaño del modelo base.
- GPU recomendadas: no disponible. Dependerá por completo de la variante de Qwen3.5 que se utilice como base, dato que no se especifica.
- Encaje en GPU de consumo: no determinable con la información disponible.
- Almacenamiento: 32,6 GB solo para el checkpoint; a ello habría que sumar los pesos del modelo base si se pretende cargar.
- Opciones de despliegue: no aplica como modelo servible. El formato safetensors con layout PEFT permite cargar los adaptadores con la librería PEFT sobre el modelo base, pero no existe un camino de despliegue directo con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existe una comparativa significativa: este artefacto no es un modelo, por lo que no compite con modelos de su misma categoría. Se incluye una referencia estructural frente a otros tipos de publicación en HuggingFace.

| Aspecto | Este artefacto | Adaptador LoRA publicado | Modelo completo publicado |
|---|---|---|---|
| Contenido | LoRA + estado del optimizador + rollouts + logs | Solo pesos del adaptador | Pesos completos |
| Listo para inferencia | No | Sí, con modelo base declarado | Sí |
| Modelo base declarado | Qwen3.5 (sin versión) | Habitual | No aplica |
| Licencia | no disponible | Habitual | Habitual |
| Documentación | Model card mínima, sin evaluación | Model card con uso previsto | Model card con benchmarks |
| Parámetros | no disponible | no disponible | no disponible |
| Contexto | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor indica explícitamente que es un artefacto de investigación y que no está pensado para su uso. No debe desplegarse en producción bajo ninguna circunstancia.
- No es cargable como modelo: requiere el modelo base Qwen3.5 en la versión exacta del entrenamiento, dato que no se facilita.
- Licencia no declarada: no hay base legal para uso comercial, redistribución o derivados. La ausencia de licencia implica reserva de derechos por defecto.
- Riesgo de alucinación y sesgos: no evaluable, al no existir ni evaluación ni pesos finales publicados.
- Los rollouts y logs incluidos pueden contener texto generado sin filtrar, datos de entrenamiento o información interna del proyecto; su publicación no implica revisión de contenido sensible.
- El checkpoint está ligado a una ejecución concreta (`hkl_jord9v_anC_s5_20261021_230859`); mezclarlo con otras ejecuciones o pasos invalida la reproducibilidad.
- Sin garantías de integridad más allá de la subida automática: no se documenta suma de verificación ni procedimiento de validación de la copia.
- Los resultados de la búsqueda web realizada no guardan relación con el modelo y no se han utilizado como fuente.

## Enlaces

- HuggingFace: https://huggingface.co/Jordine/rlport-hkl_jord9v_anC_s5_20261021_230859
- No se han encontrado papers, blogs, repositorios ni demos asociados en la búsqueda web realizada.
