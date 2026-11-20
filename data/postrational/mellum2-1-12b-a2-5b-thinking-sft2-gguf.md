# postrational/Mellum2.1-12B-A2.5B-Thinking-sft2-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-sft2-GGUF es una distribucion en formato GGUF de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) derivado de la familia Mellum 2.1, con 12.150 millones de parametros totales y 2.500 millones de parametros activos por token segun indica el propio identificador del repositorio. El modelo ha sido afinado (fine-tuning SFT, segunda iteracion segun el sufijo "sft2") y posteriormente convertido a GGUF por el usuario postrational utilizando la herramienta Unsloth, con el objetivo de facilitar su despliegue en llama.cpp y entornos compatibles.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad una variante cuantizada (Q4_K_M) de un modelo MoE de tamano medio orientado a tareas de razonamiento ("Thinking"), lo que permite ejecutarlo en hardware de consumo con un consumo de memoria contenido respecto a un modelo denso de 12B. El repositorio ocupa 8,1 GB e incluye unicamente el archivo `Mellum2.1-12B-A2.5B-Thinking.Q4_K_M.gguf`.

No se dispone de informacion sobre el autor original del modelo base Mellum 2.1, la licencia, los idiomas soportados ni los datos de entrenamiento en la informacion proporcionada; la model card se limita a indicar el proceso de fine-tuning y conversion con Unsloth y a mostrar ejemplos de invocacion con `llama-cli` y `llama-mtmd-cli`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun nomenclatura del modelo (A2.5B = 2.5B parametros activos); detalles internos no disponibles |
| Parametros totales | 12.149.923.072 (12,15B) |
| Parametros activos | 2.500 millones (2,5B), segun identificador del modelo |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors segun metadatos de parametros |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts con 12,15 mil millones de parametros totales y aproximadamente 2,5 mil millones activos por token, lo que reduce el coste computacional de inferencia frente a un transformer denso de tamano equivalente. El sufijo "Thinking" sugiere un entrenamiento orientado a modos de razonamiento extendido, aunque los detalles concretos (cadena de pensamiento explicita, formato de plantilla, etc.) no estan documentados en la informacion disponible.

El proceso de entrenamiento documentado se limita al fine-tuning supervisado (SFT, segunda iteracion) y a la conversion a GGUF mediante Unsloth, que segun la model card permitio un entrenamiento "2x mas rapido". No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. Tampoco se detalla la arquitectura de atencion (lineal, flash, etc.) ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational" del repositorio.
- Razonamiento extendido en modo "Thinking" (inferido del nombre del modelo; no confirmado en la model card).
- Compatibilidad con llama.cpp y llama-cpp, incluyendo invocacion via `llama-cli` con plantilla Jinja (`--jinja`).
- Compatibilidad con modelos multimodales mediante `llama-mtmd-cli` (segun la model card, aunque no se confirma que este modelo concreto tenga capacidades de vision).
- Integracion con endpoints compatibles (tag "endpoints_compatible").
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).

## Casos de uso

- Razonamiento asistido en local: al ser un MoE de 2,5B parametros activos cuantizado a Q4_K_M, puede desplegarse en estaciones de trabajo con GPU de consumo para tareas de analisis, planificacion y resolucion de problemas paso a paso mediante el modo "Thinking".
- Prototipado rapido de chatbots: la compatibilidad con `llama-cli` y plantillas Jinja permite levantar un servidor conversacional con llama.cpp sin infraestructura adicional, adecuado para validar flujos de atencion al cliente antes de escalar a produccion.
- Evaluacion de modelos MoE en entornos con VRAM limitada: util para investigadores que quieran comparar el rendimiento de un MoE de 12B totales/2,5B activos frente a modelos densos del mismo orden sin necesidad de GPUs de datacenter.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG): el formato GGUF y el soporte de endpoints compatibles facilitan conectarlo a frameworks de orquestacion que consumen APIs estilo OpenAI.
- Experimentacion con fine-tuning sobre modelos cuantizados: el ecosistema Unsloth y llama.cpp permite iterar rapidamente sobre prompts y plantillas sin reentrenar.
- Despliegue en dispositivos de borde o entornos sin conectividad: un unico archivo de 8,1 GB puede ejecutarse en portatiles con GPU integrada o CPU con suficiente RAM, lo que habilita casos de uso offline.
- Educacion e investigacion: modelo ligero para estudiar el comportamiento de arquitecturas MoE y modos de razonamiento en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: aproximadamente 7-8 GB para los pesos, mas overhead de contexto KV cache; en la practica se recomienda al menos 10-12 GB de VRAM o RAM unificada para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB); en datacenter, A100 o H100 sobredimensionadas para este tamano, aunque validas para servir multiples instancias.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB) y en Apple Silicon con memoria unificada de 16 GB o superior.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama (previa importacion del GGUF), y servidores compatibles con endpoints OpenAI.
- Latencia y throughput estimados: no disponibles; al tratarse de un MoE con 2,5B parametros activos, el throughput por token deberia aproximarse al de un modelo denso de ~2,5B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking-sft2-GGUF | 12,15B | 2,5B | no disponible | no disponible | GGUF (Q4_K_M) |
| Modelos MoE de ~12B con ~2,5B activos (familia generica) | ~12B | ~2,5B | no disponible | no disponible | safetensors / GGUF |
| Modelos densos de ~7B (referencia de tamano) | ~7B | ~7B | no disponible | no disponible | safetensors / GGUF |

No se dispone de informacion suficiente para establecer comparaciones numericas con alternativas concretas (Mixtral, Qwen-MoE, DeepSeek-MoE u otros); los datos de rendimiento, contexto y licencia del modelo evaluado no estan publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base Mellum 2.1 antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real y la calidad en castellano; probablemente el entrenamiento se haya centrado en ingles, pero no hay confirmacion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir afirmaciones factualmente incorrectas, especialmente en modo "Thinking" con cadenas de razonamiento largas; requiere validacion externa en aplicaciones criticas.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o robustez; se recomienda realizar auditorias propias antes de exponer el modelo a usuarios finales.
- Contexto desconocido: la ausencia de especificacion de la ventana de contexto limita la planificacion de casos de uso con documentos largos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa de la calidad del fine-tuning sft2.
- Unica cuantizacion disponible (Q4_K_M): no hay variantes Q8_0, Q5_K_M o Q2_K para ajustar el equilibrio precision/memoria.
- Conversión realizada por un tercero (postrational) sobre un modelo base de origen no identificado: trazabilidad limitada del proceso de fine-tuning y de los datos utilizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/postrational/Mellum2.1-12B-A2.5B-Thinking-sft2-GGUF
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): no disponible enlace explicito en la model card; referencia habitual https://github.com/ggml-org/llama.cpp
