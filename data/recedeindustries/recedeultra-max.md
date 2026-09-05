# RecedeIndustries/RecedeUltra-Max

## Resumen

RecedeIndustries/RecedeUltra-Max es un modelo de lenguaje fine-tuning basado en Qwen/Qwen2.5-7B-Instruct, desarrollado por RecedeIndustries. Se trata de un adaptador LoRA (low-rank adaptation) entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face. El modelo está diseñado para tareas de generación de texto en inglés y chino, heredando la arquitectura y capacidades del modelo base.

Este modelo resuelve el problema de adaptar un modelo de 7B a dominios específicos mediante un ajuste eficiente de parámetros, sin necesidad de reentrenar todos los pesos. Su relevancia actual radica en ofrecer una alternativa de bajo coste computacional para personalizar modelos de lenguaje en aplicaciones conversacionales. El repositorio contiene únicamente el adaptador PEFT (0.3 GB), que debe combinarse con los pesos del modelo base para su uso. No se han publicado especificaciones detalladas del conjunto de datos de entrenamiento ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen/Qwen2.5-7B-Instruct con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 7 600 millones (7.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base Qwen2.5-7B-Instruct admite hasta 128 000 tokens |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base admite FP16, BF16, Int8 y Int4 (GGUF) |
| Idiomas soportados | No disponibles; el modelo base de Qwen2.5-7B-Instruct soporta principalmente chino e inglés |
| Licencia | No disponible (adaptador); el modelo base se distribuye bajo Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen2.5-7B-Instruct, lo que implica una arquitectura Transformer estándar con atención multi-cabeza y capas de feed-forward. La técnica de LoRA modifica de forma eficiente las matrices de proyección de las capas de atención, añadiendo matrices de bajo rango que se entrenan mientras el resto de pesos permanece congelado. Esto reduce significativamente el número de parámetros entrenables y el coste de entrenamiento.

El entrenamiento se ha realizado con Supervised Fine-Tuning (SFT) utilizando la biblioteca TRL de Hugging Face. La model card indica que se usaron PEFT 0.20.0, TRL 1.12.0, Transformers 5.16.1 y PyTorch 2.11.0+cu128. No se proporciona información sobre el conjunto de datos, el número de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se especifica si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y completado de preguntas, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento general y matemático básico, como parte de las capacidades del modelo base.
- Generación de código en lenguajes como Python, Java y C++, soportada por el modelo base.
- Soporte de tool calling y function calling, integrado en el modelo base de Qwen2.5-7B-Instruct.
- Capacidad de procesar ventanas de contexto largas si se utiliza con el modelo base (hasta 128 000 tokens).
- Multilingüismo limitado, con soporte principal para inglés y chino.

Nota: estas capacidades se deducen del modelo base. No se ha realizado una verificación específica del adaptador RecedeUltra-Max.

## Casos de uso

- Asistentes conversacionales para atención al cliente: el modelo puede responder preguntas frecuentes, gestionar conversaciones multi-turno y resolver dudas operativas, integrado en un sistema de chatbot con baja latencia gracias a su tamaño de 7B.
- Generación de código en entornos de desarrollo: gracias al soporte de tool calling del modelo base, se puede integrar en pipelines de CI/CD para autocompletar código, generar tests unitarios o revisar snippets.
- Análisis de documentos con contexto largo: con la ventana de 128K tokens del modelo base, es adecuado para resumir contratos, informes técnicos o actas de reuniones largas.
- Razonamiento matemático aplicado a educación: puede generar problemas, explicar pasos de resolución y proporcionar feedback en aplicaciones de tutoría, usando el adaptador fine-tuning para ajustar el tono pedagógico.
- Clasificación y extracción de información: se puede aplicar a tareas de NLP como etiquetado de entidades, clasificación de documentos o extracción de datos clave, utilizando el formato instructivo del modelo base.
- Prototipos de agentes autónomos: al combinar LoRA con el modelo base, es viable construir agentes que utilicen function calling para ejecutar tareas simples como consultas a API o cálculos, en sistemas de baja complejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni cualquier otra métrica de evaluación para este adaptador. Por lo tanto, no se puede comparar empíricamente con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo completo (base + adaptador): aproximadamente 16 GB en FP16 con GPU dedicada.
- Con cuantización Int8 del modelo base: alrededor de 8-10 GB de VRAM.
- Con cuantización Int4 (GGUF): aproximadamente 4-6 GB de VRAM, permitiendo ejecución en GPUs de consumo como RTX 3060 o superiores.
- GPU recomendadas: NVIDIA RTX 4090, A100 40GB/80GB o H100 para inferencia a alta velocidad.
- Opciones de despliegue: Transformers con PEFT, vLLM, llama.cpp, Ollama y TGI. El adaptador debe fusionarse con el modelo base o cargarse mediante la API de PEFT.
- Latencia y throughput aproximados: no disponibles. Dependen de la cuantización, el hardware y el tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-7B-Instruct | 7.6B | 128K | Apache 2.0 | Safetensors | Hugging Face |
| RecedeIndustries/RecedeUltra-Max | 7.6B (base) + LoRA | No especificado | No disponible | Safetensors (LoRA) | Hugging Face |
| Mistral-7B-Instruct-v0.2 | 7.3B | 32K | Apache 2.0 | Safetensors | Hugging Face |

La principal diferencia es que RecedeUltra-Max es un adaptador LoRA que no puede usarse de forma autónoma; requiere descargar el modelo base. Su licencia no está especificada, lo que añade incertidumbre para uso comercial.

## Limitaciones y advertencias

- Sesgos heredados del modelo base Qwen2.5-7B-Instruct, que puede reflejar sesgos culturales o de género presentes en sus datos de entrenamiento.
- Riesgo de alucinación: el modelo puede generar contenido plausible pero incorrecto, especialmente en temas especializados o de actualidad.
- Licencia no definida: el adaptador carece de licencia explícita, lo que puede impedir su uso comercial sin autorización del autor.
- Limitaciones de idioma: aunque el modelo base soporta inglés y chino, no se han documentado las capacidades multilingües del adaptador. Es posible que el fine-tuning haya reducido el rendimiento en idiomas distintos a los del dataset de entrenamiento.
- Falta de documentación: no se proporciona información sobre el dataset de entrenamiento, lo que impide evaluar la idoneidad del modelo para dominios específicos.
- Formato exclusivo de adaptador: al ser un LoRA, será necesario mantener la compatibilidad entre la versión de PEFT y el model base; en caso contrario, la inferencia puede fallar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RecedeIndustries/RecedeUltra-Max
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
