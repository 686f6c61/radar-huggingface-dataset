# Pipe1213/act_obj_t2_nall

## Resumen

Pipe1213/act_obj_t2_nall es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: recoger un trozo de mantequilla y depositarlo en una cesta, dentro del benchmark LIBERO-Object (task id 6). El modelo forma parte del estudio comparativo vla-vs-scratch, que contrasta una política entrenada desde cero (ACT) con un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) sobre las mismas demostraciones. No es una política de propósito general: se publica exclusivamente para hacer reproducible el estudio.

Técnicamente es una red de 51,7 millones de parámetros con un codificador visual ResNet-18 inicializado con pesos de ImageNet y un transformer que predice trozos de 100 acciones. Se entrenó con 45 episodios del dataset lerobot/libero durante 10.000 pasos con configuración por defecto de LeRobot 0.6.2, en 0,44 horas sobre una RTX 4050 de portátil (6 GB de VRAM). El checkpoint publicado en la raíz del repositorio corresponde al paso 10.000 y alcanza un 36% de éxito (18 de 50 escenas fijas de LIBERO).

Su relevancia es metodológica más que práctica: proporciona un punto de referencia cuantificado sobre cuánto rinde la imitación desde cero frente a un VLA preentrenado con pocas demostraciones (33,3% de media frente al 87,3% de SmolVLA en el conjunto del estudio). Es útil para investigadores que quieran reproducir la comparación, analizar la varianza entre checkpoints de ACT o reutilizar el pipeline de entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): codificador visual ResNet-18 + transformer de predicción de acciones |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones imagen + estado y predice chunks de 100 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada por el entorno LIBERO) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT combina un codificador visual convolucional (ResNet-18 con pesos iniciales de ImageNet) con un transformer que, a partir de las observaciones (imágenes de 256x256 y estado del robot), predice secuencias de 100 acciones (action chunking). El resto de los pesos se entrena desde cero sobre las demostraciones. En evaluación se re-planifica cada 10 acciones en lugar de ejecutar el chunk completo, único cambio respecto a los valores por defecto de LeRobot.

El entrenamiento usó 45 episodios concretos del dataset lerobot/libero (revisión a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 1000, sobre LeRobot 0.6.2 (commit b9cb121cb7d4e3e26ec5c906d08dda68d151ba52). No se aplicó ajuste de hiperparámetros ni RLHF/DPO: es aprendizaje por imitación supervisado puro. Los estados y acciones se normalizan con estadísticas de todo el dataset lerobot/libero, no solo de los episodios seleccionados.

## Capacidades

- Manipulación robótica simulada de una única tarea: recoger la mantequilla y colocarla en la cesta (LIBERO-Object, task id 6).
- Predicción de chunks de 100 acciones a partir de observaciones visuales de 256x256 y estado del robot.
- Re-planificación cada 10 acciones para corregir desviaciones durante la ejecución.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No procesa lenguaje natural: la tarea está fijada por el entorno de evaluación.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento.
- No está entrenado ni validado para ningún robot físico.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: cargar el checkpoint y ejecutar el comando de evaluación documentado para verificar el 36% de éxito en las 50 escenas fijas de LIBERO.
- Línea base de imitación desde cero: comparar una política ACT de 52M parámetros con variantes preentrenadas (SmolVLA) bajo el mismo conjunto de demostraciones y presupuesto de pasos.
- Análisis de varianza entre checkpoints: los checkpoints de 6.000, 8.000 y 10.000 pasos están en el repositorio y rinden de forma distinta (34%, 30% y 36%), lo que permite estudiar la estabilidad del entrenamiento de ACT.
- Estudio de curvas datos-rendimiento: el conjunto de 45 episodios es el mayor de una serie anidada, útil para analizar cómo escala ACT con el número de demostraciones.
- Docencia y experimentación con LeRobot: sirve como ejemplo mínimo y reproducible de entrenamiento y evaluación de una política ACT en simulación con MuJoCo.
- Referencia para calibrar expectativas antes de invertir en un VLA preentrenado: cuantifica la brecha de rendimiento entre ambos enfoques en tareas concretas de LIBERO-Object.

## Benchmarks y rendimiento

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 17 de 50 | 34% |
| 8.000 | 15 de 50 | 30% |
| 10.000 (raíz del repo) | 18 de 50 | 36% |
| Media de los 3 checkpoints | 50 de 150 | 33,3% (IC 95% Wilson: 26-41%) |

Contexto del estudio (agregado sobre 3 tareas y todas las semillas): ACT con todas las demostraciones (45-50 por tarea) obtuvo 55,4%; SmolVLA con las mismas demostraciones, 87,3%. La evaluación se realizó con 50 episodios por checkpoint desde los estados iniciales fijos de LIBERO, imágenes de 256x256, re-planificación cada 10 acciones y semilla 1000.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 51,7M parámetros (unos 0,2 GB en fp32) y el repositorio completo ocupa 0,6 GB.
- Entrenamiento de referencia: 0,44 h en una RTX 4050 de portátil con 6 GB de VRAM.
- Cabe holgadamente en cualquier GPU consumer (RTX 3050/4050 en adelante) e incluso en CPU para inferencia, aunque la evaluación en MuJoCo se ejecutó con renderizado en CPU bajo WSL2.
- Despliegue mediante la librería LeRobot (lerobot-train y lerobot-eval); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto / entrada | Rendimiento en el estudio | Licencia |
|---|---|---|---|---|---|
| act_obj_t2_nall (este) | 51,7M | ACT desde cero, una tarea | Imagen 256x256 + estado; chunk de 100 acciones | 33,3% (media de 3 checkpoints) | Apache 2.0 |
| SmolVLA (referencia del estudio) | no disponible en la información | VLA preentrenado y ajustado | Imagen + lenguaje + estado | 87,3% (agregado del estudio) | no disponible en la información |
| ACT con todas las demostraciones (agregado) | 52M (configuración LeRobot) | ACT desde cero | Imagen + estado | 55,4% (agregado del estudio) | Apache 2.0 |

No se dispone de datos de otros modelos comparables fuera del propio estudio vla-vs-scratch.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no probado en un robot real.
- La comparación con SmolVLA mezcla diferencias de preentrenamiento con diferencias de tamaño, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse solo al preentrenamiento.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint SmolVLA publicado ya resolvía, lo que sesga los resultados hacia esas tareas.
- Normalización de estados y acciones con estadísticas de todo el dataset lerobot/libero, no solo de los episodios seleccionados.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste para esta tarea.
- Alta varianza entre checkpoints de la misma ejecución (en 30 de 36 ejecuciones ACT del estudio): hay que evaluar cada checkpoint antes de usarlo.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí de fallos de política: el 64% de los episodios del checkpoint publicado no completan la tarea.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción ni para entornos físicos.
- Idiomas soportados no disponibles; el modelo no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t2_nall
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
