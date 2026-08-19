# Ateron/Gemma-4-Dark-Thoughts-V2-31B

## Resumen

Gemma-4-Dark-Thoughts-V2-31B es un modelo de lenguaje de 31 273 millones de parámetros creado por Ateron mediante fusión (merge) de tres modelos base de la familia Gemma 4: Dark-Scarlett-v2.0-31B, G4-MeroMero-v2-31B y gemma-4-31B-it-scotoma-2. El modelo está orientado a tareas de roleplay y conversación, y su autor indica que la versión V2 corrige problemas de tool calling y de razonamiento en contextos largos que presentaba la V1. Se distribuye con licencia Apache 2.0 y solo en inglés.

El proceso de fusión se realizó con mergekit utilizando el método `dare_ties` en dos fases, con configuraciones detalladas que combinan pesos de atención y MLP de los modelos fuente. El repositorio ocupa 62,6 GB en formato safetensors, lo que sugiere que los pesos están en precisión bfloat16. Aunque no se publican benchmarks, el modelo se presenta como una opción para aplicaciones de generación de texto conversacional y creativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 4, sin detalle) |
| Parametros totales | 31 273 088 876 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un merge de tres modelos base de la familia Gemma 4, todos de 31B parámetros. La fusión se realizó con mergekit usando el método `dare_ties` en dos fases. La fase 1 combina Dark-Scarlett-v2.0-31B y G4-MeroMero-v2-31B con densidades de 0,50 y pesos por capa que varían entre 0,40 y 0,60. La fase 2 incorpora gemma-4-31B-it-scotoma-2 con densidades de 0,60 y pesos específicos para proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y MLP. No se proporciona información sobre el entrenamiento original de los modelos base, ni sobre datos de entrenamiento, RLHF o técnicas adicionales. El tokenizer se toma del modelo base Gemma 4.

## Capacidades

- Generacion de texto conversacional y roleplay, segun la descripcion del autor.
- Soporte de tool calling / function calling, mejorado en la version V2 respecto a la V1.
- Manejo de contextos largos en escenarios de roleplay, tambien corregido en V2.
- Generacion de narrativa creativa y dialogo de personajes.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se mencionan capacidades de vision, audio o modo de razonamiento explicito.

## Casos de uso

- Chatbots de roleplay: el modelo puede mantener conversaciones multi-turno con personajes ficticios, aprovechando su enfoque en roleplay y su mejora en contextos largos.
- Asistentes conversacionales en ingles: adecuado para aplicaciones de atencion al cliente o companeros de chat que requieran un tono natural y creativo.
- Generacion de narrativa interactiva: puede usarse en juegos de texto o historias ramificadas donde el modelo genera respuestas coherentes con la trama.
- Simulacion de personajes para guiones o escritura creativa: util para autores que necesiten explorar dialogos y personalidades.
- Prototipado de agentes conversacionales con tool calling: gracias al soporte de function calling, puede integrarse en pipelines que requieran llamadas a APIs o acciones externas.
- Experimentacion con tecnicas de fusion de modelos: al ser un merge con configuracion publica, sirve como caso de estudio para desarrolladores interesados en mergekit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 62,6 GB en bfloat16, por lo que se necesitan al menos 62,6 GB de VRAM para cargar el modelo sin cuantizacion. Con cuantizacion a 8 bits se reduciria a ~31 GB, y a 4 bits a ~16 GB, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: para la carga completa en bfloat16 se requieren GPUs de alta gama como NVIDIA A100 80GB, H100 80GB o similares. Con cuantizacion podria caber en una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB), pero no hay confirmacion.
- Opciones de despliegue: no se especifican, pero al ser un modelo safetensors compatible con el ecosistema Hugging Face, podria usarse con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos. Dado que es un merge de Gemma 4 31B, podria compararse con otros merges de la misma familia, pero no hay datos publicados.

## Limitaciones y advertencias

- Modelo de fusion, no entrenado desde cero: las capacidades y sesgos dependen de los modelos base, que no se detallan.
- Solo soporta ingles, lo que limita su uso en otros idiomas.
- No se publican benchmarks, por lo que el rendimiento real en tareas estandar es desconocido.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos.
- El autor menciona que la V1 tenia problemas de tool calling y razonamiento en contextos largos; aunque la V2 los corrige, no hay garantias de robustez en produccion.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los modelos base (Gemma 4 de Google DeepMind) para verificar compatibilidad.

## Enlaces

- [Hugging Face - Ateron/Gemma-4-Dark-Thoughts-V2-31B](https://huggingface.co/Ateron/Gemma-4-Dark-Thoughts-V2-31B)
- [LLM Explorer - Gemma 4 Dark Thoughts 31B](https://llm-explorer.com/model/Ateron%2FGemma-4-Dark-Thoughts-31B,2b9KSRF7SJFFCqXknuUgum)
- [Google DeepMind - Gemma 4](https://deepmind.google/models/gemma/gemma-4/)
- [Cerebras Inference - Gemma 4 31B](https://inference-docs.cerebras.ai/models/gemma-4-31b)
