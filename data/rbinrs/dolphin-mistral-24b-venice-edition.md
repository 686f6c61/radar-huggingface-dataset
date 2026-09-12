# rbinrs/Dolphin-Mistral-24B-Venice-Edition

## Resumen

Dolphin Mistral 24B Venice Edition es un ajuste fino (finetune) del modelo Mistral Small 3 24B Instruct 2501 de Mistral AI, desarrollado por el equipo de Dolphin (dphn.ai) en colaboracion con Venice.ai. Su objetivo declarado es crear la version mas "descensurada" (uncensored) de Mistral 24B para integrarla en el ecosistema de Venice, donde se ha desplegado como modelo por defecto bajo el nombre "Venice Uncensored". El modelo se entreno sobre 8 GPU B200 proporcionadas por Targon.

Tecnicamente es un transformer denso decoder-only de 24.011.361.280 parametros, con soporte multimodal de imagen a texto (hereda la capacidad de vision de la familia Mistral Small 3) y plantilla de chat V7-Tekken de Mistral. El repositorio consultado, publicado por el usuario rbinrs, es una redistribucion del modelo original del equipo Dolphin; la model card hace referencia al ID `dphn/Dolphin-Mistral-24B-Venice-Edition` en los ejemplos de despliegue con vLLM.

La relevancia de esta ficha es doble. Por un lado, ilustra una tendencia de modelos "steerables" en los que la alineacion no viene impuesta por el proveedor, sino que se configura mediante el system prompt, lo que da al propietario del sistema control sobre el tono, las reglas y el tratamiento de datos. Por otro, es un ejemplo de redistribucion de pesos con licencia Apache 2.0 y de despliegue en produccion con vLLM, tool calling nativo y ventana de contexto configurable hasta 131.072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Mistral Small 3 / tag `mistral3`), multimodal image-text-to-text |
| Parametros totales | 24.011.361.280 (~24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | El modelo base Mistral Small 3 Instruct 2501 declara 32.768 tokens; la model card de esta edicion configura `--max-model-len 131072` en vLLM (128k), extremo no confirmado oficialmente |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; el repositorio ocupa 48,1 GB, compatible con bf16/fp16). Compatible con FP8, INT8 e INT4 mediante herramientas externas (vLLM, llama.cpp) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; hereda los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`); no se confirma la presencia de GGUF en el repositorio indicado |

Otros datos: pipeline `text-generation`, tags `endpoints_compatible`, `region:us`; creado y actualizado el 2026-09-12; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de Mistral Small 3 Instruct 2501, un transformer denso decoder-only de 24B parametros con atencion por grupos de consultas (GQA), normalizacion RMSNorm, activacion SwiGLU y tokenizador Tekken (la model card cita la plantilla "V7-Tekken"). Sobre esa base, Dolphin ha realizado un finetune orientado a eliminar el comportamiento de rechazo y a hacer que la alineacion dependa exclusivamente del system prompt. El entrenamiento se ejecuto en 8 GPU B200 cedidas por Targon; no se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO o preferencia directa.

La innovacion principal no es arquitectonica sino de comportamiento: el modelo conserva la plantilla de chat por defecto de Mistral, de modo que el propietario del sistema define el tono y las reglas mediante el system prompt. La model card incluye un ejemplo de prompt de sistema para maximizar el modo sin censura y recomienda temperatura baja (`temperature=0.15`) para obtener respuestas mas deterministas. El modelo mantiene ademas las capacidades multimodales del base (entrada de imagenes, con limite configurable de 10 imagenes por prompt en vLLM) y el soporte de tool calling con parser de Mistral.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y otros idiomas (no se declara lista oficial).
- Razonamiento generalista de proposito general, al estilo de asistentes tipo ChatGPT, Claude o Gemini, segun la propia model card.
- Comprension de imagenes (image-text-to-text), hasta 10 imagenes por prompt en la configuracion de vLLM indicada.
- Tool calling / function calling nativo, con `--tool-call-parser mistral` y `--enable-auto-tool-choice` en vLLM.
- Flujos de agente y razonamiento multi-paso gracias al soporte de herramientas y a la ventana de contexto ampliable.
- Control total de la alineacion mediante system prompt (definicion de personaje, tono, reglas y estilo).
- Capacidad de seguir formatos estrictos y responder con salidas concretas (por ejemplo, finalizar con un dibujo ASCII, como muestra el ejemplo de la model card).
- No se declara modo "thinking" explicito, soporte de audio ni otras modalidades adicionales mas alla de texto e imagen.

## Casos de uso

- Asistentes conversacionales autoalojados con marca propia: el modelo permite fijar el tono y las politicas de respuesta desde el system prompt, de modo que una empresa puede desplegar un asistente con su propia voz sin depender de cambios silenciosos en la alineacion del proveedor.
- Generacion de codigo integrada en pipelines de CI/CD: soporta tool calling con parser de Mistral y puede invocarse desde vLLM para tareas de refactorizacion, generacion de tests o revision de parches.
- Agentes automatizados con herramientas externas: la combinacion de function calling y contexto largo permite cadenas de varios pasos que consultan bases de datos, APIs internas o sistemas de tickets.
- Procesamiento de documentos con imagenes: al aceptar entradas de imagen, puede extraer informacion de capturas, diagramas o formularios escaneados en flujos de digitalizacion.
- Analisis y resumen de conversaciones largas: con la configuracion de 131.072 tokens en vLLM, es viable procesar hilos de soporte o transcripciones extensas sin troceado agresivo.
- Generacion creativa y de fiction sin filtros de rechazo: util en estudios de guion, narrativa o juegos de rol donde se necesita explorar contenido adulto o controvertido bajo responsabilidad del operador.
- Investigacion sobre alineacion y seguridad: sirve como referencia de modelo "uncensored" para estudiar comportamiento, sesgos y eficacia de distintos system prompts, comparandolo con su base alineado.
- Bases de conocimiento internas con privacidad: al ejecutarse en infraestructura propia, las consultas no salen del perimetro del operador, algo que la model card destaca frente a APIs propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones equivalentes, ni comparaciones numericas con Mistral Small 3 Instruct 2501 o con otros modelos. Tampoco los resultados de busqueda web aportados contienen datos de evaluacion (las entradas recuperadas no guardan relacion con el modelo).

## Requisitos de hardware

- Pesos en bf16/fp16: ~48 GB solo para pesos; la propia model card indica que ejecutarlo en GPU requiere mas de 60 GB de memoria grafica. Una H100 80GB o A100 80GB pueden alojarlo en una sola tarjeta con margen limitado para KV cache.
- Configuracion de referencia en la model card: `tensor_parallel_size=8` con vLLM, es decir, reparto entre 8 GPU. Alternativa con 2 GPU de 48 GB (por ejemplo 2x A6000, 2x L40S) o 2x A100 40GB en tensor parallel.
- Cuantizacion FP8: ~24-26 GB, viable en una RTX 4090 de 24 GB con margen muy ajustado o en GPU profesionales de 48 GB.
- Cuantizacion INT4 (AWQ/GPTQ/GGUF Q4_K_M): aproximadamente 13-15 GB, lo que permite ejecucion en RTX 4090, RTX 3090 o RTX 5090 de 24 GB de forma holgada.
- Consumer GPU: no cabe en bf16 en ninguna GPU de consumo actual; si cabe cuantizado en 4 bits en tarjetas de 24 GB de VRAM y, con menor calidad, en configuraciones de 16 GB con cuantizaciones mas agresivas.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--runner generate`, `--tool-call-parser mistral`, `--enable-auto-tool-choice` y `--limit-mm-per-prompt '{"image": 10}'`), SGLang, TGI, llama.cpp, Ollama y LM Studio. Requiere `transformers` actualizado y `tokenizer_mode="mistral"` en vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada. La recomendacion de temperatura baja (0.15) y las 8 GPU B200 del entrenamiento no implican cifras de inferencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Alineacion / notas |
|---|---|---|---|---|---|
| Dolphin Mistral 24B Venice Edition | ~24B densos | 32k en el base; 131.072 configurable en vLLM (no confirmado) | Texto e imagen | Apache 2.0 | Sin censura por defecto; alineacion delegada al system prompt |
| Mistral Small 3 Instruct 2501 (base) | ~24B densos | 32.768 tokens | Texto e imagen | Apache 2.0 | Alineado por el fabricante; es el punto de partida del finetune |
| Qwen2.5-32B-Instruct | ~32B densos | No disponible en esta ficha | Texto | Apache 2.0 (segun version) | Alineado por el fabricante; mayor numero de parametros |
| Gemma 3 27B Instruct | ~27B densos | No disponible en esta ficha | Texto e imagen | Licencia de uso de Gemma (no Apache 2.0) | Alineado por el fabricante; licencia con restricciones de uso |

No hay datos de rendimiento comparado en la informacion disponible, por lo que la comparacion se limita a parametros, modalidad, contexto declarado y licencia. Cualquier afirmacion sobre calidad relativa requeriria evaluaciones propias.

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: las salvaguardas habituales se han reducido de forma intencionada. Sin un system prompt que fije reglas, el comportamiento por defecto puede resultar inadecuado para productos orientados al publico general.
- Riesgo elevado de contenido danino, ilegal o eticamente problematico si no se aplican filtros propios; la responsabilidad de la moderacion recae por completo en el operador.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad, veracidad ni tasas de error en tareas factuales.
- Ausencia total de benchmarks en la informacion disponible: no es posible estimar la degradacion respecto al modelo base Mistral Small 3 Instruct 2501 provocada por el finetune sin censura.
- Idiomas soportados no declarados; el comportamiento multilingue fuera del ingles no esta verificado por el autor.
- Contexto: el modelo base declara 32.768 tokens; la configuracion de 131.072 tokens en vLLM no viene acompanada de evidencia publicada sobre calidad de recuperacion en esa longitud.
- Licencia Apache 2.0 en el repositorio del redistribuidor, heredada del base; conviene verificar la cadena de custodia de pesos y que el uso comercial cumple tambien las condiciones del modelo original de Mistral.
- Repositorio de terceros: el ID consultado (`rbinrs/Dolphin-Mistral-24B-Venice-Edition`) no es el repositorio oficial del equipo Dolphin citado en la model card (`dphn/Dolphin-Mistral-24B-Venice-Edition`). Para produccion es preferible usar el repositorio del autor original.
- Cifras de adopcion nulas en el momento de la consulta (0 descargas, 0 likes) y fechas de publicacion poco habituales; sin validacion externa de la comunidad.
- Despliegue exigente en memoria: mas de 60 GB de VRAM en precision completa segun la propia model card, lo que descarta GPU de consumo sin cuantizacion.
- Los resultados de busqueda web aportados no contienen informacion relevante sobre el modelo; toda la ficha se basa en la model card y en los metadatos de HuggingFace.

## Enlaces

- Repositorio HuggingFace consultado (redistribucion por rbinrs): https://huggingface.co/rbinrs/Dolphin-Mistral-24B-Venice-Edition
- Repositorio oficial del autor citado en la model card: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Sitio web de Dolphin: https://dphn.ai
- Perfil en X/Twitter: https://x.com/dphnAI
- Chat web: https://chat.dphn.ai
- Bot de Telegram: https://t.me/DolphinAI_bot
- Venice.ai: https://venice.ai/
- Targon (proveedor de computo del entrenamiento): https://targon.com/
- Repositorio de vLLM: https://github.com/vllm-project/vllm
