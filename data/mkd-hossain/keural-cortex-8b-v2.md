# mkd-hossain/Keural-Cortex-8B-v2

## Resumen

Keural-Cortex-8B-v2 es un checkpoint experimental de tipo causal language model de arquitectura densa compatible con Qwen3, publicado por el usuario mkd-hossain en HuggingFace. Se trata de un ajuste sobre Qwen/Qwen3-8B-Base orientado a conversacion bilingue ingles-coreano, resultado de una cadena de entrenamiento que incluye preentrenamiento continuado, extension de contexto, SFT, DPO y una fase final de SFT correctivo. El autor lo publica explicitamente como un artefacto que no supero la aceptacion local de release y que no se recomienda para produccion ni para ejecucion autonoma de herramientas.

Su relevancia no es de rendimiento, sino de trazabilidad: el repositorio preserva el checkpoint `step_0002990` de la ejecucion del 21-22 de septiembre de 2026 y documenta con detalle sus fallos (llamadas a herramientas innecesarias, invencion de direcciones de correo tras busquedas de contacto sin resultados, errores aritmeticos y regresiones frente a un piloto anterior). Es, por tanto, un caso de estudio util sobre SFT correctivo, olvido catastrofico y evaluacion de comportamiento agentico.

Existe una discrepancia importante entre el nombre del modelo (8B) y el recuento real de parametros de los safetensors del repositorio (2.047.683.840, es decir, unos 2,05 mil millones), mientras que la model card afirma "aproximadamente 8B". El tamano del repositorio (16,4 GB) es mas coherente con pesos BF16 de un modelo de ~8B que con 2,05B. Este dato debe verificarse antes de cualquier uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal, compatible con Qwen3 |
| Parametros totales | 2.047.683.840 segun safetensors del repositorio; la model card declara "aproximadamente 8B". Discrepancia sin resolver |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens configurados con YaRN factor 2; el autor advierte que la configuracion no garantiza razonamiento fiable en toda la ventana. Longitud de secuencia en el entrenamiento correctivo: 16.384 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo incluye pesos BF16 en safetensors |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16), libreria transformers |
| Modelo base | Qwen/Qwen3-8B-Base |
| Plantilla de chat | Plantilla SFT original embebida en la configuracion del tokenizer; soporta el flag `enable_thinking` |
| Tamano del repositorio | 16,4 GB |
| Fecha de creacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso causal de tipo decoder-only, compatible con la familia Qwen3, con pesos exportados en BF16 y plantilla de chat heredada del SFT original. El modelo no introduce semilla artificial de prefijo de razonamiento: la presencia del canal de razonamiento depende del flag `enable_thinking` y, segun el autor, su activacion no implica mayor precision de razonamiento. El contexto se configuro a 65.536 tokens mediante YaRN con factor 2.

El linaje de entrenamiento documentado es: Qwen3-8B-Base → checkpoint de preentrenamiento continuado `step_0010000` → extension de contexto `step_0000795` → SFT-v2 `step_0001124` → DPO-v1 `step_0004473` → esta ejecucion de SFT correctivo. El conjunto de datos de la fase correctiva contiene 53.444 conversaciones: 23.752 ejemplos correctivos generados y 29.692 ejemplos de replay del corpus SFT existente. La validacion generada incluye 248 ejemplos relacionados, que el autor senala explicitamente como no independientes. El entrenamiento consumio aproximadamente 0,39B de tokens empaquetados durante dos epocas, con learning rate maximo de 2e-6, longitud de secuencia de 16.384 tokens, perdida solo en los turnos del asistente y conversaciones empaquetadas con fronteras de atencion por documento. El paso final registrado es 2.990, tras reanudar en cuatro GPU NVIDIA H200 un checkpoint del paso 100 que se habia iniciado en tres GPU, manteniendo alineacion de tokens y planificacion del learning rate.

## Capacidades

- Generacion de texto conversacional en ingles y coreano mediante plantilla de chat SFT.
- Modo con y sin razonamiento, controlado por el flag `enable_thinking` en la llamada a `apply_chat_template`. El autor advierte que la presencia del canal de razonamiento no garantiza precision.
- Recuperacion en contexto largo: supero 8 de 8 casos en una suite sintetica de recuperacion con contextos de aproximadamente 4K a 55K tokens. El propio autor indica que esto no demuestra competencia general a 64K.
- Tool calling: el modelo emite sintaxis de llamadas a herramientas que vLLM puede parsear, pero el autor senala que esto no implica que las acciones generadas sean fiables.
- Comportamiento agentico multi-paso: soportado a nivel de formato, con fallos documentados en la suite de dependencias (por ejemplo, `send_email` emitido tras una busqueda de contacto sin resultados).
- Capacidad aritmetica limitada: se documentan errores de aritmetica, especialmente con prompts largos de estilo plataforma.
- Comportamiento en chat simple: 12 de 12 en el subconjunto de chat plano de la suite de comportamiento.
- No se declaran capacidades de vision, audio, ni soporte de idiomas adicionales a ingles y coreano.

## Casos de uso

- Comparacion de checkpoints en investigacion: el repositorio existe precisamente para contrastar este artefacto con el DPO original y con pilotos anteriores; util para estudiar como el SFT correctivo prolongado puede degradar el comportamiento en casos nuevos (22/32 frente a 28/32 del piloto).
- Analisis de errores en tool calling: la suite de dependencias documentada permite reproducir el fallo de invencion de direcciones y llamadas a `send_email` tras busquedas sin resultados, y usar ese material para mejorar esquemas de validacion previa a la accion.
- Evaluacion offline de plantillas de chat: al incluir la plantilla SFT embebida en el tokenizer, sirve para probar diferencias de comportamiento entre modos thinking y non-thinking con `apply_chat_template` sin necesidad de infraestructura de produccion.
- Pruebas de integracion con vLLM: el propio autor uso un servidor vLLM temporal para la aceptacion HTTP/streaming; el checkpoint es util para validar el parseo de sintaxis de herramientas en el servidor, no la calidad de las acciones.
- Investigacion bilingue ingles-coreano: permite explorar transferencia y degradacion en un ajuste bilingue sobre una base entrenada principalmente en ingles, con un corpus correctivo pequeno y documentado.
- Red-teaming de comportamiento agentico: util para construir conjuntos de casos adversos (saludos con herramientas disponibles, peticiones de redaccion ya especificadas) que provoquen clarification calls innecesarios y medir la tasa de falsos positivos.
- Estudio de olvido catastrofico: el propio autor documenta que el entrenamiento correctivo mas largo rindio peor en casos frescos que el piloto enfocado, lo que lo convierte en material para analizar el efecto de mas datos y mas pasos sobre retencion de comportamiento.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, GSM8K, HumanEval, etc.) y advierte que las afirmaciones de benchmarks de model cards anteriores no son transferibles a este checkpoint. Los unicos datos disponibles son diagnosticos locales de la model card:

| Diagnostico | Este checkpoint | Referencia |
|---|---:|---|
| Comportamiento estilo plataforma | 51/56 | DPO original: 28/56; piloto enfocado previo: 52/56 |
| Subconjunto de chat plano de la suite de comportamiento | 12/12 | No es una suite independiente |
| Regresion general | 31/32 | DPO original: 31/32 |
| Recuperacion en contexto largo | 8/8 | Suite sintetica pequena, contextos de ~4K a 55K |
| Casos frescos estilo plataforma | 22/32 | Piloto enfocado previo: 28/32 |
| Suite de acciones dependientes, puntuacion automatica | 5/8 | Ver limitacion del scorer mas abajo |
| Aceptacion HTTP/streaming | Fallo en el primer test | Los siete tests restantes no se completaron |

El autor matiza que el scorer de la suite de acciones dependientes rechazo un rechazo semanticamente apropiado (falso negativo), pero que dos fallos eran sustantivos: el modelo invento direcciones de destinatario y genero llamadas a `send_email` tras un resultado de busqueda sin coincidencias. En la prueba HTTP, con `tool_choice: auto`, thinking desactivado y herramientas disponibles, la peticion `Hello!` devolvio HTTP 200 pero el modelo genero `ask_clarification` en lugar de un saludo. No hay resultados de benchmarks publicados mas alla de estos diagnosticos.

## Requisitos de hardware

- Pesos: repositorio de 16,4 GB, exportado en BF16. El entrenamiento se realizo en cuatro NVIDIA H200 (reanudado desde un tramo inicial en tres GPU).
- VRAM estimada en BF16: si el modelo es realmente de ~8B, los pesos ocupan aproximadamente 16 GB y la inferencia practica requiere del orden de 20-24 GB o mas segun el tamano del KV cache. Si el recuento de safetensors (2,05B) fuese el correcto, los pesos BF16 ocuparian aproximadamente 4,1 GB. La discrepancia no resuelta impide dar una cifra fiable.
- KV cache a 65.536 tokens: no disponible; depende de la configuracion de atencion, no detallada en la informacion proporcionada.
- GPU recomendadas: H200 para entrenamiento. Para inferencia, no se especifican; dado el tamano declarado de la model card, una GPU de 24 GB (RTX 4090, A5000) seria suficiente en BF16, pero esta estimacion no esta confirmada.
- GPU de consumo: probablemente viable en tarjetas de 24 GB si el modelo tiene ~8B en BF16; no hay cuantizaciones publicadas que reduzcan el requisito.
- Opciones de despliegue: transformers/PyTorch (ejemplo de carga incluido en la model card), vLLM (usado por el autor para la prueba HTTP) y text-generation-inference (tag presente en el repositorio). No hay GGUF, por lo que llama.cpp y Ollama no son opciones directas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Keural-Cortex-8B-v2 | 8B declarados / 2,05B segun safetensors | 65.536 tokens con YaRN factor 2 | Apache-2.0 | Publico en HuggingFace, sin cuantizaciones | Diagnosticos locales unicamente |
| Qwen/Qwen3-8B-Base (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache-2.0 (heredada por el ajuste) | Publico en HuggingFace | No disponible |
| Alternativas directas de 8B bilingue EN-KO | No disponible | No disponible | No disponible | No disponible | No disponible |

Solo puede compararse con garantias el modelo base del que deriva, ya que es el unico alternativo mencionado en la informacion disponible. No se dispone de datos verificados de rendimiento, contexto ni parametros de otros modelos comparables, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- El autor declara que el checkpoint no supero la aceptacion local de release y que no se recomienda su despliegue en produccion ni la ejecucion autonoma de herramientas.
- Las llamadas de clarificacion y de herramienta innecesarias persisten ante saludos y ante peticiones de redaccion de correo suficientemente especificadas.
- Una busqueda de contacto sin resultados puede provocar direcciones fabricadas y llamadas `send_email`. Nunca deben permitirse acciones externas sin revision humana.
- Persisten errores aritmeticos, en particular con prompts largos de estilo plataforma.
- El entrenamiento correctivo mas largo rindio peor que el piloto enfocado anterior en casos frescos (22/32 frente a 28/32): mas entrenamiento no mejoro el comportamiento de forma uniforme.
- Superar ocho casos de recuperacion en contexto largo no demuestra competencia amplia a 64K.
- La presencia del canal de razonamiento o la activacion de thinking no garantiza precision de razonamiento.
- El conjunto de validacion generado (248 ejemplos relacionados) no es evidencia independiente de generalizacion.
- No se ha establecido capacidad general, robustez, descontaminacion del dataset ni aceptacion en despliegue real. Las afirmaciones de benchmarks de model cards anteriores no se transfieren a este modelo.
- La discrepancia entre los 8B del nombre y los 2.047.683.840 parametros de safetensors no esta resuelta en la informacion disponible y afecta a cualquier estimacion de memoria.
- Riesgo de alucinacion: documentado de forma explicita en la generacion de direcciones de correo.
- Sesgos conocidos: no disponible; el autor no reporta analisis de sesgo.
- Uso previsto declarado: investigacion, comparacion de checkpoints, analisis de errores y evaluacion offline controlada. Mantener la ejecucion de herramientas desactivada o simulada.
- La licencia Apache-2.0 permite uso comercial del artefacto, pero el propio autor desaconseja su uso en produccion por motivos de fiabilidad, no de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper, blog, repositorio de codigo o demo: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a una marca de calzado ajena al proyecto).
