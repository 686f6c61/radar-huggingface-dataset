# OpenRAL/rskill-omdet_turbo-any-locator-fp16

## Resumen

`rskill-omdet_turbo-any-locator-fp16` es un paquete de habilidad (rSkill) publicado por OpenRAL que envuelve el detector open-vocabulary OmDet-Turbo con backbone Swin-tiny, originalmente publicado por OMLab como `omlab/omdet-turbo-swin-tiny-hf`. No se trata de un modelo entrenado desde cero por OpenRAL: el paquete no copia pesos y referencia el checkpoint upstream vía `hf://omlab/omdet-turbo-swin-tiny-hf`, con un manifiesto `rskill.yaml` que lo expone como servicio de localización bajo demanda dentro del stack de robótica OpenRAL.

El problema que resuelve es acotado y concreto: permitir que un razonador (reasoner) pregunte en tiempo de ejecución si un objeto descrito en lenguaje libre está presente en la imagen actual y dónde se encuentra, mediante la herramienta de solo lectura `locate_in_view`. Se posiciona como alternativa ligera, en proceso y en tiempo real al VLM LocateAnything de 3B para consultas simples del tipo "encuentra X", con un presupuesto de latencia declarado de 200 ms por invocación y un mínimo de VRAM de 0,6 GB.

La relevancia actual viene de su encaje en arquitecturas de percepción híbridas: este paquete cubre el modo `on_demand` del detector, mientras que su hermano `omdet-turbo-indoor` cubre el modo continuo con un vocabulario fijo de clases. Ambos comparten el mismo checkpoint Apache-2.0, de modo que el coste de pesos es único y la diferencia está en el contrato de servicio. El modelo subyacente tiene aproximadamente 115 M de parámetros y se distribuye en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer open-vocabulary con backbone Swin-tiny y Efficient Fusion Head (OmDet-Turbo) |
| Parametros totales | ~115 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no procesa secuencias de texto largas) |
| Tipos de cuantizacion | fp16 (declarado en el manifiesto como `quantization.dtype: fp16`); no se documentan otras variantes |
| Idiomas soportados | en (consultas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de `transformers` cargado vía `AutoModelForZeroShotObjectDetection`); no se distribuyen pesos en este repositorio |

## Arquitectura y entrenamiento

OmDet-Turbo es un detector open-vocabulary en tiempo real construido sobre un backbone Swin-tiny y una Efficient Fusion Head, descrito en el paper arXiv:2403.06892. El modelo se carga con `AutoModelForZeroShotObjectDetection` de `transformers` y se ejecuta en proceso mediante el backend `OmDetTurboDetector` de OpenRAL, con el tier `DetectorTier.ZEROSHOT_HF`. La consulta en lenguaje libre se convierte en una lista de clases multilabel mediante `query_to_classes`, que acepta separación por comas o por el token `</c>`; una frase suelta se interpreta como una única clase.

El entrenamiento es el del checkpoint upstream de OMLab: según la model card, datos de Objects365, GoldG y datos de grounding conforme a la release de OmDet-Turbo. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni si hubo etapas de RLHF o DPO, algo por otra parte esperable en un detector y no en un modelo generativo. La innovación técnica relevante para este paquete no está en el entrenamiento sino en el contrato de servicio: separación explícita entre modo continuo y modo bajo demanda, con dos rutas (`detect_with_query` para consultas puntuales sin alterar el vocabulario persistente, y `set_query` para retargeting persistente vía el tópico `detector_query`).

## Capacidades

- Detección de objetos open-vocabulary y zero-shot: acepta cualquier clase descrita en texto libre por el razonador, sin vocabulario cerrado predefinido.
- Localización bajo demanda: una pasada de detección sobre el frame actual, devolviendo `(label, confidence, bbox_xyxy)` como `ObjectDetection2D` dentro de `ObjectsMetadata`.
- Integración como herramienta de solo lectura (`locate_in_view`) invocable por un razonador, más un tópico de retargeting (`detector_query`).
- Funcionamiento en proceso sobre PyTorch, sin servicio externo ni salto de red.
- Compatibilidad con cualquier robot o simulador que aporte una cámara RGB de al menos 640×480, declarada con el comodín `embodiment_tags: ["any"]`.
- Escenas objetivo declaradas: tabletop, kitchen, indoor, household y office.
- No emite chunks de acción ni acciona actuadores: es exclusivamente percepción.
- Capacidades multimodales limitadas a visión (imagen de entrada, consulta de texto); no procesa audio ni vídeo como secuencia.

## Casos de uso

- Resolución de consultas puntuales del razonador en bucle cerrado: cuando el planificador necesita confirmar "¿está la taza roja en la mesa?", invoca `locate_in_view` y recibe caja y confianza en una sola pasada, sin contaminar el vocabulario persistente del detector continuo.
- Complemento de un detector continuo con vocabulario curado: el detector de fondo cubre las ~266 clases domésticas habituales y este paquete cubre los objetos fuera de ese conjunto, evitando ampliar el vocabulario continuo y su coste por frame.
- Manipulación de mesa con vocabulario abierto: ante instrucciones como "coge el destornillador de estrella pequeño", el razonador consulta el objeto exacto y obtiene la caja para el módulo de grasping, con latencia declarada de 200 ms por invocación.
- Sustitución de un VLM grande en tareas de localización simple: para consultas del tipo "encuentra X" en lugar de razonamiento visual complejo, este detector de ~115 M evita el coste de un VLM de 3B con 0,6 GB de VRAM mínima.
- Verificación de estado tras una acción: comprobar si un objeto sigue en el campo de visión después de una manipulación, como chequeo barato de éxito o fallo antes de replanificar.
- Despliegue en hardware de borde: al requerir solo una cámara RGB y 0,6 GB de VRAM en fp16, cabe en plataformas integradas con GPU modesta para robots de interior u oficina.
- Prototipado en simulación: `openral deploy sim` levanta este localizador por defecto junto al detector continuo cuando están presentes las dependencias `omdet`, lo que permite validar pipelines de percepción antes de trasladarlos a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de AP, mAP ni comparativas numéricas con otros detectores; solo declara un presupuesto de latencia de 200 ms por invocación y un mínimo de 0,6 GB de VRAM.

## Requisitos de hardware

- VRAM estimada: 0,6 GB mínimos declarados en el manifiesto, en fp16 y con pesos de ~115 M de parámetros.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el perfil de memoria, cualquier GPU consumer con al menos 1 GB libre es suficiente en teoría.
- Cabe en GPU consumer: sí, según el mínimo de VRAM declarado; no se detallan modelos concretos (RTX 4090, RTX 3060, Jetson, etc.).
- Opciones de despliegue: backend en proceso `OmDetTurboDetector` (`DetectorTier.ZEROSHOT_HF`) sobre PyTorch y `transformers`, con dependencias instaladas vía `just sync --group omdet`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, lo cual es coherente con un detector y no con un modelo generativo.
- Latencia: 200 ms por chunk declarados en `latency_budget.per_chunk_ms`. No se publica throughput (FPS) ni latencia medida en hardware concreto.
- Runtime declarado: `pytorch`, dtype `fp16`.

## Comparativa con modelos similares

| Modelo | Parametros | Modo | Contexto / vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-omdet_turbo-any-locator-fp16 (este) | ~115 M | Bajo demanda (`on_demand`), invocado por el razonador | Vocabulario abierto por consulta de texto libre | Apache-2.0 | Hugging Face (wrapper; pesos upstream) |
| OpenRAL/rskill-omdet_turbo-any-indoor-fp16 | ~115 M (mismo checkpoint) | Continuo, productor de fondo por frame | Vocabulario fijo curado de ~266 clases indoor | Apache-2.0 | Hugging Face |
| NVIDIA LocateAnything (VLM) | 3 B | Localización por consulta | No disponible en detalle | No disponible | Referenciado en la model card, sin enlace |
| omlab/omdet-turbo-swin-tiny-hf | ~115 M | Modelo base, sin contrato de servicio | Open-vocabulary | Apache-2.0 | Hugging Face |

La comparación relevante es interna al ecosistema OpenRAL: mismo checkpoint, distinto contrato de servicio. Frente al VLM de 3B citado por el autor, la diferencia declarada es de orden de magnitud en parámetros (115 M frente a 3 B) y en VRAM mínima, a cambio de limitarse a consultas simples de localización.

## Limitaciones y advertencias

- Modelo de detección, no generativo: no razona, no planifica y no produce texto; cualquier expectativa de razonamiento visual complejo queda fuera de su alcance por diseño.
- Idioma: las consultas deben formularse en inglés según el campo `language` de la model card; no se documenta soporte multilingüe.
- Riesgo de falsos negativos y positivos en vocabulario abierto: al aceptar clases en texto libre, la formulación de la consulta afecta al resultado; una frase se interpreta como una única clase, y la separación por comas o `</c>` cambia el conjunto consultado.
- Estado experimental: la tabla de robots soportados marca el soporte como `experimental` y limitado a cámara, sin validación documentada en hardware real.
- Dependencia de resolución mínima: requiere frames de al menos 640×480 en BGR `uint8`; por debajo de ese umbral el comportamiento no está documentado.
- Sin benchmarks publicados: no hay métricas de precisión que permitan estimar la tasa de error en dominios distintos de los declarados (tabletop, kitchen, indoor, household, office).
- Licencia: Apache-2.0 permite uso comercial, y el manifiesto deriva `is_commercial_use_allowed: true`; aun así, la licencia aplica al checkpoint upstream y conviene verificar los términos de los datasets de entrenamiento originales si el uso es comercial a gran escala.
- Madurez del paquete: 0 descargas y 0 likes en el momento de la consulta, versión `0.1.0`, lo que sugiere un artefacto reciente y poco validado por la comunidad.
- Inferencia no alojada: la model card marca `inference: false`, es decir, no hay endpoint de inferencia gestionado en Hugging Face; el despliegue corre por cuenta del usuario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpenRAL/rskill-omdet_turbo-any-locator-fp16
- Modelo base upstream: https://huggingface.co/omlab/omdet-turbo-swin-tiny-hf
- Paper de OmDet-Turbo: https://arxiv.org/abs/2403.06892
- README del rSkill en GitHub: https://github.com/OpenRAL/openral/blob/master/rskills/omdet-turbo-locator/README.md
- Repositorio OpenRAL en GitHub: https://github.com/OpenRAL/openral
- Detector continuo hermano: https://huggingface.co/OpenRAL/rskill-omdet_turbo-any-indoor-fp16
