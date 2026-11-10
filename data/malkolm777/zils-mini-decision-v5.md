# malkolm777/zils-mini-decision-v5

## Resumen

zils-mini-decision-v5 es un modelo de decisión especializado, publicado por el usuario malkolm777 en Hugging Face, construido sobre la familia Qwen3.5-4B (cuerpo d3-mini) y orientado al pool mini de la subnet 127 de Zils. No es un modelo conversacional generalista: su pipeline declarado es `feature-extraction` y su propósito es emitir decisiones estructuradas dentro del formato definido por el ecosistema Zils, probablemente para tareas de clasificación, enrutado o selección de acciones a partir de entradas textuales.

Técnicamente se obtiene por fine-tuning con LoRA (rango 16, AdamW con learning rate 2e-5) sobre una media uniforme de dos modelos previos, qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-sx8, ambos con licencia Apache-2.0. El entrenamiento utiliza las particiones de train de un conjunto amplio de datasets públicos convertidos al formato de decisión de Zils: MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, CommonsenseQA, TweetEval, 20Newsgroups y function calling de Glaive, además de los exámenes semilla públicos de Zils v1, v2 y v4.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y un repositorio de 9,1 GB en safetensors. Es relevante ahora por dos motivos: primero, porque ejemplifica la tendencia de modelos pequeños y especializados en tareas de decisión y enrutado dentro de subredes descentralizadas; segundo, porque su licencia Apache-2.0 y su tamaño permiten desplegarlo en hardware modesto, aunque su adopción real es todavía prácticamente nula (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-4B, cuerpo d3-mini); requiere `custom_code` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 9,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen3.5-4B, referido en la model card como "d3-mini decision body". El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga del modelo requiere código personalizado del autor y no basta con una clase estándar de transformers. El modelo parte de una mezcla (soup) por media uniforme de pesos de dos fine-tunes previos, qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-sx8, y sobre esa base se aplica un ajuste LoRA de rango 16 con AdamW y learning rate 2e-5.

El corpus de entrenamiento son las particiones de train de datasets públicos convertidos al formato de decisión de Zils: MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, CommonsenseQA, TweetEval, 20Newsgroups y Glaive function calling, más los exámenes semilla públicos de Zils v1, v2 y v4. No se especifican el número de tokens de entrenamiento, la composición exacta por dataset, ni si hubo fases de RLHF o DPO; la información disponible solo describe el ajuste supervisado con LoRA.

## Capacidades

- Emisión de decisiones estructuradas en el formato definido por Zils, orientado a tareas de clasificación y enrutado.
- Clasificación de texto y análisis de sentimiento, derivados de los datos de GLUE, poem_sentiment, iSarcasm, titulares de sarcasmo y TweetEval.
- Razonamiento de sentido común y respuesta a preguntas, a partir de CommonsenseQA, BoolQ y MMLU.
- Razonamiento aritmético básico, derivado de GSM8K y SVAMP.
- Inferencia de lenguaje natural (NLI) con ANLI.
- Clasificación de intenciones en dominios de banca y atención al cliente, a partir de Banking77 y CLINC150.
- Function calling y decisión de cuándo invocar herramientas, a partir de When2Call y Glaive function calling.
- Clasificación temática de documentos, a partir de 20Newsgroups.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Enrutado de peticiones en un pipeline de agentes: el modelo puede recibir la consulta del usuario y emitir una decisión de qué herramienta o submodelo invocar, apoyándose en el entrenamiento con When2Call y Glaive function calling.
- Clasificación de intenciones en atención al cliente: con datos de Banking77 y CLINC150, puede etiquetar tickets o mensajes entrantes en categorías predefinidas antes de derivarlos al equipo correspondiente.
- Moderación y análisis de sentimiento en redes sociales: su ajuste con TweetEval, iSarcasm y titulares de sarcasmo lo hace adecuado para detectar tono, ironía y polaridad en textos cortos.
- Filtrado y priorización de documentación: con 20Newsgroups y GLUE puede clasificar documentos por temática o relevancia dentro de un sistema de gestión documental.
- Verificación de coherencia en respuestas de otros modelos: usando ANLI y BoolQ, puede actuar como juez ligero que decide si una afirmación se sigue de una premisa dada.
- Evaluación automática de razonamiento aritmético: con GSM8K y SVAMP, puede clasificar la corrección de soluciones numéricas en pipelines de evaluación de modelos.
- Selección de respuesta en sistemas de QA: con MMLU y CommonsenseQA, puede puntuar o elegir entre opciones candidatas en tareas de opción múltiple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 9 GB solo para pesos, más overhead de activaciones y del código personalizado; se recomienda un mínimo de 12-16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos, con un mínimo práctico de 8-10 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3 GB de pesos, con un mínimo práctico de 6-8 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16 en una sola GPU.
- GPU de consumo: cabe en tarjetas con 8 GB o más si se cuantiza a 4 u 8 bits; en fp16 requiere al menos 12 GB, por lo que una RTX 3060 de 12 GB sería el mínimo razonable.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía soportada por el autor; vLLM, TGI, llama.cpp y Ollama no están confirmados y dependen de que el código personalizado sea compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-decision-v5 | 4,54 B | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face (0 descargas) |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | Decisión (Zils) | Apache-2.0 | Hugging Face |
| Charlie320/zils-mini-sx8 | no disponible | no disponible | Decisión (Zils) | Apache-2.0 | Hugging Face |
| Qwen3.5-4B (familia base) | ~4 B | no disponible | Generación general | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en el formato de decisión de Zils; no es un modelo conversacional general y su uso fuera de ese formato puede degradar la calidad de salida.
- Requiere `custom_code` y `trust_remote_code=True`, lo que implica ejecutar código del autor y añade superficie de riesgo en producción.
- No se documentan sesgos conocidos, pero el entrenamiento con datasets públicos diversos (redes sociales, banca, noticias) puede heredar sesgos de esos corpus.
- Riesgo de alucinación no cuantificado; al ser un modelo de decisión, los errores se manifestarán como etiquetas o decisiones incorrectas más que como texto inventado.
- No se especifican los idiomas soportados; se desconoce si funciona correctamente fuera del inglés.
- No se publica la longitud de contexto, lo que impide garantizar el comportamiento con entradas largas.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo NOTICE y LICENSE del repositorio por posibles atribuciones adicionales.
- El modelo tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación externa ni de uso en producción.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-mini-decision-v5
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base 2: https://huggingface.co/Charlie320/zils-mini-sx8
