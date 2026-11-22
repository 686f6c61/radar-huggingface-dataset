# mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF es una distribucion de cuantizaciones GGUF creada por mradermacher a partir del modelo base yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated. El modelo subyacente es un transformer de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) que combina senales de destilacion de DeepSeek con la arquitectura Qwen 3.5, segun indican las etiquetas del repositorio. El autor de las cuantizaciones no ha entrenado el modelo, sino que ha generado versiones comprimidas con distintos niveles de precision para facilitar su despliegue en hardware de consumo.

La relevancia de esta ficha reside en que el repositorio original no incluye una model card descriptiva: la informacion disponible se limita a metadatos, etiquetas y la tabla de cuantizaciones. Esto significa que muchas especificaciones tecnicas (contexto, datos de entrenamiento, benchmarks) no estan documentadas de forma explicita y deben marcarse como no disponibles. Lo que si se conoce con certeza es el numero de parametros, la licencia Apache 2.0, los seis idiomas declarados (ingles, chino, coreano, japones, espanol y ruso) y el conjunto de cuantizaciones ofrecidas.

El interes practico esta en la disponibilidad de cuantizaciones con imatrix (etiquetadas como i1) en rangos desde Q2_K hasta Q6_K, con tamanos que van de 4,0 GB a 7,7 GB. Esto permite ejecutar un modelo de casi 9,2 mil millones de parametros en GPUs de consumo con 8-12 GB de VRAM, algo imposible con los pesos en precision completa (el repositorio completo ocupa 81,3 GB, incluyendo todas las variantes). El modelo esta orientado a razonamiento, matematicas, STEM, uso de herramientas y function calling, segun las etiquetas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun etiquetas; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de un fichero imatrix |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a la familia Qwen 3.5 (tag `qwen3_5`) y a un proceso de destilacion desde DeepSeek (tags `distillation`, `deepseek`). Las etiquetas tambien mencionan SFT, RL y GSPO (Group Sequence Policy Optimization), lo que sugiere un pipeline de ajuste supervisado seguido de aprendizaje por refuerzo. El tag `mtp` podria indicar Multi-Token Prediction, aunque no hay documentacion que lo confirme.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la ventana de contexto nativa ni las tecnicas de atencion empleadas. Tampoco se documenta el proceso de "abliteracion" que aparece en el nombre del modelo base (Tema_Q-Abliterated), un termino que en la practica suele referirse a la eliminacion de direcciones de rechazo en el espacio de activaciones, pero cuyo metodo concreto no se describe en la informacion proporcionada. Cualquier afirmacion sobre estas cuestiones seria especulativa.

## Capacidades

- Generacion de texto conversacional y de un solo turno, segun la etiqueta `conversational`.
- Razonamiento explicito y modos de pensamiento, segun las etiquetas `reasoning` y la presencia de GSPO en el pipeline de entrenamiento.
- Matematicas y tareas STEM, indicado por las etiquetas `math` y `stem`.
- Uso de herramientas y function calling, segun los tags `tool-use` y `function-calling`.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Destilacion de conocimiento desde modelos DeepSeek, lo que en principio transfiere patrones de razonamiento del modelo profesor.
- No se documentan capacidades de vision, audio ni procesamiento multimodal.

## Casos de uso

- Asistente de razonamiento en local para desarrolladores: con cuantizaciones i1-Q4_K_M (5,9 GB) el modelo cabe en una RTX 3060 de 12 GB o una RTX 4070, permitiendo ejecutar tareas de razonamiento paso a paso sin depender de APIs externas.
- Generacion de codigo y scripts en entornos con GPU de consumo: la etiqueta `function-calling` sugiere que puede integrarse en flujos de autocompletado o generacion de llamadas a herramientas dentro de editores y pipelines, aunque no hay benchmarks que cuantifiquen su calidad en HumanEval o similares.
- Resolucion de problemas matematicos y STEM en entornos educativos o de investigacion: el modelo esta etiquetado explicitamente para `math` y `stem`, y su tamano de 9,2B permite desplegarlo en laboratorios con hardware modesto para experimentacion con cadenas de razonamiento.
- Atencion al cliente multilingue en espanol, ingles, chino, coreano, japones o ruso: los seis idiomas declarados cubren mercados diversos, y las cuantizaciones Q4 permiten servir el modelo en una sola GPU de gama media con latencia aceptable para chat.
- Prototipado de agentes con tool calling: la combinacion de `tool-use`, `function-calling` y `reasoning` lo hace candidato para construir agentes que encadenen llamadas a APIs, aunque la ausencia de benchmarks obliga a validar el comportamiento en cada caso concreto.
- Investigacion sobre destilacion y RL: al ser un modelo derivado de DeepSeek con pipeline SFT + RL + GSPO, puede servir como caso de estudio para analizar como se transfieren capacidades de razonamiento a modelos de menor tamano.
- Despliegue en entornos con restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin las restricciones adicionales de otras licencias de modelos abiertos, lo que facilita su integracion en productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin overhead de contexto): i1-Q2_K alrededor de 4,0 GB; i1-IQ3_M alrededor de 4,6 GB; i1-Q4_K_M alrededor de 5,9 GB; i1-Q5_K_M alrededor de 6,7 GB; i1-Q6_K alrededor de 7,7 GB. A estos valores hay que sumar la cache KV, que depende de la longitud de contexto y no puede calcularse sin conocer la ventana nativa.
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB son suficientes para los pesos; para Q6_K conviene una GPU con 10-12 GB libres o mas. En el extremo profesional, A100 o H100 permiten ejecutar el modelo en precision completa o con contextos largos.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas para cuantizaciones Q3/Q4, y con 12 GB o mas para Q5/Q6 con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio tambien incluye la etiqueta `text-generation-inference`, aunque TGI no es el runtime habitual para GGUF; para pesos completos se usaria transformers.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y la longitud de contexto, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF (este) | 9,2B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix de 4,0 a 7,7 GB |
| Qwen 2.5 7B Instruct (referencia de la familia) | 7,6B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo ampliamente documentado y con benchmarks publicos |
| Llama 3.1 8B Instruct | 8,0B | 128K | Llama 3.1 Community License | safetensors, GGUF | Requiere cumplir la licencia de Meta para uso comercial |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa consolidada en el rango 7-8B |

La comparacion es aproximada: no hay benchmarks publicados de este modelo que permitan contrastar calidad frente a las alternativas. La ventaja principal frente a Qwen 2.5 7B o Llama 3.1 8B es la disponibilidad de cuantizaciones imatrix ya generadas y la licencia Apache 2.0 sin restricciones adicionales; la desventaja es la falta de documentacion y de evaluaciones reproducibles.

## Limitaciones y advertencias

- Ausencia casi total de documentacion: la model card no describe arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que impide verificar afirmaciones sobre calidad o seguridad.
- El termino "Abliterated" en el nombre sugiere que se han eliminado direcciones de rechazo del modelo, lo que puede aumentar la probabilidad de generar contenido que el modelo original rechazaria; no se documenta el metodo ni sus efectos.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual ni de calibracion.
- Sesgos conocidos: no documentados. Al derivar de un modelo destilado de DeepSeek y ajustado con datos multilingues, es probable que herede sesgos de esos corpus, pero no hay analisis disponible.
- Limitaciones de contexto e idioma: la ventana de contexto no esta especificada; los seis idiomas declarados no implican calidad uniforme, y no hay evaluaciones por idioma.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el modelo base y los datos de entrenamiento no impongan restricciones adicionales no reflejadas en la etiqueta de licencia.
- Al ser una cuantizacion, las versiones Q2 y Q3 pueden degradar notablemente el razonamiento y la coherencia; para produccion se recomienda Q4_K_M o superior.
- El repositorio ocupa 81,3 GB por incluir todas las variantes; descargar solo el fichero GGUF necesario.
- No hay garantia de mantenimiento: el modelo base y la cuantizacion son contribuciones de terceros sin soporte oficial de DeepSeek ni de Alibaba (Qwen).

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
