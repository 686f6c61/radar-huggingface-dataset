# drakeluhlgu/ia-seduccion-gguf

## Resumen

ia-seduccion-gguf es un modelo de lenguaje conversacional derivado de Qwen2.5-3B-Instruct, afinado por el usuario drakeluhlgu y distribuido en formato GGUF para su uso con llama.cpp. El modelo parte de la base instructiva de Qwen2.5 de 3.000 millones de parametros, un transformer decoder-only de la familia Qwen2, y ha sido sometido a un fine-tuning adicional cuyo dataset y metodologia no se detallan en la model card. La conversion a GGUF se realizo con Unsloth, lo que sugiere un flujo de entrenamiento optimizado con LoRA o QLoRA y posterior exportacion a cuantizacion Q4_K_M.

El nombre del repositorio indica una especializacion en conversacion de seduccion, aunque no hay documentacion tecnica que describa el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El unico artefacto publicado es un fichero `Qwen2.5-3B-Instruct.Q4_K_M.gguf`, lo que limita la evaluacion a esa cuantizacion concreta. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 18 de noviembre de 2026.

La relevancia de esta ficha es doble: por un lado, documenta un caso tipico de fine-tuning comunitario sobre una base conocida (Qwen2.5-3B) con empaquetado GGUF listo para inferencia local; por otro, evidencia las lagunas de trazabilidad habituales en este tipo de publicaciones (sin licencia declarada, sin idiomas, sin benchmarks, sin pipeline), lo que condiciona seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, base Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como base de entrenamiento; el repo pesa 1,9 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y RoPE para el codificado posicional. La model card no aporta detalles sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni vocabulario, por lo que no se pueden confirmar desviaciones respecto a la configuracion estandar de Qwen2.5-3B.

El proceso de entrenamiento descrito se limita a indicar que el modelo fue afinado y convertido a GGUF usando Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se uso LoRA/QLoRA, la tasa de aprendizaje, el numero de epocas ni si hubo etapas de alineacion adicional (RLHF, DPO o similares). Tampoco se documenta ninguna innovacion tecnica propia mas alla del uso de Unsloth para acelerar el entrenamiento y la exportacion. La unica evidencia del pipeline es la presencia del fichero Q4_K_M y de un Modelfile de Ollama incluido en el repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones en formato chat (la model card menciona el flag `--jinja` para plantillas de chat).
- Soporte de tool calling y function calling: no confirmado para este fine-tuning; la base Qwen2.5-Instruct lo soporta, pero no hay evidencia de que se haya preservado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles; la base Qwen2.5 soporta varios idiomas, pero no se documenta el comportamiento tras el fine-tuning.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo es solo texto.
- Especializacion declarada por el nombre del repo: conversacion orientada a seduccion, sin documentacion tecnica que la respalde.

## Casos de uso

- Prototipado de chatbots conversacionales en local: al ser un GGUF Q4_K_M de 3 B, se puede cargar con llama.cpp u Ollama en equipos de consumo para experimentar con dialogos multi-turno sin depender de APIs externas.
- Evaluacion de fine-tunings comunitarios: sirve como caso de estudio para analizar como un ajuste sobre Qwen2.5-3B-Instruct altera el comportamiento conversacional y que trazabilidad ofrece el autor.
- Despliegue en entornos con recursos limitados: el tamano del fichero (1,9 GB en el repo) permite ejecutarlo en portatiles con GPU integrada o CPU, util para demos offline.
- Generacion de respuestas en aplicaciones de ocio o role-play: el nombre del modelo sugiere este uso, aunque sin benchmarks ni evaluacion de calidad no se puede garantizar un comportamiento adecuado.
- Base para nuevos fine-tunings: al estar en GGUF y derivar de una base conocida, puede servir como punto de partida para experimentos de cuantizacion o ajuste posterior (aunque para reentrenar habria que volver a safetensors).
- Pruebas de integracion con Ollama: el Modelfile incluido permite validar pipelines de despliegue local y comparar latencia con otras cuantizaciones de Qwen2.5-3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para el fichero Q4_K_M (1,9 GB de pesos mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionarian sin problema, aunque el modelo es demasiado pequeno para aprovechar GPUs de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas y en muchas integradas; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf drakeluhlgu/ia-seduccion-gguf --jinja`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ia-seduccion-gguf | 3,09 B | no disponible | no disponible | GGUF Q4_K_M | Fine-tuning comunitario sin documentacion |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 (Qwen) | safetensors, GGUF | Base oficial, con benchmarks publicados |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta con contexto largo |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | safetensors, GGUF | Alternativa de Microsoft orientada a razonamiento |

La comparativa se basa en caracteristicas publicas de las bases; no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion.
- Sin documentacion del dataset de entrenamiento: riesgo de sesgos desconocidos y de comportamientos no alineados derivados del corpus de fine-tuning.
- Riesgo de alucinacion: inherente a modelos de 3 B, agravado por la falta de evaluacion tras el ajuste.
- Contexto no confirmado: aunque la base Qwen2.5-3B-Instruct soporta 32.768 tokens, el fine-tuning podria haberlo reducido o degradado; no hay evidencia.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingue correcto.
- Especializacion no verificada: el nombre del repositorio sugiere un uso concreto (seduccion) sin ninguna evaluacion que lo respalde; podria tratarse de un fine-tuning con datos escasos o de baja calidad.
- 0 descargas y 0 likes: no hay senales de validacion por parte de la comunidad.
- Repositorio creado en 2026 y sin actualizaciones posteriores documentadas: posible abandono.
- El flag `--jinja` es necesario para usar la plantilla de chat; sin el, el formato de prompt puede no coincidir con el esperado por el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/drakeluhlgu/ia-seduccion-gguf
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- Qwen2.5-3B-Instruct (base): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
