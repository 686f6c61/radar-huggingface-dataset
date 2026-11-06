# Donghyun1228/pi05-libero-lape-scale-source-n5000-10000-20261104

## Resumen

π0.5 LIBERO mean-IDM source es un checkpoint de investigación para robótica basado en la arquitectura π0.5 (openpi), publicado por el usuario Donghyun1228. No es un modelo de lenguaje de propósito general, sino una política visuomotora (VLA, vision-language-action) entrenada para manipulación robótica sobre el benchmark LIBERO, con un preset de entrenamiento conjunto de imitación (IL) e inverse dynamics model (IDM) con media, incluyendo recolección de conflictos de gradiente.

El checkpoint forma parte de un estudio de escalado de datos LAPE (driver `Donghyun1228/vla_adaptation`, commit `f9dbc2e0`) y sirve como "source" (modelo base pre-adaptación) con un probe de soporte recortado a 5.000 frames por entorno, tras 10.000 actualizaciones con LR 1e-5. Emplea la misma receta que la fuente principal de 50k (`pi05-libero-conflict-mean-source-n50k-10000-20261024`), de modo que permite comparar el efecto del tamaño del conjunto de datos fuente en la adaptación posterior.

El repositorio ocupa 32,2 GB e incluye pesos en formato JAX/Flax (directorio `9999/` con `params`, `train_state` y `assets` de normalización), así como artefactos de análisis LAPE (`lape/analysis_tau1.json`) y un prior k10 (`prior/lape_k10/`). Su relevancia es acotada: es material reproducible para investigación en adaptación de políticas VLA, no un modelo listo para despliegue en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (openpi), política VLA basada en transformer con action expert; no se detalla la configuración exacta en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo robótico; no aplica ventana de texto estándar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JAX/Flax (`params`, `train_state`, `assets`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en π0.5 dentro del ecosistema openpi, una política visuomotora que combina un backbone de visión-lenguaje con un "action expert" para generar acciones robóticas. El preset de entrenamiento es `pi05_libero_conflict_mean_source`: entrenamiento conjunto de imitación (IL) e IDM con media, con recolección de conflictos de gradiente, 10.000 actualizaciones, LR 1e-5 y semilla no especificada en la información disponible. El probe de soporte fuente se recorta a 5.000 frames por entorno.

El repositorio incluye además artefactos del estudio LAPE: `lape/analysis_tau1.json` con la fracción compartida LAPE por capa medida sobre los datos principales de medición, y `prior/lape_k10/` con el prior k10 (`w_l = 1 − s_l^10`) usado por ambos targets de este tamaño. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (no aplicable en el sentido habitual a políticas robóticas).

## Capacidades

- Generación de acciones robóticas para manipulación sobre tareas del benchmark LIBERO.
- Entrenamiento conjunto de imitación e inverse dynamics (IDM) con media, orientado a mejorar la representación de la política.
- Recolección de conflictos de gradiente durante el entrenamiento (gradient-conflict collection).
- Servir como modelo fuente ("source") para estudios de adaptación y escalado de datos LAPE.
- Incluye artefactos de análisis (fracción LAPE por capa, prior k10) para reproducir el estudio.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en adaptación de políticas VLA: usar este checkpoint como fuente para estudiar cómo el tamaño del probe de soporte (5.000 frames) afecta a la adaptación frente a la fuente de 50k, manteniendo la misma receta.
- Reproducción de experimentos LAPE: cargar `lape/analysis_tau1.json` y `prior/lape_k10/` para replicar las mediciones de fracción compartida por capa y el prior k10.
- Evaluación comparativa de recetas de entrenamiento: contrastar el preset conflict-mean frente a variantes como `pi05-libero-pad-vision-head-source-n50k-10000-20261104` (cabeza IDM separada sobre tokens SigLIP).
- Baseline para manipulación en LIBERO: emplear el checkpoint como referencia de rendimiento en tareas de manipulación antes de aplicar adaptaciones.
- Estudio de conflictos de gradiente: analizar los datos de recolección de conflictos para entender la interacción entre objetivos IL e IDM.
- Docencia y experimentación en robótica con openpi: usar el repositorio como ejemplo reproducible de pipeline de entrenamiento VLA con JAX/Flax.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 32,2 GB, lo que da una cota inferior orientativa del almacenamiento necesario, pero no se especifica el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el formato de pesos es JAX/Flax (`params`, `train_state`, `assets`), por lo que el despliegue natural es mediante openpi/JAX; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Probe fuente | Actualizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05-libero-lape-scale-source-n5000-10000-20261104`) | π0.5 / openpi | 5.000 frames | 10.000 | Apache 2.0 | Hugging Face |
| `pi05-libero-conflict-mean-source-n50k-10000-20261024` | π0.5 / openpi | 50.000 frames | 10.000 | no disponible | Hugging Face |
| `pi05-libero-pad-vision-head-source-n50k-10000-20261104` | π0.5 / openpi | 50.000 frames | 10.000 | no disponible | Hugging Face |
| `pi05-libero-support-probe-source-n50000-10000-20261015` | π0.5 / openpi | 50.000 frames | 10.000 | Apache 2.0 | Hugging Face |

Los cuatro checkpoints comparten arquitectura y receta base; las diferencias principales son el tamaño del probe de soporte, la variante de IDM (media compartida frente a cabeza separada sobre tokens SigLIP) y la fecha de publicación. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para despliegue en producción ni para uso fuera de entornos controlados.
- Especializado en LIBERO: su comportamiento fuera de las tareas y entornos de ese benchmark no está garantizado.
- Sin datos de benchmarks publicados: no es posible evaluar su rendimiento relativo con la información disponible.
- Idiomas y sesgos: no se documentan idiomas soportados ni análisis de sesgos; al ser una política robótica, los riesgos de sesgo se refieren a sesgos en los datos de demostración, no analizados en la model card.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto; el riesgo equivalente es la generación de acciones incorrectas o inseguras en entornos reales.
- Licencia Apache 2.0: permite uso comercial con atribución, pero el modelo depende de la pila openpi/π0.5, cuyos términos deben verificarse por separado.
- Formato JAX/Flax: requiere toolchain específica (openpi, JAX), lo que limita su portabilidad frente a checkpoints en safetensors o GGUF.
- Tamaño del repositorio (32,2 GB): requiere almacenamiento y ancho de banda considerables para su descarga y uso.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n5000-10000-20261104
- Fuente principal de 50k: https://huggingface.co/Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024
- Variante con cabeza de visión separada: https://huggingface.co/Donghyun1228/pi05-libero-pad-vision-head-source-n50k-10000-20261104
- Fuente con support probe de 50k: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015/tree/main
- Driver del estudio LAPE: `Donghyun1228/vla_adaptation` (commit `f9dbc2e0`), referenciado en la model card; no se proporciona URL directa.
