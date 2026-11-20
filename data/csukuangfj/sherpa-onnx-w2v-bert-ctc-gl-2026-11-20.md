# csukuangfj/sherpa-onnx-w2v-bert-ctc-gl-2026-11-20

## Resumen

El modelo `csukuangfj/sherpa-onnx-w2v-bert-ctc-gl-2026-11-20` es una exportación a ONNX del checkpoint `proxectonos/w2v-bert-2.0-gl`, un ajuste fino en gallego del modelo preentrenado `facebook/w2v-bert-2.0` realizado por Proxecto Nós. El resultado es un modelo de reconocimiento automático del habla (ASR) en formato ONNX, listo para su uso con la librería sherpa-onnx, que emplea la arquitectura `Wav2Vec2BertForCTC` de la librería transformers.

La relevancia de esta ficha radica en que empaqueta un modelo de ASR específico para gallego en un formato optimizado para inferencia en producción (ONNX), con variantes en fp32 e int8. Esto facilita el despliegue en entornos sin dependencias de PyTorch y con requisitos de recursos moderados, algo especialmente útil para lenguas de menor representación como el gallego, donde las alternativas comerciales suelen ser escasas.

El repositorio tiene un tamaño de 2,4 GB e incluye los pesos en fp32 (`model.onnx` y `model.weights`), una versión cuantizada a int8 (`model.int8.onnx`) y el vocabulario (`tokens.txt`). La licencia es Apache 2.0 y el único idioma declarado es el gallego (`gl`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2BertForCTC (w2v-BERT 2.0 con cabeza CTC), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada en tramas de 10 ms, sin límite de contexto declarado) |
| Tipos de cuantización | fp32 (`model.onnx` + `model.weights`) e int8 (pesos MatMul cuantizados a uint8 en `model.int8.onnx`) |
| Idiomas soportados | gallego (`gl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.weights`, `model.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

El modelo subyacente es `proxectonos/w2v-bert-2.0-gl`, un ajuste fino del checkpoint `facebook/w2v-bert-2.0` sobre datos de gallego. La arquitectura es w2v-BERT 2.0, un modelo de representación del habla auto-supervisado que combina un extractor de características convolucional con un transformer, al que se le añade una cabeza de clasificación CTC (`Wav2Vec2BertForCTC`) para la transcripción directa de audio a texto.

La exportación a ONNX conserva el comportamiento del modelo original. La entrada `input_features` tiene forma `(N, T, 160)`, construida a partir de 80 energías de filtro Kaldi por cada 10 ms, normalizadas por media y varianza por enunciado y agrupadas de dos en dos en cada fila. El factor de submuestreo del modelo por defecto es 4 (dos tramas por fila y un stride de 2 en el adaptador), lo que significa que cada trama de salida corresponde a 40 ms de audio. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el autor solo indica que es un ajuste fino del checkpoint de Facebook.

## Capacidades

- Reconocimiento automático del habla (ASR) en gallego, con salida de logits CTC y decodificación a texto.
- Procesamiento por lotes: el grafo enmascara el padding, de modo que se pueden decodificar varias utterances a la vez con resultados idénticos a la decodificación individual.
- Inferencia ligera con onnxruntime y kaldi-native-fbank, sin dependencia de PyTorch.
- Dos variantes de precisión (fp32 e int8) para adaptar el coste computacional y de memoria.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá de la transcripción, ni modo de pensamiento.
- El soporte multilingüe se limita al gallego según los metadatos del modelo.

## Casos de uso

- Transcripción de audio en gallego para subtitulado automático: el modelo convierte directamente la señal de voz en texto, y su formato ONNX permite integrarlo en pipelines de generación de subtítulos sin depender de frameworks pesados.
- Atención al cliente en gallego: se puede desplegar como servicio de ASR para transcribir llamadas o mensajes de voz y alimentar un sistema de tickets o un chatbot, aprovechando la variante int8 para reducir costes de inferencia.
- Archivado y búsqueda de contenido audiovisual en gallego: transcripción masiva de grabaciones (entrevistas, programas de radio, clases) para indexar y permitir búsqueda por texto.
- Aplicaciones de accesibilidad: dictado por voz y generación de subtítulos en tiempo real para personas con discapacidad auditiva en entornos gallegoparlantes.
- Investigación lingüística y corpus: generación de transcripciones para construir corpus orales en gallego, con la ventaja de que el modelo es de código abierto y licencia Apache 2.0.
- Integración en dispositivos de borde: la versión int8 y el runtime ONNX permiten ejecutar el modelo en hardware modesto (incluidas CPU) para aplicaciones de voz sin conexión.
- Evaluación comparativa de ASR para lenguas de bajos recursos: sirve como referencia reproducible (con las olas de test de FLEURS) para medir el rendimiento de otros sistemas en gallego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que las olas de test son las primeras grabaciones del conjunto de test de gallego de FLEURS (licencia CC BY 4.0) y que `test_onnx.py` verifica que la decodificación por lotes coincide con la decodificación individual, pero no se aportan métricas como WER ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 2,4 GB, lo que incluye los pesos fp32 y la variante int8; la variante int8 reduce aproximadamente a la mitad el peso de las matrices MatMul cuantizadas.
- GPU recomendadas: no se especifican. Al ser un modelo ASR de tamaño moderado exportado a ONNX, es apto para GPU consumer (por ejemplo, RTX 3060 o superiores) y también para CPU.
- ¿Cabe en GPU consumer? Sí, previsiblemente, dada la naturaleza del modelo y la disponibilidad de una variante int8; no se detallan requisitos mínimos exactos.
- Opciones de despliegue: sherpa-onnx (runtime principal), onnxruntime y kaldi-native-fbank para el cálculo de características. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| csukuangfj/sherpa-onnx-w2v-bert-ctc-gl-2026-11-20 | Wav2Vec2BertForCTC (ONNX) | gallego | no disponible | Apache 2.0 | ONNX | Hugging Face |
| proxectonos/w2v-bert-2.0-gl | Wav2Vec2BertForCTC | gallego | no disponible | Apache 2.0 | PyTorch (transformers) | Hugging Face |
| facebook/w2v-bert-2.0 | w2v-BERT 2.0 | multilingüe (preentrenamiento) | no disponible | no disponible en la información | PyTorch | Hugging Face |

No se dispone de datos de rendimiento (WER) para establecer una comparación cuantitativa con alternativas. La comparación se limita a arquitectura, idioma, licencia y formato de distribución.

## Limitaciones y advertencias

- El modelo solo está entrenado y declarado para gallego; su uso en otros idiomas no está soportado y probablemente produzca transcripciones incorrectas.
- No se han publicado métricas de calidad (WER) en la información disponible, por lo que no se puede garantizar un nivel de precisión concreto en producción.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos CTC, especialmente en audio con ruido, acentos o vocabulario especializado.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un ajuste fino sobre un modelo preentrenado multilingüe, puede heredar sesgos de los datos de preentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint original y de los datos de test (FLEURS, CC BY 4.0) si se redistribuyen.
- El archivo `model.weights` debe permanecer junto a `model.onnx`; su separación rompe la carga del modelo.
- El modelo no incluye capacidades de diálogo, tool calling ni razonamiento; es exclusivamente un sistema ASR.
- La fecha de creación del repositorio (2026-11-20) y el número de descargas (0) indican que es un artefacto reciente y sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/csukuangfj/sherpa-onnx-w2v-bert-ctc-gl-2026-11-20
- Checkpoint base en gallego: https://huggingface.co/proxectonos/w2v-bert-2.0-gl
- Modelo preentrenado original: https://huggingface.co/facebook/w2v-bert-2.0
- Dataset de test FLEURS: https://huggingface.co/datasets/google/fleurs
- Repositorio sherpa-onnx (runtime): no disponible en la información proporcionada.
