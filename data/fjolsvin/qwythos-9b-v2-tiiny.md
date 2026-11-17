# fjolsvin/Qwythos-9B-v2-tiiny

## Resumen

Qwythos-9B-v2-tiiny es un reempaquetado del fine-tune empero-ai/Qwythos-9B-v2, elaborado por el usuario fjolsvin para que la plataforma Tiiny Pocket acepte el modelo como derivado del modelo base Qwen/Qwen3.5-9B. Los pesos son idénticos al original; los cambios se limitan a metadatos y ficheros auxiliares (config.json, merges.txt, vocab.json y la model card), además de reetiquetar el pipeline como image-text-to-text y fijar Qwen/Qwen3.5-9B como base_model. Se trata, por tanto, de una distribución de conveniencia más que de un modelo nuevo.

El modelo subyacente, Qwythos-9B-v2, es un fine-tune de Qwen3.5-9B que hereda la pila multimodal nativa de Qwen3.5 y una ventana de contexto de hasta 1 millón de tokens mediante YaRN. Su rasgo distintivo es la postura "uncensored" orientada a investigación y red-teaming, junto con un modo de razonamiento profundo (chain-of-thought) y una corrección del comportamiento de bucle mediante FTPO (Final-Token Preference Optimization), que reduce la tasa de repetición en decodificación greedy del 6,7 % al 0 %.

La relevancia de esta variante es operativa: permite importar el modelo en Tiiny Pocket sin alterar los pesos, manteniendo las capacidades del original (razonamiento, código, matemáticas y contexto largo) y restaurando la cabeza MTP para decodificación especulativa. Con 9.653.104.368 parámetros y licencia Apache 2.0, es un candidato para despliegues de investigación que requieran contexto extenso y baja tasa de refusals.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (pila multimodal nativa), con cabeza MTP (multi-token prediction) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.000.000 tokens (via YaRN) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen/Qwen3.5-9B, un transformer decoder-only de 9,65 mil millones de parámetros con pila multimodal nativa (pipeline image-text-to-text) y soporte de contexto largo mediante YaRN hasta 1 millón de tokens. Incluye una cabeza MTP (multi-token prediction) que en esta versión v2 se ha restaurado respecto a exportaciones previas, de modo que config y pesos son coherentes y se habilita la decodificación especulativa.

El entrenamiento del fine-tune original (empero-ai/Qwythos-9B-v2) parte de empero-ai/Qwythos-9B-Claude-Mythos-5-1M, a su vez derivado de Qwen3.5-9B. La innovación técnica declarada es FTPO (Final-Token Preference Optimization): se identifica el token exacto que inicia un bucle de repetición y se entrena al modelo para preferir alternativas coherentes en esa posición, sin alterar el resto de la distribución. Según la model card, esto reduce la tasa de bucle en greedy del 6,7 % al 0,0 % y en temperatura 0,6 del 1,3 % al 0,7 %, manteniendo el rendimiento en benchmarks. No se detallan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO más allá de FTPO.

## Capacidades

- Generación de texto y razonamiento profundo con chain-of-thought explícito (modo thinking).
- Razonamiento matemático: resolución de problemas aritméticos y de lógica paso a paso.
- Generación de código: funciones, explicación de enfoques y algoritmos (p. ej. subcadena palindrómica más larga).
- Capacidades multimodales heredadas de la pila Qwen3.5 (pipeline image-text-to-text), aunque la model card no detalla tareas de visión concretas.
- Contexto largo de hasta 1 millón de tokens mediante YaRN.
- Postura "uncensored" declarada para investigación, ciberseguridad, red-teaming, biología, química, farmacología y trabajo clínico.
- Cabeza MTP restaurada, compatible con decodificación especulativa.
- Identidad controlada: solo se presenta cuando se le pregunta explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita, aunque el modo CoT y el contexto largo lo permiten.
- Capacidades multilingües: limitadas a inglés según el campo `language`.

## Casos de uso

- Investigación en seguridad y red-teaming: el modelo declara una postura uncensored y una tasa de refusal del 0,0 %, lo que permite explorar prompts adversarios y analizar respuestas sin bloqueos, en entornos controlados.
- Razonamiento matemático asistido: con GSM8K al 93,6 % en modo CoT, es adecuado para tutores o asistentes que resuelvan problemas paso a paso y expliquen el razonamiento.
- Generación de código en pipelines de investigación: HumanEval pass@1 del 77,4 % permite integrarlo en herramientas de autocompletado o generación de funciones con explicación del enfoque.
- Análisis de documentos extensos: la ventana de 1 millón de tokens (YaRN) habilita resumir o consultar corpus largos, contratos o informes sin fragmentación.
- Despliegue con decodificación especulativa: la cabeza MTP restaurada permite configurar speculative decoding para reducir latencia en serving.
- Evaluación comparativa de fine-tunes: al ser un reempaquetado con pesos idénticos, sirve para reproducir resultados de Qwythos-9B-v2 en Tiiny Pocket sin divergencias de pesos.
- Prototipado de asistentes conversacionales multi-turno en inglés: la corrección de bucles en greedy y baja temperatura reduce la degeneración en diálogos largos.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo original (arnés interno, CoT generativo, greedy/pass@1 salvo indicación; MMLU/ARC/GSM8K n=500, GPQA-diamond n=198, HumanEval n=164):

| Benchmark | Qwythos-9B-v2 |
|---|---|
| MMLU (CoT / 5-shot loglik) | 83,8 % / 69,6 % |
| ARC-Challenge | 96,4 % |
| GPQA-diamond | 49,0 % |
| GSM8K | 93,6 % |
| HumanEval (pass@1) | 77,4 % |
| Tasa de bucle (greedy) | 0,0 % |
| Tasa de refusal | 0,0 % |

Comparativa con el modelo base y la versión anterior:

| Benchmark | Qwen3.5-9B (base) | Qwythos-9B | Qwythos-9B-v2 |
|---|---|---|---|
| MMLU (CoT) | 80,6 | 83,8 | 83,8 |
| ARC-Challenge | 95,6 | 95,0 | 96,4 |
| GPQA-diamond | 32,8 | 52,0 | 49,0 |
| GSM8K | 80,6 | 92,2 | 93,6 |
| HumanEval | 81,7 | 79,9 | 77,4 |
| Bucle (greedy) | 2,7 | 6,7 | 0,0 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 19,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 24 GB o más para contexto moderado.
- Contexto de 1 millón de tokens: la KV cache crece de forma lineal con la longitud; con contexto completo los requisitos superan ampliamente las GPUs de consumo y exigen GPUs de centro de datos con memoria agregada.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples RTX 4090/A6000 para contextos largos; para contextos cortos, una RTX 4090 de 24 GB puede alojar los pesos en bf16 con margen limitado.
- Cabe en GPU de consumo: sí en RTX 4090 (24 GB) para pesos en bf16 con contexto corto; en cuantización de 8 bits o 4 bits cabría en GPUs de 16 GB, aunque no se detallan los tipos de cuantización disponibles.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible, aunque el formato safetensors y la compatibilidad con endpoints sugerida por los tags permiten su uso con stacks habituales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwythos-9B-v2-tiiny | 9,65 B | 1 M (YaRN) | Apache 2.0 | Reempaquetado de Qwythos-9B-v2; uncensored; MTP restaurada |
| Qwen/Qwen3.5-9B | 9 B (aprox.) | no disponible | no disponible | Modelo base; MMLU CoT 80,6; GPQA 32,8; sin postura uncensored |
| Qwythos-9B (v1) | 9 B (aprox.) | 1 M (YaRN) | no disponible | Versión previa; tasa de bucle 6,7 % en greedy; sin MTP en pesos |
| empero-ai/Qwythos-9B-v2 | 9 B (aprox.) | 1 M (YaRN) | no disponible | Original del que deriva este reempaquetado; pesos idénticos |

## Limitaciones y advertencias

- Modelo "uncensored": la ausencia de refusals (0,0 %) implica riesgo de generar contenido dañino, ilegal o peligroso; requiere salvaguardas externas en producción.
- Riesgo de alucinación: no se han publicado métricas de factualidad; el modo CoT no garantiza veracidad.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse.
- Contexto largo: aunque soporta 1 M de tokens vía YaRN, la calidad en longitudes extremas no está documentada y el coste de memoria es elevado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B y los fine-tunes intermedios pueden tener condiciones adicionales no reflejadas en esta ficha.
- Los benchmarks provienen de un arnés interno del autor y de un juez LLM independiente; no son resultados de terceros ni reproducidos de forma externa.
- La model card está truncada en la información disponible; faltan detalles de entrenamiento, cuantizaciones y tool calling.
- El pipeline se ha reetiquetado a image-text-to-text, pero no se documentan tareas de visión concretas ni su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/fjolsvin/Qwythos-9B-v2-tiiny
- Modelo original: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Fine-tune intermedio: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Repositorio, paper o demo adicionales: no disponibles en la información proporcionada.
