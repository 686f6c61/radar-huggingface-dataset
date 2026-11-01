# itsDigvijaysing/laya-typed-decisions-openvino

## Resumen

Laya typed-decisions OpenVINO fp16 es una conversión al formato OpenVINO del checkpoint `typed-decisions` del modelo `convaiinnovations/laya`, publicada por el usuario itsDigvijaysing. No se trata de un modelo nuevo ni de un lanzamiento oficial de Convai Innovations, sino de una copia cuantizada a fp16 (0,84 GB) pensada para ejecutarse en GPUs integradas Intel y CPUs x86-64 sin depender de PyTorch ni de la librería transformers. Su función es concreta: recibe un estado, una pregunta y un menú de opciones proporcionado en tiempo de petición, y devuelve una probabilidad calibrada por opción.

El modelo resuelve el problema de enrutamiento de herramientas en asistentes de voz locales. En el caso de uso original, AI Linux Assistant, el modelo elige qué herramienta corresponde a un comando de voz ejecutándose en una GPU integrada Intel Iris Xe, de modo que la GPU NVIDIA del sistema puede permanecer inactiva. La arquitectura subyacente es un encoder ModernBERT-large con una cabeza tipada propia de Laya, convertido con `openvino.convert_model` y trazado con batch 2 para mantener dinámicos los ejes de batch y longitud.

Es relevante por su perfil de despliegue: inferencia en 148 ms frente a 713 ms de la versión original en PyTorch sobre CPU, con una coincidencia del 297/297 en la respuesta principal respecto al original. Su alcance es limitado (solo inglés, solo la pregunta de tipo `choice`), pero cubre un nicho práctico de clasificación con opciones dinámicas y probabilidades calibradas en hardware de bajo consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabeza tipada de decisión de Laya |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | definida por `max_len` y `head_max_len` en `decision_config.json`; valor numérico no disponible |
| Tipos de cuantización | fp16 (pesos almacenados en fp16); no se documentan otras variantes |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + binarios), tokenizer en JSON |
| Tamaño del repositorio | 0,84 GB |
| Modelo base | `convaiinnovations/laya`, subcarpeta `typed-decisions`, revisión `7b928d828b7b0e022f929d9bd2e44165aa270148` (Laya 0.4.15) |
| Librería de inferencia | OpenVINO (sin PyTorch ni transformers) |
| Salidas | `logits` (uno por marcador de opción) y `act_logits` (cabeza act/escalate, no usada en esta copia) |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-large seguido de la cabeza tipada de Laya. El modelo completo (`DecisionModel`) se convirtió con `openvino.convert_model` trazando a batch 2 para conservar ejes dinámicos de batch y longitud. La secuencia se construye siguiendo el `common.py` original de Laya (`build_head`, `build_sequence`): un token `[CLS]`, la pregunta codificada, un `[SEP]`, y después cada opción precedida por un token `[MASK]` que actúa como marcador de posición; el estado del usuario se añade al final y la secuencia se trunca a `max_len`. La cabeza produce un logit por marcador de opción, que se normaliza con softmax tras aplicar la temperatura de calibración correspondiente al número de opciones (bucket `2`, `3-5`, `6-10`, `11+`), con la temperatura acotada al rango [0,5, 5].

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, la composición de los datos ni si hubo RLHF o DPO; esos detalles corresponden a la model card del modelo base, que no se ha proporcionado. La innovación destacable de esta conversión es de despliegue, no de entrenamiento: mantiene las probabilidades calibradas del original con una diferencia mediana de 0,0001 y máxima de 0,0018 en CPU, y de 0,0019 y 0,026 respectivamente en Intel Iris Xe, sobre 297 peticiones de validación (177 decisiones escritas a mano y 120 peticiones de enrutamiento con un menú de 27 opciones). Los ficheros `tokenizer.json`, `tokenizer_config.json` y `LICENSE` son los originales sin modificar; `decision_config.json` añade `max_options` a los valores originales de `max_len`, `head_max_len` y temperaturas de calibración.

## Capacidades

- Clasificación de texto con opciones dinámicas: recibe un menú de 2 a `max_options` opciones en tiempo de petición y devuelve una probabilidad calibrada por opción.
- Enrutamiento de herramientas (tool routing): selecciona la herramienta adecuada para un comando a partir de un estado y una descripción de cada herramienta.
- Preguntas de tipo `choice`: esta copia conserva únicamente el comportamiento para la pregunta de elección; otras cabezas tipadas del modelo original no se han convertido.
- Probabilidades calibradas con temperatura dependiente del número de opciones, lo que permite umbrales de confianza estables.
- Idiomas: únicamente inglés.
- No soporta generación de texto libre, razonamiento multi-paso, código, matemáticas, visión, audio ni tool calling en el sentido de invocación autónoma de funciones; su función es puntuar opciones, no ejecutar acciones.
- Inferencia sin PyTorch ni transformers: solo requiere `openvino`, `tokenizers` y `numpy`.

## Casos de uso

- Enrutamiento de comandos de voz en asistentes locales: el modelo recibe la transcripción como estado y un menú de herramientas con descripciones, y devuelve la probabilidad de cada una; es adecuado porque la inferencia en GPU integrada Intel (148 ms en Iris Xe) permite mantener despierta solo la iGPU y dejar la GPU dedicada en reposo.
- Clasificación con categorías definidas en tiempo de ejecución: en lugar de reentrenar un clasificador por cada conjunto de etiquetas, se pasa el menú de opciones en cada petición; útil en sistemas donde las categorías cambian con frecuencia.
- Despacho de intenciones en pipelines de automatización: dado un estado textual y una lista de acciones disponibles (por ejemplo, `set_volume`, `set_brightness`, `none`), el modelo puntúa cada acción y el sistema aplica un umbral de confianza calibrada para decidir si actúa o escala.
- Filtrado y priorización de opciones en sistemas de recomendación ligera: con menús de hasta 10 o más elementos, las temperaturas por bucket permiten comparar puntuaciones entre configuraciones con distinto número de opciones.
- Despliegue en hardware sin GPU dedicada: al ejecutarse en OpenVINO sobre CPUs x86-64 y GPUs Intel, encaja en portátiles, mini-PC y entornos edge donde no hay CUDA disponible.
- Componente de decisión en asistentes de escritorio Linux: integrado como selector rápido de herramienta dentro de un asistente mayor, con la opción de recurrir a un modelo mayor (por ejemplo, jiwo-0.8b) cuando la confianza es baja.
- Validación y prototipado de cabezas de decisión: sirve como referencia de implementación de la disposición de secuencia de Laya (`build_head`, `build_sequence`) sin necesidad de instalar el stack completo de PyTorch.

## Benchmarks y rendimiento

Datos de validación publicados por el autor de la conversión frente al original en PyTorch fp32 sobre CPU, con 297 peticiones (177 decisiones escritas a mano y 120 de enrutamiento con menú de 27 opciones):

| Métrica | Esta copia, CPU | Esta copia, Intel Iris Xe |
|---|---|---|
| Mismos token ids y posiciones de opción | 297 / 297 | 297 / 297 |
| Misma respuesta principal | 297 / 297 | 297 / 297 |
| Diferencia de probabilidad (mediana) | 0,0001 | 0,0019 |
| Diferencia de probabilidad (máxima) | 0,0018 | 0,026 |

Prueba de enrutamiento de herramientas de AI Linux Assistant (528 peticiones, menú de 26 herramientas):

| Modelo / configuración | Acierto | Latencia |
|---|---|---|
| Original (PyTorch, CPU) | 60,8 % | 713 ms |
| Esta copia (OpenVINO, Iris Xe) | 60,8 % | 148 ms |
| jiwo-0.8b (referencia del asistente) | 84,5 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,84 GB en fp16; la huella en memoria durante la inferencia no se detalla, pero es del orden del tamaño de los pesos más las activaciones del encoder.
- GPUs compatibles: GPUs integradas Intel (validado en Intel Iris Xe) y cualquier CPU x86-64 mediante OpenVINO. OpenVINO no tiene backend para NVIDIA, por lo que no se ejecuta en GPUs CUDA.
- GPU de consumo: no aplica en el sentido habitual; el modelo está pensado para iGPU Intel y CPU, no para GPUs dedicadas de consumo.
- Opciones de despliegue: OpenVINO Runtime (`ov.Core().compile_model` con dispositivo `"GPU"` o `"CPU"`), con dependencias limitadas a `openvino`, `tokenizers` y `numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 148 ms por petición en Intel Iris Xe frente a 713 ms del original en PyTorch sobre CPU, en la prueba de enrutamiento con 26 herramientas. El throughput no se ha publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la prueba de enrutamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-typed-decisions-openvino (esta copia) | Encoder ModernBERT-large + cabeza tipada, OpenVINO fp16 | no disponible | definido por `max_len` (valor no disponible) | 60,8 % de acierto, 148 ms en Iris Xe | Apache-2.0 | HuggingFace, formato OpenVINO IR |
| convaiinnovations/laya (original, `typed-decisions`) | Encoder ModernBERT-large + cabeza tipada, PyTorch | no disponible | definido por `max_len` (valor no disponible) | 60,8 % de acierto, 713 ms en CPU | Apache-2.0 | HuggingFace, pesos PyTorch |
| jiwo-0.8b | no disponible | 0,8 B (según el nombre) | no disponible | 84,5 % de acierto, latencia no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otras alternativas de clasificación con opciones dinámicas.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Laya: es una conversión de terceros; el autor recomienda citar y usar el modelo original de Convai Innovations.
- Solo cubre la pregunta de tipo `choice`; otras cabezas tipadas del modelo original no están disponibles en esta conversión. La salida `act_logits` se genera pero no se utiliza.
- Solo inglés; no hay soporte multilingüe documentado.
- El rendimiento en la tarea real es modesto: 60,8 % de acierto en la prueba de enrutamiento con 26 herramientas, por debajo del 84,5 % de jiwo-0.8b, motivo por el que el asistente lo mantiene como opción rápida y no como predeterminado.
- Riesgo de alucinación en el sentido de asignar alta probabilidad a una opción incorrecta; la calibración mitiga pero no elimina este riesgo, por lo que se recomienda aplicar umbrales de confianza y una ruta de escalado.
- No hay backend NVIDIA en OpenVINO: no puede desplegarse en GPUs CUDA con esta conversión.
- Sesgos conocidos: no se documentan en la información disponible; al ser un derivado de un modelo entrenado solo en inglés, hereda los sesgos del corpus original, que no se detalla.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y de indicar los cambios; los ficheros `LICENSE` y de tokenizer son los originales.
- En producción conviene validar la latencia y la precisión en el hardware objetivo, ya que las cifras publicadas corresponden a una única configuración (Iris Xe y CPU) y a conjuntos de prueba concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsDigvijaysing/laya-typed-decisions-openvino
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Revisión del modelo base utilizada: `7b928d828b7b0e022f929d9bd2e44165aa270148` (Laya 0.4.15)
- OpenVINO: no se proporciona enlace en la información disponible
- Paper, blog o repositorio de AI Linux Assistant: no disponible en la información proporcionada
