# humair025/kikiri-tts-urdu-pipeline-v2_FIXED

## Resumen

`humair025/kikiri-tts-urdu-pipeline-v2_FIXED` no es un modelo con pesos publicados, sino un fork correctivo del pipeline de entrenamiento de un sistema de síntesis de voz (TTS) basado en StyleTTS2, orientado a urdu segun el nombre del repositorio. El repositorio ocupa 0.0 GB, es decir, contiene unicamente codigo y documentacion (en concreto `pipeline/train_real_styletts2.py` y `CHANGES.md`), sin checkpoints ni tensores. Su autoria es de `humair025` y se distribuye bajo licencia MIT.

El problema que resuelve es muy concreto: la version anterior (`kikiri-tts-urdu-pipeline-v2_OLD`) generaba imagenes de mel completamente negras en TensorBoard y audio reconstruido con un tono constante tipo "hoooo". La causa raiz era una mascara de texto invertida (`text_mask = ~phoneme_mask`) que ponia a cero los embeddings de fonemas reales, colapsando la salida de la cabeza de prediccion de mel hacia su sesgo. Este fork corrige ese error critico y otros cuatro de menor severidad.

Su relevancia ahora es acotada pero real: sirve como referencia de depuracion para cualquiera que entrene StyleTTS2 o Kokoro desde cero y se encuentre con el mismo sintoma, y como punto de partida limpio para reentrenar un TTS en urdu. No obstante, al no publicar pesos ni resultados de evaluacion, no es utilizable directamente en inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (no autorregresiva, con encoder de texto/fonemas, encoder de estilo, extractor de pitch y decoder con difusion); el repositorio contiene el pipeline de entrenamiento, no los pesos |
| Parametros totales | no disponible (el repositorio no incluye pesos; tamano declarado de 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (en TTS la longitud viene limitada por la secuencia de fonemas de entrada, no por una ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no especificado en la model card; el nombre del repositorio indica urdu |
| Licencia | MIT (heredada del proyecto upstream) |
| Formato de pesos | no disponible (no se publican pesos; solo scripts en Python y documentacion) |

## Arquitectura y entrenamiento

La arquitectura subyacente es StyleTTS2, un sistema TTS no autorregresivo que combina un encoder de texto sobre embeddings de fonemas con mascara de padding, un encoder de estilo que produce un vector de estilo a partir de una muestra de referencia, un extractor de pitch (F0) y una cabeza de prediccion de mel (`mel_pred_head`) seguida de un decoder. El pipeline reutiliza componentes preentrenados de Kokoro/StyleTTS2, en particular el `style_encoder` y el `pitch_extractor`, lo que impone que las entradas de mel esten dentro de la distribucion esperada por esos modulos.

El script de entrenamiento es `pipeline/train_real_styletts2.py` y se invoca con `python3 -m pipeline.train_real_styletts2`, aceptando parametros como `--hf_repo`, `--hf_token`, `--n_samples` (5000 en el ejemplo), `--n_steps` (5000), `--batch_size` (4), `--n_audio_samples` (10) y `--audio_log_freq` (50). El fork corrige cinco fallos: (1) mascara de texto invertida, critico; (2) mel logaritmico pasado a `InverseMelScale`, que espera mel lineal, corregido con `exp(_log_mel * MEL_STD + MEL_MEAN)` antes de `inv_mel_t`; (3) ausencia de normalizacion del mel con media -4 y desviacion 4 en todos los puntos donde se calcula `gt_mel_log`; (4) falta de normalizacion min-max antes de `add_image` para las imagenes de mel ground truth y predicho; y (5) desalineacion de F0/N respecto a la ventana de mel cuando se usa `--include_decoder`, porque la ventana usaba `rs=0` en vez del `random_start` real. No se proporciona informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Entrenamiento de un modelo TTS estilo StyleTTS2 sobre datos de audio; el repositorio aporta el bucle de entrenamiento, no un modelo entrenado.
- Registro de diagnostico en TensorBoard: imagenes de mel predicho frente a ground truth y muestras de audio reconstruido (`audio/sample_NN_reconstructed`).
- Correccion verificable de cinco errores del pipeline original, documentados en `CHANGES.md`, lo que permite auditar el comportamiento esperado tras el arreglo.
- Reanudacion controlada desde cero: segun el autor, en 50-100 pasos deberia observarse mel estructurado y habla aproximada.
- Inferencia: no disponible. Al no publicarse pesos, no hay capacidades de generacion, tool calling, agentes, vision, audio o modo de razonamiento verificables para este repositorio.
- Capacidades multilingues: no disponibles; el unico indicio es el sufijo "urdu" del nombre del repositorio.

## Casos de uso

- Reentrenamiento de un TTS en urdu desde cero: el pipeline permite lanzar un entrenamiento limpio con `--n_steps` y `--batch_size` configurables, evitando partir del checkpoint corrupto del repositorio anterior y obteniendo un mel estructurado en pocas decenas de pasos.
- Depuracion de fallos identicos en otros forks: si un entrenamiento de StyleTTS2 produce imagenes de mel negras y audio tonal constante, este repositorio actua como referencia directa para localizar la mascara de texto invertida y el mel logaritmico mal normalizado.
- Auditoria de pipelines de TTS en entornos de investigacion: `CHANGES.md` documenta cada fallo con su severidad y su correccion, lo que facilita revisiones de codigo y controles de calidad antes de gastar horas de GPU.
- Base para adaptacion a idiomas de bajos recursos: la estructura del pipeline es independiente del idioma de destino; cambiando el corpus de audio y la tokenizacion fonetica se puede reutilizar para otras lenguas con poca disponibilidad de datos.
- Docencia y formacion tecnica: el caso ilustra de forma tangible como un fallo de signo en una mascara booleana (`text_mask = ~phoneme_mask`) colapsa toda la salida de un modelo generativo, lo que resulta util en cursos de aprendizaje profundo aplicado.
- Integracion con el HuggingFace Hub para publicacion de checkpoints: el parametro `--hf_repo` junto con `--hf_token` permite subir los resultados del entrenamiento a un repositorio propio, encajando en flujos de trabajo reproducibles con control de versiones de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS, SIM, WER, ni metricas objetivas de calidad de sintesis, y el repositorio (0.0 GB) no contiene pesos evaluables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que no se publican pesos ni se documenta un modelo entrenado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; unicamente se conoce que el ejemplo de entrenamiento usa `--batch_size 4`, sin detallar la GPU empleada.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no aplican, porque son servidores de inferencia para modelos de lenguaje, no para pipelines TTS. El despliegue, en su caso, corresponderia al stack de inferencia de StyleTTS2.
- Latencia y throughput: no disponible.
- Dependencias conocidas: el pipeline requiere los componentes preentrenados `style_encoder` y `pitch_extractor` de Kokoro/StyleTTS2, ademas de acceso a red y token para subir resultados al HuggingFace Hub.

## Comparativa con modelos similares

| Proyecto | Categoria | Parametros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| humair025/kikiri-tts-urdu-pipeline-v2_FIXED | Pipeline de entrenamiento TTS | no aplica (sin pesos) | MIT | Codigo en HuggingFace, 0 descargas | Fork correctivo, no desplegable en inferencia |
| StyleTTS2 | Modelo TTS | no disponible | MIT (segun el proyecto upstream) | Repositorio publico de investigacion | Arquitectura en la que se basa este pipeline |
| Kokoro-82M | Modelo TTS | 82 M | Apache-2.0 (segun documentacion publica) | Pesos publicos en HuggingFace | Origen de los componentes preentrenados que reutiliza el pipeline |
| XTTS-v2 (Coqui) | Modelo TTS multilingue | no disponible | Coqui Public Model License (uso no comercial) | Pesos publicos | Alternativa multilingue; licencia mas restrictiva que MIT |

Los datos de terceros deben verificarse en la documentacion oficial de cada proyecto antes de tomar decisiones de produccion.

## Limitaciones y advertencias

- El repositorio no contiene pesos (0.0 GB): no permite inferencia directa ni evaluacion de calidad de sintesis.
- No se debe reanudar el entrenamiento desde checkpoints del repositorio `..._OLD`: su `mel_pred_head.bias` esta ajustado a un mel constante (aproximadamente la media del log-mel) y ralentizaria la recuperacion. El autor recomienda empezar desde el paso 0.
- No hay informacion sobre el corpus de entrenamiento (idioma, horas de audio, licencia de los datos, diversidad de hablantes), lo que impide evaluar sesgos de acento, genero o registro.
- El riesgo de alucinacion en el sentido clasico no aplica a un TTS, pero si existe riesgo de artefactos de sintesis, inestabilidad prosodica y fallos de pronunciacion en fonemas poco representados en los datos.
- Dependencia de componentes preentrenados ajenos: el `style_encoder` y el `pitch_extractor` de Kokoro/StyleTTS2 imponen sus propias condiciones de licencia y su distribucion de entrenamiento; si la normalizacion del mel (media -4, desviacion 4) no se respeta, esos modulos operan fuera de distribucion.
- El repositorio registra 0 descargas y 0 me gusta, por lo que no cuenta con validacion externa de la comunidad ni con replicaciones independientes.
- La model card no documenta metricas, ni comparaciones, ni limitaciones conocidas mas alla de los cinco fallos corregidos.
- La licencia MIT del repositorio cubre el codigo de este fork; no concede por si misma derechos sobre los pesos de terceros que se utilicen para entrenar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/humair025/kikiri-tts-urdu-pipeline-v2_FIXED
- Repositorio del que deriva (con fallos): https://huggingface.co/humair025/kikiri-tts-urdu-pipeline-v2_OLD
- Documento de cambios: https://huggingface.co/humair025/kikiri-tts-urdu-pipeline-v2_FIXED/blob/main/CHANGES.md
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre este modelo. Los resultados devueltos correspondian a hilos de foros de consumo (Sky Community, Kaskus) sin relacion con el repositorio, por lo que se descartan.
