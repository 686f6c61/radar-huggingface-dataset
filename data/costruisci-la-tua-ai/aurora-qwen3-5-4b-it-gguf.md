# costruisci-la-tua-ai/aurora-qwen3.5-4b-it-GGUF

## Resumen

Aurora Qwen3.5-4B-IT es un ajuste fino (fine-tuning) mediante LoRA del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario o organización `costruisci-la-tua-ai`. El modelo resultante está orientado a un caso de uso muy concreto: actuar como asistente virtual de la "Pasticceria Aurora", un negocio ficticio creado como ejemplo didáctico en el libro *Costruisci la tua AI*. Responde en italiano a preguntas sobre horarios, precios, pedidos y conservación de productos de pastelería.

El repositorio analizado aquí es la versión cuantizada en formato GGUF del modelo base ajustado (`aurora-qwen3.5-4b-it`), pensada para su despliegue local con llama.cpp. El modelo original cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y conserva la licencia Apache 2.0 del modelo de partida. El adaptador LoRA ha sido fusionado en los pesos, por lo que no requiere carga separada del adaptador.

Su relevancia es fundamentalmente educativa y de demostración: ilustra un flujo completo de especialización de un modelo pequeño mediante LoRA con un conjunto de datos sintético y curado manualmente (390 conversaciones), así como el procedimiento de conversión a GGUF y evaluación mediante un examen específico de 36 preguntas. No está pensado como modelo de propósito general ni para uso comercial en producción sobre dominios reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles internos de atención y capas no disponibles en la información proporcionada) |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF (se menciona explícitamente Q4_K_M; otras variantes no confirmadas) |
| Idiomas soportados | Italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 20,6 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros bajo licencia Apache 2.0. Sobre esa base se aplicó un ajuste fino supervisado mediante LoRA, cuyo adaptador fue posteriormente fusionado en los pesos del modelo, dando lugar a `aurora-qwen3.5-4b-it` v1.1 (21/11/2026). La versión v1.0 permanece disponible bajo la etiqueta `v1.0`.

El conjunto de entrenamiento consta de 390 conversaciones generadas con un modelo abierto a partir de una ficha de hechos inventada sobre la pastelería, posteriormente filtradas con reglas automáticas y revisadas manualmente. No se menciona uso de RLHF ni DPO. Un detalle técnico relevante es que el modelo fue entrenado con un prompt de sistema específico y sin la fase de "razonamiento" (thinking), por lo que en inferencia debe pasarse dicho prompt de sistema y desactivar el modo thinking (`enable_thinking=False` en Transformers, o `--chat-template-kwargs '{"enable_thinking":false}'` en llama.cpp). El incumplimiento de esta condición degrada la calidad de las respuestas.

## Capacidades

- Generación de texto conversacional en italiano, limitada al dominio de la pastelería ficticia (horarios, precios, pedidos, conservación de dulces).
- Respuesta multi-turno dentro de ese dominio, siempre que se incluya el prompt de sistema adecuado.
- Gestión explícita de incertidumbre: cuando no conoce una respuesta, indica que no lo sabe y sugiere llamar o acudir a la tienda.
- Derivación de consultas sobre alergias e intolerancias hacia el personal, con advertencia de que no constituye consejo médico.
- Modo thinking desactivado por diseño de entrenamiento (no se recomienda su uso).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas.
- Capacidades multilingües limitadas al italiano; no se declara soporte de otros idiomas.

## Casos de uso

- Asistente virtual de mostrador para una pastelería: gestiona consultas sobre horarios de apertura, precios y disponibilidad de productos respondiendo en italiano breve y cordial, gracias al ajuste fino sobre conversaciones del dominio.
- Atención a pedidos por encargo: puede responder a preguntas sobre cómo realizar un pedido y plazos, usando exclusivamente la información contenida en la ficha de hechos con la que fue entrenado.
- Consultas sobre conservación de dulces: responde a preguntas sobre cómo mantener tartas y bollería en buen estado, un caso típico de FAQ de comercio minorista.
- Derivación responsable en temas de salud: ante preguntas sobre alérgenos, remite al personal de la tienda, lo que lo hace adecuado como primera capa de triaje conversacional.
- Despliegue local ligero en llama.cpp: al ser un GGUF Q4_K_M de ~4,2 mil millones de parámetros, puede ejecutarse en hardware modesto para demostraciones, talleres o entornos de aprendizaje.
- Material didáctico para cursos de fine-tuning: sirve como ejemplo reproducible del flujo LoRA → fusión → conversión GGUF → evaluación con examen específico, útil en formación de desarrolladores.
- Prototipado rápido de bots de dominio cerrado: permite validar la experiencia conversacional de un asistente vertical antes de invertir en un modelo mayor o en datos reales.

## Benchmarks y rendimiento

Los únicos datos publicados son los resultados del "examen 1.1" de 36 preguntas específicas del dominio, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Prueba | Preguntas correctas |
|---|---|
| aurora-g4e4b | 29/30 |
| aurora-q2b | 21/30 |
| aurora-q4b-qlora | 23/30 |
| aurora-q4b | 26/30 |
| base-g4e4b | 10/30 |
| base-q2b | 6/30 |
| base-q4b | 11/30 |
| gguf-q4-aurora-gemma4-e4b-it | 26/30 |
| gguf-q4-aurora-qwen3.5-4b-it (v1.0) | 26/30 |
| gguf-q4-aurora-qwen3.5-4b-it (v1.1) | 29/30 |

Según la model card, la versión v1.1 en Q4_K_M obtiene 35/36 en el examen 1.1, frente a 30/36 de la v1.0. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~4,2 mil millones de parámetros en Q4_K_M, el peso de los pesos ronda los 2,5–3 GB, a lo que hay que sumar overhead de contexto y runtime (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas en la información proporcionada.
- Compatibilidad con GPU de consumo: previsible para cuantizaciones Q4 en GPUs con 6–8 GB de VRAM (estimación orientativa, no confirmada).
- Opciones de despliegue: llama.cpp (comando `llama-server` documentado en la model card), y Transformers con `AutoModelForCausalLM` para el modelo base sin cuantizar. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| aurora-qwen3.5-4b-it-GGUF (v1.1) | ~4,2 mil millones | No disponible | Apache 2.0 | Asistente de dominio cerrado (pastelería ficticia), italiano | GGUF en Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,2 mil millones | No disponible | Apache 2.0 | Modelo generalista multilingüe | Pesos originales en Hugging Face |
| aurora-gemma4-e4b-it (GGUF Q4) | No disponible | No disponible | No disponible | Variante del mismo experimento sobre Gemma | GGUF en Hugging Face |
| aurora-q2b / aurora-q4b | No disponible | No disponible | No disponible | Variantes del mismo experimento con otros tamaños | Hugging Face |

La comparación más directa es con Qwen/Qwen3.5-4B, del que deriva: el ajuste fino mejora sustancialmente el rendimiento en el dominio específico (29/30 frente a 11/30 en el examen interno para la variante q4b), pero empeora en preguntas fuera de dominio, según reconoce el propio autor.

## Limitaciones y advertencias

- Conoce únicamente la pastelería inventada; no debe usarse para negocios reales sin un nuevo entrenamiento.
- Puede equivocarse; en alergias e intolerancias remite al personal y no constituye consejo médico.
- Al ser un modelo pequeño, rinde peor que el modelo base en preguntas alejadas de su tarea.
- Requiere obligatoriamente el prompt de sistema de entrenamiento y el modo thinking desactivado; de lo contrario, la calidad cae.
- Idioma limitado al italiano; no se declara soporte multilingüe.
- Riesgo de alucinación inherente a modelos de este tamaño, mitigado parcialmente por el ajuste fino y las instrucciones de sistema.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el dominio ficticio y la falta de validación en producción desaconsejan ese uso tal cual.
- Longitud de contexto no especificada; conviene verificarla en el modelo base antes de diseñar flujos multi-turno largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/costruisci-la-tua-ai/aurora-qwen3.5-4b-it-GGUF
- Modelo base ajustado: https://huggingface.co/costruisci-la-tua-ai/aurora-qwen3.5-4b-it
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Libro de referencia: *Costruisci la tua AI* (no se proporciona URL en la información disponible)
