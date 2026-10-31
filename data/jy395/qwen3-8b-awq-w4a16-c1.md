# jy395/Qwen3-8B-awq-w4a16-c1

## Resumen

Qwen3-8B-awq-w4a16-c1 es una versión cuantizada del modelo Qwen3-8B de Alibaba (Qwen), publicada por el usuario jy395 en HuggingFace. Se trata de una cuantización AWQ de pesos en 4 bits con esquema asimétrico W4A16 (pesos en 4 bits, activaciones en 16 bits), calibrada sobre C1, un corpus de WikiText-2 (texto genérico). El checkpoint forma parte de las 30 configuraciones comprimidas publicadas junto al artículo de ICAIF '26 "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", que estudia cuándo la compresión post-entrenamiento de LLMs financieros requiere datos de calibración del dominio.

La relevancia de este modelo es doble: por un lado, ofrece una versión eficiente de Qwen3-8B (arquitectura transformer denso de 8 mil millones de parámetros) que reduce significativamente los requisitos de memoria para inferencia; por otro, sirve como artefacto experimental para investigar el impacto de los datos de calibración en la cuantización de modelos orientados al sector financiero. El formato compressed-tensors permite cargarlo directamente en vLLM, y su licencia Apache 2.0 habilita el uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8.000 millones (modelo base); 2.174.236.152 segun metadatos de safetensors (valor de almacenamiento comprimido, no de parametros logicos) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible en la ficha (el modelo base Qwen3-8B soporta 32.768 tokens, ampliable a 131.072 con YaRN; la calibracion uso max_seq_length=2048) |
| Tipos de cuantizacion | AWQ W4A16 (pesos en 4 bits asimetricos, activaciones en 16 bits) |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B es multilingue, con soporte destacado de chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer decoder denso (no MoE) de 8 mil millones de parametros entrenado por el equipo Qwen de Alibaba. Sobre ese modelo base se aplico una compresion post-entrenamiento mediante AWQ (Activation-aware Weight Quantization) con esquema W4A16 asimetrico, utilizando la libreria llm-compressor del proyecto vLLM. La cuantizacion se calibro con el corpus C1, compuesto por WikiText-2 (texto generico, no financiero), consumiendo el corpus completo con 128 secuencias de 2048 tokens (262.144 tokens en total) y semilla 42 para reproducibilidad.

No se trata de un modelo reentrenado: no hubo preentrenamiento adicional ni ajuste con RLHF/DPO en esta version; el valor anade la compresion y su contexto experimental. El trabajo de investigacion asociado evalua como la eleccion del corpus de calibracion (generico frente a dominio financiero) afecta a la calidad del modelo comprimido en diez tareas financieras, con el script de cuantizacion y la suite de evaluacion publicados en GitHub para su reproduccion exacta.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-8B (pipeline text-generation).
- Razonamiento general, codigo y matematicas a nivel de Qwen3-8B, con posible degradacion por la cuantizacion W4A16 (cuantificada en el articulo asociado, no detallada en la ficha).
- Capacidades multilingues del modelo base, con enfasis en chino e ingles (no confirmado en la ficha del derivado).
- Carga directa en vLLM gracias al formato compressed-tensors, y compatibilidad con transformers mediante AutoModelForCausalLM.
- Utilidad como artefacto de investigacion: permite comparar el efecto de datos de calibracion genericos frente a especificos de dominio en la compresion de LLMs financieros.
- No hay evidencia en la ficha de soporte nativo de tool calling, vision, audio ni thinking mode para esta variante cuantizada (el modelo base Qwen3-8B si incorpora modo de razonamiento hibrido, pero su comportamiento tras la cuantizacion no se documenta aqui).

## Casos de uso

- Servccion de inferencia eficiente con vLLM: el formato compressed-tensors carga directamente en vLLM, reduciendo a la mitad aproximadamente la huella de memoria frente a FP16, util para desplegar Qwen3-8B en una sola GPU de consumo.
- Investigacion en compresion de LLMs: como parte de la coleccion de ICAIF '26, sirve de punto de comparacion para estudiar si los datos de calibracion deben coincidir con el dominio de uso; el corpus C1 (generico) frente a otros corpus financieros permite aislar ese efecto.
- Evaluacion de tareas financieras: la suite de evaluacion del repositorio asociado cubre diez tareas financieras, por lo que el modelo puede emplearse como baseline cuantizado en benchmarks del sector.
- Prototipado de asistentes conversacionales: al conservar las capacidades de Qwen3-8B, es adecuado para chatbots y agentes ligeros donde el coste de memoria importa mas que el ultimo punto de calidad.
- Reproduccion cientifica: el script de cuantizacion, los corpus de calibracion (con semilla 42) y el protocolo de consumo completo del corpus permiten replicar exactamente el experimento.
- Fine-tuning posterior sobre pesos comprimidos o punto de partida para estudiar QLoRA/compresion combinada con adaptadores, dado el bajo footprint del checkpoint (6,1 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante concreta. El articulo asociado ("Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", ICAIF '26) evalua el modelo en diez tareas financieras, pero los numeros concretos no constan en la model card; pueden consultarse en el repositorio de codigo y la suite de evaluacion enlazados.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 5-6 GB para los pesos en W4A16 (el repo ocupa 6,1 GB), mas overhead de KV cache y activaciones; en la practica, una GPU de 8 GB es suficiente con contexto moderado.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o mas (RTX 3060/4060 Ti 16 GB, RTX 4070/4090); para serving con vLLM y lotes grandes, A100 o L4.
- Cabe comodamente en GPUs de consumo: si, es uno de los principales atractivos de la version W4A16 frente al FP16 del base (que requiere unos 16 GB).
- Despliegue: vLLM (carga directa en formato compressed-tensors, via recomendada), transformers con AutoModelForCausalLM y device_map="auto". No se menciona soporte para llama.cpp, Ollama ni TGI en la ficha (el formato no es GGUF).
- Latencia y throughput: no disponible; al ser W4A16, la inferencia en vLLM con kernels AWQ suele mejorar el throughput respecto a FP16, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-awq-w4a16-c1 (este) | 8B (base) | AWQ W4A16, calibrado con WikiText-2 | heredada de Qwen3-8B | Apache 2.0 | Artefacto del estudio ICAIF '26 sobre calibracion |
| Qwen/Qwen3-8B | 8B | Sin cuantizar (BF16) | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Modelo base; maxima calidad, mayor consumo de memoria |
| Otras 29 configuraciones de la coleccion ICAIF '26 | 8B (base) | Distintos metodos y corpus de calibracion (incluidos corpus financieros) | heredada | Apache 2.0 | Permiten comparar el efecto del corpus de calibracion |

## Limitaciones y advertencias

- La calibracion se realizo con texto generico (WikiText-2), no financiero; segun la tesis del articulo asociado, esto puede degradar el rendimiento en tareas financieras frente a configuraciones calibradas con datos del dominio.
- La cuantizacion W4A16 implica cierta perdida de calidad respecto al modelo base en FP16; la magnitud no se detalla en la ficha y debe consultarse en la evaluacion del repositorio.
- Los metadatos de safetensors reportan 2.174 millones de parametros, cifra coherente con el almacenamiento comprimido en 4 bits pero no con los 8 mil millones de parametros logicos del modelo; conviene no confundir ambos valores.
- El modelo conserva los sesgos y el riesgo de alucinacion del modelo base Qwen3-8B; no se han documentado sesgos especificos de esta variante.
- La longitud de contexto no esta confirmada en la ficha de la variante; la calibracion uso secuencias de 2048 tokens, lo que no limita necesariamente la inferencia, pero no hay validacion documentada de contextos largos tras la cuantizacion.
- Con 0 descargas registradas, es un checkpoint de nicho orientado a investigacion; para uso en produccion general puede ser preferible el modelo base o cuantizaciones mas contrastadas.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Qwen3-8B-awq-w4a16-c1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Articulo (ICAIF '26): https://doi.org/10.1145/3858063.3858724
- Codigo, corpus de calibracion y suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantizacion: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/awq_w4a16.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa en HuggingFace: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Libreria de compresion: https://github.com/vllm-project/llm-compressor
