# deformable-bench/fastwam-grasp-bag-strap-dr-v1

## Resumen

FastWAM grasp-bag-strap DR v1 es un checkpoint de un modelo de aprendizaje por imitación orientado a robótica, publicado por la organización deformable-bench en Hugging Face. Se trata de un ajuste fino del checkpoint de mitad de entrenamiento HWM FastWAM (paso 75.000) sobre el conjunto de datos `deformable-bench/grasp_bag_strap_dr_v1`, formado por 200 episodios y 83.566 fotogramas centrados en una tarea concreta de manipulación de un objeto deformable: el agarre de la correa de una bolsa.

El modelo pertenece a la familia FastWAM y combina generación de video con predicción de acciones, según se deduce de la doble componente de pérdida (acción y video) registrada durante el entrenamiento. Recibe observaciones de tres cámaras (estática, mano izquierda y mano derecha) y produce un vector de estado/acción de 14 dimensiones a partir de 33 fotogramas de observación.

Su relevancia es fundamentalmente de investigación: sirve como referencia reproducible para experimentos de manipulación deformable dentro de la misma base de código FastWAM. La información pública disponible es muy limitada (0 descargas y 0 likes en el momento de la consulta, licencia no especificada) y el propio autor advierte que no ha sido validado para despliegues de seguridad crítica ni fuera de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de aprendizaje por imitacion con generacion de video (familia FastWAM); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada de 33 fotogramas de observacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable / no disponible (modelo de robotica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); archivo `checkpoints/step_003265.pt` |
| Dimension de accion/estado | 14 |
| Camaras de entrada | 3 (estatica, mano izquierda, mano derecha) |
| Preprocesado de imagen | redimensionado a 240 x 320, sin aumento de imagen |
| Normalizacion accion/estado | min/max |
| Dataset de ajuste fino | deformable-bench/grasp_bag_strap_dr_v1 (200 episodios, 83.566 fotogramas) |
| Precision de entrenamiento | bf16 |
| Hardware de entrenamiento | 8 GPU NVIDIA H20, batch de 16 por GPU |
| Pasos de optimizacion | 3.265 |
| Libreria | fastwam |

## Arquitectura y entrenamiento

La model card no describe la arquitectura en detalle. Los metadatos y la estructura de la pérdida durante el entrenamiento indican un modelo de aprendizaje por imitación que aprende conjuntamente a predecir acciones de control y a generar/predictar observaciones de video, ya que cada paso registra una pérdida total desglosada en una componente de acción y otra de video. El nombre de la familia (FastWAM) y las etiquetas (generación de video, aprendizaje por imitación, manipulación deformable) sitúan el modelo en la línea de las políticas visomotoras modernas que emplean predicción de futuros visuales como señal de aprendizaje. No se especifica el número de parámetros, el tipo de backbone ni el mecanismo de atención utilizado.

El ajuste fino partió del checkpoint de mitad de entrenamiento HWM FastWAM en el paso 75.000 y se ejecutó sobre 200 episodios (83.566 fotogramas) de la revisión `239700e0cc56136cdc03a1d3625c1064e6fd48b9` del dataset. Se utilizaron tres cámaras, 33 fotogramas de observación, normalización min/max del estado y de la acción, imágenes redimensionadas a 240 x 320 y sin aumento de imagen. El entrenamiento empleó 8 GPU NVIDIA H20, batch de 16 por GPU, 6 workers de DataLoader, optimizador con tasa de aprendizaje 2e-5 y decaimiento coseno, precisión bf16 y un total de 3.265 pasos. No se menciona el uso de RLHF, DPO ni de fases de refinamiento por preferencias; el proceso descrito es exclusivamente de aprendizaje por imitación supervisada.

La evolución de las pérdidas registradas es la siguiente:

| Ventana | Total | Accion | Video |
| --- | ---: | ---: | ---: |
| Pasos 10-100 | 0.715230 | 0.482810 | 0.232410 |
| Ultimos 20 pasos registrados | 0.082245 | 0.001385 | 0.080845 |
| Paso 3.260 | 0.090500 | 0.001100 | 0.089400 |

La pérdida de acción convergió con fuerza (de 0.482810 a valores en torno a 0.001), mientras que la pérdida de video se mantuvo estable en torno a 0.08 al final del entrenamiento, con variación normal entre lotes.

## Capacidades

- Prediccion de acciones de control en un espacio de 14 dimensiones a partir de observaciones visuales.
- Percepcion visomotora multivista, con tres entradas de camara (estatica, mano izquierda y mano derecha).
- Aprendizaje y reproduccion de politicas de manipulacion para el agarre de una correa de bolsa, un objeto deformable.
- Generacion/prediccion de video como parte del objetivo de entrenamiento (componente de perdida de video).
- Aprendizaje por imitacion a partir de demostraciones, sin necesidad de recompensas explicitas ni de RL.
- Adaptacion por ajuste fino: el propio modelo es un ejemplo de refinamiento de un checkpoint previo sobre un dataset especifico.

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, dialogo ni procesamiento de lenguaje, ya que no es un modelo de lenguaje.

## Casos de uso

- Investigacion en manipulacion de objetos deformables: permite reproducir y comparar politicas para tareas como el agarre de una correa de bolsa, donde la geometria del objeto cambia durante la manipulacion.
- Punto de partida para ajuste fino en nuevas tareas de agarre: al derivar de un checkpoint de mitad de entrenamiento, puede reajustarse sobre datasets propios con el mismo esquema de observacion/accion.
- Evaluacion reproducible con la base de codigo FastWAM: al publicarse junto al dataset y las estadisticas de normalizacion, facilita experimentos comparables entre equipos.
- Pruebas de generalizacion ante variaciones de dominio: el sufijo "DR" del dataset sugiere datos con variacion controlada, lo que permite estudiar la robustez de la politica frente a cambios de apariencia o posicion.
- Benchmark interno de politicas visomotoras: sirve como referencia frente a otros metodos de aprendizaje por imitacion sobre el mismo conjunto de datos.
- Recoleccion y validacion de pipelines de datos roboticos: el modelo exige un esquema concreto (3 camaras, 33 fotogramas, dimension 14), util para verificar que nuevos datasets cumplen el formato.
- Docencia y prototipado en robotica: al ser un ejemplo completo de entrenamiento (configuracion, log y estadisticas), resulta util para ilustrar un flujo de trabajo de imitacion de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (tipo MMLU, HumanEval o GSM8K, no aplicables a robotica) en la informacion disponible. La model card unicamente reporta la evolucion de las perdidas de entrenamiento (accion y video), recogidas en la tabla de la seccion de arquitectura y entrenamiento. No hay datos de exito de tarea, tasa de agarre ni evaluacion en simulador o en robot real.

## Requisitos de hardware

- Entrenamiento documentado: 8 GPU NVIDIA H20 con precision bf16, batch de 16 por GPU y 6 workers de DataLoader.
- VRAM estimada para inferencia: no disponible (no se especifica el numero de parametros del modelo).
- GPU recomendadas: no disponible; el autor no publica requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la unica via indicada es la base de codigo FastWAM junto con el esquema de observacion/accion del dataset `grasp_bag_strap_dr_v1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados comparativos en la informacion proporcionada. No se puede comparar con datos verificables frente a otras politicas visomotoras de la misma categoria (por ejemplo, metodos de difusion para politica o arquitecturas de aprendizaje por imitacion tipo ACT), ya que la model card no incluye metricas de rendimiento, numero de parametros ni contexto comparable. Por tanto, la comparativa se considera "no disponible".

## Limitaciones y advertencias

- El propio autor indica que el checkpoint no ha sido validado para despliegues de seguridad critica ni para uso fuera de distribucion.
- Esta pensado exclusivamente para investigacion y evaluacion con la base de codigo FastWAM y el esquema de observacion/accion del dataset `grasp_bag_strap_dr_v1`; su uso con otros esquemas puede fallar.
- La licencia no esta especificada, por lo que no se puede confirmar que sea apto para uso comercial.
- Riesgo de sobreajuste a la tarea concreta (agarre de correa de bolsa) y al dominio del dataset de 200 episodios; no hay evidencia de generalizacion a otras tareas.
- No hay datos de sesgo ni de comportamiento en entornos distintos al de entrenamiento.
- No se documentan limites de contexto en el sentido de modelos de lenguaje, pero si un formato de entrada rigido (3 camaras, 33 fotogramas, 14 dimensiones).
- No hay informacion sobre benchmarks de exito de tarea, por lo que se desconoce su rendimiento real en robot.
- El proyecto cuenta con 0 descargas y 0 likes, y no se especifican repositorio de codigo ni paper asociado; el soporte y mantenimiento futuros son inciertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deformable-bench/fastwam-grasp-bag-strap-dr-v1
- Dataset de ajuste fino: https://huggingface.co/datasets/deformable-bench/grasp_bag_strap_dr_v1
- Organizacion del autor: https://huggingface.co/deformable-bench
- Paper, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
