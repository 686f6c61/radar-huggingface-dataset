# blaze-voice-ai/en-pronounce-score

## Resumen

Blaze English Pronunciation Scorer (GOP) es un sistema de evaluacion de pronunciacion en ingles desarrollado por blaze-voice-ai. Se trata de un empaquetado del checkpoint de reconocimiento fonetico `facebook/wav2vec2-lv-60-espeak-cv-ft` (Apache-2.0) al que se anaden componentes propios: un grafo ONNX exportado para inferencia optimizada, un calibrador entrenado por Blaze (GradientBoostingRegressor) y utilidades de despliegue con TensorRT. El modelo recibe una grabacion de 16 kHz mono de una palabra o frase objetivo conocida y devuelve una puntuacion de 0 a 100, junto con un desglose por fonema.

El problema que resuelve es la evaluacion automatica de pronunciacion (CAPT, Computer-Assisted Pronunciation Training) mediante Goodness of Pronunciation (GOP). A diferencia de un ASR convencional, el modelo emite una secuencia de fonemas en IPA de espeak en lugar de palabras, lo que permite alinear la produccion del hablante con la transcripcion esperada y calcular puntuaciones de calidad fonetica. El calibrador combina caracteristicas de GOP con rasgos de fluidez y prosodia (velocidad de habla, pausas, tono, energia) para producir una puntuacion final correlacionada con la evaluacion de expertos humanos.

Su relevancia actual radica en que ofrece un pipeline completo y reproducible para scoring de pronunciacion, con un rendimiento declarado de Pearson r = 0.68 frente a expertos humanos en Speechocean762 (frente a r = 0.58 del GOP bruto), licencia permisiva y opciones de despliegue en produccion (ONNX, TensorRT FP16). El modelo base es un transformer wav2vec2 de aproximadamente 300 millones de parametros, y el repo ocupa 2.5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional + self-attention) con cabeza CTC fonetica |
| Parametros totales | no disponible (modelo base wav2vec2 de ~300 M, cifra exacta no confirmada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 2 s por defecto en el perfil TensorRT; tiempo dinamico en ONNX) |
| Tipos de cuantizacion | FP32 (PyTorch/ONNX); FP16 en TensorRT; cuantizacion del checkpoint base indicada en tags (`quantized`) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `pytorch_model.bin` (PyTorch), `wav2vec2.onnx` (ONNX opset 17), motor TensorRT `.plan` generado localmente |

## Arquitectura y entrenamiento

El componente acustico es `facebook/wav2vec2-lv-60-espeak-cv-ft`, un wav2vec2 preentrenado de forma autosupervisada y afinado con CTC sobre fonemas en IPA de espeak (392 clases de salida, segun la dimension de logits `[B, T', 392]`). El modelo procesa audio a 16 kHz mono y emite secuencias de fonemas, no palabras. Sobre esta base, Blaze anade un calibrador `GradientBoostingRegressor` entrenado con caracteristicas de GOP y prosodia para mapear a una puntuacion de 0 a 100.

Las caracteristicas de entrada del calibrador, en el orden definido en `calibrator.meta.json`, son: `speech_rate_pps`, `pause_count`, `pause_ratio`, `pitch_mean_hz`, `pitch_std_hz`, `energy_std`, `completeness`, `mean_gop`, `min_gop` y `std_gop`. El objetivo de entrenamiento es la precision a nivel de frase de expertos en Speechocean762 (escala 0-10, reescalada a 0-100). No se especifica en la informacion disponible el volumen de datos de entrenamiento del calibrador ni la composicion exacta del dataset, mas alla de la evaluacion sobre 2500 utterances held-out de Speechocean762. El grafo ONNX se exporta con ejes dinamicos en batch y tiempo, y se recomienda construir el motor TensorRT en la maquina destino porque los engines son especificos de la arquitectura GPU.

## Capacidades

- Puntuacion de pronunciacion de 0 a 100 para una palabra o frase objetivo conocida, con desglose por fonema.
- Reconocimiento fonetico (CTC) con etiquetas IPA de espeak, no transcripcion ortografica.
- Calculo de metricas GOP (mean, min, std) y rasgos de fluidez y prosodia (velocidad, pausas, tono, energia, completitud).
- Inferencia por lotes con batch y tiempo dinamicos en ONNX.
- Despliegue optimizado en GPU mediante TensorRT FP16 con micro-batching dinamico.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo acustico de scoring, no un LLM.
- Capacidad multilingue limitada al ingles (el checkpoint base soporta otros idiomas, pero este empaquetado esta orientado a `en`).
- No incluye vision, audio generativo ni modo thinking.

## Casos de uso

- Evaluacion de pronunciacion en apps de aprendizaje de ingles: el modelo recibe la grabacion del alumno y la frase objetivo, y devuelve una puntuacion 0-100 con feedback por fonema, adecuado para ejercicios de repeticion con correccion inmediata.
- Deteccion de fonemas problematicos en estudiantes: el desglose por fonema permite identificar sustituciones y omisiones concretas (por ejemplo, confusiones de vocales o consonantes finales) y generar planes de practica personalizados.
- Triaje automatico en academias o examenes de speaking: la puntuacion calibrada contra expertos (r = 0.68) permite prefiltrar grabaciones y reservar la evaluacion humana para los casos dudosos, reduciendo coste de revision.
- Analisis de fluidez y prosodia: las caracteristicas de velocidad de habla, ratio de pausas, variabilidad de tono y energia permiten detectar problemas de ritmo o entonacion mas alla de la articulacion segmental.
- Investigacion en CAPT y fonetica computacional: el pipeline GOP con calibrador reproducible y licencia Apache-2.0 sirve como linea base para experimentos de scoring y comparacion de metricas.
- Despliegue en produccion de bajo coste: el grafo ONNX y el motor TensorRT FP16 con micro-batching permiten servir un endpoint `/score` en GPU consumer o de datacenter con latencia controlada para audio de hasta 2 s por defecto.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Pearson r vs expertos (Speechocean762, 2500 utterances held-out) | 0.68 | GOP bruto: 0.58 |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo acustico de scoring y no de un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base wav2vec2 (~300 M parametros) en FP32 ocupa aproximadamente 1.2 GB de pesos, y en FP16 alrededor de 0.6 GB, mas memoria de activaciones segun batch y duracion del audio.
- GPU recomendadas: cualquier GPU CUDA compatible con TensorRT para el despliegue optimizado; el repo no especifica modelos concretos (A100, H100, RTX 4090 u otros).
- Cabe en GPU consumer: si, dado el tamano del modelo base, aunque la cifra exacta de VRAM no esta confirmada en la informacion.
- Opciones de despliegue: PyTorch con `transformers` (`Wav2Vec2ForCTC` + `Wav2Vec2Processor`), ONNX Runtime (opset 17), TensorRT mediante `deploy_trt.sh` o `build_trt.py`. El repo no menciona integracion con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el perfil TensorRT por defecto usa batch 1..16 y tiempo 1600..3200 muestras (2 s), con punto optimo en 0.5 s.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/audio | Licencia | Notas |
|---|---|---|---|---|---|
| blaze-voice-ai/en-pronounce-score | Wav2Vec2 + calibrador GOP | ~300 M (base) | 2 s por defecto (dinamico) | Apache-2.0 | Scoring 0-100 calibrado, r = 0.68 |
| facebook/wav2vec2-lv-60-espeak-cv-ft | Wav2Vec2 CTC fonetico | ~300 M | no disponible | Apache-2.0 | Modelo base; emite fonemas sin calibrador |
| Alternativas comerciales de scoring de pronunciacion (p. ej. APIs de Speechace, ELSA) | Propietario | no disponible | no disponible | Propietaria | No comparable en parametros ni pesos |

No se dispone en la informacion proporcionada de otros modelos open source de scoring GOP directamente comparables con cifras de rendimiento verificables.

## Limitaciones y advertencias

- Requiere conocer de antemano la palabra o frase objetivo; no evalua habla libre sin transcripcion de referencia.
- El modelo acustico emite fonemas IPA, no palabras: cualquier uso como ASR convencional requiere un paso adicional de conversion.
- Solo soporta ingles en este empaquetado; el checkpoint base multilingue no se ha reentrenado para otros idiomas aqui.
- La correlacion con expertos es moderada (r = 0.68); no sustituye una evaluacion humana en contextos de alta exigencia (certificaciones, examenes oficiales).
- Riesgo de sesgo hacia acentos y variedades no representadas en Speechocean762 (dataset con sesgo conocido hacia hablantes no nativos de determinados origenes); no se documentan analisis de sesgo en la informacion.
- El calibrador depende de caracteristicas de prosodia que pueden ser sensibles a ruido, microfonos y condiciones de grabacion.
- Los engines TensorRT son especificos de la arquitectura GPU y la version de TensorRT; deben reconstruirse al cambiar de hardware.
- Licencia Apache-2.0 permite uso comercial, pero se debe citar el paper de Xu, Baevski y Auli (2021) al usar el modelo acustico.
- El repo no incluye un `.plan` de TensorRT precompilado; hay que generarlo en destino.

## Enlaces

- Hugging Face: https://huggingface.co/blaze-voice-ai/en-pronounce-score
- Modelo base: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Paper del modelo acustico (Xu, Baevski, Auli 2021): https://arxiv.org/abs/2109.11680
