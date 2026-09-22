# LeoZotos/OLMo-2-0425-1B-fineweb-bio-textbooks-cpt

## Resumen

`LeoZotos/OLMo-2-0425-1B-fineweb-bio-textbooks-cpt` es un checkpoint de preentrenamiento continuado (CPT) publicado por el usuario LeoZotos sobre el modelo base OLMo-2-0425-1B. El ajuste introduce un corpus de libros de texto de biología (`LeoZotos/bio_textbooks`) para estudiar cómo un modelo de ~1,48 mil millones de parámetros incorpora conocimiento de un dominio académico concreto a lo largo del entrenamiento.

El interés del repositorio no es tanto el modelo final como su metodología: la configuración de entrenamiento guarda checkpoints intermedios en las fracciones 25 %, 50 %, 75 % y 100 % del total de 818 pasos de actualización, lo que permite analizar dinámicas de aprendizaje (learning dynamics), adquisición de conocimiento de dominio y posible olvido catastrófico de capacidades generales. Se entrenó durante una única época sobre aproximadamente 53,6 millones de tokens sin padding, con una longitud de secuencia máxima de 2048.

Se trata, por tanto, de un modelo de lenguaje base adaptado a dominio, no de un modelo instruido ni alineado: no se ha sometido a RLHF, DPO ni SFT, y no se han publicado evaluaciones de rendimiento. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validación por parte de la comunidad. La licencia y los idiomas soportados no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia OLMo 2 (según el tag `olmo2`); detalles internos de capas no disponibles |
| Parametros totales | 1.484.916.736 (~1,48 mil millones, según safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2048 tokens durante el CPT (`max_seq_length`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponibles: solo se publican pesos en safetensors; no hay GGUF, AWQ, GPTQ ni variantes cuantizadas |
| Idiomas soportados | No disponibles (el corpus de entrenamiento son libros de texto, sin desglose lingüístico declarado) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 23,8 GB (muy superior al peso teórico del modelo; probablemente incluye checkpoints u optimizador) |

## Arquitectura y entrenamiento

La model card únicamente documenta la configuración del CPT, no la arquitectura interna. Por el identificador y los tags se trata de un derivado de OLMo-2-0425-1B (transformer decoder-only de ~1,48B parámetros); no se detallan número de capas, dimensión oculta, tipo de normalización, atención ni vocabulario, por lo que esos datos quedan como no disponibles en esta ficha.

El entrenamiento consistió en un preentrenamiento continuado sobre el corpus `LeoZotos/bio_textbooks` durante 1 época, con 818 pasos de actualización en total y 53.567.680 tokens no de padding en el checkpoint final. Hiperparámetros: `lr` 3e-5 con scheduler `cosine_with_min_lr` y `min_lr` 1e-5, `warmup_ratio` 0.03, `weight_decay` 0.01, `adam_beta2` 0.95, `batch_size` 4 con `gradient_accumulation_steps` 8 (lote efectivo de 32 secuencias), `max_seq_length` 2048, longitud de documento entre 50 y 3000 tokens, `gradient_checkpointing` activado y semilla 42. No se aplicó enmascaramiento de prompt (`mask_prompt_loss: false`) ni hubo corpus de QA (`training_qa_corpora` vacío). Se guardaron checkpoints intermedios en las fracciones 0,25, 0,5, 0,75 y 1,0, con un intervalo de 10 millones de tokens, aunque solo se publicó (presumiblemente) la revisión `fraction_100pct`.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje, heredadas del modelo base OLMo-2-0425-1B.
- Adaptación de dominio a contenido de biología y material de texto educativo, presumiblemente con mejor perplejidad en ese registro que el checkpoint base (no se aportan métricas que lo confirmen).
- Capacidad de servir como punto de partida para ajuste supervisado (SFT) o ajuste instruccional posterior.
- Utilidad para investigación en dinámicas de aprendizaje: los checkpoints por fracciones permiten trazar la evolución del conocimiento de dominio.
- Soporte de tool calling / function calling: no disponible, y en principio no esperable en un checkpoint de CPT sin instrucción.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se ha entrenado ni evaluado para ello.
- Capacidades multilingües: no declaradas; el corpus es de libros de texto sin desglose de idiomas.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Investigación en dinámicas de aprendizaje: comparar los checkpoints de 25 %, 50 %, 75 % y 100 % para medir cuándo aparece el conocimiento biológico de dominio y si se degradan capacidades generales (olvido catastrófico). Es el propósito explícito del repositorio y su razón de ser.
- Punto de partida para SFT educativo: aplicar ajuste supervisado sobre el checkpoint `fraction_100pct` para construir un asistente de estudio de biología, partiendo de un modelo que ya ha visto registro de libro de texto.
- Generación de material didáctico de biología (borradores de resúmenes, descripciones, glosarios) como modelo base, con revisión humana obligatoria por el riesgo de alucinación científica.
- Fine-tuning ligero para tareas de clasificación o extracción de terminología biomédica (por ejemplo, etiquetado de entidades en textos académicos), donde 1,5B parámetros bastan y el dominio ya está parcialmente interiorizado.
- Experimentos controlados de adaptación de dominio: usar esta receta (1 época, lr 3e-5, 818 pasos) como línea base reproducible para comparar con otros corpus o tamaños de modelo.
- Despliegue on-premise con recursos limitados: al caber holgadamente en una GPU de consumo, permite servir un modelo de dominio biológico en entornos educativos sin conexión ni coste de API.
- Evaluación de calidad de corpus: analizar qué se aprende de un conjunto de libros de texto y qué no, útil para quien diseña datos de preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica, ni evaluaciones comparativas con el modelo base. La configuración de entrenamiento define `eval_every_n_steps: 0` y listas de evaluación vacías, por lo que no se ejecutaron evaluaciones durante el CPT.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 3,0-3,5 GB solo de pesos, más caché KV (pequeña con contexto de 2048) y overhead de runtime; presupuestar 4-6 GB.
- VRAM estimada en fp32: aproximadamente 6 GB de pesos; presupuestar 8 GB.
- VRAM estimada en cuantización int8: ~1,5-2 GB; en 4 bits: ~0,8-1,2 GB (requiere convertir los pesos, ya que no se publican variantes cuantizadas).
- GPU recomendadas: cualquiera con 8 GB o más para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). A100, H100 y L40S son sobredimensionadas para inferencia, aunque útiles para reentrenar o hacer fine-tuning.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 8 GB o más; incluso en 4-6 GB con cuantización.
- Opciones de despliegue: transformers (referencia), vLLM, TGI y SGLang para servir en bf16. Para llama.cpp u Ollama sería necesario convertir a GGUF, conversión que no está publicada.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia.
- Nota de almacenamiento: el repositorio ocupa 23,8 GB, muy por encima de los ~3 GB de pesos en bf16, así que conviene revisar los ficheros antes de descargarlo completo (probablemente incluye estados de optimizador o checkpoints adicionales).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LeoZotos/OLMo-2-0425-1B-fineweb-bio-textbooks-cpt | 1,48B | 2048 (entrenamiento CPT) | No disponible | HuggingFace, safetensors | CPT de dominio, sin benchmarks |
| OLMo-2-0425-1B (modelo base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No se aportó enlace | Modelo de partida referenciado en la config como ruta local |
| Otras alternativas de ~1-2B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente en la documentación aportada para establecer una comparativa cuantitativa con alternativas de la misma categoría (TinyLlama, Qwen2.5-1.5B, SmolLM2 o Gemma-2-2B). Cualquier comparación requeriría ejecutar evaluaciones propias sobre el checkpoint.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento continuado, no un modelo instruido: no sigue instrucciones de forma fiable, no mantiene formato de chat y no soporta tool calling ni flujos de agente.
- Ausencia total de benchmarks: no hay ninguna evidencia publicada de calidad, y el propio autor desactivó la evaluación durante el entrenamiento (`eval_every_n_steps: 0`).
- Sin validación comunitaria: 0 descargas y 0 likes; el modelo es un artefacto de investigación, no un modelo probado en producción.
- Licencia no declarada: no se puede asumir uso comercial. La licencia del modelo base OLMo-2-0425-1B no se confirma en la información proporcionada, por lo que la cadena de derechos es incierta.
- Riesgo de alucinación: es especialmente relevante en contenido científico y educativo, donde una afirmación falsa tiene coste alto. Cualquier salida debe pasar revisión experta.
- Sesgo de dominio y de registro: el entrenamiento con libros de texto puede desplazar el estilo hacia un tono académico y reducir la cobertura de otros registros; además, el corpus puede heredar sesgos de contenido de los materiales originales.
- Posible olvido catastrófico: una época sobre un corpus estrecho puede degradar capacidades generales del modelo base. No hay evaluaciones que cuantifiquen esa pérdida.
- Limitación de contexto: 2048 tokens durante el CPT restringen tareas de contexto largo, como resumir documentos extensos o mantener conversaciones multi-turno largas.
- Idiomas no declarados: no hay garantía de comportamiento en castellano ni en ningún otro idioma distinto del dominante en el corpus, presumiblemente inglés.
- Inconsistencia en metadatos: la fecha de creación indicada (2026-09-22) es futura respecto a la fecha habitual de publicación, y el tamaño del repositorio (23,8 GB) no cuadra con el peso del modelo, lo que sugiere ficheros auxiliares que conviene inspeccionar.
- Los resultados de la búsqueda web asociada no contienen información relevante sobre el modelo: todas las entradas devueltas tratan sobre Google Maps.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeoZotos/OLMo-2-0425-1B-fineweb-bio-textbooks-cpt
- Dataset de entrenamiento referenciado en la configuración: `LeoZotos/bio_textbooks` (no se proporcionó URL directa)
- Modelo base referenciado en la configuración: OLMo-2-0425-1B (aparece como ruta local `/scratch-shared/lzotos/local_models/...`, sin enlace en la información disponible)
- Paper, blog, repositorio o demo del autor: no disponibles
- Resultados de la búsqueda web: no relevantes (contenido sobre Google Maps, sin relación con el modelo)
