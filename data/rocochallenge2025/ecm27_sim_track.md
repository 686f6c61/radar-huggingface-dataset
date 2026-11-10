# rocochallenge2025/ecm27_sim_track

## Resumen

ECM27 Sim Track es un conjunto de tres checkpoints de política robótica entrenados con el algoritmo ACT (Action Chunking Transformer) sobre el framework LeRobot. Lo publica el equipo `rocochallenge2025` en el contexto de la competición ECM2027, y está orientado a control por imitación de un robot manipulador Galbot G1 en simulación. No es un modelo de lenguaje: es una política visuomotora que mapea tres vistas RGB de 224x224 y un vector de estado de 77 dimensiones a una acción de 20 dimensiones a 30 FPS.

El modelo resuelve el problema clásico de imitación robótica: aprender una política de control a partir de demostraciones teleoperadas. Se entrena sobre 173 episodios correctos del dataset `rocochallenge2025/ecm2027_sim_data` (155 de entrenamiento, 18 de validación, 894.635 frames en total). La relevancia actual viene de su uso como baseline reproducible para el track de simulación del reto, con checkpoints intermedios y estado de entrenamiento incluidos.

Los tres checkpoints publicados (pasos 40.000, 45.000 y 50.000) presentan pérdidas de validación muy próximas entre sí (0,3723, 0,3738 y 0,3761), lo que sugiere convergencia estable. El autor advierte explícitamente de que la pérdida de validación es el objetivo sobre el dataset reservado y no una tasa de éxito en tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT), política visuomotora transformer con decoder de chunks de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; chunk de 100 acciones, un paso de acción por inferencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no aplica (modelo robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (estructura `pretrained_model/` y `training_state/` por checkpoint) |

## Arquitectura y entrenamiento

La política es un ACT de LeRobot con chunk size 100 y un único paso de acción por inferencia. Consume tres cámaras RGB a 224x224 y un vector de estado de 77 dimensiones, y emite acciones de 20 dimensiones. El entrenamiento se realizó durante 50.000 pasos con batch size 16, learning rate 1e-5 y semilla 1000, sobre LeRobot 0.6.1, PyTorch 2.11 y CUDA 12.8. La conversión del dataset excluyó el export agregado anterior de LeRobot y se basó en las demostraciones H5 corregidas, con tolerancia de timestamp de vídeo de 0,001 s y frecuencia de 30 FPS.

El dataset de entrenamiento consta de 173 episodios exitosos no vacíos (155 train / 18 validación) y 894.635 frames. La pérdida final de entrenamiento fue 0,222; la mejor pérdida de validación registrada fue 0,3697 en el paso 49.000, que no está incluido porque los guardados se hacen cada 5.000 pasos. Los tres checkpoints publicados incluyen `pretrained_model/` para inferencia y `training_state/` para reanudar el entrenamiento.

## Capacidades

- Control visuomotor por imitación para el robot Galbot G1 en simulación.
- Fusión de tres vistas RGB (224x224) con estado proprioceptivo de 77 dimensiones.
- Predicción de chunks de 100 acciones con ejecución de un paso por inferencia (action chunking).
- Operación a 30 FPS, alineada con la frecuencia del dataset de entrenamiento.
- Reanudación de entrenamiento gracias al estado incluido en cada checkpoint.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas.
- No dispone de modo thinking, visión general, audio ni funciones multimodales fuera del pipeline robótico.

## Casos de uso

- Baseline para el track de simulación del reto ECM2027: sirve como referencia reproducible para comparar nuevas políticas sobre el mismo dataset y protocolo de validación.
- Fine-tuning sobre demostraciones propias: los checkpoints con `training_state/` permiten reanudar o adaptar el entrenamiento a nuevos episodios del Galbot G1 sin partir de cero.
- Evaluación de pipelines de imitación: útil para medir el efecto de cambios en preprocesado, aumentos de datos o hiperparámetros sobre la pérdida de validación.
- Estudio de action chunking: el chunk de 100 acciones y un paso de ejecución permite analizar el compromiso entre suavidad de trayectoria y reactividad.
- Reproducción de experimentos: la configuración completa (semilla, batch, lr, stack) permite replicar resultados y auditar la conversión del dataset.
- Docencia e investigación en robótica: ejemplo práctico de entrenamiento ACT con LeRobot sobre un robot humanoide manipulador en simulación.
- Integración en simuladores de evaluación: los pesos en safetensors y la estructura `pretrained_model/` facilitan cargar la política en entornos de simulación compatibles con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación:

| Checkpoint | Pérdida de validación |
| --- | ---: |
| checkpoint-40000 | 0,3723 |
| checkpoint-45000 | 0,3738 |
| checkpoint-50000 | 0,3761 |

Pérdida final de entrenamiento: 0,222. Mejor pérdida de validación registrada: 0,3697 en el paso 49.000 (no incluido en los checkpoints). El autor indica que la pérdida de validación no equivale a tasa de éxito en tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 1,9 GB, lo que da una cota superior aproximada del peso de los tres checkpoints juntos.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento usó CUDA 12.8, pero no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repo (1,9 GB para tres checkpoints) es plausible que un solo checkpoint quepa en GPU de consumo, pero no hay dato oficial.
- Opciones de despliegue: LeRobot 0.6.1 con PyTorch 2.11; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles; la política opera a 30 FPS según el dataset, pero no se reportan medidas de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECM27 Sim Track (este) | ACT / imitación | no disponible | no aplica | no disponible | Hugging Face, 3 checkpoints |
| Otros checkpoints ACT de LeRobot | ACT / imitación | no disponible | no aplica | según repo | no disponible |
| Políticas tipo Diffusion Policy | difusión / imitación | no disponible | no aplica | según repo | no disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La pérdida de validación no es una tasa de éxito; no hay evidencia publicada de desempeño en tarea.
- Entrenado sobre 173 episodios de un único robot (Galbot G1) en simulación; la transferencia a hardware real no está validada.
- Depende de tres cámaras RGB y un vector de estado de 77 dimensiones; cambios en la configuración sensorial invalidan la política.
- Sin licencia declarada: no se puede asumir uso comercial permitido.
- Riesgo de sobreajuste al dataset y a la distribución de demostraciones; no se reportan evaluaciones fuera de distribución.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento simbólico.
- El checkpoint con menor pérdida de validación (paso 49.000) no está publicado; los disponibles son aproximaciones.
- El repo tiene 0 descargas y 0 likes; no hay validación comunitaria ni informes de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/rocochallenge2025/ecm27_sim_track
- Dataset: https://huggingface.co/datasets/rocochallenge2025/ecm2027_sim_data
- LeRobot (framework): no disponible en la información proporcionada
- Paper de ACT: no disponible en la información proporcionada
