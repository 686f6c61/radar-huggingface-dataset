# infosave/humanizer-cmf

## Resumen

humanizer-cmf es un paquete de pesos cuantizados del modelo humanizer, un ajuste fino de 12B de parametros derivado de Google Gemma 4 12B. El modelo original lo desarrolla jialinyyzz y esta especializado en reescribir borradores escritos por IA (correos, ensayos, informes, publicaciones de foro) en ingles y chino para que suenen a texto humano, manteniendo intactos numeros, unidades, fechas, nombres y citas. Este repositorio lo publica el usuario infosave y no contiene el modelo en formatos habituales como safetensors o GGUF, sino empaquetado en archivos CMF de un solo fichero para `cortiq`, un motor de inferencia escrito en Rust sin Python ni frameworks de ML.

La relevancia de esta ficha esta en el formato y el motor de ejecucion mas que en el modelo en si. `cortiq` permite ejecutar los pesos en GPU NVIDIA, AMD e Intel mediante Vulkan/DX12, en Apple silicon mediante Metal y en CPU, y los archivos CMF ya incorporan la plantilla de prompt y los parametros de muestreo de los autores originales. El repositorio ocupa 19,9 GB e incluye dos cuantizaciones: `q8_2f` (8 bits, 11,97 GB) y `q4tp-ffn` (4 bits en FFN con atencion y embeddings en 8 bits, 7,89 GB).

Se trata de un modelo de completado de texto, no de chat: cada peticion procesa un unico borrador y genera una reescritura. La licencia es Apache 2.0 y la longitud de contexto no esta especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 4 12B); detalles especificos no disponibles |
| Parametros totales | 12B (aproximado, segun la model card: "humanizer 12B") |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (`q8_2f`); 4 bits en FFN con atencion y embeddings en 8 bits (`q4tp-ffn`) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (formato unico del motor `cortiq`); existe una version GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino supervisado del modelo base humanizer de jialinyyzz, que a su vez deriva de Google Gemma 4 12B. Esta especializado en reescritura de texto con una restriccion explicita: conservar todos los numeros, unidades, fechas, nombres y citas del borrador original. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo es un completado de texto, no un modelo conversacional, y los archivos CMF incluyen la plantilla de prompt de los autores: una instruccion, una linea en blanco, el borrador sin espacios sobrantes y el marcador `### Rewritten:`.

La innovacion de este repositorio no esta en el modelo, sino en el empaquetado CMF y el motor `cortiq`. Es un motor de inferencia nativo (Rust) que no depende de Python ni de frameworks de ML y que ofrece soporte para Vulkan/DX12 (GPU NVIDIA, AMD e Intel), Metal (Apple silicon) y CPU. Los archivos CMF encapsulan los pesos, la plantilla de prompt y la configuracion de muestreo de los autores (temperatura 1.0, top-p 0.95, top-k y min-p desactivados, penalizacion de repeticion 1.0), de modo que `cortiq run` y el endpoint `/v1/chat/completions` construyen la instruccion automaticamente a partir del borrador.

## Capacidades

- Reescritura de texto para reducir rasgos detectables como generados por IA en ingles y chino.
- Preservacion factual: mantiene numeros, unidades, fechas, nombres y citas tal cual aparecen en el borrador.
- Generacion de texto de tipo completion, con longitud de salida similar a la del borrador de entrada (por ejemplo, 932 tokens de salida para un borrador de 957 tokens).
- Funcionamiento con una sola pasada por peticion: un borrador por solicitud.
- Soporte de los parametros de muestreo de los autores y posibilidad de sobreescribirlos.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito.
- El endpoint `/v1/chat/completions` esta disponible, pero ignora los mensajes de sistema y los turnos previos.

## Casos de uso

- Reescritura de correos profesionales: el modelo transforma borradores generados por IA en textos que suenan naturales, conservando importes, fechas y nombres, algo critico en comunicaciones comerciales donde un dato alterado seria un error grave.
- Publicaciones en foros y comunidades: permite humanizar respuestas generadas automaticamente para que encajen en el tono de una comunidad, con contexto de una sola intervencion.
- Ensayos y trabajos academicos: reescribe parrafos manteniendo citas y referencias intactas, util como paso previo a una revision manual.
- Informes y documentacion tecnica: reescribe secciones de informes generados por IA conservando cifras y unidades, reduciendo el riesgo de que un dato se distorsione en el proceso.
- Contenido multilingue ingles-chino: al cubrir ambos idiomas, sirve para adaptar borradores en entornos bilingues sin cambiar de modelo.
- Integracion en aplicaciones de escritorio: los autores publican una app de escritorio para Mac y Windows que usa estos pesos como motor local, sin enviar datos a la nube.
- Despliegue ligero en hardware de consumo: con el archivo `q4tp-ffn` (7,89 GB, pico de 10,3 GB) puede ejecutarse en GPU de 12 GB, lo que permite integrarlo en equipos de sobremesa.
- Servicio HTTP local persistente: mediante `cortiq serve` se evita recargar los pesos en cada peticion, adecuado para reescribir varios borradores seguidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card si incluye evaluaciones de los autores del modelo original y mediciones de calidad y rendimiento de los archivos CMF.

Evaluaciones reportadas por los autores (sobre sus pesos bf16, no sobre los archivos CMF):

| Metrica | Resultado |
|---|---|
| Originality.ai (ajuste mas estricto), reescrituras en ingles | 95 % de 210 reescrituras juzgadas humanas |
| Juicio de LLM estricto, ausencia de problemas factuales | 376 de 420 reescrituras en ingles sin problema factual |

Calidad de las cuantizaciones CMF frente a los pesos bf16 de los autores (2.051 tokens de seis borradores; perplexity bf16: 2,1168):

| Archivo | Pesos | Tamano | top-1 vs bf16 | KL | Perplexity | Memoria GPU pico |
|---|---|---:|---:|---:|---:|---:|
| `humanizer-12b-q8_2f.cmf` | 8 bits | 11,97 GB | 99,4 % | 0,0008 | 2,1174 | 15,3 GB |
| `humanizer-12b-q4tp-ffn.cmf` | 4 bits FFN, 8 bits atencion y embeddings | 7,89 GB | 95,5 % | 0,020 | 2,1555 | 10,3 GB |

Rendimiento (`cortiq bench --core --ignore-eos`, un flujo, cortiq 0.8.16):

| Hardware | Backend | Archivo | Decodificacion (tok/s) | 1k tokens de prompt (tok/s) | Tiempo al primer token |
|---|---|---|---:|---:|---:|
| RTX PRO 4000 Blackwell (24 GB) | Vulkan | `q4tp-ffn` | 41,6 | 137 | 6,9 s |
| RTX PRO 4000 Blackwell (24 GB) | Vulkan | `q8_2f` | 31,7 | 90,2 | 10,8 s |
| Mac mini M4 (24 GB) | Metal | `q8_2f` | 6,6 | 68 | 14,7 s |
| Mac mini M4 (24 GB) | Metal | `q4tp-ffn` | 8,5 | 72 | 14,0 s |
| Mac mini M4 (24 GB) | CPU | `q8_2f` | 4,7 | no disponible | no disponible |
| Mac mini M4 (24 GB) | CPU | `q4tp-ffn` | 4,6 | no disponible | no disponible |

Reescrituras completas mediante `cortiq serve`:

| Hardware | Archivo | Borrador de 957 tokens: primer token | Reescritura completa | Velocidad de reescritura | Correo de 362 tokens |
|---|---|---:|---:|---:|---:|
| RTX PRO 4000 Blackwell | `q4tp-ffn` | 7,5 s | 901 tokens en 37,1 s | 30,1 tok/s | 10,6 s |
| RTX PRO 4000 Blackwell | `q8_2f` | 11,2 s | 932 tokens en 48,9 s | 24,7 tok/s | 14,8 s |

En una comprobacion factual greedy sobre tres borradores, `q8_2f` conservo todos los hechos y `q4tp-ffn` escribio un importe de forma distinta ("$186.000" como "$186k").

## Requisitos de hardware

- VRAM estimada: `q8_2f` requiere unos 15,3 GB de memoria GPU en pico con un prompt de 1.000 tokens; `q4tp-ffn` unos 10,3 GB.
- GPU recomendadas: RTX PRO 4000 Blackwell (24 GB) es la plataforma medida; cualquier GPU con 16 GB o mas para `q8_2f`.
- Consumer GPU: `q4tp-ffn` (7,89 GB) cabe en GPU de 12 GB; `q8_2f` necesita 16 GB o mas.
- Apple silicon: ambos archivos se ejecutan en un Mac mini M4 de 24 GB; se recomienda `q8_2f` porque el archivo de 4 bits no es mas rapido alli y lee el prompt mas despacio. Decodificacion de 6,6 tok/s (Metal, `q8_2f`) y 8,5 tok/s (Metal, `q4tp-ffn`).
- CPU: ejecutable directamente (4,7 tok/s con `q8_2f` y 4,6 con `q4tp-ffn` en el M4), a costa de latencia alta.
- Opciones de despliegue: motor `cortiq` (CLI `cortiq run`, servidor `cortiq serve`, endpoint `/v1/chat/completions`); se requiere cortiq 0.8.16 o superior. Existe una version GGUF en un repositorio aparte para su uso con llama.cpp.
- Latencia: en la RTX PRO 4000, el tiempo al primer token es de 7,5 s (`q4tp-ffn`) y 11,2 s (`q8_2f`) con un borrador de 957 tokens; la carga inicial de pesos en GPU tarda unos 13 s, por lo que conviene mantener `cortiq serve` en ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| infosave/humanizer-cmf (este) | 12B | no disponible | CMF (cortiq) | Apache 2.0 | HuggingFace, 0 descargas |
| jialinyyzz/humanizer | 12B | no disponible | pesos bf16 en HF transformers | Apache 2.0 (segun la model card) | HuggingFace (modelo base) |
| jialinyyzz/humanizer-GGUF | 12B | no disponible | GGUF (llama.cpp) | Apache 2.0 (segun la model card) | HuggingFace (variante oficial) |
| Google Gemma 4 12B | 12B | no disponible | safetensors y otros | licencia de Gemma | HuggingFace (modelo base original) |

No se dispone de modelos comparables de reescritura o humanizacion de texto con datos de rendimiento publicados en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio modelo y a su base.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible.
- Riesgo de alucinacion: la cuantizacion `q4tp-ffn` puede modificar ligeramente datos ("$186.000" reescrito como "$186k" en una prueba), lo que exige revision en contextos donde el formato exacto de cifras sea critico.
- Limitaciones de contexto e idioma: solo cubre ingles y chino, y la longitud de contexto no esta documentada.
- Modelo de completado, no conversacional: ignora mensajes de sistema y turnos previos, y procesa un unico borrador por peticion.
- No se deben anadir cadenas de parada, especialmente `"###"`, porque la generacion termina en el token de fin de secuencia.
- Licencia: Apache 2.0 permite uso comercial, pero la model card del modelo base debe consultarse para confirmar condiciones y atribucion.
- Requisito de software: los archivos CMF solo funcionan con el motor `cortiq` 0.8.16 o superior; no son compatibles con vLLM, TGI, Ollama ni llama.cpp.
- Repositorio con 0 descargas y 1 like: se trata de una publicacion de terceros (infosave) sobre los pesos de otro autor (jialinyyzz), sin historial de uso contrastado.
- Las metricas de calidad humana y factual reportadas corresponden a los archivos de los autores originales, no a los archivos CMF de este repositorio.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/infosave/humanizer-cmf
- Modelo base: https://huggingface.co/jialinyyzz/humanizer
- Detalles de evaluacion del autor original: https://huggingface.co/jialinyyzz/humanizer#evaluation-details
- Archivos GGUF para llama.cpp: https://huggingface.co/jialinyyzz/humanizer-GGUF
- Repositorio del motor CMF: https://github.com/infosave2007/cmf
- Binarios precompilados del motor: https://github.com/infosave2007/cmf/releases
- Codigo fuente y documentacion de humanizer: https://github.com/sgaofen/humanizer-local-model
- Aplicacion de escritorio (Mac y Windows): https://github.com/sgaofen/humanizer-local-model/releases/latest
- Modelo base original de Google: https://huggingface.co/google/gemma-4-12B
