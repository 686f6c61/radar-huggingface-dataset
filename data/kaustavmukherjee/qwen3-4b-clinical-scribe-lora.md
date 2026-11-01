# KaustavMukherjee/qwen3-4b-clinical-scribe-lora

## Resumen

Qwen3-4B clinical scribe LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario KaustavMukherjee sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su proposito es convertir instrucciones en formato de "scribe prompt" (un mensaje de usuario que contiene el contexto completo de una consulta clinica) en una nota clinica estructurada. El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen3-4B-Instruct-2507 y aplicar los pesos LoRA encima.

El modelo base Qwen3-4B-Instruct-2507 pertenece a la familia Qwen3 de Alibaba, con arquitectura transformer densa de aproximadamente 4.000 millones de parametros y una ventana de contexto nativa de 262.144 tokens (aunque el ejemplo de la model card limita `max_model_len` a 40.000). El adaptador se distribuye en formato safetensors con la libreria PEFT y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluacion publicados. Resulta util como referencia para quienes quieran desplegar un asistente de documentacion clinica sobre un modelo pequeno, pero no debe considerarse un modelo validado clinicamente ni listo para produccion sanitaria sin evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer denso (modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base ronda los 4.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base soporta hasta 262.144 tokens, y el ejemplo de la model card usa `max_model_len=40000` |
| Tipos de cuantizacion | No disponible en la model card; el ejemplo usa `dtype="bfloat16"` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango maximo 64 (segun el ejemplo de despliegue con `max_lora_rank=64`) aplicado sobre Qwen3-4B-Instruct-2507, un transformer denso decoder-only de la familia Qwen3. No se especifica en la model card que modulos del transformer se adaptan (attention, MLP o ambos), ni el rango efectivo, ni el alpha utilizado.

No hay informacion publicada sobre el dataset de entrenamiento: no se indica el numero de ejemplos, la procedencia de las transcripciones clinicas, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documenta el proceso de curacion de datos ni las salvaguardas aplicadas para evitar la memorizacion de informacion de pacientes. La unica informacion funcional es la interfaz: entrada como mensaje de usuario con un "scribe prompt" completo y salida como nota clinica.

## Capacidades

- Generacion de notas clinicas a partir de un prompt de tipo scribe que contiene el contexto de la consulta.
- Generacion de texto conversacional heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y comprension de instrucciones largas, apoyandose en la ventana de contexto del modelo base.
- Soporte de tool calling y function calling: no documentado para el adaptador (el modelo base Qwen3-Instruct lo soporta, pero no hay confirmacion de que el adaptador lo preserve).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas del adaptador figuran como no disponibles.
- Modo thinking, vision o audio: no documentados para el adaptador.

## Casos de uso

- Documentacion de consultas ambulatorias: el adaptador recibe el prompt de scribe con el dialogo medico-paciente y devuelve una nota clinica estructurada; encaja en flujos donde el medico revisa y firma el borrador antes de incorporarlo a la historia clinica electronica.
- Prototipado de asistentes de dictado clinico: al ser un LoRA de 0,5 GB sobre un modelo de 4B, permite iterar rapidamente en entornos de investigacion con una sola GPU consumer y comparar variantes del prompt sin reentrenar el modelo base.
- Investigacion en NLP clinico: sirve como punto de partida para estudiar la calidad de notas generadas por modelos pequenos frente a modelos mayores, siempre con datos desidentificados y aprobacion etica.
- Despliegue multi-adaptador con vLLM: el ejemplo oficial usa `LoRARequest` y `enable_lora=True`, de modo que un mismo servidor puede atender el adaptador de scribe junto con otros adaptadores sobre el mismo modelo base, reduciendo coste de infraestructura.
- Generacion de resumenes de alta hospitalaria: con prompts que incluyan el historial de ingresos y evolucion, el adaptador puede producir un borrador de informe de alta sujeto a revision facultativa.
- Educacion y simulacion clinica: en entornos docentes con casos sinteticos, permite generar notas de ejemplo para entrenar a residentes en redaccion clinica sin exponer datos reales.
- Integracion en pipelines de documentacion con contexto largo: gracias a la ventana del modelo base (hasta 262.144 tokens, aunque la model card limita el ejemplo a 40.000), puede procesar transcripciones extensas de una consulta completa en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa aproximadamente 0,5 GB; el modelo base de 4B en bfloat16 requiere del orden de 8-9 GB de VRAM solo para pesos, mas cache KV. Con cuantizacion de 4 bits del modelo base, la huella puede bajar a unos 3-4 GB, aunque la model card no documenta cuantizaciones del adaptador.
- GPU recomendadas: para bfloat16 sin cuantizar, una RTX 4090 (24 GB) o A100/H100 ofrecen margen comodo; una RTX 3090 o 4080 (16 GB) tambien deberia ser suficiente para contextos moderados.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas si se cuantiza el modelo base; con bfloat16 se recomienda 16 GB o mas para contextos largos.
- Opciones de despliegue: vLLM con `enable_lora=True` y `LoRARequest` (metodo documentado en la model card); PEFT con Transformers para inferencia simple; el soporte en llama.cpp, Ollama o TGI no esta documentado para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B clinical scribe LoRA (este) | Adaptador sobre 4B | No especificado (base hasta 262.144) | LoRA para notas clinicas | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | 262.144 tokens | Instruccion general | Apache 2.0 | HuggingFace, ampliamente usado |
| Alternativas de scribe clinico de proposito general | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre adaptadores comparables de scribe clinico en la documentacion proporcionada; la comparativa se limita al modelo base.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar Qwen3-4B-Instruct-2507 y aplicar el adaptador; no puede ejecutarse de forma aislada.
- Ausencia total de evaluacion publicada: sin benchmarks, sin metricas de calidad de notas clinicas y sin validacion por clinicos.
- Riesgo elevado de alucinacion en dominio sanitario: un modelo de 4B puede omitir hallazgos, inventar datos o mezclar informacion entre pacientes; toda salida debe ser revisada por un profesional.
- Sin documentacion sobre el dataset de entrenamiento: se desconoce si los datos eran sinteticos, reales o desidentificados, lo que impide evaluar sesgos y riesgos de privacidad.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos del que se uso en el entrenamiento.
- Contexto efectivo incierto: aunque el modelo base soporta 262.144 tokens, el ejemplo de la model card limita a 40.000 y no se documenta como responde el adaptador a contextos muy largos.
- Uso comercial permitido por licencia Apache 2.0, pero no exime de cumplir normativa sanitaria (RGPD, AI Act, regulacion de productos sanitarios) si se emplea con datos de pacientes.
- Cero descargas y cero likes: no hay evidencia de uso en comunidad ni de mantenimiento por parte del autor.
- No debe usarse como dispositivo medico ni como sustituto del juicio clinico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KaustavMukherjee/qwen3-4b-clinical-scribe-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
