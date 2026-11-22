# nielsr/inkling-2-mini-url-agent-grpo-merged

## Resumen

Inkling 2 Mini URL Agent es un ajuste fino del modelo base Inkling 2 Mini orientado a la extraccion de URLs y a tareas de agente dentro de un entorno de herramientas. Lo desarrolla nielsr sobre el checkpoint SFT `nielsr/inkling-2-mini-url-agent-sft-merged`, al que se le ha fusionado una LoRA entrenada con GRPO (`nielsr/inkling-2-mini-url-agent-grpo-lora`) exclusivamente en los pesos de atencion en BF16. El resultado es un checkpoint que conserva la estructura de mezcla de expertos del modelo original y se sirve igual que este, por ejemplo con la imagen de vLLM `inkling-2-mini`.

El modelo resuelve un problema acotado: ejecutar un agente conversacional que, dentro del arnes OpenCode, utiliza herramientas de shell y de red (Bash, Read, Grep, Glob, WebFetch) y herramientas de salida estructurada para localizar y extraer URLs. La relevancia actual reside en que demuestra un flujo completo de SFT seguido de RL con GRPO sobre un modelo de 26.388.646.440 parametros, con atencion en BF16 y expertos en NVFP4/MXFP8, lo que permite servir el checkpoint sin cambios en el motor de inferencia.

La informacion publicada es muy escasa: la model card se limita a describir la fusion de la LoRA y el entorno de ejecucion previsto. No se detallan datos de entrenamiento, composicion del dataset, idiomas, licencia ni resultados de evaluacion, por lo que buena parte de las especificaciones de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun la nomenclatura `inkling2_loop`; atencion en BF16 y expertos enrutados en NVFP4/MXFP8 |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos nativos con expertos en NVFP4/MXFP8 y atencion en BF16; tag `8-bit` y `modelopt`; no se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers; tag `modelopt`) |

## Arquitectura y entrenamiento

El checkpoint parte de `nielsr/inkling-2-mini-url-agent-sft-merged`, un modelo de arquitectura `inkling2_loop` con 26.388.646.440 parametros totales y diseno de mezcla de expertos: la atencion se mantiene en BF16 mientras que los expertos enrutados conservan sus pesos originales en NVFP4/MXFP8. Sobre esa base se entrena una LoRA limitada a las capas de atencion (`inkling-2-mini-url-agent-grpo-lora`) y se fusiona en los pesos BF16 de atencion, de modo que el checkpoint resultante es estructuralmente identico al modelo SFT y puede servirse con el mismo motor.

El entrenamiento combina dos fases: primero un ajuste supervisado (SFT) que da lugar al checkpoint base, y despues un refinamiento con GRPO (Group Relative Policy Optimization) sobre la recompensa de la tarea de agente. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO adicional ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card indica que el prompt de sistema y la evaluacion sobre conjunto reservado se encuentran en el repositorio de origen, no en este checkpoint.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno en el marco de un agente.
- Extraccion y manejo de URLs como tarea principal del ajuste.
- Uso de herramientas de shell y sistema de ficheros: Bash, Read, Grep y Glob.
- Recuperacion web mediante la herramienta WebFetch.
- Salida estructurada mediante herramientas de structured output.
- Soporte de tool calling y de razonamiento segun los parsers de vLLM `--tool-call-parser inkling` y `--reasoning-parser inkling`.
- Ejecucion dentro del arnes OpenCode con un prompt de sistema definido en el repositorio de origen.
- Capacidades multimodales declaradas por el pipeline `image-text-to-text` en los metadatos, aunque la model card no las detalla.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Extraccion de URLs en pipelines de datos: el modelo recibe contenido o instrucciones y devuelve las URLs relevantes mediante salida estructurada, lo que permite integrarlo en procesos de enriquecimiento de datasets y crawling selectivo.
- Agente de navegacion web controlada: dentro de OpenCode, combina WebFetch con Read y Grep para localizar enlaces en paginas descargadas y verificar su presencia en ficheros locales.
- Automatizacion de tareas de investigacion: el agente puede recorrer un repositorio o un conjunto de documentos con Glob y Grep, extraer las referencias URL y consolidarlas en una lista estructurada.
- Verificacion de enlaces en documentacion tecnica: el modelo localiza URLs en ficheros Markdown o HTML y las devuelve en formato estructurado para que un script posterior compruebe su validez.
- Asistente de shell para operaciones de red: al disponer de la herramienta Bash, puede encadenar comandos de descarga y analisis con la extraccion de URLs en un mismo flujo de agente.
- Construccion de agentes con razonamiento explicito: los parsers de razonamiento de vLLM permiten separar la traza de pensamiento de la respuesta final, util en sistemas que auditan las decisiones del agente.
- Evaluacion de tecnicas de RL para agentes: al ser un checkpoint GRPO fusionado sobre un SFT, sirve como referencia para comparar el efecto del refinamiento por recompensa en tareas de extraccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la evaluacion sobre conjunto reservado del repositorio de origen, pero no incluye cifras en este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26.388.646.440 parametros y pesos nativos mixtos (atencion BF16, expertos NVFP4/MXFP8), el checkpoint completo ocupa aproximadamente 20,2 GB en disco, por lo que se necesita al menos esa cantidad de memoria mas el espacio para el KV cache y las activaciones.
- GPU recomendadas: no se especifican en la informacion disponible; por el formato de pesos (NVFP4/MXFP8 y tag `modelopt`) el despliegue esta pensado para GPUs con soporte de esos formatos y para el motor vLLM.
- Cabe en GPU de consumo: no disponible; el formato de cuantizacion nativo condiciona la compatibilidad con GPUs consumer.
- Opciones de despliegue: vLLM con la imagen `inkling-2-mini` y los parsers `--tool-call-parser inkling --reasoning-parser inkling`; tambien es cargable con transformers (libreria declarada) y aparece como compatible con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion con alternativas.

## Limitaciones y advertencias

- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial del checkpoint ni del modelo base.
- No se documentan los idiomas soportados; el comportamiento fuera del ingles (si el entrenamiento fue en ingles) es incierto.
- El ajuste esta especializado en extraccion de URLs y en el arnes OpenCode; fuera de ese entorno y de ese prompt de sistema el rendimiento puede degradarse.
- Riesgo de alucinacion en la generacion de URLs: el modelo puede producir enlaces plausibles pero inexistentes, por lo que conviene validar las salidas antes de usarlas en produccion.
- Sesgos conocidos: no disponibles.
- No se publican datos de evaluacion ni de tokens de entrenamiento, lo que dificulta estimar la robustez del ajuste.
- El checkpoint conserva los expertos en NVFP4/MXFP8, lo que limita las opciones de cuantizacion adicional y puede exigir hardware y versiones de motor concretas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/inkling-2-mini-url-agent-grpo-merged
- Modelo base SFT: https://huggingface.co/nielsr/inkling-2-mini-url-agent-sft-merged
- LoRA entrenada con GRPO: https://huggingface.co/nielsr/inkling-2-mini-url-agent-grpo-lora
