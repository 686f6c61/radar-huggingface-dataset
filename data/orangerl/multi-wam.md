# Orangerl/multi-wam

## Resumen

Multi-WAM es un modelo de robótica basado en el marco RoboTwin2.0, desarrollado por el usuario Orangerl y publicado en Hugging Face. Se trata de un sistema de dos componentes: un world model (World-v12) que predice estados futuros del entorno y un action model (Action-v13) que genera comandos de control a partir de esas predicciones. El repositorio actúa como un "handoff" reproducible del experimento, incluyendo checkpoints, código de entrenamiento, métricas de evaluación y una caché de predicciones futuras de 307 GiB.

El modelo está diseñado para tareas de manipulación robótica con observaciones multi-vista, y su relevancia radica en que proporciona un punto de control completo y auditado mediante sumas de verificación (checksums) para continuar el entrenamiento o reproducir evaluaciones. El repositorio ocupa 691.1 GB e incluye múltiples versiones de checkpoints (World-v12, Action-v12, Action-v13) junto con scripts de migración y verificación. No se especifican parámetros totales, arquitectura interna ni detalles de entrenamiento más allá de los pasos de entrenamiento (25,066 para World-v12 y 23,016 para Action-v13 final).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en RoboTwin, con componentes world model y action model) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (mixta: incluye componentes con Apache-2.0 y otros con licencias propias) |
| Formato de pesos | checkpoints de PyTorch (formato no especificado, probablemente .pt o .ckpt) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se menciona que el entrenamiento se realizó en dos fases: un world model (World-v12) entrenado hasta el paso 25,066 y un action model (Action-v13) continuado hasta el paso 23,016. Existe un codec checkpoint (paso 125,000) que parece ser un componente necesario para el funcionamiento del sistema, posiblemente un codificador/decodificador de observaciones. El entrenamiento se realizó con un "large batch" para el world model y con una estrategia de "eval aligned" para el action model, lo que sugiere que se alinearon las evaluaciones con los datos de entrenamiento. No se mencionan técnicas como RLHF o DPO, ni el tamaño del dataset de entrenamiento. El repositorio incluye una caché de predicciones futuras de 329,522,409,844 bytes (307 GiB) que se utiliza como overlay para el action model.

## Capacidades

- Predicción de estados futuros del entorno (world model) a partir de observaciones multi-vista.
- Generación de acciones de control robótico (action model) basadas en las predicciones del world model.
- Soporte para tareas de manipulación robótica con evaluación en entornos RoboTwin.
- Capacidad de continuar entrenamiento desde checkpoints intermedios (reanudación de entrenamiento).
- Reproducibilidad mediante verificación de sumas de verificación (checksums) y scripts de migración.
- No se especifican capacidades de lenguaje, visión general o tool calling.

## Casos de uso

- Investigación en world models para robótica: el modelo permite estudiar cómo los modelos del mundo pueden predecir dinámicas de entornos robóticos, útil para planificación y control basado en modelos.
- Desarrollo de políticas de control robótico: el action model puede utilizarse para generar comandos de actuación en tareas de manipulación, como recoger y colocar objetos, en entornos simulados o reales.
- Reproducción de experimentos científicos: al incluir checkpoints auditados y scripts de verificación, es adecuado para reproducir resultados de investigación en robótica con garantías de integridad.
- Entrenamiento continuado: los checkpoints permiten reanudar el entrenamiento desde puntos concretos, lo que facilita experimentos de larga duración o ajustes finos sobre nuevas tareas.
- Evaluación de modelos de mundo en entornos multi-vista: el sistema está diseñado para trabajar con observaciones desde múltiples cámaras, lo que lo hace útil para estudiar la fusión de información visual en robótica.
- Benchmarking de arquitecturas de world models: al ser un sistema completo con métricas definidas, puede servir como referencia para comparar otras implementaciones de modelos de mundo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación:

| Métrica | Resultado | Notas |
|---|---|---|
| 8 tareas clean/unseen | 29/64 = 45.31% | Evaluación completa sobre 8 tareas no vistas |
| 50 tareas clean/seen (parcial) | 586/1,052 = 55.70% | Ejecución interrumpida tras 25 tareas y 1,052 episodios válidos; no es una puntuación formal |

No se proporcionan comparaciones con otros modelos ni métricas estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- El repositorio completo ocupa 691.1 GB, lo que incluye checkpoints, cachés y código. Para inferencia o evaluación, se puede omitir la caché de acciones (307 GiB) si solo se necesita el modelo base.
- No se especifican requisitos de VRAM ni GPUs recomendadas. Dado el tamaño de los checkpoints (el world model tiene un checkpoint de 80,000 pasos y el codec otro), se requiere hardware de alta gama, probablemente GPUs con 40 GB o más de memoria, como A100 o H100.
- No se mencionan opciones de despliegue como vLLM u Ollama; el modelo está pensado para ejecutarse con scripts de Python y un entorno conda específico (mira-conda-env).
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (world models para robótica multi-vista). La comparativa no está disponible.

## Limitaciones y advertencias

- Los resultados de evaluación son parciales: la puntuación de 55.70% proviene de una ejecución interrumpida y no debe considerarse una métrica formal.
- El repositorio no incluye los datos crudos de RoboTwin ni la caché de hidden states del world model (aproximadamente 3.1 TB), que permanecen externos. Esto limita la reproducibilidad completa fuera del entorno del autor.
- La licencia es "other" y mixta: aunque algunos componentes (MIRA, LingBot-Vision) conservan licencias Apache-2.0, los modelos, checkpoints y datos derivados pueden tener restricciones adicionales. Es necesario revisar cada componente antes de un uso comercial.
- No se especifican sesgos ni riesgos de alucinación, pero al ser un modelo de robótica, los errores de predicción pueden provocar comportamientos inseguros en entornos físicos.
- El modelo no es un LLM y no tiene capacidades de lenguaje natural; su uso está restringido a tareas de robótica.
- La documentación es escasa: no se detallan hiperparámetros, arquitectura de red, ni composición del dataset de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Orangerl/multi-wam
- Archivos de documentación incluidos en el repositorio (sin URLs directas): `PROGRESS_20260902.md`, `EVALUATION_20260902.md`, `REPRODUCE_20260902.md`, `PACKAGE_MANIFEST.json`, `SHA256SUMS`.
- Scripts de migración y verificación: `skills/multi-wam-migrate/scripts/restore_bundle.sh` y `verify_current_release.sh`.
