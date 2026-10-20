# Samisaliveagain/piper-hexbolt-smolvla-bs16-step18000

## Resumen

`Samisaliveagain/piper-hexbolt-smolvla-bs16-step18000` es un checkpoint de política robótica de tipo VLA (vision-language-action) obtenido por ajuste fino de SmolVLA sobre un conjunto propio de 100 demostraciones de teleoperación. La tarea concreta es coger un perno hexagonal y colocarlo en la ranura correspondiente, ejecutada con un robot AgileX Piper de 6 ejes más pinza. El autor es un usuario individual de HuggingFace (Samisaliveagain) y el artefacto se publica a través de la librería LeRobot, con 450.046.176 parámetros y un peso de repositorio de 1,2 GB.

El interés de esta ficha no está en el modelo base —SmolVLA, un VLA compacto de ~450 M de parámetros con arquitectura VLM más experto de acciones— sino en el ejemplo de flujo de trabajo: partiendo de un checkpoint preentrenado de SmolVLA, se entrena con 18.000 actualizaciones de optimizador, tamaño de lote 16 y un objetivo de 20.000, sobre un dataset de 100 demostraciones y dos cámaras RGB. Es un caso representativo de ajuste fino de políticas para manipulación de precisión con hardware de gama media.

La relevancia práctica es doble: por un lado, demuestra que un VLA de menos de 1 GB en bf16 puede especializarse en una tarea de inserción con tolerancias ajustadas; por otro, ilustra los riesgos de publicar checkpoints de robótica sin licencia declarada y sin métricas de éxito físico, algo habitual en el ecosistema LeRobot. La model card es explícita: el paso de entrenamiento y la integridad de los ficheros están verificados, pero no se establece robustez ni tasa de inserción correcta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de SmolVLA (VLM preentrenado + experto de acciones con flow matching), sobre LeRobot |
| Parametros totales | 450.046.176 (dato real de `model.safetensors`) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; la política consume una instrucción de tarea y observaciones (dos cámaras RGB y estado articular), sin límite de contexto documentado |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas; pesos en `safetensors` (precisión no documentada en la model card). Cuantización a fp16/bf16/int8 posible con herramientas genéricas |
| Idiomas soportados | No disponible (la instrucción de tarea se infiere en inglés por convención de LeRobot; no confirmado por el autor) |
| Licencia | No disponible. La model card indica que esta subida no asigna licencia nueva; rigen los términos del modelo base |
| Formato de pesos | `safetensors` (+ `config.json`, pre/postprocesadores y tensores de normalización en la raíz del repo) |
| Fecha de publicacion | 20 de octubre de 2026 (según metadatos de HuggingFace) |
| Paso de entrenamiento guardado | 18.000 actualizaciones de optimizador (objetivo de la ejecución: 20.000) |
| Tamaño de lote de entrenamiento | 16 (1 proceso) |
| Dataset de entrenamiento | `Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1`, revisión `1ec623d8…` (100 demostraciones) |
| Entradas | 7 valores de articulación/pinza + cámara RGB cenital + cámara RGB en ángulo |
| Salidas | 7 objetivos absolutos para el seguidor: articulaciones en grados, pinza en milímetros |
| Chunk de acciones | 50 acciones por inferencia |
| Robótica objetivo | AgileX Piper (seguidor), con bloqueo de la articulación 4 según la configuración de entrenamiento |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino de SmolVLA, la política VLA compacta publicada por Hugging Face dentro del ecosistema LeRobot. SmolVLA combina un modelo de visión-lenguaje preentrenado (familia SmolVLM, ~500 M de parámetros) con un experto de acciones entrenado mediante flow matching, que genera chunks de acciones continuas condicionados por las observaciones visuales, el estado proprioceptivo y una instrucción en lenguaje natural. La variante aquí publicada mantiene esa estructura y añade las cabezas de entrada/salida específicas del Piper: vector de 7 dimensiones (6 articulaciones más pinza) y dos flujos de cámara.

El entrenamiento se realizó desde un checkpoint previo de SmolVLA (la configuración apunta a un `pretrained_path` terminado en `000050/pretrained_model`, es decir, una inicialización/reanudación temprana) durante 18.000 pasos con lote 16 sobre 100 episodios de teleoperación de la tarea de inserción de perno hexagonal. No se documenta composición del dataset más allá del número de demos, ni uso de RLHF/DPO, ni aumentos de datos; tampoco se especifica la precisión de entrenamiento ni el hardware empleado. El autor indica explícitamente que un dataset posterior de 80 demos con configuración «zero-home» no se usó en esta ejecución, lo que acota la distribución de estados cubierta.

Un detalle relevante para reproducibilidad: la model card distingue entre el campo `steps: 20000` de `train_config.json` (objetivo de la ejecución) y el paso real exportado, 18.000, verificado contra `training_state/training_step.json`. También se publican hashes SHA-256 de los siete ficheros de política y preprocesadores, además de `checkpoint_info.json` y `publication_manifest.json`. No se incluyen estados de optimizador, scheduler ni RNG, por lo que el checkpoint es únicamente de inferencia (o de reanudación sin historial de optimización).

## Capacidades

- Control visomotor de manipulación: genera acciones continuas de 7 dimensiones (6 articulaciones en grados y apertura de pinza en milímetros) a partir de dos vistas RGB y del estado articular.
- Ejecución de una tarea de inserción de precisión: coger un perno hexagonal y alinearlo/insertarlo en la ranura correspondiente.
- Predicción por chunks: emite 50 acciones por inferencia, lo que permite control a mayor frecuencia efectiva que un bucle paso a paso.
- Condicionamiento por instrucción en lenguaje natural: al ser una política VLA, acepta una descripción textual de la tarea; el alcance real está limitado por el dataset de ajuste fino.
- Integración nativa con LeRobot: carga mediante `SmolVLAPolicy.from_pretrained(...)`, con preprocesadores y tensores de normalización incluidos.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni generación de texto libre: es una política de control, no un asistente.

## Casos de uso

- Automatización de inserción de pernos en línea de montaje: el modelo recibe las dos cámaras y el estado del Piper y emite consignas articulares para alinear y insertar la pieza, sustituyendo scripted pick-and-place en una celda de tolerancia ajustada.
- Punto de partida para ajuste fino con demos propias: al ser un checkpoint SmolVLA ya especializado en manipulación fina, sirve como inicialización para tareas de ensamblaje similares con menos datos que partiendo del modelo base.
- Evaluación de pipelines VLA en LeRobot: útil como caso de prueba reproducible (paso, hashes, configuración y dataset documentados) para comparar estrategias de entrenamiento, tamaños de lote o número de demos.
- Despliegue en hardware embebido: con ~450 M de parámetros, es candidato a ejecutarse en Jetson Orin o en una GPU de consumo junto al lazo de control del robot, algo inviable con VLA de 3-7 B.
- Docencia y divulgación en robótica de imitación: ejemplo completo de teleoperación, curado de dataset, entrenamiento con LeRobot y publicación de checkpoint con procedencia verificable.
- Generación de datos sintéticos y evaluación sim-to-real: la política puede ejecutarse en simulador para estudiar sensibilidad a la posición de cámara, calibración y bloqueo de articulaciones antes de probar en el robot real.
- Estudio de robustez y seguridad en inserción: al no haber métricas de éxito publicadas, sirve como banco de pruebas para medir tasas de inserción, tiempos de tarea y modos de fallo bajo distintas condiciones de iluminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito de inserción, número de intentos, tiempo de tarea, ni comparación con el checkpoint base o con el dataset de 80 demostraciones. Tampoco se reportan latencia de inferencia ni throughput en el robot.

| Metrica | Resultado |
|---|---|
| Tasa de exito de insercion | No disponible |
| Tiempo medio de tarea | No disponible |
| Latencia de inferencia | No disponible |
| Comparacion con SmolVLA base | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del número de parámetros, no medida publicada): ~1,8 GB solo de pesos en fp32, ~0,9 GB en bf16, ~0,45 GB en int8; con dos codificadores de imagen, activaciones y preprocesado, el pico realista se sitúa en el entorno de 2-4 GB en bf16.
- GPU recomendadas: cualquier GPU con 8 GB o más. Una RTX 3060/4060 de 8-12 GB es suficiente; A100/H100 solo tendrían sentido para entrenamiento o para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, con margen amplio, incluidas GTX 1660/RTX 3050 de 6-8 GB en bf16 o int8. Para despliegue embebido, Jetson Orin Nano/NX/AGX son opciones plausibles por tamaño, aunque no hay mediciones publicadas.
- Opciones de despliegue: LeRobot (`SmolVLAPolicy.from_pretrained`) como vía canónica; exportación a ONNX/TensorRT o `llama.cpp` no está documentada para esta política y requeriría trabajo adicional. vLLM y TGI no aplican (no es un modelo de lenguaje autoregresivo).
- Latencia y throughput: no disponibles. SmolVLA está diseñado con inferencia asíncrona para solapar predicción y ejecución, pero este checkpoint no reporta cifras. Cualquier valor concreto debe medirse en el hardware objetivo con la configuración de cámaras del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Piper Hex-Bolt SmolVLA) | 450 M | VLA con flow matching, ajustado a una tarea | Chunk de 50 acciones; ventana de contexto no documentada | No disponible | Pesos en HuggingFace (LeRobot) |
| SmolVLA (base, Hugging Face) | ~450 M | VLA con flow matching, preentrenado multi-dataset | Chunk de acciones; contexto no documentado | Abierta (consultar términos del repo base) | Pesos y código en LeRobot |
| OpenVLA | ~7 B | VLA sobre Llama 2 + DINOv2/SigLIP, tokens de acción discretizados | Contexto de instrucción corto; sin chunks nativos | Licencia tipo Llama 2 con restricciones | Pesos abiertos en HuggingFace |
| π0 (Physical Intelligence) | ~3,3 B | VLA con flow matching sobre VLM, control continuo de alto nivel | Chunks de acciones; contexto no documentado aquí | Pesos abiertos; verificar términos en el repositorio del autor | Pesos publicados (openpi) |
| ACT (ALOHA / LeRobot) | Decenas de millones (no confirmado) | Transformer CVAE de imitación, sin componente lingüístico | Chunks de acciones | MIT en LeRobot (verificar) | Código y recetas en LeRobot |

La comparación relevante no es de capacidad generalista sino de encaje: frente a OpenVLA o π0, este checkpoint sacrifica generalización y escala por un coste de inferencia muy inferior y una especialización total en una sola tarea. Frente a ACT, añade condicionamiento por lenguaje y un VLM preentrenado, a cambio de mayor complejidad de despliegue y de un consumo de VRAM superior.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: entrenado con 100 demostraciones de una única tarea y una única configuración de robot, cámaras y utillaje. No se espera generalización a otras piezas, posiciones de cámara o robots.
- Sin licencia declarada: la model card afirma que la subida no asigna licencia nueva. El uso comercial queda en un limbo legal hasta aclarar los términos del modelo base y del dataset; no apto para producción sin revisión jurídica.
- Sin evidencia de éxito físico: la publicación verifica el paso de entrenamiento y la integridad de los ficheros, no la robustez ni la tasa de inserción. Cualquier despliegue exige evaluación propia.
- Dependencia de la calibración y del «joint-4 lock»: la política asume la configuración registrada (unidades, límites del robot, articulación 4 bloqueada). Desviarse de ella invalida las acciones predichas.
- Riesgo de fallo silencioso más que de alucinación textual: al ser una política de control, los errores se manifiestan como trayectorias plausibles pero incorrectas, con riesgo físico para el utillaje y el robot. Deben existir límites de par, paradas de emergencia y detección de colisiones independientes.
- Sensibilidad a la distribución visual: sin datos de aumento ni de condiciones de iluminación variables documentados, es esperable degradación ante cambios de luz, fondos o posición de las cámaras.
- Sesgo de dataset único: 100 demos de un solo operador implican un estilo de manipulación concreto; el modelo reproducirá sus sesgos cinemáticos.
- No multilingüe ni conversacional: no debe evaluarse como un asistente; las capacidades de lenguaje son solo el canal de condicionamiento.
- Sin estados de optimizador en el repositorio: no es reanudable para continuar el entrenamiento tal cual, solo para inferencia o ajuste desde cero del optimizador.
- Fecha de publicación en metadatos (octubre de 2026) posterior a la fecha de esta consulta: conviene verificar la vigencia y posibles revisiones del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samisaliveagain/piper-hexbolt-smolvla-bs16-step18000
- Dataset de entrenamiento: https://huggingface.co/datasets/Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1
- Repositorio LeRobot (librería y políticas SmolVLA): https://github.com/huggingface/lerobot
- Paper de SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Modelo base SmolVLA en HuggingFace: https://huggingface.co/lerobot/smolvla_base
- Familia SmolVLM (modelo de visión-lenguaje subyacente): https://huggingface.co/HuggingFaceTB
- Repositorio openpi de Physical Intelligence (referencia comparativa π0): https://github.com/Physical-Intelligence/openpi
- OpenVLA (referencia comparativa): https://github.com/openvla/openvla
- Documentación de AgileX Piper (robot objetivo): https://www.agilex.ai
