# rao-studios/Qwen2.5-Coder-14B-Instruct-mlx-4bit

## Resumen

Este repositorio es un espejo (mirror) del modelo Qwen2.5-Coder-14B-Instruct convertido a formato MLX con cuantizacion de 4 bits, publicado por el usuario rao-studios. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos, el tokenizer, la plantilla de chat y la configuracion son identicos byte a byte a los de mlx-community/Qwen2.5-Coder-14B-Instruct-4bit en el commit `29efdbab55a161237ab1e432a3abaf6c7ae2b477`. El modelo original fue desarrollado por el equipo Qwen de Alibaba y esta especializado en generacion y comprension de codigo.

La relevancia de este repositorio es operativa, no tecnica: existe para que las instalaciones de la aplicacion Craft descarguen siempre los mismos bytes desde un repositorio controlado por Rao Studios, fijado a un unico commit. La model card documenta una pasada de seguridad previa a la subida (verificacion de SHA-256, ausencia de formato pickle, ausencia de codigo remoto via `auto_map` y validacion de las cabeceras safetensors).

Arquitectonicamente es un transformer denso de tipo `qwen2` con 48 capas, 14.770.033.664 parametros totales y una ventana de contexto de 32.768 tokens. Los pesos ocupan 8,3 GB en safetensors cuantizados a 4 bits con group size 64, lo que lo hace viable en equipos Apple Silicon con memoria unificada moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen2`, transformer denso, 48 capas |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4 bits, group size 64 (unica variante en este repo) |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2 shards, 1.255 tensores, 8,3 GB) |
| Libreria | mlx (mlx-lm) |
| Plantilla de chat | incluida, con soporte de herramientas en formato Hermes JSON |
| Repo base | mlx-community/Qwen2.5-Coder-14B-Instruct-4bit |
| Commit fijado | `29efdbab55a161237ab1e432a3abaf6c7ae2b477` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-14B-Instruct, un transformer denso de la familia Qwen2.5 con 48 capas y 14.770 millones de parametros. Esta version concreta no aporta cambios de arquitectura ni de entrenamiento respecto al original: es una conversion a MLX con cuantizacion de 4 bits (group size 64) realizada por mlx-community, y posteriormente espejada sin modificaciones por rao-studios. La model card no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original.

La unica informacion tecnica adicional que aporta la card es la verificacion de integridad: cada archivo coincide con el SHA-256 registrado por el Hub en el commit de origen, todos los pesos estan en safetensors con dtypes conocidos y tensores que cubren el archivo exactamente, no hay `auto_map` ni codigo remoto en `config.json` ni en `tokenizer_config.json`, y la plantilla de chat esta presente. La plantilla implementa el formato Hermes JSON: enumera el esquema JSON de cada herramienta dentro de etiquetas `<tools>` y el modelo responde con un objeto JSON por llamada dentro de etiquetas `<tool_call>`.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada del modelo Qwen2.5-Coder-14B-Instruct original.
- Razonamiento sobre codigo: explicacion, refactorizacion y correccion de fragmentos existentes.
- Tool calling / function calling mediante plantilla Hermes JSON, con una llamada por objeto JSON envuelto en `<tool_call>`.
- Generacion de texto conversacional en modo instruct (pipeline `text-generation`, tag `conversational`).
- Capacidades multilingues: no disponibles en la informacion proporcionada (la card no declara idiomas).
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode) en este repositorio.

## Casos de uso

- Asistente de edicion de codigo en aplicaciones de escritorio: el formato de tool calling de la plantilla (por ejemplo, una llamada `edit_file` con `path`, `old_string` y `new_string`) encaja directamente en flujos de edicion asistida sobre un arbol de fuentes, que es precisamente el escenario para el que Rao Studios publica este espejo dentro de Craft.
- Generacion de codigo en local sobre Apple Silicon: al estar en MLX a 4 bits y ocupar 8,3 GB, permite inferencia en un Mac sin GPU dedicada, con `mlx_lm.generate` como punto de entrada.
- Automatizacion de tareas de refactorizacion: con 32.768 tokens de contexto se pueden pasar varios archivos o un modulo completo y pedir cambios coherentes entre ellos.
- Integracion en pipelines de CI/CD como revisor automatizado: el modelo puede recibir un diff y devolver sugerencias o parches estructurados via tool calling, siempre que el runner tenga acceso a MLX (entorno macOS).
- Prototipado de agentes de codigo multi-paso: la respuesta estructurada en JSON por llamada facilita el parseo y la orquestacion de bucles de herramientas sin post-procesado fragil.
- Entornos educativos y de experimentacion: la licencia Apache-2.0 y el formato safetensors verificado permiten desplegarlo en laboratorios y aulas sin coste de licencia.
- Reproducibilidad de despliegues: al estar fijado a un commit concreto con hashes publicados, sirve como artefacto estable para instalaciones que necesitan bytes identicos entre maquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas (MMLU, HumanEval, GSM8K ni equivalentes) y no se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 8,3 GB; hay que anadir la cache KV para el contexto utilizado. Con 32.768 tokens de contexto la huella crece de forma apreciable, por lo que se recomienda reservar margen sobre los 8,3 GB base.
- Entorno objetivo: MLX requiere Apple Silicon (memoria unificada); no es desplegable en GPU NVIDIA ni AMD con esta libreria.
- GPU recomendadas: no aplica en el sentido convencional; el equivalente es un Mac con memoria unificada suficiente (16 GB como minimo ajustado, 24-32 GB o mas para contextos largos).
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada; no en GPUs discretas mediante MLX.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`, tal como documenta la card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| rao-studios/Qwen2.5-Coder-14B-Instruct-mlx-4bit (este) | 14,77 B | 32.768 | 4 bits, group 64 | Apache-2.0 | safetensors / MLX |
| mlx-community/Qwen2.5-Coder-14B-Instruct-4bit | 14,77 B | 32.768 | 4 bits, group 64 | Apache-2.0 | safetensors / MLX |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77 B | 32.768 | sin cuantizar (BF16) | Apache-2.0 | safetensors / transformers |

Las tres entradas comparten pesos de origen; las diferencias son de empaquetado y runtime. Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo original: cualquier correccion, actualizacion o cambio de comportamiento debe buscarse en el modelo base de Qwen o en la conversion de mlx-community, no aqui.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo en BF16, especialmente en tareas de codigo que requieren precision sintactica o razonamiento numerico; no se aportan mediciones de esa perdida.
- Riesgo de alucinacion inherente a los modelos de lenguaje: puede generar APIs, funciones o imports inexistentes; conviene validar el codigo generado con tests.
- La model card no declara los idiomas soportados, por lo que el comportamiento multilingue no esta garantizado ni documentado en este repositorio.
- Dependencia de plataforma: MLX solo funciona en Apple Silicon, lo que excluye su uso en servidores Linux con GPU NVIDIA sin reconvertir los pesos.
- El contexto maximo es de 32.768 tokens; entradas mas largas requieren truncado o estrategias de troceado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar los avisos de licencia y atribucion del modelo original Qwen.
- El repositorio tiene un unico commit fijado; si el upstream cambia, este espejo no se actualizara automaticamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rao-studios/Qwen2.5-Coder-14B-Instruct-mlx-4bit
- Modelo base de la conversion: https://huggingface.co/mlx-community/Qwen2.5-Coder-14B-Instruct-4bit
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Commit del modelo original referenciado en la card: `aedcc2d42b622764e023cf882b6652e646b95671`
- Libreria MLX-LM: no se proporciona URL en la informacion disponible.
