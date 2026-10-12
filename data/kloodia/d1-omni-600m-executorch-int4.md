# kloodia/d1-omni-600m-executorch-int4

## Resumen

`kloodia/d1-omni-600m-executorch-int4` es un export de ejecución en el dispositivo (on-device) del modelo de decisión `LiquidAI/d1-omni-600M`, publicado por el usuario kloodia bajo el nombre "Localia gate". No es un modelo de lenguaje generativo: se trata de una puerta de decisión (decision gate) solo texto que, en una única pasada hacia delante y sin generar tokens de salida, devuelve una probabilidad para cada una de un conjunto de opciones tipadas (noul, choice, score). El modelo base, desarrollado por Liquid AI, tiene unos 587M parámetros y está construido sobre LFM2.5-Encoder-350M con torres de visión (SigLIP2) y audio, aunque este export concreto descarta esas modalidades y conserva únicamente la vía de texto.

La relevancia de esta ficha radica en que empaqueta el modelo para su despliegue en entornos móviles y de borde mediante ExecuTorch, con dos backends: XNNPACK para Android y MLX para Apple Silicon. La cuantización aplicada es INT4 weight-only (grupo 32) con la cabecera de decisión en fp32, lo que reduce el espacio de pesos a unos cientos de megabytes y permite inferencia local sin necesidad de GPU dedicada.

El repo ocupa 0,9 GB e incluye los artefactos `.pte` de ambas plataformas junto con el tokenizador. La licencia es la LFM Open License v1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de decisión basado en LFM2.5-Encoder-350M (modelo base `LiquidAI/d1-omni-600M`); el export ExecuTorch es solo texto |
| Parametros totales | ~587M (modelo base d1-omni-600M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens en el modelo base; la entrada del export usa `input_ids[1,512]` |
| Tipos de cuantizacion | INT4 weight-only, grupo 32, con cabecera de decisión en fp32 (receta idéntica en XNNPACK y MLX) |
| Idiomas soportados | 15 idiomas en el modelo base; la lista concreta no está disponible y el export es una puerta de decisión solo texto |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | `.pte` de ExecuTorch (XNNPACK para Android, MLX para iOS); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base `d1-omni-600M` es un encoder de decisión de unos 587M parámetros construido sobre LFM2.5-Encoder-350M, al que se añaden un encoder de visión basado en SigLIP2 y un encoder de audio, ajustados conjuntamente para producir decisiones en una sola pasada. Su salida no es texto libre, sino respuestas tipadas (noul, choice, score) con una probabilidad asociada a cada opción, lo que elimina por completo el coste de decodificación autoregresiva. El contexto del modelo base cubre 16.384 tokens entre modalidades y, cuando hay imágenes, el texto de estado y pregunta se recorta a 896 tokens tal y como se entrenó.

Este export concreto no reentrena nada: reescribe los tres subsistemas del modelo base a un grafo apto para ExecuTorch y aplica una cuantización INT4 weight-only con grupo 32, manteniendo la cabecera de decisión en fp32 para preservar la precisión de las probabilidades. La interfaz de entrada es explícita: `input_ids[1,512]`, `pad[1,512]`, `marker_pos[1,4]`, `marker_mask[1,4]` y `qtype[1]` (0 = choice, 1 = score, 2 = noul), con una salida `logits[1,4]` en la que las opciones no usadas quedan enmascaradas con un valor aproximado de -1e4. No se documentan en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Decisiones tipadas en una sola pasada: devuelve logits sobre hasta cuatro opciones con los modos choice, score y noul (ninguna de las opciones).
- Evaluación de comandos para aprobación local: función declarada como "on-device command approval".
- Clasificación y calibración de decisiones sobre texto, sin generación de tokens de salida.
- Inferencia en el dispositivo mediante ExecuTorch, con backends XNNPACK (Android) y MLX (Apple Silicon).
- Cuantización INT4 weight-only con grupo 32, pensada para reducir huella de memoria en hardware de borde.
- Soporte multilingüe heredado del modelo base (15 idiomas), si bien el export está orientado a entrada de texto.
- Carencias destacables de este export: no conserva las torres de visión ni de audio del modelo base, por lo que no procesa imágenes ni audio.

## Casos de uso

- Aprobación de comandos en el dispositivo: es el propósito declarado del export. Una app móvil evalúa una acción propuesta (por ejemplo, ejecutar un comando) y la puerta devuelve si debe aprobarse, rechazarse o quedar como noul, sin coste de generación de tokens.
- Enrutado de intenciones en asistentes locales: con el modo choice, el modelo selecciona una de hasta cuatro opciones predefinidas (por ejemplo, qué subagente debe atender una petición) en una única pasada y con latencia mínima.
- Puntuación de riesgo o calidad: con el modo score, asigna una probabilidad a una decisión, útil para umbrales config (filtrar por encima o por debajo de un valor).
- Filtro previo (gate) antes de invocar un LLM mayor: descarta o aprueba peticiones triviales en el borde y reserva el modelo grande para los casos que realmente lo requieren.
- Moderación y descarte de entradas: el modo noul permite rechazar entradas que no encajan en ninguna categoría conocida antes de procesarlas.
- Clasificación de texto ligera en apps sin conectividad: al ejecutarse mediante XNNPACK o MLX, puede correr en el propio dispositivo sin enviar datos a un servidor.
- Preprocesado en pipelines de agentes: actuar como comprobación rápida de seguridad o pertinencia antes de permitir que un agente ejecute un paso multi-etapa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del export no incluye métricas de precisión, latencia ni throughput, y las fuentes del modelo base consultadas tampoco aportan cifras concretas de MMLU, HumanEval, GSM8K ni de tareas de decisión.

## Requisitos de hardware

- El export está pensado para despliegue en el dispositivo, no en servidor: los artefactos `.pte` son para Android (XNNPACK) e iOS/Apple Silicon (MLX).
- Los pesos del encoder de ~587M parámetros en INT4 (grupo 32) ocupan en torno a 300 MB (estimación a partir de 0,5 bytes por parámetro); el repo completo es de 0,9 GB porque incluye los artefactos de ambas plataformas.
- La cabecera de decisión se mantiene en fp32, por lo que hay que sumar su huella (pequeña en relación con el encoder).
- No se especifican GPU recomendadas ni cifras de VRAM; dado el tamaño y la cuantización, está orientado a CPU/NPU de móvil y a Apple Silicon.
- Opciones de despliegue documentadas: ExecuTorch con backend XNNPACK (Android) y backend MLX (iOS). El modelo base admite Transformers, pero este export concreto no se distribuye en GGUF ni como pesos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia |
|---|---|---|---|---|---|
| `kloodia/d1-omni-600m-executorch-int4` | ~587M (heredados del base) | 512 tokens de entrada en el export (16.384 en el base) | Solo texto | ExecuTorch `.pte` (XNNPACK, MLX) | LFM Open License v1.0 |
| `LiquidAI/d1-omni-600M` | ~587M | 16.384 tokens | Texto, imagen y audio | safetensors (Transformers) | LFM Open License v1.0 |
| LFM2.5-Encoder-350M | ~350M | no disponible en la información aportada | Texto | safetensors | LFM Open License v1.0 |

No se dispone de datos de rendimiento que permitan comparar numéricamente estos modelos. La diferencia principal entre el export y el modelo base es la pérdida de las modalidades de visión y audio en favor de un empaquetado INT4 para ejecución en el dispositivo.

## Limitaciones y advertencias

- Este export es una puerta de decisión solo texto: no genera texto libre, no razona paso a paso y no acepta imágenes ni audio, a diferencia del modelo base.
- La salida se limita a logits sobre hasta cuatro opciones enmascaradas; no es un modelo de propósito general.
- La longitud de entrada del export está fijada en 512 tokens, muy por debajo del contexto de 16.384 tokens del modelo base.
- No se han publicado métricas de precisión, por lo que no se puede cuantificar la degradación introducida por la cuantización INT4.
- Riesgo de sesgo y de calibración deficiente: al ser un modelo de decisión, errores de calibración se traducen directamente en aprobaciones o rechazos incorrectos; conviene fijar umbrales y validar sobre datos propios.
- Idiomas: aunque el modelo base declara 15 idiomas, no se detalla la cobertura real del export y no hay garantías de rendimiento equivalente en todos ellos.
- Licencia: LFM Open License v1.0 ("other" en HuggingFace). Es una licencia propia, no estándar, por lo que hay que revisar sus términos antes de un uso comercial; no se asume equivalencia con licencias permisivas tipo Apache 2.0 o MIT.
- Al ser un repo con 0 descargas y 0 likes, no hay evidencia de uso en producción ni de validación por terceros; trátese como artefacto reciente y sin contrastar.
- Advertencia de producción: el repo incluye artefactos para dos plataformas distintas; hay que seleccionar el `.pte` correcto (XNNPACK o MLX) y verificar compatibilidad de versiones de ExecuTorch antes de desplegar.

## Enlaces

- Repositorio del export: https://huggingface.co/kloodia/d1-omni-600m-executorch-int4
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Ficheros del modelo base: https://huggingface.co/LiquidAI/d1-omni-600M/tree/main
- Documentación de Liquid AI sobre d1-omni-600M: https://docs.liquid.ai/lfm/models/d1-omni-600m
- Ficha de referencia en llmreference: https://www.llmreference.com/model/d1-omni-600m
- Notas del port a Core AI (john-rocky/coreai-model-zoo): https://github.com/john-rocky/coreai-model-zoo/blob/main/knowledge/d1-omni-port.md
- Paper asociado (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
