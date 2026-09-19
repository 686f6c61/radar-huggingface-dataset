# CuriousDragon/northline-functiongemma-270m-sft

## Resumen

Northline FunctionGemma-270M SFT es un adaptador LoRA publicado por el usuario CuriousDragon sobre el modelo base `google/functiongemma-270m-it`. El adaptador convierte ese modelo de 270 millones de parametros en el asistente de atencion al cliente de "Northline Express", un sitio de demostracion de logistica: el modelo selecciona y ejecuta llamadas a las 6 herramientas del sitio y redacta respuestas conversacionales ancladas en los datos devueltos por esas herramientas. El repositorio es un adaptador PEFT (no un modelo completo) y ocupa 0,1 GB.

La relevancia de esta ficha es acotada y conviene ser explicito: no es un modelo de proposito general ni un lanzamiento de gran escala, sino un ejemplo reproducible de ajuste fino de function calling sobre un modelo muy pequeno, con una evaluacion publicada y detallada en la propia model card. El interes tecnico esta en esa evaluacion (exito de tarea del 88,1% en el split held-out frente al 69,6% de una linea base de reglas) y en la receta: LoRA con r=16, alpha=32, dropout=0,05, 3 epocas, learning rate 2e-4, batch efectivo 16 y longitud maxima de 1408 tokens, entrenado sobre 1328 registros durante 866,9 segundos en una GeForce RTX 5060 Laptop GPU.

El entrenamiento y el servicio usan el mismo adaptador para renderizar tanto los objetivos de entrenamiento como los prompts de inferencia, con el objetivo declarado de evitar que la sintaxis de las herramientas se desvie ("train/serve parity estructural"). Los idiomas declarados son ingles e hinglish (hindi romanizado), sin soporte de castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base `google/functiongemma-270m-it`; el artefacto publicado es un adaptador LoRA (PEFT) |
| Parametros totales | Modelo base: 270M (segun el nombre del modelo base). Parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. La receta de entrenamiento uso `max_len` = 1408 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada para el adaptador; el modelo base podria cuantizarse, pero no se documenta |
| Idiomas soportados | Ingles (en) e hinglish (hi). La model card indica explicitamente "English + Hinglish only" |
| Licencia | Gemma (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Hiperparametros LoRA | r=16, alpha=32, dropout=0,05 |
| Receta de entrenamiento | 3 epocas, lr=2e-4, batch efectivo 16, max_len 1408, 1328 registros (`train_v1_enriched.jsonl`, sha256 `d3673057244f`) |
| Run | `fg270m_base_v6_r16_lr2e-04_seed42` sobre NVIDIA GeForce RTX 5060 Laptop GPU, 866,9 s |
| Commit del modelo base | `39eccb091651513a5dfb56892d3714c1b5b8276c` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se inicializa como un LoRA nuevo ("fresh LoRA on the base model") sobre `google/functiongemma-270m-it`, un transformer decoder-only de 270M de parametros de la familia FunctionGemma de Google, orientada especificamente a function calling. El adaptador tiene r=16, alpha=32 y dropout=0,05, y se entrena durante 3 epocas con learning rate 2e-4 y batch efectivo de 16, con una longitud maxima de secuencia de 1408 tokens. El conjunto de entrenamiento consta de 1328 registros del archivo `train_v1_enriched.jsonl` y el run completo tardo 866,9 segundos en una unica GPU de portatil (RTX 5060 Laptop).

La innovacion tecnica destacable no esta en la arquitectura, que es la del modelo base, sino en el diseno del pipeline: la model card afirma que existe paridad estructural entre entrenamiento y servicio porque el mismo adaptador renderiza los objetivos de entrenamiento y los prompts de inferencia, con las 6 declaraciones de herramientas del sitio. El autor menciona tambien un pipeline propietario llamado `northline-agent`, que genera el adaptador y los informes de evaluacion, e incluye `run_meta.json` junto a los pesos. No se detalla la composicion del dataset (proporcion de ejemplos por herramienta, origen de los datos, si hubo RLHF o DPO); solo consta que hay 1328 registros y que el mundo de la demostracion es minimo: 4 envios y 6 ubicaciones, con identidades repartidas en train/dev/gold para medir generalizacion y no memorizacion.

## Capacidades

- Function calling: selecciona y ejecuta llamadas a las 6 herramientas del sitio Northline Express; el autor reporta 0 llamadas de herramienta invalidas en ambos splits evaluados.
- Redaccion de respuestas conversacionales ancladas ("grounded") en la salida de las herramientas, con 0 respuestas fabricadas segun la evaluacion publicada.
- Generacion de texto conversacional multi-turno para atencion al cliente, sobre la plantilla de chat de FunctionGemma.
- Razonamiento de multiples pasos limitado al flujo de herramientas del dominio (acciones + seleccion de herramienta + argumentos exactos o deteccion de campos ausentes).
- Capacidades multilingues: ingles e hinglish unicamente.
- Capacidades especiales: ninguna adicional documentada (sin vision, sin audio, sin modo "thinking" explicito).

## Casos de uso

- Seguimiento de envios en atencion al cliente: el modelo recibe una consulta sobre un numero de albaran o una identidad y emite una llamada a la herramienta de seguimiento correspondiente (de las 6 del sitio), para despues redactar una respuesta anclada en el resultado. Es el caso de uso principal declarado por el autor.
- Demostracion local u on-premise: el adaptador esta pensado para servirse en local como asistente de demostracion del sitio Northline Express, con un consumo de recursos muy bajo al partir de un modelo de 270M.
- Prototipado de agentes con function calling en hardware modesto: permite validar un bucle de agente (herramientas, argumentos, formateo de respuesta) en una GPU de portatil antes de escalar a un modelo mayor.
- Linea base de evaluacion para pipelines de tool calling: su tabla de metricas (task success, tool_sel, args_EM, miss_EM, invalid, fabric, coverage) sirve como referencia cuantitativa contra la que comparar modelos mayores o heuristicas basadas en reglas, que el autor evalua en los mismos splits.
- Ajuste fino de dominio logistico como plantilla: la receta publicada (LoRA r=16, 3 epocas, lr 2e-4, max_len 1408, 1328 ejemplos) es reproducible y sirve de punto de partida para adaptar FunctionGemma a otro catalogo de herramientas.
- Enrutado de intenciones con extraccion de argumentos: para clasificar la consulta del usuario en una accion concreta y rellenar los argumentos estructurados, con deteccion de campos ausentes incluida en la metrica `miss_EM`.
- Asistente Hinglish para soporte de comercio electronico: dado que los idiomas soportados son ingles e hinglish, encaja en mercados del sur de Asia donde el soporte escrito suele alternar ambos registros.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La metrica de exito de tarea combina accion + herramienta + argumentos exactos (o campos ausentes) + texto anclado.

| Split | n | task (exito) | tool_sel | args_EM | miss_EM | invalid | fabric | coverage |
|---|---|---|---|---|---|---|---|---|
| dev | 263 | 87,5% | 88,6% | 78,5% | 52,0% | 0,0% | 0,0% | 93,5% |
| gold (held-out) | 303 | 88,1% | 89,5% | 82,1% | 48,0% | 0,0% | 0,0% | 95,7% |
| baseline de reglas (dev) | 257 | 67,7% | 39,2% | 27,9% | 11,5% | 0,0% | 0,0% | 97,2% |
| baseline de reglas (gold) | 299 | 69,6% | 47,5% | 32,3% | 8,3% | 0,0% | 0,0% | 97,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 270M de parametros del modelo base; el adaptador LoRA anade un delta pequeno): aproximadamente 0,54 GB en fp16, 0,27 GB en int8 y 0,14 GB en int4, sin contar el coste del contexto ni del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, dado el tamano. El propio autor entreno el adaptador en una NVIDIA GeForce RTX 5060 Laptop GPU en 866,9 segundos. No se documentan pruebas con A100 o H100, aunque serian sobredimensionadas para este modelo.
- Si cabe en GPU consumer: si, con amplio margen; tambien es viable en CPU, aunque no se aportan medidas de latencia en ese escenario.
- Opciones de despliegue: los pesos se sirven con PEFT y la model card indica que puede exponerse a traves de "cualquier servidor compatible con OpenAI que renderice la plantilla de chat de FunctionGemma con las 6 declaraciones de herramientas". No se documentan instrucciones ni garantias para vLLM, TGI, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa fiable de rendimiento. Como referencia interna, la unica comparacion publicada es contra la linea base de reglas del propio dominio:

| Sistema | Parametros | Contexto | Task success (gold) | Tool selection (gold) | Licencia |
|---|---|---|---|---|---|
| Northline FunctionGemma-270M SFT | 270M (base) + adaptador LoRA | no disponible | 88,1% | 89,5% | Gemma |
| Linea base de reglas del dominio | no aplica | no aplica | 69,6% | 47,5% | no aplica |
| `google/functiongemma-270m-it` (modelo base) | 270M | no disponible | no disponible | no disponible | Gemma |

## Limitaciones y advertencias

- El mundo de la demostracion es minimo: 4 envios y 6 ubicaciones. Las identidades estan repartidas en train/dev/gold, de modo que las familias held-out miden generalizacion y no memorizacion, pero el alcance sigue siendo muy reducido.
- La metrica `miss_EM` (campos ausentes) es la mas debil: 52,0% en dev y 48,0% en gold. La deteccion de informacion que falta en la consulta es, por tanto, el punto mas fragil del adaptador.
- El autor advierte de que las secuencias largas de digitos repetidos en un numero de albaran pueden contarse mal de forma ocasional; lo atribuye a un artefacto del tokenizador del modelo base.
- Una entrada de seguimiento con formato invalido puede provocar que el modelo llame igualmente a la herramienta en lugar de pedir un numero corregido.
- Idiomas: solo ingles e hinglish. No hay soporte de castellano ni de otros idiomas, y no se documenta su comportamiento fuera de esos dos registros.
- Riesgo de alucinacion: el autor reporta 0 respuestas fabricadas en dev y gold sobre el dominio evaluado, pero esa cifra no es extrapolable a dominios, herramientas o distribuciones distintas de las del conjunto de evaluacion.
- Licencia Gemma: el uso comercial y la redistribucion quedan sujetos a los terminos de la licencia Gemma del modelo base; conviene revisarlos antes de un despliegue en produccion. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Es un adaptador, no un modelo completo: requiere descargar y cargar `google/functiongemma-270m-it` y aplicar el adaptador PEFT; servirlo exige una implementacion que respete la plantilla de chat de FunctionGemma.
- El repositorio registra 0 descargas y 0 likes, y los informes de evaluacion son los del propio autor, sin replicacion independiente.
- No hay datos publicados de latencia, throughput ni comportamiento bajo cuantizacion, lo que dificulta dimensionar un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CuriousDragon/northline-functiongemma-270m-sft
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Referencia mencionada en la model card al archivo de declaraciones de herramientas del sitio, `src/assistant/tools.ts`: no se proporciona URL
- Pipeline `northline-agent` y archivos `run_meta.json` e informes de evaluacion: incluidos en el repositorio del modelo, sin enlace independiente
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: las entradas obtenidas corresponden a la plataforma Scratch (scratch.mit.edu) y a paginas no relacionadas, por lo que no se incluyen.
