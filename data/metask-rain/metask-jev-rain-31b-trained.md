# MeTask-Rain/metask-jev-rain-31B-trained

## Resumen

metask-jev-rain-31B-trained es un ajuste fino mediante LoRA sobre el modelo google/gemma-4-31B-it, publicado por el usuario MeTask-Rain. El modelo no está planteado como un generador de texto conversacional al uso, sino como un servicio de decisión estructurada: recibe un estado y una pregunta y devuelve un juicio junto con probabilidades para las opciones disponibles. Es, por tanto, un modelo especializado en una tarea acotada de clasificación/juicio probabilístico construida sobre la base multimodal Gemma 4 de 31B.

El repositorio incluye tanto el checkpoint base como un adaptador LoRA que debe aplicarse en cada petición; el autor advierte explícitamente de que los ejemplos generados automáticamente por Hugging Face con Transformers pueden cargar solo el checkpoint base y omitir el adaptador y la interfaz de decisión estructurada. El despliegue de referencia utiliza vLLM 0.31.0.

Con 32.682.375.020 parámetros reales en safetensors y un tamaño de repositorio de 23,8 GB, el modelo se distribuye bajo licencia Apache-2.0, aunque el autor remite a la licencia de Gemma 4 del modelo base. Su relevancia actual es acotada: es un artefacto de nicho orientado a reproducir una interfaz de decisión concreta (jevbench), no un modelo generalista de propósito amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Gemma 4; adaptador LoRA sobre el checkpoint base |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo usa compressed-tensors; el autor menciona cuantización en las notas técnicas sin detallar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (sujeta a la licencia de Gemma 4 del modelo base) |
| Formato de pesos | safetensors (checkpoint base + adaptador LoRA en `adapter/`); compatible con compressed-tensors y vLLM |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal de tipo image-text-to-text, y añade un adaptador LoRA entrenado por MeTask-Rain. No se especifica en la información disponible la arquitectura interna (número de capas, atención, cabezas) ni la longitud de contexto, más allá de la herencia del modelo base. El repositorio emplea el formato compressed-tensors y está etiquetado para vLLM.

El adaptador se entrenó con datos propios del autor, no con los ítems públicos de JevBench; estos últimos se reservaron para el ajuste de parámetros del servicio y las comprobaciones de funcionamiento, según la divulgación incluida en `service/DISCLOSURE.md`. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable no es arquitectónica sino de empaquetado: el modelo se distribuye junto a un paquete de servicio que reproduce una interfaz de decisión estructurada, con aplicación del adaptador en cada petición sobre vLLM 0.31.0.

## Capacidades

- Decisión estructurada: dado un estado y una pregunta, devuelve un juicio y probabilidades sobre las opciones disponibles.
- Generación de texto conversacional heredada del modelo base Gemma 4.
- Procesamiento multimodal image-text-to-text, por herencia del modelo base.
- Integración con vLLM mediante adaptador LoRA aplicado en cada petición.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio específicos: no disponibles más allá de la naturaleza multimodal del base.

## Casos de uso

- Clasificación probabilística de decisiones: el modelo recibe un estado y una pregunta y devuelve un juicio con probabilidades por opción, lo que permite integrarlo como componente de scoring en sistemas de decisión automatizada.
- Reproducción de la interfaz jevbench: el paquete de servicio incluido permite replicar la interfaz de decisión estructurada del autor para experimentación y validación.
- Evaluación de sistemas de decisión: al separar datos de entrenamiento propios de los ítems públicos de JevBench, sirve para comparar el comportamiento del adaptador frente a conjuntos de referencia.
- Prototipado de asistentes con salida estructurada: la combinación de base multimodal y adaptador permite construir endpoints que devuelvan JSON con juicio y probabilidades en lugar de texto libre.
- Investigación sobre ajuste fino con LoRA en modelos de 31B: el repositorio documenta el flujo base + adaptador + vLLM, útil como referencia de despliegue.
- Despliegue en infraestructura propia con vLLM: al estar empaquetado para vLLM 0.31.0 y compressed-tensors, encaja en pipelines de serving existentes que ya usen ese stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona JevBench como conjunto de referencia para el ajuste de parámetros y las comprobaciones del servicio, pero no se aportan métricas numéricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 32.682.375.020 parámetros, en precisión de 16 bits se requieren aproximadamente 65 GB de pesos, a los que hay que sumar caché KV y overhead del adaptador.
- En cuantización de 8 bits, el peso ronda los 33 GB; en 4 bits, unos 16-17 GB, aunque el autor no detalla los esquemas de cuantización soportados.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo completo en 16 bits no cabe en GPUs de consumo y requiere aceleradores de clase A100/H100 con memoria suficiente o múltiples GPUs.
- ¿Cabe en consumer GPU? No en 16 bits. En cuantizaciones agresivas podría plantearse en GPUs de 24 GB, pero no hay confirmación del autor.
- Opciones de despliegue: vLLM 0.31.0 es el stack de referencia indicado por el autor; compatible con compressed-tensors. Otros motores (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| metask-jev-rain-31B-trained | 32.682.375.020 | no disponible | Ajuste LoRA sobre Gemma 4 31B, decisión estructurada | Apache-2.0 (sujeta a Gemma 4) | Hugging Face, 373 descargas |
| google/gemma-4-31B-it (base) | no disponible en la información | no disponible | Transformer multimodal image-text-to-text | Licencia Gemma 4 | Hugging Face |
| Alternativas de 31B generalistas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está especializado en una tarea de decisión estructurada; su uso como generador de texto general no está validado por el autor.
- Los ejemplos automáticos de Transformers pueden cargar solo el checkpoint base y omitir el adaptador, lo que produciría resultados incorrectos; es obligatorio seguir las instrucciones del paquete de servicio.
- El adaptador se entrenó con datos propios del autor y no se detalla su composición, por lo que se desconocen sesgos y cobertura.
- Riesgo de alucinación inherente al modelo base Gemma 4; no se aportan evaluaciones específicas.
- No se declaran idiomas soportados ni longitud de contexto, lo que limita la planificación de despliegues multilingües o de contexto largo.
- La licencia es Apache-2.0, pero el autor remite a la licencia de Gemma 4 del modelo base; es necesario revisar y conservar los avisos de atribución al redistribuir.
- El modelo tiene 0 likes y 373 descargas en el momento de la consulta, con una validación externa muy limitada.
- El despliegue de referencia depende de vLLM 0.31.0 y del adaptador aplicado en cada petición; desviarse de ese stack puede romper la interfaz de decisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeTask-Rain/metask-jev-rain-31B-trained
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Divulgación del servicio: service/DISCLOSURE.md (dentro del repositorio)
- Paquete de servicio: service/README.md (dentro del repositorio)
- Notas técnicas: TECHNICAL_NOTES.md (dentro del repositorio)
