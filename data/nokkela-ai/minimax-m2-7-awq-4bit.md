# nokkela-ai/MiniMax-M2.7-AWQ-4bit

## Resumen

MiniMax-M2.7-AWQ-4bit es una cuantizacion de 4 bits del modelo MiniMax-M2.7 desarrollado por MiniMaxAI, publicada por el usuario nokkela-ai (asociado al proyecto cyankiwi). Se trata de un transformer de 36.811.839.984 parametros totales (aproximadamente 36,8 mil millones) destinado a generacion de texto y conversacion, distribuido en formato safetensors bajo la libreria transformers con codigo personalizado (arquitectura `minimax_m2`).

El modelo resuelve el problema de desplegar un LLM de gran tamano en infraestructura con recursos limitados de VRAM: la cuantizacion AWQ (Activation-aware Weight Quantization) a 4 bits reduce el peso del repositorio a 130,5 GB, lo que permite su ejecucion en GPUs de gama alta para centros de datos o configuraciones multi-GPU consumer, algo inviable con los pesos en precision completa.

Es relevante porque la tecnica AWQ preserva mejor la calidad que una cuantizacion ingenua al ponderar los canales de activacion mas importantes durante la calibracion, y porque emplea el ecosistema `llm-compressor` junto con `compressed-tensors`, lo que facilita su integracion con motores de inferencia modernos como vLLM. La licencia es "other" y remite al repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `minimax_m2` (codigo personalizado, `custom_code`) |
| Parametros totales | 36.811.839.984 (~36,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ 4 bits (compressed-tensors); calibracion con nvidia/Llama-Nemotron-Post-Training-Dataset |
| Idiomas soportados | no disponible |
| Licencia | other (enlace a la licencia del modelo base MiniMax-M2.7) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base MiniMax-M2.7 mas alla de su identificador de arquitectura (`minimax_m2`) y de que requiere `trust_remote_code` (tag `custom_code`). No se especifica si emplea atencion lineal, mixture-of-experts, SSM hibrido u otra variante, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF/DPO. Estos datos deben consultarse en la model card del modelo base MiniMaxAI/MiniMax-M2.7.

Lo que si es documentable es el proceso de cuantizacion de esta variante: se genero con `llm-compressor` aplicando AWQ a 4 bits, usando el dataset `nvidia/Llama-Nemotron-Post-Training-Dataset` como conjunto de calibracion. AWQ escala los pesos por canal segun la magnitud de las activaciones, de modo que los canales mas relevantes para la salida conservan mayor precision efectiva. El resultado es un repositorio de 130,50 GB con pesos en formato `compressed-tensors`, compatible con `transformers` y con el tag `endpoints_compatible`.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base MiniMax-M2.7, si bien no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta poblado).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`) y con `compressed-tensors`.

## Casos de uso

- Despliegue en servidores con VRAM limitada: la cuantizacion AWQ a 4 bits reduce el peso a 130,5 GB, lo que permite servir el modelo en nodos multi-GPU (por ejemplo, 2x80 GB) donde los pesos en BF16 no caberian con holgura.
- Generacion de codigo asistida en IDE o CI/CD: al ser un modelo conversacional de ~36,8 B, puede integrarse en pipelines de revision de codigo y generacion de tests, siempre que se valide la calidad tras la cuantizacion.
- Chatbots de atencion al cliente: el formato conversacional y el soporte de transformers permiten montar servicios multi-turno; la longitud de contexto real debe confirmarse en la model card del modelo base.
- Prototipado e investigacion: util para equipos que quieran evaluar el comportamiento de MiniMax-M2.7 en un entorno de bajo coste de memoria antes de comprometerse con la version completa.
- Fine-tuning ligero o evaluacion comparativa: sirve como referencia cuantizada para medir la degradacion frente al modelo base en tareas concretas.
- Inferencia por lotes (batch offline): el formato compressed-tensors y la compatibilidad con vLLM permiten procesar volumenes grandes de peticiones en GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base, y tampoco se documenta la degradacion introducida por la cuantizacion AWQ a 4 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 130,5 GB, por lo que se requiere al menos ese espacio en VRAM para cargar los pesos completos; con overhead de KV cache y activaciones, conviene reservar margen adicional.
- GPU recomendadas: configuraciones multi-GPU de datacenter (varias A100 80 GB o H100 80 GB) para servir el modelo completo.
- Cabe en consumer GPU: no en una sola GPU consumer; seria necesario repartir entre varias (por ejemplo, 2x RTX 4090 de 24 GB no bastan por el tamano total; se requeriria un numero mayor o cuantizacion adicional).
- Opciones de despliegue: transformers (con `trust_remote_code`), vLLM (soporte de compressed-tensors/AWQ), y potencialmente otros motores compatibles con AWQ; llama.cpp/Ollama no estan confirmados para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M2.7-AWQ-4bit (este) | ~36,8 B | no disponible | AWQ 4 bits | other | Hugging Face |
| MiniMaxAI/MiniMax-M2.7 (base) | no disponible | no disponible | BF16 (presumible) | other | Hugging Face |
| Alternativas de ~30-40 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre modelos comparables de la misma categoria en la informacion proporcionada para establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- La cuantizacion AWQ a 4 bits puede introducir degradacion de calidad respecto al modelo base; no se documenta la magnitud de esa perdida.
- No se especifican sesgos conocidos del modelo base en la informacion disponible.
- Riesgo de alucinacion inherente a los LLM; no se aportan evaluaciones especificas.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Licencia "other": es imprescindible revisar el enlace de licencia del modelo base (github.com/MiniMax-AI/MiniMax-M2.7/blob/main/LICENSE) antes de cualquier uso comercial.
- El modelo requiere `trust_remote_code` (codigo personalizado), lo que implica ejecutar codigo del autor; conviene auditar el repositorio en entornos de produccion.
- El autor del repositorio es un tercero (nokkela-ai / cyankiwi), no MiniMaxAI; la responsabilidad de validacion recae en el usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokkela-ai/MiniMax-M2.7-AWQ-4bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M2.7
- Licencia del modelo base: https://github.com/MiniMax-AI/MiniMax-M2.7/blob/main/LICENSE
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/Llama-Nemotron-Post-Training-Dataset
- Web del autor de la cuantizacion: https://cyan.kiwi/
- Perfil del autor en Hugging Face: https://huggingface.co/cyankiwi
