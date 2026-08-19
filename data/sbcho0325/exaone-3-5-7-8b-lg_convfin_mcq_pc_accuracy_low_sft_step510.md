# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_low_sft_step510

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por el usuario sbcho0325. El nombre del adaptador, `lg_convfin_mcq_pc_accuracy_low_sft_step510`, sugiere que fue ajustado para tareas de conversación financiera, preguntas de opción múltiple (MCQ) y optimización de precisión, aunque no se proporciona documentación oficial que confirme estos objetivos. El modelo base, EXAONE 3.5 de LG AI Research, es un transformer decoder denso de 7.8B parámetros con soporte de contexto largo de hasta 32K tokens, diseñado para aplicaciones reales en entornos multilingües (principalmente coreano e inglés).

La relevancia de este adaptador radica en su enfoque de bajo coste: en lugar de reentrenar un modelo completo, se aplica una adaptación de bajo rango sobre un modelo ya instruido, lo que permite especializarlo en dominios concretos con recursos limitados. El tamaño del repositorio (0.3 GB) confirma que solo contiene los pesos del adaptador, no el modelo completo. Dado que la model card está vacía y no hay métricas publicadas, cualquier evaluación de su rendimiento debe realizarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre EXAONE-3.5-7.8B-Instruct (transformer decoder denso) |
| Parametros totales | No disponible (el adaptador LoRA es de bajo rango; el modelo base tiene 7.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se puede aplicar sobre cuantizaciones del base, p. ej. 4-bit, 8-bit) |
| Idiomas soportados | No disponible (el modelo base soporta coreano, ingles y otros; el adaptador no especifica) |
| Licencia | No disponible (el modelo base tiene licencia EXAONE de LG AI Research) |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención y feed-forward. Esto reduce drásticamente el número de parámetros entrenables y los requisitos de memoria durante el ajuste. El entrenamiento se realizó con supervisión fina (SFT) usando la librería TRL de HuggingFace, como indican los metadatos (PEFT 0.19.1, transformers, trl). No se dispone de información sobre el dataset, los hiperparámetros (rango, alpha, dropout, tasa de aprendizaje) ni el número de pasos exactos más allá del nombre del checkpoint (`step510`).

El modelo base EXAONE-3.5-7.8B-Instruct emplea una arquitectura transformer con atención de ventana deslizante y atención global periódica, optimizada para manejar secuencias largas de hasta 32K tokens. Fue entrenado con una mezcla de datos en coreano e inglés, e incluye capacidades de razonamiento, generación de código y tool calling. El adaptador hereda estas capacidades, pero su especialización concreta no está documentada.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base.
- Razonamiento y resolución de problemas, incluyendo matemáticas y lógica.
- Generación de código y comprensión de lenguajes de programación.
- Soporte de tool calling y function calling (capacidad del modelo base).
- Capacidades multilingües, principalmente coreano e inglés (del modelo base).
- El nombre del adaptador sugiere una posible especialización en conversación financiera y preguntas de opción múltiple, pero no hay evidencia publicada que lo confirme.
- No se ha documentado ningún modo de pensamiento extendido (thinking mode) ni capacidades multimodales.

## Casos de uso

Dado que no hay documentación oficial, los siguientes casos de uso son inferencias razonables basadas en el nombre del adaptador y las capacidades del modelo base. Se recomienda validar el rendimiento en cada escenario antes de su uso en producción.

- Atención al cliente financiera: el adaptador podría gestionar consultas sobre productos bancarios, inversiones o seguros en conversaciones multi-turno, aprovechando el contexto de 32K tokens para mantener el historial completo de la interacción.
- Análisis de sentimiento en textos financieros: podría clasificar noticias, informes o comentarios de redes sociales en categorías de sentimiento (positivo, negativo, neutral) mediante preguntas de opción múltiple, un formato que el nombre del adaptador sugiere haber optimizado.
- Generación de informes financieros resumidos: a partir de datos estructurados o conversaciones, podría redactar resúmenes ejecutivos o actas de reuniones con un tono profesional.
- Evaluación de respuestas en dominios regulados: el adaptador podría usarse para puntuar o seleccionar la mejor respuesta entre varias opciones en cuestionarios de cumplimiento normativo o formación interna.
- Asistente de investigación de mercado: combinado con tool calling, podría buscar datos actualizados y responder preguntas de opción múltiple sobre tendencias económicas o análisis de competidores.
- Fine-tuning adicional para tareas específicas: al ser un adaptador LoRA, puede servir como punto de partida para nuevos ajustes con datasets propios, reduciendo el coste computacional frente a entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El modelo base EXAONE-3.5-7.8B-Instruct reporta en su paper resultados en MMLU, HumanEval, GSM8K y otras pruebas, pero estos datos no son aplicables al adaptador sin una evaluación específica. Se recomienda ejecutar una batería de pruebas propia sobre el dominio objetivo antes de considerar su uso.

## Requisitos de hardware

- El adaptador LoRA añade un overhead mínimo en memoria (típicamente menos de 1 GB en FP16), por lo que los requisitos vienen determinados por el modelo base.
- El modelo base EXAONE-3.5-7.8B-Instruct en FP16 requiere aproximadamente 16 GB de VRAM para inferencia.
- Con cuantización 4-bit (GPTQ o AWQ), la VRAM necesaria se reduce a unos 5-6 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 12GB, RTX 4070 o superiores.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100, H100 para despliegues de mayor rendimiento.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, o mediante la librería PEFT con transformers.
- La latencia y el throughput dependen del hardware y la cuantización; no se dispone de datos específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo repositorio o con la misma especialización. Como referencia, el modelo base EXAONE-3.5-7.8B-Instruct se sitúa en la misma categoría que otros modelos de 7-8B parámetros como Llama 3.1 8B Instruct o Qwen 2.5 7B Instruct, pero la comparación directa con este adaptador no es posible sin evaluaciones propias.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia EXAONE (LG) | Modelo base sobre el que se aplica el adaptador |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Alternativa generalista |
| Qwen 2.5 7B Instruct | 7.6B | 128K | Apache 2.0 | Alternativa generalista |

## Limitaciones y advertencias

- No hay documentación oficial: la model card está vacía, por lo que se desconocen los datos de entrenamiento, los hiperparámetros y los objetivos exactos.
- Riesgo de sobreajuste: el adaptador puede estar especializado en un dominio muy concreto (finanzas, MCQ) y degradar su rendimiento en tareas generales.
- Sesgos del modelo base: EXAONE 3.5 puede presentar sesgos lingüísticos o culturales derivados de su entrenamiento mayoritariamente en coreano e inglés.
- Alucinaciones: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados sin verificación externa.
- Licencia: la licencia del adaptador no está especificada; la del modelo base (EXAONE) impone restricciones de uso comercial que deben revisarse antes de cualquier despliegue.
- Sin garantías de producción: al no haber benchmarks ni evaluaciones independientes, no se recomienda su uso en entornos críticos sin una validación exhaustiva.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_low_sft_step510
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de EXAONE 3.5: https://arxiv.org/html/2412.04862v3
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- GGUF del modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF
