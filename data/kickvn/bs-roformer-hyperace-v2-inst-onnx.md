# kickvn/BS-Roformer-HyperACE-v2-inst-ONNX

## Resumen

BS-Roformer-HyperACE-v2-inst-ONNX es una conversión a ONNX del modelo de separación de fuentes musicales pcunwa/BS-Roformer-HyperACE (checkpoint `v2_inst/bs_roformer_inst_hyperacev2.ckpt`), publicada por el estudio KICK (kickvn). El objetivo del artefacto no es investigar una arquitectura nueva, sino entregar los pesos originales en un grafo ONNX ejecutable con onnxruntime sobre DirectML o CPU, de forma que la separación de la pista instrumental no dependa de PyTorch ni de una GPU NVIDIA. Los pesos se han convertido a fp16 (cómputo fp16, entradas y salidas fp32) sin reentrenamiento: el modelo resultante es numéricamente equivalente al original salvo por la precisión reducida.

La arquitectura es un BS-RoFormer de dimensión 256 y profundidad 12 con 62 bandas de frecuencia, en el que la cabeza de máscara habitual se sustituye por una red de segmentación HyperACE (paper arXiv:2506.17733). El modelo recibe el espectrograma STFT de un fragmento estéreo y devuelve una máscara compleja para el stem `instrument`. Según la model card del autor original, en el conjunto MVSEP Multisong alcanza SDR 17,4007 para la pista instrumental, con métricas auxiliares de bleedless 37,87, fullness 38,03 y aura_mrstft 22,82.

Su relevancia práctica es doble: por un lado, permite integrar separación vocal/instrumental de calidad en aplicaciones de escritorio y pipelines locales sin dependencias de PyTorch; por otro, la licencia es un punto crítico, ya que el repositorio original no declara licencia y sus pesos derivan de un modelo GPL-3.0. El repositorio ocupa 0,2 GB y en el momento de la consulta no registraba descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-Roformer (transformer con atención por bandas) dim 256, depth 12, 62 bandas; cabeza de máscara sustituida por red de segmentación HyperACE |
| Parametros totales | no disponible (no declarado en la model card; el repo completo ocupa 0,2 GB con pesos fp16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio; procesa chunks de 960 000 muestras, hop 512, n_fft 2048) |
| Tipos de cuantizacion | fp16 (pesos y cómputo) con entradas/salidas fp32; no se distribuyen variantes int8, GGUF ni fp32 |
| Idiomas soportados | no disponible (procesamiento de audio, independiente del idioma) |
| Licencia | other: el repositorio original no declara licencia y sus pesos derivan de anvuew/BS-RoFormer (GPL-3.0) |
| Formato de pesos | ONNX (`model-fp16.onnx`) + `profile.json` con chunk, hop, n_fft y stem |
| Entrada | `spec` [1, T, 4100] fp32: STFT (n_fft 2048, ventana Hann, center=True) en formato [frame][bin 1025][canal 2][re, im] |
| Salida | `mask` [1, T, 4100] fp32: máscara compleja para el stem `instrument`, mismo layout que la entrada |
| Tarea (pipeline) | audio-to-audio / separación de fuentes musicales |
| Libreria | onnxruntime (DirectML / CPU) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | pcunwa/BS-Roformer-HyperACE |

## Arquitectura y entrenamiento

El modelo es un BS-RoFormer, variante de RoFormer adaptada a separación musical que aplica atención sobre representaciones organizadas por bandas de frecuencia. La configuración declarada es dim 256, depth 12 y 62 bandas. La modificación respecto a un BS-RoFormer estándar es que la cabeza de máscara se reemplaza por HyperACE, una red de segmentación descrita en el paper arXiv:2506.17733, que produce la máscara compleja aplicada al espectrograma de entrada. No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon etapas de RLHF o ajuste preferencial; la model card no los detalla.

La conversión realizada por KICK no incluye reentrenamiento ni ajuste fino: los pesos son los del checkpoint original `bs_roformer_inst_hyperacev2.ckpt`, únicamente convertidos a fp16. El preprocesado y postprocesado quedan fuera del grafo: el llamante debe calcular la STFT (n_fft 2048, Hann, hop 512, center=True), multiplicar la máscara devuelta por el espectro, anular la componente DC, aplicar iSTFT y hacer overlap-add con un fundido de 1/10 de chunk. Con chunk 960 000 y hop 512 se obtienen 1876 frames, cifra que coincide con el tamaño de los mapas de atención (1876²) citado por el autor. La atención se ejecuta como MatMul/Softmax sin fusión (62 bandas × 8 cabezas × 1876² puntuaciones), lo que penaliza el rendimiento en DirectML según advierte la propia model card.

## Capacidades

- Separación de la pista instrumental de una mezcla musical estéreo: devuelve una máscara compleja específica para el stem `instrument`.
- Procesamiento por chunks con solapamiento (overlap-add con fundido de 1/10 de chunk) para audio de duración arbitraria.
- Cómputo en fp16 con acumulación declarada fp32 en entradas y salidas, lo que reduce el peso del modelo y el ancho de banda de memoria.
- Ejecución sobre onnxruntime con backend DirectML o CPU, sin dependencia de PyTorch.
- Un único stem de salida (`instrument`); no genera vocals, drums ni bass de forma independiente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión ni de audio-texto; es un modelo puramente audio-a-audio.
- No se documentan modos especiales (thinking, streaming, batch) en la información disponible.

## Casos de uso

- Generación de pistas para karaoke: se pasa la mezcla completa por el grafo ONNX, se multiplica la máscara por el espectro y se reconstruye la señal; el resultado es la base instrumental sobre la que el usuario canta. El chunk de 960 000 muestras permite procesar pistas completas por tramos con solapamiento.
- Remezcla y edición para DJ y producción musical: extraer el instrumental permite construir mashups, edits y versiones extendidas manteniendo la calidad de la grabación original, con la ventaja de ejecutar todo en local sobre DirectML.
- Postproducción de vídeo y podcast: eliminar o atenuar la música de fondo de material de archivo para locutar encima, usando la máscara instrumental de forma inversa sobre el espectro original.
- Doblaje y localización: obtener la base instrumental de una canción o de un contenido audiovisual para regrabar voces en otro idioma sin arrastrar la voz original.
- Preprocesado de datasets de audio para investigación en MIR: generar pares mezcla/instrumental a escala para entrenar modelos de detección de acordes, estructura musical o transcripción, aprovechando que el modelo se ejecuta sin framework de deep learning completo.
- Aplicaciones de escritorio en Windows sin GPU NVIDIA: al compilar para el execution provider DirectML, el modelo puede integrarse en herramientas de edición de audio para consumidor que solo disponen de GPU integrada o AMD/Intel.
- Restauración y archivo: separar la música de grabaciones históricas con voz superpuesta para facilitar tareas de limpieza y documentación del fondo musical.
- Integración en pipelines de procesado por lotes: el hecho de que el grafo no incluya STFT/iSTFT permite al orquestador paralelizar el preprocesado y el overlap-add en CPU mientras la red se ejecuta en GPU.

## Benchmarks y rendimiento

Datos reportados en la model card del autor original para el stem instrumental, conjunto MVSEP Multisong:

| Metrica | Valor |
|---|---|
| SDR (instrum) | 17,4007 |
| Bleedless | 37,87 |
| Fullness | 38,03 |
| Aura MRSTFT | 22,82 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo conjunto, ni mediciones de latencia o throughput de esta conversión ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, los pesos fp16 del repositorio caben en 0,2 GB, pero los mapas de atención (62 bandas × 8 cabezas × 1876² puntuaciones) dominan el consumo si se materializan simultáneamente: en fp16 suponen del orden de 3,5 GB solo para las puntuaciones de un chunk completo. Cifra estimada a partir de la arquitectura declarada, no medida.
- GPU recomendadas: cualquiera con soporte DirectML (AMD, Intel, NVIDIA) o una GPU NVIDIA con CUDA si se reconstruye el grafo con un execution provider equivalente. No hay datos publicados de rendimiento por modelo de GPU.
- GPU de consumo: el modelo debería caber en tarjetas de 8 GB o más asumiendo la estimación anterior, pero no hay confirmación empírica en la información disponible.
- Despliegue: onnxruntime con execution provider DirectML o CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo). El autor advierte que la atención sin fusión es lenta en DirectML hasta que se haga una reconstrucción con atención fusionada.
- Latencia y throughput: no disponibles. El coste depende del número de chunks, del execution provider y de si el llamante paraleliza STFT/iSTFT.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de procesado | Rendimiento reportado | Licencia | Formato |
|---|---|---|---|---|---|
| kickvn/BS-Roformer-HyperACE-v2-inst-ONNX (este) | no disponible | chunk 960 000 muestras, n_fft 2048, hop 512 | SDR 17,4007 (MVSEP Multisong, instrum) | other (original sin licencia, base GPL-3.0) | ONNX fp16 |
| pcunwa/BS-Roformer-HyperACE (original) | no disponible | idéntica (mismo checkpoint) | mismas métricas declaradas | no declarada | checkpoint PyTorch (.ckpt) |
| anvuew/BS-RoFormer (base de los pesos) | no disponible | no disponible | no disponible en la información proporcionada | GPL-3.0 | no disponible |
| Music-Source-Separation-Training (ZFTurbo) | no aplica (framework) | no aplica | no aplica | MIT (código) | código Python |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Licencia incierta: el repositorio original no declara licencia y el autor indica que los pesos derivan de anvuew/BS-RoFormer (GPL-3.0). Cualquier uso comercial o redistribución debe aclararse antes con los autores; la etiqueta `other` no equivale a permiso de uso.
- Sin reentrenamiento: la conversión solo cambia precisión (fp16). Cualquier degradación numérica respecto al checkpoint original es atribuible exclusivamente a esa reducción de precisión.
- Un único stem: el modelo solo produce `instrument`. No sirve para separar voces, batería o bajo por separado.
- Artefactos en los bordes de chunk: el pipeline depende de un overlap-add con fundido de 1/10 de chunk; un solapamiento mal configurado o un hop distinto del indicado en `profile.json` produce discontinuidades audibles.
- Requisito de postprocesado manual: el grafo no incluye STFT/iSTFT ni overlap-add. Un error en el layout [frame][bin 1025][canal 2][re, im] o la omisión del zeroing de la componente DC deteriora la salida.
- Rendimiento: la atención implementada como MatMul/Softmax sin fusión es lenta en DirectML según el propio autor; no se han publicado cifras de latencia.
- Riesgo de sangrado residual (bleed) y de enmascaramiento de instrumentos con contenido espectral solapado con la voz; los valores de bleedless y fullness reportados son métricas objetivas, no una garantía perceptual.
- Sesgos: no se documentan sesgos sociales, pero al ser un modelo entrenado sobre música, su comportamiento puede degradarse en géneros, idiomas o grabaciones poco representadas en el dataset de entrenamiento (no detallado).
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia independiente de calidad ni de estabilidad en producción.
- No apto para texto: no genera lenguaje, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kickvn/BS-Roformer-HyperACE-v2-inst-ONNX
- Modelo base original: https://huggingface.co/pcunwa/BS-Roformer-HyperACE
- Modelo del que derivan los pesos: https://huggingface.co/anvuew/BS-RoFormer
- Paper de HyperACE: https://arxiv.org/abs/2506.17733
- Código de modelos MSST (ZFTurbo, MIT): https://github.com/ZFTurbo/Music-Source-Separation-Training
- Estudio autor de la conversión: https://studio.kick.vn
