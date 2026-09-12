# OpenRAL/rskill-sam2_1-any-grasped_object_mask-bf16

## Resumen

`OpenRAL/rskill-sam2_1-any-grasped_object_mask-bf16` es un paquete de habilidad (rSkill) publicado por OpenRAL que envuelve el modelo de segmentación promptable SAM 2.1 en su variante Hiera-small de Meta (`facebook/sam2.1-hiera-small`) bajo licencia Apache 2.0. No es un modelo nuevo ni un reentrenamiento: el repositorio ocupa 0,0 GB y no copia los pesos, sino que añade un manifiesto `rskill.yaml` con comprobación de capacidades, exposición de licencia, presupuestos de latencia e integración con un registro local. Su función es responder a una única pregunta geométrica: qué píxeles de un fotograma de cámara de muñeca pertenecen al objeto que está entre las pinzas del agarrador.

La habilidad se declara como `kind: segmenter` con una sola acción, `detect`, sin vocabulario de clases ni etiquetas: nunca dice qué es el objeto, solo qué píxeles lo forman. Su consumidor previsto es el productor de evidencia de agarre del HAL de OpenRAL, que proyecta el punto central de la herramienta en la cámara de muñeca, pide la máscara, la interseca con el canal de profundidad del mismo fotograma y ajusta hasta 16 primitivas acotadas de un `AttachedCollisionObject`. De este modo sustituye la introspección de MuJoCo (que da respuestas perfectas en simulación pero no existe en hardware real) por segmentación sobre imagen real. El modelo base es un transformer de segmentación con codificador de imagen Hiera-small; no se publican cifras de parámetros totales.

La relevancia del paquete es doble. Por un lado demuestra una integración in-process muy ligera (74 MiB de pesos, 297 MiB de pico asignado, 53 ms de latencia mediana en caliente en una RTX 4070 Laptop de 8 GB, conviviendo con un VLA de ~3,5 GiB). Por otro, la propia model card documenta un hallazgo de seguridad: una prompt mal dirigida devolvió una máscara que cubría el 59,8 % del fotograma con la puntuación de confianza más alta observada (0,978), motivo por el cual el diseño prohíbe aguas abajo confiar en la confianza del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (`Sam2Model` + `Sam2Processor` en transformers), codificador de imagen Hiera-small, segmentación promptable |
| Parametros totales | no disponible (el paquete no incluye pesos propios; referencia `facebook/sam2.1-hiera-small`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de visión. Entrada mínima 320×240; `Sam2Processor` redimensiona internamente a 1024² |
| Tipos de cuantizacion | bf16 como dtype de cómputo; sin cuantización adicional. Pesos: 74 MiB |
| Idiomas soportados | en (etiqueta declarada en la model card). El modelo no procesa lenguaje natural, solo imagen y puntos de prompt |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explícita; el repositorio tiene un tamaño de 0,0 GB y no copia los pesos de `facebook/sam2.1-hiera-small` |

Datos adicionales declarados en los metadatos: pipeline `mask-generation`, librería `sam2`, 0 descargas, 0 likes, creado el 2026-09-12, `inference: false`. Etiquetas relevantes: `rskill`, `segmenter`, `promptable-segmentation`, `any`, `attachment-evidence`, `grasped-object`, `arxiv:2408.00714`.

## Arquitectura y entrenamiento

SAM 2.1 es una arquitectura de primera clase en `transformers`, por lo que el paquete se ejecuta in-process mediante el backend `Sam2Segmenter` (`engine: sam2_hf`), sin entorno virtual auxiliar, sin ZMQ y sin más reducción de precisión que el dtype de cómputo bf16. El modelo base es `facebook/sam2.1-hiera-small`, con codificador de imagen Hiera. La habilidad acepta como entrada un fotograma RGB BGR `uint8` de la cámara de muñeca (mínimo 320×240) y uno o varios puntos de prompt en píxeles: uno positivo en el punto central de la herramienta (TCP) y, opcionalmente, negativos en las puntas de las pinzas. La salida son hasta tres máscaras booleanas a la resolución del fotograma de origen, ordenadas por área ascendente, más `mask_scores_advisory` (una puntuación por máscara, registrada en la traza y nunca usada como umbral ni para seleccionar).

Con `multimask: true` el modelo devuelve sus tres hipótesis anidadas (subparte, parte y objeto completo) y las tres cruzan la frontera del servicio. La habilidad no elige entre ellas de forma deliberada: carece de profundidad y solo la geometría (contención entre las pinzas, extensión del payload, validez de profundidad) puede determinar cuál es la carga; esa selección la realiza el productor del HAL, que sí dispone del fotograma de profundidad de la muñeca. El prompt cruza el límite del servicio como punto 3D y no como píxel, de modo que las intrínsecas de cámara permanecen íntegramente en el lado de percepción; las máscaras vuelven como `sensor_msgs/Image[]` en `mono8` sin codificación run-length. Las interfaces descritas (cámara de muñeca, puntos de prompt, máscaras, puntuaciones) no son un modelo lingüístico: no hay tokens de contexto, ni RLHF, ni DPO, ni datos de entrenamiento publicados en la información disponible. No se detalla la composición del dataset de entrenamiento de SAM 2.1 ni si hubo ajuste fino; la etiqueta `base_model:finetune:facebook/sam2.1-hiera-small` figura en los metadatos, mientras que la model card afirma explícitamente que el paquete no copia los pesos del modelo base, una discrepancia que conviene verificar antes de asumir que existen pesos ajustados.

## Capacidades

- Segmentación promptable por punto: dada una imagen y un punto, devuelve la máscara binaria del objeto sobre el que cae ese punto. Sin vocabulario de clases ni etiquetas.
- Multimask: devuelve hasta tres hipótesis anidadas (subparte, parte, objeto completo) ordenadas por área ascendente.
- Puntuación por máscara (`mask_scores_advisory`) expuesta como dato de traza, no como criterio de decisión.
- Integración in-process con `transformers` mediante `Sam2Model` y `Sam2Processor`, expuesta a través del servicio `openral_msgs/srv/SegmentInView`.
- Agnostica al cuerpo robótico (embodiment-agnostic): funciona con cualquier cámara RGB de muñeca de al menos 320×240.
- Escenas declaradas: tabletop, cocina, interior y doméstico.
- Objeto declarado: objeto agarrado (lo que esté entre las pinzas, sin vocabulario).
- Acción declarada: `detect`. Una sola toma por evento de agarre, soltado o reagarre.
- No incluye actuadores: el paquete no controla el robot, solo produce evidencia visual.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, audio ni modo de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Estimación del payload agarrado en hardware real: en cada evento de agarre, el productor de evidencia proyecta el TCP en la cámara de muñeca, pide la máscara al modelo y la interseca con el canal de profundidad. Sustituye la introspección de MuJoCo, que no existe fuera del simulador.
- Construcción de `AttachedCollisionObject` para el kernel de seguridad: a partir de la máscara y la profundidad se ajustan hasta 16 primitivas acotadas que describen la carga transportada, de modo que el planificador pueda planificar alrededor de ella.
- Manipulación de sobremesa (tabletop) y doméstica: el paquete declara soporte para escenas de cocina, interior y hogar, donde el objeto agarrado cambia de forma y tamaño entre tareas y no se dispone de un catálogo previo de clases.
- Reagarre y verificación de sujeción: una toma por evento de attach, detach y regrasp permite comprobar si el objeto sigue entre las pinzas tras una manipulación intermedia.
- Co-residencia con un VLA en GPU de consumo: con 297 MiB de pico asignado y 448 MiB reservados por torch, el segmentador convive con una política VLA de ~3,5 GiB en una tarjeta de 8 GB, manteniéndose residente y precalentado en la activación del nodo en lugar de cargarse bajo demanda.
- Segmentación promptable genérica por punto en pipelines de percepción: al ser agnóstica al cuerpo y no tener vocabulario, sirve como segmentador de propósito general para cualquier imagen RGB donde se conozca un punto interior del objeto de interés.
- Anotación y preetiquetado de datos de agarre: las tres hipótesis anidadas permiten generar propuestas de máscara a distintos niveles de granularidad para revisión posterior por un anotador humano.
- Pruebas de integración y sondas de calidad: la propia model card usa el modelo sobre fotogramas reales del repositorio para verificar el comportamiento del backend, incluyendo el caso de fallo controlado descrito más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; se trata de un modelo de segmentación y esas métricas no le son aplicables. La model card sí publica mediciones de recursos y latencia, realizadas en una RTX 4070 Laptop de 8 GB con transformers 5.5.4, torch 2.9.1+cu128, bf16, entrada de 512² y ~3,5 GiB ya residentes por un VLA co-cargado, mediante deltas de `torch.cuda.max_memory_allocated` contra una línea base previa a la carga.

| Metrica | SAM 2.1 hiera-small | SAM 3 (comparacion en la model card) |
|---|---|---|
| Pesos | 74 MiB | 1645 MiB |
| Pico asignado | 297 MiB | 2037 MiB |
| Reservado por torch | 448 MiB | 2262 MiB |
| Mediana en caliente | 53 ms | 418 ms |
| Primera llamada (en frio) | 742 ms | 970 ms |
| Latencia segun resolucion | Plana (46-52 ms de 224² a 1024²) | no disponible |

Sonda de calidad sobre dos fotogramas reales del repositorio, con un punto en `(0,52·W, 0,68·H)` como sustituto del TCP proyectado:

| Fotograma | Mejor IoU de la candidata | Cobertura de la mascara | Veredicto |
|---|---|---|---|
| Muñeca SO-101 sujetando una goma (320×240) | 0,842 | 5,4 % del fotograma | Aisla limpiamente la goma y excluye las pinzas |
| SO-101 en tercera persona, escena con fruta (640×480) | 0,978 | 59,8 % del fotograma | Prácticamente todo el mantel |

## Requisitos de hardware

- VRAM estimada: 74 MiB de pesos, 297 MiB de pico asignado y 448 MiB reservados por torch, medidos con bf16 y entrada de 512² sobre una base de ~3,5 GiB ya en memoria.
- GPU recomendadas: no se publica una lista. La única configuración medida es una RTX 4070 Laptop de 8 GB. Otras GPU (A100, H100, RTX 4090) no están documentadas en la información disponible.
- GPU de consumo: sí, cabe holgadamente en tarjetas de 8 GB, incluso compartiendo memoria con un VLA de ~3,5 GiB y un simulador. No se documentan pruebas en tarjetas de menor capacidad.
- Despliegue: in-process mediante `transformers` (`Sam2Model` + `Sam2Processor`) a través del backend `Sam2Segmenter` (`engine: sam2_hf`). No usa entorno virtual auxiliar ni ZMQ. La exposición al HAL se hace por el servicio `openral_msgs/srv/SegmentInView`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y los metadatos de HuggingFace marcan `inference: false`. Entorno verificado: transformers 5.5.4, torch 2.9.1+cu128.
- Latencia: 742 ms en la primera llamada y 53 ms de mediana en caliente. La latencia es plana respecto a la resolución de entrada (46-52 ms entre 224² y 1024²) porque `Sam2Processor` redimensiona siempre a 1024²; la resolución de la cámara de muñeca no es una palanca de rendimiento para este modelo.
- Restricción operativa: los 742 ms de la primera llamada no caben dentro de la barrera de acuse diferido del HAL (~100 ms), mientras que los 53 ms en caliente sí, con margen. Por eso el modelo se mantiene residente y precalentado en la activación del nodo.
- Throughput (imágenes por segundo): no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Memoria medida | Latencia en caliente | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `OpenRAL/rskill-sam2_1-any-grasped_object_mask-bf16` (este paquete) | no disponible (envuelve Hiera-small) | Imagen RGB ≥ 320×240; redimensionado interno a 1024² | 74 MiB pesos, 297 MiB pico | 53 ms | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `facebook/sam2.1-hiera-small` (modelo base) | no disponible | no disponible en la información proporcionada | idéntica a la de este paquete (no se copian pesos) | idéntica | no disponible en la información proporcionada | HuggingFace |
| SAM 3 (comparación incluida en la model card) | no disponible | no disponible | 1645 MiB pesos, 2037 MiB pico | 418 ms | no disponible | no disponible |

La comparación con otros segmentadores promptables del mismo tamaño (por ejemplo, otras variantes de la familia SAM 2.1 o de SAM 1) no está disponible en la información proporcionada. La única alternativa cuantificada es SAM 3, que en las mediciones de la model card requiere 22× más memoria de pesos, 6,9× más pico asignado y 7,9× más latencia en caliente.

## Limitaciones y advertencias

- La puntuación de confianza del modelo no es fiable y no debe usarse como filtro. En la sonda de calidad, una prompt mal dirigida o fuera de contexto devolvió una máscara que cubría el 59,8 % del fotograma con la puntuación más alta observada (0,978), frente al caso correcto, que obtuvo 0,842 con solo el 5,4 % de cobertura.
- El modelo no tiene vocabulario ni clases: no dice qué son los píxeles, solo cuáles pertenecen a lo señalado. No sirve para reconocimiento de objetos ni para decisiones semánticas.
- No dispone de profundidad: por diseño no elige entre las tres hipótesis anidadas. La selección depende del productor del HAL, que sí tiene el fotograma de profundidad. Fuera de ese contexto, el consumidor debe implementar su propio criterio geométrico.
- Sensibilidad a la prompt: un punto proyectado incorrectamente degrada la máscara sin señal de error apreciable en la puntuación. La evidencia visual producida debe tratarse como no fiable por defecto.
- Orientado a un único evento: una toma por attach, detach o regrasp. No está diseñado como segmentador de vídeo continuo ni como seguidor de objeto a lo largo del tiempo.
- El modelo no incluye actuadores y no puede ejecutar acciones sobre el robot.
- Idioma: la etiqueta declarada es `en`; el modelo no procesa lenguaje natural, por lo que no ofrece capacidades multilingües en el sentido habitual.
- Resolución: la latencia es plana respecto a la resolución de entrada, así que aumentar la resolución de la cámara de muñeca no mejora el rendimiento ni reduce el coste; el procesador siempre redimensiona a 1024².
- Arranque en frío: 742 ms en la primera llamada, incompatible con la barrera de acuse diferido del HAL (~100 ms). En producción es obligatorio precalentar el modelo durante la activación del nodo.
- Licencia Apache 2.0 sobre el paquete, pero la model card no aclara la licencia ni las condiciones del modelo base y de los pesos referenciados; conviene verificarlas por separado antes de un uso comercial. Los metadatos incluyen la etiqueta `base_model:finetune`, que contradice la afirmación de la model card de que no se copian pesos: hay que confirmar si existen pesos ajustados y bajo qué condiciones.
- Adopción nula: 0 descargas y 0 likes, repositorio de 0,0 GB y `inference: false`. Es un componente pensado para el stack OpenRAL, no una librería de propósito general consolidada.
- Sesgos conocidos: no se documentan en la información disponible. Al depender de SAM 2.1, hereda los sesgos de su dataset de entrenamiento, que tampoco se detalla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenRAL/rskill-sam2_1-any-grasped_object_mask-bf16
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-small
- Paper de SAM 2 (referencia `arxiv:2408.00714` en las etiquetas): https://arxiv.org/abs/2408.00714
- Backend de inferencia citado en la model card (ruta relativa dentro del repositorio): `python/runner/src/openral_runner/backends/gstreamer/sam2_segmenter.py`
- Interfaz de servicio citada en la model card: `openral_msgs/srv/SegmentInView`
- Resultados de la búsqueda web: no contenían enlaces relevantes al modelo. Todas las entradas devueltas correspondían a contenido no relacionado (sitios de juegos y comercio de ropa), por lo que no se incluyen.
