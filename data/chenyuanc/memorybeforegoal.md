# ChenyuanC/MemorybeforeGoal

## Resumen

MemorybeforeGoal es un modelo de vision-lenguaje-accion (VLA) para robótica humanoide, publicado por el usuario ChenyuanC en HuggingFace y afinado a partir del modelo base USC-PSI-Lab/psi-model. Está diseñado específicamente para tareas que requieren memoria a largo plazo: el robot debe recordar información observada en el pasado (por ejemplo, dónde se escondió un objeto) antes de ejecutar un objetivo motor posterior. El nombre del modelo refleja esa prioridad: la memoria precede al objetivo.

El modelo se distribuye en formato safetensors dentro de la librería LeRobot, con un repositorio de 293,8 GB, lo que sugiere pesos de gran tamaño probablemente derivados de un backbone VLA multimodal con cabeza de acciones. Está asociado a un conjunto amplio de datasets propios (HuMeGo-Sim-* y HuMeGo-Real-*) que cubren escenarios simulados y reales sobre el robot humanoide Unitree G1, incluyendo tareas como el juego de las tres cartas (ShellGame), esconder una taza (HideMug) o recordar la posición de una ficha (RememberChip).

Su relevancia actual radica en que aborda uno de los cuellos de botella de los VLA convencionales: la ausencia de estado episódico persistente. La mayoría de modelos de acción condicionada por lenguaje reaccionan a la observación inmediata; MemorybeforeGoal incorpora explícitamente un mecanismo de memoria para tareas de manipulación con dependencia temporal. El acceso al repositorio está restringido (gated) y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con módulo de memoria; derivada de USC-PSI-Lab/psi-model (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del VLA USC-PSI-Lab/psi-model, orientado a control robótico de un humanoide Unitree G1. La información pública no detalla el número de parámetros, la composición del backbone visual ni la estrategia exacta de fusión multimodal; lo que sí se explicita es la incorporación de un componente de memoria que condiciona la política de acción sobre observaciones pasadas del episodio, no solo sobre el frame actual. Esto encaja con la familia de tareas HuMeGo, donde la información crítica (posición de un objeto oculto, resultado de una ronda previa en un juego) deja de estar visible en el momento de actuar.

El entrenamiento se apoya en un conjunto de datasets propietarios del autor: seis entornos simulados (BlinkPad, TouchPad, FlashPad, LitLamp, HideMug, ShellGame) y seis escenarios reales (TrashBag, RememberChip, CafeA, CafeB, CafeC, ChipCart). No se han publicado en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La referencia arXiv asociada es 2610.31166.

## Capacidades

- Percepción visual y generación de acciones motoras en un robot humanoide (Unitree G1), dentro del paradigma VLA.
- Memoria episódica: retención de información observada previamente para resolver tareas con dependencia temporal (objetos ocultos, secuencias de juego, localización de fichas).
- Ejecución de tareas de manipulación guiadas por instrucción en lenguaje natural (implícito en el pipeline de robótica y los datasets de instrucciones).
- Operación en entornos simulados y reales, con datasets específicos para cada dominio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso genéricos ni capacidades multilingües en la información disponible.
- No se documentan modos de razonamiento explícito (thinking), audio ni visión generalista fuera del contexto robótico.

## Casos de uso

- Manipulación con objetos ocultos: el robot observa dónde se deposita un objeto y, tras una interrupción o cambio de escena, lo recupera. El módulo de memoria evita tener que reexplorar el entorno y es el escenario central de los datasets HideMug y RememberChip.
- Juegos de seguimiento tipo shell game: el modelo sigue la posición de una ficha entre vasos que se mezclan, tarea del dataset ShellGame, donde la observación relevante ocurre antes del momento de actuar.
- Asistencia en cafetería o mostrador: los datasets CafeA, CafeB y CafeC sugieren tareas de servicio con clientes e interacción multi-paso, donde recordar pedidos o posiciones previas es parte del flujo.
- Gestión de residuos en entorno doméstico o industrial: el dataset TrashBag apunta a recogida y clasificación de bolsas de basura, una tarea de manipulación con navegación y memoria de ubicaciones.
- Logística de piezas en carro o estantería: ChipCart plantea el transporte y organización de piezas, donde el modelo debe recordar qué se ha colocado y dónde.
- Investigación en VLA con estado: sirve como punto de partida para estudiar cómo afecta la memoria episódica al éxito de tareas de manipulación frente a políticas puramente reactivas, dado que se publica junto a los datasets y el modelo base.
- Evaluación comparativa sim-a-real: los pares de datasets simulados y reales permiten medir la transferencia de políticas entrenadas en simulación a un Unitree G1 físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 293,8 GB en safetensors, lo que implica pesos de gran tamaño y, en la práctica, despliegue multi-GPU o cuantización agresiva para inferencia.
- GPU recomendadas: no documentadas por el autor; por tamaño del repositorio, un despliegue en precisión nativa requeriría GPUs de centro de datos (A100/H100 de 80 GB en configuraciones múltiples).
- ¿Cabe en GPU de consumo? No es probable en precisión completa; requeriría cuantización no publicada. No hay datos oficiales.
- Opciones de despliegue: librería LeRobot para carga de políticas; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un VLA de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Memoria episódica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MemorybeforeGoal | VLA humanoide | no disponible | no disponible | Sí (explícita) | Apache 2.0 | Gated en HuggingFace |
| USC-PSI-Lab/psi-model | VLA (base) | no disponible | no disponible | No documentada | no disponible | HuggingFace |
| Políticas VLA reactivas (p. ej. variantes tipo RT/OpenVLA) | VLA | no disponible en esta ficha | no disponible | No | variable | Pública |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito ni parámetros del modelo en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de descargar.
- Tamaño del repositorio (293,8 GB): coste de almacenamiento y despliegue elevado; no apto para entornos con recursos limitados sin cuantización propia.
- Especialización estrecha: es un modelo de robótica para Unitree G1 y tareas HuMeGo; no es un modelo de lenguaje general y no debe usarse como tal.
- Riesgo de sobreajuste a los escenarios de entrenamiento (seis simulados y seis reales); la generalización a otros robots u hogares no está documentada.
- La memoria episódica puede degradarse en episodios largos o con oclusiones prolongadas; no se publican tasas de fallo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base USC-PSI-Lab/psi-model puede tener condiciones propias no verificadas en esta ficha.
- No hay información sobre sesgos, idiomas soportados ni evaluación de seguridad en entornos físicos; se recomienda supervisión humana en despliegues reales.
- Sin benchmarks publicados, no es posible validar afirmaciones de rendimiento frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/ChenyuanC/MemorybeforeGoal
- Modelo base: https://huggingface.co/USC-PSI-Lab/psi-model
- Paper (arXiv): https://arxiv.org/abs/2610.31166
- Datasets simulados: https://huggingface.co/datasets/ChenyuanC/HuMeGo-Sim-BlinkPad, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Sim-TouchPad, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Sim-FlashPad, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Sim-LitLamp, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Sim-HideMug, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Sim-ShellGame
- Datasets reales: https://huggingface.co/datasets/ChenyuanC/HuMeGo-Real-TrashBag, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Real-RememberChip, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Real-CafeA, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Real-CafeB, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Real-CafeC, https://huggingface.co/datasets/ChenyuanC/HuMeGo-Real-ChipCart
- Librería LeRobot: https://github.com/huggingface/lerobot
