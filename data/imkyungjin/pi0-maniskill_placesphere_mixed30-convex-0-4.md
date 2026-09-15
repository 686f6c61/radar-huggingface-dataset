# ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.4

## Resumen

El modelo `ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.4` es un ajuste fino de π₀ (Pi0), el modelo visión-lenguaje-acción (VLA) para control robótico general desarrollado por Physical Intelligence, publicado por el usuario ImKyungjin mediante la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje conversacional: su etiqueta de pipeline es `robotics` y su función es transformar observaciones visuales e instrucciones en lenguaje natural en secuencias de acciones motoras.

Con 3.501.372.176 parámetros (unos 3,5 B) almacenados en safetensors y un repositorio de 7 GB, se sitúa en el rango medio de la familia VLA. La implementación de LeRobot está adaptada del repositorio abierto OpenPI de Physical Intelligence. El identificador apunta a un ajuste sobre el conjunto de datos `local/maniskill_placesphere_mixed30`, vinculado al simulador de manipulación ManiSkill, aunque la model card no documenta ni la composición del dataset ni el procedimiento de entrenamiento.

Su interés es fundamentalmente metodológico: sirve como ejemplo reproducible del flujo de ajuste de una política VLA de propósito general con LeRobot y como punto de partida para investigación en aprendizaje por imitación sobre entornos simulados. Conviene tener presente que el repositorio acumula 0 descargas y 0 «likes», y que la documentación publicada se limita a la plantilla genérica de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀; adaptación de LeRobot a partir de OpenPI |
| Parámetros totales | 3.501.372.176 (~3,5 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors, ~7 GB, compatibles con bf16) |
| Idiomas soportados | no disponible (acepta instrucciones en lenguaje natural; idioma no documentado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (LeRobot) |
| Tipo de tarea | control robótico / manipulación (pipeline `robotics`) |
| Dataset de entrenamiento | `local/maniskill_placesphere_mixed30` |
| Biblioteca | lerobot |
| Repositorio | 7,0 GB |
| Descargas / «likes» | 0 / 0 |

## Arquitectura y entrenamiento

π₀ es un modelo visión-lenguaje-acción: recibe como entrada imágenes de cámara y una instrucción textual, y emite un *chunk* de acciones de bajo nivel para un robot. En su formulación original descrita por Physical Intelligence, π₀ parte de un backbone visión-lenguaje tipo PaliGemma (codificador visual SigLIP más un modelo de lenguaje Gemma) y le añade un «experto de acciones» independiente que genera trayectorias motoras mediante *flow matching*. La model card de este repositorio confirma únicamente que se trata de la implementación de LeRobot adaptada de OpenPI y que el modelo es una política generalista capaz de interpretar entradas visuales y lenguaje natural para controlar distintos robots.

No hay información publicada sobre el entrenamiento de este checkpoint concreto: se desconoce el número de episodios, el número de tokens, la composición exacta del dataset `maniskill_placesphere_mixed30`, el número de épocas y si se aplicaron técnicas de ajuste como RLHF, DPO o *reward modeling*. El sufijo «convex-0.4» del identificador no aparece explicado en la documentación, por lo que no es posible atribuirle un significado técnico verificado. El nombre del conjunto de datos sugiere una mezcla de 30 tareas («mixed30») con una tarea de colocación de esfera («placesphere») en ManiSkill, pero se trata de una interpretación no confirmada por el autor.

## Capacidades

- Generación de acciones motoras: produce secuencias de acciones (*action chunks*) para control de robots manipuladores a partir de observaciones visuales.
- Comprensión de instrucciones en lenguaje natural: la política condiciona su comportamiento en una orden textual, característica definitoria de los modelos VLA.
- Percepción visual: procesa imágenes de cámara como entrada principal junto con el estado del robot.
- Control multi-tarea: el entrenamiento sobre un conjunto «mixed30» apunta a una política que cubre varias tareas dentro del mismo dominio.
- Ajuste específico de dominio para simulación: entrenado sobre datos de ManiSkill, un simulador de manipulación con paralelización en GPU.
- No soporta *tool calling* ni *function calling*: no expone interfaz de llamada a herramientas.
- No es un agente conversacional ni un modelo de razonamiento multi-paso en lenguaje: no genera texto de respuesta al usuario.
- Capacidades multilingües: no disponibles.
- Modos especiales (modo *thinking*, visión generativa, audio, salida de texto): no disponibles.

## Casos de uso

- Evaluación de políticas VLA en simulación: cargar el checkpoint con `lerobot-record` sobre un entorno ManiSkill o un robot simulado equivalente y medir la tasa de éxito en las tareas del conjunto «mixed30», aprovechando que la política fue entrenada precisamente en ese dominio.
- Investigación en aprendizaje por imitación: usar el modelo como referencia ajustada para estudiar el efecto de hiperparámetros (el sufijo «convex-0.4» sugiere una variante de configuración) comparando con otros checkpoints del mismo autor.
- Punto de partida para *fine-tuning* sobre hardware real: al ser un modelo π₀ de propósito general, puede servir como inicialización para un ajuste posterior con datos teleoperados de un brazo real, reduciendo el coste frente a entrenar desde cero.
- Control de brazos robóticos de bajo coste: con la integración de LeRobot para robots tipo SO-100/SO-101, el modelo puede desplegarse como política de manipulación pick-and-place en montajes de laboratorio de bajo presupuesto.
- Generación de trayectorias sintéticas: ejecutar la política en simulación para producir episodios etiquetados que alimenten un bucle de *data augmentation* o de *learning from demonstrations*.
- Docencia y robótica educativa: ilustrar de forma práctica el ciclo completo de un modelo VLA (dataset, entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) en cursos de robótica o aprendizaje automático.
- *Baseline* en competiciones o retos de manipulación: usar el checkpoint como referencia reproducible frente a otras arquitecturas (ACT, Diffusion Policy) sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de ManiSkill ni comparaciones cuantitativas con otras políticas, y el repositorio no registra descargas que permitan inferir validaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 3,5 B de parámetros ocupan aproximadamente 7 GB, por lo que se recomienda un mínimo de 12-16 GB contando activaciones y memoria del entorno de simulación; en FP32 serían unos 14 GB solo de pesos.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y evaluación intensiva; RTX 4090 o RTX 3090 para inferencia y ajuste ligero.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas con 16 GB o más (RTX 4080/4090, RTX 3090, RTX 4060 Ti de 16 GB) en precisión bf16. Por debajo de 12 GB habría que recurrir a cuantización, no documentada oficialmente para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` para inferencia y evaluación con `--policy.path`) y la pila de OpenPI sobre PyTorch. No se distribuyen pesos en GGUF, por lo que llama.cpp y Ollama no son aplicables; vLLM y TGI tampoco, al no tratarse de un modelo de generación de texto.
- Latencia y throughput: no disponibles para este checkpoint. La frecuencia de control depende del hardware, del simulador y del número de cámaras de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Este modelo (pi0 ajustado, ManiSkill) | ~3,5 B | no disponible | VLA | apache-2.0 | Hugging Face (0 descargas) | no disponible |
| π₀ base (OpenPI, Physical Intelligence) | no disponible | no disponible | VLA | no disponible | open source vía OpenPI | no disponible |
| OpenVLA-7B | ~7 B | no disponible | VLA | no disponible | Hugging Face | no disponible |
| SmolVLA | ~450 M | no disponible | VLA | no disponible | Hugging Face (LeRobot) | no disponible |
| Octo | no disponible | no disponible | política transformer | no disponible | open source | no disponible |

La comparación cuantitativa de rendimiento no es posible con la información disponible: no se han publicado métricas de este checkpoint ni evaluaciones cruzadas con las alternativas. Los modelos listados se incluyen por pertenecer a la misma categoría funcional (políticas de manipulación condicionadas por lenguaje), no como referencia de rendimiento.

## Limitaciones y advertencias

- Dominio restringido: es una política robótica, no un modelo de lenguaje; no puede emplearse para generación de texto, resumen, código ni tareas conversacionales.
- Entrenamiento en simulación: el dataset procede de ManiSkill, por lo que el comportamiento en un robot físico puede degradarse de forma notable sin un ajuste específico (*sim-to-real gap*).
- Documentación mínima: la model card es la plantilla genérica de LeRobot y no describe datos, hiperparámetros, métricas ni el significado del sufijo «convex-0.4».
- Sin validación comunitaria: 0 descargas y 0 «likes» implican ausencia de verificación independiente de que el checkpoint funcione según lo esperado.
- Riesgo de sobreajuste: al cubrir solo 30 tareas mixtas, la política puede fallar ante objetos, posiciones o instrucciones fuera de la distribución de entrenamiento.
- Alucinación en sentido operativo: el modelo puede emitir acciones incorrectas o inconsistentes con la instrucción, con riesgo físico si se ejecuta sobre hardware real; se recomienda validar siempre en simulación y con límites de par y velocidad.
- Idiomas: no se documenta qué lenguas entienden las instrucciones de texto; el comportamiento multilingüe es desconocido.
- Licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial, pero conviene revisar los términos de los componentes base (π₀/OpenPI y el backbone visión-lenguaje subyacente) antes de un despliegue comercial, ya que podrían imponer condiciones adicionales.
- Sin soporte de cuantización documentado: desplegar en GPUs de menos de 12 GB exigiría cuantizar por cuenta propia, sin garantías de mantener la precisión de las acciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.4
- Blog de π₀ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Simulador ManiSkill: https://github.com/haosulab/ManiSkill
- OpenVLA-7B (alternativa comparable): https://huggingface.co/openvla/openvla-7b
- SmolVLA (alternativa comparable, LeRobot): https://huggingface.co/lerobot/smolvla_base
- Octo (alternativa comparable): https://github.com/octo-models/octo
