# aoiandroid/orukeet

## Resumen

Orukeet es un modelo de reconocimiento automatico del habla (ASR) multilingue de 25 idiomas construido por Oruk AI (con colaboracion de Stanford University, University of Cambridge, OpenWhispr y Hoid) a partir de `nvidia/parakeet-tdt-0.6b-v3`. La innovacion principal consiste en sustituir la mitad de los filtros depthwise temporales del encoder por 12.288 kernels Gabor ajustados y congelados, y reentrenar el resto de parametros sobre datos multilingues y multiacento. El resultado conserva la arquitectura y el tamano del modelo padre: 627 millones de parametros, encoder FastConformer de 24 capas y cabeza token-and-duration transducer (TDT).

El modelo se distribuye tambien en formatos ONNX INT8, GGUF nativo Q8 y F16 nativo, todos derivados del mismo checkpoint de la release r3 (`031c8ddab484`), lo que facilita su despliegue en servidores, workers de transcripcion por lotes y aplicaciones interactivas. Frente a Parakeet, mejora en 61 de 74 splits evaluados, incluyendo LibriSpeech test-clean (1,46 % vs 1,53 % WER), test-other (2,86 % vs 3,14 %) y el conjunto agregado de 25 idiomas de FLEURS (9,85 % vs 11,01 % WER, una reduccion relativa del 10,6 %).

Es relevante ahora porque demuestra que tecnicas de parametrizacion fija (kernels Gabor ajustados sobre las senales de audio) pueden mejorar un modelo ASR multilingue sin aumentar el numero de parametros, y porque publica artefactos verificables (hashes, recetas de entrenamiento y auditoria de exportacion) junto con el checkpoint. El repositorio revisado (`aoiandroid/orukeet`) tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer de 24 capas (encoder) con cabeza token-and-duration transducer (TDT); sustitucion de la mitad de los filtros depthwise temporales por kernels Gabor ajustados |
| Parametros totales | 627.052.166 (dato de safetensors); la model card cita 627.008.134 y 626.897.542 parametros escalares entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; no expone ventana de contexto en tokens) |
| Tipos de cuantizacion | ONNX INT8, GGUF nativo Q8, F16 nativo; evaluacion en FP32 con autocast BF16 en CUDA |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | NeMo (`.nemo`), safetensors, ONNX, GGUF |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 (finetune) |
| Tamano del repositorio | 6,4 GB |
| Biblioteca | nemo (`nemo_toolkit[asr]==3.0.0`) |
| Capacidades declaradas en metadatos | streaming: false; translate: false; lang_detect: true; timestamps: token |
| Fecha de publicacion | 2026-09-15 |

## Arquitectura y entrenamiento

Orukeet mantiene intacta la estructura del modelo padre: encoder FastConformer de 24 capas, transductor token-and-duration y tokenizador de Parakeet TDT 0.6B v3. La diferencia esta en las convoluciones depthwise temporales de cada bloque del encoder: cada bloque contiene 1.024 filtros depthwise de nueve taps. De los 24.576 filtros totales, se ajusta una funcion Gabor de la forma g(t) = A·exp(-(t-μ)²/(2σ²))·cos(2πf(t-μ)+φ) para t = -4,...,4 y se seleccionan globalmente los 12.288 con menor error cuadratico normalizado. La seleccion deja entre 175 y 748 kernels por capa, con un error RMS relativo mediano del 6,32 % y un umbral de corte del 13,30 %. Los 110.592 taps seleccionados quedan congelados; 626.897.542 parametros escalares permanecen entrenables. Las exportaciones nativas materializan los taps ajustados como pesos de convolucion F16 ordinarios.

El proceso de construccion combina recuperacion Gabor mediante perdida de transductor, matching de encoder y destilacion de token y duracion, seguido de 4.035 actualizaciones de bajo learning rate que producen el checkpoint padre. La pasada final r3 aplica 168 actualizaciones AdamW con warmup del 3 % y decaimiento coseno de 5e-6 a 5e-7 sobre tres pasadas por 2.939 grabaciones de LibriSpeech test-other. Los objetivos preservan mayusculas y puntuacion nativas y corrigen palabras de referencia. La misma particion se usa para seleccionar checkpoint, lo que constituye un caveat metodologico relevante (ver limitaciones). Una auditoria de exportacion verifica que los 12.288 kernels ajustados permanecen exactos y que los otros 651 tensores de parametros cambian.

## Capacidades

- Transcripcion de voz a texto multilingue en 25 idiomas europeos (eslavos, balticos, nordicos, romance, germanicos, griego, maltes y ucraniano) mas arabe en la lista de tags, aunque los idiomas declarados en la model card no incluyen arabe.
- Reconocimiento multiacento: mejora en los 20 splits de acento/dominio en ingles evaluados.
- Deteccion de idioma (`lang_detect: true` en la metadata del autor).
- Marcas de tiempo a nivel de token (`timestamps: token`).
- Decodificacion por lotes con NeMo greedy-batch TDT.
- Salida con mayusculas y puntuacion nativas (los objetivos de entrenamiento las preservan).
- Exportacion a ONNX INT8, GGUF Q8 y F16 para inferencia sin NeMo.
- No soporta streaming (`streaming: false`) ni traduccion (`translate: false`).
- No hay evidencia en la informacion disponible de soporte de tool calling, agentes, vision ni audio-vision.

## Casos de uso

- Transcripcion por lotes de archivos de audio: el modelo esta pensado explicitamente para batch transcription y workers de servidor; con el checkpoint NeMo y `greedy-batch TDT` se pueden procesar colas de grabaciones en GPU con throughput alto para un modelo de 0,6 B de parametros.
- Subtitulado y generacion de marcas de tiempo: la metadata declara timestamps a nivel de token, lo que permite alinear texto transcrito con el audio para generar subtitulos o indices de busqueda sobre contenido audiovisual.
- Busqueda y analitica sobre archivos de reunion: transcripcion de reuniones en entornos corporativos multilingues (por ejemplo, equipos con aleman, polaco y espanol) para alimentar motores de busqueda o resumenes posteriores.
- Enrutado automatico por idioma en centralitas y contact centers: gracias a `lang_detect: true` y a la cobertura de 25 idiomas, se puede clasificar el idioma de la llamada y dirigirla al agente o al modelo de posprocesado adecuado.
- Despliegue en el borde o en CPU con sherpa-onnx: las exportaciones ONNX INT8 y GGUF Q8 permiten ejecutar la transcripcion en maquinas sin GPU, por ejemplo en aplicaciones de escritorio de dictado o en dispositivos con recursos limitados.
- Evaluacion comparativa de tecnicas de parametrizacion fija: el modelo incluye recetas de ajuste y congelacion de kernels Gabor y scripts de linaje de entrenamiento, por lo que sirve como caso reproducible para investigar parametrizaciones estructuradas en ASR.
- Aplicaciones interactivas de dictado con latencia baja: al ser un modelo de 0,6 B con variantes cuantizadas a INT8 y Q8, es viable mantenerlo residente en memoria en una GPU de consumo o incluso en CPU para dictado de un solo hablante, siempre que no se requiera streaming (el modelo declara `streaming: false`).

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. La evaluacion compara ambos modelos decodificando las mismas grabaciones con NeMo greedy-batch TDT, pesos FP32 y autocast BF16 en CUDA. Menor es mejor.

| Comparativa | Grabaciones | WER Parakeet | WER Orukeet |
|---|---:|---:|---:|
| LibriSpeech test-clean | 2.620 | 1,53 % | 1,46 % |
| LibriSpeech test-other | 2.939 | 3,14 % | 2,86 % |
| FLEURS ingles | 647 | 4,28 % | 3,82 % |
| FLEURS agregado, 25 idiomas | 20.146 | 11,01 % | 9,85 % |
| Acentos/dominios agregado, 47 splits | 12.006 | 16,72 % | 15,25 % |
| Acentos/dominios en ingles, 20 splits | 5.120 | 9,51 % | 8,84 % |

Segun la model card, Orukeet mejora en 25 de 27 splits completos de LibriSpeech/FLEURS y en 36 de 47 splits de acento/dominio, incluidos los 20 splits de acento/dominio en ingles. No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo, MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB en FP32 (627 M de parametros), 1,25 GB en BF16/F16 y en torno a 0,7 GB en INT8/Q8, sin contar el overhead del runtime ni los buffers de audio.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para FP32/BF16 (RTX 3060, RTX 4060, RTX 4090) y A100/H100 para despliegues de alto throughput con decodificacion por lotes. No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, en la practica totalidad de las GPU de consumo modernas, incluso en las variantes cuantizadas mas pequenas. Tambien es viable en CPU con las exportaciones ONNX INT8 o GGUF Q8.
- Opciones de despliegue: NeMo (`nemo_toolkit[asr]==3.0.0`, requiere entorno PyTorch con CUDA), ONNX Runtime, sherpa-onnx (indicado en los tags), y las herramientas asociadas a transcribe_cpp para GGUF. No se menciona soporte explicito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orukeet | 627 M | FastConformer + TDT, filtros Gabor ajustados | 25 | cc-by-sa-4.0 | HuggingFace (`aoiandroid/orukeet`), NeMo, ONNX, GGUF |
| NVIDIA Parakeet TDT 0.6B v3 | ~627 M (modelo padre) | FastConformer + TDT | 25 | no disponible en la informacion proporcionada | HuggingFace (referencia) |
| OpenAI Whisper large-v3 | ~1,55 B | Encoder-decoder transformer | multilingue (99 idiomas) | MIT | HuggingFace, multiples runtimes |
| OpenAI Whisper medium | ~769 M | Encoder-decoder transformer | multilingue | MIT | HuggingFace, multiples runtimes |

Los WER comparativos frente a Whisper no estan disponibles en la informacion proporcionada; la unica comparacion publicada por el autor es contra Parakeet TDT 0.6B v3. Los datos de parametros de los modelos Whisper son de conocimiento general y no proceden de la informacion de la busqueda.

## Limitaciones y advertencias

- Seleccion de checkpoint sobre LibriSpeech test-other, que es tambien uno de los conjuntos de evaluacion reportados: la mejora de 2,86 % frente a 3,14 % en ese split debe interpretarse con cautela por posible sobreajuste a esa particion.
- Discrepancia en el numero de parametros entre el dato de safetensors (627.052.166) y las cifras de la model card (627.008.134 / 626.897.542 escalares entrenables); conviene verificar el checkpoint concreto antes de citar la cifra.
- Licencia cc-by-sa-4.0: permite uso comercial, pero impone atribucion y obligacion de compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que distribuyan el modelo o derivados.
- Cobertura limitada a 25 idiomas; no hay evidencia de rendimiento fuera de ese conjunto, y el arabe aparece en los tags pero no en la lista de idiomas declarada.
- No soporta streaming (`streaming: false`), lo que descarta casos de uso de transcripcion en tiempo real con latencia minima.
- No ofrece traduccion (`translate: false`): solo transcribe en el idioma detectado.
- El modelo base Parakeet TDT 0.6B v3 puede arrastrar sesgos de sus datos de entrenamiento en cuanto a acentos, variedades dialectales y dominio (audio limpio de lectura frente a audio espontaneo o con ruido), y Orukeet no documenta una evaluacion de sesgos.
- Riesgo de alucinacion y de errores en audio con ruido, solapamiento de hablantes o dominios alejados del entrenamiento, comun a los sistemas ASR de este tamano.
- El ajuste final usa objetivos que preservan mayusculas y puntuacion y corrigen palabras de referencia, lo que puede introducir un sesgo hacia el estilo de LibriSpeech.
- Adopcion practica nula en el momento de redactar la ficha: 0 descargas y 0 likes, sin evidencia de uso en produccion por terceros.
- El repositorio revisado (`aoiandroid/orukeet`) puede ser una replicacion no oficial: la model card del autor referencia el repositorio `oruk/orukeet` y un ID de revision distinto (`555136b50265a132d4cea0d35560c26fc4f657ab`).

## Enlaces

- HuggingFace (repositorio revisado): https://huggingface.co/aoiandroid/orukeet
- HuggingFace (referencia del autor en la model card): https://huggingface.co/oruk/orukeet
- Codigo: https://github.com/Oruk-AI/orukeet
- Pull request en OpenWhispr: https://github.com/OpenWhispr/openwhispr/pull/2085
- Informe tecnico: orukeet-technical-report.pdf (referenciado en la model card)
- Hashes de artefactos: ARTIFACTS.json (referenciado en la model card)
- Receta de ajuste y congelacion: https://github.com/Oruk-AI/orukeet/blob/main/training/gabor_half/README.md
- Adaptacion final: https://github.com/Oruk-AI/orukeet/blob/main/training/librispeech_ft/README.md
- Linaje de entrenamiento: https://github.com/Oruk-AI/orukeet/blob/main/training/README.md
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Referencia arXiv declarada en los tags: arXiv:2609.10054 (no verificada en la busqueda web)
- Los resultados de busqueda web disponibles no aportan informacion relevante sobre el modelo (contenido no relacionado sobre pronunciacion de simbolos).
