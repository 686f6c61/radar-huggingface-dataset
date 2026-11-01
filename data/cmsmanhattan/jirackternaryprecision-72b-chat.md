# CMSManhattan/JiRackTernaryPrecision-72B-chat

## Resumen

JiRack Ternary Precision 72B es un modelo de lenguaje de 72,15 mil millones de parámetros desarrollado por CMSManhattan (Konstantin Grabko) que emplea pesos ternarios {-1, 0, +1} en todas las capas lineales del transformer, siguiendo el esquema BitNet b1.58 con escala por tensor y activaciones de 8 bits. Se distribuye exclusivamente en formato GGUF para llama.cpp, lo que reduce el peso en disco y en memoria desde los 144,3 GB que ocuparía en bf16 hasta un tamano mucho menor, permitiendo su despliegue en un unico servidor con suficiente RAM o en una sola GPU.

El modelo esta orientado a generacion de codigo, tool calling y pipelines de agentes, y se presenta como el miembro de mayor tamano de la familia JiRack Precision. Deriva del JiRack Ternary Precision 36B mediante una ampliacion de profundidad: se anaden 68 capas a las 64 originales hasta alcanzar 132 capas, inicializadas como bloques identidad exactos para que el modelo de 72B arranque respondiendo igual que el de 36B antes de que el entrenamiento aproveche la capacidad adicional.

Su relevancia actual radica en la combinacion de un tamano de 72B con un formato de pesos de muy baja precision (1.58 bits efectivos) que busca mantener calidad de razonamiento y codigo a un coste de memoria y computo muy inferior al de un modelo denso equivalente en bf16. El contexto maximo es de 16k tokens y la licencia es propietaria, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con pesos ternarios (BitNet b1.58 style), 132 capas |
| Parametros totales | 72,15B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 16k tokens (16.384) |
| Tipos de cuantizacion | TQ2_0 (pesos ternarios nativos, recomendado) y Q8_0 (para builds de llama.cpp sin kernels TQ2_0) |
| Idiomas soportados | No disponible |
| Licencia | Propietaria (jirack-proprietary), declarada como bsl-1.0 en metadatos; © 2025-2026 Konstantin Vladimirovich Grabko |
| Formato de pesos | GGUF (llama.cpp) |

Especificaciones adicionales de la arquitectura:

| Parametro | Valor |
|---|---|
| Hidden size | 5.120 |
| FFN intermedio | 30.720 |
| Cabezas de atencion | 40 query, 8 key-value (GQA), dimension de cabeza 128 |
| Vocabulario | 152.064 tokens |
| Pesos | Ternarios {-1, 0, +1} con escala por tensor |
| Activaciones | 8 bits, por token |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 132 capas con atencion de grupo (GQA) de 40 cabezas de consulta y 8 de clave-valor, dimension de cabeza 128, hidden size de 5.120 y FFN de 30.720. La innovacion central es el uso de pesos ternarios en todas las capas lineales, con una escala por tensor y activaciones cuantizadas a 8 bits por token, siguiendo el esquema BitNet b1.58. El entrenamiento emplea quantizacion consciente (quantization-aware training), de modo que el modelo aprende directamente con la restriccion ternaria en lugar de cuantizarse a posteriori.

El proceso de construccion parte del modelo base CMSManhattan/JiRackUltra_32b, al que se le amplia el FFN de 27.648 a 30.720 (dando lugar al 36B) y despues se le anaden 68 capas nuevas hasta las 132 totales. Las capas insertadas se inicializan como bloques identidad exactos, de forma que el 72B reproduce inicialmente el comportamiento del 36B y el entrenamiento posterior es el que explota la capacidad adicional. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general en un unico turno y en conversaciones multi-turno.
- Generacion de codigo, con enfasis declarado en asistentes de programacion.
- Tool calling y function calling en formato OpenAI: acepta `tools=[...]` y emite llamadas con bloques `<|tool_call_start|> ... <|tool_call_end|>`.
- Llamadas paralelas: varias llamadas a herramientas en una misma respuesta se interpretan como ejecuciones en paralelo.
- Manejo de resultados de herramientas mediante mensajes con `role: "tool"`.
- Comportamiento de repliegue: si ninguna herramienta encaja responde en texto plano; si falta un argumento obligatorio, lo solicita.
- Soporte de pipelines de agentes y razonamiento multi-paso a traves del esquema de tool calling.
- Plantilla de chat propia (`chat_template.jinja`) que incluye la definicion de herramientas.
- Capacidades multilingues: no disponible.
- Vision, audio o modo de pensamiento explicito: no disponible.

## Casos de uso

- Asistente de programacion en produccion: el modelo puede integrarse en un servidor llama.cpp compatible con la API de OpenAI y recibir contexto de repositorio de hasta 16k tokens para autocompletar, explicar y refactorizar codigo, con la ventaja de que un 72B ternario cabe en una sola GPU o en un servidor de CPU con RAM suficiente.
- Orquestacion de agentes con tool calling: al emitir llamadas en formato estructurado y soportar llamadas paralelas, encaja en pipelines donde el agente consulta APIs, bases de datos o servicios internos y encadena varios pasos antes de responder.
- Automatizacion de robotica: la etiqueta `robotics` de la model card sugiere su uso como capa de planificacion que traduce instrucciones en lenguaje natural a llamadas a herramientas de control, con la ventaja de que el modelo puede pedir argumentos faltantes en lugar de inventarlos.
- Atencion al cliente automatizada: la ventana de 16k tokens permite gestionar conversaciones multi-turno con historial largo y llamadas a herramientas de consulta de pedidos o estado de cuenta, manteniendo el contexto de la sesion.
- Despliegue en infraestructura limitada: al almacenar los pesos en formato ternario nativo (TQ2_0), permite servir un modelo de 72B en un unico servidor sin cluster de GPU, lo que resulta adecuado para equipos con presupuesto de hardware restringido.
- Backend de CI/CD para revision de codigo: el modelo puede recibir diffs y contexto de hasta 16k tokens y devolver sugerencias o llamadas a herramientas de linting y test, integrándose en un servidor OpenAI-compatible detras de un pipeline.
- Prototipado de asistentes con herramientas en local: al ejecutarse con `llama-server --jinja`, permite levantar un endpoint compatible con OpenAI en `http://localhost:8080/v1/chat/completions` para pruebas de integracion sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero TQ2_0 necesita aproximadamente el tamano indicado como `@SIZE_TQ2@` en la model card (marcador no resuelto en la informacion disponible) mas la cache de contexto; el fichero Q8_0 ocupa `@SIZE_Q8@`. Como referencia, en bf16 el modelo ocuparia 144,3 GB.
- GPU recomendadas: la model card indica que puede ejecutarse en una sola GPU con `-ngl 999` para cargar todas las capas, o en un servidor de CPU con RAM suficiente. No se especifican modelos concretos de GPU (A100, H100, RTX 4090) en la informacion disponible.
- GPU de consumo: no se confirma en la informacion disponible si cabe en GPU de consumo; el requisito de memoria del fichero TQ2_0 y de la cache de contexto determina la viabilidad.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--jinja`; el servidor expone una API compatible con OpenAI. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack Ternary Precision 72B | 72,15B | 16k | Ternarios (1.58-bit) en GGUF | Propietaria (jirack-proprietary) | HuggingFace, solo GGUF |
| JiRack Ternary Precision 36B | 36B (no confirmado en detalle) | No disponible | Ternarios en GGUF | Propietaria | HuggingFace (modelo base declarado) |
| JiRackUltra_32b | 32B (no confirmado en detalle) | No disponible | No disponible | No disponible | HuggingFace (modelo base de la familia) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede cometer errores, inventar hechos y producir argumentos de herramienta incorrectos; recomienda verificar la salida antes de actuar sobre ella, especialmente en pipelines automatizados.
- Riesgo de alucinacion en generacion de texto y en la construccion de llamadas a herramientas, con posible invencion de nombres de funcion o valores de argumentos.
- Contexto limitado a 16k tokens, inferior al de modelos contemporaneos con ventanas de 128k o superiores.
- Idiomas soportados no documentados; no hay garantia de calidad fuera del idioma o idiomas de entrenamiento.
- Licencia propietaria (jirack-proprietary): el uso comercial esta sujeto a los terminos del titular, Konstantin Vladimirovich Grabko; la declaracion de `bsl-1.0` en los metadatos no debe interpretarse como una licencia open source permisiva.
- El modelo esta declarado "in development" en la model card, lo que implica que puede cambiar y no debe tratarse como una version estable para produccion.
- La disponibilidad esta limitada al formato GGUF para llama.cpp; no hay pesos en safetensors ni soporte declarado para otros motores de inferencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia publica de validacion por parte de la comunidad.
- Los marcadores `@SIZE_TQ2@` y `@SIZE_Q8@` de la model card no estan resueltos, por lo que el tamano exacto de los ficheros no puede confirmarse.

## Enlaces

- HuggingFace: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-72B-chat
- Modelo base declarado: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-36B
- Perfil del autor en HuggingFace: https://huggingface.co/kgrabko
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
