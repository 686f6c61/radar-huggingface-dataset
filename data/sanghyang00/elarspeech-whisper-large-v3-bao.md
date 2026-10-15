# Sanghyang00/ELARSpeech-Whisper-Large-v3-bao

## Resumen

ELARSpeech-Whisper-Large-v3-bao es un modelo de reconocimiento automático del habla (ASR) monolingüe desarrollado por el usuario Sanghyang00 dentro del proyecto ELARSpeech, especializado en waimaha (código ISO 639-3 `bao`), una lengua indígena de la familia tucanoana hablada en Colombia y Brasil. Se trata de un ajuste fino (*fine-tune*) del modelo base `openai/whisper-large-v3`, por lo que hereda su arquitectura encoder-decoder de tipo transformer y sus 1.543.491.840 parámetros (aproximadamente 1,54 mil millones).

El modelo resuelve un problema muy concreto: las lenguas de bajos recursos no están cubiertas por Whisper large-v3, cuyo entrenamiento se limita a 99 idiomas mayoritarios. Este ajuste proporciona transcripción directa de audio waimaha a texto mediante la inyección de un token de idioma específico (`<|bao|>`) en el prompt del decodificador, en lugar de usar el parámetro `language=` estándar. Esto lo hace relevante para proyectos de documentación lingüística, revitalización cultural y archivado de grabaciones de campo.

El repositorio es de tamaño reducido (6,2 GB) y usa exclusivamente pesos en formato safetensors dentro de la librería `transformers`. No declara licencia propia y, en el momento de la consulta, acumula 3 descargas y 0 valoraciones, por lo que se trata de un artefacto reciente y con escasa validación externa más allá de la comprobación de transcripción exacta declarada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parámetros totales | 1.543.491.840 (≈1,54 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como dato explícito; el modelo base Whisper large-v3 procesa ventanas de audio de 30 s (1500 fotogramas mel) y decodifica hasta 448 tokens objetivo |
| Tipos de cuantización | no disponible en el repositorio (solo safetensors en fp32/fp16); al derivar de Whisper es convertible a GGUF, CTranslate2 y otras representaciones de menor precisión |
| Idiomas soportados | waimaha (ISO 639-3: `bao`), monolingüe |
| Licencia | no disponible (el modelo base `openai/whisper-large-v3` sí declara licencia MIT) |
| Formato de pesos | safetensors |
| Librería | transformers |
| Modelo base | openai/whisper-large-v3 |
| Formato de entrada | audio mono a 16 kHz |
| Repositorio | 6,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder con preprocesado de audio basado en espectrogramas mel de 128 canales. Según la estructura del modelo base, el encoder y el decoder constan de 32 capas cada uno con `d_model = 1280` y 20 cabezas de atención; el modelo se ajustó partiendo de los pesos preentrenados de OpenAI, de modo que no se ha entrenado desde cero. El uso descrito en la model card es puramente inferencial: se cargan `WhisperProcessor` y `WhisperForConditionalGeneration` desde el repositorio y se genera con un prompt explícito del decodificador compuesto por el token de inicio, el token de idioma `<|bao|>`, el token `<|transcribe|>` y `<|notimestamps|>`, con `num_beams=1` y `max_new_tokens=200`.

No se especifican en la información disponible el número de horas de audio utilizadas, la composición del corpus de ajuste, la proporción de hablantes, el uso de técnicas como LoRA o ajuste completo, ni si hubo etapas de RLHF o DPO. Tampoco se documenta el régimen de entrenamiento (learning rate, épocas, política de aumento de datos). Lo único verificable es la comprobación de calidad declarada por el autor: el artefacto exportado se contrastó contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluación, con resultado de verificación de transcripción exacta **PASS**. El ajuste fino parece centrado exclusivamente en la adaptación lingüística, sin modificaciones arquitectónicas ni mecanismos añadidos de decodificación especulativa.

## Capacidades

- Transcripción de voz a texto en waimaha (`bao`) a partir de audio mono a 16 kHz.
- Decodificación guiada por prompt con token de idioma específico (`<|bao|>`), lo que fuerza una única lengua de salida.
- Generación sin marcas de tiempo (`<|notimestamps|>`) según el ejemplo oficial de uso.
- Compatibilidad con la API estándar de `transformers` (`WhisperProcessor` + `WhisperForConditionalGeneration`) y con flujos de inferencia por lotes.
- Compatible con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe: el modelo es monolingüe por diseño.
- No dispone de modo *thinking*, visión, audio generativo ni salida multimodal más allá de la transcripción.
- No se documenta salida con marcas de tiempo ni diarización de hablantes.

## Casos de uso

- Documentación y revitalización lingüística: transcripción sistemática de entrevistas con hablantes nativos de waimaha para construir corpus digitales anotados, un recurso escaso dado el reducido número de hablantes.
- Archivado etnográfico de campo: conversión a texto de grabaciones recogidas en comunidades, con la ventaja de que el modelo es ligero (1,54 B) y puede ejecutarse en un portátil sin GPU dedicada mediante conversiones a formato GGUF o CTranslate2.
- Subtitulado de material audiovisual comunitario: generación de pistas de subtítulos en waimaha para vídeos educativos, radios comunitarias o producciones culturales, partiendo del texto plano producido por el modelo.
- Investigación lingüística descriptiva: base para el análisis morfológico y fonológico del waimaha, permitiendo buscar patrones sobre transcripciones que antes exigían transcripción manual por parte de especialistas.
- Educación intercultural bilingüe: elaboración de materiales didácticos en los que se transforma audio de clase o de cuentos tradicionales en texto reutilizable en fichas y libros.
- Servicios de transcripción para administraciones y ONG que trabajan con población waimaha: digitalización de declaraciones, actas o testimonios con formato homogéneo de salida.
- Desarrollo de aplicaciones ASR de nicho sobre `transformers`: al ser un modelo de pipeline `automatic-speech-recognition`, se integra directamente en servicios de inferencia que ya consumen modelos Whisper, sin cambios de código más allá del prompt de idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de WER (word error rate), CER, ni comparaciones cuantitativas con otros sistemas sobre waimaha. El único dato de evaluación aportado es la verificación de que el artefacto exportado reproduce exactamente las transcripciones del checkpoint original de ELARSpeech sobre un conjunto fijo de muestras, con estado **PASS**, pero se desconoce el tamaño y la composición de dicho conjunto.

| Benchmark | Resultado |
|---|---|
| WER en waimaha | no disponible |
| CER en waimaha | no disponible |
| Verificación de transcripción exacta frente al checkpoint original | PASS (conjunto de evaluación no especificado) |
| Comparativas con otros sistemas ASR | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 6,2 GB; en fp16/bf16 unos 3,1 GB; en int8 en torno a 1,6 GB; en int4 alrededor de 0,8 GB. A estas cifras hay que sumar el consumo de activaciones del encoder, que crece de forma cuadrática con los 1500 fotogramas de la ventana de 30 segundos.
- Configuración práctica recomendada: entre 4 y 8 GB de VRAM en fp16 para inferencia con lote 1, lo que deja margen suficiente en GPUs de gama media.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090); en centro de datos, A100, H100 o L40S, aunque están sobredimensionadas para un modelo de 1,54 B.
- Cabe en GPU de consumo: sí, en fp16 e inferiores entra en tarjetas de 8 GB, e incluso en configuraciones de 6 GB si se cuantiza a int8. También es viable en Apple Silicon mediante MPS y en CPU con formatos cuantizados.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; `faster-whisper` / CTranslate2 previa conversión; `whisper.cpp` previa conversión a GGUF; servidores de inferencia compatibles con Whisper como vLLM o Text Generation Inference. Ollama no está orientado a tareas ASR, por lo que no es una vía directa.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de factor de tiempo real para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-bao | 1,54 B | waimaha (`bao`) | ventanas de audio de 30 s (base) | no declarada | Hugging Face, 3 descargas |
| openai/whisper-large-v3 | 1,55 B | 99 idiomas, sin waimaha | ventanas de audio de 30 s | MIT | ampliamente disponible |
| whisper-large-v3 ajustado con LoRA a una lengua de bajos recursos | ≈1,55 B | lengua objetivo | ventanas de audio de 30 s | variable según autor | múltiples repositorios comunitarios |
| facebook/mms-1b-all (Massively Multilingual Speech) | ≈1 B | más de 1000 idiomas (cobertura de lenguas de bajos recursos) | ventanas cortas de audio | CC-BY-NC 4.0 según su ficha | Hugging Face |
| Modelos wav2vec2 / XLS-R ajustados por lengua | 0,3 B a 2 B | lengua objetivo | audio continuo, sin ventana de 30 s | variable, frecuentemente Apache 2.0 en XLS-R | Hugging Face |

La ventaja principal de este modelo frente a alternativas genéricas es que ninguna de las versiones estándar de Whisper cubre el waimaha. Frente a MMS, que sí aborda lenguas de muy bajos recursos, la diferencia clave está en la licencia declarada y en el soporte nativo dentro del ecosistema `transformers`/Whisper, aunque MMS ofrece una cobertura lingüística mucho mayor. Los detalles de entrenamiento de este ajuste no permiten una comparación cuantitativa de precisión.

## Limitaciones y advertencias

- Modelo monolingüe: no traduce ni transcribe otros idiomas; forzar el token `<|bao|>` con audio en otra lengua producirá salidas degradadas o alucinadas.
- Sin métricas publicadas: no hay cifras de WER ni de CER, por lo que no es posible estimar la calidad real frente a una transcripción humana.
- Sesgos previsibles: al ser una lengua con un número reducido de hablantes, el modelo probablemente esté sesgado hacia los hablantes, variedades dialectales y condiciones de grabación presentes en el corpus de ajuste. No se ha documentado la composición demográfica de dicho corpus.
- Ortografía no normalizada: la variabilidad en la escritura del waimaha entre comunidades puede traducirse en inconsistencias en la salida.
- Riesgo de alucinación: los modelos basados en Whisper tienden a generar texto plausible en fragmentos de silencio, ruido o música, especialmente con `num_beams=1`. Se recomienda aplicar detección de voz y revisión humana.
- Restricciones de licencia: el repositorio no declara licencia propia. Aunque el modelo base es MIT, la ausencia de licencia explícita en este artefacto deja en el aire las condiciones de uso comercial y de redistribución. Conviene contactar con el autor antes de integrarlo en producción.
- Requisitos de entrada estrictos: audio mono a 16 kHz; no se documenta el comportamiento con otras frecuencias de muestreo o canales múltiples.
- Sin marcas de tiempo: el prompt de referencia usa `<|notimestamps|>`, por lo que no se garantiza la alineación temporal necesaria para subtitulado preciso.
- Validación externa mínima: con 3 descargas y 0 valoraciones, el modelo apenas ha sido probado por terceros.
- Dependencia no documentada: el autor remite a la documentación del proyecto ELARSpeech para los términos del conjunto de datos, pero no se proporciona la URL de dicha documentación en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-bao
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- La búsqueda web realizada no devolvió resultados relevantes sobre ELARSpeech, el waimaha ni este modelo; los resultados obtenidos trataban sobre universidades francesas y no guardan relación con la ficha. No se dispone, por tanto, de enlaces adicionales a papers, blogs, repositorios o demos verificables.
