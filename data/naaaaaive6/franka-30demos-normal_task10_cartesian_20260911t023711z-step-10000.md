# NaaaaaiVe6/franka-30demos-normal_task10_cartesian_20260911T023711Z-step-10000

## Resumen

Este repositorio contiene un checkpoint de política robótica correspondiente al paso 10.000 de entrenamiento sobre un brazo Franka, publicado por el autor NaaaaaiVe6 bajo la etiqueta pi05 y la librería openpi. No es un modelo de lenguaje conversacional, sino un modelo de visión-lenguaje-acción (VLA) cuya salida son acciones de control: la model card especifica representación en cartesianas absolutas (XYZ), cuaternión xyzw y pinza binaria (-1/+1), y advierte explícitamente de que no son acciones delta de controlador. El nombre del repositorio indica que se entrenó con 30 demostraciones de una tarea concreta (task10) en representación cartesiana.

Los pesos suman 3.616.757.520 parámetros (unos 3,62 mil millones) y ocupan 7,2 GB en el repositorio, en formato safetensors, tras una conversión de JAX a PyTorch en bfloat16 manteniendo la configuración original del modelo de entrenamiento para Franka. La salida del modelo tiene 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras representan acciones del robot.

Su relevancia es muy acotada y de carácter experimental: sirve como ejemplo de checkpoint de la familia openpi/pi0.5 asociado a un montaje Franka y a una tarea específicos, y solo es utilizable si se dispone de las transformaciones de entrenamiento y del fichero de normalización incluidos en el propio repositorio. No declara licencia, no tiene descargas ni valoraciones, y la model card señala que hay convenciones del controlador pendientes de confirmación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Las etiquetas del repositorio apuntan a la familia pi05 dentro del framework openpi (modelo de visión-lenguaje-acción); la model card no describe la arquitectura interna |
| Parámetros totales | 3.616.757.520 (aproximadamente 3,62 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bfloat16 (pesos convertidos de JAX a PyTorch en bfloat16); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pasos y dimensiones de salida | 50 pasos y 32 coordenadas; solo las 8 primeras coordenadas son acciones del robot |
| Tamaño del repositorio | 7,2 GB |
| Librería | openpi |
| Pipeline declarado | robotics |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna, el número de tokens de entrenamiento ni la composición del dataset. Lo que sí documenta es el proceso de conversión: los pesos se pasaron de JAX a PyTorch en bfloat16 conservando la configuración original del modelo de entrenamiento para Franka. Las etiquetas `pi05` y `openpi` sitúan el checkpoint en la familia pi0.5 del framework openpi; según la documentación pública de ese proyecto, se trata de modelos de visión-lenguaje-acción, pero ese extremo no se confirma en esta model card y no debe darse por verificado.

Tampoco se documenta si hubo RLHF, DPO u otro método de ajuste posterior, ni innovaciones técnicas concretas más allá de la representación de acciones y del troceado de salida (50 pasos). El nombre del repositorio sugiere un ajuste sobre unas 30 demostraciones de la tarea 10, pero no se especifica el procedimiento de recogida de datos ni la política de entrenamiento (número de épocas, hiperparámetros o si hubo aumento de datos).

El aspecto crítico para reproducir el comportamiento es el tratamiento de la normalización: el autor indica que hay que usar `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes, y remite a `log.txt` para el formato de salida, la frontera de normalización, las entradas de cámara y estado, y las convenciones del controlador que quedan por confirmar.

## Capacidades

- Generación de acciones de control robótico en cartesianas absolutas (XYZ) más cuaternión xyzw y valor binario de pinza.
- Producción de secuencias de acción de 50 pasos con 32 coordenadas por paso, de las que las 8 primeras corresponden a la acción efectiva del robot.
- Procesamiento de entradas multimodalidad cámara y estado del robot (el detalle exacto de las entradas no se especifica en la model card; se remite a `log.txt`).
- Ejecución de una tarea concreta de manipulación (identificada como task10) aprendida a partir de 30 demostraciones.
- Conversión verificada a PyTorch en bfloat16 para su uso fuera del ecosistema JAX original.
- No hay evidencia documentada de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso en lenguaje natural ni capacidad multilingüe.
- No se documenta modo de razonamiento (thinking), ni capacidades de audio o de visión general más allá del uso como entrada de política.

## Casos de uso

- Manipulación robótica en laboratorio con brazo Franka: cargar el checkpoint en el framework openpi y ejecutar la tarea 10 replicando las condiciones de las 30 demostraciones de entrenamiento, siempre que se apliquen las mismas transformaciones y la normalización de `norm_stats.json`.
- Evaluación de puntos de control intermedios: comparar el paso 10.000 con otros pasos del mismo entrenamiento para estudiar la evolución de la política y detectar sobreajuste con un conjunto de demostraciones tan reducido.
- Reproducción de experimentos con representación cartesiana absoluta: sirve para validar pipelines que consumen acciones en XYZ más cuaternión, en lugar de deltas de controlador, y para comprobar el efecto de esa elección en el control final.
- Generación de rollouts para evaluación offline: las secuencias de 50 pasos y 32 coordenadas permiten construir lotes de trayectorias sintéticas para comparar políticas o alimentar métricas de error de acción sin necesidad de ejecutar el robot en cada iteración.
- Punto de partida para ajuste fino en tareas relacionadas: al ser un checkpoint entrenado con pocas demostraciones, puede servir como inicialización para nuevas tareas del mismo montaje, asumiendo que la licencia (no declarada) lo permita.
- Integración en un banco de pruebas de investigación: conectar la salida del modelo a un controlador externo, comprobando antes las convenciones de controlador que el propio autor deja marcadas como pendientes de confirmar.
- Validación de infraestructura de inferencia: medir consumo de VRAM y latencia de una política de 3,62 mil millones de parámetros en bfloat16 antes de escalar a modelos de mayor tamaño.
- Verificación de normalización en producción: usar el repositorio como caso de prueba para asegurar que un pipeline propio aplica la frontera de normalización y las transformaciones correctas, dado que el autor insiste en ese punto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tasas de éxito de la tarea, métricas de error de acción ni comparaciones con otros checkpoints.

## Requisitos de hardware

- Peso de los parámetros en bfloat16: aproximadamente 7,2 GB (3.616.757.520 parámetros multiplicados por 2 bytes).
- VRAM estimada para inferencia: alrededor de 8-10 GB como mínimo, y del orden de 12-16 GB si se tienen en cuenta activaciones y las entradas de cámara; no se dispone de cifras oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y, con menos margen, en RTX 3060 (12 GB) o similares.
- GPU de centro de datos: A100, H100 y L40S son compatibles por capacidad, aunque no aportan ventaja por memoria para este tamaño; no hay datos de rendimiento comparado.
- Despliegue: la librería indicada en el repositorio es openpi. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponibles. A tener en cuenta que en control robótico la latencia de inferencia condiciona la frecuencia de control, y que el troceado de 50 pasos de acción permite amortizar el coste por inferencia ejecutando varios pasos de control por cada forward pass.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Como referencias de la misma categoría pueden citarse los checkpoints base de la familia openpi (pi0 y pi0.5) y otros modelos de visión-lenguaje-acción como OpenVLA o GR00T N1, pero no se han facilitado sus especificaciones (parámetros, contexto, rendimiento, licencia) y por tanto no se incluye comparación numérica.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| franka-30demos-normal_task10_cartesian (este repositorio) | 3,62 mil millones | No disponible | No disponible | No disponible |
| Checkpoints base openpi (pi0 / pi0.5) | No disponible | No disponible | No disponible | No disponible |
| Otros modelos VLA (OpenVLA, GR00T N1, etc.) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial ni redistribución; hay que contactar con el autor antes de cualquier uso fuera de investigación.
- Entrenamiento con solo 30 demostraciones de una única tarea: riesgo alto de sobreajuste al montaje, a la iluminación y a la posición de cámara concretos.
- Riesgo de acciones fuera de distribución: como toda política aprendida, puede generar comandos inválidos o inseguros ante estados no vistos; requiere límites de seguridad externos en el controlador.
- Solo 8 de las 32 coordenadas de salida son acciones reales del robot; usar el resto como comandos produciría comportamientos incorrectos.
- Representación en cartesianas absolutas: no son deltas de controlador. Mezclar este checkpoint con un pipeline que espere deltas puede provocar movimientos erráticos.
- Convenciones del controlador pendientes de confirmar según la propia model card; el propio autor remite a `log.txt` sin darlas por cerradas.
- Dependencia estricta de `assets/franka/norm_stats.json` y de las transformaciones de entrenamiento: sin ellas, la salida deja de ser interpretable.
- Conversión de JAX a PyTorch en bfloat16: pueden aparecer diferencias numéricas respecto al modelo original en JAX.
- Idiomas soportados no disponibles; no hay información sobre si las instrucciones de tarea se proporcionan en lenguaje natural ni en qué idioma.
- Ausencia total de benchmarks y de métricas de éxito: no hay evidencia pública de que la tarea se resuelva con una tasa de éxito aceptable.
- Sin descargas ni valoraciones: no existe validación por parte de terceros.
- Sin documentación sobre sesgos, pero al ser un modelo de acción sobre un montaje físico concreto, el sesgo relevante es el de distribución de entrenamiento (entorno, objetos y posiciones de las 30 demostraciones).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task10_cartesian_20260911T023711Z-step-10000
- Fichero de registro del autor: log.txt (incluido en el repositorio, ruta relativa `log.txt`)
- Estadísticas de normalización: assets/franka/norm_stats.json (incluido en el repositorio)
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a comercios de recambios de motocicletas y no guardan relación con el contenido de esta ficha.
