# neoemu/parakeet-tdt-0.6b-v3-ptBR-coreml

## Resumen

El modelo `neoemu/parakeet-tdt-0.6b-v3-ptBR-coreml` es una conversión a CoreML del fine-tune en portugués brasileño del sistema de reconocimiento automático de voz (ASR) Parakeet TDT 0.6B v3 de NVIDIA. El trabajo original de NVIDIA es un modelo de 600 millones de parámetros con arquitectura RNNT (Recurrent Neural Network Transducer) que soporta 25 idiomas europeos, y el fine-tune de `alexandreacff` lo especializa en portugués de Brasil. Esta publicación concreta no retrena ningún peso: se limita a convertir y validar el checkpoint fine-tuneado al formato de artefactos que consume la librería FluidAudio, optimizado para ejecutarse en la Neural Engine de los chips Apple Silicon.

La relevancia de este modelo radica en que ofrece transcripción de voz en pt-BR con un factor de tiempo real (RTFx) de 421 en hardware Apple Silicon, muy superior a alternativas como WhisperKit large-v3-turbo (RTFx 7) o el mismo checkpoint en ONNX (RTFx ~25). El repositorio incluye los artefactos CoreML ya compilados (Encoder, Decoder, JointDecision y Preprocessor) junto con el vocabulario, sumando 603 MB en total. El modelo se distribuye bajo licencia CC-BY-4.0 y está diseñado para integrarse en aplicaciones Swift mediante FluidAudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer) con JointDecision v3 |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio fija de 15 segundos (exportacion CoreML) |
| Tipos de cuantizacion | int8-linear por canal (Encoder); Decoder y JointDecision sin cuantizar |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CoreML `.mlmodelc` compilado (Encoder, Decoder, JointDecision, Preprocessor) |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-tdt-0.6b-v3` es un ASR de 600 millones de parametros con arquitectura RNNT, que extiende la variante v2 ampliando el soporte de idiomas de ingles a 25 lenguas europeas con deteccion automatica de idioma. El checkpoint fine-tuneado en pt-BR (`parakeet-tdt-0.6b-v3-datasets-ptbr-e-podcasts.nemo`) se entreno sobre datasets de portugues brasileño y podcasts. La conversion a CoreML se realizo con los scripts de `FluidInference/mobius`, que exportan el modelo NeMo a CoreML con validacion de paridad numerica, medicion de latencia y exploracion de cuantizacion. El Encoder se cuantizo a int8-lineal por canal, mientras que el Decoder y el JointDecision se mantienen en precision original. El JointDecision es la variante *single step* con salidas `top_k_ids`/`top_k_logits`. El vocabulario de 8192 tokens se extrajo de `model.joint.vocabulary` con el marcador `▁` convertido a espacio.

## Capacidades

- Transcripcion de voz a texto en portugues de Brasil con alta precision (WER agregado 16,53% en corpus propio de reuniones reales).
- Ejecucion en la Neural Engine de Apple Silicon mediante CoreML, con pico de memoria de 176 MB.
- Factor de tiempo real (RTFx) de 421, muy superior a alternativas como WhisperKit o el mismo modelo en ONNX.
- Salida sin puntuacion ni mayusculas (a diferencia del modelo base de NVIDIA que incluye puntuacion y capitalizacion nativas).
- Soporte de *CTC vocabulary boosting* en FluidAudio para mitigar errores en jerga tecnica (no testado en pt-BR).
- Integracion nativa con FluidAudio via `AsrModels.load(from:version:encoderPrecision:)` y `AsrManager`.

## Casos de uso

- Transcripcion de reuniones en portugues brasileño: el modelo procesa audio de sistema y microfono con RTFx 421, permitiendo transcripcion en tiempo real o casi tiempo real en Macs con Apple Silicon.
- Subtitulado automatico de contenido audiovisual en pt-BR: su baja latencia y alta precision lo hacen adecuado para generar subtitulos en directo o en postproduccion.
- Asistentes de voz locales en macOS/iOS: al ejecutarse en la Neural Engine, no requiere conexion a internet ni envio de audio a servidores externos, preservando la privacidad.
- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones de call centers en pt-BR para busqueda de palabras clave, analisis de sentimiento o generacion de resumenes.
- Accesibilidad: generacion de transcripciones en tiempo real para personas con discapacidad auditiva en entornos educativos o laborales que usan portugues brasileño.
- Investigacion linguistica: transcripcion de corpus orales en pt-BR para estudios de fonetica, sociolinguistica o procesamiento de lenguaje natural.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones sobre un corpus propio de reuniones reales en pt-BR (13 fatias, 57,5 minutos, 5.355 palabras de referencia revisada por humano, 10 reuniones distintas). Los resultados son:

| Motor | WER agregado | WER holdout | RTFx |
|---|---|---|---|
| **Este modelo (CoreML, int8)** | **16,53%** | **17,71%** | **421** |
| Mismo checkpoint en ONNX (`onnx-asr`) | 18,65% | 21,16% | ~25 |
| WhisperKit `large-v3-turbo` (CoreML) | 19,80% | 23,08% | 7 |
| `parakeet-tdt-0.6b-v3` base (CoreML) | 23,51% | — | 274 |

El autor advierte de dos sesgos en estas mediciones: las referencias se revisaron a partir de rascunhos generados por un modelo de la misma familia, lo que favorece a este modelo; y la comparacion con ONNX usa segmentacion de audio diferente (VAD externo contra janelamiento interno de FluidAudio), por lo que parte de la diferencia se debe al janelamiento, no al modelo.

## Requisitos de hardware

- Mac con Apple Silicon (M1 o posterior) con Neural Engine; el modelo se ejecuta en la Neural Engine via CoreML.
- Pico de memoria: 176 MB durante la inferencia.
- Tamano del repositorio: 603 MB en disco (artefactos compilados).
- No requiere GPU dedicada; funciona en cualquier Mac con chip Apple Silicon.
- Despliegue mediante FluidAudio en Swift; no compatible con vLLM, llama.cpp u Ollama al ser un modelo CoreML especifico.
- RTFx de 421 medido en hardware Apple Silicon (modelo no especificado por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (corpus propio pt-BR) | RTFx | Licencia |
|---|---|---|---|---|---|
| **parakeet-tdt-0.6b-v3-ptBR-coreml** | 600M | 15 s ventana fija | 16,53% | 421 | CC-BY-4.0 |
| parakeet-tdt-0.6b-v3 base (CoreML) | 600M | 15 s ventana fija | 23,51% | 274 | CC-BY-4.0 |
| WhisperKit large-v3-turbo (CoreML) | ~809M | 30 s (aprox.) | 19,80% | 7 | MIT (Whisper) |
| Mismo checkpoint en ONNX | 600M | variable (VAD externo) | 18,65% | ~25 | CC-BY-4.0 |

El modelo supera en WER y RTFx a las alternativas comparadas en el corpus de evaluacion del autor, aunque con las salvedades metodologicas indicadas.

## Limitaciones y advertencias

- La salida no incluye puntuacion ni mayusculas, a diferencia del modelo base de NVIDIA; es necesario un post-procesado adicional para textos formateados.
- Errores en jerga tecnica (p. ej., "Kubernetes" → "gubernetes"); mitigable con *CTC vocabulary boosting* de FluidAudio, aunque no testado en pt-BR.
- Las referencias de evaluacion se generaron con un modelo de la misma familia, lo que puede inflar la precision medida.
- La comparacion con ONNX usa segmentacion de audio diferente, por lo que la ventaja en WER puede deberse en parte al janelamiento interno de FluidAudio.
- Al cargar, el runtime emite un aviso `E5RT ... slice_by_index: zero shape error`; no impide el funcionamiento pero no esta investigado.
- El corpus de evaluacion no es publico (contiene fala de terceros), lo que dificulta la reproducibilidad externa.
- La conversion requiere un entorno especifico (Python 3.10.12, torch 2.7.0, numpy 1.26.4, coremltools 9.0b1); con numpy 2.x la conversion falla.
- Licencia CC-BY-4.0 permite uso comercial con atribucion, pero verificar el cumplimiento de las capas derivadas (NVIDIA, fine-tune, conversion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neoemu/parakeet-tdt-0.6b-v3-ptBR-coreml
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Fine-tune pt-BR: https://huggingface.co/alexandreacff/parakeet-tdt-0.6b-v3-ptBR
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Scripts de conversion (mobius): https://github.com/FluidInference/mobius
- Documentacion de conversion CoreML: https://github.com/FluidInference/mobius/blob/main/models/stt/parakeet-tdt-v3-0.6b/coreml/README.md
- Coleccion Parakeet TDT 0.6B en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
