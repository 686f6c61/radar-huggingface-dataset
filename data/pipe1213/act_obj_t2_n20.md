# Pipe1213/act_obj_t2_n20

## Resumen

Pipe1213/act_obj_t2_n20 es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: "coger la mantequilla y colocarla en la cesta". Forma parte del estudio comparativo vla-vs-scratch, que confronta un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) con una política entrenada desde cero sobre las mismas pocas demostraciones. El modelo se publica para hacer reproducible el estudio, no como política de propósito general.

La arquitectura es un transformer ACT con 51.671.687 parámetros, encoder visual ResNet-18 inicializado con pesos de ImageNet y predicción de chunks de 100 acciones. Se entrenó con 20 episodios del dataset lerobot/libero sobre la tarea LIBERO-Object con id 6, batch size 8, 10.000 pasos y semilla 1000. El checkpoint raíz corresponde al paso 10.000, con una tasa de éxito del 32% sobre los 50 estados iniciales fijos de la tarea.

Su relevancia es metodológica: documenta de forma explícita y con intervalos de confianza la brecha entre políticas desde cero y modelos preentrenados en regímenes de pocos datos, y advierte de la alta varianza entre checkpoints de una misma ejecución. Es un artefacto de investigación acotado, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder visual ResNet-18 (pesos ImageNet) |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de observaciones por paso, chunk de 100 acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (no recibe entrada de lenguaje; tarea fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas. En esta implementación se usa la configuración por defecto de LeRobot: 52M parámetros, chunks de 100 acciones y un ResNet-18 preentrenado en ImageNet como encoder de imagen; el resto de la red se entrena desde cero. La única desviación respecto a los valores por defecto está en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usó 20 episodios concretos del dataset lerobot/libero (revisión a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 1000 y LeRobot 0.6.2 (commit b9cb121cb7d4e3e26ec5c906d08dda68d151ba52). El cómputo total fue de 0,42 h en una RTX 4050 de portátil con 6 GB. No se documenta RLHF, DPO ni ajuste fino posterior; es imitación supervisada pura sobre demostraciones. Las estadísticas de normalización de estados y acciones provienen de todo el dataset lerobot/libero, no solo de los episodios seleccionados.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: coger la mantequilla y depositarla en la cesta (LIBERO-Object, task id 6).
- Predicción de chunks de 100 acciones con replanificación cada 10 acciones en evaluación.
- Procesamiento de observaciones visuales a 256x256 píxeles junto con estado propioceptivo del robot.
- Control continuo de acciones en el simulador MuJoCo a través del entorno LIBERO.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta entrada de lenguaje ni instrucciones en lenguaje natural.
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento.

## Casos de uso

- Reproducción de experimentos de investigación: permite replicar exactamente la comparación ACT vs SmolVLA del estudio vla-vs-scratch con el comando de entrenamiento y evaluación documentado.
- Línea base de imitación desde cero: sirve como referencia cuantitativa (33,1% agregado en el estudio con 20 demostraciones) para medir la ganancia de usar modelos preentrenados.
- Estudio de varianza entre checkpoints: al publicar los pasos 6.000, 8.000 y 10.000 con tasas de éxito del 30%, 48% y 32%, permite analizar la sensibilidad de ACT al checkpoint elegido.
- Docencia y formación en robótica: ejemplo mínimo y de bajo coste (0,42 h en una GPU de 6 GB) para ilustrar un pipeline completo de LeRobot con ACT sobre LIBERO.
- Evaluación de protocolos de benchmark: útil para probar harness de evaluación con estados iniciales fijos, semillas y renderizado MuJoCo en CPU.
- Análisis de curvas de aprendizaje con pocos datos: permite estudiar cómo varía el rendimiento entre 10, 20 y otras cantidades de demostraciones, ya que los conjuntos pequeños están anidados en los mayores.
- Pruebas de infraestructura de entrenamiento distribuido o de registro en W&B: el modelo documenta la configuración exacta de logging y guardado de checkpoints.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO (init states 0 a 49), imágenes de 256x256, replanificación cada 10 acciones, semilla 1000 y renderizado MuJoCo en CPU.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 15 de 50 | 30% |
| 8.000 | 24 de 50 | 48% |
| 10.000 (raíz del repo) | 16 de 50 | 32% |
| Media de los 3 checkpoints | 55 de 150 | 36,7% (IC 95% Wilson: 29-45%) |

Contexto agregado del estudio (3 tareas, todas las semillas de entrenamiento, 20 demostraciones por tarea): ACT desde cero 33,1%; SmolVLA ajustado 74,2%.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 51,7M parámetros (unos 0,2 GB en fp32 y aproximadamente 0,1 GB en fp16), más el encoder ResNet-18 y el buffer de observaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento documentado se completó en 0,42 h en una RTX 4050 de 6 GB.
- Cabe en GPU consumer: sí, en cualquier GPU con 6 GB o más (RTX 3050, 4050, 4060, 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-eval`) con el entorno LIBERO; requiere MuJoCo para la simulación. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma explícita; la evaluación se ejecuta con batch size 1 y renderizado MuJoCo en CPU, lo que domina el coste frente a la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (estudio, 20 demos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7M | Imagen 256x256 + estado; sin lenguaje | 33,1% agregado en 3 tareas | apache-2.0 | Hugging Face, lerobot |
| SmolVLA (ajustado) | no disponible en la información | Visión-lenguaje-acción | 74,2% agregado en 3 tareas | no disponible en la información | Referenciado en el estudio |
| Otras políticas ACT del estudio | 51,7M (misma config) | Igual que este modelo | Varía por tarea y semilla | apache-2.0 | 60 políticas publicadas en el estudio |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren también en tamaño, arquitectura y presencia de entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- No es una política de propósito general: no acepta instrucciones en lenguaje natural ni generaliza a otras tareas.
- Alta varianza entre checkpoints de una misma ejecución: en 30 de 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta; hay que evaluar el checkpoint antes de usarlo.
- La comparación con SmolVLA confunde preentrenamiento con diferencias de tamaño, arquitectura y entrada de lenguaje.
- Las 3 tareas se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, lo que sesga los resultados hacia esas tareas.
- Normalización de estados y acciones calculada sobre todo lerobot/libero, no solo sobre las 20 demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- El intervalo de Wilson solo cubre el muestreo de evaluación; la variación entre semillas de entrenamiento es mayor.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas fuera de la distribución de demostraciones.
- Sesgos conocidos: no documentados por el autor.
- Licencia apache-2.0 permite uso comercial del artefacto, pero su aplicabilidad práctica fuera de investigación es muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t2_n20
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible enlace explícito en la información proporcionada
