# RsGoksel/k47-XL

## Resumen

k47-XL es un modelo de reconocimiento automático de voz (ASR) para turco, desarrollado por RsGoksel (Göksel Gündüz), que se distingue por estar entrenado desde cero, sin partir de un fine-tune de Whisper. Su arquitectura combina un encoder ConformerV2 con un predictor stateless y un joiner RNN-T, más una cabeza CTC auxiliar durante el entrenamiento. Con 109,9 millones de parámetros y un tokenizer SentencePiece de 4.096 tokens, está diseñado específicamente para el idioma turco.

El modelo se entrenó en dos fases: una pretraining base sobre 2.396,6 horas de audio (1.527.976 clips) mezclando cuatro fuentes, seguida de una continuación de anillado (core-anneal) sobre el subconjunto más limpio de 1.178 horas. Esta segunda fase mejoró el WER fuera de distribución sin añadir datos nuevos. El checkpoint publicado corresponde a esa segunda fase.

Su relevancia radica en ser un ASR turco de código abierto con una arquitectura moderna (ConformerV2 + RNN-T) que compite favorablemente con Whisper large-v3 en un test set específico (WorldSpeech-TR), a pesar de tener un tamaño mucho menor. La licencia es research-preview, lo que limita su uso a investigación y reproducción, no a despliegue comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConformerV2 encoder (16 capas, dim 512, 8 cabezas, kernel conv 47, FFN Macaron MatFormer, atención relativa Transformer-XL) + predictor stateless + joiner RNN-T, con cabeza CTC auxiliar (peso 0.3) |
| Parametros totales | 109.853.664 (109,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio; subsampling 4×, frames de 40 ms) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | turco (tr) |
| Licencia | research-preview (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un ConformerV2 encoder de 16 capas con dimensión 512, 8 cabezas de atención, kernel de convolución depthwise de tamaño 47 (de ahí el nombre "k47"), FFN Macaron MatFormer y atención relativa de Transformer-XL. El subsampling es de 4×, produciendo frames de 40 ms. El tokenizer es SentencePiece con un vocabulario turco de 4.096 tokens. La decodificación por defecto es RNN-T greedy, aunque el repositorio de entrenamiento soporta beam search y fusión con LM externa (LODR).

El entrenamiento se realizó en dos fases sobre la misma arquitectura. La primera fase (pretraining base) usó 320.000 pasos de optimizador sobre el corpus `corpus_v2`, que mezcla cuatro fuentes: un agregado turco desde cero (`orhun_base`, 1.356,6 h), pseudo-etiquetas de Whisper sobre YODAS-TR (`yodas_king`, 547,4 h), una agregación parlamentaria/radiodifusión WorldSpeech-TR (284,6 h) e ISSAI (208,0 h). La segunda fase (continuación core-anneal, este checkpoint) añadió 50.000 pasos con learning rate 1,5e-5 y coseno, restringida solo al subconjunto `orhun_base` (713.143 clips, 1.178 h), con el tokenizer congelado. Esta fase de anillado sobre el subconjunto de procedencia más limpia mejoró el WER fuera de distribución. Se usó una única semilla y no se hizo promediado de checkpoints.

## Capacidades

- Reconocimiento de voz automático en turco, con transcripción de audio a texto.
- Decodificación RNN-T greedy (la reportada en este checkpoint).
- Soporte de beam search y fusión con modelo de lenguaje externo (LODR) según el repositorio de entrenamiento.
- No incluye tool calling, visión, generación de texto ni otras capacidades; es exclusivamente ASR.
- El modelo se entrega con código fuente (`modeling/`) para cargar el checkpoint sin depender del repositorio privado de entrenamiento.

## Casos de uso

- Transcripción de discursos parlamentarios y emisiones de radiodifusión: el modelo fue evaluado en WorldSpeech-TR (n=250) con un WER del 7,64%, superando a Whisper large-v3 (8,97%) en ese conjunto, lo que lo hace adecuado para entornos con vocabulario formal y ruido de fondo moderado.
- Subtitulado automático de vídeos en turco: su tamaño compacto (109,9 M parámetros) permite ejecutarlo en GPU de consumo o incluso CPU para procesamiento por lotes, generando subtítulos con baja latencia.
- Asistentes de voz para aplicaciones en turco: al ser un modelo específico del idioma, puede integrarse en pipelines de ASR para comandos de voz, dictado o interacción conversacional, con menor coste computacional que modelos multilingües grandes.
- Investigación académica en ASR turco: al estar entrenado desde cero y con código incluido, sirve como punto de partida para estudiar arquitecturas Conformer-RNN-T en un idioma de bajos recursos relativos.
- Comparación y evaluación de sistemas ASR: puede usarse como referencia en benchmarks como TurkSpeak Bench para medir el progreso en reconocimiento de voz turco frente a otros modelos.
- Transcripción de reuniones y entrevistas: su capacidad para manejar audio de 40 ms por frame y su robustez en datos fuera de distribución (mejorada por la fase de anillado) lo hacen útil para entornos de grabación variados.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados (decodificación RNN-T greedy para k47-XL, beam-5 con faster-whisper para los comparadores Whisper; normalización de texto `trnorm` aplicada a ambos lados):

| Test set | k47-XL (este checkpoint) | Whisper large-v3 (beam-5) | lv3-KING (LoRA Whisper, beam-5) |
|---|---|---|---|
| WorldSpeech-TR (n=250) | **7,64%** | 8,97% | 8,91% |
| FLEURS-TR (n=715) | 17,27% | — | — |

Notas: el checkpoint base antes del anillado obtuvo 22,84% en FLEURS-TR. No se han calculado intervalos de confianza (es una única semilla). La comparación en WorldSpeech-TR es la única cara a cara con modelos nombrados, pero los paradigmas de decodificación difieren (greedy vs beam-5), lo que se reconoce como una limitación estructural.

## Requisitos de hardware

- VRAM estimada: en fp32, el checkpoint ocupa ~440 MB (0,4 GB), por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. En fp16, ~220 MB. No se documentan cuantizaciones oficiales, pero podría convertirse a GGUF o int8 con herramientas externas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; incluso CPU es viable para inferencia por lotes dada la baja carga de parámetros.
- Opciones de despliegue: al no ser un modelo `transformers` estándar, requiere cargar el código de `modeling/` (PyTorch). No se documentan integraciones con vLLM, llama.cpp u Ollama; podría convertirse a ONNX o CTranslate2 manualmente, pero no está soportado de fábrica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | WER en WorldSpeech-TR |
|---|---|---|---|---|---|
| k47-XL (este) | 109,9 M | no disponible (audio) | turco | research-preview | 7,64% (greedy) |
| Whisper large-v3 | 1550 M | 30 s de audio | multilingüe (99) | MIT | 8,97% (beam-5) |
| RsGoksel_ITU_Mainframe (LoRA Whisper large-v3-turbo) | 809 M | 30 s de audio | multilingüe (fine-tune turco) | research-preview | 8,91% (beam-5) |

k47-XL es significativamente más pequeño que los modelos Whisper, pero logra un WER menor en el test set WorldSpeech-TR. Sin embargo, la comparación no es directa por las diferencias en decodificación y arquitectura. Whisper large-v3 tiene licencia MIT (comercial), mientras que k47-XL y el fine-tune del autor tienen licencia research-preview.

## Limitaciones y advertencias

- Licencia research-preview: no permite uso comercial ni redistribución comercial. Los pesos son solo para investigación y reproducción.
- Datos de entrenamiento con procedencia no verificada: la mayor fuente de `orhun_base` (una agregación comunitaria de audio de YouTube/noticias) tiene licencias no verificadas. Aunque mejora el WER, no es una base para reclamar licencia limpia.
- Datos derivados de YODAS-TR (`yodas_king`) están restringidos a investigación y publicación, no a redistribución comercial.
- Solo soporta turco; no hay capacidades multilingües.
- Decodificación greedy por defecto; no se reportan resultados con beam search en este checkpoint.
- Resultados de una única semilla, sin intervalos de confianza; los números pueden variar con otras semillas.
- No es un modelo `transformers` estándar; requiere el código incluido en `modeling/` para cargar el checkpoint, lo que puede complicar la integración en pipelines existentes.
- Riesgo de alucinación en transcripción: como todo ASR, puede producir errores en audio con ruido extremo o vocabulario fuera de dominio, aunque la fase de anillado mitigó parcialmente el WER fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RsGoksel/k47-XL
- Leaderboard TurkSpeak Bench: https://huggingface.co/spaces/RsGoksel/turkish-asr-benchmark-stt
- Modelo relacionado (Whisper LoRA): https://huggingface.co/RsGoksel/RsGoksel_ITU_Mainframe
- Perfil de GitHub del autor: https://github.com/RsGoksel/
