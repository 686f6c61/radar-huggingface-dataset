# agentscope-ai/Piccolo-4B-VL

## Resumen

Piccolo-4B-VL es un checkpoint de modelo vision-lenguaje publicado por agentscope-ai bajo licencia Apache 2.0. Emplea la arquitectura `Qwen3_5ForConditionalGeneration` con una configuración de visión asociada, lo que lo sitúa en la familia de transformers multimodales derivados de Qwen. El repositorio contiene pesos en Safetensors distribuidos en dos shards principales más un fichero `model-frozen-mtp.safetensors`, todos referenciados por `model.safetensors.index.json`, junto con las configuraciones originales de modelo, generación, tokenizer y processor, y la plantilla de chat.

El modelo pertenece a la familia Piccolo, que según el repositorio de GitHub del autor comprende variantes de 4B, 9B y 27B descritas como "decision models": dado un estado, una pregunta y opciones candidatas, devuelven decisiones estructuradas y probabilidades por candidato. Esa familia está orientada a revisión de llamadas a herramientas, retención de contexto, flujos de datos y entornos interactivos. La variante VL añade procesamiento de imagen y texto (`image-text-to-text`), por lo que puede recibir entradas visuales además de textuales.

El checkpoint tiene 4.659.865.088 parámetros según los safetensors y un tamaño de repositorio de 9,3 GB. Es relevante por su licencia permisiva, su integración nativa con `transformers` y su etiqueta `endpoints_compatible`, que facilita el despliegue en infraestructuras compatibles con la API de endpoints. La model card no detalla contexto, idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con configuración de visión) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (2 shards principales + `model-frozen-mtp.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, un transformer multimodal con torre de visión y módulo de lenguaje, empaquetado con las configuraciones originales de modelo, generación, tokenizer y processor. El repositorio incluye un tensor adicional denominado `model-frozen-mtp.safetensors`, que por su nombre sugiere un módulo de predicción multi-token (MTP) congelado, aunque la model card no describe su función ni cómo se activa en inferencia.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la arquitectura heredada de Qwen3.5. Tampoco se documenta si el modelo se ha destilado o ajustado a partir de un modelo base mayor. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto, dado el pipeline `image-text-to-text`.
- Procesamiento de decisiones estructuradas: según la familia Piccolo, devuelve decisiones y probabilidades sobre opciones candidatas, útil para revisión de herramientas y retención de contexto.
- Soporte de conversación multi-turno mediante la plantilla de chat incluida en el repositorio.
- Integración con `transformers` y compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no documentados explícitamente en la model card; la familia Piccolo menciona revisión de herramientas, pero no se detalla el mecanismo.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Revisión de llamadas a herramientas en agentes: el modelo puede evaluar un estado, una pregunta y un conjunto de opciones de herramienta para devolver una decisión estructurada con probabilidades, integrándose en bucles de agente que necesitan validar acciones antes de ejecutarlas.
- Compactación y retención de contexto: en pipelines de agentes con historiales largos, el modelo puede decidir qué fragmentos de contexto conservar o descartar, reduciendo el coste de tokens en llamadas posteriores.
- Enrutamiento de decisiones en flujos de datos: dado un registro y varias categorías candidatas, devuelve la etiqueta y la probabilidad asociada, lo que permite umbrales de confianza y revisión humana en procesos ETL.
- Asistencia multimodal en atención al cliente: al aceptar imagen y texto, puede interpretar capturas de pantalla o documentos adjuntos y responder en conversaciones multi-turno, siempre que se valide su contexto efectivo.
- Validación de salidas en entornos interactivos: el modelo puede actuar como juez local de decisiones en simulaciones o entornos de refuerzo, devolviendo probabilidades por candidato para seleccionar acciones.
- Despliegue en infraestructura compatible con endpoints: gracias a la etiqueta `endpoints_compatible` y a los pesos Safetensors, puede servirse en plataformas que exponen la API de Hugging Face Endpoints sin conversión de formato.
- Prototipado de investigación en modelos de decisión multimodales: su licencia Apache 2.0 y su tamaño de 4B permiten experimentación y ajuste fino sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4090 o GPUs con 16-24 GB para cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización de 8 o 4 bits, siempre que el runtime lo soporte.
- Opciones de despliegue: `transformers` de forma nativa; vLLM, TGI o llama.cpp/Ollama requerirían soporte para la arquitectura `Qwen3_5ForConditionalGeneration` y para el componente de visión, que no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Piccolo-4B-VL | 4,66B | no disponible | Apache 2.0 | Safetensors | Multimodal imagen-texto, arquitectura Qwen3.5 |
| Piccolo-4B | no disponible | no disponible | Apache 2.0 | Safetensors | Variante solo texto de la misma familia, orientada a decisiones |
| Qwen2.5-VL-3B / 7B | 3B / 7B | no disponible en esta ficha | Apache 2.0 (según variante) | Safetensors, GGUF | Familia multimodal de referencia de Alibaba; comparación no verificada con datos de esta ficha |
| Gemma 3 4B | 4B | no disponible en esta ficha | Gemma license | Safetensors, GGUF | Alternativa multimodal de tamaño similar; licencia no Apache |

La comparación con modelos de terceros no puede completarse con datos verificados en la información proporcionada; los valores de contexto y rendimiento de las alternativas se indican como no disponibles.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al no publicarse la composición del dataset de entrenamiento no es posible evaluar sesgos de género, idioma o dominio.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de decisión estructurada conviene usar las probabilidades por candidato y umbrales de confianza en lugar de aceptar la salida directamente.
- Longitud de contexto e idiomas soportados no documentados: no se debe asumir un contexto largo ni cobertura multilingüe sin verificación empírica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo incorpora posiblemente componentes derivados de Qwen3.5; conviene revisar las obligaciones de atribución de la familia base.
- El fichero `model-frozen-mtp.safetensors` no está descrito en la model card; su comportamiento en inferencia (si se carga o se ignora) debe validarse antes de producción.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni reportes de fallos.
- Compatibilidad con runtimes distintos de `transformers` (vLLM, llama.cpp, TGI) no confirmada para esta arquitectura y componente de visión.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-4B-VL
- Repositorio GitHub de la familia Piccolo: https://github.com/agentscope-ai/Piccolo
- Checkpoint Piccolo-4B (solo texto): https://huggingface.co/agentscope-ai/Piccolo-4B
