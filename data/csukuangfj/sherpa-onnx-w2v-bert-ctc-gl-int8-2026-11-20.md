# csukuangfj/sherpa-onnx-w2v-bert-ctc-gl-int8-2026-11-20

## Resumen

El modelo `csukuangfj/sherpa-onnx-w2v-bert-ctc-gl-int8-2026-11-20` es una exportación a ONNX del checkpoint `proxectonos/w2v-bert-2.0-gl`, un ajuste fino en gallego del modelo de reconocimiento automático del habla (ASR) `facebook/w2v-bert-2.0`. Lo publica csukuangfj dentro del ecosistema sherpa-onnx, un conjunto de herramientas de inferencia en tiempo real basado en onnxruntime, con el objetivo de ofrecer un modelo listo para desplegar en producción sin dependencias de PyTorch.

El modelo resuelve la transcripción de audio en gallego mediante una cabeza CTC sobre el encoder w2v-BERT 2.0, que combina auto-supervisión contrastiva con modelado enmascarado. El repositorio incluye pesos en fp32 (`model.onnx` más `model.weights`) y una variante cuantizada a int8 (`model.int8.onnx`) con las matrices de las capas MatMul en uint8, además del vocabulario `tokens.txt`. El tamaño total del repositorio es de 0,9 GB.

Es relevante porque cubre un idioma con poca representación en los sistemas ASR comerciales (gallego) y porque su formato ONNX permite ejecución en CPU y dispositivos de bajos recursos a través de sherpa-onnx, sin necesidad de GPU ni de framework de deep learning completo. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 con cabeza CTC (`Wav2Vec2BertForCTC`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio variable; factor de submuestreo 4 sobre tramas de 10 ms) |
| Tipos de cuantizacion | fp32 (`model.onnx` + `model.weights`) e int8 (MatMul en uint8, `model.int8.onnx`) |
| Idiomas soportados | gallego (gl) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx` con pesos externos `.weights`) y `tokens.txt` |

## Arquitectura y entrenamiento

El modelo base es w2v-BERT 2.0 de Meta, un encoder transformer que pre-entrena con una combinación de predicción contrastiva (estilo wav2vec 2.0) y modelado enmascarado de habla (estilo BERT) sobre audio sin etiquetar. Sobre ese encoder, el ajuste fino de Proxecto Nós añade una cabeza lineal CTC que produce directamente logits por fotograma de salida, sin modelo de lenguaje externo en la exportación. La extracción de características sigue el esquema de `SeamlessM4TFeatureExtractor`: 80 energías de filterbank Kaldi cada 10 ms, normalizadas por media y varianza a nivel de enunciado, y concatenación de dos tramas consecutivas en una fila.

La exportación a ONNX mantiene tres entradas (`input_features` float32 de forma `(N, T, 160)`, `input_lengths` int64 y la máscara de padding implícita en el grafo) y dos salidas (`logits` float32 de forma `(N, T_out, vocab_size)` y `logits_lengths`). El factor de submuestreo es 4, es decir, cuatro tramas de 10 ms por fotograma de salida. El token de relleno (`<blk>`) actúa como blank de CTC. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se aplicaron técnicas de RLHF o DPO; la model card solo indica que el checkpoint base es `proxectonos/w2v-bert-2.0-gl` y que las ondas de prueba provienen del conjunto de test gallego de FLEURS.

## Capacidades

- Reconocimiento automático del habla en gallego con salida CTC codificada por caracteres o subpalabras según `tokens.txt`.
- Procesamiento por lotes con padding enmascarado: el grafo ONNX ignora las posiciones de relleno, lo que permite decodificar varios enunciados a la vez.
- Inferencia en CPU mediante onnxruntime, sin dependencia de PyTorch ni de CUDA.
- Extracción de características integrada en el flujo de prueba con kaldi-native-fbank (80 bins, ventana de 10 ms, normalización por enunciado).
- Ejecución tanto en fp32 como en int8, seleccionable por fichero de modelo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento; es un modelo puramente ASR.

## Casos de uso

- Transcripción de audio en gallego en producción: el modelo convierte directamente audio de 16 kHz en texto mediante CTC, con una única pasada por el encoder y sin modelo de lenguaje externo, lo que simplifica el pipeline y reduce la latencia.
- Subtitulado automático de vídeo y pódcast en gallego: al ser ONNX y ejecutable en CPU, puede integrarse en servidores sin GPU para generar subtítulos por lotes con el modo de padding enmascarado.
- Aplicaciones de voz en dispositivos de bajos recursos: la variante int8 reduce el peso y permite desplegar en Raspberry Pi, mini-PC o móviles usando sherpa-onnx, sin necesidad de infraestructura cloud.
- Sistemas de atención al cliente con entrada de voz: transcripción de consultas habladas en gallego antes de pasarlas a un motor de NLU o a un LLM, aprovechando la licencia Apache 2.0 para uso comercial.
- Investigación lingüística y corpus orales: generación de transcripciones para anotación de corpus en gallego, con la posibilidad de comparar fp32 e int8 para medir la degradación por cuantización.
- Integración en asistentes de accesibilidad: dictado por voz para personas con movilidad reducida en gallego, ejecutado localmente para preservar la privacidad del audio.
- Evaluación comparativa de ASR de bajo recurso: el repositorio incluye `test_onnx.py` y ondas de FLEURS, lo que facilita reproducir métricas y comparar con otros modelos gallegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 0,9 GB, por lo que en fp32 se requiere aproximadamente 1 GB de memoria y en int8 sustancialmente menos (los pesos MatMul se almacenan en uint8).
- GPU recomendadas: no se especifican; el modelo está pensado para onnxruntime en CPU. Cualquier GPU compatible con onnxruntime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, por tamaño, aunque no se documentan requisitos mínimos ni pruebas en tarjetas concretas.
- Opciones de despliegue: sherpa-onnx (objetivo principal), onnxruntime directamente, y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| csukuangfj/sherpa-onnx-w2v-bert-ctc-gl-int8-2026-11-20 | w2v-BERT 2.0 + CTC | gallego | audio variable (submuestreo 4) | Apache 2.0 | ONNX (fp32/int8) | Hugging Face |
| proxectonos/w2v-bert-2.0-gl | w2v-BERT 2.0 + CTC | gallego | audio variable | Apache 2.0 | PyTorch (transformers) | Hugging Face |
| facebook/w2v-bert-2.0 | w2v-BERT 2.0 | multilingüe (pre-entrenamiento) | audio variable | no disponible en la información | PyTorch | Hugging Face |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento (WER, latencia) para establecer diferencias cuantitativas con alternativas como Whisper en gallego.

## Limitaciones y advertencias

- Solo soporta gallego; no está entrenado ni validado para otros idiomas.
- Al ser un modelo CTC sin modelo de lenguaje externo, la salida puede contener errores ortográficos o de segmentación en palabras poco frecuentes.
- No se han publicado métricas de WER ni evaluaciones formales en la información disponible, por lo que el rendimiento real en dominios concretos (ruido, acentos, audio telefónico) es desconocido.
- La cuantización int8 puede degradar la precisión respecto a fp32; no se documenta la magnitud de esa degradación.
- El modelo no incluye puntuación ni capitalización explícitas más allá de lo aprendido en el ajuste fino; no se detalla el preprocesado de texto.
- Riesgo de sesgos heredados del corpus de entrenamiento de w2v-BERT 2.0 y del ajuste fino gallego, no cuantificado en la model card.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base `facebook/w2v-bert-2.0` y de los datos de FLEURS (CC BY 4.0) si se redistribuyen las ondas de prueba.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-w2v-bert-ctc-gl-int8-2026-11-20
- Checkpoint base gallego: https://huggingface.co/proxectonos/w2v-bert-2.0-gl
- Modelo original de Meta: https://huggingface.co/facebook/w2v-bert-2.0
- Dataset de prueba FLEURS: https://huggingface.co/datasets/google/fleurs
