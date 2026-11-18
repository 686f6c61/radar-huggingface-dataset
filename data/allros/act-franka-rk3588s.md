# allros/act-franka-rk3588s

## Resumen

ACT Franka RK3588S es un modelo de política robótica basado en ACT (Action Chunking with Transformers) entrenado sobre el simulador MuJoCo para una tarea de pick-and-lift con un brazo Franka. Lo desarrolla el usuario `allros` y se distribuye en dos formatos complementarios: un checkpoint original de PyTorch compatible con LeRobot y una compilación RKNN en FP16 para ejecutar la inferencia en la NPU de los SoC Rockchip RK3588 y RK3588S. El modelo resuelve el problema de llevar una política de imitación entrenada en simulación a hardware de borde de bajo consumo, evitando depender de una GPU en el bucle de control.

El repositorio incluye el checkpoint tras 50.000 pasos de entrenamiento, la configuración ACT, los preprocesadores y postprocesadores de LeRobot con sus estadísticas, el grafo RKNN compilado (unos 64,60 MiB) y los metadatos de compilación. La arquitectura es un transformer ACT que consume el estado del robot (18 dimensiones: 7 de posición articular, 7 de velocidad, comando de pinza y posición del TCP en XYZ) junto con dos imágenes RGB de 128×128 (cámara frontal y de muñeca), y produce un chunk de 50 acciones de 4 dimensiones (desplazamiento XYZ en metros y codificación de pinza).

Su relevancia práctica es la demostración de un pipeline completo de extremo a extremo: entrenamiento con LeRobot, exportación a RKNN Toolkit2 y despliegue en NPU con latencias medidas de aproximadamente 26-27 ms por llamada. Es un modelo de nicho, orientado a validación de flujos de despliegue en robótica de borde más que a uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) sobre LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | FP16 para el grafo RKNN; checkpoint PyTorch sin cuantizar |
| Idiomas soportados | zh, en (solo documentación; el modelo no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) y .rknn (RKNN Toolkit2) |
| Entradas | observation.state [1,18] float32; observation.images.front [1,3,128,128]; observation.images.wrist [1,3,128,128] |
| Salidas | action [1,50,4] float32 |
| Tamano del repo | 0,3 GB |
| Grafo RKNN | act_franka_rk3588_fp16.rknn, ~64,60 MiB |
| Checkpoint | 50.000 pasos de entrenamiento |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT de LeRobot, un transformer que mapea observaciones multimodales (estado propioceptivo y dos vistas de cámara) a un chunk de acciones futuras. La predicción por chunks de 50 acciones reduce la frecuencia de inferencia necesaria: el bucle de control ejecuta las 10 primeras acciones y vuelve a observar, lo que amortigua la latencia del modelo y permite operar con hardware modesto. Las dos cámaras se capturan a 640×480 y se reescalan bilinealmente a 128×128 antes de entrar en la red.

El entrenamiento se realizó sobre el dataset `aractingi/franka_sim_pick_lift_6` en el simulador MuJoCo, con un checkpoint final en el paso 50.000. No se documentan en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en políticas de imitación). La conversión a RKNN se hizo con Rockchip RKNN Toolkit2 versión 2.3.2 y `do_quantization=False`, es decir, manteniendo FP16 sin cuantización de enteros. Una innovación destacable del despliegue es que el grafo RKNN incorpora la normalización de entradas y la desnormalización de acciones, de modo que el llamador no debe repetir esas transformaciones; el checkpoint PyTorch, en cambio, requiere los preprocesadores y postprocesadores guardados de LeRobot, lo que implica dos fronteras de llamada distintas.

## Capacidades

- Generación de chunks de acción de 50 pasos a partir de observaciones propioceptivas y visuales.
- Control de un brazo Franka en simulación MuJoCo para tareas de pick-and-lift.
- Fusión de dos cámaras (frontal y de muñeca) con el estado del robot en una única política.
- Inferencia en NPU de Rockchip RK3588/RK3588S mediante RKNNLite y librknnrt 2.3.2.
- Ejecución en CPU del checkpoint PyTorch para validación y depuración.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües más allá de la documentación en chino e inglés.

## Casos de uso

- Validación de pipelines de despliegue en borde: sirve para comprobar de extremo a extremo el flujo LeRobot → RKNN Toolkit2 → NPU, con métricas de latencia y error respecto a PyTorch, antes de invertir en un robot físico.
- Control de un brazo Franka en simulación MuJoCo: el modelo se ejecuta en la NPU mientras un PC renderiza la escena y las dos cámaras, lo que permite experimentar con políticas de imitación sin GPU dedicada en el bucle.
- Prototipado de robótica educativa: el bajo coste del RK3588S y la latencia de ~26 ms por llamada lo hacen adecuado para laboratorios y cursos que necesiten demostrar inferencia neuronal en hardware embebido.
- Benchmark de compiladores RKNN: el par de modelos (PyTorch y RKNN) permite medir la degradación numérica introducida por la compilación; el autor reporta un error absoluto máximo en XYZ de ~0,04222 mm frente a PyTorch.
- Referencia para portar otras políticas ACT: el repositorio y el código asociado en `llros007/rknn_lerobot` documentan el proceso de conversión, reutilizable para tareas distintas con el mismo SoC.
- Pruebas de regresión de firmware NPU: con 60/60 peticiones correctas en la prueba de muestras independientes, el modelo sirve como caso de prueba reproducible para validar versiones de RKNPU y librknnrt.
- Integración en servicios HTTP de inferencia: el diseño recomendado (servicio HTTP en la placa, simulación en el PC) encaja en arquitecturas donde el robot de borde expone inferencia a un orquestador central.

## Benchmarks y rendimiento

La model card declara un `model-index` con nombre "ACT Franka RK3588S NPU" pero sin resultados en la lista `results`. Los datos de rendimiento disponibles son mediciones del autor en la sección de pruebas, no benchmarks estándar:

| Metrica | Valor | Condiciones |
|---|---|---|
| Latencia media por llamada (demostración de agarre) | 26,06 ms | 9 llamadas, 3/3 agarres correctos, 23 pasos por episodio |
| Latencia media por llamada (muestras independientes) | 27,55 ms | 60/60 peticiones correctas |
| Error absoluto maximo en XYZ frente a PyTorch | ~0,04222 mm | Muestras independientes |
| Tasa de exito en agarre | 3/3 | Posiciones fijas en MuJoCo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a este tipo de modelo. Las cifras de latencia incluyen el procesamiento necesario del runtime, pero no el viaje HTTP ni el ciclo de control completo.

## Requisitos de hardware

- Inferencia en NPU: SoC Rockchip RK3588 o RK3588S con RKNPU driver 0.9.8 y librknnrt 2.3.2.
- Memoria: el grafo RKNN ocupa unos 64,60 MiB; el checkpoint PyTorch completo cabe en el repositorio de 0,3 GB, por lo que la validación en CPU es viable en cualquier equipo convencional.
- GPU dedicadas: no se requieren para el despliegue en placa; para reentrenar con LeRobot se necesitaría una GPU, aunque no se especifica cuál en la información disponible.
- Cabe en GPU de consumo: sí para la variante PyTorch en CPU o GPU modesta; el despliegue objetivo es la NPU del RK3588S, no una GPU.
- Opciones de despliegue: RKNNLite con servicio HTTP en la placa, LeRobot en PyTorch para CPU/GPU, y MuJoCo en el PC para simulación y renderizado de cámaras.
- Latencia y throughput: ~26-27 ms por llamada en RK3588S según las mediciones del autor; no se documenta throughput agregado ni latencia del ciclo completo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entradas | Salidas | Despliegue en borde | Licencia |
|---|---|---|---|---|---|
| ACT Franka RK3588S (este) | ACT / transformer | estado 18D + 2 imágenes 128×128 | chunk [1,50,4] | RKNN FP16 en RK3588S | no disponible |
| Políticas ACT de LeRobot (generales) | ACT / transformer | estado + imágenes | chunk de acciones | PyTorch (CPU/GPU) | según LeRobot (Apache-2.0 en el framework) |
| Políticas Diffusion Policy de LeRobot | diffusion policy | estado + imágenes | secuencia de acciones | PyTorch (CPU/GPU) | según LeRobot |
| Políticas basadas en VLA (p. ej. OpenVLA) | transformer visión-lenguaje-acción | imágenes + instrucción textual | acciones | GPU de gama alta | según modelo |

La comparación es cualitativa: no se dispone de datos de benchmarks comunes entre estos modelos en la información proporcionada, y las alternativas VLA tienen requisitos de hardware muy superiores. La ventaja específica de este modelo es la existencia de un grafo RKNN ya compilado y validado para RK3588S, algo que las políticas genéricas de LeRobot no ofrecen de serie.

## Limitaciones y advertencias

- Entrenado y validado únicamente en el escenario MuJoCo de posiciones fijas; no se ha comprobado la generalización a posiciones aleatorias.
- No se ha validado en un robot físico; los resultados son exclusivamente de simulación.
- La tarea es específica (pick-and-lift con Franka) y el modelo no es reutilizable directamente para otras tareas sin reentrenamiento.
- El error frente a PyTorch (~0,04222 mm en XYZ) es pequeño pero no nulo; en tareas de precisión puede requerir verificación.
- La licencia no está disponible en la información proporcionada, por lo que no se puede confirmar el uso comercial.
- El checkpoint PyTorch no incluye el wrapper de exportación y depende de los preprocesadores y postprocesadores de LeRobot; usarlo sin ellos produce resultados incorrectos.
- El grafo RKNN ya incorpora normalización y desnormalización: aplicarlas de nuevo introduce errores silenciosos.
- El modelo no procesa lenguaje ni soporta tool calling, por lo que no es adecuado para aplicaciones de agentes o asistentes.
- Posibles sesgos: al entrenarse solo en simulación, puede no transferir bien a variaciones de iluminación, textura o dinámica reales.
- Riesgo de alucinación en el sentido de acciones no válidas fuera de la distribución de entrenamiento; el autor no documenta mecanismos de seguridad o parada ante acciones anómalas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allros/act-franka-rk3588s
- Repositorio de código y documentación: https://github.com/llros007/rknn_lerobot
- LeRobot (framework de entrenamiento): https://github.com/huggingface/lerobot
- Rockchip RKNN Toolkit2: https://github.com/airockchip/rknn-toolkit2
- Referencia del flujo de conversión (IB_Robot): https://gitcode.com/openeuler/IB_Robot
- Dataset de entrenamiento: https://huggingface.co/datasets/aractingi/franka_sim_pick_lift_6
