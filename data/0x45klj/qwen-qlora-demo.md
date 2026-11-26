# 0X45klj/qwen-qlora-demo

## Resumen

`0X45klj/qwen-qlora-demo` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario 0X45klj en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos delta que deben cargarse junto al modelo base Qwen2.5-1.5B-Instruct para poder utilizarse. El repositorio tiene un tamano de 0.0 GB, lo que es coherente con un adaptador de bajo rango sobre un modelo de 1.500 millones de parametros.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de la familia Qwen2.5 desarrollada por Alibaba Cloud, ajustado para seguir instrucciones y mantener conversaciones. El adaptador anade un ajuste fino supervisado (SFT) con LoRA, presumiblemente orientado a una tarea o dominio concreto, aunque la model card no especifica cual.

La relevancia de esta ficha es limitada: se trata de un experimento o demo (el nombre "qwen-qlora-demo" lo sugiere) sin documentacion tecnica, sin datos de entrenamiento declarados, sin benchmarks y sin licencia especificada. Es util como ejemplo de flujo de trabajo PEFT/TRL sobre Qwen2.5, pero no como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, segun la documentacion publica de Qwen) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF/AWQ/GPTQ por separado) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2, transformers, trl |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-11-26 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango aplicado sobre Qwen2.5-1.5B-Instruct. La arquitectura subyacente del modelo base es un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), tal como corresponde a la familia Qwen2.5. El adaptador modifica un subconjunto de las matrices de proyeccion (tipicamente q_proj, k_proj, v_proj, o_proj y las capas MLP) mediante descomposicion de bajo rango, sin alterar el resto de pesos del modelo base.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL y PEFT 0.21.2. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, la tasa de aprendizaje, el rango LoRA, el valor de alpha, el dropout ni la precision numerica empleada. Tampoco se documenta si hubo etapas de RLHF, DPO o preferencia. La unica referencia tecnica adicional es la cita generica al paper de Lacoste et al. (2019) sobre impacto ambiental, que aparece en la plantilla estandar de Hugging Face y no aporta informacion sobre este modelo concreto.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones en formato chat (el modelo base esta ajustado para ello).
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 1.500 millones de parametros.
- Generacion de codigo sencillo y explicaciones tecnicas, con calidad moderada propia de un modelo pequeno.
- Capacidad multilingue heredada del modelo base (Qwen2.5 cubre chino, ingles y otros idiomas, aunque el adaptador no documenta idiomas).
- Soporte de tool calling y function calling: no documentado en el adaptador; el modelo base Qwen2.5-1.5B-Instruct incluye plantillas para ello, pero no hay garantia de que el ajuste LoRA lo preserve.
- Modo thinking, vision o audio: no disponible.
- Capacidades de agente multi-paso: no documentadas.

## Casos de uso

- Prototipado de pipelines PEFT: el adaptador sirve como ejemplo reproducible de como aplicar LoRA y SFT sobre Qwen2.5-1.5B-Instruct con TRL, util para equipos que quieran montar su propio flujo de ajuste fino.
- Experimentacion academica con modelos pequenos: permite estudiar el efecto de un ajuste SFT de bajo rango sobre un modelo de 1.500 millones de parametros en tareas acotadas, sin necesidad de GPUs de gran capacidad.
- Pruebas de integracion con la libreria PEFT: valida la carga de adaptadores safetensors con `PeftModel.from_pretrained` y su combinacion con el tokenizer del modelo base.
- Demostraciones de fine-tuning en entornos educativos: por su reducido tamano, cabe en GPUs de consumo y permite ilustrar el ciclo completo de entrenamiento y evaluacion.
- Base para experimentos de cuantizacion: se puede fusionar el adaptador con el modelo base y cuantizar el resultado a GGUF para despliegue en llama.cpp u Ollama, aunque el autor no lo documenta.
- Evaluacion comparativa de adaptadores: util como referencia negativa o de control en estudios que comparen distintos ajustes LoRA sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en precision completa (bf16/fp16): aproximadamente 3 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion orientativa, no confirmada por el autor).
- VRAM estimada con cuantizacion de 8 bits: en torno a 1,5-2 GB para pesos.
- VRAM estimada con cuantizacion de 4 bits (GGUF Q4_K_M o similar): en torno a 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente para inferencia del modelo base; para entrenamiento del adaptador LoRA se recomienda al menos 8-12 GB.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 6 GB o mas.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (previa fusion del adaptador con el modelo base), llama.cpp u Ollama (previa conversion a GGUF), TGI (previa fusion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 0X45klj/qwen-qlora-demo | Adaptador LoRA sobre 1.5B | No disponible | No disponible | safetensors (PEFT) | Demo sin documentacion |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica de Qwen) | safetensors, GGUF | Modelo base oficial, documentado y con benchmarks |
| meta-llama/Llama-3.2-1B-Instruct | 1.2B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con licencia restrictiva |
| google/gemma-2-2b-it | 2.6B | 8.192 tokens (segun documentacion publica de Google) | Gemma Terms of Use | safetensors, GGUF | Alternativa ligeramente mayor con licencia propia |

## Limitaciones y advertencias

- La model card esta practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni proposito del ajuste.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido. Ante la ausencia de licencia explicita, debe asumirse que no hay permiso claro de uso comercial.
- El adaptador hereda los sesgos y riesgos del modelo base Qwen2.5-1.5B-Instruct, incluidos sesgos culturales y linguisticos derivados de sus datos de preentrenamiento.
- Riesgo de alucinacion propio de un modelo de 1.500 millones de parametros: la capacidad de razonamiento y de verificacion factica es limitada.
- No hay garantia de que el ajuste LoRA preserve las capacidades de tool calling o de agente del modelo base; es probable que el SFT haya podido degradarlas si el dataset no las cubria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso ni de validacion por parte de la comunidad.
- No se documentan idiomas soportados; el comportamiento multilingue depende enteramente del modelo base.
- No se han publicado resultados de evaluacion, por lo que no es posible comparar su calidad con el modelo base ni con otros adaptadores.
- El nombre "demo" sugiere que se trata de un experimento, no de un artefacto destinado a produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0X45klj/qwen-qlora-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper de impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
