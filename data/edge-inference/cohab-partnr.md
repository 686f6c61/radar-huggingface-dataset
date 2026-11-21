# edge-inference/cohab-partnr

## Resumen

CoHab SetTable skills (pi0.5) es una colección de checkpoints de políticas de robótica manipulativa publicada por el usuario `edge-inference` bajo el identificador `cohab-partnr`. Se trata de dos políticas especializadas —`pick` (recoger) y `place` (colocar)— entrenadas para un robot Fetch en el entorno MS-HAB SetTable de ManiSkill, dentro del marco PARTNR. No es un modelo de lenguaje: son pesos de un modelo visión-lenguaje-acción (VLA) pi0.5, el formato de política robótica de Physical Intelligence que carga mediante la librería LeRobot.

La relevancia del artefacto está en que no se limita a publicar las políticas aisladas: documenta cómo encadenarlas con navegación y apertura/cierre de pinza guionizadas, y un planificador externo basado en Qwen3.5-9B que selecciona pasos y evalúa resultados. Las métricas reportadas son de cadena completa sobre planes retenidos (500 planes), no solo de subtarea aislada, lo que aporta una señal de utilidad real en producción robótica.

El repositorio ocupa 18,7 GB y los pesos están en formato safetensors. La información pública disponible es escasa: no consta licencia, ni idiomas, ni pipeline declarado, y no hay resultados de benchmarks convencionales de texto (MMLU, HumanEval, etc.), ya que el modelo no es de ese tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA pi0.5 (política visión-lenguaje-acción), cargable con LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entrada | observaciones visuales (incluye profundidad de cabeza) + estado propioceptivo |
| Salida | acciones de robot (pick / place) |
| Entorno | MS-HAB SetTable (ManiSkill), robot Fetch |
| Tamano del repo | 18,7 GB |
| Fecha de creacion | 2026-11-04 |
| Ultima actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

Se trata de dos políticas pi0.5 independientes, una para `pick` y otra para `place`, cada una con su propio checkpoint en la ruta `<run>/<slot>/pretrained_model`. El modo de estado es propiocepción pura (`proprio`) en ambas políticas publicadas; la model card menciona también un modo `full` con estado privilegiado de 42 dimensiones, pero los checkpoints fijados usan proprio. La entrada visual incluye profundidad de cabeza.

El entrenamiento se hizo desde cero (from scratch) sobre demostraciones de MS-HAB, demostraciones de inicio de cadena y, en el caso de `pick`, también demostraciones de reintento. En ambas políticas se recortaron los primeros 15 fotogramas de los episodios. No se detalla el número de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO (no aplica en el sentido habitual de un LLM). La innovación operativa documentada es el encadenado de habilidades: el planificador Qwen3.5-9B elige el siguiente paso de un menú y un juez de resultado valida cada transición, combinando las políticas aprendidas con navegación, apertura y cierre de pinza programados de forma guionizada.

## Capacidades

- Manipulación robótica de tipo pick-and-place sobre un robot Fetch en el entorno SetTable.
- Política `pick`: recoger objetos (manzana, cuenco) desde estados iniciales y desde estados intermedios de la cadena completa.
- Política `place`: colocar objetos en una zona de la mesa; el éxito se define como "en cualquier punto de la mesa".
- Encadenamiento multi-paso: las políticas están pensadas para ejecutarse dentro de una cadena con navegación y apertura/cierre de pinza guionizados.
- Integración con planificador externo (Qwen3.5-9B) que selecciona pasos de un menú y con un juez de resultado que valida cada acción.
- Ejecución con 2 pasos ejecutados por predicción.
- Carga directa mediante LeRobot con la API de pi0.5.
- No se documentan capacidades de texto, código, matemáticas, visión general, tool calling ni agentes conversacionales: el modelo es exclusivamente de control robótico.

## Casos de uso

- Automatización de recogida y colocación en mesa: usar la política `pick` para recoger una manzana o un cuenco y la política `place` para dejarlo en la mesa, encadenadas mediante el planificador. Es adecuado porque ambas políticas están entrenadas específicamente para esas subtareas en MS-HAB SetTable y validadas sobre 500 planes retenidos.
- Evaluación de planificadores de alto nivel: emplear los checkpoints como banco de pruebas de un planificador tipo Qwen3.5-9B con juez de resultado, midiendo objetos colocados por cadena (0,94 objetos por cadena en el caso de `pick`). Útil para investigación en agentes robóticos multi-paso.
- Investigación en aprendizaje por imitación desde cero: reproducir el entrenamiento desde demostraciones de MS-HAB, con recorte de los primeros 15 fotogramas y profundidad de cabeza, para estudiar el efecto de las demostraciones de inicio de cadena y de reintento.
- Integración en pipelines LeRobot: cargar `<run>/<slot>/pretrained_model` con LeRobot pi0.5 para desplegar las políticas en simulación ManiSkill y medir latencia y tasa de éxito antes de transferir a hardware.
- Benchmarking de robustez ante estados iniciales: comparar el rendimiento de `pick` cuando arranca desde estados grabados de la cadena completa frente a estados iniciales limpios, usando las métricas de "chain starts" documentadas.
- Estudio de recuperación tras fallo: la política `pick` incluye demostraciones de reintento, lo que permite analizar la capacidad de recuperación cuando un intento previo falla dentro de la cadena.
- Docencia y prototipado en robótica de manipulación: usar los checkpoints como referencia funcional de un pipeline VLA + planificador + juez sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

Los datos publicados son métricas de éxito en simulación, no benchmarks de texto.

| Metrica | Valor | Condiciones |
|---|---|---|
| `pick`: objetos por cadena (cadena SetTable en vivo, con planificador + juez + reset de brazo) | 0,94 | 500 planes retenidos; +0,08 sobre mixsc 070000 en tres bloques de 500 planes |
| `place`: aceptación por el juez | 89 % | 500 planes retenidos |
| `place`: confirmación por el simulador | 71 % | 500 planes retenidos |
| Episodios por celda | 200 | MS-HAB SetTable, subtareas independientes, manzana / cuenco |
| Pasos ejecutados por predicción | 2 | — |
| Checkpoint `pick` | step 70000 | `pi05_pick_trim15_dp_mix3sc/final`, 2026-11-20 |
| Checkpoint `place` | step 50000 | `pi05_place_trim15_p_mixsc/final`, 2026-11-20 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible, y no procede aplicarlos a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 18,7 GB en safetensors, pero no se desglosa el tamaño por checkpoint ni se indica precisión de los pesos.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar si cabe en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: LeRobot con la API de pi0.5 (carga desde `<run>/<slot>/pretrained_model`); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cohab-partnr (este) | VLA pi0.5, políticas pick/place | no disponible | no aplica | 0,94 objetos/cadena (pick); 89 % juez / 71 % simulador (place) | no disponible | Hugging Face, 0 descargas |
| Políticas pi0.5 base de Physical Intelligence | VLA pi0.5 | no disponible | no aplica | no disponible en esta ficha | no disponible | no disponible |
| Políticas PARTNR / MS-HAB de referencia | Políticas de manipulación | no disponible | no aplica | no disponible en esta ficha | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas concretas; los valores de los modelos comparables no están en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: las políticas solo cubren `pick` y `place` sobre manzana y cuenco en MS-HAB SetTable con robot Fetch; no son modelos generales.
- El éxito de `place` depende de una definición laxa de zona ("en cualquier punto de la mesa"), lo que infla la métrica frente a colocaciones precisas.
- Diferencia notable entre la aceptación del juez (89 %) y la confirmación del simulador (71 %) en `place`: el juez de resultado puede sobreestimar el éxito real.
- La cadena completa requiere navegación, apertura y cierre de pinza guionizados, además de un planificador externo (Qwen3.5-9B) y un juez; el rendimiento reportado no es atribuible solo a las políticas.
- Estado propioceptivo únicamente en los checkpoints publicados; el modo con estado privilegiado de 42 dimensiones no está entre los fijados.
- Licencia no declarada: no se puede confirmar el uso comercial.
- Sin información sobre sesgos, alucinación o limitaciones de idioma en el sentido habitual; el riesgo relevante es el fallo físico de manipulación y la acumulación de errores en cadenas largas.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas reportadas.
- Entrenado en simulación (ManiSkill); no se documenta transferencia a hardware real.

## Enlaces

- Hugging Face: https://huggingface.co/edge-inference/cohab-partnr
- LeRobot (librería de carga): no disponible en la información proporcionada
- Paper de pi0.5: no disponible en la información proporcionada
- PARTNR: no disponible en la información proporcionada
- ManiSkill / MS-HAB SetTable: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
