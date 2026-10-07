# baooo237/lab21-qwen35-triage-vi

## Resumen

`lab21-qwen35-triage-vi` es un adaptador LoRA publicado por el usuario `baooo237` sobre el modelo base `Qwen/Qwen3.5-0.8B`. No se trata de un modelo completo, sino de un ajuste fino de parametros de bajo rango (r=16, alpha=32) aplicado a todas las capas lineales del decodificador de texto, cuyo unico objetivo es convertir tickets de soporte al cliente en vietnamita en un JSON de triaje con cuatro campos: `intent`, `urgency`, `product` y `sentiment`.

El adaptador se entreno en el contexto de una practica de laboratorio (AICB-P2T3, dia 21) con 225 tickets sinteticos y tan solo 58 pasos de optimizacion, lo que lo situa en la categoria de prototipo educativo mas que de artefacto listo para produccion. El repositorio ocupa 0,1 GB y se distribuye en formato PEFT/safetensors, consumible mediante la libreria `peft` sobre el modelo base.

Su relevancia es fundamentalmente metodologica: sirve como ejemplo de adaptacion barata de un modelo pequeno a una tarea de clasificacion estructurada, pero tambien como caso de estudio de olvido catastrofico, ya que la propia model card documenta que la puerta de regresion fallo y que el adaptador responde a preguntas generales con JSON de triaje. La licencia no esta declarada y el modelo no registra descargas ni interacciones en HuggingFace en la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (modelo base `Qwen/Qwen3.5-0.8B`); r=16, alpha=32, aplicado a todas las capas lineales del decodificador de texto |
| Parametros totales | Adaptador: no disponible en la model card. Modelo base: 0,8 B segun su denominacion (`Qwen3.5-0.8B`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos de adaptador PEFT) |
| Idiomas soportados | Vietnamita (`vi`), unico idioma declarado |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

Otros datos del repositorio: tamano 0,1 GB, creado el 2026-10-07, actualizado el 2026-10-07, 0 descargas y 0 likes, `pipeline_tag` no disponible, region `us`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 32 insertado en todas las capas lineales del decodificador de texto del modelo base `Qwen/Qwen3.5-0.8B`. No se modifica la arquitectura subyacente del transformer: el adaptador anade matrices de bajo rango que se suman a las proyecciones originales, de modo que la inferencia requiere cargar primero el modelo base completo y despues los pesos PEFT. La model card no detalla la composicion de capas del modelo base (numero de capas, dimension oculta, cabezas de atencion) ni si emplea atencion con ventana deslizante o alguna variante de atencion lineal.

El entrenamiento se realizo sobre 225 tickets sinteticos en vietnamita y duro 58 pasos de optimizacion, una cifra muy reducida que explica tanto el ajuste estrecho a la tarea como el olvido catastrofico documentado. No se menciona el uso de RLHF, DPO ni ninguna etapa de alineacion posterior; el procedimiento descrito es un ajuste supervisado directo sobre pares ticket -> JSON de cuatro campos. La model card tampoco especifica el numero total de tokens vistos, la composicion del dataset sintetico, la distribucion de etiquetas ni los hiperparametros de optimizacion (learning rate, scheduler, precision). La unica innovacion tecnica reseñable es la interfaz de uso: un prompt de sistema fijo (`Phân loại ticket sau.`) seguido del ticket como turno de usuario.

## Capacidades

- Clasificacion de tickets de soporte en vietnamita: genera un JSON con los campos `intent`, `urgency`, `product` y `sentiment`.
- Salida estructurada y estable: la metrica de formato reportada es 1.0 tanto para el modelo base con prompt optimizado como para el adaptador, es decir, el JSON resultante siempre es parseable en la muestra evaluada.
- Mejora sustancial en la tarea objetivo: la metrica de acierto pasa de 0.5 (base con prompt optimizado) a 0.98 con el adaptador.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el unico idioma declarado es el vietnamita.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.
- Uso como asistente general: explicitamente NO soportado, tal como advierte la model card.

## Casos de uso

- Pretriaje de tickets en vietnamita: el adaptador puede colocarse delante de un sistema de helpdesk para asignar a cada ticket entrante una intencion, una urgencia, un producto y un sentimiento antes de que lo lea un agente humano. Es adecuado porque su salida es JSON estable (formato 1.0) y su acierto en la tarea es alto (0.98) dentro de la distribucion evaluada.
- Enrutamiento automatico a colas de soporte: los campos `product` e `intent` permiten dirigir el ticket a la cola especializada correspondiente, reduciendo el tiempo de primera asignacion.
- Priorizacion por urgencia: el campo `urgency` habilita una cola ordenada por criticidad, util para equipos con SLA diferenciados.
- Analisis de sentimiento agregado: el campo `sentiment` alimenta cuadros de mando de satisfaccion y alertas tempranas cuando aumenta la proporcion de tickets negativos.
- Etiquetado previo para entrenamiento: el JSON generado puede servir como etiquetado debil de grandes volumenes de tickets historicos, que despues se revisarian y corregirian por muestreo.
- Clasificacion por lotes de bajo coste: al apoyarse en un modelo base de 0,8 B, el adaptador permite procesar volumenes altos de tickets en hardware modesto, algo inviable con modelos de decenas de miles de millones de parametros.
- Prototipado docente o de investigacion: sirve como ejemplo reproducible de ajuste LoRA para clasificacion estructurada y como demostracion practica de los riesgos de olvido catastrofico en conjuntos de datos pequenos.

## Benchmarks y rendimiento

Unicos datos publicados en la model card (tarea de triaje en vietnamita sobre el conjunto evaluado por el autor):

| Sistema | Target (acierto en la tarea) | Regresion (tareas generales) | Formato |
|---|---|---|---|
| Base + prompt optimizado | 0,5 | 0,6222 | 1,0 |
| Este adaptador | 0,98 | 0,1333 | 1,0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se especifica el tamano del conjunto de evaluacion, su composicion ni la definicion exacta de las metricas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones para el modelo base de 0,8 B, no confirmadas por el autor): en fp16 en torno a 1,6-2 GB; en int8 en torno a 0,8-1,2 GB; en cuantizacion de 4 bits en torno a 0,4-0,8 GB, mas la cache KV segun la longitud de contexto efectiva.
- El adaptador en si es despreciable en tamano: con r=16 sobre un modelo de 0,8 B supone unos pocos megabytes, coherente con el repositorio de 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; por ejemplo RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, e incluso tarjetas con 4-6 GB si se cuantiza el modelo base. Para lotes grandes o despliegue en servidor, A100 o H100 resultan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, sin reservas relevantes en el rango de 8 GB o superior en fp16, y en el rango de 4 GB con cuantizacion.
- Opciones de despliegue: PEFT + Transformers para inferencia directa (la ruta documentada por el autor); vLLM con soporte de adaptadores LoRA para servir multiples adaptadores sobre el mismo modelo base; TGI si se fusiona el adaptador en los pesos; llama.cpp u Ollama solo tras fusionar el adaptador y convertir el modelo resultante a GGUF, conversion que el repositorio no proporciona.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados en la informacion proporcionada (mismo autor, misma tarea o mismo idioma). Como referencia interna se puede comparar el adaptador con su propio modelo base y con la alternativa de no entrenar:

| Sistema | Parametros | Contexto | Acierto en triaje | Regresion | Licencia |
|---|---|---|---|---|---|
| `lab21-qwen35-triage-vi` (adaptador) | 0,8 B (base) + LoRA r=16 | No disponible | 0,98 | 0,1333 | No disponible |
| `Qwen/Qwen3.5-0.8B` + prompt optimizado | 0,8 B | No disponible | 0,5 | 0,6222 | No disponible |
| Modelo generico de gran tamano con prompt | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Olvido catastrofico confirmado: la propia model card documenta que la puerta de regresion fallo y que el adaptador responde a preguntas generales devolviendo JSON de triaje. No debe usarse como asistente general bajo ninguna circunstancia.
- Degradacion medida en tareas generales: la metrica de regresion cae de 0,6222 a 0,1333 respecto al modelo base con prompt optimizado, lo que cuantifica el dano colateral del ajuste.
- Sobreajuste probable: 225 tickets sinteticos y 58 pasos de optimizacion son un regimen de entrenamiento muy reducido, con riesgo alto de que el rendimiento de 0,98 no se transfiera a trafico real con vocabulario, productos o formatos distintos.
- Datos sinteticos: la procedencia sintetica del conjunto de entrenamiento implica que las etiquetas reflejan las suposiciones del generador, no necesariamente las de un equipo de soporte real.
- Idioma unico: solo vietnamita. No hay evidencia de funcionamiento en castellano ni en ningun otro idioma.
- Ambito funcional cerrado: el modelo no hace tool calling, no razona en varios pasos y no mantiene conversaciones; cualquier uso fuera del triaje de tickets es una extrapolacion no validada.
- Licencia no declarada: al no especificarse licencia en el repositorio, no puede asumirse permiso de uso comercial. Ademas, el uso comercial queda condicionado a la licencia del modelo base `Qwen/Qwen3.5-0.8B`, que debe verificarse por separado.
- Cifras de rendimiento no auditadas: las metricas 0,98 / 0,1333 / 1.0 provienen exclusivamente del autor, sin conjunto de evaluacion descrito ni publicacion de resultados reproducibles.
- Contexto de origen: se trata de un entregable de laboratorio (AICB-P2T3, dia 21), sin mantenimiento ni versionado posteriores; el repositorio registra 0 descargas y 0 likes en la fecha de consulta.
- Advertencia de integridad: la model card y los metadatos son la unica fuente de informacion; no se ha verificado de forma independiente el contenido de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baooo237/lab21-qwen35-triage-vi
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
