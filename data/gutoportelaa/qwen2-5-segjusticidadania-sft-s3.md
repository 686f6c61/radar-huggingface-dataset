# gutoportelaa/qwen2.5-segjusticidadania-sft-s3

## Resumen

El modelo `qwen2.5-segjusticidadania-sft-s3` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario de Hugging Face gutoportelaa en el marco de un trabajo final de la asignatura de Procesamiento de Lenguaje Natural de la UFPI (2026.2). Su propósito es responder preguntas sobre producción científica brasileña en materia de seguridad pública, justicia y ciudadanía exclusivamente a partir de fragmentos de texto proporcionados, citando el fragmento empleado y rechazando responder cuando la información no aparece en dichos fragmentos.

El modelo resuelve un problema acotado de generación aumentada por recuperación (RAG) con atribución explícita: no busca incorporar conocimiento nuevo, sino enseñar al modelo base un formato concreto de citación (`[k]`) y de rechazo ("Não encontrado nos documentos."). Se entrena sobre 2.705 pares instrucción/entrada/salida generados con Qwen2.5-7B-Instruct a partir de un corpus documental, con separación por documento entre entrenamiento y validación.

Es relevante ahora como ejemplo reproducible de ajuste fino eficiente (QLoRA de 4 bits, LoRA con r=16) sobre un modelo pequeño de 1.5B parámetros, con una evaluación honesta que incluye intervalos de significación estadística (test de McNemar) y que documenta explícitamente que el ajuste mejora el formato de citación pero no el conocimiento factual del modelo. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre proyecciones q, k, v, o, gate, up y down |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA no se especifica en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | Entrenamiento en 4 bits NF4 (QLoRA); inferencia del adaptador sobre base en bf16 |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. El entrenamiento emplea QLoRA: la base se cuantiza en 4 bits con formato NF4 durante el ajuste, y se insertan adaptadores LoRA con r=16, α=32 y dropout 0,05 en las proyecciones de atención (q, k, v, o) y de la MLP (gate, up, down). La tasa de aprendizaje es de 2·10⁻⁴, con optimizador AdamW de 8 bits, calentamiento y decaimiento coseno, 2 épocas, lote efectivo de 16 (2 × 8 de acumulación) y hasta 4.608 tokens por ejemplo. La pérdida se calcula únicamente sobre los tokens de la respuesta. En inferencia, el adaptador se aplica sobre la base en bf16.

Los datos de entrenamiento consisten en 2.705 pares `instruction`/`input`/`output` generados por Qwen2.5-7B-Instruct local a partir del corpus del dataset `segjusticidadania-experimentos`: 1.844 preguntas ancoradas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos ("Não encontrado nos documentos.") y 261 resúmenes. El reparto es de 2.422 pares para entrenamiento y 283 para validación (10 % de los documentos, separados por documento). Ningún documento de origen de un ítem de benchmark entra en los pares de entrenamiento. No se menciona uso de RLHF ni DPO; el método es SFT supervisado.

## Capacidades

- Generación de texto en portugués con formato conversacional (chat template de Qwen2.5).
- Respuesta a preguntas ancoradas en fragmentos: responde usando exclusivamente los cinco fragmentos proporcionados en el prompt.
- Citación explícita del fragmento empleado mediante el marcador `[k]`.
- Rechazo controlado: devuelve exactamente "Não encontrado nos documentos." cuando la respuesta no está en los fragmentos.
- Generación de resúmenes a partir de documentos del corpus (261 ejemplos de resumen en el conjunto de entrenamiento).
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Sin capacidades de visión ni audio.
- Sin modo de razonamiento explícito (thinking mode).
- El ajuste no incorpora conocimiento factual nuevo: la evaluación de múltiple elección sin contexto no mejora respecto al modelo base (49,7 % frente a 50,4 %).

## Casos de uso

- Asistencia a la consulta de literatura científica en seguridad pública: el modelo recibe cinco fragmentos recuperados por un sistema RAG (por ejemplo, recuperador híbrido e5 + BM25) y devuelve una respuesta breve citando el fragmento exacto, lo que permite verificar la fuente de forma inmediata.
- Sistemas de preguntas y respuestas con atribución obligatoria: en dominios donde la trazabilidad de la fuente es un requisito (informes técnicos, documentación normativa), el formato `[k]` facilita la auditoría de cada respuesta.
- Filtrado de preguntas fuera de alcance: el comportamiento de rechazo entrenado permite descartar consultas cuya respuesta no figura en los documentos recuperados, reduciendo respuestas inventadas en pipelines de RAG.
- Generación de resúmenes de documentos del corpus: el modelo puede condensar fragmentos sobre producción científica en justicia y ciudadanía, útil para revisiones bibliográficas asistidas.
- Prototipado docente y de investigación: por su tamaño (1.5B) y su licencia Apache 2.0, sirve como banco de pruebas reproducible para comparar estrategias de ajuste (ajuste completo, LoRA, QLoRA) con métricas de citación y rechazo.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre una base de 1.5B en bf16, puede ejecutarse en una única GPU de consumo para experimentación y demostraciones, sin necesidad de infraestructura de servidor.
- Evaluación de sistemas RAG: el modelo y su benchmark de 30 preguntas ancoradas permiten medir la calidad del recuperador y del generador por separado, ya que los fragmentos se fijan para todos los modelos comparados.

## Benchmarks y rendimiento

Evaluación sobre 30 preguntas ancoradas del benchmark de evidencia, con los mismos cinco fragmentos fijos para todos los modelos (recuperador híbrido e5 + BM25), prompt en el formato de entrenamiento, generación voraz y hasta 160 tokens. El acierto se mide por la presencia de los términos clave de la respuesta de referencia. La prueba de múltiple elección emplea 1.438 ítems de laguna (ley, súmula, artículo, porcentaje, año) con elección por verosimilitud y sin contexto.

| Modelo | Acierto (30) | Cita el fragmento correcto | Rechazos | Termina solo | McNemar frente a sin SFT | Múltiple elección (1.438) |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (sin SFT) | 24 | 3 | 0 | 29/30 | — | 50,4 % |
| S1, ajuste completo | 20 | 22 | 4 | 30/30 | p = 0,289 | 50,6 % |
| S2, LoRA | 15 | 24 | 4 | 30/30 | p = 0,012 | 49,4 % |
| S3, QLoRA (este modelo) | 18 | 23 | 4 | 30/30 | p = 0,109 | 49,7 % |
| S1m, ajuste completo, mejor punto de validación | 17 | 26 | 4 | 30/30 | p = 0,039 | 50,6 % |

El adaptador QLoRA mejora de forma sustancial la citación del fragmento correcto (de 3 a 23 sobre 30) y añade comportamiento de rechazo (4 casos), a costa de reducir el acierto bruto (de 24 a 18). La diferencia frente al modelo sin SFT no es estadísticamente significativa (p = 0,109). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en bf16 requiere aproximadamente 3 GB de pesos; en cuantización de 4 bits, alrededor de 1 GB. El adaptador LoRA añade una sobrecarga mínima (el repositorio completo ocupa 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; una RTX 3060, RTX 4060 o superior es suficiente para inferencia. Para entrenamiento QLoRA se recomienda al menos 8-12 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en bf16 y en tarjetas con 4 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers + peft (método documentado por el autor), y previsiblemente vLLM, TGI o llama.cpp tras fusionar el adaptador con la base y convertir a GGUF; estas últimas opciones no están documentadas en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-segjusticidadania-sft-s3 (este) | 1.5B + adaptador LoRA | No disponible | SFT/QLoRA para RAG con citación en portugués | Apache 2.0 | Hugging Face (2 descargas) |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | No disponible en esta ficha | Instrucción general multilingüe | Apache 2.0 | Hugging Face (ampliamente distribuido) |
| S1, ajuste completo (mismo trabajo) | 1.5B | No disponible | Ajuste completo sobre el mismo corpus | Apache 2.0 (presumible, no confirmado) | No distribuido en la información disponible |
| S2, LoRA (mismo trabajo) | 1.5B + adaptador LoRA | No disponible | LoRA sobre el mismo corpus | Apache 2.0 (presumible, no confirmado) | No distribuido en la información disponible |

La comparación relevante es interna al trabajo: frente al ajuste completo (S1, 20 aciertos y 22 citas) y a LoRA (S2, 15 aciertos y 24 citas), el QLoRA (S3) queda en un punto intermedio con 18 aciertos y 23 citas, con un coste de entrenamiento menor al mantener la base en 4 bits. No se dispone de comparación con modelos de terceros de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Benchmark pequeño: con 30 preguntas, las diferencias de hasta unos 5 aciertos entre modelos no son estadísticamente significativas, como reconoce el propio autor.
- Sesgo hacia el rechazo: los pares de entrenamiento contienen un 22 % de rechazos, y los modelos ajustados rechazan más que la base, incluso cuando la respuesta sí está en los fragmentos (4 rechazos en S3 frente a 0 en la base).
- El SFT enseña el formato (citar y rechazar), no conocimiento nuevo: la prueba de múltiple elección sin contexto no cambia respecto a la base (49,7 % frente a 50,4 %).
- Riesgo de alucinación fuera del dominio: si los fragmentos no contienen la respuesta, el modelo puede citar incorrectamente o responder de forma incompleta; la evaluación muestra 23 citas correctas de 30, no 30.
- Limitación idiomática: entrenado y evaluado únicamente en portugués; no hay evidencia de comportamiento en otros idiomas.
- Uso previsto de investigación y enseñanza: las respuestas dependen de los fragmentos proporcionados y no sustituyen la lectura de las fuentes.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache 2.0; conviene verificar los términos del dataset `segjusticidadania-experimentos` antes de un uso en producción.
- Sin datos publicados sobre latencia, throughput ni comportamiento con contextos largos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s3
- Dataset de experimentos: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de transformers: https://github.com/huggingface/transformers
