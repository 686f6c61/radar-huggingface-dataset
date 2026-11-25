# emargo297/JucheAI-4B-Immersive-Q8_0

## Resumen

JucheAI-4B-Immersive-Q8_0 es un ajuste fino de tipo roleplay ideologico construido sobre Qwen/Qwen3.5-4B, publicado por el usuario emargo297 en Hugging Face. Se distribuye unicamente como GGUF cuantizado en Q8_0 (4,5 GB de repositorio) e incorpora un LoRA trilingue (ingles, chino y coreano) fusionado en los pesos completos, sin dependencia de adaptadores en tiempo de ejecucion. Su personaje por defecto es un "cuadro de circulo de estudio" ficticio que habla desde el vocabulario politico de la RPDC, con referencias reverenciales a Kim Il Sung, Kim Jong Il y Kim Jong Un.

El modelo no es un producto oficial de la RPDC, de Qwen ni de Alibaba Cloud, y el propio autor advierte de que el personaje esta sesgado ideologicamente de forma intencionada. La "actualizacion inmersiva" que da nombre a esta release es una capa de persona en tiempo de ejecucion y metadatos (prompt de sistema embebido en la plantilla de chat, ejemplos de voz y directivas persistentes), no un nuevo entrenamiento de pesos especifico de doctrina. Los pesos subyacentes son los de un ajuste fino LoRA previo ya fusionado.

Con aproximadamente 4.205.751.296 parametros (unos 4,2B en el backbone de texto), el modelo esta pensado para ejecucion local en equipos modestos: el autor lo valido en un sistema Apple Silicon de 16 GB. Su interes practico esta en el estudio de tecnicas de personificacion persistente, plantillas de chat embebidas y control de modos (en personaje frente a historico), mas que en capacidades de razonamiento o codigo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino LoRA fusionado |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuracion validada; el autor indica que la arquitectura heredada soporta un contexto teorico mayor, no evaluado |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repositorio) |
| Idiomas soportados | ingles, chino, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y se obtiene mediante un ajuste fino LoRA trilingue "pequeno y original" que despues se fusiona en los pesos completos. La release inmersiva anade un manual doctrinal detallado, ejemplos de voz originales e instrucciones persistentes en la plantilla de chat; segun el autor, esto constituye una actualizacion de persona y metadatos en tiempo de ejecucion, no una nueva ronda de entrenamiento especifica de doctrina. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el empaquetado de la persona: el prompt de sistema por defecto va embebido en los metadatos de chat del GGUF para motores compatibles con Jinja, y el Modelfile de Ollama incluido aporta una plantilla nativa probada, indicaciones de idioma y el mismo prompt de sistema. Se incluyen ficheros auxiliares como `system_prompt.txt`, `system_prompt_factual.txt`, `MODES.md` y `sources.json` para hosts que sobrescriben el mensaje de sistema o ignoran la plantilla embebida. La configuracion recomendada por el autor es temperatura 0,4, top-p 0,85, top-k 20, contexto de 4096 tokens y limite de respuesta de 384 tokens, con un prefijo de respuesta directa para evitar trazas de razonamiento no solicitadas.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y coreano.
- Interpretacion de personaje ("roleplay") ideologico persistente con voz de cuadro de estudio, vocabulario politico de la RPDC y retorica formal.
- Discusion de doctrina Juche aplicada al trabajo cotidiano y al estudio.
- Produccion de anuncios formales estilo radiodifusion.
- Control de modos mediante prefijos en la peticion: "Historical mode" o "Out of character" (y equivalentes en chino y coreano segun `MODES.md`) para obtener una respuesta factual mas breve.
- Instruccion explicita de no inventar citas autenticas, acontecimientos contemporaneos ni documentos historicos.
- No soporta ni valida tool calling / function calling en esta release.
- No soporta vision ni audio.
- No se documenta soporte de agentes ni razonamiento multi-paso; de hecho, la configuracion busca evitar trazas de razonamiento no solicitadas.

## Casos de uso

- Estudio de personificacion persistente: util para investigar como embeber una persona completa en los metadatos de chat de un GGUF y comparar su comportamiento entre motores que respetan o ignoran la plantilla Jinja.
- Pruebas de control de modo en personaje frente a factual: el par de prefijos "Historical mode" / "Out of character" permite evaluar la capacidad de un modelo pequeno de cambiar de registro sin reentrenar, usando los ficheros `system_prompt.txt` y `system_prompt_factual.txt`.
- Evaluacion de sesgo ideologico controlado: al ser un personaje deliberadamente sesgado y documentado como tal, sirve como banco de pruebas para medir como un ajuste fino pequeno desplaza el tono y el contenido factual en un modelo de 4B.
- Demostraciones y docencia sobre alineacion y roleplay: permite ilustrar en clase o en articulo la diferencia entre un relato belico configurado (narrativa de victoria norcoreana) y el registro historico del armisticio del 27 de julio de 1953.
- Despliegue local en hardware modesto: con Q8_0 y 4096 tokens de contexto encaja en un Apple Silicon de 16 GB, lo que lo hace util para prototipos offline de asistentes con voz fija.
- Generacion de texto creativo en tres idiomas: redaccion de discursos ficticios, dialogos o material narrativo en ingles, chino y coreano con un registro formal y consistente.
- Pruebas de interoperabilidad GGUF/Ollama: el repositorio incluye un Modelfile probado, lo que permite validar flujos de `ollama create` y `llama-cli --jinja` con prompts de sistema externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 4,5 GB y la cuantizacion es Q8_0, por lo que se necesita espacio para el fichero GGUF completo mas la cache KV segun contexto; con 4096 tokens el consumo adicional es moderado.
- Validado por el autor en un sistema Apple Silicon de 16 GB; no es garantia para otros runtimes, contextos mayores o modelos cargados en paralelo.
- GPU dedicadas: no se documentan pruebas en A100, H100 ni RTX 4090; por tamano, un modelo de 4,2B en Q8_0 es apto para GPU de consumo con suficiente VRAM, pero no hay datos publicados de rendimiento.
- Cabe en GPU de consumo: si, por tamano (4,2B en Q8_0), aunque sin cifras oficiales de latencia ni throughput.
- Opciones de despliegue documentadas: Ollama (mediante el Modelfile incluido) y llama.cpp reciente con soporte de Qwen3.5 y Jinja (`llama-cli` con `--jinja` y `--system-prompt-file`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| JucheAI-4B-Immersive-Q8_0 | ~4,2B | 4096 validado | en, zh, ko | Apache 2.0 | GGUF Q8_0 | Roleplay ideologico, persona embebida |
| Qwen/Qwen3.5-4B (base) | ~4,2B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | safetensors (upstream) | Modelo base sin personaje |
| Alternativas de roleplay de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- Sesgo ideologico intencionado: el personaje adopta la narrativa oficial de la RPDC y puede describir a EE. UU. como derrotado en la "Guerra de Liberacion de la Patria"; no es un modelo historico neutral ni una autoridad educativa validada.
- Riesgo de alucinacion: el propio autor advierte de que el modo historico "todavia puede equivocarse" y de que la seleccion de modo no garantiza precision factual ni recuerdo perfecto del contexto.
- El modo por defecto no es factual: para obtener respuestas historicas hay que usar prefijos explicitos ("Historical mode", "Out of character" o sus equivalentes); formulaciones mas suaves como "answer plainly" pueden dejar activa la voz del personaje.
- Persistencia del prompt de sistema: clientes que mantienen conversaciones existentes pueden seguir enviando el prompt anterior; es necesario iniciar un chat nuevo tras cambiar la configuracion.
- Hosts que sobrescriben el mensaje de sistema o ignoran la plantilla embebida deben cargar manualmente `system_prompt.txt` o `system_prompt_factual.txt`.
- Contexto limitado en la practica a 4096 tokens; el contexto teorico mayor de la arquitectura heredada no fue evaluado.
- Solo tres idiomas (en, zh, ko); no se documenta soporte de castellano.
- Sin tool calling, sin vision y sin validacion para uso agentico.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado por el personaje puede resultar ofensivo o politicamente sensible; conviene filtrar y etiquetar claramente su naturaleza ficticia en cualquier producto.
- Modelo no oficial: no esta respaldado por la RPDC, Qwen ni Alibaba Cloud.

## Enlaces

- Hugging Face: https://huggingface.co/emargo297/JucheAI-4B-Immersive-Q8_0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Registro del armisticio (Archivos Nacionales de EE. UU.): https://www.archives.gov/milestone-documents/armistice-agreement-restoration-south-korean-state
- Narrativa de posguerra de la RPDC (Kim Il Sung, obras completas): https://www.marxists.org/archive/kim-il-sung/cw/08.pdf
