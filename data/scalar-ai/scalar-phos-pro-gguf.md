# scalar-ai/scalar-phos-pro-gguf

## Resumen

Scalar Phos Pro (GGUF) es un repositorio de pesos cuantizados en formato GGUF derivado del modelo base `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario `scalar-ai`. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF con cuantizaciones Q4_K_M, Q5_K_M y Q8_0, acompañada de ficheros `Modelfile` preconfigurados para Ollama, LM Studio y llama.cpp. El repositorio principal del autor (`scalar-ai/scalar-phos-pro`) contiene, según la model card, adaptadores LoRA PEFT en safetensors; esta variante GGUF empaqueta los pesos resultantes para inferencia local.

El modelo hereda la arquitectura y capacidades de Llama 3.1 8B Instruct: un transformer decoder-only de 8.030.261.312 parámetros con una ventana de contexto de 128.000 tokens (según la especificación oficial de Llama 3.1, no confirmada explícitamente en la model card de este repositorio). El pipeline declarado es `text-generation` y el idioma indicado es únicamente inglés (`en`).

Su relevancia práctica es la de ofrecer una vía de despliegue local sencilla: cuantizaciones de 4,92 GB (Q4_K_M), 5,73 GB (Q5_K_M) y 8,54 GB (Q8_0), con `Modelfile` incluidos y compatibilidad con el endpoint de Hugging Face para `ollama run hf.co/...`. La licencia es Llama 3.1 Community License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 8B Instruct declara 128.000 tokens |
| Tipos de cuantizacion | Q4_K_M (4,92 GB), Q5_K_M (5,73 GB), Q8_0 (8,54 GB) |
| Idiomas soportados | Ingles (`en` segun la model card) |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | GGUF (con `Modelfile` para Ollama) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamano del repositorio | 35,3 GB |
| Descargas / likes | 561 / 1 |
| Fecha de creacion | 2026-11-14 |
| Ultima actualizacion | 2026-11-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con 8.030.261.312 parametros, atención con RoPE y las innovaciones introducidas por Meta en la familia Llama 3.1 (tokenizador ampliado a 128.256 tokens, soporte de contexto largo y plantilla de chat con roles `system`, `user`, `assistant` y `ipython` para tool calling). Este repositorio no aporta información sobre el proceso de entrenamiento del modelo base ni sobre el ajuste fino que dio lugar a los adaptadores LoRA del repositorio principal.

Según la model card, el repositorio principal `scalar-ai/scalar-phos-pro` contiene adaptadores LoRA PEFT en safetensors, y esta variante GGUF empaqueta los pesos resultantes en tres cuantizaciones. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación posteriores al modelo base. Tampoco se detalla la técnica de cuantización empleada más allá de la nomenclatura estándar de llama.cpp (K-quants para Q4_K_M y Q5_K_M, cuantización de 8 bits por bloque para Q8_0).

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct.
- Razonamiento, código y matemáticas a nivel del modelo base (sin benchmarks publicados en este repositorio).
- Soporte de plantilla de chat con roles de sistema, usuario y asistente, incluida en los `Modelfile`.
- Tool calling / function calling: el modelo base Llama 3.1 lo soporta mediante el rol `ipython`; la model card no documenta pruebas específicas sobre esta variante.
- Capacidades multilingües: la model card declara únicamente inglés (`en`); no se confirma soporte de otros idiomas.
- Inferencia local optimizada para CPU y GPU consumer mediante llama.cpp y Ollama.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional local en portátil: con la cuantización Q4_K_M (4,92 GB) el modelo cabe en GPUs consumer de 8 GB de VRAM y permite conversaciones multi-turno sin conexión, usando `ollama run hf.co/scalar-ai/scalar-phos-pro-gguf:Q4_K_M`.
- Prototipado de aplicaciones con Ollama: los `Modelfile` incluidos preconfiguran plantilla de chat y parámetros, lo que acelera la creación de un servicio local (`ollama create` + `ollama run`) para validar prompts y flujos antes de pasar a producción.
- Generación de código asistida en entornos sin acceso a la nube: el modelo base tiene capacidad de generación de código; esta variante permite integrarlo en editores o scripts locales vía llama.cpp con `-ngl 33` para descargar capas a GPU.
- Procesamiento por lotes en CPU: la cuantización Q4_K_M permite ejecutar generación de texto en servidores sin GPU usando llama.cpp, útil para tareas de resumen o clasificación de documentos en inglés.
- Evaluación de adaptadores LoRA: dado que el repositorio principal contiene adaptadores PEFT, esta variante GGUF sirve para comparar el comportamiento del modelo ajustado frente al base en un mismo entorno de inferencia local.
- Desarrollo de agentes sencillos con tool calling: el modelo base soporta function calling mediante la plantilla de Llama 3.1; se puede usar en prototipos de agentes locales que invoquen herramientas mediante el formato de rol `ipython`, aunque no hay validación documentada en esta variante.
- Despliegue en estaciones de trabajo con 16 GB de VRAM: la cuantización Q8_0 (8,54 GB) ofrece calidad casi sin pérdida y cabe holgadamente en GPUs como RTX 4080/4090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base. Tampoco se documentan métricas de latencia o throughput para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead aproximado de contexto):
  - Q4_K_M: ~5-6 GB de VRAM con contexto moderado; ~4,92 GB solo de pesos.
  - Q5_K_M: ~6-7 GB de VRAM; ~5,73 GB solo de pesos.
  - Q8_0: ~9-10 GB de VRAM; ~8,54 GB solo de pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las tres cuantizaciones; A100 y H100 para despliegues de mayor concurrencia (no documentado por el autor).
- Cabe en GPU consumer: sí. Q4_K_M y Q5_K_M en GPUs de 8 GB; Q8_0 requiere 12 GB o más para contexto amplio.
- Opciones de despliegue: Ollama (soporte directo vía `hf.co/...`), llama.cpp (`llama-cli` con `-fa` y `-ngl`), LM Studio (mencionado en la model card). No se documenta soporte de vLLM ni TGI para este formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scalar-ai/scalar-phos-pro-gguf | 8,03 B | No disponible en la model card (base: 128k) | GGUF (Q4_K_M, Q5_K_M, Q8_0) | Llama 3.1 Community License | Hugging Face, Ollama |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | safetensors, GGUF oficial | Llama 3.1 Community License | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia; no hay datos de rendimiento publicados para esta variante que permitan comparar calidad. Frente a Mistral y Qwen2.5, la diferencia principal es la licencia: Llama 3.1 Community License impone restricciones adicionales (por ejemplo, la cláusula de "más de 700 millones de usuarios mensuales" y requisitos de atribución) que Apache 2.0 no tiene.

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma; el rendimiento en castellano no está validado y probablemente sea inferior al de modelos multilingües.
- No se documentan evaluaciones de sesgo, toxicidad o alucinación para esta variante; el modelo base Llama 3.1 tiene sesgos conocidos heredados de sus datos de entrenamiento.
- Riesgo de alucinación inherente a un modelo de 8 B en tareas de conocimiento factual; no hay benchmarks que cuantifiquen este riesgo en la variante ajustada.
- La licencia Llama 3.1 Community License restringe el uso comercial en determinados supuestos y exige atribución; es necesario revisar el texto completo antes de un despliegue en producción.
- El repositorio tiene un volumen de descargas bajo (561) y un único like, lo que limita la evidencia comunitaria sobre su calidad y estabilidad.
- No se documenta la composición del ajuste fino ni el dataset utilizado para los adaptadores LoRA, lo que dificulta evaluar qué comportamiento se ha modificado respecto al modelo base.
- El tamaño del repositorio (35,3 GB) implica descargas largas; conviene descargar solo la cuantización necesaria.
- No hay soporte documentado para vLLM o TGI; el despliegue en producción con alta concurrencia requeriría convertir los pesos a otros formatos.
- La fecha de creación indicada (2026-11-14) es posterior a la fecha actual en muchos contextos de consulta; conviene verificar la vigencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scalar-ai/scalar-phos-pro-gguf
- Repositorio principal con adaptadores LoRA: https://huggingface.co/scalar-ai/scalar-phos-pro
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Ollama: https://ollama.com/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
