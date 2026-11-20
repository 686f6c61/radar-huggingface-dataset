# Cmr237/Camfranglais

## Resumen

Camfranglais es un ajuste fino del modelo Mistral-Nemo-Instruct-2407 (12B parámetros) especializado en camfranglais, la jerga urbana camerunesa que mezcla francés, inglés y pidgin. Lo desarrollan Daryl B., Schadrac y William Pancha, y resuelve un problema de cobertura lingüística: los modelos generalistas apenas han visto este registro en sus datos de preentrenamiento, por lo que fallan al generar respuestas naturales en él. El modelo está pensado para conversación informal y preserva las capacidades del modelo base.

La arquitectura subyacente es la de Mistral-Nemo: un transformer decoder-only de 12.247.782.400 parámetros con atención GQA y ventana de contexto de 128.000 tokens (según las especificaciones del modelo base). El ajuste se hizo con QLoRA en dos fases (preentrenamiento continuo y SFT conversacional) sobre un corpus propio de 23.224 textos y 2.671 diálogos, con adaptadores de 114M de parámetros entrenables.

Es relevante porque demuestra un flujo completo de adaptación lingüística de bajo coste (GPU NVIDIA L4, Unsloth, QLoRA) a un registro de bajos recursos, con cuantizaciones GGUF listas para Ollama y llama.cpp. La licencia MIT y la disponibilidad de pesos en safetensors y GGUF facilitan su uso tanto en investigación como en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-Nemo), ajuste QLoRA |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens en el modelo base; el ejemplo de uso del autor emplea max_seq_length=2048 |
| Tipos de cuantizacion | GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M; carga en 4 bits vía Unsloth/Transformers |
| Idiomas soportados | fr, en (con camfranglais como registro objetivo) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Nemo-Instruct-2407, un transformer decoder-only denso de 12B parámetros. Sobre él se aplicó QLoRA con Unsloth en GPU NVIDIA L4 en bfloat16, con r=32, lora_alpha=32 y use_rslora=True, lo que da 114M de parámetros entrenables. El entrenamiento fue híbrido en dos fases: primero un preentrenamiento continuo (CPT) sobre 23.224 textos en camfranglais del corpus Cmr237/camfranglais-corpus-cpt, con packing=True y lr=1e-4, para asimilar vocabulario y giros idiomáticos; después un SFT conversacional sobre 2.671 diálogos (2.404 de entrenamiento y 267 de test) del corpus Cmr237/camfranglais-corpus-sft, con la plantilla Mistral [INST]...[/INST], cálculo de loss solo sobre las respuestas del asistente y lr=5e-5.

No se documenta en la información disponible el uso de RLHF o DPO, ni innovaciones de decodificación (decodificación especulativa, atención lineal u otras). La innovación principal es metodológica: adaptación de un modelo de 12B a un registro de bajos recursos con un presupuesto de cómputo reducido y publicación conjunta de adaptadores y cuantizaciones GGUF.

## Capacidades

- Generación de texto conversacional en camfranglais, con estilo informal y marcadores propios del registro.
- Comprensión y generación en francés e inglés, heredadas del modelo base.
- Conversación multi-turno mediante la plantilla de chat Mistral.
- Razonamiento y conocimiento general del modelo base Mistral-Nemo (no se documenta degradación específica, pero tampoco se evalúa).
- Capacidad de ejecución local en CPU/GPU mediante GGUF y Ollama.
- Soporte de system prompt para fijar el registro (por ejemplo, "Tu parles comme un camerounais").
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Chatbots de atención al cliente para el mercado camerunés: el modelo puede responder en camfranglais a usuarios jóvenes urbanos, un registro que los modelos generalistas no cubren de forma natural.
- Moderación y clasificación de contenido en redes sociales: sirve para interpretar mensajes escritos en jerga camerunesa y detectar tono o intención.
- Generación de contenido para marketing local: creación de copys, publicaciones y respuestas en camfranglais para campañas dirigidas a audiencias de Duala o Yaundé.
- Investigación lingüística y sociolingüística: permite estudiar variación léxica y sintáctica del camfranglais generando corpus sintéticos controlados.
- Asistentes conversacionales embebidos en aplicaciones móviles: las cuantizaciones Q4_K_M (~7,5 GB) y Q5_K_M (~8,7 GB) permiten despliegue en equipos con 8-16 GB de RAM mediante Ollama o llama.cpp.
- Traducción informal francés/camfranglais: útil para adaptar material educativo o administrativo a un registro accesible para población joven.
- Prototipado rápido de productos de voz o texto para el mercado camerunés, aprovechando la licencia MIT y la disponibilidad de GGUF.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de evaluación del autor sobre el conjunto de test de 267 diálogos:

| Metrica | Valor |
|---|---|
| Eval loss | 3,7362 |
| Perplejidad | 41,94 |
| Score de adherencia a camfranglais (modelo / humano) | 0,1789 / 0,1551 |
| Tasa de respuestas con marcadores de camfranglais | 81,27 % |
| Similitud coseno media (modelo / pregunta) | 0,3891 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits (QLoRA/Unsloth): en torno a 8-10 GB, según el ejemplo del autor con load_in_4bit=True.
- GGUF Q4_K_M (~7,5 GB): cabe en GPUs consumer con 8 GB de VRAM (RTX 3060 Ti, RTX 4060) y en equipos con 8-16 GB de RAM.
- GGUF Q5_K_M (~8,7 GB) y Q6_K (~10 GB): requieren 10-16 GB de VRAM o RAM; adecuados para RTX 4070, RTX 4080 o Apple Silicon con 16 GB unificados.
- GGUF Q8_0 (~13 GB): recomendable en GPUs de 16 GB o más (RTX 4090, A100 40 GB, H100) o en CPU con 16 GB de RAM.
- Despliegue: Ollama (ollama run hf.co/Cmr237/Camfranglais:Q5_K_M), llama.cpp (llama-cli -hf ...), y Unsloth/Transformers para los adaptadores LoRA.
- No se documentan cifras de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Camfranglais (este modelo) | 12,25B | 128k (base) | MIT | HF (safetensors + GGUF) | Ajuste QLoRA especializado en camfranglais |
| Mistral-Nemo-Instruct-2407 | 12B | 128k | Apache 2.0 | HF | Modelo base; no especializado en camfranglais |
| Mistral-7B-Instruct | 7B | 32k | Apache 2.0 | HF | Menor tamaño, sin cobertura de camfranglais |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community | HF | Multilingüe generalista, sin ajuste a camfranglais |

La comparación se limita a datos públicos del modelo base y alternativas generalistas; no hay benchmarks comparativos publicados entre Camfranglais y estos modelos.

## Limitaciones y advertencias

- El corpus de ajuste es reducido (23.224 textos y 2.671 diálogos), lo que puede limitar la variedad y aumentar el riesgo de sobreajuste al estilo del corpus.
- La perplejidad de 41,94 en test es alta para un modelo de 12B, lo que sugiere incertidumbre considerable en la generación.
- El score de adherencia a camfranglais (0,1789) es bajo en términos absolutos, aunque supera ligeramente la referencia humana (0,1551); no debe interpretarse como dominio completo del registro.
- Riesgo de alucinación heredado del modelo base, especialmente en temas factuales o de actualidad.
- Idiomas declarados: francés e inglés; no se garantiza calidad en otras lenguas ni en variantes regionales distintas del camfranglais.
- No se documentan evaluaciones de sesgo; el modelo puede reproducir estereotipos presentes en los datos de entrenamiento.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base Mistral-Nemo (Apache 2.0) y de los corpus de ajuste antes de desplegar en producción.
- El contexto efectivo en los ejemplos de uso se limita a 2.048 tokens (max_seq_length), muy por debajo de los 128k del modelo base; para contextos largos habría que reconfigurar y validar.
- No hay soporte documentado de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cmr237/Camfranglais
- Repositorio GitHub del proyecto: https://github.com/darylbdr/CameroonianLLM
- Dataset CPT: https://huggingface.co/datasets/Cmr237/camfranglais-corpus-cpt
- Dataset SFT: https://huggingface.co/datasets/Cmr237/camfranglais-corpus-sft
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Unsloth: https://github.com/unslothai/unsloth
- Perfil de Daryl B.: https://github.com/darylbdr
- Perfil de Schadrac: https://github.com/Schadrac237
- Perfil de William Pancha: https://github.com/Williampancha
