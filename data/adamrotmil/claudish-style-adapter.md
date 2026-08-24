# adamrotmil/claudish-style-adapter

## Resumen

Claudish Style Adapter es un adaptador LoRA (PEFT) desarrollado por adamrotmil que reescribe texto entre inglés plano y "Claudish", el estilo de prosa característico de Claude y Claude Code, preservando hechos y significado. Se entrena sobre el modelo base Qwen/Qwen2.5-7B-Instruct y se distribuye como un adaptador ligero que puede aplicarse sobre cualquier modelo subyacente, aunque su uso principal es como reescritor de estilo superficial.

El modelo resuelve el problema de imitar el tono conversacional y las convenciones de redacción de Claude sin necesidad de acceder a la API propietaria, permitiendo a desarrolladores e investigadores generar texto con ese estilo en entornos locales o con otros proveedores. Su relevancia actual radica en la creciente demanda de herramientas de transferencia de estilo para asistentes de IA, especialmente en el ecosistema de Claude Code, donde el estilo "Claudish" se ha convertido en un estándar de facto para interacciones de agente.

El adaptador se entrenó con 28.1k ejemplos de instrucción generados sintéticamente a partir de un traductor bidireccional de Claudish, con filtros de preservación de significado. El modelo base tiene 7.6 mil millones de parámetros y una ventana de contexto de 128k tokens, aunque el adaptador está optimizado para textos de 40 a 800 caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (modelo base completo; el adaptador LoRA añade un numero reducido de parametros) |
| Parametros activos | no disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base); el adaptador funciona mejor con entradas de 40-800 caracteres |
| Tipos de cuantizacion | safetensors (bf16) y GGUF (segun tags del repositorio) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención de causalidad completa y 7.6B parámetros. La capa de adaptación es un LoRA con rango 32 aplicado a todas las proyecciones lineales del modelo base, entrenado en bf16 durante 2 épocas. El entrenamiento se realizó en una única tarea multi-objetivo que combina ambas direcciones de traducción de estilo (inglés → Claudish y Claudish → inglés).

Los datos de entrenamiento se generaron sintéticamente: 20.000 textos semilla produjeron 17.800 pares brutos, que tras un filtro basado en similitud de embeddings se redujeron a 14.000 pares. A partir de estos se construyeron 28.100 ejemplos de instrucción con formato de prompt. La evaluación en un conjunto de validación separado reporta una similitud de referencia de 0.87 (hacia Claudish) y 0.93 (hacia inglés), con una preservación de significado de 0.86 y 0.87 respectivamente. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado sobre pares paralelos.

## Capacidades

- Reescritura de estilo bidireccional: convierte texto plano en inglés a "Claudish" y viceversa, manteniendo hechos, certeza e implicaciones.
- Preservación de significado: entrenado explícitamente para no inventar contenido ni alterar la información factual.
- Compatible con cualquier modelo subyacente: al ser un adaptador PEFT, puede cargarse sobre Qwen2.5-7B-Instruct o aplicarse como capa de reescritura sobre otros modelos (Claude, GPT, Grok, modelos locales).
- Funciona mejor en entradas de 40 a 800 caracteres (frases a párrafos).
- No reescribe bloques de código ni markup estructurado.
- Soporta instrucciones en formato prompt para controlar la dirección de la transformación.

## Casos de uso

- Adaptación de documentación técnica: reescribir manuales, guías o comentarios de código al estilo conversacional de Claude para hacerlos más accesibles, manteniendo la precisión técnica.
- Generación de respuestas de chatbot con tono "Claudish": integrar el adaptador en un pipeline de generación para que un asistente local produzca respuestas con el estilo característico de Claude sin usar la API propietaria.
- Normalización de registros de conversación: convertir transcripciones de chats o correos a un tono más natural y cercano, útil para entrenar otros modelos o para análisis de sentimiento.
- Preprocesamiento de datos para fine-tuning: generar datasets sintéticos en estilo Claudish a partir de texto plano, ampliando la variedad de datos de entrenamiento para otros modelos.
- Reescritura de contenido editorial: adaptar artículos, blogs o newsletters al estilo de redacción de Claude para mantener una voz consistente en publicaciones de una empresa.
- Evaluación de estilos: comparar la salida de diferentes modelos de lenguaje cuando se les aplica el adaptador, midiendo la fidelidad al estilo y la preservación semántica.

## Benchmarks y rendimiento

La model card reporta métricas de evaluación en un conjunto de validación retenido:

| Metrica | Ingles → Claudish | Claudish → Ingles |
|---|---|---|
| Similitud de referencia | 0.87 | 0.93 |
| Preservacion de significado | 0.86 | 0.87 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el adaptador no está diseñado para tareas de razonamiento general sino para transferencia de estilo.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen2.5-7B-Instruct en bf16 requiere aproximadamente 15 GB de VRAM; en cuantización int8 baja a ~8 GB, y en int4 a ~5 GB. El adaptador LoRA añade un overhead mínimo.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para bf16, o RTX 3060/4070 (12 GB) con cuantización int8. Para producción, A100 o H100 con vLLM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de 12 GB o más con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers + PEFT.
- Latencia y throughput: no disponible; depende del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se han encontrado adaptadores LoRA específicos para transferencia de estilo "Claudish" en el ecosistema abierto. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7.6B | 128k | Apache 2.0 | Generacion general, sin estilo especifico |
| Claudish Style Adapter | 7.6B (base) + LoRA | 128k (base) | Apache 2.0 | Reescritura de estilo Claudish |
| Otros adaptadores de estilo (p.ej. estilo formal/informal) | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros adaptadores de estilo no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, y el entrenamiento se limita a textos en inglés.
- No reescribe código ni markup estructurado: el adaptador puede degradar la calidad si se aplica a bloques de código o formatos como JSON, YAML o HTML.
- Degeneración en entradas largas: la dirección inglés → Claudish puede producir salidas incoherentes en textos muy largos; se recomienda dividir documentos en párrafos.
- Riesgo de alucinación: aunque está entrenado para preservar hechos, no hay garantía absoluta; se debe verificar la salida en textos de alto riesgo.
- Comportamiento con instrucciones: entradas con formato de instrucción ("Clasifica lo siguiente...") pueden ser respondidas en lugar de reescritas, lo que requiere prompts cuidadosos.
- Dependencia del modelo base: el rendimiento del adaptador está ligado a Qwen2.5-7B-Instruct; aplicarlo sobre otros modelos puede requerir ajustes adicionales.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es Apache 2.0, sin restricciones conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adamrotmil/claudish-style-adapter
- Codigo del pipeline de entrenamiento: https://github.com/adamrotmil/claudish-style-adapter
- Traductor Claudish de ProgramAsWeights: https://programasweights.com/claudish
- Herramienta CLI Claudish (relacionada, no el adaptador): https://github.com/MadAppGang/claudish
