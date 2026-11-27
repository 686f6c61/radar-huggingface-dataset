# HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant

## Resumen

EuroLLM-9B-Cooking-Assistant es un ajuste fino (fine-tune) del modelo EuroLLM-9B-Instruct-2512, desarrollado por Humanjava Enterprises, orientado a tareas culinarias: lectura y escalado de recetas, respuesta a preguntas sobre ingredientes, técnicas y seguridad alimentaria, y abstención cuando falta información. Con 9.152.319.488 parámetros en bfloat16 (18,3 GB), se distribuye bajo licencia Apache 2.0 y soporta nueve idiomas europeos (en, de, es, fr, it, nl, pt, pl, sv). Es relevante porque prioriza el comportamiento auditable y la abstención frente a la invención de datos, un enfoque poco habitual en asistentes de dominio.

El modelo se entrenó en dos etapas LoRA (supervisada y de preferencias), ambas fusionadas en los pesos publicados. No memoriza recetas: el diseño previsto es "fine-tune para el comportamiento, recuperación para los hechos, herramientas para los números", de modo que la aplicación recupera la receta y se la entrega al modelo en el turno de usuario. La model card declara una tasa de invención del 11,4 % cuando falta la receta y un 83,8 % de acierto cuando esta se muestra (panel de votación europeo).

La relevancia actual reside en su linaje auditable: todos los modelos que generaron, etiquetaron o filtraron datos de entrenamiento y evaluación son de pesos abiertos de laboratorios europeos (EuroLLM del consorcio UTTER, Apertus de la Swiss AI Initiative, Mistral-Small y Magistral-Small de Mistral AI), con un panel independiente externo que verifica las métricas. No obstante, el modelo rinde peor que su base en preguntas generales de cocina (54,9 % frente a 64,6 %), y la revisión humana de las etiquetas está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tag `llama`); fine-tune LoRA en dos etapas sobre EuroLLM-9B-Instruct-2512 |
| Parametros totales | 9.152.319.488 (9,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de despliegue usa `--max-model-len 8192`) |
| Tipos de cuantizacion | bfloat16 en safetensors; Q4_K_M y otras disponibles en el repo GGUF hermano |
| Idiomas soportados | en, de, es, fr, it, nl, pt, pl, sv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 4 shards); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de EuroLLM-9B-Instruct-2512, un transformer decoder-only de la familia Llama según la etiqueta del repositorio. Sobre esa base se aplicaron dos etapas de LoRA: primero un ajuste supervisado y después uno de preferencias, cada una fusionada en los pesos finales; solo se publican los pesos fusionados, no los adaptadores. El entrenamiento se centró explícitamente en tres comportamientos: lectura de recetas proporcionadas en el contexto, escalado aritmético (incluidos recuentos impares de huevos, "sal al gusto" y advertencias de tamaño de sartén o tiempo de cocción) y abstención cuando no se dispone de la receta.

La model card declara un linaje auditable: los modelos que escribieron, etiquetaron, filtraron o votaron datos de entrenamiento y evaluación son de pesos abiertos europeos (EuroLLM, Apertus, Mistral-Small, Magistral-Small), y un panel independiente externo verifica las cifras. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo usa plantilla ChatML (`<|im_start|>role` … `<|im_end|>`) y no dispone de modo de razonamiento (thinking mode). La revisión humana de las etiquetas de entrenamiento está pendiente: se planea una revisión ciega de 100 elementos (50 respuestas aceptadas y 50 pares de preferencia).

## Capacidades

- Generación de texto conversacional en nueve idiomas europeos, respondiendo en el idioma de la pregunta.
- Lectura y comprensión de recetas incluidas en el turno de usuario: responde a partir del texto proporcionado.
- Escalado de recetas: aritmética de proporciones, recuentos impares de huevos, ajustes de "sal al gusto" y advertencias sobre tamaño de sartén y tiempo de cocción.
- Abstención: cuando falta la receta, normalmente la pide en lugar de inventar cantidades (tasa de invención del 11,4 % según el panel europeo).
- Respuesta a preguntas generales de cocina (platos, ingredientes, técnicas, seguridad alimentaria), con rendimiento inferior a la base.
- Identidad configurable mediante prompt de sistema: con el prompt entrenado se presenta como EuroLLM; con el prompt por defecto del template, como Cooking Assistant de Humanjava Enterprises.
- No dispone de modo de razonamiento, visión, audio ni tool calling documentado en la información disponible.

## Casos de uso

- Asistente de cocina conversacional multi-turno: una aplicación recupera la receta y la inserta en el turno de usuario; el modelo responde preguntas sobre esa receta concreta en el idioma del usuario, con una tasa de acierto declarada del 83,8 % cuando la receta está presente.
- Escalado de recetas para servicios de catering: el modelo ajusta cantidades proporcionalmente, gestiona recuentos impares de huevos y añade advertencias de tiempo y tamaño de recipiente, comportamientos entrenados específicamente.
- Aplicaciones de seguridad alimentaria: responde sobre técnicas y conservación, y se abstiene cuando la pregunta requiere datos que no se le han proporcionado, reduciendo el riesgo de instrucciones peligrosas inventadas.
- Integración en asistentes de supermercado o planificación de menús: dado que soporta nueve idiomas europeos, un mismo despliegue cubre mercados de en, de, es, fr, it, nl, pt, pl y sv sin modelos separados.
- Despliegue en hardware de consumo: con cuantización Q4_K_M funciona íntegramente en una GPU de 8 GB de VRAM, lo que permite prototipos locales y entornos sin infraestructura de datacenter.
- Evaluación de comportamiento de abstención: útil como referencia para investigar calibración y rechazo en dominios verticales, dado su linaje auditable y su panel de evaluación independiente.
- Base para fine-tunes de dominio con licencia permisiva: Apache 2.0 permite uso comercial y derivados sin restricciones de atribución más allá de las habituales.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre un conjunto fijo de 682 preguntas de cocina (21 idiomas; 290 con receta mostrada, 10 de recuerdo tipo "¿cómo se hace X?" y 300 que requieren receta):

| Metrica | Panel europeo | Panel independiente |
|---|---|---|
| Acierto con receta mostrada | 83,8 % | 83,8 % |
| Invención sin receta | 11,4 % | 14,3 % |
| Preguntas generales de cocina | 54,9 % | no disponible |
| Base EuroLLM-9B-Instruct en general | 64,6 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18,3 GB en bfloat16 para los pesos; con cuantización Q4_K_M cabe en 8 GB de VRAM según la model card.
- GPU recomendadas: A100 o H100 para bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16 ajustado; RTX 3060/4060 (8 GB) con Q4_K_M.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M en 8 GB; en bfloat16 requiere al menos 24 GB.
- Opciones de despliegue: Transformers, vLLM (`vllm serve … --max-model-len 8192`), llama.cpp, Ollama y LM Studio mediante el repo GGUF hermano; compatible con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EuroLLM-9B-Cooking-Assistant | 9,2 B | no disponible (ejemplo a 8192) | Apache 2.0 | Fine-tune culinario con abstención; 83,8 % con receta, 54,9 % general |
| EuroLLM-9B-Instruct-2512 | 9,2 B | no disponible | no disponible | Modelo base; 64,6 % en preguntas generales de cocina, superior al fine-tune en ese apartado |
| Qwen3-8B-Cooking-Assistant (Humanjava) | ~8 B | no disponible | no disponible | Hermano de la misma familia, misma metodología de evaluación |
| GLM-4-9B-Cooking-Assistant (Humanjava) | ~9 B | no disponible | no disponible | Hermano de la misma familia, misma metodología de evaluación |
| Olmo-3-7B-Cooking-Assistant (Humanjava) | ~7 B | no disponible | no disponible | Hermano de la misma familia, misma metodología de evaluación |

## Limitaciones y advertencias

- Rendimiento general inferior a la base: 54,9 % frente a 64,6 % en preguntas generales de cocina; el fine-tune degrada el conocimiento general del modelo original.
- Tasa de invención del 11,4 % (panel europeo) o 14,3 % (panel independiente) cuando la pregunta requiere una receta que no se ha proporcionado; no es cero.
- No memoriza recetas: sin la receta en el contexto, el modelo no puede responder con fiabilidad y debe pedirla.
- Revisión humana pendiente: ninguna persona ha revisado aún las etiquetas de entrenamiento; se planea una revisión ciega de 100 elementos cuyos resultados se añadirán a la model card.
- Sin modo de razonamiento (thinking mode), visión, audio ni tool calling documentado.
- Longitud de contexto no especificada en la información disponible; el ejemplo de despliegue limita a 8192 tokens.
- Identidad inconsistente: con el prompt de sistema entrenado se presenta como EuroLLM, no como Cooking Assistant, porque los datos de entrenamiento no contienen respuestas de identidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un fine-tune no oficial, no respaldado por el proyecto EuroLLM ni por el consorcio UTTER.
- Riesgo de sesgos y alucinaciones no cuantificado más allá de las métricas de invención declaradas; no hay evaluación de sesgos publicada en la información disponible.
- Fecha de creación del repositorio (2026-11-27) y cero descargas y likes: modelo muy reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant
- GGUF (llama.cpp, Ollama, LM Studio): https://huggingface.co/HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant-GGUF
- Modelo base: https://huggingface.co/utter-project/EuroLLM-9B-Instruct-2512
- Hermano Qwen3-8B: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Hermano GLM-4-9B: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant
- Hermano Olmo-3-7B: https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant
- Guía: https://github.com/HumanjavaEnterprises/qwen3-8b-cooking-assistant/tree/main/eurollm-9b
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
