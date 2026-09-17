# NaaaaaiVe6/franka-30demos-normal_task2_cartesian_20260913T212156Z-step-6000

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenada con la librería openpi y etiquetada como `pi05`, publicado por el usuario NaaaaaiVe6. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado al control de un brazo Franka, no de un modelo de lenguaje: su salida son comandos motores, no texto. El checkpoint corresponde al paso 6000 de entrenamiento y fue convertido desde JAX a PyTorch en `bfloat16` manteniendo la configuración de entrenamiento original del modelo Franka.

El modelo tiene 3.616.757.520 parámetros reales (aproximadamente 3,62 mil millones), según los pesos en safetensors, y el repositorio ocupa 7,2 GB. La representación de acciones es cartesiana absoluta: XYZ + cuaternión xyzw + pinza binaria (-1/+1), es decir, no son incrementos (deltas) del controlador. La salida tiene 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras corresponden a acciones reales del robot.

Es relevante ahora porque forma parte del ecosistema de políticas VLA abiertas para manipulación, un área donde la mayoría de checkpoints publicados son modelos base generalistas y escasean los checkpoints específicos de tarea con representación de acciones documentada y estadísticas de normalización incluidas. Su utilidad práctica está acotada: está entrenado para una tarea concreta (`task2`) a partir de 30 demostraciones, y el propio autor advierte de que las convenciones del controlador requieren confirmación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `pi05` dentro de la librería openpi; la model card no detalla el backbone ni el cabezal de acciones) |
| Parametros totales | 3.616.757.520 (aproximadamente 3,62 mil millones), según safetensors |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica; no se especifica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible oficialmente; los pesos publicados están en `bfloat16`. La model card no documenta cuantizaciones GGUF, int8 ni int4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), convertidos desde JAX a PyTorch |
| Tarea | `normal_task2` sobre robot Franka, 30 demostraciones |
| Representación de acciones | Cartesiana absoluta: XYZ + cuaternión xyzw + pinza binaria (-1/+1). No son deltas del controlador |
| Dimensiones de salida | 50 pasos × 32 coordenadas; solo las 8 primeras coordenadas son acciones del robot |
| Normalización | requiere `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes |
| Entradas | cámaras y estado del robot (detalladas en `log.txt`) |
| Paso de entrenamiento | 6000 |
| Autor | NaaaaaiVe6 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-16 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna. Las etiquetas `openpi` y `pi05` sitúan el modelo dentro de la familia de políticas openpi/pi0.5, y la model card indica que se ha convertido "desde JAX a PyTorch bfloat16 con la configuración original del modelo de entrenamiento Franka". Esto implica que el entrenamiento original se realizó en JAX (ecosistema habitual de openpi) y que la conversión preserva la configuración del modelo base empleado para el ajuste sobre Franka. No se detalla si hay mezcla de expertos, atención lineal, decodificación especulativa ni ninguna otra innovación técnica.

En cuanto a los datos, solo se sabe que el checkpoint procede de un ajuste con 30 demostraciones sobre una tarea denominada `task2`, con representación de acciones cartesiana absoluta y pinza binaria. No se indica el número de tokens o de frames de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por imitación puro más allá de lo implícito en un pipeline de demostraciones. Tampoco se documenta ninguna evaluación del entrenamiento ni curvas de pérdida.

## Capacidades

- Generación de acciones de control para un brazo Franka en espacio cartesiano absoluto (XYZ + cuaternión xyzw + apertura/cierre de pinza).
- Predicción de secuencias de acción con horizonte de 50 pasos, útil para control con chunking y ejecución de tramos sin re-inferencia en cada paso de control.
- Procesamiento de entradas multimodales: la model card menciona entradas de cámara y de estado del robot, aunque su disposición exacta está en `log.txt`.
- Control de pinza binaria mediante valores -1/+1.
- Ejecución de una tarea específica (`task2`) aprendida a partir de 30 demostraciones.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modo de razonamiento; son capacidades propias de modelos de lenguaje y aquí no aplican.
- No se documentan capacidades de visión general (descripción de imágenes, VQA) más allá del uso de imágenes como entrada de política.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el checkpoint genera acciones cartesianas absolutas con horizonte de 50 pasos, lo que permite ejecutar una secuencia completa de agarre y colocación sin re-inferencia continua y facilita el control a baja frecuencia sobre el Franka.
- Reproducción de experimentos de investigación en VLA: al incluir `assets/franka/norm_stats.json` y las transformaciones de entrenamiento, permite replicar exactamente el pipeline de normalización y comparar resultados con otras políticas.
- Fine-tuning con demostraciones propias: sirve como punto de partida para ajustar la misma tarea en otro montaje físico, partiendo de un checkpoint ya adaptado a Franka en lugar de un modelo base generalista.
- Evaluación de representaciones de acción: es un caso útil para estudiar el impacto de usar acciones cartesianas absolutas frente a deltas del controlador, ya que la model card hace explícita esa diferencia.
- Integración como política de referencia en bancos de pruebas de control: se puede conectar a un bucle de control que consuma las 8 primeras coordenadas de cada paso de la salida de 50×32 y descarte el resto.
- Automatización de tareas repetitivas en células robotizadas de investigación: para una tarea única y bien delimitada, una política entrenada con 30 demostraciones puede reducir la necesidad de programación explícita de trayectorias.
- Estudio del efecto del número de demostraciones: al tratarse de un ajuste con 30 demostraciones y un paso concreto (6000), es un punto de comparación para analizar escalado de datos y sobreajuste a la tarea.
- Validación de conversiones JAX a PyTorch: el repositorio es un ejemplo de conversión de pesos con `bfloat16` y configuración preservada, útil para verificar que una tubería de conversión mantiene el comportamiento del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones con otros checkpoints. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos en `bfloat16`: aproximadamente 7,2 GB (3.616.757.520 parámetros × 2 bytes), coherente con el tamaño del repositorio. A esto hay que sumar activaciones y buffers de las entradas de cámara y estado, no cuantificados en la información disponible.
- VRAM estimada en `float32`: aproximadamente 14,5 GB solo para los pesos.
- Cuantización: no documentada por el autor. Una hipotética cuantización a int8 situaría los pesos en torno a 3,6 GB y a int4 en torno a 1,8 GB, pero no hay soporte confirmado y podría degradar la precisión del control.
- GPU de gama alta: A100 (40 o 80 GB), H100 y L40S son opciones holgadas para `bfloat16` y permiten además procesar varias cámaras y lotes.
- GPU de consumo: el modelo debería caber en tarjetas de 24 GB (RTX 3090, RTX 4090) en `bfloat16`, siempre que el consumo de activaciones se mantenga bajo; en tarjetas de 8-12 GB requeriría cuantización no oficial.
- Opciones de despliegue: la librería declarada es openpi (`library_name: openpi`) con pesos PyTorch. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama, y en la práctica no aplican porque no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. El horizonte de 50 pasos sugiere ejecución por chunks, pero no se especifica la frecuencia de control ni el tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (franka-30demos-normal_task2_cartesian, step 6000) | Política VLA específica de tarea para Franka | 3.616.757.520 | no disponible | no disponible | HuggingFace, 0 descargas |
| Políticas base de la familia openpi (pi05/pi0) | Política VLA generalista | no disponible en la información proporcionada | no disponible | no disponible | no verificado en la búsqueda |
| Otros VLA abiertos para manipulación (por ejemplo, familias tipo OpenVLA o GR00T) | Política VLA | no disponible en la información proporcionada | no disponible | no disponible | no verificado en la búsqueda |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada, por lo que la comparación numérica no es posible. La diferencia cualitativa principal es que este repositorio es un checkpoint ajustado a una única tarea y a un robot concreto, mientras que las alternativas citadas son modelos base generalistas que requieren ajuste posterior.

## Limitaciones y advertencias

- Licencia no especificada: no hay información sobre permisos de uso comercial, redistribución o modificación. Debe considerarse un riesgo legal hasta que el autor lo aclare.
- Modelo de tarea única: entrenado para `task2` con 30 demostraciones; no se espera generalización a otras tareas, objetos o disposiciones de la escena.
- Específico de Franka: la representación cartesiana absoluta y la pinza binaria (-1/+1) están ligadas a ese montaje. Usarlo en otro robot o pinza requiere reentrenamiento o adaptación.
- Convenciones sin confirmar: la propia model card indica que las convenciones del controlador requieren confirmación y remite a `log.txt`. Ignorar ese documento puede provocar comandos incorrectos y movimientos peligrosos.
- Normalización obligatoria: hay que usar `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes; sin ellas las acciones dejan de ser válidas.
- Salida parcialmente no accionable: de las 32 coordenadas por paso, solo las 8 primeras son acciones del robot; consumir el resto como comandos sería un error.
- Ausencia de benchmarks: no hay tasas de éxito ni métricas de precisión publicadas, por lo que no se puede estimar la fiabilidad real de la política.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como cualquier política aprendida por imitación, puede generar trayectorias fuera de distribución ante cambios de iluminación, posición de cámara u objetos no vistos.
- Sesgos: no disponibles. Al proceder de 30 demostraciones de un único operador y entorno, es previsible un sesgo hacia esas condiciones, aunque no se documenta explícitamente.
- Idiomas y contexto textual: no aplica; el modelo no procesa lenguaje natural de forma documentada.
- Reproducibilidad: el checkpoint está fijado al paso 6000 y no se documenta la variabilidad entre semillas ni el proceso completo de entrenamiento.
- Advertencia de seguridad: cualquier despliegue sobre hardware físico debe hacerse con límites de par, paradas de emergencia y validación en simulación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task2_cartesian_20260913T212156Z-step-6000
- Archivo de registro con el diseño de salida y las convenciones: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task2_cartesian_20260913T212156Z-step-6000/blob/main/log.txt
- Estadísticas de normalización: `assets/franka/norm_stats.json` dentro del repositorio del modelo
- Repositorio de la librería openpi: no encontrado en los resultados de búsqueda proporcionados
- Papers, blogs o demos adicionales: no disponibles; la búsqueda web no devolvió resultados relacionados con este modelo
