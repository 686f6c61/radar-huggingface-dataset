# 3p3r/sentinel-laya-multilingual

## Resumen

sentinel-laya-multilingual es un clasificador de texto especializado en la deteccion de prompt injection y jailbreak, desarrollado por el usuario 3p3r. Se trata de un fine-tune del modelo base convaiinnovations/laya-multilingual, un encoder mmBERT de aproximadamente 322 millones de parametros con vocabulario de 256k tokens, orientado a cubrir mas de 100 idiomas. El modelo resuelve un problema concreto y creciente en produccion: identificar, antes de que lleguen al LLM principal, las entradas de usuario que intentan sobrescribir, ignorar o subvertir las instrucciones del sistema, las reglas de seguridad o la persona del agente.

A diferencia de los modelos generativos, este checkpoint no produce texto: recibe un prompt y devuelve una respuesta tipada con una probabilidad en una unica pasada forward (arquitectura no autorregresiva, o "System 1 decision engine"). Esa decision de diseno elimina el parseo de salidas y reduce el riesgo de alucinacion del propio clasificador. El checkpoint se ha destilado a partir de las etiquetas suaves (soft labels) de Sentinel v2 y no incluye una ronda posterior de etiquetas duras.

La relevancia practica reside en su coste: en una RTX 3090, con batch de 64, procesa cada prompt en 2.6 ms (52 segundos para 19.474 prompts), unas doce veces mas rapido que el modelo de referencia Sentinel v2 (31.6 ms por prompt). El precio a pagar es una perdida de 6,13 puntos de F1 medio respecto a Sentinel v2, lo que lo situa ligeramente por debajo del umbral del 5% que probablemente se habia fijado como objetivo interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (encoder transformer no autorregresivo); modelo de decision "System 1" sin generacion de texto |
| Parametros totales | 321.908.998 (~322M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada del modelo base laya-multilingual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (mas de 100 idiomas segun el modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya-multilingual, un encoder mmBERT-base de 322M parametros con vocabulario de 256.000 tokens y ventana de contexto de 1024 tokens. Laya se describe como un "System 1 decision engine" no autorregresivo: en lugar de generar texto token a token, recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades en una sola pasada forward. Este modelo concreto se ha fine-tuneado para una tarea binaria de clasificacion (jailbreak/prompt injection frente a peticion benigna).

El entrenamiento se basa en la destilacion de las etiquetas suaves generadas por Sentinel v2 (rogue-security/prompt-injection-jailbreak-sentinel-v2) sobre el encoder multilingue, sin una ronda posterior de etiquetas duras. La temperatura del componente de decision (noul) es 2.2534 y el umbral de clasificacion es 0.5. La clase positiva corresponde a jailbreak o prompt injection. Las cinco evaluaciones externas empleadas no formaron parte del conjunto de entrenamiento, aunque el autor advierte que el promedio reportado no incluye un hold-out interno. El fine-tune se realizo en una unica RTX 3090 con batch de 64.

## Capacidades

- Clasificacion binaria de texto: distingue entre peticiones benignas e intentos de jailbreak o prompt injection.
- Deteccion de intentos de sobrescritura, ignorado o subversion de instrucciones, reglas de seguridad y persona del sistema.
- Soporte multilingue (mas de 100 idiomas heredados del modelo base Laya), con checkpoint ingles separado (3p3r/sentinel-laya).
- Interfaz de preguntas tipadas: se le formulan cuestiones con criterios explicitos y devuelve probabilidades, sin generar texto libre.
- Integracion sencilla mediante el paquete `laya` (`laya.load` y `agent.predict`).
- No genera texto, por lo que no requiere parseo de salidas ni incurre en alucinacion generativa.
- Umbral de decision configurable (por defecto 0.5) sobre la probabilidad devuelta.

## Casos de uso

- Filtro de entrada previo al LLM en produccion: colocar el clasificador delante del modelo generativo para bloquear prompts maliciosos antes de que consuman tokens o expongan el system prompt. Su latencia de 2.6 ms por prompt lo hace viable en linea.
- Puerta de seguridad en agentes autonomos: interceptar mensajes de usuario en entornos multi-turno y multi-herramienta donde un jailbreak podria desencadenar acciones no autorizadas (llamadas a herramientas, escritura de ficheros, peticiones de red).
- Moderacion de contenido en plataformas multilingues: al cubrir mas de 100 idiomas, aplica una unica politica de deteccion de injection a trafico en varios idiomas sin desplegar un modelo por lengua.
- Proteccion de RAG y pipelines con documentos externos: detectar instrucciones maliciosas embebidas en documentos o correos recuperados que intentan reescribir el comportamiento del modelo.
- Monitorizacion y telemetria de seguridad: registrar la probabilidad de injection por prompt para construir alertas, dashboards y analisis forense de intentos de ataque.
- Guardarrail en asistentes de atencion al cliente: clasificar cada ticket o mensaje entrante y derivar a revision humana los casos con puntuacion proxima al umbral.
- Deteccion de jailbreak en API publicas: filtrar peticiones a una API de inferencia antes de que alcancen el modelo de pago, reduciendo coste y superficie de abuso.

## Benchmarks y rendimiento

Resultados de Binary F1 sobre cinco conjuntos externos (no incluidos en entrenamiento). Comparativa con Sentinel v2 sobre los mismos prompts, una RTX 3090 y batch de 64.

| Modelo | rogue-security/prompt-injections-benchmark | allenai/wildjailbreak | jackhhao/jailbreak-classification | deepset/prompt-injections | xTRam1/safe-guard-prompt-injection | Avg |
|---|---|---|---|---|---|---|
| sentinel-v2 | 0.967 | 0.961 | 0.985 | 0.911 | 0.994 | 0.964 |
| sentinel-laya-multilingual | 0.951 | 0.959 | 0.968 | 0.678 | 0.967 | 0.905 |

F1 binario medio de 0,9045, un 6,13% por debajo de sentinel-v2 (0,9636). En deepset/prompt-injections la precision es 0,958 y el recall 0,525.

Velocidad de inferencia (por prompt, batch de 64, una RTX 3090, 19.474 prompts):

| Modelo | ms/prompt | Tiempo total (19.474 prompts) |
|---|---:|---:|
| sentinel-v2 | 31.6 | 615 s |
| sentinel-laya-multilingual | 2.6 | 52 s |

## Requisitos de hardware

- VRAM estimada: alrededor de 1,3 GB en FP32, en torno a 0,65 GB en FP16/BF16 (el repositorio pesa 0,7 GB, consistente con precision de 16 bits). En INT8 el peso rondaria los 0,32 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el autor valido el modelo en una RTX 3090; cualquier GPU con 2 GB o mas de VRAM es suficiente.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 3090, RTX 4090, e incluso en CPU para cargas moderadas dado su tamano de 322M.
- Opciones de despliegue: paquete propio `laya` (Python, `laya.load` con `device="cuda"`). No se documenta soporte explicito para vLLM, TGI, llama.cpp u Ollama; el formato disponible es safetensors y no hay GGUF publicado.
- Latencia y throughput: 2,6 ms por prompt en RTX 3090 con batch de 64, equivalente a unos 385 prompts por segundo en esa configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 medio (5 sets) | ms/prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sentinel-laya-multilingual | 322M | 1024 tokens | 0,905 | 2,6 | apache-2.0 | HuggingFace (este repo) |
| rogue-security/prompt-injection-jailbreak-sentinel-v2 | no disponible | no disponible | 0,964 | 31,6 | no disponible | HuggingFace |
| convaiinnovations/laya-multilingual (base) | 322M | 1024 tokens | no aplica (no entrenado para esta tarea) | no disponible | apache-2.0 | HuggingFace |
| 3p3r/sentinel-laya (checkpoint ingles) | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La ventaja competitiva de sentinel-laya-multilingual es la latencia (aproximadamente 12 veces mas rapido que Sentinel v2) y su cobertura multilingue. Su desventaja es la precision: queda por detras de Sentinel v2 en el promedio y, de forma notablemente acusada, en deepset/prompt-injections (0,678 frente a 0,911).

## Limitaciones y advertencias

- Rendimiento inferior al objetivo: el F1 medio (0,9045) queda un 6,13% por debajo de Sentinel v2, por encima del umbral del 5% que el autor habia fijado como aceptable.
- Recall bajo en deepset/prompt-injections: 0,525 con precision 0,958, lo que indica que deja pasar aproximadamente la mitad de los casos positivos de ese conjunto y tiende a ser conservador en ese dominio.
- Solo etiquetas suaves: el checkpoint no incluye la ronda posterior de etiquetas duras, lo que puede explicar parte de la perdida de rendimiento frente a Sentinel v2.
- Sin hold-out interno: el promedio reportado se calcula solo sobre cinco benchmarks externos y no sobre una particion interna reservada, por lo que la cifra puede no reflejar el comportamiento en datos propios.
- No es un modelo generativo: no produce texto ni razonamiento explicito; unicamente devuelve una probabilidad binaria, lo que limita su uso a clasificacion.
- Limitacion de contexto: 1024 tokens heredados del modelo base; prompts mas largos requeriran truncado o segmentacion, con el riesgo de perder la parte del ataque.
- Riesgo de alucinacion bajo (no genera), pero persisten falsos positivos y falsos negativos inherentes a un clasificador con umbral fijo de 0,5.
- Idiomas: aunque el modelo base cubre mas de 100 idiomas, no se aportan metricas desagregadas por idioma para esta tarea, por lo que el rendimiento por lengua es desconocido.
- Licencia apache-2.0: permite uso comercial y modificacion, pero no se documentan garantias ni condiciones adicionales mas alla del aviso de la model card.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: escasa validacion externa por parte de la comunidad.
- Ausencia de formatos cuantizados oficiales (GGUF, AWQ, GPTQ): la integracion en stacks de inferencia estandar puede requerir conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3p3r/sentinel-laya-multilingual
- Repositorio de codigo: https://github.com/3p3r/sentinel-laya
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Model card del base (README): https://huggingface.co/convaiinnovations/laya-multilingual/blob/main/README.md
- Checkpoint ingles: https://huggingface.co/3p3r/sentinel-laya
- Modelo de referencia Sentinel v2: https://huggingface.co/rogue-security/prompt-injection-jailbreak-sentinel-v2
- Web del modelo base Laya: https://laya.convaiinnovations.com/
- Ficha tecnica de laya-multilingual (benchmarks y limites): https://laya-ai.com/models/laya-multilingual
