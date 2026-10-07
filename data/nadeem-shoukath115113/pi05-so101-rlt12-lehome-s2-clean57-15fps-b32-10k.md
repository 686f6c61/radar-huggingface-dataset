# Nadeem-Shoukath115113/pi05-so101-rlt12-lehome-s2-clean57-15fps-b32-10k

## Resumen

Este repositorio contiene un punto de control (checkpoint) de robótica del tipo Vision-Language-Action (VLA) construido sobre π₀.₅ y un tokenizador RL-token (RLT) entrenados de forma conjunta. Lo publica el usuario Nadeem-Shoukath115113 bajo la librería openpi, y corresponde a la etapa 2 de 3 de la cadena denominada `rlt12`. La tarea objetivo es el plegado de una camiseta de manga larga sobre una mesa, ejecutada por un brazo robótico SO-101.

A diferencia de los checkpoints previos `rlt-chunk20`, esta versión adopta ruido de flujo correlacionado y la normalización asociada, tomadas del repositorio `lehome_solution`. El modelo trabaja con 12 valores de acción sin relleno (`action_dim=12`) y un chunk de 20 pasos, en lugar de las 32 dimensiones anteriores, lo que rompe la compatibilidad con aquellos checkpoints.

Es relevante ahora porque documenta una receta de entrenamiento poco habitual (tokenizador RLT acoplado a π₀.₅, prior de ruido correlacionado y estadísticas de normalización por paso) para manipulación de objetos deformables. Sin embargo, sus pesos no se han evaluado todavía en el robot real, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, con tokenizador RL-token (RLT) entrenado de forma conjunta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de acción por chunks de 20 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompt de entrenamiento en inglés: "Fold the long sleeved T-shirt on the table") |
| Licencia | apache-2.0 |
| Formato de pesos | Orbax (JAX / OpenPI); no safetensors ni GGUF |
| Dimension de accion (`action_dim`) | 12 (sin relleno) |
| Chunk de accion (`action_horizon`) | 20 pasos |
| Robot objetivo | SO-101 |
| Camaras de entrada | left_top, left_left_wrist, right_right_wrist |
| Frecuencia de los datos | 15 fps |
| Tamano del repositorio | 15,2 GB |
| Libreria | openpi |

## Arquitectura y entrenamiento

El modelo combina una política VLA π₀.₅ con un tokenizador RL-token (RLT) de 2 capas, 8 cabezas y anchura 2048, que procesa únicamente tokens de imagen (768). La pérdida conjunta es `RLT + 1.0 × flow`. La etapa 2 parte como inicialización de la etapa 1 (`rlt12-s1-challenge125-20fps-b32-10k/9999`), que a su vez deriva de la base π₀.₅. Esta etapa 2 no incluye datos DAgger.

Los datos de entrenamiento son `local/tshirt_clean57_v21`: 57 episodios de teleoperación y 18.246 fotogramas a 15 fps. El entrenamiento se realizó durante 10.000 pasos con batch 32 (320.000 muestras, unas 17,5 pasadas sobre los datos). El learning rate de π₀.₅ siguió un coseno con warmup de 500 pasos, de 1e-5 a 1e-6, con AdamW, weight decay 0.001, grad clip 1.0 y sin EMA. El learning rate del tokenizador RLT fue de warmup 500 pasos, de 1e-5 a 2.5e-6, con weight decay 0.001. Las pérdidas evolucionaron de 2,79 a 0,026 (π₀.₅) y de 0,76 a 0,53 (RLT) entre los pasos 0 y 9900.

La innovación técnica principal es el uso de ruido de flujo correlacionado y su normalización, copiados de `lehome_solution` (`ca73828`). Se emplean 12 valores de acción sin padding, todos ellos deltas respecto al estado al inicio del chunk (incluidos los grippers). El estado se normaliza por mínimos y máximos a [−1, 1]; las acciones se estandarizan (z-score) por paso de chunk, con media suavizada lineal y dispersión `a + s·√(t + e)`. El prior correlacionado es N(0, 0.5·Σ + 0.5·I) y se utilizan 5 extracciones de ruido por ejemplo de entrenamiento. Los pasos de chunk posteriores al final del episodio quedan excluidos de la pérdida. La matriz de ruido es de 240 × 240 (20 pasos × 12). El aumento de datos aplica brillo, contraste y saturación a 0,6, tono a 0,05 y ±22° únicamente en la cámara cenital.

## Capacidades

- Generación de acciones de manipulación robótica para el plegado de una camiseta de manga larga sobre una mesa, condicionada por tres vistas de cámara y un prompt de texto fijo.
- Política de acción por chunks de 20 pasos con 12 valores de acción en formato delta respecto al estado inicial del chunk, incluidos los grippers.
- Percepción multimodal: integra tres flujos de imagen (cámara cenital y dos muñecas) con el prompt textual.
- Tokenizador RLT (RL-token) entrenado conjuntamente con π₀.₅, con pérdida combinada RLT + flujo.
- Muestreo con prior de ruido correlacionado y estadísticas de normalización por paso (compatible con SPIRAL mediante la Cholesky ya reducida con β=0.5).
- No es un modelo de lenguaje general: no ofrece generación de texto, razonamiento, código, matemáticas ni capacidades multilingües.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso más allá de la secuencia de control robótico.

## Casos de uso

- Plegado automatizado de camisetas de manga larga: desplegar la política sobre un brazo SO-101 con las tres cámaras configuradas y el prompt exacto de entrenamiento para ejecutar la tarea de manipulación deformable.
- Inicialización para ajuste fino en tareas de plegado similares: usar los pesos como punto de partida de una política nueva sobre otra prenda o superficie, aprovechando que el autor lo contempla explícitamente como inicialización (aunque no admite reanudación del entrenamiento).
- Investigación sobre RL-token (RLT): estudiar cómo un tokenizador RLT de 2 capas y anchura 2048 acoplado a π₀.₅ afecta al aprendizaje de políticas frente a enfoques sin tokenizador.
- Estudio de priors de ruido correlacionado: reproducir la receta `lehome-noise-norm` para comparar el impacto de N(0, 0.5·Σ + 0.5·I) y de las 5 extracciones de ruido por ejemplo en la calidad del plegado.
- Integración en el pipeline DAgger de la etapa 3: servir como punto de partida del entrenamiento de la siguiente etapa (57 episodios de teleoperación + 30 de DAgger, mezcla 60:40), que aún no se ha entrenado.
- Evaluación SPIRAL: emplear `action_cholesky.npy` (Cholesky ya reducida con β=0.5) para métodos de muestreo guiado en inferencia.
- Reproducción de la cadena `rlt12`: replicar el entrenamiento conjunto π₀.₅ + RLT como referencia metodológica para manipulación de objetos deformables con robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay evaluaciones en el robot (el propio autor indica "Not yet evaluated on the robot") ni métricas de éxito de tarea. Los únicos datos numéricos disponibles son las pérdidas de entrenamiento:

| Métrica | Paso 0 | Paso 9900 |
|---|---|---|
| Pérdida π₀.₅ | 2,79 | 0,026 |
| Pérdida RLT | 0,76 | 0,53 |

| Configuracion de entrenamiento | Valor |
|---|---|
| Pasos × batch | 10.000 × 32 = 320.000 muestras |
| Pasadas sobre los datos | 17,5 |
| Episodios de teleoperación | 57 |
| Fotogramas | 18.246 a 15 fps |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. El repositorio ocupa 15,2 GB, lo que da una referencia del orden de magnitud de los pesos, pero no se publica el recuento de parámetros ni los requisitos oficiales.
- Compatibilidad con GPU de consumo: no confirmada; sin cifras de VRAM no puede afirmarse que quepa en una GPU de consumo concreta (por ejemplo RTX 4090).
- Formato de pesos: Orbax, bajo la clave `9999/vla_params` (raíz "params") y `9999/rlt_params`. No hay pesos safetensors ni GGUF, por lo que no son aplicables llama.cpp ni Ollama.
- Opciones de despliegue: servido mediante la librería openpi con el código de la rama `lehome-noise-norm` y la configuración `rlt12_s2_clean57`. No se documentan vLLM ni TGI.
- Latencia y throughput: no disponibles.
- Restricción de despliegue: es imprescindible el código con los cambios `lehome-noise-norm` y la configuración `rlt12_s2_clean57`; los pesos están bajo `vla_params/`, no bajo `params/`.
- Estadísticas de normalización: válidas únicamente para `action_horizon=20` y `action_dim=12`.

## Comparativa con modelos similares

No se dispone de datos de especificaciones de modelos VLA externos comparables en la información proporcionada. La comparación posible es interna a la cadena `rlt12` documentada por el autor:

| Etapa | Datos | Frecuencia | Estado | Repositorio |
|---|---|---|---|---|
| 1 | Conjunto desafío, 125 ep, desde base π₀.₅ | 20 fps | no publicado | — |
| 2 (este modelo) | Teleoperación, 57 ep | 15 fps | publicado | `pi05-so101-rlt12-lehome-s2-clean57-15fps-b32-10k` |
| 3 | Teleoperación 57 + DAgger 30 (60:40 DAgger:teleop) | no disponible | no entrenado | — |

Comparativas con otras familias de VLA (parámetros, contexto, rendimiento, licencia): no disponible.

## Limitaciones y advertencias

- No evaluado en el robot: el propio autor advierte de que el modelo aún no se ha probado sobre hardware real, por lo que no existe evidencia de éxito de tarea.
- Sin `train_state`: el checkpoint sirve para inferencia o como inicialización, pero no puede reanudarse el entrenamiento.
- Incompatible con los checkpoints de 32 dimensiones y con cualquier código que no incluya los cambios `lehome-noise-norm`.
- Las estadísticas de normalización solo son válidas para `action_horizon=20` y `action_dim=12`; usarlas con otros valores produce resultados inválidos.
- Esta etapa 2 no contiene datos DAgger, lo que puede limitar la robustez ante desviaciones del estado de entrenamiento.
- Dataset reducido (57 episodios, 18.246 fotogramas): riesgo de sobreajuste a las condiciones concretas de recogida de datos y de pobre generalización a otras prendas, iluminaciones o posiciones.
- Tarea única y prompt fijo en inglés ("Fold the long sleeved T-shirt on the table"); no se documentan capacidades multilingües ni multitarea.
- Los pesos están bajo `vla_params/`, no `params/`; el servicio requiere la rama y la configuración de código específicas.
- Licencia apache-2.0: permite uso comercial, pero al tratarse de un artefacto de investigación no evaluado, el riesgo de fallo en producción es alto.
- Sesgos conocidos y tasas de alucinación: no disponibles (no es un modelo generativo de texto en el sentido convencional; el riesgo relevante son fallos de control físico).
- El repositorio no registra descargas ni "likes", y no se ha publicado información sobre sesgos, datos demográficos ni procedencia detallada del dataset.

## Enlaces

- HuggingFace: https://huggingface.co/Nadeem-Shoukath115113/pi05-so101-rlt12-lehome-s2-clean57-15fps-b32-10k
- Repositorio `lehome_solution` (fuente del ruido correlacionado y la normalización, commit `ca73828`): https://github.com/IliaLarchenko/lehome_solution
- W&B: proyecto `rlt12-lehome-chain`, run `s3dd9oug`
- Librería openpi (indicada como `library_name` en el repositorio)
- Otros enlaces (papers, blogs, demos): no disponibles en la información proporcionada
