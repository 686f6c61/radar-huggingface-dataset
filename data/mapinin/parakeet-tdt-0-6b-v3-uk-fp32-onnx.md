# mapinin/parakeet-tdt-0.6b-v3-uk-fp32-onnx

## Resumen

`mapinin/parakeet-tdt-0.6b-v3-uk-fp32-onnx` es la exportación a ONNX en precisión FP32 del modelo de reconocimiento automático del habla (ASR) en ucraniano `ihnatov-yuri/parakeet-tdt-0.6b-v3-uk`, un fine-tuning del modelo NVIDIA Parakeet-TDT 0.6B v3. El repositorio no contiene pesos en formato NeMo ni safetensors, sino los tres grafos ONNX (encoder, decoder y joiner) más el vocabulario, empaquetados específicamente para su despliegue con la librería `sherpa-onnx`.

La relevancia de esta ficha es práctica: convierte un modelo de investigación en NeMo en un artefacto listo para producción en entornos C++/Python sin dependencia del ecosistema PyTorch/NVIDIA NeMo. El modelo base usa una arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer), con aproximadamente 600 millones de parámetros y un vocabulario de 8.192 tokens BPE más el token de blanco.

El modelo resuelve el problema de la transcripción de voz en ucraniano, un idioma con menos recursos que el inglés o el castellano, y lo hace con una licencia permisiva (CC-BY-4.0) que permite uso comercial con atribución. Al ser una exportación de un fine-tuning comunitario, su calidad depende por completo del modelo fuente, y el autor de la exportación no ha realizado una evaluación WER independiente del artefacto ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Token-and-Duration Transducer) |
| Parametros totales | ~600 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; atención completa, la memoria crece con la duración) |
| Tipos de cuantizacion | solo FP32 (el autor indica que INT8 degrada notablemente la calidad) |
| Idiomas soportados | ucraniano (`uk`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.onnx + encoder.weights externos, decoder.onnx, joiner.onnx), tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer TDT sobre un encoder FastConformer. La arquitectura se compone de tres módulos exportados por separado: un encoder de ~2,4 GB de pesos que procesa las características acústicas, una red de predicción (decoder) de ~47 MB y una red conjunta (joiner) de ~25 MB. El vocabulario es de 8.192 tokens BPE con el token `<blk>` en el índice 8.192. La decodificación TDT predice simultáneamente el token y su duración, lo que reduce el número de pasos frente a un transducer clásico.

El proceso de conversión documentado por el autor consistió en restaurar la arquitectura oficial `nvidia/parakeet-tdt-0.6b-v3`, transferir los 723 tensores del checkpoint `model.safetensors` del fine-tuning ucraniano (commit `5c4bcfaca501587beaedfd23b72a678bf7194de1`) con validación estricta de formas y dtypes, y exportar los tres módulos a ONNX FP32 adjuntando los metadatos que requiere `sherpa-onnx` (`vocab_size`, `pred_hidden`, `subsampling_factor`, `feat_dim`, etc.). No se dispone de información sobre el dataset de fine-tuning, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o aumento de datos; esos datos corresponden al modelo fuente y no se detallan en esta exportación.

## Capacidades

- Transcripción de voz a texto en ucraniano a partir de audio de 16 kHz mono.
- Decodificación greedy mediante `sherpa-onnx` con el decodificador TDT.
- Funcionamiento offline (no streaming): el reconocedor procesa el audio completo de una vez.
- Inferencia en CPU y, con la build adecuada de `sherpa-onnx`, en GPU vía `provider="cuda"`.
- Integración en aplicaciones C++, Python, Android, iOS y WebAssembly a través de `sherpa-onnx`.
- No soporta tool calling, agentes, visión ni audio multimodal; es un modelo puramente ASR.

## Casos de uso

- Subtitulado de vídeo en ucraniano: el modelo transcribe segmentos de audio previamente troceados con un VAD (por ejemplo Silero VAD) y genera subtítulos con marcas temporales a nivel de segmento, adecuado por su licencia CC-BY-4.0 para uso comercial.
- Transcripción de reuniones y actas: al ser offline y no requerir conexión, puede desplegarse en servidores propios para procesar grabaciones completas por segmentos, evitando enviar audio sensible a terceros.
- Asistentes de voz en aplicaciones móviles: la exportación ONNX permite empaquetar el modelo en apps Android/iOS mediante `sherpa-onnx`, con inferencia local en CPU y sin dependencia de la nube.
- Atención al cliente en ucraniano: transcripción de llamadas grabadas para análisis de calidad, búsqueda de texto completo y generación de resúmenes posteriores con un LLM.
- Archivado y búsqueda de contenido audiovisual: indexación de archivos de audio históricos en ucraniano para hacerlos consultables por texto, aprovechando que el modelo es offline y no tiene coste por minuto.
- Investigación lingüística y corpus: generación de transcripciones para corpus de habla ucraniana, con la advertencia de que debe validarse la calidad con una muestra anotada manualmente antes de usarlo como referencia.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en contenidos en ucraniano, integrado en reproductores o plataformas web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la exportación indica explícitamente que no ha realizado una evaluación WER separada para este artefacto ONNX y remite a la model card del modelo fuente (`ihnatov-yuri/parakeet-tdt-0.6b-v3-uk`) para las métricas reportadas. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/RAM: al ser FP32, los pesos ocupan ~2,5 GB en disco y en memoria; se recomienda al menos 4 GB de RAM libre para el proceso de inferencia, sin contar el audio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100) usando una build de `sherpa-onnx` con soporte CUDA; el modelo es pequeño y no satura GPUs de gama alta.
- CPU: funciona en CPU con `num_threads` ajustable (el ejemplo del autor usa 4 hilos); un procesador moderno de escritorio o servidor es suficiente para uso interactivo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más de VRAM.
- Opciones de despliegue: `sherpa-onnx` (Python, C++, Android, iOS, WASM). No se proporcionan artefactos GGUF ni integración con vLLM, TGI, llama.cpp u Ollama, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del hardware, del número de hilos y de la duración del audio. La memoria crece con la longitud del audio por el uso de atención completa, por lo que se recomienda segmentar con VAD.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mapinin/parakeet-tdt-0.6b-v3-uk-fp32-onnx | ~600 M | ucraniano | ONNX (FP32) | CC-BY-4.0 | Exportación para sherpa-onnx; sin WER propio publicado |
| ihnatov-yuri/parakeet-tdt-0.6b-v3-uk | ~600 M | ucraniano | NeMo/safetensors | CC-BY-4.0 | Modelo fuente del fine-tuning; requiere NeMo |
| nvidia/parakeet-tdt-0.6b-v3 | ~600 M | multilingüe (incluye ucraniano) | NeMo | CC-BY-4.0 | Modelo base de NVIDIA; arquitectura idéntica |
| Whisper large-v3 (OpenAI) | ~1.550 M | multilingüe | safetensors, GGUF, ONNX | MIT (pesos) | Alternativa generalista; mayor tamaño y contexto de 30 s por ventana |

La comparación con Whisper es la más habitual en producción: Whisper es multilingüe y más grande, mientras que este modelo está especializado en ucraniano y es más ligero. No se dispone de datos de WER comparativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sin evaluación WER propia: el autor no ha medido la calidad de esta exportación ONNX; la precisión real debe validarse con un conjunto de prueba en ucraniano antes de usarla en producción.
- Audio largo: el encoder usa atención completa y la memoria crece con la duración; es obligatorio segmentar con un VAD (por ejemplo Silero VAD) para grabaciones largas.
- Solo ucraniano: no se ha entrenado ni evaluado para otros idiomas; el rendimiento en ruso, surzhyk o code-switching es desconocido.
- Cuantización: el autor advierte que INT8 degrada notablemente la calidad, por lo que no hay una versión cuantizada oficial; esto limita el ahorro de memoria y el despliegue en dispositivos muy restringidos.
- Dependencia de ficheros: `encoder.onnx` referencia `encoder.weights` por ruta relativa; ambos deben mantenerse en el mismo directorio y sin renombrar.
- GPU: `provider="cuda"` requiere una build de `sherpa-onnx` compilada con CUDA; la build estándar solo usa CPU.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a NVIDIA (modelo base), a Yurii Ihnatov (fine-tuning) y al exportador; debe conservarse el `NOTICE.txt` y citar las fuentes.
- Sesgos y alucinaciones: no hay información publicada sobre sesgos acústicos o demográficos; como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados en el fine-tuning.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mapinin/parakeet-tdt-0.6b-v3-uk-fp32-onnx
- Modelo fuente (fine-tuning ucraniano): https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- Commit del modelo fuente utilizado: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk/commit/5c4bcfaca501587beaedfd23b72a678bf7194de1
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
