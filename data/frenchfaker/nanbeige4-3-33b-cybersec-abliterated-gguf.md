# FRENCHFAKER/Nanbeige4.3-33B-cybersec-abliterated-GGUF

## Resumen

Este repositorio contiene una versión GGUF del modelo Nanbeige4.3-33B sometida a *abliteration*, una técnica de ablación de la dirección de rechazo en el espacio de activaciones que elimina el comportamiento de negativa del modelo ante peticiones sensibles. El modelo base es Nanbeige4.3-33B, un modelo denso de razonamiento de 33.118.977.024 parámetros (33,1 B) desarrollado por el equipo Nanbeige, descrito por el autor como especialmente competente en uso de herramientas y flujos agénticos. La modificación y la conversión a GGUF corren a cargo del usuario FRENCHFAKER.

El problema que aborda esta ficha es concreto: el modelo original rechaza aproximadamente el 80 % de las peticiones de un conjunto de 50 prompts sensibles, lo que lo inutiliza para investigación en seguridad ofensiva autorizada y pruebas de penetración. Según la model card, este build reduce esa tasa de rechazo al 8 %, y a cerca del 0 % en prompts específicamente de estilo pentest, manteniendo coherencia, razonamiento y *tool calling*.

Es relevante ahora porque combina tres piezas poco frecuentes: un modelo denso de 33B con capacidades agénticas, una ventana de contexto que el autor ejemplifica en 24.576 tokens y un único archivo GGUF de ~17 GB que cabe en una GPU de 24 GB. El repositorio es muy reciente (creado el 25 de octubre de 2026), no tiene descargas ni *likes*, y no cuenta con evaluaciones independientes más allá de las mediciones del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Nanbeige4.3-33B); número de capas, tipo de atención y detalles internos no disponibles |
| Parámetros totales | 33.118.977.024 (33,1 B), dato de safetensors del modelo base |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible como especificación oficial; el comando de ejemplo del autor arranca con `-c 24576` (24.576 tokens) |
| Tipos de cuantización | GGUF IQ4_XS (~17 GB); el repositorio no lista otras cuantizaciones |
| Idiomas soportados | Inglés (en) y francés (fr), según las etiquetas del repositorio |
| Licencia | Apache-2.0, heredada del modelo base |
| Formato de pesos | GGUF (llama.cpp, LM Studio y clientes compatibles con la API de OpenAI) |
| Tamaño del repositorio | 18,2 GB |
| Modificaciones | *Abliteration* por ablación de la dirección de rechazo, más cuantización a GGUF |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 33,1 B parámetros con comportamiento de razonamiento explícito: genera una cadena de pensamiento antes de responder, por lo que requiere un `max_tokens` generoso. La model card del build no aporta detalles sobre el dataset de preentrenamiento, el número de tokens vistos, la composición de los datos ni la secuencia de ajuste (SFT, RLHF o DPO) aplicada por el equipo Nanbeige; esa información no está disponible en el material proporcionado y debe consultarse en el repositorio del modelo base.

La innovación técnica de este repositorio no está en el entrenamiento, sino en la interveción posterior: se aplica *abliteration*, es decir, se identifica la dirección de activación asociada al comportamiento de rechazo y se ablaciona de los pesos, de modo que el modelo deja de activar la negativa sin reentrenar. El autor afirma que el razonamiento, la coherencia y el *tool calling* se preservan, y que se trata del primer build *abliterated* de Nanbeige4.3-33B del que tiene constancia. No se documenta el conjunto de datos de calibración usado para calcular la dirección de rechazo, ni el método exacto (por ejemplo, diferencias de medias entre prompts dañinos e inofensivos, o proyecciones por capa).

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento previo a la respuesta.
- Razonamiento y resolución de problemas en varios pasos, heredado del modelo base.
- *Tool calling* / *function calling* y comportamiento agéntico, capacidad destacada por el autor como punto fuerte del modelo original.
- Uso en *pipelines* de agentes que encadenan llamadas a herramientas y requieren contexto largo (el ejemplo del autor configura 24.576 tokens).
- Capacidades multilingües limitadas a inglés y francés según las etiquetas del repositorio; el grado real de competencia en francés no está cuantificado.
- Respuesta a peticiones de seguridad ofensiva que el modelo original rechaza: explotación, reconocimiento, análisis de vulnerabilidades y similares, según la medición del autor (de 80 % a 8 % de rechazos).
- Compatibilidad con servidores compatibles con la API de OpenAI, lo que permite integrarlo en *frameworks* de agentes existentes sin adaptadores.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo puede redactar y comentar cargas útiles, comandos de reconocimiento y guiones de explotación sobre sistemas propios o con permiso escrito, allí donde el modelo original se negaría en el 80 % de los casos.
- Investigación en seguridad y *red teaming*: generación de escenarios de amenaza, análisis de superficies de ataque y revisión de configuraciones inseguras en entornos de laboratorio aislados.
- Análisis de código con orientación a vulnerabilidades: con 33B parámetros densos y capacidad de razonamiento, puede recorrer fragmentos largos y explicar el flujo de datos que lleva a una inyección o un fallo de control de acceso.
- Automatización agéntica con herramientas: al soportar *tool calling* y contextos de decenas de miles de tokens, encaja en agentes que consultan APIs, ejecutan comandos en un *sandbox* y encadenan varios pasos.
- Asistente técnico bilingüe inglés-francés: atención a documentación y conversaciones técnicas en esos dos idiomas, sin cobertura verificada de castellano.
- Despliegue local en estación de trabajo: un único archivo IQ4_XS de ~17 GB sobre una RTX 3090 permite un asistente privado sin salida de datos a la nube, requisito habitual en entornos de seguridad.
- Evaluación de robustez de filtros de seguridad: comparar las respuestas del modelo base y de este build sirve para medir qué información bloquea un alineamiento determinado y con qué granularidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo aportado por el autor es la tasa de rechazo sobre un conjunto propio de 50 prompts dañinos o sensibles:

| Modelo | Tasa de rechazo | Rechazos / total |
|---|---|---|
| Nanbeige4.3-33B (original) | 80 % | 40 / 50 |
| Este build (abliterated) | 8 % | 4 / 50 |

El autor indica que la cifra del 8 % es conservadora y que, tras reinspección manual, varios de los casos marcados en realidad cumplen la petición. También señala que en prompts de estilo pentest los rechazos bajan a ~0 %. Se trata de una medición del propio autor, sin protocolo publicado ni replicación independiente.

Rendimiento de inferencia declarado: aproximadamente 33 tok/s con el archivo IQ4_XS en una única GPU de 24 GB (RTX 3090), con `-ngl 999`, atención *flash* activada y caché KV cuantizada en q8_0.

## Requisitos de hardware

- VRAM estimada: ~17 GB para los pesos en IQ4_XS, más la caché KV. Con contexto de 24.576 tokens y caché KV en q8_0, el total se mantiene dentro de los 24 GB según el autor.
- GPU recomendadas: una RTX 3090 (24 GB) es suficiente según la model card. GPU de 24 GB en adelante (RTX 4090, A10G, L4 de 24 GB, A100 40/80 GB, H100) dan margen adicional para contextos mayores o caché sin cuantizar.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB. En 16 GB o menos no cabe con esta cuantización; haría falta una cuantización más agresiva, no publicada en el repositorio.
- Opciones de despliegue: llama.cpp (`llama-server`) es la vía documentada, con `--jinja` para plantillas de chat, `-fa on` para atención *flash* y `--cache-type-k/v q8_0`. También LM Studio y cualquier cliente compatible con la API de OpenAI apuntando al servidor local. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Throughput: ~33 tok/s en RTX 3090 con IQ4_XS según el autor. No hay datos de latencia por petición ni de rendimiento con *batching* concurrente.
- Nota práctica: al ser un modelo de razonamiento, el consumo de tokens de salida es alto (incluye el bloque de pensamiento), lo que reduce el throughput efectivo por petición terminada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo (50 prompts) | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B (base) | 33,1 B denso | No disponible | 80 % | Apache-2.0 | No disponible en la información | Repositorio oficial de Nanbeige |
| Este build (cybersec-abliterated) | 33,1 B denso | No disponible (ejemplo con 24.576) | 8 % | Apache-2.0 | GGUF IQ4_XS | Repositorio de FRENCHFAKER, 0 descargas |
| Otros builds *abliterated* de ~33B | No disponible | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas verificables en la información proporcionada |

El autor afirma que este es el primer build *abliterated* de Nanbeige4.3-33B del que tiene constancia. No se dispone de datos para comparar con otras familias de modelos del mismo tamaño en rendimiento de razonamiento o de código, porque no hay benchmarks publicados en el material consultado.

## Limitaciones y advertencias

- Los filtros de seguridad han sido eliminados de forma deliberada: el modelo responderá a peticiones que el original rechaza, incluidas las potencialmente peligrosas. El uso indebido es responsabilidad exclusiva del usuario y puede infringir la legislación aplicable.
- Uso previsto restringido por el autor a investigación y pruebas de seguridad autorizadas sobre sistemas propios o con permiso escrito. No hay salvaguardas técnicas que impongan esa restricción.
- La *abliteration* puede degradar sutilmente capacidades del modelo base (razonamiento, precisión factual, estabilidad en contextos largos). No se han publicado evaluaciones que cuantifiquen esa posible degradación.
- Riesgo de alucinación inherente a un modelo de 33B sin verificación factual, agravado en dominios técnicos donde el modelo puede inventar CVE, rutas de explotación o APIs inexistentes.
- Cobertura lingüística declarada solo para inglés y francés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- La cifra de reducción de rechazos procede de una medición del propio autor sobre 50 prompts, sin dataset público, sin repeticiones y sin revisión independiente. No debe tratarse como un resultado validado.
- La licencia Apache-2.0 permite uso comercial, pero eso no exime del cumplimiento de normativa sectorial, contractual o penal en el uso del modelo.
- Repositorio con 0 descargas y 0 *likes*, creado y actualizado el mismo día: no hay historial de mantenimiento, ni issues, ni garantía de soporte. Se distribuye tal cual, sin garantía.
- Solo se publica una cuantización (IQ4_XS). No hay versión en safetensors ni cuantizaciones menores para hardware con menos de 24 GB de VRAM.

## Enlaces

- Repositorio HuggingFace de este build: https://huggingface.co/FRENCHFAKER/Nanbeige4.3-33B-cybersec-abliterated-GGUF
- Modelo base Nanbeige4.3-33B: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Paper, blog técnico, repositorio de código o demo adicionales: no disponible en la información proporcionada.
- Nota: los resultados de búsqueda web devueltos para esta consulta no contenían material técnico relevante sobre el modelo y se han descartado.
