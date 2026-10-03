# fabricant451/strands-decider-2B-hobson-v19-GGUF

## Resumen

Strands Decider Hobson v19 GGUF es una conversion a formato GGUF del modelo StrandsAgents/strands-decider-2B-hobson-v19, publicada por el usuario fabricant451. No se trata de un modelo conversacional generativo, sino de un modelo de decision tipada: su salida es una eleccion (choice), un booleano o una puntuacion ordinal. El autor lo describe explicitamente como "not a chat model", por lo que su uso esta orientado a clasificacion y toma de decisiones estructuradas, no a generacion de texto libre.

El modelo deriva de una base Qwen3.5-2B-Base con un adaptador ya fusionado en el backbone y una cabeza de clasificacion (pointer/classification head) conservada cuyos pesos de salida permanecen en F32. Cuenta con 1.882.878.272 parametros totales segun los safetensors y una ventana de contexto de 4096 tokens. La cuantizacion es Q8_0, lo que da un fichero GGUF de aproximadamente 1,9 GiB.

Su relevancia practica es limitada pero especifica: es una conversion experimental pensada para ejecutarse en navegador mediante WebGPU con un runtime Strands-aware de llama.cpp/wllama. El autor advierte que los clientes GGUF estandar no se asumen compatibles, lo que restringe su adopcion a entornos que dispongan de ese runtime adaptado. Se trata de un artefacto con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5-2B-Base con cabeza de clasificacion tipada (choice/boolean/ordinal); detalle de capas no disponible |
| Parametros totales | 1.882.878.272 (aproximadamente 1,88 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cabeza de clasificacion en F32) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo parte de Qwen3.5-2B-Base y que sobre esa base se ha fusionado un adaptador (adapter merged into the backbone). Se conserva la cabeza de puntero/clasificacion propia del modelo Strokes Decider, con pesos de salida en F32, lo que sugiere que la parte de representacion va cuantizada en Q8_0 mientras que la capa final de decision mantiene precision completa para no degradar las probabilidades de salida. El modelo es una conversion (base_model_relation: quantized) del repositorio StrandsAgents/strands-decider-2B-hobson-v19, revision bb282d786bc251fd4e3068de3ada9ddbb38127cd, sobre una base inferida b1485b2fa6dfa1287294f269f5fb618e03d52d7c (no fijada por los hosts de entrenamiento).

No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documenta ninguna innovacion de decodificacion, atencion lineal o mecanismo similar. El unico dato de validacion publicado es una prueba de humo: ocho fixtures de referencia ejecutados en navegador presentaron un error maximo de probabilidad inferior a 0,006 respecto a la referencia en Python. El propio autor aclara que es "a small conversion smoke test, not a model-quality benchmark".

## Capacidades

- Clasificacion con salida tipada: eleccion entre opciones (choice), valor booleano y puntuacion ordinal.
- Toma de decisiones estructuradas en lugar de generacion de texto libre.
- Integracion con WebGPU para inferencia en navegador mediante el runtime Strands-aware de llama.cpp/wllama.
- Compatibilidad con clientes GGUF: solo bajo el runtime personalizado indicado por el autor; no se garantiza en clientes GGUF estandar.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no especificados).
- Capacidad conversacional: no soportada; el autor indica explicitamente que no es un modelo de chat.

## Casos de uso

- Enrutado de decisiones en aplicaciones web: dado un conjunto de opciones, el modelo devuelve la eleccion seleccionada con una probabilidad asociada, aprovechando su cabeza de clasificacion tipada.
- Filtros booleanos en pipelines de datos: clasificar registros como aptos o no aptos mediante la salida booleana, con la ventaja de ejecutarse en el navegador sin backend.
- Puntuacion ordinal de candidatos: ordenar elementos en una escala (por ejemplo, relevancia o prioridad) gracias a la salida de score ordinal.
- Demos interactivas en navegador con WebGPU: prototipos que necesiten un modelo de decision local sin enviar datos a un servidor, usando el runtime Strands-aware.
- Validacion de logica de decision en investigacion: comparar el comportamiento de la version cuantizada Q8_0 con la referencia en Python, apoyandose en el error maximo documentado de 0,006 en los fixtures.
- Experimentacion con formatos GGUF y cabezas de clasificacion en F32: caso de estudio para desarrolladores que quieran mantener la capa de salida en precision completa mientras cuantizan el resto del modelo.
- Prototipado de asistentes de decision acotada: escenarios donde se requiere una respuesta discreta y acotada (elegir, confirmar o puntuar) y no texto libre, evitando el coste de un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es una prueba de humo de conversion: ocho fixtures de referencia en navegador con un error maximo de probabilidad inferior a 0,006 frente a la referencia en Python, que el autor califica explicitamente como test de conversion y no como benchmark de calidad del modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GiB de pesos en Q8_0; con overhead de runtime, en torno a 2-2,5 GB.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060 y superiores).
- GPU recomendadas para servidor: no aplica de forma estricta por el tamano; A100/H100 serian sobredimensionadas para este modelo.
- Ejecucion en navegador: soportada mediante WebGPU con el runtime Strands-aware de llama.cpp/wllama empleado en la demo.
- Opciones de despliegue: llama.cpp/wllama con el runtime Strands-aware; no se asume compatibilidad con clientes GGUF estandar, por lo que vLLM, Ollama o TGI no estan confirmados como compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fabricant451/strands-decider-2B-hobson-v19-GGUF | 1,88 mil millones | 4096 tokens | GGUF (Q8_0) | Apache 2.0 | Repositorio publico, 0 descargas |
| StrandsAgents/strands-decider-2B-hobson-v19 (modelo base) | no disponible | no disponible | pesos originales (no GGUF) | no disponible | Modelo de origen referenciado como base_model |
| Otras alternativas de clasificacion de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo conversacional: no debe emplearse para generacion de texto libre ni como chatbot.
- Requiere un runtime especifico (Strands-aware llama.cpp/wllama); los clientes GGUF estandar no se asumen compatibles, lo que limita su portabilidad.
- Ausencia total de benchmarks de calidad: el unico dato es una prueba de humo de conversion, insuficiente para validar comportamiento en produccion.
- Idiomas soportados no documentados, por lo que no se puede garantizar cobertura multilingue.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un modelo de decision tipada, el riesgo se traslada a clasificaciones erroneas con probabilidad alta.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado.
- El adaptador esta fusionado y la cabeza de clasificacion permanece en F32; cualquier re-cuantizacion adicional de esa capa podria degradar las probabilidades de salida.
- Modelo experimental con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- El repositorio indica fechas de creacion y actualizacion de octubre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del artefacto.

## Enlaces

- HuggingFace (conversion GGUF): https://huggingface.co/fabricant451/strands-decider-2B-hobson-v19-GGUF
- Modelo base en HuggingFace: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Revision del modelo fuente: bb282d786bc251fd4e3068de3ada9ddbb38127cd
- Revision de la base (inferida): b1485b2fa6dfa1287294f269f5fb618e03d52d7c
