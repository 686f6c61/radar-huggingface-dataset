# Chechen123/Duopra

## Resumen

Duopra es un modelo any-to-any orientado a diálogo hablado en tiempo real, publicado en Hugging Face por el usuario Chechen123 como un fine-tune del modelo inclusionAI/Realtime-Venus. Está etiquetado como `minicpmo`, lo que lo sitúa en la familia de modelos conversacionales full-duplex de MiniCPM-o, con capacidades de entrada y salida de audio y texto, además de soporte declarado para tool calling y function calling en flujo continuo. Su propósito es servir como motor de agentes de voz que mantienen una conversación simultánea (full-duplex) mientras invocan herramientas externas.

El modelo cuenta con 9.371.820.434 parámetros en pesos safetensors y un repositorio de 33,9 GB, lo que sugiere pesos en precisión alta (bf16/fp16) acompañados de artefactos ONNX. Se distribuye con licencia MIT, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. Los idiomas declarados son inglés y chino.

Su relevancia actual radica en la creciente demanda de agentes de voz con latencia baja y capacidad de razonamiento multi-paso, un nicho donde los modelos any-to-any con streaming y tool calling son escasos. Al derivar de Realtime-Venus, hereda la arquitectura y el pipeline de entrenamiento del modelo base, si bien la información pública disponible sobre este fine-tune concreto es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado `minicpmo`; derivado de inclusionAI/Realtime-Venus) |
| Parámetros totales | 9.371.820.434 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

No se dispone de documentación técnica publicada por el autor sobre la arquitectura interna. Las etiquetas del repositorio indican que se trata de un modelo `minicpmo`, categoría asociada a los modelos conversacionales omni de MiniCPM con soporte full-duplex, y que emplea `custom_code` (requiere `trust_remote_code=True` en transformers). El pipeline declarado es `any-to-any`, con `feature-extraction` como tarea secundaria, lo que es coherente con un modelo que produce representaciones multimodales de audio y texto.

El modelo es un fine-tune de inclusionAI/Realtime-Venus. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o similares. Tampoco hay información sobre innovaciones técnicas específicas de este fine-tune (decodificación especulativa, atención lineal, etc.). La presencia de artefactos ONNX en el repositorio sugiere que el autor preparó el modelo para despliegue en entornos de inferencia optimizada, aunque no se detalla la configuración.

## Capacidades

- Generación y comprensión de voz en modo full-duplex, con entrada y salida de audio simultáneas.
- Diálogo hablado en streaming, orientado a agentes de voz con interacción continua.
- Procesamiento any-to-any: combinación de audio y texto como entrada y salida.
- Tool calling y function calling, lo que permite al modelo invocar APIs externas durante la conversación.
- Soporte declarado para flujos de agente con razonamiento multi-paso (multi-step reasoning).
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Extracción de características (`feature-extraction`) sobre entradas multimodales.
- No se ha documentado soporte de visión, matemáticas avanzadas ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Agentes de voz para atención al cliente: el modelo puede mantener conversaciones habladas en streaming con turnos solapados (full-duplex), lo que reduce la latencia percibida frente a pipelines turn-by-turn clásicos.
- Asistentes telefónicos con invocación de herramientas: gracias al tool calling, el agente puede consultar un CRM, reservar citas o escalar a un humano mientras continúa la conversación de voz.
- Integración en centros de contacto con análisis en tiempo real: el modo full-duplex permite transcribir y responder simultáneamente, útil para sugerencias al operador.
- Automatización de tareas de back-office mediante voz: dictado de formularios, consultas a bases de datos y confirmación hablada de resultados, combinando audio y texto.
- Desarrollo de interfaces conversacionales embebidas: la presencia de pesos ONNX facilita el despliegue en entornos con aceleración específica (por ejemplo, NPUs o GPUs con TensorRT), aunque no se detalla la configuración exacta.
- Investigación en diálogo hablado full-duplex: sirve como base para experimentos de interacción solapada, ya que deriva de un modelo especializado en tiempo real y expone tool calling en el mismo bucle conversacional.
- Prototipado de agentes multilingües inglés-chino: adecuado para demos y pruebas de concepto en esos dos idiomas, no así en castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.371.820.434 parámetros, en bf16/fp16 se requieren aproximadamente 18,7 GB solo para pesos; en int8 unos 9,4 GB; en int4 unos 4,7 GB. A esto hay que sumar el coste de activaciones, buffers de audio y caché de contexto, no cuantificados en la información disponible.
- GPU recomendadas: no disponible de forma específica. Por tamaño, una GPU de 24 GB (RTX 4090, A10G, L4) podría alojar el modelo en bf16 con margen limitado; para producción con concurrencia se recomiendan A100 40/80 GB o H100.
- ¿Cabe en GPU de consumo? Sí, potencialmente en RTX 4090 (24 GB) en bf16 con batch pequeño, o en GPUs de 12-16 GB si se cuantiza a int8/int4, siempre que la arquitectura `custom_code` lo permita.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el repositorio incluye ONNX, lo que abre la puerta a ONNX Runtime. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Duopra | 9,37 B | no disponible | en, zh | MIT (gated) | Fine-tune de Realtime-Venus, full-duplex, tool calling |
| inclusionAI/Realtime-Venus (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Duopra |
| MiniCPM-o (familia) | no disponible | no disponible | no disponible | no disponible | Familia `minicpmo` referenciada por las etiquetas |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría (modelos any-to-any de voz full-duplex). La comparación se limita a la relación de parentesco con el modelo base y la familia MiniCPM-o.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar pipelines automatizados.
- Idiomas limitados a inglés y chino: no hay soporte declarado de castellano, por lo que su uso en producción en español no está validado.
- Fine-tune de autor individual con 0 descargas y 1 like en el momento de la ficha: no hay evidencia pública de validación, evaluación ni uso en producción.
- Ausencia total de benchmarks: no se puede verificar la calidad del fine-tune frente al modelo base ni frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos, agravado en dominios de voz donde los errores de reconocimiento pueden propagarse.
- Sesgos desconocidos: no se ha documentado la composición del dataset de fine-tune ni posibles sesgos lingüísticos o culturales.
- Licencia MIT declarada, pero al derivar de un modelo base conviene verificar las condiciones de dicho modelo base antes de uso comercial.
- Requiere `custom_code` (`trust_remote_code=True`), lo que implica ejecutar código del autor y aumenta la superficie de riesgo en producción.
- No se ha documentado el comportamiento en contextos largos ni la estabilidad del modo full-duplex bajo carga concurrente.

## Enlaces

- Hugging Face: https://huggingface.co/Chechen123/Duopra
- Modelo base: https://huggingface.co/inclusionAI/Realtime-Venus
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
