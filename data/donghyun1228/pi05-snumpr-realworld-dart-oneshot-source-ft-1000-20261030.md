# Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-20261030

## Resumen

π0.5 SNUMPR real-world DART one-shot source es un ajuste fino (fine-tune) de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario Donghyun1228 en HuggingFace. Se trata de un checkpoint derivado de la familia π0.5 (openpi) que parte de una inicialización SNUMPR previa y se entrena con aprendizaje por imitación (IL) sobre un conjunto reducido de cinco demostraciones reales, con el objetivo de servir como línea base (baseline) para el método DART en escenarios de adaptación one-shot.

El modelo no es un LLM conversacional, sino una política robótica: recibe observaciones visuales y de estado del robot y produce acciones motoras. Su relevancia es metodológica más que de producto: documenta un protocolo reproducible de fine-tune one-shot (1.000 actualizaciones, batch global 64, 2×H100 con FSDP, AdamW con clip 1.0 y LR constante 5e-5) siguiendo la receta oficial `pi05_libero_oneshotft` del repositorio `snumprlab/dart`.

El repositorio ocupa 32,2 GB e incluye el estado completo de entrenamiento (parámetros, `train_state` y `assets`) en el paso 999. No se han publicado resultados de benchmarks ni especificaciones detalladas de arquitectura o contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (openpi); detalles internos no disponibles |
| Parámetros totales | no disponible (el autor indica 51 tensores de pesos entrenados) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de entrenamiento (params, train_state, assets); safetensors no confirmado |

## Arquitectura y entrenamiento

El modelo es un fine-tune de una política VLA π0.5 inicializada desde el checkpoint `snumpr-iclr27-v1/9999`, que corresponde a la VLA SNUMPR original con su normalización original. El entrenamiento es exclusivamente de aprendizaje por imitación (IL), sin indicios de RLHF ni DPO en la información proporcionada. Se realizaron 1.000 actualizaciones con batch global de 64 sobre 2×H100 usando FSDP, optimizador AdamW con clip de gradiente 1.0, tasa de aprendizaje constante de 5e-5, sin warmup y sin EMA. Se entrenaron los 51 tensores de pesos del modelo.

Los datos de entrenamiento proceden del dataset `Donghyun1228/snumpr-realworld-dart-oneshot-source-20261030`, compuesto por 5 demostraciones reales y un único modelo para todas las tareas. Se mantuvo la normalización original (`norm_stats.json` con SHA `f549619e…`). El checkpoint publicado corresponde al paso 999 e incluye parámetros, estado completo de entrenamiento y assets. La receta sigue el preset `pi05_snumpr_dart_oneshot_source` del repositorio `Donghyun1228/vla_adaptation` (commit `1de48ef`), a su vez basado en la receta oficial `pi05_libero_oneshotft` de `snumprlab/dart` (commit `1b23c4f`).

## Capacidades

- Control robótico mediante políticas VLA: genera acciones motoras a partir de observaciones visuales y de estado.
- Aprendizaje por imitación one-shot: entrenado con solo 5 demostraciones para todas las tareas.
- Adaptación de dominio: pensado como línea base para el método DART en escenarios reales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en adaptación one-shot de políticas VLA: sirve como baseline reproducible para comparar métodos como DART frente a fine-tunes estándar con pocas demostraciones.
- Reproducción de experimentos de robótica: el checkpoint incluye `train_state` y `assets`, lo que permite reanudar entrenamiento o auditar el proceso paso a paso.
- Evaluación de recetas de entrenamiento: el protocolo documentado (LR, batch, FSDP, clip) permite aislar el efecto de cada hiperparámetro en tareas de manipulación real.
- Desarrollo de pipelines de IL en robótica: integrable en flujos de openpi para entrenar políticas sobre nuevos datasets de demostraciones reales.
- Estudio de normalización de acciones: al conservar el `norm_stats.json` original, facilita analizar el impacto de la normalización en el rendimiento de la política.
- Docencia y divulgación técnica: ejemplo completo y ligero (5 demos, 1.000 pasos) de fine-tune de un VLA sobre hardware de gama alta (2×H100).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 32,2 GB, pero incluye estado de entrenamiento y assets, no solo pesos de inferencia).
- GPU recomendadas: el entrenamiento se realizó con 2×H100 con FSDP; no se especifican requisitos de inferencia.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: no disponible (no se confirman vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de robótica, el despliegue típico sería mediante el stack openpi).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 SNUMPR DART one-shot (este) | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible | no disponible |
| SNUMPR VLA (`snumpr-iclr27-v1/9999`) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 5 demostraciones: alta probabilidad de sobreajuste y escasa generalización a tareas o entornos no vistos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Modelo de robótica, no conversacional: no debe emplearse para generación de texto, código ni tareas de NLP.
- Normalización fijada al dataset original: cambios en la escala de acciones o en la configuración del robot pueden degradar el comportamiento.
- Sin warmup ni EMA: el protocolo elegido puede producir inestabilidad en entrenamientos prolongados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia de los checkpoints de origen (π0.5, SNUMPR) antes de un despliegue en producción.
- Riesgo de alucinación: no aplica en el sentido de NLP, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Sin información sobre sesgos, idiomas ni limitaciones de contexto.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-snumpr-realworld-dart-oneshot-source-ft-1000-20261030
- Dataset de entrenamiento: https://huggingface.co/datasets/Donghyun1228/snumpr-realworld-dart-oneshot-source-20261030
- Repositorio de código del preset: https://github.com/Donghyun1228/vla_adaptation (commit `1de48ef`)
- Receta oficial DART: https://github.com/snumprlab/dart (commit `1b23c4f`, preset `pi05_libero_oneshotft`)
- Checkpoint de inicialización: `snumpr-iclr27-v1/9999` (referencia interna, sin URL pública confirmada)
- openpi: no disponible
