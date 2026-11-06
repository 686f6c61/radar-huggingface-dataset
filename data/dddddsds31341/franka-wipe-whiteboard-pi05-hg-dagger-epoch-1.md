# dddddsds31341/Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1

## Resumen

Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1 es un checkpoint de ajuste fino completo del modelo vision-language-action (VLA) pi0.5, desarrollado por el usuario dddddsds31341 y publicado en Hugging Face. El modelo parte de los pesos de `Franka-Wipe-Whiteboard-pi05-step-20000` y se especializa en una unica tarea robotica: borrar la escritura de una pizarra blanca con un brazo robotico Franka. Se trata, por tanto, de un modelo de politica (policy) para control motor, no de un modelo de lenguaje de proposito general.

El entrenamiento combina aprendizaje por imitacion offline con HG-DAgger (Human-Gated DAgger), una variante de DAgger en la que un operador humano interviene selectivamente durante la recogida de datos para corregir la politica en estados de fallo. El conjunto agregado suma 31.365 muestras (29.795 frames offline mas 1.570 frames de intervencion) y se entreno durante una epoca con 981 actualizaciones de optimizador, batch global de 32 y acumulacion de gradiente de 1.

El modelo se distribuye como checkpoint de inferencia en formato OpenPI/JAX, con parametros EMA y estadisticas de normalizacion del dataset mixto. Su relevancia es acotada: es un artefacto de investigacion reproducible para una tarea concreta de manipulacion robotica, util para quien quiera estudiar el flujo de trabajo pi0.5 + DAgger sobre Franka, no como modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (pi0.5, OpenPI, JAX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (politica por pasos, no modelo conversacional) |
| Tipos de cuantizacion | no disponible (checkpoint JAX en precision de entrenamiento) |
| Idiomas soportados | no disponible (prompt fijo en ingles: "Erase the writing from the whiteboard.") |
| Licencia | no disponible |
| Formato de pesos | checkpoint OpenPI/JAX (parametros EMA + estadisticas de normalizacion) |
| Estado de robot | 19D continuo (Franka) |
| Accion | 7D delta en marco del cuerpo |
| Horizonte de accion | 10 |
| Camaras | externa + muneca |
| Config OpenPI | `pi05_franka_wipe_whiteboard_hg_dagger` |

## Arquitectura y entrenamiento

El modelo es un VLA pi0.5 implementado en OpenPI sobre JAX. Toma como entrada observaciones visuales de dos camaras (una externa y una montada en la muneca del robot), un estado continuo de 19 dimensiones del Franka y un prompt de texto fijo, y produce acciones de 7 dimensiones en el marco del cuerpo con un horizonte de 10 pasos. El ajuste fino es completo (full fine-tuning) sobre los pesos del checkpoint previo `Franka-Wipe-Whiteboard-pi05-step-20000`.

El entrenamiento combina dos fuentes de datos: 29.795 frames offline del dataset `wipe-whiteboard-lerobot` y 1.570 frames de intervencion HG-DAgger recogidos localmente y no publicados. El total agregado es de 31.365 muestras, procesadas en una epoca con 981 actualizaciones de optimizador, batch global de 32 y acumulacion de gradiente de 1. El directorio del checkpoint se llama `980` porque OpenPI numera la actualizacion final desde cero. El repositorio contiene los parametros EMA y las estadisticas de normalizacion del dataset mixto, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Control robotico de una tarea especifica: borrar la escritura de una pizarra blanca con un Franka.
- Percepcion visual multimodal a partir de dos camaras (externa y de muneca).
- Fusion de estado propioceptivo (19D) y prompt de texto para generar acciones.
- Generacion de acciones continuas de 7D en el marco del cuerpo con horizonte de 10 pasos.
- Aprendizaje por imitacion con correcciones humanas (HG-DAgger) para mejorar la robustez en estados de fallo.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento conversacional.
- No es un modelo multilingue ni de generacion de texto: el prompt es fijo y en ingles.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible del flujo pi0.5 + HG-DAgger sobre un robot Franka, con hiperparametros y dataset documentados.
- Estudio de DAgger en robotica real: permite analizar como las 1.570 intervenciones humanas afectan al comportamiento frente al checkpoint previo de 20.000 pasos.
- Evaluacion de politicas VLA en tareas de contacto: la tarea de borrar pizarra implica contacto sostenido y trayectorias largas, util para medir robustez.
- Base para ajuste fino en tareas de limpieza o borrado: se puede partir de estos pesos para tareas similares de manipulacion sobre superficies.
- Reproduccion de experimentos en laboratorio: el checkpoint de inferencia y las estadisticas de normalizacion permiten replicar la evaluacion en un entorno controlado.
- Docencia y formacion en robotica de aprendizaje: ejemplo concreto de pipeline OpenPI/JAX con camaras, estado y acciones bien definidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano de pi0.5 y de la precision; el checkpoint es JAX y no incluye cuantizaciones).
- GPU recomendadas: no disponible. OpenPI/JAX suele requerir GPU de datacenter (A100, H100) para entrenamiento; para inferencia no se especifica.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: OpenPI (JAX). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de control motor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1 | VLA pi0.5 (JAX) | Borrar pizarra con Franka | no disponible | no disponible | no disponible | Hugging Face |
| Franka-Wipe-Whiteboard-pi05-step-20000 | VLA pi0.5 (JAX) | Borrar pizarra con Franka | no disponible | no disponible | no disponible | Hugging Face (pesos de partida) |
| Otros VLA (p. ej. OpenVLA, RT-2) | VLA | Manipulacion general | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros VLA genericos no se puede completar con datos verificables en la informacion disponible; las diferencias principales frente al checkpoint de partida son el uso de datos HG-DAgger y el ajuste fino adicional.

## Limitaciones y advertencias

- Modelo de tarea unica: solo borra pizarra blanca con un Franka; no generaliza a otras tareas ni robots.
- Prompt fijo en ingles; no es multilingue ni conversacional.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- No contiene estado del optimizador: no permite reanudar el entrenamiento de forma exacta.
- Los datos de intervencion HG-DAgger son locales y no se publican, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de fallo en estados fuera de distribucion; el propio autor advierte de validar el orden de observaciones, unidades, estadisticas de normalizacion, limites del espacio de trabajo y ejecucion de acciones en un entorno controlado antes de desplegar en hardware.
- Sesgos y alucinaciones en el sentido de modelos de lenguaje no aplican; el riesgo es de comportamiento fisico incorrecto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al checkpoint de partida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-HG-DAgger-epoch-1
- Dataset offline: https://huggingface.co/datasets/dddddsds31341/wipe-whiteboard-lerobot
- Checkpoint de partida: https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-20000
- OpenPI (framework): no disponible en la informacion proporcionada
