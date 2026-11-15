# gutoportelaa/qwen2.5-1.5b-segjusticidadania-destilado-d1-local

## Resumen

El modelo `qwen2.5-1.5b-segjusticidadania-destilado-d1-local` es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct desarrollado por el usuario gutoportelaa en el marco de un trabajo de fin de asignatura de Procesamiento de Lenguaje Natural (UFPI, 2026.2). Su propósito es responder preguntas sobre producción científica brasileña en seguridad pública, justicia y ciudadanía a partir de fragmentos de texto recuperados, citando el fragmento utilizado y rechazando responder cuando la información no está contenida en dichos fragmentos. Se trata de un experimento de destilación de conocimiento en caja negra: el alumno (Qwen2.5-1.5B-Instruct) aprende únicamente del texto generado por el profesor (Qwen2.5-7B-Instruct), sin acceso a la distribución de probabilidad del profesor.

El modelo es el denominado «D1 controlado» de la cuestión 4 del trabajo, retrenado en el mismo servidor, con el mismo código, semilla, pares y configuración que su variante D2 (caja blanca), de modo que ambos difieren únicamente en el término KL. El adaptador resultante tiene un tamaño de repositorio de 0,1 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico de adaptación de un modelo pequeño a una tarea de generación aumentada por recuperación (RAG) con citación obligatoria; por otro, ofrece datos empíricos honestos sobre los límites de la destilación en caja negra, mostrando que el alumno adquiere el formato de citación pero no transfiere conocimiento factual en la mitad del benchmark sin contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parámetros totales | 1,5 mil millones (modelo base) + adaptador LoRA (r=16, α=32) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32 768 tokens según su documentación oficial, no confirmado en esta ficha) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar de la familia Qwen2.5) |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parámetros. Sobre él se aplica un adaptador LoRA con r=16, α=32, dropout 0,05, en las proyecciones q, k, v, o, gate, up y down. El entrenamiento emplea una tasa de aprendizaje de 2·10⁻⁴ con calentamiento del 3 % y decaimiento coseno, durante 2 épocas (302 pasos) con un lote efectivo de 16, y la pérdida se calcula únicamente sobre los tokens de la respuesta. El entrenamiento completo se realizó en unos 90 minutos sobre una RTX 3080.

La destilación es en caja negra: el alumno aprende solo el texto generado por el profesor (Qwen2.5-7B-Instruct), con entropía cruzada sobre los tokens de la respuesta, sin acceso a la distribución del profesor. Los datos de entrenamiento consisten en 2 705 pares `instruction`/`input`/`output` generados por el profesor a partir del corpus `segjusticidadania-curated`: 1 844 preguntas ancoradas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos y 261 resúmenes. La validación usa el 10 % de los documentos, separados por documento (283 pares), y ningún documento de origen de ítem del benchmark entra en los pares de entrenamiento. El texto de los pares proviene del profesor cuantizado en 4 bits.

## Capacidades

- Generación de texto en portugués orientada a preguntas sobre seguridad pública, justicia y ciudadanía.
- Respuesta ancorada en fragmentos: cita entre corchetes el número del fragmento utilizado (`[k]`).
- Rechazo explícito cuando la respuesta no está en los fragmentos proporcionados (respuesta exacta «Não encontrado nos documentos.»).
- Formato de conversación mediante `apply_chat_template` con roles system/user.
- Capacidad de resumen de documentos del dominio (261 pares de resumen en el entrenamiento).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al portugués según la model card; no se documenta transferencia a otros idiomas.

## Casos de uso

- Asistente RAG para consultas sobre producción científica brasileña en seguridad pública: el modelo recibe cinco fragmentos recuperados y una pregunta, y devuelve una respuesta con la cita del fragmento usado, lo que permite auditar la fuente en un pipeline de recuperación.
- Sistema de preguntas y respuestas con rechazo controlado: en dominios donde una respuesta inventada es costosa (informes jurídicos, políticas públicas), el modelo está entrenado para responder «Não encontrado nos documentos.» cuando la información no está en el contexto, reduciendo el riesgo de alucinación factual.
- Resumen de documentos del dominio: a partir de los 261 pares de resumen del entrenamiento, el adaptador puede condensar fragmentos recuperados sobre seguridad, justicia y ciudadanía en portugués.
- Prototipado académico de destilación: sirve como referencia reproducible (mismo código, semilla y configuración que D2) para comparar destilación en caja negra frente a caja blanca en un entorno de investigación con recursos limitados.
- Despliegue en hardware de consumo: al ser un adaptador sobre un modelo de 1,5 B, puede ejecutarse en una GPU de consumo (el entrenamiento cupo en una RTX 3080), lo que facilita experimentos docentes y demos locales.
- Evaluación de pipelines RAG: el benchmark de 100 ítems (52 con contexto y 48 sin contexto) permite medir la calidad de la recuperación y de la citación en un sistema completo, no solo la del generador.
- Filtro de consultas fuera de dominio: la tasa elevada de rechazos (13 de 52 preguntas respondibles) puede aprovecharse como mecanismo conservador en entornos donde se prefiere no responder antes que responder mal.

## Benchmarks y rendimiento

Datos del benchmark de 100 ítems (`itens/bench_q4.jsonl`): 52 preguntas con cinco fragmentos fijos y 48 ítems de opción múltiple sobre leyes, súmulas y artículos sin contexto.

| Modelo | Con contexto (52) | Cita el fragmento correcto | Rechazos | Sin contexto (48) | Total (100) |
|---|---|---|---|---|---|
| Profesor, Qwen2.5-7B-Instruct (nf4) | 40 | 20 | 4 | 38 | 78 |
| Alumno antes, Qwen2.5-1.5B-Instruct | 35 | 4 | 1 | 32 | 67 |
| D1, caja negra | 25 | 35 | 9 | 32 | 57 |
| D2, caja blanca | 31 | 39 | 8 | 32 | 63 |
| D1 controlado, caja negra (este modelo) | 23 | 33 | 13 | 32 | 55 |

Observaciones reportadas por el autor: con contexto, el modelo queda 12 ítems por debajo del alumno original (McNemar, p = 0,023); D2, entrenado en las mismas condiciones, queda 4 por debajo. D1 controlado frente a D2: 4/12 ítems discordantes, McNemar p = 0,077 (no significativo). El modelo transfirió el formato (cita el fragmento correcto pasa de 4 a 33 sobre 52) pero rechaza más (13 sobre 52). No hay transferencia de conocimiento: en la mitad sin contexto, ninguna elección cambió respecto al alumno original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; al tratarse de un adaptador sobre un modelo de 1,5 B, la huella es la del modelo base más el adaptador (0,1 GB en safetensors).
- GPU recomendadas: el entrenamiento se realizó en una RTX 3080 (90 minutos), por lo que una GPU de consumo de gama alta es suficiente para inferencia y para reproducir el ajuste.
- Cabe en GPU de consumo: sí, según la evidencia del entrenamiento en RTX 3080.
- Opciones de despliegue: la model card documenta el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el benchmark (total/100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D1 controlado (este modelo) | 1,5 B + LoRA | no disponible | 55 | Apache 2.0 | Hugging Face |
| D2, caja blanca | 1,5 B + LoRA | no disponible | 63 | no disponible en la información | Hugging Face |
| D1, caja negra (original) | 1,5 B + LoRA | no disponible | 57 | no disponible en la información | Hugging Face |
| Alumno antes, Qwen2.5-1.5B-Instruct | 1,5 B | no disponible | 67 | Apache 2.0 (modelo base) | Hugging Face |
| Profesor, Qwen2.5-7B-Instruct (nf4) | 7 B | no disponible | 78 | Apache 2.0 (modelo base) | Hugging Face |

## Limitaciones y advertencias

- Rechaza con más frecuencia que el profesor: 13 de 52 preguntas respondibles, herencia del 22 % de rechazos en los pares de entrenamiento.
- El texto de los pares de entrenamiento proviene del profesor cuantizado en 4 bits, lo que introduce ruido en la señal de destilación.
- Benchmark pequeño: con 52 ítems, las diferencias de hasta unos 6 ítems entre modelos no son significativas.
- No hay transferencia de conocimiento factual: en la mitad sin contexto, el modelo no mejora al alumno original (32/48 en ambos).
- Con contexto, rinde 12 ítems por debajo del alumno original (p = 0,023), lo que sugiere que el ajuste puede degradar la capacidad de respuesta cuando el contexto es relevante.
- Uso previsto de investigación y enseñanza; las respuestas dependen de los fragmentos proporcionados y no sustituyen la lectura de las fuentes.
- Idioma limitado al portugués; no se documenta comportamiento en castellano ni en otros idiomas.
- No se documentan sesgos específicos más allá de los heredados del corpus y del profesor.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-1.5b-segjusticidadania-destilado-d1-local
- Variante D2 (caja blanca): https://huggingface.co/gutoportelaa/qwen2.5-1.5b-segjusticidadania-destilado-d2
- Dataset de experimentos: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Corpus curado: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-curated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Configuración e historial de pérdidas: `treino.json` en el repositorio del modelo
