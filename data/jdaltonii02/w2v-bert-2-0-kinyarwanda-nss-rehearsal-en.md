# jdaltonII02/w2v-bert-2.0-kinyarwanda-nss-rehearsal-en

## Resumen

El modelo `jdaltonII02/w2v-bert-2.0-kinyarwanda-nss-rehearsal-en` es un ajuste fino (fine-tuning) del modelo `badrex/w2v-bert-2.0-kinyarwanda-asr`, que a su vez deriva de la arquitectura Wav2Vec2-BERT de Meta. Está especializado en reconocimiento automático del habla (ASR) para kinyarwanda, con un enfoque particular en habla no estándar (non-standard speech, NSS), incluyendo disfluencias como la tartamudez. El autor es jdaltonII02 y el modelo se enmarca en la iniciativa "asr-sprint-rwanda-2026".

La relevancia de este modelo radica en su orientación a un dominio poco cubierto: el habla atípica o no estándar en una lengua de bajos recursos como el kinyarwanda. La mayoría de los sistemas ASR están entrenados con habla canónica y fallan ante tartamudeos, pausas anómalas o pronunciaciones atípicas. Este ajuste busca mitigar esa brecha combinando datasets de habla no estándar en kinyarwanda e inglés con un corpus de habla estándar de gran volumen.

El modelo tiene 580.525.920 parámetros (unos 580 M), un tamaño de repositorio de 2,4 GB y pesos en formato safetensors. El acceso está restringido (gated): requiere aceptar las condiciones en Hugging Face. La licencia es `cdli-non-standard-speech-terms`, una licencia personalizada que condiciona el uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (transformer convolucional + atención, encoder de audio) |
| Parametros totales | 580.525.920 (~580 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada en frames de audio, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | kinyarwanda (rw), inglés (en) |
| Licencia | cdli-non-standard-speech-terms (licencia personalizada, acceso restringido) |
| Formato de pesos | safetensors |
| Tarea | automatic-speech-recognition (ASR) |
| Modelo base | badrex/w2v-bert-2.0-kinyarwanda-asr |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo se basa en Wav2Vec2-BERT, una arquitectura que combina un extractor de características convolucional con un encoder transformer con atención, diseñada originalmente por Meta para representaciones de audio auto-supervisadas. Sobre esta base, el modelo ha pasado por un ajuste fino supervisado para transcripción ASR.

El ajuste se realizó a partir de `badrex/w2v-bert-2.0-kinyarwanda-asr` y emplea tres conjuntos de datos: `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0`, `cdli/rwandan_english_nonstandard_speech_v1.0` y `badrex/kinyarwanda-speech-1000h`. Los dos primeros aportan habla no estándar (incluida tartamudez) en kinyarwanda e inglés; el tercero aporta un volumen elevado de habla estándar en kinyarwanda. No se dispone de información sobre el número exacto de tokens de audio, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). El sufijo "rehearsal-en" sugiere un entrenamiento que intercala datos en inglés para preservar o ensayar capacidades bilingües, aunque no se detalla el mecanismo exacto.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en kinyarwanda.
- Transcripción de habla no estándar: tartamudez, disfluencias y pronunciaciones atípicas.
- Capacidad bilingüe kinyarwanda-inglés (según los idiomas declarados y los datasets de entrenamiento).
- Procesamiento de audio de entrada mediante el pipeline `automatic-speech-recognition`.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje generativo de propósito general).
- No se ha documentado capacidad de visión, audio generativo ni modo "thinking".

## Casos de uso

- Transcripción de entrevistas clínicas o logopédicas: el modelo puede transcribir grabaciones de personas con tartamudez en kinyarwanda, un escenario donde los ASR convencionales fallan por el habla no canónica.
- Subtitulado y accesibilidad para hablantes de kinyarwanda con disfluencias: generación de subtítulos en tiempo diferido para contenido audiovisual que incluya habla atípica.
- Digitalización de archivos orales de comunidades ruandesas: transcripción de grabaciones de campo con variabilidad de pronunciación y posibles mezclas con inglés.
- Sistemas de atención ciudadana en Ruanda: transcripción de llamadas o mensajes de voz en kinyarwanda para su posterior enrutamiento o análisis, aprovechando el soporte de habla no estándar.
- Investigación lingüística y fonética: análisis de patrones de disfluencia en corpus de habla no estándar, usando las transcripciones como base anotada.
- Evaluación comparativa de robustez ASR: servir como referencia específica para medir la degradación de sistemas ASR ante habla no estándar en lenguas de bajos recursos.
- Preservación y documentación de lenguas: apoyo a la transcripción de material oral en kinyarwanda para proyectos de documentación lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~580 M parámetros, en precisión FP32 se requieren aproximadamente 2,3 GB solo para pesos; en FP16/BF16 unos 1,2 GB; en INT8 unos 0,6 GB. A ello hay que sumar memoria para activaciones y buffers de audio, por lo que en la práctica conviene reservar entre 2 y 4 GB según la precisión y el tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060/4060 o superior ofrece margen cómodo. Para procesamiento por lotes a gran escala, A100, H100 o L4 aportan mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), incluso en CPU con llama.cpp/transformers aunque con mayor latencia.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), Hugging Face Inference Endpoints, TGI (si se adapta a audio), o exportación a ONNX. No se han publicado variantes GGUF ni integración directa en Ollama.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia | Acceso |
|---|---|---|---|---|---|
| jdaltonII02/w2v-bert-2.0-kinyarwanda-nss-rehearsal-en | ~580 M | rw, en | ASR habla no estándar (kinyarwanda) | cdli-non-standard-speech-terms | Restringido (gated) |
| badrex/w2v-bert-2.0-kinyarwanda-asr (modelo base) | ~580 M (Wav2Vec2-BERT) | rw | ASR kinyarwanda estándar | no disponible | no disponible |
| Wav2Vec2-BERT 2.0 (Meta, original) | ~580 M | multilingüe (preentrenado) | Representaciones de audio auto-supervisadas | no disponible | Público |

No se dispone de datos de rendimiento comparativo (WER, CER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia personalizada (`cdli-non-standard-speech-terms`): las condiciones de uso comercial no están detalladas en la información disponible; es imprescindible revisar el texto de la licencia antes de cualquier despliegue en producción.
- Riesgo de alucinación en ASR: como todo modelo de transcripción, puede generar texto plausible que no corresponde al audio, especialmente con ruido de fondo o habla muy degradada.
- Cobertura limitada a kinyarwanda e inglés; no se ha documentado soporte para otras lenguas.
- El enfoque en habla no estándar puede implicar un rendimiento inferior en habla canónica respecto al modelo base, si el ajuste ha desplazado la distribución.
- Sesgos potenciales derivados de los datasets de entrenamiento (composición demográfica, acentos y condiciones de grabación no documentadas).
- No se han publicado métricas de evaluación (WER/CER) ni detalles del proceso de entrenamiento, lo que dificulta la validación objetiva.
- Sin datos sobre longitud máxima de audio soportada ni sobre el comportamiento en audio de larga duración.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jdaltonII02/w2v-bert-2.0-kinyarwanda-nss-rehearsal-en
- Modelo base: https://huggingface.co/badrex/w2v-bert-2.0-kinyarwanda-asr
- Dataset de habla no estándar kinyarwanda: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Dataset de habla no estándar inglesa: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Dataset de habla kinyarwanda (1000 h): https://huggingface.co/datasets/badrex/kinyarwanda-speech-1000h
