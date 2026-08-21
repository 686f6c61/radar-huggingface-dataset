# aquaduck/Ornith-1.5-9B-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF Q4_K_M del modelo Ornith-1.5-9B, publicada por Aquaduck como empaquetado de hosting. El modelo base, desarrollado por ornith-ai, es un transformer denso de aproximadamente 9.400 millones de parámetros orientado a generación de código y razonamiento agéntico, con una ventana de contexto nativa de 262.144 tokens. Aquaduck añade además shards de capas intermedias (layer-package-v1) para permitir carga escalonada en entornos multi-nodo o con memoria limitada.

La relevancia de este lanzamiento radica en que ofrece una versión cuantizada de un modelo con contexto extremadamente largo (262K tokens) en un formato compatible con llama.cpp y ecosistemas derivados, lo que permite ejecutarlo en hardware de consumo. El repositorio incluye tanto el archivo GGUF completo como dos mitades de capas (0-15 y 16-31) para despliegue por etapas, aunque estas últimas no son modelos autónomos y requieren el sistema de carga de Aquaduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Ornith-1.5-9B), GQA con 16 cabezas Q y 4 cabezas KV, 32 capas, dimension oculta 4096 |
| Parametros totales | 9.4B segun la model card; el safetensors base indica 4.476.899.584 (~4.48B) — discrepancia no resuelta |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo) |
| Tipos de cuantizacion | Q4_K_M (unico formato en este repo) |
| Idiomas soportados | Multilingue (sin lista especifica en la documentacion) |
| Licencia | other (hereda de ornith-ai/ornith-1.5-9b; fuentes externas citan MIT, pero la model card no lo confirma) |
| Formato de pesos | GGUF (Q4_K_M), safetensors en el modelo base |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un modelo de lenguaje causal denso, sin mezcla de expertos, construido sobre una arquitectura derivada de Qwen3.5 segun fuentes externas. Emplea atencion con consultas agrupadas (GQA) con 16 cabezas de consulta y 4 cabezas de clave/valor, 32 capas y una dimension oculta de 4096. Su caracteristica mas destacada es la ventana de contexto nativa de 262.144 tokens, que lo posiciona para tareas que requieren procesar documentos muy extensos o historiales de conversacion largos.

No se dispone de informacion publica sobre el proceso de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card de este repositorio indica explicitamente que no se trata de un fine-tune, sino de una cuantizacion del modelo base. La cuantizacion Q4_K_M fue realizada por el ecosistema Unsloth/llama.cpp y posteriormente empaquetada por Aquaduck, que ademas genero los shards de capas intermedias cortando el GGUF completo en dos mitades contiguas (capas 0-15 y 16-31) sin alterar los pesos.

## Capacidades

- Generacion de texto y razonamiento conversacional, con soporte de modos thinking e instruct segun la plantilla de chat del modelo base.
- Generacion de codigo y razonamiento agéntico, segun las fuentes externas que describen el modelo como orientado a tareas de programacion y agentes.
- Procesamiento de contexto muy largo (262K tokens), adecuado para documentos extensos, repositorios de codigo completos o historiales de conversacion prolongados.
- Capacidades multilingues, aunque no se detallan los idiomas concretos.
- Soporte de tool calling y function calling: no confirmado en la documentacion disponible, pero la orientacion agéntica del modelo base sugiere compatibilidad; debe verificarse en la model card de ornith-ai/ornith-1.5-9b.
- Carga escalonada mediante shards de capas (solo con el sistema Aquaduck Arc), que permite servir el modelo en dos etapas en dispositivos con memoria limitada.

## Casos de uso

- Asistente de programacion local: el modelo puede completar, revisar y generar codigo en multiples lenguajes gracias a su entrenamiento orientado a tareas de desarrollo, ejecutandose en una GPU de consumo con la cuantizacion Q4_K_M.
- Agente autonomo de navegacion de repositorios: con 262K tokens de contexto, puede ingerir un repositorio completo de tamano medio y responder preguntas sobre arquitectura, dependencias o bugs sin necesidad de RAG externo.
- Analisis de documentacion tecnica extensa: ideal para resumir o extraer informacion de manuales, especificaciones o normativas de cientos de paginas en una sola pasada.
- Atencion al cliente automatizada con historial largo: el contexto nativo permite mantener conversaciones multi-turno muy prolongadas sin perder informacion relevante, reduciendo la necesidad de sistemas de memoria externa.
- Desarrollo de pipelines de CI/CD con generacion de codigo: puede integrarse en entornos de integracion continua para generar tests, documentar cambios o sugerir parches, siempre que se valide la salida antes de aplicarla.
- Despliegue en dispositivos con recursos limitados: gracias a los shards de capas, el modelo puede servirse en dos etapas en hardware con poca VRAM, aunque requiere el ecosistema Aquaduck para esta modalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite a la del modelo base (ornith-ai/ornith-1.5-9b) para cualquier evaluacion, y una fuente externa menciona una discrepancia entre los resultados locales y los benchmarks publicados, pero sin ofrecer cifras concretas. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M pesa aproximadamente 5.63 GB, por lo que se necesita al menos 7-8 GB de VRAM para cargar el modelo completo con overhead de contexto. Con contexto de 262K tokens, la memoria requerida crece significativamente; para contextos largos se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4090, o GPUs de datacenter como A10 o L4. Para contextos maximos, se recomienda una GPU con 24 GB o mas.
- En consumer GPU: si, cabe en tarjetas con 12 GB o mas para contextos moderados. Para contextos cercanos al maximo, se necesitan 24 GB o mas.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama, y el cliente de escritorio Aquaduck para la carga escalonada. vLLM puede soportar GGUF en versiones recientes, pero no esta confirmado para este modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, la longitud del contexto y el backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Ornith-1.5-9B (este repo) | 9.4B (segun card) | 262.144 | other (posible MIT) | GGUF Q4_K_M | Codigo y agente |
| Qwen2.5-7B-Instruct | 7.6B | 131.072 | Apache 2.0 | Safetensors, GGUF | Generalista |
| Llama-3.1-8B-Instruct | 8.0B | 131.072 | Llama 3.1 Community | Safetensors, GGUF | Generalista |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2.4B activos) | 16.384 | DeepSeek License | Safetensors, GGUF | Codigo |

No se dispone de datos de rendimiento comparativos fiables. La principal ventaja de Ornith-1.5-9B frente a alternativas de tamano similar es su contexto nativo de 262K tokens, muy superior a los 128K de Qwen2.5-7B o Llama-3.1-8B. Sin embargo, la licencia "other" y la falta de benchmarks publicados dificultan su adopcion en entornos corporativos sin una evaluacion previa.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M puede degradar la calidad de las respuestas frente a la version en precision completa, especialmente en tareas de razonamiento complejo o generacion de codigo.
- Los shards de capas incluidos en este repositorio no son modelos completos: no funcionan con llama.cpp estandar y solo son utilizables con el sistema de carga de Aquaduck.
- La licencia "other" es ambigua: la model card indica que hereda la del modelo base, pero no especifica los terminos exactos. Algunas fuentes externas citan MIT, pero no esta confirmado. Se recomienda revisar la licencia de ornith-ai/ornith-1.5-9b antes de uso comercial.
- No se han publicado evaluaciones de sesgos, alucinaciones o riesgos especificos para este modelo. La model card remite a la del modelo base, que tampoco detalla estos aspectos en la informacion disponible.
- La discrepancia entre los parametros declarados (9.4B) y el peso del safetensors base (~4.48B) no esta explicada y podria indicar un error en la documentacion o una arquitectura con embeddings compartidos.
- El contexto de 262K tokens requiere una gestion cuidadosa de memoria: en hardware de consumo, el uso de la ventana completa puede provocar desbordamiento de VRAM o latencias muy altas.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/aquaduck/Ornith-1.5-9B-GGUF
- Modelo base (safetensors): https://huggingface.co/ornith-ai/ornith-1.5-9b
- Fuente de cuantizacion GGUF: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Articulo sobre resultados locales y brecha de benchmarks: https://www.mindstudio.ai/blog/ornith-1-5-9b-local-test
- Guia de ejecucion local (hardware y benchmarks): https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Perfil de Aquaduck en HuggingFace: https://huggingface.co/aquaduck
