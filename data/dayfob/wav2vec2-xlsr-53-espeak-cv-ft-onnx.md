# Dayfob/wav2vec2-xlsr-53-espeak-cv-ft-onnx

## Resumen

Dayfob/wav2vec2-xlsr-53-espeak-cv-ft-onnx es una exportación a formato ONNX del modelo facebook/wav2vec2-xlsr-53-espeak-cv-ft, un sistema de reconocimiento fonético multilingüe basado en la arquitectura wav2vec2 XLSR-53. El modelo original, desarrollado por Meta AI (entonces Facebook AI), aprende representaciones de voz auto-supervisadas a partir de audio sin etiquetar en 53 idiomas y se afina para reconocimiento de fonemas mediante el decodificador CTC sobre el vocabulario eSpeak. Esta versión concreta aplica cuantización dinámica int8 a los pesos de las operaciones MatMul y Gemm, con el objetivo de permitir inferencia en CPU con onnxruntime sin dependencia de PyTorch.

El problema que resuelve es la necesidad de ejecutar reconocimiento fonético en entornos sin GPU y sin el stack de PyTorch, manteniendo un comportamiento prácticamente idéntico al modelo original. El repositorio ocupa 0,4 GB e incluye el grafo ONNX (opset 17), el vocabulario de 392 tokens y el script de exportación. La entrada es audio mono a 16 kHz normalizado a media cero y varianza unitaria, y la salida son logits por fotograma sobre 392 clases.

Es relevante para desarrolladores que necesitan transcripción fonética ligera en producción (por ejemplo, para análisis de pronunciación, alineamiento fonético o sistemas de evaluación de habla) en infraestructura CPU. El modelo base está publicado bajo licencia Apache 2.0 y se apoya en el trabajo de Xu, Baevski y Auli sobre reconocimiento fonético zero-shot entre idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 XLSR-53 (transformer convolucional + encoder transformer) con cabeza CTC |
| Parametros totales | no disponible (modelo base wav2vec2-large, ~317 M en la variante estándar; no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por ventanas; sin límite de contexto textual) |
| Tipos de cuantizacion | int8 dinámica (pesos de MatMul y Gemm); fp32 en el modelo original |
| Idiomas soportados | no disponible (el modelo base XLSR-53 cubre 53 idiomas para preentrenamiento; el afinamiento fonético es multilingüe vía eSpeak) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model_int8.onnx, opset 17) |

## Arquitectura y entrenamiento

El modelo base es wav2vec2 XLSR-53, un encoder que combina un extractor de características convolucional con un transformer que procesa representaciones latentes del audio. El preentrenamiento es auto-supervisado sobre audio sin etiquetar en 53 idiomas, y el afinamiento posterior (fine-tuning) se realiza con una cabeza de clasificación CTC sobre un vocabulario fonético derivado de eSpeak (392 tokens, con `<pad>` como blank de CTC). Esta variante concreta no reentrena el modelo: únicamente exporta el grafo a ONNX (opset 17) y aplica cuantización dinámica int8 a las operaciones MatMul y Gemm.

La innovación técnica de esta ficha es la exportación y cuantización: se mantienen pesos, vocabulario y comportamiento del original, y se documenta el proceso reproducible en `export.py`. Según el autor, sobre 44 grabaciones cortas en inglés (117 s en total) los fonemas del modelo int8 coinciden con los del fp32 en 36 casos y difieren en unos pocos fonemas en el resto (por ejemplo, ə por ɐ). El rendimiento medido es de aproximadamente 0,06 s de CPU por segundo de audio con 2 hilos.

## Capacidades

- Reconocimiento fonético (phoneme recognition) a partir de audio mono a 16 kHz.
- Salida de logits por fotograma sobre 392 clases fonéticas (vocabulario eSpeak).
- Decodificación CTC: argmax por fotograma, colapso de repeticiones y eliminación del token `<pad>`.
- Inferencia en CPU con onnxruntime, sin necesidad de PyTorch.
- Comportamiento multilingüe heredado del modelo base (preentrenado en 53 idiomas), aunque la información disponible no detalla el rendimiento por idioma.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo acústico-fonético, no un LLM.
- No soporta visión, audio generativo ni modo thinking.

## Casos de uso

- Evaluación de pronunciación: el modelo convierte audio del alumno en una secuencia de fonemas que puede compararse con la transcripción fonética esperada para detectar errores de articulación, gracias a su salida CTC por fotograma.
- Análisis fonético en investigación lingüística: permite transcribir corpus de audio a nivel de fonema en CPU, sin GPU ni PyTorch, lo que simplifica el despliegue en servidores convencionales.
- Preprocesamiento para sistemas TTS: la secuencia fonética obtenida puede alimentar un sintetizador que requiera entrada en fonemas eSpeak.
- Alineamiento fonético forzado: los logits por fotograma permiten construir alineamientos entre audio y fonemas para herramientas de subtitulado o análisis de habla.
- Detección de errores de pronunciación en aplicaciones educativas: integrable en un servicio CPU ligero (0,06 s de CPU por segundo de audio con 2 hilos) para retroalimentación casi en tiempo real.
- Transcripción fonética multilingüe en pipelines de bajo coste: al heredar el preentrenamiento XLSR-53, puede emplearse en escenarios con varios idiomas donde no se dispone de GPU.
- Prototipado rápido sin PyTorch: el formato ONNX con onnxruntime facilita la integración en servicios en C++, C# o Java que no pueden ejecutar el stack de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo de reconocimiento fonético.

Los únicos datos de rendimiento proporcionados por el autor son:

| Metrica | Valor |
|---|---|
| Coincidencia de fonemas int8 vs fp32 | 36 de 44 grabaciones idénticas; el resto con diferencias menores (p. ej. ə por ɐ) |
| Velocidad de inferencia | ~0,06 s de CPU por segundo de audio (2 hilos) |
| Conjunto de prueba | 44 grabaciones cortas en inglés, 117 s en total |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no necesarias; el modelo base (~317 M de parámetros) cabría en cualquier GPU consumer, pero esta exportación está pensada para CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con suficiente memoria para el modelo base en fp32 o int8, aunque no es el objetivo de esta versión.
- Opciones de despliegue: onnxruntime (CPU), con el grafo `model_int8.onnx`; el modelo original puede desplegarse con PyTorch/Transformers.
- Latencia y throughput: ~0,06 s de CPU por segundo de audio con 2 hilos (dato del autor); no se dispone de más cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Dayfob/wav2vec2-xlsr-53-espeak-cv-ft-onnx | no disponible (~317 M en el base) | no aplica | Reconocimiento fonético | Apache 2.0 | ONNX int8 |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | no disponible (~317 M) | no aplica | Reconocimiento fonético | Apache 2.0 | PyTorch (safetensors/bin) |
| Wav2Vec2-base-960h (ASR inglés) | ~95 M | no aplica | ASR (texto) | Apache 2.0 | PyTorch/ONNX |
| Whisper (varias tallas) | 39 M–1,55 B | 30 s de audio | ASR multilingüe | MIT | PyTorch/ONNX/GGML |

La comparativa directa más relevante es con el modelo original en PyTorch: esta versión ofrece el mismo comportamiento con cuantización int8 y formato ONNX para CPU. Frente a Whisper, la diferencia es de tarea: este modelo produce fonemas, no texto, y no compite en benchmarks de ASR convencionales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; el modelo base XLSR-53 puede heredar sesgos de los datos de preentrenamiento.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero la decodificación CTC puede producir fonemas incorrectos en audio ruidoso o con acentos no representados.
- Limitaciones de contexto o idioma: la información no detalla el rendimiento por idioma; el afinamiento fonético usa eSpeak y el autor solo reporta pruebas en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base y del vocabulario eSpeak.
- Caveat para producción: la cuantización int8 introduce diferencias menores en fonemas (documentadas en 8 de 44 grabaciones de prueba); validar con datos propios antes de desplegar.
- La entrada debe ser audio mono a 16 kHz normalizado a media cero y varianza unitaria; un preprocesamiento incorrecto degrada la salida.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Hugging Face: https://huggingface.co/Dayfob/wav2vec2-xlsr-53-espeak-cv-ft-onnx
- Modelo base: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Paper: https://arxiv.org/abs/2109.11680 (Simple and Effective Zero-shot Cross-lingual Phoneme Recognition)
- Licencia: https://huggingface.co/Dayfob/wav2vec2-xlsr-53-espeak-cv-ft-onnx/blob/main/LICENSE
