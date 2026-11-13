# DeepFense/EmoFake_Wav2Vec2_MLP_NoAug_Seed2

## Resumen

EmoFake_Wav2Vec2_MLP_NoAug_Seed2 es un detector binario de deepfakes de audio desarrollado por DeepFense, un proyecto de investigacion centrado en la deteccion de voz sintetica. El modelo combina un frontend congelado XLS-R-300M (wav2vec2 de fairseq) con un backend MLP entrenado sobre el split oficial de entrenamiento del dataset EmoFake. Su proposito es clasificar una locucion como autentica (bonafide) o falsa (spoof), un problema relevante para la verificacion de identidad, la moderacion de contenido y la investigacion forense de audio.

El modelo forma parte de una familia de tres semillas (2, 42 y 240) entrenadas de forma independiente; este checkpoint corresponde a la semilla 2 y no es un ensemble. La seleccion del checkpoint se realizo por EER de validacion, y se publican resultados completos sobre los conjuntos de test InTheWild y ASV19. El repositorio ocupa 1.3 GB y se distribuye como checkpoint de PyTorch del framework DeepFense, no como modelo `from_pretrained` de Transformers.

La relevancia actual del modelo reside en su enfoque de frontend congelado: en lugar de afinar el codificador SSL, mantiene XLS-R-300M intacto y entrena solo el cabezal MLP, lo que reduce el coste de entrenamiento y permite estudiar el comportamiento del detector con un extractor de caracteristicas fijo. Los resultados publicados, sin embargo, muestran un rendimiento modesto en dominios cruzados, con EER en torno al 26-28 % en los conjuntos de test, lo que lo situa como una pieza de investigacion mas que como un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend wav2vec2 XLS-R-300M congelado + backend MLP con proyeccion [256, 128] y layer normalization |
| Parametros totales | no disponible (el frontend XLS-R-300M aporta aproximadamente 300 M; el total exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio fija de 64.600 muestras a 16 kHz (aproximadamente 4,04 s), con recorte de prefijo y padding por repeticion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible (la model card no infiere licencia de pesos a partir de la licencia Apache-2.0 del codigo fuente) |
| Formato de pesos | `best_model.pth` (diccionario DeepFense con `model_state`, estado del optimizador y metadatos de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. El frontend es XLS-R-300M de fairseq, un transformer wav2vec2 preentrenado para representaciones de voz multilingues, que se mantiene congelado durante todo el entrenamiento. La entrada de audio se estandariza a 16 kHz y se procesa con un prefijo de 64.600 muestras, aplicando recorte o padding por repeticion segun la duracion de la locucion. El backend es una MLP con proyeccion [256, 128] y layer normalization que produce dos logits, correspondientes a las clases 0=spoof y 1=bonafide. El modelo se entreno sin aumentacion de datos (NoAug en el nombre del checkpoint).

El entrenamiento se realizo sobre el split oficial de entrenamiento del dataset EmoFake, con seleccion de checkpoint mediante EER de validacion. La configuracion resuelta se conserva en `config.original.yaml`, y se incluye una version portable `config.yaml` con rutas relativas. El checkpoint contiene tanto el frontend aprendido como el backend, pero la construccion del modelo requiere el inicializador original XLS-R-300M como `ckpt_path`; una vez construido, los pesos guardados se restauran desde `best_model.pth`. El framework recomienda carga estricta del state dict para cualquier evaluador personalizado.

Una innovacion metodologica destacable es la separacion explicita entre dos definiciones de score: el logit bonafide usado por el framework actual (CrossEntropy) y la diferencia de logits `logit_bonafide - logit_spoof` reportada en el estudio. La model card advierte que ambas definiciones de EER no deben mezclarse, un detalle relevante para reproducir los resultados. Tambien se documenta que los modelos DeepFense publicados para ASV19 afinan el frontend SSL y usan 64.000 muestras, por lo que las comparaciones con este checkpoint congelado de 64.600 muestras no constituyen una ablacion controlada del congelamiento del frontend.

## Capacidades

- Clasificacion binaria de audio como spoof o bonafide, orientada a la deteccion de deepfakes de voz.
- Procesamiento de audio a 16 kHz con ventana fija de 64.600 muestras y manejo de locuciones mas cortas o mas largas mediante recorte de prefijo o padding por repeticion.
- Soporte de dos idiomas declarados: ingles y chino.
- Extraccion de representaciones mediante XLS-R-300M congelado, lo que permite reutilizar el frontend sin reentrenamiento.
- Salida de logits por clase, con dos scores documentados (logit bonafide y diferencia de logits) para el calculo de EER.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modos de razonamiento extendido; es exclusivamente un clasificador de audio.

## Casos de uso

- Investigacion en deteccion de deepfakes: el modelo sirve como linea base reproducible para estudiar el efecto de congelar el frontend SSL, comparando su EER con variantes que afinan XLS-R.
- Verificacion de autenticidad en pipelines de identificacion de voz: puede integrarse como filtro previo que marque locuciones sospechosas antes de un sistema de reconocimiento de hablante, aunque su EER del 26-28 % en dominios cruzados limita su uso como unico mecanismo de decision.
- Moderacion de contenido audiovisual: clasificacion de clips cortos en ingles o chino para detectar voz sintetica en plataformas, con revision humana posterior dado el nivel de falsos positivos y negativos.
- Analisis forense de audio: apoyo a peritos que necesiten una senal adicional de sospecha sobre grabaciones, siempre acompanada de otros metodos y de la documentacion del protocolo de evaluacion.
- Benchmarking de frameworks: el checkpoint y su configuracion portable permiten reproducir el pipeline de DeepFense en entornos de investigacion y comparar implementaciones de evaluacion (logit bonafide frente a diferencia de logits).
- Estudio de robustez entre dominios: los resultados completos sobre InTheWild (31.779 locuciones) y ASV19 (71.237 locuciones) permiten analizar la degradacion del detector cuando cambia la distribucion de test respecto al entrenamiento.
- Desarrollo de cabezales alternativos: al mantener el frontend congelado, el modelo facilita experimentos que sustituyan la MLP por otros backends (por ejemplo, AASIST con graph attention) sobre las mismas representaciones.

## Benchmarks y rendimiento

Resultados publicados para esta semilla (seed 2) sobre los conjuntos de test completos, sin reentrenamiento ni submuestreo:

| Conjunto de test | Locuciones | EER con diferencia de logits (%) | EER con score del framework actual (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 28,4847 | 28,6570 |
| ASV19 | 71.237 | 28,0610 | 26,5681 |

El EER de validacion usado para seleccionar el checkpoint fue 0,0000 %, pero la model card aclara explicitamente que ese valor corresponde a la seleccion de checkpoint y no al rendimiento en el split de test. El archivo `metrics.json` contiene ademas hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, no reproducidos en la model card. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el frontend XLS-R-300M congelado y el repositorio de 1.3 GB sugieren un consumo moderado, pero no se publican cifras.
- GPU recomendadas: no disponible. El entorno de evaluacion del cluster uso PyTorch 2.4.1+cu121, lo que implica GPU NVIDIA con CUDA 12.1.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del frontend (aproximadamente 300 M de parametros) es compatible en principio con GPUs de consumo de gama alta, pero no hay datos publicados de VRAM ni de latencia.
- Opciones de despliegue: el modelo no es un `from_pretrained` de Transformers. Requiere el codigo fuente de DeepFense en el commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`, el inicializador original XLS-R-300M y la ejecucion de `test.py` con la configuracion y el checkpoint. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmoFake_Wav2Vec2_MLP_NoAug_Seed2 (este) | Frontend XLS-R-300M + MLP (total no disponible) | Audio fijo de 64.600 muestras a 16 kHz | EER 26,57-28,66 % en InTheWild y ASV19 | no disponible | Hugging Face, requiere framework DeepFense |
| Modelos DeepFense publicados para ASV19 | no disponible | 64.000 muestras, frontend SSL afinado | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| Variantes DeepFense con backend AASIST | no disponible | misma entrada de audio | no disponible en la informacion proporcionada | no disponible | Hugging Face |

La model card advierte que la comparacion con los modelos DeepFense de ASV19 no es una ablacion controlada, ya que difieren tanto en el afinado del frontend como en la longitud de entrada. No se dispone de datos de otros detectores de deepfakes de audio en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento limitado en dominios cruzados: EER en torno al 26-28 % en InTheWild y ASV19, lo que implica una tasa de error alta para uso en produccion sin supervision humana.
- El EER de validacion de 0,0000 % no debe interpretarse como rendimiento real; es un criterio de seleccion de checkpoint y puede indicar sobreajuste al split de validacion.
- Solo se declaran los idiomas ingles y chino; el comportamiento en otros idiomas no esta documentado.
- Entrada de audio fija de 64.600 muestras con recorte de prefijo y padding por repeticion, lo que puede descartar informacion en locuciones largas y distorsionar la senal en locuciones cortas.
- Dos definiciones de score incompatibles (logit bonafide frente a diferencia de logits) que no deben mezclarse al calcular o comparar EER.
- Licencia de pesos no disponible; la licencia Apache-2.0 del codigo fuente no se extrapola a los pesos. El dataset EmoFake conserva terminos CC BY-NC-ND 4.0, lo que restringe el uso comercial de los datos de entrenamiento.
- Uso previsto exclusivamente para investigacion en deteccion de deepfakes de audio.
- Riesgo de sesgos y de alucinacion en el sentido de clasificaciones erroneas confiadas: no se documentan analisis de sesgo por acento, genero o canal de grabacion.
- Dependencia estricta del framework DeepFense y de un commit concreto, con necesidad de editar rutas y disponer del inicializador original XLS-R-300M; no es un modelo portable a otros ecosistemas sin trabajo adicional.
- No se publican datos de cuantizacion, VRAM ni latencia, lo que dificulta planificar despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/EmoFake_Wav2Vec2_MLP_NoAug_Seed2
- Dataset EmoFake: https://huggingface.co/datasets/DeepFense/EmoFake
- Codigo fuente de DeepFense: https://github.com/Yaselley/deepfense-framework
- Commit de referencia del framework: `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`
