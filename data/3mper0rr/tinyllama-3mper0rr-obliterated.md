# 3MPER0RR/TinyLlama-3MPER0RR-obliterated

## Resumen

TinyLlama-3MPER0RR-obliterated es una variante experimental del modelo TinyLlama-1.1B-Chat-v1.0, publicada por el usuario 3MPER0RR en Hugging Face. Se trata de una modificacion de tipo "abliterated" (ablacion de direcciones de rechazo) sobre el checkpoint conversacional original de TinyLlama, un transformer decoder-only de 1.100.048.384 parametros (aproximadamente 1,1 mil millones) entrenado originalmente por el equipo TinyLlama sobre el corpus SlimPajama.

El modelo conserva la arquitectura y el tamano del base, por lo que mantiene las caracteristicas de TinyLlama: contexto de 2048 tokens, atencion con RoPE, normalizacion RMSNorm y activacion SwiGLU. La modificacion aplicada por el autor no viene acompanada de documentacion tecnica detallada; la model card se limita a describir el proceso como "experimental" y orientado a investigacion, sin especificar la metodologia exacta de ablacion ni el dataset utilizado para el ajuste posterior.

Su relevancia es acotada: sirve como banco de pruebas para estudiar el efecto de las tecnicas de abliteration en modelos pequenos, asi como para experimentar con inferencia de bajo coste en hardware consumer. No debe considerarse un modelo listo para produccion dado el caracter experimental del ajuste y la ausencia de evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Llama), con RoPE, RMSNorm y SwiGLU |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada de TinyLlama-1.1B-Chat-v1.0) |
| Tipos de cuantizacion | safetensors en el repo principal; version GGUF Q8_0 publicada por el autor |
| Idiomas soportados | no disponible (la model card no los declara; el base esta entrenado mayoritariamente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF Q8_0 (repo secundario) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only con 22 capas, dimension oculta de 2048, 32 cabezas de atencion (4 cabezas KV por grupo, GQA), FFN con SwiGLU de dimension intermedia 5632 y vocabulario de 32.000 tokens. El modelo base fue preentrenado sobre aproximadamente 3 billones de tokens de SlimPajama y posteriormente ajustado con instrucciones y preferencias (SFT + DPO) para la variante Chat.

Sobre ese checkpoint, el autor aplica un proceso de "abliteration" no documentado en detalle. La tecnica habitual consiste en identificar las direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y proyectarlas fuera de los pesos de atencion y MLP, de forma que el modelo deja de activar respuestas de negativa ante peticiones que el modelo original rechazaria. La model card no especifica si se empleo un dataset de calibracion, cuantas capas se modificaron ni si hubo un ajuste posterior para recuperar capacidades. Tampoco se documenta el numero de tokens adicionales de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO tras la ablacion.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del ajuste de instrucciones de TinyLlama-1.1B-Chat.
- Razonamiento basico de un solo paso, limitado por el tamano de 1,1B parametros.
- Generacion de codigo sencillo y respuestas factuales de corta extension.
- Soporte de conversaciones multi-turno dentro de una ventana de 2048 tokens.
- Capacidad reducida de seguir instrucciones complejas o cadenas largas de razonamiento.
- No hay evidencia documentada de tool calling, function calling ni soporte de agentes.
- No dispone de vision, audio ni modo "thinking" explicito.
- Capacidades multilingues no declaradas; el base esta orientado principalmente al ingles.

## Casos de uso

- Investigacion sobre abliteration: el modelo permite comparar el comportamiento del checkpoint original frente a la variante modificada en tareas de rechazo, util para estudiar como afecta la ablacion a la utilidad general en modelos pequenos.
- Prototipado rapido de chatbots: con 1,1B parametros y cuantizacion Q8_0, se puede desplegar en una GPU consumer para validar flujos conversacionales antes de migrar a modelos mayores.
- Generacion de texto en entornos con recursos limitados: cabe en GPUs de 8 GB o incluso en CPU con llama.cpp, lo que facilita pruebas en portatiles y dispositivos embebidos.
- Evaluacion de sesgos y seguridad: al ser una variante sin rechazo, sirve como caso de estudio para medir la eficacia de los filtros de seguridad externos en pipelines de moderacion.
- Fine-tuning academico: su tamano reducido permite experimentar con LoRA o QLoRA en una sola GPU para tareas de dominio especifico (clasificacion, resumen, extraccion).
- Educacion y docencia: util para explicar el funcionamiento interno de un transformer Llama y el efecto de las tecnicas de edicion de pesos en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y tampoco se aportan comparaciones con el checkpoint original de TinyLlama.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 2,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 3-4 GB.
- VRAM estimada en Q8_0 (GGUF): aproximadamente 1,2 GB de pesos; cabe holgadamente en GPUs de 4 GB.
- VRAM estimada en Q4_K_M (si se genera a partir del base): alrededor de 0,7-0,9 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso iGPU con suficiente memoria compartida; A100/H100 no son necesarias.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp y Ollama para el GGUF Q8_0; vLLM, TGI y transformers para los pesos safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TinyLlama-3MPER0RR-obliterated | 1,1B | 2048 | apache-2.0 | safetensors, GGUF Q8_0 | Variante abliterated experimental, sin benchmarks |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 | apache-2.0 | safetensors, GGUF | Modelo base original, con ajuste SFT + DPO |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | apache-2.0 | safetensors, GGUF | Mayor contexto y mejor rendimiento general documentado |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | apache-2.0 | safetensors, GGUF | Alternativa moderna con evaluaciones publicadas |

## Limitaciones y advertencias

- Modelo experimental sin evaluacion publicada: no hay datos que permitan estimar su calidad frente al base ni frente a alternativas.
- La abliteration elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ofensivo o inseguro sin filtros externos.
- Riesgo elevado de alucinacion, acentuado por el tamano de 1,1B parametros y por la posible degradacion de capacidades tras la modificacion.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas no declarados; el rendimiento en castellano probablemente sea pobre al estar el base entrenado mayoritariamente en ingles.
- Licencia apache-2.0 permite uso comercial, pero el caracter experimental y la ausencia de garantias desaconsejan su uso en produccion sin auditoria previa.
- No se documenta la metodologia de ablacion, lo que impide reproducir el proceso o evaluar su impacto sistematicamente.
- El autor no ofrece soporte ni mantenimiento; el modelo se publica "para investigacion y experimentacion".

## Enlaces

- Repositorio principal: https://huggingface.co/3MPER0RR/TinyLlama-3MPER0RR-obliterated
- Version GGUF Q8_0: https://huggingface.co/3MPER0RR/TinyLlama-3MPER0RR-abliterated-Q8_0-GGUF
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
