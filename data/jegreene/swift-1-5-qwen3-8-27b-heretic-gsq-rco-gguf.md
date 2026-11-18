# jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF es una compilación GGUF cuantizada y parcialmente "abliterada" (decensurada) del modelo Swift 1.5 Qwen3.8-27B de UkisAI, publicada por el usuario jegreene. El modelo base es un transformer multimodal de 27.320.697.856 parámetros (27,3 mil millones) derivado de la familia Qwen3, con capacidad de razonamiento explícito mediante modo `<think>` y torre de visión para entrada image-text-to-text. La versión heretic se ha generado con la herramienta Heretic, que aplica abliteración para reducir los comportamientos de rechazo del modelo original.

El paquete incluye tres cuantizaciones GGUF de un solo archivo (IQ3_S, IQ3_XXS e IQ2_S), todas con cabeza MTP (multi-token prediction) para decodificación especulativa, más un proyector de visión (mmproj) en F16. Está pensado para ejecutarse en llama.cpp y ofrece una alternativa de despliegue local de un modelo de 27B con visión y razonamiento en hardware de consumo, a costa de una pérdida de calidad por cuantización agresiva (2,81-3,55 bits por peso).

La relevancia actual radica en dos factores: por un lado, la demanda de modelos multimodales de tamaño medio que quepan en GPUs de consumo; por otro, el interés de la comunidad en variantes con menor alineación de seguridad. No obstante, el propio autor advierte que la abliteración es solo parcial: el modelo sigue rechazando aproximadamente el 80% de 100 prompts dañinos según su conteo estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3), con cabeza MTP y torre de visión |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (3,55 BPW), IQ3_XXS (3,06 BPW), IQ2_S (2,81 BPW); mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (llama.cpp), un solo archivo por cuantización; chat template en jinja opcional |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27,3 mil millones de parámetros de la familia Qwen3, con capacidad de razonamiento en modo `<think>` y una torre de visión que permite entrada image-text-to-text. Incluye una cabeza MTP (multi-token prediction) que habilita decodificación especulativa en llama.cpp, y un proyector multimodal (mmproj) construido a partir de la propia torre de visión de Swift. Esta compilación concreta no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original.

La innovación técnica de esta publicación es el proceso de abliteración con Heretic, que modifica los pesos para reducir la tasa de rechazos. Según el autor, el modelo original resiste fuertemente la abliteración: se reduce de 99/100 rechazos estrictos a 80/100, con una divergencia KL de 0,082 frente a Swift 1.5. Las cuantizaciones se han generado con las mismas asignaciones por tensor y la misma imatrix que las publicaciones GSQ-RCO `-mtp` oficiales de UkisAI. Las divergencias KL adicionales por cuantización, según UkisAI, son 0,051 para IQ3_S, 0,098 para IQ3_XXS y 0,135 para IQ2_S, que se suman al 0,082 de la abliteración.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito mediante modo `<think>`.
- Comprensión de imágenes (image-text-to-text) gracias al proyector mmproj incluido.
- Razonamiento matemático y de conocimiento general (evaluado en GSM8K y MMLU-Pro).
- Seguimiento de instrucciones (evaluado en IFEval).
- Decodificación especulativa mediante cabeza MTP, que acelera la inferencia en llama.cpp.
- Comportamiento parcialmente decensurado: responde a aproximadamente 1 de cada 5 peticiones que el modelo original rechaza.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con visión: el modelo puede procesar imágenes junto a texto (pipeline image-text-to-text) y mantener conversaciones multi-turno, lo que permite desplegar un asistente que describa capturas de pantalla, diagramas o fotografías sin depender de APIs externas.
- Razonamiento matemático asistido: con un 97,6% de precisión en una muestra de 250 preguntas de GSM8K, es adecuado para tutores o verificadores de cálculos paso a paso en entornos educativos o de análisis financiero básico.
- Seguimiento estricto de instrucciones en pipelines automatizados: sus resultados en IFEval (92,98% de precisión estricta a nivel de prompt) lo hacen útil para tareas de extracción y transformación de datos donde el formato de salida debe respetarse al pie de la letra.
- Prototipado de investigación sobre alineación y seguridad: al ser una variante abliterada con métricas documentadas de rechazo y divergencia KL, sirve para estudiar el efecto de la abliteración en modelos de 27B y comparar comportamientos frente al original.
- Despliegue en hardware de consumo: con cuantizaciones de 9,61 a 12,12 GB, puede ejecutarse en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) mediante llama.cpp, lo que facilita pruebas locales de un modelo de 27B con visión.
- Generación de contenido creativo sin fricción: la reducción parcial de rechazos permite explorar narrativa o guiones con temáticas que el modelo original evitaría, siempre que el uso cumpla la licencia y la legislación aplicable.
- Evaluación comparativa de cuantizaciones: los tres tamaños publicados (IQ2_S, IQ3_XXS, IQ3_S) permiten medir el compromiso entre calidad y huella de memoria en un mismo modelo, útil para calibrar despliegues con restricciones de VRAM.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), medidos sobre la cuantización IQ3_S:

| Benchmark | Metrica | Valor |
|---|---|---|
| IFEval | prompt-level strict acc | 92,98 |
| IFEval | instruction-level strict acc | 95,20 |
| IFEval | prompt-level loose acc | 94,64 |
| IFEval | instruction-level loose acc | 96,52 |
| MMLU-Pro (muestra aleatoria de 300 preguntas) | accuracy | 86,67 |
| GSM8K (muestra aleatoria de 250 preguntas) | accuracy | 97,60 |

Métricas de abliteración declaradas por el autor:

| Modelo | Rechazos estrictos (de 100 prompts dañinos) | Rechazos con conteo por defecto de Heretic | Divergencia KL vs. Swift 1.5 |
|---|---|---|---|
| Swift 1.5 (original) | 99 | 98 | 0 |
| Este modelo | 80 | 36 | 0,082 |

El autor indica que las cuantizaciones IQ3_XXS e IQ2_S no han sido evaluadas ni probadas en velocidad; todas las cifras corresponden a IQ3_S. No se han publicado resultados de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,12 GB para IQ3_S, 10,44 GB para IQ3_XXS y 9,61 GB para IQ2_S, más 0,93 GB del proyector mmproj si se usa visión, y el espacio de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para IQ3_S con contexto amplio; GPUs de 12-16 GB para IQ2_S o IQ3_XXS con contexto moderado. Para despliegues de mayor concurrencia, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más según la cuantización elegida, con margen para el contexto.
- Opciones de despliegue: llama.cpp (formato nativo), y por extensión frontends compatibles como Ollama o servidores basados en llama.cpp. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP permite decodificación especulativa, pero el autor no publica cifras de aceptación ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Swift-1.5-Qwen3.8-27B-heretic) | 27,3B | no disponible | Si | swift-open-license-1.0 | GGUF (IQ2_S a IQ3_S) | Abliteracion parcial; MTP; benchmarks solo en IQ3_S |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | 27,3B | no disponible | Si | swift-open-license-1.0 | safetensors (original) | Sin abliterar; rechazo estricto 99/100 |
| ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF | 27,3B | no disponible | Si | swift-open-license-1.0 | GGUF con MTP | Cuantizaciones oficiales sin abliterar; KL 0,051-0,135 segun tier |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible contrastar rendimiento entre ellos.

## Limitaciones y advertencias

- La abliteración es solo parcial: el modelo sigue rechazando el 80% de 100 prompts dañinos según el conteo estricto. No debe asumirse como un modelo plenamente sin censura.
- El modelo tiende a "esquivar" en lugar de rechazar explícitamente: puede responder a peticiones dañinas con contenido tangencial (por ejemplo, instrucciones de seguridad en vez de la petición), lo que complica la evaluación de su comportamiento real.
- Riesgo de alucinación inherente a modelos de 27B, agravado por la cuantización agresiva (hasta 2,81 BPW en IQ2_S).
- Las cuantizaciones IQ3_XXS e IQ2_S no han sido evaluadas ni probadas en velocidad; su calidad es incierta más allá de las divergencias KL reportadas.
- Los benchmarks son autodeclarados y no verificados, y se han medido sobre muestras reducidas (300 preguntas en MMLU-Pro, 250 en GSM8K), lo que limita su significación estadística.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- La licencia swift-open-license-1.0 es de tipo "other": es necesario revisar el archivo LICENSE antes de cualquier uso comercial. UkisAI y Alibaba Cloud no respaldan esta compilación.
- El uso de una variante abliterada puede contravenir políticas de proveedores de servicios, plataformas de distribución o la legislación aplicable en materia de contenido dañino; el responsable del despliegue asume el riesgo.
- El repositorio incluye una plantilla de chat opcional en jinja; su uso incorrecto puede degradar el formato de las respuestas y el modo `<think>`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cuantizaciones oficiales GSQ-RCO con MTP: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Resultados de evaluación del autor: https://huggingface.co/jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF/tree/main/evaluation
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
