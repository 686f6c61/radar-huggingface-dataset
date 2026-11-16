# qminhlb/zac2026-bunscas-agent-rewriter

## Resumen

ZAC 2026 LifeMate — team bunscas es un conjunto de adaptadores LoRA publicados por el usuario qminhlb sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo completo, sino de un paquete de checkpoints orientados a dos tareas concretas dentro de un sistema de agentes: un adaptador "agent" para razonamiento y actuacion multi-paso, y un adaptador "rewriter" para reformulacion de consultas o instrucciones. El repositorio incluye ademas los adaptadores intermedios, los datos de entrenamiento en formato JSONL y la configuracion usada, lo que lo convierte en una publicacion reproducible de un pipeline de ajuste fino.

El modelo base sobre el que se aplican los adaptadores es Qwen3.5-4B, un transformer denso de aproximadamente 4.000 millones de parametros con licencia Apache 2.0. Los adaptadores se distribuyen en formato safetensors y se cargan mediante PEFT o vLLM con soporte LoRA. El repositorio ocupa 3,4 GB, lo que incluye pesos de adaptadores y datasets, pero no los pesos del modelo base.

La relevancia de esta publicacion es doble: por un lado, documenta una receta de mezcla de adaptadores (model soup y concatenacion ponderada) para construir un agente a partir de varios ajustes independientes; por otro, libera los datos de entrenamiento y los argumentos exactos de cada etapa, algo poco habitual en checkpoints de competicion. No obstante, se trata de un artefacto muy especializado, sin model card con benchmarks ni idiomas declarados, y con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.5-4B) con adaptadores LoRA |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; los adaptadores anaden un delta de rango bajo (r32 o r128 segun el adaptador) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-4B; no se especifica) |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA compatibles con PEFT y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen, y sobre el se aplican adaptadores LoRA de rango bajo. El adaptador de agente usado en inferencia (`inference/agent`) es una concatenacion ponderada exacta de cuatro ingredientes: 1/3·qXFT + 1/3·qXFTN + 1/3·qXFTNP + 1/3·RKP, con rango 128. Los tres primeros ingredientes (qXFT, qXFTN, qXFTNP) se entrenaron desde el modelo base con r32, alpha 64, learning rate 1e-4, 2 epocas, semilla 0 y `--think-weight 0.01`, sobre 11.314, 13.134 y 20.577 filas respectivamente. El cuarto ingrediente, RKP, se entreno 1 epoca con learning rate 5e-5 sobre un modelo intermedio (`xt100_merged` = base + qTw02 fusionado + XT100), usando 2.820 filas y aportando unicamente su delta.

El adaptador rewriter (`inference/rewriter`, identificado como qRW5b) se entreno con r32, 1 epoca, longitud maxima 1.536 y `--key-weight 3`, sobre 11.782 filas de `data/data_R5b.jsonl`. El paquete incluye tambien los intermedios qTw02 y XT100 (este ultimo es un adaptador de rango 64 que representa exactamente el delta entre qXFT y qTw02) para poder reconstruir la receta completa. El entrenamiento uso decodificacion greedy en inferencia con semilla 0 en vLLM. No se documentan tecnicas como RLHF, DPO o decodificacion especulativa; el unico indicio de optimizacion de inferencia es la mencion a una lista de tokens FR-Spec construida sobre el corpus de `data_qTm.jsonl`.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de agente, gracias al adaptador `inference/agent`.
- Reformulacion de consultas o instrucciones mediante el adaptador `inference/rewriter`, disenado para reescribir entradas antes de pasarlas a un agente.
- Entrenamiento con ponderacion de "thinking" (`--think-weight 0.01`), lo que sugiere soporte de trazas de razonamiento interno, aunque no se detalla el formato.
- Capacidad de cargarse como modulo LoRA independiente en vLLM (`--enable-lora --lora-modules`), lo que permite servir variantes por tarea sobre un unico modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada; no se declaran idiomas.

## Casos de uso

- Agente conversacional especializado en dominio "LifeMate": el adaptador `inference/agent` se cargaria sobre Qwen3.5-4B en vLLM y se usaria como cerebro de un asistente personal con memoria de contexto heredada del base. Es adecuado por su bajo coste de despliegue y porque la receta de mezcla busca robustez combinando cuatro ajustes distintos.
- Reformulacion de consultas en un pipeline RAG: el adaptador `inference/rewriter` reescribiria la pregunta del usuario antes de la recuperacion, mejorando el recall en busquedas; el entrenamiento con `--key-weight 3` sugiere enfasis en preservar palabras clave.
- Sistema de dos etapas rewriter + agent: se puede servir un unico modelo base con dos modulos LoRA conmutables en vLLM, reduciendo el coste de GPU frente a desplegar dos modelos separados.
- Investigacion en mezcla de adaptadores: el repositorio permite reproducir la concatenacion ponderada y el model soup (qTw02 + XT100) para estudiar como se combinan deltas de LoRA sin reentrenar desde cero.
- Fine-tuning continuado sobre dominio propio: al incluir los JSONL de entrenamiento (entre 2.820 y 20.577 filas por etapa), sirve como punto de partida documentado para ajustes adicionales con PEFT.
- Experimentacion academica con presupuesto reducido: un modelo de 4B con adaptadores de rango bajo cabe en GPUs de consumo y permite iterar sobre tecnicas de merging y concatenacion de adaptadores sin infraestructura grande.
- Evaluacion de tecnicas de tokenizacion especulativa: la lista FR-Spec incluida en el corpus de `data_qTm.jsonl` puede reutilizarse para experimentos de decodificacion especulativa sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa del base de 4B, en FP16 requeriria aproximadamente 8 GB solo para pesos, mas KV cache y overhead; en cuantizacion de 4 bits, del orden de 3-4 GB, aunque estos valores no los declara el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano del base, una RTX 4090 (24 GB) o A100/H100 son suficientes; una GPU consumer de 8-12 GB podria servir en cuantizacion baja.
- Cabe en GPU consumer: previsiblemente si, dado que el base es de 4B y los adaptadores son de rango bajo; no confirmado por el autor.
- Opciones de despliegue: vLLM con `--enable-lora --lora-modules agent=<dir>/inference/agent`; PEFT con `PeftModel.from_pretrained(base, "<repo>/adapters/qXFT")`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se indica decodificacion greedy con `--seed 0` en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qminhlb/zac2026-bunscas-agent-rewriter | ~4B (base) + LoRA | No disponible | Apache 2.0 | Safetensors (LoRA) | Paquete de adaptadores para agente y rewriter, con datos y receta |
| Qwen/Qwen3.5-4B | ~4B | No disponible | Apache 2.0 | Safetensors | Modelo base sin adaptadores; referencia directa |
| Alternativas de 4B comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion con otros modelos de la misma categoria no puede completarse con rigor porque la informacion proporcionada no incluye benchmarks ni especificaciones del base mas alla del identificador. Cualquier cifra adicional seria inventada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar Qwen/Qwen3.5-4B por separado; el repositorio solo contiene adaptadores y datos.
- Ausencia total de benchmarks, evaluaciones cualitativas o ejemplos de salida; no hay evidencia publica de calidad.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido y depende del base.
- La receta de mezcla es compleja (concatenacion ponderada de cuatro adaptadores mas dos intermedios) y un error en el orden o en la base de carga (RKP y XT100 son deltas) puede producir resultados incorrectos.
- Riesgo de alucinacion inherente a un modelo de 4B; no se documentan mitigaciones.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero al ser adaptadores sobre un base tambien Apache 2.0 conviene verificar los terminos del base en su propia model card.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Los paths dentro de `args.json` son rutas de entrenamiento y no se leen al cargar; pueden confundir a quien intente reproducir el pipeline.
- Fecha de creacion posterior a la de esta ficha en el calendario habitual (2026-11-16), lo que sugiere un artefacto de competicion o un error de metadatos; conviene tratarlo con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qminhlb/zac2026-bunscas-agent-rewriter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Codigo de entrenamiento: modulo `lifemate.train.train_lora` y configuracion `configs/train/lora_qwen3_5_4b.yaml`, incluidos en la imagen de envio de la competicion (no se proporciona URL publica)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
