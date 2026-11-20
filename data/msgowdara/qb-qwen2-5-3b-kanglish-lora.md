# msgowdara/qb-qwen2.5-3b-kanglish-lora

## Resumen

`msgowdara/qb-qwen2.5-3b-kanglish-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario `msgowdara`. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos de adaptacion que se aplican sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, desarrollado por Alibaba Qwen. El nombre sugiere un ajuste fino orientado al "Kanglish", una mezcla de kano (kannada) e ingles, aunque la model card no documenta explicitamente el corpus ni el objetivo del entrenamiento.

El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 3 mil millones de parametros. La libreria declarada es PEFT 0.22.0 y los pesos se distribuyen en formato safetensors. La model card es la plantilla por defecto de Hugging Face sin rellenar: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, hiperparametros, evaluacion) aparecen como "[More Information Needed]".

La relevancia de esta ficha es limitada pero real: sirve como ejemplo de adaptador linguistico de bajo coste sobre Qwen2.5-3B-Instruct, un modelo base pequeno, con licencia Apache 2.0 y contexto de 32 768 tokens, que permite desplegar ajustes especificos de dominio en hardware de consumo. Cualquier evaluacion seria del adaptador requiere, sin embargo, validacion empirica por parte del usuario, dado que no hay benchmarks ni documentacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | 3B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible en el adaptador; el base admite GPTQ, AWQ, GGUF, bitsandbytes |
| Idiomas soportados | no disponible; el nombre sugiere kanglish (kannada + ingles) |
| Licencia | no disponible en el adaptador; el base Qwen2.5-3B-Instruct es Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | PEFT 0.22.0, transformers |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se implementa con PEFT sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atencion causal, RoPE, normalizacion RMSNorm y activacion SwiGLU. Qwen2.5-3B-Instruct incorpora atencion con query/key/value bias, tokenizer BPE con vocabulario ampliado para multilingue y un contexto nativo de 32 768 tokens. El adaptador LoRA congela los pesos del base e inyecta matrices de baja dimension en las proyecciones de atencion y/o MLP, reduciendo el coste de entrenamiento a una fraccion del ajuste completo.

No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens, la composicion del corpus kanglish, el rango del adaptador, el alpha, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO adicionales. La unica referencia tecnica en la model card es la cita generica a Lacoste et al. (2019) sobre emisiones de carbono, que forma parte de la plantilla por defecto y no aporta datos reales. El entrenamiento se realizo presumiblemente con PEFT 0.22.0 y transformers, pero no se documentan hiperparametros ni infraestructura.

## Capacidades

- Generacion de texto conversacional en el idioma o mezcla de idiomas para el que fue ajustado (presumiblemente kanglish), heredando la base instruct de Qwen2.5.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 3B del modelo base.
- Generacion de codigo y matematicas a nivel de modelo pequeno, sin garantias especificas del adaptador.
- Soporte multilingue heredado de Qwen2.5 (chino, ingles, espanol, portugues, frances, aleman, arabe, ruso, coreano, japones, entre otros), aunque el adaptador puede degradar el rendimiento fuera del dominio kanglish.
- Tool calling y function calling: soportado por el base Qwen2.5-3B-Instruct, no verificado tras el ajuste LoRA.
- Capacidades de agente y razonamiento multi-paso: posibles pero no documentadas para este adaptador.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Prototipado de asistentes conversacionales en kanglish: el adaptador permite experimentar con un modelo de 3B que cabe en una GPU de consumo, ideal para validar la calidad linguistica antes de invertir en un ajuste mayor.
- Investigacion linguistica sobre code-switching kannada-ingles: util para estudiar como un modelo pequeno maneja la mezcla de idiomas en tareas de traduccion informal o normalizacion de texto.
- Generacion de respuestas en soporte al cliente para comunidades diasporicas: el modelo puede gestionar conversaciones multi-turno con contexto de 32 768 tokens, aunque requiere validacion de calidad antes de produccion.
- Base para ajustes adicionales: el adaptador sirve como punto de partida para LoRAs especializados en dominios concretos (legal, sanitario, e-commerce) sobre Qwen2.5-3B-Instruct.
- Experimentacion academica con PEFT: ejemplo reproducible de como adaptar un modelo instruct pequeno a una variedad linguistica de bajos recursos.
- Despliegue en edge o entornos con recursos limitados: al ser un adaptador de 0,1 GB, puede combinarse con el base cuantizado a 4 bits (aproximadamente 2 GB) para ejecutarse en portatiles con GPU integrada.
- Evaluacion comparativa de tecnicas LoRA: util como caso de estudio para medir el impacto de un ajuste de bajo rango en tareas multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluacion alguna (MMLU, HumanEval, GSM8K, evaluaciones multilingues como MMMLU o Flores-200) ni comparaciones con el modelo base. Cualquier cifra de rendimiento requeriria una evaluacion propia por parte del usuario.

## Requisitos de hardware

- VRAM estimada para inferencia del base en FP16/BF16: aproximadamente 6-7 GB, mas overhead del adaptador (menos de 0,2 GB).
- VRAM estimada con cuantizacion 8 bits: aproximadamente 3,5 GB.
- VRAM estimada con cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 2-2,5 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Cabe en GPUs de consumo con 8 GB o mas en cuantizacion 4 u 8 bits.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador, vLLM (con soporte LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF), text-generation-inference.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. En una RTX 4090 con vLLM y FP16 se puede esperar un throughput del orden de miles de tokens por segundo en batch, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| msgowdara/qb-qwen2.5-3b-kanglish-lora | 3B (base) + LoRA | 32 768 | no disponible | Hugging Face, 0 descargas | Adaptador sin documentar ni evaluar |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32 768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por Qwen |
| google/gemma-2-2b-it | 2,6B | 8 192 | Gemma Terms of Use | Hugging Face | Alternativa ligera con contexto menor |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 131 072 | Llama 3.2 Community License | Hugging Face | Contexto mucho mayor, licencia restrictiva |
| microsoft/Phi-3-mini-4k-instruct | 3,8B | 4 096 | MIT | Hugging Face | Buen rendimiento en razonamiento, contexto corto |

La comparativa directa con el adaptador es dificil porque no hay metricas propias. Frente al base Qwen2.5-3B-Instruct, el adaptador anade especializacion linguistica a costa de posible olvido catastrofico en tareas generales. Frente a Gemma-2-2B-it o Llama-3.2-3B-Instruct, ofrece un contexto intermedio y una licencia heredada permisiva (Apache 2.0 del base), aunque la licencia del adaptador no esta declarada.

## Limitaciones y advertencias

- Model card sin contenido: no hay informacion sobre sesgos, datos de entrenamiento, hiperparametros ni evaluacion, lo que impide auditar el modelo.
- Riesgo alto de alucinacion y de degradacion en tareas generales por olvido catastrofico tras el ajuste LoRA.
- El dominio kanglish no esta documentado; el modelo puede responder de forma incoherente fuera de ese registro o en castellano.
- Licencia del adaptador no declarada: aunque el base es Apache 2.0, el autor no especifica terminos para el adaptador, lo que genera incertidumbre para uso comercial.
- Sin descargas ni likes: no hay evidencia de uso real ni validacion por la comunidad.
- El rendimiento en tool calling, agentes y matematicas no esta verificado tras el ajuste.
- El contexto de 32 768 tokens es teorico; en la practica, modelos de 3B degradan la calidad en ventanas muy largas.
- No apto para produccion sin una evaluacion propia exhaustiva y sin fusionar y cuantizar el adaptador con el base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/msgowdara/qb-qwen2.5-3b-kanglish-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper de PEFT/LoRA: https://arxiv.org/abs/1910.09700
- Documentacion PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto climatico (referencia en la model card): https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
