# frazer-nyambe/zambia-knowledge-llama3.2-gguf

## Resumen

zambia-knowledge-llama3.2-gguf es un ajuste fino (fine-tuning) del modelo Llama-3.2-3B-Instruct, orientado a incorporar conocimiento sobre Zambia, distribuido en formato GGUF por el autor frazer-nyambe. El repositorio contiene unicamente un fichero cuantizado Q4_K_M, lo que lo hace directamente utilizable en llama.cpp y en despliegues de bajos recursos. El modelo base es un transformer denso de aproximadamente 3.210 millones de parametros (3.212.749.888 segun los datos de safetensors), con una ventana de contexto que hereda de Llama 3.2 (128.000 tokens en el modelo original, aunque no se confirma en la model card).

El proceso de ajuste fino y conversion a GGUF se realizo con Unsloth, una libreria que acelera el entrenamiento y simplifica la exportacion a formatos cuantizados. El autor indica que el comportamiento del token BOS se ajusto para garantizar compatibilidad con GGUF. Se trata de un modelo conversacional de nicho, con cero descargas y cero likes en el momento de la ficha, lo que sugiere un proyecto personal o experimental mas que un lanzamiento consolidado.

Su relevancia radica en el caso de uso: un modelo pequeno (3B), cuantizado a 4 bits, que puede ejecutarse en hardware de consumo y servir como base para asistentes especializados en contexto zambiano. No obstante, la ausencia de licencia explicita, de idiomas declarados y de benchmarks publicados limita seriamente su evaluacion y su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.888 (aprox. 3,21 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.2 admite 128.000 tokens) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `Llama-3.2-3B-Instruct.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y normalizacion RMSNorm, propio de la familia Llama 3. El ajuste fino se realizo sobre este modelo base con la libreria Unsloth, que segun la model card permitio un entrenamiento "2x mas rapido". No se especifica el numero de tokens de entrenamiento, la composicion del dataset de conocimiento zambiano, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado; la model card solo indica que el modelo fue "finetuned and converted to GGUF format using Unsloth".

La unica innovacion tecnica documentada es el ajuste del comportamiento del token BOS para asegurar la compatibilidad con el formato GGUF, un detalle relevante porque un BOS mal configurado puede degradar la calidad de las respuestas en llama.cpp. El repositorio incluye ademas un Modelfile de Ollama para facilitar el despliegue. No hay informacion sobre la mezcla de datos, el regimen de entrenamiento ni la evaluacion posterior al ajuste.

## Capacidades

- Generacion de texto conversacional en formato instruccional, heredado de Llama-3.2-3B-Instruct.
- Respuestas multi-turno con plantilla de chat compatible con `--jinja` en llama.cpp.
- Conocimiento especializado sobre Zambia (el proposito declarado del ajuste fino), aunque no se detalla su alcance ni su cobertura.
- Soporte de tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponibles; la model card menciona el comando `llama-mtmd-cli` para modelos multimodales como ejemplo generico, no como caracteristica de este modelo.
- Compatibilidad con Ollama mediante el Modelfile incluido.

## Casos de uso

- Asistente de informacion sobre Zambia: el modelo puede responder preguntas sobre contexto local (instituciones, geografia, cultura) en un chatbot ligero, aprovechando el ajuste especifico y su tamano reducido para ejecutarse en portatiles.
- Despliegue en hardware de consumo: con cuantizacion Q4_K_M y unos 2 GB de fichero, cabe en GPU con 4-6 GB de VRAM o incluso en CPU, lo que permite prototipos locales sin infraestructura cloud.
- Educacion y divulgacion: como tutor de bajo coste para material introductorio sobre Zambia, con la salvedad de que requiere verificacion humana por riesgo de alucinacion.
- Base para futuros ajustes: al ser un GGUF de 3B, puede servir como punto de partida o referencia para comparar tecnicas de fine-tuning con Unsloth en dominios geograficos concretos.
- Integracion en llama.cpp y Ollama: el Modelfile incluido permite levantar un endpoint local compatible con la API de Ollama para pruebas de concepto y demos.
- Generacion de borradores de texto en ingles (idioma del modelo base), siempre con revision posterior, en entornos donde no se dispone de GPU dedicada.
- Experimentacion academica: comparar el rendimiento de un modelo 3B ajustado en un dominio especifico frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con cuantizacion Q4_K_M (fichero de 2,0 GB mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); en el extremo alto, A100 o H100 no aportan ventaja significativa para un modelo de 3B.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas, y tambien en CPU gracias al formato GGUF.
- Opciones de despliegue: llama.cpp (`llama-cli -hf frazer-nyambe/zambia-knowledge-llama3.2-gguf --jinja`), Ollama mediante el Modelfile incluido; vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput estimados: no disponibles; en un modelo 3B Q4_K_M en GPU de consumo es habitual obtener decenas de tokens por segundo, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zambia-knowledge-llama3.2-gguf | 3,21 B | no disponible (base: 128k) | GGUF Q4_K_M | no disponible | Hugging Face, 0 descargas |
| Llama-3.2-3B-Instruct (Meta) | 3,21 B | 128.000 tokens | safetensors, GGUF oficial | Llama 3.2 Community License | Amplia, muy extendida |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Amplia |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | safetensors, GGUF | MIT | Amplia |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no hay datos de rendimiento de este ajuste fino que permitan comparar calidad. La principal diferencia frente a las alternativas es el dominio especializado y la ausencia de licencia declarada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base Llama 3.2 antes de cualquier despliegue en produccion.
- Idiomas no declarados: el modelo base esta orientado al ingles; el comportamiento en castellano o en lenguas zambianas no esta documentado.
- Riesgo de alucinacion: un ajuste fino de 3B sobre un dominio especifico puede generar datos plausibles pero incorrectos sobre Zambia; requiere verificacion con fuentes primarias.
- Sin benchmarks: no hay evidencia publicada de mejora frente al modelo base ni de calidad en el dominio objetivo.
- Un solo fichero cuantizado (Q4_K_M): no hay versiones en precision completa ni otras cuantizaciones, lo que limita la evaluacion de la degradacion por cuantizacion.
- Senales de proyecto experimental: cero descargas y cero likes, creado y actualizado en el mismo dia, sin pipeline declarado; no hay garantia de mantenimiento.
- Ajuste del token BOS: aunque se corrigio para GGUF, conviene validar la plantilla de chat con `--jinja` para evitar respuestas degradadas.
- Sesgos: no documentados; al heredar el corpus de Llama 3.2, puede reproducir sesgos del modelo base, agravados por la falta de informacion sobre el dataset de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frazer-nyambe/zambia-knowledge-llama3.2-gguf
- Perfil del autor: https://huggingface.co/frazer-nyambe
- Modelo relacionado del autor (Llama 3.1 con conocimiento zambiano): https://huggingface.co/frazer-nyambe/finetuned-llama3.1-with_zambian_knowledge
- Unsloth (libreria de entrenamiento y conversion): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
