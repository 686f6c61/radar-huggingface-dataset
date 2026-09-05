# maternion/ling3-tiny-coder-ckpts

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de tipo MoE (Mixture of Experts) desarrollado por InclusionAI, diseñado para ofrecer razonamiento y capacidades de agente con un coste de inferencia reducido. El checkpoint analizado, `maternion/ling3-tiny-coder-ckpts`, es una variante subida por un usuario a HuggingFace y contiene 7.893.392.800 parámetros totales, de los cuales solo 1.300 millones se activan por token. Esto lo convierte en un modelo ligero en cómputo, pero con una capacidad de contexto amplia de 256.000 tokens.

La arquitectura combina capas de atención KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) en una proporción 3:1, lo que reduce la complejidad del mecanismo de atención y permite manejar secuencias largas de forma eficiente. Según la información disponible, el modelo soporta function calling nativa, prompt caching y modos de razonamiento conmutables (Thinking e Instant), lo que lo hace adecuado para tareas de agente, conversaciones multiturno y análisis de documentos extensos. El nombre del checkpoint sugiere un enfoque en tareas de programación, aunque no se ha publicado documentación específica al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido con apilamiento alternado 3:1 de capas KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) |
| Parametros totales | 7.893.392.800 (7.9B) |
| Parametros activos | 1.3B |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | GGUF (tipos de cuantizacion no especificados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Ling-3.0-tiny utiliza una arquitectura hibrida que alterna capas de atencion KDA y MLA en una proporcion de 3:1. La atencion Kimi Delta Attention (KDA) es un mecanismo disenado para reducir el coste computacional de la atencion en secuencias largas, mientras que la Multi-head Latent Attention (MLA) es una variante eficiente de la atencion multi-cabeza. Esta combinacion permite al modelo manejar un contexto de 256.000 tokens con un coste de inferencia bajo, gracias a que solo 1.3B de los 7.9B parametros se activan por token.

No se han publicado detalles especificos sobre el conjunto de datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La informacion disponible indica que el modelo esta optimizado para agentes de IA, seguimiento de instrucciones y conversaciones multiturno, con soporte nativo de function calling y modos de razonamiento conmutables (Thinking e Instant). El checkpoint en HuggingFace fue subido por el usuario `maternion`, no por el desarrollador original, por lo que no existe documentacion tecnica detallada en el repositorio.

## Capacidades

- Generacion de texto y razonamiento, con un modo "Thinking" para problemas complejos y un modo "Instant" para respuestas rapidas.
- Soporte nativo de function calling / tool calling, lo que permite integrar el modelo en flujos de trabajo automatizados y agentes.
- Capacidad de manejar contextos largos de hasta 256.000 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Prompt caching integrado, que reduce la latencia en interacciones repetitivas con el mismo contexto.
- Orientado a agentes y razonamiento multi-paso, segun la descripcion del modelo en plataformas como Ollama.
- El nombre del checkpoint (`ling3-tiny-coder-ckpts`) sugiere una variante enfocada a tareas de codigo, aunque no hay documentacion que lo confirme.

## Casos de uso

- Agentes de IA autonomos: el modelo puede ejecutar flujos de trabajo complejos con multiples llamadas a herramientas y pasos de razonamiento, aprovechando su function calling nativa y el modo Thinking.
- Atencion al cliente automatizada: con su ventana de contexto de 256K tokens, puede gestionar conversaciones multiturno extensas y recordar informacion detallada del usuario a lo largo de la sesion.
- Generacion de codigo en produccion: la variante "coder" sugiere un uso en entornos de desarrollo, donde el modelo puede asistir en la escritura, revision o refactorizacion de codigo dentro de pipelines de CI/CD.
- Analisis de documentos largos: la capacidad de contexto amplio permite procesar contratos, informes tecnicos o expedientes completos sin necesidad de dividir el texto en fragmentos.
- Asistente de investigacion: el modo Thinking permite abordar preguntas complejas que requieren deduccion en varios pasos, como analisis de datos o resolucion de problemas matematicos.
- Automatizacion de flujos de trabajo empresariales: mediante tool calling, el modelo puede conectarse a APIs externas, bases de datos o sistemas internos para ejecutar tareas como generacion de informes, consultas de datos o envio de mensajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16: aproximadamente 16 GB, asumiendo 7.9B parametros y 2 bytes por parametro, mas overhead del runtime.
- VRAM estimada con cuantizacion GGUF Q8: aproximadamente 8 GB.
- VRAM estimada con cuantizacion GGUF Q4: aproximadamente 4.5 GB.
- GPUs recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16; A100 (40/80 GB) o H100 para despliegues de mayor capacidad.
- Es posible ejecutar el modelo en GPUs de consumo con cuantizacion, como una RTX 3060 de 12 GB en Q4.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles, segun los tags del repositorio de HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Ling-3.0-tiny | 7.9B | 1.3B | 256K | MoE hibrido (KDA + MLA) | no disponible |
| Llama 3.1 8B | 8B | 8B | 128K | Transformer denso | Llama 3.1 Community License |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | MoE (8 expertos) | Apache 2.0 |

No se disponen de datos de benchmarks para comparar el rendimiento de estos modelos en tareas especificas. La comparativa se limita a caracteristicas tecnicas y disponibilidad.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada en la informacion disponible, lo que supone un riesgo para su uso comercial. Es necesario verificar los terminos de uso antes de desplegarlo en produccion.
- Los idiomas soportados no estan documentados, por lo que su rendimiento fuera del ingles es incierto.
- No se han publicado benchmarks oficiales, lo que impide evaluar su rendimiento frente a modelos equivalentes.
- El checkpoint fue subido por un usuario, no por el desarrollador original, por lo que no hay garantia de soporte ni de que los pesos sean exactamente los del modelo oficial.
- Como todo modelo de lenguaje, existe riesgo de alucinacion y de generar contenido incorrecto o desactualizado.
- No se han documentado sesgos conocidos, pero la ausencia de evaluaciones de seguridad y alineacion implica que pueden existir comportamientos no deseados en escenarios sensibles.

## Enlaces

- HuggingFace: https://huggingface.co/maternion/ling3-tiny-coder-ckpts
- Modelo original en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Pagina en Ollama: https://ollama.com/maternion/ling-3.0-tiny
- Ficha en zenmux.ai: https://zenmux.ai/inclusionai/ling-3.0-tiny
- Repositorio GitHub de InclusionAI: https://github.com/inclusionAI/Ling
