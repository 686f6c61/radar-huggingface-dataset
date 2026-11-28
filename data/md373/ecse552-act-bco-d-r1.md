# md373/ecse552-act-bco-D-r1

## Resumen

`md373/ecse552-act-bco-D-r1` es un modelo de aprendizaje por imitación para robótica basado en ACT (Action Chunking Transformer), la arquitectura propuesta en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*. Lo publica el usuario `md373` en el contexto del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No se trata de un modelo de lenguaje, sino de una política de control robótico que predice acciones de articulaciones a partir de imágenes.

El modelo reutiliza el código original de ACT sin modificaciones arquitectónicas y se entrena sobre el dataset `Autobrik/ecse552-ocbench-block`, en su revisión `e3d9dc6c4a97d3fe51d86837b86c5ae4ea54a7de`. Las diferencias respecto a ACT canónico son de adaptación de la interfaz: solo se usan imágenes (el estado del robot se pone a cero), las 7 dimensiones de acción del proyecto se rellenan con ceros hasta las 14 de ACT original, y los episodios son de longitud variable.

Su relevancia es acotada y experimental: es un artefacto de investigación académica con cero descargas y cero likes en el momento de la consulta, pensado para reproducir y evaluar experimentos de manipulación robótica a partir de vídeos sin acciones (action-free). No está pensado como modelo de propósito general ni como servicio listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), código original `tonyzhaozh/act` sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa observaciones visuales por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt` |
| Dataset de entrenamiento | `Autobrik/ecse552-ocbench-block` (revisión `e3d9dc6c4a97d3fe51d86837b86c5ae4ea54a7de`) |
| Frecuencia de control | 10 Hz |
| Horizonte de chunking | 20 pasos (2 s), equivalente a los 100 pasos a 50 Hz de ACT original |
| Dimension de acciones | 7 dimensiones reales, rellenadas con ceros hasta 14 |
| Tipo de acciones | objetivos articulares absolutos (absolute joint targets) |
| Entrada | imágenes únicamente (estado del robot a cero) |
| Pipeline HF | robotics |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer con encoder visual y decoder de acciones que predice *chunks* de acciones futuras en lugar de acciones individuales, lo que reduce el error de composición en tareas de manipulación de precisión. El modelo se entrena por imitación supervisada (behavior cloning) sobre pares observación-acción. En esta variante concreta, el estado propioceptivo del robot se anula (se pone a cero), de modo que la política depende únicamente de la información visual.

El entrenamiento se realizó sobre el dataset `Autobrik/ecse552-ocbench-block`, con episodios de longitud variable y acciones de 7 dimensiones rellenadas hasta 14 para encajar con la interfaz de ACT original. La configuración usada es `configs/act_bco_D_r1.toml` del repositorio `BrikHMP18/ecse-552-project`, con el adaptador `src/action_free/act_original.py`. El modelo puede entrenarse sobre varias colecciones (oráculo para la variante (d), objetivos pseudo-etiquetados para (b)/(c)), que se listan en el fichero `act_run.json` bajo `data.collections`. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en behavior cloning robótico).

Cada directorio `n<demos>/seed<k>/` contiene una ejecución independiente con `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt`, `selection.json` (el mejor de los dos según rollouts de validación en el dominio fuente, que es el evaluado en test), `dataset_stats.pkl`, `act_run.json` (argumentos, split y datos), `history.json` (pérdidas por época) y `provenance.json`. La carga se realiza con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`.

## Capacidades

- Predicción de acciones de manipulación robótica a partir de observaciones visuales, en forma de chunks de 20 pasos a 10 Hz.
- Control de un brazo robótico con acciones articulares absolutas de 7 dimensiones.
- Aprendizaje por imitación a partir de demostraciones, incluyendo configuraciones con objetivos pseudo-etiquetados (variantes b/c) y con datos oráculo (variante d).
- Ejecución sobre episodios de longitud variable.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni agentes conversacionales.
- No tiene capacidades multilingües, de visión general, audio ni generación de texto.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Reproducción de experimentos académicos de behavior cloning: cargar `n300/seed0/selected.ckpt` con `ActPolicy` y evaluar rollouts sobre el entorno `ocbench-block` para replicar los resultados del proyecto ECSE 552.
- Comparación de variantes de entrenamiento (b/c/d): los distintos directorios `n<demos>/seed<k>/` permiten contrastar el efecto del número de demostraciones y de la semilla en la pérdida de validación y en el éxito de la tarea.
- Estudio de aprendizaje a partir de vídeos sin acciones: la variante (d) usa datos oráculo mientras que (b)/(c) usan objetivos pseudo-etiquetados, lo que permite medir la brecha entre supervisión completa y supervisión derivada de vídeo.
- Investigación en manipulación con estado enmascarado: al ponerse a cero el estado del robot, el modelo sirve para estudiar políticas puramente visuales y su robustez ante la ausencia de propiocepción.
- Base para transferencia a un nuevo objeto: el proyecto original apunta a manipular un objeto nuevo a partir de vídeos sin acciones, por lo que el checkpoint puede usarse como punto de partida en experimentos de adaptación.
- Docencia y prácticas de robótica: sirve como ejemplo funcional de pipeline ACT completo (entrenamiento, selección de checkpoint por validación y evaluación en test) para cursos de aprendizaje automático aplicado a robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas con otras políticas; solo describe la estructura de checkpoints y la selección por pérdida de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. ACT es una red de tamaño moderado (encoder visual tipo ResNet y transformer de acciones), por lo que en la práctica suele caber en GPUs de consumo, pero no se aporta cifra concreta en la información disponible.
- GPU recomendadas: no disponible en la documentación. Por la naturaleza de ACT, una GPU NVIDIA con soporte CUDA es el entorno esperado para ejecutar PyTorch.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: carga mediante el adaptador `action_free.act_original.ActPolicy` del repositorio `BrikHMP18/ecse-552-project` sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `md373/ecse552-act-bco-D-r1` | ACT (transformer + encoder visual) | no disponible | chunk de 20 pasos a 10 Hz | MIT | Hugging Face, 0 descargas |
| ACT original (`tonyzhaozh/act`) | ACT | no disponible | chunk de 100 pasos a 50 Hz | MIT (repositorio original) | GitHub |
| Otras políticas de imitation learning (p. ej. Diffusion Policy, RT-1) | diffusion / transformer | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: la model card no aporta métricas de éxito ni comparaciones con Diffusion Policy, RT-1 u otras políticas de manipulación.

## Limitaciones y advertencias

- Modelo de investigación académica: cero descargas y cero likes, sin validación externa conocida; no debe tratarse como artefacto listo para producción.
- Dependencia total de la información visual: al anularse el estado del robot, la política puede ser frágil ante oclusiones, cambios de iluminación o calibración de cámara distintos de los del dataset.
- Dominio muy restringido: entrenado sobre una única tarea y un único dataset (`ocbench-block`); no generaliza a otros objetos ni entornos sin reentrenamiento.
- Riesgo de sobreajuste y de acumulación de error en rollouts largos, inherente al behavior cloning con chunks.
- Las acciones de 7 dimensiones se rellenan con ceros hasta 14, lo que puede introducir ambigüedad si se reutiliza el checkpoint fuera del adaptador previsto.
- No hay datos sobre sesgos, alucinación en sentido lingüístico ni cobertura multilingüe porque el modelo no procesa lenguaje.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el proyecto y el dataset de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/md373/ecse552-act-bco-D-r1
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
