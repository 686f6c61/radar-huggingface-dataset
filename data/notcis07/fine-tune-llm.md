# NotCis07/fine-tune-llm

## Resumen

fine-tune-llm es un modelo de lenguaje conversacional publicado por el usuario NotCis07 en HuggingFace. Se trata de un fine-tune del modelo Qwen2.5-1.5B-Instruct, convertido a formato GGUF mediante la herramienta Unsloth. El repositorio contiene un unico archivo de pesos cuantizado en Q4_K_M, lo que reduce el peso del modelo a aproximadamente 1 GB y facilita su despliegue en entornos con recursos limitados.

El modelo conserva la arquitectura transformer decoder-only de la familia Qwen2, con aproximadamente 1.540 millones de parametros totales segun los datos de safetensors del repositorio. Al derivar de Qwen2.5-1.5B-Instruct, hereda las capacidades conversacionales e instructivas del modelo base, aunque no se documentan en la model card los detalles concretos del dataset de fine-tuning ni los objetivos del ajuste.

La relevancia de este modelo es limitada y practica: sirve como ejemplo de flujo de trabajo de fine-tuning con Unsloth y conversion a GGUF para ejecucion en llama.cpp u Ollama. No dispone de benchmarks publicados, licencia declarada ni documentacion sobre idiomas soportados, por lo que su evaluacion en produccion requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el repositorio base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con atencion causal estandar y mecanismos de atencion con RoPE propios de la familia Qwen2. El proceso de ajuste se realizo con Unsloth, segun indica la model card, y posteriormente se convirtio a GGUF para su uso con llama.cpp. La model card menciona que el entrenamiento fue "2x mas rapido con Unsloth", pero no detalla el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT.

No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). El unico archivo publicado es `Qwen2.5-1.5B-Instruct.Q4_K_M.gguf`, lo que sugiere que el fine-tuning partio del checkpoint instructivo de Qwen2.5-1.5B y se cuantizo directamente a Q4_K_M sin publicar otras variantes.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento basico e instrucciones en formato chat (soporte de plantilla Jinja mediante `--jinja` en llama.cpp).
- Soporte de tool calling y function calling: no disponible en la documentacion proporcionada, aunque el modelo base Qwen2.5-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este fine-tune.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles. La model card menciona `llama-mtmd-cli` para modelos multimodales, pero no confirma que este modelo lo sea.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al pesar aproximadamente 1 GB en Q4_K_M, el modelo puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada, lo que permite iterar sobre prompts y plantillas de chat en local.
- Despliegue en entornos con recursos limitados: util para demos, pruebas de integracion o entornos de desarrollo donde no se dispone de GPU de gama alta, usando llama.cpp u Ollama.
- Evaluacion de pipelines de fine-tuning: sirve como referencia practica del flujo Unsloth + GGUF para equipos que quieran replicar el proceso con sus propios datos.
- Generacion de texto offline: al no requerir conexion a servicios en la nube, puede emplearse en escenarios de privacidad donde los datos no deben salir del dispositivo.
- Chatbot de soporte basico en aplicaciones embebidas: con contexto corto y respuestas simples, puede integrarse en herramientas internas o asistentes de documentacion.
- Experimentacion educativa: útil para ensenar cuantizacion GGUF, plantillas Jinja y ejecucion con llama.cpp en cursos de IA aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB con cuantizacion Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli -hf NotCis07/fine-tune-llm --jinja`), Ollama mediante el Modelfile incluido, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| fine-tune-llm (este) | 1,54 B | no disponible | no disponible | GGUF Q4_K_M | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica de Qwen) | safetensors, GGUF | HuggingFace |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | HuggingFace |

La comparativa se limita a datos publicos de los modelos base; no se dispone de benchmarks del fine-tune para comparar rendimiento real.

## Limitaciones y advertencias

- No se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. Es un riesgo critico para produccion.
- No se documentan los datos de fine-tuning, por lo que se desconocen sesgos introducidos durante el ajuste.
- Riesgo de alucinacion inherente a modelos de 1,5 B de parametros, especialmente en tareas de conocimiento factual.
- Longitud de contexto no confirmada para este checkpoint; no asumir la ventana del modelo base sin verificacion.
- Idiomas soportados no documentados; el rendimiento en castellano no esta garantizado.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion por parte de la comunidad.
- La model card menciona `llama-mtmd-cli` para modelos multimodales, pero no confirma que este modelo tenga capacidades de vision; tratarlo como modelo solo de texto.
- Al ser un fine-tune no verificado, conviene evaluar su comportamiento con un conjunto de pruebas propio antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NotCis07/fine-tune-llm
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
