# javierbits/Javi0.4-4B-GGUF

## Resumen

Javi0.4-4B-GGUF es la distribucion en formato GGUF del modelo Javi0.4-4B, desarrollado por el usuario javierbits. Se trata de un experimento de edicion en el espacio de pesos (weight-space editing) sobre Javi0.3-4B, que a su vez deriva de Qwen3.5-4B. La unica modificacion aplicada consiste en escalar por 0.84 la fila de embedding asociada al token `=open_page`. No hay fine-tuning, ni nuevos datos, ni gradientes: es un control de 4B para el experimento de edicion de pesos que el autor realiza tambien sobre modelos de mayor tamano.

El modelo resuelve un problema muy concreto en el ambito de los agentes que usan herramientas: la recuperacion tras el fallo de una herramienta de busqueda web. El autor mide si la edicion de una unica fila de embedding mejora la capacidad del modelo de reaccionar cuando `web_search` falla, comparandolo con Javi0.3-4B sobre 175 semillas reservadas y con jueces automaticos. El resultado medido es una mejora pequena pero estadisticamente apreciable en la metrica de core pass.

Con 4.326.350.848 parametros (aproximadamente 4,3B), contexto de 131.072 tokens segun el comando de ejemplo, licencia Apache 2.0 y pesos disponibles en Q8_0 y Q4_K_M, es un modelo pensado para despliegue local en llama.cpp, orientado a tool calling y flujos de agente. La informacion disponible no detalla la arquitectura interna mas alla de la referencia a Qwen3.5 y a la existencia de una torre de vision en el modelo base que no se incluye en el GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (detalle interno no disponible) |
| Parametros totales | 4.326.350.848 (aprox. 4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (segun el comando de ejemplo de llama-server) |
| Tipos de cuantizacion | Q8_0 y Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (heredada de Qwen3.5-4B) |
| Formato de pesos | GGUF (cuantizado desde un GGUF F16 del modelo fusionado editado); safetensors disponible en el modelo base |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF de Javi0.4-4B, que a su vez es Javi0.3-4B con la fila de embedding del token `=open_page` escalada por 0.84. No se ha realizado ningun entrenamiento adicional: no hay fine-tuning, ni nuevos datos, ni pasos de gradiente. La edicion es puramente en el espacio de pesos sobre un unico vector de embedding.

El modelo base declarado es Qwen3.5-4B, del que hereda la licencia Apache 2.0. La informacion disponible no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se detalla si la arquitectura incorpora innovaciones como atencion lineal o decodificacion especulativa. El modelo base incluye una torre de vision que no se incluye en los ficheros GGUF, por lo que esta distribucion es exclusivamente de texto. Los cuantizados se generaron a partir de un GGUF F16 del modelo fusionado editado, y el autor advierte que la cuantizacion anade su propio ruido pequeno respecto al modelo en bf16.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling y function calling, con enfasis en herramientas de busqueda web (`web_search`) y recuperacion de URLs (`open_page`, `webfetch`/`web_fetch`).
- Comportamiento de agente con multiples pasos, incluyendo recuperacion tras el fallo de una herramienta.
- Modo de razonamiento desactivado por defecto: el modelo fue entrenado y evaluado con `enable_thinking: false`.
- Capacidad multilingue limitada: la model card solo declara ingles.
- Sin capacidades de vision en esta distribucion GGUF (la torre de vision del modelo base no se incluye).
- No se declaran capacidades de audio.

## Casos de uso

- Agentes de busqueda web con tolerancia a fallos: el modelo esta especificamente evaluado para elegir otra ruta (por ejemplo, otra URL tipada) cuando `web_search` falla, lo que lo hace adecuado para pipelines de recuperacion de informacion donde las APIs de busqueda pueden devolver errores 403 o timeouts.
- Automatizacion de navegacion y extraccion de paginas: con el token `open_page` como parte del flujo, puede encadenar busqueda y apertura de paginas dentro de un agente de investigacion.
- Despliegue local en hardware de consumo: los ficheros Q4_K_M (2,8 GB) y Q8_0 (4,3 GB) permiten ejecutar el modelo en llama.cpp sobre equipos con GPU modestas, sin depender de servicios en la nube.
- Asistentes conversacionales en ingles con contexto largo: la ventana de 131.072 tokens permite mantener conversaciones multi-turno con historiales extensos o documentos largos en contexto.
- Integracion en pipelines de CI/CD para tareas de agente: el soporte de tool calling y el formato GGUF facilitan su inclusion en flujos automatizados mediante llama-server o lmdeck.
- Evaluacion y experimentacion en edicion de pesos: sirve como control de 4B para reproducir y comparar el experimento de edicion de la fila `open_page` frente a Javi0.3-4B.
- Prototipado de agentes con presupuesto de hardware reducido: al ser un modelo de 4B cuantizado, permite iterar rapidamente en el diseno de flujos de herramientas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la evaluacion interna del autor (eval v3), medida sobre el modelo en bf16 del que proceden estos cuantizados, con 175 semillas reservadas, 3 ejecuciones, fecha fijada al 2026-10-07 y resultados de busqueda en cache. Los jueces son DeepSeek-V4.1-Flash-1017 y mimo-v26-dual.

| Metrica | Javi0.3-4B | Javi0.4-4B |
|---|---:|---:|
| core pass (media de jueces) | 0,50 [0,45; 0,55] | 0,56 [0,52; 0,61] |
| core pass (deepseek) | 0,64 | 0,74 |
| core pass (mimo) | 0,36 | 0,39 |
| recuperacion tras fallo de herramienta | 0,58 (n=12) | 0,75 (n=12) |
| enlaces inventados | 0,01 | 0,00 |
| bucles | 0,03 | 0,02 |

La diferencia pareada de core pass es de +0,06 [0,03; 0,10] con bootstrap al 95% sobre 175 semillas (deepseek +0,10 [0,05; 0,14]; mimo +0,04 [0,00; 0,07]). El intervalo de deepseek excluye el cero; el de mimo lo toca. Las preguntas de conflicto son la unica categoria a la baja (0,26 frente a 0,40, n=7, direccional con ese tamano de muestra); las preguntas imposibles de conocer suben (0,55 frente a 0,32, n=10). El autor senala que el control mide ligeramente por encima de Javi0.3-4B, pero que la sonda especifica no permite atribuir la ganancia unicamente a la fila `open_page`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8 GB con Q4_K_M y 4,3 GB con Q8_0 para los pesos, mas el espacio de cache KV. Con contexto de 131.072 tokens y cache KV en q8_0 (como en el comando de ejemplo), el consumo adicional puede ser considerable.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cabe en GPUs de consumo con al menos 6-8 GB de VRAM para Q4_K_M y 8-10 GB para Q8_0, dependiendo de la longitud de contexto.
- Cabe en GPU de consumo: si, segun el tamano de los ficheros (2,8 GB y 4,3 GB). No se detallan modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (llama-server) y lmdeck, ambos documentados por el autor. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Ajustes recomendados por el autor: `-c 131072 -fa on -ctk q8_0 -ctv q8_0`, plantilla de chat con `enable_thinking: false`, `--temp 0.2 --top-p 0.8 --top-k 20 --min-p 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Javi0.4-4B-GGUF | 4,3B | 131.072 | Apache 2.0 | GGUF | Edicion de una fila de embedding sobre Javi0.3-4B |
| Javi0.3-4B | 4,3B (no confirmado en la informacion) | no disponible | Apache 2.0 (heredada) | safetensors / GGUF | Base y modelo 4B recomendado por el autor |
| Javi0.4-2B-GGUF | no disponible | no disponible | Apache 2.0 (heredada) | GGUF | Experimento equivalente a menor escala |
| Qwen3.5-4B | 4B (segun nombre) | no disponible | Apache 2.0 | safetensors | Modelo original del que deriva la familia Javi |

No se dispone de datos de benchmarks estandar para comparar rendimiento frente a alternativas de la misma categoria mas alla de la evaluacion interna del autor entre Javi0.3-4B y Javi0.4-4B.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- La edicion de pesos es minima y especifica: el autor advierte que la sonda no permite atribuir la mejora a la fila `open_page` por si sola.
- Persiste una brecha de recuperacion en la ruta `webfetch`/`web_fetch` que la edicion no corrige.
- Las preguntas de conflicto empeoran en la evaluacion (0,26 frente a 0,40, n=7), aunque el autor la califica de direccional por el tamano de muestra.
- La cuantizacion introduce ruido adicional respecto al modelo en bf16; los resultados reportados se midieron sobre bf16.
- Riesgo de alucinacion: la metrica de enlaces inventados es 0,00 en la evaluacion, pero se trata de una metrica interna con busqueda en cache y no garantiza ausencia de alucinaciones en produccion.
- Sin capacidades de vision en el GGUF: la torre de vision del modelo base no se incluye.
- El modo de razonamiento debe permanecer desactivado (`enable_thinking: false`), ya que el modelo fue entrenado y evaluado asi.
- Licencia Apache 2.0, lo que permite uso comercial, pero se hereda de Qwen3.5-4B y conviene revisar las condiciones de ese modelo base.
- No se han publicado resultados de benchmarks estandar, por lo que la comparacion con otros modelos de 4B es limitada.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/javierbits/Javi0.4-4B-GGUF
- Modelo base en safetensors: https://huggingface.co/javierbits/Javi0.4-4B
- Modelo base y 4B recomendado: https://huggingface.co/javierbits/Javi0.3-4B
- Experimento 2B: https://huggingface.co/javierbits/Javi0.4-2B-GGUF
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
