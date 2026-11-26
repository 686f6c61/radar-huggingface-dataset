# KeremTT/paladin-4b-v4

## Resumen

Paladin 4B v4 es un ajuste fino supervisado del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario KeremTT, orientado a asistencia educativa en turco para estudiantes de secundaria y universidad. El modelo se distribuye como pesos completos en bf16 resultantes de fusionar (merge) un adaptador LoRA sobre el modelo base, con 4.022.468.096 parámetros totales y licencia Apache 2.0.

El problema que aborda es concreto: explicaciones academicas en turco con estilo breve y cercano, respuesta fundamentada en fuentes proporcionadas con citas numericas (`[1]`, `[2]`) y capacidad de invocar herramientas externas mediante el formato de function calling de Qwen (`<tool_call>…</tool_call>`). El modelo esta disenado para operar detras de un servidor que aporta recuperacion documental (RAG) y ejecuta las llamadas a herramientas, de modo que las evaluaciones sin retrieval miden un escenario distinto al de produccion.

Es relevante por su especializacion: en lugar de competir en conocimiento general, apunta a un nicho (educacion en turco) con un contrato de comportamiento explicito (no inventar hechos, admitir cuando las fuentes no contienen la respuesta, derivar mensajes de crisis a numeros de emergencia en Turquia) y un conjunto acotado de 13 funciones matematicas y cientificas verificadas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con QLoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con longitud de secuencia 8192) |
| Tipos de cuantizacion | bf16 en este repositorio; GGUF Q4_K_M disponible en KeremTT/paladin-v4 |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros, y se entrena mediante QLoRA con r = 16, alpha = 32 y adaptadores en todas las capas lineales, continuando desde el adaptador de Paladin v3. El entrenamiento consiste en 1 epoca con learning rate 5e-5 y longitud de secuencia de 8192 tokens. Posteriormente el adaptador se fusiona en los pesos del modelo base, dando lugar a este repositorio de pesos completos en bf16.

Los datos de entrenamiento son aproximadamente 8.600 conversaciones con predominio de turco: Q&A fundamentado en fuentes, uso de herramientas (verificado con las herramientas reales), chat multi-turno, ayuda con deberes y ejemplos de identidad, seguridad y rechazo. El texto de entrenamiento se genero con plantillas y varios LLM, y se filtro con comprobaciones automaticas. Una innovacion operativa destacable es la integracion del system prompt de Paladin en la plantilla de chat (`chat_template.jinja`): si el usuario no proporciona un mensaje de sistema, la plantilla lo inserta automaticamente, de modo que las evaluaciones sin system prompt ven el modelo tal como fue entrenado. Ademas, cada turno del asistente comienza con un bloque de pensamiento vacio (`<think>\n\n</think>`) cuando se usa `add_generation_prompt=True`.

## Capacidades

- Generacion de texto conversacional en turco con estilo breve, cercano y orientado a estudiantes.
- Explicaciones de materias escolares y universitarias.
- Respuesta fundamentada en fuentes proporcionadas, con citas numericas (`[1]`, `[2]`) y reconocimiento explicito cuando las fuentes no contienen la respuesta.
- Function calling con el formato de Qwen (`<tool_call>…</tool_call>`) sobre 13 funciones: calculadora, fecha, conversion de unidades, tabla periodica, estadistica, resolucion de ecuaciones, calculo, geometria, probabilidad, teoria de numeros y balanceo de ecuaciones quimicas, entre otras.
- Razonamiento multi-turno con contexto de conversacion.
- Comportamiento de identidad consistente y respuestas seguras ante mensajes de crisis, derivando a numeros de emergencia en Turquia.
- Capacidad de rechazo y abstención ante peticiones inadecuadas o informacion no disponible.
- Ingles funcional, aunque no es el foco del ajuste.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Tutor academico en turco: el modelo explica conceptos de secundaria y universidad en un registro adaptado al estudiante, con respuestas cortas y ejemplos; su entrenamiento especifico en este dominio lo hace mas adecuado que el modelo base para este publico.
- Asistente de estudio con RAG: desplegado tras un servidor que recupera apuntes o libros de texto, el modelo responde citando las fuentes (`[1]`, `[2]`) y admite cuando la documentacion recuperada no cubre la pregunta, lo que reduce alucinaciones en entornos documentales.
- Resolucion de problemas matematicos y cientificos: mediante las 13 herramientas de calculo, estadistica, geometria, probabilidad y balanceo quimico, el modelo delega el calculo en funciones deterministas en lugar de improvisar aritmetica.
- Ayuda con deberes multi-turno: gestiona conversaciones de varias rondas en las que el alumno reformula preguntas o pide aclaraciones, manteniendo el contexto de la sesion.
- Moderacion y derivacion en contextos de crisis: ante mensajes de riesgo, el modelo responde con pautas seguras y numeros de emergencia de Turquia, lo que permite usarlo como primera capa en plataformas educativas.
- Generacion de material didactico: produccion de explicaciones y ejercicios resueltos en turco para docentes, con estilo homogeneo gracias al system prompt fijo.
- Evaluacion de pipelines de function calling: al usar el formato estandar de Qwen, sirve como banco de pruebas para validar orquestadores de herramientas en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente de que las evaluaciones que ejecutan el modelo de forma aislada lo miden sin retrieval ni herramientas, y que ese es el ajuste previsto para benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8-9 GB solo para pesos (4.022 millones de parametros a 2 bytes), mas overhead de KV cache y activaciones; en la practica, 10-12 GB para contextos moderados.
- Cuantizacion Q4_K_M (GGUF disponible en KeremTT/paladin-v4): alrededor de 2,5-3 GB de pesos, apta para GPUs de consumo con 6-8 GB de VRAM.
- GPU recomendadas: A100 o H100 para despliegue en bf16 con alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16 o fp16 con contextos moderados; RTX 3060 12 GB o RTX 4060 Ti 16 GB para bf16 ajustado o cuantizaciones.
- Cabe en GPU de consumo: si, tanto en bf16 en tarjetas de 12-16 GB como en Q4_K_M en tarjetas de 6-8 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), llama.cpp u Ollama mediante el GGUF Q4_K_M, y vLLM por compatibilidad con la arquitectura Qwen3 (no confirmado explicitamente en la informacion proporcionada).
- Latencia y throughput: no disponibles.
- Parametros de muestreo recomendados: temperature 0,3-0,7 y top-p 0,9.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Paladin 4B v4 | 4,02B | no disponible | tr, en | Apache 2.0 | Ajuste educativo en turco con tool calling y citas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | multilingue | Apache 2.0 | Modelo general; sin especializacion educativa ni formato de citas |
| Paladin v3 (adaptador previo) | 4B | no disponible | tr, en | no disponible | Version anterior del adaptador LoRA; v4 continua su entrenamiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas alternativas.

## Limitaciones y advertencias

- Con 4B parametros el conocimiento del mundo es limitado; sin retrieval puede equivocarse en hechos especificos, tal como advierte el autor.
- Optimizado para turco; el ingles funciona pero no es el foco, por lo que su calidad en otros idiomas no esta garantizada.
- No es una autoridad medica, legal ni psicologica; no debe usarse como sustituto de profesionales en esas areas.
- Riesgo de alucinacion en preguntas factuales fuera del alcance de las fuentes recuperadas, aunque el entrenamiento incluye ejemplos de abstención.
- El comportamiento esperado depende de la plantilla de chat incluida: omitir el system prompt o el bloque de pensamiento vacio puede degradar la calidad de las respuestas.
- Los benchmarks ejecutados sin retrieval ni herramientas no reflejan el rendimiento en el escenario de produccion previsto.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada; el dataset se genero con plantillas y varios LLM y se filtro automaticamente, lo que puede introducir sesgos de esos generadores.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-4B-Instruct-2507, tambien Apache 2.0.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (pesos completos bf16): https://huggingface.co/KeremTT/paladin-4b-v4
- Repositorio con adaptador original y GGUF Q4_K_M: https://huggingface.co/KeremTT/paladin-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
