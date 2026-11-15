# dashi/microduck-roller-daily-20261114

## Resumen
Microduck-roller-daily-20261114 es una politica de control robótico entrenada por el usuario dashi para el robot microduck, un robot educativo de bajo coste mantenido por Pollen Robotics. No es un modelo de lenguaje: es una politica de aprendizaje por refuerzo que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para operar sobre ruedas (rollers) y ejecutarse en el slot de marcha (`walk`) del demonio de control del robot.

El modelo se presenta como una "reentrada diaria" de una politica anterior (`dashi/microduck-roller-remix-r900`, con una puntuacion de 0.900) y se describe como una politica perpetua: una vez cargada, el robot sigue ejecutando la marcha hasta que se le indique lo contrario. Es un finetune de `DenRakEiw/microduck-senate_duck_0904` y se distribuye como un artefacto ONNX con el normalizador de observaciones embebido en el propio grafo.

Por su naturaleza, la relevancia es acotada al ecosistema microduck y a la experimentación en robótica de bajo coste. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB y no se dispone de informacion sobre licencia, idiomas ni resultados de benchmarks. La busqueda web no devolvio ningun resultado relacionado con el modelo: todos los enlaces encontrados tratan del caldo japones dashi y no aportan informacion tecnica.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control entrenada por RL, artefacto ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (observacion de 61 dimensiones, no ventana de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura de la red neuronal. Se trata de una politica de aprendizaje por refuerzo que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, con el normalizador de observaciones integrado en `policy.onnx`, de modo que la entrada debe ser la observacion en bruto. El artefacto se empaqueta con `manifest.json` conforme al schema 2 del manifiesto de politicas del demonio microduck.

El entrenamiento se realizo con el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. El modelo es un finetune de `DenRakEiw/microduck-senate_duck_0904` y se describe como reentrada diaria de `dashi/microduck-roller-remix-r900` (0.900). No se especifican el numero de pasos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas como RLHF o DPO (no aplicables a una politica de control).

## Capacidades
- Control robótico en bucle cerrado: genera 14 acciones de control a partir de observaciones de 61 dimensiones a 50 Hz.
- Marcha sobre ruedas (rollers): la politica esta asociada al slot `walk` del robot microduck.
- Operacion perpetua: la politica se ejecuta de forma continua hasta recibir una orden de parada.
- Normalizacion de observaciones integrada: no requiere preprocesado externo de las observaciones.
- Despliegue mediante el demonio del robot: carga con `sudo robotctl policy load walk dashi/microduck-roller-daily-20261114`.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues.

## Casos de uso
- Marcha autonoma en el robot microduck: cargar la politica en el slot `walk` para que el robot se desplace sobre ruedas de forma continua, usando el comando `robotctl` descrito en la model card.
- Experimentacion docente en robótica de bajo coste: utilizar la politica como punto de partida para comparar estrategias de marcha en un robot accesible, gracias a la integracion con el demonio microduck.
- Evaluacion de finetunes sobre una politica base: al derivar de `DenRakEiw/microduck-senate_duck_0904`, sirve para medir el efecto de un reentrenamiento sobre el comportamiento de marcha original.
- Pruebas de robustez de controladores: al ser una politica perpetua, permite dejar el robot ejecutando la marcha durante periodos largos para observar deriva y estabilidad sobre ruedas.
- Reproduccion de experimentos de RL: el commit y la rama de entrenamiento indicados en la model card permiten reconstruir el pipeline en `pollen-robotics/microduck_rl` (rama `roll-backward`).
- Integracion en pipelines ONNX: al distribuirse como `policy.onnx`, puede cargarse en runtimes ONNX para inferencia fuera del robot, por ejemplo en bancos de pruebas con observaciones sinteticas.
- Base para futuras "reentradas diarias": el propio autor la presenta como una version diaria de una politica anterior, lo que la convierte en referencia para iteraciones sucesivas del mismo linaje.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es la puntuacion de la politica predecesora (`dashi/microduck-roller-remix-r900`, 0.900), que no se traslada como resultado de esta version.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un artefacto de muy pequeño tamaño, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es probable que quepa en cualquier GPU, pero no hay dato confirmado.
- Opciones de despliegue: demonio microduck mediante `robotctl` (flujo documentado) y runtime ONNX para `policy.onnx`.
- Latencia y throughput: no disponibles; la politica esta disenada para operar a 50 Hz.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dashi/microduck-roller-daily-20261114 | no disponible | no disponible (obs. 61-D) | no disponible | no disponible | Hugging Face, 0 descargas |
| DenRakEiw/microduck-senate_duck_0904 | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| dashi/microduck-roller-remix-r900 | no disponible | no disponible | 0.900 (segun la model card) | no disponible | Hugging Face (predecesor) |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas; la comparacion se limita al linaje declarado en la model card.

## Limitaciones y advertencias
- Ambito restringido: es una politica de control para el robot microduck sobre ruedas, no un modelo de proposito general; no sirve para tareas de texto, vision ni codigo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento de esta version concreta; la unica referencia es la puntuacion 0.900 de la politica predecesora.
- Repositorio sin traccion: 0 descargas y 0 likes, lo que reduce la probabilidad de validacion por terceros.
- Dependencia del demonio y del schema: el despliegue requiere `robotctl` y un `manifest.json` conforme al schema 2; cambios de version en el demonio pueden romper la carga.
- Comportamiento perpetuo: al ejecutarse hasta recibir orden contraria, exige supervision en entornos fisicos para evitar derivas o colisiones.
- Entrada en bruto: el normalizador esta embebido en `policy.onnx`; alimentar observaciones ya normalizadas produciria un comportamiento incorrecto.
- Busqueda web sin resultados utiles: los enlaces recuperados tratan del caldo japones dashi y no aportan informacion sobre el modelo; no se han podido verificar datos externos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261114
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Politica predecesora citada: https://huggingface.co/dashi/microduck-roller-remix-r900
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (sin URL publica confirmada)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio microduck (sin URL publica confirmada)
