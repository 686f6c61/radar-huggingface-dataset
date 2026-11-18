# hrl-imerse/doug-act-stack-phases-15k

## Resumen

doug-act-stack-phases-15k es un modelo de política robótica basado en ACT (Action Chunking Transformer) desarrollado por el usuario hrl-imerse, entrenado para la tarea de apilado de bloques (block stacking) con un brazo robótico SO-101 equipado con cámara de muñeca. El modelo resuelve una tarea de manipulación concreta mediante descomposición en fases: cada subtarea (pick/place combinada con el color del bloque: naranja, verde o púrpura) se codifica como un vector one-hot que se inyecta como entrada adicional `observation.environment_state`, condicionando la política sobre el estado actual del proceso.

La arquitectura es ACT con `chunk_size` de 100, un transformer que predice secuencias de acciones en lugar de pasos individuales. Con 51,67 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware de control robótico. Se entrenó durante 15.000 pasos sobre 84 episodios limpios (75 de entrenamiento, 9 de validación) del dataset `hrl-imerse/doug-stack-phases`, con aumentación de datos mediante color jitter y RandomAffine.

Su relevancia radica en la incorporación explícita de información de fase como señal de condicionamiento, lo que permite dirigir la política según el subobjetivo activo en lugar de depender únicamente de la observación visual. El autor documenta un test real en brazo (2026-11-17) donde el condicionamiento por fase desvía claramente el comportamiento: con la misma imagen, la entrada "pick" orienta el brazo hacia los bloques y "place" hacia la torre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), chunk_size 100 |
| Parametros totales | 51.672.710 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entrada adicional | `observation.environment_state` (one-hot de fase: pick/place × naranja/verde/púrpura) |
| Dataset de entrenamiento | hrl-imerse/doug-stack-phases (84 episodios: 75 train / 9 val) |
| Pasos de entrenamiento | 15.000 |
| Perdida de validacion | 0,570 (5k), 0,551 (10k), 0,560 (15k) |
| Aumentacion | color jitter + RandomAffine |
| Hardware objetivo | brazo SO-101 con camara de muneca |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo emplea ACT (Action Chunking Transformer), una arquitectura de imitación que predice chunks de acciones de longitud 100 en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Sobre la arquitectura base de ACT, este modelo añade una modificación clave: una entrada adicional `observation.environment_state` que codifica la fase actual de la tarea como un vector one-hot (combinación de pick/place con el color del bloque objetivo: naranja, verde o púrpura).

El entrenamiento se realizó durante 15.000 pasos sobre 84 episodios limpios del dataset `hrl-imerse/doug-stack-phases`, con una división de 75 episodios para entrenamiento y 9 para validación. Se aplicó aumentación de datos con color jitter y RandomAffine para mejorar la robustez frente a variaciones de iluminación y posición. La pérdida de validación se mantuvo estable en torno a 0,55-0,57 (0,570 en el paso 5k, 0,551 en 10k, 0,560 en 15k), sin señales claras de sobreajuste en el rango registrado.

En tiempo de ejecución, la fase se infiere en vivo a partir de la lectura del gripper y se alimenta al modelo, aplicando ensamblado temporal (temporal ensembling) con coeficiente 0,01. El runner `run_phased.py` implementa además una lógica de recuperación: si el gripper se cierra sobre vacío durante la fase de colocación, la ejecución vuelve a la fase de recogida del mismo bloque.

## Capacidades

- Generación de chunks de acciones de 100 pasos para control de un brazo robótico SO-101 en tareas de apilado de bloques.
- Condicionamiento por fase: la política modula su comportamiento según el subtarea activa (pick/place) y el color del bloque objetivo.
- Inferencia en tiempo real con ensamblado temporal de predicciones (coeficiente 0,01).
- Recuperación ante fallos de agarre: lógica de retorno a la fase de picking si el gripper cierra sobre vacío.
- Percepción visual mediante cámara de muñeca (wrist camera).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modalidades de texto, audio o visión general. Es un modelo específico de robótica.
- No dispone de modo thinking ni razonamiento simbólico explícito.

## Casos de uso

- Apilado de bloques con brazo SO-101: el modelo ejecuta la secuencia completa de recogida y colocación de bloques naranja, verde y púrpura, usando la fase one-hot para dirigir el brazo hacia los bloques (pick) o hacia la torre (place). Es su caso de uso principal y el único validado en el test real documentado.
- Investigación en descomposición de tareas robóticas: sirve como referencia para estudiar cómo el condicionamiento explícito por fase afecta la política en comparación con modelos puramente reactivos a la imagen.
- Prototipado de pipelines de imitación con LeRobot: al estar integrado en el ecosistema LeRobot, puede usarse como plantilla para entrenar políticas ACT con entradas de estado adicionales en otras tareas de manipulación.
- Benchmarking de robustez ante variaciones visuales: el entrenamiento con color jitter y RandomAffine permite evaluar la generalización del modelo ante cambios de iluminación y posición en entornos controlados.
- Docencia y experimentación con brazos de bajo coste: el tamaño compacto (51,67 M de parámetros, repo de 0,2 GB) y el hardware SO-101 lo hacen adecuado para laboratorios con presupuesto limitado.
- Estudio de mecanismos de recuperación ante fallos: la lógica de retorno a picking cuando el gripper cierra sobre vacío puede analizarse como ejemplo de gestión de errores en políticas de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la información disponible. El autor reporta únicamente la pérdida de validación durante el entrenamiento:

| Paso | Pérdida de validación |
|---|---|
| 5.000 | 0,570 |
| 10.000 | 0,551 |
| 15.000 | 0,560 |

El test en brazo real (2026-11-17) se describe cualitativamente: apiló el bloque naranja correctamente tras varios intentos de agarre, y después dudó y no se dirigió al bloque verde. El autor señala que la precisión de agarre sigue siendo el cuello de botella.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,67 M de parámetros en safetensors, el modelo es muy ligero (del orden de cientos de MB en FP32) y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con suficiente VRAM para el runtime de LeRobot/ACT es válida; una RTX 4090 o superior ofrece margen amplio, aunque no se documentan requisitos mínimos.
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: LeRobot (framework principal, con el runner `run_phased.py` en el repositorio GitHub `msong33/hrl_imerse`, rama `doug/stack-phases`, carpeta `assignment2/task2_phases`). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas ACT, modelos de imitación robótica ni alternativas de la misma categoría.

## Limitaciones y advertencias

- El test en brazo real muestra un rendimiento parcial: apiló el bloque naranja tras varios intentos, pero no completó el bloque verde por vacilación. La precisión de agarre es el principal cuello de botella según el autor.
- El modelo está entrenado para una tarea muy específica (apilado de tres colores de bloque con SO-101) y no generaliza a otras tareas sin reentrenamiento.
- Depende de la inferencia en vivo de la fase a partir de la lectura del gripper; errores en esa estimación degradan el comportamiento.
- La pérdida de validación se estanca en torno a 0,55-0,57, sin mejoras claras entre 10k y 15k pasos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Verificar antes de cualquier despliegue en producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje.
- El dataset de entrenamiento es reducido (84 episodios), lo que limita la diversidad de escenarios cubiertos.
- No se han publicado benchmarks estandarizados que permitan comparar su rendimiento de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrl-imerse/doug-act-stack-phases-15k
- Dataset de entrenamiento: https://huggingface.co/datasets/hrl-imerse/doug-stack-phases
- Repositorio GitHub del runner: https://github.com/msong33/hrl_imerse (rama `doug/stack-phases`, carpeta `assignment2/task2_phases`)
- Framework LeRobot: https://github.com/huggingface/lerobot
