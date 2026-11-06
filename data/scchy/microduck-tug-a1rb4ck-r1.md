# SccHy/microduck-tug-a1rb4ck-r1

## Resumen

tug-a1rb4ck-r1 es una política de control motriz (policy) para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un agente de reinforcement learning empaquetado en formato ONNX que traduce observaciones del robot (61 dimensiones) en acciones de control (14 dimensiones) a una frecuencia de 50 Hz. El autor del repositorio es el usuario SccHy, que publica el modelo bajo la librería `microduck` y con pipeline declarado como `robotics`.

El modelo implementa una marcha (gait) de tipo "perpetuo": se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de políticas del daemon del robot mediante el comando `robotctl policy load`. La normalización de observaciones está integrada dentro del propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional. El repositorio incluye además un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

La relevancia de esta ficha es acotada: se trata de un artefacto muy específico para un robot concreto, con un tamaño de repositorio de 0,0 GB (probablemente un fichero ONNX de pocos megabytes) y sin métricas publicadas. No hay información sobre licencia, idiomas ni benchmarks, lo que limita su evaluación fuera del ecosistema microduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX; arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se sabe que es una política entrenada con reinforcement learning para el robot microduck, con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, operando a 50 Hz. El modelo se exporta a ONNX e incluye la normalización de observaciones embebida en el grafo, lo que simplifica el despliegue en el robot.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`. No se especifican el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL empleado (PPO, SAC, etc.) ni si hubo fases de ajuste fino o curricula. Tampoco se documentan innovaciones técnicas adicionales más allá del carácter "perpetuo" de la marcha y la integración del normalizador en el modelo exportado.

## Capacidades

- Control motriz continuo de un robot cuadrúpedo microduck: genera 14 acciones de control a partir de 61 observaciones a 50 Hz.
- Ejecución de una marcha perpetua: la política corre de forma indefinida hasta que se detiene explícitamente.
- Despliegue en robot físico mediante el comando `robotctl policy load <slot> SccHy/microduck-tug-a1rb4ck-r1`.
- Normalización de observaciones integrada: acepta observaciones en bruto sin preprocesado externo.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que facilita su carga en el daemon del robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Locomoción básica del microduck en entornos de laboratorio: cargar la política en una ranura y dejar que el robot camine de forma continua para pruebas de hardware y calibración de sensores.
- Investigación en reinforcement learning aplicado a robótica: servir como política de referencia o línea base para comparar con otras marchas entrenadas en el mismo entorno (`microduck_rl`).
- Demostraciones educativas: usar la marcha perpetua en talleres o clases con el robot microduck para ilustrar el despliegue de políticas de RL en hardware real.
- Pruebas de integración del daemon `robotctl`: validar el flujo de carga de políticas, el esquema de manifiesto 2 y la comunicación a 50 Hz entre política y robot.
- Evaluación de robustez de la marcha: ejecutar la política durante periodos prolongados para observar deriva, consumo energético o degradación del comportamiento.
- Desarrollo de pipelines de sustitución de políticas: emplear esta política como punto de partida para experimentar con mezclas, interrupciones o cambios de ranura en caliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y el formato ONNX, es probable que el modelo sea muy pequeño (del orden de kilobytes a pocos megabytes), pero no se confirma.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecutarse en el propio robot microduck, no en GPUs de servidor.
- Compatibilidad con GPU de consumo: no disponible; la inferencia se realiza presumiblemente en la CPU del robot o en un microcontrolador compatible con ONNX Runtime.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck, cargando `policy.onnx` en una ranura de políticas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica).
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms por paso); no se publican latencias medidas ni throughput adicional.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas para microduck ni modelos comparables de la misma categoría (políticas de RL para robots cuadrúpedos de código abierto) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de utilizarlo en productos.
- Ausencia total de benchmarks y métricas de rendimiento: no hay evidencia publicada sobre robustez, tasa de caídas o generalización de la marcha.
- Especificidad extrema: la política solo es válida para el robot microduck con su configuración de 61 observaciones y 14 acciones; no es transferible a otros robots sin reentrenamiento.
- Riesgo de comportamiento degenerado: al ser una marcha perpetua sin mecanismos de parada internos documentados, requiere supervisión y parada explícita por parte del operador.
- Sin información sobre sesgos: no aplica en el sentido habitual, pero no se documentan sesgos de simulación a realidad (sim-to-real gap) ni condiciones de entrenamiento.
- Repositorio sin descargas ni likes y con tamaño de 0,0 GB: la disponibilidad y reproducibilidad del artefacto no están verificadas por la comunidad.
- El commit de entrenamiento (`1efd853be`) y la rama (`challenge-recipe-publishing`) no se han validado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SccHy/microduck-tug-a1rb4ck-r1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `challenge-recipe-publishing`, commit `1efd853be`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa).
