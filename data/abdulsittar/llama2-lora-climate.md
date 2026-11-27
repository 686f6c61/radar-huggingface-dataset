# AbdulSittar/llama2-lora-climate

## Resumen

LoRA Climate es un adaptador LoRA (Low-Rank Adaptation) afinado sobre LLaMA 2 7B, desarrollado por Abdul Sittar y publicado en Hugging Face bajo licencia Apache 2.0. Su objetivo es la generación de texto y las tareas conversacionales especializadas en el dominio climático, manteniendo congelados los pesos del modelo base y entrenando únicamente los adaptadores de bajo rango. Se distribuye como un conjunto de archivos PEFT en formato safetensors, junto con el tokenizer y una plantilla de chat para inferencia.

El modelo no introduce una arquitectura nueva: hereda la del transformer decoder-only de LLaMA 2 7B (atención con RoPE, normalización RMSNorm y SwiGLU en las capas feed-forward) y añade adaptadores LoRA de rango bajo sobre determinadas proyecciones. El entrenamiento se realizó sobre el dataset Social Graph Inference Reddit, un corpus a gran escala extraído de Reddit que incluye agentes de dominio tecnológico, climático y de COVID, con más de un millón de publicaciones y comentarios por dominio.

La relevancia de esta ficha es doble. Por un lado, ilustra el patrón habitual de especialización de bajo coste mediante PEFT: un adaptador pequeño que reutiliza un modelo base ampliamente disponible. Por otro, conviene señalar que la información publicada es escasa: no se detallan hiperparámetros de entrenamiento, número de tokens, composición exacta del subconjunto climático ni resultados de evaluación, lo que limita cualquier valoración cuantitativa de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA 2 7B) con adaptadores LoRA |
| Parametros totales | 7 000 millones en el modelo base; el adaptador LoRA no especifica su número de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de LLaMA 2 7B, típicamente 4096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors) más tokenizer.model, tokenizer.json y configuración PEFT |

## Arquitectura y entrenamiento

El modelo base es LLaMA 2 7B, un transformer decoder-only con 7 000 millones de parámetros, atención multi-cabeza con codificación posicional rotatoria (RoPE), normalización RMSNorm y activación SwiGLU. Sobre esa arquitectura se aplica un ajuste fino con LoRA, que congela los pesos originales e introduce matrices de descomposición de bajo rango en un subconjunto de capas. El repositorio incluye `adapter_config.json` con la configuración LoRA, pero la model card no especifica el rango, el alpha, las capas objetivo ni la tasa de aprendizaje empleada.

El entrenamiento se realizó sobre el dataset Social Graph Inference Reddit (DOI 10.5281/zenodo.18082502), un corpus de Reddit estructurado en agentes por dominio, con más de un millón de posts y comentarios por dominio y redes dirigidas ponderadas de interacciones. La model card no detalla cuántos ejemplos del subconjunto climático se usaron, el número de tokens de entrenamiento, si hubo etapas de RLHF o DPO, ni la composición exacta del corpus de ajuste. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.); el interés técnico se limita al uso de PEFT como mecanismo de especialización de bajo coste.

## Capacidades

- Generación de texto en inglés orientada al dominio climático: cambio climático, energías renovables, políticas medioambientales y temas afines.
- Conversación multi-turno gracias a la plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento y generación de texto general, heredados del modelo base LLaMA 2 7B.
- Capacidad multilingüe limitada: la model card declara únicamente inglés, aunque LLaMA 2 tiene cierto conocimiento residual de otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Adecuado para investigación y simulación de conversaciones en el dominio climático según el autor.

## Casos de uso

- Asistente conversacional especializado en clima: el adaptador puede gestionar diálogos multi-turno sobre cambio climático y sostenibilidad usando la plantilla de chat incluida, aprovechando el conocimiento del dominio inyectado por el ajuste LoRA.
- Generación de material divulgativo: producción de borradores de artículos, resúmenes o explicaciones sobre impactos climáticos y energías renovables, con revisión humana posterior dado el riesgo de alucinación.
- Simulación de agentes sociales: el modelo se entrenó con un dataset de simulación de agentes en Reddit, por lo que puede emplearse para generar intervenciones sintéticas de agentes climáticos en experimentos de dinámica social.
- Investigación en PEFT: sirve como caso de estudio reproducible de ajuste LoRA sobre LLaMA 2 7B para un dominio vertical, útil para comparar configuraciones de adaptadores.
- Prototipado rápido de chatbots temáticos: al ser un adaptador pequeño sobre un base ampliamente disponible, permite desplegar un asistente climático sin reentrenar el modelo completo.
- Análisis de discurso climático en redes sociales: generación de respuestas o contraargumentos en el estilo del corpus de Reddit para estudios de comunicación y opinión pública.
- Filtrado y clasificación temática asistida: uso generativo para reformular o resumir contenido climático en pipelines de curación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio climático, ni comparaciones cuantitativas con otros adaptadores o con el modelo base.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (el repositorio figura con 0.0 GB por el redondeo de LFS, pero un adaptador típico de este tipo está en el orden de decenas a cientos de megabytes).
- Para inferencia es necesario cargar el modelo base LLaMA 2 7B completo, que en FP16 requiere aproximadamente 14 GB de VRAM.
- En cuantización de 8 bits, el modelo base se reduce a unos 7-8 GB de VRAM; en 4 bits (por ejemplo, con bitsandbytes), a unos 4-5 GB, más el overhead de activaciones y contexto.
- GPU recomendadas: A100 40 GB u 80 GB, H100 para despliegues de producción; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en FP16; en tarjetas de 8-12 GB (RTX 3060, RTX 4070) solo con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers con PEFT, vLLM (requiere fusionar o cargar el adaptador), TGI, llama.cpp y Ollama (previo merge del adaptador con el base y conversión a GGUF).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LoRA Climate (este) | 7B base + adaptador LoRA | No disponible | Apache 2.0 | Safetensors (PEFT) | Especializado en clima, solo inglés |
| LLaMA 2 7B Chat (Meta) | 7B | 4096 tokens | Licencia comunitaria LLaMA 2 | Safetensors, GGUF | Modelo base generalista; el adaptador se apoya en él |
| Mistral 7B Instruct | 7B | 8192 tokens | Apache 2.0 | Safetensors, GGUF | Alternativa generalista con contexto mayor y licencia permisiva |
| Zephyr 7B Beta | 7B | 8192 tokens | MIT | Safetensors, GGUF | Ajustado con DPO, orientado a instrucciones y chat |

La comparación es aproximada: no existen métricas publicadas del adaptador que permitan contrastar su rendimiento frente a estos modelos. La ventaja principal de LoRA Climate es su tamaño reducido y la reutilización del base LLaMA 2; su desventaja es la falta de documentación y evaluación.

## Limitaciones y advertencias

- Información de entrenamiento incompleta: no se especifican hiperparámetros LoRA, número de tokens ni composición exacta del subconjunto climático, lo que dificulta reproducir o auditar el ajuste.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base en el dominio climático.
- Riesgo de alucinación: como todo modelo generativo, puede producir afirmaciones falsas sobre datos climáticos, cifras o políticas; requiere verificación humana en contextos sensibles.
- Sesgos del corpus: el entrenamiento sobre Reddit introduce sesgos de la comunidad de esa plataforma (demografía, opiniones, ruido conversacional), que pueden reflejarse en las respuestas.
- Idioma: la model card declara únicamente inglés; el uso en castellano no está soportado oficialmente.
- Contexto limitado: hereda la ventana de LLaMA 2 7B (habitualmente 4096 tokens), insuficiente para documentos largos.
- Licencia: el adaptador es Apache 2.0, pero el uso del modelo base LLaMA 2 está sujeto a la licencia comunitaria de Meta, que impone restricciones adicionales (umbral de usuarios mensuales, uso comercial condicionado). Es imprescindible revisar ambas licencias antes de un despliegue comercial.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura en los metadatos (2026): conviene verificar la procedencia y vigencia del repositorio antes de adoptarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AbdulSittar/llama2-lora-climate
- Dataset Social Graph Inference Reddit (Zenodo): https://zenodo.org/records/18082502
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Proyecto TWON (financiación): https://twon-project.eu (referencia al proyecto 101095095 citado en la model card)
