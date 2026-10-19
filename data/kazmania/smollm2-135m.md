# Kazmania/SmolLM2-135M

## Resumen

SmolLM2-135M es un modelo de lenguaje compacto de la familia SmolLM2, desarrollada por Hugging Face (equipo SmolLM, autores del paper «SmolLM2: When Smol Goes Big — Data-Centric Training of a Small Language Model»). Se trata de un transformer decoder denso de 134.515.008 parámetros, entrenado sobre 2 billones de tokens con un enfoque marcadamente centrado en los datos: FineWeb-Edu, DCLM, The Stack y conjuntos filtrados propios. Su objetivo es ofrecer generación de texto y capacidades básicas de razonamiento y conocimiento en un tamaño que quepa en dispositivos de consumo, incluso en CPU.

La ficha que nos ocupa, `Kazmania/SmolLM2-135M`, es una resincronización de terceros del checkpoint base original (`HuggingFaceTB/SmolLM2-135M`), publicada con licencia Apache 2.0 y pesos en safetensors (0,3 GB). No incorpora ajuste por instrucciones: es el modelo preentrenado, por lo que su comportamiento natural es la continuación de texto, no el seguimiento de instrucciones. Conviene tenerlo en cuenta: las capacidades conversacionales descritas en la model card corresponden a la variante Instruct, que aquí no se distribuye.

Su relevancia actual es doble. Por un lado, sirve como referencia de eficiencia: 135M parámetros con resultados en MMLU (cloze) de 31,5 y HellaSwag de 42,1, superando ligeramente a SmolLM-135M. Por otro, es una base barata para fine-tuning con LoRA/QLoRA en una única GPU de consumo y para prototipado de pipelines. El repositorio de Kazmania, sin embargo, presenta 0 descargas y 0 «likes», y su fecha de creación declarada (2026-10-19) es anómala, por lo que para producción se recomienda acudir al repositorio oficial de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (denso) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (el modelo aparece como «SmolLM2-135M-8k» en la tabla de evaluacion del autor); no se declara de forma explicita en la informacion disponible |
| Tipos de cuantizacion | no disponible en este repositorio: solo se publican pesos en safetensors; no se incluyen variantes GGUF, int8 ni int4 |
| Idiomas soportados | ingles (tag `en` y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder estandar, sin mezcla de expertos ni componentes de estado (SSM). El preentrenamiento se realizo en precision bfloat16 sobre 2 billones de tokens, empleando 64 GPU H100 y el framework de entrenamiento nanotron de Hugging Face. La composicion del corpus combina FineWeb-Edu (contenido web educativo filtrado), DCLM, The Stack (codigo) y conjuntos de datos filtrados adicionales que el equipo anuncio que publicaria. No se documenta en la informacion disponible el desglose porcentual por fuente ni el tamano exacto del vocabulario.

El modelo que nos ocupa es el checkpoint base, es decir, el resultado directo del preentrenamiento, sin SFT ni DPO. La model card documenta que la variante Instruct de la familia se construyo con aprendizaje supervisado (SFT) sobre `smol-smoltalk` y datasets publicos, seguido de DPO con UltraFeedback, y que el soporte de function calling se incorporo mediante datasets de Argilla como Synth-APIGen-v0.1 (unicamente en el modelo de 1.7B). El codigo de ajuste esta disponible en el repositorio `huggingface/alignment-handbook`, recetas `smollm2`.

## Capacidades

- Generacion de texto por continuacion de prompt: es la funcion nativa del checkpoint base.
- Conocimiento factual basico y razonamiento de sentido comun de nivel bajo (MMLU cloze 31,5; CommonsenseQA 33,9; ARC 43,9), suficiente para tareas auxiliares pero no para uso como fuente de informacion.
- Capacidad limitada de modelado de codigo, derivada de la inclusion de The Stack en el preentrenamiento; no se aportan metricas de HumanEval ni similares.
- Razonamiento matematico practicamente nulo: GSM8K (5-shot) 1,4.
- No soporta tool calling ni function calling en esta variante (esa capacidad se atribuye al modelo Instruct de 1.7B).
- No soporta agentes, multi-step reasoning guiado ni modos especiales (thinking mode), vision o audio.
- Capacidades multilingues muy limitadas: el entrenamiento y la evaluacion se centran en ingles.
- No es un modelo alineado: no sigue instrucciones ni mantiene formato conversacional sin un ajuste posterior.

## Casos de uso

- Fine-tuning de dominio con LoRA/QLoRA: sus 135M parametros permiten adaptar el modelo a clasificacion de textos, etiquetado o generacion de plantillas en una unica GPU de consumo (o incluso en CPU con paciencia), partiendo de un checkpoint base ya preentrenado sobre 2T tokens.
- Pruebas de humo y CI de pipelines de inferencia: por su tamano (0,3 GB de pesos) es util como modelo de sustitucion en tests automatizados de tokenizacion, servidores de inferencia y validacion de contratos de API, sin coste de GPU significativo.
- Generacion de texto offline en dispositivos edge: el peso en bfloat16 ronda los 270 MB y en int8 los 135 MB, lo que permite ejecutarlo en Raspberry Pi, moviles de gama alta o portatiles sin GPU para autocompletado y generacion de textos cortos.
- Preprocesado y anotacion masiva de corpus: al ser muy barato por tokens, puede emplearse para pseudo-etiquetado, expansion de consultas o filtrado semantico preliminar en lotes grandes, con revision humana posterior.
- Baseline academico y reproduccion de experimentos: sirve como referencia de 「modelo pequeno」 en comparativas de escalado, estudios de destilacion o investigacion sobre sesgos, gracias a licencia Apache 2.0 y pesos abiertos.
- Docencia y aprendizaje practico: es un caso de estudio adecuado para explicar el ciclo completo preentrenamiento, SFT y DPO, asi como para experimentar con cuantizacion y despliegue local sin infraestructura dedicada.
- Generacion de descripciones cortas y metadatos: en tareas de resumen de una frase o etiquetado de productos, un ajuste ligero sobre esta base puede bastar si el domino es acotado y el vocabulario controlado.

## Benchmarks y rendimiento

Resultados del modelo base, extraidos de la model card (evaluacion zero-shot con lighteval salvo donde se indica):

| Metrica | SmolLM2-135M-8k | SmolLM-135M |
|---|---|---|
| HellaSwag | 42,1 | 41,2 |
| ARC (media) | 43,9 | 42,4 |
| PIQA | 68,4 | 68,4 |
| MMLU (cloze) | 31,5 | 30,2 |
| CommonsenseQA | 33,9 | 32,7 |
| TriviaQA | 4,1 | 4,3 |
| Winogrande | 51,3 | 51,3 |
| OpenBookQA | 34,6 | 34,0 |
| GSM8K (5-shot) | 1,4 | 1,0 |

Resultados de referencia de la variante Instruct de la familia (no incluida en este repositorio):

| Metrica | SmolLM2-135M-Instruct | SmolLM-135M-Instruct |
|---|---|---|
| IFEval (media prompt/inst) | 29,9 | 17,2 |
| MT-Bench | 1,98 | 1,68 |
| HellaSwag | 40,9 | 38,9 |
| ARC (media) | 37,3 | 33,9 |
| PIQA | 66,3 | 64,0 |
| MMLU (cloze) | 29,3 | 28,3 |
| BBH (3-shot) | 28,2 | 25,2 |
| GSM8K (5-shot) | 1,4 | 1,4 |

No se han publicado en la informacion disponible mediciones de latencia ni throughput para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 134,5M parametros, solo pesos): ~0,27 GB en bfloat16/fp16, ~0,54 GB en fp32, ~0,13 GB en int8 y ~0,07 GB en int4. Hay que sumar la cache KV, que para 8192 tokens de contexto es pequena pero no despreciable.
- La model card indica una huella de memoria de 723,56 MB con la configuracion por defecto de `transformers`, lo que incluye overhead ademas de los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no necesita A100 ni H100 (se usaron 64 H100 solo para el preentrenamiento). Una RTX 4090, RTX 3060 o incluso una GTX 1650 lo ejecutan sobradamente.
- Cabe en GPU de consumo y en iGPU; tambien es viable en CPU pura para generacion de textos cortos.
- Opciones de despliegue: `transformers` (soporte nativo, con `device_map=\"auto\"` y `torch_dtype=bfloat16`), text-generation-inference (el repo lleva el tag correspondiente), y conversion a GGUF para llama.cpp u Ollama (esta conversion no se distribuye en este repositorio y requiere realizarla con herramientas externas), asi como vLLM para servir la arquitectura Llama a escala.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (cloze) | HellaSwag | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SmolLM2-135M (este repo, base) | 134,5M | 8192 (segun denominacion «8k») | 31,5 | 42,1 | Apache 2.0 | Hugging Face (repo de terceros) |
| SmolLM-135M (predecesor, base) | 135M | no disponible | 30,2 | 41,2 | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct | 135M | no disponible | 29,3 | 40,9 | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 360M | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B | 1,7B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

Alternativas de tamano comparable como Qwen2.5-0.5B o TinyLlama-1.1B no aparecen en la informacion proporcionada, por lo que no se dispone de datos verificados para compararlas aqui. En igualdad de condiciones, la ventaja de SmolLM2-135M frente a esos modelos es el menor numero de parametros con pesos abiertos y licencia permisiva; su desventaja es un conocimiento y unas capacidades de razonamiento claramente inferiores.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones, no respeta turnos de conversacion y puede generar continuaciones incoherentes o repetitivas si se usa como asistente sin fine-tuning.
- Riesgo alto de alucinacion: con MMLU cloze de 31,5 y TriviaQA de 4,1, la probabilidad de afirmar hechos falsos con fluidez es elevada. No debe emplearse como fuente de informacion sin verificacion.
- Razonamiento matematico casi inexistente (GSM8K 1,4): no es apto para calculo, contabilidad ni problemas aritmeticos.
- Limitacion idiomatica: el modelo esta entrenado y evaluado principalmente en ingles; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- Sesgos: la model card advierte de que el contenido generado puede reflejar sesgos presentes en los datos de entrenamiento (web filtrada de FineWeb-Edu, DCLM y The Stack).
- Repositorio de terceros: `Kazmania/SmolLM2-135M` registra 0 descargas y 0 «likes», con fecha de creacion declarada de 2026-10-19. No hay garantia de que los pesos coincidan bit a bit con el checkpoint oficial, ni auditoria de seguridad del repositorio. Para produccion, usar `HuggingFaceTB/SmolLM2-135M`.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se ofrece sin garantias; el usuario asume la responsabilidad sobre las salidas y sobre el cumplimiento normativo aplicable.
- Ausencia de soporte de tool calling y de agentes en esta variante; cualquier caso de uso que requiera function calling debe migrar a un modelo Instruct de mayor tamano.
- Longitud de contexto: aunque se le asocia una ventana de 8k, no se detalla en la informacion disponible el comportamiento en contextos largos ni la degradacion esperada.

## Enlaces

- Hugging Face (repositorio de este modelo): https://huggingface.co/Kazmania/SmolLM2-135M
- Hugging Face (variante Instruct del mismo autor de la resincronizacion): https://huggingface.co/Kazmania/SmolLM2-135M-Instruct
- Hugging Face (repositorio oficial del modelo base): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper SmolLM2 (arXiv:2502.02737): https://arxiv.org/abs/2502.02737
- Repositorio de codigo de ajuste (alignment-handbook, recetas smollm2): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Framework de entrenamiento nanotron: https://github.com/huggingface/nanotron/tree/main
- Dataset SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset de function calling Synth-APIGen-v0.1: https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Dataset UltraFeedback (DPO): https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Tutorial de despliegue local (SmolLM2-135M): https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-fast-local-llm-inference
- Tutorial de la variante Instruct: https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-instruct-run-a-capable-llm-on-any-device
- Ficha de terceros con enfoque en despliegue on-device: https://llm.co/llms/smollm2-135m
