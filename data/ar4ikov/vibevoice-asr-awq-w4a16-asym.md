# Ar4ikov/VibeVoice-ASR-AWQ-W4A16-ASYM

## Resumen

VibeVoice-ASR AWQ W4A16 ASYM es un checkpoint de reconocimiento automático del habla (ASR) publicado por el usuario Ar4ikov, derivado por cuantización del modelo microsoft/VibeVoice-ASR (revisión `d0c9efdb8d614685062c04425d91e01b6f37d944`). No es un modelo entrenado desde cero: es una compresión con cuantización activación-consciente (AWQ) de los pesos originales en BF16, generada con llm-compressor y repaquetada después como GEMM AWQ estándar sin una segunda pasada de cuantización.

El checkpoint contiene 8.330.325.888 parámetros totales y reduce el almacenamiento de pesos de 17,348 GB a 7,000 GB (2,48× menos), manteniendo en BF16 los embeddings, la LM head, los codificadores y conectores de voz, las normas y los sesgos. Se cuantizan a INT4 asimétrico (W4A16, group size 128) las 196 proyecciones de atención y MLP del decodificador Qwen2. El decodificador acústico del tokenizer original (`model.acoustic_tokenizer.decoder.*`) se ha eliminado, por lo que se trata de un checkpoint exclusivamente ASR: no permite síntesis ni decodificación de códec de audio.

Su relevancia práctica es que acerca un modelo ASR con marcas de tiempo y diarización a hardware de consumo: 7 GB de pesos permiten desplegarlo en GPU de 24 GB, y la cuantización se calibró con audio real (embedding de habla) además de texto. La contrapartida es que la validación publicada es muy limitada: una prueba de humo sobre nueve enunciados de LibriSpeech en inglés, sin mediciones de multilingüismo, diarización ni formato largo tras la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con decodificador Qwen2 (196 proyecciones de atención/MLP cuantificadas) más codificadores de voz y conectores; decodificador acústico del tokenizer eliminado |
| Parámetros totales | 8.330.325.888 (8,33 mil millones, dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 asimétrico AWQ W4A16, group size 128, activaciones de 16 bits, escalas de grupo en FP16; embeddings, LM head, codificadores/conectores de voz, normas y sesgos en BF16 |
| Idiomas soportados | no disponible (la model card no documenta cobertura multilingüe ni se ha medido tras la cuantización) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors, repaquetados como AWQ GEMM estándar (`qweight`, `qzeros`, `scales`) |
| Modelo base | microsoft/VibeVoice-ASR, revisión `d0c9efdb8d614685062c04425d91e01b6f37d944` |
| Tamaño del repositorio | 7,0 GB |
| Pipeline | automatic-speech-recognition (speech-to-text, diarization) |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo base VibeVoice-ASR combina un decodificador tipo Qwen2 con componentes específicos de audio: codificadores de habla, conectores y un tokenizer acústico con decodificador. En este checkpoint solo se cuantizan las 196 proyecciones de atención y MLP del decodificador; el resto de componentes de voz se conservan en BF16 precisamente para proteger la calidad de transcripción. El decodificador acústico (`model.acoustic_tokenizer.decoder.*`) se podó, lo que ahorra 687,4 MB y confirma que la ruta de síntesis de audio no está disponible.

El proceso de cuantización sí está documentado con detalle. Se usó una búsqueda real de escalas AWQ con llm-compressor (no RTN ni conversión de un checkpoint ya cuantizado), con 40 puntos de rejilla y `duo_scaling="both"`, semilla 42. La calibración empleó 256 ejemplos de hasta 2048 tokens: 64 enunciados reales de LibriSpeech (con embeddings de habla y continuaciones de transcripción estructurada) más 192 conversaciones de Ultrachat (`HuggingFaceH4/ultrachat_200k`, `train_sft`, barajado con semilla 42). El decodificador Qwen2 se calibró a través de `inputs_embeds`, de modo que se incluyen embeddings de habla reales. Cada código entero y cada escala se preservan exactamente en el repaquetado a AWQ GEMM, sin una segunda cuantización. El entorno de cuantización usó dos NVIDIA RTX 3090 de 24 GB, torch 2.6.0+cu124 y transformers 4.51.3.

## Capacidades

- Transcripción de audio a texto en formato JSON estructurado, con las claves Start time, End time, Speaker ID y Content.
- Marcas de tiempo por segmento y atribución de hablante (diarización) en la propia salida del modelo, sin postproceso externo documentado.
- Procesamiento de audio acompañado de prompt de sistema y de usuario, con marcadores de posición de audio sustituidos por embeddings de habla.
- Reconocimiento de habla en inglés verificado mediante prueba de humo; el comportamiento en otros idiomas no está documentado.
- Inferencia con pesos INT4 en el runtime nativo `vibevoice.c` (comando `vv_cli`) y posibilidad de ejecución en PyTorch descomprimiendo a BF16.
- No dispone de síntesis de voz ni decodificación de códec: el decodificador acústico fue eliminado.
- No hay información publicada sobre tool calling, function calling, uso agéntico, razonamiento multi-paso, visión ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones con diarización: el modelo devuelve Speaker ID junto a marcas de inicio y fin, de modo que una única pasada genera un acta segmentada por interviniente sin necesidad de un modelo de diarización separado.
- Generación de subtítulos y subtitulado para accesibilidad: la salida JSON con tiempos permite convertir directamente a SRT/VTT; el checkpoint de 7 GB puede ejecutarse en una GPU de 24 GB en local, lo que evita enviar audio sensible a la nube.
- Análisis de llamadas de atención al cliente: la separación agente/cliente por Speaker ID facilita métricas de tiempo de habla, turnos y localización de incidencias en la transcripción.
- Indexación y búsqueda en archivos de audio: transcribir una videoteca o un archivo de pódcast a JSON con tiempos permite construir un índice de búsqueda por contenido y saltar al minuto exacto de la mención.
- Documentación clínica o de entrevistas: la estructura de la salida reduce el postproceso necesario para integrar la transcripción en formularios o bases de datos con campos de tiempo y hablante.
- Auditoría y cumplimiento normativo: transcripción local de grabaciones con licencia MIT, sin dependencia de API externa, adecuada para pipelines que exigen que el audio no salga de la infraestructura propia.
- Prototipado de ASR en hardware de consumo: con 7 GB de pesos es viable desplegar el modelo en una estación de trabajo con una RTX 3090 o 4090 para pruebas de concepto y evaluación interna antes de escalar.
- Investigación en cuantización: el repositorio incluye `recipe.yaml`, scripts de reproducción y verificación, por lo que sirve como caso de estudio reproducible de AWQ asimétrico sobre una arquitectura multimodal con componentes acústicos.

## Benchmarks y rendimiento

La única evaluación publicada es una prueba de humo en inglés sobre nueve enunciados retenidos de LibriSpeech (entradas 64-72, 135 palabras de referencia), excluidos de la calibración. No es un benchmark representativo.

| Ruta de evaluación | Errores de palabra | WER |
|---|---:|---:|
| Decodificador BF16 original + embeddings de habla deterministas, PyTorch | 16 | 11,85 % |
| Ficheros AWQ finales descomprimidos a BF16 para generación en PyTorch | 14 | 10,37 % |
| Ficheros AWQ finales, runtime nativo INT4 `vibevoice.c`, audio a JSON | 14 | 10,37 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes de ASR como LibriSpeech completo, Common Voice o FLEURS) en la información disponible. La precisión multilingüe, las marcas de tiempo en formato largo y la calidad de diarización tras la cuantización no se han medido de forma exhaustiva. La verificación en PyTorch descomprime los pesos a BF16, por lo que no mide el ahorro real de VRAM del INT4 nativo.

## Requisitos de hardware

- Peso de los ficheros cuantizados: 7,0 GB en safetensors (tamaño decimal, incluyendo todos los componentes de voz conservados y el modelo de lenguaje).
- Peso del checkpoint original en BF16: 17,348 GB, como referencia comparativa.
- VRAM estimada para inferencia: no publicada. La prueba de humo en PyTorch se ejecutó descomprimiendo a BF16, así que no cuantifica el consumo real en INT4 nativo.
- GPU recomendadas: los únicos hardware documentados son dos NVIDIA RTX 3090 de 24 GB usadas para el proceso de cuantización. Con 7 GB de pesos, es previsible que la inferencia en INT4 nativo quepa en una GPU de consumo de 24 GB (RTX 3090, RTX 4090), aunque no hay mediciones publicadas que lo confirmen.
- ¿Cabe en GPU de consumo? Previsiblemente sí en tarjetas de 24 GB; no se dispone de datos para tarjetas de 8, 12 o 16 GB.
- Opciones de despliegue: runtime nativo `vibevoice.c` con `vv_cli` (probado por el autor). El repaquetado a GEMM AWQ estándar está pensado para integraciones compatibles con VibeVoice y vLLM, pero el despliegue en vLLM no se probó en esta publicación. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Compatibilidad: la arquitectura personalizada no funciona con `AutoModelForCausalLM` sin una integración específica de VibeVoice; además, las integraciones deben tolerar la ausencia de los pesos podados del decodificador acústico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño de pesos | Formato/cuantización | Licencia | WER (prueba de humo, 9 enunciados) |
|---|---|---|---|---|---|
| Ar4ikov/VibeVoice-ASR-AWQ-W4A16-ASYM | 8,33 mil millones | 7,0 GB | INT4 asimétrico AWQ W4A16 + componentes en BF16 | MIT | 10,37 % |
| microsoft/VibeVoice-ASR (base) | no disponible | 17,348 GB | BF16 | MIT (según el modelo derivado) | 11,85 % |
| Otros modelos ASR comparables (Whisper, Parakeet, Canary, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no proporciona comparaciones con alternativas de la misma categoría. Los dos únicos puntos de comparación con datos son este checkpoint cuantizado y su modelo base. La diferencia de WER entre ambos (14 frente a 16 errores sobre 135 palabras) es demasiado pequeña y está demasiado sesgada por el tamaño de la muestra como para interpretarse como una mejora de calidad.

## Limitaciones y advertencias

- La validación es una prueba de humo con nueve enunciados y 135 palabras de referencia; el propio autor indica que no es un benchmark representativo.
- No se ha medido la degradación tras la cuantización en multilingüismo, marcas de tiempo de audio largo ni calidad de diarización.
- El decodificador acústico fue eliminado: no hay síntesis de audio ni decodificación de códec, y las integraciones deben tolerar esos pesos ausentes.
- No funciona con `AutoModelForCausalLM` estándar; requiere la integración de VibeVoice o el runtime `vibevoice.c`.
- El despliegue en vLLM no se probó para esta release, pese a que el formato AWQ GEMM esté pensado para ser compatible.
- Riesgo de alucinación inherente a los modelos de ASR generativos, especialmente con audio ruidoso, solapamiento de hablantes o dominios no vistos; no se documentan tasas de inserción de contenido inexistente.
- Sesgos del modelo base (acentos, variedades dialectales, género de la voz) no documentados en esta model card.
- Licencia MIT, heredada del modelo base, sin restricciones de uso comercial indicadas. El repositorio no incluye ficheros de calibración de audio ni credenciales de HuggingFace.
- Adopción prácticamente nula (0 descargas, 1 like en el momento de los datos), por lo que no existe validación independiente de la comunidad.
- El prompt canónico exige un formato muy concreto (marcadores de audio repetidos `ceil(audio_samples/3200)` veces y ausencia de prompt de generación de asistente); desviarse de él puede degradar la salida.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/Ar4ikov/VibeVoice-ASR-AWQ-W4A16-ASYM
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR
- Ficheros incluidos en el repositorio: `recipe.yaml` (receta de compresión), directorio `reproduce/` (scripts de preparación, cuantización, repaquetado AWQ y verificación), `evaluation.json`, `compression_report.json`, `quantization_environment.json`
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos correspondían a páginas de ayuda de Windows y no guardan relación con el contenido de esta ficha. No se dispone de paper, blog, repositorio adicional ni demo públicos distintos de los enlaces anteriores.
