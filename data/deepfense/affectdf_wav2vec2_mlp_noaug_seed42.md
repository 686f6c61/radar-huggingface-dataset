# DeepFense/AffectDF_Wav2Vec2_MLP_NoAug_Seed42

## Resumen

AffectDF_Wav2Vec2_MLP_NoAug_Seed42 es un detector binario de audio deepfake desarrollado por DeepFense, un proyecto de investigacion centrado en la deteccion de voz sintetica. El modelo combina un frontend congelado XLS-R-300M (familia wav2vec2 de fairseq) con un backend MLP ligero, y se ha entrenado especificamente sobre el split oficial de entrenamiento del dataset AffectDF. La etiqueta de salida es binaria: 0 = spoof (audio falso) y 1 = bonafide (audio autentico).

Se trata de una de las tres semillas publicadas (2, 42 y 240) del mismo recipe, no de un ensemble. El checkpoint se selecciono por EER de validacion (9,6273 %), y se evaluo sobre los conjuntos completos InTheWild (31.779 utterances) y ASV19 (71.237 utterances), obteniendo EER de 23,13 % y 32,78 % respectivamente con la metrica de diferencia de logits.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un detector con frontend SSL congelado y sin aumentacion de datos, util para investigadores que quieran comparar recetas de deteccion de deepfakes o reutilizar el pipeline DeepFense. No es un modelo de proposito general ni un clasificador de audio generico; es una pieza de investigacion con fines acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M (wav2vec2, congelado) + backend MLP con proyeccion [256, 128] y layer normalization |
| Parametros totales | no disponible (el frontend XLS-R-300M aporta ~300 M; el backend MLP es de baja capacidad) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio a 16 kHz con prefijo de 64.600 muestras (recorte o padding por repeticion) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para los pesos; el codigo DeepFense es Apache-2.0 y el dataset AffectDF conserva CC BY-NC 4.0 |
| Formato de pesos | checkpoint PyTorch `.pth` (diccionario DeepFense con `model_state`, estado del optimizador y metadatos), no compatible con `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. El frontend es XLS-R-300M de fairseq, un transformer wav2vec2 preentrenado sobre habla multilingue, que permanece completamente congelado durante el entrenamiento. Sobre sus representaciones se aplica un backend MLP con proyeccion a [256, 128] y layer normalization, que produce la clasificacion binaria. El audio se procesa a 16 kHz con un prefijo fijo de 64.600 muestras, aplicando recorte o padding por repeticion segun la duracion de la entrada.

El entrenamiento se realizo sobre el split oficial de train del dataset AffectDF, sin aumentacion de datos (de ahi el sufijo `NoAug`) y con seleccion de checkpoint por EER de validacion. La semilla es la 42. El checkpoint guardado incluye estado del optimizador y metadatos de entrenamiento, y la configuracion resuelta (`config.original.yaml`) se conserva como autoridad de la arquitectura. No se documenta en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo).

Una innovacion metodologica destacable es la separacion explicita de dos definiciones de score: el logit de bonafide usado por el framework actual y la diferencia de logits `logit_bonafide - logit_spoof`, que el estudio reporta por separado. La model card advierte que ambas definiciones de EER no deben mezclarse. Ademas, el autor senala que los modelos DeepFense publicados para ASV19 fine-tunean el frontend SSL y usan 64.000 muestras, por lo que las comparaciones son entre recetas entrenadas, no una ablacion controlada del congelado del frontend.

## Capacidades

- Clasificacion binaria de audio: distingue entre voz spoof (sintetica o manipulada) y bonafide (autentica).
- Deteccion de deepfakes de voz sobre audio en ingles a 16 kHz.
- Inferencia sobre utterances completas con preprocesado de prefijo fijo de 64.600 muestras.
- Evaluacion con dos scores: logit de bonafide y diferencia de logits.
- Integracion con el framework DeepFense para entrenamiento, test y evaluacion.
- No soporta tool calling, function calling, agentes, vision, audio generation ni razonamiento multi-paso; es un clasificador acotado.

## Casos de uso

- Investigacion en deteccion de deepfakes: el modelo sirve como baseline reproducible con frontend congelado para comparar recetas de entrenamiento (con y sin aumentacion, con y sin fine-tuning del SSL) sobre los mismos conjuntos de evaluacion.
- Auditoria de pipelines de verificacion de voz: se puede usar como componente de un sistema que marque utterances sospechosas antes de una revision humana, siempre que se acepte su EER de 23-33 % en dominios fuera de AffectDF.
- Reproduccion de experimentos: gracias a `config.original.yaml`, `provenance.json` y `SHA256SUMS`, permite replicar exactamente el entrenamiento y la evaluacion en un cluster con PyTorch 2.4.1+cu121.
- Estudio de calibracion de scores: la distincion entre logit de bonafide y diferencia de logits permite analizar como afecta la definicion del score a las curvas DET y al EER.
- Docencia y formacion: util para explicar el esquema frontend SSL congelado + backend ligero en cursos de seguridad de voz y forense de audio.
- Evaluacion comparativa de datasets: al estar entrenado solo en AffectDF, sirve para medir la brecha de dominio frente a InTheWild y ASV19 en estudios de generalizacion.
- Prototipado de filtros antispam en call centers: como capa de triaje de bajo coste computacional (el frontend esta congelado y el backend es un MLP), aunque con las cautelas de licencia y precision indicadas.

## Benchmarks y rendimiento

Resultados publicados para esta semilla (42):

| Conjunto de evaluacion | Utterances | EER diferencia de logits (%) | EER score del framework (%) |
|---|---:|---:|---:|
| Validacion (seleccion de checkpoint) | no disponible | 9,6273 | no disponible |
| InTheWild (test completo) | 31.779 | 23,1287 | 22,9085 |
| ASV19 (test completo) | 71.237 | 32,7822 | 33,6255 |

El EER se calcula con el punto DET mas cercano agrupando empates; puntuaciones mas altas indican mayor probabilidad de bonafide. `metrics.json` contiene hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, pero esos valores no se recogen en la informacion disponible. No se publican resultados de MMLU, HumanEval ni GSM8K porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,3 GB, lo que incluye pesos del frontend XLS-R-300M y estado del optimizador; la inferencia en precision original requiere del orden de 2-3 GB de VRAM, aunque no se dispone de una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; el entorno evaluado uso un cluster con PyTorch 2.4.1+cu121 (modelo de GPU no especificado).
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, al ser un frontend congelado de ~300 M y un MLP pequeno.
- Opciones de despliegue: el modelo no es compatible con `from_pretrained` de Transformers; requiere el codigo de DeepFense en el commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf` y el inicializador original XLS-R-300M. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AffectDF_Wav2Vec2_MLP_NoAug_Seed42 (este) | ~300 M frontend + MLP | audio 16 kHz, prefijo 64.600 muestras | 23,13 % (ITW), 32,78 % (ASV19) | no disponible | Hugging Face, 0 descargas |
| Modelos DeepFense publicados para ASV19 | no disponible | audio 16 kHz, 64.000 muestras, frontend fine-tuneado | no disponible en esta ficha | no disponible | Hugging Face (proyecto DeepFense) |
| Alternativas genericas de deteccion de deepfake (AASIST y similares) | no disponible | audio | no disponible | no disponible | no disponible |

La comparacion directa con los modelos DeepFense de ASV19 no es limpia: aquellos fine-tunean el frontend SSL y usan 64.000 muestras, mientras que este mantiene el frontend congelado y usa 64.600. El propio autor advierte que se trata de una comparacion entre recetas, no de una ablacion controlada.

## Limitaciones y advertencias

- El EER en dominios fuera de AffectDF es alto (23,13 % en InTheWild y 32,78 % en ASV19), lo que limita su uso en produccion sin recalibracion o fine-tuning.
- Entrenado unicamente en el split de train de AffectDF y sin aumentacion de datos; la generalizacion a otros corpus, idiomas o condiciones acusticas no esta caracterizada.
- Solo soporta ingles; no se documenta comportamiento en otras lenguas.
- Riesgo de alucinacion no aplica como tal, pero si de falsos positivos y falsos negativos en la clasificacion, con impacto directo en sistemas de verificacion.
- La licencia de los pesos no esta disponible; el codigo DeepFense es Apache-2.0 y el dataset AffectDF conserva CC BY-NC 4.0, lo que restringe el uso comercial del dataset y, por extension, plantea dudas sobre el uso comercial del modelo entrenado con el.
- El checkpoint no es un modelo de Transformers: requiere el framework DeepFense, el inicializador original XLS-R-300M y edicion manual de rutas en el YAML antes de ejecutar.
- Las dos definiciones de EER (logit de bonafide vs. diferencia de logits) no deben mezclarse; mezclarlas invalida comparaciones.
- No es un ensemble: los resultados corresponden solo a la semilla 42 y no se agrupan con las semillas 2 y 240.
- El uso previsto es exclusivamente investigacion en deteccion de deepfakes de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/AffectDF_Wav2Vec2_MLP_NoAug_Seed42
- Dataset AffectDF: https://huggingface.co/datasets/DeepFense/AffectDF
- Repositorio DeepFense: https://github.com/Yaselley/deepfense-framework
- Commit de referencia del framework: `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
