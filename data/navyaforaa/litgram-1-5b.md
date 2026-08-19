# Navyaforaa/LitGram-1.5B

## Resumen

LitGram-1.5B es un modelo de lenguaje de 1.500 millones de parámetros, desarrollado por el usuario Navyaforaa, que se presenta como un fine-tuning del modelo base `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Qwen2.5-1.5B-Instruct de Alibaba Cloud. El modelo está orientado a tareas de generación de texto conversacional y sigue el pipeline de `text-generation` de la librería Transformers. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y los idiomas declarados son exclusivamente el inglés.

La relevancia de este modelo radica en su tamaño reducido, que lo hace adecuado para entornos con recursos limitados, y en el hecho de que ha sido entrenado con las herramientas Unsloth y TRL de Hugging Face, que aceleran el fine-tuning. Sin embargo, la información pública es muy escasa: el repositorio no contiene pesos (tamaño 0.0 GB), no tiene descargas ni valoraciones, y la model card no ofrece detalles sobre el proceso de entrenamiento, los datos utilizados ni las capacidades específicas. Por tanto, cualquier afirmación sobre su rendimiento debe tomarse con cautela y, en gran medida, se infiere del modelo base Qwen2.5-1.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el modelo base fue cuantizado a 4 bits con bitsandbytes, pero no se indica si los pesos finales están cuantizados) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene archivos de pesos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atención causal, normalización RMSNorm, y activación SwiGLU. El modelo base `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit` es una versión de Qwen2.5-1.5B-Instruct cuantizada a 4 bits mediante bitsandbytes, optimizada para fine-tuning eficiente con la librería Unsloth. El autor declara haber utilizado Unsloth y la librería TRL de Hugging Face para el entrenamiento, lo que sugiere un proceso de fine-tuning supervisado (SFT) sobre el modelo instruct ya entrenado.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica si el fine-tuning se realizó en precisión completa o manteniendo la cuantización. Dado que el repositorio no contiene pesos, es posible que el modelo no haya sido subido correctamente o que esté pendiente de publicación.

## Capacidades

Las capacidades que se detallan a continuación se infieren del modelo base Qwen2.5-1.5B-Instruct, ya que no hay información específica sobre este fine-tuning:

- Generación de texto conversacional y respuesta a instrucciones en inglés.
- Razonamiento básico y resolución de problemas sencillos, aunque limitado por su tamaño.
- Capacidad de seguir instrucciones de formato (chat, preguntas-respuestas).
- No se ha confirmado soporte para tool calling, function calling, ni modos de razonamiento extendido (thinking mode).
- No se ha confirmado soporte multilingüe más allá del inglés declarado.
- No se ha confirmado soporte de visión ni audio.

## Casos de uso

- Chatbots ligeros para atención al cliente: gracias a su tamaño reducido (1.5B) y licencia permisiva, puede desplegarse en entornos con GPU de consumo o incluso CPU, ofreciendo respuestas conversacionales en inglés para consultas frecuentes.
- Asistentes de documentación técnica: puede integrarse en sistemas de ayuda para generar respuestas a preguntas sobre manuales o bases de conocimiento, siempre que el contexto se limite a unas pocas frases.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y con licencia Apache 2.0, es útil para validar ideas de producto sin incurrir en costes de API ni en requisitos de hardware elevados.
- Generación de texto creativo corto: para escribir correos, resúmenes o borradores de contenido breve en inglés, donde la calidad aceptable de un modelo de 1.5B es suficiente.
- Filtrado o clasificación de texto: puede emplearse como clasificador de intenciones o etiquetador de textos cortos, aprovechando su capacidad de seguir instrucciones.
- Educación y experimentación: sirve como modelo de referencia para estudiar técnicas de fine-tuning con Unsloth y TRL, o para comparar el impacto de diferentes estrategias de entrenamiento en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. El rendimiento real debe inferirse del modelo base Qwen2.5-1.5B-Instruct, que en su versión original obtiene resultados moderados para su tamaño, pero no se puede asumir que este fine-tuning los iguale.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 1.5B en precisión FP16 requiere aproximadamente 3 GB de VRAM; en 4 bits, alrededor de 1 GB. Sin embargo, no se confirma el formato de pesos final.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores) puede ejecutar el modelo en FP16. Para cuantización 4 bits, incluso GPUs con 2 GB podrían ser suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), u Ollama. No se ha verificado la compatibilidad con estas herramientas.
- Latencia y throughput: no disponibles. Para un modelo de 1.5B en una GPU moderna (por ejemplo, RTX 4090), se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La comparativa se realiza con otros modelos de 1.5B de la familia Qwen2.5 y con un modelo similar encontrado en la búsqueda web (VibeThinker-1.5B), aunque este último no tiene relación directa con LitGram.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LitGram-1.5B | 1.5B | no disponible | Apache 2.0 | Repositorio sin pesos |
| Qwen2.5-1.5B-Instruct (original) | 1.5B | 32.768 tokens | Apache 2.0 | Pesos oficiales en Hugging Face |
| VibeThinker-1.5B | 1.5B | no disponible | Apache 2.0 | Pesos en Hugging Face y ModelScope |

En cuanto a rendimiento, no hay datos comparativos fiables. El modelo original Qwen2.5-1.5B-Instruct es un punto de referencia razonable, pero LitGram podría haber sido entrenado para una tarea específica, por lo que su comportamiento puede diferir. Se recomienda evaluar directamente antes de usar en producción.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo (tamaño 0.0 GB), por lo que no es posible descargarlo ni utilizarlo actualmente. Esto invalida cualquier uso práctico hasta que el autor suba los archivos.
- No hay información sobre el proceso de entrenamiento (datos, épocas, hiperparámetros), lo que impide evaluar su calidad o reproducibilidad.
- Al ser un modelo pequeño, presenta limitaciones inherentes en razonamiento complejo, comprensión de matices y generación de texto largo.
- Riesgo de alucinaciones y sesgos, comunes en modelos de este tamaño, especialmente si el fine-tuning se realizó con un dataset no curado.
- Solo se declara soporte para inglés; no se garantiza un rendimiento aceptable en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos disponibles, la licencia es irrelevante en la práctica.
- No se han publicado benchmarks, por lo que cualquier afirmación sobre su rendimiento es especulativa.

## Enlaces

- Hugging Face: https://huggingface.co/Navyaforaa/LitGram-1.5B
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
