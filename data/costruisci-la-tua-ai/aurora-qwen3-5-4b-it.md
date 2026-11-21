# costruisci-la-tua-ai/aurora-qwen3.5-4b-it

## Resumen

Aurora-qwen3.5-4b-it es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-4B desarrollado por el usuario costruisci-la-tua-ai. Se trata de un asistente conversacional especializado en un único dominio: la "Pasticceria Aurora", un negocio ficticio creado como ejemplo didáctico en el libro *Costruisci la tua AI*. El modelo responde en italiano a preguntas sobre horarios, precios, pedidos y conservación de productos de pastelería.

El modelo parte de la arquitectura Qwen3.5 de 4B parámetros (4.205.751.296 parámetros reales según safetensors) y se ha especializado mediante LoRA con rango 16, fusionando posteriormente el adaptador en los pesos finales. No incorpora la fase de "razonamiento" (thinking mode) del modelo base: el autor indica explícitamente que debe desactivarse con `enable_thinking=False` para obtener sus respuestas características.

Su relevancia es fundamentalmente educativa y de demostración: sirve como ejemplo reproducible de cómo especializar un modelo abierto con un conjunto de datos pequeño (390 conversaciones) y recursos modestos (4,7 minutos de entrenamiento en una NVIDIA RTX PRO 4500 Blackwell con un pico de 9,8 GB de VRAM). No está pensado para uso en producción real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible (variante Q4_K_M mencionada); cuantizaciones adicionales no disponibles |
| Idiomas soportados | Italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (repo separado `-GGUF`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base, un transformer de 4B parámetros de la familia Qwen3.5. Sobre esa base se aplicó un ajuste fino supervisado con LoRA (rango 16, 3 épocas, learning rate 0,0002, batch efectivo 16), tras el cual el adaptador se fusionó en los pesos del modelo. El entrenamiento completo duró 4,7 minutos con un pico de 9,8 GB de VRAM en una NVIDIA RTX PRO 4500 Blackwell, alcanzando una loss de validación de 0,3202.

Los datos de entrenamiento consisten en 390 conversaciones (325 de la versión v1.0 más 65 nuevas centradas en corregir errores de la v1.0) generadas con un modelo abierto a partir de una ficha de hechos inventada, filtradas con reglas automáticas y revisadas manualmente. No se menciona el uso de RLHF ni DPO. El autor indica que el modelo fue entrenado con un prompt de sistema fijo y sin la fase de razonamiento del modelo base, por lo que ambos elementos (prompt de sistema y `enable_thinking=False`) son necesarios para reproducir su comportamiento.

## Capacidades

- Generación de texto conversacional en italiano, limitada al dominio de la pastelería ficticia.
- Respuesta a preguntas sobre horarios, precios, pedidos y conservación de dulces.
- Conversación multi-turno con prompt de sistema (rol de asistente de la pastelería).
- Derivación a personal humano ante temas de alergias e intolerancias (comportamiento entrenado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del italiano.
- No dispone de thinking mode activo (se entrena y usa con `enable_thinking=False`).
- Sin capacidades de visión ni audio.

## Casos de uso

- Demostración didáctica de fine-tuning: el modelo sirve para ilustrar en talleres y cursos cómo se especializa un modelo abierto con LoRA y un dataset pequeño, reproduciendo el flujo del libro *Costruisci la tua AI* con resultados verificables (36/36 en el examen de 36 preguntas).
- Base para un asistente de negocio real: partiendo de este modelo, un desarrollador puede reentrenar con los datos reales de su propio comercio (horarios, catálogo, políticas) siguiendo el mismo pipeline LoRA descrito en la model card.
- Pruebas de integración con llama.cpp: el modelo incluye instrucciones para desplegarse con `llama-server` usando la versión GGUF Q4_K_M y `--chat-template-kwargs '{"enable_thinking":false}'`, útil para validar pipelines de inferencia local en hardware de consumo.
- Evaluación de robustez conversacional: los errores conocidos documentados (fechas festivas, terraza fuera de temporada, trato formal/informal) permiten construir conjuntos de pruebas para medir la fiabilidad de asistentes de dominio restringido.
- Ejemplo de control de alucinaciones: el modelo muestra un comportamiento de "no lo sé" ante productos que la pastelería no fabrica (macarons, helados), lo que sirve como caso de estudio sobre cómo entrenar la abstención en lugar de la invención.
- Prototipado de prompts de sistema: permite experimentar con variaciones del prompt de sistema y observar cómo afectan a las respuestas en un dominio cerrado y controlado.

## Benchmarks y rendimiento

El autor solo publica una evaluación propia: un examen de 36 preguntas sobre la pastelería, corregido automáticamente con las reglas del libro (capítulo 37), con resultado de 36/36 para la v1.1 y 31/36 para la v1.0. El propio autor advierte que el corrector automático puede fallar en ambas direcciones.

| Prueba | Preguntas correctas |
|---|---|
| aurora-v1.1 | 36/36 |
| aurora-v1.0 | 31/36 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,2B parámetros, en FP16 requeriría aproximadamente 8,4 GB de pesos; en cuantización Q4_K_M, alrededor de 2,5-3 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizó en una NVIDIA RTX PRO 4500 Blackwell con pico de 9,8 GB.
- Cabe en GPU de consumo: previsiblemente sí en cuantización GGUF Q4_K_M (tarjetas con 6-8 GB de VRAM o más), aunque el autor no lo confirma.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `device_map="auto"`) y llama.cpp (`llama-server -hf ... -GGUF:Q4_K_M`). No se documentan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aurora-qwen3.5-4b-it | 4,2B | no disponible | Apache 2.0 | Hugging Face (transformers + GGUF) | Especializado en dominio ficticio, solo italiano |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Apache 2.0 | Hugging Face | Modelo generalista; soporta thinking mode y multilingüismo |
| Alternativas de 3-4B especializadas en dominio | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación directa con otros fine-tunes de dominio no está disponible en la información proporcionada. La referencia más relevante es el modelo base Qwen3.5-4B, del que Aurora hereda arquitectura y licencia pero del que se diferencia por el ajuste LoRA, la desactivación del thinking mode y la restricción al italiano y al dominio de la pastelería.

## Limitaciones y advertencias

- Conoce únicamente la pastelería inventada: no debe usarse para negocios reales sin un nuevo entrenamiento con datos verdaderos.
- El autor advierte explícitamente que no debe usarse para responder a clientes reales ni para dar información sobre alergias, salud o pagos.
- Errores conocidos documentados: confunde el cierre por vacaciones de agosto con apertura festiva; no sabe que la terraza solo existe de abril a octubre; añade horarios matutinos en festivos que la ficha no contempla; afirma que no hay vacantes de empleo (dato no presente en la ficha); mantiene el trato de usted aunque el usuario tutee; responde "no tengo información" en lugar de "no lo hacemos" ante productos que no se fabrican.
- El corrector automático del examen puede fallar en ambas direcciones, por lo que la puntuación 36/36 debe interpretarse con cautela.
- Solo se ha evaluado en las preguntas de la pastelería; fuera de ese dominio no se ha medido su comportamiento.
- Riesgo de alucinación: el autor indica que la v1.1 ya no inventa información, pero los errores listados muestran que persisten respuestas incorrectas o incompletas.
- Sesgos conocidos: no documentados explícitamente más allá del uso del trato formal no solicitado.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja el uso en producción tal cual está.
- Solo soporta italiano; no se ha validado su comportamiento en otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/costruisci-la-tua-ai/aurora-qwen3.5-4b-it
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio GGUF: `costruisci-la-tua-ai/aurora-qwen3.5-4b-it-GGUF` (referenciado en la model card)
- Libro de referencia: *Costruisci la tua AI* (capítulo 37, sistema de corrección del examen)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
