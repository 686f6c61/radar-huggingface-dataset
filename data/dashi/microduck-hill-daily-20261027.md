# dashi/microduck-hill-daily-20261027

## Resumen

`dashi/microduck-hill-daily-20261027` es una política de control motriz para el robot cuadrúpedo open source microduck, desarrollada por el usuario dashi y publicada como un "re-entry diario" (una instantánea automática de una ejecución de entrenamiento) del modelo `dashi/microduck-hill-remix-r744`. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que consume un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, diseñada para ocupar el slot `walk` del daemon de control del robot.

Su rasgo diferencial es que se declara "perpetual": la política no emite condición de terminación y sigue generando marcha indefinidamente hasta que se le ordene lo contrario, lo que la hace apta para ejecución continua en robot real en lugar de episodios acotados. Es un finetune/remix de `jrubiosainz/microduck-game-hillclimber-remix8`, orientado por el nombre y el linaje a terrenos con pendiente.

La relevancia es acotada pero concreta: el ecosistema microduck (Pollen Robotics) publica políticas de robot abiertas con un manifiesto estandarizado y un comando de despliegue de una línea, lo que convierte a estos modelos en material directamente reproducible para investigación en sim-to-real y locomoción con RL. El repositorio ocupa 0,0 GB (por debajo del umbral de redondeo de HuggingFace) y no registra descargas ni likes, lo que sitúa el modelo en la categoría de artefacto experimental de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Política de aprendizaje por refuerzo exportada a ONNX; la model card no detalla la topología de la red (capas, dimensiones, tipo de encoder) |
| Parámetros totales | No disponible. El repositorio ocupa 0,0 GB, lo que implica un artefacto por debajo del umbral de reporte de HuggingFace (típicamente pocos MB para políticas de este tipo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. No hay ventana de contexto: la entrada es un vector de observación de 61 dimensiones por paso de control |
| Tipos de cuantización | No disponible. Se distribuye un único `policy.onnx` sin variantes cuantizadas documentadas; la normalización de observaciones está embebida en el propio grafo ONNX |
| Idiomas soportados | No aplica (el modelo no procesa ni genera texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Pipeline / tarea | `robotics` |
| Librería | `microduck` |
| Dimensiones de E/S | Observación de 61 dimensiones; 14 acciones; frecuencia de control de 50 Hz |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix8` (relación: finetune) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red. Lo que sí se especifica es el contrato de interfaz: 61 valores de observación de entrada en crudo (el normalizador está incluido en `policy.onnx`, por lo que no hay que preprocesar la observación), 14 salidas de acción y un bucle de control a 50 Hz. El artefacto se distribuye como grafo ONNX acompañado de un `manifest.json` que sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon, lo que permite que `robotctl` cargue la política de forma estandarizada. Al ser una política "perpetua", no incluye cabeza de terminación de episodio ni acción de parada.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`, según los metadatos declarados por el autor. La etiqueta `reinforcement-learning` confirma la familia de método, pero no se publican número de pasos de entrenamiento, composición del entorno o del dataset, función de recompensa, hiperparámetros ni detalles de domain randomization para sim-to-real. El modelo es un remix/finetune del checkpoint `microduck-game-hillclimber-remix8`, y la propia model card lo describe como "daily re-entry" de `dashi/microduck-hill-remix-r744` con una puntuación de referencia de 0,744. No hay rastro de RLHF, DPO ni técnicas de alineación al uso en modelos de lenguaje, algo esperable en un artefacto de robótica.

## Capacidades

- Locomoción cuadrúpeda continua: genera comandos motores a 50 Hz para el robot microduck a partir de observaciones proprioceptivas de 61 dimensiones.
- Marcha perpetua: la política no emite señal de parada; sigue produciendo gait hasta que el operador descarga la política o detiene el daemon.
- Marcha en terreno con pendiente: el nombre, el modelo base (`hillclimber`) y la rama de entrenamiento (`roll-backward`) apuntan a un gait entrenado para ascender o transitar desniveles, sin que la model card aporte métricas de terreno.
- Encapsulación de la normalización: al estar el normalizador embebido en el ONNX, acepta observaciones en crudo, lo que simplifica la integración y reduce errores de preprocesado en el robot.
- Integración con el stack de control de microduck mediante `robotctl policy load walk <repo>`, con manifiesto versionado (schema 2).
- Reutilización como punto de partida: al ser un finetune declarado, sirve como base para nuevos remixes dentro del mismo ecosistema.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de código, matemáticas, visión, audio ni capacidades multilingües: es exclusivamente un controlador motor.

## Casos de uso

- Marcha por defecto en robot real: cargar la política en el slot `walk` con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261027` para disponer de un gait operativo sin necesidad de entrenar ni ajustar nada, gracias a que el normalizador va embebido en el ONNX.
- Demostraciones de locomoción continua: al ser una política perpetua, permite dejar el robot caminando durante sesiones largas en ferias, laboratorio o docencia sin reiniciar episodios ni reinyectar comandos periódicamente.
- Investigación en sim-to-real: sirve como referencia de política entrenada en simulador (repo `microduck_rl`) para medir la brecha entre simulación y hardware real en el mismo robot y con la misma interfaz de 61 observaciones y 14 acciones.
- Punto de partida para finetuning: al declararse remix de `microduck-game-hillclimber-remix8`, un equipo puede reentrenar sobre esta política en lugar de desde cero para adaptar la marcha a una superficie o carga concreta.
- Comparación de gaits en el slot `walk`: intercambiable con otras políticas del ecosistema mediante el mismo comando, lo que permite A/B testing de locomoción con un solo cambio de identificador de repositorio.
- Reproducibilidad de experimentos: el commit (`83599404a`) y la rama (`roll-backward`) quedan registrados, lo que facilita reconstruir la configuración de entrenamiento en un entorno de laboratorio.
- Docencia en robótica y RL: artefacto pequeño, en ONNX y con despliegue de una línea, adecuado para prácticas donde el alumnado inspecciona el grafo, altera el manifiesto o compara políticas sin montar infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única cifra numérica es la puntuación de 0,744 asociada al modelo predecesor `dashi/microduck-hill-remix-r744`, citada como referencia de la reentrada diaria; la model card no define la métrica (retorno medio, distancia recorrida, tasa de éxito en pendiente u otra), el entorno de evaluación ni el número de episodios, por lo que no es comparable con resultados de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible. Con un repositorio de 0,0 GB, la política cabe holgadamente en memoria de cualquier sistema; no se requiere GPU.
- GPU recomendadas: ninguna. La inferencia está pensada para ejecutarse en el ordenador embebido del robot a través del daemon `robotctl` (modelo de placa no especificado en la información disponible).
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso; una RTX 4090 o similar solo tendría sentido para reentrenar la política en el repo `microduck_rl`, no para inferir.
- Opciones de despliegue: `robotctl` (vía manifiesto schema 2) es la ruta documentada; al ser ONNX, ONNX Runtime es el runtime natural, aunque la model card no lo confirma explícitamente.
- Latencia y throughput: el bucle de control se declara a 50 Hz, lo que fija un presupuesto de 20 ms por paso de control (observación, inferencia y envío de 14 acciones). La model card no publica latencia medida ni tasa de éxito.
- Almacenamiento: despreciable; el artefacto completo ocupa 0,0 GB según HuggingFace.

## Comparativa con modelos similares

| Modelo | Rol | Dimensiones de E/S | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261027` | Política `walk` perpetua, remix | 61 obs / 14 acciones | 50 Hz | No disponible | Pública en HF, 0 descargas |
| `dashi/microduck-hill-remix-r744` | Predecesor citado, puntuación 0,744 | No disponible | No disponible | No disponible | Pública en HF |
| `jrubiosainz/microduck-game-hillclimber-remix8` | Modelo base del finetune | No disponible | No disponible | No disponible | Pública en HF |

No se dispone de datos de arquitectura, número de parámetros ni métricas de rendimiento de las alternativas, por lo que la comparación se limita al linaje declarado y al contrato de interfaz del modelo principal. Fuera del ecosistema microduck no se han identificado en la información proporcionada políticas comparables con las que contrastar cifras.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia explícita no puede asumirse permiso para uso comercial, redistribución o modificación; hay que contactar con el autor antes de integrarlo en un producto.
- Ausencia total de métricas: no hay benchmarks, tasas de éxito, ni evaluación de robustez; la puntuación 0,744 del predecesor no está definida metodológicamente.
- Naturaleza efímera: se trata de un "daily re-entry" generado automáticamente, con 0 descargas y 0 likes; es un artefacto experimental que puede no estar mantenido ni revisado.
- Riesgo de sim-to-real: no se documenta domain randomization, rango de masas, fricciones ni condiciones de iluminación o terreno cubiertas en entrenamiento; el comportamiento fuera de la distribución del simulador es incierto.
- Comportamiento perpetuo sin parada: al no incluir terminación de episodio, un fallo de la política no se autocorrige con un reinicio; se depende de la supervisión externa y de los límites de seguridad del daemon y del hardware.
- Dependencia de hardware y software concreto: solo es utilizable con el robot microduck y el daemon `robotctl` con soporte de manifiesto schema 2; no es portable a otras plataformas sin reentrenamiento.
- Especificidad de tarea: el slot es `walk`; no cubre otras habilidades (agacharse, girar en el sitio, recuperación tras caída) salvo que el gait las incluya de forma implícita, cosa que no se documenta.
- Sin soporte de lenguaje, visión ni interacción multimodal: no puede emplearse para atender comandos en lenguaje natural de forma directa.
- Idioma y sesgos: no aplica sesgo lingüístico; los sesgos relevantes serían de comportamiento motor (asimetrías de marcha, preferencia por un lado) y no se han caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-hill-daily-20261027
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix8
- Predecesor citado: https://huggingface.co/dashi/microduck-hill-remix-r744
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)

Nota: los resultados de búsqueda web proporcionados tratan sobre el caldo japonés *dashi* y no guardan relación con este modelo; se han descartado por completo.
