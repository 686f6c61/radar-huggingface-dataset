# devendradhakad/autodroid-openbmb-MiniCPM5-1B-GGUF

## Resumen

MiniCPM5-1B es el primer checkpoint de la serie MiniCPM5 de OpenBMB: un transformer denso de tipo causal (`LlamaForCausalLM`) con 1.080.632.832 parametros totales (679.552.512 sin contar los embeddings), 24 capas y atencion con GQA (16 cabezas para Q y 2 para KV). Esta pensado para despliegue local en dispositivo, entornos con recursos limitados y flujos de trabajo de agente, manteniendo una ventana de contexto nativa de 131.072 tokens.

La ficha que se documenta aqui corresponde a `devendradhakad/autodroid-openbmb-MiniCPM5-1B-GGUF`, una conversion a formato GGUF publicada por un tercero (no por OpenBMB) del modelo original `openbmb/MiniCPM5-1B`. El repositorio ocupa 0,7 GB y esta orientado a ejecucion con llama.cpp, Ollama y LM Studio, lo que permite inferencia en CPU y en GPU de gama consumer sin necesidad de aceleradores de datacenter.

Su relevancia actual radica en dos factores: por un lado, ofrece un modo de razonamiento hibrido controlable mediante la plantilla `<think>` y el parametro `enable_thinking`, de modo que el mismo checkpoint sirve como asistente rapido o como razonador deliberado; por otro, el autor lo situa como SOTA de codigo abierto en la clase de 1B dentro de su conjunto de comparacion, con ventaja mas visible en uso de herramientas, generacion de codigo y razonamiento dificil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 (1,08 B); 679.552.512 sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Formato GGUF; los niveles concretos incluidos en el repo no estan detallados en la informacion disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo original se publica en BF16 safetensors |
| Capas | 24 |
| Cabezas de atencion | GQA: 16 para Q, 2 para KV |
| Pipeline | text-generation |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso estandar (`LlamaForCausalLM`), sin mezcla de expertos ni componentes de espacio de estados. Usa Grouped Query Attention con una relacion 16:2 entre cabezas de consulta y de clave/valor, lo que reduce de forma notable el tamano de la cache KV frente a atencion multi-cabeza completa y es un factor clave para sostener los 131.072 tokens de contexto en hardware limitado. El modelo incorpora una plantilla de chat con etiquetas `<think>` que se activa o desactiva con `enable_thinking`, de modo que el razonamiento deliberado es una opcion de inferencia y no un checkpoint distinto.

El entrenamiento sigue la receta de gestion de datos por niveles UltraData y se divide en tres etapas: preentrenamiento base (con fases de entrenamiento estable y de decaimiento), mid-training para reforzar capacidades objetivo y adaptar la distribucion de datos, y post-entrenamiento. El corpus se publica junto al modelo como Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math. La fase de post-entrenamiento consta de tres pasos: SFT con 200.000 millones de tokens de razonamiento profundo mas 200.000 millones de tokens de razonamiento hibrido (datos publicados como UltraData-SFT-2605), entrenamiento por refuerzo de profesores especializados en matematicas, codigo, QA a libro cerrado y escritura, y destilacion on-policy (OPD) para consolidar esos profesores en un unico modelo de publicacion. El texto de la model card se interrumpe antes de detallar por completo el apartado sobre lo que aportan RL y OPD.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento hibrido: modo "pensar" y modo directo con el mismo checkpoint, seleccionable mediante `enable_thinking` y la plantilla `<think>`.
- Razonamiento deliberado en tareas dificiles (matematicas, QA a libro cerrado y dominios afines), segun los profesores de RL empleados en el post-entrenamiento.
- Generacion de codigo, identificada por el autor como uno de los dominios donde la ventaja del modelo es mas visible.
- Tool calling / function calling para flujos de agente y uso de herramientas, tambien señalado como punto fuerte.
- Contexto largo nativo de 131.072 tokens, apto para documentos extensos y conversaciones multi-turno prolongadas.
- Despliegue en dispositivo: pesos GGUF para llama.cpp, Ollama y LM Studio, con variantes adicionales en MLX de 4 bits para Apple Silicon.
- Recursos de ajuste fino y Agent Skills publicados en el repositorio de GitHub de MiniCPM.

## Casos de uso

- Asistente personal local sin conexion: el modelo cabe en un portatil o un mini-PC y puede ejecutarse con llama.cpp u Ollama sin enviar datos a la nube, algo relevante para entornos con requisitos de privacidad estrictos.
- Agente de codigo integrado en el IDE: con soporte de tool calling, puede invocar funciones de lectura/escritura de ficheros, ejecutar comandos y encadenar pasos para tareas de refactorizacion o generacion de tests dentro de un bucle de agente.
- Automatizacion de pipelines de CI/CD: su tamano permite desplegarlo como servicio auxiliar que genere parches, revise diffs o redacte mensajes de commit, con coste de inferencia muy inferior al de modelos de mayor tamano.
- Analisis de documentos largos: los 131.072 tokens de contexto permiten procesar contratos, informes tecnicos o expedientes completos en una sola pasada para extraer clausulas, resumir secciones o responder preguntas sobre el documento.
- Analisis de registros y trazas: ingestar bloques extensos de logs de aplicacion y correlacionar errores en una misma ventana de contexto, sin necesidad de trocear y perder la relacion entre eventos distantes.
- Atencion al cliente en el borde: gestion de conversaciones multi-turno con historial largo sobre infraestructura propia o incluso en el dispositivo del usuario, con modos de razonamiento rapido para consultas simples.
- Tutor de matematicas y apoyo educativo: el modo de razonamiento profundo y el entrenamiento especifico en matematicas permiten resolver problemas paso a paso, con la traza de pensamiento visible para fines didacticos.
- Prototipado y ajuste fino de bajo coste: al publicarse la receta completa, los checkpoints Base y SFT y los datasets de entrenamiento, sirve como banco de pruebas para tecnicas de SFT, RL y destilacion sin necesidad de clústeres grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye graficas comparativas (radar de capacidades y leaderboard publico) frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, pero las cifras concretas no forman parte del material proporcionado. El autor afirma que MiniCPM5-1B alcanza SOTA de codigo abierto en la clase de 1B dentro de ese conjunto de comparacion, con ventaja mas marcada en uso de herramientas, generacion de codigo y razonamiento dificil, pero se trata de una afirmacion cualitativa sin tabla de resultados verificable en esta ficha.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo directo a partir de 1,08 B de parametros, sin cache KV): en BF16 unos 2,2 GB; en cuantizacion de 8 bits en torno a 1,1-1,2 GB; en cuantizacion de 4 bits aproximadamente 0,6-0,7 GB, coherente con el tamano de 0,7 GB del repositorio GGUF.
- Cache KV: por la atencion GQA (2 cabezas KV), el coste por token es bajo, pero a 131.072 tokens de contexto puede sumar del orden de 1-2 GB en FP16, dependiendo del `head_dim` real del modelo (estimacion no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para las cuantizaciones de 4 y 8 bits; en datacenter, una unica A100, H100 o L40S queda enormemente sobredimensionada y se usaria solo por agregacion de muchas peticiones concurrentes.
- Compatibilidad consumer: si, es un modelo claramente orientado a ello; en cuantizacion de 4 bits cabe en GPUs integradas y en equipos con 8 GB de RAM, e incluso puede ejecutarse en CPU de forma interactiva.
- Apple Silicon: existe una conversion oficial a MLX de 4 bits para chips M-series.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF; vLLM y TGI requieren los pesos safetensors del repositorio original de OpenBMB, no el GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los unicos modelos de comparacion citados por el autor son los del conjunto de referencia de la model card. No se dispone de sus especificaciones completas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-1B (este modelo, via GGUF de terceros) | 1,08 B | 131.072 tokens | Apache 2.0 | HuggingFace, ModelScope, GGUF, MLX |
| LFM2.5-1.2B-Thinking | 1,2 B (segun nomenclatura) | no disponible | no disponible | no disponible en la informacion |
| Qwen3-0.6B/think | 0,6 B (segun nomenclatura) | no disponible | no disponible | no disponible en la informacion |
| Qwen3.5-0.8B/think | 0,8 B (segun nomenclatura) | no disponible | no disponible | no disponible en la informacion |

## Limitaciones y advertencias

- El repositorio documentado es una conversion GGUF de un tercero (`devendradhakad`), no una publicacion oficial de OpenBMB; conviene verificar la integridad de los pesos antes de usarlos en produccion y, si es posible, preferir el repositorio oficial `openbmb/MiniCPM5-1B-GGUF`.
- El repositorio presenta 0 descargas y 0 "likes" en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- La cuantizacion GGUF introduce perdida de precision respecto al checkpoint BF16 original; el impacto concreto por nivel de cuantizacion no esta documentado en la informacion disponible.
- Idiomas soportados oficialmente: solo ingles y chino. El rendimiento en castellano u otras lenguas no esta garantizado ni evaluado.
- Un modelo de 1,08 B de parametros tiene una capacidad limitada para conocimiento factual extenso; es esperable un riesgo elevado de alucinacion en preguntas abiertas de dominio, y no se han publicado tasas de alucinacion ni evaluaciones de veracidad.
- No se han publicado evaluaciones de sesgo, toxicidad o seguridad en la informacion proporcionada.
- La ventana de 131.072 tokens es una capacidad nominal; el rendimiento efectivo en contextos muy largos (recuperacion de informacion en el centro de la ventana) no esta documentado.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia. Al tratarse de una conversion de terceros, la licencia aplicable al artefacto GGUF concreto debe confirmarse en su repositorio.
- El texto de la model card disponible esta truncado, por lo que la descripcion completa del pipeline de RL y OPD puede estar incompleta.

## Enlaces

- Repositorio documentado: https://huggingface.co/devendradhakad/autodroid-openbmb-MiniCPM5-1B-GGUF
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-1B
- Checkpoint SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Checkpoint base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- GGUF oficial: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Version MLX 4 bits: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- UltraData: https://ultradata.openbmb.cn/
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Referencia adicional citada en los tags: https://arxiv.org/abs/2512.16649
- Referencia adicional citada en los tags: https://arxiv.org/abs/2604.13016
- ModelScope del modelo base: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B
- ModelScope del GGUF oficial: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B-GGUF
