# qualitymaterial/Ornith-1.5-35B-A3B-FP8-BLOCK-FreeToken

## Resumen

Ornith-1.5-35B-A3B-FP8-BLOCK-FreeToken es una conversión comunitaria del modelo Ornith 1.5 35B-A3B, desarrollado por ornith-ai, publicada por el usuario qualitymaterial. Se trata de un modelo de arquitectura MoE (mezcla de expertos) de 35.107.181.936 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, orientado a generación de texto, chat y tareas agénticas de programación. La etiqueta de arquitectura declarada es `qwen3_5_moe`, e incorpora pesos de visión y proyecciones de atención lineal, además de convolución.

El propósito de esta conversión es puramente práctico: permitir la ejecución local en un escritorio Windows con una GPU de 16 GB de VRAM y 64 GB de RAM. El checkpoint original en BF16 (unos 71,90 GB) se convirtió directamente a FP8 E4M3FN con bloques de 128 × 128, un formato compatible con el cargador nativo de expertos MoE de FreeToken, que en la versión probada no soportaba la cuantización por canal del checkpoint FP8 oficial ni la arquitectura Ornith a través de su cargador GGUF.

Es relevante porque demuestra un flujo de despliegue viable de un MoE de 35B en hardware de consumo mediante offload de expertos a RAM del sistema, sin depender de API alojada. No obstante, se trata de un checkpoint no oficial, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con una model card que documenta una única configuración de hardware probada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer (etiqueta `qwen3_5_moe`); incluye atencion lineal y pesos de vision |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | Aproximadamente 3B (designacion A3B); 256 expertos enrutados por capa, 8 seleccionados por token |
| Longitud de contexto | No disponible para el modelo original; en esta conversion la conversacion se limita a 98.304 tokens por configuracion de serving |
| Tipos de cuantizacion | FP8 E4M3FN con bloques de 128 × 128 y escalado simetrico absmax; escalas en F32. Embeddings, cabeza de salida, normalizacion, routers, convolucion, pesos de vision y proyecciones `a`/`b` de atencion lineal se mantienen en BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors, 16 shards, 36.614.026.256 bytes (36,61 GB / 34,10 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE): 40 capas decodificadoras principales, cada una con 256 expertos enrutados de los que se activan 8 por token. La conversion conserva integramente esos bancos de expertos y no crea ni reduce expertos. Ademas de los expertos, el modelo incorpora componentes de atencion lineal (proyecciones `a`/`b`) y pesos de vision, coherentes con la etiqueta de pipeline `image-text-to-text` del repositorio, aunque esta conversion se sirve en modo solo texto.

El proceso de conversion, documentado por el autor, parte de la revision `10fbf86fed7ecee4a061f8b499a618f46001cac1` del modelo original, con verificacion de los hashes SHA-256 de los 16 shards de origen. Los tensores apilados de expertos en BF16 se separaron en pesos individuales `gate_proj`, `up_proj` y `down_proj`. Cada matriz cuantizada usa escalado simetrico absmax por bloque de 128 × 128, con escala `max(abs(bloque)) / 448` y valor 1 para bloques totalmente nulos, en formato `float8_e4m3fn`. El cargador nativo de expertos convierte las escalas F32 a BF16 para la ejecucion. El autor indica explicitamente que no se realizo ningun ajuste fino ni aprendizaje por refuerzo para este checkpoint; es unicamente una conversion de precision del modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, con la limitacion de contexto configurada en 98.304 tokens.
- Programacion y asistencia de codigo, segun el uso previsto por el autor de la conversion (herramientas locales de chat y coding).
- Tool calling estructurado: el perfil local descrito permite que un cliente de programacion ejecute comandos de shell a traves de las llamadas a herramientas estructuradas del modelo.
- Uso agentico multi-paso: la configuracion probada contempla hasta cuatro peticiones concurrentes en el servidor y tres hilos de agente, con roles de planificador, programador, investigador y revisor definidos como instrucciones de cliente.
- Capacidades multimodales: el repositorio declara el pipeline `image-text-to-text` y el modelo conserva pesos de vision, aunque la conversion se sirve en modo solo texto.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistencia de programacion local en Windows: el modelo puede servir como backend de un cliente de codigo (se verifico con Codex CLI 0.160.0) ejecutando comandos de shell mediante tool calling estructurado, sin enviar codigo a una API externa.
- Agente de refactorizacion multi-paso: con hasta tres hilos de agente y roles separados de planificacion, codificacion, investigacion y revision, se puede orquestar un flujo de trabajo que inspeccione un repositorio, planifique cambios y los revise.
- Chat de documento largo: la ventana de 98.304 tokens permite mantener conversaciones sobre bases de codigo extensas o documentacion tecnica dentro de una misma sesion.
- Despliegue en hardware de consumo con offload de expertos: gracias a que el checkpoint cabe parcialmente en RAM del sistema y se cachea una porcion en GPU, es posible ejecutar un MoE de 35B en una maquina con 16 GB de VRAM y 64 GB de RAM.
- Automatizacion de tareas de linea de comandos: mediante las llamadas a herramientas del modelo, se pueden encadenar operaciones de sistema de archivos, compilacion o pruebas en un entorno controlado.
- Prototipado e investigacion sobre cuantizacion FP8: el repositorio documenta de forma detallada el esquema de escalado por bloques, lo que lo hace util como referencia para estudiar conversiones BF16 a FP8 en arquitecturas MoE.
- Inferencia sin coste por token: al ejecutarse localmente, se elimina el coste variable de una API alojada, dejando como costes la electricidad, el hardware y el almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no ha establecido que esta conversion supere a una cuantizacion de 4 bits concreta en tareas downstream, y que la comparacion entre Ornith 1.0 y 1.5 no es un estudio controlado de calidad.

Las unicas metricas publicadas son observaciones de consumo en la maquina de prueba:

| Metrica | Valor observado |
|---|---|
| Memoria GPU en serving | Aproximadamente 10-11 GiB |
| Memoria RAM en serving | Aproximadamente 50-51 GiB |
| Memoria fijada (pinned) para bancos de expertos | Aproximadamente 30,0 GiB |
| `FREETOKEN_PIN_BUDGET_GB` necesario | 30,5 (el valor por defecto en esa maquina, 24,6 GiB, era insuficiente) |
| Tamano de los pesos de salida | 36,61 GB (34,10 GiB) |
| Tamano de los pesos BF16 de origen | Aproximadamente 71,90 GB |

Estas cifras son observaciones de una maquina concreta, no minimos requeridos ni resultados de benchmark.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa 36,61 GB en FP8, por lo que la residencia total en GPU exige mas de 40 GB contando cache KV y activaciones (estimacion a partir del tamano de pesos). Con offload de expertos a RAM, la configuracion probada consume aproximadamente 10-11 GiB de VRAM.
- RAM del sistema: aproximadamente 50-51 GiB en uso durante el serving en la configuracion probada, con unos 30,0 GiB de memoria fijada para los bancos de expertos. Se recomienda disponer de al menos 64 GB.
- GPU recomendadas: NVIDIA GeForce RTX 5070 Ti de 16 GB (configuracion probada). Para residencia completa de los pesos, serian necesarias GPU de 80 GB (A100, H100) o configuraciones multi-GPU; este dato no esta confirmado por el autor.
- Compatibilidad con GPU de consumo: si, con offload de expertos. La RTX 5070 Ti de 16 GB es la unica configuracion documentada. No se dispone de datos para otras GPU de consumo.
- Opciones de despliegue: FreeToken (motor `0.1.3+gfa0e9537d` y FreeToken Desktop `0.2.0-beta.23`) es el unico runtime probado. El path FP8 de expertos probado no tiene executor de CPU alternativo: el offload significa almacenar pesos en RAM y transferirlos para ejecucion en GPU, no inferir en CPU. No se documenta compatibilidad probada con vLLM, llama.cpp, Ollama o TGI; el repositorio incluye la etiqueta `compressed-tensors`, pero su funcionamiento con esos motores no esta verificado.
- Latencia y throughput: no disponible. El autor no publica mediciones de velocidad y senala que las cargas de agentes concurrentes sostenidas no fueron evaluadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-FP8-BLOCK-FreeToken (esta conversion) | 35,1B totales / ~3B activos | Safetensors FP8 E4M3FN, bloques 128 × 128 | 98.304 tokens configurados en serving | MIT | Comunitaria, 0 descargas |
| ornith-ai/Ornith-1.5-35B-A3B (original) | 35,1B totales / ~3B activos | Safetensors BF16 (~71,90 GB) | No disponible | MIT | Oficial |
| Checkpoint FP8 oficial de Ornith 1.5 | 35,1B totales / ~3B activos | FP8 con cuantizacion por canal | No disponible | MIT | Oficial, incompatible con el cargador nativo de FreeToken en la version probada |
| Cuantizaciones GGUF de 4 bits del modelo Ornith | No disponible | GGUF | No disponible | MIT | Comunitaria; el cargador GGUF de la version de FreeToken probada no soportaba esta arquitectura |

No se dispone de datos de rendimiento comparativos entre estas variantes; la comparativa se limita a formato, tamano y compatibilidad de despliegue.

## Limitaciones y advertencias

- Conversion no oficial: el autor no pertenece al equipo de ornith-ai y no hay validacion independiente de la equivalencia funcional con el modelo original.
- Sin benchmarks publicados: no hay evidencia de que la cuantizacion FP8 preserve la calidad del modelo BF16 en tareas concretas, y el autor lo admite explicitamente.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, por lo que aplican las limitaciones habituales de un modelo de lenguaje sin verificar.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento en castellano ni en otros idiomas distintos del ingles.
- Contexto recortado: aunque el modelo original anuncia una ventana mayor, esta configuracion de serving limita la conversacion a 98.304 tokens, y ademas el consumo de memoria crece con la longitud de contexto.
- Restriccion de hardware y runtime: el unico entorno validado es Windows con FreeToken; no hay executor de CPU para el path FP8 de expertos y el presupuesto por defecto de memoria fijada en Windows resulto insuficiente, requiriendo ajuste manual mediante `FREETOKEN_PIN_BUDGET_GB`.
- Concurrencia no evaluada: los limites de cuatro peticiones concurrentes y tres hilos de agente estaban configurados, pero no se probaron cargas concurrentes sostenidas.
- Sin datos de rendimiento: se desconoce la latencia y el throughput reales, lo que dificulta planificar un uso en produccion.
- Licencia MIT: permite uso comercial y modificacion, pero al tratarse de una conversion derivada conviene conservar la atribucion al modelo original y revisar los terminos del modelo base.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/qualitymaterial/Ornith-1.5-35B-A3B-FP8-BLOCK-FreeToken
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Revision concreta del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/tree/10fbf86fed7ecee4a061f8b499a618f46001cac1
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada (los resultados de busqueda web no contienen material relevante sobre el modelo).
