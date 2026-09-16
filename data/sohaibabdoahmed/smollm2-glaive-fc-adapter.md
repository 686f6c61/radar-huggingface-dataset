# SohaibAbdoAhmed/smollm2-glaive-fc-adapter

## Resumen

`SohaibAbdoAhmed/smollm2-glaive-fc-adapter` es un adaptador LoRA (PEFT) entrenado mediante QLoRA sobre el modelo base `HuggingFaceTB/SmolLM2-1.7B-Instruct`. Su único propósito declarado es especializar el modelo en *function calling*: a partir de una consulta en lenguaje natural y un conjunto de funciones disponibles, el modelo aprende a emitir la llamada a herramienta correspondiente con sus argumentos. El autor lo publica como adaptador independiente, no como modelo fusionado, de modo que los pesos base permanecen intactos y el adaptador se carga por encima con la librería `peft`.

El modelo parte de SmolLM2-1.7B-Instruct, un transformer decoder-only denso de 1.700 millones de parámetros desarrollado por HuggingFaceTB. Al ser un adaptador, su huella en disco es mínima (el repositorio ocupa aproximadamente 0,1 GB) y hereda las capacidades generales del modelo base, sobre las que se superpone el comportamiento específico de invocación de herramientas. Está etiquetado únicamente para inglés (`en`) y no declara licencia.

Su relevancia práctica es acotada pero concreta: cubre el nicho de *tool calling* en modelos por debajo de 2.000 millones de parámetros, ejecutables en hardware de consumo o en el borde. No obstante, el repositorio no incluye métricas de evaluación, detalles del hiperentrenamiento ni licencia explícita, por lo que cualquier uso en producción exige una validación propia previa. El modelo fue creado y actualizado el 16 de septiembre de 2026 y registra cero descargas y cero *likes* en el momento de redactar esta ficha, lo que implica ausencia total de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (SmolLM2-1.7B-Instruct) |
| Parámetros totales | Modelo base: 1.700 millones. Adaptador: no disponible (repositorio de ~0,1 GB en safetensors; rango y alpha no especificados) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base SmolLM2-1.7B-Instruct; no se documenta en la ficha del adaptador) |
| Tipos de cuantización | Entrenamiento con QLoRA (cuantización de 4 bits del base durante el ajuste). Los pesos del adaptador se distribuyen en safetensors; no se publican versiones GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el adaptador no declara licencia; el modelo base SmolLM2 se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre `HuggingFaceTB/SmolLM2-1.7B-Instruct`. QLoRA congela los pesos del modelo base cuantizados a 4 bits e inserta matrices de bajo rango entrenables en las capas de atención y proyección, lo que reduce drásticamente los requisitos de memoria del ajuste. En inferencia, el adaptador puede cargarse dinámicamente con `PeftModel.from_pretrained` o fusionarse con los pesos base para obtener un modelo único equivalente.

El único dato de entrenamiento documentado es el conjunto de datos: `glaiveai/glaive-function-calling-v2`, un corpus conversacional orientado a llamadas a funciones con ejemplos de invocación, argumentos y respuestas. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la duración del ajuste, los hiperparámetros (rango, alpha, tasa de aprendizaje, épocas) ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del propio uso de QLoRA. Las características arquitectónicas internas del modelo base (número de capas, cabezas de atención, vocabulario, composición del corpus de preentrenamiento) no se detallan en la información disponible sobre el adaptador.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base.
- *Function calling* / *tool calling*: emisión de llamadas a funciones con nombre y argumentos a partir de una consulta en lenguaje natural, que es el objetivo explícito del ajuste.
- Salida estructurada orientada a JSON, como consecuencia del entrenamiento sobre Glaive Function Calling v2.
- Seguimiento de conversaciones multi-turno, ya que el dataset de ajuste es de naturaleza conversacional.
- Razonamiento de múltiples pasos con herramientas: no verificado ni documentado; el adaptador no incluye evaluación de agentes.
- Capacidades de código, matemáticas y visión: no documentadas específicamente para este adaptador; las que aporte el modelo base, sin garantía.
- Capacidades multilingües: no. El modelo está etiquetado exclusivamente para inglés.
- Modo de razonamiento explícito (*thinking mode*), audio o cualquier otra modalidad: no disponible.

## Casos de uso

- **Enrutamiento de funciones en asistentes conversacionales**: dado un catálogo de funciones (consultar pedido, cancelar suscripción, abrir incidencia), el adaptador traduce la petición del usuario en inglés a la llamada correcta con sus argumentos. Es el caso de uso para el que fue entrenado explícitamente.
- **Extracción de argumentos con salida estructurada**: integrado en un *pipeline* que recibe texto libre y necesita un JSON validable contra un esquema, por ejemplo para rellenar formularios o normalizar entidades antes de pasarlas a un backend.
- **Agentes ligeros en el borde o *on-premise***: con 1.700 millones de parámetros y el adaptador fusionado, el modelo puede desplegarse en una GPU de consumo o incluso en CPU cuantizado, lo que permite agentes locales donde no se puede enviar datos a la nube.
- **Prototipado rápido de *tool calling* y experimentación con PEFT**: al ser un adaptador de bajo rango, sirve como punto de partida reproducible para estudiar el efecto del ajuste QLoRA sobre SmolLM2 sin reentrenar desde cero.
- **Clasificación de intenciones con estructura de herramienta**: en lugar de un clasificador dedicado, el modelo puede devolver el nombre de la función como etiqueta, aprovechando la ventana de contexto heredada para incluir el catálogo completo de herramientas en el *prompt*.
- **Automatización de tareas internas contra APIs** (calendario, correo, CRM): el modelo actúa como capa de traducción entre lenguaje natural y llamadas HTTP con parámetros, siempre que las funciones se describan en el *prompt* y se valide la salida antes de ejecutarla.
- **Base para *fine-tuning* adicional en dominios concretos**: al ser un adaptador independiente, permite apilar o sustituir ajustes posteriores sobre SmolLM2-1.7B-Instruct sin tocar los pesos originales.
- **Evaluación comparativa de adaptadores LoRA**: útil como referencia en estudios que midan degradación de capacidades generales tras un ajuste especializado en *function calling*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de ningún tipo (ni específicas de *function calling* como Berkeley Function Calling Leaderboard, ni generales como MMLU, GSM8K o HumanEval), ni comparaciones frente al modelo base sin adaptar. La búsqueda web realizada no devolvió resultados relacionados con el modelo.

## Requisitos de hardware

- **VRAM en precisión completa (BF16/FP16)**: aproximadamente 3,4 GB solo para los pesos del modelo base, más entre 0,5 y 1,5 GB adicionales para caché KV, activaciones y *overhead* del *runtime*. En la práctica, entre 5 y 6 GB.
- **VRAM en cuantización de 8 bits**: del orden de 2 GB de pesos, con un total estimado de 3 a 4 GB.
- **VRAM en cuantización de 4 bits (GGUF Q4_K_M tras fusionar el adaptador)**: alrededor de 1 a 1,5 GB de pesos, con un total estimado de 2 a 3 GB.
- **GPU recomendadas**: cualquier GPU con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 3070, RTX 4070) es suficiente en BF16. GPU de centro de datos (A100, H100) no son necesarias y resultarían desproporcionadas.
- **¿Cabe en GPU de consumo?**: sí, con holgura. Incluso GPU de 6 GB pueden ejecutar el modelo cuantizado a 4 bits. En CPU, la inferencia cuantizada es viable con velocidades moderadas.
- **Opciones de despliegue**: `transformers` + `peft` (ruta documentada por el autor), vLLM (soporte de adaptadores LoRA), Text Generation Inference (soporte de adaptadores), llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- **Latencia y throughput**: no disponibles. No se publican mediciones de *tokens* por segundo, tiempo hasta el primer token ni comportamiento bajo lotes concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm2-glaive-fc-adapter | 1,7 B (+ adaptador LoRA) | 8.192 tokens | *Function calling* (Glaive FC v2) | no disponible | HuggingFace, formato PEFT/safetensors |
| SmolLM2-1.7B-Instruct (base) | 1,7 B | 8.192 tokens | Instrucciones generales | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (ampliable con YaRN) | Instrucciones generales y *tool calling* | Apache 2.0 | HuggingFace, safetensors y GGUF |
| Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens | Instrucciones generales y *tool calling* | Licencia comunitaria Llama 3.2 | HuggingFace y GGUF |

No hay datos de rendimiento publicados para el adaptador, por lo que la comparación se limita a parámetros, contexto, licencia y formato de distribución. En contexto, licencia y disponibilidad de cuantizaciones, los tres modelos alternativos ofrecen condiciones más favorables; la ventaja del adaptador es exclusivamente la especialización declarada en *function calling*, no verificada con métricas.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: no hay benchmarks ni validación de terceros. No se puede afirmar que el adaptador mejore al modelo base en *function calling* sin una evaluación propia.
- **Riesgo de alucinación de funciones y argumentos**: al ser un modelo de 1.700 millones de parámetros ajustado sobre un único dataset, puede inventar nombres de funciones no presentes en el catálogo o generar argumentos con tipos incorrectos. Es obligatorio validar la salida contra un esquema antes de ejecutar cualquier llamada.
- **Riesgo de olvido catastrófico**: el ajuste especializado puede degradar capacidades generales del modelo base (redacción, código, matemáticas), algo que no se documenta ni se cuantifica.
- **Idioma**: solo inglés. El comportamiento en castellano u otros idiomas no está entrenado ni evaluado.
- **Licencia no disponible**: el repositorio no declara licencia. Esto impide determinar si el uso comercial está permitido. El modelo base es Apache 2.0, pero eso no resuelve la licencia del adaptador. Cualquier uso en producción debería aclararse con el autor.
- **Trazabilidad limitada**: no se documentan hiperparámetros, épocas, ni el volumen exacto de datos de ajuste, lo que dificulta reproducir el entrenamiento.
- **Sesgos**: no evaluados. El dataset Glaive proviene de datos generados y puede arrastrar sesgos de idioma, dominio y estilo no caracterizados.
- **Madurez del artefacto**: cero descargas y cero *likes*, creado y actualizado en el mismo instante, sin historial de mantenimiento. No hay evidencia de que el adaptador haya sido probado por nadie ajeno al autor.
- **Compatibilidad de plantilla**: el adaptador depende de la plantilla de chat y del formato de *prompt* del modelo base y del dataset Glaive. Cambiar el formato de las descripciones de funciones puede degradar el comportamiento de forma significativa.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/SohaibAbdoAhmed/smollm2-glaive-fc-adapter
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Repositorio de la librería PEFT: https://github.com/huggingface/peft
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- La búsqueda web no devolvió ningún resultado relacionado con el modelo. Los enlaces recuperados trataban sobre proyectos de geotermia urbana en París y no guardan relación con esta ficha.
