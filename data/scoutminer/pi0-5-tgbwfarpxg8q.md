# scoutminer/pi0.5-TgbWfarpxG8Q

## Resumen

π0.5 AXIS v2.0 es un merge de pesos (task-vector merge) de dos modelos públicos de la competición SN80 (Bittensor, subred 80), construido sobre una inicialización común. No es un modelo entrenado desde cero: el autor, scoutminer (Catherine Foster), combina los pesos de tres checkpoints mediante la fórmula θ = θ_A + 1.0·(θ_N − θ_A) + 0.3·(θ_Z − θ_A), donde A es el ancla común, N y Z son los modelos donantes. El resultado se publica como un checkpoint derivado de π0.5, el modelo Vision-Language-Action (VLA) de Physical Intelligence.

El modelo hereda la arquitectura de π0.5, un VLA basado en PaliGemma/openpi que combina un backbone visión-lenguaje con un decodificador de acciones para control robótico de extremo a extremo. Su propósito es la generalización en mundo abierto para manipulación robótica de horizonte largo: recibe observaciones visuales e instrucciones en lenguaje natural y emite secuencias de acciones motoras.

Es relevante en el contexto de la investigación en robótica porque demuestra que técnicas de merging (interpolación de vectores de tarea) pueden mejorar el rendimiento de políticas VLA sin reentrenamiento adicional, y porque se enmarca en el ecosistema abierto de openpi y LeRobot. El repo ocupa 12.4 GB y no registra descargas ni valoraciones en el momento de la consulta. Existe también una variante anterior, AXIS v1.0, según indica la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 / PaliGemma + openpi; no disponible el detalle interno de capas |
| Parametros totales | no disponible en la informacion proporcionada (repo de 12.4 GB) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del repo son presumiblemente de precision completa; no se documenta) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | gemma (LICENSE_GEMMA.txt), con LICENSE_OPENPI.txt y NOTICE adicionales |
| Formato de pesos | no disponible; derivado de pesos openpi/Gemma (safetensors presumible, no confirmado) |

## Arquitectura y entrenamiento

π0.5 es un modelo Vision-Language-Action desarrollado por Physical Intelligence. La familia openpi incluye tres tipos de modelos: π0 (VLA basado en flow matching), π0-FAST (VLA autorregresivo basado en el tokenizador de acciones FAST) y π0.5 (evolución de π0 con mejor generalización en mundo abierto). π0.5 se apoya en PaliGemma (a su vez derivado de Gemma) como backbone visión-lenguaje y se co-entrena sobre fuentes heterogéneas: demostraciones de robot, datos web y subtareas semánticas, con el objetivo de lograr generalización en mundo abierto para manipulación de horizonte largo (paper arXiv:2504.16054).

En el caso de este checkpoint concreto, no hay entrenamiento nuevo. El autor aplica exclusivamente un task-vector merge sobre una inicialización común compartida por tres modelos de la competición SN80 de Bittensor: el ancla deepmaster/pi0.5-s8bNBi2ZQghb, y los donantes nakamotosantosh/pi0.5-GE38YpXNDVWi (coeficiente 1.0) y Zayaan/pi0.5-dHGSxNJcwbYE (coeficiente 0.3). La metodología consiste en sumar al ancla las diferencias de pesos (deltas de tarea) de cada donante respecto a la inicialización compartida, ponderando cada contribución. No se documentan pasos de RLHF, DPO ni ajuste posterior.

## Capacidades

- Control robótico de extremo a extremo: genera secuencias de acciones motoras (action chunks) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Generalización en mundo abierto para manipulación de horizonte largo, según el diseño de π0.5.
- Co-entrenamiento con datos de robot, datos web y subtareas semánticas (característica de la base π0.5).
- Procesamiento conjunto de visión y lenguaje como entrada para el control (VLA).
- Inferencia de políticas compatible con el ecosistema openpi y con la implementación de LeRobot (Pi05 Policy).
- Exportación optimizada para dispositivos on-device vía Qualcomm AI Hub (referida a la base π0.5, no específicamente a este merge).
- Tool calling, function calling y uso como agente conversacional: no aplica; se trata de un modelo de robótica, no de un LLM de propósito general. No disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Manipulación robótica de horizonte largo: el modelo recibe una instrucción en lenguaje natural y una o varias imágenes de la escena y produce una secuencia de acciones que un brazo robótico ejecuta para completar una tarea compuesta en varios pasos. Su co-entrenamiento sobre subtareas semánticas favorece este escenario.
- Investigación comparativa de merging de modelos: sirve como punto de partida para reproducir y comparar estrategias de task-vector merge (coeficientes, anclas y donantes) sobre políticas VLA, reutilizando la evaluación oficial openroboto-evaluation.
- Benchmarking en competiciones de robótica (subred SN80 de Bittensor): el checkpoint está pensado para participar en la competición, por lo que su uso natural es la evaluación por tareas y semillas frente a otros modelos.
- Generalización a entornos no vistos: al heredar el objetivo de open-world generalization de π0.5, es adecuado para probar políticas en escenas y objetos que no aparecen en el conjunto de entrenamiento original.
- Integración en stacks de control con openpi/LeRobot: puede cargarse como policy dentro de las herramientas del ecosistema openpi o de la implementación Pi05 de LeRobot para ejecutar episodios reales o simulados.
- Experimentación en simulación antes de despliegue físico: dado que el repo pesa 12.4 GB y la evaluación reportada se hizo en H100, es viable evaluarlo primero en simulación para estimar la tasa de éxito antes de moverlo a hardware robótico real.
- Punto de partida para ajuste específico de tarea: aunque este checkpoint no se ha entrenado adicionalmente, puede servir como inicialización para un fine-tuning posterior sobre un dominio concreto (no documentado por el autor).

## Benchmarks y rendimiento

Se dispone únicamente de la evaluación local publicada por el autor (openroboto-evaluation oficial, 30 tareas × 20 ensayos, sobre NVIDIA H100), comparando este merge con el modelo N en solitario:

| Semilla de escena | Este merge | N en solitario |
|---|---:|---:|
| 1001 | 0.3250 | 0.2183 |
| 1533349259 | 0.2917 | 0.2283 |

No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que no son aplicables a un modelo de robótica. El autor indica además que existe una evaluación previa de AXIS v1.0, pero no se detalla en la información disponible.

## Requisitos de hardware

- Tamaño del repo: 12.4 GB, lo que condiciona la VRAM mínima para cargar los pesos en el formato publicado.
- Evaluación reportada por el autor: NVIDIA H100, lo que sugiere que el entorno de referencia es GPU de centro de datos.
- VRAM estimada para inferencia: no disponible de forma explícita; dependerá del número real de parámetros y de la cuantización aplicada, ninguno de los dos documentado.
- GPU recomendadas: H100 (confirmada por el autor); no se especifican A100, RTX 4090 ni otras. No disponible.
- Viabilidad en GPU de consumo: no disponible; no se documenta si cabe en tarjetas tipo RTX 4090.
- Opciones de despliegue: ecosistema openpi (Physical-Intelligence/openpi), implementación Pi05 de LeRobot y scripts de exportación on-device de Qualcomm AI Hub para la base π0.5. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Origen | Contexto | Rendimiento (eval. autor) | Licencia |
|---|---|---|---|---|---|
| π0.5 AXIS v2.0 (este) | VLA merge | scoutminer | no disponible | 0.3250 / 0.2917 | gemma |
| nakamotosantosh/pi0.5-GE38YpXNDVWi (N) | VLA (donante, competición SN80) | nakamotosantosh | no disponible | 0.2183 / 0.2283 (en solitario) | no disponible |
| deepmaster/pi0.5-s8bNBi2ZQghb (A) | VLA (ancla, competición SN80) | deepmaster | no disponible | no disponible | no disponible |
| Zayaan/pi0.5-dHGSxNJcwbYE (Z) | VLA (donante, competición SN80) | Zayaan | no disponible | no disponible | no disponible |
| π0.5 base | VLA | Physical Intelligence | no disponible | no disponible en esta ficha | openpi / Gemma |

La comparativa se limita a los modelos emparentados directamente con este checkpoint, ya que no se aportan datos de alternativas de otros desarrolladores. No disponible para modelos externos a la familia π0.5.

## Limitaciones y advertencias

- No es un modelo entrenado: es un merge de pesos sin entrenamiento adicional, por lo que su comportamiento depende enteramente de la calidad de los modelos donantes y de la inicialización común.
- Resultados de evaluación muy limitados: solo dos semillas de escena y una comparación con un único modelo (N), sin intervalos de confianza ni número de ensayos por semilla reportado más allá del total (30 tareas × 20 ensayos).
- Cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.
- Licencia gemma: el uso está sujeto a los términos de la licencia Gemma (LICENSE_GEMMA.txt) y a las condiciones de openpi (LICENSE_OPENPI.txt) y NOTICE. Es imprescindible revisar las restricciones de uso comercial antes de cualquier despliegue en producción.
- Riesgo de alucinación: aplicable en el sentido de generar secuencias de acciones incorrectas o no seguras ante escenas fuera de distribución; no se documentan medidas de seguridad específicas para el merge.
- Limitaciones de contexto e idioma: no disponibles.
- Advertencia para producción: al tratarse de un merge experimental de competición, con fecha de creación posterior a la actual (2026-09-29 según HuggingFace), no debe asumirse estabilidad ni soporte a largo plazo.
- Sesgos conocidos: no disponibles.
- El crédito de la capacidad subyacente corresponde a los autores de los modelos padre, no al autor del merge.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scoutminer/pi0.5-TgbWfarpxG8Q
- Ancla (A): https://huggingface.co/deepmaster/pi0.5-s8bNBi2ZQghb (@908cdd2c)
- Donante (N): https://huggingface.co/nakamotosantosh/pi0.5-GE38YpXNDVWi (@9defd147)
- Donante (Z): https://huggingface.co/Zayaan/pi0.5-dHGSxNJcwbYE (@4633e828)
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Documentación Pi05 Policy en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Paper π0.5 (arXiv:2504.16054): https://arxiv.org/abs/2504.16054
- Implementación Pi05 en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
- Perfil del autor: https://huggingface.co/scoutminer/models
