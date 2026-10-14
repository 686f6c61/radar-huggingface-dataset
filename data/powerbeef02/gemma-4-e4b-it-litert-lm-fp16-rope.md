# PowerBeef02/gemma-4-E4B-it-litert-lm-fp16-rope

## Resumen

Este repositorio contiene una build de LiteRT-LM del modelo Gemma 4 E4B (variante instruct, `it`) con una unica modificacion respecto al original de `litert-community`: el grafo que convierte las posiciones de token en fases rotatorias (RoPE) ha sido reescrito para ser exacto en coma flotante de 16 bits. El autor es el usuario de HuggingFace PowerBeef02 y el modelo base es `litert-community/gemma-4-E4B-it-litert-lm`. El problema que resuelve es concreto y medible: con activaciones de 16 bits, la implementacion original corrompe secuencias verbatim (digitos, identificadores, citas) cuando el contexto supera los 2.048 tokens, porque el CAST de la posicion INT32 a float16 no puede representar todos los enteros por encima de 2.048 (2049 se convierte en 2048, y {2051, 2052, 2053} en 2052).

El arreglo divide la posicion como `2048·h + l`: la parte baja `l` (0-2047) es exacta en float16 y pasa por el camino original (MUL / SIN / COS), mientras que la fase de `2048·h` se obtiene de una tabla precalculada seleccionada con `onehot(h)`, y ambas se combinan mediante adicion de angulos usando solo valores en [−1, 1]. Se aplica a las cuatro firmas del grafo (`decode`, `prefill_1024`, `prefill_128`, `verify`) y al `mtp_drafter` de decodificacion especulativa. Los pesos son byte a byte identicos al original: solo cambia el grafo.

La relevancia es practica para despliegue en el dispositivo: mantiene la velocidad de fp16 (la correccion no cuesta rendimiento segun las mediciones del autor) y arregla un fallo que afecta a cualquier caso de uso en el que haya que copiar o citar texto literal con contexto largo. Es una correccion no oficial, de un repositorio con 1 descarga y 0 likes en el momento de redactar esta ficha, y el propio autor recomienda migrar a la solucion oficial de Google cuando este disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; build LiteRT-LM del modelo Gemma 4 E4B (Google), con grafo RoPE reescrito y `mtp_drafter` para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | Hasta 32.767 posiciones (16 bloques de 2.048), que es la ventana maxima que LiteRT-LM utiliza para este modelo |
| Tipos de cuantizacion | Activaciones de 16 bits (fp16) por defecto; el modelo puede ejecutarse tambien con activaciones fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), 3.659.988.992 bytes (3,66 GB) |
| Tamano del repositorio | 3,7 GB |
| Memoria tras la carga | 2,04 GB (medido en iPhone 17 Pro con GPU Metal) |
| Version minima del runtime | LiteRT-LM v0.18.0 |
| Modalidades incluidas | Texto, vision y audio (segun la model card) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion disponible. Lo que si se detalla es la intervencion sobre el grafo de inferencia: el modelo base es Gemma 4 E4B en su variante instruct, empaquetado en el formato LiteRT-LM de Google AI Edge, e incluye un `mtp_drafter` (multi-token prediction) que actua como modelo borrador en decodificacion especulativa. La modificacion afecta tanto al modelo principal como al borrador.

El cambio tecnico consiste en sustituir el calculo en tiempo de ejecucion de los angulos rotatorios (que partia de una copia en coma flotante de la posicion INT32, mediante `CAST → MUL(frecuencias inversas) → SIN/COS`) por un esquema de dos componentes: posicion baja exacta en fp16 mas fase de bloque alto leida de una tabla precalculada. Las operaciones nuevas usan solo patrones que el modelo ya emplea (tensores 4-D y reducciones sobre el ultimo eje), lo que evita introducir kernels nuevos. Los pesos no se tocan, por lo que no hay reentrenamiento, fine-tuning ni RLHF/DPO asociado a esta publicacion.

## Capacidades

- Generacion de texto y conversacion en modo instruct, heredadas del modelo base Gemma 4 E4B (no se detallan capacidades adicionales en la model card).
- Copia y reproduccion verbatim de secuencias exactas (digitos, identificadores, citas) con contexto de hasta 32.767 tokens, que es precisamente el fallo que corrige esta build.
- Procesamiento de imagenes (vision) y de audio, segun se indica en las instrucciones de uso.
- Inferencia en el dispositivo (on-device) en CPU o GPU, sin necesidad de sobreescribir el tipo de activacion.
- Decodificacion especulativa mediante el `mtp_drafter` incluido, con texto de salida identico al de la ruta FP32 + MTP segun las mediciones del autor.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistentes locales sin conexion en aplicaciones iOS y macOS: al ejecutarse con LiteRT-LM sobre delegado Metal o WebGPU, el modelo puede dar servicio dentro de la propia app, sin llamadas a red, con 2,04 GB de memoria tras la carga y sin depender de un servidor.
- Extraccion de identificadores y datos estructurados en documentos largos: numeros de factura, IBAN, DNI, numeros de serie o referencias legales requieren copia literal; la correccion de RoPE garantiza que una secuencia de 48 digitos se reproduzca sin mutaciones incluso con 30.000 tokens de contexto, algo que la build original en FP16 fallaba a partir de 2K tokens.
- Analisis de contratos y citas textuales: en tareas juridicas o de compliance donde hay que citar fragmentos literales de un documento extenso, el modelo evita el "stutter" de copia (`…2446443…` en lugar de `…24464436…`) que invalida la respuesta.
- Procesamiento de documentos escaneados con vision: al incluir capacidad de vision, puede leer capturas o fotografias de documentos y responder sobre su contenido, todo en el dispositivo.
- Transcripcion y comprension de audio on-device: la modalidad de audio permite construir notas de voz, resumenes de reuniones o asistentes de accesibilidad sin enviar el audio a un servicio externo.
- Asistentes interactivos de baja latencia: con decodificacion especulativa alcanza 38,6 tok/s a 2K tokens de contexto y 34,7 tok/s a 16K, lo que lo hace viable para interfaces conversacionales en tiempo real en movil.
- Aplicaciones con requisitos estrictos de privacidad: al no salir los datos del dispositivo, encaja en escenarios sanitarios, financieros o corporativos donde el envio a la nube no es aceptable.
- Reproduccion y auditoria de builds LiteRT-LM: el repositorio incluye `patch_rope.py` y hashes SHA-256, de modo que un equipo puede regenerar el fichero desde el original de Google y verificar la integridad de la build antes de desplegarla.

## Benchmarks y rendimiento

Tarea descrita por el autor: copiar una referencia de 48 digitos insertada entre texto de relleno sin digitos, con decodificacion greedy, en un iPhone 17 Pro con iOS 27.0.1, LiteRT-LM v0.18.0 (API Swift) y acelerador GPU Metal, con `maxNumTokens` de 32.768.

| Metrica | Este modelo, FP16 | Original, FP32 | Original, FP16 |
|---|---|---|---|
| Copias exactas, 0,7K-30K tokens | 14/14 | 14/14 | 0/3 (2K, 8K, 30K) |
| Texto identico al original FP32 | 14/14 | n/a | n/a |
| Prefill (tok/s) a 2K / 8K / 30K | 512 / 385 / 288 | 243 / 229 / 154 | 337 / 378 / 301 |
| Decode (tok/s) a 2K / 8K / 30K | 22,2 / 16,1 / 11,2 | 14,2 / 13,7 / 10,4 | 14,1 / 16,0 / 11,7 |
| Decode con decodificacion especulativa (tok/s) a 2K / 6K / 16K | 38,6 / 40,5 / 34,7 | 25,2 / 24,2 / 17,1 | n/a |
| Memoria tras la carga | 2,04 GB | 2,76 GB | n/a |

Mediciones adicionales en Mac (Apple M6, delegado WebGPU): copias exactas en 88/88 casos entre 237 y 29.960 tokens, texto identico al original FP32 en las 18 ejecuciones de 6K-30K tokens, y prefill y decode dentro de aproximadamente el 1 % del original en FP16.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 2,04 GB tras la carga del modelo (medido en iPhone 17 Pro); el fichero en disco ocupa 3,66 GB.
- GPU recomendadas: no hay lista oficial. Los backends verificados por el autor son Metal en iOS (iPhone 17 Pro) y WebGPU en macOS (Apple M6). La build tambien funciona en CPU.
- GPU de consumo: si, en hardware Apple Silicon. No hay datos publicados de ejecucion en GPU NVIDIA o AMD.
- Opciones de despliegue: LiteRT-LM v0.18.0 o superior, con API Swift en iOS y delegados CPU, GPU Metal o WebGPU. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es `.litertlm` y no GGUF ni safetensors.
- Throughput medido: prefill de 512 tok/s con 2K de contexto y 288 tok/s con 30K; decode de 22,2 tok/s con 2K y 11,2 tok/s con 30K; con decodificacion especulativa, 38,6 tok/s con 2K y 34,7 tok/s con 16K.
- Latencia: no se publican cifras de tiempo hasta el primer token.
- Reproducibilidad: requiere Python 3 con `ai-edge-litert==2.3.0`, `litert-lm-builder==0.18.0`, `flatbuffers==25.12.19` y `numpy` para regenerar el fichero con `patch_rope.py`.

## Comparativa con modelos similares

| Modelo | Modificacion | Copias exactas en FP16 | Decode 2K (tok/s) | Memoria tras carga | Licencia |
|---|---|---|---|---|---|
| `PowerBeef02/gemma-4-E4B-it-litert-lm-fp16-rope` | Grafo RoPE reescrito para FP16 exacto | 14/14 (0,7K-30K) | 22,2 (38,6 con especulativa) | 2,04 GB | Apache 2.0 |
| `litert-community/gemma-4-E4B-it-litert-lm` (FP16) | Sin modificar | 0/3 | 14,1 | no disponible | Apache 2.0 |
| `litert-community/gemma-4-E4B-it-litert-lm` (FP32) | Sin modificar, precision completa | 14/14 | 14,2 | 2,76 GB | Apache 2.0 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La correccion es no oficial. El propio autor recomienda preferir la solucion oficial cuando Google la publique en LiteRT-LM o en los ficheros del modelo.
- Solo se ha validado sobre Gemma 4 E4B, en dos backends GPU (Metal en iOS y WebGPU en macOS) y en CPU. No hay evidencia de su comportamiento en otros modelos ni en otros backends.
- El rango de posiciones soportado esta limitado a 32.767 (16 bloques de 2.048), que es la ventana maxima que LiteRT-LM emplea para este modelo.
- No se aportan datos sobre sesgos del modelo, tasas de alucinacion ni comportamiento multilingue.
- No hay resultados de benchmarks academicos publicados para esta build.
- El repositorio tiene 1 descarga y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- La licencia es Apache 2.0 segun la model card; Gemma 4 E4B es de Google y la build LiteRT-LM es de litert-community. Las modificaciones se describen en `NOTICE`. Conviene verificar los terminos aplicables del modelo base antes de un uso comercial.
- Al tratarse de un fichero `.litertlm`, no es directamente utilizable con los stacks habituales de servidor (vLLM, TGI, llama.cpp) sin conversion.
- El rendimiento depende fuertemente del backend: las cifras de tok/s proceden de hardware Apple concreto y no son extrapolables a otros dispositivos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PowerBeef02/gemma-4-E4B-it-litert-lm-fp16-rope
- Modelo base: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Fichero original del modelo base: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm/resolve/2eee7ac325f20eb8c9ac1d0e972f7c84663062da/gemma-4-E4B-it.litertlm
- Issue de LiteRT-LM #3913 (descripcion del fallo): https://github.com/google-ai-edge/LiteRT-LM/issues/3913
- Analisis con intervenciones en el issue: https://github.com/google-ai-edge/LiteRT-LM/issues/3913#issuecomment-6157362598
- Experimentos, resultados y scripts: https://github.com/PowerBeef/LiteRT-LM/tree/research/3913/research/issue-3913
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
