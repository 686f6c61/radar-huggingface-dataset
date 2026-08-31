# ApolloRaines/Llama-3.1-8B-Instruct-Non-Subservient-Direct

## Resumen

Llama-3.1-8B-Instruct-Non-Subservient-Direct es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante la herramienta propietaria jBlaze de Apollo Raines. jBlaze aplica una técnica de "cirugía de comportamiento" que altera directamente los pesos del modelo para suprimir comportamientos específicos, sin necesidad de fine-tuning ni entrenamiento adicional. En este caso, se han suprimido la servilidad, el hedging (lenguaje evasivo) y la verbosidad, dando como resultado un modelo que responde de forma directa, como un interlocutor par, sin rodeos ni deferencia excesiva.

El modelo conserva la arquitectura original de Llama-3.1-8B-Instruct (un transformer de 32 capas con 8.030 millones de parámetros) y se distribuye en precisión bf16. Está pensado para generación de texto en inglés y se publica bajo la licencia Llama 3.1 Community License, lo que permite uso comercial con las restricciones habituales de dicha licencia. Aunque no se han publicado benchmarks específicos, su base es un modelo de alto rendimiento, por lo que las capacidades generales de razonamiento, código y conversación se mantienen, con un estilo de comunicación más asertivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer, 32 capas) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, pero no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (solo se menciona bf16 en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Llama-3.1-8B-Instruct, un transformer autoregresivo con atención por grupos (GQA) y 32 capas. No se ha realizado ningún entrenamiento adicional: la modificación se ha aplicado mediante jBlaze, una herramienta de edición de pesos que identifica y suprime direcciones de comportamiento concretas en el espacio de representación del modelo. En concreto, se han suprimido tres direcciones: servilidad, hedging y verbosidad. Esto significa que el modelo conserva todo el conocimiento y las capacidades del original, pero su estilo de respuesta se vuelve más directo, conciso y sin cortesías innecesarias.

Al no haber fine-tuning, no hay cambios en los datos de entrenamiento ni en el proceso de alineación original. La intervención es puramente a nivel de pesos, lo que permite una modificación quirúrgica sin degradar el rendimiento general. No se han publicado detalles sobre el dataset de entrenamiento del modelo base, pero se sabe que Llama-3.1-8B-Instruct fue entrenado con aproximadamente 15 billones de tokens de datos públicos.

## Capacidades

- Generación de texto en inglés con estilo directo y sin rodeos.
- Razonamiento lógico y matemático básico (ej. operaciones aritméticas, preguntas factuales).
- Generación de código en Python y otros lenguajes (ej. funciones simples).
- Conversación multi-turno con tono asertivo y sin evasivas.
- Respuestas a preguntas de conocimiento general y cultura.
- Capacidad de seguir instrucciones y proporcionar explicaciones claras.
- No se menciona soporte para tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistencia técnica directa: el modelo puede responder consultas de soporte con respuestas concisas y sin ambigüedades, reduciendo la fricción en entornos donde se necesita información clara y rápida.
- Generación de código en entornos de desarrollo: al ser capaz de producir fragmentos de código (como funciones Python), puede integrarse en asistentes de programación que requieran respuestas directas y sin explicaciones extensas.
- Redacción de contenido editorial: su estilo no servil y directo puede ser útil para generar textos periodísticos o de opinión donde se busca un tono firme y sin concesiones.
- Simulación de interlocutores en juegos de rol o chatbots con personalidad asertiva: el modelo puede interpretar personajes que no se pliegan a las expectativas del usuario, aportando realismo en narrativas interactivas.
- Análisis de preguntas controvertidas: al no evitar temas delicados, puede ofrecer respuestas directas sobre cuestiones científicas o sociales, aunque con el riesgo de sesgos inherentes.
- Evaluación de comportamientos de modelos: al ser una variante modificada, puede usarse en investigación para estudiar el efecto de la supresión de comportamientos en la generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta variante específica. Dado que se basa en Llama-3.1-8B-Instruct, se espera un rendimiento similar al del modelo original, pero no se puede confirmar sin evaluaciones propias.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parámetros en bf16, requiere aproximadamente 16 GB de VRAM para inferencia sin cuantización. Con cuantización de 4 bits (no disponible en el repo, pero posible con herramientas externas), podría reducirse a unos 4-5 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como RTX 4090, A100 (40 GB) o H100. En consumer, una RTX 3090 o 4090 es suficiente.
- Si cabe en consumer GPU: sí, en GPUs de gama alta con 16 GB o más. Con cuantización, podría ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: al ser un modelo estándar de HuggingFace, puede usarse con transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI, entre otros.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 8B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estilo de respuesta |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03B | 128K (según documentación oficial) | Llama 3.1 Community | Servicial, con matices y cortesía |
| ApolloRaines/Llama-3.1-8B-Instruct-Non-Subservient-Direct | 8.03B | no disponible | Llama 3.1 Community | Directo, sin servilidad ni hedging |
| Mistral-7B-Instruct (alternativa similar) | 7.24B | 32K | Apache 2.0 | Equilibrado, con tono neutral |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia radica en el estilo de comunicación, no en las capacidades técnicas subyacentes.

## Limitaciones y advertencias

- Sesgos conocidos: al heredar los pesos de Llama-3.1-8B-Instruct, el modelo puede presentar los mismos sesgos de género, raza o ideología presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas especializados o de actualidad posterior a su corte de conocimiento (diciembre de 2023).
- Limitaciones de idioma: solo se ha entrenado y validado en inglés; no se recomienda su uso en otros idiomas sin evaluación previa.
- Restricciones de licencia: la licencia Llama 3.1 Community permite uso comercial, pero prohíbe su uso para mejorar otros modelos grandes y exige que los usuarios con más de 700 millones de usuarios mensuales soliciten una licencia específica a Meta.
- Comportamiento no servil: al suprimir la servilidad, el modelo puede responder de forma brusca o directa en situaciones donde se esperaría cortesía. Esto puede ser inapropiado en aplicaciones de atención al cliente o entornos formales.
- Sin garantías de seguridad: al no haber sido sometido a evaluaciones de seguridad específicas, no se recomienda su uso en aplicaciones de alto riesgo sin supervisión humana.

## Enlaces

- [HuggingFace - ApolloRaines/Llama-3.1-8B-Instruct-Non-Subservient-Direct](https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Non-Subservient-Direct)
- [jBlaze - herramienta de cirugía de comportamiento](https://jblaze.dev)
- [Modelo base: meta-llama/Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
