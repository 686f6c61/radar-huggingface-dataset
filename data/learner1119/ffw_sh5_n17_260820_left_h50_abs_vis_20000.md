# learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_20000

## Resumen

Este repositorio contiene un checkpoint intermedio del modelo `learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_20000`, un ajuste fino de tipo VLA (vision-language-action) derivado de `nvidia/GR00T-N1.7-3B`. Lo publica el usuario `learner1119` como parte de una serie de experimentos de robótica sobre el dataset `learner1119/260820`. El modelo resuelve el problema de generar acciones motoras para un brazo robótico izquierdo a partir de observaciones visuales y consignas, con un horizonte de predicción de 50 pasos y representación de acciones en espacio absoluto. No es un modelo de propósito general: es un artefacto de investigación para manipulación robótica.

El checkpoint corresponde al paso 20.000 de un entrenamiento de 50.000 pasos, con una pérdida de entrenamiento de 0,0213 (media móvil de 25 puntos) y un rendimiento de 2,22 s/paso sobre 4 GPU A100 de 80 GB. La arquitectura hereda el backbone `nvidia/Cosmos-Reason2-2B` con las capas del LLM limitadas a las 12 primeras, y el conjunto de pesos suma 3.144.016.000 parámetros en BF16 repartidos en dos shards.

Su relevancia es acotada pero concreta: sirve para estudiar la curva de entrenamiento de un VLA en tareas de manipulación, comparar puntos intermedios frente al checkpoint final y reproducir configuraciones de modalidad. Al ser un checkpoint intermedio, el propio autor recomienda usar el repositorio final salvo que se necesite explícitamente este punto de la curva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en transformer; backbone nvidia/Cosmos-Reason2-2B con capas del LLM limitadas a <= 12 |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; horizonte de accion de 50 pasos |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (license_name en la model card; tag license: other) |
| Formato de pesos | safetensors (BF16, 2 shards) |
| Tamano del repositorio | 6,9 GB |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Dataset de entrenamiento | learner1119/260820 |
| Libreria | transformers (clase Gr00tPolicy) |
| Pipeline | robotics |
| Paso de entrenamiento | 20.000 de 50.000 |
| Perdida de entrenamiento | 0,0213 (media movil de 25 puntos) |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre `nvidia/GR00T-N1.7-3B`, cuyo backbone es `nvidia/Cosmos-Reason2-2B` con las capas del LLM recortadas a 12 o menos. La tarea combina entrada visual (tune_visual = True, es decir, la torre de visión se ajusta durante el entrenamiento) con estado del robot y produce acciones motoras en representación absoluta con horizonte de 50 pasos. La configuración de modalidad empleada se distribuye como fichero `ffw_sh5_left8_h50_config.py`, que debe importarse y registrarse antes de instanciar `Gr00tPolicy(model_path=..., embodiment_tag="new_embodiment")`.

El entrenamiento se realizó con batch global 64, learning rate 1e-4 con schedule coseno, warmup 0,05, weight decay 1e-5 y state_dropout 0,2, usando DeepSpeed ZeRO-2 sobre 4 GPU A100 de 80 GB a 2,22 s/paso. El dataset `learner1119/260820` corresponde a una tarea «ffw_sh5» en la que solo se modela el brazo izquierdo: se usan 8 de las 16 dimensiones de acción y el brazo derecho nunca se mueve. No se reservó ningún split de validación, por lo que la única métrica reportada es la pérdida de entrenamiento. El estado del optimizador (shards ZeRO-2) no se incluye en el repositorio.

## Capacidades

- Generación de acciones motoras para un brazo robótico izquierdo a partir de observaciones visuales, con horizonte de 50 pasos y representación absoluta.
- Percepción visual integrada: la torre de visión se ajustó durante el entrenamiento (tune_visual = True), no se congela.
- Condicionamiento por estado (state_dropout 0,2 durante el entrenamiento), lo que permite cierto grado de robustez ante entradas de estado parciales o ausentes.
- Control monobrazo específico: 8 de las 16 dimensiones de acción; el brazo derecho se mantiene fijo.
- Soporte de tool calling / function calling: no disponible; no es una capacidad descrita para este modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de texto; el «multi-paso» aquí es el horizonte de acción de 50 pasos.
- Capacidades multilingües: no disponible.
- Capacidades especiales: ninguna adicional descrita (sin modo thinking, audio ni visión más allá del pipeline VLA).

## Casos de uso

- Investigación sobre curvas de entrenamiento en VLA: este checkpoint permite comparar el paso 20.000 con el checkpoint final (50.000) manteniendo datos, configuración y semilla idénticos, para estudiar convergencia y posibles regímenes de sobreajuste.
- Ablaciones de representación de acción: al existir un hermano con representación relativa (`..._rel_20000`) y otro con representación absoluta (`..._abs_20000`), sirve para aislar el efecto del espacio de acciones en el rendimiento de políticas de manipulación.
- Estudio de ajuste de la torre de visión: comparar variantes con `tune_visual` activado frente a alternativas permite medir cuánto aporta el ajuste visual en tareas de agarre y colocación.
- Reproducción de experimentos de entrenamiento distribuido: la configuración documentada (batch 64, lr 1e-4, coseno, warmup 0,05, wd 1e-5, state_dropout 0,2, ZeRO-2 sobre 4x A100 80GB) es replicable paso a paso como referencia de receta.
- Punto de partida para nuevos ajustes finos: al ser un checkpoint intermedio con licencia NVIDIA, puede usarse como inicialización en lugar del modelo base cuando interese una política ya parcialmente adaptada a la tarea ffw_sh5.
- Evaluación de infraestructura robótica: permite probar el pipeline `Gr00tPolicy` con `embodiment_tag="new_embodiment"` junto con el fichero de configuración de modalidad, validando el flujo de carga y registro de configuraciones personalizadas.
- Docencia y divulgación técnica: útil como ejemplo real de artefacto intermedio de entrenamiento VLA, con pesos BF16 en dos shards y estructura de repositorio tal como la escribe el entrenador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento (0,0213 como media móvil de 25 puntos en el paso 20.000), sin split de validación, y remite al repositorio final para una comparativa de cuatro vías que no se incluye en esta ficha.

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (media movil 25 puntos, paso 20.000) | 0,0213 |
| Throughput de entrenamiento | 2,22 s/paso sobre 4x A100 80GB, batch global 64 |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | no disponibles |
| Evaluacion en tareas roboticas (tasa de exito, etc.) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,3 GB solo de pesos (3.144.016.000 parámetros x 2 bytes); con activaciones, buffers de visión y overhead del runtime, el consumo real es superior y no está documentado, por lo que debe medirse en el entorno objetivo.
- Entrenamiento: la receta documentada se ejecutó sobre 4 GPU A100 de 80 GB con DeepSpeed ZeRO-2, a 2,22 s/paso con batch global 64.
- GPU recomendadas: A100 80GB o H100 para entrenamiento y ajuste fino. Para inferencia, cualquier GPU con suficiente memoria para los pesos y el pipeline de visión.
- GPU de consumo: los pesos en BF16 caben en una RTX 4090 (24 GB) y probablemente en tarjetas de 16 GB, aunque no hay datos publicados de consumo real de memoria ni de latencia de inferencia en estas GPU. No se han publicado versiones cuantizadas.
- Opciones de despliegue: la model card indica el uso de la librería `transformers` mediante `Gr00tPolicy`, con carga del fichero de configuración de modalidad (`ffw_sh5_left8_h50_config.py` importado y registrado previamente). No hay referencias a vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Paso / estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_20000 | 3.144.016.000 | VLA, checkpoint intermedio | 20.000 / 50.000 | nvidia-open-model-license | Repo propio, 0 descargas |
| learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_50000 | no disponible en la informacion | VLA, checkpoint final | 50.000 / 50.000 | nvidia-open-model-license | Repo citado en la model card |
| learner1119/ffw_sh5_n17_260820_left_h50_abs_20000 | no disponible en la informacion | VLA, misma receta con representacion absoluta | 20.000 | nvidia-open-model-license | Repo hermano citado |
| learner1119/ffw_sh5_n17_260820_left_h50_rel_20000 | no disponible en la informacion | VLA, misma receta con representacion relativa | 20.000 | nvidia-open-model-license | Repo hermano citado |
| nvidia/GR00T-N1.7-3B | 3B (nominal) | VLA base | modelo base | nvidia-open-model-license | Repositorio de NVIDIA |

No se dispone de cifras de rendimiento comparadas entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 20.000 de 50.000): el propio autor recomienda usar el repositorio final salvo que se quiera ese punto concreto de la curva de entrenamiento.
- No se reservó split de validación: la pérdida reportada es de entrenamiento y no permite estimar generalización ni sobreajuste.
- Solo se modela el brazo izquierdo con 8 de las 16 dimensiones de acción; el brazo derecho nunca se mueve. No es aplicable a control bimanual.
- El estado del optimizador (DeepSpeed ZeRO-2) no se incluye, por lo que reanudar el entrenamiento exactamente desde este punto requeriría reconstruir el estado.
- Requiere registrar previamente la configuración de modalidad (`ffw_sh5_left8_h50_config.py`) antes de cargar la política con `Gr00tPolicy`; sin ese paso la carga no es directa.
- Idiomas soportados, longitud de contexto y cuantizaciones: no disponibles. No se debe asumir soporte multilingüe ni contextos largos.
- Riesgo de alucinación: no evaluado en la informacion disponible; en modelos VLA el equivalente práctico es la generación de trayectorias inválidas o inseguras, sin métricas publicadas al respecto.
- Sesgos: no disponibles. El comportamiento depende por completo de la distribución del dataset `learner1119/260820`, no descrito en detalle más allá de la tarea ffw_sh5.
- Licencia: `nvidia-open-model-license` (tag `license: other`). Es necesario revisar los términos del acuerdo de NVIDIA antes de cualquier uso comercial; no se trata de una licencia tipo Apache 2.0 o MIT.
- Advertencia para producción: al ser un experimento con 0 descargas y 0 likes, sin benchmarks ni evaluación de seguridad, no está validado para despliegue en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_20000
- Checkpoint final de la misma ejecución: https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_50000
- Dataset de entrenamiento: https://huggingface.co/datasets/learner1119/260820
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone declarado: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Licencia NVIDIA open model license: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Repositorios hermanos citados en la model card: `learner1119/ffw_sh5_n17_260820_left_h50_abs_20000` y `learner1119/ffw_sh5_n17_260820_left_h50_rel_20000` (rutas relativas al mismo autor en HuggingFace)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos correspondian a definiciones de la palabra "mission" y a tiendas no relacionadas), por lo que no se incluyen.
