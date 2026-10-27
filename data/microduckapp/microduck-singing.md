# microduckapp/microduck-singing

## Resumen

`microduck-singing` es una política de movimiento (motion policy) publicada en HuggingFace por el usuario `microduckapp` dentro de la familia de comportamientos `microduck-move`, asociada a la app de MicroDuck. No es un modelo de lenguaje ni un modelo fundacional: es un artefacto de control que reproduce una coreografía de 10,5 segundos en el robot bípedo MicroDuck, descrita por el autor como «una balada: inspiración profunda, cabeza echada hacia atrás en las notas largas, estribillo meciéndose y una gran nota final». El repositorio contiene `policy.onnx` (la política), `manifest.json` (los requisitos de instalación y reproducción en el robot) y `media/preview.mp4` (la previsualización).

Técnicamente, la política mapea 61 observaciones de entrada a 14 objetivos articulares de salida a 50 Hz, lo que sitúa el bucle de control en pasos de 20 ms y la secuencia completa en unas 525 inferencias. El formato de publicación es ONNX, lo que permite ejecutar el modelo con ONNX Runtime sin depender del framework de entrenamiento original, y el `manifest.json` actúa como contrato de instalación para que la app MicroDuck sepa qué desplegar y cómo reproducirlo.

Su relevancia es la del ecosistema en el que se inserta: MicroDuck es un robot bípedo de 25 cm y 15 motores, con cámara, LiDAR y pico prensil, que Pollen Robotics vende por 399 USD en preventa y cuyo stack es abierto, lo que permite entrenar comportamientos en simulación y ejecutarlos en el robot físico. Este repositorio ejemplifica ese flujo: una habilidad corta, empaquetada como política ONNX y distribuida como un artefacto instalable, no como código de entrenamiento. La información pública disponible sobre arquitectura interna, datos de entrenamiento y métricas es, sin embargo, prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control exportada a ONNX; topología interna (capas, tipo de red) no disponible |
| Parametros totales | no disponible (el modelo no publica recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la «ventana» es de 61 observaciones por paso) |
| Tipos de cuantizacion | no disponible; el artefacto distribuido es un único `policy.onnx` sin variantes cuantizadas declaradas |
| Idiomas soportados | no aplica / no disponible (modelo de control motriz, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Entradas de la política | 61 observaciones |
| Salidas de la política | 14 objetivos articulares (joint targets) |
| Frecuencia de control | 50 Hz (paso de 20 ms) |
| Duración de la secuencia | 10,5 s (aprox. 525 pasos de inferencia) |
| Ficheros del repositorio | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Pipeline declarado en HuggingFace | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La única información verificable es la interfaz de la política: 61 observaciones de entrada, 14 objetivos articulares de salida y 50 Hz, empaquetada en ONNX. El autor no documenta el tipo de red (MLP, política recurrente, transformer pequeño), el número de capas ni el número de parámetros. Tampoco se indica si la política fue entrenada con aprendizaje por refuerzo en simulación, con imitación de demostraciones o con una combinación de ambos, ni si existe una etapa de ajuste en el robot real. La etiqueta `microduck-move` sugiere que forma parte de un formato común de comportamientos para el mismo robot, pero no se detalla el pipeline de conversión a ONNX ni las versiones de las herramientas empleadas.

No hay información sobre volumen de datos de entrenamiento, composición del dataset, proceso de recompensas, técnicas de domain randomisation para el salto sim-to-real, ni sobre si la política incorpora observaciones proprioceptivas, de IMU, de contacto o de visión. Tampoco se documenta ningún mecanismo de seguridad (límites de par, clipping de acciones, parada ante caída) ni innovación técnica destacable. Cualquier afirmación sobre estas cuestiones sería especulativa y no debe asumirse al integrar el artefacto en producción.

## Capacidades

- Reproducción de una coreografía pregrabada de 10,5 s en el robot MicroDuck, con control en bucle cerrado a 50 Hz.
- Generación de 14 consignas articulares por paso de control, consumibles por el stack de control del robot.
- Instalación y reproducción mediante un `manifest.json` que declara lo que el robot necesita instalar y cómo ejecutarlo.
- Distribución portable en formato ONNX, ejecutable con ONNX Runtime sin el framework de entrenamiento original.
- Encaje en la familia de comportamientos `microduck-move`, que agrupa otras habilidades del mismo robot publicadas por el mismo autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes, planificación multi-paso ni razonamiento.
- No se documenta capacidad multilingüe, de visión, de audio ni de generación de texto.
- No se documenta modo «thinking» ni ninguna capacidad cognitiva: es exclusivamente una política motriz.
- La sincronización con voz cantada no forma parte del artefacto: el repositorio solo contiene el movimiento, no audio ni modelo de voz.

## Casos de uso

- Demostración de producto en ferias y eventos: la secuencia de 10,5 s sirve como pieza de atracción reproducible y de duración controlada, instalable en cualquier unidad mediante el `manifest.json` sin reentrenar nada.
- Validación del pipeline de instalación de habilidades: usar `microduck-singing` como caso de prueba de extremo a extremo del flujo `manifest.json` → descarga → ejecución a 50 Hz en el robot, antes de desplegar políticas propias.
- Pruebas de integración del runtime ONNX en el robot: al ser un artefacto pequeño (repositorio de 0.0 GB) y con interfaz fija (61→14), es adecuado para medir latencia real de inferencia y jitter del bucle de control a 20 ms por paso.
- Contenido audiovisual y comunicación: el `media/preview.mp4` y la secuencia permiten generar material grabado del robot en una acción reconocible, útil para notas de prensa o publicaciones del proyecto.
- Docencia y divulgación en robótica: sirve para ilustrar cómo una habilidad entrenada se empaqueta como política y se distribuye, separando el artefacto de ejecución del código de entrenamiento.
- Base para experimentos de retargeting o ajuste fino: la política puede emplearse como punto de partida o como referencia de trayectoria para entrenar variantes con otro estilo, otra duración o mayor robustez ante perturbaciones.
- Pruebas de seguridad y desgaste mecánico: ejecutar repetidamente una secuencia de 10,5 s con movimientos amplios de cabeza y balanceo permite medir temperatura de actuadores, consumo y desgaste en banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos objetivos publicados son de interfaz y temporización: 61 observaciones de entrada, 14 salidas articulares, 50 Hz y 10,5 s de duración. No hay métricas de seguimiento de trayectoria, error de posición, tasa de caídas, robustez ante empujes, latencia medida en hardware ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0.0 GB) y la interfaz 61→14, es esperable que la política quepa en memoria muy reducida y pueda ejecutarse en CPU, pero el autor no publica cifras.
- GPU: no se documenta ninguna GPU necesaria; no hay indicios de que se requiera aceleración por GPU para la inferencia.
- GPU de consumo: no aplica según la información disponible; el despliegue previsible es en la computación embebida del propio robot o en un host conectado.
- Robot de destino: MicroDuck, bípedo de 25 cm con 15 motores, cámara, LiDAR y pico prensil, según la documentación de Pollen Robotics.
- Despliegue: ONNX Runtime es el runtime implícito del formato publicado; vLLM, llama.cpp, TGI y Ollama no aplican a este artefacto.
- Presupuesto de latencia: 20 ms por paso de control si se respeta la frecuencia declarada de 50 Hz; no se publica latencia medida ni throughput.
- Almacenamiento: el repositorio ocupa 0.0 GB, por lo que el coste de distribución es despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas/salidas | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-singing | Política de movimiento ONNX (10,5 s) | 61 → 14 | 50 Hz | no disponible | HuggingFace, 0 descargas |
| microduck-midnight-snack | Política de movimiento ONNX (misma familia `microduck-move`) | no disponible | no disponible | no disponible | HuggingFace, misma organización |
| Otras habilidades de `microduckapp` (16 modelos en la organización según la búsqueda) | Políticas de movimiento para MicroDuck | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos públicos de arquitectura, parámetros, contexto ni rendimiento de las alternativas, por lo que la comparación cuantitativa no es posible. Fuera de la familia `microduck-move`, no se ha identificado en la información proporcionada un modelo comparable con cifras publicadas.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación; es un bloqueo potencial para cualquier integración en producto.
- Ausencia total de ficha de datos: no se documentan dataset, proceso de entrenamiento ni evaluación, lo que impide estimar robustez, sesgos de comportamiento o generalización a otros entornos.
- Riesgo de sim-to-real no cuantificado: al no publicarse si hubo entrenamiento en simulación ni técnicas de randomización, no puede anticiparse el comportamiento ante cambios de fricción, iluminación o superficie.
- Desajuste aparente de dimensiones: la política emite 14 objetivos articulares mientras la documentación del robot menciona 15 motores; no se aclara qué articulación queda fuera del control de la política ni si el `manifest.json` lo compensa. Verificar antes de desplegar.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y repositorio de 0.0 GB, lo que sugiere un artefacto recién publicado y sin contraste externo.
- Fecha de creación anómala (2026-10-27) en los metadatos de HuggingFace; conviene comprobar la vigencia y posibles actualizaciones del repositorio.
- Naturaleza no generativa: no debe emplearse para tareas de texto, razonamiento, código o visión; su interfaz es exclusivamente numérica (observaciones → consignas articulares).
- Movimientos amplios de cabeza y balanceo durante 10,5 s: sin documentación de límites de par, clipping de acciones o parada de emergencia, es recomendable ejecutar primero en banco con el robot suspendido.
- Idiomas no aplicables, pero la documentación y el `manifest.json` no detallan versiones mínimas de firmware o de la app MicroDuck necesarias para la reproducción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-singing
- Organización del autor en HuggingFace: https://huggingface.co/microduckapp
- Repositorio del robot MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página de producto de MicroDuck: https://pollen-robotics.com/microduck/
- Artículo sobre la voz cantada generada por unidad: https://semasocial.com/blog/each-microduck-can-also-sing-with-its-own-unique-generated-voice
- Nota de prensa sobre el robot de 400 USD: https://robottoday.com/industry-briefing/hugging-face-introduces-400-microduck-robot-capable-of-singing-and-skating/11723
