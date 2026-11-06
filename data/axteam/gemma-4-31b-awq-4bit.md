# axteam/gemma-4-31B-AWQ-4bit

## Resumen

`axteam/gemma-4-31B-AWQ-4bit` es una cuantizacion de 4 bits del modelo denso `google/gemma-4-31B` (commit `5bbc2fb`), producida por el colectivo axteam mediante la tecnica AWQ (activation-aware weight quantization) en esquema W4A16. El objetivo es servir el modelo multimodal de Google en vLLM con una huella de memoria reducida a aproximadamente 20,9 GB en disco, manteniendo una fidelidad cercana al original en BF16. Es, por tanto, un artefacto de despliegue, no un modelo entrenado desde cero: no hay reentrenamiento ni ajuste fino, solo cuantizacion post-entrenamiento (PTQ).

El modelo base es un transformer denso de la familia Gemma 4 con capacidad image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto. Segun los metadatos de safetensors, el checkpoint contiene 6.676.812.132 parametros, un dato que no concuerda con la denominacion "31B" del nombre del modelo ni con el tamano del repo (20,9 GB); esta discrepancia debe tenerse en cuenta antes de planificar el despliegue. La model card no aclara el numero real de parametros totales del modelo base.

La relevancia actual del checkpoint radica en que permite ejecutar un modelo multimodal de gran tamano en GPUs con menos VRAM de la necesaria para BF16, con una degradacion medida de aproximadamente el 0,5 % en la media de benchmarks respecto al original. La licencia declarada es Apache-2.0, con enlace a la licencia especifica de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (no MoE) |
| Parametros totales | 6.676.812.132 segun safetensors (el nombre indica "31B"; discrepancia no aclarada en la model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 W4A16, grupo de tamano 32, escalas BF16 + zero-point INT4, formato compressed-tensors `pack-quantized`; torre de vision, proyeccion de vision, embeddings y normas en BF16 |
| Idiomas soportados | no disponible (el conjunto de calibracion es mayoritariamente coreano) |
| Licencia | Apache-2.0 (enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors con compressed-tensors; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4, con torre de vision y proyeccion multimodal para la tarea image-text-to-text. El checkpoint aqui publicado no introduce cambios arquitectonicos: conserva la configuracion del original (`config.json` es el del modelo base mas un bloque `quantization_config`) y mantiene el tokenizer, `processor_config` y `generation_config` byte a byte identicos. Es un modelo base (pre-entrenado), sin plantilla de chat, por lo que debe usarse con prompts de completado de texto, no como asistente conversacional.

La cuantizacion es PTQ AWQ con 256 muestras de calibracion, mayoritariamente en coreano, de las cuales 32 son respuestas en modo thinking autogeneradas. No hay gradiente ni reentrenamiento. El autor distingue explicitamente entre RTN (linea base interna no publicada), AWQ (usado aqui) y QAT (checkpoints separados de Google, no incluidos en este repo), y situa la fidelidad en el orden QAT >= AWQ > RTN. Se preservan en BF16 la torre de vision, la proyeccion de vision, los embeddings (atados con lm_head) y todas las normas, aproximadamente el 6 % de los parametros.

## Capacidades

- Generacion de texto y completado de texto en modo base, sin plantilla de chat.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre contenido visual y tareas derivadas.
- Razonamiento y matematicas de varios pasos, segun los resultados en GSM8K (84,15 en 5-shot estricto).
- Conocimiento general y multilingue parcial, con resultados medidos en MMLU, ARC-Challenge, Winogrande, KMMLU (coreano) y HAE-RAE (coreano).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso orquestado.
- No se documenta modo thinking nativo en este checkpoint base; el conjunto de calibracion incluye respuestas de thinking generadas por el autor, pero no se indica que el modelo lo exponga como capacidad.
- No se documentan capacidades de audio.

## Casos de uso

- Descripcion automatica de imagenes en pipelines de catalogacion: el modelo acepta pares imagen-texto y puede generar descripciones o etiquetas; su naturaleza de modelo base exige prompts de completado bien disenados en lugar de instrucciones conversacionales.
- Respuesta a preguntas sobre documentos escaneados o capturas: la torre de vision se mantiene en BF16, lo que preserva la calidad del codificador visual mientras el resto del modelo se sirve en INT4.
- Generacion de codigo y texto tecnico en modo completado: util para autocompletado en editores o generacion de fragmentos a partir de un contexto, sin depender de una plantilla de chat.
- Razonamiento matematico por lotes: con 84,15 en GSM8K 5-shot estricto, es adecuado para resolver problemas aritmeticos en procesos offline de evaluacion o generacion de datos sinteticos.
- Evaluacion comparativa de tecnicas de cuantizacion: el repo publica resultados medidos frente a BF16, FP8-dynamic, AWQ-8bit, NVFP4A16 y NVFP4 con el mismo harness, lo que lo convierte en una referencia util para estudiar el impacto de la cuantizacion en modelos multimodales.
- Servicio de inferencia en vLLM con tensor parallelism: cuando los 20,9 GB de pesos no caben en una sola GPU, se puede repartir con `--tensor-parallel-size N` en varias GPUs Turing (sm75) o superiores.
- Procesamiento de texto en coreano e ingles: los benchmarks KMMLU y HAE-RAE muestran un rendimiento solido en coreano, aunque el conjunto de calibracion tambien esta sesgado hacia ese idioma.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness sobre vLLM, greedy, prompts de completado sin plantilla de chat. Los porcentajes entre parentesis indican la recuperacion respecto a BF16.

| Benchmark | BF16 (original) | FP8-dynamic | AWQ-8bit | NVFP4A16 | NVFP4 | AWQ-4bit (este repo) |
|---|---|---|---|---|---|---|
| MMLU (5-shot) | 84,59 | 84,71 (100,1 %) | 84,52 (99,9 %) | 83,70 (98,9 %) | 83,09 (98,2 %) | 84,02 (99,3 %) |
| GSM8K (5-shot, strict) | 84,46 | 83,09 (98,4 %) | 84,23 (99,7 %) | 83,78 (99,2 %) | 82,03 (97,1 %) | 84,15 (99,6 %) |
| ARC-Challenge (0-shot) | 69,62 | 68,94 (99,0 %) | 69,11 (99,3 %) | 68,43 (98,3 %) | 67,49 (96,9 %) | 69,11 (99,3 %) |
| Winogrande (5-shot) | 83,90 | 84,29 (100,5 %) | 84,29 (100,5 %) | 84,45 (100,7 %) | 82,64 (98,5 %) | 83,58 (99,6 %) |
| KMMLU (5-shot, direct) | 67,35 | 67,22 (99,8 %) | 67,39 (100,1 %) | 66,41 (98,6 %) | 65,22 (96,8 %) | 67,33 (100,0 %) |
| HAE-RAE (0-shot) | 82,31 | 82,03 (99,7 %) | 82,03 (99,7 %) | 81,94 (99,6 %) | 80,29 (97,6 %) | 81,85 (99,4 %) |
| **Media** | **78,71** | **78,38 (99,6 %)** | **78,60 (99,9 %)** | **78,12 (99,3 %)** | **76,79 (97,6 %)** | **78,34 (99,5 %)** |

Perplejidad medida frente a BF16 sobre WikiText-2 (ingles) y una muestra de Wikipedia en coreano, en fragmentos de 2.048 tokens: los builds de 8 bits (AWQ INT8, FP8) quedan dentro del 0,5 % de BF16; los de 4 bits (AWQ INT4, NVFP4) entre un 2,0 % y un 6,6 % por encima. La concordancia top-1 de siguiente token no se midio para los modelos base.

## Requisitos de hardware

- VRAM estimada: 20,9 GB solo para pesos; hay que anadir la cache KV (crece con la longitud de contexto y el numero de peticiones concurrentes) y varios GB para activaciones y CUDA graphs.
- GPUs recomendadas: NVIDIA Turing (sm75) o superior. V100 (sm70) no esta soportada. Para repartir los pesos entre varias GPUs, usar `--tensor-parallel-size N` en vLLM.
- Cabe en GPU de consumo con al menos 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090), siempre que se reserve margen para cache KV y activaciones; en configuraciones de contexto largo puede requerir tensor parallelism.
- Despliegue: vLLM, arquitectura disponible desde vLLM >= 0.19.0. La evaluacion se hizo con vLLM 0.19.0; no se ha probado con vLLM 0.32.0 en este build. vLLM 0.32 requiere Python 3.11-3.14, torch 2.13 (build CUDA 13.0, con driver NVIDIA compatible), transformers >= 5.16.1,< 5.20 y compressed-tensors 0.17.0 (fijado por vLLM; no actualizar por separado).
- Uso sin vLLM: transformers >= 5.5.0 (recomendado 5.5.2+), no probado para el modelo de 31B. No requiere `trust_remote_code`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-31B-AWQ-4bit (este repo) | 6.676.812.132 segun safetensors (nombre: 31B) | no disponible | AWQ INT4 W4A16 | Apache-2.0 | Hugging Face, vLLM |
| google/gemma-4-31B (BF16) | no disponible | no disponible | BF16 | Apache-2.0 / Gemma 4 | Hugging Face, referencia de calidad |
| Variantes FP8-dynamic, AWQ-8bit, NVFP4A16 y NVFP4 del mismo base | mismas que el base | no disponible | 8 bits y 4 bits | Apache-2.0 | Referenciadas en los benchmarks del autor |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a las variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: usarlo con formato conversacional produce resultados pobres; hay que emplear prompts de completado.
- La cuantizacion AWQ INT4 introduce un aumento de perplejidad de entre el 2,0 % y el 6,6 % respecto a BF16, y una perdida media de aproximadamente el 0,5 % en los benchmarks medidos.
- El conjunto de calibracion es mayoritariamente coreano, lo que puede sesgar el comportamiento en otros idiomas; no se documentan los idiomas soportados.
- Discrepancia entre el nombre "31B", el recuento de parametros de safetensors (6.676.812.132) y el tamano del repo (20,9 GB): verificar el modelo base antes de dimensionar el hardware.
- La licencia se declara como Apache-2.0 con enlace a la licencia de Gemma 4; conviene revisar los terminos especificos de Gemma 4 para uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- No se documentan sesgos conocidos mas alla del sesgo de calibracion.
- No se ha probado con vLLM 0.32.0 en este build; usar la version de vLLM y compressed-tensors fijadas por el autor para reproducir los resultados.
- No hay datos de latencia ni throughput publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/gemma-4-31B-AWQ-4bit
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
