# Dhunun/OwnedLM-Jais-3-0.9B

## Resumen

Jais-3-0.9B es el miembro compacto y denso de la familia Jais-3, un modelo decoder-only de clase 0.9B con una ventana de contexto de 128K tokens. Segun la model card, esta desarrollado por el equipo de IFM (Inception42), aunque el repositorio analizado se distribuye bajo la cuenta Dhunun/OwnedLM-Jais-3-0.9B. El modelo se presenta como una alternativa ligera para generacion de texto, razonamiento y conversacion, con foco en arabe e ingles.

El interes principal esta en su combinacion de tamano reducido (1.078.285.824 parametros reales segun los pesos safetensors) y contexto muy largo (128K), algo poco habitual en modelos de menos de 1B. Esto lo hace relevante para despliegues con recursos limitados que necesiten procesar documentos extensos o mantener conversaciones de muchos turnos sin truncar.

La ficha se basa en la informacion disponible en el repositorio de Hugging Face y en la model card del autor. No se han publicado detalles sobre composicion del dataset de entrenamiento ni sobre el proceso de alineacion, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense, decoder-only (transformer) |
| Parametros totales | 1.078.285.824 (~0.9B segun el autor) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF (llama.cpp/Ollama), MLX 4-bit, MLX 8-bit, bf16 |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers), GGUF, MLX |

## Arquitectura y entrenamiento

La model card describe Jais-3-0.9B como un modelo denso decoder-only, con codigo personalizado (tag `custom_code` y arquitectura `k2_horizon` en los metadatos del repositorio). No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo exacto de atencion empleado para soportar los 128K tokens de contexto. Tampoco se detalla si se uso atencion lineal, RoPE escalado u otra tecnica de extension de contexto.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). Estos datos deben considerarse no disponibles a partir de la informacion proporcionada.

## Capacidades

- Generacion de texto en arabe e ingles.
- Razonamiento y conversacion multi-turno (tags `reasoning` y `conversational`).
- Procesamiento de contexto largo: ventana de 128K tokens, adecuada para documentos extensos y dialogos prolongados.
- Compatibilidad con el ecosistema transformers mediante codigo personalizado.
- Formatos alternativos para despliegue local: GGUF (llama.cpp/Ollama) y MLX (Apple silicon) en 4-bit, 8-bit y bf16.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no confirmadas de forma explicita en la model card.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Analisis de documentos largos en arabe: el modelo puede ingerir contratos, informes o articulos de hasta 128K tokens en una sola pasada, lo que permite resumir o extraer informacion sin fragmentar el texto y perder coherencia entre secciones.
- Atencion al cliente en arabe e ingles: gracias a su ventana de contexto y a su orientacion conversacional, puede mantener historiales de conversacion extensos y recordar detalles de interacciones previas dentro de la misma sesion.
- Generacion de texto en entornos con recursos limitados: con ~1B parametros, cabe en GPUs de consumo y en hardware Apple silicon mediante los formatos MLX, lo que facilita prototipos y despliegues edge.
- Procesamiento por lotes de textos multilingues: su licencia Apache 2.0 permite integrarlo en pipelines de clasificacion, resumen o reescritura de contenido en arabe e ingles sin restricciones comerciales.
- Asistente de documentacion tecnica bilingue: puede redactar y traducir contenido entre arabe e ingles manteniendo contexto largo de guias o manuales.
- Experimentacion e investigacion: al ser un modelo pequeno y abierto, es util para estudiar el comportamiento de contextos de 128K en modelos de menos de 1B y para fine-tuning en dominios especificos.
- Despliegue local con Ollama o llama.cpp: los pesos GGUF permiten ejecutar el modelo en estaciones de trabajo sin GPU dedicada, util para demos y pruebas offline.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos con Qwen3.5-2B, Falcon-H1-1.5B-Deep-Instruct, Hala 1.2B y tiny-aya-global, pero en la informacion proporcionada solo se muestran las filas de parametros, parametros activos y arquitectura; los valores numericos de las tareas de generacion no estan disponibles en el extracto. Por tanto, no se presentan cifras de MMLU, HumanEval, GSM8K ni de otras tareas.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 5 GB dependiendo de la longitud de contexto.
- VRAM estimada en cuantizacion 8-bit: en torno a 1,1-1,5 GB para pesos.
- VRAM estimada en cuantizacion 4-bit: en torno a 0,6-0,9 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles. Para contexto completo de 128K, la cache KV incrementa notablemente los requisitos y conviene usar GPUs con 24 GB o mas.
- Cabe en GPU de consumo: si, en modelos como RTX 3060/4060/4090, especialmente con cuantizacion GGUF o MLX.
- Opciones de despliegue: transformers (con codigo personalizado), llama.cpp, Ollama (via GGUF), MLX en Apple silicon. vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Jais-3-0.9B | 0.9B | 128K | Apache 2.0 | Safetensors, GGUF, MLX | Denso, arabe/ingles |
| Qwen3.5-2B | 2B | No disponible | No disponible | No disponible | Referencia en la model card |
| Falcon-H1-1.5B-Deep-Instruct | 1.5B | No disponible | No disponible | No disponible | Referencia en la model card |
| Hala 1.2B | 1.2B | No disponible | No disponible | No disponible | Referencia en la model card |
| tiny-aya-global | 3B | No disponible | No disponible | No disponible | Referencia en la model card |

Los datos de contexto, licencia y formatos de los modelos de referencia no se detallan en la informacion proporcionada; solo se confirman sus tamanos y que son densos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con datos web, es esperable un sesgo hacia las lenguas y culturas dominantes en el corpus, pero no se confirma.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones publicadas de factualidad.
- Limitaciones de contexto: aunque la ventana es de 128K, no se especifica la calidad de recuperacion en posiciones intermedias ni si el entrenamiento cubre esa longitud completa.
- Limitaciones de idioma: solo se declaran arabe e ingles; el rendimiento en castellano u otras lenguas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo incluye codigo personalizado (`custom_code`) que debe revisarse antes de integrarlo en produccion.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validacion comunitaria; conviene auditar los pesos y el codigo antes de desplegarlo.
- No se dispone de informacion sobre el proceso de alineacion, por lo que el cumplimiento de instrucciones y la seguridad conversacional no estan verificados.

## Enlaces

- Hugging Face: https://huggingface.co/Dhunun/OwnedLM-Jais-3-0.9B
- Coleccion Jais-3 (IFM): https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- GGUF: https://huggingface.co/IFM/Jais-3-0.9B-GGUF
- MLX 4-bit: https://huggingface.co/IFM/Jais-3-0.9B-MLX-4bit
- MLX 8-bit: https://huggingface.co/IFM/Jais-3-0.9B-MLX-8bit
- MLX bf16: https://huggingface.co/IFM/Jais-3-0.9B-MLX-bf16
- Paper referenciado en los tags: arxiv:2611.10224 (no verificado en la informacion disponible)
