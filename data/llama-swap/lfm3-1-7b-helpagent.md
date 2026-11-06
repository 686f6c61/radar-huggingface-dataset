# llama-swap/LFM3-1.7B-HelpAgent

## Resumen

LFM3-1.7B-HelpAgent es un ajuste fino (fine-tune) de LFM3-1.7B de Liquid AI, desarrollado por el proyecto llama-swap y publicado bajo el identificador `llama-swap/LFM3-1.7B-HelpAgent`. Su proposito es acotado y explicito: responder preguntas sobre la herramienta llama-swap, consultar su documentacion y sus utilidades de configuracion mediante llamadas a herramientas, y ayudar a redactar ficheros de configuracion. No es un asistente generalista, sino un agente especializado en un dominio concreto.

El modelo parte de la arquitectura LFM3 de Liquid AI con 1.728.801.536 parametros (aproximadamente 1,7 mil millones) y se distribuye tanto en pesos bf16 (`model.safetensors`, 3,5 GB) como en una cuantizacion GGUF Q4_K_M (1,1 GB), que es la que el autor emplea para las evaluaciones publicadas. El entrenamiento se realizo con LoRA (r 16, alpha 32) sobre una unica RTX 3090 en 87 minutos, y los pesos resultantes se fusionaron en el modelo base.

Su relevancia practica radica en el salto de rendimiento documentado frente al modelo base en la tarea de agente de documentacion: del 44,8% al 95,5% en los casos de entrenamiento y del 55,6% al 96,1% en los casos de holdout, medidos con el arnes de evaluacion del propio repositorio de llama-swap. Es un ejemplo de como un ajuste fino pequeno y bien filtrado puede convertir un modelo de 1,7B en un agente fiable para una tarea estrecha, con coste de inferencia muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (modelo base LiquidAI/LFM3-1.7B); requiere `trust_remote_code=True` |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (configuracion usada en la evaluacion con `--ctx-size 131072`) |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; pesos bf16 en safetensors para generar otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial gratuito solo para organizaciones con ingresos anuales inferiores a 10 millones de USD |
| Formato de pesos | safetensors (bf16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM3-1.7B de Liquid AI, un transformer de aproximadamente 1,7 mil millones de parametros. La model card no detalla la arquitectura interna del modelo base mas alla de su identificador y su revision (`0dc4268b561499c648c7ba7c9466bf3d8d01517a`); el ajuste fino no modifica la topologia, solo los pesos. La inferencia con transformers exige `trust_remote_code=True` y la revision previa de los ficheros Python incluidos, ya que el repositorio contiene codigo personalizado.

El entrenamiento consistio en un LoRA fusionado posteriormente en el modelo base: r 16, alpha 32, dropout 0,05, tasa de aprendizaje 2e-4 con decaimiento coseno, batch 1 acumulando 8, 2 epocas y precision bf16. El conjunto de datos son 417 conversaciones con 1.329 turnos de asistente, generadas por un modelo mas potente (`Q3.8-27B-rad`) que ejecutaba el bucle de agente real contra la documentacion de llama-swap. Cada conversacion se filtro con dos criterios: que terminase en pocos pasos y que cada clave de configuracion presente en la respuesta apareciese en algun resultado de herramienta. Ningun caso de evaluacion se uso en entrenamiento. El proceso completo consumio 87 minutos y 9 GB de VRAM en una RTX 3090.

## Capacidades

- Generacion de texto conversacional en ingles orientada a preguntas y respuestas sobre llama-swap.
- Llamada a herramientas (tool calling) en el formato XML propio de LFM3, que `llama-server` interpreta con la opcion `--jinja`.
- Ejecucion de bucles de agente multipaso: consulta la documentacion y las utilidades de configuracion de llama-swap antes de responder.
- Redaccion y asistencia en la creacion de ficheros de configuracion de llama-swap.
- Razonamiento acotado al dominio: no se documentan capacidades de codigo general, matematicas, vision ni audio.
- Multilingue: solo ingles declarado en la model card.

## Casos de uso

- Asistente de documentacion de llama-swap: el modelo recibe la pregunta del usuario, invoca las herramientas de busqueda sobre la documentacion y responde citando el contenido recuperado; es el escenario para el que fue entrenado y evaluado.
- Generacion asistida de ficheros de configuracion: el agente consulta las claves validas mediante herramientas y propone un YAML/JSON de configuracion; conviene validar el resultado contra el esquema oficial por el riesgo de claves inventadas.
- Soporte interno para usuarios de llama-swap: despliegue en un endpoint propio que resuelve dudas frecuentes sobre modelos, puertos y opciones de arranque sin intervencion humana.
- Integracion en un chat de comunidad o repositorio: al ser un GGUF Q4_K_M de 1,1 GB, puede servirse en una GPU de consumo junto al propio llama-swap, con latencia mediana de 12 s por intento en una RTX 3090 a concurrencia 4.
- Validacion de configuraciones en CI: usar el agente para comprobar que una configuracion propuesta referencia claves existentes antes de aplicarla, combinando su salida con la validacion contra `config-schema.json`.
- Base para otros agentes de documentacion: el metodo (generar trazas con un modelo mayor, filtrarlas por uso real de herramientas y ajustar un modelo pequeno) es replicable a otras herramientas con documentacion estructurada.
- Entorno de investigacion sobre agentes pequenos: permite estudiar el comportamiento de tool calling en modelos de 1,7B con un arnes de evaluacion reproducible incluido en el repositorio de llama-swap.

## Benchmarks y rendimiento

Evaluacion del Docs Agent de llama-swap, Q4_K_M sobre `llama-server`, 60 segundos por intento, 3 intentos por pregunta, calificacion por aserciones regex:

| Modelo | Casos de entrenamiento (134) | Casos de holdout (51) |
|---|---|---|
| LFM3-1.7B, stock | 44,8% | 55,6% |
| LFM3-1.7B-HelpAgent | 95,5% | 96,1% |

Notas de rendimiento publicadas por el autor: mediana de 12 s por intento y percentil 95 de 32 a 34 s en una RTX 3090 con concurrencia 4. El modelo base agoto el tiempo en 276 de sus 555 intentos, frente a 9 del modelo ajustado. La puntuacion de holdout oscilo entre 92,8% y 97,4% segun la penalizacion por repeticion y el limite de tiempo, por lo que las diferencias pequenas deben tratarse como ruido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB durante el entrenamiento LoRA en una RTX 3090; para inferencia, el GGUF Q4_K_M de 1,1 GB requiere del orden de 2-3 GB de VRAM segun contexto y KV cache, y los pesos bf16 (3,5 GB) alrededor de 4-5 GB.
- GPU recomendadas: RTX 3090 (configuracion usada en la evaluacion), asi como A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM en Q4_K_M, y en 8 GB con margen para contextos amplios.
- Opciones de despliegue: `llama-server` (llama.cpp b11960 o posterior, con `--jinja`), transformers con `trust_remote_code=True` y SGLang segun la model card.
- Latencia y throughput: mediana de 12 s por intento y p95 de 32-34 s en RTX 3090 con concurrencia 4, en el bucle de agente completo con llamadas a herramientas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-HelpAgent | 1,73B | 131.072 tokens (config. de evaluacion) | Agente especializado en llama-swap | LFM Open License v1.0 | Hugging Face (safetensors y GGUF) |
| LFM3-1.7B (stock) | 1,73B | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |
| Qwen3-1.7B | no disponible en la informacion | no disponible | Modelo pequeno generalista con tool calling | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada; la unica comparacion documentada es contra el modelo base en la tarea especifica de agente de documentacion.

## Limitaciones y advertencias

- Solo conoce la documentacion de llama-swap accesible mediante sus herramientas y en la version con la que fue entrenado; no es un asistente general.
- Tiende a inventar claves de configuracion: un juez LLM lo detecto en aproximadamente 1 de cada 6 respuestas, algo que la calificacion por regex no captura. Validar siempre contra `config-schema.json`.
- Aproximadamente el 1,6% de los intentos no termino en 60 segundos por razonamiento excesivo o repeticion de llamadas a herramientas.
- Solo se ha probado con el system prompt y las herramientas de llama-swap; WebGPU no ha sido probado.
- Idioma limitado al ingles.
- Licencia LFM Open License v1.0: uso comercial gratuito solo para organizaciones con ingresos anuales inferiores a 10 millones de USD; por encima, consultar la guia de licencias de Liquid AI. Uso de investigacion permitido para cualquiera.
- No afiliado ni respaldado por Liquid AI; la licencia no concede derechos sobre sus marcas.
- Riesgo de alucinacion fuera del dominio de llama-swap y en configuraciones no vistas durante el entrenamiento.
- El repositorio incluye codigo personalizado; revisar los ficheros Python antes de cargar con `trust_remote_code=True`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llama-swap/LFM3-1.7B-HelpAgent
- GGUF Q4_K_M: https://huggingface.co/llama-swap/LFM3-1.7B-HelpAgent/resolve/main/LFM3-1.7B-HelpAgent-Q4_K_M.gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio de llama-swap: https://github.com/mostlygeek/llama-swap
- Evaluacion Docs Agent: https://github.com/mostlygeek/llama-swap/tree/main/evals/docs-agent
- System prompt del Docs Agent: https://github.com/mostlygeek/llama-swap/blob/main/ui/src/lib/prompts/docsAgent.ts
- Esquema de configuracion: https://github.com/mostlygeek/llama-swap/blob/main/config-schema.json
- Issue de seguimiento del entrenamiento: https://github.com/mostlygeek/llama-swap/issues/1302
- Guia de licencias de Liquid AI: https://docs.liquid.ai/lfm/help/model-license
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
