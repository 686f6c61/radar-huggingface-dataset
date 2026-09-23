# grow-nexus/Xing4.0-29B-A4B-telecom-customer-service-chat

## Resumen

Xing4.0-29B-A4B-telecom-customer-service-chat es un ajuste fino (fine-tune) del modelo base Xing4.0-29B-A4B, desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. y publicado en HuggingFace por el usuario grow-nexus. Está especializado en diálogo de atención al cliente de telecomunicaciones, con el objetivo declarado de servir como agente de atención telefónica para la línea 10000 de Guangdong Telecom. No es un asistente generalista: se ha adaptado su comportamiento para reconocer intenciones del usuario (facturación, consulta de datos, alta y traslado de líneas, averías, renovación de banda ancha, reclamaciones), pedir aclaraciones solo cuando la intención es ambigua, invocar herramientas de negocio y producir respuestas conformes con las reglas de servicio.

Arquitectura y tamaño: el modelo base es una mezcla de expertos (MoE) con 29B parámetros totales y aproximadamente 4B activos por token, 40 capas, tamaño oculto de 3584, atención MLA, 64 expertos enrutados (4 activos por token) y 1 experto compartido. Soporta de forma nativa una ventana de contexto de 256K tokens, extensible a 512K con la configuración de runtime adecuada. Los pesos publicados en safetensors suman 31.215.033.008 parámetros, una cifra superior a los 29B que declara el autor, probablemente por diferencias de conteo entre el modelo base y el ajuste.

Su relevancia es acotada pero clara: es un ejemplo de adaptación de comportamiento de un MoE grande a un dominio vertical muy regulado, con soporte de tool calling estructurado y control de modo "thinking". En el momento de redactar esta ficha el repositorio no tiene descargas ni "likes" y no se ha publicado licencia, benchmarks ni información de cuantizaciones, por lo que toda evaluación en producción exige validación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, con atención MLA, mHC y MTP (según el autor) |
| Parametros totales | 31.215.033.008 (~31,2 B) en safetensors; el autor declara 29 B |
| Parametros activos | ~4 B por token (4 de 64 expertos enrutados activos + 1 experto compartido) |
| Longitud de contexto | 256K nativo, extensible a 512K con configuración de runtime |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | chino (principal) e inglés, según el autor; los metadatos de HuggingFace no declaran idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo `custom_code`; requiere `trust_remote_code=True`) |
| Numero de capas | 40 |
| Tamano oculto | 3584 |
| Modalidad | solo texto |
| Tamano del repositorio | 62,4 GB |

## Arquitectura y entrenamiento

El modelo base pertenece a la serie Xing (anteriormente TeleChat) de China Telecom y emplea una arquitectura MoE con atención MLA (Multi-head Latent Attention) y mecanismos mHC y MTP, según la información facilitada por el autor. La configuración declarada es de 40 capas, tamaño oculto 3584, 64 expertos enrutados con 4 activos por token y 1 experto compartido, lo que da un total de 29B parámetros con ~4B activos por token. El contexto nativo es de 256K tokens, ampliable a 512K. Es un modelo exclusivamente de texto.

El ajuste fino se orienta a la adaptación de comportamiento en el dominio de atención al cliente de telecomunicaciones, no a la incorporación de conocimiento nuevo. La mezcla de entrenamiento declarada incluye conversaciones reales y sintéticas del servicio de la línea 10000, datos etiquetados por intención (facturación, planes de datos, banda ancha, reparación de averías, reclamaciones, altas y migraciones), muestras estructuradas de llamada a herramienta y despacho de tareas alineadas con la taxonomía de candidatos/intenciones, muestras de aclaración de slots, fraseología de enrutado y terminación (continuar, rechazar, colgar, transferir a agente humano) y datos de instrucción general para preservar las capacidades del modelo base. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card se corta en la sección "Intend", por lo que parte del contenido del autor no está disponible.

## Capacidades

- Generación de texto conversacional en chino (principal) e inglés, orientada a diálogo de servicio.
- Reconocimiento de intención y enrutado hacia la skill o tarea candidata correcta.
- Aclaración de slots: formula preguntas de desambiguación únicamente cuando la intención es genuinamente ambigua.
- Tool calling y despacho de tareas: emite `tool_call` y `dispatch_query` en el formato estructurado esperado por motores Aviator y motores de reglas.
- Diálogo de servicio conforme: fraseología estandarizada para colgar, rechazar, aclarar, continuar y transferir a agente humano.
- Continuidad multiturno: cambio de contexto, preguntas de seguimiento y reanudación de tareas interrumpidas.
- Control de modo thinking: permite respuestas directas de baja latencia o modo de razonamiento deliberado para intenciones difíciles.
- No dispone de capacidades de visión ni de audio; la modalidad es exclusivamente texto.

## Casos de uso

- Atención al cliente telefónica automatizada: el modelo gestiona conversaciones multiturno en la línea 10000, reconoce la intención del cliente y decide si resuelve, aclara, deriva o transfiere a un agente humano, gracias a su ventana de 256K tokens que permite arrastrar el historial completo de la interacción.
- Enrutado de intenciones en IVR inteligente: clasifica la petición entrante (facturación, consumo de datos, avería, alta de línea, reclamación) y emite la tarea candidata para que el motor de reglas la ejecute, evitando menús numéricos rígidos.
- Consulta de saldo y facturación: con tool calling integrado, el modelo puede invocar la herramienta de consulta de consumo o factura y redactar la respuesta en lenguaje natural con la información devuelta por el backend.
- Gestión de averías de banda ancha: recoge los slots necesarios (número de línea, dirección, horario de visita), lanza la consulta de diagnóstico y genera la respuesta conforme con el protocolo de servicio.
- Renovación y migración de planes: identifica la elegibilidad del cliente, propone el cambio y despacha la operación al sistema de negocio, manteniendo un tono comercial y conforme a la normativa.
- Transferencia a agente humano con contexto: genera un resumen estructurado de la conversación y la fraseología de transferencia, de modo que el agente reciba el motivo y los datos ya recopilados.
- Control de calidad y auditoría de conversaciones: al estar ajustado a las reglas de servicio, puede usarse como evaluador de diálogos ya registrados para detectar respuestas no conformes o políticas inventadas.
- Soporte a agentes humanos en tiempo real: modo thinking desactivado para sugerir respuestas de baja latencia al operador durante la llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de precisión de intención, exactitud de tool calling o tasa de cumplimiento de las reglas de servicio. Tampoco se aportan datos de latencia o throughput. Cualquier cifra de rendimiento en este dominio debe obtenerse mediante evaluación propia sobre un conjunto representativo de diálogos de la línea 10000.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 62,4 GB, por lo que se necesitan al menos ~70 GB de VRAM considerando caché de clave/valor y overhead del runtime.
- GPU recomendadas: una A100 80 GB, una H100 80 GB o una H200 permiten cargar el modelo en una sola GPU en bf16.
- Configuraciones multi-GPU: dos A100 40 GB, dos A6000 48 GB o dos RTX 4090 24 GB con paralelismo tensorial pueden servir el modelo, con el coste de comunicación asociado.
- GPU de consumo: en bf16 no cabe en ninguna GPU de consumo de 24 GB. Solo sería viable con cuantización agresiva (por ejemplo, 4 bits), pero el repositorio no publica pesos cuantizados ni GGUF, por lo que esa vía exige conversión propia.
- Opciones de despliegue: el autor documenta el uso con `transformers` (`AutoModelForCausalLM` con `trust_remote_code=True`) y expone un ejemplo de servidor compatible con la API de OpenAI en `http://127.0.0.1:8000/v1`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tratarse de un modelo `custom_code`, la integración en esos motores requiere verificar el soporte de la arquitectura.
- Latencia y throughput: no disponibles. La naturaleza MoE con ~4B parámetros activos sugiere un coste de cómputo por token reducido, pero el cuello de botella real es el ancho de banda de memoria necesario para leer los expertos, por lo que el rendimiento depende de la GPU y del batch.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos alternativos en la información proporcionada. La comparación más fiable posible es contra el propio modelo base, del que sí hay datos en la model card:

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B-telecom-customer-service-chat | ~31,2 B totales / ~4 B activos | 256K (512K extensible) | Atención al cliente de telecomunicaciones | no disponible | safetensors en HuggingFace |
| Xing4.0-29B-A4B (base) | 29 B totales / ~4 B activos (según el autor) | 256K (512K extensible) | Propósito general, chino e inglés | no disponible | HuggingFace (XingChen-AGI) |
| Alternativas MoE de ~30 B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial, la redistribución ni las obligaciones de atribución. Es un bloqueante para cualquier despliegue en producción hasta aclararlo con el autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión de intención, exactitud de tool calling ni tasa de cumplimiento normativo.
- Sin validación de la comunidad: cero descargas y cero "likes" en el momento de redactar la ficha.
- Discrepancia de parámetros: el conteo real de safetensors (31,2 B) no coincide con los 29 B declarados por el autor; conviene verificar la configuración antes de dimensionar hardware.
- Modelo `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; debe auditarse antes de usarlo en entornos controlados.
- Riesgo de alucinación de políticas: aunque el ajuste busca evitar resultados inventados, un modelo generativo puede fabricar condiciones comerciales, precios o plazos. Es imprescindible validar toda salida de negocio contra el sistema de origen.
- Sesgo de dominio y de idioma: el ajuste está centrado en el servicio de la línea 10000 de Guangdong Telecom y en chino; el rendimiento en castellano o en otros operadores no está documentado y previsiblemente será inferior.
- Dependencia del prompt de sistema: las reglas de identidad, tono y negocio se inyectan vía system prompt; un prompt mal configurado degrada el comportamiento esperado.
- Dependencia de formatos estructurados: el tool calling se apoya en formatos concretos (`tool_call`, `dispatch_query`) alineados con una taxonomía interna; cualquier cambio en el esquema downstream exige revalidar el modelo.
- Model card incompleta: el documento del autor se corta en la sección "Intend", por lo que parte de las instrucciones y parámetros recomendados pueden faltar.
- Solo texto: no admite entrada de audio ni imagen, lo que obliga a disponer de un sistema ASR/TTS externo para el escenario telefónico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grow-nexus/Xing4.0-29B-A4B-telecom-customer-service-chat
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo, su autor o su modelo base; las coincidencias obtenidas corresponden a la metodología de coaching GROW, a la plataforma financiera Groww y a la agencia GROW, sin relación con el modelo.
