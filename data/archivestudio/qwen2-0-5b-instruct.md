# ArchiveStudio/Qwen2-0.5B-Instruct

## Resumen

Qwen2-0.5B-Instruct es la variante instruida (chat) del modelo base Qwen2-0.5B, desarrollado por el equipo Qwen de Alibaba. Forma parte de la familia Qwen2, que abarca modelos de lenguaje decoder-only desde 0,5 hasta 72 mil millones de parametros, incluida una variante Mixture-of-Experts. Este repositorio concreto, publicado por el usuario ArchiveStudio, replica la version oficial de 0,5B parametros ajustada para instrucciones, orientada a generacion de texto conversacional en ingles.

El modelo resuelve el problema de disponer de un LLM extremadamente ligero (494 millones de parametros, ~1 GB de pesos en safetensors) que pueda ejecutarse en hardware muy modesto, incluso en CPU, manteniendo capacidades basicas de dialogo, comprension lectora elemental y generacion de codigo simple. Es relevante para escenarios de prototipado rapido, entornos con recursos limitados, educacion y despliegues en el borde (edge), donde modelos mayores no son viables.

Arquitectonicamente es un transformer decoder-only con activacion SwiGLU, atencion con sesgo en QKV y Group Query Attention (GQA), y un tokenizador mejorado adaptado a multiples lenguajes naturales y codigo. El contexto maximo no figura en la informacion proporcionada y debe consultarse en la documentacion oficial de Qwen2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, sesgo QKV y Group Query Attention (GQA) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (compatible con cuantizacion estandar via transformers/GGUF, aunque no se documenta en la model card) |
| Idiomas soportados | en (ingles declarado; el tokenizador esta adaptado a multiples lenguajes, pero la model card solo declara ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer decoder-only descrita en la model card de Qwen2: activacion SwiGLU, atencion con sesgo en las proyecciones QKV y Group Query Attention, junto con un tokenizador mejorado adaptado a multiples lenguajes naturales y codigo. Con 494 millones de parametros, es el escalon mas pequeno de la familia Qwen2.

El entrenamiento consistio en un preentrenamiento con "una gran cantidad de datos" (el volumen exacto de tokens no se especifica en la informacion disponible) seguido de un post-entrenamiento en dos fases: supervised fine-tuning (SFT) y direct preference optimization (DPO). No se detallan la composicion del dataset ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con plantilla de chat (`apply_chat_template`) que soporta roles system, user y assistant.
- Razonamiento basico y comprension del lenguaje (MMLU 37,9 en la evaluacion del autor).
- Generacion de codigo simple (HumanEval 17,1).
- Razonamiento matematico elemental (GSM8K 40,1).
- Seguimiento de instrucciones con formato estricto (IFEval Prompt Strict-Acc. 20,0).
- Capacidad multilingue limitada: la model card declara solo ingles, aunque el tokenizador esta adaptado a varios idiomas.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; por tamano, la fiabilidad en tareas agenticas complejas es muy limitada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: permite validar pipelines de chat (plantillas, roles, streaming) con un modelo de ~1 GB antes de escalar a variantes mayores de Qwen2, reduciendo coste y tiempo de iteracion.
- Inferencia en CPU o dispositivos de borde: al ocupar alrededor de 1 GB en safetensors (y menos tras cuantizacion), puede ejecutarse en portatiles, mini-PC o Raspberry Pi de gama alta para tareas de generacion de texto offline.
- Educacion y demos de LLM: util para ensenar conceptos de tokenizacion, plantillas de chat, SFT y DPO con un modelo cuyo entrenamiento y despliegue son asequibles en un aula.
- Clasificacion y etiquetado de texto ligero: con prompts bien disenados puede usarse para categorizar correos, resenas o tickets en ingles, integrandose en pipelines por lotes a bajo coste.
- Generacion de respuestas cortas en formularios o chatbots de FAQ: adecuado para respuestas factuales breves y guionizadas donde no se requiere razonamiento profundo.
- Filtrado y preprocesado en pipelines de datos: puede generar resumenes o reformulaciones de baja fidelidad para tareas auxiliares (deduplicacion semantica, normalizacion) antes de pasar a un modelo mayor.
- Pruebas de integracion con transformers y vLLM: sirve como modelo de humo para validar despliegues y configuraciones de servidor antes de cargar modelos de mayor tamano.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (comparativa con Qwen1.5-0.5B-Chat y variantes mayores):

| Dataset | Qwen1.5-0.5B-Chat | Qwen2-0.5B-Instruct | Qwen1.5-1.8B-Chat | Qwen2-1.5B-Instruct |
|---|---|---|---|---|
| MMLU | 35,0 | 37,9 | 43,7 | 52,4 |
| HumanEval | 9,1 | 17,1 | 25,0 | 37,8 |
| GSM8K | 11,3 | 40,1 | 35,3 | 61,6 |
| C-Eval | 37,2 | 45,2 | 55,3 | 63,8 |
| IFEval (Prompt Strict-Acc.) | 14,6 | 20,0 | 16,8 | 29,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16/bf16 (494M parametros x 2 bytes), alrededor de 0,5 GB en int8 y 0,25-0,3 GB en int4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1650, RTX 3050, RTX 4090, A100 y H100 sin problemas de memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecucion en CPU: viable; el modelo es lo bastante pequeno para inferencia en CPU con latencias de decenas de milisegundos por token en hardware moderno.
- Opciones de despliegue: transformers (>=4.37.0, requerido para evitar el error `KeyError: 'qwen2'`), vLLM, llama.cpp/Ollama (previa conversion a GGUF) y TGI, aunque la model card solo documenta el uso con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2-0.5B-Instruct (este) | 494M | no disponible | 37,9 | 40,1 | Apache 2.0 | HuggingFace |
| Qwen1.5-0.5B-Chat | ~500M | no disponible | 35,0 | 11,3 | Apache 2.0 | HuggingFace |
| Qwen2-1.5B-Instruct | ~1.500M | no disponible | 52,4 | 61,6 | Apache 2.0 | HuggingFace |
| Qwen1.5-1.8B-Chat | ~1.800M | no disponible | 43,7 | 35,3 | Apache 2.0 | HuggingFace |

Frente a Qwen1.5-0.5B-Chat, la mejora es notable en GSM8K (+28,8 puntos) y HumanEval (+8,0). Frente a las variantes de 1,5-1,8B, el modelo de 0,5B pierde entre 14 y 21 puntos en MMLU, pero sigue siendo competitivo en GSM8K frente a Qwen1.5-1.8B-Chat (40,1 vs 35,3). La eleccion entre 0,5B y 1,5B depende del presupuesto de memoria y del nivel de razonamiento requerido.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; como todo LLM entrenado con datos web, es probable que reproduzca sesgos presentes en el corpus.
- Riesgo de alucinacion: elevado para un modelo de este tamano, especialmente en preguntas factuales, matematicas de varios pasos y codigo no trivial.
- Limitaciones de contexto e idioma: la model card declara solo ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente. La longitud de contexto no figura en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion proporcionada.
- Caveat de produccion: este repositorio es una publicacion de terceros (ArchiveStudio) que replica el modelo oficial Qwen/Qwen2-0.5B-Instruct; para produccion conviene usar el repositorio oficial de Qwen para garantizar pesos verificados y actualizaciones.
- No apto para tareas agenticas complejas, tool calling fiable ni razonamiento multi-paso sin validacion externa.
- Requiere transformers >= 4.37.0; versiones anteriores fallan al cargar la arquitectura `qwen2`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchiveStudio/Qwen2-0.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B
- Modelo oficial instruido: https://huggingface.co/Qwen/Qwen2-0.5B-Instruct
- Blog de Qwen2: https://qwenlm.github.io/blog/qwen2/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2
- Documentacion: https://qwen.readthedocs.io/en/latest/
