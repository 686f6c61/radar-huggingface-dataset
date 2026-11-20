# nullptr04/NightWatch-0.8B

## Resumen

NightWatch-0.8B es un modelo de percepción proactiva diseñado específicamente para agentes de uso de ordenador (computer-use agents). Lo desarrolla el usuario nullptr04 y se construye mediante un fine-tuning LoRA sobre vllm-sr/d3-lite (Decision 3.0, 0.85B), que a su vez deriva de Qwen3.5-0.8B. Su función no es generar texto, sino actuar como un "vigilante" que observa el flujo de pantalla de un agente y responde a un banco fijo de preguntas genéricas sobre la interfaz: si ha aparecido un diálogo, si la pantalla sigue cargando o si el objetivo de un clic pendiente sigue presente.

El modelo resuelve un problema concreto de los agentes que operan interfaces gráficas: la desincronización entre el razonamiento del agente y el estado real de la pantalla. En lugar de generar texto libre, devuelve una probabilidad para cada respuesta a partir de una única codificación, lo que permite que las reglas fijas del harness de NightWatch conviertan esas probabilidades en tres intervenciones sobre un agente sin modificar: interrumpir su razonamiento, anular una acción obsoleta y despertarlo en cuanto la pantalla se estabiliza.

Con 852.985.920 parámetros (aproximadamente 0,85B), un contexto multimodal de hasta cuatro capturas de pantalla y recortes, y licencia Apache-2.0, el modelo es relevante por su enfoque de "system one" (decisión rápida y reactiva) complementario a los modelos de razonamiento lento que gobiernan los agentes. Su tamaño reducido permite desplegarlo como servicio de vigilancia de baja latencia junto a un agente principal de mayor escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de visión congelada; fine-tuning LoRA (rango 16) sobre el modelo de lenguaje, readout entrenado por completo (base: Decision 3.0 sobre Qwen3.5-0.8B) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de vllm-sr/d3-lite (Decision 3.0, 0.85B, construido sobre Qwen3.5-0.8B) y se ajusta mediante LoRA de rango 16 en el modelo de lenguaje, con el readout entrenado en su totalidad y la torre de visión congelada. La temperatura se reajusta sobre validación. La innovación clave es que el modelo no genera texto: recibe una descripción textual del estado y la acción del agente, junto con hasta cuatro capturas de pantalla y recortes, y devuelve una probabilidad para cada respuesta de un banco fijo de preguntas (tipo "noul", es decir, respuesta binaria sí/no) a partir de una sola codificación.

El entrenamiento se realizó exclusivamente con tareas generadas e interfaces sintéticas, nunca con tareas, archivos o trayectorias de benchmarks. Los datos incluyen tres componentes: 360 tareas de escritorio generadas para las diez aplicaciones de OSWorld (sin identificadores compartidos con OSWorld y con similitud difflib inferior a 0,6 respecto a las instrucciones del benchmark), etiquetas de "settledness" obtenidas por hindsight de las mismas grabaciones (una pantalla se considera estable si no cambia en un segundo) y páginas web generadas proceduralmente (SynthWeb) con verdad de referencia exacta para diálogos, toasts, errores, carga, cambios de layout, habilitación retardada y movimiento ambiental. Las etiquetas de profesor provienen de un modelo de decisión mayor y las etiquetas gold de la secuencia de fotogramas grabada. El conjunto de datos está publicado en nullptr04/NightWatch-Data.

## Capacidades

- Clasificación binaria (noul) de preguntas fijas sobre el estado de una interfaz: aparición de diálogos, pantalla en carga, presencia del objetivo de un clic, cambio del objetivo.
- Detección de "settledness": determina si la pantalla se ha estabilizado (sin cambios en un segundo).
- Procesamiento multimodal de hasta cuatro capturas de pantalla y recortes por consulta.
- Inferencia sin generación de texto: devuelve probabilidades por respuesta en una sola codificación, lo que reduce la latencia frente a modelos generativos.
- Integración como "system one" reactivo que complementa a un agente de razonamiento sin modificarlo.
- Soporte de intervenciones del harness: interrumpir razonamiento, anular acciones obsoletas y despertar al agente cuando la pantalla se estabiliza.
- Clasificación zero-shot mediante el pipeline `zero-shot-classification` de transformers.
- No dispone de tool calling, function calling ni capacidades de agente autónomo propias; su rol es perceptivo y de decisión acotada.

## Casos de uso

- Vigilancia de agentes de uso de ordenador en producción: desplegado junto a un agente principal (por ejemplo, basado en un LLM mayor), NightWatch monitoriza el flujo de pantalla y detecta diálogos inesperados o pantallas bloqueadas, permitiendo que el harness interrumpa el razonamiento del agente antes de que actúe sobre un estado obsoleto.
- Anulación de acciones obsoletas: cuando la pantalla cambia entre la decisión del agente y la ejecución del clic, el modelo detecta que el objetivo ya no está presente o ha cambiado y el harness anula la acción pendiente, evitando clics erróneos en entornos de escritorio.
- Reactivación temprana tras carga: en flujos con pantallas que tardan en estabilizarse, el modelo estima la settledness y despierta al agente en cuanto la interfaz deja de cambiar, reduciendo esperas fijas y latencia total del bucle.
- Automatización de pruebas de interfaz gráfica: integrado en pipelines de QA, detecta la aparición de toasts, errores o cambios de layout en aplicaciones de escritorio y web, generando señales de fallo sin necesidad de assertions manuales.
- Monitorización de asistentes RPA en escritorio: como servicio de baja latencia junto a herramientas de automatización robótica de procesos, valida que la ventana esperada sigue activa antes de cada paso de la secuencia.
- Detección de errores y estados de carga en aplicaciones web: gracias al entrenamiento con SynthWeb, identifica errores, toasts y habilitación retardada de controles en páginas generadas, útil para agentes que operan portales web.
- Investigación en percepción proactiva: sirve como componente reproducible (datos y pesos publicados) para estudiar la sincronización entre razonamiento y estado visual en agentes, con métricas de validación publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas de validación sobre una partición held-out de los datos de entrenamiento (no un benchmark), tras la etapa final de fine-tuning:

| Pregunta | n | AUROC | Brier |
|---|---|---|---|
| settled | 400 | 0,917 | 0,038 |
| dialog | 400 | 0,990 | 0,023 |
| target_present | 115 | 0,994 | 0,021 |
| target_changed | 115 | 0,995 | 0,013 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 852.985.920 parámetros, en fp16 requeriría aproximadamente 1,7 GB de pesos más overhead de activaciones y torre de visión, por lo que en la práctica cabría en GPUs consumer con 8 GB o más; en cuantizaciones de 8 o 4 bits el requisito bajaría aún más (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 o RTX 3090 serían suficientes para inferencia en fp16; para servir las cuatro instancias del watcher que usa el harness `nightwatch_full` convendría una GPU con holgura de memoria o varias GPUs.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM en fp16 (estimación no confirmada).
- Opciones de despliegue: transformers con `trust_remote_code=True` (runtime Decision 3.0 incluido en el repo); el harness de NightWatch usa `scripts/serve_watcher.sh` para levantar cuatro servidores del watcher. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El diseño de una sola codificación sin generación de texto apunta a latencias bajas, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la categoría de percepción proactiva para agentes de uso de ordenador. Como referencia de su linaje:

| Modelo | Parámetros | Contexto | Función | Licencia |
|---|---|---|---|---|
| NightWatch-0.8B | 852.985.920 | no disponible (hasta 4 imágenes) | Clasificación de estado de interfaz (watcher) | Apache-2.0 |
| vllm-sr/d3-lite (base) | 0,85B | no disponible | Modelo de decisión general | Apache-2.0 |
| Qwen3.5-0.8B (raíz) | 0,8B | no disponible | Modelo de lenguaje general | Apache-2.0 |

No se han identificado alternativas públicas con la misma tarea específica (watcher de pantalla para agentes) en la información disponible.

## Limitaciones y advertencias

- El modelo responde únicamente a un banco fijo de preguntas genéricas; no es un modelo de propósito general ni genera texto.
- Las métricas publicadas corresponden a una partición held-out de los datos de entrenamiento, no a benchmarks independientes; el rendimiento en entornos reales no está validado públicamente.
- El entrenamiento usa exclusivamente tareas generadas e interfaces sintéticas; puede generalizar peor a interfaces reales muy distintas de las diez aplicaciones de OSWorld y de SynthWeb.
- Los idiomas soportados no están documentados; el modelo opera sobre descripciones textuales del estado y la acción, por lo que el idioma de esas descripciones condiciona su comportamiento.
- Riesgo de alucinación en el sentido de falsos positivos o negativos en la clasificación (diálogos, carga, presencia del objetivo); las probabilidades calibradas mitigan pero no eliminan este riesgo.
- Requiere `trust_remote_code=True` y un runtime personalizado (Decision 3.0), lo que añade superficie de ejecución de código no estándar en producción.
- Licencia Apache-2.0, que permite uso comercial; debe respetarse el NOTICE con las atribuciones a vllm-sr/d3-lite y Qwen/Qwen3.5-0.8B.
- Sin descargas ni likes en el momento de la consulta: proyecto muy reciente (creado en noviembre de 2026) y sin validación comunitaria.
- El modelo está pensado para integrarse con el harness de NightWatch; su uso aislado requiere implementar las reglas que traducen probabilidades en intervenciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nullptr04/NightWatch-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/nullptr04/NightWatch-Data
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper citado en la model card: "Don't Sleep, Keep Watch: Proactive Perception for Computer-Use Agents" (sin URL disponible en la información proporcionada)
- Repositorio del harness NightWatch: no disponible (referenciado como `scripts/setup_env.sh` y `scripts/serve_watcher.sh`, sin URL)
