# groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-GPTQPro-W4-G64

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-GPTQPro-W4-G64 es una cuantización local de 4 bits del checkpoint Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario groxaxo. No se trata de un modelo nuevo ni de un fine-tuning: el autor aplica la receta GPTQ-Pro `quality_4bit()` sobre la revisión fijada `40c1fbe115db8a76ea0c594fc6759d39ffab4d15` del modelo original y conserva la licencia Apache-2.0 con atribución al publicador upstream. El resultado ocupa 9,212 GB de pesos frente a los 19,306 GB del BF16, es decir, aproximadamente la mitad de huella en disco y en VRAM.

El interés práctico está en el binomio formato/runtime: el autor valida el checkpoint con vLLM 0.24.0 seleccionando `quantization="gptq_marlin"`, lo que activa el kernel Marlin para GPTQ y multiplica por más de dos la velocidad de decodificación respecto al BF16 en la misma tarjeta. En una RTX 3090 limitada a 200 W y con prompts de 512 tokens, la decodificación estimada en batch 1 pasa de 27,89 a 71,81 tokens/s, y el throughput agregado en batch 4 de 108,78 a 266,51 tokens/s.

El modelo base tiene 9.653.104.368 parámetros según los safetensors y, por los tags y el nombre, se apoya en la arquitectura Qwen3.5 con cabezas de predicción multi-token (MTP) y una torre de visión. La model card advierte explícitamente de que las afirmaciones del publicador upstream no están verificadas de forma independiente por esta cuantización, y el autor no publica datos de contexto nativo, idiomas ni resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con torre de visión y tensores MTP (multi-token prediction) |
| Parámetros totales | 9.653.104.368 (9,65 B) |
| Parámetros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | No disponible (la configuración de referencia de vLLM fija `max_model_len=4096`) |
| Tipos de cuantización | GPTQ-Pro INT4 simétrico, `group_size=64`, `desc_act=False`; 348 tensores protegidos permanecen en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base, con atribución upstream) |
| Formato de pesos | safetensors (formato GPTQ, librería `gptqmodel`) |
| Tamaño de pesos | 9,212 GB (decimal) frente a 19,306 GB del BF16 de origen |
| Módulos cuantizados | 32 capas del decodificador, 200 módulos lineales seleccionados |
| Calibración | 64 muestras / 29.919 tokens (mezcla de texto privado y texto general); las entradas no se distribuyen |
| Runtime recomendado | vLLM 0.24.0 con `quantization="gptq_marlin"` |
| Modelo base | Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (revisión `40c1fbe115db8a76ea0c594fc6759d39ffab4d15`) |
| Descargas / likes | 19 / 0 |

## Arquitectura y entrenamiento

La cuantización no altera la topología del modelo base: mantiene las 32 capas del decodificador y empaqueta 200 módulos lineales en INT4 con reordenamiento group-aware, MSE ponderado por activaciones y staging del Hessiano en FP32 estricto, sin fallback numérico y sin GPTAQ ni FOEM. La receta es GPTQ-Pro secuencial, simétrica, con grupo de 64 y sin `desc_act`, lo que facilita el uso de kernels Marlin. Se preservan exactamente 348 tensores en la precisión del origen, verificados bit a bit contra el BF16: todas las 15 matrices MTP y la torre de visión quedan fuera de la cuantización, de modo que el checkpoint sigue siendo multimodal y conserva el mecanismo de decodificación especulativa en los pesos (aunque el autor no evalúa ni la visión ni el MTP acelerado).

No hay entrenamiento nuevo ni datos de preentrenamiento propios: el autor declara explícitamente que no aplica fine-tuning. La única fase con datos es la calibración de GPTQ, con 64 muestras y 29.919 tokens de una mezcla de texto privado y general que no se publica. El modelo base, según su nombre, combina linaje DeepSeek-V4-Pro con la arquitectura Qwen3.5, pero la model card de esta cuantización advierte que las afirmaciones del publicador upstream no han sido verificadas de forma independiente y remite a `UPSTREAM_MODEL_CARD.md`.

## Capacidades

- Generación de texto conversacional y `text-generation`, según el `pipeline_tag` del repositorio.
- Razonamiento y respuesta multi-turno heredados del modelo base; el autor no publica evaluaciones específicas de matemáticas ni de código.
- Tool calling y function calling: no disponibles en la información proporcionada (no confirmados ni descartados).
- Uso en agentes y razonamiento multi-paso: no documentado por el autor.
- Capacidades multimodales: el checkpoint contiene una torre de visión preservada en BF16, pero la calidad visual queda explícitamente fuera de las pruebas realizadas.
- Predicción multi-token (MTP): los 15 tensores MTP se conservan intactos, lo que habilita decodificación especulativa en los pesos; el autor no mide el MTP acelerado.
- Multilingüismo: no disponible; el repositorio no declara listado de idiomas.
- Servicio de alto throughput con kernels Marlin en vLLM, incluido batching (hasta `max_num_seqs=4` en la configuración probada).

## Casos de uso

- Servicio de chat en una única GPU de consumo: con 9,212 GB de pesos, el modelo cabe en tarjetas de 16-24 GB dejando espacio para caché KV; en la RTX 3090 probada entrega 61,03 tokens/s end-to-end en batch 1.
- Atención al cliente automatizada: conversaciones multi-turno con prompts de varios cientos de tokens; el benchmark de referencia usa 512 tokens de prompt y el rendimiento en llamada prompt-only se mantiene idéntico al BF16 (173,81 ms frente a 173,06 ms).
- Despliegue con vLLM en producción: la ruta validada es vLLM 0.24.0 con `gptq_marlin`, `tensor_parallel_size=1`, `gpu_memory_utilization=0.90` y `language_model_only=True`, lo que simplifica el escalado horizontal por réplicas.
- Procesamiento por lotes con throughput agregado: en batch 4 el modelo alcanza 266,51 tokens/s de decodificación agregada (162,44 tokens/s end-to-end), adecuado para tareas de resumen o extracción de datos en cola.
- Asistentes con capacidad de imagen: al conservarse la torre de visión en BF16, puede usarse para descripción o extracción de información de documentos escaneados, asumiendo que la calidad visual no ha sido validada por el autor.
- Sustitución de un despliegue BF16 para reducir costes: la huella cae de 19,306 GB a 9,212 GB con un incremento de perplejidad del 3,441 % y una tasa de coincidencia top-1 del 89,93 %, lo que permite mover la carga a GPUs más pequeñas.
- Evaluación de pipelines de decodificación especulativa: los tensores MTP intactos permiten probar MTP acelerado con vLLM, aunque los resultados de esa ruta no están publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos publicados son métricas de fidelidad de la cuantización y de rendimiento de servicio, medidas por el autor.

Fidelidad distribucional: KL(original BF16 || Marlin W4) sobre 24.576 posiciones de siguiente token, extraídas de 64 ventanas no solapadas de WikiText-2 de 512 tokens (los primeros 128 tokens solo como condicionamiento).

| Métrica | Resultado |
|---|---|
| KL(original BF16 \|\| Marlin W4), nats/token | 0,05044701 |
| Coincidencia top-1 con el original | 89,9251 % |
| Perplejidad del original | 8,799345 |
| Perplejidad del W4 | 9,102161 |
| Incremento de perplejidad | 3,441 % |
| Incremento de NLL | 0,03383457 nats/token |

Rendimiento en una RTX 3090 a 200 W (prompts de 512 tokens, 65 tokens de salida, activaciones y KV en BF16, sin prefix caching, mediana de tres repeticiones):

| Medición en caliente | BF16 | GPTQ-Pro W4 vía Marlin |
|---|---:|---:|
| Decodificación estimada, batch 1 (tokens/s) | 27,89 | 71,81 |
| Generación end-to-end, batch 1 (tokens/s) | 26,34 | 61,03 |
| Llamada solo prompt, batch 1 (ms) | 173,06 | 173,81 |
| Decodificación agregada, batch 4 (tokens/s) | 108,78 | 266,51 |
| Generación end-to-end agregada, batch 4 (tokens/s) | 86,89 | 162,44 |
| Llamada solo prompt, batch 4 (ms) | 638,71 | 640,01 |

La mejora declarada es de 2,57x en decodificación estimada y 2,45x en generación end-to-end dentro de la comparación homogénea en vLLM. Los tiempos de arranque en frío, compilación y otras cargas o límites de potencia pueden alterar estos valores.

## Requisitos de hardware

- VRAM para inferencia: unos 9,2 GB solo para los pesos; con activaciones y caché KV en BF16 conviene reservar 11-13 GB para `max_model_len=4096` y pocos hilos concurrentes.
- GPU probada: RTX 3090 con límite de potencia de 200 W, `tensor_parallel_size=1`, `gpu_memory_utilization=0.90`.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080/4080 Super (16 GB), RTX 4070 Ti Super (16 GB), A10, L4, L40S y A100/H100 para mayor concurrencia.
- ¿Cabe en GPU de consumo? Sí: entra en tarjetas de 16 GB y, con contexto y batching reducidos, en modelos de 12 GB; en 8 GB no cabría sin recortar contexto o descargar capas.
- Despliegue: vLLM 0.24.0 con `quantization="gptq_marlin"` es la ruta validada; la librería declarada es `gptqmodel`. Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Throughput: 71,81 tokens/s de decodificación estimada en batch 1 y 266,51 tokens/s agregados en batch 4 sobre RTX 3090 a 200 W.
- Latencia de prefill: 173,81 ms para un prompt de 512 tokens en batch 1 y 640,01 ms para cuatro peticiones simultáneas.
- Nota: la visión y el MTP acelerado no se incluyeron en las pruebas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Este checkpoint (GPTQ-Pro W4 G64) | 9,65 B | No disponible | 9,212 GB | Apache-2.0 | HuggingFace, 19 descargas | 2,57x más rápido que BF16 en la misma RTX 3090 |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (BF16) | 9,65 B | No disponible | 19,306 GB | Apache-2.0 | HuggingFace | Original sin cuantizar; perplejidad 8,799 frente a 9,102 |
| Otras cuantizaciones de 8-9 B en 4 bits | No disponible | No disponible | No disponible | No disponible | No disponible | No hay datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible una comparación cuantitativa con terceros.

## Limitaciones y advertencias

- Sesgos: no documentados por el autor; al heredarse del modelo base, arrastra los sesgos de su dataset de preentrenamiento, no descritos.
- Alucinación: no se han publicado evaluaciones de veracidad; la cuantización añade un incremento de NLL de 0,0338 nats/token y degrada la coincidencia top-1 al 89,93 %, lo que puede amplificar errores en generaciones largas.
- Contexto: la longitud nativa no se declara; el benchmark usa 4.096 tokens, así que no hay garantías sobre comportamiento en contextos largos.
- Idiomas: el repositorio no declara idiomas soportados; el rendimiento fuera del inglés no está verificado.
- Visión y MTP: los tensores están preservados, pero su calidad no ha sido evaluada; no deben asumirse como funcionales en producción sin validación propia.
- Licencia: Apache-2.0 permite uso comercial, pero se mantiene la atribución al publicador upstream y este no verifica las afirmaciones del modelo original; conviene revisar `UPSTREAM_MODEL_CARD.md` antes de un despliegue comercial.
- Reproducibilidad: los datos de calibración son privados y no se distribuyen, por lo que la cuantización no es reproducible bit a bit.
- Rendimiento: las cifras de velocidad corresponden a una RTX 3090 limitada a 200 W con `max_model_len=4096`; otros límites de potencia, versiones de vLLM o cargas de trabajo pueden dar resultados distintos.
- Madurez: 19 descargas y 0 likes; no hay validación independiente de terceros sobre este artefacto.
- En los resultados de búsqueda web no se ha encontrado documentación adicional ni discusión externa sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-GPTQPro-W4-G64
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Revisión upstream fijada: `40c1fbe115db8a76ea0c594fc6759d39ffab4d15`
- Ficheros de trazabilidad citados en el repositorio: `PROVENANCE.json`, `WEIGHT_CHECKSUMS.json`, `KL_REPORT.json`, `PERFORMANCE.json`, `UPSTREAM_MODEL_CARD.md`
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada
