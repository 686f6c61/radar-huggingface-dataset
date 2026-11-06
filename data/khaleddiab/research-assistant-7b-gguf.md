# khaleddiab/research-assistant-7b-GGUF

## Resumen

research-assistant-7b-GGUF es un modelo de lenguaje conversacional derivado de Qwen2.5-7B-Instruct, afinado por el usuario khaleddiab y convertido a formato GGUF mediante Unsloth. El repositorio contiene un unico archivo cuantizado en Q4_K_M (4,7 GB) pensado para su ejecucion local con llama.cpp y Ollama. La denominacion "research-assistant" sugiere un ajuste fino orientado a tareas de asistencia en investigacion, aunque la model card no documenta el conjunto de datos ni el procedimiento de entrenamiento empleado.

El modelo hereda la arquitectura transformer densa de la familia Qwen2.5, con 7.615.616.512 parametros totales (aproximadamente 7,6 mil millones) y una ventana de contexto que, en el modelo base, alcanza los 32.768 tokens (dato no verificado en este repositorio). Al tratarse de una cuantizacion Q4_K_M, el peso en disco se reduce a 4,7 GB, lo que permite desplegarlo en GPU de consumo con 8 GB o mas de VRAM.

La relevancia de esta ficha es limitada: el repositorio no presenta descargas ni interacciones, no declara licencia ni idiomas soportados, y no publica resultados de evaluacion. Debe tratarse como un artefacto experimental de un autor individual, no como un modelo de referencia para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, decoder-only) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en el repositorio (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Qwen2.5-7B-Instruct.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal estandar, RoPE, normalizacion RMSNorm y capas FeedForward con activacion SwiGLU. El ajuste fino se realizo supuestamente con Unsloth, segun indica la model card, lo que implica entrenamiento supervisado (SFT) y/o LoRA de bajo rango sobre el modelo base. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO adicional ni hiperparametros del ajuste.

La unica innovacion tecnica documentada es el proceso de conversion a GGUF mediante Unsloth, que acelera la exportacion y el entrenamiento. No hay evidencia de decodificacion especulativa, atencion lineal ni mecanismos hibridos. La model card menciona un comando para modelos multimodales (`llama-mtmd-cli`), pero el archivo publicado corresponde a un LLM de texto; no se aportan pesos de vision.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento basico y respuesta a preguntas, presumiblemente orientado a tareas de investigacion por el nombre del modelo.
- Generacion de codigo y matematicas a nivel del modelo base (no verificado en este repositorio).
- Soporte de plantilla de chat mediante `--jinja` en llama.cpp, lo que habilita el formato de conversacion de Qwen2.5.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere despliegue mediante API compatible con OpenAI.
- Soporte multilingue presumible (Qwen2.5 cubre decenas de idiomas), aunque no se declara en la model card.
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso en este repositorio.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Asistente de investigacion local: el modelo puede ejecutarse con llama.cpp u Ollama en una estacion de trabajo y responder consultas de sintesis bibliografica, resumen de articulos o generacion de borradores, aprovechando el contexto de 32.768 tokens del modelo base para introducir documentos largos.
- Prototipado rapido en portatiles con GPU de consumo: al ocupar 4,7 GB en Q4_K_M, cabe en tarjetas de 8 GB y permite iterar sobre prompts sin infraestructura en la nube.
- Despliegue en Ollama: la model card incluye un Modelfile, de modo que basta con `ollama create` para levantar un servicio conversacional local con plantilla de chat correcta.
- Evaluacion comparativa de ajustes finos: sirve como ejemplo de pipeline Unsloth + GGUF para medir el impacto de un SFT sobre Qwen2.5-7B-Instruct en tareas de dominio.
- Generacion de documentacion tecnica: con plantilla Jinja y temperatura controlada, puede redactar secciones de informes a partir de notas estructuradas.
- Chatbot interno de bajo coste: integrable via API compatible con OpenAI (tag `endpoints_compatible`) en un servidor con una sola GPU, para consultas de empleados sobre documentacion interna.
- Educacion y experimentacion: util en entornos academicos donde se requiere un modelo de 7B ejecutable sin conexion y con requisitos de hardware modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_M (4,7 GB de pesos mas cache KV para contexto moderado).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 40 GB (sobredimensionada para este tamano).
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: llama.cpp (`llama-cli -hf khaleddiab/research-assistant-7b-GGUF --jinja`), Ollama (Modelfile incluido), servidores compatibles con OpenAI por el tag `endpoints_compatible`; vLLM y TGI no soportan GGUF de forma nativa sin conversion a safetensors.
- Latencia y throughput estimados: no disponibles; dependeran de la GPU y del backend. Como referencia cualitativa, un 7B en Q4_K_M suele generar decenas de tokens por segundo en GPU de consumo, pero no se aportan mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| research-assistant-7b-GGUF | 7,6 B | no disponible (base: 32.768) | no disponible | GGUF Q4_K_M | Repositorio con 0 descargas |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | Apache 2.0 (modelo base) | safetensors, GGUF | Ampliamente distribuido, multiples cuantizaciones |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Muy extendido, ecosistema maduro |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Ampliamente distribuido |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no hay datos de rendimiento de research-assistant-7b-GGUF para contrastar calidad.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial; debe contactarse con el autor o verificar la licencia del modelo base Qwen2.5-7B-Instruct (Apache 2.0) antes de desplegarlo.
- Ausencia total de documentacion sobre el dataset de ajuste fino: riesgo de sesgos desconocidos, sobreajuste a un dominio concreto o degradacion de capacidades generales.
- Riesgo de alucinacion inherente a los modelos de 7B, agravado por la falta de evaluacion publicada.
- Solo se publica una cuantizacion (Q4_K_M); no hay versiones en FP16, Q8_0 ni Q5_K_M para comparar perdida de calidad.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado en este ajuste.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso ni validacion por la comunidad.
- El tag `endpoints_compatible` no garantiza compatibilidad con todas las APIs; debe probarse el servidor concreto.
- La mencion a `llama-mtmd-cli` en la model card es confusa: no se incluyen pesos multimodales, por lo que no debe esperarse capacidad de vision.

## Enlaces

- HuggingFace: https://huggingface.co/khaleddiab/research-assistant-7b-GGUF
- Unsloth (herramienta de ajuste fino y conversion): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
