# Lysandra999/Senik-Dense-2B-GGUF

## Resumen

Senik-Dense-2B es un modelo de lenguaje denso de aproximadamente 2.516 millones de parametros (2,5B), publicado por el autor Lysandra999 (atribuido en la model card a Nikolas Perez) como parte de la denominada "Senik AI Family". Se distribuye exclusivamente en formato GGUF para su ejecucion local con llama.cpp, y esta orientado a despliegues en el borde (edge AI), portatiles y dispositivos tipo Jetson. Su propuesta principal es combinar una ventana de contexto larga de 128K tokens con soporte nativo de tool calling en XML y un estilo de dialogo expresivo con etiquetas `[emotion:TAG]`.

El modelo se presenta como la edicion de contexto largo de una familia que incluye variantes mas pequenas (0,3B, 0,8B, 1,7B) y modelos de voz. La model card hace enfasis en una identidad de personaje "bloqueada" (Senik) y en pruebas de anti-override, lo que sugiere un ajuste fino orientado a mantener un rol conversacional concreto. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Es relevante ahora por su combinacion poco habitual en este rango de tamano: 128K de contexto en un modelo de 2,5B cuantizado a 1,5 GB (Q4_K_M), lo que lo hace candidato para tareas de recuperacion en documentos largos y agentes locales sin dependencia de la nube. No obstante, la informacion publica es escasa y los benchmarks proceden unicamente de la propia model card, con conjuntos de prueba pequenos y no estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de capas y atencion no disponibles) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (segun model card) |
| Tipos de cuantizacion | Q4_K_M (1.488,99 MiB), Q8_0 (2.555,57 MiB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se distribuyen safetensors en el repo |

## Arquitectura y entrenamiento

La model card describe el modelo como "dense" dentro de la familia Senik, sin detallar el numero de capas, dimensiones ocultas, tipo de atencion ni mecanismo de extension de contexto empleado para alcanzar los 128K tokens. No se especifica si usa RoPE escalado, atencion lineal o alguna variante hibrida. Tampoco se publican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

Lo unico documentado sobre el proceso es el resultado de un ajuste orientado a comportamiento: identidad y "lore" del personaje Senik, resistencia a la sobrescritura de persona (anti-override), tool calling en XML con abstención y un formato de dialogo con etiquetas de emocion. La model card menciona pruebas con ejecucion real de Python mediante `exec()` y una sonda de needle-in-a-haystack de 8K tokens, pero no aporta detalles sobre la metodologia de entrenamiento ni sobre el modelo base del que deriva.

## Capacidades

- Generacion de texto conversacional en ingles con formato de dialogo expresivo mediante etiquetas `[emotion:TAG]`.
- Razonamiento de contexto largo: ventana declarada de 128K tokens, adecuada para recuperacion de informacion en documentos extensos.
- Tool calling nativo en XML, con comportamiento de abstención cuando la herramienta no es aplicable (segun la model card).
- Generacion y ejecucion de codigo Python en pruebas de evaluacion (la model card reporta grading con `exec()` real).
- Aritmetica y razonamiento matematico basico, evaluado en el conjunto de sondas del autor.
- Mantenimiento de persona e identidad consistente (Senik) y resistencia a instrucciones que intentan sobrescribirla.
- Ejecucion 100% local sin dependencias de nube, compatible con llama.cpp y endpoints compatibles.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.

## Casos de uso

- Asistente conversacional local con personalidad fija: el ajuste de identidad y anti-override permite desplegar un bot con rol estable en portatiles o dispositivos de borde, sin que el usuario pueda desviarlo facilmente de su persona mediante prompt injection.
- Recuperacion en documentos largos: con 128K de contexto y la variante Q8_0 (2,5 GB) se pueden pasar contratos, manuales o transcripciones extensas y hacer preguntas sobre ellos en local, sin enviar datos a terceros.
- Agente local con tool calling: el soporte nativo de XML y la abstención permiten integrarlo en flujos donde el modelo decide cuando invocar una funcion (consulta a API, lectura de fichero) y cuando responder directamente.
- Automatizacion de codigo en entornos con Python: las pruebas de `exec()` sugieren uso en tareas de generacion y validacion de scripts pequenos dentro de pipelines locales de CI o notebooks.
- Despliegue en hardware embebido: la variante Q4_K_M (1,49 GB) esta pensada para Jetson, Raspberry Pi de gama alta o mini-PC, habilitando asistentes offline en entornos sin conectividad.
- Prototipado rapido de chatbots con emociones: las etiquetas `[emotion:TAG]` permiten mapear la salida a estados de animo en interfaces de voz o avatares sin post-procesado complejo.
- Filtrado y clasificacion de texto largo en local: con contexto de 128K se pueden clasificar o resumir lotes de documentos en una sola pasada, reduciendo la fragmentacion.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor, con 31 sondas propias (no benchmarks estandar). Se reproducen a continuacion tal cual, sin verificacion independiente:

| Suite (n.º de sondas) | Baseline 2B sin ajustar | Senik-Quantum-1.7B | Senik-Dense-2B (sin system) | Senik-Dense-2B (con system) |
|---|---|---|---|---|
| Identidad y lore Senik (10) | 2/10 | 3/10 | 10/10 | 10/10 |
| Anti-override y bloqueo de persona (6) | 1/6 | 5/6 | 5/6 | 4/6 |
| Matematicas, Python `exec()` y needle 8K (10) | 5/10 | 9/10 | 10/10 | 10/10 |
| Tool calling XML y abstención (5) | 4/5 | 3/5 | 5/5 | 5/5 |
| Total (31 sondas) | 12/31 (38,7%) | 20/31 (64,5%) | 30/31 (96,8%) | 29/31 (93,5%) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores proceden de un conjunto de pruebas disenado por el propio autor, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M y 2,6-3,2 GB con Q8_0, incluyendo overhead de contexto (el contexto completo de 128K incrementa notablemente el consumo de KV cache).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); en el ambito profesional, A100 y H100 funcionan pero estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU discretas modernas con 4 GB o mas; tambien en iGPU con memoria unificada suficiente.
- Despliegue: llama.cpp (formato nativo), Ollama, LM Studio, servidores compatibles con endpoints de tipo OpenAI; tambien es posible usar vLLM o TGI si se convierte el GGUF, aunque el repo solo distribuye GGUF.
- Latencia y throughput: no disponibles. La model card menciona ejecucion en Jetson Orin Nano para el modelo hermano de 1,7B, pero no aporta cifras de tokens por segundo para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Senik-Dense-2B | ~2,5B | 128K | Apache 2.0 | GGUF | Ajustado a persona y tool calling XML; benchmarks solo del autor |
| Qwen2.5-1.5B / 3B | 1,5B / 3B | 32K (128K en variantes) | Apache 2.0 | safetensors, GGUF | Familia ampliamente evaluada, multilingue |
| Llama 3.2 1B / 3B | 1B / 3B | 128K | Llama 3.2 Community | safetensors, GGUF | Buen soporte de tool calling, multilingue |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms | safetensors, GGUF | Contexto corto, requiere aceptacion de terminos |

Los modelos comparables citados son referencias de la misma categoria por tamano; no se dispone de comparaciones directas publicadas entre Senik-Dense-2B y ellos en benchmarks estandar.

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente del autor, con 31 sondas propias y sin evaluacion independiente; no son comparables con MMLU, HumanEval o GSM8K.
- Solo soporta ingles segun los metadatos; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- El ajuste de persona e identidad puede introducir sesgos hacia el rol "Senik" y reducir la neutralidad en usos genericos.
- Riesgo de alucinacion inherente a un modelo de 2,5B, especialmente en contextos largos donde la atencion se diluye.
- La ventana de 128K debe validarse empiricamente: no se documenta el metodo de extension de contexto ni pruebas mas alla de un needle de 8K.
- El repo solo distribuye GGUF (Q4_K_M y Q8_0); no hay safetensors ni pesos completos para reentrenamiento o ajuste fino.
- Trazabilidad limitada: autor con pocas descargas (83) y sin likes, sin paper ni documentacion tecnica detallada; conviene tratar las afirmaciones de la model card con escepticismo.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la falta de documentacion sobre datos de entrenamiento impide verificar el cumplimiento de derechos de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lysandra999/Senik-Dense-2B-GGUF
- Modelo hermano Senik-Quantum-1.7B: https://huggingface.co/Lysandra999/Senik-Quantum-1.7B-GGUF
- Modelo hermano Mini-Senik-0.8B-Agent: https://huggingface.co/Lysandra999/Mini-Senik-0.8B-Agent-GGUF
- Modelo hermano Mini-Senik-0.3B: https://huggingface.co/Lysandra999/Mini-Senik-0.3B-GGUF
- Modelo hermano Watch-Senik-0.3B-Dec: https://huggingface.co/Lysandra999/Watch-Senik-0.3B-Dec
- Modelo de voz Senik-Voice-82M: https://huggingface.co/Lysandra999/Senik-Voice-82M
- Modelo de voz Senik-Voice-Expressive-0.5B: https://huggingface.co/Lysandra999/Senik-Voice-Expressive-0.5B
- Modelo de reconocimiento Senik-Wake-STT-Small: https://huggingface.co/Lysandra999/Senik-Wake-STT-Small
- Paper, blog o demo oficial: no disponible.
