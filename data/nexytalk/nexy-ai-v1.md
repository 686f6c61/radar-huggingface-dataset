# nexytalk/nexy-ai-v1

## Resumen

nexy-ai-v1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario nexytalk y publicado en Hugging Face. Se trata de un modelo de generación de texto de 7.000 millones de parámetros construido sobre la arquitectura transformer de la familia Qwen2, concretamente sobre la versión cuantizada en 4 bits (`unsloth/Qwen2.5-7B-Instruct-bnb-4bit`) que Unsloth distribuye para entrenamiento con bajo consumo de memoria.

El modelo se ha entrenado con Unsloth y la librería TRL de Hugging Face, una combinación habitual para ajustes finos rápidos y eficientes en memoria. La model card es mínima: no documenta el dataset de entrenamiento, el número de tokens, el método de alineación ni resultados de evaluación. La información disponible se limita a los metadatos del repositorio y a las etiquetas del modelo base.

Su relevancia es limitada en el panorama actual: se publica bajo licencia Apache 2.0, lo que facilita su reutilización, pero carece de documentación técnica y de benchmarks que permitan evaluar su calidad frente al modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o que la información del repositorio está incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.000 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el modelo base de partida está en bnb-4bit; no se documentan cuantizaciones publicadas del fine-tuning) |
| Idiomas soportados | en (inglés, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only con atención por componentes (atención de consultas agrupadas, GQA), normalización RMSNorm y activación SwiGLU, tal como define la familia Qwen2. El fine-tuning se realizó partiendo de la versión cuantizada en 4 bits de Unsloth, lo que implica que el entrenamiento se llevó a cabo con pesos base en precisión reducida (QLoRA o similar), aunque la model card no especifica el método exacto ni si se fusionaron los adaptadores.

La model card indica únicamente que el entrenamiento fue "2x faster with Unsloth and Huggingface's TRL library". No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o SFT supervisado, ni ninguna innovación técnica adicional. Tampoco se indica si el ajuste fino preserva las capacidades del modelo base o si se especializó en una tarea concreta.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas básicas propias de un modelo de 7B de la familia Qwen2.5 (no verificadas para este fine-tuning).
- Generación de código, presumiblemente conservada del modelo base, aunque no documentada.
- Soporte de tool calling y function calling: no disponible en la model card (el modelo base Qwen2.5-7B-Instruct lo soporta, pero no se confirma para este ajuste).
- Capacidades de agente y razonamiento multi-paso: no disponibles en la documentación.
- Capacidades multilingües: la model card declara únicamente inglés (`en`), aunque el modelo base Qwen2.5 es multilingüe; no se confirma que el fine-tuning las conserve.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede usarse para generar respuestas multi-turno en inglés, aprovechando la base Qwen2.5-7B-Instruct, aunque sin garantías documentadas sobre la calidad tras el ajuste fino.
- Experimentación académica con fine-tuning: sirve como ejemplo de pipeline Unsloth + TRL sobre un modelo cuantizado en 4 bits, útil para reproducir flujos de entrenamiento eficientes en memoria.
- Generación de texto en entornos de investigación: adecuado para pruebas controladas donde se requiera un modelo Apache 2.0 de 7B sin restricciones de uso comercial.
- Despliegue en hardware de gama media: al derivar de un modelo de 7B, puede ejecutarse en GPUs consumer con cuantización adicional (aunque no se publican versiones GGUF ni cuantizaciones del fine-tuning).
- Base para nuevos ajustes finos: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para especializaciones posteriores.
- Evaluación comparativa de fine-tunings comunitarios: útil para estudiar el impacto de ajustes finos no documentados frente al modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Como referencia del modelo base de 7B, en FP16 requiere aproximadamente 14-16 GB de VRAM; en 4 bits, en torno a 5-6 GB.
- GPU recomendadas: no disponibles. Por tamaño del modelo base, cabría esperar compatibilidad con A100, H100, RTX 4090, RTX 3090 y GPUs con 8-16 GB según cuantización, pero no se confirma para este fine-tuning.
- Cabe en GPU consumer: probablemente sí, en GPUs con al menos 8 GB si se cuantiza a 4 bits, aunque no se publican pesos cuantizados de este modelo.
- Opciones de despliegue: transformers (librería declarada); text-generation-inference (tag presente); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI más allá del tag.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nexy-ai-v1 | 7B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning no documentado de Qwen2.5-7B-Instruct |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 | Hugging Face, muy extendido | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct | 7B | 32.000 tokens (segun documentacion de Mistral) | Apache 2.0 | Hugging Face, muy extendido | Alternativa comunitaria de 7B con amplia adopción |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens (segun documentacion de Meta) | Llama 3.1 Community License | Hugging Face, muy extendido | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, el método de ajuste y la evaluación: imposible verificar la calidad o el comportamiento del modelo.
- Riesgo de alucinación inherente a los modelos de 7B, no mitigado ni documentado en este fine-tuning.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden evaluar sesgos de género, raza, idioma o dominio.
- Idioma limitado al inglés según la model card, aunque el modelo base es multilingüe; el fine-tuning podría haber degradado otras lenguas.
- Repositorio con 0 descargas y tamaño de 0.0 GB: posible que los pesos no estén disponibles o que el repositorio esté incompleto.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación hace arriesgado su uso en producción sin evaluación previa.
- No se confirma la conservación de capacidades del modelo base (tool calling, contexto largo, multilingüismo) tras el ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nexytalk/nexy-ai-v1
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
