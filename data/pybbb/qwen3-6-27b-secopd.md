# pybbb/Qwen3.6-27B-SecOPD

## Resumen

Qwen3.6-27B-SecOPD es un modelo de lenguaje multimodal de 27 000 millones de parámetros desarrollado por pybbb, derivado del modelo base Qwen/Qwen3.6-27B. Está específicamente diseñado para mitigar ataques de inyección indirecta de instrucciones (indirect prompt injection) mediante una técnica novedosa llamada destilación on-policy (SecOPD). El modelo se publica como un checkpoint fusionado con los pesos del adaptador LoRA ya integrados, listo para usar en entornos de investigación y red-teaming.

La relevancia de este modelo radica en su capacidad para mantener la utilidad general del modelo base mientras reduce drásticamente la tasa de éxito de ataques adaptativos. Según los datos del autor, alcanza una ASR de 9.0% en el benchmark PISmith, frente al 97.9% del modelo sin defensa, sin apenas degradar el rendimiento en tareas de razonamiento, código o matemáticas. El modelo hereda la arquitectura Qwen3.5 (causal LM de 27B con codificador de visión) y soporta modo de pensamiento (thinking) por defecto.

Está pensado para aplicaciones que mantienen un límite explícito de confianza entre instrucciones del sistema y contenido no confiable (documentos, respuestas de herramientas, imágenes). Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (causal LM con vision encoder) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en fp16 por defecto) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15 shards) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer causal de 27 000 millones de parámetros con un codificador de visión integrado, lo que le permite procesar tanto texto como imagenes. El entrenamiento de SecOPD emplea una destilacion on-policy: el modelo estudiante genera una trayectoria bajo un prompt atacado, mientras que una copia congelada del modelo inicial puntua los mismos tokens generados bajo el prompt limpio pareado. La diferencia de verosimilitud a nivel de token proporciona la senal de entrenamiento, que se aplica a cada token generado.

El conjunto de entrenamiento consta de 19 000 ejemplos construidos a partir de Cleaned-Alpaca con inyecciones de prompt simuladas. Se utilizo un adaptador LoRA de rango 128, con una tasa de aprendizaje de 1e-4, temperatura de muestreo 1.0 y una longitud maxima de generacion de 16 000 tokens. El adaptador ya esta fusionado en los pesos publicados, por lo que no se requiere cargar ningun adaptador adicional. La separacion de roles es critica: las instrucciones confiables deben ir en el rol `user` y el contenido no confiable en el rol `input`.

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo modo de pensamiento (thinking) activado por defecto.
- Procesamiento multimodal: acepta entradas de texto e imagen (image-text-to-text).
- Defensa especifica contra inyeccion indirecta de instrucciones, con baja tasa de exito en ataques adaptativos (PISmith, SEP, AgentDojo).
- Conversacional: soporta dialogos multi-turno con separacion de roles `user` e `input`.
- Capacidades de codigo y matematicas heredadas del modelo base Qwen3.6-27B, que alcanza 77.2% en SWE-bench Verified segun el blog oficial de Qwen.
- Compatible con herramientas de agente como OpenClaw (segun el blog de Qwen), aunque no se documenta explicitamente tool calling en la ficha del autor.

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo sirve como objetivo para probar nuevos vectores de ataque de inyeccion de prompts, gracias a su robustez documentada frente a ataques adaptativos.
- Agentes autonomos con acceso a herramientas: al mantener el limite de confianza entre instrucciones del sistema y respuestas de herramientas (en el rol `input`), se reduce el riesgo de que un agente ejecute acciones maliciosas inducidas por contenido externo.
- Procesamiento de documentos no confiables: resumir, extraer o analizar informes, correos o paginas web donde el contenido puede contener instrucciones ocultas, sin que estas alteren la tarea principal.
- Asistentes de atencion al cliente que integran datos de terceros: el modelo puede gestionar conversaciones donde se inyectan datos de bases de conocimiento o APIs externas sin que el prompt injection comprometa la respuesta.
- Prototipos de aplicaciones con limite de confianza explicito: ideal para entornos donde la aplicacion host ya identifica y separa el contenido confiable del no confiable, como pipelines de ingestion de datos.
- Investigacion academica en seguridad de LLMs: sirve como punto de referencia para comparar metodos de defensa contra inyeccion indirecta, dado que se publican resultados detallados en el paper.

## Benchmarks y rendimiento

Resultados de seguridad (tasa de exito del ataque, menor es mejor):

| Benchmark / ataque | Sin defensa | Meta-SecAlign | GRPO | SecOPD |
|---|---|---|---|---|
| SEP Static | 99.4% | 28.9% | 15.0% | **1.3%** |
| SEP Basic Adaptive | 99.0% | 5.5% | 2.3% | **0.2%** |
| SEP PISmith Adaptive (no thinking) | 97.9% | 94.0% | 61.2% | **9.0%** |
| AgentDojo Static | 26.7% | 5.5% | **0.7%** | 4.7% |

Resultados de utilidad (mayor es mejor):

| Benchmark | Sin defensa | Meta-SecAlign | GRPO | SecOPD |
|---|---|---|---|---|
| AlpacaEval2 | 81.4% | 82.3% | 76.0% | 80.1% |
| SEP Utility | 88.0% | 89.3% | 79.5% | 88.6% |
| AgentDojo Utility | 92.8% | 92.8% | 82.5% | 90.7% |
| MMLU-Pro | 84.1% | 83.8% | 83.0% | 84.1% |
| GPQA Diamond | 79.8% | 78.3% | 77.8% | 81.3% |
| GSM8K | 97.7% | 97.8% | 97.4% | 97.4% |
| Minerva Math | 92.7% | 95.1% | 85.1% | 94.3% |

Nota: los resultados de PISmith se obtienen con inferencia sin modo thinking, mientras que el resto usan thinking habilitado. El modelo base Qwen3.6-27B alcanza 77.2% en SWE-bench Verified segun el blog oficial, aunque este dato no se incluye en la tabla del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: al menos 56 GB (el repositorio pesa 55.6 GB). Se recomiendan dos GPU de 40 GB (A100 o similar) o una GPU de 80 GB (H100, A100 80GB).
- No se proporcionan cuantizaciones oficiales; para ejecutar en GPU de consumo (RTX 4090 con 24 GB) seria necesario cuantizar manualmente a 8 bits o 4 bits, aunque no hay datos publicados sobre el rendimiento en ese escenario.
- El blog de Qwen menciona que el modelo base cabe en un Mac, lo que sugiere que con cuantizacion agresiva podria ejecutarse en equipos con 32-64 GB de RAM unificada, pero esto no esta confirmado para este fine-tune.
- Opciones de despliegue: el autor recomienda usar una version reciente de Transformers o vLLM con soporte para Qwen3.6. Tambien se menciona compatibilidad con Docker Model Runner y FriendliAI para inferencia como servicio.
- Para produccion con vLLM, se sugiere `tensor_parallel_size=2` en el ejemplo de codigo proporcionado.

## Comparativa con modelos similares

No existe una comparativa directa con otros modelos publicados de la misma categoria (defensa contra inyeccion indirecta) en la informacion disponible. Las alternativas mas proximas son los metodos de defensa mencionados en el paper: Meta-SecAlign y GRPO, que se aplican sobre el mismo modelo base Qwen3.6-27B. En terminos de tamano y arquitectura, el modelo comparte caracteristicas con otros fine-tunes de Qwen3.6-27B, pero su proposito especifico de seguridad lo distingue. Se puede comparar contra el modelo base sin defensa para medir la perdida de utilidad (que es minima segun los benchmarks). Para una comparativa completa con otros modelos de seguridad de tamano similar, no se dispone de datos publicados.

## Limitaciones y advertencias

- La inyeccion de prompts no esta resuelta de forma definitiva: nuevos espacios de busqueda, codificaciones alternativas, horizontes de ataque mas largos o presupuestos de consulta mayores pueden encontrar fallos.
- El modelo asume que la aplicacion host proporciona un limite de confianza fiable en el rol `input`; no infiere la confianza a partir de la semantica del texto. Si la aplicacion no separa correctamente los contenidos, la defensa no funciona.
- Los ataques PISmith y los demas reportados usan protocolos de inferencia distintos (con y sin thinking), por lo que sus tasas de exito no deben compararse directamente.
- Es una defensa a nivel de modelo contra inyeccion indirecta, no un sustituto de defensas contra jailbreaks ni de controles de autorizacion a nivel de sistema (privilegio minimo, sandboxing, confirmacion del usuario).
- El modelo hereda las capacidades, sesgos, modos de fallo y requisitos de recursos de Qwen3.6-27B, incluyendo posibles sesgos en contenido generado.
- Los resultados finitos de los benchmarks no establecen una robustez universal; se recomienda evaluar en el dominio de aplicacion especifico.
- Solo se soporta el idioma ingles de forma nativa; otros idiomas pueden presentar degradacion de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pybbb/Qwen3.6-27B-SecOPD
- Paper SecOPD: https://huggingface.co/papers/2608.21500
- Pagina del proyecto: https://pppyb.github.io/SecOPD/
- Codigo de entrenamiento y evaluacion: https://github.com/pppyb/SecOPD
- Blog de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Guia externa sobre Qwen 3.6-27B: https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Despliegue en FriendliAI: https://friendli.ai/models/pybbb/Qwen3.6-27B-SecOPD
