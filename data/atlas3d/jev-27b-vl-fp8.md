# Atlas3D/JEV-27B-VL-FP8

## Resumen

Atlas3D/JEV-27B-VL-FP8 es un checkpoint cuantizado en FP8 del modelo multimodal autotrust/JEV-27B-VL, publicado por Atlas3D. Se trata de una cuantizacion W8A8 con activaciones dinamicas por token, generada con llm-compressor en formato compressed-tensors, que reduce el peso de los pesos de aproximadamente 53 GiB en bf16 a unos 34,3 GiB. El repositorio ocupa 37,2 GB y el recuento real de parametros en safetensors es de 27.781.427.952 (unos 27,78 mil millones).

El modelo es de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto. La model card identifica el modelo base como Qwen/Qwen3.8-27B y la etiqueta del repositorio incluye `qwen3_5`, de modo que la arquitectura subyacente es de la familia Qwen de tercera generacion; el dato exacto de version no queda unificado en la informacion disponible. La licencia es Apache-2.0, heredada del modelo original.

Su relevancia es practica: permite desplegar un modelo de ~27,8B con vision en GPUs con soporte FP8 nativo (Ada, Hopper o Blackwell) ocupando aproximadamente dos tercios de la memoria del original, manteniendo la torre de vision, las capas de atencion lineal, los embeddings, el `lm_head`, el modulo MTP y el adaptador de decision System 1 en bf16. Es un checkpoint de cuantizacion, no un modelo nuevo: su interes esta en la eficiencia de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con bloques de atencion completa y bloques de atencion lineal; incluye modulo MTP (multi-token prediction); tag `qwen3_5` |
| Parametros totales | 27.781.427.952 (~27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 con activaciones dinamicas por token (`FP8_DYNAMIC`), formato compressed-tensors; el resto de componentes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), libreria vllm |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido: combina bloques de atencion completa con bloques de atencion lineal, e incorpora un modulo MTP (multi-token prediction). La presencia de `--mamba-cache-mode align` en el comando de servicio de vLLM apunta a un mecanismo de cache de estado asociado a las capas lineales. Ademas, el modelo incluye un componente especifico denominado "JEV System 1 decision adapter", servido como modulo LoRA (`adapter_vllm/`) y expuesto mediante un endpoint `/v1/decide`, que funciona como cabeza de decision sobre opciones. Se distingue asi un System 1 (decision) y un System 2 (generacion de texto libre).

Sobre el entrenamiento no se aporta informacion en el material disponible: no se indica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo unico documentado es el proceso de cuantizacion: se cuantizaron a FP8 las capas Linear del modelo de lenguaje en los bloques de atencion completa y en los MLP, mientras que la torre de vision, las capas de atencion lineal, los embeddings, el `lm_head`, el MTP y el adaptador de decision System 1 permanecen en bf16. La herramienta usada fue llm-compressor con el esquema `FP8_DYNAMIC`. No es un reentrenamiento ni un ajuste fino, sino una conversion de precision.

## Capacidades

- Generacion de texto conversacional a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Comprension de imagenes: la torre de vision se conserva en bf16, sin cuantizar.
- Capacidad de decision estructurada mediante el endpoint `/v1/decide` del System 1, que elige entre opciones con probabilidades asociadas.
- Generacion de texto libre (System 2), aunque su calidad no se ha evaluado por separado en la informacion disponible.
- Decodificacion con multi-token prediction (MTP) integrada en la arquitectura.
- Servicio con LoRA: el adaptador de decision se carga como modulo LoRA con rango hasta 32.
- Soporte de prefix caching en vLLM, lo que favorece conversaciones multi-turno con prefijos repetidos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentadas explicitamente).
- Capacidades multilingues: no disponible.

## Casos de uso

- Decision automatizada entre alternativas: el endpoint `/v1/decide` permite usar el modelo como clasificador de opciones con probabilidades, util para enrutado, seleccion de respuestas o triaje previo a una generacion costosa.
- Asistentes multimodales sobre documentos escaneados: al aceptar imagen y texto, puede procesar capturas, diagramas o formularios y responder preguntas sobre su contenido.
- Despliegue en GPUs Ada, Hopper o Blackwell con restriccion de memoria: al ocupar unos 34,3 GiB en FP8 en lugar de unos 53 GiB en bf16, permite servir el modelo en una unica GPU de 48 GB o en configuraciones de 80 GB con margen amplio para cache KV.
- Sistemas conversacionales multi-turno con prefix caching: la activacion de prefix caching en vLLM reduce el coste de recomputar prefijos largos y repetidos, habitual en dialogos y prompts con instrucciones fijas.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la degradacion de FP8 frente a bf16 en tareas de decision, con una metodologia ya publicada por el autor.
- Personalizacion ligera con LoRA: el despliegue con `--enable-lora --max-lora-rank 32` permite anadir adaptadores especificos de dominio sin tocar los pesos base.
- Prototipado rapido con vLLM: al estar la cuantizacion declarada en `config.json`, el modelo se carga directamente con vLLM sin pasos de conversion adicionales por parte del usuario.

## Benchmarks y rendimiento

La unica evaluacion publicada se refiere al System 1 (`/v1/decide`), comparando decision a decision contra el modelo bf16 original con el mismo harness y los mismos estados:

| Metrica | Resultado |
|---|---|
| La opcion principal coincide con bf16 | 299/308 (97,1%) |
| Mayor cambio de probabilidad en cualquier opcion | 0,061 |
| Escenarios de cordura (sanity) | 6/6 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La calidad del System 2 (generacion de texto libre) no fue evaluada por separado segun la propia model card.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 34,3 GiB en FP8 (frente a unos 53 GiB en bf16). El repositorio completo ocupa 37,2 GB.
- VRAM total recomendada: al menos 48 GB para pesos mas cache KV y estados de las capas lineales; 80 GB ofrece margen comodo para lotes y contextos largos.
- GPU con soporte FP8 obligatorio: arquitecturas Ada (por ejemplo L40S, RTX 6000 Ada), Hopper (H100, H200) o Blackwell. Las GPU Ampere o anteriores no pueden ejecutar esta cuantizacion.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 16 GB o menos. Tampoco cabe en una unica GPU de 32 GB. Requiere, como minimo, una GPU profesional de 48 GB o varias GPU con tensor parallel.
- Opciones de despliegue: vLLM es la libreria declarada (`library_name: vllm`); se incluye el script `serve_decide.py`. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Parametros de servicio sugeridos por el autor: `--enable-lora --max-lora-rank 32`, `--logprobs-mode processed_logprobs`, `--enable-prefix-caching`, `--mamba-cache-mode align`, `--max-num-seqs 8`, `--trust-request-chat-template`.
- Latencia y throughput: no disponible. El valor `--max-num-seqs 8` es el unico indicio de configuracion de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / tamano de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas3D/JEV-27B-VL-FP8 | ~27,78B | FP8 W8A8, ~34,3 GiB | no disponible | Apache-2.0 | HuggingFace (vLLM) |
| autotrust/JEV-27B-VL (original) | ~27,78B (mismo modelo base) | bf16, ~53 GiB | no disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (base citado) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparacion con otras alternativas de la misma categoria (modelos multimodales de ~27B) no esta disponible en la informacion proporcionada: no se dispone de datos de parametros, contexto ni rendimiento de esos hipoteticos competidores. La unica comparacion con datos verificables es contra el propio checkpoint bf16 del que deriva, con un 97,1% de coincidencia en la decision principal del System 1.

## Limitaciones y advertencias

- La cuantizacion FP8 exige hardware con soporte nativo (Ada, Hopper o Blackwell); no es portable a GPUs mas antiguas.
- Solo esta cuantizada una parte del modelo. La torre de vision, las capas de atencion lineal, los embeddings, el `lm_head`, el MTP y el adaptador System 1 siguen en bf16, por lo que el ahorro de memoria es parcial y no uniforme.
- La evaluacion publicada se limita a la cabeza de decision (System 1). No hay validacion de la calidad de generacion de texto libre ni de las capacidades de vision tras la cuantizacion.
- La prueba de fidelidad se realizo con un unico harness y los mismos estados; 308 decisiones es una muestra reducida y no cubre todos los dominios de uso.
- Sesgos conocidos: no disponible. La model card no documenta sesgos ni analisis de equidad.
- Riesgo de alucinacion: no disponible de forma explicita, pero es un riesgo inherente a los modelos generativos de este tamano y no se ha medido en la informacion disponible.
- Limitaciones de contexto e idioma: no disponible. No se especifica la ventana de contexto ni la lista de idiomas soportados.
- Licencia Apache-2.0, heredada del modelo original: permite uso comercial, pero el propio autor remite a la model card original para las condiciones, el uso previsto y las limitaciones, que se aplican sin cambios.
- Es un modelo derivado: `base_model_relation: quantized` sobre autotrust/JEV-27B-VL, que a su vez deriva de Qwen/Qwen3.8-27B. Cualquier restriccion adicional del linaje debe verificarse en las fichas de origen.
- El repositorio no tiene descargas ni valoraciones en el momento del registro, por lo que no existe validacion independiente por parte de la comunidad.
- El nombre del modelo base aparece de forma inconsistente entre la etiqueta `qwen3_5` y la referencia a `Qwen/Qwen3.8-27B`; conviene confirmar la version exacta antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atlas3D/JEV-27B-VL-FP8
- Modelo base: https://huggingface.co/autotrust/JEV-27B-VL
- Modelo de origen citado: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion (llm-compressor): no se proporciona enlace en la informacion disponible
- Paper, blog o demo: no disponible
