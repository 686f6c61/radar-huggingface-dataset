# LousisOfficial/LousisAI-4B

## Resumen

LousisAI-4B es un modelo de lenguaje causal en turco desarrollado por el usuario LousisOfficial mediante ajuste fino supervisado del modelo base Qwen/Qwen3-4B-Base. No se trata de un entrenamiento desde cero, sino de una adaptacion con QLoRA (adaptadores LoRA de rango 16 y alpha 32 sobre un modelo base cuantizado en 4 bits NF4) que posteriormente se fusiona con el modelo base para producir un checkpoint safetensors de aproximadamente 4.022 millones de parametros (4,0 B), tal y como reflejan los metadatos del repositorio.

El objetivo declarado es adaptar Qwen3-4B al turco con un conjunto de datos conversacional de tamano reducido (7.810 ejemplos tras limpieza, formato CHAT), entrenado en Google Colab sobre una unica GPU NVIDIA Tesla T4 de ~15 GB de VRAM. El modelo hereda del base la arquitectura transformer causal densa de Qwen3 y el tokenizer original, sin entrenar un vocabulario propio.

Su relevancia es limitada y muy acotada: es un experimento de ajuste fino de bajo coste, con 0 descargas y 1 "like" en el momento de la consulta, y el propio autor advierte que no debe usarse para decisiones criticas en produccion por el riesgo de sobreajuste y el reducido alcance del dataset. Encaja, por tanto, mas como ejemplo reproducible de QLoRA en turco que como modelo listo para despliegue general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (derivado de Qwen3); ajuste con QLoRA (LoRA r=16, alpha=32) |
| Parametros totales | 4.022.468.096 (~4,02 B) segun safetensors; la model card indica ~2238,8 M para el "modelo base", dato no coincidente |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B-Base declara 32.768 tokens nativos. La longitud maxima de secuencia usada en el entrenamiento fue de 448 tokens |
| Tipos de cuantizacion | Cuantizacion 4-bit NF4 durante el entrenamiento (bitsandbytes); pesos distribuidos en safetensors (no se ofrecen variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Turco (tr); capacidades en otros idiomas no garantizadas tras el ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA fusionado con el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Base: un transformer causal denso con atencion por consultas agrupadas (GQA) y las innovaciones propias de la familia Qwen3 en cuanto a normalizacion y disposicion de capas. Sobre ese modelo congelado y cuantizado en 4 bits NF4 se insertaron adaptadores LoRA con rango r=16 y alpha=32, entrenando aproximadamente el 1,48 % de los parametros efectivos. El adaptador resultante se fusiono con el base, de modo que el artefacto publicado es un modelo denso estandar, no un repositorio de adaptadores sueltos.

El entrenamiento se realizo con QLoRA sobre un dataset conversacional en turco de 7.810 ejemplos tras limpieza (5.731 de entrenamiento y 391 de validacion, ~29 MB), con el tokenizer original de Qwen3 sin modificaciones. La configuracion fue: learning rate 0,0002, batch size 2 con acumulacion de gradientes de 16 (efectivo 32), longitud maxima de secuencia 448 tokens, optimizador AdamW de 8 bits, fp16 y gradient checkpointing, todo sobre una Tesla T4. La mejor perdida de validacion registrada fue 1,7464. No se documenta ninguna fase de RLHF, DPO ni otro alineamiento posterior al ajuste supervisado, ni innovaciones tecnicas propias mas alla del procedimiento QLoRA descrito.

## Capacidades

- Generacion de texto causal en turco en formato conversacional ChatML (delimitadores `<|im_start|>` y `<|im_end|>`).
- Dialogo de un solo turno o multi-turno basico, segun el esquema de prompt del autor.
- Continuacion de texto y respuesta a instrucciones simples dentro del dominio cubierto por el dataset.
- Herencia del tokenizer multilingue de Qwen3, aunque el comportamiento fiable se limita al turco.
- No se documenta soporte de tool calling, function calling ni razonamiento de multiples pasos.
- No se documentan capacidades de vision, audio, modo "thinking" explicito ni decodificacion especulativa.
- No se documentan capacidades especificas de codigo o matematicas propias del ajuste (dependerian de las residuales del modelo base).

## Casos de uso

- Experimentacion academica con QLoRA: sirve como referencia reproducible de ajuste fino en turco sobre una GPU de 15 GB, util para comparar hiperparametros e impacto del tamano de dataset.
- Prototipado de chatbots en turco de bajo coste: permite validar rapidamente un flujo conversacional ChatML antes de invertir en un ajuste con datos de mayor calidad.
- Generacion de texto turco en dominios cercanos al dataset de entrenamiento: adecuado para borradores o respuestas asistidas donde no se exija alta precision factual.
- Aumento de datos sinteticos en turco: puede emplearse para generar variaciones de texto que luego se filtren manualmente, dado su bajo coste de inferencia.
- Pruebas de integracion de pipelines Hugging Face Transformers: util para verificar plantillas de prompt, gestion de tokens especiales y configuracion de generacion con `eos_token_id` compuesto.
- Evaluacion comparativa de tecnicas de cuantizacion: al derivar de un 4B denso, permite medir latencia y huella de memoria en configuraciones fp16 frente a 4-bit en GPUs de consumo.
- Fine-tuning posterior (continuar el ajuste): puede actuar como punto de partida para un segundo ciclo de LoRA con un dataset mas amplio en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la mejor perdida de validacion durante el entrenamiento (1,7464), que no es comparable con metricas estandar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 8-9 GB solo para pesos, mas memoria para el contexto y el estado de la cache KV (a 448 tokens el consumo adicional es reducido).
- VRAM estimada en 4-bit: aproximadamente 3-4 GB para los pesos, mas overhead de la libreria de cuantizacion.
- GPU recomendadas: cualquier GPU con 16 GB o mas (RTX 4080/4090, A100 40 GB, H100) para fp16 holgado; para 4-bit basta una GPU de 8-12 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores, especialmente en cuantizacion 4-bit.
- Opciones de despliegue: Hugging Face Transformers con `bitsandbytes` para carga en 4-bit u 8-bit; los repositorios con arquitectura Qwen3 son compatibles con vLLM y TGI, pero no se confirma compatibilidad probada para este checkpoint concreto. No se ofrecen pesos GGUF, por lo que Ollama y llama.cpp requeririan una conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LousisAI-4B | ~4,02 B | No especificado (base Qwen3: 32.768) | Turco | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Base | ~4 B | 32.768 nativos (ampliable) | Multilingue | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-3B | ~3,09 B | 32.768 nativos | Multilingue | Apache 2.0 (salvo variantes) | Hugging Face |
| meta-llama/Llama-3.2-3B | ~3,21 B | 128.000 | Multilingue | Llama 3.2 Community License | Hugging Face, con registro |

Frente al Qwen3-4B-Base original, LousisAI-4B anade especializacion en turco a costa de un dataset muy reducido (7.810 ejemplos), lo que puede degradar el rendimiento general multilingue y aumentar el riesgo de sobreajuste. No se dispone de datos de benchmarks que permitan comparar su calidad real con estas alternativas.

## Limitaciones y advertencias

- Entrenado sobre un dataset de solo 7.810 ejemplos (~29 MB), por lo que su cobertura tematica y linguistica es muy estrecha y no funciona como asistente general.
- Riesgo de sobreajuste reconocido explicitamente por el autor; la perdida de validacion debe monitorizarse en cualquier uso posterior.
- El propio autor desaconseja su uso para decisiones criticas en produccion.
- Longitud de secuencia de entrenamiento limitada a 448 tokens: respuestas largas o contextos extensos pueden degradarse aunque el base soporte ventanas mayores.
- Discrepancia entre el recuento de parametros de safetensors (~4,02 B) y el dato de "modelo base ~2238,8 M" de la model card, que conviene verificar antes de asumir un tamano concreto.
- Sesgos potenciales no evaluados: no se documenta analisis de sesgo, toxicidad ni evaluacion de seguridad.
- Riesgo de alucinacion alto por el reducido volumen de datos de ajuste.
- Cobertura idiomatica efectiva limitada al turco; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias por parte del autor; se desconoce la composicion exacta y los derechos del dataset de entrenamiento.
- 0 descargas y 1 "like" en el momento de la consulta: practicamente sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LousisOfficial/LousisAI-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a contenidos no relacionados, como marcadores deportivos de la MLB).
