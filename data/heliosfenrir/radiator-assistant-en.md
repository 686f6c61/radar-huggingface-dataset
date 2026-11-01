# HeliosFenrir/radiator-assistant-en

## Resumen

Radiator Assistant es un ajuste fino (SFT) del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario HeliosFenrir, orientado a tareas de sustitución de radiadores bajo prácticas del estilo EN 442 y DIN 18380: procedimientos de instalación, listas de verificación de inspección y listas de materiales. El modelo parte de una base compacta de 494 millones de parámetros con arquitectura transformer decoder-only de la familia Qwen2, lo que lo sitúa en el rango de modelos ligeros aptos para despliegue en CPU o GPU de consumo.

El problema que aborda es la asistencia conversacional especializada en un dominio técnico muy concreto (calefacción y radiadores), donde un modelo generalista de pequeño tamaño suele ofrecer respuestas genéricas o imprecisas. Mediante un dataset SFT propio de 1.200 ejemplos de entrenamiento y 120 de validación, el autor busca que el modelo reproduzca narrativas de procedimiento e inspección con terminología del sector.

Es relevante ahora por su tamaño reducido (repo de 2,0 GB, pesos safetensors), su licencia Apache-2.0 heredada del modelo base y su compatibilidad con el ecosistema transformers y text-generation-inference. No obstante, se trata de un modelo de nicho con muy poca tracción (97 descargas, 0 likes en el momento de la consulta) y sin benchmarks publicados más allá de la pérdida de validación reportada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; el modelo base admite cuantizacion GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | Ingles (en), aleman (de) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parametros. No se trata de una arquitectura MoE ni hibrida: es un modelo denso convencional de la familia Qwen2, con atencion causal estandar. El autor no detalla en la model card innovaciones arquitectonicas propias; el ajuste se realiza sobre la arquitectura original del base.

El entrenamiento consistio en una sola epoca sobre 1.200 ejemplos de entrenamiento y 120 de validacion, con una perdida de evaluacion de aproximadamente 0,038. El dataset utilizado es `HeliosFenrir/radiator-en-sft`, y el adaptador LoRA empleado se publica por separado en `HeliosFenrir/radiator-assistant-en-lora`. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. El enfoque es puramente SFT sobre datos de dominio.

## Capacidades

- Generacion de texto conversacional en ingles y aleman, orientada a procedimientos de sustitucion de radiadores.
- Narracion de procedimientos de instalacion e inspeccion conforme a practicas del estilo EN 442 y DIN 18380.
- Generacion de listas de verificacion (checklists) de inspeccion.
- Asistencia en la elaboracion de listas de materiales (el autor recomienda, no obstante, usar una lista de piezas estructurada para BOMs).
- Razonamiento multi-turno basico heredado del modelo base Qwen2.5-0.5B-Instruct.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este ajuste especifico.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistencia a instaladores en procedimientos de sustitucion de radiadores: el modelo puede narrar paso a paso el desmontaje, montaje y purga, usando terminologia del dominio aprendida en el SFT.
- Generacion de checklists de inspeccion previa y posterior a la instalacion, utiles para documentar el trabajo en obra.
- Formacion interna de tecnicos de calefaccion: respuestas conversacionales en ingles o aleman sobre practicas EN 442 / DIN 18380.
- Soporte en la redaccion de informes de inspeccion, donde el modelo aporta narrativa estructurada (el autor advierte que no es adecuado para BOMs).
- Chatbot de atencion al cliente para empresas de instalaciones termicas, limitado a consultas de procedimiento y no a calculos de dimensionado.
- Prototipado rapido de asistentes de dominio en entornos con recursos limitados, gracias a sus 494 millones de parametros y su despliegue en CPU o GPU de consumo.
- Traduccion tecnica EN-DE de procedimientos de instalacion, aprovechando el soporte bilingue declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de evaluacion (~0,038) sobre un conjunto de validacion de 120 ejemplos, que no es comparable con benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (494 M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 2,5 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,5-1 GB; en 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (soporte nativo segun la model card), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama mediante conversion a GGUF (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera baja latencia en GPU y throughput moderado en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Radiator Assistant (este) | 494 M | No disponible | Apache-2.0 | HuggingFace, 97 descargas | SFT de nicho en radiadores, EN/DE |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | No disponible en la informacion | Apache-2.0 | HuggingFace, ampliamente usado | Modelo base generalista, sin especializacion |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | No disponible en la informacion | Apache-2.0 | HuggingFace | Base mas grande de la misma familia, mayor capacidad general |
| Modelos de dominio equivalentes | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas publicas comparables en el nicho de radiadores |

## Limitaciones y advertencias

- El propio autor advierte que el modelo no sustituye las instrucciones del fabricante, la normativa local ni a un instalador cualificado.
- No es adecuado para BOMs (listas de materiales): el autor recomienda usar una lista de piezas estructurada para esos fines.
- Entrenado con solo 1.200 ejemplos y una epoca, lo que limita la cobertura y profundidad del dominio; riesgo elevado de respuestas incompletas o incorrectas fuera de los patrones vistos.
- Riesgo de alucinacion en datos tecnicos concretos (dimensiones, potencias, referencias normativas) no verificables.
- Soporte limitado a ingles y aleman; no se declara castellano.
- Modelo de nicho con muy poca validacion externa (0 likes, 97 descargas) y sin benchmarks publicos.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de garantias y la naturaleza tecnica del dominio exigen supervision humana en produccion.
- No se confirma soporte de tool calling ni de agentes en este ajuste especifico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HeliosFenrir/radiator-assistant-en
- Adaptador LoRA: https://huggingface.co/HeliosFenrir/radiator-assistant-en-lora
- Dataset SFT: https://huggingface.co/datasets/HeliosFenrir/radiator-en-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
