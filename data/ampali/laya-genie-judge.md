# ampali/laya-genie-judge

## Resumen

Laya (publicado en el repositorio `ampali/laya-genie-judge`) es un modelo de "System One" orientado a la toma de decisiones tipadas: recibe un estado (texto, JSON, ticket de soporte, traza de agente) y un conjunto de preguntas tipadas, y devuelve respuestas estructuradas con probabilidades calibradas en un único forward pass. No genera texto libre de forma autorregresiva, sino que clasifica y puntua. Segun la model card, el modelo fue desarrollado por Convai Innovations y esta afinado sobre las 1.200 casos de entrenamiento (6.000 decisiones) del benchmark independiente `LocalLLaMA/typed-decisions`.

El checkpoint pesa 421.293.830 parametros (unos 421 M) segun los datos reales de safetensors, con un repositorio de 0,8 GB. Se distribuye bajo licencia Apache 2.0 y es compatible con la libreria `transformers`. Su propuesta de valor es sustituir al patron "LLM-as-a-judge" por un motor de decision no autorregresivo, mas rapido y con coste cero en autoalojamiento, pensado para integrarse en pipelines de agentes.

Es relevante ahora porque cubre un nicho concreto: decisiones acotadas (eleccion tipada, puntuacion, si/no) con abstencion controlada por confianza, en lugar de generacion abierta. En el conjunto de test oficial de 400 casos (2.000 decisiones) declara 0,900 de exactitud, por encima del techo de autoacuerdo del profesor (0,735). El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No autorregresiva, motor de decision "System One" (clasificacion tipada en un unico forward pass); detalles internos no disponibles |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo declara safetensors) |
| Idiomas soportados | No disponible en los metadatos de HuggingFace; fuentes externas citan 100+ idiomas para la familia Laya |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe Laya como un modelo no autorregresivo de tipo "System One": en lugar de generar una respuesta token a token, evalua un estado y un conjunto de preguntas tipadas y emite en una sola pasada respuestas con probabilidades calibradas. Las etiquetas del repositorio (`system-one`, `calibrated-decisions`, `rlcd`, `structured-decisions`, `typed-decisions`) apuntan a un entrenamiento orientado a calibracion y a decisiones estructuradas, presumiblemente con tecnicas de refuerzo o comparacion sobre clasificacion, aunque la model card no detalla el pipeline completo ni la composicion del dataset de preentrenamiento.

El ajuste fino se realizo sobre las 1.200 casos de entrenamiento (6.000 decisiones) del benchmark `LocalLLaMA/typed-decisions`, que cubre cuatro dominios: observabilidad de trazas de agente, atencion al cliente, procesamiento de facturas e incidentes de seguridad. No se especifica el numero total de tokens de entrenamiento, la arquitectura base ni si hubo fases de RLHF o DPO mas alla de la etiqueta `rlcd`.

## Capacidades

- Decisiones de eleccion tipada: seleccionar una opcion entre un conjunto cerrado (por ejemplo, a que cola dirigir un ticket).
- Decisiones de puntuacion: asignar un valor numerico (por ejemplo, urgencia) con MAE declarado de 0,147.
- Decisiones si/no: comprobar si una condicion declarada se cumple.
- Calibracion de probabilidades: Brier score de 0,036 y ECE de 0,047 en el benchmark declarado.
- Abstencion controlada por confianza (confidence-gated abstention), segun fuentes externas.
- Procesamiento de estados heterogeneos: tickets, correos, conversaciones o JSON.
- Inferencia en una sola pasada no autorregresiva, sin generacion de texto.
- Soporte multilingue segun fuentes externas (100+ idiomas para la familia Laya); no confirmado en los metadatos del repositorio.
- No se documentan capacidades de tool calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Triage de tickets de soporte: dado el texto de una incidencia, el modelo decide en una sola pasada a que cola enrutarla y con que prioridad, sin generar una respuesta redactada.
- Enrutamiento de correo entrante: clasificacion tipada de mensajes hacia departamentos (facturacion, soporte, seguridad) con probabilidad asociada para umbralizar el envio automatico.
- Observabilidad de agentes: evaluar trazas de agente y responder preguntas tipadas sobre si una ejecucion cumplio un criterio, util para detectar fallos en produccion.
- Procesamiento de facturas: comprobar condiciones declaradas (importe coherente, proveedor valido) y puntuar el nivel de riesgo de cada documento.
- Deteccion de incidentes de seguridad: clasificar eventos y emitir un si/no sobre si superan un umbral de gravedad, con abstencion cuando la confianza es baja.
- "Juez" de calidad en pipelines de evaluacion: sustituir llamadas a un LLM generativo por decisiones tipadas de bajo coste y baja latencia, con coste cero en autoalojamiento.
- Moderacion o filtrado por reglas: aplicar decisiones estructuradas sobre contenido en lugar de generar justificaciones textuales.
- Backend de decisiones para agentes: alimentar a un orquestador con etiquetas y probabilidades calibradas para decidir el siguiente paso.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados: el campo `verified` del model-index es `false`). Conjunto de test oficial de 400 casos (2.000 decisiones).

| Modelo | Tipo | Accuracy | Soft Acc | Brier score | ECE | Score MAE | Dentro de 1 nivel | Latencia (p50) | Coste/caso |
|---|---|---|---|---|---|---|---|---|---|
| Laya (este modelo) | fine-tuned | 0,900 | 0,823 | 0,036 | 0,047 | 0,147 | 0,985 | 1155,1 ms | 0,00 $ (autoalojado) |
| TypeSafe Jev 1.13.0 | general | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 | 0,952 | 710 ms | 0,0004 $ (API) |
| ModernBERT-base (149 M) | specialist | 0,646 | 0,542 | 0,119 | 0,179 | 0,444 | 0,931 | 349 ms | 0,00 $ |
| Teacher Self-Agreement | techo | 0,735 | - | - | - | - | - | - | - |

Metricas del model-index oficial: accuracy 0,900 y brier_score 0,036 sobre `LocalLLaMA/typed-decisions`. La model card afirma que estos resultados superan a TypeSafe Jev 1.13.0 (0,727) y al techo de autoacuerdo del profesor (0,735). Otras fuentes externas citan una latencia de aproximadamente 33 ms para la familia Laya, en conflicto con los 1155,1 ms de p50 declarados en la model card para este checkpoint.

## Requisitos de hardware

- VRAM estimada (solo pesos, calculada a partir de 421 M parametros): ~1,7 GB en fp32, ~0,84 GB en fp16/bf16, ~0,42 GB en int8 y ~0,21 GB en int4. Anade margen para activaciones y overhead del runtime.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc.
- Fuentes externas indican que la inferencia puede ejecutarse integramente en CPU, lo que elimina el requisito de GPU para cargas moderadas.
- Opciones de despliegue: al menos `transformers` (libreria declarada), la propia libreria `laya` (`pip install laya`) y, segun el repositorio, `endpoints_compatible`. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia declarada en el benchmark: 1155,1 ms de p50 por caso en autoalojamiento, frente a los 349 ms de ModernBERT-base. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Accuracy (typed-decisions) | Brier | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laya (este modelo) | 421 M | Fine-tuned, System One no autorregresivo | 0,900 | 0,036 | Apache 2.0 | Pesos abiertos en HuggingFace |
| TypeSafe Jev 1.13.0 | No disponible | Generalista, System One | 0,727 | 0,148 | No disponible (cerrado) | API de pago |
| ModernBERT-base | 149 M | Especialista | 0,646 | 0,119 | No disponible en la informacion | Pesos publicos |

No se dispone de datos de contexto, idiomas ni cuantizacion de los modelos comparados para ampliar la tabla.

## Limitaciones y advertencias

- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`).
- El repositorio no registra descargas ni "likes", por lo que no existe validacion independiente de la comunidad.
- El modelo esta ajustado a un benchmark concreto (`LocalLLaMA/typed-decisions`) y a cuatro dominios; el rendimiento fuera de esas tareas no esta documentado.
- Al ser un modelo de decision tipada, no genera texto explicativo: no sirve para tareas de redaccion, resumen o dialogo abierto.
- No se documentan sesgos, idiomas reales soportados ni comportamiento ante entradas fuera de distribucion.
- No se publican la longitud de contexto ni los tipos de cuantizacion disponibles; esto limita la planificacion de despliegues con requisitos de memoria ajustados.
- Posible riesgo de calibracion deficiente fuera del benchmark de referencia, dado que las metricas de calibracion solo estan reportadas en ese conjunto.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el origen de los datos de entrenamiento, no detallado en la model card.
- Existe una discrepancia entre la latencia declarada en la model card (1155,1 ms) y la citada por fuentes externas (~33 ms) para la familia Laya; conviene medirla en el entorno objetivo.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, habituales en modelos "juez" alternativos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ampali/laya-genie-judge
- Dataset del benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Organizacion desarrolladora (Convai Innovations): https://huggingface.co/convaiinnovations
- Checkpoint referenciado en el quickstart: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Blog sobre como funciona y como ejecutarlo en local: https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Tutorial en AI Frontier Post: https://aifrontierpost.com/articles/laya-typed-decisions-tutorial/
- Ficha en mcpmarket (Laya Judge): https://mcpmarket.com/server/laya-judge
- Entrada en Wikiprompt AI Wiki: https://www.wikiprompt.org/wiki/laya
- Comparativa de modelos juez 2026: https://futureagi.com/blog/best-llm-judge-models-2026/
