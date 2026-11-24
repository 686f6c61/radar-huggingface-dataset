# armnet/busybox_push_green_button_diffusion_h16_ddim

## Resumen

`busybox_push_green_button_diffusion_h16_ddim` es una política de robótica (no un modelo de lenguaje) entrenada con el framework LeRobot 0.5.1 mediante Diffusion Policy, un método de imitación que aprende a generar secuencias de acciones desruidando ruido gaussiano de forma iterativa. El modelo lo publica el usuario `armnet` y está especializado en una única tarea sobre el brazo robótico SO-101: pulsar un botón verde en un entorno tipo BusyBox. Su relevancia es acotada: sirve como referencia reproducible de un pipeline completo de entrenamiento e inferencia de Diffusion Policy con DDIM en hardware de consumo.

Técnicamente es una red de difusión condicionada por observaciones visuales de tres cámaras (frontal, superior y de muñeca) y por el estado del robot, que produce chunks de 8 acciones de 6 grados de libertad a 20 Hz. Con 102,3 millones de parámetros y un horizonte de predicción de 16 pasos, está diseñada para control en bucle cerrado con baja latencia (chunks de 0,4 s). El uso de DDIM con solo 10 pasos de inferencia, frente a los 100 de entrenamiento, reduce el coste computacional por paso de control.

No es un modelo de propósito general ni un modelo de lenguaje: no procesa texto, no tiene capacidades de razonamiento simbólico y su vocabulario de comportamiento se limita a la tarea para la que fue entrenado con 39 episodios. Cualquier evaluación fuera de ese contexto carece de sentido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (U-Net temporal + codificador visual ResNet18 por cámara) |
| Parámetros totales | 102.285.610 (102,3 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción: 16 pasos; observaciones: 2) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es una Diffusion Policy clásica: un U-Net temporal con dimensiones de bajada `[256, 512, 1024]`, kernel de 5, 8 grupos de normalización y embedding de paso de difusión de 128 dimensiones. Cada una de las tres cámaras (`front`, `top`, `wrist`) se procesa con un codificador ResNet18 independiente inicializado con pesos ImageNet1K_V1, sin GroupNorm, con softmax espacial de 32 puntos clave, redimensionado a 180×320 y recorte del 90 %. Las observaciones se fusionan con el estado del robot y condicionan el proceso de desruido.

El entrenamiento usa el dataset `armnet/busybox_push_green_button`, compuesto por 39 episodios y 4.836 fotogramas a 20 fps con 6 grados de libertad del SO-101. Se configuró con `horizon=16`, `n_obs_steps=2`, `n_action_steps=8` y `drop_n_last_frames=7`, planificador DDIM con 100 pasos de entrenamiento y 10 de inferencia, `beta_schedule=squaredcos_cap_v2`, predicción de tipo epsilon y recorte de muestras. La optimización usó batch de 32, 6.000 pasos, AMP y LR coseno con pico de 1e-4 y 500 pasos de calentamiento, completándose en unos 21 minutos en una RTX 5090. La pérdida de entrenamiento bajó de 0,030 (paso 2.000) a 0,014 (paso 6.000).

## Capacidades

- Generación de trayectorias de acción de 6 DoF para el brazo SO-101 condicionadas por imágenes de tres cámaras y estado propioceptivo.
- Control en bucle cerrado con chunks de 8 acciones ejecutables a 20 Hz (0,4 s por chunk).
- Inferencia rápida mediante DDIM con 10 pasos, lo que reduce el coste por decisión frente a muestreo completo.
- Espacio de ruido inicial de baja dimensión (16 × 6 = 96-D) pensado para steering con DSRL, frente a los 384-D de configuraciones con horizonte 64.
- Selección de checkpoints intermedios (2.000, 4.000, 6.000 pasos) para ajustar el margen de la política base.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de un pipeline de Diffusion Policy: sirve como ejemplo completo y verificable de entrenamiento, checkpoints y evaluación con LeRobot 0.5.1 para equipos que quieran montar su propio flujo de imitación.
- Investigación en steering de ruido con DSRL: el espacio de ruido de 96 dimensiones permite experimentar con modificación del ruido inicial en tiempo de inferencia sin explotar la dimensionalidad.
- Benchmark de latencia en robótica de bajo coste: con 102 M de parámetros y DDIM a 10 pasos, es útil para medir tiempos de inferencia en GPUs de consumo y comparar con alternativas de muestreo.
- Pruebas de control en bucle cerrado a 20 Hz: los chunks de 0,4 s permiten validar arquitecturas de ejecución asíncrona entre política y controlador del brazo.
- Estudio de ablación de checkpoints: los tres puntos de control publicados permiten analizar la relación entre pérdida de entrenamiento y comportamiento en el mundo real.
- Docencia y divulgación: caso concreto y de dominio acotado para explicar difusión aplicada a robótica, con dataset, configuración y resultados de entrenamiento documentados.
- Base para fine-tuning en tareas análogas de pulsación de botones: al ser Apache 2.0 y tener un horizonte corto, puede servir de inicialización para variantes con más datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento (pérdida y norma de gradiente por checkpoint), no tasas de éxito ni evaluaciones en entorno real.

| Checkpoint | Pasos | Épocas | Pérdida de entrenamiento | Norma de gradiente |
|---|---:|---:|---:|---:|
| `checkpoints/002000` | 2.000 | 13,2 | 0,030 | 0,671 |
| `checkpoints/004000` | 4.000 | 26,5 | 0,021 | 0,471 |
| `checkpoints/006000` (raíz) | 6.000 | 39,7 | 0,014 | 0,336 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 102,3 M de parámetros en FP32 los pesos ocupan aproximadamente 0,4 GB, más el coste de activaciones de tres ResNet18 y el U-Net temporal.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería bastar para inferencia; el entrenamiento se realizó en una RTX 5090 en unos 21 minutos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: LeRobot 0.5.1 con `DiffusionPolicy.from_pretrained`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no se publican cifras medidas; el diseño apunta a chunks de 0,4 s a 20 Hz con DDIM de 10 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `armnet/busybox_push_green_button_diffusion_h16_ddim` | 102,3 M | horizonte 16, 8 acciones | Pulsar botón verde con SO-101 | Apache 2.0 | Hugging Face |
| Otras Diffusion Policy de LeRobot | no disponible | no disponible | Tareas diversas | habitualmente Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación diversa | habitualmente Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: entrenado exclusivamente para pulsar un botón verde en un BusyBox con SO-101; no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Dataset muy pequeño: 39 episodios y 4.836 fotogramas, lo que aumenta el riesgo de sobreajuste al entorno y a las condiciones de iluminación y posicionamiento del entrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni métricas en entorno real, por lo que se desconoce su robustez fuera de las condiciones de recogida.
- Sin datos de sesgo: no se documentan sesgos, pero al ser un modelo visual hereda los sesgos de los datos de entrenamiento y de los pesos ImageNet del backbone.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras ante observaciones fuera de distribución.
- Idiomas no aplica: no procesa ni genera texto.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el despliegue físico del robot recae en el integrador.
- El modelo depende de la versión `lerobot==0.5.1`; cambios de API pueden romper la carga del checkpoint.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita el despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armnet/busybox_push_green_button_diffusion_h16_ddim
- Dataset: https://huggingface.co/datasets/armnet/busybox_push_green_button
- LeRobot (framework): no disponible en la información proporcionada
- Paper de Diffusion Policy: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
