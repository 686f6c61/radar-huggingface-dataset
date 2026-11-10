# lducc/lifemate-models

## Resumen

LifeMate models es un repositorio de checkpoints publicado por el usuario lducc que agrupa los artefactos necesarios para ejecutar el proyecto LifeMate, cuyo codigo fuente se aloja en un repositorio de GitHub privado. No se trata de un modelo fundacional entrenado desde cero, sino de un paquete de adaptadores y pesos ajustados sobre modelos de terceros: un adaptador LoRA de rango 32 sobre Qwen/Qwen3.5-4B para la parte de lenguaje, y un ajuste fino del modelo ASR Gipformer 1.5 (g-group-ai-lab/gipformer1.5-68M-rnnt) para la parte de reconocimiento de voz.

El repositorio tiene un tamano de 0,5 GB, lo que es coherente con un adaptador LoRA y un checkpoint ASR de ~68M de parametros, no con un modelo completo de 4B. La model card es extremadamente escueta: se limita a listar rutas de ficheros y un comando de descarga, sin detallar licencia, idiomas, datos de entrenamiento ni resultados de evaluacion.

Su relevancia es limitada fuera del contexto del proyecto original: al depender de un repositorio de codigo privado y de un pipeline de prediccion especifico (`src.predict`), no es un modelo directamente consumible con herramientas estandar como transformers, vLLM o llama.cpp sin trabajo adicional de integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA r32 sobre Qwen/Qwen3.5-4B (componente LLM); Gipformer 1.5 sobre g-group-ai-lab/gipformer1.5-68M-rnnt (componente ASR) |
| Parametros totales | No disponible (el adaptador LoRA no es un modelo completo; el ASR base es de 68M) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada de Qwen/Qwen3.5-4B, no documentada en la ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tag del repositorio); el checkpoint ASR se distribuye como `avg2-4.pt` (PyTorch) |

## Arquitectura y entrenamiento

El componente de lenguaje es un adaptador LoRA de rango 32 entrenado sobre Qwen/Qwen3.5-4B. Segun la model card, corresponde al checkpoint `sft_a0`, resultado de 3 epocas de ajuste supervisado (SFT) y del paso final del entrenamiento. No se especifican el volumen de datos, la composicion del dataset, la longitud de las secuencias ni si hubo etapas posteriores de alineamiento como RLHF o DPO.

El componente de voz es un ajuste fino de Gipformer 1.5, un modelo ASR de aproximadamente 68M de parametros identificado como `g-group-ai-lab/gipformer1.5-68M-rnnt` (arquitectura RNNT, es decir, transducer recurrente). El ajuste se realizo sobre todo el audio de entrenamiento disponible y el checkpoint publicado es la media de las epocas 2 a 4 (`asr/avg2-4.pt`), una tecnica habitual para estabilizar el modelo y reducir la varianza entre checkpoints. El repositorio incluye ademas `asr/public.jsonl`, con las transcripciones generadas por ese modelo sobre el audio de `public_test`, pensado para colocarse en `runs/asr/gipall_public.jsonl`. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y ajuste conversacional mediante el adaptador LoRA sobre Qwen3.5-4B, orientado presumiblemente a las tareas del proyecto LifeMate (no detalladas).
- Reconocimiento automatico del habla (ASR) en ingles o multilingue segun el modelo base Gipformer, con salida de transcripciones en formato JSONL.
- Integracion en un pipeline propio de prediccion (`python -m src.predict a0 gipall_public <adapter> public`) que combina el adaptador LLM y el modelo ASR.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio mas alla del ASR: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Transcripcion de audio a texto: el checkpoint `asr/avg2-4.pt` permite generar transcripciones con Gipformer 1.5 ajustado, util para procesar lotes de audio y producir ficheros JSONL listos para evaluacion o postprocesado.
- Pipeline de voz a texto mas respuesta generativa: combinando el ASR con el adaptador LoRA sobre Qwen3.5-4B se puede construir un asistente que transcriba una consulta hablada y genere una respuesta textual, que es el proposito aparente del proyecto LifeMate.
- Evaluacion de ASR sobre un conjunto publico: el fichero `asr/public.jsonl` sirve como referencia de transcripciones para comparar contra otras hipotesis o medir calidad sobre `public_test`.
- Reproduccion de experimentos del proyecto original: util para quien tenga acceso al repositorio `lducc/lifemate` y quiera replicar los resultados de `sft_a0` y del ajuste ASR.
- Ajuste fino posterior del adaptador: al ser un LoRA r32 sobre Qwen3.5-4B, puede servir como punto de partida para tareas conversacionales especificas, cargandolo sobre el modelo base con PEFT.
- Prototipado de asistentes de bajo coste: el componente ASR de 68M es ligero y puede ejecutarse en CPU o GPU de gama baja para pruebas de concepto de dictado o transcripcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador LoRA: no disponible de forma explicita; al cargarse sobre Qwen/Qwen3.5-4B, el consumo vendra determinado por el modelo base (tipicamente en el rango de 8-10 GB en FP16, aunque este dato no se confirma en la ficha).
- VRAM para el componente ASR: no disponible; con ~68M de parametros es esperable que quepa en CPU y en GPUs consumer, pero no se documenta.
- GPU recomendadas: no disponible.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no documentado; el flujo descrito depende de un script propio (`src.predict`) y de un repositorio privado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LifeMate models (este repo) | LoRA r32 sobre Qwen3.5-4B + ASR ~68M | No disponible | No disponible | Publico en HF, pero dependiente de codigo privado |
| Qwen/Qwen3.5-4B | 4B (modelo base) | No disponible | No disponible | Publico en HF |
| g-group-ai-lab/gipformer1.5-68M-rnnt | ~68M | No disponible | No disponible | Publico en HF |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que contactar con el autor o asumir riesgo legal.
- El repositorio depende de un proyecto de GitHub privado (`lducc/lifemate`) y de un script `src.predict` con rutas y variables (`ADAPTERS`) que hay que modificar manualmente; no es un modelo plug-and-play.
- No se documentan idiomas soportados, sesgos, tasas de alucinacion ni limitaciones de contexto.
- El adaptador LoRA solo tiene sentido cargado sobre la version exacta de Qwen/Qwen3.5-4B para la que fue entrenado; cambios en el modelo base pueden degradar el comportamiento.
- El checkpoint ASR es una media de epocas (2-4), lo que puede enmascarar el mejor checkpoint individual; no se aportan metricas WER/CER.
- El repositorio tiene 0 descargas y 1 like, sin senales de validacion por parte de la comunidad.
- El fichero `asr/public.jsonl` contiene transcripciones generadas por el propio modelo, no referencias humanas, por lo que no sirve como ground truth para medir calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lducc/lifemate-models
- Repositorio de codigo (privado): https://github.com/lducc/lifemate
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base ASR: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
