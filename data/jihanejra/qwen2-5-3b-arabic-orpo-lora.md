# JihaneJra/qwen2.5-3b-arabic-orpo-lora

## Resumen

JihaneJra/qwen2.5-3b-arabic-orpo-lora es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct de Alibaba Cloud, entrenado mediante ORPO (Odds Ratio Preference Optimization) por el usuario JihaneJra. El modelo base empleado es la versión cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-3B-Instruct-bnb-4bit), y el entrenamiento se realizó con la librería Unsloth, que según la model card permite un entrenamiento "2x faster". El nombre del repositorio sugiere un objetivo de adaptación al árabe, aunque la model card no documenta el dataset ni los idiomas efectivamente cubiertos.

El modelo se distribuye como un adaptador LoRA en formato safetensors (tamaño del repositorio: 0,1 GB), lo que indica que no contiene los pesos completos del modelo base, sino únicamente los pesos del adaptador. Es relevante para desarrolladores que quieran experimentar con alineación mediante ORPO sobre un modelo pequeño (3B parámetros) y con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

No obstante, la información publicada es extremadamente escasa: no hay datos sobre el dataset de entrenamiento, el número de pasos, los hiperparámetros, los resultados de evaluación ni los idiomas soportados más allá de la etiqueta "en" en los metadatos. Cualquier evaluación rigurosa requiere probar el adaptador sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3B (modelo base Qwen2.5-3B-Instruct); el adaptador LoRA no disponible en detalle |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta hasta 32 768 tokens, aunque no se confirma en esta ficha) |
| Tipos de cuantizacion | El modelo base de entrenamiento estaba en bnb-4bit; el adaptador se distribuye en safetensors (precision no especificada) |
| Idiomas soportados | "en" segun metadatos; el nombre sugiere arabe pero no esta documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3 mil millones de parametros desarrollado por Alibaba Cloud. El entrenamiento se realizó con Unsloth, una librería que optimiza el fine-tuning mediante kernels personalizados y reducción de memoria, y con TRL (tag "trl" en los metadatos), lo que sugiere el uso de `ORPOTrainer` para la alineación por preferencias con ORPO. ORPO combina la pérdida de modelado de lenguaje con una penalización por odds ratio, eliminando la necesidad de una etapa separada de SFT seguida de RLHF/DPO.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la configuración de hiperparámetros (learning rate, rango LoRA, alpha, dropout), ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal. La model card se limita a indicar el modelo base, la licencia y el uso de Unsloth. El nombre del repositorio ("arabic-orpo") sugiere un dataset de preferencias en árabe, pero no se aporta evidencia documental.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-3B-Instruct, incluyendo razonamiento multi-paso y respuesta a instrucciones.
- Generación de código y matemáticas: el modelo base Qwen2.5-3B-Instruct tiene capacidades documentadas en código y matemáticas; el adaptador no documenta cambios específicos.
- Tool calling / function calling: el modelo base Qwen2.5 soporta function calling; no se confirma que el adaptador preserve esta capacidad tras el ajuste ORPO.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingües: los metadatos solo declaran "en"; el nombre sugiere árabe pero no está verificado.
- Capacidades especiales: no se documentan thinking mode, visión ni audio.

## Casos de uso

- Experimentación con alineación ORPO: el adaptador sirve como ejemplo práctico de cómo aplicar ORPO con TRL y Unsloth sobre un modelo de 3B; útil para investigadores que quieran replicar el pipeline con sus propios datos de preferencias.
- Fine-tuning de bajo coste en consumer GPU: al ser un adaptador LoRA sobre un modelo de 3B cuantizado a 4 bits, puede entrenarse e inferirse en GPUs de gama alta para consumidores (por ejemplo, RTX 3090/4090 con 24 GB), lo que facilita la experimentación académica.
- Adaptación lingüística al árabe (potencial): si el dataset de preferencias era efectivamente en árabe, el adaptador podría mejorar la calidad de respuestas en ese idioma; sin evaluación publicada, debe validarse empíricamente antes de usarlo en producción.
- Prototipado de asistentes conversacionales: el modelo base Qwen2.5-3B-Instruct es adecuado para chatbots multi-turno; el adaptador puede integrarse en pipelines de TGI (tag "text-generation-inference") para servir respuestas.
- Base para investigación en alineación: comparar el comportamiento del modelo base frente al adaptador permite estudiar el efecto de ORPO en un modelo pequeño, con licencia Apache 2.0 que facilita la publicación de resultados.
- Despliegue en entornos con recursos limitados: al requerir menos VRAM que modelos de 7B o 70B, puede ejecutarse en infraestructura modesta (por ejemplo, una sola GPU T4 o RTX 3060 con cuantización), aunque el adaptador debe fusionarse con el modelo base para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-3B-Instruct en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantización 4 bits (bnb-4bit, como el modelo base de entrenamiento) puede reducirse a unos 2-3 GB. El adaptador LoRA añade una sobrecarga mínima (0,1 GB en disco).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A100 40/80 GB, H100. Para entrenamiento con Unsloth, se recomienda al menos 16 GB de VRAM.
- ¿Cabe en consumer GPU? Sí: el modelo base en 4 bits cabe en GPUs de 8 GB o más; en FP16 requiere 8-12 GB.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), vLLM (previa fusión del adaptador), llama.cpp/Ollama (previa conversión a GGUF y fusión), TGI (tag incluido en los metadatos).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JihaneJra/qwen2.5-3b-arabic-orpo-lora | 3B (adaptador LoRA) | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-3B-Instruct (modelo base) | 3B | 32 768 tokens (segun documentacion de Qwen) | Apache 2.0 | Hugging Face (ampliamente usado) |
| Llama-3.2-3B-Instruct | 3B | 128 000 tokens | Llama 3.2 Community License | Hugging Face |
| Phi-3.5-mini-instruct | 3,8B | 128 000 tokens | MIT | Hugging Face |

La comparativa se basa en datos públicos de los modelos alternativos; no se dispone de benchmarks del adaptador para comparar rendimiento. El adaptador carece de tracción (0 descargas, 0 likes) frente a los modelos base, que cuentan con amplia adopción.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el adaptador hereda los sesgos del modelo base Qwen2.5-3B-Instruct, que no están evaluados en esta ficha.
- Riesgo de alucinación: no evaluado; los modelos de 3B tienen mayor propensión a alucinar que modelos más grandes, y el ajuste ORPO no garantiza mitigación.
- Limitaciones de contexto o idioma: los metadatos solo declaran "en"; el objetivo árabe del nombre no está verificado. No se documenta la longitud de contexto efectiva tras el ajuste.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-3B-Instruct, cuya licencia también es Apache 2.0; debe verificarse la compatibilidad al fusionar.
- Caveats para producción: sin benchmarks ni evaluación publicada, no se recomienda su uso en producción sin una validación exhaustiva. El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria. El adaptador debe fusionarse con el modelo base para su despliegue en la mayoría de frameworks.

## Enlaces

- Hugging Face: https://huggingface.co/JihaneJra/qwen2.5-3b-arabic-orpo-lora
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de TRL (ORPO): https://huggingface.co/docs/trl/orpo_trainer
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
