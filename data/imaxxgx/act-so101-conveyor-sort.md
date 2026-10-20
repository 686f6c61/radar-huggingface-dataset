# iMaxxgx/act-so101-conveyor-sort

## Resumen

`iMaxxgx/act-so101-conveyor-sort` es una política de control robótico basada en ACT (Action Chunking Transformer) para un brazo SO-101 simulado en la escena `conveyor_sort` del plugin MuJoCo de Physical AI Runtime. El modelo observa dos cámaras RGB (vista general y muñeca) más las posiciones articulares del brazo, y devuelve un bloque de 100 consignas de articulaciones a 30 Hz. Su tarea es de clasificación física: coger objetos de una cinta transportadora y depositarlos en la bandeja de su color (rojo, azul, verde), enviando los morados o agrietados a la bandeja de rechazo.

Lo desarrolla el usuario iMaxxgx y se entrenó con Physical AI Studio sobre unas 100 episodios grabados del demostrador integrado en la propia simulación. El resultado se exportó a OpenVINO como paquete de política (`manifest.json`, `act.xml`, `act.bin`) que `physicalai.inference.InferenceModel` carga directamente, sin necesidad de código de pre/postprocesado propio.

Su relevancia es acotada pero clara: es un ejemplo reproducible y ligero (0,1 GB de repositorio) de cómo empaquetar una política de imitación para inferencia en CPU con OpenVINO dentro de un stack de robótica abierto. No es un modelo fundacional ni un VLA de propósito general: es una política especializada, entrenada y evaluada únicamente en simulación, con un rendimiento modesto declarado por el propio autor (5 aciertos de 10 objetos en 120 s).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer); transformador que predice chunks de acciones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantización | no disponible (se distribuye como OpenVINO IR ya convertido) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (`act.xml` + `act.bin`) acompañado de `manifest.json` |
| Entradas | `state` [6] (posiciones articulares SO-101); `images.gripper` e `images.overview`, RGB 640×480 con letterbox a 384×384 según el manifiesto |
| Salida | `action` [100, 6]: chunk de objetivos articulares a 30 Hz |
| Frecuencia de control | 30 Hz |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que, en lugar de predecir una única acción por paso, genera un chunk de acciones futuras (aquí 100 pasos × 6 articulaciones) a partir de las observaciones actuales. Ese esquema de *action chunking* reduce el error de compounding y permite amortizar el coste de inferencia entre varias consignas de control. La política consume dos flujos de imagen (cámara `overview` de la escena y cámara de muñeca) más el vector de estado de 6 articulaciones; el manifiesto del paquete fija el preprocesado, incluido el letterbox de 640×480 a 384×384.

El entrenamiento se realizó con Physical AI Studio sobre aproximadamente 100 episodios capturados del demostrador integrado en la simulación MuJoCo, es decir, aprendizaje por imitación supervisado (*behaviour cloning*). No se documentan en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF/DPO (no aplicables de forma habitual en este tipo de políticas). La exportación a OpenVINO IR es la innovación práctica del paquete: convierte el modelo en un artefacto autocontenido que se ejecuta en CPU y se integra en `RobotRuntime` junto con `ChunkedActionQueue` y `LerpSmoother`, con peticiones de nuevo chunk cuando el umbral de consumo supera 0,95.

## Capacidades

- Manipulación robótica simulada: agarre de objetos sobre cinta transportadora y depósito en bandeja según color (rojo, azul, verde).
- Clasificación con clase de rechazo: detecta objetos morados o agrietados y los dirige a la bandeja de rechazo.
- Control a 30 Hz con predicción de chunks de 100 acciones y suavizado mediante interpolación lineal.
- Percepción multimodal basada en dos cámaras RGB (vista general y muñeca) más estado propioceptivo de 6 articulaciones.
- Inferencia en CPU mediante OpenVINO, sin requisito de GPU en el ejemplo oficial.
- Recuperación parcial de errores: puede solicitar un chunk nuevo cada ~5 acciones (`request_threshold=0.95`), lo que en la práctica es lo que evita el fallo total del episodio.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline completo de robótica sim2policy: sirve para validar de extremo a extremo el flujo Physical AI Studio → exportación OpenVINO → `physicalai.inference.InferenceModel` → MuJoCo, antes de invertir en datos propios.
- Pruebas de integración y CI del plugin MuJoCo: el paquete y el cuaderno `conveyor_sort_act.ipynb` permiten montar un test automatizado del runtime (`RobotRuntime`, `ChunkedActionQueue`, `PolicySource`) sin depender de hardware físico.
- Referencia de *behaviour cloning* con pocos datos: 100 episodios de demostrador constituyen una línea base realista para comparar técnicas de aumento de datos o de filtrado de trayectorias en tareas de pick-and-place.
- Evaluación comparativa de runtimes de inferencia: al ser un IR de OpenVINO de 0,1 GB, es un caso de prueba cómodo para medir latencia de política en CPU frente a otros backends o dispositivos.
- Docencia y divulgación en robótica de manipulación: la tarea de clasificar por color con clase de rechazo es intuitiva y el visor en vivo del ejemplo facilita explicar action chunking, Hz de control y suavizado de acciones.
- Base para *fine-tuning* con datos propios: la política y su manifiesto sirven de plantilla para reentrenar en una escena distinta (otra cinta, otros objetos, otra velocidad) manteniendo el mismo contrato de entrada/salida.
- Prototipado de lógica de control tolerante a fallos: el comportamiento declarado (no recupera un agarre fallido por sí mismo, pero responde a un umbral de refresco de chunk más agresivo) permite experimentar con estrategias de reintento a nivel de runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una evaluación cualitativa/cuantitativa en simulación con el montaje descrito:

| Métrica (escena `conveyor_sort`) | Resultado |
|---|---|
| Duración de la prueba | 120 s |
| Velocidad de cinta (entrenamiento) | 3 cm/s |
| Objetos alimentados | 10 |
| Clasificados correctamente | 5 |
| Depositados en bandeja incorrecta | 0 |
| Agarre fallado | 1 |
| Sin procesar (seguían en la cinta) | resto (4, derivado de los datos anteriores) |
| Configuración | `request_threshold=0,95`, 30 Hz, CPU |
| Nota del autor | Con `request_threshold=0,5` no clasificó ningún objeto en 120 s; se esperan más fallos a mayor velocidad de cinta |

## Requisitos de hardware

- VRAM: no disponible de forma oficial; el paquete completo de pesos (IR) ocupa 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU de consumo e incluso en memoria compartida de CPU.
- GPU: no se especifica ninguna; el ejemplo oficial se ejecuta con `device="CPU"` en OpenVINO.
- CPU: es la vía recomendada por el autor; se necesita además capacidad de decodificar dos streams MJPEG a 640×480 y 30 fps.
- Cabe en GPU de consumo: sí, por tamaño; no hay datos publicados de rendimiento en GPU para esta política.
- Opciones de despliegue: OpenVINO Runtime mediante `physicalai.inference.InferenceModel` (backend `openvino`) y `physicalai_mujoco_plugin.MuJoCoRobot`; el simulador expone las cámaras por HTTP en el puerto 8770 del ejemplo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles. El único dato temporal es el bucle de control a 30 Hz y la petición de nuevo chunk cada ~5 acciones.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de los modelos comparables en la información proporcionada; la comparación es únicamente categórica.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iMaxxgx/act-so101-conveyor-sort` | Política ACT para SO-101 simulado, paquete OpenVINO | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Otras políticas ACT para SO-101 en el ecosistema Physical AI | Política de imitación, misma familia | no disponible | no disponible | no disponible | no verificado en la información disponible |
| Políticas de difusión (Diffusion Policy) para manipulación | Política de imitación con cabeza de difusión | no disponible | no disponible | no disponible | no verificado en la información disponible |
| VLA de propósito general (tipo OpenVLA o π0) | Modelo visión-lenguaje-acción | no disponible | no disponible | no disponible | no verificado en la información disponible |

Diferencias cualitativas relevantes: este paquete es una política estrecha, de una sola tarea y una sola escena, frente a los VLA de propósito general, que aceptan instrucciones en lenguaje y generalizan a múltiples tareas a cambio de un coste de inferencia y unos requisitos de hardware mucho mayores. Frente a otras implementaciones de ACT, su valor diferencial es el empaquetado OpenVINO listo para cargar con `from_pretrained` sin código de preprocesado adicional.

## Limitaciones y advertencias

- Solo simulación: entrenado y evaluado en la escena MuJoCo `conveyor_sort`; no se ha probado en un SO-101 físico y no hay garantía de transferencia sim2real.
- Dependencia estricta de la cámara: espera la pose por defecto de la cámara `overview` de la escena y la cámara de muñeca del SO-101, ambas a 640×480. Cambiar la pose, la resolución o la exposición degrada el comportamiento.
- No se recupera de un agarre fallido por sí mismo; el autor recomienda `request_threshold=0,95` y advierte de que con `0,5` no clasificó nada en 120 s.
- Rendimiento limitado y sensible a la velocidad: a la velocidad de entrenamiento (3 cm/s) clasificó 5 de 10 objetos; se esperan más fallos por encima de esa velocidad.
- Sesgos: no documentados. El dataset son ~100 episodios de un demostrador automatizado, por lo que hereda los sesgos de esa política y de la distribución de objetos y posiciones de la escena.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones sin sentido fuera de distribución (objetos no vistos, oclusiones, iluminación distinta) sin señal de incertidumbre.
- Idiomas: no aplica; el modelo no procesa lenguaje.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; conviene revisar también las licencias de las dependencias (Physical AI Runtime, Physical AI Studio, MuJoCo) antes de un despliegue en producto.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-10-19); no hay evidencia de validación externa ni de mantenimiento posterior.
- Sin métricas de referencia publicadas: no hay benchmarks estándar ni comparación con líneas base, solo el resultado de la prueba de 120 s.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iMaxxgx/act-so101-conveyor-sort
- Physical AI Runtime (plugin MuJoCo, cuaderno `packages/physicalai-mujoco-plugin/examples/conveyor_sort_act.ipynb`): https://github.com/openvinotoolkit/physicalai
- Physical AI Studio (entrenamiento y exportación): https://github.com/open-edge-platform/physical-ai-studio
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
