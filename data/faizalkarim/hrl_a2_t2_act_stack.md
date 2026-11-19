# faizalkarim/hrl_A2_t2_act_stack

## Resumen

`faizalkarim/hrl_A2_t2_act_stack` es una política robótica de una sola tarea basada en ACT (Action Chunking with Transformers), entrenada desde cero con LeRobot 0.6.2 sobre 150 demostraciones teleoperadas en un brazo SO-101. El modelo resuelve una tarea concreta de manipulación: construir una torre de tres bloques (verde, morado y rojo) sobre un punto de apilado fijo, soltar la pieza y volver a la posición de reposo. Es un artefacto académico del curso Hands-on Robot Learning (otoño de 2026, Assignment 2, Task 2), no un modelo de propósito general.

La arquitectura es un transformer encoder-decoder compacto con un backbone visual ResNet-18 compartido entre dos cámaras (muñeca y frontal), 34,2 millones de parámetros y un chunk de acciones de 50 pasos ejecutados a 30 Hz. La política consume posiciones articulares del seguidor y dos flujos RGB de 640x480, y emite posiciones articulares del líder (5 articulaciones en grados y pinza en escala 0-100).

Su relevancia es la de un ejemplo reproducible de imitation learning de extremo a extremo en hardware de bajo coste (SO-101): sirve para estudiar el pipeline de LeRobot, el formateo de datasets y el despliegue con `lerobot-rollout`, pero no está pensado para producción ni para variaciones de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): ResNet-18 compartido + transformer encoder de 4 capas + decoder de 1 capa, sin VAE (`use_vae=false`) |
| Parametros totales | 34.217.542 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk de acciones de 50 pasos, 25 ejecutados por chunk) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que predice secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas. En esta variante se prescinde de la rama VAE y de la pérdida de estilo (`use_vae=false`), por lo que el modelo es determinista en la generación de acciones. El backbone visual es un ResNet-18 inicializado con pesos de ImageNet y compartido entre las dos cámaras; la salida visual se concatena con el estado de 6 articulaciones y se procesa con un encoder de 4 capas y un decoder de 1 capa. El chunk es de 50 pasos (1,7 s a 30 Hz), de los cuales se ejecutan 25 por defecto en el despliegue.

El entrenamiento se realizó sobre 150 demostraciones (108.849 fotogramas a 30 Hz) grabadas con `lerobot-record`; se recortaron los 0,3 s iniciales de cada episodio en los que el brazo está quieto (9,1% de los fotogramas). Se entrenaron 50.000 pasos con batch 128 (64 x 2 GPUs), AdamW con weight decay 1e-4, recorte de gradiente 10, learning rate 3e-4 con 1.000 pasos de warm-up y decaimiento coseno hasta 3e-6, semilla 285628. La augmentación se limitó a variaciones de iluminación (brillo, contraste y saturación 0,8-1,2; tono ±0,02; temperatura de color 5.500-7.500 K) en 3 de cada 5 imágenes, sin augmentación geométrica. La pérdida L1 final de entrenamiento fue 0,016 en unidades normalizadas.

## Capacidades

- Generación de trayectorias de acciones de 6 dimensiones (5 articulaciones del brazo en grados y pinza en escala 0-100) a 30 Hz.
- Percepción visual multimodal a partir de dos cámaras RGB de 640x480 (muñeca y frontal).
- Fusión de estado propioceptivo (6 posiciones articulares del seguidor) con las observaciones visuales.
- Ejecución de una tarea de manipulación de una sola etapa: apilar tres bloques en una torre vertical y volver a reposo.
- Predicción en chunks con ejecución parcial (50 predichos, 25 ejecutados), lo que permite reaccionar antes de agotar el horizonte de acciones.
- Despliegue integrado en el ecosistema LeRobot mediante `lerobot-rollout`.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Docencia y reproducción de experimentos: sirve como referencia completa del pipeline de LeRobot (grabación con `lerobot-record`, entrenamiento ACT y despliegue con `lerobot-rollout`) para asignaturas de robot learning.
- Apilado de bloques en laboratorio: el modelo ejecuta la tarea de torre de tres bloques sobre un SO-101 con la disposición inicial exacta usada en el dataset, útil para validar hardware y calibración.
- Comparación de políticas de imitación: al ser un ACT sin VAE, permite contrastar frente a variantes con VAE o frente a otros métodos (Diffusion Policy, etc.) en la misma tarea y con el mismo dataset.
- Base para fine-tuning: los checkpoints intermedios cada 5.000 pasos permiten estudiar curvas de aprendizaje y reutilizar el modelo como inicialización para variantes de la tarea.
- Validación de infraestructura de inferencia en Apple Silicon: la model card documenta el despliegue con `--policy.device=mps`, por lo que es útil para probar el stack en Mac.
- Estudio de robustez a iluminación: al haberse entrenado con augmentación exclusivamente fotométrica, sirve para medir el efecto de cambios de luz y de posición de cámara en el éxito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reporta tasa de éxito y que la pérdida de entrenamiento (L1 = 0,016 en unidades normalizadas) no mide el éxito de la tarea en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 34,2 M de parámetros; en fp32 ocupa aproximadamente 137 MB, en fp16 unos 68 MB. El cuello de botella es el ResNet-18 y las dos cámaras, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 4090 o A100 están sobredimensionadas para esta política.
- Cabe en GPUs de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en Apple Silicon vía MPS, como documenta la model card.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: control a 30 Hz con chunk de 50 pasos y 25 ejecutados; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `faizalkarim/hrl_A2_t2_act_stack` | 34,2 M | chunk 50, ejecuta 25 | Apilado de 3 bloques en SO-101 | no disponible | Hugging Face |
| ACT original (Zhao et al., 2023) | ~80 M (ResNet-18 + transformer) | chunk configurable (típ. 100) | Manipulación bimanual ALOHA | MIT (código) | Repo oficial |
| Diffusion Policy (Chi et al., 2023) | ~ tens of M según config | horizonte configurable | Manipulación diversa | MIT (código) | Repo oficial |
| Otras políticas LeRobot en HF | variable | variable | varía | varía | Hugging Face |

La comparación con ACT original y Diffusion Policy es a nivel de método, no de resultados: no hay benchmarks comunes publicados para este checkpoint concreto.

## Limitaciones y advertencias

- Sesgo de distribución: las demostraciones parten de una disposición de bloques casi idéntica (variación inferior a un ancho de bloque), por lo que la política probablemente falla si los bloques se colocan en otras posiciones.
- Dependencia de la cámara frontal: requiere que la cámara `front` esté en la misma posición que durante la recogida de datos; la augmentación de iluminación no aporta robustez frente a movimientos de cámara.
- Sin tasa de éxito reportada: la pérdida L1 de entrenamiento no es una métrica de éxito en el robot; no hay evidencia publicada de fiabilidad en despliegue.
- Licencia no disponible: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Modelo de una sola tarea y sin generalización: no es un modelo de lenguaje ni un agente; no soporta tool calling, razonamiento multi-paso ni instrucciones en lenguaje natural.
- Riesgo de sobreajuste al entorno: al no usar augmentación geométrica, cambios en la mesa, la iluminación base o la cámara pueden degradar el comportamiento.
- Naturaleza académica: es un artefacto de una asignatura, sin mantenimiento ni garantías de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faizalkarim/hrl_A2_t2_act_stack
- Paper de ACT: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
