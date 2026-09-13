# QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF

## Resumen

QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF es una cuantizacion de 4 bits del modelo multimodal google/gemma-4-E4B-it, publicada por QUASAR-QAT. No es una cuantizacion a posteriori (PTQ) al uso: el checkpoint se ha obtenido mediante entrenamiento consciente de la cuantizacion (QAT) con el metodo QUASAR, que optimiza la reconstruccion en bajo numero de bits durante el entrenamiento y exporta despues a formatos estandar de despliegue sin coste adicional en inferencia. El resultado se distribuye como GGUF nativo Q4_0 con escalas de grupo 64 ya entrenadas, mas un proyector de vision en BF16 sin modificar.

El problema que resuelve es concreto: la perdida de calidad al comprimir un modelo de ~7,46 mil millones de parametros a 4 bits. Segun la model card, este Q4_0 alcanza una divergencia KL de 0,044 frente al modelo BF16, aproximadamente la mitad que el Q4_0 QAT oficial de Google (0,088) y por debajo de otras alternativas de la comunidad (Unsloth Q4_0 con imatrix, 0,067; LM Studio Q4_K_M, 0,114), manteniendo un tiempo de ejecucion Q4_0 estandar en llama.cpp, Ollama y LM Studio.

Es relevante ahora porque permite ejecutar un modelo multimodal con ventana de 131.072 tokens, modo de razonamiento y soporte de tool calling en hardware de consumo, con una degradacion medible y acotada respecto al original. El repositorio incluye verificacion de bit-exactitud de los 258 tensores cuantizados contra su gemelo W4A16, lo que aporta trazabilidad poco habitual en este tipo de publicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de google/gemma-4-E4B-it (pipeline image-text-to-text, multimodal imagen-texto con proyector de vision) |
| Parametros totales | 7.463.013.674 (aproximadamente 7,46 B, dato de safetensors del modelo base) |
| Parametros activos | No disponible (el autor no publica configuracion de activacion selectiva) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_0 INT4 weight-only con escalas group-64 entrenadas; embeddings de tokens en Q6_K; proyector de vision en BF16; existe un gemelo W4A16 G64 para vLLM |
| Idiomas soportados | en y multilingual (la lista concreta de idiomas no esta disponible) |
| Licencia | apache-2.0 (el modelo base enlaza a los terminos de google/gemma-4-E4B-it) |
| Formato de pesos | GGUF (llama.cpp); el gemelo W4A16 usa safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E4B-it, un transformer multimodal con pipeline image-text-to-text, capacidad declarada de vision, audio en las etiquetas del repositorio, razonamiento con modo thinking, contexto largo y function calling. La model card no detalla el numero de capas, la configuracion de atencion ni si existe activacion selectiva de parametros (la nomenclatura E4B del modelo base sugiere un diseno de parametros efectivos, pero esta informacion no se confirma en la documentacion disponible). Total de parametros segun safetensors: 7.463.013.674.

El proceso de cuantizacion es el elemento diferencial. QUASAR es un metodo de QAT sensible a la perdida (loss-aware) descrito en el arXiv 2608.13966: durante el entrenamiento se mejora la reconstruccion en bajo numero de bits y posteriormente se exporta a formatos estandar con cero sobrecoste de inferencia. Este checkpoint concreto se "curo" (healing) contra el profesor BF16 durante 626 millones de tokens: una epoca sobre aproximadamente 398.000 prompts autodestilados del Gemma 4 E4B-it en BF16 con el modo thinking activado, pesos maestros en fp32 y cuantizacion INT4 con grupos de 64. El GGUF almacena directamente los codigos INT4 y las escalas entrenadas, sin recuantizacion posterior; los 258 tensores cuantizados se verifican bit a bit contra el gemelo W4A16 (recibo `native_q4_0_receipt.json` y script verificador incluidos).

## Capacidades

- Generacion de texto conversacional en formato instrucciones (modelo `-it`).
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat embebida; se desactiva con `--chat-template-kwargs '{"enable_thinking": false}'` en llama-cli y llama-server.
- Razonamiento matematico y resolucion de problemas: 82,0 en GSM8K y 60,7 en MATH-hard segun la evaluacion del autor.
- Comprension multimodal de imagenes: el proyector de vision BF16 (992 MB) se incluye y se carga automaticamente en Ollama; en llama.cpp se usa con `llama-mtmd-cli --image`.
- Soporte declarado de function calling y tool calling.
- Orientacion a flujos agenticos y razonamiento multi-paso (etiquetas `agentic`, `tool-calling`).
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos e historiales multi-turno.
- Capacidad multilingue declarada mediante la etiqueta `multilingual`, sin lista explicita de idiomas.
- La etiqueta `audio` figura en el repositorio, pero la model card solo documenta el pipeline de vision; la capacidades de audio no estan confirmadas en el material disponible.

## Casos de uso

- Atencion al cliente automatizada: con 131.072 tokens de contexto se puede adjuntar el historial completo de una incidencia, documentacion de producto y transcripciones previas sin truncar, y generar respuestas coherentes multi-turno en local.
- Analisis de documentos con imagenes: facturas, capturas de pantalla, diagramas o formularios pueden procesarse mediante el proyector de vision BF16, extrayendo informacion estructurada sin enviar los datos a un servicio externo.
- Generacion y revision de codigo en produccion: el soporte de tool calling permite integrarlo en pipelines de CI/CD como revisor de diffs o generador de pruebas, invocando herramientas externas (linters, ejecutores de tests) desde el propio modelo.
- Agentes autonomos multi-paso: el modo thinking combinado con function calling habilita planificacion de tareas encadenadas (consulta de APIs, navegacion de repositorios, agregacion de resultados) con bajo coste por token al ejecutarse en 4 bits.
- Tutoria y verificacion matematica: con 82,0 en GSM8K y 60,7 en MATH-hard puede resolver y comprobar pasos intermedios en problemas de nivel escolar y preuniversitario, mostrando el razonamiento antes de la respuesta final.
- Despliegue local para datos sensibles: al ocupar 5,23 GB el fichero principal y ejecutarse en Ollama o LM Studio, es viable en un portatil o estacion de trabajo para sectores con requisitos de confidencialidad (sanidad, legal, banca) donde no se permite salida de datos.
- Extraccion de informacion estructurada sobre textos largos: contratos, informes o articulos de decenas de miles de tokens convertidos a JSON o tablas con instrucciones estrictas, aprovechando el contexto de 131.072 tokens.
- Investigacion en cuantizacion: el repositorio incluye recibo de verificacion bit-exacta y configuraciones de evaluacion completas, por lo que sirve como referencia reproducible para comparar tecnicas de QAT frente a PTQ.

## Benchmarks y rendimiento

Divergencia respecto al modelo BF16 de referencia, medida con el mismo build de llama.cpp, mismos prompts y mismo backend en todas las filas:

| Cuantizacion | KL a BF16 (menor es mejor) | Acuerdo top-1 (mayor es mejor) |
|---|---:|---:|
| QUASAR Q4_0 | 0,044 | 92,8 % |
| Unsloth Q4_0 (imatrix) | 0,067 | 91,1 % |
| Google QAT Q4_0 | 0,088 | 90,6 % |
| Unsloth repack de Google QAT (UD-Q4_K_XL) | 0,071 | no disponible |
| LM Studio Q4_K_M | 0,114 | no disponible |

En el gemelo W4A16 bajo vLLM, el autor reporta KL 0,022 frente a BF16, frente a 0,064 del QAT W4A16 de Google.

Benchmarks downstream, medidos sobre el gemelo W4A16 (que comparte los codigos entrenados), con el mismo arnes de evaluacion:

| Benchmark | QUASAR | Google QAT |
|---|---:|---:|
| TriviaQA | 23,8 | 20,1 |
| NQ-open | 4,7 | 2,4 |
| TruthfulQA | 58,2 | 55,4 |
| ARC-Easy | 79,8 | 78,3 |
| ARC-Challenge | 56,2 | 56,0 |
| GSM8K | 82,0 | 81,5 |
| IFEval | 82,6 | 81,9 |
| MATH-hard | 60,7 | 59,4 |
| Media | 56,0 | 54,4 |

No hay datos publicos de benchmarks para la version GGUF Q4_0 concreta ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada (estimacion propia a partir del tamano de los ficheros, no confirmada por el autor): unos 5,2 GB para los pesos Q4_0 mas 0,99 GB del proyector de vision, es decir, aproximadamente 6,2 GB en reposo. Hay que anadir la cache KV, que crece con la longitud de contexto: con 131.072 tokens la demanda puede superar ampliamente el tamano de los pesos.
- GPU recomendadas para uso comodo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 para contextos largos o concurrencia; A100 o H100 cuando se requiere servir multiples peticiones o lotes grandes.
- Si cabe en GPU de consumo: si, con cuantizacion Q4_0 y contextos moderados cabe en tarjetas de 8 GB con ajustes, y con holgura en modelos de 12 GB o 16 GB. Tambien es viable en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli` para vision), Ollama (`ollama run hf.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF`) y LM Studio. Para vLLM hay que usar el gemelo W4A16 en safetensors, no el GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la misma familia y tamano (cuantizaciones 4 bits de Gemma 4 E4B-it):

| Modelo | Formato | KL a BF16 | Acuerdo top-1 | Licencia | Notas |
|---|---|---:|---:|---|---|
| QUASAR Q4_0 (este) | GGUF Q4_0 nativo | 0,044 | 92,8 % | apache-2.0 | QAT con codigos INT4 entrenados, verificacion bit-exacta |
| Google QAT Q4_0 | GGUF Q4_0 | 0,088 | 90,6 % | apache-2.0 | QAT oficial del fabricante |
| Unsloth Q4_0 (imatrix) | GGUF Q4_0 | 0,067 | 91,1 % | apache-2.0 | PTQ con matriz de importancia |
| LM Studio Q4_K_M | GGUF Q4_K_M | 0,114 | no disponible | apache-2.0 | Formato mas expresivo, peor KL en la medicion del autor |
| google/gemma-4-E4B-it (BF16) | safetensors | referencia | referencia | apache-2.0 | Modelo base sin cuantizar |

No se dispone de comparaciones con modelos de otros fabricantes del mismo orden de tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Aunque la divergencia es baja (KL 0,044), sigue existiendo perdida respecto al BF16; en tareas de razonamiento largo, matematicas complejas o generacion de codigo con dependencias sutiles puede haber degradacion acumulada.
- Riesgo de alucinacion inherente al modelo base; el propio autor reporta 58,2 en TruthfulQA, un valor que no permite tratar las salidas como hechos verificados.
- Los benchmarks downstream se midieron sobre el gemelo W4A16, no sobre el GGUF Q4_0; el autor argumenta que comparten los mismos codigos entrenados, pero no hay medicion directa publicada para el fichero GGUF.
- Cobertura idiomatica no detallada: las etiquetas indican `en` y `multilingual`, sin lista de idiomas ni evaluacion por idioma. El rendimiento en castellano no esta documentado.
- Contexto de 131.072 tokens declarado, pero sin datos de rendimiento en el extremo de esa ventana (atencion degradada, coste de cache KV, latencia).
- Licencia declarada apache-2.0, si bien el modelo base enlaza a los terminos de uso de Google para Gemma; conviene revisar las condiciones aplicables al uso comercial antes de integrarlo en produccion.
- Adopcion muy baja en el momento de la publicacion (25 descargas, 1 me gusta), lo que implica poca validacion independiente por parte de la comunidad.
- La verificacion bit-exacta y las cifras de KL provienen del propio autor; no se han localizado replicaciones externas en la informacion disponible.
- La etiqueta `audio` no esta respaldada por documentacion en la model card; no conviene asumir capacidades de audio sin verificarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paper de QUASAR: https://arxiv.org/abs/2608.13966
- Coleccion Gemma 4 E4B y 12B con QAT de 4 bits de QUASAR: https://huggingface.co/collections/QUASAR-QAT/quasar-native-4-bit-gemma-4-6aa3561770e6e4001271bf1e
- Detalle de evaluacion (EVAL.md): https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF/blob/main/EVAL.md
- Recibo de verificacion nativa Q4_0: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF/blob/main/native_q4_0_receipt.json
- Gemelo W4A16 para vLLM: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64
- Version GGUF de 12B con la misma receta: https://huggingface.co/QUASAR-QAT/gemma-4-12B-it-QUASAR-Q4_0-GGUF
- Q4_0 QAT oficial de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- QAT W4A16 de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Cuantizacion Q4_0 de Unsloth: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Repack de Unsloth sobre el QAT de Google: https://huggingface.co/unsloth/gemma-4-E4B-it-qat-GGUF
- Cuantizacion Q4_K_M de LM Studio: https://huggingface.co/lmstudio-community/gemma-4-E4B-it-GGUF

Nota: los resultados de busqueda web obtenidos (repositorio Quasar RAT, Quasar Framework, articulos sobre cuasares astronomicos y tienda de scripts de FiveM) no guardan relacion con este modelo y se han descartado por no ser relevantes.
