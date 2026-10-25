# IkerAzurmendi/act-pick-v3-super-30000

## Resumen

act-pick-v3-super-30000 es una política de imitación (política de control, no un modelo de lenguaje) entrenada con el algoritmo ACT (Action Chunking Transformer) sobre el brazo robótico de bajo coste SO-101. La publica el usuario IkerAzurmendi en Hugging Face como parte de una familia de checkpoints comparables entre sí, todos derivados de la misma tarea: coger una pieza de una caja y sostenerla frente a la cámara. El modelo consume dos cámaras (frontal y de muñeca) más las seis posiciones articulares del brazo, y devuelve un bloque de 90 objetivos articulares futuros a 30 fps.

El interés de esta ficha no está en el checkpoint en sí —el propio autor advierte que no es el mejor de su ejecución, sino el de 6.000 pasos— sino en el ecosistema que documenta: ocho configuraciones de entrenamiento comparadas con una métrica offline homogénea sobre episodios reservados, todas con recetas idénticas y distinto filtrado de datos. Eso lo convierte en un material útil para estudiar cómo afecta la curación del dataset al error de predicción en imitación robótica.

Técnicamente es un modelo pequeño: 51.658.374 parámetros en safetensors, 0,2 GB de repositorio, licencia Apache-2.0 y librería LeRobot. No hay datos publicados de despliegue en robot real: todas las cifras son offline y el autor lo señala explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot; entrada multimodal (2 cámaras + 6 posiciones articulares), salida de 90 acciones futuras |
| Parametros totales | 51.658.374 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no hay ventana de contexto textual. Observación por paso y horizonte de predicción de 90 acciones (chunk 90), con replanificación cada 30 pasos |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors (no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible; no es un modelo de lenguaje ni acepta instrucciones en lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato de checkpoint de LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de clonación de comportamiento que predice bloques de acciones futuras en lugar de una acción por paso, lo que reduce el error acumulado y suaviza la ejecución. En esta implementación la política recibe la imagen de la cámara frontal, la imagen de la cámara de muñeca y las seis posiciones articulares del SO-101, y emite 90 objetivos articulares a 30 fps; en inferencia se ejecutan 30 acciones por replanificación. El checkpoint corresponde al paso 30.000 de su ejecución.

El entrenamiento se hizo con la función `train()` de LeRobot, batch 8, chunk 90, 30 action steps por replanificación, aumento de imagen por defecto y semilla 1000. El conjunto de datos son 398 episodios que superan el filtro de calidad del «mix super» de la tercera ronda: las 66 sesiones de pick-cube completas, a 30 fps y a 10 fps remuestreadas a 30 fps, con cualquier número de piezas en la caja, duración de 5 a 15 s, hueco inicial máximo de 20 grados, como mucho 3 s de inactividad en cada extremo, al menos una apertura de pinza y tomas defectuosas conocidas eliminadas. No se documenta en la model card el uso de RLHF, DPO ni ninguna etapa de ajuste por refuerzo: es imitación supervisada pura sobre demostraciones.

## Capacidades

- Control visuomotor de un solo brazo SO-101 para la tarea «coger una pieza de la caja y levantarla hacia la cámara».
- Fusión de dos vistas (cámara frontal y cámara de muñeca) con el estado proprioceptivo de las seis articulaciones.
- Predicción de chunks de 90 acciones a 30 fps, con ejecución parcial de 30 pasos antes de replanificar.
- Generalización dentro de la tarea a distinto número de piezas en la caja, gracias a que el entrenamiento incluyó episodios con una y dos piezas (y sesiones sin restricción de número de piezas).
- Robustez parcial a variación temporal: el dataset mezcla grabaciones a 30 fps y a 10 fps remuestreadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni diálogo. No procesa lenguaje natural ni audio.

## Casos de uso

- Baseline de imitación para SO-101: sirve como referencia reproducible (semilla 1000, receta LeRobot estándar) contra la que medir nuevas políticas de pick con el mismo protocolo de error offline sobre los 16 episodios reservados.
- Estudio de curación de datos: al compararse con los checkpoints strict, 1-2-pieces, 1piece, recent y v2, permite cuantificar cuánto aporta cada filtro de calidad, con diferencias de error entre 15,14 y 16,87 sobre la misma métrica.
- Arranque de un pipeline de recogida de datos: el modelo puede inicializar la política mientras se teleopera el brazo, de modo que las sesiones nuevas se graben con una política razonable en el bucle y se cubran trayectorias cercanas a la distribución útil.
- Destilación o ajuste fino sobre hardware propio: con 51,7 M de parámetros y 0,2 GB de pesos, es viable reentrenarlo o afinarlo en una estación con una sola GPU consumer a partir de los datos propios del laboratorio.
- Docencia y prototipado en robótica de bajo coste: el par SO-101 + LeRobot + ACT permite montar una demo de manipulación visuomotora completa con dos cámaras y un brazo impreso en 3D.
- Verificación de una infraestructura de evaluación offline antes de tocar el robot: el protocolo del autor (error absoluto medio de las articulaciones frente a una línea base de «quedarse quieto», 20,71) es directamente reutilizable como test de regresión en CI para nuevos checkpoints.
- Referencia negativa de despliegue: útil para ilustrar buenas prácticas de publicación, ya que el autor marca explícitamente que este checkpoint no es el mejor de su ejecución y que ninguno se ha probado en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible: no aplican a una política robótica. La única métrica publicada es el error absoluto medio de las articulaciones sobre el chunk predicho, evaluado offline en 16 episodios reservados (12 de `so101-pick-cube_20261024_181939`, con una pieza, y 4 de `so101-pick-cube_20261024_144537`, con dos piezas). La línea base de «mantener las posiciones articulares actuales» es 20,71; menor es mejor.

| Checkpoint de esta ejecución | Error | Mejora sobre la línea base |
|---|---|---|
| 6.000 pasos | 15,16 | 27% |
| 12.000 pasos | 16,08 | 22% |
| 18.000 pasos | 16,04 | 23% |
| 24.000 pasos | 16,36 | 21% |
| 30.000 pasos (este) | 16,27 | 21% |

Comparación con el mejor checkpoint de cada ejecución de la misma ronda:

| Ejecución | Episodios | Mejor checkpoint | Error | Mejora sobre línea base |
|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27% |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27% |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26% |
| v2 (anterior) | 278 | 6k | 15,36 | 26% |
| chunk 60 (línea base propia 16,23) | 331 | 4,8k | 11,94 | 26% |
| solo una pieza | 292 | 9,6k | 15,47 | 25% |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% |
| primera ejecución | 165 | 6k | 16,87 | 19% |

Lectura del autor: los mejores checkpoints de las ejecuciones principales están dentro del ruido entre sí, todas las ejecuciones empeoran tras aproximadamente una pasada sobre los datos, y el error offline no permite decir qué modelo agarra mejor. Ninguno se ha probado en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay mediciones publicadas. A partir del recuento real de parámetros (51.658.374), los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16; con dos flujos de cámara, activaciones y el bucle de control, el consumo previsible se mantiene por debajo de 1-2 GB. Cifra estimada, no medida.
- GPU recomendadas: no disponible (no hay datos del autor). Por tamaño, cualquier GPU consumer con al menos 4 GB es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, con el tamaño de pesos indicado; también es planteable ejecutarlo en CPU, aunque la latencia del bucle de control a 30 fps no está documentada.
- Opciones de despliegue: LeRobot (carga de checkpoints y bucle de evaluación/control). No hay soporte publicado de vLLM, TGI, llama.cpp, Ollama ni GGUF, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. Se desconoce el tiempo de inferencia por chunk y el régimen de fps alcanzable fuera del entorno del autor.

## Comparativa con modelos similares

No se dispone de datos de parámetros ni de contexto de los modelos comparables; la comparación se limita a las métricas offline publicadas por el mismo autor con el mismo protocolo y a la licencia.

| Modelo | Parámetros | Contexto | Error offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-pick-v3-super-30000 (este) | 51.658.374 | chunk 90 | 16,27 (mejor de su ejecución: 15,16 en 6k) | Apache-2.0 | Hugging Face, 0 descargas |
| act-pick-v3-6000 | no disponible | chunk 90 | 15,16 | no disponible en la información | Hugging Face |
| act-pick-v3-strict-2400 | no disponible | chunk 90 | 15,14 | no disponible en la información | Hugging Face |
| act-pick-v3-chunk60-4800 | no disponible | chunk 60 | 11,94 (línea base propia 16,23, no comparable de forma directa) | no disponible en la información | Hugging Face |
| act-pick-v3-1-2-pieces-18000 | no disponible | chunk 90 | 15,35 | no disponible en la información | Hugging Face |

Advertencia: el resultado de chunk 60 no es comparable directamente con el resto porque su línea base de «quedarse quieto» es distinta (16,23 frente a 20,71).

## Limitaciones y advertencias

- No es el mejor checkpoint de su ejecución: el autor indica que el mejor es el de 6.000 pasos (15,16 frente a 16,27) y que este se publica por completitud.
- Ningún checkpoint de la familia se ha probado en el robot. El error offline no mide calidad de agarre; puede haber políticas con buen error que fallen al sujetar la pieza.
- Todas las ejecuciones empeoran tras aproximadamente una pasada sobre los datos, lo que apunta a sobreajuste; conviene no entrenar este modelo más pasos sin validación.
- Es una política de tarea única y de un solo embodiment (SO-101). No acepta instrucciones en lenguaje natural, no generaliza a otras tareas ni a otros brazos sin reentrenamiento.
- Dependencia fuerte de la configuración de cámaras y de la iluminación del entorno de recogida; no hay evaluación de robustez ante cambios de montaje, fondo o condiciones lumínicas.
- Idiomas soportados: no disponible, y en la práctica no aplica. No hay capacidades multilingües que evaluar.
- Riesgo de alucinación en el sentido habitual: no aplica; el riesgo análogo es la ejecución de trayectorias plausibles pero incorrectas cuando la observación se sale de la distribución de entrenamiento, sin ninguna señal de confianza publicada.
- Sesgos conocidos: no documentados por el autor. El dataset está restringido a 66 sesiones de pick-cube y a un filtro de calidad concreto, lo que sesga la política hacia esas condiciones.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y sin garantía. El modelo se distribuye tal cual, sin soporte del autor.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad. Fechas de creación y actualización de 2026-10-25, sin revisiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IkerAzurmendi/act-pick-v3-super-30000
- Checkpoint mejor de la misma ejecución: https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Variante con filtro estricto: https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400
- Variante con episodios de 1-2 piezas: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000
- Variante con chunk 60: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Variante con una sola pieza: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-9600
- Variante con sesiones recientes: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000
- Ronda anterior (v2): https://huggingface.co/IkerAzurmendi/act-pick-v2-6000
- Librería de entrenamiento y despliegue LeRobot: https://github.com/huggingface/lerobot
