# KoelLabs/xlsr-english-01

## Resumen

KoelLabs/xlsr-english-01 es un modelo de transcripcion fonetica (Speech2IPA) desarrollado por KoelLabs, derivado mediante fine-tuning de facebook/wav2vec2-xlsr-53-espeak-cv-ft. Su objetivo no es la transcripcion ortografica convencional, sino la prediccion de secuencias de fonemas en Alfabeto Fonetica Internacional (AFI/IPA) a partir de audio de habla inglesa, con un vocabulario de 79 simbolos. Esta disenado especificamente para modelar de forma robusta pronunciacion con acento marcado y habla con alteraciones (impaired speech), lo que lo hace util en sistemas de retroalimentacion de pronunciacion y analisis linguistico.

El modelo cuenta con 315.519.695 parametros (aproximadamente 316 M) y esta construido sobre la arquitectura wav2vec2, un transformer convolucional auto-supervisado para audio. Se entreno sobre aproximadamente 41 horas de audio procedente de multiples corpus (DoReCo, EpaDB, SpeechOceanNoTH, L2Arctic, L2ArcticSpontaneousSplit, Buckeye y TIMIT), lo que aporta diversidad de acentos, hablantes L2 y registros espontaneos.

Su relevancia actual radica en que cubre un nicho poco atendido: la fonetizacion automatica precisa para ingles no nativo y habla atipica, tarea en la que los ASR convencionales orientados a texto fallan o pierden informacion fonetica. El acceso esta restringido (gated) en Hugging Face y la licencia es AGPL-3.0, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional auto-supervisado para audio) |
| Parametros totales | 315.519.695 (~316 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Tarea | Speech2IPA (transcripcion fonetica), pipeline automatic-speech-recognition |
| Vocabulario de salida | 79 simbolos IPA |
| Modelo base | facebook/wav2vec2-xlsr-53-espeak-cv-ft |
| Tamano del repo | 1,3 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Descargas | 32.998 (segun Hugging Face); ~101,5 K acumuladas segun OpenModelStats |

## Arquitectura y entrenamiento

El modelo se basa en wav2vec2, la arquitectura de representaciones de audio auto-supervisadas de Facebook AI, que combina un extractor de caracteristicas convolucional con un transformer que opera sobre representaciones latentes del audio. Sobre el checkpoint multilingue facebook/wav2vec2-xlsr-53-espeak-cv-ft (ya ajustado para fonetizacion con espeak) se realizo un fine-tuning especifico para ingles, orientado a predecir secuencias de simbolos IPA en lugar de texto ortografico.

El entrenamiento utilizo aproximadamente 41 horas de audio agregado de siete corpus: DoReCo, EpaDB, SpeechOceanNoTH, L2Arctic, L2ArcticSpontaneousSplit, Buckeye y TIMIT. Esta composicion mezcla habla nativa y no nativa (L2Arctic), habla espontanea (Buckeye), corpus de pronunciacion de aprendices (SpeechOcean) y datos de documentacion linguistica (DoReCo), lo que explica el enfasis del modelo en acentos e inteligibilidad degradada. No se dispone de informacion sobre el numero exacto de tokens de audio, la composicion porcentual por corpus ni sobre el uso de RLHF o DPO; el modelo es un ajuste supervisado para una tarea de etiquetado secuencial (fonemas).

## Capacidades

- Transcripcion fonetica de audio en ingles a secuencias de simbolos IPA con un vocabulario de 79 simbolos.
- Modelado robusto de pronunciacion con acento (hablantes no nativos y L2).
- Procesamiento de habla con alteraciones o inteligibilidad reducida (impaired speech).
- Analisis linguistico y fonetico de grabaciones, orientado a investigacion.
- Retroalimentacion de pronunciacion en aplicaciones de aprendizaje de idiomas.
- Entrada de audio crudo (waveform) procesada directamente por el frontend convolucional de wav2vec2.
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Retroalimentacion de pronunciacion en apps de aprendizaje de ingles: el modelo genera la secuencia IPA del audio del usuario, que puede compararse con la transcripcion de referencia para detectar sustituciones, omisiones o inserciones de fonemas y ofrecer correcciones concretas.
- Evaluacion de acento y fluidez en hablantes L2: gracias al entrenamiento con L2Arctic y SpeechOcean, puede usarse para medir desviaciones foneticas respecto a una pronunciacion objetivo en examenes o plataformas de evaluacion.
- Investigacion fonetica y linguistica de corpus: permite fonetizar automaticamente grabaciones de campo (por ejemplo, datos tipo DoReCo) sin transcripcion manual, acelerando estudios de variacion y cambio fonetico.
- Herramientas de accesibilidad para habla atipica: al modelar habla con alteraciones, puede servir de base para sistemas de apoyo a personas con trastornos del habla, generando representaciones foneticas utilizables por terapeutas.
- Analisis de habla espontanea: su entrenamiento con Buckeye permite procesar conversacion natural y no solo lectura de frases, util en estudios de reduccion fonetica en habla rapida.
- Preprocesado para pipelines de sintesis y reconocimiento: la salida IPA puede alimentar sistemas TTS o de analisis acustico que requieran representacion fonetica intermedia en lugar de texto.
- Deteccion de errores de pronunciacion en tiempo casi real: con 316 M de parametros, es viable desplegarlo en infraestructura moderada para inferencia por lotes o interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~316 M de parametros en precision FP32 ocupa aproximadamente 1,3 GB de pesos; en FP16 alrededor de 0,65 GB. Con overhead de activaciones, es adecuado un entorno con 2-4 GB de VRAM o incluso CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o servicio concurrente, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), TGI, vLLM (soporte de wav2vec2 limitado, verificar), y exportacion a ONNX. No se documenta soporte GGUF/llama.cpp para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| KoelLabs/xlsr-english-01 | ~316 M | no disponible | Speech2IPA (ingles) | AGPL-3.0 | gated |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | ~317 M | no disponible | Speech2IPA multilingue | Apache-2.0 (verificar) | abierto |
| Wav2Vec2-base-960h (ASR ingles) | ~95 M | no disponible | ASR ortografico | Apache-2.0 (verificar) | abierto |
| Whisper (small/base) | 74-244 M | 30 s de audio | ASR ortografico multilingue | MIT (verificar) | abierto |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de rendimiento comparativo (PER/WER) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no es un modelo multilingue pese a derivar de un checkpoint XLSR multilingue.
- Salida en simbolos IPA, no en texto ortografico: no sustituye a un ASR convencional para transcripcion de contenido.
- Entrenado con ~41 horas de audio, un volumen reducido que puede limitar la generalizacion a acentos, edades o condiciones acusticas no representadas.
- Riesgo de errores en fonemas poco frecuentes o en habla con ruido de fondo; no se han publicado metricas de error (PER) en la informacion disponible.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo modificado; revisar implicaciones antes de integrarlo en productos comerciales cerrados.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion al despliegue automatizado.
- Riesgo de sesgo hacia los corpus de entrenamiento (mayoria de ingles estadounidense y hablantes L2 concretos); puede infrarepresentar variedades no incluidas.
- No dispone de documentacion sobre cuantizacion ni sobre rendimiento en produccion; validar latencia y precision en el entorno objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KoelLabs/xlsr-english-01
- Estadisticas del modelo: https://openmodelstats.com/models/koellabs/xlsr-english-01
- Modelo base: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Paper de referencia (arxiv): https://arxiv.org/abs/2606.16019
- Corpus DoReCo: https://huggingface.co/datasets/KoelLabs/DoReCo
- Corpus EpaDB: https://huggingface.co/datasets/KoelLabs/EpaDB
- Corpus SpeechOceanNoTH: https://huggingface.co/datasets/KoelLabs/SpeechOceanNoTH
- Corpus L2Arctic: https://huggingface.co/datasets/KoelLabs/L2Arctic
- Corpus L2ArcticSpontaneousSplit: https://huggingface.co/datasets/KoelLabs/L2ArcticSpontaneousSplit
- Corpus Buckeye: https://huggingface.co/datasets/KoelLabs/Buckeye
- Corpus TIMIT: https://huggingface.co/datasets/KoelLabs/TIMIT
