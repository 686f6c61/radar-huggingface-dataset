# Mapika/decider-4b

## Resumen

decider-4b es un modelo de decisión de 4.205.751.296 parámetros (4,2B) desarrollado por Mapika y afinado a partir de Qwen/Qwen3.5-4B-Base. No es un modelo generativo: lee un estado y una o varias preguntas tipadas, cada una con una lista explícita de opciones, y devuelve en una única pasada forward una distribución de probabilidad sobre las opciones de cada pregunta. No hay decodificación, ni parseo posterior, ni salida posible fuera de las opciones definidas. Está pensado para ser invocado desde software, no para conversar.

Se presenta como una reproducción abierta de la clase de modelos "System One" (el modelo Jev de TypeSafe AI) y su interés actual está en ofrecer decisiones estructuradas con probabilidades calibradas a coste contenido: 8,4 GB de pesos en bf16, sin etapa de aprendizaje por refuerzo y con un readout único compartido por toda la familia decider.

La arquitectura heredada del base es un transformer híbrido de 32 capas, de las cuales 8 usan atención completa y 24 usan linear attention de tipo gated delta-net, con un tamaño oculto de 2.560. La información disponible indica que el estado de entrada admite hasta 32k tokens, aunque la longitud de contexto nominal del modelo no se explicita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 32 capas (8 con atención completa y 24 con gated delta-net linear attention), tamaño oculto 2.560 |
| Parámetros totales | 4.205.751.296 (4,2B) |
| Parámetros activos | No aplica: el modelo es denso |
| Longitud de contexto | El estado de entrada admite hasta 32k tokens según la model card; la longitud de contexto nominal del modelo no se explicita (no disponible) |
| Tipos de cuantización | No disponible. El repositorio contiene únicamente pesos bf16 en su versión v1 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 8,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer híbrido de 4,2B parámetros con 32 capas: 8 con atención completa y 24 con linear attention basada en gated delta-net. Sobre esa base, decider-4b sustituye la generación por un readout de slot: se toman los logits de letra en una posición de respuesta y se aplica softmax sobre las opciones de la pregunta. De ahí sale una distribución de probabilidad por pregunta, con una confianza asociada a cada opción.

El entrenamiento consiste en una única pasada supervisada de entropía cruzada sobre ese readout, con el mixture v2: el mixture público de decisiones de decider-2b más 26 conjuntos de datos públicos adicionales de decisión y diez familias generadas programáticamente con gold verificable, hasta un total de 742 millones de tokens. El optimizador es AdamW aplicado directamente sobre los parámetros en bf16, el mismo que usa el trainer público de decider-2b. No hay etapa de aprendizaje por refuerzo, ni RLHF ni DPO.

La interfaz es idéntica a la de decider-2b: la clase `decider.infer.Decider`, el método `decide_batch` para puntuar muchos estados con muchas preguntas en una sola llamada, el parámetro `abstain_below` para devolver `None` por debajo de un umbral de confianza, entre 2 y 255 opciones por pregunta, y un servidor compatible con la forma de petición `POST /v1/systemone` de TypeSafe. El repositorio incluye `decider/`, el subconjunto de inferencia del paquete de GitHub.

## Capacidades

- Clasificación de texto en categorías definidas por el usuario, devolviendo la distribución de probabilidad completa sobre las opciones y no solo la etiqueta ganadora.
- Decisiones tipadas con probabilidad calibrada: cada pregunta puntuada en su propia fila, con `choice`, `confidence` y `probs`.
- Puntuación por lotes: `decide_batch` permite evaluar muchos estados con muchas preguntas en una única llamada.
- Abstención controlada: `abstain_below=t` devuelve `None` cuando la confianza queda por debajo del umbral indicado.
- Preguntas con listas de opciones de entre 2 y 255 elementos.
- Estados de entrada en forma de cadena, objeto o array de hasta 32k tokens.
- Integración por software: servidor HTTP con la forma `POST /v1/systemone` de TypeSafe, compatible con el SDK oficial `typesafe-sdk` apuntando `TYPESAFE_BASE_URL` al servidor.
- Uso como componente de decisión dentro de agentes de navegador: la model card reporta evaluación en tareas de navegador en vivo.
- Rendimiento superior al de decider-2b en 87 de las 95 tareas del conjunto de regresión, con mejoras concretas frente a ese modelo en filas de validación, OpenJev y Mind2Web.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- Capacidades de visión, audio, modo de razonamiento explícito, tool calling o function calling: no documentadas en la información disponible. El modelo no genera texto libre.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia, decidir el departamento responsable (facturación, soporte técnico, ventas) y si requiere acción de reembolso, como ilustra el ejemplo de la propia model card. La salida viene restringida a las opciones definidas, sin riesgo de que el modelo invente una categoría nueva.
- Triaje con abstención en producción: usar `abstain_below` para enviar a revisión humana únicamente los casos en los que la confianza del modelo cae por debajo del umbral, y automatizar el resto. Es adecuado porque expone la distribución completa, no solo la etiqueta.
- Agentes de navegador web: elegir la siguiente acción entre un conjunto cerrado de operaciones a partir del estado de la página. La model card reporta un 91,5% en tareas en vivo en modo greedy, al nivel del 2B, aunque por debajo en las seis tareas held-out (75,0% frente a 91,7%).
- Enrutado de consultas en pipelines con LLM y RAG: decidir qué ruta, recuperador o herramienta corresponde a cada consulta antes de invocar el modelo generativo, con latencia de una sola pasada y sin decodificación.
- Juicios y anotación asistida: puntuar afirmaciones, respuestas o pares de textos contra un conjunto de categorías de evaluación, usando la probabilidad calibrada para priorizar la cola de revisión.
- Cumplimiento y políticas internas: seleccionar la categoría de política aplicable a un caso descrito en lenguaje natural, con el conjunto de categorías fijado por el equipo legal y sin posibilidad de salida fuera de catálogo.
- Validación de salidas estructuradas: decidir si una salida cumple un conjunto de criterios predefinidos, integrándolo como comprobación barata antes de publicar o ejecutar el resultado.
- Clasificación multi-etiqueta en pipelines de datos: aplicar muchas preguntas a muchos documentos con `decide_batch` para etiquetar corpus completos en una sola llamada por lote.
- Preguntas de conocimiento y razonamiento de varios pasos: según la model card, supera al 2B en 87 de las 95 tareas del conjunto de regresión, lo que lo hace adecuado cuando se necesita algo más de precisión que el 2B manteniendo un modelo denso de 8,4 GB.

## Benchmarks y rendimiento

Datos publicados en la model card. Las cifras absolutas corresponden al conjunto de regresión y a fixtures concretos; los incrementos se expresan respecto a decider-2b v10.

| Métrica | decider-4b v1 | decider-2b v10 | decider-35b-a3b v1 |
|---|---|---|---|
| Conjunto de regresión, in-task (95 tareas) | 0,834 | 0,805 | 0,855 |
| Conjunto de regresión, held-out | 0,788 | 0,755 | 0,810 |
| JevBench, tier hard | 0,541 | 0,459 | 0,676 |
| Bespoke, suite pública (macro) | 0,757 | 0,704 | 0,774 |
| Tareas del conjunto de regresión en las que supera al 2B | 87 de 95 | — | — |
| Filas de validación (847 filas) | +2,7 puntos frente al 2B | referencia | — |
| OpenJev | +0,6 puntos frente al 2B | referencia | — |
| Mind2Web | +5,7 puntos frente al 2B | referencia | — |
| Navegador en vivo, modo greedy | 91,5% | 90,9% | — |
| Navegador en vivo, seis tareas held-out | 75,0% | 91,7% | — |

Frente a decider-35b-a3b, el modelo queda entre 2,1 y 2,3 puntos por debajo en el conjunto de regresión y entre 1,2 y 5,9 puntos por debajo en cada fixture, con 8,4 GB de pesos frente a 65 GB. Las filas de flujo de trabajo de TypeSafe quedan a la par del 2B. No se han publicado en la información disponible resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K, que además no aplican directamente a un modelo que no genera texto.

## Requisitos de hardware

- Pesos en bf16: 8,4 GB. El repositorio ocupa 8,4 GB.
- VRAM estimada para inferencia: no hay cifra oficial publicada. Como referencia, hay que sumar a los 8,4 GB de pesos la caché KV y las activaciones; un presupuesto de 10-12 GB es un punto de partida razonable, aunque es una estimación y no un dato de la model card.
- GPU recomendadas: no se indican en la información disponible. Por tamaño, cabe con holgura en GPU de consumo como RTX 4090 (24 GB) y RTX 4080 (16 GB), y de forma más ajustada en tarjetas de 12 GB. También es desplegable en A100 y H100.
- Opciones de despliegue documentadas: el paquete `decider` con la clase `Decider`, `decide_batch` y el servidor `decider.serve` con la forma `POST /v1/systemone` de TypeSafe, más el SDK oficial `typesafe-sdk`. La model card menciona que, al ser un modelo denso, es aplicable el motor con CUDA graphs y `torch.compile` (el fragmento disponible está truncado).
- Dependencias: `torch`, `transformers>=5` y `flash-linear-attention`, que aporta los kernels Triton para las capas de linear attention de Qwen3.5. El modelo funciona sin esa librería, pero varias veces más lento.
- Latencia y throughput: no disponibles para el 4B. Como referencia de la familia, decider-2b reporta 4 ms por petición con CUDA graphs en una sola GPU.
- No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

Alternativas de la misma familia, que comparten interfaz y readout.

| Modelo | Base | Pesos | Regresión in-task / held-out | JevBench hard | Bespoke (macro) | Licencia |
|---|---|---|---|---|---|---|
| decider-4b v1 | Qwen3.5-4B-Base | 8,4 GB bf16 | 0,834 / 0,788 | 0,541 | 0,757 | Apache 2.0 |
| decider-2b v10 | Qwen3.5-2B-Base | 3,5 GB bf16 | 0,805 / 0,755 | 0,459 | 0,704 | Apache 2.0 |
| decider-0.8b | Qwen3.5-0.8B-Base | 1,4 GB bf16 | 0,776 / 0,707 (protocolo de una sola ejecución) | no disponible | no disponible | Apache 2.0 |
| decider-35b-a3b v1 | Qwen3.5-35B-A3B-Base (3B activos) | 65 GB bf16 | 0,855 / 0,810 | 0,676 | 0,774 | Apache 2.0 |
| decider-35b-a3b-nvfp4 | el 35B en NVFP4 | 19,6 GB | 1,0 a 1,5 puntos por debajo del bf16 en los fixtures medidos | no disponible | no disponible | Apache 2.0 |
| decider-2b-vision | Qwen3.5-2B vision-language, pesos de texto v5 | 4,1 GB bf16 | no aplica (Visual7W 0,89; Breakout 41 desde píxeles) | no disponible | no disponible | Apache 2.0 |

Las cifras de decider-0.8b proceden de un protocolo de una sola ejecución distinto del conjunto de regresión, por lo que no son directamente comparables con las del 2B y el 4B. Frente al modelo base Qwen3.5-4B-Base no hay comparativa publicada: el base es generativo y el readout de decisión no existe en él. No se han identificado en la búsqueda web modelos externos comparables con datos verificables.

## Limitaciones y advertencias

- No genera texto libre. Solo devuelve distribuciones sobre las opciones definidas, por lo que no sirve para generación, resumen, traducción ni diálogo.
- Idioma: únicamente inglés. No hay soporte multilingüe documentado.
- Ausencia de etapa de RL: en tareas de navegador en vivo rinde al nivel del 2B en modo greedy (91,5% frente a 90,9%) y claramente por debajo en las seis tareas held-out (75,0% frente a 91,7%). Es una limitación explícitamente atribuida por el autor a la falta de RL.
- Precisión: queda entre 2,1 y 2,3 puntos por debajo de decider-35b-a3b en el conjunto de regresión y entre 1,2 y 5,9 puntos por debajo en cada fixture, aunque con un coste de memoria mucho menor.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de error en lugar de alucinación clásica: al restringir la salida a las opciones, el modelo no puede inventar categorías, pero sí puede asignar una probabilidad alta a la opción incorrecta. Conviene usar `abstain_below` y validar los umbrales de confianza en datos propios.
- Calibración: la model card incluye una sección de calibración cuyo contenido no está disponible en la información proporcionada, por lo que las afirmaciones de calibración no se pueden verificar en detalle.
- Límite de entrada: el estado admite hasta 32k tokens; superar ese tamaño no está soportado.
- Dependencia de rendimiento: sin `flash-linear-attention` el modelo funciona pero varias veces más lento.
- Madurez: el repositorio registra 0 descargas y 0 likes y fue creado el 22 de septiembre de 2026, sin validación externa conocida.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-4B-Base antes de un despliegue en producción.
- Las secciones de la model card dedicadas a calibración, velocidad y limitaciones aparecen truncadas en la información disponible, por lo que pueden existir advertencias adicionales del autor no recogidas aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mapika/decider-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-0.8b: https://huggingface.co/Mapika/decider-0.8b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- decider-35b-a3b-nvfp4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- decider-2b-vision: https://huggingface.co/Mapika/decider-2b-vision
- Repositorio de código, registro de datos, scripts de entrenamiento y changelog: https://github.com/Mapika/decider
- Papers, blogs y demos adicionales: no se han encontrado en la búsqueda web realizada.
