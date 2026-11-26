# mr-andrey-isachenko/Tenet-Qwen3-4B-Abliterated-Unslop-v2-GGUF

## Resumen
Tenet-Qwen3-4B-Abliterated-Unslop-v2-GGUF es una colección de cuantizaciones GGUF para llama.cpp del modelo Tenet-4B-Qwen3-Unslop-v2, un fine-tune del Qwen3-4B de Alibaba. El autor, mr-andrey-isachenko, aplica su técnica "Lancet" de cirugía de subespacios para eliminar el comportamiento de rechazo (de-refusal o "abliteration") y el estilo excesivamente servil o acartonado ("unslop") del modelo original. El resultado es un modelo de 4.022 millones de parámetros orientado a conversación, generación de código y uso agéntico con tool calling, sin las capas de rechazo típicas de los modelos alineados.

La relevancia de esta ficha no está en el modelo base —Qwen3-4B es un transformer denso de sobra conocido— sino en el método de cuantización. En lugar de aplicar un `llama-quantize` uniforme, el autor emplea una receta mixta guiada por CKA (Centered Kernel Alignment) que preserva a mayor precisión las capas donde vive el subespacio quirúrgico de la ablación, de modo que el comportamiento "desbloqueado" no reaparezca tras cuantizar a 4-6 bits. Es, por tanto, un caso de estudio interesante sobre cómo la cuantización puede degradar o reactivar propiedades inducidas por fine-tuning.

El repositorio ocupa 15,6 GB e incluye la escalera completa de cuantizaciones (IQ4_XS, Q4_K_M, Q5_K_M, Q6_K y Q8_0), con un bitrate medio estimado de 5,074 bpw. La licencia es Apache 2.0 y los pesos están en formato GGUF, listos para Ollama, llama.cpp, LM Studio y Jan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama-cli usa `-c 16384`) |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (receta mixta CKA) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo es un transformer denso de 4.022 millones de parámetros derivado de Qwen3-4B. Sobre esa base, el autor aplica el pipeline "Lancet", una cirugía de subespacios que elimina direcciones de activación asociadas al rechazo y al estilo "slop", seguida de un fine-tune "Unslop v2". No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada.

La innovación técnica destacable está en la cuantización. La receta `cka_quant_recipe.json` protege a Q8_0 las capas 0, 12, 13, 15, 17 y 35, y a Q6_K las capas 9, 11, 20 y 22, que corresponden al subespacio quirúrgico seleccionado (capas 9, 11, 12, 13, 15, 17, 20 y 22). El resto de capas se cuantiza a menor precisión, alcanzando un bitrate medio estimado de 5,074 bpw. El objetivo declarado es que la supresión del rechazo no se filtre de nuevo al bajar de 4-6 bits, algo que sí ocurriría con una cuantización uniforme del mismo tamaño medio.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento matemático y de sentido común (GSM8K estricto 0,89; MATH-500 0,70).
- Generación y asistencia de código, con soporte de tool calling y flujos agénticos según los tags del repositorio.
- Seguimiento de instrucciones (IFEval estricto 0,81; instrucción estricta 0,86).
- Comportamiento "desbloqueado": ausencia deliberada de rechazos ante peticiones que un modelo alineado estándar declinaría.
- Compatibilidad con endpoints y clientes que consumen la API de llama.cpp/Ollama.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Asistente conversacional autoalojado en portátil: con Q4_K_M (2,60 GB) cabe en GPUs de consumo con 6-8 GB de VRAM y permite conversaciones multi-turno locales sin depender de la nube.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y el tamaño reducido permiten integrarlo como agente de revisión o generación de parches en entornos con recursos limitados.
- Investigación sobre alineación y ablación: sirve como contrapunto controlado frente a Qwen3-4B original para estudiar cómo el de-refusal afecta a las respuestas en tareas de seguridad y evaluación de sesgos.
- Prototipado de agentes con function calling: el modelo puede encadenar llamadas a herramientas en local antes de desplegar una versión mayor, gracias a su bajo coste de inferencia.
- Fine-tuning posterior sobre dominio específico: al estar en GGUF y Apache 2.0, se puede usar como base para LoRA o para experimentar con recetas de cuantización propias.
- Evaluación de recetas de cuantización: el repositorio incluye la receta CKA, lo que permite reproducir y comparar el efecto de la cuantización mixta frente a la uniforme en modelos quirúrgicamente modificados.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse con llama.cpp u Ollama en hardware propio, los datos no salen del equipo.

## Benchmarks y rendimiento
Resultados medidos por el autor sobre el checkpoint FP8 del modelo padre; según la model card, la escalera de cuantización CKA los mantiene dentro del ruido de medida.

| Benchmark | Score |
|---|---|
| IFEval (strict) | 0,81 |
| IFEval (instruction strict) | 0,86 |
| MATH-500 | 0,70 |
| GSM8K (strict) | 0,89 |
| GPQA Diamond | 0,34 |
| MMLU-Pro | 0,56 |

No se han publicado resultados de benchmarks adicionales (HumanEval, MMLU estándar, latencia o throughput) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,5 GB para IQ4_XS, 2,7 GB para Q4_K_M, 3,1 GB para Q5_K_M, 3,5 GB para Q6_K y 4,4 GB para Q8_0, más el espacio de caché KV según el contexto configurado.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para las cuantizaciones bajas; RTX 3060/4060, RTX 4090, A100 o H100 para contextos largos o mayor concurrencia.
- Cabe en GPU de consumo: sí, desde una GTX 1660 de 6 GB con IQ4_XS o Q4_K_M; con Q8_0 conviene disponer de 8 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y Jan. El repositorio incluye ejemplos de Ollama y llama-cli.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-Qwen3-4B-Abliterated-Unslop-v2-GGUF | 4,02 B | no disponible | Apache 2.0 | GGUF | Abliterado y "unslop", cuantización CKA mixta |
| Qwen/Qwen3-4B | 4,02 B | no disponible en la fuente | Apache 2.0 | safetensors, GGUF | Modelo base alineado, con rechazos estándar |
| Tenet-4B-Qwen3-Unslop-v2 | 4,02 B | no disponible | Apache 2.0 | safetensors (FP8) | Checkpoint padre sin cuantizar del que derivan estos GGUF |

La comparación con otros modelos abliterados de 4B (por ejemplo, variantes de Llama 3.2 3B o Gemma 3 4B) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- El modelo ha sido sometido a ablación deliberada del rechazo: puede producir contenido dañino, ilegal o inseguro sin las salvaguardas habituales. No es adecuado para aplicaciones orientadas al público sin filtros externos.
- Riesgo de alucinación inherente a un modelo de 4B; los benchmarks de GPQA Diamond (0,34) y MMLU-Pro (0,56) indican un conocimiento factual limitado.
- Los benchmarks publicados los ha medido el propio autor, no un tercero independiente, y no se especifican detalles de la metodología de evaluación.
- La receta de cuantización CKA está pensada para preservar el comportamiento quirúrgico; desviarse de ella (por ejemplo, con cuantizaciones uniformes propias) puede reactivar el rechazo o degradar el estilo.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado por un modelo sin alineación de seguridad.
- Idiomas soportados y longitud de contexto oficial no están documentados en la información disponible; conviene validar ambos antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en despliegues reales.

## Enlaces
- Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-Qwen3-4B-Abliterated-Unslop-v2-GGUF
- Modelo base (checkpoint padre): https://huggingface.co/mr-andrey-isachenko/Tenet-4B-Qwen3-Unslop-v2
- Modelo original Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Receta de cuantización CKA: `cka_quant_recipe.json` incluido en el repositorio de Hugging Face
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Jan: https://jan.ai
