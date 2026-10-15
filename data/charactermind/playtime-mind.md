# CharacterMind/playtime-mind

## Resumen

playtime-mind es un adaptador LoRA publicado por el usuario CharacterMind sobre el modelo base `unsloth/Phi-3-mini-4k-instruct-bnb-4bit`, es decir, una version cuantizada a 4 bits de Phi-3-mini-4k-instruct de Microsoft. No se trata por tanto de un modelo completo con pesos propios, sino de un delta de pesos (PEFT/LoRA) que debe cargarse junto al modelo base para funcionar. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo la libreria `peft` con pipeline de `text-generation` y orientacion conversacional.

El modelo base subyacente es un transformer decoder-only de 3.800 millones de parametros con 4.096 tokens de contexto y arquitectura densa, disenado originalmente por Microsoft Research para ejecucion local en hardware modesto. El adaptador se ha entrenado con SFT (supervised fine-tuning) utilizando el stack Unsloth + TRL + Transformers, segun los tags del repositorio, lo que apunta a un fine-tuning de bajo coste sobre una unica GPU. El nombre "playtime-mind" y el autor "CharacterMind" sugieren un ajuste orientado a conversacion con personajes o roleplay, aunque la model card no lo confirma.

La relevancia de esta ficha es limitada pero util como caso de estudio: se trata de un adaptador con cero descargas y cero likes en el momento de la consulta, con una model card completamente vacia (todos los campos marcados como "[More Information Needed]"), sin licencia declarada, sin idiomas declarados y sin datos de entrenamiento ni evaluacion. Cualquier evaluacion rigurosa debe remitirse al modelo base y tratar el adaptador como un artefacto no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Phi-3-mini); el repositorio contiene un adaptador LoRA, no un modelo completo |
| Parametros totales | 3.800 millones en el modelo base; el adaptador LoRA anade un numero de parametros entrenables no especificado (repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Phi-3-mini-4k-instruct) |
| Tipos de cuantizacion | Modelo base en 4 bits (bitsandbytes, `bnb-4bit`); el adaptador se distribuye en safetensors. No se documentan cuantizaciones GGUF propias |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | No disponible para el adaptador. El modelo base Phi-3-mini-4k-instruct se distribuye bajo licencia MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (PEFT 0.20.0 segun la model card) |
| Modelo base | unsloth/Phi-3-mini-4k-instruct-bnb-4bit |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

El unico dato tecnico firme del repositorio es que se trata de un adaptador PEFT de tipo LoRA obtenido mediante SFT, construido sobre el stack Unsloth + TRL + Transformers y apuntando a una version cuantizada en 4 bits del modelo base. Esto implica una formulacion tipica de QLoRA: el modelo base se mantiene congelado en 4 bits (NF4 de bitsandbytes) y unicamente se entrenan las matrices de bajo rango inyectadas en las capas de atencion y proyeccion. No se especifica el rango (`r`), el `lora_alpha`, el dropout, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset de entrenamiento.

La arquitectura efectiva en inferencia es la de Phi-3-mini: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y vocabulario de 32.064 tokens (construido con el tokenizador de Llama 2 con algunos anadidos). Al cargar el adaptador, los pesos resultantes son la suma del modelo base cuantizado mas el delta LoRA. No hay ninguna innovacion tecnica declarada por el autor: ni decodificacion especulativa, ni atencion lineal, ni modo de razonamiento explicito. La model card no documenta datos de entrenamiento, ni si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto conversacional: al ser un fine-tuning de instrucciones sobre Phi-3-mini, mantiene la capacidad de mantener dialogos multi-turno, aunque limitados por la ventana de 4.096 tokens.
- Razonamiento basico y matematicas elementales: heredadas del modelo base, sin evidencia de mejora especifica por el adaptador.
- Generacion de codigo: el modelo base Phi-3-mini obtiene resultados razonables en tareas de codigo para su tamano; el adaptador no documenta entrenamiento especifico en este dominio.
- Soporte de tool calling / function calling: no documentado. Phi-3-mini no incluye un formato de tool calling nativo, por lo que requeriria plantillas manuales no verificadas.
- Soporte de agentes y razonamiento multi-paso: no documentado. La ventana de 4K tokens limita severamente los flujos agenticos con historial largo.
- Capacidades multilingues: no disponibles. La model card no declara idiomas; Phi-3-mini esta optimizado principalmente para ingles, con soporte limitado de otros idiomas.
- Capacidades especiales: ninguna declarada (sin modo thinking, sin vision, sin audio).

## Casos de uso

- Prototipado de chatbots de personaje: dado el nombre del repositorio y el autor, el uso previsto mas plausible es un asistente conversacional con personalidad definida. El adaptador se cargaria sobre el modelo base con `PeftModel.from_pretrained` y se servira con plantillas de chat, aceptando el riesgo de deriva de personalidad fuera del dataset de ajuste.
- Experimentacion academica con QLoRA: sirve como ejemplo reproducible del flujo Unsloth + TRL para ajustar un modelo de 3,8B en una GPU de consumo, util para comparar configuraciones de rango y dataset.
- Generacion de texto creativo corto: relatos, descripciones o dialogos de menos de 3.000 tokens, donde la ventana de contexto no supone un cuello de botella.
- Clasificacion y etiquetado de texto: uso discriminativo mediante prompts few-shot, aprovechando que el modelo cabe en GPU de gama media y permite procesar lotes grandes.
- Asistente local sin conexion: al ocupar aproximadamente 2,5 GB en 4 bits, puede desplegarse en un portatil con GPU integrada o incluso en CPU mediante llama.cpp tras fusionar el adaptador y convertir a GGUF.
- Evaluacion comparativa de adaptadores comunitarios: util como linea base en experimentos sobre calidad de model cards, ya que ejemplifica el caso extremo de documentacion ausente (todos los campos de la plantilla sin rellenar).
- Filtrado previo en pipelines de datos: generacion de resumenes o reescrituras de baja criticidad donde un modelo de 3,8B es suficiente por coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador contiene la seccion de evaluacion integramente marcada como "[More Information Needed]" y no incluye ninguna tabla de resultados. Cualquier cifra de MMLU, HumanEval, GSM8K u otra deberia consultarse en la model card del modelo base `microsoft/Phi-3-mini-4k-instruct`, teniendo en cuenta que el fine-tuning de instrucciones mediante SFT puede degradar el rendimiento en benchmarks academicos respecto al modelo original.

| Benchmark | playtime-mind | Modelo base Phi-3-mini-4k-instruct |
|---|---|---|
| MMLU | No disponible | Consultar model card del modelo base |
| HumanEval | No disponible | Consultar model card del modelo base |
| GSM8K | No disponible | Consultar model card del modelo base |

## Requisitos de hardware

- VRAM en bf16/fp16 (pesos completos tras fusionar el adaptador): aproximadamente 7,6 GB solo para pesos, mas cache KV. En la practica, entre 10 y 12 GB para contextos de 4K. Cabe en RTX 4080, RTX 4090, A10G, L4 y A100.
- VRAM en 4 bits (bitsandbytes NF4, tal como se entreno): aproximadamente 2,3-2,8 GB de pesos. Cabe comodamente en RTX 3060 12 GB, RTX 4060 8 GB, GTX 1660 6 GB, Tesla T4 y GPUs integradas con 8 GB compartidos.
- Carga del adaptador: el repositorio de 0,1 GB contiene los pesos LoRA; el consumo adicional en VRAM es marginal frente al modelo base.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizacion de 4 bits. Para despliegue con concurrencia media, RTX 4090, L4 o A10G. Para servir en produccion a gran escala, A100 40 GB o H100 permiten batchear multiples peticiones.
- Viabilidad en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y equivalentes. Incluso en CPU es viable mediante llama.cpp tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), vLLM (soporta adaptadores LoRA dinamicos sobre el modelo base), TGI, llama.cpp y Ollama (requieren fusionar el adaptador con el modelo base y convertir a GGUF, ya que no cargan adaptadores PEFT directamente).
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni por el autor ni en la busqueda web. A modo de referencia general, un modelo de 3,8B en 4 bits sobre una RTX 4090 suele superar los 100 tokens por segundo con vLLM en modo single-stream, pero esta cifra no ha sido verificada para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| CharacterMind/playtime-mind | Adaptador LoRA sobre 3,8B | 4.096 tokens | No disponible | safetensors (PEFT) | HuggingFace, 0 descargas |
| microsoft/Phi-3-mini-4k-instruct | 3,8B denso | 4.096 tokens | MIT | safetensors, GGUF en versiones comunitarias | HuggingFace, ampliamente usado |
| microsoft/Phi-3.5-mini-instruct | 3,8B denso | 131.072 tokens | MIT | safetensors | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-3B-Instruct | 3,09B denso | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF | HuggingFace, muy usado |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B denso | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | HuggingFace, requiere aceptar terminos |

La comparacion relevante no es tanto frente a otros modelos como frente al propio modelo base: al no existir benchmarks publicados del adaptador, no hay evidencia de que el fine-tuning aporte mejoras medibles en ninguna tarea, mientras que si introduce riesgo de olvido catastrofico en las capacidades originales. Frente a alternativas de contexto largo como Phi-3.5-mini o Llama-3.2-3B, la limitacion de 4K tokens del modelo base es una desventaja estructural importante.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no especifica autor real, datos de entrenamiento, hiperparametros, licencia, idiomas ni casos de uso previstos. No es posible auditar el modelo.
- Licencia no declarada: al no indicarse licencia para el adaptador, no hay autorizacion explicita de uso comercial. El modelo base es MIT, lo que permite uso comercial del modelo original, pero el estado legal de un adaptador sin licencia sobre ese base es ambiguo. Conviene contactar con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion: inherente a un modelo de 3,8B, y potencialmente agravado por un fine-tuning de SFT sin datos de alineacion documentados. No hay evaluacion de veracidad.
- Sesgos: no evaluados. El dataset de ajuste es desconocido, por lo que no puede descartarse la amplificacion de sesgos presentes en el corpus utilizado.
- Limitacion de contexto severa: 4.096 tokens impiden conversaciones largas, RAG con muchos fragmentos o flujos agenticos con historial extenso. No hay soporte documentado de RoPE scaling ni extension de contexto.
- Idioma: no se declara soporte multilingue. Phi-3-mini esta optimizado para ingles; el rendimiento en castellano no ha sido verificado y probablemente sea inferior.
- Riesgo de olvido catastrofico: al ser un adaptador sobre una base cuantizada a 4 bits, la calidad de los pesos base ya esta degradada respecto al modelo original en fp16, y el SFT puede haber reducido aun mas capacidades generales.
- Metadatos poco fiables: las fechas del repositorio (2026-10-14) y la ausencia total de descargas e interacciones impiden validar la procedencia del artefacto. No debe asumirse que el contenido coincide con lo que su nombre sugiere.
- Sin garantias de mantenimiento: el repositorio no ha sido actualizado desde su creacion y no hay canal de soporte declarado.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/CharacterMind/playtime-mind
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Phi-3-mini-4k-instruct-bnb-4bit
- Modelo original de Microsoft: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Informe tecnico de Phi-3 (arXiv): https://arxiv.org/abs/2404.14219
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Referencia citada en los tags del repositorio (calculadora de impacto de ML, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con inteligencia artificial (contenido sobre altura de actrices y rankings de entretenimiento para adultos). No se ha encontrado ningun paper, blog, repositorio, demo ni articulo tecnico relevante sobre `CharacterMind/playtime-mind`.
