# GAOEULEE/zils-lite-r1

## Resumen

zils-lite-r1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B publicado por el usuario GAOEULEE en Hugging Face. Se presenta como el "cuerpo" (body) de un modelo de decisión para Zils, un subred de Bittensor (subnet 127), montado sobre el chasis d3-lite (vllm-sr/d3-lite). El modelo conserva la torre de visión del chasis sin modificar y entrena únicamente las capas de lenguaje, con un total de 852.985.920 parámetros en formato bf16.

La propuesta del modelo es resolver tareas de decisión con etiquetas exactas: conteo por reglas, emparejamiento de requisitos, conteo de argumentos, aritmética, ordenación y aritmética de días de la semana, además de ítems de estilo examen construidos a partir de conjuntos de datos públicos. El entrenamiento se realizó mediante tres ajustes finos completos de las capas de lenguaje con distintas semillas, cuya media uniforme de pesos constituye el modelo final.

Es relevante en el contexto de los modelos de decisión ligeros y de los ecosistemas descentralizados tipo Bittensor, donde se busca un modelo pequeño (menos de mil millones de parámetros) que quepa en hardware modesto y que sea evaluable de forma determinista mediante una capa de respuesta fija del chasis. La licencia Apache-2.0 facilita su reutilización comercial, aunque la información pública disponible es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, con torre de visión del chasis d3-lite) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del chasis d3-lite (vllm-sr/d3-lite @ 03560c2), un contenedor que fija la disposición de capas y una capa de respuesta fija utilizada por los validadores. Solo se entrenaron las capas de lenguaje; los embeddings y la torre de visión permanecen sin cambios respecto al chasis. La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros, con una torre de visión heredada del chasis.

El entrenamiento consistió en tres ajustes finos completos de las capas de lenguaje (semillas 1, 2 y 3), cada uno de una época sobre 120.000 filas, con AdamW, tasa de aprendizaje de 8e-6, pesos maestros en FP32, decaimiento lineal y lotes agrupados por longitud. La función de pérdida combina la divergencia KL hacia la distribución objetivo con 0,5 veces el Brier score, evaluada a través de la capa de respuesta fija del chasis tal como lo hacen los validadores. El cuerpo final es la media uniforme de los pesos de las tres ejecuciones. Los datos de entrenamiento incluyen ítems de decisión generados por programa con etiquetas exactas (conteo por reglas, emparejamiento de requisitos, conteo de argumentos, aritmética, ordenación y aritmética de días de la semana) e ítems de estilo examen construidos a partir de los splits de entrenamiento de TweetEval, dair-ai/emotion, GLUE (MNLI, RTE, STS-B, QNLI), ANLI, BoolQ, CommonsenseQA, Social IQa, PIQA, ARC, GSM8K, 20 Newsgroups, BANKING77 y glaive-function-calling-v2. No se usaron ítems de examen de validadores, semillas públicas de examen, filas de validación/prueba ni datos de clientes.

## Capacidades

- Generación de texto y razonamiento de decisión sobre ítems con etiquetas exactas (conteo por reglas, emparejamiento de requisitos, conteo de argumentos, aritmética, ordenación, aritmética de días de la semana).
- Clasificación y respuesta a ítems de estilo examen derivados de conjuntos como GLUE, ANLI, BoolQ, CommonsenseQA, Social IQa, PIQA, ARC, GSM8K, 20 Newsgroups y BANKING77.
- Soporte de tool calling / function calling, según la inclusión de glaive-function-calling-v2 en los datos de entrenamiento.
- Capacidades de visión heredadas de la torre de visión del chasis d3-lite (sin reentrenar).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de modelos de decisión en subredes Bittensor: el modelo está diseñado para ser puntuado a través de la capa de respuesta fija del chasis d3-lite, por lo que encaja directamente en flujos de validación de la subnet 127.
- Clasificación de texto con etiquetas exactas: puede usarse para tareas de emparejamiento de requisitos o conteo de argumentos en pipelines de evaluación automática, gracias a su entrenamiento con ítems generados por programa y etiquetas deterministas.
- Respuesta a ítems de opción múltiple de estilo examen: adecuado para prototipos de evaluación de razonamiento sobre conjuntos como ARC, CommonsenseQA o BoolQ, con la ventaja de un tamaño reducido que permite ejecución local.
- Aritmética y razonamiento simbólico ligero: útil en asistentes que necesiten resolver operaciones aritméticas, ordenaciones o cálculos de días de la semana sin depender de un modelo de gran tamaño.
- Tool calling en asistentes ligeros: la inclusión de glaive-function-calling-v2 en el entrenamiento permite integrarlo en flujos de llamada a funciones en entornos con recursos limitados.
- Experimentación con técnicas de weight averaging (model soup): el modelo sirve como ejemplo reproducible de media uniforme de pesos de tres ejecuciones con distintas semillas para estudiar estabilidad y robustez.
- Prototipado de modelos multimodales ligeros: al conservar la torre de visión del chasis, puede emplearse como base para experimentos que combinen texto e imagen en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y lote.
- En cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits: alrededor de 0,5 GB de pesos (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en bf16 o cuantizada; para despliegue en producción con mayor throughput, A100 o H100 no son necesarias pero pueden usarse.
- Cabe en GPU consumer: sí, con margen amplio, incluso en tarjetas de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son candidatos razonables dado el formato safetensors y el tamaño; la compatibilidad exacta con cada herramienta no está confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-r1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (GAOEULEE/zils-lite-r1) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible en la información | Hugging Face (modelo base) |
| vllm-sr/d3-lite (chasis) | no disponible | no disponible | no disponible en la información | Hugging Face (chasis) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse con conjuntos como TweetEval, GLUE o 20 Newsgroups, puede heredar sesgos presentes en esos corpus.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; el entrenamiento orientado a etiquetas exactas no elimina la posibilidad de respuestas incorrectas en entradas fuera de distribución.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados; el modelo se entrenó principalmente con datos en inglés según los conjuntos listados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las licencias de los modelos padres (Qwen/Qwen3.5-0.8B y vllm-sr/d3-lite) y los avisos LICENSE y NOTICE del repositorio.
- Caveat para producción: el modelo está diseñado para el ecosistema Zils/Bittensor y su capa de respuesta fija; su comportamiento fuera de ese chasis no está validado. Además, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El autor declara que no se usaron datos de validación ni de clientes, pero no se aportan métricas de evaluación independientes.

## Enlaces

- Hugging Face: https://huggingface.co/GAOEULEE/zils-lite-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Repositorio del chasis (commit 03560c2): https://huggingface.co/vllm-sr/d3-lite/tree/03560c2
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
