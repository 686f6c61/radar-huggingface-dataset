# mimiminsoo/cashier-nostage-step350k

## Resumen

`cashier-nostage-step350k` es una política de difusión (diffusion policy) para control robótico de manipulación bimanual, desarrollada por el usuario mimiminsoo como parte de un proyecto capstone (MoAI 2026). El modelo controla un sistema compuesto por dos brazos PiPER con pinzas y un cuello de 2 grados de libertad, a partir de tres cámaras (una principal izquierda y dos de muñeca). Su tarea es ejecutar de forma unificada el ciclo completo de lectura de código de barras y empaquetado, sin recibir una señal explícita de fase o etapa.

Técnicamente es una ablación del modelo `mimiminsoo/cashier-onehot6`: emplea exactamente los mismos datos y ajustes de entrenamiento, pero elimina las 6 columnas one-hot que codificaban la etapa de la tarea en el vector de estado. El estado de entrada queda en 16 dimensiones (solo articulaciones del robot) y la acción de salida en 16 dimensiones (6 por brazo más pinza, más pitch y yaw del cuello). El checkpoint publicado corresponde al paso 350.000, fruto de continuar durante 150.000 pasos adicionales un entrenamiento previo de 200.000 pasos.

La relevancia de esta variante reside en evaluar si una política única puede aprender una tarea de manipulación de múltiples fases sin información explícita de etapa, lo que simplifica el despliegue (no requiere orquestación de etapas) a costa de exigir que el modelo infiera la fase a partir de la observación visual y propioceptiva. El repositorio ocupa 4,4 GB e incluye pesos EMA dentro del estado de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (lerobot), política de difusión para control robótico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de observación 2, predicción 16, acción 8 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint PyTorch (`training_state.pt`, 4,4 GB, incluye pesos EMA) |
| Dimension de estado | 16 (solo articulaciones del robot, sin etapa) |
| Dimension de accion | 16 (brazo izq. 6 + pinza, brazo der. 6 + pinza, cuello pitch/yaw) |
| Camaras | 3 (`left_main`, `left_wrist`, `right_wrist`) a resolución [240, 320] |
| Frecuencia de control | 10 Hz |
| Pasos de entrenamiento | 350.000 |
| Dataset | `onehot6_1123_nostage`: 808 episodios, 298.045 frames |

## Arquitectura y entrenamiento

El modelo es una diffusion policy implementada sobre la librería `lerobot`. Genera secuencias de acción mediante un proceso de difusión condicionado por observaciones multimodales: tres flujos de imagen a resolución 240×320 y un vector de estado propioceptivo de 16 dimensiones que contiene únicamente las posiciones articulares del robot (sin las 6 columnas one-hot de etapa presentes en la variante `cashier-onehot6`). Los horizontes configurados son observación 2, predicción 16 y ejecución de acción 8, con control a 10 Hz.

El entrenamiento se realizó sobre el dataset `onehot6_1123_nostage`, derivado de `onehot6_1123` eliminando las 6 columnas de etapa manteniendo idénticos episodios, filas, imágenes y acciones: 808 episodios y 298.045 frames. Se ejecutaron 350.000 pasos con batch global 64 (32 por GPU en 2 GPU con DDP, NVIDIA GeForce RTX 4090). El schedule consistió en un primer tramo coseno de 200.000 pasos, reanudado en el paso 200.000 con un nuevo coseno hasta 350.000, reiniciando el learning rate a aproximadamente 3,9e-5 y decayendo hasta 0. Se empleó `normalize_range_eps` de 0,0001. El checkpoint publicado incluye pesos EMA dentro del estado de entrenamiento.

## Capacidades

- Control bimanual coordinado: genera acciones para dos brazos PiPER de 6 grados de libertad más pinza cada uno, en un único vector de 16 dimensiones.
- Control de cuello de 2 grados de libertad (pitch y yaw) integrado en la misma política de acción.
- Fusión de tres cámaras (vista principal izquierda y dos vistas de muñeca) con estado propioceptivo para generar acciones.
- Ejecución de una tarea compuesta (lectura de código de barras y empaquetado) sin señal explícita de etapa; la fase debe inferirse de la observación.
- Generación de trayectorias de acción por difusión con horizonte de predicción 16 y ejecución de 8 pasos a 10 Hz.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades lingüísticas: es un modelo puramente motor.

## Casos de uso

- Automatización de línea de caja y empaquetado: la política ejecuta de forma unificada la lectura de códigos de barras y el empaquetado posterior sobre un banco con dos brazos, eliminando la necesidad de orquestar etapas separadas en el software de control.
- Investigación en ablación de señales de etapa: sirve como referencia experimental para medir el impacto de eliminar la información one-hot de fase frente a `cashier-onehot6-step350k`, con idénticos datos y schedule.
- Prototipado de manipulación bimanual en laboratorio: permite desplegar una política única sobre hardware PiPER con cuello motorizado y tres cámaras sin diseñar una máquina de estados de tareas.
- Benchmark de diffusion policies en tareas de horizonte largo: con 350.000 pasos y 298.045 frames, es un punto de comparación para estudiar estabilidad de entrenamiento y saturación de rendimiento.
- Despliegue en entornos de investigación con presupuesto limitado: entrenado en 2× RTX 4090 con batch 64, es reproducible en hardware consumer de gama alta.
- Base para destilación o fine-tuning en tareas de retail: el checkpoint EMA puede reutilizarse como inicialización para variantes con otras cámaras u otro layout de tienda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de evaluación ni comparaciones cuantitativas con `cashier-onehot6-step350k` u otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 4,4 GB en disco e incluye pesos EMA y estado de entrenamiento, por lo que la inferencia requiere cargar el modelo en memoria (estimación orientativa no confirmada: varios GB de VRAM).
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizó en 2× NVIDIA GeForce RTX 4090 con DDP.
- Cabe en GPU consumer: sí, según el hardware de entrenamiento declarado (RTX 4090); no se confirma el requisito mínimo de VRAM para inferencia.
- Opciones de despliegue: librería `lerobot`, con descarga mediante `pipeline/download_model.py` del repositorio `Cashier_policy` (rama `release`).
- Latencia y throughput: control a 10 Hz según configuración; no se publican latencias por paso de difusión ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizontes | Entrada de etapa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cashier-nostage-step350k` | no disponible | obs 2, pred 16, acción 8, 10 Hz | No (estado 16) | apache-2.0 | Hugging Face |
| `mimiminsoo/cashier-onehot6-step350k` | no disponible | mismos horizontes y schedule | Sí (6 columnas one-hot) | apache-2.0 | Hugging Face |
| `mimiminsoo/cashier-nostage` | no disponible | mismos horizontes, 200.000 pasos | No | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo está entrenado para un hardware y layout concretos (dos brazos PiPER, cuello 2-DOF, tres cámaras en posiciones fijas); no se garantiza generalización a otras configuraciones.
- Al eliminar la señal de etapa, la política debe inferir la fase a partir de la observación; esto puede provocar transiciones incorrectas entre lectura y empaquetado en estados ambiguos.
- `eval/run_chain.sh` no es aplicable a este modelo: está pensado para cadenas de modelos por etapa. La cadena de una sola política sin etapa "no está en `release` todavía", según el autor.
- El modelo no incluye capacidades lingüísticas, de razonamiento simbólico ni de tool calling; cualquier uso fuera del control motor no está soportado.
- No se han publicado métricas de éxito, sesgos ni análisis de fallos; el rendimiento real en producción es desconocido.
- La licencia apache-2.0 permite uso comercial, pero la ausencia de evaluación publicada desaconseja su despliegue en producción sin validación propia.
- El repositorio incluye estado de entrenamiento completo (4,4 GB), no solo pesos de inferencia, lo que incrementa los requisitos de almacenamiento y carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mimiminsoo/cashier-nostage-step350k
- Variante con etapa: https://huggingface.co/mimiminsoo/cashier-onehot6-step350k
- Variante base de 200.000 pasos: https://huggingface.co/mimiminsoo/cashier-nostage
- Modelo de referencia con one-hot: https://huggingface.co/mimiminsoo/cashier-onehot6
- Modelo de datos de pose inicial: https://huggingface.co/mimiminsoo/cashier-barcode-onehot3
- Librería lerobot: https://github.com/huggingface/lerobot
