# renatoschust/gama-agent

## Resumen

GAMA Agent 35B es un ajuste fino (fine-tune) del modelo Qwen3.5-35B-A3B orientado a tareas de agente y llamada a herramientas (tool calling), publicado por el desarrollador renatoschust bajo la organizacion gamAI. El modelo base es una arquitectura Mixture-of-Experts (MoE) de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, lo que permite inferencia relativamente economica pese al tamano total. El objetivo declarado es que el modelo "actue, no solo converse": dado un objetivo y un catalogo de herramientas, emite llamadas estructuradas en JSON para operar software, consultar bases de datos, ejecutar comandos o completar tareas de varios pasos.

El modelo esta especializado en bosnio (con soporte secundario de croata, serbio e ingles) y se distribuye como cuantizacion GGUF Q4_K_M de aproximadamente 21 GB, lo que lo hace ejecutable en una unica GPU de gama media-alta con offload a CPU, o en CPU con suficiente RAM. Soporta una ventana de contexto de hasta 32.000 tokens. La relevancia actual radica en que cubre un nicho poco atendido: agentes de automatizacion para lenguas del grupo serbocroata, con refusal explicito ante acciones destructivas.

Se publica bajo licencia Apache-2.0, heredada del modelo base, y se acompana de un adaptador LoRA independiente (renatoschust/gama-agent-lora). El repositorio tiene un volumen de descargas bajo (91 en el momento de la consulta) y no cuenta con likes, lo que sugiere una adopcion todavia incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, base Qwen3.5-35B-A3B |
| Parametros totales | 34.660.610.688 (~34,7 B) |
| Parametros activos | ~3 B (segun model card) |
| Longitud de contexto | hasta 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (publicada, ~21 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | bosnio (principal), croata, serbio, ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 21,2 GB); adaptador LoRA en repo separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del Qwen3.5-35B-A3B: un transformer con mezcla de expertos que activa aproximadamente 3.000 millones de parametros por token sobre un total de ~34,7 B. Esta relacion de activacion (en torno al 8,6 %) es la que permite que una cuantizacion Q4_K_M de 21 GB se ejecute con latencias razonables en hardware de consumo alto o en servidores modestos, en contraste con un modelo denso del mismo tamano total.

El ajuste se realizo mediante SFT seguido de DPO (Direct Preference Optimization) con LoRA de rango r=16 y alpha=16. Los datos de entrenamiento son trazas de agente sinteticas en bosnio, saneadas con marcadores de posicion (placeholder-sanitised): trayectorias de function calling, operaciones de terminal y ops, pares de confirmacion/rebalance y pares de preferencia para DPO. Segun el autor, no se emplearon datos reales de clientes, empresas ni personas. El modelo esta configurado en modo "non-thinking": responde directamente sin preambulo de razonamiento largo, lo que reduce la latencia en bucles de agente. Utiliza la plantilla de chat de Qwen3.5 (chat_template.jinja), embebida en el GGUF.

## Capacidades

- Generacion de texto conversacional fluido en bosnio (variante ijekavica/latinica), con soporte de croata, serbio e ingles.
- Llamada a funciones y herramientas (tool calling / function calling) con salida estructurada en JSON, compatible con el esquema `tools`/`functions` de OpenAI.
- Herramientas contempladas en el entrenamiento: shell/terminal, lectura y escritura de ficheros, estado de servicios, consultas SQL/base de datos, peticiones HTTP/web fetch y calculos.
- Ejecucion de tareas de agente multipaso: bucles de diagnosticar, actuar y verificar a partir de una unica instruccion.
- Mecanismos de seguridad: rechaza acciones destructivas (por ejemplo `rm -rf`, borrado de bases de datos o eliminacion de logs) en lugar de ejecutarlas.
- Modo non-thinking: respuestas directas orientadas a baja latencia.
- No dispone de capacidades de vision, audio ni modo thinking extendido segun la informacion disponible.

## Casos de uso

- Automatizacion de operaciones de sistemas en entornos bosnio/croata/serbio: el modelo recibe el estado de un servicio y un catalogo de herramientas de shell y sistema, y emite la secuencia de comandos de diagnostico y remediacion, con rechazo de operaciones destructivas.
- Asistente de bases de datos en lenguaje natural: traduce preguntas en bosnio a consultas SQL sobre un esquema proporcionado como herramienta, adecuado para equipos internos de analitica en la region.
- Atencion al cliente regional automatizada: gestiona conversaciones multi-turno en bosnio, croata y serbio con hasta 32k tokens de contexto, suficiente para historiales largos o documentacion adjunta.
- Agente de gestion documental: combinando las herramientas de lectura/escritura de ficheros y HTTP, puede clasificar, mover y resumir documentos siguiendo instrucciones en lenguaje natural.
- Integracion en pipelines DevOps: al exponer una API compatible con OpenAI mediante llama-server, puede insertarse como paso de agente en flujos de CI/CD para tareas de verificacion o consulta de estado.
- Prototipado de agentes en local: su formato GGUF y su compatibilidad con Ollama y LM Studio permiten desplegar un agente funcional en una estacion de trabajo con 24 GB de VRAM sin infraestructura cloud.
- Enriquecimiento con RAG: el autor recomienda fundamentar las respuestas factuales mediante recuperacion, por lo que encaja como generador final en arquitecturas RAG para dominio bosnio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21 GB para la cuantizacion Q4_K_M publicada; con overhead de contexto de 32k, prever 22-24 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), A100 (40/80 GB), H100. Con GPUs de 16 GB es necesario offload parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con la cuantizacion Q4_K_M; en GPUs de 16 GB o menos solo con offload.
- Alternativa CPU: ejecutable en CPU con al menos 24 GB de RAM, segun la model card.
- Opciones de despliegue: Ollama (`ollama run hf.co/renatoschust/gama-agent`), llama.cpp (`llama-server -hf renatoschust/gama-agent -c 32768`), LM Studio, GPT4All. La API de llama-server es compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada; la activacion de ~3 B de parametros por token y el modo non-thinking apuntan a latencias bajas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Idiomas foco | Licencia | Formato publicado |
|---|---|---|---|---|---|---|
| GAMA Agent 35B | ~34,7 B | ~3 B | 32k | bs, hr, sr, en | Apache-2.0 | GGUF Q4_K_M |
| Qwen3.5-35B-A3B (base) | ~35 B | ~3 B | no disponible | multilingue general | Apache-2.0 | no disponible |
| Adaptador gama-agent-lora | LoRA r=16 sobre base | n/a | 32k (heredado) | bs, hr, sr, en | Apache-2.0 | LoRA |

No se dispone de datos de benchmarks ni de otros modelos de agente especificos para bosnio en la informacion proporcionada que permitan una comparacion cuantitativa. La comparacion mas directa es con su modelo base Qwen3.5-35B-A3B, del que se diferencia por el ajuste SFT+DPO para tool calling y por la distribucion en GGUF lista para usar.

## Limitaciones y advertencias

- Especializacion linguistica: el rendimiento cae fuera del bosnio; croata, serbio e ingles estan soportados pero no son el foco del entrenamiento.
- Riesgo de alucinacion: el autor indica explicitamente que no es una base de conocimiento y recomienda fundamentar con RAG para datos factuales.
- Fiabilidad del agente dependiente del esquema de herramientas y del system prompt; variaciones en el formato pueden degradar la calidad de las llamadas.
- Requiere supervision humana en operaciones destructivas: aunque el modelo rechaza acciones como `rm -rf` o borrado de bases de datos, debe mantenerse una puerta humana (human gate) en produccion.
- Calidad variable en tareas raras o ambiguas, segun reconoce la model card.
- Datos de entrenamiento sinteticos: puede no generalizar bien a dominios reales no representados en las trazas generadas.
- Adopcion muy baja (91 descargas, 0 likes en el momento de la consulta): ausencia de validacion independiente por la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad de uso recae en el integrador; conviene verificar las condiciones del modelo base Qwen3.5-35B-A3B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/renatoschust/gama-agent
- Adaptador LoRA: https://huggingface.co/renatoschust/gama-agent-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Perfil del autor: https://huggingface.co/renatoschust
- Organizacion gamAI: https://gamai.io
- Repositorio GitHub: https://github.com/gamai-io/gama-agent
