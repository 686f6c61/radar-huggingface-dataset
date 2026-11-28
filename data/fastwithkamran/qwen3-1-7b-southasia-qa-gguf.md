# fastwithkamran/Qwen3-1.7B-SouthAsia-QA-GGUF

## Resumen

Qwen3-1.7B-SouthAsia-QA-GGUF es un ajuste fino del modelo Qwen/Qwen3-1.7B (1.720.574.976 parametros) desarrollado por el usuario fastwithkamran, orientado a respuesta a preguntas con contexto fundamentado (grounded QA), resolucion de contradicciones y negaciones, defensa frente a inyeccion de prompts y abtencion estricta sobre tematicas del sur de Asia, cubriendo las ocho naciones de la SAARC (Pakistan, India, Bangladesh, Nepal, Sri Lanka, Butan, Maldivas y Afganistan).

El modelo parte del Qwen3-1.7B en modo no-thinking y se entrena mediante QLoRA con Unsloth sobre un dataset propio de 214 ejemplos manualmente redactados (174 de entrenamiento, 20 de validacion y 20 de evaluacion estrictamente reservados con entidades disjuntas). Se distribuye unicamente en formato GGUF cuantizado Q4_K_M (1,11 GB), pensado para ejecucion local via Ollama en hardware modesto.

Su relevancia radica en el comportamiento de abtencion: segun la model card, el modelo base fallaba al responder contradicciones explicitas y alucinaba datos omitidos (fechas, edades), mientras que el ajuste fino eleva la puntuacion en el conjunto de evaluacion reservado de 5/20 (25,0%) a 19/20 (95,0%). Es un modelo de nicho, de un solo idioma (ingles) y con un dataset muy pequeno, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B); no se detalla configuracion interna en la informacion disponible |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como especificacion oficial; el entrenamiento uso max_seq_length=1024 y la evaluacion num_ctx=2048 |
| Tipos de cuantizacion | Q4_K_M (unica publicada, 1,11 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptadores QLoRA entrenados via Unsloth, no se publican safetensors en el repo |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parametros en modo no-thinking (enable_thinking=False). El entrenamiento se realizo con QLoRA mediante Unsloth 2026.11.12, con rango LoRA r=16, lora_alpha=32, 28 capas objetivo, tasa de aprendizaje 2e-4, 2 epocas, max_seq_length=1024, batch_size=1, gradient_accumulation_steps=4 y semilla 42. El entrenamiento completo duro 142,71 segundos en una NVIDIA Tesla T4 de Google Colab (15.360 MiB), con un pico de VRAM de 4,23 GiB. No se menciona RLHF ni DPO.

El dataset consta de 214 ejemplos originales redactados manualmente sobre tematicas del sur de Asia, divididos en 174 de entrenamiento, 20 de validacion y 20 de evaluacion estrictamente reservados con entidades disjuntas. El objetivo del ajuste es triple: responder solo a partir del pasaje suministrado, resolver contradicciones y negaciones explicitas sin colapsar en abtencion, y resistir inyecciones de prompt incluidas en texto citado. La cuantizacion se realizo con llama.cpp (version b12776-mix-ef2df21) a Q4_K_M. No se describe ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto y respuesta a preguntas fundamentada exclusivamente en un pasaje de contexto suministrado.
- Abtencion estricta: responde literalmente "The passage does not specify that." cuando el pasaje no contiene la respuesta.
- Resolucion de contradicciones y negaciones explicitas dentro del pasaje (por ejemplo, ubicacion de una fortaleza frente a la afirmacion del usuario).
- Defensa frente a inyeccion de prompts: trata el texto citado de visitantes o usuarios como datos, no como instrucciones.
- Cobertura tematica del sur de Asia: Pakistan, India, Bangladesh, Nepal, Sri Lanka, Butan, Maldivas y Afganistan.
- Modo no-thinking (el modelo base Qwen3 se usa sin cadena de razonamiento explicita).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni multilingues mas alla del ingles.

## Casos de uso

- Asistencia turistica con contexto controlado: el modelo responde preguntas sobre monumentos, ciudades y paises del sur de Asia usando solo la ficha o pasaje proporcionado, absteniendose cuando el dato no aparece, lo que reduce respuestas inventadas en guias interactivas.
- Atencion al cliente sobre documentacion regional: con pasajes de politicas, condiciones y excepciones por pais, el modelo mantiene nombres regionales y condiciones sin extrapolar, adecuado para consultas de envio o cobertura en la region.
- Sistemas de QA sobre corpus documental cerrado: integrado en un pipeline RAG donde el recuperador entrega el pasaje y el modelo se limita a extraer la respuesta, con abtencion explicita cuando la recuperacion no cubre la pregunta.
- Moderacion y robustez frente a inyeccion de prompts: el modelo resiste instrucciones embebidas en texto citado del usuario, util en entornos donde el contenido del usuario se inserta en el prompt (formularios, chats publicos, resenas).
- Educacion y material didactico regional: respuestas factuales y concisas sobre historia y geografia del sur de Asia, con abtencion ante preguntas fuera del pasaje para evitar datos erroneos en contextos academicos.
- Despliegue en local y entornos con recursos limitados: el GGUF Q4_K_M de 1,11 GB se ejecuta via Ollama en equipos sin GPU dedicada; la model card documenta su funcionamiento en Windows 10 con 7,94 GB de RAM en CPU, lo que permite prototipos y demos offline.
- Evaluacion de robustez de pipelines RAG: sirve como componente de referencia para medir abtencion y resistencia a inyeccion antes de sustituirlo por modelos mayores en produccion.

## Benchmarks y rendimiento

Datos de la model card, evaluados en local sobre Windows 10 (7,94 GB de RAM, CPU/Ollama 0.40.16, temperature=0, num_ctx=2048) con el conjunto reservado eval.jsonl de 20 prompts no vistos:

| Modelo | Formato | Puntuacion reservada | Precision | Latencia por prompt |
|---|---|---:|---:|---:|
| Base qwen3:1.7b | Q4_K_M (Ollama) | 5 / 20 | 25,0% | 2,6 s – 5,1 s |
| Fine-tuned south-asia-qwen3 | Q4_K_M (1,11 GB GGUF) | 19 / 20 | 95,0% | 3,4 s – 8,5 s |

Mejoras documentadas: correccion de 10/10 casos de colapso negacion-abtencion, eliminacion de alucinaciones parametricas en fechas y edades omitidas (por ejemplo, la edad en el primer British Open de Jahangir Khan) y resistencia a inyecciones de prompt entrecomilladas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de VRAM documentado corresponde al entrenamiento (4,23 GiB en T4); para inferencia con Q4_K_M el modelo ocupa 1,11 GB de pesos, por lo que cabe en GPU con 2-4 GB de VRAM libre.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas de gama media y baja; la model card lo valida en CPU con 7,94 GB de RAM.
- Opciones de despliegue: Ollama (documentado con Modelfile), llama.cpp (formato GGUF nativo); no se documentan vLLM ni TGI para este artefacto.
- Latencia y throughput: 3,4 s – 8,5 s por prompt en CPU con Ollama y num_ctx=2048 segun la model card; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-SouthAsia-QA-GGUF | 1,7B | no disponible (entrenado a 1024, evaluado a 2048) | 19/20 en eval propio de 20 prompts | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en la informacion proporcionada | 5/20 en el mismo eval | Apache-2.0 | safetensors y GGUF en Hugging Face |
| Qwen3-1.7B cuantizado estandar (qwen3:1.7b en Ollama) | 1,7B | no disponible | 5/20 en el mismo eval | Apache-2.0 | Ollama |

La comparativa se limita al modelo base y su version cuantizada estandar, ya que no se dispone de datos de otros ajustes finos comparables en la informacion proporcionada. La ventaja del ajuste se circunscribe al dominio del sur de Asia y al comportamiento de abtencion; fuera de ese dominio no hay evidencia de mejora.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (214 ejemplos), lo que limita la generalizacion fuera de las entidades y plantillas vistas; el conjunto de evaluacion es de solo 20 prompts.
- La model card documenta una fuga de alucinacion parametrica en el prompt reservado #10 (Sigiriya) tras la cuantizacion Q4_K_M: el modelo pre-cuantizacion abstenia correctamente y el GGUF respondio "King Kotte (Kotte Dynasty) in the 12th century". La cuantizacion degrada el comportamiento de abtencion en al menos un caso.
- Solo soporta ingles; no se documentan capacidades multilingues pese a la tematica regional.
- Riesgo de alucinacion fuera del dominio y cuando el pasaje es ambiguo o incompleto; la abtencion depende de usar el system prompt exacto de entrenamiento.
- El modelo esta pensado para modo no-thinking; no se documenta su comportamiento con cadena de razonamiento activada.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre exactitud factual ni sobre el cumplimiento normativo en aplicaciones reales.
- Sin descargas ni validacion externa en el momento de la ficha (0 descargas, 1 like); no hay evaluacion independiente de los resultados declarados.
- No se publican pesos en safetensors ni adaptadores LoRA en el repo de Hugging Face; solo el GGUF Q4_K_M.

## Enlaces

- Hugging Face: https://huggingface.co/fastwithkamran/Qwen3-1.7B-SouthAsia-QA-GGUF
- Repositorio del proyecto (dataset, scripts, Modelfile, logs de evaluacion): https://github.com/fastwithkamran/Qwen3-1.7B_fine-tuned
- Modelfile para Ollama: https://github.com/fastwithkamran/Qwen3-1.7B_fine-tuned/blob/main/Modelfile
- Herramienta de entrenamiento finetune-anywhere: https://github.com/junaiddshaukat/finetune-anywhere
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
