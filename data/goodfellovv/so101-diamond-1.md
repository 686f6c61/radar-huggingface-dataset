# goodfellovv/so101-diamond-1

## Resumen

SO-101 diamond ACT es una política de robótica experimental publicada en Hugging Face por el usuario goodfellovv. Se trata de un checkpoint de Action Chunking Transformer (ACT), la arquitectura de imitación supervisada implementada en la librería LeRobot, entrenado para una tarea concreta de manipulación: colocar cuatro cubos de 40 mm formando un cuadrado azul con un rombo amarillo en su interior. El modelo no es un LLM ni un modelo generativo de texto, sino un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 240x320) a acciones de 6 dimensiones a 15 Hz.

El artefacto incluye tres revisiones etiquetadas (v001, v002 y v003) con distinto grado de éxito en simulador. La revisión original (v001) completó 0 de 8 arranques retenidos en la evaluación declarada; la revisión v003, obtenida mediante fine-tuning de recuperación dirigido, alcanzó 2 de 6 layouts de validación en GPU/EGL. El propio autor advierte explícitamente de que el modelo no demuestra que el robot resuelva la tarea de forma fiable y de que la transferencia a hardware real no está verificada.

Su relevancia es acotada y de carácter metodológico: sirve como ejemplo reproducible de un pipeline completo de entrenamiento y evaluación con LeRobot 0.6.1 y MuJoCo 3.17.0, con informes numéricos saneados y separación estricta entre pérdida de validación y éxito de tarea. No debe confundirse con un modelo de propósito general ni emplearse en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; entradas: estado de 6 dims y dos imágenes RGB de 3x240x320) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo emplea ACT (Action Chunking Transformer), una política de imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas, con un transformer como columna vertebral y un decodificador de acciones. Las entradas son `observation.state` (6 dimensiones), una cámara frontal RGB (3x240x320) y una cámara de muñeca RGB (3x240x320); la salida es `action` (6 dimensiones). Las observaciones y acciones se registran a 15 Hz. No se proporcionan coordenadas de los cubos ni un código de objetivo de color: el modelo debe inferir la tarea únicamente de las imágenes.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `goodfellovv/so101-diamond-110` (revisión fijada `fdb96a47c2ba696cad73b01eae055e68bad6a4a9`), con un split por episodios completos de 86 para entrenamiento y 24 para validación, cubriendo 12 estratos. La revisión original acumula 90.000 actualizaciones del optimizador. La normalización de estados y acciones usa solo episodios de entrenamiento. La revisión v002 aplica fine-tuning correctivo local durante 2.000 actualizaciones desde v001; la v003 aplica fine-tuning de recuperación dirigido durante 4.000 actualizaciones desde un checkpoint de recuperación anterior. Se publican los procesadores pre y post (ambos necesarios por sus estadísticas de normalización guardadas) y un `train_config.json` portable con hiperparámetros, rutas relativas y reanudación desactivada; el estado del optimizador y del RNG se conserva por separado.

## Capacidades

- Control visuomotor para una única tarea de manipulación: formación de un cuadrado azul con un rombo amarillo a partir de cuatro cubos de 40 mm.
- Predicción de acciones en chunks a 15 Hz a partir de estado articular de 6 dimensiones y dos vistas RGB.
- Inferencia con las tuberías de preprocesado y postprocesado guardadas, obligatorias para la normalización correcta.
- Evaluación reproducible en simulador MuJoCo 3.17.0 con criterios estrictos de éxito (caras azules hacia arriba, orientación correcta de la esquina amarilla hacia el centro, geometría de cuadrado válida y 15 fotogramas consecutivos correctos por defecto).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline de imitación con LeRobot: cargar el checkpoint con `ACTPolicy.from_pretrained` y ejecutar la evaluación en MuJoCo 3.17.0 para verificar los resultados declarados (0/8 en v001, 2/6 en v003) antes de reutilizar la receta en otras tareas.
- Estudio de fine-tuning correctivo: comparar v001, v002 y v003 para analizar cómo 2.000 y 4.000 actualizaciones adicionales afectan al éxito en validación (de 0/6 a 2/6 en los mismos layouts GPU/EGL).
- Base para entrenamiento de una política propia en el robot SO-101: reutilizar el `train_config.json` y los procesadores como punto de partida, sustituyendo el dataset por uno propio y manteniendo la disciplina de split por episodios.
- Docencia e investigación en robótica de imitación: ejemplo de separación entre pérdida de validación (18 mediciones retenidas, 85 fotogramas por episodio retenido) y éxito de tarea, útil para ilustrar buenas prácticas de evaluación.
- Análisis de brecha sim-a-real: el checkpoint sirve como caso de estudio de un modelo que funciona parcialmente en simulador y cuya transferencia a hardware el autor declara no verificada.
- Referencia para evaluación estricta: los criterios del evaluador (geometría, orientación, `success_hold` de 15 fotogramas) pueden reutilizarse como especificación de test en proyectos de manipulación con cubos.

## Benchmarks y rendimiento

| Revision | Entrenamiento | Evaluacion en simulador |
|---|---|---|
| v001 | ACT original, 90.000 actualizaciones | 0/8 arranques retenidos no resueltos inicialmente; 0/6 layouts de validación en GPU/EGL |
| v002 | Fine-tuning correctivo local, 2.000 actualizaciones desde v001 | 0/6 en los mismos layouts GPU/EGL; el episodio de depuración 46 tuvo éxito en 2.270 ticks y se reprodujo |
| v003 | Fine-tuning de recuperación dirigido, 4.000 actualizaciones | 2/6 en los mismos layouts GPU/EGL; éxitos en los episodios 12 y 20 reproducidos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; no aplican a este tipo de modelo. La pérdida de validación (18 mediciones retenidas) no equivale a éxito de tarea, tal como advierte el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros y dos entradas RGB de 240x320, la huella es reducida y cabe holgadamente en GPUs de consumo actuales.
- GPU recomendadas: no disponible; el autor menciona ejecuciones de evaluación en GPU/EGL sin especificar modelo.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (51,7 M de parámetros), aunque no se documentan requisitos mínimos.
- Opciones de despliegue: LeRobot 0.6.1 (`ACTPolicy.from_pretrained` con sus procesadores) y MuJoCo 3.17.0 para simulación comparable. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de control registrada es de 15 Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-101 diamond ACT (este) | 51,7 M | ACT (LeRobot) | Cuadrado azul con rombo amarillo sobre SO-101 | no disponible | Hugging Face, 0 descargas, 0 likes |
| Otros checkpoints ACT de LeRobot | no disponible | ACT | Tareas de manipulación diversas | no disponible | no disponible en la información proporcionada |
| Políticas de difusión (Diffusion Policy) | no disponible | Diffusion Policy | Manipulación visuomotora | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparación cuantitativa de rendimiento, contexto y licencia no está disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que el artefacto no demuestra que el robot resuelva la tarea de forma fiable y que el comportamiento fuera de los rollouts medidos en simulador y la transferencia a hardware no están verificados.
- Los resultados de éxito son muy bajos: 0/8 en v001 y 2/6 en v003 sobre layouts de validación; las muestras son pequeñas y los informes incompletos se consideran no concluyentes.
- La pérdida de validación no es un indicador de éxito de tarea; el autor insiste en esta distinción.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas no disponibles y sin capacidades lingüísticas; no es un modelo de texto.
- Especialización extrema: entradas de 6 dimensiones de estado y dos cámaras de 240x320, salida de 6 dimensiones; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste a los 86 episodios de entrenamiento y a los layouts de validación usados también para medir pérdida.
- No se declara seguridad en hardware real; el uso en un robot físico requiere validación independiente y medidas de seguridad.
- La reanudación exacta del entrenamiento requiere los archivos de estado del optimizador y del RNG, que se conservan por separado y no están incluidos en los pesos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodfellovv/so101-diamond-1
- Revisión v001: https://huggingface.co/goodfellovv/so101-diamond-1/tree/v001
- Revisión v002: https://huggingface.co/goodfellovv/so101-diamond-1/tree/v002
- Revisión v003: https://huggingface.co/goodfellovv/so101-diamond-1/tree/v003
- Snapshot original v001: https://huggingface.co/goodfellovv/so101-diamond-1/tree/main/original/so101-act/v001
- Snapshot original v002: https://huggingface.co/goodfellovv/so101-diamond-1/tree/main/original/so101-act/v002
- Snapshot original v003: https://huggingface.co/goodfellovv/so101-diamond-1/tree/main/original/so101-act/v003
- Snapshot original main: https://huggingface.co/goodfellovv/so101-diamond-1/tree/main/original/so101-diamond-act/main
- Dataset de entrenamiento: https://huggingface.co/datasets/goodfellovv/so101-diamond-110
- LeRobot (librería): https://github.com/huggingface/lerobot
- MuJoCo (simulador): https://mujoco.org
