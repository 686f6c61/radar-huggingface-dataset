# AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF

## Resumen

Ternary-Bonsai-2.5-27B-Uncensored-GGUF es una cuantizacion ternaria (PTQ1_0, pesos de tres niveles) del modelo Bonsai 2.5 de 27B, publicada por AtomicChat sobre el trabajo original de PrismML. El modelo base, Ternary-Bonsai-2.5-27B-GGUF, emplea una representacion ternaria (-1, 0, +1) con escalas de bloque en FP16, lo que reduce drasticamente el peso en disco frente a una cuantizacion de 4 bits convencional. El archivo principal, `Ternary-Bonsai-2.5-27B-Uncensored-PTQ1_0.gguf`, ocupa 5.993.834.848 bytes (aproximadamente 5,99 GB) y se carga mediante el fork de llama.cpp de PrismML.

La particularidad de esta publicacion es que AtomicChat ha aplicado un "bake" compacto: modifica 12.461.746 codigos ternarios en 36 matrices residuales (capas 27 a 44) para eliminar el comportamiento de rechazo del modelo original, manteniendo intactos la cabecera del GGUF, las escalas de bloque FP16 y todos los bytes fuera de esas matrices. El resultado es un modelo "uncensored" que, segun la model card, pasa de 24/24 a 0/24 en un conjunto de 24 prompts de rechazo, sin degradar MMLU (81,2% frente a 80,2% del original en una muestra de 500 preguntas).

El modelo resuelve el problema de desplegar un LLM de 27B en hardware de consumo con una huella de disco inferior a 6 GB, a costa de una perdida de calidad asociada a la cuantizacion ternaria. Es relevante porque demuestra que el ajuste fino de comportamiento (eliminacion de rechazos) puede realizarse directamente sobre los codigos ternarios sin reentrenar el modelo ni anadir un adaptador en tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); pesos cuantizados en formato ternario PTQ1_0 |
| Parametros totales | 27B (nominal, segun el nombre del modelo); el campo `safetensors` del repo indica 2.162.688, valor no representativo del modelo completo |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | PTQ1_0 (ternaria, 3 niveles con escalas de bloque FP16); LoRA en GGUF de 8,67 MB como alternativa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Bonsai 2.5 (tipo de atencion, numero de capas, dimension oculta o composicion del dataset de entrenamiento). La model card solo indica que se trata de un modelo de 27B con pesos cuantizados de forma ternaria mediante el esquema PTQ1_0, que representa cada peso con tres valores posibles y una escala compartida por bloque en FP16. El archivo resultante pesa 5,99 GB, lo que implica una media de aproximadamente 1,78 bits por parametro incluyendo escalas y metadatos.

La innovacion tecnica de esta publicacion concreta es el "compact bake": en lugar de distribuir el ajuste de comportamiento como un adaptador LoRA en tiempo de inferencia, AtomicChat ha integrado la proyeccion residual directamente en los codigos ternarios de 36 matrices de las capas 27 a 44. El proceso preserva la cabecera del GGUF y todas las escalas FP16, y solo altera los codigos ternarios de esas matrices. El repositorio incluye tambien el adaptador LoRA equivalente (8,67 MB) para usar con el PTQ1_0 original de PrismML a escala 1.25. No se documentan datos sobre RLHF, DPO ni volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional en formato chat (`-cnv` en llama.cpp).
- Comportamiento "uncensored": segun la model card, 0/24 rechazos en un conjunto de 24 prompts de rechazo, frente a 24/24 del modelo original.
- Razonamiento y conocimiento general medido con MMLU (81,2% en una muestra de 500 preguntas).
- Capacidad multilingue: no documentada; no disponible.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Despliegue local en equipos de consumo: con un archivo de 5,99 GB, el modelo cabe en GPUs consumer con 8 GB de VRAM o en CPU con suficiente RAM, lo que permite ejecutar un LLM de 27B en portatiles y estaciones de trabajo sin GPU dedicada de gama alta.
- Experimentacion con cuantizacion ternaria: util para investigadores que quieran evaluar el impacto de PTQ1_0 en calidad frente a Q4_K_M o Q8_0 sobre el mismo modelo base, usando el fork de PrismML de llama.cpp.
- Generacion creativa sin filtros: el ajuste elimina los rechazos en dominios sensibles, lo que resulta adecuado para escritura de ficcion, guiones o role-play donde los rechazos del modelo base interrumpen la generacion.
- Prototipado offline en aplicaciones de escritorio: Atomic Chat distribuye una app que ejecuta modelos open-weight localmente; este GGUF se integra directamente en ese flujo sin conexion.
- Evaluacion de tecnicas de edicion de pesos: el "compact bake" sobre codigos ternarios es un caso de estudio reproducible (12.461.746 codigos modificados en 36 matrices) para quienes investigan edicion de conocimiento y modificacion de comportamiento en modelos cuantizados.
- Fine-tuning ligero mediante LoRA: el adaptador de 8,67 MB demuestra que es posible ajustar comportamiento sobre un modelo ternario sin reentrenar los pesos base, lo que abre la puerta a adaptaciones por dominio con recursos minimos.
- Servicio de chat en CPU con llama.cpp: al no requerir GPU, puede desplegarse en servidores sin acelerador para cargas de baja concurrencia.

## Benchmarks y rendimiento

| Benchmark | Compact PTQ1_0 (este repo) | PTQ1_0 original | LoRA a escala 1.25 |
|---|---|---|---|
| MMLU (muestra de 500) | 406/500 (81,2%) | 401/500 (80,2%) | 401/500 (80,2%) |
| Refusal screen (24 prompts de rechazo) | 0/24 | 24/24 | No disponible |
| Prompts ordinarios (24) | 0/24 rechazos | 0/24 rechazos | No disponible |

En preguntas emparejadas, el build compacto gano 10 respuestas correctas y perdio 5 respecto al original (McNemar exacto, p = 0,30). No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la informacion disponible. Las 48 respuestas del build compacto fueron no vacias y no degeneradas; el limite de 48 tokens trunco 24/24 y 23/24 respuestas respectivamente, por lo que las clasificaciones corresponden a respuestas de apertura.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB para el archivo PTQ1_0 completo, mas overhead del contexto KV cache (dependiente de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A100, H100). El modelo es lo bastante pequeno para caber en GPUs de gama media.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas. Con 6 GB de pesos, tambien es viable en GPUs de 8 GB con contexto moderado.
- Opciones de despliegue: llama.cpp mediante el fork de PrismML (release `prism-b12128-d7b2896`), con `llama-cli -m ... -ngl 99 -cnv`. No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles. La cuantizacion ternaria con escalas de bloque puede beneficiarse de kernels especificos del fork de PrismML, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-Uncensored (este) | 27B | No disponible | PTQ1_0 ternaria, 5,99 GB | Apache 2.0 | Hugging Face, llama.cpp fork PrismML |
| Ternary-Bonsai-2.5-27B (PrismML, original) | 27B | No disponible | PTQ1_0 ternaria, 5,99 GB | Apache 2.0 (segun este repo) | Hugging Face |
| Ternary-Bonsai-2.5-27B-Uncensored-LoRA | 27B | No disponible | PTQ1_0 + LoRA 8,67 MB | Apache 2.0 | Hugging Face |

No se dispone de informacion sobre otros modelos ternarios comparables (por ejemplo, BitNet b1.58 o variantes de la familia Qwen) en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio Bonsai 2.5.

## Limitaciones y advertencias

- La cuantizacion ternaria PTQ1_0 implica una perdida de calidad frente al modelo en FP16/BF16 original; no se publican comparaciones contra el modelo sin cuantizar.
- El ajuste "uncensored" elimina los rechazos, pero puede aumentar el riesgo de generar contenido danino, sesgado o inexacto en dominios sensibles. No se documentan evaluaciones de seguridad posteriores al bake.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion.
- No se documentan los idiomas soportados ni el rendimiento fuera del ingles; el uso en castellano no esta verificado.
- La longitud de contexto no esta disponible, lo que impide planificar cargas con ventanas largas.
- El modelo requiere el fork de PrismML de llama.cpp; no es compatible con llama.cpp upstream, Ollama, vLLM ni TGI segun la informacion disponible.
- El campo `safetensors` del repo (2.162.688) no refleja el tamano real del modelo y puede confundir a herramientas automaticas.
- La licencia Apache 2.0 permite uso comercial, pero el caracter "uncensored" traslada al desplegador la responsabilidad sobre el contenido generado.
- Las evaluaciones publicadas se basan en muestras pequenas (500 preguntas de MMLU, 24 prompts de rechazo) y en respuestas truncadas a 48 tokens, por lo que la significacion estadistica es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-GGUF
- Modelo base (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Variante LoRA: https://huggingface.co/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF
- Metricas y checksums del LoRA: https://huggingface.co/datasets/AtomicChat/Ternary-Bonsai-2.5-27B-Uncensored-LoRA-GGUF-metrics
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b12128-d7b2896
- Guia para ejecutar Bonsai 2.5 Uncensored localmente: https://atomic.chat/blog/guides/how-to-run-bonsai-2-5-uncensored-locally
- Guia del Bonsai 2.5 original: https://atomic.chat/blog/guides/how-to-run-bonsai-2-5-locally
- Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
