# OpenRAL/rskill-omdet_turbo-any-indoor-fp16

## Resumen

rskill-omdet_turbo-any-indoor-fp16 es un paquete de percepción (rSkill) publicado por OpenRAL que envuelve el detector de objetos open-vocabulary OmDet-Turbo con backbone Swin-tiny, desarrollado originalmente por OMLab. No se trata de un modelo nuevo: el paquete no copia pesos y apunta al checkpoint upstream `omlab/omdet-turbo-swin-tiny-hf`, añadiendo un manifiesto `rskill.yaml` con el contrato de detector de vocabulario fijo, comprobación de capacidades, exposición de licencia y presupuestos de latencia. El modelo base ronda los 115 M de parámetros y se ejecuta en fp16 sobre PyTorch.

El problema que resuelve es la percepción de objetos en robótica y sistemas de mundo (world models) sin depender de las 80 categorías de COCO. El paquete fija un vocabulario curado de aproximadamente 266 clases de interior (menaje de cocina, electrodomésticos, muebles, herramientas, contenedores) y publica detecciones 2D en el bus de percepción `/openral/perception/objects` en cada fotograma, sin que el razonador tenga que solicitarlo. Es un productor de percepción en segundo plano, sin actuadores ni contrato de propiocepción.

Su relevancia radica en la integración: al ser una arquitectura nativa de `transformers` (`AutoModelForZeroShotObjectDetection`), se carga bajo el runtime de OpenRAL con `transformers>=5` en proceso, sin venv sidecar ni ZMQ, a diferencia de alternativas VLM más pesadas. Está pensado para cualquier robot con una cámara RGB de al menos 640×480 y declara un presupuesto de latencia de 200 ms por fragmento con un mínimo de 0,6 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer open-vocabulary con backbone Swin-tiny (OmDet-Turbo, Efficient Fusion Head) |
| Parametros totales | ~115 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no aplica contexto textual) |
| Tipos de cuantizacion | fp16 (dtype declarado en el manifiesto) |
| Idiomas soportados | en (etiquetas de vocabulario en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos upstream en `hf://omlab/omdet-turbo-swin-tiny-hf`; el paquete no copia pesos) |

## Arquitectura y entrenamiento

OmDet-Turbo es un detector transformer de vocabulario abierto en tiempo real descrito en el paper *Real-time Transformer-based Open-Vocabulary Detection with Efficient Fusion Head* (arXiv:2403.06892). Combina un backbone Swin-tiny con una cabeza de fusión eficiente que permite condicionar la detección sobre etiquetas textuales en el momento de la inferencia, lo que lo hace apto para zero-shot. El paquete expone esta capacidad mediante `processor.post_process_grounded_object_detection`, aplicando un vocabulario fijo declarado en el manifiesto en lugar de consultas dinámicas.

En cuanto a entrenamiento, la model card indica que los datos upstream corresponden a Objects365, GoldG y datos de grounding según la release de OmDet-Turbo; no se detalla el número de tokens ni la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicable en un detector). La innovación relevante para este paquete no está en el modelo sino en el empaquetado: un backend `OmDetTurboDetector` que carga procesador y modelo en la primera llamada a `detect()`, mueve el modelo a CUDA cuando está disponible (con fallback a CPU) y se selecciona como `DetectorTier.ZEROSHOT_HF` cuando el manifiesto declara `detector.engine: zeroshot_hf`.

## Capacidades

- Detección de objetos open-vocabulary sobre un vocabulario fijo de aproximadamente 266 clases de interior (cocina, menaje, electrodomésticos, muebles, herramientas, contenedores).
- Salida de detecciones 2D como `ObjectsMetadata`: lista de `ObjectDetection2D` con `(label, confidence, bbox_xyxy)`.
- Publicación automática en el bus de percepción `/openral/perception/objects` en cada fotograma, sin prompting del razonador.
- Funcionamiento zero-shot sobre las etiquetas del manifiesto, sin reentrenamiento.
- Entrada de cámara RGB en formato BGR `uint8` con resolución mínima de 640×480.
- Independencia de embodiment: cualquier robot o plataforma con cámara RGB.
- No emite chunks de acción ni controla actuadores; no tiene contrato de propiocepción.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un detector, no un LLM).
- Capacidades multilingües no disponibles: el vocabulario y los idiomas declarados son únicamente inglés.

## Casos de uso

- Percepción de fondo en robots manipuladores: el detector publica cada fotograma las clases de interior presentes en la escena, de modo que el world model dispone de un inventario de objetos mucho más rico que las 80 clases de COCO sin consumir turnos del razonador.
- Asistencia en cocina robotizada: con clases de menaje, utensilios y electrodomésticos en el vocabulario, un brazo robótico puede localizar platos, tazas o sartenes antes de planificar una manipulación.
- Inventario y organización de escritorio u oficina: detección de herramientas, contenedores y material de oficina para tareas de ordenación o auditoría de stock en entornos domésticos y de laboratorio.
- Navegación asistida en interiores: las cajas 2D de muebles y obstáculos domésticos sirven como señal de percepción para capas de evitación o planificación de trayectorias en robots móviles con cámara RGB.
- Prototipado de pipelines de percepción en OpenRAL: al cargarse en proceso con `transformers>=5` y un presupuesto de 200 ms, es adecuado para iterar sobre el contrato de observación sin montar un sidecar ni un entorno virtual separado.
- Investigación en world models y VLA: proporciona una fuente de etiquetas de objetos de interior a bajo coste (0,6 GB de VRAM mínima) para alimentar modelos que necesitan contexto semántico de la escena.
- Monitorización de entornos domésticos: detección continua de objetos en cocina, baño u oficina para aplicaciones de domótica o registro de estado de la estancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM mínima declarada: 0,6 GB (fp16).
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 0,6 GB de VRAM libre y soporte CUDA es suficiente para el checkpoint de ~115 M de parámetros.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo; la model card no enumera modelos concretos como RTX 4090 o similares.
- Despliegue: runtime de OpenRAL con backend `OmDetTurboDetector` sobre PyTorch y `transformers>=5`; fallback a CPU cuando no hay CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de este tipo).
- Latencia: presupuesto declarado de 200 ms por fragmento (`latency_budget.per_chunk_ms`). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / vocabulario | Licencia | Formato de despliegue | Notas |
|---|---|---|---|---|---|
| rskill-omdet_turbo-any-indoor-fp16 | ~115 M | Vocabulario fijo de ~266 clases de interior | apache-2.0 | En proceso, PyTorch + transformers>=5 | Objeto de esta ficha |
| omlab/omdet-turbo-swin-tiny-hf | ~115 M | Open-vocabulary upstream (consultas dinámicas) | apache-2.0 | PyTorch + transformers | Checkpoint base; el paquete no copia sus pesos |
| locateanything-3b-nf4 (citado en la model card) | ~3 B (no confirmado) | VLM de localización | no disponible | Sidecar con `transformers==4.57.1`, ZMQ | Más pesado y fuera de proceso; se menciona como contraste, sin datos de rendimiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- El vocabulario es fijo (~266 clases de interior): el razonador no puede redirigir el detector a clases nuevas sin cambiar el manifiesto, por lo que se comporta como un detector de vocabulario cerrado grande.
- Solo se declara soporte de inglés; las etiquetas y el vocabulario están en inglés.
- El estado del soporte de robots se marca como experimental y limitado a cámara RGB.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; como detector open-vocabulary, la precisión depende de la similitud entre las etiquetas del vocabulario y los objetos reales, y pueden aparecer falsos positivos en clases visualmente próximas.
- No hay datos publicados de benchmarks, por lo que no es posible validar la precisión (mAP) frente a alternativas.
- No emite acciones ni tiene contrato de propiocepción: no sirve por sí solo para control.
- La licencia Apache-2.0 permite uso comercial según el propio manifiesto (`is_commercial_use_allowed: true`), pero conviene verificar la licencia del checkpoint upstream antes de redistribuir.
- El paquete no incluye los pesos: requiere acceso a `hf://omlab/omdet-turbo-swin-tiny-hf` en tiempo de ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-omdet_turbo-any-indoor-fp16
- Repositorio GitHub del rSkill: https://github.com/OpenRAL/openral/tree/master/rskills/omdet-turbo-indoor/
- Modelo base upstream: https://huggingface.co/omlab/omdet-turbo-swin-tiny-hf
- Paper: https://arxiv.org/abs/2403.06892
