# chenyumo/moziAI-27B-MTP

## Resumen

MoziAI-27B-3.8 es un ajuste fino (finetune) del modelo denso Qwen3.8-27B, publicado por chenyumo, equipo vinculado al divulgador financiero chino Chen Yumo. El modelo hereda la arquitectura transformer densa de 27 320 697 856 parámetros del base y añade capas de especialización vertical en el dominio financiero, un marco propietario de razonamiento estructurado denominado "seven-dimensional thinking", un mecanismo de iteración y autoevaluación llamado LOOP, y un algoritmo de cuantización híbrida propio, MoziSmartBit, que comprime los pesos a unos 13,7 GB conservando, según el autor, cerca del 99 % de la precisión de FP16.

La propuesta de valor es el despliegue local gratuito con licencia Apache-2.0, incluido uso comercial, en GPUs de consumo. El modelo se distribuye principalmente en formato GGUF para llama.cpp y es compatible con Ollama, LM Studio y Jan, además de exponer soporte nativo de tool calling, visión y decodificación especulativa MTP (multi-token prediction) para acelerar la inferencia.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: ajustes verticales sobre bases densas de tamaño medio, cuantizaciones agresivas que reducen el coste de VRAM y marcos de razonamiento con modos de "pensamiento" dinámico que el modelo activa según la complejidad de la tarea. La información disponible proviene casi exclusivamente de la model card del autor; no se han publicado resultados de benchmarks verificables en la documentación consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), con cabecera MTP para decodificacion especulativa |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con cuantizacion hibrida propietaria MoziSmartBit (~13,7 GB, precision declarada ~99 % de FP16); el autor la compara con Q4_K_M (~17 GB) |
| Idiomas soportados | zh, en declarados en metadatos; la model card afirma soporte de 201 idiomas y dialectos con optimizacion especial del chino |
| Licencia | Apache-2.0 (uso comercial permitido; atribucion segun NOTICE) |
| Formato de pesos | GGUF (libreria llama-cpp); repo de 14,7 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27,3 mil millones de parametros bajo licencia Apache-2.0. Sobre esa base, el equipo de chenyumo aplica un finetune orientado a dominio financiero y a tareas de agente, e incorpora una cabecera de prediccion multi-token (MTP) que se usa para decodificacion especulativa en llama.cpp: el modelo propone varios tokens por paso y un verificador los valida, lo que reduce la latencia en generacion autoregresiva.

La model card describe dos innovaciones de inferencia mas que de entrenamiento. La primera es el marco de "pensamiento en siete dimensiones", que el modelo activa emitiendo un marcador `moziAI-Think` y que despliega un numero variable de dimensiones (comprension de la tarea, evaluacion de complejidad, dependencias, riesgos, recursos, criterios de aceptacion y estrategia de ejecucion) segun tres niveles: nivel 0 para consultas simples, nivel 1 para analisis y nivel 2 para desarrollo o estrategia compleja. La segunda es el mecanismo LOOP, que en tareas complejas ejecuta una ronda de ejecucion y evaluacion seguida de una ronda de ajuste y verificacion antes de la respuesta final; en consultas simples se desactiva automaticamente.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la receta exacta de MoziSmartBit mas alla de que aplica precision diferenciada por capas en lugar de una cuantizacion uniforme.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles, con soporte declarado de hasta 201 idiomas y dialectos.
- Razonamiento estructurado con modo de pensamiento dinamico (`moziAI-Think`) en tres niveles de profundidad.
- Razonamiento multi-paso con autoevaluacion y refinamiento mediante el mecanismo LOOP.
- Tool calling y function calling nativo, con orquestacion de tareas multi-turno.
- Soporte de agentes y frameworks de codificacion agentica: OpenClaw, Hermes, Cursor, Claude Code y Codex segun la model card.
- Comprension de vision: interpretacion de imagenes y capturas de pantalla locales.
- Programacion general full-stack en Python, JavaScript, TypeScript, Go y Rust, incluyendo depuracion y diseno de arquitectura.
- Capacidades financieras especializadas: consultas de dominio, programacion cuantitativa y analisis de datos de mercado.
- Redaccion de genero multiple: informes de investigacion, articulos analiticos, documentacion tecnica y contenido creativo.
- Decodificacion especulativa MTP para acelerar la generacion.
- Compatibilidad con endpoints de API (etiqueta `endpoints_compatible`).

## Casos de uso

- Analisis financiero asistido: el ajuste sobre datos de dominio financiero y el modo LOOP permiten generar informes con verificacion interna de cifras y supuestos, reduciendo el riesgo de errores aritmeticos en calculos de valoracion o ratios.
- Programacion cuantitativa: generacion y depuracion de estrategias en Python con tool calling para consultar series de precios o ejecutar backtests en un pipeline externo.
- Agentes de codigo en local: integracion con Cursor o Claude Code para tareas de refactorizacion multi-archivo, aprovechando el razonamiento de nivel 2 y el bucle de autoevaluacion antes de aplicar cambios.
- Atencion al cliente bilingue chino-ingles: conversaciones multi-turno con llamadas a funciones para consultar estado de pedidos o cuentas, desplegado en Ollama o LM Studio sobre hardware propio.
- Procesamiento de documentos con vision: extraccion de datos de capturas de pantalla, facturas o graficos locales sin enviar imagenes a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generacion de documentacion tecnica y articulos: redaccion de informes y docs a partir de contexto largo, con el nivel 1 de pensamiento para estructurar el contenido antes de escribirlo.
- Despliegue en estaciones de trabajo sin GPU de datacenter: al ocupar unos 13,7 GB en MoziSmartBit, cabe en GPUs de consumo de 16 GB o mas, lo que permite prototipado y uso continuo sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion "Benchmarks" en el indice, pero su contenido no forma parte de los datos proporcionados. Las unicas cifras de rendimiento declaradas son la reduccion de tamano de la cuantizacion MoziSmartBit (~13,7 GB frente a ~17 GB de Q4_K_M) y la retencion de precision (~99 % de FP16), ambas sin metodologia de evaluacion publicada.

## Requisitos de hardware

- VRAM estimada: unos 13,7 GB con MoziSmartBit; aproximadamente 17 GB con Q4_K_M estandar; en FP16 el modelo de 27,3 B requeriria del orden de 55 GB, por lo que no es viable en hardware de consumo.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080/4070 Ti Super (16 GB) para la cuantizacion MoziSmartBit; A100 40/80 GB y H100 para FP16 o contextos muy largos.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM usando la cuantizacion propietaria; con 12 GB seria necesario descargar capas a CPU y la latencia aumentaria de forma notable.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio y Jan segun la model card; no se menciona soporte de vLLM ni TGI para este formato GGUF.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP deberia reducir la latencia por token respecto a decodificacion estandar, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MoziAI-27B-3.8 | 27,3 B denso | No disponible | Apache-2.0 | GGUF | Finetune financiero con MTP y cuantizacion propia |
| Qwen3.8-27B (base) | 27,3 B denso | No disponible | Apache-2.0 | Safetensors y derivados | Modelo original sin especializacion ni MTP |
| Gemma 3 27B | 27 B denso | 128 K (segun documentacion publica de Google) | Gemma License | Safetensors, GGUF | Multimodal, sin ajuste financiero |
| Mistral Small 3 (24B) | 24 B denso | 32 K (segun documentacion publica de Mistral) | Apache-2.0 | Safetensors, GGUF | Enfoque generalista con tool calling |

La comparacion con Qwen3.8-27B es la mas directa: MoziAI anade el ajuste de dominio, el marco de razonamiento y la cabecera MTP, pero no publica metricas que cuantifiquen la mejora frente al base. Frente a Gemma 3 27B y Mistral Small 3, la diferencia principal es la licencia Apache-2.0 sin restricciones adicionales y el enfoque vertical financiero, a costa de una documentacion tecnica mucho menos detallada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: las afirmaciones de rendimiento y de retencion de precision al 99 % no son verificables con la informacion disponible.
- Riesgo de alucinacion en dominio financiero: aunque el ajuste busca reducirlo, no hay evaluaciones que lo cuantifiquen y el dominio exige verificacion humana de cualquier cifra.
- La model card declara 201 idiomas, pero los metadatos solo listan zh y en; el rendimiento real en castellano no esta documentado.
- Longitud de contexto no especificada: no es posible planificar casos de uso con documentos largos sin medirla empiricamente.
- El marco de pensamiento en siete dimensiones y el modo LOOP pueden aumentar la latencia y el consumo de tokens en tareas simples si no se controlan los marcadores de activacion.
- La cuantizacion MoziSmartBit es propietaria y no estandar: la compatibilidad con herramientas distintas de llama.cpp y sus derivados no esta garantizada.
- El soporte de vision en formato GGUF depende de que el runtime cargue correctamente el proyector multimodal; conviene validarlo en el despliegue concreto.
- Aunque la licencia es Apache-2.0, el aviso NOTICE exige atribucion; revisar los terminos antes de redistribuir.
- Proyecto con 5 likes y 1478 descargas: comunidad pequena y poca validacion independiente, lo que implica menor soporte ante incidencias.
- No se documenta el proceso de entrenamiento ni los datos usados, lo que dificulta evaluar sesgos heredados del corpus financiero y del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-27B-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/chenyumo/moziAI-27B-MTP/blob/main/LICENSE.md
- README en espanol: https://huggingface.co/chenyumo/moziAI-27B-MTP/blob/main/V3.8/README.es.md
- README en ingles: https://huggingface.co/chenyumo/moziAI-27B-MTP/blob/main/V3.8/README.en.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Jan: https://jan.ai
