# mdcreativeagent/Llama-3.1-8B-Lexi-Uncensored-V2

## Resumen

Llama-3.1-8B-Lexi-Uncensored-V2 es un ajuste fino (fine-tune) del modelo Llama-3.1-8B-Instruct de Meta, publicado por el usuario mdcreativeagent en Hugging Face. El modelo se presenta como una variante "sin censura" (uncensored) y altamente complaciente con las peticiones del usuario, lo que en la practica significa que se han relajado o eliminado las capas de alineamiento y rechazo que caracterizan al modelo base. La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso de 8.030.261.248 parametros con una longitud de contexto de 32.768 tokens.

El modelo resuelve un problema concreto: ofrecer una variante de Llama 3.1 8B que no rechace peticiones por motivos de seguridad, pensada para entornos de investigacion, generacion creativa sin restricciones o experimentacion con alineamiento. La model card indica explicitamente que es "highly compliant with any requests, even unethical ones" y recomienda implementar una capa de alineamiento propia antes de exponerlo como servicio.

Es relevante ahora porque los fine-tunes "uncensored" de modelos abiertos de 8B son un nicho activo en la comunidad, y este se apoya en la base solida de Llama 3.1 (contexto largo, licencia permisiva con restricciones). No obstante, las descargas y likes son cero en el momento de la consulta, y los benchmarks declarados (media de 27,93 en el Open LLM Leaderboard) estan por debajo del modelo base en tareas de razonamiento, lo que sugiere un deterioro del rendimiento tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la model card menciona F16, Q8 y Q4 como recomendaciones de uso) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B-Instruct: un transformer decoder-only denso con atencion por grupos (GQA), activacion SwiGLU, normalizacion RMSNorm y embeddings rotatorios (RoPE). El tamano de 8.030.261.248 parametros coincide con el del modelo base, lo que confirma que no se ha modificado la topologia, solo los pesos mediante fine-tuning.

La informacion disponible no detalla el dataset de fine-tuning, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO. La model card solo indica que la V2 es "mas complaciente" y "mas inteligente" que la V1, y recomienda un system prompt del tipo "Think step by step with a logical reasoning and intellectual sense before you provide any response" para obtener mejores respuestas. Tambien advierte de que la cuantizacion Q4 puede reintroducir rechazos (refusal issues), probablemente por perdida de la senal del fine-tune, y sugiere usar F16 o Q8. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en el formato de chat de Llama 3.1.
- Razonamiento paso a paso si se le induce mediante system prompt.
- Generacion de codigo y matematicas basicas (heredadas del modelo base, aunque con rendimiento degradado segun los benchmarks).
- Alta complacencia: responde a peticiones que el modelo base rechazaria, incluidas las eticas o sensibles.
- Soporte del template oficial de Llama 3.1 Instruct; requiere tokens de sistema presentes en la inferencia.
- Capacidades multilingues: no documentadas especificamente en la informacion disponible (el modelo base soporta varios idiomas, pero el fine-tune no declara idiomas).
- No se documenta soporte explicito de tool calling, function calling ni modo agente en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de estudio de un fine-tune que elimina las capas de rechazo, util para medir como varian las respuestas y que riesgos aparecen al desalinear un modelo de 8B.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin los filtros del modelo base, con la advertencia de revisar el contenido producido.
- Pruebas de robustez y red teaming: usar el modelo como "atacante" o generador de prompts adversarios para evaluar sistemas de moderacion propios.
- Entornos de investigacion controlados: experimentacion con tecnicas de re-alineamiento (DPO, RLHF) partiendo de un modelo ya desalineado, comparando la dificultad de recuperar comportamientos seguros.
- Generacion de datos sinteticos para entrenamiento: produccion de corpus diversos y sin filtros que luego se curan y moderan antes de usarse en otros pipelines.
- Despliegue local en hardware de consumo: al ser un 8B, cabe en GPUs de 16-24 GB en cuantizacion Q8 o F16, lo que permite experimentar en estaciones de trabajo sin infraestructura de datacenter.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (Open LLM Leaderboard), sin verificacion independiente (`verified: false`):

| Metrica | Valor |
|---|---|
| Avg. | 27,93 |
| IFEval (0-shot) | 77,92 |
| BBH (3-shot) | 29,69 |
| MATH Lvl 5 (4-shot) | 16,92 |
| GPQA (0-shot) | 4,36 |
| MuSR (0-shot) | 7,77 |
| MMLU-PRO (5-shot) | 30,90 |

No se han publicado en la informacion disponible resultados comparativos con el modelo base ni con otros fine-tunes en la misma tabla; los valores de BBH, GPQA y MuSR son notablemente bajos para un modelo de 8B, lo que sugiere deterioro del razonamiento tras el ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en F16 (pesos de 8B a 2 bytes por parametro), 8-9 GB en Q8, 4-5 GB en Q4.
- GPU recomendadas: A100 40/80 GB o H100 para F16 con contexto largo; RTX 4090 (24 GB) para F16 o Q8; RTX 3090/4080 (16-24 GB) para Q8.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y similares con 16 GB o mas en Q8; en Q4 cabria en GPUs de 8 GB, aunque el autor advierte de problemas de rechazo en Q4.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documenta soporte explicito de vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Lexi-Uncensored-V2 | 8,03 B | 32.768 | Llama 3.1 | Fine-tune uncensored; benchmarks declarados con media 27,93 |
| Llama-3.1-8B-Instruct (base) | 8,03 B | 128.000 | Llama 3.1 | Modelo original de Meta, alineado; contexto mayor |
| Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 | 8,03 B | 32.768 | Llama 3.1 | Modelo original del que deriva este repositorio (mismo nombre, otro autor) |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo sin alineamiento: responde a peticiones eticas o sensibles; el autor recomienda implementar una capa de alineamiento propia antes de exponerlo como servicio.
- Riesgo elevado de contenido danino, sesgado o inapropiado; la responsabilidad del contenido generado recae en el usuario.
- Alucinacion: los benchmarks de razonamiento (GPQA 4,36, MuSR 7,77) indican un rendimiento bajo en tareas que requieren conocimiento factual y razonamiento multi-paso, lo que aumenta el riesgo de respuestas incorrectas.
- Deterioro del rendimiento respecto al modelo base en BBH, GPQA y MuSR.
- La cuantizacion Q4 puede reintroducir rechazos y degradar el comportamiento del fine-tune; se recomienda F16 o Q8.
- Licencia Llama 3.1: permite uso comercial con restricciones (clausula de usuarios mensuales, atribucion, politicas de uso aceptable); no es una licencia de codigo abierto plena.
- Idiomas soportados no declarados; el comportamiento multilingue no esta documentado.
- Repositorio con cero descargas y cero likes: sin validacion comunitaria ni garantias de mantenimiento.
- La model card apunta a resultados del Open LLM Leaderboard de otro repositorio (Orenguteng), lo que sugiere que este es una re-subida o derivado; conviene verificar la procedencia de los pesos.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mdcreativeagent/Llama-3.1-8B-Lexi-Uncensored-V2
- Repositorio original referenciado: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Resultados detallados del leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/details_Orenguteng__Llama-3.1-8B-Lexi-Uncensored-V2
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Mirror en Greytechai: https://huggingface.co/Greytechai/Llama-3.1-8B-Lexi-Uncensored-V2
- Ficha en Featherless AI: https://featherless.ai/models/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
