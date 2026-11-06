# hyukudan/Nemotron-3.5-Bolt-E4B-EXL3

## Resumen

Nemotron-3.5-Bolt-E4B-EXL3 (M4) es una cuantizacion en formato EXL3 del modelo NVIDIA Nemotron 3.5 Bolt E4B, publicada por el usuario hyukudan. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos cuantizados a 4,65 bits efectivos por peso sobre las capas lineales, disenado especificamente para el motor `strix-halo-engine-lab` (familia `gemma4`). Su proposito es ofrecer una fidelidad de salida superior a la cuantizacion oficial Q4_K_M de NVIDIA reduciendo ademas los bytes de pesos leidos por token durante la decodificacion.

El pack esta pensado para entornos con memoria unificada amplia, como un AMD Strix Halo con 128 GB, donde el modelo completo (9,71 GB de descarga) cabe holgadamente. La cuantizacion emplea trellis-coded quantization EXL3 con codebook `mul1` y LDLQ con Hessian escalada, calibrada sobre aproximadamente 1,02 millones de tokens en ocho idiomas, codigo, tool calls y razonamiento largo.

La relevancia actual radica en que demuestra que una cuantizacion bien calibrada puede superar en fidelidad a la cuantizacion oficial del fabricante (92,94 % de acuerdo top-1 frente a 87,0 % del Q4_K_M) leyendo menos bytes por token (2,70 GB frente a 3,13 GB). El principal caveat es que el formato solo carga en el motor del autor, no en llama.cpp, vLLM ni Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia gemma4 segun tags; modelo base NVIDIA Nemotron 3.5 Bolt E4B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el sufijo E4B sugiere un modelo con parametros efectivos de 4B, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis-coded, 4,65 bits efectivos por peso (MLP gate/up/down a 4 bits, attention q/o a 5 bits, attention k/v y output head a 6 bits); linears de entrada por capa en BF16 |
| Idiomas soportados | en, es, fr, de, it, pt, zh, ja |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (tensores no cuantizados) + `weights.bin` (linears cuantizados EXL3); compatible solo con el motor strix-halo-engine-lab |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia gemma4 segun los tags del repositorio, aunque la informacion disponible no detalla su configuracion interna (numero de capas, dimension oculta, mecanismo de atencion). El sufijo E4B y la referencia a un "MTP drafter" (multi-token prediction) en la model card sugieren un diseno con parametros efectivos reducidos y decodificacion especulativa integrada, pero no se confirman detalles arquitectonicos concretos.

El proceso de cuantizacion es el elemento diferencial. Se aplico EXL3 con codificacion trellis y codebook `mul1`, usando LDLQ con Hessian escalada capturada sobre el modelo BF16 y la herramienta `quantize_exl3` de exllamav3. La calibracion uso aproximadamente 1,02 millones de tokens en 1.564 documentos renderizados con la plantilla de chat oficial, cubriendo ocho idiomas, codigo, tool calls y razonamiento largo. Aproximadamente el 40 % de los tokens de calibracion son respuestas generadas por el propio modelo BF16; el resto proviene de fuentes publicas con licencias permisivas (OpenAssistant oasst2, Wikipedia, codigo permisivo, Hermes function-calling, OpenThoughts). Los documentos de calibracion son disjuntos del conjunto de evaluacion. Los tensores no cuantizados (embeddings, tabla de embedding por capa, normas, escalares de capa y linears de entrada por capa) son identicos byte a byte al modelo base.

## Capacidades

- Generacion de texto conversacional en ocho idiomas (ingles, espanol, frances, aleman, italiano, portugues, chino y japones).
- Razonamiento de multiples pasos, segun la composicion del dataset de calibracion (OpenThoughts, razonamiento largo).
- Tool calling y function calling, con calibracion especifica sobre datos de Hermes function-calling.
- Generacion de codigo, con calibracion sobre fuentes de codigo permisivo.
- Decodificacion especulativa mediante un MTP drafter opcional, que acelera la generacion manteniendo identicos los token ids.
- Fidelidad de salida proxima al BF16 (92,94 % de acuerdo top-1, KL media de 0,0367), superior a la cuantizacion oficial Q4_K_M.
- Capacidades multimodales, de vision o audio: no disponible en la informacion.

## Casos de uso

- Despliegue local en hardware de memoria unificada: el pack esta disenado para ejecutarse en una unica AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S, 128 GB) con el motor strix-halo-engine-lab, aprovechando que los 9,71 GB de descarga caben en memoria unificada y permiten decodificacion a 72,1 tok/s con el drafter MTP activo.
- Asistente conversacional multilingue: el modelo cubre ocho idiomas y su calibracion incluye documentos en todos ellos, por lo que es adecuado para atencion al usuario en entornos con mezcla de idiomas sin reentrenamiento.
- Generacion de codigo en pipelines de desarrollo: la calibracion sobre codigo permisivo y tool calls permite integrarlo en flujos de autocompletado o generacion de funciones, siempre que el motor soporte el formato EXL3.
- Automatizacion con function calling: los datos de calibracion de Hermes function-calling respaldan el uso en agentes que invocan APIs externas mediante tool calling.
- Razonamiento de multiples pasos: la inclusion de OpenThoughts y razonamiento largo en la calibracion lo hace apto para tareas que requieren cadenas de pensamiento, como resolucion de problemas o planificacion.
- Evaluacion de tecnicas de cuantizacion: el pack sirve como referencia practica para comparar EXL3 M4 frente a Q4_K_M en terminos de fidelidad (top-1 y KL) y bytes leidos por token, util para investigadores que estudian el impacto de la cuantizacion en la calidad de salida.
- Servicio con concurrencia moderada: con C4 a 153,0 tok/s y C8 a 258,7 tok/s agregados en el hardware de referencia, puede atender varias peticiones simultaneas en un unico nodo.

## Benchmarks y rendimiento

Fidelidad frente al modelo BF16, medida sobre un conjunto de 40 documentos en ocho idiomas:

| Pesos | Acuerdo top-1 | KL media |
|---|---:|---:|
| EXL3 M4 (este repositorio) | 92,94 % | 0,0367 |
| Q4_K_M GGUF oficial (nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB) | 87,0 % | 0,141 |

Rendimiento en una AMD Strix Halo (gfx1151, 128 GB), decodificacion greedy, 256 tokens:

| Modelo (perfil) | Descarga GB | Bytes de pesos por token | Top-1 vs BF16 | KL media vs BF16 | Decode C1 con drafter | Decode C1 sin drafter | C4 | C8 | Prefill 2K | Prefill 8K |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 oficial (referencia) | 16,06 | 9,29 GB | 100 % | 0 | 38,1 | 19,8 | 72,4 | 156,7 | 565 | 534 |
| Q4_K_M oficial, `default` | 6,18 | 3,13 GB | 87,0 % | 0,141 | 85,1 | 55,9 | 169,3 | 237,9 | 466 | 429 |
| Q4_K_M oficial, `fast` | 6,18 | 3,13 GB | 86,7 % | 0,150 | 92,2 | 53,9 | 205,1 | 337,5 | 458 | 414 |
| EXL3 M4 (este repo), `quality` | 9,71 | 2,70 GB | 92,94 % | 0,0367 | 72,1 | 44,4 | 153,0 | 258,7 | 769 | 701 |
| Referencia llama.cpp `74a4fb00`, Q4_K_M oficial | 6,18 | 3,13 GB | no disponible | no disponible | no disponible | 55,4 | 193,3 | 281,9 | 2.052 | 1.873 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Descarga total: 9,71 GB, de los cuales 6,98 GB corresponden a las tablas de embedding BF16 y de embedding por capa (se lee solo una fila por token).
- Lectura de pesos por token decodificado: 2,70 GB, aproximadamente un 14 % menos que el Q4_K_M GGUF.
- Hardware de referencia medido: una AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S gfx1151) con 128 GB de memoria unificada.
- VRAM estimada en GPU dedicada: no disponible; el pack esta disenado para memoria unificada y no se documentan requisitos para A100, H100 o RTX 4090.
- Despliegue: exclusivamente mediante el motor strix-halo-engine-lab (perfil `quality`, identidad EXL3 `g4-exl3-v3`); no es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Decodificacion: 72,1 tok/s en C1 con el drafter MTP activo (44,4 tok/s sin drafter), 153,0 tok/s en C4 y 258,7 tok/s en C8.
- Prefill: 769 tok/s con 2K de contexto y 701 tok/s con 8K.
- El drafter MTP se activa automaticamente cuando existe el directorio `<model dir>/drafter-mtp/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Fidelidad vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EXL3 M4 (este repo) | no disponible | no disponible | 92,94 % top-1 / KL 0,0367 | openmdw-1.1 | Hugging Face, solo motor strix-halo-engine-lab |
| NVIDIA Nemotron 3.5 Bolt E4B BF16 | no disponible | no disponible | referencia | openmdw-1.1 | Hugging Face (nvidia) |
| NVIDIA Nemotron 3.5 Bolt E4B Q4_K_M GGUF | no disponible | no disponible | 87,0 % top-1 / KL 0,141 | openmdw-1.1 | Hugging Face (nvidia), compatible con llama.cpp |

La comparativa se limita a las variantes oficiales del mismo modelo base, ya que la informacion proporcionada no incluye datos de otros modelos de tamano o categoria similares.

## Limitaciones y advertencias

- Compatibilidad restringida: el layout de pesos solo carga en el motor strix-halo-engine-lab; no funciona en llama.cpp, vLLM, Ollama, TGI ni otras herramientas estandar.
- Rendimiento de decodificacion inferior al Q4_K_M oficial en C1 sin drafter (44,4 frente a 55,9 tok/s) y en C4 (153,0 frente a 169,3 tok/s), aunque superior en C8 (258,7 frente a 237,9 tok/s).
- Prefill notablemente mas lento que llama.cpp con el mismo Q4_K_M (769 frente a 2.052 tok/s en 2K), lo que penaliza cargas con prompts largos.
- Descarga mas grande que el Q4_K_M (9,71 frente a 6,18 GB) por conservar las tablas de embedding en BF16.
- La fidelidad del 92,94 % implica que aproximadamente un 7 % de los tokens no coinciden con el argmax del BF16; puede haber degradacion en tareas sensibles a la precision exacta.
- Sesgos conocidos: no disponible en la informacion; el dataset de calibracion incluye fuentes publicas que pueden arrastrar sesgos, pero no se documentan.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos.
- Restricciones de licencia: openmdw-1.1; debe revisarse el texto completo en el enlace de licencia antes de uso comercial.
- El modelo base es una version cuantizada, no un modelo entrenado de forma independiente; cualquier limitacion del Nemotron 3.5 Bolt E4B original se hereda.
- La informacion sobre arquitectura, contexto y numero de parametros no esta disponible en la model card, lo que dificulta evaluar su idoneidad para tareas con ventanas de contexto muy largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hyukudan/Nemotron-3.5-Bolt-E4B-EXL3
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Cuantizacion oficial Q4_K_M: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Motor strix-halo-engine-lab: https://github.com/hyukudan/strix-halo-engine-lab
- Guia del modelo en el motor: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/models/nemotron-3.5-bolt-e4b/README.md
- README del motor (seccion Nemotron 3.5 Bolt E4B): https://github.com/hyukudan/strix-halo-engine-lab#nemotron-35-bolt-e4b
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
