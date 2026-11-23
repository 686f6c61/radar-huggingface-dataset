# mimiminsoo/cashier-barcode-onehot3

## Resumen

`cashier-barcode-onehot3` es una política de difusión (diffusion policy) para robótica entrenada con LeRobot, publicada por el usuario `mimiminsoo` en el marco de un proyecto capstone del programa MoAI 2026. El modelo controla un sistema bimanual compuesto por dos brazos PiPER con pinzas y un cuello de dos grados de libertad, a partir de tres cámaras RGB (`left_main`, `left_wrist`, `right_wrist`) con resolución de 240x320. Su tarea es una secuencia de tres etapas de tipo cajero: recoger un objeto, escanear su código de barras y colocarlo, codificadas como un vector one-hot de tres dimensiones.

El modelo no es un LLM ni un modelo de lenguaje: es un checkpoint de robótica de 4,4 GB (`training_state.pt`) que contiene pesos EMA, entrenado durante 200 000 pasos con batch 64 sobre un dataset propio de 450 episodios y 107 296 fotogramas (`split3_v3_1121`). El espacio de estado es de 19 dimensiones (16 del robot más 3 de etapa) y el de acción de 16 dimensiones (6+pinza por brazo y pitch/yaw del cuello).

Es relevante para quienes trabajan en manipulación bimanual con LeRobot y en políticas de difusión condicionadas por etapa: documenta una receta concreta de etiquetado de fases a partir de eventos de pinza y una integración con un pipeline de evaluación en robot real (`Cashier_policy`, rama `release`). La información pública es escasa: cero descargas, cero likes y una model card técnica pero sin resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot), no disponible el detalle de la red |
| Parametros totales | no disponible (checkpoint de 4,4 GB con pesos EMA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de observación 2, predicción 16, acción 8 a 10 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`checkpoints/step_0000200000/training_state.pt`) |
| Libreria | LeRobot |
| Entradas | 3 camaras RGB a 240x320 (`left_main`, `left_wrist`, `right_wrist`) + estado de 19 dimensiones |
| Salidas | Accion de 16 dimensiones (brazo izq. 6 + pinza, brazo dcho. 6 + pinza, pitch/yaw del cuello) |
| Frecuencia de control | 10 Hz |
| Dataset de entrenamiento | `split3_v3_1121`: 450 episodios, 107 296 fotogramas |
| Pasos de entrenamiento | 200 000, batch 64, `normalize_range_eps` 0.0001 |
| Hardware robotico | Doble brazo PiPER + cuello de 2 GDL, 3 camaras |

## Arquitectura y entrenamiento

Se trata de una política de difusión integrada en el ecosistema LeRobot, que genera trayectorias de acción mediante un proceso de denoising condicionado por observaciones visuales y por el estado del robot. La configuración declarada es de horizonte de observación 2, horizonte de predicción 16 y horizonte de ejecución de acciones 8, ejecutando a 10 Hz. El estado de entrada tiene 19 dimensiones: 16 correspondientes al robot (posiciones articulares y estado de pinzas de ambos brazos más el cuello) y 3 adicionales que codifican la etapa actual como one-hot (`stage_pick` = [1,0,0], `stage_scan` = [0,1,0], `stage_place` = [0,0,1]).

El entrenamiento se realizó durante 200 000 pasos con batch 64 sobre el dataset `split3_v3_1121` (450 episodios, 107 296 fotogramas), con `normalize_range_eps` de 0.0001 y pesos EMA almacenados en el checkpoint. La innovación técnica documentada no está en la arquitectura sino en el etiquetado automático de etapas: la fase 0a abarca desde el inicio hasta la primera liberación de la pinza izquierda antes del escaneo (detectada cuando el estado de la pinza baja de `grasp_lt` durante 3 filas y luego supera `open_gt` durante 3 filas); la fase 0b llega hasta el primer escaneo; la fase 1 va desde el escaneo hasta el final. Los umbrales son `grasp_lt` = 80 y `open_gt` = 85, ambos rebajados por `max(0, 89 - max_estado_pinza_izquierda_del_episodio)`, y una liberación solo cuenta si la articulación J1 izquierda (columna 0 del estado) está por debajo de 15 grados. No se documenta el uso de RLHF, DPO ni datos externos.

## Capacidades

- Control bimanual coordinado de dos brazos PiPER con pinzas en paralelo y un cuello de dos grados de libertad (pitch/yaw).
- Percepción visual multimodal a partir de tres cámaras simultáneas: vista frontal izquierda y vistas de muñeca de ambos brazos.
- Ejecución de secuencias de tres etapas condicionadas por un vector one-hot: recogida, escaneo y colocación.
- Generación de trayectorias multimodales mediante difusión, adecuada para tareas de manipulación con múltiples soluciones válidas.
- Control en bucle cerrado a 10 Hz con horizonte de acción de 8 pasos y replanificación cada 0,8 segundos.
- Integración con el pipeline de evaluación `Cashier_policy` (rama `release`), que encadena este modelo con un modelo de empaquetado.
- No soporta tool calling, agentes, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Automatización de caja en comercio minorista: el modelo ejecuta el ciclo recoger-escanear-colocar sobre objetos con código de barras, usando la etapa one-hot para sincronizar la transición entre fases sin un planificador externo.
- Investigación en políticas de difusión bimanual: sirve como referencia reproducible de una receta completa (dataset, etiquetado de etapas por eventos de pinza, entrenamiento de 200 000 pasos) para comparar variantes de horizonte y frecuencia de control.
- Encadenamiento de habilidades en robot real: el script `eval/run_chain.sh` permite concatenar este modelo con un modelo de empaquetado, lo que lo hace útil para estudiar interfaces entre políticas especializadas.
- Manipulación con cuello activo: el control de pitch/yaw permite mantener las cámaras apuntando al objeto durante la recogida y el escaneo, un caso realista en estaciones de trabajo con sensores montados en cabeza.
- Prototipado de estaciones de escaneo con doble brazo: equipos que ya dispongan de dos PiPER y tres cámaras pueden desplegar el checkpoint directamente con `pipeline/download_model.py` y reutilizar `start_pose/` como configuración inicial de episodio.
- Docencia y formación en robótica de imitación: el modelo y su dataset asociado permiten ilustrar el ciclo completo de captura de demostraciones, etiquetado de fases y evaluación en hardware real.
- Evaluación de robustez ante liberaciones fallidas: la lógica de detección de liberación (con el filtro de J1 < 15 grados y el rearme del detector) es reutilizable para construir datasets con fases anotadas de forma automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, errores de posición, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint pesa 4,4 GB (incluye estado de entrenamiento y pesos EMA), por lo que en FP32 la política ocuparía del orden de esa cifra; no se documenta la huella real en inferencia ni si se puede reducir con precisión mixta.
- GPU recomendadas: no disponible. No se especifica GPU usada en entrenamiento ni en evaluación.
- Compatibilidad con GPU de consumo: no confirmada; 4,4 GB de checkpoint es un tamaño manejable en GPUs de consumo con 8 GB o más, pero no hay dato oficial.
- Despliegue: el flujo documentado es `pipeline/download_model.py` (descarga) y `eval/run_chain.sh` (evaluación en robot real) sobre la rama `release` de `Cashier_policy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la frecuencia de control es de 10 Hz y el horizonte de acción de 8 pasos, lo que implica replanificación cada 0,8 segundos.
- Hardware físico requerido para evaluación: dos brazos PiPER, cuello de 2 GDL y tres cámaras RGB a 240x320.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cashier-barcode-onehot3 | Diffusion policy LeRobot, bimanual | no disponible (4,4 GB) | obs 2 / pred 16 / acción 8, 10 Hz | Apache 2.0 | Hugging Face, 0 descargas |
| Otras diffusion policies de LeRobot | Diffusion policy | no disponible | variable | variable | no disponible en la informacion proporcionada |
| Políticas ACT (Action Chunking Transformer) | Transformer de imitación | no disponible | variable | variable | no disponible en la informacion proporcionada |
| Políticas VLA generalistas | Vision-language-action | no disponible | variable | variable | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de robótica específico: no procesa lenguaje ni imágenes generales; cualquier uso fuera del control de los brazos PiPER y el cuello descritos no está soportado.
- Fuerte acoplamiento al hardware: la dimensionalidad de estado (19) y acción (16) asume exactamente dos brazos PiPER con pinzas y un cuello de 2 GDL; no es portable a otra cinemática sin reentrenamiento.
- Dependencia de la cámara y la resolución: las tres cámaras deben estar montadas en las posiciones y a la resolución (240x320) del dataset de entrenamiento; cambios de calibración o de iluminación pueden degradar el comportamiento.
- Etiquetado de etapas frágil: los umbrales `grasp_lt` = 80 y `open_gt` = 85, el filtro J1 < 15 grados y la ventana de 3 filas son heurísticas específicas del dataset; episodios con liberaciones atípicas pueden quedar mal etiquetados.
- Sesgo de datos: 450 episodios de un único entorno y configuración; no hay evidencia de generalización a otros objetos, posiciones de escaneo o condiciones de iluminación.
- Riesgo de alucinación en el sentido robótico: la política puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de verificación interno.
- Sin métricas publicadas: no hay tasas de éxito ni análisis de fallos, lo que impide estimar la fiabilidad en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción exige validación propia.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas estén documentados por terceros.
- El checkpoint incluye estado de entrenamiento completo (4,4 GB), no solo pesos de inferencia; conviene extraer únicamente los pesos EMA para despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mimiminsoo/cashier-barcode-onehot3
- Repositorio `Cashier_policy` (rama `release`): no disponible como URL en la informacion proporcionada
- Dataset `split3_v3_1121`: referenciado dentro del repositorio del modelo (`datasets/split3_v3_1121/config.json`), sin URL pública
- LeRobot (librería): no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible
