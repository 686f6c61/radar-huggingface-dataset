# rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16

## Resumen

rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16 es un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Lo publica el usuario rghosh8 en HuggingFace y pertenece a una familia de experimentos aparentemente centrados en razonamiento matematico sobre el conjunto de datos GSM8K, con distintas semillas y tamanos de grupo de muestreo (el sufijo "G-16" sugiere un group size de 16 en GRPO, y "seed-1234" la semilla de entrenamiento).

El modelo resuelve, en principio, el problema de dotar a un modelo pequeno de 1.500 millones de parametros de capacidades de razonamiento paso a paso en aritmetica y problemas verbales de matematicas, usando aprendizaje por refuerzo en lugar de ajuste supervisado clasico. Es relevante porque GRPO es la tecnica introducida en DeepSeekMath y popularizada por la familia DeepSeek-R1, y aplicarla a un modelo de 1,5B permite estudiar hasta que punto el razonamiento multi-paso se puede transferir a modelos que caben en una GPU de consumo.

El repositorio pesa 0,7 GB y contiene unicamente los pesos del adaptador en formato safetensors con la libreria PEFT, no un modelo completo. En el momento de la consulta no tiene descargas ni likes, no declara licencia propia y no publica resultados de evaluacion, por lo que su utilidad practica debe validarse de forma independiente antes de llevarlo a produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-1.5B-Instruct); el adaptador es LoRA |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables (no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | no disponible en la model card; al derivar de Qwen2.5 admite las cuantizaciones habituales (FP16, BF16, INT8, GPTQ/AWQ, GGUF Q8/Q4) tras fusionar el adaptador con el modelo base |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 declara soporte de multiples idiomas, incluido el espanol |
| Licencia | no disponible (la model card incluye el campo "licence: license" como marcador de posicion). El modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de publicacion | PEFT |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 0,7 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-05 |
| Fecha de actualizacion | 2026-10-05 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parametros con atencion de consultas agrupadas (GQA, 12 cabezas de atencion y 2 cabezas KV), normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE, ademas de QKV bias. El ajuste se realiza mediante LoRA, es decir, se congelan los pesos originales y se entrenan matrices de bajo rango inyectadas en las capas, lo que explica que el repositorio ocupe solo 0,7 GB frente a los aproximadamente 3 GB del modelo base en FP16.

El metodo de entrenamiento es GRPO, introducido en el articulo "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models" (arXiv:2402.03300). GRPO es una variante de aprendizaje por refuerzo sin modelo critico que estima la ventaja de cada respuesta normalizando las recompensas dentro de un grupo de respuestas generadas para la misma pregunta; el sufijo "G-16" del nombre apunta a un grupo de 16 muestras por prompt. El nombre del modelo sugiere que el conjunto de entrenamiento es GSM8K y que el punto de partida conceptual es la destilacion de razonamiento de DeepSeek-R1 sobre Qwen, aunque la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa concreta ni si hubo una fase previa de SFT. La model card tampoco especifica hiperparametros de LoRA (rango, alfa, capas objetivo) ni la duracion del entrenamiento.

Las versiones de las herramientas declaradas son PEFT 0.17.1, TRL 0.23.0, Transformers 4.56.2, PyTorch 2.8.0, Datasets 4.1.1 y Tokenizers 0.22.1. El autor cita igualmente el repositorio TRL de HuggingFace.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el modelo base esta ajustado para instrucciones con formato de chat (roles user/assistant).
- Razonamiento matematico paso a paso: el entrenamiento con GRPO sobre GSM8K esta orientado a problemas verbales de aritmetica de varios pasos.
- Razonamiento encadenado (chain-of-thought): el enfoque de destilacion de DeepSeek-R1 sobre el que se inspira el nombre del modelo prioriza respuestas con trazas de razonamiento explicitas.
- Formato de chat multi-turno: heredado del tokenizer y la plantilla de Qwen2.5-Instruct.
- Soporte multilingue: no confirmado para el adaptador; el modelo base Qwen2.5 cubre decenas de idiomas, pero el ajuste con GSM8K (mayoritariamente en ingles) puede degradar el rendimiento en otros idiomas.
- Tool calling / function calling: no disponible en la model card; no se declara soporte explicito.
- Capacidades de agente y razonamiento multi-paso orquestado: no disponible; no se declara soporte de agentes.
- Modo thinking explicito, vision o audio: no soportado (el modelo base es exclusivamente de texto).
- Capacidad de generacion de codigo: no evaluada ni declarada en la informacion disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el modelo sirve como punto de comparacion reproducible dentro de una familia de experimentos con la misma receta GRPO y distintas semillas, util para estudiar la varianza del entrenamiento con RL en modelos pequenos.
- Fine-tuning educativo y prototipado: al ser un adaptador LoRA de menos de 1 GB, se puede cargar junto al modelo base en una GPU de consumo para experimentar con GRPO/TRL sin grandes infraestructuras.
- Generacion de cadenas de razonamiento sinteticas: se pueden usar sus respuestas como datos de destilacion para entrenar o evaluar otros modelos pequenos en tareas de aritmetica.
- Tutoria matematica de bajo coste: con 1,5B de parametros puede desplegarse en local para resolver problemas de aritmetica de nivel escolar, siempre que se valide su tasa de acierto real.
- Evaluacion comparativa de tecnicas de RL: util para contrastar GRPO frente a DPO o SFT en un presupuesto de computo muy reducido, midiendo la transferencia de razonamiento.
- Experimentos de cuantizacion y despliegue: una vez fusionado con el modelo base, sirve para medir el impacto de GGUF Q4/Q8 o de INT8 en la calidad del razonamiento matematico.
- Base para fine-tuning posterior: al ser un adaptador PEFT, se puede seguir entrenando o combinar con otros adaptadores (por ejemplo, de codigo o de idioma) mediante tecnicas de merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud sobre GSM8K ni de ningun otro conjunto de evaluacion, a pesar de que el nombre del modelo hace referencia explicita a GSM8K. Tampoco se aportan comparaciones con el modelo base ni con las otras ejecuciones de la misma familia (por ejemplo, la variante con G-4 de la busqueda web).

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones, no confirmadas por el autor): aproximadamente 3-4 GB en FP16/BF16 para el modelo base de 1,5B mas el adaptador; en torno a 1,5-2 GB en INT8; y del orden de 1-1,2 GB en cuantizacion GGUF Q4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 resulta suficiente. Una RTX 3060 de 12 GB, una RTX 4060 Ti, una RTX 4090 o una L4 son mas que suficientes; para cargas por lotes se pueden usar A100 o H100 sin aprovechar su capacidad.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna (GTX 1660 6 GB en cuantizacion Q4, RTX 3050 8 GB, etc.). Tambien puede ejecutarse en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sin fusionar; vLLM con soporte de adaptadores LoRA para servicio concurrente; fusion del adaptador en el modelo base y posterior conversion a GGUF para llama.cpp, Ollama o LM Studio; TGI si se fusiona previamente.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor. Como referencia orientativa para un modelo de 1,5B en FP16 sobre una GPU moderna de consumo, la generacion suele situarse en decenas de tokens por segundo.
- Almacenamiento: el repositorio ocupa 0,7 GB; sumado al modelo base en FP16 (unos 3 GB) el despliegue completo ronda los 4 GB en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16 | 1,5B (adaptador LoRA sobre Qwen2.5-1.5B-Instruct) | no disponible en la model card; 32.768 en el modelo base | GRPO sobre GSM8K (segun el nombre y la model card) | no disponible | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (hasta 131.072 con YaRN) | SFT + preferencias sobre el modelo base Qwen2.5 | Apache 2.0 | Publico, ampliamente utilizado |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32.768 tokens (recomendado 65.536, configurable hasta 131.072) | Destilacion de trazas de razonamiento de DeepSeek-R1 sobre Qwen2.5-1.5B | MIT | Publico, muy descargado |
| Qwen2.5-Math-1.5B-Instruct | 1,5B | 4.096 tokens | Especializado en matematicas | Apache 2.0 | Publico |

La diferencia clave frente a DeepSeek-R1-Distill-Qwen-1.5B es que este ultimo se entrena mediante destilacion supervisada de trazas de razonamiento de un modelo mayor, mientras que el adaptador analizado aplica aprendizaje por refuerzo directamente sobre el modelo instruct. No hay datos publicados que permitan comparar el rendimiento real de ambos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay resultados de GSM8K ni de ningun otro benchmark en la model card, por lo que no se puede afirmar que el entrenamiento con GRPO haya mejorado al modelo base; las ejecuciones de RL en modelos pequenos pueden degradar capacidades generales.
- Licencia indefinida: el campo de licencia de la model card contiene un marcador de posicion ("licence: license"). Aunque el modelo base es Apache 2.0, no hay una declaracion explicita de licencia para el adaptador, lo que supone un riesgo juridico para uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de olvido catastrofico: el ajuste con GRPO sobre un unico conjunto de datos matematicos (GSM8K) puede degradar el rendimiento conversacional general, la coherencia multilingue y el seguimiento de instrucciones complejas del modelo base.
- Riesgo de alucinacion: inherente a los modelos de 1,5B de parametros, especialmente alto en razonamiento aritmetico de varios pasos, donde un unico error de calculo invalida la respuesta final.
- Dispersión de formato: los modelos entrenados con RL para razonamiento suelen requerir directivas explicitas en el prompt (por ejemplo, indicar que se responda en un formato concreto) y pueden generar cadenas de pensamiento excesivamente largas.
- Sesgos e idioma: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre sesgos; el ajuste esta probablemente dominado por texto en ingles, lo que puede reducir la calidad en castellano.
- Contexto: no se documenta la longitud de contexto usada durante el entrenamiento; aunque el modelo base soporta 32.768 tokens, el ajuste puede degradar el rendimiento en secuencias largas.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia, sin documentacion de hiperparametros de entrenamiento; debe considerarse un artefacto de investigacion no validado.
- Nombre ambiguo: la denominacion incluye "deepseek-r1-distill" pese a que el modelo base declarado es Qwen2.5-1.5B-Instruct, no la destilacion oficial de DeepSeek; conviene no confundir ambas cosas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variante de la misma familia (G-4): https://huggingface.co/rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5b-rajat-seed-1234-G-4
- Destilacion oficial de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Articulo de DeepSeekMath (GRPO): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Experimentos con DeepSeek R1 Distill Qwen 1.5B (repositorio de terceros): https://github.com/olimiemma/DeepSeek_R1_Distill_Qwen_1_5B
- Ficha de terceros con el adaptador fusionado: https://github.com/Damacol/rghosh8-gsm8k-deepseek-r1-distill-qwen-1.5b-rajat-seed-42-g-16_merged
