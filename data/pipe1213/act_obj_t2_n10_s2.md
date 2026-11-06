# Pipe1213/act_obj_t2_n10_s2

## Resumen

`Pipe1213/act_obj_t2_n10_s2` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: recoger un bloque de mantequilla y depositarlo en una cesta, dentro del benchmark LIBERO-Object (tarea con id 6). No es un modelo de lenguaje ni un modelo de propósito general: es un artefacto de investigación publicado para hacer reproducible un estudio comparativo entre políticas entrenadas desde cero (ACT) y modelos visión-lenguaje-acción preentrenados (SmolVLA) con las mismas pocas demostraciones.

El modelo tiene 51.671.687 parámetros (52M) y se distribuye en formato safetensors con la librería LeRobot. Se entrenó con solo 10 episodios de demostración del dataset `lerobot/libero`, en 10.000 pasos con batch size 8, semilla 2000, y un coste de cómputo de 0,44 horas en una GPU de portátil RTX 4050 de 6 GB. La innovación no está en la arquitectura —es ACT estándar con los valores por defecto de LeRobot— sino en el contexto experimental: forma parte de una cuadrícula de 60 políticas que comparan sistemáticamente ambos enfoques.

Su relevancia es metodológica, no de producto. Publica resultados de éxito medidos sobre 50 escenas iniciales fijas de LIBERO y muestra una tasa media del 39,3% (intervalo de Wilson del 95%: 32-47%) en los tres checkpoints evaluados, frente al 82,4% agrupado de SmolVLA con las mismas demostraciones en el conjunto del estudio. Es útil para quien investigue imitación con pocos datos, reproducibilidad en robótica simulada o la brecha entre políticas desde cero y VLA preentrenados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder de imagen ResNet-18 |
| Parámetros totales | 51.671.687 (52M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa chunks de 100 acciones) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada por el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de compounding en tareas de imitación. Este checkpoint concreto usa la configuración por defecto de LeRobot: encoder visual ResNet-18 inicializado con pesos de ImageNet, chunks de 100 acciones y el resto de los componentes entrenados desde cero. La única desviación respecto a los valores por defecto se produce en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usó 10 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), concretamente los episodios 873, 914, 927, 938, 961, 1012, 1124, 1183, 1185 y 1212. Se realizaron 10.000 pasos con batch size 8, guardando checkpoint cada 2.000 pasos, con semilla 2000 y LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). No hay RLHF, DPO ni ajuste fino posterior: es imitación supervisada pura sobre demostraciones. Los estados y acciones se normalizan con estadísticas del dataset completo `lerobot/libero`, no solo de los episodios seleccionados, siguiendo el comportamiento por defecto de LeRobot.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: coger el bloque de mantequilla y colocarlo en la cesta (LIBERO-Object, task id 6).
- Predicción de chunks de 100 acciones con replanificación cada 10 acciones en evaluación.
- Procesamiento de observaciones visuales RGB de 256×256 píxeles mediante encoder ResNet-18.
- Entrada de estado del robot y salida de acciones continuas normalizadas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni comprensión de instrucciones en lenguaje natural: la tarea está codificada en los pesos.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación con pocos datos: sirve como referencia exacta de ACT con 10 demostraciones y semilla 2000 para replicar la comparativa del estudio `vla-vs-scratch` en las mismas 50 escenas iniciales de LIBERO.
- Baseline en investigación sobre políticas desde cero: permite medir la brecha frente a VLA preentrenados como SmolVLA bajo idénticas condiciones de datos y evaluación, tal como hace el estudio original.
- Estudio de la variabilidad entre checkpoints: el autor documenta que checkpoints del mismo entrenamiento rinden de forma muy distinta (en 30 de 36 ejecuciones de ACT del estudio), por lo que este modelo es útil para analizar la estabilidad del entrenamiento y la necesidad de evaluar cada checkpoint.
- Docencia y formación en robótica: ejemplo mínimo (52M parámetros, 0,6 GB de repo, 0,44 h de entrenamiento en una RTX 4050) para ilustrar el pipeline completo de LeRobot, desde `lerobot-train` hasta `lerobot-eval` en MuJoCo.
- Pruebas de infraestructura de evaluación: su comando de evaluación documentado con estados iniciales fijos, semilla 1000 y renderizado MuJoCo en CPU permite validar entornos WSL2 y configuraciones de LIBERO sin depender de hardware dedicado.
- Análisis de sensibilidad al número de demostraciones: al formar parte de una cuadrícula con conjuntos anidados (los conjuntos pequeños están contenidos en los grandes), se puede comparar el efecto de reducir episodios manteniendo el mismo presupuesto de pasos.
- Prototipado de políticas para tareas de pick-and-place en simulación antes de invertir en modelos mayores o en ajuste fino de VLA.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO-Object (estados 0 a 49), imágenes de 256×256, replanificación cada 10 acciones, semilla de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 20 de 50 | 40% |
| 8.000 | 21 de 50 | 42% |
| 10.000 | 18 de 50 | 36% |
| Media de los 3 checkpoints | 59 de 150 | 39,3% (IC 95% Wilson: 32-47%) |

Contexto del estudio (agregado sobre 3 tareas y todas las semillas de entrenamiento, con 10 demostraciones por tarea): ACT desde cero obtuvo 34,6% y SmolVLA preentrenado obtuvo 82,4%. El intervalo de Wilson cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 52M parámetros y encoder ResNet-18, el modelo cabe holgadamente en GPUs de 4-6 GB. El propio autor entrenó en una RTX 4050 de 6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 4050, 4060, 4090) es suficiente; también A100 o H100 si se integra en pipelines de evaluación a gran escala, aunque están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para inferencia, aunque la evaluación con MuJoCo se ejecutó con renderizado en CPU (WSL2).
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path`), con entorno `libero` y MuJoCo. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible. El autor reporta 0,44 h de entrenamiento en una RTX 4050, pero no publica métricas de latencia de inferencia ni de throughput de evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo, 10 demos, semilla 2000) | 52M | Chunks de 100 acciones, imágenes 256×256 | 39,3% medio en 3 checkpoints (36% en el último) | Apache 2.0 | Hugging Face, LeRobot |
| ACT agregado del estudio (3 tareas, todas las semillas, 10 demos) | 52M | Chunks de 100 acciones | 34,6% | Apache 2.0 | Repositorio `vla-vs-scratch` |
| SmolVLA (preentrenado, mismas demos) | no disponible en la información | Entrada de lenguaje e imagen | 82,4% | no disponible en la información | Referenciado en el estudio |
| Otros checkpoints ACT del estudio (60 políticas en total) | 52M | Chunks de 100 acciones | Variabilidad alta entre checkpoints | Apache 2.0 | Repositorio `vla-vs-scratch` |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: ambos difieren también en tamaño, arquitectura y entrada de lenguaje, como advierte el propio autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- La comparación con SmolVLA del estudio mezcla preentrenamiento con diferencias de tamaño, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse solo al preentrenamiento.
- Las 3 tareas del estudio se eligieron entre tareas de LIBERO-Object que un checkpoint publicado de SmolVLA ya resolvía, así que los resultados describen esas tareas concretas.
- Los estados y acciones se normalizan con estadísticas de todo `lerobot/libero`, no solo de las 10 demostraciones seleccionadas (comportamiento por defecto de LeRobot).
- ACT usó los valores por defecto de LeRobot y no se ajustó para esta tarea.
- Alta variabilidad entre checkpoints del mismo entrenamiento: en 30 de 36 ejecuciones de ACT del estudio los checkpoints rinden de forma muy distinta; hay que evaluar el checkpoint antes de usarlo.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas fuera de la distribución de las 10 demostraciones; no hay mecanismo de verificación.
- Sin capacidades de lenguaje: no acepta instrucciones en texto, por lo que no es reutilizable para otras tareas sin reentrenar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción ni para entornos reales; cualquier uso fuera de investigación conlleva riesgo no cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t2_n10_s2
- Repositorio del estudio `vla-vs-scratch`: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos del estudio: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis del estudio: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset `lerobot/libero`: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible enlace directo en la información proporcionada
