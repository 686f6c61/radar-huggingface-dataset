# praiselab-picuslab/benchmark-slm-msmarco-qwen2.5-1.5b-ctxq

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-qwen2.5-1.5b-ctxq` es un adaptador LoRA (librería PEFT) construido sobre el modelo base Qwen/Qwen2.5-1.5B. Por la nomenclatura del repositorio —`benchmark-slm`, `msmarco`, `ctxq`— se trata de un artefacto experimental orientado a evaluar modelos de lenguaje pequeños (SLM) en tareas derivadas del corpus MS MARCO, presumiblemente con una estrategia de construcción de contexto a partir de consultas (context-query). No es un modelo de propósito general entrenado desde cero, sino un ajuste fino paramétricamente eficiente sobre un transformer ya existente.

El modelo resuelve, por tanto, un problema acotado: servir como punto de medida reproducible en un banco de pruebas interno del autor (`praiselab-picuslab`) sobre recuperación/comprensión de pasajes de MS MARCO. Su relevancia práctica fuera de ese contexto es limitada: cuenta con 0 descargas y 0 likes, el repositorio ocupa 0.0 GB (lo que sugiere que los pesos del adaptador podrían no estar efectivamente publicados o son de tamaño despreciable), y el acceso está restringido (gated), requiriendo aceptar condiciones en HuggingFace.

La información pública disponible es muy escasa: no se declara licencia, no hay datos de entrenamiento, no hay resultados de benchmarks publicados y el único idioma declarado es el inglés. Cualquier evaluación de producción debe partir de la ficha del modelo base Qwen2.5-1.5B y verificar primero la integridad del adaptador descargado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen2.5-1.5B); adaptador LoRA sobre atención/proyecciones |
| Parametros totales | 1,5B en el modelo base; número de parámetros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador (el modelo base declara 32.768 tokens) |
| Tipos de cuantizacion | no disponible como artefacto publicado; el modelo base admite GPTQ, AWQ, GGUF e INT8/FP8 en el ecosistema estándar |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Acceso | restringido (gated) — requiere aceptar condiciones |
| Repositorio | 0.0 GB, creado y actualizado el 2026-10-23 |
| Dataset declarado | microsoft/ms_marco |
| Estrategia declarada | ctxq |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B, un transformer decoder-only con atención causal completa, RoPE, normalización RMSNorm y capas MLP con activación SwiGLU. El ajuste se realiza mediante LoRA (Low-Rank Adaptation), que congela los pesos originales e inserta matrices de bajo rango en determinadas proyecciones; esto reduce drásticamente el número de parámetros entrenables y el coste de entrenamiento, pero no modifica la arquitectura de inferencia una vez fusionado el adaptador.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, el rango y alpha del LoRA, la tasa de aprendizaje, ni sobre si se aplicaron etapas de RLHF, DPO o SFT supervisado. La etiqueta `strategy-ctxq` sugiere una formulación de la tarea basada en contexto más consulta, coherente con el corpus MS MARCO (pasajes y preguntas reales de un motor de búsqueda), pero los detalles del pipeline son desconocidos. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Qwen2.5-1.5B.
- Comprensión de pasajes y formulación de respuestas sobre el dominio de MS MARCO (preguntas de búsqueda web), presumiblemente el objetivo del ajuste.
- Conversación multi-turno: la ficha declara la etiqueta `conversational`.
- Tool calling / function calling: no documentado para el adaptador; el modelo base Qwen2.5 sí lo soporta en su variante instruct.
- Razonamiento multi-paso y uso como agente: no documentado ni verificado para este adaptador.
- Capacidades multilingües: no declaradas; solo se lista inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Razonamiento matemático y generación de código: no evaluado para este adaptador.

## Casos de uso

- Evaluación comparativa de SLM en recuperación de pasajes: usar el adaptador como uno de los brazos de un banco de pruebas sobre MS MARCO, midiendo exactitud de respuesta o solapamiento con la respuesta de referencia frente a otros modelos de ~1,5B.
- Reproducción de experimentos académicos: al ser un artefacto de benchmark, sirve para replicar las condiciones de un estudio concreto sobre ajuste fino eficiente en dominios de búsqueda.
- Prototipado de respuesta a preguntas extractivas: dado un pasaje y una consulta, generar una respuesta corta en inglés, con la ventaja de que 1,5B parámetros permiten iterar en una sola GPU de consumo.
- Base para experimentos de fusión de adaptadores: al ser un LoRA en safetensors, se puede fusionar con el modelo base y comparar el efecto del ajuste frente al Qwen2.5-1.5B original.
- Docencia y formación en PEFT: ejemplo mínimo y realista de cómo se publica un adaptador LoRA, incluyendo las etiquetas de dataset y estrategia.
- Filtrado previo en pipelines de búsqueda: uso del adaptador como reranker o generador de respuestas candidatas antes de un modelo mayor, siempre que se valide su calidad con datos propios (no hay métricas publicadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La ficha del repositorio no incluye tabla de métricas (MMLU, HumanEval, GSM8K, EM/F1 sobre MS MARCO ni ninguna otra), y la búsqueda web realizada no devolvió documentación técnica asociada al modelo. No deben asumirse cifras de rendimiento derivadas del nombre del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 3 GB solo para pesos del modelo base fusionado, más caché KV y activaciones; presupuesto práctico de 5-6 GB para contextos moderados.
- VRAM estimada en INT8: aproximadamente 1,6-2 GB de pesos; en Q4 (GGUF): alrededor de 1 GB de pesos.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; también en GPUs de 8 GB con cuantización de 8 bits o inferior.
- GPU de datacenter: A100, H100 y L4 son sobredimensionadas para 1,5B; útiles solo para batchear grandes volúmenes.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM y TGI (requieren fusionar el adaptador en los pesos), llama.cpp y Ollama (prevía conversión a GGUF), o exportación a ONNX.
- Latencia y throughput: no disponibles; no hay mediciones publicadas. Como referencia de orden de magnitud, un modelo de 1,5B en FP16 sobre una RTX 4090 suele superar con holgura el centenar de tokens por segundo en generación, pero esta cifra no está verificada para este adaptador.
- Advertencia: el tamaño de repositorio de 0.0 GB hace recomendable comprobar que el archivo `adapter_model.safetensors` existe y es íntegro antes de planificar cualquier despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| benchmark-slm-msmarco-qwen2.5-1.5b-ctxq | 1,5B (base) + LoRA | no disponible | no disponible | gated | Artefacto de benchmark, sin métricas publicadas |
| Qwen/Qwen2.5-1.5B (base) | 1,5B | 32.768 tokens (según ficha del modelo base) | Apache 2.0 (según ficha del modelo base) | público | Modelo generalista; referencia obligada para medir el efecto del adaptador |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (según ficha del modelo base) | Apache 2.0 (según ficha del modelo base) | público | Variante alineada para instrucciones y conversación; comparable directo en tareas de QA |
| Otros SLM de ~1-2B (p. ej. familias SmolLM2 o Llama 3.2) | ~1-2B | no disponible en esta ficha | no disponible en esta ficha | público | Candidatos habituales en bancos de pruebas de SLM; requieren consultar sus fichas para cifras verificadas |

Los datos de las filas correspondientes al modelo base y su variante instruct provienen de sus fichas públicas de HuggingFace y deben verificarse en la fuente original; no se dispone de resultados comparativos de rendimiento para este adaptador.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay benchmarks, curvas de entrenamiento ni evaluación cualitativa publicada; no se puede afirmar que el ajuste mejore al modelo base.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor o asumir riesgo legal.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede bloquear automatizaciones y pipelines de CI.
- Repositorio de 0.0 GB: posible ausencia o trivialidad de los pesos del adaptador; verificar antes de cualquier uso.
- Idioma limitado al inglés: no se declara soporte de castellano ni de otras lenguas.
- Sesgos y alucinaciones: heredados del modelo base Qwen2.5-1.5B y del corpus MS MARCO (consultas reales de buscador, con los sesgos de distribución que ello implica); no hay evaluación de sesgos específica para este adaptador.
- Dominio estrecho: el ajuste está orientado a un benchmark concreto; el comportamiento fuera de ese dominio puede degradarse respecto al modelo base.
- Sin garantías de mantenimiento: 0 descargas, 0 likes y un único commit sugieren un artefacto de un solo uso, no un modelo mantenido.
- Contexto efectivo desconocido: aunque el modelo base soporta 32.768 tokens, no se documenta si el entrenamiento del adaptador respetó esa ventana.
- En producción: fijar la revisión concreta del repositorio y del modelo base, y validar con un conjunto propio antes de sustituir cualquier modelo existente.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-qwen2.5-1.5b-ctxq
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset MS MARCO: https://huggingface.co/datasets/microsoft/ms_marco
- Librería PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo y se han descartado.
