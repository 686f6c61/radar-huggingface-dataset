# Jongbin-kr/llama-3.1-8b-instruct_lbox-criminal-property_ffn-only

## Resumen

El modelo `llama-3.1-8b-instruct_lbox-criminal-property_ffn-only` es un fine-tuning supervisado (SFT) del modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por Jongbin-kr. El nombre sugiere una especialización en el ámbito de la propiedad criminal (incautación de bienes, delitos patrimoniales o casos legales relacionados), aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni sobre el rendimiento en dichas tareas. La etiqueta "ffn-only" indica que el ajuste se ha realizado únicamente sobre las capas feed-forward del transformer, dejando congeladas las capas de atención, lo que reduce el número de parámetros entrenables y el tamaño del artefacto resultante (0,8 GB).

Se trata de un adaptador o checkpoint parcial que requiere cargar el modelo base completo para su uso. Aunque hereda las capacidades generales de Llama 3.1 8B Instruct (razonamiento, generación de texto, soporte multilingüe, etc.), no existe documentación pública que valide su eficacia en el dominio legal específico. Es un modelo de nicho, probablemente orientado a investigación o prototipos, pero con una documentación muy escasa que limita su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basado en Llama 3.1 8B, con ajuste parcial de capas FFN |
| Parametros totales | No disponible (el modelo base tiene 8,03 mil millones, el adaptador no especifica los entrenables) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base: 128K tokens, no confirmada en la ficha del repo) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | No disponibles (heredados del modelo base: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés, no confirmados) |
| Licencia | No disponible (el frontmatter indica "licence: license" sin especificar; el modelo base usa la Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint `meta-llama/Llama-3.1-8B-Instruct`, realizado con la librería TRL (Transformers Reinforcement Learning) en su versión 0.29.1. La arquitectura base es un transformer decoder-only de 8 mil millones de parámetros con atención de ventana deslizante y contexto largo (128K tokens en el modelo original). La peculiaridad de este fine-tuning es que solo se ajustan las capas feed-forward (FFN) del bloque transformer, manteniendo congeladas las capas de atención y los embeddings. Esta técnica, denominada "FFN-only", reduce el número de parámetros entrenables, acelera el entrenamiento y puede mitigar el overfitting en datasets pequeños, aunque limita la capacidad de adaptación a nuevas tareas que requieran cambios en los mecanismos de atención.

No se proporciona información sobre el dataset de entrenamiento (composición, número de tokens, idioma, dominio específico), ni sobre el número de épocas, la tasa de aprendizaje o la configuración de hiperparámetros. El registro de entrenamiento está disponible en Weights & Biases (enlace en la model card), pero no se ha accedido a él. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación posterior al SFT.

## Capacidades

- Generación de texto y razonamiento: al heredar el modelo base, mantiene las capacidades generales de Llama 3.1 8B Instruct para completar texto, responder preguntas y seguir instrucciones.
- Soporte de tool calling / function calling: el modelo base lo soporta, pero no se ha verificado que el fine-tuning lo conserve.
- Soporte de agentes y multi-step reasoning: no documentado específicamente; depende de la capacidad heredada del modelo base.
- Capacidades multilingües: el modelo base soporta 8 idiomas, pero no hay confirmación de que el adaptador los conserve íntegramente.
- Capacidades especiales: ninguna documentada. El nombre "lbox-criminal-property" sugiere una especialización en textos legales relacionados con propiedades criminales, pero no hay evidencia pública de su rendimiento en dichas tareas.

## Casos de uso

Dado que no existe documentación sobre el rendimiento real del modelo, los siguientes casos de uso son potenciales y deben validarse empíricamente antes de su adopción.

- Análisis de documentos legales sobre incautación de bienes: el modelo podría utilizarse para extraer y resumir información de expedientes judiciales relacionados con propiedades incautadas, gracias a su posible especialización en el dominio. Requiere pruebas con datos reales.
- Asistencia en investigación criminal: podría ayudar a clasificar textos policiales o judiciales según la naturaleza del delito patrimonial, aunque sin benchmarks no se puede garantizar su precisión.
- Generación de informes preliminares: como asistente para redactar borradores de informes sobre casos de propiedad criminal, siempre con supervisión humana.
- Búsqueda semántica en bases de datos legales: aprovechando la capacidad de embeddings del modelo base, podría indexar y recuperar documentos legales relacionados con propiedades.
- Fine-tuning adicional: al ser un adaptador ligero (0,8 GB), puede servir como punto de partida para especializaciones posteriores en dominios legales más concretos.
- Prototipado académico: útil para investigaciones sobre fine-tuning parcial de capas FFN y su efecto en tareas de dominio específico, aunque requiere comparación con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas del dominio legal. Tampoco se ofrecen comparativas con el modelo base o con otros fine-tunes del mismo autor.

## Requisitos de hardware

- El adaptador pesa 0,8 GB, pero es necesario cargar el modelo base completo (`meta-llama/Llama-3.1-8B-Instruct`) para la inferencia. El modelo base en precisión fp16 ocupa aproximadamente 16 GB de VRAM.
- Con cuantización a 8 bits (bitsandbytes) se reduce a unos 8 GB; con 4 bits, a unos 4-5 GB. Es viable en GPUs consumer como RTX 3090, RTX 4090 o incluso RTX 3060 con cuantización agresiva.
- Para uso en producción con múltiples peticiones concurrentes se recomienda al menos una GPU con 24 GB de VRAM (RTX 3090/4090, A10G) o un servidor con varias GPUs.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (tras conversión). El adaptador se puede cargar con `PeftModel` sobre el modelo base.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantización y el tamaño de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| `llama-3.1-8b-instruct_lbox-criminal-property_ffn-only` (este) | Adaptador 0,8 GB sobre 8B | No disponible (128K base) | No disponible | Propiedad criminal (sin validar) | HuggingFace |
| `llama-3.1-8b-instruct_lbox-casename-criminal_ffn-only` (mismo autor) | Adaptador 0,8 GB sobre 8B | No disponible | No disponible | Nombres de casos criminales (sin validar) | HuggingFace |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8,03B | 128K | Llama 3.1 Community License | Generalista | HuggingFace |
| `Jongbin-kr/llama-3.1-8b-instruct-4x1-moe-lbox-lora-sft-5ep` (mismo autor, MoE) | No disponible (MoE 4x1) | No disponible | No disponible | Dominio legal (sin validar) | HuggingFace |

No se dispone de datos comparativos de rendimiento entre estos modelos. La comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican el dataset, los hiperparámetros, las métricas de evaluación ni los criterios de selección del dominio "criminal-property". Esto impide evaluar su fiabilidad.
- Sesgos potenciales: si el dataset de entrenamiento es limitado o desequilibrado (por ejemplo, centrado en un tipo concreto de delito), el modelo puede presentar sesgos en sus respuestas.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información legal o detalles de casos, lo que es especialmente peligroso en el ámbito judicial.
- Licencia no clara: el frontmatter indica "licence: license", sin especificar la licencia real. El modelo base requiere aceptar la Llama 3.1 Community License, que impone restricciones para uso comercial si se superan ciertos umbrales de usuarios mensuales.
- Sin garantía de especialización: el nombre sugiere una especialización, pero no hay evidencia pública de que el modelo mejore al modelo base en tareas de propiedad criminal. Es imprescindible validarlo antes de cualquier uso real.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar y cargar el modelo base completo, lo que añade complejidad de despliegue.
- Ausencia de cuantizaciones precalculadas: no se ofrecen versiones GGUF, AWQ o GPTQ, por lo que el usuario debe generar sus propias cuantizaciones si necesita optimizar recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_lbox-criminal-property_ffn-only
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo relacionado (casename): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-criminal_ffn-only
- Modelo relacionado (MoE): https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct-4x1-moe-lbox-lora-sft-5ep
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_lbox_ffn_only/runs/1x12k55l
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
