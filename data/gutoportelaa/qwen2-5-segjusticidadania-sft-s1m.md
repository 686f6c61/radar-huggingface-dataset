# gutoportelaa/qwen2.5-segjusticidadania-sft-s1m

## Resumen
El modelo `qwen2.5-segjusticidadania-sft-s1m` es un ajuste fino supervisado (SFT) de Qwen2.5-1.5B-Instruct, desarrollado por el usuario gutoportelaa en el marco de un trabajo de fin de asignatura de Procesamiento de Lenguaje Natural en la UFPI (2026.2). Resuelve una tarea acotada de pregunta-respuesta con recuperación aumentada (RAG): responder preguntas sobre producción científica brasileña en seguridad pública, justicia y ciudadanía utilizando exclusivamente fragmentos de contexto proporcionados, citando el fragmento empleado y rechazando responder cuando la evidencia no está presente.

Arquitectura transformer decoder-only de Qwen2, con 1.777.088.000 parámetros totales (aproximadamente 1,5B nominales) y contexto nativo heredado del modelo base Qwen2.5-1.5B-Instruct. El ajuste se realizó mediante entrenamiento completo (no LoRA) en fp32/bf16, guardando el punto de validación con menor pérdida (paso 140 de 304, pérdida 0,6031). Es relevante como ejemplo reproducible de SFT con formato estricto de citación y abstención, y por sus resultados contraintuitivos: mejora la citación correcta y la abstención, pero reduce la tasa de acierto frente al modelo base.

El modelo está orientado a investigación y docencia, no a producción general. Su licencia Apache 2.0 permite uso comercial, pero su rendimiento medido en el benchmark del autor (17/30 aciertos frente a 24/30 del base) desaconseja su despliegue fuera del ámbito para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino supervisado completo |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni cuantizaciones) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar. El ajuste es un SFT de ajuste completo (todos los pesos), en fp32/bf16, con tasa de aprendizaje 1·10⁻⁵, AdamW de 8 bits, calentamiento y decaimiento coseno, 2 épocas, lote efectivo de 16 (2 × 8 de acumulación) y hasta 4.608 tokens por ejemplo. La pérdida se calcula únicamente sobre los tokens de la respuesta. Se guardó el checkpoint del paso 140 de 304, correspondiente a la menor pérdida de validación (0,6031).

Los datos de entrenamiento son 2.705 pares `instruction`/`input`/`output` generados por Qwen2.5-7B-Instruct local a partir del corpus del dataset `segjusticidadania-experimentos`: 1.844 preguntas ancoradas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos ("Não encontrado nos documentos.") y 261 resúmenes. La partición es 2.422 ejemplos de entrenamiento y 283 de validación (10 % de los documentos, separados por documento, sin fuga entre particiones). Ningún documento origen de un ítem de benchmark entra en los pares de entrenamiento. No se documenta RLHF ni DPO; la innovación principal es el formato forzado de citación y abstención aprendido por imitación.

## Capacidades
- Generación de texto en portugués con formato conversacional (chat template de Qwen2.5).
- Respuesta a preguntas ancoradas en fragmentos de contexto proporcionados por el usuario.
- Citación explícita del fragmento usado mediante el marcador `[k]`.
- Abstención controlada: responde exactamente "Não encontrado nos documentos." cuando la evidencia no está en los fragmentos.
- Resumen de fragmentos (capacidad presente en los datos de entrenamiento: 261 ejemplos de resumen).
- Seguimiento de instrucciones de sistema e instrucción de usuario en formato multi-turno.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso
- Asistente RAG de documentación científica: integrado en un pipeline que recupera cinco fragmentos con un recuperador híbrido (e5 + BM25) y los inyecta en el prompt, el modelo responde citando el fragmento `[k]` empleado, lo que facilita la verificación por parte del usuario.
- Revisión sistemática asistida: dado un conjunto de extractos de artículos sobre seguridad pública, el modelo resume y responde preguntas acotadas, señalando la fuente dentro del contexto proporcionado.
- Filtro de abstención en pipelines de QA: su tasa de rechazo (4/30 en el benchmark del autor) permite descartar respuestas sin evidencia antes de mostrarlas, reduciendo alucinaciones en dominios sensibles.
- Docencia y experimentación en PLN: sirve como caso reproducible de SFT completo frente a LoRA/QLoRA (S1, S2, S3) para comparar formatos de ajuste y puntos de validación.
- Prototipado de asistentes jurídico-administrativos en portugués: para consultas sobre normativa y producción científica brasileña, siempre con fragmentos recuperados y revisión humana posterior.
- Evaluación de recuperadores: al exigir citación del fragmento, permite medir de forma indirecta la calidad del recuperador subyacente (si cita el fragmento correcto o se abstiene).
- Generación de resúmenes extractivos acotados: sobre los fragmentos inyectados, con la limitación de que el modelo no aporta conocimiento externo.

## Benchmarks y rendimiento
Evaluación del autor sobre 30 preguntas ancoradas del benchmark de evidencia, con los mismos cinco fragmentos fijos (recuperador híbrido e5 + BM25), prompt en formato de entrenamiento, generación voraz y hasta 160 tokens. El acierto se mide por presencia de los términos clave de la respuesta de referencia. La prueba de múltiple elección usa 1.438 ítems de laguna (ley, súmula, artículo, porcentaje, año) por verosimilitud y sin contexto.

| Modelo | Acierto (30) | Cita el fragmento correcto | Rechazos | Termina solo | McNemar vs. sin SFT | Múltiple elección (1.438) |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (sin SFT) | 24 | 3 | 0 | 29/30 | — | 50,4 % |
| S1, ajuste completo | 20 | 22 | 4 | 30/30 | p = 0,289 | 50,6 % |
| S2, LoRA | 15 | 24 | 4 | 30/30 | p = 0,012 | 49,4 % |
| S3, QLoRA | 18 | 23 | 4 | 30/30 | p = 0,109 | 49,7 % |
| **S1m (este modelo)** | **17** | **26** | **4** | **30/30** | **p = 0,039** | **50,6 %** |

El propio autor señala que, incluso guardando el mejor punto de validación, el modelo pierde acierto frente al base de forma estadísticamente significativa (p = 0,039), y que la caída no proviene de sobreajuste al final del entrenamiento. La múltiple elección sin contexto no cambia respecto al base, lo que indica que el SFT enseña formato, no conocimiento nuevo.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,6 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica, unos 5-6 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (no se publican pesos GGUF oficiales, habría que generarlos).
- GPU recomendadas: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y en GPUs de datacenter (A100, H100) sin necesidad de ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en bf16, y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque no se documentan.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acierto (30) | Cita correcta | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| S1m (este modelo) | 1,78B | no disponible | 17/30 | 26/30 | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,78B | no disponible | 24/30 | 3/30 | Apache 2.0 | Hugging Face |
| S1 (ajuste completo, checkpoint final) | 1,78B | no disponible | 20/30 | 22/30 | Apache 2.0 | Hugging Face (mismo autor) |
| S2 (LoRA) | 1,78B | no disponible | 15/30 | 24/30 | Apache 2.0 | Hugging Face (mismo autor) |

La comparación se limita a las variantes del mismo trabajo, ya que no se proporcionan datos de modelos externos comparables en la misma tarea.

## Limitaciones y advertencias
- Benchmark pequeño: con 30 preguntas, diferencias de hasta unos 5 aciertos entre modelos no son significativas, según el propio autor.
- Los pares de entrenamiento contienen un 22 % de rechazos; el modelo rechaza más que el base, incluso cuando la respuesta sí está en los fragmentos.
- El SFT enseña el formato (citar y rechazar), no aporta conocimiento nuevo: la múltiple elección sin contexto apenas cambia (50,6 % frente a 50,4 % del base).
- Pérdida de acierto estadísticamente significativa frente al modelo base (p = 0,039), por lo que no es recomendable como sustituto directo del base en tareas generales.
- Idioma limitado al portugués; no se documenta rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación fuera del contexto: si el recuperador falla o los fragmentos no contienen la respuesta, el modelo puede citar incorrectamente o abstenerse en exceso.
- Sesgos: no documentados por el autor; el corpus se limita a producción científica brasileña sobre seguridad pública, justicia y ciudadanía, con el sesgo de selección que ello implica.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe el uso declarado a investigación y docencia, y las respuestas no sustituyen la lectura de las fuentes.
- No se publican pesos cuantizados ni artefactos de despliegue más allá de safetensors.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s1m
- Dataset de experimentos: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
