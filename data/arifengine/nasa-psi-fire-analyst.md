# arifengine/nasa-psi-fire-analyst

## Resumen

nasa-psi-fire-analyst es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario arifengine y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la versión cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-3B-Instruct-bnb-4bit) y se ha entrenado con la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permite un entrenamiento aproximadamente 2 veces más rápido que el flujo estándar.

El nombre del repositorio sugiere una especialización en el análisis de incendios en el contexto de la NASA PSI (probablemente Planetary Science Institute o un proyecto relacionado con datos de incendios), aunque la model card no documenta el conjunto de datos de entrenamiento, el proceso de ajuste ni las capacidades específicas adquiridas. Se trata de un modelo de generación de texto conversacional, orientado a inglés, con arquitectura Qwen2 y pesos en formato safetensors.

Con 3.000 millones de parámetros y un contexto heredado de la familia Qwen2.5 (no confirmado en la documentación del autor), el modelo es relevante como ejemplo de ajuste fino ligero sobre una base pequeña, adecuado para experimentación y despliegue en hardware de consumo. No obstante, la ausencia de benchmarks, de descripción del dataset y de detalles de entrenamiento limita seriamente su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.000 millones (heredado de Qwen2.5-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, no confirmado para este ajuste) |
| Tipos de cuantizacion | El modelo base está en bnb-4bit; los pesos publicados son safetensors (posiblemente en 4 bits, no confirmado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2, un transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU, propia de la familia Qwen2.5. El ajuste fino se realizó sobre la variante de 3.000 millones de parámetros cuantizada a 4 bits mediante bitsandbytes (bnb-4bit) y distribuida por Unsloth. Según la model card, el entrenamiento se llevó a cabo con Unsloth y la librería TRL de Hugging Face, lo que el autor describe como "2 veces más rápido".

No se documenta el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF o DPO, ni hiperparámetros como la tasa de aprendizaje, el número de épocas o la técnica de ajuste (LoRA/QLoRA). Tampoco se especifica si se aplicaron técnicas de decodificación especulativa u otras optimizaciones de inferencia. La información disponible sobre el proceso de entrenamiento es, por tanto, mínima y se limita a la mención de las herramientas utilizadas.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la base Qwen2.5-3B-Instruct.
- Razonamiento y respuesta a instrucciones de propósito general, sujeto a las capacidades de la base.
- Posible especialización en análisis de incendios o datos de la NASA PSI, sugerida por el nombre del modelo, pero no documentada ni verificable en la model card.
- Soporte de tool calling y function calling: no disponible en la documentación (la base Qwen2.5-Instruct lo soporta, pero no se confirma para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación con ajuste fino ligero: el modelo sirve como ejemplo de pipeline Unsloth + TRL sobre una base de 3B, útil para desarrolladores que quieran replicar el flujo de entrenamiento con QLoRA en hardware modesto.
- Prototipado de asistentes conversacionales en inglés: al derivar de Qwen2.5-3B-Instruct, puede emplearse para generar respuestas multi-turno en demos y pruebas de concepto, siempre que se validen sus salidas.
- Análisis exploratorio de dominio específico: si el ajuste realmente incorpora conocimiento sobre incendios o datos NASA PSI, podría usarse como punto de partida para consultas sobre ese dominio, aunque la falta de documentación exige validación manual.
- Generación de texto en entornos con recursos limitados: sus 3B parámetros permiten ejecución en GPU de consumo con cuantización, adecuado para estaciones de trabajo sin aceleradores de datacenter.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para especializaciones posteriores con licencia permisiva.
- Educación e investigación: útil como caso de estudio de modelos pequeños ajustados con Unsloth, para analizar el impacto del fine-tuning sobre una base cuantizada a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en cuantización de 4 bits, 6-7 GB en FP16 (estimación basada en los 3B parámetros, no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM en FP16 y 4 GB en cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| arifengine/nasa-psi-fire-analyst | 3B | no disponible | Apache 2.0 | Hugging Face | Ajuste fino sin documentar |
| Qwen2.5-3B-Instruct | 3B | 32.768 tokens | Apache 2.0 | Hugging Face | Base original, con benchmarks publicados |
| Llama 3.2-3B-Instruct | 3B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar, licencia restrictiva |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Hugging Face | Alternativa pequeña con contexto amplio |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, los hiperparámetros ni la metodología, lo que impide evaluar la calidad y la naturaleza del ajuste.
- No hay benchmarks publicados; el rendimiento real es desconocido y no puede compararse con la base Qwen2.5-3B-Instruct.
- Riesgo de alucinación inherente a los modelos de 3B parámetros, especialmente en dominios técnicos como el análisis de incendios o datos científicos.
- Idiomas soportados limitados al inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La especialización sugerida por el nombre no está verificada; el modelo podría no aportar conocimiento específico sobre incendios o NASA PSI.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de documentación y de evaluación desaconseja su uso en producción sin validación previa.
- El modelo base está cuantizado a 4 bits, lo que puede introducir pérdida de precisión respecto a la versión original en FP16.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arifengine/nasa-psi-fire-analyst
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
