# LoosiFR/qwen35-9b-omni-v3.5-GGUF

## Resumen

qwen35-9b-omni-v3.5-GGUF es una cuantizacion en formato GGUF del modelo base qwen35-9b-omni-v3.5, publicada por el usuario LoosiFR en Hugging Face. El modelo cuenta con 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y esta empaquetado en un unico archivo Q5_K_M de 6,2 GB dentro de un repositorio de 13,3 GB. Su orientacion declarada es el uso agentico, el tool calling y el desarrollo de videojuegos, y esta preparado para ejecutarse con llama.cpp y Ollama.

La relevancia practica del modelo reside en su formato de distribucion: al ser un GGUF con cuantizacion Q5_K_M, puede ejecutarse en GPU de consumo con 12 GB de VRAM usando llama.cpp con soporte Jinja para tool calling, lo que lo situa en el segmento de modelos de ~9B desplegables en hardware local. El autor documenta una verificacion de ida y vuelta de tool calls sobre el propio archivo exportado, con resultado positivo tanto en la llamada a herramienta como en el uso del resultado devuelto.

La informacion publica disponible es limitada: no se especifican licencia, idiomas soportados, pipeline, composicion del dataset de entrenamiento ni resultados de benchmarks. La model card se centra exclusivamente en instrucciones de despliegue, no en las caracteristicas tecnicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo documentada (ampliable segun VRAM) |
| Tipos de cuantizacion | Q5_K_M (unico archivo publicado en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors segun metadatos de HF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base qwen35-9b-omni-v3.5. El nombre sugiere una vinculacion con la familia Qwen y la etiqueta "omni" podria indicar capacidades multimodales, pero no hay datos publicados que lo confirmen. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La unica informacion tecnica concreta proviene de la model card del GGUF: el autor documenta el uso de plantillas Jinja para tool calling en llama.cpp, con soporte para desactivar el modo de razonamiento por peticion mediante `chat_template_kwargs: {"enable_thinking": false}`, lo que implica que el modelo base incorpora un modo de pensamiento (thinking mode) configurable. La verificacion de exportacion reporta `{"tool_call": true, "tool_result_used": true}` sobre el archivo Q5_K_M.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Tool calling / function calling mediante plantillas Jinja en llama.cpp, con verificacion de ida y vuelta sobre el archivo exportado.
- Uso agentico y razonamiento multi-paso, segun las etiquetas `agentic` y `tool-use`.
- Modo de razonamiento (thinking) activable y desactivable por peticion mediante `chat_template_kwargs`.
- Orientacion a desarrollo de videojuegos, segun la etiqueta `game-development`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible (la etiqueta "omni" no viene acompanada de documentacion).

## Casos de uso

- Asistencia agentica local en estaciones de trabajo: el modelo puede ejecutar bucles de tool calling sobre llama.cpp con `--jinja`, lo que permite construir agentes que invocan funciones locales sin depender de APIs externas.
- Desarrollo de videojuegos asistido: dado el etiquetado explicito del autor, es adecuado para generar dialogos de NPC, descripciones de items, tramas ramificadas y scripts de comportamiento en motores como Godot o Unity, ejecutandose en la propia maquina del desarrollador.
- Automatizacion de tareas con function calling en pipelines internos: con 32K tokens de contexto configurados, puede gestionar conversaciones multi-turno que acumulan resultados de herramientas y mantener el hilo de la tarea.
- Prototipado rapido en GPU de consumo: con 6,2 GB en Q5_K_M cabe en tarjetas de 12 GB, lo que permite iterar sobre prompts y plantillas de herramientas sin infraestructura en la nube.
- Razonamiento con modo thinking controlado: para tareas que requieren deliberacion (planificacion, depuracion logica) se activa el modo pensamiento; para respuestas de baja latencia en produccion se desactiva por peticion.
- Sustitucion de modelos mayores en entornos con restricciones de VRAM: para tareas de clasificacion, extraccion de entidades o generacion de texto acotada donde un modelo de 9B es suficiente y se necesita ejecucion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de validacion reportada por el autor es funcional, no de calidad: la comprobacion de tool calling sobre el archivo Q5_K_M devuelve `{"tool_call": true, "tool_result_used": true}`.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,2 GB para los pesos en Q5_K_M, mas la memoria de la cache KV. Con contexto de 32.768 tokens y cache cuantizada en q8_0 (`-ctk q8_0 -ctv q8_0`), el autor indica que cabe en una GPU de 12 GB.
- GPU recomendadas: el autor documenta explicitamente el escenario de 12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 5070). Para mayor contexto o mayor throughput son adecuadas RTX 4090, A100 o H100, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o superiores con la configuracion documentada.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja -ngl 99 -fa on`) y Ollama mediante Modelfile. El autor advierte que el tool calling es mas fiable a traves de llama.cpp con `--jinja`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion rigurosa con alternativas de tamano similar.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- No se especifican los idiomas soportados; el rendimiento en castellano no esta documentado.
- No hay datos de benchmarks, por lo que la calidad del modelo en tareas de razonamiento, codigo o matematicas no puede evaluarse con evidencia publica.
- El modelo tiene solo 194 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- El repositorio incluye un unico archivo de cuantizacion (Q5_K_M); no hay variantes Q4, Q8 ni versiones de menor o mayor precision.
- El autor advierte que el tool calling es mas fiable con llama.cpp y `--jinja` que con otras rutas de despliegue.
- El contexto de 32K es la configuracion de ejemplo documentada, no necesariamente el maximo del modelo base; ampliarlo requiere vigilar el consumo de VRAM.
- Riesgo de alucinacion y sesgos: no documentados por el autor; deben asumirse los habituales en modelos de esta escala sin evaluacion publica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LoosiFR/qwen35-9b-omni-v3.5-GGUF
- Modelo base: https://huggingface.co/LoosiFR/qwen35-9b-omni-v3.5
