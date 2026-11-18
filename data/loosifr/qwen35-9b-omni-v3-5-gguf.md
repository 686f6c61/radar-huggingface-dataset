# LoosiFR/qwen35-9b-omni-v3.5-GGUF

## Resumen

qwen35-9b-omni-v3.5-GGUF es la distribucion en formato GGUF del modelo base qwen35-9b-omni-v3.5, publicada por el usuario LoosiFR en Hugging Face. Se trata de una cuantizacion orientada a inferencia local con llama.cpp, pensada explicitamente para flujos de trabajo agenticos, uso de herramientas (tool calling) y desarrollo de videojuegos. El unico archivo publicado es `qwen35-9b-omni-v3.5-Q5_K_M.gguf`, de 6,2 GB, lo que sugiere una cuantizacion Q5_K_M sobre un modelo de aproximadamente 9.200 millones de parametros.

El modelo base declara 9.197.093.888 parametros totales segun los metadatos de safetensors, lo que lo situa en la franja de los modelos de ~9B, un tamano manejable en GPUs de consumo con cuantizacion de 5 bits. La model card esta enfocada a la practica: ofrece un comando concreto de `llama-server` para ejecutarlo en una GPU de 12 GB, indica como desactivar el modo de razonamiento por peticion y describe la integracion con editores como Blender, Unity o Godot mediante un servidor MCP apuntando al endpoint local compatible con la API de OpenAI.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de cuantizacion de un modelo derivado, con cero descargas y un like en el momento de la consulta, sin licencia declarada ni idiomas especificados, y sin resultados de benchmarks publicados. Su interes practico reside en la receta de despliegue para tool calling con plantillas Jinja y en su orientacion a pipelines agenticos sobre herramientas de desarrollo de juegos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado; no se especifica en la informacion proporcionada) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo de llama.cpp (`-c 32768`), ampliable segun VRAM; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q5_K_M (unico archivo publicado, 6,2 GB); KV cache en q8_0 en el ejemplo del autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base qwen35-9b-omni-v3.5: la model card del repositorio GGUF no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla la composicion del dataset de entrenamiento, el numero de tokens vistos o si hubo fases de RLHF, DPO u otro ajuste por preferencias. El nombre del modelo sugiere un origen en la familia Qwen y el sufijo "omni" podria indicar capacidades multimodales, pero ninguno de estos extremos se confirma en la informacion proporcionada.

Lo unico documentado tecnicamente es el proceso de cuantizacion y el modo de ejecucion: un unico archivo Q5_K_M de 6,2 GB generado para llama.cpp, con soporte de plantillas Jinja para el formateo de llamadas a herramientas (`--jinja`), atencion con Flash Attention activada (`-fa on`), cache de claves y valores cuantizada a q8_0 (`-ctk q8_0 -ctv q8_0`) y un flag de plantilla de chat para desactivar el razonamiento por peticion (`enable_thinking: false`). La existencia de ese parametro indica que el modelo base incorpora un modo de pensamiento conmutable, aunque no se detalla su funcionamiento.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Tool calling y function calling: el autor documenta el uso de plantillas Jinja en llama.cpp como la via mas fiable para llamadas a herramientas, y advierte que a traves de Ollama la fiabilidad es menor.
- Uso agentico: las etiquetas `agentic` y `tool-use` indican orientacion a flujos multi-paso con herramientas.
- Integracion con MCP (Model Context Protocol): la model card describe apuntar un cliente MCP al endpoint local `http://127.0.0.1:8080/v1` y habilitar el servidor MCP del editor.
- Modo de razonamiento conmutable mediante `chat_template_kwargs.enable_thinking`, desactivable por peticion.
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`), lo que permite usarlo con clientes que esperan la API de `/v1`.
- Capacidades multimodales: no confirmadas en la informacion disponible, pese al sufijo "omni" del nombre.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistencia agentica en motores de videojuegos: el modelo se conecta a traves de un cliente MCP al servidor del editor (Blender, Unity o Godot) expuesto en `http://127.0.0.1:8080/v1`, permitiendo que el modelo consulte la escena, cree objetos o modifique propiedades mediante llamadas a herramientas estructuradas.
- Automatizacion de tareas de edicion 3D en Blender: con el servidor MCP del editor habilitado, el modelo puede encadenar operaciones como importar mallas, aplicar materiales o ajustar transformaciones a partir de instrucciones en lenguaje natural.
- Prototipado de NPCs con dialogo y acciones: la combinacion de generacion de texto y tool calling permite que un personaje no jugable decida que accion ejecutar en el motor del juego y la invoque como llamada a funcion, con el modo de pensamiento desactivado para reducir latencia.
- Desarrollo de pipelines de herramientas en local: al ejecutarse con `llama-server --jinja`, sirve como backend compatible con la API de OpenAI para probar agentes que necesitan function calling sin depender de servicios en la nube.
- Inferencia en estaciones de trabajo con GPU de 12 GB: la configuracion documentada con Q5_K_M, Flash Attention y KV cache q8_0 permite mantener conversaciones de hasta 32.768 tokens en una unica GPU de consumo, util para asistentes de codigo o documentacion en local.
- Evaluacion de flujos con razonamiento conmutable: al poder activar o desactivar `enable_thinking` por peticion, es posible comparar calidad y latencia en tareas de planificacion agentica dentro de un mismo despliegue.
- Servicio de chat autoalojado para equipos pequenos: con el binario de llama.cpp y el archivo GGUF, se puede levantar un endpoint `/v1` en `127.0.0.1:8080` sin infraestructura adicional, aunque sin garantias de soporte ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la comprobacion de llamadas a herramientas reales en llama.cpp al exportar el archivo figura como `not run`, por lo que no hay verificacion publicada del correcto funcionamiento del tool calling sobre esta cuantizacion concreta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,2 GB para los pesos en Q5_K_M, mas la cache KV. Con contexto de 32.768 tokens y cache q8_0, el autor apunta a un objetivo de 12 GB de VRAM en total.
- GPU recomendadas: el autor documenta explicitamente el caso de una GPU de 12 GB; no se indican modelos concretos como RTX 4090, A100 o H100.
- GPU de consumo: cabe en tarjetas de 12 GB o mas con la configuracion indicada; en GPUs de 8 GB habria que reducir contexto o cuantizar mas agresivamente, extremo no documentado.
- Despliegue: llama.cpp mediante `llama-server` con `--jinja -ngl 99 -fa on -c 32768 -ctk q8_0 -ctv q8_0`; Ollama mediante `ollama create` con un Modelfile, aunque el autor advierte que el tool calling es mas fiable por llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, y las caracteristicas del modelo base (arquitectura, licencia, idiomas, benchmarks) no estan documentadas, lo que impide establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso, incluido el uso comercial, por lo que no es posible asumir permisos de redistribucion o explotacion.
- Idiomas no declarados: se desconoce la cobertura linguistica real y la calidad en castellano.
- Sin benchmarks ni verificacion de tool calling: la propia model card indica `not run` en la comprobacion de llamadas a herramientas al exportar el archivo, de modo que la fiabilidad del function calling en esta cuantizacion no esta validada publicamente.
- Repositorio practicamente sin traccion: cero descargas y un like en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Modelo derivado de un base no auditado en esta ficha: al no documentarse arquitectura ni datos de entrenamiento, no es posible evaluar sesgos, riesgo de alucinacion ni calidad del ajuste instruccional.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Dependencia de la plantilla Jinja: el tool calling fiable depende de `--jinja` en llama.cpp; otros runners pueden degradar el formato de las llamadas.
- Contexto configurable pero no nativo confirmado: los 32.768 tokens son la configuracion de ejemplo del autor, no necesariamente el limite nativo del modelo base.
- Ausencia de garantias de mantenimiento: el repositorio no indica versionado, soporte ni actualizaciones previstas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LoosiFR/qwen35-9b-omni-v3.5-GGUF
- Modelo base: https://huggingface.co/LoosiFR/qwen35-9b-omni-v3.5
- llama.cpp (runner recomendado por el autor): no disponible en la informacion proporcionada
- Documentacion de MCP: no disponible en la informacion proporcionada
- Papers, blogs y demos: no disponibles en la informacion proporcionada
