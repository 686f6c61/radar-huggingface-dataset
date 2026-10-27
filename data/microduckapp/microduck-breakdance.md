# microduckapp/microduck-breakdance

## Resumen

microduck-breakdance es una política de control motora para el robot Microduck, distribuida por el autor microduckapp dentro del ecosistema de la aplicación MicroDuck y etiquetada con el tag `microduck-move`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de robótica que ejecuta una coreografía concreta de breakdance de 12,3 segundos, con giros a velocidad completa en ambos sentidos, head windmilling y un freeze marcado después de cada bloque.

El repositorio contiene únicamente tres artefactos declarados en la model card: `policy.onnx` (la política), `manifest.json` (los requisitos de instalación y reproducción en el pato) y `media/preview.mp4` (una previsualización del movimiento). La interfaz es explícita y muy compacta: 61 observaciones de entrada, 14 objetivos de articulación a la salida y una frecuencia de control de 50 Hz, es decir, un periodo de 20 ms por paso de inferencia.

Su relevancia es acotada pero concreta: ilustra el patrón de distribución de movimientos como políticas ONNX portables con un manifiesto de instalación asociado, un formato que permite añadir habilidades a un robot de bajo coste sin reentrenar ni tocar el firmware. El repositorio no incluye información sobre arquitectura, datos de entrenamiento, licencia ni evaluación, y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la topología de la red; solo se indica que es una política de control exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica (política de control paso a paso; no hay ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se distribuye `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` y `media/preview.mp4` |

Datos adicionales verificables en la ficha de HuggingFace: pipeline `robotics`, tags `onnx`, `robotics`, `microduck-move`, `region:us`; tamano del repo reportado como 0.0 GB (redondeo, no permite inferir el tamano real del artefacto); creado el 2026-10-27T01:25:06Z y actualizado el 2026-10-27T01:25:10Z.

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura de la red. La model card se limita a describir el contrato de entrada y salida (61 observaciones, 14 objetivos de articulación, 50 Hz) y la duración del movimiento (12,3 s). No se indica si se trata de un perceptrón multicapa, una política recurrente, una red de imitación o un controlador híbrido, ni el número de capas, el número de parámetros o el coste computacional por inferencia.

Tampoco hay datos sobre el proceso de entrenamiento: no se especifica el número de trayectorias de demostración, la fuente de los datos (captura de movimiento, teleoperación, simulación o aprendizaje por refuerzo), la composición del dataset, ni si se aplicaron técnicas de regularización, domain randomization o ajuste sim2real. La única inferencia posible a partir de los datos públicos es aritmética: a 50 Hz, una rutina de 12,3 s equivale a unos 615 pasos de control. No se detalla la composición de las 61 observaciones (posiciones articulares, velocidades, IMU, contacto) ni las unidades o rangos de las 14 salidas, lo que impide reimplementar el entorno de observación a partir de la información disponible.

## Capacidades

- Ejecución de una rutina coreografiada de breakdance con una duración declarada de 12,3 s.
- Giros a velocidad completa en un sentido y en el contrario dentro de la misma secuencia.
- Head windmilling como elemento acrobático intermedio.
- Freeze marcado tras cada bloque de movimiento, según la descripción del autor.
- Control a 50 Hz con un contrato fijo de 61 entradas y 14 salidas articulares, adecuado para bucles de control en tiempo real.
- Distribución como política ONNX portable con manifiesto de instalación (`manifest.json`) para su carga en la aplicación MicroDuck.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, comportamiento agéntico ni capacidades multilingües: es una política motora de dominio único.

## Casos de uso

- Demostración de producto y contenido de marketing: el movimiento está pensado para lucirse en vídeo (existe `media/preview.mp4`), de modo que sirve para grabar demos del robot Microduck sin programar trayectorias manualmente.
- Prueba de humo de la cadena de despliegue: instalar `policy.onnx` y `manifest.json` en la aplicación y verificar de extremo a extremo que el robot carga el manifiesto, resuelve dependencias y reproduce la política a 50 Hz.
- Ensayo de estrés mecánico de los servos: los giros sostenidos a velocidad completa y los freezes bruscos someten a las articulaciones a picos de par y a cambios rápidos de consigna, útiles para medir temperatura, consumo y holgura del mecanismo.
- Validación de repetibilidad y seguimiento de trayectoria: al ser una política determinista sobre un contrato de observación fijo, permite repetir la misma secuencia N veces y cuantificar la desviación entre ejecuciones sobre el mismo hardware.
- Composición de repertorio: al estar empaquetado como `microduck-move` con manifiesto propio, puede encadenarse con otros movimientos del mismo ecosistema para construir una secuencia más larga o una rutina de exhibición.
- Comparación sim2real: si se dispone de un gemelo digital del Microduck, la política sirve como referencia para medir la brecha entre simulación y realidad en una tarea acrobática con dinámica rápida.
- Divulgación y docencia en robótica: ejemplo compacto y visual de cómo se distribuye una habilidad motora como artefacto ONNX con metadatos, útil en talleres introductorios de control y despliegue en robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de seguimiento de trayectoria, error de posición articular, tasa de éxito de la secuencia, consumo energético ni comparaciones con controladores de referencia. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existe validación externa reportada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el tamano del modelo ni el número de parámetros, y el tamano de repo reportado (0.0 GB) es un valor redondeado que no permite acotar el artefacto.
- GPU recomendadas: no disponibles. No se especifica hardware objetivo ni si la inferencia se ejecuta a bordo del robot o en un host externo.
- Cabe en GPU de consumo: no disponible como dato confirmado. Por el contrato de interfaz (61 entradas, 14 salidas, 50 Hz) y el formato ONNX, el perfil de cómputo es compatible con inferencia en CPU; no se dispone de cifras que lo confirmen para este artefacto concreto.
- Opciones de despliegue: ONNX Runtime es el runtime natural para un artefacto `.onnx`; la carga en el robot se realiza a través de `manifest.json` y la aplicación MicroDuck. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que son runtimes orientados a modelos de lenguaje.
- Latencia y throughput: el periodo de control es de 20 ms (50 Hz), lo que fija un presupuesto máximo de 20 ms por inferencia incluyendo lectura de sensores y escritura de consignas. No se publican latencias medidas ni margen real de cómputo.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables. El único conjunto de modelos de la misma categoría identificable es el resto de movimientos del ecosistema `microduck-move` del mismo autor, para los que no se han proporcionado fichas ni métricas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-breakdance | no disponible | no aplica | sin benchmarks publicados | no disponible | HuggingFace (0 descargas) |
| Otros movimientos `microduck-move` | no disponible | no aplica | no disponible | no disponible | no verificado en la informacion disponible |
| Políticas de locomoción para robots de bajo coste (categoría genérica) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial, redistribución ni modificación del artefacto. Es un bloqueo potencial para cualquier integración en producto.
- Falta de documentación técnica: sin arquitectura, dataset, proceso de entrenamiento ni métricas, no es posible evaluar la robustez ni reproducir la política.
- Riesgo físico: la secuencia incluye giros a velocidad completa, head windmilling y freezes bruscos; su ejecución sobre hardware real requiere supervisión, espacio libre y topes de par, y puede dañar servos o el propio robot.
- Acoplamiento al hardware Microduck: la política está entrenada para una morfología y un conjunto de 14 articulaciones concretos; no hay garantía de transferencia a otras plataformas ni de robustez frente a desgaste, carga de batería o cambios de fricción.
- Contrato de observación no documentado: se desconoce la composición y el orden de las 61 entradas, lo que impide reimplementar el entorno o auditar el comportamiento fuera de la aplicación oficial.
- Sin validación comunitaria: 0 descargas y 0 likes; no hay informes independientes de funcionamiento ni de fallos.
- Riesgo de sobreajuste a condiciones de grabación: al ser una coreografía de 12,3 s, es esperable que el rendimiento se degrade fuera de las condiciones de la demostración, aunque no se aportan datos que lo confirmen o lo descarten.
- Metadatos a verificar: la fecha de creación declarada (2026-10-27) y el tamano de repo (0.0 GB) son valores anómalos o redondeados que conviene contrastar antes de tomar decisiones de integración.
- No aplica riesgo de alucinación ni sesgos lingüísticos en el sentido habitual de los modelos de lenguaje, pero tampoco se documentan sesgos de comportamiento motor ni evaluación de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/microduckapp/microduck-breakdance
- Paper: no disponible
- Blog o documentación del autor: no disponible
- Repositorio de código: no disponible
- Demo: `media/preview.mp4` dentro del propio repositorio de HuggingFace
- Nota sobre la busqueda web: los resultados devueltos (hilos del foro Digital Spy sobre Strictly Come Dancing, comentaristas deportivos, TalkRadio, consejos y telefonía móvil) no guardan relación con el modelo y no aportan enlaces relevantes.
