# qualiadev/microduck-hill-q4

## Resumen

Qualia Fast (identificador `qualiadev/microduck-hill-q4`) es una política de control para robótica, no un modelo de lenguaje. Se trata de un controlador entrenado mediante aprendizaje por refuerzo que genera una marcha perpetua para el robot microduck de Pollen Robotics, un robot de pequeño tamaño. La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, ejecutándose de forma continua hasta que el operador la detiene. El autor del repositorio es el usuario `qualiadev`.

El modelo se distribuye en formato ONNX (`policy.onnx`) y se carga directamente en el robot mediante el comando `robotctl policy load`, con el normalizador de observaciones ya integrado en el grafo, de modo que se le pueden pasar observaciones en crudo. El repositorio tiene un tamaño declarado de 0.0 GB, sin descargas ni valoraciones en el momento de la consulta, y no incluye datos sobre licencia ni idiomas, algo esperable en un artefacto de control robótico.

La relevancia de esta ficha es limitada en términos de ecosistema general, ya que se trata de un artefacto muy específico del stack microduck, pero es representativo de un patrón emergente: políticas de RL empaquetadas como ONNX y desplegables en hardware embebido a través de un daemon de políticas con ranuras (*slots*). No hay información pública sobre arquitectura interna, número de parámetros ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de política entrenada por RL, exportada a ONNX; topología no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo generativo de texto; es una política de control por observación-acción) |
| Tipos de cuantizacion | no disponible (el sufijo `-q4` del identificador sugiere cuantización de 4 bits, sin confirmar en la ficha) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con normalizador de observaciones embebido; metadatos en `manifest.json` según esquema 2 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna de la política. Por el contexto (observación de 61 dimensiones, 14 acciones, 50 Hz) se trata de una red de política compacta típica de tareas de control motor, pero la ficha no especifica número de capas, tipo de red (MLP, recurrente u otra) ni dimensión de las capas ocultas. El formato de salida es ONNX, lo que indica que el modelo fue exportado desde un framework de entrenamiento para su ejecución en inferencia nativa, con el normalizador de observaciones fusionado dentro del propio grafo.

El entrenamiento se realizó sobre el repositorio `pollen-robotics/microduck_rl`, en la rama `sprint/race`, commit `0141bf4a8`. No se documentan el número de pasos de entrenamiento, la composición del entorno, la función de recompensa, ni si se aplicaron técnicas de ajuste posteriores como destilación o regularización específica. La política se describe como "perpetua": una vez cargada en una ranura, se ejecuta de forma continua generando una marcha cíclica (aunque no se detalla si la marcha es un patrón fijo o responde a observaciones en tiempo real).

## Capacidades

- Generación de una marcha de locomoción perpetua para el robot microduck.
- Consumo de observaciones de 61 dimensiones como entrada del espacio de estado.
- Producción de 14 acciones de control a una frecuencia de 50 Hz.
- Normalización de observaciones integrada en el grafo ONNX (acepta observaciones en crudo).
- Despliegue mediante carga en una ranura de política del daemon `robotctl`.
- Ejecución continua hasta detención explícita por parte del operador.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni capacidades multilingües.
- No se documenta soporte de *tool calling*, agentes ni razonamiento multi-paso.

## Casos de uso

- Control de locomoción del robot microduck: la política se carga en una ranura y el robot camina de forma continua sin intervención, adecuada para demostraciones de marcha en ferias o laboratorios.
- Experimentación en aprendizaje por refuerzo robótico: sirve como política de referencia sobre la que comparar nuevas variantes entrenadas en `microduck_rl`.
- Pruebas de integración del daemon `robotctl`: al seguir el esquema 2 de manifiesto, es útil para validar el flujo de carga de políticas en el software del robot.
- Investigación en control a 50 Hz: el diseño de observación-acción a esa frecuencia permite estudiar estabilidad y latencia en bucles de control embebidos.
- Base para *fine-tuning* o continuación de entrenamiento: al proceder de una rama concreta del repo de RL, puede servir como punto de partida para nuevas políticas de marcha.
- Educación y prototipado en robótica de bajo coste: al ser un artefacto ONNX pequeño, es desplegable en el hardware del propio robot sin infraestructura de servidor.
- Validación de pipelines de exportación ONNX en robótica: útil como caso de prueba de flujos de exportación con preprocesado embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del modelo no incluye métricas de recompensa, tasa de éxito, velocidad de marcha ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- No se documentan requisitos de VRAM ni de GPU en la información proporcionada.
- Por el contexto de despliegue (robot microduck y formato ONNX con bucle a 50 Hz), se asume inferencia en CPU embebida del propio robot, lo que implica un presupuesto de cómputo por inferencia inferior a 20 ms; esta cifra se deriva de la frecuencia declarada y no de una medición publicada.
- No se confirma compatibilidad con GPU de datacenter (A100, H100) ni con GPU de consumo (RTX 4090), ya que el modelo no está pensado para ese tipo de despliegue.
- Opciones de despliegue conocidas: el daemon del robot microduck mediante `sudo robotctl policy load <slot> qualiadev/microduck-hill-q4`, con ejecución ONNX en el dispositivo.
- No se dispone de datos de latencia ni de throughput medidos.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otras políticas de microduck ni de políticas de locomoción comparables, por lo que no es posible establecer una comparación cuantitativa de parámetros, contexto, rendimiento o licencia. La única referencia contextual es que esta política procede del repositorio `pollen-robotics/microduck_rl`, que podría albergar otras políticas, pero no se ofrecen datos de las mismas.

## Limitaciones y advertencias

- No hay datos sobre sesgos, pero al ser una política de control robótico, el riesgo relevante no es el sesgo cognitivo sino el fallo de control (caídas, inestabilidad de la marcha).
- El repositorio declara un tamaño de 0.0 GB, sin descargas ni valoraciones: el artefacto no ha sido validado públicamente.
- No se especifica la licencia, lo que impide determinar si su uso comercial está permitido; debe tratarse como restringido hasta confirmación del autor.
- No se documentan los idiomas ni el ámbito de aplicación geográfica, algo irrelevante para una política de control pero que confirma la ausencia de metadatos completos.
- El sufijo `-q4` sugiere cuantización de 4 bits, pero la ficha no lo confirma; una cuantización agresiva podría degradar la precisión de las acciones en comparación con el modelo original.
- La política se describe como "perpetua": no se documenta cómo se detiene de forma segura ni qué ocurre ante observaciones fuera de distribución.
- No hay información sobre el entorno de entrenamiento, por lo que se desconoce el dominio de validez (tipos de terreno, condiciones) donde la marcha se mantiene estable.
- La fecha de creación del repositorio (2026-10-12) es posterior a la fecha actual de referencia, lo que puede indicar un error en los metadatos o un artefacto de prueba.
- Para producción, la ausencia de licencia, de benchmarks y de soporte de mantenimiento son bloqueantes claros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualiadev/microduck-hill-q4
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `sprint/race`, commit `0141bf4a8`
- Documentación del manifiesto de políticas (esquema 2): `docs/policy-manifest.md` en el repositorio del daemon de políticas microduck
