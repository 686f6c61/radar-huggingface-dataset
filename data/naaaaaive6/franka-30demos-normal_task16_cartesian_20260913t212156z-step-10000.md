# NaaaaaiVe6/franka-30demos-normal_task16_cartesian_20260913T212156Z-step-10000

## Resumen

El modelo identificado como `NaaaaaiVe6/franka-30demos-normal_task16_cartesian_20260913T212156Z-step-10000` es un checkpoint de política robótica del tipo vision-language-action (VLA), publicado por el usuario NaaaaaiVe6 en HuggingFace bajo la librería `openpi` y la etiqueta `pi05`. Se trata de un ajuste fino orientado a una única tarea de manipulación (denominada `task16`) sobre un brazo Franka, entrenado a partir de 30 demostraciones y exportado en el paso 10000 del entrenamiento. El repositorio ocupa 7,2 GB y contiene pesos en formato safetensors.

La característica diferencial de este checkpoint es su representación de acciones: salidas en cartesiano absoluto (XYZ + cuaternión xyzw + pinza binaria -1/+1), en lugar de las acciones delta típicas de un controlador. Esto condiciona por completo su integración: exige usar el fichero `assets/franka/norm_stats.json` incluido y las transformaciones de entrenamiento correspondientes. Los pesos se han convertido de JAX a PyTorch en bfloat16 manteniendo la configuración original del modelo de entrenamiento sobre Franka.

El modelo tiene 3.616.757.520 parámetros (~3,6 mil millones) y genera secuencias de 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras corresponden a acciones reales del robot. No se han publicado resultados de benchmarks, licencia ni idiomas soportados, y el repositorio no tiene descargas ni valoraciones, por lo que debe considerarse un artefacto experimental sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia openpi; etiqueta `pi05`. Detalles internos de capas no disponibles |
| Parametros totales | 3.616.757.520 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (safetensors). No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PyTorch bfloat16, convertido desde JAX) |
| Salidas del modelo | 50 pasos × 32 coordenadas (solo las 8 primeras son acciones del robot) |
| Representacion de acciones | Cartesiano absoluto XYZ + cuaternion xyzw + pinza binaria (-1/+1) |
| Libreria | openpi |
| Tamano del repositorio | 7,2 GB |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia `openpi` (etiqueta `pi05`) y su naturaleza de modelo vision-language-action. Se sabe que procesa entradas de cámara y estado del robot, y que produce un chunk de acciones de 50 pasos con 32 coordenadas por paso, donde únicamente las ocho primeras son acciones efectivas del brazo. Los pesos originales estaban en JAX y se han convertido a PyTorch en bfloat16 conservando la configuración del modelo de entrenamiento sobre Franka.

El entrenamiento se realizó sobre 30 demostraciones de una única tarea (`task16`) y este artefacto corresponde al paso 10000. El propio autor advierte que es necesario leer `log.txt` para conocer el layout de salida, la frontera de normalización, las entradas de cámara y estado, y las convenciones del controlador que requieren confirmación. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO, algo por otra parte poco habitual en políticas robóticas.

## Capacidades

- Generación de comandos motores para un brazo Franka: emite trayectorias de 50 pasos con 8 coordenadas de acción por paso (posición cartesiana absoluta, orientación en cuaternión y estado de pinza).
- Percepción visual y de estado: el modelo consume entradas de cámara y estado del robot, según indica la model card.
- Ejecución de una tarea concreta de manipulación (`task16`) aprendida de 30 demostraciones.
- Normalización integrada: incluye `assets/franka/norm_stats.json` para revertir la normalización de las acciones; sin él las salidas no son utilizables.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning simbólico ni capacidades multilingües.
- No se documentan modos especiales (thinking mode, audio, visión generalista fuera del contexto robótico).

## Casos de uso

- Manipulación pick-and-place sobre Franka: el modelo genera directamente la pose cartesiana objetivo y el estado de pinza para cada uno de los 50 pasos del chunk, lo que permite ejecutar la tarea `task16` en bucle cerrado reenviando observaciones en cada ciclo.
- Evaluación y reproducción de experimentos de investigación: sirve como punto de referencia del paso 10000 para comparar curvas de entrenamiento, ya que el nombre del checkpoint codifica tarea, representación de acciones y paso.
- Reentrenamiento o fine-tuning posterior: al estar en safetensors/PyTorch, puede cargarse con la librería `openpi` y continuar el ajuste con nuevas demostraciones de la misma tarea o de tareas relacionadas.
- Integración en un pipeline de control ROS 2: las acciones cartesianas absolutas se traducen a comandos del controlador del Franka; requiere respetar la convención de cuaternión xyzw y la normalización del fichero de estadísticas.
- Validación de la cadena de normalización y transformaciones: útil para verificar que las transforms de entrenamiento y el `norm_stats.json` se aplican correctamente antes de desplegar cualquier política derivada.
- Depuración de representaciones de acción: permite estudiar en la práctica la diferencia entre control cartesiano absoluto y control por deltas, ya que el autor advierte explícitamente de que no son acciones delta de controlador.
- Replicación de estudios de escalado de datos: con solo 30 demostraciones, es un ejemplo claro para analizar sobreajuste y generalización en políticas VLA de tarea única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de éxito de tarea, tasas de agarre, ni comparaciones con otras políticas, y tampoco registra descargas o valoraciones que permitan inferir validación por parte de la comunidad.

## Requisitos de hardware

- Peso de los pesos en bfloat16: aproximadamente 7,2 GB, coincidiendo con el tamaño del repositorio.
- VRAM estimada para inferencia: del orden de 10-16 GB considerando pesos, codificador visual, estado y buffers de activaciones (estimación, no confirmada por el autor).
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegue en laboratorio; RTX 4090 o RTX 3090 (24 GB) para uso en estación de trabajo.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 24 GB; en tarjetas de 16 GB puede ser ajustado y requerir reducir precisión o lotes.
- Opciones de despliegue: la librería `openpi` con PyTorch es la vía prevista. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje con interfaz de texto.
- Latencia y throughput: no disponibles. Debe tenerse en cuenta que cada inferencia produce un chunk de 50 pasos de acción, por lo que la frecuencia de control depende del tiempo de cómputo completo del chunk.
- Almacenamiento: al menos 7,2 GB libres solo para los pesos, más el dataset y los assets de normalización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (franka-30demos-normal_task16_cartesian) | 3,6 B | No disponible | VLA de tarea unica sobre Franka | No disponible | HuggingFace, 0 descargas |
| Familia openpi / pi05 (modelos base) | No disponible en la informacion proporcionada | No disponible | VLA generalista sobre la que se ajusta este checkpoint | No disponible | Repositorio openpi |
| Otros checkpoints del mismo autor (otras tareas/pasos) | No disponible | No disponible | VLA de tarea unica | No disponible | HuggingFace |

No se dispone de datos verificados en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas como OpenVLA o GR00T N1; cualquier cifra al respecto requeriría consultar la documentación oficial de esos proyectos y no se incluye aquí para no introducir datos no confirmados.

## Limitaciones y advertencias

- Especialización extrema: entrenado con 30 demostraciones de una única tarea (`task16`). La probabilidad de generalizar a otras tareas, objetos o posiciones es baja y no está documentada.
- Riesgo de sobreajuste: 30 demostraciones y 10000 pasos de entrenamiento apuntan a un ajuste fuerte sobre el dataset, sin métricas publicadas de éxito en robot real.
- Incompatibilidad de representación: las salidas son cartesiano absoluto con cuaternión xyzw y pinza binaria, explícitamente NO acciones delta de controlador. Enviarlas a un controlador que espera deltas producirá movimientos incorrectos o inseguros.
- Frontera de normalización crítica: sin `assets/franka/norm_stats.json` y las transforms de entrenamiento correspondientes, las salidas no son interpretables.
- Solo 8 de las 32 coordenadas son acciones: usar las restantes como comandos es un error de interpretación.
- Convenciones del controlador sin confirmar: el propio autor indica que hay convenciones "requiring confirmation", lo que implica riesgo operativo.
- Licencia no disponible: no se puede asumir uso comercial. Al no declararse licencia, los derechos de uso quedan en un limbo legal.
- Idiomas no disponibles: no aplica una evaluación multilingüe, pero tampoco hay documentación sobre instrucciones en lenguaje natural.
- Sin benchmarks ni validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Riesgo físico: cualquier despliegue en un brazo real debe hacerse con límites de par, paradas de emergencia y validación en simulación previa.
- Alucinación en el sentido de trayectorias erróneas: un VLA puede generar secuencias plausibles pero físicamente inviables; no existe señal de confianza documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task16_cartesian_20260913T212156Z-step-10000
- Fichero de registro referenciado por el autor: `log.txt` (dentro del repositorio del modelo)
- Estadísticas de normalización: `assets/franka/norm_stats.json` (dentro del repositorio del modelo)
- Librería declarada: openpi (repositorio de Physical Intelligence; consultar la documentación oficial del proyecto para la carga de pesos y las transforms)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación con el artefacto.
