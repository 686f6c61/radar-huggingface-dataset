# nihar-damera/creo-classify-0.6b

## Resumen

creo-classify-0.6b es un ajuste fino del modelo Qwen3-0.6B desarrollado por nihar-damera que realiza una unica tarea: el paso `classify` del agente de remediacion de alertas CREO, un proyecto de codigo abierto. Dado un conjunto de evidencias diagnosticas tipadas para una alerta de servidor y las categorias que permite su runbook, el modelo devuelve un objeto JSON con la categoria asignada, las evidencias empleadas y un nivel de confianza. Se trata, por tanto, de un modelo de clasificacion estructurada empaquetado como modelo de generacion de texto.

El modelo parte de la arquitectura transformer densa de Qwen3-0.6B, con 596.049.920 parametros totales (aproximadamente 0,6 mil millones), y se ha especializado mediante SFT con LoRA y un posterior entrenamiento GRPO. Su relevancia radica en que demuestra un flujo completo de destilacion de un modelo grande (Claude Haiku 5.5) hacia un modelo pequeno desplegable en local, con enfasis explicito en robustez frente a inyeccion de instrucciones y en la validacion estricta de la salida.

Es importante subrayar que el modelo se entreno y evaluo exclusivamente con datos sinteticos de una empresa y una flota ficticias. Nunca ha visto una alerta real, y el propio autor advierte que no debe usarse para tomar decisiones sobre sistemas reales. Su interes es, por tanto, metodologico y de investigacion, no de produccion directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino de Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0, GGUF Q4_K_M (publicados); AWQ W4A16 entrenado pero no publicado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B y se especializa mediante un pipeline de tres etapas. Primero, un ajuste fino supervisado (SFT) con LoRA de rango 32 durante 2 epocas sobre 1.713 respuestas generadas por Claude Haiku 5.5 que superaron la validacion del agente y nombraron la categoria correcta (muestreo por rechazo). Despues, un entrenamiento con GRPO (TRL 1.17.1, perdida DAPO, clip-higher, KL β 0.04 respecto al modelo SFT, LoRA, 60 pasos) sobre los 98 prompts en los que las respuestas muestreadas del modelo SFT seguian obteniendo recompensas distintas. Finalmente, el adaptador LoRA se fusiono en los pesos base.

La funcion de recompensa de GRPO penaliza explicitamente varios comportamientos: exige JSON valido y categoria correcta, aplica una penalizacion de −3 por una categoria de arreglo erronea o por una categoria que el runbook no contiene, y otra de −3 por seguir instrucciones inyectadas. Tambien incorpora una banda de longitud. Esta combinacion de recompensas convierte el entrenamiento en un mecanismo de alineacion orientado a la seguridad de la tarea, no solo a la precision.

## Capacidades

- Clasificacion estructurada: devuelve un objeto JSON con los campos `category`, `evidence` y `confidence` a partir de evidencias diagnosticas tipadas y un conjunto de categorias permitidas.
- Generacion de texto y salida conversacional conforme al chat template de Qwen3.
- Robustez frente a inyeccion de instrucciones: en 185 sondas de inyeccion con formulaciones no vistas en entrenamiento, el modelo no siguio ninguna instruccion inyectada.
- Razonamiento controlado: soporta el modo thinking de Qwen3, aunque la guia de uso recomienda desactivarlo (`enable_thinking=False`), ya que con el activado genera un bloque `</think>` hasta agotar `max_tokens`.
- Capacidades multilingues: solo ingles.
- No se documentan capacidades de vision, audio, tool calling generico ni razonamiento multi-paso mas alla de la tarea de clasificacion.

## Casos de uso

- Clasificacion de alertas en el agente CREO: el modelo se integra como el paso `classify` del agente de remediacion, recibiendo el prompt de sistema `SYSTEM["classify"]` y el JSON de hechos (con `sort_keys=True`) como mensaje de usuario, y devolviendo la categoria del runbook. Es su caso de uso disenado y el unico validado.
- Investigacion sobre destilacion de modelos grandes a pequenos: sirve como ejemplo reproducible de destilacion desde Claude Haiku 5.5 a un modelo de 0,6 mil millones de parametros mediante SFT y GRPO, con codigo, recompensas y evaluaciones publicados.
- Estudio de robustez frente a inyeccion de prompts: las 185 sondas de inyeccion con formulaciones no vistas lo convierten en un banco de pruebas para analizar defensas en modelos pequenos.
- Prototipado de pipelines de clasificacion con salida JSON validable: util para experimentar con esquemas estrictos de validacion antes de invertir en modelos mayores.
- Despliegue en local para pruebas de integracion: con cuantizaciones GGUF Q8_0 y Q4_K_M que mantienen el 100% de acierto bajo el esquema JSON del agente, permite probar el flujo del agente sin llamadas a API externas.
- Docencia y demostraciones de RLHF/GRPO: el par SFT + GRPO con recompensas explicitas de seguridad es un caso didactico de alineacion de tareas concretas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre datos sinteticos reservados (held out):

| Evaluacion | Correcto | Eleccion insegura | Siguio instrucciones inyectadas |
|---|---|---|---|
| 185 peticiones de test | 100% [98,0, 100] | 0 | – |
| 185 sondas de inyeccion (formulaciones no entrenadas) | 100% | 0 | 0 [0, 2,0%] |

En el agente completo (815 alertas de test y 100 ataques) tras un router con fallback a API: estado final 100% [99,6, 100], 0 acciones inseguras, 100/100 ataques detenidos y 0 de 185 llamadas recurrieron al fallback de API. Las cuantizaciones GGUF Q8_0 y Q4_K_M mantuvieron el 100% bajo el esquema JSON del agente; una copia AWQ W4A16 perdio un elemento de seguridad y no se publico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,6 mil millones de parametros, la inferencia en fp16 o bf16 requiere aproximadamente 1,2 GB de pesos; las cuantizaciones GGUF Q8_0 y Q4_K_M reducen el uso por debajo de 1 GB de pesos, mas el overhead de contexto y el runtime.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM es suficiente; tambien cabe en CPU mediante llama.cpp.
- Cabe en GPU consumer: si, practicamente en cualquier GPU de los ultimos anos (RTX 3060, RTX 4060, RTX 4090, entre otras) e incluso en hardware integrado.
- Opciones de despliegue: vLLM (con `--default-chat-template-kwargs '{"enable_thinking": false}'`), llama.cpp (con `--chat-template-kwargs`), y por extension las herramientas compatibles con GGUF como Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| creo-classify-0.6b | 596 M | no disponible | apache-2.0 | Clasificacion especializada para el agente CREO; solo datos sinteticos |
| Qwen/Qwen3-0.6B | 596 M | no disponible | apache-2.0 | Modelo base generalista de generacion de texto, sin especializacion en clasificacion |
| Claude Haiku 5.5 | no disponible | no disponible | propietaria | Modelo profesor utilizado para generar las respuestas de SFT; no desplegable en local |

No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado solo con datos sinteticos de una empresa y flota ficticias; nunca ha visto una alerta real. El autor advierte explicitamente de no usarlo para decisiones sobre sistemas reales.
- La tarea es facil sobre estos datos sinteticos: reglas escritas a mano tambien alcanzan el 100% de acierto, por lo que los resultados no implican capacidad de generalizacion.
- Los datos de entrenamiento y test provienen de un unico generador y un unico autor, lo que limita la diversidad y aumenta el riesgo de sobreajuste al dominio sintetico.
- Las sondas de inyeccion evaluan texto que el limite de redaccion del agente normalmente elimina antes de que el modelo lo vea, por lo que la robustez medida no equivale a la de un escenario sin preprocesado.
- El modelo solo soporta ingles.
- Es imprescindible desactivar el modo thinking; con el activado genera un bloque `</think>` hasta `max_tokens`.
- Toda respuesta debe validarse antes de su uso, tal como hace CREO.
- Riesgo de alucinacion: no evaluado de forma especifica en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- [Hugging Face: nihar-damera/creo-classify-0.6b](https://huggingface.co/nihar-damera/creo-classify-0.6b)
- [Repositorio CREO en GitHub](https://github.com/nihardamera/creo-agent)
- [Informe tecnico P4_REPORT](https://github.com/nihardamera/creo-agent/blob/main/docs/P4_REPORT.md)
- [Modelo base: Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
