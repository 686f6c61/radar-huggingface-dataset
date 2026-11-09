# Kur0ba/zils-mini-d1

## Resumen

Zils mini d1 (identificador `Kur0ba/zils-mini-d1`) es un modelo de decisión de 4.539.265.536 parámetros construido por el usuario Kur0ba sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo conversacional de propósito general, sino un "cuerpo" (body) de decisión destinado al pool de mezclas (soup) del ecosistema Zils, asociado a la subred 127 de Bittensor. El modelo se distribuye únicamente como pesos en BF16 (tensores de lenguaje y visión) en el formato de chasis fijado por d3-mini; el chasis externo aporta la capa de respuesta, el prompt y el runtime.

La relevancia del modelo es acotada y muy específica: forma parte de una competición de entrenamiento de modelos de decisión en la que los participantes generan cuerpos que responden a familias de preguntas con formato de examen (opción múltiple, conteo, análisis de sentimiento, clasificación de intenciones, etc.). El autor lo describe como un "soup body" obtenido por destilación KL hacia las distribuciones de probabilidad de una serie de modelos maestros (teacher bodies) seleccionados por familia de pregunta, seguido de un promedio ponderado de especialistas.

Arquitectura y entrenamiento se documentan solo de forma parcial: se sabe que parte de Qwen3.5-4B, que emplea LoRA de rango 64 sobre proyecciones de atención, Gated-DeltaNet y MLP, y que el proceso incluye dos especialistas fusionados con el modelo de partida. No hay información pública sobre benchmarks, idiomas soportados ni contexto, por lo que la ficha se limita a lo verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.5-4B, con capas de atención, Gated-DeltaNet y MLP; ajuste fino con LoRA r=64 fusionado |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se entrena con `zils.teacher train` mediante divergencia KL hacia las distribuciones objetivo de una colección de modelos maestros. El ajuste se realiza con LoRA de rango 64 aplicado sobre las proyecciones de atención, Gated-DeltaNet y MLP, con una tasa de aprendizaje de 5e-5 durante una época, y posteriormente se fusiona en los pesos base. Se entrenan dos especialistas desde el mismo punto de partida: uno para las familias de preguntas conocidas y otro para las familias de dominio nuevo y datos de decisión amplios. La fusión final es un promedio ponderado del modelo de partida y ambos especialistas (pesos 0, 0,5 y 0,5 respectivamente) mediante `zils.teacher soup`.

Los objetivos de entrenamiento se construyen por familia de pregunta a partir de las probabilidades de opción del cuerpo público con mejor rendimiento en el conjunto de desarrollo del autor (promediando dos cuerpos cuando la diferencia de habilidad es inferior a 0,03), complementados con filas etiquetadas por el propio modelo de partida para preservar su comportamiento donde no se añade señal nueva. Los datos incluyen filas nativas del split de entrenamiento de Social IQa, PIQA, MultiNLI, RTE, QNLI, 20 Newsgroups, dair-ai/emotion y Sarcasm News Headlines, preguntas de conteo y reglas de sentimiento calculadas exactamente, filas nativas con etiqueta gold de CLINC150 (CC BY 3.0), MMLU auxiliary_train (MIT), metadatos de arXiv hasta 2021 (CC0) y respuestas aceptadas de Stack Exchange (CC BY-SA 4.0), además de preguntas en formato de examen generadas por Qwen/Qwen3.8-27B a partir de splits de entrenamiento. Las respuestas gold se mezclan con las de los maestros (0,5, o 0,9 para respuestas calculadas). El autor declara explícitamente que no se usaron datos del examen de validación, ni semillas públicas de examen, ni datos de clientes.

## Capacidades

- Clasificación y decisión sobre preguntas de opción múltiple en familias tipo examen (razonamiento social, sentido común físico, inferencia en lenguaje natural, clasificación de noticias, emoción, sarcasmo).
- Preguntas de conteo y de aplicación de reglas de sentimiento con respuesta calculada exactamente.
- Clasificación de intenciones (intent classification) a partir de datos de CLINC150.
- Preguntas de conocimiento general en formato MMLU.
- Clasificación de temáticas a partir de metadatos de arXiv.
- Selección de respuestas aceptadas en dominios de Stack Exchange.
- Tensores de visión presentes en el cuerpo (según la model card), aunque no se documenta ninguna tarea multimodal concreta.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning ni modo de razonamiento explícito.
- No se documentan capacidades multilingües; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Enrutamiento de peticiones en aplicaciones: el modelo puede puntuar opciones de clasificación (por ejemplo, intención de un mensaje de usuario) y devolver la opción más probable, aprovechando su entrenamiento sobre CLINC150 y familias de clasificación.
- Moderación y triaje de contenido: las familias de emoción, sarcasmo y clasificación de titulares permiten etiquetar textos entrantes con categorías predefinidas antes de derivarlos a un revisor humano.
- Evaluación automática de exámenes de opción múltiple: el modelo responde en el mismo formato que las semillas de examen públicas, lo que facilita su uso como componente de un pipeline de corrección o de generación de distractores.
- Investigación en destilación de decisiones: sirve como cuerpo de referencia para estudiar cómo se comporta un modelo de 4B destilado por KL desde múltiples maestros en tareas de elección forzada.
- Participación en el pool de mezclas de Zils (subred 127 de Bittensor): el cuerpo está empaquetado en el chasis fijado por d3-mini y puede combinarse con otros cuerpos del pool mediante las herramientas `zils.teacher soup`.
- Clasificación temática de documentación científica: el entrenamiento sobre metadatos de arXiv permite asignar categorías a resúmenes o registros bibliográficos.
- Selección de respuestas en foros técnicos: el modelo puede puntuar respuestas candidatas de Stack Exchange y priorizar la más adecuada según el patrón aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de las familias de examen utilizadas en el entrenamiento, y la página del proyecto Zils solo menciona benchmarks públicos de su modelo experimental de 0,8B, no de este cuerpo de 4B.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB de pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en RTX 4070 Ti (12 GB) o RTX 4060 Ti (16 GB).
- Opciones de despliegue: al ser pesos safetensors de un modelo derivado de Qwen, es compatible con vLLM, TGI y transformers; llama.cpp y Ollama requerirían conversión a GGUF, no publicada por el autor.
- Latencia y throughput: no disponibles. Al tratarse de un cuerpo de decisión con chasis externo, el rendimiento real depende del runtime que aporte dicho chasis.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kur0ba/zils-mini-d1 | 4.539.265.536 | No disponible | Apache-2.0 | Hugging Face | Cuerpo de decisión destilado, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | No disponible en la información | Hugging Face | Modelo base del que deriva; capacidades generales, no especializado en decisión |
| 1lock/zils-mini-astrid-m1 | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo maestro del pool Zils usado como teacher |
| Charlie320/zils-mini-s1 | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo maestro del pool Zils usado como teacher |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un cuerpo de decisión, no un asistente conversacional: sin el chasis d3-mini que aporta la capa de respuesta, el prompt y el runtime, su utilidad directa es limitada.
- No se publican benchmarks ni métricas de validación, por lo que no es posible verificar su calidad frente a otros cuerpos del pool.
- Riesgo de alucinación y de sobreajuste a las familias de pregunta del conjunto de desarrollo del autor; el rendimiento fuera de esas familias no está documentado.
- Los datos de entrenamiento incluyen conjuntos con licencias diversas (CC BY 3.0, MIT, CC0, CC BY-SA 4.0); aunque el autor declara la licencia Apache-2.0 para los pesos, la procedencia de los datos subyacentes debe revisarse para usos comerciales.
- No se documentan sesgos conocidos, pero los conjuntos de origen (Social IQa, MultiNLI, noticias, Stack Exchange) pueden introducir sesgos culturales y de dominio.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingüe.
- Longitud de contexto no disponible; no se recomienda su uso en tareas que requieran ventanas largas sin verificarlo previamente.
- El autor declara no haber usado datos del examen de validación ni datos de clientes, pero no se ofrece auditoría independiente de esa afirmación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kur0ba/zils-mini-d1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio del proyecto Zils: https://zils.ai/
- Página de investigación de modelos Zils: https://zils.ai/model
- Teacher 1lock/zils-mini-astrid-m1: https://huggingface.co/1lock/zils-mini-astrid-m1
- Teacher Charlie320/zils-mini-s1: https://huggingface.co/Charlie320/zils-mini-s1
- Teacher crabby-devil/zils-mini-decision-r16b: https://huggingface.co/crabby-devil/zils-mini-decision-r16b
- Teacher dasLOL/zils-mini-skills-v1: https://huggingface.co/dasLOL/zils-mini-skills-v1
- Teacher qhoenix/zils-mini-decision-v2: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Teacher ANGExllL/zils-mini-senova-ft: https://huggingface.co/ANGExllL/zils-mini-senova-ft
- Teacher tensor-tailor/zils-mini-body-4: https://huggingface.co/tensor-tailor/zils-mini-body-4
- Teacher tensor-tailor/zils-mini-body-5: https://huggingface.co/tensor-tailor/zils-mini-body-5
- Teacher tensor-tailor/zils-mini-body-2: https://huggingface.co/tensor-tailor/zils-mini-body-2
- Teacher Zayaan/zils-mini-ft1: https://huggingface.co/Zayaan/zils-mini-ft1
