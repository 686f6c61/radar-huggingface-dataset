# mradermacher/Athena-mvrko-4B-GGUF

## Resumen

Athena-mvrko-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parametros desarrollado por markopoloaiinc, especializado en prediccion de la siguiente accion de usuarios en contextos de comercio electronico. El modelo se entreno como adaptador LoRA sobre un modelo base no especificado publicamente, utilizando el dataset OPeRA (NEU-HAI/OPeRA), un conjunto de datos de comportamiento de compra en la web. Se enmarca en la categoria de los denominados "large event models", modelos orientados a modelar secuencias de eventos de usuarios en lugar de texto conversacional generico.

La ficha que se presenta corresponde a la cuantizacion GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estaticas en formato GGUF de modelos populares para su uso con llama.cpp y herramientas derivadas. Esta version permite ejecutar el modelo en hardware de consumo, con cuants que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16).

Su relevancia actual radica en el interes creciente por los web agents y la modelizacion del comportamiento de navegacion y compra, un area donde existen pocos modelos abiertos especializados. Al publicarse bajo licencia Apache 2.0, puede utilizarse en proyectos comerciales sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer con adaptador LoRA) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo consiste en un adaptador LoRA aplicado sobre un modelo base de unos 4.000 millones de parametros (markopoloaiinc/Athena-mvrko-4B). La model card original no especifica la arquitectura subyacente, el modelo base del que parte ni los detalles del entrenamiento, por lo que estos datos no estan disponibles. El etiquetado indica que se trata de un "large event model" orientado a la prediccion de la siguiente accion (next-action prediction) en dominios de comercio electronico y agentes web.

El entrenamiento se realizo sobre el dataset OPeRA (NEU-HAI/OPeRA), un conjunto de datos publico de comportamiento de usuarios en sesiones de compra web. No hay informacion disponible sobre el numero de tokens, la composicion detallada del dataset ni el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Prediccion de la siguiente accion de un usuario en flujos de navegacion y compra en e-commerce.
- Modelizacion de comportamiento de compra (shopping behavior) a partir de secuencias de eventos.
- Soporte potencial para agentes web (web agents), segun los tags del modelo.
- Generacion de texto conversacional, heredada del modelo base subyacente (el repositorio esta etiquetado como "conversational"), aunque sin garantias de calidad al no estar documentada.
- Uso con formato GGUF en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio y herramientas compatibles.
- No hay evidencia de capacidades multimodales (vision, audio) ni de tool calling documentadas.

## Casos de uso

- Prediccion de intencion de compra: dado un historial de eventos de navegacion de un usuario, el modelo puede estimar la siguiente accion (anadir al carrito, abandonar, buscar otra categoria), util para sistemas de recomendacion en tiempo real.
- Personalizacion de experiencia en e-commerce: adaptacion dinamica de contenidos, orden de productos o promociones segun la accion prevista del usuario en la sesion actual.
- Simulacion de usuarios para testing: generacion de trayectorias de navegacion sinteticas para probar flujos de checkout o buscadores sin trafico real.
- Agentes de navegacion web: integracion como modulo de decision en agentes que imitan el comportamiento humano al interactuar con tiendas online.
- Analisis de embudos de conversion: modelado de en que punto de la secuencia de eventos los usuarios tienden a abandonar, apoyando decisiones de producto.
- Investigacion en "large event models": punto de partida abierto y ligero (4B) para experimentar con modelado de secuencias de eventos de usuario frente a enfoques tradicionales de CTR prediction.
- Prototipado local de comportamiento de compra: gracias a los cuants GGUF desde 1,8 GB, puede ejecutarse en portatiles para demostraciones y pruebas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: 1,8 GB (Q2_K) a 8,2 GB (f16); se recomienda anadir margen para el contexto (KV cache).
- Cuantizaciones recomendadas por el cuantizador: Q4_K_S (2,5 GB) y Q4_K_M (2,6 GB) por equilibrio velocidad/calidad; Q8_0 (4,4 GB) para maxima calidad.
- Cabe comodamente en GPUs de consumo: cualquier GPU con 4 GB de VRAM (por ejemplo RTX 3050 o superior) ejecuta el Q4_K_M; con 8 GB puede usarse Q8_0 o f16. Tambien funciona en CPU pura dado su tamano reducido.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp o cualquier runtime compatible con GGUF. Para el formato original safetensors, transformers de Hugging Face.
- Latencia y throughput: no disponible; al tratarse de un modelo de 4B con cuants de 4 bits, se espera inferencia fluida incluso en hardware modesto, sin datos publicos que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Athena-mvrko-4B | 4,02 B | no disponible | prediccion de siguiente accion en e-commerce | Apache 2.0 |
| Qwen2.5-3B-Instruct | 3 B | 32.768 tokens | proposito general (se adapta a web agents) | Qwen Research / Apache 2.0 (variantes) |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | proposito general, tool calling | Llama 3.2 Community License |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | proposito general, razonamiento | MIT |

Nota: no existen muchos modelos abiertos directamente comparables especializados en next-action prediction sobre el dataset OPeRA; las alternativas listadas son LLM generales de tamano similar que suelen usarse como base para agentes web, pero no estan afinados para esta tarea.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta afinado para prediccion de acciones en e-commerce; su rendimiento en tareas conversacionales o de proposito general no esta documentado y puede ser inferior al del modelo base.
- Solo ingles: el dataset de entrenamiento es en ingles; no hay soporte documentado para castellano ni otros idiomas.
- Informacion tecnica incompleta: la model card original no publica arquitectura, longitud de contexto, datos de entrenamiento ni benchmarks, lo que dificulta la evaluacion rigurosa.
- Riesgo de alucinacion: no disponible, pero al ser un modelo de 4B afinado con LoRA, debe asumirse el riesgo tipico de modelos pequenos en generacion de texto libre.
- Sesgos: el modelo hereda los sesgos del dataset OPeRA (comportamiento real de usuarios web), que puede contener patrones demograficos o de consumo no representativos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base subyacente, no especificada en la documentacion.
- Cuants estaticos sin imatrix: mradermacher indica que las cuantizaciones ponderadas (imatrix) no estan disponibles de momento; las cuants bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- Para produccion: al carecer de benchmarks publicos, se recomienda evaluacion interna sobre datos propios antes de cualquier despliegue.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Athena-mvrko-4B-GGUF
- Modelo original: https://huggingface.co/markopoloaiinc/Athena-mvrko-4B
- Dataset de entrenamiento (OPeRA): https://huggingface.co/datasets/NEU-HAI/OPeRA
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Athena-mvrko-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
