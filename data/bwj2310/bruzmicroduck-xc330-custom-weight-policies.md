# BWJ2310/bruzmicroduck-xc330-custom-weight-policies

## Resumen

BruzMicroduck XC330 es un conjunto de diez políticas de control para robot cuadrúpedo, publicadas por el usuario BWJ2310 en formato ONNX y distribuidas a través de la librería `microduck`. No se trata de un modelo de lenguaje, sino de un paquete de políticas entrenadas por refuerzo que traducen 61 observaciones de sensores en 14 acciones de servo a 50 Hz, pensadas para el hardware concreto de BruzMicroduck (servos XC330-T181, batería de 250 g, soporte de alimentación de 52 g y bus de servos a 7 V).

La relevancia del artefacto está en su formato de entrega: cada grafo ONNX incorpora la normalización de observaciones, de modo que el controlador puede alimentarse directamente con las lecturas crudas del robot sin una capa de preprocesado externa. Las políticas se dividen en perpetuas (`walk`, `walk_stand`, `stand`, `roller`), guionizadas (`sit_stand`) y episódicas (`ground_pick`, `crouch`, `roulade`, `kick_left`, `kick_right`), lo que permite conmutar comportamientos según el comando de alto nivel.

El repositorio no declara idiomas, no tiene descargas ni likes y no publica métricas de rendimiento. Se instala como un conjunto inmutable mediante un flujo de actualización con etiqueta numérica y un manifiesto que carga los diez ficheros en bloque; el autor advierte explícitamente de que no debe cargarse como un modelo comunitario de política única.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de control exportada a ONNX (topología interna no disponible; no es un transformer ni un LLM) |
| Parámetros totales | No disponible (tamaño del repositorio: 0.0 GB, por debajo del límite de redondeo de la plataforma) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantización | No disponible; los grafos ONNX llevan la normalización de observaciones integrada |
| Idiomas soportados | No aplica (políticas de control robótico, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (10 ficheros: `walk.onnx`, `walk_stand.onnx`, `stand.onnx`, `roller.onnx`, `sit_stand.onnx`, `ground_pick.onnx`, `roller_crouch.onnx`, `forward_roll.onnx`, `kick_left.onnx`, `kick_right.onnx`) |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Frecuencia de control | 50 Hz (presupuesto de 20 ms por ciclo) |
| Hardware objetivo | Servos XC330-T181, batería de 250 g, soporte de alimentación de 52 g, bus de servos a 7 V |
| Librería de despliegue | `microduck` |
| Pipeline declarado | robotics |
| Número de políticas incluidas | 10 |

## Arquitectura y entrenamiento

El repositorio etiqueta el artefacto como `reinforcement-learning`, lo que indica que las políticas se obtuvieron mediante aprendizaje por refuerzo y se congelaron después en grafos ONNX para inferencia determinista. La información disponible no especifica la familia de red empleada (por ejemplo, MLP o red recurrente), el algoritmo de entrenamiento (PPO, SAC u otro), el número de parámetros, la composición del dataset, el simulador utilizado ni si hubo fases de ajuste fino o destilación. Todos estos datos deben considerarse no disponibles.

La innovación práctica declarada es doble. Por un lado, la normalización de observaciones está incrustada en cada grafo ONNX, de forma que el consumidor entrega valores de sensor sin tratar y la propia política los escala. Por otro, el paquete se organiza como un conjunto coherente de diez comportamientos con un manifiesto común, lo que evita el escenario habitual de mezclar políticas sueltas de distinta procedencia y garantiza que todas comparten el mismo espacio de observación y acción.

## Capacidades

- Locomoción continua: `walk` y `walk_stand` generan marcha sostenida a partir de las 61 observaciones y los 14 comandos de servo.
- Postura estática: `stand` mantiene al robot de pie de forma perpetua.
- Giro sobre el eje: `roller` ejecuta rotación continua.
- Transición guionizada: `sit_stand` sigue una secuencia predefinida de sentarse y levantarse.
- Manipulación episódica con el cuerpo: `ground_pick` recoge un objeto del suelo y `crouch` (fichero `roller_crouch.onnx`) agacha al robot.
- Acrobacia episódica: `roulade` (fichero `forward_roll.onnx`) ejecuta una voltereta hacia delante.
- Patadas direccionales: `kick_left` y `kick_right` como acciones episódicas independientes.
- Control en lazo cerrado a 50 Hz, adecuado para realimentación rápida con los servos XC330-T181.
- Normalización de observaciones integrada en el grafo, sin preprocesado externo.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Demostración de locomoción de un cuadrúpedo de pequeño tamaño: desplegar `walk.onnx` sobre el BruzMicroduck permite exhibir marcha estable en ferias, aulas o vídeos de producto sin entrenar una política desde cero.
- Investigación en transferencia sim-a-real: las políticas sirven como línea base congelada para comparar el comportamiento real del robot frente al simulado y medir la brecha de dominio.
- Conmutación de comportamientos por máquina de estados: un controlador de alto nivel puede encadenar `stand` → `walk` → `roulade` → `stand` seleccionando el grafo correspondiente según la fase de la tarea.
- Interacción física episódica: `kick_left` y `kick_right` permiten tareas tipo juguete o competición (golpear un balón ligero) sin diseñar controladores articulares manuales.
- Recogida de objetos del suelo: `ground_pick` cubre tareas de pick-and-place corporal en entornos de laboratorio donde el robot no dispone de pinza.
- Validación de firmware y servos: usar `stand` y `walk` como carga repetible para verificar el bus a 7 V, el consumo y la respuesta de los servos XC330-T181 tras un cambio de hardware.
- Material docente de aprendizaje por refuerzo: el conjunto ilustra el ciclo completo de entrenamiento, exportación a ONNX y despliegue de un paquete de políticas con manifiesto e instilación por etiqueta inmutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La inferencia no está pensada para GPU: son políticas de control ejecutadas en el ordenador de a bordo mediante el runtime de ONNX.
- El repositorio ocupa 0.0 GB (por debajo del umbral de redondeo de la plataforma), por lo que el conjunto completo de diez grafos es de muy pocos megabytes y cabe holgadamente en almacenamiento embebido.
- VRAM estimada: no aplica; se ejecuta en CPU o en un microcontrolador con soporte ONNX.
- Restricción temporal crítica: el lazo a 50 Hz impone un presupuesto de 20 ms por ciclo, que debe cubrir la lectura de sensores, la inferencia y el envío de los 14 comandos de servo.
- GPU recomendadas: no aplica. Para depuración en banco puede usarse cualquier CPU moderna; no se recomienda NVIDIA A100, H100 ni RTX 4090 por ser innecesarias.
- Opciones de despliegue: runtime de ONNX sobre la librería `microduck`, instalando el conjunto mediante una etiqueta numérica inmutable y el manifiesto que carga los diez ficheros juntos.
- Latencia y throughput exactos: no disponibles. Únicamente se conoce la cota de 20 ms por iteración derivada de la frecuencia de control declarada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otras políticas de locomoción comparables (por ejemplo, conjuntos de políticas para Unitree, ANYmal u otros cuadrúpedos), ni datos de parámetros, contexto o licencia de alternativas que permitan una comparación verificable.

## Limitaciones y advertencias

- Acoplamiento estricto al hardware: las políticas están entrenadas para servos XC330-T181, batería de 250 g, soporte de alimentación de 52 g y bus a 7 V. Cambiar cualquiera de estos elementos invalida el comportamiento esperado.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling, visión, audio ni razonamiento simbólico.
- El autor advierte de que el repositorio no debe cargarse como un modelo comunitario de política única; hay que instalarlo como conjunto completo mediante el manifiesto.
- La normalización de observaciones está incluida en el grafo: si el integrador aplica una normalización propia antes de la inferencia, se producirá una doble normalización y el comportamiento se degradará.
- Riesgo de brecha sim-a-real: no se documentan métricas de robustez ante terreno irregular, empujes externos o desgaste de servos.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, por lo que no existen informes independientes de funcionamiento.
- Ausencia total de benchmarks: no hay datos publicados de éxito de tarea, estabilidad, consumo energético ni tasa de caídas.
- Licencia Apache 2.0: permite uso comercial y modificación con conservación de avisos, pero se distribuye sin garantías y el autor no ofrece soporte declarado.
- Fecha de creación y actualización registradas en 2026-10-10, sin historial de versiones documentado en la información disponible.
- No se declaran idiomas soportados porque la noción no aplica a este tipo de artefacto.

## Enlaces

- HuggingFace: https://huggingface.co/BWJ2310/bruzmicroduck-xc330-custom-weight-policies
- No se han encontrado en la búsqueda web papers, blogs, repositorios auxiliares ni demos adicionales asociados a este modelo.
