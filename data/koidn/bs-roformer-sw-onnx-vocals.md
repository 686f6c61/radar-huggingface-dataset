# koidn/bs-roformer-sw-onnx-vocals

## Resumen

BS-RoFormer SW — Vocals (ONNX, 1-stem) es una exportación a ONNX del modelo de separación de fuentes musicales BS-RoFormer SW-Fixed, especializada exclusivamente en la extracción del canal de voces a 44,1 kHz en estéreo. Lo publica el usuario `koidn` en Hugging Face y deriva del checkpoint original de `jarredou` (cuenta eliminada), preservado como duplicado en `enerjazzer/BS-ROFO-SW-Fixed` y convertido a ONNX por `remy-st`.

El modelo no es un pipeline de audio de extremo a extremo, sino un grafo de máscaras: recibe el STFT de un fragmento de 588.800 muestras (13,35 s) y devuelve una máscara compleja que, aplicada sobre el espectrograma original, aísla la voz. Se distribuye en cuatro variantes (fp32 y tres int8) que ocupan entre 58 MB y 211 MB, es decir, entre 3,4 y 12,2 veces menos que la versión de 6 stems, y se ejecuta en CPU con `onnxruntime` sin dependencias de GPU.

Su relevancia práctica es doble: por un lado, ofrece una alternativa ligera para tareas de eliminación de voz (karaoke, remezclas, limpieza de pistas) en entornos sin acelerador; por otro, demuestra que la cuantización int8 dinámica, inviable en el grafo completo de 6 stems por la amplificación del error en la pila de 12 capas, sí es funcional cuando se recorta a un único stem.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (band-split RoFormer) exportado a ONNX; grafo de máscaras, no end-to-end |
| Parametros totales | 51.039.176 (backbone band-split compartido + estimador de máscara de voces) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 588.800 muestras (13,35 s) por chunk, con solape y crossfade para pistas de cualquier duración |
| Tipos de cuantizacion | fp32, int8 weights-only block-32, int8 dinámica, int8 dinámica per-channel |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | unknown (no especificada) |
| Formato de pesos | ONNX (opset 18, ejes estáticos, T=1151) |

## Arquitectura y entrenamiento

El modelo es un BS-RoFormer (band-split RoFormer) con backbone compartido de separación por bandas y un estimador de máscara específico para voces. La exportación recorta del grafo de 6 stems los cinco estimadores restantes (batería, bajo, guitarra, piano, otros), conservando 51.039.176 de los 174.656.500 parámetros del checkpoint original. La entrada es un STFT estéreo empaquetado con `n_fft=2048`, `hop=512`, ventana Hann periódica de 2048 puntos, `center` con reflect-pad de 1024 y sin normalización; la salida es una máscara compleja con el mismo layout de filas.

El procesamiento por chunks usa fragmentos de 588.800 muestras con `num_overlap=2` (paso de 294.400 y crossfade lineal de 58.880 muestras, normalizado por contador), lo que permite procesar pistas de cualquier longitud; el camino de reflect-pad en bordes está verificado hasta 28,98 s (7 chunks). No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; la model card solo documenta la procedencia del checkpoint y el proceso de exportación y cuantización.

La innovación técnica destacable es la viabilidad de la cuantización int8 en un grafo de un solo stem: en el modelo completo, el error de cuantización por tensor se amplifica a través de las 12 capas y degrada los stems casi silenciosos de guitarra y piano (correlación 0,79–0,85 frente al CLI), mientras que al eliminar esas cabeceras el stem de voces se mantiene por encima de 0,999.

## Capacidades

- Separación de la pista de voces a partir de una mezcla musical estéreo a 44,1 kHz.
- Eliminación de voz (vocal removal) mediante resta de la máscara estimada sobre la mezcla original.
- Procesamiento de pistas de duración arbitraria mediante chunking con solape y crossfade.
- Ejecución en CPU con `onnxruntime` + `numpy` + `soundfile`, sin GPU.
- Cuatro variantes con distinto compromiso entre fidelidad y velocidad: fp32 como referencia, int8 weights-only block-32 para máxima fidelidad, int8 dinámica y int8 dinámica per-channel para velocidad.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de audio-to-audio de propósito único.

## Casos de uso

- Karaoke y pistas de acompañamiento: se aplica la máscara de voces sobre la mezcla y se resta para obtener la base instrumental, con la variante int8dyn_pc para procesar lotes grandes en CPU sin acelerador.
- Remezclas y edición musical: extraer la voz limpia para reutilizarla en una nueva producción, usando fp32 o int8wo_b32 cuando se requiere la máxima fidelidad (correlación 0,99995 frente al CLI de referencia).
- Limpieza de grabaciones en directo: separar la voz del público y los instrumentos en grabaciones de conciertos, aprovechando el procesamiento por chunks que admite pistas de cualquier duración.
- Preprocesado para transcripción o análisis: aislar la voz antes de pasarla a un sistema ASR o a un modelo de diarización, reduciendo la interferencia instrumental.
- Producción de contenido para vídeo y podcast: eliminar música de fondo con voz o extraer locuciones de material audiovisual sin acceso a las pistas originales.
- Investigación en separación de fuentes: servir de referencia ligera y reproducible (hashes SHA256 incluidos) para comparar técnicas de cuantización o pipelines de inferencia en CPU.
- Despliegue en entornos con recursos limitados: al ocupar entre 58 y 211 MB y correr solo con `onnxruntime` en CPU, encaja en contenedores pequeños, portátiles o servidores sin GPU.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K), pero sí métricas de calidad frente al CLI de producción q8_0 GGUF (BSRoformer.cpp) sobre un clip de 8,391 s y otro de 28,98 s:

| Variante | 8,391 s (corr / SNR) | 28,98 s (corr / SNR) | Corr. de máscara vs fp32 | Velocidad |
|---|---|---|---|---|
| fp32 | 0,9999542 / 40,4 dB | 0,9999732 / 42,7 dB | referencia | 1,00× |
| int8wo block-32 | 0,9999759 / 43,2 dB | 0,9999892 / 46,7 dB | 0,9998721 | ~1,0× |
| int8dyn | 0,9992897 / 28,1 dB | 0,9994887 / 29,0 dB | 0,9956626 | ~1,24× |
| int8dyn per-channel | 0,9997065 / 32,3 dB | 0,9998275 / 34,4 dB | 0,9982422 | ~1,27× |

Las cuatro variantes superan el umbral de correlación 0,999 frente al CLI en ambas duraciones. La variante int8wo supera a fp32 en correlación porque incorpora exactamente los pesos q8_0 block-32 del CLI, y el export fp32 es bit-parity con el canal de voces del modelo de 6 stems (corr 1,0 − 4e-15, max|d| 1e-5).

Tiempos de forward por chunk en CPU x86 de 14 núcleos (WSL compartido), onnxruntime 1.32, 14 hilos, `enable_cpu_mem_arena=0`, warm 1+3:

| Variante | Forward por chunk (media / mínimo) |
|---|---|
| fp32 | 48,94 s / 47,96 s |
| int8wo block-32 | 49,43 s / 48,74 s (sin mejora: DQ → GEMM f32) |
| int8dyn | 39,35 s / 38,27 s |
| int8dyn per-channel | 38,58 s / 38,18 s |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU con `onnxruntime` y no requiere GPU.
- GPU recomendadas: no disponibles; no se documenta ejecución en GPU.
- Cabe en cualquier equipo consumer: el archivo mayor (fp32) ocupa 211 MB y el menor (int8dyn) 58 MB, por lo que la memoria necesaria es mínima frente a los 0,4 GB del repo completo.
- Despliegue: `onnxruntime` (CPUExecutionProvider) con `numpy` y `soundfile`; también existe un CLI (`bsroformer-split`) distribuido con el paquete `bsroformer_sw_onnx` del repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: en un x86 de 14 núcleos, entre 38,58 s (int8dyn_pc) y 49,43 s (int8wo) por chunk de 13,35 s de audio; es decir, la separación es más lenta que tiempo real en ese hardware y conviene planificar el procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Stems | Formato | Velocidad relativa | Licencia |
|---|---|---|---|---|---|
| koidn/bs-roformer-sw-onnx-vocals (este) | 51.039.176 | 1 (voces) | ONNX | 1,00× (fp32) / ~1,27× (int8dyn_pc) | unknown |
| remy-st/bs-roformer-sw-onnx | 174.656.500 | 6 | ONNX fp32 | referencia del CLI q8_0 | no disponible |
| remy-st/BS-ROFO-SW-Fixed (checkpoint base) | 174.656.500 | 6 | pesos originales | no disponible | no disponible |

La comparación se limita a las variantes del mismo checkpoint, ya que la información proporcionada no incluye otros modelos de separación de fuentes (Demucs, Spleeter, MDX-Net) con datos verificables. Frente al modelo de 6 stems, esta versión es entre 3,4 y 12,2 veces más pequeña, procesa solo voces y es la única en la que la cuantización int8 mantiene la calidad por encima de 0,999.

## Limitaciones y advertencias

- Licencia `unknown`: no se especifican términos de uso, por lo que el uso comercial queda sin garantías legales hasta que el autor o el titular original los aclaren.
- Solo separa voces: no genera los stems de batería, bajo, guitarra, piano u otros; para esos casos hay que usar el modelo de 6 stems.
- No es un pipeline completo: el grafo ONNX solo calcula la máscara; el STFT, el chunking, el zero-DC y el ISTFT los aporta el código de `remy-st/bs-roformer-sw-onnx`, y usarlo directamente exige implementar ese contrato.
- Entrada fija de 588.800 muestras y T=1151 sin ejes dinámicos: cualquier audio debe trocearse según el esquema documentado.
- La variante int8dyn reduce el SNR a 28,1–29,0 dB frente al CLI, suficiente para el umbral de 0,999 pero inferior a fp32 e int8wo en fidelidad.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe porque el modelo no genera texto; el riesgo principal es la aparición de artefactos o filtraciones instrumentales en la voz extraída.
- Rendimiento en CPU por debajo del tiempo real en el hardware de referencia: inadecuado para aplicaciones de baja latencia en directo sin hardware más potente o GPU no documentada.
- Procedencia del checkpoint original ligada a una cuenta eliminada (`jarredou`), lo que dificulta verificar la cadena de custodia y los términos originales.

## Enlaces

- Hugging Face: https://huggingface.co/koidn/bs-roformer-sw-onnx-vocals
- Modelo de 6 stems compañero: https://huggingface.co/remy-st/bs-roformer-sw-onnx
- Checkpoint base: https://huggingface.co/remy-st/BS-ROFO-SW-Fixed
- Duplicado del checkpoint original: https://huggingface.co/enerjazzer/BS-ROFO-SW-Fixed
- Código del pipeline: https://github.com/remy-st/bs-roformer-sw-onnx
- Análisis de cuantización: https://github.com/remy-st/bs-roformer-sw-onnx/blob/main/docs/quantization.md
- ONNX Runtime: https://onnxruntime.ai
