# arena-education/Llama-2-13b-hf-bnb-8bit

## Resumen

`arena-education/Llama-2-13b-hf-bnb-8bit` es una version cuantizada a 8 bits del modelo `meta-llama/Llama-2-13b-hf` de Meta, publicada por el equipo de ARENA (Alignment Research Engineer Accelerator) para sus ejercicios de formacion. La unica modificacion respecto al modelo original es la cuantizacion int8 de las capas `nn.Linear` internas de los bloques del transformer mediante bitsandbytes, con el objetivo de que el modelo quepa en GPUs de 16 GB de VRAM sin necesidad de recuantizar en cada carga.

El modelo conserva la arquitectura y los pesos originales de Llama 2 13B: un transformer decoder-only denso de 13.017.994.240 parametros con 40 capas, atencion multi-cabeza con RoPE y contexto de 4.096 tokens. No se ha realizado ningun ajuste fino ni modificacion de los datos de entrenamiento; las embeddings, la capa de unembedding y las normalizaciones se mantienen en bfloat16, mientras que el resto de matrices lineales se almacenan en int8.

Su relevancia es practica y acotada: sirve como artefacto reproducible de cuantizacion para docencia e investigacion, y como ejemplo de publicacion de pesos pre-cuantizados que evitan el coste de cuantizacion en cada `from_pretrained`. No es un modelo nuevo ni una mejora sobre Llama 2, sino un empaquetado del mismo con un `BitsAndBytesConfig` fijado (`load_in_8bit=True`, `llm_int8_threshold=2.0`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 2) |
| Parametros totales | 13.017.994.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 usa 4.096 tokens) |
| Tipos de cuantizacion | int8 (bitsandbytes, `load_in_8bit=True`, `llm_int8_threshold=2.0`) en capas `nn.Linear`; embeddings, unembedding y norms en bfloat16 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (repo de 13,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 13B: un transformer decoder-only denso con atencion multi-cabeza, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El repositorio no introduce cambios arquitectonicos; unicamente sustituye los pesos de las capas `nn.Linear` de los bloques del transformer por versiones cuantizadas a int8 con bitsandbytes. Las embeddings, la capa de salida (unembedding) y las normalizaciones permanecen en bfloat16, de modo que las activaciones y los estados ocultos conservan la precision original y los hooks de `output_hidden_states` funcionan igual que en el modelo base.

No se ha realizado ningun tipo de entrenamiento adicional: ni ajuste fino, ni RLHF, ni DPO. Los datos de entrenamiento son los de Llama 2 13B original (no detallados en la informacion proporcionada). El autor verifica que cargar este repositorio produce los mismos logits que cargar `meta-llama/Llama-2-13b-hf` con la misma configuracion de cuantizacion, comprobado con transformers 5.22.1 y bitsandbytes 0.50.2. La innovacion tecnica se limita al empaquetado: los pesos ya cuantizados evitan repetir la cuantizacion en cada carga, lo que reduce el tiempo de arranque y el consumo de memoria transitorio.

## Capacidades

- Generacion de texto autoregresiva en el mismo rango de capacidades que Llama 2 13B (redaccion, resumen, respuesta a preguntas, razonamiento basico).
- Generacion de codigo y matematicas a nivel del modelo base, sin capacidades adicionales de tool calling nativo.
- Soporte de PEFT LoRA: el autor indica que se pueden adjuntar adaptadores LoRA sobre el modelo cuantizado.
- Compatibilidad con `device_map="cuda"` y ejecucion completa en GPU (el modelo entero debe residir en la GPU).
- Soporte de `output_hidden_states` y forward hooks, ya que las activaciones se mantienen en bfloat16.
- Capacidades multilingues: no disponibles en la informacion proporcionada (heredadas del modelo base, sin detalle).
- No dispone de modo thinking, vision, audio ni function calling nativo.

## Casos de uso

- Docencia y ejercicios de cuantizacion: el modelo permite a estudiantes de ARENA cargar un Llama 2 13B en GPUs de 16 GB y estudiar el efecto de la cuantizacion int8 sobre logits y activaciones sin gestionar el proceso de cuantizacion.
- Investigacion sobre interpretabilidad: al conservar las activaciones en bfloat16 y soportar `output_hidden_states` y forward hooks, sirve para analizar representaciones internas de un modelo de 13B en hardware modesto.
- Ajuste fino con LoRA en laboratorio: se pueden adjuntar adaptadores PEFT sobre el modelo cuantizado para experimentos de alineacion o dominio especifico con requisitos de VRAM reducidos.
- Reproducibilidad de experimentos: al fijar la revision `5c31dfb671ce7cfe2d7bb7c04375e44c55e815b1` del modelo base y la configuracion de cuantizacion, facilita la replicacion de resultados entre distintos equipos.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir degradacion de calidad frente al modelo en bfloat16 completo en tareas de generacion y razonamiento.
- Prototipado de pipelines de generacion de texto: para demos internas y pruebas de integracion con transformers donde el presupuesto de VRAM es de 16 GB y no se requiere maxima fidelidad numerica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 13,4 GB de pesos; con activaciones y cache KV en bfloat16 se recomienda al menos 16 GB de VRAM, que es el objetivo declarado por el autor.
- GPU recomendadas: el autor indica que el modelo esta pensado para GPUs de 16 GB; encajan tarjetas como RTX 4080, RTX 4090, A100 y H100. No se detallan modelos concretos en la model card.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas de VRAM (por ejemplo RTX 4080 o RTX 4090) segun el objetivo del autor.
- Despliegue: transformers con bitsandbytes y CUDA; el autor no menciona soporte para vLLM, llama.cpp, Ollama ni TGI. Requiere `device_map="cuda"` y que el modelo completo resida en la GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arena-education/Llama-2-13b-hf-bnb-8bit | 13.017.994.240 | int8 (bitsandbytes) | no disponible | Llama 2 Community License | Hugging Face |
| meta-llama/Llama-2-13b-hf | 13.017.994.240 | bfloat16 | 4.096 tokens (modelo base) | Llama 2 Community License | Hugging Face |
| Llama 2 7B (familia) | menor | no disponible | no disponible | Llama 2 Community License | Hugging Face |

La comparativa se limita a la familia Llama 2 porque la informacion proporcionada no incluye datos de rendimiento ni de otros modelos comparables. La diferencia principal frente al modelo base es el formato de pesos (int8 pre-cuantizado frente a bfloat16) y el menor requisito de VRAM; no hay diferencias en arquitectura ni en licencia.

## Limitaciones y advertencias

- Sesgos: heredados de Llama 2 13B; no se detallan en la informacion proporcionada.
- Riesgo de alucinacion: el mismo que el modelo base, sin mitigaciones adicionales.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada; el modelo base Llama 2 tiene una ventana de 4.096 tokens y un soporte multilingue limitado.
- Licencia: Llama 2 Community License, con atribucion obligatoria (fichero `Notice`) y sujeta a la Acceptable Use Policy de Meta (`USE_POLICY.md`). El uso comercial esta permitido bajo los terminos de dicha licencia, pero no es una licencia de codigo abierto permisiva.
- Requiere CUDA y bitsandbytes; no funciona en CPU ni en entornos sin GPU NVIDIA segun la model card.
- El modelo completo debe residir en la GPU; no se documenta offloading parcial.
- No se debe pasar un `quantization_config` al cargar: se usa la configuracion almacenada en el repo.
- La cuantizacion int8 puede introducir pequenas diferencias numericas respecto al modelo en bfloat16, aunque el autor afirma que los logits son identicos con la configuracion indicada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arena-education/Llama-2-13b-hf-bnb-8bit
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-hf
- Documentacion de cuantizacion bitsandbytes en transformers: https://huggingface.co/docs/transformers/quantization/bitsandbytes
- ARENA (curso): https://www.arena.education/
- Licencia Llama 2: fichero `LICENSE.txt` dentro del repositorio
