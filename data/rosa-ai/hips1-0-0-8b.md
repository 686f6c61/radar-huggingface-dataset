# Rosa-AI/Hips1.0-0.8B

## Resumen

ROSA Hips 1.0 (0.8B) es un modelo de lenguaje de 752.393.024 parámetros desarrollado por PT Halcom Inovasi Teknologi (Halcom), con sede en Padang (Indonesia), y publicado bajo la organización Rosa-AI en Hugging Face. Se trata del miembro de menor huella de la familia ROSA, una plataforma de asistencia para entornos industriales y de tecnología de operaciones (OT) diseñada para ejecutarse on-premise, dentro de la red de planta, sobre hardware modesto. El modelo deriva de Qwen/Qwen3.5-0.8B-Base mediante un ajuste fino orientado a conversación industrial y uso de herramientas.

La propuesta de valor es la despliegabilidad: con 752M parámetros en BF16 ocupa aproximadamente 1,5 GB, arranca rápido y mantiene una latencia por consulta compatible con un operador que observa un proceso en vivo. Halcom lo comercializa como parte de tres productos (ROSA Edge para despliegue en planta, ROSA Web como interfaz de operador e ingeniero, y ROSA Token como acceso licenciado a modelos y capacidad de API), con dos modos de operación: Local Mode, totalmente on-premise y apto para requisitos de residencia de datos o air-gap, y API Mode, expuesto como API HTTP para despliegues multi-sitio.

Técnicamente emplea la arquitectura `Qwen3_5ForCausalLM`, un decodificador híbrido de atención lineal y atención completa, con 24 capas, tamaño oculto de 1024 y una longitud de contexto declarada de 262.144 tokens. Es un modelo exclusivamente de texto, en inglés, con licencia propietaria (`rosa-ai-proprietary`) y una identidad de sistema inyectada por plantilla que lo presenta siempre como ROSA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` — decodificador híbrido de atención lineal + atención completa; clase de configuración `RosaHipsConfig` (`model_type: rosa_hips`) |
| Parametros totales | 752.393.024 (0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el autor solo documenta BF16, ~1,5 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `rosa-ai-proprietary` (licencia `other`, propietaria de Rosa AI / Halcom) |
| Formato de pesos | safetensors (librería transformers; requiere `trust_remote_code=True`) |
| Capas | 24 |
| Tamano oculto | 1024 |
| Atencion | 8 cabezas de consulta, 2 cabezas KV, `head_dim` 256; esquema híbrido con 18 capas de atención lineal y 6 de atención completa (una de cada cuatro) |
| Vocabulario | 248.320 tokens, embeddings de entrada/salida atados, RoPE theta 1e7 |
| Tokens especiales | EOS `<\|im_end\|>`, PAD `<\|endoftext\|>`, sin BOS |
| Modalidad | Solo texto |
| Transformers minimo | 5.23.0 |
| Tamano del repositorio | 1,5 GB |
| Modelo base | Qwen/Qwen3.5-0.8B-Base |

## Arquitectura y entrenamiento

Hips 1.0 se construye sobre el modelo base Qwen3.5-0.8B y conserva su arquitectura de decodificador híbrido: 24 capas en las que 18 utilizan atención lineal y 6 utilizan atención completa, aplicada una de cada cuatro capas. La atención emplea 8 cabezas de consulta y 2 cabezas KV con dimensión de cabeza 256, lo que reduce el coste de caché KV frente a un esquema de atención completa puro y explica en parte la viabilidad de una ventana de 262.144 tokens en un modelo de este tamaño. El vocabulario es de 248.320 tokens con embeddings atados y RoPE theta de 1e7, coherente con contextos largos.

El repositorio incluye `configuration_rosa_hips.py` y `modeling_rosa_hips.py`, descritos por el autor como un shim de unas 20 líneas que vincula los pesos a la clase de configuración `rosa_hips`; ninguno contiene código de arquitectura, ya que ambos heredan de las clases de texto de Qwen3.5 en transformers y los pesos no se modifican. La carga exige `trust_remote_code=True`. No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron RLHF, DPO u otras técnicas de alineación posteriores al ajuste fino. Tampoco se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés orientada a operadores e ingenieros de planta.
- Respuesta a preguntas sobre estado de planta, alarmas, tags, dispositivos y tendencias históricas, siempre que los datos provengan de una respuesta de herramienta.
- Tool calling / function calling: decide cuándo invocar una herramienta y emite la llamada en el formato `<tool_call>` propio de ROSA.
- Redacción de notas de turno, resúmenes de incidentes y seguimientos de mantenimiento a partir de la salida de herramientas.
- Manejo de terminología industrial, abreviaturas y convenciones de nomenclatura de tags presentes en documentación de planta.
- Modo de razonamiento opcional: la plantilla de chat admite `enable_thinking=True`, que conserva el bloque `<think>`.
- Identidad de sistema fija: la plantilla inyecta siempre la identidad ROSA de Halcom; un mensaje de sistema del llamante se añade, no sustituye a dicha identidad.
- Sin capacidades de visión ni audio: los pesos no contienen torres multimodales y la plantilla rechaza contenido de imagen y vídeo.

## Casos de uso

- Asistencia interactiva a operadores en planta: el modelo responde preguntas sobre estado de proceso, alarmas y tags dentro de la red local, con una ventana de 262.144 tokens que permite arrastrar contexto extenso de turnos y documentación sin truncar.
- Integración con sistemas de monitorización y control: gracias al tool calling en formato `<tool_call>`, Hips puede decidir cuándo consultar una herramienta de telemetría y construir la llamada, de modo que las cifras en vivo provengan siempre del sistema y no de la memoria del modelo.
- Generación automática de notas de turno e informes de incidentes: a partir de la salida de herramientas, el modelo redacta resúmenes y seguimientos de mantenimiento en inglés técnico, reduciendo el trabajo administrativo del operador.
- Despliegue en entornos air-gapped o con residencia de datos estricta: con ~1,5 GB en BF16 y ejecución on-premise en Local Mode, encaja en plantas que no pueden enviar prompts ni telemetría a la nube.
- Asistente de consulta documental de planta: su familiaridad con abreviaturas y convenciones de tags lo hace adecuado para responder preguntas sobre documentación técnica y procedimientos internos.
- Despliegue multi-sitio mediante API: en API Mode, el modelo puede exponerse como servicio HTTP para varias plantas con gestión remota, manteniendo la latencia baja propia de un modelo de 0,8B.
- Prototipado rápido de asistentes industriales: su tamaño reducido y su arranque rápido permiten iterar sobre plantillas de chat, contratos de herramientas y flujos de operador antes de escalar a modelos mayores de la familia ROSA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16 para los pesos; el repositorio ocupa 1,5 GB. No se documentan otras precisiones ni cuantizaciones.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo, pero el autor no publica una lista de hardware validado.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño de 752M parámetros en BF16; no se especifican modelos concretos.
- Opciones de despliegue: la model card documenta únicamente transformers (>= 5.23.0) con `trust_remote_code=True` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El autor justifica el tamaño de 0,8B por su idoneidad para asistencia interactiva con latencia baja, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ROSA Hips 1.0 (0.8B) | 752.393.024 | 262.144 | Propietaria (`rosa-ai-proprietary`) | Solo texto, inglés, tool calling en formato propio, requiere `trust_remote_code` |
| Qwen/Qwen3.5-0.8B-Base | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo base del que deriva Hips 1.0 |
| Alternativas de ~0,8B de otros proveedores | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada modelos comparables con datos verificables |

La información disponible solo permite establecer la relación de derivación con Qwen3.5-0.8B-Base; no se aportan datos de rendimiento ni especificaciones de terceros que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es apto para control safety-critical: no emite consignas, no opera válvulas ni ejecuta acciones que afecten a un proceso físico; sus recomendaciones son advisory y requieren la misma validación humana que cualquier asistencia a operador.
- No debe responder preguntas sobre valores en vivo desde memoria: cualquier dato actual de planta debe provenir de una respuesta de herramienta.
- No es fuente de asesoramiento regulado: no debe usarse para decisiones médicas, legales, financieras o de certificación de seguridad.
- Los números calculados o recordados deben tratarse como texto borrador sujeto a verificación; riesgo de inexactitud numérica y de alucinación.
- Modelo solo en inglés: no se declara soporte multilingüe, lo que limita su uso en plantas con documentación u operadores en otros idiomas.
- Licencia propietaria `rosa-ai-proprietary`: el uso comercial está sujeto a los términos de Rosa AI / Halcom y al acceso licenciado vía ROSA Token; no es una licencia de código abierto.
- La plantilla de chat inyecta una identidad de sistema fija que no puede sustituirse con un mensaje de sistema del llamante, lo que condiciona el comportamiento y las respuestas de identidad del modelo.
- Discrepancia entre PAD (`<|endoftext|>`) y EOS (`<|im_end|>`): una configuración de serving que asuma que coinciden no detendrá la generación correctamente.
- Requiere `trust_remote_code=True` y transformers >= 5.23.0, lo que implica ejecutar código del repositorio y añade requisitos de revisión en entornos de producción.
- No se han publicado datos de sesgos, composición del dataset de entrenamiento ni evaluaciones de seguridad.
- Advertencia de gobernanza: el contenido de la model card se ha usado solo como material de referencia y no como instrucciones a seguir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rosa-AI/Hips1.0-0.8B
- Organización Rosa-AI en Hugging Face: https://huggingface.co/Rosa-AI
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
