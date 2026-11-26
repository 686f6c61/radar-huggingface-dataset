# AXERA-TECH/Qwen3-ForcedAligner-0.6B-AX8860-llama.cpp

## Resumen
Qwen3-ForcedAligner-0.6B-AX8860-llama.cpp es un paquete de despliegue, publicado por AXERA-TECH, que permite ejecutar el modelo Qwen3-ForcedAligner-0.6B de Qwen sobre la NPU de cuatro nucleos del SoC Axera AX8860 mediante llama.cpp y el backend ggml-axera. No se trata de un modelo nuevo, sino de una adaptacion de inferencia: los pesos se distribuyen en formato GGUF (torre de texto en BF16 y codificador de audio en Q8_0) y los kernels axmodel se generan sin pesos, que se convierten en tiempo de carga (MXFP8 para la torre de texto y BF16 para el codificador de audio).

La tarea del modelo subyacente es el alineamiento forzado a nivel de palabra: dado un audio y su transcripcion, devuelve los tiempos de inicio y fin de cada palabra sobre una rejilla de 80 ms. El paquete incluye una CLI (`llama-forced-aligner`), un servidor persistente (`llama-server`) con endpoints `/v1/audio/alignments` y `/v1/audio/transcriptions` de estilo OpenAI, scripts de ejecucion y de benchmark, y ejemplos de audio de 5 s, 30 s y cerca del limite de contexto.

Su relevancia es practica: demuestra que un alineador de 601 millones de parametros puede ejecutarse en hardware de borde (edge) con latencias de decimas de segundo y una fidelidad muy alta frente a la referencia FP32 en CPU, lo que habilita subtitulado, sincronizacion de transcripciones y pipelines de voz sin depender de GPU en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ForcedAligner-0.6B; torre de texto con 28 capas y cabeza de clasificacion de 5000 clases sobre rejilla de 80 ms, mas codificador de audio) |
| Parametros totales | 601.300.992 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos incluyen audio cercano al limite; el caso mas largo medido es de 162,84 s) |
| Tipos de cuantizacion | GGUF BF16 (torre de texto), GGUF Q8_0 (codificador de audio); en placa: MXFP8 para torre de texto y BF16 para codificador de audio |
| Idiomas soportados | chino e ingles (con las reglas oficiales de segmentacion de palabras); japones y coreano: informacion truncada en la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3-forcedaligner-0.6b-bf16.gguf`, `mmproj-qwen3-forcedaligner-0.6b-q8_0.gguf`) mas kernels axmodel y binarios |

## Arquitectura y entrenamiento
El paquete no documenta el entrenamiento del modelo base; la informacion disponible se centra en el despliegue. La arquitectura efectiva es un pipeline de dos etapas: un codificador de audio que procesa la senal y una torre de texto de 28 capas que, junto con una cabeza de clasificacion de 5000 clases, predice los limites de palabra sobre una rejilla temporal de 80 ms. La salida se postprocesa con la regla oficial `fix_timestamp` para imponer monotonia en los tiempos.

La innovacion tecnica esta en la integracion: los kernels axmodel no contienen pesos y se convierten en carga (torre de texto en MXFP8, codificador de audio en BF16 desnormalizado desde el Q8_0 del mmproj). Se reportan cosine similarities en placa de 0,9999971 para el codificador de audio, 0,9984-0,9998 para las 28 capas de la torre de texto y 0,9999995 para la cabeza de 5000 clases, lo que indica que la deriva numerica procede principalmente de los pesos MXFP8 de la torre de texto y no del clasificador. El servidor funciona con `-np 1` (una peticion simultanea) y el modelo permanece residente.

## Capacidades
- Alineamiento forzado a nivel de palabra: genera tiempos de inicio y fin para cada palabra dada una transcripcion y un audio.
- Salida estructurada en JSON con `words`, `timestamp_ids`, `raw_timestamp_ms`, `fixed_timestamp_ms`, `segments`, `language`, `duration`, `input_tokens` y `audio_tokens`.
- Diagnostico de confianza mediante `top2_margin_u6` (margen entre las dos clases mas probables de la cabeza).
- Servidor HTTP persistente con endpoints `/v1/audio/alignments` y `/v1/audio/transcriptions` (estilo OpenAI, con `response_format=verbose_json`).
- Acepta peticiones multipart (`file`, `transcript`, `language`) o cuerpo JSON con audio en base64.
- Cabeceras de respuesta con metricas por peticion: `X-Align-Forward-Seconds`, `X-Align-Input-Tokens`, `X-Align-Audio-Tokens`.
- Soporte de chino e ingles con las reglas oficiales de segmentacion.
- No se documentan capacidades de generacion libre, razonamiento, codigo, tool calling, agentes, vision ni audio generativo.

## Casos de uso
- Subtitulado y sincronizacion de transcripciones: dado un audio y su texto, el modelo devuelve los tiempos por palabra, lo que permite generar subtitulos con marcas temporales precisas (error absoluto medio de 2,67 ms frente a la referencia FP32 en la comparativa publicada).
- Verificacion de transcripciones ASR: al alinear el texto reconocido con el audio se pueden detectar omisiones, inserciones o desajustes temporales en pipelines de reconocimiento de voz.
- Edicion de video y audio asistida: la salida por palabra y por segmento facilita el corte, la busqueda y la navegacion dentro de material hablado.
- Procesamiento en el borde (edge): al ejecutarse en la NPU de un AX8860 con un consumo de memoria NPU de aproximadamente 2,95 GB tras la carga y un pico adicional de 0,66-0,80 GB por peticion, es apto para dispositivos sin GPU dedicada.
- Servicio local de alineamiento: el servidor residente con endpoints compatibles con el estilo OpenAI permite integrar el alineador en aplicaciones existentes que ya consumen APIs de audio.
- Evaluacion de calidad de doblaje y locucion: comparar los tiempos alineados con los esperados ayuda a medir desviaciones de ritmo en versiones dobladas.
- Procesamiento por lotes de audios de hasta unos 160 s: con un RTF de pared de 0,017-0,018 en el caso cercano al limite, el coste por minuto de audio es bajo.

## Benchmarks y rendimiento
Rendimiento en placa (AX8860, SDK V0.6.0, NPU de 4 nucleos, modo servidor, extremo a extremo; `bench.sh` con arranque en frio y tres ejecuciones en caliente por nivel):

| Nivel | Audio | Tiempo de pared (s) | Forward torre de texto (s) | RTF de pared | RTF de forward |
|---|---|---:|---:|---:|---:|
| Primera peticion (frio) | 5,00 s | 0,855 | 0,049 | 0,171 | 0,010 |
| 5 s en caliente | 5,00 s | 0,319-0,350 | 0,017-0,028 | 0,064-0,070 | 0,003-0,006 |
| 30 s en caliente | 30,00 s | 0,670-0,734 | 0,103-0,173 | 0,022-0,024 | 0,003-0,006 |
| Cerca del limite, en caliente | 162,84 s | 2,732-3,011 | 0,729-0,992 | 0,017-0,018 | 0,004-0,006 |

Arranque y memoria NPU (misma ejecucion de benchmark):

| Elemento | Valor |
|---|---|
| Carga del servidor en frio | 8,34 s |
| CMM antes de la carga | 288.002.048 B |
| CMM despues de la carga | 2.953.936.896 B |
| Incremento de pico, peticion de 5 s | 657.543.168 B |
| Incremento de pico, peticion de 30 s | 732.315.648 B |
| Incremento de pico, peticion de 162,84 s | 804.016.128 B |
| Salida del servidor tras TERM | 1,2 s |

Precision frente a la implementacion oficial FP32 en CPU (`qwen_asr` ForcedAligner, torch CPU) sobre 22 audios en chino e ingles (643 palabras, 1286 limites):

| Metrica | Resultado |
|---|---|
| Coincidencia de argmax | 1247/1286 = 96,97 % |
| Error absoluto medio por limite | 2,67 ms |
| Mediana | 0 ms |
| p99 | 80 ms |
| Maximo | 240 ms |
| Limites con error <= 80 ms | 99,69 % |
| Limites con error <= 160 ms | 99,84 % |

De los 39 limites discrepantes, 36 difieren en una sola celda de 80 ms, 2 en dos celdas y 1 en tres. Una ejecucion en CPU BF16 con el mismo GGUF presenta 40 discrepancias, 37 identicas a las de la NPU; la NPU tiene 2 exclusivas y la CPU 3, todas de mas o menos una celda, lo que apunta a sensibilidad numerica en clases casi empatadas y no a un sesgo especifico de la NPU.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- Hardware objetivo: SoC Axera AX8860 con NPU de 4 nucleos; SDK V0.6.0 probado en placa.
- Memoria NPU: aproximadamente 2,95 GB tras la carga del modelo, con picos adicionales de 0,66-0,80 GB por peticion segun la duracion del audio.
- Almacenamiento: repositorio de 1,6 GB (pesos GGUF de 1,13 GiB para la torre de texto y 338 MiB para el codificador de audio, mas binarios y kernels).
- GPU: no aplica; el despliegue documentado es sobre NPU, no sobre GPU NVIDIA o AMD. No se proporcionan requisitos de VRAM.
- Cabe en GPU de consumo: no disponible (no se documenta una ruta GPU).
- Opciones de despliegue: `run.sh` (CLI), `llama-server` con endpoints HTTP, y `bench.sh` para medicion sin argumentos; puerto por defecto 18240, con desplazamiento automatico dentro de 18240-18249 o configurable con `FA_BENCH_PORT`.
- Latencia y throughput: RTF de pared de 0,017-0,018 en audios largos y de 0,064-0,070 en audios de 5 s en caliente; el servidor procesa una peticion a la vez (`-np 1`).

## Comparativa con modelos similares
No se dispone de datos de otros modelos en la informacion proporcionada; la comparativa se limita a la referencia de correccion citada por el autor.

| Referencia | Entorno | Coincidencia de argmax | Error absoluto medio | Notas |
|---|---|---:|---:|---|
| Este paquete (NPU AX8860) | GGUF + kernels axmodel, MXFP8/BF16 | 96,97 % | 2,67 ms | 39 discrepancias, 36 de una celda |
| Mismo GGUF en CPU BF16 | llama.cpp CPU | no disponible en porcentaje | no disponible | 40 discrepancias, 37 identicas a la NPU |
| Implementacion oficial FP32 | `qwen_asr` ForcedAligner, torch CPU | referencia | referencia | Base de comparacion |

Comparativa con otros alineadores o modelos de la misma categoria: no disponible.

## Limitaciones y advertencias
- Idiomas: solo chino e ingles estan confirmados con las reglas oficiales de segmentacion; la seccion sobre japones y coreano aparece truncada en la model card, por lo que su soporte no puede confirmarse.
- Requiere una transcripcion de entrada: no es un modelo ASR autonomo; el endpoint de transcripciones usa el mismo alineador cuando se proporciona `transcript`.
- Concurrencia limitada: el servidor se ejecuta con `-np 1`, una peticion a la vez.
- Deriva numerica: la cuantizacion MXFP8 de la torre de texto introduce diferencias de hasta tres celdas (240 ms) en casos de clases casi empatadas; la cabeza de clasificacion es practicamente exacta.
- Dependencia de hardware y SDK: el despliegue esta atado al AX8860 y al SDK V0.6.0; no se documenta compatibilidad con otras plataformas.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Longitud de contexto: no se especifica el maximo exacto; el ejemplo mas largo medido es de 162,84 s de audio.
- Los kernels no contienen pesos y dependen de la conversion en carga desde los GGUF; cualquier modificacion de los pesos requiere regenerar el paquete.

## Enlaces
- Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-ForcedAligner-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
