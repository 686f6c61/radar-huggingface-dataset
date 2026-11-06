# agentscope-ai/QwenPaw-Flash-35B-A3B-BF16

## Resumen

QwenPaw-Flash-35B-A3B-BF16 es la publicacion en formato GGUF BF16 del modelo agente QwenPaw-Flash-35B-A3B, desarrollado por AgentScope (agentscope-ai), el equipo responsable del framework de agentes QwenPaw. El modelo esta disenado especificamente para uso de herramientas, ejecucion de comandos, gestion de memoria y resolucion de tareas de multiples pasos dentro del ecosistema QwenPaw, no como un modelo de proposito general.

La nomenclatura A3B indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones de parametros activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Los nombres de los archivos de pesos (Qwen3.6-35B-A3B-SFT-step630) sugieren un ajuste fino supervisado sobre una base de la familia Qwen3.6, aunque la model card no lo confirma explicitamente.

El modelo se distribuye bajo licencia Apache 2.0, en tres shards GGUF con un total de unos 69,4 GB, y esta orientado a despliegue local mediante llama.cpp. Con 274 descargas en el momento de la ficha, es un lanzamiento reciente y de nicho, enfocado a desarrolladores que construyen agentes con QwenPaw y necesitan un modelo capaz de razonar sobre herramientas y mantener estado entre pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la nomenclatura A3B; base probable Qwen3.6 (no confirmado en la model card) |
| Parametros totales | 34.660.610.688 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (deducido de la nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (3 shards, BF16) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de la nomenclatura. El sufijo A3B y los nombres de archivo (Qwen3.6-35B-A3B-SFT-step630) apuntan a un transformer con mezcla de expertos de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, derivado de una base Qwen3.6 y sometido a ajuste fino supervisado (SFT) hasta el paso 630. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

El modelo esta entrenado para el bucle agente de QwenPaw: uso de herramientas, ejecucion de comandos, gestion de memoria y tareas multi-paso. Esa orientacion implica un ajuste especifico sobre trayectorias de agente (llamadas a funciones, observaciones de herramientas y planificacion), aunque la model card no publica detalles del proceso ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico artefacto publicado es el GGUF BF16, lo que sugiere que el objetivo es la inferencia local con llama.cpp mas que el reentrenamiento.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Uso de herramientas y function calling (tag tool-use, proposito declarado del modelo).
- Ejecucion de comandos dentro del entorno de agente QwenPaw.
- Gestion de memoria y estado entre pasos de una tarea.
- Razonamiento multi-paso y planificacion de tareas de agente.
- Compatibilidad con endpoints estilo OpenAI (tag endpoints_compatible), servible mediante llama-server.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Agentes autonomos con QwenPaw: el modelo es el componente de razonamiento del framework QwenPaw, encargado de decidir que herramienta invocar, interpretar su salida y encadenar pasos hasta completar la tarea.
- Automatizacion de tareas de shell y DevOps: gracias a su entrenamiento en ejecucion de comandos, puede proponer y ejecutar comandos en un entorno controlado, con validacion humana en los pasos destructivos.
- Asistentes con memoria persistente: su capacidad de gestion de memoria permite mantener contexto de usuario y de tarea entre sesiones dentro de la arquitectura de QwenPaw.
- Orquestacion de pipelines multi-herramienta: para flujos que combinan busqueda, lectura de ficheros, llamadas a API y sintesis final, donde el modelo planifica y delega en cada herramienta.
- Despliegue local en estaciones de trabajo: al ser un GGUF BF16 servible con llama.cpp, encaja en entornos con GPU de 80 GB o configuraciones multi-GPU, sin dependencia de servicios en la nube.
- Prototipado de agentes en investigacion: util para comparar estrategias de tool calling y memoria sobre una base MoE de 35B con coste de inferencia reducido por los ~3B parametros activos.
- Backend de agentes via API compatible con OpenAI: el tag endpoints_compatible y el ejemplo con llama-server permiten integrarlo en aplicaciones existentes que ya consumen la API de chat completions.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio ocupa 69,4 GB, por lo que se necesitan al menos 70-80 GB de VRAM para cargar los pesos completos con margen para el contexto y el cache KV.
- GPU recomendadas: H100 80 GB, A100 80 GB o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB) para BF16. En GPUs consumer de 24 GB no cabe en BF16.
- Cuantizaciones: este repositorio solo publica BF16; para caber en GPUs consumer seria necesario generar cuantizaciones GGUF de menor precision (Q4, Q5, Q8) a partir de los pesos, algo que la model card no documenta.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con endpoint compatible con la API de chat completions de OpenAI. No se mencionan vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B parametros activos, el coste por token es inferior al de un denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| QwenPaw-Flash-35B-A3B-BF16 | 34,66B | ~3B (MoE) | No disponible | Apache 2.0 | GGUF BF16 | Especializado en agentes QwenPaw |
| Qwen3-30B-A3B (referencia de familia) | ~30B | ~3B (MoE) | No disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Base generalista de la que parece derivar |
| Modelos densos de ~32B | ~32B | ~32B | Variable | Variable | Variable | Mayor coste de inferencia por token |

La comparativa con alternativas concretas no puede completarse con datos verificados: la model card no publica benchmarks ni contexto, y no se dispone de resultados comparables de otros modelos en la informacion proporcionada. La referencia a Qwen3-30B-A3B se incluye solo como posible base por la nomenclatura de los archivos, no como dato confirmado.

## Limitaciones y advertencias

- La model card es muy escasa: no documenta contexto, idiomas, datos de entrenamiento ni evaluaciones, lo que dificulta validar su calidad frente a alternativas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en un agente con ejecucion de comandos el impacto puede ser mayor (acciones erroneas o destructivas).
- Especializacion en el ecosistema QwenPaw: su rendimiento fuera de ese framework y de tareas de agente no esta documentado.
- Solo se publica BF16 en este repositorio; no hay cuantizaciones oficiales, lo que limita el despliegue en hardware consumer sin conversion manual.
- Idiomas soportados no declarados: no se puede asumir un buen rendimiento en castellano sin evaluacion previa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo puede heredar sesgos y limitaciones de su base Qwen3.6 no documentadas aqui.
- El nombre de los archivos sugiere un checkpoint SFT intermedio (step630); no se indica si es la version final ni si hay posteriores.
- Fecha de creacion en 2026 y muy pocas descargas: ecosistema y soporte comunitario aun limitados.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/QwenPaw-Flash-35B-A3B-BF16
- Proyecto QwenPaw (GitHub): https://github.com/agentscope-ai/QwenPaw
- ModelScope: https://www.modelscope.cn/models/AgentScope/QwenPaw-Flash-35B-A3B-BF16
- Coleccion ModelScope QwenPaw-Flash: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
