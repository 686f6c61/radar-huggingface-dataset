# nakas/kiln-photo-1.5b-q4f16_1-MLC

# Kiln Photo 1.5B (q4f16_1, MLC/WebLLM)

## Resumen

Kiln Photo 1.5B es un ajuste fino mediante LoRA de Qwen2.5-1.5B-Instruct publicado por el usuario nakas. No es un asistente de proposito general: es el modelo que gobierna el panel de inteligencia artificial de Kiln Photo, un editor de fotografia gratuito que se ejecuta integramente en el navegador mediante WebLLM. El modelo no genera imagenes ni las procesa directamente; lo que hace es manipular el documento abierto llamando a las herramientas del editor y devolviendo despues una unica frase que describe el cambio aplicado.

El artefacto publicado esta compilado y cuantizado en formato MLC `q4f16_1`, con el mismo layout que `mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC`, de modo que funciona con la libreria precompilada de WebLLM. El repositorio ocupa 0,7 GB y se distribuye bajo licencia Apache 2.0. Al tratarse de un modelo de 1.500 millones de parametros cuantizado a 4 bits, su interes practico esta en el despliegue local sin servidor y en el patron de entrenamiento: 1.494 conversaciones de edicion generadas ejecutando planes sobre el editor real y filtradas por una comprobacion automatica.

En la evaluacion interna sobre 84 formulaciones no vistas, los pesos ajustados alcanzan un 82 % de exito medido sobre el documento resultante, frente al 4 % del modelo base sin ajustar con el prompt completo del editor. Es, por tanto, un caso claro de especializacion estrecha con ganancia enorme frente al punto de partida y utilidad practicamente nula fuera de ese dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con ajuste fino LoRA; artefacto compilado para MLC/WebLLM |
| Parametros totales | 1.500 millones (1,5B), heredados de Qwen2.5-1.5B-Instruct |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | `q4f16_1` (pesos int4 con cuantizacion por grupos, activaciones float16) |
| Idiomas soportados | no disponible (la model card no los documenta; el modelo base Qwen2.5 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto MLC compilado para WebGPU (libreria `.wasm` mas shards de parametros); no se publican safetensors ni GGUF |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de adaptacion | LoRA (el autor publica el artefacto compilado, no el adaptador en safetensors) |
| Protocolo de herramientas | JSON delimitado por bloques de codigo (fenced JSON) sobre texto |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 en la fecha de consulta |
| Creado / actualizado | 2026-10-10 / 2026-10-10 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal, sobre el que se aplica un ajuste fino LoRA. No se documentan en la model card ni el rango del adaptador, ni los hiperparametros, ni el numero de tokens de entrenamiento. El resultado se compila y cuantiza en MLC con el esquema `q4f16_1`, cuyo layout coincide con el del modelo base cuantizado oficial, lo que permite reutilizar la libreria precompilada de WebLLM `Qwen2-1.5B-Instruct-q4f16_1_cs1k-webgpu.wasm` sin recompilar.

Los datos de entrenamiento son 1.494 conversaciones de edicion generadas de forma semi-automatica: se reprodujeron planes escritos a mano sobre el editor real y se conservaron unicamente aquellas conversaciones cuyo resultado paso una comprobacion automatica. El conjunto cubre 46 tareas escritas a mano y todos los filtros y ajustes del registro de comandos del editor. No se menciona RLHF ni DPO. La innovacion destacable no esta en la arquitectura, sino en el protocolo de interaccion: el modelo opera el documento a traves de cuatro herramientas (`get_document`, `find_commands`, `run_commands`, `undo`) y cierra la conversacion con una unica frase descriptiva del cambio.

## Capacidades

- Generacion de llamadas a herramientas en formato JSON delimitado, con las cuatro funciones del panel de Kiln Photo.
- Edicion de un documento de imagen a traves de comandos: aplicacion de filtros y ajustes registrados en el editor.
- Consulta del estado del documento antes de actuar (`get_document`) y busqueda de comandos disponibles (`find_commands`).
- Reversion de cambios (`undo`) como parte del flujo de agente.
- Razonamiento de varios pasos dentro de una misma sesion de edicion, encadenando consulta, busqueda y ejecucion.
- Generacion de una respuesta final de una frase que resume la accion realizada.
- Tool calling basado en texto (no en APIs nativas de function calling del runtime).
- Capacidades multilingues: no disponibles como dato; la model card no documenta idiomas.
- Vision, audio y modo de razonamiento explicito: no disponibles.

## Casos de uso

- Panel de edicion asistida en el navegador: es el caso para el que fue entrenado; el modelo recibe la peticion del usuario, consulta el documento, localiza los comandos adecuados y los ejecuta, todo dentro de la pestana del navegador con WebGPU.
- Edicion con privacidad por diseno: al ejecutarse en el cliente mediante WebLLM, la imagen y las instrucciones no salen del dispositivo, lo que encaja en flujos con requisitos de confidencialidad o sin conectividad estable.
- Edicion sin coste de inferencia en servidor: el artefacto de 0,7 GB elimina la necesidad de GPU en backend para una funcion de asistente conversacional sobre el editor.
- Aplicaciones web offline-first: una PWA de retoque fotografico puede ofrecer el asistente sin conexion tras la primera descarga de los pesos.
- Integracion en editores de imagen basados en navegador que repliquen el mismo protocolo de herramientas; requiere adaptar el registro de comandos y, previsiblemente, reentrenar el adaptador.
- Automatizacion de tareas de retoque repetitivas dictadas en lenguaje natural, como aplicar una secuencia de ajustes a un lote de documentos abiertos en la misma sesion del editor.
- Banco de pruebas metodologico: sirve como plantilla para evaluar ajustes finos LoRA en dominios estrechos con verificacion automatica del resultado, dado que el autor documenta el volumen de datos y el protocolo de evaluacion.
- Despliegue en equipos modestos: al caber en el presupuesto de memoria de GPUs integradas y moviles compatibles con WebGPU, permite demos y prototipos de agentes de herramientas sin infraestructura dedicada.

## Benchmarks y rendimiento

| Evaluacion | Kiln Photo 1.5B | Qwen2.5-1.5B-Instruct sin ajustar (con el prompt completo del editor) |
|---|---|---|
| Tareas de edicion retenidas: 84 formulaciones no vistas, puntuadas sobre el documento resultante | 82 % | 4 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica documentada es la evaluacion interna de la model card, realizada sobre 84 formulaciones no vistas y medida por el estado final del documento, no por similitud de texto.

## Requisitos de hardware

- El repositorio de pesos ocupa 0,7 GB; la VRAM necesaria para pesos, cache KV y buffers de WebGPU se estima en torno a 1-2 GB, aunque no hay cifras oficiales publicadas (estimacion a partir del tamano del artefacto, no confirmada por el autor).
- Cabe en GPU de consumo: cualquier GPU con soporte de WebGPU y al menos 2 GB de memoria disponible, incluidas graficas integradas modernas, Apple Silicon y GPUs de movil compatibles con WebGPU.
- El autor indica que se ejecuta con la libreria precompilada de WebLLM `Qwen2-1.5B-Instruct-q4f16_1_cs1k-webgpu.wasm`, por lo que el contexto efectivo en ese despliegue puede venir limitado por dicha libreria; ese dato no se especifica en la model card.
- Opciones de despliegue: WebLLM (MLC-LLM sobre WebGPU) en navegador, o el runtime de MLC-LLM. El artefacto publicado no es directamente utilizable en vLLM, llama.cpp, Ollama ni TGI, ya que su formato es MLC compilado y no GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluacion en el protocolo de Kiln Photo |
|---|---|---|---|---|---|
| Kiln Photo 1.5B (q4f16_1) | 1,5B | no disponible (base: 32.768 tokens) | Apache 2.0 | MLC compilado (WebGPU) | 82 % en 84 formulaciones retenidas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, MLC | 4 % en el mismo protocolo, con el prompt completo del editor |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | no evaluado |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | no evaluado |

Los datos de las tres alternativas provienen de sus fichas publicas y no se han verificado en el contexto de esta ficha; la comparacion relevante es la primera fila frente a la segunda, porque ambas comparten pesos de partida y protocolo de evaluacion. No existe una comparativa publicada frente a otros asistentes de edicion fotografica, ya que Kiln Photo define un protocolo de herramientas propio.

## Limitaciones y advertencias

- Modelo de proposito unico: el propio autor advierte que esta especializado en las herramientas y el prompt de sistema de Kiln Photo y que no es un asistente general. Fuera de ese contexto su utilidad es marginal.
- Riesgo alto de alucinacion funcional: puede generar bloques JSON con comandos inexistentes o mal formados; el editor y su comprobacion automatica son la red de seguridad, no el modelo.
- Evaluacion muy reducida: 84 formulaciones retenidas y un conjunto de entrenamiento de 1.494 conversaciones. El 82 % implica aproximadamente uno de cada cinco casos fallidos, sin desglose por tipo de tarea.
- Sensibilidad al prompt: al depender de un prompt de sistema concreto y de un protocolo de texto en lugar de function calling nativo, cualquier cambio en el prompt, en el registro de comandos o en el formato puede degradar el rendimiento de forma abrupta.
- Idiomas: no documentados. Aunque el modelo base es multilingue, no hay evidencia de que los datos de ajuste cubran castellano ni otros idiomas distintos del usado en el entrenamiento.
- Contexto: la ventana efectiva en el despliegue WebLLM no esta documentada y puede ser inferior a la del modelo base segun la libreria precompilada utilizada.
- Validacion social nula: cero descargas y cero likes en el momento de la consulta, sin informes de terceros ni pruebas independientes.
- Licencia Apache 2.0 en el artefacto, lo que permite uso comercial, pero conviene revisar por separado las condiciones del editor Kiln Photo y de la libreria de WebLLM si se integra en un producto.
- Los metadatos indican fecha de creacion y actualizacion en octubre de 2026, dato que conviene verificar antes de citar el modelo como reciente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nakas/kiln-photo-1.5b-q4f16_1-MLC
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Editor Kiln Photo: https://editkiln.com/photo-editor/
- WebLLM (repositorio): https://github.com/mlc-ai/web-llm
- Libreria base cuantizada de referencia: https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC
- Busqueda web realizada: los resultados obtenidos no guardan relacion con el modelo (corresponden a Nakastream, Philippos Nakas, el conservatorio Nakas y Kestutis Nakas) y no aportan informacion tecnica adicional.
