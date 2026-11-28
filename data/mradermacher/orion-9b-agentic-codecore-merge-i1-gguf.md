# mradermacher/Orion-9B-Agentic-CodeCore-Merge-i1-GGUF

## Resumen

Orion-9B-Agentic-CodeCore-Merge-i1-GGUF es la distribucion en formato GGUF del modelo Orion-9B-Agentic-CodeCore-Merge, un merge de modelos orientado a tareas de agente, razonamiento con cadena de pensamiento (chain-of-thought), uso de herramientas y generacion de codigo. El modelo original lo publica prithivMLmods y esta cuantizado por mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF con metodologia imatrix. El repositorio contiene unicamente los pesos cuantizados, no el modelo en precision original.

El modelo parte de una base etiquetada como qwen3_5 y ha sido construido mediante tecnicas de merge (omnimergekit) combinadas con ajuste fino supervisado (SFT) sobre capacidades de agente y codigo. Con 9.197.093.888 parametros (aproximadamente 9,2 mil millones), se situa en la franja de modelos de 9B que pueden ejecutarse en GPU de consumo con cuantizaciones de 4 bits. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

La relevancia de esta ficha reside en que el repositorio ofrece un abanico amplio de cuantizaciones (desde Q2_K de 4,0 GB hasta Q6_K de 7,7 GB, ademas de variantes IQ), lo que permite desplegar el modelo en hardware muy diverso con llama.cpp u Ollama. No obstante, la informacion publicada es escasa: no hay datos de contexto, benchmarks ni detalles del dataset de entrenamiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base etiquetada como qwen3_5 en los tags; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); estaticas en repositorio separado |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de los tags, que indican una base qwen3_5 y el uso de omnimergekit para el merge. Se trata, por tanto, de un modelo derivado de una familia Qwen de tercera generacion (segun la etiqueta), fusionado con otros modelos especializados en agente, codigo y razonamiento. El proceso combina merge de pesos con ajuste fino supervisado (SFT) orientado a tool use, function calling y chain-of-thought.

No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La cuantizacion i1 de mradermacher utiliza una matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que en la practica mejora la calidad de las cuantizaciones de baja profundidad de bits frente a las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno (tag conversational).
- Razonamiento con cadena de pensamiento explicita (reasoning, chain-of-thought).
- Generacion y asistencia en codigo (coder).
- Uso de herramientas y function calling (tool-use, function-calling).
- Comportamiento orientado a agentes, incluyendo razonamiento multi-paso.
- Capacidad de vision segun la model card del cuantizador (menciona que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico); no se confirma disponibilidad efectiva de pesos multimodales.
- Soporte multilingue limitado al ingles declarado.

## Casos de uso

- Agente de codigo en local: el modelo puede ejecutar tareas de generacion y refactorizacion de codigo con llamadas a herramientas, desplegado con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo gracias a sus cuantizaciones de 5-7 GB.
- Automatizacion de pipelines CI/CD: integrado como paso de generacion o revision de parches mediante function calling, el modelo puede invocar APIs de build y tests dentro de un flujo agente.
- Asistente de terminal para desarrolladores: con la cuantizacion i1-Q4_K_M (5,9 GB) cabe en GPUs de 8-12 GB y permite respuestas interactivas con contexto de conversacion local sin enviar codigo a la nube.
- Prototipado de agentes multi-paso: sus capacidades de razonamiento y tool use permiten construir bucles de planificacion-ejecucion para tareas de automatizacion de escritorio o web scraping controlado.
- Evaluacion de tecnicas de merge: al ser un modelo fusionado, resulta util como caso de estudio para investigadores que comparan el comportamiento de merges frente a modelos base en tareas de codigo y agente.
- Despliegue en entornos con requisitos de privacidad: la licencia Apache 2.0 y la ejecucion local permiten usar el modelo en entornos donde no se puede enviar informacion a servicios externos.
- Educacion y experimentacion: las cuantizaciones pequenas (i1-Q2_K de 4,0 GB) permiten probar el modelo en portatiles con GPU modesta o incluso en CPU, con la correspondiente perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,0 GB (i1-Q2_K), 5,4-5,9 GB (IQ4_XS / Q4_K_M), 6,6-6,7 GB (Q5_K_M) y 7,7 GB (Q6_K), mas overhead de contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en datacenter, A10, L4, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB con cuantizaciones Q4 y contexto moderado; con 12-16 GB se puede usar Q5/Q6 y contextos mas amplios.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (tag TGI) y servidores compatibles con la API de endpoints; vLLM requeriria los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orion-9B-Agentic-CodeCore-Merge (i1-GGUF) | 9,2B | no disponible | Apache 2.0 | GGUF (i1) | Merge orientado a agente y codigo; solo ingles |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Referencia en codigo, ampliamente desplegado |
| Llama-3.1-8B-Instruct | 8,0B | 128K (segun documentacion publica de Meta) | Llama 3.1 Community License | safetensors, GGUF | Buen equilibrio general, licencia con restricciones |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2,4B activos) | 128K (segun documentacion publica) | DeepSeek License | safetensors | Mayor coste de VRAM, mejor rendimiento en codigo |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no se dispone de benchmarks del modelo Orion para contrastar rendimiento real.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- No se publican datos de contexto maximo, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- Al ser un merge, puede heredar sesgos y comportamientos inconsistentes de los modelos fusionados; no hay evaluacion de sesgos publicada.
- Riesgo de alucinacion en tareas de codigo y function calling, especialmente en cuantizaciones muy bajas (Q2_K, IQ2) donde la calidad se degrada.
- La model card del cuantizador menciona vision, pero no se confirma la disponibilidad de ficheros mmproj ni de pesos multimodales; conviene verificar antes de asumir capacidades de vision.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes del merge podrian tener condiciones adicionales no documentadas en esta ficha.
- El repositorio pesa 81,3 GB e incluye multiples cuantizaciones; descargar solo el fichero necesario para evitar consumo innecesario de disco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Orion-9B-Agentic-CodeCore-Merge-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Orion-9B-Agentic-CodeCore-Merge
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Orion-9B-Agentic-CodeCore-Merge-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Orion-9B-Agentic-CodeCore-Merge-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
