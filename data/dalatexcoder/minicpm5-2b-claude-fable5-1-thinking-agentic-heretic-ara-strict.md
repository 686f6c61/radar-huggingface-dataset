# dalatexcoder/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-heretic-ara-strict

## Resumen

Este modelo es una version "abliterated" (decensurada) de GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic, que a su vez es un fine-tune sobre el modelo denso openbmb/MiniCPM5-2B de 2B parametros. Lo publica el usuario dalatexcoder y su objetivo es reducir de forma drastica la tasa de rechazos del modelo original manteniendo al maximo el comportamiento aprendido, mediante la tecnica de ablacion de direcciones "Arbitrary-Rank Ablation (ARA)" implementada en la herramienta Heretic v1.2.0. El resultado es un modelo de 2.516.756.480 parametros (unos 2,5B) orientado a generacion de texto, tool calling agentico, codigo e instruccion.

El modelo hereda del fine-tune original una ventana de contexto de 128K tokens (131.072 segun `max_position_embeddings`), plantilla de chat con modo "thinking" y formato de llamada a herramientas XML, todo sobre la arquitectura densa tipo Llama de MiniCPM5. Es relevante porque combina un tamano muy contenido (desplegable en una sola GPU de consumo) con capacidades agenticas, y porque el proceso de abliteracion se documenta con metricas concretas de divergencia y rechazos.

El caso concreto de esta ficha es la variante "strict", que segun el autor presenta una divergencia KL ligeramente superior y un numero de rechazos ligeramente inferior respecto a la variante "lax". Licencia Apache 2.0, idiomas declarados ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (base MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens (max_position_embeddings = 131.072) |
| Tipos de cuantizacion | no disponible para este modelo concreto (existe repositorio GGUF del modelo base no abliterado) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Precision | bfloat16 |
| Tamano del repositorio | 5,0 GB |
| Modelo base | GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic |
| Arquitectura base original | openbmb/MiniCPM5-2B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de openbmb/MiniCPM5-2B: un transformer denso (sin MoE) de aproximadamente 2,5B parametros con arquitectura tipo Llama, segun la model card del modelo base del fine-tune. Sobre ese modelo se aplico un post-entrenamiento con datos de tipo "Claude", con enfasis explicito en tool calling agentico, generacion de codigo y seguimiento de instrucciones, conservando la plantilla de chat nativa de MiniCPM5 con bloques de razonamiento encadenado ("thinking") y el formato XML de llamada a herramientas. El modelo resultante de ese fine-tune es GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic.

Sobre ese fine-tune, el autor de esta ficha aplico una ablacion de direcciones con Heretic v1.2.0 empleando el metodo Arbitrary-Rank Ablation (ARA), que elimina o atenua direcciones del espacio de activaciones asociadas a comportamientos de rechazo. Los parametros de ablacion declarados son: start_layer_index 0, end_layer_index 33, preserve_good_behavior_weight 0,7812, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 0,0848 y neighbor_count 8. El autor no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO; esos datos no estan disponibles. La innovacion tecnica destacable es precisamente el uso de ARA en lugar de ablacion de rango 1 clasica, con el objetivo de minimizar el dano colateral sobre el comportamiento general (reflejado en una divergencia KL de solo 0,0052).

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo "thinking": decodificacion de cadenas de pensamiento opcionales mediante la plantilla de chat nativa de MiniCPM5.
- Tool calling / function calling agentico: soporte de herramientas con formato XML y esquemas de funciones (parametros tipo objeto, propiedades y campos requeridos), disenado para flujos de varios pasos.
- Generacion y depuracion de codigo, y tareas de ingenieria de software.
- Seguimiento de instrucciones y restricciones estructuradas.
- Contexto largo de hasta 128K tokens para conversaciones o documentos extensos.
- Comportamiento decensurado: la ablacion reduce drasticamente los rechazos (de 90/100 en el modelo original a 2/100 en esta variante).
- Capacidades multimodales, de audio o de vision: no disponibles.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede navegar repositorios, invocar herramientas y resolver tareas de ingenieria de software en varios pasos, apoyandose en su soporte de tool calling en formato XML y su contexto de 128K tokens.
- Asistente de programacion en IDE: generacion, refactorizacion y depuracion de codigo con razonamiento encadenado opcional antes de responder, util para explicar decisiones tecnicas.
- Automatizacion de pipelines CI/CD: integracion como componente de generacion o revision de codigo en flujos automatizados gracias a su licencia Apache 2.0 y a su formato de pesos safetensors compatible con transformers.
- Atencion al cliente automatizada multilingue (ingles y chino): conversaciones multi-turno con contexto largo, sin las restricciones de contenido que limitan al modelo original en dominios sensibles.
- Procesamiento de documentos extensos: resumen, extraccion y preguntas sobre documentos que superan la ventana tipica de otros modelos de 2B, aprovechando los 128K tokens de contexto.
- Investigacion sobre alineacion y abliteracion: caso de uso meta, como referencia reproducible para estudiar el efecto de ARA sobre refusals y divergencia KL, dado que el autor publica parametros y metricas.
- Despliegue en el borde (edge) o local: al ser un modelo de 2,5B en bfloat16, puede ejecutarse en una sola GPU de consumo para prototipos y aplicaciones de baja latencia.
- Generacion de contenido sin restricciones tematicas: para investigacion creativa o escenarios donde el modelo original rechazaba peticiones legitimas; requiere supervision por el riesgo de contenido inapropiado.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base del fine-tune (GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic) frente al MiniCPM5-2B original, no especificamente a esta variante abliterada.

ClawBench (agentic coding):

| Modelo | QwenClawBench | WildClawBench |
|---|---|---|
| MiniCPM5-2B (base, solo RL) | 42,11 | 23,19 |
| MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic | 44,56 (+2,45) | 24,32 (+1,13) |

Metricas de la ablacion (esta variante "strict" frente al modelo original):

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0052 | 0 (por definicion) |
| Rechazos | 2/100 | 90/100 |

El autor indica que mas benchmarks (BFCL, SWE-bench, Tau-Bench, etc.) estan "coming soon"; esos resultados no estan disponibles en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 5-6 GB solo para los pesos (2,5B parametros a 2 bytes), mas overhead de KV cache segun la longitud de contexto.
- Con contexto de 128K tokens, la KV cache puede crecer de forma notable; para contextos muy largos se recomienda cuantizar la cache o reducir la ventana efectiva.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para contexto corto (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); en cuantizaciones de 4 bits cabe en GPUs de 6-8 GB.
- Cabe en GPU de consumo: si, es uno de los principales atractivos del modelo por su tamano de 2,5B.
- Opciones de despliegue: transformers (safetensors) de forma nativa; para llama.cpp, Ollama o LM Studio seria necesario disponer de una cuantizacion GGUF de este modelo abliterado concreto, que no esta confirmada como disponible (si existe del modelo base no abliterado).
- Latencia y throughput estimados: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-heretic-ara-strict) | ~2,5B | 128K | Apache 2.0 | Variante abliterada, 2/100 rechazos, KL 0,0052 |
| GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic | ~2,5B | 128K | Apache 2.0 | Modelo base del fine-tune, 90/100 rechazos |
| openbmb/MiniCPM5-2B | ~2B | no disponible | no disponible | Modelo base original, arquitectura densa tipo Llama |

Comparativas con otros modelos de la misma categoria (por ejemplo Qwen2.5-3B, Llama-3.2-3B) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion reduce los rechazos de forma deliberada, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o danino; no se garantiza ningun filtro de seguridad incorporado.
- La divergencia KL de 0,0052, aunque baja, implica una degradacion medible del comportamiento respecto al modelo original; puede haber perdida de calidad en tareas sensibles a la alineacion.
- Riesgo de alucinacion propio de un modelo de 2,5B: menor fiabilidad factual que modelos mucho mayores, especialmente en conocimiento enciclopedico.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Ventana de contexto nominal de 128K tokens, pero el rendimiento efectivo en el extremo superior no esta verificado por benchmarks.
- Licencia Apache 2.0, por lo que se permite uso comercial, pero el autor de la ficha no ofrece garantias y el modelo es un fine-tune comunitario sin validacion institucional.
- Modelo con practicamente cero descargas y "likes" en el momento de la ficha (0/0), sin comunidad que lo respalde ni evaluaciones independientes.
- No se han publicado benchmarks de seguridad, sesgo ni robustez; se desconoce el comportamiento en dominios regulados.
- El rendimiento medido en ClawBench corresponde al modelo base no abliterado, no a esta variante, por lo que su capacidad agentica tras la ablacion no esta cuantificada.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/dalatexcoder/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-heretic-ara-strict
- Modelo base del fine-tune: https://huggingface.co/GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio GGUF del modelo base (no abliterado): https://huggingface.co/GnLOLot/MiniCPM5-2B-Claude-Fable5-1-Thinking-Agentic-GGUF
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Heretic Pull Request 211 (metodo ARA): https://github.com/p-e-w/heretic/pull/211
