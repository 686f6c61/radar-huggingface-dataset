# BrCamp/bee-350m-pt-assistente

## Resumen

El modelo `BrCamp/bee-350m-pt-assistente` es un adaptador LoRA sobre el modelo base `BrCamp/bee-350m-pt-base`, un transformer decoder-only de 350 millones de parámetros entrenado desde cero en portugués. Este adaptador está diseñado específicamente para tareas agénticas: realiza llamadas a herramientas en formato JSON cuando el catálogo de funciones disponible es aplicable, y responde en texto natural normal cuando ninguna herramienta es adecuada, en lugar de rechazar la petición como hace su modelo gemelo `bee-350m-pt-agentico`.

El modelo resuelve un problema práctico en asistentes conversacionales en portugués: la integración de capacidades de tool-use sin sacrificar la utilidad general del chat. Al ser un adaptador PEFT, solo añade unos pocos megabytes al modelo base, lo que permite desplegarlo con recursos mínimos. Es relevante ahora porque ofrece una alternativa ligera y de código abierto (licencia Apache 2.0) para construir asistentes en portugués que necesiten ejecutar acciones (enviar correos, consultar APIs) y a la vez mantener conversaciones fluidas, traducciones o resúmenes.

El desarrollo corre a cargo de BrCamp (Bruno Campidelli), que también publica el corpus de entrenamiento `bee-corpus-pt-22b` y el modelo base. La documentación técnica y el código están disponibles en un repositorio público de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (similar a Qwen3 según tags del modelo base, sin confirmar) |
| Parametros totales | 350M (modelo base) + parametros LoRA del adaptador (no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el ejemplo de uso emplea bfloat16; se puede cuantizar a 8 o 4 bits) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo base) + adaptador PEFT (LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `BrCamp/bee-350m-pt-base`, un modelo de 350 millones de parametros entrenado desde cero con datos en portugues (el corpus `bee-corpus-pt-22b` sugiere 22 mil millones de tokens). La arquitectura del base sigue el patron de los transformers decoder-only modernos, con atencion causal y posiblemente algunas innovaciones de Qwen3 (como atención con RoPE o mecanismos de sliding window), aunque no se detallan en la documentacion disponible.

El entrenamiento del adaptador LoRA utilizo un corpus de 6.739 ejemplos con llamada de herramienta y 4.421 ejemplos negativos (peticiones para las que ninguna herramienta del catalogo es adecuada). A diferencia del adaptador gemelo `agentico`, que fue entrenado para rechazar sistemáticamente estos negativos, aqui los prompts negativos fueron reescritos por un modelo profesor para que el modelo responda de forma util cuando la peticion es respondible por razonamiento (calcular, convertir, explicar) y, cuando la accion requiere intervenir en el mundo real, indique claramente que no puede ejecutarla sin usar una formula fija ni fingir que la ha realizado.

Se aplicaron dos guardas mecanicas durante la generacion del corpus de entrenamiento: una que detectaba formulas de rechazo (captura el 79,9% de las rechazos originales) y otra que rechazaba afirmaciones de valores vivos (por ejemplo, "hoy 1 USD vale 0,93 EUR"), que elimino el 2,3% de las generaciones. No se menciona el uso de RLHF o DPO; el proceso se baso en supervisión directa con datos generados por un profesor.

## Capacidades

- Llamada a herramientas (function calling) en formato JSON: dado un catalogo de herramientas (por ejemplo, `send_email`), el modelo genera un objeto JSON con el nombre de la herramienta y sus argumentos.
- Respuesta conversacional en texto natural: cuando ninguna herramienta es aplicable, responde directamente al usuario en portugues, sin rechazar la peticion.
- Razonamiento basico: puede resolver cuentas, conversiones de unidades y explicaciones sencillas.
- Traduccion portugues-ingles e ingles-portugues: aunque con resultados variables segun la semilla de entrenamiento.
- Resumen de textos: cobertura del 72,8% en tareas de resumen (frente al 12,4% del adaptador `agentico`).
- Atencion al cliente: genera respuestas en JSON valido en un 30,9% de los casos, aunque su utilidad real es limitada (ver limitaciones).
- Seguimiento de instrucciones: puntuacion IFEval-PT del 29,2%, comparable al adaptador gemelo.
- Analisis de sentimiento: verosimilitud del 56,8%, por debajo del piso lexico de 60 palabras (79,0%).
- No soporta vision, audio ni modos de pensamiento extendido.

## Casos de uso

- Asistentes conversacionales en portugues con integracion de APIs: el modelo puede gestionar un chat donde el usuario pide enviar un correo, consultar el tiempo o buscar informacion, generando la llamada JSON adecuada. Su capacidad de responder en texto cuando no hay herramienta evita interrupciones en la conversacion.
- Automatizacion de tareas de oficina: por ejemplo, un bot que recibe comandos como "agenda una reunion" o "envia un recordatorio" y produce la estructura JSON necesaria para que un sistema externo ejecute la accion.
- Chatbots de atencion al cliente para pequenas empresas: puede manejar preguntas frecuentes, resolver dudas sobre productos o servicios y escalar a un agente humano cuando sea necesario, gracias a su capacidad de seguir instrucciones y generar respuestas coherentes.
- Traduccion asistida en contextos ligeros: aunque la calidad es inferior a modelos grandes, puede servir como capa de traduccion rapida en aplicaciones donde el presupuesto computacional es limitado y el error tolerable.
- Resumen de documentos o noticias en portugues: su cobertura del 72,8% en resumen lo hace util para generar extractos breves de articulos largos, siempre que se acepte cierta variabilidad.
- Prototipado rapido de agentes con tool-use: al ser un adaptador pequeno y con licencia Apache 2.0, es ideal para experimentar con arquitecturas de agentes en entornos de desarrollo, sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion con 3 semillas de entrenamiento, comparando este adaptador con su gemelo `bee-350m-pt-agentico`. El holdout incluye 536 casos con herramienta y 268 sin herramienta, con catalogos de 1 a 6 herramientas no vistas en entrenamiento.

| Metrica | `agentico` (recusa) | **este** (responde) |
|---|---:|---:|
| Herramienta correcta | 84,1% ± 1,6 | 77,7% ± 1,4 |
| Ejecuto y cumplio | 74,0% ± 1,9 | 68,1% ± 1,3 |
| Dejo de llamar cuando debia | 9,0% ± 1,7 | 15,8% ± 0,8 |
| Llamo cuando no debia | 17,2% ± 0,4 | **14,6% ± 0,4** |
| Macro (ejecuto + recusa correcta)/2 | 78,4% ± 1,0 | 76,8% ± 0,8 |

Fuera del eje de herramientas, el adaptador recupera capacidades que el `agentico` pierde:

| Tarea | `agentico` | **este** |
|---|---:|---:|
| Resumen — cobertura | 12,4% ± 15,5 | **72,8% ± 7,0** |
| Resumen — respuestas (de 150) | 0 · 4 · 52 | **117 · 117 · 94** |
| Atencion al cliente — JSON valido | 0,4% ± 0,7 | **30,9% ± 7,6** |
| Traduccion en→pt (chrF2) | 17,97 ± 0,78 | **27,47 ± 6,12** |
| Traduccion pt→en (chrF2) | 12,99 ± 0,24 | **19,10 ± 1,36** |
| Seguimiento de instrucciones (IFEval-PT) | 29,3% ± 0,9 | 29,2% ± 0,8 |
| Sentimiento (verosimilitud) | **71,0% ± 13,3** | 56,8% ± 2,1 |

El modelo no reporta resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. La unica metrica de codigo mencionada es 0% de pass@1, tanto aqui como en el adaptador gemelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bfloat16 ocupa aproximadamente 700 MB; el adaptador LoRA anade unos pocos MB. Con overhead de activaciones y cache, se puede ejecutar en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB, como NVIDIA GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien funciona en CPU con llama.cpp si se convierte a GGUF, aunque con mayor latencia.
- Cabe en GPUs de consumo: si, incluso en tarjetas integradas de ultima generacion con suficiente memoria compartida.
- Opciones de despliegue: Transformers + PEFT (como en el ejemplo oficial), vLLM (si se fusiona el adaptador con el base), llama.cpp (tras conversion a GGUF), Ollama (empaquetando el modelo), o TGI (Text Generation Inference).
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 350M, se espera una latencia de decenas de milisegundos por token en GPU moderna y un throughput de varios cientos de tokens por segundo con batch.

## Comparativa con modelos similares

La comparativa mas directa es con su gemelo `BrCamp/bee-350m-pt-agentico`, que comparte base y datos de entrenamiento pero cambia la forma de respuesta ante peticiones sin herramienta.

| Caracteristica | `bee-350m-pt-assistente` | `bee-350m-pt-agentico` |
|---|---|---|
| Parametros | 350M + LoRA | 350M + LoRA |
| Llamada de herramientas | Si (JSON) | Si (JSON) |
| Respuesta sin herramienta | Texto natural | Rechazo sistematico |
| Precision herramienta correcta | 77,7% | 84,1% |
| Tasa de llamadas indebidas | 14,6% | 17,2% |
| Capacidad conversacional | Alta | Baja (rechaza traducciones, resumenes) |
| Licencia | Apache 2.0 | Apache 2.0 |

Otros modelos pequenos en portugues, como los basados en Qwen2.5-0.5B o Gemma-2-2B, no tienen una especializacion en tool-use tan marcada y suelen requerir ajuste fino adicional. No se dispone de comparativas publicas con estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Catalogo de herramientas limitado a 6: el entrenamiento no incluye catalogos mayores y la seleccion de herramientas degrada con el tamaño del catalogo. Se recomienda filtrar las herramientas antes de enviarlas al modelo.
- Traduccion inestable: la calidad de traduccion oscila mucho entre semillas (desviacion tipica de 6,12 puntos chrF2). La peor semilla queda solo 0,25 puntos por encima del piso de copiar la fuente sin traducir.
- Atencion al cliente poco fiable: aunque el 30,9% de las respuestas son JSON valido, la utilidad real es del 0,0% (ninguna respuesta sirve para un caso real). Un piso de reglas alcanza el 60,4%.
- Codigo: 0% de pass@1 en tareas de programacion. No es adecuado para generacion de codigo.
- Sesgo de idioma: entrenado exclusivamente en portugues, puede tener un rendimiento pobre en otros idiomas y reflejar sesgos culturales o regionales del corpus.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion o afirmar haber ejecutado acciones que no ha realizado. Las guardas mecanicas del entrenamiento reducen pero no eliminan este riesgo.
- Restricciones de uso comercial: licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las politicas de las plataformas donde se despliegue.
- No es un modelo de proposito general: su especializacion en tool-use y portugues limita su aplicacion a dominios donde se requiera interaccion agéntica en este idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrCamp/bee-350m-pt-assistente
- Modelo base: https://huggingface.co/BrCamp/bee-350m-pt-base
- Adaptador gemelo (agentico): https://huggingface.co/BrCamp/bee-350m-pt-agentico
- Repositorio de codigo y datos: https://github.com/brcampidelli/llm-ptbr
- Dataset de entrenamiento del base: https://huggingface.co/BrCamp/bee-corpus-pt-22b
