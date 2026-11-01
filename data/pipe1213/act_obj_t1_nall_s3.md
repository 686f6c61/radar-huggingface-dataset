# Pipe1213/act_obj_t1_nall_s3

## Resumen

ACT (Action Chunking Transformer) entrenado desde cero sobre una única tarea de manipulación robótica en simulación: "coger la salsa BBQ y colocarla en la cesta", correspondiente a la tarea 3 de LIBERO-Object. El modelo forma parte del estudio `vla-vs-scratch`, que compara un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero (ACT) usando exactamente las mismas demostraciones. Este checkpoint concreto se publica para hacer reproducible dicho estudio, no como política de propósito general.

La arquitectura es la de ACT original (Zhao et al., 2023) implementada en LeRobot: 51,7 millones de parámetros, encoder visual ResNet-18 inicializado con pesos de ImageNet, trozos de 100 acciones y el resto de pesos entrenados desde cero. El entrenamiento consume 46 episodios del dataset `lerobot/libero` y requiere solo 0,37 horas en una GPU de portátil RTX 4050 con 6 GB de VRAM, lo que lo convierte en un caso de referencia útil para estudiar el coste real de entrenar políticas de imitación sin preentrenamiento.

Su relevancia es metodológica: proporciona una línea base cuantificada (64 % de éxito medio en tres checkpoints, 82 % en el checkpoint final) frente al 87,3 % de SmolVLA con las mismas demostraciones, y evidencia un problema práctico importante en ACT: la enorme varianza de rendimiento entre checkpoints de una misma ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual ResNet-18 |
| Parámetros totales | 51.671.687 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica; trozos de 100 acciones) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; entrada visual y de estado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (estructura LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que predice secuencias de acciones (chunks) en lugar de acciones individuales, con un encoder visual ResNet-18 que procesa imágenes de 256×256 píxeles y un encoder de estado propiocepcivo. El modelo predice 100 acciones por chunk. El único cambio respecto a los valores por defecto de LeRobot es en evaluación: se replanifica cada 10 acciones en lugar de ejecutar el chunk completo. El encoder ResNet-18 se inicializa con pesos de ImageNet; el resto de la red se entrena desde cero.

El entrenamiento usa 46 episodios concretos del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), con batch size 8, 10.000 pasos, seed 3000 y checkpoints cada 2.000 pasos, sobre LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). No hay RLHF ni DPO: es aprendizaje por imitación supervisado puro. Los estados y acciones se normalizan con estadísticas del dataset `lerobot/libero` completo, no solo de los episodios seleccionados, siguiendo el comportamiento por defecto de LeRobot.

## Capacidades

- Control robótico de manipulación en simulación para una única tarea: coger la salsa BBQ y depositarla en la cesta (LIBERO-Object, task id 3).
- Predicción de chunks de 100 acciones a partir de observaciones visuales (256×256) y estado propiocepcivo.
- Replanificación cada 10 acciones durante la evaluación, lo que permite reaccionar a desviaciones del estado observado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No procesa lenguaje natural: no acepta instrucciones en texto.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento.
- No está diseñado para generalizar a otras tareas, objetos o entornos distintos del simulado.

## Casos de uso

- Reproducción de experimentos de comparación VLA frente a políticas desde cero: el checkpoint permite replicar exactamente los resultados del estudio `vla-vs-scratch` con el comando `lerobot-eval` documentado, útil para grupos que investigan el valor real del preentrenamiento en robótica.
- Línea base en investigación de imitación: sirve como referencia de rendimiento (64 % medio, 82 % en el mejor checkpoint) para nuevas políticas evaluadas sobre los mismos 50 estados iniciales fijos de LIBERO.
- Estudio de la varianza entre checkpoints: al incluir checkpoints en los pasos 6.000, 8.000 y 10.000 con tasas de éxito de 62 %, 48 % y 82 %, es un caso concreto para analizar la inestabilidad de ACT y diseñar protocolos de selección de checkpoints.
- Docencia y formación en robótica con aprendizaje profundo: el entrenamiento completo cabe en 0,37 horas de una RTX 4050 de 6 GB, lo que permite que estudiantes ejecuten el pipeline de LeRobot de principio a fin en hardware de consumo.
- Validación de pipelines de evaluación en MuJoCo/LIBERO: útil para verificar que la infraestructura de simulación, renderizado y métricas de éxito funciona antes de escalar a modelos mayores.
- Pruebas de integración con LeRobot: como artefacto con estructura estándar de LeRobot (`pretrained_model`), sirve para probar herramientas de carga, despliegue y evaluación del ecosistema sin depender de modelos grandes.
- Análisis de coste-beneficio en prototipado: permite estimar cuánto rendimiento se obtiene con 52 M de parámetros y 46 demostraciones antes de invertir en modelos preentrenados de mayor tamaño.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO (init states 0 a 49), 256×256 píxeles, replanificación cada 10 acciones, seed de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 31 de 50 | 62 % |
| 8.000 | 24 de 50 | 48 % |
| 10.000 | 41 de 50 | 82 % |
| Media de los 3 checkpoints | 96 de 150 | 64 % (intervalo de Wilson al 95 %: 56–71 %) |

Contexto agregado del estudio (3 tareas, todas las seeds de entrenamiento): ACT con todas las demostraciones (45–50 por tarea) obtuvo 55,4 %; SmolVLA con las mismas demostraciones, 87,3 %. El autor advierte que la comparación no aísla el efecto del preentrenamiento, ya que ambos métodos difieren también en tamaño, arquitectura y entrada de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, y el repo completo pesa 0,6 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: ninguna en particular; el propio autor entrenó en una RTX 4050 de portátil con 6 GB. Para evaluación, la carga principal es el renderizado MuJoCo (el autor lo ejecutó en CPU bajo WSL2).
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU para inferencia, aunque la simulación dominará el tiempo.
- Opciones de despliegue: `lerobot-eval` (comando documentado por el autor) y el ecosistema LeRobot 0.6.2; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma explícita; el dato conocido es el coste de entrenamiento de 0,37 horas en RTX 4050 para 10.000 pasos con batch size 8.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Enfoque | Tasa de éxito (estudio) | Licencia |
|---|---|---|---|---|---|
| Este modelo (ACT, task 3, 46 demos) | 51,7 M | Visión + estado | Desde cero, imitación | 64 % medio (82 % mejor checkpoint) | apache-2.0 |
| ACT, media del estudio (3 tareas, todas las demos) | 51,7 M | Visión + estado | Desde cero, imitación | 55,4 % | apache-2.0 |
| SmolVLA con las mismas demos | no disponible en la información | Visión + lenguaje + estado | VLA preentrenado, fine-tuning | 87,3 % | no disponible en la información |

La comparación con SmolVLA no es limpia según el propio autor: difieren en preentrenamiento, tamaño, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse solo al preentrenamiento.

## Limitaciones y advertencias

- Solo simulación: una única tarea de un único benchmark; no probado en robot real.
- No es una política de propósito general; el autor lo publica para reproducibilidad del estudio.
- Alta varianza entre checkpoints de una misma ejecución: ocurrió en 30 de 36 ejecuciones de ACT del estudio. Es imprescindible evaluar cada checkpoint antes de usarlo; el checkpoint del paso 8.000 rinde mucho peor (48 %) que el del 10.000 (82 %).
- La normalización de estados y acciones usa estadísticas del dataset `lerobot/libero` completo, no solo de las 46 demostraciones, lo que introduce una dependencia del dataset global.
- ACT se entrenó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, lo que sesga la selección.
- El intervalo de Wilson del 64 % cubre solo el muestreo de evaluación; la variación entre seeds de entrenamiento es mayor.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de fallo silencioso en escenarios visuales no vistos; no hay análisis de sesgo publicado.
- Licencia apache-2.0: permite uso comercial, pero el modelo no está validado para producción ni para entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t1_nall_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible en la información proporcionada (versión usada: 0.6.2, commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`)
