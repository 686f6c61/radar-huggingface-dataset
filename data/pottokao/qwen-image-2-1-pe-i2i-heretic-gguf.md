# pottokao/Qwen-Image-2.1-PE-I2I-Heretic-GGUF

## Resumen

Qwen-Image-2.1-PE-I2I-Heretic-GGUF es una derivacion comunitaria del modelo Qwen/Qwen-Image-2.1-PE-I2I de Alibaba/Qwen, publicada por el usuario pottokao. Se trata de un reescritor de prompts de edicion de imagen: recibe una instruccion de edicion vaga junto con una o varias imagenes de entrada y la transforma en un prompt de edicion preciso y accionable, en formato JSON estructurado. El modelo base es un Qwen3.5-VL de 9B parametros afinado especificamente para esta tarea de reescritura.

La variante aqui distribuida aplica una ablacion direccional de la direccion de rechazo mediante la herramienta Heretic, con el objetivo de reducir el comportamiento de negativa del modelo. El resultado se distribuye en formato GGUF para llama.cpp, con el proyector de vision (mmproj) incluido, de modo que funciona tanto en modo solo texto como en modo imagen+texto. El repositorio incluye cuantizaciones Q4_K_M, Q6_K y Q8_0, y un fichero `system_prompt.txt` de 18 KB que define el contrato de salida y sin el cual el modelo no es utilizable.

El interes actual de esta ficha radica en que ejemplifica una practica creciente en la comunidad: la redistribucion de modelos multimodales con modificaciones de comportamiento (abliteracion) y su empaquetado en GGUF para inferencia local. Al mismo tiempo, plantea cuestiones relevantes sobre licencias, calidad tras la ablacion y riesgos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-VL): torre de vision + modelo de lenguaje; el repositorio contiene el LM en GGUF y el proyector de vision (mmproj) en bf16 |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en el ejemplo de despliegue con llama.cpp (`-c 16384`) |
| Tipos de cuantizacion | Q4_K_M (5,89 GB), Q6_K (7,61 GB), Q8_0 (9,53 GB); mmproj en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (no comercial); el campo `license` del repo figura como `other` |
| Formato de pesos | GGUF (llama.cpp), con mmproj GGUF separado |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5-VL de 9B parametros, es decir, un transformer multimodal compuesto por una torre de vision y un modelo de lenguaje, afinado para la tarea de reescritura de prompts de edicion de imagen (image-to-image). La salida esperada es un JSON estructurado que describe la edicion solicitada con precision, incluyendo disciplina de longitud, listas de detalles retenidos y preservacion de texto presente en la imagen. El modelo razona en un bloque `<think>` antes de emitir el JSON, por lo que requiere un presupuesto de tokens generosos (4k-6k segun la model card).

La modificacion principal de esta variante es la ablacion direccional de la direccion de rechazo mediante Heretic. La model card documenta una busqueda distribuida (Optuna con Redis compartido) de aproximadamente 1.900 ensayos que produjo un frente de Pareto monotono entre tasa de rechazo y divergencia KL. El repositorio publica el punto equilibrado: aproximadamente 5 rechazos por cada 100 a KL aproximada de 0,037. La torre de vision no fue modificada por la ablacion, de modo que el mmproj es identico al original. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reescritura de prompts de edicion de imagen: convierte instrucciones vagas en prompts precisos y accionables en formato JSON estructurado.
- Procesamiento multimodal: acepta imagenes de entrada junto con la instruccion de edicion (image+text) o solo texto.
- Razonamiento previo a la respuesta mediante bloque `<think>`, lo que permite descomponer la instruccion antes de generar el JSON.
- Salida estructurada con contrato definido por `system_prompt.txt` (estructura, registro, longitud, forma JSON).
- Preservacion de texto presente en la imagen y listas de detalles retenidos en la reescritura.
- Comportamiento de rechazo reducido tras la ablacion, tanto en el canal de texto como en el canal de vision, segun la verificacion cruzada documentada por el autor.
- Soporte de multiples imagenes de entrada en el turno de usuario.
- No se documentan capacidades de tool calling, function calling, agentes ni audio en la informacion disponible.

## Casos de uso

- Preprocesado de pipelines de edicion de imagen: el modelo se situa antes del modelo generativo de imagen para transformar instrucciones de usuario en prompts tecnicos precisos, mejorando la fidelidad de la edicion final.
- Herramienta interna para equipos de diseno: un editor introduce una indicacion breve y el modelo genera la especificacion completa de la edicion, incluyendo que conservar y que modificar, con salida JSON integrable en una interfaz.
- Investigacion sobre ablacion y alineacion: el repositorio documenta un frente de Pareto entre rechazos y KL, lo que lo convierte en material de estudio para analizar el coste de la abliteracion en tareas estructuradas.
- Evaluacion de robustez multimodal: permite estudiar como afecta la ablacion al canal de vision frente al canal de texto, con la verificacion cruzada ya publicada por el autor.
- Prototipado local en llama.cpp: con cuantizacion Q4_K_M (5,89 GB) puede ejecutarse en equipos de gama alta consumer para experimentar con reescritura de prompts sin depender de APIs.
- Analisis de preservacion de texto en imagenes: util para flujos donde la edicion debe mantener rotulos o texto visible, dado que el modelo genera listas de detalles retenidos.
- Docencia y formacion: ejemplo practico de modelo multimodal cuantizado, con contrato de salida explicito y dependencia clara de un system prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas del proceso de ablacion (tasa de rechazo y divergencia KL), que se reproducen a continuacion por su relevancia tecnica:

| Punto del frente | Rechazos | KL (dano) |
|---|---:|---:|
| Ablacion mas fuerte | 1/100 | 0,107 |
| Alternativa fuerte | 2/100 | 0,058 |
| **Este repositorio** | **~5/100** | **~0,037** |
| Punto intermedio | 10/100 | 0,036 |
| Punto intermedio | 19/100 | 0,028 |
| Punto intermedio | 32/100 | 0,015 |
| Modelo original | 98/100 | 0 |

El autor advierte que la tasa de rechazo se mide sobre n = 100 y que diferencias pequenas estan dentro del ruido binomial, mientras que KL es una medida continua mas fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con Q4_K_M (pesos de 5,89 GB mas mmproj bf16 y overhead de contexto); aproximadamente 8-9 GB con Q6_K; aproximadamente 10-11 GB con Q8_0. Estimaciones orientativas a partir del tamano de los ficheros, no confirmadas en la informacion disponible.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para mayor throughput; cualquier GPU con 12 GB o mas permite ejecutar Q4_K_M con contexto amplio.
- Cabe en GPU consumer: si, en modelos con 8-12 GB de VRAM o superiores segun cuantizacion; el contexto de 16.384 tokens incrementa el consumo de memoria KV.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` y `--jinja`, segun el ejemplo de la model card. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles. El modelo genera un bloque `<think>` antes del JSON, lo que incrementa el tiempo de respuesta; el autor recomienda `max_tokens` de 4k-6k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pottokao/Qwen-Image-2.1-PE-I2I-Heretic-GGUF | ~8,95B | 16.384 (ejemplo) | GGUF + mmproj | Qwen Research (no comercial) | Ablacionado con Heretic, punto KL ~0,037 |
| Qwen/Qwen-Image-2.1-PE-I2I (base) | ~8,95B | no disponible | safetensors | Qwen Research (no comercial) | Modelo original, sin ablacion, ~98/100 rechazos |
| Alternativas de reescritura de prompts de edicion | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la misma categoria |

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License restringe el uso comercial; cualquier explotacion comercial requiere una licencia separada de Qwen.
- Dependencia critica del system prompt: sin `system_prompt.txt` (18 KB) el modelo es inutilizable, ya que define el contrato completo de salida.
- La ablacion degrada capacidades estructuradas: el propio autor senala que cada rechazo eliminado cuesta divergencia KL, lo que en un reescritor estructurado se traduce en perdida de disciplina de longitud, cumplimiento de JSON y capacidad de descripcion espacial.
- La tasa de rechazo se mide sobre n = 100, por lo que diferencias pequenas entre puntos del frente estan dentro del ruido estadistico.
- Riesgo de contenido nocivo: la reduccion de rechazos afecta tanto al canal de texto como al de vision, segun la verificacion del autor, lo que implica que el modelo puede ejecutar ediciones de contenido explicito o violento.
- Riesgo de alucinacion en la descripcion de la imagen y en las listas de detalles retenidos, no cuantificado en la informacion disponible.
- Idiomas soportados no documentados; no se garantiza un comportamiento equivalente en castellano.
- Requiere un presupuesto de generacion elevado (4k-6k tokens) por el bloque de razonamiento, lo que afecta a latencia y coste.
- Modelo no afiliado ni respaldado por Alibaba/Qwen; es una derivacion comunitaria.
- No se documentan resultados de benchmarks que permitan validar la calidad de la reescritura frente al modelo base en tareas neutras mas alla de la afirmacion cualitativa del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-I2I-Heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
