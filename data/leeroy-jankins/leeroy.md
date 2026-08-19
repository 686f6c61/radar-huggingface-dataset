# leeroy-jankins/leeroy

## Resumen
Leeroy es un modelo de lenguaje de 1.235 millones de parámetros, resultado de un fine-tuning sobre Llama 3.2 1B Instruct, desarrollado por el usuario leeroy-jankins. Está especializado en el dominio de las finanzas públicas y regulaciones federales de Estados Unidos, ya que se ha entrenado sobre datasets como Regulations, Appropriations, OMB Circular A-11, RedBook, SF133, US General Ledger, FastBook y Title 31 CFR Money and Finance. Su objetivo es ofrecer una ejecución rápida y eficiente en entornos locales, con soporte para CPU y GPUs modestas, gracias a su cuantización GGUF Q4_K_M.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para tareas de generación de texto, seguimiento de instrucciones y razonamiento multi-paso, aunque su tamaño reducido limita su capacidad en comparación con modelos más grandes. A pesar de que la model card menciona erróneamente una base de 8B, los datos reales de parámetros (1.235.814.432) y el modelo base indicado (unsloth/Llama-3.2-1B-Instruct-GGUF) confirman que se trata de un modelo de 1B. Es relevante para desarrolladores que necesitan un asistente local especializado en consultas sobre presupuestos, contabilidad gubernamental y normativa financiera.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 1B) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 1B soporta 128k, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | GGUF Q4_K_M (segun model card), safetensors (precision no especificada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
Leeroy se basa en la arquitectura Llama 3.2 1B, un transformer decoder-only con atencion causal. El modelo original de Meta tiene 1.23B parametros y una ventana de contexto de 128k tokens, aunque no se ha confirmado si el fine-tune mantiene esa longitud. El entrenamiento se realizo mediante fine-tuning supervisado sobre un conjunto de datasets especializados en regulaciones federales, apropiaciones, contabilidad gubernamental y normativa financiera de EE.UU. No se menciona el uso de RLHF o DPO, ni el numero de tokens de entrenamiento. La cuantizacion a GGUF Q4_K_M reduce el tamano del modelo para facilitar su ejecucion en hardware modesto.

## Capacidades
- Generacion de texto y seguimiento de instrucciones en ingles.
- Razonamiento multi-paso, segun la model card, aunque no se aportan ejemplos concretos.
- Especializacion en dominios de finanzas publicas, presupuestos federales, contabilidad gubernamental y regulaciones (datasets de entrenamiento).
- Compatible con entornos de ejecucion local como llama.cpp, LM Studio y Ollama.
- No se ha documentado soporte para tool calling, function calling, vision o audio.

## Casos de uso
- Consulta de regulaciones federales: el modelo puede responder preguntas sobre el Codigo de Regulaciones Federales (CFR) y normativas de finanzas, gracias a su entrenamiento en Title 31 CFR y otros datasets.
- Analisis de apropiaciones presupuestarias: permite interpretar documentos de apropiaciones y resumir partidas de gasto.
- Asistente para contabilidad gubernamental: puede ayudar a entender conceptos del US General Ledger y del SF133 (informe de gastos federales).
- Generacion de informes de gasto: a partir de datos de FastBook o RedBook, puede redactar resumenes o explicaciones.
- Educacion y formacion: util para estudiantes o profesionales que necesiten explicaciones sobre procesos presupuestarios federales.
- Prototipado de chatbots especializados: al ser ligero, se puede integrar en aplicaciones de demostracion o entornos con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: para la cuantizacion Q4_K_M de ~1.2B parametros, se requieren aproximadamente 0.7-1 GB de VRAM, mas overhead de contexto. En CPU, puede funcionar con 4-8 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. GTX 1050, RTX 2050) o incluso integradas modernas. Tambien funciona en CPU.
- Compatible con consumer GPUs: si, es adecuado para GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, text-generation-inference (TGI) segun tags, y transformers.
- Latencia y throughput: no se han proporcionado datos especificos, pero al ser un modelo pequeno, se espera una generacion rapida en hardware modesto.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Leeroy (este) | 1.2B | no disponible | Apache 2.0 | Finanzas publicas y regulaciones |
| Llama 3.2 1B Instruct (base) | 1.2B | 128k | Llama 3.2 Community License | Generalista |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k | Apache 2.0 | Generalista |
| Gemma-2-2B | 2.6B | 8k | Gemma License | Generalista |

Nota: los datos de contexto de los modelos comparados provienen de sus fichas oficiales; para Leeroy no se ha confirmado.

## Limitaciones y advertencias
- Tamano reducido (1.2B) que limita la calidad de razonamiento complejo y la precision en tareas abiertas.
- La model card contiene inconsistencias (menciona 8B y 3B), lo que puede generar confusion; los datos reales indican 1.2B.
- Entrenamiento especializado en ingles y en dominios de finanzas publicas de EE.UU.; puede no generalizar bien a otros idiomas o areas.
- Riesgo de alucinacion en datos numericos o legales; no debe usarse como fuente autoritativa sin verificacion.
- No se ha documentado soporte para tool calling ni funciones de agente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 tiene su propia licencia (Llama 3.2 Community License) que puede imponer restricciones adicionales; se recomienda revisar ambas.

## Enlaces
- HuggingFace: https://huggingface.co/leeroy-jankins/leeroy
- Repositorio GitHub: https://github.com/is-leeroy-jenkins/Leeroy
- Aplicacion Streamlit: https://leeroy-py.streamlit.app/
- Datasets de entrenamiento: listados en la model card (Regulations, Appropriations, OMB-Circular-A-11, RedBook, SF133, US-General-Ledger, FastBook, Title-31-CFR-Money-and-Finance)
