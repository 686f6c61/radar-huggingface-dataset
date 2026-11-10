# MiniMaxAI/MiniMax-H3-Image-PE

## Resumen

MiniMax-H3-Image-PE es un modelo de expansion de prompts (prompt expansion, PE) desarrollado por MiniMaxAI como componente auxiliar del sistema de generacion de imagenes MiniMax-H3-Image. Su funcion es transformar una instruccion breve del usuario en una descripcion detallada de la imagen pretendida, acompanada de una recomendacion de relacion de aspecto, que despues alimenta al modelo de difusion encargado de generar la imagen final. No es, por tanto, un modelo generativo de imagenes, sino un modelo de lenguaje especializado en la reescritura y el enriquecimiento de prompts.

Tecnicamente es un fine-tuning de Qwen3.8-27B, con 27.356.728.560 parametros totales (unos 27,36 mil millones) y pesos publicados en safetensors con cuantizacion FP4 de 8 bits mediante NVIDIA ModelOpt. El repositorio ocupa 17,9 GB y esta pensado para servirse con SGLang en modo LLM, con decodificacion restringida por gramatica (XGrammar) para forzar la salida a un esquema JSON valido.

Su relevancia actual radica en que la calidad de los modelos texto-a-imagen depende en gran medida de la calidad del prompt, y este modelo automatiza esa ingenieria de prompts con un LLM de 27B afinado especificamente para la tarea. La licencia es la MiniMax-H3-Image Community License Agreement, de tipo "other", lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen3.8-27B, tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 (unos 27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (8-bit, via NVIDIA ModelOpt); pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | safetensors (transformers), compatible con SGLang |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.8-27B mediante fine-tuning supervisado para la tarea de expansion de prompts. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion principal no reside en la arquitectura, sino en el pipeline de inferencia: el modelo se sirve con SGLang (version recomendada >= 0.5.23) y XGrammar (>= 0.2.7) para decodificacion restringida por gramatica, de modo que la salida queda forzada a un esquema JSON valido que contiene la descripcion expandida y la recomendacion de relacion de aspecto. Ademas, se usa el reasoning parser de Qwen3 para separar el razonamiento interno de la respuesta final.

El flujo de uso incluye tres artefactos de prompt: un system prompt, un task prompt con un marcador `.format(user_query)` donde se inserta la instruccion del usuario, y un fichero `request_params.json` con los parametros de la peticion. El modelo se publica en cuantizacion FP4 de 8 bits, lo que reduce el peso en memoria respecto a los pesos en BF16 del modelo base. Para la variante de edicion de imagenes (image editing PE) solo se libera el task prompt, no los pesos: segun la model card, ese flujo sigue en desarrollo y requiere un modelo vision-lenguaje a eleccion del usuario para el ensamblado de mensajes.

## Capacidades

- Expansion de prompts texto-a-imagen: convierte una instruccion corta en una descripcion detallada de la imagen objetivo.
- Recomendacion de relacion de aspecto para la generacion de imagen.
- Salida estructurada en JSON garantizada mediante decodificacion restringida por gramatica (XGrammar).
- Separacion entre razonamiento y respuesta final gracias al reasoning parser de Qwen3.
- Soporte de prompt de tarea para expansion de prompts de edicion de imagenes (solo prompt, sin pesos en esta release).
- Capacidades de generacion de texto y conversacion heredadas del modelo base Qwen3.8-27B (pipeline `text-generation`).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue via SGLang.
- No se documentan capacidades de tool calling, agentes, vision nativa ni audio en la informacion disponible.

## Casos de uso

- Generacion de imagenes asistida en produccion: el modelo recibe la instruccion breve del usuario final y devuelve un prompt enriquecido y una relacion de aspecto, que se pasan directamente a MiniMax-H3-Image o a la API de generacion; reduce la dependencia de que el usuario sepa escribir prompts detallados.
- Frontend de creacion visual para no tecnicos: integrado tras un campo de texto simple, permite que disenadores o marketers obtengan resultados de mayor calidad sin conocer la sintaxis de prompting del modelo de difusion.
- Pipelines automatizados de contenido: en la generacion masiva de ilustraciones para blogs, catalogos o campanas, el PE normaliza y enriquece plantillas de prompt antes de cada llamada al generador, mejorando la consistencia de los resultados.
- Prototipado rapido de escenas: dado un concepto escueto ("gato atado durmiendo junto a una ventana"), el modelo produce la descripcion completa con iluminacion, composicion y estilo, acelerando la iteracion creativa.
- Servicio de API propio: desplegado con SGLang en un endpoint compatible con la API de chat completions, puede exponerse como microservicio de expansion de prompts para multiples aplicaciones internas.
- Investigacion en ingenieria de prompts: sirve como baseline afinado para estudiar como la expansion automatica de prompts afecta a metricas de calidad en modelos texto-a-imagen.
- Preparacion de flujos de edicion de imagenes: usando el task prompt de edicion liberado, se puede montar el ensamblado de mensajes hacia un VLM para reescribir instrucciones de edicion (funcionalidad en desarrollo segun el autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,36 B parametros en FP4 de 8 bits, el peso de los pesos ronda los 14-15 GB; sumando cache KV y overhead del runtime, se recomienda un minimo de 24 GB de VRAM y 32-48 GB para contextos largos y concurrencia (estimacion, no publicada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para despliegue en produccion con SGLang.
- GPU de consumo: el modelo puede caber en RTX 4090 (24 GB) en configuracion ajustada y poca concurrencia; en RTX 3090 (24 GB) el margen es menor. No se garantiza en GPUs de 16 GB o menos.
- Opciones de despliegue: SGLang es la via recomendada por el autor (con `--model-type llm`, `--reasoning-parser qwen3` y `--grammar-backend xgrammar`). El uso con vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible; al ser pesos safetensors de transformers, la integracion con otros runtimes requeriria conversion y no esta garantizada.
- Latencia y throughput: no disponibles; dependen del hardware, del backend y de la longitud del prompt expandido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-PE | 27,36 B | no disponible | Expansion de prompts para T2I | MiniMax-H3-Image Community License | Pesos abiertos en HF (FP4) |
| Qwen3.8-27B (modelo base) | ~27 B | no disponible | LLM generalista | segun Qwen | Pesos abiertos en HF |
| MiniMax-H3-Image | no disponible | no disponible | Generacion de imagenes texto-a-imagen | MiniMax-H3-Image Community License | Pesos abiertos en HF |

No se dispone de datos de benchmarks ni de modelos de expansion de prompts directamente comparables en la informacion proporcionada; la comparacion se limita a parametros, funcion y licencia.

## Limitaciones y advertencias

- Modelo especializado: esta afinado para expansion de prompts de imagen; su uso como LLM generalista puede degradar la calidad respecto al modelo base.
- Solo ingles: la model card declara unicamente el idioma `en`; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: al generar descripciones detalladas, puede inventar elementos no solicitados por el usuario; conviene validar la salida antes de pasarla al generador de imagenes.
- Flujo de edicion de imagenes incompleto: solo se libera el task prompt, no los pesos; la funcionalidad esta marcada como en desarrollo.
- Licencia restrictiva: la MiniMax-H3-Image Community License Agreement es de tipo "other"; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Dependencia de infraestructura especifica: el pipeline recomendado exige SGLang y XGrammar con versiones minimas concretas; otras pilas de inferencia no estan soportadas oficialmente.
- Longitud de contexto no documentada: limita la planificacion de cargas con prompts de usuario muy largos.
- Sin datos de benchmarks publicados: no es posible evaluar su calidad objetiva frente a alternativas sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo de generacion de imagenes MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Web oficial: https://www.minimax.io
- Plataforma API: https://platform.minimax.io
- Documentacion API generacion texto-a-imagen: https://platform.minimax.io/docs/api-reference/image-generation-h3-generations
- Documentacion API edicion de imagenes: https://platform.minimax.io/docs/api-reference/image-generation-h3-edits
- Documentacion API expansion de prompts: https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir
- Hailuo AI: https://hailuoai.video
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
- Contacto WeChat: https://platform.minimaxi.com/docs/faq/contact-us
