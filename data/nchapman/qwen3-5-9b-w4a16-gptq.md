# nchapman/Qwen3.5-9B-W4A16-GPTQ

## Resumen

nchapman/Qwen3.5-9B-W4A16-GPTQ es una cuantizacion INT4 weight-only (esquema W4A16) del modelo Qwen/Qwen3.5-9B, generada con la libreria llm-compressor y publicada por el usuario nchapman. El objetivo es reducir el peso del modelo de los ~18-19 GB en BF16 a unos 6 GB de pesos cuantizados, de forma que quepa con holgura en GPUs de 24 GB (RTX 3090 Ti, RTX 4090, A10, L4, etc.) y pueda servirse mediante vLLM con kernels INT4 Marlin o pack-quantized.

El modelo base es un transformer denso multimodal (image-text-to-text) de la familia Qwen3.5, con atencion hibrida basada en Gated Delta Networks, torre de vision, 262K tokens de contexto y soporte de MTP (multi-token prediction) para decodificacion especulativa. Cuenta con 9.409.813.744 parametros y licencia Apache 2.0, heredada del modelo original.

Su relevancia practica esta en que permite desplegar un modelo de ~9B con vision y contexto largo en hardware consumer o de gama profesional de una sola GPU, manteniendo una calidad casi identica a la version BF16 segun las evaluaciones publicadas (HumanEval pass@1 0.896 en la version cuantizada frente a 0.866 en BF16, dentro del ruido de decodificacion greedy, y un incremento de perplejidad del 1,08 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) con atencion hibrida Gated DeltaNet; soporte de MTP |
| Parametros totales | 9.409.813.744 |
| Longitud de contexto | 262.000 tokens en el modelo base; el ejemplo de servicio del autor usa `--max-model-len 32768` |
| Tipos de cuantizacion | W4A16: pesos INT4, activaciones BF16, grupo de tamano 128, simetrico, act-order estatico (GPTQ) |
| Idiomas soportados | no disponible (la calibracion se hizo con conversaciones multilingues, pero no hay listado oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` / `pack-quantized` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso multimodal que combina atencion hibrida basada en Gated Delta Networks (alternando capas de estado recurrente con atencion clasica), una torre de vision para entrada de imagenes y un predictor MTP para decodificacion especulativa. Esta disenado para razonamiento, comprension visual y comportamiento agentico, con una ventana de contexto de 262K tokens.

La cuantizacion se aplico con `GPTQModifier(targets="Linear", scheme="W4A16", ignore=["lm_head", "re:.*visual.*"])` sobre llm-compressor. El conjunto de calibracion consistio en 384 conversaciones multilingues de codigo agentico y uso de herramientas, truncadas a 4096 tokens. Los componentes que se mantienen en BF16 son la torre de vision, el `lm_head` y el predictor MTP, preservado expresamente para no romper la decodificacion especulativa. Un A/B de algoritmos realizado por el autor sobre el modelo hermano Qwen3.5-4B con calibracion identica mostro que GPTQ supera de forma clara a AWQ y AutoRound en esta arquitectura hibrida Gated-DeltaNet. El repositorio incluye ademas un `generation_config.json` con los valores de muestreo recomendados por Qwen y una plantilla de chat corregida de froggeric/Qwen-Fixed-Chat-Templates (v22.5) que arregla problemas de la plantilla oficial (intoxicacion por `<think>` vacio, invalidacion del prefix KV-cache, fallos de serializacion de argumentos en tool calls y bloqueos en flujos agenticos).

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable (`enable_thinking`) e intensidad de razonamiento regulable (`reasoning_effort`) mediante `chat_template_kwargs`.
- Generacion y comprension de codigo, con resultados de HumanEval pass@1 de 0.896 y HumanEval+ de 0.835 en decodificacion greedy.
- Capacidad multimodal: pipeline `image-text-to-text`, con torre de vision en BF16 sin cuantizar.
- Soporte nativo de tool calling y function calling en formato XML nativo de Qwen (parser `qwen3_xml` en vLLM).
- Flujos agenticos multi-paso, con la plantilla de chat parcheada especificamente para evitar bloqueos en tareas de agente.
- Contexto largo de hasta 262K tokens en el modelo base.
- Capacidades multilingues heredadas del modelo base, aunque sin listado oficial de idiomas.
- Decodificacion especulativa mediante el predictor MTP preservado en BF16.
- No se documentan capacidades de audio ni de generacion de imagen.

## Casos de uso

- Asistente de codigo en produccion: el modelo mantiene practicamente intacto su rendimiento en HumanEval respecto a BF16, por lo que puede integrarse en pipelines de revision de codigo, autocompletado o generacion de tests sin renunciar a la calidad del modelo completo, con un coste de VRAM de unos 6 GB de pesos.
- Agentes autonomos con herramientas: gracias al soporte nativo de tool calling XML y a la plantilla corregida que evita el estancamiento agentico, es adecuado para orquestadores que encadenan varias llamadas a APIs o funciones en una misma tarea.
- Analisis de documentos con imagenes: al conservar la torre de vision en BF16, permite tareas de OCR, extraccion de datos de capturas o diagramas y respuesta a preguntas sobre figuras dentro de un flujo multimodal.
- Atencion al cliente multi-turno: con hasta 262K tokens de contexto en el modelo base puede mantener historiales de conversacion muy largos y recursar documentacion de soporte sin truncar.
- RAG sobre corpus extensos: la ventana de contexto permite insertar muchos fragmentos recuperados en un solo prompt, reduciendo la necesidad de reordenar o recortar el contexto.
- Despliegue en estaciones de trabajo con una sola GPU: el tamano de pesos (~6 GB) deja margen en tarjetas de 24 GB para cache KV de contexto largo, lo que habilita entornos de desarrollo locales sin infraestructura de centro de datos.
- Inferencia en dispositivos edge tipo Jetson: la variante W4A16 del modelo base esta documentada para Jetson Orin, lo que abre la puerta a despliegues embebidos con este mismo formato de cuantizacion.
- Evaluacion y prototipado rapido: sirve como sustituto economico del modelo BF16 para iterar sobre prompts, plantillas de chat y flujos agenticos antes de pasar a produccion.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion en la model card:

| Evaluacion | BF16 base | Esta cuantizacion |
|---|---|---|
| HumanEval pass@1 (greedy) | 0.866 | 0.896 |
| HumanEval+ pass@1 (greedy) | 0.823 | 0.835 |
| Delta de perplejidad (conjunto retenido de agente de codigo) | — | +1,08 % |
| KL media (base ‖ cuantizado) | — | 0,0616 |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, AIME, GPQA, etc.) para esta cuantizacion concreta en la informacion disponible. La model card de RedHatAI/Qwen3.5-9B-quantized.w4a16 menciona evaluaciones sobre GSM8k-Platinum, MMLU-Pro, IFEval, Math 500, AIME 2025 y GPQA Diamond, pero esos numeros corresponden a otro checkpoint y no se detallan en la informacion proporcionada.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 6 GB segun el autor; el repositorio completo ocupa 9,1 GB (incluye los componentes en BF16 sin cuantizar, como la torre de vision, el `lm_head` y el predictor MTP).
- VRAM estimada para inferencia: alrededor de 6-8 GB solo para pesos; el consumo total depende de la longitud de contexto por la cache KV. Con 24 GB hay margen suficiente para servir contextos largos.
- GPUs objetivo: NVIDIA Ampere y posteriores (el autor cita explicitamente RTX 3090 Ti de 24 GB); tambien funciona en Blackwell y GPUs de clase GB.
- Cabe en GPU consumer: si, en tarjetas de 24 GB como RTX 3090, 3090 Ti, 4090 o en GPUs profesionales tipo A10, L4, L40S. No se documenta su comportamiento en GPUs de menos de 24 GB.
- Opciones de despliegue: vLLM es la ruta soportada, con kernels INT4 Marlin o pack-quantized. Comando de ejemplo del autor: `vllm serve nchapman/Qwen3.5-9B-W4A16-GPTQ --max-model-len 32768 --reasoning-parser qwen3 --tool-call-parser qwen3_xml`.
- Otros motores (llama.cpp, Ollama, TGI): no disponibles para este formato `compressed-tensors` en la informacion proporcionada.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nchapman/Qwen3.5-9B-W4A16-GPTQ | 9,41 B | 262K (base) | compressed-tensors W4A16 (GPTQ) | Apache 2.0 | Calibracion en 384 conversaciones de codigo agentico; MTP y vision en BF16 |
| Qwen/Qwen3.5-9B (base BF16) | 9,41 B | 262K | safetensors BF16 | Apache 2.0 | Referencia de calidad; requiere mas VRAM |
| RedHatAI/Qwen3.5-9B-quantized.w4a16 | no disponible | 262K (base) | W4A16 | no disponible | Evaluado en GSM8k-Platinum, MMLU-Pro, IFEval, Math 500, AIME 2025 y GPQA Diamond |
| Variantes AWQ y AutoRound del mismo modelo | 9,41 B | 262K (base) | AWQ / AutoRound | Apache 2.0 | Segun el A/B del autor, GPTQ rinde mejor en esta arquitectura hibrida |

No se dispone de comparativas cuantitativas publicadas frente a modelos de otros fabricantes de tamano equivalente en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible: incremento de perplejidad del 1,08 % y KL media de 0,0616 frente al modelo base. Aunque el autor la califica de practicamente sin perdida en tareas de codigo, la degradacion puede ser mayor en otras tareas no representadas en el conjunto de calibracion.
- El conjunto de calibracion es reducido (384 conversaciones, 4096 tokens) y esta sesgado hacia codigo agentico y uso de herramientas en ingles y otros idiomas, lo que puede afectar al rendimiento en dominios alejados de ese perfil.
- Riesgo de alucinacion inherente al modelo base; la cuantizacion no lo corrige y puede amplificarlo ligeramente en tareas generativas abiertas.
- No hay listado oficial de idiomas soportados ni evaluaciones multilingues publicadas para este checkpoint.
- El modelo usa una plantilla de chat no oficial (froggeric/Qwen-Fixed-Chat-Templates v22.5). Cambiar de plantilla o de parser puede alterar el comportamiento de tool calling y el modo thinking.
- Requiere kernels INT4 especificos y GPUs Ampere o posteriores; no se ha verificado su funcionamiento en hardware anterior ni en GPUs consumer de menos de 24 GB.
- La licencia Apache 2.0 permite uso comercial, pero hereda cualquier restriccion o condicion de uso del modelo base Qwen3.5-9B, que conviene revisar por separado.
- Sin resultados publicados de latencia, throughput ni consumo energetico, no es posible estimar costes de produccion a partir de la informacion disponible.
- No se documentan sesgos especificos, pero al ser una cuantizacion de un modelo entrenado con datos web a gran escala, hereda los sesgos del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Documentacion de llm-compressor: https://docs.vllm.ai/projects/llm-compressor/en/latest/
- Plantillas de chat corregidas: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Receta de vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Ficha de Qwen3.5-9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Fuente en GitHub de Jetson AI Lab: https://github.com/NVIDIA-AI-IOT/jetson-ai-lab/blob/main/src/content/models/qwen3-5-9b.md
- Cuantizacion alternativa de RedHatAI: https://huggingface.co/RedHatAI/Qwen3.5-9B-quantized.w4a16
