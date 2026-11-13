# DeepFense/AffectDF_Wav2Vec2_AASIST_NoAug_Seed240

## Resumen

AffectDF_Wav2Vec2_AASIST_NoAug_Seed240 es un detector binario de audio deepfake desarrollado por DeepFense, un proyecto de investigacion centrado en la deteccion de voz sintetica. El modelo combina un frontend congelado XLS-R-300M (familia wav2vec2 de fairseq) con un backend AASIST basado en graph attention, y se entrena sobre el split oficial de entrenamiento del dataset AffectDF. Su proposito es clasificar utterances de audio como bonafide (voz real) o spoof (voz generada o manipulada), un problema central en la verificacion de locutores y la seguridad de sistemas de voz.

Se trata de una de las tres semillas publicadas (2, 42 y 240) del mismo recipe, no de un ensemble. El checkpoint se selecciona por EER de validacion (3,1672 % en esta semilla) y se evalua sobre los conjuntos completos InTheWild y ASV19. El modelo opera con audio a 16 kHz, recorte o repeticion de prefijo a 64.600 muestras y sin aumento de datos durante el entrenamiento. La relevancia actual reside en que ofrece un punto de referencia reproducible y con provenance verificable para la investigacion en anti-spoofing, aunque sus tasas de error en dominios cruzados son altas.

El repositorio ocupa 1,3 GB y contiene el checkpoint en formato PyTorch (`.pth`), no en safetensors ni GGUF, y no es cargable mediante `from_pretrained` de Transformers. La licencia de los pesos no esta declarada explicitamente; el codigo fuente de DeepFense es Apache-2.0 y el dataset de entrenamiento conserva terminos CC BY-NC 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M congelado (wav2vec2, fairseq) + backend AASIST con graph attention |
| Parametros totales | no disponible (frontend XLS-R-300M mas backend AASIST; cifra conjunta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64.600 muestras de audio a 16 kHz (aprox. 4,04 s por utterance, con recorte o repeticion de prefijo) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision de entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para los pesos; codigo DeepFense Apache-2.0; dataset AffectDF CC BY-NC 4.0 |
| Formato de pesos | PyTorch `.pth` (diccionario DeepFense con `model_state`, estado del optimizador y metadatos) |

## Arquitectura y entrenamiento

El modelo sigue un diseno de dos etapas. El frontend es XLS-R-300M de fairseq, un transformer convolucional auto-supervisado para representaciones de voz, que permanece congelado durante todo el entrenamiento. El backend es AASIST, una red de graph attention especializada en anti-spoofing que opera sobre las representaciones del frontend. La configuracion guardada en el checkpoint es la autoridad arquitectonica; los experimentos con MLP usan proyeccion [256, 128] con layer normalization, pero este checkpoint emplea el backend AASIST original. Las etiquetas son 0 = spoof y 1 = bonafide.

El entrenamiento se realiza exclusivamente sobre el split oficial de AffectDF, sin aumento de datos, con audio a 16 kHz y un prefijo fijo de 64.600 muestras (recorte si el audio es mas largo, repeticion si es mas corto). La seleccion del checkpoint se hace por EER de validacion. El modelo se evaluo con PyTorch 2.4.1+cu121 sobre el codigo DeepFense en el commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`. Es importante senalar que los modelos DeepFense publicados para ASV19 ajustan finamente el frontend SSL y usan 64.000 muestras, por lo que las comparaciones con ellos reflejan diferencias de recipe, no una ablacion controlada del congelado del frontend.

## Capacidades

- Clasificacion binaria de audio como bonafide o spoof (deteccion de deepfake de voz).
- Procesamiento de audio mono a 16 kHz con normalizacion de longitud a 64.600 muestras.
- Deteccion sobre utterances individuales; no es un modelo generativo ni conversacional.
- Evaluacion en dominios cruzados: InTheWild y ASV19 como conjuntos objetivo held-out.
- Puntuacion mediante logit de bonafide (score actual del framework) o diferencia de logits (`logit_bonafide - logit_spoof`); ambas definiciones de EER no deben mezclarse.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion en anti-spoofing: servir como punto de referencia reproducible (semilla 240) para comparar recipes de deteccion con frontend congelado frente a frontends ajustados finamente.
- Auditoria de pipelines de verificacion de locutor: integrar el detector como etapa previa que marque utterances sospechosas antes de la verificacion biometrica, usando el score de logit de bonafide.
- Deteccion de voz sintetica en contenido multimedia: analizar clips de hasta ~4 s para identificar audio generado por TTS o voice conversion en flujos de moderacion.
- Estudios de robustez y generalizacion: evaluar el comportamiento en dominios cruzados (InTheWild, ASV19) y analizar la brecha entre validacion (3,17 % EER) y test (25,99 % y 40,27 % EER) como caso de estudio de sobreajuste al dominio.
- Reproducibilidad de experimentos: el repositorio incluye `provenance.json`, `SHA256SUMS`, `config.original.yaml` y `metrics.json`, lo que permite replicar exactamente la evaluacion con el framework DeepFense.
- Formacion y docencia: ejemplo didactico de arquitectura frontend-backend con frontend SSL congelado y backend de graph attention para tareas de clasificacion de audio.
- Baseline en competiciones o retos de deteccion de deepfake: punto de partida para comparar mejoras de aumento de datos, fine-tuning del frontend o ensembles multi-semilla.

## Benchmarks y rendimiento

Resultados publicados para esta semilla (240) en la model card:

| Conjunto objetivo held-out | Utterances | EER logit difference (%) | EER score actual del framework (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 25,9891 | 25,9320 |
| ASV19 | 71.237 | 40,2723 | 40,0524 |

Mejor EER de validacion (seleccion de checkpoint, no test): 3,1672 %. El EER se calcula con el punto DET agrupado por empates mas cercano; puntuaciones mas altas indican mayor probabilidad de bonafide. `metrics.json` contiene hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1. La model card no publica comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 1,3 GB e incluye el checkpoint con estado del optimizador, por lo que la inferencia requiere cargar el frontend XLS-R-300M (~300 M parametros) mas el backend AASIST.
- GPU recomendadas: no especificadas en la informacion disponible; el entorno evaluado uso CUDA 12.1 (PyTorch 2.4.1+cu121), lo que implica GPU NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada; por tamano del frontend (300 M parametros) es plausible en GPUs con suficiente VRAM, pero no hay datos publicados.
- Despliegue: exclusivamente mediante el framework DeepFense (repositorio `Yaselley/deepfense-framework`, commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con `from_pretrained` de Transformers.
- Requisito adicional: es necesario descargar el inicializador original XLS-R-300M y editar `model.frontend.args.ckpt_path` en el YAML portable antes de ejecutar `test.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AffectDF_Wav2Vec2_AASIST_NoAug_Seed240 (este) | XLS-R-300M + AASIST (cifra conjunta no publicada) | 64.600 muestras (16 kHz) | Frontend SSL congelado + AASIST, sin aumento | Pesos: no disponible; codigo Apache-2.0 | Hugging Face (repo 1,3 GB) |
| Modelos DeepFense publicados para ASV19 | no disponible | 64.000 muestras | Frontend SSL con fine-tuning | no disponible | Hugging Face (familia DeepFense) |
| Otras semillas del mismo recipe (2, 42) | Identicos | 64.600 muestras | Mismo recipe, distinta semilla | no disponible | Hugging Face (familia DeepFense) |

La model card advierte que la comparacion con los modelos ASV19 de DeepFense no constituye una ablacion controlada del congelado del frontend, ya que difieren tanto en el ajuste del frontend como en la longitud de audio. No se dispone de datos de benchmarks de terceros para una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- Generalizacion limitada en dominio cruzado: el EER de validacion (3,17 %) contrasta fuertemente con los resultados en InTheWild (25,99 %) y ASV19 (40,27 %), lo que indica sobreajuste al dominio de entrenamiento AffectDF.
- El EER de validacion es un criterio de seleccion de checkpoint, no una medida de rendimiento en test; no debe citarse como resultado final.
- Solo se publica una semilla por checkpoint; no se agregan puntuaciones entre semillas, y este modelo no es un ensemble.
- Las dos definiciones de EER (logit de bonafide del framework frente a diferencia de logits) no son intercambiables; mezclarlas invalida las comparaciones.
- Idioma limitado al ingles; el comportamiento en otros idiomas no esta documentado.
- Licencia de los pesos no declarada: la model card no infiere una licencia de pesos a partir de la licencia Apache-2.0 del codigo. El dataset AffectDF conserva terminos CC BY-NC 4.0, lo que restringe el uso comercial de los datos de entrenamiento.
- Uso previsto exclusivamente para investigacion en deteccion de audio deepfake; no se documenta su validacion para produccion.
- Riesgo de alucinacion no aplica (modelo discriminativo), pero si existe riesgo de falsos positivos y falsos negativos en audio fuera de dominio.
- Dependencia estricta del framework DeepFense y de rutas locales editadas manualmente; no es un modelo portable estandar de Transformers.
- La carga estricta de estado es obligatoria en evaluadores personalizados; todos los parametros de inferencia se cargaron estrictamente para los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/AffectDF_Wav2Vec2_AASIST_NoAug_Seed240
- Dataset AffectDF: https://huggingface.co/datasets/DeepFense/AffectDF
- Codigo del framework DeepFense: https://github.com/Yaselley/deepfense-framework (commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`)
- Paper de AASIST: no disponible en la informacion proporcionada
- Paper de XLS-R: no disponible en la informacion proporcionada
- Demos: no disponibles
