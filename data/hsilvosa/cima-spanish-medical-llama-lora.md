# hsilvosa/CIMA-Spanish-Medical-Llama-LoRA

## Resumen

CIMA-Spanish-Medical-Llama-LoRA es un adaptador de tipo LoRA (Low-Rank Adaptation) desarrollado por hsilvosa, diseñado para convertir modelos base de lenguaje de pequeño tamaño en asistentes de consulta médica y farmacéutica en español. Se entrena sobre los prospectos de medicamentos y fichas técnicas del sistema CIMA de la Agencia Española de Medicamentos y Productos Sanitarios (AEMPS), junto con el dataset OpenPlacSP. El adaptador se puede cargar sobre dos modelos base: `meta-llama/Llama-3.2-3B-Instruct` o `microsoft/Phi-3.5-mini-instruct`, ambos de 3 mil millones de parámetros, lo que permite su ejecución en hardware de consumo.

El modelo está orientado a responder preguntas sobre principios activos, vías de administración, efectos secundarios, contraindicaciones y advertencias de excipientes, siempre anclado en los datos oficiales de la AEMPS. Su relevancia radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para entornos sanitarios de habla hispana, donde los modelos médicos comerciales son escasos o propietarios. Al ser un adaptador LoRA, no requiere reentrenar el modelo base completo, lo que reduce significativamente los costes de cómputo y almacenamiento.

La publicación actual data de agosto de 2026 y no se han registrado descargas ni valoraciones en HuggingFace, lo que sugiere que se trata de un proyecto reciente o en fase de validación. A pesar de su limitada difusión, la metodología de ajuste con datos oficiales y su tamaño compacto lo convierten en una opción interesante para prototipos de información farmacéutica en español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer causal (base: Llama-3.2-3B-Instruct o Phi-3.5-mini-instruct) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros, del orden de millones, sobre el modelo base de 3B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base; Llama-3.2-3B-Instruct soporta hasta 128k tokens, pero no se confirma en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador puede combinarse con cuantizaciones del modelo base, p.ej. 4-bit, 8-bit, pero no se especifica) |
| Idiomas soportados | Español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors, pero no se indica explícitamente) |

## Arquitectura y entrenamiento

El adaptador se construye mediante fine-tuning con LoRA y QLoRA sobre un modelo base de 3B parámetros. La arquitectura del modelo base es transformer causal con decodificación autoregresiva; tanto Llama-3.2 como Phi-3.5-mini son modelos densos sin mezcla de expertos. El adaptador LoRA introduce matrices de baja dimensión en las capas de atención y feed-forward, lo que permite ajustar el modelo con un número reducido de parámetros entrenables y un consumo de memoria moderado.

Los datos de entrenamiento provienen de dos fuentes: `hsilvosa/aemps-cima`, un snapshot del sistema CIMA de la AEMPS con prospectos y fichas técnicas, y `hsilvosa/openplacsp`, que contiene información farmacéutica estructurada. No se especifica el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El entrenamiento se realiza mediante instrucciones en español, con un formato de prompt que incluye un system prompt de asistente médico farmacéutico. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en español orientada a consultas farmacéuticas y médicas.
- Respuesta a preguntas sobre principios activos, composición de medicamentos, vías de administración, posología, efectos secundarios, contraindicaciones y advertencias de excipientes.
- Actúa como asistente de QA anclado en datos oficiales de la AEMPS (prospectos y fichas técnicas).
- Soporta conversación multi-turno mediante el formato de chat del modelo base (por ejemplo, tokens `<|system|>`, `<|user|>`, `<|assistant|>` en Llama-3.2).
- Capacidad multilingüe limitada al español, aunque el modelo base subyacente puede tener otras lenguas, el adaptador está especializado en español.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Consulta rápida de prospectos de medicamentos: un usuario puede preguntar "¿Cuáles son los efectos secundarios de ibuprofeno?" y el modelo devuelve información extraída de la ficha técnica oficial, reduciendo la necesidad de buscar en PDFs largos.
- Soporte en oficinas de farmacia: el farmacéutico puede usar el modelo como herramienta de referencia para verificar interacciones, contraindicaciones o excipientes de un medicamento concreto, ahorrando tiempo en consultas frecuentes.
- Educación sanitaria para pacientes: integrar el modelo en un chatbot de un portal de salud para responder preguntas frecuentes sobre medicamentos de forma comprensible y en español.
- Validación de textos farmacéuticos: los redactores de prospectos pueden contrastar sus borradores con las respuestas del modelo para detectar omisiones o errores en secciones como posología o advertencias.
- Desarrollo de aplicaciones móviles de información de medicamentos: el adaptador, al ser ligero, puede ejecutarse en dispositivos con 8 GB de RAM o menos, permitiendo apps offline de consulta farmacéutica.
- Investigación en procesamiento de lenguaje natural médico: como modelo de referencia para evaluar sistemas de QA en el dominio farmacéutico español, dado su anclaje en datos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de QA médica en español para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo base de 3B parámetros, la VRAM necesaria para inferencia depende del modelo base y su cuantización. Con cuantización de 4 bits, un modelo de 3B puede caber en una GPU con 6-8 GB de VRAM; en 8 bits, se recomienda al menos 10 GB.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), o GPUs de datacenter como A10G o A100 si se requiere mayor throughput.
- Es viable en GPUs de consumo, especialmente con cuantización 4-bit y usando bibliotecas como `bitsandbytes`.
- Opciones de despliegue: el adaptador se carga con `peft` y `transformers`, por lo que puede servirse con vLLM, TGI (Text Generation Inference) o llama.cpp si se convierte a GGUF. También se puede usar en entornos de notebook o scripts Python.
- Latencia y throughput estimados: no disponibles. Para un modelo de 3B en una GPU moderna, se espera una generación de 20-50 tokens por segundo en cuantización 4-bit, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para QA médica en español con adaptadores LoRA sobre modelos de 3B. Se podría comparar con el modelo base sin adaptar (Llama-3.2-3B-Instruct o Phi-3.5-mini-instruct) en tareas genéricas, pero no hay benchmarks del adaptador. Tampoco se conocen otros adaptadores LoRA públicos entrenados con datos de AEMPS CIMA. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es un adaptador de pequeño tamaño (3B base) y puede generar respuestas incorrectas o incompletas, especialmente en casos complejos o poco frecuentes.
- No ha sido evaluado formalmente en cuanto a sesgos, alucinaciones o precisión clínica. No debe utilizarse como sustituto del consejo médico profesional.
- Los datos de entrenamiento provienen de fuentes oficiales, pero pueden contener errores o estar desactualizados respecto a la última versión de los prospectos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base (Llama-3.2 o Phi-3.5) tiene sus propias licencias (Llama Community License o MIT respectivamente), que deben verificarse para cada caso.
- No se especifica la longitud de contexto efectiva tras el fine-tuning; puede ser inferior a la del modelo base si el entrenamiento recorta secuencias.
- El modelo solo cubre información farmacéutica en español; no soporta otros idiomas ni dominios médicos generales.
- Al ser un adaptador LoRA, requiere cargar el modelo base completo, lo que implica un coste de descarga y memoria adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hsilvosa/CIMA-Spanish-Medical-Llama-LoRA
- Dataset AEMPS CIMA: https://huggingface.co/datasets/hsilvosa/aemps-cima
- Dataset OpenPlacSP: no se proporciona URL directa, pero se referencia como `hsilvosa/openplacsp` en HuggingFace.
- Buscador CIMA de la AEMPS (fuente de datos): https://cima.aemps.es/cima/publico/buscadoravanzado.html
