# braydenh563/Astraea-Prompt-Architect-Chat-v10

## Resumen

Astraea-Prompt-Architect-Chat-v10 es un modelo de lenguaje conversacional ajustado por instrucciones, desarrollado por Brayden Hoyle (usuario braydenh563) a partir de Llama-3.1-8B-Instruct. Su función principal es actuar como **arquitecto de prompts** (prompt architect): en lugar de ejecutar tareas concretas, se especializa en diseñar, refinar y analizar prompts y system prompts para otros modelos de IA, como ChatGPT, Claude, Gemini, DALL·E, Midjourney, Stable Diffusion o Cursor. Es decir, realiza meta-prompting: genera instrucciones de alta calidad documentando supuestos y decisiones de diseño.

El modelo se presenta como una herramienta para profesionales que necesitan prompts bien estructurados, seguros y eficaces, con énfasis en claridad, cobertura de restricciones y estructura de salida. Está pensado para desplegarse con transformers o Text Generation Inference (TGI), y también se ofrecen pesos en GGUF para inferencia local. Con 8 030 millones de parámetros, hereda la arquitectura y la ventana de contexto del modelo base Llama-3.1-8B-Instruct, y su entrenamiento se realizó mediante LoRA/RSLoRA con la librería Unsloth sobre un dataset propio (Astraea_Chat_v4.1). Su relevancia actual radica en la creciente demanda de ingeniería de prompts rigurosa y reproducible en flujos de trabajo con múltiples modelos y herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.1-8B-Instruct base) |
| Parametros totales | 8 030 261 312 |
| Parametros activos | No aplica (todos los parametros activos) |
| Longitud de contexto | Heredada del modelo base (128 000 tokens, no confirmado en la ficha) |
| Tipos de cuantizacion | GGUF (quantizado), safetensors (FP16/BF16) |
| Idiomas soportados | Ingles (ingles australiano por defecto) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Llama-3.1-8B-Instruct, por lo que mantiene la arquitectura transformer decoder estándar de Llama 3.1 con 8 000 millones de parámetros. El entrenamiento se realizó mediante LoRA/RSLoRA utilizando la librería Unsloth, lo que acelera el proceso aproximadamente 2× respecto a un fine-tuning completo. El dataset de entrenamiento es Astraea_Chat_v4.1, creado por el mismo autor, y el ajuste se orientó a reforzar habilidades de diseño de prompts, meta-prompting y comportamiento conversacional seguro. No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado con instrucciones. La innovación principal reside en la especialización funcional: el modelo no ejecuta tareas, sino que produce instrucciones para otros sistemas, documentando supuestos y decisiones de diseño.

## Capacidades

- Diseño y refinamiento de prompts para modelos de chat y texto (ChatGPT, Claude, Gemini, GPT-4/4.1 y similares).
- Diseño de prompts para generacion de imagenes y video (DALL·E, Midjourney, Stable Diffusion, Sora, Runway).
- Creacion y mejora de system prompts y definiciones de agentes, incluyendo agentes estilo LangChain, sistemas RAG y agentes con herramientas personalizadas.
- Ensenanza de buenas practicas de prompt engineering: claridad de rol, especificacion de restricciones, formato de salida y patrones de uso seguro.
- Soporte para flujos de trabajo profesionales que requieren prompts bien documentados con supuestos explicitos (por ejemplo, pipelines de generacion de descripciones de producto o herramientas internas especializadas).
- Capacidad multilingue limitada: solo ingles (con ortografia australiana por defecto).
- No realiza tool calling ni razonamiento multi-step por si mismo; se centra en la generacion de instrucciones para otros sistemas.

## Casos de uso

- **Optimizacion de prompts para chatbots de atencion al cliente**: el modelo puede disenar system prompts que definan el tono, las restricciones de politica y los flujos de escalado para un asistente virtual, asegurando cobertura de requisitos y estructura clara.
- **Generacion de prompts para herramientas de diseno grafico**: permite crear descripciones detalladas y estilizadas para DALL·E o Midjourney, incluyendo parametros de composicion, iluminacion y estilo, con documentacion de las decisiones tomadas.
- **Construccion de definiciones de agentes para automatizacion**: facilita la redaccion de system prompts y plantillas de instrucciones para agentes de LangChain o sistemas RAG, especificando roles, herramientas disponibles y limites de actuacion.
- **Creacion de prompts para generacion de video**: ayuda a estructurar prompts para Sora o Runway, detallando secuencias, movimientos de camara y narrativa visual, con explicacion de las elecciones creativas.
- **Documentacion y auditoria de prompts en entornos corporativos**: permite generar prompts estandarizados y bien documentados que cumplan con politicas internas de cumplimiento y gobernanza, facilitando la revision por parte de equipos de riesgo.
- **Formacion y aprendizaje de prompt engineering**: sirve como herramienta educativa para desarrolladores que deseen entender como se construyen prompts eficaces, mostrando ejemplos razonados y supuestos explicitos.

## Benchmarks y rendimiento

El autor declara resultados de evaluacion interna sobre el conjunto Astraea Chat Eval Set, con metricas en una escala de 1 a 5. Estos datos no estan verificados de forma externa y corresponden a una rubrica propia de calidad de diseno de prompts.

| Metrica | Valor (1-5) |
|---|---|
| Claridad | 4,5 |
| Cobertura de restricciones | 4,3 |
| Estructura | 4,7 |
| Seguridad | 4,6 |
| Viabilidad | 4,4 |
| Efectividad | 4,4 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits (GGUF Q4_K_M) se requieren aproximadamente 6-8 GB; con precision FP16, alrededor de 16 GB.
- GPU recomendadas: para FP16, una RTX 3090, RTX 4090, A100 o H100; para cuantizacion 4 bits, una RTX 3060 o superior con al menos 8 GB.
- Si cabe en GPU de consumo: si, con cuantizacion GGUF en tarjetas con 8 GB o mas (por ejemplo, RTX 3070, RTX 4060 Ti).
- Opciones de despliegue: transformers (Hugging Face), Text Generation Inference (TGI), llama.cpp, Ollama (via GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de prompt engineering. La siguiente tabla compara caracteristicas estructurales con el modelo base.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Astraea-Prompt-Architect-Chat-v10 | 8 030 M | 128k (heredado) | Llama 3.1 Community | Prompt architecture / meta-prompting |
| Llama-3.1-8B-Instruct (base) | 8 030 M | 128k | Llama 3.1 Community | Instruccion general |
| Otros fine-tunes de 8B para prompt engineering | no disponible | no disponible | no disponible | no disponible |

No se han identificado modelos comparables con datos publicos en la informacion disponible.

## Limitaciones y advertencias

- No debe utilizarse para proporcionar consejo medico, legal o financiero, incluso si el tema surge de forma incidental.
- Puede alucinar o tergiversar detalles tecnicos sobre modelos, APIs o herramientas de terceros (sintaxis de parametros, ventanas de contexto, disponibilidad de funciones). Siempre hay que verificar contra la documentacion oficial actual.
- No se garantiza la alineacion con marcos de cumplimiento, gobernanza o riesgo de ninguna organizacion especifica. Las salidas deben revisarse segun las politicas internas antes de su despliegue.
- No debe emplearse para generar contenido danino, abusivo, enganoso o ilegal. El comportamiento de seguridad se refuerza mediante curacion de datos y direccionamiento, pero no es infalible.
- Limitacion de idioma: solo ingles, con variante australiana por defecto; no soporta otros idiomas de forma nativa.
- Sesgos heredados del modelo base Llama-3.1-8B-Instruct, que pueden manifestarse en las recomendaciones de prompts generadas.
- Las metricas de evaluacion declaradas son internas y no verificadas externamente; no deben tomarse como garantia de rendimiento en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braydenh563/Astraea-Prompt-Architect-Chat-v10
- Discusiones del modelo: https://huggingface.co/braydenh563/Astraea-Prompt-Architect-Chat-v10/discussions
- Perfil del autor (Brayden Hoyle): https://huggingface.co/braydenh563
- Dataset de entrenamiento: https://huggingface.co/datasets/braydenh563/Astraea_Chat_v4.1 (referenciado en la model card)
