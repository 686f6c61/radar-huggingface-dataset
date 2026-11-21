# mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF

## Resumen

Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje derivado de Qwen3.5 que combina, mediante una fusión SLERP (interpolación esférica de pesos) de dos vías, las capacidades de modelos de razonamiento tipo Claude Opus y DeepSeek, además de aplicar una técnica de "abliteration" (etiquetada como *heretic*) para reducir los mecanismos de rechazo. El modelo original lo desarrolla el usuario xtools-at; la versión aquí documentada es la cuantización GGUF realizada por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp.

El modelo está orientado a tareas de razonamiento, generación de código, uso de herramientas (tool calling / function calling), matemáticas y STEM, y se distribuye bajo licencia Apache 2.0. Soporta cinco idiomas (inglés, chino, español, ruso y japonés) y declara capacidades multimodales (visión) según la model card del cuantizador.

La relevancia de esta ficha radica en que se trata de una variante "decensored" de un modelo Qwen3.5 de 4B, pensada para despliegues locales donde el usuario necesita control total sobre las respuestas del modelo sin las restricciones de alineamiento habituales. No obstante, los datos publicados sobre el modelo base son escasos, por lo que muchas especificaciones quedan marcadas como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), fusión SLERP de dos vías |
| Parámetros totales | 1.550.888 (según safetensors del repo base; el nombre indica 4B, dato no verificado) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, imatrix |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión SLERP de dos vías sobre una base Qwen3.5 de 4B, combinada con destilación de trazas de razonamiento provenientes de datasets asociados a Claude Opus 4.6 y 4.7 (Jackrong/Claude-opus-4.6-TraceInversion-9000x y Jackrong/Claude-opus-4.7-TraceInversion-5000x) y de trazas de agente de Hermes (lambda/hermes-agent-reasoning-traces). La técnica SLERP interpola los pesos de dos modelos en el espacio de parámetros, lo que permite combinar capacidades de distintos linajes en un único checkpoint.

La variante "heretic" indica que se ha aplicado un proceso de abliteration, una técnica que identifica y suprime las direcciones de activación asociadas a comportamientos de rechazo, reduciendo la censura del modelo. El cuantizador mradermacher ha generado las cuantizaciones GGUF con el método i1 (imatrix), que emplea una matriz de importancia calculada sobre un corpus de calibración para mejorar la calidad de las cuantizaciones de baja precisión. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en trazas de razonamiento destiladas de modelos tipo Claude Opus y DeepSeek.
- Generación de código y soporte de tareas de programación.
- Razonamiento matemático y resolución de problemas STEM.
- Soporte de tool calling / function calling, según los tags del modelo.
- Capacidades de agente y razonamiento multi-paso orientadas a flujos de trabajo automatizados.
- Multilingüe en inglés, chino, español, ruso y japonés.
- Capacidades de visión (el cuantizador indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático).
- Comportamiento "decensored": menor tendencia a rechazar peticiones gracias a la abliteration.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en entornos de desarrollo para autocompletar, explicar y refactorizar código, aprovechando sus capacidades de razonamiento y su formato GGUF para ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta.
- Automatización de agentes con tool calling: al soportar function calling, puede conectarse a APIs externas y orquestar tareas multi-paso en pipelines de automatización, con la ventaja de ejecutarse en infraestructura propia.
- Razonamiento matemático y STEM en entornos educativos o de investigación: útil para resolver problemas paso a paso y generar explicaciones detalladas, gracias a las trazas de razonamiento destiladas.
- Procesamiento multilingüe en atención al cliente: cubre inglés, chino, español, ruso y japonés, lo que permite desplegar un único modelo para soporte en varios mercados sin depender de servicios en la nube.
- Investigación sobre alineamiento y seguridad: al ser una variante "heretic" (abliterated), sirve como caso de estudio para analizar cómo la supresión de direcciones de rechazo afecta al comportamiento del modelo y a su robustez.
- Despliegue en hardware de consumo: las cuantizaciones de baja precisión (Q2, IQ2, IQ3) permiten ejecutar el modelo en equipos con recursos limitados mediante llama.cpp u Ollama, útil para prototipado y demos offline.
- Generación de contenido sin restricciones en entornos controlados: para aplicaciones creativas o de investigación donde se requiere minimizar los rechazos del modelo, siempre con las salvaguardas externas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~4B en GGUF, las cuantizaciones Q4_K_M suelen ocupar del orden de 2,5-3 GB, IQ2/IQ3 alrededor de 1,5-2 GB, y Q6_K en torno a 3,5 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no disponibles; por tamaño, cabría esperar compatibilidad con GPUs consumer tipo RTX 3060/4060 en adelante, aunque no hay datos oficiales.
- Compatibilidad con GPU consumer: probable en cuantizaciones bajas, no confirmado.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, y potencialmente otros runners compatibles con GGUF; el modelo base usa transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-4B-Qwen3.5-...-heretic (este) | ~4B (nominal) | no disponible | Apache 2.0 | GGUF, safetensors | Fusión SLERP + abliteration, multilingüe (5 idiomas) |
| Qwen3.5 base (4B) | ~4B | no disponible | Apache 2.0 (según Qwen) | safetensors, GGUF | Modelo original sin fusión ni abliteration |
| Modelos 4B tipo Llama 3.2 / Gemma | ~3-4B | variable | licencias propias | safetensors, GGUF | Alternativas de tamaño similar, sin capacidades de abliteration |

No se dispone de datos de rendimiento comparativo verificables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La abliteration ("heretic") reduce los rechazos del modelo, lo que puede aumentar el riesgo de generar contenido dañino, sesgado o inapropiado; requiere salvaguardas externas en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; no se han publicado evaluaciones de fidelidad.
- Los datos de parámetros son contradictorios: el nombre indica 4B pero el campo safetensors del repo base registra 1.550.888 parámetros; conviene verificar antes de dimensionar el despliegue.
- No se dispone de información sobre la longitud de contexto real, lo que limita la planificación de aplicaciones con ventanas largas.
- El soporte multilingüe declarado (en, zh, es, ru, ja) no está validado con benchmarks; el rendimiento en español y ruso puede ser inferior al del inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de destilación pueden tener condiciones adicionales que conviene revisar.
- Al ser una fusión SLERP de dos vías con destilación, puede heredar sesgos y comportamientos de los modelos de origen (Claude Opus, DeepSeek), no documentados.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los ficheros pueden no estar completamente subidos o que los metadatos son incompletos.

## Enlaces

- Repositorio Hugging Face (GGUF i1): https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Página de descargas del cuantizador: https://hf.tst.eu/model#Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Dataset de trazas Claude Opus 4.6: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset de trazas Claude Opus 4.7: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas de agente Hermes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
