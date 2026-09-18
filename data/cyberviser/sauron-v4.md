# cyberviser/sauron-v4

## Resumen

Sauron v4 es un adaptador LoRA (PEFT) desarrollado por cyberviser / GLASSEYE (CyberviserAI) sobre el modelo base mistralai/Mistral-7B-v0.3. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB), no un modelo completo, por lo que su uso requiere descargar y cargar por separado el modelo base de Mistral AI. Según la model card, se trata de un reentrenamiento QLoRA ejecutado en local sobre una GPU RTX 5070 (sin GPUs en la nube), inicializado desde el adaptador anterior `cyberviser/sauron-v3` y entrenado sobre un conjunto de datos propio denominado `hancock_refresh_v4` con aproximadamente 3917 muestras.

El ámbito declarado por las etiquetas del repositorio es la ciberseguridad, junto con el identificador de la familia "sauron". No obstante, la información publicada es mínima: no se documentan resultados de evaluación, composición del dataset, hiperparámetros completos (rango, alpha, target modules), idiomas soportados ni pipeline de inferencia. El entrenamiento declarado es corto (250 pasos) y la pérdida de entrenamiento reportada es de aproximadamente 1,04.

Su relevancia es limitada y de nicho: se trata de un experimento de ajuste fino ligero, con 12 descargas y 0 likes en el momento de la consulta, publicado bajo licencia Apache-2.0 y con fechas de creación y actualización del 18 de septiembre de 2026. Es interesante como ejemplo de flujo QLoRA local sobre Mistral-7B aplicado a dominios de seguridad, pero no dispone de validación pública que respalde su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Mistral-7B-v0.3); la arquitectura del adaptador concreta (rango, alpha, módulos objetivo) no está publicada |
| Parámetros totales | No disponible para el adaptador; el modelo base mistralai/Mistral-7B-v0.3 tiene 7,2 mil millones de parámetros |
| Longitud de contexto | No especificada por el autor; heredada del modelo base Mistral-7B-v0.3 (32 768 tokens según su model card) |
| Tipos de cuantización | No especificados. El adaptador se distribuye sin cuantizar; puede fusionarse con el modelo base y cuantizarse después (GGUF, AWQ, GPTQ) o cargarse sobre una base cuantizada en 4/8 bits con bitsandbytes |
| Idiomas soportados | No disponible en la ficha del adaptador |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |
| Tipo de artefacto | Adaptador, no modelo completo |
| Modelo base | mistralai/Mistral-7B-v0.3 |
| Adaptador de inicialización | cyberviser/sauron-v3 |
| Dataset de entrenamiento | hancock_refresh_v4 (~3917 muestras) |
| Pasos de entrenamiento | 250 |
| Pérdida de entrenamiento | ~1,04 |
| Tamaño del repositorio | 0,1 GB |
| Librería | peft |
| Autoría | cyberviser / GLASSEYE (CyberviserAI) |
| Descargas / likes | 12 / 0 |
| Fecha de creación | 2026-09-18 |
| Última actualización | 2026-09-18 |

## Arquitectura y entrenamiento

El adaptador se construye sobre Mistral-7B-v0.3, un transformer decoder-only de 7,2 mil millones de parámetros que emplea grouped-query attention, activación SwiGLU, embeddings rotatorios (RoPE) y atención con ventana deslizante, con una ventana de contexto de 32 768 tokens. Sauron v4 no modifica esa arquitectura: añade matrices de bajo rango (LoRA) sobre determinadas capas del modelo base, que se combinan con los pesos congelados en tiempo de inferencia o se fusionan en un checkpoint completo. El autor no publica el rango, el alpha, el dropout ni la lista de módulos objetivo del adaptador.

El proceso de entrenamiento descrito es un QLoRA ejecutado en local sobre una GPU RTX 5070, sin uso de GPUs en la nube. Se partió del adaptador `cyberviser/sauron-v3` como inicialización y se entrenaron 250 pasos sobre `hancock_refresh_v4`, un conjunto de aproximadamente 3917 muestras, con una pérdida final de entrenamiento de alrededor de 1,04. No se documentan la composición del dataset, la longitud de las secuencias, el régimen de aprendizaje, el uso de RLHF/DPO ni ningún mecanismo de decodificación especulativa o innovación técnica adicional. Tampoco se indica si el adaptador se entrenó solo sobre proyecciones de atención o también sobre las capas MLP.

## Capacidades

- Generación de texto y finalización de instrucciones en el dominio genérico heredado del modelo base Mistral-7B-v0.3.
- Especialización declarada en ciberseguridad por las etiquetas del repositorio (`cybersecurity`), sin documentación de tareas concretas ni evaluación que la respalde.
- Razonamiento y generación de código: no verificados para este adaptador; dependen de las capacidades del modelo base.
- Soporte de tool calling / function calling: no documentado para el adaptador (el modelo base Mistral-7B-v0.3 no incluye plantilla de function calling nativa en su tokenizador).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Al ser un adaptador PEFT, puede combinarse con cualquier técnica de inferencia soportada por el modelo base (cuantización, decodificación especulativa con un modelo draft, etc.), pero esto corresponde a la infraestructura, no al adaptador.

## Casos de uso

- Asistente interno de triaje de alertas en un SOC: el modelo puede reformular y resumir alertas de SIEM en lenguaje natural apoyándose en la ventana de 32 768 tokens del modelo base, siempre que se valide previamente su comportamiento en el dominio mediante un conjunto de evaluación propio.
- Borrador de informes de inteligencia de amenazas (CTI): generación de resúmenes a partir de notas y fuentes abiertas, con revisión humana obligatoria para evitar IoCs, CVE o actores inventados.
- Enriquecimiento de descripciones de vulnerabilidades: redacción de texto explicativo a partir de identificadores CVE y referencias técnicas, útil como plantilla de documentación interna.
- Formación y concienciación: generación de ejemplos de correos de phishing y de explicaciones didácticas para programas de awareness, dado el enfoque de ciberseguridad declarado.
- Apoyo a la revisión de código seguro: comentarios y sugerencias sobre fragmentos de código, aprovechando las capacidades de generación de código del modelo base, con verificación estática posterior obligatoria.
- Prototipado de chatbots de consulta sobre documentación de seguridad: indexación de políticas internas y generación de respuestas contextualizadas, usando el adaptador como capa de estilo sobre Mistral-7B.
- Experimentación académica con QLoRA: el repositorio sirve como caso de estudio reproducible de ajuste fino local en una sola GPU consumer, más que como componente listo para producción.
- Normalización y mapeo de técnicas a MITRE ATT&CK: conversión de descripciones libres en identificadores de técnica, con validación contra la matriz oficial por el riesgo de alucinación de identificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento (~1,04 tras 250 pasos), que no es una métrica de capacidad y no permite comparaciones significativas con otros modelos. El autor no incluye evaluaciones sobre MMLU, HumanEval, GSM8K, CyberSecEval ni ningún otro conjunto de referencia.

## Requisitos de hardware

- Adaptador aislado: 0,1 GB de disco; el peso en memoria es despreciable (decenas de MB en FP16). No es ejecutable por sí solo.
- Modelo base en BF16/FP16: aproximadamente 14,5 GB de pesos, con 16-20 GB de VRAM en la práctica según longitud de contexto y tamaño de lote. Requiere RTX 4090 (24 GB), A100 40/80 GB, L40S o H100.
- Modelo base en 8 bits (bitsandbytes): en torno a 8 GB de pesos; viable en RTX 3090/4080/4090 y en GPUs de 12-16 GB con contexto moderado.
- Modelo base en 4 bits (QLoRA o GGUF Q4_K_M): en torno a 4-5 GB; cabe en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) e incluso en equipos con 8 GB de memoria unificada, con degradación de calidad asociada a la cuantización.
- Carga del adaptador: puede aplicarse sobre una base cuantizada en 4 u 8 bits mediante `peft` + `bitsandbytes`, o fusionarse previamente con `merge_and_unload()` y convertirse después a GGUF.
- Opciones de despliegue: `transformers` + `peft` (referencia), vLLM (soporta adaptadores LoRA en modo servidor), Text Generation Inference (TGI, con soporte de LoRA), llama.cpp / Ollama / LM Studio tras fusionar y convertir a GGUF. No se documenta ninguna receta de despliegue por parte del autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Evaluación publicada | Disponibilidad |
|---|---|---|---|---|---|---|
| cyberviser/sauron-v4 | Adaptador LoRA sobre Mistral-7B-v0.3 | No publicado (base: 7,2 B) | No especificado (base: 32 768 tokens) | Apache-2.0 | No | HuggingFace, 12 descargas |
| mistralai/Mistral-7B-v0.3 | Modelo completo | 7,2 B | 32 768 tokens | Apache-2.0 | Sí, publicada por Mistral AI | HuggingFace, ampliamente desplegado |
| cyberviser/sauron-v3 | Adaptador LoRA sobre el mismo modelo base | No publicado | No especificado | No disponible en la información proporcionada | No | Referenciado como inicialización de v4 |
| Otros adaptadores LoRA de ciberseguridad sobre Mistral-7B | Adaptador | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No es posible establecer una comparación cuantitativa de rendimiento con alternativas: no existen métricas publicadas para Sauron v4 ni un conjunto de evaluación común declarado por el autor. La única comparación verificable es estructural (adaptador frente a modelo completo frente al adaptador predecesor).

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, conjunto de validación ni pruebas de regresión publicadas, por lo que no puede afirmarse que el ajuste mejore al modelo base en ninguna tarea concreta.
- Entrenamiento muy corto (250 pasos sobre ~3917 muestras): el riesgo de sobreajuste al dataset `hancock_refresh_v4` o de que el ajuste sea superficial es alto; tampoco se documenta el régimen de aprendizaje ni la estrategia de validación.
- Alucinación crítica en dominio de seguridad: existe riesgo de generar CVE, direcciones IP, hashes, nombres de actores o identificadores MITRE ATT&CK inexistentes. Cualquier salida debe validarse contra fuentes autoritativas antes de usarse.
- Sesgos: no documentados por el autor. Al no conocerse la composición del dataset de ajuste, no puede descartarse la incorporación de sesgos presentes en él ni de sesgos heredados del corpus de Mistral-7B-v0.3.
- Idiomas: no declarados. No hay garantía de comportamiento consistente en castellano ni en idiomas distintos del inglés.
- Contexto: el autor no especifica la ventana efectiva tras el ajuste; la ventana de 32 768 tokens es una propiedad del modelo base y no una característica verificada del adaptador.
- Licencia: el adaptador se publica como Apache-2.0, pero el uso comercial está sujeto también a los términos del modelo base Mistral-7B-v0.3, que es igualmente Apache-2.0. Debe conservarse la atribución correspondiente a Mistral AI y al autor del adaptador.
- Reproducibilidad: no se publican scripts de entrenamiento, configuración de hiperparámetros ni el dataset `hancock_refresh_v4`, por lo que el resultado no es reproducible.
- Madurez: 12 descargas y 0 likes, con menos de una hora entre creación y última actualización, indican un artefacto sin adopción ni validación por parte de la comunidad.
- No apto para decisiones automatizadas en producción sin supervisión humana, especialmente en contextos de respuesta a incidentes, cumplimiento normativo o análisis forense.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberviser/sauron-v4
- Adaptador de inicialización: https://huggingface.co/cyberviser/sauron-v3
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Repositorio de la librería PEFT: https://github.com/huggingface/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper de QLoRA (Dettmers et al., 2023): https://arxiv.org/abs/2305.14314
- No se han encontrado papers, blogs, demos ni repositorios adicionales específicos de este modelo en la búsqueda web realizada.
