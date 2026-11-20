# DevTheusP/qwen2.5-0.5b-fact-extractor-ptbr

## Resumen

El modelo `DevTheusP/qwen2.5-0.5b-fact-extractor-ptbr` es un ajuste fino por destilación del modelo base Qwen2.5-0.5B-Instruct, desarrollado por el usuario DevTheusP. Su propósito es muy concreto: actuar como extractor de hechos duraderos (memoria a largo plazo) para agentes de código en portugués de Brasil. Recibe un mensaje dirigido a un asistente y una lista de claves de memoria existentes, y devuelve un JSON con los hechos que seguirán siendo válidos en las próximas semanas, cada uno asociado a una `subject_key` estable con formato `area.atributo`.

La relevancia del modelo reside en su especialización extrema y su bajo coste computacional: con solo 494 millones de parámetros, es capaz de generar salidas JSON estructuradas y reutilizar claves existentes para permitir la sustitución de hechos antiguos en la memoria del agente. Está diseñado específicamente para la política `v2_keyed` del benchmark agent-memory-bench, y se distribuye con pesos en safetensors, adaptador LoRA y cuantización GGUF q4_K_M, lo que facilita su despliegue tanto en transformers como en Ollama o llama.cpp.

El modelo se entrenó mediante destilación de etiquetas desde Qwen2.5-7B-Instruct (profesor) hacia Qwen2.5-0.5B-Instruct (alumno) usando LoRA, con 3.000 mensajes sintéticos en portugués de Brasil. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct, no confirmada) |
| Tipos de cuantizacion | GGUF q4_K_M incluido en el repositorio; el modelo base admite cuantizaciones adicionales no documentadas |
| Idiomas soportados | Portugues de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo merged fp16), adaptador LoRA en `adapter/`, GGUF q4_K_M en `gguf/` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 494 millones de parámetros, obtenido por ajuste fino del modelo Qwen2.5-0.5B-Instruct. La innovación principal no está en la arquitectura, sino en el proceso de destilación: se generaron 3.000 mensajes sintéticos en portugués de Brasil mediante plantillas con semilla fija, y se etiquetaron con Qwen2.5-7B-Instruct-AWQ usando vLLM con salida guiada por esquema JSON y temperatura 0. El alumno se entrenó con SFT sobre las respuestas del profesor, aplicando LoRA con r=16, alpha=32 en todas las proyecciones lineales, durante 2 épocas, con learning rate 2e-4, scheduler coseno, batch efectivo de 16, precisión fp16 y cálculo de pérdida únicamente sobre la respuesta. Se utilizaron las librerías TRL 1.17, PEFT 0.21 y transformers 5.22, y el entrenamiento se ejecutó en una única NVIDIA T4 (Kaggle).

El modelo está diseñado para funcionar con un prompt de sistema fijo (incluido en el repositorio como `system_prompt.txt`) y un formato de mensaje de usuario con las secciones `Chaves existentes:` y `Mensagem:`. La salida es un JSON con una lista de hechos, cada uno con `subject_key`, `value`, `kind` y otros campos. La reutilización de claves existentes es una capacidad aprendida explícitamente durante el entrenamiento, y es lo que permite a la memoria del agente reemplazar hechos obsoletos en lugar de acumular duplicados.

## Capacidades

- Extracción de hechos duraderos a partir de mensajes conversacionales en portugués de Brasil, devolviendo JSON estructurado.
- Generación de salidas JSON válidas y conformes a esquema, con una tasa de validez del 99,7% en modo libre y del 100% en modo guiado.
- Reutilización de claves de memoria existentes (`subject_key` en formato `area.atributo`), con una precisión de reutilización del 75% en modo guiado y del 53,1% en modo libre.
- Clasificación del tipo de hecho (`kind`), con una precisión del 75% en modo guiado y del 61,5% en modo libre.
- Detección de mensajes sin hechos duraderos (salida vacía), con una precisión del 98,3% en modo guiado y del 80% en modo libre.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo está diseñado como componente de memoria de un agente, no como agente autónomo.
- Capacidades multilingües: solo portugués de Brasil según la model card.
- Capacidades especiales: destilación de un profesor de 7B, salida guiada por JSON Schema, integración con Ollama mediante `format` y con vLLM mediante `response_format`.

## Casos de uso

- Memoria a largo plazo de asistentes de código: el modelo se integra en el pipeline de memoria de un agente para extraer decisiones de configuración, convenciones y reglas a partir de las interacciones. Su capacidad para reutilizar `subject_key` existentes permite que la memoria sustituya hechos antiguos en lugar de acumular duplicados, lo que es crítico en sesiones largas con muchas decisiones técnicas.
- Gestión de decisiones de arquitectura en equipos de desarrollo: cuando un desarrollador comunica un cambio como "sai MySQL, entra PostgreSQL", el modelo devuelve un hecho con la clave `billing.database_engine` y el valor actualizado, lo que permite mantener un registro vivo de decisiones sin intervención manual.
- Extracción de convenciones de proyecto: a partir de mensajes sobre estilo de código, estructura de carpetas o políticas de revisión, el modelo genera hechos con claves como `project.code_style` o `repo.branch_policy`, que luego alimentan las instrucciones del asistente en futuras sesiones.
- Automatización de la memoria en agentes conversacionales de soporte técnico: el modelo puede procesar cada mensaje de un ticket y extraer hechos duraderos sobre la configuración del cliente, evitando que el agente repita preguntas ya respondidas en interacciones anteriores.
- Despliegue en entornos con recursos limitados: con 494 millones de parámetros y una cuantización GGUF q4_K_M incluida, el modelo puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace adecuado para integrarse en herramientas de desarrollo locales o en pipelines de CI/CD sin infraestructura dedicada.
- Filtrado de ruido en la memoria de agentes: el modelo distingue entre hechos duraderos y mensajes efímeros, con una tasa de falsos vacíos del 27,3% en modo guiado y del 13,3% en modo libre, lo que permite descartar información irrelevante antes de almacenarla y reducir el crecimiento descontrolado de la memoria.
- Evaluación y benchmarking de sistemas de memoria: el modelo se ha validado contra el benchmark agent-memory-bench y puede utilizarse como extractor de referencia para comparar políticas de memoria (`v1_naive`, `v2_keyed`, etc.) en experimentos de investigación.

## Benchmarks y rendimiento

Los resultados publicados en la model card se midieron en un notebook de Kaggle, usando como referencia las etiquetas del profesor (Qwen2.5-7B-Instruct).

| modelo | conjunto | modo | schema_valid | strict_f1 | value_f1 | reuse_accuracy | kind_accuracy | empty_accuracy | false_empty_rate | latency_p50_s | tokens_per_s |
|---|---|---|---|---|---|---|---|---|---|---|---|
| alumno-base | test_bench (ref=profesor) | guided | 100,0% | 1,7% | 7,5% | 100,0% | 11,1% | 0,0% | 0,0% | 0,72 | 159,16 |
| alumno-destilado | test_bench (ref=profesor) | guided | 100,0% | 28,6% | 76,2% | 75,0% | 75,0% | 98,3% | 27,3% | 0,06 | 118,62 |
| profesor | test_bench (ref=profesor) | guided | 100,0% | 90,9% | 100,0% | 100,0% | 100,0% | 100,0% | 0,0% | 0,26 | 35,69 |
| alumno-base | test_synth (ref=profesor) | free | 0,0% | - | - | 0,0% | - | 0,0% | 0,0% | 0,30 | 157,37 |
| alumno-destilado | test_synth (ref=profesor) | free | 99,7% | 25,9% | 61,9% | 53,1% | 61,5% | 80,0% | 13,3% | 0,28 | 150,97 |
| profesor | test_synth (ref=profesor) | free | 0,0% | - | - | 0,0% | - | 0,0% | 0,0% | 1,30 | 37,52 |

Resultados en agent-memory-bench, capa 1 (recuperación):

| extractor | memoria | retrieval | ret_update | ret_scope | ret_rare_fact | ret_injection | fallos de JSON |
|---|---|---|---|---|---|---|---|
| alumno-base | v1_naive | 62,0% | 100,0% | 100,0% | 33,7% | 0,0% | 58 |
| alumno-base | v2_keyed | 83,3% | 100,0% | 100,0% | 33,1% | 100,0% | 58 |
| alumno-base | v3_decay_rank | 53,4% | 99,4% | 12,8% | 1,5% | 100,0% | 58 |
| alumno-base | v4_decay_tier | 53,1% | 100,0% | 8,6% | 3,8% | 100,0% | 58 |
| alumno-base | v5_guarded | 97,6% | 99,0% | 100,0% | 91,4% | 100,0% | 58 |
| alumno-destilado | v1_naive | 62,0% | 100,0% | 100,0% | 33,7% | 0,0% | 0 |
| alumno-destilado | v2_keyed | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |
| alumno-destilado | v3_decay_rank | 71,7% | 96,4% | 54,4% | 36,6% | 100,0% | 0 |
| alumno-destilado | v4_decay_tier | 69,4% | 100,0% | 37,5% | 40,0% | 100,0% | 0 |
| alumno-destilado | v5_guarded | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |
| profesor | v1_naive | 62,0% | 100,0% | 100,0% | 33,7% | 0,0% | 0 |
| profesor | v2_keyed | 83,4% | 100,0% | 100,0% | 33,7% | 100,0% | 0 |
| profesor | v3_decay_rank | 54,7% | 97,5% | 14,1% | 7,4% | 100,0% | 0 |
| profesor | v4_decay_tier | 55,2% | 100,0% | 8,6% | 12,1% | 100,0% | 0 |
| profesor | v5_guarded | 97,9% | 100,0% | 100,0% | 91,4% | 100,0% | 0 |
| publicado (Ollama, qwen2.5:7b) | v2_keyed | 98% | no disponible | no disponible | no disponible | no disponible | no disponible |
| publicado (Ollama, qwen2.5:7b) | v1_naive | 62% | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card explica que la diferencia en `v2_keyed` entre alumno (100%) y profesor (83,4%) se debe íntegramente a la columna `ret_rare_fact`; el texto proporcionado se interrumpe en ese punto, por lo que no se dispone de la explicación completa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp16 ocupa aproximadamente 1 GB (494 millones de parámetros × 2 bytes). Con cuantización GGUF q4_K_M, el peso se reduce a aproximadamente 300-400 MB, aunque el consumo real depende de la longitud de contexto y del backend.
- GPU recomendadas: el modelo se entrenó en una NVIDIA T4 (16 GB), pero por tamaño puede ejecutarse en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM para fp16 y menos de 1 GB para q4_K_M.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), vLLM (con `response_format` para salida guiada), Ollama (mediante el `Modelfile` incluido en `gguf/`), llama.cpp (con el GGUF q4_K_M), y text-generation-inference (etiqueta `text-generation-inference` presente en el repositorio).
- Latencia y throughput estimados: según la model card, en modo guiado el alumno destilado alcanza una latencia p50 de 0,06 s y 118,62 tokens/s; en modo libre, 0,28 s y 150,97 tokens/s. El profesor (7B) alcanza 0,26 s y 35,69 tokens/s en modo guiado. Estas cifras se midieron en el entorno del notebook de Kaggle (T4) y pueden variar según el hardware y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| DevTheusP/qwen2.5-0.5b-fact-extractor-ptbr | 494 M | no disponible | Apache 2.0 | pt | Extracción de hechos JSON para memoria de agentes | Hugging Face, GGUF, LoRA |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible en la información proporcionada | Apache 2.0 | multilingüe | Modelo generalista de instrucciones | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B (aproximado, no confirmado en la información) | no disponible en la información proporcionada | Apache 2.0 | multilingüe | Modelo generalista de instrucciones, profesor en la destilación | Hugging Face |
| qwen2.5:7b (Ollama) | 7 B (aproximado) | no disponible | Apache 2.0 | multilingüe | Modelo generalista usado como referencia publicada en el benchmark | Ollama |

La comparación directa con alternativas especializadas en extracción de hechos para memoria de agentes no está disponible en la información proporcionada. El modelo se posiciona frente a su profesor (7B) con una ventaja clara en latencia (0,06 s frente a 0,26 s en modo guiado) y en throughput (118,62 frente a 35,69 tokens/s), a costa de un `strict_f1` menor (28,6% frente a 90,9%) y un `value_f1` menor (76,2% frente a 100%). Frente al alumno base sin destilar, la mejora es sustancial en todas las métricas de calidad y en la tasa de fallos de JSON (0 frente a 58).

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para portugués de Brasil; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- La tasa de falsos vacíos es del 27,3% en modo guiado y del 13,3% en modo libre, lo que significa que en una parte significativa de los casos el modelo no extrae hechos que sí existen en el mensaje.
- El `strict_f1` es bajo (28,6% en modo guiado, 25,9% en modo libre) en comparación con el profesor (90,9%), lo que indica que la estructura exacta de los hechos extraídos no siempre coincide con la referencia.
- La precisión de reutilización de claves es del 75% en modo guiado y del 53,1% en modo libre, por lo que en una cuarta parte de los casos puede generar claves nuevas en lugar de reutilizar las existentes, lo que degrada la sustitución de hechos en la memoria.
- El modelo depende de un prompt de sistema fijo y de un formato de usuario concreto (`Chaves existentes:` / `Mensagem:`); su uso fuera de ese formato no está garantizado.
- No se han publicado datos sobre sesgos, alucinaciones en dominios específicos ni comportamiento fuera del benchmark agent-memory-bench.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento documentado.
- El repositorio tiene 2,9 GB, lo que incluye el modelo merged en fp16, el adaptador LoRA y el GGUF; el tamaño del modelo en sí es mucho menor, pero conviene seleccionar solo los artefactos necesarios.
- La fecha de creación del repositorio (2026-10-30) es posterior a la fecha actual, lo que puede indicar un error en los metadatos o una fecha de publicación programada; conviene verificarlo antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevTheusP/qwen2.5-0.5b-fact-extractor-ptbr
- Repositorio del proyecto fact-extractor-distill: https://github.com/DevTheusP/fact-extractor-distill
- Benchmark agent-memory-bench: https://github.com/DevTheusP/agent-memory-bench
- Dataset de destilación: https://huggingface.co/datasets/DevTheusP/fact-extractor-distill-ptbr
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
