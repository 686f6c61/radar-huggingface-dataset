# arena-education/Qwen3-32B-bnb-4bit

## Resumen

Qwen3-32B-bnb-4bit es una cuantizacion de los pesos del modelo Qwen3-32B de Alibaba Qwen, publicada por arena-education para los ejercicios de su curso ARENA. Se trata de una version del modelo original en la que las capas lineales del transformer se han cuantizado a 4 bits en formato NF4 mediante bitsandbytes, mientras que los embeddings, la capa de desembebido y las normalizaciones se mantienen en bfloat16. No se ha realizado ningun ajuste fino ni modificacion de los pesos mas alla de la cuantizacion.

El modelo base Qwen3-32B es un transformer denso de 32.762.123.264 parametros orientado a generacion de texto, razonamiento, codigo y matematicas, con soporte de tool calling y modos de razonamiento explicito. Esta version cuantizada ocupa 20,7 GB en disco y esta pensada para ejecutarse en GPU de 24 GB de VRAM, lo que rebaja sustancialmente el hardware necesario frente a los aproximadamente 65 GB que requeriria el modelo en bfloat16.

La relevancia practica de esta ficha es que permite desplegar un modelo de 32B en tarjetas consumer de gama alta como la RTX 4090, manteniendo los logits equivalentes a cuantizar el modelo original con la misma configuracion. La licencia Apache 2.0 se conserva, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), pesos lineales cuantizados a 4 bits NF4 |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits NF4 (bitsandbytes) en capas `nn.Linear`; embeddings, unembedding y normas en bfloat16; `bnb_4bit_use_double_quant=False`, `bnb_4bit_compute_dtype=torch.bfloat16` |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados con bitsandbytes), cargables via `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32B parametros de la familia Qwen3. Esta version no introduce cambios arquitectonicos: solo sustituye los pesos de las capas `nn.Linear` de los bloques del transformer por representaciones de 4 bits en formato NF4, manteniendo en bfloat16 los embeddings, la capa de desembebido y las normalizaciones. La cuantizacion se realizo con `BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=False, bnb_4bit_compute_dtype=torch.bfloat16)` sobre la revision `9216db5781bf21249d130ec9da846c4624c16137` del repositorio original.

No se ha realizado ningun ajuste fino, RLHF ni DPO adicional. El autor indica que cargar este repositorio produce los mismos logits que cargar `Qwen/Qwen3-32B` aplicando la configuracion de cuantizacion anterior, verificado con transformers 5.22.1 y bitsandbytes 0.50.2. Los ficheros del tokenizador se copian sin modificar. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF) no se recogen en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de un solo turno.
- Razonamiento y resolucion de problemas de varios pasos (capacidad heredada del modelo base Qwen3).
- Generacion de codigo y matematicas.
- Soporte de tool calling y function calling (heredado de Qwen3).
- Uso en agentes y razonamiento multi-paso.
- Capacidades multilingues: no detalladas en la informacion disponible.
- Compatibilidad con PEFT LoRA: se pueden adjuntar adaptadores sobre la version cuantizada.
- Compatibilidad con `output_hidden_states` y hooks de forward, ya que las activaciones se mantienen en bfloat16.
- Modo de razonamiento explicito (thinking mode): no confirmado en la informacion proporcionada para esta version, aunque forma parte del modelo base.

## Casos de uso

- Ejecucion de ejercicios del curso ARENA en GPU de 24 GB: el proposito declarado del repositorio es permitir correr Qwen3-32B en tarjetas como la RTX 4090, algo imposible con el modelo en bfloat16.
- Prototipado de agentes con tool calling en estaciones de trabajo de una sola GPU: al conservar las capacidades del modelo base, se pueden probar flujos de function calling sin acceso a clusters de 80 GB.
- Generacion de codigo en local para desarrollo: el modelo puede integrarse en editores o pipelines de CI/CD en maquinas con 24 GB de VRAM, manteniendo la calidad del modelo de 32B.
- Investigacion en tecnicas de cuantizacion y PEFT: al permitir adjuntar adaptadores LoRA sobre pesos NF4, sirve para experimentar con fine-tuning eficiente en memoria.
- Analisis de documentos y conversaciones de contexto largo: adecuado cuando se necesita un modelo de 32B en hardware limitado y no se dispone de GPUs de 80 GB.
- Evaluacion comparativa de calidad entre inferencia cuantizada y en bfloat16: el autor garantiza equivalencia de logits, lo que facilita estudiar el impacto de la cuantizacion en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,7 GB de pesos mas overhead de activaciones y cache KV; encaja en GPUs de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB), A6000 (48 GB), A100 (40/80 GB), H100 (80 GB). El autor indica que el modelo completo debe residir en la GPU.
- Cabe en GPU consumer: si, en RTX 4090 y modelos con 24 GB o mas de VRAM.
- Opciones de despliegue: `transformers` con `bitsandbytes` (metodo documentado por el autor). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto en la informacion proporcionada.
- Latencia y throughput: no disponibles.
- Requisito adicional: GPU CUDA y la libreria `bitsandbytes`; no se debe pasar `quantization_config` al cargar, ya que se usa la almacenada en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arena-education/Qwen3-32B-bnb-4bit | 32,76B | no disponible | 4 bits NF4 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-32B (original) | 32,76B | no disponible | bfloat16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones de Qwen3-32B (GGUF, AWQ, GPTQ) | 32,76B | no disponible | 4-8 bits | Apache 2.0 (heredada) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar ligeramente la calidad frente al modelo en bfloat16, aunque el autor afirma equivalencia de logits con la configuracion de cuantizacion indicada.
- Requiere GPU CUDA y `bitsandbytes`; no es ejecutable en CPU de forma practica ni en entornos sin esa libreria.
- El modelo completo debe caber en la GPU, lo que limita el despliegue a tarjetas de 24 GB o mas.
- No se han documentado sesgos especificos de esta version; los sesgos del modelo base no se detallan en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan datos concretos de evaluacion.
- Idiomas soportados no especificados en la informacion proporcionada.
- Uso comercial permitido bajo Apache 2.0, con la condicion de conservar el aviso de modificacion recogido en `NOTICE`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/arena-education/Qwen3-32B-bnb-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Documentacion de cuantizacion con bitsandbytes en transformers: https://huggingface.co/docs/transformers/quantization/bitsandbytes
- Curso ARENA: https://www.arena.education/
