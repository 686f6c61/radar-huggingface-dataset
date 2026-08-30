# armand0e/Muse-Glimmer-30B-Fable-Distill-LoRA

## Resumen

Muse-Glimmer-30B-Fable-Distill-LoRA es un adaptador QLoRA (PEFT, r=32) publicado por armand0e, diseñado para ajustar el modelo base meta-models/Muse-Glimmer-30B en tareas de agente y tool use. El adaptador se entrenó sobre trazas de agente (Claude Code y Cursor) y chat destilado de Claude Fable 5, con una porción multilingüe que cubre siete idiomas. Con solo 209,6 millones de parámetros adicionales (416 módulos LoRA sobre las proyecciones de atención y MLP), el adaptador modifica únicamente la capa de lenguaje del modelo base, dejando intactos el encoder de visión, el proyector, los embeddings y la cabeza de salida, por lo que las capacidades multimodales del modelo original se conservan por completo.

El modelo base Muse Glimmer 30B es un transformer denso de 29,6 mil millones de parámetros con un encoder de percepción ViT-G/14 de aproximadamente 1,8 mil millones de parámetros, contexto de 128K tokens y licencia Apache 2.0, destilado de Muse Spark para agentes locales en una sola GPU. Este adaptador añade un fine-tuning supervisado sobre el formato de chat propietario "Onyx ATEM", que separa el razonamiento en un canal dedicado y utiliza llamadas a herramientas en XML. La relevancia de este adaptador radica en que permite mejorar las capacidades agentic del modelo base sin necesidad de reentrenar el modelo completo, con un coste de almacenamiento de solo 0,9 GB y un proceso de entrenamiento reproducible en una GPU de 64 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Muse Glimmer 30B (transformer denso causal con encoder ViT-G/14) |
| Parametros totales | 209,6 M (adaptador) + 29,6 B (base, no modificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 24 576 tokens (entrenamiento del adaptador); el base soporta hasta 128K |
| Tipos de cuantizacion | NF4 (base de entrenamiento), bf16 (base original) |
| Idiomas soportados | en, es, fr, de, pt, ja, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | PEFT safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre la versión NF4 del modelo base (`unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`), con r=32, alpha=32 y dropout 0. Se modifican 416 módulos correspondientes a las proyecciones `self_attn.{q,k,v,o,gate}_proj` y `mlp.{gate,up,down}_proj` de la capa de lenguaje, mientras que el encoder de visión, el proyector, los embeddings y la cabeza de salida permanecen congelados. El entrenamiento se realizó con contexto de 24 576 tokens, LR 8e-5 lineal, warmup de 5 pasos, 2 épocas (164 pasos), batch 1 con grad-accum 8, optimizador `paged_adamw_8bit`, `max_grad_norm` 0.3 y gradient checkpointing, todo en una GPU de 64 GB.

Los datos de entrenamiento consisten en 651 ejemplos (3,62 millones de tokens) procedentes de trazas de agente de Claude Code y Cursor, chats multilingües destilados de Claude Fable 5 (353 en inglés y 106 traducidos a es/fr/de/pt/ja/zh) y sesiones personales de Claude Code. El preprocesado se realizó con la herramienta teich 0.3.6 más un parche de formato para el esquema ATEM. La supervisión se aplicó de forma selectiva: en filas sin razonamiento se dejan sin supervisar los encabezados de enrutamiento iniciales, mientras que en filas con razonamiento se supervisan los encabezados posteriores a `<|eom|>` y la continuación `<|start|>assistant`, lo que permite que el modelo aprenda la transición pensamiento → respuesta. Se eliminaron los textos de harness (errores de API, mensajes de login) que en una primera ejecución se memorizaron literalmente.

## Capacidades

- Razonamiento multi-paso en canal separado: el modelo emite razonamiento en un canal `to=self` con marcadores `<|start|>assistant to=self<|message|>…<|eom|>`, controlado por el parámetro `reasoning_strength` (low/medium/high/xhigh, por defecto high).
- Tool calling nativo: las llamadas a funciones se generan como bloques XML `<atem:function_calls>` con argumentos en formato diccionario (no JSON string), y los resultados de herramientas se insertan como bloques `<tool_output>`.
- Multilingüe: soporta inglés, español, francés, alemán, portugués, japonés y chino, aunque el entrenamiento no inglés representa aproximadamente el 10% de los tokens.
- Multimodal preservado: al no tocar el encoder de visión ni el proyector, el modelo conserva la capacidad de procesar imágenes intercaladas con texto del base Muse Glimmer 30B.
- Formato de chat propietario "Onyx ATEM": el adaptador está entrenado para seguir este esquema de mensajería con canales de razonamiento, llamadas a herramientas y terminadores `<|eot|>`.
- Recuperación de fallos: el fine-tuning sobre trazas de agente reales incluye ejemplos de errores y reintentos, lo que refuerza la capacidad del modelo para manejar fallos en tareas de agente.

## Casos de uso

- Agentes de codigo locales: el adaptador puede integrarse en entornos como Claude Code o Cursor para generar trazas de agente con razonamiento explícito y llamadas a herramientas, aprovechando el contexto de 24K tokens para tareas de refactorizacion o depuracion de proyectos medianos.
- Asistentes de programacion con tool calling: al soportar el formato ATEM, el modelo puede invocar funciones externas (busqueda en repositorio, ejecucion de tests, lectura de archivos) en pipelines de CI/CD, siempre que se registren parsers personalizados en el servidor de inferencia.
- Automatizacion de tareas administrativas: el razonamiento en canal separado permite auditar el proceso de decision del modelo antes de ejecutar acciones, util para flujos que requieren trazabilidad (generacion de informes, gestion de incidencias).
- Soporte multilingue en atencion al cliente: con siete idiomas entrenados, el adaptador puede gestionar conversaciones multi-turno en espanol, frances, aleman, portugues, japones y chino, manteniendo el contexto de la conversacion en la ventana de 24K tokens.
- Analisis de documentos con imagenes: al conservar el encoder de vision del base, el adaptador puede procesar capturas de pantalla o diagramas junto con texto, por ejemplo para documentar bugs o revisar interfaces de usuario.
- Despliegue en hardware de consumo: al ser un adaptador ligero sobre una base cuantizada a 4 bits, el conjunto cabe en GPUs de 24 GB, permitiendo ejecutar agentes locales sin conexion a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el adaptador no ha sido evaluado contra una variante de solo respuestas, y no se proporcionan metricas como MMLU, HumanEval o GSM8K para este adaptador especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade 0,9 GB a los pesos del base. Con el base en NF4 (4 bits), el conjunto requiere aproximadamente 16-20 GB de VRAM; con el base en bf16, se necesitan alrededor de 60 GB.
- GPU recomendadas: para inferencia en 4 bits, una RTX 4090 (24 GB) o A100 40 GB son suficientes; para entrenamiento se utilizo una GPU de 64 GB (por ejemplo, A100 80 GB o similar).
- Compatibilidad con GPU de consumo: si, con cuantizacion NF4 del base y el adaptador cargado via PEFT, cabe en una RTX 4090 o similar con 24 GB.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (requiere parsers personalizados para el formato ATEM; los parsers estandar de vLLM <= 0.28 no funcionan), llama.cpp (si se fusiona el adaptador con el base en bf16 o GGUF).
- Latencia y throughput: no disponible; depende del hardware y del tamaño de contexto utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Fable-Distill-LoRA (este) | 209,6 M (adaptador) + 29,6 B base | 24K (entrenamiento), 128K base | Apache-2.0 | PEFT safetensors | Adaptador LoRA sobre base multimodal |
| meta-models/Muse-Glimmer-30B (base) | 29,6 B | 128K | Apache-2.0 | safetensors (bf16) | Modelo completo, multimodal, tool use nativo |
| Qwen2.5-32B-Instruct (alternativa generica) | 32,5 B | 128K | Apache-2.0 | safetensors, GGUF | No multimodal, tool calling JSON, ampliamente soportado en vLLM/Ollama |

La comparativa se limita a estos dos modelos porque no se dispone de datos de rendimiento del adaptador. La principal diferencia con el base es que el adaptador esta especializado en trazas de agente y chat multilingue, pero no se han publicado metricas que demuestren una mejora cuantitativa.

## Limitaciones y advertencias

- El entrenamiento no ingles representa solo el 10% de los tokens, por lo que el rendimiento en espanol, frances, aleman, portugues, japones y chino puede ser inferior al ingles.
- No se ha evaluado el adaptador contra una variante de solo respuestas, por lo que se desconoce si el razonamiento supervisado mejora o degrada la calidad de las respuestas directas.
- El adaptador se entreno sobre una base cuantizada NF4; cualquier fusion en bf16 no sera bit-identica a lo que el modelo vio durante el entrenamiento, lo que puede introducir pequenas diferencias en el comportamiento.
- El formato de chat ATEM no es compatible con los parsers estandar de vLLM (version <= 0.28); desplegar sin parsers personalizados puede provocar que los marcadores de canal aparezcan en el contenido de salida o que las llamadas a herramientas se malinterpreten.
- El conjunto de datos es reducido (651 ejemplos), lo que limita la generalizacion a dominios no representados en las trazas de agente.
- No se proporcionan benchmarks publicos, por lo que no es posible comparar objetivamente el rendimiento del adaptador con otras alternativas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el adaptador dependen de la infraestructura de Meta; se recomienda verificar los terminos de uso del base en el repositorio oficial.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/armand0e/Muse-Glimmer-30B-Fable-Distill-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Recetas vLLM para Muse Glimmer: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- API y playground en Fireworks AI: https://fireworks.ai/models/fireworks/muse-glimmer-30b
- Repositorio teich (herramienta de preprocesado): https://github.com/TeichAI/teich
