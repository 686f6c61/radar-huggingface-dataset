# moltherm1/olmo-mirror-olmoe-1b-7b-0125-instruct

## Resumen

OLMoE-1B-7B-0125-Instruct es la variante post-entrenada del modelo OLMoE de enero de 2025, desarrollado por el Allen Institute for AI (Ai2). Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) que activa aproximadamente 1.300 millones de parametros de un total de 6.900 millones, lo que permite obtener una calidad de inferencia propia de un modelo de 7B con un coste computacional cercano al de un modelo de 1B. El modelo que nos ocupa es un espejo (mirror) publicado por el usuario moltherm1 sobre el checkpoint oficial `allenai/OLMoE-1B-7B-0125-Instruct`.

El modelo parte del base `OLMoE-1B-7B-0125`, pasa por un SFT sobre una variante de Tülu 3, un ajuste DPO y finalmente un entrenamiento RLVR (Reinforcement Learning with Verifiable Rewards) usando el dataset `allenai/RLVR-GSM`. Esta cadena de post-entrenamiento esta disenada para mejorar tareas de razonamiento, matematicas (MATH, GSM8K) y seguimiento de instrucciones (IFEval), manteniendo la filosofia de apertura total de la familia OLMo: pesos, codigo, logs y datos de entrenamiento publicados.

Es relevante ahora porque ofrece, bajo licencia Apache 2.0, un modelo de razonamiento con coste de inferencia reducido (solo ~1.3B parametros activos por token) y un contexto de 4.096 tokens, lo que lo hace atractivo para despliegues en hardware modesto o para investigacion reproducible sobre arquitecturas MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (64 expertos, top-8 routing) |
| Parametros totales | 6.900 millones (aprox.) |
| Parametros activos | 1.300 millones (aprox.) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16; compatibles con cuantizacion via transformers/bitsandbytes) |
| Idiomas soportados | Ingles (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10.0 GB) |

## Arquitectura y entrenamiento

OLMoE-1B-7B es un transformer decoder-only con capas de mezcla de expertos: cada capa MoE contiene 64 expertos y un router que selecciona los 8 expertos mas relevantes por token (top-8). Esto da un total de 6.900 millones de parametros, de los cuales solo unos 1.300 millones se activan en cada paso de inferencia. El modelo se entrena sobre el dataset Dolma, compuesto por datos publicos, sinteticos y creados por humanos, y toda la pipeline de entrenamiento (codigo, checkpoints, logs) se libera de forma abierta.

El post-entrenamiento sigue la receta de Tülu 3: primero un SFT sobre una mezcla especifica de OLMo (`allenai/tulu-3-sft-olmo-2-mixture`), despues DPO sobre `allenai/olmo-2-1124-13b-preference-mix` y finalmente RLVR con el dataset `allenai/RLVR-GSM`, orientado a reforzar el razonamiento verificable en matematicas. La plantilla de chat usa los tokens especiales `<|endoftext|>`, `<|user|>` y `<|assistant|>`, e incluye un system prompt por defecto en las demos de Ai2 ("You are OLMo 2, a helpful and harmless AI Assistant built by the Allen Institute for AI"), aunque el modelo no fue entrenado con un system prompt especifico.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento matematico y aritmetico reforzado mediante RLVR (GSM8K, MATH).
- Razonamiento de sentido comun y conocimiento general (MMLU, BigBenchHard, TruthfulQA).
- Comprension lectora y extraccion de respuestas sobre pasajes (DROP).
- Seguimiento de instrucciones (IFEval, segun la receta Tülu 3).
- Capacidad de chain-of-thought (las evaluaciones de MMLU y BigBenchHard se realizan con CoT).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Razonamiento matematico asistido: el modelo ha sido entrenado con RLVR sobre GSM y puede resolver problemas aritmeticos de varios pasos; util para tutoria automatica o generacion de explicaciones paso a paso en entornos educativos.
- Extraccion de respuestas sobre documentos: con 4.096 tokens de contexto y buenos resultados en DROP, sirve para tareas de question answering extractivo sobre contratos, informes o articulos.
- Clasificacion y resumen de texto en ingles: su ventana de contexto permite procesar correos, tickets o resenas y devolver resumenes o etiquetas en un solo paso.
- Generacion de contenido controlada: el ajuste DPO reduce respuestas no deseadas en comparacion con el SFT, lo que lo hace adecuado para asistentes conversacionales de dominio acotado.
- Investigacion sobre MoE y eficiencia: al ser totalmente abierto (pesos, codigo, logs, datos), es un banco de pruebas ideal para estudiar routing, cuantizacion y tecnicas de decodificacion especulativa.
- Despliegue en hardware de gama media: con solo ~1.3B parametros activos, se puede servir en una unica GPU consumer (por ejemplo, RTX 4090) o incluso en CPU con cuantizacion, para prototipos y demos internas.
- Evaluacion de tecnicas de post-entrenamiento: la cadena base → SFT → DPO → RLVR permite comparar el efecto de cada etapa sobre benchmarks de razonamiento y seguimiento de instrucciones.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluaciones oficiales de Ai2):

| Benchmark | OLMoE-1B-7B-0125-Instruct | OLMoE-1B-7B-0924-Instruct | OLMoE-1B-7B-0125-DPO | OLMoE-1B-7B-0125-SFT |
|---|---|---|---|---|
| Media | **45,62** | 38,44 | 45,05 | 41,76 |
| MMLU (CoT) | 55,08 | 54,57 | 54,93 | **55,26** |
| PopQA | 19,75 | 20,56 | 19,65 | 20,12 |
| TruthfulQA | **50,56** | 49,14 | 49,99 | 45,48 |
| BigBenchHard (CoT) | **38,61** | 36,78 | 37,37 | 37,31 |
| DROP | 47,87 | 34,48 | 48,38 | **48,57** |
| MATH (Flex) | **21,41** | 8,16 | 20,36 | 21,38 |

El modelo final (RLVR) mejora la media global en +7,18 puntos respecto al Instruct de septiembre de 2024 y mas que duplica el resultado en MATH (21,41 frente a 8,16). No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks de codigo.

## Requisitos de hardware

- VRAM estimada en bfloat16: ~14 GB para los 6.900 millones de parametros totales; con cuantizacion a 8 bits, ~7-8 GB; a 4 bits, ~4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 de un solo modelo.
- Cabe en GPU consumer: si, en RTX 4090, 3090, 4080 (16 GB) con cuantizacion, y en GPUs de 12 GB con cuantizacion a 4 bits.
- Opciones de despliegue: transformers (requiere version main de transformers para soporte OLMo 2), vLLM, TGI, llama.cpp/Ollama (sujeto a conversion a GGUF), y el repositorio oficial de Ai2 (`github.com/allenai/OLMo`).
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste por token es bajo gracias a los ~1.3B parametros activos, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMoE-1B-7B-0125-Instruct | 6,9B / ~1,3B (MoE) | 4.096 | Apache 2.0 | Pesos abiertos, datos y codigo |
| OLMoE-1B-7B-0924-Instruct | 6,9B / ~1,3B (MoE) | 4.096 | Apache 2.0 | Pesos abiertos |
| Mistral 7B Instruct | 7,3B denso | 32.768 | Apache 2.0 | Pesos abiertos |
| Llama 3.1 8B Instruct | 8,0B denso | 131.072 | Llama 3.1 Community | Pesos abiertos con restricciones |

Frente a modelos densos de tamano similar, OLMoE reduce el coste de inferencia por token (menos parametros activos) pero ofrece una ventana de contexto mucho menor (4.096 frente a 32K-128K) y un rendimiento en conocimiento general inferior al de Llama 3.1 8B. Su principal ventaja competitiva es la transparencia total del entrenamiento y la licencia Apache 2.0 sin restricciones de uso comercial.

## Limitaciones y advertencias

- Entrenamiento de seguridad limitado: el modelo puede generar contenido problematico si se le induce, ya que no incluye filtrado en el bucle de inferencia.
- Riesgo de alucinacion en tareas de conocimiento factual (PopQA de 19,75 sugiere conocimiento enciclopedico limitado).
- Contexto corto (4.096 tokens) comparado con modelos actuales de 32K-128K, lo que limita casos de uso con documentos largos.
- Soporte practicamente exclusivo de ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Rendimiento matematico moderado en terminos absolutos (MATH 21,41), adecuado para problemas de nivel escolar pero no para matematicas avanzadas.
- No se han publicado resultados de codigo (HumanEval) ni de tool calling, por lo que no se recomienda para pipelines de agentes sin validacion previa.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor del espejo (moltherm1) no es el desarrollador original; conviene verificar la integridad de los pesos frente al checkpoint oficial de Ai2.
- El modelo no fue entrenado con un system prompt especifico; su comportamiento con prompts de sistema puede ser inconsistente.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmoe-1b-7b-0125-instruct
- Modelo oficial: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0125
- Checkpoint DPO: https://huggingface.co/allenai/OLMoE-1B-7B-0125-DPO
- Checkpoint SFT: https://huggingface.co/allenai/OLMoE-1B-7B-0125-SFT
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset de preferencias DPO: https://huggingface.co/datasets/allenai/olmo-2-1124-13b-preference-mix
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-GSM
- Paper OLMoE: https://arxiv.org/abs/2409.02060
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Pagina del proyecto: https://allenai.org/olmo
- Repositorio principal: https://github.com/allenai/OLMo
- Codigo de evaluacion: https://github.com/allenai/olmes
- Codigo de fine-tuning: https://github.com/allenai/open-instruct
- Demo: https://playground.allenai.org/
