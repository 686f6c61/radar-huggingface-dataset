# Mustifizur/Hermes-Agent

## Resumen

Hermes-Agent es un adaptador LoRA (entrenado con QLoRA de 4 bits) publicado por el usuario Mustifizur en HuggingFace. No es un modelo completo, sino un adaptador PEFT que se monta sobre el modelo base teknium/OpenHermes-2-Mistral-7B, un transformer decoder-only de aproximadamente 7.000 millones de parametros derivado de la arquitectura Mistral. El objetivo declarado, segun la configuracion de entrenamiento, es especializar el modelo base en tareas de agente mediante fine-tuning sobre el dataset THUDM/AgentInstruct.

El entrenamiento se realizo con Axolotl 0.4.0 y una unica epoca sobre seis subconjuntos de AgentInstruct (os, db, alfworld, webshop, kg y mind2web), lo que sugiere una intencion de cubrir escenarios de uso de herramientas, navegacion web, entornos simulados y razonamiento multi-paso. La longitud de secuencia configurada es de 8192 tokens, con sample packing y atencion FlashAttention. La perdida de validacion final reportada es de 0,3002.

La relevancia practica de esta ficha es limitada: el repositorio acumula 0 descargas y 0 likes, la model card es en gran medida autogenerada y no se han publicado resultados de benchmarks (el campo `model-index` esta vacio). Se trata, por tanto, de un experimento comunitario reproducible mas que de un modelo listo para produccion, y debe evaluarse como adaptador sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Mistral (MistralForCausalLM); adaptador PEFT/LoRA sobre modelo base |
| Parametros totales | ~7.000 millones en el modelo base; adaptador LoRA con rango r=8 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (sequence_len de entrenamiento; coincide con la ventana del modelo base Mistral 7B) |
| Tipos de cuantizacion | Entrenado en 4 bits con bitsandbytes (QLoRA). El adaptador no se distribuye en formatos GGUF/AWQ/GPTQ; requeriria fusion y conversion externa |
| Idiomas soportados | no disponible (no declarado por el autor; el modelo base esta orientado principalmente al ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA, ~1,2 GB en repositorio) |

## Arquitectura y entrenamiento

El modelo base, teknium/OpenHermes-2-Mistral-7B, es un transformer decoder-only de 7B parametros basado en Mistral 7B, con atencion de ventana deslizante (sliding window attention), codificacion posicional rotatoria (RoPE) y atencion con consultas agrupadas (GQA). El adaptador introduce matrices de bajo rango (LoRA) con r=8, alpha=16 y dropout 0,05 sobre todas las proyecciones lineales del bloque de atencion y del MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `down_proj`, `up_proj`). Ademas, la configuracion guarda `lm_head` y `embed_tokens` como modulos a preservar, lo que explica en parte el tamano del repositorio.

El entrenamiento empleo el dataset THUDM/AgentInstruct en seis splits (os, db, alfworld, webshop, kg, mind2web), formateados con plantilla de conversacion tipo llama-2, con un 10 % reservado para validacion. Los hiperparametros principales fueron: 1 epoca, learning rate 2e-4 con scheduler coseno, optimizador adamw_bnb_8bit, micro-batch 2, acumulacion de gradientes 4 (batch efectivo 8), bf16, gradient checkpointing y FlashAttention. La perdida de entrenamiento descendio de 0,6859 (paso 1) a 0,2986 (paso 27), y la de validacion de 0,7320 a 0,3002. No se documenta ninguna innovacion tecnica adicional mas alla del propio procedimiento QLoRA estandar de Axolotl.

## Capacidades

- Generacion de texto conversacional en formato chat (plantilla de instrucciones tipo llama-2 / `inst`).
- Razonamiento de agente y uso de herramientas, heredado del fine-tuning sobre AgentInstruct (escenarios de sistema operativo, base de datos, navegacion web, tienda web, grafo de conocimiento y Mind2Web).
- Razonamiento multi-paso en entornos simulados, segun los subconjuntos alfworld y webshop del dataset de entrenamiento.
- Generacion de codigo y resolucion de problemas matematicos basicos, heredados de las capacidades del modelo base OpenHermes-2-Mistral-7B.
- Soporte de function calling / tool calling: plausible por el tipo de datos de entrenamiento, pero no verificado con evaluaciones publicadas.
- Capacidades multilingues: no declaradas; dependen del modelo base, con sesgo hacia el ingles.
- Capacidades especiales (vision, audio, modo thinking, decodificacion especulativa): no disponibles.

## Casos de uso

- Agentes de automatizacion de escritorio: el ajuste sobre el split `os` de AgentInstruct apunta a flujos de interaccion con sistema operativo mediante acciones encadenadas, adecuado para prototipos de agentes que ejecutan comandos o manipulan ficheros.
- Asistentes de consulta a bases de datos: el split `db` sugiere entrenamiento en traduccion de peticiones en lenguaje natural a consultas estructuradas, util en herramientas internas de business intelligence.
- Navegacion web automatizada: los splits `webshop` y `mind2web` orientan el modelo a tareas de interaccion con paginas y extraccion de informacion, aplicable a scraping asistido y formularios.
- Razonamiento sobre grafos de conocimiento: el split `kg` permite plantear escenarios de respuesta a preguntas sobre entidades y relaciones, integrable en asistentes de documentacion tecnica.
- Entornos de simulacion y planificacion: el split `alfworld` lo hace candidato para investigacion en agentes que resuelven tareas en mundos simulados antes de pasar a un entorno real.
- Base para experimentos academicos de fine-tuning de agentes: al ser un adaptador ligero sobre un modelo abierto con licencia Apache 2.0, sirve como punto de partida reproducible para comparar tecnicas QLoRA y datasets de instrucciones de agente.
- Chat conversacional general de bajo coste: con solo 7B parametros en cuantizacion de 4 bits cabe en GPU de consumo, lo que permite desplegar un asistente local para tareas internas no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card aparece con la lista de resultados vacia, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de agentes. El unico dato cuantitativo publicado por el autor corresponde a la perdida durante el entrenamiento:

| Paso | Epoca | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 1 | 0,03 | 0,6859 | 0,7320 |
| 9 | 0,26 | 0,3448 | 0,3382 |
| 18 | 0,53 | 0,4193 | 0,3233 |
| 27 | 0,79 | 0,2986 | 0,3002 |

Estos valores reflejan unicamente el ajuste sobre el propio conjunto de validacion de AgentInstruct y no deben interpretarse como medida de capacidad general.

## Requisitos de hardware

- Al ser un adaptador PEFT, requiere cargar en memoria el modelo base OpenHermes-2-Mistral-7B (unos 7B parametros) ademas del adaptador.
- VRAM estimada para el modelo fusionado: ~14-15 GB en FP16/BF16, ~7-8 GB en cuantizacion de 8 bits y ~4-6 GB en 4 bits, sin contar la cache KV.
- Cache KV adicional para contexto de 8192 tokens: depende del batch; en 4 bits y batch pequeno suele mantenerse por debajo de 1-2 GB adicionales.
- Cabe en GPU de consumo: si, en modelos con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB) usando cuantizacion de 4 bits; en RTX 3090/4090 (24 GB) se puede ejecutar en FP16 con margen para batch.
- GPU de datacenter recomendadas para produccion: A100 40/80 GB, H100 80 GB, L40S, para servir en precision alta y con alta concurrencia.
- Opciones de despliegue: el adaptador se carga directamente con PEFT y Transformers; para vLLM o TGI es necesario fusionar previamente el adaptador con el modelo base y exportar el modelo completo; para llama.cpp u Ollama hay que fusionar y convertir a GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Benchmarks publicados |
|---|---|---|---|---|---|
| Mustifizur/Hermes-Agent | ~7B (base) + adaptador LoRA r=8 | 8192 | apache-2.0 | Adaptador PEFT/QLoRA | No |
| teknium/OpenHermes-2-Mistral-7B | ~7B | 8192 | apache-2.0 | Modelo completo | Si, en su model card |
| mistralai/Mistral-7B-Instruct-v0.1 | ~7B | 8192 | apache-2.0 | Modelo completo | Si, en su model card |

La comparacion cuantitativa de rendimiento no es posible porque Hermes-Agent no publica evaluaciones. Frente al modelo base, la diferencia esperada radica en la especializacion hacia tareas de agente a costa de un ajuste de una sola epoca. Frente a Mistral-7B-Instruct, la distincion principal es el dataset de entrenamiento (AgentInstruct frente a instrucciones genericas), pero sin datos de evaluacion no puede afirmarse una mejora objetiva.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin el modelo base OpenHermes-2-Mistral-7B no puede ejecutarse, y su uso productivo obliga a gestionar la fusion de pesos.
- La model card esta mayoritariamente autogenerada y sin completar: carece de descripcion de uso previsto, limitaciones declaradas y evaluacion.
- No se han publicado benchmarks, por lo que no hay evidencia verificable de mejora sobre el modelo base ni de degradacion en tareas generales.
- Riesgo de alucinacion: inherente a los modelos de 7B y probablemente no mitigado por un ajuste de una sola epoca; los escenarios de agente pueden amplificarlo al ejecutar acciones.
- Sesgos: no documentados por el autor. El modelo base se entrena principalmente con datos en ingles, por lo que el sesgo cultural y linguistico de ese corpus se hereda.
- Limitaciones de idioma: no se declara soporte multilingue; el rendimiento en castellano no esta garantizado y probablemente sea inferior al ingles.
- Restricciones de licencia: el adaptador y el modelo base se publican bajo apache-2.0, lo que permite uso comercial. No obstante, debe revisarse la licencia del dataset THUDM/AgentInstruct para un uso comercial derivado de su entrenamiento.
- Para produccion: se requiere validacion propia en el dominio objetivo, control de las acciones del agente y limites de contexto, dado que el modelo puede generar comandos o consultas incorrectas sin supervisión.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mustifizur/Hermes-Agent
- Modelo base: https://huggingface.co/teknium/OpenHermes-2-Mistral-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/THUDM/AgentInstruct
- Framework de entrenamiento Axolotl: https://github.com/OpenAccess-AI-Collective/axolotl
- Repositorio de referencia del modelo base OpenHermes: https://github.com/teknium1/OpenHermes-2.5
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
