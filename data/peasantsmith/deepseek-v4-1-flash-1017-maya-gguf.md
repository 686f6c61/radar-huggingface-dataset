# peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Maya-GGUF es un conjunto de cuantizaciones GGUF del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario peasantsmith bajo el paraguas de Project Maya. El modelo base es un transformer de tipo mixture of experts (MoE) desarrollado por DeepSeek, con 384 expertos enrutados por capa, 6 activos por token y un experto compartido adicional. Las cuantizaciones estan disenadas especificamente para el motor de inferencia Project Maya, que mantiene los expertos mas usados en la GPU y lee el resto desde RAM y SSD, permitiendo ejecutar un modelo de gran tamano en equipos de consumo con memoria limitada.

El repositorio ofrece dos variantes: Maya-S, orientada a maxima fidelidad respecto al original (178,2 GB en memoria, 92,6% de coincidencia en el token top respecto al modelo original), y Maya-XS, disenada para caber en la memoria de un PC de 128 GB (115,3 GB en memoria, 87,5% de coincidencia). Ambas conservan todos los expertos, se generan a partir de la release oficial de DeepSeek (expertos en FP4, pesos densos en FP8) y no de un archivo ya recuantizado. La licencia es MIT, lo que facilita su uso comercial.

La relevancia actual del modelo radica en que demuestra una via practica para desplegar modelos MoE de escala frontier en hardware de consumo, combinando cuantizacion agresiva por experto, decodificacion especulativa con un drafter propio (DSpark) y un motor que gestiona la memoria de forma jerarquica. El repo acumula 227.264 descargas y 69 likes, lo que indica un interes significativo de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (384 expertos enrutados por capa, 6 activos por token, mas experto compartido) |
| Parametros totales | 5120 (dato de safetensors; unidad no especificada en la informacion) |
| Parametros activos | No disponible (6 de 384 expertos enrutados por token, mas experto compartido) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Maya-S: IQ2_XXS gate/up, IQ3_XXS down (IQ2_S/IQ3_S en primeras y ultimas 4 capas), Q8_0 en atencion, expertos compartidos, embeddings y salida; Maya-XS: IQ1_S en expertos enrutados, Q8_0 en el resto; tablas Engram en Q6_K |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (multi-parte: 6 archivos para Maya-S, 5 para Maya-XS) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts con 384 expertos enrutados por capa, de los cuales se activan 6 por token, ademas de un experto compartido. Incluye mecanismos de atencion con attention sinks, hyper-connection mixing y una torre de vision heredada del checkpoint original de DeepSeek. El modelo incorpora tablas Engram (memoria de n-gramas de DeepSeek) que se leen desde el SSD unas pocas filas por token, por lo que ocupan espacio en disco pero no en memoria. Los pesos originales se distribuyen con expertos en FP4 y pesos densos en FP8.

Las cuantizaciones se generan con los cuantizadores propios de llama.cpp (ggml), partiendo de la release oficial de DeepSeek y no de un archivo recuantizado, conservando todos los expertos. El proceso sigue la receta del IST Austria DAS Lab: calibracion con texto en el formato de chat de DeepSeek (incluyendo thinking, codigo, tool calls, trazas de agente, razonamiento, chat y multilingue), calculo de matrices de importancia por experto capa a capa, y redondeo con feedback de error estilo GPTQ en bloques de 256 pesos. Maya-S usa 128 secuencias de 2.048 tokens para calibracion; Maya-XS usa el triple, ademas de las propias respuestas del modelo, y calibra sobre el modelo ya cuantizado (cada capa ve la salida de las capas cuantizadas anteriores). El router, las normas, el hyper-connection mixing y los attention sinks se mantienen en F32/BF16 tal como se publicaron. La decodificacion especulativa se apoya en un drafter DSpark: 8,0 GB para Maya-S (expertos FP4 de DeepSeek) y 4,3 GB para Maya-XS (expertos propios en 2 bits).

## Capacidades

- Generacion de texto y razonamiento, incluyendo modo thinking en el formato de chat de DeepSeek.
- Generacion de codigo y soporte de tool calls / function calling (la calibracion incluye trazas de tool calls y agentes).
- Capacidades de agente y razonamiento multi-paso.
- Procesamiento de imagenes: la torre de vision se toma del checkpoint original de DeepSeek sin modificar.
- Capacidades multilingues (la calibracion incluye texto multilingue, aunque los idiomas concretos no estan disponibles).
- API compatible con OpenAI y Anthropic a traves de Project Maya, con streaming, tool calls y soporte de imagenes.
- Decodificacion especulativa mediante el drafter DSpark para acelerar la inferencia.

## Casos de uso

- Despliegue local de un modelo de escala frontier en un PC de 128 GB: Maya-XS cabe en memoria (115,3 GB) y permite ejecutar el modelo sin GPU de datacenter, leyendo las tablas Engram desde el SSD.
- Asistente de codigo en el IDE o en pipelines de CI/CD: el modelo soporta tool calling y generacion de codigo, y la API compatible con OpenAI facilita la integracion en herramientas existentes.
- Agentes autonomos multi-paso: la capacidad de razonamiento, tool calls y contexto de agente (presente en la calibracion) lo hace adecuado para flujos de trabajo con varias llamadas encadenadas.
- Atencion al cliente automatizada: la API compatible con OpenAI y Anthropic y el soporte de streaming permiten montar un chatbot multi-turno sobre el servidor local de Project Maya.
- Procesamiento de documentos con imagenes: la torre de vision heredada permite extraer informacion de capturas, formularios o diagramas ademas de texto.
- Investigacion y experimentacion con cuantizacion MoE: el repo documenta metricas de fidelidad (coincidencia de token top, NLL) que sirven de referencia para estudiar el impacto de IQ1_S e IQ2_XXS en modelos con cientos de expertos.
- Servicio interno self-hosted con requisitos de privacidad: al ejecutarse en hardware propio y bajo licencia MIT, permite desplegar el modelo sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas de fidelidad de la cuantizacion frente al modelo original, medidas sobre texto held-out nunca usado para calibracion:

| Metrica | Maya-S | Maya-XS | Original via motor Maya |
|---|---|---|---|
| Coincidencia en token top vs original | 92,6% | 87,5% | 96,4% |
| NLL vs original | +3,2% | +8,7% | No disponible |
| Modelo en memoria | 178,2 GB | 115,3 GB | No disponible |
| Drafter DSpark | 8,0 GB | 4,3 GB | No disponible |
| Tablas Engram (SSD) | 161,3 GB | 161,3 GB | No disponible |
| Descarga total | 347,5 GB | 280,9 GB | No disponible |

Las tablas Engram en Q6_K conservan el 97,5% del token top respecto a las tablas originales en FP8, diferencia que el autor situa en el ruido de medida.

## Requisitos de hardware

- Memoria para Maya-S: 178,2 GB en RAM/VRAM para el modelo, mas 8,0 GB para el drafter y 161,3 GB en SSD para las tablas Engram. Descarga total de 347,5 GB.
- Memoria para Maya-XS: 115,3 GB en RAM/VRAM para el modelo, mas 4,3 GB para el drafter y 161,3 GB en SSD para las tablas Engram. Descarga total de 280,9 GB. Disenado para un PC de 128 GB de memoria.
- GPU: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible. Project Maya compila el motor para las GPU del equipo y reparte expertos entre GPU, RAM y SSD.
- Viabilidad en GPU de consumo: no disponible de forma explicita; el planteamiento del motor es precisamente permitir ejecucion con memoria por debajo del tamano del modelo, apoyandose en RAM y SSD.
- Despliegue: Project Maya (recomendado, con dashboard en http://127.0.0.1:8080 y API compatible con OpenAI y Anthropic). Los archivos son GGUF estandar generados con los cuantizadores de llama.cpp, por lo que en principio son compatibles con el ecosistema GGUF, aunque el autor solo documenta el flujo con Project Maya.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos disponibles de las dos variantes de este repositorio:

| Modelo | Parametros | Contexto | Coincidencia token top | Licencia | Formato |
|---|---|---|---|---|---|
| Maya-S | 5120 (unidad no especificada) | No disponible | 92,6% | MIT | GGUF |
| Maya-XS | 5120 (unidad no especificada) | No disponible | 87,5% | MIT | GGUF |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad medible: Maya-XS pierde un 12,5% de coincidencia en el token top y aumenta la NLL un 8,7% respecto al original; Maya-S pierde un 7,4% y aumenta la NLL un 3,2%.
- El funcionamiento esta disenado y documentado para Project Maya; el rendimiento en otros motores GGUF no esta verificado en la informacion disponible.
- Requiere un SSD con al menos 161,3 GB libres para las tablas Engram, ademas de la memoria para el modelo y el drafter.
- Los idiomas soportados no estan documentados; la calibracion incluye texto multilingue, pero no se especifica que lenguas cubre.
- La longitud de contexto no esta disponible, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al ser un modelo de lenguaje generativo, deben aplicarse las precauciones habituales en produccion.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 (tambien MIT segun el autor) y de los componentes de terceros (torre de vision, tablas Engram).
- El repositorio ocupa 1.291,1 GB en total, con descargas de 347,5 GB (Maya-S) y 280,9 GB (Maya-XS); el espacio en disco y el tiempo de descarga son limitaciones practicas relevantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Project Maya (motor de inferencia): https://github.com/mw00/project-maya
- IST Austria DAS Lab (receta de cuantizacion): https://huggingface.co/ISTA-DASLab
