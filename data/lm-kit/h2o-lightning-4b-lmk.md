# lm-kit/h2o-lightning-4b-lmk

## Resumen

H2O-Lightning-4B es un modelo de decisión de 4.205.751.296 parámetros desarrollado por H2O.ai sobre la base de Qwen3.5 4B. A diferencia de un modelo generativo convencional, no redacta texto libre: recibe un contenido y una batería de preguntas tipadas (elección entre opciones, nivel en una escala ordenada o sí/no) y devuelve, en un único forward pass, la probabilidad de cada respuesta. El resultado es siempre una de las opciones aportadas por el usuario, acompañada de un valor numérico sobre el que una regla de negocio puede actuar directamente.

El repositorio `lm-kit/h2o-lightning-4b-lmk` es un empaquetado de dicho modelo para LM-Kit.NET, el SDK de IA on-device de LM-Kit para .NET, y para LM-Kit One. Incluye los pesos en GGUF con cuantización Q4_K_M y el proyector de visión en F16, sin modificar respecto al repositorio original `h2oai/h2o-lightning-4b-gguf`. El interés actual radica en su orientación a "system one": clasificación y enrutamiento de baja latencia, multimodal (texto, JSON e imágenes) y con salida estructurada y probabilística, un patrón cada vez más demandado en pipelines de agentes y automatización de flujos.

La licencia es Apache 2.0 y el modelo se distribuye con identificador `h2o-lightning:4b` dentro del catálogo de LM-Kit. El repositorio tiene un tamaño de 6,8 GB y, en el momento de la consulta, no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5 4B), con proyector de visión multimodal |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de decisión); F16 (proyector de visión) |
| Idiomas soportados | no disponible (la model card indica "la cobertura lingüística más amplia" del catálogo LM-Kit, sin listado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y archivo propietario `.lmk` (que empaqueta modelo y proyector) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5 4B, un transformer denso de aproximadamente 4,2 mil millones de parámetros. La variante publicada por H2O.ai lo convierte en un "decision model" orientado a system one: en lugar de generar secuencias de tokens, produce directamente distribuciones de probabilidad sobre un conjunto cerrado de respuestas tipadas (Choice, Score y YesNo). La inferencia se resuelve en un solo forward pass, lo que elimina la decodificación autoregresiva y reduce la latencia frente a un LLM generativo del mismo tamaño.

El componente multimodal se implementa mediante un proyector de visión independiente (`mmproj-lightning-f16.gguf`) en precisión F16, que LM-Kit empaqueta junto al modelo en el archivo `.lmk`. Los pesos GGUF son idénticos a los publicados en `h2oai/h2o-lightning-4b-gguf`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite a la ficha original de H2O.ai para los detalles de entrenamiento y evaluación.

## Capacidades

- Clasificación zero-shot con opciones definidas por el usuario: asignación de una categoría entre varias, con probabilidad asociada.
- Puntuación en escalas ordenadas: devuelve el nivel esperado dentro de una escala definida (por ejemplo, "puede esperar", "esta semana", "hoy", "ahora mismo").
- Respuestas booleanas con probabilidad: preguntas sí/no con el valor de probabilidad de "sí".
- Procesamiento de imágenes mediante el proyector de visión: responde preguntas tipadas sobre fotografías añadidas a la petición.
- Entrada de texto y JSON, con salida estructurada apta para ser consumida por reglas.
- Multimodal en una sola pasada: texto, JSON e imágenes combinados en la misma petición.
- Integración con agentes y flujos de trabajo a través del endpoint `POST /v1/systemone` y de la herramienta `decide` en LM-Kit One.
- No genera texto libre: la respuesta es siempre una de las opciones proporcionadas.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica cada ticket en equipos (facturación, envíos, técnico) y estima urgencia y necesidad de intervención humana en una sola llamada, como muestra el ejemplo de la model card. Es adecuado porque devuelve probabilidades accionables por reglas y evita generar respuestas libres.
- Triaje de correo entrante: clasificación de mensajes por departamento y prioridad con umbrales de confianza configurables, descartando o escalando casos por debajo del umbral.
- Verificación de reclamaciones con imagen: ante una queja de entrega, se adjunta la foto y se pregunta si el paquete aparece dañado, obteniendo una probabilidad que alimenta la política de reembolso.
- Moderación y control de calidad: evaluación sí/no de contenido o de imágenes contra criterios definidos, con la probabilidad como señal para revisión humana.
- Extracción de etiquetas en pipelines de datos: clasificación de documentos o registros JSON en categorías predefinidas sin necesidad de un LLM generativo, reduciendo coste y latencia.
- Automatización de decisiones en agentes: uso como herramienta `decide` dentro de flujos multi-paso para elegir la siguiente acción entre un conjunto acotado de opciones.
- Clasificación de imágenes en entornos .NET on-device: el empaquetado `.lmk` permite ejecutar el modelo y su proyector de visión localmente sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con cuantización Q4_K_M y 4,2 mil millones de parámetros, el peso de los pesos ronda los 2,5-3 GB, a lo que se suma el proyector de visión en F16 y la caché de contexto.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más de VRAM, dado el tamaño del modelo cuantizado, aunque no se confirma en la documentación.
- Opciones de despliegue: LM-Kit.NET (SDK .NET on-device) y LM-Kit One (endpoint `POST /v1/systemone`); los GGUF son compatibles con el ecosistema GGUF habitual, aunque la model card no detalla otros runners.
- Latencia y throughput: no disponibles; la arquitectura de decisión en un único forward pass está diseñada para baja latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H2O-Lightning-4B (LM-Kit) | 4,2 B | no disponible | Modelo de decisión multimodal (system one) | Apache 2.0 | GGUF y `.lmk` en Hugging Face |
| Qwen3.5 4B (base) | ~4 B | no disponible | LLM generativo | según variante | Hugging Face |
| LLM generativos de ~4 B para clasificación | ~4 B | variable | Clasificación mediante prompting generativo | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: no se han publicado benchmarks del modelo en la información proporcionada, y los modelos de decisión tipados con salida probabilística en un solo paso constituyen una categoría con pocos equivalentes directos.

## Limitaciones y advertencias

- El modelo no genera texto libre; solo responde a las preguntas tipadas que se le formulan. No es apto para tareas de redacción o diálogo abierto.
- El resultado es siempre una de las opciones proporcionadas, lo que traslada al usuario la responsabilidad de definir un conjunto de opciones completo y mutuamente excluyente.
- Las probabilidades deben calibrarse y umbralizarse antes de automatizar decisiones críticas; no se documenta la calibración del modelo.
- Riesgo de sesgo y alucinación inherente a los modelos derivados de Qwen3.5; no se detallan evaluaciones de sesgo en la información disponible.
- Cobertura lingüística no especificada: la model card afirma la mayor cobertura del catálogo LM-Kit, pero no enumera idiomas, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada, lo que impide planificar casos con documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el empaquetado `.lmk` está orientado a LM-Kit.NET y LM-Kit One; el uso fuera de ese ecosistema requiere recurrir a los GGUF originales.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no hay evidencia de uso en producción.

## Enlaces

- Repositorio LM-Kit: https://huggingface.co/lm-kit/h2o-lightning-4b-lmk
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- GGUF originales: https://huggingface.co/h2oai/h2o-lightning-4b-gguf
- SDK LM-Kit.NET: https://lm-kit.com/products/lm-kit-net/
