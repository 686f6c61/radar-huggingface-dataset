# m-aamir2979/gemma-2-2b-bnb-4bit-fineTuned-tool-calling-adapter

## Resumen

`m-aamir2979/gemma-2-2b-bnb-4bit-fineTuned-tool-calling-adapter` es un adaptador de ajuste fino (fine-tuning) derivado de `unsloth/gemma-2-2b-it-bnb-4bit`, la version cuantizada a 4 bits de Gemma 2 2B instruct de Google, publicada por el usuario m-aamir2979. El modelo esta orientado a la tarea de *tool calling* (llamada a funciones o herramientas) y se ha entrenado empleando Unsloth, una libreria que acelera el entrenamiento de modelos grandes con tecnicas de optimizacion de memoria y computo. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere que se trata de pesos de adaptador (LoRA) o de un checkpoint de bajo rango, no de un modelo completo.

El modelo base, Gemma 2 2B, es un transformer decoder-only de 2.000 millones de parametros desarrollado por Google DeepMind, con una ventana de contexto de 8.192 tokens y entrenado principalmente en ingles. La variante `-it` incorpora ajuste por instrucciones, y la version `bnb-4bit` ha sido cuantizada con bitsandbytes a 4 bits para reducir requisitos de memoria. Este adaptador añade una especializacion en la generacion estructurada de llamadas a herramientas, un caso de uso cada vez mas demandado en pipelines de agentes y automatizacion.

La relevancia del modelo reside en su tamaño reducido y su licencia Apache 2.0, que facilita el despliegue en entornos con recursos limitados y su integracion en aplicaciones comerciales. No obstante, la informacion publicada es muy escasa: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni resultados de evaluacion, lo que limita la confianza que un equipo de produccion puede depositar en el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), adaptador de fine-tuning sobre base cuantizada |
| Parametros totales | 2.000 millones (modelo base Gemma 2 2B); tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Gemma 2 2B; no confirmada en el adaptador) |
| Tipos de cuantizacion | Base en 4 bits (bitsandbytes); cuantizaciones adicionales del adaptador no disponibles |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Gemma 2 2B, un transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm y activacion GeGLU, tal como define la familia Gemma 2 de Google. El modelo base emplea atencion con ventana deslizante alternada y atencion global, lo que le permite manejar contextos de hasta 8.192 tokens con un coste computacional contenido. La version `-it` ha sido ajustada con instrucciones y tecnicas de alineacion (RLHF/DPO) por parte de Google, aunque los detalles exactos no se recogen en la informacion disponible.

El entrenamiento del adaptador se realizo con Unsloth, que segun la model card permite un entrenamiento "2x mas rapido" mediante kernels optimizados y gestion eficiente de memoria. No se especifica el dataset utilizado, el numero de pasos, la tasa de aprendizaje, el rango del adaptador ni si se emplearon tecnicas como DPO o RLHF adicionales. Tampoco se documenta la composicion de los datos de tool calling ni el formato de las llamadas a funciones. Esta ausencia de informacion impide evaluar la calidad y generalizacion del ajuste.

## Capacidades

- Generacion de texto en ingles con capacidad de seguir instrucciones, heredada del modelo base Gemma 2 2B IT.
- Tool calling / function calling: el adaptador esta especificamente entrenado para emitir llamadas a herramientas en un formato estructurado, aunque el esquema exacto no se documenta.
- Razonamiento multi-paso basico, limitado por el tamano de 2B parametros y la ventana de 8.192 tokens.
- Capacidades multilingues muy limitadas: la model card solo declara ingles.
- No se documentan capacidades de vision, audio ni modos de pensamiento extendido (thinking mode).
- No se confirma soporte de agentes complejos ni de planificacion autonoma mas alla del tool calling basico.

## Casos de uso

- Automatizacion de agentes conversacionales: el adaptador puede integrarse en un bucle de agente que reciba la intencion del usuario y emita una llamada a una API externa (por ejemplo, consulta de clima o busqueda en base de datos), aprovechando su especializacion en tool calling y su bajo coste de inferencia.
- Asistentes de soporte tecnico con acceso a herramientas: el modelo puede decidir cuando invocar una funcion de consulta de estado de pedido o de creacion de ticket, reduciendo la necesidad de un modelo mayor para tareas de enrutamiento.
- Pipelines de extraccion de datos estructurados: dado un texto de entrada, el adaptador puede generar una llamada a funcion con parametros extraidos (por ejemplo, `get_user(email="...")`), util para integrar en sistemas ETL o de enriquecimiento.
- Prototipado rapido en entornos con GPU consumer: al partir de una base de 2B en 4 bits, cabe en GPUs de 8-12 GB, lo que permite iterar sobre flujos de agente en estaciones de trabajo sin infraestructura dedicada.
- Educacion e investigacion: sirve como ejemplo reproducible de fine-tuning con Unsloth para tool calling, utile en cursos o experimentos sobre adaptadores de bajo rango.
- Despliegue en edge o entornos con latencia estricta: su tamano reducido permite inferencia local en dispositivos con recursos limitados, aunque la calidad del tool calling en produccion no esta validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB para la base en 4 bits, mas el overhead del adaptador y del runtime (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM, gracias a la cuantizacion 4-bit del modelo base.
- Opciones de despliegue: transformers con bitsandbytes, text-generation-inference (TGI), vLLM (previa conversion), llama.cpp/Ollama si se genera un GGUF del adaptador (no disponible en el repositorio).
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| m-aamir2979/gemma-2-2b-bnb-4bit-fineTuned-tool-calling-adapter | 2B (base) | 8.192 | Apache 2.0 | Tool calling (adaptador) |
| google/gemma-2-2b-it | 2B | 8.192 | Gemma Terms | Instrucciones generales |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Instrucciones, tool calling nativo |
| Llama-3.2-1B-Instruct | 1B | 128.000 | Llama 3.2 Community License | Instrucciones, tool calling |

La comparativa se basa en caracteristicas publicas de los modelos; no se dispone de datos de rendimiento del adaptador para contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, hiperparametros y evaluacion, lo que impide validar la calidad del tool calling.
- Riesgo elevado de alucinacion en la generacion de llamadas a funciones (parametros inventados, nombres de herramientas incorrectos), especialmente con solo 2B parametros.
- Capacidad multilingue practicamente nula: la model card declara unicamente ingles.
- Ventana de contexto de 8.192 tokens, inferior a la de alternativas como Qwen2.5 o Llama 3.2, lo que limita conversaciones largas o documentos extensos.
- Al ser un adaptador sobre una base cuantizada en 4 bits, la perdida de precision puede afectar a la fiabilidad del formato estructurado.
- Aunque la licencia declarada es Apache 2.0, el modelo base Gemma 2 esta sujeto a los terminos de uso de Google; conviene verificar la compatibilidad para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-02) en los metadatos, lo que sugiere posible error de registro o cuenta automatizada; tratar con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/m-aamir2979/gemma-2-2b-bnb-4bit-fineTuned-tool-calling-adapter
- Modelo base: https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- Gemma 2 (Google): https://huggingface.co/google/gemma-2-2b-it
