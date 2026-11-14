# malkolm777/zils-lite-a14

## Resumen

zils-lite-a14 es un modelo de decisión de tipo "feature-extraction" publicado por el usuario malkolm777 en Hugging Face. Se trata de un modelo derivado de la familia Qwen3.5-0.8B, concretamente del modelo base vllm-sr/d3-lite, y está pensado para su uso dentro del "subnet 127 lite soup pool" del ecosistema Zils. Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), es un modelo compacto orientado a tareas de clasificación y decisión más que a generación de texto libre.

El modelo se construye mediante un "soup" (promediado uniforme de pesos al 0,5/0,5) de dos estudiantes entrenados con LoRA de rango 64 sobre los cuerpos base vllm-sr/d3-lite y Matilda-Decision-v1-Edge, destilados a partir de un promedio uniforme de dos modelos públicos del pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc). El entrenamiento usó aproximadamente 25.000 filas de datasets públicos en el formato de decisión del pool, además de exámenes semilla públicos de Zils (v1/v2/v4), con objetivos suaves (0,5 distribución del profesor + 0,5 etiqueta gold).

Su relevancia radica en ser un ejemplo de modelo de decisión destilado y fusionado de bajo coste computacional, con licencia Apache-2.0 y compatibilidad con transformers, lo que facilita su despliegue en entornos con recursos limitados. No obstante, la información pública disponible es muy escasa y el modelo no cuenta con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B, según model card); código personalizado (custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se desconoce si hay versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5-0.8B, según indica la model card, aunque el repositorio incluye código personalizado (`custom_code`) y está etiquetado como `qwen3_5`. El modelo no es un modelo generativo de propósito general, sino un "decision body" orientado a feature-extraction y clasificación de decisiones dentro del pool Zils.

El entrenamiento se realizó en dos fases: primero, dos estudiantes partieron de los cuerpos base vllm-sr/d3-lite y Matilda-Decision-v1-Edge y se entrenaron con una pasada LoRA (rango 64, AdamW con lr 5e-5, 1 época, semilla 553) destilando desde un promedio uniforme de dos modelos públicos del pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc). Los datos consistieron en unas 25.000 filas de datasets públicos (mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, sarcasm headlines, SVAMP, commonsense_qa, tweet_eval, 20newsgroups, glaive function calling y tareas de BIG-bench) en el formato de decisión del pool, más los exámenes semilla públicos de Zils v1/v2/v4. Los objetivos fueron suaves: 0,5 × la distribución de respuesta del profesor + 0,5 × la etiqueta gold. Finalmente, los dos estudiantes se fusionaron mediante un promedio uniforme de pesos (0,5/0,5). No se menciona RLHF ni DPO.

## Capacidades

- Clasificación y decisión sobre ítems de examen y tareas de opción múltiple en el formato del pool Zils.
- Extracción de características (feature-extraction) como pipeline principal declarado.
- Procesamiento de tareas de razonamiento y conocimiento general derivadas de datasets como MMLU, BoolQ, ANLI, GLUE y commonsense_qa.
- Manejo de tareas de matemáticas elementales y razonamiento aritmético (GSM8K, SVAMP) en formato de decisión.
- Clasificación de intenciones y diálogo (banking77, clinc150, When2Call).
- Análisis de sentimiento y sarcasmo (poem_sentiment, iSarcasm, sarcasm headlines, tweet_eval).
- Clasificación de textos largos o temáticos (20newsgroups).
- Soporte de function calling en formato de decisión (glaive function calling).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación automática de exámenes de opción múltiple: el modelo puede clasificar ítems de examen en el formato del pool Zils y asignar una decisión entre las opciones disponibles, aprovechando su entrenamiento específico con exámenes semilla v1/v2/v4.
- Clasificación de intenciones en asistentes conversacionales: gracias a su entrenamiento con banking77 y clinc150, puede etiquetar la intención del usuario en dominios bancarios y de atención al cliente, integrándose como componente de enrutamiento en un pipeline mayor.
- Detección de sarcasmo y análisis de sentimiento en redes sociales: su exposición a iSarcasm, tweet_eval y titulares sarcásticos permite usarlo como clasificador de sentimiento o sarcasmo en textos cortos, con bajo coste de inferencia por su tamaño de 0,85B.
- Filtrado y moderación de contenido temático: con 20newsgroups puede clasificar textos en categorías temáticas, útil para enrutar o etiquetar contenido en sistemas de gestión documental.
- Soporte a function calling en agentes: puede decidir qué función invocar en un flujo de tool calling (glaive function calling), sirviendo como componente de decisión ligero dentro de un agente multi-paso.
- Razonamiento aritmético en formato de decisión: para tareas de GSM8K y SVAMP, puede seleccionar la respuesta correcta entre candidatos, útil en sistemas de verificación de respuestas matemáticas.
- Investigación sobre destilación y model soups: el modelo es un caso documentado de fusión de estudiantes LoRA con objetivos suaves, útil como referencia reproducible en experimentos de destilación y merging de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,4 GB (852.985.920 parámetros × 4 bytes), más overhead de activaciones y del código personalizado.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB de pesos, más overhead; viable en GPUs consumer con 4-8 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,85 GB de pesos; en 4 bits, alrededor de 0,43 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por tamaño; para despliegue en servidor, A100 o H100 no son necesarias pero funcionarían.
- Cabe en GPU consumer: sí, con margen amplio, incluso en GPUs de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (librería declarada); al requerir `custom_code`, es necesario confiar en el código remoto del repositorio. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-a14 | 852.985.920 | no disponible | apache-2.0 | Hugging Face (0 descargas) | Modelo de decisión derivado de Qwen3.5-0.8B, con custom_code |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Cuerpo base del que parte zils-lite-a14 |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | apache-2.0 | Hugging Face | Modelo público del pool usado como profesor |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | apache-2.0 | Hugging Face | Modelo público del pool usado como profesor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: no hay descargas ni valoraciones, y la model card no detalla el contexto máximo, los idiomas ni el rendimiento real.
- Riesgo de alucinación: aunque es un modelo de decisión, cualquier uso generativo o fuera de su formato de entrenamiento puede producir salidas no fiables.
- Sesgos desconocidos: los datasets de entrenamiento (MMLU, BoolQ, GLUE, etc.) pueden introducir sesgos de dominio, idioma y cultura; no se documentan mitigaciones.
- Limitaciones de idioma: no se especifican los idiomas soportados; el entrenamiento con datasets mayoritariamente en inglés sugiere un rendimiento limitado en castellano u otros idiomas.
- Dependencia de `custom_code`: el repositorio requiere ejecutar código personalizado con `trust_remote_code=True`, lo que implica un riesgo de seguridad y de reproducibilidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE; conviene verificar las licencias de los datasets y modelos base utilizados.
- Caveat para producción: al ser un "soup" de estudiantes LoRA destilados, su comportamiento puede desviarse del de los modelos base; se recomienda evaluarlo en el dominio concreto antes de desplegarlo.
- Fecha de creación futura (2026-11-14) en los metadatos: conviene verificar la autenticidad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-a14
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Profesor 1: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Profesor 2: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
