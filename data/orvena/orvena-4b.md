# Orvena/Orvena-4B

## Resumen

Orvena 4B es un modelo de lenguaje y vision de 4.659.865.088 parametros (aproximadamente 4,66 mil millones) desarrollado por Orvena, un asistente privado que se ejecuta en el iPhone. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, entrenado especificamente para las tareas que un asistente movil realiza en el dia a dia: leer el calendario, configurar alarmas y recordatorios, buscar lugares y calcular tiempos de desplazamiento, buscar en la web y operar con servicios conectados a traves del protocolo MCP (Notion, Todoist, Airtable, Gmail, entre otros).

El modelo conserva la arquitectura de su base: 24 capas Gated DeltaNet, 8 capas de atencion completa y un codificador de vision, lo que lo convierte en un modelo hibrido capaz de procesar entradas de imagen y texto. Soporta 30 idiomas y esta disenado para responder sin un paso de razonamiento separado (thinking off), lo que reduce la latencia en dispositivos moviles. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que demuestra que un modelo de menos de 5.000 millones de parametros puede alcanzar un 80,4% de exito en un banco de pruebas de tareas telefonicas reales, superando ampliamente al modelo base (63,1%) y al modelo on-device de Apple Intelligence (19,0%). Ademas, incluye una cabeza de prediccion multi-token (MTP) reentrenada que acepta el 89,4% de los tokens propuestos, lo que acelera la decodificacion especulativa en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 24 capas Gated DeltaNet + 8 capas de atencion completa, con codificador de vision |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); build de 4 bits en MLX disponible en repositorio separado |
| Idiomas soportados | 30 idiomas: bg, cs, da, de, el, en, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); MLX 4-bit en repositorio aparte |

## Arquitectura y entrenamiento

Orvena 4B mantiene la arquitectura de Qwen3.5-4B: un transformer hibrido con 24 capas Gated DeltaNet (un tipo de atencion lineal con estado recurrente) y 8 capas de atencion completa, ademas de un codificador de vision que habilita la entrada de imagen y texto. Sobre esta base se entreno un adaptador LoRA de rango 16 y alpha 320 aplicado a las 248 capas lineales del modelo de lenguaje, durante una epoca, y posteriormente se fusiono en los pesos publicados. La cabeza MTP (multi-token prediction) se reentreno sobre las propias salidas del modelo ajustado.

El entrenamiento se construyo alrededor de un iPhone simulado que expone el catalogo real de herramientas de Orvena y servidores MCP con las listas de herramientas capturadas de Notion, Linear, GitHub, Todoist, Airtable, Atlassian, Gmail, Google Drive, Google Calendar, Granola, Home Assistant y Zapier. Cada escenario combina una peticion con los datos del telefono (calendario, contactos, recordatorios, lugares, clima, salud) y verificaciones sobre las llamadas que el asistente debe realizar y el contenido de su respuesta; solo se conservaron las respuestas que pasaron las comprobaciones. De los 3.397 escenarios, Qwen3.6-35B-A3B respondio 1.126 con thinking off y 724 con thinking on, y el modelo base respondio 1.547, generando 11.161 rondas (una por llamada al modelo), de las cuales 574 se reservaron para validacion. Se anadieron dos conjuntos auxiliares: peticiones que ninguna herramienta puede resolver y preguntas simples con conexiones instaladas (para que el modelo aprenda a responder o a declinar), y 600 ejemplos de seguimiento de instrucciones estilo IFEval. Todo el entrenamiento se realizo con thinking off.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno en 30 idiomas.
- Comprension de imagen y texto (pipeline image-text-to-text) gracias al codificador de vision.
- Tool calling y function calling: invoca herramientas del catalogo del telefono con argumentos correctos.
- Integracion con servidores MCP: Notion, Linear, GitHub, Todoist, Airtable, Atlassian, Gmail, Google Drive, Google Calendar, Granola, Home Assistant y Zapier.
- Ejecucion de tareas multi-paso y razonamiento agentico dentro del bucle de agente de Orvena.
- Recuperacion de errores de herramientas: 18 de 19 escenarios superados en la categoria correspondiente.
- Preguntas de seguimiento y tareas programadas.
- Modo thinking opcional mediante `enable_thinking=True` en la plantilla de chat (por defecto responde sin thinking).
- Decodificacion especulativa mediante cabeza MTP reentrenada (89,4% de aceptacion de tokens propuestos).

## Casos de uso

- Asistente personal movil integrado en iPhone: el modelo gestiona el calendario, alarmas, recordatorios y tiempos de desplazamiento directamente en el dispositivo, con respuesta sin paso de thinking para minimizar latencia. Es adecuado por su tamano contenido y su entrenamiento especifico en tareas telefonicas.
- Gestion de correo y productividad via MCP: con las listas de herramientas de Gmail, Google Drive, Notion y Todoist, el modelo puede crear tareas, buscar correos o actualizar bases de datos. Su entrenamiento con servidores MCP reales lo hace fiable en la seleccion de herramientas y argumentos.
- Busqueda web y respuesta a preguntas: la categoria Web del banco de pruebas alcanza 29 de 31 escenarios, lo que lo hace apto para asistentes que consultan informacion en linea y sintetizan respuestas en el idioma del usuario.
- Planificacion de rutas y lugares: con 35 de 38 escenarios superados en la categoria Places, puede resolver consultas sobre ubicaciones, tiempos de viaje y clima combinando datos del telefono.
- Automatizacion del hogar: la integracion con Home Assistant via MCP permite controlar dispositivos y rutinas mediante lenguaje natural, con recuperacion de errores de herramienta en 18 de 19 casos.
- Atencion al cliente multilingue en dispositivos: al soportar 30 idiomas y responder sin thinking, puede desplegarse en entornos con recursos limitados para conversaciones multi-turno con contexto de datos del usuario.
- Agentes autonomos de escritorio o movil: su capacidad de multi-step reasoning (43 de 70 escenarios) y de seguir instrucciones formateadas (600 ejemplos IFEval) lo hacen util en pipelines agenticos que requieren invocaciones encadenadas de herramientas.

## Benchmarks y rendimiento

Resultados en el banco de pruebas Orvena (547 escenarios retenidos en 30 idiomas, ninguno usado en entrenamiento; modelo ejecutado con 4 bits y thinking off):

| Metrica | Orvena 4B | Modelo base | Apple on-device |
|---|---|---|---|
| Todos los 547 escenarios | 440 (80,4%) | 345 (63,1%) | 104 (19,0%) |
| En los 13 idiomas de Apple (260) | 220 (84,6%) | 175 (67,3%) | 77 (29,6%) |
| Peticiones cotidianas con conexiones (100) | 83 | 60 | 23 |

Desglose por categoria (escenarios / Orvena 4B / base / Apple):

| Categoria | Escenarios | Orvena 4B | Modelo base | Apple on-device |
|---|---|---|---|---|
| Tareas multi-paso | 70 | 43 | 17 | 1 |
| Conexiones MCP | 62 | 51 | 45 | 8 |
| Lugares | 38 | 35 | 26 | 12 |
| Calendario | 31 | 20 | 13 | 4 |
| Web | 31 | 29 | 26 | 15 |
| Alarmas y temporizadores | 25 | 20 | 17 | 5 |
| Sin herramienta necesaria | 23 | 16 | 19 | 6 |
| Clima | 22 | 18 | 18 | 7 |
| Recordatorios | 21 | 18 | 14 | 0 |
| Recuperacion de errores de herramienta | 19 | 18 | 12 | 3 |
| Tiempos de viaje | 19 | 19 | 17 | 1 |
| Preguntas de seguimiento | 18 | 13 | 9 | 0 |
| Tareas programadas | 16 | 12 | 9 | 0 |
| Cosas que no puede hacer | 13 | 9 | 10 | 6 |
| Musica | 10 | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 12-16 GB de VRAM.
- VRAM estimada en 4 bits (MLX): aproximadamente 2,5-3 GB para pesos, adecuado para dispositivos con memoria unificada limitada.
- GPU recomendadas: A100, H100 o RTX 4090 para bf16; RTX 3090/4080 para cuantizacion 4-bit en escritorio.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantizacion 4-bit; tambien en iPhone mediante el build MLX 4-bit.
- Opciones de despliegue: transformers (libreria nativa), MLX para Apple Silicon, y potencialmente vLLM o llama.cpp si se generan los formatos correspondientes (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles de forma explicita; la cabeza MTP con 89,4% de aceptacion sugiere aceleracion en decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento en Orvena bench |
|---|---|---|---|---|---|
| Orvena 4B | 4,66 B | no disponible | Apache 2.0 | Asistente movil con tool calling y MCP | 80,4% |
| Qwen3.5-4B (base) | 4 B (aprox.) | no disponible | Apache 2.0 | Modelo generalista multimodal | 63,1% |
| Apple on-device | no disponible | no disponible | Propietaria | Asistente integrado en iOS | 19,0% |
| Qwen3.6-35B-A3B | 35 B totales (MoE) | no disponible | no disponible | Modelo grande con thinking | Usado como generador de datos, no evaluado en el bench |

La comparativa se limita a los modelos presentes en la informacion proporcionada; no se dispone de datos de otros modelos de tamano similar en el mismo banco de pruebas.

## Limitaciones y advertencias

- El banco de pruebas es propio del autor (Orvena bench) y esta disenado alrededor del catalogo de herramientas de Orvena; los resultados pueden no generalizar a otros entornos de agentes.
- El modelo se entreno con thinking off; el modo thinking existe pero no fue el foco del entrenamiento y su rendimiento no se reporta.
- En la categoria "Sin herramienta necesaria" el modelo base supera a Orvena 4B (19 frente a 16), lo que sugiere una ligera tendencia a invocar herramientas cuando no son necesarias.
- En "Cosas que no puede hacer" el modelo base tambien obtiene mejor resultado (10 frente a 9), indicando margen de mejora en la calibracion de sus limites.
- No se publican datos de sesgos, alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La longitud de contexto no se especifica; no debe asumirse un contexto largo sin verificacion.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base Qwen3.5-4B y de los datos de entrenamiento derivados de servicios de terceros.
- El modelo esta optimizado para el bucle de agente de Orvena; su integracion en otros frameworks puede requerir adaptacion de la plantilla de chat y del formato de herramientas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Orvena/Orvena-4B
- Build MLX 4-bit: https://huggingface.co/Orvena/Orvena-4B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo generador de datos: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset del banco de pruebas: https://huggingface.co/datasets/Orvena/orvena-bench
- Dataset IFEval-like: https://huggingface.co/datasets/argilla/ifeval-like-data
- Aplicacion Orvena: https://orvena.app
- Informe tecnico: Orvena-4B-technical-report.pdf (en el repositorio del modelo)
- Licencia: https://huggingface.co/Orvena/Orvena-4B/blob/main/LICENSE
