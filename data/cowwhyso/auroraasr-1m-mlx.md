# cowWhySo/AuroraASR-1M-MLX

## Resumen

AuroraASR-1M-MLX es un port nativo a MLX del modelo de reconocimiento automático del habla AuroraASR-1M, desarrollado por AuroraAI-Research y convertido por el usuario cowWhySo para su ejecución sobre Apple Silicon. Se trata de un modelo extremadamente compacto: 949.073 parámetros en FP32 (aproximadamente 3,8 MB de pesos), con una arquitectura Conformer-lite con cabecera CTC y pesos compartidos entre bloques. El repositorio es una conversión, no un fine-tune, por lo que la calidad de reconocimiento es exactamente la del modelo original.

El problema que resuelve es el de la transcripción de audio en inglés en dispositivos locales sin dependencia de PyTorch ni de ONNX Runtime: solo requiere `mlx`, `numpy`, `sentencepiece`, `soundfile` y `soxr`. Su relevancia ahora es la de un ASR de huella mínima que cabe en cualquier equipo Apple Silicon y procesa un clip de 11 segundos en unos 2,0 ms en un M4 Max (solo el modelo acústico), lo que lo hace apto para transcripción por lotes de alta densidad o para integrarse como componente dentro de aplicaciones macOS.

La contrapartida es que se trata de un modelo en inglés, bidireccional y no streaming, sin decodificación incremental, y sin resultados de WER publicados porque el autor no dispone de datos etiquetados para evaluarlo. La fidelidad numérica respecto al original en PyTorch está verificada: error absoluto máximo de 1,5e-4 en logits y coincidencia del 100 % en argmax en todas las longitudes probadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer-lite con cabecera CTC; 4 bloques únicos aplicados dos veces cada uno (pesos compartidos) |
| Parámetros totales | 949.073 (FP32) |
| Parámetros activos | no aplica (no es MoE; hay compartición de pesos entre bloques) |
| Longitud de contexto | no aplica como ventana de texto: acepta audio de cualquier longitud, sin forma fija; salida de `ceil(T/4)` tramas; sin streaming |
| Tipos de cuantización | no disponible (el repo solo distribuye pesos FP32; no se publican variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout MLX (metadatos `format: mlx`), FP32 |
| Entrada | features log-mel de 80 bins, tensor `[B, T, 80]` |
| Salida | logits CTC `[B, ceil(T/4), 257]` (blank + 256 piezas SentencePiece) |
| Librería / runtime | `mlx` + `numpy` + `sentencepiece` + `soundfile` + `soxr` |
| Tamaño del repo | 0,0 GB (según HuggingFace) |
| Modelo base | AuroraAI-Research/AuroraASR-1M, revisión `cd307b54b4d666d6ad7dc982a7a58a96d6e7f942` |
| SHA-256 de `model.safetensors` | `45b91b4b54171270b13b8a8af9bd4ca789ac3e2a37392951b8c868f60346a2d1` |
| SHA-256 de los datos tensoriales | `80ed02b9541f47b56a0122ec5df997acf6d3d54105146518ef760dd12bf5438f` |

## Arquitectura y entrenamiento

La arquitectura es un Conformer-lite con cabecera CTC: cuatro bloques únicos de Conformer que se aplican dos veces cada uno reutilizando los mismos pesos, lo que reduce el recuento de parámetros hasta los 949.073 sin recortar la profundidad efectiva del grafo. La entrada son características log-mel de 80 bins (`[B, T, 80]`) y la salida es una matriz de logits CTC de 257 clases (token blank más 256 piezas SentencePiece), con un factor de submuestreo de 4 en el eje temporal (`ceil(T/4)`). El modelo es bidireccional: la atención mira en ambas direcciones, no hay decodificación incremental ni máscara causal, y por tanto no admite streaming.

No se proporcionan en la información disponible datos sobre el corpus de entrenamiento del modelo original (número de tokens, composición del dataset, ni si hubo RLHF/DPO, algo poco habitual en un modelo CTC). El repositorio es explícitamente una conversión de pesos, no un reentrenamiento: los tensores son los valores FP32 originales, únicamente reordenados para el layout de MLX. La innovación técnica destacable no está en el modelo sino en el port: reproduce los logits de PyTorch con un error máximo de 1,5e-4 y una coincidencia del 100 % en argmax en clips de 0,5 a 11 segundos, e incluye un frontend NumPy propio cuyo error máximo desde la forma de onda es de 0,0134 (media por debajo de 2e-4) manteniendo transcripciones idénticas. El autor documenta además un comportamiento del modelo original: cinco de los 16 canales de `conv1` tienen sesgo positivo, de modo que el relleno de padding deja de ser cero tras la ReLU y una convolución depthwise de stride 2 lee una trama de más, alterando todos los logits por la atención bidireccional; el port lo reproduce por defecto y ofrece `Transcriber(exact_padding=True)` para enmascarar la región de padding.

## Capacidades

- Reconocimiento automático del habla en inglés a partir de audio de cualquier duración, sin forma de entrada fija.
- Transducción de voz a texto con tokenización SentencePiece de 256 piezas más token blank CTC.
- Procesamiento por lotes con padding a la derecha y el enmascaramiento del modelo original (`transcribe_batch`).
- Modo de padding exacto (`exact_padding=True`) que hace que los resultados por lotes coincidan con los de un clip aislado, independientemente de la composición del lote.
- Lectura de cualquier formato de audio que `soundfile` pueda abrir, con mezcla a mono y remuestreo a 16 kHz mediante soxr en calidad HQ.
- Ejecución nativa en Apple Silicon sin ONNX Runtime ni PyTorch.
- No dispone de streaming, decodificación incremental, tool calling, capacidades de agente, visión, audio generation nimodo de razonamiento: es un modelo puramente acústico con cabecera CTC.

## Casos de uso

- **Transcripción por lotes de grabaciones en inglés**: el modelo acepta lotes de clips de distinta duración mediante `transcribe_batch`; con `exact_padding=True` se garantiza que el resultado de cada clip no dependa de con qué otros clips se agrupe, algo crítico en pipelines de transcripción masiva.
- **Dictado y notas de voz en aplicaciones macOS**: al ocupar unos 3,8 MB de pesos y ejecutarse sobre MLX, puede embeberse en una app de escritorio para transcribir notas de voz en local sin enviar audio a la nube.
- **Generación de subtítulos para vídeo en inglés**: el modelo acústico procesa un clip de 11 segundos en 2,0 ms en un M4 Max, de modo que un pipeline que trocee el audio en segmentos y ejecute el modelo por lotes puede subtitular horas de material en tiempos muy reducidos.
- **Pretratamiento en pipelines de análisis de llamadas**: al ser un CTC ligero, sirve como primer paso de transcripción rápida de conversaciones telefónicas en inglés antes de etapas de análisis semántico o de diarización.
- **Prototipado e investigación en ASR de bajo coste**: con 949 K parámetros es un banco de pruebas manejable para estudiar el efecto del padding en arquitecturas convolucionales con atención bidireccional, o para comparar backends (MLX, ONNX Runtime con execution provider MLX, Core ML) sobre los mismos pesos.
- **Comandos de voz y activación por palabra clave**: la latencia de milisegundos permite transcribir fragmentos cortos en el dispositivo para validar comandos en inglés sin salir del equipo.
- **Accesibilidad y subtitulado cuasi en tiempo real**: mediante troceado manual del audio en segmentos y ejecución secuencial, ya que el modelo no soporta streaming nativo.

## Benchmarks y rendimiento

Paridad con PyTorch (torch 2.14.1) sobre recortes de la grabación JFK incluida, comparando logits del modelo original con los del port alimentado con las mismas features:

| Clip | Tramas mel | Error absoluto máximo | Coincidencia argmax | Transcripción |
|---|---:|---:|---:|---|
| 0,5 s | 51 | 2,7e-5 | 100 % | coincide |
| 2,0 s | 201 | 3,0e-5 | 100 % | coincide |
| 3,37 s | 338 | 4,3e-5 | 100 % | coincide |
| 5,5 s | 551 | 2,9e-5 | 100 % | coincide |
| 11 s | 1101 | 1,5e-4 | 100 % | coincide |

Datos adicionales publicados por el autor:

| Métrica | Valor |
|---|---|
| Lote con padding (2 s + 11 s), error máximo en tramas válidas | 1,3e-4 |
| Error máximo de logits partiendo de la forma de onda con frontend NumPy propio | 0,0134 (media < 2e-4), argmax y transcripciones idénticos |
| Error máximo con frontend MLX | 0,0033 |
| Efecto del padding en 16 recortes JFK emparejados con el clip de 11 s | logits desplazados entre 2 y 7 en 12 de 16; transcripción alterada en 6 de 16 (1-2 caracteres); con máscara, 0 de 16 |
| Latencia del modelo acústico, clip de 11 s (1101 tramas mel), M4 Max | ~2,0 ms |
| Configuración de medida | Apple M4 Max, macOS 26.6.2, CPython 3.13.16, mlx 0.32.4, 3 rondas de 60 ejecuciones cronometradas, mediana de medianas |

No se han publicado resultados de benchmarks de calidad (WER) en la información disponible: el autor indica explícitamente que no dispone de datos etiquetados para determinarlo.

## Requisitos de hardware

- **Peso de los pesos**: 949.073 parámetros en FP32 equivalen a unos 3,8 MB; el modelo completo con runtime cabe holgadamente por debajo de 1 GB de memoria, incluso con el frontend y el tokenizador cargados.
- **VRAM estimada**: no aplica en el sentido habitual; en Apple Silicon usa memoria unificada y el consumo es de decenas de MB incluyendo el grafo compilado.
- **GPU recomendadas**: cualquier chip Apple Silicon (M1 o superior) es suficiente. La medición de referencia se hizo en un M4 Max.
- **Compatibilidad con GPU de terceros**: este repositorio no funciona en GPU NVIDIA o AMD, ya que depende de MLX; para esos entornos hay que usar el modelo base en PyTorch o la build de ONNX Runtime.
- **Consumer GPU**: sí, en cualquier Mac con Apple Silicon; es un modelo de juguete en términos de cómputo (menos de un millón de parámetros).
- **Opciones de despliegue**: script propio `aurora_pipeline.Transcriber` (grafo compilado, frontend NumPy) o `bash run_mac.sh` para instalación, tests y transcripción del clip incluido. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. Alternativas del mismo autor: build de ONNX Runtime con execution provider MLX y build de Core ML.
- **Latencia**: ~2,0 ms por clip de 11 s en M4 Max para el modelo acústico, sin contar extracción de features ni tokenización.
- **Throughput**: no disponible; el autor no publica una cifra agregada de clips por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Runtime / formato | Entrada | Licencia | Estado |
|---|---:|---|---|---|---|
| AuroraASR-1M (original) | 949.073 | PyTorch | audio de longitud variable | Apache-2.0 | disponible en AuroraAI-Research |
| AuroraASR-1M-MLX (este) | 949.073 | MLX, safetensors FP32 | audio de longitud variable | Apache-2.0 | disponible |
| AuroraASR-1M-ONNX-MLX-EP | 949.073 | ONNX Runtime + execution provider MLX | audio de longitud variable | Apache-2.0 | disponible; build anterior, movida a repo propio |
| AuroraASR-1M-CoreML | 949.073 | Core ML | audio de longitud variable | Apache-2.0 | disponible |

Los cuatro artefactos comparten exactamente los mismos pesos y, por tanto, la misma calidad de reconocimiento; la diferencia está en el backend de ejecución y en la fidelidad numérica respecto a PyTorch. No se dispone en la información proporcionada de comparaciones con otros modelos ASR (tipo Whisper o similares) en términos de WER.

## Limitaciones y advertencias

- **Solo inglés**: el modelo no soporta castellano ni ningún otro idioma; no debe emplearse en producción multilingüe.
- **No streaming**: la arquitectura es bidireccional y no existe decodificación incremental; para tiempo real hay que trocear manualmente el audio y asumir latencias de segmento.
- **Calidad no medida**: no hay WER publicado ni datos etiquetados; con 949.073 parámetros es razonable esperar una precisión muy inferior a la de modelos ASR grandes, pero no hay cifras que lo cuantifiquen.
- **Sesgo y alucinación**: no se documentan sesgos demográficos, acentos o de dominio; como todo modelo CTC puede emitir texto espurio sobre silencio o ruido, y no hay evaluación disponible al respecto.
- **Sensibilidad al padding**: por defecto el port reproduce un comportamiento del original por el cual la salida de un clip cambia según el padding del lote (afecta a longitudes con `(mel_frames + 1) // 2` impar). En 6 de 16 recortes probados la transcripción cambió. Usar `exact_padding=True` si se procesan lotes heterogéneos.
- **Sin puntuación ni casing garantizados**: no se documenta ningún post-procesado de puntuación, mayúsculas o normalización; la salida es directamente la secuencia de piezas SentencePiece decodificada.
- **No es un modelo `transformers`**: `config.json` solo contiene dimensiones y `AutoModel.from_pretrained` no funcionará; hay que usar `aurora_pipeline.Transcriber`. Esto rompe integraciones estándar de HuggingFace.
- **Dependencia de plataforma**: MLX requiere macOS sobre Apple Silicon; el modelo no se ejecuta en Linux, Windows ni GPU de terceros con este repositorio.
- **Licencia**: Apache-2.0 permite uso comercial, pero exige conservar el aviso de copyright y el fichero NOTICE, y declarar los cambios realizados si se redistribuye.
- **Madurez**: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo día; es un artefacto reciente sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cowWhySo/AuroraASR-1M-MLX
- Modelo base: https://huggingface.co/AuroraAI-Research/AuroraASR-1M
- Build ONNX Runtime + MLX EP: https://huggingface.co/cowWhySo/AuroraASR-1M-ONNX-MLX-EP
- Build Core ML: https://huggingface.co/cowWhySo/AuroraASR-1M-CoreML
- Artículo de AGI Hunt sobre AuroraASR-1M: https://agihunt.info/en/p/1a14f1a9c720fda905c8097b21f
- Informe de benchmarks del autor: `benchmarks/native_mlx_report.json` dentro del repositorio
