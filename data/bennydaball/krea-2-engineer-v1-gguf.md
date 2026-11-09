# BennyDaBall/Krea-2-Engineer-V1-GGUF

## Resumen

Krea-2-Engineer V1 GGUF es un modelo de lenguaje de 4.022 millones de parámetros (aproximadamente 4B) especializado en la reescritura y composición de prompts para generación de imágenes. Lo desarrolla BennyDaBall como un fine-tune experimental de la torre de texto del codificador Qwen3-VL que emplea el modelo de difusión krea/Krea-2-Turbo. El modelo no genera imágenes: su tarea es convertir una semilla breve y pobre ("a rock", "cyberpunk alley") en un prompt cinematográfico detallado en inglés de entre 180 y 250 palabras, listo para pegarse en un flujo de ComfyUI o en el propio Krea-2.

El repositorio empaqueta esa torre de texto como un GGUF estándar con arquitectura Qwen3 (sin tensores de visión), de modo que puede cargarse como un LLM causal corriente en LM Studio o llama.cpp sin compilaciones personalizadas. Es importante subrayar que este GGUF no sirve como text encoder de ComfyUI para Krea-2: el tipo CLIP `krea2` exige la pila completa de 12 capas ocultas de Qwen3-VL-4B (12 × 2560 = 30.720 características) más el vision tower, y este archivo entrega únicamente 2.560 características, por lo que el sampler falla.

Su relevancia práctica es doble: por un lado demuestra que el codificador de un modelo de difusión moderno puede reciclarse como asistente de prompting; por otro, ofrece una vía ligera (2,5 GB en Q4_K_M) para mejorar la calidad de los prompts en pipelines de imagen sin depender de APIs externas. La licencia es la Krea 2 Community License, no una licencia open source estándar, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (torre de texto de Qwen3-VL, reempaquetada como LM causal) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | Krea 2 Community License Agreement (license: other) |
| Formato de pesos | GGUF |
| Modelo base | krea/Krea-2-Turbo (torre de texto) |
| Tamano del repositorio | 24,8 GB (escalera completa de cuantizaciones) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es la torre de texto del codificador Qwen3-VL-4B que Krea-2-Turbo utiliza para condicionar la difusión, reempaquetada como un Qwen3 causal estándar (`general.architecture: qwen3`) y sin los tensores del vision tower. El fine-tune lo realizó BennyDaBall sobre un corpus de reescritura de prompts, presumiblemente con PEFT, según los agradecimientos de la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO.

La innovación técnica no está en la arquitectura, que es un transformer denso convencional de Qwen3, sino en el enfoque: reutilizar el codificador de un modelo de difusión como generador de prompts. El comportamiento está fuertemente condicionado por el system prompt con el que se entrenó, que instruye al modelo a producir un único párrafo autocontenido de 180-250 palabras con jerarquía visual, relaciones primer plano/fondo, dirección y calidad de luz, textura de materiales, paleta, atmósfera y lenguaje cinematográfico controlado, evitando pilas de etiquetas y secciones de prompt negativo. La model card advierte de que el system prompt menciona "Z-Image-Turbo" por razones cosméticas (mismo corpus de entrenamiento V7) y que el modelo responde mejor al texto exacto que vio durante el entrenamiento.

## Capacidades

- Generación de prompts de imagen en lenguaje natural: transforma semillas breves en párrafos descriptivos de 180-250 palabras con vocabulario cinematográfico.
- Composición visual estructurada: jerarquía visual, relaciones de profundidad, encuadre, lentes, dirección e intensidad de la luz, texturas y paleta de color.
- Preservación de restricciones explícitas: mantiene sujetos, objetos, relaciones, recuentos, nombres, texto escrito, acciones y restricciones de estilo o seguridad presentes en la semilla.
- Uso de restricciones en positivo: describe lo que debe aparecer en lugar de generar fragmentos de prompt negativo.
- Conversación de un solo turno orientada a la tarea: el modelo está pensado para recibir una semilla y devolver un prompt final, no para diálogo abierto.
- Salida limpia: sin etiquetas de prompt, alternativas, disculpas, trazas de razonamiento ni secciones de prompt negativo.
- Compatibilidad con endpoints y con el ecosistema llama.cpp / LM Studio.
- Capacidades multilingües: limitadas al inglés según la model card.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio de forma declarada en la información disponible.

## Casos de uso

- Mejora de prompts en ComfyUI: el usuario escribe una semilla corta en un nodo de texto y el modelo la expande a un prompt cinematográfico que se pega en el flujo de Krea-2. Es adecuado porque el fine-tune se hizo precisamente sobre el corpus de reescritura que alimenta a ese codificador.
- Preprocesado por lotes de prompts: en un pipeline que genere cientos de imágenes, un script puede enviar cada semilla al modelo servido con llama.cpp u Ollama y obtener prompts homogéneos en estilo antes de pasarlos al modelo de difusión.
- Asistente local de prompting en LM Studio: con Q4_K_M (2,5 GB) cabe en portátiles con GPU modesta o incluso en CPU, lo que permite iterar prompts sin conexión ni coste por token.
- Estandarización de estilo de un equipo o proyecto: fijando el system prompt de entrenamiento se consigue que todos los prompts generados compartan estructura (jerarquía, luz, material, paleta) y longitud, lo que reduce la varianza entre operadores.
- Educación y formación en prompt engineering: sirve para mostrar de forma tangible cómo una semilla pobre se convierte en una descripción visual completa, comparando la semilla y la salida.
- Generación de descripciones visuales para catalogación o guiones gráficos: dado un concepto breve, produce un párrafo descriptivo reutilizable como texto de storyboard o de ficha de concepto, siempre en inglés.
- Integración en herramientas propias vía API compatible con OpenAI: el tag `endpoints_compatible` permite exponerlo con servidores compatibles y llamarlo desde una aplicación de escritorio o web de generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K 1,6 GB; Q3_K_M 1,9 GB; Q4_K_M 2,5 GB; Q5_K_M 2,9 GB; Q6_K 3,1 GB; Q8_0 4,0 GB; F16 7,5 GB. Añadir margen para la caché KV según la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores para cuantizaciones altas y contextos largos. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, pero funcionan sin problema.
- Cabe en GPU consumer: sí, desde tarjetas de 4 GB en Q4_K_M; en Q2_K y Q3_K_M puede ejecutarse incluso en iGPU o en CPU.
- Opciones de despliegue: LM Studio (vía de referencia de la model card), llama.cpp, Ollama y servidores compatibles con endpoints OpenAI. No se documenta soporte de vLLM ni TGI para este GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 4B, la latencia será baja en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| Krea-2-Engineer V1 GGUF | aproximadamente 4B | no disponible | Reescritura de prompts para Krea-2 | Krea 2 Community License | GGUF |
| Qwen3-4B (base del backbone) | aproximadamente 4B | no disponible | LLM generalista | Apache 2.0 (según el modelo original de Qwen) | safetensors, GGUF |
| Qwen3-VL-4B (codificador completo) | aproximadamente 4B más vision tower | no disponible | Codificador multimodal para Krea-2 | según Krea/Qwen | safetensors, bf16 |

La comparación con Qwen3-4B es la más directa: mismo tamaño y misma arquitectura, pero el modelo de BennyDaBall está ajustado para una única tarea de reescritura de prompts y responde peor a usos generalistas. Frente a Qwen3-VL-4B completo, este GGUF pierde el vision tower y la pila de 12 capas ocultas, por lo que no puede usarse como text encoder de ComfyUI. No se dispone de datos de benchmarks que permitan comparar calidad de forma cuantitativa.

## Limitaciones y advertencias

- No es un text encoder de ComfyUI: cargarlo como CLIP de tipo `krea2` falla en el sampler porque entrega 2.560 características en lugar de las 30.720 esperadas. Para ComfyUI debe usarse `Krea2-Engineer-V1-bf16.safetensors` del repositorio principal.
- Modelo experimental y de primer intento: el autor lo califica explícitamente como experimental; no hay garantías de estabilidad ni de calidad en dominios alejados del corpus de entrenamiento.
- Solo inglés: la model card declara únicamente el idioma `en`; las semillas en castellano u otros idiomas pueden degradar la calidad de la salida.
- Dependencia del system prompt: el comportamiento está fuertemente condicionado por el prompt de sistema de entrenamiento; cambiarlo puede alterar formato y longitud de las respuestas.
- Riesgo de alucinación: puede introducir elementos, texturas o detalles no presentes en la semilla al expandirla; conviene revisar la salida antes de usarla en producción.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3-VL y de un corpus de prompts, puede reproducir sesgos estilísticos y culturales de ese corpus.
- Licencia restrictiva: la Krea 2 Community License Agreement no es una licencia open source estándar; es imprescindible revisar `LICENSE.pdf` antes de cualquier uso comercial o redistribución.
- No es un producto oficial de Krea: es un derivado modificado por BennyDaBall, sin respaldo de Krea.
- Sin datos de contexto ni de benchmarks: no se puede planificar el uso en conversaciones largas ni comparar su calidad de forma objetiva con alternativas.
- El repositorio ocupa 24,8 GB por incluir toda la escalera de cuantizaciones; conviene descargar solo el archivo necesario (Q4_K_M recomendado).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/Krea-2-Engineer-V1-GGUF
- Repositorio principal (pesos de imagen para ComfyUI): https://huggingface.co/BennyDaBall/Krea-2-Engineer-V1
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia (PDF): https://huggingface.co/BennyDaBall/Krea-2-Engineer-V1-GGUF/blob/main/LICENSE.pdf
- Licencia canónica de Krea: https://www.krea.ai
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
