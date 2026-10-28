# sanggusti/dmb-qwen2.5-7b-flywheel-v1

## Resumen

DMB Flywheel v1 es un ajuste fino supervisado (SFT) del modelo Qwen2.5-7B-Instruct desarrollado por el usuario sanggusti, orientado a una única tarea: actuar como política de navegación de un dron a partir de informes de percepción en texto. El modelo no procesa imágenes directamente; consume los informes textuales que genera la capa de percepción del sistema y emite comandos mediante tool calling con el formato Hermes. Se entrenó con 224 pares SFT extraídos de episodios "docentes" del banco de pruebas Disaster Mitigation Bench (DMB), filtrados por una puntuación compuesta igual o superior a 0,5.

Técnicamente es un LoRA de rango 16 aplicado durante 3 épocas con TRL 1.16 sobre una A10G, posteriormente fusionado en pesos completos bf16 y publicado en safetensors. El repositorio ocupa 15,2 GB y contiene 7.615.616.512 parámetros (unos 7,6 millardos). El ajuste no modifica la arquitectura del modelo base: sigue siendo un transformer decoder-only denso con atención de grupos de consultas (GQA).

Su relevancia es acotada y de carácter investigador: se trata de un artefacto derivado de la fase D de un benchmark concreto, con 0 descargas y 0 likes en el momento de redactar esta ficha, sin licencia declarada ni métricas publicadas en la model card. Resulta útil como referencia para quien trabaje en agentes de navegación basados en texto, políticas de decisión con tool calling o reproducibilidad de pipelines de fine-tuning sobre DMB, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con GQA, RoPE, SwiGLU y RMSNorm; heredada de Qwen2.5-7B-Instruct, sin cambios estructurales |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B), según los safetensors del repo |
| Longitud de contexto | 32.768 tokens según el modelo base Qwen2.5-7B-Instruct; no verificado ni declarado en la model card de este finetune |
| Tipos de cuantizacion | Solo se publican pesos en bf16 (safetensors). No hay versiones GGUF, AWQ, GPTQ ni EXL2 en el repositorio |
| Idiomas soportados | No disponible en la model card; se hereda la cobertura multilingüe del modelo base, sin evaluación específica |
| Licencia | No disponible. La model card no declara licencia para este finetune (el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (bf16, pesos fusionados tras el merge del LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 B de parámetros con atención por grupos de consultas, codificación posicional rotatoria y normalización RMSNorm, preentrenado y alineado por el equipo de Qwen. Sobre esa base se aplicó un LoRA de rango 16 durante 3 épocas con TRL 1.16 en una GPU A10G, y después se fusionó en pesos completos bf16. No se reportan datos de preentrenamiento, composición del corpus original ni detalles de las etapas de RLHF/DPO del modelo base, y este finetune no las modifica.

El corpus de ajuste es el dataset sanggusti/dmb-flywheel-v1, compuesto por 224 pares SFT generados a partir de episodios del profesor en Disaster Mitigation Bench (fase D, script `infra/modal/finetune.py`), seleccionados por una puntuación compuesta igual o superior a 0,5 y restringidos a las semillas de entrenamiento 1 a 20. Las condiciones de evaluación declaradas son `DMB_VISION=text`, backend simulado (mock) y tool calling en formato Hermes. La partición de retención corresponde a las semillas 101 a 110. No se documentan innovaciones arquitectónicas propias: el interés técnico está en el pipeline de destilación de episodios exitosos hacia una política textual, no en el modelo en sí.

## Capacidades

- Generación de comandos de navegación a partir de informes de percepción en texto, en el formato y vocabulario definidos por el entorno DMB.
- Tool calling en formato Hermes, requisito de las condiciones de evaluación declaradas por el autor.
- Razonamiento multi-paso dentro de un episodio: el agente recibe observaciones sucesivas y emite acciones hasta completar la tarea.
- Capacidades generales de lenguaje y código heredadas de Qwen2.5-7B-Instruct (comprensión lectora, generación de texto, matemáticas básicas, código), aunque sin evaluación específica tras el ajuste.
- Soporte multilingüe heredado del modelo base; no evaluado ni declarado para este finetune.
- No dispone de capacidades de visión: el propio autor especifica `DMB_VISION=text`, de modo que el modelo solo consume la representación textual de la percepción.
- No se documentan modo "thinking", audio, vídeo ni otras modalidades.

## Casos de uso

- Investigación en navegación de agentes: usar el modelo como política de referencia en el banco DMB con `DMB_VISION=text` y backend simulado, comparando la puntuación compuesta frente a Qwen2.5-7B-Instruct sin ajustar en las semillas 101 a 110.
- Reproducción de pipelines de fine-tuning: el par modelo + dataset permite repetir el entrenamiento LoRA (r16, 3 épocas, TRL) y verificar la influencia del filtrado por puntuación compuesta ≥ 0,5.
- Desarrollo de capas de abstracción percepción-decisión: sirve para prototipar la interfaz entre un módulo de visión y un planificador textual, ya que el modelo asume que la percepción llega como texto estructurado.
- Pruebas de integración de tool calling: al estar entrenado con el formato Hermes, es útil para validar parsers, orquestadores de agentes y bucles de ejecución de herramientas en entornos controlados.
- Evaluación de robustez frente a cambios de semilla: las semillas 101 a 110 permiten medir degradación de la política cuando el episodio se desvía de la distribución de entrenamiento (semillas 1 a 20).
- Docencia y experimentación sobre destilación de políticas: el caso ilustra cómo destilar episodios exitosos de un profesor en un modelo de 7 B sin reentrenar desde cero.
- Generación de texto y código de propósito general: posible gracias a la base Qwen2.5-7B-Instruct, aunque el ajuste puede haber desplazado la distribución hacia el dominio de navegación y no hay evaluación que cuantifique esa degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el delta entre el modelo base y el ajustado puede consultarse en la documentación del banco de pruebas para las semillas 101 a 110, pero no incluye cifras, y no se proporcionan resultados de MMLU, HumanEval, GSM8K ni de la métrica compuesta de DMB. No se debe asumir ninguna mejora sin esos datos.

## Requisitos de hardware

- VRAM estimada en bf16: unos 15,2 GB solo de pesos, más 2-4 GB de memoria de activaciones y caché KV según longitud de contexto y tamaño de lote; en la práctica, 18-24 GB para inferencia cómoda.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G (24 GB) funcionan sin problema; el propio autor entrenó con A10G.
- GPU de consumo: cabe en bf16 en RTX 3090, RTX 4090 y RTX 5090 (24-32 GB). En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) requiere cuantización o descarga parcial de capas.
- Cuantización: no hay GGUF ni AWQ/GPTQ publicados, así que para usar llama.cpp, Ollama o LM Studio es necesario convertir los safetensors a esos formatos por cuenta propia. En 8 bits los pesos bajan a ~8 GB y en 4 bits a ~4-5 GB, con pérdida de calidad no evaluada en este finetune.
- Despliegue: vLLM y TGI soportan la arquitectura Qwen2; también es viable transformers + accelerate. Para el bucle de agente con tool calling conviene usar el chat template de Qwen2.5 y un parser Hermes.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sanggusti/dmb-qwen2.5-7b-flywheel-v1 | 7,6 B (denso) | 32.768 tokens (heredado, no declarado) | No disponible | safetensors bf16, 0 descargas | Ajuste de dominio para navegación textual en DMB |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B (denso) | 32.768 tokens | Apache 2.0 | safetensors, ampliamente adoptado | Modelo base; capacidades generales y tool calling |
| meta-llama/Llama-3.1-8B-Instruct | 8 B (denso) | 131.072 tokens | Llama 3.1 Community License | safetensors, ecosistema amplio | Mayor ventana de contexto; licencia con restricciones de uso |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 B (denso) | 32.768 tokens | Apache 2.0 | safetensors, GGUF comunitarios | Alternativa ligera con tool calling rudimentario |

No hay datos públicos que permitan comparar el rendimiento de este finetune con esas alternativas en la tarea de navegación de DMB; la comparación de la tabla se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado sobre 224 pares SFT de un único dominio; su comportamiento fuera de DMB no está caracterizado y probablemente degrade frente al base.
- No dispone de percepción visual propia: depende por completo de la calidad de los informes textuales que le entregue el sistema externo.
- Sesgos conocidos: no documentados por el autor; cabe esperar los heredados de Qwen2.5-7B-Instruct más los inducidos por el filtrado de episodios exitosos, lo que puede generar una política excesivamente optimista sobre su propia tasa de éxito.
- Riesgo de alucinación de acciones o de nombres de herramientas en el formato Hermes si la observación se sale de la distribución de las semillas 1 a 20; no hay evaluación de robustez publicada.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial, y la condición del modelo base (Apache 2.0) no se traslada automáticamente al finetune.
- El repositorio no incluye versiones cuantizadas ni plantillas de despliegue, lo que añade trabajo de conversión y validación antes de producción.
- La model card no documenta idiomas, límites de contexto efectivos, ni el impacto del merge del LoRA en las capacidades generales.
- Evaluación declarada únicamente con backend simulado (`mock`), no en vuelo real; los resultados no garantizan comportamiento seguro en navegación física.
- No debe emplearse como controlador de un dron real sin capas de seguridad externas, validación de comandos y pruebas en simulación de alta fidelidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanggusti/dmb-qwen2.5-7b-flywheel-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/sanggusti/dmb-flywheel-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Otros enlaces (paper, blog, repositorio o demo del banco DMB): no disponibles en la información proporcionada. Los resultados de la búsqueda web recibidos no guardan relación con el modelo y se han descartado.
