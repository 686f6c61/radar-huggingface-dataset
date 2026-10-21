# litert-community/granite-3.0-1b-a400m-instruct

## Resumen

`litert-community/granite-3.0-1b-a400m-instruct` es la conversión al formato LiteRT-LM (`.litertlm`) del modelo `ibm-granite/granite-3.0-1b-a400m-instruct` de IBM, publicada por la comunidad litert-community para el runtime LiteRT-LM de Google. El objetivo es ejecutar un modelo de instrucciones de tipo mixture-of-experts en dispositivos de borde (moviles Android, portatiles con GPU integrada) sin depender de un servidor: el repositorio ocupa 1,4 GB y contiene un unico fichero int8.

El modelo original es un transformer decoder-only disperso con 24 capas, 32 expertos por capa y 8 expertos activados por token, 1.334.628.352 parametros en bf16 segun el recuento del Hub (1,3B totales, 400M activos por token en la tabla de IBM). IBM lo publico el 21 de octubre de 2024, destilado por fine-tuning supervisado, alineamiento por refuerzo y merging a partir de `Granite-3.0-1B-A400M-Base`, con licencia Apache 2.0.

La relevancia de esta ficha concreta esta en la conversion: al no poder usar el export disperso `litert_moe` (los expertos del modelo usan SiLU y el runtime solo admite `gelu` en esa ruta), el fichero emplea `litert_moe_sequential` y calcula los 32 expertos de cada capa para cada token. El resultado es que un token cuesta el computo de los 1,33B parametros, no de los 400M activos, lo que condiciona la latencia real en movil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts disperso (24 capas, 32 expertos por capa, top-8 por token, SwiGLU) |
| Parametros totales | 1.334.628.352 (bf16, recuento del Hub); 1,3B en la tabla de IBM |
| Parametros activos | 400M por token en el modelo original; en este fichero el computo efectivo es el de los 1,33B parametros por token |
| Longitud de contexto | 4096 tokens en el modelo IBM; 2048 tokens en este fichero LiteRT-LM |
| Tipos de cuantizacion | int8 dinamico en capas lineales con activaciones float; el fichero declara activaciones fp32 en GPU (`prefer_activation_type: fp32`); el runtime puede forzar fp16 por defecto |
| Idiomas soportados | 12 idiomas segun IBM (lista completa no disponible en la informacion proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (un unico fichero int8, 1.372.745.360 bytes, sha256 `b0b786a5672c25d4aeb8ed90b7363294703809a1f95a5dfb8fb3dcf5db11d39f`) |

Detalles adicionales de arquitectura: hidden size 1024, 16 cabezas de atencion con 8 cabezas KV, expertos con hidden size 512, vocabulario de 49.155 tokens con embeddings atados.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con capas de mezcla de expertos: cada una de las 24 capas contiene 32 expertos SwiGLU de 512 unidades ocultas, de los que se seleccionan 8 por token mediante routing. Las 16 cabezas de atencion comparten 8 cabezas KV (GQA), el vocabulario es de 49.155 tokens con embeddings atados y el contexto nativo es de 4096 tokens. IBM lo entreno partiendo de `Granite-3.0-1B-A400M-Base` con fine-tuning supervisado sobre datasets de instrucciones de licencias permisivas y datos sinteticos internos, seguido de alineamiento por aprendizaje por refuerzo y merging de modelos. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

La conversion a LiteRT-LM se hizo con litert-torch en el commit `0d3869c` y se valido con litert-lm 0.18.0. La innovacion tecnica del fichero es la ruta `litert_moe_sequential`: en lugar del op `moe` disperso (que LiteRT-LM 0.18.0 rechaza en GPU por exigir activacion `gelu`, mientras los expertos del modelo usan SiLU), se calculan los 32 expertos de cada capa para todos los tokens, con peso de routing cero para los 24 expertos fuera del top-8. Ademas, las 32 capas FC de expertos de cada capa se fusionan en dos FC. Esto preserva la salida numerica pero elimina el ahorro computacional del MoE. El fichero declara activaciones fp32 en GPU porque con fp16 por defecto la precision en GSM8K cae de forma medible (ver benchmarks).

## Capacidades

- Generacion de texto e instrucciones en modo conversacional de un solo turno o multiturno corto, con plantilla de chat propia incluida en el bundle (sin turno de sistema).
- Razonamiento aritmetico basico y resolucion de problemas de varios pasos, con precision limitada (entorno al 35 % en GSM8K con el protocolo descrito).
- Generacion de codigo y texto tecnico como capacidad heredada del modelo de instrucciones de IBM; no hay evaluaciones de codigo en la informacion disponible.
- Capacidad multilingue: 12 idiomas declarados por IBM, desde ingles hasta chino.
- Inferencia en dispositivo: CPU y GPU (Metal/WebGPU) en macOS, y GPU/CPU en Android.
- No se documenta soporte de tool calling, function calling, modo thinking, vision ni audio en la informacion proporcionada.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.

## Casos de uso

- Asistentes integrados en aplicaciones Android sin conexion: el fichero de 1,37 GB se ejecuta en la GPU de un Galaxy S26 o Pixel 8a y procesa una prefill de 1024 tokens mas 256 tokens generados en 12,25-12,35 s y 28,24-28,40 s respectivamente, lo que permite respuestas locales sin enviar datos a la nube.
- Clasificacion y reescritura de texto en el dispositivo: con contexto de 2048 tokens cabe un documento corto o un historial de conversacion y la instruccion; util para resumir correos o notas sin salir del telefono.
- Correccion y generacion de texto asistida en editores offline: el modelo corre a 53 tok/s en CPU de un M4 Max, suficiente para autocompletado interactivo por frase en portatiles.
- Prototipado de pipelines LiteRT-LM: sirve como referencia para validar la ruta `litert_moe_sequential` y comparar precision int8 frente a bf16 antes de portar otros MoE de IBM al runtime.
- Evaluacion de cuantizacion en hardware real: el repositorio documenta el impacto de fp32 frente a fp16 en las activaciones de GPU (35 frente a 28-29 en GSM8K), lo que lo hace util como caso de prueba de robustez numerica.
- Juguetes educativos y demos de IA local en ferias o aulas: al no requerir servidor ni API, se puede distribuir con la aplicacion y ejecutar en un movil de gama media-alta.
- Filtrado y etiquetado de texto en el borde para preprocesar datos antes de enviarlos a un modelo mayor en servidor, reduciendo coste de tokens en la nube.

## Benchmarks y rendimiento

GSM8K con las preguntas de test 0-99, instruccion paso a paso que pide una linea final `#### <numero>`, plantilla del bundle sin turno de sistema, greedy (top-k 1) y un proceso nuevo por pregunta. El modelo no escribio la linea `####` en ninguna de las 100 respuestas en ninguna configuracion (tampoco en bf16), por lo que la puntuacion se calcula por el ultimo numero tras "answer", "total" o "result" con "is", ":", o "=", o en su defecto el ultimo numero de la respuesta.

| Configuracion | GSM8K (n=100) |
|---|---|
| Referencia bf16 (transformers, MPS) | 34 |
| Este fichero, GPU de Mac (activaciones fp32 declaradas) | 35 / 35 / 35 |
| Los mismos pesos, GPU de Mac con activaciones fp16 por defecto del runtime | 28 / 29 / 29 |
| Los mismos pesos, CPU de Mac | 39 / 35 |

Rendimiento de decodificacion en Mac Studio M4 Max: 146,2-146,5 tok/s en GPU y 53,0-53,1 tok/s en CPU (medido el 2026-10-21).

Tiempo para una prefill de 1024 tokens mas 256 tokens decodificados con contexto 2048:

| Tiempo (s) | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| GPU | 2,06 y 2,07 (dos ejecuciones) | 12,25, 12,35 y 12,34 (tres ejecuciones, con el reloj de GPU bajado por calor) | 28,24 y 28,40 (dos ejecuciones) |
| CPU | 6,48 y 6,49 (dos ejecuciones) | 14,12 y 13,57 (dos ejecuciones) | 26,59 y 29,15 (dos ejecuciones) |

Comprobacion de correctitud con 8 preguntas y `--top-k 1`: 8/8 en GPU y 8/8 en CPU de Mac (un hilo), y 8/8 en bf16 con transformers. Los primeros ocho tokens coinciden con la respuesta greedy de bf16 en 8 de 8 en GPU y 7 de 8 en CPU. En Galaxy S26 y Pixel 8a, con el sampler por defecto de `litert_lm_advanced_main`: 8/8 en GPU y 7/8 en CPU de cada telefono.

No hay resultados publicados de MMLU, HumanEval ni otros benchmarks en la informacion disponible. El model-index del README de IBM cita GSM8K 26,31 para una entrada llamada `granite-3.0-2b-instruct` con una configuracion no especificada, por lo que no es comparable con la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB solo para los pesos int8; con activaciones y buffers de runtime, el consumo real no esta cuantificado en la informacion disponible.
- Cabe en GPU de consumo: si, el modelo se ha ejecutado en la GPU de un Mac Studio M4 Max (Metal/WebGPU) y en las GPU de un Galaxy S26 y un Pixel 8a.
- Cabe en CPU: si, con 53 tok/s en un M4 Max y tiempos de 26-29 s para 1280 tokens en un Pixel 8a.
- GPU recomendadas: no hay una lista oficial; los datos disponibles cubren Apple M4 Max, Galaxy S26 y Pixel 8a. Para A100, H100 o RTX 4090 no hay mediciones en la informacion proporcionada.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert-lm` y API Python, version 0.18.0 probada), con backend GPU WebGPU/Metal y backend CPU. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI: el formato `.litertlm` no es compatible con esos servidores.
- Throughput: 146,2-146,5 tok/s en GPU de M4 Max y 53,0-53,1 tok/s en CPU de M4 Max. En moviles solo se publican tiempos totales para 1024+256 tokens, no tok/s.
- Nota de rendimiento: aunque el modelo original activa 400M parametros por token, este fichero calcula los 1,33B en cada token, por lo que la latencia es la de un modelo denso de ese tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este fichero (`litert-community/granite-3.0-1b-a400m-instruct`) | 1,33B | 400M en origen; 1,33B de computo efectivo en este fichero | 2048 | `.litertlm` int8 | Apache 2.0 | GSM8K 35 en GPU de Mac con fp32; pensado para borde |
| `ibm-granite/granite-3.0-1b-a400m-instruct` (bf16) | 1,33B | 400M | 4096 | safetensors bf16 | Apache 2.0 | Referencia de precision: GSM8K 34; requiere runtime de transformers, no cabe tan ajustado en movil |
| `ibm-granite/granite-3.0-2b-instruct` | no disponible | no disponible (denso) | no disponible | no disponible | Apache 2.0 | Solo se conoce la entrada del model-index de IBM con GSM8K 26,31 en configuracion no especificada |

No se dispone de datos de benchmarks ni de especificaciones completas de otras alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa con modelos de otros fabricantes no esta disponible.

## Limitaciones y advertencias

- Precision aritmetica limitada: GSM8K en torno al 35 % con el protocolo descrito, y el modelo no respeta el formato de respuesta final solicitado (`#### <numero>`) en ninguna de las 100 preguntas.
- Sensibilidad numerica a las activaciones: con fp16 por defecto en GPU la puntuacion cae a 28-29 frente a 35 con fp32, y entre 23 y 25 de las 100 preguntas cambian de veredicto entre ambas configuraciones. En produccion conviene fijar explicitamente el tipo de activacion.
- Se observo un error de validacion de WebGPU en una de las pasadas fp16, resuelto al reejecutar en un proceso nuevo; no se descartan fallos esporadicos del backend GPU.
- El MoE no aporta ahorro computacional en este fichero: cada token cuesta el computo de 1,33B parametros, asi que la latencia es mayor de la esperada para un modelo de 400M activos.
- Contexto reducido a 2048 tokens en este fichero (frente a 4096 del original), lo que limita conversaciones largas y documentos extensos.
- Riesgo de alusionacion propio de un modelo de 1,3B: no hay evaluaciones de veracidad en la informacion disponible.
- No hay informacion publicada sobre sesgos demograficos, linguisticos o culturales; los 12 idiomas declarados por IBM no se han verificado en esta conversion.
- La licencia Apache 2.0 permite uso comercial, pero la model card de la conversion no incluye garantias ni condiciones adicionales; conviene revisar la ficha de IBM para los terminos del modelo base.
- El formato `.litertlm` ata el despliegue al runtime LiteRT-LM; no es portable a vLLM, llama.cpp u Ollama sin reconversion.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo, solo contenido spam sin relevancia; no hay informacion externa contrastable.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/litert-community/granite-3.0-1b-a400m-instruct
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-3.0-1b-a400m-instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de verificacion de calidad citado en la model card: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Repositorio de litert-torch: no disponible como enlace en la informacion proporcionada (solo se cita el commit `0d3869c`)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
